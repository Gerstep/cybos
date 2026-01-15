#!/bin/bash
#
# install-brief.sh - Install and configure the morning brief system
#
# This script:
# 1. Installs dependencies for the React web app
# 2. Builds the React app
# 3. Creates necessary directories
# 4. Installs launchd agents for:
#    - Brief server daemon (always running)
#    - Morning brief trigger (8am daily)
#
# Usage:
#   ./scripts/install-brief.sh           # Full install
#   ./scripts/install-brief.sh --uninstall # Remove launchd agents
#   ./scripts/install-brief.sh --status   # Check status
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LAUNCHD_DIR="$HOME/Library/LaunchAgents"
CONFIG_LAUNCHD="$PROJECT_DIR/config/launchd"
WEB_APP_DIR="$SCRIPT_DIR/web-brief"
LOG_DIR="$PROJECT_DIR/.cybos/logs"
BRIEFS_DIR="$PROJECT_DIR/content/briefs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."

  # Check bun
  if ! command -v bun &> /dev/null; then
    log_error "bun is not installed. Please install it first:"
    log_error "  curl -fsSL https://bun.sh/install | bash"
    exit 1
  fi
  log_success "bun found: $(bun --version)"

  # Check claude CLI
  if ! command -v claude &> /dev/null; then
    log_warn "Claude Code CLI not found. Brief generation won't work."
    log_warn "Install with: npm install -g @anthropic-ai/claude-code"
  else
    log_success "Claude CLI found"
  fi
}

# Create required directories
create_directories() {
  log_info "Creating directories..."

  mkdir -p "$LOG_DIR"
  mkdir -p "$BRIEFS_DIR"
  mkdir -p "$LAUNCHD_DIR"

  log_success "Directories created"
}

# Build web app
build_web_app() {
  log_info "Building web app..."

  cd "$WEB_APP_DIR"

  # Install dependencies
  log_info "Installing dependencies..."
  bun install --silent

  # Build
  log_info "Running build..."
  bun run build

  log_success "Web app built successfully"
}

# Install launchd agents
install_launchd() {
  log_info "Installing launchd agents..."

  local agents=(
    "com.cybos.brief-server"
    "com.cybos.morning-brief"
  )

  for agent in "${agents[@]}"; do
    local src="$CONFIG_LAUNCHD/${agent}.plist"
    local dst="$LAUNCHD_DIR/${agent}.plist"

    if [ ! -f "$src" ]; then
      log_error "Plist not found: $src"
      continue
    fi

    # Unload if already loaded
    if launchctl list | grep -q "$agent"; then
      log_info "Unloading existing $agent..."
      launchctl unload "$dst" 2>/dev/null || true
    fi

    # Copy plist (symlinks don't work well with launchd)
    cp "$src" "$dst"

    # Load agent
    launchctl load "$dst"

    log_success "Installed and loaded: $agent"
  done
}

# Uninstall launchd agents
uninstall_launchd() {
  log_info "Uninstalling launchd agents..."

  local agents=(
    "com.cybos.brief-server"
    "com.cybos.morning-brief"
  )

  for agent in "${agents[@]}"; do
    local plist="$LAUNCHD_DIR/${agent}.plist"

    if [ -f "$plist" ]; then
      if launchctl list | grep -q "$agent"; then
        launchctl unload "$plist" 2>/dev/null || true
      fi
      rm "$plist"
      log_success "Removed: $agent"
    else
      log_warn "Not installed: $agent"
    fi
  done
}

# Check status
check_status() {
  log_info "Checking status..."

  echo ""
  echo "=== LaunchAgents ==="

  local agents=(
    "com.cybos.brief-server"
    "com.cybos.morning-brief"
  )

  for agent in "${agents[@]}"; do
    local plist="$LAUNCHD_DIR/${agent}.plist"

    if [ -f "$plist" ]; then
      if launchctl list | grep -q "$agent"; then
        local pid=$(launchctl list | grep "$agent" | awk '{print $1}')
        if [ "$pid" = "-" ]; then
          echo -e "  ${YELLOW}$agent${NC}: installed, not running"
        else
          echo -e "  ${GREEN}$agent${NC}: running (PID: $pid)"
        fi
      else
        echo -e "  ${YELLOW}$agent${NC}: installed, not loaded"
      fi
    else
      echo -e "  ${RED}$agent${NC}: not installed"
    fi
  done

  echo ""
  echo "=== Server Status ==="
  if lsof -i :3847 >/dev/null 2>&1; then
    echo -e "  ${GREEN}Port 3847${NC}: in use (server running)"
  else
    echo -e "  ${RED}Port 3847${NC}: not in use"
  fi

  echo ""
  echo "=== Web App ==="
  if [ -d "$WEB_APP_DIR/dist" ]; then
    echo -e "  ${GREEN}Build${NC}: exists"
  else
    echo -e "  ${RED}Build${NC}: not found"
  fi

  echo ""
  echo "=== Recent Briefs ==="
  if [ -d "$BRIEFS_DIR" ]; then
    local count=$(ls -1 "$BRIEFS_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -gt 0 ]; then
      echo -e "  Found $count brief(s)"
      ls -lt "$BRIEFS_DIR"/*.md 2>/dev/null | head -3 | while read line; do
        echo "  $line"
      done
    else
      echo -e "  ${YELLOW}No briefs found${NC}"
    fi
  else
    echo -e "  ${RED}Briefs directory not found${NC}"
  fi

  echo ""
  echo "=== URLs ==="
  echo "  Web UI: http://localhost:3847"
  echo "  Today: http://localhost:3847?day=today"
  echo "  API Health: http://localhost:3847/api/health"
}

# Main
main() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║           Morning Brief System Installer                   ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""

  case "${1:-}" in
    --uninstall)
      uninstall_launchd
      log_success "Uninstall complete"
      ;;
    --status)
      check_status
      ;;
    --help|-h)
      echo "Usage: $0 [OPTION]"
      echo ""
      echo "Options:"
      echo "  (none)       Full installation"
      echo "  --uninstall  Remove launchd agents"
      echo "  --status     Check installation status"
      echo "  -h, --help   Show this help"
      ;;
    *)
      check_prerequisites
      create_directories
      build_web_app
      install_launchd

      echo ""
      log_success "Installation complete!"
      echo ""
      echo "What's next:"
      echo "  1. The brief server is now running on http://localhost:3847"
      echo "  2. Every day at 8:00 AM, a new brief will be generated"
      echo "  3. Run '/cyber-brief' manually to generate a brief now"
      echo "  4. Run './scripts/morning-brief.sh --skip-gen' to open browser"
      echo ""
      echo "Check status anytime with: $0 --status"
      ;;
  esac
}

main "$@"
