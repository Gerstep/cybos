## What is Cybos

Cybos (Cybernetic Operating System) is a personal AI assistant and a venture capital operations aid. Handles research (company DD, tech deep-dives, market analysis), Telegram message management, content (tweets, essays, images), and DD memo generation.

## Personalization (Required)

Update these before using Cybos for your own setup:

- `context/who-am-i.md` - your identity
- `context/organization.md` - your organization context
- `.env` user identity settings: `CYBOS_USER_NAME`, `CYBOS_USER_OWNER_NAME`, `CYBOS_USER_SLUG`, `CYBOS_USER_ALIASES`

## Load the following info at all times when working on user tasks

`context/organization.md` - organization context for professional work
`context/who-am-i.md` - information about myself

---

## Design Principles

1. **File-first with database indexing**: Source data is markdown on disk, indexed into PostgreSQL for fast queries. External data via MCP tools (Gmail, Telegram, Granola, etc)
2. **Scaffolding > prompting**: Workflows + tools beat raw prompts
3. **Slash commands**: All interaction via `/cyber-*` commands
4. **Logging**: Single-file logging after every workflow
5. **Context auto-loading**: Deal context loads automatically when mentioned

## Agent System

Agents are spawned via Claude Code's `Task` tool. Multiple Task calls in the same response enable parallel execution.

**Available agents:**
- **Research**: company-researcher, market-researcher, financial-researcher, team-researcher, tech-researcher, content-researcher, investment-researcher
- **Quality**: quality-reviewer (deep research only)
- **Content**: content-writer, image-prompter
- **Memo**: memo-analyst, memo-writer
- **Synthesis**: synthesizer

**Research agent selection**: Dynamic based on research type and intensity (see `.claude/skills/Research/shared/agent-selection-matrix.md`)

## MCP Integrations

Cybos uses these MCP servers with the following priority hierarchy:

**Primary:**
- **exa**: Web search, company research, URL content extraction (PRIMARY for research)
- **perplexity**: Fast search + deep research
- **parallel-task**: Deep research tasks
- **parallel-search**: Web search + content fetch
- **nano-banana**: Image generation (Gemini 3.0 Pro Image)

**Fallback:**
- **firecrawl**: Scraping and extraction (last resort only)

**Other:**
- **playwright**: Browser automation
- **notion**: Document storage
- **gmail**: Email management for VC deal flow
- **calendar**: Google Calendar for meeting schedules

## Skills Organization

Skills are loaded via:
- `@file` references in slash commands
- Explicit file reads during workflows
- Hook injection (for core identity only)

**Skill categories:**
- **Research**: Universal orchestrator workflow (handles all research types)
- **Content**: Tweet, essay, and image generation workflows
- **DDMemo**: Investment memo generation workflow

---

## Key Behaviors

### Workflow Files

**CRITICAL**: When user makes a request, identify the matching workflow and READ IT FIRST before taking any action.

**Workflow Mapping** (what user asks → which workflow to read):

| User Request | Read This Workflow First |
|--------------|--------------------------|
| "Write telegram post", "create russian post" | `.claude/skills/Content/workflows/telegram-post.md` |
| "Read telegram", "reply to telegram", "process messages" | `.claude/commands/cyber-telegram.md` |
| "Generate image", "create image", "make image" | `.claude/skills/Content/workflows/image.md` |
| "Write tweet", "draft tweet", "create tweet" | `.claude/skills/Content/workflows/tweet.md` |
| "Write essay", "create essay", "draft essay" | `.claude/skills/Content/workflows/essay.md` |
| "Browse twitter", "scan twitter", "trending topics" | `.claude/skills/Browse/workflows/twitter-feed.md` |
| "Research company", "company DD", "due diligence" | Use `/cyber-research-company` command |
| "Research tech", "technology analysis", "tech deep-dive" | Use `/cyber-research-tech` command |
| "Research market", "market analysis", "sector analysis" | Use `/cyber-research-market` command |
| "Generate memo", "investment memo", "write memo" | Use `/cyber-memo` command |
| "Schedule tweet", "post to twitter", "publish to linkedin", "schedule to typefully" | `.claude/commands/cyber-schedule.md` |
| "Work on GTD", "process GTD", "do my tasks" | `.claude/commands/cyber-gtd.md` |
| "Rebuild index", "reindex entities" | `.claude/commands/cyber-reindex.md` |
| "Sync emails", "index emails", "morning brief emails" | `.claude/commands/cyber-email.md` (use `--sync` flag) |
| "Calendar", "my meetings", "what's on my calendar" | `.claude/commands/cyber-calendar.md` |
| "Morning brief", "daily brief", "generate brief" | `.claude/commands/cyber-brief.md` |
| "Unstuck", "feeling stuck", "can't focus", "distracted" | `.claude/commands/cyber-unstuck.md` |
| "Project status", "work on project X", "show project" | `.claude/commands/cyber-project.md` |
| "Create project", "init project", "new project" | `.claude/commands/cyber-init-project.md` |
| "List projects", "all projects", "my projects" | `.claude/commands/cyber-projects.md` |

