import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 8 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let rockShapeCache;

function treeTrunkShape(m){m.updateWorldMatrix(true,false);const c=new THREE.Vector3(),sc=new THREE.Vector3();m.getWorldPosition(c);m.getWorldScale(sc);return {x:c.x,z:c.z,r:(m.userData.collisionRadius??.68)*Math.max(Math.abs(sc.x),Math.abs(sc.z))*.96}}

function treeTrunkHit(m,x,z,r){const t=treeTrunkShape(m);return Math.hypot(x-t.x,z-t.z)<t.r+r}

function circleHitsTreeGeometry(x,z,r){
 // v106: tree collision is the actual cylindrical trunk footprint, not its world AABB.
 // This removes the invisible square/halo around rotated/scaled trees.
 for(const m of runtime.treeSolidMeshes){if(!m?.parent||m.parent.visible===false)continue;if(treeTrunkHit(m,x,z,r))return true}
 return false
}

function rockShape(mesh){
 mesh.updateWorldMatrix(true,false);
 const matrix=mesh.matrixWorld.elements,cached=rockShapeCache.get(mesh);
 if(cached&&cached.geometry===mesh.geometry&&cached.matrix.every((value,index)=>value===matrix[index]))return cached.shape;
 const sx=Math.max(.08,Math.abs(mesh.scale.x)),sz=Math.max(.08,Math.abs(mesh.scale.z));
 // DodecahedronGeometry(1) is roughly unit-radius. A tiny inset keeps the collision on the
 // visible stone rather than outside its silhouette.
 const shape={cx:mesh.position.x,cz:mesh.position.z,ax:sx*.92,az:sz*.92,yaw:mesh.rotation.y,top:new THREE.Box3().setFromObject(mesh).max.y};
 rockShapeCache.set(mesh,{matrix:Array.from(matrix),geometry:mesh.geometry,shape});return shape;
}

function rockEllipse(mesh,x,z,pad=0){
 const q=rockShape(mesh),dx=x-q.cx,dz=z-q.cz,c=Math.cos(q.yaw),sn=Math.sin(q.yaw);
 const lx= dx*c-dz*sn,lz=dx*sn+dz*c,ax=q.ax+pad,az=q.az+pad;
 return {q,lx,lz,ax,az,n:(lx*lx)/(ax*ax)+(lz*lz)/(az*az)};
}

function rockFootprintHit(mesh,x,z,pad=.34,allowJump=true){
 if(!mesh||mesh.visible===false)return false;
 const e=rockEllipse(mesh,x,z,pad),top=e.q.top;
 // v105: riding height must never disable stone collision. The boar still slides around every rock.
 if(runtime.mountedFriend)return !runtime.mountedHopClears(mesh)&&e.n<1;
 if(allowJump){
  if(runtime.py>top+.035)return false;
  // While airborne, side collision disappears only when the *actual ballistic apex* can
  // clear this top. There is no special teleport/step-up: vertical physics still does landing.
  const remainingRise=runtime.vy>0?(runtime.vy*runtime.vy)/(2*18):0;
  if(runtime.vy>0&&runtime.py>.04&&top<=runtime.py+remainingRise+.08)return false;
  // Descending above the top belongs to the landing solver, not side collision.
  if(runtime.vy<=0&&runtime.py>=top-.045)return false;
 }
 return e.n<1;
}

function pushOutOfRock(mesh){
 // v116: mounted and on-foot depenetration are deliberately separate. The rider always uses
 // the boar body radius, while Timur keeps the jump-aware rock rule so airborne movement can
 // cross a reachable rock footprint and land on its top instead of being pushed away.
 const riding=!!runtime.mountedFriend,bodyRadius=riding?runtime.MOUNTED_ROCK_RADIUS:runtime.ROCK_PLAYER_RADIUS;
 if(!mesh||mesh.visible===false||!rockFootprintHit(mesh,runtime.boy.position.x,runtime.boy.position.z,bodyRadius+.015,!riding))return false;
 const e=rockEllipse(mesh,runtime.boy.position.x,runtime.boy.position.z,bodyRadius+.025);
 // Radial projection in ellipse space gives a smooth rounded push, unlike snapping to one
 // side of an AABB. This also prevents the jitter/teleport effect at rock corners.
 let lx=e.lx,lz=e.lz;let n=Math.sqrt((lx*lx)/(e.ax*e.ax)+(lz*lz)/(e.az*e.az));
 if(n<.0001){lx=e.ax;lz=0;n=1}
 lx/=n;lz/=n;const c=Math.cos(e.q.yaw),sn=Math.sin(e.q.yaw);
 runtime.boy.position.x=e.q.cx+lx*c+lz*sn;runtime.boy.position.z=e.q.cz-lx*sn+lz*c;return true;
}
 return {
  bindings:{
"treeTrunkShape":{get:()=>treeTrunkShape},
"treeTrunkHit":{get:()=>treeTrunkHit},
"circleHitsTreeGeometry":{get:()=>circleHitsTreeGeometry},
"rockShapeCache":{get:()=>rockShapeCache},
"rockShape":{get:()=>rockShape},
"rockEllipse":{get:()=>rockEllipse},
"rockFootprintHit":{get:()=>rockFootprintHit},
"pushOutOfRock":{get:()=>pushOutOfRock}
  },
  initialize(){

// v101: rock collision follows the visible rounded footprint instead of the rotated Box3.
// A Box3 turns a rotated rock into a large invisible rectangle, which was the source of the
// "empty space around the stone" seen in the phone recording.
/* init:const */ rockShapeCache = new WeakMap();
  }
 };

}
