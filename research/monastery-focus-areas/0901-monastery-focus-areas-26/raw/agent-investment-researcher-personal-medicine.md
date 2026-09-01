# Agent Output: investment-researcher — Personal Medicine
**Date**: 2026-09-01  
**Intensity**: Deep  
**Scope**: Personal medicine — offline + personalized care delivery, products, consults  
**Monastery filter**: $2M seed, 12 weeks, seed–A  

---

## 1. Market Landscape Overview

### Market Sizing

| Segment | 2026 Estimate | CAGR | Source | Confidence |
|---|---|---|---|---|
| US Concierge + DPC market | $8.1B | ~10% | Healthcare Foresights, Jun 2026 | Medium (range: $6–9B in competing reports) |
| Longevity clinic chain infrastructure | $2.6B | 10.3% | Future Market Insights, 2026 | Low (niche category, sparse data) |
| Global CGM market | $15.3B | 15.4% | geo.sig.ai, 2026 | Medium |
| Digital mental health (incl. AI therapy) | ~$11B | ~18% | Venable LLP citing industry data, Dec 2025 | Low |
| US cash-pay healthcare (VITL framing) | "~$100B" | Not cited | VITL press release, Mar 2026 | Very Low — self-described |

**Methodology note**: Market size estimates in this space are notoriously inconsistent. Concierge medicine estimates range from $6.1B (Precedence Research) to $7.35B (Grand View Research) to $8.1B (Healthcare Foresights) — all citing 2024–2026. Use as directional, not precise.

### Key Structural Facts

- **6,185 concierge/DPC practices** in the US as of Jun 2026 (NextMD directory); **8,744 physicians** — median DPC fee $99/mo, median concierge $196/mo (NextMD Q2 2026 market report)
- **DPC HSA-eligible** from Jan 2026 under the One Big Beautiful Bill Act (up to $150/mo/individual) — first federal tax subsidy for membership primary care
- **7,200+ employers** now offer DPC as a benefit, +25% YoY (Concierge MD Finder, 2026)
- **AAMC projects 20,200–40,400 primary-care physician shortage by 2036** — the supply-side forcing function for DPC conversion
- **Hims & Hers 2025 revenue: $2.35B (+59% YoY)**; 2026 guidance revised up to $3.1–3.3B (Q2 2026 guidance update). Public. Not a pure personal medicine story — broad telehealth platform. [investors.hims.com, 2026-02-26]
- **Function Health**: $2.5B valuation (Nov 2025 Series B, $298M, led by Redpoint/a16z); $450M additional non-dilutive growth financing from General Catalyst CVF (Jul 30, 2026); ~500K members; $365/yr membership for 160+ lab tests; acquired Getlabs (at-home draw) and SuppCo (supplements) in Q2 2026 [PRNewswire, 2026-07-30]

---

## 2. Value Chain Map — Where Value Accrues

