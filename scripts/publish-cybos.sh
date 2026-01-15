#!/bin/bash
#
# publish-cybos.sh - Publish to public cybos repository using WHITELIST approach
#
# SAFETY: Only explicitly listed files/folders are copied. Everything else stays private.
#
# Usage:
#   ./scripts/publish-cybos.sh [--dry-run]
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PUBLIC_DIR="$(dirname "$PROJECT_DIR")/cybos-public"
CYBOS_REMOTE="https://github.com/Gerstep/cybos.git"
DRY_RUN=false

if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "=== DRY RUN MODE ==="
fi

# WHITELIST: Only these paths will be copied (everything else is private)
SAFE_FILES=(
  "CLAUDE.md"
  "README.md"
  "package.json"
  "package-lock.json"
  "tsconfig.json"
  ".gitignore"
  ".env.example"
  ".nvmrc"
  ".mcp.json"
  "docs/ARCHITECTURE.md"
)

SAFE_DIRS=(
  ".claude"
  "config"
  "scripts"
)

# Safe context files (specific files only, not entire folders)
SAFE_CONTEXT_FILES=(
  "context/identity.md"
)

SAFE_CONTEXT_DIRS=(
  # none - all context subdirs are private
)

echo "=== Cybos Public Publisher (Whitelist Mode) ==="
echo "Source: $PROJECT_DIR"
echo "Target: $PUBLIC_DIR"
echo ""

# Ensure public dir exists and is a git repo
if [[ ! -d "$PUBLIC_DIR/.git" ]]; then
  echo "ERROR: $PUBLIC_DIR is not a git repo"
  echo "Run: mkdir -p $PUBLIC_DIR && cd $PUBLIC_DIR && git init && git remote add origin $CYBOS_REMOTE"
  exit 1
fi

cd "$PUBLIC_DIR"

# Clean everything except .git
echo "[1/5] Cleaning public directory..."
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} \;

# Copy safe root files
echo "[2/5] Copying safe files..."
for file in "${SAFE_FILES[@]}"; do
  if [[ -f "$PROJECT_DIR/$file" ]]; then
    # Create parent directory if needed
    mkdir -p "$PUBLIC_DIR/$(dirname "$file")"
    cp "$PROJECT_DIR/$file" "$PUBLIC_DIR/$file"
    echo "  + $file"
  fi
done

# Copy safe directories
echo "[3/5] Copying safe directories..."
for dir in "${SAFE_DIRS[@]}"; do
  if [[ -d "$PROJECT_DIR/$dir" ]]; then
    cp -r "$PROJECT_DIR/$dir" "$PUBLIC_DIR/$dir"
    echo "  + $dir/"
  fi
done

# Copy safe context files
echo "[4/5] Copying safe context files..."
mkdir -p "$PUBLIC_DIR/context"
for file in "${SAFE_CONTEXT_FILES[@]}"; do
  if [[ -f "$PROJECT_DIR/$file" ]]; then
    cp "$PROJECT_DIR/$file" "$PUBLIC_DIR/$file"
    echo "  + $file"
  fi
done

for dir in "${SAFE_CONTEXT_DIRS[@]}"; do
  if [[ -d "$PROJECT_DIR/$dir" ]]; then
    cp -r "$PROJECT_DIR/$dir" "$PUBLIC_DIR/$dir"
    echo "  + $dir/"
  fi
done

# Create empty folder structure with .gitkeep
echo "[5/5] Creating folder structure..."
for dir in deals dealflow projects research \
  content/briefs content/essays content/ideas content/images content/posts content/tweets content/work \
  context/calls context/emails context/entities context/entities/orgs context/entities/people \
  context/telegram context/style context/img-styles context/unstuck .cybos/logs; do
  mkdir -p "$PUBLIC_DIR/$dir"
  touch "$PUBLIC_DIR/$dir/.gitkeep"
done

# Add template GTD.md
echo "# Next" > "$PUBLIC_DIR/GTD.md"

# Remove any .mcp.json that might have been copied
rm -f "$PUBLIC_DIR/.mcp.json"

# Show what will be published
echo ""
echo "=== Files to publish ==="
find . -type f ! -path './.git/*' | sort
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
  echo "=== DRY RUN - Not pushing ==="
  exit 0
fi

# Commit and push
git add -A
if git diff --staged --quiet; then
  echo "No changes to publish"
else
  git commit -m "Update from private repo (whitelist publish)"
  git push origin main
  echo ""
  echo "=== Published to: $CYBOS_REMOTE ==="
fi
