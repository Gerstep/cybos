# Agent: tech-researcher — Personal Medicine Tech & Regulation
**Date**: 2026-09-01  
**Scope**: Personalized offline medicine — technology layer, regulatory constraints, clinical validity  
**Audience**: cyber•Fund / Monastery investment decision

---

## 🔍 STARTING: tech-researcher analyzing Personalized Offline Medicine

---

## 1. What Personalization Is Real: Modality-by-Modality Breakdown

### 1A. Standard Blood Panels (Cheap, High Adoption)

**What exists:**
- **Function Health**: $499/yr, 110+ unique measured analytes, 2 draws/yr (annual + mid-year retest). Quest Diagnostics lab partner. No licensed clinician consultation; AI flags + clinician notes. No supplement marketplace.
- **Superpower**: $199-$349/yr (pricing changed), claimed 100+ metrics but independent analysis found ~55 unique measured analytes (rest are calculated ratios). Function Health filed suit Jan 2026 alleging marketing deception. AI chat 24/7. Aggressive supplement marketplace (realistic 3-yr TCO $15,000+ vs $597 base).
- Labs used: CLIA-certified, CAP-accredited. Most assays are FDA-cleared immunoassays. Some analytes use laboratory-developed tests (LDTs) validated under CLIA but not FDA-cleared.

**Clinical validity:**
- Routine chemistry, CBC, lipids, thyroid, hormones: well-validated, guideline-backed.
- Calculated scores (biological age, organ age): proprietary, not independently validated, not FDA-cleared.
- AI interpretation for lifestyle guidance: legally wellness, not diagnostic. "Not a stand-alone diagnosis" is the operative disclaimer.

**Cost per loop:**
- Base annual panel: $199-$499/yr
- With AI coaching: included in membership
- Operational loop (test → AI interpretation → protocol → retest): 6-12 months

**Sources:**
- Biohacker Atlas, Function Health vs Superpower comparison (2026): https://biohackeratlas.com/at-home-blood-tests/function-health-vs-superpower/
- Superpower biomarker methodology disclosure: https://superpower.com/biomarkers

---

### 1B. CGM / Wearables (Real Data, Limited Clinical Action)

**What exists:**
- **Dexcom Stelo**: FDA 510(k) cleared March 2024 (K233969). OTC for adults 18+, non-insulin users. Interstitial glucose via electrochemical sensor. 15-day sensor, readings every 15 min. $89/month (~$99 single month). MARD 8.3% published. No insulin dosing, no alarms. HSA/FSA eligible.
- **Abbott Lingo**: FDA 510(k) cleared June 2024. OTC general wellness for adults. 14-day sensor, 1 reading/min (20,000 readings/wear). ~$89/month. No published MARD from Abbott; independent testing ~9.3%. No insulin dosing.
- **FreeStyle Libre 3**: Prescription. For T1D/T2D on insulin. $75 w/ insurance, ~$140 cash.

**What CGM actually tells a non-diabetic:**
- Glucose excursions (spikes) after specific foods — personal but not predictive of disease in healthy range
- Pattern correlation with sleep, stress, exercise
- NOT: fasting insulin (the more relevant metric for metabolic health), insulin resistance index

**Clinical evidence for non-diabetic CGM:**
- RCT signal: ~1-2 kg weight loss over 3-6 months in non-diabetic adults, mediated by behavior change (not sensor)
- Practical use: 2-4 week educational window, not chronic surveillance
- ZOE (CGM + microbiome + blood fat): ~$600-950 first year. No fully independent RCT validation of food scores accuracy. Clinical actionability of microbiome 16S rRNA for healthy adults not validated by American Gastroenterological Association.

**Cost per loop:**
- OTC CGM: $89/month (typically use 1-3 months per year for educated user)
- Integrated ZOE program: $600-950/yr first year, $299-588 subsequent

**Sources:**
- FDA 510(k) K234070 (Stelo): https://fda.innolitics.com/device/K234070
- WeightFAQ CGM comparison (2026): https://weightfaq.com/weight-loss/continuous-glucose-monitors-for-weight-loss/
- GoodRx OTC CGM FAQs: https://www.goodrx.com/classes/medical-supplies-and-devices/otc-continuous-glucose-monitor-faqs
- ZOE analysis: https://healthrx.com/brands-zoe/overview

---

### 1C. Polygenic Risk Scores (PRS) — Promising but Clinically Constrained

