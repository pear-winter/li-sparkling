// Shared water lighting from the supplied 水光 preview. Transparent frames are
// reused by all four presets and the water trail; never allocate per particle.
const ASPECT=.60, RES=224, STEPS=96, LIMIT=128;
const cache=new Map();
const clamp=v=>Math.max(0,Math.min(1,v));
let field;
function geometry(){
 if(field)return field;field=new Float32Array(RES*RES*3);
 for(let y=0;y<RES;y++)for(let x=0;x<RES;x++){
  const u=(x+.5-RES/2)/(RES*.44),v=(y+.5-RES/2)/(RES*.44),i=(y*RES+x)*3;
  field[i]=Math.hypot(u,v);field[i+1]=.5+.5*Math.cos(Math.atan2(v,u)+1.05);field[i+2]=Math.atan2(v,u);
 }return field;
}
function texture(ctx,t,blue,lightweight){
 const frame=Math.min(STEPS-1,Math.floor(t*STEPS)),key=`${blue?1:0}:${lightweight?1:0}:${frame}`;
 if(cache.has(key))return cache.get(key);
 const c=ctx.canvas.ownerDocument.createElement('canvas');c.width=c.height=RES;
 const cx=c.getContext('2d'),img=cx.createImageData(RES,RES),data=img.data,g=geometry();
 const time=(frame+.5)/STEPS,bands=[];
 for(let k=0;k<(lightweight?2:3);k++){
  const q=(time-k*.105)/(1-k*.105);if(q<=0||q>=1)continue;
  bands.push({radius:.045+.92*Math.pow(q,.68),width:.027+.014*q,index:k,fade:Math.min(1,q/.085)*Math.pow(1-q,1.05)*(1-k*.12)});
 }
 for(let j=0;j<RES*RES;j++){
  const r=g[j*3],light=g[j*3+1],a=g[j*3+2];let alpha=0,shine=0;
  for(const b of bands){
   const drift=.0045*Math.sin(a*7+b.index*.8)+.0025*Math.sin(a*13-b.index),z=(r-b.radius-drift)/b.width;
   if(Math.abs(z)>3)continue;
   const inner=.5-.5*Math.tanh(z*1.35),body=Math.exp(-z*z)*b.fade*(.32+.46*light);
   const tooth=.004*Math.sin(a*23+b.index*1.7)*Math.pow(Math.max(0,Math.cos(a*3)),2);
   const hz=z-tooth/b.width,slope=-hz*Math.exp(-hz*hz)*2.3,norm=1/Math.sqrt(1+slope*slope);
   const nx=-slope*Math.cos(a),ny=-slope*Math.sin(a);
   const reflection=Math.pow(Math.max(0,(nx*.18-ny*.48+.858)*norm),20);
   const glint=reflection*Math.exp(-z*z*.5)*b.fade*(.7+.3*Math.sin(a*19+b.index)**2)*1.8;
   alpha+=body*.65+glint;shine+=body*.65*(.24+.64*inner)+glint;
  }
  if(alpha<.003)continue;const bright=clamp(shine/alpha),q=j*4;
  const base=blue?[17,51,100]:[99,143,169],high=blue?[190,226,255]:[255,255,255];
  for(let k=0;k<3;k++)data[q+k]=base[k]+(high[k]-base[k])*bright;
  data[q+3]=clamp(alpha*.93)*255;
 }
 cx.putImageData(img,0,0);cache.set(key,c);if(cache.size>LIMIT)cache.delete(cache.keys().next().value);return c;
}
export function clearWaterCache(){cache.clear();field=undefined;}
export function drawWaterSurface(ctx,p,now){
 const t=(now-p.start)/p.duration;if(t<0||t>=1)return;
 const blue=p.colors[0]!=='#ffffff'&&p.colors[0]!=='#edf8ff',r=p.radius;
 ctx.save();ctx.translate(p.x,p.y);ctx.imageSmoothingEnabled=true;
 ctx.drawImage(texture(ctx,t,blue,p.rings<=3),-r*1.14,-r*1.14*ASPECT,r*2.28,r*2.28*ASPECT);ctx.restore();
}
export function drawWaterImpact(ctx,p,age){
 const s=p.scale,blue=p.colors[0]!=='#ffffff',shine=blue?'#c0e5ff':'#f5fcff',TAU=Math.PI*2;
 ctx.save();ctx.translate(p.x,p.y);
 if(age<180){const q=age/180,y=-64*(1-q)*(1-q)*s;
  ctx.save();ctx.translate(0,y);const drop=ctx.createRadialGradient(-.8*s,-2*s,.3*s,0,0,3.2*s);drop.addColorStop(0,'#ffffff');drop.addColorStop(.32,shine);drop.addColorStop(1,'#699bc700');ctx.fillStyle=drop;ctx.beginPath();ctx.ellipse(0,0,3.2*s,(4+q*2)*s,0,0,TAU);ctx.fill();ctx.restore();
 }else{
  const q=(age-180)/700;if(q<1){
   const fade=Math.pow(1-q,1.5),r=(3+q*19)*s,h=Math.sin(q*Math.PI)*8*s;
   const g=ctx.createLinearGradient(0,-h,0,5*s);g.addColorStop(0,shine+'aa');g.addColorStop(.55,blue?'#699cc345':'#b8dce845');g.addColorStop(1,'#6da5bd00');ctx.fillStyle=g;ctx.globalAlpha=fade;ctx.beginPath();
   for(let i=0;i<=64;i++){const a=i/64*TAU,x=Math.cos(a)*r,y=Math.sin(a)*r*ASPECT*.88-h*(.7+.3*Math.cos(a*4));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
   for(let i=64;i>=0;i--){const a=i/64*TAU;ctx.lineTo(Math.cos(a)*r*.7,Math.sin(a)*r*ASPECT*.66+2*s);}ctx.closePath();ctx.fill();
   for(let i=0;i<Math.min(4,p.drops);i++){const a=i*2.39996,speed=.65+.35*Math.sin(i*4.13)**2,dx=Math.cos(a)*(4+q*35)*s,dy=Math.sin(a)*q*16*s-Math.sin(q*Math.PI)*30*s*speed;
    ctx.globalAlpha=fade*(.5+.5*speed);ctx.fillStyle=shine;ctx.beginPath();ctx.ellipse(dx,dy,(.65+.35*speed)*s,(1.1+.8*(1-q))*s,a*.2,0,TAU);ctx.fill();}
  }
 }ctx.restore();
}
