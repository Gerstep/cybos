# Cybos

CYBernetic Operating System - AI-powered VC operations assistant. Research companies, process Telegram/email, generate content, write investment memos.

## Setup

See `SETUP.md` for full setup and personalization.

```bash
# Install dependencies
curl -fsSL https://bun.sh/install | bash
cp .env.example .env  # Add API keys, DB config, and CYBOS_USER_NAME

# Start database
cd scripts/db && docker compose up -d && cd ../..
bun scripts/db/init.ts
bun scripts/db/index.ts --extract

# Run
claude
```

**First run:** Database indexes entities from `/deals/`, `/context/calls/`, `/context/telegram/`. Run `/cyber-reindex` to rebuild.

Available slash commands:

- `/cyber-research-company "Company Name"` - Company DD research
- `/cyber-research-tech "Technology"` - Technology deep-dive
- `/cyber-research-market "Market"` - Market analysis
- `/cyber-telegram` - Process 1 unread Telegram message (read, draft reply, move to TO ANSWER)
- `/cyber-telegram --count 3` - Process 3 unread Telegram messages
- `/cyber-browse` - Scan Twitter for trending topics (saves to /content/ideas/)
- `/cyber-tweet "Topic"` or `/cyber-tweet @content/ideas/file.md` - Draft tweet (with optional source)
- `/cyber-essay "Topic"` or `/cyber-essay @content/ideas/file.md "expand"` - Write essay (with optional source)
- `/cyber-image "Concept"` - Generate image
- `/cyber-memo "Company"` - Generate investment memo
- `/cyber-init-deal "Company"` - Initialize deal folder
- `/cyber-log` - Show recent activity
- `/cyber-gtd` - Process GTD items autonomously (plan-first by default)
- `/cyber-gtd --count 3` - Process 3 GTD items
- `/cyber-reindex` - Rebuild entity index from deals/calls/entity files/telegram logs
- `/cyber-email --sync` - Sync emails to /context/emails/ (last 3 days)
- `/cyber-calendar` - Show today + tomorrow calendar events
- `/cyber-unstuck` - Interactive focus ritual for breaking distraction loops
- `/cyber-init-project "Name"` - Initialize a project folder
- `/cyber-project <slug>` - Show project status and tasks
- `/cyber-projects` - List all projects with status
- `/cyber-gtd --project <slug>` - Process GTD tasks for specific project

## Architecture

### Core Components

```
CYBOS
├── SKILLS (organized workflows)
│   ├── Research (company, tech, market)
│   ├── Browse (Twitter feed discovery)
│   ├── Telegram (message processing)
│   ├── Content (tweets, essays, images)
│   ├── DDMemo (investment memos)
│   └── GTD (autonomous task execution)
│
├── AGENTS (parallel execution via Task tool)
│   ├── Researchers: company, market, financial, team, tech
│   ├── Content: content-writer, image-prompter
│   ├── Memo: memo-analyst, memo-writer
│   └── Synthesizer: consolidates research
│
├── HOOKS
│   └── SessionStart: load identity & context
│
├── MCP SERVERS (external tools)
│   ├── perplexity, parallel-task, exa (PRIMARY)
│   ├── parallel-search (fallback), playwright
│   ├── claude-in-chrome (browser automation)
│   ├── notion, nano-banana
│
└── CONTEXT (identity, philosophy, brand)
```

### Key Design Principles

- **File-first**: All state is markdown on disk
- **Scaffolding > prompting**: Workflows + tools beat raw prompts
- **Parallel agents**: Multiple Task calls in single response
- **Context auto-loading**: Deal context loads when company mentioned
- **Single-file logging**: One log file per day

## Usage Guide

### Research Workflows

#### Company Research

```bash
# Initialize a new deal
/cyber-init-deal "Acme Corp"

# Research the company
/cyber-research-company "Acme Corp"
```

**What happens:**

- Parallel MCP calls gather data (Parallel AI, Perplexity, Exa)
- 4 parallel agents analyze (company, market, financial, team)
- Synthesizer consolidates with investment lens
- Report saved to `/deals/acme-corp/research/MMDD-<slug>-YY.md`
- Deal context created/updated
- Action logged
- Duration: 4-8 minutes

