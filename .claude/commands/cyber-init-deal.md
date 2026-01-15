Initialize folder structure for a new deal.

Company name: $ARGUMENTS

Create the following structure:

```
/deals/<company-slug>/
├── .cybos/
│   ├── context.md (from template)
│   └── scratchpad/
├── research/
└── memo/
```

**Steps**:

1. Convert company name to kebab-case slug
   - Example: "Acme Corp" → "acme-corp"

2. Create directory structure

3. Populate context.md with deal context template:

```markdown
# Deal: [Company Name]

**Status**: Sourced
**Stage**: [Pre-seed | Seed | Series A | ...]
**First Contact**: MMDD-YY
**Lead**: [Partner name]

## Key Contacts
- Founder: [Name] ([email])

## Quick Facts
- Raising: $[X] at $[Y] valuation
- Sector: [AI Infra | Crypto | Robotics | ...]
- Thesis fit: [How this fits cyber•Fund focus]

## Open Questions
- [Question 1]

## Notes
[Running notes from calls, research, etc.]
```

4. Create empty scratchpad directory for agent working files

5. Log the action to /.cybos/logs/MMDD-<slug>-YY.md:
   ```
   ## HH:MM | dealflow | init-deal | [Company Name]
   - Workflow: init-deal
   - Output: /deals/<company-slug>/ created

   ---
   ```

After initialization, user can run `/cyber-research-company` to populate with research.
