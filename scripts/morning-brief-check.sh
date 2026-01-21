#!/bin/bash
#
# morning-brief-check.sh - Boot-time brief checker
#
# This script runs at system startup and checks if today's brief exists.
# If not, it generates the brief without opening the browser.
#
# This ensures that even if you restart after 8 AM, you still get today's brief.
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BRIEFS_DIR="$PROJECT_DIR/content/briefs"
LOG_DIR="$PROJECT_DIR/.cybos/logs"
LOG_FILE="$LOG_DIR/morning-brief-check.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Get today's brief filename
TODAY=$(date '+%m%d-%y')
BRIEF_PATH="$BRIEFS_DIR/${TODAY}.md"

# Logging function
log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "Morning Brief Boot Check"
log "=========================================="

# Check if today's brief already exists
if [ -f "$BRIEF_PATH" ]; then
  log "Today's brief already exists: $BRIEF_PATH"
  log "Skipping generation."
  exit 0
fi

log "Today's brief not found. Generating..."

# Wait a bit for network and services to be ready after boot
sleep 5

# Run morning-brief.sh with --skip-gen flag initially (just ensure server)
# Then immediately run the generation
cd "$PROJECT_DIR"

# Check if claude CLI is available
if ! command -v claude &> /dev/null; then
  log "ERROR: Claude Code CLI not found. Skipping generation."
  log "Brief will be generated at 8:00 AM scheduled run."
  exit 1
fi

# Generate brief using Claude Code
log "Running /cyber-brief command..."
if claude --print --dangerously-skip-permissions "/cyber-brief" >> "$LOG_FILE" 2>&1; then
  log "Brief generated successfully: $BRIEF_PATH"
else
  log "ERROR: Failed to generate brief"
  exit 1
fi

log "Boot check complete."
log "=========================================="
