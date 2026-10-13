export function visibleInTree(root){for(let p=root;p;p=p.parent)if(!p.visible)return false;return true}
export function projectedBox(T,box,camera){
 const rect={left:Infinity,right:-Infinity,bottom:Infinity,top:-Infinity,near:Infinity,far:0};let count=0;
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new T.Vector3(x,y,z),view=p.clone().applyMatrix4(camera.matrixWorldInverse);if(view.z>=-.02)continue;rect.near=Math.min(rect.near,-view.z);rect.far=Math.max(rect.far,-view.z);p.project(camera);rect.left=Math.min(rect.left,p.x);rect.right=Math.max(rect.right,p.x);rect.bottom=Math.min(rect.bottom,p.y);rect.top=Math.max(rect.top,p.y);count++}return count?rect:null;
}
export function blocksShot(a,b){return a&&b&&a.near<b.far+.3&&a.right>b.left-.06&&a.left<b.right+.06&&a.top>b.bottom-.06&&a.bottom<b.top+.06}
export class CinematicTreeGuard{
 constructor(T,roots=[]){this.T=T;this.entries=new Map();this.hidden=0;for(const root of roots)if(visibleInTree(root))this.add(root)}
 add(root){const old=this.entries.get(root);this.entries.set(root,{root,visible:old?old.visible:root.visible,box:new this.T.Box3().setFromObject(root)})}
 restore(){for(const e of this.entries.values())e.root.visible=e.visible;this.hidden=0}
 update(camera,actors){this.restore();camera.updateWorldMatrix(true,false);camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
 const rects=actors.filter(visibleInTree).map(a=>projectedBox(this.T,new this.T.Box3().setFromObject(a),camera)).filter(Boolean);
 for(const e of this.entries.values()){if(!e.visible)continue;const r=projectedBox(this.T,e.box,camera);if(rects.some(a=>blocksShot(r,a))){e.root.visible=false;this.hidden++}}
 return this.hidden;
 }
}
