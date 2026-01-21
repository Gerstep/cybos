# Process Messages Workflow

Process Telegram messages: read via GramJS, generate AI drafts, save drafts to Telegram.

**CRITICAL: NEVER SEND MESSAGES. Only save drafts to Telegram.**

## Modes

This workflow supports three modes:

| Mode | Flag | Description |
|------|------|-------------|
| **Unread** (default) | `--count N` | Process N unread conversations |
| **User** | `--user "name"` | Find specific person by username/name (any read state) |
| **Requests** | `--requests` | Process message requests folder (non-contacts who messaged you) |

## Command Syntax

```bash
# Default: Process unread messages
/cyber-telegram                    # 1 unread dialog
/cyber-telegram --count 3          # 3 unread dialogs

# Message requests: Process from requests folder
/cyber-telegram --requests           # Unread from message requests
/cyber-telegram --requests --count 3 # 3 from message requests

# User mode: Find specific person (any read state)
/cyber-telegram --user "@username"   # By Telegram username
/cyber-telegram --user "Name"        # By name (also checks message requests)

# Modifiers (work with all modes)
/cyber-telegram --dry-run            # Read only, no drafts saved
/cyber-telegram --no-mark-unread     # Don't preserve unread state
```

## Workflow Steps

### 1. RUN GRAMJS SCRIPT

Execute the GramJS script based on mode:

**Unread mode (default):**
```bash
bun scripts/telegram-gramjs.ts --count N [--dry-run]
```

**User mode:**
```bash
bun scripts/telegram-gramjs.ts --user "@username" [--dry-run]
bun scripts/telegram-gramjs.ts --user "Name" [--dry-run]
```

**Requests mode:**
```bash
bun scripts/telegram-gramjs.ts --requests [--count N] [--dry-run]
```

**What the script does:**
1. Authenticates with Telegram (first run prompts for phone + code)
2. Fetches dialogs based on mode:
   - Unread mode: Unread dialogs (excluding archived and muted)
   - User mode: Specific user by username/name (checks message requests if not found)
   - Requests mode: Message requests folder (non-contacts)
3. Reads last 20 messages per dialog
4. Loads entity context for known contacts
5. Saves per-person history to `~/CybosVault/private/context/telegram/<person-slug>.md`
6. Saves work file:
   - Unread/requests: `~/CybosVault/private/content/work/MMDD-telegram-replies-YY.md`
   - User mode: `~/CybosVault/private/content/work/MMDD-telegram-<user-slug>-YY.md`
7. Marks dialogs as unread (preserves state)

**If first run (no session):**
- Script prompts for phone number
- User receives Telegram code
- Script prompts for code
- Session saved to `~/CybosVault/private/.cybos/telegram/`

### 2. READ WORK FILE

Load the generated work file:

```
Read: ~/CybosVault/private/content/work/MMDD-telegram-replies-YY.md
# or for --user mode:
Read: ~/CybosVault/private/content/work/MMDD-telegram-<user-slug>-YY.md
```

The work file contains:
- Recent messages for each dialog
- Entity context (if available)
- Placeholder for draft replies

### 3. GENERATE DRAFT REPLIES

For each conversation in the work file:

**Reply guidelines:**
- Match the language (Russian/English) of received messages
- Keep tone conversational and natural
- For business contacts: professional but warm
- For casual contacts: friendly and brief
- Reference specific points from their messages
- Ask clarifying questions if needed
- Avoid generic responses
- Consider entity context (previous calls, deals)
- Don't use emojis

**Draft format:**
```markdown
### Draft Reply
```
[Your contextual reply here]
```
```

**Update the work file** with generated drafts.

### 4. PRESENT FOR APPROVAL

Show drafts to user:

```
Draft replies generated:

1. **[Dialog Title]** (@username)
   > Last message: [preview]

   Draft:
   [draft text]

   ---

2. **[Dialog Title]** ...
```

