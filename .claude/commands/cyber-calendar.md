---
name: cyber-calendar
description: Query Google Calendar for upcoming meetings (morning brief)
---

Query today and tomorrow's calendar events for morning brief.

**Usage:**
- `/cyber-calendar` - Show today + tomorrow
- `/cyber-calendar --days 3` - Show next 3 days

**Arguments:**
- `--days N`: Number of days to query (default: 2, i.e., today + tomorrow)

**Workflow:**

1. **CALCULATE TIME RANGE**
   - timeMin: Today 00:00:00 (local timezone, ISO 8601)
   - timeMax: Tomorrow 23:59:59 (or +N days if --days specified)
   - Example: `2026-01-07T00:00:00-08:00` to `2026-01-08T23:59:59-08:00`

2. **QUERY CALENDAR**
   - Use `mcp__calendar__list-events` (note: hyphen not underscore):
     ```
     calendarId: "primary"
     timeMin: "2026-01-07T00:00:00"
     timeMax: "2026-01-08T23:59:59"
     timeZone: "Europe/Lisbon"
     ```

3. **FORMAT OUTPUT**
   - Group events by day
   - Format as markdown tables
   - Include: Time range, Event title, Attendees (names only), Location/link
   - Handle all-day events: show "All day" instead of time range

4. **RETURN OUTPUT** (no file storage)
   - Output markdown directly
   - Suitable for embedding in morning brief

**Output Format:**

```markdown
## Today (2026-01-07, Tuesday)

| Time | Event | Attendees | Location |
|------|-------|-----------|----------|
| 09:00-10:00 | Team Standup | Sarah, Mike | https://zoom.us/... |
| 14:00-15:00 | Acme Corp DD Call | John Smith | Google Meet |

## Tomorrow (2026-01-08, Wednesday)

| Time | Event | Attendees | Location |
|------|-------|-----------|----------|
| 10:00-11:00 | IC Meeting | Internal | Conference Room A |
| All day | Company Offsite | Team | TBD |

---
Total: 4 events over 2 days
```

**Field Extraction:**

| Field | Source | Formatting |
|-------|--------|------------|
| Time | `start.dateTime` - `end.dateTime` | HH:MM-HH:MM (24h format) |
| Event | `summary` | As-is, truncate if >50 chars |
| Attendees | `attendees[].displayName` or `email` | Comma-separated, max 3 names + "..." |
| Location | `location` or `hangoutLink` or `conferenceData.entryPoints[0].uri` | Prefer video link |

**Attendee Formatting:**
- Self is excluded (organizer/creator)
- Show first names only for brevity
- If >3 attendees: "John, Sarah, Mike, +2 more"
- If no external attendees: "Internal"

**All-Day Events:**
- Detected when `start.date` exists instead of `start.dateTime`
- Show "All day" in Time column
- Sort at top of each day's table

**Error Handling:**
- Not authenticated: "Calendar MCP not authenticated. Run: `npx @cocal/google-calendar-mcp` and complete OAuth flow"
- No events: "No scheduled meetings for this period"
- API error: Report error details, suggest retry
- MCP not configured: "Calendar MCP not configured. Add to .claude/.mcp.json"

**Notes:**
- Output is ephemeral (not saved to files)
- Designed for headless execution in morning brief
- Returns markdown suitable for direct embedding

**Headless Execution:**
Calendar command is designed for headless Claude Code execution:
```bash
claude --headless "/cyber-calendar"
```

This enables automated morning brief workflows.
