# Agent Selection Matrix

Dynamic agent selection based on research type and intensity level.

---

## Matrix Overview

| Research Type | Quick (1 agent) | Standard (2-3 agents) | Deep (3-5 agents + review) |
|---------------|-----------------|----------------------|---------------------------|
| **Company DD** | company-researcher | company-researcher<br>market-researcher<br>financial-researcher | company-researcher<br>market-researcher<br>financial-researcher<br>team-researcher<br>+ quality-reviewer |
| **Technology** | tech-researcher | tech-researcher<br>market-researcher | tech-researcher<br>market-researcher<br>company-researcher*<br>+ quality-reviewer |
| **Market** | market-researcher | market-researcher<br>financial-researcher | market-researcher<br>financial-researcher<br>company-researcher*<br>+ quality-reviewer |
| **Topic (Content)** | content-researcher | content-researcher | content-researcher<br>+ quality-reviewer |
| **Topic (Investment)** | investment-researcher | investment-researcher<br>market-researcher | investment-researcher<br>market-researcher<br>financial-researcher<br>+ quality-reviewer |

*For key players in the space

---

## Agent Descriptions

### Core Researchers

**company-researcher**
- **Focus**: Business model, product, traction, metrics
- **Tools**: All MCPs (perplexity, exa, parallel-search)
- **Output**: Company overview, product analysis, traction data
- **Use when**: Researching specific companies or key market players

**market-researcher**
- **Focus**: TAM, market dynamics, competitive landscape, timing
- **Tools**: All MCPs
- **Output**: Market sizing, trends, competition, "why now"
- **Use when**: Understanding market opportunity or sector analysis

**financial-researcher**
- **Focus**: Funding history, metrics, unit economics, comparables
- **Tools**: All MCPs
- **Output**: Financial analysis, valuation assessment, investor signals
- **Use when**: Need financial/funding context

**team-researcher**
- **Focus**: Founder backgrounds, expertise, energy, sales capability
- **Tools**: All MCPs + LinkedIn search
- **Output**: Team assessment against founder rubric
- **Use when**: Deep company DD (evaluating team quality)

**tech-researcher**
- **Focus**: How technology works, technical moat, maturity, performance
- **Tools**: All MCPs + code search (Exa)
- **Output**: Technical deep-dive, moat analysis, Big Tech threat assessment
- **Use when**: Technology evaluation or technical due diligence

### Topic Researchers

**content-researcher**
- **Focus**: Academic papers, trusted social media accounts, first-principle research, literature review
- **Tools**: All MCPs + academic search (Perplexity Deep, Exa)
- **Output**: Multi-perspective topic exploration for content creation (narratives, ideas, people)
- **Use when**: Researching topics for essays, posts, or understanding ideas/narratives

**investment-researcher**
- **Focus**: Market dynamics, technology trends, investment opportunities, timing
- **Tools**: All MCPs
- **Output**: Topic analysis through investment lens (opportunities, timing, players)
- **Use when**: Researching topics for investment thesis development

### Support Agents

**quality-reviewer**
- **Focus**: Gap analysis, contradiction detection, completeness check
- **Tools**: Read only (reviews agent outputs)
- **Output**: Quality assessment + follow-up tasks
- **Use when**: Deep research mode only

**synthesizer**
- **Focus**: Consolidate research, eliminate redundancy, apply investment lens
- **Tools**: Read only (reads all agent outputs)
- **Output**: Unified research report
- **Use when**: All research (final synthesis step)

---

## Selection Logic

### 1. Company DD

**Quick** → company-researcher
- Fast company overview
- Basic facts and metrics

**Standard** → company-researcher + market-researcher + financial-researcher
- Comprehensive company analysis
- Market context and financial history
- Default for most company research

**Deep** → Standard + team-researcher + quality-reviewer
- Full due diligence quality
- Team assessment included
- Quality review ensures completeness
- Memo-ready output

### 2. Technology Deep-Dive

**Quick** → tech-researcher
- Technical overview only
- How it works, maturity level

**Standard** → tech-researcher + market-researcher
- Technical analysis + market opportunity
- Default for tech research

**Deep** → Standard + company-researcher + quality-reviewer
- Technical + market + key players
- Comprehensive technology landscape
- Quality review for completeness

**Note**: company-researcher in deep mode focuses on key players/companies using this technology

### 3. Market Analysis

