---
name: telegram
description: Process Telegram messages via GramJS MTProto client. Read messages, generate AI drafts, and save drafts to Telegram without sending. Use when handling Telegram conversations.
---

# Telegram Skill

Process Telegram messages via GramJS MTProto client. Supports unread messages, specific users, and message requests.

**CRITICAL: NEVER SEND MESSAGES. Only save drafts.**

## Capabilities

| Capability | Description |
|------------|-------------|
| **Unread Mode** | Process N unread conversations |
| **User Mode** | Find specific person by username/name (any read state) |
| **Requests Mode** | Process message requests folder (non-contacts) |
| **Entity Context** | Load context from database for known contacts |
| **Draft Replies** | AI generates contextual reply drafts |
| **Save Drafts** | Save drafts to Telegram (no sending) |
| **Mark Unread** | Re-mark conversations as unread after processing |
| **History** | Save per-person history to vault `context/telegram/` |

## Workflows

- **`workflows/process-messages.md`** - Full workflow for all modes

## Tools

| Script | Purpose |
|--------|---------|
| `scripts/telegram-gramjs.ts` | GramJS MTProto client - fetch messages |
| `scripts/telegram-save-drafts.ts` | Save AI drafts to Telegram from work file |
| `scripts/save-telegram-draft.ts` | Quick helper to save one draft by username |

## Quick Reference

```bash
# Unread mode (default)
/cyber-telegram                    # 1 unread dialog
/cyber-telegram --count 3          # 3 unread dialogs

# User mode
/cyber-telegram --user "@username" # By username
/cyber-telegram --user "Name"      # By name

# Requests mode
/cyber-telegram --requests         # Message requests folder

# Modifiers
/cyber-telegram --dry-run          # Read only
/cyber-telegram --no-mark-unread   # Don't preserve unread state
```

See `workflows/process-messages.md` for full documentation.

## Safety

Drafts only - never sends messages automatically. User reviews and sends manually in Telegram.
