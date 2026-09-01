# Agent: company-researcher — GENERATIVE VIDEO, FILM, SERIES, UGC, AVATARS, PERSONALIZED STORY

**Date**: 2026-09-01
**Agent**: company-researcher
**Scope**: Exhaustive company catalog across foundation video models, realtime/world models, enterprise avatars, UGC ad video, generative film/series/personalized story, and infra/distribution for the "Generative Netflix" market.
**Recency bias**: 2026 news prioritized, especially Jul–Sep 2026.
**Status**: RAW NOTES — every material claim carries a URL + date where available. Where sources disagree materially (common on total-funding and valuation figures across Crunchbase/PitchBook/CBInsights/Tracxn/company press), the range is shown and the most primary source is preferred.

This file complements two prior scratch files already in `raw/`: `_scratch-genmedia-notes.md` (SOTA video model specs, realtime/world-model benchmarks) and `agent-market-researcher-gen-entertainment.md` (TAM, Sora post-mortem, Netflix/Fable deep dives, Decart/Runway realtime economics). Those files are NOT repeated here except where directly relevant; read together for full context.

---

## 0. HEADLINE VERDICT ON SORA (verified per user's explicit request)

**Status: KILLED / SUNSET — not "limited," not a rumor.** Multiple corroborating primary-adjacent sources:
- OpenAI announced Sora's shutdown **March 24, 2026**. Consumer web + mobile app discontinued **April 26, 2026**. API held in maintenance-only mode until **September 24, 2026** (i.e., sunsetting **this month**, per the user's session date of 2026-09-01), after which all account data is deleted. OpenAI's own deprecations page lists **no replacement product**. — [rctv.com](https://rctv.com/posts/sora-shutdown-what-the-numbers-mean/) (updated 2026-04-22), ngram.com, leaxor.com
- Free tier for image+video generation was cut **Jan 10, 2026** and never returned; Sora 2 model survives only inside ChatGPT behind a paid plan.
- Economics: standalone Sora 2 app (launched Sept 2025) generated **$2.1M lifetime in-app purchases** over ~6 months against peak inference cost estimates of **~$1M/day** (one estimate: peak $15M/day) — roughly three orders of magnitude underwater.
- Retention (SensorTower via Olivia Moore/a16z): D1 10%, D7 2%, D30 1%, D60 ≈0%, vs. TikTok's D1 50/D7 38/D30 32/D60 25.
- Downloads peaked 3.33M/month (Nov 2025), fell 66% to 1.13M by Feb 2026.
- **Disney publicly exited within hours** of the shutdown announcement.
- Adobe Firefly's own "generate videos using partner models" help page (last updated **Jun 16, 2026**) still lists **Sora 2** as a selectable partner model — meaning Adobe's integration outlived OpenAI's own consumer app, an ironic footnote on how brief Sora's independent life was. [helpx.adobe.com, accessed 2026-09-01 research]
- **No evidence found of a Sora relaunch, pivot, or successor** as of Sept 2026. Treat any claim of "Sora 3" or a revival as unverified — none surfaced in this research pass.

(Full detail incl. exact quotes already logged in `agent-market-researcher-gen-entertainment.md` §0.2 — not re-fetched here to avoid duplicate claims.)

---

## 1. FOUNDATION / FRONTIER VIDEO MODELS

