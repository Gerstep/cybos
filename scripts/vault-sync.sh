#!/bin/bash
#
# Vault Sync - Sync private and/or shared vault to GitHub
#
# Usage:
#   ./scripts/vault-sync.sh [private|shared|all] [--status|--pull]
#
# Examples:
#   ./scripts/vault-sync.sh                 # Sync both vaults
#   ./scripts/vault-sync.sh private         # Sync private vault only
#   ./scripts/vault-sync.sh shared          # Sync shared vault only
#   ./scripts/vault-sync.sh --status        # Show status of both repos
#   ./scripts/vault-sync.sh private --pull  # Pull private only (no push)
#

set -e

# ===== CONFIGURATION =====

CONFIG_PATH="$HOME/.cybos/config.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===== HELPERS =====

log() {
  echo -e "${BLUE}[vault-sync]${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1"
  exit 1
}

# Load config
load_config() {
  if [[ ! -f "$CONFIG_PATH" ]]; then
    error "Config not found at $CONFIG_PATH. Run setup wizard first."
  fi

  # Parse JSON config using jq if available, otherwise use grep/sed
  if command -v jq &> /dev/null; then
    VAULT_PATH=$(jq -r '.vault_path' "$CONFIG_PATH" | sed "s|^~|$HOME|")
    PRIVATE_GIT_ENABLED=$(jq -r '.private.git_enabled // false' "$CONFIG_PATH")
    PRIVATE_REPO_URL=$(jq -r '.private.repo_url // ""' "$CONFIG_PATH")
    SHARED_ENABLED=$(jq -r '.shared.enabled // false' "$CONFIG_PATH")
    SHARED_REPO_URL=$(jq -r '.shared.repo_url // ""' "$CONFIG_PATH")
  else
    # Fallback: basic grep/sed parsing
    VAULT_PATH=$(grep -o '"vault_path"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_PATH" | sed 's/.*"vault_path"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/' | sed "s|^~|$HOME|")
    PRIVATE_GIT_ENABLED=$(grep -o '"git_enabled"[[:space:]]*:[[:space:]]*[a-z]*' "$CONFIG_PATH" | head -1 | sed 's/.*:[[:space:]]*//')
    PRIVATE_REPO_URL=$(grep -o '"repo_url"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_PATH" | head -1 | sed 's/.*"repo_url"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    SHARED_ENABLED=$(grep -o '"enabled"[[:space:]]*:[[:space:]]*[a-z]*' "$CONFIG_PATH" | tail -1 | sed 's/.*:[[:space:]]*//')
    SHARED_REPO_URL=$(grep -o '"repo_url"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_PATH" | tail -1 | sed 's/.*"repo_url"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
  fi

  PRIVATE_DIR="$VAULT_PATH/private"
  SHARED_DIR="$VAULT_PATH/shared"
}

# Check if directory is a git repo
is_git_repo() {
  local dir="$1"
  [[ -d "$dir/.git" ]]
}

# Initialize git repo if needed
init_repo() {
  local dir="$1"
  local remote_url="$2"
  local name="$3"

  if [[ ! -d "$dir" ]]; then
    mkdir -p "$dir"
  fi

  cd "$dir"

  if ! is_git_repo "$dir"; then
    log "Initializing git repo in $name..."
    git init

    if [[ -n "$remote_url" && "$remote_url" != "null" ]]; then
      git remote add origin "$remote_url"
      success "Git repo initialized with remote: $remote_url"
    else
      success "Git repo initialized (no remote)"
    fi
  fi
}

# Sync a single vault
sync_vault() {
  local dir="$1"
  local name="$2"
  local pull_only="$3"

  if [[ ! -d "$dir" ]]; then
    warn "$name directory not found: $dir"
    return
  fi

  cd "$dir"

  if ! is_git_repo "$dir"; then
    warn "$name is not a git repo. Run setup wizard to configure."
    return
  fi

  # Check if remote is configured
  if ! git remote get-url origin &> /dev/null; then
    warn "$name has no remote configured. Skipping sync."
    return
  fi

  log "Syncing $name..."

  # Fetch latest
  git fetch origin 2>/dev/null || {
    warn "Failed to fetch from remote. Check your connection or credentials."
    return
  }

  # Check for local changes
  local has_changes=false
  if [[ -n $(git status --porcelain) ]]; then
    has_changes=true
  fi

  # Pull if remote has changes
  local local_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  local remote_ref="origin/$local_branch"

  if git rev-parse "$remote_ref" &> /dev/null; then
    local local_commit=$(git rev-parse HEAD 2>/dev/null || echo "")
    local remote_commit=$(git rev-parse "$remote_ref" 2>/dev/null || echo "")

    if [[ "$local_commit" != "$remote_commit" ]]; then
      log "Pulling changes from $remote_ref..."

      # Stash local changes if any
      if $has_changes; then
        git stash push -m "vault-sync auto-stash"
      fi

      git pull --rebase origin "$local_branch" || {
        error "Pull failed. Please resolve conflicts manually in $dir"
      }

      # Pop stash if we stashed
      if $has_changes; then
        git stash pop || warn "Failed to restore stashed changes"
      fi

      success "Pulled latest changes"
    fi
  fi

  # Push if we have local commits and not pull-only mode
  if [[ "$pull_only" != "true" ]] && $has_changes; then
    log "Pushing local changes..."

    # Stage all changes
    git add -A

    # Commit with timestamp
    local timestamp=$(date +"%Y-%m-%d %H:%M")
    git commit -m "Vault sync: $timestamp" || true

    # Push
    git push origin "$local_branch" || {
      error "Push failed. Please check your credentials or permissions."
    }

    success "Pushed local changes"
  elif [[ "$pull_only" == "true" ]]; then
    success "Pull complete (push skipped)"
  else
    success "$name is up to date"
  fi
}

# Show status of vaults
show_status() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║                    VAULT SYNC STATUS                        ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""

  # Private vault status
  echo -e "${BLUE}Private Vault:${NC} $PRIVATE_DIR"
  if [[ -d "$PRIVATE_DIR" ]]; then
    if is_git_repo "$PRIVATE_DIR"; then
      cd "$PRIVATE_DIR"
      local branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
      local status_count=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
      local remote=$(git remote get-url origin 2>/dev/null || echo "no remote")

      echo "  Branch: $branch"
      echo "  Remote: $remote"
      echo "  Changes: $status_count files"

      if [[ "$status_count" -gt 0 ]]; then
        git status --short 2>/dev/null | head -5 | sed 's/^/    /'
        if [[ "$status_count" -gt 5 ]]; then
          echo "    ... and $((status_count - 5)) more"
        fi
      fi
    else
      echo "  Status: Not a git repository"
    fi
  else
    echo "  Status: Directory not found"
  fi

  echo ""

  # Shared vault status
  echo -e "${BLUE}Shared Vault:${NC} $SHARED_DIR"
  if [[ "$SHARED_ENABLED" == "true" ]]; then
    if [[ -d "$SHARED_DIR" ]]; then
      if is_git_repo "$SHARED_DIR"; then
        cd "$SHARED_DIR"
        local branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        local status_count=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        local remote=$(git remote get-url origin 2>/dev/null || echo "no remote")

        echo "  Branch: $branch"
        echo "  Remote: $remote"
        echo "  Changes: $status_count files"

        if [[ "$status_count" -gt 0 ]]; then
          git status --short 2>/dev/null | head -5 | sed 's/^/    /'
          if [[ "$status_count" -gt 5 ]]; then
            echo "    ... and $((status_count - 5)) more"
          fi
        fi
      else
        echo "  Status: Not a git repository"
      fi
    else
      echo "  Status: Directory not found"
    fi
  else
    echo "  Status: Shared vault not enabled"
  fi

  echo ""
}

# ===== MAIN =====

# Parse arguments
TARGET="all"
PULL_ONLY="false"
STATUS_ONLY="false"

for arg in "$@"; do
  case $arg in
    private|shared|all)
      TARGET="$arg"
      ;;
    --status)
      STATUS_ONLY="true"
      ;;
    --pull)
      PULL_ONLY="true"
      ;;
    --help|-h)
      echo "Usage: vault-sync.sh [private|shared|all] [--status|--pull]"
      echo ""
      echo "Targets:"
      echo "  private   Sync private vault only"
      echo "  shared    Sync shared vault only"
      echo "  all       Sync both vaults (default)"
      echo ""
      echo "Options:"
      echo "  --status  Show status of both repos (no sync)"
      echo "  --pull    Pull only, don't push changes"
      echo "  --help    Show this help"
      exit 0
      ;;
  esac
