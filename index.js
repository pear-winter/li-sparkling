import { textPacks, pearTrail, preparePearEmoji, supportedLabels, spawnText, drawTextParticle, drawPearEmoji, drawPearTrail } from './pear-effects.js';
import { clearWaterCache } from './water.js';
import { ASSETS, butterflyPacks } from './assets.js';
import { seasonalPacks } from './seasonal.js';
import { createGroups } from './groups.js';
import { ripplePacks, spawnRipples, drawRipple, spawnWaves, drawWave } from './ripples.js';

import { monochromeStars, drawStar, ornamentPacks, ornamentTrails, motifFor, drawMotif, spawnOrnaments, drawOrnament, drawOrnamentTrail } from './ornaments.js';

function start() {

const host=(()=>{let w=window;try{while(w.parent!==w&&w.parent.document){w=w.parent;if(w.document.querySelector('#chat'))return w;}}catch{}return w;})();
const doc=host.document,KEY='__liliPixelV2';
preparePearEmoji(doc);
host.__liliPixelV1?.destroy?.();host[KEY]?.destroy?.();
const abort=new host.AbortController();
const read=k=>{try{return host.localStorage.getItem(k);}catch{return null;}};
const write=(k,v)=>{try{host.localStorage.setItem(k,v);return true;}catch{return false;}};
const parse=(s,f)=>{try{return JSON.parse(s)||f;}catch{return f;}};
const themeActive=()=>host.getComputedStyle(doc.documentElement).getPropertyValue('--lp-theme').trim().startsWith('lili-pixel-v');
const context=()=>{try{return host.SillyTavern?.getContext?.()||{};}catch{return {};}};
const randSeed=()=>host.crypto?.getRandomValues(new Uint32Array(1))[0]||Date.now()>>>0;
const packsDefault=[
 {id:'lili-love',name:'奶油爱心与闪亮',images:[ASSETS.heart,ASSETS.spark1,ASSETS.spark2],colors:['#ffb7bf','#fff5ef','#ff9fac'],count:6,size:22,duration:1000,spread:90,lift:55},
 {id:'lili-stars',name:'星星糖霜',images:[ASSETS.spark1,ASSETS.spark2],colors:['#fffaf5','#ffd1d4'],count:6,size:23,duration:1100,spread:110,lift:45},
 {id:'lili-pixels',name:'粉白像素雨',images:[],colors:['#ffb7bf','#fff5ef','#f59fa8'],count:10,size:6,duration:900,spread:80,lift:35},
 {"id":"lili-mono","name":"黑白 · 像素碎片","images":[],"colors":["#171717","#ffffff","#999999"],"count":10,"size":7,"duration":1100,"spread":100,"lift":45,"shape":"square","glow":0},
 monochromeStars,
 {"id":"lili-neon","name":"赛博 · 霓虹电光","images":[],"colors":["#00f5ff","#ff21d0","#aa55ff","#f5ff00"],"count":10,"size":7,"duration":1100,"spread":100,"lift":45,"shape":"diamond","glow":12},
 {"id":"lili-neon-stars","name":"赛博 · 星芒脉冲","images":[],"colors":["#ff18b8","#00ffff","#7b61ff"],"count":10,"size":12,"duration":1100,"spread":100,"lift":45,"shape":"star","glow":14},
 {"id":"lili-pear","name":"梨梨 · 甜梨派对","images":[],"colors":["#ffe66d","#a9dc65","#fff5bd"],"count":10,"size":25,"duration":1100,"spread":100,"lift":45,"shape":"square","glow":0,"sparkles":true,"motifs":["pear","pear","heart","heart","star"]},
 {"id":"lili-pear-garden","name":"梨梨 · 青柠小花园","images":[],"colors":["#f5d84f","#80c75b","#dcf4ac"],"count":10,"size":25,"duration":1100,"spread":100,"lift":45,"shape":"square","glow":0,"sparkles":true,"motifs":["pear","leaf","flower","leaf","flower","heart"]},
 {"id":"lili-yellow-green","name":"黄绿 · 汽水泡泡","images":[],"colors":["#ffdc4f","#9ad95c","#fff3ad","#d1efa2"],"count":10,"size":8,"duration":1100,"spread":100,"lift":45,"shape":"circle","glow":0}
, ...butterflyPacks, ...seasonalPacks, ...ripplePacks, ...ornamentPacks, ...textPacks
];
function validatePack(p){
 if(!p||typeof p!=='object'||typeof p.name!=='string'||!p.name.trim()||p.name.length>60)throw Error('特效名称需要 1～60 个字。');
 if(!Array.isArray(p.images)||p.images.length>12)throw Error('每组特效最多 12 张图片。');
 for(const src of p.images)if(typeof src!=='string'||src.length>2800000||!(/^(https:\/\/[^\s]+|data:image\/(png|webp|jpeg|gif);base64,[A-Za-z0-9+/=]+)$/.test(src)))throw Error('图片仅支持 HTTPS 链接或内嵌 PNG / WebP / JPEG / GIF。');
 if(!Array.isArray(p.colors)||!p.colors.length||p.colors.length>12||p.colors.some(c=>!/^#[0-9a-f]{6}$/i.test(c)))throw Error('颜色必须是 #RRGGBB。');
 const bounds={count:[1,40],size:[3,72],duration:[250,2500],spread:[10,220],lift:[0,180]};
 const v={id:typeof p.id==='string'&&/^[a-zA-Z0-9_-]{1,64}$/.test(p.id)?p.id:'custom-'+randSeed().toString(36),name:p.name.trim(),images:[...p.images],colors:[...p.colors]};
 if(p.emojis!==undefined){if(!Array.isArray(p.emojis)||p.emojis.length>12||p.emojis.some(e=>typeof e!=='string'||!e.trim()||[...e].length>16))throw Error('emoji 最多 12 项，每项最多 16 个字符。');v.emojis=[...p.emojis];}
 if(p.motifs!==undefined){if(!Array.isArray(p.motifs)||!p.motifs.length||p.motifs.length>12||p.motifs.some(m=>!['pear','leaf','flower','heart','star'].includes(m)))throw Error('不支持的纯色图案。');v.motifs=[...p.motifs];}
 if(p.shape!==undefined){if(!['square','circle','diamond','star'].includes(p.shape))throw Error('不支持的粒子形状。');v.shape=p.shape;}
 if(p.motion!==undefined){if(!['flutter','fall','bubble','snow','music','ripple','wave','fountain','glitter','blossom','pixel-text'].includes(p.motion))throw Error('不支持的运动方式。');v.motion=p.motion;}
 if(p.sparkles!==undefined){if(typeof p.sparkles!=='boolean')throw Error('小粒子开关无效。');v.sparkles=p.sparkles;}
 if(p.motion==='pixel-text'){if(!supportedLabels.includes(p.label)||!['pear','butterfly'].includes(p.companions)||p.colors.length<2)throw Error('像素字或伴随图案无效。');v.label=p.label;v.companions=p.companions;}
 if(p.paired!==undefined){if(typeof p.paired!=='boolean'||(p.paired&&(p.images.length<2||p.images.length%2)))throw Error('双蝶标记无效。');v.paired=p.paired;}
 if(p.hues!==undefined){if(!Array.isArray(p.hues)||p.hues.length!==p.images.length||p.hues.some(h=>!Number.isFinite(h)||Math.abs(h)>360))throw Error('素材色相无效。');v.hues=[...p.hues];}
 if(p.glow!==undefined){if(!Number.isFinite(p.glow)||p.glow<0||p.glow>20)throw Error('发光强度需要 0～20。');v.glow=p.glow;}
 for(const [k,[min,max]] of Object.entries(bounds)){if(!Number.isFinite(p[k])||p[k]<min||p[k]>max)throw Error(`${k} 必须在 ${min}～${max} 之间。`);v[k]=Math.round(p[k]);}return v;
}
let custom=[];const savedCustom=parse(read('lili-fx-packs-v1'),[]);if(Array.isArray(savedCustom))for(const p of savedCustom.slice(0,20)){try{custom.push(validatePack(p));}catch{}}
// Retire the supplied petal packs, including previously imported copies.
const isRetiredPetal=p=>/^(?:custom-(?:legacy-)?)?lili-petal-(pink|red|white|black)(?:-|$)/.test(p?.id||'');
custom=custom.filter(p=>!isRetiredPetal(p));
if(Array.isArray(savedCustom)&&savedCustom.some(isRetiredPetal))write('lili-fx-packs-v1',JSON.stringify(custom));
// Keep old custom artwork available while new seasonal builtins take their stable IDs.
const migratedCustom=custom.map(p=>seasonalPacks.some(b=>b.id===p.id)?{...p,id:'custom-legacy-'+p.id}:p);
if(migratedCustom.some((p,i)=>p!==custom[i])&&write('lili-fx-packs-v1',JSON.stringify(migratedCustom)))custom=migratedCustom;
const DEFAULT_PREFS={enabled:true,selected:'lili-love',scale:1,amount:6,lightweight:false,trailEnabled:true,trailSelected:'silk',trailAmount:3,trailSize:1,trailDuration:650};
let prefs={...DEFAULT_PREFS,...parse(read('lili-fx-settings-v1'),{})};
for(const [k,min,max]of [['trailAmount',1,6],['trailSize',.5,2.5],['trailDuration',250,1200]])prefs[k]=Math.max(min,Math.min(max,Number(prefs[k])||DEFAULT_PREFS[k]));
prefs.scale=Math.max(.5,Math.min(2,Number(prefs.scale)||1));
let hiddenBuiltins=parse(read('lili-fx-hidden-v1'),[]);if(!Array.isArray(hiddenBuiltins))hiddenBuiltins=[];
let builtinNames=parse(read('lili-fx-names-v1'),{});if(!builtinNames||typeof builtinNames!=='object'||Array.isArray(builtinNames))builtinNames={};
const allPacks=()=>[...packsDefault.filter(p=>!hiddenBuiltins.includes(p.id)&&!custom.some(c=>c.id===p.id)).map(p=>({...p,name:typeof builtinNames[p.id]==='string'?builtinNames[p.id].slice(0,60):p.name})),...custom];
const groups=createGroups(parse(read('lili-fx-groups-v1'),null),value=>write('lili-fx-groups-v1',JSON.stringify(value)));
const selected=()=>allPacks().find(p=>p.id===prefs.selected)||allPacks()[0]||{...packsDefault[0],id:'',name:'暂无特效',images:[],count:0};
prefs.amount=Math.max(2,Math.min(14,Number(prefs.amount)||6));
const trailPacks=[
 {id:'silk',name:'奶油粉白 · 丝带',colors:['#ffc3d7','#fffaf5','#ffe3ed'],glow:0},
 {id:'neon',name:'赛博霓虹 · 光丝',colors:['#00f5ff','#ff21d0','#aa55ff'],glow:10},
 {id:'mono',name:'黑白 · 银线',colors:['#171717','#ffffff','#a8a8a8'],glow:0},
 {id:'pear',name:'梨梨 · 黄绿糖丝',colors:['#ffe66d','#a9dc65','#fff5bd'],glow:3},
 {id:'aurora',name:'极光 · 蓝紫流光',colors:['#a0e7ff','#baadff','#f3cbff'],glow:7}, ...ornamentTrails, pearTrail
];
const selectedTrail=()=>trailPacks.find(p=>p.id===prefs.trailSelected)||trailPacks[0];
let trails=[],trailSession=0;
let managerUI=null,uploadDraft=null,lastDeleted=null;

const persist=()=>write('lili-fx-settings-v1',JSON.stringify(prefs));
const savePacks=()=>write('lili-fx-packs-v1',JSON.stringify(custom));
let stopped=false,lastTouch=-Infinity,lastPointer=-Infinity,lastActive=Date.now(),scanQueued=false,oldTheme=themeActive();
let manager=null,raf=0,totalHits=0,lastInput='尚未点击',particles=[],lastBurst=-Infinity;
const cache=new Map(),seenFrames=new WeakSet(),boundDocs=new WeakSet();
const timers=new Set(),disposers=[];
function later(fn,ms){const id=host.setTimeout(()=>{timers.delete(id);if(!stopped)fn();},ms);timers.add(id);return id;}
function el(tag,cls,text){const n=doc.createElement(tag);if(cls)n.className=cls;if(n.classList.contains('lpx-input'))n.classList.add('text_pole');if(text!==undefined)n.textContent=text;return n;}
function listen(n,event,fn,opts={}){n.addEventListener(event,fn,{...opts,signal:abort.signal});}
function button(label,fn,cls='lpx-btn'){const b=el('button',cls,label);if(b.classList.contains('lpx-btn'))b.classList.add('menu_button');b.type='button';listen(b,'click',fn);return b;}
function styleImportant(n,styles){for(const [k,v]of Object.entries(styles))n.style.setProperty(k,String(v),'important');}
const sheet=el('link');sheet.id='lpx-ui-style';sheet.rel='stylesheet';sheet.href=new URL('./style.css',import.meta.url).href;doc.head.append(sheet);
const layer=el('div');layer.id='lpx-canvas-layer';layer.setAttribute('aria-hidden','true');layer.setAttribute('popover','manual');
styleImportant(layer,{position:'fixed',inset:'0',width:'100vw',height:'100dvh',margin:'0',padding:'0',border:'0','max-width':'none','max-height':'none',background:'transparent','box-shadow':'none','pointer-events':'none','z-index':'2147483647',overflow:'hidden',transform:'none',filter:'none',opacity:'1','clip-path':'none'});
const canvas=el('canvas');styleImportant(canvas,{display:'block',width:'100%',height:'100%',margin:'0',padding:'0','pointer-events':'none',background:'transparent',opacity:'1',border:'0',filter:'none'});layer.append(canvas);doc.documentElement.append(layer);
const ctx=canvas.getContext('2d',{alpha:true});let cw=0,ch=0,dpr=1;
function viewport(){const r=layer.getBoundingClientRect();const w=Math.max(1,r.width||host.innerWidth),h=Math.max(1,r.height||host.innerHeight);const ratio=Math.min(2,host.devicePixelRatio||1);if(w!==cw||h!==ch||ratio!==dpr){cw=w;ch=h;dpr=ratio;canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}ctx?.setTransform(dpr,0,0,dpr,0,0);return r;}
function raise(target){
 if(!layer.isConnected)doc.documentElement.append(layer);
 try{if(layer.matches(':popover-open'))layer.hidePopover();layer.showPopover();}
 catch{const modal=target?.closest?.('dialog[open]');(modal||doc.body).append(layer);styleImportant(layer,{display:'block'});}
 return viewport();
}
function loadImage(src,hue=0){const key=src+'|'+hue;if(cache.has(key))return cache.get(key);const img=new host.Image(),rec={image:img,ready:false,error:false};img.onload=()=>{if(hue){const c=doc.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const cx=c.getContext('2d');cx.filter=`hue-rotate(${hue}deg)`;cx.drawImage(img,0,0);rec.image=c;}rec.ready=true;updateStatus();};img.onerror=()=>{rec.error=true;updateStatus();};img.src=src;cache.set(key,rec);return rec;}
function preload(){selected().images.forEach((src,i)=>loadImage(src,selected().hues?.[i]||0));}preload();
// ===== 扇翅膀模式（motion:'flutter'）：图片当蝴蝶，呼啦呼啦往上飞 + 反色闪闪 =====
const SPARK_D='M0 -50 Q6 -6 50 0 Q6 6 0 50 Q-6 6 -50 0 Q-6 -6 0 -50 Z';let sparkPath=null;
const getSpark=()=>sparkPath||(sparkPath=new (host.Path2D||Path2D)(SPARK_D));
function makeTwinkle(x,y,dx,dy,color,size,now,duration){return {kind:'twinkle',x,y,dx,dy,color,size,start:now,duration,rotation:(Math.random()-.5)*.6,phase:Math.random()*6.28,dot:Math.random()<.28};}
function spawnFlutter(pack,x,y,num,now){
 const sc=prefs.scale,n=prefs.lightweight?Math.min(num,3):Math.max(2,Math.round(num*.8)),order=pack.paired?Array.from({length:pack.images.length/2},(_,i)=>i).sort(()=>Math.random()-.5).flatMap(i=>[i*2,i*2+1]):pack.images.map((_,i)=>i).sort(()=>Math.random()-.5);
 for(let i=0;i<n;i++){const idx=order[i%order.length],ang=(Math.random()-.5)*1.9,delay=i*45;
  particles.push({kind:'flutter',texture:loadImage(pack.images[idx],pack.hues?.[idx]||0),spark:pack.colors[idx%pack.colors.length],x:x+(Math.random()-.5)*pack.spread*.4,y:y+(Math.random()-.5)*16,
   drift:Math.sin(ang)*pack.spread*(.5+Math.random()*.9),rise:pack.lift*(.8+Math.random()*.6)+Math.random()*70,swayAmp:6+Math.random()*12,swayHz:.8+Math.random()*.9,
   flapHz:5+Math.random()*4,phase:Math.random()*6.28,tilt:Math.sin(ang)*.35,start:now+delay,duration:pack.duration*(.85+Math.random()*.4),
   size:pack.size*sc*(i===0?1.3:.55+Math.random()*.65),nextSpark:now+delay+80+Math.random()*150});}
 const k=prefs.lightweight?3:Math.max(4,Math.round(num*.8));
 for(let i=0;i<k;i++){const a=Math.random()*6.28,d=(18+Math.random()*42)*sc;particles.push(makeTwinkle(x,y,Math.cos(a)*d,Math.sin(a)*d-12,pack.colors[i%pack.colors.length],(8+Math.random()*7)*sc,now,600+Math.random()*400));}
}
function drawFlutter(p,now,spawn){
 if(now<p.start)return;const age=now-p.start,t=Math.min(1,age/p.duration);
 if(p.kind==='twinkle'){
  const e=1-Math.pow(1-t,2),x=p.x+p.dx*e,y=p.y+p.dy*e+8*t,s=Math.max(.5,p.size*(.35+.65*Math.sin(t*Math.PI))*(1+.18*Math.sin(age/55+p.phase)));
  ctx.save();ctx.translate(x,y);ctx.rotate(p.rotation+t*.7);ctx.globalAlpha=Math.min(1,t/.12)*Math.pow(1-t,.8);
  ctx.fillStyle=p.color;
  if(p.dot){ctx.beginPath();ctx.arc(0,0,s*.2,0,Math.PI*2);ctx.fill();}
  else{const k=s/100;ctx.scale(k,k);ctx.fill(getSpark());}
  ctx.restore();return;
 }
 const w=age/1000*Math.PI*2,ease=1-Math.pow(1-t,1.6),x=p.x+p.drift*ease+Math.sin(w*p.swayHz+p.phase)*p.swayAmp*(.4+.6*t),y=p.y-p.rise*ease;
 const tilt=p.tilt+Math.cos(w*p.swayHz+p.phase)*.28,flap=.14+.86*(.5+.5*Math.cos(w*p.flapHz+p.phase)),s=p.size*(.55+.45*Math.min(1,t*4));
 if(p.texture.ready){const img=p.texture.image,h=s*(img.naturalHeight||img.height||1)/(img.naturalWidth||img.width||1);
  ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(flap,1-(1-flap)*.08);ctx.globalAlpha=Math.min(1,t/.06)*(t>.62?Math.pow((1-t)/.38,1.3):1);
  ctx.drawImage(img,-s/2,-h/2,s,h);ctx.restore();}
 if(now>=p.nextSpark&&t<.86&&particles.length+spawn.length<160){p.nextSpark=now+(prefs.lightweight?260:90)+Math.random()*130;
  spawn.push(makeTwinkle(x+(Math.random()-.5)*s*.7,y+s*.3,(Math.random()-.5)*16,10+Math.random()*18,p.spark,(5+Math.random()*5)*prefs.scale,now,550+Math.random()*350));}
}
// ===== 飘落模式（motion:'fall'）：花瓣翻转飘落 + 碎碎小粒子 =====
function spawnFall(pack,x,y,num,now){
 const sc=prefs.scale,n=prefs.lightweight?Math.min(num,4):Math.max(2,Math.round(num)),order=pack.images.map((_,i)=>i).sort(()=>Math.random()-.5);
 for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.6,sp=(.3+Math.random()*.5)*(pack.lift+pack.spread)*.7;
  particles.push({kind:'petal',texture:loadImage(pack.images[order[i%order.length]]),x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,last:now,start:now+i*18,duration:pack.duration*(.8+Math.random()*.45),
   size:pack.size*sc*(.6+Math.random()*.7),rot:Math.random()*6.28,spin:(Math.random()-.5)*3,flipHz:.28+Math.random()*.5,phase:Math.random()*6.28,swayAmp:10+Math.random()*20,swayHz:.3+Math.random()*.45,term:42+Math.random()*32});}
 const k=prefs.lightweight?4:Math.max(6,Math.round(num*1.6));
 for(let i=0;i<k;i++){const a=Math.random()*6.28,sp=(30+Math.random()*120)*sc;
  particles.push({kind:'dust',color:pack.colors[i%pack.colors.length],x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-60,last:now,start:now,duration:900+Math.random()*900,size:(1.4+Math.random()*2.4)*sc,phase:Math.random()*6.28,swayAmp:6+Math.random()*10,swayHz:.8+Math.random(),term:40+Math.random()*50});}
}
// ===== 泡泡模式（motion:'bubble'）：彩色透明泡泡咕嘟咕嘟往上冒，最后啵地破掉 =====
function spawnBubble(pack,x,y,num,now){
 const sc=prefs.scale,n=prefs.lightweight?Math.min(num,3):Math.max(2,Math.round(num*.9)),order=pack.images.map((_,i)=>i).sort(()=>Math.random()-.5);
 for(let i=0;i<n;i++){const big=Math.random()<.3;
  particles.push({kind:'bubble',texture:loadImage(pack.images[order[i%order.length]]),x:x+(Math.random()-.5)*pack.spread*.5,y:y+(Math.random()-.5)*10,
   vx:(Math.random()-.5)*pack.spread*.6,rise:(pack.lift*.35+Math.random()*pack.lift*.5)*(big?.7:1),last:now,start:now+i*70+Math.random()*40,duration:pack.duration*(.75+Math.random()*.5),
   size:pack.size*sc*(big?1.3+Math.random()*.6:.45+Math.random()*.7),phase:Math.random()*6.28,swayAmp:5+Math.random()*12,swayHz:.6+Math.random()*.8,wobHz:2+Math.random()*2,popped:false,dx:0});}
}
function spawnSymbols(pack,x,y,num,now) {
 const count=prefs.lightweight?Math.min(num,3):Math.max(2,Math.round(num*.75));
 for(let i=0;i<count;i++){
  const snow=pack.motion==='snow';
  particles.push({kind:'symbol',texture:loadImage(pack.images[Math.floor(Math.random()*pack.images.length)]),
   x:x+(Math.random()-.5)*18,y:y+(Math.random()-.5)*14,dx:(Math.random()-.5)*pack.spread*1.7,
   dy:snow?45+Math.random()*75:-pack.lift*(.5+Math.random()*.5),
   start:now+i*35,duration:pack.duration*(.9+Math.random()*.15),size:pack.size*prefs.scale*(.65+Math.random()*.55),
   rotation:(Math.random()-.5)*.5,spin:(Math.random()-.5)*(snow?1.8:.55),phase:Math.random()*Math.PI*2,snow});
 }
 for(let i=0;i<Math.max(3,num);i++){
  const a=Math.random()*Math.PI*2,d=18+Math.random()*55;
  const dust=makeTwinkle(x,y,Math.cos(a)*d,Math.sin(a)*d+(pack.motion==='snow'?20:-25),pack.colors[i%pack.colors.length],(3+Math.random()*5)*prefs.scale,now,850+Math.random()*650);
  dust.dot=true;particles.push(dust);
 }
}
function drawSymbol(p,now) {
 if(now<p.start)return;
 const t=Math.min(1,(now-p.start)/p.duration),ease=p.snow?t:1-Math.pow(1-t,1.5);
 ctx.save();ctx.translate(p.x+p.dx*ease+Math.sin(t*5+p.phase)*9*t,p.y+p.dy*ease);
 ctx.rotate(p.rotation+p.spin*t);ctx.globalAlpha=Math.min(1,t/.08)*Math.min(1,(1-t)/.28);
 if(p.texture.ready)ctx.drawImage(p.texture.image,-p.size/2,-p.size/2,p.size,p.size);
 ctx.restore();
}
function physics(p,now){const dt=Math.min(.05,Math.max(0,(now-p.last)/1000));p.last=now;return dt;}
function drawMore(p,now,spawn){
 if(now<p.start){p.last=now;return;}const age=now-p.start,t=Math.min(1,age/p.duration),dt=physics(p,now),w=age/1000*Math.PI*2;
 if(p.kind==='petal'||p.kind==='dust'){
  p.vx*=Math.exp(-2.4*dt);p.vy=Math.min(p.term,p.vy+125*dt);p.vy=p.vy>p.term?p.term:p.vy;p.x+=p.vx*dt;p.y+=p.vy*dt;
  const x=p.x+Math.sin(w*p.swayHz+p.phase)*p.swayAmp*Math.min(1,t*3),y=p.y,alpha=Math.min(1,t/.05)*(t>.7?Math.pow((1-t)/.3,1.2):1);
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;
  if(p.kind==='dust'){ctx.globalAlpha=alpha*(.55+.45*Math.sin(age/90+p.phase));ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(0,0,p.size/2,0,Math.PI*2);ctx.fill();ctx.restore();return;}
  p.rot+=p.spin*dt;ctx.rotate(p.rot+Math.sin(w*p.swayHz+p.phase)*.4);const f=Math.cos(w*p.flipHz+p.phase),fx=Math.sign(f||1)*Math.max(.12,Math.abs(f));ctx.scale(fx,.85+.15*Math.abs(Math.sin(w*p.flipHz*.7+p.phase)));
  if(p.texture.ready){const img=p.texture.image,s=p.size,h=s*(img.naturalHeight||img.height||1)/(img.naturalWidth||img.width||1);ctx.drawImage(img,-s/2,-h/2,s,h);}
  ctx.restore();return;
 }
 if(p.kind==='bubble'){
  const popAt=.88,e=1-Math.pow(1-Math.min(t,popAt)/popAt,1.4),x=p.x+p.vx*e+Math.sin(w*p.swayHz+p.phase)*p.swayAmp,y=p.y-p.rise*e*1.15;
  if(t>=popAt&&!p.popped){p.popped=true;if(particles.length+spawn.length<160)for(let i=0,m=prefs.lightweight?3:6;i<m;i++){const a=i/m*6.28+Math.random()*.5,sp=(40+Math.random()*60)*prefs.scale;spawn.push({kind:'drop',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,last:now,start:now,duration:260+Math.random()*160,size:(1.6+Math.random()*1.8)*prefs.scale,color:BUBBLE_DROPS[i%BUBBLE_DROPS.length]});}}
  const pop=t>=popAt?(t-popAt)/(1-popAt):0,grow=.4+.6*Math.min(1,t*6),wob=Math.sin(w*p.wobHz+p.phase)*.06*(1-pop);
  ctx.save();ctx.translate(x,y);ctx.scale(grow*(1+wob+pop*.35),grow*(1-wob+pop*.35));ctx.globalAlpha=Math.min(1,t/.06)*(1-pop);
  if(p.texture.ready){const s=p.size;ctx.drawImage(p.texture.image,-s/2,-s/2,s,s);}
  ctx.restore();return;
 }
 if(p.kind==='drop'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-3*dt);p.vy=p.vy*Math.exp(-3*dt)+120*dt;ctx.save();ctx.globalAlpha=1-t;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size/2,0,Math.PI*2);ctx.fill();ctx.restore();}
}
const BUBBLE_DROPS=['#a8e6ff','#ffb3e6','#fff1a0','#c3b5ff','#b8ffd9'];
function drawHeart(x,y,size,color){ctx.fillStyle=color;const u=size/7;for(const [a,b,w,h]of [[1,0,2,1],[4,0,2,1],[0,1,7,2],[1,3,5,1],[2,4,3,1],[3,5,1,1]])ctx.fillRect(x+(a-3.5)*u,y+(b-3)*u,w*u,h*u);}
function drawParticle(p,size){
 ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=p.glow||0;
 if(p.shape==='circle'){ctx.beginPath();ctx.arc(0,0,size/2,0,Math.PI*2);ctx.fill();}
 else if(p.shape==='star')drawStar(ctx,size);
 else if(p.shape==='diamond'){ctx.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2-Math.PI/2,r=size/2;i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();}
 else ctx.fillRect(-size/2,-size/2,size,size);
 ctx.shadowBlur=0;
}
function frame(now){raf=0;if(stopped||!ctx)return;viewport();ctx.clearRect(0,0,cw,ch);particles=particles.filter(p=>now-p.start<p.duration);drawTrails(now);const spawned=[];
 for(const p of particles){if(p.kind==='pear-text'){drawTextParticle(ctx,p,now);continue;}if(p.kind==='ornament'){drawOrnament(ctx,p,now);continue;}if(p.kind==='wave'){drawWave(ctx,p,now);continue;}if(p.kind==='ripple'){drawRipple(ctx,p,now);continue;}if(p.kind==='symbol'){drawSymbol(p,now);continue;}if(p.kind==='flutter'||p.kind==='twinkle'){drawFlutter(p,now,spawned);continue;}if(p.kind==='petal'||p.kind==='dust'||p.kind==='bubble'||p.kind==='drop'){drawMore(p,now,spawned);continue;}const t=Math.max(0,(now-p.start)/p.duration),ease=1-Math.pow(1-t,3),x=p.x+p.dx*ease,y=p.y+p.dy*ease+12*t*t;ctx.save();ctx.translate(x,y);ctx.rotate(p.rotation*t);ctx.globalAlpha=Math.min(1,t/.08)*Math.pow(1-t,1.25);const size=p.size*(.6+Math.sin(Math.min(1,t*2)*Math.PI/2)*.4);
 if(p.texture?.ready)ctx.drawImage(p.texture.image,-size/2,-size/2,size,size);else if(p.motif){drawMotif(ctx,p.motif,size,p.color);}else if(p.emoji){ctx.font=`${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.emoji,0,0);}else if(p.kind==='heart')drawHeart(0,0,size,p.color);else{drawParticle(p,size);}ctx.restore();}
 if(spawned.length)particles.push(...spawned.slice(0,Math.max(0,160-particles.length)));
 if(particles.length||trails.length)raf=host.requestAnimationFrame(frame);else{ctx.clearRect(0,0,cw,ch);try{layer.hidePopover();}catch{}}}
function burst(x,y,target,force=false){
 if(stopped||!ctx||(!prefs.enabled&&!force))return;
 const now=host.performance.now();if(!force&&now-lastBurst<150)return;lastBurst=now;
 const rect=raise(target),p=selected(),num=Math.min(prefs.amount,prefs.lightweight?4:14);
 if(p.motion==='pixel-text'){particles.push(...spawnText(p,x-rect.left,y-rect.top,num,now,prefs.scale,prefs.lightweight,cw,ch));particles=particles.slice(-160);if(!raf)raf=host.requestAnimationFrame(frame);updateStatus();return;}
 if(motifFor(p.motion)){particles.push(...spawnOrnaments(p,x-rect.left,y-rect.top,num,now,prefs.scale,prefs.lightweight));particles=particles.slice(-160);if(!raf)raf=host.requestAnimationFrame(frame);updateStatus();return;}
 if(p.motion==='ripple'||p.motion==='wave'){particles.push(...(p.motion==='wave'?spawnWaves:spawnRipples)(p,x-rect.left,y-rect.top,num,now,prefs.scale,prefs.lightweight));particles=particles.slice(-160);if(!raf)raf=host.requestAnimationFrame(frame);updateStatus();return;}
 if(p.motion&&p.images.length){(p.motion==='fall'?spawnFall:p.motion==='bubble'?spawnBubble:p.motion==='snow'||p.motion==='music'?spawnSymbols:spawnFlutter)(p,x-rect.left,y-rect.top,num,now);particles=particles.slice(-160);if(!raf)raf=host.requestAnimationFrame(frame);updateStatus();return;}
 for(let i=0;i<num;i++){const angle=Math.random()*Math.PI*2,dist=p.spread*(.35+Math.random()*.65),hasImage=p.images.length&&i<Math.min(3,Math.ceil(num*.55)),tex=hasImage?loadImage(p.images[i===0||p.images.length===1?0:1+Math.floor(Math.random()*(p.images.length-1))]):null;
 const motif=p.motifs?.length?p.motifs[i%p.motifs.length]:null;
 const emoji=p.emojis?.length&&i<Math.min(3,Math.ceil(num*.55))?p.emojis[Math.floor(Math.random()*p.emojis.length)]:null;
 particles.push({emoji,motif,shape:p.shape,glow:prefs.lightweight?0:p.glow,x:x-rect.left,y:y-rect.top,dx:Math.cos(angle)*dist,dy:Math.sin(angle)*dist-p.lift,start:now,duration:p.duration*(.85+Math.random()*.3),size:(tex||emoji||motif?p.size:p.images.length||p.emojis?.length?4+Math.random()*3:p.size)*prefs.scale,color:p.colors[i%p.colors.length],texture:tex,kind:tex?'heart':'dot',rotation:(Math.random()-.5)*1.2});}
 if(p.sparkles)for(let i=0,n=prefs.lightweight?3:7;i<n;i++){const a=i*2.4;particles.push(makeTwinkle(x-rect.left,y-rect.top,Math.cos(a)*65*prefs.scale,(Math.sin(a)*50-30)*prefs.scale,p.colors[i%p.colors.length],(2+i%3)*prefs.scale,now,850+i*45));}
 particles=particles.slice(-160);if(!raf)raf=host.requestAnimationFrame(frame);updateStatus();
}
function drawTrails(now){
 trails=trails.filter(p=>now-p.time<p.duration);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 for(const p of trails){if(p.motif==='pear-emoji'){drawPearTrail(ctx,p,now);continue;}if(p.motif){drawOrnamentTrail(ctx,p,now);continue;}const t=(now-p.time)/p.duration,alpha=Math.pow(1-t,1.7);ctx.globalAlpha=alpha;
  for(let i=0;i<p.amount;i++){const offset=(i-(p.amount-1)/2)*3*p.size,dx=p.x-p.px,dy=p.y-p.py,len=Math.hypot(dx,dy)||1,nx=-dy/len*offset,ny=dx/len*offset,color=p.colors[i%p.colors.length];ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=p.glow;ctx.lineWidth=(1.8-i*.16)*p.size*(1-t*.55);ctx.beginPath();ctx.moveTo(p.px+nx,p.py+ny);ctx.quadraticCurveTo((p.px+p.x)/2+nx,(p.py+p.y)/2+ny,p.x+nx,p.y+ny);ctx.stroke();}
 }ctx.restore();
}
function trailMove(x,y,target,state){
 if(stopped||!ctx||!prefs.trailEnabled){state.last=null;return;}
 const now=host.performance.now(),prev=state.last;
 if(prev&&now-prev.time<16)return;
 const rect=!trails.length?raise(target):layer.getBoundingClientRect(),point={x:x-rect.left,y:y-rect.top,time:now,session:trailSession};state.last=point;
 if(!prev||prev.session!==trailSession||now-prev.time>140||Math.hypot(point.x-prev.x,point.y-prev.y)>160)return;
 if(Math.hypot(point.x-prev.x,point.y-prev.y)<2){state.last=prev;return;}
 const p=selectedTrail();if(p.motif&&state.emitted&&state.emitted.session===trailSession&&now-state.emitted.time<(p.motif==='pear-emoji'?85:p.motif==='wave'?85:35))return;state.emitted=point;trails.push({...point,motif:p.motif,phase:Math.random()*Math.PI*2,px:prev.x,py:prev.y,duration:prefs.trailDuration,amount:prefs.lightweight?1:Math.round(prefs.trailAmount),size:prefs.trailSize,colors:p.colors,glow:prefs.lightweight?0:p.glow});trails=trails.slice(-80);if(!raf)raf=host.requestAnimationFrame(frame);
}
function clearTrail(){trails=[];trailSession++;}
function inputHit(x,y,target,kind){totalHits++;lastInput=kind;lastActive=Date.now();if(!target?.closest?.('[data-lpx-preview]'))burst(x,y,target);}
function bindDocument(d,map=(x,y,t)=>[x,y,t]){if(boundDocs.has(d))return;boundDocs.add(d);
 const trailState={last:null},trailTouch={id:null,last:null};
 const moveTrail=(x,y,t,state)=>{const [mx,my,mt]=map(x,y,t);trailMove(mx,my,mt,state);};
 listen(d,'pointermove',e=>{if(e.pointerType!=='touch'&&e.isPrimary!==false)moveTrail(e.clientX,e.clientY,e.target,trailState);},{capture:true,passive:true});
 listen(d,'pointerout',e=>{if(!e.relatedTarget)trailState.last=null;},{passive:true});
 listen(d,'touchstart',e=>{if(trailTouch.id!==null)return;const t=e.changedTouches?.[0];if(t){trailTouch.id=t.identifier;trailTouch.last=null;moveTrail(t.clientX,t.clientY,e.target,trailTouch);}},{capture:true,passive:true});
 listen(d,'touchmove',e=>{const t=[...e.touches].find(t=>t.identifier===trailTouch.id);if(t)moveTrail(t.clientX,t.clientY,e.target,trailTouch);},{capture:true,passive:true});
 for(const name of ['touchend','touchcancel'])listen(d,name,e=>{if([...e.changedTouches].some(t=>t.identifier===trailTouch.id)){trailTouch.id=null;trailTouch.last=null;}},{passive:true});
 listen(d,'pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;lastPointer=Date.now();const [x,y,t]=map(e.clientX,e.clientY,e.target);inputHit(x,y,t,'触点 / '+(e.pointerType||'pointer'));},{capture:true,passive:true});
 listen(d,'touchstart',e=>{lastTouch=Date.now();if(Date.now()-lastPointer<450)return;const t=e.changedTouches?.[0];if(t){const [x,y,target]=map(t.clientX,t.clientY,e.target);inputHit(x,y,target,'触屏兼容');}},{capture:true,passive:true});
 listen(d,'mousedown',e=>{if(e.button!==0||Date.now()-Math.max(lastPointer,lastTouch)<450)return;const [x,y,t]=map(e.clientX,e.clientY,e.target);inputHit(x,y,t,'鼠标兼容');},{capture:true,passive:true});
 listen(d,'keydown',()=>{lastActive=Date.now();},{passive:true});listen(d,'scroll',()=>{lastActive=Date.now();},{capture:true,passive:true});
}
bindDocument(doc);
function attachFrame(frame,parentMap=(x,y,t)=>[x,y,t]){if(seenFrames.has(frame))return;seenFrames.add(frame);
 const bind=()=>{try{const d=frame.contentDocument;if(!d)return;const map=(x,y)=>{const r=frame.getBoundingClientRect();return parentMap(r.left+x*r.width/(frame.clientWidth||r.width),r.top+y*r.height/(frame.clientHeight||r.height),frame);};bindDocument(d,map);d.querySelectorAll('iframe').forEach(f=>attachFrame(f,map));}catch{}};
 listen(frame,'load',bind);bind();
}
async function portablePack(pack) {
 const images=await Promise.all(pack.images.map(async (src,i)=>{
  if(!src.startsWith(new URL('./assets/',import.meta.url).href))return src;
  const img=new host.Image();img.src=src;await img.decode();
  const c=doc.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
  const cx=c.getContext('2d');cx.filter=`hue-rotate(${pack.hues?.[i]||0}deg)`;cx.drawImage(img,0,0);return c.toDataURL('image/png');
 }));return {...pack,images,...(pack.hues?{hues:pack.hues.map((h,i)=>pack.images[i].startsWith(new URL('./assets/',import.meta.url).href)?0:h)}:{})};
}
function download(name,value){const a=el('a');const url=host.URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));a.href=url;a.download=name;doc.body.append(a);a.click();a.remove();later(()=>host.URL.revokeObjectURL(url),1500);}
function statusText(){const imgs=selected().images.map((src,i)=>loadImage(src,selected().hues?.[i]||0)),ready=imgs.filter(x=>x.ready).length,bad=imgs.filter(x=>x.error).length;return `已捕获 ${totalHits} 次点击 · ${lastInput}\n素材 ${ready}/${imgs.length} 已就绪${bad?'，'+bad+' 张加载失败，请重新选择或导入素材':''} · ${ctx?'画布就绪':'画布不可用'}${prefs.enabled?'':' · 特效已关闭'}`;}
function updateStatus(){const n=doc.querySelector('#lpx-status');if(n)n.textContent=statusText();}
function motifPreview(motif,colors){const c=el('canvas');c.width=280;c.height=160;c.style.cssText='width:100%;height:100%;display:block';const cx=c.getContext('2d');for(let i=0;i<5;i++){cx.save();cx.translate(34+i*51,82+Math.sin(i*1.7)*25);if(motif==='pear-emoji'){drawPearEmoji(cx,30);cx.fillStyle=colors[i%colors.length];cx.fillRect(-18,12,3,3);cx.fillRect(14,-16,2,2);}else if(motif==='wave'){drawWave(cx,{x:0,y:0,start:0,duration:1000,radius:27,scale:.65,colors,rings:3},550);}else drawMotif(cx,motif,motif==='bubble'?42:25,colors[i%colors.length],i);cx.restore();}return c;}
function thumbnail(pack,interactive=false){const n=el(interactive?'button':'div','lpx-thumb');if(interactive){n.type='button';n.setAttribute('aria-label','预览并使用 '+pack.name);n.dataset.lpxPreview='true';}
 if(pack.motion==='pixel-text'){n.classList.add('lpx-contrast');const c=el('canvas');c.width=280;c.height=160;c.style.cssText='width:100%;height:100%;display:block';const cx=c.getContext('2d');for(const p of spawnText(pack,140,108,6,0,1,false,280,160))drawTextParticle(cx,p,600);n.append(c);return n;}
 if(pack.motifs?.length){n.classList.add('lpx-contrast');n.append(motifPreview(pack.motifs[0],pack.colors));return n;}
 if(motifFor(pack.motion)){n.classList.add('lpx-contrast');n.append(motifPreview(motifFor(pack.motion),pack.colors));return n;}
 if(pack.motion==='ripple'||pack.motion==='wave'){n.classList.add('lpx-ripple-thumb');const c=el('canvas');c.width=280;c.height=160;const cx=c.getContext('2d');(pack.motion==='ripple'?drawRipple:drawWave)(cx,{x:140,y:90,start:0,duration:2400,radius:116,scale:1,colors:pack.colors,rings:5,drops:4},800);n.append(c);return n;}
 if(pack.motion){n.classList.add('lpx-artwork','lpx-contrast');}
 const positions=[[22,45,-12],[52,28,9],[75,55,16]];
 if(pack.emojis?.length)positions.forEach(([x,y,rot],i)=>{const e=el('span',null,pack.emojis[i%pack.emojis.length]);e.style.cssText=`position:absolute;left:${x}%;top:${y}%;font-size:26px;transform:translate(-50%,-50%) rotate(${rot}deg)`;n.append(e);});
 if(pack.images.length)positions.forEach(([x,y,rot],i)=>{const img=el('img');img.alt='';img.src=pack.images[i%pack.images.length];img.loading='lazy';img.style.cssText=`left:${x}%;top:${y}%;transform:translate(-50%,-50%) rotate(${rot}deg)`;if(pack.hues?.[i])img.style.filter=`hue-rotate(${pack.hues[i]}deg)`;if(pack.motion)styleImportant(img,{'image-rendering':'auto',width:'36px',height:'36px'});n.append(img);});
 for(let i=0;i<7;i++){const dot=el('i','lpx-thumb-dot');dot.style.cssText=`left:${12+(i*19)%78}%;top:${20+(i*23)%57}%;background:${pack.colors[i%pack.colors.length]};width:${pack.images.length?4:7}px;height:${pack.images.length?4:7}px;`;if(pack.shape==='circle')dot.style.borderRadius='50%';if(pack.shape==='diamond')dot.style.transform='rotate(45deg)';if(pack.shape==='star')dot.style.clipPath='polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%)';if(pack.glow)dot.style.boxShadow=`0 0 7px ${pack.colors[i%pack.colors.length]}`;n.append(dot);}return n;}
function closeManager(){manager?.close?.();manager?.remove();manager=null;managerUI=null;}
function renamePack(id,name){name=String(name).trim();if(!name||name.length>60)throw Error('名称需要 1～60 个字。');const item=custom.find(x=>x.id===id);if(item){const next=custom.map(p=>p.id===id?{...p,name}:p);if(!write('lili-fx-packs-v1',JSON.stringify(next)))throw Error('保存失败，浏览器存储空间不足。');custom=next;}else{builtinNames[id]=name;write('lili-fx-names-v1',JSON.stringify(builtinNames));}}
function deletePack(id){const p=allPacks().find(x=>x.id===id);if(!p)return;lastDeleted={pack:p,builtin:!custom.some(x=>x.id===id)&&packsDefault.some(x=>x.id===id)};if(lastDeleted.builtin){hiddenBuiltins=[...new Set([...hiddenBuiltins,id])];write('lili-fx-hidden-v1',JSON.stringify(hiddenBuiltins));}else{custom=custom.filter(x=>x.id!==id);savePacks();}if(prefs.selected===id)prefs.selected=allPacks()[0]?.id||'';if(!allPacks().length)prefs.enabled=false;persist();}
function undoDelete(){if(!lastDeleted)return;if(lastDeleted.builtin){hiddenBuiltins=hiddenBuiltins.filter(x=>x!==lastDeleted.pack.id);write('lili-fx-hidden-v1',JSON.stringify(hiddenBuiltins));}else{if(!custom.some(p=>p.id===lastDeleted.pack.id))custom.push(lastDeleted.pack);savePacks();}prefs.selected=lastDeleted.pack.id;prefs.enabled=true;persist();lastDeleted=null;}
function openManager(page='gallery',container=null){
 if(stopped)return null;
 if(container&&(container.ownerDocument!==doc||typeof container.append!=='function'))throw Error('管理器容器必须位于酒馆页面中。');
 if(typeof page!=='string')page='gallery';if(page==='upload')page='settings';if(manager?.isConnected){if(!container||manager.parentElement===container){managerUI?.show(page);manager.focus();return manager;}closeManager();}
 const d=el(container?'section':'dialog','popup lpx-dialog lpx-manager');manager=d;d.setAttribute('aria-label','梨梨 · 点击与拖尾特效管理器');let currentPage=page,query='',editId='',groupFilter=groups.has(prefs.galleryGroup)?prefs.galleryGroup:'all';
 const header=el('div','lpx-header');header.append(el('strong',null,'点击特效管理器'));if(!container){const close=button('×',closeManager,'lpx-btn lpx-close');close.setAttribute('aria-label','关闭管理器');header.append(close);}d.append(header);
 const tabs=el('div','lpx-tabs');tabs.setAttribute('role','tablist');const galleryTab=button('01 · 点击',()=>show('gallery'),'lpx-tab'),trailTab=button('02 · 拖尾',()=>show('trails'),'lpx-tab'),uploadTab=button('03 · 设置',()=>show('settings'),'lpx-tab');
 [galleryTab,trailTab,uploadTab].forEach(t=>t.setAttribute('role','tab'));tabs.append(galleryTab,trailTab,uploadTab);d.append(tabs);
 const body=el('section','lpx-page');body.setAttribute('role','tabpanel');d.append(body);const notice=el('div','lpx-notice');notice.setAttribute('role','status');d.append(notice);
 function tell(text){notice.textContent=text;}
 function show(which){if(which==='upload')which='settings';currentPage=which;galleryTab.setAttribute('aria-selected',String(which==='gallery'));trailTab.setAttribute('aria-selected',String(which==='trails'));uploadTab.setAttribute('aria-selected',String(which==='settings'));body.replaceChildren();if(which==='settings')renderUpload();else if(which==='trails')renderTrails();else renderGallery();}
 managerUI={show};
 function renderGallery(){
  const toolbar=el('div','lpx-gallery-tools'),search=el('input','lpx-input');search.type='search';search.placeholder='搜索当前分组…';search.setAttribute('aria-label','搜索特效');search.value=query;
  toolbar.append(search,button('＋ 添加',()=>show('upload')));body.append(toolbar);
  const groupRow=el('div','lpx-group-row'),filter=el('select','lpx-input');filter.setAttribute('aria-label','选择特效分组');
  const manage=el('details','lpx-group-editor');manage.append(el('summary',null,'管理分组'));
  groupRow.append(filter);body.append(groupRow,manage);
  const editor=el('div','lpx-group-form'),groupName=el('input','lpx-input');groupName.maxLength=20;groupName.placeholder='输入新组名';groupName.setAttribute('aria-label','分组名称');
  const groupActions=el('div','lpx-actions');
  const create=button('新建分组',()=>{try{groupFilter=groups.create(groupName.value);groupName.value='';saveFilter();refresh();tell('分组建好了，用卡片下方的菜单把特效移进来。');}catch(e){tell(e.message);}});
  const rename=button('重命名当前组',()=>{try{groups.rename(groupFilter,groupName.value);groupName.value='';refresh();tell('组名改好啦。');}catch(e){tell(e.message);}});
  const remove=button('删除当前组',()=>{try{groups.remove(groupFilter,allPacks());groupFilter='ungrouped';saveFilter();refresh();tell('分组已删除，里面的特效保留在未分组。');}catch(e){tell(e.message);}});
  groupActions.append(create,rename,remove);editor.append(groupName,groupActions,el('p','lpx-muted','选好分组后可改名或删除；删除分组不会删除特效。'));manage.append(editor);
  const bar=el('div','lpx-gallery-switch'),on=el('label','lpx-row'),toggle=el('input');toggle.type='checkbox';toggle.checked=!!prefs.enabled;on.append(toggle,doc.createTextNode('点击特效'));listen(toggle,'change',()=>{prefs.enabled=toggle.checked;persist();updateStatus();});bar.append(on,el('span','lpx-count'));body.append(bar);
  const grid=el('div','lpx-gallery');body.append(grid);
  const saveFilter=()=>{prefs.galleryGroup=groupFilter;persist();};
  const refresh=()=>{
   if(groupFilter!=='all'&&!groups.has(groupFilter))groupFilter='all';
   const all=allPacks();filter.replaceChildren();const addOption=(id,label)=>{const o=el('option',null,label);o.value=id;filter.append(o);};
   addOption('all','全部特效 · '+all.length);for(const g of groups.list())addOption(g.id,g.name+' · '+all.filter(p=>groups.of(p)===g.id).length);filter.value=groupFilter;
   rename.disabled=remove.disabled=groupFilter==='all'||groupFilter==='ungrouped';
   grid.replaceChildren();const packs=all.filter(p=>(groupFilter==='all'||groups.of(p)===groupFilter)&&p.name.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
   bar.querySelector('.lpx-count').textContent=packs.length+' 款 / 共 '+all.length+' 款';
   if(!packs.length){grid.append(el('p','lpx-empty',query?'没有找到这个名字，换个词试试。':'这个分组还没有特效。到全部特效，用卡片下方的菜单移入吧。'));}
   for(const p of packs){
    const card=el('article','lpx-card'+(selected().id===p.id?' is-selected':''));card.dataset.effectId=p.id;
    const thumb=thumbnail(p,true);listen(thumb,'click',()=>{prefs.selected=p.id;prefs.enabled=true;toggle.checked=true;persist();preload();const r=thumb.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,thumb,true);refresh();tell('正在使用：'+p.name);});card.append(thumb);
    const title=el('div','lpx-card-title',p.name);title.title=p.name;card.append(title);
    const membership=el('select','lpx-input lpx-group-select');membership.setAttribute('aria-label','移动 '+p.name+' 到分组');
    for(const g of groups.list()){const o=el('option',null,g.name);o.value=g.id;membership.append(o);}membership.value=groups.of(p);
    listen(membership,'change',()=>{try{groups.move(p,membership.value);refresh();tell('已移动到：'+groups.list().find(g=>g.id===groups.of(p)).name);}catch(e){membership.value=groups.of(p);tell(e.message);}});card.append(membership);
    if(editId===p.id){const input=el('input','lpx-input lpx-rename');input.value=p.name;input.maxLength=60;input.setAttribute('aria-label','新特效名称');card.append(input);const save=()=>{try{renamePack(p.id,input.value);editId='';refresh();tell('名字改好啦。');}catch(e){tell(e.message);}};const row=el('div','lpx-card-actions');row.append(button('保存',save),button('取消',()=>{editId='';refresh();}));card.append(row);listen(input,'keydown',e=>{if(e.key==='Enter')save();});}
    else{const row=el('div','lpx-card-actions');row.append(button('改名',()=>{editId=p.id;refresh();grid.querySelector('.lpx-rename')?.focus();}),button('删除',()=>{deletePack(p.id);refresh();tell('已删除，可点下方撤销。');undo.hidden=false;}));card.append(row);}
    grid.append(card);
   }
  };
  const undo=button('撤销上次删除',()=>{undoDelete();refresh();toggle.checked=!!prefs.enabled;undo.hidden=true;tell('已恢复。');});undo.hidden=!lastDeleted;body.append(undo);
  listen(search,'input',()=>{query=search.value;refresh();});listen(filter,'change',()=>{groupFilter=filter.value;saveFilter();refresh();});refresh();
 }

 function slider(parent,label,key,min,max,step,format=v=>String(v)){
 const row=el('label','lpx-row',label+' '),input=el('input'),value=el('span',null,format(prefs[key]));input.type='range';input.min=min;input.max=max;input.step=step;input.value=prefs[key];input.setAttribute('aria-label',label);listen(input,'input',()=>{prefs[key]=Number(input.value);value.textContent=format(prefs[key]);persist();});row.append(input,value);parent.append(row);
 }
 function renderTrails(){
 const row=el('label','lpx-row'),toggle=el('input');toggle.type='checkbox';toggle.checked=!!prefs.trailEnabled;row.append(toggle,doc.createTextNode('滑动拖尾'));listen(toggle,'change',()=>{prefs.trailEnabled=toggle.checked;clearTrail();persist();});body.append(row,el('p','lpx-muted','选一种拖尾，在下方试滑；手机滑动页面时也会留下拖尾。'));
 const grid=el('div','lpx-gallery');body.append(grid);
 for(const p of trailPacks){const card=el('article','lpx-card'+(selectedTrail().id===p.id?' is-selected':'')),thumb=button('',()=>{prefs.trailSelected=p.id;prefs.trailEnabled=true;clearTrail();persist();show('trails');tell('正在使用：'+p.name);},'lpx-thumb');thumb.setAttribute('aria-label','使用拖尾 '+p.name);thumb.dataset.lpxPreview='true';card.dataset.trailId=p.id;if(p.motif){thumb.classList.add('lpx-contrast');thumb.append(motifPreview(p.motif,p.colors));}else for(let i=0;i<3;i++){const line=el('i');line.style.cssText=`position:absolute;left:15%;top:${35+i*13}%;width:70%;height:2px;background:${p.colors[i]};transform:rotate(-12deg);border-radius:99px;box-shadow:0 0 ${p.glow}px ${p.colors[i]}`;thumb.append(line);}card.append(thumb,el('div','lpx-card-title',p.name));grid.append(card);}
 const pad=el('div','lpx-trail-pad','在这里滑一滑 ✧');pad.dataset.lpxPreview='true';body.append(pad,button('调整拖尾数量与大小',()=>show('settings')));
 }
 function renderUpload(){
  const settings=el('div','lpx-settings');settings.append(el('strong',null,'点击粒子'));
  const amountRow=el('label','lpx-row','每次粒子 '),amount=el('input'),amountValue=el('span',null,String(prefs.amount));amount.type='range';amount.min='2';amount.max='14';amount.step='1';amount.value=prefs.amount;amount.setAttribute('aria-label','每次粒子数量');listen(amount,'input',()=>{prefs.amount=Number(amount.value);amountValue.textContent=amount.value;persist();});amountRow.append(amount,amountValue);settings.append(amountRow);
  const sizeRow=el('label','lpx-row','图案大小 '),size=el('input'),sizeValue=el('span',null,prefs.scale.toFixed(1)+'×');size.type='range';size.min='.5';size.max='2';size.step='.1';size.value=prefs.scale;size.setAttribute('aria-label','粒子大小');listen(size,'input',()=>{prefs.scale=Number(size.value);sizeValue.textContent=prefs.scale.toFixed(1)+'×';persist();});sizeRow.append(size,sizeValue);settings.append(sizeRow);
  const test=button('测试当前特效',()=>{const r=test.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,test,true);});test.dataset.lpxPreview='true';settings.append(test,button('导出当前特效',async()=>{try{if(!selected().id){tell('先添加一组特效。');return;}const pack=await portablePack(selected());download('梨梨-点击特效-'+pack.id+'.json',{format:'lili-click-effects',version:1,packs:[pack]});}catch(e){tell('导出失败：'+e.message);}}));
  const status=el('div','lpx-status');status.id='lpx-status';settings.append(status);body.append(settings);updateStatus();
  const ts=el('div','lpx-settings');ts.append(el('strong',null,'滑动拖尾'));
  slider(ts,'拖尾数量','trailAmount',1,6,1);slider(ts,'拖尾大小','trailSize',.5,2.5,.1,v=>v.toFixed(1)+'×');slider(ts,'拖尾时长','trailDuration',250,1200,50,v=>v+' ms');body.append(ts);
  const low=el('label','lpx-row'),check=el('input');check.type='checkbox';check.checked=!!prefs.lightweight;low.append(check,doc.createTextNode('省电模式（减少粒子与发光）'));listen(check,'change',()=>{prefs.lightweight=check.checked;clearTrail();persist();});body.append(low);
  body.append(button('一键恢复默认设置',()=>{prefs={...DEFAULT_PREFS};clearTrail();particles=[];persist();preload();show('settings');tell('数量、大小、拖尾和开关已恢复默认；上传的特效仍保留。');}));
  body.append(el('p','lpx-muted','恢复默认设置不会删除上传的特效。'),el('strong',null,'上传图片 / 导入特效'));

  body.append(el('p','lpx-muted','上传自己的小图做特效，或导入已有的 JSON 特效包。'));
  const file=el('input');file.type='file';file.accept='.json,application/json,image/png,image/jpeg,image/webp,image/gif';file.multiple=true;file.hidden=true;
  const zone=button('＋ 选择图片或特效包',()=>file.click(),'lpx-upload-zone');zone.append(el('small',null,'PNG · JPG · WebP · GIF · JSON'));body.append(zone,file);
  listen(file,'change',async()=>{try{const files=[...file.files||[]];if(!files.length)return;if(files.reduce((n,f)=>n+f.size,0)>8*1024*1024)throw Error('一次上传总大小不能超过 8 MB。');
   const jsonFiles=files.filter(f=>f.name.toLowerCase().endsWith('.json'));
   if(jsonFiles.length){if(jsonFiles.length!==files.length)throw Error('图片和 JSON 请分开上传。');let total=0;for(const f of jsonFiles)total+=importPacks(JSON.parse(await f.text()));if(stopped)return;prefs.enabled=true;persist();query='';groupFilter='all';show('gallery');tell('已导入 '+total+' 组特效。');return;}
   if(files.length>12)throw Error('一组最多 12 张图片。');if(files.some(f=>!/^image\/(png|jpeg|webp|gif)$/.test(f.type)))throw Error('请选择 PNG / JPG / WebP / GIF 图片。');
   const images=await Promise.all(files.map(f=>new Promise((resolve,reject)=>{const r=new host.FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(Error('图片读取失败'));r.readAsDataURL(f);})));if(stopped)return;
   uploadDraft={id:'custom-'+randSeed().toString(36),name:files[0].name.replace(/\.[^.]+$/,'').slice(0,60)||'我的新特效',images,colors:['#ffb7bf','#fff5ef','#ffdae0'],count:6,size:24,duration:1000,spread:65,lift:45};validatePack(uploadDraft);show('upload');tell('图片准备好了，取个名字就能加入图库。');
  }catch(e){tell('上传失败：'+e.message);}finally{file.value='';}});
  if(uploadDraft){body.append(thumbnail(uploadDraft));const label=el('label','lpx-upload-label','特效名字'),name=el('input','lpx-input');name.value=uploadDraft.name;name.maxLength=60;name.setAttribute('aria-label','上传特效名称');label.append(name);body.append(label);
   const row=el('div','lpx-row','图案大小 '),size=el('input');size.type='range';size.min='8';size.max='48';size.step='1';size.value=uploadDraft.size;size.setAttribute('aria-label','上传图案大小');listen(size,'input',()=>{uploadDraft.size=Number(size.value);});row.append(size);body.append(row);
   const actions=el('div','lpx-actions');actions.append(button('加入特效图库',()=>{try{uploadDraft.name=name.value;importPacks({format:'lili-click-effects',version:1,packs:[uploadDraft]});prefs.enabled=true;persist();uploadDraft=null;query='';groupFilter='all';show('gallery');tell('新特效已经加入图库，可以点预览图试试。');}catch(e){tell(e.message);}}),button('清空待上传',()=>{uploadDraft=null;show('upload');}));body.append(actions);
  }else body.append(el('div','lpx-upload-help','每组最多 12 张图；一次总大小不超过 8 MB。上传后可在图库里改名、删除和导出。'));
  const restore=button('恢复内置特效',()=>{hiddenBuiltins=[];builtinNames={};write('lili-fx-hidden-v1','[]');write('lili-fx-names-v1','{}');show('gallery');tell(packsDefault.length+' 组内置特效已恢复。');});body.append(restore);
 }
 listen(d,'cancel',e=>{e.preventDefault();closeManager();});if(container){d.classList.add('lpx-embedded');container.append(d);}else{doc.body.append(d);d.showModal();}show(currentPage);return d;
}
function importPacks(data){if(data?.format!=='lili-click-effects'||data.version!==1||!Array.isArray(data.packs)||!data.packs.length||data.packs.length>20)throw Error('这不是 v1 格式的梨梨点击特效包。');
 const list=data.packs.map(validatePack);const next=[...custom];
 for(const p of list){if(packsDefault.some(x=>x.id===p.id))p.id='custom-'+p.id+'-'+randSeed().toString(36);const i=next.findIndex(x=>x.id===p.id);if(i>=0)next[i]=p;else next.push(p);}if(next.length>20)throw Error('最多保存 20 组自定义特效。');if(!write('lili-fx-packs-v1',JSON.stringify(next)))throw Error('本浏览器存储空间不足，未改变原有特效。');custom=next;prefs.selected=list[0].id;persist();preload();return list.length;}
// Keep the live nodes (and their listeners) when ST rebuilds or moves its menus.
let panelEntry=null,wandEntry=null,scanFrame=0;
function entryVisible(n){return !n.closest('[hidden],[aria-hidden="true"]')&&n.getClientRects().length>0&&host.getComputedStyle(n).visibility!=='hidden';}
function entryTarget(selector){
 const nodes=[...doc.querySelectorAll(selector)];
 return nodes.find(entryVisible)||nodes[0]||null;
}
function mountEntry(node,target,id){
 if(!target)return;
 // A theme can clone an old entry without copying its event listeners.
 for(const other of doc.querySelectorAll('#'+id))if(other!==node)other.remove();
 if(node.parentElement!==target)target.append(node);
 if(node.hidden)node.hidden=false;
 if(node.getAttribute('aria-hidden')==='true')node.removeAttribute('aria-hidden');
 if(node.style.display==='none')node.style.removeProperty('display');
}
function installPanel(){
 if(stopped)return;
 if(!sheet.isConnected)(doc.head||doc.documentElement).append(sheet);
 if(!panelEntry){
  panelEntry=el('div','extension_container lpx-panel');panelEntry.id='lpx-panel';
  const drawer=el('div','inline-drawer');
  // Native header classes let ST themes supply their borders and decorations.
  // This header opens a modal, so do not also trigger ST's delegated drawer toggle.
  const open=button('',e=>{e.stopPropagation();openManager();},'inline-drawer-toggle inline-drawer-header lpx-panel-button');
  open.setAttribute('aria-haspopup','dialog');
  open.append(el('b',null,'点击特效管理器'),el('div','inline-drawer-icon fa-solid fa-circle-chevron-down down'));
  drawer.append(open);panelEntry.append(drawer);
 }
 if(!wandEntry){
  wandEntry=el('div','list-group-item flex-container flexGap5 interactable');wandEntry.id='lpx-wand-entry';
  wandEntry.tabIndex=0;wandEntry.setAttribute('role','button');
  wandEntry.append(el('i','fa-solid fa-wand-magic-sparkles'),el('span',null,'点击特效管理器'));
  listen(wandEntry,'click',()=>openManager());
  listen(wandEntry,'keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();wandEntry.click();}});
 }
 // Explicit fallback order; comma selectors alone follow DOM order.
 const settings=[...doc.querySelectorAll('#extensions_settings2'),...doc.querySelectorAll('#extensions_settings')];
 mountEntry(panelEntry,settings.find(entryVisible)||settings[0],'lpx-panel');
 mountEntry(wandEntry,entryTarget('#extensionsMenu'),'lpx-wand-entry');
}
function scan(){scanFrame=0;scanQueued=false;if(stopped)return;installPanel();doc.querySelectorAll('iframe').forEach(f=>attachFrame(f));}
function queue(){if(!scanQueued&&!stopped){scanQueued=true;scanFrame=host.requestAnimationFrame(scan);}}
const entrySelector='#extensions_settings2,#extensions_settings,#extensionsMenu,#lpx-panel,#lpx-wand-entry,#lpx-ui-style';
const touchesEntries=n=>n.nodeType===1&&(n.matches(entrySelector+',iframe')||n.querySelector?.(entrySelector+',iframe'));
const observer=new host.MutationObserver(changes=>{
 if(changes.some(c=>c.type==='attributes'
  ? c.target.matches(entrySelector)||c.target.contains(panelEntry)||c.target.contains(wandEntry)
  : [...c.addedNodes,...c.removedNodes].some(touchesEntries)))queue();
});
// The body itself can be replaced; keep observing its stable parent.
observer.observe(doc.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['id','class','style','hidden','aria-hidden']});
const interval=host.setInterval(()=>{installPanel();updateStatus();},1000);
const recoverEntries=()=>{if(!stopped){installPanel();queue();}};
listen(host,'pageshow',recoverEntries);
listen(host,'focus',recoverEntries);
listen(doc,'visibilitychange',()=>{if(!doc.hidden)recoverEntries();else{particles=[];clearTrail();if(raf)host.cancelAnimationFrame(raf);raf=0;ctx?.clearRect(0,0,cw,ch);try{layer.hidePopover();}catch{}}});
// Repair synchronously before the wand/settings drawer is opened.
listen(doc,'pointerdown',e=>{if(e.target?.closest?.('#extensionsMenuButton,#extensions-settings-button,#extensionsMenu,#extensions_settings,#extensions_settings2'))recoverEntries();},{capture:true,passive:true});
listen(doc,'click',e=>{if(e.target?.closest?.('#extensionsMenuButton,#extensions-settings-button'))recoverEntries();},{capture:true,passive:true});
function destroy(){if(stopped)return;stopped=true;clearWaterCache();clearTrail();particles=[];abort.abort();observer.disconnect();host.clearInterval(interval);timers.forEach(id=>host.clearTimeout(id));if(raf)host.cancelAnimationFrame(raf);if(scanFrame)host.cancelAnimationFrame(scanFrame);closeManager();layer.remove();sheet.remove();panelEntry?.remove();wandEntry?.remove();disposers.forEach(fn=>{try{fn();}catch{}});if(host[KEY]?.destroy===destroy)delete host[KEY];if(host.__liSparkling?.destroy===destroy){delete host.__liSparkling;host.dispatchEvent(new host.Event('li-sparkling:change'));}}
host[KEY]={owner:'li-sparkling',apiVersion:1,version:'2.4.0',isAvailable:()=>!stopped,mount:container=>openManager('gallery',container),unmount:container=>{if(container&&manager?.parentElement===container)closeManager();},destroy,openManager,importPacks,renamePack,deletePack,exportPack:async()=>({format:'lili-click-effects',version:1,packs:[await portablePack(selected())]}),getDiagnostics:()=>({hits:totalHits,input:lastInput,particles:particles.length,trails:trails.length,trail:selectedTrail().id,trailEnabled:prefs.trailEnabled,canvasReady:!!ctx,theme:themeActive(),pack:selected().id,images:selected().images.map((s,i)=>({ready:loadImage(s,selected().hues?.[i]||0).ready,error:loadImage(s,selected().hues?.[i]||0).error}))})};
host.__liSparkling=host[KEY];
host.dispatchEvent(new host.Event('li-sparkling:change'));
if(window!==host){
 // A persisted pagehide is suspension for the back/forward cache, not disabling.
 const onPageHide=e=>{if(!e.persisted)destroy();};
 window.addEventListener('pagehide',onPageHide);
 window.addEventListener('pageshow',recoverEntries);
 disposers.push(()=>{window.removeEventListener('pagehide',onPageHide);window.removeEventListener('pageshow',recoverEntries);});
}
scan();

}

export function onEnable() { start(); }
export function onDisable() { if (window.__liliPixelV2?.owner === 'li-sparkling') window.__liliPixelV2.destroy(); }
export function onDelete() { onDisable(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();

