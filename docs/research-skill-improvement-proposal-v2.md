# Research Skill Improvement Proposal V2

**Date**: 2026-01-02
**Status**: Ready for Implementation
**Based on**:
- Claude Skills Best Practices
- Claude Code Sub-agents Guide

## Executive Summary

Harmonize Research skill with existing research agents, add evaluation framework, implement debug logging, and expand to 4 research types (company, tech, market, **topic**).

**Completed**:
- ✅ Eval framework created (4 eval files in `.claude/skills/Research/evals/`)

**To Implement**:
- 🔧 Run baseline evals → save to `evals/baseline/`
- 🔧 Fix missing YAML frontmatter in Research/SKILL.md
- 🔧 Harmonize 6 research agents (add `skills: research`)
- 🔧 Standardize agent output format (emoji-based)
- 🔧 Add debug logging (`.cybos/logs/research-debug/` and `.cybos/logs/mcp-usage/`)
- 🔧 Create topic research workflow + topic-researcher agent

## Current State

### Existing Research Agents (`.claude/agents/`)
1. **company-researcher.md** - Business model, traction, team
2. **market-researcher.md** - TAM, dynamics, trends
3. **financial-researcher.md** - Funding, metrics, comparables
4. **team-researcher.md** - Founder backgrounds, assessment
5. **tech-researcher.md** - Technology deep-dives
6. **synthesizer.md** - Consolidates parallel research

### Issues Identified

**CRITICAL**:
1. Research/SKILL.md has no YAML frontmatter
2. No baseline evals run yet
3. Agents don't auto-load Research skill

**HIGH**:
4. No standardized agent output format
5. No debug logging system
6. No topic research capability

## Research Type Taxonomy

| Type | Purpose | Output | Example |
|------|---------|--------|---------|
| **company** | Due diligence | `/deals/<company>/research/` | "Anthropic" |
| **tech** | Technology deep-dive | `/research/<tech>/` | "TEEs" |
| **market** | Market analysis | `/research/<market>/` | "AI Infrastructure" |
| **topic** | Ideas/people for content | `/research/topics/<topic>/` | "Post-labor economy" |

## Implementation Plan

### Phase 0: Baseline (MUST DO FIRST - 2 hours)

#### 0.1 Create baseline directory
```bash
mkdir -p .claude/skills/Research/evals/baseline
```

#### 0.2 Run baseline evals
Execute manually BEFORE making changes:

```bash
# Test 1: Company research
/cyber-research-company "Anthropic"
# → Save to: evals/baseline/company-anthropic-2026-01-02.md

# Test 2: Tech research
/cyber-research-tech "Trusted Execution Environments"
# → Save to: evals/baseline/tech-tees-2026-01-02.md

# Test 3: Market research
/cyber-research-market "AI Infrastructure"
# → Save to: evals/baseline/market-ai-infra-2026-01-02.md

# Test 4: Topic research (will fail - no workflow)
/cyber-research-topic "post-labor economy"
# → Expected: Error (workflow doesn't exist yet)
```

#### 0.3 Document baseline results
Create `evals/baseline/RESULTS.md`:
- Which evals passed/failed?
- Quality indicators present?
- Failure indicators?
- Specific gaps?

This baseline establishes before/after comparison for improvements.

---

### Phase 1: Critical Fixes (30 min)

#### 1.1 Add YAML frontmatter to Research/SKILL.md

**File**: `.claude/skills/Research/SKILL.md`

Add at top:
```yaml
---
name: research
description: Comprehensive investment research (company DD, technology deep-dives, market analysis, topic exploration) for the organization. Use when user requests research on companies, technologies, markets, or topics for investment evaluation.
---
```

#### 1.2 Harmonize all 6 research agents

Update YAML frontmatter in all agents to auto-load Research skill.

**Files to update**:
- `.claude/agents/company-researcher.md`
- `.claude/agents/market-researcher.md`
- `.claude/agents/financial-researcher.md`
- `.claude/agents/team-researcher.md`
- `.claude/agents/tech-researcher.md`
- `.claude/agents/synthesizer.md`

**Current format** (example from company-researcher.md):
```yaml
---
name: company-researcher
description: Company-specific data gathering agent
model: haiku
permissions:
  allow:
    - WebFetch
    - Read
    - mcp__*
---
```

**New format**:
```yaml
---
name: company-researcher
description: Company-specific data gathering agent for business model, traction, and team research
tools: Read, WebFetch, Grep, Glob, Bash, mcp__perplexity__search, mcp__exa__search, mcp__firecrawl__scrape
model: haiku
skills: research
---
```

