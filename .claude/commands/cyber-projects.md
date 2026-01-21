List all projects with status.

Arguments: $ARGUMENTS

**Optional flags**:
- `--active` - Show only active projects
- `--type <type>` - Filter by type (event, accelerator, product, initiative)
- `--gtd-only` - Show only projects that exist in GTD.md but have no folder

**Steps**:

1. Scan for projects from two sources:

   a. **GTD.md headings**: Parse `# heading` lines that are not reserved
      - Reserved headings (skip): `# Next`, `# Someday`, `# IC`, `# Skip`
      - Everything else is a project slug

   b. **Project folders**: List directories in `~/CybosVault/private/projects/`
      - Each directory is a project
      - Read `.cybos/context.md` for status/type

2. Merge project lists:
   - GTD-only: Has heading but no folder
   - Folder-only: Has folder but no GTD heading (orphaned - warn)
   - Both: Has both heading and folder (full project)

3. For each project, extract:
   - Slug
   - Status (from context.md, or "GTD-only" if no folder)
   - Type (from context.md, or "unknown" if no folder)
   - Task count (from GTD.md heading)
   - Has folder (yes/no)

4. Apply filters if specified

5. Display as table:

```markdown
# Projects

| Slug | Status | Type | Tasks | Folder |
|------|--------|------|-------|--------|
| scheduler | Active | Product | 3 | Yes |
| context-graph | Planning | Product | 4 | Yes |
| demo-day-2026 | Active | Event | 2 | Yes |
| misc | - | - | 5 | No (GTD-only) |

**Summary:** X projects (Y active, Z with folders)

## Quick Actions

- View project: `/cyber-project <slug>`
- Create folder: `/cyber-init-project "<Name>"`
- Process tasks: `/cyber-gtd --project <slug>`
```

6. Warn about orphaned projects (folder exists but no GTD heading):
   - "Warning: ~/CybosVault/private/projects/old-project/ has no matching GTD heading"

**Examples**:
```bash
/cyber-projects
/cyber-projects --active
/cyber-projects --type product
/cyber-projects --gtd-only
```
