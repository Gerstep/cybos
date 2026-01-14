# Info Style Evals

Evaluation set for iterating on info-style image generation.

## Purpose

These evals test whether the info style produces:
1. Clear visual metaphors (not just text/labels)
2. Correct representation of concepts
3. Proper element placement and hierarchy
4. Handdrawn aesthetic consistency

## Eval Structure

Each eval contains:
- **Source**: Original content the concept comes from
- **Concept**: What the diagram should communicate
- **Input Prompt**: Standard prompt to use for generation
- **Visual Expectation**: What a good result looks like
- **Quality Criteria**: Checklist for evaluation
- **Common Failures**: Known failure modes to watch for
- **Reference**: Original quote from content

## Running Evals

1. Generate image using the Input Prompt
2. Review against Visual Expectation
3. Check all Quality Criteria boxes
4. Note any Common Failures observed
5. If failures: adjust prompt or style definition
6. Regenerate and compare

## Current Evals

| Eval | Tests | Concept Type |
|------|-------|--------------|
| 01 | Before/after comparison | Span of control shift (1:12 → 1:100) |
| 02 | Categorization/hierarchy | Three manager archetypes (M, T, Frontline) |
| 03 | Process compression | Middle layer disappearing |

## Iteration Log

Track changes to style definition here:

| Date | Change | Result |
|------|--------|--------|
| 0107-26 | Initial evals created | Baseline |

## Adding New Evals

When adding evals, pick concepts that:
- Have clear visual representation potential
- Test different diagram types (comparison, process, hierarchy)
- Come from real content (not fabricated)
- Have measurable success criteria
