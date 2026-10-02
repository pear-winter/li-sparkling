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
 const age=now-p.start;if(age<0)return;
 const impact=150,t=(age-impact)/(p.duration-impact),[color,shine]=p.colors;
 ctx.save();ctx.translate(p.x,p.y);ctx.lineCap='round';
 // A short falling drop reaches the point before concentric water rings expand.
 if(age<impact){const q=age/impact;ctx.globalAlpha=.4+.6*q;ctx.strokeStyle=color;ctx.shadowColor=shine;ctx.shadowBlur=5*p.scale;ctx.lineWidth=3*p.scale;
  ctx.beginPath();ctx.moveTo(0,(-52*(1-q)-11)*p.scale);ctx.lineTo(0,-52*(1-q)*p.scale);ctx.stroke();ctx.restore();return;}
 // Deep blue retains its ink core; a narrow blue reflection keeps it visible on navy.
 for(let i=0;i<p.rings;i++){
  const q=(t-i*.11)/(1-i*.11);if(q<0||q>1)continue;
  const ease=1-Math.pow(1-q,1.45),rx=(4+p.radius*ease),ry=rx*.34;
  const fade=Math.pow(1-q,1.25)*Math.min(1,q/.035);
  ctx.globalAlpha=fade;ctx.shadowColor=shine;ctx.shadowBlur=6*p.scale;
  ctx.strokeStyle=color;ctx.lineWidth=(3.2-i*.35)*p.scale*(1-q*.4);
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();
  ctx.shadowBlur=0;ctx.strokeStyle=shine;ctx.lineWidth=.9*p.scale;ctx.globalAlpha=fade*.95;
  ctx.beginPath();ctx.ellipse(0,-.7*p.scale,rx,ry,0,Math.PI*1.04,Math.PI*1.88);ctx.stroke();
  ctx.globalAlpha=fade*.5;ctx.beginPath();ctx.ellipse(0,.8*p.scale,rx,ry,0,.1,Math.PI*.72);ctx.stroke();
 }
 // Small ballistic splash droplets, rather than confetti or star shapes.
 const q=(age-impact)/650;
 if(q>=0&&q<1){ctx.shadowColor=shine;ctx.shadowBlur=4*p.scale;ctx.fillStyle=shine;ctx.globalAlpha=Math.pow(1-q,1.1);
  for(let i=0;i<p.drops;i++){const a=i/p.drops*Math.PI*2;const dx=Math.cos(a)*(13+q*34)*p.scale,dy=(Math.sin(a)*9*q-26*Math.sin(q*Math.PI))*p.scale;
   ctx.beginPath();ctx.ellipse(dx,dy,1.5*p.scale,(2.8-1.2*q)*p.scale,a*.15,0,Math.PI*2);ctx.fill();}
 }
 ctx.restore();
}

ripplePacks.push(...[
 {id:'lili-wave-white',name:'白水面 · 中心扩散',colors:['#ffffff','#d9efff']},
 {id:'lili-wave-blue',name:'深蓝水面 · 中心扩散',colors:['#174580','#9acbff']},
].map(p=>({...p,motion:'wave',images:[],count:6,size:68,duration:2400,spread:120,lift:0,shape:'circle',glow:0})));
export function spawnWaves(pack,x,y,amount,now,scale,lightweight){
 return [{kind:'wave',x,y,start:now,duration:pack.duration,radius:pack.size*1.8*scale,scale,colors:pack.colors,rings:lightweight?3:5}];
}
export function drawWave(ctx,p,now){
 const t=(now-p.start)/p.duration;if(t<0||t>=1)return;
 ctx.save();ctx.translate(p.x,p.y);ctx.lineCap='round';
 for(let i=0;i<p.rings;i++){
  const q=(t-i*.085)/(1-i*.085);if(q<0||q>=1)continue;
  const r=(2+p.radius*(1-Math.pow(1-q,1.4))),fade=Math.min(1,q/.035)*Math.pow(1-q,1.25);
  ctx.globalAlpha=fade;ctx.strokeStyle=p.colors[0];ctx.lineWidth=(2.8-i*.25)*p.scale;ctx.shadowColor=p.colors[1];ctx.shadowBlur=3*p.scale;
  ctx.beginPath();ctx.ellipse(0,0,r,r*.48,0,0,Math.PI*2);ctx.stroke();
  ctx.shadowBlur=0;ctx.strokeStyle=p.colors[1];ctx.lineWidth=1.15*p.scale;
  for(let j=0;j<3;j++){const a=j*2.1+i*.36+q*.15;ctx.beginPath();ctx.ellipse(0,0,r+.8*p.scale,r*.48+.6*p.scale,0,a,a+1.05);ctx.stroke();}
 }ctx.restore();
}
