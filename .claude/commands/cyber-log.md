Show recent activity from logs.

Arguments: $ARGUMENTS (optional: "today", "week", or specific date YYYY-MM-DD)

**Display logic**:

- **No argument** or **"today"**: Read `/.cybos/logs/MMDD-YY.md` for today
- **"week"**: Read last 7 days of log files
- **Specific date (YYYY-MM-DD)**: Read that date's log file

**Output format**:

```
# Cybos Activity Log

[If showing multiple days:]
## MMDD-YY

[Log entries from that day]

## MMDD-YY

[Log entries from that day]

---

**Summary**:
- Total activities: [X]
- Research: [X]
- Content: [X]
- Memos: [X]
- Other: [X]
```

**Error handling**:

- If log file doesn't exist for requested date: "No activity logged for [date]"
- If no logs exist at all: "No logs found. Activity will be logged as workflows are executed."

**Notes**:
- Logs are appended to `/.cybos/logs/MMDD-YY.md` after each workflow completion
- Format: `## HH:MM | category | type | subject`
- Useful for reviewing recent work and tracking progress