```
Layer 1: BIOMARKER COLLECTION
  ├── Venipuncture (lab draw) — Quest, LabCorp, Getlabs
  ├── At-home finger-stick panels — Superpower, Function at-home, Everlywell
  ├── CGM (glucose) — Dexcom, Abbott (hardware), Levels (software)
  ├── Wearables — Oura, Whoop, Garmin (HRV, sleep, HRR)
  └── Imaging — MRI, CT, DEXA (Fountain Life, EHE)

  >>> Value: LOW. Commodity. Quest/LabCorp own the infrastructure. Draw sites are pure logistics.
  >>> Exception: Getlabs (acquired by Function) had the moat = 1,000+ at-home phlebotomists network

Layer 2: INTERPRETATION
  ├── Physician review of labs — DPC doctors, concierge MDs
  ├── AI interpretation engine — Function MI Lab™, Lucis AI, Vitel, LongevityPRO, LongevOS
  └── Protocol generation — longevity clinic software, LLM-guided plans

  >>> Value: MEDIUM AND RISING. Interpretation is commoditizing as LLMs improve.
  >>> Moat here = LONGITUDINAL DATA (repeat member labs over 2+ years → predictive signal) 
  >>> + PHYSICIAN REVIEW LOOP (regulatory protection from FDA device classification)
  >>> Risk: OpenAI / Gemini can generate protocol from a PDF of labs. "Interpretation" alone = no moat.

Layer 3: PRESCRIPTION / COMPOUNDING / PRODUCT
  ├── GLP-1 (branded) — Novo/Eli Lilly, distributed via Hims, Ro, NovoCare
  ├── GLP-1 (compounded 503A) — LEGALLY RESTRICTED since Apr 2025 absent clinical need
  ├── Peptides (503A) — REGULATORY LIMBO; 6 peptides recommended for 503A list Jul 2026 (PCAC); formal rulemaking 2027+
  ├── HRT / hormone therapy — 503A compounding legal; established market
  ├── Supplements / nutraceuticals — unregulated; low margin, high competition
  └── Compounding pharmacy tech — CurifyLabs ($14M Series A, Jul 2026); VITL ($7.5M Series A, Mar 2026)

  >>> Value: HIGH for licensed compounding pharmacy + prescriber unit (owns the RX + the product)
  >>> CPOM law means: investor cannot own prescriber entity directly → MSO-PC structure required
  >>> GLP-1: game over for compounding at scale. Hims/Novo deal (Mar 9, 2026) confirms.
  >>> Peptides: the open window. 503A PCAC favorable. Formal rulemaking starts 2027.

Layer 4: THERAPY ADHERENCE
  ├── Protocol tracking apps — Vitel, LongevOS, longevity clinic EMR
  ├── Patient engagement / check-ins — AI coach, nurse practitioner outreach
  ├── GLP-1 adherence — Novo Nordisk has structural interest; Talkspace + GLP-1 coaching (Wisdo/Novo partnership)
  └── Habit / behavior — Noom (coach layer), Levels (CGM loop), BetterHelp, Headspace

  >>> Value: MEDIUM. Adherence drives LTV. The member who stays 12 months worth 3× the one-month member.
  >>> The adherence layer closest to prescription = highest value (renews the RX = recurring product revenue)
  >>> Standalone apps without prescription = feature of bigger platforms

Layer 5: CONSULT (MD / NP / Therapist / Coach)
  ├── Concierge MD / DPC — retainer $1,200–2,400/yr DPC; $2,400–30,000/yr concierge
  ├── Longevity clinic membership — $10,500–100,000/yr (Fountain Life starts $10,500)
  ├── Mental health licensed therapist — BetterHelp, Talkspace ($229M rev, B2B payor)
  ├── AI-assisted coaching — nutrition, sleep, fertility, executive performance
  └── Psychotherapy AI — NO FDA-authorized generative AI for mental health as of Aug 2026; 4 states ban AI therapy

  >>> Value: HIGH at the branded membership level. The concierge MD retainer is a trust + access monopoly.
  >>> AI coaching: low value standalone (ChatGPT does it for free). High value as adherence layer inside a clinical protocol.
  >>> Therapist + AI: traction only in payor-reimbursed B2B model (Talkspace). Consumer DTC = no regulatory path.
```

**Power summary**: Value concentrates at (a) the licensed prescriber+pharmacy unit (RX margin), and (b) the branded membership that owns the patient relationship long-term. The interpretation and adherence layers accrue value only when tied to one of these anchors. Standalone software selling into this stack is Crosby-in-healthcare if it owns the workflow data; it is MagicSchool if the clinic can switch to a different LLM layer.

---

## 3. Competitive Landscape — 10 Subsegment Heat Map

### Heat Map Legend
- 🔴 TOO LATE / CROWDED — strong incumbents, late-stage capital, difficult to differentiate at seed
- 🟠 CROWDED — competitive but open sub-niches exist
- 🟡 OPEN — real opportunity, 2–4 funded players, not locked up
- 🟢 OPEN + UNDERINVESTED — few players, regulatory or structural opening, Monastery-shaped
- ⚪ TOO EARLY — 3–5 year horizon before commercial viability

