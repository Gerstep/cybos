# Cybos Setup

This is the single source of truth for setup.

## Quick Start (Recommended)

```bash
# Install Bun runtime
curl -fsSL https://bun.sh/install | bash

# Run Cybos - setup wizard opens automatically
claude
```

The setup wizard at `http://localhost:3847/setup` guides you through:
1. **Vault Location** - Where to store your data (`~/CybosVault/`)
2. **Identity** - Your name and aliases for entity matching
3. **API Keys** - Required keys for research, images, etc.
4. **Git Backup** - Optional GitHub sync for your data

When setup completes, a `vault` symlink is created in the project root:
```
cyberman/vault -> ~/CybosVault
```

**IDE Setup**: Open the `cyberman` folder in VS Code or Cursor. Your vault appears as `vault/` in the sidebar with both `private/` and `shared/` subdirectories.

## Manual Setup

### 1. Configuration

Cybos v2.1 uses a global config at `~/.cybos/config.json`:

```bash
# Create config directory
mkdir -p ~/.cybos

# Copy env template
cp .env.example .env
```

Edit `.env` with your API keys:

**Required (core features):**
- `CYBOS_USER_NAME` - Your full name
- `CYBOS_USER_OWNER_NAME` - First name (for extraction)
- `CYBOS_USER_SLUG` - kebab-case slug (e.g., `john-smith`)
- `CYBOS_ANTHROPIC_KEY` - For LLM extraction
- `PERPLEXITY_API_KEY` - Web research
- `EXA_API_KEY` - Web search and content extraction
- `PARALLEL_API_KEY` - Deep research tasks
- `GEMINI_API_KEY` - Image generation

**Optional:**
- `CYBOS_USER_ALIASES` - Comma-separated aliases (e.g., `Me,John`)
- `TYPEFULLY_API_KEY` - Social media scheduling
- `TELEGRAM_API_ID` / `TELEGRAM_API_HASH` - Telegram access
- `GOOGLE_OAUTH_CREDENTIALS` - Gmail/Calendar integration
- `NOTION_TOKEN` - Notion integration
- `FIRECRAWL_API_KEY` - Fallback web scraping

### 2. Vault Setup

Create your vault directory structure:

```bash
mkdir -p ~/CybosVault/private/{context,deals,research,projects,content,.cybos/db}
mkdir -p ~/CybosVault/private/content/{ideas,tweets,essays,images,briefs,work}
mkdir -p ~/CybosVault/private/context/{calls,telegram,emails,entities}
```

Or let the setup wizard create it for you.

### 2b. Vault Symlink (automatic)

The setup wizard automatically creates a symlink:

```
cyberman/vault -> ~/CybosVault
```

This enables:
- **IDE access**: Open `cyberman` in VS Code/Cursor - vault appears in sidebar as `vault/`
- **@ autocomplete**: In Claude Code, type `@GTD` or `@who-am` to find vault files

The `@` autocomplete is powered by `scripts/file-suggestion.sh` (configured in `.claude/settings.json`).

**Manual creation** (if needed):
```bash
ln -s ~/CybosVault vault
```

### 3. Database Initialization

```bash
# Initialize SQLite database
bun scripts/db/init.ts

# Run indexer (optional: with LLM extraction)
bun scripts/db/index.ts
bun scripts/db/index.ts --extract  # includes promise/action extraction
```

Database location: `~/CybosVault/private/.cybos/db/cybos.sqlite`

### 4. Shell Integration (Critical)

**Claude Code does NOT auto-load `.env` files.** Run the setup script:

```bash
./scripts/setup-shell.sh
source ~/.zshenv  # or restart terminal
claude
```

| Platform | Support | Notes |
|----------|---------|-------|
| **macOS + zsh** | ✅ Full | Default setup works |
| **Linux + zsh** | ✅ Full | Default setup works |
| **macOS/Linux + bash** | ⚠️ Partial | Use `--direnv` flag |
| **Windows** | ❌ None | Use WSL with zsh |

For bash users:
```bash
./scripts/setup-shell.sh --direnv
```

### 5. MCP Server Configuration

MCP servers are configured in `.mcp.json` using `${VAR}` syntax for env vars.

| Server | Purpose | Env Vars |
|--------|---------|----------|
| perplexity | Fast search + deep research | `PERPLEXITY_API_KEY` |
| exa | Web search, content extraction | `EXA_API_KEY` |
| parallel-search | Web search fallback | `PARALLEL_API_KEY` |
| parallel-task | Deep research tasks | `PARALLEL_API_KEY` |
| nano-banana | Image generation | `GEMINI_API_KEY` |
| typefully | Social scheduling | `TYPEFULLY_API_KEY` |
| gmail | Email management | (uses OAuth) |
| calendar | Meeting schedules | `GOOGLE_OAUTH_CREDENTIALS` |

### 6. Daily Briefs (Optional, macOS)

Copy launchd templates and replace placeholders:

