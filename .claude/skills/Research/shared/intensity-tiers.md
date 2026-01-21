# Research Intensity Tiers

This reference defines the 3-tier research system for balancing speed, cost, and comprehensiveness.

## Overview

Research can be performed at three intensity levels, each optimized for different scenarios:

| Level | Duration | Quality | Cost | Tools | Agents |
|-------|----------|---------|------|-------|--------|
| **Quick** | 10-30s | Basic | $0.01-0.05 | Built-in only | None |
| **Standard** | 2-5min | Good | $0.10-0.30 | MCPs | 3-4 Haiku |
| **Deep** | 5-15min | Excellent | $0.50-2.00 | All MCPs | 4-6 mixed |

## Tier Definitions

### 🔍 Quick Research (Level 1)

**Duration**: 10-30 seconds
**Cost**: $0.01-0.05
**Quality**: Basic facts and validation

**Tools Available**:
- `WebSearch` - Fast web search
- `WebFetch` - Fetch specific URLs
- Claude's built-in knowledge
- Direct reasoning

**Limitations**:
- No MCP calls
- No parallel agents
- No deep research tools
- Surface-level only

**Use When**:
- User explicitly requests `--quick`
- Time-sensitive queries
- Simple fact-checking
- Quick validation needed
- Low-stakes decisions

**Output**:
- Single consolidated response (no separate agents)
- Basic facts with sources
- Limited analysis
- Key questions flagged for deeper research

**Example Queries**:
- "Quick check: Is Acme Corp still in business?"
- "What's the latest funding round for CompanyX?"
- "Quick overview of TEE technology"

**Announcement**:
```markdown
🔍 **QUICK RESEARCH** (10-30s)
Using: WebSearch, WebFetch, built-in knowledge only
```

---

### 🔬 Standard Research (Level 2)

**Duration**: 2-5 minutes
**Cost**: $0.10-0.30
**Quality**: Comprehensive, investment-grade

**Tools Available**:
- `mcp__perplexity__search` - Fast search with citations
- `mcp__exa__search` - Web search and company data
- `mcp__exa__getContents` - Extract content from URLs
- All Quick research tools

**Agent Pattern**:
- 3-4 parallel agents (Haiku model)
- Company: company-researcher, market-researcher, financial-researcher
- Tech: tech-researcher, market-researcher, company-researcher (if applicable)
- Market: market-researcher, company-researcher (for players), financial-researcher
- Topic: topic-researcher + 1-2 supporting agents

**Use When**:
- User doesn't specify intensity (default)
- Most research queries
- Balanced speed-quality tradeoff
- Investment screening
- Preparing for meetings

**Output**:
- Full research report format
- Multiple agent perspectives synthesized
- Investment lens applied
- Actionable recommendations

**Example Queries**:
- "Research Acme Corp as investment opportunity"
- "Analyze TEE technology market"
- "What's the AI inference market looking like?"

**Announcement**:
```markdown
🔬 **STANDARD RESEARCH** (2-5 min)
Using: Perplexity, Exa (search + getContents) + 3-4 parallel agents
```

---

### 🔎 Deep Research (Level 3)

**Duration**: 5-15 minutes
**Cost**: $0.50-2.00
**Quality**: Exhaustive, memo-grade

**Tools Available**:
- `mcp__perplexity__research` (depth: "deep")
- `mcp__parallel-task__createTask` (deep research mode)
- `mcp__exa__search` (multiple queries)
- `mcp__exa__getContents` (batch URL extraction)
- All Standard research tools

**Agent Pattern**:
- 4-6 parallel agents
- Mix of Haiku and Opus models
- Opus for strategic analysis (memo-analyst)
- Multiple synthesis passes
- Company: All 5 agents (company, market, financial, team, tech)
- Tech: tech-researcher + market + 2-3 supporting agents
- Market: market-researcher + company profiling + financial analysis

**Use When**:
- User explicitly requests `--deep`
- Investment memo generation
- High-stakes decisions
- Complex technical deep-dives
- Pre-IC (Investment Committee) preparation

**Output**:
- Comprehensive research report (3,000-6,000 words)
- Multiple perspectives synthesized
- Strategic analysis by Opus
- Detailed investment thesis
- Risk analysis and scenarios
- Comprehensive recommendations

