# FRDM Circle — landing page

A static landing page for [The Freedom Circle](https://frdmcircle.org), a
pre-launch fund: women backing women, $10 a month into one shared pool,
gathering 10,000 founding members before the fund is registered.

No build step. Serve the folder and it runs.

## Seeing it

### Locally

```bash
git clone --depth 1 -b cursor/frdm-circle-landing-189e \
  https://github.com/Gerstep/cybos.git ~/frdm-circle
cd ~/frdm-circle/sites/frdm-circle && ./serve.sh
```

`serve.sh` starts a static server and opens the page once the port is actually
answering. It **has** to be served over HTTP: the scene is an ES module, and a
`file://` origin is opaque, so the browser refuses the import and you get the
static fallback ring instead of the garden.

### On Vercel

`vercel.json` at the repository root configures the whole deploy, so there is
nothing to set in the Vercel dashboard:

1. [vercel.com/new](https://vercel.com/new) → import this repository
2. Deploy

The build copies `index.html`, `assets/` and `licenses/` into `dist/` and
publishes that. No install step, no framework, no bundler — and the acceptance
harness is deliberately not published. Fonts and images get a one-year
immutable cache; scripts and styles revalidate hourly, since they are not
content-hashed.

Vercel deploys production from the repository's production branch, `main` by
default, so the page needs to be on that branch for the production URL to
serve it.

From a machine with the CLI authenticated, the same config deploys directly:

```bash
npx vercel deploy --prod
```

## The idea

The hero is not a picture of the product — it *is* the product's number.

Ten thousand stems stand planted in a circle of daylight around a reflecting
pool. Every stem is planted and **none of them has flowered**, because the real
membership count is zero and this fund is built on not pretending otherwise.
Light travels around the *inside* of the ring rather than down through it,
which is the argument the page makes in words a few sections later: in charity
money moves down, here it moves around. The pool in the middle is the fund —
the one thing in the circle that belongs to nobody in particular.

When somebody joins, one stem flowers. That is the only way gold ever enters
this garden.

Nothing in the scene is a photograph or a model file. The stems, the water, the
sky, the ground and the light are grown from a fixed seed on load, so the same
garden appears every time.

## Layout

```text
index.html                 markup, the full stylesheet, and the inlined icon sprite
assets/
  scene.js                 the garden: stems, pool, sky, light, pollen, flowers
  site.js                  dock, reveals, counter, FAQ, form, share
  three.module.min.js      Three.js r160, MIT
  gsap.min.js              GSAP 3.13, and ScrollTrigger.min.js
  lenis.min.js             Lenis 1.1.18, the single smooth-scroll engine
  fraunces-*.woff2         display face, SIL OFL 1.1
  outfit-*.woff2           interface face, SIL OFL 1.1
  mark.webp, logo.webp     brand marks, extracted from frdmcircle.org
licenses/                  third-party licence texts
verify/                    the acceptance harness (see below)
```

## Configuration

Everything an operator needs is at the top of `assets/site.js`:

```js
var CONFIG = {
  formEndpoint: 'https://formspree.io/f/xyeglkee',  // any endpoint that accepts a POST
  memberCount: 0,                                   // the real number, updated by hand
  goal: 10000,
  countEndpoint: '',                                // optional: a URL returning {"count": n}
  siteUrl: 'https://frdmcircle.org',
  contactEmail: 'hello@frdmcircle.org',
  shareText: '…'
};
```

Leave `formEndpoint` empty and the form runs in demo mode: it validates, thanks
the visitor, and sends nothing.

Raising `memberCount` moves the counter and the progress bar. Flowers are lit
by the signup event rather than by the count, so a fresh visitor to a page with
a high count sees the number, not a field of gold — which is honest, since the
garden is a picture of the founding moment.

## Debugging switches

Query parameters, useful for testing and for pinning quality on a machine
without a GPU:

| Parameter | Effect |
| --- | --- |
| `?quality=high\|medium\|low` | Pin a quality tier and disable the governor |
| `?quality=off` | Skip the scene entirely and show the static ring |
| `?stems=N` | Override the stem count, 1 to 24,000 |

## Performance

Cost here is fill rate and vertex count, so the three quality tiers trade
pixel ratio, blade detail and the ambient extras. **The stem count never
moves** — ten thousand is the argument, not a decoration. A weak GPU still
counts every woman; it just draws her smaller.

A governor watches frame time and demotes one tier at a time. Demotion is
one-way, because a tier that recovers only because it got cheaper would
immediately promote itself back into the same stall. A single long frame is
treated as a main-thread stall rather than a slow GPU, so a layout or a
garbage collection cannot permanently downgrade the page. Only sustained
failure at the cheapest tier stands the scene down in favour of the static
ring.

The render loop runs only while the hero or the loop section is on screen, and
stops when the document is hidden. `data-animation-active` on the canvas
reports its state so this is checkable from outside.

## Accessibility and degradation

Three degraded paths are exercised by the harness on every run:

- **`prefers-reduced-motion: reduce`** — neither GSAP's scroll work nor Lenis
  is initialised, every element renders in its final state, and the canvas is
  replaced by a static ring.
- **JavaScript disabled** — all nine sections of content are present and
  readable. The reveal system only hides things once script has confirmed it
  can show them again.
- **WebGL 2 unavailable** — the static ring takes over, with no console noise.
  WebGL 2 is requested by name so Three never takes its deprecated WebGL 1
  path.

Zero axe violations at WCAG 2.1 AA. Every interactive target clears 44×44 on
touch viewports. Headings reveal word by word while keeping an unsplit
accessible name, and every generated span is hidden from assistive technology.

## Verification

```bash
cd verify
npm install
npx playwright install chromium
node verify.mjs            # the acceptance matrix
node copy-fidelity.mjs --source /path/to/frdmcircle.html
```

`verify.mjs` runs nineteen gates across nine viewports from 1920 down to 320:
console and network cleanliness, horizontal overflow, touch targets, axe at
WCAG 2.1 AA, that the garden actually paints pixels, that the render loop
parks when offscreen, dock navigation, the FAQ, form validation and submission
with the client's live endpoint stubbed, and the three degraded paths. Evidence
lands in `verify/evidence/`.

Frame rate is reported as **blocked**, not passed: headless Chromium here
rasterises in software and no GPU is available, so the number it produces says
nothing about real hardware.

`verify/ORIGINALITY.md` documents the audit against the named visual
reference.

## Credits and provenance

- **Copy** — frdmcircle.org, reproduced verbatim. Layout and world are new.
- **Brand marks** — extracted from frdmcircle.org's own inline base64.
- **Icons** — [Solar](https://icon-sets.iconify.design/solar/) via Iconify,
  CC BY 4.0, linear set at `stroke-width: 1.5`. Inlined as a sprite so
  `currentColor` resolves. Regenerate with:

  ```bash
  curl "https://api.iconify.design/solar.json?icons=lightbulb-minimalistic-linear,checklist-minimalistic-linear,hand-heart-linear,shield-check-linear,question-circle-linear,arrow-right-linear,home-2-linear,document-text-linear,diploma-linear,heart-pulse-linear,ticket-linear,eye-linear,global-linear,lock-keyhole-linear,hand-money-linear,chat-square-check-linear,hand-stars-linear,user-rounded-linear,check-circle-linear"
  ```

- **Method** — built following [MengTo/Skills](https://github.com/MengTo/Skills)
  (MIT). `build-awwwards-quality-sites` governs; `editorial-tech`,
  `container-lines` and `number-details` set the layout system;
  `threejs-landscape`, `globe-particles` and `build-interactive-particle-trail`
  inform the garden; `iterate-until-verified` and
  `audit-reference-originality` shape the harness and the audit.
- **Visual reference** — [MengTo/sylva](https://github.com/MengTo/sylva)
  informed technique only. Sylva grants no reuse licence, so no Sylva code,
  asset, or composition is present here. See `verify/ORIGINALITY.md`.
- **Fonts** — Fraunces and Outfit, SIL OFL 1.1.
- **Libraries** — Three.js (MIT), GSAP and ScrollTrigger, Lenis (MIT).

This page makes no claim to any award. "Awwwards quality" was an acceptance
bar during the build, nothing more.
