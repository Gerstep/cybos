# Database Indexer Plan

*Architectural plan for context graph / database indexing system*

**Created:** 2026-01-08
**Status:** Planning

---

## Overview

### Problem Statement

Current Cybos stores all data as markdown files. This works but has scaling issues:
- **Search:** Requires grepping through files or loading into context
- **Discovery:** Manual file exploration
- **Context optimization:** Must load entire files (500+ lines for calls) to answer specific queries
- **Relationships:** Entity index is flat, no relationship traversal

### Solution

Hybrid architecture:
- **Files remain source of truth** (git-friendly, human-readable, portable)
- **SQLite indexes metadata + extracted items** (fast queries, relationship traversal)
- **LLM extraction at import time** (promises, decisions, action items extracted once)
- **Query returns pointers** (Claude loads only needed files)

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| Zero external deps | SQLite built into Bun (`bun:sqlite`) |
| 5-min setup | Clone, `bun install`, `bun run db:init`, done |
| Files stay portable | Git-friendly, human-readable, shareable |
| Index is disposable | Delete `index.db`, rerun indexer, same result |
| Scales to 10K+ files | SQLite handles millions of rows trivially |
| Context optimized | Query returns paths, load only what's needed |
| Team-scalable | Swap SQLite for PostgreSQL when needed |

