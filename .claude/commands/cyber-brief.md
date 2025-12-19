---
name: cyber-brief
description: Generate morning brief with Telegram, emails, calendar, and GTD context
---

Generate a comprehensive morning brief consolidating unread Telegram messages, important emails, calendar events, and GTD tasks. Includes AI-generated synthesis and strategic leverage scoring. Output saved to `~/CybosVault/private/content/briefs/`.

**Usage:**
- `/cyber-brief` - Generate today's brief
- `/cyber-brief --email-days 7` - Include emails from last 7 days (default: 3)
- `/cyber-brief --calendar-days 3` - Include 3 days of calendar (default: 2)

**Arguments:**
- `--email-days N`: Days of email history to include (default: 3)
- `--calendar-days N`: Days of calendar events (default: 2)

---

## Prerequisites

Before running, ensure these services are authenticated:

| Service | Check | Setup |
|---------|-------|-------|
| **Telegram** | `ls ~/CybosVault/private/.cybos/telegram/session.txt` | `bun scripts/telegram-gramjs.ts --login` |
| **Gmail** | Gmail MCP responds | Complete OAuth in browser when prompted |
| **Calendar** | Gmail MCP responds | Same as Gmail (unified MCP) |

Run health check to verify: `bun scripts/health-check.ts`

If Telegram session is missing, the brief will skip Telegram messages and note the error.
If Gmail is not authenticated, the brief will skip email/calendar sections.

---

## Workflow

### 1. GATHER DATA (parallel)

Run these data gathering steps in parallel:

#### 1a. TELEGRAM MESSAGES
```bash
bun scripts/telegram-gramjs.ts --all --summary-only
```
- Outputs JSON with all unread dialogs and full messages
- Parse JSON, extract dialogs with messages
- Note: Entity context is already included in the JSON output

#### 1b. EMAIL SYNC
- **MUST call MCP tool directly** - query Gmail via MCP
- Use `mcp__gmail__search_emails` with:
  ```
  query: "(is:unread OR is:important) after:YYYY/MM/DD"
  maxResults: 50
  ```
- Calculate date: today minus N days (default: 3)
- For each email, extract:
  - From (name, email)
  - Subject
  - Date
  - Snippet (first 200 chars)
  - Labels (important flag)

#### 1c. CALENDAR EVENTS
- **MUST call MCP tool directly** - do not skip or use fallbacks
- Use `mcp__gmail__list_calendar_events` (unified Gmail MCP):
  ```
  time_min: "YYYY-MM-DDTHH:00:00"
  time_max: "YYYY-MM-DDTHH:59:59"
  max_results: 50
  ```
- Extract: Time, Title, Attendees, Location/link

#### 1d. GTD TASKS
- Read `~/CybosVault/private/GTD.md`
- Parse "# Next" section to extract pending tasks
- Each task is a bullet point under "# Next"

#### 1e. GOALS CONTEXT
- Read `~/CybosVault/private/context/who-am-i.md`
- Extract "Active Priorities" section for leverage scoring

### 2. LOAD ENTITY CONTEXT

For each person mentioned in Telegram/emails/calendar:
1. Query database for entity: `bun scripts/db/query.ts find-entity "<name or email>" --json`
2. If found, get full context: `bun scripts/db/query.ts entity <slug> --json`
3. Entity context includes recent interactions, deals, and pending items
4. Check `~/CybosVault/private/deals/` folder for matching company context files

### 3. CALCULATE STRATEGIC LEVERAGE

Apply scoring rules from `config/leverage-rules.yaml` to identify high-impact items.

#### 3a. Load Rules
- Read `config/leverage-rules.yaml`
- Parse all enabled rules with their scores and triggers

#### 3b. Score Each Item
For each item across all sources (messages, emails, meetings, tasks):

1. **Check urgency rules:**
   - Message age (>24h = 8, >48h = 9)
   - Meeting proximity (<4h with prep = 9)
   - Blocking keywords ("waiting on you", "blocked") = 9

2. **Check leverage rules:**
   - Has deal context = 7
   - Founder/investor communication = 7-8
   - Term sheet/legal = 8
   - Intro opportunity = 6

3. **Check goal-alignment rules:**
   - AI infrastructure keywords = 8
   - Robotics keywords = 8
   - Content/brand keywords = 6
   - Fund automation keywords = 7

4. **Calculate final score:**
   - Take highest matching rule score
   - If multiple categories match, add 0.5 bonus per additional category
   - Cap at 10.0

#### 3c. Select Top Items
- Filter items with score >= 7.0
- Sort by score descending
- Take top 5 items
- For each, generate:
  - Problem statement (what needs attention)
  - Impact statement (what happens if ignored)
  - Recommended action (specific next step)

### 4. GENERATE SYSTEM SYNTHESIS

After gathering all data, generate a 2-3 sentence synthesis.

**Use Haiku agent** with this context:

```
You are generating a morning brief synthesis. Load identity from context/identity.md.

Today's data:
- Telegram: [X] unread conversations ([Y] messages)
- Emails: [X] important/unread
- Calendar: [X] events today
- GTD: [X] pending tasks
- Top leverage items: [list top 3]

Generate a 2-3 sentence synthesis that:
1. Sets the tone for the day (light/busy/critical based on volume + urgency)
2. Highlights the single most important blocker or opportunity
3. Defines what success looks like today

Style rules:
- Be direct, not diplomatic
- No corporate speak or hedge soup
- Write as the user would think internally
- Reference specific items by name when relevant

Example good synthesis:
"The investment pipeline is surging. Elena's term sheet feedback is blocking the Sequoia call at 10:30 - clear that first. Today's win: close the blocking items and prep Dan Meissler intro."

Example bad synthesis:
"You have a busy day ahead with several important meetings and messages to address. Consider prioritizing your responses based on urgency."
```

