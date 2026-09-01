# Personal Medicine: Technology & Regulation Deep-Dive
**Date**: 2026-09-01  
**Prepared by**: tech-researcher agent  
**Audience**: cyber•Fund GP / Monastery  
**Scope**: What actually enables personalized offline medicine — not drug discovery. What a Monastery-stage team can build vs. what requires a hospital system.

---

## Executive Summary

Personalized medicine in 2026 is a layered market with a sharp validity cliff: **cheap blood panels + OTC CGMs are real and scalable**; proteomics and polygenic scores are technically real but clinically immature for individuals; epigenetic clocks and microbiome panels for healthy adults are largely wellness theater. The regulation creates **two investable lanes**: (1) wellness-positioned AI health platforms that stay below the FDA device line, and (2) physician-supervised clinical tools that navigate the new Jan 2026 CDS guidance. Compounded peptides (GLP-1s, BPC-157) are in regulatory purgatory — not a stable supply chain for a startup. AI psychotherapy as standalone therapy is banned in 8+ states and has zero FDA-cleared products; as a clinician-augmentation tool, the evidence is strong and the regulatory path is opening.

---

## 1. Personalization Modalities: What's Real, What's Theater

### Cost & Clinical Validity by Layer (as of Sep 2026)

| Modality | Annual cost | Clinical validity | Actionability today |
|---|---|---|---|
| Standard blood panel (lipids, metabolic, hormones, thyroid) | $199–$499 | High — guideline-validated | High — physician can adjust treatment |
| OTC CGM (Stelo, Lingo) | $89–$99/month × 1-3 months | Moderate for behavior change | Educational (2-4 week window); not chronic surveillance |
| Pharmacogenomics (CYP2D6, CYP2C19) | $249–$399 one-time | High — clinically actionable | Directs drug dosing for 50+ medications |
| Polygenic risk score (WGS-based) | $349–$599 one-time | Low-moderate; extreme tails useful | Useful for CVD/breast cancer high-risk identification; poor individual prediction |
| Epigenetic age clock | $149–$569 | Moderate population-level; poor individual | Trending data may be actionable; single snapshot not |
| Gut microbiome (16S rRNA) | $279–$399 | Low for healthy adults | AGA: not validated for dietary guidance in healthy adults |
| Proteomics (SomaScan 11K) | $400–$700/sample | High discovery; low clinical translation | Research grade; no approved action protocols |
| Executive longevity program (WGS + imaging + labs + MD) | $8,000–$21,500/yr | Variable — depends on components | Some (Prenuvo body comp FDA-cleared); much is wellness |
| LLM on EHR / ambient scribing | $30–$100/physician/month | N/A (documentation) | High for documentation efficiency (20-30% time savings) |
| LLM for lab interpretation (wellness) | Included in membership | No validation for AI output quality | Lifestyle guidance; no clinical clearance |

### The Hard Truth About Each Modality

**Blood panels** are the highest-signal cheapest layer. The $199-$499/yr DTC platforms (Function Health, Superpower) run on established CLIA lab infrastructure with FDA-cleared assays. The AI interpretation is the differentiation — but those AI outputs are not cleared, validated for accuracy, or independently verified. Function Health sued Superpower in Jan 2026 for inflating biomarker counts (marketing ~100+ when actual unique analytes ~55).

**CGMs for non-diabetics** are a behavior-change device, not a diagnostic tool. Dexcom Stelo (FDA 510(k) cleared March 2024) and Abbott Lingo (June 2024) are the first OTC CGMs. Clinical evidence: ~1-2 kg weight loss benefit over 3-6 months in non-diabetic adults, mediated by behavior change. Useful as a 2-4 week educational window. The spike-chasing trap: most glucose excursions in healthy adults are physiologically normal and not actionable without context. Stelo explicitly says "user is not intended to take medical action based on the device output without consultation with a qualified healthcare professional."

**Polygenic risk scores** are structurally limited by ancestry bias (trained mostly on European genomes), population-level not individual-level prediction, and the absence of interventions that differ by PRS status (you still exercise and eat well regardless of your CVD PRS). The systematic review evidence (PMC12414691, 2026) shows a positive trend for cost-effectiveness in cancer/CVD screening, but RCTs are required before clinical adoption. The one area where PRS is clearly actionable today: pharmacogenomics (drug metabolism genes) — these are well-validated and change prescribing.

