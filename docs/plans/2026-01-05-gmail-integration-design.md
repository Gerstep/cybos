# Gmail MCP Integration Design

**Date:** 2026-01-05
**Status:** Validated
**Purpose:** Integrate Gmail for VC deal flow tracking with context-aware email management

## Overview

Integrate bastienchabal/gmail-mcp server to handle investor intros, founder emails, and company updates with high control workflow similar to existing `/cyber-telegram` command.

**Primary use case:** VC deal flow - track investor intros, founder emails, save pitch decks, organize company updates
**Control level:** High control - confirm before every send/action
**Key features:** Context-aware search, attachment handling, deal folder integration
**Interaction:** Command-based (`/cyber-email`) for batch processing + conversational for ad-hoc queries

---

## Architecture

### MCP Server Selection: bastienchabal/gmail-mcp

**Why this server:**
- Safety-first design with confirmation prompts before sending/actions
- Context-aware responses analyzing full conversation threads
- Python-based (consistent with existing perplexity, parallel-search MCPs)
- Calendar integration for detecting scheduling requests
- Deep email analysis with relationship history tracking

**Technical stack:**
- Server: Python-based MCP server running locally
- Authentication: OAuth 2.0 with encrypted token storage
- Transport: stdio (standard MCP protocol)
- Storage: Local token cache at `~/gmail-mcp/tokens.json`

**MCP Tools provided:**
- `list_emails` - fetch unread/filtered emails
- `read_email` - get full content with thread context
- `send_email` - compose and send (with confirmation)
- `search_emails` - semantic search across email history
- `download_attachment` - save files locally
- `create_calendar_event` - schedule from email content
- `get_thread_context` - analyze conversation history

**Security:**
- OAuth 2.0 tokens encrypted with Fernet key
- Scopes: `gmail.readonly`, `gmail.send`, `gmail.modify`, `calendar`
- No passwords stored, only client ID/secret in environment
- Tokens auto-refresh, stored at `~/gmail-mcp/tokens.json`

---

## Command-Based Workflow: `/cyber-email`

Structured email processing following `/cyber-telegram` pattern.

### Command Variants

```bash
/cyber-email                          # Process 1 unread email
/cyber-email --count 3                # Process 3 unread emails
/cyber-email --from "founder@startup.com"  # Filter by sender
/cyber-email --deals                  # Only emails from known deals
```

### Processing Workflow

**1. FIND UNREAD**
- Query Gmail with `list_emails(is_unread=true)`
- Sort by date (newest first)
- Show: sender, subject, preview snippet

**2. READ EMAIL**
- Use `read_email(message_id)` to get full content
- Capture:
  - Sender name + email address
  - Full email body (HTML → markdown)
  - Conversation thread (last 3-5 emails)
  - Attachment list (pitch decks, PDFs)
- Check if sender matches company in `/deals/<company>/`
- Load deal context if folder exists

**3. DRAFT REPLY**
- Analyze sender tone (formal/casual)
- Reference specific points from their message
- For deal emails: incorporate `/deals/<company>/.cybos/context.md`
- Create draft using `send_email` tool (confirmation required)
- **DO NOT auto-send** - save as Gmail draft
- Show draft preview to user

**4. SAVE ATTACHMENTS**
- Detect pitch decks, memos, updates in attachments
- For known deals: save to `/deals/<company>/materials/`
- For new companies: prompt to create deal folder first
- Naming: `MMDD-<type>-YY.pdf` (e.g., `0105-pitch-deck-26.pdf`)
- File types:
  - Pitch decks → `/deals/<company>/materials/`
  - Updates → `/deals/<company>/updates/`
  - Other → `/deals/<company>/materials/`

**5. LABEL & ARCHIVE**
- Apply Gmail label: "TO ANSWER"
- Mark email as read
- Archive from inbox (remove INBOX label)
- Verify label applied successfully

**6. REPEAT**
- If `--count > 1`, process next unread email
- Continue until count reached or no more unread

### Output Format

