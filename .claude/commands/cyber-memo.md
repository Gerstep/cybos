Generate investment memo for a company.

Load workflow:
@.claude/skills/DDMemo/workflows/generate.md

Load investment context:
@context/investment-philosophy.md

Load memo template:
@context/MEMO_template.md

Company: $ARGUMENTS

**Prerequisites**: Company research must exist in ~/CybosVault/private/deals/<company>/research/

Execute the DD memo workflow:

1. **GATHER**: Load all research and context
   - All research reports from ~/CybosVault/private/deals/<company>/research/
   - Deal context from ~/CybosVault/private/deals/<company>/index.md
   - Investment philosophy and memo template

2. **ANALYZE**: Use memo-analyst agent (Opus model) for strategic analysis
   - Apply investment rubric to score 10 categories
   - Provide executive summary and investment thesis
   - Identify risks and recommend next steps
   - Make clear recommendation (INVEST/PASS/MORE DILIGENCE)

3. **WRITE**: Use memo-writer agent (Sonnet) to fill template
   - Complete all memo sections following template structure
   - Include scoring sheet, financial analysis, exit scenarios
   - Prepare IC Q&A and document sources

4. **REVIEW**: Verify completeness
   - Check all sections present
   - Validate scoring and recommendation
   - Flag information gaps

5. **OUTPUT**: Save memo to ~/CybosVault/private/deals/<company-slug>/memo/memo.md
   - **Overwrites** previous version (living document)

6. **LOG**: Log memo generation to ~/CybosVault/private/.cybos/logs/MMDD-<slug>-YY.md

Apply cyber•Fund rubric rigorously: legendary outcomes, defensible moats, strong founders, market timing.
