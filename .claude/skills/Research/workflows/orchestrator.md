# Research Orchestrator

Universal research workflow for all research types (company, technology, market, topic).

---

## CRITICAL RULES (read before every research session)

1. **SINGLE WORKSPACE DIRECTORY**: All research output for a session MUST go into ONE workspace directory. Create it in Phase 1.3, pass the absolute path to every agent. No exceptions.

2. **NEVER BYPASS THIS ORCHESTRATOR**: Even for ad-hoc or freeform research requests (e.g., "read this call and research the topic"), you MUST follow this workflow. Create the workspace FIRST, then launch agents with the workspace path.

3. **AGENTS MUST NOT CREATE DIRECTORIES**: Sub-agents receive a workspace path and write ONLY to that path. They must NEVER create their own research directories. If an agent prompt does not include an explicit workspace path, the orchestrator is being used incorrectly.

4. **FOLLOW-UP WORK USES SAME DIRECTORY**: If a research session triggers additional research (deeper dives, follow-ups, new angles), all outputs go into the SAME workspace's `raw/` directory. Never create a second workspace for the same research topic.

---

## Overview

This orchestrator:
1. Identifies research type and intensity
2. Creates workspace directory
3. Selects appropriate agents dynamically
4. Spawns agents in parallel (autonomous MCP usage)
5. Reviews quality (deep mode only)
6. Synthesizes findings
7. Outputs consolidated report

**Key principle**: Agents do ALL data gathering. Main session orchestrates, agents execute.
**Key principle**: ONE workspace directory per research session. All agents write there.

---

## Phase 1: INITIALIZE

### 1.1 Identify Research Type

Based on user request or slash command:

| Research Type | Trigger | Example |
|---------------|---------|---------|
| **Company DD** | `/cyber-research-company` or company name | "Acme Corp", "Research Anthropic" |
| **Technology** | `/cyber-research-tech` or tech topic | "Trusted Execution Environments", "AI agents" |
| **Market** | `/cyber-research-market` or market/sector | "AI Infrastructure", "Robotics market" |
| **Topic (Content)** | `/cyber-research-topic` or content topic | "AI second-order effects", "Agent economy" |
| **Topic (Investment)** | Content topic with investment angle | "AI infrastructure opportunities" |

### 1.2 Determine Intensity Level

**Flags**: `--quick`, `--standard`, `--deep`

If no flag provided, infer from context:
- Quick: "quick look", "brief overview", "what is X"
- Deep: "comprehensive", "deep dive", "memo-ready"
- Standard: DEFAULT (everything else)

| Level | Duration | Agents | Feedback Loop | Use Case |
|-------|----------|--------|---------------|----------|
| **Quick** | 10-30s | 1 agent | No | Fast fact-check, validation |
| **Standard** | 2-5m | 2-3 agents | No | Normal research (DEFAULT) |
| **Deep** | 5-15m | 3-5 agents | Yes (1 iteration) | Memo-ready, comprehensive |

### 1.3 Create Workspace

**Company research:**
```
~/CybosVault/private/deals/<company-slug>~/CybosVault/private/research/MMDD-<slug>-YY/
├── raw/                  # Agent outputs go here
└── report.md            # Final synthesis (created at end)
```

**Tech/Market/Topic research:**
```
~/CybosVault/private/research/<category>/<slug>/MMDD-<slug>-YY/
├── raw/                  # Agent outputs go here
└── report.md            # Final synthesis (created at end)
```

**Naming:**
- Company slug: kebab-case from name ("Acme Corp" → `acme-corp`)
- Topic slug: kebab-case from topic ("AI Agents" → `ai-agents`)
- Timestamp: MMDD-<slug>-YY format

**Actions:**
1. Create workspace directory with `/raw/` subdirectory
2. Pass workspace path to all agents

### 1.4 Select Agents

Load agent selection matrix from `@.claude/skills/Research/shared/agent-selection-matrix.md`.

**Selection rules:**
- Quick: 1 primary agent
- Standard: 2-3 agents (core dimensions)
- Deep: 3-5 agents + quality-reviewer

See matrix for specific agent combinations per research type.

---

## Phase 2: GATHER (Parallel Agent Execution)

### 2.1 Spawn Agents in Parallel

Launch selected agents with:

```
Task: [agent-name]
Prompt: "Research [target] focusing on [agent's domain].

**Workspace**: [workspace-path]
**Output to**: [workspace-path]/raw/agent-[agent-name].md

⚠️ CRITICAL: Write ALL output to the workspace path above. Do NOT create any new directories outside this workspace. Do NOT create your own research folder structure. Your ONLY output file is [workspace-path]/raw/agent-[agent-name].md.

**Research target**: [company name | tech topic | market sector | content topic]

**Specific questions** (if any):
- [Question 1]
- [Question 2]

You have access to all MCP tools. Make your own calls to gather comprehensive data. Save your findings to the workspace path provided using standardized emoji format (see shared/output-standards.md)."
```

**Key points:**
- Each agent receives the ABSOLUTE workspace path
- Each agent makes its own MCP calls (autonomous)
- Each agent writes ONLY to `/raw/agent-[name].md` inside the workspace
- Agents run in parallel (no coordination)
- Agents MUST NOT create directories outside the workspace

### 2.2 Wait for Completion

Wait for ALL agents to complete before proceeding.

