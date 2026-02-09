# Cybos Architecture

*Technical reference for the Cybos system*

---

## System Overview

Cybos is a Claude Code-powered personal AI assistant for an individual user and an operations aid for their organization. It handles three core domains:

| Domain | Capability |
|--------|------------|
| **Research** | Company DD, technology deep-dives, market analysis, topic exploration |
| **Browse** | Discover trending topics from social feeds (Twitter) |
| **Brief** | Morning brief consolidating Telegram, emails, calendar, and GTD |
| **Email** | Process Gmail for VC deal flow, draft replies, save attachments to deals |
| **Telegram** | Process unread messages via GramJS MTProto, draft replies, save drafts |
| **Content** | Tweets, essays, images (following brand guidelines) |
| **DD Memo** | Investment memo generation from templates |
| **GTD** | Autonomous task execution from GTD.md with entity context |
| **Summarize** | Summarize transcripts (therapy sessions, meetings) into structured notes |

**Key Design Principles:**
- File-first: All state is markdown on disk or is accessible via MCP tools and scripts (Gmail, Telegram, Granola, Asana, etc)
- Scaffolding > prompting: Workflows + tools beat raw prompts
- Slash commands for execution
- Single-file logging after every workflow
- Context auto-loading: Deal context loads automatically when mentioned
- Single-user, no scheduled automation (MVP)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        CYBOS                            │
│              (Claude Code + .claude folder)             │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│    SKILLS     │   │    AGENTS     │   │     HOOKS     │
│ (Convention)  │   │ (Task tool)   │   │ ContextLoad   │
│ Research      │   │ Researchers   │   │ ActionLog     │
│ Browse        │   │ Writers       │   │ DBFreshness   │
│ Telegram      │   │ Analysts      │   │               │
│ Content       │   │               │   │               │
│ DDMemo        │   │               │   │               │
│ GTD           │   │               │   │               │
│ Summarize     │   │               │   │               │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    CONTEXT LAYER                        │
│  /context/*         (identity, philosophy, brand, style)│
│  /context/entities/ (people, orgs - sparse files)       │
│  /deals/*           (per-company research + memos)      │
│  /research/*        (topic/market research)             │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  MCP SERVERS  │   │    SQLite     │   │    OUTPUTS    │
│ Perplexity    │   │  (FTS5)       │   │ /deals/       │
│ Exa / Parallel│   │ ─────────────│   │ /research/    │
│ Firecrawl     │   │ entities      │   │ /content/     │
│ Playwright    │   │ interactions  │   │               │
│ Notion        │   │ extracted_    │   │ /.cybos/   │
│ Nano Banana   │   │   items       │   │ logs/         │
│ Typefully     │   │               │   │               │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## Configuration System (v2.1)

Starting with v2.1, Cybos uses a global configuration system that separates code from data.

### Configuration Location

```
~/.cybos/                          # Global config directory
  config.json                      # Main configuration file

~/CybosVault/                      # User data vault (configurable path)
  private/                         # Local-only data
    .cybos/
      logs/                        # All logs (activity, daemon, script)
      db/cybos.sqlite              # Context graph database
    context/                       # Core context files
    deals/                         # Deal folders
    research/                      # Topic/market research
    projects/                      # Multi-week initiatives
    content/                       # Generated content
  shared/                          # Team-shared data (optional)

cyberman/                          # Application directory
  vault -> ~/CybosVault            # Symlink for IDE access (created by setup wizard)
```

### IDE Workflow

The `vault` symlink allows editing vault files directly in your IDE:
- Open `cyberman` folder in VS Code or Cursor
- Vault files appear as `vault/private/` and `vault/shared/` in the sidebar
- Run Claude Code from the same directory
- **Ignored by git** - Your data won't be committed

### Config Schema

Location: `~/.cybos/config.json`

```json
{
  "version": "2.1",
  "vault_path": "~/CybosVault",
  "app_path": "~/Work/cyberman",
  "private": {
    "git_enabled": false,
    "repo_url": null
  },
  "shared": {
    "enabled": false,
    "repo_url": null
  },
  "user": {
    "name": "Your Name",
    "owner_name": "YourName",
    "slug": "your-name",
    "aliases": ["Me", "Your Name"]
  },
  "setup_completed": true,
  "automations": {
    "daily_reindex": true,
    "daily_brief": true
  }
}
```

**Notes:**
- `app_path` points to where Cybos code is installed (set during setup). Skills use this to locate scripts.
- API keys remain in `.env` file for security (not in config JSON).

### Configuration Scripts

| Script | Purpose |
|--------|---------|
| `scripts/config.ts` | Config loading, saving, validation, version migration |
| `scripts/paths.ts` | Centralized path resolution for vault and app locations |

### Path Resolution

All scripts should use `scripts/paths.ts` for file paths:

```typescript
import { getDealsPath, getLogsPath, getDbPath } from './paths'

const deals = getDealsPath()      // ~/CybosVault/private/deals
const logs = getLogsPath()        // ~/CybosVault/private/.cybos/logs
const db = getDbPath()            // ~/CybosVault/private/.cybos/db/cybos.sqlite
```

### Legacy Mode

During transition, the system supports legacy mode (no vault):
- If config doesn't exist and `context/`, `deals/` exist in app root → legacy mode
- Scripts use `isLegacyMode()` to detect and `getPathWithLegacyFallback()` for compatibility

### Vault Sync Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/vault-sync.sh` | Sync vault repos to GitHub | `./scripts/vault-sync.sh [private\|shared\|all]` |
| `scripts/move-to-share.sh` | Move deal/research to shared vault | `./scripts/move-to-share.sh deal acme-corp` |

**Vault sync operations:**
```bash
./scripts/vault-sync.sh private     # Sync private vault only
./scripts/vault-sync.sh shared      # Sync shared vault only
./scripts/vault-sync.sh             # Sync both (default)
./scripts/vault-sync.sh --status    # Show status of both repos
./scripts/vault-sync.sh --pull      # Pull only (no push)
```

**Moving data to shared:**
```bash
./scripts/move-to-share.sh deal acme-corp       # Move deal
./scripts/move-to-share.sh research ai-market   # Move research
```

**Gitignore templates:**
- `config/vault-private.gitignore` - Template for private vault
- `config/vault-shared.README.md` - README template for shared vault

### Setup Wizard

If config is missing when a command runs:
1. Auto-start brief-server if not running
2. Open browser to `http://localhost:3847/setup`
3. Command exits with helpful message

---

## Skill System

**Skills are a convention, not a Claude Code feature.** The `.claude/skills/` directory is an organizational pattern. Skill files are markdown documents that get loaded via:
- `@file` references in slash commands
- Explicit file reads during workflows
- Hook injection (for core identity only)

Claude Code doesn't have a native "skill loader" — we create this behavior through structured commands and workflows.

### Skill Locations

```
.claude/skills/
├── Research/
│   ├── workflows/      # orchestrator.md (universal workflow)
│   └── shared/         # agent-selection-matrix.md, investment-lens.md, etc.
├── Browse/
│   └── workflows/      # twitter-feed.md (discover topics from feeds)
├── Email/
│   └── workflows/      # process-gmail.md (via /cyber-email command)
├── Telegram/
│   └── workflows/      # process-messages.md (read, draft, save via GramJS)
├── Content/
│   └── workflows/      # telegram-post.md (primary), tweet.md, essay.md, image.md, schedule.md
├── DDMemo/
│   └── workflows/      # generate.md
├── GTD/
│   ├── SKILL.md        # Main entry point with classification + routing
│   ├── workflows/      # outreach.md, call-prep.md, podcast.md, research.md
│   └── learnings.md    # Action log for pattern analysis
└── Summarize/
    └── workflows/      # therapy.md (therapy session transcripts)
```

### Research Shared Content

Research skill uses **progressive disclosure** pattern with shared reference files in `.claude/skills/Research/shared/`:

- `agent-selection-matrix.md` - Dynamic agent selection based on research type + intensity
- `investment-lens.md` - organization investment philosophy and rubric
- `mcp-strategy.md` - MCP tool selection by intensity tier
- `error-handling.md` - Error recovery and data quality handling
- `output-standards.md` - Standardized emoji-based output formats
- `intensity-tiers.md` - Complete 3-tier intensity system spec
- `logging.md` - Research debugging and MCP usage logging

---

## Agent System

Agents are spawned via Claude Code's `Task` tool. Multiple Task calls in the same response enable **parallel execution**.

### Agent Definitions

| Agent | Model | Purpose |
|-------|-------|---------|
| `company-researcher` | Haiku | Company-specific data gathering (business, product, traction) |
| `market-researcher` | Haiku | Market dynamics, TAM, competitive landscape, timing |
| `financial-researcher` | Haiku | Funding history, metrics, valuation, unit economics |
| `team-researcher` | Haiku | Founder backgrounds, team assessment, energy/speed |
| `tech-researcher` | Haiku | Technology deep-dives, moat analysis, maturity |
| `content-researcher` | Haiku | Topic research via academic papers, social media, first-principles (for content) |
| `investment-researcher` | Haiku | Topic research via market dynamics, opportunities, timing (for investment) |
| `quality-reviewer` | Sonnet | Gap analysis, contradiction detection, follow-up identification (deep mode only) |
| `content-writer` | Sonnet | Tweets, essays, drafts |
| `memo-analyst` | Opus | Strategic investment analysis |
| `memo-writer` | Sonnet | Memo generation from template |
| `synthesizer` | Sonnet | Consolidate parallel agent outputs |

**Agent Output Format**: All research agents use standardized emoji-based format:
- 🔍 Starting | 📊 Data | 💡 Insights | ✅ Strengths | ⚠️ Concerns | 🔗 Sources | 🎯 Completion

### Parallel Execution Pattern

To run agents in parallel, issue multiple Task calls in the same response:

```
[Task: company-researcher] Research Acme Corp business model
[Task: market-researcher] Research Acme Corp's market
[Task: financial-researcher] Research Acme Corp funding
[Task: team-researcher] Research Acme Corp founders
```

Agent profiles are stored in `.claude/agents/*.md`.

---

## Context System

### Context Loading Strategy

| Context Type | Loading Method | When |
|--------------|----------------|------|
| **Identity** | SessionStart hook | Every session |
| **Workflows** | `@file` in slash commands | Per-command |
| **Deal-specific** | Auto-pulled when deal mentioned | On-demand |

### Deal Context Structure

```
/deals/<company>/
├── .cybos/
│   ├── context.md        # Deal metadata, status, key contacts
│   └── scratchpad/       # Temp agent working files
├── research/
│   └── MMDD-<slug>-YY.md # Research reports (load latest)
└── memo/
    └── memo.md           # Current memo
```

### Deal Context Template

```markdown
# Deal: [Company Name]

**Status:** [Sourced | Researching | DD | IC | Passed | Invested]
**Stage:** [Pre-seed | Seed | Series A | ...]
**First Contact:** MMDD-YY
**Lead:** [Partner name]

## Key Contacts
- Founder: [Name] ([email])

## Quick Facts
- Raising: $X at $Y valuation
- Sector: [AI Infra | Crypto | Robotics | ...]
- Thesis fit: [Notes on how this fits organization focus]

## Open Questions
- [Question 1]

## Notes
[Running notes from calls, research, etc.]
```

---

## Granola Call Extraction

Cybos extracts meeting transcripts and AI notes from Granola.

### How It Works

- **Auto-extraction**: SessionStart hook runs incremental extraction (only new calls)
- **Manual trigger**: `/cyber-save-calls` command
- **Data source**: `~/Library/Application Support/Granola/cache-v3.json`
- **Output**: `/context/calls/[MMDD]-[title]-[YY]/` with transcript.txt, notes.md, metadata.json
- **Database**: Call interactions indexed in SQLite via `/cyber-reindex`

### Output Structure

```
/context/calls/
├── README.md             # Usage documentation
└── MMDD-title-YY/        # Individual call folders
    ├── metadata.json
    ├── transcript.txt
    └── notes.md
```

---

## Telegram GramJS Integration

Cybos processes Telegram messages via GramJS MTProto client (not browser automation).

### How It Works

- **Script-based**: `scripts/telegram-gramjs.ts` connects directly to Telegram API
- **Per-person files**: Each contact has persistent conversation file (`context/telegram/<slug>.md`)
- **Entity integration**: Looks up entities by telegram username via database
- **Manual trigger**: `/cyber-telegram` command
- **Authentication**: First run prompts for phone + code, session saved to `~/.cybos/telegram/`
- **Read-only by default**: Never sends messages, only saves drafts
- **Smart filtering**: Skips archived and muted chats automatically

### Modes

| Mode | Flag | Description |
|------|------|-------------|
| **Unread** (default) | `--count N` | Process N unread conversations |
| **User** | `--user "name"` | Find specific person by username/name (any read state) |
| **Requests** | `--requests` | Process message requests folder (non-contacts who messaged you) |

```bash
# Unread mode (default)
/cyber-telegram                    # 1 unread dialog
/cyber-telegram --count 3          # 3 unread dialogs

# User mode (any read state)
/cyber-telegram --user "@username" # By Telegram username
/cyber-telegram --user "Name"      # By name

# Requests mode (non-contacts)
/cyber-telegram --requests         # Message requests folder

# Modifiers
/cyber-telegram --dry-run          # Read only, no drafts saved
/cyber-telegram --no-mark-unread   # Don't preserve unread state
```

### Workflow

1. Script fetches dialogs based on mode (unread, user search, or requests)
2. Reads last 20 messages per dialog (both directions)
3. Looks up entity by telegram username in SQLite database
4. Gets/creates per-person file: `context/telegram/<slug>.md`
5. Deduplicates: only appends messages with ID > lastMessageId
6. Creates work file:
   - Unread/requests: `content/work/MMDD-telegram-replies-YY.md`
   - User mode: `content/work/MMDD-telegram-<user-slug>-YY.md`
7. Marks conversations as unread (preserves state)
8. AI generates draft replies
9. User approves, `telegram-save-drafts.ts` saves drafts to Telegram
10. Sent messages captured on next read

**Draft saving script (`scripts/telegram-save-drafts.ts`):**
- Parses work file to extract draft replies
- Matches dialogs using strict strategy:
  1. Dialog ID (primary, e.g., `-1002178089244` for groups)
  2. Exact username match (e.g., `@username`)
  3. Exact title match only (no fuzzy/substring matching)
- Calls `messages.SaveDraft` API for each dialog
- Reports success/failure for each draft saved

### Per-Person Conversation File Format

```markdown
# Anton Lobintsev

**Entity:** anton-lobintsev
**Username:** @lobintsev
**Type:** private
**First contact:** 2026-01-06
**Last updated:** 2026-01-06T14:45:00Z
**Last message ID:** 12345

---

## 2026-01-06

- [12:39] **Anton**: Message text...
- [14:45] **Me**: Reply text...

---
```

**Metadata fields:**
- `Entity:` - links to entity index slug (for cross-reference)
- `Username:` - Telegram handle
- `Type:` - private/group/channel
- `First contact:` - when file was created
- `Last updated:` - when last message was appended
- `Last message ID:` - for deduplication

### Output Structure

```
~/CybosVault/private/
├── context/telegram/
│   ├── README.md                           # Documentation
│   ├── anton-lobintsev.md                  # Per-person conversation log
│   ├── egor.md                             # Per-person conversation log
│   └── org-team.md                         # Group chats too
└── content/work/
    └── 0106-telegram-replies-26.md         # AI draft replies (GTD-style)

~/.cybos/telegram/
└── session.txt                             # Auth session (outside git)
```

### Prerequisites

```bash
# .env
TELEGRAM_API_ID=...      # Get from https://my.telegram.org/apps
TELEGRAM_API_HASH=...    # Get from https://my.telegram.org/apps

# Install dependency
bun add telegram
```

### Safety Model

- **Drafts only**: `messages.SaveDraft` API saves draft text, user sends manually in Telegram
- **No read receipts**: Conversations marked unread after processing
- **No auto-send**: AI drafts require user approval before saving
- **Session local**: Auth stored in `~/.cybos/telegram/`, not in git
- **Deduplication**: Messages never duplicated thanks to lastMessageId tracking

---

## Email Indexing System

Cybos indexes emails from Gmail for context and morning brief.

### How It Works

- **Manual trigger**: `/cyber-email --sync` command
- **Data source**: Gmail via `@gongrzhe/server-gmail-autoauth-mcp`
- **Output**: `/context/emails/YYYY-MM-DD_<from>-<subject>/` with metadata.json, body.md
- **Database**: Email interactions indexed in SQLite via `/cyber-reindex`
- **Deduplication**: Via `.state.json` tracking processedMessageIds

### Workflow

1. Load `.state.json` to get already-processed messageIds
2. Query Gmail: `(is:unread OR is:important) after:N_days_ago`
3. Filter out already-processed emails
4. For each new email: read content, generate summary, save to folder
5. Update `.state.json` with new messageIds
6. Run `/cyber-reindex` to index emails in database

### Output Structure

```
/context/emails/
├── README.md             # Documentation
├── .state.json           # Dedup state (messageIds)
└── YYYY-MM-DD_from-subject/
    ├── metadata.json     # Email metadata + AI summary
    └── body.md           # Email content (markdown)
```

### Index Format

```markdown
| Date | From | Subject | Important | Summary | Path |
|------|------|---------|-----------|---------|------|
| 2026-01-07 | John Smith (john@acme.com) | Series A Update | ⭐ | Q4 metrics exceeded targets | [📁](./2026-01-07_john-smith-series-a/) |
```

### Query Strategy

Default sync: `(is:unread OR is:important) after:3_days_ago`
- Prioritizes important emails (marked with ⭐ in index)
- Designed for headless morning brief automation

---

## Web Brief System

Visual morning brief with scheduled generation and browser display.

### How It Works

- **Scheduled generation**: launchd triggers `/cyber-brief` daily at 8am
- **HTTP server**: Hono server on port 3847 serves API + React app
- **Parser**: Converts brief markdown to structured JSON
- **Web UI**: React + Tailwind app for visual brief display

### Components

```
scripts/
├── brief-parser.ts      # Markdown → JSON parser
├── brief-server.ts      # Hono HTTP server (port 3847)
├── morning-brief.sh     # Orchestrator (generate + server + browser)
├── install-brief.sh     # Installation script for launchd
├── db/query.ts          # Database queries including getExplorerDashboard()
└── web-brief/           # React + Vite + Tailwind app
    ├── src/
    │   ├── App.tsx             # Main component with routing
    │   ├── types.ts            # TypeScript interfaces (Brief + Explorer)
    │   ├── api.ts              # API client
    │   ├── components/
    │   │   └── ItemCard.tsx    # Reusable item display component
    │   └── pages/
    │       └── ExplorerPage.tsx # Context Explorer page
    └── dist/                    # Production build (served by Hono)

config/
├── leverage-rules.yaml        # Strategic leverage scoring rules
└── launchd/
    ├── com.cybos.brief-server.plist.example   # Server daemon template
    └── com.cybos.morning-brief.plist.example  # 8am daily trigger template
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/brief/today` | GET | Today's brief as JSON |
| `/api/brief/yesterday` | GET | Yesterday's brief as JSON |
| `/api/brief/:date` | GET | Specific brief (MMDD-YY format) |
| `/api/briefs` | GET | List available briefs |
| `/api/explorer` | GET | Explorer dashboard (deals, entities, items) |
| `/api/health` | GET | Server health check |
| `/*` | GET | Static React app |

### Context Explorer

The Explorer page (`?page=explorer`) provides a dashboard view of extracted items from the context graph database:

**Panels:**
1. **Active Deals** - Auto-detected from deal mentions, fuzzy-grouped by similar names
2. **Recent People** - Entities with recent activity, showing promises and action items
3. **My Commitments** - Pending promises/action items where I am the owner
4. **Metrics Overview** - Metrics grouped by company

**Features:**
- Filter dropdown: All / Promises / Actions / Decisions / Metrics
- Expand/collapse cards for detailed items
- Provenance quotes from source transcripts
- Trust level indicators (high/medium/low)
- 14-day rolling window

**Data flow:**
```
SQLite (context graph) → getExplorerDashboard() → /api/explorer → ExplorerPage.tsx
```

### Strategic Leverage Scoring

The brief includes a "Strategic Leverage" section that scores items by:

1. **Urgency rules** - Message age, meeting proximity, blocking keywords
2. **Leverage rules** - Deal-related, founder/investor communication, intros
3. **Goal-alignment rules** - Based on priorities from `context/who-am-i.md`

Configuration: `config/leverage-rules.yaml`

### Installation

```bash
# Full installation (build + launchd setup)
./scripts/install-brief.sh

# Check status
./scripts/install-brief.sh --status

# Uninstall
./scripts/install-brief.sh --uninstall
```

### Manual Usage

```bash
# Start server manually
bun scripts/brief-server.ts

# Open browser (skip generation)
./scripts/morning-brief.sh --skip-gen

# Just ensure server running
./scripts/morning-brief.sh --server
```

### URLs

- Web UI: http://localhost:3847
- Today's brief: http://localhost:3847?day=today
- Yesterday's brief: http://localhost:3847?day=yesterday
- API Health: http://localhost:3847/api/health

---

## Calendar Integration

Cybos queries Google Calendar via the unified Gmail MCP (which handles both email and calendar).

### How It Works

- **MCP Server**: Unified Gmail MCP (`gmail-mcp`) with built-in OAuth credentials
- **Command**: `/cyber-calendar` - returns today+tomorrow meetings
- **Output**: Markdown tables (ephemeral, not saved)
- **Use case**: Morning brief automation
- **Auth**: Same "Sign in with Google" flow as Gmail - one auth for both

### Output Format

```markdown
## Today (2026-01-07, Tuesday)

| Time | Event | Attendees | Location |
|------|-------|-----------|----------|
| 09:00-10:00 | Team Standup | Sarah, Mike | https://zoom.us/... |
| 14:00-15:00 | Acme Corp DD Call | John Smith | Google Meet |
```

### MCP Tools

```
mcp__gmail__list_calendar_events
  - time_min: ISO 8601 start (optional, defaults to now)
  - time_max: ISO 8601 end (optional)
  - max_results: number (default: 10)
  - query: free text search (optional)

mcp__gmail__create_calendar_event
  - summary: event title
  - start_time: ISO 8601 or natural language ("tomorrow 3pm")
  - end_time: ISO 8601 (optional)
  - description: event notes (optional)
  - location: event location (optional)
  - attendees: list of email addresses (optional)
```

### Headless Execution

Both email sync and calendar are designed for headless execution:
```bash
claude --headless "/cyber-email --sync"
claude --headless "/cyber-calendar"
```

---

## Morning Brief System

Cybos generates comprehensive morning briefs consolidating all data sources.

### How It Works

- **Command**: `/cyber-brief`
- **Output**: `/content/briefs/MMDD-YY.md` (persistent)
- **Data sources**: Telegram, Gmail, Calendar, GTD.md
- **Script dependency**: `scripts/telegram-gramjs.ts --all --summary-only`

### Data Gathering (parallel)

| Source | Method | Output |
|--------|--------|--------|
| Telegram | `bun telegram-gramjs.ts --all --summary-only` | JSON to stdout |
| Email | `mcp__gmail__search_emails` query: `(is:unread OR is:important) after:YYYY/MM/DD` | Message list |
| Calendar | `mcp__gmail__list_calendar_events` with time_min/time_max | Event list |
| GTD | Read `/GTD.md` | Task list |

### Brief Structure

```markdown
# Morning Brief - YYYY-MM-DD

## Priority Actions
[Urgent items requiring immediate attention]

## Today's Schedule
| Time | Event | Attendees | Location |
[Calendar events in table format]

## Messages to Respond
### [Person Name] (@username)
[Full message history - not summaries]

## Email Highlights
| From | Subject | Date |
[Important/unread emails]

## Tasks (from GTD)
- [ ] Task 1
- [ ] Task 2

## Context Loaded
[Entity context, deal references, recent calls]
```

### Key Features

- **Full messages**: Telegram messages included verbatim, not summarized
- **History**: Briefs are persistent in `/content/briefs/`
- **Priority scoring**: Based on meeting urgency, response delay, deal relevance
- **Entity enrichment**: Auto-loads context for mentioned people/companies

### Headless Execution

```bash
claude --headless "/cyber-brief"
```

---

## Unstuck System

Interactive focus/clarity ritual for breaking distraction loops and reconnecting with goals.

### How It Works

- **Command**: `/cyber-unstuck` - Opens browser to web interface
- **Web UI**: `localhost:3847/unstuck` (React + progressive reveal flow)
- **Backend**: `scripts/brief-server.ts` (API endpoints)
  - `GET /api/unstuck/goals` - Returns Active Priorities from `context/who-am-i.md`
  - `POST /api/unstuck/log` - Logs completed session to journal
- **Frontend**: `scripts/web-brief/src/pages/UnstuckPage.tsx`
- **Journal**: `/context/unstuck/journal.md` (append-only log)
- **Goals source**: Parses Active Priorities section from `context/who-am-i.md`

### The Flow

```
1. PAUSE - What's happening?
   - Predefined tags: scattered, avoiding, overwhelmed, bored, anxious, unclear, tired
   - Or write custom state

2. FORK - Did naming it help?
   → Yes → show goals
   → No → dig deeper
   → Need rest → exit gracefully

3. DIG DEEPER (if needed) - Prompts from therapy/coaching:
   - "What might I be protecting myself from?" (IFS)
   - "Where do I feel this in my body?" (Somatic)
   - "What would I do if this feeling wasn't in the way?" (ACT)

4. CONNECT - Show goals from who-am-i.md:
   - What I'm Optimizing For
   - Active Priorities
   - Philosophical Foundation
   - Pick what feels alive

5. CAPTURE - Brief note for pattern tracking

6. RELEASE - "You're clear. Go."
```

### Journal Format

```markdown
## 2026-01-07 14:32

**State:** avoiding
**Needed deeper dig:** Yes
**Deeper dig prompt:** protecting
**Response:** Fear of not being good enough at the research task
**Connected to:** Making ideas real
**Smallest step:** Open the document and write one sentence
**Note:** Realized I avoid research when I'm not sure where to start

---
```

### Design Principles

- **Reconnection over productivity**: Shows WHY layer (goals, values), not WHAT layer (specific tasks)
- **Branching paths**: Quick path when naming helps, deeper dig when it doesn't
- **Permission for rest**: Recognizes that sometimes you need a break, not motivation
- **Self-knowledge over metrics**: Tracks feelings and insights, not productivity stats
- **2-3 minutes max**: Not a therapy session, just enough to reconnect

### Output Structure

```
/context/unstuck/
├── journal.md          # Append-only session log
└── (future: patterns.md for AI-generated insights)
```

---

## MCP Integrations

### Core MCP Servers

Cybos uses these MCP servers with the following priority hierarchy:

**Primary:**
- **exa**: Web search, company research, URL content extraction (PRIMARY for research)
- **perplexity**: Fast search + deep research with citations
- **parallel-task**: Deep research tasks, report-style outputs
- **nano-banana**: Image generation (Gemini 3.0)

**Fallback:**
- **parallel-search**: Web search + content fetch (fallback for exa)
- **firecrawl**: Scraping and extraction (LAST RESORT ONLY)

**Other:**
- **playwright**: Browser automation
- **notion**: Document storage
- **typefully**: Social media scheduling (Twitter, LinkedIn) ✅
- **gmail**: Unified Gmail + Calendar MCP with built-in OAuth ✅

### MCP Server Tools Reference

| Server | Purpose | Tools |
|--------|---------|-------|
| **perplexity** | Fast search + deep research with citations | `search`, `research` |
| **parallel-search** | Web search + content fetch (fallback option) | `web_search_preview`, `web_fetch` |
| **parallel-task** | Deep research tasks, report-style outputs | `createTask`, `getTask`, `listTasks` |
| **exa** | Web search, company research, URL content extraction (PRIMARY) | `search`, `findSimilar`, `getContents` |
| **firecrawl** | Scrape, crawl, extract (LAST RESORT ONLY) | `scrape`, `crawl`, `map`, `extract` |
| **playwright** | Browser automation for hard-to-scrape sites | `navigate`, `screenshot`, `click` |
| **notion** | Notion pages + databases | `createPage`, `updatePage`, `queryDatabase` |
| **nano-banana** | Image generation (Gemini 3.0) | `generate_image`, `edit_image`, `continue_editing` |
| **typefully** | Social media scheduling (Twitter, LinkedIn) ✅ | `create_draft`, `create_media_upload`, `get_media_status` |
| **gmail** | Unified Email + Calendar MCP ✅ | `search_emails`, `read_email`, `draft_email`, `send_email`, `list_calendar_events`, `create_calendar_event`, `authenticate` |

### 3-Tier Research Intensity System

| Level | Duration | Quality | Cost | Tools | Agents |
|-------|----------|---------|------|-------|--------|
| **Quick** | 10-30s | Basic | $0.01-0.05 | Built-in only | None |
| **Standard** | 2-5m | Good | $0.10-0.30 | MCPs | 2-4 Haiku |
| **Deep** | 5-15m | Excellent | $0.50-2.00 | All MCPs + Opus | 4-6 mixed |

**Quick**: WebSearch + WebFetch only. Fast fact-checking.

**Standard** [DEFAULT]: Perplexity, Exa (search + getContents) + 2-4 parallel Haiku agents.

**Deep**: Perplexity Deep, Parallel Task Deep + 4-6 agents including Opus.

**User Control**: `--quick`, `--standard`, `--deep` flags or inferred from query.

### Tiered Research Strategy

```
1. FAST SEARCH (seconds)
   └─ perplexity search OR exa search
   └─ Fallback: parallel-search web_search_preview
   └─ Good for: quick facts, validation

2. DEEP RESEARCH (1-5 minutes)
   └─ parallel-task createDeepResearch → poll getResultMarkdown
   └─ Fallback: perplexity research (deep)
   └─ Good for: comprehensive reports

3. TARGETED EXTRACTION (as needed)
   └─ exa getContents (PRIMARY)
   └─ Fallback: parallel-search web_fetch
   └─ Last resort: firecrawl scrape

4. HARD SCRAPING (last resort)
   └─ playwright for JS-heavy sites
```

**Fallback Chain:**
- Web search: exa → parallel-search → WebSearch (built-in)
- URL content: exa getContents → parallel-search web_fetch → firecrawl (last resort) → WebFetch
- Deep research: parallel-task → perplexity (deep) → multiple agents

### Key MCP Tool Patterns

**Parallel Task (Deep Research):**
```
mcp__parallel-task__createTask
  - prompt: string (research question)
  - Returns: task_id

mcp__parallel-task__getTask
  - task_id: string
  - Returns: { status, result } (poll until complete)
```

**Perplexity:**
```
mcp__perplexity__search
  - query: string
  - Returns: search results with citations

mcp__perplexity__research
  - query: string
  - depth: "basic" | "deep"
```

**Exa:**
```
mcp__exa__search
  - query: string
  - numResults: number

mcp__exa__findSimilar
  - url: string
```

**Parallel Search (Fallback):**
```
mcp__parallel-search__web_search_preview
  - objective: string (search objective)
  - search_queries: string[] (1-5 queries)
  - Returns: LLM-friendly search results

mcp__parallel-search__web_fetch
  - objective: string (optional, what to extract)
  - urls: string[] (max 10 URLs)
  - Returns: Extracted relevant content
```

**Firecrawl (LAST RESORT ONLY - use when exa and parallel-search fail):**
```
mcp__firecrawl__scrape
  - url: string
  - formats: ["markdown", "html"]

mcp__firecrawl__extract
  - url: string
  - schema: object (structured extraction)
```

**Nano Banana (Images):**
```
mcp__nano-banana__generate_image
  - prompt: string (detailed image description)

mcp__nano-banana__edit_image
  - imagePath: string (path to existing image)
  - prompt: string (edit instructions)

mcp__nano-banana__continue_editing
  - prompt: string (refinement instructions)
```

**Typefully (Social Media Scheduling):**

> **Preferred method:** Use direct API v2 calls via curl (see `.claude/skills/Content/workflows/schedule.md`)
> The MCP tools below may be outdated. Direct curl to `https://api.typefully.com/v2/` is more reliable.

```
# Direct API (preferred)
Authorization: Bearer $TYPEFULLY_API_KEY

GET  /v2/me                              # Current user
GET  /v2/social-sets                     # List accounts
POST /v2/social-sets/{id}/drafts         # Create draft
POST /v2/social-sets/{id}/media          # Upload media
GET  /v2/social-sets/{id}/media/{mid}    # Media status

# Available social sets (as of Jan 2026):
- 161806: @sgershuni (personal)
- 153901: @cyberFund_ (fund)
- 215751: @dAGIhouse

# MCP tools (may be outdated, use curl instead)
mcp__typefully__typefully_list_social_sets
mcp__typefully__typefully_get_social_set_details
mcp__typefully__typefully_create_draft
mcp__typefully__typefully_create_media_upload
mcp__typefully__typefully_get_media_status
```

Testing status: ✅ All core functionality validated via API v2
- Multi-platform posting (Twitter + LinkedIn): Tested
- Scheduled timing (ISO 8601): Tested
- Image upload with S3: Tested
- Draft-only mode: Tested

**Gmail (Unified Email + Calendar MCP):**
```
# Authentication (zero-config for new users)
mcp__gmail__authenticate
  - Opens browser for Google OAuth sign-in
  - Built-in OAuth credentials (no setup needed)
  - Single auth grants both Gmail AND Calendar access
  - Returns: { result: "Authentication process started..." }

mcp__gmail__check_auth_status
  - Returns: { authenticated: bool, message: string }

# Email Tools
mcp__gmail__search_emails
  - query: string (Gmail search syntax: from:, to:, subject:, after:, is:unread, etc.)
  - maxResults: number (optional, default: 10)
  - Returns: List of emails with sender, subject, date, message ID

mcp__gmail__list_emails
  - max_results: number (default: 10)
  - label: string (default: "INBOX")
  - Returns: List of emails

mcp__gmail__get_email
  - message_id: string
  - Returns: Full email content

# Calendar Tools
mcp__gmail__list_calendar_events
  - max_results: number (default: 10)
  - time_min: string (ISO 8601, optional)
  - time_max: string (ISO 8601, optional)
  - query: string (optional, free text search)
  - Returns: List of calendar events with times, attendees, links

mcp__gmail__create_calendar_event
  - summary: string (event title)
  - start_time: string (ISO 8601 or natural language like "tomorrow 3pm")
  - end_time: string (optional)
  - description: string (optional)
  - location: string (optional)
  - attendees: string[] (optional, email addresses)
  - Returns: { success, event_id, event_link }

Configuration:
- Server: Custom Python MCP at ~/gmail-mcp/
- Auth: OAuth 2.0 with BUILT-IN credentials (zero config)
- Project: cybos-v2 (Gmail API + Calendar API enabled)
- Token storage: ~/cyberman/tokens.json (encrypted)

Zero-config setup for new users:
1. Run `mcp__gmail__authenticate`
2. Click "Sign in with Google" in browser
3. Done - both Gmail and Calendar work

Advanced users can override with:
- credentials.json file in ~/gmail-mcp/
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET env vars

Integration with /deals/:
- Auto-detects company from sender domain
- Loads context from /deals/<company>/index.md
- Saves attachments to /deals/<company>/materials/

Testing status: ✅ Fully operational
- Email: list, search, read
- Calendar: list events, create events
```

---

## Workflow Patterns

### Research Workflow (Universal Orchestrator)

All research uses the **orchestrator workflow** (`.claude/skills/Research/workflows/orchestrator.md`):

```
1. INITIALIZE:
   ├─ Identify research type (Company | Tech | Market | Topic-Content | Topic-Investment)
   ├─ Determine intensity (Quick | Standard | Deep)
   ├─ Create workspace: /deals/<company>/research/MMDD-<slug>-YY/ OR /research/<topic>/MMDD-<slug>-YY/
   └─ Select agents dynamically (see agent-selection-matrix.md)

2. GATHER (parallel agents - autonomous MCP calls):
   ├─ Spawn selected agents in parallel
   ├─ Each agent makes its own MCP calls (perplexity, exa, parallel-search)
   ├─ Each agent writes to: workspace/raw/agent-[name].md
   └─ No MCP calls in main session (agents do everything)

3. REVIEW (Deep mode only):
   ├─ Spawn quality-reviewer agent
   ├─ Reads all agent outputs from workspace/raw/
   ├─ Identifies: completeness gaps, contradictions, shallow coverage
   ├─ If gaps found: re-spawn specific agents with refined prompts
   └─ Max 1 iteration (no recursive quality reviews)

4. SYNTHESIZE:
   ├─ Spawn synthesizer agent
   ├─ Reads all agent outputs (including follow-ups)
   ├─ Applies appropriate lens (investment vs content)
   └─ Writes to: workspace/report.md

5. OUTPUT:
   ├─ Final synthesis: workspace/report.md
   ├─ All agent outputs preserved in: workspace/raw/
   └─ Log to: /.cybos/logs/MMDD-YY.md
```

**Workspace Structure:**
```
MMDD-<slug>-YY/
├── raw/
│   ├── agent-company-researcher.md
│   ├── agent-market-researcher.md
│   ├── agent-financial-researcher.md
│   ├── agent-quality-reviewer.md (deep only)
│   └── agent-[name]-followup.md (if quality loop triggered)
└── report.md (final synthesis)
```

**Agent Selection Matrix:**
- **Company DD**: company + market + financial (standard), +team +quality-reviewer (deep)
- **Technology**: tech + market (standard), +company +quality-reviewer (deep)
- **Market**: market + financial (standard), +company +quality-reviewer (deep)
- **Topic-Content**: content-researcher (standard), +quality-reviewer (deep)
- **Topic-Investment**: investment-researcher + market (standard), +financial +quality-reviewer (deep)

See `.claude/skills/Research/shared/agent-selection-matrix.md` for complete matrix.

**Key Principles:**
- Agents do ALL data gathering (autonomous MCP usage)
- No redundancy (main session doesn't pre-gather data)
- Dynamic selection based on type and intensity
- Quality loop ensures completeness (deep mode only)

### Content Architecture

Content creation follows a layered architecture:

```
COMMAND (cyber-essay, cyber-tweet, etc.)
    │
    ▼
WORKFLOW (essay.md, tweet.md, telegram-post.md)
    │
    ├─► LOADS: context/style/voice-identity.md (shared persona)
    │
    └─► LOADS: context/style/writing-style-[en|ru].md (language-specific)
```

**Context Files:**
| File | Purpose |
|------|---------|
| `context/style/voice-identity.md` | Shared persona, tone, anti-patterns |
| `context/style/writing-style-en.md` | English: essay structure, tweet format |
| `context/style/writing-style-ru.md` | Russian: Telegram format, Russian rules |

### Content Workflow (Telegram Posts)

Russian posts (@cryptoEssay) + English translations:

```
1. ASSESS
   └─ Light research if data claims need verification

2. DRAFT (Russian)
   └─ Load: context/style/voice-identity.md + writing-style-ru.md
   └─ Strong hook, short paragraphs, no LLM phrases
   └─ Plain text (no markdown for Telegram)

3. TRANSLATE (English)
   └─ Load: context/style/writing-style-en.md for English rules
   └─ Native English, not literal translation

4. OUTPUT
   └─ Saved to /content/posts/MMDD-<slug>-YY.md
   └─ Log to /.cybos/logs/MMDD-YY.md
```

**Workflow**: `.claude/skills/Content/workflows/telegram-post.md`

### Content Workflow (Essays)

Long-form English content:

```
1. ASSESS
   └─ Verify factual claims if needed
   └─ Load source files (@ references)

2. DRAFT
   └─ Load: context/style/voice-identity.md + writing-style-en.md
   └─ Hook → Stakes → Mechanism → Turn → Landing
   └─ 500-2500 words depending on complexity

3. REVIEW
   └─ Present draft for user feedback

4. POLISH
   └─ Apply feedback, maintain voice

5. OUTPUT
   └─ Saved to /content/essays/MMDD-<slug>-YY.md
   └─ Log to /.cybos/logs/MMDD-YY.md
```

**Workflow**: `.claude/skills/Content/workflows/essay.md`

### Content Workflow (Twitter Threads)

English tweets and threads:

```
1. ASSESS
   └─ Verify factual claims if needed

2. DRAFT
   └─ Load: context/style/voice-identity.md + writing-style-en.md
   └─ Hook patterns: "how to X", "why X doesn't work"
   └─ One sentence per line, lists for structure

3. FORMAT
   └─ Single tweet or thread (3-10 tweets)
   └─ Engagement: question OR controversial stance

4. OUTPUT
   └─ Saved to /content/tweets/MMDD-<slug>-YY.md
   └─ Log to /.cybos/logs/MMDD-YY.md
```

**Workflow**: `.claude/skills/Content/workflows/tweet.md`

### Social Media Scheduling Workflow

Schedule content to Twitter and/or LinkedIn via Typefully:

```
1. LOAD CONTENT
   └─ Read existing content from /content/tweets|posts|essays/
   └─ Extract appropriate section (Tweet Text, English translation, etc.)

2. SELECT PLATFORMS
   └─ Ask user: Twitter / LinkedIn / Both
   └─ Build platform config with enabled flags

3. SELECT TIMING
   └─ Ask user: Now / Queue / Schedule
   └─ Map to: "now" | "next-free-slot" | ISO-8601 timestamp

4. HANDLE MEDIA (optional) ✅ Validated
   └─ If --image flag provided:
      ├─ Call: mcp__typefully__typefully_create_media_upload
      ├─ Upload to S3 via presigned URL (curl PUT, no Content-Type header)
      ├─ Poll: mcp__typefully__typefully_get_media_status until "ready"
      └─ Capture media_id UUID for posts array

5. CREATE DRAFT
   └─ Call: mcp__typefully__typefully_create_draft
   └─ Social set: <social-set-id> (<account-name> @<username>)
   └─ Platform config: { x/linkedin: { enabled, posts: [{text, media_ids}] } }
   └─ Returns: draft ID, status, Typefully URL

6. CONFIRM & LOG
   └─ Display: Platforms, timing, Typefully URL
   └─ Log to /.cybos/logs/MMDD-<slug>-YY.md
   └─ Local file remains unchanged (archive preserved)
```

**Command**: `/cyber-schedule @content/file.md --image @content/image.png`
**Workflow**: `.claude/skills/Content/workflows/schedule.md`
**Status**: ✅ Production ready (tested: multi-platform, scheduling, images)

### Image Generation Workflow

Main session pipeline with automatic style inference:

```
1. INFER STYLE from request keywords:
   - info: "infographic", "diagram", "process", "flow", "comparison"
   - mural: "transformation", "sacred", "dissolution", "empire"
   - cyberpunk: "future", "atmospheric", "liminal" (default)

2. EXTRACT core idea (one sentence)

3. CREATE visual approach:
   - Info: diagram structure (icon, comparison, process, hierarchy)
   - Artistic: visual metaphor (balanced, not too literal/abstract)

4. LOAD style files from context/img-styles/

5. BUILD prompt using template from _shared.md

6. GENERATE via mcp__nano-banana__generate_image

7. SAVE to /content/images/MMDD-<slug>-YY.png
```

**Multiple images**: Call MCP in parallel for independent images.

**Style files** (`context/img-styles/`):
- `_shared.md` - Common rules, prompt template, universal avoids
- `cyberpunk.md` - Grounded futurism, Blade Runner aesthetic
- `mural.md` - Sacred transformation, particle dissolution
- `info.md` - Minimal infographics, handdrawn clarity

**Adding new styles**: Create `context/img-styles/{name}.md` with palette, elements, keywords.

**Command**: `/cyber-image "concept"` or `/cyber-image @source.md "visualize"`
**Workflow**: `.claude/skills/Content/workflows/image.md`

**Info Style Concept Engineering** (for diagrams/infographics):
- Workflow includes concept engineering step before generation
- Extracts core insight, identifies visual mechanism, self-critiques
- Post-generation critique with 5-point checklist (squint, text, background, contrast, usability)
- One regeneration allowed if critique fails
- Guide: `context/img-styles/info-concept-guide.md`
- Evals: `.claude/skills/Content/evals/info-style/` (3 evals, all passing)

### DD Memo Workflow

```
1. GATHER
   └─ Load: /deals/<company>/research/* (all research)
   └─ Load: /deals/<company>/index.md
   └─ Load: @context/investment-philosophy.md
   └─ Load: @context/MEMO_template.md

2. ANALYZE (Opus)
   └─ Deep strategic analysis
   └─ Apply investment rubric

3. WRITE (Sonnet)
   └─ Fill template structure

4. OUTPUT
   └─ /deals/<company>/memo/memo.md
   └─ Log action
```

### GTD Workflow (Autonomous Task Execution)

Process GTD.md items autonomously with entity context:

```
1. PARSE
   └─ Read GTD.md → extract items from # Next section

2. CLASSIFY (per item)
   └─ Match patterns against routing table:
      - "ask for call", "message", "email" → outreach workflow
      - "call with", "meeting", "<> X" → call-prep workflow
      - "podcast" → podcast workflow
      - company name, "research" → research workflow
      - unknown → best judgment

3. ENTITY LOOKUP
   └─ Query database: `bun scripts/db/query.ts find-entity "<name>"`
   └─ Load context: `bun scripts/db/query.ts entity <slug> --json`
   └─ Extract contact info, previous interactions, pending items

4. PLAN (default behavior)
   └─ Show plan for each item before executing
   └─ Ask for approval: "Execute? [Y/n/select]"

5. EXECUTE
   └─ Execute each task sequentially (one at a time)
   └─ Agent follows selected workflow
   └─ Staged execution: autonomous work + pending approvals

6. OUTPUT
   └─ /content/work/MMDD-<slug>.md (one file per task)
   └─ Format: context + draft + pending actions + log
   └─ Log to learnings.md
```

**Command**: `/cyber-gtd`, `/cyber-gtd --count 3`, `/cyber-gtd --execute`
**Workflow**: `.claude/skills/GTD/SKILL.md`

**Output File Format:**
```markdown
# Task: [Description]

**Status:** Pending Approval | Completed | Incomplete
**Created:** YYYY-MM-DD HH:MM
**Workflow:** [which workflow]

## Context
[Entity info, previous calls, deal context]

## Draft
[Message/agenda/questions]

## Pending Actions
- [ ] Send via Gmail to email@example.com
- [ ] Alternative: Telegram @handle

## Execution Log
- HH:MM - [action taken]
```

---

## Database Indexer

The database indexer provides a unified SQLite-based context graph for all entities, interactions, and extracted items.

### Architecture

```
Sources:                              SQLite Database:
────────────────────────────────      ────────────────────────────────────
/deals/*/                        ──┐
/context/calls/*/                ──┼──►  entities (people, companies, products)
/context/entities/*.md (sparse)  ──┤     interactions (calls, emails, telegram)
/context/telegram/*.md           ──┤     extracted_items (promises, actions, decisions)
/context/emails/*/               ──┘     entity_aliases (for deduplication)
```

### Database Schema (SQLite v2.1)

```sql
-- Core tables (5 tables, ~51 columns)
entities           -- People, companies, products, groups
entity_aliases     -- Name variations for deduplication
interactions       -- Calls, emails, telegram messages
extracted_items    -- Promises, action items, decisions, questions, metrics
batch_runs         -- Indexer run logs

