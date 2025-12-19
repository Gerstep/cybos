# Firecrawl Removal: Visual Summary

**Quick Reference Guide for Implementation**

---

## Key Changes at a Glance

### MCP Stack Transformation

```
BEFORE:
┌─────────────────────────────────────────┐
│  perplexity                             │  Fast search + deep research
│  exa                                    │  Web search, company research
│  parallel-search                        │  Search fallback
│  firecrawl          ← REMOVE THIS      │  URL scraping (being replaced)
│  parallel-task                          │  Deep research
│  playwright                             │  Hard scraping (last resort)
└─────────────────────────────────────────┘

AFTER:
┌─────────────────────────────────────────┐
│  perplexity                             │  Fast search + deep research
│  exa                ← ENHANCED          │  Search + content extraction
│  parallel-search                        │  Search + content fallback
│  parallel-task                          │  Deep research
│  playwright                             │  Hard scraping (last resort)
└─────────────────────────────────────────┘
```

---

## Replacement Mapping

### Tool Replacement

```
OLD: firecrawl scrape       NEW: exa getContents
     ├─ Single URL                ├─ Single URL
     ├─ Clean markdown            ├─ Clean content
     └─ Cost: ~$0.05             └─ Cost: ~$0.03

OLD: firecrawl extract      NEW: exa getContents (batch)
     ├─ Batch URLs                ├─ Batch URLs (1-10)
     ├─ Schema extraction         ├─ Content + LLM processing
     └─ Cost: ~$0.10-0.20        └─ Cost: ~$0.05-0.08

OLD: firecrawl crawl        NEW: [Not needed]
     └─ Site crawling             └─ Already avoided
```

### Fallback Chain Changes

```
OLD CHAIN:
URL content: firecrawl scrape → parallel-search web_fetch → WebFetch

NEW CHAIN:
URL content: exa getContents → parallel-search web_fetch → WebFetch
             ↑ PRIMARY         ↑ FALLBACK               ↑ LAST RESORT
```

---

## File Update Breakdown

### By Category

```
CRITICAL (Must Update)          │  Count  │  Impact
────────────────────────────────┼─────────┼──────────────
Research workflows              │    4    │  HIGH - Execution
MCP strategy & shared docs      │    4    │  HIGH - Guidance
Architecture & main docs        │    2    │  HIGH - Reference
Agent definitions               │    6    │  MEDIUM - Behavior
Skill overview files            │    3    │  MEDIUM - Discovery
Content workflows               │    2    │  MEDIUM - Verification
Configuration files             │    2    │  HIGH - Runtime
────────────────────────────────┼─────────┼──────────────
TOTAL                           │   23    │
```

### Priority Order

```
1. Configuration          ← Do FIRST (prevents errors)
   ├─ .claude/.mcp.json
   └─ .env.example

2. Core Documentation     ← Update SECOND (reference)
   ├─ docs/ARCHITECTURE.md
   ├─ README.md
   └─ .claude/skills/Research/shared/mcp-strategy.md

3. Workflows              ← Update THIRD (execution)
   ├─ company.md
   ├─ tech.md
   ├─ market.md
   └─ topic.md

4. Agents & Skills        ← Update FOURTH (behavior)
   └─ All agent .md files

5. Verification           ← Do LAST (validation)
   └─ grep check for remaining refs
```

---

## Critical Lines to Change

### Configuration Files

**`.claude/.mcp.json`** (Lines 24-30):
```json
DELETE:
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "@mendable/firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      }
    },
```

**`.env.example`** (Lines 6-7):
```bash
DELETE:
# === EXTRACTION (required) ===
FIRECRAWL_API_KEY=fc-...
```

### Key Workflow Changes

**Topic Workflow** (`.claude/skills/Research/workflows/topic.md`):
```markdown
Line 41:  DELETE: - firecrawl scrape: 1-2 key articles (optional)
Line 137: DELETE: **Firecrawl** (optional): Specific article if URL known
          ADD:    **Exa getContents** (optional): Specific URLs if known
```

