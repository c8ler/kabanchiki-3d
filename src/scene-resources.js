// Scene transitions detach transient models. Three.js needs explicit disposal
// to release their GPU buffers. Keep resources used by any remaining mesh,
// including hidden scenery. Textures are owned by their separate asset caches.
export function captureSceneResources(scene){
 const geometries=new Set(),materials=new Set();
 scene.traverse(object=>{
  if(object.geometry)geometries.add(object.geometry);
  const list=Array.isArray(object.material)?object.material:[object.material];
  for(const material of list)if(material)materials.add(material);
 });
 return{geometries,materials};
}
export function disposeDetachedResources(previous,scene){
 const retained=captureSceneResources(scene),disposed={geometries:0,materials:0};
 for(const kind of ['geometries','materials'])for(const resource of previous[kind]){
  if(retained[kind].has(resource))continue;
  resource.dispose();disposed[kind]++;
 }
 return disposed;
}
