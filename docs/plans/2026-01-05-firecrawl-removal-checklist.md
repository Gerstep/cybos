# Firecrawl Removal: Implementation Checklist

**Use this as a step-by-step guide during implementation**

---

## Phase 1: Configuration (5 min)

### .claude/.mcp.json
- [ ] Open `.claude/.mcp.json`
- [ ] Delete lines 24-30 (entire firecrawl server config)
- [ ] Verify JSON is still valid (no trailing comma)
- [ ] Save file

### .env.example
- [ ] Open `.env.example`
- [ ] Delete lines 6-7 (EXTRACTION section + FIRECRAWL_API_KEY)
- [ ] Save file

---

## Phase 2: Core Documentation (15 min)

### README.md
- [ ] Line 46: Delete firecrawl row from API keys table
- [ ] Line 64: Delete `FIRECRAWL_API_KEY=fc-...`
- [ ] Line 134: Replace "firecrawl, playwright" with "exa, playwright"
- [ ] Line 437: Replace "firecrawl scrape/extract" with "exa getContents"
- [ ] Lines 460-462: Delete entire Firecrawl section
- [ ] Add to Exa section: `- mcp__exa__getContents - Extract content from URLs`

### docs/ARCHITECTURE.md
- [ ] Line 63: Remove firecrawl from ASCII diagram
- [ ] Line 237: Delete firecrawl row from MCP servers table
- [ ] Line 253: Replace "Firecrawl" with "Exa (getContents)"
- [ ] Line 273: Remove "firecrawl scrape/extract"
- [ ] Line 283: Replace "firecrawl → parallel-search" with "exa getContents → parallel-search"
- [ ] Lines 333-340: Delete entire "Firecrawl:" section
- [ ] Line 411: Replace "mcp__firecrawl__scrape" with "mcp__exa__getContents"
- [ ] Line 646: Delete "FIRECRAWL_API_KEY=fc-..."
- [ ] Line 714: Remove firecrawl from MCPs used example

### .claude/skills/Research/shared/mcp-strategy.md
- [ ] Lines 11-13: Remove firecrawl row from server table
- [ ] Line 44: Remove "mcp__firecrawl__scrape" reference
- [ ] Line 62: Replace "firecrawl scrape" with "exa getContents"
- [ ] Line 98: Replace "firecrawl: batch scraping" with "exa getContents: batch URLs"
- [ ] Lines 161-177: **DELETE ENTIRE SECTION** "When to use Firecrawl"
- [ ] Line 193: Update "Firecrawl can't handle" to "Exa can't extract"
- [ ] Line 209: Replace "firecrawl scrape" with "exa getContents"
- [ ] Line 282: Replace firecrawl in example
- [ ] Lines 314-317: Update comparison table (replace firecrawl with exa getContents)
- [ ] **ADD NEW SECTION** after line 160:
  ```markdown
  ### When to use Exa getContents

  **exa getContents**:
  - Extract content from specific URLs
  - Batch processing multiple URLs (up to 10)
  - Get clean markdown from web pages
  - Standard and Deep research

  **Use cases**:
  - Following up on search results with full content
  - Extracting articles, papers, blog posts
  - Getting company website content
  - Batch processing competitor URLs

  **Fallback**: If exa fails, use `parallel-search web_fetch`
  ```

---

## Phase 3: Research Shared Docs (15 min)

### .claude/skills/Research/shared/logging.md
- [ ] Line 96: Remove firecrawl from MCP list example
- [ ] Lines 165-170: Delete firecrawl scrape log example
- [ ] Line 210: Remove firecrawl from MCPs used
- [ ] Lines 266-268: Delete "### Firecrawl" cost section
- [ ] Line 303: Remove firecrawl success rate line
- [ ] **ADD** to Exa section (after line 257):
  ```markdown
  ### Exa
  - `search`: ~$0.01-0.02 per query
  - `getContents`: ~$0.02-0.05 per batch (1-10 URLs)
  - `findSimilar`: ~$0.01-0.02 per query
  ```

