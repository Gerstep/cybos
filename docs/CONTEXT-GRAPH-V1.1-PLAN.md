# Context Graph v1.1 Improvement Plan

Goal: ship a reliable, actionable context graph with linkage, provenance,
evals, JSON output, and time-decayed relevancy. No new cache layer.
Use the DB index plus raw source files only.

## Target queries (v1.1)

1) My action items from last week
2) All decisions regarding deal X
3) Last conversation with Y
4) What was discussed about project Z

## Current DB snapshot (2026-01-11)

Source: live DB queries via psql and query CLI.

- entities: 169
- interactions: 44 (calls: 19, emails: 1, telegram: 24)
- extracted_items: 195
- relationships: 0
- deals: 4
- files: call 33, email 2, telegram 39 (no deals/entities)
- interactions missing from_entity: 10
- extracted_items missing owner_entity: 92
- extracted_items missing target_entity: 195 (all)
- entities with zero interactions: 122
- deals missing introducer: 4 (all)

## What went wrong with indexing (diagnosis)

1) Linkage gaps:
   - Extractors do not create entities; only LLM extraction does.
   - target_entity is never populated for extracted_items.
   - relationships table is never populated.
2) Provenance gaps:
   - extracted_items lack source message ID and evidence span.
   - no item-level link to raw message or transcript chunk.
3) Usage gaps:
   - scripts expect JSON from query CLI, but only status supports JSON.
4) Coverage gaps:
   - emails barely indexed (1 email), deals not linked to introducers.
   - many entities have no interactions (sparse, mostly LLM-created).
5) Freshness gaps:
   - call/email checksums only cover metadata; transcript/body changes
     do not trigger reindex.

## v1.1 Principles

- Actionable = clear trusted source and recoverable proof.
- Linkage is mandatory: every item must link to a specific source.
- Provenance is shown to the user by default.
- No invalidation; time-decay relevancy instead.
- Minimal new data structures; ship quickly.

## v1.1 Plan (phased)

### Phase A: JSON output fix (unlock usage)

Scope:
- Add `--json` output to `scripts/db/query.ts` for all commands.
- Update scripts and workflows to rely on JSON output (telegram, brief, email, gtd).

Acceptance:
- `bun scripts/db/query.ts entity <slug> --json` returns structured JSON.
- `scripts/telegram-gramjs.ts` loads entity context successfully.

### Phase B: Linkage and provenance (minimum viable)

Schema changes (minimal):
- Add fields to `extracted_items`:
  - source_type (call|email|telegram)
  - source_path (file path)
  - source_message_id (gmail message id, telegram message id if available)
  - source_quote (short verbatim snippet)
  - source_span (line range or offset if possible)
  - target_entity (slug) and target_name (string)
  - trust_level (high|medium|low)

Extractor changes:
- LLM prompts must return:
  - target entity (if any)
  - evidence quote (short)
  - message id when available
  - source type
- Store evidence in DB for all items.
- Backfill evidence for existing extracted_items where possible.

User-facing behavior:
- Every item shown includes provenance block:
  - Source: type, timestamp, file path
  - Quote: short snippet

### Phase C: Actionability gating

Definition:
- Actionable if:
  - trust_level >= medium
  - source_quote present
  - source_path present
  - (owner or target) resolved to an entity

Trust policy (v1.1):
- All sources have equal trust.
- Decisions are actionable with source + quote (no owner/target required).

Implementation:
- Add `is_actionable` computed field in query layer.
- Only show actionable items in default responses.
- Provide `--include-unverified` in query CLI for debugging.

### Phase D: Time-decay relevancy (no invalidation)

Policy:
- Base relevance from confidence and trust_level.
- Decay by age of source interaction:
  - < 1 day: 1.00
  - 365 days: 0.20

Suggested formula:
  decay(age_days) = max(0.20, 1.00 - 0.80 * min(age_days, 365) / 365)
  relevance = confidence * decay(age_days)

Usage:
- Rank items by relevance for queries.
- Apply minimum relevance threshold (default 0.35).

### Phase E: Coverage and linkage backfill

1) Entity coverage:
   - On indexing, create "candidate" entities from interactions
     if no match (low-confidence, source tagged).
   - Add alias and entity resolution cleanup pass.
2) Deal linkage:
   - Parse deal mentions in extraction -> link to deal slug.
   - Attempt deal slug match by company name or domain.
3) Calls/emails checksums:
   - Include transcript/body hash in checksum.

### Phase F: Evals and metrics

Create eval dataset (gold):
- 20 interactions (calls/emails/telegram)
- Hand-labeled items with provenance
- One example per target query type

Metrics:
- linkage_coverage: % items with source_path + source_quote
- actionability_rate: % items passing gating
- entity_link_rate: % interactions with resolved participants
- provenance_completeness: % items with source_message_id
- query_success_rate: 4 target queries answerable from DB

## Query flows (v1.1)

1) My action items from last week
   - Filter extracted_items type=action_item
   - interaction_date in last 7 days
   - actionable only, sorted by relevance
2) All decisions regarding deal X
   - Filter extracted_items type=decision
   - join interactions -> find deal_mention match or deal slug link
3) Last conversation with Y
   - Find entity Y
   - Select most recent interaction with participant Y
   - Show summary + top 1-3 actionable items
4) What was discussed about project Z
   - Full-text search interactions + extracted_items content
   - Rank by relevance decay

## Implementation checklist

- [ ] JSON output for query CLI
- [ ] Add provenance fields for extracted_items
- [ ] Update LLM prompts to emit evidence and targets
- [ ] Store evidence in DB
- [ ] Actionability gating in query layer
- [ ] Time-decay relevance ranking
- [ ] Backfill for existing data
- [ ] Eval set + metrics script