-- Key features
- Full-text search via FTS5 virtual table
- Fuzzy name matching via TypeScript Levenshtein distance
- Temporal queries via ISO-8601 timestamps
- JSON arrays for participant storage (json_each() for queries)
- WAL mode for performance
```

### Scripts Structure

```
scripts/db/
├── schema-sqlite.sql       # SQLite schema with FTS5
├── client-sqlite.ts        # SQLite client (bun:sqlite)
├── init.ts                 # Create database and tables
├── index.ts                # Main batch indexer
├── extract-llm.ts          # Claude Haiku extraction runner
├── entity-resolver.ts      # TypeScript entity matching with Levenshtein
├── query.ts                # Query interface + CLI
├── extractors/
│   ├── calls.ts            # Parse /context/calls/
│   ├── emails.ts           # Parse /context/emails/
│   ├── telegram.ts         # Parse /context/telegram/
│   ├── entities.ts         # Parse manual entity files
│   └── deals.ts            # Parse /deals/ as company entities
└── prompts/
    ├── types.ts            # Shared extraction types
    ├── call-extraction.ts  # Call extraction prompt
    ├── email-extraction.ts # Email extraction prompt
    └── telegram-extraction.ts # Telegram extraction prompt
```

### Entity Resolution

TypeScript-based multi-stage matching using Levenshtein distance:

| Stage | Match Type | Confidence | Action |
|-------|-----------|------------|--------|
| 0 | User identity (configured aliases) | 1.0 | Return user entity (configured slug) |
| 1 | Blocked name (Speaker, Unknown) | - | Skip (return `_blocked_`) |
| 2 | Email exact match | 1.0 | Return existing entity |
| 3 | Telegram handle match | 1.0 | Return existing entity |
| 4 | Fuzzy name match (>0.7 Levenshtein similarity) | 0.7-0.9 | Return existing, add alias |
| 5 | No match found | - | Create new candidate entity |

**User Identity Handling (v1.1):**
- Configured aliases (including "Me") → resolve to the user entity slug
- User identity is checked FIRST before any database queries
- Items with user as owner/target correctly link to user entity
- Prevents creating duplicate user entities

**Blocked Entity Names (v1.1):**
- Generic labels are blocked: "Speaker", "Unknown", "Participant", "Caller", etc.
- User identity names are also blocked from entity creation
- Returns `_blocked_` slug which is filtered out of participants arrays
- Prevents pollution of entity database with meaningless entities

**Conservative Context Updates (v1.1):**
- Company/role info is ONLY updated from EXACT matches (email, telegram, alias)
- Fuzzy matches do NOT update company/role (prevents entity conflation)
- Example: "Dima" fuzzy-matching to "Dima Khanarin" won't update Khanarin's company

**Two-tier Entity System (v1.1):**
- Confirmed entities: `is_candidate = FALSE` (high confidence)
- Candidate entities: `is_candidate = TRUE` (extracted from calls/emails without match)
- Query `list-candidates` to review and merge candidates
- Prevents low-confidence entities from polluting the main database

**Type normalization** handles LLM variations:
- `org`, `organization`, `startup`, `fund` → `company`
- `chat`, `channel`, `community` → `group`
- `service`, `tool`, `platform`, `technology` → `product`

### LLM Extraction

Claude Haiku extracts structured items from interactions:

| Type | Description | Example |
|------|-------------|---------|
| `promise` | Commitment to do something | "I'll send you the deck" |
| `action_item` | Task needing completion | "Follow up on pricing" |
| `decision` | Conclusion reached | "We agreed to proceed with X" |
| `question` | Open question | "Need to confirm timeline" |
| `metric` | Business numbers | "500K ARR, 10 employees" |
| `deal_mention` | Deal reference | "John introduced Acme Corp" |
| `entity_context` | What someone is building | "Working on AI agents" |

**Provenance (v1.1):** Each item includes:
- `source_quote` - Verbatim quote from source (10-50 words)
- `source_span` - Line numbers (calls) or timestamp (telegram)
- `trust_level` - high/medium/low based on confidence + linkage

**Type Validation (v1.1):**
- Invalid types are automatically mapped: `info`/`context`/`note` → `entity_context`
- `task`/`todo` → `action_item`, `commitment` → `promise`
- Unknown types are skipped with warning

**User Identity Handling (v1.1):**
- LLM prompt instructs to use the configured owner name for user identity
- Extract-llm resolves owner/target names through user identity check
- User entity is auto-created if needed (prevents FK constraint errors)

**Cost**: ~$0.01/interaction using Claude 3.5 Haiku

### Query Interface

```bash
# Entity lookup
bun scripts/db/query.ts entity john-smith --detailed
bun scripts/db/query.ts find-entity john@example.com
bun scripts/db/query.ts find-entity @johndoe

