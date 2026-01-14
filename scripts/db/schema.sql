-- Context Graph Schema
-- PostgreSQL 16 with pgvector and pg_trgm
-- Run with: psql -U cybos -d cybos -f schema.sql

-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- FILE REGISTRY (for sync tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS files (
  path TEXT PRIMARY KEY,
  type TEXT NOT NULL,                    -- call, email, telegram, entity, deal
  checksum VARCHAR(32),                  -- MD5 hash for change detection (metadata)
  content_checksum VARCHAR(32),          -- MD5 hash of content file (transcript/body)
  indexed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_modified TIMESTAMPTZ,
  needs_extraction BOOLEAN DEFAULT FALSE,
  extraction_done BOOLEAN DEFAULT FALSE,
  extraction_date TIMESTAMPTZ,
  extraction_items INTEGER DEFAULT 0,
  extraction_entities INTEGER DEFAULT 0,
  extraction_error TEXT,                 -- Store error message if extraction failed
  extraction_attempts INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
CREATE INDEX IF NOT EXISTS idx_files_needs_extraction ON files(needs_extraction) WHERE needs_extraction = TRUE;

-- ============================================================================
-- ENTITIES (people, companies, products)
-- ============================================================================

CREATE TABLE IF NOT EXISTS entities (
  slug TEXT PRIMARY KEY,                 -- kebab-case identifier
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('person', 'company', 'product', 'group')),

  -- Contact info (person/company)
  email TEXT,
  telegram TEXT,
  twitter TEXT,
  linkedin TEXT,

  -- Person-specific
  current_company TEXT,                  -- Where they work now
  job_title TEXT,                        -- Their role (renamed from current_role - reserved keyword)
  current_focus TEXT,                    -- What they're building/working on
  current_focus_updated TIMESTAMPTZ,

  -- Company-specific
  website TEXT,
  sector TEXT,

  -- Product-specific
  parent_company TEXT,                   -- References entities(slug) but nullable

  -- Tracking
  file_path TEXT,                        -- Optional manual entity file
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ,
  interaction_count INTEGER DEFAULT 0,
  confidence REAL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  source TEXT CHECK (source IN ('manual', 'extracted', 'merged')),

  -- v1.1: Candidate entity flag
  is_candidate BOOLEAN DEFAULT FALSE,    -- Low-confidence entity from unmatched participants

  data JSONB,
  search_vector TSVECTOR
);

-- Entity search indexes
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_email ON entities(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entities_telegram ON entities(telegram) WHERE telegram IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entities_last_activity ON entities(last_activity DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_entities_name_trgm ON entities USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_entities_search ON entities USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_entities_is_candidate ON entities(is_candidate) WHERE is_candidate = TRUE;

-- Entity search vector trigger
CREATE OR REPLACE FUNCTION update_entity_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.current_company, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.job_title, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.current_focus, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.sector, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS entity_search_update ON entities;
CREATE TRIGGER entity_search_update
  BEFORE INSERT OR UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_entity_search_vector();

-- ============================================================================
-- ENTITY ALIASES (for deduplication matching)
-- ============================================================================

CREATE TABLE IF NOT EXISTS entity_aliases (
  id TEXT PRIMARY KEY,
  entity_slug TEXT NOT NULL REFERENCES entities(slug) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  alias_type TEXT NOT NULL CHECK (alias_type IN ('name', 'email', 'telegram', 'nickname')),
  confidence REAL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aliases_alias ON entity_aliases(LOWER(alias));
CREATE INDEX IF NOT EXISTS idx_aliases_entity ON entity_aliases(entity_slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_aliases_unique ON entity_aliases(LOWER(alias), alias_type);

-- ============================================================================
-- INTERACTIONS (calls, emails, telegram messages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'telegram')),
  channel TEXT,                          -- Which telegram chat, email thread, etc.

  date DATE NOT NULL,
  timestamp TIMESTAMPTZ,
  duration_min INTEGER,                  -- For calls

  -- Primary participants (for simple queries)
  from_entity TEXT REFERENCES entities(slug) ON DELETE SET NULL,
  from_name TEXT,
  to_entity TEXT REFERENCES entities(slug) ON DELETE SET NULL,
  to_name TEXT,

  -- All participants (for complex queries)
  participants JSONB,                    -- ["slug1", "slug2"]
  participant_names JSONB,               -- ["Name 1", "Name 2"]

  file_path TEXT NOT NULL,

  summary TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  follow_up_needed BOOLEAN DEFAULT FALSE,
  has_extraction BOOLEAN DEFAULT FALSE,

  -- v1.1: Deal linkage
  deal_slug TEXT REFERENCES deals(slug) ON DELETE SET NULL,

  data JSONB,
  search_vector TSVECTOR
);

-- Interaction indexes
CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);
CREATE INDEX IF NOT EXISTS idx_interactions_from ON interactions(from_entity);
CREATE INDEX IF NOT EXISTS idx_interactions_to ON interactions(to_entity);
CREATE INDEX IF NOT EXISTS idx_interactions_participants ON interactions USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_interactions_search ON interactions USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_interactions_deal_slug ON interactions(deal_slug) WHERE deal_slug IS NOT NULL;

-- Interaction search vector trigger
CREATE OR REPLACE FUNCTION update_interaction_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.to_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.data->>'subject', '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.data->>'notes', '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS interaction_search_update ON interactions;
CREATE TRIGGER interaction_search_update
  BEFORE INSERT OR UPDATE ON interactions
  FOR EACH ROW EXECUTE FUNCTION update_interaction_search_vector();

-- ============================================================================
-- EXTRACTED ITEMS (promises, action items, decisions, metrics, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS extracted_items (
  id TEXT PRIMARY KEY,
  interaction_id TEXT NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN (
    'promise',         -- Commitment to do something
    'action_item',     -- Task needing completion
    'decision',        -- Conclusion reached
    'question',        -- Open question needing follow-up
    'metric',          -- Numbers (revenue, headcount, funding)
    'deal_mention',    -- Who mentioned which deal
    'entity_context'   -- What entity is building/working on
  )),

  -- Who is this about/for
  owner_entity TEXT REFERENCES entities(slug) ON DELETE SET NULL,
  owner_name TEXT,
  target_entity TEXT REFERENCES entities(slug) ON DELETE SET NULL,
  target_name TEXT,

  content TEXT NOT NULL,
  context TEXT,                          -- Additional context from extraction

  -- v1.1: Provenance fields
  source_type TEXT CHECK (source_type IS NULL OR source_type IN ('call', 'email', 'telegram')),
  source_path TEXT,                      -- File path to source
  source_message_id TEXT,                -- Provider-specific ID (gmail message id, telegram message id)
  source_quote TEXT,                     -- Verbatim evidence quote (10-50 words)
  source_span TEXT,                      -- Line range or timestamp (e.g., "245-247" or "15:42")
  trust_level TEXT DEFAULT 'medium' CHECK (trust_level IS NULL OR trust_level IN ('high', 'medium', 'low')),

  -- For action items / promises
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,

  -- For deal_mention
  deal_slug TEXT,                        -- Which deal was mentioned

  -- Extraction metadata
  confidence REAL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extracted items indexes
CREATE INDEX IF NOT EXISTS idx_extracted_type ON extracted_items(type);
CREATE INDEX IF NOT EXISTS idx_extracted_owner ON extracted_items(owner_entity);
CREATE INDEX IF NOT EXISTS idx_extracted_target ON extracted_items(target_entity);
CREATE INDEX IF NOT EXISTS idx_extracted_status ON extracted_items(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_extracted_interaction ON extracted_items(interaction_id);
CREATE INDEX IF NOT EXISTS idx_extracted_deal ON extracted_items(deal_slug) WHERE deal_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_extracted_content ON extracted_items USING GIN(to_tsvector('english', content));

-- v1.1: Provenance indexes
CREATE INDEX IF NOT EXISTS idx_extracted_items_source_type ON extracted_items(source_type) WHERE source_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_extracted_items_trust_level ON extracted_items(trust_level) WHERE trust_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_extracted_items_target_entity ON extracted_items(target_entity) WHERE target_entity IS NOT NULL;

-- Composite index for actionability queries (trust + provenance)
CREATE INDEX IF NOT EXISTS idx_extracted_items_actionable ON extracted_items(trust_level, source_path, source_quote)
WHERE trust_level IN ('high', 'medium') AND source_path IS NOT NULL AND source_quote IS NOT NULL;

-- ============================================================================
-- RELATIONSHIPS (entity to entity connections)
-- ============================================================================

CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  from_entity TEXT NOT NULL REFERENCES entities(slug) ON DELETE CASCADE,
  from_name TEXT,
  to_entity TEXT NOT NULL REFERENCES entities(slug) ON DELETE CASCADE,
  to_name TEXT,

  type TEXT NOT NULL CHECK (type IN (
    'works_at',        -- Person works at company
    'founded',         -- Person founded company
    'invested_in',     -- Entity invested in company
    'introduced_by',   -- Entity introduced by other entity
    'colleague',       -- Person is colleague of person
    'knows',           -- Generic relationship
    'created'          -- Person/company created product
  )),

  since TIMESTAMPTZ,
  until TIMESTAMPTZ,

  source_type TEXT,                      -- call, email, telegram, manual
  source_path TEXT,
  confidence REAL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),

  data JSONB
);

-- Relationship indexes
CREATE INDEX IF NOT EXISTS idx_relationships_from ON relationships(from_entity);
CREATE INDEX IF NOT EXISTS idx_relationships_to ON relationships(to_entity);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON relationships(type);

-- ============================================================================
-- DEALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS deals (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,

  status TEXT CHECK (status IN ('active', 'passed', 'invested', 'exited', 'dead')),
  stage TEXT,                            -- pre-seed, seed, series-a, etc.

  raising TEXT,                          -- Amount raising
  valuation TEXT,                        -- Valuation
  sector TEXT,
  thesis_fit TEXT,                       -- How it fits fund thesis

  lead_partner TEXT,
  primary_contact TEXT REFERENCES entities(slug) ON DELETE SET NULL,
  introduced_by TEXT REFERENCES entities(slug) ON DELETE SET NULL,

  first_contact TIMESTAMPTZ,
  last_activity TIMESTAMPTZ,

  folder_path TEXT,

  research_count INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,

  data JSONB
);

-- Deal indexes
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_primary_contact ON deals(primary_contact);
CREATE INDEX IF NOT EXISTS idx_deals_introduced_by ON deals(introduced_by);
CREATE INDEX IF NOT EXISTS idx_deals_last_activity ON deals(last_activity DESC NULLS LAST);

-- ============================================================================
-- RESEARCH REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS research (
  id TEXT PRIMARY KEY,

  type TEXT NOT NULL CHECK (type IN ('company', 'market', 'technology', 'topic')),
  intensity TEXT CHECK (intensity IN ('quick', 'standard', 'deep')),

  subject_entity TEXT REFERENCES entities(slug) ON DELETE SET NULL,
  subject_name TEXT,
  subject_type TEXT,

  file_path TEXT NOT NULL,
  folder_path TEXT,

  summary TEXT,
  key_findings JSONB,                    -- Array of key findings
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  agents_used JSONB,                     -- Array of agent names

  data JSONB,
  search_vector TSVECTOR
);

-- Research indexes
CREATE INDEX IF NOT EXISTS idx_research_subject ON research(subject_entity);
CREATE INDEX IF NOT EXISTS idx_research_type ON research(type);
CREATE INDEX IF NOT EXISTS idx_research_created ON research(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_search ON research USING GIN(search_vector);

-- Research search vector trigger
CREATE OR REPLACE FUNCTION update_research_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.subject_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS research_search_update ON research;
CREATE TRIGGER research_search_update
  BEFORE INSERT OR UPDATE ON research
  FOR EACH ROW EXECUTE FUNCTION update_research_search_vector();

-- ============================================================================
-- CONTENT (posts, essays, tweets)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content (
  id TEXT PRIMARY KEY,

  type TEXT NOT NULL CHECK (type IN ('tweet', 'thread', 'essay', 'telegram_post', 'image')),
  subtype TEXT,                          -- long_form, short, etc.

  title TEXT,
  language TEXT CHECK (language IN ('en', 'ru')),

  file_path TEXT NOT NULL,
  image_path TEXT,

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  platform TEXT,                         -- twitter, linkedin, telegram

  summary TEXT,
  word_count INTEGER,

  related_entities JSONB,                -- Array of entity slugs
  source_research TEXT REFERENCES research(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  data JSONB,
  search_vector TSVECTOR
);

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_created ON content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_search ON content USING GIN(search_vector);

-- Content search vector trigger
CREATE OR REPLACE FUNCTION update_content_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS content_search_update ON content;
CREATE TRIGGER content_search_update
  BEFORE INSERT OR UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_content_search_vector();

-- ============================================================================
-- BATCH RUNS (indexer execution logs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS batch_runs (
  id TEXT PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  type TEXT NOT NULL CHECK (type IN ('full', 'incremental', 'extraction')),
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),

  -- Counts
  files_processed INTEGER DEFAULT 0,
  entities_created INTEGER DEFAULT 0,
  entities_updated INTEGER DEFAULT 0,
  interactions_created INTEGER DEFAULT 0,
  items_extracted INTEGER DEFAULT 0,

  -- Costs
  extraction_cost_usd REAL DEFAULT 0,
  tokens_used BIGINT DEFAULT 0,

  error TEXT,
  data JSONB
);

CREATE INDEX IF NOT EXISTS idx_batch_runs_started ON batch_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_runs_type ON batch_runs(type);

-- ============================================================================
-- SESSIONS (Claude Code sessions - optional)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,

  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  git_branch TEXT,
  cwd TEXT,
  version TEXT,

  message_count INTEGER,
  input_tokens BIGINT,
  output_tokens BIGINT,

  user_messages JSONB,
  tools_used JSONB,
  files_touched JSONB,
  models_used JSONB,

  transcript_path TEXT,
  transcript_hash VARCHAR(32),

  summary TEXT,

  search_vector TSVECTOR
);

CREATE INDEX IF NOT EXISTS idx_sessions_ended ON sessions(ended_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_search ON sessions USING GIN(search_vector);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Find entity by identifier (email, telegram, or fuzzy name)
CREATE OR REPLACE FUNCTION find_entity(identifier TEXT, entity_type TEXT DEFAULT NULL)
RETURNS TABLE (
  slug TEXT,
  name TEXT,
  match_type TEXT,
  confidence REAL
) AS $$
BEGIN
  -- Try exact email match
  RETURN QUERY
  SELECT e.slug, e.name, 'email'::TEXT, 1.0::REAL
  FROM entities e
  WHERE e.email = identifier
    AND (entity_type IS NULL OR e.type = entity_type)
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- Try telegram match (with or without @)
  RETURN QUERY
  SELECT e.slug, e.name, 'telegram'::TEXT, 1.0::REAL
  FROM entities e
  WHERE e.telegram = LTRIM(identifier, '@')
    AND (entity_type IS NULL OR e.type = entity_type)
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- Try alias match
  RETURN QUERY
  SELECT e.slug, e.name, 'alias'::TEXT, a.confidence
  FROM entity_aliases a
  JOIN entities e ON e.slug = a.entity_slug
  WHERE LOWER(a.alias) = LOWER(identifier)
    AND (entity_type IS NULL OR e.type = entity_type)
  ORDER BY a.confidence DESC
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- Try fuzzy name match
  RETURN QUERY
  SELECT e.slug, e.name, 'fuzzy'::TEXT, similarity(e.name, identifier)::REAL
  FROM entities e
  WHERE e.name % identifier
    AND (entity_type IS NULL OR e.type = entity_type)
  ORDER BY similarity(e.name, identifier) DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS (for common queries)
-- ============================================================================

-- Pending items view
CREATE OR REPLACE VIEW pending_items AS
SELECT
  ei.*,
  i.date AS interaction_date,
  i.type AS interaction_type,
  i.summary AS interaction_summary
FROM extracted_items ei
JOIN interactions i ON i.id = ei.interaction_id
WHERE ei.status = 'pending'
  AND ei.type IN ('promise', 'action_item')
ORDER BY ei.due_date NULLS LAST, i.date DESC;

-- Entity context view (for quick entity lookups)
CREATE OR REPLACE VIEW entity_context AS
SELECT
  e.*,
  (SELECT COUNT(*) FROM interactions i WHERE i.participants ? e.slug) AS total_interactions,
  (SELECT COUNT(*) FROM extracted_items ei WHERE ei.owner_entity = e.slug AND ei.status = 'pending') AS pending_items
FROM entities e;

-- ============================================================================
-- DONE
-- ============================================================================

-- Grant permissions (for future multi-user support)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cybos;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cybos;