**Key changes**:
- Replace `permissions:` with `tools:` (modern format)
- Add `skills: research` to auto-load Research skill
- List specific MCP tools needed
- Keep `model: haiku` for speed/cost efficiency

**Apply to all 6 agents** with appropriate tool lists.

---

### Phase 2: Shared Content Directory (1-2 hours)

#### 2.1 Create shared content structure

```bash
mkdir -p .claude/skills/Research/shared
```

#### 2.2 Extract common content to shared files

**Create 4 shared reference files**:

**File 1**: `.claude/skills/Research/shared/investment-lens.md`
```markdown
# Investment Lens - the organization Rubric

All research must evaluate opportunities against these criteria:

## Core Investment Rubric

### 1. Market Opportunity (TAM)
- **Question**: Path to $1B+ revenue?
- **Not interesting**: Niche $50M ARR outcomes
- **Look for**: Market size that supports massive outcomes

### 2. Defensibility / Moat
- **Data moats**: Unique datasets or data network effects
- **Network effects**: Strong and growing
- **Technical moat**: Hard to replicate technology
- **Not defensible**: Pure "wrapper" plays Big Tech can replicate

### 3. Business Model Clarity
- **Clear revenue model**: Real business vs token speculation
- **Unit economics**: Path to profitability
- **Revenue > speculation**: Actual business model, not just token

### 4. Founder Profile
- **High energy**: Fast iteration velocity
- **Sales DNA**: Can sell the vision
- **Deep expertise**: Technical or domain depth
- **Track record**: Previous success (preferred but not required)

### 5. Market Timing ("Why Now?")
- **Catalyst**: What unlocked this opportunity?
- **Not too early**: Market ready for solution
- **Not too late**: Not saturated with competitors

### 6. Valuation
- **Reasonable for stage**: Not excessive
- **Room to grow**: Multiple expansion possible

### 7. Big Tech Threat
- **6-week rule**: Can OpenAI/Google/Apple build this in 6 weeks?
- **Infrastructure > Features**: Platform plays preferred
- **Not a wrapper**: Real innovation required

## Auto-Pass Triggers

Immediately flag these:
- Pure "wrapper" plays with no moat
- Media/entertainment in robotics
- Regional stablecoins
- Generic devtools without massive pain point
- Can Big Tech replicate in <6 weeks?

## Focus Areas (2025+)

### AI Infrastructure
- Training infrastructure (compute, data, tools)
- Inference optimization
- AI agents and orchestration
- Privacy and security (TEEs, confidential compute)

### Crypto/Blockchain
- Self-custodial finance
- Programmable markets
- Novel consensus mechanisms
- DeFi infrastructure

### Robotics
- Data collection and simulation
- Embodied AI
- Robotics-as-a-service
- Industrial automation

### Cross-sector
- Compute financialization
- Programmable economy infrastructure
- Automation platforms
```

**File 2**: `.claude/skills/Research/shared/mcp-strategy.md`
```markdown
# MCP Research Strategy

Use MCPs in this tiered order to optimize for speed and cost:

## Tier 1: Fast Search (seconds)
**Use for**: Quick facts, recent news, validation

**Tools**:
- `mcp__perplexity__search` - Fast search with citations
- `mcp__exa__search` - Web search, company discovery

**Example**:
```
mcp__perplexity__search
  query: "Anthropic funding history investors valuation"

mcp__exa__search
  query: "Anthropic"
  numResults: 10
```

## Tier 2: Deep Research (1-5 minutes)
**Use for**: Comprehensive reports, market analysis

**Tools**:
- `mcp__parallel-task__createTask` - Deep research reports
- `mcp__perplexity__research` - Comprehensive with deep mode

**Example**:
```
mcp__parallel-task__createTask
  prompt: "Conduct comprehensive research on [subject]..."

Poll with mcp__parallel-task__getTask until status: "completed"
```

## Tier 3: Targeted Extraction (as needed)
**Use for**: Specific URLs, batch processing

**Tools**:
- `mcp__firecrawl__scrape` - Specific URL content
- `mcp__exa__getContents` - Batch URL processing

**Example**:
```
mcp__firecrawl__scrape
  url: "https://company.com"
  formats: ["markdown"]