| # | Subsegment | Heat | Key Players | Why |
|---|---|---|---|---|
| 1 | Biomarker testing / lab panel memberships | 🔴 TOO LATE | Function ($2.5B), Superpower ($30M Series A), Everlywell (acquired by Mednax), Lucis ($28M EU) | Function owns the brand and just acquired Getlabs (draw network) + SuppCo. Consumer lab memberships are commoditizing. At-home draw is a logistics/infrastructure problem. |
| 2 | CGM / continuous metabolic monitoring | 🔴 TOO LATE | Dexcom (hardware, OTC cleared), Abbott (FreeStyle), Levels ($233M raised, ~$50M ARR), January AI | OTC CGM cleared by FDA 2023. Software interpretation layer = commoditizing (any LLM can explain glucose spikes). |
| 3 | GLP-1 telehealth / weight loss | 🔴 TOO LATE / DEAD for compounders | Hims ($2.35B rev), Ro, Remedy/Thirty Madison, WeightWatchers telehealth | Compounding GLP-1 pathway closed. Novo/Hims deal (Mar 9, 2026) institutionalized the distribution channel. Margin is at pharma; telehealth is the distribution middleman. |
| 4 | Peptide clinics (BPC-157, TB-500, MOTS-c) | 🟡 OPEN (2026) | Protocole, Pep'd, NoHo Labs (early seed), gray market operators | PCAC recommended 6 peptides for 503A list (Jul 23–24, 2026). Rulemaking starts 2027. The regulatory window is OPENING. Licensed clinic + 503A pharmacy = defensible. Gray market = kill-switch risk. |
| 5 | Premium longevity clinics (imaging + biomarkers) | 🔴 TOO LATE | Fountain Life ($108M raised, 7+ centers), EHE Health, Human Longevity Inc., Biohax | Capital-intensive ($3–10M per center). Fountain raised $18M Series B just to open 6 centers. Not a $2M/12-week play. |
| 6 | Direct Primary Care — AI-native operator | 🟢 OPEN | Elation Health (EHR for DPC, not a clinic operator), Hint Health (membership billing), Brave Health (B2B behavioral) | DPC market +83% practices 2018–23; HSA eligibility Jan 2026. Virtually NO AI-native operator that owns the clinic P&L and is AI-native from day one. The Crosby analog. |
| 7 | Clinic SaaS / longevity OS / EMR layer | 🟠 CROWDED | Vitel, LongevityPRO, LongevOS, LongevAI, Hint Health, Elation, Jane App | 15+ tools competing for the same ~6,000 concierge/longevity practices. VITL ($7.5M, Mar 2026) owns the compounding pharmacy marketplace. Crowded at SaaS layer; differentiate via vertical lock-in (compounding, specific therapy type). |
| 8 | AI psychotherapy / CBT apps | ⚪ TOO EARLY (regulatory) + 🔴 consumer DTC dead | Talkspace (B2B payor, $229M rev), Spring Health (employer), Headspace (wellness), Woebot (pivoted B2B, consumer app DEAD Jun 2025) | No FDA-authorized generative AI for mental health (0 out of 1,524 AI-cleared devices as of Aug 2026). 4 states ban AI therapy (IL, NV, RI, ME effective Jul 2026). Consumer DTC = ChatGPT feature. B2B payor = 18-month sales cycle. |
| 9 | Coaching / nutrition / soft consult | 🔴 CROWDED | Noom ($3.7B valuation, Noom Med pivot), BetterHelp (IAC), Headspace, Everlywell + coaching layer, Cara Care | $70/mo human-coached programs have 4.2-month median tenure → realized LTV $290 before CAC (D2C Times, 2026). ChatGPT does this free. The "soft consult" as standalone is a feature. |
| 10 | Personal physician / concierge MD membership (AI-native) | 🟢 OPEN + UNDERINVESTED | Parsley Health (acquired by LifeStance 2024), Forward Health (CLOSED 2023), One Medical (Amazon, now insurance), Galileo Health | Forward failed at scale (high capex kiosk model). One Medical absorbed into Amazon Prime/insurance. Parsley absorbed. The OPEN niche: asset-light AI-native DPC or functional medicine practice that owns the full P&L (not a SaaS), with AI handling interpretation + scheduling + protocol. |

---

## 4. Regulation as Moat vs Kill-Switch

### 4A. FDA 503A Compounding (Individual Patient Rx)

**Status**: Active pathway. Allows state-licensed pharmacies to compound for individual patients on valid prescription, IF compound is not "essentially a copy" of commercially available product.

**Moat potential**: HIGH if you own the prescriber + 503A pharmacy unit and serve a specific patient population (HRT, peptides, specialty doses). The MSO-PC structure creates regulatory lock-in: it takes 6–18 months for a competitor to replicate the CPOM-compliant structure in a new state.

**Kill-switch risk**: MEDIUM. FDA warning letters, state board scrutiny, "essentially a copy" doctrine applied aggressively. The Done Global DOJ prosecution (Jan 2026) showed CPOM principles can become part of federal criminal analysis [Ropes & Gray, Jan 2026].

**GLP-1 specific**: DEAD. 503B closed in 2025. 503A legal only for "rare" cases with documented clinical need; Hims/Novo agreement (Mar 9, 2026) formally ended mass marketing of compounded GLP-1s.

### 4B. FDA 503B Outsourcing Facilities

**Status for GLP-1**: CLOSED. FDA proposed permanently excluding semaglutide, tirzepatide, liraglutide from 503B bulks list (Apr 30, 2026). Public comment closed Jun 29, 2026. Final rule expected 2026–2027. [Epstein Becker Green, Apr 2026; Pharmacy Times, 2026]

**Kill-switch**: EXECUTED on GLP-1. Other categories (peptides added to bulks list) would require separate rulemaking. 503B is a kill-switch, not a moat, for commodity therapeutics that Big Pharma defends.

### 4C. Peptides — The Opening Window

PCAC recommended 6 peptides for 503A bulks list (Jul 23–24, 2026):
- **BPC-157** (gut healing, anti-inflammatory) ✅ recommended  
- **KPV** (anti-inflammatory peptide) ✅ recommended  
- **TB-500 / Thymosin β-4** (tissue repair) ✅ recommended  
- **MOTS-c** (mitochondrial, obesity-related) ✅ recommended  
- **Epitalon** (telomere/longevity peptide) ✅ recommended  
- **Semax** (cognitive, neuroprotective) ✅ recommended  
- **Emideltide** ❌ not recommended  
- **GHK-Cu, Dihexa, LL-37, PEG-MGF, Melanotan II** — deferred to Feb 2027 PCAC meeting  