**Proteomics** (SomaScan 11K: $400-700/sample, 11,000 proteins) is technically extraordinary — cost-per-protein fell from $0.50-1.00 to <$0.05 — but the translational bottleneck is institutional, not technical. EMBO Molecular Medicine 2026 review: "proteomic studies are often retrospective and prioritize scale without anchoring assay design to a defined clinical decision point." No approved action protocols for healthy individual proteomics. The ProLM model (Nature Comms 2026) shows promise for population-level CVD prediction, but individual clinical utility remains unvalidated.

**Epigenetic clocks** (DunedinPACE, GrimAge, PhenoAge): validated as population-level biomarkers of aging rate. For an individual, a single clock reading is of limited value; trend over time (with intervention) is more meaningful. Not FDA-cleared for clinical use.

---

## 2. AI in Lab Journeys: What's Cleared vs What's Wellness

### The Regulatory Stack (post-Jan 6, 2026 FDA Guidance)

FDA released revised CDS guidance on January 6, 2026. The critical change: a single AI recommendation is now permissible as non-device CDS (enforcement discretion) if only one option is "clinically appropriate" AND the HCP can independently review the basis. Previously, multiple options were required.

**Non-device CDS criteria — all four required:**
1. Does not acquire/process/analyze medical images, signals, or patterns
2. Intended to display/analyze information about patient health or clinical practice
3. HCP can independently review the basis for the recommendation
4. Not intended to replace clinical judgment in time-critical decisions

**What this means for AI lab tools:**
- "Here are your lab results, here's what they mean" (wellness, general) → no FDA clearance needed
- "Your TSH of 4.8 suggests subclinical hypothyroidism; consider repeating in 6 months" (single recommendation, transparent basis, HCP-reviewable) → potentially non-device CDS under 2026 guidance
- "Based on your labs, I diagnose you with hypothyroidism and prescribe levothyroxine" → SaMD, clearance required, plus unlicensed practice issues
- Consumer-facing AI interpreting labs directly → FDA hasn't addressed; state medical boards are filling the vacuum

**Critical gap:** The Jan 2026 CDS guidance doesn't mention AI anywhere (despite being announced as AI guidance). The Aug 18, 2026 CDRH discussion paper on GenAI-enabled medical devices proposes a two-axis risk framework but is NOT final guidance. This means AI lab interpretation tools exist in a regulatory gray zone with uncertain FDA path but real state enforcement risk.

**The actual market reality:**
- Function Health: clinician notes + AI-generated protocol recommendations → wellness positioning
- Superpower: AI chat + aggressive supplement recommendations → stays in wellness lane by targeting healthy adults with lifestyle claims
- Neither has FDA clearance for any AI output; both use CLIA/CAP labs for the actual assay results

**What a team can ship today without FDA clearance:**
- AI-guided protocol after lab results (lifestyle, supplements, next tests to consider)
- Longitudinal tracking and trending
- AI recommendation to consult a specific specialist
- Educational content matched to biomarker patterns

**What requires FDA clearance (or risks enforcement):**
- Diagnosing a condition
- Recommending a prescription drug dose adjustment
- Monitoring a therapeutic intervention
- Anything for someone already diagnosed with a disease the tool is "treating"

---

## 3. Compounding & Peptide Manufacturing — The Actual Constraints

### GLP-1s: Effectively Closed

The entire ~$2B compounded GLP-1 market is being wound down:
- Semaglutide off shortage list Feb 2025; tirzepatide Dec 2024
- Both 503A and 503B compounding pathways closed as of April 1, 2026
- FDA proposed rule (Apr 30, 2026) to permanently exclude sema/tirzepatide/liraglutide from 503B list, citing "no clinical need"
- 3,901 comments filed by July 30, 2026; final rule pending but directionally clear
- Court challenges from outsourcing facilities association failed at preliminary injunction stage

**For a Monastery company:** Do not build a supply chain dependent on compounded GLP-1s. The window is closed.

### Wellness Peptides (BPC-157, TB-500, etc.): 12-24 Months Away at Best

PCAC July 23-24, 2026 voted to recommend 6/7 wellness peptides for 503A list:
- BPC-157 (wound healing, GI), TB-500 (wound healing), KPV, MOTS-c, Semax, Epitalon — all voted in
- Emideltide (DSIP) rejected

