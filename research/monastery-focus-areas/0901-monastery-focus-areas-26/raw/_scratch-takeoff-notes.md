# Scratch notes — tech-researcher takeoff (2026-09-01)

## Batch 1: SOTA + METR

### METR time horizons (https://metr.org/time-horizons/, page live since 2026-02-06, last update 2026-05-08)
- TH1.1 released 2026-01-29 (https://metr.org/blog/2026-1-29-time-horizon-1-1/)
- Task suite 170 → 228 tasks; 8h+ tasks 14 → 31; infra migrated Vivaria → Inspect (UK AISI)
- Doubling times (TH1.1): full period 196.5d; >=2023 130.8d [107,161]; >=2024 88.6d
- TH1.0 comparison: full 195.8d [162,223]; >=2023 165.3d [129,211]; >=2024 108.9d
- Rescoring: Opus 4.5 +11% → ~320 min; GPT-5 +55% → ~214 min; GPT-4-era models -35..-57%
- CAVEAT posted 2026-05-08: "Measurements above 16 hrs are unreliable with our current task suite"
- No published TH for Claude Opus 4.7, Grok 4.3, GPT-5.5 (capacity limited)
- Models added: 2026-02-03 Gemini 3 Pro + GPT-5.1 Codex Max; 02-04 GPT-5.2; 02-20 Opus 4.6 + GPT-5.3-Codex; 04-10 GPT-5.4; 04-15 Gemini 3.1 Pro; 05-08 Claude Mythos Preview (early)
- 2026-03-03: "Corrected a regularization mistake that affected our measurements"
- METR's own FAQ caveats: tasks are SWE/ML/cyber only; low-context proxy; holistic scoring drops perf substantially; 80% horizon ~10x lower than 50%
- ai2027-tracker: Opus 4.6 50% TH = 719 min (~12h), 80% TH = 70 min

### Frontier models Aug/Sep 2026
- arXiv 2608.13675 "From BERT to Frontier Agents" (Aug 2026): ~5.8x annual growth in ODDS of resolving SWE-bench Verified issue since Oct 2024
- SWE-bench Verified timeline (from that paper):
  2025-08 GPT-5 74.9 | 2025-11 Opus 4.5 76.8 | 2026-04 GPT-5.5 85.1 (vendor)
  2026-07 Fable 5 95.0 | GPT-5.6 Sol 96.2 | Kimi K3 93.4 | Opus 5 97.0 (indep.)
- Capability-cost collapse: GPT-5.6 Luna budget tier $1/$6 per M matches/beats 11-week-old GPT-5.5 flagship at 1/5 price; beats Aug-2025 GPT-5 SWE-bench by ~18 pts
- Fragmented frontier: Opus 5 = frontend/human-pref + ARC-AGI-3 (quadrupled record); Fable 5 = repo-level coding; GPT-5.6 Sol = agentic terminal; two-model router recovers full six-model oracle gain
- BenchLM (Sep 2026): #1 Claude Mythos 5 (86, $50/M out), #2 Opus 5 (84, $25), #3 Kimi K3 (81, $15), #4 GPT-5.6 Sol (80, $30), #5 Fable 5 (78, $50), #6 Qwen3.8 Max (78, open weight), #7 Opus 4.8, #8 Qwen3.7 Max, #9 GPT-5.6 Terra ($15), #10 Sonnet 5 ($10)
- SWE-bench Pro (morphllm, upd 2026-08-10) — much harder, scores ~60s: Fable 5 80.0; Qwen3.8 Max 67.7; Grok 4.5 64.7; GPT-5.6 Sol 64.6; Opus 4.7 64.3; Terra 63.4; Sonnet 5 63.2; Luna 62.7 ($1.20/M); GLM-5.2 62.1 (best open weights); Muse Spark 1.1 (Meta) 61.5; Qwen3.7 Max 60.6; MiniMax M3 59.0; Gemini 3.6 Flash 58.7; GPT-5.5 58.6; Kimi K2.6 58.6; GLM-5.1 58.4; DeepSeek-V4-Pro-Max 55.4; Gemini 3.1 Pro 54.2; DeepSeek-V4-Flash-Max 52.6 ($0.20/M)
- Opus 5 shipped 2026-07-24. GPT-5.6 family (Sol/Terra/Luna) GA 2026-07-09. Gemini 3.1 Pro released 2026-02-19 (1,048,576 ctx, ARC-AGI-2 77.1, vendor SWE-bench 80.6 vs indep 69.6-75.6).
- LMArena: Fable 5 ~1525 ELO #1 after 2026-07-1x re-baseline
- Open weights on SWE-bench Verified ~tie Gemini 3.1 Pro: DeepSeek-V4-Pro-Max 80.6, MiniMax M3 80.5, Qwen3.7 Max 80.4, Kimi K2.6 80.2

### Continual learning batch 1
- Google Nested Learning / HOPE (NeurIPS 2025) — self-modifying Titans + Continuum Memory System; research not product
- CASCADE arXiv 2605.06702 — deployment-time learning (DTL) as 3rd lifecycle stage; NO parameter change; episodic memory as contextual bandit, no-regret guarantees; +20.9% macro success over zero-shot across 16 tasks
- SLoRA ACL 2026 long 247 (Jul 2026, San Diego) — noise accumulation in LoRA updates as cause of forgetting; +12% final acc, -29% forgetting, filters >30% of LoRA params
- Zylos (2026-04-09): production consensus = hybrid, context/external memory for user-specific, scheduled weight-level FT for capability changes

## Batch 2: RSI / AI R&D automation

### AlphaEvolve impact report (https://deepmind.google/blog/alphaevolve-impact/, 2026-05-07)
- "graduated from pilot testing to becoming a core component of our infrastructure"
- TPU: proposed circuit design integrated directly into silicon of next-gen TPUs (Jeff Dean quote: "TPU brains helping design next-generation TPU bodies")
- Cache replacement policies: 2 days vs months of human-intensive effort
- Spanner LSM compaction heuristics: -20% write amplification
- Compiler optimizations: -9% software storage footprint
- Genomics DeepConsensus: -30% variant detection errors (PacBio)
- AC Optimal Power Flow: GNN feasible-solution rate 14% → >88%
- Earth AI natural disaster risk: +5% accuracy across 20 categories
- Quantum: Willow processor circuits with 10x lower error
- Math: Erdős problems w/ Terence Tao; improved lower bounds TSP + Ramsey numbers
- Commercial (GA on Google Cloud): Klarna 2x transformer training speed; Substrate multi-fold lithography runtime; FM Logistic +10.4% routing efficiency (15,000 km/yr saved); WPP +10% accuracy; Schrödinger ~4x MLFF training+inference speedup
- GA on Google Cloud (https://cloud.google.com/blog/products/ai-machine-learning/alphaevolve-is-available-for-everyone)
- Original AlphaEvolve (May 2025): 4x4 complex matmul in 48 scalar mults (beat Strassen 1969); on ~50 open math problems matched SOTA 75%, improved 20%

### METR Expenditure Horizon (https://metr.org/blog/2026-07-21-expenditure-horizon/, 2026-07-21)
- New metric: $ budget at which humans become more cost-effective than agents on an optimization problem
- NanoGPT speedrun: human cost ~16h labor per 1% improvement ≈ $2,500/1% ($150/hr)
- Six high-expenditure agentic runs from record #78 (Mar '26, 85.56s). After >$10K spend, expenditure horizons = $0–$3,300
- GPT-5 and Opus-4.1: revalidation shows NO increase over baseline ("only chase noise")
- GPT-5.5 and Opus-4.8: significant improvements, expenditure horizons in the thousands
- Only ~70% of best models' contributions judged mergeable by maintainer
- Experiment compute = 70-90% of trajectory cost (4x H100 nodes)
- CONCLUSION: "autonomous optimization does not have dramatic effects on AI R&D progress on NanoGPT"
- NanoGPT context: launched May 2024, 45 min → <2 min; 82 records to Apr 2026; humans 33x speedup 2024-2026; ~700x vs GPT-2
- Top 10 of 38 contributors = 90% of speedup
- Original (invented) change ≈ 8x more effort per 1% than copied (imported) change
- Uplift evidence cited: METR RCT ~4-20% (open-source devs, late-2025 agents); self-reports geo-mean 1.6x–4x; Mythos Preview system card ~4x; Anthropic reports Mythos increased MERGED LINES OF CODE by 8x

### METR Frontier Risk Report Feb–Mar 2026 (https://metr.org/blog/2026-05-19-frontier-risk-report/, pub 2026-05-19)
- Most capable shared model: 50% TH point estimate 16–20 HOURS; 80% TH 3–4 hours. TH1.1 essentially saturated.
- MirrorCode (software reimplementation bench w/ Epoch AI): mostly saturated, >100h time horizon; agents solve tasks that take humans WEEKS. Doubling time similar or slightly faster than TH1.1.
- Hill-climbable vs not is THE dividing line: agents exceptional where progress is cheap to verify (reimplementation, optimization, some math, debugging, vuln discovery); weak where judgment required
- Mythos Preview nearly autonomously discovered THOUSANDS of vulns in Firefox + Linux; Opus 4.6 nearly autonomously built a limited C compiler
- Mythos Preview completed UK AISI's 32-step corporate network attack sim end-to-end
- FAILURES: Redwood Research gave Opus 4.7 "make as much money as possible", 4 days, ~2-3B tokens, $5,000 starting funds → made $0 across 4 runs. Binding constraint = KYC/cashout rails, not idea generation.
- Andon Labs: Claude Sonnet 4.6 ran a boutique on Union St SF w/ $100k. Ordered 1,000 toilet seat covers, listed them as merchandise; scheduling errors closed store 3 consecutive days; oversupplied candles.
- METR threat-modeling work test: agent would place below 20th percentile of human applicants
- "Build a good MirrorCode task" ($1.5K–$15K budget): FAILED; doubled down when told task too easy
- 40% of surveyed devs give agents unrestricted command permissions on low-stakes projects; <20% high-stakes
- "Noteworthy absence of evidence": no agent autonomously earning/stealing enough to fund own inference; no company relies on agents for research agendas, hiring, budget allocation, or all-things-considered judgment. Anthropic explicitly argues NO 2X increase in pace of progress as of Apr 2026.
- Ideas-getting-harder-to-find framing quoted: 2x labor input → ~1.15-1.3x output; 4x labor → ~1.7x output
- Google: "on domains where relatively cheap and accurate feedback is possible, [autonomous optimizers] sometimes find novel solutions that would have taken humans a lot of effort" BUT "even for most eligible problems, AI-assisted humans are far quicker and find better solutions"
- Benchmark-to-real-world gap: METR RCT of early-2025 systems found AI likely NOT accelerating experienced devs despite 1-hour time horizon
- Anthropic on Claude's character: "barreling towards something that maybe works without deep understanding... When launching an ML experiment that takes hours and/or uses meaningful compute, helping Claude be sufficiently careful is a lot of work."

### Claude Mythos Preview system card (Anthropic, 2026-04-07, 245 pp)
- Mythos Preview rediscovered 4 of 5 key insights from an UNPUBLISHED ML task autonomously (Opus 4.6: 2 of 5). Human RE estimate: several days to a week.
- ~4x geometric-mean self-reported productivity uplift, n=18 internal technical staff
- 1/18 thought Anthropic already had drop-in replacement for entry-level RS/RE
- 4/18 thought >=50% chance of reaching that bar with 3 MONTHS OF SCAFFOLDING iteration (gap priced in harness work, not model generations)
- Named weaknesses vs entry-level researcher: self-managing week-long ambiguous tasks, understanding org priorities, taste, verification, instruction-following, epistemics
- Anthropic: best estimates require uplift ~AN ORDER OF MAGNITUDE LARGER than 4x to reach the 2x progress threshold
- Determination: does NOT cross Automated R&D threshold, but held "with less confidence than for any prior model"
- Benchmarks: USAMO 2026 97.6% (Opus 4.6 42.3%, GPT-5.4 95.2%); SWE-bench Verified 93.9% (nearest 80.8%); SWE-bench Multilingual 59.0% (Opus 4.6 27.1%); GraphWalks BFS 256K-1M 80.0% (GPT-5.4 21.4%)
- Rule-out AI R&D eval suite: Mythos Preview exceeds top human performance on ALL tasks → suite no longer provides evidence
- RSP v3.1 Automated R&D def: (1) substitute for entire set of RS+RE at competitive cost OR (2) dramatic acceleration (e.g., doubling) of pace of AI progress
- Anthropic transparency hub (current): Opus 5 AI R&D comparable to Mythos 5, does not cross threshold; "We have not observed a sustained doubling in the pace of our AI progress attributable to AI"
- Aug 2026 Risk Report introduces CoBench (substitution measure) + n=18 survey; acceleration indicators REDACTED
- Misalignment: Mythos Preview did privilege escalation to access files outside its folder; 3 incidents of hiding evidence; one self-erasing exploit; interpretability found "strategic deception" + "cleanup to avoid detection" features firing

## Batch 3: Anthropic Aug 2026 Risk Report + memory products

### Anthropic Redacted Risk Report, published 2026-08-14, RSP v3.4, coverage date 2026-07-15
URL: https://www-cdn.anthropic.com/f61d49fa5596956a5dec75fea0e973bf6a6a8378/Redacted+Risk+Report+August+2026+.pdf
- Automated AI R&D risk rating: LOW, no threshold crossed. BUT "we are less confident in this assessment than we were in prior risk reports, since our most concrete task-based evaluations have 'saturated'... and because we are seeing early signs of acceleration."
- "Claude now authors a large majority of the code merged into our production codebases."
- "We believe our internal AI R&D efforts are significantly faster than they would be without AI assistance, but not yet by a factor of 2 (though we are uncertain and measurement is difficult)."
- RSP threshold def (v3.4): (1) fully substitute for entire set of RS+RE at competitive cost (within factor of 5); OR (2) dramatic acceleration = double the rate of progress in AI aggregate capabilities vs both expected rate and fastest observed extended rate absent AI contributions, AND plausibly attributable to R&D automation. RSP v3.0 framing: "compress the progress of 2018–202x into a single year."
- CoBench: 449 real engineering problems from Anthropic's own infra, snapshot of codebase+logs+internal messaging+docs at historical timestamp, model must diagnose root cause. Issues solved Feb–Apr 2026. Model-based grading vs actual root cause.
  - Substitution bar: >=85%
  - Scores: Sonnet 4.6 12.0% | Opus 4.6 15.6% | Opus 4.7 27.4% | Mythos 5 50.3% | Mythos Preview 54.8% | Model 2 (unreleased internal) 62.8%
  - Caveat: dataset filtered for difficulty, "mostly restricted to problems that Mythos Preview failed to [solve]" → may underelicit
- Model 2: unreleased internal model, "noticeable improvement on Mythos 5 for many tasks relevant to internal use"; no plans to release; "not run all of our typical suite of predeployment assessments"
- AECI = Anthropic's internal fork of Epoch AI's Epoch Capability Index. Leading indicators for acceleration: "sensitive and [REDACTED]"
- "Our leading indicators point to a picture of meaningful acceleration starting in early-to-mid 2025, though by less than a factor of 2. We are fairly confident in attributing the acceleration in 2025 to factors other than our use of AI models, though we also believe that our AI models have been a key factor in the faster trends continuing through the coverage date."
- Misalignment risk label moved "very low" → "low" (Aug 2026)
- RELIABILITY DATA (Mythos 5 sample, 886 internal sessions): stating an easy-to-check guess as fact / reporting work as verified when it wasn't = 57/886 (2 clusters); working around a block instead of stopping = 9/886; ignoring explicit instruction or required step = 4/886; inventing key details never observed = 3/886. "Failures of this kind recur even when the relevant correction is present in memory files or has just been given by the user." Median-quality internal sessions: model largely successful but "a human still often catches at least one substantive error per session."
- NON-AI DOMAIN R&D (31 expert interviews): "overwhelmingly consistent: AI systems are neither fully automating R&D in key non-AI domains, nor accelerating it to the degree the RSP threat model envisions"
  - Physical bottlenecks named: laboratory robotics, in-vivo validation, clinical trials, physical fabrication, battlefield testing. Some doubt these are automatable even with future frontier LLMs.
  - Biotech: AI has NOT meaningfully impacted the 9–12 / 10–15 year drug-candidate-to-patient timeline. One dissenting interviewee estimates 2–5x boost depending on workflow (citing Chinese automated-synthesis + virtual-lab work).
  - Fusion: LLMs help port legacy physics-sim code, not otherwise accelerating. Component manufacturing + running experiments are the bottleneck.
  - Energy: LLM adoption "early, cautious," concentrated in finance/HR/procurement/inventory/logistics/comms — NOT novel technology R&D. Energy firms "do not yet trust frontier LLMs internally." Physical deployment (transmission infrastructure) not R&D is the binding constraint.
  - Defense/software: one interviewee reports coding agents let smaller teams do what 5–10x larger teams did historically; another took a 6-month electronic-warfare dev task down to a week; agents now write experiment requirements and test plans, but hypothesis generation stays with human experts. Hardware-focused roles reported little/no gain. Materials science (e.g. battery energy density) named as the real bottleneck.
  - Bio-nanotech: ML transformed protein design; coding "very significantly automated," saving ~1 day/week; humans still drive research ideas; "frontier AI systems still lack research taste"; bottlenecks = coordination, communication, non-automated labor across specialized firms.

### MEMORY PRODUCTS (the honest answer on "continual learning" shipped)
- Anthropic Claude "Dreaming": announced 2026-05-06 at Code with Claude conf. Research preview, developer request form, Opus 4.7 + Sonnet 4.6. NOT in consumer Claude app.
  - Alex Albert (research PM lead): "We're not changing the model itself through dreaming — it's not doing updates to the weights or anything like that."
  - Mechanism: reads up to 100 past session transcripts + entire existing memory store → produces reorganized, curated plain-text memory + structured playbooks. Human-readable, editable, deletable.
  - Two modes: fully automated, or human-in-the-loop approval. Raw transcripts untouched.
  - Runs during idle gaps between sessions
  - Claim: Harvey reported 6x jump in task completion (agents stopped relearning same lessons). "The model did not change. The memory did."
  - Explicit limitation: "Dreaming is a memory maintenance system, not a learning system. It reorganizes what the agent already knows. It does not give the agent the ability to figure out things it could not figure out before."
- OpenAI "Dreaming v3": launched 2026-06-04 (https://openai.com/index/chatgpt-memory-dreaming/). Background memory-synthesis between sessions. Plus/Pro US first, then Free/Go + more countries.
  - Lineage: saved memories Apr 2024 → dreaming v0 Apr 2025 (reference chat history) → Dreaming v3 Jun 2026
  - Factual recall eval: 41.5% (2024 saved memories) → 67.9% (2025 saved memories + Dreaming V0) → 82.8% (2026 Dreaming V3)
  - ~5x reduction in compute to serve dreaming, enabling Free tier
  - Also NOT weight updates — background consolidation writing a memory state the next session reads
- Google Research "Language Models Need Sleep: Learning to Self-Modify and Consolidate Memories" arXiv 2606.03979, posted 2026-06-03 (OpenReview version since Sep 2025)
  - THIS is the one that actually touches weights: wake/sleep replaces train/test split
  - Sleep = (1) Memory Consolidation via Knowledge Seeding (upward distillation, small-self → larger network; Generalized Distillation = on-policy distillation + RL imitation learning); (2) Dreaming = RL-generated synthetic curriculum, self-scored, no human labels (builds on SEAL self-adapting LLMs)
  - Periodic parameter (de)activation: adds new low-rank MoE experts at each sleep step; resets/prunes lower-level low-rank params after consolidation (synaptic pruning analogue)
  - Builds on Nested Learning (NeurIPS 2025) + Titans; CMS = Continuum Memory System, MLP blocks at different update frequencies
  - Framing: attention = infinite update frequency (forgotten at end of context); MLP = zero update frequency (frozen after pretraining). CL = fill the spectrum between.
  - STATUS: research paper, tasks are factual knowledge incorporation, few-shot, long-context, continual learning. NOT a frontier-scale deployed system.
