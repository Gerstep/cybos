---
name: cyber-schedule
description: Schedule content to Twitter and/or LinkedIn via Typefully
---

Schedule content to social media platforms via Typefully API v2.

**Usage:**
- `/cyber-schedule @content/tweets/MMDD-topic-YY.md`
- `/cyber-schedule "Raw text content to post"`
- `/cyber-schedule @content/posts/MMDD-post-YY.md --image @content/images/MMDD-img-YY.png`

**Arguments:**
- Content: @-prefixed file path OR raw text in quotes (required)
- --image: Optional @-prefixed path to image file
- --account: Optional account (sgershuni/cyberfund/dagihouse)

**Examples:**
```
/cyber-schedule @content/tweets/0104-ai-agents-26.md
/cyber-schedule "Quick thought about AI agents"
/cyber-schedule @content/posts/0104-post-26.md --account cyberfund
```

**Workflow:**

Follow the schedule workflow:
@.claude/skills/Content/workflows/schedule.md

This workflow will:
1. Parse content (file or raw text)
2. Ask for account selection (@sgershuni default)
3. Ask for platform selection (Twitter/LinkedIn/Both)
4. Ask for timing (draft/now/queue/scheduled)
5. Upload images if specified
6. Create draft via Typefully v2 API
7. Log action

**API Notes:**
- Uses Typefully API v2 (not v1)
- Auth: Bearer token via TYPEFULLY_API_KEY in .env
- If auth fails, regenerate key at https://typefully.com/settings/api