**Example Queries**:
- "Deep dive on Acme Corp for investment memo"
- "Comprehensive TEE technology analysis"
- "Full market assessment of AI infrastructure"

**Announcement**:
```markdown
🔎 **DEEP RESEARCH** (5-15 min)
Using: Perplexity Deep, Parallel Task Deep + 4-6 agents (including Opus)
```

---

## Intensity Selection Logic

### User-Specified Intensity

If user includes intensity flag, use it explicitly:
- `--quick` → Quick research
- `--standard` → Standard research
- `--deep` → Deep research

**Examples**:
- `/cyber-research-company "Acme Corp" --quick`
- `/cyber-research-tech "TEEs" --deep`

### Inference from Query

If no flag specified, infer from query characteristics:

#### Signals for Quick:
- Words: "quick", "fast", "check", "verify", "brief"
- Questions: "Is X still...?", "What's the latest...?"
- Validation: "Confirm that...", "Check if..."

#### Signals for Standard (default):
- Standard research requests without qualifiers
- "Research X", "Analyze X", "Tell me about X"
- No time pressure indicators

#### Signals for Deep:
- Words: "comprehensive", "deep", "thorough", "detailed", "full"
- "For memo", "for IC", "investment decision"
- "Deep dive", "exhaustive analysis"

**Inference Examples**:
- "Quick check on Acme Corp" → 🔍 Quick
- "Research Acme Corp" → 🔬 Standard (default)
- "Comprehensive analysis of Acme Corp for memo" → 🔎 Deep

### Ambiguous Cases

When unclear, default to **Standard** and explain:
```markdown
🔬 **STANDARD RESEARCH** (2-5 min)
[Using Standard level - specify --quick or --deep to adjust]
```

## Workflow Patterns by Tier

### Quick Research Workflow

```
1. GATHER (sequential, no parallel)
   └─ WebSearch: 1-2 queries
   └─ WebFetch: 1-2 key URLs (if needed)

2. ANALYZE (direct, no agents)
   └─ Claude synthesizes findings directly

3. OUTPUT
   └─ Brief summary (500-1,000 words)
   └─ Flag areas for deeper research
```

### Standard Research Workflow

```
1. GATHER (parallel MCP calls)
   ├─ perplexity search: 2-3 queries
   ├─ exa search: 1-2 queries
   └─ exa getContents: specific URLs (if needed)

2. ANALYZE (parallel agents - 3-4)
   ├─ Agent 1: Primary dimension
   ├─ Agent 2: Secondary dimension
   ├─ Agent 3: Tertiary dimension
   └─ [Agent 4: Additional if needed]

3. SYNTHESIZE
   └─ Consolidate with investment lens
   └─ Apply cyber•Fund rubric

4. OUTPUT
   └─ Full research report (1,500-3,000 words)
```

### Deep Research Workflow

```
1. GATHER (comprehensive parallel MCP)
   ├─ parallel-task createTask: Deep research
   ├─ perplexity research (depth: deep): 3-4 queries
   ├─ exa search: 3-5 queries
   └─ exa getContents: Batch URLs

2. ANALYZE (extensive parallel agents - 4-6)
   ├─ Agent 1-4: All research dimensions
   ├─ Opus: Strategic analysis (if memo)
   └─ Multiple domain experts

3. SYNTHESIZE (multi-pass)
   ├─ Initial consolidation (Sonnet)
   ├─ Strategic analysis (Opus)
   └─ Final synthesis with recommendations

4. OUTPUT
   └─ Comprehensive report (3,000-6,000 words)
   └─ Investment memo format (if applicable)
```

## Cost-Benefit Analysis

### When to Use Quick

**Good For**:
- Fast fact-checking
- Validation of basic info
- Initial screening (before deeper research)
- Time-sensitive queries
- Low-stakes decisions

**Not Good For**:
- Investment decisions
- Comprehensive analysis
- Multi-dimensional research
- Strategic planning

**ROI**: High for quick questions, low for complex research

### When to Use Standard

**Good For**:
- Most research queries (default)
- Investment screening
- Meeting preparation
- Balanced speed-quality
- Regular DD work

**Not Good For**:
- IC presentations (use Deep)
- Quick fact checks (use Quick)

**ROI**: Best overall balance for 80% of research needs

### When to Use Deep

