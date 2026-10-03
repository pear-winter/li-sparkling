// Favorites form the leading tier; manual order is retained when toggling them.
export function createOrdering(saved,save){
 const clean=a=>Array.isArray(a)?[...new Set(a.filter(x=>typeof x==='string'&&x.length<=64))].slice(0,500):[];
 let state={order:clean(saved?.order),favorites:clean(saved?.favorites)};
 const favorite=id=>state.favorites.includes(id);
 const base=items=>{const ranks=new Map(state.order.map((id,i)=>[id,i]));return [...items].sort((a,b)=>(ranks.get(a.id)??Infinity)-(ranks.get(b.id)??Infinity));};
 const sort=(items,pin)=>base(items).sort((a,b)=>a.id===pin?-1:b.id===pin?1:Number(favorite(b.id))-Number(favorite(a.id)));
 const commit=next=>{if(save(next)===false)throw Error('排序保存失败，浏览器存储空间不足。');state=next;};
 const neighbor=(visible,id,delta,pin)=>{const i=visible.findIndex(p=>p.id===id),other=visible[i+delta];return i>=0&&other&&id!==pin&&other.id!==pin&&favorite(id)===favorite(other.id)?other:null;};
 return {sort,favorite,canMove:(visible,id,delta,pin)=>!!neighbor(visible,id,delta,pin),toggle(id){commit({...state,favorites:favorite(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id]});},move(items,visible,id,delta,pin){const target=neighbor(visible,id,delta,pin);if(!target)return;const order=base(items).map(p=>p.id),i=order.indexOf(id),j=order.indexOf(target.id);[order[i],order[j]]=[order[j],order[i]];commit({...state,order});}};
}
