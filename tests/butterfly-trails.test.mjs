import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const artifacts=process.env.TEST_ARTIFACTS||path.join(os.tmpdir(),'li-sparkling-test');
await mkdir(artifacts,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/tests/fixture.html':pathname));if(!file.startsWith(root))throw Error();res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true,isMobile:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(url);await page.waitForFunction(()=>window.__liSparkling);await page.locator('#lpx-panel button').click();await page.getByRole('tab',{name:'02 · 拖尾'}).click();
 const ids=await page.evaluate(async()=> (await import('/butterfly-trails.js')).butterflyTrails.map(p=>p.id));assert.equal(ids.length,10);
 for(const id of ids){await page.locator(`[data-trail-id="${id}"] .lpx-thumb`).click();await page.waitForTimeout(150);await page.evaluate(async()=>{for(let i=0;i<16;i++){document.querySelector('.lpx-manager').dispatchEvent(new PointerEvent('pointermove',{clientX:30+i*25,clientY:340,pointerType:'mouse',isPrimary:true,bubbles:true}));await new Promise(r=>setTimeout(r,35));}});const d=await page.evaluate(()=>window.__liSparkling.getDiagnostics());assert.equal(d.trail,id);assert(d.trails>0&&d.trails<=80,JSON.stringify({id,d,errors}));}
 await page.reload();await page.waitForFunction(()=>window.__liSparkling);assert.equal(await page.evaluate(()=>window.__liSparkling.getDiagnostics().trail),ids.at(-1));
 await page.setViewportSize({width:1000,height:1000});
 const results=await page.evaluate(async()=>{
  window.__liSparkling.destroy();document.body.replaceChildren();document.body.style='margin:0';
  const {butterflyTrails,makeButterflyTrail,drawButterflyTrail}=await import('/butterfly-trails.js');const {textPacks,spawnText,drawTextParticle}=await import('/pear-effects.js');const c=document.createElement('canvas');c.width=1000;c.height=1000;document.body.append(c);const ctx=c.getContext('2d');ctx.fillStyle='#ecebe5';ctx.fillRect(0,0,500,1000);ctx.fillStyle='#1b2532';ctx.fillRect(500,0,500,1000);
  const textures=new Map();for(const pack of butterflyTrails)for(let i=0;i<pack.images.length;i++){const src=pack.images[i],hue=pack.hues?.[i]||0,key=src+'|'+hue;if(textures.has(key))continue;const img=new Image();img.src=src;await img.decode();const t=document.createElement('canvas');t.width=img.naturalWidth;t.height=img.naturalHeight;const x=t.getContext('2d');x.filter=`hue-rotate(${hue}deg)`;x.drawImage(img,0,0);textures.set(key,{ready:true,image:t});}
  const load=(s,h)=>textures.get(s+'|'+h),checks=[];
  for(let row=0;row<butterflyTrails.length;row++){const pack=butterflyTrails[row],light=makeButterflyTrail(pack,3,true,load);checks.push({paired:!!pack.paired,light:light.length});for(let i=0;i<12;i++){const p={x:60+i*78,y:310+row*65,px:30+i*78,py:310+row*65,time:0,duration:1000,size:1.3,phase:i*.5,butterflies:makeButterflyTrail(pack,2,false,load)};drawButterflyTrail(ctx,p,300);}
   const test=document.createElement('canvas');test.width=test.height=80;drawButterflyTrail(test.getContext('2d'),{x:40,y:40,px:40,py:40,time:0,duration:100,size:1,phase:0,butterflies:light},100);if(test.getContext('2d').getImageData(0,0,80,80).data.some(v=>v))throw Error('expired trail');
  }
  for(let i=0;i<3;i++){const p=textPacks.find(p=>p.id===['lili-pear-chenye','lili-pear-shirakawa','lili-pear-jiuniang'][i]);for(const q of spawnText(p,170+i*330,170,6,0,1.2,false,1000,1000))drawTextParticle(ctx,q,600);}
  return checks;
 });for(const r of results)assert.equal(r.light,r.paired?2:1);
 await page.screenshot({path:path.join(artifacts,'butterfly-trails.png')});assert.deepEqual(errors,[]);console.log('PASS: ten selectable textured butterfly trails, stored selection, paired lightweight colors, decoded hue textures, expiry; three new pixel effects.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
