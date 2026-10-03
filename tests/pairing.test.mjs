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
 await page.goto(url);await page.waitForFunction(()=>window.__liSparkling);await page.locator('#lpx-panel button').click();await page.locator('[data-effect-id="lili-wave-white"] .lpx-thumb').click();const pair=page.getByRole('combobox',{name:'叠加第二款点击特效'});assert.equal(await pair.locator('option').count(),69);
 await pair.selectOption('lili-pear-word');
 const added=await page.locator('[data-effect-id="lili-wave-white"] .lpx-thumb').evaluate(b=>{const before=window.__liSparkling.getDiagnostics().particles;b.click();const d=window.__liSparkling.getDiagnostics();return {delta:d.particles-before,active:d.activePacks};});assert.equal(added.delta,13,'one wave plus text, companions and dust');assert.deepEqual(added.active,['lili-wave-white','lili-pear-word']);
 await page.reload();await page.waitForFunction(()=>window.__liSparkling);assert.deepEqual(await page.evaluate(()=>window.__liSparkling.getDiagnostics().activePacks),added.active);await page.locator('#lpx-panel button').click();assert.equal(await pair.inputValue(),'lili-pear-word');
 await pair.selectOption('');assert.deepEqual(await page.evaluate(()=>window.__liSparkling.getDiagnostics().activePacks),['lili-wave-white']);
 const exported=await page.evaluate(()=>window.__liSparkling.exportPack());exported.packs[0].id='user-test-wave';exported.packs[0].name='上传测试水纹';await page.evaluate(p=>window.__liSparkling.importPacks(p),exported);await page.getByRole('tab',{name:'01 · 点击'}).click();await page.locator('[data-effect-id="lili-pear-word"] .lpx-thumb').click();await pair.selectOption('user-test-wave');assert.equal((await page.evaluate(()=>window.__liSparkling.getDiagnostics().activePacks))[1],'user-test-wave');await page.evaluate(()=>window.__liSparkling.deletePack('user-test-wave'));assert.deepEqual(await page.evaluate(()=>window.__liSparkling.getDiagnostics().activePacks),['lili-pear-word']);
 await page.getByRole('tab',{name:'02 · 拖尾'}).click();for(const id of ['pixel-pear-green','pixel-grass-green']){await page.locator(`[data-trail-id="${id}"] .lpx-thumb`).click();assert.equal(await page.evaluate(()=>window.__liSparkling.getDiagnostics().trail),id);}
 const letters=await page.evaluate(async()=>{const {pixelTrails,drawPixelTrail}=await import('/pear-effects.js');return pixelTrails.map(p=>{const c=document.createElement('canvas');c.width=c.height=120;const ctx=c.getContext('2d'),q={...p,x:60,y:60,time:0,duration:1000,phase:0,size:2,amount:3};drawPixelTrail(ctx,q,200);const ink=ctx.getImageData(0,0,120,120).data.some(v=>v);ctx.clearRect(0,0,120,120);drawPixelTrail(ctx,q,1000);return {ink,expired:!ctx.getImageData(0,0,120,120).data.some(v=>v)};});});assert(letters.every(p=>p.ink&&p.expired));await page.setViewportSize({width:800,height:400});await page.evaluate(async()=>{window.__liSparkling.destroy();document.body.replaceChildren();document.body.style='margin:0';const {pixelTrails,drawPixelTrail}=await import('/pear-effects.js');const c=document.createElement('canvas');c.width=800;c.height=400;document.body.append(c);const ctx=c.getContext('2d');ctx.fillStyle='#f1f2e8';ctx.fillRect(0,0,400,400);ctx.fillStyle='#1c2936';ctx.fillRect(400,0,400,400);for(let row=0;row<2;row++)for(let i=0;i<10;i++)drawPixelTrail(ctx,{...pixelTrails[row],x:48+i*78,y:110+row*180+Math.sin(i*.6)*15,time:0,duration:1000,phase:i,size:1.6,amount:3},250);});await page.screenshot({path:path.join(artifacts,'pixel-trails.png')});assert.deepEqual(errors,[]);console.log('PASS: complete secondary list; wave plus text actually spawn together; saved pair, single mode, uploaded secondary and deletion fallback; both green pixel trails render and expire.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