# Search
bun scripts/db/query.ts search-entities "john" --type person
bun scripts/db/query.ts search "AI infrastructure" --since 2026-01-01

# Deal attribution
bun scripts/db/query.ts who-shared acme-corp

# Temporal context
bun scripts/db/query.ts what-doing john-smith "3 months ago"
bun scripts/db/query.ts timeline john-smith

# Pending items
bun scripts/db/query.ts pending --owner me --type promise

# Database status
bun scripts/db/query.ts status
bun scripts/db/query.ts status --json
```

### Commands

| Command | Purpose |
|---------|---------|
| `/cyber-reindex` | Full database rebuild |
| `/cyber-reindex --status` | Show database status |
| `/cyber-reindex --extract` | Index + LLM extraction |
| `/cyber-reindex --extract-only` | Run extraction on indexed interactions |

### Freshness Checking

SessionStart hook checks database freshness:
1. Queries `batch_runs` table for last run timestamp
2. If >24 hours old, warns user to run `/cyber-reindex`
3. If database unavailable, shows warning to start PostgreSQL

### Entity Files (Sparse)

Only create entity files when you need to add info not available elsewhere:

```markdown
# Dan Meissler
**Type:** person
**Aliases:** Dan M, Meissler

## Contact
- Email: dan@example.com
- Telegram: @danmeissler

