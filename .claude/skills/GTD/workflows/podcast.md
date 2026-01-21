# Podcast Workflow

Handle: "podcast with X", "podcast prep X"

## Steps

1. **Extract guest/topic** - Parse from task
2. **Research guest:**
   - Background, current role
   - Previous podcast appearances
   - Recent writing/talks
   - Hot takes / controversial opinions
3. **Load context:**
   - Previous interactions (calls, emails)
   - Entity file if exists
4. **Prepare materials:**
   - Guest bio (2-3 sentences)
   - Episode angle / thesis
   - Question list (10-15 questions)
   - Potential clips / quotable moments

## Output Format

```markdown
## Guest Bio

[Name] is [role] at [company]. [1-2 sentences of relevant background].

## Episode Angle

[What makes this conversation interesting? What's the thesis?]

## Questions

### Opening (warm-up)
1. [Question]
2. [Question]

### Core Topic
3. [Question]
4. [Question]
5. [Question]
6. [Question]

### Spicy / Controversial
7. [Question that might get a strong reaction]
8. [Contrarian take to push back on]

### Closing
9. [What's next for you/company?]
10. [Where can people find you?]

## Research Notes

[Key facts, quotes, talking points to reference]

## Potential Clips

[Topics/questions likely to generate shareable moments]
```

## Research Depth

- Known guest → focus on recent work, new angles
- New guest → deeper background research
- Technical topic → @Research skill for subject matter

## Links to Other Skills

For deep research on guest's company/technology:
→ @.claude/skills/Research/workflows/company.md
→ @.claude/skills/Research/workflows/tech.md
