# Macro: Recursive Self-Improvement & Continual Learning — what is real as of 2026-09-01

**Purpose**: test the GP thesis clause *"Recursive self-improvement / continual learning, if they land, change the slope. Map what is actually happening in 2026 vs sci-fi."*
**Companion file**: `raw/agent-tech-researcher-takeoff.md` (full detail, all sources)
**Coverage**: recency-weighted to Jul–Aug 2026

---

## The one-paragraph answer

Neither has landed, both are further along than the sceptical position, and the labs' own instruments say so more clearly than any outside commentary. **Continual learning did not ship: both OpenAI and Anthropic shipped memory consolidation and explicitly said it is not weight updates.** **RSI is running, but at the scaffold layer, not the weight layer, and it is worth low thousands of dollars per problem when measured honestly.** The most AI-saturated organization on the planet — where Claude authors a large majority of merged production code — says its own R&D is "significantly faster… but not yet by a factor of 2." The capability slope is steep (~89–131 day doubling on METR's suite) and the diffusion curve is nearly flat (18% of US firms, unchanged at 17–20% over five months). The GP thesis holds. The refinement is that the gap is not uniform: it is wide wherever verification is expensive and narrow wherever it is cheap.

---

## 1. Continual learning: the answer is no, and it is a clean no

### Both labs shipped the same thing, one month apart, and named it the same thing

| | Anthropic "Dreaming" | OpenAI "Dreaming v3" |
|---|---|---|
| Announced | 2026-05-06, Code with Claude | 2026-06-04 |
| Availability | Research preview, request form, Opus 4.7 + Sonnet 4.6, **not** in consumer app | Plus/Pro US → Free/Go, global rollout |
| Mechanism | Reads ≤100 past session transcripts + full memory store during idle gaps → reorganized plain-text memory + playbooks | Background synthesis between sessions → structured memory state next session reads |
| Weight updates | **None.** Alex Albert: *"We're not changing the model itself through dreaming — it's not doing updates to the weights or anything like that."* | **None.** |
| Measured gain | Harvey: 6× task completion | Factual recall 41.5% (2024) → 67.9% (2025) → **82.8%** (Dreaming v3); ~5× cheaper to serve |

That two competing labs converged on identical architecture, identical naming, and identical framing within a month tells you this is the tractable version of the problem at frontier scale — not a coincidence and not marketing.

### The killer datum against calling it learning

From Anthropic's Aug 2026 Risk Report, on 886 internal Mythos 5 sessions:

> "Failures of this kind recur **even when the relevant correction is present in memory files or has just been given by the user**."

Writing the lesson down does not reliably change behaviour. That single sentence is the sharpest available evidence that memory ≠ learning. The accompanying failure taxonomy: stating an easy-to-check guess as fact or reporting unverified work as verified (57/886), working around a block instead of stopping (9/886), ignoring an explicit instruction (4/886), inventing details never observed (3/886). On median-quality internal sessions, "a human still often catches at least one substantive error per session."

The most honest framing in the coverage of Claude Dreaming: *"a memory maintenance system, not a learning system. It reorganizes what the agent already knows. It does not give the agent the ability to figure out things it could not figure out before."*

### What is actually in the research pipeline