## Notes
[Context about this person]
```

**Location:** `/context/entities/people/` or `/context/entities/orgs/`

### Prerequisites

```bash
# Initialize SQLite database (no external server needed)
bun scripts/db/init.ts

# Reset and reinitialize
bun scripts/db/init.ts --reset

# Check status
bun scripts/db/init.ts --status

# Run indexer
bun scripts/db/index.ts

# Run with LLM extraction
bun scripts/db/index.ts --extract

# Environment variables (.env)
CYBOS_ANTHROPIC_KEY=sk-ant-...  # For LLM extraction
CYBOS_USER_NAME=Your Name      # For identity resolution
CYBOS_USER_OWNER_NAME=YourName # For owner/target labeling
```

**Database location**: `.cybos/cybos.sqlite` (in app root for legacy mode) or `~/CybosVault/private/.cybos/db/cybos.sqlite` (vault mode)

---

## Project System

Projects are multi-week initiatives that need their own context, research, and artifacts. They differ from deals (investment opportunities) and are tracked in both GTD.md and optional `/projects/` folders.

### GTD.md Integration

Projects are `# headings` in GTD.md (not `## headings`). Tasks under a heading belong to that project.

```markdown
# scheduler
- Task 1 for scheduler project
- Task 2 for scheduler project

# context-graph
- Task 1 for context graph
```

