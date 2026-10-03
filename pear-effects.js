import { drawMotif } from './ornaments.js';
// Built-in bitmap lettering: no remote font, no missing Chinese glyph on phones.
const glyphs={
 '？':['01110','10001','00001','00010','00100','00000','00100'],
 S:['01111','10000','10000','01110','00001','00001','11110'],
"野":["0011111101111110", "0010100100000010", "0010100100100100", "0011111100011000", "0010100100001000", "0010100101111111", "0011111100001001", "0000100000001010", "0000100000001000", "0011111100001000", "0000100000001000", "0000100000001000", "0000111100001000", "0111000001110000", "0000000000000000", "0000000000000000"],
"陈":["1111100010000000", "1000100010000000", "1001011111111110", "1001000100000000", "1010001000000000", "1001001001000000", "1001010001000000", "1001011111111100", "1000100001000000", "1000100001000000", "1011000101010000", "1000000101001000", "1000001001000100", "1000010001000010", "1000000101000000", "1000000010000000"],
"白":["0000000100000000", "0000000100000000", "0000001000000000", "0011111111111100", "0010000000000100", "0010000000000100", "0010000000000100", "0010000000000100", "0011111111111100", "0010000000000100", "0010000000000100", "0010000000000100", "0010000000000100", "0011111111111100", "0010000000000100", "0000000000000000"],
"川":["0000100000000010", "0000100001000010", "0000100001000010", "0000100001000010", "0000100001000010", "0000100001000010", "0000100001000010", "0000100001000010", "0000100001000010", "0000100001000010", "0000100001000010", "0001000001000010", "0001000001000010", "0001000000000010", "0010000000000010", "0000000000000000"],

"酒":["0100000000000000", "0010011111111111", "0001000001010000", "0000000001010000", "0100001111111110", "0010001001010010", "0001001001010010", "0000001010010010", "0000101100001110", "0000101000000010", "0001001111111110", "0001001000000010", "0010001000000010", "0010001111111110", "0100001000000010", "0000000000000000"],
"酿":["1111111000010000", "0010100000001000", "0010100001111110", "1111111001000010", "1010101001111110", "1010101001000010", "1010101001000010", "1100111001111110", "1000001001001000", "1111111001001001", "1000001001000110", "1000001001000100", "1000001001001010", "1111111001010001", "1000001001100001", "0000000000000000"],

"老":["0000000010000000", "0000000010000000", "0001111111111010", "0000000010000100", "0000000010001000", "0000000010010000", "0011111111111111", "0000000001000000", "0000000110000000", "0000111000001110", "0111001001110000", "0000001110000000", "0000001000000001", "0000001000000001", "0000000111111110", "0000000000000000"],
 "公":["0000010000010000", "0000010000010000", "0000100000001000", "0000100000001000", "0001000010000100", "0001000010000100", "0010000010000010", "0100000100000001", "0000000100100000", "0000001000010000", "0000001000010000", "0000010000001000", "0000100011110100", "0011111110000100", "0000000000000100", "0000000000000000"],
 "草":["0000100000000000", "1111111111111110", "0000100000110000", "0000100000110000", "0011111111111100", "0010000000001100", "0011111111111100", "0010000000001100", "0010000000001100", "0011111111111100", "0000000110000000", "1111111111111110", "0000000110000000", "0000000100000000", "0000000100000000", "0000000000000000"],
 "兔":["0000010000000000", "0000011111110000", "0000100000010000", "0000100000100000", "0001111111111110", "0011000010000010", "0101000010000010", "0001000010000010", "0001111111111110", "0000000100100000", "0000000100101000", "0000001000100101", "0000001000100001", "0000110000100001", "0011000000011110", "0000000000000000"],
 "猫":["0100010001000100", "0010010001000100", "0011011111111111", "0000100001000100", "0011100001000100", "0110100000000000", "0000100111111111", "0000110100010001", "0011010100010001", "0110010111111111", "0000010100010001", "0000010100010001", "0000010100010001", "0000100111111111", "0011000100000001", "0000000000000000"],
 "爱":["000000000111110", "001111111000000", "000100010001000", "000010010010000", "111111111111111", "100000000000001", "101111111111101", "000010000000000", "111111111111111", "000100000000000", "001011111111000", "001001000010000", "010000100100000", "100000011000000", "000001100110000", "000110000001100"],
 "R":["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
 "s":["00000", "00000", "01111", "10000", "01110", "00001", "11110"],
 "h":["10000", "10000", "11110", "10001", "10001", "10001", "10001"],
 "k":["10000", "10000", "10010", "10100", "11000", "10100", "10010"],
 "o":["00000", "00000", "01110", "10001", "10001", "10001", "01110"],
 "♪":["00100", "00110", "00101", "00100", "00100", "11100", "11100"],
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
{"id": "lili-pear-word-pink", "name": "梨 · 浅粉像素字", "label": "梨", "companions": "pear-tint", "colors": ["#f4b6cf", "#ffffff"], "size": 48},
{"id": "lili-pear-word-yellow", "name": "梨 · 浅黄像素字", "label": "梨", "companions": "pear-tint", "colors": ["#f5dfa0", "#ffffff"], "size": 48},
{"id": "lili-pear-word-mono", "name": "梨 · 黑白像素字", "label": "梨", "companions": "pear-tint", "colors": ["#111111", "#ffffff"], "size": 48},
{"id": "lili-pear-ririshiko-pink", "name": "Ririshiko♪ · 浅粉像素字", "label": "Ririshiko♪", "companions": "butterfly", "colors": ["#f4b6cf", "#ffffff"], "size": 25},
{"id": "lili-pear-ririshiko-yellow", "name": "Ririshiko♪ · 浅黄像素字", "label": "Ririshiko♪", "companions": "butterfly", "colors": ["#f5dfa0", "#ffffff"], "size": 25},
{"id": "lili-pear-ririshiko-green", "name": "Ririshiko♪ · 梨绿像素字", "label": "Ririshiko♪", "companions": "butterfly", "colors": ["#a9cf56", "#ffffff"], "size": 25},
{"id": "lili-pixel-exclamation", "name": "！ · 红白像素符号", "label": "！", "companions": "spark", "colors": ["#ef404b", "#ffffff"], "size": 46},
{"id": "lili-pixel-question", "name": "？ · 红白像素符号", "label": "？", "companions": "spark", "colors": ["#ef404b", "#ffffff"], "size": 46},
 {id:'lili-pear-shiro',name:'Shiro！ · 白黑像素字与十字架',label:'Shiro！',companions:'cross',colors:['#ffffff','#111111'],size:30},
{"id": "lili-pear-chenye", "name": "陈野！ · 像素字与叠色十字架", "label": "陈野！", "companions": "cross", "motion": "pixel-text", "colors": ["#111111", "#e52d40"], "images": [], "count": 6, "size": 46, "duration": 2300, "spread": 95, "lift": 65, "shape": "square", "glow": 0},
{"id": "lili-pear-shirakawa", "name": "白川！ · 像素字与叠色十字架", "label": "白川！", "companions": "cross", "motion": "pixel-text", "colors": ["#111111", "#ffffff"], "images": [], "count": 6, "size": 46, "duration": 2300, "spread": 95, "lift": 65, "shape": "square", "glow": 0},
 {id:'lili-pear-jiuniang',name:'酒酿！ · 白深粉像素字与小花',label:'酒酿！',companions:'flower',colors:['#ffffff','#c72570'],size:44},
 {id:'lili-pear-word',name:'梨 · 绿白像素字与小梨',label:'梨',companions:'pear',colors:['#a9cf56','#ffffff'],size:48},
 {id:'lili-pear-hanari',name:'Hanari！ · 红黑像素字与蝴蝶',label:'Hanari！',companions:'butterfly',colors:['#e13b46','#111111'],size:28},
 {id:'lili-pear-lumi',name:'Lumi！ · 白粉像素字与蝴蝶',label:'Lumi！',companions:'butterfly',colors:['#ffffff','#f2a7cd'],size:28},
 {id:'lili-pear-ririshiko',name:'Ririshiko♪ · 黑白像素字与蝴蝶',label:'Ririshiko♪',companions:'butterfly',colors:['#111111','#ffffff'],size:25},
 {id:'lili-pear-husband',name:'老公！ · 白蓝像素字与蝴蝶',label:'老公！',companions:'butterfly',colors:['#ffffff','#71baff'],size:42},
 {id:'lili-pear-grass',name:'草！ · 白绿像素字与小叶子',label:'草！',companions:'leaf',colors:['#ffffff','#91c960'],size:42},
 {id:'lili-pear-rabbit',name:'兔兔！ · 白粉像素字与兔兔',label:'兔兔！',companions:'sprite',images:['rabbit.png'],colors:['#ffffff','#f4a7cc'],size:42},
 {id:'lili-pear-cat',name:'猫！ · 白橘像素字与猫猫',label:'猫！',companions:'sprite',images:['cat.png'],colors:['#ffffff','#ffb77e'],size:42},
 {id:'lili-pear-love',name:'爱 · 白粉像素字与小爱心',label:'爱',companions:'sprite',images:['heart.png'],colors:['#ffffff','#f4a7cc'],size:48},
].map(p=>({...p,motion:'pixel-text',images:(p.images||[]).map(f=>new URL('./assets/'+f,import.meta.url).href),count:6,duration:2100,spread:95,lift:65,shape:'square',glow:0}));
export const pearTrail={id:'pear-emoji',name:'🍐 · 小梨与闪闪粒子',motif:'pear-emoji',colors:['#acd35d','#ffffff','#e8ed9b'],glow:0};
export const supportedLabels=textPacks.map(p=>p.label);
export function textMetrics(label,height){
 const tall=[...label].some(c=>(glyphs[c]?.length||0)>7);
 const chars=[...label].map(c=>c==='！'&&tall?['0110','0110','0110','0110','0110','0110','0110','0110','0110','0110','0000','0000','0110','0110','0000','0000']:glyphs[c]);
 if(chars.some(c=>!c))throw Error('Unsupported pixel label');
 const rows=Math.max(...chars.map(c=>c.length)),units=chars.reduce((n,c)=>n+c[0].length+1,0)-1;
 return {chars,cell:height/rows,width:(units+1)*height/rows,height:height+height/rows};
}
export function drawPixelLabel(ctx,label,height,colors){
 const m=textMetrics(label,height);ctx.save();ctx.translate(-Math.round(m.width/2),-Math.round(m.height/2));
 for(const [color,offset] of [[colors[1],1],[colors[0],0]]){
  ctx.fillStyle=color;let x=0;
  for(const glyph of m.chars){for(let y=0;y<glyph.length;y++)for(let j=0;j<glyph[y].length;j++)if(glyph[y][j]==='1')ctx.fillRect(Math.round((x+j+offset)*m.cell),Math.round((y+offset)*m.cell),Math.round((x+j+offset+1)*m.cell)-Math.round((x+j+offset)*m.cell),Math.round((y+offset+1)*m.cell)-Math.round((y+offset)*m.cell));x+=glyph[0].length+1;}
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
const decorationCache=new WeakMap();
function decorationImage(doc,src){
 let cache=decorationCache.get(doc);if(!cache){cache=new Map();decorationCache.set(doc,cache);}if(cache.has(src))return cache.get(src);
 const image=doc.createElement('img'),record={image,ready:false};record.promise=new Promise(resolve=>{image.onload=()=>{record.ready=true;resolve();};image.onerror=()=>resolve();});cache.set(src,record);image.src=src;return record;
}
export function prepareTextImages(doc,pack){return Promise.all(pack.images.map(src=>decorationImage(doc,src).promise));}
export function preparePearEmoji(doc){return Promise.all([pearImage(doc).promise,...textPacks.map(p=>prepareTextImages(doc,p))]);}
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
 for(let i=0;i<n;i++)items.push({kind:'pear-text',role:pack.companions,x:cx,y:cy,start:now+i*45,duration:pack.duration-120,src:pack.images?.[i%pack.images.length],size:(pack.companions==='sprite'?31:pack.companions==='pear'?21:19)*scale,color:pack.colors[i%2],colors:pack.colors,phase:i*2.4,dx:(i%2?1:-1)*(w/2+14+(i>1?18:0)),dy:-(40+i*16)*scale});
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
  else if(p.role==='sprite'&&p.src){const r=decorationImage(ctx.canvas.ownerDocument,p.src);if(r.ready){ctx.rotate(Math.sin(t*5+p.phase)*.2);ctx.imageSmoothingEnabled=false;const w=r.image.naturalWidth,h=r.image.naturalHeight,k=p.size/Math.max(w,h);ctx.drawImage(r.image,-w*k/2,-h*k/2,w*k,h*k);}}
  else if(p.role==='pear-tint'){ctx.rotate(Math.sin(t*5+p.phase)*.2);drawMotif(ctx,'pear',p.size,p.color);ctx.strokeStyle=p.colors[0];ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,-p.size*.35);ctx.lineTo(2,-p.size*.6);ctx.stroke();}
  else if(p.role==='spark'){ctx.rotate(p.phase+t);drawMotif(ctx,'star',p.size*.65,p.color);}
  else if(p.role==='cross'){ctx.rotate(Math.sin(t*5+p.phase)*.18);const u=p.size/13;ctx.scale(u,u);for(const [color,d]of [[p.colors[1],1.5],[p.colors[0],0]]){ctx.fillStyle=color;ctx.fillRect(-1.5+d,-8+d,3,16);ctx.fillRect(-5.5+d,-3+d,11,3);}}
  else if(p.role==='flower'){ctx.rotate(p.phase+t*.9);drawMotif(ctx,'flower',p.size,p.colors[1]);}
  else if(p.role==='leaf'){ctx.rotate(t*1.8+p.phase);ctx.scale(p.size/22,p.size/22);ctx.fillStyle=p.color;ctx.beginPath();ctx.moveTo(-10,7);ctx.quadraticCurveTo(-12,-9,10,-8);ctx.quadraticCurveTo(12,8,-10,7);ctx.fill();ctx.strokeStyle='#609542';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-10,7);ctx.lineTo(7,-6);ctx.stroke();}
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