**Critical facts:**
- These votes are ADVISORY and NON-BINDING
- FDA's own staff scientists recommended AGAINST all 7 substances
- Legal compounding remains prohibited; rulemaking (12-24+ months) required before any change
- Even after 503A approval: patient-specific prescriptions only, state-licensed pharmacies, USP <797> sterility compliance
- BPC-157 remains on FDA safety-risk list for 503B — 503B will still be prohibited even if 503A is approved
- California has designated these "high-risk APIs" requiring state board approval

**For a Monastery company building peptide clinic protocols:** You have a 12-24 month window before the supply chain becomes legitimately legal at scale. Operating now = enforcement risk.

### Sterility Requirements: Non-Trivial Barrier to Entry

USP <797> 2023 revision governs all sterile injectable compounding:
- ISO 5 cleanroom required for sterile operations (ISO 7 buffer area, ISO 8 anteroom)
- Environmental monitoring, media fill testing, glove fingertip testing
- BUDs without stability data: **1 day at room temperature, 4 days refrigerated** (essentially useless for a clinic)
- BUDs with stability data: up to 45 days (Category 2) or 60-180 days (Category 3)
- Category 3 requires: stability-indicating analytical method, endotoxin testing, particulate testing, container-closure integrity testing, antimicrobial effectiveness testing

**The quality gap:** 2026 JAMA Health Forum secret-shopper study found 4 of 23 GLP-1 compounding pharmacies lacked the license required for sterile compounding. The compounding pharmacy that has the cleanroom, the testing lab relationship, and the USP <797> compliance infrastructure is a real moat — not easily replicable by a clinic buying white-label product.

**For a Monastery company:** Partnering with a 503A pharmacy that has verified USP <797> compliance is viable. Building your own sterile compounding capacity from scratch is a regulatory, capital, and timeline obstacle incompatible with a 12-week accelerator.

---

## 4. Clinical Decision Support vs. Practicing Medicine

### The Three-Layer Legal Framework (Sep 2026)

**Layer 1 — FDA federal:**
- Jan 6, 2026 CDS guidance: single AI recommendation to HCP = non-device CDS if transparent + not time-critical + not image/signal
- Aug 18, 2026 CDRH GenAI discussion paper: two-axis risk framework proposed; NOT final guidance
- FDA is effectively silent on consumer-facing AI health tools (choosing not to regulate proactively)

**Layer 2 — State medical boards:**
- Pennsylvania Board of Medicine sued Character.AI May 1, 2026 — first enforcement via Medical Practice Act (not AI law)
- Legal theory: standard Medical Practice Act prohibitions on unlicensed practice apply to AI systems
- "Holding itself out" as a licensed medical professional = violation
- Disclaimers insufficient if system functionality implies professional credentials
- Any state with broadly-worded unlicensed practice prohibition = same enforcement risk
- Pennsylvania created AI Enforcement Task Force + public reporting portal for chatbot medical advice

**Layer 3 — State corporate practice of medicine:**
- Many states prohibit non-physician entities from employing physicians or controlling medical decisions
- Relevant for any startup trying to own the physician relationship vs. software-into-existing-practice model

**Safe harbor design for 2026 wellness/health AI:**
- Target healthy adults with lifestyle goals (not patients with diagnosed conditions)
- Require licensed clinician review before protocol changes affect therapeutic decisions
- Display transparent reasoning (not black-box outputs)
- No professional credential claims ("Dr. AI" framing = enforcement target)
- No time-critical clinical decisions
- Explicit disclosure: "This is not medical advice"
- HIPAA BAA with any lab/EHR partners

**The Utah outlier:** Utah launched a pilot allowing AI to autonomously prescribe routine refills — the opposite direction of most states. Relevant for companies looking for regulatory sandboxes.

---

## 5. AI Psychotherapy: Evidence, Bans, Safety Failures

### The Evidence — Honest Reading

**What works:**
- Mild anxiety and mild-moderate depression: multiple RCTs, small-to-moderate effect sizes (SMD -0.35 to -0.43), comparable to guided self-help
- Psychoeducation: strong evidence that AI can teach CBT concepts effectively
- Access expansion: 24/7 availability, no waitlist, low cost, no stigma
- 2026 JAMA Network Open RCT (N=995): AI outperformed group therapy for anxiety reduction, comparable for depression. This is the strongest evidence to date.

**What doesn't work:**
- Moderate-severe depression: evidence is weak to absent
- PTSD: no benefit in 2026 JAMA RCT
- Replacing human therapy: AI is "significantly inferior" to face-to-face therapy in all studies
- Crisis management: AI lacks mandated reporting obligations, misses harm signals, has no escalation protocol without human design

