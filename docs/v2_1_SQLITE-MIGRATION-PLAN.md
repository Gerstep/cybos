# SQLite Context Graph Migration Plan (v2.1)

## Scope and Goals

**Primary Goals:**
- Replace PostgreSQL + pg_trgm/pgvector with SQLite
- **Radically simplify schema** - 70% reduction (11 tables → 5, ~168 cols → ~50)
- Remove Docker requirements - single local file
- Keep file-first approach - source data is markdown on disk

**Schema Simplification:**
- Delete 6 unused tables: `relationships`, `research`, `content`, `sessions`, `files`, `deals`
- Simplify entity resolution: 5-stage → 3-stage
- Remove ~100 unused columns across remaining tables
- Keep JSON arrays for participants (no normalization to join table)

**Non-goals:**
- Vector DB / pgvector replacement (not currently used)
- Changing user-facing commands

---

## Design Decisions (Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Relationships table | **Delete** | 0 queries in codebase |
| Research table | **Delete** | Reports exist as files, never queried |
| Content table | **Delete** | Tweets/essays exist as files |
| Sessions table | **Delete** | Never implemented |
| Files table | **Delete** | Indexer metadata only, not consumer-facing |
| Deals table | **Delete** | Removing for simplicity |
| Extraction types | **Keep all 7** | question/entity_context may get UI later |
| Entity resolution | **3-stage** | email → telegram → fuzzy (remove alias stage) |
| Entity social fields | **Keep** | twitter, linkedin, website for future enrichment |
| Participants storage | **JSON arrays** | Simpler than join table, SQLite JSON1 sufficient |
| Full-text search | **FTS5** | On interactions.summary only |
| Provenance | **Full** | source_quote, source_path, trust_level |
| SQLite driver | **bun:sqlite** | Built-in, no extra dependency |
| DB location | `.cybos/cybos.sqlite` | Alongside other cybos data |

---

## Schema Comparison

### Before (PostgreSQL)

| Table | Columns | Status |
|-------|---------|--------|
| files | 26 | DELETE - indexer only |
| entities | 18 | SIMPLIFY → 14 |
| entity_aliases | 5 | SIMPLIFY → 4 |
| interactions | 16 | SIMPLIFY → 8 |
| extracted_items | 24 | SIMPLIFY → 17 |
| relationships | 11 | DELETE - 0 queries |
| deals | 14 | DELETE - removed |
| research | 13 | DELETE - 0 queries |
| content | 14 | DELETE - 0 queries |
| batch_runs | 13 | SIMPLIFY → 8 |
| sessions | 12 | DELETE - never used |
| **TOTAL** | **~168** | **→ ~51** |

### After (SQLite)

| Table | Columns | Purpose |
|-------|---------|---------|
| entities | 14 | People, companies, products, groups |
| entity_aliases | 4 | Name deduplication |
| interactions | 8 | Calls, emails, telegram |
| extracted_items | 17 | Promises, actions, decisions, metrics |
| batch_runs | 8 | Indexer execution logs |
| **TOTAL** | **51** | **70% reduction** |

---

## SQL Inventory (Current Postgres Usage)

> Reference for migration - which queries need rewriting

### Core Query Patterns to Migrate

**Entity Resolution (`entity-resolver.ts`, `query.ts`):**
```sql
-- find_entity() function - REPLACE WITH TypeScript
SELECT * FROM find_entity($1, $2)

-- Direct lookups - KEEP
SELECT slug, name FROM entities WHERE email = $1
SELECT slug, name FROM entities WHERE telegram = $1
SELECT e.slug, e.name, similarity(e.name, $1) as similarity FROM entities e WHERE e.name % $1
```

**Participant Queries (`query.ts`, extractors):**
```sql
-- JSONB membership - REPLACE WITH json_each()
WHERE participants ? $1
WHERE i.participants ? e.slug

-- Postgres equivalent in SQLite:
WHERE EXISTS (SELECT 1 FROM json_each(participants) WHERE value = ?)
```

**Full-Text Search (`query.ts`):**
```sql
-- REPLACE WITH FTS5
WHERE search_vector @@ plainto_tsquery('english', $1)
ts_headline('english', summary, plainto_tsquery('english', $1))
ts_rank(search_vector, plainto_tsquery('english', $1))

-- SQLite equivalent:
WHERE interactions.id IN (SELECT rowid FROM interactions_fts WHERE interactions_fts MATCH ?)
snippet(interactions_fts, 0, '<b>', '</b>', '...', 32)
bm25(interactions_fts)
```

**Date Intervals (`query.ts`):**
```sql
-- REPLACE datetime() function
WHERE timestamp >= NOW() - INTERVAL '30 days'

-- SQLite equivalent:
WHERE timestamp >= datetime('now', '-30 days')
```

