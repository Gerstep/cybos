# Your Killer Claude Code Terminal Setup - 2026 Edition

Based on the latest practices from December 2025/January 2026, here's your comprehensive setup guide.

---

## 1. TERMINAL FOUNDATION

### Best Choice: Ghostty or Warp
- **Ghostty**: Top choice in 2025 (mentioned by Boris Cherny, Claude Code creator)
- **Warp**: AI-native terminal with built-in help, better for non-technical users
- **iTerm2**: Still solid for Mac, good notification support

### Key Terminal Config:
- Run `/terminal-setup` in Claude Code to auto-configure Shift+Enter for line breaks
- Enable system notifications (iTerm2: Profiles → Terminal → "Send escape sequence-generated alerts")
- Use `tmux` for session management (mentioned in multiple 2025 workflows)

---

## 2. CORE CLAUDE CODE SETUP

### Model Strategy (from Boris Cherny):
- Use **Opus 4.5 with thinking** for everything
- It's slower but needs less steering, making it faster overall
- "Ultrathink" keyword triggers 31,999 thinking tokens for complex problems

### Essential First Steps:
1. Run `/init` to auto-generate CLAUDE.md for your project
2. Set up multiple parallel sessions (5+ terminals recommended)
3. Configure YOLO mode carefully: `claude --dangerously-skip-permissions` (only in trusted environments)

### Permission Management:
```bash
# Use /permissions to pre-allow safe commands
# Check into .claude/settings.json for team sharing
```

---

## 3. POWER USER FEATURES (from "Advent of Claude" Dec 2025)

### Must-Know Commands:
- `/vim` - Enable vim keybindings for faster editing
- `/context` - See what's consuming your context window
- `/rename <session-name>` - Name sessions for easy resume
- `/sandbox` - Define boundaries once, Claude works freely inside
- `Ctrl+S` - Stash your current prompt (like git stash)
- `Ctrl+R` - Reverse search through prompt history
- `#` prefix - Save info to Claude's permanent memory

### Thinking Control:
- "think" = 4,000 tokens
- "think hard" = 10,000 tokens
- "ultrathink" = 31,999 tokens

---

## 4. WORKFLOW OPTIMIZATION

### Plan Mode (Shift+Tab twice):
- Default to Plan mode for most sessions
- Claude explores without editing anything
- Switch to auto-accept only after approving the plan

### Parallel Claude Sessions (Boris's Method):
- Run 5 Claudes in terminal tabs (numbered 1-5)
- Run 5-10 additional sessions on claude.ai/code
- Start sessions from mobile (iOS app) throughout the day
- Use `--teleport` to move sessions between terminal and web

### Session Management:
```bash
claude --continue    # Resume last session
claude --resume      # Pick from past sessions
```

---

## 5. PROJECT-SPECIFIC CUSTOMIZATION

### CLAUDE.md Strategy:
- Team-shared CLAUDE.md checked into git
- Update it during code review (tag @.claude in PRs)
- Add anything Claude does wrong so it knows next time
- Run through prompt improver periodically

### Custom Slash Commands:
Create in `.claude/commands/`:
```markdown
---
description: Commit, push, and create PR
---
[Your workflow with inline bash]
```

### Hooks for Automation:
```json
{
  "hooks": [{
    "matcher": "Edit|Write",
    "hooks": [{
      "type": "command",
      "command": "prettier --write \"$CLAUDE_FILE_PATHS\""
    }]
  }]
}
```

---

## 6. NON-TECHNICAL USE CASES (Hot in Late 2025)

### Content & Research:
- Meeting transcript processing → action items + decisions
- Competitive research with source verification
- Blog/newsletter writing in markdown files
- SEO audits and analysis

### Organization & Productivity:
- File organization with dry-run previews
- Expense categorization from transaction exports
- Granola call transcript analysis
- Managing Obsidian/markdown notes

### Personal Projects:
- Planning (Thanksgiving dinner timelines mentioned!)
- Creating slides/spreadsheets from PDFs
- Financial planning and retirement analysis
- Invoice sorting and categorization

