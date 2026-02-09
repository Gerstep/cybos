# Cybos Usage Guide

Detailed workflows and best practices for using Cybos.

---

## Research Workflows

### Company Research

```bash
/cyber-init-deal "Acme Corp"
/cyber-research-company "Acme Corp"
```

**What happens:**
- Parallel MCP calls gather data (Perplexity, Exa, Parallel AI)
- 4 parallel agents analyze (company, market, financial, team)
- Synthesizer consolidates with investment lens
- Report saved to `/deals/acme-corp/research/MMDD-<slug>-YY/report.md`

**Duration:** 4-8 minutes

### Technology Research

```bash
/cyber-research-tech "Trusted Execution Environments"
```

**What happens:**
- Deep technical research via MCP tools
- 3 parallel agents (tech, market, financial)
- Synthesis with investment opportunity focus
- Report saved to `/research/<topic>/MMDD-<slug>-YY/report.md`

**Duration:** 5-8 minutes

### Market Research

```bash
/cyber-research-market "AI Infrastructure"
```

**What happens:**
- Market sizing and dynamics research
- 3 parallel agents (market, technology, investment activity)
- Report includes TAM, key players, white spaces, timing

**Duration:** 8-12 minutes

### Research Intensity Flags

| Flag | Duration | Quality | When to use |
|------|----------|---------|-------------|
| `--quick` | 10-30s | Basic | Fast fact-checking |
| `--standard` | 2-5m | Good | Default, most research |
| `--deep` | 5-15m | Excellent | Critical decisions, IC prep |

---

## Content Workflows

### Tweets

```bash
/cyber-tweet "AI agents using crypto wallets"
```

**Workflow:** Draft → Review → Polish → Save

Loads `voice-identity.md` + `writing-style-en.md`, creates hook-driven tweet. Output: `/content/tweets/MMDD-<slug>-YY.md`

**Duration:** 2-5 minutes

### Essays

```bash
/cyber-essay "Why compute is becoming a commodity"
```

**Workflow:** Draft → Review → Polish

Structure: Hook → Stakes → Mechanism → Turn → Landing (500-2500 words)

**Duration:** 15-30 minutes

### Telegram Posts

```bash
/cyber-post "AI automation for VCs"
```

Creates Russian post + English translation. Uses `writing-style-ru.md`.

### Images

```bash
/cyber-image "Solitary figure in brutalist VC office"
```

**Workflow:** Draft prompt → Review → Generate via Nano Banana MCP

**Styles:** Automatically inferred from keywords:
- `info` - infographics, diagrams
- `mural` - sacred transformation aesthetic
- `cyberpunk` - grounded futurism (default)

**Duration:** 3-7 minutes

### Source-Driven Content

Use `@path/to/file.md` to reference source material:

```bash
# Expand idea into essay
/cyber-essay @content/ideas/agent-economy.md "Full essay with examples"

# Distill research into tweet
/cyber-tweet @deals/acme-corp/research/report.md "Key insight"

# Multiple sources
/cyber-essay "TEE market" @content/ideas/tee.md @research/tee-market/
```

---

## Telegram Processing

```bash
/cyber-telegram                    # 1 unread dialog
/cyber-telegram --count 3          # 3 unread dialogs
/cyber-telegram --user "@username" # Specific person
/cyber-telegram --requests         # Message requests (non-contacts)
/cyber-telegram --dry-run          # Read only, no drafts
```

**What happens:**
1. Fetches messages via GramJS MTProto
2. Looks up entity context from database
3. AI generates draft replies
4. Drafts saved to Telegram (not sent)
5. Per-person logs saved to `/context/telegram/<slug>.md`

---

## GTD Runner

```bash
/cyber-gtd                  # Plan first GTD item
/cyber-gtd --count 3        # Process 3 items
/cyber-gtd --execute        # Skip plan, run immediately
/cyber-gtd --project slug   # Only tasks under # heading
```

**Task Classification:**

| Pattern | Workflow |
|---------|----------|
| "ask for call", "message" | outreach |
| "call with", "meeting" | call-prep |
| "podcast" | podcast |
| company name | research |

**Output:** `/content/work/MMDD-<slug>.md` with draft + pending actions

---

## DD Memo Generation

```bash
# Prerequisite: run research first
/cyber-research-company "Company"

# Generate memo
/cyber-memo "Company"
```