**Execution Rules:**

1. **Identify the request type** from user's natural language
2. **Read the workflow file** from the table above BEFORE doing anything
3. **Follow it exactly** - don't improvise or skip steps
4. **Check for @references** in the workflow (e.g., `@context/style/voice-identity.md`, `@context/style/writing-style-en.md`)
5. **Read all referenced files** before proceeding

**Example Flow:**
- User: "Write me a telegram post about AI"
- You: Read `.claude/skills/Content/workflows/telegram-post.md` first
- Workflow says: "Load before drafting: `context/style/voice-identity.md`, `context/style/writing-style-ru.md`"
- You: Read both files
- Workflow says: "If user requests image, use `@.claude/skills/Content/workflows/image.md`"
- You: Follow that workflow completely, don't create custom prompts

**If workflow not found**: Ask user to clarify or use best judgment, but always prefer using existing workflows over improvising.

### Deal Context Auto-Loading

When user mentions a company name:
1. Check if `/deals/<company-slug>/` exists (use kebab-case: "Acme Corp" → `acme-corp`)
2. Check `/deals/<company-slug>/research/` for latest research
3. Incorporate this context into your response

### Granola Call Auto-Search

When user mentions a person or company name:
1. Read `/context/calls/INDEX.md`
2. Find calls matching that name
3. Load relevant transcripts and notes as context
4. Use them in response (e.g., "Prepare for call with John" → finds previous John calls)

### Logging Requirement

After completing ANY workflow (research, content, memo), append a log entry to `/.cybos/logs/MMDD-YY.md`:

```markdown
## HH:MM | category | type | subject
- Workflow: name
- Duration: Xm Ys
- Output: /path/to/output.md
- Agents: (if used)
- Sources: (if used)

---
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `/cyber-research-company "Name"` | Company DD research |
| `/cyber-research-tech "Topic"` | Technology deep-dive |
| `/cyber-research-market "Sector"` | Market analysis |
| `/cyber-research-topic "Topic"` | Topic exploration for content |
| `/cyber-telegram` | Process 1 unread Telegram conversation (GramJS MTProto) |
| `/cyber-telegram --count 3` | Process 3 unread conversations |
| `/cyber-telegram --dry-run` | Read only, don't save drafts to Telegram |
| `/cyber-browse` | Scan Twitter for trending topics (default: twitter) |
| `/cyber-tweet "Topic"` | Draft tweet |
| `/cyber-essay "Topic"` | Write essay |
| `/cyber-image "Concept"` | Generate image |
| `/cyber-memo "Company"` | Generate DD memo |
| `/cyber-init-deal "Company"` | Initialize deal folder |
| `/cyber-save-calls` | Extract Granola calls |
| `/cyber-log` | Show recent activity |
| `/cyber-schedule @file.md` | Schedule content to Twitter/LinkedIn via Typefully |
| `/cyber-gtd` | Process GTD items autonomously (plan-first by default) |
| `/cyber-gtd --count 3` | Process 3 GTD items |
| `/cyber-gtd --execute` | Skip plan, run immediately |
| `/cyber-reindex` | Rebuild PostgreSQL database from all sources |
| `/cyber-reindex --status` | Show database status (entities, interactions, last run) |
| `/cyber-reindex --extract` | Index + run LLM extraction for promises/actions |
| `/cyber-reindex --extract-only` | Run extraction on already-indexed interactions |
| `/cyber-email --sync` | Sync emails to /context/emails/ (last 3 days, unread + important) |
| `/cyber-email --sync --days 7` | Sync emails for last 7 days |
| `/cyber-calendar` | Show today + tomorrow calendar events |
| `/cyber-calendar --days 3` | Show next 3 days of events |
| `/cyber-brief` | Generate morning brief (Telegram + Email + Calendar + GTD) |
| `/cyber-brief --email-days 7` | Include 7 days of emails (default: 3) |
| `/cyber-unstuck` | Interactive focus ritual for breaking distraction loops |
| `/cyber-init-project "Name"` | Initialize project folder with context template |
| `/cyber-project slug` | Show project status and tasks |
| `/cyber-projects` | List all projects |
| `/cyber-gtd --project slug` | Process GTD tasks for specific project only |

**Research flags**: `--quick`, `--standard`, `--deep` control intensity/speed tradeoff.

**Web Brief URLs** (after running `/cyber-brief`):
- Web UI: http://localhost:3847
- Today's brief: http://localhost:3847?day=today
- Yesterday's brief: http://localhost:3847?day=yesterday

**Source references**: Content commands support `@path/to/file.md` to use source material.

---

## Research Architecture

All research commands (`/cyber-research-company`, `/cyber-research-tech`, `/cyber-research-market`, `/cyber-research-topic`) use the **universal orchestrator** workflow:

### Research Orchestrator Flow

1. **INITIALIZE**: Identify type & intensity → create workspace → select agents
2. **GATHER**: Spawn agents in parallel (agents do autonomous MCP calls)
3. **REVIEW**: Quality check (deep mode only) → follow-ups if needed (max 1 iteration)
4. **SYNTHESIZE**: Consolidate all agent outputs with appropriate lens
5. **OUTPUT**: Save to workspace + log

### Workspace Structure

All research creates timestamped workspace with raw agent outputs:

```
/deals/<company>/research/MMDD-<slug>-YY/     # Company research
    ├── raw/                                   # Agent outputs
    │   ├── agent-company-researcher.md
    │   ├── agent-market-researcher.md
    │   └── agent-quality-reviewer.md (deep only)
    └── report.md                              # Final synthesis

