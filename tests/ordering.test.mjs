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
 await page.goto(url);await page.waitForFunction(()=>window.__liSparkling);await page.locator('#lpx-panel button').click();const filter=page.getByRole('combobox',{name:'选择特效分组'});await filter.selectOption('pear');
 const order=()=>page.locator('[data-effect-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.effectId));
 assert.equal((await order())[0],'lili-pear-word');
 const shiro=page.locator('[data-effect-id="lili-pear-shiro"]');await shiro.getByRole('button',{name:'收藏 Shiro！ · 白黑像素字与十字架',exact:true}).click();assert.deepEqual((await order()).slice(0,2),['lili-pear-word','lili-pear-shiro']);
 const wine=page.locator('[data-effect-id="lili-pear-jiuniang"]');await wine.locator('.lpx-favorite').click();await wine.getByRole('button',{name:/上移/}).click();assert.deepEqual((await order()).slice(0,3),['lili-pear-word','lili-pear-jiuniang','lili-pear-shiro']);assert(await wine.getByRole('button',{name:/上移/}).isDisabled());
 await shiro.locator('.lpx-thumb').click();const pack=await page.evaluate(()=>window.__liSparkling.exportPack());assert.equal(pack.packs[0].label,'Shiro！');assert.deepEqual(pack.packs[0].colors,['#ffffff','#111111']);assert.equal(pack.packs[0].companions,'cross');
 await page.reload();await page.waitForFunction(()=>window.__liSparkling);await page.locator('#lpx-panel button').click();assert.deepEqual((await order()).slice(0,3),['lili-pear-word','lili-pear-jiuniang','lili-pear-shiro']);
 await page.getByRole('tab',{name:'02 · 拖尾'}).click();const trailOrder=()=>page.locator('[data-trail-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.trailId));
 await page.locator('[data-trail-id="pear-emoji"] .lpx-favorite').click();assert.equal((await trailOrder())[0],'pear-emoji');await page.locator('[data-trail-id="silk"] .lpx-favorite').click();await page.locator('[data-trail-id="pear-emoji"]').getByRole('button',{name:/上移/}).click();assert.deepEqual((await trailOrder()).slice(0,2),['pear-emoji','silk']);await page.locator('[data-trail-id="pear-emoji"] .lpx-favorite').click();assert.equal((await trailOrder())[0],'silk');
 await page.reload();await page.waitForFunction(()=>window.__liSparkling);await page.locator('#lpx-panel button').click();await page.getByRole('tab',{name:'02 · 拖尾'}).click();assert.equal((await trailOrder())[0],'silk');assert.equal(await page.locator('[data-trail-id="silk"] .lpx-favorite').getAttribute('aria-pressed'),'true');
 assert(await page.locator('.lpx-manager').evaluate(e=>e.scrollWidth<=e.clientWidth));assert.deepEqual(errors,[]);
 const {createOrdering}=await import('../ordering.js');let saved;const model=createOrdering(null,s=>{saved=s;});const all=['a','hidden','b'].map(id=>({id}));model.move(all,[all[0],all[2]],'b',-1);assert.deepEqual(model.sort(all).map(p=>p.id),['b','hidden','a']);model.toggle('a');assert.equal(model.sort(all)[0].id,'a');model.toggle('a');assert.equal(createOrdering(saved,()=>{}).sort(all)[0].id,'b');const failed=createOrdering(null,()=>false);assert.throws(()=>failed.toggle('a'));assert.equal(failed.favorite('a'),false);
 console.log('PASS: Shiro colors/export; pear pinned before favorites; favorite toggle, arrows, saved order on both tabs; filtered movement; save failure rollback; mobile overflow.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