### .claude/skills/Research/shared/intensity-tiers.md
- [ ] Line 70: Remove "mcp__firecrawl__scrape - Targeted URL scraping"
- [ ] Line 101: Replace "Firecrawl" with "Exa (getContents)"
- [ ] Line 116: Remove "mcp__firecrawl__extract (batch processing)"
- [ ] Line 224: Replace "firecrawl scrape: 1-2 URLs" with "exa getContents: specific URLs"
- [ ] Line 247: Replace "firecrawl extract: Batch URLs" with "exa getContents: Batch URLs"

### .claude/skills/Research/shared/error-handling.md
- [ ] Line 244: Change to "exa | → parallel-search → WebFetch"
- [ ] Line 245: Change to "exa getContents | → parallel-search → WebFetch"
- [ ] Line 278: Remove "firecrawl scrape (website offline)" example

---

## Phase 4: Research Workflows (15 min)

### .claude/skills/Research/workflows/topic.md
- [ ] Line 41: Remove "- firecrawl scrape: 1-2 key articles (optional)"
- [ ] Line 67: Remove "- firecrawl: Batch scrape key sources"
- [ ] Line 137: DELETE "**Firecrawl** (optional): Specific article if URL known"
- [ ] Line 137: ADD "**Exa getContents** (optional): Specific URLs if known"
- [ ] Line 196: Update MCP list (remove firecrawl, keep exa, parallel-search)
- [ ] Line 263: Remove firecrawl from "Research Tools Used"

### .claude/skills/Research/workflows/company.md
- [ ] Line 91: Update MCP list (remove firecrawl, add "exa")
- [ ] Line 111: Remove "- Firecrawl: [URLs scraped if any]"

### .claude/skills/Research/workflows/tech.md
- [ ] Line 90: Update MCP list (remove firecrawl)
- [ ] Line 110: Remove "- Firecrawl: [URLs scraped if any]"

### .claude/skills/Research/workflows/market.md
- [ ] Line 100: Update MCP list (remove firecrawl)
- [ ] Line 120: Remove "- Firecrawl: [URLs scraped if any]"

---

## Phase 5: Skill Overview Files (10 min)

### .claude/skills/CORE/SKILL.md
- [ ] Line 56: Replace "**firecrawl**: Scraping and extraction" with "**exa**: Search + content extraction"

### .claude/skills/Research/SKILL.md
- [ ] Line 59: Replace "mcp__firecrawl__scrape: Specific URL content" with "mcp__exa__getContents: Extract URL content"
- [ ] Line 96: Replace "firecrawl" with "exa getContents"
- [ ] Line 103: Replace "firecrawl" with "exa getContents"

### .claude/skills/Content/SKILL.md
- [ ] Line 29: Replace "mcp__firecrawl__firecrawl_search" with "mcp__exa__search"

---

## Phase 6: Content Workflows (5 min)

### .claude/skills/Content/workflows/tweet.md
- [ ] Line 229: Replace "mcp__firecrawl__firecrawl_search" with "mcp__exa__search"

### .claude/skills/Content/workflows/telegram-post.md
- [ ] Line 154: Replace "mcp__firecrawl__firecrawl_search" with "mcp__exa__search"

---

## Phase 7: Agent Definitions (10 min)

For each agent file, search for "firecrawl" and replace with "exa getContents":

- [ ] `.claude/agents/company-researcher.md`
- [ ] `.claude/agents/market-researcher.md`
- [ ] `.claude/agents/tech-researcher.md`
- [ ] `.claude/agents/team-researcher.md`
- [ ] `.claude/agents/financial-researcher.md`
- [ ] `.claude/agents/topic-researcher.md`

**Search pattern**: `grep -n "firecrawl" .claude/agents/*.md`
**Replace**: Use context to determine if "exa getContents" or "exa search" is appropriate

---

## Phase 8: Verification (10 min)

### Automated Checks

Run these commands:

