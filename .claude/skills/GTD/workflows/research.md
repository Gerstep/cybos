# Research Workflow

Handle: company names, "research X", "DD on X", "look into X"

## Steps

1. **Identify research type:**
   - Company name → company research
   - Technology/topic → tech research
   - Market/sector → market research
2. **Delegate to Research skill:**
   - Company: @.claude/skills/Research/workflows/company.md
   - Tech: @.claude/skills/Research/workflows/tech.md
   - Market: @.claude/skills/Research/workflows/market.md
3. **Output location:**
   - GTD tasks output to `/content/work/` (not `/deals/`)
   - Summary format, not full research report

## Output Format

For GTD-triggered research, use condensed format:

```markdown
## Quick Summary

[2-3 sentence overview]

## Key Facts

- Founded: [year]
- Team: [size, notable people]
- Funding: [stage, amount]
- Product: [what they do]

## Relevance

[Why this matters for cyber•Fund / current priorities]

## Next Steps

- [ ] Schedule call with founder
- [ ] Deep research (run /cyber-research-company)
- [ ] Pass / not a fit because [reason]

## Sources

- [URL 1]
- [URL 2]
```

## Intensity

GTD research is **quick** by default (10-30s).
For deep research, suggest: "Want me to run full DD with /cyber-research-company?"

## Links

Full research workflows:
- @.claude/skills/Research/workflows/company.md
- @.claude/skills/Research/workflows/tech.md
- @.claude/skills/Research/workflows/market.md
