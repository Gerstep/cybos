# Scratch — gen-media tech research (2026-09-01)

## Video gen SOTA
- Sora: OpenAI shut down Sora **app 2026-04-26**; **API sunset 2026-09-24**, deprecation replacement listed as "none". (prompt-architects, thepostflow, topreviewed)
- Veo 3.1 (Google): native 4K, 48kHz synced dialogue in one pass (only model doing this per topreviewed), 8s base clips extendable in Flow, SynthID always, Vertex indemnification, $19.99/mo AI Pro.
- Kling 3.0 (Kuaishou): native 4K 3840x2160 launched **2026-04-23** ("world's first native 4K video model"), ~$0.10/sec, $10/mo 660 credits ≈165 5s clips. 4K/60fps per topreviewed. Character/brand consistency a design goal. Kling-Omni technical report arXiv 2512.16776.
- Seedance 2.0 (ByteDance): up to 9 images + 3 reference clips, multi-shot narrative control.
- Runway Gen-4.5; ProRes 4444 Pro+; 720p native.
- Hailuo H3 2K 25fps. PixVerse 5.5. LTX-2.3 (Lightricks). HappyHorse-1.0.

## Real-time / streaming
- **Genie 3** (GDM): 720p @24fps, 11B autoregressive transformer, consistency "a few minutes", visual memory ~1 min. **Project Genie** launched **2026-01-29** for AI Ultra US, **60-second session cap** — Wikipedia: cap because AR model "requires substantial dedicated compute, making longer sessions too expensive to scale". No public API.
- **Matrix-Game 3.0** (Skywork, arXiv 2604.08995): 720p **@40 FPS**, 5B model — BUT asynchronous deployment = **8 GPUs DiT + 1 GPU VAE (8+1)**. INT8 quant on attn proj, MG-LightVAE pruned decoder (2.6x/5.2x), GPU memory retrieval (biggest single FPS contributor). Minute-long memory consistency. Scales to 2x14B. Removing INT8 → 27.38 FPS.
- **Vidu S1** (arXiv 2607.03118): 540p **42 FPS on RTX 5090** (consumer GPU), 3-step, voice-controlled digital characters, "infinite-length", TurboDiffusion+TurboServe. Demo vidu.com/vidu-stream.
- **Visko Orbis 1.0** (arXiv 2607.26694): native 832x480 gen + streaming SR → **4K @24 FPS**, prompt switch visible <1s, hour-scale rollouts, multi-GPU serving.
- **MaineCoon** (arXiv 2606.17800, 2026-06-17): 22B audio-visual AR, **47.5 FPS 480p on single H100** (31 FPS at chunk 2, 47.5 at chunk 6), **<$0.001/sec**, thousand-second-scale, agentic cache mgmt. SocialVideo-Bench. Positions "social world models".
- **LongLive 2.0** (NVlabs, 2026-05-13): 5B, NVFP4 2-step **45.7 FPS** (VBench 83.14), 4-step 29.7 FPS (84.51), BF16 5B 24.8 FPS (85.06), 1.3B 20.7 FPS (84.87). Multi-shot attention sink, KV-recache. SANA-Video linear attention 60s interactive realtime (2025-11-03).
- **Decart Oasis 3** (2026-06-10): 3x synchronized 768x512 cams @22 FPS, <200ms e2e, autoregressive "Live Stream Diffusion" on DOS, NVIDIA HGX B200 via CoreWeave, **$0.02/sec** ($1.20/min), gRPC. $300M May 2026 round led by Radical (NVIDIA, Toyota Ventures, Sequoia, Benchmark), ~$4B val, <$100M cumulative burn. 100k+ dev community on Lucy. TechCrunch caveats: scenes degrade over long sessions, cars phase through obstacles.
- Other: WorldPlay (2512.14614), LingBot-World / LingBot-v2, HY-World 1.5, HY-GameCraft 1.0/2, Yume 1.5 (2512.22096), RELIC (2512.04040), SANA-WM, Warp-as-History, HelloWorld (2608.05070), AlayaWorld (2608.13492, finetuned from LTX-2.3, 720p/540p, 4 denoise steps/chunk ≈1s video), Happy Oyster, Dream*, Cosmos (NVIDIA, 2M downloads), World Labs Marble (free–$95/mo).

## Benchmarks
- WorldMark (arXiv 2604.21686, alayalab): 10 models, 500 cases, 9 deterministic metrics, World Model Arena warena.ai Elo.
- WBench (arXiv 26xx.25874) navigation split 158 cases. AlayaWorld best Consistency 89.5; weak on Scene consistency + Causal Fidelity.
- iWorld-Bench. SocialVideo-Bench (700 prompts, 7 domains, 2x10s segments w/ prompt switch).
- HelloWorld table: Matrix-Game 3.0 ActAcc 8.0, TimeAcc 37.5 (random = 33.3) — i.e. game world models are near-random at *social* interaction timing.