**Other Postgres-isms:**
```sql
-- ILIKE → LIKE COLLATE NOCASE
WHERE name ILIKE '%search%'
-- becomes:
WHERE name LIKE '%search%' COLLATE NOCASE

-- GREATEST → MAX or CASE
SET last_activity = GREATEST(last_activity, $1)
-- becomes:
SET last_activity = MAX(last_activity, ?)

-- COALESCE - same in SQLite
-- ON CONFLICT DO UPDATE - same in SQLite
```

### Queries to DELETE (unused tables)

All queries referencing:
- `deals` table
- `relationships` table
- `research` table
- `content` table
- `sessions` table
- `files` table (except checksum lookups → remove)

---

## SQLite Schema

```sql
-- ============================================
-- CYBOS SQLITE SCHEMA (v2.1)
-- 5 tables, ~51 columns
-- ============================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ============================================
-- ENTITIES
-- People, companies, products, groups
-- ============================================
CREATE TABLE entities (
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
  is_candidate BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_email ON entities(email) WHERE email IS NOT NULL;
CREATE INDEX idx_entities_telegram ON entities(telegram) WHERE telegram IS NOT NULL;
CREATE INDEX idx_entities_last_activity ON entities(last_activity);
CREATE INDEX idx_entities_is_candidate ON entities(is_candidate) WHERE is_candidate = TRUE;
-- Name search via application-level LIKE + Levenshtein (no pg_trgm)

-- ============================================
-- ENTITY ALIASES
-- For deduplication and name matching
-- ============================================
CREATE TABLE entity_aliases (
  id TEXT PRIMARY KEY,
  entity_slug TEXT NOT NULL REFERENCES entities(slug) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  alias_type TEXT DEFAULT 'name' CHECK(alias_type IN ('name','email','telegram','nickname'))
);

CREATE INDEX idx_aliases_entity ON entity_aliases(entity_slug);
CREATE INDEX idx_aliases_alias ON entity_aliases(alias COLLATE NOCASE);

-- ============================================
-- INTERACTIONS
-- Calls, emails, telegram conversations
-- ============================================
CREATE TABLE interactions (
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

CREATE INDEX idx_interactions_type ON interactions(type);
CREATE INDEX idx_interactions_timestamp ON interactions(timestamp);
CREATE INDEX idx_interactions_file_path ON interactions(file_path);

-- ============================================
-- EXTRACTED ITEMS
-- Promises, action items, decisions, metrics, etc.
-- ============================================
CREATE TABLE extracted_items (
  id TEXT PRIMARY KEY,
  interaction_id TEXT NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('promise','action_item','decision','metric','deal_mention','question','entity_context')),
  content TEXT NOT NULL,

  -- Owner (who made/said this)
  owner_entity TEXT REFERENCES entities(slug),
  owner_name TEXT,

  -- Target (who it's for/about)
  target_entity TEXT REFERENCES entities(slug),
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

CREATE INDEX idx_extracted_interaction ON extracted_items(interaction_id);
CREATE INDEX idx_extracted_type ON extracted_items(type);
CREATE INDEX idx_extracted_status ON extracted_items(status) WHERE status = 'pending';
CREATE INDEX idx_extracted_owner ON extracted_items(owner_entity);
CREATE INDEX idx_extracted_target ON extracted_items(target_entity);
CREATE INDEX idx_extracted_trust ON extracted_items(trust_level);

-- ============================================
-- BATCH RUNS
-- Indexer execution logs
-- ============================================
CREATE TABLE batch_runs (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  type TEXT NOT NULL CHECK(type IN ('reindex','extract','sync')),
  status TEXT NOT NULL CHECK(status IN ('running','completed','failed')),
  entities_processed INTEGER DEFAULT 0,
  interactions_processed INTEGER DEFAULT 0,
  error TEXT
);

CREATE INDEX idx_batch_runs_started ON batch_runs(started_at);

-- ============================================
-- FULL-TEXT SEARCH (FTS5)
-- ============================================
CREATE VIRTUAL TABLE interactions_fts USING fts5(
  summary,
  content='interactions',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER interactions_fts_insert AFTER INSERT ON interactions BEGIN
  INSERT INTO interactions_fts(rowid, summary) VALUES (NEW.rowid, NEW.summary);
END;

CREATE TRIGGER interactions_fts_delete AFTER DELETE ON interactions BEGIN
  INSERT INTO interactions_fts(interactions_fts, rowid, summary) VALUES ('delete', OLD.rowid, OLD.summary);
END;

CREATE TRIGGER interactions_fts_update AFTER UPDATE ON interactions BEGIN
  INSERT INTO interactions_fts(interactions_fts, rowid, summary) VALUES ('delete', OLD.rowid, OLD.summary);
  INSERT INTO interactions_fts(rowid, summary) VALUES (NEW.rowid, NEW.summary);
END;

-- ============================================
-- VIEWS (Optional helpers)
-- ============================================
CREATE VIEW pending_items AS
SELECT
  ei.*,
  i.timestamp as interaction_date,
  i.type as interaction_type
FROM extracted_items ei
JOIN interactions i ON i.id = ei.interaction_id
WHERE ei.status = 'pending'
ORDER BY ei.due_date NULLS LAST, i.timestamp DESC;
```

