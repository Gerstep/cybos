# DD Memo Generation Workflow

Generate comprehensive investment memo from research for Investment Committee review.

## Prerequisites

Before running this workflow:
- [ ] Company research exists in `/deals/<company>/research/`
- [ ] Deal context exists in `/deals/<company>/.cybos/context.md`
- [ ] Multiple research reports preferred (more data = better memo)

## Inputs

- Company name (from user or slash command)
- Investment philosophy (`context/investment-philosophy.md`)
- Memo template (`context/MEMO_template.md`)

## Workflow Steps

### 1. GATHER

Load all available context:

```
Read files:
- /deals/<company>/.cybos/context.md
- /deals/<company>/research/*.md (all research reports)
- context/investment-philosophy.md
- context/MEMO_template.md
```

If research is missing or sparse:
- Warn user that memo will be limited
- Suggest running `/cyber-research-company` first
- Proceed with available data, flagging gaps

### 2. ANALYZE (memo-analyst agent with Opus)

```
Task: memo-analyst
Model: opus
Prompt: "Conduct comprehensive investment analysis for [company name] using cyber•Fund's investment philosophy and rubric.

Company research available:
[Include all research report content]

Deal context:
[Include deal context]

Investment Philosophy:
[Include investment-philosophy.md content]

Apply the decision-making rubric and score each category:
1. Market Size (TAM)
2. Moat / Defensibility
3. Business Model
4. Founder Profile
5. "Why Now?"
6. Valuation
7. Team
8. Product
9. Competition
10. Potential Return

For each category:
- Score: Strong / Medium / Weak / Red Flag
- Assessment: Detailed analysis
- Rationale: Evidence from research

Also provide:
- Executive Summary (2-3 paragraphs)
- Investment Thesis (bull case)
- Key Risks (with suggested mitigations)
- Unanswered Questions
- Recommendation: STRONG YES / YES / MAYBE / PASS / HARD PASS
- Suggested Next Steps

Be intellectually honest - apply the rubric rigorously, flag red flags, think in base rates.
"
```

### 3. WRITE (memo-writer agent with Sonnet)

```
Task: memo-writer
Model: sonnet
Prompt: "Write a comprehensive investment memo for [company name] following cyber•Fund's MEMO template.

Strategic Analysis:
[Include memo-analyst output]

Company Research:
[Include all research]

Deal Context:
[Include deal context]

Template Structure:
[Include MEMO_template.md]

Fill out ALL sections of the template:
- Executive Summary & Investment Thesis
- Scoring Sheet (use scores from analyst)
- Product (overview, features, technology, roadmap)
- Business Model (revenue model, unit economics, pricing, tokenomics if applicable)
- Technology (architecture, innovation, scalability, Big Tech threat)
- Traction & Metrics
- Market Analysis (TAM/SAM/SOM, dynamics, timing, thesis fit)
- Competition (landscape, positioning, advantages, threats)
- Go-To-Market Strategy
- Team (founders with backgrounds, team assessment, gaps)
- Financials (funding history, current metrics, cap table)
- Financial Projections
- Investment Overview (deal terms, use of funds, rights)
- Exit Analysis (comparables, potential acquirers, return scenarios)
- Risks & Mitigations
- IC Q&A (anticipated questions)
- Recommendation (decision, amount, rationale, confidence, next steps)
- Appendix (sources, materials)

Be comprehensive, use specific data, flag information gaps explicitly.
"
```

### 4. REVIEW (Self-Check)

Verify memo completeness:

```
Checklist:
- [ ] All template sections present
- [ ] Scoring sheet complete with rationales
- [ ] Investment thesis clearly articulated
- [ ] Risks identified with mitigations
- [ ] Financial projections included or noted as unavailable
- [ ] Exit scenarios modeled
- [ ] IC questions anticipated
- [ ] Clear recommendation with confidence level
- [ ] Sources documented
- [ ] Information gaps flagged
```

If gaps exist:
- Note in memo what information is missing
- Include in "Next Steps" how to get it
- Adjust confidence level accordingly

### 5. OUTPUT

Save memo to:
- Path: `/deals/<company-slug>/memo/memo.md`
- **OVERWRITES** previous version (memo is living document)

Consider backing up previous version:
- If significant memo already exists, save backup to `/deals/<company-slug>/memo/memo_MMDD-YY_backup.md`

### 6. LOG

Append to `/.cybos/logs/MMDD-<slug>-YY.md`:

```markdown
## HH:MM | memo | dd-memo | [Company Name]
- Workflow: dd-memo
- Duration: [Xm Ys]
- Output: /deals/<company-slug>/memo/memo.md
- Agents: memo-analyst (Opus), memo-writer (Sonnet)
- Research inputs: [number of research reports used]
- Recommendation: [INVEST/PASS/MORE DILIGENCE]

---
```

## Expected Duration

8-15 minutes (Opus analysis is slower but deeper)

## Success Criteria

- [ ] Memo follows template structure completely
- [ ] All 10 scoring categories evaluated
- [ ] Strategic analysis incorporates investment philosophy
- [ ] Clear investment recommendation
- [ ] Risks and mitigations identified
- [ ] Exit scenarios modeled
- [ ] Saved to correct location
- [ ] Log entry appended

## Scoring Rubric

Apply rigorously (from memo-analyst):

| Score | Meaning |
|-------|---------|
| **Strong** | Clear strength, competitive advantage, exceeds bar |
| **Medium** | Meets bar, acceptable but not exceptional |
| **Weak** | Below bar, concern but not fatal |
| **Red Flag** | Critical issue, likely disqualifying |

Weighted scoring:
- Team: 25%
- Product: 20%
- Business Model: 15%
- Market: 15%
- Competition: 10%
- Financials: 10%
- Potential Return: 5%

## Investment Recommendations

- **STRONG YES**: High conviction, legendary outcome potential, minimal concerns
- **YES**: Solid opportunity, good fit, manageable risks
- **MAYBE**: Interesting but needs more diligence, key uncertainties
- **PASS**: Doesn't meet bar, too many concerns
- **HARD PASS**: Clear disqualifiers, auto-pass triggers hit

## Common Issues

**Insufficient Research**:
- Run `/cyber-research-company` first
- Memo will have major gaps without research foundation

**Missing Financial Data**:
- Note what's unavailable
- Include in next steps: "Request financial model from founders"

**Unclear Thesis Fit**:
- Explicitly address how this relates to cyber•Fund focus
- If weak fit, explain why considering anyway

**Weak Founder Assessment**:
- Schedule founder call if not done
- Memo should note "pending founder meeting"

## Best Practices

1. **Use multiple research reports** - More data = better analysis
2. **Be intellectually honest** - Don't rationalize away red flags
3. **Show your work** - Cite research sources in memo
4. **Model scenarios** - Bear/base/bull cases for exits
5. **Prepare IC** - Anticipate hard questions
6. **Update as needed** - Memo is living document, overwrite as new info comes in

## Auto-Pass Triggers to Flag

If any apply, should likely be PASS:
- Can Big Tech build in 6 weeks?
- Pure wrapper with no moat
- Media/entertainment robotics play
- Regional stablecoin vs global giants
- Generic devtools without massive pain point
- >$100M FDV pre-product/pre-revenue (unless exceptional team)

## Notes

- Memo generation often follows immediately after company research
- Can regenerate memo as new information becomes available
- Opus analysis provides strategic depth worth the wait
- Template ensures consistency across all investment decisions
- Memo becomes the primary IC document
