---
name: Writing
description: Iterative critique and improvement of long-form content (guidebooks, playbooks, essays). Launches parallel judge subagents for multi-dimensional critique, synthesizes findings, presents proposals for user approval. Never edits without consent.
---

# Writing Skill

Iterative critique and improvement of long-form content. Parallel judges evaluate sections against acceptance criteria. User approves all changes.

## Architecture

```
USER: /cyber-writing <content-file> [--vision <file>] [--sources <files...>]
    │
    ▼
PHASE 1: INGEST                           (main session)
    Read content + vision + sources
    Parse into sections (## headings)
    User picks scope (all / specific sections)
    Write /tmp/writing-brief.md
    │
    ▼
PHASE 2: CRITIQUE                          (5 parallel subagents per section)
    ┌──────────┬──────────┬──────────┬──────────┬──────────┐
    │PRACTICAL │  DATA    │ LANGUAGE │SUBSTANCE │COMPLETE- │
    │  JUDGE   │FRESHNESS │  JUDGE   │  JUDGE   │NESS JUDGE│
    │          │  JUDGE   │          │          │          │
    │"Would a  │"Late-2025│"Sharp?   │"Actual   │"What's   │
    │CTO act   │or 2026   │Concise?  │insight   │missing?  │
    │on this?" │data?"    │No fluff?"│or common │What's    │
    │          │          │          │wisdom?"  │excess?"  │
    └────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘
         └──────────┴──────────┴──────────┴──────────┘
                               │
                    Each returns findings as task result
    │
    ▼
PHASE 3: SYNTHESIS                         (main session)
    Deduplicate + consolidate judge outputs into:
    ├── PROBLEMS  (what's wrong, with evidence + severity)
    ├── PROPOSALS (specific rewrites / additions / cuts)
    └── MISSING   (gaps that need new content)
    │
    ▼
PHASE 4: PRESENT                           (main session, interactive)
    Per proposal: Accept / Modify / I'll write it / Skip / Iterate
    │
    ├── Accept/Modify → PHASE 5
    ├── I'll write it → wait for user
    ├── Skip → next proposal
    └── Iterate → back to PHASE 2 for this section
    │
    ▼
PHASE 5: APPLY                             (main session)
    Edit file with accepted changes
    │
    ▼
PHASE 6: NEXT SECTION                      (loop)
    Repeat Phase 2-5 for next section in scope
    After all sections → summary of changes
```

## Invocation

Conversational or via command:

```
/cyber-writing <content-file> [--vision <file>] [--sources <file1> <file2> ...]
```

**Arguments:**
- `content-file`: Path to the content being critiqued (required)
- `--vision`: Vision/goal document for the project (optional but recommended)
- `--sources`: Source files the content was built from (optional, for cross-referencing)

**Examples:**
```
/cyber-writing ~/path/to/guidebook.md --vision ~/path/to/VISION.md
/cyber-writing ~/path/to/essay.md --sources ~/path/to/research.md ~/path/to/notes.md
```

If arguments are missing, ask the user for the content file path and whether there's a vision doc.

---

## Phase 1: Ingest

1. **Read content file** — the document being critiqued
2. **Read vision doc** (if provided) — the project's goal, audience, acceptance criteria
3. **Read source files** (if provided) — materials the content was built from
4. **Parse sections** — split by `##` headings. Each `##` heading = one section
5. **Present section list** to user with line counts
6. **User picks scope**:
   - `all` — critique every section sequentially
   - Section numbers — e.g., "1.1, 1.3, 2.4"
   - Range — e.g., "Part 2" or "sections 2.1-2.6"

### Write Handoff Brief

Write `/tmp/writing-brief.md` containing:

```markdown
# Writing Critique Brief

## Project
[1-2 sentences: what this content is, who it's for]

## Vision
[Summary of vision doc, or "No vision doc provided"]

## Acceptance Criteria
- Practical: reader can act on this immediately
- Data: claims use late-2025 or 2026 data with named sources
- Language: sharp, concise, no marketing fluff, no LLM-isms
- Substance: genuine insight, not restated common knowledge
- Complete: important angles covered, nothing excess

## Source Files
[List of source file paths, or "No source files provided"]

## Full Document TOC
[Table of contents with section headings and line numbers]
```

---

## Phase 2: Critique (Parallel Subagents)

For each section in scope, dispatch **5 judge subagents simultaneously** via the Task tool.

### Judge Dispatch

Each judge:
- **subagent_type**: `general-purpose`
- **model**: `sonnet` (fast, cheaper, sufficient for critique)
- **Prompt**: Built from template at `prompts/judge.md` with role-specific parameters from the dispatch table below
- **Context provided in prompt**: The section text (inline), the brief contents (inline), path to full document, paths to source files

### Dispatch Configuration

| # | JUDGE_ROLE | KEY_QUESTION | CRITERIA |
|---|-----------|-------------|----------|
| 1 | Practical Judge | "Would a CTO, COO, or engineering lead change their behavior after reading this section?" | Actionable advice with specific steps. Named tools, frameworks, or approaches. Clear "do this, not that" guidance. Concrete examples, not abstract principles. |
| 2 | Data Freshness Judge | "Is every claim backed by current (late-2025 or 2026) data from a named source?" | Every statistic has a named company/study and year. No "research shows" without citation. Data points are from 2025-2026 where possible. Pre-2024 data flagged as potentially outdated. Source annotations (<!-- Source: ... -->) match the claims. |
| 3 | Language Judge | "Is every sentence sharp, concise, and free of bullshit?" | No LLM-isms (see anti-pattern list). No marketing fluff or hollow declaratives. No hedging ("it could be argued", "one might say"). No filler transitions ("Moreover", "Furthermore"). Every sentence earns its place. Read-aloud test: sounds like a person talking, not a press release. |
| 4 | Substance Judge | "Is there actual insight here or just restated common knowledge?" | Original framing or analysis, not Wikipedia summaries. Specific mechanisms explained (HOW something works, not just THAT it exists). Counterarguments or nuances acknowledged. Would an expert learn something, or just nod along? |
| 5 | Completeness Judge | "What important angles are missing? What's said too much?" | Key counterarguments or risks not addressed. Important real-world examples missing. Sections that repeat content from other sections. Paragraphs that could be cut without losing information. Cross-references to other sections that should exist. |

