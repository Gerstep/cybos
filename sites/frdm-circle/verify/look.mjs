import { chromium } from 'playwright';
const b = await chromium.launch();
async function grab(q, name, sel){
  const c = await b.newContext({viewport:{width:1440,height:900}});
  const p = await c.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
  p.on('console',m=>{const t=m.text(); if((m.type()==='error'||m.type()==='warning')&&!/ReadPixels/.test(t)) errs.push(m.type()+': '+t.slice(0,240));});
  await p.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, r=>r.abort());
  await p.goto('http://127.0.0.1:8080'+(q?'?'+q:''),{waitUntil:'load'});
  await p.waitForTimeout(3000);
  if (sel) { await p.evaluate(s=>document.querySelector(s).scrollIntoView({block:'center',behavior:'instant'}),sel); await p.waitForTimeout(2000); }
  const fps = await p.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();(function s(){n++;performance.now()-t0<1500?requestAnimationFrame(s):r(+(n/((performance.now()-t0)/1000)).toFixed(1));})();}));
  await p.screenshot({path:`/tmp/${name}.png`, timeout:25000});
  console.log(name.padEnd(16), 'fps', String(fps).padEnd(6), 'stats', JSON.stringify(await p.evaluate(()=>window.FRDMScene&&window.FRDMScene.stats())), errs.length?('| '+errs[0]):'');
  await c.close();
}
await grab('', 'g-hero', null);
await grab('quality=high', 'g-hero-hi', null);
await grab('', 'g-loop', '#loop');
await b.close();
