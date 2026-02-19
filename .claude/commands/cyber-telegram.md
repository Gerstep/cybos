---
name: cyber-telegram
description: Process Telegram messages - read, draft replies, save drafts via GramJS
---

Process Telegram messages via GramJS MTProto client. Read messages, generate AI drafts, and save drafts to Telegram without sending.

**CRITICAL: NEVER SEND MESSAGES. Only save drafts to Telegram.**

## Usage

```bash
# Unread mode (default) - process unread conversations
/cyber-telegram                    # 1 unread dialog
/cyber-telegram --count 3          # 3 unread dialogs

# User mode - find specific person (any read state)
/cyber-telegram --user "@username" # By Telegram username
/cyber-telegram --user "Name"      # By name

# Requests mode - message requests folder
/cyber-telegram --requests         # Non-contacts who messaged you

# Modifiers (work with all modes)
/cyber-telegram --dry-run          # Read only, don't save drafts
/cyber-telegram --no-mark-unread   # Don't preserve unread state
```

## Workflow

**Full workflow documentation:** `.claude/skills/Telegram/workflows/process-messages.md`

**Quick summary:**
1. Run GramJS script to fetch messages
2. Read generated work file
3. Generate AI draft replies
4. Present drafts for approval
5. Save approved drafts to Telegram
6. Report summary and log

## Scripts

| Script | Command |
|--------|---------|
| Fetch messages | `bun scripts/telegram-gramjs.ts [flags]` |
| Save drafts | `bun scripts/telegram-save-drafts.ts <work-file>` |
| Quick draft | `bun scripts/save-telegram-draft.ts @username "message"` (instant via API) |

## Output

| Output | Location |
|--------|----------|
| Per-person history | `~/CybosVault/private/context/telegram/<person-slug>.md` |
| Work file | `~/CybosVault/private/content/work/MMDD-telegram-replies-YY.md` |
| Logs | `~/CybosVault/private/.cybos/logs/MMDD-YY.md` |