```

## Tier 4: Hard Scraping (last resort)
**Use for**: JavaScript-heavy sites, complex interactions

**Tools**:
- `mcp__playwright__*` - Browser automation

**Only use when**: Simpler methods fail

## Parallel Execution

Always run MCPs in parallel when possible:
```
[In single response, spawn multiple MCP calls]
- parallel-task createTask
- perplexity search
- exa search
- exa getContents (if URL known)
```

## Error Handling

If MCP fails:
- Continue with available data
- Note limitation in report
- Don't block entire research workflow
```

**File 3**: `.claude/skills/Research/shared/error-handling.md`
```markdown
# Error Handling - Research Workflows

## General Principles

1. **Don't block on single failure** - Continue with available data
2. **Note limitations** - Be explicit about gaps
3. **Degrade gracefully** - Partial results better than no results
4. **Log failures** - Track for debugging

## MCP Call Failures

### If parallel-task fails:
- Continue with perplexity/exa results
- Note in report: "Deep research unavailable, relied on search results"
- Still proceed to agent execution

### If perplexity search fails:
- Use exa results
- Note limitation
- Consider using firecrawl as fallback

### If exa search fails:
- Continue with parallel-task and perplexity
- May have fewer company/source links

## Agent Execution Failures

### If single agent times out:
- Use partial results from that agent
- Flag as "incomplete" in synthesis
- Note which aspects may be missing

### If agent returns error:
- Check error message
- Retry once if network-related
- Continue with other agents if retry fails

### If multiple agents fail:
- Still attempt synthesis with available data
- Clearly note what's missing
- Flag report as "preliminary/incomplete"

## Synthesis Failures

### If synthesizer fails:
- Save individual agent outputs
- Provide manual synthesis guidance
- List what needs to be consolidated

## Output Failures

### If file write fails:
- Try alternate location
- Report path in console
- Ensure user can retrieve results

## Logging Failures

### If debug log write fails:
- Don't block workflow
- Continue to daily log
- Note logging issue

## Best Practices

- **Fail gracefully**: Partial results > no results
- **Be transparent**: Always note what failed and why
- **Keep going**: Don't let single failure stop entire workflow
- **Document gaps**: User needs to know what's missing
```

**File 4**: `.claude/skills/Research/shared/output-standards.md`
```markdown
# Output Standards - File Naming & Locations

## File Naming Convention

Use kebab-case for all folder names:
- "Acme Corp" → `acme-corp`
- "AI Infrastructure" → `ai-infrastructure`
- "Post-Labor Economy" → `post-labor-economy`
- "Trusted Execution Environments" → `trusted-execution-environments`

## Output Locations

### Company Research
**Path**: `/deals/<company-slug>/research/MMDD-<slug>-YY.md`

**Example**: `/deals/anthropic/research/2026-01-02.md`

**Context file**: `/deals/<company-slug>/.cybos/context.md`

### Technology Research
**Path**: `/research/<tech-slug>/MMDD-<slug>-YY.md`

**Example**: `/research/trusted-execution-environments/2026-01-02.md`

**Context file**: `/research/<tech-slug>/.cybos/context.md`

### Market Research
**Path**: `/research/<market-slug>/MMDD-<slug>-YY.md`

**Example**: `/research/ai-infrastructure/2026-01-02.md`

**Context file**: `/research/<market-slug>/.cybos/context.md`

### Topic Research
**Path**: `/research/topics/<topic-slug>/MMDD-<slug>-YY.md`

**Example**: `/research/topics/post-labor-economy/2026-01-02.md`

**Context file**: `/research/topics/<topic-slug>/.cybos/context.md`

## Daily Log Entry

Append to: `/.cybos/logs/MMDD-<slug>-YY.md`

**Format**:
```markdown
## HH:MM | research | [type] | [Subject Name]
- Workflow: company-research | tech-research | market-research | topic-research
- Duration: Xm Ys
- Output: /path/to/output.md
- Agents: agent1, agent2, agent3, synthesizer
- Sources: Parallel AI, Perplexity, Exa

---
```

## Debug Log Entry

Create: `/.cybos/logs/research-debug/MMDD-HH-MM-research-YY.md`

One file per research run with detailed execution trace.

## MCP Usage Log

Append to: `/.cybos/logs/mcp-usage/MMDD-YY.jsonl`

One JSON line per MCP call.
```

#### 2.3 Update Research/SKILL.md to link shared content

Add section to SKILL.md (after Capabilities, before Workflows):

