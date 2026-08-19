/* ══════════════════════════════════════════════════════════════════════════
   ACCEPTANCE HARNESS

   "Zero bugs or visual mistakes on desktop or mobile" is an ambition, not a
   check, so it is converted here into observable pass/fail gates with an
   evidence artifact behind each one. Every gate returns pass, fail or
   blocked. Nothing self-reports.

   Usage:  node verify.mjs [--url http://127.0.0.1:8080]
   ══════════════════════════════════════════════════════════════════════════ */
import { chromium } from 'playwright';
import fs from 'node:fs';
import { execFile as execFileCb } from 'node:child_process';
import { promisify } from 'node:util';
const execFile = promisify(execFileCb);
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE = path.join(HERE, 'evidence');
const SHOTS = path.join(EVIDENCE, 'screens');

const argUrl = process.argv.indexOf('--url');
const URL = argUrl > -1 ? process.argv[argUrl + 1] : 'http://127.0.0.1:8080';
/* Headless Chromium here rasterises in software (SwiftShader), which cannot
   hold ten thousand instanced stems. Pinning the tier keeps the scene on for
   the duration of a capture instead of letting the governor correctly switch
   it off mid-gate. Frame rate is therefore reported as blocked, not passed. */
const PINNED = URL + (URL.includes('?') ? '&' : '?') + 'quality=low';
const PINNED_HIGH = URL + (URL.includes('?') ? '&' : '?') + 'quality=high';

fs.rmSync(EVIDENCE, { recursive: true, force: true });
fs.mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop-1920', width: 1920, height: 1080, touch: false },
  { name: 'desktop-1440', width: 1440, height: 900, touch: false, stitch: true },
  { name: 'laptop-1280', width: 1280, height: 800, touch: false },
  { name: 'small-laptop-1024', width: 1024, height: 768, touch: false },
  { name: 'tablet-834', width: 834, height: 1112, touch: true },
  { name: 'phone-430', width: 430, height: 932, touch: true },
  { name: 'phone-390', width: 390, height: 844, touch: true, stitch: true },
  { name: 'phone-360', width: 360, height: 740, touch: true },
  { name: 'phone-320', width: 320, height: 568, touch: true }
];

const results = [];
let failures = 0;

function gate(id, name, status, detail, evidence) {
  results.push({ id, name, status, detail, evidence });
  if (status === 'fail') failures++;
  const tag = status === 'pass' ? 'PASS' : status === 'fail' ? 'FAIL' : 'BLOCKED';
  const line = `${tag.padEnd(7)} ${id.padEnd(5)} ${name}`;
  console.log(status === 'fail' ? `\x1b[31m${line}\x1b[0m` : status === 'pass' ? `\x1b[32m${line}\x1b[0m` : `\x1b[33m${line}\x1b[0m`);
  if (status !== 'pass' && detail) console.log('        ' + JSON.stringify(detail).slice(0, 2200));
}

function write(name, data) {
  const p = path.join(EVIDENCE, name);
  fs.writeFileSync(p, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  return path.relative(HERE, p);
}

/* Nothing in this suite is allowed to reach the client's live inbox. */
async function stubNetwork(page, log) {
  /* Order matters: Playwright consults the most recently registered handler
     first, so the catch-all goes on before the stub that must beat it. */
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) => {
    log.external.push(route.request().url());
    route.abort();
  });
  await page.route('**/formspree.io/**', (route) => {
    log.formspree.push(route.request().url());
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
}

/* Messages the harness itself provokes, or that the software rasteriser
   emits about the harness's own capture path. They are environmental, not
   page defects, and each one is named rather than pattern-swept. */
const ENVIRONMENTAL = [
  /GL Driver Message .*ReadPixels/i,
  /GPU stall due to ReadPixels/i
];

function attachLogs(page) {
  const log = { console: [], pageErrors: [], failed: [], formspree: [], external: [], ignored: [] };
  page.on('console', (m) => {
    const type = m.type();
    if (type !== 'error' && type !== 'warning') return;
    const text = m.text();
    if (ENVIRONMENTAL.some((re) => re.test(text))) { log.ignored.push(text); return; }
    log.console.push({ type, text, loc: m.location() });
  });
  page.on('pageerror', (e) => log.pageErrors.push(String(e && e.message ? e.message : e)));
  page.on('requestfailed', (r) => {
    const url = r.url();
    if (/^https?:\/\/(?!127\.0\.0\.1|localhost)/.test(url)) return; // deliberately blocked
    log.failed.push({ url, err: r.failure()?.errorText });
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && /127\.0\.0\.1|localhost/.test(r.url())) {
      log.failed.push({ url: r.url(), err: 'HTTP ' + r.status() });
    }
  });
  return log;
}