done

# Load config
load_config

# Show status if requested
if [[ "$STATUS_ONLY" == "true" ]]; then
  show_status
  exit 0
fi

# Sync based on target
echo ""
log "Starting vault sync..."
echo ""

case $TARGET in
  private)
    if [[ "$PRIVATE_GIT_ENABLED" == "true" ]]; then
      sync_vault "$PRIVATE_DIR" "Private" "$PULL_ONLY"
    else
      warn "Private vault git is not enabled in config"
    fi
    ;;
  shared)
    if [[ "$SHARED_ENABLED" == "true" ]]; then
      sync_vault "$SHARED_DIR" "Shared" "$PULL_ONLY"
    else
      warn "Shared vault is not enabled in config"
    fi
    ;;
  all)
    if [[ "$PRIVATE_GIT_ENABLED" == "true" ]]; then
      sync_vault "$PRIVATE_DIR" "Private" "$PULL_ONLY"
    else
      log "Private vault git not enabled, skipping"
    fi

    echo ""

    if [[ "$SHARED_ENABLED" == "true" ]]; then
      sync_vault "$SHARED_DIR" "Shared" "$PULL_ONLY"
    else
      log "Shared vault not enabled, skipping"
    fi
    ;;
esac

echo ""
success "Vault sync complete!"
