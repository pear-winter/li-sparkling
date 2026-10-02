import { drawWaterSurface, drawWaterImpact } from './water.js';

export const ripplePacks = [
 {id:'lili-ripple-white',name:'白雨 · 落水涟漪',colors:['#ffffff','#dceeff'],motion:'ripple'},
 {id:'lili-ripple-blue',name:'深蓝雨 · 落水涟漪',colors:['#173f86','#87baff'],motion:'ripple'},
].map(p=>({...p,images:[],count:6,size:48,duration:2200,spread:100,lift:65,shape:'circle',glow:0}));

export function spawnRipples(pack,x,y,amount,now,scale,lightweight){
 const count=lightweight?1:Math.min(3,Math.max(1,Math.ceil(amount/5)));
 return Array.from({length:count},(_,i)=>({kind:'ripple',x:x+(i?(i%2?1:-1)*(40+Math.random()*30)*scale:0),
  y:y+(i?(Math.random()-.5)*40*scale:0),start:now+i*170,duration:pack.duration,
  radius:(i?pack.size*.9:pack.size*1.4)*scale,scale,colors:pack.colors,
  drops:lightweight?3:Math.min(10,amount+2),rings:lightweight?2:3}));
}

export function drawRipple(ctx,p,now){
 const age=now-p.start;if(age<0||age>=p.duration)return;
 if(age>=180)drawWaterSurface(ctx,{...p,start:p.start+180,duration:p.duration-180},now);
 drawWaterImpact(ctx,p,age);
}

ripplePacks.push(...[
 {id:'lili-wave-white',name:'白水面 · 中心扩散',colors:['#ffffff','#d9efff']},
 {id:'lili-wave-blue',name:'深蓝水面 · 中心扩散',colors:['#174580','#9acbff']},
].map(p=>({...p,motion:'wave',images:[],count:6,size:68,duration:2400,spread:120,lift:0,shape:'circle',glow:0})));
export function spawnWaves(pack,x,y,amount,now,scale,lightweight){
 return [{kind:'wave',x,y,start:now,duration:pack.duration,radius:pack.size*1.8*scale,scale,colors:pack.colors,rings:lightweight?3:5}];
}
export function drawWave(ctx,p,now){drawWaterSurface(ctx,p,now);}
