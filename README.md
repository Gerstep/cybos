# Cybos

Cybernetic Operating System - AI-powered VC operations assistant. Research companies, process messages, generate content, write investment memos.

## Quick Start

```bash
curl -fsSL https://bun.sh/install | bash
claude
```

The setup wizard at `http://localhost:3847/setup` will guide you through vault setup, identity, and API keys.

For manual setup, see [docs/SETUP.md](docs/SETUP.md).

## Commands

### Research
| Command | Purpose |
|---------|---------|
| `/cyber-research-company "Name"` | Company due diligence |
| `/cyber-research-tech "Topic"` | Technology deep-dive |
| `/cyber-research-market "Sector"` | Market analysis |
| `/cyber-research-topic "Topic"` | Topic exploration |

**Flags:** `--quick` (10-30s), `--standard` (2-5m, default), `--deep` (5-15m)

### Content
| Command | Purpose |
|---------|---------|
| `/cyber-tweet "Topic"` | Draft tweet |
| `/cyber-essay "Topic"` | Write essay |
| `/cyber-image "Concept"` | Generate image |
| `/cyber-schedule @file.md` | Schedule to Twitter/LinkedIn |

### Messaging
| Command | Purpose |
|---------|---------|
| `/cyber-telegram` | Process 1 unread Telegram message |
| `/cyber-telegram --count 3` | Process 3 messages |
| `/cyber-telegram --user "@name"` | Process specific person |
| `/cyber-email --sync` | Sync emails (last 3 days) |

### Operations
| Command | Purpose |
|---------|---------|
| `/cyber-brief` | Morning brief (Telegram + Email + Calendar + GTD) |
| `/cyber-calendar` | Today + tomorrow meetings |
| `/cyber-gtd` | Process GTD tasks |
| `/cyber-memo "Company"` | Generate investment memo |
| `/cyber-init-deal "Company"` | Initialize deal folder |
| `/cyber-reindex` | Rebuild entity database |
| `/cyber-log` | Show recent activity |
| `/cyber-summarize therapy @file` | Summarize therapy session transcript |

### Projects
| Command | Purpose |
|---------|---------|
| `/cyber-init-project "Name"` | Initialize project |
| `/cyber-project <slug>` | Show project status |
| `/cyber-projects` | List all projects |

## Architecture

```
CYBOS
├── SKILLS (workflows)
│   ├── Research, Browse, Telegram
│   ├── Content, DDMemo, GTD, Summarize
│
├── AGENTS (parallel via Task tool)
│   ├── Researchers: company, market, financial, team, tech
│   ├── Content: content-writer
│   ├── Memo: memo-analyst, memo-writer
│   └── Synthesizer
│
├── MCP SERVERS
│   ├── exa, perplexity, parallel-task (research)
│   ├── nano-banana (images)
│   ├── typefully (scheduling)
│   └── gmail (email + calendar)
│
└── CONTEXT (identity, style, entities)
```

**Design principles:**
- File-first: All state is markdown on disk, indexed in SQLite
- Vault-based: User data in `~/CybosVault/`, separate from code
- Private/Shared split: Personal data stays local, team data syncs via Git
- Parallel agents: Multiple Task calls run simultaneously

## File Structure

```
~/CybosVault/                      # User data vault
├── private/                       # Personal data (not synced)
│   ├── context/                   # Identity, calls, telegram, emails
│   ├── deals/                     # Deal folders with research + memos
│   ├── research/                  # Topic/market research
│   ├── projects/                  # Multi-week initiatives
│   ├── content/                   # Generated content
│   │   ├── tweets/, essays/, images/
│   │   ├── briefs/                # Morning briefs
│   │   └── work/                  # GTD task outputs
│   └── .cybos/db/                 # SQLite database
│
├── shared/                        # Team-shared data (synced via Git)
│   ├── deals/                     # Shared company research + DD
│   ├── research/                  # Shared market/tech research
│   ├── projects/                  # Multi-person projects
│   └── context/calls/             # Team call transcripts

cybos/                             # Code repository
├── .claude/
│   ├── skills/                    # Workflows
│   ├── agents/                    # Agent profiles
│   ├── hooks/                     # SessionStart
│   └── commands/                  # Slash commands
├── scripts/                       # Utilities
└── docs/                          # Documentation
```

## Documentation

- [Setup Guide](docs/SETUP.md) - Installation and configuration
- [Usage Guide](docs/USAGE.md) - Workflows and best practices
- [Architecture](docs/ARCHITECTURE.md) - Technical reference

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP 401 errors | Env vars not loaded. Check `echo $PERPLEXITY_API_KEY` |
| Hook not loading | `chmod +x .claude/hooks/load-context.ts` |
| Research sparse | Run again, try different MCP tools |
| Image fails | Check `GEMINI_API_KEY`, simplify prompt |

## License

MIT License with Attribution Requirement

Copyright (c) 2026 Cybos Contributors
