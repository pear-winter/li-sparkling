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
 await page.goto(url);await page.waitForFunction(()=>window.__liSparkling);
 for(const file of [process.env.ST_THEME_CSS,process.env.ST_POPUP_CSS].filter(Boolean))await page.addStyleTag({content:(await readFile(file,'utf8')).replace(/@import[^;]+;/g,'')});
 // Match ST's real extension-header selectors, with custom theme decorations.
 await page.addStyleTag({content:`
 *,*::before,*::after{transition:none!important;animation:none!important;}
 :root{--SmartThemeBodyColor:rgb(37,62,25);--SmartThemeBlurTintColor:rgb(241,248,222);--SmartThemeChatTintColor:rgb(229,239,205);--SmartThemeBorderColor:rgb(128,158,86);--SmartThemeQuoteColor:rgb(88,126,45);--mainFontFamily:serif;--mainFontSize:16px;}
 body{color:var(--SmartThemeBodyColor);background:var(--SmartThemeBlurTintColor);}
 #extensions_settings2 .inline-drawer-toggle.inline-drawer-header{background:repeating-linear-gradient(45deg,#e5efcf 0 15px,#f6fae7 15px 30px);border:3px solid var(--SmartThemeBorderColor);border-radius:18px;padding:12px;color:var(--SmartThemeBodyColor);}
 #extensions_settings2 .inline-drawer-toggle.inline-drawer-header::before{content:'✧';}
 .popup{border-radius:18px;display:flex;flex-direction:column;min-height:fit-content;}
 .menu_button{background-image:linear-gradient(30deg,transparent,#b3cc8433);}
 `});
 await page.evaluate(()=>{const ref=document.createElement('div');ref.className='extension_container';ref.innerHTML='<div class="inline-drawer"><button id="native-header" class="inline-drawer-toggle inline-drawer-header"><b>原生扩展标题</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></button></div>';document.querySelector('#extensions_settings2').prepend(ref);});
 const headers=await page.evaluate(()=>['#native-header','#lpx-panel button'].map(s=>{const c=getComputedStyle(document.querySelector(s));return [c.backgroundImage,c.border,c.borderRadius,c.padding,c.color,getComputedStyle(document.querySelector(s),'::before').content];}));
 assert.deepEqual(headers[0],headers[1],'native selector decorations match');
 await page.locator('#lpx-panel button').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('dialog[open]').count(),1,'keyboard opens one modal');
 const filter=page.getByRole('combobox',{name:'选择特效分组'});await filter.selectOption('rain');
 for(const theme of [{name:'green',ink:'rgb(37, 62, 25)',bg:'rgb(241, 248, 222)'},{name:'dark',ink:'rgb(222, 233, 247)',bg:'rgb(18, 28, 43)'}]){
  await page.evaluate(t=>{document.documentElement.style.setProperty('--SmartThemeBodyColor',t.ink);document.documentElement.style.setProperty('--SmartThemeBlurTintColor',t.bg);document.documentElement.style.setProperty('--SmartThemeChatTintColor',t.bg);},theme);
  for(const width of [320,390,1100]){
   await page.setViewportSize({width,height:844});
   const state=await page.evaluate(()=>{const d=document.querySelector('.lpx-dialog'),b=d.querySelector('.lpx-btn'),i=d.querySelector('.lpx-input');return {ink:getComputedStyle(d).color,bg:getComputedStyle(d).backgroundColor,button:getComputedStyle(b).color,input:getComputedStyle(i).color,overflow:d.scrollWidth>d.clientWidth,width:d.getBoundingClientRect().width};});
   assert.equal(state.ink,theme.ink);assert.equal(state.bg,theme.bg);assert.equal(state.button,theme.ink);assert.equal(state.input,theme.ink);assert.equal(state.overflow,false);assert(state.width<=width);assert(await page.locator('.lpx-dialog').evaluate(d=>d.getBoundingClientRect().height<=innerHeight));
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(artifacts,`theme-${theme.name}.png`)});
 }
 // Water must be transparent, expand, fade out, and use a different blue palette.
 const frames=await page.evaluate(async()=>{
  const {ripplePacks,drawWave,drawRipple}=await import('/ripples.js');
  const c=document.createElement('canvas');c.width=400;c.height=300;const cx=c.getContext('2d');
  const sample=(pack,time)=>{cx.clearRect(0,0,400,300);(pack.motion==='wave'?drawWave:drawRipple)(cx,{...pack,x:200,y:150,start:0,radius:120,scale:1,drops:4,rings:5},time);const d=cx.getImageData(0,0,400,300).data;let n=0,left=400,right=0,red=0,blue=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>4){n++;const x=(i/4)%400;left=Math.min(left,x);right=Math.max(right,x);red+=d[i];blue+=d[i+2];}return {n,width:right-left,red,blue,corner:d[3]};};
  return ripplePacks.map(p=>({id:p.id,early:sample(p,450),late:sample(p,1400),end:sample(p,p.duration),before:sample(p,-1)}));
 });
 for(const f of frames){assert(f.early.n>100);assert(f.late.width>f.early.width);assert.equal(f.early.corner,0);assert.equal(f.end.n,0);assert.equal(f.before.n,0);}
 assert(frames[1].early.red/frames[1].early.blue<frames[0].early.red/frames[0].early.blue);
 // The same variables resolve from a workbench container, and update live there.
 await page.locator('.lpx-close').click();
 await page.screenshot({path:path.join(artifacts,'native-entry.png')});
 await page.evaluate(()=>{const box=document.createElement('div');box.id='embedded-theme';box.style='--SmartThemeBodyColor:rgb(70,40,100);--SmartThemeBlurTintColor:rgb(240,230,250);width:300px';document.body.append(box);window.__liSparkling.mount(box);});
 assert.equal(await page.locator('.lpx-embedded').evaluate(d=>getComputedStyle(d).color),'rgb(70, 40, 100)');
 assert.equal(await page.locator('.lpx-embedded').evaluate(d=>d.scrollWidth<=d.clientWidth),true);
 assert.deepEqual(errors,[]);console.log('PASS: native decorated header; keyboard opening; live green/dark themes; 320/390/1100 widths; scoped embedded theme; four transparent expanding water presets and expiry.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
