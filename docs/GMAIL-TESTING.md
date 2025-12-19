# Gmail MCP Integration - Setup & Testing Guide

**Status:** ✅ Fully Operational
**Date:** 2026-01-05
**Server:** @gongrzhe/server-gmail-autoauth-mcp

## What's Configured

✅ Gmail MCP server: `@gongrzhe/server-gmail-autoauth-mcp` (NPX-based, stdio compatible)
✅ OAuth credentials: `~/.gmail-mcp/gcp-oauth.keys.json`
✅ Authentication token: `~/.gmail-mcp/credentials.json` (auto-generated)
✅ Project config: `.claude/.mcp.json` updated with Gmail MCP server
✅ `/cyber-email` command created for email processing workflow

## Initial Setup

### 1. Prerequisites

- Google Cloud Project with Gmail API enabled
- OAuth 2.0 credentials (Desktop app type)
- Claude Code CLI installed

### 2. Install Gmail MCP Server

Add Gmail MCP server to your project:

```bash
claude mcp add --scope project --transport stdio gmail -- npx -y @gongrzhe/server-gmail-autoauth-mcp
```

This will update `.claude/.mcp.json` with the Gmail server configuration.

### 3. Set Up OAuth Credentials

1. Download OAuth 2.0 credentials from Google Cloud Console (JSON file)
2. Save to `~/.gmail-mcp/gcp-oauth.keys.json`:

```bash
mkdir -p ~/.gmail-mcp
cp /path/to/downloaded/credentials.json ~/.gmail-mcp/gcp-oauth.keys.json
```

The credentials file should have this structure:
```json
{
  "installed": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "project_id": "your-project-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uris": ["http://localhost"]
  }
}
```

### 4. Authenticate with Gmail

Run the authentication flow:

```bash
npx @gongrzhe/server-gmail-autoauth-mcp auth
```

**Expected behavior:**
1. Server starts on `http://localhost:3000`
2. Browser opens with Google OAuth consent screen
3. Grant permissions for:
   - Read, compose, send, and permanently delete Gmail messages
   - Manage Gmail settings (labels, filters)
4. Redirects to localhost:3000/oauth2callback
5. Token saved to `~/.gmail-mcp/credentials.json`
6. Shows "Authentication completed successfully"

**Troubleshooting authentication:**
- If port 3000 is in use, kill the process: `lsof -ti:3000 | xargs kill -9`
- If redirect fails, check Google Cloud Console has `http://localhost:3000/oauth2callback` in Authorized redirect URIs
- OAuth consent screen must have scopes: `gmail.modify`, `gmail.settings.basic`

### 5. Restart Claude Code

After authentication, restart your Claude Code session to load the Gmail MCP server with authenticated credentials.

## Available Tools

Once configured, these Gmail MCP tools are available:

