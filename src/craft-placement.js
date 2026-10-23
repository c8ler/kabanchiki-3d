import * as T from '../vendor/three/three.module.min.js';

// Placement uses object geometry, never the player's capsule or its movement margins.
export function placementHeight(x,z,feet,ground,surfaces){
 let y=ground;
 for(const b of surfaces)if(x>b.min.x+.015&&x<b.max.x-.015&&z>b.min.z+.015&&z<b.max.z-.015&&b.max.y<=feet+1.25&&b.max.y>=y)y=b.max.y;
 return y;
}
export function overlapVolume(a,b,tolerance=.04){
 return a.min.x<b.max.x-tolerance&&a.max.x>b.min.x+tolerance&&a.min.z<b.max.z-tolerance&&a.max.z>b.min.z+tolerance&&a.min.y<b.max.y-tolerance&&a.max.y>b.min.y+tolerance;
}
export function circleOverlapsBox(circle,box){
 const x=Math.max(box.min.x,Math.min(box.max.x,circle.x)),z=Math.max(box.min.z,Math.min(box.max.z,circle.z));
 return Math.hypot(x-circle.x,z-circle.z)<circle.r-.025&&box.min.y<circle.top-.035&&box.max.y>circle.bottom+.035;
}
export function candidateBoxes(item){
 item.g.updateWorldMatrix(true,true);
 const boxes=[];
 item.g.traverse(o=>{if(o.isMesh)boxes.push(new T.Box3().setFromObject(o))});
 return boxes;
}
export function placementProblem(boxes,{solids=[],circles=[],wet=()=>false,ground=()=>0}={}){
 for(const a of boxes){
  if(a.min.x < -42||a.max.x>42||a.min.z < -40||a.max.z>40)return 'Слишком близко к краю карты';
  if(solids.some(b=>overlapVolume(a,b))||circles.some(c=>circleOverlapsBox(c,a)))return 'Предмет пересекает препятствие';
  for(const x of [a.min.x,a.max.x])for(const z of [a.min.z,a.max.z]){
   if(wet(x,z))return 'Здесь вода';
   if(ground(x,z)>a.max.y+.12)return 'Предмет уходит в землю';
  }
 }
 return '';
}
