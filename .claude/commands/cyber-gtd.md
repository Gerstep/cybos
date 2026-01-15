---
name: cyber-gtd
description: Run autonomous task execution from GTD.md items
---

# GTD Runner

Execute tasks from GTD.md autonomously.

## Arguments

- `--count N` - Process N items (default: 1)
- `--execute` - Skip plan, run immediately
- `"text"` - Match specific item containing text

## Examples

```
/cyber-gtd                    # Plan 1 item → show → ask to execute
/cyber-gtd --count 3          # Plan 3 items → show → ask
/cyber-gtd --execute          # Skip plan, run immediately
/cyber-gtd "Dan Meissler"     # Plan specific item matching text
```

## Workflow

Load and follow: @.claude/skills/GTD/SKILL.md

### Step 1: Parse GTD

Read `@GTD.md` and extract items from `# Next` section.
- Skip empty lines
- Skip items under other headings (# Someday, # Skip, etc.)

### Step 2: Select Items

Based on arguments:
- Default: first item
- `--count N`: first N items
- `"text"`: items matching text (case-insensitive)

### Step 3: Plan Each Item

For each selected item:

1. **Classify** - Match against patterns in SKILL.md routing table
2. **Entity lookup** - Query database for context
   - Parse names from item
   - Run: `bun scripts/db/query.ts find-entity "<name>"`
   - If found, run: `bun scripts/db/query.ts entity <slug> --json`
   - Database includes deals, calls, telegram, email interactions
3. **Select workflow** - Based on classification
4. **Plan actions** - What the agent will do

### Step 4: Show Plan (Default)

Display plan for each item:

```
## Plan for: "[GTD item text]"

- **Type:** [Outreach/Call Prep/Podcast/Research/Unknown]
- **Confidence:** [High/Medium/Low]
- **Entity:** [Name] → [found/not found] in index
- **Contact:** [email/handle if found]
- **Workflow:** [workflow file]
- **Actions:** [What will be done]
```

### Step 5: Ask to Execute

```
Execute these tasks? [Y/n/select specific]
```

- `Y` or `yes` → run all
- `n` or `no` → cancel
- `1,3` → run only items 1 and 3

If `--execute` flag provided, skip this step.

### Step 6: Execute

For each approved item, use the **Task tool**:

```
Task tool call:
- subagent_type: "general-purpose"
- prompt: [see Agent Instructions below]
```

Execute tasks sequentially. For multiple tasks, run them one after another.

### Step 7: Report

After each task completes:

```
## Completed: [N] tasks

| Task | Status | Output |
|------|--------|--------|
| [item] | [status] | [link to output file] |
```

## Background Agent Instructions

The prompt for each Task tool call should include:

```
GTD Task: "[original GTD item text]"
Workflow: [path to workflow file, e.g., .claude/skills/GTD/workflows/outreach.md]

Entity Context:
[Include any entity info found from index lookup]

Previous Interactions:
[Include relevant call notes/transcripts if found]

Instructions:
1. Read and follow the workflow file exactly
2. Output to: /content/work/MMDD-<slug>.md
3. Use the output template from .claude/skills/GTD/SKILL.md
4. Time limit: 5 minutes

If you cannot complete:
- Save partial work with Status: Incomplete
- Document what was done and what remains

If you need information you don't have:
- Document what's missing in the output
- Set Status: Pending Approval
- Add pending action describing what's needed
```

## Output Location

All task outputs go to: `/content/work/MMDD-<slug>.md`

Slug format: kebab-case from task description
- "Dan Meissler ask for call" → `0106-dan-meissler-call.md`
- "Arche cap speak about Naptha" → `0106-arche-naptha-pitch.md`