```
✅ Processed 2 email(s):

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

### Quality Checklist

- [ ] Full email context captured (thread history)
- [ ] Draft is contextual, not generic
- [ ] Reply tone matches sender
- [ ] Attachments saved to correct deal folder
- [ ] Email labeled "TO ANSWER"
- [ ] Draft preserved (not auto-sent)

### Error Handling

- If not authenticated: report OAuth flow needed, don't auto-authenticate
- If "TO ANSWER" label missing: create label automatically, report to user
- If deal folder ambiguous: ask user which company to associate
- If attachment download fails: retry once, then report error
- If Gmail API rate limit: pause, report wait time to user

---

## Conversational Ad-Hoc Usage

For one-off queries outside structured workflow, natural language interaction.

### Search & Retrieval Queries

**Examples:**
- "Find emails from Acme Corp about their Series A"
- "Show me all pitch decks received in November"
- "What did that founder say about AI agents in our last conversation?"
- "Check if any portfolio companies sent updates today"
- "Find emails mentioning 'AI agents' or 'robotics' from last month"

**Behavior:**
- Use `search_emails` with Gmail search syntax
- Return results with context (sender, date, preview)
- No confirmation needed (read-only operation)

### Context Lookup Queries

**Examples:**
- "Summarize my email history with john@startup.com"
- "When did I last hear from Acme Corp?"
- "Show me all unanswered investor intros this week"

**Behavior:**
- Use `get_thread_context` to analyze conversation history
- Cross-reference with `/deals/<company>/.cybos/context.md`
- Provide rich summary with relationship insights

### Quick Actions

**Examples:**
- "Save that pitch deck from Jane to Acme Corp's deal folder"
- "Draft a reply to the last email from Mike"
- "Download all attachments from today's emails to /deals/"

**Behavior:**
- Confirm before destructive/send operations
- Auto-execute safe operations (download, search)
- Detect company names, check `/deals/` for context

### Example Interaction

```
You: "Find that email from the AI robotics founder Mike introduced"

Claude: I found 1 email from John Smith <john@robocorp.ai> (Nov 15):
- Subject: "Introduction from Mike - AI robotics opportunity"
- He's building autonomous warehouse robots, $2M seed round
- Thread history: This is his first email to you
- No existing deal folder found

Would you like me to:
1. Create /deals/robocorp/ and save his details?
2. Draft a reply?
3. Just show the full email?
```

---

## Deal Folder Integration

Automatic connection between emails and `/deals/` directory structure.

### Auto-Detection Logic

**On email processing:**
1. Extract company from sender domain (e.g., `john@acmecorp.ai` → "acmecorp")
2. Fuzzy match against existing `/deals/` folders
3. If match found:
   - Load `/deals/<company>/.cybos/context.md`
   - Check for recent research in `/deals/<company>/research/`
   - Reference in draft reply
4. If no match:
   - Offer to create new deal folder
   - Prompt: "Create /deals/<company-slug>/ for this sender?"

### Deal Folder Creation

**Triggered when:**
- New company email detected
- User confirms creation

**Structure created:**
```
/deals/<company-slug>/
├── .cybos/
│   └── context.md          # Populated with sender info, email date
├── materials/              # Pitch decks, memos
├── updates/                # Company update emails
└── research/               # Empty, ready for DD
```

**Initial context.md:**
```markdown
# <Company Name>

## Contact Information
- **Primary Contact:** John Smith <john@company.com>
- **First Contact:** 2026-01-05 (email intro from Mike)

## Status
- Stage: Initial outreach
- Next action: Review pitch deck, schedule call

## Notes
- Introduced by Mike (investor)
- Building AI infrastructure for robotics
- Raising $5M Series A
```

### Attachment Organization

**File naming convention:** `MMDD-<type>-YY.<ext>`

**Routing rules:**
- Pitch decks (PDF with "pitch" or "deck" in name):
  - → `/deals/<company>/materials/MMDD-pitch-deck-YY.pdf`
- Company updates (email subject contains "update"):
  - → `/deals/<company>/updates/MMDD-update-YY.pdf`
- Investment memos:
  - → `/deals/<company>/materials/MMDD-memo-YY.pdf`
- Other attachments:
  - → `/deals/<company>/materials/MMDD-<original-filename>`

### Context Enrichment for Replies

**When drafting replies, Claude combines:**
1. `/deals/<company>/.cybos/context.md` - investment stage, contacts
2. `/deals/<company>/research/` latest files - DD notes, analysis
3. Gmail thread history - previous email conversations
4. Granola call transcripts - check `/context/calls/INDEX.md`

**Example enriched draft:**
```
Hi John,

Great to hear about your progress since our call last week [from Granola].
I reviewed your pitch deck [from /deals/robocorp/materials/] and was
particularly interested in the warehouse automation metrics you mentioned.

[Rest of contextual reply...]
```

### Update Tracking for Portfolio Companies

**For companies in `/deals/` with investment status:**
- Save update emails as markdown: `/deals/<company>/updates/MMDD-email-YY.md`
- Extract key metrics to bullet points
- Flag if action needed (board meeting, follow-up round)
- Auto-add to `/deals/<company>/.cybos/context.md`

**Update email template:**
```markdown
# Company Update - January 2026

**Date:** 2026-01-05
**From:** John Smith <john@company.com>

## Key Metrics
- MRR: $50K (+20% MoM)
- Customers: 15 (+5 new)
- Runway: 18 months

## Highlights
- Closed 3 enterprise deals
- Hired VP Engineering

