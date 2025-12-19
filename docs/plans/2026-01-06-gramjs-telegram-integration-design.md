# GramJS Telegram Script Integration Design

**Date:** 2026-01-06
**Status:** Implemented
**Purpose:** Replace/augment the current Telegram Web workflow with a scriptable MTProto client that can read unread chats, extract messages, and manage unread state while staying aligned with Cybos file-first architecture.

## Overview

Integrate GramJS (npm package `telegram`) as a local script to pull unread chats/groups, read the last X messages, save them to a scratchpad, and optionally mark conversations unread again. The script will be callable from a slash command (e.g., `/cyber-telegram-gramjs`) or run directly from `scripts/` and will log outputs to the unified log file.

## Requirements Mapping (from user request)

1. **Authenticate one account**
   - Use `TelegramClient` with `StringSession` for a one-time login and save the session string, or use `StoreSession` for on-disk persistence.
2. **Read-only mode**
   - Default to read-only: only call read APIs (`getDialogs`, `getMessages`), and do not call `markAsRead`, `sendMessage`, or other write APIs.
3. **Identify unread chats/groups**
   - `client.getDialogs({})` returns `Dialog` objects with `unreadCount` and `isGroup`/`isUser` flags.
4. **Read last X messages**
   - `client.getMessages(entity, { limit: X })` to fetch recent messages for a dialog.
5. **Save messages to scratchpad**
   - Persist results in a file-first location (proposed below) with a consistent format.
6. **Mark convo unread**
   - Use raw MTProto call `messages.MarkDialogUnread` via `client.invoke(...)` with `InputDialogPeer`.
7. **Write draft messages without sending**
   - Use raw MTProto call `messages.SaveDraft` via `client.invoke(...)` to save draft text for a peer without sending.

## Architecture Fit

- **File-first:** store outputs in markdown under `context/` or `.cybos/`.
- **Single-file logging:** append run summaries to `/.cybos/logs/MMDD-YY.md`.
- **Command-based execution:** add a new slash command or reuse `/cyber-telegram` with a `--gramjs` flag.
- **No background automation:** script runs only on demand.

## Proposed Script Design

### Location
- `scripts/telegram-gramjs.ts` (or `.js`) with a thin CLI wrapper.

### Inputs
- `--limit N`: number of messages per dialog (default 20).
- `--max-dialogs N`: cap how many unread dialogs to process (default 10).
- `--read-only` (default true): disallow write calls.
- `--mark-unread` (explicit opt-in): allow `MarkDialogUnread` for processed dialogs.
- `--save-draft` (default true): allow `messages.SaveDraft` (drafts are a server-side write).
- `--no-save-draft`: disable draft saving.
- `--drafts-path PATH`: optional mapping (dialog ID → draft text) for draft creation.
- `--scratchpad-path PATH`: override output location.

### Outputs (scratchpad)
- **Proposed default path:** `context/telegram/scratchpad/YYYY-MM-DD-telegram-unread.md`
- **Rationale:** aligns with file-first context layer, avoids mixing with deal-specific scratchpads.

### Session Storage
- **Option A (preferred):** `StoreSession("cybos-telegram")` to persist auth to a local folder outside git (e.g., `~/.cybos/telegram/`).
- **Option B:** `StringSession` stored in a local secret file and referenced via env var.

## Workflow (High-Level)

1. **Authenticate**
   - `client.start({ phoneNumber, password, phoneCode })` once.
   - Save session (string or store) for reuse.
2. **Fetch dialogs**
   - `dialogs = await client.getDialogs({})`
   - Filter: `dialog.unreadCount > 0` and `dialog.isGroup || dialog.isUser`.
3. **Read last X messages**
   - For each dialog: `messages = await client.getMessages(dialog.entity, { limit: X })`.
4. **Write scratchpad**
   - Append per-dialog sections: dialog title, unreadCount, last X messages with timestamps and sender.
5. **Save draft (default)**
   - If draft text is available (from the agent/UI) and draft saving is enabled, call:
     - `client.invoke(new Api.messages.SaveDraft({ peer: dialog.entity, message: draftText, entities }))`
6. **(Optional) mark unread**
   - If `--mark-unread`, call:
     - `client.invoke(new Api.messages.MarkDialogUnread({ peer: new Api.InputDialogPeer({ peer: dialog.inputEntity }), unread: true }))`
7. **Log summary**
   - Append summary to `/.cybos/logs/MMDD-YY.md` (count, dialogs processed, errors).

## Read-Only Safety Model

- Default mode is read-only. Only allow write calls when `--mark-unread` is explicitly set.
- Draft saving is the only allowed write by default and must never send messages.
- Never call `sendMessage`, `forwardMessages`, `editMessage`, or any API that transmits a message to the peer.
- Do not call `markAsRead` at any point (to avoid read receipts).

## Implementation Steps

1. Add GramJS dependency (`npm i telegram`) and new script entry under `scripts/`.
2. Implement session handling (StoreSession or StringSession).
3. Implement dialog scan + unread filter + message retrieval.
4. Implement scratchpad write and logging.
5. Add slash command wrapper (new `/cyber-telegram-gramjs` or `--gramjs` flag).
6. Document setup in `docs/` (API ID/Hash, session location, usage).

## Testing Plan

- **Auth:** first-run login with phone + code; verify session persists.
- **Unread detection:** confirm `dialog.unreadCount > 0` matches Telegram UI.
- **Message retrieval:** check last X messages match UI order/content.
- **Scratchpad:** verify format and path, file created once per run.
- **Drafts:** run with `--save-draft` and confirm draft appears in Telegram UI without sending; verify existing drafts are not silently overwritten.
- **Mark unread:** opt-in path only; ensure dialogs remain unread after run.
- **Read-only mode:** confirm no change in read status unless `--mark-unread` is set.

## Success Criteria

- Can authenticate once and reuse session without re-login.
- Script outputs a consistent scratchpad file with unread dialogs and recent messages.
- Read-only mode leaves Telegram read state unchanged.
- Drafts can be created/updated without sending messages.
- Optional mark-unread operation works for selected dialogs.
- Logs are written to `/.cybos/logs/MMDD-YY.md`.

## Risks / Notes

- Telegram has no official “read-only” account mode; safety relies on not calling write APIs.
- Draft saving is a server-side write that can overwrite existing drafts; consider reading `dialog.draft` first and preserving when needed.
- `messages.MarkDialogUnread` is a raw MTProto call; use `client.invoke` and ensure `InputDialogPeer` is built correctly.
- Flood waits may occur if scanning many dialogs; keep limits conservative.