**The Woebot/Wysa positioning:**
- Both built on structured CBT with clinical oversight — not general-purpose LLMs
- Woebot: pursuing FDA De Novo classification (structured therapeutic programs, not open-ended chat)
- Wysa: FDA Breakthrough Device Designation for chronic pain + anxiety/depression
- **Neither is commercially cleared as of Sep 2026.** Zero GenAI mental health products have FDA clearance.

### Bans and Restrictions (Sep 2026 Status)

States with enacted laws restricting standalone AI therapy: Illinois, Nevada, Tennessee, Vermont, Rhode Island, Colorado, Maine (2025-2026). California SB-903 pending.

**The Character.AI safety cascade:**
- Oct 2024: Sewell Setzer case filed — 14-year-old suicide attributed to Game of Thrones chatbot
- Nov 2025: Senate Judiciary Committee hearings; AMA urges Congress to prohibit chatbot diagnosis/treatment
- Jan 2026: Character.AI + Google settle teen harm/suicide lawsuits in FL, TX, CO, NY (terms private)
- May 2026: Pennsylvania Board of Medicine sues Character.AI for unlicensed medical practice (Emilie psychiatrist persona)
- Character.AI response: banned minors from open-ended chats; separate LLM for under-18; parental controls

**The investable opportunity:** NOT standalone AI therapy. YES to:
- AI tools for licensed therapists (session prep, documentation, progress tracking, psychoeducation delivery between sessions)
- AI crisis triage that routes to human clinicians
- CBT delivery platform with licensed therapist oversight (compliant with IL/CA/CO law since they allow administrative AI use)

---

## 6. Monastery Investment Filter: Ship vs. Need a Hospital

### What a Monastery Team ($2M, 12 Weeks) Can Ship

**Viable Monastery plays in personalized medicine:**

**A) AI-Guided Lab Journey Platform**
- What it is: "Bring your own labs" + AI protocol generator + longitudinal tracking + next-test recommendation
- Regulatory lane: Wellness app. No FDA clearance needed if targeting healthy adults with lifestyle claims. CLIA lab partnership (don't own the lab).
- Moat: Proprietary protocol library, longitudinal biomarker database, personalization engine
- Revenue model: $199-$499/yr subscription; lab partnership revenue share; supplement/Rx marketplace
- Risk: Supplement upsell → Superpower lawsuit pattern; AI interpretation quality → trust erosion
- Examples: Function Health, Superpower (both venture-backed, both viable — question is moat)

**B) AI-Native Functional Medicine Practice**
- What it is: Software platform enabling physician-supervised AI care coordination, test ordering, result interpretation, protocol generation
- Regulatory lane: CDS software for HCPs. Jan 2026 FDA guidance creates room for single-recommendation AI with transparent basis. HCP reviews everything.
- Moat: Protocol library + physician supervision model + data flywheel
- Revenue model: Membership ($1,500-$5,000/yr); insurance billing via physician MSO structure
- Path: Parsley Health took 10 years to build to $100M raise + nationwide insurance. A Monastery team builds the software layer, not the insurance network.
- Risk: Requires MSO or physician group as operating partner; state-specific licensing

**C) AI Mental Health Augmentation for Therapists**
- What it is: Tool for licensed therapists — session prep, homework assignment, between-session psychoeducation delivery, progress analytics
- Regulatory lane: Administrative/supplementary AI for licensed professionals = compliant with IL/CA/CO/VT laws
- Moat: Clinical workflow integration, outcome data, therapist network effects
- Revenue model: $50-$150/therapist/month SaaS; health system licensing
- Risk: AI therapy market stigma post-Character.AI; therapist adoption friction; competition from EHR players adding AI

**D) AI-Native Concierge Medicine Coordinator**
- What it is: Personal health OS — AI pulls together labs, wearables, medical history, coordinates care across specialists, manages preventive protocols
- Regulatory lane: Not practicing medicine if it coordinates rather than directs. Requires physician on the platform for anything touching diagnosis/prescription.
- Moat: Integrated data layer (labs + wearables + EHR), continuity of relationship
- Revenue model: $200-$500/month membership; physician partnership model
- Risk: Competitive with Hone, Parsley; high CAC for concierge segment

### What Requires More Than $2M / 12 Weeks

