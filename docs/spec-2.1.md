# Cybos - Design Specification v2.1

*Private + shared vault split, GitHub sync, SQLite migration, setup wizard*

---

## 1. Executive Summary

v2.1 separates the **core app** from a **vault** that holds all user data, with two vault roots:
- `private/` (local-only, default for all data)
- `shared/` (team-shared via a private GitHub repo, optional)

The release also migrates the context graph to SQLite, adds a browser-based setup wizard, and establishes a global config system.

**Key outcomes:**
- Core app can be public without risk of private data leakage
- Clear user boundary: "work here" vault vs "engine code"
- Explicit, user-controlled sharing with GitHub-based sync
- No Docker dependency (SQLite replaces PostgreSQL)
- Non-technical setup experience via wizard

---

## 2. Goals and Non-Goals

### Goals
- Split core app vs vault with strict routing rules
- Default all data to `private/` (vault-first model)
- Allow explicit sharing of select data in `shared/`
- Implement setup wizard with non-technical UX
- Migrate PostgreSQL context graph to SQLite
- Use GitHub for team sync (no third-party sync providers)
- Centralize configuration in global config file

### Non-Goals (v2.1)
- Multi-profile support
- A separate Cybos CLI
- A hosted sync service or real-time collaboration
- Pipeline commands (`/cyber-intake`, `/cyber-fit-check`, etc.) - deferred to v2.2

---

## 3. Architectural Decisions (Finalized)

| Category | Decision | Rationale |
|----------|----------|-----------|
| **DB Location** | `~/CybosVault/private/.cybos/db/cybos.sqlite` | Database travels with user data |
| **DB in Git** | Gitignored | Derived data, avoid merge conflicts |
| **Vault Discovery** | Global JSON config at `~/.cybos/config.json` | Works from any directory |
| **API Keys** | Stay in `.env` file | Security - not in plaintext config JSON |
| **Migration Path** | Fresh install only | No migration script, rewrite README instead |
| **Auto-Install** | With user consent | Wizard asks permission before installing deps |
| **Git LFS** | No | Keep simple, accept larger repo size |
| **Branch Strategy** | Single `v2.1` branch | All v2.1 work on one branch, merge to master when done |
| **No-Share Mode** | All data to `private/` | Consistent vault-first even without shared repo |
| **Config Format** | JSON with auto-migration | Config loader upgrades old versions automatically |
| **Wizard Server** | Same as brief-server (`/setup` route) | One server, simpler |
| **Pre-Setup Behavior** | Auto-launch wizard | Better UX than just showing error |
| **launchd Paths** | Vault paths | Plists reference `~/CybosVault/...` directly |
| **Share Method** | Move (not copy) | Deal exists in one place only |
| **MVP Setup** | Vault + identity only | API keys optional for initial setup |
| **Sync Scripts** | Consolidated `vault-sync.sh` | One script for both repos, less duplication |
| **New Team Setup** | Create locally, push manually | User creates GitHub repo themselves |
| **Automation Failures** | Warn, don't spam | Log warnings if missing keys, don't flood logs |
| **Path Resolution** | Centralized `paths.ts` | Single source of truth for all paths |

---

## 4. Architecture Overview

```
~/.cybos/                          # GLOBAL CONFIG (outside vault)
  config.json                      # Vault path, user identity (API keys in .env)

Core App (public repo)             # THE CODE
  .claude/                         # Skills, commands, hooks, agents
  scripts/                         # Utility scripts
  docs/                            # Documentation
  config/                          # Config templates

~/CybosVault/                      # THE VAULT (user data)
  private/                         # LOCAL-ONLY (default)
    context/
    deals/
    research/
    projects/
    content/
    .cybos/
      db/cybos.sqlite
      logs/
      cache/
  shared/                          # TEAM-SHARED (GitHub, optional)
    deals/
    context/calls/
    research/
    projects/
```

---

## 5. Global Config Schema

Location: `~/.cybos/config.json`

**Note:** API keys stay in `.env` file (not in config JSON) for security. Config only stores non-sensitive settings.

```json
{
  "version": "2.1",
  "vault_path": "~/CybosVault",
  "private": {
    "git_enabled": false,
    "repo_url": null
  },
  "shared": {
    "enabled": false,
    "repo_url": null
  },
  "user": {
    "name": "Stepan Gershuni",
    "owner_name": "Stepan",
    "slug": "stepan-gershuni",
    "aliases": ["Me", "Stepan", "SG"]
  },
  "setup_completed": true,
  "automations": {
    "daily_reindex": true,
    "daily_brief": true
  }
}
```

