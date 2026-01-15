# Call Prep Workflow

Handle: "call with X", "meeting with X", "X <> Y", "sync with X"

## Steps

1. **Extract participants** - Parse names from task
2. **Lookup entities** - Query index for each participant
3. **Load context:**
   - Previous calls with this person/org
   - Deal folder if exists
   - Recent email threads (if relevant)
4. **Research if needed:**
   - New contact → quick company/person research
   - Portfolio company → load latest updates
5. **Prepare materials:**
   - Meeting agenda (3-5 bullet points)
   - Key questions to ask
   - Context summary (what you know)
   - Open items from previous calls

## Output Format

```markdown
## Context Summary

[Who they are, what you've discussed before]

## Agenda

1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

## Questions to Ask

- [Question 1]
- [Question 2]

## Open Items (from previous calls)

- [Item mentioned in last call]

## Notes Space

[Leave blank for meeting notes]
```

## For VC Calls (Deal-Related)

Also include:
- Investment thesis fit
- Key diligence questions
- Concerns/red flags to explore
- Competitive landscape notes

## For Portfolio Calls

Also include:
- Recent metrics/updates
- Open asks/support needs
- Intro requests pending
