---
name: cyber-summarize
description: Summarize various content types (therapy sessions, meetings, documents) into structured notes. Use when processing transcripts or long-form content.
---

Summarize transcripts and long-form content into structured notes.

**Usage:**
- `/cyber-summarize therapy @path/to/transcript.md`
- `/cyber-summarize therapy @path/to/transcript.txt`

**Arguments:**
- Type: `therapy` (required, more types coming)
- Content: @-prefixed file path to transcript (required)

**Example:**
```
/cyber-summarize therapy @downloads/session-2026-01-15.txt
```

**Workflow:**

Follow the appropriate workflow based on type:
- `therapy` → @.claude/skills/Summarize/workflows/therapy.md

**Output Locations:**
- Therapy: `~/CybosVault/private/context/my-life/therapy/YYYY-MM-DD-summary.md`

**Supported Types:**
- `therapy` - Therapy session transcripts (Russian output)
- `meeting` - (coming soon) Meeting transcripts
- `document` - (coming soon) Long documents
