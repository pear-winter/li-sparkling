import { drawMotif,drawStar } from './ornaments.js';
import { knotPath } from './knot-path.js';
export const celebrationMotions=['fireworks','orbit-heart','thinking-spark','rabbit-knot'];
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
 {id:'lili-pear-rabbit-gpt',name:'小兔挠挠哥哥 · GPT',motion:'rabbit-knot',colors:['#111111','#ffffff','#f5b5c9'],size:65},
].map(p=>({...p,images:[],count:6,duration:2400,spread:100,lift:55,shape:'star',glow:0}));
export function spawnCelebration(pack,x,y,amount,now,scale,lightweight,width=Infinity,height=Infinity){
 const size=pack.size*scale*Math.min(1,width/300,height/260),pad=size*(pack.motion==='rabbit-knot'?1.2:1.7);
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
let knot;
function rabbit(ctx,p,t){
 const s=p.size/100,stroke=p.colors[0],paper=p.colors[1];ctx.save();ctx.scale(s,s);ctx.translate(-8,13);
 knot??=new Path2D(knotPath);ctx.save();ctx.translate(-43,-39);ctx.scale(86/512,86/512);ctx.fillStyle=stroke;ctx.fill(knot);ctx.restore();
 const scratch=Math.sin(t*TAU*5),bob=Math.sin(t*TAU*2)*2;
 ctx.translate(30,-36+bob);ctx.fillStyle=stroke;ellipse(ctx,5,19,16,21,-.3);ellipse(ctx,18,25,6,6);
 // Long ears and small cheeks distinguish the rabbit from a cat.
 ctx.save();ctx.rotate(Math.sin(t*TAU*2)*.06);ellipse(ctx,-9,-25,6,22,-.14);ellipse(ctx,7,-25,6,24,.12);ctx.fillStyle=p.colors[2];ellipse(ctx,-9,-27,2.2,14,-.14);ellipse(ctx,7,-27,2.2,16,.12);ctx.restore();
 ctx.fillStyle=stroke;ellipse(ctx,0,-5,20,19);ctx.fillStyle=paper;const blink=Math.sin(t*TAU*2)> .97?1:3.5;ellipse(ctx,-7,-7,2.4,blink);ellipse(ctx,7,-7,2.4,blink);ellipse(ctx,0,0,2,1.5);ctx.strokeStyle=paper;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(-4,3);ctx.quadraticCurveTo(0,7,4,3);ctx.stroke();
 ctx.save();ctx.translate(-9,14);ctx.rotate(-.7+scratch*.45);ctx.fillStyle=stroke;ellipse(ctx,-8,6,12,6,.1);ctx.strokeStyle=paper;ctx.lineWidth=1.1;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-15+i*3,5);ctx.lineTo(-14+i*3,8);ctx.stroke();}ctx.restore();
 if(scratch>.1){ctx.strokeStyle=p.colors[2];ctx.lineWidth=1.7;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-33+i*5,25);ctx.lineTo(-36+i*5,32+scratch*3);ctx.stroke();}}
 ctx.restore();
}
export function drawCelebration(ctx,p,now){
 const t=(now-p.start)/p.duration;if(t<0||t>=1)return;ctx.save();ctx.translate(p.x,p.y);const alpha=Math.min(1,t/.06)*Math.min(1,(1-t)/.22);ctx.globalAlpha=alpha;
 if(p.motion==='fireworks')fireworks(ctx,p,t);else{const breathe=1+Math.sin(t*TAU*2)*.04;ctx.scale(breathe,breathe);if(p.motion==='orbit-heart')orbit(ctx,p,t);else if(p.motion==='thinking-spark')thinking(ctx,p,t);else rabbit(ctx,p,t);}
 ctx.globalAlpha=alpha;ctx.save();dust(ctx,p,t);ctx.restore();ctx.restore();
}