const settle = (page, ms = 500) => page.waitForTimeout(ms);

/* ── full-page capture by stitched tiles ──────────────────────────────────
   A native fullPage screenshot stretches the fixed canvas to the whole
   document height and produces a blank or smeared band, so the page is
   captured a viewport at a time and stacked. The dock is suppressed during
   capture for the same reason: fixed chrome would otherwise repeat in every
   tile. It gets its own screenshot instead. */
async function captureStitched(page, outFile, vp) {
  const hide = await page.addStyleTag({
    content: '.dock-wrap{visibility:hidden !important}'
  });
  // Warm pass so every reveal has fired and nothing mounts mid-capture.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= total; y += vp.height) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await settle(page, 220);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 700);

  const tiles = [];
  const dir = fs.mkdtempSync(path.join(EVIDENCE, 'tiles-'));
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0, i = 0; y < height; y += vp.height, i++) {
    const at = Math.min(y, Math.max(0, height - vp.height));
    await page.evaluate((yy) => window.scrollTo(0, yy), at);
    await settle(page, 420);
    const real = await page.evaluate(() => window.scrollY);
    const slice = Math.min(vp.height, height - real);
    const raw = path.join(dir, `t${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: raw, timeout: 20000 });
    tiles.push({ raw, slice, at: real });
    if (real + vp.height >= height) break;
  }

  await hide.evaluate((el) => el.remove());
  await page.evaluate(() => window.scrollTo(0, 0));

  // Crop each tile to the band it uniquely contributes, then stack.
  const cropped = [];
  for (let i = 0; i < tiles.length; i++) {
    const prevEnd = i === 0 ? 0 : tiles[i - 1].at + vp.height;
    const start = Math.max(0, prevEnd - tiles[i].at);
    const h = vp.height - start;
    if (h <= 0) continue;
    const out = path.join(dir, `c${String(i).padStart(3, '0')}.png`);
    await execFile('ffmpeg', ['-y', '-loglevel', 'error', '-i', tiles[i].raw,
      '-vf', `crop=${vp.width}:${h}:0:${start}`, out]);
    cropped.push(out);
  }
  if (cropped.length === 1) {
    fs.copyFileSync(cropped[0], outFile);
  } else {
    const inputs = cropped.flatMap((f) => ['-i', f]);
    const filter = cropped.map((_, i) => `[${i}:v]`).join('') + `vstack=inputs=${cropped.length}`;
    await execFile('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filter, outFile]);
  }
  fs.rmSync(dir, { recursive: true, force: true });
  return outFile;
}

/* ── in-page probes ──────────────────────────────────────────────────── */

const probeOverflow = () => {
  const docW = document.documentElement.clientWidth;
  const bad = [];
  const all = document.querySelectorAll('body *');
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 && r.height < 1) continue;
    if (r.left < -900) continue;              // deliberately parked offscreen
    if (r.right > docW + 1) {
      bad.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0, 70),
        id: el.id || '',
        right: Math.round(r.right),
        docW,
        text: (el.textContent || '').trim().slice(0, 50)
      });
    }
  }
  return {
    scrollW: document.documentElement.scrollWidth,
    clientW: docW,
    horizontalScroll: document.documentElement.scrollWidth > docW + 1,
    offenders: bad.slice(0, 25)
  };
};

const probeTargets = () => {
  const MIN = 44;
  const bad = [];
  const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button]';
  for (const el of document.querySelectorAll(sel)) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 && r.height < 1) continue;
    if (r.left < -900) continue;
    // WCAG 2.5.8 exempts targets inline in a sentence.
    const p = el.parentElement;
    if (el.tagName === 'A' && p && (p.tagName === 'P' || p.tagName === 'SMALL' || p.tagName === 'LI')) continue;
    // A radio hidden behind its own chip label: measure the label instead.
    let box = r;
    if (el.tagName === 'INPUT' && (el.type === 'radio' || el.type === 'checkbox')) {
      const lab = el.closest('label');
      if (lab) box = lab.getBoundingClientRect();
    }
    if (box.width + 0.5 < MIN || box.height + 0.5 < MIN) {
      bad.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 60),
        id: el.id || '',
        w: Math.round(box.width),
        h: Math.round(box.height),
        text: (el.textContent || '').trim().slice(0, 40)
      });
    }
  }
  return bad;
};

const probeAnimation = () => {
  const out = { canvases: [], offscreenRunningCount: 0 };
  for (const c of document.querySelectorAll('canvas')) {
    const r = c.getBoundingClientRect();
    const visible = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    const active = c.dataset.animationActive === 'true';
    const styleHidden = getComputedStyle(c).display === 'none';
    // A fixed full-viewport canvas is always "in the viewport" geometrically,
    // so occlusion is what matters: the scene reports its own run state.
    out.canvases.push({ id: c.id, visible, active, styleHidden });
  }
  const zone = document.querySelector('.hero');
  const loop = document.getElementById('loop');
  const inZone = [zone, loop].some((el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.bottom > -innerHeight * 0.12 && r.top < innerHeight * 1.12;
  });
  out.inZone = inZone;
  out.offscreenRunningCount = out.canvases.filter((c) => c.active && !inZone).length;
  return out;
};

const probeFps = (ms) => new Promise((resolve) => {
  let frames = 0;
  const t0 = performance.now();
  function step() {
    frames++;
    if (performance.now() - t0 < ms) requestAnimationFrame(step);
    else resolve({ frames, elapsed: performance.now() - t0, fps: frames / ((performance.now() - t0) / 1000) });
  }
  requestAnimationFrame(step);
});

const probeCanvasInk = () => {
  const c = document.getElementById('scene');
  if (!c) return { error: 'no canvas' };
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  if (!gl) return { error: 'no gl context' };
  const w = 160, h = 100;
  const buf = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
  let lit = 0;
  for (let i = 0; i < buf.length; i += 4) {
    if (buf[i] + buf[i + 1] + buf[i + 2] > 12 || buf[i + 3] > 12) lit++;
  }
  return { sampled: w * h, lit, ratio: lit / (w * h) };
};

/* ══════════════════════════════════════════════════════════════════════ */
async function main() {
  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });

  const axeSource = fs.readFileSync(path.join(HERE, 'node_modules/axe-core/axe.min.js'), 'utf8');

  /* ─────────────────── G01 load ─────────────────── */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const log = attachLogs(page);
    await stubNetwork(page, log);
    const resp = await page.goto(PINNED, { waitUntil: 'load', timeout: 30000 });
    const state = await page.evaluate(() => document.readyState);
    const ok = resp && resp.status() === 200 && state === 'complete';
    gate('G01', 'Page loads with HTTP 200 and reaches readyState complete', ok ? 'pass' : 'fail',
      { status: resp && resp.status(), readyState: state }, write('load.json', { status: resp && resp.status(), readyState: state }));
    await ctx.close();
  }

  /* ─────────────────── G02/G03/G10/G11/G19 per viewport ─────────────────── */
  const perViewport = {};
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      hasTouch: vp.touch,
      isMobile: vp.touch,
      deviceScaleFactor: 1
    });
    const page = await ctx.newPage();
    const log = attachLogs(page);
    await stubNetwork(page, log);
    await page.goto(PINNED, { waitUntil: 'load' });
    await settle(page, 900);

    // Walk the page so lazy reveals and scroll-driven work all run.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += Math.floor(vp.height * 0.85)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await settle(page, 170);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(page, 500);

    const overflow = await page.evaluate(probeOverflow);
    const targets = vp.touch ? await page.evaluate(probeTargets) : [];

    await page.addScriptTag({ content: axeSource });
    const axe = await page.evaluate(async () => {
      const r = await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        resultTypes: ['violations']
      });
      return r.violations.map((v) => ({
        id: v.id, impact: v.impact, help: v.help, count: v.nodes.length,
        nodes: v.nodes.slice(0, 4).map((n) => ({ target: n.target, summary: (n.failureSummary || '').slice(0, 300) }))
      }));
    });

    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(page, 400);
    await page.screenshot({ path: path.join(SHOTS, `${vp.name}-hero.png`), timeout: 20000 });
    if (vp.stitch) await captureStitched(page, path.join(SHOTS, `${vp.name}-full.png`), vp);
    else {
      // A mid-page and a lower-page frame is enough to review a viewport we
      // are not stitching in full.
      for (const [tag, sel] of [['idea', '#idea'], ['loop', '#loop'], ['how', '#how'], ['join', '#join']]) {
        await page.evaluate((x) => document.querySelector(x).scrollIntoView({ block: 'start', behavior: 'instant' }), sel);
        await settle(page, 550);
        await page.screenshot({ path: path.join(SHOTS, `${vp.name}-${tag}.png`), timeout: 20000 });
      }
    }

    perViewport[vp.name] = { overflow, targets, axe, console: log.console, pageErrors: log.pageErrors, failed: log.failed };
    await ctx.close();
  }
  write('per-viewport.json', perViewport);

  const consoleBad = Object.entries(perViewport).flatMap(([v, r]) =>
    r.console.map((c) => ({ viewport: v, ...c })).concat(r.pageErrors.map((e) => ({ viewport: v, type: 'pageerror', text: e }))));
  gate('G02', 'Zero console errors or warnings across all viewports', consoleBad.length === 0 ? 'pass' : 'fail',
    consoleBad.slice(0, 12), write('console.json', consoleBad));

  const netBad = Object.entries(perViewport).flatMap(([v, r]) => r.failed.map((f) => ({ viewport: v, ...f })));
  gate('G03', 'Zero failed same-origin requests', netBad.length === 0 ? 'pass' : 'fail',
    netBad.slice(0, 12), write('network.json', netBad));

  const ovBad = Object.entries(perViewport).filter(([, r]) => r.overflow.horizontalScroll || r.overflow.offenders.length);
  gate('G10', 'No horizontal overflow at any viewport', ovBad.length === 0 ? 'pass' : 'fail',
    ovBad.map(([v, r]) => ({ viewport: v, scrollW: r.overflow.scrollW, clientW: r.overflow.clientW, offenders: r.overflow.offenders })).slice(0, 6),
    write('overflow.json', Object.fromEntries(Object.entries(perViewport).map(([v, r]) => [v, r.overflow]))));

  const tgBad = Object.entries(perViewport).filter(([, r]) => r.targets.length);
  gate('G11', 'Touch targets are at least 44 by 44 on touch viewports', tgBad.length === 0 ? 'pass' : 'fail',
    tgBad.map(([v, r]) => ({ viewport: v, bad: r.targets })).slice(0, 6),
    write('targets.json', Object.fromEntries(Object.entries(perViewport).map(([v, r]) => [v, r.targets]))));

  const axeBad = Object.entries(perViewport).filter(([, r]) => r.axe.length);
  gate('G19', 'Zero axe violations at WCAG 2.1 AA', axeBad.length === 0 ? 'pass' : 'fail',
    axeBad.map(([v, r]) => ({ viewport: v, violations: r.axe })).slice(0, 4),
    write('axe.json', Object.fromEntries(Object.entries(perViewport).map(([v, r]) => [v, r.axe]))));

  /* ─────────────────── G12/G13/G14 canvas ─────────────────── */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const log = attachLogs(page);
    await stubNetwork(page, log);
    await page.goto(PINNED_HIGH, { waitUntil: 'load' });
    await settle(page, 2200);

    const withRing = path.join(SHOTS, 'ink-with-ring.png');
    await page.screenshot({ path: withRing, clip: { x: 720, y: 120, width: 640, height: 620 }, timeout: 20000 });
    const off = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const offPage = await off.newPage();
    await stubNetwork(offPage, attachLogs(offPage));
    await offPage.goto(URL + '?quality=off', { waitUntil: 'load' });
    await settle(offPage, 1200);
    const withoutRing = path.join(SHOTS, 'ink-without-ring.png');
    await offPage.screenshot({ path: withoutRing, clip: { x: 720, y: 120, width: 640, height: 620 }, timeout: 20000 });
    await off.close();

    let ssim = null;
    try {
      const { stderr } = await execFile('ffmpeg', ['-i', withRing, '-i', withoutRing,
        '-lavfi', 'ssim', '-f', 'null', '-']);
      const m = /All:([0-9.]+)/.exec(stderr);
      ssim = m ? parseFloat(m[1]) : null;
    } catch (e) { ssim = null; }
    const inkOk = ssim !== null && ssim < 0.985;
    gate('G12', 'The ring actually paints pixels the page would not otherwise have',
      inkOk ? 'pass' : 'fail', { ssimVsSceneOff: ssim },
      write('canvas-ink.json', { ssimVsSceneOff: ssim, note: 'lower means the ring contributes more; 1.0 would mean it drew nothing' }));

    const samples = [];
    const marks = [
      { label: 'hero', y: 0 },
      { label: 'idea', sel: '#idea' },
      { label: 'loop', sel: '#loop' },
      { label: 'how', sel: '#how' },
      { label: 'faq', sel: '#faq' },
      { label: 'footer', y: -1 }
    ];
    for (const m of marks) {
      if (m.sel) await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center', behavior: 'instant' }), m.sel);
      else if (m.y === -1) await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      else await page.evaluate((y) => window.scrollTo(0, y), m.y);
      await settle(page, 700);
      samples.push({ mark: m.label, ...(await page.evaluate(probeAnimation)) });
    }
    const running = samples.filter((s) => s.offscreenRunningCount > 0);
    gate('G13', 'The scene stops rendering whenever neither the hero nor the loop is on screen',
      running.length === 0 ? 'pass' : 'fail', running, write('animation-profile.json', samples));

    const pausedSomewhere = samples.some((s) => !s.inZone && s.canvases.every((c) => !c.active));
    gate('G14', 'At least one scroll position proves the render loop is actually parked',
      pausedSomewhere ? 'pass' : 'fail', samples.map((s) => ({ mark: s.mark, inZone: s.inZone, active: s.canvases.map((c) => c.active) })), 'animation-profile.json');

    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(page, 700);
    const fps = await page.evaluate(probeFps, 3000);
    gate('P01', 'Sustained frame rate at the hero', 'blocked',
      { measured: Number(fps.fps.toFixed(1)), reason: 'headless Chromium rasterises in software (SwiftShader); no GPU is available in this environment, so this number says nothing about the page on real hardware' },
      write('fps.json', { ...fps, renderer: 'SwiftShader (software)', note: 'blocked: needs a GPU to be meaningful' }));

    await ctx.close();
  }

  /* ─────────────────── G16/G17/G18 behaviour ─────────────────── */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const log = attachLogs(page);
    await stubNetwork(page, log);
    await page.goto(PINNED, { waitUntil: 'load' });
    await settle(page, 900);

    // Dock navigation
    const nav = [];
    for (const id of ['idea', 'how', 'fund', 'safeguards', 'faq', 'join']) {
      await page.click(`.dock-item[data-spy="${id}"]`);
      await settle(page, 1500);
      const r = await page.evaluate((s) => {
        const el = document.getElementById(s);
        const b = el.getBoundingClientRect();
        return { top: Math.round(b.top), h: Math.round(b.height) };
      }, id);
      nav.push({ id, top: r.top, landed: r.top > -80 && r.top < 220 });
    }
    const navBad = nav.filter((n) => !n.landed);
    gate('G16', 'Every dock link lands on its section', navBad.length === 0 ? 'pass' : 'fail', nav, write('nav.json', nav));

    // FAQ
    await page.evaluate(() => document.getElementById('faq').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await settle(page, 600);
    const faqBefore = await page.evaluate(() => document.querySelectorAll('.faq details[open]').length);
    await page.click('.faq details:nth-of-type(3) summary');
    await settle(page, 700);
    const faqAfter = await page.evaluate(() => document.querySelectorAll('.faq details[open]').length);
    await page.click('.faq details:nth-of-type(3) summary');
    await settle(page, 700);
    const faqClosed = await page.evaluate(() => document.querySelectorAll('.faq details[open]').length);
    const faqOk = faqAfter === faqBefore + 1 && faqClosed === faqBefore;
    gate('G17', 'FAQ entries open and close', faqOk ? 'pass' : 'fail', { faqBefore, faqAfter, faqClosed }, write('faq.json', { faqBefore, faqAfter, faqClosed }));

    // Form validation then success
    await page.evaluate(() => document.getElementById('join').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await settle(page, 600);
    await page.click('#submitBtn');
    await settle(page, 400);
    const invalid = await page.evaluate(() => ({
      emailErr: document.getElementById('errEmail').classList.contains('show'),
      consentErr: document.getElementById('errConsent').classList.contains('show'),
      emailAria: document.getElementById('email').getAttribute('aria-invalid'),
      thanksShown: document.getElementById('thanks').classList.contains('show')
    }));
    const invalidOk = invalid.emailErr && invalid.consentErr && invalid.emailAria === 'true' && !invalid.thanksShown;
    gate('G18a', 'Empty submit reports both errors and does not succeed', invalidOk ? 'pass' : 'fail', invalid, write('form-invalid.json', invalid));

    await page.fill('#email', 'someone@example.com');
    await page.fill('#fname', 'Test');
    await page.check('#consent');
    await settle(page, 250);
    await page.click('#submitBtn');
    await settle(page, 1600);
    const done = await page.evaluate(() => ({
      thanksShown: document.getElementById('thanks').classList.contains('show'),
      formHidden: getComputedStyle(document.getElementById('joinForm')).display === 'none',
      count: document.getElementById('countNum').textContent.trim()
    }));
    const postedToFormspree = log.formspree.length === 1;
    const submitOk = done.thanksShown && done.formHidden && postedToFormspree;
    gate('G18b', 'Valid submit posts once and shows the confirmation', submitOk ? 'pass' : 'fail',
      { ...done, formspreeCalls: log.formspree.length }, write('form-valid.json', { ...done, formspree: log.formspree }));

    await settle(page, 1400);
    const litSeat = await page.evaluate(() => document.getElementById('countNum').textContent.trim());
    gate('G18c', 'The confirmation ticks the counter to 1', litSeat === '1' ? 'pass' : 'fail', { counter: litSeat }, 'form-valid.json');

    await ctx.close();
  }

  /* ─────────────────── G20 reduced motion ─────────────────── */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const log = attachLogs(page);
    await stubNetwork(page, log);
    await page.goto(PINNED, { waitUntil: 'load' });
    await settle(page, 1200);
    const rm = await page.evaluate(() => {
      const hidden = [];
      document.querySelectorAll('h1,h2,.rv,.lede,.step,.fund-cell').forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.9) {
          hidden.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 50), op: cs.opacity, vis: cs.visibility });
        }
      });
      return {
        canvasHidden: getComputedStyle(document.getElementById('scene')).display === 'none',
        fallbackShown: getComputedStyle(document.querySelector('.ring-fallback')).display !== 'none',
        lenisActive: document.documentElement.classList.contains('lenis-smooth'),
        railFull: getComputedStyle(document.querySelector('.rail i')).transform,
        hidden: hidden.slice(0, 12)
      };
    });
    await captureStitched(page, path.join(SHOTS, 'reduced-motion-full.png'), { width: 1440, height: 900 });
    const rmOk = rm.canvasHidden && !rm.lenisActive && rm.hidden.length === 0 && log.pageErrors.length === 0;
    gate('G20', 'Reduced motion: static final states, no canvas, no smooth-scroll engine', rmOk ? 'pass' : 'fail',
      { ...rm, pageErrors: log.pageErrors }, write('reduced-motion.json', { ...rm, console: log.console, pageErrors: log.pageErrors }));
    await ctx.close();
  }

  /* ─────────────────── G22 no JavaScript ─────────────────── */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(PINNED, { waitUntil: 'load' });
    await settle(page, 700);
    const text = await page.locator('body').innerText();
    /* No script means no canvas and no scroll effects, so the native
       full-page capture is both safe and the only option available. */
    await page.screenshot({ path: path.join(SHOTS, 'no-js-full.png'), fullPage: true, timeout: 40000 });
    /* Chromium's innerText applies text-transform, so uppercase styling
       would otherwise read as missing content. */
    const flat = text.toLowerCase();
    const has = (s) => flat.includes(s.toLowerCase());
    const checks = {
      headline: has('A circle of women.'),
      counter: has('Goal 10,000'),
      idea: has('Not charity. A circle.'),
      fund: has('Money that buys back agency'),
      how: has('From your $10 to her front door'),
      safeguards: has('What this is'),
      faq: has('Am I being charged anything now?'),
      join: has('Become a founding member'),
      footer: has('FRDM Circle for short')
    };
    const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    gate('G22', 'Full content readable with JavaScript disabled', missing.length === 0 ? 'pass' : 'fail',
      { missing, chars: text.length }, write('no-js.json', { checks, chars: text.length }));
    await ctx.close();
  }

  /* ─────────────────── G23 no WebGL ─────────────────── */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const log = attachLogs(page);
    await stubNetwork(page, log);
    await page.addInitScript(() => {
      const real = HTMLCanvasElement.prototype.getContext;
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        configurable: true,
        writable: true,
        value: function (type) {
          if (typeof type === 'string' && type.indexOf('webgl') === 0) return null;
          return real.apply(this, arguments);
        }
      });
    });
    await page.goto(PINNED, { waitUntil: 'load' });
    await settle(page, 1400);
    const st = await page.evaluate(() => ({
      noWebglClass: document.documentElement.classList.contains('no-webgl'),
      fallbackShown: getComputedStyle(document.querySelector('.ring-fallback')).display !== 'none',
      loopRing: getComputedStyle(document.querySelector('.loop-ring')).opacity,
      headingVisible: getComputedStyle(document.querySelector('h1')).visibility
    }));
    await page.screenshot({ path: path.join(SHOTS, 'no-webgl-hero.png') });
    const ok = st.noWebglClass && st.headingVisible === 'visible' && log.pageErrors.length === 0;
    gate('G23', 'WebGL unavailable: static ring, no errors, page intact', ok ? 'pass' : 'fail',
      { ...st, pageErrors: log.pageErrors, console: log.console.slice(0, 5) }, write('no-webgl.json', { ...st, console: log.console, pageErrors: log.pageErrors }));
    await ctx.close();
  }

  /* ─────────────────── G24 keyboard ─────────────────── */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const log = attachLogs(page);
    await stubNetwork(page, log);
    await page.goto(PINNED, { waitUntil: 'load' });
    await settle(page, 800);
    const order = [];
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press('Tab');
      order.push(await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return { tag: 'body' };
        const cs = getComputedStyle(a);
        return {
          tag: a.tagName.toLowerCase(),
          text: (a.textContent || a.value || '').trim().slice(0, 34),
          outline: cs.outlineStyle + ' ' + cs.outlineWidth
        };
      }));
    }
    const noFocusRing = order.filter((o) => o.tag !== 'body' && (o.outline.startsWith('none') || o.outline.endsWith('0px')));
    const skipFirst = order[0] && /skip to content/i.test(order[0].text);
    const ok = noFocusRing.length === 0 && skipFirst;
    gate('G24', 'Keyboard: skip link first, and every stop has a visible focus ring', ok ? 'pass' : 'fail',
      { skipFirst, noFocusRing: noFocusRing.slice(0, 6), order: order.slice(0, 10) }, write('keyboard.json', order));
    await ctx.close();
  }

  await browser.close();

  const summary = {
    url: URL,
    when: new Date().toISOString(),
    total: results.length,
    passed: results.filter((r) => r.status === 'pass').length,
    failed: failures,
    results
  };
  write('report.json', summary);

  console.log('\n' + '─'.repeat(64));
  console.log(`${summary.passed}/${summary.total} gates passed, ${failures} failed`);
  console.log(`evidence: ${path.relative(process.cwd(), EVIDENCE)}`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
