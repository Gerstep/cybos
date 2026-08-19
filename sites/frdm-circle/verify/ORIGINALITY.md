# Originality audit — FRDM Circle landing page vs. Sylva

Method follows `agent-skills/codex/audit-reference-originality` from
[MengTo/Skills](https://github.com/MengTo/Skills) (MIT). Findings are
originality risks and overlaps, not legal conclusions.

**Verdict: clear in checked scope.**

## Why this audit exists

The build brief named [MengTo/sylva](https://github.com/MengTo/sylva) as the
reference. Sylva's README states:

> No license is granted for reuse or redistribution of the Sylva code, design,
> or artwork.

So Sylva could inform technique and nothing else. This audit exists to
demonstrate that it did.

## Two separate scopes

The audit deliberately distinguishes two things that would otherwise produce
false findings:

| Scope | Source | Expectation |
| --- | --- | --- |
| Code, layout, motion, shaders, identity | Sylva | **No overlap.** Technique only. |
| Marketing copy | frdmcircle.org | **Verbatim.** It is the client's own text and reproducing it is the brief. |

Copy fidelity against frdmcircle.org is verified separately and continuously
by `verify/copy-fidelity.mjs`, which checks all 153 source sentences.

## Checked source registry

| Artefact | Path | Proves |
| --- | --- | --- |
| Sylva repository | `git clone --depth 1 https://github.com/MengTo/sylva` | code, assets, copy, structure |
| Sylva `index.html` | 3,449 lines, read in full | markup, CSS, JS, GLSL |
| Sylva `sylva-assets/` | vendored Three r149, Lexend woff2, two liquid-metal WebGL2 documents, two field-note WebP images | assets |
| This page | `sites/frdm-circle/` | subject |

## Deterministic inventory

```bash
python3 agent-skills/codex/audit-reference-originality/scripts/build_evidence_inventory.py \
  --site sites/frdm-circle --reference /tmp/sylva \
  --output verify/evidence/originality-vs-sylva.json
```

| Check | Result | Reading |
| --- | --- | --- |
| Exact file matches | 1 | `licenses/THREE-LICENSE.txt`. Both projects vendor Three.js and therefore carry the identical upstream MIT text. Not a finding. |
| Historical exact matches | 1 | The same licence file. No Sylva blob has ever been committed to this repository. |
| Basename matches | 2 | `index.html` (a one-page site is called index.html) and the Three licence. Lead only. |
| Text overlap leads | 15 | Every one is either the vendored Three.js runtime or SIL OFL / MIT boilerplate. **Zero leads involve `index.html`, `assets/scene.js` or `assets/site.js`.** |
| Number overlap leads | 121 | Shared generic decimal literals such as `0.25` and `0.0`. The script's own notes flag these as expected false positives. |

The load-bearing result is the fourth row. The three files that contain all of
this page's authored markup, styling, layout, shaders and behaviour share **no
eight-word sequence** with any Sylva file.

## Category audit

| Category | Finding |
| --- | --- |
| Text | No Sylva string appears in the rendered page or the source. All copy traces to frdmcircle.org. |
| Brands | No Sylva name, mark or wordmark. The two brand images are extracted from frdmcircle.org's own inline base64. |
| Numbers | No shared metric. Sylva's figures (282 ha, 43 species, 190,000 blades) appear nowhere. The counts here are 10,000 stems and a live membership count of 0. |
| Images | No shared file, crop or derivative. Sylva's two field-note WebPs are not present. |
| Assets | Fonts differ (Lexend vs. Fraunces and Outfit). Three.js is shared but is upstream MIT, vendored independently at a different version (r149 vs. r160) and a different build (UMD vs. ES module). |
| Structure and motion | Different by construction — see below. |
| History | `git log` contains no Sylva path or blob. |

## Structure and motion, compared honestly

Where the two overlap is at the level of craft principles, which is what the
reference was for. Where they differ is everything an audience actually sees.

| | Sylva | This page |
| --- | --- | --- |
| Subject | A moss-covered root and arch | A ring garden around a pool |
| Palette | Dark forest, `#4a4d44` | Daylight, bone paper and leaf green |
| Value | Dark, nocturnal | Bright, sunlit |
| Scope | Hero only, one viewport | Nine sections and a live form |
| Layout | Absolute stage on a 1600×880 frame, `--u` units | Fluid 12-column editorial grid on `clamp()` |
| Type | Lexend | Fraunces and Outfit |
| Motion stack | Bespoke rAF, no libraries | GSAP, ScrollTrigger and Lenis |
| Geometry | Swept tube limbs, recursive offshoots, instanced blades on a displaced grid | Instanced ribbons planted by area on an annulus, a Fresnel water surface, billboarded procedural flowers |
| Camera | Static, pointer parallax | Two framings fitted to measured DOM boxes, damped between |
| Signature interaction | Moss parts around the pointer; pollen trail | Stems part and lift; pool ripples from the pointer; a stem flowers on signup |

Techniques that are genuinely shared are general practice rather than
signature: instanced foliage with wind in the vertex shader, analytic
lighting in the fragment shader, a seeded PRNG for deterministic placement,
a specular rim on a dock, a pointer-proximity displacement field, tiered
quality, and pausing the render loop offscreen. Several are documented in
MengTo's own MIT-licensed skills (`threejs-landscape`, `globe-particles`,
`build-interactive-particle-trail`), which is where they were taken from.

One deliberate echo is worth naming: the floating dock with proximity
magnification and a pointer-tracked specular rim is the same *idiom* as
Sylva's. It is reimplemented from scratch, in a light palette, with different
spring constants and different geometry. Under the rubric this is a
low-severity structural similarity — a shared interface idiom, not a
reproduced composition.

## Access gaps

- Sylva's live site was assessed from the repository rather than from
  `mengto.github.io`. The repository is the complete source of that page, so
  the gap is not material for code or asset comparison.
- No side-by-side motion capture of Sylva was produced. Motion comparison
  rests on a full read of its source, which is a stronger surface than video
  for this purpose.

## Fix plan

None required in the checked scope.