### Anti-Pattern List (provided to Language Judge)

**Instant-fail words/phrases:**
- delve, leverage, tapestry, landscape, paradigm, synergy, holistic
- revolutionary, transformative, game-changing, cutting-edge, groundbreaking
- "It's important to note that", "It's worth mentioning"
- "In today's rapidly evolving", "In an era of"
- "This isn't X. It's Y." (hollow inversion pattern)
- "But here's the thing", "Here's the turn"
- "The implications are profound", "The opportunity is clear"
- Moreover, Furthermore, Additionally, Consequently
- "Let's delve into", "Let's explore", "Let's unpack"

**Structural anti-patterns:**
- Paragraphs longer than 4 sentences
- Vague attribution ("they say", "experts agree", "studies show")
- Dramatic mic-drop endings ("This isn't the future. It's the present.")
- Unnecessary qualifiers ("very", "really", "extremely", "incredibly")

---

## Phase 3: Synthesis

After all 5 judges return for a section:

1. **Read all judge outputs**
2. **Deduplicate** — multiple judges flagging the same issue consolidates into one finding with combined evidence
3. **Classify** each finding:
   - **PROBLEM**: Something wrong with existing text (with severity: Critical / Important / Minor)
   - **PROPOSAL**: A specific rewrite, addition, or cut (with the exact new text or description of change)
   - **MISSING**: A gap that needs new content (with description of what should be added)
4. **Rank** by severity: Critical first, then Important, then Minor
5. **Write synthesis** to `/tmp/writing-synthesis-{section-id}.md`

### Synthesis Format

```markdown
## Section [X.X]: [Title]

### Critical
1. **[Problem]** — [Judge(s)]
   Evidence: [quote from text]
   Proposal: [specific change]

### Important
1. **[Problem]** — [Judge(s)]
   Evidence: [quote from text]
   Proposal: [specific change]

### Minor
1. **[Problem]** — [Judge(s)]
   Proposal: [specific change]

### Missing
1. **[Gap description]** — [Judge(s)]
   Suggestion: [what to add and where]
```

---

## Phase 4: Present to User

Present the synthesis section-by-section. For each finding, offer choices via AskUserQuestion:

**For PROBLEMS with PROPOSALS:**
```
PROBLEM: [description with evidence]
PROPOSAL: [specific change]

Options:
1. Accept — apply this edit
2. Modify — "good direction but..." (user refines)
3. I'll write it — user will edit this themselves
4. Skip — leave as-is
```

**For MISSING items:**
```
MISSING: [gap description]
SUGGESTION: [what to add]

Options:
1. Draft it — generate the missing content for my review
2. I'll write it — user will add this themselves
3. Skip — not needed
```

**After all findings for a section:**
```
Options:
1. Move to next section
2. Re-critique this section (after user's manual edits)
3. Done — stop here
```

### Interaction Rules

- **Never batch-apply** — present one finding at a time for critical/important, batch minor findings
- **Show diffs** — when proposing changes, show the before/after clearly
- **Accept user rewrites** — if user provides their own text, use it exactly
- **Track changes** — maintain a running list of all accepted changes for the session summary

---

## Phase 5: Apply

For accepted changes:
1. Use the **Edit tool** to apply the change to the content file
2. Confirm the edit was applied
3. Move to next finding

For "Draft it" on missing items:
1. Generate the content in the response
2. Show it to the user for approval
3. If approved, use Edit or Write to insert it at the appropriate location

---

## Phase 6: Loop + Summary

After completing all sections in scope:

```markdown
## Session Summary

**Sections reviewed**: [list]
**Changes applied**: [count]
**Items skipped**: [count]
**Items for user to write**: [count]

### Changes Made
1. Section X.X: [brief description of change]
2. Section X.X: [brief description of change]
...

### Still Open
1. Section X.X: [user said they'd write this]
2. Section X.X: [gap identified, skipped]
```

---

## Key Principles

1. **Never edit without user approval** — propose, never impose
2. **Judges are brutally honest** — no praise filler, just problems and proposals
3. **Every critique has evidence** — quote the specific text that's problematic
4. **Proposals are concrete** — "rewrite X as Y", never "could be improved"
5. **Section-by-section** — one section fully resolved before moving to next
6. **Full context to subagents** — each judge gets vision doc, full document TOC, and the section text
7. **Model efficiency** — judges run on sonnet (fast, sufficient for critique)

---

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | This file — architecture and workflow |
| `prompts/judge.md` | Subagent prompt template for all 5 judges |

## Handoff Files

| File | Written By | Read By |
|------|-----------|---------|
| `/tmp/writing-brief.md` | Main (Phase 1) | All judges |
| `/tmp/writing-synthesis-{section}.md` | Main (Phase 3) | Main (Phase 4), preserved for context |

## Commands

| Command | Description |
|---------|-------------|
| `/cyber-writing` | Main entry point — critique and improve content |
