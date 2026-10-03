// Original vector speech balloons; Japanese lettering stays selectable in pack metadata.
export const mangaWords=['ドキドキ','キラキラ','ぽんっ','わくわく','ぎゅっ','ふわっ','ドン！','びっくり'];
export const mangaPacks=[['mono','黑白','#171717','#ffffff'],['pink','粉白','#c77598','#ffffff']].map(([id,name,ink,paper])=>({id:'lili-manga-'+id,name:name+' · 日文漫画对白',motion:'manga',images:[],colors:[ink,paper],count:1,size:54,duration:1800,spread:90,lift:45}));
export const handwrittenWords={ja:['ドキッ','ぎゅっ','ふわっ','きゅん','ぽんっ','わくわく','キラッ','ぴょん'],zh:['怦怦','啾～','哇！','呜哇','嘿嘿','喵呜','抱抱','贴贴']};
for(const [language,label] of [['ja','日文'],['zh','中文']])for(const [color,name,ink] of [['mono','黑白','#171717'],['pink','粉白','#cc759d']])mangaPacks.push({id:`lili-handwritten-${language}-${color}`,name:`${name} · ${label}手写拟声词`,motion:'manga',mangaStyle:'handwritten',language,images:[],colors:[ink,'#ffffff'],count:1,size:52,duration:1700,spread:90,lift:45});
export const mangaTrails=mangaPacks.filter(p=>p.mangaStyle==='handwritten').map(p=>({id:p.id.replace('lili-','')+'-trail',name:p.name+' · 拖尾',motif:'manga-lettering',language:p.language,colors:p.colors,glow:0}));
export function spawnManga(pack,x,y,now,scale,width,height,variant=Math.floor(Math.random()*mangaWords.length)){
 const size=Math.min(pack.size*scale,width/3.2,height/3.2),pad=size*1.4;
 return {mangaStyle:pack.mangaStyle,language:pack.language||'ja',kind:'manga',x:Math.max(pad,Math.min(width-pad,x)),y:Math.max(pad,Math.min(height-pad,y)),size,start:now,duration:pack.duration,colors:pack.colors,variant};
}
export function drawManga(ctx,p,now){
 const t=(now-p.start)/p.duration;if(t<=0||t>=1)return;
 ctx.save();ctx.translate(p.x+Math.sin(t*52)*1.3*(1-t),p.y-p.size*.28*t);ctx.rotate((p.variant%2?1:-1)*.07+Math.sin(t*42)*.027*(1-t));
 const pop=t<.16?.65+.42*Math.sin(t/.16*Math.PI/2):1+.07*Math.exp(-(t-.16)*14);
 ctx.scale(p.size/64*pop,p.size/64*pop);ctx.globalAlpha=Math.min(1,t/.045)*Math.min(1,(1-t)/.25);
 const ink=p.colors[0],paper=p.colors[1]||'#ffffff';ctx.lineJoin='round';ctx.lineCap='round';
 if(p.mangaStyle==='handwritten'){drawHandwritten(ctx,p,t);ctx.restore();return;}
 const balloon=()=>{ctx.beginPath();if(p.variant%3===0){for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=i%2?.82:1;const x=Math.cos(a)*76*r,y=Math.sin(a)*52*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();}else if(p.variant%3===1){ctx.moveTo(-58,-40);ctx.bezierCurveTo(-86,-10,-72,34,-30,40);ctx.lineTo(-48,60);ctx.lineTo(-8,44);ctx.bezierCurveTo(82,57,92,-37,45,-46);ctx.bezierCurveTo(20,-58,-36,-53,-58,-40);ctx.closePath();}else{ctx.moveTo(-58,-46);ctx.lineTo(48,-53);ctx.lineTo(69,-25);ctx.lineTo(61,38);ctx.lineTo(20,43);ctx.lineTo(3,61);ctx.lineTo(-6,41);ctx.lineTo(-67,34);ctx.closePath();}};
 ctx.save();ctx.translate(5,5);balloon();ctx.globalAlpha*=.24;ctx.fillStyle=ink;ctx.fill();ctx.restore();balloon();ctx.fillStyle=paper;ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.stroke();
 // Two small speed accents and a drawn heart keep the decoration consistent on Android.
 ctx.beginPath();ctx.moveTo(-85,-32);ctx.lineTo(-96,-39);ctx.moveTo(-82,-42);ctx.lineTo(-86,-52);ctx.moveTo(82,24);ctx.lineTo(94,29);ctx.stroke();
 ctx.save();ctx.translate(65,-54);ctx.scale(.55,.55);ctx.beginPath();ctx.moveTo(0,8);ctx.bezierCurveTo(-26,-7,-12,-24,0,-11);ctx.bezierCurveTo(12,-24,26,-7,0,8);ctx.fillStyle=ink;ctx.fill();ctx.restore();
 const word=mangaWords[p.variant%mangaWords.length];ctx.font='900 28px "Lili Manga", "Noto Sans CJK JP", "Yu Gothic", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=ink;
 const fit=Math.min(1,112/ctx.measureText(word).width);ctx.save();ctx.scale(fit,1);ctx.rotate(-.035);ctx.fillText(word,0,-2);ctx.restore();ctx.restore();
}

