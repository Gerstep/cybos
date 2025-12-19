# Cybos — Design Specification v1.1

*A Claude Code-powered personal AI assistant for venture capital operations*

---

## 1. Executive Summary

**Cybos** is an AI-powered personal assistant built on Claude Code infrastructure, designed to automate and augment the workflow of a venture investor. It handles three core domains:

| Domain | Capability |
|--------|------------|
| **Research** | Company DD, technology deep-dives, market analysis |
| **Content** | Tweets, essays, images (following brand guidelines) |
| **DD Memo** | Investment memo generation from templates |

**Key Design Principles:**
- File-first: All state is markdown on disk
- Scaffolding > prompting: Workflows + tools beat raw prompts
- Slash commands for MVP (CLI wrapper planned for future)
- Concise single-file logging after every workflow
- Single-user, no scheduled automation (MVP)

---

## 2. Architecture Overview

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
│ Content       │   │ Writers       │   │               │
│ DDMemo        │   │ Analysts      │   │               │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    CONTEXT LAYER                        │
│  /context/*  (identity, philosophy, brand, style)       │
│  /deals/*    (per-company research + memos)             │
│  /research/* (topic/market research)                    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  MCP SERVERS  │   │     LOGS      │   │    OUTPUTS    │
│ Perplexity    │   │ /.cybos/   │   │ /deals/       │
│ Exa / Parallel│   │ logs/         │   │ /research/    │
│ Firecrawl     │   │               │   │ /content/     │
│ Playwright    │   │               │   │               │
│ Notion/GDrive │   │               │   │               │
│ fal.ai (img)  │   │               │   │               │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Architecture Notes

**Skills are a convention, not a Claude Code feature.** The `.claude/skills/` directory is an organizational pattern. Skill files are markdown documents that get loaded via:
- `@file` references in slash commands
- Explicit file reads during workflows
- Hook injection (for core identity only)

Claude Code doesn't have a native "skill loader" — we create this behavior through structured commands and workflows.

---

## 3. Context System

### 3.1 Context Loading Strategy

| Context Type | Loading Method | When |
|--------------|----------------|------|
| **Identity** | SessionStart hook | Every session |
| **Workflows** | `@file` in slash commands | Per-command |
| **Deal-specific** | Auto-pulled when deal mentioned | On-demand |

### 3.2 Core Context (SessionStart Hook)

Minimal identity context injected at session start:

```typescript
// .claude/hooks/load-context.ts
// Injects small, always-needed context only

<system-reminder>
## Identity
${readFile('context/who-am-i.md')}

## Fund Context
${readFile('context/organization.md')}

## Deal Context Loading
When the user mentions a company name that matches a folder in /deals/,
automatically load the deal context:
1. Check if /deals/<company>/.cybos/context.md exists
2. If yes, read and incorporate it into your response
3. Also check /deals/<company>/research/ for latest research
</system-reminder>
```

### 3.3 Deal Context (Auto-Loaded)

When user mentions a deal, Claude should automatically pull context:

```
/deals/<company>/
├── .cybos/
│   ├── context.md        # Deal metadata, status, key contacts
│   └── scratchpad/       # Temp agent working files
├── research/
│   └── MMDD-<slug>-YY.md     # Research reports (load latest)
└── memo/
    └── memo.md           # Current memo
```

**Deal context.md template:**
```markdown
# Deal: [Company Name]

**Status:** [Sourced | Researching | DD | IC | Passed | Invested]
**Stage:** [Pre-seed | Seed | Series A | ...]
**First Contact:** MMDD-YY
**Lead:** [Partner name]

## Key Contacts
- Founder: [Name] ([email])
- [Other contacts]

## Quick Facts
- Raising: $X at $Y valuation
- Sector: [AI Infra | Crypto | Robotics | ...]
- Thesis fit: [Notes on how this fits organization focus]

## Open Questions
- [Question 1]
- [Question 2]

## Notes
[Running notes from calls, research, etc.]
```

### 3.4 Research Context

```
/research/<topic>/
├── .cybos/context.md  # Topic metadata
├── MMDD-<slug>-YY.md         # Research reports
└── sources/              # Saved source materials
```

---

## 4. Skills

**Note:** Skills are an organizational convention. Each skill is a collection of:
- `SKILL.md` — routing and capability description
- `workflows/*.md` — step-by-step procedures
- Related agent profiles

Skills are loaded via `@file` references in slash commands.

### 4.1 Research Skill

**Location:** `.claude/skills/Research/`

**Triggers:** "research company", "research technology", "research market"

#### Modes

| Command | Target | Agents | Duration |
|---------|--------|--------|----------|
| `/cyber-research-company <name>` | Single company DD | 4 parallel | 5-8 min |
| `/cyber-research-tech <topic>` | Technology deep-dive | 3 parallel | 5-8 min |
| `/cyber-research-market <sector>` | Market analysis | 3 parallel | 8-12 min |

#### Company Research Workflow

```
1. GATHER (parallel MCP calls)
   ├─ mcp__parallel-task__createTask: "Deep research on [company]"
   │   └─ Poll mcp__parallel-task__getTask until complete
   ├─ mcp__perplexity__search: "[company] funding history investors"
   ├─ mcp__exa__search: "[company]" + mcp__exa__getContents
   └─ mcp__firecrawl__scrape: company website (if needed)

2. ANALYZE (4x parallel Task calls to Claude agents)
   ├─ Task: company-researcher → Business model, product, traction
   ├─ Task: market-researcher → TAM, dynamics, timing
   ├─ Task: financial-researcher → Funding, metrics, comparables
   └─ Task: team-researcher → Founders, key hires, track record

3. SYNTHESIZE (Sonnet)
   └─ Consolidated report with investment thesis
   └─ Apply investment-philosophy.md rubric

4. OUTPUT
   └─ /deals/<company>/research/MMDD-<slug>-YY.md
   └─ Create /deals/<company>/.cybos/context.md if not exists
   └─ Log to /.cybos/logs/MMDD-<slug>-YY.md
```

#### Technology Research Workflow

```
1. GATHER (parallel MCP calls)
   ├─ mcp__parallel-task__createTask: "Deep research on [technology]"
   │   └─ Poll mcp__parallel-task__getTask until complete
   ├─ mcp__perplexity__research: "[technology] technical overview"
   ├─ mcp__exa__search: "[technology] papers implementations"
   └─ mcp__firecrawl__scrape: specific technical docs (if needed)

2. ANALYZE (3x parallel Task calls to Claude agents)
   ├─ Task: tech-researcher → How it works, maturity, limitations
   ├─ Task: market-researcher → Who's building, adoption curve
   └─ Task: financial-researcher → Investment opportunities, risks, timing

3. SYNTHESIZE (Sonnet)

4. OUTPUT → /research/<tech>/MMDD-<slug>-YY.md
```

#### Market Research Workflow

```
1. GATHER (parallel MCP calls)
   ├─ mcp__parallel-task__createTask: "Market analysis: [sector]"
   │   └─ Poll mcp__parallel-task__getTask until complete
   ├─ mcp__perplexity__search: "[sector] market size TAM trends"
   ├─ mcp__exa__search: "[sector] startups companies"
   └─ mcp__exa__findSimilar: top companies in sector

2. ANALYZE (3x parallel Task calls to Claude agents)
   ├─ Task: market-researcher → Key players, positioning
   ├─ Task: tech-researcher → Growth drivers, headwinds
   └─ Task: financial-researcher → Gaps, timing, thesis fit

3. SYNTHESIZE (Sonnet)

4. OUTPUT → /research/<market>/MMDD-<slug>-YY.md
```

#### Output Template (Consolidated Report)

```markdown
# Research: [Subject]
**Type:** Company | Technology | Market
**Date:** MMDD-YY
**Sources:** Parallel AI, Perplexity

## Executive Summary
[2-3 paragraphs]

## Key Findings
### [Section 1]
### [Section 2]
### [Section 3]

## Investment Lens
**Thesis fit:** [How this relates to organization focus]
**Risks:** [Key concerns]
**Opportunities:** [Why this matters]

## Sources
- [Source 1]
- [Source 2]
```

---

### 4.2 Content Skill

**Location:** `.claude/skills/Content/`

**Triggers:** "write tweet", "write essay", "generate image"

#### Workflow: Draft → Review → Polish

All content follows 3-step interactive flow:

```
1. DRAFT (Sonnet with content-strategy.md)
   └─ Generate initial draft

2. REVIEW (User)
   └─ User provides feedback or approves

3. POLISH (Sonnet)
   └─ Apply feedback, finalize
   └─ Output to /content/
   └─ Log to /.cybos/logs/MMDD-<slug>-YY.md
```

#### Tweet Workflow

```
/cyber-tweet "AI agents using crypto wallets"

1. DRAFT
   └─ Load @context/content-strategy.md
   └─ Sonnet generates tweet (≤280 chars)
   └─ Applies: concise, research-first, no hype
   └─ Shows draft to user

2. REVIEW
   └─ User: "make it more technical" or "good"

3. POLISH
   └─ Final version
   └─ Output: /content/tweets/MMDD-<slug>-YY.md
```

#### Essay Workflow

```
/cyber-essay "Why compute is becoming a commodity"

1. DRAFT
   └─ Load @context/content-strategy.md
   └─ Sonnet generates outline
   └─ Opus writes full draft (cessay style)
   └─ Shows draft to user

2. REVIEW
   └─ User provides structural/tone feedback

3. POLISH
   └─ Sonnet applies edits
   └─ Output: /content/essays/MMDD-<slug>-YY.md
```

#### Image Workflow

```
/cyber-image "Solitary figure in brutalist VC office"

1. DRAFT
   └─ Load @context/img-style.md
   └─ Sonnet generates prompt (using Modern Cyberpunk style guide)
   └─ Shows prompt to user

2. REVIEW
   └─ User adjusts prompt or approves

3. GENERATE
   └─ mcp__fal__generateImage with model "flux-pro" or "flux-dev"
   └─ Download and save to: /content/images/MMDD-<slug>-YY.png
```

---

### 4.3 DDMemo Skill

**Location:** `.claude/skills/DDMemo/`

**Triggers:** "create memo", "write memo", "generate dd memo"

#### Workflow

```
/cyber-memo "Acme Corp"

1. GATHER
   └─ Load: /deals/acme-corp/research/* (all research)
   └─ Load: /deals/acme-corp/.cybos/context.md
   └─ Load: @context/investment-philosophy.md
   └─ Load: @context/MEMO_template.md

2. ANALYZE (Opus - deep strategic thinking)
   └─ Deep strategic analysis
   └─ Apply investment rubric
   └─ Score across categories

3. WRITE (Sonnet)
   └─ Fill MEMO_template.md structure
   └─ Generate all sections

4. REVIEW (Sonnet)
   └─ Check completeness
   └─ Verify consistency

5. OUTPUT
   └─ /deals/acme-corp/memo/memo.md
   └─ (Overwrites previous version)
   └─ Log to /.cybos/logs/MMDD-<slug>-YY.md
```

#### Memo Template Integration

Uses `context/MEMO_template.md` structure:
- Executive summary + Investment thesis
- Scoring sheet (Team, Product, Business model, Market, Competition, Financials, Potential return)
- Risks with mitigations
- Product, Business model, Technology sections
- Traction, Competition, GTM
- Team (Founders, Staff)
- Financials, Projections
- Investment overview, Cap table, Exit analysis
- Tokenomics (if applicable)

---

## 5. Agent System

Agents are spawned via Claude Code's `Task` tool. Multiple Task calls in the same response enable parallel execution.

### Agent Definitions

| Agent | Model | Purpose |
|-------|-------|---------|
| `company-researcher` | Haiku | Company-specific data gathering |
| `market-researcher` | Haiku | Market dynamics, TAM, trends |
| `financial-researcher` | Haiku | Funding, metrics, comparables |
| `team-researcher` | Haiku | Founder backgrounds, team assessment |
| `tech-researcher` | Haiku | Technology deep-dives |
| `content-writer` | Sonnet | Tweets, essays, drafts |
| `image-prompter` | Sonnet | Image prompt generation |
| `memo-analyst` | Opus | Strategic investment analysis |
| `memo-writer` | Sonnet | Memo generation from template |
| `synthesizer` | Sonnet | Consolidate parallel agent outputs |

### Agent Profile Format

```yaml
# .claude/agents/company-researcher.md
---
name: company-researcher
model: haiku
permissions:
  allow:
    - WebFetch
    - Read
    - mcp__*
---

# Company Researcher Agent

You are a company research specialist for the organization.

## Your Task
Gather comprehensive information about a target company:
- Business model and value proposition
- Product/service offerings
- Traction and growth metrics
- Recent news and developments

## Output Format
Provide structured findings in markdown with clear sections.

## Context
You are supporting due diligence for a VC fund focused on:
- AI infrastructure
- Crypto/blockchain
- Robotics

Focus on facts. Flag uncertainties. Cite sources.
```

### Parallel Execution Pattern

To run agents in parallel, issue multiple Task calls in the same response:

```
I'll now gather research from multiple angles simultaneously.

[Task: company-researcher] Research Acme Corp business model and product
[Task: market-researcher] Research Acme Corp's market and TAM
[Task: financial-researcher] Research Acme Corp funding and financials
[Task: team-researcher] Research Acme Corp founders and team
```

Claude Code will execute these Task calls, and results can be synthesized after all complete.

### Agent File Structure

```
.claude/agents/
├── company-researcher.md
├── market-researcher.md
├── financial-researcher.md
├── team-researcher.md
├── tech-researcher.md
├── content-writer.md
├── image-prompter.md
├── memo-analyst.md
├── memo-writer.md
└── synthesizer.md
```

---

## 6. Logging System

### Design: Single Daily Log File

All actions logged to one file per day for simplicity.

```
/.cybos/logs/
└── MMDD-<slug>-YY.md
```

### Log Entry Format

```markdown
# Cybos Log: 2025-12-19

## 14:32 | research | company | Acme Corp
- Workflow: company-research
- Duration: 4m 23s
- Output: /deals/acme-corp/research/2025-12-19.md
- Agents: company-researcher, market-researcher, financial-researcher, team-researcher
- Sources: Parallel AI (deep), Perplexity (3 queries)

---

## 14:45 | content | tweet | AI agents
- Workflow: tweet
- Status: draft
- Feedback: "more technical"

---

## 14:47 | content | tweet | AI agents
- Workflow: tweet
- Status: complete
- Output: /content/tweets/2025-12-19-ai-agents.md

---

## 15:30 | memo | dd-memo | Acme Corp
- Workflow: dd-memo
- Duration: 8m 12s
- Output: /deals/acme-corp/memo/memo.md
- Agents: memo-analyst, memo-writer
```

### Logging Implementation

Log at workflow completion (not every tool use):

```typescript
// At end of each workflow, append to log:
const logEntry = `
## ${time} | ${category} | ${type} | ${subject}
- Workflow: ${workflow}
- Duration: ${duration}
- Output: ${outputPath}
${agents ? `- Agents: ${agents.join(', ')}` : ''}
${sources ? `- Sources: ${sources}` : ''}

---
`;

appendToFile(`/.cybos/logs/${today}.md`, logEntry);
```

---

## 7. Command Interface

### MVP: Slash Commands Only

For MVP, all interaction is via Claude Code slash commands. 

**Future:** A full Bun/TypeScript CLI wrapper will be implemented to enable headless execution and scripting (see §13 Future Enhancements).

### Slash Commands

```
.claude/commands/
├── cyber-research-company.md
├── cyber-research-tech.md
├── cyber-research-market.md
├── cyber-tweet.md
├── cyber-essay.md
├── cyber-image.md
├── cyber-memo.md
├── cyber-log.md
└── cyber-init-deal.md
```

### Command Definitions

#### /cyber-research-company

```markdown
<!-- .claude/commands/cyber-research-company.md -->
Research a company for investment due diligence.

Load workflow:
@.claude/skills/Research/workflows/company.md

Load investment context:
@context/investment-philosophy.md

Company to research: $ARGUMENTS

Execute the company research workflow. Use parallel Task calls for the 4 research agents. Synthesize findings into a consolidated report. Save to /deals/<company>/research/MMDD-<slug>-YY.md and log the action.
```

#### /cyber-research-tech

```markdown
<!-- .claude/commands/cyber-research-tech.md -->
Deep-dive on a technology for investment thesis development.

Load workflow:
@.claude/skills/Research/workflows/tech.md

Load investment context:
@context/investment-philosophy.md

Technology to research: $ARGUMENTS

Execute the technology research workflow. Use parallel Task calls for research agents. Save to /research/<topic>/MMDD-<slug>-YY.md and log the action.
```

#### /cyber-research-market

```markdown
<!-- .claude/commands/cyber-research-market.md -->
Analyze a market/sector for investment opportunities.

Load workflow:
@.claude/skills/Research/workflows/market.md

Load investment context:
@context/investment-philosophy.md

Market to research: $ARGUMENTS

Execute the market research workflow. Use parallel Task calls for research agents. Save to /research/<market>/MMDD-<slug>-YY.md and log the action.
```

#### /cyber-tweet

```markdown
<!-- .claude/commands/cyber-tweet.md -->
Draft a tweet following brand guidelines.

Load content strategy:
@context/content-strategy.md

Topic/idea: $ARGUMENTS

Follow the draft → review → polish workflow:
1. Generate initial draft (≤280 chars, research-first tone, no hype)
2. Show draft and wait for feedback
3. Polish based on feedback
4. Save final to /content/tweets/MMDD-<slug>-YY.md
5. Log the action
```

#### /cyber-essay

```markdown
<!-- .claude/commands/cyber-essay.md -->
Write an essay following brand guidelines.

Load content strategy:
@context/content-strategy.md

Topic: $ARGUMENTS

Follow the draft → review → polish workflow:
1. Generate outline first
2. Write full draft (cessay style: clear thesis, supporting arguments, concrete examples)
3. Show draft and wait for feedback
4. Polish based on feedback
5. Save final to /content/essays/MMDD-<slug>-YY.md
6. Log the action
```

#### /cyber-image

```markdown
<!-- .claude/commands/cyber-image.md -->
Generate an image following visual style guidelines.

Load image style guide:
@context/img-style.md

Concept: $ARGUMENTS

Follow the draft → review → generate workflow:
1. Generate detailed prompt following the Modern Cyberpunk aesthetic from img-style.md
2. Show prompt and wait for approval/adjustments
3. Generate image using mcp__fal__generateImage with model "flux-pro"
4. Save to /content/images/MMDD-<slug>-YY.png
5. Log the action
```

#### /cyber-memo

```markdown
<!-- .claude/commands/cyber-memo.md -->
Generate investment memo for a company.

Load workflow:
@.claude/skills/DDMemo/workflows/generate.md

Load investment context:
@context/investment-philosophy.md

Load memo template:
@context/MEMO_template.md

Company: $ARGUMENTS

Prerequisites: Research must exist in /deals/<company>/research/

Execute the DD memo workflow:
1. Gather all research from /deals/<company>/research/
2. Load deal context from /deals/<company>/.cybos/context.md
3. Analyze with memo-analyst agent (Opus)
4. Write memo with memo-writer agent (Sonnet)
5. Review for completeness
6. Save to /deals/<company>/memo/memo.md
7. Log the action
```

#### /cyber-init-deal

```markdown
<!-- .claude/commands/cyber-init-deal.md -->
Initialize folder structure for a new deal.

Company name: $ARGUMENTS

Create the following structure:
/deals/<company-slug>/
├── .cybos/
│   ├── context.md (from template)
│   └── scratchpad/
├── research/
└── memo/

Use kebab-case for folder name (e.g., "Acme Corp" → "acme-corp").
Populate context.md with the deal context template.
Log the action.
```

#### /cyber-log

```markdown
<!-- .claude/commands/cyber-log.md -->
Show recent activity from logs.

Arguments: $ARGUMENTS (optional: "today", "week", or specific date)

Read from /.cybos/logs/ and display:
- Today's log if no argument
- Last 7 days if "week"
- Specific date if YYYY-MM-DD provided

Format output as a summary of activities.
```

---

## 8. MCP Integrations

### MCP Server Stack

All servers are vendor-supported or well-maintained community projects with documented install paths.

#### 8.1 Web Research & Intelligence

| Server | Purpose | Install | Tools Exposed |
|--------|---------|---------|---------------|
| **perplexity-mcp** | Fast search + deep research with citations | `npx -y @perplexity-ai/mcp-server` | `search`, `research` |
| **exa** | Web search, company research, LinkedIn search | Remote HTTP (see config) | `search`, `findSimilar`, `getContents`, `linkedinSearch` |
| **parallel-search** | Fast web search with citations (agentic) | Remote HTTP | `search` |
| **parallel-task** | Deep research tasks, report-style outputs | Remote HTTP | `createTask`, `getTask`, `listTasks` |

#### 8.2 Extraction & Scraping

| Server | Purpose | Install | Tools Exposed |
|--------|---------|---------|---------------|
| **firecrawl-mcp** | Scrape, crawl, map, extract | `npx -y firecrawl-mcp` | `scrape`, `crawl`, `map`, `extract` |
| **playwright** | Browser automation for hard-to-scrape sites | `npx @playwright/mcp@latest` | `navigate`, `screenshot`, `click`, `fill`, `evaluate` |

#### 8.3 Document & Data Storage

| Server | Purpose | Install | Tools Exposed |
|--------|---------|---------|---------------|
| **notion** | Notion pages + databases | `npx -y @notionhq/notion-mcp-server` | `createPage`, `updatePage`, `queryDatabase`, `search` |
| **gdrive** | Google Drive file access + search | (see archived servers) | `listFiles`, `readFile`, `searchFiles` |

#### 8.4 Image Generation

| Server | Purpose | Install | Tools Exposed |
|--------|---------|---------|---------------|
| **fal-image-video** | fal.ai images + videos (Flux, SDXL, etc.) | `npx -y fal-image-video-mcp` | `generateImage`, `generateVideo` |
| **openai-image** (alt) | OpenAI DALL-E generation + editing | `npx -y openai-gpt-image-mcp` | `generateImage`, `editImage` |

#### 8.5 Future / Nice-to-Have

| Server | Purpose | Install | Notes |
|--------|---------|---------|-------|
| **crunchbase-mcp** | Company profiles, funding, people | Clone + build | Community, needs API key |
| **cbi-mcp** | CB Insights ChatCBI | `uv run server.py` | Vendor-supported |
| **slack-mcp** | Messaging, channels | (see repo) | For notifications |

---

### MCP Configuration

```json
// .claude/.mcp.json
{
  "mcpServers": {
    
    // === WEB RESEARCH ===
    
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "${PERPLEXITY_API_KEY}"
      }
    },
    
    "exa": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.exa.ai/mcp?exaApiKey=${EXA_API_KEY}"]
    },
    
    "parallel-search": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://search-mcp.parallel.ai/mcp"],
      "env": {
        "MCP_HEADERS": "Authorization: Bearer ${PARALLEL_API_KEY}"
      }
    },
    
    "parallel-task": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://task-mcp.parallel.ai/mcp"],
      "env": {
        "MCP_HEADERS": "Authorization: Bearer ${PARALLEL_API_KEY}"
      }
    },
    
    // === EXTRACTION ===
    
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      }
    },
    
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    
    // === DOCUMENTS ===
    
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_TOKEN}"
      }
    },
    
    // === IMAGE GENERATION ===
    
    "fal": {
      "command": "npx",
      "args": ["-y", "fal-image-video-mcp"],
      "env": {
        "FAL_KEY": "${FAL_KEY}"
      }
    }
  }
}
```

---

### MCP Tool Usage by Workflow

| Workflow | Primary MCP | Secondary MCP | Fallback |
|----------|-------------|---------------|----------|
| **Company Research** | `parallel-task` (deep research) | `perplexity`, `exa` | `firecrawl` for specific URLs |
| **Tech Research** | `perplexity` | `exa` | `firecrawl` for papers |
| **Market Research** | `parallel-task` | `exa` (company search) | `perplexity` |
| **Image Generation** | `fal` (Flux/SDXL) | — | `openai-image` |
| **Hard Scraping** | `playwright` | `firecrawl` | WebFetch |
| **Document Storage** | `notion` | — | Local filesystem |

---

### MCP Tool Reference (Common Operations)

#### Perplexity
```
mcp__perplexity__search
  - query: string
  - Returns: search results with citations

mcp__perplexity__research  
  - query: string
  - depth: "basic" | "deep"
  - Returns: comprehensive research with sources
```

#### Parallel Task (Deep Research)
```
mcp__parallel-task__createTask
  - prompt: string (research question)
  - Returns: task_id

mcp__parallel-task__getTask
  - task_id: string
  - Returns: { status, result } (poll until complete)
```

#### Exa
```
mcp__exa__search
  - query: string
  - numResults: number
  - Returns: web results

mcp__exa__findSimilar
  - url: string
  - Returns: similar pages

mcp__exa__getContents
  - urls: string[]
  - Returns: page contents
```

#### Firecrawl
```
mcp__firecrawl__scrape
  - url: string
  - formats: ["markdown", "html"]
  - Returns: scraped content

mcp__firecrawl__crawl
  - url: string
  - maxDepth: number
  - Returns: crawled pages

mcp__firecrawl__extract
  - url: string
  - schema: object (structured extraction)
  - Returns: extracted data
```

#### Playwright
```
mcp__playwright__navigate
  - url: string

mcp__playwright__screenshot
  - Returns: base64 image

mcp__playwright__click
  - selector: string

mcp__playwright__fill
  - selector: string
  - value: string
```

#### fal (Image Generation)
```
mcp__fal__generateImage
  - prompt: string
  - model: "flux-pro" | "sdxl" | etc.
  - Returns: image URL or base64
```

#### Notion
```
mcp__notion__search
  - query: string
  - Returns: matching pages/databases

mcp__notion__createPage
  - parent_id: string
  - properties: object
  - content: blocks[]

mcp__notion__queryDatabase
  - database_id: string
  - filter: object
```

---

### Environment Variables Required

```bash
# Web Research (required)
PERPLEXITY_API_KEY=pplx-...
EXA_API_KEY=...
PARALLEL_API_KEY=...

# Extraction (required)
FIRECRAWL_API_KEY=fc-...

# Documents (optional but recommended)
NOTION_TOKEN=secret_...
# GOOGLE_CREDENTIALS=... (for gdrive, if added)

# Image Generation (required for content skill)
FAL_KEY=...
# Or alternatively:
# OPENAI_API_KEY=sk-... (for openai-image)
```

---

### Tiered Research Strategy

Workflows should use MCPs in this order to optimize for speed and cost:

```
1. FAST SEARCH (seconds)
   └─ perplexity search OR exa search
   └─ Good for: quick facts, recent news, validation

2. DEEP RESEARCH (1-5 minutes)  
   └─ parallel-task createTask → poll getTask
   └─ Good for: comprehensive reports, market analysis

3. TARGETED EXTRACTION (as needed)
   └─ firecrawl scrape/extract for specific URLs
   └─ exa getContents for batch URL processing

4. HARD SCRAPING (last resort)
   └─ playwright for JavaScript-heavy sites
   └─ Sites blocking standard scrapers
```

---

## 9. Hook System

| Hook | Event | Action |
|------|-------|--------|
| `load-context.ts` | SessionStart | Inject identity + deal-loading instructions |

### SessionStart Hook

```typescript
#!/usr/bin/env bun
// .claude/hooks/load-context.ts

import { readFileSync, existsSync } from 'fs';

const PAI_DIR = process.env.PAI_DIR || process.cwd();

function readFile(path: string): string {
  const fullPath = `${PAI_DIR}/${path}`;
  if (existsSync(fullPath)) {
    return readFileSync(fullPath, 'utf-8');
  }
  return '';
}

// Read stdin for hook payload (not used for SessionStart but required)
let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });

process.stdin.on('end', () => {
  // Output context as system-reminder
  const context = `
<system-reminder>
## Your Identity
${readFile('context/who-am-i.md')}

## Fund Context  
${readFile('context/organization.md')}

## Deal Context Auto-Loading
When the user mentions a company that might be a deal:
1. Check if /deals/<company-slug>/ exists (try kebab-case conversion)
2. If exists, read /deals/<company-slug>/.cybos/context.md
3. Also check for latest research in /deals/<company-slug>/research/
4. Incorporate this context into your response

## Logging Requirement
After completing any workflow (research, content, memo), append a log entry to:
/.cybos/logs/MMDD-<slug>-YY.md

Use format:
## HH:MM | category | type | subject
- Workflow: name
- Duration: Xm Ys
- Output: path
</system-reminder>
`;

  console.log(context);
});
```

### Settings.json Hook Configuration

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "bun .claude/hooks/load-context.ts"
      }
    ]
  },
  "permissions": {
    "allow": [
      "Read",
      "Write", 
      "Edit",
      "Bash",
      "WebFetch",
      "Task",
      "mcp__*"
    ]
  }
}
```

---

## 10. Folder Structure (Complete)

```
project-root/
├── .claude/
│   ├── settings.json           # Hook wiring, permissions
│   ├── .mcp.json               # MCP server configuration
│   ├── skills/                 # Convention: organized workflows
│   │   ├── CORE/
│   │   │   └── SKILL.md        # Core system description
│   │   ├── Research/
│   │   │   ├── SKILL.md
│   │   │   └── workflows/
│   │   │       ├── company.md
│   │   │       ├── tech.md
│   │   │       └── market.md
│   │   ├── Content/
│   │   │   ├── SKILL.md
│   │   │   └── workflows/
│   │   │       ├── tweet.md
│   │   │       ├── essay.md
│   │   │       └── image.md
│   │   └── DDMemo/
│   │       ├── SKILL.md
│   │       └── workflows/
│   │           └── generate.md
│   ├── agents/                 # Agent profiles for Task tool
│   │   ├── company-researcher.md
│   │   ├── market-researcher.md
│   │   ├── financial-researcher.md
│   │   ├── team-researcher.md
│   │   ├── tech-researcher.md
│   │   ├── content-writer.md
│   │   ├── image-prompter.md
│   │   ├── memo-analyst.md
│   │   ├── memo-writer.md
│   │   └── synthesizer.md
│   ├── hooks/
│   │   └── load-context.ts     # SessionStart hook
│   └── commands/               # Slash commands
│       ├── cyber-research-company.md
│       ├── cyber-research-tech.md
│       ├── cyber-research-market.md
│       ├── cyber-tweet.md
│       ├── cyber-essay.md
│       ├── cyber-image.md
│       ├── cyber-memo.md
│       ├── cyber-init-deal.md
│       └── cyber-log.md
│
│   # Note: MCP servers use npx/remote HTTP, no local server code needed
├── .cybos/
│   └── logs/                   # Single daily log files
│       └── MMDD-<slug>-YY.md
├── context/                    # Core context files
│   ├── who-am-i.md
│   ├── organization.md
│   ├── investment-philosophy.md
│   ├── content-strategy.md
│   ├── img-style.md
│   └── MEMO_template.md        # DD memo template
├── deals/                      # Deal folders
│   └── <company-slug>/
│       ├── .cybos/
│       │   ├── context.md
│       │   └── scratchpad/
│       ├── research/
│       └── memo/
├── research/                   # Topic/market research
│   └── <topic-slug>/
└── content/                    # Generated content
    ├── tweets/
    ├── essays/
    └── images/
```

---

## 11. Implementation Phases

### Week 1: Foundation + Research

**Day 1-2: Infrastructure**
- [ ] Create folder structure as specified
- [ ] Create `.claude/settings.json` with permissions and hook wiring
- [ ] Create `.claude/.mcp.json` with MCP server configuration
- [ ] Build `load-context.ts` hook (SessionStart)
- [ ] Get API keys: Perplexity, Exa, Parallel, Firecrawl
- [ ] Test MCP servers load correctly: `npx -y @perplexity-ai/mcp-server --help`

**Day 3-4: Research Skill**
- [ ] Create CORE skill documentation
- [ ] Create Research skill + workflow files (company.md, tech.md, market.md)
- [ ] Create agent profiles (company, market, financial, team, tech, synthesizer)
- [ ] Create slash commands: `/cyber-research-company`, `/cyber-research-tech`, `/cyber-research-market`
- [ ] Create `/cyber-init-deal` command

**Day 5: Testing**
- [ ] Test MCP tools individually (perplexity search, parallel task, exa)
- [ ] Test end-to-end research workflow on real company
- [ ] Implement logging (single daily file)
- [ ] Verify deal folder creation and context auto-loading

### Week 2: Content

**Day 1-2: Content Skill Setup**
- [ ] Create Content skill + workflow files (tweet.md, essay.md, image.md)
- [ ] Create agent profiles (content-writer, image-prompter)
- [ ] Get API key: fal.ai (for image generation)

**Day 3-4: Slash Commands**
- [ ] Create slash commands: `/cyber-tweet`, `/cyber-essay`, `/cyber-image`
- [ ] Test draft → review → polish flow for tweets
- [ ] Test essay workflow with cessay style
- [ ] Test image generation with fal.ai (Flux model)

**Day 5: Polish**
- [ ] Test full content workflows
- [ ] Verify content saved to correct locations
- [ ] Verify logging works for content actions

### Week 3: DDMemo + Integration

**Day 1-2: Memo Skill**
- [ ] Create DDMemo skill + workflow (generate.md)
- [ ] Create agent profiles (memo-analyst, memo-writer)
- [ ] Create slash command: `/cyber-memo`
- [ ] Test memo generation with existing research

**Day 3-4: Utilities + Polish**
- [ ] Create `/cyber-log` command
- [ ] Optional: Set up Notion MCP for document storage
- [ ] Optional: Set up Playwright MCP for hard scraping

**Day 5: End-to-End Testing**
- [ ] Full deal flow test: init → research → memo
- [ ] Content workflow test: tweet → essay → image
- [ ] Log review and refinement
- [ ] Document any issues and workarounds

---

## 12. Testing Checklist

### MCP Server Connectivity
- [ ] `mcp__perplexity__search` returns results
- [ ] `mcp__exa__search` returns results
- [ ] `mcp__parallel-task__createTask` creates task and returns ID
- [ ] `mcp__parallel-task__getTask` retrieves completed task
- [ ] `mcp__firecrawl__scrape` extracts page content
- [ ] `mcp__fal__generateImage` returns image URL

### Research Skill
- [ ] `/cyber-init-deal "Test Company"` creates correct folder structure
- [ ] `/cyber-research-company "Test Company"` produces research report
- [ ] MCP calls execute (check parallel-task, perplexity, exa)
- [ ] Research saved to correct location with correct format
- [ ] Deal context auto-created if not exists
- [ ] Log entry appended correctly
- [ ] Parallel Claude agents execute (check Task calls)

### Content Skill  
- [ ] `/cyber-tweet "test idea"` produces draft
- [ ] Review feedback incorporated correctly
- [ ] Final output saved to correct location
- [ ] `/cyber-essay "test topic"` produces full essay
- [ ] `/cyber-image "test concept"` generates image via fal.ai

### DDMemo Skill
- [ ] `/cyber-memo "Test Company"` with existing research works
- [ ] Memo follows MEMO_template.md structure
- [ ] Investment philosophy rubric applied
- [ ] Scores generated for all categories

### Context Loading
- [ ] SessionStart hook injects identity context
- [ ] Mentioning existing deal auto-loads deal context
- [ ] Investment philosophy loaded for research/memo

### Logging
- [ ] Every workflow completion logged
- [ ] Log format consistent
- [ ] `/cyber-log` displays recent activity

---

## 13. Future Enhancements (Post-MVP)

### CLI Wrapper (Priority: Next)

Build a Bun/TypeScript CLI that wraps Claude Code for headless execution:

```bash
# Future CLI commands
cyber research company "Acme Corp"
cyber research tech "TEEs"
cyber content tweet "idea"
cyber memo "Acme Corp"
```

Implementation approach:
- Use Commander.js for argument parsing
- Call `claude -p "<prompt>"` for headless execution
- Or build direct integration if Claude Code exposes programmatic API

### Scheduled Automation (Cron)

```bash
# Example: Daily portfolio monitoring
0 9 * * * claude -p "Run daily portfolio check for all deals in /deals/"
```

### Voice Notifications

ElevenLabs integration for completion notifications (from PAI architecture).

### Call Prep Skill

Meeting preparation packages with:
- Latest research summary
- Key questions to ask
- Recent news/developments
- Follow-up items from previous calls

### Portfolio Monitoring

Ongoing tracking of portfolio companies via Parallel AI Monitor API.

### Team Collaboration

- Shared deal folders
- Handoff workflows
- Multi-user logging

---

## 14. Configuration Reference

### Environment Variables

```bash
# === WEB RESEARCH (required) ===
PERPLEXITY_API_KEY=pplx-...          # Perplexity AI
EXA_API_KEY=...                       # Exa search
PARALLEL_API_KEY=...                  # Parallel AI (search + task)

# === EXTRACTION (required) ===
FIRECRAWL_API_KEY=fc-...              # Firecrawl scraping

# === IMAGE GENERATION (required for content) ===
FAL_KEY=...                           # fal.ai (Flux, SDXL, etc.)
# Alternative:
# OPENAI_API_KEY=sk-...               # OpenAI DALL-E

# === DOCUMENTS (optional but recommended) ===
NOTION_TOKEN=secret_...               # Notion integration
# GOOGLE_APPLICATION_CREDENTIALS=...  # Google Drive (if added)

# === OPTIONAL ===
CYBOS_LOG_DIR=/.cybos/logs
CYBOS_DEALS_DIR=/deals
```

### Getting API Keys

| Service | Where to Get | Pricing |
|---------|--------------|---------|
| Perplexity | https://www.perplexity.ai/settings/api | Pay-per-use |
| Exa | https://exa.ai/dashboard | Free tier available |
| Parallel | https://parallel.ai/dashboard | Pay-per-use |
| Firecrawl | https://firecrawl.dev/dashboard | Free tier (500 pages/mo) |
| fal.ai | https://fal.ai/dashboard | Pay-per-use |
| Notion | https://www.notion.so/my-integrations | Free |

### .claude/settings.json

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command", 
        "command": "bun .claude/hooks/load-context.ts"
      }
    ]
  },
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Edit", 
      "Bash",
      "WebFetch",
      "Task",
      "mcp__*"
    ],
    "deny": []
  },
  "env": {
    "CYBOS_VERSION": "1.1"
  }
}
```

---

**Specification Version:** 1.1  
**Last Updated:** 2025-12-19  
**Status:** Ready for Implementation

---

## Changelog

### v1.1 (2025-12-19)
- Added concrete MCP server configuration with vendor-supported servers
- Replaced Gemini Imagen with fal.ai (Flux) for image generation
- Added Exa, Firecrawl, Playwright, Notion MCP integrations
- Updated workflows to reference specific MCP tool calls
- Added tiered research strategy (fast search → deep research → extraction)
- Added MCP tool reference documentation
- Simplified folder structure (npx-based MCPs, no local server code)
- Updated implementation phases with day-by-day breakdown
- Added MCP connectivity testing checklist
- Added API key acquisition guide

### v1.0 (2025-12-19)
- Initial specification
