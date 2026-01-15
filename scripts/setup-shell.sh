#!/bin/bash
#
# Cybos Shell Setup
# Configures environment variables for Claude Code MCP servers
#
# Supported: zsh (macOS/Linux), bash (with limitations)
# Usage: ./scripts/setup-shell.sh [--direnv]
#
# Options:
#   --direnv    Use direnv instead of shell integration (recommended for bash)
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script lives (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Parse arguments
USE_DIRENV=false
for arg in "$@"; do
    case $arg in
        --direnv)
            USE_DIRENV=true
            shift
            ;;
    esac
done

echo "Cybos Shell Setup"
echo "===================="
echo ""
echo "Project directory: $PROJECT_DIR"
echo ""

# Check if .env exists
if [[ ! -f "$PROJECT_DIR/.env" ]]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo "Creating from .env.example..."
    if [[ -f "$PROJECT_DIR/.env.example" ]]; then
        cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
        echo -e "${YELLOW}Created .env - please edit it with your API keys${NC}"
        echo ""
    else
        echo -e "${RED}Error: .env.example not found${NC}"
        exit 1
    fi
fi

# ============================================================================
# DIRENV SETUP (--direnv flag or fallback for bash)
# ============================================================================

setup_direnv() {
    echo -e "${BLUE}Setting up direnv...${NC}"

    # Check if direnv is installed
    if ! command -v direnv &> /dev/null; then
        echo -e "${YELLOW}direnv not found. Installing...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if command -v brew &> /dev/null; then
                brew install direnv
            else
                echo -e "${RED}Please install Homebrew first: https://brew.sh${NC}"
                exit 1
            fi
        elif command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y direnv
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y direnv
        else
            echo -e "${RED}Please install direnv manually: https://direnv.net/docs/installation.html${NC}"
            exit 1
        fi
    fi

    # Create .envrc
    echo "dotenv" > "$PROJECT_DIR/.envrc"
    echo -e "${GREEN}Created .envrc${NC}"

    # Add direnv hook to shell config
    SHELL_NAME=$(basename "$SHELL")
    case "$SHELL_NAME" in
        zsh)
            SHELL_RC="$HOME/.zshrc"
            HOOK='eval "$(direnv hook zsh)"'
            ;;
        bash)
            if [[ "$OSTYPE" == "darwin"* ]]; then
                SHELL_RC="$HOME/.bash_profile"
            else
                SHELL_RC="$HOME/.bashrc"
            fi
            HOOK='eval "$(direnv hook bash)"'
            ;;
        fish)
            SHELL_RC="$HOME/.config/fish/config.fish"
            HOOK='direnv hook fish | source'
            ;;
        *)
            echo -e "${YELLOW}Please add direnv hook to your shell manually${NC}"
            SHELL_RC=""
            ;;
    esac

    if [[ -n "$SHELL_RC" ]]; then
        if ! grep -q "direnv hook" "$SHELL_RC" 2>/dev/null; then
            echo "" >> "$SHELL_RC"
            echo "# direnv - auto-load .envrc files" >> "$SHELL_RC"
            echo "$HOOK" >> "$SHELL_RC"
            echo -e "${GREEN}Added direnv hook to $SHELL_RC${NC}"
        else
            echo -e "${GREEN}direnv hook already in $SHELL_RC${NC}"
        fi
    fi

    # Allow the .envrc
    cd "$PROJECT_DIR" && direnv allow

    echo ""
    echo -e "${GREEN}direnv setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: source $SHELL_RC"
    echo "  2. cd to $PROJECT_DIR (direnv will auto-load .env)"
    echo "  3. Run: claude"
}

# ============================================================================
# SHELL INTEGRATION SETUP (default for zsh)
# ============================================================================

