-- Context Graph v1.1 Migration: Provenance, Linkage, Trust
-- Safe to run multiple times (uses IF NOT EXISTS)
-- Run with: psql -U cybos -d cybos -h localhost -p 5433 -f migrations/001-v1.1-provenance.sql

BEGIN;

-- ============================================================================
-- EXTRACTED_ITEMS: Add provenance and linkage fields
-- ============================================================================

-- Source type (call, email, telegram)
ALTER TABLE extracted_items
ADD COLUMN IF NOT EXISTS source_type TEXT
CHECK (source_type IS NULL OR source_type IN ('call', 'email', 'telegram'));

-- Source path (file path to source)
ALTER TABLE extracted_items
ADD COLUMN IF NOT EXISTS source_path TEXT;

-- Source message ID (gmail message id, telegram message id, etc.)
ALTER TABLE extracted_items
ADD COLUMN IF NOT EXISTS source_message_id TEXT;

-- Evidence quote (verbatim snippet from source, 10-50 words)
ALTER TABLE extracted_items
ADD COLUMN IF NOT EXISTS source_quote TEXT;

-- Source span (line range or timestamp, e.g., "245-247" or "15:42")
ALTER TABLE extracted_items
ADD COLUMN IF NOT EXISTS source_span TEXT;

-- Trust level (high, medium, low)
ALTER TABLE extracted_items
ADD COLUMN IF NOT EXISTS trust_level TEXT DEFAULT 'medium'
CHECK (trust_level IS NULL OR trust_level IN ('high', 'medium', 'low'));

-- Target entity (who this item is about/for - resolved slug)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'extracted_items' AND column_name = 'target_entity'
  ) THEN
    ALTER TABLE extracted_items ADD COLUMN target_entity TEXT;
    -- Add foreign key constraint only if column was just created
    ALTER TABLE extracted_items
    ADD CONSTRAINT fk_extracted_items_target_entity
    FOREIGN KEY (target_entity) REFERENCES entities(slug) ON DELETE SET NULL;
  END IF;
END $$;

-- Target name (who this item is about/for - string)
ALTER TABLE extracted_items
ADD COLUMN IF NOT EXISTS target_name TEXT;

-- ============================================================================
-- ENTITIES: Add candidate flag
-- ============================================================================

-- Is candidate (low-confidence entity from unmatched participants)
ALTER TABLE entities
ADD COLUMN IF NOT EXISTS is_candidate BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- FILES: Add content checksum for transcript/body change detection
-- ============================================================================

-- Content checksum (separate from metadata checksum)
ALTER TABLE files
ADD COLUMN IF NOT EXISTS content_checksum VARCHAR(32);

-- ============================================================================
-- INTERACTIONS: Add deal linkage
-- ============================================================================

-- Deal slug (direct link to deal folder)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interactions' AND column_name = 'deal_slug'
  ) THEN
    ALTER TABLE interactions ADD COLUMN deal_slug TEXT;
    -- Add foreign key constraint only if column was just created
    ALTER TABLE interactions
    ADD CONSTRAINT fk_interactions_deal_slug
    FOREIGN KEY (deal_slug) REFERENCES deals(slug) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- INDEXES for new columns
-- ============================================================================

-- extracted_items indexes
CREATE INDEX IF NOT EXISTS idx_extracted_items_source_type
ON extracted_items(source_type) WHERE source_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_extracted_items_trust_level
ON extracted_items(trust_level) WHERE trust_level IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_extracted_items_target_entity
ON extracted_items(target_entity) WHERE target_entity IS NOT NULL;

-- Composite index for actionability queries (trust + provenance)
CREATE INDEX IF NOT EXISTS idx_extracted_items_actionable
ON extracted_items(trust_level, source_path, source_quote)
WHERE trust_level IN ('high', 'medium')
  AND source_path IS NOT NULL
  AND source_quote IS NOT NULL;

-- entities indexes
CREATE INDEX IF NOT EXISTS idx_entities_is_candidate
ON entities(is_candidate) WHERE is_candidate = TRUE;

-- interactions indexes
CREATE INDEX IF NOT EXISTS idx_interactions_deal_slug
ON interactions(deal_slug) WHERE deal_slug IS NOT NULL;

-- ============================================================================
-- COMMENTS for documentation
-- ============================================================================

COMMENT ON COLUMN extracted_items.source_type IS 'Type of source interaction: call, email, or telegram';
COMMENT ON COLUMN extracted_items.source_path IS 'File path to source (e.g., context/calls/2026-01-06_call/)';
COMMENT ON COLUMN extracted_items.source_message_id IS 'Provider-specific ID (gmail message id, telegram message id)';
COMMENT ON COLUMN extracted_items.source_quote IS 'Verbatim evidence quote from source (10-50 words)';
COMMENT ON COLUMN extracted_items.source_span IS 'Line range or timestamp (e.g., "245-247" or "15:42")';
COMMENT ON COLUMN extracted_items.trust_level IS 'Trust level: high (explicit + linkage), medium (clear + provenance), low (uncertain)';
COMMENT ON COLUMN extracted_items.target_entity IS 'Entity slug this item is about/for (resolved)';
COMMENT ON COLUMN extracted_items.target_name IS 'Name of who this item is about/for (string)';

COMMENT ON COLUMN entities.is_candidate IS 'Low-confidence entity from unmatched participants, needs manual review';

COMMENT ON COLUMN files.content_checksum IS 'MD5 of content file (transcript.txt or body.md), separate from metadata checksum';

COMMENT ON COLUMN interactions.deal_slug IS 'Direct link to deal folder (from deal_mention extraction)';

COMMIT;

-- ============================================================================
-- Verification queries (run after migration)
-- ============================================================================

-- Check new columns exist
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name IN ('extracted_items', 'entities', 'files', 'interactions')
--   AND column_name IN ('source_type', 'source_path', 'source_message_id', 'source_quote',
--                       'source_span', 'trust_level', 'target_entity', 'target_name',
--                       'is_candidate', 'content_checksum', 'deal_slug')
-- ORDER BY table_name, column_name;

-- Check indexes exist
-- SELECT indexname FROM pg_indexes
-- WHERE tablename IN ('extracted_items', 'entities', 'interactions')
--   AND indexname LIKE 'idx_%'
-- ORDER BY indexname;