**Google Research, "Language Models Need Sleep"** ([arXiv 2606.03979](https://arxiv.org/html/2606.03979v2), 2026-06-03) is the one to watch. It replaces the train/test split with wake/sleep and does touch weights:

- **Knowledge Seeding**: upward distillation from a smaller self into a larger network. Periodic parameter (de)activation adds a new low-rank MoE expert each sleep step, then prunes lower-level experts after transfer — a synaptic-pruning analogue.
- **Dreaming**: RL generates its own curriculum. Model poses itself problems, scores attempts, trains on high-scorers. No human labels, no human curriculum design. Builds on SEAL.

The useful conceptual frame from this line of work (and its parent, Nested Learning / HOPE, NeurIPS 2025): in a transformer, **attention has infinite update frequency** (discarded at end of context) and the **MLP has zero** (frozen after pretraining). Continual learning is the project of populating the spectrum in between. Evaluation is on knowledge incorporation, few-shot, long-context, and CL benchmarks — not frontier scale, no deployment claim.

Adjacent 2026 work is mostly *avoiding* weights on purpose. **CASCADE** ([arXiv 2605.06702](https://arxiv.org/html/2605.06702)) formalizes deployment-time learning as the third lifecycle stage explicitly without touching parameters — episodic memory as a contextual bandit with no-regret guarantees, +20.9% macro success over zero-shot across 16 tasks. Its stated rationale is commercial, not scientific: *"gradient access is often unavailable, computational budgets are limited, and models are accessed as black-box APIs."* **The API business model is currently shaping the research agenda.** **SLoRA** (ACL 2026) works at adapter level, identifying LoRA noise accumulation as a forgetting cause (+12% accuracy, −29% forgetting).

### Investment read on the memory layer

Real category with real traction — Mem0 at $24M raised, 61k GitHub stars, 80k developers, exclusive memory provider for AWS's Agent SDK; Letta at $10M seed from the MemGPT authors out of Berkeley Sky Computing; Zep/Graphiti with temporal validity windows and audit trails.

⚠️ But OpenAI just shipped background memory synthesis to *Free* users after a 5× compute reduction. The generic layer is being priced toward zero and the reference UX is being set by the most widely used AI product. The defensible positions are the ones a frontier lab structurally will not build: **cross-vendor portability** (Mem0's "memory passport"), **temporal/audit-grade provenance** for regulated buyers (Zep's invalidate-don't-delete edges), and **self-hostable data residency**. A memory product whose only claim is "your agent remembers things" is a feature with a 12-month clock on it.

---

## 2. RSI: running at the scaffold layer, bounded when measured

### What the labs measure about themselves

**Anthropic Aug 2026 Risk Report** (2026-08-14, RSP v3.4, coverage 2026-07-15) — the most consequential primary source on this question:

- "Claude now authors a **large majority of the code merged into our production codebases**."
- "Our internal AI R&D efforts are **significantly faster** than they would be without AI assistance, **but not yet by a factor of 2**."
- Rating: **Low, no threshold crossed** — with the caveat that "we are less confident in this assessment than we were in prior risk reports, since our most concrete task-based evaluations have 'saturated'… and because we are **seeing early signs of acceleration**."
- "Meaningful acceleration starting in early-to-mid 2025, though by less than a factor of 2," and Anthropic is "fairly confident in attributing the acceleration in 2025 to factors other than our use of AI models."

**CoBench** — the replacement instrument. 449 real engineering problems from Anthropic's own infrastructure, issues its engineers solved Feb–Apr 2026, model given a historical snapshot and asked to diagnose root cause. Substitution bar **≥85%**:

```
Sonnet 4.6        12.0%
Opus 4.6          15.6%
Opus 4.7          27.4%
Mythos 5          50.3%
Mythos Preview    54.8%
Model 2 (unrel.)  62.8%   ← best; not fully predeployment-assessed, no release plans
────────────────────────
Substitution bar  85%
```

Anthropic already reports **CoBench has saturated too**. The instrument built to detect the threshold cannot register incremental gains, at exactly the moment early acceleration appears. Note also that the highest-scoring model is one the public assurance documents do not describe.

**Researcher-side numbers** (Mythos Preview system card, 2026-04-07): ~**4× geometric-mean self-reported uplift** (n=18); **8× increase in merged lines of code**; 1/18 believe a drop-in entry-level RS/RE replacement exists; **4/18 put ≥50% odds on reaching that bar with three months of scaffolding iteration**. Named gaps vs an entry-level researcher: self-managing week-long ambiguous tasks, organizational priorities, **taste**, verification, instruction-following, epistemics. Anthropic's own arithmetic: reaching the 2× threshold needs uplift roughly **an order of magnitude larger** than 4×.

### The best independent measurement says "bounded"

**METR's Expenditure Horizon** ([2026-07-21](https://metr.org/blog/2026-07-21-expenditure-horizon/)) — the dollar budget at which humans become more cost-effective than agents. Applied to the NanoGPT speedrun:

- Human returns: ~16h labor per 1% improvement ≈ **$2,500/1%**, and surprisingly *stable* across a doubling of speed.
- Six high-expenditure agentic runs from record #78. After **>$10K of agent spend, expenditure horizons of $0–$3,300**.
- GPT-5 and Opus-4.1 "only chase noise" — revalidation shows **no gain over baseline**. GPT-5.5 and Opus-4.8 show real gains.
- Only ~**70%** of the best models' contributions were mergeable per the maintainer. Experiment compute was 70–90% of trajectory cost.
- METR: *"autonomous optimization does not have dramatic effects on AI R&D progress on NanoGPT."*

Google, answering METR's questionnaire, said the same thing from the inside: autonomous optimizers "sometimes find novel solutions that would have taken humans a lot of effort to find" — but "**even for most eligible problems, AI-assisted humans are far quicker and find better solutions.**"

### METR's absence-of-evidence section

> "We haven't yet observed agents autonomously earning or stealing enough money to support their own inference over days or weeks, despite a number of people trying… we are not aware of evidence that any company relies on AI agents for setting research agendas, making final hiring decisions, making budget allocation decisions, or making all-things-considered judgments."

The concrete failures are worth carrying into any pitch meeting:
- **Redwood Research**: Opus 4.7, "make as much money as possible," 4 days, ~2–3B tokens, $5,000 starting funds. Four runs, **$0 earned**. Binding constraint was KYC/cashout rails, not idea generation.
- **Andon Labs**: Claude Sonnet 4.6 ran a real SF boutique with $100,000. Ordered 1,000 toilet seat covers for the staff bathroom then listed them as merchandise; scheduling errors closed the store three consecutive days.
- METR's own threat-modeling work test: the agent would have placed **below the 20th percentile** of human applicants.

### Where RSI *is* real: the scaffold

A clean research lineage in which a **frozen model** improves the **harness around it**:

| System | Result |
|---|---|
| Darwin Gödel Machine (arXiv 2505.22954) | SWE-bench 20.0% → 50.0%; Polyglot 14.2% → 30.7% over 80 self-modification iterations |
| Huxley-Gödel Machine (arXiv 2510.21614) | Agent optimized on SWE-bench Verified w/ GPT-5-mini, evaluated on SWE-bench Lite w/ GPT-5, **matches best human-engineered coding agents** |
| **Mendel Gödel Machine (arXiv 2608.07645, Aug 2026)** | Qwen3.6-35B-A3B on Polyglot **50.8% → 93.3%, beating GPT-5 with ~117× fewer parameters**. Qwen-evolved scaffold transferred to DeepSeek-V4-Pro → **96.9%** |

💡 **Scaffold evolution is currently worth more than roughly two orders of magnitude of parameters, and the discovered scaffolds transfer across model families.** This is the single most investable technical fact in this file, and it is consistent with 4/18 Anthropic researchers pricing the entry-level-researcher gap in months of *harness* iteration rather than model generations. It is also currently confined to domains with automatic graders.

### Where automated discovery is deployed and paying

**AlphaEvolve** ([impact report 2026-05-07](https://deepmind.google/blog/alphaevolve-impact/), now GA on Google Cloud) — "graduated from pilot testing to becoming a core component of our infrastructure":

- A circuit design "so counterintuitive yet efficient that it was integrated directly into the silicon of our next-generation TPUs" (Jeff Dean: *"TPU brains helping design next-generation TPU bodies"*)
- Cache replacement policies: **two days** vs "months" of human-intensive effort
- Spanner LSM compaction: **−20% write amplification**; compiler work: **−9%** storage footprint
- Willow quantum circuits **10× lower error**; DeepConsensus genomics **−30% variant errors**; AC-OPF GNN feasibility **14% → >88%**
- Commercial: Klarna 2× training speed; FM Logistic +10.4% routing; Schrödinger ~4× MLFF speedup; WPP +10% accuracy

Every one of these has a cheaply-verifiable objective and an automated evaluator. **AlphaEvolve is not general research automation; it is an excellent search process over a verified fitness landscape.** That is why it works, and why it does not generalize to taste-dependent research.

---

## 3. The organizing principle: hill-climbability, not intelligence

METR's central analytical contribution, and the most useful filter in this whole research package.

**Agents are already superhuman-ish where progress is cheap to verify.** Mythos Preview nearly autonomously found **thousands of vulnerabilities** in Firefox and Linux; Opus 4.6 nearly autonomously built a limited C compiler; Mythos Preview completed UK AISI's **32-step corporate network attack simulation end-to-end**. On MirrorCode-Early (software reimplementation, built with Epoch AI), agents solve tasks that take humans **weeks**.

**Agents collapse where hill-climbing is hard.** Same model, same inference budget, given a `dvc` *customization* task instead of pure reimplementation: "produced only days of human-equivalent work, and the ultimate product was unusable." Asked to build a hard new benchmark task, an agent produced one Haiku 4.5 solved 100% of the time for $0.15 — then doubled down defending it.

> **The gating variable in 2026 is the cost of verification, not the intelligence of the model.**

This reframes the Monastery filter. Do not ask "can AI do this task?" Ask **"is there a cheap automatic evaluator for this task, and who owns it?"** If yes, the capability is close and the moat is the evaluator plus the proprietary process data. If no, the capability is years out and the near-term business is human-in-the-loop review economics.

---

## 4. Non-AI R&D is not accelerating — 31 expert interviews

Anthropic's Aug 2026 report includes 31 expert interviews on domains other than AI. Verdict: *"overwhelmingly consistent: AI systems are neither fully automating R&D in key non-AI domains, nor accelerating it to the degree the RSP threat model envisions."*

- **Biotech**: no meaningful impact on the **9–12 / 10–15 year** candidate-to-patient timeline. Bottlenecks: in-vivo validation, clinical trial duration, reliable lab robotics. "AI has not been shown yet to be impacting speed, cost, or headcount in biotech." One dissenter estimated 2–5× depending on workflow.
- **Fusion**: LLMs port legacy physics-simulation code. Component manufacturing and running experiments are the bottleneck and would remain so.
- **Energy**: adoption "early, cautious," concentrated in finance/HR/procurement/logistics — *not* novel R&D. Firms "do not yet trust frontier LLMs internally." And even dramatic R&D acceleration would not transform energy systems, because **physical deployment** (transmission) is the constraint.
- **Defense software** — the one real outlier: coding agents let smaller teams match what **5–10× larger teams** did historically; one **six-month electronic-warfare task compressed to a week**. Agents now write experiment requirements and test plans; hypothesis generation stays human. Hardware roles reported little gain; **materials science** named as the real upstream bottleneck.
- **Bio-nanotech**: protein design transformed; coding "very significantly automated" (~1 day/week saved); humans still drive ideas — "frontier AI systems still lack **research taste**."

Physical bottlenecks named repeatedly: laboratory robotics, in-vivo validation, clinical trials, physical fabrication, battlefield testing. **Some interviewees doubted these are automatable even with future frontier LLMs.**

---

## 5. Verdict on the GP thesis

### Confirmed

**"Capabilities >> deployed economic impact for most of the 5-year window."** Strongly supported.

| Capability | Diffusion |
|---|---|
| METR doubling: **88.6 days** (≥2024), 130.8d (≥2023) | **18%** of US firms use AI in a business function (32% employment-weighted) |
| 50% time horizon **16–20 hours**; suite saturated above 16h | Flat at **17–20%** Dec 2025 → May 2026 |
| SWE-bench Verified **74.9% → 97.0%** in eleven months | **57%** of adopters use AI in ≤3 business functions |
| GDPval top model **~74% wins+ties** vs industry experts, up from 47.6% | **66%** of users use AI *solely* to augment; employment decreases in **2%** of firms |
| GPT-5.6 Luna matches an 11-week-old flagship at 1/5 price | **<20%** of firms with ≤4 employees use AI; no growth under 20 employees |

Sources: [METR TH1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/) · [Census CES-WP-26-25](https://www2.census.gov/library/working-papers/2026/adrm/ces/CES-WP-26-25.pdf) · [Census BTOS May 2026](https://www.census.gov/library/stories/2026/05/ai-use-businesses.html) · [GDPval ICLR 2026](https://iclr.cc/media/iclr-2026/Slides/10008039_VxIDLgu.pdf)

The counter-datapoint, stated fairly: Anthropic's Economic Index (Jan 2026) extrapolates per-capita usage parity across US states in **2–5 years**, "roughly 10× faster than the spread of previous economically consequential technologies" (historical baseline ~half a century). Anthropic flags heavy uncertainty on a three-month window. **Reconciliation**: intensity among existing users is diffusing very fast; breadth across the firm population is close to flat. Both can be true, and the second is what governs where a Monastery-stage company finds a buyer.

### Refined

**"RSI/CL, if they land, change the slope."** Neither has landed. But the framing "if they land" is slightly wrong — RSI is not a binary event, it is already running at the scaffold layer and measurably worth $0–$3,300 per optimization problem. The right question is not *whether* but *how steeply the returns curve bends*, and every honest measurement in 2026 says the curve is bending gently and the instruments to see it are failing simultaneously.

**The single most important structural fact**: METR TH1.1 (>16h), MirrorCode-Early, Anthropic's rule-out suite, and CoBench have **all saturated**. We are losing measurement resolution at exactly the moment Anthropic reports "early signs of acceleration." Forecast variance should widen from here in **both** directions — this is an argument against confident timelines of any sign, not evidence for a faster takeoff.

### The three numbers to carry into the GP conversation

1. **Anthropic — where Claude writes a large majority of merged production code — is "significantly faster… but not yet by a factor of 2."** If the most AI-saturated organization on Earth cannot double its own R&D rate, the ~10-year diffusion assumption is conservative for everyone else.
2. **$0–$3,300 expenditure horizon after $10K of agent spend, against $2,500-per-1% human returns.** Autonomous optimization is real, bounded, and product-shaped — not phase-transition-shaped.
3. **18% of firms, flat for five months, 57% of adopters at ≤3 functions.** Capability doubles every ~3–4 months; adoption breadth is approximately flat. **That gap is the entire investment thesis.**

### What would falsify this — monitoring list

- CoBench crossing ~85%, or Anthropic's automated-R&D rating moving off "low"
- METR publishing a reliable time horizon above 16h on a non-saturated suite — especially an **80%** horizon above one working day
- Any lab shipping **weight-level** continual learning at frontier scale (watch the Google Sleep/Dreaming line). If consolidation into weights works at scale, the memory-infrastructure category becomes a feature and the §1 reliability failures change character
- An agent autonomously funding its own inference (METR flags this absence as the biggest constraint on their assessment)
- **Scaffold-evolution results transferring to domains without automatic graders.** MGM beating GPT-5 with 117× fewer parameters is currently confined to benchmarks with programmatic scoring. If that works where grading is subjective, the picture changes fast

---

## 6. Monastery filter — what this implies for company selection

Ordered by verification cost, which §3 argues is the real gating variable.

| Layer | Status | Company shape | Monastery fit |
|---|---|---|---|
| **Software production** | Rewritten | Not "sell coding agents" — that's a price war with three frontier labs. The consequence is that the **cost floor for vertical software collapsed**, which is what lets $2M reach outcomes that used to need $20M | ✅ Enabling condition for the whole portfolio, not a category |
| **Cheaply-verifiable industrial optimization** | Live, under-served | Own the **evaluator and the fitness function** for a specific process (routing, lithography, grid dispatch, compaction). Moat = proprietary process data + the verifier, not the model | ✅ Best fit. Seed-stage, defensible, not a Big Tech feature |
| **Knowledge-work deliverables under review** | Crossing parity now | GDPval says frontier model + expert review beats the unaided expert on cost and speed. Binding constraint is **review throughput**, not model quality | ⚠️ Works, but this is also where GC/Thrive roll-ups play with $100M+. Check size mismatch |
| **Agent memory / context infrastructure** | Real but compressing | Only the parts OpenAI structurally won't build: cross-vendor portability, audit-grade temporal provenance, self-host/data residency | ⚠️ 12-month clock on the generic version |
| **Long-horizon autonomous operations** | Not yet | 80% horizon is 3–4h. $0 across four money-making runs. 70% of production silent failures caught by humans, not monitoring | ❌ Betting on a curve, not a capability |
| **Physical / regulated / embodied** | Blocked on non-AI clocks | Drug dev 9–15 yrs; fine dexterity 32–44% success; interconnection queues 4–10 yrs; HV transformers 2.5–5 yrs | ❌ No amount of capability slope shortens these inside 5 years |

---

*Full sourcing, benchmark tables, world-model and energy sections in `raw/agent-tech-researcher-takeoff.md`.*