setup_shell_integration() {
    # Detect shell
    SHELL_NAME=$(basename "$SHELL")

    case "$SHELL_NAME" in
        zsh)
            # .zshenv is loaded for ALL zsh invocations (interactive, non-interactive, scripts)
            # This ensures Claude Code gets env vars even when launched from Spotlight/IDE
            SHELL_ENV="$HOME/.zshenv"
            SHELL_RC="$HOME/.zshrc"
            FULL_SUPPORT=true
            ;;
        bash)
            # IMPORTANT: bash has no equivalent to .zshenv
            # .bash_profile only loads for login shells
            # .bashrc only loads for interactive shells
            # Claude Code launched from GUI/IDE won't get these env vars!
            if [[ "$OSTYPE" == "darwin"* ]]; then
                SHELL_ENV="$HOME/.bash_profile"
            else
                SHELL_ENV="$HOME/.bashrc"
            fi
            SHELL_RC="$SHELL_ENV"
            FULL_SUPPORT=false
            ;;
        *)
            echo -e "${RED}Unsupported shell: $SHELL_NAME${NC}"
            echo ""
            echo "Options:"
            echo "  1. Use direnv: ./scripts/setup-shell.sh --direnv"
            echo "  2. Manually source .env before running claude"
            exit 1
            ;;
    esac

    echo "Detected shell: $SHELL_NAME"
    echo "Env file: $SHELL_ENV"

    # Warn about bash limitations
    if [[ "$FULL_SUPPORT" == "false" ]]; then
        echo ""
        echo -e "${YELLOW}⚠️  WARNING: bash has limited support${NC}"
        echo ""
        echo "bash doesn't have an equivalent to zsh's .zshenv file."
        echo "Env vars will load for terminal sessions but NOT when Claude Code"
        echo "is launched from GUI, Spotlight, or IDE."
        echo ""
        echo "Recommended alternatives:"
        echo "  1. Use direnv: ./scripts/setup-shell.sh --direnv"
        echo "  2. Switch to zsh: chsh -s /bin/zsh"
        echo "  3. Always launch claude from terminal (not GUI)"
        echo ""
        read -p "Continue with limited bash support? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Setup cancelled. Try: ./scripts/setup-shell.sh --direnv"
            exit 0
        fi
    fi
    echo ""

    # The marker we use to identify our block
    MARKER="# >>> cybos env loader >>>"
    MARKER_END="# <<< cybos env loader <<<"

    # Check if already installed (check both files for cleanup)
    for check_file in "$SHELL_ENV" "$SHELL_RC"; do
        if [[ -f "$check_file" ]] && grep -q "$MARKER" "$check_file" 2>/dev/null; then
            echo -e "${YELLOW}Removing old installation from $check_file...${NC}"
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "/$MARKER/,/$MARKER_END/d" "$check_file"
            else
                sed -i "/$MARKER/,/$MARKER_END/d" "$check_file"
            fi
        fi
    done

    # Create the shell integration block
    SHELL_BLOCK="$MARKER
# Auto-load Cybos .env for Claude Code MCP servers
# Installed by: $PROJECT_DIR/scripts/setup-shell.sh

if [[ -f \"$PROJECT_DIR/.env\" ]]; then
    set -a
    source \"$PROJECT_DIR/.env\"
    set +a
fi
$MARKER_END"

    # Create file if it doesn't exist
    touch "$SHELL_ENV"

    # Append to shell env file
    echo "" >> "$SHELL_ENV"
    echo "$SHELL_BLOCK" >> "$SHELL_ENV"

    echo -e "${GREEN}Shell integration installed to: $SHELL_ENV${NC}"
}

# ============================================================================
# MAIN
# ============================================================================

if [[ "$USE_DIRENV" == "true" ]]; then
    setup_direnv
else
    setup_shell_integration
fi

echo ""

# Verify .env has required keys
echo "Checking .env for required keys..."
MISSING_KEYS=()
REQUIRED_KEYS=("PERPLEXITY_API_KEY" "EXA_API_KEY" "PARALLEL_API_KEY" "GEMINI_API_KEY" "TYPEFULLY_API_KEY")

for key in "${REQUIRED_KEYS[@]}"; do
    if ! grep -q "^${key}=" "$PROJECT_DIR/.env" 2>/dev/null; then
        MISSING_KEYS+=("$key")
    else
        # Check if key has a real value (not placeholder)
        value=$(grep "^${key}=" "$PROJECT_DIR/.env" | cut -d= -f2 | tr -d ' ')
        if [[ "$value" == "..." ]] || [[ "$value" == "pplx-..." ]] || [[ -z "$value" ]]; then
            MISSING_KEYS+=("$key (placeholder)")
        fi
    fi
done

if [[ ${#MISSING_KEYS[@]} -gt 0 ]]; then
    echo -e "${YELLOW}Missing or placeholder keys in .env:${NC}"
    for key in "${MISSING_KEYS[@]}"; do
        echo "  - $key"
    done
    echo ""
    echo "Please edit $PROJECT_DIR/.env with your actual API keys."
else
    echo -e "${GREEN}All required keys found in .env${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Platform support:"
echo "  ✅ macOS + zsh: Full support"
echo "  ✅ Linux + zsh: Full support"
echo "  ⚠️  bash: Terminal only (use --direnv for full support)"
echo "  ❌ Windows: Not supported (use WSL)"
echo ""
if [[ "$USE_DIRENV" == "true" ]]; then
    echo "Next steps:"
    echo "  1. Restart your terminal"
    echo "  2. cd $PROJECT_DIR"
    echo "  3. Run: claude"
else
    SHELL_NAME=$(basename "$SHELL")
    if [[ "$SHELL_NAME" == "zsh" ]]; then
        echo "Next steps:"
        echo "  1. Run: source ~/.zshenv"
        echo "  2. Run: claude"
    else
        echo "Next steps:"
        echo "  1. Restart your terminal"
        echo "  2. Run: claude"
    fi
fi
