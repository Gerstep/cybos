# Twitter Feed Browse Workflow

Scan Twitter home timeline to discover trending topics for content creation.

## Inputs

- Twitter account: Load handle from `context/identity.md`
- Focus areas: AI, crypto, robotics, VC, futurism

## Workflow Steps

### 1. SETUP

Get browser context and navigate to Twitter:

```
mcp__claude-in-chrome__tabs_context_mcp (createIfEmpty: true)
mcp__claude-in-chrome__navigate (url: "https://x.com/home")
```

### 2. SCAN FEED

Scroll through the home timeline systematically:

- Take initial snapshot with `read_page`
- Scroll down 10 ticks, capture content
- Repeat 5-10 times to gather ~20-30 posts
- Note trending topics in sidebar

**Capture for each post:**
- Author and handle
- Post content (first ~200 chars)
- Engagement: replies, retweets, likes, views
- Quoted/linked content if relevant
- Timestamp

### 3. FILTER & RANK

Filter posts by relevance:

**Include:**
- AI/ML tools, models, research
- Crypto/DeFi/Web3 developments
- Tech industry news and analysis
- Investment/VC patterns
- Future predictions and trends
- High engagement (>100 likes OR >10K views)

**Exclude:**
- Pure politics (unless tech-relevant)
- Celebrity/entertainment
- Sports
- Low-signal promotional content

**Rank by:**
1. Relevance to cyber.Fund thesis
2. Engagement signals
3. Recency (prefer <24h)
4. Potential for unique angle

### 4. SYNTHESIZE TOPICS

Identify 5 top topics from scan. For each:

```
## [Topic Number]. [Topic Title]

**Engagement:** [X likes, Y views on key posts]

**What's happening:**
- [Bullet 1: Core development/news]
- [Bullet 2: Supporting data point]
- [Bullet 3: Key voices/accounts discussing]

**Angle for you:** [Suggested post angle matching your voice]
```

### 5. OUTPUT

Display topics in structured format.

**Save**:
Save to `/content/ideas/MMDD-browse-YY.md`:

```markdown
# Browse: Twitter Feed
**Date:** MMDD-YY HH:MM
**Source:** Twitter home timeline

---

[Topic entries from Step 4]

---

## Raw Scan Notes
[Any additional context, threads to revisit, accounts to follow]
```

### 6. LOG

Append to `/.cybos/logs/MMDD-<slug>-YY.md`:

```markdown
## HH:MM | browse | twitter | [Top topic summary]
- Workflow: twitter-feed
- Posts scanned: ~X
- Topics identified: 5
- Output: [displayed / saved to path]

---
```

## Quality Gates

Before presenting topics:

1. **Relevance check**: All 5 topics fit cyber.Fund's focus areas
2. **Freshness check**: Topics are current (<48h)
3. **Engagement check**: Each topic has signal (not just random posts)
4. **Angle check**: Each topic has a non-obvious angle for your voice
5. **Diversity check**: Topics span different themes (not all AI or all crypto)

## Tips for Better Scans

- Check "Following" tab for curated feed
- Check custom lists (e.g., "e/acc", "deAI") if available
- Note "Pinned by people you follow" section
- Check trending sidebar for broader context
- Look for threads, not just single tweets

## Error Handling

**If Twitter not logged in:**
- Report to user, suggest manual login
- Don't attempt automated login

**If feed is empty/loading:**
- Wait additional 3-5 seconds
- Refresh page once
- Report if still failing

**If browser extension not responding:**
- Check `tabs_context_mcp` for available tabs
- Report connection issue to user
