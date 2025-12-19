# Context Graph v1.1 Implementation Plan

## Deep Analysis: Extraction Quality & Feasibility

### Real Data Assessment

**Current Database State (2026-01-11):**
- 169 entities, 44 interactions (19 calls, 1 email, 24 telegram)
- 195 extracted items: NO source quotes, NO targets, partial owner linkage
- 122 entities with zero interactions (orphans from LLM over-extraction)

**Sample Extracted Item (Current):**
```json
{
  "id": "telegram-ivan-dyachenko-promise-2",
  "type": "promise",
  "content": "Will potentially connect and share experience about AI training/workshop",
  "owner_name": "Ivan Dyachenko",
  "target_name": null,
  "confidence": 0.7,
  "source_type": null,
  "source_quote": null
}
```

**Problem:** No way to verify this promise exists. No provenance, no target, can't trace back to source message.

---

### Data Source Quality Matrix

| Source | Context Quality | Strengths | Limitations | Extraction Confidence Estimate |
|--------|----------------|-----------|-------------|-------------------------------|
| **Calls** | ⭐⭐⭐ Good | • Full transcript<br>• Speaker attribution<br>• Email + company from metadata<br>• Inferred speakers | • No per-message timestamps<br>• Conversational/informal language<br>• Long transcripts (token-heavy) | **Medium-High (0.7-0.8)**<br>Full context available, but informal language reduces precision |
| **Emails** | ⭐⭐⭐⭐ Excellent | • messageId for provenance!<br>• Structured (from/to/subject)<br>• Pre-summarized<br>• Short bodies (efficient) | • Only 1 email indexed so far<br>• Gmail MCP required | **High (0.8-0.9)**<br>Short, structured, professional tone |
| **Telegram** | ⭐⭐⭐⭐ Excellent | • Message-level timestamps (HH:MM)<br>• last_message_id for provenance!<br>• Speaker attribution<br>• Entity slug linkage | • Russian language (many convos)<br>• Very informal/abbreviated<br>• Emoji-heavy | **Medium (0.6-0.8)**<br>Informal language, but timestamps enable precise quoting |

---

### Extraction Pipeline Analysis

#### Challenge 1: Context Sufficiency

**Question:** Will LLM have enough context for high-confidence extraction?

**Analysis by Source:**

**Calls:**
- **Context window:** Full transcript (typically 1000-3000 lines)
- **Speaker identification:** Yes ([Sishir], [Alex Doe])
- **Temporal markers:** None (no timestamps per message)
- **Example context:**
  ```
  [Sishir] Happy to walk you through it. Got 15 minutes?
  [Alex Doe] Yeah, let's do it next week.
  [Sishir] Cool, I'll send a calendar invite.
  ```
  **Extractable:** Promise ("I'll send a calendar invite"), owner=Sishir, target=Alex
  **Evidence quote:** "I'll send a calendar invite"
  **Message ID:** ❌ No timestamps → Use line range instead (e.g., "lines 245-247")

**Verdict: ✅ Sufficient** - Full transcript provides enough context. Use line ranges for provenance.

**Emails:**
- **Context window:** Typically 50-500 words (very manageable)
- **Speaker identification:** from.name, from.email (explicit)
- **Temporal markers:** messageId (for provenance!)
- **Example context:**
  ```
  From: Dawson Allen <dawson@nrtv.co>
  Subject: milestones

  Hi Alex, wanted to put this on your radar.
  Narrativ converts permissioned user data into predictive intelligence...
  We're opening a private round. Happy to walk you through it. Got 15 minutes?
  ```
  **Extractable:** Question ("Got 15 minutes?"), owner=Dawson, target=Alex
  **Evidence quote:** "Happy to walk you through it. Got 15 minutes?"
  **Message ID:** ✅ messageId available ("19b98e0124db3dd5")

**Verdict: ✅✅ Excellent** - Short, structured, professional. Best extraction quality expected.

