Initialize folder structure for a new project.

Project name: $ARGUMENTS

**Steps**:

1. Parse project name and optional type flag
   - Name: First argument (e.g., "Cyber Accelerator Q1")
   - Type (optional): `--type [event|accelerator|product|initiative]` (default: initiative)

2. Convert project name to kebab-case slug
   - Example: "Cyber Accelerator Q1" → "cyber-accelerator-q1"

3. Check if `/projects/<slug>/` already exists
   - If exists: warn and ask if user wants to view existing project instead

4. Create directory structure:
   ```
   /projects/<slug>/
   └── .cybos/
       └── context.md
   ```

   Note: Only .cybos/ is required. User creates other folders as needed.

5. Populate context.md with project template:

```markdown
# Project: [Display Name]

**Slug:** [slug]
**Status:** Planning
**Type:** [Event | Accelerator | Product | Initiative]
**Started:** YYYY-MM-DD
**Target:**
**Lead:** [Load from context/identity.md]

## Goal

[One paragraph: what does success look like?]

## Key Results

- [ ] KR1:
- [ ] KR2:
- [ ] KR3:

## Scope

**In scope:**
-

**Out of scope:**
-

## Collaborators

| Person | Role | Contact |
|--------|------|---------|

## Timeline / Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Phase 1 | | Pending |

## Dependencies

-

## Open Questions

-

## Log

### YYYY-MM-DD
- Project created
```

6. Check if GTD.md has a `# <slug>` heading
   - If not: ask user if they want to add a heading to GTD.md for this project
   - If yes: add `# <slug>` section at the end of GTD.md (before # Someday if exists)

7. Log the action to `/.cybos/logs/MMDD-YY.md`:
   ```
   ## HH:MM | project | init | [Project Name]
   - Workflow: init-project
   - Output: /projects/<slug>/ created

   ---
   ```

8. Display summary:
   - Project folder created at /projects/<slug>/
   - Edit context.md to add goals and key results
   - Add tasks under `# <slug>` in GTD.md

**Examples**:
```bash
/cyber-init-project "Cyber Accelerator Q1"
/cyber-init-project "Database Indexer" --type product
/cyber-init-project "Demo Day 2026" --type event
```
