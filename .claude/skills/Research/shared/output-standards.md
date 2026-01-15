# Output Standards

This reference defines standardized formats for research outputs, agent communications, and logging.

## Agent Output Format

All research agents must use this standardized format for consistency and clarity.

### Emoji Conventions

Use specific emojis to signal status and sections:

| Emoji | Meaning | Usage |
|-------|---------|-------|
| 🔍 | Starting research | Beginning of agent work |
| 📊 | Data section | Presenting findings/data |
| 💡 | Insights | Key insights or analysis |
| ⚠️ | Warning/Concern | Risks or red flags |
| ✅ | Success | Positive findings or green flags |
| ❌ | Failure/Missing | Failed attempts or missing data |
| 🎯 | Completion | Agent task completed |
| 🔗 | Sources | References and citations |

### Agent Output Structure

Every agent output follows this structure:

```markdown
🔍 **STARTING:** [Agent Name] researching [subject]

## [Section 1 Title]
📊 [Data and findings]

## [Section 2 Title]
📊 [Data and findings]

💡 **Key Insights**:
- [Insight 1]
- [Insight 2]

⚠️ **Concerns**:
- [Concern 1 if any]

✅ **Strengths**:
- [Strength 1 if any]

🔗 **Sources**:
- [Source 1]
- [Source 2]

🎯 **COMPLETED:** [Agent Name] finished [subject] research
```

### Example: Company Researcher Output

```markdown
🔍 **STARTING:** company-researcher analyzing Acme Corp

## Business Model
📊 Acme Corp provides AI infrastructure for enterprise customers with a usage-based SaaS model. Revenue streams:
- API usage fees (80% of revenue)
- Enterprise contracts (20% of revenue)

## Traction & Metrics
📊 Current metrics:
- 10,000 API users
- 150 enterprise customers
- $5M ARR (80% YoY growth)
- 30% MoM revenue growth

💡 **Key Insights**:
- Strong API adoption indicates product-market fit
- Enterprise segment growing faster (120% YoY)
- Net dollar retention >130%

✅ **Strengths**:
- Clear path to $100M ARR at current growth
- High retention indicates strong product

⚠️ **Concerns**:
- Revenue concentrated in top 10 customers (60%)
- Negative gross margins on small accounts

🔗 **Sources**:
- Company website (acme.ai)
- TechCrunch (Jan 2024)
- Crunchbase

🎯 **COMPLETED:** company-researcher finished Acme Corp analysis
```

## Research Report Format

All consolidated research reports follow this structure:

### Header
```markdown
# Research Report: [Subject]

**Type**: Company | Technology | Market | Topic
**Date**: MMDD-YY
**Research Level**: Quick | Standard | Deep
**Research Sources**: [MCPs used]
**Confidence**: High | Medium | Low

---
```

### Executive Summary
3-4 paragraphs covering:
- What this is (company/tech/market)
- Key findings across dimensions
- Investment perspective (cyber•Fund lens)
- Overall assessment

### Main Sections
Varies by research type (see type-specific formats)

### Investment Lens (REQUIRED)
Apply cyber•Fund rubric:
- Thesis fit
- TAM assessment
- Defensibility
- Business model quality
- Founder profile
- Timing
- Valuation

### Key Findings (REQUIRED)
```markdown
## Key Findings

### Strengths
1. [Strength with evidence]
2. [Strength with evidence]

### Concerns
1. [Concern with evidence]
2. [Concern with evidence]

### Open Questions
- [Question 1]
- [Question 2]
```

### Conclusion (REQUIRED)
```markdown
## Conclusion

### Overall Assessment
[2-3 paragraphs synthesizing findings]

### Investment Perspective
**Preliminary View**: Interesting | Worth exploring | Likely pass | Hard pass
**Rationale**: [Why this view]

### Recommended Next Steps
1. [Action 1]
2. [Action 2]
```

### Sources & Methodology (REQUIRED)
```markdown
## Sources & Research Methodology

### Agent Results
- company-researcher: ✅ Success
- market-researcher: ✅ Success
- financial-researcher: ❌ Failed (timeout)
- team-researcher: ✅ Success

### MCP Tools Used
- perplexity search: 3 queries
- exa search: 2 queries
- firecrawl scrape: 1 URL

### Data Quality Notes
- [Limitations or gaps]
- [Conflicting information]
- Confidence level: High | Medium | Low
```

## Type-Specific Formats

### Company Research

Main sections:
1. Executive Summary
2. Company Overview
   - Business Model
   - Product/Service
   - Traction & Growth
   - Recent Developments
3. Market Analysis
4. Team & Organization
5. Financial Analysis
6. Investment Lens
7. Key Findings
8. Conclusion
9. Sources & Methodology

### Technology Research

Main sections:
1. Executive Summary
2. Technical Overview
3. Maturity Assessment
4. Technical Moat
5. Competitive Landscape
6. Adoption & Ecosystem
7. Investment Lens
8. Key Findings
9. Conclusion
10. Sources & Methodology

