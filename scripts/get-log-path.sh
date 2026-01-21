#!/bin/bash
#
# get-log-path.sh - Resolve vault log directory path
#
# This script reads the Cybos config and exports VAULT_LOG_DIR.
# Source this file from other shell scripts to get consistent log paths.
#
# Usage:
#   source "$(dirname "$0")/get-log-path.sh"
#   echo "Logs go to: $VAULT_LOG_DIR"
#

CONFIG_FILE="$HOME/.cybos/config.json"

if [[ -f "$CONFIG_FILE" ]]; then
  # Extract vault_path from JSON config (simple grep/sed, no jq dependency)
  VAULT_PATH=$(grep '"vault_path"' "$CONFIG_FILE" | sed 's/.*: *"\([^"]*\)".*/\1/' | sed "s|~|$HOME|")
  export VAULT_LOG_DIR="$VAULT_PATH/private/.cybos/logs"
else
  # Fallback to default vault location
  export VAULT_LOG_DIR="$HOME/CybosVault/private/.cybos/logs"
fi

# Ensure the directory exists
mkdir -p "$VAULT_LOG_DIR"
