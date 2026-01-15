# MCP Research Strategy

This reference outlines when and how to use each MCP server for optimal research speed and cost.

## Available MCP Servers

| Server | Purpose | Speed | Cost | Best For |
|--------|---------|-------|------|----------|
| **perplexity** | Fast search + deep research with citations | Fast/Medium | Low/Med | Quick facts, comprehensive reports |
| **exa** | Web search + content extraction | Fast | Low | Search, company data, URL content |
| **parallel-search** | Web search + content fetch (fallback) | Fast | Low | Fallback for exa |
| **parallel-task** | Deep research tasks, report-style outputs | Slow | High | Comprehensive analysis |
| **firecrawl** | Scrape, crawl, extract (last resort) | Medium | Medium | When exa/parallel-search fail |
| **playwright** | Browser automation (last resort) | Slow | High | JavaScript-heavy sites |

## Tiered Research Strategy

### Quick Research (10-30 seconds)
**Built-in Claude tools only** - No MCP calls

Tools:
- `WebSearch` - Fast web search
- `WebFetch` - Fetch specific URLs
- Direct reasoning from Claude's knowledge

Use when:
- User explicitly requests `--quick`
- Simple fact-checking
- Validation of basic info
- Time-sensitive queries

Limitations:
- No deep research
- No parallel analysis
- Limited to recent data

### Standard Research (2-5 minutes)
**MCPs + Agents** - Default level

MCP tools:
- `mcp__perplexity__search` - Fast search with citations
- `mcp__exa__search` - Web search and company data
- `mcp__exa__getContents` - Extract content from URLs (primary)
- `mcp__parallel-search__web_search_preview` - Alternative search (fallback)
- `mcp__parallel-search__web_fetch` - Alternative URL fetch (fallback)
- `mcp__firecrawl__scrape` - URL scraping (last resort if exa fails)

Agents:
- Spawn 2-4 parallel agents for different research dimensions
- Each agent uses Haiku model for speed
- Synthesizer consolidates findings

Use when:
- User doesn't specify intensity (default)
- Balanced speed-quality tradeoff
- Most research queries

Pattern:
```
1. GATHER (parallel MCP calls)
   ├─ perplexity search: quick facts
   ├─ exa search: company/market data
   └─ exa getContents: specific URLs (or parallel-search web_fetch as fallback)

2. ANALYZE (parallel agents)
   ├─ Agent 1: dimension 1
   ├─ Agent 2: dimension 2
   └─ Agent 3-4: additional dimensions

3. SYNTHESIZE
   └─ Consolidate with investment/content lens
```

### Deep Research (5-15 minutes)
**Deep research tools** - Maximum comprehensiveness

MCP tools:
- `mcp__perplexity__research` with `depth: "deep"`
- `mcp__parallel-task__createDeepResearch` with comprehensive prompts
- All Standard tools as needed

Agents:
- More parallel agents (4-6)
- Opus model for critical analysis (memo-analyst)
- Multiple synthesis passes

Use when:
- User explicitly requests `--deep`
- Investment memo generation
- High-stakes decisions
- Complex technical deep-dives

Pattern:
```
1. GATHER (comprehensive parallel MCP)
   ├─ parallel-task createDeepResearch: "Deep research on [subject]"
   ├─ perplexity research (depth: deep)
   ├─ exa search: multiple queries
   └─ exa getContents: batch URLs (or parallel-search as fallback)

2. ANALYZE (extensive parallel agents)
   ├─ Agent 1-4: all research dimensions
   ├─ Opus for strategic analysis
   └─ Multiple domain experts

3. SYNTHESIZE (multi-pass)
   ├─ Initial consolidation
   ├─ Investment/strategic analysis (Opus)
   └─ Final synthesis with recommendations
```

## MCP Tool Selection Guide

### When to use Perplexity

**perplexity search** (fast):
- Quick facts and recent news
- Validation of information
- Gathering citations
- Time-sensitive queries
- Standard research level

**perplexity research** (deep):
- Comprehensive market analysis
- Technology deep-dives
- Multi-perspective research
- Deep research level only

### When to use Exa

**exa search**:
- Finding company information
- Web content search
- Similar company discovery
- Standard and Deep research

**exa getContents** (PRIMARY for URL content):
- Extract content from specific URLs
- Batch processing multiple URLs (up to 10)
- Get clean markdown from web pages
- Standard and Deep research
- Lower cost than firecrawl (~$0.02-0.05 per batch)

**Use cases for getContents**:
- Following up on search results with full content
- Extracting articles, papers, blog posts
- Getting company website content
- Batch processing competitor URLs

**Fallback**: If exa search fails → `parallel-search web_search_preview`
**Fallback**: If exa getContents fails → `parallel-search web_fetch` → `firecrawl scrape` (last resort)

### When to use Parallel Search

**parallel-search web_search_preview**:
- Alternative to exa search when rate limited
- General web search with LLM-friendly output
- Quick fact-finding fallback
- Standard and Deep research

