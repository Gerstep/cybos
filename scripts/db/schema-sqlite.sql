-- ============================================
-- CYBOS SQLITE SCHEMA (v2.1)
-- 5 tables, ~51 columns
-- Migrated from PostgreSQL to SQLite
-- ============================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ============================================
-- ENTITIES
-- People, companies, products, groups
-- ============================================
CREATE TABLE IF NOT EXISTS entities (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('person','company','product','group')),

  -- Contact
  email TEXT,
  telegram TEXT,
  twitter TEXT,
  linkedin TEXT,
  website TEXT,

  -- Context (for persons)
  current_company TEXT,
  job_title TEXT,
  current_focus TEXT,

  -- Activity
  last_activity TEXT, -- ISO-8601 timestamp
  interaction_count INTEGER DEFAULT 0,
  is_candidate INTEGER DEFAULT 0 -- SQLite uses 0/1 for boolean
);

CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_email ON entities(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entities_telegram ON entities(telegram) WHERE telegram IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entities_last_activity ON entities(last_activity);
CREATE INDEX IF NOT EXISTS idx_entities_is_candidate ON entities(is_candidate) WHERE is_candidate = 1;
-- Name search via application-level LIKE + Levenshtein (no pg_trgm)

-- ============================================
-- ENTITY ALIASES
-- For deduplication and name matching
-- ============================================
CREATE TABLE IF NOT EXISTS entity_aliases (
  id TEXT PRIMARY KEY,
  entity_slug TEXT NOT NULL REFERENCES entities(slug) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  alias_type TEXT DEFAULT 'name' CHECK(alias_type IN ('name','email','telegram','nickname'))
);

CREATE INDEX IF NOT EXISTS idx_aliases_entity ON entity_aliases(entity_slug);
CREATE INDEX IF NOT EXISTS idx_aliases_alias ON entity_aliases(alias COLLATE NOCASE);

-- ============================================
-- INTERACTIONS
-- Calls, emails, telegram conversations
-- ============================================
CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('call','email','telegram')),
  timestamp TEXT NOT NULL, -- ISO-8601

  -- Participants (JSON arrays)
  participants TEXT, -- ["slug1", "slug2"]
  participant_names TEXT, -- ["Name 1", "Name 2"]

  -- Content
  summary TEXT,
  file_path TEXT,

  -- Metadata
  indexed_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);
CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_interactions_file_path ON interactions(file_path);

-- ============================================
-- EXTRACTED ITEMS
-- Promises, action items, decisions, metrics, etc.
-- ============================================
CREATE TABLE IF NOT EXISTS extracted_items (
  id TEXT PRIMARY KEY,
  interaction_id TEXT NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('promise','action_item','decision','metric','deal_mention','question','entity_context')),
  content TEXT NOT NULL,

  -- Owner (who made/said this)
  owner_entity TEXT REFERENCES entities(slug) ON DELETE SET NULL,
  owner_name TEXT,

  -- Target (who it's for/about)
  target_entity TEXT REFERENCES entities(slug) ON DELETE SET NULL,
  target_name TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','completed','cancelled')),
  due_date TEXT, -- ISO-8601
  completed_at TEXT,

  -- Confidence & provenance
  confidence REAL DEFAULT 0.8,
  trust_level TEXT DEFAULT 'medium' CHECK(trust_level IN ('high','medium','low')),
  source_quote TEXT,
  source_path TEXT,

  -- Metadata
  extracted_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_extracted_interaction ON extracted_items(interaction_id);
CREATE INDEX IF NOT EXISTS idx_extracted_type ON extracted_items(type);
CREATE INDEX IF NOT EXISTS idx_extracted_status ON extracted_items(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_extracted_owner ON extracted_items(owner_entity);
CREATE INDEX IF NOT EXISTS idx_extracted_target ON extracted_items(target_entity);
CREATE INDEX IF NOT EXISTS idx_extracted_trust ON extracted_items(trust_level);

-- ============================================
-- BATCH RUNS
-- Indexer execution logs
-- ============================================
CREATE TABLE IF NOT EXISTS batch_runs (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  type TEXT NOT NULL CHECK(type IN ('reindex','extract','sync')),
  status TEXT NOT NULL CHECK(status IN ('running','completed','failed')),
  entities_processed INTEGER DEFAULT 0,
  interactions_processed INTEGER DEFAULT 0,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_batch_runs_started ON batch_runs(started_at);

-- ============================================
-- FULL-TEXT SEARCH (FTS5)
-- ============================================
CREATE VIRTUAL TABLE IF NOT EXISTS interactions_fts USING fts5(
  summary,
  content='interactions',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS interactions_fts_insert AFTER INSERT ON interactions BEGIN
  INSERT INTO interactions_fts(rowid, summary) VALUES (NEW.rowid, NEW.summary);
END;

CREATE TRIGGER IF NOT EXISTS interactions_fts_delete AFTER DELETE ON interactions BEGIN
  INSERT INTO interactions_fts(interactions_fts, rowid, summary) VALUES ('delete', OLD.rowid, OLD.summary);
END;

CREATE TRIGGER IF NOT EXISTS interactions_fts_update AFTER UPDATE ON interactions BEGIN
  INSERT INTO interactions_fts(interactions_fts, rowid, summary) VALUES ('delete', OLD.rowid, OLD.summary);
  INSERT INTO interactions_fts(rowid, summary) VALUES (NEW.rowid, NEW.summary);
END;

-- ============================================
-- VIEWS (Optional helpers)
-- ============================================
CREATE VIEW IF NOT EXISTS pending_items AS
SELECT
  ei.*,
  i.timestamp as interaction_date,
  i.type as interaction_type
FROM extracted_items ei
JOIN interactions i ON i.id = ei.interaction_id
WHERE ei.status = 'pending'
ORDER BY ei.due_date NULLS LAST, i.timestamp DESC;
