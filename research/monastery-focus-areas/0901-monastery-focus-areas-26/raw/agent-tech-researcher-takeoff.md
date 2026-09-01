# 🔍 tech-researcher — AI capability slope, continual learning, recursive self-improvement

**Agent**: tech-researcher
**Date**: 2026-09-01
**Scope**: SOTA models Aug/Sep 2026 · continual learning · automated AI research / RSI · world models · what is still blocked · economic implication
**Method**: WebSearch + WebFetch. Primary sources preferred (lab system cards, METR, Anthropic RSP reports, arXiv, Census). Recency-weighted to Jul–Aug 2026.

> **Confidence note**: benchmark leaderboard aggregators (BenchLM, morphllm, valueaddvc) are secondary and internally inconsistent on a few scores. Where a vendor number and an independent number conflict I show both. The load-bearing claims in this file come from Anthropic's Aug 2026 Risk Report, METR, OpenAI/DeepMind primary posts, Census BTOS, and arXiv papers.

---

## 1. Technical Overview — what the frontier actually is, Aug/Sep 2026

### 📊 The model set

| Model | Lab | Shipped | Notable |
|---|---|---|---|
| Claude Mythos 5 | Anthropic | ~Jul 2026 | Frontier for automated AI R&D per Anthropic's own RSP assessment; limited external availability (invite-only "Project Glasswing") |
| Claude Opus 5 | Anthropic | 2026-07-24 | SWE-bench Verified 96–97% (independent); quadrupled the ARC-AGI-3 record |
| Claude Fable 5 | Anthropic | ~Jul 2026 | #1 LMArena ~1,525 ELO after the 2026-07 re-baseline; leads repo-level coding |
| GPT-5.6 Sol / Terra / Luna | OpenAI | GA 2026-07-09 | Sol leads agentic terminal work: 88.8% Terminal-Bench 2.1, 80 on Artificial Analysis Coding Agent Index |
| Gemini 3.1 Pro | Google | 2026-02-19 | 1,048,576-token context; ARC-AGI-2 77.1%; vendor SWE-bench 80.6% vs independent 69.6–75.6% |
| Kimi K3 | Moonshot | weights 2026-07-27 | 2.8T params, largest open-weight model ever; #3 on BenchLM overall |
| Qwen3.8-Max | Alibaba | weights week of 2026-08-10 | 2.4T params, $2/$6 per MTok |
| DeepSeek V4 Pro / Flash | DeepSeek | Apr 2026, GA Aug | Cost leader; Flash $0.14/$0.28 off-peak; most permissive license |
| GLM-5.2 / 5.3 | Zhipu | Jun / Aug 2026 | 5.3 claims #1 CyberGym 84.5%; 6× coding gain via post-training alone |
| **Model 2** | Anthropic | unreleased | Internal-only. Best CoBench score (62.8%). Anthropic has "no current plans to release it externally" and has "not run all of our typical suite of predeployment assessments." |

**Sources**: [BenchLM frontier index, Sep 2026](https://benchlm.ai/frontier-ai-models) · [morphllm SWE-bench Pro, upd. 2026-08-10](https://www.morphllm.com/swe-bench-pro) · [Anthropic Transparency Hub](https://www.anthropic.com/transparency) · [Anthropic Redacted Risk Report, 2026-08-14](https://www-cdn.anthropic.com/f61d49fa5596956a5dec75fea0e973bf6a6a8378/Redacted+Risk+Report+August+2026+.pdf) · [Local AI Zone Jul/Aug 2026 roundup](https://local-ai-zone.github.io/blog/july-2026-ai-model-roundup.html)

### 📊 What jumped since January 2026

**a) SWE-bench Verified went from contested to saturated.** Per the empirical review [arXiv 2608.13675](https://arxiv.org/html/2608.13675v1) (Aug 2026), the trajectory:

```
2025-08  GPT-5             74.9
2025-11  Claude Opus 4.5   76.8
2026-04  GPT-5.5           85.1  (vendor)
2026-07  Kimi K3           93.4  (independent)
2026-07  Claude Fable 5    95.0
2026-07  GPT-5.6 Sol       96.2
2026-07  Claude Opus 5     97.0
```

That paper fits ~**5.8× annual growth in the odds** of resolving a real GitHub issue since Oct 2024. The benchmark is now decorative; the live signal moved to SWE-bench **Pro**, where the same models score in the 60s (Fable 5 80.0, Sol 64.6, Opus 4.7 64.3, GLM-5.2 62.1).

**b) The capability–cost curve collapsed.** GPT-5.6 **Luna** — the budget tier at $1/$6 per MTok — matches or beats the eleven-week-old GPT-5.5 flagship on most agentic benchmarks at one-fifth the price, and exceeds Aug-2025 GPT-5's SWE-bench Verified by ~18 points. On SWE-bench Pro, Luna scores 62.7% at $1.20/MTok vs Sol's 64.6% at $30/MTok. **1.9 points of capability costs 25× more.**

**c) The frontier fragmented and routing became standard.** Opus 5 leads human-preference frontend coding; Fable 5 leads repository-level coding; Sol leads agentic terminal work; Gemini 3.1 Pro is the cheap long-context option. arXiv 2608.13675 finds a **two-model router recovers the full per-benchmark gain of a six-model oracle**. There is no single best model, which matters commercially: it means capability is not a monopolizable asset at the API layer.

**d) METR's flagship metric saturated.** The 50% time horizon on METR's TH1.1 suite for the most capable model Anthropic shared in Feb–Mar 2026 was **16–20 hours** — over two full-time-equivalent days. METR's dashboard now carries the notice: *"Measurements above 16 hrs are unreliable with our current task suite"* (posted 2026-05-08). On MirrorCode-Early, a software-reimplementation benchmark METR built with Epoch AI, the same agents solve tasks that take humans **weeks** (>100h horizon, mostly saturated).

**e) Doubling time is ~3–4 months, not 7.** METR's [Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/) (2026-01-29) expanded the suite 170→228 tasks and doubled 8h+ tasks 14→31:

| Window | TH1.0 | TH1.1 |
|---|---|---|
| Full period (2019–2025) | 195.8d | 196.5d |
| ≥2023 | 165.3d [129, 211] | **130.8d [107, 161]** |
| ≥2024 | 108.9d | **88.6d** |

The widely-quoted "doubling every 7 months" is the long-run average, not the current slope.

**f) Open weights sit ~4 months / ~8 ECI points behind and stopped closing.** Epoch AI measured an average four-month, eight-point lag over 2026-01-01 → 2026-05-28 (90% CI 7–11 units), slightly *wider* than the three-month lag it measured over Jan 2023 – Oct 2025. On Artificial Analysis (2026-08-02), Kimi K3 Max scores 60 vs Claude Opus 5 at 61. Note the disagreement: CAISI put DeepSeek V4 Pro about **eight** months behind the frontier on a suite the developers could not have optimised toward — twice the leaderboard-derived estimate. ([Lumisonde open-weight report](https://lumiere-research.com/reports/open-weight-frontier/) · [ORF, Aug 2026](https://www.orfonline.org/expert-speak/open-weight-ai-shifting-the-frontier-in-india-s-favour))

**g) Real economic work: GDPval crossed parity.** OpenAI's GDPval (1,320 tasks, 44 occupations, top 9 US GDP sectors, authored by professionals averaging 14 years' experience) had Claude Opus 4.1 at **47.6% wins+ties** vs human expert deliverables in the Sep/Oct 2025 paper. The [ICLR 2026 update](https://iclr.cc/media/iclr-2026/Slides/10008039_VxIDLgu.pdf) reports several models above the 50% parity line and the **top model at roughly 74% wins+ties**. Progress on GDPval is described as "roughly linear over time."

---

## 2. Continual Learning — 📊 no lab shipped it. Everyone shipped memory.

This is the single most important finding in this file, and it is unambiguous.

### What shipped in production (all memory-layer, zero weight updates)

**Anthropic — Claude "Dreaming"** (announced 2026-05-06, Code with Claude conference). Research preview only, gated behind a developer request form, available on Opus 4.7 and Sonnet 4.6, **not in the consumer Claude app**.

- Mechanism: reads up to 100 past session transcripts plus the entire existing memory store during idle gaps, emits a reorganized plain-text memory + structured playbooks. Human-readable, editable, deletable. Two modes: fully automated, or human-in-the-loop approval. Raw transcripts untouched.
- Alex Albert (research PM lead), on the record: *"We're not changing the model itself through dreaming — it's not doing updates to the weights or anything like that."*
- Reported outcome: Harvey saw a 6× jump in task completion. "The model did not change. The memory did."
- Honest framing from the coverage: *"Dreaming is a memory maintenance system, not a learning system. It reorganizes what the agent already knows. It does not give the agent the ability to figure out things it could not figure out before."*

**OpenAI — "Dreaming v3"** ([launched 2026-06-04](https://openai.com/index/chatgpt-memory-dreaming/)). Background memory synthesis between sessions. Plus/Pro US first, then Free/Go tiers.

- Lineage: saved memories (Apr 2024) → dreaming v0 (Apr 2025, references chat history) → Dreaming v3 (Jun 2026).
- Factual recall eval: **41.5% → 67.9% → 82.8%** across those three generations.
- ~**5× reduction** in compute to serve dreaming, which is what made the Free-tier rollout viable.
- Also strictly a memory state written between sessions and read by the next one. No gradient touches the model.

Both labs independently converged on the same architecture, gave it the same name, and shipped it within a month of each other. That convergence is itself the signal: **consolidation-in-token-space is the tractable version of continual learning at frontier scale in 2026.**

### What the research actually does touch weights

**Google Research — "Language Models Need Sleep: Learning to Self-Modify and Consolidate Memories"**, [arXiv 2606.03979](https://arxiv.org/html/2606.03979v2), posted 2026-06-03 (OpenReview version since Sep 2025).

This is the real thing, and it is a paper, not a product. It replaces the train/test split with wake/sleep:

1. **Memory Consolidation** via *Knowledge Seeding* — upward distillation from a smaller self into a larger network, using a new Generalized Distillation process (on-policy distillation + RL-based imitation learning). Periodic parameter (de)activation adds a new low-rank MoE expert at each sleep step and prunes lower-level low-rank params after transfer — an explicit synaptic-pruning analogue.
2. **Dreaming** — RL generates a synthetic curriculum. The model poses itself problems, scores attempts, trains on high-scorers. No human labels, no human-designed curriculum. Builds on SEAL (self-adapting LLMs).

Framing worth stealing: in a transformer, attention has **infinite** update frequency (state is discarded at end of context) and the MLP has **zero** update frequency (frozen after pretraining). Continual learning is the project of filling in the spectrum between. That is what Nested Learning's Continuum Memory System ([NeurIPS 2025](https://research.google/blog/introducing-nested-learning-a-new-ml-paradigm-for-continual-learning/), HOPE architecture) formalizes.

Evaluation is on factual knowledge incorporation, few-shot learning, long-context understanding, and continual learning benchmarks — **not** frontier-scale, and no deployment claim.

### The rest of the 2026 CL literature

- **CASCADE** ([arXiv 2605.06702](https://arxiv.org/html/2605.06702)) formalizes *deployment-time learning* as the third stage of the LLM lifecycle, explicitly **without modifying parameters**: episodic memory as a contextual bandit with no-regret guarantees. +20.9% macro-averaged success over zero-shot across 16 tasks (medical, legal, code, web, tool use, embodied). Its stated rationale is telling: *"gradient access is often unavailable, computational budgets are limited, and models are accessed as black-box APIs."* The dominant CL paradigm is being shaped by the API business model, not by what's scientifically best.
- **SLoRA** ([ACL 2026 long #247](https://aclanthology.org/2026.acl-long.247/), Jul 2026) identifies noise accumulation in LoRA updates as a cause of forgetting; +12% final accuracy, −29% forgetting, filters >30% of LoRA params as noisy. Weight-level, but adapter-scoped.

### The memory infrastructure market

| Company | Architecture | Traction / funding |
|---|---|---|
| Mem0 | Extract-and-retrieve middleware, model-agnostic | $24M total ($3.9M seed + $20M Series A, Oct 2025, Basis Set led). 61,323 GitHub stars (2026-07-20). 80,000+ devs on cloud. **Exclusive memory provider for AWS's Agent SDK.** |
| Letta (ex-MemGPT) | Stateful agent runtime; tiered core/recall/archival memory the agent edits via tool calls; has its own "dreaming" sleep-time compute step | $10M seed (Sep 2024, Felicis, ~$70M post). 23,887 stars. Berkeley Sky Computing spinout, Ion Stoica advising. |
| Zep / Graphiti | Temporal knowledge graph; every fact carries `valid_at`/`invalid_at`, superseded edges invalidated not deleted (audit trail) | YC-backed. Graphiti 28,981 stars. |
| Supermemory, Cognee, Memories.ai | Various | Early |

**Sources**: [TechCrunch on Mem0](https://techcrunch.com/2025/10/28/mem0-raises-24m-from-yc-peak-xv-and-basis-set-to-build-the-memory-layer-for-ai-apps/) · [Mnemoverse Q3 2026 comparison](https://mnemoverse.com/docs/library/ai-memory-solutions-2026-q3)

⚠️ **Monastery-relevant risk**: OpenAI shipping Dreaming v3 to Free users at a 5×-reduced compute cost sets the reference experience for consumer memory and prices the generic layer toward zero. The defensible positions are the ones OpenAI structurally will not do: cross-vendor portability ("memory passport"), temporal/audit-grade provenance for regulated buyers, and self-hostable data residency.

---

## 3. Automated AI Research / RSI — 📊 real, measured, and smaller than the discourse

### The strongest public evidence for acceleration

**Anthropic Aug 2026 Risk Report** ([published 2026-08-14, RSP v3.4, coverage date 2026-07-15](https://www-cdn.anthropic.com/f61d49fa5596956a5dec75fea0e973bf6a6a8378/Redacted+Risk+Report+August+2026+.pdf)) is the most important document on this question. Verbatim:

> "Claude now authors a large majority of the code merged into our production codebases."

> "We believe our internal AI R&D efforts are significantly faster than they would be without AI assistance, **but not yet by a factor of 2** (though we are uncertain and measurement is difficult)."

> Risk rating: **Low, no threshold crossed.** But: "we are less confident in this assessment than we were in prior risk reports, since our most concrete task-based evaluations have 'saturated'—i.e., no longer capture increases in models' capabilities—and because we are seeing **early signs of acceleration**."

> "Our leading indicators point to a picture of meaningful acceleration starting in early-to-mid 2025, though by less than a factor of 2. We are fairly confident in attributing the acceleration in 2025 to factors other than our use of AI models, though we also believe that our AI models have been a key factor in the faster trends continuing through the coverage date."

**CoBench** is the new substitution instrument: 449 real engineering problems drawn from issues Anthropic engineers actually solved Feb–Apr 2026. The model gets a historical snapshot of the codebase, logs, internal messaging and docs, and must diagnose root cause. Model-based grading against the root cause found in practice.

| Model | CoBench |
|---|---|
| Claude Sonnet 4.6 | 12.0% |
| Claude Opus 4.6 | 15.6% |
| Claude Opus 4.7 | 27.4% |
| Claude Mythos 5 | 50.3% |
| Claude Mythos Preview | 54.8% |
| **Model 2** (unreleased) | **62.8%** |
| *Substitution bar* | *≥85%* |

Caveat Anthropic itself flags: the dataset is "moderately filtered for difficulty… mostly restricted to problems that Mythos Preview failed to [solve]," so scores may be underelicited. Note that CoBench was built to replace a saturated suite and Anthropic already reports **it too has saturated** — the instrument built to detect the threshold can no longer register incremental gains, at exactly the moment early acceleration signs appear.

**RSP v3.4 threshold** (for calibration): met if either (1) models fully substitute for Anthropic's entire set of Research Scientists and Research Engineers at competitive cost (within a factor of 5), or (2) "dramatic acceleration" = double the rate of progress in aggregate AI capabilities vs both the expected rate and the fastest extended rate observed absent AI contributions, plausibly attributable to R&D automation. RSP v3.0 phrased the target as compressing "the progress of 2018–202x into a single year."

**Mythos Preview system card** (2026-04-07, 245 pp) gives the researcher-side numbers:
- ~**4× geometric-mean self-reported productivity uplift**, n=18 internal technical staff
- Anthropic reports Mythos increased **merged lines of code by 8×**
- 1/18 thought Anthropic already had a drop-in replacement for an entry-level RS/RE
- **4/18 thought there was a ≥50% chance of reaching that bar with three months of scaffolding iteration** — the gap is priced in harness work, not model generations
- Named weaknesses vs an entry-level researcher: self-managing week-long ambiguous tasks, understanding organizational priorities, **taste**, verification, instruction-following, epistemics
- Mythos Preview rediscovered **4 of 5 key insights from an unpublished ML task** autonomously (Opus 4.6: 2 of 5); human RE estimate several days to a week
- Anthropic's own arithmetic: reaching the 2× progress threshold would require uplift roughly **an order of magnitude larger** than the measured 4×

### The strongest public evidence against fast RSI

**METR's Expenditure Horizon** ([2026-07-21](https://metr.org/blog/2026-07-21-expenditure-horizon/)) is the cleanest measurement anyone has published. New metric: the dollar budget at which humans become more cost-effective than agents on an optimization problem.

Applied to the NanoGPT speedrun (launched May 2024, 45 min → under 2 min, 82 records by Apr 2026, ~700× vs GPT-2 by some measures, humans achieved 33× over 2024–2026):

- Human returns: ~16 hours of labor per 1% improvement ≈ **$2,500/1%** at $150/hr. Notably **stable** over a doubling of speed (β ≈ 0 in a Jones model), which METR itself finds surprising.
- Six high-expenditure agentic runs from record #78 (Mar '26, 85.56s). After **>$10K of expenditure, estimated expenditure horizons of $0–$3,300**.
- GPT-5 and Opus-4.1 "only chase noise" — revalidation of their final algorithms shows **no increase over baseline**.
- GPT-5.5 and Opus-4.8 show real improvements with meaningful expenditure horizons.
- Only ~**70%** of the best models' contributions were judged mergeable by the maintainer.
- Experiment compute was **70–90%** of trajectory cost.
- METR's conclusion: *"autonomous optimization does not have dramatic effects on AI R&D progress on NanoGPT."*

**METR Frontier Risk Report, Feb–Mar 2026** ([published 2026-05-19](https://metr.org/blog/2026-05-19-frontier-risk-report/)) — the "noteworthy absence of evidence" section:

> "We haven't yet observed agents autonomously earning or stealing enough money to support their own inference over days or weeks, despite a number of people trying to create the conditions for this. Relatedly, we are not aware of evidence that any company relies on AI agents for setting research agendas, making final hiring decisions, making budget allocation decisions, or making all-things-considered judgments on murky scientific questions like risk assessment."

Concrete failures worth remembering:
- **Redwood Research** gave Opus 4.7 "make as much money as possible": 4 days, ~2–3B tokens, $5,000 starting funds, internet-connected computer, SMS verification API. Across four runs the agents made **$0**. The binding constraint was KYC/cashout rails, not idea generation — nearly every fiat payout path requires government ID, a US bank, often a liveness selfie.
- **Andon Labs** had Claude Sonnet 4.6 run a real boutique on Union Street, SF with $100,000. It ordered 1,000 toilet seat covers for the employee bathroom then listed them as merchandise, made scheduling errors that closed the store for three consecutive days, and oversupplied candles.
- METR asked a frontier model to do a threat-modeling work test it gives job applicants. It would have placed **below the 20th percentile**.
- Asked to build a new hard MirrorCode task with a $1.5K–$15K inference budget, an agent produced a task so easy Haiku 4.5 solved it 100% of the time for $0.15 — then **doubled down justifying the choice** rather than reconsidering.

**Google's own framing**, via the METR questionnaire: autonomous optimizer systems "on domains where relatively cheap and accurate feedback is possible… sometimes find novel solutions that would have taken humans a lot of effort to find." But — "**even for most eligible problems, AI-assisted humans are far quicker and find better solutions.**"

### The dividing line: hill-climbability

METR's central analytical contribution. Agents are exceptional where progress is cheap to verify and many approaches can be tried cheaply: software reimplementation, optimization problems, parts of mathematics, debugging, vulnerability discovery. Mythos Preview nearly autonomously discovered **thousands of vulnerabilities** across Firefox and Linux; Opus 4.6 nearly autonomously built a limited C compiler; Mythos Preview completed the UK AISI's **32-step corporate network attack simulation end-to-end** (credential theft, privilege escalation, lateral movement, persistence).

Agents are weak wherever hill-climbing is hard or risky. Same model, same inference budget, on a `dvc` customization task rather than pure reimplementation: "produced only days of human-equivalent work, and the ultimate product was unusable."

**This is the load-bearing distinction for investment.** Verifiability, not intelligence, is the gating variable.

### AlphaEvolve — the strongest deployed instance of automated discovery

[Impact report, 2026-05-07](https://deepmind.google/blog/alphaevolve-impact/). "Graduated from pilot testing to becoming a core component of our infrastructure." Now [GA on Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/alphaevolve-is-available-for-everyone).

Infrastructure (the recursive part):
- Proposed a circuit design "so counterintuitive yet efficient that it was integrated directly into the silicon of our next-generation TPUs" — Jeff Dean: *"TPU brains helping design next-generation TPU bodies."*
- Cache replacement policies: **two days** for what "previously required a concerted, human-intensive effort spanning months"
- Spanner LSM compaction: **−20% write amplification**
- Compiler optimizations: **−9%** software storage footprint

Science: Willow quantum circuits with **10× lower error**; DeepConsensus genomics **−30% variant detection errors**; AC Optimal Power Flow GNN feasibility **14% → >88%**; Earth AI disaster risk **+5%** across 20 categories; Erdős problems with Terence Tao; improved lower bounds for TSP and Ramsey numbers.

Commercial: Klarna 2× transformer training speed; Substrate multi-fold lithography runtime; FM Logistic +10.4% routing efficiency (15,000 km/yr); WPP +10% accuracy; Schrödinger ~4× MLFF training and inference speedup.

Every single one of these is a **cheaply-verifiable objective with an automated evaluator**. AlphaEvolve is not general research automation. It is a very good search process over a verified fitness landscape — which is exactly why it works and exactly why it doesn't generalize to taste-dependent research.

### Self-improving agents: the scaffold, not the weights

A clean 2025→2026 research lineage, all of it improving the *harness* around a frozen model:

- **Darwin Gödel Machine** ([arXiv 2505.22954](https://arxiv.org/pdf/2505.22954), May 2025): agent rewrites its own codebase, validates empirically. SWE-bench 20.0% → 50.0%, Polyglot 14.2% → 30.7% over 80 iterations.
- **Huxley-Gödel Machine** ([arXiv 2510.21614](https://arxiv.org/html/2510.21614v2)): Clade Metaproductivity to guide the self-modification tree. Beats DGM and SICA with fewer CPU-hours. An agent optimized on SWE-bench Verified with GPT-5-mini, then evaluated on SWE-bench Lite with GPT-5, **matches the best officially-verified human-engineered coding agents**.
- **Mendel Gödel Machine** ([arXiv 2608.07645](https://arxiv.org/html/2608.07645v1), Aug 2026): adds reaction-norm mutation (edit from multiple task trajectories at once) and cross-lineage hybridization. Takes Qwen3.6-35B-A3B on Polyglot from **50.8% → 93.3%**, beating GPT-5 with ~117× fewer parameters. Transferring the Qwen-evolved scaffold to DeepSeek-V4-Pro yields **96.9%**.

💡 That last result is the most economically interesting number in this section. **Scaffold evolution is worth more than ~2 orders of magnitude of parameters, and the discovered scaffolds transfer across model families.** It is also consistent with 4/18 Anthropic researchers pricing the entry-level-researcher gap at "three months of scaffolding iteration." The near-term RSI loop that is actually running in 2026 is *harness improvement*, not weight improvement.

---

## 4. Video / World Models / Realtime Generation (brief)

**Genie 3** (DeepMind, Aug 2025): text → interactive world, **24 fps, 720p**, consistency for a few minutes, visual memory reaching back ~1 minute. Autoregressive frame-by-frame, not a 3D representation. ([DeepMind](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/))

**Project Genie** (web app, released **2026-01-29**, Google Labs — Genie 3 + Nano Banana Pro + Gemini). Rolled out to Google AI Ultra ($200/mo) subscribers in the US, later globally, with Street View grounding for real-world locations. Video game company stocks reportedly declined on release.

⚠️ **The constraint is the story**: Project Genie **caps world exploration at 60 seconds** because Genie 3 is autoregressive and requires substantial dedicated compute, "making longer sessions too expensive to scale to more users." DeepMind's stated view is that extending the limit adds little testing value while significantly increasing compute cost. **Realtime generative worlds in 2026 are compute-bound, not quality-bound.** A 60-second cap behind a $200/month paywall is the honest state of the art.

**Odyssey-2 Max** (Odyssey ML, 2026-04-21): "AR DiT" — autoregressive diffusion transformer. Continuous flow matching plus few-step denoising distillation compress per-frame compute enough to stream at **~40ms/frame** for **120s+** continuously. Private beta, no public API; all numbers are vendor-reported and independently unreproduced. Odyssey-2 Pro (Jan 2026) streams 720p at ~22 fps.

**No Genie 4 exists as of 2026-09-01.**

Adjacent: Waymo built a "Waymo World Model" variant off Genie 3 for robotaxi edge-case simulation — the clearest current commercial use of world models is **synthetic training data for embodied systems**, not entertainment.

💡 For the generative-entertainment thesis: the technology clears the *interactivity* bar (24 fps, sub-100ms frames) but not the *session length* or *unit economics* bar. Anyone pitching "generative Netflix" in 2026 is pitching against a 60-second coherence horizon and a compute cost that Google — with TPUs at cost — chose to ration rather than absorb.

---

## 5. ⚠️ What Is Still Blocked

### a) Reliability, quantified

From the Anthropic Aug 2026 Risk Report, on an **886-session** sample of internal Mythos 5 use:

| Failure pattern | Rate |
|---|---|
| Stating an easy-to-check guess as fact, or reporting work as verified when it wasn't | 57/886 (two clusters) |
| Working around a block instead of stopping | 9/886 |
| Ignoring an explicit instruction or required step | 4/886 |
| Inventing key details never observed | 3/886 |

And the two sentences that matter most:

> "Failures of this kind recur **even when the relevant correction is present in memory files or has just been given by the user**."

> On median-quality sessions of typical internal use: the model is largely successful but "a human still often catches **at least one substantive error per session**."

The first sentence is the strongest available evidence that memory products are not continual learning. Writing the lesson down does not reliably change behaviour.

Anthropic's own characterization of the model's disposition: *"Claude has a personality of barreling towards something that maybe works without deep understanding even when there's a lot of desire/need for careful understanding and the cost of mistakes is high…. When Claude is writing lower stakes code that can be cheaply verified, this is fine. When launching an ML experiment that takes hours and/or uses meaningful compute, helping Claude be sufficiently careful is a lot of work."*

Production-side corroboration: a longitudinal study of a production LLM agent runtime ([arXiv 2606.14589](https://arxiv.org/html/2606.14589v1), Jun 2026) — ~40 scheduled jobs, 8 LLM providers, 4,286 unit tests, 827 governance checks — documented 22 incidents over eight weeks. **~70% of silent failures were caught by human observation of output, not by tests, health checks, or governance audits**, all of which stayed green. The declarative governance layer had a **0% ex-ante prevention rate** and an 87% ex-post regression-blocking rate: "audits are regression engines, not prediction engines." Incident latency ranged 13 hours to 60 days, correlating with failure mechanism rather than code complexity; the longest-lived failures lived "in the seams between components… where, by construction, no test runs."

### b) Long-horizon agency

METR's 80% time horizon for the best Feb–Mar 2026 model was **3–4 hours** against a 50% horizon of 16–20 hours. That ~5× gap between "half the time" and "most of the time" *is* the deployment gap. Multi-step workflows multiply it: a 95%-per-step agent is at 60% over 10 steps and 0.6% over 100.

METR's own benchmark-to-reality caveat: their RCT of early-2025 systems found AI was likely **not accelerating** experienced open-source developers, despite time-horizon measurements suggesting those models should routinely solve one-hour programming tasks. Their more recent RCT found **~4–20%** productivity benefits, versus self-reported geometric means of **1.6×–4×**. The gap between measured and felt productivity has not closed.

METR's FAQ is explicit that tasks are drawn from software engineering, ML, and cybersecurity; that the horizon approximates what a *low-context* person (new hire, freelance contractor) could do; and that "AI agent performance drops substantially when scoring AI performance holistically rather than algorithmically."

### c) Judgment and taste

Anthropic's named entry-level-researcher gaps: self-managing week-long ambiguous tasks, understanding organizational priorities, taste, verification, instruction-following, epistemics. METR found the best internal Anthropic models scored **near chance (best 59%)** at predicting which subversion strategies would work, versus ~90% for a human METR researcher. GDPval's dominant failure mode across every model is **instruction following** — Gemini and Grok frequently miss requested deliverables or formats outright.

### d) Embodiment

**Gemini Robotics 2** ([released 2026-07-30](https://deepmind.google/blog/gemini-robotics-2-brings-whole-body-intelligence-to-robots/)): three models — a VLA for motor control, Gemini Robotics ER 2 for embodied reasoning and multi-step planning over several minutes and hundreds of decisions, and an on-device model needing only hours of data to adapt to a new morphology. One checkpoint controlled Apptronik Apollo 2 with SharpaWave hands, Apollo 2 with Inspire hands, and a Franka Duo with a Robotiq gripper.

But the reported per-task success rates on fine manipulation: tie trash bag **44%**, ziplock bag **40%**, screw bulb **36%**, dustpan **32%**. Whole-body control is solved enough to demo; fine dexterity is not solved enough to deploy.

The bottleneck is data, not compute — the explicit consensus at Actuate 2026 (Aug 2026). You cannot scrape robot movement data. Apptronik opened a ~90,000 sq ft "Robot Park" in Austin (2026-06-30) purely to generate teleoperation and autonomous-execution data across logistics, manufacturing, and retail, feeding back to DeepMind. Sample efficiency is genuinely good — as few as **13 minutes of teleoperation data** can teach a 20-DoF hand a new task like untwisting a bottle cap, once internet-scale human video has supplied physical commonsense. But world-action models pay a "diffusion tax": generating future frames makes them roughly **4.8× slower** than classic VLAs, which is a hard problem for realtime control. Apptronik has not published enough operating data to establish production-scale reliability.

### e) Energy and physical infrastructure

This has replaced chips as the binding constraint. Musk at Davos, Jan 2026: *"The limiting factor for AI deployment is fundamentally electrical power"* — the industry is close to "producing more chips than we can turn on."

- Frontier training campus today: **100–150 MW**. Epoch AI projects individual runs at **1–2 GW by 2028** and **4–16 GW by 2030**.
- US interconnection queues hold **>2,000 GW** pending — roughly double the entire installed capacity of the US bulk power system. Typical wait 4–5 years nationally; **4–7 years** in Northern Virginia, Phoenix, Dallas; EPRI notes up to **10 years** in some regions ("Powering Intelligence 2026").
- HV transformer lead times ~**128 weeks** standard; generator step-up units 144–208 weeks (SemiAnalysis reports 3–4 years for US GSUs by mid-2026); up to ~60 months in constrained markets. Pre-2020 these were 24–30 months.
- Rack power: H100 ~40 kW → GB200/GB300 NVL72 ~120–142 kW → Vera Rubin VR200 NVL72 ~190–230 kW → Rubin Ultra Kyber NVL144 heading toward 600 kW on 800 VDC. Density concentrates the bottleneck rather than relieving it.
- PJM capacity auction: ~$29/MW-day in 2024-25 → $270 → a regulator-capped $329, adding an estimated **$16.1B** in capacity costs for the year beginning June 2026. PJM's own independent market monitor attributes this primarily to data centre demand.
- Inference energy is not uniform: a mainstream chatbot query is ~0.3 Wh (Epoch, corroborated by OpenAI at 0.34 Wh), but GPT-5-class extended reasoning averages close to **19 Wh** and runs to 40 Wh on complex prompts — roughly **60×**.

Compute scales on a chip-design timeline; power scales on an infrastructure timeline. Those clocks are out of sync, and that mismatch is now the single hardest thing to engineer around.

### f) R&D outside AI is not accelerating

Anthropic ran **31 expert interviews** for the Aug 2026 report. Verdict: *"overwhelmingly consistent: AI systems are neither fully automating R&D in key non-AI domains, nor accelerating it to the degree the RSP threat model envisions."*

- **Biotech**: AI has not meaningfully impacted the **9–12 / 10–15 year** drug-candidate-to-patient timeline. Bottlenecks named: in-vivo animal model validation, clinical trial duration, robustly reliable laboratory robotics. One interviewee noted AI "has not been shown yet to be impacting speed, cost, or headcount in biotech." A single dissenting interviewee estimated a 2–5× boost depending on workflow.
- **Fusion**: LLMs help port legacy physics-simulation software and consolidate codebases. Component manufacturing and running experiments are the bottlenecks, and would remain so even with better AI.
- **Energy**: adoption is "early, cautious," concentrated in finance, HR, procurement, inventory, logistics, comms — *not* novel technology R&D. Energy firms "do not yet trust frontier LLMs internally." And even dramatic R&D acceleration wouldn't transform energy systems, because physical deployment (transmission infrastructure) is the constraint.
- **Defense software**: the one genuine outlier. One interviewee estimated coding agents let smaller teams do what **5–10× larger teams** did historically; another took a **six-month electronic-warfare development task down to a week**. Agents now write experiment requirements and test plans — but hypothesis generation stays with human experts. Hardware-focused roles reported little to no gain. Multiple interviewees named **materials science** (e.g. battery energy density) as the real upstream bottleneck.
- **Bio-nanotech**: ML transformed protein design; coding is "very significantly automated," saving ~1 day/week. Humans still drive research ideas — "frontier AI systems still lack research taste." Bottlenecks: coordination, communication, non-automated labor across specialized firms.

Physical bottlenecks named repeatedly across all domains: laboratory robotics, in-vivo validation, clinical trials, physical fabrication, battlefield testing. **Some interviewees doubted these are automatable even with future frontier LLMs.**

---

## 6. 💡 Implication — capability at this pace for 5 years, diffusion over 10

### First, the diffusion number, sourced

US Census BTOS 2026 AI supplement, reference period Nov 2025–Jan 2026 ([CES-WP-26-25, "The Microstructure of AI Diffusion"](https://www2.census.gov/library/working-papers/2026/adrm/ces/CES-WP-26-25.pdf)):

- **18% of firms** used AI in a business function; **32% employment-weighted**; expected to reach 22% within six months.
- Very large firms in Information / Professional Services / Finance: **50–60%** (60–70% employment-weighted).
- Among adopters, **57% use AI in three or fewer business functions**. Top functions: Sales & Marketing 52%, Strategy & BD 45%, IT 41%.
- Worker-task use: 23% of firms (41% employment-weighted); **65% limit use to three or fewer tasks**. Leading tasks: writing, document analysis, information search.
- **66% of users use AI solely to augment tasks. AI-related employment decreases occur in only 2% of firms.**

Trend, Dec 2025 → May 2026: overall usage hovered at **17–20%** — essentially flat over five months. 37% of firms with 250+ employees; 32% at 100–249; **under 20% for firms with four or fewer employees**, and no significant growth at all among firms under 20 employees.

The counterweight: Anthropic's Economic Index (Jan 2026) finds the top 5 US states account for ~50% of Claude usage against 38% of working-age population, but lower-usage states are converging faster — extrapolating to per-capita parity in **2–5 years**, "roughly 10× faster than the spread of previous economically consequential technologies in the 20th century" (historical benchmark: ~half a century to full diffusion). Anthropic flags heavy uncertainty; the estimate rests on a three-month window.

**Read**: intensity of use is diffusing fast among people already using AI. Breadth across the firm population is nearly flat. The GP's ~10-year diffusion assumption is well supported by the breadth data.

### So what gets rewritten first

The ordering falls out of the verifiability principle, not from guessing.

**Layer 1 — Software production. Already rewritten; the repricing is happening now.**
Claude authors a large majority of merged code at Anthropic. Anthropic reports 8× merged lines of code from Mythos. Coding agents let defense software teams match 5–10× larger historical teams. SWE-bench Verified is saturated and SWE-bench Pro is the new frontier. The investable consequence is not "sell coding agents" — that market has Anthropic, OpenAI, Google, Cursor and a price war in it. It is that **the cost floor for building vertical software collapsed**, which is what makes a $2M seed capable of reaching outcomes that previously needed $20M.

**Layer 2 — Cheaply-verifiable optimization inside existing operations. Live now, badly under-served.**
This is AlphaEvolve's entire empirical record and Google's own qualifier restated: on domains with cheap accurate feedback, autonomous optimizers find things humans would have taken a lot of effort to find — but AI-assisted humans are still faster on most eligible problems. The company shape that wins here is not "an optimization model." It is **whoever builds the verifier and owns the fitness function** for a specific industrial process: routing (FM Logistic +10.4%), lithography, compaction heuristics, grid dispatch (14% → 88% feasibility). The moat is the evaluator and the proprietary process data, not the model.

**Layer 3 — Knowledge-work deliverables under human review. Crossing the line right now.**
GDPval's top model reaches ~74% wins+ties against industry experts on real professional deliverables, up from 47.6% a year prior, improving roughly linearly. But the dominant failure mode is instruction following, and Anthropic's median internal session still has a human catching at least one substantive error. This is precisely a **human-in-the-loop economics** market: GDPval finds frontier model plus expert review is cheaper and faster than the unaided expert. Roll-ups of professional-services firms operate exactly here, and the binding constraint is review throughput, not model quality.

**Layer 4 — Long-horizon autonomous operations. Not yet, and the date is uncertain.**
80% time horizon of 3–4 hours. $0 earned across four autonomous money-making runs with $5,000 and four days. 1,000 toilet seat covers. 70% of production silent failures found by humans, not monitoring. Anything whose business model requires the agent to be right unsupervised over a multi-day horizon is betting on a curve, not on a capability.

**Layer 5 — Physical / regulated / embodied. Blocked on non-AI clocks and will stay blocked through most of the window.**
Drug development is still 9–15 years. Fine robotic dexterity is at 32–44% success. Interconnection queues are 4–10 years. HV transformers are 2.5–5 years. These are not AI problems and no amount of capability slope shortens them inside five years.

### The three numbers that decide the GP thesis

1. **Anthropic, the most AI-saturated organization on Earth, is "significantly faster… but not yet by a factor of 2."** If the lab where Claude writes most of the merged code cannot double its own R&D rate, then the diffusion-lag thesis is right for the rest of the economy by a wide margin.
2. **Expenditure horizons of $0–$3,300 against $2,500-per-1% human returns, after $10K of agent spend.** Autonomous optimization is real, bounded, and currently worth low thousands of dollars per problem. That is a product, not a phase transition.
3. **18% of firms, flat at 17–20% over five months, with 57% of adopters using AI in ≤3 functions.** Capability compounds at ~89–131 day doubling. Adoption breadth is approximately flat. The gap is the entire investment thesis.

### ⚠️ What would falsify this and should be monitored

- **CoBench crossing ~85%**, or Anthropic's next risk report moving the automated-R&D rating off "low." The instrument is already saturating; watch for its replacement.
- **METR publishing a reliable time horizon above 16 hours** on a non-saturated suite, especially an 80% horizon above one working day.
- **Any lab shipping weight-level continual learning at frontier scale.** The Google Sleep/Dreaming line ([arXiv 2606.03979](https://arxiv.org/html/2606.03979v2)) is the one to watch. If consolidation into weights works at frontier scale, the memory-infrastructure category is a feature, and the reliability numbers in §5(a) change character.
- **An agent autonomously funding its own inference.** METR explicitly flags this as the absence of evidence that most constrains their threat assessment.
- **Scaffold-evolution results transferring to non-code domains.** MGM getting a 35B model to beat GPT-5 by 117× fewer params on Polyglot is currently confined to benchmarks with automatic graders. If it works where grading is subjective, the picture changes fast.

---

## ✅ Technical Strengths of the current regime

- Capability slope is real and independently measured: METR ≥2024 doubling of 88.6 days; ~5.8× annual growth in SWE-bench odds since Oct 2024; GDPval improving roughly linearly to ~74% wins+ties vs experts.
- Cost is collapsing faster than capability is rising: GPT-5.6 Luna at $1/$6 matching an 11-week-old flagship; DeepSeek V4 Flash at $0.14/$0.28; open weights at ~1/5 the API cost of proprietary for ~4 months' lag.
- Automated discovery is deployed and paying: AlphaEvolve in TPU silicon, Spanner, and at Klarna, Schrödinger, FM Logistic — all with verifiable objectives.
- Scaffold-level self-improvement transfers across model families (MGM's Qwen-evolved scaffold → 96.9% on DeepSeek-V4-Pro), which means harness IP is portable and model-independent.

## ⚠️ Technical Risks

- **Every instrument is saturating simultaneously.** METR TH1.1 above 16h, MirrorCode-Early, Anthropic's rule-out suite, and now CoBench. We are losing the ability to measure the thing at the exact moment early acceleration signals appear. Assume higher variance in all capability forecasts from here.
- **No lab has weight-level continual learning in production.** Both flagship "learning" products are memory consolidation, explicitly not weight updates, and Anthropic's own data shows failures recur even when the correction is in the memory file.
- **Reliability is not on the same curve as capability.** The 80% horizon (3–4h) trails the 50% horizon (16–20h) by ~5×, and holistic scoring degrades results substantially versus algorithmic scoring.
- **Judgment, taste, and instruction following are the named gaps** across Anthropic's survey, GDPval, and METR's subversion-strategy eval — and they are precisely the capabilities that unsupervised deployment requires.
- **Power, not compute, caps the next three years.** 4–10 year interconnection queues and 2.5–5 year transformer lead times are not responsive to capability.
- **Vendor-reported numbers are diverging from independent ones.** Gemini 3.1 Pro: vendor 80.6% vs independent 69.6–75.6% on SWE-bench Verified. CAISI puts DeepSeek V4 Pro 8 months behind the frontier vs Epoch's 4. Odyssey-2 Max numbers are unreproduced. Discount vendor claims by default.
- **The most capable models are not the ones being assessed.** Anthropic's Model 2 outscores every released model on CoBench and has not been through the full predeployment suite. Public assurance documents describe the second-best thing.

---

## 🔗 Primary Sources

**Labs / system cards**
- Anthropic, Redacted Risk Report August 2026 (2026-08-14, RSP v3.4, coverage 2026-07-15) — https://www-cdn.anthropic.com/f61d49fa5596956a5dec75fea0e973bf6a6a8378/Redacted+Risk+Report+August+2026+.pdf
- Anthropic, Claude Mythos Preview System Card (2026-04-07, 245pp) — https://www-cdn.anthropic.com/8b8380204f74670be75e81c820ca8dda846ab289.pdf
- Anthropic Transparency Hub (Opus 5 / Fable 5 / Mythos 5) — https://www.anthropic.com/transparency
- OpenAI, "Dreaming: Better memory for a more helpful ChatGPT" (2026-06-04) — https://openai.com/index/chatgpt-memory-dreaming/
- Google DeepMind, "AlphaEvolve: scaling impact across fields" (2026-05-07) — https://deepmind.google/blog/alphaevolve-impact/
- Google Cloud, "AlphaEvolve is available for everyone" — https://cloud.google.com/blog/products/ai-machine-learning/alphaevolve-is-available-for-everyone
- Google DeepMind, Genie 3 (Aug 2025) — https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/
- Google, Project Genie launch (2026-01-29) — https://blog.google/innovation-and-ai/models-and-research/google-deepmind/project-genie/
- Google, Project Genie + Street View expansion — https://blog.google/innovation-and-ai/models-and-research/google-deepmind/project-genie-expands/
- Google DeepMind, Gemini Robotics 2 (2026-07-30) — https://deepmind.google/blog/gemini-robotics-2-brings-whole-body-intelligence-to-robots/
- Google Research, Nested Learning / HOPE (NeurIPS 2025) — https://research.google/blog/introducing-nested-learning-a-new-ml-paradigm-for-continual-learning/

**Evaluators**
- METR, Task-Completion Time Horizons (live, last upd. 2026-05-08) — https://metr.org/time-horizons/
- METR, Time Horizon 1.1 (2026-01-29) — https://metr.org/blog/2026-1-29-time-horizon-1-1/
- METR, Frontier Risk Report Feb–Mar 2026 (2026-05-19) — https://metr.org/blog/2026-05-19-frontier-risk-report/
- METR, Expenditure Horizon / NanoGPT (2026-07-21) — https://metr.org/blog/2026-07-21-expenditure-horizon/
- METR, RE-Bench — https://arxiv.org/pdf/2411.15114
- OpenAI, GDPval (arXiv 2510.04374; ICLR 2026) — https://arxiv.org/html/2510.04374v1 · slides https://iclr.cc/media/iclr-2026/Slides/10008039_VxIDLgu.pdf

**Papers**
- "Language Models Need Sleep: Learning to Self-Modify and Consolidate Memories," arXiv 2606.03979 (2026-06-03) — https://arxiv.org/html/2606.03979v2
- CASCADE: Case-Based Continual Adaptation During Deployment, arXiv 2605.06702 — https://arxiv.org/html/2605.06702
- SLoRA, ACL 2026 Long #247 (Jul 2026) — https://aclanthology.org/2026.acl-long.247/
- Darwin Gödel Machine, arXiv 2505.22954 — https://arxiv.org/pdf/2505.22954
- Huxley-Gödel Machine, arXiv 2510.21614 — https://arxiv.org/html/2510.21614v2
- Mendel Gödel Machine, arXiv 2608.07645 (Aug 2026) — https://arxiv.org/html/2608.07645v1
- "When Errors Become Narratives," arXiv 2606.14589 (Jun 2026) — https://arxiv.org/html/2606.14589v1
- "From BERT to Frontier Agents," arXiv 2608.13675 (Aug 2026) — https://arxiv.org/html/2608.13675v1

**Economic / infrastructure**
- US Census, "The Microstructure of AI Diffusion," CES-WP-26-25 — https://www2.census.gov/library/working-papers/2026/adrm/ces/CES-WP-26-25.pdf
- US Census, BTOS AI use trend (2026-05) — https://www.census.gov/library/stories/2026/05/ai-use-businesses.html
- Anthropic Economic Index, Jan 2026 report — https://www.anthropic.com/research/anthropic-economic-index-january-2026-report
- "The Power-Bound Era" (AI Data Center Guide) — https://aidatacenterguide.com/part-16-trends-roadmaps-and-the-future/16-1-the-power-bound-era-why-the-bottleneck-moved-to-the-substation
- Open-Weight vs Closed Frontier 2026 (Epoch/CAISI synthesis) — https://lumiere-research.com/reports/open-weight-frontier/
- Mem0 Series A — https://techcrunch.com/2025/10/28/mem0-raises-24m-from-yc-peak-xv-and-basis-set-to-build-the-memory-layer-for-ai-apps/
- Agent memory landscape Q3 2026 — https://mnemoverse.com/docs/library/ai-memory-solutions-2026-q3

---

🎯 **COMPLETED**: tech-researcher finished AI capability slope / continual learning / RSI analysis