**Important**: PCAC recommendations are advisory. FDA must complete formal rulemaking before legal compounding. Enforcement discretion expected in interim, especially under HHS Secretary Kennedy's deregulatory posture. Formal rulemaking likely 2027; could slip 2028. [McDermott Law, Jul 2026; LegitScript, Jul 2026]

**Moat**: Companies that build licensed clinic + 503A pharmacy infrastructure NOW (before rulemaking finalizes) will have the patient base, clinical protocols, and outcomes data to defend their position when formal pathway opens. Gray market operators face kill-switch risk when rulemaking completes.

### 4D. State Medical Boards & CPOM

**33 states** have corporate practice of medicine restrictions preventing non-physicians from owning or controlling entities that practice medicine. [FUSE Health, 2026]

Most restrictive new laws:
- **Oregon SB 951** (signed Jun 9, 2025; effective Jan 1, 2026 for new arrangements): physicians must hold majority of voting shares; management companies lose final say over clinical hiring, compensation, payer contracting. [FUSE Health, 2026]
- **California, Texas, New York, North Carolina**: active enforcement.
- **Florida, Ohio**: no prohibition — favorable for structuring.

**Implication for Monastery companies**: MSO-PC structure is MANDATORY in 33 states. This takes 60–90 days to structure properly and requires an affiliated physician owner. It is a real barrier to entry that protects incumbents. NOT a kill-switch — it is navigable with the right counsel and structure.

**DOJ Done Global prosecution (Jan 2026)**: DOJ used CPOM principles to argue that management influence over clinical decision-making constituted prescriptions "outside usual course of professional practice." This is the enforcement signal: if your MSO tells doctors what to prescribe in ways that look like management control, you have federal criminal exposure. [Ropes & Gray, Jan 2026]

### 4E. AI Therapy Regulation — State Bans

**4 states BAN AI therapy** (as of Jul 20, 2026): Illinois, Nevada, Rhode Island, Maine.  
Maine's LD 2082 (effective Jul 29, 2026): AI cannot make independent therapeutic decisions or communicate therapeutically with clients without a licensed professional providing the service. [Psychology.com, Jul 2026]

**4 states regulate** (disclosure/crisis referral): Utah, New York, California, Nebraska.

**FDA status**: ZERO generative AI mental health devices authorized as of Aug 2026 (1,524 total AI-cleared devices, 0 for generative AI mental health). FDA's enforcement discretion currently extends to low-risk apps. High-risk therapeutic apps require premarket review. No framework yet for LLM-based therapy. [Resolv Social, Aug 2026; Sidley Austin, Nov 2025]

**Kill-switch pattern**: Consumer-facing AI therapy in 4+ states = legal exposure. Prescribing AI + therapy AI = DOJ/CPOM hybrid risk zone. This is not 2026–2028 investable at seed for DTC therapy product.

**Moat pattern**: B2B payor/employer-channel + licensed therapist oversight + AI as clinical tool (NOT as the therapist) = regulatory-safe and reimbursable. Talkspace model ($229M rev, 22% YoY growth) demonstrates this.

### 4F. EU AI Act

For EU personal medicine: EU AI Act (came into force Aug 2, 2024; high-risk provisions apply from Aug 2, 2026) classifies AI systems used to make medical decisions as **high-risk** requiring:
- Conformity assessment
- Human oversight requirements
- Registration in EU database
- Post-market monitoring

**Kill-switch for EU DTC**: AI-only clinical decision making without physician loop = non-compliant from Aug 2026. US startups entering EU with AI-only interpretation (no physician in loop) face regulatory barrier. Operators with physician review layer (Lucis model: $28M raised, physician-reviewed protocols) are compliant by design.

### 4G. Stark Law & Anti-Kickback

Applies when federal healthcare programs (Medicare, Medicaid) are involved. Cash-pay / DPC / concierge practices that accept NO insurance largely sidestep Stark. But:
- If any employed/contracted physician refers patients to lab or imaging that the company also owns = Stark risk if any federal payor involved
- The DPC cash-pay model + prohibition on insurance billing = structural protection from Stark

**Implication**: Purely cash-pay personal medicine clinic (DPC, longevity, concierge) has minimal Stark exposure. This is one reason the cash-pay segment is growing independently of payer-billing complexity.

---

## 5. Competitive Analogies — Which Pattern Fits?

### The Three Analogies (from slides.md framework)