/research/<topic>/MMDD-<slug>-YY/             # Topic/tech/market research
    ├── raw/                                   # Agent outputs
    └── report.md                              # Final synthesis
```

### Agent Selection

Agents are selected **dynamically** based on:
- **Research type**: Company DD, Technology, Market, Topic-Content, Topic-Investment
- **Intensity level**: Quick (1 agent), Standard (2-3 agents), Deep (3-5 agents + quality-reviewer)

See `.claude/skills/Research/shared/agent-selection-matrix.md` for full matrix.

### Key Principles

- **Agents do ALL data gathering**: Main session orchestrates, agents make MCP calls autonomously
- **No redundancy**: Each agent makes its own calls, no pre-gathering by main session
- **Parallel execution**: Multiple agents run simultaneously
- **Quality loop**: Deep mode includes quality-reviewer → identifies gaps → re-spawns agents with refined questions (max 1 iteration)

---

## Naming & Locations

**Folder names**: kebab-case (`"Acme Corp"` → `acme-corp`)

**File patterns**:
- Research: `MMDD-<slug>-YY.md`
- Content: `MMDD-<slug>-YY.md` (or `.png` for images)
- Logs: `MMDD-YY.md`

**Output locations**:
| Type | Location |
|------|----------|
| Company research | `/deals/<company>/research/` |
| Topic/market research | `/research/<topic>/` |
| Browse/topic discovery | `/content/ideas/` |
| Tweets | `/content/tweets/` |
| Essays | `/content/essays/` |
| Images | `/content/images/` |
| Memos | `/deals/<company>/memo/` |
| GTD task outputs | `/content/work/` |
| Telegram replies | `/content/work/` |
| Telegram per-person logs | `/context/telegram/<person-slug>.md` |
| Indexed emails | `/context/emails/` |
| Morning briefs | `/content/briefs/` |
| Entity context | `/context/entities/` |

---

## Architecture Reference

ONLY LOAD `docs/ARCHITECTURE.md` WHEN UPDATING THE APPLICATION. DON'T LOAD IT FOR NORMAL APPLICATION USE CASES.

When exploring the codebase or planning changes, read `docs/ARCHITECTURE.md` for:
- System architecture and components
- Agent definitions and parallel execution
- MCP integrations and tool patterns
- Skill system and workflow details
- Full folder structure

## Changing the Application
- Save all plans in `/docs` directory in this project!
- After making any important changes ALWAYS update `docs/ARCHITECTURE.md` to reflect them (major feature, app structure, changing logic), but skip for minor fixes or when running workflows
- Always keep CLAUDE.md, docs/ARCHITECTURE.md, and README.md updated when making important changes in the application logic
