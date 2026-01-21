# Research Logging Utility

This reference defines how to log research activities for debugging, auditing, and performance tracking.

## Unified Logging Location

**All logging consolidated into**: `~/CybosVault/private/.cybos/logs/MMDD-YY.md`

**Purpose**: Single source of truth for all daily activity, research workflow execution, agent status, MCP calls, and errors

**Why consolidated**:
- Reduces overhead (1 file instead of 3)
- Easier to track complete workflow execution
- Simpler to audit and analyze
- Better chronological view of all activity

## Log Entry Format

All entries use the same base format with additional context based on event type:

```markdown
## HH:MM | category | type | subject
- [Context-specific fields]
- [Additional details]

---
```

## Entry Types

### 1. Workflow Start

```markdown
## HH:MM | research | workflow-start | [subject]
- Type: Company | Tech | Market | Topic
- Intensity: Quick | Standard | Deep
- Agents planned: [agent1, agent2, agent3]

---
```

### 2. MCP Call

```markdown
## HH:MM | mcp | [server-name] | [operation]
- Query/URL: [request details]
- Status: Success | Failed
- Error: [if failed]
- Fallback: [if used]
- Duration: Xs
- Cost: $X.XX (estimate)

---
```

### 3. Agent Completion

```markdown
## HH:MM | agent | complete | [agent-name]
- Duration: Xs
- Key findings: [1-line summary]

---
```

### 4. Agent Failure

```markdown
## HH:MM | agent | failed | [agent-name]
- Duration: Xs (timeout) | Error: [description]
- Fallback: [what was done instead]

---
```

### 5. Data Quality Issue

```markdown
## HH:MM | research | data-quality | [issue-type]
- Issue: [description]
- Sources: [conflicting sources]
- Resolution: [how resolved]

---
```

### 6. Workflow Complete

```markdown
## HH:MM | research | [type] | [subject]
- Workflow: research
- Intensity: Quick | Standard | Deep
- Duration: Xm Ys
- Output: /path/to/output.md
- Agents: [successful agents] (X/Y success)
- MCPs used: [perplexity, exa, exa-contents, parallel-search, etc.]
- Confidence: High | Medium | Low

---
```

### 7. Content Creation

```markdown
## HH:MM | content | [type] | [subject]
- Workflow: telegram-post | tweet | essay | image
- Duration: Xm Ys
- Output: /path/to/output.md
- Sources: [if research was used]

---
```

### 8. Scheduling

```markdown
## HH:MM | schedule | typefully | [subject]
- Platforms: Twitter | LinkedIn | Both
- Timing: Now | Queue | [ISO timestamp]
- Media: [image path if included]
- Draft ID: [typefully draft ID]

---
```

## Example: Complete Research Workflow Log

Single file: `~/CybosVault/private/.cybos/logs/0104-26.md`

```markdown
## 14:30 | research | workflow-start | Acme Corp
- Type: Company
- Intensity: Standard
- Agents planned: company, market, financial, team

---

## 14:30 | mcp | perplexity | search
- Query: "Acme Corp funding history revenue"
- Status: Success
- Duration: 2.3s
- Cost: $0.02

---

## 14:31 | mcp | exa | search
- Query: "Acme Corp"
- Status: Failed
- Error: Rate limit exceeded (429)
- Fallback: Using parallel-search instead
- Duration: 0.5s
- Cost: $0.00

---

## 14:31 | mcp | parallel-search | web_search_preview
- Query: "Acme Corp company information"
- Status: Success
- Fallback: Used as exa alternative
- Duration: 2.1s
- Cost: $0.03

---

## 14:32 | mcp | exa | getContents
- URLs: https://acme.ai, https://acme.ai/about
- Status: Success
- Duration: 2.1s
- Cost: $0.03

---

## 14:32 | agent | complete | company-researcher
- Duration: 45s
- Key findings: $5M ARR, 150 customers, 80% YoY growth

---

## 14:33 | agent | complete | market-researcher
- Duration: 52s
- Key findings: $50B TAM, 15% CAGR, competitive landscape fragmented

---

## 14:33 | agent | failed | financial-researcher
- Duration: 120s (timeout)
- Fallback: Continued with available data, flagged gap in report

---

## 14:34 | research | data-quality | funding-conflict
- Issue: Conflicting funding data
- Sources: Crunchbase ($15M) vs TechCrunch ($12M)
- Resolution: Used $15M (official announcement), noted conflict

---

## 14:34 | agent | complete | team-researcher
- Duration: 48s
- Key findings: Founder has 2 exits, technical team from FAANG

---

## 14:35 | research | company | Acme Corp
- Workflow: research
- Intensity: Standard
- Duration: 5m
- Output: ~/CybosVault/private/deals/acme-corp/research/0104-acme-corp-26.md
- Agents: company, market, team (financial failed, 3/4 success)
- MCPs used: perplexity, exa, exa-contents, parallel-search
- Confidence: Medium

---
```

