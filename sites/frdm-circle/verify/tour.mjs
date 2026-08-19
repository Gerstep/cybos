import { chromium } from 'playwright';
const b = await chromium.launch();
const plan = [
  ['desk', {width:1440,height:900}, false, [['loop','#loop'],['idea','#idea'],['fund','#fund'],['how','#how'],['safe','#safeguards'],['faq','#faq'],['join','#join'],['foot','footer']]],
  ['phone', {width:390,height:844}, true, [['hero',null],['loop','#loop'],['idea','#idea'],['fund','#fund'],['join','#join']]],
];
for (const [tag, vp, touch, marks] of plan) {
  const c = await b.newContext({viewport:vp, hasTouch:touch, isMobile:touch});
  const p = await c.newPage();
  await p.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, r=>r.abort());
  await p.goto('http://127.0.0.1:8080?quality=high',{waitUntil:'load'});
  await p.waitForTimeout(2500);
  for (const [name, sel] of marks) {
    if (sel) await p.evaluate(s=>document.querySelector(s).scrollIntoView({block:'center',behavior:'instant'}), sel);
    else await p.evaluate(()=>window.scrollTo(0,0));
    await p.waitForTimeout(1800);
    await p.screenshot({path:`/tmp/t-${tag}-${name}.png`, timeout:25000});
  }
  await c.close();
}
await b.close();
console.log('done');
