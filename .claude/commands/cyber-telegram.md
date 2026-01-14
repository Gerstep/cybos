---
name: cyber-telegram
description: Process Telegram messages - read, draft replies, save drafts via GramJS
---

Process unread Telegram messages via GramJS MTProto client. Read messages, generate AI drafts, and save drafts to Telegram without sending.

**CRITICAL: NEVER SEND MESSAGES. Only save drafts to Telegram.**

**Usage:**
- `/cyber-telegram` (process 1 conversation)
- `/cyber-telegram --count 3` (process 3 conversations)
- `/cyber-telegram --dry-run` (read only, don't save drafts)
- `/cyber-telegram --no-mark-unread` (don't preserve unread state)

**Arguments:**
- `--count N`: Number of conversations to process (default: 1)
- `--dry-run`: Read and generate drafts but don't save to Telegram
- `--no-mark-unread`: Don't mark conversations as unread after processing

**Workflow:**

1. **RUN SCRIPT**: Execute GramJS to fetch unread messages
   ```bash
   bun scripts/telegram-gramjs.ts --count N [--dry-run]
   ```

   **First run (no session):**
   - Script prompts for phone number
   - User receives Telegram verification code
   - Script prompts for code
   - Session saved to `~/.cybos/telegram/`

   **What the script does:**
   - Authenticates with Telegram (uses saved session)
   - Fetches unread dialogs (skips archived and muted)
   - Reads last 20 messages per dialog
   - Loads entity context via database query (`bun scripts/db/query.ts find-entity`)
   - Saves scratchpad to `context/telegram/`
   - Saves work file to `content/work/`
   - Marks dialogs as unread (preserves state)

   **Entity context loading:**
   - Script queries database for each contact by telegram username
   - Run: `bun scripts/db/query.ts find-entity "@username"`
   - Returns: name, company, role, recent interactions, pending items

2. **READ WORK FILE**: Load generated work file
   ```
   Read: content/work/MMDD-telegram-replies-YY.md
   ```

3. **GENERATE DRAFTS**: Create AI reply drafts
   - Match language (Russian/English) of received messages
   - Reference specific points from their messages
   - Consider entity context (previous calls, deals)
   - Keep tone appropriate (professional/casual)
   - Update work file with drafts

4. **PRESENT FOR APPROVAL**: Show drafts to user
   ```
   📝 Draft replies generated:

   1. **[Dialog Title]** (@username)
      > Last message: [preview]

      Draft:
      [draft text]
   ```
   Ask: "Approve all drafts? (yes/edit/skip)"

5. **SAVE TO TELEGRAM**: If approved and not dry-run
   ```bash
   bun scripts/telegram-save-drafts.ts content/work/MMDD-telegram-replies-YY.md
   ```
   - Script matches dialogs by Dialog ID, username, or exact title
   - Calls `messages.SaveDraft` for each dialog
   - Drafts appear in Telegram message input field
   - User reviews and sends manually

6. **REPORT**: Show summary
   ```
   ✅ Processed N conversation(s):

   1. **[Dialog Title]**
      - Messages: N read
      - Draft: saved ✓
      - Status: Marked unread

   📄 Files:
   - Scratchpad: context/telegram/...
   - Work file: content/work/...
   ```

7. **LOG**: Append to `/.cybos/logs/MMDD-YY.md`

**Output locations:**
- Message history: `context/telegram/YYYY-MM-DD-HH-MM-unread.md`
- AI drafts: `content/work/MMDD-telegram-replies-YY.md`
- Logs: `.cybos/logs/MMDD-YY.md`

**Prerequisites:**
1. Add to `.env`:
   ```
   TELEGRAM_API_ID=...      # Get from https://my.telegram.org/apps
   TELEGRAM_API_HASH=...    # Get from https://my.telegram.org/apps
   ```

2. Install dependency: `bun add telegram`

**Error handling:**
- If auth fails: Check .env vars, delete session and re-authenticate
- If rate limited: Script waits and retries once
- If no unread: Reports "No unread messages found"

**Safety:**
- Never sends messages automatically
- Drafts require manual review in Telegram
- Conversations stay marked as unread
- No read receipts sent
- Session stored locally, not in git