**Required fields:** `vault_path`, `user.name`, `user.owner_name`, `user.slug`

**Optional:** `private.*`, `shared.*`, `automations.*`

### Config Version Migration

The config loader (`scripts/config.ts`) auto-migrates old versions:
- Checks `version` field on load
- Applies transformations for schema changes
- Saves updated config with new version

---

## 6. Vault Layout (Detailed)

```
~/CybosVault/
  private/                         # LOCAL-ONLY (default for everything)
    context/
      who-am-i.md                  # User identity (generated by wizard)
      organization.md              # Organization context
      calls/                       # Granola transcripts
        README.md
        2026-01-15_call-title/
          metadata.json
          transcript.txt
          notes.md
      telegram/                    # Per-person conversation logs
        README.md
        person-slug.md
      emails/                      # Indexed emails
        README.md
        .state.json
        2026-01-15_from-subject/
          metadata.json
          body.md
      entities/                    # Manual entity overrides
        README.md
        people/
        orgs/
      unstuck/
        journal.md
    deals/                         # All deals (private by default)
      company-slug/
        .cybos/
          context.md
        research/
          MMDD-slug-YY/
            raw/
            report.md
        memo/
          memo.md
    research/                      # Topic/market research
      topic-slug/
        MMDD-slug-YY/
          raw/
          report.md
    projects/                      # Multi-week initiatives
      project-slug/
        .cybos/
          context.md
    content/
      posts/                       # Telegram posts
      tweets/                      # Twitter threads
      essays/                      # Long-form
      images/                      # Generated images
      ideas/                       # Browse discoveries
      briefs/                      # Morning briefs
      work/                        # GTD task outputs
    .git/                          # Git repo (optional, personal backup)
    .gitignore                     # Excludes: .cybos/db/, .cybos/cache/
    .cybos/                        # VAULT METADATA
      db/
        cybos.sqlite               # THE DATABASE (gitignored - derived data)
      logs/
        MMDD-YY.md                 # Daily activity logs
      cache/                       # Temp files (gitignored)

  shared/                          # TEAM-SHARED (company GitHub repo)
    .git/                          # Git repo (company remote)
    README.md                      # Sharing rules doc
    deals/                         # Explicitly shared deals only
      company-slug/
    context/
      calls/                       # Shared call transcripts
    research/                      # Explicitly shared research
    projects/                      # Explicitly shared projects
```

---

## 7. Routing and Sharing Policy

### Default Routing
- **All new data** is written to `private/` unless explicitly shared
- Even when shared repo is not configured, data goes to `private/`
- No fallback to app root - vault is always required after setup

### Explicit Sharing
- Sharing is done by **moving** (not copying) from `private/` to `shared/`
- Deal exists in one location only (no duplication)
- Shared content determined by location: if in `shared/`, it's shared

### Sharing Operations
| Operation | Command/Action |
|-----------|----------------|
| Share a deal | Move `private/deals/acme/` to `shared/deals/acme/` |
| Share a call | Move call folder to `shared/context/calls/` |
| Unshare | Move back from `shared/` to `private/` |

### Call Sharing Rule
When a call is shared:
- Include full raw transcript and summary (no redaction in v2.1)
- Entire call folder moves to `shared/context/calls/`

---

## 8. Git Strategy (3 Independent Repos)

The system uses three independent git repositories with clear separation:

```
~/Work/cyberman/                # APP CODE (development repo)
  .git/
    origin → your private fork  # Development, features
    cybos  → public repo        # Open source releases
  # Publish via: ./scripts/publish-cybos.sh

~/CybosVault/                   # VAULT ROOT (not a repo)
  private/                      # YOUR PERSONAL DATA
    .git/ → personal GitHub     # Backup, cross-machine sync
    # Sync via: ./scripts/private-sync.sh

  shared/                       # TEAM DATA
    .git/ → company GitHub      # Team collaboration
```

### Sync Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/vault-sync.sh` | Sync vault repos to GitHub | `./scripts/vault-sync.sh [private|shared|all]` |
| `scripts/publish-cybos.sh` | Publish app code to public repo | `./scripts/publish-cybos.sh -m "message"` |

### Sync Operations

**Vault sync (consolidated script):**
```bash
./scripts/vault-sync.sh private     # Sync private vault only
./scripts/vault-sync.sh shared      # Sync shared vault only
./scripts/vault-sync.sh             # Sync both (default)
./scripts/vault-sync.sh --status    # Show status of both repos
./scripts/vault-sync.sh --pull      # Pull only (no push)
```

### What Goes Where

