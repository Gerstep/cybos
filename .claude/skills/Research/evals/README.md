# Research Skill Evaluations

This directory contains evaluations for testing the research skill's effectiveness across all research types.

## Evaluation Types

### 1. Company Research (`company-research-eval.json`)
Tests comprehensive company due diligence workflow.

**Test query**: Research a well-known company (Anthropic)
**Key validations**:
- All 4 agents execute successfully
- Investment lens applied
- Proper file organization
- Logging completed

### 2. Technology Research (`tech-research-eval.json`)
Tests deep technical analysis and investment connection.

**Test query**: Research Trusted Execution Environments (TEEs)
**Key validations**:
- Technical depth achieved
- Big Tech threat evaluated
- Companies identified
- Timing analysis included

### 3. Market Research (`market-research-eval.json`)
Tests market sizing and opportunity identification.

**Test query**: Research AI infrastructure market
**Key validations**:
- TAM/SAM/SOM provided
- White spaces identified
- Companies mapped
- Investment opportunities surfaced

### 4. Topic Research (`topic-research-eval.json`)
Tests research for content creation and thesis development.

**Test query**: Research post-labor economy concept
**Key validations**:
- Multiple perspectives gathered
- Connection to thesis made
- Content-ready insights provided
- Key thinkers identified

## Running Evaluations

### Baseline (Current Implementation)

Before making ANY changes to research workflows:

1. **Run all 4 evals manually**:
   ```
   /cyber-research-company "Anthropic"
   /cyber-research-tech "Trusted Execution Environments"
   /cyber-research-market "AI Infrastructure"
   /cyber-research-topic "post-labor economy"
   ```

2. **Document baseline results**:
   - Did it complete successfully?
   - Which expected_behavior items were met?
   - Which quality_indicators were present?
   - What failed or was missing?

3. **Save baseline outputs** to `evals/baseline/`:
   ```
   evals/baseline/
   ├── company-anthropic-MMDD-YY.md
   ├── tech-tees-MMDD-YY.md
   ├── market-ai-infra-MMDD-YY.md
   └── topic-post-labor-MMDD-YY.md (will fail - no workflow yet)
   ```

### After Changes

After implementing improvements:

1. **Re-run all 4 evals** with same queries
2. **Compare to baseline**:
   - More expected_behavior items met?
   - Better quality_indicators?
   - Fewer failure_indicators?
   - Improved structure/formatting?
3. **Document improvements** in eval results

## Evaluation Checklist

For each eval run, check:

### Process Quality
- [ ] Workflow loaded correctly
- [ ] MCP calls executed (no silent failures)
- [ ] All agents spawned and completed
- [ ] Synthesis consolidated findings
- [ ] Output saved to correct location
- [ ] Log entry created

### Content Quality
- [ ] Specific data/metrics cited
- [ ] Sources documented
- [ ] Investment lens applied
- [ ] Risks honestly assessed
- [ ] Thesis fit evaluated

### Format Quality
- [ ] All required sections present
- [ ] Consistent structure
- [ ] Clear headings
- [ ] Proper markdown formatting
- [ ] Standardized agent output format (if implemented)

## Adding New Evaluations

When creating new evals:

1. **Choose representative queries**:
   - Well-known entities (easier to validate)
   - Edge cases (test error handling)
   - Variants (different difficulty levels)

2. **Define expected_behavior clearly**:
   - What should happen step-by-step
   - Which agents should execute
   - What output structure is expected

3. **Set realistic success_criteria**:
   - must_have: Non-negotiable requirements
   - quality_indicators: Signals of excellence
   - failure_indicators: Red flags

4. **Include test_variants**:
   - Easier/harder versions of same eval
   - Different domains
   - Edge cases

## Evaluation Results Log

Track eval results here:

### Baseline (Current Implementation)
Date: ___________
Results: ___________

### After Phase 1 (YAML + Logging)
Date: ___________
Results: ___________

### After Phase 2 (Agent Format + Topic Workflow)
Date: ___________
Results: ___________

### After Phase 3 (Progressive Disclosure)
Date: ___________
Results: ___________

## Notes

- **Run baseline FIRST** - Before any changes
- **Document failures** - Helps prioritize fixes
- **Compare systematically** - Use same queries for before/after
- **Iterate based on results** - Let evals guide improvements

## Best Practices (from Claude Skills docs)

1. ✅ Create evals BEFORE writing extensive documentation
2. ✅ Ensure Skills solve real problems vs imagined ones
3. ✅ Use evals to measure improvement
4. ✅ Test with all models you plan to use (Haiku, Sonnet, Opus)
5. ✅ Build evaluation-driven development workflow