| Pattern | Description | Healthcare Analog | Outcome |
|---|---|---|---|
| **MagicSchool** (wrapper killed by Big Tech) | ChatGPT plugin launched; tool built on GPT-3/4; Big Tech ships free version | Woebot DTC consumer app ($123M raised, consumer app DEAD Jun 2025); any AI lab interpretation tool without clinical moat | Dead or commoditized |
| **Crosby** (own the license, win the workflow) | Dual-entity law firm; AI-native; owns clinical + legal outcome data; $5.8M seed → $60M Series B in 10 months | VITL (compounding RX marketplace, 630+ clinics, $7.5M Series A); any AI-native DPC practice that owns the chart + the prescription | Defensible — workflow data + license = moat |
| **Alpha School** (become the operator) | School that is the AI product; own tuition not software; 27 campuses Aug 2026 | Fountain Life ($108M raised, 7 owned centers); Function Health ($800M total raised, owns the patient data + imaging + labs) | Capital intensive but defensible at scale |

### Personal Medicine Is: Crosby + Alpha Hybrid

**The correct analog is neither MagicSchool nor pure Alpha School — it is the Crosby shape applied to a licensed medical operator.**

Reasoning:
1. You CANNOT be pure MagicSchool: FDA, CPOM, and Stark create regulatory walls that mean being a wrapper on Claude is insufficient and dangerous
2. You CANNOT be pure Alpha School at $2M: Fountain Life needed $108M to open 7 clinics. Capex kills the $2M/12-week thesis.
3. The CROSBY model works: own the licensed entity (MSO-PC structure), own the workflow and patient data, be AI-native in the clinical layer, charge for the outcome not the software. VITL ($7.5M Series A) is Crosby for the compounding pharmacy marketplace. The DPC clinic analog has not been built yet.

**The Monastery-shaped company in personal medicine**:
> An AI-native licensed medical operator (DPC or functional medicine) that owns the clinical P&L through an MSO-PC structure, charges membership retainer (not insurance billing), uses AI for interpretation + protocol + scheduling, and accumulates proprietary longitudinal patient data as its moat. Does not require acquiring clinics — recruits affiliate physicians onto its MSO. Does not require building a pharmacy — partners with a 503A pharmacy for dispensing.

---

## 6. Peptides + Personal Products — What $2M Seeds Can Actually Own in 12 Weeks

### What Is Legally Buildable in 12 Weeks

**Step 1 — MSO-PC Structure** (Weeks 1–3): Incorporate management services organization (tech company). Identify physician co-founder or affiliate physician in a favorable CPOM state (Florida, Ohio, or Texas with proper structure). Draft MSO agreement. Cost: $15–30K legal.

**Step 2 — State Selection + Licensing** (Weeks 2–6): Choose 1–2 states where CPOM risk is manageable (FL, OH) or MSO-PC is established practice. Apply for telehealth registration if serving patients remotely. Cost: $5–15K per state.

**Step 3 — 503A Pharmacy Partnership** (Weeks 3–8): Contract with existing VITL-network pharmacy (1,000+ prescribers already on VITL platform). No need to own the pharmacy. VITL connects to 503A pharmacies with HRT, peptide (legally compliant as of PCAC Jul 2026 advisory) protocols. Cost: revenue-share, no upfront. **Do not try to build/buy a pharmacy in 12 weeks.**

**Step 4 — Clinical Protocol Stack** (Weeks 4–10): Build intake questionnaire, biomarker panel ordering (via Getlabs API or Quest), AI interpretation layer (LLM + physician review), protocol generation (HRT, peptides when rulemaking allows, longevity supplements). Cost: $200–500K engineering + clinical content.

**Step 5 — Patient App + Adherence** (Weeks 8–12): Simple app for protocol delivery, CGM integration, check-ins. Not a novel social platform — a clinical adherence tool. Cost: $100–200K engineering.

**Step 6 — First 100 Members** (Ongoing): Cash-pay membership $200–500/month. At 100 members = $240–600K ARR before product margin. Breakeven at ~200 members at $300/mo. Seed capital funds growth to 500 members and first proof of outcomes data.

### What $2M Seed CANNOT Buy

- A 503A or 503B pharmacy license and physical build-out: $500K–2M+ capex + 6–12 months regulatory
- A compounding capability: hire pharmacist-in-charge, PCAB accreditation, GMP equipment
- Multi-state physician employment (CPOM in 33 states means per-state structure)
- FDA device clearance for any AI interpretation tool that makes clinical claims
- A longevity clinic with MRI: $2–5M capex per site minimum

### The Peptide Opportunity Window — Timing

**Jul 2026**: PCAC recommends BPC-157, KPV, TB-500, MOTS-c, Epitalon, Semax for 503A bulks list  
**Sep 2026 – 2027**: FDA notices-and-comment rulemaking period; enforcement discretion expected for recommended peptides per McDermott Law analysis  
**2027–2028**: Final rulemaking → formal 503A legality for recommended peptides  
**Feb 2027**: Second PCAC meeting for GHK-Cu, Dihexa, LL-37, PEG-MGF, Melanotan II  