---

## 7. ADVANCED INTEGRATIONS

### MCP Servers to Set Up:
- Filesystem access
- Slack integration (set in .mcp.json, share with team)
- Linear/Notion/Sentry
- Chrome DevTools MCP (released Dec 2025, better than Playwright)

### IDE Integration:
- Install Claude Code extension in VS Code/Cursor
- Use IDE for visual file management
- Terminal for actual Claude interactions
- Multiple panes for parallel sessions

---

## 8. SAFETY & VERIFICATION

### Boris's Verification Principles:
- "Give Claude a way to verify its work" (2-3x quality improvement)
- Use subagents for verification when tasks run long
- Set up hooks for auto-formatting and type checking
- PostToolUse hooks for code quality

### Permission Strategy:
```bash
# NOT: --dangerously-skip-permissions everywhere
# INSTEAD: Use /permissions for pre-allowed safe commands
# ONLY use dangerous mode in sandboxed environments
```

---

## 9. PRODUCTIVITY PATTERNS

### The "Explore, Plan, Code, Commit" Workflow:
1. Ask Claude to read relevant files (explicitly say "don't code yet")
2. Use subagents for complex exploration
3. Have Claude propose a plan
4. Switch to auto-accept edits mode
5. Claude commits and creates PR

### Test-Driven Development:
1. Claude writes tests based on input/output pairs
2. Tests run and fail
3. Claude writes code to pass tests
4. Iterate until perfect

---

## 10. PLUGINS & SKILLS (New in Late 2025)

### Skills System:
- Store in `.claude/skills/` directory
- Packaged workflows (API design, testing, etc.)
- Keep SKILL.md under 500 lines
- Open standard, works everywhere

### Plugins to Explore:
- Ralph Wiggum plugin for long-running tasks
- Official plugins marketplace launched late 2025
- Custom company-specific setups

---

## RECOMMENDED FIRST-WEEK SETUP

### Day 1:
1. Install Warp or Ghostty
2. Install Claude Code
3. Run `/terminal-setup`
4. Try one simple task

### Day 2-3:
1. Create your first CLAUDE.md
2. Set up 3-5 terminal tabs
3. Try Plan mode (Shift+Tab twice)
4. Create one custom slash command

### Day 4-7:
1. Configure your first MCP server
2. Set up hooks for your workflow
3. Try parallel sessions
4. Export a session with `/export` for documentation

---

## KEY INSIGHTS FROM THE PROS

### From Boris (Claude Code Creator):
- "A good plan is really important" - always start in Plan mode
- Use slash commands for every repeated workflow
- Share CLAUDE.md with your team in git
- Verification capability = 2-3x quality improvement

### From the Community:
- Claude Code is closest thing to a "second brain" powered by AI
- Start simple, graduate to complexity when you hit limits
- File organization saves literal hours
- Non-technical use cases are exploding

### Common Mistakes to Avoid:
- Using cloud Claude when you need Claude Code capabilities
- Not setting up Plan mode as default
- Skipping CLAUDE.md creation
- Using --dangerously-skip-permissions without sandboxing

---

## SOURCES & REFERENCES

### Primary Sources (Dec 2025 - Jan 2026):
- "The Ultimate Claude Code Tips Collection (Advent of Claude 2025)" - DEV Community
- "Claude Code creator Boris shares his setup with 13 detailed steps" - Reddit
- "Claude Code: Best practices for agentic coding" - Anthropic Official
- "How I Use Claude Code: My Complete Development Workflow" - Damian Galarza
- "Claude Code Changed How I Work (And Why You Should Try It)" - IT Support Group
- Multiple community posts from Twitter/X, LinkedIn, Medium

### Key Contributors:
- Boris Cherny (Claude Code Creator)
- Ado (@adocomplete - Anthropic Developer Relations)
- Dan Shipper
- Teresa Torres
- Various community power users

---

*This guide synthesizes best practices from actual Claude Code power users in late 2025/early 2026. The landscape is evolving rapidly - revisit quarterly for updates.*
