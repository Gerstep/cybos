# Plan: Replace Firecrawl with Exa + Parallel.ai Search

**Date**: 2026-01-05
**Status**: Planning
**Reason**: Simplify MCP stack, reduce dependencies, lower costs

---

## Summary

Remove firecrawl MCP entirely and replace with:
- **Exa MCP** (`getContents`) for URL content extraction
- **Parallel.ai Search** (`web_fetch`) as fallback

**Current stack**: perplexity, exa, parallel-search, firecrawl, parallel-task, playwright
**New stack**: perplexity, exa, parallel-search, parallel-task, playwright

---

## Current Firecrawl Usage

### Use Cases

1. **URL Scraping** (`mcp__firecrawl__scrape`)
   - Single URL content extraction
   - Converting web pages to markdown
   - Current usage: "Specific URLs (optional)" in Standard research

2. **Structured Extraction** (`mcp__firecrawl__extract`)
   - Schema-based data extraction
   - Batch processing multiple URLs
   - Current usage: Deep research only

3. **Site Crawling** (`mcp__firecrawl__crawl`)
   - Comprehensive site crawling
   - Current usage: Avoid (expensive)

### Current Fallback Chain

```
URL scraping: firecrawl scrape → parallel-search web_fetch → WebFetch (built-in)
```

---

## Replacement Strategy

### New Primary Tool: Exa getContents

**Why Exa:**
- Already integrated and used for search
- `getContents` API extracts clean content from URLs
- Returns markdown-friendly format
- Lower cost than firecrawl
- Batch processing support

**Replacement mapping:**
- `firecrawl scrape` → `exa getContents` (single/batch URLs)
- `firecrawl extract` → `exa getContents` + LLM processing
- `firecrawl crawl` → Already avoided, no replacement needed

### New Fallback Chain

```
URL content: exa getContents → parallel-search web_fetch → WebFetch (built-in)
```

### Tool Comparison

| Operation | Old Primary | New Primary | Fallback | Built-in |
|-----------|-------------|-------------|----------|----------|
| URL content | firecrawl scrape | exa getContents | parallel-search web_fetch | WebFetch |
| Batch URLs | firecrawl extract | exa getContents | parallel-search web_fetch | Multiple WebFetch |
| Site crawl | firecrawl crawl (avoid) | N/A (not needed) | N/A | N/A |

---

## Files to Update

### Critical Files (Must Update)

#### 1. Research Workflows
- [ ] `.claude/skills/Research/workflows/company.md`
  - Line 91: Update MCP list in raw data section
  - Line 111: Remove firecrawl from tools used
  - Add exa getContents usage pattern

- [ ] `.claude/skills/Research/workflows/tech.md`
  - Line 90: Update MCP list in raw data section
  - Line 110: Remove firecrawl from tools used
  - Add exa getContents usage pattern

- [ ] `.claude/skills/Research/workflows/market.md`
  - Line 100: Update MCP list in raw data section
  - Line 120: Remove firecrawl from tools used
  - Add exa getContents usage pattern

- [ ] `.claude/skills/Research/workflows/topic.md`
  - Line 41: Remove "firecrawl scrape: 1-2 key articles (optional)"
  - Line 67: Remove "firecrawl: Batch scrape key sources"
  - Line 137: Remove "**Firecrawl** (optional): Specific article if URL known"
  - Line 196: Update MCP list in raw data section
  - Line 263: Remove firecrawl from tools used
  - Add: "**Exa getContents** (optional): Specific article URLs if known"

#### 2. MCP Strategy & Shared Docs
- [ ] `.claude/skills/Research/shared/mcp-strategy.md`
  - Line 11-13: Remove firecrawl from server table
  - Line 44: Remove firecrawl scrape reference
  - Line 62: Replace "firecrawl scrape" with "exa getContents"
  - Line 98: Replace "firecrawl: batch scraping" with "exa getContents: batch URLs"
  - Section "When to use Firecrawl" (161-177): **DELETE ENTIRE SECTION**
  - Line 177: Remove firecrawl fallback reference
  - Line 193: Update "Firecrawl can't handle" to "Exa can't extract"
  - Line 209: Replace "firecrawl scrape" with "exa getContents"
  - Line 282: Replace firecrawl in example
  - Line 314-317: Update comparison table
  - **ADD NEW SECTION**: "When to use Exa getContents"
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

