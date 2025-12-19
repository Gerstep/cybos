# Projects System Plan

*Architectural plan for /projects - multi-week initiatives beyond single GTD tasks*

**Created:** 2026-01-08
**Status:** Planning

---

## Overview

### Problem Statement

Current Cybos handles:
- **Deals**: Investment opportunities (external companies)
- **Research**: One-off topic exploration
- **GTD.md**: Next actions (flat list, no deep context)

**Missing**: Multi-week initiatives that need their own context, research, and artifacts:
- Organizing events (demo days, conferences)
- Running accelerator programs
- Building internal products (cybos features, tools)
- Strategic initiatives (partnerships, launches)

### Solution

Add `/projects/` directory for initiatives that:
- Span multiple weeks/months
- Need persistent context beyond GTD tasks
- Produce artifacts (decks, research, content)
- Involve multiple people/entities

GTD.md `## headings` under `# Building` become project references that link to `/projects/<slug>/` folders.

---

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| File-first | Markdown folders, git-friendly |
| GTD.md is source of truth for tasks | Projects hold context, GTD holds actions |
| Context auto-loading | Mention project → load `/projects/<slug>/.cybos/context.md` |
| No duplication | Tasks live in GTD.md only, not duplicated in project folder |
| Progressive detail | Quick status from GTD, deep context from project folder |

---

## GTD.md Integration

### Current Structure (Keep As-Is)

```markdown
# Next
- Immediate actions (no project)

# Building
## scheduler
- Task 1 for scheduler project
- Task 2 for scheduler project

## context-graph
- Task 1 for context graph project

## content
- Task 1 for content project

# Someday
- Future ideas
```

### Rules

1. `# heading` = project slug (kebab-case)
2. Tasks under `# heading` belong to that project
3. Tasks under `# Next` and `# Someday` and `# IC` are standalone
4. `/projects/<slug>/` folder provides deep context for the project
5. Not every `# heading` needs a `/projects/` folder (lightweight projects stay GTD-only)

### When to Create /projects/ Folder

| Scenario | GTD-only | Create /projects/ |
|----------|----------|-------------------|
| Few tasks, clear scope | ✓ | |
| Needs research artifacts | | ✓ |
| Multiple collaborators | | ✓ |
| External deliverables (decks, proposals) | | ✓ |
| Spans 2+ months | | ✓ |
| Has milestones/phases | | ✓ |

---

## Folder Structure

```
/projects/
└── <project-slug>/                 # Matches ## heading in GTD.md
    ├── .cybos/
    │   └── context.md              # Project metadata, goals, status
    ├── research/                   # Project-specific research
    │   └── MMDD-<topic>-YY/        # Standard research structure
    ├── content/                    # Deliverables: decks, proposals, docs
    ├── notes/                      # Meeting notes, brainstorms
    └── README.md                   # Optional: public-facing summary
```

### Context Template

```markdown
# Project: [Display Name]

**Slug:** [slug matching GTD ## heading]
**Status:** [Planning | Active | On Hold | Completed | Archived]
**Type:** [Event | Accelerator | Product | Initiative]
**Started:** YYYY-MM-DD
**Target:** YYYY-MM-DD (optional)
**Lead:** [Person]

## Goal

[One paragraph: what does success look like?]

## Key Results

- [ ] KR1: Measurable outcome
- [ ] KR2: Measurable outcome
- [ ] KR3: Measurable outcome

## Scope

**In scope:**
- Item 1
- Item 2

**Out of scope:**
- Item 1

## Collaborators

| Person | Role | Contact |
|--------|------|---------|
| [Name] | [Role] | [email/telegram] |

## Timeline / Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Phase 1: Discovery | YYYY-MM-DD | Done |
| Phase 2: Build | YYYY-MM-DD | Active |
| Phase 3: Launch | YYYY-MM-DD | Pending |

## Dependencies

- [External dependency 1]
- [Blocker if any]

## Open Questions

- [Question 1]

## Log

### YYYY-MM-DD
- [What happened]

### YYYY-MM-DD
- [What happened]
```

---

## Projects vs Deals

| Aspect | /deals | /projects |
|--------|--------|-----------|
| **Purpose** | Evaluate external investment | Execute internal initiative |
| **Ownership** | External founders own the company | We own the project |
| **Outcome** | Invest / Pass decision | Deliverable completion |
| **Timeline** | Weeks (DD cycle) | Weeks to months |
| **Primary artifacts** | Research reports, memo | Content, decks, tools |
| **Task source** | Ad-hoc, call follow-ups | GTD.md `## heading` |
| **Status flow** | Sourced → DD → IC → Decision | Planning → Active → Completed |

### Overlap Handling

