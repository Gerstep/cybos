# Generative Video, Film, Series, UGC, Avatars & Personalized Story: Company Catalog

**Date**: 2026-09-01 | **Recency bias**: 2026 news prioritized, especially Jul–Sep | **Companies cataloged**: 47 (+ 2 explicitly excluded/unverified, flagged at the end)
**Method**: WebSearch, primary sources (company blogs, press releases, court filings, earnings calls) preferred over secondary aggregators (Crunchbase/PitchBook/Tracxn/CBInsights) where they conflict. Every material figure is dated and sourced. Full raw notes, source log, and additional technical/benchmark detail: `raw/agent-company-researcher-gen-video.md`, `raw/_scratch-genmedia-notes.md`, `raw/agent-market-researcher-gen-entertainment.md`.

---

## How to read this

1. **Master table** below — all 47 companies/products, key facts at a glance, sorted by category.
2. **Paragraphs** organized by subsegment — one per company, with what was promised vs. shipped, funding, retention/cost where known, and 2026 status.
3. **The Sora verdict** (§0, top of paragraphs) — explicitly answers the user's request to verify "alive/killed/limited."
4. **Excluded/unverified** section at the end — Character.AI and "Enway" were not included with confidence; see why.

---

## 0. THE SORA VERDICT (verify before reading anything else)