Ask: "Approve all drafts? (yes/edit/skip)"

### 5. SAVE DRAFTS TO TELEGRAM

**Default behavior:** Automatically save all approved drafts.

If user approves all drafts:

```bash
bun scripts/telegram-save-drafts.ts ~/CybosVault/private/content/work/MMDD-telegram-replies-YY.md
```

If user requests changes:
1. Update the work file with revised drafts
2. Show revised drafts for approval
3. Run save-drafts script after approval

**How draft saving works:**
- Script reads work file and extracts all draft replies
- Matches dialogs by Dialog ID (primary), username, or exact title
- Calls Telegram API `messages.SaveDraft` for each dialog
- Drafts appear in Telegram's message input field
- User reviews and sends manually from Telegram

**Matching strategy (strict, no fuzzy matching):**
1. Dialog ID match (most reliable, e.g., `-1002178089244`)
2. Exact username match (e.g., `@username`)
3. Exact title match only (e.g., "cyber*Fund")

**Note:** Drafts are saved but not sent. User maintains full control over sending.

### 6. REPORT

Provide summary:

```
Processed N conversation(s):

1. **[Dialog Title]** (@username)
   - Messages read: N
   - Draft saved: Y / N
   - Status: Marked unread

Files:
- History: ~/CybosVault/private/context/telegram/<person-slug>.md
- Work file: ~/CybosVault/private/content/work/MMDD-telegram-replies-YY.md

Next steps:
- Open Telegram to review and send drafts
- Drafts are in the message input field for each chat
```

### 7. LOG

Append to `~/CybosVault/private/.cybos/logs/MMDD-YY.md`:

```markdown
## HH:MM | telegram | process | messages
- Workflow: process-messages
- Mode: unread/user/requests
- Dialogs: N
- Drafts saved: N
- Output: ~/CybosVault/private/content/work/MMDD-telegram-replies-YY.md
- Dry run: yes/no

---
```

## Quality Gates

Before marking workflow complete:

1. **Read check**: All messages captured in history file
2. **Context check**: Entity context loaded where available
3. **Draft check**: Replies are contextual, not generic
4. **Language check**: Draft language matches conversation
5. **Save check**: Drafts saved to Telegram (if not dry-run)

## Error Handling

**If authentication fails:**
- Check TELEGRAM_API_ID and TELEGRAM_API_HASH in .env
- Delete `~/CybosVault/private/.cybos/telegram/session.txt` and re-authenticate
- Report error to user

**If rate limited (FLOOD_WAIT):**
- Script automatically waits and retries once
- If still fails, report to user with wait time

**If no messages found:**
- Unread mode: Report "No unread messages found"
- User mode: Report "User not found in dialogs or message requests"
- Requests mode: Report "No message requests found"
- Skip draft generation

**If entity lookup fails:**
- Continue without entity context
- Draft based on message content only

## Output Locations

| Output | Location |
|--------|----------|
| Per-person history | `~/CybosVault/private/context/telegram/<person-slug>.md` |
| Work file (unread) | `~/CybosVault/private/content/work/MMDD-telegram-replies-YY.md` |
| Work file (user) | `~/CybosVault/private/content/work/MMDD-telegram-<user-slug>-YY.md` |
| Logs | `.cybos/logs/MMDD-YY.md` |

## Prerequisites

1. **Telegram API credentials** in `.env`:
   ```
   TELEGRAM_API_ID=...      # Get from https://my.telegram.org/apps
   TELEGRAM_API_HASH=...    # Get from https://my.telegram.org/apps
   ```

2. **First run**: Script will prompt for phone number and verification code. Session is saved to `~/CybosVault/private/.cybos/telegram/` for future use.

3. **Dependencies**: `bun add telegram` (GramJS package)

## Privacy & Safety

- Never send messages automatically
- Drafts require manual review in Telegram
- Conversations stay marked as unread
- No read receipts sent
- Session stored locally, not in git
