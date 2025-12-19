# VC Pipeline Vision - Cybos

*Full deal flow from sourcing to investment decision*

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEAL SOURCING                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │ Cyber Researcher│    │  Email/Telegram │    │  Inbound Bot    │          │
│  │ (OUT OF SCOPE)  │    │   Mentions      │    │  (deck, link)   │          │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘          │
│           │                      │                      │                    │
│           └──────────────────────┼──────────────────────┘                    │
│                                  ▼                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      1. INTAKE & PARSE      │ ❌ NEW
                    │  - Extract company info     │
                    │  - Parse deck (PDF/DocSend) │
                    │  - Create deal folder       │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   2. INITIAL RESEARCH       │ ✅ EXISTS
                    │  /cyber-research-company    │
                    │  --quick mode               │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │     3. FUND FIT CHECK       │ ❌ NEW
                    │  - Score vs thesis criteria │
                    │  - Table: fit/not fit       │
                    │  - Auto-pass triggers       │
                    └──────────────┬──────────────┘
                                   │
                         ┌─────────┴─────────┐
                         │                   │
                    ┌────▼────┐         ┌────▼────┐
                    │  PASS   │         │ PROCEED │
                    │ (logged)│         │         │
                    └─────────┘         └────┬────┘
                                             │
                    ┌──────────────▼──────────────┐
                    │    4. TEAM SCORECARD        │ ❌ NEW
                    │  - Founder evaluation       │
                    │  - Domain expertise check   │
                    │  - Track record analysis    │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      5. DEEP RESEARCH       │ ✅ EXISTS
                    │  /cyber-research-company    │
                    │  --deep mode                │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │       6. OUTREACH           │ ⚠️ PARTIAL
                    │  - Find contacts (Exa)      │ ❌ NEW
                    │  - Draft message            │ ✅ GTD workflow
                    │  - Request deck/call        │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │     7. MEETING PREP         │ ✅ EXISTS
                    │  - call-prep GTD workflow   │
                    │  - Generate questions       │
                    │  - Load deal context        │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │        8. MEETING           │ ✅ EXISTS
                    │  - Granola transcription    │
                    │  - Auto-extract to context  │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   9. TEMPERATURE CHECK      │ ❌ NEW
                    │  - Light memo               │
                    │  - Quick IC discussion      │
                    │  - Go/No-go for full DD     │
                    └──────────────┬──────────────┘
                                   │
                         ┌─────────┴─────────┐
                         │                   │
                    ┌────▼────┐         ┌────▼────┐
                    │  PASS   │         │ FULL DD │
                    └─────────┘         └────┬────┘
                                             │
                    ┌──────────────▼──────────────┐
                    │    10. REFERENCE CHECK      │ ❌ NEW
                    │  - Identify references      │
                    │  - Generate questions       │
                    │  - Log reference feedback   │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      11. FULL MEMO          │ ✅ EXISTS
                    │  /cyber-memo                │
                    │  - Comprehensive analysis   │
                    │  - IC recommendation        │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │     12. IC DECISION         │ ❌ NEW
                    │  - Present to committee     │
                    │  - Log decision + rationale │
                    │  - Update deal status       │
                    └──────────────┬──────────────┘
                                   │
                         ┌─────────┴─────────┐
                         │                   │
                    ┌────▼────┐         ┌────▼────┐
                    │  PASS   │         │ INVEST  │
                    └─────────┘         └─────────┘
