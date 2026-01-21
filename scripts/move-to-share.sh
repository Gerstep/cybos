#!/bin/bash
#
# Move to Share - Move deal or research from private to shared vault
#
# Usage:
#   ./scripts/move-to-share.sh deal <company-slug>
#   ./scripts/move-to-share.sh research <topic-slug>
#
# Examples:
#   ./scripts/move-to-share.sh deal acme-corp
#   ./scripts/move-to-share.sh research ai-market-2025
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
  echo -e "${BLUE}[move-to-share]${NC} $1"
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

  if command -v jq &> /dev/null; then
    VAULT_PATH=$(jq -r '.vault_path' "$CONFIG_PATH" | sed "s|^~|$HOME|")
    SHARED_ENABLED=$(jq -r '.shared.enabled // false' "$CONFIG_PATH")
  else
    VAULT_PATH=$(grep -o '"vault_path"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_PATH" | sed 's/.*"vault_path"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/' | sed "s|^~|$HOME|")
    SHARED_ENABLED=$(grep -o '"enabled"[[:space:]]*:[[:space:]]*[a-z]*' "$CONFIG_PATH" | tail -1 | sed 's/.*:[[:space:]]*//')
  fi

  PRIVATE_DIR="$VAULT_PATH/private"
  SHARED_DIR="$VAULT_PATH/shared"
}

# ===== MAIN =====

# Check arguments
if [[ $# -lt 2 ]]; then
  echo "Usage: move-to-share.sh <type> <slug>"
  echo ""
  echo "Types:"
  echo "  deal      Move a deal folder"
  echo "  research  Move a research folder"
  echo ""
  echo "Examples:"
  echo "  ./scripts/move-to-share.sh deal acme-corp"
  echo "  ./scripts/move-to-share.sh research ai-market-2025"
  exit 1
fi

TYPE="$1"
SLUG="$2"

# Validate type
if [[ "$TYPE" != "deal" && "$TYPE" != "research" ]]; then
  error "Invalid type: $TYPE. Use 'deal' or 'research'."
fi

# Load config
load_config

# Check shared is enabled
if [[ "$SHARED_ENABLED" != "true" ]]; then
  error "Shared vault is not enabled. Configure it in the setup wizard first."
fi

# Determine paths
if [[ "$TYPE" == "deal" ]]; then
  SOURCE_PATH="$PRIVATE_DIR/deals/$SLUG"
  DEST_PATH="$SHARED_DIR/deals/$SLUG"
  ITEM_TYPE="Deal"
else
  SOURCE_PATH="$PRIVATE_DIR/research/$SLUG"
  DEST_PATH="$SHARED_DIR/research/$SLUG"
  ITEM_TYPE="Research"
fi

# Validate source exists
if [[ ! -d "$SOURCE_PATH" ]]; then
  error "$ITEM_TYPE not found: $SOURCE_PATH"
fi

# Check destination doesn't exist
if [[ -d "$DEST_PATH" ]]; then
  error "$ITEM_TYPE already exists in shared: $DEST_PATH"
fi

# Show what will be moved
echo ""
log "Moving $ITEM_TYPE: $SLUG"
echo ""
echo "From: $SOURCE_PATH"
echo "To:   $DEST_PATH"
echo ""

# Confirm
read -p "Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Cancelled."
  exit 0
fi

# Create destination directory
mkdir -p "$(dirname "$DEST_PATH")"

# Move the folder
mv "$SOURCE_PATH" "$DEST_PATH"

success "Moved $ITEM_TYPE to shared vault"
echo ""

# Remind to sync
log "Don't forget to sync: ./scripts/vault-sync.sh shared"