**Reserved headings (not projects):** `# Next`, `# Someday`, `# IC`, `# Skip`

### When to Create /projects/ Folder

| Scenario | GTD-only | Create /projects/ |
|----------|----------|-------------------|
| Few tasks, clear scope | Yes | |
| Needs research artifacts | | Yes |
| Multiple collaborators | | Yes |
| External deliverables | | Yes |
| Spans 2+ months | | Yes |
| Has milestones/phases | | Yes |

### Project Folder Structure

```
/projects/<slug>/
└── .cybos/
    └── context.md    # Required: goals, status, collaborators
```

Only `.cybos/context.md` is required. Organize the rest as needed for your project.

### Project Context Template

```markdown
# Project: [Display Name]

**Slug:** [slug matching GTD # heading]
**Status:** [Planning | Active | On Hold | Completed | Archived]
**Type:** [Event | Accelerator | Product | Initiative]
**Started:** YYYY-MM-DD
**Target:** YYYY-MM-DD (optional)
**Lead:** [Person]

## Goal
[One paragraph: what does success look like?]

## Key Results
- [ ] KR1: Measurable outcome

## Collaborators
| Person | Role | Contact |
|--------|------|---------|

## Timeline / Milestones
| Milestone | Target | Status |
|-----------|--------|--------|

## Log
### YYYY-MM-DD
- [What happened]
```