**If agent fails:**
- Note failure in log
- Continue with remaining agents
- Flag incomplete research in synthesis

---

## Phase 3: REVIEW (Deep Mode Only)

**Skip this phase** if intensity is Quick or Standard.

### 3.1 Launch Quality Reviewer

```
Task: quality-reviewer
Prompt: "Review research outputs for [target].

**Workspace**: [workspace-path]
**Agent outputs**: [workspace-path]/raw/agent-*.md

Read all agent outputs and assess:
1. Completeness - are all key dimensions covered?
2. Contradictions - do agents report conflicting data?
3. Gaps - what critical information is missing?
4. Depth - are claims backed by evidence?

If quality is insufficient, identify specific follow-up questions for specific agents.

Save your review to: [workspace-path]/raw/agent-quality-reviewer.md"
```

### 3.2 Process Quality Review

Read quality-reviewer output.

**If follow-ups identified:**

1. Parse follow-up tasks (agent + question pairs)
2. Re-spawn specific agents with refined prompts:

```
Task: [agent-name]
Prompt: "Follow-up research on [target].

**Original output**: [workspace-path]/raw/agent-[agent-name].md
**Workspace**: [workspace-path]
**Output to**: [workspace-path]/raw/agent-[agent-name]-followup.md

**Specific question to answer**:
[Question from quality-reviewer]

Review your original output and address this specific gap. Make additional MCP calls as needed."
```

3. Wait for follow-up agents to complete
4. **Limit**: Maximum 1 iteration (no further quality reviews)

**If quality is Complete:**
- Skip to Phase 4 (Synthesize)

---

## Phase 4: SYNTHESIZE

### 4.1 Launch Synthesizer

```
Task: synthesizer
Prompt: "Consolidate research on [target] into unified report.

**Research type**: [Company | Technology | Market | Topic-Content | Topic-Investment]
**Intensity**: [Quick | Standard | Deep]
**Workspace**: [workspace-path]
**Agent outputs**: [workspace-path]/raw/agent-*.md (read ALL files)

Apply appropriate lens:
- Company/Market: Investment lens (cyber•Fund rubric)
- Technology: Investment + technical lens
- Topic-Content: Content creation angle (narratives, people, ideas)
- Topic-Investment: Investment opportunities in topic

Read all agent outputs (including follow-ups if present) and create comprehensive, actionable report with:
- Executive Summary
- [Type-specific sections]
- Investment Lens (if applicable)
- Key Findings (Strengths, Concerns, Open Questions)
- Conclusion with next steps

Save synthesis to: [workspace-path]/report.md"
```

### 4.2 Wait for Synthesizer

Wait for synthesizer to complete.

**Output**: `[workspace-path]/report.md` - final deliverable

---

## Phase 5: OUTPUT

### 5.1 Verify Outputs

Check that files exist:
- `[workspace]/raw/agent-*.md` - all agent outputs
- `[workspace]/report.md` - synthesis

### 5.2 Update Deal Context (Company Only)

If research type is Company:
- Check if `~/CybosVault/private/deals/<company>/index.md` exists
- If NOT exists: create from template with basic info from research
- If exists: optionally update with new findings

### 5.3 Log Completion

Append to `~/CybosVault/private/.cybos/logs/MMDD-YY.md`:

```markdown
## HH:MM | research | [type] | [subject]
- Workflow: orchestrator
- Intensity: [Quick | Standard | Deep]
- Duration: [Xm Ys]
- Output: [workspace-path]/report.md
- Agents: [agent1, agent2, agent3, ...] ([success-count]/[total-count] success)
- Feedback loops: [0 | 1] iterations
- Confidence: [High | Medium | Low]

---
```

---

## Error Handling

### Agent Failures

**If agent times out or fails:**
1. Log failure details
2. Continue with available agents
3. Note limitation in synthesis
4. Flag as incomplete in log

### Missing Data

**If agents return insufficient data:**
1. Quality-reviewer identifies gaps (deep mode)
2. Follow-up iteration attempts to fill gaps
3. If still insufficient: flag in synthesis
4. Recommend manual follow-up

### MCP Failures

**If MCP tools fail:**
- Agents handle fallbacks internally
- Log which MCPs failed
- Note data quality concerns to user

---

## Reference Files

Load on-demand during execution:

- `@.claude/skills/Research/shared/agent-selection-matrix.md` - Agent selection rules
- `@.claude/skills/Research/shared/intensity-tiers.md` - Intensity specifications
- `@.claude/skills/Research/shared/investment-lens.md` - Investment rubric (if applicable)
- `@.claude/skills/Research/shared/output-standards.md` - Emoji format standards
- `@.claude/skills/Research/shared/mcp-strategy.md` - MCP usage guidelines

---

## Success Criteria

- [ ] Workspace created with correct structure
- [ ] Appropriate agents selected based on type and intensity
- [ ] All agents completed (or failures logged)
- [ ] Quality review completed (deep mode only)
- [ ] Synthesis created with appropriate lens
- [ ] All outputs saved to workspace
- [ ] Log entry appended
- [ ] Deal context updated (company research only)

---

## Duration Estimates

| Intensity | Expected Duration |
|-----------|-------------------|
| Quick | 10-30 seconds |
| Standard | 2-5 minutes |
| Deep | 5-15 minutes |

Actual duration depends on:
- Agent count
- MCP response times
- Follow-up iterations (deep mode)
- Synthesis complexity