**OpenAI Sora: KILLED.** Not limited, not paused — shut down. Announced **2026-03-24**; consumer web/app discontinued **2026-04-26**; API in maintenance-only mode until it fully sunsets **2026-09-24** (i.e., later *this month*, relative to this report's date); OpenAI's own deprecations page lists **no replacement**. Standalone app made **$2.1M lifetime revenue** against **~$1M/day** peak inference cost; retention **D1 10% / D30 1% / D60 ≈0%** (vs. TikTok's D1 50/D30 32); downloads fell 66% Nov 2025→Feb 2026; Disney publicly exited within hours of the shutdown news. Full evidence chain in raw files. **Do not cite "Sora" as a going concern in any 2026-forward slide.**

---

## Master Table

| # | Name | Category | HQ | Founded | Stage | Latest funding / revenue signal | Status (Sep 2026) |
|---|---|---|---|---|---|---|---|
| 1 | OpenAI Sora | Foundation model | US | 2024 | N/A | N/A | **Dead — shut down 2026-04-26, API off 2026-09-24** |
| 2 | Google Veo (+ Project Genie) | Foundation model / world model | US | Big Tech BU | N/A | N/A | Alive — Veo 3.1 shipping; Genie a $250/mo research preview |
| 3 | xAI Grok Imagine | Foundation model | US | Big Tech BU (xAI) | N/A | N/A | Alive — Video 1.5 GA'd Jun 2026 |
| 4 | Runway | Foundation model / world model | US | 2018 | Series E | $315M @ $5.3B (Feb 2026) | Alive — Gen-4.5 + GWM-1 + realtime Characters |
| 5 | Luma AI | Foundation model | US | 2021 | Series C | $900M @ $4B (Nov 2025) | Alive — Ray3.14, 30M+ users |
| 6 | Pika Labs | Foundation model | US | 2023 | Series B (stale) | $135M @ $470-700M (Jun 2024, flat) | Alive — funding-starved vs. peers |
| 7 | Kling (Kuaishou) | Foundation model | China | 2024 | Spin-off round | ~$2.8B @ $18B (Jul 2026) | Alive — $126M quarterly rev, +200% YoY, IPO planned |
| 8 | MiniMax Hailuo | Foundation model | China | 2021 | Public (HKEX) | $619M IPO @ $13.5B (Jan 2026) | Alive — publicly listed |
| 9 | Vidu (Shengshu) | Foundation model / world model | China | 2023 | Series B+ | $500M (Jul 2026), >$2B val | Alive — HK IPO planned |
| 10 | Higgsfield | Foundation model | US | 2023 | Series B | $400M @ $5.4B (Aug 2026) | Alive — $700M annualized rev, near-breakeven |
| 11 | Adobe Firefly (video) | Aggregator | US | Big Tech BU | N/A | N/A | Alive — 30+ partner models incl. Sora 2 (still listed) |
| 12 | Meta Movie Gen / Vibes | Foundation model + consumer app | US | Big Tech BU | N/A | N/A | Alive — Vibes spun into standalone app, Feb 2026 |
| 13 | Stability AI | Foundation model | US | 2019 | Series B | $76M (Aug 2026), $232M total | Alive — pivoted to licensed music/entertainment IP |
| 14 | Alibaba Wan (Tongyi Wanxiang) | Foundation model | China | Big Tech BU | N/A | N/A | Alive — API via Alibaba Cloud Model Studio |
| 15 | ByteDance Seedance / Dreamina | Foundation model | China | Big Tech BU | N/A | N/A | Alive — Seedance 2.5, in CapCut/Dreamina |
| 16 | Tencent Hunyuan Video | Foundation model | China | Big Tech BU | N/A | N/A | Alive — 8.3B open-weight model |
| 17 | Genmo / Mochi | Foundation model (open) | US | 2022 | Series A | $28.4M total | **Stalled — 18mo on "preview," no v2** |
| 18 | Moonvalley (Marey) | Foundation model (licensed) | Canada | 2023 | Seed ext. | $154M total (Jul 2025) | Alive — Hollywood studio licensing deals |
| 19 | Krea | Creative platform / model | US | 2022 | Series B (flat) | $83M @ $500M (Apr 2025) | Alive — pivoted to research lab w/ K2 model |
| 20 | Freepik → Magnific | Aggregator | Spain | 2010 | Bootstrapped | $230M ARR, $0 VC | Alive — profitable, no funding ever |
| 21 | Midjourney (video) | Foundation model | US | 2021 | N/A | N/A | Alive — **but in active Disney/Universal/Warner IP lawsuit** |
| 22 | World Labs / Marble | World model | US | 2024 | Growth round | $1B (Feb 2026), ~$5B val | Alive — no disclosed revenue |
| 23 | Odyssey | World model | US | 2023 | Series B | $310M @ $1.45B (Jun 2026) | Alive — AWS deal, robotics/AV framing |
| 24 | Decart | World model / infra | Israel/US | 2024 | Series C | $300M @ $4B (May 2026) | Alive — **reportedly in $6-7B Anthropic acquisition talks** |
| 25 | HeyGen | Enterprise avatar | US | 2020 | Series A (flat) | $200M ARR (Jun 2026) | Alive — cash-flow break-even, capital-efficient |
| 26 | Synthesia | Enterprise avatar | UK | 2017 | Series E | $200M @ $4B (Jan 2026) | Alive — $150M+ ARR, NRR >140% |
| 27 | Colossyan | Enterprise avatar | Hungary | 2020 | Series A | $28.2M total (Feb 2024) | Alive — smaller-scale peer to Synthesia |
| 28 | Hour One | Enterprise avatar | Israel | 2019 | Acquired | ~$25M raised pre-acquisition | Alive — **acquired by Wix, May 2025** |
| 29 | D-ID | Enterprise avatar | Israel | 2017 | Series B+ | $23-65M (disputed), $33.6M ARR | Alive — realtime conversational agents |
| 30 | Hedra | Enterprise avatar / character | US | 2024 | Series A | $42-44M total | Alive — Character-3, 10-min long-form videos |
| 31 | Tavus | Enterprise avatar / infra | US | 2020 | Series B | $40M (Nov 2025), $64M total | Alive — CVI API, "Human Computing" positioning |
| 32 | Viggle | Character animation | Canada | 2022 | Series A | $19-27M total (Aug 2024) | Alive — motion-transfer niche, JST-2 model |
| 33 | DeepBrain AI | Enterprise avatar | S. Korea/US | 2016 | Series B (stale) | $44-52M total (2021, no new round) | Alive — funding-stale since 2021 |
| 34 | Arcads.ai | UGC ad video | France | 2024 | Seed | $16.4M (Dec 2025), $15M ARR | Alive — bootstrapped-to-profitable, then raised |
| 35 | Creatify | UGC ad video | US | 2023 | Series A | $18.5M total, $9M ARR (18mo) | Alive — Katzenberg on board |
| 36 | Captions → Mirage | UGC / short-form video | US | 2021 | Series C+ | $175M+ total (Mar 2026) | Alive — rebranded, pivoting to foundation models |
| 37 | Supercreator.ai | UGC ad video | US | 2021 | Seed | ~$1.1M total | **Dead — sunset, site confirms shutdown** |
| 38 | Showrunner (Fable Studio) | Generative series/film | US | 2018 | Seed/strategic | Amazon Alexa Fund (undisclosed) | Alive — public alpha since Jul 2025 |
| 39 | Wonder Dynamics → Autodesk Flow Studio | Generative VFX/animation | US | 2020 | Acquired | Acquired by Autodesk 2024 | Alive — absorbed, freemium tier launched 2025 |
| 40 | fal.ai | Infra / inference | US | 2021 | Series D+ (in talks) | $400M ARR, $4.5-8B val range | Alive — fastest-scaling infra company in set |
| 41 | Twelve Labs | Infra / video understanding | US/S. Korea | ~2021 | Series B | $100M (Jul 2026), $207M total | Alive — Amazon-backed, video cognition (not gen) |
| 42 | Livepeer | Infra / decentralized compute | Global (DAO) | 2017 | Token/protocol | N/A (token-based) | Alive — "Livepeer 2.0" tokenomics overhaul underway |
| 43 | YouTube Dream Screen (Veo) | Distribution | US | Big Tech BU | N/A | N/A | Alive — Veo 2 in Shorts creation tools |
| 44 | TikTok / CapCut / Dreamina | Distribution + foundation model | China (ByteDance) | Big Tech BU | N/A | N/A | Alive — Seedance 2.5 bundled into CapCut |
| 45 | Netflix (generative production tools) | Incumbent studio | US | Public | Public (NFLX) | ~300 titles used GenAI in 2026 | Alive — production cost-line, not consumer feature |
| 46 | Disney / Universal / Warner Bros. | Incumbent studios | US | Public | Public | N/A | Alive — suing Midjourney; Disney exited Sora day one |
| 47 | Haiper AI | Foundation model | UK/China | 2021 | Seed | ~$19.2M total | **Dead — consumer app shut down Feb 2025** |

---

## Foundation / Frontier Video Models

**OpenAI Sora** (openai.com, US, launched as a research preview Feb 2024, standalone app Sept 2025) — **DEAD**. See §0 above for the full verdict. The single most important data point in this catalog: the best-funded lab, highest name recognition, and a TikTok-shaped social product died of unit economics (peak ~$1M-15M/day inference cost against $2.1M lifetime revenue) and catastrophic retention (D30 1%, D60 ≈0%) within seven months of its standalone launch, and OpenAI has shipped no announced successor. Every other company in this catalog should be read against this baseline: **what makes them different from Sora?** Sources: rctv.com (2026-04-22), ngram.com, leaxor.com — full detail in raw files.

**Google Veo / Project Genie** (Google DeepMind, Big Tech business unit). Veo 3.1 ships native 4K, 48kHz synced dialogue, SynthID watermarking, Vertex AI enterprise indemnification, and is distributed both direct-to-consumer ($19.99/mo AI Pro) and as a partner model inside Adobe Firefly and YouTube's Dream Screen. Separately, **Project Genie** is Google's interactive world-model research preview: launched **2026-01-29**, gated behind an **$249.99/mo AI Ultra subscription**, hard-capped at **720p/24fps/~60-second sessions** — explicitly "not yet a tool for shipping finished playable games." The two products represent Google's bifurcated strategy: Veo for polished cinematic output at consumer/enterprise scale, Genie for a much earlier-stage, heavily paywalled interactive-world bet that is currently *behind* several better-funded startups (Odyssey, Decart) on session length and realtime interactivity. Sources: Google blog (2026-01-29), TechCrunch, topreviewed.

**xAI — Grok Imagine Video** (x.ai, US, Big Tech BU). **Grok Imagine Video 1.5** reached general availability **2026-06-16**: image-to-video (primary) and text-to-video, up to 15-second clips, up to 1080p, native audio in a single pass, powered by xAI's "Aurora" autoregressive engine. Pricing is transparently published (a rarity in this category): $0.05-0.25/sec via API depending on resolution; $30/mo SuperGrok for consumer access. Distribution leverages the existing Grok/X user base and iOS/Android apps rather than a standalone launch. Sources: x.ai (2026-06-16), docs.x.ai.

**Runway** (runway.com, US, founded 2018, Series E). Raised **$315M at a $5.3B valuation** (2026-02-10, General Atlantic-led, with NVIDIA/Adobe Ventures/Fidelity/AMD Ventures), up from $3.3B just 10 months earlier. **Promised**: "world models for universal simulation." **Shipped**: Gen-4.5 (strong cinematic model with native audio and multi-shot editing, but still shows physics/continuity artifacts) plus **GWM-1**, a genuinely realtime, frame-by-frame autoregressive world model with three post-trained variants (Worlds, Avatars, Robotics). The standout proof point is **Runway Characters** (May 2026): a production realtime conversational-avatar API hitting **24fps, ~37ms/frame, 1.75s end-to-end turn latency, >40 minutes of stable continuous generation** — the best-documented "realtime generative video actually works in production" evidence in this entire catalog, though the API caps sessions at 5 minutes. Sources: TechCrunch (2026-02-10), Runway engineering blog, Amplify Partners.

**Luma AI** (lumalabs.ai, US, founded 2021, Series C). **$900M raised at ~$4B valuation** (2026-01-19 close date reported as Nov 2025 announcement, HUMAIN/Saudi PIF-led), total raised **~$1.06-1.1B**. **Ray3** (Sept 2025, "world's first reasoning video model," native HDR) iterated to **Ray 3.14** (Jan 2026: native 1080p, 4x faster, 18s clips at 24fps). Distributed both direct (Dream Machine, 30M+ users) and via a first-mover Adobe Firefly partnership. Launched **Luma Agents** (Mar 2026) for multi-modal creative orchestration. A June 2024 "Monster Camp" demo drew Pixar-copyright-similarity criticism, which the company attributes to an uploaded reference image rather than training-data scraping. Sources: Reuters, TechCrunch, CNBC Disruptor 50 (2026-05-19).

**Pika Labs** (pika.art, US, founded 2023, Series B). **The clearest "left behind" foundation-model player**: ~$135M total raised (Series B $80M, Jun 2024, Spark Capital-led) at a **$470-700M valuation that has not moved since June 2024** — a 2+ year funding freeze while same-vintage peer Runway grew ~17x and Higgsfield grew ~4x in the same window. Pika 2.5 ships credible product (1080p in 60-90s, native SFX, 25s clips, Pika Agent/MCP) but the company has not disclosed a funding or revenue update since a reported **$7.6M ARR figure from 2024**. Sources: chatforest.com, morphed.app, getlatka.com.

**Kling (Kuaishou / Beijing Dajia Interconnect)** (klingai.com, China, launched June 2024). The **single biggest beneficiary of Sora's death**: parent Kuaishou is a publicly listed, profitable company (Q2 2026: RMB 35.5B total revenue, RMB 3.9B adjusted net profit, 412.3M DAU), and Kling AI itself generated **>RMB 850M ($126.4M) quarterly revenue in Q2 2026, +200%+ YoY**, crossing **100M global users** across 224 countries. In July 2026 Kling completed an independent spin-off financing of **~RMB 19B (~$2.8B) at an ~$18B post-money valuation** with Tencent, Alibaba, and Baidu as new investors, and Kuaishou is targeting a **Hong Kong IPO for Kling within 12 months**. Kling 3.0/3.0 Omni (native 4K, up to 6 shots/prompt, native audio) is a selectable partner model inside Adobe Firefly. Sources: Kuaishou Q2 2026 earnings (PRNewswire), SCMP (2026), baike.baidu.com.

**MiniMax Hailuo** (hailuoai.video, China, founded 2021/2022). The **only pure-play generative-video-adjacent company to complete a public listing** as of Sept 2026: Hong Kong IPO **2026-01-09**, raised **~$619M**, shares +109% on day one to a **~$13.5B market value**. Hailuo AI (video product) runs on a 456B-param MoE architecture; **Hailuo 2.3** is the current flagship, with **H3** (omni-modal, native stereo audio, 2K, up to 15s) newly launched with plans to open-weight it. Backers include Alibaba, Tencent, MiHoYo, Hillhouse. Sources: Caproasia (2026-01-09), Wikipedia, minimax.io.

**Vidu (Shengshu Technology)** (vidu.com, China, founded 2023). Three financing rounds in 2026 alone: RMB 600M+ (Feb), **RMB 2B (~$290M) Series B led by Alibaba Cloud (Apr 2026, >$2B valuation)**, and a further **$500M round (Jul 2026)** — the "largest single financing in China's general world model field" per 36kr. A Hong Kong IPO is reportedly planned (targeting >$500M raise, filing possibly 2027), which would make Vidu the **first Chinese video-generation company to IPO** if it beats Kling to market. Vidu explicitly frames itself as building toward "general world models" bridging video generation with robotics/autonomous driving — the same strategic pivot as Odyssey, World Labs, and Decart. Sources: Reuters (2026-04-10), CNBC, 36kr (2026-08-18).

**Higgsfield** (higgsfield.ai, US, founded 2023 by ex-Snap exec Alex Mashrabov). **The most extreme growth trajectory in this catalog**: **$400M Series B at a $5.4B valuation** (2026-08-17, DST Global-led), quadrupling its own $1.3B valuation from just 8 months earlier. Revenue: **$700M annualized as of Aug 2026, up from ~$20M a year earlier (35x YoY)**, ~70% subscription/30% credits, **operating near break-even**. 30M+ users across 200-238 countries. Products span Cinema Studio (AI film direction) and Marketing Studio (ad production); premiered AI-generated films at Cannes and in New York. Sources: TechCrunch (2026-08-17), PRNewswire, Inc.com.

**Adobe Firefly (video)** (adobe.com, US, Big Tech BU). Not a model company but the **explicit aggregator/arms-dealer play**: Firefly Video Editor now embeds 30+ partner models — Kling 2.5/3.0/3.0 Omni, Luma Ray2/Ray3/3.14 (+HDR variants), Runway Gen-4.5, **Sora 2 (still listed as of the 2026-06-16 help-doc update, despite Sora's own app being dead — Adobe's integration outlived OpenAI's consumer product)**, Veo 2/3.1/3.1 Fast, and Nano Banana 2 — alongside Adobe's own Firefly Video model. New Apr 2026 features: Color Mode in Premiere (beta), Frame.io Drive desktop app. Adobe's bet is workflow + enterprise indemnification, not frontier model quality. Sources: Adobe blog (2026-04-15), helpx.adobe.com.

**Meta — Movie Gen / Vibes** (meta.ai, US, Big Tech BU). Movie Gen is a 30B-param research video model (1080p, 16s, 16fps) never released for open developer use — folded exclusively into the consumer **Vibes** product, a TikTok-style all-AI video feed launched inside the Meta AI app **2025-09-25** and **spun into a standalone app (testing phase) confirmed 2026-02-05**, explicitly timed as a direct Sora competitor. Unlike Sora, Vibes is *still alive and expanding* months after Sora's shutdown — the critical difference being Meta's built-in cross-posting into Instagram/Facebook Reels and Stories, i.e., distribution to billions of existing users, which Sora never had. Currently free; Meta is testing freemium tiers (higher-res, 2-minute clips, style packs). Sources: TechCrunch (2026-02-05), felloai.com.

**Stability AI** (stability.ai, US, founded 2019). Raised **$76M Series B (2026-08-25)**, bringing total funding to **$232M** under CEO Prem Akkaraju. New investors are notably **entertainment-industry strategics**: Electronic Arts, Sony Music Group, Universal Music Group, Warner Music Group, alongside AMD Ventures. The company has explicitly pivoted from general-purpose Stable Diffusion/Stable Video toward **licensed co-development deals** with major labels/studios — the same "commercially safe" positioning as Moonvalley, but anchored in music-label equity partnerships. This is a direct hedge against the exact copyright-litigation risk currently threatening Midjourney. Sources: Stability AI blog, TechCrunch, Variety (2026-08-25).

**Alibaba Wan (Tongyi Wanxiang)** (Alibaba Cloud, China, Big Tech BU). Alibaba's in-house video model, distributed via Alibaba Cloud Model Studio's API. Notably, Alibaba is *simultaneously* building its own frontier model **and** financing two of its biggest rivals — leading Vidu's Series B and participating in Kling's spin-off round — a hedge-everything posture unmatched by any Western Big Tech player in this list.

**ByteDance Seedance / Dreamina / Jimeng** (dreamina.capcut.com, China, Big Tech BU). **Seedance 2.5** launched on Dreamina (ByteDance's creative app, directly integrated with CapCut): up to **30-second clips**, up to **50 multimodal references** per generation (image/video/audio/text), granular timestamp-level editing, rolling out to 16+ users across Europe/Asia/Middle East/South America. Like Alibaba and Tencent, ByteDance ships its model bundled into an existing consumer app rather than as a standalone paid product — structurally avoiding Sora's "great model, no distribution" failure mode.

**Tencent Hunyuan Video** (Tencent, China, Big Tech BU). HunyuanVideo 1.5 is an 8.3B-param open-weight model that has "substantially surpassed" Genmo's Mochi 1 on quality and resolution per independent reviews — one of the strongest open-source video models available for self-hosted/fine-tuned deployment as of 2026.

**Genmo / Mochi** (genmo.ai, US, founded 2022, ~$28.4M raised, NEA-backed). **The clearest "quietly stalled" case in the catalog**: Mochi 1 (Oct 2024, 10B params, open-source) has been labeled "preview" for **~18 months** with no GA release, no Mochi 2, and a promised HD (720p) version that never shipped as open weights. The company blog has gone quiet but the hosted playground and API remain live — distinct from a formal shutdown (like Haiper) but trending the same direction absent new capital or a shipped v2. Sources: chatforest.com reviews, HuggingFace repo.

**Moonvalley (Marey)** (moonvalley.com, Canada, founded 2023). **$154M total raised** ($70M seed + **$84M seed extension, Jul 2025**, General Catalyst-led, with CAA, CoreWeave, Comcast Ventures, Khosla, YC). **Marey** is marketed as "the world's first commercially safe video model" — trained exclusively on **licensed** footage (direct filmmaker/production-company licensing deals across North America, West Africa, East Asia), explicitly avoiding the scraped-data exposure now threatening Midjourney. Business model: per-studio fine-tuning engagements (~a dozen major studio deals in the first 3 months of beta), one-time licensing fees + per-inference charges, **some deals include box-office/streaming revenue share**. Runs its own LA production studio, "Asteria." Sources: SiliconANGLE (2025-07-14), BetaKit, PitchBook.

**Krea** (krea.ai, US, founded 2022, Series B). **$83M raised at a $500M valuation, flat since April 2025** (Bain Capital Ventures-led Series B). Repositioned in May 2026 from a "creative design platform" into an AI research lab with its first proprietary model, **K2**, emphasizing granular creative control (sliders, drag-reference images) over pure prompt-driven output. ~20M+ users, ~$8M ARR as of its last disclosed metrics (Apr 2025). Sources: TechCrunch (2025-04-07), Dealroom.

**Freepik → Magnific** (magnific.com, Spain, founded 2010, rebranded 2026-04-28). **The single strongest bootstrap proof point in this catalog**: **$230M ARR (roughly half from AI video), 1M+ paying subscribers, 250-290+ enterprise customers (BBC, Puma, Amazon Prime Video, Guess) — achieved with $0 in outside venture capital, ever.** Uses a model-agnostic strategy (users pick from Veo 3.1, ByteDance Seedance 2.0, etc.) rather than building a proprietary frontier model — the same aggregator playbook as Adobe, but fully self-funded. Its $230M ARR exceeds Synthesia's $200M ARR despite Synthesia having raised a $200M Series E to get there. Sources: TheNextWeb (2026-04-28), PRNewswire.

**Midjourney (video)** (midjourney.com, US, founded 2021). Added video generation onto its core image platform; now the defendant in **consolidated copyright litigation** brought by Disney/Marvel/Lucasfilm/20th Century Fox/Universal/DreamWorks and separately Warner Bros/DC/Turner/Hanna-Barbera/Cartoon Network. As of this research pass, Midjourney is fighting a **June 15, 2026 magistrate ruling** that limited its discovery into the studios' own internal AI tools; it filed a motion **June 29, 2026** to compel broader disclosure, arguing the studios' own unlicensed-data AI use is directly relevant to its fair-use and "unclean hands" defenses, with a hearing scheduled **Aug 17, 2026**. This is **the single most consequential pending legal case for the sector's business model** — an adverse ruling on fair use would threaten every model trained on internet-scraped video. Sources: Variety (2026-07-02), CourtListener filings.

---

## World / Realtime Models

**World Labs / Marble** (worldlabs.ai, US, founded 2024 by Fei-Fei Li). **$1.23B total raised**: $230M stealth launch (2024) + $130M Series A extension (Sept 2024) + **~$1B round closed 2026-02-18**, anchored by a **$200M strategic investment from Autodesk** (advisory role), plus AMD, NVIDIA, Fidelity. Reported (not confirmed) valuation **~$5B**. **Marble** turns text/image/video into persistent, downloadable 3D environments — a "pre-build the whole space" approach, distinct from Genie's/Odyssey's "generate on the fly as you move." **No disclosed revenue** as of mid-2026 despite the scale of capital raised — a notable contrast to every avatar/UGC company in this list, all of which lead with revenue milestones. Part of the Feb 2026 round funded a robotics-simulation-startup acquisition, suggesting the real commercial target may be robotics/simulation rather than consumer 3D content. Sources: Reuters (2026-02-18), TechCrunch, valueaddvc.com.

**Odyssey** (odyssey.ml, US, founded 2023 by self-driving-car veterans Oliver Cameron/Jeff Hawke). **$310M Series B at a $1.45B valuation** (2026-06-17, Natural Capital-led, with Amazon, GV, AMD Ventures), **$337M total raised**. **Starchild-1** is billed as the first realtime *multimodal* (audio+video) world model, generating minutes-long interactive rollouts from a single prompt; **Agora-1** is a multi-agent shared-world-simulation model. Named a preferred AWS customer optimizing for **Trainium chips** as part of the round. Odyssey explicitly targets "robotics, science, healthcare, education, gaming, defense" as end markets — gaming/entertainment is one of several verticals, not the central thesis. Sources: TechCrunch (2026-06-17), Odyssey blog.

**Decart** (decart.ai, Israel/US, founded 2024). **$456M total raised** across five rounds, most recently **$300M Series C at ~$4B (May 2026)**, led by Radical Ventures with NVIDIA, Adobe Ventures, Toyota Ventures, Amazon as a strategic customer. **The single most important disconfirming data point for "generative games are a near-term consumer market"**: Decart's viral realtime Minecraft-style demo (Oct 2024, "Oasis") found its actual revenue in **inference optimization (DOS), autonomous-vehicle simulation, and retail/advertising virtual try-on (Lucy)** — not gaming. As of this research pass, Decart is **reportedly in advanced talks to be acquired by Anthropic for $6-7B**, mostly in stock, reportedly beating a higher NVIDIA bid (Calcalist, confirmed by Bloomberg/Reuters, Aug 2026). If completed this would be the largest realtime-generative-video exit to date — and notably an AI-lab acquisition, not a media-company one, reinforcing that Decart's strategic value is infra/simulation, not entertainment content.

---

## Enterprise Avatars / Talking-Head Video

**HeyGen** (heygen.com, US, founded 2020). **$200M ARR crossed 2026-06-25**, doubling in 8 months from $100M — while remaining **cash-flow break-even**, having burned only $25M of the $74.6M ever raised (Series A only, $60M, Jun 2024, $500M valuation, Benchmark-led — **no priced round since**). Headline efficiency stat: **~$2.70 ARR per $1 raised**, which the company claims beats Zoom/Datadog at IPO. 30M+ users, 196 countries, 85% of Fortune 100, 118M+ videos created. Sources: heygen.com blog (2026-06-25), Upstarts Media.

**Synthesia** (synthesia.io, UK, founded 2017). **Series E: $200M at a $4B valuation** (2026-01-26, GV-led), nearly doubling the $2.1B valuation from just 12 months earlier. **$150M ARR** at time of raise, guided to cross $200M in 2026, **net revenue retention >140%**. Enterprise clients: Bosch, Merck, SAP; 70-90%+ of Fortune 100. Facilitated an employee secondary sale via Nasdaq's private-markets arm at the $4B mark. Sources: TechCrunch, CNBC (2026-01-26).

**Colossyan** (colossyan.com, Hungary, founded 2020). **$28.2M raised** across 3 rounds (Series A Feb 2024, ~$22M, Lakestar-led) — a direct Synthesia/HeyGen competitor at roughly 1/10th the capital, enterprise L&D/training focus.

**Hour One** (hourone.ai, Israel, founded 2019). **Acquired by Wix, May 2025**, undisclosed sum, after raising ~$25M — one of the only clean **M&A exits** (rather than a funding round or a shutdown) in this entire catalog, now operating as a Wix feature/division.

**D-ID** (d-id.com, Israel, founded 2017). Funding figures are disputed across sources: $23M (per a 2024 Latka disclosure tied to $33.6M ARR) vs. $48-65.1M per Tracxn/PitchBook, which additionally show a **$17.1M later-stage round on 2026-05-07** not reflected in older aggregator snapshots. $33.6M ARR (2024, up from $10M in 2023), 36 enterprise customers, 154 employees — no fresher 2026 revenue figure was found in this pass; flag for a dedicated follow-up. Product line spans talking-head video generation and realtime conversational agents.

**Hedra** (hedra.com, US, founded 2024). **$42-44M total raised** (Series A $32M, May 2025, a16z Infra-led). **Character-3**: omnimodal (text+image+audio) model producing up to **10-minute** long-form character videos — unusually long-form relative to peers' seconds-scale outputs — plus **Live Avatars** realtime feature at $0.05/min. 3M+ users, 10M+ videos generated. A notable organic-growth case study: ChatGPT-referred revenue **+1,150%** and Gemini-referred **+180%** over 4 months (through Jun 2026), an early concrete data point on AI-assistant-as-distribution-channel. Sources: GlobeNewswire (2025-05-15), einpresswire.com.

**Tavus** (tavus.io, US, founded 2020, YC S21). **$40M Series B** (Nov 2025, CRV-led), **~$64M total**. **Conversational Video Interface (CVI)**: a modular realtime pipeline (Raven perception → Sparrow turn-taking → STT → LLM → TTS → Phoenix realtime face rendering) positioned explicitly as **"Human Computing" infrastructure** rather than a consumer product — closer to Twelve Labs' infra positioning than to HeyGen/Synthesia's product-led model. 100,000+ developers/enterprises including Amazon, Deloitte, EY, Mayo Clinic, CVS, Salesforce.

**Viggle** (viggle.ai, Canada, founded 2022 by ex-Autodesk/NVIDIA researcher Hang Chu). **$19-27M Series A** (Aug 2024, a16z-led). Proprietary **JST → JST-2** "video-3D foundation model" targets motion-transfer and character-animation specifically (transfer motion from a reference video onto an uploaded character image) rather than general text-to-video — a narrower, more defensible niche than the foundation-model generalists. V4 (Feb 2026) added Character Refine, Smooth Motion, and Foot Lock controls.

**DeepBrain AI** (deepbrain.io, South Korea/US, founded 2016). **$44-52M total, all raised by 2021** (Series B, Korea Development Bank-led) — **no new funding round since**, a notable capital gap vs. every 2024-26-vintage peer in this category. Revenue figures are disputed across sources ($5M per LinkedIn vs. $12.8M per other 2024 estimates). Launched Real-Time Interactive AI Avatars for enterprise (insurance, retail) in April 2026.

---

## UGC Ad Video Generators

**Arcads.ai** (arcads.ai, France, founded Jan 2024). **Fully bootstrapped and profitable until Dec 17, 2025**, then raised a **$16.41M seed** (Eurazeo-led, with Sequoia Scout). Revenue trajectory: $1M ARR (Jun 2024) → $6M (May 2025, 5-person team) → $10M (Nov 2025, 8-person team) → **$15M (2026)**. 6,000+ paying customers, some paying **>$100K/year**, AI-actor-based video ads replacing traditional human UGC creators. Sources: Arcads blog, Latka.

**Creatify** (creatify.ai, US, founded 2023). **$18.5M total raised** — $3M seed + **$15.5M Series A (2026, WndrCo/Kindred Ventures co-led)**, notable for **Jeffrey Katzenberg (DreamWorks co-founder) joining the board**. **$9M ARR reached in 18 months**, 1.5M registered users, 10,000-16,000+ teams (Alibaba, Comcast, HubSpot cited). Converts product links directly into video ads; new "AdMax" system adds performance-optimizing AI agents. Sources: aivideoadvisor.com (2026-07), LinkedIn.

**Captions → Mirage** (rebranded Sept 2025) (mirage.com / captions.ai, US, founded 2021). $60M Series C (Jul 2024, Index Ventures-led) at $500M valuation, then **$75M non-dilutive growth financing from General Catalyst's Customer Value Fund (2026-03-24)**, bringing total to **>$175M**. Explicit repositioning from a consumer captioning/editing app to a "full-stack AI video platform and research lab" building **foundational** short-form-video models — competing directly with Synthesia, HeyGen, ByteDance's CapCut, and Canva, while pushing aggressively into Asia. Sources: Slator, SuperbCrew (2026-03-24).

**Supercreator.ai** (US, founded 2021). **DEAD — sunset.** Only ~$1.1M ever raised (Serpentine Ventures/Benson Oak Ventures). The company's own website now reads: *"Supercreator has been sunset... The product is no longer active."* No specific shutdown date found, but confirmed inactive as of this research pass.

---

## Generative Film / Series / Personalized Story

**Showrunner (Fable Studio)** (fable.app, US, founded Jan 2018 by Edward Saatchi, ex-Oculus Story Studio). Public alpha since **July 2025** (after a 10,000-user closed alpha), powered by proprietary **SHOW-2** model, backed by an undisclosed **Amazon Alexa Fund** investment alongside Day One Ventures, 8VC, Greycroft. Business model: viewing is **free**; creators pay $10-40/mo for generation credits, with a **40% creator revenue share** on remixes. Deliberately **animation-only by design** — Saatchi has stated animation "requires much less processing power than realistic [video]," a direct acknowledgment of the same compute-cost economics that killed Sora. No 2026 user-scale update was found in this research pass; flag for a dedicated follow-up before using this as a primary "Generative Netflix" comp. (Full detail in `agent-market-researcher-gen-entertainment.md` §0.7.)

**Wonder Dynamics → Autodesk Flow Studio** (autodesk.com, US, founded 2020, acquired by Autodesk 2024). **A clean, completed startup-into-incumbent integration** — a useful "what a good outcome looks like" comp against every other AI-video startup still independently fundraising. Rebranded "Flow Studio" (Aug 2025), launched its **first-ever freemium tier** (Aug 12, 2025; Lite plan cut from $20→$10/mo), and completed full account/billing migration into Autodesk's systems by **May 4, 2026** — the original Wonder Dynamics brand and portal are now fully retired. Converts live-action footage into editable 3D/CG scenes (motion capture, camera tracking, mattes) exportable to Maya/Blender/Unreal via USD.

**Netflix, Disney, Universal, Warner Bros.** (incumbent studios, not startups, included for completeness). Netflix used GenAI workflows in **~300 titles in 2026** (Q2 earnings call) and acquired Ben Affleck's AI post-production startup **InterPositive for $587M / 16 employees (~$36.7M/head)** — an acqui-hire priced like a model lab. CEO Ted Sarandos' framing is explicitly **anti-generative-consumer**: "faster and cheaper doesn't matter if it's not better." Disney/Universal/DreamWorks/Fox and, separately, Warner Bros./DC are **suing Midjourney** for copyright infringement (see Midjourney entry above) even as their own internal AI tool use is the subject of Midjourney's discovery fight — the central tension of the entire sector's legal exposure. Disney also **exited its Sora partnership within hours** of OpenAI's shutdown announcement. (Full detail in `agent-market-researcher-gen-entertainment.md` §0.6.)

---

## Infrastructure & Distribution

**fal.ai** (fal.ai, US, founded 2021). **The fastest-scaling company in this entire catalog by revenue velocity**: **~$400M annualized revenue as of Feb 2026** (up from ~$285M end-2025, ~$25M end-2024 — over **1,000% YoY**). **$140M Series D at $4.5B (Dec 2025, Sequoia-led)**; as of March 2026 reportedly in advanced talks for $300-350M at **~$8B** (unconfirmed). AWS named preferred cloud (May 2026); 2.5M+ developers, 600+ hosted models, customers include Adobe, Canva, Amazon MGM Studios. **Read for the thesis**: fal.ai doesn't need any single frontier model to win — it's the "picks and shovels" layer that hosts (and takes a margin on) nearly all of them, and its valuation-in-talks would already rank above every model company in this catalog except Luma, Runway, Kling's new round, and Higgsfield. Sources: Sacra, Dealroom (2026-03-19).

**Twelve Labs** (twelvelabs.io, US/South Korea, founded ~2021). **$100M Series B (2026-07-01)**, co-led by NEA + NAVER Ventures with **Amazon** (also a strategic AWS Trainium chip commitment), **$207M total raised**. **Marengo 3.0** (video understanding/search) + **Pegasus 1.5** (structured video → scene/entity/temporal data), both distributed via Amazon Bedrock. This is the **understanding/search complement** to the generation-focused companies in this catalog, not a competitor — it makes existing video archives searchable and agent-usable rather than generating new video.

**Livepeer** (livepeer.org, global/DAO, founded 2017). The only **decentralized/crypto** infra play in this catalog. "Livepeer 2.0" (proposed mid-2026) introduces **Burn-Mint-Equilibrium (BME)** tokenomics — network fees paid in USD are used to buy and burn the LPT token, directly linking token value to network usage for the first time, replacing purely inflationary emissions. Also removes the 100-orchestrator cap and adds a **Livepeer Agent** open-source MCP connector letting any AI agent tap into its permissionless GPU marketplace for video tasks. Community sentiment is openly mixed — a forum thread from a long-time (2021) LPT holder titled "I lost $350,000 in this project, any advice?" reflects real investor frustration that the Livepeer Foundation is actively trying to address via this redesign — a useful crypto-market-structure counterpoint to fal.ai's clean equity-round scaling story.

**YouTube Dream Screen (Veo)** (blog.youtube, US, Big Tech BU). Google DeepMind's Veo 2 integrated directly into YouTube Shorts' creation tools: AI green-screen backgrounds and standalone AI clip generation, both watermarked with SynthID, rolled out first to US/CA/AU/NZ.

**TikTok / CapCut / Dreamina (ByteDance)** — see Seedance entry above. The distribution strategy mirrors YouTube's: the model is bundled directly into the editing app users already have open, rather than requiring a separate destination app (Sora's fatal flaw).

---

## Dead / Shut Down — explicit tracker

Per the user's explicit instruction to verify rumors and not repeat unverified claims:

| Company | Verdict | Key evidence |
|---|---|---|
| **OpenAI Sora** | **DEAD.** App off 2026-04-26; API sunsets 2026-09-24; no replacement announced. | Multiple corroborating sources — see §0 |
| **Haiper AI** | **DEAD** (consumer product). Web app went offline Feb 2025 with zero warning (404s, no migration path, ~4.5-6.5M users stranded). Founders joined Microsoft AI (Mar 2025, acqui-hire pattern, no formal acquisition). Models sold to NetMind.AI (Jun 2025) for B2B-only continuation. | fluxnote.io, chatforest.com, plisio.net — cross-corroborated by 5 independent retrospectives |
| **Supercreator.ai** | **DEAD/sunset.** Confirmed via the company's own website. | supercreator.ai live check |
| **Hour One** | Not dead — **acquired by Wix** (May 2025), continues as a product/feature. | — |
| **Wonder Dynamics** | Not dead — **fully absorbed into Autodesk** as Flow Studio, thriving with a new freemium tier and larger user base than the standalone startup ever had. | — |
| **Genmo / Mochi** | Not formally dead, but **stalled**: 18 months on a "preview" label, no v2, quiet company blog. Distinct from a shutdown — still operating a hosted API. | chatforest.com, HuggingFace |

---

## Excluded / Could Not Verify (per instruction not to guess)

- **"Enway"** — no company matching this name was identified with confidence in the generative video/film/UGC space. Likely a typo, a very early/unlisted entity, or a name from an adjacent sector not indexed by the searches performed this session. **Excluded rather than guessed.**
- **Character.AI** — primarily a text/companion-chat product; no material video-generation or generative-film feature was found in this research pass. Excluded from the main catalog; flag for a dedicated follow-up search if the user specifically wants interactive-character-chat-as-story covered as its own subsegment (distinct from video generation).

---

## Monastery-Filter Notes (quick read, not exhaustive — see synthesis/report.md for the full GP-facing view)

- **Big Tech features, not startups**: Google Veo/Genie, Meta Movie Gen/Vibes, YouTube Dream Screen, TikTok/CapCut/Dreamina, Adobe Firefly, xAI Grok Imagine, Alibaba Wan, Netflix/Disney/Warner internal tools. None of these are investable as standalone companies; they set the competitive floor every startup in this list must clear.
- **Already too big for $2M/5%/12-week Monastery-stage**: Runway ($5.3B), Luma ($4B), Kling ($18B), MiniMax (public), Higgsfield ($5.4B), Synthesia ($4B), World Labs (~$5B), Odyssey ($1.45B), Decart ($4B, acquisition talks), fal.ai (~$8B in talks) — all are Series B+ or public/late-stage.
- **Capital-efficient, still small enough to study as a pattern (not as a co-investment target)**: HeyGen ($74.6M raised, $200M ARR), Freepik/Magnific ($0 raised, $230M ARR), Arcads ($16.4M raised after bootstrapping to profitability) — these three are the strongest evidence that **a defensible generative-video business does not require frontier-model-scale capital**, which is directly relevant to what a Monastery-stage team could credibly attempt.
- **Cautionary tales for any consumer generative-video pitch**: Sora (dead), Haiper (dead), Supercreator (dead), Genmo/Mochi (stalled), Pika (funding-starved) — five different flavors of the same failure mode: strong technology without a durable distribution or unit-economics answer.
- **The unresolved tail risk for the entire sector**: the Midjourney v. Disney/Universal/Warner Bros. litigation. A ruling against fair use would be a sector-wide shock; Moonvalley and Stability AI's pivots to licensed-content models are the clearest hedges already in market.
