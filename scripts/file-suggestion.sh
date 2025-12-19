#!/bin/bash
# Custom file suggestion for Claude Code @ autocomplete
# Includes both project directory and CybosVault

query=$(cat | jq -r '.query')
CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# Search working directory first, then vault
(
  # Project files
  cd "$CLAUDE_PROJECT_DIR" 2>/dev/null && \
    find . -type f -name "*$query*" 2>/dev/null | \
    grep -v node_modules | grep -v '.git/' | \
    sed 's|^\./||' | head -10

  # Vault files (shown as vault/... to match symlink)
  find ~/CybosVault -type f -name "*$query*" 2>/dev/null | \
    grep -v '.git/' | \
    sed "s|$HOME/CybosVault/|vault/|" | head -10
) | sort -u | head -15