| Data | Git Repo | Rationale |
|------|----------|-----------|
| Your calls, emails, telegram | `private/` (personal GitHub) | Sensitive, personal |
| Your deals (default) | `private/` | Until explicitly shared |
| Your research | `private/` | Until explicitly shared |
| Shared deals | `shared/` (company GitHub) | Team collaboration |
| Shared calls | `shared/` | Team needs access |
| App code, skills, commands | App repo (public) | Open source |

---

## 9. Setup Wizard

### Server
- **Routes:** Added to `scripts/brief-server.ts` at `/setup/*`
- **Port:** 3847 (same server as brief, explorer, unstuck)
- **Tech:** Hono + React (reuse existing web-brief components/styles)

### Flow (8 Screens)

**Screen 1: Welcome**
- Intro text, "Get Started" button

**Screen 2: Check Dependencies**
- Detect: bun, Claude CLI, git
- For missing: offer auto-install (with consent) or show manual commands
- Skip option available

**Screen 3: Choose Vault Location**
- Default: `~/CybosVault`
- Browse button for custom path
- Shows what will be created

**Screen 4: Your Identity**
- Full Name (required)
- Short Name (required)
- Aliases (comma-separated)
- Brief description (2-3 sentences)

**Screen 5: API Keys (Optional)**
- Anthropic key (input + link to get)
- Perplexity key (input + link)
- Telegram API ID/Hash (inputs + link)
- "Add more keys" expander
- Skip button available
- **Note:** Keys saved to `.env` file in vault, not config JSON

**Screen 6: Git Backup & Sharing (Optional)**

*Personal Backup:*
- Checkbox: "Back up private data to GitHub"
- If enabled: Personal repo URL input
- Initializes git in `private/`, sets remote, creates `.gitignore`

*Team Sharing:*
- Radio: "Solo" vs "Join existing team" vs "Create new team"
- Join: Enter company repo URL, clone into `shared/`
- Create: Init git locally, user pushes to GitHub manually after setup

**Screen 7: Automations (Recommended)**
- Checkbox: Daily reindex (6am)
- Checkbox: Daily brief (8am)
- Installs launchd plists
- **Note:** If automations fail (missing API keys), they log warnings but don't spam

**Screen 8: Complete**
- Success message
- Shows vault path
- What to do next list
- "Open Claude Code" / "Close" buttons

### Pre-Setup Behavior (Auto-Launch)
If user runs any command before setup:
1. Detect missing `~/.cybos/config.json`
2. Auto-start brief-server if not running
3. Open browser to `http://localhost:3847/setup`
4. Command exits with message: "Setup wizard opened in browser"

This provides smooth onboarding - user doesn't need to manually start server.

---

## 10. SQLite Migration

Adopts the plan in `docs/v2_1_SQLITE-MIGRATION-PLAN.md` with these clarifications:

**Database location:** `~/CybosVault/private/.cybos/db/cybos.sqlite`

**Schema:** 5 tables, ~51 columns (70% reduction from Postgres)
- `entities` - People, companies, products, groups
- `entity_aliases` - Name deduplication
- `interactions` - Calls, emails, telegram
- `extracted_items` - Promises, actions, decisions, metrics
- `batch_runs` - Indexer execution logs

**Entity Resolution:** 3-stage (simplified from 5)
1. Exact email match
2. Exact telegram match
3. Fuzzy name match (Levenshtein in TypeScript)

**Full-Text Search:** FTS5 on `interactions.summary`

**Migration Strategy:** Full reindex from source files (no data migration from Postgres)

---

## 11. Shared Data Sync (GitHub)

### Sync Model
- GitHub private repo in `shared/`
- Manual sync script: pull → add → commit → push

### Script
**File:** `scripts/shared-sync.sh`

**Usage:**
```bash
./scripts/shared-sync.sh           # Full sync
./scripts/shared-sync.sh --status  # Show status only
./scripts/shared-sync.sh --pull    # Pull only
```

### Conflict Strategy
- Prefer append-only files (logs, transcripts)
- One folder per deal/call (atomic units)
- On conflict: show message, don't auto-resolve, let user decide

---

## 12. Implementation Stages

**Branch:** All work on `v2.1` branch, merge to master when complete.

### Stage 1: Vault Structure + Config System
**Deliverables:**
- Global config at `~/.cybos/config.json`
- Config read/write utilities
- Vault path resolution in all scripts
- Routing logic (default to private)
- Pre-setup error handling

**Files to create/modify:**
- `scripts/config.ts` - Config read/write, version migration
- `scripts/paths.ts` - Centralized path resolution (getVaultPath, getDbPath, etc.)
- All command files - Add config check, auto-launch wizard if missing
- Hook - Update to use vault paths via paths.ts