**Telegram:**
- **Context window:** Last 20 messages per conversation (typically 100-300 words)
- **Speaker identification:** Explicit ([15:19] **Egor**, [15:24] **Me**)
- **Temporal markers:** Timestamps (HH:MM) + last_message_id
- **Example context:**
  ```
  - [15:26] **Egor**: Я бы может сам закосплеил
  - [15:39] **Me**: потому что это система для операций, внутри куча мини аппов
  - [15:42] **Egor**: Ставится поверх классической ОС?
  - [15:43] **Me**: да
  ```
  **Extractable:** Question ("Ставится поверх классической ОС?"), owner=Egor, target=Me
  **Evidence quote:** "Ставится поверх классической ОС?" (verbatim)
  **Message ID:** ✅ Timestamp available ("15:42")

**Verdict: ✅ Sufficient** - Informal but timestamped. Russian language may reduce confidence slightly.

---

#### Challenge 2: Entity Linking & Harmonization

**Question:** Will entity resolution and harmonization work reliably?

**Current Entity Resolution Pipeline:**
1. Email exact match (confidence: 1.0)
2. Telegram handle match (confidence: 1.0)
3. Alias exact match (confidence: 0.95)
4. Fuzzy name match via pg_trgm (confidence: 0.7-0.9)
5. Create new entity (confidence: from LLM)

**Problem:** LLM extraction creates many low-confidence entities from casual mentions.

**Example: Name Variations for Same Person**
```
Source: Call transcript: "Sishir mentioned..."
LLM extraction: Creates entity "Sishir" (confidence: 0.6)

Source: Email metadata: sishir@spectral.finance
Extractor resolution: Finds existing "Sishir" via fuzzy match? NO → Creates "sishir@spectral.finance"

Source: Telegram: "@sishir_varghese mentioned..."
LLM extraction: Creates entity "sishir_varghese" (confidence: 0.5)

Result: 3 entities for 1 person!
```

**Root Cause:**
- **File extractors don't create entities** → Only resolve to existing
- **LLM extraction creates liberally** → No deduplication across batches
- **No cross-source normalization** → Email/telegram/call entities isolated

**Proposed Fix: Two-Tier Entity System**

**Tier 1: High-Confidence Entities (is_candidate = FALSE)**
- Created by:
  - Manual entity files (`context/entities/people/*.md`)
  - File extractor resolution with email or telegram handle match
  - LLM extraction with confidence ≥ 0.85 AND (email OR telegram)

**Tier 2: Candidate Entities (is_candidate = TRUE)**
- Created by:
  - File extractors when participant has no match (name-only)
  - LLM extraction with confidence < 0.85
  - LLM extraction with no email/telegram handle

**Harmonization Strategy:**
1. **At indexing time:**
   - File extractors create candidates for unmatched participants
   - LLM extraction marks low-confidence entities as candidates
   - Existing fuzzy matching runs but adds alias instead of creating duplicate

2. **Manual cleanup (future):**
   - Query: `list-candidates` shows candidates sorted by interaction_count
   - User merges candidates into high-confidence entities
   - Merged entities update all linked interactions and items

**Expected Quality:**
- **Precision:** High-confidence entities are trustworthy (email/telegram verified)
- **Recall:** Candidates capture unknowns without polluting main graph
- **Maintainability:** User can review and merge candidates incrementally

**Verdict: ✅ Workable** - Two-tier system balances capture vs quality.

---

#### Challenge 3: Evidence Extraction Feasibility

**Question:** Can LLM reliably extract verbatim quotes for provenance?

**Test Case 1: Call Transcript**
```
Input context (lines 245-250):
[Sishir] Happy to walk you through it. Got 15 minutes?
[Alex Doe] Yeah, let's do it next week.
[Sishir] Cool, I'll send a calendar invite.
[Alex Doe] Sounds good.

Expected extraction:
{
  "type": "promise",
  "content": "Sishir will send calendar invite to Alex",
  "owner": "Sishir",
  "target": "Alex Doe",
  "evidence_quote": "I'll send a calendar invite.",
  "line_range": "247"
}
```

**Feasibility: ✅ High** - Clear utterance, speaker attribution, extractable quote.

