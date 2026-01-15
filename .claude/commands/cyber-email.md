---
name: cyber-email
description: Process Gmail messages - read, draft replies, save attachments to deals, sync to index
---

Process unread Gmail messages by reading, drafting replies, saving attachments to deal folders, and labeling for follow-up. Also supports sync mode for indexing emails to `/context/emails/`.

**Usage:**
- `/cyber-email` (process 1 email)
- `/cyber-email --count 3` (process 3 emails)
- `/cyber-email --from "founder@startup.com"` (filter by sender)
- `/cyber-email --deals` (only emails from known deals)
- `/cyber-email --sync` (sync last 3 days to /context/emails/)
- `/cyber-email --sync --days 7` (sync last 7 days)

**Arguments:**
- `--count N`: Number of emails to process (default: 1)
- `--from EMAIL`: Filter by sender email address
- `--deals`: Only process emails from companies in `/deals/` directory
- `--sync`: Sync mode - index emails to /context/emails/ instead of processing
- `--days N`: Number of days to sync (default: 3, only with --sync)

**Workflow:**

1. **LIST UNREAD**: Query Gmail for unread emails
   - Use Gmail MCP `list_emails` tool with `is_unread: true`
   - Apply filters if specified (--from, --deals)
   - Sort by date (newest first)
   - Show: sender, subject, preview snippet

2. **READ EMAIL**: Capture full context
   - Use Gmail MCP `read_email` tool to get full content
   - Capture:
     - Sender name + email address
     - Full email body (HTML → markdown)
     - Conversation thread (last 3-5 emails)
     - Attachment list (pitch decks, PDFs, updates)
   - Check if sender domain matches company in `/deals/<company>/`
   - If match found: load `/deals/<company>/.cybos/context.md` for relationship history
   - Query database for call history: `bun scripts/db/query.ts find-entity "<email>" --json`

3. **DRAFT REPLY**: Compose contextual response
   - Analyze sender tone (formal/casual, technical/business)
   - Reference specific points from their message
   - For deal-related emails:
     - Incorporate context from `/deals/<company>/.cybos/context.md`
     - Reference recent research from `/deals/<company>/research/`
     - Check Granola call transcripts if available
   - Create draft using Gmail MCP `send_email` tool
   - **DO NOT auto-send** - save as Gmail draft
   - Show draft preview to user for review

4. **SAVE ATTACHMENTS**: Download relevant files (if any)
   - Detect file types: pitch decks, memos, company updates
   - For known deals: save to `/deals/<company>/materials/` or `/deals/<company>/updates/`
   - For new companies: prompt user to create deal folder first
   - File naming: `MMDD-<type>-YY.pdf` (e.g., `0105-pitch-deck-26.pdf`)
   - Routing rules:
     - Pitch decks → `/deals/<company>/materials/MMDD-pitch-deck-YY.pdf`
     - Company updates → `/deals/<company>/updates/MMDD-update-YY.pdf`
     - Investment memos → `/deals/<company>/materials/MMDD-memo-YY.pdf`
     - Other files → `/deals/<company>/materials/MMDD-<filename>`