**MCP Strategy** (`.claude/skills/Research/shared/mcp-strategy.md`):
```markdown
Line 161-177: DELETE ENTIRE SECTION "When to use Firecrawl"
              ADD NEW SECTION "When to use Exa getContents"
```

### Documentation Updates

**ARCHITECTURE.md**:
```markdown
Line 237: DELETE firecrawl row from MCP servers table
Line 333-340: DELETE entire "Firecrawl:" section
Line 646: DELETE "FIRECRAWL_API_KEY=fc-..."
```

**README.md**:
```markdown
Line 46: DELETE firecrawl from API keys table
Line 64: DELETE "FIRECRAWL_API_KEY=fc-..."
Line 460-462: DELETE entire Firecrawl section
```

---

## Pattern Replacements

Use these patterns for global find/replace:

```
SEARCH:                           REPLACE WITH:
────────────────────────────────  ──────────────────────────────────
firecrawl scrape                  exa getContents
mcp__firecrawl__scrape            mcp__exa__getContents
firecrawl extract                 exa getContents (batch)
firecrawl, playwright             exa, playwright
Firecrawl                         Exa (getContents)
FIRECRAWL_API_KEY                 [DELETE LINE]
```

**Warning**: Do NOT replace in:
- `/research/**/*.md` (historical outputs)
- `/deals/**/research/*.md` (historical outputs)
- `docs/spec-1.1.md` (historical spec)
- `.claude/skills/Research/evals/` (evaluation baselines)

---

## Cost Impact Visualization

```
STANDARD RESEARCH COST BREAKDOWN:

BEFORE (with firecrawl):
┌─────────────────────────────────────┐
│ Perplexity search    $0.02          │
│ Exa search           $0.02          │
│ Firecrawl scrape     $0.05  ← HIGH  │
├─────────────────────────────────────┤
│ TOTAL                $0.09          │
└─────────────────────────────────────┘

AFTER (with exa getContents):
┌─────────────────────────────────────┐
│ Perplexity search    $0.02          │
│ Exa search           $0.02          │
│ Exa getContents      $0.03  ← LOWER │
├─────────────────────────────────────┤
│ TOTAL                $0.07          │
└─────────────────────────────────────┘

SAVINGS: $0.02 per research (~22% reduction)
```

---

## Verification Commands

Run these after implementation:

```bash
# 1. Check for remaining firecrawl references
grep -ri "firecrawl" \
  --include="*.md" \
  --include="*.json" \
  --include="*.ts" \
  --exclude-dir="research" \
  --exclude-dir="deals" \
  --exclude-dir="evals" \
  .claude/ docs/ context/ README.md .env.example

# 2. Verify no FIRECRAWL_API_KEY
grep -r "FIRECRAWL_API_KEY" .env.example .claude/

# 3. Check MCP config is clean
cat .claude/.mcp.json | grep -i firecrawl

# 4. Count changes
git diff --stat

# Expected: 23 files changed, ~200-300 lines removed/modified
```

---

## Testing Checklist

After implementation:

```
Configuration:
[ ] .mcp.json has no firecrawl entry
[ ] .env.example has no FIRECRAWL_API_KEY
[ ] Claude Code starts without errors

Documentation:
[ ] README.md shows exa getContents
[ ] ARCHITECTURE.md shows new fallback chain
[ ] MCP strategy has exa getContents section

Workflows:
[ ] All 4 research workflows reference exa
[ ] No "firecrawl" in topic.md
[ ] Fallback chains updated

Functional:
[ ] Run simple topic research
[ ] Verify exa getContents is called
[ ] Check fallback works if exa fails
```

---

## Quick Stats

```
Files to update:        23
Lines to delete:        ~150
Lines to modify:        ~80
Lines to add:           ~50
Estimated time:         80 minutes
Risk level:             Medium
Cost savings:           22% per research
```

---

## Emergency Rollback

If something breaks:

```bash
# 1. Revert all changes
git reset --hard HEAD~1

# 2. Or restore firecrawl config only
git checkout HEAD~1 -- .claude/.mcp.json
git checkout HEAD~1 -- .env.example

# 3. Restart Claude Code
# Firecrawl will work again
```
