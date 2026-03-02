---
name: cyber-writing
description: Iterative critique and improvement of long-form content (guidebooks, playbooks, essays). Launches parallel judge subagents, synthesizes findings, presents proposals for user approval.
---

Critique and improve long-form content using the Writing skill.

**Workflow:** `.claude/skills/Writing/SKILL.md`

**Usage:**
- `/cyber-writing <content-file>`
- `/cyber-writing <content-file> --vision <vision-file>`
- `/cyber-writing <content-file> --vision <vision-file> --sources <file1> <file2> ...`

**Arguments:**
- Content file: Path to the document being critiqued (required)
- `--vision`: Vision/goal document for the project (optional but recommended)
- `--sources`: Source files the content was built from (optional, for cross-referencing)

**Examples:**
```
/cyber-writing ~/path/to/guidebook.md --vision ~/path/to/VISION.md
/cyber-writing ~/path/to/essay.md --sources ~/path/to/research.md ~/path/to/notes.md
/cyber-writing ~/CybosVault/private/projects/cybernetic-orgs/playbook-docs/GUIDEBOOK-OUTLINE.md --vision ~/CybosVault/private/projects/cybernetic-orgs/playbook-docs/VISION.md --sources ~/CybosVault/private/projects/cybernetic-orgs/essay-nature-of-ai-firm-v4.md ~/CybosVault/private/projects/cybernetic-orgs/PB_Playbook.md
```

**Process:**

1. **LOAD SKILL**: Read `.claude/skills/Writing/SKILL.md`
2. **PARSE ARGUMENTS**: Extract content file, vision file, source files from $ARGUMENTS
3. **EXECUTE PHASE 1** (Ingest): Read all files, parse sections, present scope to user
4. **EXECUTE PHASE 2** (Critique): Launch 5 parallel judge subagents per section using `.claude/skills/Writing/prompts/judge.md`
5. **EXECUTE PHASE 3** (Synthesis): Consolidate findings
6. **EXECUTE PHASE 4** (Present): Show proposals, get user decisions
7. **EXECUTE PHASE 5** (Apply): Edit file with accepted changes
8. **EXECUTE PHASE 6** (Loop): Next section until done

**Key rule:** Never edit the content file without user approval.
