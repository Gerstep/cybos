---
name: cyber-reindex
description: Rebuild context graph database from deals, calls, emails, telegram, and entity files
---

# Rebuild Context Graph Index

Runs the database indexer to populate SQLite with entities and interactions.

**Database:** `~/CybosVault/private/.cybos/db/cybos.sqlite` (auto-created)

## Prerequisites

For LLM extraction (`--extract`), you need `CYBOS_ANTHROPIC_KEY` set in:
- Environment variable, OR
- `~/CybosVault/private/.env`, OR
- Project `.env`

The script auto-loads from these locations.

## Arguments

- `--status` - Show current database status only
- `--no-extract` - Skip LLM extraction (only index files)
- `--extract-only` - Only run LLM extraction, skip file indexing

## Examples

```bash
/cyber-reindex              # Full index + LLM extraction (default)
/cyber-reindex --status     # Show database status
/cyber-reindex --no-extract # Index only, skip LLM extraction
```

## Sources

The indexer processes five sources into a unified SQLite database:

### 1. Entity Files (`~/CybosVault/private/context/entities/**/*.md`)

- Parse frontmatter for type, aliases, contact info
- Build entity_aliases table for deduplication
- Type: person, company, product

### 2. Deal Folders (`~/CybosVault/private/deals/*/`)

- Each folder becomes a deal record
- Parse `index.md` for metadata (YAML frontmatter + content)
- Link to introducing entities

### 3. Calls (`~/CybosVault/private/context/calls/*/`)

- Parse `metadata.json` for attendees, date, title
- Create interactions with participant links
- Track file checksums for incremental updates

### 4. Emails (`~/CybosVault/private/context/emails/*/`)

- Parse `metadata.json` in each email folder
- Extract sender, recipients, subject
- Create interaction records

### 5. Telegram Logs (`~/CybosVault/private/context/telegram/*.md`)

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

## LLM Extraction (Default)

Claude Haiku extracts structured items from interactions:

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

**IMPORTANT:** Scripts live in the app directory, not the vault. Get the path from config.

**Step 1: Get app path from config**
```bash
# Read app_path from ~/.cybos/config.json
cat ~/.cybos/config.json | grep app_path
# Returns: "app_path": "~/Work/cyberman",
```

**Step 2: Run from that directory**
```bash
cd <APP_PATH> && bun scripts/db/index.ts --extract    # Default: index + extract
cd <APP_PATH> && bun scripts/db/index.ts              # Without extract (use --no-extract arg to skip)
```

The `app_path` is set during setup and stored in `~/.cybos/config.json`.

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

After indexing, query the database (run from app directory via `app_path` in config):

```bash
cd <APP_PATH> && bun scripts/db/query.ts entity john-smith
cd <APP_PATH> && bun scripts/db/query.ts find-entity john@example.com
cd <APP_PATH> && bun scripts/db/query.ts search "AI infrastructure"
cd <APP_PATH> && bun scripts/db/query.ts pending --owner me
cd <APP_PATH> && bun scripts/db/query.ts who-shared acme-corp
```

## Hook Integration

The SessionStart hook checks database freshness:
- Last run > 24 hours ago → suggest `/cyber-reindex`
- Database not accessible → show warning to start PostgreSQL
