#!/bin/bash
#
# reindex.sh - Run the cyber-reindex command via Claude CLI
#
# This script:
# 1. Finds the claude CLI dynamically (works across different installs)
# 2. Runs /cyber-reindex to rebuild the context graph database
#
# Usage:
#   ./scripts/reindex.sh           # Run reindex
#   ./scripts/reindex.sh --status  # Check database status
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Source the log path helper to get VAULT_LOG_DIR
source "$SCRIPT_DIR/get-log-path.sh"
LOG_DIR="$VAULT_LOG_DIR"
LOG_FILE="$LOG_DIR/reindex.log"

# Logging function
log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $1" | tee -a "$LOG_FILE"
}

# Find claude CLI
find_claude() {
  # Check common locations in order of preference
  local candidates=(
    "$(command -v claude 2>/dev/null)"
    "/usr/local/bin/claude"
    "$HOME/.local/bin/claude"
    "$HOME/.npm-global/bin/claude"
  )

  for candidate in "${candidates[@]}"; do
    if [ -n "$candidate" ] && [ -x "$candidate" ]; then
      echo "$candidate"
      return 0
    fi
  done

  return 1
}

# Run reindex
run_reindex() {
  local args="${1:-}"

  log "=========================================="
  log "Cybos Reindex"
  log "=========================================="

  cd "$PROJECT_DIR"

  # Find claude CLI
  local claude_bin
  if ! claude_bin=$(find_claude); then
    log "ERROR: Claude Code CLI not found. Please install it first."
    log "  npm install -g @anthropic-ai/claude-code"
    exit 1
  fi

  log "Using Claude CLI: $claude_bin"
  log "Working directory: $PROJECT_DIR"

  # Build command
  local cmd="/cyber-reindex"
  if [ "$args" = "--status" ]; then
    cmd="/cyber-reindex --status"
  fi

  # Run the reindex command
  local start_time=$(date +%s)

  if "$claude_bin" --print --dangerously-skip-permissions "$cmd" >> "$LOG_FILE" 2>&1; then
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log "Reindex completed successfully in ${duration}s"
    return 0
  else
    log "ERROR: Reindex failed"
    return 1
  fi
}

# Main
main() {
  run_reindex "$@"
}

main "$@"
