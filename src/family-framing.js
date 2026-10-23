// Fit the whole animated family group, including tall relatives, inside the shot.
export function fitFamilyFrame(T,camera,target,actors,margin=.82){
 const bounds=new T.Box3();
 for(let attempt=0;attempt<5;attempt++){
  camera.updateMatrixWorld(true);let scale=1;
  for(const actor of actors){
   bounds.setFromObject(actor);
   for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const p=new T.Vector3(x,y,z).project(camera);
    scale=Math.max(scale,Math.abs(p.x)/margin,Math.abs(p.y)/margin);
   }
  }
  if(scale<=1.002)break;
  camera.position.sub(target).multiplyScalar(Math.min(1.8,scale*1.03)).add(target);
  camera.lookAt(target);
 }
 camera.updateMatrixWorld(true);
}
