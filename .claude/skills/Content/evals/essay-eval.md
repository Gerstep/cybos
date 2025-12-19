# Essay Evaluation Framework

Test essay outputs against style guide compliance.

---

## How to Use

1. Generate an essay with `/cyber-essay "topic"`
2. Run this eval against the output
3. Score each category
4. Identify patterns for style guide iteration

---

## Scoring

Each criterion: **0** (fail), **1** (partial), **2** (pass)

Total possible: 46 points
- **40-46**: Excellent. Ship it.
- **32-39**: Good. Minor revisions.
- **23-31**: Needs work. Significant revisions.
- **<23**: Fail. Start over.

---

## Evaluation Criteria

### 1. STRUCTURE (10 points)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Hook** (1-2 sentences, starts with implication/future) | /2 | |
| **Stakes** (clear "why this matters" early) | /2 | |
| **Mechanism** (data, examples, logic in body) | /2 | |
| **Landing** (forward momentum, NOT summary) | /2 | |
| **Paragraph length** (1-3 sentences each) | /2 | |

### 2. VOICE (10 points)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **First person active** ("I think" not "it could be argued") | /2 | |
| **Confident tone** (states positions, not hedges) | /2 | |
| **Personal stakes** (skin in the game visible) | /2 | |
| **Read-aloud test** (sounds like talking) | /2 | |
| **Futurist angle** (future implications present) | /2 | |

### 3. FORMATTING (10 points)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **No em-dashes** (— should not appear) | /2 | |
| **No oxford commas** ("A, B and C" not "A, B, and C") | /2 | |
| **No semicolons** (in casual writing) | /2 | |
| **No over-fragmentation** (inline lists use commas, not periods) | /2 | |
| **White space** (paragraphs separated, readable) | /2 | |

### 4. ANTI-PATTERNS (12 points)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **No LLM openers** (no "Let's delve into", "In this essay") | /2 | |
| **No LLM closers** (no "In conclusion", mic-drops) | /2 | |
| **No banned words** (delve, leverage, tapestry, etc.) | /2 | |
| **No LLM structures** ("This isn't X, it's Y", "Here's the turn", hollow declaratives) | /2 | |
| **No vague attribution** ("they call it", "research shows" without source) | /2 | |
| **No transition filler** (Moreover, Furthermore, etc.) | /2 | |

### 5. EVIDENCE (4 points)

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Claims have support** (names, numbers, examples) | /2 | |
| **No vague claims** ("many companies" → specific names) | /2 | |

---

## Quick Red Flags

Instant fail indicators (any one = needs revision):

- [ ] Opens with "In this essay" or similar
- [ ] Contains "It's important to note that"
- [ ] Ends with "In conclusion" or "To summarize"
- [ ] Uses "delve", "leverage", "tapestry", "landscape"
- [ ] Contains "Moreover", "Furthermore", "Additionally"
- [ ] Uses em-dash (—) anywhere
- [ ] Uses "This isn't X. It's Y." pattern
- [ ] Uses "But here's the turn" or "Here's the thing"
- [ ] Uses hollow declaratives ("The opportunity is clear", "The implications are profound")
- [ ] Uses vague attribution ("They call it", "Research shows" without naming source)
- [ ] Over-fragments inline lists with periods instead of commas
- [ ] Dramatic mic-drop ending ("This isn't the future...")
- [ ] Paragraphs longer than 4 sentences
- [ ] No specific examples (all abstract)

---

## Sample Test Prompts

Use these to generate test essays:

**Test 1: Technical thesis**
```
/cyber-essay "Why AI wrappers will mostly fail in the next 18 months"
```

**Test 2: Futurism**
```
/cyber-essay "Machine-to-machine payments will be bigger than human payments by 2030"
```

**Test 3: Personal experience**
```
/cyber-essay "What I learned from reviewing 200 AI startups this year"
```

**Test 4: Contrarian take**
```
/cyber-essay "Most AI safety discourse is status games"
```

**Test 5: Market analysis**
```
/cyber-essay "The TEE compute thesis: why trusted execution matters for AI"
```

---

## Eval Output Template

After scoring, summarize:

```markdown
## Essay Eval: [Title]

**Date**: YYYY-MM-DD
**Total Score**: X/40

### Scores by Category
- Structure: X/10
- Voice: X/10
- Formatting: X/8
- Anti-patterns: X/8
- Evidence: X/4

### Red Flags Found
- [List any instant fail indicators]

### Strengths
- [What worked well]

### Areas for Improvement
- [What needs revision]

### Style Guide Updates Needed
- [Any patterns suggesting the guide needs updating]
```

---

## Iteration Process

1. Run 5 test prompts
2. Score each essay
3. Identify common failure patterns
4. Update style guides to address patterns
5. Repeat until average score >32

---

## Notes

- Run evals after any style guide changes
- Track scores over time to measure improvement
- Use failures to refine anti-pattern lists
- Best test: would you actually publish this?