**Quick** → market-researcher
- Market sizing and dynamics
- Quick landscape view

**Standard** → market-researcher + financial-researcher
- Market analysis + funding/investment trends
- Default for market research

**Deep** → Standard + company-researcher + quality-reviewer
- Market + financials + key players
- Comprehensive sector analysis
- Quality review for gaps

**Note**: company-researcher in deep mode focuses on leading companies in the market

### 4. Topic Research (Content)

**Quick** → content-researcher
- Surface-level topic overview
- Key narratives and perspectives

**Standard** → content-researcher
- Comprehensive topic exploration
- Academic papers + social media + literature
- Default for content research

**Deep** → content-researcher + quality-reviewer
- Exhaustive multi-source research
- Quality review ensures all angles covered
- Best for complex/controversial topics

**Use cases**:
- Essay research ("AI second-order effects")
- Narrative development ("Agent economy")
- Idea exploration ("Civilizational compression")

### 5. Topic Research (Investment)

**Quick** → investment-researcher
- Investment angle only
- Quick opportunity assessment

**Standard** → investment-researcher + market-researcher
- Investment opportunities + market context
- Default for investment topic research

**Deep** → Standard + financial-researcher + quality-reviewer
- Investment thesis + market + funding landscape
- Comprehensive investment opportunity analysis
- Quality review for completeness

**Use cases**:
- Investment thesis development ("AI infrastructure opportunities")
- Sector analysis ("Robotics investment landscape")
- Trend evaluation ("Decentralized AI timing")

---

## Special Cases

### When to Add team-researcher

**Always include** in deep company DD.

**Consider including** when:
- Founder quality is critical to thesis
- Early-stage company (team > product)
- Turnaround situation (need execution capability)

### When to Use content-researcher vs investment-researcher

**content-researcher**:
- Goal is understanding ideas/narratives
- Output will be essays, posts, or public content
- Focus on intellectual depth and perspectives
- Examples: "AI consciousness debate", "Crypto philosophical foundations"

**investment-researcher**:
- Goal is finding investment opportunities
- Output will inform investment decisions
- Focus on market dynamics and commercial viability
- Examples: "AI infrastructure opportunities", "Web3 gaming investment thesis"

**Both** (deep mode):
- Complex topics with both intellectual and commercial dimensions
- Example: "Decentralized AI" (content-researcher explores principles, investment-researcher finds opportunities)

### When to Skip quality-reviewer

**Always skip** in Quick and Standard modes (too expensive for marginal benefit).

**Skip in Deep mode** when:
- Research is time-sensitive
- Topic is well-defined and narrow
- Follow-up iteration unlikely to yield value

---

## Agent Count Guidelines

| Intensity | Min Agents | Max Agents | Typical Count |
|-----------|------------|------------|---------------|
| Quick | 1 | 1 | 1 |
| Standard | 2 | 3 | 2-3 |
| Deep | 3 | 6 | 4-5 (including quality-reviewer) |

**Cost considerations**:
- Each Haiku agent: ~$0.02-0.10
- Each Sonnet agent: ~$0.10-0.30
- Each Opus agent: ~$0.50-2.00
- Quality review iteration: +$0.10-0.50

**Deep mode total**: $1.00-3.00 (depending on agents and iterations)

---

## Output Expectations

### Quick (1 agent, 10-30s)

- Brief summary (1-2 pages)
- Key facts only
- No synthesis required
- Good for: validation, quick checks

### Standard (2-3 agents, 2-5m)

- Comprehensive report (3-5 pages)
- Multiple perspectives synthesized
- Investment lens applied
- Good for: normal research, decision support

### Deep (3-5+ agents, 5-15m)

- Exhaustive analysis (5-10+ pages)
- All dimensions covered
- Quality-reviewed for gaps
- Memo-ready quality
- Good for: IC presentations, investment memos

---

## Modification Guidelines

**Adding new research type**:
1. Define primary agent (Quick)
2. Add 1-2 complementary agents (Standard)
3. Add full agent set + quality-reviewer (Deep)
4. Update this matrix

**Adding new agent**:
1. Create agent definition in `.claude/agents/`
2. Specify domain focus and tools
3. Add to appropriate research types
4. Update this matrix

**Changing agent combinations**:
1. Test new combination on sample research
2. Verify synthesis quality
3. Update matrix if improvement confirmed