### Projects vs Deals

| Aspect | /deals | /projects |
|--------|--------|-----------|
| **Purpose** | Evaluate external investment | Execute internal initiative |
| **Ownership** | External founders | We own the project |
| **Outcome** | Invest / Pass decision | Deliverable completion |
| **Primary artifacts** | Research, memo | Content, decks, tools |
| **Task source** | Ad-hoc, call follow-ups | GTD.md `# heading` |

Rule: If it's about **deciding to invest in external entity**, it's a deal. Everything else is a project.

### Project Commands

| Command | Purpose |
|---------|---------|
| `/cyber-init-project "Name"` | Create project folder with context template |
| `/cyber-project slug` | Show project status and tasks |
| `/cyber-projects` | List all projects |
| `/cyber-gtd --project slug` | Process tasks for specific project |

### Context Auto-Loading

When user mentions a project:
1. Check if `/projects/<slug>/` exists (try kebab-case conversion)
2. If exists, read `/projects/<slug>/.cybos/context.md`
3. Also check GTD.md for tasks under the `# <slug>` heading
4. Incorporate context into response

---

## Folder Structure

```
project-root/
├── vault -> ~/CybosVault           # Symlink to user data (gitignored, shows private/ and shared/)
├── .mcp.json                       # MCP server configuration (uses ${VAR} for env vars)
├── .claude/
│   ├── settings.json           # Hook wiring, permissions
│   ├── skills/                 # Organized workflows (convention)
│   │   ├── Research/
│   │   │   ├── workflows/
│   │   │   ├── shared/
│   │   │   └── evals/
│   │   ├── Browse/
│   │   │   └── workflows/
│   │   ├── Content/
│   │   │   └── workflows/
│   │   ├── DDMemo/
│   │   │   └── workflows/
│   │   └── GTD/
│   │       ├── SKILL.md
│   │       ├── workflows/
│   │       └── learnings.md
│   ├── agents/                 # Agent profiles for Task tool
│   ├── hooks/
│   │   └── load-context.ts     # SessionStart hook
│   └── commands/               # Slash commands
├── context/                    # Core context files (symlinked from vault)
│   ├── who-am-i.md
│   ├── organization.md
│   ├── investment-philosophy.md
│   ├── style/                  # Writing style guides
│   │   ├── voice-identity.md   # Shared persona, tone
│   │   ├── writing-style-en.md # English (essays, tweets)
│   │   └── writing-style-ru.md # Russian (Telegram)
│   ├── img-styles/             # Image style definitions
│   │   ├── _shared.md          # Common rules for all styles
│   │   ├── cyberpunk.md        # Grounded futurism (Blade Runner)
│   │   ├── mural.md            # Sacred transformation
│   │   └── info.md             # Minimal infographics
│   ├── MEMO_template.md
│   ├── calls/                  # Granola call transcripts
│   │   ├── README.md
│   │   └── MMDD-title-YY/
│   ├── telegram/               # Per-person conversation logs (GramJS)
│   │   ├── README.md
│   │   ├── <person-slug>.md    # Persistent conversation file
│   │   └── <group-slug>.md     # Group chats too
│   ├── emails/                 # Indexed emails for morning brief
│   │   ├── README.md
│   │   ├── .state.json         # Dedup state (messageIds)
│   │   └── YYYY-MM-DD_from-subject/
│   │       ├── metadata.json   # Email metadata + summary
│   │       └── body.md         # Email content
│   └── entities/               # Entity context (indexed in SQLite)
│       ├── README.md
│       ├── people/             # Manual entity files (optional)
│       └── orgs/               # Manual entity files (optional)
├── deals/                      # Deal folders
│   └── <company-slug>/
│       ├── index.md            # DataView frontmatter + full deal context
│       ├── .cybos/
│       │   └── scratchpad/
│       ├── research/
│       │   ├── MMDD-<slug>-YY.md      # Main synthesis
│       │   └── raw/                    # Raw agent/MCP data
│       │       ├── agent-*.md
│       │       └── mcp-*.md
│       └── memo/
├── research/                   # Topic/market/tech research
│   └── <topic-slug>/
│       ├── MMDD-<slug>-YY.md          # Main synthesis
│       └── raw/                        # Raw agent/MCP data
│           ├── agent-*.md
│           └── mcp-*.md
├── projects/                   # Multi-week initiatives
│   ├── README.md
│   └── <project-slug>/
│       └── .cybos/
│           └── context.md             # Goals, status, collaborators
├── content/                    # Generated content
│   ├── posts/              # Telegram posts (RU) + Twitter (EN)
│   ├── tweets/             # Twitter-native threads (EN)
│   ├── essays/
│   ├── images/
│   ├── ideas/              # Browse-discovered topic ideas
│   ├── briefs/             # Morning briefs (MMDD-YY.md)
│   └── work/               # GTD task outputs (MMDD-<slug>.md)
├── config/                     # Configuration files
│   ├── leverage-rules.yaml     # Strategic leverage scoring rules
│   └── launchd/                # macOS scheduling plists (templates)
│       ├── com.cybos.brief-server.plist.example
│       └── com.cybos.morning-brief.plist.example
└── scripts/                    # Utility scripts
    ├── extract-granola.ts
    ├── telegram-gramjs.ts      # GramJS MTProto client for Telegram
    ├── telegram-save-drafts.ts # Save AI drafts to Telegram
    ├── brief-parser.ts         # Markdown → JSON brief parser
    ├── brief-server.ts         # Hono HTTP server (port 3847)
    ├── morning-brief.sh        # Orchestrator script
    ├── install-brief.sh        # Installation script
    ├── web-brief/              # React + Tailwind brief/explorer/unstuck UI
    │   ├── src/
    │   │   ├── App.tsx
    │   │   ├── types.ts
    │   │   └── api.ts
    │   └── dist/               # Production build
    └── db/                     # SQLite database indexer
        ├── schema-sqlite.sql   # SQLite schema with FTS5
        ├── client-sqlite.ts    # SQLite client (bun:sqlite)
        ├── init.ts             # Schema initialization
        ├── index.ts            # Main batch indexer
        ├── extract-llm.ts      # Claude Haiku extraction
        ├── entity-resolver.ts  # TypeScript Levenshtein matching
        ├── query.ts            # Query interface + CLI
        ├── extractors/         # Source-specific parsers
        │   ├── calls.ts
        │   ├── emails.ts
        │   ├── telegram.ts
        │   ├── entities.ts
        │   └── deals.ts
        └── prompts/            # LLM extraction prompts
            ├── types.ts
            ├── call-extraction.ts
            ├── email-extraction.ts
            └── telegram-extraction.ts
```

