# Tweet Workflow

Create English tweets and threads for Twitter/X.

---

## Required Context

**Load before drafting:**
1. `context/style/voice-identity.md` - Persona, tone, anti-patterns
2. `context/style/writing-style-en.md` - English style rules, tweet structure

---

## Workflow

### 1. ASSESS

Check if topic contains factual claims:
- **YES** → Verify key data with quick search
- **NO** (opinion, analysis) → Skip to drafting

### 2. DRAFT

Follow `writing-style-en.md` tweet section:

**Requirements:**
- Genuinely valuable (would you bookmark this?)
- Immediately actionable (blueprint, not just insight)
- Sparks natural engagement (structure creates replies/bookmarks)

**Hook patterns:**
- "how to X" / "here's how"
- "why X doesn't work"
- "the X mistake you're making"
- Direct contrarian take with evidence

**Format:**
- One sentence per line
- White space between sections
- Lists for complex info (-, >, 1.)
- Simple language (conversational, not jargon)

### 3. FORMAT

**Single tweet:** One idea, maximum compression.

**Thread:**
- Tweet 1: Hook. Whole thread in one line.
- Tweets 2-N: One idea per tweet.
- Last tweet: Forward momentum, not "that's a wrap"

**Length:**
- Short thread: 3-5 tweets
- Medium thread: 6-10 tweets
- Single tweet: Quick takes only

### 4. OUTPUT

Display final version:

```
═══════════════════════════════════════
🐦 TWITTER
═══════════════════════════════════════

[Tweet 1/n - Hook]

[Tweet 2/n]

[Tweet 3/n]

...

═══════════════════════════════════════
```

Save to `~/CybosVault/private/content/tweets/MMDD-<slug>-YY.md`

### 5. IMAGE (if requested)

Use `@.claude/skills/Content/workflows/image.md`

### 6. LOG

Append to `~/CybosVault/private/.cybos/logs/MMDD-YY.md`:

```markdown
## HH:MM | content | tweet | [Topic]
- Workflow: tweet
- Thread length: [n] tweets
- Data verified: yes/no
- Output: ~/CybosVault/private/content/tweets/MMDD-<slug>-YY.md

---
```

---

## Quality Gates

Before output, verify against `writing-style-en.md`:

- [ ] Value: Would you bookmark this?
- [ ] Actionable: Teaches a system, not just points at something
- [ ] Hook: "how to" or clear value signal, one line max
- [ ] Format: One sentence per line, lists, white space
- [ ] Language: Conversational, not jargon soup
- [ ] Engagement: Ends with question OR controversial stance
- [ ] Specificity: Every claim has number or name
- [ ] Voice: Sounds like you, not LLM-generated

---

## File Format

```markdown
# Tweet: [Topic Slug]

**Date**: MMDD-YY
**Status**: Draft | Published
**Platform**: Twitter

---

## Thread

[Tweet 1/n]
[Hook - one line]

[Tweet 2/n]
[Content]

...

---

## Sources

| Claim | Source |
|-------|--------|
| [Key claim] | [URL] |

## Metadata

- Topic: [category]
- Research: [yes/no]
- Thread length: [n tweets]
```