**Test Case 2: Email**
```
Input context:
From: Dawson Allen <dawson@nrtv.co>
Subject: milestones

Hi Alex, wanted to put this on your radar.
Narrativ converts permissioned user data into predictive intelligence...
Happy to walk you through it. Got 15 minutes?

Expected extraction:
{
  "type": "question",
  "content": "Dawson asking Alex for 15-minute call about Narrativ",
  "owner": "Dawson Allen",
  "target": "Alex",
  "evidence_quote": "Happy to walk you through it. Got 15 minutes?",
  "message_id": "19b98e0124db3dd5"
}
```

**Feasibility: ✅✅ Excellent** - Structured, short, professional tone.

**Test Case 3: Telegram (Russian)**
```
Input context:
- [15:26] **Egor**: Я бы может сам закосплеил
- [15:39] **Me**: потому что это система для операций, внутри куча мини аппов
- [15:42] **Egor**: Ставится поверх классической ОС?

Expected extraction:
{
  "type": "question",
  "content": "Egor asking if the system is installed on top of regular OS",
  "owner": "Egor",
  "target": "Me",
  "evidence_quote": "Ставится поверх классической ОС?",
  "message_id": "15:42"
}
```

**Feasibility: ✅ Medium-High** - Claude handles Russian well. Informal abbreviations ("ОС") may reduce confidence slightly.

**Verdict: ✅ Feasible** - LLM can extract quotes reliably. Use line ranges for calls, timestamps for telegram, messageIds for emails.

---

### Trust Level Calibration

Based on data source analysis, proposed trust level formula:

```typescript
function calculateTrustLevel(item: {
  source_type: string;
  confidence: number;
  evidence_quote?: string;
  owner_entity?: string;
  target_entity?: string;
}): 'high' | 'medium' | 'low' {
  // No evidence quote = automatic low trust
  if (!item.evidence_quote) return 'low';

  // High trust: explicit statement with entity linkage
  if (
    item.confidence >= 0.85 &&
    item.evidence_quote &&
    (item.owner_entity || item.target_entity)
  ) {
    return 'high';
  }

  // Medium trust: clear statement, but missing linkage or slightly lower confidence
  if (
    item.confidence >= 0.65 &&
    item.evidence_quote
  ) {
    return 'medium';
  }

  // Low trust: uncertain or incomplete
  return 'low';
}
```

**Expected Distribution (after v1.1):**
- **High trust:** 40-50% (emails, clear promises/decisions in calls)
- **Medium trust:** 30-40% (informal telegram, implied actions)
- **Low trust:** 10-20% (uncertain mentions, candidates without linkage)

---

### Actionability Criteria (Refined)

```typescript
function isActionable(item: {
  type: string;
  trust_level: string;
  source_path: string;
  source_quote?: string;
  owner_entity?: string;
  target_entity?: string;
}): boolean {
  // MUST have provenance
  if (!item.source_path || !item.source_quote) {
    return false;
  }

  // MUST be medium or high trust
  if (item.trust_level === 'low') {
    return false;
  }

  // Decisions are actionable with just source + quote (for IC tracking)
  if (item.type === 'decision') {
    return true;
  }

  // Promises/actions MUST have owner OR target linkage (for attribution)
  if (item.type === 'promise' || item.type === 'action_item') {
    return !!(item.owner_entity || item.target_entity);
  }

  // Questions and metrics are actionable if they have provenance
  if (item.type === 'question' || item.type === 'metric') {
    return true;
  }

  return false;
}
```

**Expected Actionability Rate:** 70-80% of extracted items after filtering.

---

### Extraction Cost Estimate

**Per-Interaction Costs (Claude 3.5 Haiku):**
- Call transcript (2000 lines): ~$0.008 input + $0.002 output = **$0.01/call**
- Email body (200 words): ~$0.001 input + $0.001 output = **$0.002/email**
- Telegram (20 messages): ~$0.001 input + $0.001 output = **$0.002/conversation**

**Current Database:**
- 19 calls × $0.01 = **$0.19**
- 1 email × $0.002 = **$0.002**
- 24 telegram × $0.002 = **$0.048**
- **Total: $0.24** (full re-extraction)

