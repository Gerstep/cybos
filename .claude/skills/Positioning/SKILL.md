---
name: positioning
description: Guide founders and teams through a structured positioning statement exercise. Combines competitive research, strategic questioning, and team alignment to produce a sharp, honest positioning statement. Use when a company needs to define who they are, what they offer, and why anyone should care.
---

# Positioning Skill

Structured positioning statement exercise for startups and teams. Combines deep competitive research with forced-choice strategic questions to produce an honest, compressed positioning statement.

Designed for accelerator portfolio companies, internal use, or any team that can't answer "why us?" in one sentence.

## Philosophy

Most positioning exercises produce corporate fluff because they skip the hard questions. This skill forces honesty by:
- Researching competitors BEFORE asking questions (so you can't hide from reality)
- Making every question a forced choice (no "all of the above")
- Requiring the team to write independently, then collide answers
- Compressing the final output to under 30 words

The output is not marketing copy. It's a strategic alignment tool.

## Workflow

### PHASE 1: Context gathering

**Action:** Use `AskUserQuestion` to collect basic info.

```
Questions:
1. "What does the company do? (2-3 sentences, plain language)"
   - Free text
2. "Who is the target customer today?"
   - Free text
3. "What stage? What's the team size?"
   - Options: [Pre-seed solo/duo, Pre-seed with team (3-8), Seed, Series A+]
4. "Is there an existing website, pitch deck, or memo I should read?"
   - Free text (URLs or file paths)
```

**If the user provides a file path or URL:** Read it. Extract product description, claimed differentiators, current messaging, pricing, and team.

**If this is for a portfolio company (user specifies):** Check `~/CybosVault/private/deals/<slug>/` for existing research.

### PHASE 2: Competitive research

**Action:** Launch 2 parallel research agents.

**Agent 1: Direct competitors**
```
subagent_type: market-researcher
prompt: |
  Research the competitive landscape for: [company description from Phase 1].

  Find:
  1. The 3-5 closest competitors (same customer, same problem)
  2. For each: one-liner positioning, pricing, key differentiator, weakness
  3. What do ALL of them say? (common claims = table stakes, not differentiators)
  4. What does NONE of them say? (potential white space)

  Output as a markdown table + 3 bullet summary.
```

**Agent 2: Adjacent/aspirational competitors**
```
subagent_type: company-researcher
prompt: |
  Research companies adjacent to: [company description from Phase 1].

  Find:
  1. 2-3 companies solving a related problem for the same customer
  2. 2-3 companies solving the same problem for a different customer
  3. Any company that this team might secretly aspire to be (the "we're like X but for Y" reference)

  For each: one-liner, why they matter as context.
```

**After agents return:** Present findings to user as a compact summary. Ask:

```
AskUserQuestion:
- "Anything missing or wrong in this competitive picture?"
  Options: [Looks right, Let me add/correct]
- "Which competitor do founders most often compare you to?"
  Free text
```

### PHASE 3: The four questions

**Action:** Present the four positioning questions using `AskUserQuestion`. Each question is informed by the competitive research.

**IMPORTANT:** Frame questions using SPECIFIC competitor names and findings from Phase 2. Do not use generic placeholders.

---

**Q1: The founder/customer test**

```
header: "The customer test"
question: |
  Your ideal customer is evaluating you against [TOP COMPETITOR 1] and [TOP COMPETITOR 2].
  They can only pick one. Why do they pick you?

  Rules:
  - Don't say "price" or "we're cheaper"
  - Don't say "better technology" without specifics
  - Don't say "customer service" (everyone says this)
options:
  - [Generate 3-4 options based on research findings, each representing a distinct strategic direction]
  - "Something else (write your own)"
```

**Q2: The honest gap**

```
header: "The honest gap"
question: |
  What is the single biggest reason your ideal customer says NO today?
  Be specific. Not "we're early stage" — that's a cop-out.
options:
  - [Generate 3-4 options based on competitive weaknesses found in research]
  - "Something else (write your own)"
```

**Q3: The core bet**

```
header: "The core bet"
question: |
  You can only invest in ONE of these directions for the next 6 months.
  Which one?
options:
  - [Generate 3-4 options based on the white space found in research,
     each with a 1-sentence description of what it means concretely]
  - "Something else (write your own)"
```

**Q4: Market scope**

```
header: "Market scope"
question: |
  Which market are you actually in? Pick the one that defines your roadmap.
options:
  - [Generate 3-4 market definitions from narrow to broad,
     based on the company's product and competitive research.
     Example: "Smart contract security for Solidity only" vs
     "AI code security for all languages" vs
     "Critical infrastructure verification"]
```

### PHASE 4: Team collection

**Action:** After the user answers all four questions, generate the team exercise.

Output a clean markdown block that the user can copy-paste to their team:

```markdown
# Positioning Exercise — [Company Name]

Answer each question independently. Don't discuss with teammates first.
Spend max 10 minutes total. Gut reactions > polished answers.

## 1. The customer test
[Customized question with competitor names from research]

## 2. The honest gap
[Customized question]

## 3. The core bet
[Customized question with forced-choice options]

## 4. Market scope
[Customized question with scope options]

## 5. Positioning statement
Fill in, keep under 30 words:
We help [WHO] achieve [WHAT] through [HOW], unlike [ALTERNATIVE].

---
Return all answers to [user name] by [user specifies deadline].
```

Then ask:
```
AskUserQuestion:
- "Send this to your team and paste all their replies here when you have them.
   How many people will respond?"
  Free text
```

### PHASE 5: Synthesis

**Action:** When user pastes team replies, analyze them.

**Analysis structure:**

1. **Alignment map** — Where does everyone agree? (These are real. Use them.)
2. **Contradiction map** — Where do people disagree? (These are the strategic decisions that need to be made.)
3. **Surprise findings** — Anything one person said that nobody else did but is clearly right.
4. **Gap analysis** — Questions nobody answered well (signals the team hasn't thought this through).

Present this analysis, then ask:

```
AskUserQuestion:
- "For each contradiction, which direction do you want to go?"
  [Present each contradiction as a forced binary choice]
```

### PHASE 6: Final positioning statement

**Action:** Generate the combined positioning statement.

**Output format:**

```markdown
# [Company Name] — Positioning Statement

## The customer test
[2-3 sentences. Lead with the answer. No fluff.]

## The honest gap
[1-2 sentences. Brutally honest.]

## The core bet
[2-3 sentences. What you're building, what exists today vs. planned.]

## Market scope
[1 sentence. The market you chose and what it excludes.]

## Positioning statement
[Under 30 words. Fill in the template:]
We help [WHO] achieve [WHAT] through [HOW], unlike [ALTERNATIVE].
```

**Quality rules for final output:**
- No sentence over 20 words
- No adjectives that can't be verified (remove "innovative", "cutting-edge", "world-class", "unique")
- Every claim must be either (a) already true or (b) explicitly marked as a bet
- If something is aspirational, say "By [date], we plan to..." — not "We are..."
- Total length: under 200 words for all sections combined

**Save to:** Ask user where to save. Suggest `~/CybosVault/private/deals/<slug>/positioning.md` for portfolio companies or a path the user specifies.

### PHASE 7: Iteration (optional)

If user wants to iterate, use `AskUserQuestion` to identify which section needs work. Re-run only that section's question with tighter constraints.

## Anti-patterns to avoid

- **Don't generate positioning without research.** The competitive context is what makes questions sharp.
- **Don't let the user skip the team exercise.** Solo positioning statements are echo chambers.
- **Don't use marketing language.** If it sounds like it belongs on a SaaS landing page, rewrite it.
- **Don't accept "all of the above" answers.** Force choices. The pain of choosing IS the exercise.
- **Don't make the final statement longer than 30 words.** Compression is clarity.
