import { whalePath } from './whale-path.js';
import { drawPixelLabel, drawPearEmoji } from './pear-effects.js';
import { drawMotif,drawStar } from './ornaments.js';
import { knotPath } from './knot-path.js';
export const modelMotions=['thinking-spark','thinking-gpt','thinking-whale','thinking-gemini','rabbit-knot'];
export const celebrationMotions=['fireworks','orbit-heart','pink-pear',...modelMotions];
export const celebrationPacks=[
 ...[
  ['rainbow','缤纷',['#ff638e','#ffc35d','#86d886','#78bcff','#c69bff']],
  ['red-orange','红橙',['#f44c49','#ff963e','#ffe7aa']],
  ['mono','黑白',['#111111','#ffffff']],
  ['pear','梨梨绿黄',['#a9cf56','#ffe16b','#ffffff']],
  ['pink-white','粉白',['#f5a7ca','#ffffff']],
 ].map(([id,name,colors])=>({id:'lili-fireworks-'+id,name:name+' · 小烟花',motion:'fireworks',colors,size:58})),
 {id:'lili-orbit-heart-black',name:'黑色爱心 · 星环绕行',motion:'orbit-heart',colors:['#111111','#ffffff'],size:48},
 {id:'lili-orbit-heart-pink',name:'粉色爱心 · 星环绕行',motion:'orbit-heart',colors:['#ee9fbd','#fff2f8'],size:48},
 {id:'lili-pear-thinking',name:'小克 · 思考呼吸',motion:'thinking-spark',colors:['#e87952','#ffc6a5'],size:48},
 {id:'lili-pear-rabbit-gpt',name:'GPT · 思考绳结',motion:'thinking-gpt',colors:['#111111','#ffffff','#f5b5c9'],size:65},
 {id:'lili-pear-deepseek',name:'DeepSeek · 小鲸鱼思考',motion:'thinking-whale',colors:['#4d6bfe','#b4c4ff'],size:65},
 {id:'lili-pear-gemini',name:'Gemini · 小星星思考',motion:'thinking-gemini',colors:['#168bff','#e83e62','#f7cc32','#19b985'],size:60},
 {id:'lili-pear-pink-emoji',name:'粉色🍐 · 小梨绽放',motion:'pink-pear',colors:['#f3a6c6','#ffffff','#ffdbe9'],size:50},
].map(p=>({...p,images:[],count:6,duration:2400,spread:100,lift:55,shape:'star',glow:0}));
export function spawnCelebration(pack,x,y,amount,now,scale,lightweight,width=Infinity,height=Infinity){
 const size=Math.min(pack.size*scale,width/3.7,height/3.7),pad=size*1.7;
 return [{kind:'celebration',motion:pack.motion,x:Math.max(pad,Math.min(width-pad,x)),y:Math.max(pad,Math.min(height-pad,y)),start:now,duration:pack.duration,size,colors:pack.colors,lightweight,amount:Math.min(14,amount)}];
}
const TAU=Math.PI*2;
function ellipse(ctx,x,y,rx,ry,a=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,a,0,TAU);ctx.fill();}
function glint(ctx,x,y,size,color){ctx.save();ctx.translate(x,y);ctx.fillStyle=color;drawStar(ctx,size);ctx.restore();}
function dust(ctx,p,t){
 const n=p.lightweight?5:12,alpha=ctx.globalAlpha;
 for(let i=0;i<n;i++){const a=i*2.39996,r=p.size*(.8+t*.8),s=p.size*(.024+.012*(i%3));ctx.globalAlpha=alpha*(.65+.35*Math.sin(t*14+i)**2);glint(ctx,Math.cos(a)*r,Math.sin(a)*r*.7-t*p.size*.2,s*3,p.colors[i%p.colors.length]);ctx.globalAlpha=alpha;}
}
function fireworks(ctx,p,t){
 const burst=.19;
 if(t<burst){const q=t/burst;ctx.strokeStyle=p.colors[0];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,p.size*(1-q));ctx.lineTo(0,p.size*(1-q)+9);ctx.stroke();glint(ctx,0,p.size*(1-q),5,p.colors[1]);return;}
 const q=(t-burst)/(1-burst),n=p.lightweight?14:30,r=p.size*1.8*(1-Math.exp(-3*q)),fall=p.size*q*q*.45;
 for(let i=0;i<n;i++){const a=i/n*TAU,band=i%3===0?.7:1,rr=r*band;ctx.globalAlpha=Math.pow(1-q,1.2);ctx.strokeStyle=p.colors[i%p.colors.length];ctx.lineWidth=p.size*.027;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr+fall);ctx.lineTo(Math.cos(a)*(rr-p.size*.14*(1-q)),Math.sin(a)*(rr-p.size*.14*(1-q))+fall-p.size*.03);ctx.stroke();if(i%3===0)glint(ctx,Math.cos(a)*rr,Math.sin(a)*rr+fall,4*(1-q)+1,p.colors[(i+1)%p.colors.length]);}
}
function orbit(ctx,p,t){
 const a=t*TAU*1.4,r=p.size*.94;ctx.save();ctx.rotate(-.48);ctx.strokeStyle=p.colors[0];ctx.lineWidth=p.size*.025;
 ctx.beginPath();ctx.ellipse(0,0,r,p.size*.25,0,Math.PI,TAU);ctx.stroke();
 if(Math.sin(a)<0)glint(ctx,Math.cos(a)*r,Math.sin(a)*p.size*.25,p.size*.16,p.colors[0]);ctx.restore();
 drawMotif(ctx,'heart',p.size,p.colors[0]);
 ctx.save();ctx.rotate(-.48);ctx.beginPath();ctx.ellipse(0,0,r,p.size*.25,0,0,Math.PI);ctx.strokeStyle=p.colors[0];ctx.lineWidth=p.size*.025;ctx.stroke();if(Math.sin(a)>=0)glint(ctx,Math.cos(a)*r,Math.sin(a)*p.size*.25,p.size*.16,p.colors[0]);ctx.restore();
 glint(ctx,-p.size*.65,-p.size*.65,p.size*.25,p.colors[0]);glint(ctx,p.size*.6,p.size*.5,p.size*.19,p.colors[0]);
}
function thinking(ctx,p,t){
 ctx.save();ctx.rotate(t*TAU*.32);const u=p.size/60;
 ctx.fillStyle=p.colors[0];ellipse(ctx,0,0,10*u,10*u);
 for(let i=0;i<12;i++){const a=i/12*TAU,len=(23+7*Math.sin(i*3.1)+3*Math.sin(t*TAU*3-i*.6))*u;ctx.save();ctx.rotate(a);ctx.lineCap='round';ctx.lineWidth=(i%3===0?7:5)*u;ctx.strokeStyle=p.colors[0];ctx.beginPath();ctx.moveTo(4*u,0);ctx.lineTo(len,0);ctx.stroke();ctx.restore();}ctx.restore();
 for(let i=0;i<3;i++){ctx.globalAlpha=.25+.75*Math.max(0,Math.sin(t*TAU*3-i*.9));ctx.fillStyle=p.colors[0];ellipse(ctx,(i-1)*p.size*.22,p.size*.72,p.size*.04,p.size*.04);}ctx.globalAlpha=1;
}
let knot,whale;
function model(ctx,p,t){
 ctx.save();ctx.translate(0,Math.sin(t*TAU*2)*p.size*.045);
 if(p.motion==='thinking-whale'){
  whale??=new Path2D(whalePath);ctx.rotate(Math.sin(t*TAU*2)*.09);ctx.scale(p.size/24,p.size/24);ctx.translate(-12,-12);ctx.fillStyle=p.colors[0];ctx.fill(whale,'evenodd');
 }else if(p.motion==='thinking-gemini'){
  ctx.rotate(Math.sin(t*TAU)*.09);const r=p.size*.55;ctx.beginPath();ctx.moveTo(0,-r);ctx.bezierCurveTo(r*.22,-r*.22,r*.22,-r*.22,r,0);ctx.bezierCurveTo(r*.22,r*.22,r*.22,r*.22,0,r);ctx.bezierCurveTo(-r*.22,r*.22,-r*.22,r*.22,-r,0);ctx.bezierCurveTo(-r*.22,-r*.22,-r*.22,-r*.22,0,-r);ctx.closePath();ctx.clip();
  ctx.fillStyle=p.colors[0];ctx.fillRect(-r,-r,r*2,r*2);
  for(const [x,y,c]of [[0,-r,p.colors[1]],[-r,0,p.colors[2]],[0,r,p.colors[3]]]){const g=ctx.createRadialGradient(x,y,0,x,y,r*1.35);g.addColorStop(0,c);g.addColorStop(1,c+'00');ctx.fillStyle=g;ctx.fillRect(-r,-r,r*2,r*2);}
  ctx.fillStyle='#ffffff';ctx.globalAlpha*=.15*Math.max(0,Math.sin(t*TAU*2));ctx.fillRect(-r,-r,r*2,r*2);
 }else{
  knot??=new Path2D(knotPath);ctx.rotate(Math.sin(t*TAU*1.5)*.08);ctx.scale(p.size/512,p.size/512);ctx.translate(-256,-256);ctx.fillStyle=p.colors[0];ctx.fill(knot);
 }
 ctx.restore();
 const alpha=ctx.globalAlpha;for(let i=0;i<3;i++){ctx.globalAlpha=alpha*(.2+.8*Math.max(0,Math.sin(t*TAU*3-i*.9)));ctx.fillStyle=p.colors[i%p.colors.length];ellipse(ctx,(i-1)*p.size*.18,p.size*.68,p.size*.035,p.size*.035);}ctx.globalAlpha=alpha;
}
export function drawModelSymbols(ctx,p,t){
 const labels=(p.overlays||[]).filter(x=>['？','！','…'].includes(x));
 for(let i=0;i<labels.length;i++){const a=-Math.PI*.8+i*Math.PI*.3;ctx.save();ctx.translate(Math.cos(a)*p.size*.87,Math.sin(a)*p.size*.83+Math.sin(t*TAU*3+i)*3);drawPixelLabel(ctx,labels[i],p.size*.3,['#ef404b','#ffffff']);ctx.restore();}
}
function pinkPears(ctx,p,t){
 for(let i=0;i<(p.lightweight?2:4);i++){const a=i*2.4,r=p.size*(.15+t*.65);ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r*.6-t*p.size*.2);ctx.rotate(Math.sin(t*4+i)*.18);drawPearEmoji(ctx,p.size*.48,true);ctx.restore();}
}
export function drawCelebration(ctx,p,now){
 const t=(now-p.start)/p.duration;if(t<0||t>=1)return;ctx.save();ctx.translate(p.x,p.y);const alpha=Math.min(1,t/.06)*Math.min(1,(1-t)/.22);ctx.globalAlpha=alpha;
 if(p.motion==='fireworks')fireworks(ctx,p,t);else{const breathe=1+Math.sin(t*TAU*2)*.04;ctx.scale(breathe,breathe);if(p.motion==='orbit-heart')orbit(ctx,p,t);else if(p.motion==='thinking-spark')thinking(ctx,p,t);else if(p.motion==='pink-pear')pinkPears(ctx,p,t);else model(ctx,p,t);}
 ctx.globalAlpha=alpha;if(modelMotions.includes(p.motion))drawModelSymbols(ctx,p,t);ctx.save();dust(ctx,p,t);ctx.restore();ctx.restore();
}