- [ ] `.claude/skills/Research/shared/logging.md`
  - Line 96: Remove firecrawl from MCP list example
  - Line 165-170: Delete firecrawl scrape example
  - Line 210: Remove firecrawl from MCPs used
  - Line 266-268: Delete "### Firecrawl" cost section
  - Line 303: Remove firecrawl success rate
  - **ADD**: Exa getContents cost estimation
    ```markdown
    ### Exa
    - `search`: ~$0.01-0.02 per query
    - `getContents`: ~$0.02-0.05 per batch (1-10 URLs)
    - `findSimilar`: ~$0.01-0.02 per query
    ```

- [ ] `.claude/skills/Research/shared/intensity-tiers.md`
  - Line 70: Remove "mcp__firecrawl__scrape - Targeted URL scraping"
  - Line 101: Replace "Firecrawl" with "Exa (getContents)"
  - Line 116: Remove "mcp__firecrawl__extract (batch processing)"
  - Line 224: Replace "firecrawl scrape: 1-2 URLs (optional)" with "exa getContents: specific URLs (optional)"
  - Line 247: Replace "firecrawl extract: Batch URLs" with "exa getContents: Batch URLs"

- [ ] `.claude/skills/Research/shared/error-handling.md`
  - Line 244: Change "exa | → perplexity → firecrawl" to "exa | → parallel-search → WebFetch"
  - Line 245: Change "firecrawl | → WebFetch → manual note" to "exa getContents | → parallel-search → WebFetch"
  - Line 278: Remove "firecrawl scrape (website offline)" example

#### 3. Architecture & Documentation
- [ ] `docs/ARCHITECTURE.md`
  - Line 63: Remove firecrawl from ASCII diagram
  - Line 237: **DELETE** firecrawl row from MCP servers table
  - Line 253: Replace "Firecrawl" with "Exa (getContents)"
  - Line 273: Remove "firecrawl scrape/extract"
  - Line 283: Replace "firecrawl → parallel-search" with "exa getContents → parallel-search"
  - Line 333-340: **DELETE ENTIRE** "Firecrawl:" section
  - Line 411: Replace "mcp__firecrawl__scrape: specific URLs (optional)" with "mcp__exa__getContents: specific URLs (optional)"
  - Line 646: **DELETE** "FIRECRAWL_API_KEY=fc-..." line
  - Line 714: Remove firecrawl from MCPs used example

- [ ] `README.md`
  - Line 46: **DELETE** firecrawl row from API keys table
  - Line 64: **DELETE** "FIRECRAWL_API_KEY=fc-..." line
  - Line 134: Remove "firecrawl, playwright" reference
  - Line 437: Replace "firecrawl scrape/extract" with "exa getContents"
  - Line 460-462: **DELETE ENTIRE** Firecrawl section
  - **ADD** to Exa section:
    ```markdown
    - `mcp__exa__getContents` - Extract content from URLs
    ```

- [ ] `.env.example`
  - **DELETE** line: `FIRECRAWL_API_KEY=fc-...`
  - Update comment if any

#### 4. Agent Definitions
- [ ] `.claude/agents/company-researcher.md`
  - Search for "firecrawl" references
  - Replace with exa getContents usage

- [ ] `.claude/agents/market-researcher.md`
  - Search for "firecrawl" references
  - Replace with exa getContents usage

- [ ] `.claude/agents/tech-researcher.md`
  - Search for "firecrawl" references
  - Replace with exa getContents usage

- [ ] `.claude/agents/team-researcher.md`
  - Search for "firecrawl" references
  - Replace with exa getContents usage

- [ ] `.claude/agents/financial-researcher.md`
  - Search for "firecrawl" references
  - Replace with exa getContents usage

- [ ] `.claude/agents/topic-researcher.md`
  - Search for "firecrawl" references
  - Replace with exa getContents usage

#### 5. Skill Overview Files
- [ ] `.claude/skills/CORE/SKILL.md`
  - Line 56: Replace "**firecrawl**: Scraping and extraction" with "**exa**: Search + content extraction"

- [ ] `.claude/skills/Research/SKILL.md`
  - Line 59: Replace "mcp__firecrawl__scrape: Specific URL content" with "mcp__exa__getContents: Extract URL content"
  - Line 96: Replace "firecrawl" with "exa getContents"
  - Line 103: Replace "firecrawl" with "exa getContents"