**Monastery timing**: A company seeded in Q4 2026 or Q1 2027 that builds the licensed clinic + pharmacy partnership infrastructure will have:
- 12–24 months of patient outcomes data before competitors who wait for final rulemaking
- A physician network + MSO structure already in place
- The regulatory clarity that enables fundraising at Series A when rulemaking finalizes

**Gray market risk**: Companies operating without the MSO-PC structure and 503A pharmacy compliance face FTC action, state medical board action, and DOJ telehealth prosecution risk. The gray market IS the current market; the opportunity is to be the first licensed operator, not the last gray market player.

---

## 7. Psychotherapy + Coaching — $1B Path or ChatGPT Feature?

### The Evidence

**Woebot DTC**: $123M raised; consumer app RETIRED Jun 30, 2025. Official reason: no viable business model in regulatory environment. Key signal — even a rules-based (not generative AI) CBT chatbot couldn't survive consumer DTC. [Behavioral Health Business, Apr 2025]

**Talkspace (NASDAQ: TALK)**: 2025 revenue $228.9M (+22% YoY). 2026 guidance $275–290M. EBITDA breakeven. Revenue breakdown: 75% payor/DTE, 16% DTC. DTC revenue DECLINED 30.4% YoY in Q4 2025 — consumer is migrating to ChatGPT. The $1B path is PAYOR-REIMBURSED B2B, not DTC. [SEC 8-K, Feb 2026]

**BetterHelp (IAC)**: Declined from peak. Not publishing segment ARR since 2023 correction. Consumer DTC therapy subscriptions showing structural churn.

**AI therapy state bans**: 4 states ban AI therapy effective 2026. More expected. [Psychology.com, Jul 2026]

**FDA status**: Zero generative AI mental health devices authorized (Aug 2026). FDA advisory committee Nov 2025 was first-ever discussion; framework still in development. [Resolv Social, Aug 2026]

**ChatGPT therapy use**: Talkspace CEO explicitly said in Q4 2025 earnings call that users are migrating from DTC therapy to general-purpose LLMs; company is running LLM search optimization to recapture users. This is the admission that ChatGPT IS the competitive threat to DTC therapy. [Talkspace Q4 2025 earnings transcript]

**Noom Med pivot**: Noom ($3.7B peak valuation, now significantly lower) pivoted to GLP-1 medication management. Core behavioral coaching product has ~4.2-month median tenure, realized LTV ~$290 before $180+ CAC. Structural unit economics are broken for standalone coaching subscriptions. [D2C Times, 2026]

### Verdict: "Soft consult" as standalone DTC product = ChatGPT feature

The consumer therapy and coaching market is being disintermediated by general-purpose LLMs from the bottom and by employer/payor reimbursement models from the top. The middle — consumer-paying standalone coaching subscriptions — is collapsing.

**The $1B path exists but is NOT consumer DTC**:

1. **Payor-reimbursed B2B mental health**: Talkspace proof point. 80%+ of Talkspace revenue is payor/employer. 18-month sales cycle. Not a 12-week Monastery build.
2. **AI as clinical tool inside a licensed platform**: Adherence coaching inside a DPC/concierge practice where the AI keeps patients on their peptide/HRT protocol and schedules follow-ups. THIS is value. Not a therapy product — an adherence product.
3. **GLP-1 behavioral coaching**: Talkspace acquired Wisdo and partnered with Novo Nordisk for GLP-1 patient coaching. This is the behavioral → pharmaceutical integration play. At $229M ARR this works but requires payor relationships.

**Monastery-sized analog**: A $2M seed in behavioral/coaching adjacent to personal medicine makes sense ONLY if it is:
- The adherence layer inside a licensed clinic (not a standalone app)
- A B2B tool sold to DPC practices or longevity clinics (not consumer)
- Operating in states outside the 4-state AI therapy ban zone with proper disclosures

---

## 8. Company Catalog — Personal Medicine Ecosystem

### Late Stage / Public / TOO LATE for seed competitive entry