## RESOLVED — the decisive numbers

**Cost anchors (Sep 2026)**
- Reactor Helios / LongLive 2: **$6.12/hr** (17 credits/sec = $0.0017/s), 24fps, ≤1280×768, infinite. reactor.inc
- Decart Oasis 3: $0.02/s = **$72/hr**
- Seedance 2.0 Fast $0.022/s; Veo 3.1 $0.03–0.75/s (25x source spread — flag); Kling 3.0 $0.126/s; Seedance Pro $0.247/s
- H100 floor: $2–4/hr → 3–5 min 1080p → $0.007–0.022/s all-in saturated

**Netflix denominators (Q2'26 8-K, filed 2026-07-16)**
- H1'26 revenue $24,810M (Q1 12,250 + Q2 12,560); viewing >97B hours; content amortization $8,529M
- **Revenue per hour viewed = $0.2558** · content cost per hour = $0.0879
- → real-time gen is **24x** revenue/hr, **70x** content-cost/hr. Offline premium is 1,400–10,500x.

**Crossover math** (from $6.12/hr): @60%/yr → $2/hr late-2027, $1.50/hr early-2028, $0.256/hr early-2030, $0.088/hr early-2031. @30%/yr floor → 2029/2030/2035/2038.

**Sora post-mortem**: ~$1M/day burn (peak $15M/day), lifetime revenue $1.4–2.1M, downloads 3.3M(Nov)→1.1M(Feb) −67%, <500k global actives, Disney $1B + 200–250 chars never finalized, notified <1hr before, Sora 3 training queued never started, compute → "Spud"/GPT-5.5. Peebles: economics "completely unsustainable."

**Consistency (A²RD arXiv 2605.06924, 1-min 8-scene)**: character 0.74 (SOTA) vs 0.56–0.57 baselines; narrative 0.90 vs 0.75. Training-free agentic loop. Costs ~6 videos + 6 images per finished segment ≈ 6x compute.
**EntityBench (2605.15199)**: 140 eps / 2,491 shots, recurrence gaps ≤48 shots; consistency degrades sharply with recurrence distance; EntityMem d=+2.33.
**Physics-IQ Verified leaderboard (2026-06)**: real-variance 100; Magi-1+GeoPhys BoN v2v 64.5; Cosmos3-Super i2v 39.5 (best i2v); Sora 2 26.5. Jan-2025 best was 24.1.

**Architecture**: CausVid → Self Forcing (2506.08009) → Self Gradient Forcing (2607.20368, fixes the context-gradient gap, 5s window → minute-scale) → **Flex-Forcing** (NVIDIA 2607.03509, AR and bidirectional as two extremes of one chunking scheme, runtime device-budget tunable). Winning stack = chunk-causal + DMD few-step + KV/attention sink + pose-indexed retrieval + pruned VAE + INT8/NVFP4 + serving pipeline.

**Camp B (decoupled state + neural renderer)**: Magpie (engine white-box frames, ~300h UE data, 32.2 FPS, 1.55s first-action, 34GB), Tripo Project Eden ("video models are not world models... they hallucinate from the ground up"), Meshy (mechanics model + mixed render).

**Distribution**: YouTube >1M channels/day using AI creation tools (Dec 2025); Gemini Omni remix + personal avatars free in Shorts 2026-05-19; text-to-game promised 2026. Netflix ~300 titles used genAI (mostly post), INKubator GenAI-native animation studio, InterPositive acquired Mar 2026, **zero interactive/personalized announcements**.

**Funding**: Decart $300M @ ~$4B (May 2026, <$100M cumulative burn, 100k devs); Odyssey $310M @ $1.45B (2026-06-17); Meshy ~$400M B (12M users, >$40M ARR); Tripo $200M + $150M in two months.

**Regulatory (child-safe moat)**: EU AI Act Art.50(2) marking in force 2026-08-02, transition ends 2026-12-02; Reg (EU) 2026/1744 CSAM/NCII prohibited + technical safeguards 2026-12-02; UK Crime & Policing Act 2026 criminalises optimised models (IWF: 3,443 AI CSA videos in 2025, +26,385%); India IT Amendment Rules in force 2026-02-20; EU age verification solution recommended by 2026-12-31.

**Open weights closing**: downloadable = Wan 2.2/2.1, Wan-Dancer-14B, LTX-2/2.3, HunyuanVideo. Wan 2.5/2.6/2.7 API-only (verified 2026-07-29).

## Outputs
- `raw/agent-tech-researcher-gen-media.md` (full)
- `generative-netflix/tech-realtime.md` (domain verdict)
