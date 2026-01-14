# Cybos Setup

This is the single source of truth for setup.

## 1. Personalization (Required)

Open `CLAUDE.md` and follow the **Personalization (Required)** section. It points you to:

- `context/who-am-i.md`
- `context/organization.md`
- `.env` user identity settings

## 2. Configuration (.env)

Copy `.env.example` to `.env` and fill in your values. This is the single configuration file for keys, database, and user identity.

```bash
cp .env.example .env
```

**Required (core features):**
- `CYBOS_USER_NAME` - Name used for identity resolution
- `DATABASE_URL` - PostgreSQL connection string (default: localhost:5433)
- `CYBOS_ANTHROPIC_KEY` - LLM extraction for `/cyber-reindex --extract`
- `PERPLEXITY_API_KEY` - Web research
- `EXA_API_KEY` - Web search and content extraction
- `PARALLEL_API_KEY` - Deep research tasks
- `GEMINI_API_KEY` - Image generation
- `TYPEFULLY_API_KEY` - Social media scheduling
- `TELEGRAM_API_ID` / `TELEGRAM_API_HASH` - Telegram access

**Optional:**
- `CYBOS_USER_OWNER_NAME` - Name to use as owner/target in extracted items
- `CYBOS_USER_SLUG` - Slug for the user entity
- `CYBOS_USER_ALIASES` - Comma-separated aliases (e.g., `Me,Your Name`)
- `GOOGLE_OAUTH_CREDENTIALS` - Path to OAuth credentials for Gmail/Calendar
- `NOTION_TOKEN` - Notion integration
- `FIRECRAWL_API_KEY` - Fallback web scraping

## 3. Shell Integration (Critical)

**Claude Code does NOT auto-load `.env` files.** Run the setup script to configure your shell:

```bash
./scripts/setup-shell.sh
source ~/.zshenv  # or restart terminal
claude
```

### Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| **macOS + zsh** | ✅ Full | Default setup works perfectly |
| **Linux + zsh** | ✅ Full | Default setup works perfectly |
| **macOS/Linux + bash** | ⚠️ Partial | Terminal only; use `--direnv` for full support |
| **Windows** | ❌ None | Use WSL with zsh |

### For bash users (recommended)

bash doesn't have an equivalent to `.zshenv`, so env vars won't load when Claude Code is launched from GUI/IDE. Use direnv instead:

```bash
./scripts/setup-shell.sh --direnv
```

This installs [direnv](https://direnv.net/) which auto-loads `.env` when you `cd` into the project.

### How the script works

- **zsh**: Adds env loading to `~/.zshenv` (loaded for ALL shells, including non-interactive)
- **bash + direnv**: Creates `.envrc` and hooks into shell for directory-based loading
- Validates that required API keys are set
- Is idempotent (safe to run multiple times)

**Manual alternative (if script doesn't work):**

```bash
# Before each Claude Code session
set -a && source /path/to/cybos/.env && set +a
claude
```

## 4. MCP Server Configuration

MCP servers are configured in `.mcp.json` (project root). The config uses `${VAR}` syntax to reference environment variables.

**How it works:**
- Claude Code expands `${VAR}` when loading MCP servers
- Keys stay in `.env` (gitignored), config in `.mcp.json` (also gitignored)
- If a required variable is missing, that MCP server will fail to start (401 errors)

**Current servers:**
| Server | Purpose | Env Vars Used |
|--------|---------|---------------|
| perplexity | Fast search + deep research | `PERPLEXITY_API_KEY` |
| exa | Web search, content extraction | `EXA_API_KEY` |
| parallel-search | Web search fallback | `PARALLEL_API_KEY` |
| parallel-task | Deep research tasks | `PARALLEL_API_KEY` |
| nano-banana | Image generation | `GEMINI_API_KEY` |
| typefully | Social scheduling | `TYPEFULLY_API_KEY` |
| gmail | Email management | (uses OAuth) |
| calendar | Meeting schedules | `GOOGLE_OAUTH_CREDENTIALS` |

## 5. Database Setup (for entity indexing)

```bash
# Start PostgreSQL
cd scripts/db && docker compose up -d && cd ../..

# Initialize schema
bun scripts/db/init.ts

# Run indexer with LLM extraction
bun scripts/db/index.ts --extract
```

## 6. Daily Briefs (Optional, macOS)

Launchd templates live in `config/launchd/*.plist.example`. Copy them to `~/Library/LaunchAgents/` and replace placeholders:

- `__CYBOS_ROOT__` - absolute path to this repo
- `__HOME__` - your home directory

Example:

```bash
cp config/launchd/com.cybos.morning-brief.plist.example ~/Library/LaunchAgents/com.cybos.morning-brief.plist
cp config/launchd/com.cybos.brief-server.plist.example ~/Library/LaunchAgents/com.cybos.brief-server.plist
```

Then load with:

```bash
launchctl load ~/Library/LaunchAgents/com.cybos.morning-brief.plist
launchctl load ~/Library/LaunchAgents/com.cybos.brief-server.plist
```

## 7. Verify Setup

1. **Test MCP servers**: Restart Claude Code, then run `/mcp` to verify all servers connected
2. **Test identity loading**: Run any content command and verify it uses your identity
3. **Test database**: Run `/cyber-reindex --status`

## Security Notes

- **NEVER commit `.env`** - Already in `.gitignore`
- **NEVER commit `.mcp.json`** - Already in `.gitignore`, contains sensitive URL patterns
- Keep `/context/who-am-i.md` and `/context/organization.md` private if you open source the repo

## Troubleshooting

- **MCP 401 Unauthorized errors**: Env vars not loaded. Check with `echo $PERPLEXITY_API_KEY` - if empty, see Section 3 above
- **"API key not found"**: Check your `.env` file, ensure variable names match exactly
- **MCP server not starting**: Run Claude Code with verbose output, check env vars are exported
- **"Social set not found"**: Verify your Typefully social set ID in workflows
- **"Identity not loaded"**: Ensure `/context/who-am-i.md` exists and is properly formatted
- **Database issues**: Ensure PostgreSQL is running (`docker ps`), check `DATABASE_URL`

**Quick diagnostic:**
```bash
# Check if env vars are set (run BEFORE starting claude)
echo "PERPLEXITY: ${PERPLEXITY_API_KEY:0:10}..."
echo "EXA: ${EXA_API_KEY:0:10}..."
echo "GEMINI: ${GEMINI_API_KEY:0:10}..."
```

## Dependencies

1. `claude` - Claude Code CLI
2. `bun` - JavaScript runtime (for scripts)
3. `docker` - For PostgreSQL database
4. `ghostty` (optional) - Terminal emulator
