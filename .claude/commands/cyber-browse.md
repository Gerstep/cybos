Scan Twitter home timeline to discover trending topics for content creation.

Source: $ARGUMENTS (default: "twitter")

Follow the Browse skill's twitter-feed workflow:
@.claude/skills/Browse/workflows/twitter-feed.md

**Workflow steps:**

1. **SETUP**: Get browser context, navigate to Twitter (load handle from context/identity.md)
2. **SCAN**: Scroll through home timeline, capture ~20-30 posts
3. **FILTER**: Include AI/crypto/robotics/VC topics, exclude politics/celebrity
4. **RANK**: By relevance to cyber.Fund thesis, engagement, recency
5. **SYNTHESIZE**: Identify 5 top topics with angles for content
6. **OUTPUT**: Display topics and save to /content/ideas/MMDD-browse-YY.md
7. **LOG**: Append entry to /.cybos/logs/YYYY-MM-DD.md

Quality gates: relevance, freshness (<48h), engagement signals, unique angles, topic diversity.
