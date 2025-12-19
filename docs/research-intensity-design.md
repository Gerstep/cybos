# Research Intensity System Design

**Date**: 2026-01-02
**Purpose**: 3-tier research depth system for speed/cost/quality tradeoffs

## Overview

Research can be conducted at 3 intensity levels, each with different speed, cost, and depth characteristics.

## Intensity Tiers

### Level 1: Quick (Built-in Tools Only)
**Speed**: 10-30 seconds
**Cost**: Lowest (no MCP calls, no agents)
**Depth**: Surface-level, suitable for quick validation

**Tools Used**:
- `WebSearch` - Built-in Claude web search
- `WebFetch` - Built-in page fetching
- No MCP servers
- No sub-agents

**Use Cases**:
- Quick fact-checking
- Initial validation before deeper research
- Time-sensitive queries
- Browsing/exploration
- When user explicitly requests "quick" or "fast"

**Example Query Patterns**:
- "Quick research on..."
- "Fast check: is Company X funded?"
- "Brief overview of..."
- `/cyber-research-company "Acme" --quick`

**Output**:
- Simple markdown report
- Key facts and sources
- No investment analysis (just data)
- 1-2 paragraphs per section

---

### Level 2: Standard (Agents + Standard MCPs)
**Speed**: 2-5 minutes
**Cost**: Medium (MCP calls, parallel agents)
**Depth**: Comprehensive, suitable for most investment research

**Tools Used**:
- `mcp__perplexity__search` - Standard search
- `mcp__exa__search` - Company/content discovery
- `mcp__parallel-task__createTask` - Standard depth
- `mcp__firecrawl__scrape` - Specific URLs
- Sub-agents: 3-4 parallel agents (company, market, financial, team)
- Synthesizer: Consolidates findings

**Use Cases**:
- Regular company DD
- Technology deep-dives
- Market analysis
- DEFAULT for most research (if no intensity specified)

**Example Query Patterns**:
- "Research Company X"
- "Analyze Technology Y"
- `/cyber-research-company "Acme"` (no flag = standard)
- `/cyber-research-tech "TEEs" --standard`

**Output**:
- Full research report
- Investment lens applied
- All sections complete
- Consolidated from multiple agents

---

### Level 3: Deep (Deep Research Tools)
**Speed**: 5-15 minutes
**Cost**: Highest (deep MCP calls, more agents, longer processing)
**Depth**: Exhaustive, suitable for critical investment decisions

**Tools Used**:
- `mcp__perplexity__research` - **Deep mode**
- `mcp__parallel-task__createTask` - **Deep research** with extended prompt
- `mcp__exa__search` - Larger result sets (20-30 results)
- `mcp__firecrawl__crawl` - Full site crawling if needed
- Sub-agents: 5-6 parallel agents (all research agents + extras)
- Synthesizer: Deep analysis mode

**Use Cases**:
- High-stakes investment decisions
- Pre-IC (Investment Committee) research
- Deep competitive analysis
- When user explicitly requests "deep" or "thorough"
- Complex multi-faceted research

**Example Query Patterns**:
- "Deep research on..."
- "Thorough analysis of..."
- "/cyber-research-company "Acme" --deep"
- "Comprehensive DD on..."

**Output**:
- Extended research report
- Additional sections (competitive matrix, detailed risks)
- More sources and cross-referencing
- Higher confidence analysis

---

## Inference Rules

When user doesn't specify intensity, Claude infers based on:

### Trigger Words for QUICK:
- "quick", "fast", "brief", "overview", "check", "validate"
- Time pressure: "before my call in 10 min"
- Browsing: "what's", "who's", "is there"

### Trigger Words for STANDARD (default):
- "research", "analyze", "investigate", "due diligence"
- No specific intensity mentioned
- Default for all `/cyber-research-*` commands

### Trigger Words for DEEP:
- "deep", "thorough", "comprehensive", "exhaustive", "complete"
- "pre-IC", "investment decision", "critical"
- "full analysis", "detailed"

### Examples:

| User Query | Inferred Intensity | Reasoning |
|------------|-------------------|-----------|
| "Research Anthropic" | Standard | Default |
| "Quick check on Anthropic funding" | Quick | "Quick check" |
| "Deep dive on Anthropic for IC" | Deep | "Deep dive" + "IC" |
| "What's the latest on OpenAI?" | Quick | "What's" = browsing |
| "Comprehensive analysis of TEEs" | Deep | "Comprehensive" |
| "/cyber-research-company Acme" | Standard | No flag = default |
| "/cyber-research-tech TEEs --quick" | Quick | Explicit flag |

---

## User Specification (Explicit)

Users can override inference with command flags:

### Slash Command Syntax:
```
/cyber-research-company "Company Name" --quick
/cyber-research-company "Company Name" --standard
/cyber-research-company "Company Name" --deep

/cyber-research-tech "Technology" --quick
/cyber-research-market "Market" --deep
/cyber-research-topic "Topic" --standard
```

### Natural Language Override:
```
"Do a quick research on Anthropic"
"Standard research on TEEs"
"Deep research on AI Infrastructure market"
```

---

## Announcement Pattern

**CRITICAL**: Claude MUST announce the intensity level at the start of research:

### Quick Research:
```
🔍 **QUICK RESEARCH** (Level 1: Built-in tools, 10-30 sec)

Conducting quick research on [subject] using web search and page fetching...
```

### Standard Research:
```
🔬 **STANDARD RESEARCH** (Level 2: Agents + MCPs, 2-5 min)

Conducting standard investment research on [subject]:
1. GATHER: Launching parallel MCP calls (perplexity, exa, parallel-task)
2. ANALYZE: Spawning 4 research agents in parallel
3. SYNTHESIZE: Consolidating findings with investment lens
```