| Tool | Purpose |
|------|---------|
| `mcp__gmail__search_emails` | Search emails using Gmail query syntax |
| `mcp__gmail__read_email` | Read full email content by message ID |
| `mcp__gmail__draft_email` | Create draft reply (recommended - doesn't send) |
| `mcp__gmail__send_email` | Send email immediately (requires confirmation) |
| `mcp__gmail__download_attachment` | Download attachments to local filesystem |
| `mcp__gmail__modify_email` | Add/remove labels from emails |
| `mcp__gmail__list_email_labels` | List all available Gmail labels |
| `mcp__gmail__get_or_create_label` | Get label by name or create if doesn't exist |
| `mcp__gmail__batch_modify_emails` | Modify multiple emails efficiently |
| `mcp__gmail__batch_delete_emails` | Delete multiple emails efficiently |

## Testing

### Basic Email Operations

**Search for unread emails:**
```
Show me my last 5 unread emails
```

**Read specific email:**
```
Read the email about Meta acquiring Manus
```

**Search with Gmail syntax:**
```
Find all emails from acmecorp.com after:2025/12/01
```

**Draft a reply:**
```
Draft a reply to the last email saying we're interested
```

### Test /cyber-email Command

The `/cyber-email` command provides a structured workflow for processing deal flow emails:

**Process one unread email:**
```
/cyber-email
```

**Expected workflow:**
1. Lists next unread email (sender, subject, preview)
2. Reads full email content including thread
3. Checks for existing deal folder: `/deals/<company>/`
4. Loads context from `/deals/<company>/.cybos/context.md` if exists
5. Drafts contextual reply (uses deal history if available)
6. Detects and offers to download attachments
7. Applies "TO ANSWER" label for follow-up tracking
8. Shows summary report

**Process multiple emails:**
```
/cyber-email --count 3
```

**Filter by sender:**
```
/cyber-email --from "founder@startup.com"
```

### Test Deal Folder Integration

**For email from known deal:**
1. Email from company with folder in `/deals/<company>/`
2. Run `/cyber-email`
3. Verify: Loads context from `/deals/<company>/.cybos/context.md`
4. Verify: Draft reply references deal history and context

**For email from new company:**
1. Email from `founder@newstartup.ai`
2. Run `/cyber-email`
3. Should prompt: "Create /deals/new-startup/ for this sender?"
4. If confirmed, creates folder structure:
```
/deals/new-startup/
├── .cybos/
│   └── context.md
├── materials/
├── updates/
└── research/
```

### Test Attachment Handling

**Send test email with attachment:**
- To: your Gmail address
- Subject: "Pitch deck for NewStartup AI"
- Attach: deck.pdf
- From: founder@newstartup.ai

**Run `/cyber-email` and verify:**
- Attachment detected: "deck.pdf (2.1 MB)"
- Prompted to save to deal folder
- Saved as: `/deals/new-startup/materials/0105-pitch-deck-26.pdf`
- Follows naming pattern: `MMDD-<type>-YY.<ext>`

### Verify Safety Features

**Draft-first workflow:**
- All replies created as drafts, never auto-sent
- Check Gmail drafts folder to confirm
- User must manually send from Gmail or use send_email tool with confirmation

**Label operations:**
- Always confirms before applying labels
- "TO ANSWER" label applied automatically after processing
- Can batch-apply labels to multiple emails

**Deal folder creation:**
- Always asks before creating new deal folders
- Provides company name and domain for confirmation
- Creates standard folder structure

## Troubleshooting

### Gmail MCP Tools Not Available

**Symptoms:**
- Tool not found errors: `mcp__gmail__*`
- MCP server not connecting

**Solutions:**
1. Verify server in project config:
```bash
cat .claude/.mcp.json | grep -A 5 "gmail"
```

Should show:
```json
"gmail": {
  "command": "npx",
  "args": ["-y", "@gongrzhe/server-gmail-autoauth-mcp"]
}
```

2. Check credentials exist:
```bash
ls -la ~/.gmail-mcp/
```

Should show:
- `gcp-oauth.keys.json` (OAuth client credentials)
- `credentials.json` (authentication token, after auth)

3. Restart Claude Code session

### Authentication Errors

**"Invalid redirect URI":**
- Add `http://localhost:3000/oauth2callback` to Authorized redirect URIs in Google Cloud Console
- Exact match required (including protocol and port)

**"Access blocked: Authorization Error":**
- OAuth consent screen must be configured
- Add test users if in "Testing" mode
- Required scopes: `gmail.modify`, `gmail.settings.basic`

**"Token expired" or "Invalid credentials":**
- Delete old token and re-authenticate:
```bash
rm ~/.gmail-mcp/credentials.json
npx @gongrzhe/server-gmail-autoauth-mcp auth
```

### Port 3000 Already in Use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Re-run authentication
npx @gongrzhe/server-gmail-autoauth-mcp auth
```

### Deal Folder Not Auto-Detected

**Symptoms:**
- Email from known company doesn't load context
- Always prompted to create new folder

**Solutions:**
1. Check folder naming matches email domain:
   - Email: `john@acmecorp.ai` → Folder: `/deals/acmecorp/`
   - Email: `sarah@startup.io` → Folder: `/deals/startup/`

2. Fuzzy matching handles:
   - Case differences: "AcmeCorp" vs "acmecorp"
   - Hyphens: "acme-corp" vs "acmecorp"
   - Common words: "Corp", "Inc", "AI", "Labs"

3. If still not matching, rename folder to match domain (use kebab-case)

### Rate Limits

Gmail API quotas (free tier):
- 1 billion quota units/day
- 250 quota units/user/second
- 25,000 requests/day

Most operations cost 5-10 units. If you hit limits:
- Wait a few minutes between large batch operations
- Check quota: https://console.cloud.google.com/apis/api/gmail.googleapis.com/quotas

## Success Checklist

After setup, verify:

- [x] Gmail MCP server configured in `.claude/.mcp.json`
- [x] OAuth credentials in `~/.gmail-mcp/gcp-oauth.keys.json`
- [x] Authenticated successfully (token in `~/.gmail-mcp/credentials.json`)
- [x] Can search and read emails via Claude Code
- [x] Can draft replies (created as drafts, not sent)
- [x] Draft replies are contextual (reference email content)
- [ ] Attachments detected and can be downloaded
- [ ] Deal folder context loads correctly
- [ ] "TO ANSWER" label applied after processing
- [ ] New deal folders can be created from emails
- [ ] No emails auto-sent without explicit confirmation

## Next Steps

Now that Gmail MCP is working:

1. **Test `/cyber-email` workflow** with real deal flow emails
2. **Verify attachment handling** with pitch decks and updates
3. **Check context loading** for existing deals
4. **Document examples** of good email drafts
5. **Log activity** to `/.cybos/logs/MMDD-YY.md`

## Reference

- **Gmail MCP GitHub:** https://github.com/GongRzhe/Gmail-MCP-Server
- **Design Doc:** `/docs/plans/2026-01-05-gmail-integration-design.md`
- **Command Workflow:** `/.claude/commands/cyber-email.md`
- **Architecture:** `/docs/ARCHITECTURE.md` (Gmail MCP section)