### 1.1 Google Veo / Project Genie (DeepMind)
- **Veo 3.1**: native 4K, 48kHz synced dialogue in a single pass, 8s base clips extendable via Flow, SynthID watermarking always-on, Vertex AI indemnification for enterprise, $19.99/mo consumer "AI Pro" tier. Available as a partner model inside Adobe Firefly (Veo 2, Veo 3.1, Veo 3.1 Fast). — topreviewed, Adobe Firefly help docs (updated 2026-06-16)
- **YouTube Dream Screen**: Veo 2 integrated into YouTube Shorts (rolled out US/CA/AU/NZ). Two modes: (1) green-screen AI backgrounds, (2) standalone AI video clip generation inserted into Shorts via the media picker "Create" tool. All outputs carry visible labels + SynthID. — [blog.youtube](https://blog.youtube/news-and-events/veo-2-shorts/), [The Verge](https://www.theverge.com/news/612031/youtube-ai-generated-video-shorts-veo-2-dream-screen)
- **Project Genie** (world model, separate from Veo): launched consumer prototype **Jan 29, 2026**, Google Labs, **US-only, 18+, AI Ultra subscribers only ($249.99/mo)**. Hard specs: **720p, 24fps, ~60-second interaction horizon**, 11B-param autoregressive transformer, generates geometry/texture/physics dynamically. Explicitly "not yet a tool for shipping finished playable games." — Google blog, 2026-01-29 (full detail in scratch notes file)
- **Read for thesis**: Google runs two completely separate generative-video strategies — Veo (cinematic, high-fidelity, feature-integrated into YouTube/Firefly/Vertex) vs. Genie (interactive world model, paywalled research preview, not production-ready).

### 1.2 xAI — Grok Imagine Video
- **Grok Imagine Video 1.5**: GA'd **Jun 16, 2026**. Image-to-video (primary) + text-to-video, up to 15s clips, up to 1080p (text/image-to-video), 720p cap on reference-to-video, native audio (dialogue, SFX, music) in one pass, powered by "Aurora" autoregressive engine. **1.5 Fast**: 6s 720p clip in ~25s (down from 40+s). — [x.ai/news/grok-imagine-video-1-5](https://x.ai/news/grok-imagine-video-1-5), 2026-06-16
- **Pricing**: API $0.05/sec (480p, standard) to $0.25/sec (1080p, v1.5); consumer SuperGrok $30/mo. Consumer watermark included, not removable. — docs.x.ai, zeely.ai
- Distribution: grok.com/imagine, iOS/Android Grok apps, xAI API (`grok-imagine-video-1.5`).

### 1.3 Runway
- **Series E**: **$315M at $5.3B valuation**, closed **Feb 10, 2026**, led by General Atlantic, with NVIDIA, Fidelity, AllianceBernstein, Adobe Ventures, Mirae Asset, Emphatic Capital, Felicis, Premji Invest, AMD Ventures. Up from $3.3B at the $308M Series D (Apr 2025). — [TechCrunch](https://techcrunch.com/2026/02/10/ai-video-startup-runway-raises-315m-at-5-3b-valuation-eyes-more-capable-world-models/), 2026-02-10
- **Gen-4.5** (Dec 2025): native audio gen/edit, multi-shot editing (propagate a scene change across the whole video), character consistency, long-form. Rendering flaws remain: objects randomly disappear/reappear, causality sometimes shown before its cause.
- **GWM-1** ("General World Model," announced with the raise): autoregressive, frame-by-frame, realtime, controllable via camera pose/robot commands/audio. Three post-trained variants: GWM Worlds, GWM Avatars, GWM Robotics.
- **Runway Characters** (realtime conversational avatar product, engineering post May 4, 2026): 24fps, ~37ms/frame, 1.75s end-to-end turn latency, stable >40min continuous generation, **API session cap 300s (5 min)**. See scratch notes §0.4 for full latency breakdown — this is the single best-documented "realtime generative video actually works" data point in the market.
- **Promised vs. shipped**: promised "world models for universal simulation" at the Series E; shipped a strong cinematic model (Gen-4.5) plus a narrow, genuinely realtime avatar product (Characters) — not yet a general explorable world model at consumer scale.

### 1.4 Luma AI
- **Series C**: **$900M at ~$4B valuation**, closed **Nov 19, 2025**, led by HUMAIN (Saudi PIF), with a16z, Amplify, Matrix, AMD Ventures, AWS. Total raised **~$1.06–1.1B**. — startupintros.com, CNBC Disruptor 50 (2026-05-19)
- **Ray3** (Sept 2025): "world's first reasoning video model," native HDR, spatial/temporal/narrative-logic-aware. **Ray 3.14** (Jan 2026 update): native 1080p, 4x faster gen, up to 18s clips at 24fps.
- **Distribution**: Adobe Firefly partnership (Ray2/Ray3/Ray3 HDR/Ray3.14/Ray3.14 HDR all selectable partner models in Firefly, up to 4K per Adobe help docs). 30M+ users on Dream Machine. Also launched **Luma Agents** (Mar 2026) for end-to-end multi-modal creative orchestration, and **Dream Lab LA** innovation studio.
- **Pricing**: Free (~limited/day) to Enterprise $149.99/mo for 4K.
- **Copyright flag**: June 2024 "Monster Camp" viral demo drew Pixar-similarity accusations; company says root cause was an uploaded reference image, not scraped training data.

### 1.5 Pika Labs
- **Funding stalled relative to peers**: ~$135M total raised across 4-6 rounds (Series B, $80M, Jun 2024, led by Spark Capital) at a **$470–700M valuation** — no new priced round since June 2024 through Sept 2026, a notable divergence from Runway/Luma/Higgsfield's 2026 mega-rounds.
- **Revenue**: $7.6M ARR (2024, per Latka); no more recent public figure found — flag for follow-up.
- **Pika 2.5**: 1080p in ~60-90s, native SFX, 25s clips. Pika Agent + Pika MCP (Feb 2026) for agent-integration.
- **Read for thesis**: Pika is the clearest "left behind" foundation-model player — same 2023 vintage as Runway, but raised ~25x less capital and has been valuation-flat for over two years while Runway 17x'd and Higgsfield 4x'd in the same window.

### 1.6 Kling (Kuaishou / Beijing Dajia)
- **Kuaishou Q2 2026 earnings** (parent company, publicly listed): Kling AI generated **>RMB 850M ($126.4M) quarterly revenue, +200%+ YoY**; H1 2026 revenue **>RMB 1.5B (~$223M)**. Kuaishou overall: RMB 35.5B revenue, RMB 3.9B adjusted net profit, 412.3M DAU. — [PRNewswire](https://www.prnewswire.com/news-releases/kuaishou-technology-announces-second-quarter-and-interim-2026-unaudited-financial-results-302855081.html)
- **Users**: surpassed **100M global users**, 224 countries, ~50,000 enterprise clients (as of June 2026 2nd-anniversary post). 26 model iterations since June 2024 launch.
- **Spin-off financing**: completed **~RMB 19B (~$2.8B) round in July 2026** at an **~$18B post-money valuation** (narrowed down from an initial $20B target set in April 2026), with Tencent, Alibaba, Baidu among new investors, reducing Kuaishou's stake to ~68%. Kuaishou plans a Kling AI **Hong Kong IPO within 12 months**. — SCMP, 2026
- **Kling 3.0 / 3.0 Omni** (Apr 2026): world's first native 4K (3840×2160) video model claim, up to 6 shots/prompt, native audio, physics-driven camera movement, up to 15s. Both integrated into Adobe Firefly as partner models. **Kling 3.0 Turbo** launched Q2 2026.
- **Pricing**: $10/mo (660 credits) to $180/mo Ultra (26,000 credits); ~$0.10/sec API.
- **Read for thesis**: Kling is arguably the single biggest beneficiary of Sora's death — a public, profitable, cash-generative parent company backing a video-AI unit now valued near $18B with real triple-digit revenue growth, positioning for its own IPO.

### 1.7 MiniMax Hailuo
- **Went public**: Hong Kong IPO **Jan 9, 2026**, raised **~$619M**, share price +109% day one to a **~$13.5B market value** (some sources: $9B immediate post-listing). Investors/backers include MiHoYo, Alibaba, Tencent, Hillhouse, HongShan, IDG. — Caproasia, 2026-01-09
- **Hailuo AI**: consumer video product, built on a 456B-param MoE architecture. **Hailuo 2.3** (early 2026, current flagship): improved physics/micro-expressions; **H3** (omni-modal, native stereo audio, 2K res, up to 15s) launched with plans to open-weight it. 1080p, up to 10s clips.
- **Read for thesis**: MiniMax is the only pure-play generative-video-adjacent company to have completed a public listing as of Sept 2026 — a real proof point that the category can reach public-market scale, at least in China's capital markets.

### 1.8 Vidu (Shengshu Technology)
- Three financing rounds in 2026 alone: **RMB 600M+ Series A+ (Feb 2026)**; **~RMB 2B (~$290–293M) Series B led by Alibaba Cloud (Apr 2026)**, valuation **>$2B**, with TAL Education, China Investment Corp, Baidu Ventures participating; **$500M additional round (Jul 2026)** — "largest single financing in China's general world model field" per 36kr. — Reuters, CNBC, 2026-04-10
- **Hong Kong IPO planned**: reportedly targeting **>$500M raise**, filing expected as early as 2027; would be the **first Chinese video-generation company to IPO** if it beats Kling to market. — 36kr, 2026-08-18
- **Product**: Vidu Q1/Q2/Q3 models; Reference-to-Video (industry-first multi-entity consistency, Jul 2024). Vidu Q3 Pro ranks top-10 globally per Artificial Analysis (Jan 2026).
- **Strategic framing**: explicitly positions as building toward "general world models" bridging video generation and physical-world simulation (autonomous driving, robotics) — same narrative arc as Odyssey/World Labs/Decart.

### 1.9 Higgsfield
- **Series B**: **$400M at $5.4B valuation**, announced **Aug 17, 2026**, led by DST Global, with Tribe Capital, Goldman Sachs Alternatives, Smash Capital, Fifth Wall, Valor Capital, Intel Capital, and others. Quadrupled the **$1.3B valuation** it reached in its Series A + extension just 8 months earlier (~Jan 2026). — [TechCrunch](https://techcrunch.com/2026/08/17/higgsfield-raises-400m-series-b-quadrupling-its-valuation-in-8-months-to-5-4b/)
- **Revenue**: **$700M annualized revenue** (Aug 2026, most recent 4 weeks annualized), up from ~$20M a year earlier — a **35x YoY increase**. ~70% subscription, 30% on-demand credits; operates **around break-even**. — Inc.com interview with Higgsfield PR
- **Users**: >30M users, 200-238 countries. Founded 2023 by ex-Snap exec Alex Mashrabov.
- **Products**: Cinema Studio (AI film direction tools), Marketing Studio (ad/marketing production), premiered AI-generated films at Cannes and in NYC.
- **Read for thesis**: Higgsfield's revenue trajectory (>30x YoY) and near-breakeven operation while still hyperscaling is the single most extreme growth data point in this entire catalog — worth direct comparison against Sora's inverse trajectory (both are "AI video app," one died, one is at $700M ARR).

### 1.10 Adobe Firefly Video (aggregator strategy, not a model)
- Adobe's strategy is explicitly **not to compete on frontier video models** but to be the **neutral aggregation layer**: Firefly Video Editor now embeds 30+ partner models (Kling 2.5/3.0/3.0 Omni, Ray2/Ray3/3.14 (+HDR variants), Runway Gen-4.5, Sora 2, Veo 2/3.1/3.1 Fast, Nano Banana 2) alongside Adobe's own Firefly Video model. — [Adobe blog](https://blog.adobe.com/en/publish/2026/04/15/adobe-extends-leadership-video-unleashing-new-ai-powered-creation-firefly-reinventing-color-editors-in-premiere), 2026-04-15
- New: **Color Mode** in Premiere (beta, Apr 2026), **Frame.io Drive** desktop app.
- **Read for thesis**: Adobe is running the "arms dealer" playbook — indemnification + distribution + editing moat, letting frontier labs compete on model quality while Adobe owns the professional workflow surface. This is a structurally different bet than any single-model company in this list.

### 1.11 Meta — Movie Gen / Vibes
- **Movie Gen**: 30B-param video model (research, unveiled late 2024), 1080p up to 16s @16fps, separate 13B-param audio model (synced SFX/ambient/music up to 45s). **Not released for open developer use** — folded into consumer product only.
- **Vibes**: consumer AI-video feed, launched inside Meta AI app **Sept 25, 2025**; expanded to Europe Nov 2025; **spun out into a standalone app** (testing phase) confirmed **Feb 5, 2026** — explicitly positioned as a **direct Sora competitor**, timed just weeks after Sora's launch. Currently free; Meta is testing a freemium/subscription model (higher-res exports, longer clips up to 2min, style packs). — [TechCrunch](https://techcrunch.com/2026/02/05/meta-tests-a-standalone-app-for-its-ai-generated-vibes-videos/)
- **Distribution moat**: cross-posts directly into Instagram/Facebook Reels and Stories — the same "distribution over model quality" thesis as Adobe, but for consumer social rather than professional workflows.
- **Read for thesis**: Vibes launched into the same "AI video social feed" category as Sora and is *still alive and expanding* as of Feb 2026, months after Sora's shutdown was announced — suggesting the format itself isn't dead, but only survives when bundled into an existing billions-of-users distribution engine (Instagram/Facebook), which is exactly what Sora lacked.

### 1.12 Stability AI
- **Series B**: **$76M (Aug 25, 2026)**, brings total funding to **$232M** under CEO Prem Akkaraju (joined 2024). New investors: **Electronic Arts, Sony Music Group, Universal Music Group, Warner Music Group**, AMD Ventures, Pacific Alliance Ventures; existing Coatue, Greycroft, Kadmos, Sean Parker, Eric Schmidt. — [Stability AI](https://stability.ai/news-updates/stability-ai-latest-funding-backed-by-entertainment-industry-biggest-names), Variety, TechCrunch, 2026-08-25
- **Strategic pivot**: from general-purpose Stable Diffusion/Stable Video toward **licensed, IP-safe co-development deals** with major labels/studios (UMG, WMG, EA partnerships struck Oct–Nov 2025). Stable Audio 3.0 (fully licensed training data) shipped alongside the raise.
- **Read for thesis**: Stability is pursuing the same "commercially safe, licensed-content" positioning as Moonvalley, but anchored in music/entertainment-label equity partnerships rather than film-studio deals — a hedge against the exact copyright litigation risk Midjourney is now fighting (see §5).

### 1.13 Chinese open/API models — Alibaba Wan, ByteDance Seedance, Tencent Hunyuan
*(Detail also logged in prior scratch file; consolidated here)*
- **Alibaba Wan (Tongyi Wanxiang)**: Alibaba's in-house video model family, offered via Alibaba Cloud Model Studio API; also the strategic/financial backer behind Vidu's Series B and Kling's spin-off round — Alibaba is simultaneously building its own model AND investing in two of its biggest rivals, a hedge-everything posture.
- **ByteDance Seedance / Dreamina / Jimeng**: **Seedance 2.5** launched on **Dreamina** (ByteDance's creative app, integrated with CapCut) — up to **30-second clips**, up to **50 multimodal references** per clip (image/video/audio/text), granular timestamp-level editing. Rolling out to 16+ users across Europe/Asia/Middle East/South America. — dreamina.capcut.com, 2026
- **Tencent Hunyuan Video**: 8.3B-param open-weight video model (HunyuanVideo 1.5), competes directly with Genmo's Mochi and Alibaba Wan in the open-source tier; has "substantially surpassed" Mochi 1 on quality/resolution per independent reviews.
- **Read for thesis**: all three Chinese Big Tech platforms (Alibaba, ByteDance, Tencent) ship video models bundled into existing consumer distribution (Model Studio API, CapCut/Dreamina, WeChat ecosystem) rather than as standalone paid apps — structurally avoiding Sora's "great model, no distribution" trap.

### 1.14 Genmo / Mochi — stalled, not dead
- Founded 2022, ~**$28.4M raised** (NEA-backed). **Mochi 1** (Oct 2024, open-source, 10B params, AsymmDiT architecture) remains labeled **"preview"** as of mid-2026 — **~18 months** with no GA release. Mochi 1 HD (720p) was teased at launch but never shipped as open weights; no Mochi 2 announced. Company blog has gone quiet; hosted `genmo.com/play` still operates and API endpoints are live, but the open-model roadmap looks stalled. — chatforest.com reviews, HuggingFace repo (last updated Sep 2025)
- Capped at 480p / 5.4s / text-to-video only / no audio — now clearly below the open-source frontier (surpassed by Wan2.1, HunyuanVideo, LTX-2).
- **Read for thesis**: Genmo is the clearest "quietly stalled, not formally dead" cautionary case in this catalog — distinct from Haiper (formally shut down) but trending the same direction without new capital or a shipped v2.

### 1.15 Moonvalley (Marey)
- **$154M total raised**: $70M seed (Nov 2024, Khosla/General Catalyst/Bessemer) + **$84M seed extension (Jul 2025)** led by General Catalyst, with CAA, CoreWeave, Comcast Ventures, Khosla, YC. — SiliconANGLE, BetaKit, 2025-07-14
- **Marey**: "world's first commercially safe video model" — trained **exclusively on licensed, high-resolution footage** (Vimeo/YouTube filmmaker licenses, small production companies in NA/West Africa/East Asia), explicitly avoiding the scraped-data legal exposure hitting Midjourney/Stability's older approach.
- **Business model**: per-studio fine-tuning engagements ("just under a dozen" major studio deals in Marey's first 3 months of beta per PitchBook), small one-time licensing fee + per-inference charges, **some deals include a box-office/streaming revenue share**. Positive gross margins on inference (last 6 months as of Oct 2025 report). Runs its own LA production studio, "Asteria."
- **Read for thesis**: Moonvalley is the most direct "Hollywood-safe" alternative to the Midjourney/Disney-Universal-Warner lawsuit dynamic — licensing content upfront rather than defending fair use after the fact.

### 1.16 Krea
- **$83M total raised** (Series B $47M, Apr 2025, Bain Capital Ventures; Series A $33M; seed $3M) at a **$500M valuation** — flat since April 2025 through Sept 2026, no new round found.
- **K2 model** (May 2026): repositioned from "creative design platform" to AI research lab; first proprietary generative model, built on a custom 7-month dataset effort, emphasizes user creative control (sliders, drag-reference images) over pure prompt-to-output.
- Traction: ~20M+ users, ARR ~$8M as of the Apr 2025 round (Systemaic).

### 1.17 Freepik → Magnific (rebrand)
- **Rebranded to Magnific, April 28, 2026** — unifying Freepik (stock assets), Magnific (AI upscaling, acquired May 2024 for a two-person, pre-revenue startup), and other products under one name.
- **$230M ARR, ~half from AI video** (~$115M), **1M+ paying subscribers, 250-290+ enterprise customers** (BBC, Puma, Amazon Prime Video, Guess). **Zero VC funding, ever** — fully bootstrapped and profitable. — TheNextWeb, PRNewswire, 2026-04-28
- **Model-agnostic strategy**: lets users pick from partner video models (Veo 3.1, ByteDance Seedance 2.0) rather than building a proprietary frontier model — same aggregator playbook as Adobe, but bootstrapped.
- **Read for thesis**: Magnific is the strongest evidence in this entire catalog that a profitable, bootstrapped aggregator business can match VC-funded competitors' revenue scale (its $230M ARR beats Synthesia's $200M ARR, achieved with **$0 in outside capital** vs. Synthesia's $200M Series E).

### 1.18 Midjourney (video) — active but under direct legal threat
- Midjourney added video generation to its core image platform; now embroiled in **consolidated copyright litigation** with Disney/Marvel/Lucasfilm/20th Century Fox/Universal/DreamWorks (filed 2025, Case No. 25-cv-05275) and separately Warner Bros/DC/Turner/Hanna-Barbera/Cartoon Network (Case No. 25-cv-08376).
- **Current procedural status (as of research date)**: a magistrate judge (Joel Richlin) ruled **June 15, 2026** to limit Midjourney's discovery request into the studios' own internal AI tools, allowing only "consumer-facing" AI use disclosure. Midjourney filed a motion **June 29, 2026** asking Judge John Kronstadt to overturn that limit, arguing the studios' own internal AI training on unlicensed data is directly relevant to Midjourney's **fair use and "unclean hands"** defenses. Hearing was scheduled for **Aug 17, 2026**. — Variety (2026-07-02), CourtListener filings, ArtNews (2026-07-06)
- **Read for thesis**: this is the single most important active legal case for the entire generative-video sector's business model — a ruling against "fair use" for training on copyrighted characters would directly threaten every model in this catalog trained on internet-scraped video (i.e., everyone except Moonvalley/Stability's newer licensed approach).

---

## 2. REALTIME / WORLD MODELS (interactive, not narrative)

*(Full technical detail — FPS, latency, GPU counts — already logged in `_scratch-genmedia-notes.md`; this section adds funding/business context not previously captured.)*

### 2.1 World Labs / Marble (Fei-Fei Li)
- **$1.23B total raised**: $230M stealth launch (Apr 2024, implied $1B valuation) + **$130M Series A extension (Sept 2024)** + **~$1B round closed Feb 18, 2026**, anchored by a **$200M strategic investment from Autodesk** (advisory role), plus AMD, NVIDIA, Fidelity, Emerson Collective, Sea Limited. Reported (not confirmed) valuation **~$5B**. — Reuters, TechCrunch, 2026-02-18
- **Marble**: turns text/image/video into **persistent, downloadable 3D environments** (different approach from Genie/Odyssey's "generate on the fly as you move" — Marble pre-builds the whole space). Public launch **Nov 12, 2025**; **World API** (developer, credit-based, ~$1/1,250 credits) launched Jan 2026.
- **No disclosed revenue** as of mid-2026 despite the massive raise — an important contrast to Higgsfield/HeyGen/Synthesia, all of which lead with revenue milestones.
- Used part of the Feb 2026 round to **acquire a robotics-simulation startup** — signaling the real commercial target may be robotics/sim, not consumer 3D content, echoing the Decart pattern (§2.3).

### 2.2 Odyssey
- **Series B**: **$310M at $1.45B valuation**, closed **Jun 17, 2026**, led by Natural Capital, with Amazon, GV, AMD Ventures, EQT, IQT. Total raised **$337M** since 2023 seed. Angels: Jeff Dean, Elad Gil, Garry Tan, Guillermo Rauch, Kyle Vogt (Cruise founder). — TechCrunch, Odyssey blog, 2026-06-17
- Founded by **self-driving-car veterans** (CEO Oliver Cameron, CTO Jeff Hawke, ex-Cruise/Wayve). Data-collection method mirrors Google Street View — sent people out with body cameras.
- **Products**: Odyssey-2 Max (physics-accurate general world simulation), **Starchild-1** (first realtime multimodal — audio+video — world model, generates minutes-long interactive rollouts from an image/text prompt), Agora-1 (multi-agent shared world simulation, decouples simulation from rendering), PROWL (RL-driven active-exploration training method).
- **AWS deal**: named preferred cloud, optimizing for **AWS Trainium chips** (a competitive alternative to NVIDIA) as part of the round.
- **Read for thesis**: Odyssey is explicitly targeting "robotics, science, healthcare, education, gaming, defense" as end markets in its own language — gaming/entertainment is one of many verticals, not the central bet, same pattern as Decart and World Labs.

### 2.3 Decart
- (Full detail in prior scratch file.) Key **new** data point this pass: Decart is reportedly **"in advanced talks to be acquired by Anthropic for $6-7B,"** mostly in Anthropic stock, reportedly beating a higher NVIDIA bid — reported by Calcalist, confirmed by Bloomberg/Reuters, **Aug 2026**. If completed, this would be the single largest realtime-generative-video/world-model exit to date, and notably an **AI-lab acquisition, not a media/entertainment company acquisition** — reinforcing that Decart's strategic value is inference/simulation infra, not entertainment content.

### 2.4 Google Genie / Project Genie
- See §1.1. Bears repeating for the "world models" cluster: **720p/24fps/60-second session cap, $250/mo paywall** is the frontier of Big Tech's own interactive world model as of 2026 — materially behind Odyssey's "minutes-long" claims and Decart's "1080p/30fps/<200ms" realtime restyle numbers, suggesting Google is *behind* several well-funded startups on this specific sub-capability despite DeepMind's research lead in the underlying papers.

---

## 3. ENTERPRISE AVATARS / TALKING-HEAD VIDEO

| Signal | HeyGen | Synthesia | Higgsfield (crossover) | Colossyan | D-ID | Hedra | Tavus | Viggle | DeepBrain AI |
|---|---|---|---|---|---|---|---|---|---|
| ARR / Revenue | **$200M ARR** (Jun 2026, doubled in 8mo) | **$150M ARR** (Jan 2026), targeting $200M+ in 2026 | $700M annualized | $10-25M est. | $33.6M ARR (2024) | n/a (organic growth: +196% Google, +1,150% ChatGPT referral rev in 4mo) | n/a | n/a | ~$5-12.8M (disputed across sources) |
| Total raised | **$74.6M** | ~$680M+ cumulative (Series A-E) | $700M+ cumulative to Series B | $28.2M | $48-65.1M (disputed) | $42-44M | ~$64M (incl. $40M Series B, Nov 2025) | ~$19-27M (disputed CAD/USD) | $44-52M (disputed) |
| Last valuation | $500M (Jun 2024, flat) | **$4B** (Jan 2026 Series E) | $5.4B | n/a (Series A stage) | n/a | n/a | n/a | ~$150M (unconfirmed) | n/a |

**HeyGen**: **$200M ARR crossed June 25, 2026**, doubling in 8 months from $100M (Oct 2025). Capital efficiency headline stat: **~$2.70 ARR per $1 raised** — company claims this beats Zoom/Datadog at IPO. Cash-flow break-even; only burned $25M of $74M raised to date. **30M+ users, 196 countries, 175+ languages, 85% of Fortune 100, 118M+ videos created.** Founders Joshua Xu + Wayne Liang; investors Benchmark, BOND, Conviction, SV Angel, Thrive. **No priced round since the $60M Series A ($500M val) in June 2024** — an unusually capital-light path to $200M ARR. — heygen.com blog, Morningstar, Upstarts Media, 2026-06-25

**Synthesia**: **Series E $200M at $4B valuation**, closed **Jan 26, 2026**, led by GV (Google Ventures), nearly doubling the **$2.1B** valuation from just 12 months prior (Jan 2025, $180M round). New investors Evantic, Hedosophia; existing Kleiner Perkins, Accel, NEA, NVentures, Air Street Capital, PSP Growth. **$150M ARR** as of the raise, CFO guided to cross **$200M during 2026**. **Net revenue retention >140%.** Facilitated an **employee secondary sale via Nasdaq's private-markets arm** at the $4B mark. Enterprise clients: Bosch, Merck, SAP; 70-90%+ of Fortune 100 (sources vary). — TechCrunch, CNBC, Tech.eu, 2026-01-26

**Colossyan**: Budapest-founded (2020), $28.2M raised across 3 rounds (Series A Feb 2024, ~$22M, Lakestar-led), enterprise training/L&D focus, direct Synthesia competitor at 1/10th the capital.

**Hour One**: **Acquired by Wix, May 2025**, undisclosed sum, after raising ~$25M. Effectively removed as an independent competitor — one of the only true M&A exits (as opposed to funding rounds or shutdowns) in this entire catalog.

**D-ID**: Tel Aviv, founded 2017. Funding figures disputed across sources ($23M per Latka/2024 revenue disclosure vs. $48-65.1M per Tracxn/PitchBook, which show a **$17.1M later-stage round on May 7, 2026** not reflected in older aggregator data). **$33.6M ARR (2024)**, up from $10M in 2023, 36 enterprise customers, 154 employees (2024 figures — no 2026 update found, flag for follow-up). Real-time conversational agents + talking-head video.

**Hedra**: SF, founded 2024. **$42-44M total raised** (Series A $32M, May 2025, a16z Infra-led + a16z speedrun/Abstract/Index; seed rounds Aug 2024 + Mar 2025; AWS GenAI Accelerator, Oct 2025). **Character-3**: omnimodal (text+image+audio) model, up to **10-minute** long-form character videos (unusually long vs. peers' seconds-scale outputs), **Live Avatars** realtime feature at **$0.05/min**. **3M+ users, 10M+ videos generated.** Notable: **organic marketing/SEO case study** shows ChatGPT-referred revenue +1,150% and Gemini-referred +180% in 4 months (Jun 2026) — an early, concrete data point on AI-assistant-as-distribution-channel for consumer AI tools.

**Tavus**: SF, founded 2020 (YC S21). **$40M Series B (Nov 2025, CRV-led)**, ~$64M total, with Scale Venture Partners, Sequoia, Y Combinator, HubSpot Ventures, Flex Capital. **Conversational Video Interface (CVI)**: modular realtime pipeline — Raven (perception) → Sparrow (turn-taking/conversational flow) → STT → LLM → TTS → Phoenix (realtime face rendering). 100,000+ developers/enterprises incl. Amazon, Deloitte, EY, Mayo Clinic, CVS, Salesforce, Aetna, Wix. Positions itself as "Human Computing" infra layer, not a consumer app — closer to an API/infra play than HeyGen/Synthesia's product-led model.

**Viggle**: Toronto, founded 2022 by Hang Chu (ex-Autodesk ML/Nvidia researcher, U Toronto PhD under Raquel Urtasun/Sanja Fidler). **$19-27M Series A** (Aug 2024, a16z-led, with Two Small Fish). **JST** (proprietary "video-3D foundation model" with physics understanding) → **JST-2** now powers a developer API. **V4** model (Feb 2026): improved complex motion, character consistency, Character Refine/Smooth Motion/Foot Lock controls. Motion-transfer/character-animation niche, distinct from full text-to-video generalists. Post-Series A valuation ~$150M reported but unconfirmed.

**DeepBrain AI**: Palo Alto/South Korea, founded 2016. **$44-52M total** (Series B $44M, Aug 2021, Korea Development Bank-led) — **no new funding round since 2021**, a long funding gap relative to 2024-26 peers. Revenue figures disputed: LinkedIn shows $5M annual revenue; other sources $12.8M (2024). **April 2026**: launched Real-Time Interactive AI Avatars on its AI STUDIOS platform for enterprise (insurance, retail conversation training).

---

## 4. UGC AD VIDEO GENERATORS

**Arcads.ai**: French (Málaga-adjacent founder base), founded Jan 2024 by Romain Torres + Dylan Fournier. **Fully bootstrapped until Dec 17, 2025**, then raised a **$16.41M seed** led by Eurazeo, with Alpha Intelligence Capital, Sequoia Scout. Revenue trajectory: $1M ARR (Jun 2024) → $6M (May 2025, team of 5) → $10M (Nov 2025, team of 8) → **$15M (2026)**. 6,000+ paying customers, some paying **>$100K/year**. AI-actor-based video ads, replacing traditional human UGC creators. — Arcads blog, Latka, 2025-12-17

**Creatify**: Mountain View, founded 2023. **$18.5M total raised** — $3M seed (Aug 2023) + **$15.5M Series A (Jun/Jul 2026)** co-led by WndrCo and Kindred Ventures; **Jeffrey Katzenberg (DreamWorks co-founder) joined the board.** **$9M ARR reached in 18 months**, 1.5M registered users, 10,000-16,000+ teams (Alibaba, Comcast, HubSpot cited as customers). Converts product links directly into video-ad commercials; new **AdMax** system adds AI agents that optimize creative based on live ad performance data. — aivideoadvisor.com, LinkedIn, 2026-07

**Captions → rebranded "Mirage" (Sept 2025)**: NYC, Series C $60M (Jul 2024, Index Ventures-led) at **$500M valuation** — then **$75M non-dilutive growth financing from General Catalyst's Customer Value Fund (Mar 24, 2026)**, bringing total to **>$175M**. Explicit repositioning from "consumer captioning/editing app" to **"full-stack AI video platform and research lab"** building foundational short-form-video models, expanding aggressively into Asia. Competes directly with Synthesia, HeyGen, ByteDance's CapCut, Canva. — Slator, SuperbCrew, 2026-03-24

**Supercreator.ai**: **SUNSET / DEAD.** LA-founded 2021, only $1.1-1.15M raised (small seed, Serpentine Ventures/Benson Oak Ventures). Company's own website now reads: *"Supercreator has been sunset... The product is no longer active."* No specific date found for the shutdown, but confirmed inactive as of this research pass (Sept 2026). — supercreator.ai (live site check)

---

## 5. GENERATIVE FILM / SERIES / PERSONALIZED STORY

**Showrunner (Fable Studio)**: covered in detail in `agent-market-researcher-gen-entertainment.md` §0.7 — public alpha since Jul 2025, SHOW-2 model, Amazon Alexa Fund-backed, $10-40/mo creator credits + 40% creator revenue share on remixes, animation-only by design (compute-cost-driven choice). No 2026 update on user scale found in this pass — flag for follow-up if pursuing this specific comp.

**Wonder Dynamics → Autodesk Flow Studio**: acquired by Autodesk (2024); **fully absorbed and rebranded "Flow Studio," Aug 2025**; **freemium tier launched Aug 12, 2025** (first-ever free tier; Lite plan cut from $20→$10/mo). **Full account/billing migration to Autodesk completed May 4, 2026** — the original Wonder Dynamics brand/portal is now fully retired. Converts live-action footage into editable 3D/CG scenes (motion capture, camera tracking, alpha mattes) exportable to Maya/Blender/Unreal/3ds Max via USD. Read for thesis: this is a **clean, completed startup-into-incumbent integration** — a useful "what a good outcome actually looks like" comp against Wonder Dynamics' AI-video peers still fundraising independently.

**Netflix / Disney / Warner** (studio-side, not startups — covered exhaustively in `agent-market-researcher-gen-entertainment.md` §0.6): ~300 titles used GenAI workflows in 2026 (Q2 earnings call); **$587M InterPositive (Ben Affleck) acqui-hire, 16 employees** (~$36.7M/head); Sarandos' framing explicitly anti-generative-consumer ("faster and cheaper doesn't matter if it's not better"). Disney/Universal/Warner are suing Midjourney (§1.18) even as they experiment with GenAI internally — the exact tension Midjourney's discovery motion is trying to expose.

---

## 6. INFRASTRUCTURE & DISTRIBUTION

**fal.ai**: SF, founded 2021 by Burkay Gur (Coinbase's first ML hire) + Gorkem Yurtseven (ex-Amazon SageMaker). Fastest-scaling company in this entire catalog by revenue velocity: **~$400M annualized revenue as of Feb 2026** (up from ~$285M end-2025, ~$25M end-2024 — **1,040% YoY**). **$140M Series D at $4.5B (Dec 2025, Sequoia-led)**; as of **Mar 2026 in advanced talks for $300-350M at ~$8B valuation** (unconfirmed, two-tranche structure). Total raised **~$587-592M**. **AWS named preferred cloud (May 2026)**; 2.5M+ developers, 600+ models hosted, customers incl. Adobe, Canva, Amazon MGM Studios, Quora, Perplexity. — Sacra, Dealroom, TBPN, 2026-03
- **Read for thesis**: fal.ai is the clearest "picks and shovels" winner in generative video — it doesn't need any single frontier model to win, since it hosts (and takes a margin on) nearly all of them. Its ~$8B valuation-in-talks would put it *above* every model company in this catalog except Luma, Runway, Kling's new round, and Higgsfield.

**Twelve Labs**: SF/Seoul, founded ~2021 by Jae Lee. **$100M Series B, Jul 1, 2026**, co-led by NEA + NAVER Ventures, with **Amazon** (also a strategic AWS Trainium commitment), Radical Ventures, Korea Investment Partners, Index Ventures, Quadrille Capital, Red Bull Ventures. **$207M total raised.** Products: **Marengo 3.0** (video understanding/semantic search across sound/speech/motion) + **Pegasus 1.5** (structured video → scene boundaries/entities/temporal segments, "domain-specific language for video understanding"), both distributed via Amazon Bedrock. Positions itself as building toward "Video Superintelligence" — **video-native cognition, not video generation.** This is the understanding/search complement to the generation-focused companies above, not a competitor to them.

**Livepeer**: Decentralized GPU/video-compute protocol, founded 2017. **"Livepeer 2.0"** protocol redesign (proposed mid-2026, "A Path to Livepeer 2.0" forum post): introduces **Burn-Mint-Equilibrium (BME)** tokenomics — network fees paid in USD are used to buy and burn LPT, directly linking token value accrual to network usage for the first time (addressing a long-standing complaint that inflationary LPT emissions were disconnected from demand). Removes the 100-orchestrator cap in favor of fixed per-node bonds + a stake-elected validator set. New **Livepeer Agent**: an open-source MCP connector letting any AI agent call into Livepeer's network of independent GPU providers for video generation/transformation tasks. **Community sentiment is mixed-to-skeptical** — a forum thread titled "I lost $350,000 in this project, any advice?" (long-time LPT holder since 2021) reflects real investor frustration with historical tokenomics, which the Livepeer Foundation (Doug Petkanics, CEO) is trying to address via BME. — livepeer.org, Livepeer Forum, 2026
- **Read for thesis**: Livepeer is the only **decentralized/crypto** infra play in this catalog — a genuinely different capital structure (token-based, permissionless GPU marketplace) than every VC-funded centralized competitor (fal.ai, Runway, etc.), but its investor base is openly and publicly frustrated on its own forums, a useful crypto-market-structure cautionary counterpoint to fal.ai's clean equity-round scaling story.

**YouTube Dream Screen** — see §1.1. **TikTok / CapCut / Dreamina (ByteDance)** — see §1.13.

---

## 7. DEAD / SHUT DOWN / SUNSET (explicit tracker per user's "verify, don't repeat rumors" instruction)

| Company | Status | Evidence |
|---|---|---|
| **OpenAI Sora** | **KILLED.** App discontinued Apr 26, 2026; API sunsets Sep 24, 2026 (i.e., this month); no replacement listed. | Multiple corroborating sources, §0 above |
| **Haiper AI** | **DEAD** (consumer product). Web app went offline **Feb 2025** (404s, no warning, no migration path, ~4.5-6.5M users stranded). Founders (Yishu Miao, Ziyu Wang) joined **Microsoft AI, Mar 2025** (acqui-hire pattern, no formal Microsoft acquisition). Underlying models sold to **NetMind.AI, Jun 2025** for B2B-only use (api.haiper.ai still live for enterprise). ~$19.2M total raised, peaked 6.5M users (Dec 2024). | fluxnote.io, chatforest.com, plisio.net — cross-corroborated |
| **Supercreator.ai** | **DEAD/sunset.** Company's own site confirms shutdown; only ~$1.1M ever raised. | supercreator.ai live site |
| **Hour One** | Not dead — **acquired by Wix (May 2025)**, folded in as a feature/division. | — |
| **Wonder Dynamics** | Not dead — **fully absorbed into Autodesk as Flow Studio**, brand retired but product thriving with a new freemium tier. | — |
| **Genmo/Mochi** | **Not formally dead, but stalled** — 18 months on a "preview" label, no v2, quiet blog, surpassed by newer open models. Still operating hosted playground/API. | chatforest.com, HuggingFace |
| **Character.AI** | Out of scope for this pass — primarily a text/companion-chat product, not a video-generation platform; **no material video/generative-film feature found** in this research session. Excluded from the main catalog below; flag for a dedicated follow-up if the user wants interactive-character-chat-as-story covered separately. |
| **"Enway"** | Could not identify a company matching this name in the generative video/film space with confidence — likely a typo or an obscure/pre-launch entity not indexed in searches performed this session. **Excluded rather than guessed**, per instruction not to repeat unverified claims. |

---

## 8. SOURCE LOG (this session's new searches — see also two pre-existing raw files for additional sources already logged)

- techcrunch.com/2026/02/10 (Runway Series E)
- runway.com/news/runway-series-e-funding
- news.crunchbase.com (Runway)
- siliconangle.com/2026/02/10 (Runway/World Labs cross-reference)
- runway.com/research/introducing-runway-gwm-1
- fast.io/resources/luma-ai-review-2026
- startupintros.com/orgs/luma-ai
- lumalabs.ai/news/ray3
- siliconvalleyinvestclub.com/companies/luma-ai
- cnbc.com/2026/05/19 (Luma Disruptor 50)
- chatforest.com/reviews/pika-labs-ai-video-generation-consumer-creative
- morphed.app/stats/pika-statistics
- getlatka.com/companies/pika
- ainvasion.com/pika-labs
- hokai.io/hub/companies/minimax
- en.wikipedia.org/wiki/MiniMax_Group
- barchart.com (Hailuo review Jul 2026)
- caproasia.com/2026/01/09 (MiniMax IPO)
- minimax.io/blog/minimax-h3
- techcrunch.com/2026/08/17 (Higgsfield Series B)
- prnewswire.com (Higgsfield)
- inc.com (Higgsfield economics interview)
- prnewswire.com/news-releases/shengshu-technology (Vidu Series A+)
- eu.36kr.com/en/p/3947480095430272 (Vidu HK IPO plan)
- cnbc.com/2026/04/10 (Alibaba/Vidu)
- reuters.com/world/asia-pacific (Vidu Series B)
- x.ai/news/grok-imagine-video-1-5
- cometapi.com/grok-imagine-video1-5
- docs.x.ai (Grok video generation, pricing, model card)
- zeely.ai/blog/grok-imagine-video
- blog.adobe.com/en/publish/2026/04/15 (Firefly video partner models)
- adobe.com/products/firefly/partner-models/kling-ai.html
- helpx.adobe.com (Firefly partner model docs, updated Jun 16 2026)
- klingai.com/blog/kling-v3-vs-o3-comparison-guide
- heygen.com/blog/heygen-surpasses-200m-arr
- morningstar.com (HeyGen)
- upstartsmedia.com (HeyGen exclusive)
- getlatka.com/companies/heygen
- systemaic.com/teardowns/heygen
- techcrunch.com/2026/01/26 (Synthesia Series E)
- cnbc.com/2026/01/26 (Synthesia)
- tech.eu/2026/01/26 (Synthesia)
- askcyborg.com/preview/synthesia
- linkedin.com/pulse (avatar market cross-comp post)
- tavus.io/lp/ai-info-page
- tavus.mintlify.app (CVI docs)
- docs.tavus.io (API docs)
- globenewswire.com/2025/05/15 (Hedra Series A)
- einpresswire.com (Hedra SEO case study)
- geo.sig.ai/brands/hedra
- cbinsights.com/company/hedra/financials
- pitchbook.com/profiles/company/539726-23 (Hedra)
- tracxn.com (D-ID, Colossyan profiles)
- pitchbook.com (D-ID)
- getlatka.com/companies/d-id
- businesswire.com/2024/08/26 (Viggle Series A)
- cbinsights.com/company/viggle-ai/financials
- siliconangle.com/2024/08/26 (Viggle)
- viggle.ai/blog/everything-you-need-is-in-viggle-v4
- chatforest.com/reviews/viggle-ai-character-animation-motion-transfer
- getlatka.com/companies/arcads.ai
- cbinsights.com/company/arcads/financials
- arcads.ai/nl/blog/arcads-raises-16m-seed
- aivideoadvisor.com (Creatify Series A)
- linkedin.com/company/creatify-ai
- odyssey.ml/our-series-b
- press.airstreet.com/p/odyssey-series-b
- techcrunch.com/2026/06/17 (Odyssey)
- morningstar.com (Odyssey)
- reuters.com/business/ai-pioneer-fei-fei-lis-world-labs (World Labs $1B)
- hokai.io/hub/companies/world-labs
- techcrunch.com/2026/02/18 (World Labs/Autodesk)
- valueaddvc.com (World Labs valuation deep dive)
- startuphub.ai (World Labs funding breakdown)
- globenewswire.com/2026/07/01 (Twelve Labs Series B)
- finsmes.com (Twelve Labs)
- twelvelabs.io/blog/twelvelabs-series-b-100m
- siliconangle.com/2026/07/01 (Twelve Labs)
- startupfortune.com (Twelve Labs/Amazon)
- livepeer.org/blog/livepeer-2-0-video-agent-platform
- livepeer.org (homepage)
- forum.livepeer.org (BME thread, path-to-2.0 thread, investor complaint thread)
- siliconangle.com/2025/07/14 (Moonvalley $84M)
- moonvalley.com/marey
- betakit.com (Moonvalley)
- pitchbook.com/news/articles (Moonvalley Hollywood profile)
- thelogic.co/news/moonvalley-ai-hollywood-copyright
- sacra.com/c/fal-ai
- rywalker.com/research/fal
- startupintros.com/orgs/fal
- dealroom.co/news/126961 (fal.ai $8B talks)
- tbpndigest.com (fal.ai)
- techcrunch.com/2025/04/07 (Krea $83M)
- app.dealroom.co (Krea K2 launch)
- tracxn.com/d/companies/krea (Krea)
- systemaic.com/teardowns/krea
- tooljunction.io (Krea)
- thenextweb.com/news/freepik-rebrands-as-magnific
- mapco.ai/company/freepik
- catenaa.com (Magnific)
- prnewswire.com (Freepik/Magnific rebrand)
- the-ai-corner.com/p/the-story-of-magnific
- variety.com/2026/film/news (Midjourney discovery motion)
- storage.courtlistener.com (Midjourney court filings, x2)
- artnews.com (Midjourney/Disney)
- getlatka.com/companies/arcads.ai (dup, see above)
- captions.ai/blog (Captions Series C, historical)
- businesswire.com/2024/07/09 (Captions Series C)
- slator.com/mirage-gets-75m-general-catalyst
- superbcrew.com (Mirage $75M)
- exa.ai/websets/directory/captions-funding
- investors.autodesk.com (Flow Studio freemium launch)
- autodesk.com/products/flow-studio/overview
- autodesk.com/support (Flow Studio Q&A, migration timeline)
- neowin.net (Autodesk Flow Studio)
- linkedin.com/pulse (Wonder Dynamics AI motion capture interview)
- reuters.com/business/facetune-creator-lightricks (Lightricks split)
- en.globes.co.il (LTX spinoff)
- prnewswire.com/news-releases/lightricks-releases-ltx-2
- github.com/Lightricks/LTX-2
- calcalistech.com (Lightricks split, jobs cut)
- tracxn.com/d/companies/deepbrain (x2, profile + funding)
- precedenceresearch.com/ai-avatar-market
- linkedin.com/company/deepbrain-global
- neuronfeed.com/startups/deepbrain-ai
- prnewswire.com/news-releases/kuaishou-technology (Q2 2026 earnings)
- finance.biggo.com (Kling revenue detail)
- growwingassistant.com (Kling June 2026 update)
- baike.baidu.com (Kling AI history/timeline)
- scmp.com/tech/big-tech (Kling $18B round)
- stability.ai/news-updates (Stability Series B)
- techcrunch.com/2026/08/25 (Stability AI)
- variety.com/2026/biz/news (Stability AI)
- simplify.jobs (Stability AI overview/risks)
- linkedin.com/posts/jesselandry23 (Bria AI cross-reference, not a primary subject)
- fluxnote.io/guides/what-happened-to-haiper-ai
- zuloai.com/blog (Haiper)
- chatforest.com/reviews/haiper-ai-video-generation-retrospective
- plisio.net/ai/haiper-ai
- smartpostly.com (Haiper)
- theverge.com/news/612031 (YouTube Dream Screen/Veo 2)
- blog.youtube/news-and-events/veo-2-shorts
- support.label-worx.com (Dream Screen)
- dexerto.com (Dream Screen how-to)
- dreamina.capcut.com/resource/seedance-2-5-launch
- techcrunch.com/2026/02/05 (Meta Vibes standalone app)
- en.eloutput.com (Meta Vibes)
- ubos.tech (Meta Vibes)
- felloai.com/meta-ai-video-generator (Movie Gen specs)
- musthave.ai (Meta AI video trust analysis)
- tracxn.com/d/companies/genmo (Genmo profile)
- linkedin.com/company/genmoai
- chatforest.com/reviews/mochi-1-genmo (x2 reviews)
- huggingface.co/genmo
- supercreator.ai (live site, confirms shutdown)
- tracxn.com (Supercreator.ai, x2)
- upmarket.co (Supercreator pre-IPO listing, stale)
- linkedin.com/company/supercreator-ai