**Output:**

- Comprehensive research report with investment analysis
- Deal context with status and key facts
- Log entry

#### Technology Research

```bash
/cyber-research-tech "Trusted Execution Environments"
```

**What happens:**

- Deep technical research via MCP tools
- 3 parallel agents (tech, market, financial)
- Synthesis with focus on investment opportunities
- Report saved to `/research/trusted-execution-environments/MMDD-<slug>-YY.md`
- Duration: 5-8 minutes

**Focus areas:** TEEs/privacy, AI agents, robotics data, compute financialization

#### Market Research

```bash
/cyber-research-market "AI Infrastructure"
```

**What happens:**

- Market sizing and dynamics research
- 3 parallel agents analyze market, technology, investment activity
- Report includes TAM, key players, white spaces, timing
- Saved to `/research/ai-infrastructure/MMDD-<slug>-YY.md`
- Duration: 8-12 minutes

### Content Workflows

#### Tweets

```bash
/cyber-tweet "AI agents using crypto wallets"
```

**Workflow:** Draft → Review → Polish

1. **Draft**: Loads `voice-identity.md` + `writing-style-en.md`, creates tweet
2. **Review**: User provides feedback or approves
3. **Polish**: Revise based on feedback
4. **Output**: Save to `/content/tweets/MMDD-<slug>-YY.md`

**Style:** Hook-driven, one idea per tweet, specific claims with evidence

**Duration:** 2-5 minutes

#### Essays

```bash
/cyber-essay "Why compute is becoming a commodity"
```

**Workflow:** Draft → Review → Polish

1. **Draft**: Loads `voice-identity.md` + `writing-style-en.md`, creates essay (500-2500 words)
2. **Review**: User feedback on structure/tone
3. **Polish**: Finalize with revisions
4. **Output**: `/content/essays/MMDD-<slug>-YY.md`

**Structure:** Hook → Stakes → Mechanism → Turn (optional) → Landing (forward momentum)

**Duration:** 15-30 minutes

#### Images

```bash
/cyber-image "Solitary figure in brutalist VC office"
```

**Workflow:** Draft Prompt → Review → Generate

1. **Draft Prompt**: image-prompter creates detailed prompt following Mural of Souls aesthetic
2. **Review**: User approves or adjusts prompt
3. **Generate**: Nano Banana MCP (`mcp__nano-banana__generate_image`) using Gemini 3 Pro Image
4. **Iterate**: Use `continue_editing` for refinements
5. **Output**: `/content/images/MMDD-<slug>-YY.png` (no metadata files)

**Aesthetic:** Mural of Souls - sacred transformation, particle dissolution, monumental scale

**Duration:** 3-7 minutes

#### Source-Driven Content (New Feature)

**The Ideas Folder**: `/content/ideas/` stores raw thoughts, notes, and fragments that can be expanded into polished content.

##### Quick Capture Workflow

```bash
# 1. Save raw idea to /content/ideas/
# Create file: /content/ideas/agent-economy.md
# Content: Bullet points, rough paragraphs, data, quotes - no polish needed

# 2. Expand into essay
/cyber-essay @content/ideas/agent-economy.md "Expand into full essay with examples"

# 3. Or distill into tweet
/cyber-tweet @content/ideas/agent-economy.md "Create tweet from key insight"
```

##### How It Works

**Source Material Pattern**: Commands now support `@`-prefixed file/folder references:

```bash
# Single source
/cyber-essay @content/ideas/tee-compute.md "Expand this"

# Multiple sources (synthesize)
/cyber-essay "TEE market analysis" @content/ideas/tee.md @research/tee-market/

# From research to tweet
/cyber-tweet @deals/acme-corp/research/2025-12-28.md "Distill key insight"

# Thread from folder
/cyber-tweet @research/ai-infrastructure/ "Create thread summarizing findings"
```

**Workflow:**

1. **Capture**: Save rough ideas to `/content/ideas/` (no format required)
2. **Reference**: Use `@path/to/file.md` in `/cyber-essay` or `/cyber-tweet`
3. **Expand**: Agent reads source, extracts insights, expands with structure/examples
4. **Output**: Polished content in `/content/essays/` or `/content/tweets/`

