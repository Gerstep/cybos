# Typefully MCP Integration - Final Design

**Date**: 2026-01-04
**Status**: COMPLETED (Updated 2026-01-21)
**Approach**: Direct API v2 calls via curl (MCP tools unreliable)

> **Note**: This plan was originally written for MCP tools. Implementation now uses
> direct Typefully API v2 calls. See `.claude/skills/Content/workflows/schedule.md`
> for current working implementation.

---

## Overview

Integrate Typefully MCP to enable scheduling of tweets and LinkedIn posts directly from Cybos content workflows. The system will support text + images, multiple platforms, and flexible scheduling options.optio

---

## Architecture

### Components

1. **Command**: `/cyber-schedule` - New slash command
2. **Workflow**: `.claude/skills/Content/workflows/schedule.md` - Scheduling logic
3. **MCP Integration**: Typefully MCP server (already configured)
4. **Content Sources**: Existing content in `/content/posts/`, `/content/tweets/`, `/content/essays/`

### Flow

```
User runs: /cyber-schedule @content/tweets/0104-test-26.md

↓

Workflow loads content file

↓

Ask user: Platforms? (Twitter / LinkedIn / Both)

↓

Ask user: When? (now / later / queue)

↓

If images specified: Prepare media upload

↓

Call Typefully MCP: typefully_create_draft

↓

Save to local file (preserve archive)

↓

Log to /.cybos/logs/MMDD-YY.md

↓

Confirm to user with Typefully URL
```

---

## MCP Tools Available

### 1. `typefully_list_social_sets`
**Purpose**: Get list of available Typefully accounts
**Parameters**:
- `limit` (optional, default: 10)
- `offset` (optional, default: 0)

**Returns**: Array of social sets with IDs

**Example**:
```json
{
  "results": [
    {
      "id": 161806,
      "username": "sgershuni",
      "name": "stepa — cyber/acc"
    }
  ]
}
```

### 2. `typefully_get_social_set_details`
**Purpose**: Get platform details for a social set
**Parameters**:
- `social_set_id` (required)

**Returns**: Full social set with all connected platforms

**Example**:
```json
{
  "id": 161806,
  "platforms": {
    "x": {"username": "cyntro_py", "enabled": true},
    "linkedin": {"username": "sgershuni", "enabled": true}
  }
}
```

### 3. `typefully_create_draft`
**Purpose**: Create/schedule draft posts
**Parameters**:
- `social_set_id` (required)
- `requestBody` (required):
  - `draft_title` (optional): Internal title
  - `platforms` (required): Platform config object
  - `publish_at` (optional): "now" | "next-free-slot" | ISO timestamp
  - `share` (optional): Generate share URL
  - `tags` (optional): Array of tag slugs

**Platform Config Structure**:
```json
{
  "x": {
    "enabled": true,
    "posts": [
      {
        "text": "Tweet content here",
        "media_ids": ["uuid-of-uploaded-media"]
      }
    ]
  },
  "linkedin": {
    "enabled": true,
    "posts": [
      {
        "text": "LinkedIn post content",
        "media_ids": []
      }
    ]
  }
}
```

**Returns**:
```json
{
  "id": 7727066,
  "social_set_id": 161806,
  "status": "DRAFT",
  "url": "https://typefully.com/?d=7727066&a=161806"
}
```

### 4. `typefully_upload_media` (tentative - needs testing)
**Purpose**: Upload images for attachment
**Parameters**: TBD
**Returns**: `media_id` UUID

---

## User Configuration

### Social Set Selection

**Default Social Set**: 161806 (stepa — cyber/acc @sgershuni)

User can configure default in `.claude/skills/Content/config.json`:
```json
{
  "typefully": {
    "default_social_set_id": 161806,
    "default_platforms": ["x", "linkedin"]
  }
}
```

### Connected Platforms (Social Set 161806)

- ✅ X (Twitter): @cyntro_py
- ✅ LinkedIn: @sgershuni
- Mastodon: @stepag (not used in current scope)
- Threads: @stepa.eth (not used in current scope)
- Bluesky: @stepag.bsky.social (not used in current scope)

