# Research Skill Improvement Proposal (REVISED)

**Date**: 2026-01-02 (Revised 2026-01-02)
**Status**: Planning - Ready for Implementation
**Based on**:
- Claude Skills Best Practices (https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- Claude Code Sub-agents Guide (https://code.claude.com/docs/en/sub-agents)

## Executive Summary

Complete refactor of the Research skill to align with Claude Skills best practices AND Claude Code sub-agents best practices. This harmonizes the Research skill with existing research agents, adds evaluation framework, implements debug logging, and expands to 4 research types (company, tech, market, **topic**).

**Key Changes**:
- ✅ Eval framework created (4 eval files)
- 🔧 Fix missing YAML frontmatter in Research/SKILL.md (CRITICAL)
- 🔧 Harmonize 6 research agents with Research skill (auto-load skill via `skills:` field)
- 🔧 Standardize agent output format (emoji-based)
- 🔧 Add debug logging to `.cybos/logs/research-debug/` and `.cybos/logs/mcp-usage/`
- 🔧 Run baseline evals and save results to `evals/baseline/`
- 🔧 Create topic research workflow + topic-researcher agent
- 🔧 Refactor for progressive disclosure (optional Phase 4)

## Current Issues Identified

### CRITICAL (Blocks Proper Function)

1. **Missing YAML Frontmatter** - Research/SKILL.md has no frontmatter
   - Impact: Claude cannot properly discover/trigger skill
   - Fix: Add name + description with "when to use"

2. **No Evaluation Framework**
   - Impact: Can't validate improvements or catch regressions
   - Fix: ✅ Created 4 eval files in `.claude/skills/Research/evals/`

### HIGH Priority

3. **Agents Not Harmonized with Research Skill**
   - Current: 6 agents exist (`.claude/agents/`) but don't auto-load Research skill
   - Required: Add `skills: research` to agent frontmatter for automatic skill loading
   - Impact: Agents work in isolation from Research skill context

4. **No Standardized Agent Output**
   - Current: Inconsistent agent outputs, no structured format
   - Required: Emoji-based format from Rolling-to-do.md with completion signals
   - Impact: Harder to parse, missing [AGENT:name] completion tags

5. **No Debug Logging System**
   - Current: Silent failures in agents/MCPs
   - Required: Separate logs in `.cybos/logs/research-debug/` and `.cybos/logs/mcp-usage/`
   - Impact: Can't debug when things fail, poor observability

### MEDIUM Priority

6. **No Topic Research Type**
   - Current: Only company, tech, market
   - Missing: Research for people, ideas, concepts (for content)
   - Impact: Can't research topics for essays/tweets

7. **Repetitive Workflow Content**
   - Current: Each workflow repeats investment lens, MCP strategy
   - Better: Progressive disclosure with shared/ directory
   - Impact: Token waste, harder to maintain

## Research Type Taxonomy (Final)

| Type | Purpose | Output Location | Example Queries |
|------|---------|-----------------|-----------------|
| **company** | Due diligence for investment | `/deals/<company>/research/` | "Anthropic", "Cursor" |
| **tech** | Technology deep-dive | `/research/<tech>/` | "TEEs", "World models" |
| **market** | Market/sector analysis | `/research/<market>/` | "AI Infrastructure" |
| **topic** | Ideas, people, narratives for content | `/research/topics/<topic>/` | "Post-labor economy", "Vitalik's coordination thinking" |

## Evaluation Framework (✅ COMPLETED)

Created 4 evaluation files:

### `.claude/skills/Research/evals/`
```
evals/
├── company-research-eval.json    # Test: Research Anthropic
├── tech-research-eval.json       # Test: Research TEEs
├── market-research-eval.json     # Test: Research AI Infrastructure
├── topic-research-eval.json      # Test: Research post-labor economy
└── README.md                     # How to run evals
```

**Next Step**: Run baseline evals BEFORE making any changes.

## Implementation Plan

### Phase 1: Critical Fixes (Week 1)

#### 1.1 Add YAML Frontmatter (5 minutes)
**File**: `.claude/skills/Research/SKILL.md`

```yaml
---
name: research
description: Comprehensive investment research (company DD, technology deep-dives, market analysis, topic exploration) for the organization. Use when user requests research on companies, technologies, markets, or topics for investment evaluation.
---
```

#### 1.2 Run Baseline Evals (1-2 hours)
- Run all 4 evals manually
- Document baseline performance
- Save baseline outputs to `evals/baseline/`
- Identify specific gaps

### Phase 2: Logging & Format (Week 2)

#### 2.1 Create Logging System (3-4 hours)
**New file**: `.claude/skills/Research/utils/logger.md`

Logging format for workflows:
```markdown
## Agent Execution Log

### [Agent Name] - [Status: ✅ Success | ⚠️ Partial | ❌ Failed]
**Started**: HH:MM:SS
**Completed**: HH:MM:SS
**Duration**: Xs
**Output**: [Summary or error]

### MCP Call Log

**Tool**: mcp__parallel-task__createTask
**Status**: ✅ Success
**Duration**: Xs
**Result**: [task_id or error]
```

Store in: `.cybos/logs/debug/MMDD-research-debug-YY.md`

#### 2.2 Create Tool-Hook (2-3 hours)
**New file**: `.claude/hooks/tool-logger.ts`

Logs to: `.cybos/logs/tool-usage/MMDD-YY.json`

Format:
```json
{
  "timestamp": "2026-01-02T10:30:45Z",
  "tool": "mcp__perplexity__search",
  "status": "success",
  "duration_ms": 1234,
  "error": null
}
```

#### 2.3 Update Agent Output Format (1-2 hours)
Update all 5 agents to use standardized format:

**Files to update**:
- `.claude/agents/company-researcher.md`
- `.claude/agents/market-researcher.md`
- `.claude/agents/financial-researcher.md`
- `.claude/agents/team-researcher.md`
- `.claude/agents/tech-researcher.md`

**New output format**:
```markdown
📅 2026-01-02
**📋 SUMMARY:** [Brief overview of research task and findings]
**🔍 ANALYSIS:** [Key insights discovered through research]
**⚡ ACTIONS:** [Research steps taken, sources consulted, verification performed]
**✅ RESULTS:** [The research findings and answers]
**📊 STATUS:** [Confidence level in findings, limitations, caveats]
**➡️ NEXT:** [Recommended follow-up research or actions]
**🎯 COMPLETED:** [AGENT:agent-name] completed [task in 5-6 words]
```

### Phase 3: New Workflow (Week 2-3)

#### 3.1 Create Topic Research Workflow (2-3 hours)
**New file**: `.claude/skills/Research/workflows/topic.md`

Similar structure to tech.md but optimized for:
- People research (founders, thought leaders)
- Ideas/concepts (economics, philosophy, ML theory)
- Narratives (emerging themes for content)
- Content-ready insights (for essays/tweets)

**Agents used**:
- 2-3 parallel agents (topic-specific or reuse existing)
- Synthesizer focuses on content readiness + investment connection

#### 3.2 Create Topic Researcher Agent (optional, 1 hour)
**New file**: `.claude/agents/topic-researcher.md`

Specialized for:
- Multi-disciplinary synthesis
- Academic + industry perspectives
- Content-ready insights
- Connection to thesis

### Phase 4: Progressive Disclosure (Week 3)

#### 4.1 Create Shared Content Directory
**New structure**:
```
Research/
├── SKILL.md (<200 lines, main entry point)
├── shared/
│   ├── investment-lens.md      # organization rubric
│   ├── mcp-strategy.md         # Tiered MCP approach
│   ├── error-handling.md       # How to handle failures
│   └── output-standards.md     # File naming, locations
└── workflows/
    ├── company.md (leaner, references shared/)
    ├── tech.md
    ├── market.md
    └── topic.md
```

#### 4.2 Add TodoWrite Checklists to Workflows
Each workflow starts with:
```markdown
## Workflow Checklist

Copy this and track progress using TodoWrite:

``Research Progress:
- [ ] Step 1: GATHER (parallel MCP calls)
- [ ] Step 2: ANALYZE (parallel agents)
- [ ] Step 3: SYNTHESIZE (consolidate)
- [ ] Step 4: OUTPUT (save report)
- [ ] Step 5: LOG (append to daily log)
``
```

### Phase 5: Documentation (Week 4)

#### 5.1 Update CLAUDE.md
**Sections to update**:
- Add tool-hook documentation
- Add logging system documentation
- Add eval framework usage
- Update research types (add "topic")
- Document standardized agent output format
- Add debugging guide

#### 5.2 Re-run Evals & Iterate
- Run all 4 evals again
- Compare to baseline
- Document improvements
- Fix remaining gaps
- Iterate until evals pass

## Proposed File Structure (After Implementation)

```
.claude/
├── skills/
│   └── Research/
│       ├── SKILL.md (✅ with YAML frontmatter)
│       ├── evals/ (✅ created)
│       │   ├── company-research-eval.json
│       │   ├── tech-research-eval.json
│       │   ├── market-research-eval.json
│       │   ├── topic-research-eval.json
│       │   ├── baseline/ (outputs from baseline runs)
│       │   └── README.md
│       ├── shared/ (🔧 to create)
│       │   ├── investment-lens.md
│       │   ├── mcp-strategy.md
│       │   ├── error-handling.md
│       │   └── output-standards.md
│       ├── utils/ (🔧 to create)
│       │   └── logger.md
│       └── workflows/
│           ├── company.md (🔧 update)
│           ├── tech.md (🔧 update)
│           ├── market.md (🔧 update)
│           └── topic.md (🔧 NEW)
├── agents/
│   ├── company-researcher.md (🔧 update format)
│   ├── market-researcher.md (🔧 update format)
│   ├── financial-researcher.md (🔧 update format)
│   ├── team-researcher.md (🔧 update format)
│   ├── tech-researcher.md (🔧 update format)
│   └── topic-researcher.md (🔧 optional NEW)
└── hooks/
    └── tool-logger.ts (🔧 to create)

.cybos/
└── logs/
    ├── MMDD-YY.md (existing)
    ├── debug/ (🔧 NEW)
    │   └── MMDD-research-debug-YY.md
    └── tool-usage/ (🔧 NEW)
        └── MMDD-YY.json
```

## Impact Assessment

### Benefits
- ✅ Proper skill discovery (YAML frontmatter)
- ✅ Measurable quality (eval framework)
- ✅ Debug visibility (logging system)
- ✅ Content research capability (topic workflow)
- ✅ Consistent outputs (standardized format)
- ✅ Better maintainability (progressive disclosure)

### Risks
- ⚠️ Breaking changes to agent output format
- ⚠️ Increased complexity (more files)
- ⚠️ Migration effort (updating existing workflows)

### Mitigation
- Run baseline evals first
- Implement incrementally (phase by phase)
- Test after each phase
- Keep backward compatibility where possible

## Next Steps - Awaiting Your Approval

**Option A: Full Implementation** (4 weeks)
- Implement all phases in order
- Most comprehensive improvement
- Highest quality outcome

**Option B: Critical Path Only** (1-2 weeks)
- Phase 1: YAML frontmatter + baseline evals
- Phase 2: Logging + agent format
- Phase 3: Topic workflow only
- Skip: Progressive disclosure (keep current structure)

**Option C: Minimal Viable** (1 week)
- YAML frontmatter (5 min)
- Baseline evals (2 hours)
- Topic workflow (2-3 hours)
- Skip: Logging, format changes, refactoring

## My Recommendation

**Start with Option B (Critical Path)** because:
1. Fixes the blocker (YAML frontmatter)
2. Establishes evals for validation
3. Adds debug visibility (logging)
4. Delivers topic research (your immediate need)
5. Defers nice-to-have (progressive disclosure)

Then optionally do Phase 4 later if needed.

---

## Questions for You

1. **Which option do you prefer?** (A, B, or C)

2. **When should I start implementation?** (now, after you review, other timing)

3. **Should I run baseline evals first** before implementing anything? (recommended)

4. **For logging**: Do you want verbose (full request/response) or standard (success/failure only)?

5. **Breaking changes**: OK to change agent output format? (will affect existing workflows)

Let me know which direction you'd like to go!
