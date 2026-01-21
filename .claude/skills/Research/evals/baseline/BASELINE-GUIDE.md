# Baseline Evaluation Guide

**Date**: 2026-01-02
**Purpose**: Establish baseline performance before implementing improvements

## Instructions

Run these commands in order and save outputs to the files specified.

### Test 1: Company Research

**Command**:
```
/cyber-research-company "Anthropic"
```

**Expected behavior**:
- Loads company research workflow
- Executes parallel MCP calls
- Spawns 4 agents (company, market, financial, team)
- Synthesizes findings
- Saves to ~/CybosVault/private/deals/anthropic~/CybosVault/private/research/MMDD-<slug>-YY.md

**Save output to**: `company-anthropic-2026-01-02.md`

**Observe**:
- Did all steps complete?
- Were agents executed in parallel?
- Was investment lens applied?
- Is output well-structured?
- Any errors or failures?

---

### Test 2: Technology Research

**Command**:
```
/cyber-research-tech "Trusted Execution Environments"
```

**Expected behavior**:
- Loads tech research workflow
- Executes parallel MCP calls
- Spawns 3 agents (tech, market, financial)
- Synthesizes findings
- Saves to ~/CybosVault/private/research/trusted-execution-environments/MMDD-<slug>-YY.md

**Save output to**: `tech-tees-2026-01-02.md`

**Observe**:
- Technical depth achieved?
- Big Tech threat evaluated?
- Companies identified?
- Timing analysis present?

---

### Test 3: Market Research

**Command**:
```
/cyber-research-market "AI Infrastructure"
```

**Expected behavior**:
- Loads market research workflow
- Executes parallel MCP calls
- Spawns 3 agents (market, tech, financial)
- Synthesizes findings
- Saves to ~/CybosVault/private/research/ai-infrastructure/MMDD-<slug>-YY.md

**Save output to**: `market-ai-infra-2026-01-02.md`

**Observe**:
- Market sizing (TAM) provided?
- White spaces identified?
- Companies mapped?
- Investment opportunities surfaced?

---

### Test 4: Topic Research (Expected to FAIL)

**Command**:
```
/cyber-research-topic "post-labor economy"
```

**Expected result**: ERROR - Command doesn't exist yet

**Save error to**: `topic-post-labor-ERROR.txt`

This is expected - we haven't created topic research workflow yet.

---

## After Running Tests

1. **Copy outputs** to `.claude/skills/Research/evals/baseline/`
2. **Fill out RESULTS.md** with observations
3. **Proceed to Phase 1** once baseline is complete

## Next Steps

After baseline is documented:
- Phase 1: Add YAML frontmatter + harmonize agents
- Phase 2: Create shared content directory
- Phase 3: Add logging system
- Phase 4: Standardize agent output
- Phase 5: Create topic research
- Phase 6: Update docs + re-run evals
