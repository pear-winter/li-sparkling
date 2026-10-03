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
try{ await page.goto(url);await page.waitForFunction(()=>window.__liSparkling);await page.locator('#lpx-panel button').click();
 await page.locator('[data-effect-id="lili-manga-mono"] .lpx-thumb').click();
 await page.getByRole('combobox',{name:'叠加第二款点击特效'}).selectOption('lili-manga-pink');
 await page.getByText('模型 + 符号叠加',{exact:true}).click();
 const models=page.getByRole('checkbox',{name:/独立叠加/});assert.equal(await models.count(),4);for(const box of await models.all())await box.check();
 for(const symbol of ['？','！','…'])await page.getByRole('checkbox',{name:'模型叠加 '+symbol,exact:true}).check();
 let active=await page.evaluate(()=>window.__liSparkling.getDiagnostics().activePacks);assert.equal(active.length,9);assert.equal(new Set(active).size,9);
 await page.locator('[data-effect-id="lili-manga-mono"] .lpx-thumb').click();assert((await page.evaluate(()=>window.__liSparkling.getDiagnostics().particles))>=9);
 const exported=await page.evaluate(()=>window.__liSparkling.exportPack());assert.equal(exported.packs[0].motion,'manga');await page.evaluate(p=>window.__liSparkling.importPacks(p),exported);assert.equal((await page.evaluate(()=>window.__liSparkling.exportPack())).packs[0].motion,'manga');
 await page.getByRole('tab',{name:'02 · 拖尾'}).click();await page.locator('[data-trail-id="silk"] .lpx-thumb').click();await page.getByRole('combobox',{name:'叠加第二款拖尾'}).selectOption('pear-pink');
 await page.reload();await page.waitForFunction(()=>window.__liSparkling);let d=await page.evaluate(()=>window.__liSparkling.getDiagnostics());assert.equal(d.activePacks.length,9);assert.deepEqual(d.activeTrails,['silk','pear-pink']);
 await page.mouse.move(100,200);for(let i=0;i<12;i++){await page.waitForTimeout(22);await page.mouse.move(110+i*10,205+i*2);}d=await page.evaluate(()=>window.__liSparkling.getDiagnostics());assert.deepEqual(new Set(d.trailPackIds),new Set(['silk','pear-pink']));
 await page.evaluate(()=>window.__liSparkling.deletePack('lili-pear-deepseek'));assert(!(await page.evaluate(()=>window.__liSparkling.getDiagnostics().activePacks)).includes('lili-pear-deepseek'));
 await page.setViewportSize({width:1000,height:600});
 const results=await page.evaluate(async()=>{window.__liSparkling.destroy();document.body.replaceChildren();document.body.style='margin:0';const {mangaPacks,spawnManga,drawManga,prepareMangaFont}=await import('/manga.js');await prepareMangaFont(document);if(!document.fonts.check('28px "Lili Manga"'))throw Error('Font failed');const c=document.createElement('canvas');c.width=1000;c.height=600;document.body.append(c);const ctx=c.getContext('2d');ctx.fillStyle='#f4efee';ctx.fillRect(0,0,1000,600);const checks=[];for(let row=0;row<2;row++)for(let i=0;i<4;i++){const p=spawnManga(mangaPacks[row],125+i*250,150+row*300,0,1.3,1000,600,i+row*4);drawManga(ctx,p,500);const test=document.createElement('canvas');test.width=test.height=200;const cx=test.getContext('2d');const q=spawnManga(mangaPacks[row],100,100,0,1,200,200,i);drawManga(cx,q,500);const ink=cx.getImageData(0,0,200,200).data.some(v=>v);cx.clearRect(0,0,200,200);drawManga(cx,q,q.duration);checks.push(ink&&!cx.getImageData(0,0,200,200).data.some(v=>v));}return checks;});assert(results.every(Boolean));
 await page.screenshot({path:path.join(artifacts,'manga-preview.png')});assert.deepEqual(errors,[]);console.log('PASS: two manga packs + four independent models + three symbols; portable manga; reload persistence; actual dual trail emission; model deletion; local font and all balloon variants render/expire.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