```markdown
## Common References

For all research workflows, refer to these shared resources:

- **Investment Lens**: [shared/investment-lens.md](shared/investment-lens.md) - the organization investment rubric
- **MCP Strategy**: [shared/mcp-strategy.md](shared/mcp-strategy.md) - Tiered MCP research approach
- **Error Handling**: [shared/error-handling.md](shared/error-handling.md) - How to handle failures gracefully
- **Output Standards**: [shared/output-standards.md](shared/output-standards.md) - File naming and locations
```

#### 2.4 Update workflows to reference shared content

In each workflow (company.md, tech.md, market.md), replace repeated sections with references:

**Example in company.md**:

**OLD** (repeats investment lens):
```markdown
## Investment Lens Application

Always evaluate against the organization rubric:
1. Market Size (TAM) - Path to $1B+?
2. Moat / Defensibility - Data/network/tech moat?
... [full rubric repeated]
```

**NEW** (references shared):
```markdown
## Investment Lens Application

Apply the investment rubric from [shared/investment-lens.md](../shared/investment-lens.md).

Focus on:
- Path to $1B+ revenue for this company?
- Defensible moat evaluation
- Big Tech threat (6-week rule)
```

---

### Phase 3: Logging System (3-4 hours)

#### 3.1 Create debug logging structure

```bash
mkdir -p .cybos/logs/research-debug
mkdir -p .cybos/logs/mcp-usage
```

#### 3.2 Create logging utility

**New file**: `.claude/skills/Research/shared/logging.md`

```markdown
# Research Workflow Logging

## Debug Log Format

Store in: `.cybos/logs/research-debug/MMDD-HH-MM-research-YY.md`

Template:
```markdown
# Research Debug Log: [Type] - [Subject]
**Started**: MMDD-YY HH:MM:SS
**Workflow**: company | tech | market | topic

---

## Phase 1: GATHER (MCP Calls)

### MCP Call: parallel-task
**Status**: ✅ Success | ❌ Failed
**Started**: HH:MM:SS
**Completed**: HH:MM:SS
**Duration**: Xs
**Output**: task_id abc123 | Error: [error message]

### MCP Call: perplexity search
**Status**: ✅ Success
**Started**: HH:MM:SS
**Completed**: HH:MM:SS
**Duration**: Xs
**Results**: Found X sources

[Repeat for each MCP call]

---

## Phase 2: ANALYZE (Agent Execution)

### Agent: company-researcher
**Status**: ✅ Success | ⚠️ Partial | ❌ Failed
**Started**: HH:MM:SS
**Completed**: HH:MM:SS
**Duration**: Xs
**Output Size**: X lines
**Completion Signal**: [AGENT:company-researcher] completed [task description]
**Issues**: None | [list issues]

[Repeat for each agent]

---

## Phase 3: SYNTHESIZE

### Agent: synthesizer
**Status**: ✅ Success
**Started**: HH:MM:SS
**Completed**: HH:MM:SS
**Duration**: Xs
**Output**: /deals/company/research/MMDD-<slug>-YY.md

---

## Summary

**Total Duration**: Xm Ys
**MCP Calls**: X total, Y successful, Z failed
**Agents**: X total, Y successful, Z failed
**Final Status**: ✅ Success | ⚠️ Partial | ❌ Failed
**Output Location**: [path to research report]
```

## MCP Usage Log Format

Store in: `.cybos/logs/mcp-usage/MMDD-YY.jsonl`

One JSON object per line:
```json
{"timestamp":"2026-01-02T10:30:45Z","tool":"mcp__perplexity__search","args":{"query":"Anthropic funding"},"status":"success","duration_ms":1234,"error":null}
{"timestamp":"2026-01-02T10:31:20Z","tool":"mcp__parallel-task__createTask","args":{"prompt":"Research Anthropic"},"status":"success","duration_ms":2500,"result":"task_abc123"}
{"timestamp":"2026-01-02T10:32:15Z","tool":"mcp__exa__search","args":{"query":"Anthropic"},"status":"failed","duration_ms":5000,"error":"Timeout"}
```

## Integration Points

Workflows should:
1. Create debug log at start of research
2. Log each MCP call immediately after execution
3. Log each agent spawn and completion
4. Log synthesis step
5. Write summary at end
6. Append one-line entry to daily log (existing pattern)
```

#### 3.3 Update workflows to use logging

Add logging calls to:
- `.claude/skills/Research/workflows/company.md`
- `.claude/skills/Research/workflows/tech.md`
- `.claude/skills/Research/workflows/market.md`

