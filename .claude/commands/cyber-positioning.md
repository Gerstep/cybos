---
name: cyber-positioning
description: Guide a company through a structured positioning statement exercise with competitive research, strategic questions, team alignment, and synthesis.
---

Run the Positioning skill to help a company define their positioning statement.

**Workflow:** `.claude/skills/Positioning/SKILL.md`

**Usage:**
- `/cyber-positioning` — start fresh, will ask for company info
- `/cyber-positioning <company-name>` — start with a company (checks deals folder for context)
- `/cyber-positioning <company-name> --collect` — skip to Phase 5 (user has team replies ready to paste)

**Arguments:**
- Company name: optional, will check `~/CybosVault/private/deals/<slug>/` for existing research
- `--collect`: jump to synthesis phase (assumes questions were already sent to team)

**Process:**

1. **LOAD SKILL**: Read `.claude/skills/Positioning/SKILL.md`
2. **PARSE ARGUMENTS**: Check if company name provided, look for existing deal context
3. **EXECUTE PHASE 1** (Context): Gather company info via AskUserQuestion
4. **EXECUTE PHASE 2** (Research): Launch 2 parallel agents for competitive landscape
5. **EXECUTE PHASE 3** (Questions): Present 4 forced-choice positioning questions
6. **EXECUTE PHASE 4** (Team): Generate copy-paste exercise for team distribution
7. **EXECUTE PHASE 5** (Synthesis): Analyze team replies, identify alignment and contradictions
8. **EXECUTE PHASE 6** (Output): Generate final positioning statement under 200 words
9. **EXECUTE PHASE 7** (Iterate): Optional refinement of specific sections

**Key rules:**
- Never skip competitive research
- Never accept "all of the above" — force choices
- Never use unverifiable adjectives in final output
- Final positioning statement must be under 30 words