---

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     SOURCE FILES                            │
│                                                             │
│  /context/calls/*/                                          │
│    ├── transcript.txt    ← Raw (rarely loaded)              │
│    ├── notes.md          ← Granola summary                  │
│    └── extracted.json    ← Structured items (NEW)           │
│                                                             │
│  /context/telegram/*.md  ← Conversation logs                │
│  /context/emails/*/      ← Email folders                    │
│  /context/entities/      ← Entity files                     │
│  /deals/*/               ← Deal folders                     │
│  /research/*/            ← Research reports                 │
│  /content/*/             ← Generated content                │
│  GTD.md                  ← Tasks                            │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                │ Indexer parses files
                                │ Extracts structured data
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     INDEX (SQLite)                          │
│                     context/index.db                        │
│                                                             │
│  entities          - people, companies, topics              │
│  interactions      - calls, emails, telegram messages       │
│  extracted_items   - action items, promises, decisions      │
│  relationships     - entity-to-entity connections           │
│  deals             - deal status and metadata               │
│  research          - research reports                       │
│  content           - posts, essays, tweets                  │
│  files             - file registry for sync                 │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                │ Claude queries via script
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     QUERY RESULT                            │
│                                                             │
│  "What did I promise to Acme?"                              │
│                                                             │
│  → [                                                        │
│      { call: "0107-acme", what: "Intro to Sarah" },         │
│      { call: "1215-acme", what: "Review term sheet" }       │
│    ]                                                        │
│                                                             │
│  No files loaded. Answer is in the index.                   │
│  Only if Claude needs more context → load specific file     │
└─────────────────────────────────────────────────────────────┘
```

### Progressive Detail Levels

| Level | What's Loaded | When Used |
|-------|---------------|-----------|
| **0** | Metadata only (exists, date, participants) | Listing calls |
| **1** | Summary (2-3 sentences) | Quick context |
| **2** | Extracted items (decisions, promises, action items) | Specific queries |
| **3** | Full file content | Deep dive, exact quotes |

Most queries stop at Level 2. Full file content only when really needed.

---

## Database Schema

### Core Tables

```sql
-- ============================================================
-- FILE REGISTRY (tracks all indexed files for sync)
-- ============================================================

CREATE TABLE files (
  path TEXT PRIMARY KEY,
  type TEXT NOT NULL,           -- call, email, telegram, deal, research, content, entity
  checksum TEXT,                -- SHA256 for change detection
  indexed_at TEXT NOT NULL,
  last_modified TEXT,
  needs_extraction INTEGER DEFAULT 0  -- flag for LLM extraction queue
);

-- ============================================================
-- ENTITIES (people, companies, topics)
-- ============================================================

CREATE TABLE entities (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,           -- person, company, topic

  -- Contact info (denormalized for quick access)
  email TEXT,
  telegram TEXT,                -- username without @

  -- File reference
  file_path TEXT,               -- /context/entities/... if exists

  -- Computed/cached fields
  summary TEXT,                 -- AI-generated one-liner
  first_seen TEXT,
  last_activity TEXT,
  interaction_count INTEGER DEFAULT 0,

  -- Flexible storage
  data TEXT                     -- JSON for additional metadata
);

-- Entity aliases for resolution
CREATE TABLE entity_aliases (
  alias TEXT PRIMARY KEY,
  entity_slug TEXT NOT NULL,
  FOREIGN KEY (entity_slug) REFERENCES entities(slug)
);

-- ============================================================
-- INTERACTIONS (calls, emails, telegram)
-- ============================================================

CREATE TABLE interactions (
  id TEXT PRIMARY KEY,          -- e.g., "call-0107-acme-26"
  type TEXT NOT NULL,           -- call, email, telegram_message
  channel TEXT NOT NULL,        -- granola, gmail, telegram

  -- Timing
  date TEXT NOT NULL,           -- ISO date
  timestamp TEXT,               -- ISO datetime if available
  duration_min INTEGER,         -- for calls

  -- Participants (denormalized for common queries)
  from_entity TEXT,             -- primary sender/initiator
  from_name TEXT,               -- denormalized
  to_entity TEXT,               -- primary recipient
  to_name TEXT,                 -- denormalized
  participants TEXT,            -- JSON array for multi-party: ["slug1", "slug2"]
  participant_names TEXT,       -- JSON array: ["John Smith", "Jane Doe"]

  -- Content reference
  file_path TEXT NOT NULL,

  -- Extracted/computed
  summary TEXT,
  sentiment TEXT,               -- positive, neutral, negative
  follow_up_needed INTEGER DEFAULT 0,
  has_extraction INTEGER DEFAULT 0,  -- whether extracted_items exist

  -- Flexible
  data TEXT,                    -- JSON: subject (email), message_count (telegram), etc.

  FOREIGN KEY (from_entity) REFERENCES entities(slug),
  FOREIGN KEY (to_entity) REFERENCES entities(slug)
);

-- ============================================================
-- EXTRACTED ITEMS (from interactions)
-- ============================================================

CREATE TABLE extracted_items (
  id TEXT PRIMARY KEY,
  interaction_id TEXT NOT NULL,

  type TEXT NOT NULL,           -- action_item, promise, decision, question, topic

  -- Who/what (denormalized)
  owner_entity TEXT,            -- who needs to do it
  owner_name TEXT,
  target_entity TEXT,           -- who it's for/about
  target_name TEXT,

  -- Content
  content TEXT NOT NULL,        -- the actual item text
  context TEXT,                 -- surrounding context if helpful

  -- Status tracking
  due_date TEXT,
  status TEXT DEFAULT 'pending', -- pending, done, cancelled
  completed_at TEXT,

  -- Metadata
  confidence REAL DEFAULT 1.0,  -- extraction confidence
  created_at TEXT NOT NULL,

  FOREIGN KEY (interaction_id) REFERENCES interactions(id),
  FOREIGN KEY (owner_entity) REFERENCES entities(slug),
  FOREIGN KEY (target_entity) REFERENCES entities(slug)
);

-- ============================================================
-- RELATIONSHIPS (entity to entity)
-- ============================================================

CREATE TABLE relationships (
  id TEXT PRIMARY KEY,
  from_entity TEXT NOT NULL,
  from_name TEXT,               -- denormalized
  to_entity TEXT NOT NULL,
  to_name TEXT,                 -- denormalized

  type TEXT NOT NULL,           -- works_at, introduced_by, invested_in, knows, researched

  -- Temporal
  since TEXT,
  until TEXT,                   -- NULL = still active

  -- Provenance
  source_type TEXT,             -- call, manual, inferred
  source_path TEXT,             -- file where we learned this
  confidence REAL DEFAULT 1.0,

  -- Flexible
  data TEXT,                    -- JSON: role (for works_at), etc.

  FOREIGN KEY (from_entity) REFERENCES entities(slug),
  FOREIGN KEY (to_entity) REFERENCES entities(slug)
);

-- ============================================================
-- DEALS
-- ============================================================

CREATE TABLE deals (
  slug TEXT PRIMARY KEY,        -- company slug
  name TEXT NOT NULL,

  -- Status
  status TEXT,                  -- sourced, researching, dd, ic, passed, invested
  stage TEXT,                   -- pre-seed, seed, series-a

  -- Details
  raising TEXT,                 -- "$3M"
  valuation TEXT,               -- "$15M pre"
  sector TEXT,                  -- "AI Infra", "Robotics"
  thesis_fit TEXT,              -- notes on fit

  -- People
  lead_partner TEXT,            -- our partner leading
  primary_contact TEXT,         -- their main contact (entity slug)

  -- Dates
  first_contact TEXT,
  last_activity TEXT,

  -- Files
  folder_path TEXT,             -- /deals/company-slug/

  -- Computed
  research_count INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,

  -- Flexible
  data TEXT,                    -- JSON: open questions, notes, etc.

  FOREIGN KEY (primary_contact) REFERENCES entities(slug)
);

-- ============================================================
-- RESEARCH
-- ============================================================

CREATE TABLE research (
  id TEXT PRIMARY KEY,          -- "0107-acme-company-dd-26"

  type TEXT NOT NULL,           -- company, tech, market, topic
  intensity TEXT,               -- quick, standard, deep

  -- Subject
  subject_entity TEXT,          -- entity slug if about entity
  subject_name TEXT,            -- name or topic string
  subject_type TEXT,            -- entity type or "topic"

  -- Content
  file_path TEXT NOT NULL,      -- path to report.md
  folder_path TEXT,             -- path to research folder

  -- Extracted
  summary TEXT,
  key_findings TEXT,            -- JSON array
  confidence TEXT,              -- high, medium, low

  -- Metadata
  created_at TEXT NOT NULL,
  agents_used TEXT,             -- JSON array
  mcps_used TEXT,               -- JSON array
  duration_seconds INTEGER,

  -- Flexible
  data TEXT,

  FOREIGN KEY (subject_entity) REFERENCES entities(slug)
);

-- ============================================================
-- CONTENT (posts, essays, tweets, images, briefs)
-- ============================================================

CREATE TABLE content (
  id TEXT PRIMARY KEY,

  type TEXT NOT NULL,           -- post, essay, tweet, image, brief, work
  subtype TEXT,                 -- telegram (for post), thread (for tweet)

  -- Basic info
  title TEXT,
  language TEXT,                -- en, ru

  -- Files
  file_path TEXT NOT NULL,
  image_path TEXT,              -- for posts with images

  -- Status
  status TEXT DEFAULT 'draft',  -- draft, published, scheduled
  published_at TEXT,
  scheduled_at TEXT,
  platform TEXT,                -- twitter, telegram, linkedin

  -- Content summary
  summary TEXT,                 -- first 200 chars or AI summary
  word_count INTEGER,

  -- Relations
  related_entities TEXT,        -- JSON array of entity slugs
  source_research TEXT,         -- research ID if based on research

  -- Metadata
  created_at TEXT NOT NULL,

  -- Flexible
  data TEXT,

  FOREIGN KEY (source_research) REFERENCES research(id)
);

-- ============================================================
-- TOPICS (for tagging)
-- ============================================================

CREATE TABLE topics (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_slug TEXT,
  description TEXT,

  FOREIGN KEY (parent_slug) REFERENCES topics(slug)
);

-- Junction table for tagging anything
CREATE TABLE taggings (
  topic_slug TEXT NOT NULL,
  target_type TEXT NOT NULL,    -- entity, interaction, research, content, deal
  target_id TEXT NOT NULL,

  PRIMARY KEY (topic_slug, target_type, target_id),
  FOREIGN KEY (topic_slug) REFERENCES topics(slug)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Interactions
CREATE INDEX idx_interactions_date ON interactions(date DESC);
CREATE INDEX idx_interactions_type ON interactions(type);
CREATE INDEX idx_interactions_from ON interactions(from_entity);
CREATE INDEX idx_interactions_to ON interactions(to_entity);
CREATE INDEX idx_interactions_channel ON interactions(channel);

-- Extracted items
CREATE INDEX idx_extracted_interaction ON extracted_items(interaction_id);
CREATE INDEX idx_extracted_type ON extracted_items(type);
CREATE INDEX idx_extracted_owner ON extracted_items(owner_entity);
CREATE INDEX idx_extracted_target ON extracted_items(target_entity);
CREATE INDEX idx_extracted_status ON extracted_items(status);
CREATE INDEX idx_extracted_due ON extracted_items(due_date);

-- Relationships
CREATE INDEX idx_rel_from ON relationships(from_entity);
CREATE INDEX idx_rel_to ON relationships(to_entity);
CREATE INDEX idx_rel_type ON relationships(type);

-- Deals
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_last_activity ON deals(last_activity DESC);

-- Research
CREATE INDEX idx_research_subject ON research(subject_entity);
CREATE INDEX idx_research_type ON research(type);
CREATE INDEX idx_research_created ON research(created_at DESC);

-- Content
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_created ON content(created_at DESC);

-- Files
CREATE INDEX idx_files_type ON files(type);

-- Taggings
CREATE INDEX idx_taggings_target ON taggings(target_type, target_id);
```

---

## Extraction Schema

### Call Extraction Format

Each call gets an `extracted.json` file alongside the transcript:

```json
{
  "call_id": "0107-acme-26",
  "date": "2026-01-07",
  "participants": ["stepan", "john-smith"],
  "entity": "acme-corp",
  "duration_min": 45,

  "summary": "Discussed Series A timeline, board composition, intro requests.",

  "decisions": [
    "Proceed with term sheet by Jan 15"
  ],

  "action_items": [
    { "owner": "stepan", "item": "Send intro to a]6z partner", "due": "2026-01-10" },
    { "owner": "john", "item": "Share updated deck", "due": "2026-01-09" }
  ],

  "promises": [
    { "from": "stepan", "to": "john", "what": "Intro to Sarah at a]6z" }
  ],

  "key_topics": ["valuation", "board composition", "timeline"],

  "open_questions": [
    "Board observer seat terms"
  ],

  "sentiment": "positive",
  "follow_up_needed": true
}
```

### Extraction Prompt Template

```markdown
Extract structured information from this call transcript.

Participants: {{participants}}
Company: {{company}}

Return JSON with:
- summary: 2-3 sentence overview
- decisions: list of things decided
- action_items: list of {owner, item, due?}
- promises: list of {from, to, what}
- key_topics: list of main topics discussed
- open_questions: unresolved items
- sentiment: positive/neutral/negative
- follow_up_needed: boolean

Be specific. Use participant names exactly as provided.
Only include items explicitly mentioned, don't infer.

Transcript:
{{transcript}}
```

### What to Extract (by content type)

| Content Type | Extract |
|--------------|---------|
| **Calls** | summary, decisions, action_items, promises, topics, questions, sentiment |
| **Emails** | summary, action_required, attachments, reply_needed |
| **Telegram** | last_topic, pending_response, message_count |
| **Research** | summary, key_findings, confidence, recommendations |

---

## Read/Write Operations

### Write Operations (Indexing)

| Command / Trigger | Tables Written | Logic |
|-------------------|----------------|-------|
| `/cyber-save-calls` | `files`, `interactions`, `extracted_items`, `entities`, `relationships` | Parse Granola → extract items → index |
| `/cyber-telegram` | `files`, `interactions`, `entities` | Parse messages → create interaction per conversation |
| `/cyber-email --sync` | `files`, `interactions`, `entities` | Parse emails → create interactions |
| `/cyber-research-*` | `files`, `research`, `entities`, `deals` | Save report → index → update deal |
| `/cyber-memo` | `files`, `content`, `deals` | Save memo → update deal status |
| `/cyber-init-deal` | `deals`, `entities`, `relationships` | Create deal → create company entity |
| `/cyber-gtd` | `files`, `content`, `extracted_items` | Create work file → mark items done |
| `/cyber-reindex` | All tables | Full rebuild from files |
| SessionStart hook | `files`, incremental | Check checksums → reindex changed |

### Read Operations (Querying)

| Use Case | Query Pattern | Tables |
|----------|---------------|--------|
| Morning brief | Recent interactions + pending items | `interactions`, `extracted_items`, `deals` |
| Call prep for X | Entity + history + items + relationships | `entities`, `interactions`, `extracted_items`, `relationships` |
| "Promises to Acme" | Items by entity + type | `extracted_items` JOIN `interactions` |
| "Deal status" | Deal + recent activity | `deals`, `interactions`, `research` |
| "Who introduced X?" | Relationships | `relationships` |
| Entity context | Entity + all related | `entities`, `interactions`, `relationships`, `deals` |

---

## Scripts Structure

```
scripts/
├── db/
│   ├── schema.sql            # The schema
│   ├── init.ts               # Create DB + tables
│   ├── migrate.ts            # Schema migrations (future)
│   │
│   ├── index.ts              # Main indexer orchestrator
│   ├── index-incremental.ts  # Incremental index (checksums)
│   │
│   ├── extractors/           # File → DB parsers
│   │   ├── calls.ts          # Parse /context/calls/
│   │   ├── telegram.ts       # Parse /context/telegram/
│   │   ├── emails.ts         # Parse /context/emails/
│   │   ├── entities.ts       # Parse /context/entities/
│   │   ├── deals.ts          # Parse /deals/
│   │   ├── research.ts       # Parse /research/ and /deals/*/research/
│   │   └── content.ts        # Parse /content/
│   │
│   ├── extract-llm.ts        # LLM extraction for promises/decisions/etc
│   │
│   ├── query.ts              # Query interface for Claude
│   └── query-functions.ts    # Pre-built query functions
│
context/
└── index.db                  # SQLite database file
```

---

## Query Interface

### Pre-built Query Functions

Claude calls these via bash, not raw SQL:

```bash
# Get context about a person
bun scripts/db/query.ts entity '{"slug":"john-smith"}'

