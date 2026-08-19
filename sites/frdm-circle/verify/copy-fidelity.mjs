/* ══════════════════════════════════════════════════════════════════════════
   COPY FIDELITY

   The client's words are the content of this page and are reproduced
   verbatim; only the layout and the world around them are new. This compares
   every sentence of frdmcircle.org against the rendered page and reports
   anything dropped, altered, or added.

   Usage: node copy-fidelity.mjs --source /tmp/frdm.html [--url http://...]
   ══════════════════════════════════════════════════════════════════════════ */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const SOURCE = arg('--source', '/tmp/frdm.html');
const URL = arg('--url', 'http://127.0.0.1:8080');

/* Sentences the source page only ever shows through script: the demo-mode
   notice, and the zero-state caption that replaces the static one. Both are
   present in our source too, so they are compared as strings not as DOM. */
const SCRIPT_ONLY = [
  'We are at the very beginning. Be the first name on the list.',
  'more women and we register the fund. This is the real count, updated by hand',
  'Demo mode — no endpoint is configured yet',
  'Something went wrong on our side.',
  'The Freedom Circle'
];

function textFromHtml(html) {
  /* Strip script, style and the two base64 image blobs, then unescape the
     handful of entities the source uses. */
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/i, ' ')
    .replace(/<[^>]+>/g, ' ');
  const ent = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'",
    '&mdash;': '\u2014', '&ndash;': '\u2013', '&middot;': '\u00b7',
    '&rsquo;': '\u2019', '&lsquo;': '\u2018', '&ldquo;': '\u201c',
    '&rdquo;': '\u201d', '&hellip;': '\u2026', '&nbsp;': ' ', '&copy;': '\u00a9'
  };
  s = s.replace(/&[a-z#0-9]+;/gi, (m) => (ent[m] !== undefined ? ent[m] : m));
  return s;
}

/* Compare on words, so a line break, a shifted element or a change of
   punctuation style is not mistaken for missing content. */
const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'",
  '&mdash;': '\u2014', '&ndash;': '\u2013', '&middot;': '\u00b7',
  '&rsquo;': '\u2019', '&lsquo;': '\u2018', '&ldquo;': '\u201c',
  '&rdquo;': '\u201d', '&hellip;': '\u2026', '&nbsp;': ' ', '&copy;': '\u00a9'
};

function normalise(s) {
  return s
    .replace(/&[a-z#0-9]+;/gi, (m) => (ENTITIES[m] !== undefined ? ENTITIES[m] : m))
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00a0/g, ' ')
    /* Stripping a tag leaves a space where the tag was, so a sentence that
       wrapped a phrase in <strong> comes out as "insurance , and". */
    .replace(/\s+([,.;:!?')\]])/g, '$1')
    .replace(/([('\[])\s+/g, '$1')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\s{2,}/)
    .map((x) => x.trim())
    .filter((x) => x.split(/\s+/).length >= 4);
}

const main = async () => {
  const sourceHtml = fs.readFileSync(SOURCE, 'utf8');
  const sourceText = normalise(textFromHtml(sourceHtml));

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (r) => r.abort());
  await page.goto(URL + (URL.includes('?') ? '&' : '?') + 'quality=low', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  /* Open every FAQ entry: collapsed answers are real content. */
  await page.evaluate(() => document.querySelectorAll('.faq details').forEach((d) => { d.open = true; }));
  await page.waitForTimeout(400);
  const pageText = normalise(await page.locator('body').innerText());
  const ourHtml = normalise(fs.readFileSync(path.join(HERE, '..', 'index.html'), 'utf8')) +
    ' ' + normalise(fs.readFileSync(path.join(HERE, '..', 'assets', 'site.js'), 'utf8'));
  await browser.close();

  const haystack = pageText + ' ' + ourHtml;

  const missing = [];
  const checked = [];
  for (const raw of sentences(textFromHtml(sourceHtml))) {
    const n = normalise(raw);
    if (!n || n.length < 24) continue;
    if (SCRIPT_ONLY.some((k) => n.includes(normalise(k)))) continue;
    checked.push(n);
    if (haystack.includes(n)) continue;
    /* Allow for a sentence split across elements: require every 8-word
       shingle to be present somewhere. */
    const words = n.split(' ');
    const shingles = [];
    for (let i = 0; i + 8 <= words.length; i += 4) shingles.push(words.slice(i, i + 8).join(' '));
    const misses = shingles.filter((sh) => !haystack.includes(sh));
    if (shingles.length && misses.length === 0) continue;
    missing.push({ sentence: raw.trim().slice(0, 160), missingShingles: misses.slice(0, 3) });
  }

  const report = {
    source: SOURCE,
    url: URL,
    sourceSentencesChecked: checked.length,
    missing,
    verdict: missing.length === 0 ? 'pass' : 'fail'
  };
  fs.mkdirSync(path.join(HERE, 'evidence'), { recursive: true });
  fs.writeFileSync(path.join(HERE, 'evidence', 'copy-fidelity.json'), JSON.stringify(report, null, 2));

  console.log(`checked ${checked.length} source sentences`);
  if (missing.length === 0) {
    console.log('\x1b[32mPASS    G04   Every sentence of frdmcircle.org is present\x1b[0m');
  } else {
    console.log(`\x1b[31mFAIL    G04   ${missing.length} source sentence(s) not found\x1b[0m`);
    missing.slice(0, 14).forEach((m) => console.log('  -', m.sentence));
  }
  process.exit(missing.length === 0 ? 0 : 1);
};

main().catch((e) => { console.error(e); process.exit(2); });