**Benefits:**

- Capture ideas without worrying about polish
- Build library of reusable thoughts
- Synthesize multiple sources into coherent content
- Transform research into public-facing content

See: `/content/ideas/README.md` for detailed guide and `_template.md` for starter template.

### GTD Runner (Autonomous Task Execution)

```bash
# Plan and show what will be done for first GTD item
/cyber-gtd

# Process 3 items
/cyber-gtd --count 3

# Skip plan, execute immediately
/cyber-gtd --execute

# Process specific item
/cyber-gtd "Dan Meissler"

# Rebuild entity index
/cyber-reindex
```

**What happens:**

1. **Parse**: Read `GTD.md`, extract items from `# Next`
2. **Classify**: Match patterns to workflows (outreach, call-prep, podcast, research)
3. **Entity Lookup**: Query database for people/company context
4. **Plan**: Show what will be done for each item
5. **Execute**: Run each task sequentially (one at a time)
6. **Output**: Save to `/content/work/MMDD-<slug>.md` with draft + pending actions

**Workflows:**

| Pattern | Workflow | Action |
|---------|----------|--------|
| "ask for call", "message", "email" | outreach | Draft message, find contact |
| "call with", "meeting", "<> X" | call-prep | Prepare agenda, questions |
| "podcast" | podcast | Research guest, prepare questions |
| company name, "research" | research | Quick research summary |
| unknown | best judgment | Log to learnings.md |

**Entity System:**

Entities (people, companies) are indexed in PostgreSQL database from:
- `/deals/*/` folder names (orgs)
- `/context/calls/` attendees (people with emails)
- `/context/entities/*.md` (manual enrichment with aliases, notes)
- `/context/telegram/*.md` conversation files (people with telegram usernames)

Query entities: `bun scripts/db/query.ts find-entity "<name>"`

Index rebuilt automatically every 24 hours or via `/cyber-reindex`.

**Output Format:**

Each task produces `/content/work/MMDD-<slug>.md` with:
- Context summary (entity info, previous calls)
- Draft content (message, agenda, questions)
- Pending actions (checkboxes for Gmail send, etc.)
- Execution log

**Duration:** 1-5 minutes per task

### DD Memo Generation

```bash
# Prerequisite: Run company research first
/cyber-research-company "Acme Corp"

# Generate investment memo
/cyber-memo "Acme Corp"
```

**What happens:**

1. **Gather**: Load all research from `/deals/acme-corp/research/`
2. **Analyze**: memo-analyst (Opus) applies investment rubric
3. **Write**: memo-writer (Sonnet) fills template
4. **Output**: `/deals/acme-corp/memo/memo.md` (overwrites)
5. **Duration**: 8-15 minutes

**Output**: Comprehensive investment memo with:

- Executive summary & investment thesis
- Scoring sheet (10 categories)
- Product, business model, technology analysis
- Team assessment, financials, projections
- Risks, exit scenarios, IC Q&A
- Clear recommendation (INVEST/PASS/MORE DILIGENCE)

### Project System

Projects are multi-week initiatives that don't fit into `/deals/` (external companies) or single GTD tasks. Examples: organizing events, running accelerator, building internal products.

```bash
# Initialize a new project
/cyber-init-project "Cyber Accelerator Q1"

# View project status
/cyber-project cyber-accelerator-q1

# List all projects
/cyber-projects

# Work on project-specific GTD tasks
/cyber-gtd --project cyber-accelerator-q1
```

**What happens:**

1. **Initialize**: Creates `/projects/cyber-accelerator-q1/.cybos/context.md` from template
2. **GTD Integration**: Add `# cyber-accelerator-q1` heading to GTD.md, tasks underneath belong to project
3. **Auto-loading**: Mention project name → context loaded automatically
4. **Progress tracking**: Context file tracks status, goal, key results, milestones

**GTD.md Integration:**

```markdown
# cyber-accelerator-q1
- [ ] Finalize speaker lineup
- [ ] Create participant application form
- [x] Book venue

# scheduler
- [ ] Implement calendar sync
- [ ] Add recurring event support
```