```bash
cp config/launchd/com.cybos.morning-brief.plist.example ~/Library/LaunchAgents/com.cybos.morning-brief.plist
cp config/launchd/com.cybos.brief-server.plist.example ~/Library/LaunchAgents/com.cybos.brief-server.plist

# Edit files to replace __VAULT_PATH__ with ~/CybosVault

launchctl load ~/Library/LaunchAgents/com.cybos.morning-brief.plist
launchctl load ~/Library/LaunchAgents/com.cybos.brief-server.plist
```

## Vault Sync (Optional)

Sync your vault to GitHub for backup and cross-machine access:

```bash
# Check sync status
./scripts/vault-sync.sh --status

# Sync both private and shared vaults
./scripts/vault-sync.sh

# Sync only private vault
./scripts/vault-sync.sh private

# Pull only (no push)
./scripts/vault-sync.sh --pull
```

Move data to shared vault for team access:

```bash
./scripts/move-to-share.sh deal acme-corp
./scripts/move-to-share.sh research ai-market
```

## Verify Setup

Run the health check to verify all components:

```bash
bun scripts/health-check.ts
```

Expected output when everything is working:
```
✅ Config: Config loaded from ~/.cybos/config.json
✅ Vault: Vault found at ~/CybosVault
✅ Vault .env: Vault .env found
✅ CYBOS_ANTHROPIC_KEY: API key found for LLM extraction
✅ Database: SQLite database initialized
✅ Entities, Interactions, Extracted Items: Data indexed
✅ Telegram Session: Telegram session found
✅ Telegram Credentials: API ID and hash found
✅ Briefs Directory: Found
✅ Brief Server: Running on port 3847
🎉 All checks passed!
```

## Post-Setup: Service Authentication

After basic setup, authenticate external services for full functionality:

### Telegram (required for /cyber-brief)

Telegram requires a one-time interactive login:

```bash
# Run interactively to authenticate
bun scripts/telegram-gramjs.ts --login

# You'll be prompted for:
# 1. Phone number (with country code)
# 2. Verification code (sent to Telegram)
# 3. 2FA password (if enabled)

# Session is saved to ~/.cybos/telegram/session.txt
```

**Important:** This must be run in an interactive terminal. Non-interactive runs (like from cron or headless claude) will fail with a helpful error if no session exists.

### Gmail/Calendar (required for email in briefs)

Gmail uses OAuth authentication:

1. In Claude Code, the Gmail MCP will prompt for authentication when first used
2. A browser window opens for Google OAuth
3. Grant permissions and close the browser
4. Authentication is saved automatically

Or manually trigger: In Claude Code, run any command that uses Gmail (like `/cyber-brief`).

### LLM Extraction (required for /cyber-reindex --extract)

The `CYBOS_ANTHROPIC_KEY` must be set in your environment. The scripts auto-load from:
1. Environment variable (if already set)
2. `~/CybosVault/private/.env`
3. Project `.env`

Create the vault .env if it doesn't exist:
```bash
echo "CYBOS_ANTHROPIC_KEY=sk-ant-your-key-here" >> ~/CybosVault/private/.env
```

## Security Notes

- **NEVER commit `.env`** - Already in `.gitignore`
- **NEVER commit `.mcp.json`** - Already in `.gitignore`
- **NEVER commit `~/.cybos/config.json`** - Contains paths to your data
- **`vault` symlink is ignored** - Your data won't be pushed to GitHub
- Keep `/context/who-am-i.md` private if open-sourcing

## Troubleshooting

**First step - always run health check:**
```bash
bun scripts/health-check.ts
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| **Morning brief empty** | Telegram not authenticated | `bun scripts/telegram-gramjs.ts --login` |
| **Explorer shows zero items** | LLM extraction not run | `bun scripts/db/index.ts --extract` |
| **CYBOS_ANTHROPIC_KEY error** | Key not in environment | Add to `~/CybosVault/private/.env` |
| **Telegram script hangs** | No session, waiting for input | Run with `--login` interactively |
| **Gmail MCP errors** | OAuth not completed | Run any Gmail command, complete browser OAuth |
| **MCP 401 errors** | Env vars not loaded | Run `./scripts/setup-shell.sh` |
| **"Identity not loaded"** | Missing identity file | Create `~/CybosVault/private/context/who-am-i.md` |
| **Database not found** | Not initialized | `bun scripts/db/init.ts` |

### Quick Diagnostics

```bash
# Full health check
bun scripts/health-check.ts

# Check environment vars
echo "PERPLEXITY: ${PERPLEXITY_API_KEY:0:10}..."
echo "EXA: ${EXA_API_KEY:0:10}..."
echo "CYBOS_ANTHROPIC: ${CYBOS_ANTHROPIC_KEY:0:10}..."

# Check database status
bun scripts/db/query.ts status

# Check brief server
curl -s http://localhost:3847/api/health | jq

# Test telegram (should fail fast if no session)
bun scripts/telegram-gramjs.ts --dry-run
```

## Dependencies

1. `claude` - Claude Code CLI
2. `bun` - JavaScript runtime
3. `git` - Version control (for vault sync)
