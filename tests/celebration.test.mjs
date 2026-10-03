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
 await page.goto(url);await page.waitForFunction(()=>window.__liSparkling);await page.locator('#lpx-panel button').click();const ids=await page.evaluate(async()=> (await import('/celebration.js')).celebrationPacks.map(p=>p.id));assert.equal(ids.length,12);
 for(const id of ids){await page.locator(`[data-effect-id="${id}"] .lpx-thumb`).click();const pack=await page.evaluate(()=>window.__liSparkling.exportPack());assert.equal(pack.packs[0].id,id);assert.equal(await page.evaluate(p=>window.__liSparkling.importPacks(p),pack),1);}
 const checks=await page.evaluate(async()=>{
  const {celebrationPacks,spawnCelebration,drawCelebration}=await import('/celebration.js');const results=[];
  for(const p of celebrationPacks){const c=document.createElement('canvas');c.width=c.height=320;const ctx=c.getContext('2d');const item=spawnCelebration(p,160,160,6,0,1,false,320,320)[0];const sample=t=>{ctx.clearRect(0,0,320,320);drawCelebration(ctx,item,t);const d=ctx.getImageData(0,0,320,320).data;return {ink:d.reduce((n,v,i)=>n+(i%4===3&&v>0?1:0),0),sum:d.reduce((n,v,i)=>(n+v*(i%99+1))%1000000007,0),corner:d[3]};};results.push({id:p.id,a:sample(600),b:sample(1300),end:sample(p.duration),before:sample(-1)});
   for(const xy of [[0,0],[320,480]]){const q=spawnCelebration(p,...xy,6,0,2,false,320,480)[0];if(q.x<0||q.x>320||q.y<0||q.y>480)throw Error('bounds');}
  }return results;
 });for(const r of checks){assert(r.a.ink>30,r.id);assert.notEqual(r.a.sum,r.b.sum,r.id+' animates');assert.equal(r.a.corner,0);assert.equal(r.end.ink,0);assert.equal(r.before.ink,0);}
 await page.setViewportSize({width:1200,height:1400});
 await page.evaluate(async()=>{window.__liSparkling.destroy();document.body.replaceChildren();document.body.style='margin:0';const {celebrationPacks,spawnCelebration,drawCelebration}=await import('/celebration.js');const c=document.createElement('canvas');c.width=1200;c.height=1400;document.body.append(c);const ctx=c.getContext('2d');for(let i=0;i<celebrationPacks.length;i++){const x=i%3*400,y=Math.floor(i/3)*350;ctx.fillStyle='#f0eee5';ctx.fillRect(x,y,200,350);ctx.fillStyle='#1a2432';ctx.fillRect(x+200,y,200,350);for(const p of spawnCelebration(celebrationPacks[i],x+200,y+185,6,0,1.8,false,1200,1400))drawCelebration(ctx,p,850);}});await page.screenshot({path:path.join(artifacts,'celebration-effects.png')});assert.deepEqual(errors,[]);console.log('PASS: twelve celebration presets render and animate on transparent canvas, expire, fit mobile bounds, import/export and previews.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
