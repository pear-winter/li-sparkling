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
 await page.goto(url);await page.waitForFunction(()=>window.__liSparkling);await page.locator('#lpx-panel button').click();
 for(const [key,letter] of [['ah','啊'],['hmm','嗯']])for(const color of ['mono','pink']){const id=`lili-exclamation-${key}-${color}`;await page.locator(`[data-effect-id="${id}"] .lpx-thumb`).click();const data=await page.evaluate(()=>window.__liSparkling.exportPack());assert.equal(data.packs[0].letter,letter);assert.equal(data.packs[0].mangaStyle,'exclamation');await page.evaluate(d=>window.__liSparkling.importPacks(d),data);assert.equal((await page.evaluate(()=>window.__liSparkling.exportPack())).packs[0].letter,letter);}
 await page.getByRole('tab',{name:'02 · 拖尾'}).click();await page.locator('[data-trail-id="exclamation-ah-mono-trail"] .lpx-thumb').click();await page.getByRole('combobox',{name:'叠加第二款拖尾'}).selectOption('exclamation-hmm-pink-trail');await page.reload();await page.waitForFunction(()=>window.__liSparkling);assert.deepEqual((await page.evaluate(()=>window.__liSparkling.getDiagnostics())).activeTrails,['exclamation-ah-mono-trail','exclamation-hmm-pink-trail']);
 await page.mouse.move(60,200);for(let i=0;i<18;i++){await page.waitForTimeout(22);await page.mouse.move(70+i*10,205+i*2);}assert.equal((await page.evaluate(()=>window.__liSparkling.getDiagnostics())).trailPackIds.length,2);
 await page.setViewportSize({width:1000,height:680});
 await page.evaluate(async()=>{window.__liSparkling.destroy();document.body.replaceChildren();document.body.style='margin:0';const {mangaPacks,mangaTrails,spawnManga,drawManga,drawMangaTrail,prepareMangaFont}=await import('/manga.js');await prepareMangaFont(document);const c=document.createElement('canvas');c.width=1000;c.height=680;document.body.append(c);const ctx=c.getContext('2d');ctx.fillStyle='#f5f1f0';ctx.fillRect(0,0,1000,680);const packs=mangaPacks.filter(p=>p.mangaStyle==='exclamation');for(let i=0;i<4;i++)drawManga(ctx,spawnManga(packs[i],125+i*250,230,0,1.7,1000,680,0),500);
 const trails=mangaTrails.filter(p=>p.mangaStyle==='exclamation');for(let i=0;i<12;i++)drawMangaTrail(ctx,{...trails[i%4],x:50+i*80,y:540+Math.sin(i)*15,time:0,duration:1000,size:1.4,variant:0},350);
 const test=document.createElement('canvas');test.width=390;test.height=844;const cx=test.getContext('2d');for(const pack of packs){const p=spawnManga(pack,0,0,0,2,390,844,0);drawManga(cx,p,300);const a=cx.getImageData(0,0,390,844).data;if(!a.some(v=>v))throw Error('No ink');for(let x=0;x<390;x++)if(a[x*4+3])throw Error('Clipped top');for(let y=0;y<844;y++)if(a[y*390*4+3])throw Error('Clipped left');cx.clearRect(0,0,390,844);drawManga(cx,p,p.duration);if(cx.getImageData(0,0,390,844).data.some(v=>v))throw Error('Did not expire');}});
 await page.screenshot({path:path.join(artifacts,'exclamation-preview.png')});assert.deepEqual(errors,[]);console.log('PASS: all four fixed-letter packs export/import; paired framed trails persist and emit; phone edge bounds and expiry; visual preview.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
