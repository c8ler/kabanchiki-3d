// Test-only native geometry lifetime tracker. A dispose listener is registered
// by Three.js when geometry enters its WebGL cache. We observe that lifecycle,
// not just rising totals, so newly warmed, still-referenced geometry is allowed.
export function installResourceWatch(T){
 const entries=new Map(),geometryProto=T.BufferGeometry.prototype,objectProto=T.Object3D.prototype;
 const add=geometryProto.addEventListener,dispose=geometryProto.dispose,remove=objectProto.remove,clear=objectProto.clear;
 function see(g){
  let e=entries.get(g);
  if(!e){e={g,type:g.type,uploaded:!!g._listeners?.dispose?.length,disposed:false,site:'existing-or-unlabelled',removals:0};entries.set(g,e)}
  return e;
 }
 geometryProto.addEventListener=function(type,listener){if(type==='dispose'){const e=see(this);e.uploaded=true;e.disposed=false}return add.call(this,type,listener)};
 geometryProto.dispose=function(){const e=see(this);e.disposed=true;return dispose.call(this)};
 objectProto.remove=function(...objects){
  const site=new Error().stack?.split('\n').filter(l=>l.includes('/src/')&&!l.includes('resource-watch')).slice(0,3).join(' | ')||'unknown';
  for(const object of objects)if(object?.parent===this)object.traverse(o=>{if(o.geometry){const e=see(o.geometry);e.site=site;e.removals++}});
  return remove.apply(this,objects);
 };
 objectProto.clear=function(){
  const site=new Error().stack?.split('\n').filter(l=>l.includes('/src/')&&!l.includes('resource-watch')).slice(0,3).join(' | ')||'clear-unknown';
  this.traverse(o=>{if(o!==this&&o.geometry){const e=see(o.geometry);e.site=site;e.removals++}});
  return clear.call(this);
 };
 function snapshot(scene){
  const retained=new Set();scene.traverse(o=>{if(o.geometry){retained.add(o.geometry);see(o.geometry)}});
  const orphaned=[...entries.values()].filter(e=>e.uploaded&&!e.disposed&&!retained.has(e.g));
  const groups=new Map();for(const e of orphaned){const key=e.type+' '+e.site;groups.set(key,(groups.get(key)||0)+1)}
  return{tracked:entries.size,referenced:retained.size,nativeAlive:[...entries.values()].filter(e=>e.uploaded&&!e.disposed).length,orphaned:orphaned.length,sites:[...groups].sort((a,b)=>b[1]-a[1]).slice(0,20).map(([site,count])=>({site,count}))};
 }
 function stop(){geometryProto.addEventListener=add;geometryProto.dispose=dispose;objectProto.remove=remove;objectProto.clear=clear}
 return{snapshot,stop};
}