---

## Implementation Details

### Command: `/cyber-schedule`

**Location**: `.claude/commands/cyber-schedule.md`

**Usage**:
```bash
/cyber-schedule @content/tweets/0104-topic-26.md
/cyber-schedule @content/posts/0104-post-26.md --image @content/images/0104-img-26.png
/cyber-schedule @content/essays/0104-essay-26.md
```

**Command File Content**:
```markdown
---
name: cyber-schedule
description: Schedule content to Twitter and/or LinkedIn via Typefully
---

Schedule content to social media platforms via Typefully.

**Usage:**
- `/cyber-schedule @content/tweets/MMDD-topic-YY.md`
- `/cyber-schedule @content/posts/MMDD-post-YY.md --image @content/images/MMDD-img-YY.png`

**Arguments:**
- Content file: @-prefixed path to content file (required)
- --image: Optional @-prefixed path to image file

**Example:**
```
/cyber-schedule @content/tweets/0104-ai-agents-26.md --image @content/images/0104-ai-26.png
```

**Workflow:**

Follow the schedule workflow:
@.claude/skills/Content/workflows/schedule.md

This workflow will:
1. Load content from specified file
2. Ask for platform selection (Twitter/LinkedIn/Both)
3. Ask for timing (now/later/queue)
4. Upload images if specified
5. Create draft in Typefully
6. Save locally and log action
```

### Workflow: `schedule.md`

**Location**: `.claude/skills/Content/workflows/schedule.md`

**Content Structure**:

```markdown
# Social Media Scheduling Workflow

Schedule content to Twitter and/or LinkedIn via Typefully MCP.

## Inputs

- Content file path (from command @reference)
- Optional image file path (from --image flag)

## Configuration

**Default Social Set ID**: 161806 (stepa — cyber/acc @sgershuni)
**Available Platforms**: x (Twitter), linkedin

## Workflow Steps

### 1. PARSE ARGUMENTS

Extract from command:
- Content file path (required, @-prefixed)
- Image file path (optional, --image @-prefixed)

Validate:
- Content file exists
- If --image provided, image file exists

### 2. READ CONTENT

Load content from file and detect type:

**Tweet** (from `/content/tweets/MMDD-*.md`):
- Extract from "## Tweet Text" section
- Use text as-is

**Telegram Post** (from `/content/posts/MMDD-*.md`):
- Extract from "## English (Twitter)" section
- DO NOT use Russian section

**Essay** (from `/content/essays/MMDD-*.md`):
- Extract full markdown content
- Note: Long content may need truncation for Twitter

### 3. PLATFORM SELECTION

Ask user:
```
Schedule to:
1. Twitter (@cyntro_py)
2. LinkedIn (@sgershuni)
3. Both Twitter and LinkedIn
```

Map response:
- "1" or "twitter" or "x" → `{"x": enabled, "linkedin": disabled}`
- "2" or "linkedin" → `{"x": disabled, "linkedin": enabled}`
- "3" or "both" → `{"x": enabled, "linkedin": enabled}`

### 4. TIMING SELECTION

Ask user:
```
Publish:
1. Now (immediate)
2. Queue (next available slot)
3. Schedule for specific time
```

If "3", ask:
```
Enter date/time (e.g., "2026-01-05 10:00 AM PST"):
```

Parse and convert to ISO 8601 with timezone.

Map to Typefully parameter:
- "1" → `"publish_at": "now"`
- "2" → `"publish_at": "next-free-slot"`
- "3" → `"publish_at": "2026-01-05T10:00:00-08:00"`

### 5. IMAGE HANDLING (if --image provided)

**Step 5.1**: Verify image file exists

**Step 5.2**: Upload to Typefully
```
Call: mcp__typefully__typefully_upload_media
Parameters: {
  social_set_id: 161806,
  file_path: [image path]
}
Returns: media_id (UUID)
```

**Step 5.3**: Add to posts array
```json
"posts": [{
  "text": "content",
  "media_ids": ["received-uuid-here"]
}]
```

**Fallback** (if upload fails):
- Warn user: "Image upload failed, proceeding with text-only"
- Continue without media_ids

### 6. CREATE DRAFT

Build request body:
```json
{
  "social_set_id": 161806,
  "requestBody": {
    "draft_title": "[auto-generated from filename]",
    "platforms": {
      "x": {
        "enabled": [true/false based on step 3],
        "posts": [{
          "text": "[content from step 2]",
          "media_ids": ["[UUID from step 5 if applicable]"]
        }]
      },
      "linkedin": {
        "enabled": [true/false based on step 3],
        "posts": [{
          "text": "[content from step 2]",
          "media_ids": ["[UUID from step 5 if applicable]"]
        }]
      },
      "mastodon": {"enabled": false},
      "threads": {"enabled": false},
      "bluesky": {"enabled": false}
    },
    "publish_at": "[value from step 4]",
    "share": false
  }
}
```

Call MCP tool:
```
mcp__typefully__typefully_create_draft
```

Capture response:
```json
{
  "id": 7727066,
  "social_set_id": 161806,
  "status": "DRAFT" | "SCHEDULED" | "PUBLISHED",
  "url": "https://typefully.com/?d=7727066&a=161806"
}
```

### 7. CONFIRM TO USER

Display:
```
✅ Scheduled to Typefully!