**What exists:**
- Wellness WGS: $349-599 one-time (23andMe competitors, Human Longevity, Nebula Genomics)
- Clinical WGS: $599-975 for more complete sequencing + medical interpretation
- PRS outputs: cardiovascular disease, breast cancer, T2D, psychiatric risk estimates

**Clinical validity — honest assessment:**
- "Diagnostic and prognostic performance of PRSs alone is consistently low" — Springer Community Genetics 2023 (https://link.springer.com/article/10.1007/s12687-023-00645-z)
- PRS + clinical score combinations show only moderate improvement over clinical score alone
- Most useful for: identifying individuals at extreme tails of risk distribution (e.g., top 5-10% of CVD PRS = substantially elevated risk)
- Best-validated applications: breast cancer, prostate cancer, CVD, T2D
- Systematic review 2026: 24 cost-effectiveness studies, majority find positive trend for PRS in screening, but "limited real-world data, issues of representativeness" (PMC12414691)
- RCT evidence required before clinical adoption recommended

**Key limitation:** Ancestry bias. Most PRSs are more predictive in individuals of European ancestry. Admixed populations show degraded performance.

**NHS cost estimate for adding PRS to breast cancer risk stratification: £78/person** — making it economically viable if clinical utility is proven.

**Cost per loop:**
- One-time WGS + PRS calculation: $349-$599
- With physician interpretation: add $100-$500
- Update interval: PRS doesn't change (genome is static); clinical risk context updated annually

**Sources:**
- European Journal of Human Genetics 2025: https://www.nature.com/articles/s41431-025-01931-9
- PMC systematic review (2026): https://pmc.ncbi.nlm.nih.gov/articles/PMC12414691/
- Springer critical appraisal: https://link.springer.com/article/10.1007/s12687-023-00645-z

---

### 1D. Multi-Omics and Executive Programs (High Resolution, High Cost)

**What exists as of Aug 2026 (prices checked Aug 18, 2026):**
| Modality | Price | Typical use |
|---|---|---|
| Epigenetic age | $149–$569 | Biological age, organ-age estimates |
| Microbiome (16S rRNA) | $279–$399 | Gut activity, food suggestions |
| Metabolomics | $359+ | Organic acids, amino acids, metabolic pathways |
| Proteomic organ-age | $500–$800 | Protein-based organ age |
| Physician-led longevity memberships | $369–$999/month | Testing, coaching, supplements, updates |
| Executive longevity programs | $8,000–$19,000/yr | WGS + imaging + blood tests + proteomics + physician |
| Fountain Life membership | $10,500–$21,500/yr | 100+ biomarkers + AI app (Zori) + quarterly testing |
| Prenuvo Enhanced (body MRI + labs) | ~$2,500+ visit | Full-body MRI + blood biomarkers + AI body comp report |

**Proteomics specific (SomaScan, Olink):**
- SomaScan 11K: 11,000 proteins from 55 µL plasma sample. $400-700/sample at commercial reference labs (~$0.05/protein). Median CV 6.8%.
- Olink Explore HT: High specificity, lower CV for specific targets but lower overall count
- **Clinical bottleneck**: Translational gap from discovery to clinical actionability. Proteomic studies "often retrospective, prioritize scale without anchoring to defined clinical decision point" (EMBO Molecular Medicine 2026: https://link.springer.com/article/10.1038/s44321-026-00468-8)
- No regulatory approval for AI-driven proteomics-based diagnosis in general wellness

**Cancer multi-omics:**
- Tumor Profiler (TuPro) melanoma: diagnostic cost CHF 17,554 vs CHF 3,058 for standard NGS. No significant difference in outcomes vs standard care. (npj Precision Oncology 2025)

**Clinical validity of executive programs:**
- Most programs are wellness products even when expensive. Prenuvo Body Composition report has FDA clearance. Full-body MRI findings require physician interpretation and context.
- Epigenetic clocks (PhenoAge, GrimAge, DunedinPACE): validated population-level biomarkers of aging rate, not cleared for individual clinical decision-making

**Source:** Longevity Fit Life pricing comparison (Aug 18, 2026): https://longevityfit.life/blog/en/multi-omics-and-epigenetic-clocks-offerings-turnaround-and-price

---

### 1E. LLM on EHR — What's Real vs What's Aspirational

**What exists as of 2026:**
- **Ambient AI scribing**: Standard in majority of large health systems. Microsoft DAX Copilot, Abridge, Nabla, Suki validated in NEJM AI study. Documentation reduction 20-30%. >50% provider adoption by end 2026 projected.
- **LLM for lab result flagging**: Live at Function Health (clinician notes), Superpower (AI chat). Regulatory classification: wellness app if no diagnostic claims.
- **LLM for clinical decision support**: Actively being piloted at health systems. Regulatory status unclear — FDA Aug 18, 2026 discussion paper covers GenAI devices but no final guidance.

**The hard regulatory line:**
- Scribing (documentation of what clinician said) → administrative → no FDA clearance needed
- The moment tool generates clinical judgment clinician did not make → SaMD → FDA path required
- Consumer-facing AI diagnosing or treating = device or unlicensed medical practice

**FDA GenAI Device Discussion Paper (Aug 18, 2026 — CDRH):**
- Two-axis risk framework: function type × risk level
- Competency-based assessment approach
- Requires pre-market benchmarking + clinical confirmation
- Clinical confirmation not necessarily a prospective RCT — can be clinically representative conditions
- This is a discussion paper soliciting feedback, NOT guidance. No product approvals under this framework yet.

**Sources:**
- Wilson Sonsini JDSupra (Aug 2026): https://www.jdsupra.com/legalnews/fda-introduces-a-potential-review-5114709/
- VertiComply AI scribe 2026 guide: https://verticomply.com/blog/build-hipaa-compliant-ai-medical-scribe-2026
- SOAP Note AI adoption: https://www.soapnoteai.com/soap-note-guides-and-example/ambient-ai-scribe-adoption-2026/

---

## 2. AI Role in Lab Journeys: Cleared vs Lifestyle

### Regulatory Classification Map

| Tool type | Example | FDA status | Notes |
|---|---|---|---|
| OTC CGM (non-diabetic) | Dexcom Stelo, Abbott Lingo | FDA 510(k) cleared 2024 | Cleared for lifestyle/wellness use, not insulin dosing |
| Blood panel portal + AI flags | Superpower, Function Health | Not FDA-cleared (LDTs + wellness claims) | CLIA lab + physician oversight satisfies state rules |
| Ambient scribing | DAX Copilot, Abridge | Not FDA-cleared (documentation = administrative) | HIPAA compliance required, not SaMD |
| Single-recommendation AI CDS to HCP | Hypothetical protocol suggester | Non-device CDS if meets 2026 guidance criteria | Must be transparent, HCP-reviewable, non-time-critical |
| Consumer-facing diagnostic AI | General LLM answering "do I have diabetes?" | Not cleared — likely SaMD if treatment claims | Enforcement risk via state medical boards |
| GenAI mental health chatbot | Woebot, Wysa | Woebot: pursuing De Novo. Wysa: Breakthrough Device Designation | Neither commercially cleared for treatment claims |
| AI chatbot impersonating physician | Character.AI's "Emilie" | Enforcement action (PA Board of Medicine, May 2026) | Unauthorized practice of medicine |

### The 2026 FDA CDS Guidance (Jan 6, 2026) — Key Changes

**Non-device CDS must meet all four criteria:**
1. Not intended to acquire/process/analyze medical images or signals
2. Displays/analyzes information re: patient health or clinical practice
3. Healthcare professional can independently review the basis for the recommendation
4. Not intended to replace clinical judgment for time-critical events

**The new Criterion 3 enforcement discretion (biggest change from 2022):**
- Previously: must display multiple options to qualify as non-device CDS
- Now (2026): single recommendation OK IF only one is "clinically appropriate" AND HCP can review basis
- Does NOT apply to: time-critical decisions (e.g., CVD event in next 24 hours) or image/signal analysis
- AI tools can qualify IF transparent logic and clinician-reviewable

**What's still unaddressed:**
- AI is mentioned ZERO times in the Jan 6, 2026 guidance (called AI guidance by FDA Commissioner)
- GenAI prescription renewals, referral letters, consumer chatbots = regulatory void
- FDA plans to revise Policy for Device Software Functions in FY2026 (update pending as of Sep 2026)

**Sources:**
- Nixon Peabody (Jan 27, 2026): https://www.nixonpeabody.com/insights/alerts/2026/01/27/for-2026-fda-signals-shifts-in-digital-health-framework
- Arnold & Porter (Jan 2026): https://www.arnoldporter.com/en/perspectives/advisories/2026/01/fda-cuts-red-tape-on-clinical-decision-support-software
- Covington & Burling 5 key takeaways: https://www.cov.com/en/news-and-insights/insights/2026/01/5-key-takeaways-from-fdas-revised-clinical-decision-support-cds-software-guidance
- Orrick summary: https://www.orrick.com/en/Insights/2026/01/FDA-Eases-Oversight-for-AI-Enabled-Clinical-Decision-Support-Software-and-Wearables
- Resolv Social (FDA AI mental health status, updated Aug 2026): https://www.resolv.social/topics/fda-ai-mental-health-status

---

## 3. Compounding / Peptide Manufacturing Constraints

### 3A. GLP-1s (Semaglutide, Tirzepatide, Liraglutide) — Effectively Dead for Compounders

**Timeline:**
- 2022: GLP-1s added to FDA shortage list → compounding legal under 503A and 503B
- Dec 2024: Tirzepatide off shortage list
- Feb 2025: Semaglutide off shortage list
- April 1, 2026: Neither semaglutide nor tirzepatide on 503B Bulks List OR shortage list → both 503A and 503B compounding pathways closed
- April 30, 2026: FDA proposed rulemaking to permanently exclude sema/tirzepatide/liraglutide from 503B Bulks List (91 FR 23431)
- July 30, 2026: Public comment period closed — 3,901 comments filed
- September 2026: Final rule not yet issued; under review

**Current legal status:**
- 503B outsourcing facilities: CANNOT compound sema/tirzepatide (no shortage, not on 503B list)
- 503A pharmacies: CANNOT compound patient-specific sema/tirzepatide (not on 503A bulks list; off shortage list)
- Liraglutide: Still on shortage list as of Sep 2026 → 503B still technically possible, but FDA proposal would close this permanently

**Business implication:** Entire ~$2B compounded GLP-1 market is winding down unless court challenges succeed or a new shortage designation occurs.

**Sources:**
- Frier Levitt (updated to reflect Apr 30 proposed rule): https://www.frierlevitt.com/articles/fda-glp1-503b-bulks-list-proposed-exclusion-semaglutide-tirzepatide-liraglutide/
- Peptide Catalog (3,901 comments): https://thepeptidecatalog.com/articles/fda-503b-glp1-comment-period-closed
- OnHealthcare Tech (Part II): https://www.onhealthcare.tech/p/fda-closes-the-503b-bulks-door-on

---

### 3B. Wellness Peptides (BPC-157, TB-500, KPV, etc.) — Pending, Not Yet Legal

**PCAC July 23-24, 2026 votes:**
| Peptide | Vote | Recommended indications | Immediate effect |
|---|---|---|---|
| BPC-157 | 8-6 in favor, 1 abstain | Ulcerative colitis, wound healing, obesity | None — advisory only |
| TB-500 (Thymosin Beta-4) | 8-6 in favor, 1 abstain | Wound healing | None |
| KPV | 8-6 in favor, 1 abstain | Wound healing, inflammatory conditions | None |
| MOTS-c | 7-5 in favor, 2 abstain | Obesity, osteoporosis | None |
| Semax | 8-5 in favor, 1 abstain | — | None |
| Epitalon | 7-4 in favor, 1 abstain | — | None |
| Emideltide (DSIP) | REJECTED 6-7, 1 abstain | — | Stays off list |

**Key legal fact:** The PCAC vote is ADVISORY AND NON-BINDING. FDA must:
1. Accept the committee's recommendation (not obligated)
2. Publish proposed rule in Federal Register
3. Open public comment period
4. Issue final rule

**Realistic timeline:** 12-24+ months from July 2026, so no earlier than mid-2027.

**Additional constraints:**
- BPC-157 is on FDA's safety-risk list for 503B — 503B cannot use it regardless
- FDA's own staff scientists recommended AGAINST all 7 substances — the committee overrode this. FDA Commissioner not bound to follow.
- California state board (Nov 2025 policy): BPC-157 and similar peptides designated "high-risk APIs" — California pharmacies need board approval to ship in-state
- At least 9 states require pharmacists to verify every compounded injectable API is USP/NF-recognized

**Sources:**
- PharmaDossier (Aug 2026): https://pharmadossier.com/blog/fda-503a-wellness-peptide-compounding-vote-july-2026
- Rx.com BPC-157 legal status (Aug 2026): https://rx.com/education/is-bpc-157-legal-2026
- Modern Peptide Science PCAC summary: https://www.modernpeptidescience.com/articles/fda-pcac-july-2026-peptide-review/
- AJMC (FDA panel): https://www.ajmc.com/view/fda-panel-backs-6-peptides-for-compounding

---

### 3C. Sterility and Stability Requirements (USP 797 2023 Revision)

**The standard that governs sterile injectable compounding:**

**USP <797> 2023 revision (effective Nov 1, 2023):**
- ISO cleanroom classification required (ISO 5, 7, 8 depending on activity)
- Environmental monitoring, garbing, media fill testing, glove fingertip testing
- BUDs now based primarily on compounding environment, not complexity

**BUD categories for sterile injectables:**
| Category | BUD (refrigerated) | Requirements |
|---|---|---|
| Default (no testing) | 4 days | — |
| Category 2 (with testing) | Up to 45 days | Sterility + stability data |
| Category 3 (extended) | 60-180 days | Full stability-indicating analytical method, endotoxin testing, particulate testing, container-closure integrity, antimicrobial effectiveness testing |

**For peptide injectables specifically:**
- Most peptides degrade, aggregate, or oxidize → stability studies required for any BUD beyond default
- Reconstituted injectable peptides in multi-dose vials: typically 28-30 days refrigerated, but requires stability data to support
- Every peptide/formulation combination requires its own BUD validation

**Compliance reality check:**
- 2026 JAMA Health Forum secret-shopper study: 4 of 23 compounding pharmacies supplying GLP-1 drugs lacked required sterile compounding license
- 503A pharmacies: USP <795>/<797> are minimum standards; no FDA inspection (state boards inspect)
- 503B outsourcing facilities: USP <795>/<797> as floor + FDA cGMP requirements + FDA inspection

**Sources:**
- PeptideStaff 503A/503B compliance guide 2026: https://peptidestaff.com/news/503a-503b-peptide-compounding-compliance-guide-2026/
- Nationwide Compounding 2026 guide: https://nationwidecompounding.com/sterile-vs-non-sterile-compounding-pharmacy/
- Pharmacy Times (USP 795/797 peptides): https://www.pharmacytimes.com/view/as-peptides-go-mainstream-usp-795-and-797-matter-more-than-ever
- Wolters Kluwer BUD updates: https://www.wolterskluwer.com/en/expert-insights/usp-forum-update-beyond-use-dates-buds

---

## 4. Clinical Decision Support vs. Practicing Medicine (2026 Regulatory Map)

### The Line as of September 1, 2026

**Three governing frameworks:**

**A) FDA (federal):**
- Jan 6, 2026 CDS guidance: single-recommendation AI tool can be non-device CDS if transparent + HCP-reviewable + not time-critical + not image/signal analysis
- 2026 guidance is "AI-silent" — AI not mentioned despite being announced as AI policy
- Aug 18, 2026 GenAI device discussion paper: building toward a framework, but NOT final guidance
- Consumer-facing chatbots: not addressed, regulatory void

**B) State medical boards (state):**
- PA Board of Medicine sued Character.AI May 1, 2026 for unlicensed practice of medicine under Medical Practice Act (not under AI-specific statute)
- No AI-specific law needed — any state's broadly-worded Medical Practice Act can apply
- Utah contrast: launched pilot program allowing AI to autonomously prescribe routine refills (2026)
- Key enforcement test: does the AI "hold itself out" as a licensed professional? → unlicensed practice
- Platforms can be held liable for chatbot outputs even when third-party users create characters