## Logging Best Practices

1. **Log immediately** - Log events as they happen, not batched at end
2. **Be specific** - Include relevant details for debugging
3. **Be concise** - One-line summaries, not paragraphs
4. **Log failures** - Especially important for pattern identification
5. **Estimate costs** - Track spending per research type
6. **Don't log sensitive data** - No API keys, no personal info
7. **Chronological order** - Events logged as they occur

## Integration with Workflows

Workflows should log at these points:

```
1. START
   └─ Log workflow-start

2. GATHER (parallel MCP calls)
   └─ Log each MCP call with status/cost

3. ANALYZE (parallel agents)
   └─ Log agent-complete or agent-failed for each

4. SYNTHESIZE
   └─ Log data-quality issues if conflicts found

5. OUTPUT
   └─ Log workflow completion with summary
```

## Cost Estimation

### Perplexity
- `search`: ~$0.01-0.03 per query
- `research` (basic): ~$0.10-0.20 per query
- `research` (deep): ~$0.30-0.50 per query

### Exa (PRIMARY)
- `search`: ~$0.01-0.02 per query
- `getContents`: ~$0.02-0.05 per batch (1-10 URLs)
- `findSimilar`: ~$0.01-0.02 per query

### Parallel Search (FALLBACK)
- `web_search_preview`: ~$0.02-0.04 per query
- `web_fetch`: ~$0.03-0.05 per batch

### Parallel Task
- `createDeepResearch` (standard): ~$0.20-0.40 per task
- `createDeepResearch` (deep): ~$0.60-1.50 per task

### Firecrawl (LAST RESORT)
- `scrape`: ~$0.03-0.05 per URL (use only if exa fails)
- `extract`: ~$0.10-0.20 per batch (rarely needed)

### Playwright
- Per action: ~$0.05-0.10
- Full session: ~$0.50-1.00

## Performance Analysis

Use daily logs to track:
- Average research duration by type and intensity
- Agent success/failure rates
- MCP call success rates and fallback patterns
- Cost per research type
- Data quality trends

Example weekly analysis:
```markdown
# Research Performance (Week of 2026-01-01)

## Duration Averages
- Company (Standard): 3m 45s avg
- Tech (Standard): 4m 20s avg
- Market (Standard): 5m 10s avg

## Agent Success Rates
- company-researcher: 95% (19/20)
- market-researcher: 100% (18/18)
- financial-researcher: 85% (17/20)
- team-researcher: 90% (18/20)

## MCP Success Rates
- perplexity: 98% (45/46)
- exa search: 92% (35/38) - 3 rate limits
- exa getContents: 96% (24/25) - reliable content extraction
- parallel-search: 100% (15/15) - good fallback
- parallel-task: 100% (12/12)
- firecrawl: 95% (3/3 last-resort uses only)

## Cost Tracking
- Total: 15 reports, $8.45
- Average: $0.56 per report
- By intensity: Quick $0.03, Standard $0.35, Deep $1.20
```
