# Context Graph - Actual Implementation

This document describes the current, real implementation in this repo.
It intentionally focuses on what the code does today, not on the plan.

## At a glance

- Database: PostgreSQL 16 via Docker (`scripts/db/docker-compose.yml`)
- Schema: `scripts/db/schema.sql` (pg_trgm, pgvector enabled)
- Indexer: `scripts/db/index.ts`
- Extractors: `scripts/db/extractors/*.ts`
- LLM extraction (optional): `scripts/db/extract-llm.ts` (Claude 3.5 Haiku)
- Query CLI: `scripts/db/query.ts`
- Freshness check: `.claude/hooks/load-context.ts`

## Data flow (actual)

1. Raw data capture to files:
   - Granola calls -> `context/calls/<call-id>/`
   - Gmail sync -> `context/emails/<folder>/`
   - Telegram logs -> `context/telegram/<slug>.md`
   - Manual entities -> `context/entities/people/*.md`, `context/entities/orgs/*.md`
   - Deals -> `deals/<slug>/` with `.cybos/context.md`
2. Indexer run (manual):
   - `bun scripts/db/index.ts` (optionally with `--extract`)
3. Optional LLM extraction:
   - `bun scripts/db/index.ts --extract`
4. Query usage by workflows:
   - CLI calls to `scripts/db/query.ts` for entity context and pending items

There is no automatic incremental indexing in the SessionStart hook. It only
checks freshness and prints a warning if stale.

## Database schema (actual)

Tables created in `scripts/db/schema.sql`:

- `files` (file registry, extraction status)
- `entities` (people, companies, products, groups)
- `entity_aliases` (name/email/telegram aliases)
- `interactions` (calls, emails, telegram)
- `extracted_items` (promises, action items, decisions, metrics, etc.)
- `relationships` (exists, currently unused by extractors)
- `deals`
- `research` (exists, currently unused by extractors)
- `content` (exists, currently unused by extractors)
- `batch_runs` (indexer run log)
- `sessions` (exists, currently unused)

Full-text search uses tsvector + GIN, fuzzy matching uses pg_trgm.

## Indexer and extractors

### Entities (`scripts/db/extractors/entities.ts`)

Sources:
1. Legacy `context/entities/.index.json` if present (primary)
2. Manual markdown files:
   - `context/entities/people/*.md`
   - `context/entities/orgs/*.md`

Behavior:
- Inserts or updates entities by slug
- Creates `entity_aliases` for aliases listed in `.index.json`
- Parses frontmatter for name/email/telegram in manual files
- Updates `interaction_count` for all entities

Notes:
- The repo currently has no `.index.json` committed.
- This extractor does not create entities from calls/emails/telegram by itself.

### Deals (`scripts/db/extractors/deals.ts`)

Source:
- `deals/<slug>/.cybos/context.md` (optional)

Behavior:
- Parses lines in `key: value` format (not YAML frontmatter)
- Sets status/stage/raising/valuation/sector/thesis_fit/lead_partner/introduced_by
- Links `primary_contact` if an entity with the same slug exists
- Updates `research_count` by counting `deals/<slug>/research/*.md`

Notes:
- No file registry entry is written to `files`
- No deal extraction from research reports or emails

### Calls (`scripts/db/extractors/calls.ts`)

Source:
- `context/calls/<folder>/metadata.json`

Behavior:
- Summary is `metadata.title` (no transcript parsing)
- Participants resolved via `find_entity(email/name)`
- Unknown people only appear in `participant_names`
- `from_entity` is set to the first resolved participant
- `files.checksum` is based on `metadata.json` only

Notes:
- Transcript changes do not trigger reindex if metadata is unchanged

### Emails (`scripts/db/extractors/emails.ts`)

Source:
- `context/emails/<folder>/metadata.json`

Behavior:
- Summary is `metadata.summary` or `metadata.subject`
- Participants resolved via `find_entity(email/name)`
- Unknown people only appear in `participant_names`
- `files.checksum` is based on `metadata.json` only

Notes:
- Body changes do not trigger reindex if metadata is unchanged

### Telegram (`scripts/db/extractors/telegram.ts`)

Source:
- `context/telegram/*.md`

Behavior:
- Parses header fields: Entity, Username, Type, First Contact, Last Updated
- If `Entity` slug is present, it must already exist in DB to be used
- If no slug, tries `find_entity(@username)`; otherwise no entity is linked
- Summary is auto-generated: "Telegram conversation with <name>"
- `files.checksum` is based on the full file content

Notes:
- This extractor does not auto-create entities

## LLM extraction (optional)

LLM extraction is run by `scripts/db/extract-llm.ts`.

Inputs:
- Calls: transcript.txt + notes.md (if present)
- Emails: body.md
- Telegram: full message section of the markdown file

Outputs:
- `extracted_items` with types:
  `promise`, `action_item`, `decision`, `question`, `metric`, `deal_mention`
- New entities from mentions (person/company/product)
- Updates `interactions.participants` by adding resolved entities
- Marks `files.extraction_done` and sets counts

Limitations in current code:
- No `target_entity` or `target_name` is populated
- `interactions.summary` is not updated from extraction
- `interactions.has_extraction` is never set
- `files.needs_extraction` and `files.extraction_attempts` are unused
- No evidence spans or source message IDs stored for items
- Items are inserted by index; stale items are not deleted

## Entity resolution logic

`find_entity()` (SQL function) matches in this order:
1. Email exact match
2. Telegram handle exact match
3. Alias exact match
4. Fuzzy name match (pg_trgm similarity)

`resolveEntity()` behavior:
- Creates new entity if no match
- Adds alias on fuzzy match (>= 0.7)
- Updates current_company/job_title/current_focus directly

## Query interface (actual)

`scripts/db/query.ts` provides a CLI:
- `entity <slug>`
- `find-entity <identifier>`
- `search-entities <query>`
- `search <query>`
- `who-shared <deal-slug>`
- `what-doing <slug> [date]`
- `pending [--owner <slug>] [--type <promise|action_item>]`
- `timeline <slug>`
- `list-entities [--type <type>]`
- `status [--json]`

The CLI is human-readable; JSON output is only implemented for `status`.
Several workflows expect `--json` for other commands, which currently fails.

## Integration points

- SessionStart hook:
  - Checks DB status via `bun scripts/db/query.ts status --json`
  - Extracts Granola calls to files
  - Does not reindex DB
- `/cyber-reindex` runs `scripts/db/index.ts` (with optional LLM extraction)
- Telegram/GTD/Brief/Email workflows call `query.ts` for entity context
  but assume JSON output that is not implemented.

## Mismatches vs plan and docs

- Plan assumed SQLite; actual is PostgreSQL + Docker
- `research` and `content` tables exist but no extractors populate them
- `relationships` table exists but is never populated
- Incremental indexing is not implemented; only per-file checksum skips
- Docs mention `--json`, `--detailed`, and `find-interactions` commands
  that do not exist in the current CLI
- `migrate.ts` imports `runIndexer` which is not exported in `index.ts`

## Provenance and traceability

What exists:
- `interactions.file_path` points to the source file or folder
- `interactions.data` stores provider IDs:
  - calls: `granola_id`
  - emails: `gmail_message_id`, `thread_id`
  - telegram: `telegram_username`, `last_message_id`
- `extracted_items.interaction_id` links back to interactions

What is missing:
- No direct item-level pointer to message IDs or transcript spans
- No captured source quotes or line offsets for items

