# FRDM Circle landing page — build record

Static landing page at [`sites/frdm-circle/`](../sites/frdm-circle/) for
[The Freedom Circle](https://frdmcircle.org).

## The brief, as given

1. Use [MengTo/sylva](https://github.com/MengTo/sylva) as the reference.
2. Use the content from frdmcircle.org.
3. Use [MengTo/Skills](https://github.com/MengTo/Skills) for the build.
4. Bright solarpunk, 3D, interactive, ultra-modern, award-winning.
5. Verified to have zero bugs or visual mistakes on desktop or mobile.

## Constraints that shaped it

**Sylva grants no reuse licence.** Its README is explicit: no licence is
granted for reuse or redistribution of its code, design, or artwork. So Sylva
informed technique and nothing else, and that claim is audited rather than
asserted — see [`verify/ORIGINALITY.md`](../sites/frdm-circle/verify/ORIGINALITY.md).
Sylva itself did the same thing with the composition it studied.

**The client's copy is the content.** Every sentence of frdmcircle.org appears
verbatim. The layout and the world around the words are new. This distinction
matters for the originality audit, which would otherwise flag the client's own
text as a finding.

**"Zero bugs" is an ambition, not a check.** Following
`codex/iterate-until-verified`, it was converted into an acceptance matrix of
observable pass/fail gates, each producing an evidence artifact. The
implementer does not get to mark its own work as passing.

## The concept

The hero is not a picture of the product — it is the product's number.

Ten thousand stems stand planted in a circle of daylight around a reflecting
pool. Every stem is planted and none has flowered, because the real membership
count is zero and this fund is built on not pretending otherwise. Light travels
around the *inside* of the ring rather than down through it — which is the
argument the page makes in words a few sections later: in charity money moves
down; here it moves around. The pool in the middle is the fund: the one thing
in the circle that belongs to nobody in particular.

When somebody joins, one stem flowers. That is the only way gold enters the
garden.

The same world serves the hero and the loop section. The camera holds two
framings, each fitted to a measured DOM box, and the ring turns to face the
reader for the loop, where the four stages are labelled from projected 3D
coordinates.

## Skills used

Named explicitly, as `build-awwwards-quality-sites` requires.

| Skill | Role |
| --- | --- |
| `web-design/build-awwwards-quality-sites` | Governing constraints: GSAP primary, exactly one smooth-scroll engine, reduced-motion bypass, accessible word reveals, honest asset provenance, no award claims |
| `web-design/editorial-tech` | The layout system: asymmetric editorial grid, hairline structure, one accent |
| `web-design/container-lines`, `number-details` | Ruled containers instead of card boxes; the counter and step numerals as architectural metadata |
| `web-design/threejs-landscape` | Instanced foliage at scale, shader-only motion, lifecycle discipline |
| `web-design/globe-particles` | Ring-band construction and distribution |
| `web-design/build-interactive-particle-trail`, `pointer-trail-emitter` | Pointer-driven emission by distance rather than by time |
| `web-design/masked-reveal`, `staggered-word-reveal` | Word-by-word headings with an unsplit accessible name |
| `web-design/scroll-progress-timeline` | The six-step rail that draws itself |
| `web-design/beautiful-shadows`, `css-border-gradient` | Tinted elevation on the one panel that earns it |
| `codex/iterate-until-verified` | The acceptance matrix and the maker/judge separation |
| `codex/audit-reference-originality` | The Sylva audit, including its evidence-inventory script |
| `codex/stitched-full-page-capture` | Tiled capture, because a native full-page screenshot stretches a fixed canvas |
| `codex/optimize-web-animations` | Offscreen-render gating and its verification |

Deliberately **not** combined, on that skill's own advice against mixing
aesthetic systems: `book-serif-index`, `documentary-brutalist-agency`,
`agency-grid-layout-minimal`, `glass-dark-ui`, and `progressive-blur` on
anything over the live canvas.

## Bugs worth remembering

Each of these was found by measurement, not by inspection.

**Point size multiplied by screen height.** The size-attenuation formula
produced roughly 950-pixel sprites, so the first scene ran at 0.2fps. Sizes are
now CSS pixels at a reference distance. One expression accounted for the entire
performance problem.

**A percentage translate in a stylesheet.** The word-reveal start state was
`translateY(112%)` in CSS. GSAP reads the computed matrix, records a resolved
pixel `y`, and then keeps it underneath the `yPercent` it is animating — so
every headline finished its animation still 112% low, and the page shipped with
no visible headings until it was caught. The start state is set in script now.

**Shader precision mismatch.** `precision mediump float` in the fragment stage
against three's default `highp` in the vertex stage made a shared uniform
ambiguous and failed program validation.

**A governor that punished stalls.** Treating one long frame as evidence of a
slow GPU meant any layout or garbage collection could permanently downgrade the
scene, and three of them switched it off. Half a second is now read as a
main-thread stall, the evidence resets whenever the loop resumes, and only
sustained failure at the cheapest tier stands the scene down.

**Percentage gradient stops on a taller-than-viewport element.** The mobile
scrim's stops resolved against the hero's full content height, putting the
paper hundreds of pixels below the type it was meant to protect. Body copy sat
on grass at 2.2:1. Stops are in `svh` now.

**Body background over a negative-z canvas.** A background on `<body>` paints
after negative-z descendants, so it buried the whole scene. The ground comes
from `<html>`.

**`.hero-grid` sharing an element with `.wrap`.** A `width: 100%` on the grid
beat the wrapper's centred measure on source order and slammed the copy against
the viewport edge.

**Route order in the harness.** Playwright consults the most recently
registered handler first, so a catch-all abort registered after the Formspree
stub swallowed the stubbed request and the form gate failed for a reason that
had nothing to do with the form.

**A native full-page screenshot with a fixed canvas.** Chromium stretches the
canvas to the document height, which on a 9,000-pixel page hangs the capture.
Tiled capture with the fixed chrome suppressed, per the capture skill.

## Verification

Nineteen gates across nine viewports from 1920 down to 320, plus copy fidelity
and the originality audit. Eighteen pass, one is blocked honestly.

| Gate | Result |
| --- | --- |
| Load, console, network | pass — zero errors or warnings at any viewport |
| Horizontal overflow | pass — nine viewports clean |
| Touch targets ≥ 44×44 | pass |
| axe, WCAG 2.1 AA | pass — zero violations |
| Scene paints; render loop parks offscreen | pass |
| Dock navigation, FAQ, form validation and submission | pass — client endpoint stubbed throughout |
| Reduced motion, no JavaScript, no WebGL 2 | pass |
| Keyboard order and visible focus | pass |
| Copy fidelity vs frdmcircle.org | pass — 153 of 153 sentences |
| Originality vs Sylva | clear in checked scope |
| **Sustained frame rate** | **blocked** — headless Chromium rasterises in software; no GPU is available, so the measured number says nothing about real hardware |

The frame-rate gate is the one thing this environment cannot answer. It is
reported as blocked rather than dressed up as a pass, and the adaptive governor
exists precisely so that a device which genuinely cannot hold the scene gets a
cheaper one instead of a stuttering one.

## Remaining known gaps

- Frame rate is unmeasured on real hardware.
- Under `prefers-reduced-motion` the canvas is replaced entirely rather than
  rendering a single static frame of the garden. This follows
  `build-awwwards-quality-sites` to the letter; a static render would arguably
  serve those readers better and is the obvious next improvement.
- The `og:image` still points at `https://frdmcircle.org/og.jpg`, which is the
  client's existing asset and does not depict this design.