**Projected Cost (100 interactions):**
- 50 calls × $0.01 = **$0.50**
- 30 emails × $0.002 = **$0.06**
- 20 telegram × $0.002 = **$0.04**
- **Total: $0.60** per batch (monthly: ~$2-3)

**Verdict: ✅ Negligible cost** - Even with full re-extraction, cost is <$1.

---

## Open Questions for User

### 1. Russian Language Handling

**Context:** ~40% of Telegram conversations are in Russian. Example:
```
- [15:26] **Egor**: Я бы может сам закосплеил
- [15:39] **Me**: потому что это система для операций, внутри куча мини аппов
```

**Options:**
- **A) Extract in Russian, translate content to English for queries** (preserves evidence quote accuracy)
- **B) Ask LLM to extract in English directly** (may lose nuance, but easier to query)
- **C) Support both languages in database** (add `language` field to items)

**Recommendation:** Option A - preserve Russian quotes, translate content field for searchability.

**Your preference?**

### 2. Email Sync Coverage

**Context:** Only 1 email indexed so far. Gmail MCP works, but needs wider sync.

**Options:**
- **A) Sync last 7 days of emails** (unread + important) - ~30 emails
- **B) Sync last 30 days** (comprehensive backfill) - ~100+ emails
- **C) Start fresh, only index new emails going forward**

**Tradeoffs:**
- More emails = better context graph, but higher extraction cost
- Historical emails may reference deals/people not yet in database

**Recommendation:** Option A - Last 7 days as baseline, expand if needed.

**Your preference?**

### 3. Candidate Entity Cleanup Workflow

**Context:** 122 orphan entities currently. v1.1 will create more candidates.

**Options:**
- **A) Auto-prune candidates with 0 interactions after 30 days**
- **B) Manual review workflow (CLI command: `merge-entity source-slug target-slug`)**
- **C) Leave all candidates, clean up later**

**Recommendation:** Option B - Manual merge command for gradual cleanup.

**Your preference?**

### 4. Line Range Extraction for Calls

**Context:** Call transcripts have no per-message timestamps. Options for provenance:

**Options:**
- **A) Use line numbers** (e.g., "lines 245-247" in transcript.txt)
  - **Pros:** Precise, easy to implement
  - **Cons:** Breaks if transcript regenerated
- **B) Use speaker + ~50 words of context** (e.g., "[Sishir] Happy to walk... calendar invite")
  - **Pros:** Robust to transcript changes
  - **Cons:** Less precise for multi-page transcripts
- **C) Hybrid: line range + snippet** (best of both)

**Recommendation:** Option C - Store both for robustness + precision.

**Your preference?**

### 5. Deal Linkage Heuristics

**Context:** Detecting which interactions relate to which deals.

**Current approach:**
```typescript
// Match if summary or participant names mention deal name
if (
  summaryLower.includes(dealNameLower) ||
  participantNames.some(n => n.toLowerCase().includes(dealNameLower))
) {
  linkToDeal(dealSlug);
}
```

**Concerns:**
- May over-match (e.g., "Narrativ" deal matches "narrative" in transcript)
- May under-match (company name not mentioned explicitly)

**Options:**
- **A) Keep simple heuristic, manual correction later**
- **B) Add LLM-based deal mention extraction** ("`type: deal_mention`" in extraction)
- **C) Require manual deal tagging** (no auto-linking)

**Recommendation:** Option B - Let LLM extract deal mentions explicitly.

**Your preference?**

---

## Implementation Plan

[... rest of plan from previous version ...]

---

## Next Steps

**Before implementation:**
1. **Answer open questions** above
2. **Review extraction feasibility** - Are you confident in the analysis?
3. **Create test dataset** - Pick 3 calls, 2 emails, 3 telegram conversations as gold standard
4. **Define success threshold** - What % actionability rate is acceptable?

**After user approval:**
1. Create feature branch: `feature/context-graph-v1.1`
2. Implement in phases (schema → extractors → LLM → queries → tests)
3. Test on gold dataset
4. Full re-extraction on real data
5. Merge with detailed documentation

