import { chromium } from 'playwright';
const b = await chromium.launch();
const shots = [
  ['1920', {width:1920,height:1080}, false, [['hero',null],['loop','#loop']]],
  ['1440', {width:1440,height:900}, false, [['hero',null],['loop','#loop'],['join','#join']]],
  ['834',  {width:834,height:1112},  true,  [['hero',null],['loop','#loop']]],
  ['390',  {width:390,height:844},   true,  [['hero',null],['loop','#loop']]],
  ['320',  {width:320,height:568},   true,  [['hero',null]]],
];
for (const [tag, vp, touch, marks] of shots) {
  const c = await b.newContext({viewport:vp, hasTouch:touch, isMobile:touch});
  const p = await c.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, r=>r.abort());
  await p.goto('http://127.0.0.1:8080?quality=high',{waitUntil:'load'});
  await p.waitForTimeout(2600);
  for (const [name, sel] of marks) {
    if (sel) { await p.evaluate(s=>{const e=document.querySelector(s); window.scrollTo(0, e.offsetTop - 90);}, sel); }
    else await p.evaluate(()=>window.scrollTo(0,0));
    await p.waitForTimeout(1900);
    await p.screenshot({path:`/tmp/v-${tag}-${name}.png`, timeout:30000});
  }
  if(errs.length) console.log(tag,'ERRORS',errs);
  await c.close();
}
await b.close();
console.log('done');