function heart(ctx,x,y,size,ink,paper){
 ctx.save();ctx.translate(x,y);ctx.scale(size/24,size/24);ctx.beginPath();ctx.moveTo(0,9);ctx.bezierCurveTo(-26,-7,-12,-24,0,-11);ctx.bezierCurveTo(12,-24,26,-7,0,9);ctx.lineWidth=4;ctx.strokeStyle=paper;ctx.stroke();ctx.fillStyle=ink;ctx.fill();ctx.restore();
}
function drawHandwritten(ctx,p,t){
 const ink=p.colors[0],paper=p.colors[1]||'#ffffff',word=handwrittenWords[p.language||'ja'][p.variant%8],chars=[...word],vertical=p.variant%2===0;
 ctx.font=`${p.language==='zh'?'400':'900'} 42px "${p.language==='zh'?'Lili Brush CN':'Lili Manga'}",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
 for(let i=0;i<chars.length;i++){
  ctx.save();const step=vertical?29:32;ctx.translate(vertical?Math.sin(i*1.9)*7:(i-(chars.length-1)/2)*step,vertical?(i-(chars.length-1)/2)*step:Math.sin(i*1.6)*7);ctx.rotate((i%2?1:-1)*.12+Math.sin(t*40+i)*.025);const size=i===0?1.2:i===chars.length-1?.8:1;ctx.scale(size,size);
  ctx.strokeStyle=paper;ctx.lineWidth=5;ctx.strokeText(chars[i],0,0);ctx.fillStyle=ink;ctx.fillText(chars[i],0,0);ctx.restore();
 }
 const hx=vertical?33:chars.length*16+6,hy=vertical?-35:-20;
 heart(ctx,hx,hy+Math.sin(t*14)*3,12,ink,paper);heart(ctx,-hx,30+Math.sin(t*15+1)*3,8,ink,paper);
 ctx.strokeStyle=ink;ctx.lineWidth=2.1;const jitter=Math.sin(t*48)*2;
 for(const sign of [-1,1]){ctx.beginPath();const x=sign*(vertical?35:chars.length*16+4);ctx.moveTo(x,7+jitter);ctx.quadraticCurveTo(x+sign*8,13+jitter,x+sign*2,19+jitter);ctx.moveTo(x+sign*7,5+jitter);ctx.quadraticCurveTo(x+sign*15,13+jitter,x+sign*9,23+jitter);ctx.stroke();}
}
export function drawMangaTrail(ctx,p,now){
 drawManga(ctx,{kind:'manga',mangaStyle:'handwritten',language:p.language,x:p.x,y:p.y,start:p.time,duration:p.duration,size:26*p.size,colors:p.colors,variant:p.variant||0},now);
}
const fontDocuments=new WeakMap();
export function prepareMangaFont(doc){
 if(!fontDocuments.has(doc)){const promises=[['Lili Manga','manga-jp.ttf'],['Lili Brush CN','manga-cn.ttf']].map(([family,file])=>{const face=new doc.defaultView.FontFace(family,`url(${new URL('./assets/'+file,import.meta.url).href})`);doc.fonts.add(face);return face.load().catch(()=>null);});fontDocuments.set(doc,Promise.all(promises));}return fontDocuments.get(doc);
}
