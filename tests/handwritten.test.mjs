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
 for(const lang of ['ja','zh'])for(const color of ['mono','pink']){const id=`lili-handwritten-${lang}-${color}`;await page.locator(`[data-effect-id="${id}"] .lpx-thumb`).click();const data=await page.evaluate(()=>window.__liSparkling.exportPack());assert.equal(data.packs[0].language,lang);assert.equal(data.packs[0].mangaStyle,'handwritten');await page.evaluate(d=>window.__liSparkling.importPacks(d),data);const imported=await page.evaluate(()=>window.__liSparkling.exportPack());assert.equal(imported.packs[0].language,lang);assert.equal(imported.packs[0].mangaStyle,'handwritten');}
 await page.getByRole('tab',{name:'02 · 拖尾'}).click();for(const lang of ['ja','zh'])for(const color of ['mono','pink']){const id=`handwritten-${lang}-${color}-trail`;await page.locator(`[data-trail-id="${id}"] .lpx-thumb`).click();assert.equal((await page.evaluate(()=>window.__liSparkling.getDiagnostics())).trail,id);}
 await page.getByRole('combobox',{name:'叠加第二款拖尾'}).selectOption('handwritten-ja-mono-trail');await page.reload();await page.waitForFunction(()=>window.__liSparkling);assert.deepEqual((await page.evaluate(()=>window.__liSparkling.getDiagnostics())).activeTrails,['handwritten-zh-pink-trail','handwritten-ja-mono-trail']);
 await page.mouse.move(60,200);for(let i=0;i<18;i++){await page.waitForTimeout(22);await page.mouse.move(70+i*10,205+i*2);}assert.equal((await page.evaluate(()=>window.__liSparkling.getDiagnostics())).trailPackIds.length,2);
 await page.setViewportSize({width:1000,height:850});
 await page.evaluate(async()=>{window.__liSparkling.destroy();document.body.replaceChildren();document.body.style='margin:0';const {mangaPacks,mangaTrails,spawnManga,drawManga,drawMangaTrail,prepareMangaFont}=await import('/manga.js');await prepareMangaFont(document);if(!document.fonts.check('28px "Lili Brush CN"'))throw Error('Chinese font missing');const c=document.createElement('canvas');c.width=1000;c.height=850;document.body.append(c);const ctx=c.getContext('2d');ctx.fillStyle='#f5f1f0';ctx.fillRect(0,0,1000,850);const hand=mangaPacks.filter(p=>p.mangaStyle==='handwritten');
 for(let row=0;row<4;row++){ctx.fillStyle=row%2?'#68404e':'#343239';ctx.font='14px sans-serif';ctx.fillText(['JAPANESE / BLACK','JAPANESE / PINK','CHINESE / BLACK','CHINESE / PINK'][row],24,25+row*160);for(let i=0;i<5;i++){const p=spawnManga(hand[row],110+i*190,95+row*160,0,1.2,1000,850,i);drawManga(ctx,p,420);}}
 for(let row=0;row<2;row++)for(let i=0;i<12;i++)drawMangaTrail(ctx,{...mangaTrails[row?3:0],x:50+i*80,y:710+row*85+Math.sin(i)*8,time:0,duration:1000,size:1,variant:i%8},300);
 const test=document.createElement('canvas');test.width=test.height=240;const cx=test.getContext('2d');for(const pack of hand){for(let i=0;i<8;i++){const p=spawnManga(pack,120,120,0,1,240,240,i);drawManga(cx,p,300);if(!cx.getImageData(0,0,240,240).data.some(v=>v))throw Error('No ink');cx.clearRect(0,0,240,240);drawManga(cx,p,p.duration);if(cx.getImageData(0,0,240,240).data.some(v=>v))throw Error('Not expired');}}if(mangaPacks[0].size!==54)throw Error('Balloon not smaller');});
 await page.screenshot({path:path.join(artifacts,'handwritten-preview.png')});assert.deepEqual(errors,[]);console.log('PASS: four handwritten clicks and trails, portable languages/style, saved dual lettering trails emit, both fonts, all 32 variants render and expire; smaller balloons.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