# Get recent calls with Acme
bun scripts/db/query.ts interactions '{"entity":"acme-corp","type":"call","days":30}'

# Get pending action items I own
bun scripts/db/query.ts pending '{"owner":"stepan"}'

# Get promises I made to Acme
bun scripts/db/query.ts promises '{"from":"stepan","to":"acme-corp","status":"pending"}'

# Get full deal context
bun scripts/db/query.ts deal '{"slug":"acme-corp"}'

# Search for entity
bun scripts/db/query.ts search '{"query":"john","type":"person"}'

# Find relationship path
bun scripts/db/query.ts path '{"from":"stepan","to":"acme-corp"}'
```

### Query Function Signatures

```typescript
getEntityContext(slug: string, options?: { level?: 'summary' | 'detailed' | 'full' })
getRecentInteractions(options: { entity?, type?, channel?, days?, limit? })
getPendingItems(options: { owner?, target?, type? })
getPromises(options: { from?, to?, entity?, status? })
getDealContext(slug: string)
searchEntities(query: string, type?: string)
getRelationshipPath(from: string, to: string, maxDepth?: number)
```

---

## Integration Points

### Command Integration Pattern

Each command that creates/modifies files should index after:

```typescript
// Example: /cyber-save-calls
async function saveCalls() {
  // 1. Extract from Granola (existing logic)
  const calls = await extractFromGranola();

  // 2. Save files (existing logic)
  for (const call of calls) {
    await saveCallFiles(call);
  }

  // 3. NEW: Index to database
  for (const call of calls) {
    await indexCall(db, call.path);
  }
}
```

### SessionStart Hook Extension

```typescript
// .claude/hooks/load-context.ts

