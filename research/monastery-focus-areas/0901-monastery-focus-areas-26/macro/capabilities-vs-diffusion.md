🔍 **STARTING:** investment-researcher analyzing **Macro 2026 — Capabilities vs. Diffusion, and the Investable Gap**

> **Agent**: investment-researcher (macro track)
> **Date**: 2026-09-01
> **Workspace**: `/workspace/research/monastery-focus-areas/0901-monastery-focus-areas-26`
> **Mandate**: Test — not rubber-stamp — the GP thesis: *"AI will radically change the economy, but diffusion takes ~10 years, while capabilities keep compounding at 2024–2026 speed."*
> **Audience**: cyber•Fund GP / Monastery ($2M, 5%, 12 weeks, seed–A, ~10 teams/batch)
> **Source recency bias**: Jul–Aug 2026 prioritized. Every material claim carries URL + date.

---

# 0. VERDICT ON THE THESIS (read this if you read nothing else)

📊 **The thesis is half right, and the wrong half is the investable half.**

**Right**: Aggregate diffusion is genuinely slow. 18% of US firms use AI in a business function (Census BTOS, Nov 2025–Jan 2026 reference period). Only ~10% of organizations have scaled agents in *any* given function (McKinsey State of AI 2026). Measured labor productivity is ~2% y/y in 2026Q2 — barely above the 2004–2019 trend. Acemoglu's task-based ceiling is 0.53–0.71% cumulative TFP over ten years. On the aggregate numbers, "~10 years" is defensible.

**Wrong**: "Diffusion" is not one rate. It is **bimodal**, and the fast mode is not slow at all — it is the fastest commercial diffusion ever recorded. Cursor went $100M → $4B ARR in 18 months (Jan 2025 → Jun 2026) and was acquired by SpaceX for $60B on 14 Aug 2026. Anthropic went $1B → $65B run-rate in ~19 months. Anthropic reports Claude authored >80% of its own merged code as of May 2026, up from low single digits in Feb 2025. Sierra went $100M → $200M ARR in a year on outcome pricing. None of that is a ten-year diffusion curve.

⚠️ **The GP framing to reject**: "capabilities fast, diffusion slow, therefore invest in the waiting room." That framing produces tooling bets that Big Tech absorbs.

💡 **The GP framing to adopt**: *Diffusion speed is a function of buyer structure, not of model quality.* Where the buyer is an individual practitioner with budget authority, output is machine-verifiable, and there is no integration or regulatory gate, diffusion is 12–24 months. Where the buyer is an institution, output is not verifiable, and there is integration/regulation/physical presence, diffusion is 5–10 years. **The thesis's "10 years" describes the second mode and mis-prices the first.**

📊 **The three arbitrages a $2M/12-week Monastery can actually trade** (developed in §7):
1. **The 50%→80% reliability gap** — frontier agents run 16–20h tasks at 50% success but only 3–4h at 80% (METR, Feb–Mar 2026 pilot). Commercial deployment needs 80%+. Everything that closes that gap in a *specific* domain is a business.
2. **The workflow-redesign gap** — 39% of adopters report EBIT impact but only ~21% have redesigned a workflow (McKinsey 2026 / BCG AI Radar 2026). Model quality is not the binding constraint; workflow ownership is.
3. **The compute-opportunity-cost gap** — OpenAI killed Sora on 26 Apr 2026 at ~$1M/day burn against $2.1M lifetime revenue. Frontier labs will *abandon* high-COGS/low-ARPU categories to feed enterprise coding. That vacates real territory.

---

# 1. MACRO 2026 — THE SETUP

## 1.1 Rates: the regime flipped from cuts to hikes

📊 **Where we are as of 2026-09-01**:

| Variable | Level | As-of | Source |
|---|---|---|---|
| Fed funds target | 3.50–3.75% | July 2026 FOMC (held) | [CNBC 2026-08-31](https://www.cnbc.com/2026/08/31/markets-see-warsh-endorsing-a-rate-hike-in-september-not-everyone-is-convinced.html) |
| Sept 16 **hike** odds | 65–68% (was ~36% pre-Jackson Hole) | 2026-09-01 | [TechTimes 2026-09-01](https://www.techtimes.com/articles/326153/20260901/fed-rate-hike-68-odds-opens-five-day-window-for-variable-rate-borrowers.htm) |
| Trailing 12m CPI peak | 4.2% (May 2026, 3-year high) | 2026-09-01 | [Motley Fool 2026-09-01](https://www.fool.com/investing/2026/09/01/odds-sept-rate-hike-doubled-fed-chair-kevin-warsh/) |
| Months inflation >2% target | 65 | Warsh, Jackson Hole 2026-08-28 | [Motley Fool 2026-09-01](https://www.fool.com/investing/2026/09/01/odds-sept-rate-hike-doubled-fed-chair-kevin-warsh/) |
| 10-year Treasury | ~4.79% (highest since Jan 2025) | 2026-09-01 | [TechTimes 2026-09-01](https://www.techtimes.com/articles/326153/20260901/fed-rate-hike-68-odds-opens-five-day-window-for-variable-rate-borrowers.htm) |
| 30-year Treasury | 5.33% (19-year high, Aug 2026) | Aug 2026 | [note.com 2026-08-31](https://note.com/hirokimiyano/n/ne6441496adce?hl=en) |
| 30-year mortgage | 6.78% | Aug 2026 | same |

📊 **Fed Chair Kevin Warsh's framing (Jackson Hole, 2026-08-28)** is the single most important macro sentence for this research: the economy is in *"a race"* between AI-driven efficiency gains and AI-driven capex demand, and **the outcome of that race determines the path of rates** ([The Overshoot / Matthew C. Klein](https://theovershoot.co/p/ai-productivity-and-rates-part-i)).

💡 **GP read**: For the first time, AI diffusion speed is a *monetary policy variable*. If diffusion is slow (our thesis), capex demand wins the race, inflation stays sticky, rates stay high or rise. **The GP thesis, if correct, implies a higher-for-longer rate regime — which is precisely the regime that punishes long-duration, capital-hungry startups and rewards fast-to-revenue ones.** That is an argument for Monastery-stage discipline, not against it.

⚠️ **Contradiction to hold**: Warsh is simultaneously hawkish on inflation and constructive on AI productivity ("growth rates could be boosted through productivity improvements due to vigorous investment related to AI"). He cannot be right on both without a specific view on timing. Neither can we.

## 1.2 The labor market is a barbell, and the young end is broken

📊 **July 2026 employment report** ([BLS, 2026-08-07](https://www.bls.gov/news.Release/empsit.htm); [Reuters 2026-08-07](https://www.reuters.com/business/us-nonfarm-payrolls-fall-july-unemployment-rate-eases-41-2026-08-07/)):

- Nonfarm payrolls **−23,000** vs consensus **+80,000**
- May + June revised down by a combined **103,000**
- Unemployment **4.1%** — but *falling for the wrong reason*: labor force shrank 264,000
- Participation **61.4%** — lowest since Feb 2021; ex-Covid, lowest since mid-1976
- U-6 **7.9%**
- Average hourly earnings **+3.2% y/y** — lowest since May 2021
- Prior-12-month average monthly gain: **+34,000** (i.e., the trend is near zero)

📊 **The structural signal underneath**: white-collar payrolls (professional & business services + financial activities + information) have contracted for **31 consecutive months** ([Blue Line Search, 2026](https://www.bluelinesearch.ai/insights/white-collar-payroll-contraction-31-months-recruiter-2026), citing BLS via Quartz). Aaron Terrazas: *"We have not seen this long of a contraction in white-collar jobs outside of a recession ever before."* Hiring rate in professional & business services is at 2008-crisis levels — ~1.6 open roles per 100 employees.

📊 **Stanford Digital Economy Lab, "Canaries in the Coal Mine," August 2026 revision** ([PDF](https://digitaleconomy.stanford.edu/app/uploads/2026/08/Canaries_August2026.pdf); [summary 2026-08](https://digitaleconomy.stanford.edu/news/canariesaug26/)) — ADP payroll microdata through June 2026:

1. **No** economy-wide displacement.
2. Employment of workers **aged 22–25 in AI-exposed occupations is 19% below** counterfactual parity with less-exposed peers.
3. That gap has **widened from 15% (July 2025 vintage) to 19% (June 2026 vintage)**.
4. Mechanism is **reduced hiring**, not increased separations.
5. Declines concentrate where AI **substitutes**; where AI **complements**, employment is flat or rising, especially for experienced workers.
6. Adjustment runs through headcount, **not base pay**.
7. Survives controls for tech-firm exclusion, interest-rate exposure, and remote work.

Brynjolfsson (to WaPo): *"The entry-level effects we're measuring are real, persistent and widening… I'm more worried than I was about a labor market that keeps its overall employment level while quietly closing the on-ramp for people starting their careers."*

⚠️ **The counter-evidence is real and should not be suppressed**: Ramp × Revelio Labs, 21,000+ US firms 2021→2026, found that at companies making the *largest* AI investments, **entry-level headcount grew 12%** over the two years post-adoption ([NPR, 2026-08-18](https://www.tspr.org/npr-news/2026-08-18/many-recent-grads-say-ai-is-making-it-harder-to-get-a-job-economists-arent-so-sure)). NY Fed attributes much of the recent-grad gap to *remote-work* composition. Brynjolfsson's own paper concedes the pattern "attenuates when controlling for education" and shows "divergent trends predating generative AI."

💡 **GP read**: Two investable facts survive the disagreement. (a) NY Fed: recent-grad (22–27) unemployment **5.7%** vs **4.1%** all-workers as of June 2026 — the on-ramp is visibly narrower. (b) Firms are not backfilling junior roles but the *work* still exists. **Both the "train the new junior" and the "sell the replacement capacity" businesses have a real, dated, quantified demand signal.** See §7, Gap 4.

## 1.3 AI capex: $733B in one year, and the arithmetic doesn't close yet

📊 **2026 hyperscaler capex guidance after Q2 2026 earnings** (Alphabet 7/22, Microsoft + Meta 7/29, Amazon 7/30):

| Company | Initial 2026 guide | Latest 2026 guide | Δ midpoint | Basis |
|---|---|---|---|---|
| Amazon | ~$200B (Feb 2026) | **~$220B** (Jul 30) | +10.0% | Cash capex |
| Alphabet | $175–185B (Feb 4) | **$195–205B** (Jul 22) | +11.1% | Capex, calendar yr |
| Microsoft | ~$190B (Apr) | **~$175B** (Jul 29) | *(lease reclass)* | Capex incl. finance leases |
| Meta | $115–135B (Jan 28) | **$130–145B** (Jul 29) | +10.0% | Capex incl. finance-lease principal |
| **Total** | ~$640B+ | **~$730–733B** | | Mixed definitions |

Sources: [Axis Intelligence AI Capex Tracker (retrieved 2026-08-01)](https://axis-intelligence.com/ai-capex-tracker/); [Platformonomics Q2 2026 Scoreboard (2026-07)](https://platformonomics.com/2026/07/follow-the-capex-q2-2026-scoreboard/); [futureX 2026-08-03](https://futurex.capital/en/ai-lab/reports/big-tech-ai-capex-2026q2)

📊 **The three numbers that matter**:

1. **~$733B in 2026 is ~1.8x the ~$410B of 2025.** 2027 consensus for the same four: **$934.5B** ([I/O Fund, Aug 2026](https://io-fund.com/ai-stocks/ai-capex-1-trillion-estimates-too-low)). Total hyperscaler + neocloud spend projected >$860B in 2026 and ~$1.2T in 2027.
2. **Capex Absorption Ratio = 99.0%.** The four spent $170.1B in the quarter ended 30 Jun 2026 against $171.7B of operating cash flow ([Axis Intelligence](https://axis-intelligence.com/ai-capex-tracker/)). *They are now spending essentially every dollar they generate.* Alphabet posted its **first negative free-cash-flow quarter since its 2004 IPO**. Meta's quarterly FCF fell to **$784M** on $31.08B of capex and the stock dropped 10% on 7/30.
3. **Memory is the new marginal cost driver.** Analysts estimate memory absorbs **~30%** of hyperscaler AI datacenter spend in 2026 vs ~8% in 2023–24; DDR5 up ~110% YTD; HBM sold out through 2026 ([futureX 2026-08-03](https://futurex.capital/en/ai-lab/reports/big-tech-ai-capex-2026q2)). Jassy explicitly cited DRAM/NAND inflation when raising guidance $200B→$220B.

📊 **Market discrimination is now on contracted demand, not spend level.** Amazon raised capex $20B and rose >15% (AWS +37%, fastest in 18 quarters; **AWS backlog $496B**, up from ~$364B a quarter earlier; Trainium2 sold out). Meta lifted its floor $5B and fell 8–10% — it has no equivalent backlog to point to. Microsoft rose 8% on **$678B of commercial RPO**.

💡 **GP read**: The market has already re-priced from "capex = growth" to "capex = growth *if* contracted." That discipline will propagate down to private markets within 2–4 quarters. **Monastery companies should be underwritten on contracted or usage-metered revenue, not seats or pilots.**

## 1.4 "AI spending vs GDP": the debate, honestly stated

⚠️ **This is the most abused statistic in the market.** Three defensible numbers, all "correct," that differ by ~10x:

| Claim | Number | Source |
|---|---|---|
| AI capex share of **Q1 2026 GDP growth** (gross, headline) | **~74%** (1.55pp of 2.1% annualized) | [TFTC, on BEA third estimate 2026-06-25](https://www.tftc.io/ai-capex-gdp-growth-q1-2026-bea-third-estimate) |
| Info-processing equipment + software share of H1 2025 real GDP growth (Furman) | **~92%** | [CCIA, 2026](https://ccianet.org/articles/applying-semiconductor-tariffs-to-data-centers-would-cost-the-u-s-90-billion-a-year/) |
| Goldman (Elsie Peng) **net** contribution of AI capex to 2026 GDP growth | **0.3% "true" / 0.1% measured** | [Investing.com, 2026](https://ng.investing.com/analysis/ai-capex-risk-cuts-both-ways-in-the-american-economy-217751) |
| More-inclusive accounting (structures pass-through, construction labor PCE, utility capex, regional spillovers) | **~0.7–0.9%** | same |
| AI-related **capital formation** as % of GDP | **~1.5%** — matches/exceeds late-1990s telecom+networking peak | Epoch AI, via [TFTC](https://www.tftc.io/ai-capex-gdp-growth-q1-2026-bea-third-estimate) |

📊 **Why the gap**: **70–90% of datacenter equipment (servers, chips) is imported** ([CSIS](https://www.csis.org/index%2ephp/analysis/impact-tariffs-ai-data-center-buildout-balancing-supply-chain-security-and-ai); [BIS-style accounting in arXiv 2601.11196](https://arxiv.org/pdf/2601.11196)). Imports subtract from GDP. So the *gross* investment line is enormous and the *net* contribution is small.

⚠️ **The asymmetry is the point.** Goldman models a dot-com-style reversal at **−0.2 to −0.4pp** of GDP. But the components that are *undercounted on the way up* (structures, construction labor income, utility capex, regional clusters) **do not quietly vanish on the way down — they contract violently.** The downside is measured with a different, more complete instrument than the upside.

📊 **Additional fragility**: Bloomberg reports **nearly half of US datacenters planned for 2026 face delays** from infrastructure supply-chain strain — *before* any semiconductor tariff shock ([CCIA](https://ccianet.org/articles/applying-semiconductor-tariffs-to-data-centers-would-cost-the-u-s-90-billion-a-year/)). A 100% semiconductor tariff would add ~$1.4T to the buildout; even a 15.6% effective rate is modeled to cancel/delay/relocate ~20% ($450B) of planned 2026–2030 US capacity.

## 1.5 My own arithmetic: does $733B pencil?

📊 **Denominator — total generative-AI industry revenue, run-rate mid-2026**:

| Entity | Run-rate | As-of | Source |
|---|---|---|---|
| Anthropic | **$65B+** | end-July 2026 | [Bloomberg 2026-08-17](https://www.bloomberg.com/news/articles/2026-08-17/anthropic-revenue-run-rate-surpasses-65-billion-ahead-of-ipo) |
| OpenAI | **$40B+** | Aug 2026 | [Epoch AI](https://epoch.ai/gradient-updates/an-update-on-ais-most-important-number) |
| Combined | ~$105B (from ~$30B a year prior, **3.5x**) | Aug 2026 | Epoch AI |
| Whole genAI industry (deduplicated) | **~$175–200B** | Jun 2026 | Exponential View, via Epoch AI |

⚠️ **Accounting caveat that materially inflates the comparison**: OpenAI books only its *cut* when tokens are sold through cloud partners; Anthropic books the *full* amount. The two are not comparable. Also: OpenAI's FY2025 audited revenue was **$13.07B against a $38.5B net loss**.

📊 **My estimate of the annual revenue required to justify the 2026 capex vintage alone** (flagged as my calculation, not a sourced figure):

```
2026 capex vintage                    $733B
Depreciation @ 6-yr straight line     $122B/yr
Power + opex @ ~40% of depreciation   ~$49B/yr
Cost of capital @ 10% on $733B        ~$73B/yr
                                     ─────────
Annualized cost of the 2026 vintage   ~$244B/yr
```

**The 2026 vintage alone requires more annual revenue than the entire generative-AI industry currently produces (~$175–200B).** Stack 2024 (~$230B) + 2025 (~$410B) + 2026 (~$733B) ≈ **$1.37T deployed**, implying ~$450B/yr of required revenue against ~$200B actual. **Gap ≈ $250B/yr.**

✅ **The honest bull rebuttals**, which I take seriously:
- Not all hyperscaler capex serves AI; a large share is conventional cloud with proven returns.
- Google and Meta capture most AI value *internally* (ad ranking, recommendations) and never book it as "AI revenue." That value is real and invisible to this arithmetic.
- The **ratio is improving**: 2025 was ~$410B capex vs ~$60B exit run-rate (≈6.8x); 2026 is ~$733B vs ~$175–200B (≈4x). Revenue is compounding faster than capex.
- Amazon's **$496B AWS backlog** and Microsoft's **$678B RPO** are contracted, not hoped-for.

⚠️ **The bear rebuttal to the rebuttal**: run-rate is annualized from a single recent month; capex is cash out the door this year. And Burry's depreciation thesis (below) argues the $122B figure is *understated*.

## 1.6 The financing structure is the actual fragility

📊 **Off-balance-sheet and circular exposure**:

- BIS (late-June 2026 Annual Report): hyperscaler debt tied to AI buildouts is **growing faster than the balance sheets carrying it**. BIS estimates the five largest hyperscalers carry **~$1.65T off-balance-sheet** (SPVs + arrangements) vs **$1.35T reported directly** ([24/7 Wall St., 2026-08-13](https://247wallst.com/investing/2026/08/13/michael-burry-sounds-the-alarm-again-ai-is-a-circular-financing-web-with-nvidia-in-the-middle/)).
- CCIR breakdown of the ~$1.65T: **~$821B leases not yet commenced** + **~$848B purchase commitments**. Alphabet alone: **$811B** in purchase and contractual commitments as of end-June 2026 ([Grep News](https://grep.news/episode/burry-s-176b-ai-depreciation-short-on-oracle-and-meta)).
- Bloomberg circularity diagram Burry shared: **~$46B direct equity stakes + ~$879B multi-year purchase commitments** circulating among MSFT / ORCL / AMZN / GOOG / META / OpenAI / Anthropic / xAI / CoreWeave / NVDA / AMD.
- **Oracle** is the load-bearing node: OpenAI's ~$300B, five-year compute contract starting 2027 (~$60B/yr, 4.5GW, part of Stargate); Oracle RPO **$523B by Q3 FY2026, +438% y/y**; KeyBanc estimates Oracle must borrow **~$100B over four years**; non-current debt **$124.7B** as of March 2026 with trailing FCF ≈ **−$24.7B**; Moody's flags debt growing faster than earnings; CDS spreads have touched **>125bp** ([FootnoteBrief](https://footnotebrief.com/hyperscaler-depreciation-ai-capex-circularity/); [Analysis Atlas](https://analysis-atlas.com/research/ai-circular-financing-vendor-loops/)).
- **Burry's depreciation thesis**: hyperscalers depreciate Nvidia-based hardware over 5–6 years when economic life is closer to 2–3, understating depreciation by **~$176B across 2026–2028**; normalizing would cut Oracle's earnings by **26.9%** and Meta's by **20.8%**. Amazon already cut a subset of server useful life from 6 to 5 years effective Jan 2025.
- Nvidia's five-year CDS spread **roughly doubled over two months** to Aug 2026.

📊 **The falsifiable tripwires** (worth putting on a GP dashboard):
1. Any hyperscaler revising useful-life guidance **downward** (e.g., 6y→4y) — produces a catch-up charge and concedes Burry's premise.
2. An OpenAI round pricing **below** the last ~$852B mark.
3. Oracle unable to refinance 2027 maturities at investment-grade pricing.
4. Nvidia CDS spread continuing to widen.

⚠️ **Closest historical analog is explicit**: Lucent/Nortel vendor financing, 1999–2001.

💡 **GP read for Monastery**: A capex unwind does **not** kill application-layer companies with real usage revenue — it *helps* them, because inference prices fall and talent frees up. It kills anything whose business model requires (a) continued frontier-model price increases, (b) cheap venture capital in 18 months, or (c) a strategic acquirer whose stock is the currency. **Underwrite Monastery companies to survive a −40% AI-equity drawdown with 24 months of runway on $2M + revenue.** That is a hard filter and it should be applied at selection.

---

# 2. CAPABILITY TRAJECTORY 2023–2026

## 2.1 METR time horizon: the metric, and the number everyone quotes wrong

📊 **The trend** ([METR](https://metr.org/time-horizons/); [arXiv 2503.14499v4](https://arxiv.org/html/2503.14499v4)):

| Window | Doubling time | Source |
|---|---|---|
| All-time (2019→) | **188 days (6.3 mo)** | METR Time Horizon 1.1, Jan 2026 |
| 2023 onward | **129 days (4.3 mo)** | METR TH1.1 |
| 2024 onward | **89 days (~3.0 mo)** | METR TH1.1 |

📊 **The ladder** ([benchmarks.darvinyi.com](https://benchmarks.darvinyi.com/agents/metr-time-horizon); METR TH1.1):

| Model era | 50% time horizon |
|---|---|
| GPT-3 era (2020) | ~9 seconds |
| GPT-4 | ~4 minutes |
| Claude 3.5 Sonnet | ~40 minutes |
| o3 | ~110 minutes |
| GPT-5 | ~2h 17m |
| Claude Opus 4.6 (Jan 2026) | **719 min (~12h)** |
| Frontier, Feb–Mar 2026 lab pilot | **~16–20h (unreliable — suite saturated)** |

**~5,800x improvement in six years.** METR TH1.1 expanded from 170→228 tasks; long tasks (8h+) went 14→31. METR added an explicit caveat on 2026-05-08: *"Measurements above 16 hrs are unreliable with our current task suite."*

⚠️ **THE NUMBER EVERYONE MISQUOTES.** The commercially relevant horizon is **80%, not 50%**, and the two diverge violently:

| Model | 50% horizon | 80% horizon | Ratio |
|---|---|---|---|
| Claude Opus 4.6 | 719 min (~12h) | **70 min** | **10.3x** |
| Frontier (Feb–Mar 2026 pilot) | ~16–20h | **3–4h** | **~5x** |

METR's own illustration: on tasks taking a human expert 9 min–3h, a GPT-5 agent succeeds 100% of the time on ~1/3 of tasks, fails 100% of the time on ~1/3, and is stochastic on the remaining third.

💡 **This is the single most important capability fact in this document.** A business cannot ship a workflow that fails half the time. **The deployable frontier in Sep 2026 is a 3–4 hour autonomous task, not a 20-hour one.** Every claim that "agents can now do a full workday of work" is quoting the 50% number. The gap between the 50% headline and the 80% reality *is* the capability-diffusion gap, restated in units an engineer can act on. And it is a gap that a startup — not Big Tech — is best positioned to close in a specific domain, because closing it requires domain-specific verification, not more pretraining.

## 2.2 GDPval: models are at expert parity on *deliverables*, not on *jobs*

📊 **GDPval** (OpenAI, released 2025-09-25; ICLR 2026): 1,320 tasks, 44 occupations, top 9 US GDP sectors, real deliverables (docs, decks, spreadsheets) graded by blinded pairwise comparison against professionals averaging **14 years' experience** ([paper](https://cdn.openai.com/pdf/d5eb7428-c4e9-4a33-bd86-86dd4bcf12ce/GDPval.pdf); [Epoch leaderboard](https://epoch.ai/benchmarks/gdpval)).

| Result | Value | As-of |
|---|---|---|
| Claude Opus 4.1 wins+ties vs human expert (gold subset) | **47.6%** | Sept 2025 |
| Top model wins+ties, updated | **~74%** | ICLR 2026 |
| Frontier models past human-expert parity in raw win rate | **Yes** | mid-2026, per Epoch |
| GDPval-AA leader (Artificial Analysis Elo) | Claude Fable 5, **1,760 Elo** vs 1,000 human baseline | 2026 |
| GDPval-MM leader | GPT-5.5, **84.9%** | 2026 |

Frontier progress on GDPval is **roughly linear over time** (not exponential). Dominant failure mode across all models: **instruction-following** — Gemini and Grok frequently miss requested deliverables or formats.

💡 **The synthesis across the three best benchmarks is the cleanest statement of the 2026 frontier**, and I'll quote the framing directly because it's correct ([o-mega 2026 benchmark guide](https://o-mega.ai/articles/the-best-ai-agent-evals-and-benchmarks-full-2025-guide)):

> GDPval says frontier models produce **individual work products at expert-parity quality**. METR says autonomous **reliability holds for a few hours and degrades beyond**. Vending-Bench says **year-long compounding autonomy still loses to a human by an order of magnitude**.
>
> *"The economic frontier of 2026 is therefore not 'can the agent do the work' but 'how long can the agent stay coherent while doing it.'"*

📊 **Restated as an investment principle**: **coherence duration, not capability, is the scarce good.** Sell coherence. Every mechanism that extends coherence in a bounded domain — memory scoped to a domain, verification, checkpointing, structured handoff, human-in-the-loop at the right interval — is a product with a buyer today.

## 2.3 Inference economics: bifurcated, not monotonically falling

📊 **Frontier tier pricing, 2026-07-29** ([Axis Intelligence](https://axis-intelligence.com/ai-inference-cost-statistics/)):

| Model | Input $/MTok | Output $/MTok | Tier |
|---|---|---|---|
| Claude Fable 5 | $10.00 | $50.00 | Frontier+ |
| Claude Opus 5 | $5.00 | $25.00 | Frontier |
| GPT-5.6 Sol | $5.00 | $30.00 | Frontier |
| GPT-5.6 Terra | $2.50 | $15.00 | Upper mid |
| Gemini 3.1 Pro | $2.00 | $12.00 | Mid |
| Claude Sonnet 5 | $2.00 | $10.00 | Mid |
| Claude Haiku 4.5 | $1.00 | $5.00 | Budget |
| Qwen3.8-Max | $2.00 | $6.00 | Near-frontier |
| DeepSeek V4-Flash | $0.14 | $0.28 | Commodity |
| Gemini 2.5 Flash-Lite / GPT-4.1 Nano | $0.10 | $0.40 | Commodity |

📊 **At fixed capability**, Epoch AI's inference price tracker finds a **median ~50x/year decline** across six benchmarks (range 9x–900x); restricted to post-Jan-2024 data, the median accelerates to **~200x/year**. a16z's "LLMflation" put it at a clean **10x/year** for equal capability.

⚠️ **But the frontier price has been flat, not falling.** Frontier input has held near **$5/MTok** across OpenAI and Anthropic through 2026 — each new generation resets the price up. The commodity tier has found a floor near **$0.10–0.15/MTok**. **The market split in two.**

📊 **Supply-side pressure building**: OpenAI cut ChatGPT guest-tier inference cost >50% via software-only optimization; its Broadcom-built "Jalapeño" chip targets ~50% lower cost/token (deployment 2027–28, no independent benchmarks); Anthropic confirmed an in-house silicon team targeting a halving of Claude inference cost. Prediction from the same source: frontier input breaks below **$3/MTok by mid-2027** under Chinese pricing pressure.

💡 **GP read**: A Monastery company should assume (a) **commodity-tier cost falls ~10x/yr — build the product's default path on the commodity tier**, and (b) **frontier-tier cost does NOT fall — never let unit economics depend on frontier prices dropping.** Sora died on exactly that assumption (§6.3). Underwrite gross margin at *today's* frontier price, and treat any decline as upside.

## 2.4 Video and world models: real-time arrived, persistence did not

📊 **Genie 3** (DeepMind): 11B-parameter autoregressive transformer; real-time navigable worlds at **720p / 24fps** from text prompts; shipped to Google AI Ultra subscribers as **Project Genie on 2026-01-29** ([technical guide](https://almcorp.com/blog/google-deepmind-project-genie-technical-analysis-applications/); [world-models.io](https://world-models.io/en/models/genie-3/)).

⚠️ **Hard limits as of 2026** ([TechTalks](https://bdtechtalks.com/2025/08/07/deepmind-genie-3/); [Milvus](https://milvus.io/ai-quick-reference/what-are-the-current-limitations-or-constraints-of-genie-3)):
- **Interaction capped at a few minutes** — worlds are not persistent
- ~60-second effective computational memory
- Constrained agent action space (navigation ≫ manipulation)
- Multi-agent interaction unsolved
- Cannot render real-world locations with geographic accuracy
- Legible text only when supplied in the input description

💡 **The "Generative Netflix" read**: real-time generation **exists** and is **in a shipped consumer product** as of Jan 2026. Persistence, narrative continuity across sessions, and multi-character interaction **do not exist**. Those three are exactly what a series or a game requires. **A 2026 generative-entertainment company must build persistence and continuity as application-layer scaffolding on top of a non-persistent model** — which is a real, defensible engineering problem, and one that is *not* on DeepMind's critical path. Detailed treatment belongs to the generative-netflix track; flagging the macro constraint here.

📊 **Robotics**: the world-model→robotics bridge is active research, not product. GeniWorld (arXiv 2608.06332, Aug 2026) shows action-conditioned world models achieving zero-shot generalization to randomized unseen environments from limited fixed-scene training, usable as a **policy evaluator** and a synthetic-trajectory generator. Notably, OpenAI is explicitly retaining Sora's underlying technology for internal **"world simulation" research aimed at robotics** while shipping no consumer video product ([HTX](https://www.htx.com/news/openai-shuts-down-sora-disneys-1-billion-investment-goes-dow-uXmfYdp9/)).

---

# 3. CONTINUAL LEARNING — SHIPPED vs PROMISED

📊 **Verdict: parametric continual learning has NOT shipped. Memory scaffolding HAS shipped, at both leading labs, within four weeks of each other, and both are labeled beta or research preview.**

| Lab | What shipped | Date | Status |
|---|---|---|---|
| **Anthropic** | "Dreaming" for Claude Managed Agents — scheduled background process reviews completed sessions, extracts patterns, curates memory | **2026-05-07** | **Research preview** |
| Anthropic | "Outcomes" — rubric-based grading; +up to 10pp task success | 2026-05-07 | Public beta |
| Anthropic | Multiagent orchestration — lead agent delegates to parallel specialists | 2026-05-07 | Public beta |
| **OpenAI** | ChatGPT "Dreaming" — nightly batch consolidation; prunes stale detail, reinforces recurring patterns, propagates preference shifts | **2026-06-04** | Live: Plus/Team; Enterprise/Edu following; Free tier read-only |
| Google | "Sleep" paradigm — Knowledge Seeding (consolidate short-term into parameters) + Dreaming (synthetic-data rehearsal) | 2026 | **Paper** |
| Open source | `Dream Memory` library — scheduler-gated LLM passes, two-model retrieval split, Redis/S3 adapters | 2026 | Library |

Sources: [AI Tutorials, 2026-05-07](https://aitutorials.com.au/news/2026-05-07-anthropic-claude-agents-dreaming/); [UncensoredHub, 2026-06-07](https://uncensoredhub.ai/news/2026-06-04-chatgpt-s-nightly-memory-consolidation-keeps-user-preferences-fresh-across-sessi); [Turing Post](https://www.turingpost.com/p/continual-learning-llms-ai-models-sleep)

⚠️ **What is explicitly NOT solved**:
- **No real-time weight updates in any production system.** Weights remain frozen at release.
- Turing Post is direct: OpenAI's Dreaming *"is system-side memory, not proof that parametric continual learning is solved."*
- Sean Goedecke's framing is the right skeptical prior: external notes are *"like saying the guy in Memento could remember things, since he was able to tattoo them onto his body."*
- OpenAI has **not disclosed token costs** for the background consolidation passes.
- Conflict resolution is unspecified — if a user wants concise answers Monday and verbose Tuesday, which wins, and over what retention window? No audit or rollback surface shipped.

📊 **What the labs actually did instead** — and this is the strategically important part. Per a well-sourced HN account of lab practice: the labs **stopped trying to solve real-time weight updates and brute-forced an approximation** by combining (a) very long context, (b) reliable summarization, and (c) structured external documentation — then **trained the memory-writing behavior itself as an RL objective**, with an explicit length penalty so notes don't grow unbounded. Reward the model for writing high-signal memories, retrieving the right docs at the right time, and compressing stale notes ([HN 47259384](https://news.ycombinator.com/item?id=47259384)).

💡 **GP read — and this is a load-bearing conclusion for Monastery**:

**Memory is currently an application-layer problem that the labs have addressed generically and shallowly.** That is a real window. But it is the *most* dangerous category for Big Tech absorption, because generic memory is exactly what the labs will keep improving.

**The test to apply**: *Is the memory bound to proprietary data the lab structurally cannot see?* If the answer is "we remember the user's preferences," OpenAI shipped that on 2026-06-04 and you are dead. If the answer is "we hold a five-year longitudinal model of one child's learning trajectory, assembled from sources the lab has no access to and would face regulatory barriers to obtain," that is a durable asset that compounds. **Longitudinal, consented, regulated-domain memory is defensible. Preference memory is a feature.**

⚠️ **Slope risk to the GP thesis**: if any lab ships genuine parametric continual learning inside the 5-year window, the diffusion curve steepens sharply — an agent that learns a specific firm's idiosyncratic workflow on the job removes the largest single deployment cost (the workflow-redesign spend in §5). **I see no evidence this is close, but it is the highest-variance unknown in the map.** Monitor: any lab shipping on-the-job weight adaptation out of research preview.

---

# 4. RECURSIVE SELF-IMPROVEMENT / AUTOMATED AI R&D

📊 **What is real and dated**:

| Claim | Evidence | Source |
|---|---|---|
| Claude authors **>80%** of code merged into Anthropic's own codebase (from low single digits pre-Feb-2025) | Anthropic research note, as of **May 2026** | [TechBooky](https://www.techbooky.com/anthropic-says-claude-is-already-helping-build-better-ai/); [arXiv 2607.07663v1](https://arxiv.org/html/2607.07663v1) |
| AlphaEvolve produced faster matmul kernels, datacenter scheduling improvements, accelerator circuit simplifications, and **novel Verilog for TPU layout** | DeepMind | [IEEE Spectrum](https://spectrum.ieee.org/recursive-self-improvement) |
| AlphaEvolve delivered a **1% reduction in Gemini's own training time** | DeepMind | [Medium/Masood](https://medium.com/@adnanmasood/recursive-self-improvement-rsi-in-the-wild-how-ai-started-engineering-its-own-architecture-part-1-a9d234f38b6e) |
| FunSearch produced **new mathematical constructions** (improved cap-set bounds), published in Nature | Nature | [arXiv 2607.07663v1](https://arxiv.org/html/2607.07663v1) |
| The AI Scientist automates ideation→experiment→plots→manuscript→peer review at **~$15/paper**; Nature paper March 2026 | Sakana AI | IEEE Spectrum; Medium |

📊 **What is NOT real** — the loop does not close, and the reason is specific and structural:

1. **Humans still build the box.** A human sets the sandbox, annotates which code blocks may be evolved, and defines the evaluator. "Brilliant inside the box, but a human still has to build the box and tell it what success looks like."
2. **The bottleneck is research direction-setting, not execution.** Anthropic's own framing: systems sit *"conspicuously far along this spectrum on execution… while remaining bottlenecked on research direction-setting — choosing which problems matter."*
3. **Evaluation is the binding constraint.** Every RSI success to date inherits the evolutionary-computation template: candidates are programs scored by an *automatic* evaluator. **RSI works exactly where you can write a cheap, correct scoring function, and nowhere else.**
4. **Named failure modes**: benchmark overfitting, reward hacking, scientific noise, alignment drift.

⚠️ **The governance datapoint worth internalizing**: of 25 AI experts interviewed on automating AI R&D, **all but two entertained** that it could produce an intelligence explosion — and they were *more* likely to expect labs to keep self-improving models **internal rather than deploy them publicly**. David Krueger: *"It's a pretty alarming combination, right?"* ([IEEE Spectrum](https://spectrum.ieee.org/recursive-self-improvement))

💡 **GP read — two distinct implications, and the second one is the money**:

**(a) On the thesis's slope.** The realistic near-term mechanism is not a runaway machine; it is **labs compounding engineering throughput**. The bottleneck moves from human coding time to **compute, data, evaluation, and infrastructure**. That is a *capability accelerant that does not touch diffusion at all* — it makes the frontier move faster while the 18%-of-firms number stays put. **RSI as currently practiced widens the capability-diffusion gap rather than closing it.** That is *supportive* of the GP thesis, not contradictory to it.

**(b) The generalizable investment lesson, which is underrated.** The 80%-of-merged-code figure is the strongest existence proof in the entire dataset for what full diffusion looks like — and it happened where **the buyer, the builder, and the evaluator were the same organization, and the output was machine-verifiable (tests pass or they don't).** Anthropic went from ~3% to >80% in ~15 months. Not ten years. Fifteen months.

📊 **That gives us the diffusion equation directly**:

> **Diffusion speed ≈ f(verifiability of output × alignment of buyer/builder/user × absence of integration and regulatory gates)**

Anthropic scores maximum on all three → 15 months. A public school district scores near zero on all three → a decade. **The GP thesis's "~10 years" is the school district. The investable question is how many domains sit closer to the Anthropic end than the market believes** — and, more importantly, **whether a startup can manufacture the missing terms** (build the verifier, collapse buyer and user into one person, route around the integration gate). That is the Monastery playbook in one sentence.

---

# 5. DIFFUSION — WHAT THE DATA ACTUALLY SAYS

## 5.1 Firm-level adoption: 18%, and shallow

📊 **US Census Bureau BTOS 2026 AI supplement** (reference period Nov 2025–Jan 2026), the single best instrument we have ([CES-WP-26-25](https://www2.census.gov/library/working-papers/2026/adrm/ces/CES-WP-26-25.pdf)):

| Metric | Value |
|---|---|
| Firms using AI in a business function | **18%** |
| Same, employment-weighted | **32%** |
| Expected within six months | **22%** |
| Very large firms, Information/Prof.Services/Finance | 50–60% (60–70% empl-weighted) |
| Adopters using AI in **≤3** business functions | **57%** |
| Top functions | Sales & Marketing 52%, Strategy & BD 45%, IT 41% |
| Firms where **workers** use AI in tasks | 23% (**41%** empl-weighted) |
| Firms limiting worker use to ≤3 tasks | **65%** |
| Users relying on AI **solely to augment** | **66%** |
| Firms reporting **AI-related employment decreases** | **2%** |

⚠️ **Measurement warning — the surveys disagree by 4x, and you should know which one you're quoting** ([Fed FEDS Note, 2026-04-03](https://www.federalreserve.gov/econres/notes/feds-notes/monitoring-ai-adoption-in-the-u-s-economy-20260403.html)):

| Instrument | Unit | Reading |
|---|---|---|
| Census BTOS | Share of **firms** | **18%** |
| Real-Time Population Survey | Share of **individuals** using genAI for work | **41%** (Nov) |
| Survey of Business Uncertainty | Share of **labor force at adopting firms** | **78%** (54% for LLMs specifically) |
| McKinsey State of AI 2026 | Share of **organizations** using AI in ≥1 function | **88–89%** |

The Fed attributes the spread to sampling distribution and unit of analysis, plus question framing, materiality thresholds, information asymmetry between respondents, and social-desirability bias.

💡 **Which number is right for an investor?** None alone. **The pair that matters is 88% (someone at the company uses AI) vs 39% (it shows up in EBIT) vs ~10% (agents scaled in any given function).** The whole investment thesis lives in that spread.

📊 **Both diffusion channels are live, and one is a distribution strategy**: Census finds *"worker task use sometimes occurs without formal firm-level adoption, and firm-level adoption sometimes occurs without worker task use."* **Bottom-up adoption is empirically documented at scale.** For a $2M company that cannot run an 18-month enterprise sales cycle, that is the entire go-to-market answer: sell to the practitioner, get to material usage, let procurement catch up. This is exactly how Cursor reached 70% of the Fortune 1000 without a traditional enterprise sales motion.

## 5.2 The enterprise value gap

📊 **McKinsey State of AI 2026 + corroborating surveys**:

| Metric | Value | Source |
|---|---|---|
| Organizations regularly using AI in ≥1 function | **88–89%** (from 78% a year prior) | [McKinsey](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai) |
| Attributing **any** EBIT impact to AI | **37–39%** — *most of them under 5% of EBIT* | [QuantumBlack](https://medium.com/quantumblack/escaping-ai-pilot-purgatory-from-poc-to-p-l-1216d30ec4d0) |
| Have **redesigned workflows** for genAI | **~21%** | Alice Labs / McKinsey |
| Scaling agentic AI somewhere in the enterprise | **23%** (20% by another cut) | McKinsey |
| Experimenting with agents | **39–62%** | McKinsey |
| Scaling agents in **any given function** | **<10%** | McKinsey |
| $1B+ revenue firms scaling agentic AI | **40%** (from 27% in 2025) | McKinsey |
| C-suite describing genAI rollout as **"mature"** | **1%** | McKinsey Superagency (238 C-level, US) |
| BCG AI Radar 2026 (1,800+ execs): tangible value at scale | **26%** | Alice Labs |
| Citing **data limitations** as the roadblock to scaling agents | **~80%** | [McKinsey](https://www.mckinsey.com.br/capabilities/mckinsey-technology/our-insights/building-the-foundations-for-agentic-ai-at-scale) |
| MIT NANDA (2025): genAI pilots with no measurable P&L impact | **~95%** | via Alice Labs |
| Gartner forecast: agentic AI project cancellations | **>40%** | via Alice Labs |
| Gartner: deployment cost, business-model-innovation genAI cases | **$5–20M** | via Alice Labs |

📊 **McKinsey's causal claim is the most actionable sentence in the enterprise literature**: *"the primary determinant of documented ROI is whether the buyer redesigns at least one high-volume workflow end-to-end."* Not model choice. Not platform. Workflow redesign.

⚠️ **And here is the constraint that makes this a venture opportunity rather than a consulting opportunity**: workflow redesign costs **$5–20M** per Gartner. **That is 2.5–10x the entire Monastery check, per customer.** No seed company can sell a $5–20M transformation. The venture-scale move is to **pre-package the redesigned workflow as the product** — sell the destination, not the journey — which is only possible if you constrain to a single vertical and own the system of record.

## 5.3 Productivity: the two economists, and who is winning

📊 **The bear (Acemoglu, Economic Policy 2024, still the reference ceiling)** ([Economic Policy](https://economic-policy.org/79th-economic-policy-panel/macroecon-of-ai/); [NBER w32487](https://doi.org/10.3386/w32487)):
- Share of tasks affected by AI: **~4.6%**
- Upper-bound TFP gain: **0.66–0.71% cumulative over 10 years** = **0.06–0.07%/yr**
- Adjusting for hard-to-learn tasks (~¼ of the 4.6%): **<0.53–0.55%** cumulative
- GDP boost: **0.9–1.1% over 10 years**
- Argument: labor-cost savings above 27% are out of range of existing studies; industrial robots — a far more mature automation technology — only cut labor costs ~30%
- On distribution: AI **widens the capital-labor income gap**; no evidence it reduces labor income inequality; low-education white native-born women see small **real wage declines**

📊 **The bull (Brynjolfsson, Feb 2026)** ([LinkedIn, 2026-02-15](https://www.linkedin.com/posts/erikbrynjolfsson_the-ai-productivity-take-off-is-finally-visible-activity-7428840286203613184-aMmv); [The Decoder, 2026-02-16](https://the-decoder.com/stanfords-brynjolfsson-sees-ai-boosting-us-productivity-but-he-also-co-founded-an-ai-consulting-firm/)):
- Predicts **2.7% US productivity growth for 2025** — nearly 2x the 1.4% ten-year average
- **Productivity J-curve**: for every $1 of tangible tech investment, firms make **$9–10 of intangible investment** (learning, process redesign, org restructuring) that does not show up as output — depressing *measured* productivity before the harvest
- Claims we are *"transitioning out of this investment phase into a harvest phase"*
- Causal micro-evidence: [McElheran, Yang, Brynjolfsson & Kroff (SSRN 5036270)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5036270), Census manufacturing data 2017 & 2021, finds **causal J-curve-shaped returns** — industrial AI raises WIP inventory, robot investment and labor shedding while *harming* productivity and profitability short-run; losses concentrate in **older** establishments; **abandonment of structured production-management practices accounts for ~⅓ of the losses**; pre-2017 adopters show stronger later growth conditional on survival

⚠️ **Two disclosures that matter**: (1) Brynjolfsson **co-founded Workhelix**, an AI-rollout consultancy. (2) His own cited GDP growth *"could largely be driven by the enormous capital being poured into AI infrastructure itself, rather than by productivity gains from actually using AI"* — the §1.4 problem, applied to his own evidence.

📊 **The hard data, as of Q2 2026, sides with Acemoglu on level and Brynjolfsson on direction**: BEA/BLS imply US workers produced **~2% more per hour in 2026Q2 than in 2025** — *"only slightly above the longer-term trend of productivity growth from 2004Q1–2019Q4, which also happened to be the same as the trend growth rate from 1984Q1–1996Q4"* ([The Overshoot](https://theovershoot.co/p/ai-productivity-and-rates-part-i)). Klein's verdict: *"the excitement about productivity is more about expectations than what is currently visible in the hard data."* He also notes things *"looked slightly better a few quarters ago"* — i.e., the recent trend is decelerating, not accelerating.

📊 **Kansas City Fed reconciles them precisely** ([Economic Bulletin](https://www.kansascityfed.org/research/economic-bulletin/a-new-us-productivity-chapter-what-industry-data-say-about-ai/)), combining Chicago Fed QILP industry productivity with Census BTOS adoption:
- **Panel A**: higher-adoption industries have faster labor productivity growth — relationship **significant and positive**.
- **Panel B**: adoption explains **little** of which industries drove the *aggregate* pickup — relationship **weak**. Manufacturing's contribution rose more than Information's despite lower reported AI use.
- Verdict: *"AI appears linked to within-industry gains, but its aggregate footprint is still limited, consistent with adoption still spreading across industries."*

💡 **My reconciliation, and it is the GP thesis in economists' language**: **Both are right about different objects.** Acemoglu bounds the *aggregate* TFP effect over ten years and is very likely close to correct. Brynjolfsson describes the *within-firm, within-industry* effect at adopters and is also close to correct. The distance between them **is** the diffusion gap. **Aggregate productivity is a diffusion-weighted average, and the weight on the fast movers is currently ~18%.** For a venture investor this is nearly ideal: *you do not invest in the average.* You invest in the tail that is already on the right side of the J-curve — and the KC Fed data confirms that tail exists and is measurable today.

---

# 6. SECOND-ORDER EFFECTS

## 6.1 Education demand is repricing, fast and legibly

📊 **CS enrollment reversed for the first time in ~two decades**:

| Metric | Value | Source |
|---|---|---|
| Undergrad Computer & Information Sciences enrollment, 4-yr, fall 2025 | **−8.1% y/y** — steepest decline of any field | [National Student Clearinghouse](https://www.studentclearinghouse.org/nscblog/computer-science-enrollment-is-cooling/) / [Built In](https://builtin.com/articles/computer-science-degree-decline-ai) |
| Computer science specifically (vs IT mgmt / info studies) | **−11.2%** | Built In |
| Graduate level | **−14.0%** | NSC |
| Universities reporting a CS enrollment decrease (CRA survey, n=130) | **62%** | Built In |
| Universities reporting **growth** in AI programs | **56%** | Built In |
| Universities reporting growth in cybersecurity | **58%** | Built In |
| Spring 2026 | Declines continued across **every** institutional sector, while overall undergrad enrollment **grew** | NSC |

Stanford Hoover economist Jacob Light: 2025–26 was the first CS enrollment-share decline in ~two decades — *"the flattening and reversal of the enrollment share trend"* ([Business Insider, 2026-07](https://www.businessinsider.com/computer-science-enrollment-fell-after-chatgpts-rise-economist-says-2026-7)).

📊 **Simultaneously, AI literacy demand is up across all majors.** Northwestern doubled CS staff for the old demand, now teaches mostly non-majors, is adding an AI major, and is streamlining prerequisites so non-majors can take ML ([AP News](https://apnews.com/article/college-major-ai-computer-science-coding-f0dca8e4f7e16297ad27c2b02adc2530)). And credential value is decoupling from degrees: in AI roles, mention of university education fell 23% while AI *skills* carry a **16% wage premium** — comparable to a PhD's 17% — and the **educational premium has disappeared entirely** for AI roles ([SSRN 4603764](https://doi.org/10.2139/ssrn.4603764)).

💡 **GP read**: This is the cleanest demand signal in the entire second-order section, and it is *counter-positioned to the incumbents*. Universities are structurally slow (an institution with a slow buyer, unverifiable output, and heavy regulatory gates — the maximum-slow quadrant of the diffusion equation). Meanwhile the *individual* demand for AI-skill credentialing is exploding and unmet, and employers have already stopped requiring degrees for the roles in question. **Bottom-up credentialing that certifies demonstrated capability — specifically the capability of supervising agents — has a documented wage premium to price against and no institutional gatekeeper to negotiate with.** Detailed company mapping belongs to the education track; this is the macro warrant for it.

## 6.2 Consumer AI: enormous engagement, thin and concentrated monetization

📊 **Scale**:

| Metric | Value | As-of | Source |
|---|---|---|---|
| ChatGPT weekly actives | **~1B** (from 900M Feb 2026, 400M Feb 2025) | Aug 2026 | [Instant Press](https://www.instantpress.co/ai-statistics) |
| ChatGPT monthly actives (app) | **1B+** — fastest app ever, 3 years | May/Jun 2026 | [Sensor Tower, 2026-06-16](https://www.prnewswire.com/news-releases/sensor-tower-state-of-ai-2026-report-global-time-spent-on-generative-ai-apps-projected-to-more-than-double-year-over-year-302800844.html) |
| Weekly messages | **18B** | mid-2026 | Instant Press |
| Gemini app MAU | **950M**; AI Overviews reach ~2.5B/mo | Q2 2026 | Instant Press |
| Meta AI | 1.2B MAU across Meta apps | 2026 | Instant Press |
| Microsoft Copilot | ~420M (30M+ paid M365 seats) | 2026 | Instant Press |
| Global time in genAI apps | **36B hours H1 2026** vs 17.2B H1 2025 (**+109%**) | H1 2026 | Sensor Tower |
| Consumers starting search with an AI tool | **37%** | 2026 | Instant Press |
| OpenAI paying consumer subs / business users | **50M+ / 9M+** | 2026 | Instant Press |

📊 **Monetization is real but small relative to engagement**: global AI in-app purchase revenue **>$4B in H1 2026**, +36% over H2 2025. Claude's US mobile ARPU rose from **<$0.50 (Sep 2025) to $2.76 (May 2026)**. OpenAI's ads pilot reached **$100M ARR in under six weeks**.

⚠️ **Concentration and the first crack**: ChatGPT + DeepSeek + Gemini = **~90% of all time spent** in AI Assistant apps in Q1 2026. But ChatGPT's "True Audience" share **fell below 50% for the first time in March 2026**, and Claude's US share **more than tripled**. Concentrated, but no longer monotonically consolidating.

📊 **The engagement/retention counter-example that matters most for entertainment**: AI companion apps hit **33.2M MAU in June 2026** (+134% from 14.2M Jan 2025), **43% 30-day retention**, **25.8 min average daily conversation**, **19.2% conversion-to-paid**, **$25.20/mo ARPU** ([AI Girlfriends Industry Index, June 2026](https://aigirlfriends.ai/blog/ai-girlfriend-industry-report) — *first-party vendor data, treat directionally, not as audited*).

💡 Set the companion category's **43% D30 retention and $25.20 ARPU** against Sora's **1% D30 retention** (§6.3). Same underlying model technology, ~40x difference in retention. **Retention in generative consumer is determined by relationship and continuity, not by output fidelity.** That is the single most useful consumer datapoint in this document for the generative-entertainment thesis, and it argues the category's problem was never video quality.

## 6.3 Sora: the most instructive corporate failure of 2026

📊 **Timeline and numbers** ([Forbes, 2026-04-02](https://www.forbes.com/sites/johnsviokla/2026/04/02/when-ai-vendors-fail-lessons-from-the-sora-shutdown/); [ngram](https://www.ngram.com/blog/openai-sora-shutdown-ai-video-economics); [Presenc AI](https://presenc.ai/research/ai-video-market-post-sora-shutdown-2026); [HTX](https://www.htx.com/news/openai-shuts-down-sora-disneys-1-billion-investment-goes-dow-uXmfYdp9/)):

| Fact | Value |
|---|---|
| Shutdown announced / app off / API off | **2026-03-24 / 2026-04-26 / 2026-09-24** |
| Time from public launch to shutdown | **~6 months** |
| Infrastructure burn | **~$1M/day baseline; ~$15M/day at peak** (WSJ) |
| **Total lifetime revenue** | **$2.1M** |
| Cost per 10-second clip | **~$1.30** |
| **30-day retention** | **1%** |
| Users | peaked ~1M, fell to <500K; downloads peaked 3.3M in Nov, **−66% by Feb** |
| Disney deal | 3-year license, 200+ characters, **$1B equity investment — evaporated; no money changed hands**; Disney learned of the shutdown **<1 hour before the public** |
| Altman's characterization | a **"side quest"** |
| Compute redeployed to | coding, enterprise products, AGI |
| Sora tech retained for | internal **"world simulation" research aimed at robotics** |

💡 **Four GP lessons, in descending order of non-obviousness**:

1. **The most important one, and it is counterintuitive: OpenAI killing Sora is *bullish* for startups in generative entertainment, not bearish.** OpenAI did not shut Sora because generative video is impossible. It shut Sora because **OpenAI's opportunity cost of a GPU-hour is the highest in the world.** A frontier lab must allocate compute to its highest-margin use — enterprise coding at $30/MTok output. A startup's opportunity cost of a GPU-hour is zero. **Frontier labs will systematically vacate high-COGS/low-ARPU consumer categories, and that vacancy is durable, not temporary.** Runway (+ Lionsgate), Kling, Hailuo, Pika and Adobe are the beneficiaries. So could a Monastery company be.
2. **But 1% D30 retention is a category-level warning, not just an execution failure.** Against the companion category's 43%, the read is that **novelty generation does not retain; relationship and continuity do.** Any generative-entertainment pitch must answer retention before quality.
3. **Vendor risk is now a diligence line item.** Disney committed $1B and got <1 hour of notice. Any Monastery company whose product depends on a single frontier API must have a documented, tested migration path. Ask for it at selection.
4. **Never underwrite on falling frontier compute cost** (§2.3). Sora needed frontier-tier costs to collapse. They didn't. Frontier input has held at ~$5/MTok all year.

## 6.4 Winner-take-all vs long tail: the market is answering "both, at different layers"

📊 **The consolidating layer** (foundation models + assistants): 90% of AI-assistant time in three apps; two labs at ~$105B combined run-rate vs *every other dedicated model developer below $1B/year* as of late 2025/2026 (Epoch AI). xAI absorbed into SpaceX (2026-02-02). Anysphere absorbed into SpaceX (2026-08-14). This layer is winner-take-few and closed to Monastery.

📊 **The fragmenting layer** (applications): Cursor's own AI-coding category share **fell from 41% (June 2025) to ~26% (May 2026)** as Anthropic's Claude Code took ground — Claude Code crossed **18% workplace usage by January 2026** ([business-news-today](https://business-news-today.com/spacex-finalises-60bn-cursor-acquisition-targets-anthropic-in-ai-coding-fight/); [tryanalyze](https://www.tryanalyze.ai/blog/fastest-growing-ai-companies)).

⚠️ **Read that last fact carefully, because it cuts against the easy optimism**: Cursor was the **fastest-growing B2B software company in history** and still lost **15 points of category share in 11 months** — to the model provider it was built on. **Being fastest is not the same as being defensible.** Cursor's response was to sell to a compute owner (SpaceX at $60B, ~23x its ~$2.6B annualized B2B revenue).

💡 **The structural lesson for Monastery**: in categories where the *frontier lab is also a plausible direct competitor* (coding, general writing, general research, generic agents), even a historically unprecedented growth rate does not produce durable share. **The moat has to be something the lab cannot acquire by shipping a better model: proprietary data, a regulated relationship, a physical footprint, or ownership of the system of record.** Apply that test before the market-size test.

---

# 7. THE INVESTMENT MAP — WHERE THE GAP IS TRADEABLE AT $2M

## 7.0 The frame

📊 **Restating the diffusion equation from §4**:

> **Diffusion speed ≈ f(output verifiability × buyer/builder/user alignment × absence of integration & regulatory gates)**

| | Fast lane (12–24 months) | Slow lane (5–10 years) |
|---|---|---|
| Buyer | Individual practitioner with budget | Institution / committee |
| Output | Machine-verifiable (tests, tickets closed, docs matched) | Judgment-based, contested |
| Integration | None or self-serve | System-of-record surgery |
| Regulation | None | Licensing, safety, procurement |
| Evidence | Cursor $100M→$4B/18mo; Anthropic 3%→80% code/15mo; Sierra $100M→$200M/1yr | Census 18%; McKinsey <10% agents scaled per function; Acemoglu 0.53%/10yr |
| Monastery fit | Direct — **but crowded and lab-adjacent** | Indirect — **needs a bottom-up wedge** |

💡 **The Monastery trade is not "pick a lane." It is: find slow-lane markets and manufacture fast-lane conditions inside them** — build the verifier, collapse buyer and user into one person, and route around procurement by selling to the practitioner. Census confirms this channel exists at scale: worker-level AI use *"sometimes occurs without formal firm-level adoption."*

## 7.1 The check-size reality check (do this arithmetic first)

📊 **Monastery terms** (public, [cyber.fund](https://cyber.fund/)): $2M uncapped SAFE + 5% equity, 12 weeks, ~10 teams/batch, seed–A.

📊 **The market it is pricing into** ([Carta State of Private Markets Q1 2026](https://carta.com/data/state-of-private-markets-q1-2026/); [PitchBook-NVCA Q1 2026](https://hub.causo.ai/guides/seed-to-series-a-graduation-rate-benchmarks-2026)):

| Benchmark | Q1 2025 | Q1 2026 |
|---|---|---|
| Seed median pre-money | $16.0M | **$18.4M** |
| Series A median pre-money (all) | $48.0M | **$62.0M** |
| Series A median pre-money, **non-AI** | — | **$55M** |
| Series A median pre-money, **AI foundational** | — | **$300M** (5.4x non-AI) |
| Series A median deal value | — | **$19.6M** |
| Share of Carta VC dollars → AI | — | **>60%** (record); 83% within SaaS |
| Foundational models as share of total VC capital | — | **14.2%** (≈¼ of all AI capital) |
| Q2 2026: AI share of capital / deals | — | **~75% / ~66%** (up from 64%/64% in Q1) |
| Seed→A graduation | ~30–40% historically | **~20%** (some cohort measures 13–15% within 24mo) |
| Median seed→A interval | — | **616 days (~20 months)** |
| Series A bar | — | ~**$3M ARR**, 2x YoY, burn multiple <1 |

⚠️ **Three structural risks in the Monastery instrument that the market data exposes**:

1. **$2M for 5% implies a ~$40M post / ~$38M pre — roughly 2x the $18.4M seed median.** Monastery is priced at **late-seed/pre-A**, not seed. That is defensible for a program with real leverage, but it means competing against *priced* rounds and it demands the program itself be the differentiator, not the price.
2. **The uncapped SAFE is dangerous in this specific market.** If a portfolio company graduates into an AI-foundational-priced round, $2M uncapped converts at **~0.67%** at a $300M pre. The fund's economics then rest almost entirely on the 5%. *(Ambiguity flagged in `00-context.md`: public terms say uncapped SAFE **and** 5% — I read this as a YC-style two-instrument structure. If instead the 5% *is* the SAFE conversion, the downside case is materially worse. **Resolve this before Batch 2 closes.**)*
3. **~20% graduation and a 616-day median seed→A interval** mean $2M must fund ~20 months at a $3M-ARR bar. **A 12-week program that does not produce contracted revenue inside the program has not bought enough.** The program's KPI should be *first contracted/metered revenue*, not demo quality.

📊 **The one unambiguous constraint**: at $300M median pre-money for AI foundational Series A, **foundation models, general agent frameworks, and horizontal infrastructure are structurally out of reach.** Not "risky" — arithmetically out of reach. Do not spend batch slots there.

## 7.2 The opportunities

---

💡 **OPPORTUNITY 1 — The 50%→80% reliability gap, sold vertically**

- **What**: Domain-specific verification, evaluation and scaffolding that converts a 3–4-hour-at-80% agent into an 8-hour-at-95% agent in one vertical. Not a horizontal eval platform — a *domain verifier* that encodes what "correct" means in radiology billing, or construction submittals, or municipal permitting.
- **Why now, precisely**: METR frontier = 16–20h @50% but **3–4h @80%**; Opus 4.6 = 719min @50% vs **70min @80%**. Commercial workflows need 95%+. **Nobody's next pretraining run closes a 10x reliability gap in your vertical — only your domain evaluator does.** RSI evidence (§4) confirms: automated improvement works *exactly where a cheap correct scoring function exists*. Building that function for a domain is a durable asset that also makes the domain amenable to self-improvement loops you own.
- **Why it's defensible**: the evaluator is built from proprietary domain outcome data. The lab cannot see it. Compounds with usage.
- **Stage / check**: Pre-seed–Seed. $2M is the right size.
- **Metrics to underwrite**: 80%-reliability task-length improvement over baseline frontier; % of agent runs auto-accepted without human review, trending up monthly; cost per verified deliverable.
- **Risks**: horizontal eval players (Braintrust/LangSmith/OpenAI evals) commoditize the tooling — *survivable only if the moat is the domain data, not the harness*.
- **Big Tech 6-week test**: ✅ **PASSES** — they lack the domain outcome data.

---

💡 **OPPORTUNITY 2 — Pre-packaged workflow-native applications in one vertical**

- **What**: Sell the *redesigned workflow as a product*, with the system of record included. Not "AI for X" bolted onto the incumbent SoR — replace the SoR for a narrow function.
- **Why now**: McKinsey's causal finding is that **workflow redesign is the determinant of ROI**, only **~21%** have done it, and Gartner prices a bespoke redesign at **$5–20M** — 2.5–10x the whole Monastery check. **The arbitrage is productizing what currently costs $5–20M as consulting.** ~80% cite data limitations as the blocker to scaling agents; owning the SoR *is* the data fix.
- **Why it's defensible**: owning the system of record is the only application-layer moat that survived 2024–2026. Cursor didn't own one and lost 15 points of share in 11 months.
- **Stage / check**: Seed. $2M funds one vertical to first contracted revenue.
- **Metrics**: % of the target workflow executed end-to-end without human handoff; net revenue retention; time-to-first-value <30 days (you cannot afford an enterprise cycle).
- **Risks**: vertical SaaS incumbents adding AI to an SoR they already own — you must be 10x on the workflow, not 10% on the feature.
- **Big Tech 6-week test**: ✅ **PASSES** — Big Tech does not do vertical systems of record.

---

💡 **OPPORTUNITY 3 — Longitudinal, consented, regulated-domain memory**

- **What**: Applications whose core asset is a multi-year model of one entity — a child's learning trajectory, a patient's care history, a building's maintenance record — assembled from sources a frontier lab cannot legally or practically access.
- **Why now**: Continual learning did **not** ship (§3). Both labs shipped generic *preference* memory within four weeks of each other (Anthropic 2026-05-07 research preview; OpenAI 2026-06-04 beta). Generic memory is now a commodity feature. **Domain-bound longitudinal memory is not, and the labs' path to it runs through consent regimes and data access they do not have.**
- **Why it's defensible**: the asset appreciates with time-in-market and is legally fenced. It is also the rare moat that gets *stronger* if labs ship better memory, because better generic memory raises the value of your proprietary substrate.
- **Stage / check**: Seed. Long build; $2M must reach a first cohort with measured retention.
- **Metrics**: cohort retention at 12 months; depth of longitudinal record per user; demonstrated outcome delta vs a memoryless baseline.
- **Risks**: **highest Big-Tech-absorption risk in this map if the memory is not truly domain-bound.** Kill any pitch where "memory" means remembering user preferences.
- **Big Tech 6-week test**: ⚠️ **CONDITIONAL** — passes only with proprietary longitudinal data; fails otherwise.

---

💡 **OPPORTUNITY 4 — The entry-level labor hole, both sides**

- **What (a)**: AI-native apprenticeship and skills credentialing — certifying demonstrated capability, especially *agent supervision*, rather than coursework.
- **What (b)**: Outcome-priced agent capacity sold directly into the junior roles that are no longer being backfilled.
- **Why now**: Stanford — 22–25-year-olds in AI-exposed occupations **19% below** parity, widening from 15%, driven by **reduced hiring not separations**, through June 2026. NY Fed — recent-grad unemployment **5.7%** vs **4.1%** overall. CS enrollment **−8.1%** while AI programs grow at 56% of institutions. AI skills carry a **16% wage premium** while the **degree premium for AI roles has vanished entirely**. **The work still exists; the junior headcount does not.** That is a demand signal with a dated, quantified magnitude on both sides.
- **Why it's defensible**: (a) employer-side outcome data on placement creates a two-sided flywheel no lab will build; (b) outcome pricing (Sierra's model: $100M→$200M ARR in a year) creates verifiable value capture and aligns with the CFO scrutiny documented in §5.2.
- **Stage / check**: Seed. Both are $2M-appropriate; (b) can reach revenue inside 12 weeks.
- **Metrics**: (a) placement rate and wage delta vs control; (b) cost per resolved outcome vs loaded cost of the junior FTE not hired.
- **Risks**: (a) credentialing is a two-sided cold-start and historically a graveyard — needs a named employer consortium at day one; (b) outcome pricing exposes you to model cost inflation (§2.3) — must run on commodity tier.
- **Big Tech 6-week test**: ✅ **PASSES** — neither is a model feature.

---

💡 **OPPORTUNITY 5 — Categories the frontier labs are structurally vacating**

- **What**: High-COGS/low-ARPU-per-compute-hour consumer categories that a lab with a $30/MTok enterprise alternative cannot justify. Generative entertainment, interactive worlds, personalized media.
- **Why now**: **Sora is the proof.** OpenAI killed a flagship consumer product 6 months post-launch at ~$1M/day against **$2.1M lifetime revenue**, torched a **$1B Disney deal**, and redirected the compute to coding. Altman called it a *"side quest."* The vacancy is structural — it follows from opportunity cost, not from strategy drift, so it persists.
- **Why it's defensible**: it isn't, technologically. It is defensible only through **retention mechanics**, and there is a dated benchmark for what works: companion apps at **43% D30 / $25.20 ARPU / 25.8 min daily** vs Sora at **1% D30**. Continuity and relationship retain; novelty generation does not.
- **Stage / check**: Seed, **with an unusually hard gate**.
- **The three questions to gate on, and do not waive any of them**:
  1. **Cost per engaged session at *today's* frontier prices** (Sora: ~$1.30 per 10-second clip). No path-to-cheaper assumptions.
  2. **D30 retention target and the mechanism** — must be nearer 43% than 1%, and the mechanism must be persistence/relationship, not fidelity.
  3. **Vendor-risk migration path** — Disney got <1 hour of notice.
- **Risks**: Genie 3's limits are the ceiling — **worlds are not persistent past a few minutes, ~60s effective memory, no multi-agent interaction**. A generative-series company must build persistence in the application layer.
- **Big Tech 6-week test**: ✅ **PASSES on willingness** (they demonstrably will not) / ⚠️ **FAILS on capability** (they trivially could). Bet on the incentive, and size the position knowing it can change.

---

💡 **OPPORTUNITY 6 — Bottom-up wedges into slow-lane institutions**

- **What**: Sell to the individual practitioner inside an institution that cannot buy — the teacher, not the district; the foreman, not the GC; the nurse manager, not the health system. Accumulate usage, then convert to institutional contract after the fact.
- **Why now**: Census documents this channel empirically — worker-task AI use **occurs without firm-level adoption**, at 23% of firms (41% employment-weighted). Cursor reached **70% of the Fortune 1000** with no traditional enterprise sales motion.
- **Why it's defensible**: distribution earned bottom-up is expensive for an incumbent to dislodge, and it inverts the sales-cycle problem that otherwise makes slow-lane markets uninvestable at $2M.
- **Stage / check**: Seed. This is the *only* way $2M touches education, healthcare, government or construction.
- **Metrics**: individual weekly actives inside target institutions; organic institution-count spread; conversion rate from individual → institutional contract.
- **Risks**: procurement/IT shutdown of shadow usage; institutional data-governance rules; long conversion tail.
- **Big Tech 6-week test**: ✅ **PASSES** — Big Tech sells top-down.

---

## 7.3 Where only Big Tech or PE wins — do not spend batch slots here

⚠️ **Foundation models / frontier training.** AI-foundational Series A median pre-money **$300M** (Carta Q1 2026). $2M buys 0.67%. Arithmetically excluded.

⚠️ **Compute, datacenters, energy.** $733B/yr scale; Capex Absorption Ratio 99.0%; the constraint is memory supply and grid interconnect. Not a venture-check problem.

⚠️ **Horizontal AI memory, generic agent frameworks, general-purpose coding agents.** Both labs shipped memory in May–June 2026. Cursor was the fastest-growing B2B software company in history *and lost 15 points of category share in 11 months to its own model provider*, then sold to a compute owner. If a frontier lab is a plausible direct competitor, historical-record growth is not sufficient.

⚠️ **Services roll-ups (buy-and-transform).** General Catalyst Creation has deployed **$750M+ across 10+ companies** (Creation Fund $800M→$1.5B; ~70 service categories mapped, ~10 where AI can automate 30–70%). Thrive Holdings raised **$2B at a self-reported $12B valuation on 2026-08-12** (SoftBank, D1, Altimeter), **70+ businesses** across Current (accounting, 50+ firms, 2,000+ professionals) and Shield (IT, ~20 companies), with OpenAI holding equity and embedding engineers since Dec 2025 ([TechCrunch 2026-08-12](https://techcrunch.com/2026/08/12/openai-backed-thrive-holdings-raises-2b-to-bring-ai-to-the-enterprise/)). **$2M cannot buy an SMB.** This is a $100M+ game.

📊 **And the roll-up thesis itself is unproven — hold this line hard.** A.J. Wasserstein's Yale study of search-fund acquisitions (the closest academic analog) finds **EBITDA margins fell from 25% at entry to 19% at exit**, and **80% of enterprise value creation came from exit multiple re-rating, not operating improvement** ([demg.ai](https://demg.ai/blog/ai-roll-up-trap-margin-story-owner-operators/)). GC's portfolio is **<3 years old, has never seen a recession, and every margin claim is self-reported and unaudited**. Thrive's own disclosed metrics are activity, not outcome: TaxAI processed 7,000+ returns at 98% accuracy with >30% prep-time reduction; Shield cut help-desk resolution 36x. Real — but not audited EBITDA. Noah Intelligence's warning is the right frame: treat "AI-adjusted EBITDA" as **operating debt until proven**, because a £10M salary reduction capitalized as maintainable EBITDA adds many multiples of that to enterprise value, and if £4M returns as cloud cost, contractors, rehiring, discounts and remediation, the buyer has bought a liability.

✅ **The Monastery-shaped exception inside roll-ups**: (a) **picks-and-shovels for the roll-up buyers** — diligence, integration and agent-deployment tooling for sub-$50M-revenue services businesses, sold to GC/Thrive/Lightspeed/8VC/Khosla and to the long tail of searchers; and (b) **AI-native services companies built from scratch rather than acquired** — the Crescendo pattern, which reportedly holds a 4x margin advantage over traditional BPO with no integration debt and no overpayment risk. **Build, don't buy.** Detail belongs to the ai-rollups track.

## 7.4 Archetypes to fund

📊 **Archetype A — "The Verifier"**
Owns the definition of correct in one vertical. Sells reliability, priced per verified outcome. Underwrite: 80%-horizon extension, auto-accept rate trending up, cost per verified deliverable falling.

📊 **Archetype B — "The Workflow Owner"**
Replaces the system of record for one narrow function and ships the redesigned workflow pre-packaged. Underwrite: % of workflow with zero human handoff, NRR, time-to-first-value <30 days.

📊 **Archetype C — "The Longitudinal Record"**
Accumulates a multi-year, consented, regulated-domain model of one entity. Underwrite: 12-month cohort retention, record depth, measured outcome delta vs memoryless baseline.

📊 **Archetype D — "The Replacement Junior"**
Sells outcome-priced capacity into roles no longer backfilled. Underwrite: cost per resolved outcome vs loaded FTE cost; **gross margin computed at today's frontier prices**.

## 7.5 The Monastery filter, as a checklist

For each candidate, in order. Any ❌ is disqualifying.

1. **Lane test** — fast lane, or slow lane with a *specific, named* bottom-up wedge?
2. **Verifiability test** — can you write a cheap, correct scoring function for the output? If not, diffusion will be slow regardless of model quality.
3. **Moat test** — is it proprietary data, a regulated relationship, a physical footprint, or the system of record? Prompts, fine-tunes and UI are not moats. *(Cursor: fastest ever, −15pts share in 11 months.)*
4. **Big Tech 6-week test** — could a frontier lab ship this as a feature? If yes, is there a *durable incentive* reason they won't? *(Sora is precedent for "they won't"; memory is precedent for "they will, in four weeks, at both labs.")*
5. **Unit economics test** — gross margin positive at **today's** frontier prices, with the default path on the commodity tier. No cost-decline assumptions. *(Sora: $1.30/10s clip.)*
6. **Vendor risk test** — documented, tested migration path off the primary model provider. *(Disney: <1 hour notice.)*
7. **12-week test** — does the program produce **first contracted or metered revenue**, not a demo? *(616-day median seed→A; ~$3M ARR bar; ~20% graduation.)*
8. **Drawdown test** — 24 months of runway on $2M + revenue through a −40% AI-equity drawdown. *(BIS: $1.65T off-balance-sheet; Nvidia CDS doubled in two months.)*
9. **Check-size test** — is $2M for ~5% consistent with the round the company will actually need? If it's foundational-model-adjacent, walk.

---

# 8. RISKS TO THIS ANALYSIS

⚠️ **Thesis risk — diffusion accelerates and the gap closes early.** If continual learning ships parametrically, the largest deployment cost (workflow redesign, $5–20M/customer) collapses and slow-lane markets reprice fast. *Monitor: any lab moving on-the-job weight adaptation out of research preview.* **No current evidence; highest-variance unknown in the map.**

⚠️ **Thesis risk — diffusion is even slower than modeled.** Acemoglu's <0.53%/10yr may prove right *including* the fast lane, if fast-lane wins stay confined to software. Measured productivity at ~2% y/y in 2026Q2 is barely above a 20-year trend, and Klein notes it *"looked slightly better a few quarters ago."* **The recent trend is decelerating.**

⚠️ **Market risk — a capex unwind.** BIS: hyperscaler AI debt growing faster than the balance sheets carrying it; ~$1.65T off-balance-sheet vs $1.35T reported. Goldman's modeled reversal drag of −0.2 to −0.4pp GDP is likely understated for the reason given in §1.4. Nvidia 5-yr CDS roughly doubled in two months. Oracle at $124.7B non-current debt with ~−$24.7B trailing FCF is the load-bearing node. ✅ *Mitigant: an unwind lowers inference prices and frees talent — it hurts infrastructure, not application-layer companies with real usage revenue. Enforce filter #8.*

⚠️ **Rate risk.** 65–68% odds of a **hike** on Sept 16; 30-year at a 19-year high of 5.33%. If Warsh's "race" resolves toward capex-driven inflation, the discount rate on long-duration equity rises further. ✅ *Mitigant: the fast lane is short-duration by construction — that is a reason to favor it.*

⚠️ **Competitive risk — lab absorption.** Both labs shipped memory within four weeks of each other. Cursor lost 15 points of share to its own model provider while growing faster than any B2B company in history. ✅ *Mitigant: filters #3 and #4, applied without exception.*

⚠️ **Data-quality risk in this document.** Several figures come from secondary aggregators (Axis Intelligence, futureX, Alice Labs, tryanalyze) and one first-party vendor index (AI Girlfriends). Capex definitions differ across all four hyperscalers — Axis itself labels the $732.5B sum *"an estimate rather than a finding."* METR explicitly cautions that measurements above 16 hours are unreliable. Anthropic and OpenAI use different revenue-recognition standards. **The §1.5 required-revenue arithmetic is mine, not sourced.** ✅ *Mitigant: primary sources cited wherever available (BLS, Census CES-WP-26-25, Federal Reserve FEDS Note, KC Fed, Bloomberg, Reuters, Carta, PitchBook-NVCA, arXiv, METR).*

⚠️ **Structural risk to the Monastery instrument itself.** The uncapped SAFE converting at ~0.67% into a $300M-pre AI Series A. **This is a fund-economics question, not a market question, and it should be resolved before Batch 2 closes** (see §7.1, note 2).

---

# 9. KEY SOURCES

🔗 **Macro / rates / labor**
- BLS Employment Situation, July 2026 (2026-08-07) — https://www.bls.gov/news.Release/empsit.htm
- Reuters, payrolls −23k, revisions −103k (2026-08-07) — https://www.reuters.com/business/us-nonfarm-payrolls-fall-july-unemployment-rate-eases-41-2026-08-07/
- CNBC, Warsh Jackson Hole / Sept hike odds (2026-08-31) — https://www.cnbc.com/2026/08/31/markets-see-warsh-endorsing-a-rate-hike-in-september-not-everyone-is-convinced.html
- KPMG, July 2026 jobs report — https://kpmg.com/us/en/articles/2026/july-2026-jobs-report.html
- Blue Line Search, 31-month white-collar contraction (2026) — https://www.bluelinesearch.ai/insights/white-collar-payroll-contraction-31-months-recruiter-2026
- The Overshoot (Klein), AI/productivity/rates — https://theovershoot.co/p/ai-productivity-and-rates-part-i

🔗 **Capex / financing**
- Axis Intelligence AI Capex Tracker (retrieved 2026-08-01) — https://axis-intelligence.com/ai-capex-tracker/
- Platformonomics, Follow the CAPEX Q2 2026 (2026-07) — https://platformonomics.com/2026/07/follow-the-capex-q2-2026-scoreboard/
- futureX, Big Tech AI Capex Q2 2026 (2026-08-03) — https://futurex.capital/en/ai-lab/reports/big-tech-ai-capex-2026q2
- I/O Fund, AI capex to $1T (Aug 2026) — https://io-fund.com/ai-stocks/ai-capex-1-trillion-estimates-too-low
- FootnoteBrief, depreciation + circularity — https://footnotebrief.com/hyperscaler-depreciation-ai-capex-circularity/
- Analysis Atlas, circular financing / vendor loops — https://analysis-atlas.com/research/ai-circular-financing-vendor-loops/
- 24/7 Wall St., Burry / BIS off-balance-sheet (2026-08-13) — https://247wallst.com/investing/2026/08/13/michael-burry-sounds-the-alarm-again-ai-is-a-circular-financing-web-with-nvidia-in-the-middle/
- Grep News, Burry $176B depreciation thesis — https://grep.news/episode/burry-s-176b-ai-depreciation-short-on-oracle-and-meta
- CSIS, tariffs and the datacenter buildout — https://www.csis.org/index%2ephp/analysis/impact-tariffs-ai-data-center-buildout-balancing-supply-chain-security-and-ai
- CCIA, semiconductor tariffs / GDP contribution — https://ccianet.org/articles/applying-semiconductor-tariffs-to-data-centers-would-cost-the-u-s-90-billion-a-year/
- TFTC, AI capex 74% of Q1 2026 GDP growth (BEA 3rd est., 2026-06-25) — https://www.tftc.io/ai-capex-gdp-growth-q1-2026-bea-third-estimate
- Investing.com, Goldman (Peng) net GDP contribution 0.1–0.3% — https://ng.investing.com/analysis/ai-capex-risk-cuts-both-ways-in-the-american-economy-217751
- arXiv 2601.11196, AI and the US economy: accounting perspective — https://arxiv.org/pdf/2601.11196

🔗 **Capability**
- METR, Task-Completion Time Horizons (updated 2026-05-08) — https://metr.org/time-horizons/
- arXiv 2503.14499v4, Measuring AI Ability to Complete Long Software Tasks — https://arxiv.org/html/2503.14499v4
- METR TH1.1 tracking, doubling windows — https://ai2027-tracker.com/predictions/metr-doubling/ ; https://benchmarks.darvinyi.com/agents/metr-time-horizon
- GDPval (OpenAI, ICLR 2026) — https://cdn.openai.com/pdf/d5eb7428-c4e9-4a33-bd86-86dd4bcf12ce/GDPval.pdf ; https://epoch.ai/benchmarks/gdpval
- o-mega, 2026 agent benchmark guide (METR × GDPval × Vending-Bench synthesis) — https://o-mega.ai/articles/the-best-ai-agent-evals-and-benchmarks-full-2025-guide
- Epoch AI, "An update on AI's most important number" — https://epoch.ai/gradient-updates/an-update-on-ais-most-important-number
- Axis Intelligence, AI inference cost statistics (2026-07-29 pricing) — https://axis-intelligence.com/ai-inference-cost-statistics/
- DeepMind Genie 3 / Project Genie (2026-01-29) — https://almcorp.com/blog/google-deepmind-project-genie-technical-analysis-applications/ ; https://world-models.io/en/models/genie-3/
- Genie 3 limitations — https://bdtechtalks.com/2025/08/07/deepmind-genie-3/ ; https://milvus.io/ai-quick-reference/what-are-the-current-limitations-or-constraints-of-genie-3
- GeniWorld (arXiv 2608.06332) — https://arxiv.org/html/2608.06332

🔗 **Continual learning / RSI**
- Anthropic Claude Managed Agents: dreaming / outcomes / multiagent (2026-05-07) — https://aitutorials.com.au/news/2026-05-07-anthropic-claude-agents-dreaming/
- OpenAI ChatGPT "Dreaming" memory (2026-06-04) — https://uncensoredhub.ai/news/2026-06-04-chatgpt-s-nightly-memory-consolidation-keeps-user-preferences-fresh-across-sessi
- Turing Post, Continual Learning in LLMs — https://www.turingpost.com/p/continual-learning-llms-ai-models-sleep
- Sean Goedecke, What's so hard about continuous learning — https://www.seangoedecke.com/continuous-learning/
- HN 47259384, what top labs actually do (RL'd memory-writing) — https://news.ycombinator.com/item?id=47259384
- Anthropic RSI note via TechBooky (>80% of merged code, May 2026) — https://www.techbooky.com/anthropic-says-claude-is-already-helping-build-better-ai/
- arXiv 2607.07663v1, RSI survey — https://arxiv.org/html/2607.07663v1
- IEEE Spectrum, RSI edges closer in AI labs — https://spectrum.ieee.org/recursive-self-improvement
- ai-talks.org, RSI field survey (2026-06-11) — https://ai-talks.org/2026/06/11/recursive-self-improvement/

🔗 **Diffusion / productivity**
- US Census CES-WP-26-25, Microstructure of AI Diffusion (BTOS 2026 supplement) — https://www2.census.gov/library/working-papers/2026/adrm/ces/CES-WP-26-25.pdf
- Federal Reserve FEDS Note, Monitoring AI Adoption (2026-04-03) — https://www.federalreserve.gov/econres/notes/feds-notes/monitoring-ai-adoption-in-the-u-s-economy-20260403.html
- KC Fed, A New US Productivity Chapter? — https://www.kansascityfed.org/research/economic-bulletin/a-new-us-productivity-chapter-what-industry-data-say-about-ai/
- McKinsey State of AI — https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
- QuantumBlack, Escaping AI Pilot Purgatory — https://medium.com/quantumblack/escaping-ai-pilot-purgatory-from-poc-to-p-l-1216d30ec4d0
- McKinsey, Scaling agentic AI with data transformations — https://www.mckinsey.com.br/capabilities/mckinsey-technology/our-insights/building-the-foundations-for-agentic-ai-at-scale
- Alice Labs, AI Automation ROI Benchmark 2026 — https://alicelabs.ai/reports/ai-automation-roi-benchmark-2026
- Acemoglu, The Simple Macroeconomics of AI — https://doi.org/10.1093/epolic/eiae042 ; https://doi.org/10.3386/w32487
- Brynjolfsson, 2.7% productivity prediction (2026-02-15) — https://www.linkedin.com/posts/erikbrynjolfsson_the-ai-productivity-take-off-is-finally-visible-activity-7428840286203613184-aMmv
- The Decoder, Brynjolfsson + Workhelix disclosure (2026-02-16) — https://the-decoder.com/stanfords-brynjolfsson-sees-ai-boosting-us-productivity-but-he-also-co-founded-an-ai-consulting-firm/
- McElheran, Yang, Brynjolfsson & Kroff, Microfoundations of the Productivity J-curve(s) — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5036270
- Richmond Fed, Will AI Investments Pay Off? (2026 Q1–Q2) — https://www.richmondfed.org/publications/research/econ_focus/2026/q1-q2_feature2
- arXiv 2606.01575v1, Boom, Bubble, or Buildout? — https://arxiv.org/html/2606.01575v1

🔗 **Labor second-order**
- Stanford Digital Economy Lab, Canaries in the Coal Mine (Aug 2026) — https://digitaleconomy.stanford.edu/app/uploads/2026/08/Canaries_August2026.pdf ; https://digitaleconomy.stanford.edu/news/canariesaug26/
- Ars Technica (2026-08) — https://arstechnica.com/ai/2026/08/ai-is-hitting-entry-level-jobs-hardest-stanford-study-finds/
- NPR / TSPR, counter-evidence incl. Ramp × Revelio (2026-08-18) — https://www.tspr.org/npr-news/2026-08-18/many-recent-grads-say-ai-is-making-it-harder-to-get-a-job-economists-arent-so-sure

🔗 **Education second-order**
- National Student Clearinghouse, CS enrollment cooling — https://www.studentclearinghouse.org/nscblog/computer-science-enrollment-is-cooling/
- Built In, CS degrees losing popularity (−8.1% / −11.2%) — https://builtin.com/articles/computer-science-degree-decline-ai
- Business Insider, Jacob Light (Hoover), first decline in ~2 decades (2026-07) — https://www.businessinsider.com/computer-science-enrollment-fell-after-chatgpts-rise-economist-says-2026-7
- AP News, CS majors down, AI for everyone else up — https://apnews.com/article/college-major-ai-computer-science-coding-f0dca8e4f7e16297ad27c2b02adc2530
- SSRN 4603764, Skills or Degree? — https://doi.org/10.2139/ssrn.4603764

🔗 **Consumer / entertainment**
- Sensor Tower State of AI 2026 (2026-06-16) — https://www.prnewswire.com/news-releases/sensor-tower-state-of-ai-2026-report-global-time-spent-on-generative-ai-apps-projected-to-more-than-double-year-over-year-302800844.html
- Instant Press, AI & ChatGPT statistics 2026 — https://www.instantpress.co/ai-statistics
- Forbes, When AI Vendors Fail: Lessons from the Sora Shutdown (2026-04-02) — https://www.forbes.com/sites/johnsviokla/2026/04/02/when-ai-vendors-fail-lessons-from-the-sora-shutdown/
- ngram, Why OpenAI Shut Down Sora — https://www.ngram.com/blog/openai-sora-shutdown-ai-video-economics
- Presenc AI, AI video market post-Sora — https://presenc.ai/research/ai-video-market-post-sora-shutdown-2026
- HTX Insights, Sora shutdown / Disney — https://www.htx.com/news/openai-shuts-down-sora-disneys-1-billion-investment-goes-dow-uXmfYdp9/
- AI Girlfriends Industry Index, June 2026 *(first-party vendor data)* — https://aigirlfriends.ai/blog/ai-girlfriend-industry-report

🔗 **Investment activity**
- Carta, State of Private Markets Q1 2026 — https://carta.com/data/state-of-private-markets-q1-2026/
- Causo Hub, Series A bar H1 2026 — https://hub.causo.ai/guides/h1-2026-series-a-bar-report
- Causo Hub, seed→A graduation benchmarks 2026 — https://hub.causo.ai/guides/seed-to-series-a-graduation-rate-benchmarks-2026
- Bloomberg, Anthropic run-rate >$65B (2026-08-17) — https://www.bloomberg.com/news/articles/2026-08-17/anthropic-revenue-run-rate-surpasses-65-billion-ahead-of-ipo
- TechCrunch, Thrive Holdings $2B at $12B (2026-08-12) — https://techcrunch.com/2026/08/12/openai-backed-thrive-holdings-raises-2b-to-bring-ai-to-the-enterprise/
- Capital & Clarity, GC $1.5B AI roll-ups — https://capitalandclarity.substack.com/p/the-general-catalyst-behind-15-billion
- demg.ai, The AI Roll-Up Trap (Yale/Wasserstein margin data) — https://demg.ai/blog/ai-roll-up-trap-margin-story-owner-operators/
- Noah Intelligence, AI-adjusted EBITDA — https://noah-news.com/ai-adjusted-ebitda-savings-private-equity-should-not-capitalise/
- Terence Kok, AI companies actually printing revenue 2026 — https://terencekok.com/blog/who-actually-makes-money-from-ai-enterprise-revenue/
- Market Business News / Seeking Alpha / business-news-today, SpaceX–Anysphere close (2026-08-14) — https://marketbusinessnews.com/spacex-completes-all-stock-cursor-acquisition-at-60-billion-implied-value/450599/ ; https://business-news-today.com/spacex-finalises-60bn-cursor-acquisition-targets-anthropic-in-ai-coding-fight/

---

# 10. INVESTMENT ASSESSMENT

📊 **Thesis verdict**: **Directionally right, mechanically wrong — and the mechanical error is the whole game.**
- ✅ Aggregate diffusion is slow: 18% of firms, ~10% scaling agents per function, ~2% productivity growth, Acemoglu ≤0.53%/10yr. Confirmed.
- ✅ Capabilities are compounding at 2024–2026 speed: METR 89-day doubling since 2024, GDPval past expert parity, ~$105B combined lab run-rate up 3.5x y/y. Confirmed.
- ❌ **"Diffusion takes ~10 years" is an average that describes no actual market.** Anthropic went 3%→80% of its own merged code in 15 months. Cursor went $100M→$4B ARR in 18. The variable is buyer structure and output verifiability, not calendar time.
- ⚠️ **Continual learning and RSI do not change the slope in this window** — and RSI as currently practiced *widens* the capability-diffusion gap rather than closing it, which is *supportive* of the GP thesis.

📊 **Opportunity quality**: **Good, with hard constraints.**
- Market size — path to $1B+ outcomes? **Yes**, in verticalized reliability, workflow ownership, and the entry-level labor hole.
- Growth rate — fast enough? **Yes in the fast lane; no in the slow lane without a bottom-up wedge.**
- Timing — right window? **Yes, and it is narrowing.** The 50%→80% reliability gap is the current arbitrage; it closes as models improve. Expect 18–36 months of clear air, not five years.
- Competition — defensible position possible? **Only via proprietary data, regulated relationship, physical footprint, or system of record.** Cursor is the cautionary tale: fastest growth in B2B history, −15 points of share in 11 months, exit to a compute owner.

📊 **Recommendation**:
- **Actively pursue**: **Yes** — Opportunities 1, 2, 4 and 6 (verifiers, workflow owners, the entry-level hole, bottom-up institutional wedges).
- **Pursue conditionally**: Opportunities 3 and 5, only against the specific gates in §7.2 (domain-bound longitudinal memory; cost-per-session + D30 + vendor-migration for generative entertainment).
- **Pass**: foundation models, compute/energy, horizontal memory and agent frameworks, general coding agents, buy-and-transform roll-ups.
- **Thesis confidence**: **High** on the bimodal-diffusion reframing; **Medium** on the 18–36-month window estimate; **Low** on any capex-cycle timing call.

📊 **Next steps**:
1. **Resolve the SAFE structure ambiguity before Batch 2 closes** (§7.1, note 2). This is the highest-leverage internal action in the document.
2. Adopt the nine-point Monastery filter (§7.5) as the Batch 2 screening rubric.
3. Instrument the four falsifiable tripwires (§1.6) on a GP dashboard: hyperscaler useful-life revision, OpenAI down-round, Oracle 2027 refi pricing, Nvidia CDS.
4. Hand §7.2 Opportunity 5 gates to the generative-netflix track, Opportunity 6 to the education track, and §7.3's build-don't-buy exception to the ai-rollups track.

---

🎯 **COMPLETED:** investment-researcher finished Macro 2026 — Capabilities vs Diffusion analysis