**Requires hospital partnership or 2+ years:**
- Any FDA 510(k) clearance (minimum 18 months, typically 2-3 years + $500K-$2M in legal/regulatory)
- Building a compounding pharmacy (503A: state licensure, USP <797> cleanroom, $1M+ capex)
- Insurance contracting network (typically 18-36 months per plan)
- Clinical trials for novel protocols

**Requires PE/GC capital ($10M+):**
- Physical clinic network (Fountain Life, Neko Health model: $10M+ per city)
- Full-body MRI network (Prenuvo raised $120M for 16 cities)
- 503B outsourcing facility (cGMP manufacturing, FDA registration, $5M+ buildout)

**Is actually a Big Tech feature (no moat):**
- Basic lab interpretation (Apple Health + Quest already partnering)
- Generic AI health chat (OpenAI, Anthropic, Google building health-specific models)
- Symptom checker (WebMD, Ada, Babylon have 10-year head starts)

---

## 7. Key Regulatory Risks for Any Monastery Personal Medicine Company

1. **State medical boards filing unlicensed practice suits**: The Pennsylvania/Character.AI model shows state boards don't need AI-specific law. Position as wellness + require physician review.

2. **FDA device reclassification**: If your tool starts making clinical claims or gains traction treating sick people, FDA may reclassify as SaMD. Build the safe harbor design from day one.

3. **Compounding supply chain instability**: GLP-1s are done. Wellness peptides are pending rulemaking (12-24 months). Don't build a clinical protocol business on an illegal supply chain.

4. **Data liability**: HIPAA + emerging state health privacy laws (Texas HB149/SB1188, California CMIA) mean any health data touching a patient requires BAA, explicit consent, and data minimization.

5. **Character.AI precedent effect**: Teen mental health + AI is politically toxic. Any mental health AI startup will face due diligence scrutiny on: crisis protocol, mandated reporting, age verification, LLM behavior under adversarial prompting.

6. **Insurance fraud risk**: Any company billing insurance for AI-delivered services (claiming physician review when review is cursory) faces False Claims Act exposure. Parsley Health model works because physician review is real.

---

## 8. Sources Index

