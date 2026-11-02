// Swept sphere versus physical boxes; thin walls cannot be skipped by a slow frame.
export function segmentBoxEntry(a,b,box,radius=0){
 if(!a||!b||!box||!Number.isFinite(radius))return null;
 radius=Math.max(0,radius);let enter=0,exit=1;
 for(const axis of ['x','y','z']){
  const start=a[axis],end=b[axis],min=box.min[axis]-radius,max=box.max[axis]+radius;
  if(![start,end,min,max].every(Number.isFinite)||min>max)return null;
  const delta=end-start;
  if(Math.abs(delta)<1e-10){if(start<min||start>max)return null;continue}
  let near=(min-start)/delta,far=(max-start)/delta;if(near>far)[near,far]=[far,near];
  enter=Math.max(enter,near);exit=Math.min(exit,far);if(enter>exit)return null;
 }
 return enter;
}
export function firstProjectileImpact(a,b,obstacles,radius=.22){
 let best=null;
 for(const obstacle of obstacles){const t=segmentBoxEntry(a,b,obstacle.box,radius);if(t===null||best&&t>=best.t)continue;best={...obstacle,t,point:{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t}}}
 return best;
}
