---
name: telegram
description: Process unread Telegram messages via GramJS MTProto client. Read messages, generate AI drafts, and save drafts to Telegram without sending. Use when handling Telegram conversations.
---

# Telegram Skill

Process unread Telegram messages via GramJS MTProto client. Read messages, generate AI drafts, and save drafts to Telegram without sending.

**CRITICAL: NEVER SEND MESSAGES. Only save drafts.**

## Overview

This skill uses a scriptable MTProto client (GramJS) to:
1. Read unread conversations (excluding archived/muted)
2. Save message history to `context/telegram/` for future context extraction
3. Generate AI reply drafts
4. Save drafts to Telegram (user reviews in Telegram before sending)
5. Mark conversations as unread (preserves unread state)

## Capabilities

| Capability | Description |
|------------|-------------|
| **Read Unread** | Fetch unread dialogs via MTProto API |
| **Filter Smart** | Skip archived and muted chats automatically |
| **Entity Context** | Load entity context from database via `scripts/db/query.ts` |
| **Draft Replies** | AI generates contextual reply drafts |
| **Save Drafts** | Save drafts to Telegram (no sending) |
| **Mark Unread** | Re-mark conversations as unread after processing |
| **History** | Save all messages to `context/telegram/` for future use |

## Workflows

- `workflows/answer-messages.md`: **PRIMARY** - Full read → draft → save flow

## Tools Used

- `scripts/telegram-gramjs.ts`: GramJS MTProto client to fetch unread messages
- `scripts/telegram-save-drafts.ts`: Script to save AI drafts to Telegram
- Entity index for context loading
- AI for draft generation

## Command

```
/cyber-telegram              # Process 1 unread conversation
/cyber-telegram --count 3    # Process 3 unread conversations
/cyber-telegram --dry-run    # Read only, don't save drafts
/cyber-telegram --no-mark-unread  # Don't preserve unread state
```

## Output Locations

| Output | Location |
|--------|----------|
| Message history | `context/telegram/YYYY-MM-DD-HH-MM-unread.md` |
| AI drafts | `content/work/MMDD-telegram-replies-YY.md` |
| Logs | `.cybos/logs/MMDD-YY.md` |

## Prerequisites

1. **Telegram API credentials** in `.env`:
   ```
   TELEGRAM_API_ID=...      # Get from https://my.telegram.org/apps
   TELEGRAM_API_HASH=...    # Get from https://my.telegram.org/apps
   ```

2. **First run**: Script will prompt for phone number and verification code. Session is saved to `~/.cybos/telegram/` for future use.

3. **Dependencies**: `bun add telegram` (GramJS package)

## Safety Model

- **Read-only by default**: Only fetches messages, never sends
- **Drafts only**: `messages.SaveDraft` API saves draft text, user sends manually
- **No read receipts**: Conversations are marked unread after processing
- **No auto-send**: AI drafts require user approval before saving to Telegram

## Integration

Telegram skill integrates with:
- **Entity system**: Auto-loads context for known contacts
- **GTD system**: Can be triggered from GTD.md tasks
- **Content system**: Drafts saved to `/content/work/`
- **Logging**: All activity logged to `.cybos/logs/`

## Future: Context Extraction

Message history in `context/telegram/` is kept for future context extraction:
- Extract entities (people, companies) from conversations
- Populate `/context/entities/` with discovered contacts
- Link conversations to deals
- Build relationship graph

This is not implemented yet but history is preserved for future use.
