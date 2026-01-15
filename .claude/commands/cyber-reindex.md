---
name: cyber-reindex
description: Rebuild context graph database from deals, calls, emails, telegram, and entity files
---

# Rebuild Context Graph Index

Runs the database indexer to populate PostgreSQL with entities and interactions.

**Requires:** PostgreSQL running at DATABASE_URL (see `scripts/db/docker-compose.yml`)

## Arguments

- `--status` - Show current database status only
- `--extract` - Also run LLM extraction (costs ~$0.01/interaction)
- `--extract-only` - Only run LLM extraction, skip file indexing

## Examples

```bash
/cyber-reindex              # Full index (no LLM extraction)
/cyber-reindex --status     # Show database status
/cyber-reindex --extract    # Index + LLM extraction
```

## Sources

The indexer processes five sources into a unified PostgreSQL database:

### 1. Entity Files (`/context/entities/**/*.md`)

- Parse frontmatter for type, aliases, contact info
- Build entity_aliases table for deduplication
- Type: person, company, product

### 2. Deal Folders (`/deals/*/`)

- Each folder becomes a deal record
- Parse `.cybos/context.md` for metadata
- Link to introducing entities

### 3. Calls (`/context/calls/*/`)

- Parse `metadata.json` for attendees, date, title
- Create interactions with participant links
- Track file checksums for incremental updates

### 4. Emails (`/context/emails/*/`)

- Parse `metadata.json` in each email folder
- Extract sender, recipients, subject
- Create interaction records

### 5. Telegram Logs (`/context/telegram/*.md`)

- Parse per-person markdown files
- Extract metadata from header (username, type)
- Track lastMessageId for deduplication

## Database Schema

The indexer populates these tables:

| Table | Purpose |
|-------|---------|
| `entities` | People, companies, products with contact info |
| `entity_aliases` | Name variations for matching |
| `interactions` | Calls, emails, telegram conversations |
| `deals` | Deal folders with intro attribution |
| `files` | File registry for sync tracking |
| `batch_runs` | Indexer run logs |

## LLM Extraction (Optional)

With `--extract`, Claude Haiku extracts structured items:

| Type | Description |
|------|-------------|
| `promise` | Commitment to do something |
| `action_item` | Task needing completion |
| `decision` | Conclusion reached |
| `question` | Open question |
| `metric` | Business numbers |
| `deal_mention` | Who mentioned which deal |

Extraction also:
- Auto-creates entities from mentions
- Updates entity context (current_focus)
- Resolves participants to entity slugs

## Execution

The command runs:

```bash
# Check database status
bun scripts/db/migrate.ts --status

# Run the indexer
bun scripts/db/index.ts [--extract]

# Or for migration
bun scripts/db/migrate.ts [--verify] [--cleanup]
```

## Output

Status report after indexing:

```
==================================================
INDEXER RESULTS
==================================================

Duration: 4.2s

Entities:
  Created: 45
  Updated: 12
  Aliases: 67

Deals:
  Created: 8
  Updated: 2

Calls:
  Created: 15
  Updated: 3
  Skipped: 0

Emails:
  Created: 42
  Updated: 0
  Skipped: 0

Telegram:
  Created: 23
  Updated: 5
  Skipped: 0

No errors.
```

With `--extract`:

```
LLM Extraction:
  Interactions: 80
  Items extracted: 156
  Entities resolved: 34
  Entities created: 8
  Cost: $0.0423
```

## Query Interface

After indexing, query the database:

```bash
# Entity lookup
bun scripts/db/query.ts entity john-smith

# Find by email/telegram/name
bun scripts/db/query.ts find-entity john@example.com

# Full-text search
bun scripts/db/query.ts search "AI infrastructure"

# Pending items
bun scripts/db/query.ts pending --owner me

# Who introduced a deal?
bun scripts/db/query.ts who-shared acme-corp
```

## Hook Integration

The SessionStart hook checks database freshness:
- Last run > 24 hours ago → suggest `/cyber-reindex`
- Database not accessible → show warning to start PostgreSQL
