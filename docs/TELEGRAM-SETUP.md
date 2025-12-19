# Telegram GramJS Setup

This guide explains how to set up the GramJS-based Telegram integration for Cybos.

## Prerequisites

- Bun runtime installed
- Access to https://my.telegram.org

## Step 1: Get Telegram API Credentials

1. Go to https://my.telegram.org/apps
2. Log in with your phone number
3. Create a new application (or use existing)
4. Note the **API ID** (integer) and **API Hash** (hex string)

## Step 2: Configure Environment

Add to your `.env` file:

```bash
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abc123def456789abc123def456789ab
```

## Step 3: Install Dependency

```bash
bun add telegram
```

## Step 4: First Run Authentication

Run the script for the first time:

```bash
bun scripts/telegram-gramjs.ts --dry-run
```

The script will:
1. Prompt for your phone number (with country code, e.g., `+1234567890`)
2. Telegram sends you a verification code
3. Enter the code when prompted
4. If you have 2FA enabled, enter your password
5. Session is saved to `~/.cybos/telegram/session.txt`

After authentication, subsequent runs will use the saved session automatically.

## Usage

### Basic Commands

```bash
# Process 1 unread conversation
bun scripts/telegram-gramjs.ts

# Process 3 unread conversations
bun scripts/telegram-gramjs.ts --count 3

# Dry run (read only, don't save drafts)
bun scripts/telegram-gramjs.ts --dry-run

# Don't mark conversations as unread after processing
bun scripts/telegram-gramjs.ts --no-mark-unread

# Show help
bun scripts/telegram-gramjs.ts --help
```

### Via Claude Code Command

```
/cyber-telegram              # Process 1 conversation
/cyber-telegram --count 3    # Process 3 conversations
/cyber-telegram --dry-run    # Read only mode
```

## Output Files

| File | Location | Purpose |
|------|----------|---------|
| Message history | `context/telegram/YYYY-MM-DD-HH-MM-unread.md` | Historical record for future context extraction |
| Work file | `content/work/MMDD-telegram-replies-YY.md` | AI draft generation template |
| Session | `~/.cybos/telegram/session.txt` | Auth token (outside git) |
| Logs | `.cybos/logs/MMDD-YY.md` | Activity log |

## What Gets Filtered

The script automatically skips:
- **Archived chats**: Folder ID 1 or `archived: true`
- **Muted chats**: `notifySettings.muteUntil` in the future

Only unmuted, non-archived conversations with unread messages are processed.

## Safety Features

1. **Never sends messages**: Only saves drafts via `messages.SaveDraft` API
2. **Preserves unread state**: Conversations marked unread after processing
3. **No read receipts**: The script doesn't trigger read receipts
4. **Local session**: Auth stored in `~/.cybos/telegram/`, not in git

## Workflow

1. **Script reads** unread conversations
2. **Saves to** `context/telegram/` (history) and `content/work/` (work file)
3. **AI generates** draft replies based on work file
4. **User approves** drafts
5. **Script saves** approved drafts to Telegram
6. **User reviews** drafts in Telegram and sends manually

## Troubleshooting

### Session Expired

If you see "SESSION_EXPIRED" or authentication errors:

```bash
rm ~/.cybos/telegram/session.txt
bun scripts/telegram-gramjs.ts --dry-run  # Re-authenticate
```

### Rate Limited (FLOOD_WAIT)

The script automatically:
1. Waits for the required duration
2. Retries once
3. Aborts and logs if still rate limited

To avoid rate limits:
- Process fewer dialogs at once (use `--count 1` or `--count 2`)
- Add delays between runs

### Missing Environment Variables

```
Error: Missing TELEGRAM_API_ID or TELEGRAM_API_HASH in environment.
```

Ensure your `.env` file contains both variables and the values are correct.

### Wrong Phone Number

If you entered the wrong phone number, delete the session and re-authenticate:

```bash
rm ~/.cybos/telegram/session.txt
bun scripts/telegram-gramjs.ts --dry-run
```

## Security Notes

- **API credentials**: Keep your `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` secret
- **Session file**: The session file at `~/.cybos/telegram/session.txt` grants full account access - protect it
- **Git**: The session directory is outside the repo and should never be committed
- **Shared machines**: Don't use on shared computers without proper security measures

## Future Features (Not Yet Implemented)

- Context extraction from message history
- Auto-populate entity index from Telegram contacts
- Link conversations to deals
- Relationship graph building