Some initiatives touch both:
- "Run accelerator" = Project
- "Evaluate accelerator applicant X" = Deal

Rule: If it's about **deciding to invest in external entity**, it's a deal. Everything else is a project.

---

## Commands

### /cyber-init-project

Create project folder with context template.

```bash
/cyber-init-project "Cyber Accelerator Q1"
```

Creates:
```
/projects/cyber-accelerator-q1/
├── .cybos/
│   └── context.md    # Pre-filled template
├── research/
├── content/
└── notes/
```

Also adds `## cyber-accelerator-q1` to GTD.md under `# Building` if not exists.

### /cyber-project

Show project status and context.

```bash
/cyber-project scheduler
/cyber-project "context-graph"
```

Output:
- Status from context.md
- Tasks from GTD.md under that heading
- Recent activity from folder
- Milestones progress

### /cyber-gtd Extensions

```bash
# Process tasks from specific project only
/cyber-gtd --project scheduler

# Process all Building tasks (all projects)
/cyber-gtd --building

# Process only # Next (standalone tasks)
/cyber-gtd --next
```

### /cyber-projects

List all projects with status.

```bash
/cyber-projects
/cyber-projects --active
/cyber-projects --type product
```

---

## Context Auto-Loading

When user mentions a project:

1. Check if `/projects/<slug>/` exists
2. If exists, read `/projects/<slug>/.cybos/context.md`
3. Also check GTD.md for tasks under `## slug`
4. Incorporate into response

Pattern matches:
- "Work on scheduler" → load `/projects/scheduler/`
- "Context graph status" → load `/projects/context-graph/`
- "What's left for content project" → load `/projects/content/`

---

## Workflow Integration

### Research for Projects

```bash
/cyber-research-topic "vector databases for context graph" --project context-graph
```

Saves to `/projects/context-graph/research/` instead of `/research/`.

### Content for Projects

Project content (decks, proposals) saved to `/projects/<slug>/content/`:

```
/projects/cyber-accelerator-q1/content/
├── pitch-deck-v1.md
├── application-form.md
└── sponsor-proposal.md
```

### Logging

Project activity logged to:
1. `/.cybos/logs/MMDD-YY.md` (global log, as usual)
2. `/projects/<slug>/.cybos/context.md` Log section (project-specific timeline)

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Create `/projects/` directory
- [ ] Create context.md template
- [ ] Create `/cyber-init-project` command
- [ ] Normalize GTD.md headings to kebab-case

### Phase 2: Core Commands
- [ ] Implement `/cyber-project` (show project status)
- [ ] Implement `/cyber-projects` (list all)
- [ ] Update `/cyber-gtd` with `--project` flag
- [ ] Add project context auto-loading

### Phase 4: Workflow Integration
- [ ] Update research commands with `--project` flag
- [ ] Add project logging to context.md
- [ ] Create project templates for common types (event, product, initiative)

---

## Architecture Updates

Add to `docs/ARCHITECTURE.md`:

```markdown
## Project System

Projects are multi-week initiatives tracked in GTD.md and optionally expanded in `/projects/`.

### GTD.md Structure

```markdown
# project-slug
- Task 1
- Task 2
```

### Folder Structure

```
/projects/<slug>/
├── .cybos/context.md    # Goals, status, collaborators
├── research/               # Project-specific research
├── content/                # Deliverables, decks
└── notes/                  # Meeting notes
```

### vs Deals

- **Deals**: External companies, investment decision
- **Projects**: Internal initiatives, execution focus

### Commands

| Command | Purpose |
|---------|---------|
| `/cyber-init-project "Name"` | Create project folder |
| `/cyber-project slug` | Show project status |
| `/cyber-projects` | List all projects |
| `/cyber-gtd --project slug` | Process project tasks |
```

Add to `CLAUDE.md` workflow table:

```markdown
| "Project status", "work on project X" | `/cyber-project` command |
| "Create project", "init project" | `/cyber-init-project` command |
| "List projects", "all projects" | `/cyber-projects` command |
```

---

## Open Questions

1. **Should `/projects/` be in git?**
   - Yes for structure and context
   - Large artifacts (videos, raw data) in .gitignore

2. **Archive strategy?**
   - Completed projects move to `/projects/_archive/<slug>/`?
   - Or just change status in context.md?

3. **Cross-project dependencies?**
   - Some projects depend on others (content depends on context-graph)
   - Track in context.md Dependencies section, query via DB

4. **Team visibility?**
   - When team uses cybos, projects need access control
   - Future: add `visibility: private|team|public` to context.md

---

*This plan extends the Cybos architecture to handle larger initiatives while maintaining the file-first, GTD-integrated philosophy.*
