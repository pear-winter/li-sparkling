// Original vector speech balloons; Japanese lettering stays selectable in pack metadata.
export const mangaWords=['ドキドキ','キラキラ','ぽんっ','わくわく','ぎゅっ','ふわっ','ドン！','びっくり'];
export const mangaPacks=[['mono','黑白','#171717','#ffffff'],['pink','粉白','#c77598','#ffffff']].map(([id,name,ink,paper])=>({id:'lili-manga-'+id,name:name+' · 日文漫画对白',motion:'manga',images:[],colors:[ink,paper],count:1,size:64,duration:1800,spread:90,lift:45}));
export function spawnManga(pack,x,y,now,scale,width,height,variant=Math.floor(Math.random()*mangaWords.length)){
 const size=Math.min(pack.size*scale,width/3.2,height/3.2),pad=size*1.4;
 return {kind:'manga',x:Math.max(pad,Math.min(width-pad,x)),y:Math.max(pad,Math.min(height-pad,y)),size,start:now,duration:pack.duration,colors:pack.colors,variant};
}
export function drawManga(ctx,p,now){
 const t=(now-p.start)/p.duration;if(t<=0||t>=1)return;
 ctx.save();ctx.translate(p.x,p.y-p.size*.28*t);ctx.rotate((p.variant%2?1:-1)*.07+Math.sin(t*12)*.018);
 const pop=t<.16?.65+.42*Math.sin(t/.16*Math.PI/2):1+.07*Math.exp(-(t-.16)*14);
 ctx.scale(p.size/64*pop,p.size/64*pop);ctx.globalAlpha=Math.min(1,t/.045)*Math.min(1,(1-t)/.25);
 const ink=p.colors[0],paper=p.colors[1]||'#ffffff';ctx.lineJoin='round';ctx.lineCap='round';
 const balloon=()=>{ctx.beginPath();if(p.variant%3===0){for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=i%2?.82:1;const x=Math.cos(a)*76*r,y=Math.sin(a)*52*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();}else if(p.variant%3===1){ctx.moveTo(-58,-40);ctx.bezierCurveTo(-86,-10,-72,34,-30,40);ctx.lineTo(-48,60);ctx.lineTo(-8,44);ctx.bezierCurveTo(82,57,92,-37,45,-46);ctx.bezierCurveTo(20,-58,-36,-53,-58,-40);ctx.closePath();}else{ctx.moveTo(-58,-46);ctx.lineTo(48,-53);ctx.lineTo(69,-25);ctx.lineTo(61,38);ctx.lineTo(20,43);ctx.lineTo(3,61);ctx.lineTo(-6,41);ctx.lineTo(-67,34);ctx.closePath();}};
 ctx.save();ctx.translate(5,5);balloon();ctx.globalAlpha*=.24;ctx.fillStyle=ink;ctx.fill();ctx.restore();balloon();ctx.fillStyle=paper;ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.stroke();
 // Two small speed accents and a drawn heart keep the decoration consistent on Android.
 ctx.beginPath();ctx.moveTo(-85,-32);ctx.lineTo(-96,-39);ctx.moveTo(-82,-42);ctx.lineTo(-86,-52);ctx.moveTo(82,24);ctx.lineTo(94,29);ctx.stroke();
 ctx.save();ctx.translate(65,-54);ctx.scale(.55,.55);ctx.beginPath();ctx.moveTo(0,8);ctx.bezierCurveTo(-26,-7,-12,-24,0,-11);ctx.bezierCurveTo(12,-24,26,-7,0,8);ctx.fillStyle=ink;ctx.fill();ctx.restore();
 const word=mangaWords[p.variant%mangaWords.length];ctx.font='900 28px "Lili Manga", "Noto Sans CJK JP", "Yu Gothic", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=ink;
 const fit=Math.min(1,112/ctx.measureText(word).width);ctx.save();ctx.scale(fit,1);ctx.rotate(-.035);ctx.fillText(word,0,-2);ctx.restore();ctx.restore();
}

let fontReady;
export function prepareMangaFont(doc){
 if(!fontReady){const face=new doc.defaultView.FontFace('Lili Manga',`url(${new URL('./assets/manga-jp.ttf',import.meta.url).href})`);doc.fonts.add(face);fontReady=face.load().catch(()=>null);}return fontReady;
}