---

## Environment Variables

```bash
# User Identity (required)
CYBOS_USER_NAME=Your Name
CYBOS_USER_OWNER_NAME=YourName
CYBOS_USER_SLUG=your-name
CYBOS_USER_ALIASES=Me,Your Name

# LLM Extraction (required for /cyber-reindex --extract)
CYBOS_ANTHROPIC_KEY=sk-ant-...

# Web Research (required)
PERPLEXITY_API_KEY=pplx-...
EXA_API_KEY=...
PARALLEL_API_KEY=...

# Extraction (required)
FIRECRAWL_API_KEY=fc-...

# Image Generation (required for content)
GEMINI_API_KEY=...

# Telegram (required for /cyber-telegram)
TELEGRAM_API_ID=...              # Get from https://my.telegram.org/apps
TELEGRAM_API_HASH=...            # Get from https://my.telegram.org/apps

# Documents (optional but recommended)
NOTION_TOKEN=secret_...
```

---

## Hook System

| Hook | Event | Action |
|------|-------|--------|
| `load-context.ts` | SessionStart | Inject identity + deal-loading instructions + database freshness check |

### SessionStart Hook

The hook injects:
- User identity from `context/who-am-i.md`
- Organization context from `context/organization.md`
- Database freshness check (warns if >24 hours stale)
- Deal context auto-loading instructions
- Logging requirement reminder

