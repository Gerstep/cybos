# Answer Messages Workflow

Process unread Telegram messages: read via GramJS, generate AI drafts, save drafts to Telegram.

**CRITICAL: NEVER SEND MESSAGES. Only save drafts to Telegram.**

## Inputs

- **Count**: Number of dialogs to process (default: 1)
- **Dry run**: If true, read only without saving drafts

## Workflow Steps

### 1. RUN GRAMJS SCRIPT

Execute the GramJS script to fetch unread messages:

```bash
bun scripts/telegram-gramjs.ts --count N [--dry-run]
```

**What the script does:**
1. Authenticates with Telegram (first run prompts for phone + code)
2. Fetches unread dialogs (excluding archived and muted)
3. Reads last 20 messages per dialog
4. Loads entity context for known contacts
5. Saves scratchpad to `context/telegram/YYYY-MM-DD-HH-MM-unread.md`
6. Saves work file to `content/work/MMDD-telegram-replies-YY.md`
7. Marks dialogs as unread (preserves state)

**If first run (no session):**
- Script prompts for phone number
- User receives Telegram code
- Script prompts for code
- Session saved to `~/.cybos/telegram/`

### 2. READ WORK FILE

Load the generated work file:

```
Read: content/work/MMDD-telegram-replies-YY.md
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
📝 Draft replies generated:

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
bun scripts/telegram-save-drafts.ts content/work/MMDD-telegram-replies-YY.md
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
3. Exact title match only (e.g., "cyber•Fund")

**Note:** Drafts are saved but not sent. User maintains full control over sending.

### 6. REPORT

Provide summary:

```
✅ Processed N conversation(s):

1. **[Dialog Title]** (@username)
   - Messages read: N
   - Draft saved: ✓ / ✗
   - Status: Marked unread

📄 Files:
- Scratchpad: context/telegram/YYYY-MM-DD-HH-MM-unread.md
- Work file: content/work/MMDD-telegram-replies-YY.md

📋 Next steps:
- Open Telegram to review and send drafts
- Drafts are in the message input field for each chat
```

### 7. LOG

Append to `/.cybos/logs/MMDD-YY.md`:

```markdown
## HH:MM | telegram | process | unread messages
- Workflow: answer-messages
- Dialogs: N
- Drafts saved: N
- Output: content/work/MMDD-telegram-replies-YY.md
- Dry run: yes/no

---
```

## Quality Gates

Before marking workflow complete:

1. **Read check**: All messages captured in scratchpad
2. **Context check**: Entity context loaded where available
3. **Draft check**: Replies are contextual, not generic
4. **Language check**: Draft language matches conversation
5. **Save check**: Drafts saved to Telegram (if not dry-run)

## Error Handling

**If authentication fails:**
- Check TELEGRAM_API_ID and TELEGRAM_API_HASH in .env
- Delete `~/.cybos/telegram/session.txt` and re-authenticate
- Report error to user

**If rate limited (FLOOD_WAIT):**
- Script automatically waits and retries once
- If still fails, report to user with wait time

**If no unread messages:**
- Report "No unread messages found"
- Skip draft generation

**If entity lookup fails:**
- Continue without entity context
- Draft based on message content only

## Tips

- Don't use emojis as much as possible!
- Process 1-3 dialogs at a time to maintain quality
- Review drafts carefully before approving
- Use `--dry-run` to preview without saving
- Entity context helps with professional replies
- Message history in `context/telegram/` can be searched later

## Privacy & Safety

- Never send messages automatically
- Drafts require manual review in Telegram
- Conversations stay marked as unread
- No read receipts sent
- Session stored locally, not in git
