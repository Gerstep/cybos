# Research Skill Implementation Summary

**Branch**: `research-skill-improvements`
**Date Started**: 2026-01-02
**Status**: In Progress

## Completed

✅ **Phase 0: Baseline Evaluation**
- Created baseline directory
- Copied 3 baseline eval outputs:
  - `company-anthropic-2026-01-02.md`
  - `tech-tees-2026-01-02.md`
  - `market-ai-infra-2026-01-02.md`
- Git branch created: `research-skill-improvements`

✅ **Design Documents**
- Created `/docs/research-skill-improvement-proposal-v2.md`
- Created `/docs/research-intensity-design.md`

## Key Features Being Implemented

### 1. Research Intensity System (NEW)

3-tier system for speed/cost/quality tradeoffs:

| Level | Speed | Tools | Use When |
|-------|-------|-------|----------|
| **Quick** | 10-30s | WebSearch + WebFetch only | Quick validation, browsing |
| **Standard** | 2-5m | MCPs + 3-4 agents | Regular DD (DEFAULT) |
| **Deep** | 5-15m | Deep MCPs + 5-6 agents | Pre-IC, critical decisions |

**User can specify**:
- Explicit: `/cyber-research-company "Acme" --quick`
- Inferred: "Quick check on Acme" → Quick mode

**Claude must announce** intensity at start:
```
🔍 **QUICK RESEARCH** (Level 1: Built-in tools, 10-30 sec)
🔬 **STANDARD RESEARCH** (Level 2: Agents + MCPs, 2-5 min)
🔎 **DEEP RESEARCH** (Level 3: Deep tools, 5-15 min)
```

### 2. Skill/Agent Harmonization

- Add `skills: research` to all 6 agents
- Agents auto-load Research skill context
- Modern `tools:` format replaces `permissions:`

### 3. Shared Content Directory

Progressive disclosure pattern:
- `shared/investment-lens.md`
- `shared/mcp-strategy.md`
- `shared/error-handling.md`
- `shared/output-standards.md`
- `shared/intensity-tiers.md` (NEW)

### 4. Logging System

Debug visibility:
- `.cybos/logs/research-debug/MMDD-HH-MM-research-YY.md`
- `.cybos/logs/mcp-usage/MMDD-YY.jsonl`

### 5. Standardized Agent Output

Emoji-based format with completion signals:
```markdown
📅 MMDD-YY
**📋 SUMMARY:** ...
**🎯 COMPLETED:** [AGENT:name] completed [task]
```

### 6. Topic Research (4th Type)

New research type for ideas, people, narratives:
- `/cyber-research-topic` command
- `topic-researcher` agent
- Output: `/research/topics/<topic>/`

---

## Implementation Phases

### Phase 1: Critical Fixes (30 min) ⏳
- [ ] Add YAML frontmatter to Research/SKILL.md
- [ ] Harmonize 6 agents (add `skills: research`, update frontmatter)

### Phase 2: Shared Content (2-3 hours) ⏳
- [ ] Create `shared/` directory
- [ ] Create 5 shared reference files (including `intensity-tiers.md`)
- [ ] Update SKILL.md with "Common References" section
- [ ] Update workflows to reference shared content
- [ ] Add 3-tier structure to each workflow (quick/standard/deep)

### Phase 3: Logging (3-4 hours) ⏳
- [ ] Create logging directories
- [ ] Create `shared/logging.md` utility
- [ ] Update workflows with logging calls

### Phase 4: Agent Output Format (1-2 hours) ⏳
- [ ] Update 5 agents with emoji-based output
- [ ] Add completion signals

### Phase 5: Topic Research + Intensity (3-4 hours) ⏳
- [ ] Create `topic-researcher` agent
- [ ] Create `topic` workflow with 3 tiers
- [ ] Create `/cyber-research-topic` command
- [ ] Update all 4 commands to parse intensity flags
- [ ] Implement intensity inference logic

### Phase 6: Documentation (1-2 hours) ⏳
- [ ] Update CLAUDE.md with:
  - 3-tier intensity system
  - 4 research types (add topic)
  - Agent harmonization
  - Logging system
  - Shared content structure
- [ ] Re-run evals at different intensity levels
- [ ] Document results

---

## File Structure (After Implementation)

```
.claude/
├── skills/
│   └── Research/
│       ├── SKILL.md (+ YAML + Common References links + intensity inference)
│       ├── evals/
│       │   ├── baseline/ (✅ 3 files copied)
│       │   └── *.json
│       ├── shared/
│       │   ├── investment-lens.md
│       │   ├── mcp-strategy.md
│       │   ├── error-handling.md
│       │   ├── output-standards.md
│       │   ├── intensity-tiers.md (NEW)
│       │   └── logging.md
│       └── workflows/
│           ├── company.md (3-tier: quick/standard/deep)
│           ├── tech.md (3-tier)
│           ├── market.md (3-tier)
│           └── topic.md (NEW, 3-tier)
├── agents/
│   ├── company-researcher.md (+ skills field + output format)
│   ├── market-researcher.md
│   ├── financial-researcher.md
│   ├── team-researcher.md
│   ├── tech-researcher.md
│   ├── synthesizer.md (+ skills field)
│   └── topic-researcher.md (NEW)
└── commands/
    ├── cyber-research-company.md (+ intensity parsing)
    ├── cyber-research-tech.md (+ intensity parsing)
    ├── cyber-research-market.md (+ intensity parsing)
    └── cyber-research-topic.md (NEW, + intensity parsing)

.cybos/logs/
├── MMDD-YY.md (existing)
├── research-debug/ (NEW)
│   └── MMDD-HH-MM-research-YY.md
└── mcp-usage/ (NEW)
    └── MMDD-YY.jsonl
```

---

## Testing Strategy

After implementation, test each research type at each intensity level:

### Company Research
- [ ] Quick: `/cyber-research-company "Anthropic" --quick`
- [ ] Standard: `/cyber-research-company "Anthropic"`
- [ ] Deep: `/cyber-research-company "Anthropic" --deep`

### Tech Research
- [ ] Quick: `/cyber-research-tech "TEEs" --quick`
- [ ] Standard: `/cyber-research-tech "TEEs"`
- [ ] Deep: `/cyber-research-tech "TEEs" --deep`

### Market Research
- [ ] Quick: `/cyber-research-market "AI Infrastructure" --quick`
- [ ] Standard: `/cyber-research-market "AI Infrastructure"`
- [ ] Deep: `/cyber-research-market "AI Infrastructure" --deep`

### Topic Research (NEW)
- [ ] Quick: `/cyber-research-topic "post-labor economy" --quick`
- [ ] Standard: `/cyber-research-topic "post-labor economy"`
- [ ] Deep: `/cyber-research-topic "post-labor economy" --deep`

---

## Success Criteria

- ✅ All 3 intensity levels working for all 4 research types
- ✅ Intensity correctly inferred from user queries
- ✅ Intensity announcement always shown
- ✅ Agents auto-load Research skill
- ✅ Emoji-based output from all agents
- ✅ Debug logs created for each research run
- ✅ Shared content reduces workflow redundancy
- ✅ Topic research fully functional
- ✅ CLAUDE.md reflects all changes

---

## Timeline

**Estimated**: 12-15 hours total
**Target completion**: Within 3 days

---

## Current Status

📍 **Next action**: Begin Phase 1 (Add YAML frontmatter + Harmonize agents)
