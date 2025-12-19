# Outreach Workflow

Handle: "ask for call", "message X", "email X", "reach out to X"

## Steps

1. **Extract target** - Parse person/org name from task
2. **Lookup entity** - Query database: `bun scripts/db/query.ts find-entity "<name>" --json`
3. **Find contact method:**
   - Email (preferred for formal requests)
   - Telegram (if available, for quick asks)
   - Twitter DM (last resort)
4. **Load context:**
   - Previous calls from `~/CybosVault/private/context/calls/`
   - Deal context if exists
   - Entity notes
5. **Draft message:**
   - Keep short (3-5 sentences)
   - Reference shared context if any
   - Clear ask (propose call, share info, etc.)
6. **Output with pending actions:**
   - [ ] Send via Gmail to <email>
   - [ ] Alternative: Telegram @handle

## Message Templates

### Ask for Call (Formal)

```
Hi [Name],

[Context/connection if any]. Would love to catch up and [reason].

Do you have 30 min this week or next?

Best,
[Your Name]
```

### Ask for Call (Warm)

```
Hey [Name],

[Context]. Quick call sometime this week?

[Your Name]
```

### Follow-up

```
Hi [Name],

Following up on [previous context]. [Ask/update].

Best,
[Your Name]
```

## If Contact Not Found

Ask user: "I couldn't find contact for [X]. Can you provide email/handle?"

Store in entity file for next time.

## Telegram vs Email

- Email: First contact, formal, scheduling
- Telegram: Quick follow-ups, informal, time-sensitive
