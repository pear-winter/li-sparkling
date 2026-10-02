// Code-drawn artwork: transparent, resolution independent, no emoji substitution.
export const monochromeStars = {id:'lili-mono-stars',name:'黑白 · 星屑',images:[],colors:['#171717','#ffffff','#bbbbbb'],count:10,size:10,duration:1100,spread:100,lift:45,shape:'star',glow:0};
export function drawStar(ctx,size){
 ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,r=size/2*(i%2?.28:1);i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();
}
export const ornamentPacks = [
 {id:'lili-heart-fountain',name:'粉色爱心 · 呼啦啦上冒',motion:'fountain',colors:['#f49cbd'],size:22,lift:180,spread:75},
 {id:'lili-blue-flowers',name:'蓝色小花 · 轻轻飘游',motion:'blossom',colors:['#72a9e2'],size:23,lift:65,spread:120},
].map(p=>({...p,images:[],count:12,duration:2300,shape:'star',glow:0}));
// Exact recolor of the existing monochrome preset, including movement and size.
ornamentPacks.splice(1,0,{...monochromeStars,id:'lili-gold-stars',name:'金闪闪 · 星屑',colors:['#e6b43e','#f4cc65','#c9952b']});
export const ornamentTrails = [
 {id:'bubble',name:'透明泡泡 · 薄光拖尾',motif:'bubble',colors:['#c3edff','#ffd6ee','#fff3c6']},
 {id:'stars-black',name:'黑色碎星 · 闪闪拖尾',motif:'star',colors:['#111111','#292929','#080808']},
 {id:'stars-white',name:'白色碎星 · 闪闪拖尾',motif:'star',colors:['#ffffff','#e7efff','#ffffff']},
 {id:'water',name:'水面涟漪 · 扩散拖尾',motif:'wave',colors:['#edf8ff','#9ecfff','#ffffff']},
 {id:'hearts-pink',name:'粉色爱心 · 上浮拖尾',motif:'heart',colors:['#f49cbd']},
 {id:'stars-gold',name:'金闪闪 · 星屑拖尾',motif:'gold',colors:['#e6b43e','#f4cc65','#c9952b']},
 {id:'flowers-blue',name:'蓝色小花 · 飘游拖尾',motif:'flower',colors:['#72a9e2']},
].map(p=>({...p,glow:0}));
export const motifFor = motion => ({fountain:'heart',glitter:'gold',blossom:'flower'})[motion];
export function drawMotif(ctx,motif,size,color,phase=0){
 ctx.save();ctx.scale(size/24,size/24);ctx.fillStyle=color;
 if(motif==='heart'){
  ctx.beginPath();ctx.moveTo(0,10);ctx.bezierCurveTo(-19,-2,-10,-16,0,-6);ctx.bezierCurveTo(10,-16,19,-2,0,10);ctx.fill();
 }else if(motif==='flower'){
  // Fill the entire flower once so translucent petals have no overlap seams.
  ctx.beginPath();for(let i=0;i<5;i++){ctx.save();ctx.rotate(i*Math.PI*2/5);ctx.moveTo(4.6,-6);ctx.ellipse(0,-6,4.6,6,0,0,Math.PI*2);ctx.closePath();ctx.restore();}ctx.moveTo(4,0);ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();
 }else if(motif==='pear'){
  ctx.beginPath();ctx.moveTo(0,-10);ctx.bezierCurveTo(-5,-11,-4,-3,-8,1);ctx.bezierCurveTo(-16,13,16,13,8,1);ctx.bezierCurveTo(4,-3,5,-11,0,-10);ctx.fill();
 }else if(motif==='leaf'){
  ctx.beginPath();ctx.moveTo(-10,9);ctx.bezierCurveTo(-12,-5,-2,-13,10,-10);ctx.bezierCurveTo(13,2,6,11,-10,9);ctx.fill();
 }else if(motif==='bubble'){
  // Almost empty center; separate faint film and bright, broken spectral arcs.
  const g=ctx.createRadialGradient(-4,-5,1,0,0,11);g.addColorStop(0,'#e4f8ff02');g.addColorStop(.85,'#d4efff04');g.addColorStop(1,'#d6ebff20');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.fill();
  ctx.lineWidth=.55;ctx.strokeStyle='#def4ff66';ctx.stroke();
  ['#aeeeffbb','#ffc3e699','#fff0b699','#d4c4ff99'].forEach((c,i)=>{ctx.strokeStyle=c;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(0,0,10.6,i*1.57+phase,i*1.57+1+phase);ctx.stroke();});
  ctx.strokeStyle='#ffffffdd';ctx.lineWidth=1;ctx.beginPath();ctx.arc(-.4,-.4,9.3,3.55,4.45);ctx.stroke();
 }else{
  drawStar(ctx,24);
 }ctx.restore();
}
export function spawnOrnaments(pack,x,y,amount,now,scale,lightweight){
 const motif=motifFor(pack.motion),n=lightweight?Math.min(4,amount):Math.min(32,amount*(motif==='heart'?3:2));
 return Array.from({length:n},(_,i)=>({kind:'ornament',motif,x,y,start:now+i*(motif==='heart'?42:18),duration:pack.duration,phase:Math.random()*Math.PI*2,
  dx:(Math.random()-.5)*pack.spread*2*scale,dy:motif==='heart'?-(pack.lift+70+Math.random()*70)*scale:(Math.random()-.65)*pack.spread*1.7*scale,
  size:pack.size*scale*(.4+Math.random()*.75),color:pack.colors[i%pack.colors.length],dust:i%5===4}));
}
export function drawOrnament(ctx,p,now){
 const t=(now-p.start)/p.duration;if(t<0||t>1)return;
 const ease=p.motif==='heart'?t:1-Math.pow(1-t,1.7),sway=Math.sin(t*Math.PI*3+p.phase)-Math.sin(p.phase);
 ctx.save();ctx.translate(p.x+p.dx*ease+sway*(p.motif==='flower'?20:7),p.y+p.dy*ease+(p.motif==='flower'?Math.sin(t*6+p.phase)*12:0));
 ctx.rotate(p.motif==='heart'?Math.sin(t*5+p.phase)*.18:p.phase+t*.9);ctx.globalAlpha=Math.min(1,t/.07)*Math.min(1,(1-t)/.3)*(p.motif==='gold'?.45+.55*Math.pow(Math.sin(t*17+p.phase),2):1);
 if(p.dust){ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(0,0,p.size*.12,0,Math.PI*2);ctx.fill();}else drawMotif(ctx,p.motif,p.size*(.6+.4*Math.sin(t*Math.PI)),p.color);ctx.restore();
}
export function drawOrnamentTrail(ctx,p,now){
 const t=(now-p.time)/p.duration;if(t<0||t>=1)return;
 if(p.motif==='wave'){
  ctx.save();ctx.translate(p.x,p.y);ctx.lineWidth=1.2*p.size;
  for(let i=0;i<3;i++){const q=(t-i*.16)/(1-i*.16);if(q<0)continue;const r=(3+q*33)*p.size;ctx.globalAlpha=Math.pow(1-q,1.4)*Math.min(1,q/.07);ctx.strokeStyle=p.colors[i];ctx.beginPath();ctx.ellipse(0,0,r,r*.4,0,0,Math.PI*2);ctx.stroke();}ctx.restore();return;
 }
 for(let i=0;i<p.amount;i++){
  const phase=p.phase+i*2.4,size=(p.motif==='bubble'?19:p.motif==='flower'?15:p.motif==='heart'?14:8)*p.size*(.65+.35*Math.sin(phase)**2);
  const x=p.px+(p.x-p.px)*(i+.5)/p.amount+Math.sin(phase)*(4+9*t)*p.size,y=p.py+(p.y-p.py)*(i+.5)/p.amount+Math.cos(phase)*7*p.size-t*(p.motif==='bubble'||p.motif==='heart'?24:8)*p.size;
  ctx.save();ctx.translate(x,y);ctx.rotate(p.motif==='bubble'?0:Math.sin(phase+t)*.5);ctx.globalAlpha=Math.pow(1-t,1.2)*Math.min(1,(t+.05)/.12)*(p.motif==='star'||p.motif==='gold'?.35+.65*Math.sin(t*14+phase)**2:1);
  drawMotif(ctx,p.motif,size*(p.motif==='bubble'?.75+t*.4:1-t*.25),p.colors[i%p.colors.length],phase);ctx.restore();
 }
}
