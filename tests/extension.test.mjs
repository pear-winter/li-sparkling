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
 await page.goto(url);await page.waitForFunction(()=>window.__liliPixelV2?.getDiagnostics().canvasReady);
 await page.locator('#lpx-panel button').click();
 assert.equal(await page.locator('.lpx-card').count(),73,'73 builtins');
 assert.equal(await page.evaluate(()=>document.querySelector('dialog').scrollWidth<=document.querySelector('dialog').clientWidth),true,'no horizontal overflow');
 // Load all textures independently; a single broken SVG/WebP must fail the test.
 const assets=await page.evaluate(async()=>{const {ASSETS,butterflyPacks}=await import('/assets.js');const {seasonalPacks}=await import('/seasonal.js');const srcs=[...new Set([...Object.values(ASSETS),...[...butterflyPacks,...seasonalPacks].flatMap(p=>p.images)])];await Promise.all(srcs.map(src=>{const img=new Image();img.src=src;return img.decode();}));return srcs.length;});
 assert.equal(assets,86);
 // Every mode renders and remains bounded under repeated input.
 for(const id of ['lili-bf-pink-white','lili-bf-pink-black','lili-bf-pear-yellow','lili-wave-white','lili-wave-blue','lili-heart-fountain','lili-gold-stars','lili-blue-flowers','lili-bf-white','lili-snow-black','lili-snow-white','lili-music-black','lili-music-white','lili-ripple-white','lili-ripple-blue','lili-bubble-rainbow']){
  await page.locator(`[data-effect-id="${id}"] .lpx-thumb`).click();
  await page.waitForTimeout(180);
  const diag=await page.evaluate(()=>window.__liliPixelV2.getDiagnostics());
  assert.equal(diag.pack,id);assert(diag.particles>0&&diag.particles<=160);assert(diag.images.every(x=>x.ready&&!x.error));
 }
 // Flat silhouettes must have one solid interior color; gold is an exact preset recolor.
 const flat=await page.evaluate(async()=>{
  const {drawMotif,ornamentPacks,monochromeStars}=await import('/ornaments.js');
  const strip=p=>{const {id,name,colors,...rest}=p;return rest;};
  const results=['heart','flower','gold','star'].map(motif=>{const c=document.createElement('canvas');c.width=c.height=180;const cx=c.getContext('2d');cx.translate(90,90);drawMotif(cx,motif,120,'#72a9e2');const data=cx.getImageData(0,0,180,180).data;let filled=0,wrong=0;for(let i=0;i<data.length;i+=4)if(data[i+3]===255){filled++;if(data[i]!==114||data[i+1]!==169||data[i+2]!==226)wrong++;}return {motif,filled,wrong};});
  return {results,gold:strip(ornamentPacks.find(p=>p.id==='lili-gold-stars')),mono:strip(monochromeStars)};
 });
 assert.deepEqual(flat.gold,flat.mono,'gold only changes ID, name and colors');
 for(const p of flat.results){assert(p.filled>500,p.motif+' visible silhouette');assert.equal(p.wrong,0,p.motif+' solid fill without gradient/highlight');}
 // Centered diffusion must never scatter its origins, even at max density.
 const centers=await page.evaluate(async()=>{const {ripplePacks,spawnWaves}=await import('/ripples.js');return spawnWaves(ripplePacks.find(p=>p.motion==='wave'),117,239,14,0,2,false).map(p=>[p.x,p.y]);});
 assert.deepEqual(centers,[[117,239]]);
 // New motion and paired colors survive portable export/import.
 for(const id of ['lili-wave-white','lili-heart-fountain','lili-gold-stars','lili-blue-flowers','lili-bf-pear-yellow']){
  await page.locator(`[data-effect-id="${id}"] .lpx-thumb`).click();const pack=await page.evaluate(()=>window.__liSparkling.exportPack());
  assert.equal(await page.evaluate(d=>window.__liSparkling.importPacks(d),pack),1);
  if(id==='lili-bf-pear-yellow'){assert(pack.packs[0].paired);assert(pack.packs[0].hues.every(h=>h===0));assert(pack.packs[0].images.every(s=>s.startsWith('data:image/png;base64,')));}
 }
 await page.getByRole('tab',{name:'02 · 拖尾'}).click();assert.equal(await page.locator('[data-trail-id]').count(),30);
 await page.waitForTimeout(3600);
 for(const id of ['bubble','stars-black','stars-white','water','hearts-pink','stars-gold','flowers-blue']){
  await page.locator(`[data-trail-id="${id}"] .lpx-thumb`).click();
  await page.waitForTimeout(80);
  await page.evaluate(async()=>{for(let i=0;i<12;i++){document.body.dispatchEvent(new PointerEvent('pointermove',{clientX:80+i*10,clientY:360+Math.sin(i)*12,pointerType:'mouse',isPrimary:true,bubbles:true}));await new Promise(r=>setTimeout(r,20));}});
  const live=await page.evaluate(()=>{const d=window.__liSparkling.getDiagnostics();const c=document.querySelector('#lpx-canvas-layer canvas');return {...d,ink:c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)};});
  assert.equal(live.trail,id);assert(live.trails>0&&live.trails<=80);assert(live.ink);
 }
 await page.evaluate(async()=>{const target=document.body;for(let i=0;i<8;i++){const touch=new Touch({identifier:7,target,clientX:60+i*12,clientY:350});target.dispatchEvent(new TouchEvent(i?'touchmove':'touchstart',{touches:[touch],changedTouches:[touch],bubbles:true}));await new Promise(r=>setTimeout(r,35));}target.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[new Touch({identifier:7,target})],bubbles:true}));});
 assert((await page.evaluate(()=>window.__liSparkling.getDiagnostics().trails))>0,'mobile touch emits new trail');
 await page.waitForTimeout(3800);assert.equal(await page.evaluate(()=>window.__liSparkling.getDiagnostics().trails),0);
 await page.getByRole('tab',{name:'01 · 点击'}).click();
 await page.locator('.lpx-input[type=search]').fill('雪花');
 assert.equal(await page.locator('.lpx-card').count(),2);
 await page.waitForTimeout(3600);await page.screenshot({path:path.join(artifacts,'mobile-snow.png')});
 await page.locator('.lpx-input[type=search]').fill('');
 await page.locator('[data-effect-id="lili-bubble-rainbow"] .lpx-thumb').click();
 const exported=await page.evaluate(()=>window.__liliPixelV2.exportPack());
 assert(exported.packs[0].images.every(src=>src.startsWith('data:image/png;base64,')),'portable builtins');
 assert.equal(await page.evaluate(data=>window.__liliPixelV2.importPacks(data),exported),1);
 const importedId=await page.evaluate(()=>window.__liliPixelV2.getDiagnostics().pack);
 assert(importedId.startsWith('custom-'));
 const bad=structuredClone(exported);bad.packs[0].images=['javascript:alert(1)'];
 assert.equal(await page.evaluate(data=>{try{window.__liliPixelV2.importPacks(data);return false;}catch{return true;}},bad),true);
 assert.equal(await page.evaluate(()=>window.__liliPixelV2.getDiagnostics().pack),importedId,'failed import keeps selection');
 await page.locator('.lpx-close').click();
 await page.locator('#underlay').tap();assert.equal(await page.evaluate(()=>window.underlayHits),1,'canvas never blocks clicks');
 // Menu rebuilds (including clones without listeners) must preserve working entries.
 await page.evaluate(()=>{for(const id of ['extensions_settings2','extensionsMenu']){const node=document.getElementById(id);node.replaceWith(node.cloneNode(true));}});
 await page.waitForTimeout(100);
 assert.equal(await page.locator('#lpx-panel').count(),1);assert.equal(await page.locator('#lpx-wand-entry').count(),1);
 await page.locator('#lpx-wand-entry').click();await page.locator('dialog').waitFor({state:'visible'});await page.locator('.lpx-close').click();
 await page.reload();await page.waitForFunction(()=>window.__liliPixelV2);assert.equal(await page.evaluate(()=>window.__liliPixelV2.getDiagnostics().pack),importedId);
 // Pointer/touch fallback deduplication and same-origin iframe capture.
 const before=await page.evaluate(()=>window.__liliPixelV2.getDiagnostics().hits);
 await page.locator('#underlay').tap();assert.equal(await page.evaluate(()=>window.__liliPixelV2.getDiagnostics().hits),before+1);
 const beforeFrame=await page.evaluate(()=>window.__liliPixelV2.getDiagnostics().hits);
 await page.frameLocator('iframe').locator('button').tap();assert.equal(await page.evaluate(()=>window.__liliPixelV2.getDiagnostics().hits),beforeFrame+1);
 await page.mouse.move(60,300);await page.mouse.move(130,330,{steps:8});assert((await page.evaluate(()=>window.__liliPixelV2.getDiagnostics().trails))>0);
 await page.waitForTimeout(3600);const idle=await page.evaluate(()=>window.__liliPixelV2.getDiagnostics());assert.equal(idle.particles,0);assert.equal(idle.trails,0);
 await page.evaluate(()=>window.extension.onDisable());assert.equal(await page.locator('#lpx-panel,#lpx-canvas-layer,#lpx-wand-entry').count(),0);
 await page.evaluate(()=>{window.extension.onEnable();window.extension.onEnable();});assert.equal(await page.locator('#lpx-canvas-layer').count(),1);
 // Retired supplied petals disappear; unrelated custom art and preferences survive.
 await page.evaluate(data=>{localStorage.setItem('lili-fx-packs-v1',JSON.stringify([{...data.packs[0],id:'custom-legacy-lili-petal-pink',name:'我的旧花瓣'},{...data.packs[0],id:'my-art',name:'我的泡泡'}]));localStorage.setItem('lili-fx-settings-v1',JSON.stringify({selected:'lili-petal-pink',scale:1.6,amount:9,trailEnabled:false}));},exported);
 await page.reload();await page.waitForFunction(()=>window.__liliPixelV2);await page.locator('#lpx-panel button').click();assert.equal(await page.locator('[data-effect-id*="lili-petal-"]').count(),0);assert.equal(await page.locator('[data-effect-id="my-art"]').count(),1);
 await page.getByRole('tab',{name:'03 · 设置'}).click();assert.equal(await page.getByRole('slider',{name:'粒子大小',exact:true}).inputValue(),'1.6');
 await page.getByRole('tab',{name:'01 · 点击'}).click();
 const groupFilter=page.getByRole('combobox',{name:'选择特效分组'});
 await groupFilter.selectOption('butterflies');assert.equal(await page.locator('.lpx-card').count(),10);
 await groupFilter.selectOption('rain');assert.equal(await page.locator('.lpx-card').count(),4);
 await page.getByText('管理分组',{exact:true}).click();await page.getByRole('textbox',{name:'分组名称'}).fill('雨夜收藏');await page.getByRole('button',{name:'新建分组',exact:true}).click();
 const newGroup=await groupFilter.inputValue();assert(newGroup.startsWith('group-'));assert.equal(await page.locator('.lpx-card').count(),0);
 await groupFilter.selectOption('all');await page.getByRole('combobox',{name:'移动 白雨 · 落水涟漪 到分组',exact:true}).selectOption(newGroup);
 await groupFilter.selectOption(newGroup);assert.equal(await page.locator('.lpx-card').count(),1);
 await page.getByRole('textbox',{name:'分组名称'}).fill('我的雨夜');await page.getByRole('button',{name:'重命名当前组'}).click();
 await page.reload();await page.waitForFunction(()=>window.__liliPixelV2);await page.locator('#lpx-panel button').click();assert.equal(await groupFilter.inputValue(),newGroup);assert.equal(await page.locator('.lpx-card').count(),1);assert((await groupFilter.locator('option:checked').textContent()).includes('我的雨夜'));
 await page.getByText('管理分组',{exact:true}).click();await page.getByRole('button',{name:'删除当前组'}).click();assert.equal(await groupFilter.inputValue(),'ungrouped');assert.equal(await page.locator('[data-effect-id="lili-ripple-white"]').count(),1);
 await groupFilter.selectOption('all');await page.getByRole('combobox',{name:'移动 白雨 · 落水涟漪 到分组',exact:true}).selectOption('rain');await groupFilter.selectOption('rain');
 await page.screenshot({path:path.join(artifacts,'mobile-groups-rain.png')});
 // New procedural effects are portable and accepted by the current importer.
 await page.locator('[data-effect-id="lili-ripple-blue"] .lpx-thumb').click();const rainExport=await page.evaluate(()=>window.__liliPixelV2.exportPack());assert.equal(rainExport.packs[0].motion,'ripple');assert.equal(await page.evaluate(d=>window.__liliPixelV2.importPacks(d),rainExport),1);
 // Capture desktop and all new artwork for a human visual review.
 await page.locator('.lpx-close').click();await page.setViewportSize({width:1000,height:1000});
 await page.evaluate(async()=>{
  window.__liliPixelV2.destroy();document.body.replaceChildren();document.body.style.background='#f8f5f6';
  const {seasonalPacks}=await import('/seasonal.js');const {butterflyPacks}=await import('/assets.js');
  const title=document.createElement('h1');title.textContent='梨梨 · 内置特效 2.1';title.style='font:24px sans-serif;margin:24px;color:#694956';document.body.append(title);
  const grid=document.createElement('div');grid.style='display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:0 24px 24px';document.body.append(grid);
  for(const pack of [...butterflyPacks,...seasonalPacks]){const card=document.createElement('div');card.style='background:white;border:1px solid #eadbe2;border-radius:10px;overflow:hidden';const label=document.createElement('div');label.textContent=pack.name;label.style='padding:8px 10px;font:13px sans-serif;color:#694956';const art=document.createElement('div');art.style='display:flex;align-items:center;justify-content:center;gap:3px;height:112px;background:linear-gradient(115deg,#eeeeef 0 49.5%,#24222a 50% 100%)';for(const src of (pack.motion==='fall'?[...pack.images.slice(0,3),pack.images[4]]:pack.images.slice(0,pack.motion==='music'?7:4))){const img=new Image();img.src=src;img.style=`width:${pack.motion==='music'?36:58}px;height:70px;object-fit:contain`;art.append(img);}card.append(art,label);grid.append(card);}
  await Promise.all([...document.images].map(i=>i.decode()));
 });
 await page.screenshot({path:path.join(artifacts,'builtin-preview.png'),fullPage:true});
 assert.deepEqual(errors,[]);
 console.log(`PASS: 73 builtins + groups + ripples + petal retirement; ${assets} local assets; mobile layout; new click/trail modes; centered diffusion; portable paired colors; export/import; legacy settings; menu recovery; touch/iframe; trails; lifecycle.\nArtifacts: ${artifacts}`);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

