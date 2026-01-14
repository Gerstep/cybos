#!/bin/bash
#
# morning-brief.sh - Orchestrator for morning brief generation and display
#
# This script:
# 1. Generates today's brief using Claude Code CLI
# 2. Ensures the brief server is running
# 3. Opens the browser to display the brief
#
# Usage:
#   ./scripts/morning-brief.sh           # Full flow: generate + serve + open
#   ./scripts/morning-brief.sh --skip-gen # Skip generation, just open browser
#   ./scripts/morning-brief.sh --server   # Just ensure server is running
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PORT=3847
SERVER_SCRIPT="$SCRIPT_DIR/brief-server.ts"
LOG_DIR="$PROJECT_DIR/.cybos/logs"
LOG_FILE="$LOG_DIR/morning-brief.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Logging function
log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $1" | tee -a "$LOG_FILE"
}

# Check if server is running on PORT
check_server() {
  lsof -i :$PORT >/dev/null 2>&1
}

# Start the server if not running
ensure_server() {
  if check_server; then
    log "Server already running on port $PORT"
    return 0
  fi

  log "Starting brief server on port $PORT..."

  # Start server in background, redirect output to log
  cd "$PROJECT_DIR"
  nohup bun "$SERVER_SCRIPT" >> "$LOG_FILE" 2>&1 &

  # Wait for server to be ready
  local max_attempts=10
  local attempt=0
  while [ $attempt -lt $max_attempts ]; do
    if check_server; then
      log "Server started successfully"
      return 0
    fi
    sleep 0.5
    attempt=$((attempt + 1))
  done

  log "ERROR: Failed to start server after $max_attempts attempts"
  return 1
}

# Generate brief using Claude Code CLI
generate_brief() {
  log "Generating today's morning brief..."

  cd "$PROJECT_DIR"

  # Check if claude CLI is available
  if ! command -v claude &> /dev/null; then
    log "ERROR: Claude Code CLI not found. Please install it first."
    log "  npm install -g @anthropic-ai/claude-code"
    return 1
  fi

  # Run the brief command
  # Using --print to just output the result, --dangerously-skip-permissions for automation
  local start_time=$(date +%s)

  if claude --print --dangerously-skip-permissions "/cyber-brief" >> "$LOG_FILE" 2>&1; then
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log "Brief generated successfully in ${duration}s"
    return 0
  else
    log "ERROR: Failed to generate brief"
    return 1
  fi
}

# Open browser to brief page
open_browser() {
  local url="http://localhost:$PORT?day=today"
  log "Opening browser to $url"

  # macOS-specific: use 'open' command
  if command -v open &> /dev/null; then
    open "$url"
  # Linux fallback
  elif command -v xdg-open &> /dev/null; then
    xdg-open "$url"
  else
    log "ERROR: No browser opener found (open/xdg-open)"
    log "Please open manually: $url"
    return 1
  fi
}

# Main execution
main() {
  log "=========================================="
  log "Morning Brief Orchestrator"
  log "=========================================="

  local skip_gen=false
  local server_only=false

  # Parse arguments
  while [[ "$#" -gt 0 ]]; do
    case $1 in
      --skip-gen) skip_gen=true ;;
      --server) server_only=true ;;
      -h|--help)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --skip-gen   Skip brief generation, just open browser"
        echo "  --server     Only ensure server is running (no generation, no browser)"
        echo "  -h, --help   Show this help message"
        exit 0
        ;;
      *) log "Unknown option: $1"; exit 1 ;;
    esac
    shift
  done

  # Server-only mode
  if [ "$server_only" = true ]; then
    ensure_server
    exit $?
  fi

  # Step 1: Generate brief (unless skipped)
  if [ "$skip_gen" = false ]; then
    if ! generate_brief; then
      log "Brief generation failed, but continuing to open browser..."
    fi
  else
    log "Skipping brief generation (--skip-gen)"
  fi

  # Step 2: Ensure server is running
  if ! ensure_server; then
    log "FATAL: Cannot start server, aborting"
    exit 1
  fi

  # Step 3: Open browser
  open_browser

  log "Morning brief ready!"
  log "=========================================="
}

main "$@"
