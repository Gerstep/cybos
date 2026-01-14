---
name: cyber-schedule
description: Schedule content to Twitter and/or LinkedIn via Typefully
---

Schedule content to social media platforms via Typefully.

**Usage:**
- `/cyber-schedule @content/tweets/MMDD-topic-YY.md`
- `/cyber-schedule @content/posts/MMDD-post-YY.md --image @content/images/MMDD-img-YY.png`

**Arguments:**
- Content file: @-prefixed path to content file (required)
- --image: Optional @-prefixed path to image file

**Example:**
```
/cyber-schedule @content/tweets/0104-ai-agents-26.md --image @content/images/0104-ai-26.png
```

**Workflow:**

Follow the schedule workflow:
@.claude/skills/Content/workflows/schedule.md

This workflow will:
1. Load content from specified file
2. Ask for platform selection (Twitter/LinkedIn/Both)
3. Ask for timing (now/later/queue)
4. Upload images if specified
5. Create draft in Typefully
6. Save locally and log action