**Database Freshness Check:**
1. Queries `batch_runs` table via `bun scripts/db/query.ts status --json`
2. If database available and last run >24h, shows warning to run `/cyber-reindex`
3. If database not initialized, shows warning to run `/cyber-reindex`

Configuration in `.claude/settings.json`:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "bun .claude/hooks/load-context.ts"
      }
    ]
  }
}
```

---

## Logging System

**Unified logging location**: `~/CybosVault/private/.cybos/logs/`

All logs are stored in the vault for portability and backup. Path resolved via `scripts/paths.ts:getLogsPath()`.

### Log File Types

| Pattern | Source | Purpose |
|---------|--------|---------|
| `MMDD-YY.md` | Workflows, Claude | Daily activity logs (workflow completions, MCP calls) |
| `morning-brief.log` | morning-brief.sh | Brief generation run logs |
| `reindex.log` | reindex.sh | Database indexing run logs |
| `brief-server.out.log` | LaunchD | Brief server stdout |
| `brief-server.err.log` | LaunchD | Brief server stderr |
| `morning-brief.out.log` | LaunchD | Morning brief daemon stdout |
| `morning-brief.err.log` | LaunchD | Morning brief daemon stderr |
| `reindex.out.log` | LaunchD | Reindex daemon stdout |
| `reindex.err.log` | LaunchD | Reindex daemon stderr |

### Path Resolution

**Shell scripts** source `scripts/get-log-path.sh` which exports `VAULT_LOG_DIR`:
```bash
source "$SCRIPT_DIR/get-log-path.sh"
LOG_FILE="$VAULT_LOG_DIR/my-script.log"
```

**TypeScript scripts** use `scripts/paths.ts`:
```typescript
import { getLogsPath } from './paths'
const logDir = getLogsPath()  // ~/CybosVault/private/.cybos/logs
```

**LaunchD plists** use `__VAULT_LOGS__` placeholder (substituted by `install-brief.sh`).

### Daily Activity Log Format (MMDD-YY.md)

**Workflow completion:**
```markdown
## HH:MM | category | type | subject
- Workflow: workflow-name
- Intensity: Quick | Standard | Deep (for research)
- Duration: Xm Ys
- Output: /path/to/output.md
- Agents: agent1, agent2, agent3 (X/Y success)
- MCPs used: perplexity, exa, exa-contents, parallel-search, etc.
- Confidence: High | Medium | Low (for research)

---
```

**MCP call:**
```markdown
## HH:MM | mcp | [server-name] | [operation]
- Query/URL: [request details]
- Status: Success | Failed
- Error: [if failed]
- Fallback: [if used]
- Duration: Xs
- Cost: $X.XX (estimate)

---
```

**Full logging specification**: `.claude/skills/Research/shared/logging.md`