```bash
# 1. No firecrawl in active files
grep -ri "firecrawl" \
  --include="*.md" \
  --include="*.json" \
  --include="*.ts" \
  --exclude-dir="research" \
  --exclude-dir="deals" \
  --exclude-dir="evals" \
  --exclude="spec-1.1.md" \
  .claude/ docs/ context/ README.md .env.example

# Expected: Should return ZERO results (except historical files)

# 2. No FIRECRAWL_API_KEY
grep -r "FIRECRAWL_API_KEY" .env.example .claude/

# Expected: Should return ZERO results

# 3. MCP config clean
cat .claude/.mcp.json | grep -i firecrawl

# Expected: Should return ZERO results
```

### Manual Verification

- [ ] .mcp.json has no firecrawl entry
- [ ] .env.example has no FIRECRAWL_API_KEY
- [ ] README.md shows exa getContents in tools
- [ ] ARCHITECTURE.md shows new fallback chain
- [ ] MCP strategy has "When to use Exa getContents" section
- [ ] All 4 research workflows reference exa instead
- [ ] No "firecrawl" in any workflow file

---

## Phase 9: Git Commit (5 min)

```bash
# Stage all changes
git add -A

# Commit with detailed message
git commit -m "Remove firecrawl MCP, replace with exa getContents + parallel-search

Complete removal of firecrawl dependency:

**Replacement Strategy:**
- URL scraping: exa getContents (primary) → parallel-search web_fetch (fallback)
- Cost savings: ~22% per research query ($0.09 → $0.07)
- Simplified MCP stack: 7 → 6 servers

**Files Updated (23 total):**
Configuration:
- .claude/.mcp.json: Removed firecrawl server
- .env.example: Removed FIRECRAWL_API_KEY

Documentation:
- docs/ARCHITECTURE.md: New fallback chain, removed firecrawl
- README.md: Updated MCP tools, removed firecrawl
- .claude/skills/Research/shared/mcp-strategy.md: Added exa getContents section
- .claude/skills/Research/shared/logging.md: Updated costs
- .claude/skills/Research/shared/intensity-tiers.md: Replaced references
- .claude/skills/Research/shared/error-handling.md: New fallback chain

Workflows (4):
- company.md, tech.md, market.md, topic.md: All use exa getContents

Skill files (3):
- CORE/SKILL.md, Research/SKILL.md, Content/SKILL.md

Content workflows (2):
- tweet.md, telegram-post.md: Use exa search

Agent definitions (6):
- All agents updated to use exa getContents

**Benefits:**
- Cleaner MCP stack
- Lower costs per query
- Better maintained tools (exa is core MCP)
- Consistent fallback strategy

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push changes
git push
```

---

## Phase 10: Testing (10 min)

### Functional Test

- [ ] Restart Claude Code
- [ ] Run: `/cyber-research-topic "test subject" --quick`
- [ ] Verify: No firecrawl errors
- [ ] Verify: Exa getContents is used if URLs needed
- [ ] Check logs: `.cybos/logs/MMDD-YY.md`

### Fallback Test

- [ ] Manually trigger exa failure (if possible)
- [ ] Verify: parallel-search web_fetch is called as fallback
- [ ] Verify: Research completes with partial data

---

## Post-Implementation

After successful deployment:

- [ ] Monitor next 5 research queries
- [ ] Verify cost reduction is real
- [ ] Check exa getContents quality vs firecrawl
- [ ] Update team if applicable
- [ ] Consider removing firecrawl API key from secrets

---

## Rollback (If Needed)

If critical issues arise:

```bash
# Quick rollback
git revert HEAD
git push

# Or selective restore
git checkout HEAD~1 -- .claude/.mcp.json
git checkout HEAD~1 -- .env.example
# Restart Claude Code
```

---

## Success Criteria

Implementation is successful when:
- ✅ No firecrawl references in active code
- ✅ Claude Code starts without errors
- ✅ Research queries work as before
- ✅ Exa getContents provides similar quality
- ✅ Fallback chain works correctly
- ✅ Cost per query is reduced
- ✅ All tests pass