### 5. SYNTHESIZE BRIEF

Create structured brief with these sections in order:

#### Section Order:

1. **SYSTEM SYNTHESIS** - AI-generated summary (from step 4)

2. **PRIORITY ACTIONS** - Items requiring immediate attention
   - Extract from leverage items with score >= 9
   - Add any meeting prep needed in next 4 hours
   - Maximum 3 items

3. **TODAY'S SCHEDULE** - Calendar events
   - Table: Time | Event | Attendees | Prep needed

4. **STRATEGIC LEVERAGE** - High-impact opportunities (from step 3)
   - Show top 5 items with scores >= 7
   - Include: Score, Problem, Impact, Source, Recommended action

5. **MESSAGES TO RESPOND** - Telegram messages needing reply
   - Group by person
   - Include full message text (not summaries)
   - Show entity context if available

6. **EMAIL HIGHLIGHTS** - Important/unread emails
   - Only show actionable emails
   - Subject + sender + snippet

7. **TASKS** - GTD Next items
   - Prioritized list from GTD.md

8. **CONTEXT LOADED** - Metadata
   - Entities referenced
   - Recent calls

9. **ERRORS** - Any errors during generation
   - Only show if errors occurred

### 6. SAVE OUTPUT

Save brief to: `~/CybosVault/private/content/briefs/MMDD-YY.md`

**File format:**
```markdown
# Morning Brief - YYYY-MM-DD

Generated: YYYY-MM-DD HH:MM

---

## System Synthesis

[AI-generated 2-3 sentence summary from step 4]

---

## Priority Actions

### [Priority 1 Title]
- **Why urgent:** [reason]
- **Action:** [specific next step]

### [Priority 2 Title]
...

---

## Today's Schedule

| Time | Event | Attendees | Prep |
|------|-------|-----------|------|
| HH:MM | [Event] | [Names] | [Prep needed or -] |

---

## Strategic Leverage

### [Item 1 Title]
- **Score:** X.X
- **Problem:** [What needs attention]
- **Impact:** [What happens if ignored]
- **Source:** [Where this came from]
- **Recommended action:** [Specific next step]

### [Item 2 Title]
...

---

## Messages to Respond

### [Person Name] (@username)
*Last message: HH:MM*
*Entity: [entity-slug] | Deal: [deal-slug]*

[Full message history, newest first]

---

## Email Highlights

| From | Subject | Date |
|------|---------|------|
| [Name] | [Subject] | [Date] |

---

## Tasks (from GTD)

- [ ] Task 1
- [ ] Task 2

---

## Context Loaded

**Entities referenced:**
- [person-name] - [brief context]

**Recent calls:**
- [date] - [call subject] - [person]

---

## Errors

[Only include this section if errors occurred]

- [Error 1]
- [Error 2]

---

*Generated by cyber-brief v2*
```

### 7. REPORT

After generating, output summary:
```
Morning Brief generated: ~/CybosVault/private/content/briefs/MMDD-YY.md

Summary:
- Telegram: X unread conversations (Y messages)
- Emails: X important/unread
- Calendar: X events today/tomorrow
- GTD tasks: X pending
- Leverage items: X high-impact

Top priorities:
1. [First priority item]
2. [Second priority item]
3. [Third priority item]

Web UI: http://localhost:3847/?day=today
```

---

## Priority Scoring (Legacy)

When determining Priority Actions (in addition to leverage scoring):

1. **Meeting prep** - Any call in next 4 hours needs prep
2. **Response urgency** - Messages waiting >24h
3. **Deal-related** - Messages from companies in `~/CybosVault/private/deals/`
4. **Explicit requests** - Direct asks for response/action
5. **Leverage** - Actions aligned with goals from `who-am-i.md`

---

## Error Handling

**IMPORTANT:** Always attempt MCP calls first. Never skip MCP calls preemptively.

- **Telegram script fails**: Report error in Errors section, continue with other sources
- **Gmail MCP fails**: Report actual error message in Errors section, skip email section
- **Calendar MCP fails**: Report actual error message in Errors section, skip calendar section
- **No GTD.md**: Skip tasks section
- **No unread messages**: Note "No pending messages" in that section
- **Leverage rules missing**: Use default urgency-based scoring only

**Anti-pattern to avoid:** Do NOT check if MCP "is available" via bash/glob before calling. Just call the MCP tool directly - it will return an error if not configured.

---

## Notes

- Full messages included (not summaries) as per user requirement
- Brief is persistent (kept in ~/CybosVault/private/content/briefs/)
- Entity context auto-loaded for all mentioned people
- Strategic leverage scoring configurable via `config/leverage-rules.yaml`
- System synthesis generated fresh each time
- Designed for morning review ritual
- Web UI available at http://localhost:3847 (requires brief-server running)

---

## Headless Execution

```bash
claude --headless "/cyber-brief"
```

Can be scheduled via launchd for automated morning briefs.

---

## Related Commands

- `/cyber-brief-server` - Start the web brief server (if not running)
- Web UI: http://localhost:3847/?day=today
- Yesterday's brief: http://localhost:3847/?day=yesterday
