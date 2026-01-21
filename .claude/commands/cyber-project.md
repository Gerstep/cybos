Show project status and context.

Project slug: $ARGUMENTS

**Steps**:

1. Parse project slug from arguments
   - Accept slug directly: "scheduler"
   - Or convert display name to slug: "Context Graph" → "context-graph"

2. Check if `~/CybosVault/private/projects/<slug>/` exists
   - If not: check if GTD.md has `# <slug>` heading (GTD-only project)
   - If neither: report "Project not found"

3. Load project context:
   - If folder exists: read `~/CybosVault/private/projects/<slug>/.cybos/context.md`
   - Extract: Status, Type, Goal, Key Results progress, Milestones progress

4. Load tasks from GTD.md:
   - Find `# <slug>` heading
   - Extract all tasks under that heading
   - Count: total tasks, completed (if marked with [x])

5. Check recent activity (if folder exists):
   - List files modified in last 7 days
   - Check Log section in context.md for recent entries

6. Display project overview:

```markdown
# Project: [Display Name]

**Status:** [Planning | Active | On Hold | Completed]
**Type:** [Event | Product | Initiative | ...]
**Started:** YYYY-MM-DD
**Target:** YYYY-MM-DD (or "Not set")

## Goal
[Goal from context.md]

## Progress

**Key Results:** X/Y completed
- [ ] KR1
- [x] KR2

**Milestones:** X/Y done
| Milestone | Target | Status |
|-----------|--------|--------|
| ... | ... | ... |

## Tasks (from GTD.md)

X tasks total, Y completed

- [ ] Task 1
- [ ] Task 2
- [x] Task 3 (done)

## Recent Activity

- YYYY-MM-DD: [activity from log]
- Modified: file1.md, file2.md

## Quick Actions

- Edit context: `~/CybosVault/private/projects/<slug>/.cybos/context.md`
- Add tasks: Add under `# <slug>` in GTD.md
- Run research: `/cyber-research-topic "query" --project <slug>`
```

**Examples**:
```bash
/cyber-project scheduler
/cyber-project context-graph
/cyber-project "Cyber Accelerator"
```

**GTD-only projects** (no folder):
- Show only tasks from GTD.md
- Suggest: "Create folder with /cyber-init-project if you need to add context/artifacts"
