import { chromium } from 'playwright';
import fs from 'node:fs';
const axeSrc = fs.readFileSync('./node_modules/axe-core/axe.min.js','utf8');
const b = await chromium.launch();
for (const vp of [{w:1440,h:900},{w:390,h:844}]) {
  const c = await b.newContext({viewport:{width:vp.w,height:vp.h}, hasTouch:vp.w<800});
  const p = await c.newPage();
  await p.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, r=>r.abort());
  await p.goto('http://127.0.0.1:8080?quality=low',{waitUntil:'load'});
  await p.waitForTimeout(1200);
  const h = await p.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<h;y+=Math.floor(vp.h*0.85)){ await p.evaluate(yy=>window.scrollTo(0,yy),y); await p.waitForTimeout(140);}
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(400);
  await p.addScriptTag({content:axeSrc});
  const v = await p.evaluate(async()=>{
    const r = await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    return r.violations.map(x=>({id:x.id,impact:x.impact,count:x.nodes.length,
      nodes:x.nodes.map(n=>({t:n.target.join(' '),s:(n.failureSummary||'').replace(/\s+/g,' ').slice(0,190)}))}));
  });
  console.log(`\n=== ${vp.w}x${vp.h}: ${v.length} violation types ===`);
  for (const x of v){ console.log(` ${x.id} (${x.impact}) x${x.count}`); x.nodes.slice(0,12).forEach(n=>console.log('   -',n.t,'|',n.s)); }
  await c.close();
}
await b.close();
