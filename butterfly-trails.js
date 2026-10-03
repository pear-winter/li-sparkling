import { butterflyPacks } from './assets.js';
// Use the same source silhouettes and hue offsets as every click preset.
export const butterflyTrails=butterflyPacks.map(p=>({id:'trail-'+p.id,name:p.name.split(' · ')[0]+' · 蝴蝶拖尾',motif:'butterfly',images:p.images,hues:p.hues,paired:p.paired||p.id==='lili-bf-duo',colors:p.colors,glow:0}));
let sequence=0;
export function makeButterflyTrail(pack,amount,lightweight,loadImage){
 const n=pack.paired?2:lightweight?1:Math.min(3,Math.max(1,amount));
 const start=sequence++*2;
 return Array.from({length:n},(_,i)=>{const k=(start+i)%pack.images.length;return {texture:loadImage(pack.images[k],pack.hues?.[k]||0),phase:i*2.4+start,color:pack.colors[i%pack.colors.length]};});
}
export function drawButterflyTrail(ctx,p,now){
 const t=(now-p.time)/p.duration;if(t<0||t>=1)return;
 for(let i=0;i<p.butterflies.length;i++){
  const b=p.butterflies[i],phase=b.phase+p.phase,k=(i+.5)/p.butterflies.length;
  const x=p.px+(p.x-p.px)*k+Math.sin(phase+t*5)*(5+8*t)*p.size;
  const y=p.py+(p.y-p.py)*k+Math.cos(phase)*9*p.size-25*t*p.size;
  ctx.save();ctx.globalAlpha=Math.pow(1-t,1.3);ctx.translate(x,y);ctx.rotate(Math.sin(phase+t*4)*.25);
  const s=(22+4*Math.sin(phase)**2)*p.size*(1-.2*t),flap=.3+.7*Math.abs(Math.cos(phase+t*16));
  if(b.texture.ready){const img=b.texture.image,h=s*(img.naturalHeight||img.height)/(img.naturalWidth||img.width);ctx.save();ctx.scale(flap,1);ctx.drawImage(img,-s/2,-h/2,s,h);ctx.restore();}
  ctx.fillStyle=b.color;ctx.globalAlpha*=.5+.5*Math.sin(phase+t*12)**2;ctx.fillRect(-s*.6,7,2*p.size,2*p.size);ctx.restore();
 }
}