Platforms: [Twitter / LinkedIn / Both]
Timing: [Now / Queue / Scheduled for TIME]
Status: [Draft / Scheduled / Published]

View in Typefully: https://typefully.com/?d=7727066&a=161806
Local file: [original content file path]
```

### 8. LOG

Append to `/.cybos/logs/MMDD-YY.md`:
```markdown
## HH:MM | content | schedule | [topic-slug-from-filename]
- Workflow: schedule
- Source: [content file path]
- Platforms: [x, linkedin]
- Timing: [now/queue/scheduled-time]
- Image: [yes/no]
- Typefully Draft ID: [id]
- Typefully URL: [url]
- Status: [success/failed]

---
```

## Error Handling

### Content File Not Found
```
Error: Content file not found at @path/to/file.md
Please check the path and try again.
```
Exit workflow.

### Image File Not Found (if --image specified)
Ask user:
```
Image file not found at @path/to/image.png
Continue without image? (y/n)
```
- If "y" → Proceed without image
- If "n" → Exit workflow

### Invalid Content Structure
```
Error: Could not extract content from file.
Expected sections:
  - Tweets: "## Tweet Text"
  - Posts: "## English (Twitter)"
  - Essays: Full markdown content

Please check file format.
```
Exit workflow.

### Typefully API Error
```
Error: Typefully scheduling failed
Message: [error message from API]

Content saved locally at: [file path]
You can retry with: /cyber-schedule @[file path]
```
Exit workflow (don't log as success).

### Invalid Date Format (step 4)
```
Error: Invalid date format
Expected: "YYYY-MM-DD HH:MM AM/PM TIMEZONE"
Example: "2026-01-05 10:00 AM PST"
```
Re-prompt for date/time.

## Notes

- Always save content locally first (existing workflow behavior)
- This workflow is called AFTER content creation
- User can schedule same content multiple times (e.g., different timing)
- Draft IDs are stored in logs for reference but not in content files
- Media upload may have size/format restrictions (test during implementation)

## Quality Checklist

- [ ] Content file loaded successfully
- [ ] Platform selection validated
- [ ] Timing parsed correctly
- [ ] Image uploaded (if specified)
- [ ] Typefully draft created
- [ ] User confirmation displayed with URL
- [ ] Local file remains intact
- [ ] Action logged

## Future Enhancements

- Support for thread creation (multi-tweet)
- Tag management
- Social set selection (currently hardcoded to 161806)
- Draft editing/cancellation commands
- Bulk scheduling from folder
```

---

## File Changes Required

### 1. Create Command File
**Path**: `.claude/commands/cyber-schedule.md`
**Content**: See "Command: `/cyber-schedule`" section above

### 2. Create Workflow File
**Path**: `.claude/skills/Content/workflows/schedule.md`
**Content**: See "Workflow: `schedule.md`" section above