**What happens:**
1. Load all research from `/deals/<company>/research/`
2. memo-analyst (Opus) applies investment rubric
3. memo-writer (Sonnet) fills template
4. Output: `/deals/<company>/memo/memo.md`

**Duration:** 8-15 minutes

---

## Morning Brief

```bash
/cyber-brief              # Generate brief
/cyber-brief --email-days 7  # 7 days of emails
```

**Data sources:** Telegram, Gmail, Calendar, GTD.md

**Web view:** http://localhost:3847

---

## Social Scheduling

```bash
/cyber-schedule @content/tweets/file.md              # Schedule content
/cyber-schedule @content/file.md --image @img.png    # With image
```

Schedules to Twitter and/or LinkedIn via Typefully.

---

## Projects

```bash
/cyber-init-project "Cyber Accelerator Q1"
/cyber-project cyber-accelerator-q1
/cyber-projects
/cyber-gtd --project cyber-accelerator-q1
```

Projects are `# headings` in GTD.md. Use `/projects/` folder for multi-month initiatives with artifacts.

---

## Agent System

| Agent | Model | Purpose |
|-------|-------|---------|
| company-researcher | Haiku | Business model, product, traction |
| market-researcher | Haiku | TAM, dynamics, competitive landscape |
| financial-researcher | Haiku | Funding history, metrics, valuation |
| team-researcher | Haiku | Founder backgrounds, assessment |
| tech-researcher | Haiku | Technology deep-dives, moat analysis |
| quality-reviewer | Sonnet | Gap analysis (deep mode only) |
| content-writer | Sonnet | Tweets, essays |
| memo-analyst | Opus | Strategic investment analysis |
| memo-writer | Sonnet | Memo from template |
| synthesizer | Sonnet | Consolidate research |

Agents run in parallel via Task tool.

---

## MCP Integration

### Tiered Strategy

```
1. FAST SEARCH (seconds)
   └─ perplexity search OR exa search

2. DEEP RESEARCH (1-5 minutes)
   └─ parallel-task createDeepResearch

3. TARGETED EXTRACTION
   └─ exa getContents (PRIMARY)
   └─ Fallback: parallel-search web_fetch

4. HARD SCRAPING (last resort)
   └─ playwright for JS-heavy sites
```

### Primary MCP Servers

| Server | Purpose |
|--------|---------|
| exa | Web search, content extraction (PRIMARY) |
| perplexity | Fast search + deep research |
| parallel-task | Deep research tasks |
| nano-banana | Image generation (Gemini 3.0) |
| typefully | Social scheduling |
| gmail | Email + Calendar (unified) |

---

## Best Practices

### 1. Research Before Memo
Always run `/cyber-research-company` before `/cyber-memo`.

### 2. Iterative Content
Content workflows expect feedback:
- "Good" or "ship it" = approved
- "More technical" = adjust tone
- "Different hook" = revise opening

### 3. Use Ideas Folder
Capture rough thoughts in `/content/ideas/` and expand later:
```bash
/cyber-essay @content/ideas/agent-econ.md "Full essay"
```

### 4. Monitor Logs
Check `/cyber-log` regularly to track activity.

### 5. Update Deal Context
When new information emerges, update `/deals/<company>/index.md`.

---

## Troubleshooting

### Hook Not Loading
```bash
chmod +x .claude/hooks/load-context.ts
bun .claude/hooks/load-context.ts < /dev/null
```

### MCP Server Not Found
- Check API key in `.env`
- Verify `.mcp.json` configuration
- Test: `npx -y @perplexity-ai/mcp-server --help`

### Research Returns Limited Data
- Run research again (MCP services may have been slow)
- Try different MCP tools
- Check API quotas

### Image Generation Fails
- Check `GEMINI_API_KEY`
- Simplify prompt if safety checker triggered
- Use `continue_editing` for refinements

---

## Development

### Adding a Workflow
1. Create: `.claude/skills/<Skill>/workflows/<workflow>.md`
2. Create command: `.claude/commands/cyber-<command>.md`
3. Reference workflow with `@.claude/skills/...`

### Adding an Agent
1. Create: `.claude/agents/<agent-name>.md`
2. Define purpose, output format, guidelines
3. Reference in workflow as `Task: <agent-name>`

### Customizing Brand Voice
Edit:
- `context/style/voice-identity.md` - shared persona
- `context/style/writing-style-en.md` - English style
- `context/style/writing-style-ru.md` - Russian style

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full technical reference.