---

## Entity Resolution (Simplified)

### Current (5-stage)
```
1. Check if user identity (configured aliases)
2. Exact email match
3. Exact telegram match
4. Alias exact match
5. Fuzzy name match (pg_trgm similarity > 0.5)
6. Create candidate entity
```

### New (3-stage)
```typescript
async function resolveEntity(name: string, email?: string, telegram?: string): Promise<Entity | null> {
  // Stage 1: Exact email match
  if (email) {
    const entity = await db.get('SELECT * FROM entities WHERE email = ?', email);
    if (entity) return entity;
  }

  // Stage 2: Exact telegram match
  if (telegram) {
    const entity = await db.get('SELECT * FROM entities WHERE telegram = ?', telegram);
    if (entity) return entity;
  }

  // Stage 3: Fuzzy name match (application-level Levenshtein)
  const candidates = await db.all(
    'SELECT * FROM entities WHERE name LIKE ? COLLATE NOCASE LIMIT 50',
    `%${name}%`
  );

  const bestMatch = candidates
    .map(c => ({ ...c, score: levenshteinSimilarity(c.name, name) }))
    .filter(c => c.score > 0.7)
    .sort((a, b) => b.score - a.score)[0];

  if (bestMatch) return bestMatch;

  // No match → caller decides to create candidate or skip
  return null;
}
```

**Removed:**
- Alias lookup stage (rarely improves matching)
- `find_entity()` SQL function (moved to TypeScript)
- `similarity()` / `%` operator (use Levenshtein in TS)

---

## Implementation Phases

### Phase 1: SQLite Infrastructure
**Files to create:**
- `scripts/db/schema-sqlite.sql` - Schema above
- `scripts/db/client-sqlite.ts` - bun:sqlite wrapper

**Client API:**
```typescript
import { Database } from 'bun:sqlite';

const db = new Database('.cybos/cybos.sqlite');
db.run('PRAGMA foreign_keys = ON');
db.run('PRAGMA journal_mode = WAL');

export function query<T>(sql: string, params?: any[]): T[] {
  return db.prepare(sql).all(...(params || [])) as T[];
}

export function queryOne<T>(sql: string, params?: any[]): T | null {
  return db.prepare(sql).get(...(params || [])) as T | null;
}

export function run(sql: string, params?: any[]): void {
  db.prepare(sql).run(...(params || []));
}

export function transaction<T>(fn: () => T): T {
  return db.transaction(fn)();
}
```

**Init script:**
```typescript
import { Database } from 'bun:sqlite';
import { readFileSync } from 'fs';

export async function initDatabase() {
  const db = new Database('.cybos/cybos.sqlite');
  const schema = readFileSync('scripts/db/schema-sqlite.sql', 'utf-8');
  db.exec(schema);
  console.log('SQLite database initialized');
}
```

### Phase 2: Entity Resolution
**Files to modify:**
- `scripts/db/entity-resolver.ts` - Rewrite with 3-stage logic

**Changes:**
- Remove `find_entity()` SQL function calls
- Implement `resolveEntity()` in TypeScript
- Remove alias lookup stage
- Use Levenshtein in TS for fuzzy matching

### Phase 3: Extractors
**Files to modify:**
- `scripts/db/extractors/calls.ts`
- `scripts/db/extractors/emails.ts`
- `scripts/db/extractors/telegram.ts`
- `scripts/db/extractors/entities.ts`
- `scripts/db/extract-llm.ts`

**Changes:**
- Remove all `files` table writes
- Remove all `deal_slug` references
- Remove `from_entity`, `to_entity` (use participants array)
- Replace `$1` params with `?`
- Replace `NOW()` with `datetime('now')`
- Replace JSONB operators with JSON1 functions

**Participant query migration:**
```sql
-- Old (Postgres)
WHERE i.participants ? e.slug

-- New (SQLite)
WHERE EXISTS (SELECT 1 FROM json_each(i.participants) WHERE value = e.slug)
```

### Phase 4: Query Migration
**Files to modify:**
- `scripts/db/query.ts` - Major rewrite

**Key replacements:**

