# Social Media Scheduling Workflow

Schedule content to Twitter and/or LinkedIn via Typefully MCP.

## Configuration

**Identity**: Load from `context/identity.md` for platform handles
**Social Set ID**: Configure in environment (TYPEFULLY_SOCIAL_SET_ID)
**Available Platforms**:
- X (Twitter)
- LinkedIn

## Workflow Steps

### 1. PARSE ARGUMENTS

Extract from command:
- Content file path (required, @-prefixed)
- Image file path (optional, --image @-prefixed)

Validate:
- Content file exists
- If --image provided, image file exists

If content file not found:
```
Error: Content file not found at @path/to/file.md
Please check the path and try again.
```
Exit workflow.

If image file not found (when --image specified):
Ask user:
```
Image file not found at @path/to/image.png
Continue without image? (y/n)
```
- If "y" → Proceed without image
- If "n" → Exit workflow

### 2. READ CONTENT

Load content from file and detect type based on path:

**Tweet** (from `/content/tweets/MMDD-*.md`):
- Look for "## Thread" or "## Tweet Text" section
- Extract all tweet text
- Use as-is for posting

**Telegram Post** (from `/content/posts/MMDD-*.md`):
- Look for "## English (Twitter)" section
- Extract English translation
- DO NOT use Russian section

**Essay** (from `/content/essays/MMDD-*.md`):
- Extract full markdown content
- Note: Long content works better on LinkedIn

If content cannot be extracted:
```
Error: Could not extract content from file.
Expected sections:
  - Tweets: "## Thread" or "## Tweet Text"
  - Posts: "## English (Twitter)"
  - Essays: Full markdown content

Please check file format.
```
Exit workflow.

### 3. PLATFORM SELECTION

Ask user with AskUserQuestion:
```
Schedule to:
(1) Twitter
(2) LinkedIn
(3) Both Twitter and LinkedIn
```

Map response:
- "1" or "twitter" or "x" → Twitter only
- "2" or "linkedin" → LinkedIn only
- "3" or "both" → Both platforms

### 4. TIMING SELECTION

Ask user with AskUserQuestion:
```
When to publish:
(1) Now (immediate)
(2) Queue (next available slot)
(3) Schedule for specific time
```

If user selects "3", ask for date/time:
```
Enter date/time (format: "YYYY-MM-DD HH:MM AM/PM TIMEZONE")
Example: "2026-01-06 10:00 AM PST"
```

Parse and convert to ISO 8601 with timezone.

If invalid format:
```
Error: Invalid date format
Expected: "YYYY-MM-DD HH:MM AM/PM TIMEZONE"
Example: "2026-01-05 10:00 AM PST"
```
Re-prompt for date/time.

Map to Typefully parameter:
- "1" → `"publish_at": "now"`
- "2" → `"publish_at": "next-free-slot"`
- "3" → `"publish_at": "2026-01-05T10:00:00-08:00"` (ISO 8601)

### 5. IMAGE HANDLING (if --image provided)

**Status**: ✅ Fully tested and working

If image path provided:
1. Verify image file exists (already done in step 1)
2. Call `mcp__typefully__typefully_create_media_upload`:
   ```json
   {
     "social_set_id": [SOCIAL_SET_ID],
     "requestBody": {"file_name": "filename.png"}
   }
   ```
   Response: `{"media_id": "UUID", "upload_url": "S3-presigned-URL"}`
3. Upload file to S3 using curl PUT (no Content-Type header):
   ```bash
   curl -X PUT "upload_url" --upload-file /path/to/image.png
   ```
4. Check processing status with `mcp__typefully__typefully_get_media_status`:
   ```json
   {
     "social_set_id": [SOCIAL_SET_ID],
     "media_id": "UUID"
   }
   ```
   Wait until status is "ready"
5. Use `media_id` in draft posts' `media_ids` array

### 6. BUILD PLATFORM CONFIG

Create platforms object based on step 3 selection:

```json
{
  "x": {
    "enabled": [true if Twitter selected],
    "posts": [{
      "text": "[content from step 2]",
      "media_ids": ["[UUID from step 5 if applicable]"]
    }]
  },
  "linkedin": {
    "enabled": [true if LinkedIn selected],
    "posts": [{
      "text": "[content from step 2]",
      "media_ids": ["[UUID from step 5 if applicable]"]
    }]
  },
  "mastodon": {"enabled": false},
  "threads": {"enabled": false},
  "bluesky": {"enabled": false}
}
```

### 7. CREATE DRAFT

Build complete request:
```json
{
  "social_set_id": [SOCIAL_SET_ID],
  "requestBody": {
    "draft_title": "[auto-generated from filename or topic]",
    "platforms": [platforms object from step 6],
    "publish_at": [value from step 4],
    "share": false
  }
}
```

Call MCP tool:
```
mcp__typefully__typefully_create_draft
```

Capture response:
- `id`: Draft ID
- `status`: "DRAFT" | "SCHEDULED" | "PUBLISHED"
- `url`: Typefully dashboard URL

If API call fails:
```
Error: Typefully scheduling failed
Message: [error message from API]

Content saved locally at: [file path]
You can retry with: /cyber-schedule @[file path]
```
Exit workflow.

### 8. CONFIRM TO USER

Display success message:
```
✅ Scheduled to Typefully!

Platforms: [Twitter / LinkedIn / Both]
Timing: [Now / Queue / Scheduled for TIME]
Status: [Draft / Scheduled / Published]
Image: [Yes / No]

View in Typefully: https://typefully.com/?d=[id]&a=[SOCIAL_SET_ID]
Local file: [original content file path]
```

### 9. LOG

Append to `/.cybos/logs/MMDD-YY.md`:

```markdown
## HH:MM | content | schedule | [topic-slug-from-filename]
- Workflow: schedule
- Source: [content file path]
- Platforms: [x, linkedin, or both]
- Timing: [now/queue/scheduled-time]
- Image: [yes/no]
- Typefully Draft ID: [id]
- Typefully URL: [url]
- Status: success

---
```

## Notes

- Content is always saved locally BEFORE scheduling (existing workflow behavior)
- User can schedule same content multiple times with different settings
- Draft IDs stored in logs for reference but NOT in content files
- Media upload may have limitations - test during first image upload
- Local file remains unchanged after scheduling

## Quality Checklist

Before confirming success:
- [ ] Content file loaded successfully
- [ ] Platform selection validated
- [ ] Timing parsed correctly (if scheduled)
- [ ] Image uploaded (if specified and supported)
- [ ] Typefully draft created (ID received)
- [ ] User confirmation displayed with URL
- [ ] Local file intact
- [ ] Action logged

## Future Enhancements

Ideas for future development:
- Thread support (multi-tweet posts)
- Tag management
- Social set selection (currently hardcoded to [SOCIAL_SET_ID])
- Draft editing/cancellation commands
- Bulk scheduling from folder