Projects are identified by `# heading` (level-1). Reserved headings (`# Next`, `# Someday`, `# IC`, `# Skip`) are not projects.

**Project Types:**
- **Event**: Conference, demo day, meetup
- **Accelerator**: Cohort program
- **Product**: Internal tool development
- **Initiative**: Multi-step strategic effort

**Duration:** Initialization takes seconds, projects span weeks/months

## Investment Philosophy

Cybos applies your organization's investment rubric to all research:

### Decision-Making Criteria

| Criteria | Green Flag | Red Flag |
|----------|------------|----------|
| Market Size | Path to $1B+ revenue | Niche $50M ARR cap |
| Moat | Data/network/hard tech | Wrapper (6-week rule) |
| Business Model | Clear revenue model | Token speculation |
| Founders | High energy, sales DNA, deep expertise | Low energy, lab mindset |
| Why Now? | Clear catalyst/unlock | Red ocean, no timing |
| Valuation | Reasonable for stage | >$100M FDV pre-revenue |

### Auto-Pass Triggers

- Can Big Tech build this in 6 weeks?
- Pure "wrapper" with no moat
- Media/entertainment robotics plays
- Regional stablecoins vs global giants
- Generic devtools without massive pain point

### Focus Areas

- **AI Infrastructure**: Training, inference, privacy (TEEs), agents
- **Crypto/Blockchain**: Self-custodial finance, programmable markets, novel consensus
- **Robotics**: Data moats (teleoperation, simulation), embodied AI

## File Structure

```
cybos/
├── .mcp.json                          # MCP server configuration (uses ${VAR} for env vars)
├── .claude/
│   ├── settings.json              # Hook wiring, permissions
│   ├── skills/                    # Organized workflows
│   │   ├── CORE/                  # System overview
│   │   ├── Research/workflows/    # company, tech, market
│   │   ├── Browse/workflows/      # twitter-feed
│   │   ├── Telegram/workflows/    # answer-messages
│   │   ├── Content/workflows/     # tweet, essay, image
│   │   ├── DDMemo/workflows/      # generate
│   │   └── GTD/                   # autonomous task execution
│   │       ├── SKILL.md           # main skill entry point
│   │       ├── workflows/         # outreach, call-prep, podcast, research
│   │       └── learnings.md       # action log
│   ├── agents/                    # 10 agent profiles
│   ├── hooks/
│   │   └── load-context.ts        # SessionStart hook
│   └── commands/                  # 11 slash commands
│
├── .cybos/logs/                # Daily log files (MMDD-YY.md)
│
├── context/                       # Core context
│   ├── who-am-i.md
│   ├── organization.md
│   ├── investment-philosophy.md
│   ├── style/                     # Writing style guides
│   │   ├── voice-identity.md      # Shared persona, tone (all content)
│   │   ├── writing-style-en.md    # English style (essays, tweets)
│   │   └── writing-style-ru.md    # Russian style (Telegram)
│   ├── img-style.md
│   ├── MEMO_template.md           # DD memo template
│   ├── telegram/                  # Per-person conversation logs
│   │   ├── README.md
│   │   └── <person-slug>.md       # Persistent conversation file
│   └── entities/                  # Entity context (indexed in PostgreSQL)
│       ├── README.md              # Usage documentation
│       ├── people/                # Manual entity files (optional)
│       └── orgs/                  # Manual entity files (optional)
│
├── deals/                         # Deal folders
│   └── <company-slug>/
│       ├── .cybos/
│       │   ├── context.md         # Deal metadata, status
│       │   └── scratchpad/        # Agent working files
│       ├── research/              # Research reports
│       └── memo/                  # Investment memo
│
├── research/                      # Topic/market research
│   └── <topic-slug>/
│
├── projects/                      # Multi-week initiatives
│   └── <project-slug>/
│       └── .cybos/
│           └── context.md         # Project context, status, goals
│
├── content/                       # Generated content
│   ├── ideas/                     # Raw ideas, notes (source material)
│   │   ├── README.md              # Usage guide
│   │   └── _template.md           # Idea template
│   ├── tweets/
│   ├── essays/
│   ├── images/
│   └── work/                      # GTD task outputs (MMDD-<slug>.md)
│
├── .env.example                   # API key template
└── .gitignore                     # Excludes sensitive data
```