| Company | Stage | Revenue/Metrics | Notes |
|---|---|---|---|
| Hims & Hers | Public (NYSE: HIMS) | $2.35B 2025 (+59%); 2026 guidance $3.1–3.3B | Broad telehealth; post-GLP-1 compounding pivot; Novo deal Mar 2026 |
| Function Health | Growth ($2.5B val, Nov 2025) | 500K members; $450M CVF financing Jul 2026 | Biomarker + imaging + supplements; acquired Getlabs, SuppCo |
| Talkspace | Public (NASDAQ: TALK) | $228.9M 2025; $275–290M 2026 guidance | B2B payor behavioral health; TalkAI in beta |
| Noom | Late private | $3.7B peak valuation (correcting); GLP-1 pivot (Noom Med) | Behavioral coaching structural unit economics broken |
| BetterHelp | Subsidiary (IAC) | Revenue declining; payor pressure | Consumer therapy disintermediation |
| Levels Health | Series B+ | ~$50M ARR est.; $233M raised total | CGM software; launched Levels Pro for clinicians 2026 |
| Superpower | Series A | 100K+ paying members; $30M A (Apr 2025) | Biomarker testing + AI guidance + concierge MD text access |
| Fountain Life | Series B ($108M total) | Premium longevity clinics; $10,500+/yr membership | 7 centers; opening LA, Miami 2026; high capex model |

### Mid Stage / Watch

| Company | Stage | Round | Notes |
|---|---|---|---|
| Lucis (EU) | Series A | $28M total ($8.5M seed + $20M A, May 2026) | Biomarker + AI interpretation; physician-reviewed protocols; Europe-first |
| VITL | Series A | $7.5M (Mar 2026, SignalFire) | Compounding pharmacy marketplace OS; 630 clinics, 1,000+ prescribers |
| CurifyLabs | Series A | $14M (Jul 2026, Sandwater/HealthCap) | 3D printing automated compounding; 21 US states + Europe |
| Remedy/Thirty Madison | Growth | Acquired Thirty Madison (2026) | GLP-1 + hair + hormones + fertility roll-up |

### Seed / Early Stage — Monastery Candidates

| Company | Stage | Round | Notes |
|---|---|---|---|
| Protocole | Seed | Undisclosed | Peptide clinic; licensed + 503A pharmacy partner |
| Pep'd | Seed | Undisclosed | Peptide clinic; physician oversight model |
| NoHo Labs | Seed | Undisclosed | Peptide + longevity; compliance-first positioning |
| Vitel | Pre-product/seed | Undisclosed | Longevity clinic OS: protocol tracking, biomarker correlation, adherence |
| LongevityPRO | Pre-revenue | Undisclosed | Practitioner portal: lab ordering + AI protocol + patient app |
| LongevOS / LongevAI | Pre-revenue | Undisclosed | Clinic AI assistant; white-label patient portal |

*Note on seed-stage companies: funding data is sparse / not publicly disclosed. Names sourced from product websites and directory mentions. Confidence: Low.*

---

## 9. Key Data Points — Cited

All claims should be verified against primary sources listed below.

| Claim | Source | Date | URL | Confidence |
|---|---|---|---|---|
| US concierge medicine market $8.11B 2026 | Healthcare Foresights | 2026 | healthcareforesights.com | Medium |
| 6,185 practices, 8,744 physicians in US concierge/DPC | NextMD Q2 2026 market report | Jun 2026 | nextmd.ai | High |
| DPC HSA-eligible $150/mo/individual from Jan 2026 | One Big Beautiful Bill Act via ConciergemdFinder | 2026 | conciergemedfinder.com | High |
| Function Health: $450M CVF growth financing | PRNewswire | Jul 30, 2026 | prnewswire.com | High |
| Function Health: $2.5B valuation, $298M Series B | PRNewswire / TFN | Nov 2025 | techfundingnews.com | High |
| Function Health: 500K members, 100M+ lab tests | TFN citing Function | Jul 2026 | techfundingnews.com | Medium |
| Hims & Hers 2025 revenue $2.35B +59% YoY | SEC 8-K | Feb 2026 | investors.hims.com | High |
| Hims & Hers 2026 guidance $3.1–3.3B (updated) | Q2 earnings | 2026 | investors.hims.com | High |
| Novo Nordisk + Hims deal; compounding GLP-1 ended | Reuters / CNBC | Mar 9, 2026 | reuters.com; cnbc.com | High |
| FDA proposed excluding semaglutide/tirzepatide from 503B bulks list | Epstein Becker Green / Pharmacy Times | Apr 30, 2026 | healthlawadvisor.com | High |
| PCAC recommended 6 peptides for 503A bulks list | McDermott Law / Mondaq / LegitScript | Jul 23–24, 2026 | mcdermottlaw.com | High |
| 4 states ban AI therapy (IL, NV, RI, ME) as of Jul 20, 2026 | Psychology.com | Jul 2026 | psychology.com | High |
| Zero generative AI mental health devices authorized, Aug 2026 | Resolv Social | Aug 2026 | resolv.social | High |
| Woebot consumer app retired Jun 30, 2025 | Behavioral Health Business | Apr 2025 | bhbusiness.com | High |
| Talkspace 2025 revenue $228.9M; DTC revenue -30.4% YoY Q4 2025 | SEC EX-99.1 | Feb 2026 | sec.gov | High |
| Talkspace 2026 guidance $275–290M | SEC EX-99.1 | Feb 2026 | sec.gov | High |
| VITL: $7.5M Series A, 630 clinics, 1,000+ prescribers | BusinessWire | Mar 26, 2026 | businesswire.com | High |
| CurifyLabs: $14M Series A | BioSpace | Jul 6, 2026 | biospace.com | High |
| Fountain Life: $18M Series B, $108M total | TechCrunch | Aug 13, 2025 | techcrunch.com | High |
| Superpower: $30M Series A, 100K+ members | Fierce Healthcare | Apr 2025 | fiercehealthcare.com | High |
| Lucis: $28M total ($8.5M seed + $20M A) | Lucis.life / NEWSx.io | May 2026 | lucis.life | High |
| 33 states have CPOM restrictions | FUSE Health 2026 | 2026 | fusehealth.com | Medium |
| Oregon SB 951: strictest CPOM law, effective Jan 2026 | FUSE Health | 2026 | fusehealth.com | High |
| Done Global DOJ prosecution: CPOM principles in federal criminal analysis | Ropes & Gray | Jan 2026 | ropesgray.com | High |
| Noom median tenure ~4.2 months, realized LTV ~$290 | D2C Times | 2026 | d2c-times.com | Low (estimated by third-party analytics) |
| US concierge market +80% practice growth 2018–2023 | Health Affairs study cited by NextMD | 2026 | nextmd.ai | Medium |