| Topic | Source | Date | URL |
|---|---|---|---|
| Multi-omics pricing | Longevity Fit Life | Aug 18, 2026 | https://longevityfit.life/blog/en/multi-omics-and-epigenetic-clocks-offerings-turnaround-and-price |
| Function vs Superpower | Biohacker Atlas | 2026 | https://biohackeratlas.com/at-home-blood-tests/function-health-vs-superpower/ |
| Dexcom Stelo FDA clearance | Innolitics / FDA 510(k) K234070 | March 2024 | https://fda.innolitics.com/device/K234070 |
| CGM clinical evidence | WeightFAQ | 2026 | https://weightfaq.com/weight-loss/continuous-glucose-monitors-for-weight-loss/ |
| ZOE validity | HealthRX | 2026 | https://healthrx.com/brands-zoe/overview |
| PRS systematic review | PMC12414691 | 2026 | https://pmc.ncbi.nlm.nih.gov/articles/PMC12414691/ |
| PRS critical appraisal | Springer Community Genetics | 2023 | https://link.springer.com/article/10.1007/s12687-023-00645-z |
| PRS clinical implementation | European Journal of Human Genetics | 2025 | https://www.nature.com/articles/s41431-025-01931-9 |
| SomaScan cost/precision | SomaLogic + ResearchIntelo 2034 market report | 2026 | https://somalogic.com/somascan-unique-scale/ |
| Proteomics translational bottleneck | EMBO Molecular Medicine | 2026 | https://link.springer.com/article/10.1038/s44321-026-00468-8 |
| FDA 2026 CDS guidance | Nixon Peabody | Jan 27, 2026 | https://www.nixonpeabody.com/insights/alerts/2026/01/27/for-2026-fda-signals-shifts-in-digital-health-framework |
| FDA 2026 CDS guidance | Arnold & Porter | Jan 2026 | https://www.arnoldporter.com/en/perspectives/advisories/2026/01/fda-cuts-red-tape-on-clinical-decision-support-software |
| FDA 2026 CDS — 5 takeaways | Covington & Burling | Jan 2026 | https://www.cov.com/en/news-and-insights/insights/2026/01/5-key-takeaways-from-fdas-revised-clinical-decision-support-cds-software-guidance |
| FDA GenAI device discussion paper | Wilson Sonsini JDSupra | Aug 2026 | https://www.jdsupra.com/legalnews/fda-introduces-a-potential-review-5114709/ |
| Ambient AI scribe 2026 | SOAP Note AI | 2026 | https://www.soapnoteai.com/soap-note-guides-and-example/ambient-ai-scribe-adoption-2026/ |
| GLP-1 503B proposed exclusion | Frier Levitt | Apr 2026 | https://www.frierlevitt.com/articles/fda-glp1-503b-bulks-list-proposed-exclusion-semaglutide-tirzepatide-liraglutide/ |
| GLP-1 503B comment closure | Peptide Catalog | Jul 2026 | https://thepeptidecatalog.com/articles/fda-503b-glp1-comment-period-closed |
| Peptide PCAC July 2026 | PharmaDossier | Aug 2026 | https://pharmadossier.com/blog/fda-503a-wellness-peptide-compounding-vote-july-2026 |
| BPC-157 legal status | Rx.com | Aug 2026 | https://rx.com/education/is-bpc-157-legal-2026 |
| PCAC review detail | Modern Peptide Science | Aug 2026 | https://www.modernpeptidescience.com/articles/fda-pcac-july-2026-peptide-review/ |
| 503A vs 503B peptide compliance | PeptideStaff | 2026 | https://peptidestaff.com/news/503a-503b-peptide-compounding-compliance-guide-2026/ |
| USP 797 BUDs | Wolters Kluwer | 2024 | https://www.wolterskluwer.com/en/expert-insights/usp-forum-update-beyond-use-dates-buds |
| Sterile compounding 2026 | Nationwide Compounding | 2026 | https://nationwidecompounding.com/sterile-vs-non-sterile-compounding-pharmacy/ |
| AI therapy meta-analysis | PMC12661615 | 2026 | https://pmc.ncbi.nlm.nih.gov/articles/PMC12661615/ |
| AI therapy JAMA RCT | JAMA Network Open | 2026 | https://doi.org/10.1001/jamanetworkopen.2026.6713 |
| FDA mental health AI status | Resolv Social | Aug 2026 | https://www.resolv.social/topics/fda-ai-mental-health-status |
| State AI therapy regulation | KFF Monitor | 2026 | https://www.kff.org/health-information-trust/different-state-regulatory-approaches-reflect-open-questions-about-ai-mental-health-tools/ |
| Character.AI/Google settlement | AP News | Jan 2026 | https://apnews.com/article/ai-chatbot-lawsuits-character-google-fbca4e105b0adc5f3e5ea096851437de |
| California SB-903 | California Legislature | 2025-26 | https://leginfo.legislature.ca.gov/faces/billCompareClient.xhtml?bill_id=202520260SB903&showamends=false |
| PA sues Character.AI | Mondaq | May 2026 | https://www.mondaq.com/unitedstates/healthcare/1803986/ |
| PA Medical Board analysis | Norton Rose Fulbright | 2026 | https://www.nortonrosefulbright.com/en-us/knowledge/publications/c3859cd9/ |
| AI scribe governance | IHS Online | 2026 | https://www.ihsonline.org/post/ambient-ai-medical-scribes-efficiency-gains-burnout-uncertainty-and-governance-risks |
| Fountain Life Series B | TechCrunch | Aug 2025 | https://techcrunch.com/2025/08/13/tony-robbins-and-peter-diamandis-longevity-company-fountain-life-raises-18m/ |
| Prenuvo $120M raise | Longevity Technology | 2024 | https://longevity.technology/news/prenuvo-reveals-120m-raise-and-adds-new-enhanced-health-assessments/ |
| Neko Health funding | EU Startups | Jul 2026 | https://eustartups.news/swedish-longevity-startup-neko-health-secures-265-million-sek-in-growth-funding/ |
| Parsley Health insurance | BusinessWire | Apr 30, 2026 | https://www.businesswire.com/news/home/20260430422012/en/Parsley-Health-Becomes-the-First-Functional-Medicine-Provider-to-Accept-Insurance-Nationwide |
| Forward Health defunct | Functional Med Finder | 2026 | https://functionalmedfinder.com/parsley-vs-forward-vs-galileo-2026 |
| Prosper Medical $16M | Fierce Healthcare | 2026 | https://www.fiercehealthcare.com/ai-and-machine-learning/prosper-medical-banks-16m-scale-ai-driven-concierge-care-platform |