**Good For**:
- Investment memos
- IC presentations
- High-stakes decisions
- Complex technical analysis
- Pre-term sheet DD

**Not Good For**:
- Quick questions
- Initial screening
- Time-sensitive queries

**ROI**: High for critical decisions, overkill for screening

## Quality Expectations

### Quick Research Quality
- ✅ Accurate basic facts
- ✅ Recent information
- ✅ Clear sources cited
- ❌ Limited depth
- ❌ No multi-agent perspective
- ❌ Surface-level only

### Standard Research Quality
- ✅ Comprehensive coverage
- ✅ Multiple perspectives (3-4 agents)
- ✅ Investment lens applied
- ✅ Actionable recommendations
- ✅ Data quality assessment
- ⚠️ May miss edge cases
- ⚠️ Limited strategic depth

### Deep Research Quality
- ✅ Exhaustive analysis
- ✅ Strategic depth (Opus)
- ✅ Multiple sources confirmed
- ✅ Risk scenarios explored
- ✅ Comprehensive recommendations
- ✅ Memo-ready output
- ⚠️ Time and cost intensive

## Tier Upgrade Triggers

Start with lower tier and upgrade if needed:

**Quick → Standard**:
- Quick research reveals complexity
- Multiple dimensions need exploration
- Initial findings are promising

**Standard → Deep**:
- Opportunity looks highly promising
- Moving to IC stage
- Need strategic analysis
- Generating investment memo

**Example**:
```markdown
🔍 Quick research completed. Findings suggest strong opportunity.
Recommend upgrading to 🔬 Standard research for full analysis.

Proceed with Standard research? [Yes/No]
```

## Always Announce Intensity

**CRITICAL**: Always announce which intensity level you're using at the start of research.

**Format**:
```markdown
🔍 **QUICK RESEARCH** (10-30s)
Using: [tools description]
```

or

```markdown
🔬 **STANDARD RESEARCH** (2-5 min)
Using: [tools description]
```

or

```markdown
🔎 **DEEP RESEARCH** (5-15 min)
Using: [tools description]
```

This sets user expectations and allows them to adjust if needed.

## User Override

If user wants different intensity mid-research:
- "Actually, just do quick research" → Switch to Quick
- "I need more depth" → Upgrade to Standard/Deep
- "This is taking too long" → Offer to complete at current level or downgrade

## Examples by Research Type

### Company Research

**Quick**:
- "Quick: Is Acme Corp still raising?"
- WebSearch for recent news
- Output: Brief status update

**Standard**:
- "Research Acme Corp"
- 4 agents: company, market, financial, team
- Output: Full investment report

**Deep**:
- "Deep dive on Acme Corp for memo"
- 5 agents + Opus analysis
- Output: Comprehensive memo-ready report

### Technology Research

**Quick**:
- "Quick overview of TEE technology"
- WebSearch + WebFetch docs
- Output: Basic explanation

**Standard**:
- "Research TEE technology"
- 3 agents: tech, market, company (adopters)
- Output: Full tech analysis

**Deep**:
- "Comprehensive TEE analysis"
- 4 agents + deep research tools
- Output: Exhaustive technical and market report

### Market Research

**Quick**:
- "Quick check: What's AI infra market size?"
- WebSearch for recent estimates
- Output: TAM estimate with source

**Standard**:
- "Analyze AI infrastructure market"
- 3 agents: market, company (players), financial
- Output: Full market report

**Deep**:
- "Full assessment of AI infra market"
- 4 agents + parallel-task deep research
- Output: Comprehensive market landscape

## Decision Tree

```
User query
    │
    ├─ Has --quick flag? → Quick Research
    ├─ Has --deep flag? → Deep Research
    ├─ Has --standard flag? → Standard Research
    │
    └─ No flag? Infer from query:
        │
        ├─ Contains "quick/fast/check"? → Quick
        ├─ Contains "deep/comprehensive/memo"? → Deep
        └─ Default → Standard
```

## Summary

- **Quick**: Fast facts, basic validation (10-30s, $0.01-0.05)
- **Standard**: Balanced research, investment-grade (2-5m, $0.10-0.30) [DEFAULT]
- **Deep**: Exhaustive analysis, memo-ready (5-15m, $0.50-2.00)

Always announce which tier you're using. Default to Standard if unclear.