Example integration in workflow:
```markdown
### 1. GATHER (Parallel MCP Calls)

**[CREATE DEBUG LOG]** → `.cybos/logs/research-debug/MMDD-HH-MM-company-research-YY.md`

Launch MCP calls:
```
mcp__parallel-task__createTask...
**[LOG]** → Record status, duration, result
```

---

### Phase 4: Agent Output Format (1-2 hours)

#### 4.1 Update agent output template

All 5 research agents (company, market, financial, team, tech) should use this format:

**Add to end of each agent's system prompt**:

```markdown
## Output Format (MANDATORY)

ALWAYS use this standardized format:

```markdown
📅 2026-01-02
**📋 SUMMARY:** [Brief overview of the research task and findings]
**🔍 ANALYSIS:** [Key insights discovered through research]
**⚡ ACTIONS:** [Research steps taken, sources consulted, verification performed]
**✅ RESULTS:** [The research findings and answers - ALWAYS SHOW ACTUAL RESULTS]
**📊 STATUS:** [Confidence level in findings, any limitations or caveats]
**➡️ NEXT:** [Recommended follow-up research or actions]
**🎯 COMPLETED:** [AGENT:company-researcher] completed [describe task in 5-6 words]
```

**CRITICAL**:
- NEVER exit without providing output
- ALWAYS include actual results in RESULTS section
- The [AGENT:name] tag in COMPLETED is MANDATORY for workflow tracking
- If you cannot complete the task, explain why in this format
```

Apply this to:
- company-researcher.md
- market-researcher.md
- financial-researcher.md
- team-researcher.md
- tech-researcher.md

(Synthesizer uses different format - keeps current detailed report structure)

---

### Phase 5: Topic Research (2-3 hours)

#### 5.1 Create topic-researcher agent

**New file**: `.claude/agents/topic-researcher.md`

```yaml
---
name: topic-researcher
description: Research people, ideas, concepts, and narratives for content creation and investment thesis development
tools: Read, WebFetch, Grep, Glob, Bash, mcp__perplexity__research, mcp__exa__search, mcp__parallel-task__createTask
model: haiku
skills: research
---

# Topic Researcher Agent

You research ideas, people, concepts, and narratives for the organization content creation and thesis development.

## Your Task

Gather comprehensive information on:
- **People**: Founders, thought leaders, their thinking and backgrounds
- **Ideas**: Economic concepts, philosophical frameworks, technical theories
- **Narratives**: Emerging themes, market narratives, sector trends
- **Concepts**: Cross-disciplinary topics (economics, ML, sociology, philosophy)

## Output Format

[Use same emoji-based format as other agents]

📅 [date]
**📋 SUMMARY:** [Topic overview and research scope]
**🔍 ANALYSIS:** [Key insights, multiple perspectives, synthesis]
**⚡ ACTIONS:** [Sources consulted, research approach]
**✅ RESULTS:** [Findings organized by theme or perspective]
**📊 STATUS:** [Research depth, confidence, limitations]
**➡️ NEXT:** [Content opportunities, investment connections, follow-up]
**🎯 COMPLETED:** [AGENT:topic-researcher] completed [task in 5-6 words]

## Research Approach

1. **Multi-perspective**: Gather academic, industry, philosophical viewpoints
2. **Key thinkers**: Identify and cite influential voices
3. **Investment connection**: Link to the organization thesis (AI, crypto, robotics)
4. **Content-ready**: Provide insights ready for essays or tweets
5. **Source depth**: Prioritize papers, books, credible long-form over quick takes

## Focus Areas

- Economics: Post-labor economy, mechanism design, market design
- Technology: Technical concepts with investment implications
- Philosophy: Frameworks relevant to cyber future
- ML/AI: Theoretical concepts with practical applications
- People: Founder thinking, thought leader frameworks
- Narratives: Emerging themes in AI/crypto/robotics
```

#### 5.2 Create topic workflow

**New file**: `.claude/skills/Research/workflows/topic.md`

```markdown
# Topic Research Workflow

Research on ideas, people, concepts, or narratives for content creation and thesis development.

## Inputs

- Topic/person/idea (from user or slash command)
- Investment philosophy (`context/investment-philosophy.md`)

## Workflow Steps

### 1. GATHER (Parallel MCP Calls)

```
mcp__parallel-task__createTask
  - prompt: "Conduct deep research on [topic]. Include multiple perspectives (academic, industry, philosophical), key thinkers and their frameworks, practical applications, and connection to AI/crypto/robotics. Focus on content-ready insights and investment implications."

mcp__perplexity__research
  - query: "[topic] key thinkers frameworks"
  - depth: "deep"

mcp__exa__search
  - query: "[topic] academic papers thought leadership"
  - numResults: 15
```