- [ ] `.claude/skills/Content/SKILL.md`
  - Line 29: Replace "mcp__firecrawl__firecrawl_search" with appropriate alternative (likely perplexity or exa search)

#### 6. Content Workflows
- [ ] `.claude/skills/Content/workflows/tweet.md`
  - Line 229: Replace "mcp__firecrawl__firecrawl_search" with "mcp__exa__search" or "mcp__perplexity__search"

- [ ] `.claude/skills/Content/workflows/telegram-post.md`
  - Line 154: Replace "mcp__firecrawl__firecrawl_search" with "mcp__exa__search" or "mcp__perplexity__search"

#### 7. MCP Configuration
- [ ] `.claude/.mcp.json`
  - **DELETE** entire firecrawl server configuration:
    ```json
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "@mendable/firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      }
    }
    ```

### Optional/Historical Files (Don't Update)

These files are historical records or completed research outputs:
- `docs/spec-1.1.md` - Historical spec
- `deals/anthropic/research/2026-01-02-consolidated-investment-report.md` - Historical research
- `.claude/skills/Research/evals/baseline/*.md` - Evaluation baselines
- `research/**/*.md` - Historical research outputs
- `docs/research-*.md` - Design documents (historical)

---

## Implementation Steps

### Phase 1: Documentation & Specs (30 min)
1. Update MCP strategy document
2. Update logging specification
3. Update intensity tiers
4. Update error handling
5. Update ARCHITECTURE.md
6. Update README.md

### Phase 2: Workflows (20 min)
1. Update all 4 research workflows (company, tech, market, topic)
2. Update content workflows (tweet, telegram-post)
3. Update skill overview files

### Phase 3: Agents (15 min)
1. Update all 6 agent definitions
2. Search for any hardcoded firecrawl references

### Phase 4: Configuration (5 min)
1. Remove firecrawl from .mcp.json
2. Remove FIRECRAWL_API_KEY from .env.example
3. Update any startup/hook scripts if needed

### Phase 5: Testing & Validation (10 min)
1. Verify no remaining firecrawl references: `grep -ri "firecrawl" --include="*.md" --include="*.json" --include="*.ts" .claude/ docs/ context/ README.md .env.example`
2. Test exa getContents works as expected
3. Validate fallback chain works
4. Commit with detailed message

---

## Verification Checklist

After implementation:
- [ ] No "firecrawl" references in active workflow files
- [ ] No "firecrawl" references in .claude/skills/ (except evals/)
- [ ] No "firecrawl" references in docs/ (except historical spec-1.1.md)
- [ ] No "FIRECRAWL_API_KEY" in .env.example
- [ ] No firecrawl config in .mcp.json
- [ ] README.md updated with exa getContents
- [ ] ARCHITECTURE.md updated with new fallback chain
- [ ] All workflows reference exa getContents instead
- [ ] Logging spec includes exa getContents costs

---

## Risk Assessment

**Low Risk Changes:**
- Documentation updates (no functional impact)
- MCP strategy updates (guidance only)

**Medium Risk Changes:**
- Workflow files (affects future research execution)
- Agent definitions (affects agent behavior)

**High Risk Changes:**
- .mcp.json configuration (breaks if firecrawl accidentally called)

**Mitigation:**
- Comprehensive grep verification after changes
- Test with a simple research query
- Keep historical files unchanged for reference

---

## Cost Impact

**Before** (Standard research with firecrawl):
- Perplexity search: $0.02
- Exa search: $0.02
- Firecrawl scrape: $0.05
- Total: ~$0.09 per research

**After** (Standard research with exa getContents):
- Perplexity search: $0.02
- Exa search: $0.02
- Exa getContents: $0.03
- Total: ~$0.07 per research

**Savings**: ~22% cost reduction per research query

---

## Rollback Plan

If issues arise:
1. Git revert to commit before changes
2. Restore firecrawl in .mcp.json
3. Restore FIRECRAWL_API_KEY in .env.example
4. Document what failed for future reference

---

## Post-Implementation

After successful removal:
1. Monitor first 5-10 research queries for issues
2. Check that exa getContents provides similar quality
3. Validate fallback chain triggers correctly
4. Update any remaining documentation
5. Consider removing firecrawl API key from secrets management