---

## 10. Investor Activity Summary

### Active Investors in Personal Medicine (2025–2026)

| Investor | Notable Deals | Thesis Signal |
|---|---|---|
| General Catalyst (CVF) | Function Health $450M growth financing (Jul 2026) | Customer-value-fund non-dilutive structure; backing the biomarker OS play |
| Redpoint Ventures | Function Health Series B lead (Nov 2025) | Biomarker + longevity at scale |
| a16z (Andreessen) | Function Health Series B participation; Levels Health Series A | Consumer health with data moat |
| Forerunner Ventures | Superpower Series A lead (Apr 2025) | Consumer preventive health brand |
| SignalFire | VITL Series A (Mar 2026) | Infrastructure/OS plays in cash-pay health |
| Sandwater / HealthCap | CurifyLabs Series A (Jul 2026) | EU compounding technology |
| Singular / GC / YC | Lucis seed + Series A (2025–2026) | EU biomarker interpretation |
| EOS Ventures | Fountain Life Series B (Aug 2025) | Premium longevity clinic chain |
| Talkspace / Spring Health investors | B2B behavioral health channel | Payor-reimbursed mental health |

### Valuation Benchmarks (personal medicine)

| Stage | Typical Range | Evidence |
|---|---|---|
| Pre-seed (clinic OS, personal product) | $2–5M post | VITL pre-seed equivalent; LongevOS |
| Seed | $8–15M post | Lucis $8.5M seed (2025); VITL prior rounds |
| Series A | $25–60M post | VITL $7.5M A at ~$35M est.; Superpower $30M at ~$80M est. |
| Series B+ | $200M–2.5B | Function Health $298M B at $2.5B; Fountain Life $108M total |

---

## 11. Monastery Filter Assessment

**Screening questions from slides.md applied to personal medicine:**

1. **Buyer is parent / licensed professional / ministry — not a district RFP?** ✅ YES. Cash-pay patient directly. Or DPC physician buying a tool for their practice.

2. **They own an outcome (not a seat license)?** ✅ YES if you ARE the clinic (membership fee = ownership of outcome). ❌ NO if you are selling SaaS to the clinic.

3. **Cheap evaluator exists?** ✅ YES: biomarker improvement (lab values), biological age score, adherence rate, prescription renewal rate. These are measurable.

4. **Big Tech will not operate this?** ✅ YES with important nuance. Google / Amazon could build the interpretation layer (and are). But they cannot own a medical practice, cannot operate a compounding pharmacy, cannot hold a DEA number, cannot be the licensed physician. The clinical operator moat is real.

5. **$2M is the whole seed, not a deposit?** ✅ YES for the MSO-PC + 503A partner model. ❌ NO for building a physical longevity clinic or buying a pharmacy.

**Pass zones in personal medicine:**
- Clinic SaaS tools that compete with Vitel / LongevityPRO / LongevOS without a specific lock-in mechanism
- Consumer DTC coaching subscriptions (ChatGPT risk)
- Longevity clinic chains at seed (capex kills it)
- AI-only therapy products (regulatory/state ban risk)
- GLP-1 compounding (pathway closed)
- Biomarker testing / lab panel memberships (Function + Superpower already well-funded incumbents)

**Fund this shape:**
- AI-native DPC or functional medicine practice that owns the clinical P&L, not the software license
- 503A pharmacy partnership + peptide protocol clinic positioned for 2027 rulemaking
- Adherence layer embedded inside a licensed clinical practice with measurable outcome data
