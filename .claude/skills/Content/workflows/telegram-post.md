# Telegram Post Workflow

Create Telegram posts (Russian) with English translation for Twitter. Load handle from `context/identity.md`.

---

## Required Context

**Load before drafting:**
1. `context/identity.md` - Identity reference (name, handles)
2. `context/style/voice-identity.md` - Persona, tone, anti-patterns
3. `context/style/writing-style-ru.md` - Russian style rules, Telegram formatting

---

## Workflow

### 1. ASSESS

Check if topic contains factual claims:
- **YES** → Verify key data with quick search
- **NO** (opinion, philosophy) → Skip to drafting

Report any discrepancies before drafting.

### 2. DRAFT (Russian)

Follow `writing-style-ru.md`:
- Strong hook (first sentence grabs attention)
- What? → So What? → Now What? structure
- 1-3 sentence paragraphs
- Informal modern Russian
- Forward momentum ending (not mic-drop)
- Plain text (no markdown)

### 4. ADD LINKS

**DO link:** Projects, GitHub, articles, YouTube, original sources
**DON'T link:** Case studies, marketing pages

Format for Telegram: `Компания X (https://url) сделала Y`

Aim for 2-5 links per medium post.

### 5. OUTPUT

Display both versions:

```
═══════════════════════════════════════
📱 TELEGRAM (Russian)
═══════════════════════════════════════

[Post text with inline links]

═══════════════════════════════════════
```

Save to `~/CybosVault/private/content/posts/MMDD-<slug>-YY.md`

### 6. IMAGE (if requested)

Use `@.claude/skills/Content/workflows/image.md`

### 7. LOG

Append to `~/CybosVault/private/.cybos/logs/MMDD-YY.md`:

```markdown
## HH:MM | content | post | [Topic]
- Workflow: telegram-post
- Languages: RU, EN
- Data verified: yes/no
- Output: ~/CybosVault/private/content/posts/MMDD-<slug>-YY.md

---
```

---

## Quality Gates

Before output, verify against `writing-style-ru.md`:

- [ ] Hook grabs attention
- [ ] What? → So What? → Now What? structure
- [ ] Forward momentum ending (NOT mic-drop)
- [ ] No LLM phrases from blacklist
- [ ] Every claim has number or name
- [ ] Paragraphs 1-3 sentences
- [ ] Plain text (no markdown)
- [ ] 0-2 emoji max
- [ ] Links to projects/sources (not marketing pages)

---

## File Format

```markdown
# Post: [Topic Slug]

**Date**: MMDD-YY
**Status**: Draft | Published
**Channels**: Telegram, Twitter

---

## Russian (Telegram)

[Full Russian text with inline links]

---


## Sources

| Claim | Source |
|-------|--------|
| [Key claim] | [URL] |

## Metadata

- Topic: [category]
- Research: [yes/no]
- Links: [count]
```