## MCP Integration

### Tiered Research Strategy

```
1. FAST SEARCH (seconds)
   └─ perplexity search OR exa search
   └─ Good for: quick facts, validation

2. DEEP RESEARCH (1-5 minutes)
   └─ parallel-task createTask → poll getTask
   └─ Good for: comprehensive reports

3. TARGETED EXTRACTION (as needed)
   └─ exa getContents (PRIMARY)
   └─ Fallback: parallel-search web_fetch
   └─ Last resort: firecrawl scrape

4. HARD SCRAPING (last resort)
   └─ playwright for JS-heavy sites
```

### MCP Tool Reference

**Perplexity:**
- `mcp__perplexity__search` - Fast search with citations
- `mcp__perplexity__research` - Deep research (basic/deep)

**Parallel Task:**
- `mcp__parallel-task__createTask` - Start deep research
- `mcp__parallel-task__getTask` - Poll for results

**Exa (PRIMARY for URL content):**
- `mcp__exa__search` - Web search
- `mcp__exa__findSimilar` - Similar pages
- `mcp__exa__getContents` - Extract content from URLs (PRIMARY)
- `mcp__exa__linkedinSearch` - LinkedIn profiles

**Parallel Search (FALLBACK):**
- `mcp__parallel-search__web_search_preview` - Web search fallback
- `mcp__parallel-search__web_fetch` - URL content fallback

**Firecrawl (LAST RESORT ONLY - use when exa and parallel-search fail):**
- `mcp__firecrawl__scrape` - Scrape URL
- `mcp__firecrawl__extract` - Structured extraction

**Nano Banana:**
- `mcp__nano-banana__generate_image` - Generate images (Gemini 3 Pro Image)
- `mcp__nano-banana__edit_image` - Edit existing images
- `mcp__nano-banana__continue_editing` - Iterative refinement

## Agent System
Available Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| company-researcher | Haiku | Company business model, product, traction |
| market-researcher | Haiku | TAM, dynamics, competitive landscape |
| financial-researcher | Haiku | Funding history, metrics, valuation |
| team-researcher | Haiku | Founder backgrounds, assessment |
| tech-researcher | Haiku | Technology deep-dives, moat analysis |
| content-researcher | Haiku | Topic research for content (academic, social, first-principles) |
| investment-researcher | Haiku | Topic research for investment (market dynamics, opportunities) |
| quality-reviewer | Sonnet | Gap analysis, quality assurance (deep mode only) |
| content-writer | Sonnet | Tweets, essays following brand |
| image-prompter | Sonnet | Image prompt generation |
| memo-analyst | Opus | Strategic investment analysis |
| memo-writer | Sonnet | Memo generation from template |
| synthesizer | Sonnet | Consolidate parallel research |

**Research agent selection**: Agents are selected dynamically based on research type (Company, Tech, Market, Topic) and intensity (Quick, Standard, Deep). See `.claude/skills/Research/shared/agent-selection-matrix.md` for the complete selection matrix.

### Parallel Execution

To run agents in parallel, issue multiple Task calls in the same response:

- Task 1: company-researcher
- Task 2: market-researcher
- Task 3: financial-researcher
- Task 4: team-researcher

Claude Code executes these simultaneously for maximum speed.

## Logging System

All workflows log to `/.cybos/logs/MMDD-<slug>-YY.md` (single file per day).

**Format:**

```markdown
## HH:MM | category | type | subject
- Workflow: name
- Duration: Xm Ys
- Output: /path/to/output.md
- Agents: (if used)
- Sources: (if used)

---
```

**View logs:**

```bash
/cyber-log           # Today's activity
/cyber-log week      # Last 7 days
/cyber-log 2025-12-19   # Specific date
```

## Troubleshooting

### Hook Not Loading

**Symptom:** Context not injected at session start

**Solution:**