### 2. ANALYZE (Parallel Agent Execution)

```
Task 1: topic-researcher
Prompt: "Research [topic]. Gather multiple perspectives (academic, industry, philosophical), identify key thinkers and frameworks, connect to the organization investment thesis, and provide content-ready insights. Use: [MCP data]"

Task 2: market-researcher (if applicable)
Prompt: "Analyze investment opportunities related to [topic]. Which companies are building in this space? Market dynamics? Thesis fit? Use: [MCP data]"
```

### 3. SYNTHESIZE

```
Task: synthesizer
Prompt: "Consolidate topic research on [topic]. Structure as topic research report with:
- Overview (what is this topic/idea/person about)
- Key Perspectives (academic, industry, philosophical)
- Key Thinkers & Frameworks
- Investment Connection (how this relates to the organization thesis)
- Content Opportunities (insights for essays/tweets)
- Companies/Technologies (if applicable)
- Conclusion

Research outputs: [paste agent outputs]"
```

### 4. OUTPUT

Save to: `/research/topics/<topic-slug>/MMDD-<slug>-YY.md`

Create context file if needed.

### 5. LOG

Append to daily log.
```

#### 5.3 Create topic research command

**New file**: `.claude/commands/cyber-research-topic.md`

```markdown
Research a topic, idea, person, or narrative for content creation and investment thesis.

Load workflow:
@.claude/skills/Research/workflows/topic.md

Load investment context:
@context/investment-philosophy.md

Topic to research: $ARGUMENTS

Execute the topic research workflow following all steps.
```

---

### Phase 6: Documentation (1 hour)

#### 6.1 Update CLAUDE.md

Add/update sections:
- Research types (add topic)
- Agent harmonization (skills field)
- Logging system (research-debug/, mcp-usage/)
- Standardized agent output format
- Debugging guide

#### 6.2 Re-run evals

Run all 4 evals again after changes:
- Compare to baseline
- Document improvements
- Iterate based on results

---

## File Structure (After Implementation)

```
.claude/
├── skills/
│   └── Research/
│       ├── SKILL.md (✅ + YAML + links to shared/)
│       ├── evals/ (✅ created)
│       │   ├── baseline/ (🔧 results)
│       │   ├── *.json
│       │   └── README.md
│       ├── shared/ (🔧 NEW)
│       │   ├── investment-lens.md
│       │   ├── mcp-strategy.md
│       │   ├── error-handling.md
│       │   ├── output-standards.md
│       │   └── logging.md
│       └── workflows/
│           ├── company.md (🔧 reference shared/, add logging)
│           ├── tech.md (🔧 reference shared/, add logging)
│           ├── market.md (🔧 reference shared/, add logging)
│           └── topic.md (🔧 NEW)
├── agents/ (🔧 all updated)
│   ├── company-researcher.md (+ skills field + output format)
│   ├── market-researcher.md
│   ├── financial-researcher.md
│   ├── team-researcher.md
│   ├── tech-researcher.md
│   ├── synthesizer.md (+ skills field)
│   └── topic-researcher.md (🔧 NEW)
└── commands/
    └── cyber-research-topic.md (🔧 NEW)

.cybos/
└── logs/
    ├── MMDD-YY.md (existing)
    ├── research-debug/ (🔧 NEW)
    │   └── MMDD-HH-MM-research-YY.md
    └── mcp-usage/ (🔧 NEW)
        └── MMDD-YY.jsonl
```

## Recommended Implementation Order

**Day 1** (3-4 hours):
1. Phase 0: Run baseline evals, document results
2. Phase 1: Add YAML frontmatter, harmonize agents
3. Phase 2: Create shared content directory, update SKILL.md links

**Day 2** (4-5 hours):
4. Phase 3: Create logging system
5. Phase 4: Update agent output formats

**Day 3** (3-4 hours):
6. Phase 5: Create topic research workflow + agent
7. Phase 6: Update documentation, re-run evals

**Total**: ~10-13 hours over 3 days

## Success Criteria

After implementation, re-run evals should show:
- ✅ All 4 research types working (including topic)
- ✅ Agents auto-load Research skill
- ✅ Standardized emoji-based output from agents
- ✅ Debug logs created for each research run
- ✅ MCP usage logged
- ✅ Improved quality indicators in eval results

---

## Ready to Start?

**Next action**: Run Phase 0 (baseline evals) now, then proceed with Phase 1.

Just say **"start Phase 0"** or **"run baseline evals"** and I'll begin.