### Market Research

Main sections:
1. Executive Summary
2. Market Size & Structure
3. Competitive Landscape
4. Market Dynamics
5. "Why Now?" Analysis
6. Investment Lens
7. Key Findings
8. Conclusion
9. Sources & Methodology

### Topic Research

Main sections:
1. Executive Summary
2. Topic Overview
3. Key Perspectives
4. Supporting Evidence
5. Contrarian Views
6. Practical Applications
7. Investment Lens (if applicable)
8. Content Insights
9. Sources & Methodology

## File Naming Conventions

### Research Reports
Format: `MMDD-[subject-slug]-YY.md` (logs) or `MMDD-<slug>-YY.md` (research/content)

Examples:
- `2026-01-02-company-acme-corp.md`
- `2026-01-02-tech-tees.md`
- `2026-01-02-market-ai-infra.md`
- `2026-01-02-topic-post-labor-economy.md`

### Debug Logs
Format: `MMDD-YY.md` (single file per day)

Location: `.cybos/logs/research-debug/`

### MCP Usage Logs
Format: `MMDD-YY.md` (single file per day)

Location: `.cybos/logs/mcp-usage/`

## Logging Format

### Research Debug Logs

```markdown
## HH:MM | [LEVEL] | [event-type]
- Context: [What was happening]
- Details: [Specific information]
- Result: [Outcome]

---
```

Levels: INFO, WARN, ERROR, DEBUG

### MCP Usage Logs

```markdown
## HH:MM | [MCP-NAME] | [operation]
- Query/URL: [What was requested]
- Status: Success | Failed
- Error: [If failed]
- Fallback: [If used]
- Duration: Xs
- Cost: $X.XX

---
```

## Quality Indicators

Mark research quality explicitly:

**High Quality Research Indicators:**
- ✅ All agents completed successfully
- ✅ Multiple sources confirm findings
- ✅ Recent data (<3 months)
- ✅ No major gaps
- ✅ High confidence level

**Medium Quality Research Indicators:**
- ⚠️ 1-2 agent failures with fallbacks
- ⚠️ Some data gaps flagged
- ⚠️ Data 3-12 months old
- ⚠️ Medium confidence level

**Low Quality Research Indicators:**
- ❌ Multiple agent failures
- ❌ Significant data gaps
- ❌ Old or unverified data
- ❌ Low confidence level

## Markdown Style Guide

### Headings
- `#` for report title
- `##` for major sections
- `###` for subsections
- `####` for sub-subsections (rare)

### Lists
- Use `-` for unordered lists
- Use `1.` for ordered lists
- Indent nested lists with 2 spaces

### Emphasis
- **Bold** for important terms, metrics, companies
- *Italic* for emphasis
- `Code` for technical terms, commands, APIs

### Links
- Always use markdown links: `[Text](URL)`
- Never bare URLs in final output

### Tables
Use for structured data:
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

### Code Blocks
Use triple backticks with language:
````markdown
```python
# Code example
```
````

### Quotes
Use `>` for quotes and citations:
```markdown
> "Direct quote from source"
> — Source attribution
```

## Length Guidelines

### Executive Summary
- Target: 150-250 words
- Max: 300 words

### Overall Report
- Quick research: 500-1,000 words
- Standard research: 1,500-3,000 words
- Deep research: 3,000-6,000 words

### Agent Outputs
- Target: 200-400 words per agent
- Focus on data, not prose

## Tone Guidelines

- **Objective** - Present facts, not opinions
- **Concise** - No fluff or filler
- **Precise** - Specific numbers and dates
- **Analytical** - Apply investment lens
- **Honest** - Flag uncertainties and gaps
- **Professional** - VC audience

Avoid:
- Hype or promotional language
- Vague claims without evidence
- Speculation presented as fact
- Overly technical jargon (explain when necessary)

## Completion Signals

Every agent must end with completion signal:

```markdown
🎯 **COMPLETED:** [agent-name] completed [task-description]
```

Examples:
- `🎯 **COMPLETED:** company-researcher completed Acme Corp analysis`
- `🎯 **COMPLETED:** synthesizer completed investment report consolidation`

This signals to the orchestrator that the agent finished successfully.

## Quality Checklist

Before finalizing any research output:
- [ ] Uses standardized emoji conventions
- [ ] Includes all required sections
- [ ] Has completion signal (agents)
- [ ] Proper markdown formatting
- [ ] Citations for all data
- [ ] Investment lens applied
- [ ] Data quality noted
- [ ] Open questions flagged
- [ ] Preliminary view stated
- [ ] Recommended next steps included
- [ ] Sources documented
- [ ] File named correctly
- [ ] Appropriate length
- [ ] Professional tone

## Examples

See `.claude/skills/Research/evals/baseline/` for examples of properly formatted research outputs.