5. **LABEL & ORGANIZE**: Apply Gmail labels
   - Apply label: "TO ANSWER" (create if doesn't exist)
   - Mark email as read
   - Archive from inbox (optional)
   - Verify label applied successfully

6. **REPEAT**: If --count > 1, process next email

7. **REPORT**: Show summary
   ```
   ✅ Processed N email(s):

   1. **John Smith <john@acmecorp.com>** [Acme Corp]
      - Subject: Following up on our AI infrastructure discussion
      - Preview: Thanks for the intro from Sarah...
      - Draft: Hi John, great to reconnect...
      - Attachments: pitch-deck.pdf → /deals/acme-corp/materials/0105-pitch-deck-26.pdf
      - Labeled: TO ANSWER

   2. **Jane Doe <jane@example.com>** [New sender]
      - Subject: Introduction from Mike
      - Preview: Mike suggested I reach out...
      - Draft: Hi Jane, thanks for reaching out...
      - Labeled: TO ANSWER
   ```

**Deal Folder Integration:**

When email sender matches a company:
1. Extract company from sender domain (e.g., `john@acmecorp.ai` → "acmecorp")
2. Fuzzy match against existing `/deals/` folders
3. If match found:
   - Load `/deals/<company>/.cybos/context.md`
   - Check for recent research in `/deals/<company>/research/`
   - Use context in draft reply
4. If no match and attachments present:
   - Prompt: "Create /deals/<company-slug>/ for this sender?"
   - If yes: create folder structure and populate context.md

**New Deal Folder Structure:**
```
/deals/<company-slug>/
├── .cybos/
│   └── context.md          # Populated with sender info, email date
├── materials/              # Pitch decks, memos
├── updates/                # Company update emails
└── research/               # Empty, ready for DD
```

**Quality Checklist:**
- [ ] Full email context captured (thread history)
- [ ] Draft is contextual, not generic
- [ ] Reply tone matches sender
- [ ] Attachments saved to correct deal folder
- [ ] Email labeled "TO ANSWER"
- [ ] Draft preserved (not auto-sent)

**Error Handling:**
- If not authenticated: report OAuth flow needed, provide instructions
- If "TO ANSWER" label missing: create automatically, report to user
- If deal folder ambiguous: ask user which company to associate
- If attachment download fails: retry once, then report error
- If Gmail API rate limit: pause, report wait time
- If MCP server not connected: report connection issue, suggest restart

**Privacy & Safety:**
- Never auto-send emails without explicit user confirmation
- Always ask before creating new deal folders
- Don't share sensitive information in drafts
- Respect communication context and relationship tone
- Confirm before applying labels or moving emails

**Context Enrichment:**
When drafting replies, combine:
1. `/deals/<company>/.cybos/context.md` - investment stage, key contacts
2. `/deals/<company>/research/` - latest DD notes
3. Gmail thread history - previous email conversations
4. Database entity context: `bun scripts/db/query.ts entity <slug> --json` - includes call history

**Example Enriched Draft:**
```
Hi John,

Great to hear about your progress since our call last week. I reviewed
your pitch deck and was particularly interested in the warehouse automation
metrics you mentioned.

[Rest of contextual reply based on email content and deal history...]
```

---

## Sync Mode

Sync mode indexes emails to `/context/emails/` for morning brief and context. This is separate from the interactive processing workflow above.

**Usage:**
- `/cyber-email --sync` - Index last 3 days (unread OR important, prioritize important)
- `/cyber-email --sync --days 7` - Index last 7 days

**Sync Workflow:**

1. **LOAD STATE**
   - Read `/context/emails/.state.json`
   - Get set of `processedMessageIds` for deduplication

2. **QUERY GMAIL**
   - Use `mcp__gmail__search_emails` with query:
     `(is:unread OR is:important) after:YYYY/MM/DD`
   - Calculate date: today minus N days (default: 3)
   - maxResults: 100

3. **FILTER & PRIORITIZE**
   - Skip emails where messageId already in processedMessageIds
   - Sort: important emails first, then by date descending
   - Report: "Found X new emails (Y important, Z unread-only)"

4. **FOR EACH NEW EMAIL**
   a. Read full content: `mcp__gmail__read_email(messageId)`
   b. Generate 1-line summary (inline, ~60 chars max)
   c. Create folder: `/context/emails/YYYY-MM-DD_<from-slug>-<subject-slug>/`
      - from-slug: sender first name or email prefix, kebab-case
      - subject-slug: first 30 chars of subject, kebab-case
   d. Write `metadata.json`:
      ```json
      {
        "messageId": "...",
        "threadId": "...",
        "date": "ISO8601",
        "from": { "name": "...", "email": "..." },
        "to": ["..."],
        "subject": "...",
        "labels": ["INBOX", "IMPORTANT"],
        "isImportant": true,
        "snippet": "first 100 chars...",
        "summary": "AI-generated 1-line summary"
      }
      ```
   e. Write `body.md`:
      ```markdown
      # [Subject]

      **From:** Name <email>
      **Date:** YYYY-MM-DD HH:MM
      **To:** recipient@example.com

      ---

      [Email body converted from HTML to markdown]
      ```
   f. Add messageId to processedMessageIds

5. **UPDATE STATE**
   - Write updated `.state.json` with new processedMessageIds
   - Set lastSync to current ISO 8601 timestamp

6. **INDEX TO DATABASE**
   - Email metadata is indexed automatically by the database indexer
   - Run `/cyber-reindex` to update database if needed
   - Query emails: `bun scripts/db/query.ts find-interactions --type email`

7. **REPORT**
   ```
   ✅ Email sync complete

   New emails indexed: X (Y important)
   Total in index: Z

   ## Important (new)
   | Date | From | Subject | Summary |
   |------|------|---------|---------|
   | ... (important emails only) |

   ## Other (new)
   | Date | From | Subject | Summary |
   |------|------|---------|---------|
   | ... (non-important emails) |
   ```

**Folder Naming Convention:**
```
YYYY-MM-DD_<from-slug>-<subject-slug>

Examples:
- 2026-01-07_john-smith-series-a-update
- 2026-01-06_jane-acme-intro-from-mike

Rules:
- from-slug: First name from sender, or email prefix if no name
- subject-slug: First 30 chars of subject
- All lowercase, kebab-case
- Max 60 chars total for folder name
```

**Sync Error Handling:**
- If Gmail MCP not connected: report and exit
- If email read fails: skip, log error, continue with next
- If folder already exists (edge case): skip, already processed
- Write .state.json only after all emails successfully indexed (atomicity)

**Headless Execution:**
Sync mode is designed for headless Claude Code execution:
```bash
claude --headless "/cyber-email --sync"
```

This enables automated morning brief workflows.