**parallel-search web_fetch**:
- Alternative to firecrawl when needed
- Fetch specific URLs with content extraction
- Lower cost option for simple scraping

**Use as**:
- Fallback for exa failures
- Alternative to firecrawl for simple URL fetching
- Redundancy option in parallel MCP calls

### When to use Firecrawl (LAST RESORT ONLY)

**Use firecrawl ONLY when exa and parallel-search both fail.**

Firecrawl is kept as available but NOT recommended for primary use:
- Higher cost than exa getContents
- Should only be used when exa getContents and parallel-search web_fetch cannot handle the URL

**firecrawl scrape** (last resort):
- When exa getContents fails to extract content
- When parallel-search web_fetch fails
- Complex page structures that simpler tools can't handle

**firecrawl extract** (rarely needed):
- Structured data extraction with schema
- Only when LLM processing of exa content is insufficient

**firecrawl crawl** (avoid completely):
- Expensive and slow
- Use exa search + getContents for multiple URLs instead

**Recommendation**: Try exa getContents first, then parallel-search web_fetch, then firecrawl as last resort

### When to use Parallel Task

**createDeepResearch**:
- Deep research reports
- Comprehensive analysis
- Market sizing and dynamics
- Technology assessments
- Deep research level only

Poll with `getResultMarkdown` to check status and retrieve results

### When to use Playwright

Last resort only:
- JavaScript-heavy sites that Firecrawl can't handle
- Dynamic content requiring interaction
- Hard-to-scrape data sources

Avoid if possible - slow and expensive

## Fallback Strategy

### Primary → Fallback Chain

**For web search:**
1. Primary: `exa search`
2. Fallback: `parallel-search web_search_preview`
3. Last resort: `WebSearch` (built-in)

**For URL content extraction:**
1. Primary: `exa getContents`
2. Fallback: `parallel-search web_fetch`
3. Last resort (if both fail): `firecrawl scrape`
4. Final fallback: `WebFetch` (built-in)

**For deep research:**
1. Primary: `parallel-task createDeepResearch`
2. Fallback: `perplexity research (deep)`
3. Last resort: Multiple standard agents

### Error Handling

If an MCP call fails:
1. Log the failure (see logging.md)
2. Try fallback MCP from chain above
3. Continue with partial data if all fallbacks fail
4. Flag data quality concern in output

Don't:
- Retry same call repeatedly
- Block entire research on one failure
- Hide missing data from user

### Rate Limits

If rate limited:
- Immediately switch to fallback MCP
- Log which fallback was used
- Note limitation in research output
- Consider switching MCPs for subsequent calls

Example:
```markdown
## 14:31 | mcp | exa | search
- Query: "Acme Corp"
- Status: Failed
- Error: Rate limit exceeded (429)
- Fallback: Using parallel-search instead

---

## 14:31 | mcp | parallel-search | web_search_preview
- Query: "Acme Corp company information"
- Status: Success
- Fallback: Used as exa alternative
```

## Cost Optimization

### Quick Research
- Minimize MCP calls
- Use WebSearch/WebFetch first
- Total cost: <$0.05

### Standard Research
- 2-4 MCP calls in parallel
- 2-4 Haiku agents
- Prefer cheaper MCPs when equivalent
- Total cost: $0.10-$0.30

### Deep Research
- 4-8 MCP calls
- 4-6 agents (mix Haiku + Opus)
- Parallel Task deep research
- Total cost: $0.50-$2.00

## Parallel Execution Pattern

To maximize speed, issue multiple MCP calls in parallel:

```markdown
GATHER phase - Issue all in one response:
[mcp__perplexity__search: "query 1"]
[mcp__exa__search: "query 2"]
[mcp__firecrawl__scrape: "url"]
```

Then spawn agents in parallel:
```markdown
ANALYZE phase - Multiple Task calls:
[Task: company-researcher]
[Task: market-researcher]
[Task: financial-researcher]
```

Don't execute sequentially unless there are dependencies.

## Quality vs Speed Tradeoffs

| Level | Time | Quality | Cost | Use Case |
|-------|------|---------|------|----------|
| Quick | 10-30s | Basic | $0.01-0.05 | Fact-checking, validation |
| Standard | 2-5m | Good | $0.10-0.30 | Most research, balanced |
| Deep | 5-15m | Excellent | $0.50-2.00 | Investment memos, critical decisions |

Choose based on:
- User's explicit request
- Query complexity
- Decision stakes
- Time constraints

## MCP Comparison Table

| Operation | Primary | Fallback | Last Resort | Cost | Speed |
|-----------|---------|----------|-------------|------|-------|
| Web search | exa | parallel-search | WebSearch | $0.01-0.03 | Fast |
| URL content | exa getContents | parallel-search | firecrawl | $0.02-0.05 | Fast |
| Deep research | parallel-task | perplexity (deep) | Multiple agents | $0.30-1.50 | Slow |
| Quick facts | perplexity | exa | WebSearch | $0.01-0.03 | Fast |
| Batch URLs | exa getContents | parallel-search | firecrawl | $0.03-0.08 | Fast |