```

---

## Deal Stages

| Stage | Status | Trigger |
|-------|--------|---------|
| `sourced` | New deal entered system | Intake creates deal folder |
| `researching` | Initial research started | Auto after intake |
| `reviewing` | Fund fit + team scored | Research complete |
| `outreach` | Contacting founders | Passed fit check |
| `call-scheduled` | Meeting confirmed | Response received |
| `met` | First meeting done | Granola transcript extracted |
| `temp-check` | Light memo for IC | After first meeting |
| `deep-dd` | Full diligence | IC approves deep dive |
| `ic-review` | Full memo submitted | DD complete |
| `passed` | Decided not to invest | Any stage |
| `invested` | Deal closed | IC approval |

---

## Component Details

### 1. INTAKE & PARSE ❌ NEW

**Command:** `/cyber-intake <link|deck|text>`

**Accepts:**
- URL (company website, LinkedIn, Twitter, Crunchbase)
- Deck (PDF path, DocSend link)
- Raw text (email forward, Telegram message)

**Does:**
1. Extract company name + basic info
2. Parse deck if provided (Python script for PDFs)
3. Create `/deals/<slug>/` folder
4. Set status = `sourced`
5. Auto-trigger initial research

**Deck Parsing (script-based):**
```
scripts/parse-deck.ts
- Input: PDF path or DocSend URL
- Output: JSON with team, metrics, ask, product summary
- Saves to: /deals/<slug>/materials/deck-extracted.json
```

---

### 2. INITIAL RESEARCH ✅ EXISTS

**Command:** `/cyber-research-company "Name" --quick`

Already implemented. Quick mode uses fewer agents, faster turnaround.

---

### 3. FUND FIT CHECK ❌ NEW

**Command:** `/cyber-fit-check "Company"`

**Input:**
- Research from step 2
- `context/investment-philosophy.md` (criteria)

**Output:** `/deals/<slug>/fit-check.md`

```markdown
# Fund Fit Check: Acme Corp

## Criteria Scorecard

| Criterion | Status | Notes |
|-----------|--------|-------|
| Market Size ($1B+ path) | ✅ FIT | $50B TAM in AI infra |
| Moat (not 6-week buildable) | ⚠️ REVIEW | Data moat unclear |
| Business Model | ✅ FIT | Clear SaaS model |
| Stage Match (pre-seed/seed) | ✅ FIT | Raising $2M seed |
| Sector (AI/Crypto/Robotics) | ✅ FIT | AI infrastructure |
| Valuation (<$100M pre-rev) | ✅ FIT | $15M cap |

## Auto-Pass Triggers
- [ ] Big Tech 6-week rule - NO
- [ ] Pure wrapper - NO
- [ ] Media/entertainment robotics - NO

## Verdict: PROCEED TO TEAM SCORECARD

## Pass Reason (if applicable):
N/A
```

---

### 4. TEAM SCORECARD ❌ NEW

**Command:** `/cyber-team-score "Company"`

**Criteria:**
1. Domain expertise (scientific/industrial - where published?)
2. Technical depth (0.1% capability indicator)
3. Track record (repeat founder? exits? scale achieved?)
4. Execution signals (speed, bias to action)
5. Sales/commercial DNA (can they sell?)

**Output:** `/deals/<slug>/team-scorecard.md`

```markdown
# Team Scorecard: Acme Corp

## Founders

### Jane Doe (CEO)
| Dimension | Score | Evidence |
|-----------|-------|----------|
| Domain Expertise | 9/10 | PhD ML Stanford, 15 papers, cited 2000+ |
| Technical Depth | 8/10 | Built infra at Google Brain |
| Track Record | 7/10 | First-time founder, but scaled team 0→50 |
| Execution Speed | 8/10 | Shipped 3 major features in 6 months |
| Commercial DNA | 6/10 | Technical background, limited sales exp |

### John Smith (CTO)
...

## Team Composition
- Technical depth: STRONG
- Commercial capability: MODERATE (need sales hire)
- Domain coverage: AI infra ✅

## Red Flags
- None identified

