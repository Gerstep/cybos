import { chromium } from 'playwright';
const b = await chromium.launch();
const VPS=[[1920,1080,0],[1440,900,0],[1280,800,0],[1024,768,0],[834,1112,1],[430,932,1],[390,844,1],[360,740,1],[320,568,1]];
let bad=0;
for (const [w,h,touch] of VPS) {
  const c = await b.newContext({viewport:{width:w,height:h}, hasTouch:!!touch, isMobile:!!touch});
  const p = await c.newPage();
  await p.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, r=>r.abort());
  await p.goto('http://127.0.0.1:8080?quality=low',{waitUntil:'load'});
  await p.waitForTimeout(900);
  const H = await p.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<H;y+=Math.floor(h*0.85)){ await p.evaluate(yy=>window.scrollTo(0,yy),y); await p.waitForTimeout(160);}
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(500);
  const ov = await p.evaluate(()=>{
    const docW=document.documentElement.clientWidth, out=[];
    for(const el of document.querySelectorAll('body *')){
      const cs=getComputedStyle(el);
      if(cs.display==='none'||cs.visibility==='hidden') continue;
      const r=el.getBoundingClientRect();
      if(r.width<1&&r.height<1) continue;
      if(r.left<-900) continue;
      if(r.right>docW+1) out.push({tag:el.tagName.toLowerCase(),cls:(el.className||'').toString().slice(0,40),right:Math.round(r.right),docW,text:(el.textContent||'').trim().slice(0,28)});
    }
    return {hs:document.documentElement.scrollWidth>docW+1, out:out.slice(0,6)};
  });
  const tg = touch ? await p.evaluate(()=>{
    const MIN=44,out=[];
    for(const el of document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary')){
      const cs=getComputedStyle(el);
      if(cs.display==='none'||cs.visibility==='hidden'||cs.opacity==='0') continue;
      let r=el.getBoundingClientRect();
      if(r.width<1&&r.height<1) continue;
      if(r.left<-900) continue;
      const pa=el.parentElement;
      if(el.tagName==='A'&&pa&&['P','SMALL','LI'].includes(pa.tagName)) continue;
      if(el.tagName==='INPUT'&&['radio','checkbox'].includes(el.type)){const l=el.closest('label'); if(l) r=l.getBoundingClientRect();}
      if(r.width+0.5<MIN||r.height+0.5<MIN) out.push({tag:el.tagName.toLowerCase(),cls:(el.className||'').toString().slice(0,30),w:Math.round(r.width),h:Math.round(r.height),text:(el.textContent||'').trim().slice(0,22)});
    }
    return out;
  }) : [];
  const okOv = !ov.hs && ov.out.length===0, okTg = tg.length===0;
  if(!okOv||!okTg) bad++;
  console.log(`${w}x${h}`.padEnd(10), okOv?'overflow ok  ':'OVERFLOW ✗  ', okTg?'targets ok':'TARGETS ✗',
    !okOv?JSON.stringify(ov):'', !okTg?JSON.stringify(tg):'');
  await c.close();
}
await b.close();
console.log(bad? `\n${bad} viewport(s) failing` : '\nall viewports clean');
