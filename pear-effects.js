// Built-in bitmap lettering: no remote font, no missing Chinese glyph on phones.
const glyphs={
 H:['10001','10001','10001','11111','10001','10001','10001'],
 a:['00000','00000','01110','00001','01111','10001','01111'],
 n:['00000','00000','11110','10001','10001','10001','10001'],
 r:['00000','00000','10110','11001','10000','10000','10000'],
 i:['00100','00000','01100','00100','00100','00100','01110'],
 L:['10000','10000','10000','10000','10000','10000','11111'],
 u:['00000','00000','10001','10001','10001','10011','01101'],
 m:['00000','00000','11011','10101','10101','10101','10101'],
 '！':['010','010','010','010','010','000','010'],
 '梨':[
 '000011000000001','011110000010001','000100000010001','111111100010001',
 '001110000010001','010101000010001','100100100000001','000100000000110',
 '000000010000000','000000010000000','111111111111111','000000111000000',
 '000001010100000','000110010011000','011000010000110','100000010000001',
 ],
};
export const textPacks=[
 {id:'lili-pear-word',name:'梨 · 绿白像素字与小梨',label:'梨',companions:'pear',colors:['#a9cf56','#ffffff'],size:48},
 {id:'lili-pear-hanari',name:'Hanari！ · 红黑像素字与蝴蝶',label:'Hanari！',companions:'butterfly',colors:['#e13b46','#111111'],size:28},
 {id:'lili-pear-lumi',name:'Lumi！ · 白粉像素字与蝴蝶',label:'Lumi！',companions:'butterfly',colors:['#ffffff','#f2a7cd'],size:28},
].map(p=>({...p,motion:'pixel-text',images:[],count:6,duration:2100,spread:95,lift:65,shape:'square',glow:0}));
export const pearTrail={id:'pear-emoji',name:'🍐 · 小梨与闪闪粒子',motif:'pear-emoji',colors:['#acd35d','#ffffff','#e8ed9b'],glow:0};
export const supportedLabels=textPacks.map(p=>p.label);
export function textMetrics(label,height){
 const chars=[...label].map(c=>glyphs[c]);
 if(chars.some(c=>!c))throw Error('Unsupported pixel label');
 const rows=Math.max(...chars.map(c=>c.length)),units=chars.reduce((n,c)=>n+c[0].length+1,0)-1;
 return {chars,cell:height/rows,width:(units+1)*height/rows,height:height+height/rows};
}
export function drawPixelLabel(ctx,label,height,colors){
 const m=textMetrics(label,height);ctx.save();ctx.translate(-m.width/2,-m.height/2);
 for(const [color,offset] of [[colors[1],1],[colors[0],0]]){
  ctx.fillStyle=color;let x=0;
  for(const glyph of m.chars){for(let y=0;y<glyph.length;y++)for(let j=0;j<glyph[y].length;j++)if(glyph[y][j]==='1')ctx.fillRect((x+j+offset)*m.cell,(y+offset)*m.cell,m.cell,m.cell);x+=glyph[0].length+1;}
 }ctx.restore();
}
// Local Twemoji 🍐 sprite (CC BY 4.0); native emoji while its image decodes.
// This also keeps pears visible on browsers with no installed emoji font.
const emojiCache=new WeakMap();
function pearImage(doc){
 if(emojiCache.has(doc))return emojiCache.get(doc);
 const image=doc.createElement('img'),record={image,ready:false,promise:null};
 record.promise=new Promise(resolve=>{image.onload=()=>{record.ready=true;resolve();};image.onerror=()=>resolve();});
 image.src=new URL('./assets/pear-emoji.svg',import.meta.url).href;emojiCache.set(doc,record);return record;
}
export function preparePearEmoji(doc){return pearImage(doc).promise;}
export function drawPearEmoji(ctx,size){
 const record=pearImage(ctx.canvas.ownerDocument);
 if(record.ready){ctx.drawImage(record.image,-size/2,-size/2,size,size);return;}
 ctx.save();ctx.font=`${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🍐',0,0);ctx.restore();
}
// Paired fore/hind wings flap together; solid silhouette with small antennae.
function butterfly(ctx,size,color,phase){
 ctx.save();ctx.scale(size/24,size/24);ctx.fillStyle=color;ctx.strokeStyle=color;
 const flap=.22+.78*Math.abs(Math.cos(phase));
 ctx.save();ctx.scale(flap,1);
 for(const side of [-1,1]){ctx.save();ctx.scale(side,1);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(5,-16,17,-14,12,-3);ctx.bezierCurveTo(11,1,6,2,2,2);ctx.bezierCurveTo(14,1,12,12,6,10);ctx.bezierCurveTo(2,9,1,4,0,0);ctx.fill();ctx.restore();}
 ctx.restore();ctx.fillRect(-.65,-5,1.3,12);ctx.lineWidth=.7;
 ctx.beginPath();ctx.moveTo(0,-3);ctx.quadraticCurveTo(-1,-8,-4,-9);ctx.moveTo(0,-3);ctx.quadraticCurveTo(1,-8,4,-9);ctx.stroke();ctx.restore();
}
export function spawnText(pack,x,y,amount,now,scale,lightweight,width=Infinity,height=Infinity){
 const requested=pack.size*scale,m=textMetrics(pack.label,requested),size=requested*Math.min(1,Math.max(24,width-36)/m.width),w=textMetrics(pack.label,size).width;
 const cx=Math.max(w/2+12,Math.min(width-w/2-12,x));
 const cy=Math.max(size+24,Math.min(height-size-20,y));
 const items=[{kind:'pear-text',role:'label',x:cx,y:cy,start:now,duration:pack.duration,size,label:pack.label,colors:pack.colors,lift:Math.min(pack.lift*scale,Math.max(0,cy-size-12))}];
 const n=lightweight?2:4;
 for(let i=0;i<n;i++)items.push({kind:'pear-text',role:pack.companions,x:cx,y:cy,start:now+i*45,duration:pack.duration-120,size:(pack.companions==='pear'?21:19)*scale,color:pack.colors[i%2],phase:i*2.4,dx:(i%2?1:-1)*(w/2+14+(i>1?18:0)),dy:-(40+i*16)*scale});
 for(let i=0;i<(lightweight?3:7);i++)items.push({kind:'pear-text',role:'dust',x:cx,y:cy,start:now+i*20,duration:1300,size:(1.5+i%3)*scale,color:pack.colors[i%2],phase:i*2.4,dx:Math.cos(i*2.4)*(w/2+25),dy:Math.sin(i*2.4)*32-35});
 return items;
}
export function drawTextParticle(ctx,p,now){
 const t=(now-p.start)/p.duration;if(t<0||t>=1)return;
 ctx.save();ctx.globalAlpha=Math.min(1,t/.09)*Math.min(1,(1-t)/.3);
 if(p.role==='label'){
  ctx.translate(p.x,p.y-p.lift*(1-Math.pow(1-t,2)));const pop=.9+.1*Math.min(1,t/.12);ctx.scale(pop,pop);drawPixelLabel(ctx,p.label,p.size,p.colors);
 }else{
  const spread=1-Math.pow(1-t,2),sway=Math.sin(t*9+p.phase)-Math.sin(p.phase);
  ctx.translate(p.x+p.dx*(1+.1*spread)+sway*5,p.y+p.dy*spread);
  if(p.role==='butterfly'){ctx.rotate(Math.sin(t*6+p.phase)*.2);butterfly(ctx,p.size,p.color,t*20+p.phase);}
  else if(p.role==='pear'){ctx.rotate(Math.sin(t*5+p.phase)*.2);drawPearEmoji(ctx,p.size);}
  else{ctx.globalAlpha*=.45+.55*Math.sin(t*12+p.phase)**2;ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);}
 }ctx.restore();
}
export function drawPearTrail(ctx,p,now){
 const t=(now-p.time)/p.duration;if(t<0||t>=1)return;
 ctx.save();ctx.globalAlpha=Math.pow(1-t,1.3);ctx.translate(p.x+Math.sin(p.phase+t*4)*4*p.size,p.y-14*t*p.size);ctx.rotate(Math.sin(p.phase+t*3)*.2);drawPearEmoji(ctx,20*p.size*(1-t*.2));ctx.restore();
 // One pear per sample, with small square sparks instead of a dense emoji wall.
 for(let i=0;i<Math.min(5,p.amount+1);i++){
  const a=p.phase+i*2.4,r=(7+13*t)*p.size,s=(1.2+i%2)*p.size;
  ctx.save();ctx.globalAlpha=Math.pow(1-t,1.5)*(.5+.5*Math.sin(t*12+a)**2);ctx.fillStyle=p.colors[i%p.colors.length];ctx.fillRect(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r-8*t*p.size,s,s);ctx.restore();
 }
}