// Existing logic...

// NEW: Incremental index check
const dbPath = "context/index.db";
if (await Bun.file(dbPath).exists()) {
  const changedFiles = await detectChangedFiles(db);
  if (changedFiles.length > 0) {
    console.log(`Indexing ${changedFiles.length} changed files...`);
    await runIncrementalIndex(db, changedFiles);
  }
}
```

### Workflow Changes

| File | Change |
|------|--------|
| `.claude/hooks/load-context.ts` | Add incremental index check |
| `.claude/commands/cyber-save-calls.md` | Add indexing step |
| `.claude/commands/cyber-telegram.md` | Add indexing step |
| `.claude/commands/cyber-email.md` | Add indexing step |
| `.claude/commands/cyber-brief.md` | Query DB instead of scanning files |
| `.claude/commands/cyber-gtd.md` | Query DB for entity resolution |
| `.claude/skills/Research/workflows/orchestrator.md` | Index after saving |
| New: `scripts/db/*` | All database scripts |
| New: `.claude/commands/cyber-index.md` | Manual index command |

---

## Optimizations

### 1. Entity Resolution

Handle "John", "John Smith", "john@acme.com" resolving to same entity:

```typescript
async function resolveEntity(db: Database, identifier: string): string | null {
  // 1. Exact slug match
  // 2. Name match (fuzzy)
  // 3. Email match
  // 4. Telegram match
  // 5. Alias table lookup
  return slug || null;
}
```

### 2. Incremental Indexing

Use file modification time first, checksum only for changed:

```typescript
async function detectChangedFiles(db: Database): Promise<string[]> {
  // Quick check: modification time
  // Slower check: checksum (only if mtime changed)
  return changedPaths;
}
```

### 3. Concurrent Write Safety

```typescript
const db = new Database("context/index.db");
db.run("PRAGMA journal_mode = WAL");      // Better concurrency
db.run("PRAGMA busy_timeout = 5000");     // Wait for locks
```

### 4. PostgreSQL Migration Path

Abstract database operations for future migration:

```typescript
interface DbDriver {
  query<T>(sql: string, params?: any[]): T[];
  run(sql: string, params?: any[]): void;
}

// SQLite now, PostgreSQL later
function createDb(): DbDriver {
  if (process.env.DATABASE_URL) {
    return new PostgresDriver(...);
  }
  return new SQLiteDriver(...);
}
```

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Create schema (`scripts/db/schema.sql`)
- [ ] Init script (`scripts/db/init.ts`)
- [ ] Query interface (`scripts/db/query.ts`)
- [ ] Basic query functions

### Phase 2: Call Extractor
- [ ] Call parser (`scripts/db/extractors/calls.ts`)
- [ ] LLM extraction (`scripts/db/extract-llm.ts`)
- [ ] Extracted items indexing
- [ ] Backfill existing calls

### Phase 3: Other Extractors
- [ ] Telegram parser
- [ ] Email parser
- [ ] Entity parser
- [ ] Deal parser
- [ ] Research parser
- [ ] Content parser

### Phase 4: Command Integration
- [ ] Update `/cyber-save-calls`
- [ ] Update `/cyber-telegram`
- [ ] Update `/cyber-email`
- [ ] Update `/cyber-brief` to query DB
- [ ] Update `/cyber-gtd` to query DB
- [ ] Create `/cyber-index` command

### Phase 5: Automation
- [ ] SessionStart incremental indexing
- [ ] File change detection
- [ ] Auto-reindex on file changes

---

## Cost Estimates

| Item | One-time | Ongoing |
|------|----------|---------|
| LLM extraction per call | ~$0.02 | Per new call |
| Backfill 100 calls | ~$2.00 | Once |
| Index storage | ~1MB per 1000 items | Negligible |
| Query latency | N/A | <10ms |

---

## Future Considerations

### Team Scaling

When team use is needed:
1. Switch SQLite → PostgreSQL
2. Add row-level security for private/shared data
3. Add user_id columns to relevant tables
4. Update connection string in scripts

### Semantic Search (if needed)

If "find similar discussions" becomes important:
1. Add embeddings column to interactions/content
2. Use SQLite + sqlite-vss extension
3. Or add separate vector store

### Graph Visualization

For relationship exploration:
1. Export subgraph to DOT/Mermaid format
2. Use browser-based visualization (D3.js)
3. No additional dependencies needed

---

*This plan is the result of architectural discussion on 2026-01-08. See conversation for full context and decision rationale.*
