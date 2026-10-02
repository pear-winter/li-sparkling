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
 await page.goto(url);await page.waitForFunction(()=>window.__liSparkling);
 await page.locator('#lpx-panel button').click();await page.getByRole('combobox',{name:'选择特效分组'}).selectOption('pear');
 assert.equal(await page.locator('.lpx-card').count(),5,'old two plus three text effects');
 for(const id of ['lili-pear','lili-pear-garden']){
  await page.locator(`[data-effect-id="${id}"] .lpx-thumb`).click();
  const out=await page.evaluate(()=>window.__liSparkling.exportPack());assert.equal(out.packs[0].sparkles,true);
  assert((await page.evaluate(()=>window.__liSparkling.getDiagnostics().particles))>=13,'six motifs plus seven small sparks');
 }
 for(const [id,label,companions] of [['lili-pear-word','梨','pear'],['lili-pear-hanari','Hanari！','butterfly'],['lili-pear-lumi','Lumi！','butterfly']]){
  await page.locator(`[data-effect-id="${id}"] .lpx-thumb`).click();
  const out=await page.evaluate(()=>window.__liSparkling.exportPack());assert.equal(out.packs[0].label,label);assert.equal(out.packs[0].companions,companions);
  assert.equal(await page.evaluate(d=>window.__liSparkling.importPacks(d),out),1);
  const back=await page.evaluate(()=>window.__liSparkling.exportPack());assert.equal(back.packs[0].label,label);assert.deepEqual(back.packs[0].colors,out.packs[0].colors);
  const bad=structuredClone(out);bad.packs[0].label='missing glyph';assert.equal(await page.evaluate(d=>{try{window.__liSparkling.importPacks(d);return false;}catch{return true;}},bad),true);
 }
 const checks=await page.evaluate(async()=>{
  const {textPacks,spawnText,drawPixelLabel,textMetrics,drawTextParticle,drawPearTrail,preparePearEmoji}=await import('/pear-effects.js');
  const c=document.createElement('canvas');c.width=320;c.height=220;const ctx=c.getContext('2d'),results=[];
  for(const p of textPacks){
   const items=spawnText(p,319,3,14,0,2,false,320,220),label=items.find(x=>x.role==='label'),m=textMetrics(p.label,label.size);
   ctx.clearRect(0,0,320,220);ctx.save();ctx.translate(160,110);drawPixelLabel(ctx,p.label,p.size,p.colors);ctx.restore();
   const colors=new Set(),data=ctx.getImageData(0,0,320,220).data;for(let i=0;i<data.length;i+=4)if(data[i+3]===255)colors.add('#'+[...data.slice(i,i+3)].map(v=>v.toString(16).padStart(2,'0')).join(''));
   results.push({id:p.id,colors:[...colors],expected:p.colors,companions:items.filter(x=>x.role===p.companions).length,light:spawnText(p,160,110,2,0,1,true,320,220).filter(x=>x.role===p.companions).length,left:label.x-m.width/2,right:label.x+m.width/2,top:label.y-label.lift-m.height/2});
   ctx.clearRect(0,0,320,220);for(const item of items)drawTextParticle(ctx,item,5000);if(ctx.getImageData(0,0,320,220).data.some(v=>v))throw Error('expired text leaked');
  }
  await preparePearEmoji(document);const calls=[];ctx.drawImage=(img)=>calls.push(new URL(img.src).pathname);drawPearTrail(ctx,{x:100,y:100,time:0,duration:650,phase:0,size:1,amount:3,colors:['#a9cf56','#ffffff']},150);
  return {results,calls};
 });
 for(const r of checks.results){assert.deepEqual(r.colors.sort(),r.expected.sort(),'exact two flat pixel colors');assert.equal(r.companions,4);assert.equal(r.light,2);assert(r.left>=0&&r.right<=320&&r.top>=0,'text stays on screen even at 2x');}
 assert.deepEqual(checks.calls,['/assets/pear-emoji.svg'],'trail uses local pear emoji sprite');
 await page.getByRole('tab',{name:'02 · 拖尾'}).click();await page.locator('[data-trail-id="pear-emoji"] .lpx-thumb').click();
 await page.evaluate(async()=>{for(let i=0;i<15;i++){document.body.dispatchEvent(new PointerEvent('pointermove',{clientX:30+i*18,clientY:300,pointerType:'mouse',isPrimary:true,bubbles:true}));await new Promise(r=>setTimeout(r,25));}});
 const diag=await page.evaluate(()=>window.__liSparkling.getDiagnostics());assert.equal(diag.trail,'pear-emoji');assert(diag.trails>0&&diag.trails<=80);
 await page.reload();await page.waitForFunction(()=>window.__liSparkling);assert.equal(await page.evaluate(()=>window.__liSparkling.getDiagnostics().trail),'pear-emoji');
 // Deterministic visual contact sheet; actual effects drawn on both backgrounds.
 await page.setViewportSize({width:1000,height:760});
 await page.evaluate(async()=>{
  window.__liSparkling.destroy();document.body.replaceChildren();document.body.style='margin:0;background:#cbd0c5';
  const {textPacks,spawnText,drawTextParticle,drawPearTrail,preparePearEmoji}=await import('/pear-effects.js');
  const c=document.createElement('canvas');c.width=1000;c.height=760;document.body.append(c);const ctx=c.getContext('2d');
  for(let row=0;row<2;row++){ctx.fillStyle=row?'#172330':'#f4f5e9';ctx.fillRect(0,row*380,1000,380);for(let i=0;i<3;i++){const p=textPacks[i];for(const q of spawnText(p,170+i*330,145+row*380,6,0,1.25,false,1000,760))drawTextParticle(ctx,q,600);}for(let i=0;i<14;i++)drawPearTrail(ctx,{x:75+i*64,y:275+row*380+Math.sin(i*.7)*15,time:i*20,duration:650,phase:i*2.4,size:1.2,amount:3,colors:['#acd35d','#ffffff','#e8ed9b']},350);}
 });
 await page.screenshot({path:path.join(artifacts,'pear-pixel-effects.png')});
 assert.deepEqual(errors,[]);console.log('PASS: pear group; old presets with extra particles; text import/export; 2-color bitmap drawing without fonts; four/two companions; mobile bounds; emoji trail and saved selection; expiry.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
