#!/bin/bash
# Custom file suggestion for Claude Code @ autocomplete
# Includes both project directory and CybosVault
# Searches both file names AND directory names (returns files within matching dirs)

query=$(cat | jq -r '.query')
CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# Search working directory first, then vault
(
  # Project files (by filename)
  cd "$CLAUDE_PROJECT_DIR" 2>/dev/null && \
    find . -type f -name "*$query*" 2>/dev/null | \
    grep -v node_modules | grep -v '.git/' | \
    sed 's|^\./||' | head -10

  # Project files (by directory name - find files in matching dirs)
  cd "$CLAUDE_PROJECT_DIR" 2>/dev/null && \
    find . -type d -name "*$query*" 2>/dev/null | \
    grep -v node_modules | grep -v '.git/' | \
    while read dir; do find "$dir" -maxdepth 1 -type f 2>/dev/null; done | \
    sed 's|^\./||' | head -5

  # Vault files (by filename)
  find ~/CybosVault -type f -name "*$query*" 2>/dev/null | \
    grep -v '.git/' | \
    sed "s|$HOME/CybosVault/|vault/|" | head -10

  # Vault files (by directory name - find files in matching dirs)
  find ~/CybosVault -type d -name "*$query*" 2>/dev/null | \
    grep -v '.git/' | \
    while read dir; do find "$dir" -maxdepth 1 -type f 2>/dev/null; done | \
    sed "s|$HOME/CybosVault/|vault/|" | head -5
) | sort -u | head -15
