# Error Handling

This reference defines how to handle errors, missing data, and failures during research workflows.

## Core Principles

1. **Never hide failures** - Always surface what went wrong
2. **Continue with partial data** - Don't block entire research on one failure
3. **Flag data quality** - Make confidence levels explicit
4. **Provide context** - Explain what was attempted and why it failed

## Error Types

### MCP Tool Failures

**Symptoms:**
- MCP call returns error
- Timeout or rate limit
- Malformed response

**Response:**
1. Log the error details
2. Note which MCP failed in research output
3. Try alternative MCP if available
4. Continue with available data
5. Flag in "Data Quality Notes" section

**Example:**
```markdown
## Data Quality Notes
- Perplexity search failed (rate limit) - used Exa as fallback
- Some funding data unavailable - Crunchbase returned 404
- Confidence level: Medium (partial data only)
```

Don't:
- Retry same call 3+ times
- Block entire research on one MCP failure
- Fabricate data to fill gaps

### Agent Failures

**Symptoms:**
- Agent times out
- Agent returns incomplete output
- Agent encounters error

**Response:**
1. Note which agent failed
2. Use available agent outputs
3. Synthesize with partial data
4. Flag missing perspective

**Example:**
```markdown
## Sources & Research Methodology
- company-researcher: ✅ Success
- market-researcher: ✅ Success
- financial-researcher: ❌ Failed (timeout)
- team-researcher: ✅ Success

Note: Financial analysis is incomplete due to agent timeout.
```

### Missing Data

**Symptoms:**
- Information not publicly available
- Company in stealth mode
- Recent data not yet indexed

**Response:**
1. Explicitly note what's missing
2. Flag as "Open Question"
3. Suggest how to obtain (e.g., "Ask founder directly")
4. Don't speculate or assume

**Example:**
```markdown
## Open Questions
- Revenue metrics: Not publicly disclosed (ask founder)
- Cap table: Unknown (request during DD)
- Burn rate: Cannot estimate without revenue data
```

### Conflicting Information

**Symptoms:**
- Different sources report different numbers
- Dates don't match
- Contradictory claims

**Response:**
1. Present both versions
2. Cite sources for each
3. Assess which is likely more reliable
4. Note uncertainty explicitly

**Example:**
```markdown
## Funding History
- Crunchbase reports $15M Series A (Feb 2024)
- TechCrunch reports $12M Series A (March 2024)
- **Assessment**: $15M is likely correct (official announcement), TechCrunch may have been initial report before final close
```

## Data Quality Levels

Assign confidence level to research findings:

### High Confidence
- Multiple sources confirm
- Official announcements
- Recent data (<3 months old)
- Primary sources (company website, SEC filings)

### Medium Confidence
- Single reliable source
- Secondary sources (news, databases)
- Data 3-12 months old
- Reasonable inferences from available data

### Low Confidence
- Unverified claims
- Old data (>12 months)
- Third-hand sources
- Speculation or estimates

**Always include confidence assessment:**
```markdown
## Data Quality Notes
- Confidence level: High
  - Funding verified via official announcement
  - Founder backgrounds confirmed on LinkedIn
  - Recent data (within 30 days)

- Confidence level: Medium
  - Revenue estimates from third-party reports
  - Customer count inferred from press releases
```

## Failure Modes to Avoid

### DON'T Fabricate Data
❌ Bad: "Revenue is estimated at $10M" (with no basis)
✅ Good: "Revenue not publicly disclosed"

### DON'T Hide Uncertainties
❌ Bad: Present single number without caveats
✅ Good: "Reported at $15M (Crunchbase) vs $12M (TechCrunch)"

### DON'T Block on Single Failure
❌ Bad: Stop research because one MCP failed
✅ Good: Continue with alternative MCPs and note limitation

### DON'T Over-Retry
❌ Bad: Retry same failing MCP call 5 times
✅ Good: Try once, use fallback, move forward

### DON'T Speculate
❌ Bad: "They probably have 50 employees based on funding"
✅ Good: "Team size not disclosed"

## Graceful Degradation

Research should degrade gracefully based on available data:

### Full Success (100%)
- All MCPs succeeded
- All agents completed
- High confidence data
- No major gaps

### Partial Success (60-99%)
- Most MCPs succeeded (1-2 failures)
- 3+ of 4 agents completed
- Medium confidence data
- Some gaps flagged as open questions

Output: Complete report with noted limitations

### Minimal Success (30-59%)
- Half of MCPs failed
- 2 of 4 agents completed
- Low confidence data
- Many gaps

Output: Partial report with strong caveats

### Critical Failure (<30%)
- Most MCPs failed
- <2 agents completed
- Insufficient data

Response: Abort and explain why research couldn't be completed

## Logging Failures

All errors should be logged in debug logs:

**Location**: `.cybos/logs/research-debug/MMDD-<slug>-YY.md`

**Format**:
```markdown
## HH:MM | ERROR | mcp-call-failed
- MCP: mcp__perplexity__search
- Query: "Acme Corp funding history"
- Error: Rate limit exceeded (429)
- Fallback: Used mcp__exa__search instead
```

## User Communication

When presenting research with errors:

1. **Executive Summary**: Note data limitations upfront
2. **Data Quality Notes**: Dedicated section for all limitations
3. **Open Questions**: Flag what couldn't be determined
4. **Confidence Level**: Overall assessment (High/Medium/Low)

**Example:**
```markdown
## Executive Summary
[3-4 paragraphs...]

**Note**: Financial data is limited due to lack of public disclosure. Funding amounts are confirmed, but revenue and burn rate are unavailable.

---

## Data Quality Notes
- Financial data: Low confidence (no public disclosure)
- Team data: High confidence (verified LinkedIn profiles)
- Market data: Medium confidence (third-party reports)
- Overall confidence: Medium
```

## Recovery Strategies

### MCP Failure Recovery

| Failed MCP | Fallback Strategy |
|------------|-------------------|
| perplexity | → exa search → WebSearch |
| exa search | → parallel-search → WebSearch |
| exa getContents | → parallel-search web_fetch → firecrawl (last resort) → WebFetch |
| parallel-task | → perplexity deep → agent synthesis |

### Agent Failure Recovery

| Failed Agent | Recovery |
|--------------|----------|
| company-researcher | Manual search + note gap |
| market-researcher | Use perplexity market research |
| financial-researcher | Flag as open question for founder call |
| team-researcher | Manual LinkedIn search |

### Complete Research Failure

If research cannot be completed:
1. Explain what was attempted
2. List what failed and why
3. Suggest alternative approach
4. Estimate effort needed for manual research

**Example:**
```markdown
# Research Failed: Acme Corp

Unable to complete research due to:
- Company website offline (404)
- No Crunchbase entry
- No news coverage found
- Founders have no LinkedIn presence

Attempted:
- perplexity search (no results)
- exa search (no results)
- exa getContents (website offline)

Recommendation: Request pitch deck directly from founder for basic information.
```

## Quality Checklist

Before finalizing research, verify:
- [ ] All MCP failures are noted
- [ ] All agent failures are documented
- [ ] Missing data is flagged as "Open Questions"
- [ ] Conflicting information is presented with sources
- [ ] Confidence level is assigned
- [ ] Data Quality Notes section is complete
- [ ] No fabricated or assumed data
- [ ] Recovery strategies were attempted

## Philosophy

**Research with known gaps is more valuable than no research.**

Better to deliver partial, well-documented findings than to:
- Fabricate data
- Hide uncertainties
- Block indefinitely on failures
- Present unverified speculation

Transparency builds trust and enables better decision-making.
