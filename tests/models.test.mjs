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
 await page.goto(url);await page.waitForFunction(()=>window.__liSparkling);await page.locator('#lpx-panel button').click();await page.getByText('模型 + 符号叠加',{exact:true}).click();for(const s of ['？','！','…'])await page.getByRole('checkbox',{name:'模型叠加 '+s,exact:true}).check();
 const model=page.locator('[data-effect-id="lili-pear-rabbit-gpt"] .lpx-thumb');
 const red=await model.evaluate(async b=>{b.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const c=document.querySelector('#lpx-canvas-layer canvas'),data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let red=0;for(let i=0;i<data.length;i+=4)if(data[i]>180&&data[i+1]<110&&data[i+2]<140&&data[i+3]>0)red++;return red;});assert(red>0,'stacked red punctuation renders in live click canvas');
 const exported=await page.evaluate(()=>window.__liSparkling.exportPack());assert.equal(exported.packs[0].motion,'thinking-gpt');assert(!exported.packs[0].name.includes('兔'));
 await page.reload();await page.waitForFunction(()=>window.__liSparkling);await page.locator('#lpx-panel button').click();await page.getByText('模型 + 符号叠加',{exact:true}).click();for(const s of ['？','！','…'])assert(await page.getByRole('checkbox',{name:'模型叠加 '+s,exact:true}).isChecked());
 await page.locator('[data-effect-id="lili-pixel-ellipsis"] .lpx-thumb').click();assert.equal((await page.evaluate(()=>window.__liSparkling.exportPack())).packs[0].label,'…');
 await page.locator('[data-effect-id="lili-pear-pink-emoji"] .lpx-thumb').click();assert.equal((await page.evaluate(()=>window.__liSparkling.exportPack())).packs[0].motion,'pink-pear');
 await page.getByRole('tab',{name:'02 · 拖尾'}).click();await page.locator('[data-trail-id="pear-pink"] .lpx-thumb').click();assert.equal(await page.evaluate(()=>window.__liSparkling.getDiagnostics().trail),'pear-pink');
 await page.setViewportSize({width:1000,height:700});
 const calls=await page.evaluate(async()=>{
  window.__liSparkling.destroy();document.body.replaceChildren();document.body.style='margin:0';const {celebrationPacks,spawnCelebration,drawCelebration}=await import('/celebration.js');const {drawPearTrail,preparePearEmoji}=await import('/pear-effects.js');await preparePearEmoji(document);const c=document.createElement('canvas');c.width=1000;c.height=700;document.body.append(c);const ctx=c.getContext('2d');
  for(let i=0;i<4;i++){const x=i%2*500,y=Math.floor(i/2)*260;ctx.fillStyle='#eeeae5';ctx.fillRect(x,y,250,260);ctx.fillStyle='#1b2430';ctx.fillRect(x+250,y,250,260);const pack=celebrationPacks.find(p=>p.motion===['thinking-gpt','thinking-whale','thinking-gemini','thinking-spark'][i]);for(const p of spawnCelebration(pack,x+250,y+145,6,0,1.7,false,1000,700)){p.overlays=['？','！','…'];drawCelebration(ctx,p,800);}}
  ctx.fillStyle='#202a36';ctx.fillRect(0,520,1000,180);for(let i=0;i<15;i++)drawPearTrail(ctx,{x:60+i*62,y:610+Math.sin(i*.7)*20,time:0,duration:900,phase:i,size:1.7,amount:3,motif:'pear-pink',colors:['#f3a6c6','#ffffff']},300);
  const sample=document.createElement('canvas'),test=sample.getContext('2d'),calls=[];test.drawImage=img=>calls.push(img.src);drawPearTrail(test,{x:30,y:30,time:0,duration:900,phase:0,size:1,amount:3,motif:'pear-pink',colors:['#f3a6c6']},300);return calls;
 });assert(calls.some(s=>s.endsWith('/assets/pear-pink.svg')));await page.screenshot({path:path.join(artifacts,'models-overlay.png')});assert.deepEqual(errors,[]);console.log('PASS: live model and three stacked symbols; saved checkboxes; GPT without rabbit; standalone ellipsis; pink pear click and local pink sprite trail.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
