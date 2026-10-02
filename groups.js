// Group membership belongs to the user's library, not the effect artwork.
export const ungrouped = 'ungrouped';
const defaults = [
 ['stars','星星与星屑'],['flowers','蓝色小花'],['hearts','爱心与闪光'],['pixels','像素粒子'],['butterflies','蝴蝶'],
 ['bubbles','泡泡'],['music','音符'],['snow','雪花'],['rain','雨滴涟漪'],
 ['neon','霓虹'],['pear','梨梨与黄绿'],[ungrouped,'未分组'],
].map(([id,name])=>({id,name}));
function automatic(pack){
 if(pack.motion==='pixel-text')return 'pear';
 if(pack.id==='lili-gold-stars'||pack.motion==='glitter'||pack.id==='lili-mono-stars'||pack.id==='lili-stars')return 'stars';
 if(pack.motion==='blossom')return 'flowers';
 if(pack.motion==='fountain')return 'hearts';
 if(pack.motion==='ripple'||pack.motion==='wave')return 'rain';
 if(pack.motion==='flutter')return 'butterflies';
 if(pack.motion==='bubble'||pack.id==='lili-yellow-green')return 'bubbles';
 if(pack.motion==='snow')return 'snow';
 if(pack.motion==='music')return 'music';
 if(pack.id.startsWith('lili-neon'))return 'neon';
 if(pack.id.startsWith('lili-pear'))return 'pear';
 if(['lili-pixels','lili-mono','lili-mono-stars'].includes(pack.id))return 'pixels';
 if(['lili-love','lili-stars'].includes(pack.id))return 'hearts';
 return ungrouped;
}
export function createGroups(saved, save){
 const valid=[1,2].includes(saved?.version)&&Array.isArray(saved.groups);
 let state={version:2,groups:valid?saved.groups.filter(g=>g&&/^[a-z0-9_-]{1,64}$/.test(g.id)&&typeof g.name==='string'&&g.name.trim()).slice(0,30).map(g=>({id:g.id,name:g.name.slice(0,20)})):defaults.map(g=>({...g})),assignments:{}};
 if(valid&&saved.version===1)for(const g of defaults.filter(g=>['stars','flowers'].includes(g.id)))if(!state.groups.some(v=>v.id===g.id))state.groups.push({...g});
 state.groups=state.groups.filter((g,i,a)=>a.findIndex(v=>v.id===g.id)===i);
 if(!state.groups.some(g=>g.id===ungrouped))state.groups.push({id:ungrouped,name:'未分组'});
 if(saved?.assignments&&typeof saved.assignments==='object')for(const [id,group]of Object.entries(saved.assignments))if(/^[\w-]{1,100}$/.test(id)&&state.groups.some(g=>g.id===group))state.assignments[id]=group;
 if(valid&&saved.version===1)save(state);
 const commit=next=>{if(!save(next))throw Error('分组保存失败，请检查浏览器存储空间。');state=next;};
 const nameFor=(name,except)=>{name=String(name).trim();if(!name||name.length>20)throw Error('组名需要 1～20 个字。');if(state.groups.some(g=>g.id!==except&&g.name===name))throw Error('已经有同名分组啦。');return name;};
 const api={
  list:()=>state.groups.map(g=>({...g})),
  has:id=>state.groups.some(g=>g.id===id),
  of:pack=>(Object.hasOwn(state.assignments,pack.id)?state.assignments[pack.id]:null)||(api.has(automatic(pack))?automatic(pack):ungrouped),
  create(name){name=nameFor(name);if(state.groups.length>=30)throw Error('最多保留 30 个分组。');let id;do{id='group-'+Math.random().toString(36).slice(2,12);}while(api.has(id));commit({...state,groups:[...state.groups,{id,name}]});return id;},
  rename(id,name){if(id===ungrouped)throw Error('未分组是默认收纳位置。');if(!api.has(id))throw Error('分组不存在。');name=nameFor(name,id);commit({...state,groups:state.groups.map(g=>g.id===id?{...g,name}:g)});},
  move(pack,id){if(!api.has(id))throw Error('分组不存在。');commit({...state,assignments:{...state.assignments,[pack.id]:id}});},
  remove(id,packs){if(id===ungrouped)throw Error('未分组不能删除。');if(!api.has(id))throw Error('分组不存在。');const assignments={...state.assignments};for(const key of Object.keys(assignments))if(assignments[key]===id)assignments[key]=ungrouped;for(const p of packs)if(api.of(p)===id)assignments[p.id]=ungrouped;commit({...state,groups:state.groups.filter(g=>g.id!==id),assignments});},
 };return api;
}

