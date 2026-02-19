# Create Intro Group Workflow

Facilitate introductions by creating Telegram groups with relevant parties and a draft intro message.

**CRITICAL: NEVER SEND MESSAGES. Only save drafts. User reviews and sends manually.**

## When to Use

Use this workflow when:
- User asks to "intro" or "connect" two parties
- User says someone "agreed to an intro"
- User wants to facilitate a business introduction
- Connecting portfolio companies with partners, investors, or collaborators

## Prerequisites

1. **Identify the parties**: Determine who needs to be introduced
2. **Get usernames**: Find Telegram usernames for all parties (check existing chats, ask user)
3. **Understand context**: Know why the intro is being made (for the intro message)

## Workflow Steps

### 1. GATHER CONTEXT

Read relevant conversations to understand:
- Who are the parties being introduced?
- What's the purpose of the introduction?
- Any specific talking points or context to include?

```bash
# Read existing group chats for context
bun scripts/telegram-gramjs.ts --user "Company A" --dry-run
bun scripts/telegram-gramjs.ts --user "Company B" --dry-run
```

### 2. IDENTIFY USERNAMES

Find Telegram usernames for all participants. Sources:
- Existing chat history (check work files from step 1)
- Ask the user directly
- Check entity database

**Required format**: `@username` (e.g., `@paigeinsf`, `@JanLiphardt`)

### 3. DRY RUN - VERIFY USERS

Always verify usernames can be resolved before creating the group:

```bash
bun scripts/telegram-create-group.ts --dry-run \
  --title "Company A <> Company B" \
  --users "@user1,@user2,@user3,@user4"
```

**Expected output:**
```
✅ Resolved 4/4 users
✅ DRY RUN complete - all users can be resolved
```

If any users fail to resolve:
- Check username spelling
- Ask user for correct username
- The user may have privacy settings preventing resolution

### 4. DRAFT INTRO MESSAGE

Create a concise intro message that:
- Greets everyone
- States the purpose of the introduction
- Provides brief context on why the intro is relevant
- Keeps it short (2-3 sentences max)

**Good intro message template:**
```
Hey everyone! Connecting [Party A] and [Party B] teams to explore [purpose].

[One sentence of relevant context if needed.]
```

**Examples:**
- "Hey everyone! Connecting OpenMind and Legion teams to explore potential collaboration on fundraising."
- "Intro! [Name] from [Company A], meet [Name] from [Company B] - thought you two should connect given your shared interest in [topic]."

### 5. ASK USER FOR CONFIRMATION

Before creating, confirm with user:
- Group title (typically "Company A <> Company B")
- List of members and their roles
- Draft intro message

### 6. CREATE GROUP

```bash
bun scripts/telegram-create-group.ts \
  --title "Company A <> Company B" \
  --users "@user1,@user2,@user3,@user4" \
  --draft "Hey everyone! Connecting..."
```

**What happens:**
1. Script resolves all usernames to Telegram user IDs
2. Creates a new group chat with specified title
3. Adds all users to the group
4. Saves the draft intro message (not sent)

### 7. VERIFY AND REPORT

After creation:
```
Group created: "Company A <> Company B"
Members: @user1, @user2, @user3, @user4
Draft saved: "Hey everyone! Connecting..."

Next: Open Telegram to review and send the intro message.
```

### 8. LOG

Append to logs:
```markdown
## HH:MM | telegram | intro | Company A <> Company B
- Workflow: create-intro-group
- Group: Company A <> Company B
- Members: 4
- Draft: saved
```

## Group Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Company intro | `Company A <> Company B` | `OpenMind <> Legion` |
| Person intro | `Name A <> Name B` | `Alice <> Bob` |
| Deal group | `Company <> cyber•Fund` | `Startup <> cyber•Fund` |

## Error Handling

**Username not found:**
- Double-check spelling
- User may have privacy settings enabled
- Ask user for alternative contact method

**Group creation failed:**
- Check API rate limits (wait and retry)
- Verify all users allow being added to groups
- Some users may have blocked group invites from non-contacts

**Draft save failed:**
- Group was likely still created
- Use `save-telegram-draft.ts` to save draft separately (resolves @usernames instantly via API, falls back to dialog search for names):
  ```bash
  bun scripts/save-telegram-draft.ts "Group Name" "Draft message"
  ```

## Privacy Considerations

- Only create groups when explicitly requested
- Ensure both parties have agreed to the introduction
- Don't add people to groups without their knowledge/consent
- Keep intro messages professional and relevant
