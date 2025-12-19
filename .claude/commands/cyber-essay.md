---
name: cyber-essay
description: Write an essay following brand guidelines.
---

Write an essay using the essay workflow.

**Workflow:** `.claude/skills/Content/workflows/essay.md`

**Usage:**
- `/cyber-essay "topic"`
- `/cyber-essay "topic" @path/to/source.md`
- `/cyber-essay @path/to/source.md "expand this into full essay"`
- `/cyber-essay "topic" @folder/` (reads all .md files in folder)

**Arguments:**
- Topic: Main essay topic or thesis (required)
- Source files: Optional @-prefixed file paths or folders
  - Ideas, research notes, previous drafts, tweets
  - Multiple sources supported
  - Sources provide foundation. Agent expands and synthesizes.

**Example usage:**
```
/cyber-essay "The convergence of AI and crypto" @content/ideas/agent-economy.md
/cyber-essay @~/CybosVault/private/research/ai-infrastructure/ "Write market analysis essay"
/cyber-essay "TEE compute thesis" @content/ideas/tee-notes.md @~/CybosVault/private/deals/acme-corp/research/2025-12-20.md
```

**Process:**

1. **LOAD WORKFLOW**: Read `.claude/skills/Content/workflows/essay.md`
2. **LOAD SOURCES** (if @ references): Parse and read all referenced files
3. **EXECUTE WORKFLOW**: Follow essay.md steps exactly
   - Workflow loads: `~/CybosVault/private/context/style/voice-identity.md`, `~/CybosVault/private/context/style/writing-style-en.md`
   - Workflow handles: drafting, review, polish, output, logging

**Output:** `~/CybosVault/private/content/essays/MMDD-<slug>-YY.md`