**Testing:**
- Config read/write works
- Config version migration works
- Commands auto-launch wizard if config missing
- Files written to correct vault location
- Works from any directory

### Stage 2: SQLite Migration
**Deliverables:**
- SQLite schema (`schema-sqlite.sql`)
- SQLite client (`client-sqlite.ts`)
- Migrated extractors (calls, emails, telegram, entities)
- Migrated query interface
- Updated CLI commands

**Files to modify:** See `docs/v2_1_SQLITE-MIGRATION-PLAN.md`

**Testing:**
- Reindex completes without errors
- Entity counts match expectations
- FTS search works
- Participant queries work
- Performance acceptable (< 60s reindex, < 100ms queries)

### Stage 3: Setup Wizard
**Deliverables:**
- Add `/setup/*` routes to `scripts/brief-server.ts`
- React wizard UI (`scripts/web-brief/src/pages/SetupWizard.tsx`)
- API endpoints for dependency detection, vault creation, config generation
- launchd automation setup with failure warning (not spam)
- `.env` file generation for API keys

**Testing:**
- Fresh install works end-to-end
- All wizard screens functional
- API keys saved to `.env`, not config JSON
- Automations install correctly (warn on failure, don't spam)
- Commands work immediately after setup

### Stage 4: Git Sync Tooling
**Deliverables:**
- `scripts/vault-sync.sh` - Consolidated sync for both vaults
- `private/.gitignore` template (excludes db/, cache/)
- `shared/README.md` documentation
- Move-to-share helper (move deal/research from private to shared)

**Testing:**
- Init git in private/ with correct .gitignore
- Clone shared repo from URL
- Sync both repos with single command
- Conflict detection and user-friendly messaging

---

## 13. Testing Requirements

### Stage 1 Tests
| Test | Input | Expected |
|------|-------|----------|
| Config read/write | Create config | `~/.cybos/config.json` exists |
| Missing config | Run command | Error with setup URL |
| Vault resolution | `~/CybosVault` | Expands correctly |
| File routing | Create entity | Written to `vault/private/` |
| Cross-directory | Run from `/tmp` | Still works |

### Stage 2 Tests
| Test | Input | Expected |
|------|-------|----------|
| Fresh reindex | `/cyber-reindex` | Completes, counts match |
| Entity matching | "Dima" → "Dima Khanarin" | Matches with score > 0.7 |
| FTS search | "AI infrastructure" | Returns interactions |
| Participant query | Find by person | Correct results |
| Performance | Full reindex | < 60 seconds |

### Stage 3 Tests
| Test | Input | Expected |
|------|-------|----------|
| Wizard flow | Complete all screens | Config + vault created |
| Dep install | Missing bun | Auto-install works |
| Skip API keys | Skip screen 5 | Setup still completes |
| Shared clone | Valid GitHub URL | Clones to `shared/` |

### Stage 4 Tests
| Test | Input | Expected |
|------|-------|----------|
| Private init | No git in `private/` | Initializes repo, sets remote |
| Private sync | Local changes | Push to personal GitHub succeeds |
| Shared clone | Valid GitHub URL | Clones to `shared/` |
| Shared sync | Local changes | Push to company GitHub succeeds |
| Pull changes | Remote has updates | Local updated for both repos |
| Conflict | Same file edited | Warning shown, user decides |

---

## 14. Agent Execution Protocol

All AI coding agents implementing this spec must:
- Work on `v2.1` branch exclusively
- Maintain comprehensive TodoWrite list
- Update todos after each significant change
- Run tests after each stage
- Update `docs/ARCHITECTURE.md` after each stage
- Update `SETUP.md` after each stage
- Document decisions and blockers in commit messages

---

## 15. Documentation Updates Required

After each stage, update:
- [ ] `docs/ARCHITECTURE.md` - System architecture
- [ ] `SETUP.md` - Installation/setup guide
- [ ] `README.md` - Overview if needed
- [ ] `CLAUDE.md` - If commands change

---

## 16. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Git conflicts in shared | Append-only logs, per-folder structure |
| SQLite parity gaps | Strict testing, count comparisons |
| Wizard complexity | Minimal MVP flow, add features later |
| Breaking existing users | Clear migration guide, not automated |
| API key security | `~/.cybos/` has user-only permissions |

---

## 17. Out of Scope for v2.1

These are explicitly deferred:
- Pipeline commands (`/cyber-intake`, `/cyber-fit-check`, etc.) → v2.2
- Data migration script → Users migrate manually
- Git LFS → Keep simple
- Multi-profile support → Future version
- Real-time sync → Manual script only