## Action Items
- [ ] Schedule Q1 board meeting
- [ ] Review follow-on investment opportunity
```

---

## Implementation Plan

### Step 1: Install MCP Server

```bash
# Clone repository
git clone https://github.com/bastienchabal/gmail-mcp.git ~/gmail-mcp
cd ~/gmail-mcp

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e .
```

### Step 2: Google Cloud OAuth Setup

1. Go to https://console.cloud.google.com
2. Create new project: "Cybos Gmail"
3. Enable APIs:
   - Gmail API
   - Google Calendar API
4. Configure OAuth consent screen:
   - User type: External
   - Test users: alex.doe@gmail.com, alex@org.example
   - Scopes: `gmail.readonly`, `gmail.send`, `gmail.modify`, `calendar`
5. Create OAuth 2.0 credentials:
   - Application type: Desktop app
   - Name: "Cybos Gmail Client"
6. Download credentials JSON
7. Copy Client ID and Client Secret

### Step 3: Configure Claude Desktop

Edit `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "/Users/sg/gmail-mcp/.venv/bin/mcp",
      "args": ["run", "/Users/sg/gmail-mcp/gmail_mcp/main.py:mcp"],
      "cwd": "/Users/sg/gmail-mcp",
      "env": {
        "PYTHONPATH": "/Users/sg/gmail-mcp",
        "CONFIG_FILE_PATH": "/Users/sg/gmail-mcp/config.yaml",
        "GOOGLE_CLIENT_ID": "<your-client-id>",
        "GOOGLE_CLIENT_SECRET": "<your-client-secret>",
        "TOKEN_ENCRYPTION_KEY": "<generated-fernet-key>"
      }
    }
  }
}
```

### Step 4: Generate Encryption Key

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Copy output to TOKEN_ENCRYPTION_KEY in config
```

### Step 5: Create Command File

Create `.claude/commands/cyber-email.md` (detailed workflow specification matching `/cyber-telegram` structure).

### Step 6: First Run Authentication

1. Restart Claude Desktop (to load new MCP server)
2. Run `/cyber-email`
3. Browser opens for Google OAuth consent
4. Grant permissions: Gmail + Calendar access
5. Tokens saved to `~/gmail-mcp/tokens.json` (encrypted)
6. Verify connection: "List my unread emails"

### File Locations Summary

| Component | Path |
|-----------|------|
| MCP server | `~/gmail-mcp/` |
| OAuth tokens | `~/gmail-mcp/tokens.json` (encrypted) |
| Command definition | `/Users/sg/Work/cyberman/.claude/commands/cyber-email.md` |
| Deal folders | `/Users/sg/Work/cyberman/deals/<company>/` |
| Call transcripts | `/Users/sg/Work/cyberman/context/calls/` |

---

## Testing Plan

### Phase 1: MCP Server Setup
- [ ] Install server, authenticate successfully
- [ ] Verify tools available in Claude Desktop
- [ ] Test `list_emails` returns inbox
- [ ] Test `read_email` shows full content
- [ ] Test attachment download works

### Phase 2: Command Workflow
- [ ] Create `/cyber-email` command file
- [ ] Process 1 test email successfully
- [ ] Verify draft created (not sent)
- [ ] Verify "TO ANSWER" label applied
- [ ] Test attachment save to deal folder

### Phase 3: Deal Integration
- [ ] Test auto-detection of existing deal
- [ ] Test new deal folder creation
- [ ] Verify context loaded from `.cybos/context.md`
- [ ] Test attachment routing rules
- [ ] Verify enriched reply draft uses context

### Phase 4: Conversational Usage
- [ ] Test search query: "Find emails from X"
- [ ] Test context query: "Email history with Y"
- [ ] Test quick action: "Save attachment to deal"
- [ ] Verify no confirmation for read-only ops
- [ ] Verify confirmation for send/modify ops

---

## Success Criteria

- [ ] Can process unread emails with `/cyber-email` command
- [ ] Drafts are contextual (not generic) based on relationship history
- [ ] Attachments automatically saved to correct deal folders
- [ ] Emails labeled "TO ANSWER" for follow-up
- [ ] No emails auto-sent without explicit confirmation
- [ ] Search queries return relevant historical context
- [ ] Deal folder integration seamless (auto-detect + create)
- [ ] Calendar events detected from scheduling emails

---

## Future Enhancements

**Phase 2 (post-MVP):**
- Auto-triage: categorize emails (deal flow, spam, personal)
- Smart labels: auto-apply labels based on content (urgent, follow-up, intro)
- Bulk operations: `/cyber-email --archive-read` to clean inbox
- Email templates: save common replies for quick sending
- Integration with `/cyber-memo`: reference emails in investment memos

**Phase 3 (advanced):**
- Email digest: daily summary of important emails
- Follow-up reminders: flag emails needing response in 3 days
- Network graph: visualize email relationships (who introduces whom)
- Sentiment analysis: detect urgent/negative tone in founder emails
- Multi-account: support both personal + work Gmail