| Postgres | SQLite |
|----------|--------|
| `participants ? $1` | `EXISTS (SELECT 1 FROM json_each(participants) WHERE value = ?)` |
| `search_vector @@ plainto_tsquery()` | `id IN (SELECT rowid FROM interactions_fts WHERE interactions_fts MATCH ?)` |
| `ts_headline()` | `snippet(interactions_fts, ...)` |
| `ts_rank()` | `bm25(interactions_fts)` |
| `similarity(name, $1)` | Levenshtein in TypeScript |
| `ILIKE` | `LIKE ... COLLATE NOCASE` |
| `NOW() - INTERVAL 'N days'` | `datetime('now', '-N days')` |
| `GREATEST(a, b)` | `MAX(a, b)` |

**Queries to DELETE:**
- All `deals` queries
- All `relationships` queries
- All `research` queries
- All `content` queries
- All `sessions` queries
- All `files` queries

### Phase 5: Explorer & CLI
**Files to modify:**
- Explorer API endpoints - Remove deal dashboard
- CLI status command - Update table counts

### Phase 6: Cleanup
**Files to delete:**
- `scripts/db/schema.sql` (Postgres)
- `scripts/db/client.ts` (Postgres)
- `scripts/db/init.ts` (Postgres)
- `scripts/db/extractors/deals.ts`
- `scripts/db/migrations/*` (all Postgres migrations)
- `docker-compose.yml` (if exists)

**Docs to update:**
- `CLAUDE.md` - Remove deal commands, update DB section
- `docs/ARCHITECTURE.md` - Update to SQLite
- `README.md` - Remove Docker/Postgres setup

---

## Migration Strategy

### Recommended: Full Reindex

1. Create new SQLite schema
2. Run full reindex from source files (calls, emails, telegram)
3. Re-run LLM extraction on all interactions
4. Verify counts match expectations
5. Delete old Postgres data

**Pros:** Clean slate, no data migration bugs, ensures schema consistency
**Cons:** Re-extraction costs (~$5-10 for full corpus)

### Alternative: Data Migration

Only if extraction cost is prohibitive:
1. Export Postgres data to JSON
2. Transform to new schema (drop unused columns)
3. Import to SQLite

**Cons:** Complex transforms, risk of bugs, keeps legacy data issues

---

## Verification Checklist

After migration, verify:

- [ ] `cyber-reindex` completes without errors
- [ ] `cyber-reindex --status` shows correct counts
- [ ] `cyber-brief` generates with entity context
- [ ] `cyber-telegram` resolves entities correctly
- [ ] Explorer dashboard loads (minus deals)
- [ ] Entity search returns fuzzy matches
- [ ] Pending items query returns promises/action_items
- [ ] FTS search finds interactions by keyword
- [ ] Interaction counts update correctly
- [ ] Candidate entities created for unmatched participants

**Count comparison (before/after):**
```bash
# Before (Postgres)
psql -c "SELECT COUNT(*) FROM entities"
psql -c "SELECT COUNT(*) FROM interactions"
psql -c "SELECT COUNT(*) FROM extracted_items"

# After (SQLite)
sqlite3 .cybos/cybos.sqlite "SELECT COUNT(*) FROM entities"
sqlite3 .cybos/cybos.sqlite "SELECT COUNT(*) FROM interactions"
sqlite3 .cybos/cybos.sqlite "SELECT COUNT(*) FROM extracted_items"
```

---

## Risk Mitigation

1. **Backup Postgres before starting** - Can revert if needed
2. **Keep extraction prompts unchanged** - Don't modify what LLM extracts
3. **Test entity resolution on known cases** - Verify dedup still works
4. **Compare counts before/after** - Entities, interactions, extracted items
5. **FTS5 relevance tuning** - May need to adjust bm25() weights

---

## Files Changed Summary

| Category | Files |
|----------|-------|
| **Create** | `schema-sqlite.sql`, `client-sqlite.ts` |
| **Major rewrite** | `query.ts`, `entity-resolver.ts`, `init.ts` |
| **Moderate changes** | `calls.ts`, `emails.ts`, `telegram.ts`, `entities.ts`, `extract-llm.ts` |
| **Delete** | `schema.sql`, `client.ts`, `deals.ts`, `migrations/*` |
| **Docs** | `CLAUDE.md`, `ARCHITECTURE.md`, `README.md` |

---

## Day-by-Day Implementation

**Day 1:**
- Create SQLite schema (`schema-sqlite.sql`)
- Create SQLite client wrapper (`client-sqlite.ts`)
- Create init script
- Verify basic CRUD works

**Day 2:**
- Rewrite entity resolver (3-stage)
- Implement Levenshtein fuzzy matching in TS
- Update extractors to use new client
- Remove files/deals table writes

**Day 3:**
- Migrate query.ts (biggest file)
- Replace JSONB participant queries
- Replace FTS queries
- Remove unused query functions

**Day 4:**
- Update Explorer API
- Update CLI commands
- Delete old Postgres files
- Update documentation

**Day 5:**
- Full reindex test
- LLM extraction test
- End-to-end verification
- Performance comparison