```bash
# Verify hook is executable
chmod +x .claude/hooks/load-context.ts

# Test hook manually
bun .claude/hooks/load-context.ts < /dev/null
```

### MCP Server Not Found

**Symptom:** `mcp__[server]__[tool]` is not available

**Solution:**

- Check API key in `.env`
- Verify `.mcp.json` configuration (uses `${VAR}` syntax for env vars)
- Test MCP server independently:

```bash
npx -y @perplexity-ai/mcp-server --help
```

### Agent Times Out

**Symptom:** Task agent doesn't complete

**Solution:**

- Reduce scope of agent task
- Use Haiku for simpler tasks (faster)
- Opus is slower but provides strategic depth

### Research Returns Limited Data

**Symptom:** Research report is sparse

**Solution:**

- Run research workflow again (MCP services may have been slow)
- Try different MCP tools (Exa vs Perplexity)
- Check API quotas/limits

### Image Generation Fails

**Symptom:** Nano Banana returns error

**Solution:**

- Check `GEMINI_API_KEY` is set in environment
- Simplify prompt if safety checker triggered
- Use `continue_editing` to iterate on partial results

## Best Practices

### 1. Research Before Memo

Always run company research before generating a memo:

```bash
/cyber-research-company "Company"
# Wait for completion
/cyber-memo "Company"
```

### 2. Use Parallel Agents

Workflows automatically use parallel agents for speed. Don't try to serialize them.

### 3. Iterative Content

Content workflows expect iteration. Provide specific feedback:

- "Good" or "ship it" = approved
- "More technical" = adjust tone
- "Different hook" = revise opening

### 4. Update Deal Context

When new information emerges, update `/deals/<company>/.cybos/context.md` manually and regenerate memo.

### 5. Monitor Logs

Check `/cyber-log` regularly to track what's been done and what's pending.

### 6. Use Ideas Folder

Capture rough thoughts in `/content/ideas/` and expand later:

```bash
# Quick capture
echo "# Agent economy\n\n- AI agents need wallets\n- Crypto enables M2M payments" > content/ideas/agent-econ.md

# Expand when ready
/cyber-essay @content/ideas/agent-econ.md "Full essay with examples"
```

### 7. Version Control

Commit regularly, especially after research completion:

```bash
git add .
git commit -m "Research: Acme Corp"
```

## Development

### Adding a New Workflow

1. Create workflow file: `.claude/skills/<Skill>/workflows/<workflow>.md`
2. Create slash command: `.claude/commands/cyber-<command>.md`
3. Reference workflow with `@.claude/skills/...` in command
4. Test with `/cyber-<command>`

### Adding a New Agent

1. Create agent profile: `.claude/agents/<agent-name>.md`
2. Define purpose, output format, guidelines
3. Reference in workflow as `Task: <agent-name>`

### Modifying Investment Rubric

Edit `context/investment-philosophy.md` - all workflows automatically apply updated criteria.

### Customizing Brand Voice

Content follows a layered style system:

1. **Shared persona**: `context/style/voice-identity.md` - archetype, tone, anti-patterns (all languages)
2. **English style**: `context/style/writing-style-en.md` - essay/tweet structure, rhythm, banned words
3. **Russian style**: `context/style/writing-style-ru.md` - Telegram posts, Russian-English mix

Edit the appropriate file based on what you want to change. The content-writer agent and all workflows reference these files.

### Updating Visual Aesthetic

Edit `context/img-style.md` - image-prompter agent uses this aesthetic system.

## Roadmap

### MVP (Current)

- [x] Research workflows (company, tech, market)
- [x] Content generation (tweets, essays, images)
- [x] DD memo generation
- [x] Slash command interface
- [x] Logging system
- [x] MCP integration

### Future Enhancements

- [ ] CLI wrapper (Bun/TypeScript) for headless execution
- [ ] Scheduled automation (cron jobs)
- [ ] Voice notifications (ElevenLabs)
- [ ] Call prep skill (meeting briefings)
- [ ] Portfolio monitoring (ongoing tracking)
- [ ] Team collaboration features

## License

MIT License with Attribution Requirement

Copyright (c) 2026 Cybos Contributors