## Verdict: STRONG TEAM - PROCEED
```

---

### 5. DEEP RESEARCH ✅ EXISTS

**Command:** `/cyber-research-company "Name" --deep`

Uses parallel agents + quality reviewer. Already implemented.

---

### 6. OUTREACH ⚠️ PARTIAL (needs contact finder)

**New component:** Contact finder using Exa API

**Command:** `/cyber-outreach "Company"`

**Does:**
1. Use `mcp__exa__search` for founder profiles
2. Extract: LinkedIn URL, Twitter handle, email
3. Save to deal context
4. Draft outreach message (existing GTD outreach workflow)
5. Create pending action in `/content/work/`

**Contact data saved to:** `/deals/<slug>/.cybos/context.md`
```markdown
## Contacts
- Jane Doe (CEO): jane@acme.com | @janedoe | linkedin.com/in/janedoe
- John Smith (CTO): john@acme.com | @johnsmith
```

---

### 7. MEETING PREP ✅ EXISTS

GTD `call-prep` workflow already handles this.

---

### 8. MEETING ✅ EXISTS

Granola integration already extracts transcripts to `/context/calls/`.

---

### 9. TEMPERATURE CHECK ❌ NEW

**Command:** `/cyber-temp-check "Company"`

**Purpose:** Light memo for quick IC discussion before committing to full DD

**Output:** `/deals/<slug>/temp-check.md`

```markdown
# Temperature Check: Acme Corp

**Date:** 2026-01-16
**Status:** Met founders, considering deep DD

## One-liner
AI infrastructure for [specific use case]

## Why Interesting
- [3 bullets max]

## Key Concerns
- [3 bullets max]

## Founder Impression
[2-3 sentences from call notes]

## Ask
$2M at $15M cap

## Recommendation
☐ PASS | ☑ DEEP DD | ☐ MORE INFO NEEDED

## Discussion Notes
[To be filled during IC]
```

---

### 10. REFERENCE CHECK ❌ NEW

**Command:** `/cyber-references "Company"`

**Does:**
1. Identify reference candidates from:
   - Previous employers (from LinkedIn data)
   - Co-founders at previous companies
   - Investors in previous rounds
   - Domain experts in their space
2. Generate tailored questions based on concerns from research
3. Create outreach drafts for each reference

**Output:** `/deals/<slug>/references/`
```
references/
├── candidates.md        # List of people to contact
├── questions.md         # Tailored questions
└── feedback/
    ├── ref-1-name.md    # Notes from each call
    └── ref-2-name.md
```

---

### 11. FULL MEMO ✅ EXISTS

**Command:** `/cyber-memo "Company"`

Already implemented with comprehensive template.

---

### 12. IC DECISION ❌ NEW

**Command:** `/cyber-ic-decision "Company" <invest|pass|more-info>`

**Does:**
1. Update deal status
2. Log decision rationale
3. Archive if passed, or trigger next steps if invested

**Output:** Updates `/deals/<slug>/.cybos/context.md`
```markdown
## IC Decision
**Date:** 2026-01-16
**Verdict:** INVEST
**Rationale:** Strong team, clear moat, reasonable valuation
**Terms:** $500K at $15M cap
**Next Steps:** Send term sheet, schedule legal call
```

---

## Summary: What to Build

### New Commands (6)

| Command | Purpose | Priority |
|---------|---------|----------|
| `/cyber-intake` | Parse any input, create deal | HIGH |
| `/cyber-fit-check` | Score vs thesis criteria | HIGH |
| `/cyber-team-score` | Founder evaluation | HIGH |
| `/cyber-temp-check` | Light memo for IC | MEDIUM |
| `/cyber-references` | Reference check workflow | MEDIUM |
| `/cyber-ic-decision` | Log final decision | LOW |

### New Scripts (2)

| Script | Purpose | Priority |
|--------|---------|----------|
| `scripts/parse-deck.ts` | Extract data from PDF/DocSend | HIGH |
| Contact finder in outreach | Exa people search integration | MEDIUM |

### Enhancements to Existing

| Component | Enhancement | Priority |
|-----------|-------------|----------|
| Deal context | Add `status` field + contacts | HIGH |
| `/cyber-outreach` | Add contact finder before draft | MEDIUM |
| Investment philosophy | Structure as scorable criteria | HIGH |

### New Context Files (2)

| File | Purpose |
|------|---------|
| `context/thesis-criteria.md` | Structured, scorable fund fit criteria |
| `context/team-scorecard-template.md` | Founder evaluation framework |

---

## Out of Scope

- **Cyber Researcher**: Proactive sourcing from Twitter (separate product)
- **Full automation**: Human in loop for meetings, IC decisions
- **Portfolio monitoring**: Post-investment tracking (future phase)
