# Social Media Scheduling Workflow

Schedule content to Twitter and/or LinkedIn via Typefully API v2.

## Configuration

**API Key**: `TYPEFULLY_API_KEY` in `.env`
**API Base**: `https://api.typefully.com/v2`
**Auth**: Bearer token in Authorization header

**Available Social Sets** (run step 0 to list):
- 161806: @sgershuni (personal)
- 153901: @cyberFund_ (fund)
- 215751: @dAGIhouse
- 252353: @demi_network

## Workflow Steps

### 0. TEST AUTH (if issues occur)

Verify API key works:
```bash
curl -s "https://api.typefully.com/v2/me" \
  -H "Authorization: Bearer $TYPEFULLY_API_KEY"
```

Expected: JSON with user info. If "token_not_valid", regenerate key at https://typefully.com/settings/api

List available social sets:
```bash
curl -s "https://api.typefully.com/v2/social-sets" \
  -H "Authorization: Bearer $TYPEFULLY_API_KEY"
```

### 1. PARSE ARGUMENTS

Extract from command:
- Content file path (required, @-prefixed) OR raw content text
- Image file path (optional, --image @-prefixed)
- Social set (optional, --account, defaults to 161806/sgershuni)

If content is raw text (no file path), use it directly.

If content file not found:
```
Error: Content file not found at @path/to/file.md
Please check the path and try again.
```
Exit workflow.

### 2. READ CONTENT

If file path provided, load content and detect type:

**Tweet** (from `~/CybosVault/private/content/tweets/MMDD-*.md`):
- Look for "## Thread" or "## Tweet Text" section
- Extract all tweet text

**Telegram Post** (from `~/CybosVault/private/content/posts/MMDD-*.md`):
- Look for "## English (Twitter)" section
- Extract English translation
- DO NOT use Russian section

**Essay** (from `~/CybosVault/private/content/essays/MMDD-*.md`):
- Extract full markdown content
- Note: Long content works better on LinkedIn

If raw text provided, use as-is.

### 3. SOCIAL SET SELECTION

Ask user with AskUserQuestion (skip if --account provided):
```
Which account?
(1) @sgershuni - personal (Recommended)
(2) @cyberFund_ - fund
(3) @dAGIhouse
```

Map to social_set_id:
- "1" or "sgershuni" → 161806
- "2" or "cyberfund" → 153901
- "3" or "dagihouse" → 215751

### 4. PLATFORM SELECTION

Ask user with AskUserQuestion:
```
Schedule to:
(1) Twitter
(2) LinkedIn
(3) Both Twitter and LinkedIn
```

Map response:
- "1" or "twitter" or "x" → x enabled
- "2" or "linkedin" → linkedin enabled
- "3" or "both" → both enabled

### 5. TIMING SELECTION

Ask user with AskUserQuestion:
```
When to publish:
(1) Draft only (save without scheduling)
(2) Now (immediate)
(3) Queue (next available slot)
(4) Schedule for specific time
```

If user selects "4", ask for date/time:
```
Enter date/time (format: "YYYY-MM-DD HH:MM AM/PM TIMEZONE")
Example: "2026-01-06 10:00 AM PST"
```

Map to `publish_at` parameter:
- "1" or "draft" → omit publish_at (creates draft)
- "2" or "now" → `"now"`
- "3" or "queue" → `"next-free-slot"`
- "4" → ISO 8601 format: `"2026-01-05T10:00:00-08:00"`

### 6. IMAGE HANDLING (if --image provided)

1. Read API key from .env
2. Create media upload:
```bash
MEDIA_RESPONSE=$(curl -s -X POST "https://api.typefully.com/v2/social-sets/[SOCIAL_SET_ID]/media" \
  -H "Authorization: Bearer $TYPEFULLY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"file_name": "image.png"}')
```

3. Extract media_id and upload_url from response
4. Upload file to S3:
```bash
curl -X PUT "$UPLOAD_URL" --upload-file /path/to/image.png
```