### 3. Update CLAUDE.md
Add to workflow mapping table:
```markdown
| "Schedule tweet", "schedule to typefully", "post to linkedin" | `.claude/commands/cyber-schedule.md` |
```

### 4. Update docs/ARCHITECTURE.md
Add to MCP Integrations section:
```markdown
### Typefully (Social Media Scheduling)

**Server**: https://mcp.typefully.com/mcp
**Tools**: `typefully_create_draft`, `typefully_list_social_sets`, `typefully_get_social_set_details`
**Usage**: Schedule tweets/LinkedIn posts from generated content

**Configuration**:
- Default social set: 161806 (stepa @sgershuni)
- Platforms: Twitter (@cyntro_py), LinkedIn (@sgershuni)
- Supports text + images, immediate/queued/scheduled posting

**Workflow**: `.claude/skills/Content/workflows/schedule.md`
```

### 5. Update README.md
Add to commands table:
```markdown
| `/cyber-schedule "file"` | Schedule content to Twitter/LinkedIn |
```

---

## Testing Plan

### Test 1: Simple Tweet
```bash
/cyber-schedule @content/tweets/0104-test-26.md
# Select: Twitter
# Select: Now
```
**Expected**: Draft created immediately on Twitter

### Test 2: LinkedIn + Twitter
```bash
/cyber-schedule @content/posts/0104-test-26.md
# Select: Both
# Select: Queue
```
**Expected**: Draft added to queue for both platforms

### Test 3: Scheduled with Image
```bash
/cyber-schedule @content/tweets/0104-test-26.md --image @content/images/0104-test-26.png
# Select: Twitter
# Select: Schedule for specific time
# Enter: "2026-01-06 10:00 AM PST"
```
**Expected**: Draft scheduled with image attachment

### Test 4: Essay to LinkedIn
```bash
/cyber-schedule @content/essays/0104-test-26.md
# Select: LinkedIn
# Select: Now
```
**Expected**: Essay content posted to LinkedIn (may truncate if too long)

---

## Implementation Checklist

- [ ] Create `.claude/commands/cyber-schedule.md`
- [ ] Create `.claude/skills/Content/workflows/schedule.md`
- [ ] Update `CLAUDE.md` workflow mapping
- [ ] Update `docs/ARCHITECTURE.md` MCP section
- [ ] Update `README.md` commands list
- [ ] Test with simple tweet (Test 1)
- [ ] Test multi-platform (Test 2)
- [ ] Test with image (Test 3)
- [ ] Test with essay (Test 4)
- [ ] Verify logging works correctly
- [ ] Commit changes with proper message

---

## Success Criteria

- [x] Typefully MCP connected and tested
- [ ] `/cyber-schedule` command available
- [ ] Can schedule to Twitter only
- [ ] Can schedule to LinkedIn only
- [ ] Can schedule to both platforms
- [ ] Supports "now", "queue", and "scheduled" timing
- [ ] Handles images via `--image` flag
- [ ] Saves content locally (preserves archive)
- [ ] Logs all scheduling actions
- [ ] Provides Typefully URL for viewing/editing
- [ ] Error handling for all failure cases

---

## Future Considerations

### Thread Support
Typefully supports multi-tweet threads. Could extend workflow to:
- Detect long content and offer to split into thread
- Manual thread creation from multiple content files

### Social Set Selection
Currently hardcoded to personal account (161806). Could add:
- `--account` flag to select primary, org, or product
- Interactive menu to choose account

### Draft Management
Additional commands:
- `/cyber-drafts` - List all Typefully drafts
- `/cyber-cancel [id]` - Cancel scheduled draft
- `/cyber-reschedule [id]` - Change timing for existing draft

### Analytics
- Track which content performs best
- A/B testing for different timing
- Platform-specific content variations

---

## Timeline

**Phase 1 (Immediate)**: Core functionality
- Create command and workflow files
- Update documentation
- Basic testing

**Phase 2 (After validation)**: Enhanced features
- Image upload implementation
- Better error handling
- Social set selection

**Phase 3 (Future)**: Advanced features
- Thread support
- Draft management commands
- Analytics integration
