export function liftAboveSurface(T,root,surface,clearance=.04){
 root.updateWorldMatrix(true,true);const box=new T.Box3().setFromObject(root);if(box.isEmpty())return 0;
 let floor=-Infinity;for(const x of [box.min.x,(box.min.x+box.max.x)/2,box.max.x])for(const z of [box.min.z,(box.min.z+box.max.z)/2,box.max.z])floor=Math.max(floor,surface(x,z));
 const lift=Math.max(0,floor+clearance-box.min.y);if(lift>0){const point=root.getWorldPosition(new T.Vector3());point.y+=lift;root.position.copy(root.parent?root.parent.worldToLocal(point):point);root.updateWorldMatrix(true,true)}return lift;
}
export function cinematicShot(kind,t){const cuts=kind==='intro'?[4,8,12,15]:kind==='outro'?[3,6,10]:[];return kind+':'+cuts.filter(c=>t>=c).length}