5. Poll status until ready:
```bash
curl -s "https://api.typefully.com/v2/social-sets/[SOCIAL_SET_ID]/media/[MEDIA_ID]" \
  -H "Authorization: Bearer $TYPEFULLY_API_KEY"
```

6. Use media_id in posts' media_ids array

### 7. CREATE DRAFT

Read API key:
```bash
TYPEFULLY_API_KEY=$(grep TYPEFULLY_API_KEY .env | cut -d'=' -f2 | cut -d'#' -f1 | tr -d ' ')
```

Build and send request:
```bash
curl -s -X POST "https://api.typefully.com/v2/social-sets/[SOCIAL_SET_ID]/drafts" \
  -H "Authorization: Bearer $TYPEFULLY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "draft_title": "[auto-generated from topic]",
    "platforms": {
      "x": {
        "enabled": [true/false],
        "posts": [{"text": "[content]", "media_ids": []}]
      },
      "linkedin": {
        "enabled": [true/false],
        "posts": [{"text": "[content]", "media_ids": []}]
      },
      "mastodon": {"enabled": false},
      "threads": {"enabled": false},
      "bluesky": {"enabled": false}
    },
    "publish_at": "[timing value or omit for draft]"
  }'
```

**Response fields:**
- `id`: Draft ID
- `status`: "draft" | "scheduled" | "published"
- `private_url`: Typefully dashboard URL

If API returns error:
```
Error: Typefully API failed
Message: [error detail]
Check: Is API key valid? Run step 0 to test.
```

### 8. CONFIRM TO USER

Display success:
```
Draft created in Typefully

Account: [@username]
Platforms: [Twitter / LinkedIn / Both]
Timing: [Draft / Now / Queue / Scheduled for TIME]
Status: [draft / scheduled]

View: [private_url]
```

### 9. LOG

Append to `~/CybosVault/private/.cybos/logs/MMDD-YY.md`:

```markdown
## HH:MM | content | schedule | [topic-slug]
- Workflow: schedule
- Account: [social_set_id / username]
- Platforms: [x, linkedin, or both]
- Timing: [draft/now/queue/scheduled-time]
- Typefully Draft ID: [id]
- Typefully URL: [private_url]
- Status: success

---
```

## API Reference

### Authentication
All requests require:
```
Authorization: Bearer YOUR_API_KEY
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /v2/me | Current user info |
| GET | /v2/social-sets | List all accounts |
| GET | /v2/social-sets/{id} | Account details |
| GET | /v2/social-sets/{id}/drafts | List drafts |
| POST | /v2/social-sets/{id}/drafts | Create draft |
| POST | /v2/social-sets/{id}/media | Create media upload |
| GET | /v2/social-sets/{id}/media/{media_id} | Media status |

### Draft Request Schema

```json
{
  "draft_title": "string (internal only)",
  "platforms": {
    "x": {
      "enabled": true,
      "posts": [{"text": "content", "media_ids": ["uuid"]}],
      "settings": null
    },
    "linkedin": {
      "enabled": true,
      "posts": [{"text": "content", "media_ids": ["uuid"]}],
      "settings": null
    },
    "mastodon": {"enabled": false},
    "threads": {"enabled": false},
    "bluesky": {"enabled": false}
  },
  "publish_at": "now | next-free-slot | ISO-8601-datetime",
  "share": false,
  "tags": ["tag-slug"]
}
```

### Timing Values
- Omit `publish_at` → saves as draft only
- `"now"` → publish immediately
- `"next-free-slot"` → add to queue
- `"2026-01-05T10:00:00-08:00"` → schedule for specific time

## Troubleshooting

**"Token is invalid or expired"**
- Regenerate API key at https://typefully.com/settings/api
- Update TYPEFULLY_API_KEY in .env

**"No API key provided"**
- Use `Authorization: Bearer KEY` header (not X-API-KEY)

**v1 API deprecated**
- Always use /v2/ endpoints
- Old MCP tools may reference v1, use curl instead