**C) "Practicing medicine" doctrine:**
- Providing individualized medical advice = practicing medicine (requires licensure)
- General wellness information to healthy adults = permissible
- The line: "general" vs "individualized/specific to this patient's condition"
- Disclaimers are insufficient if system functionality implies professional credentials
- AI health coaches in "wellness" positions with physician supervision currently operate in a gray zone

**Key precedents set in 2026:**
1. PA sued Character.AI May 1, 2026 — first enforcement using unlicensed practice doctrine against AI (Mondaq: https://www.mondaq.com/unitedstates/healthcare/1803986/)
2. Character.AI/Google settled teen harm/suicide lawsuits January 2026 (terms private, pending court approval)
3. FDA's Jan 6 guidance implicitly creates room for AI CDS tools while leaving consumer AI unaddressed

**Safe harbor construction as of Sep 2026:**
- Position as wellness (not medical): healthy adults, lifestyle goals
- Require licensed clinician review before any protocol recommendation
- Display reasoning basis (not black-box outputs)
- No impersonation of licensed professionals
- No time-critical decision support
- HIPAA-compliant data handling

**Sources:**
- Covington 5 takeaways (Jan 2026): https://www.cov.com/en/news-and-insights/insights/2026/01/5-key-takeaways-from-fdas-revised-clinical-decision-support-cds-software-guidance
- Mondaq PA/Character.AI analysis: https://www.mondaq.com/unitedstates/healthcare/1803986/
- Norton Rose Fulbright analysis: https://www.nortonrosefulbright.com/en-us/knowledge/publications/c3859cd9/
- Mondaq FDA stands down analysis: https://www.mondaq.com/unitedstates/food-and-drugs-law/1789562/

---

## 5. AI Psychotherapy: Evidence, Bans, Safety Failures

### Clinical Evidence Base

**What the RCTs show as of 2026:**

**Meta-analysis (PMC12661615, 2026): 31 RCTs, 29,637 participants, ages 15-39:**
- Overall SMD for mental distress reduction: -0.35 (95% CI -0.46 to -0.24) = small-to-moderate
- Depression: SMD -0.43; Anxiety: SMD -0.37; Stress: SMD -0.41
- Life satisfaction: modest improvement only
- Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC12661615/

**JAMA Network Open RCT 2026 (N=995 Israeli university students, 3-arm):**
- AI vs group therapy vs waitlist
- AI > group therapy for anxiety reduction (MD -2.17 on GAD-7)
- AI > waitlist for depression reduction (MD -1.99 on PHQ-9)
- AI > group therapy AND waitlist for well-being
- Therapeutic alliance correlated with symptom improvement (β = -0.58)
- Source: https://doi.org/10.1001/jamanetworkopen.2026.6713

**2025 Lancet Digital Health meta-analysis (28 RCTs):**
- Cohen's d = 0.52 for AI vs waitlist controls
- "Non-inferior" to human-delivered guided self-help
- "Significantly inferior" to face-to-face therapy
- Evidence quality: strong for mild/moderate depression, anxiety; weak for moderate-severe

**What these tools can and cannot do:**
| Condition | Evidence level | Recommendation |
|---|---|---|
| Mild anxiety | Strong (multiple RCTs) | First-line or adjunct appropriate |
| Mild-moderate depression | Strong (multiple RCTs) | Adjunct with monitoring |
| Moderate-severe depression | Weak to none | Not appropriate as primary treatment |
| GAD | Moderate | Adjunct appropriate |
| PTSD | No benefit in JAMA 2026 RCT | Not appropriate |
| Crisis/suicidal ideation | Contraindicated standalone | Must have human escalation pathway |

**Cleared/designated products:**
- **Woebot**: CBT-based, 5M+ users. Pursuing FDA De Novo classification. Multiple JMIR-published RCTs.
- **Wysa**: FDA Breakthrough Device Designation (chronic pain + associated depression/anxiety). 36+ peer-reviewed publications. Cambridge, Harvard, WashU partnerships.
- **Neither is commercially cleared** for treatment claims as of Sep 2026.
- **Total FDA-cleared AI medical devices**: 1,524 as of Aug 2026. Zero are GenAI mental health products.

**Sources:**
- Resolv Social (updated Aug 2026): https://www.resolv.social/topics/fda-ai-mental-health-status
- AI Magicx guide 2026: https://www.aimagicx.com/blog/ai-mental-health-therapy-apps-guide-2026
- Wysa clinical evidence: https://www.wysa.com/clinical-evidence

---

### Regulation and Bans (State-by-State as of Sep 2026)

**States with AI therapy restrictions (enacted laws):**
| State | Law | What it restricts |
|---|---|---|
| Illinois | 2025 law | Licensed professionals cannot let AI directly engage with patients |
| Nevada | 2025 law | Restricts AI in mental health care |
| Utah | 2025 law | Data privacy + disclosure required; permits supervised AI use |
| Tennessee | 2026 law | Restricts AI in therapy |
| Colorado | 2026 law | Limits AI in therapy, allows administrative uses |
| Maine | 2026 law | Curbs AI use in therapy |
| Vermont | 2026 law | Restricts AI in mental health; explicitly allows administrative AI |
| Rhode Island | 2026 law | AI therapy restrictions + patient consent for AI documentation |
| California | SB-903 (2025-26 session) | AI limited to admin/supplementary support; bans AI companion chatbots claiming therapy; bans AI psychotherapy without licensed professional review |

**Pending legislation:** California and Pennsylvania both have pending bills restricting AI from independently delivering psychotherapy services.

**Key legal action:** Pennsylvania Board of Medicine v. Character Technologies, Inc. (May 1, 2026) — first state enforcement using Medical Practice Act, not AI-specific statute. Investigator found "Emilie" character claiming to be licensed psychiatrist with a fabricated Pennsylvania license number. Sought injunctive relief.

**Safety failures — Character.AI:**
- Jan 2026: Character.AI and Google reached settlement in principle on multiple teen suicide/harm lawsuits (FL, TX, CO, NY cases). Sewell Setzer case (14-year-old suicide allegedly linked to Game of Thrones chatbot) was most prominent. Terms undisclosed, pending court approval.
- Senate Judiciary Committee hearing Nov 2025: Parents urged comprehensive online safety legislation
- Character.AI remediation: separate LLM for under-18 users, stricter content restrictions, banned minors from open-ended character chats, parental controls
- Congressional hearing + AMA position: AMA urged Congress to prohibit chatbots from diagnosing/treating mental health, require FDA review

**The "AI psychosis" risk (emerging concern):**
- Term coined in clinical circles: misdiagnosis by AI → unsafe responses to suicidal users
- Unregulated AI therapists may miss crisis signals, lack mandated reporting obligations
- Risk is highest for general-purpose LLMs (Claude, GPT-4) used for therapy without clinical training — no crisis protocols, no state reporting requirements

**Sources:**
- Bloomberg Law (AI therapy chatbots spur state action): https://news.bloomberglaw.com/health-law-and-business/ai-therapy-chatbots-spur-states-to-act-over-patient-safety-fears
- KFF Monitor (state regulatory approaches): https://www.kff.org/health-information-trust/different-state-regulatory-approaches-reflect-open-questions-about-ai-mental-health-tools/
- AP News (Character.AI/Google settlement, Jan 2026): https://apnews.com/article/ai-chatbot-lawsuits-character-google-fbca4e105b0adc5f3e5ea096851437de
- CNN Business (settlement, Jan 7, 2026): https://www.cnn.com/2026/01/07/business/character-ai-google-settle-teen-suicide-lawsuit
- California SB-903 text: https://leginfo.legislature.ca.gov/faces/billCompareClient.xhtml?bill_id=202520260SB903&showamends=false

---

## 6. Competitive Landscape — Personalized Medicine Companies

### Premium/Executive Tier ($10K+/yr)
| Company | Model | Funding | Notable |
|---|---|---|---|
| Fountain Life | Multi-omics + physician + AI app (Zori) | $108M total ($18M Series B, Aug 2025) | $10,500-$21,500/yr; Naples, Orlando, Dallas, Westchester; expanding LA/Miami 2026 |
| Prenuvo | Full-body MRI + AI body comp | $120M Series B (2024) | FDA-cleared body comp report; 16 US cities + UK/EU/Australia expansion |
| Neko Health (Sweden) | Preventive health scans | 265M SEK (~$29M, Jul 2026) | Daniel Ek (Spotify founder); expanding to New York |
| Hone Health | Hormones + longevity + Prenuvo integration | Undisclosed | "Personalized OS for Longevity"; world's largest hormone data repository claimed |

### Mid-Market ($2K-$10K/yr)
| Company | Model | Funding | Notable |
|---|---|---|---|
| Parsley Health | Functional medicine telehealth | $100M (2026) | First functional medicine to accept insurance nationally (Apr 30, 2026); all 50 states; 50K+ patients |
| Prosper Medical | AI concierge primary care | $16M seed | FUSE-led; in-network insurance; physician-AI hybrid |
| Lifeforce | Hormones + supplements + AI | Undisclosed | HRT protocols; subscription model |

### Consumer Tier ($200-$1,500/yr)
| Company | Model | Funding | Notable |
|---|---|---|---|
| Function Health | 110+ biomarker blood panel | Undisclosed | $499/yr; Quest Labs; suing Superpower (2026) |
| Superpower | 150+ blood tests + AI protocol + supplements | Undisclosed | $349/yr; aggressive supplement upsell; Function lawsuit defendant |
| ZOE | CGM + microbiome + blood fat | Raised $147M total | ~$600-950/yr; UK-founded; Jonathan Wolf, Tim Spector |
| Stelo (Dexcom) | OTC CGM | Public (DXCM) | $89/month; FDA cleared 2024 |
| Lingo (Abbott) | OTC CGM | Public (ABT) | $89/month; FDA cleared June 2024 |

### Defunct
| Company | What happened |
|---|---|
| Forward Health | Raised $400M+ (peak $1B+ valuation, SoftBank), closed Nov 2024 after $100M round failed to fix unit economics |

---

## 7. 12/24/60 Month Forecast

### 12 Months (by Sep 2027)

**What will change:**
- **503A peptide compounding**: FDA expected to finalize rulemaking on BPC-157/TB-500/KPV et al. Best case: published in 503A list, patient-specific compounding legal at state-licensed pharmacies. Still NOT 503B.
- **FDA GenAI device framework**: Discussion paper (Aug 18, 2026) likely leads to final guidance or pre-submission pathway by H1 2027
- **State AI therapy regulation**: 12-18 more states expected to pass laws; California SB-903 likely enacted
- **OTC CGM + AI**: Integration with wearables (Oura, Whoop) + blood panels becoming standard consumer offering
- **Ambient AI scribing**: >75% provider adoption; multi-modal AI adding lab results and previous notes to real-time CDS

**What a Monastery team can ship in 12 months:**
- AI-guided lab journey: "bring your own labs" + AI interpretation → protocol → retest. Wellness positioning, no FDA clearance needed if no diagnostic claims.
- AI mental health augmentation tool: positions as clinical workflow tool for licensed therapists (admin + psychoeducation + session prep) — compliant with IL/CA/CO law if therapist reviews output
- AI concierge membership: white-label physician coverage + AI care coordination + curated testing partnerships

### 24 Months (by Sep 2028)

- **Proteomics panels** entering premium DTC offerings as costs fall; $400-700 SomaScan or equivalent accessible via membership
- **AI CDS tools** for lab interpretation getting first 510(k) clearances for specific narrow use cases (e.g., thyroid hormone panel + dosing recommendation)
- **Insurance reimbursement**: functional medicine / longevity protocols being negotiated into commercial plans (Parsley model expanding)
- **Some peptide clinics**: legally operating BPC-157/TB-500 protocols under 503A if FDA finalizes rule
- **AI therapy**: FDA likely to issue first guidance on when AI mental health tools require clearance; first De Novo applications from Woebot/Wysa cleared or in active review

### 60 Months (by Sep 2031)

- **PRS in routine care**: UK NHS integrating PRS into breast cancer/CVD screening; US commercial labs offering clinician-ordered PRS with protocol guidance
- **Proteomics as clinical standard**: SomaScan or equivalent integrated into high-end annual physicals as clinical (not wellness) test with reimbursement pathway
- **AI psychotherapy**: Some FDA-cleared AI augmentation tools for licensed therapist workflows; majority of states have stabilized regulation; patient-facing AI requires HCP oversight
- **Compounding market**: Either a new generation of approved peptide drugs (Novo/Lilly fast-follow on BPC-157 analogs if clinical evidence matures) OR continued boutique 503A market for individualized protocols
- **Longevity clinic economics**: Insurance reimbursement for preventive longevity programs in select plans; employer-sponsored longevity benefits growing

---

## Summary: Wellness Theater vs Real Personalization

**Real personalization today (evidence-backed, actionable):**
1. Standard blood panel (lipids, glucose, hormones, thyroid, CBC) — guideline-validated, cheap, actionable with physician
2. OTC CGM (2-4 weeks): educational metabolic window for non-diabetics
3. Pharmacogenomics panel: drug metabolism (CYP2D6, CYP2C19, etc.) — clinically actionable for drug prescribing
4. PRS for extreme-risk identification (CVD, breast cancer top quintile): useful addition to clinical risk assessment
5. Ambient AI scribing: proven burnout reduction, documentation efficiency

**Wellness theater (expensive, limited clinical action today):**
- Epigenetic clocks for individuals (population-validated, individual prediction poor)
- Microbiome sequencing for dietary guidance in healthy adults (AGA: not validated)
- Full-body MRI for healthy 30-year-olds without family history (incidentaloma risk)
- Proteomics panels in wellness context (no validated action protocols)
- Open-ended LLM chatbots as primary mental health care

**The gray zone (real but unvalidated, moving fast):**
- Proteomics + PRS combined risk models (ProLM: Nature Communications 2026)
- AI-guided test sequencing (which test to order next, based on current biomarkers)
- LLM-based therapy augmentation (supervised; evidence emerging fast)

---

🎯 **COMPLETED**: tech-researcher finished Personalized Offline Medicine technical + regulatory analysis
