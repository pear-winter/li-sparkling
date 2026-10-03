import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const server=http.createServer(async(req,res)=>{try{if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;background:#f8f0f3"><div id="chat"></div><div id="extensions_settings2"></div><div id="extensionsMenu"></div><div id="workbench"></div>');return;}const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root))throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'text/plain');res.end(await readFile(file));}catch{res.statusCode=404;res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:')?route.continue():route.abort());
try{
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.evaluate(async()=>{const{createWorkbenchEffects}=await import('/integrations/workbench-effects.js');const node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};const button=(label,fn)=>{const n=node('button','',label);n.onclick=fn;return n;};window.bridge=createWorkbenchEffects({window,node,button});window.bridge.open(document.getElementById('workbench'));});
 assert((await page.locator('#pear-effects-plugin-panel').innerText()).includes('缺少已启用'));
 assert.equal(await page.evaluate(()=>!!window.__liliPixelV2),false,'workbench must not create an engine');
 // A legacy/global script object must not be mistaken for the installed plugin.
 await page.evaluate(()=>{window.__liliPixelV2={mount(){throw Error('Do not use legacy engine');}};});
 await page.getByRole('button',{name:'重新连接'}).click();assert.equal(await page.locator('.lpx-manager').count(),0);
 await page.evaluate(async()=>{window.extension=await import('/index.js');});
 await page.locator('.lpx-embedded').waitFor();assert.equal(await page.locator('.lpx-card').count(),69);
 assert.equal(await page.locator('.lpx-close').count(),0,'embedded view uses workbench navigation');
 await page.getByRole('combobox',{name:'选择特效分组'}).selectOption('rain');assert.equal(await page.locator('.lpx-card').count(),4);
 await page.getByRole('tab',{name:'03 · 设置'}).click();await page.getByRole('slider',{name:'粒子大小',exact:true}).fill('1.7');
 await page.evaluate(()=>{window.connectedInstance=window.__liSparkling;window.bridge.close();});
 assert.equal(await page.evaluate(()=>window.connectedInstance===window.__liSparkling&&window.__liSparkling.isAvailable()),true);
 assert.equal(await page.locator('#lpx-canvas-layer').count(),1);
 await page.evaluate(()=>window.__liSparkling.openManager('settings'));assert.equal(await page.getByRole('slider',{name:'粒子大小',exact:true}).inputValue(),'1.7');
 await page.evaluate(()=>window.bridge.open(document.getElementById('workbench')));await page.locator('.lpx-embedded').waitFor();assert.equal(await page.locator('dialog.lpx-manager').count(),0);
 await page.evaluate(()=>window.extension.onDisable());await page.waitForFunction(()=>document.getElementById('pear-effects-plugin-panel').textContent.includes('缺少已启用'));assert.equal(await page.locator('#lpx-canvas-layer').count(),0);
 await page.evaluate(()=>window.extension.onEnable());await page.locator('.lpx-embedded').waitFor();
 const identity=await page.evaluate(()=>{window.beforeRestart=window.__liSparkling;window.extension.onEnable();return window.beforeRestart!==window.__liSparkling;});assert(identity);await page.locator('.lpx-embedded').waitFor();assert.equal(await page.locator('.lpx-manager').count(),1);
 await page.evaluate(()=>{window.bridge.dispose();window.dispatchEvent(new Event('li-sparkling:change'));});await page.waitForTimeout(100);assert.equal(await page.locator('#pear-effects-plugin-panel').count(),0);assert.equal(await page.locator('#lpx-canvas-layer').count(),1);
 if(process.env.WORKBENCH_JSON){
  const data=JSON.parse(await readFile(process.env.WORKBENCH_JSON,'utf8'));
  assert(!data.content.includes('startPearEffects'));
  const adapter=(await readFile(path.join(root,'integrations/workbench-effects.js'),'utf8')).replace('export function','function');assert(data.content.includes(adapter),'script contains exact tested adapter');
  await page.evaluate(()=>{localStorage.setItem('cyll-pear-hub-v1',JSON.stringify({lastTab:'effects',floating:true,top:false}));window.beforeWorkbench=window.__liSparkling;const f=document.createElement('iframe');f.id='helper-frame';f.srcdoc='<body></body>';document.body.append(f);});
  const frame=page.frameLocator('#helper-frame');await frame.locator('body').waitFor({state:'attached'});const child=await (await page.locator('#helper-frame').elementHandle()).contentFrame();await child.addScriptTag({content:data.content});
  assert.equal(await page.evaluate(()=>window.__liSparkling===window.beforeWorkbench),true,'full workbench must not replace plugin');
  await page.locator('#cw-fab').click();await page.locator('#pear-effects-plugin-panel .lpx-embedded').waitFor();
  await page.getByRole('combobox',{name:'选择特效分组'}).selectOption('rain');assert.equal(await page.locator('.lpx-card').count(),4);
  await mkdir('/tmp/lili-workbench-test',{recursive:true});await page.screenshot({path:'/tmp/lili-workbench-test/embedded.png'});
  await page.evaluate(()=>window.__cyll_pear_hub_v1__.dispose());assert.equal(await page.evaluate(()=>window.__liSparkling===window.beforeWorkbench&&window.__liSparkling.isAvailable()),true);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: no-plugin gate; late plugin load; identical embedded UI; shared settings; disable/re-enable; hot replacement; workbench close preserves plugin'+(process.env.WORKBENCH_JSON?'; complete uploaded workbench in helper iframe':''));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

