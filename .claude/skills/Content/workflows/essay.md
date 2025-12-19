# Essay Workflow

Write long-form English content for Twitter articles, LinkedIn, standalone publications.

---

## Required Context

**Load before drafting:**
1. `context/style/voice-identity.md` - Persona, tone, anti-patterns
2. `context/style/writing-style-en.md` - English style rules, essay structure

---

## Workflow

### 1. ASSESS

Check if topic requires research:
- **Data claims?** → Verify with quick search before writing
- **Opinion/analysis?** → Skip to drafting

If sources provided (@file references):
- Read all source files
- Extract key ideas, arguments, data
- Use as foundation, not final content

### 2. DRAFT

Choose mode based on source and audience:

**Narrative Mode** (general audience):
- Hook → Stakes → Mechanism → Turn (optional) → Landing
- Smooth flow, one clear thread

**Analytical Mode** (VCs, founders, engineers, research-based):
- Show reasoning before conclusions
- Preserve source's technical nuance
- Keep genuine questions as genuine
- Open questions section optional
- No invented metaphors unless they add analytical value

Default to analytical when source material is research.

**Length:**
- Short: 500-800 words (single idea)
- Standard: 800-1500 words (thesis + arguments)
- Deep: 1500-2500 words (complex topic)

Don't pad. If the idea is complete, stop.

### 3. REVIEW

Present draft to user:

```
ESSAY DRAFT
===========

[Title]

[Full essay text]

---
Word count: [X]
Reading time: ~[X] min

Feedback needed:
- Structure changes?
- Tone adjustments?
- Add/remove sections?
- Factual corrections?
- Or approve to finalize
```

Wait for user response.

### 4. POLISH

Apply feedback while maintaining voice:
- Preserve persona from `voice-identity.md`
- Keep style consistent with `writing-style-en.md`
- Run through self-review checklist

### 5. OUTPUT

Save to `~/CybosVault/private/content/essays/MMDD-<slug>-YY.md`

Format:
```markdown
---
date: YYYY-MM-DD
title: [Title]
word_count: [X]
reading_time: [X min]
status: draft | published
sources: [list if any]
---

# [Title]

[Essay content]

---

## Sources
- [Citations if applicable]
```

### 6. LOG

Append to `~/CybosVault/private/.cybos/logs/MMDD-YY.md`:

```markdown
## HH:MM | content | essay | [title-slug]
- Workflow: essay
- Word count: [X]
- Sources: [list if used]
- Output: ~/CybosVault/private/content/essays/MMDD-<slug>-YY.md

---
```

---

## Quality Gates

Before output, verify against `writing-style-en.md` checklist:

- [ ] First sentence grabs attention
- [ ] Every paragraph 1-3 sentences max
- [ ] No em-dashes, oxford commas, semicolons
- [ ] No LLM-speak words
- [ ] No "This isn't just" or "This isn't X, it's Y" patterns
- [ ] List items not bolded with colons
- [ ] Every claim has name, number or example
- [ ] Ending has forward momentum (not summary)

**Analytical mode additional gates:**
- [ ] Reasoning shown before conclusions
- [ ] Technical concepts match source nuance
- [ ] Genuine questions preserved as genuine

---

## Notes

- Essays often expand from `~/CybosVault/private/content/ideas/` drafts
- Can expand tweet threads into full essays
- Link to related research when relevant
- Consider publishing on: Twitter Articles, LinkedIn, Mirror, personal site
