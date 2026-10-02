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
 assert.equal(await page.locator('.lpx-card').count(),23,'23 builtins');
 assert.equal(await page.evaluate(()=>document.querySelector('dialog').scrollWidth<=document.querySelector('dialog').clientWidth),true,'no horizontal overflow');
 // Load all textures independently; a single broken SVG/WebP must fail the test.
 const assets=await page.evaluate(async()=>{const {ASSETS,butterflyPacks}=await import('/assets.js');const {seasonalPacks}=await import('/seasonal.js');const srcs=[...new Set([...Object.values(ASSETS),...[...butterflyPacks,...seasonalPacks].flatMap(p=>p.images)])];await Promise.all(srcs.map(src=>{const img=new Image();img.src=src;return img.decode();}));return srcs.length;});
 assert.equal(assets,86);
 // Every mode renders and remains bounded under repeated input.
 for(const id of ['lili-bf-white','lili-snow-black','lili-snow-white','lili-music-black','lili-music-white','lili-ripple-white','lili-ripple-blue','lili-bubble-rainbow']){
  await page.locator(`[data-effect-id="${id}"] .lpx-thumb`).click();
  await page.waitForTimeout(180);
  const diag=await page.evaluate(()=>window.__liliPixelV2.getDiagnostics());
  assert.equal(diag.pack,id);assert(diag.particles>0&&diag.particles<=160);assert(diag.images.every(x=>x.ready&&!x.error));
 }
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
 await groupFilter.selectOption('butterflies');assert.equal(await page.locator('.lpx-card').count(),6);
 await groupFilter.selectOption('rain');assert.equal(await page.locator('.lpx-card').count(),2);
 await page.locator('.lpx-group-editor summary').click();await page.getByRole('textbox',{name:'分组名称'}).fill('雨夜收藏');await page.getByRole('button',{name:'新建分组',exact:true}).click();
 const newGroup=await groupFilter.inputValue();assert(newGroup.startsWith('group-'));assert.equal(await page.locator('.lpx-card').count(),0);
 await groupFilter.selectOption('all');await page.getByRole('combobox',{name:'移动 白雨 · 落水涟漪 到分组',exact:true}).selectOption(newGroup);
 await groupFilter.selectOption(newGroup);assert.equal(await page.locator('.lpx-card').count(),1);
 await page.getByRole('textbox',{name:'分组名称'}).fill('我的雨夜');await page.getByRole('button',{name:'重命名当前组'}).click();
 await page.reload();await page.waitForFunction(()=>window.__liliPixelV2);await page.locator('#lpx-panel button').click();assert.equal(await groupFilter.inputValue(),newGroup);assert.equal(await page.locator('.lpx-card').count(),1);assert((await groupFilter.locator('option:checked').textContent()).includes('我的雨夜'));
 await page.locator('.lpx-group-editor summary').click();await page.getByRole('button',{name:'删除当前组'}).click();assert.equal(await groupFilter.inputValue(),'ungrouped');assert.equal(await page.locator('[data-effect-id="lili-ripple-white"]').count(),1);
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
 console.log(`PASS: 23 builtins + groups + ripples + petal retirement; ${assets} local assets; mobile layout; 5 animation modes; export/import; legacy settings; menu recovery; touch/iframe; trails; lifecycle.\nArtifacts: ${artifacts}`);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