### Deep Research:
```
🔎 **DEEP RESEARCH** (Level 3: Deep tools + extended agents, 5-15 min)

Conducting deep research on [subject]:
1. GATHER: Deep MCP research (perplexity deep, parallel-task deep, extended exa)
2. ANALYZE: Spawning 5-6 research agents for comprehensive coverage
3. SYNTHESIZE: Extended analysis with competitive matrix and detailed risk assessment
```

---

## Implementation Changes

### Updated Command Structure

Commands accept optional intensity flag:

**File**: `.claude/commands/cyber-research-company.md`
```markdown
Research a company for investment due diligence.

**Intensity levels** (optional):
- `--quick` - Fast research with built-in tools (10-30 sec)
- `--standard` - Full research with agents and MCPs (2-5 min) [DEFAULT]
- `--deep` - Exhaustive research with deep tools (5-15 min)

Load workflow:
@.claude/skills/Research/workflows/company.md

Load investment context:
@context/investment-philosophy.md

Parse arguments:
- Company name: $ARGUMENTS (strip intensity flags)
- Intensity: Extract from --quick, --standard, or --deep flag, or infer from query

**Announce intensity level** before starting research.

Execute the company research workflow at the specified intensity level.
```

### Workflow Updates

Each workflow (company.md, tech.md, market.md, topic.md) gets intensity-aware sections:

**Example from company.md**:

```markdown
# Company Research Workflow

## Intensity Level Selection

Parse intensity from command or infer from user query.

**Quick** (Level 1):
- Use WebSearch + WebFetch only
- Skip agent execution
- Generate simple fact report

**Standard** (Level 2):
- Use standard MCP calls
- Spawn 4 agents
- Full synthesis

**Deep** (Level 3):
- Use deep MCP modes
- Spawn 5-6 agents
- Extended synthesis with competitive matrix

## Level 1: Quick Research

[Quick workflow steps...]

## Level 2: Standard Research (DEFAULT)

[Current workflow - becomes default...]

## Level 3: Deep Research

[Extended workflow with deep tools...]
```

### Shared Reference File

**New file**: `.claude/skills/Research/shared/intensity-tiers.md`

Contains full specification of:
- Tool mappings per tier
- Announcement templates
- Inference rules
- When to use each tier

---

## Cost/Time Matrix

| Intensity | Time | Approx Cost | Agents | MCP Calls | Use When |
|-----------|------|-------------|---------|-----------|----------|
| Quick | 10-30s | ~$0.01 | 0 | 0 | Quick validation, browsing |
| Standard | 2-5m | ~$0.10-0.30 | 3-4 | 3-5 | Regular DD (default) |
| Deep | 5-15m | ~$0.50-1.00 | 5-6 | 5-8 (deep) | Pre-IC, critical decisions |

*Costs are estimates based on token usage and MCP pricing*

---

## Migration Path

### Phase 1: Infrastructure
- Create `shared/intensity-tiers.md`
- Update workflows with 3-tier structure
- Add intensity parsing to commands

### Phase 2: Implementation
- Implement Quick mode (skip agents, use built-in tools)
- Keep Standard mode (current behavior)
- Implement Deep mode (deep MCPs, extra agents)

### Phase 3: Testing
- Test all 3 modes for each research type
- Validate inference rules
- Verify announcements work

---

## Example User Interactions

### Scenario 1: Implicit Quick
**User**: "Quick check - is Anthropic profitable yet?"
**Claude**:
```
🔍 **QUICK RESEARCH** (Level 1: Built-in tools, 10-30 sec)

Conducting quick research on Anthropic profitability...

[Uses WebSearch, returns in 15 seconds]

**Finding**: Anthropic is not yet profitable. Latest reports indicate they're
focused on growth and model development. Revenue sources include API access
and Claude Pro subscriptions.

**Sources**: [links]
```

### Scenario 2: Implicit Standard
**User**: "/cyber-research-company Anthropic"
**Claude**:
```
🔬 **STANDARD RESEARCH** (Level 2: Agents + MCPs, 2-5 min)

Conducting standard investment research on Anthropic:
1. GATHER: Launching parallel MCP calls...
2. ANALYZE: Spawning 4 research agents...
3. SYNTHESIZE: Consolidating findings...

[Standard workflow executes, ~3 minutes]
[Full research report generated]
```

### Scenario 3: Explicit Deep
**User**: "/cyber-research-tech TEEs --deep"
**Claude**:
```
🔎 **DEEP RESEARCH** (Level 3: Deep tools + extended agents, 5-15 min)

Conducting deep research on Trusted Execution Environments:
1. GATHER: Deep MCP research (perplexity deep mode, parallel-task deep, extended exa results)...
2. ANALYZE: Spawning 6 research agents for comprehensive coverage...
3. SYNTHESIZE: Extended analysis with competitive matrix...

[Deep workflow executes, ~8 minutes]
[Extended research report with additional sections]
```

---

## Success Criteria

After implementation, research should:
- ✅ Support all 3 intensity levels
- ✅ Correctly infer intensity from user queries
- ✅ Accept explicit intensity flags
- ✅ Announce intensity at start of research
- ✅ Use appropriate tools for each tier
- ✅ Deliver expected speed/depth tradeoffs
- ✅ Be documented in CLAUDE.md

---

## Next Steps

1. Create `shared/intensity-tiers.md` reference file
2. Update all 4 workflows with 3-tier structure
3. Update all 4 commands to parse intensity
4. Test inference rules
5. Document in CLAUDE.md
