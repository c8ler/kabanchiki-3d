import { forestEdgeLimit, forestEdgeBlocked } from "../world-interactions.js?v=218";
import { capsuleCircleContact } from "../boar-physics.js?v=218";
import { polygonContact } from "../movement-geometry.js?v=218";
import { segmentHitsBox } from "../navigation.js?v=218";

// Owns 11 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function depenetratePlayer(){
 if(runtime.locationExit&&!runtime.locationExitReady())runtime.boy.position.z=Math.max(runtime.boy.position.z,-37.2+(runtime.mountedFriend?.7:runtime.PLAYER_RADIUS));
 if(runtime.level===2&&!runtime.lakeExitReady())runtime.boy.position.z=Math.max(runtime.boy.position.z,-37.2+(runtime.mountedFriend?.7:runtime.PLAYER_RADIUS));
 if(runtime.level===1&&runtime.opening&&forestEdgeBlocked(runtime.boy.position.x,runtime.boy.position.z,runtime.mountedFriend?.7:runtime.PLAYER_RADIUS,runtime.opening.passageOpen))runtime.boy.position.z=forestEdgeLimit(runtime.boy.position.x,runtime.mountedFriend?.7:runtime.PLAYER_RADIUS);
 if(runtime.mountedFriend||runtime.boarFormTime>0)runtime.resolveBoarClearance(runtime.playerBoarBody(),false);
 // Never leave Timur trapped inside a rock/tree after a level change, jump or knockback.
 for(let pass=0;pass<(runtime.mountedFriend?14:6);pass++){
  let changed=false;
  if(runtime.level===3&&!runtime.mountedFriend&&runtime.boarFormTime<=0)for(const wall of runtime.wallGeometry()){if(runtime.py>=wall.box.max.y-.015)continue;const hit=polygonContact(wall.polygon,runtime.boy.position.x,runtime.boy.position.z,runtime.PLAYER_RADIUS);if(hit){runtime.boy.position.x+=hit.nx*(hit.depth+.004);runtime.boy.position.z+=hit.nz*(hit.depth+.004);changed=true}}
  for(const q of runtime.openingDebrisCapsules()){if((runtime.mountedFriend?runtime.rideHop.height:runtime.py)+runtime.terrainHeightAt(runtime.boy.position.x,runtime.boy.position.z)>=q.top-.02)continue;const hit=capsuleCircleContact(q.body,runtime.boy.position.x,runtime.boy.position.z,runtime.mountedFriend?runtime.MOUNTED_ROCK_RADIUS:runtime.PLAYER_RADIUS);if(hit){runtime.boy.position.x+=hit.nx*(hit.depth+.004);runtime.boy.position.z+=hit.nz*(hit.depth+.004);changed=true;}}
  for(const o of runtime.logObstacles)if(runtime.pushOutOfLog(o))changed=true;
  for(const [, , ,m] of runtime.rockPositions)if(runtime.pushOutOfRock(m))changed=true;
  for(const hit of runtime.mountainContactsAt(runtime.boy.position.x,runtime.boy.position.z,runtime.mountedFriend?runtime.MOUNTED_ROCK_RADIUS:runtime.PLAYER_RADIUS)){runtime.boy.position.x+=hit.nx*(hit.depth+.005);runtime.boy.position.z+=hit.nz*(hit.depth+.005);changed=true}
  for(const o of runtime.solidCircles().filter(o=>o.type!=='tree'&&o.type!=='rock')){
   let dx=runtime.boy.position.x-o.x,dz=runtime.boy.position.z-o.z,d=Math.hypot(dx,dz),need=o.r+runtime.PLAYER_RADIUS+.035;
   if(d<need){if(d<.001){dx=1;dz=0;d=1}runtime.boy.position.x=o.x+dx/d*need;runtime.boy.position.z=o.z+dz/d*need;changed=true}
  }
  runtime.boy.position.x=Math.max(-43.1,Math.min(43.1,runtime.boy.position.x));runtime.boy.position.z=Math.max(-43.1,Math.min(43.1,runtime.boy.position.z));
  if(runtime.level===1&&runtime.opening&&forestEdgeBlocked(runtime.boy.position.x,runtime.boy.position.z,runtime.mountedFriend?.7:runtime.PLAYER_RADIUS,runtime.opening.passageOpen)){runtime.boy.position.z=forestEdgeLimit(runtime.boy.position.x,runtime.mountedFriend?.7:runtime.PLAYER_RADIUS);changed=true;}
  if(!changed)break
 }
}


function smallRideRock(mesh){if(!mesh?.visible||mesh.parent?.visible===false)return false;const q=runtime.rockShape(mesh);return Math.max(q.ax,q.az)<=1.15&&q.top-runtime.terrainHeightAt(q.cx,q.cz)<=.75}

function mountedHopClears(mesh){return runtime.mountedFriend&&runtime.rideHop.height>0&&smallRideRock(mesh)&&runtime.terrainHeightAt(runtime.boy.position.x,runtime.boy.position.z)+runtime.rideHop.height+runtime.rideBump>=runtime.rockShape(mesh).top-.015}

function updateMountedHop(dt,dx,dz){
 if(!runtime.mountedFriend||!runtime.friend){runtime.rideHop.reset();return;}
 let support=0;if(runtime.rideHop.height>0)for(const [,,,m] of runtime.rockPositions)if(smallRideRock(m)&&runtime.rockEllipse(m,runtime.boy.position.x,runtime.boy.position.z,0).n<1)support=Math.max(support,runtime.rockShape(m).top-runtime.terrainHeightAt(runtime.boy.position.x,runtime.boy.position.z));
 let request=null;const moving=Math.hypot(dx,dz);if(!runtime.rideHop.active)runtime.rideHop.duration=.9;
 if(!runtime.rideHop.active&&moving>.05&&!runtime.jump){const ux=dx/moving,uz=dz/moving;for(const [,,,m] of runtime.rockPositions){if(!smallRideRock(m))continue;const q=runtime.rockShape(m),along=(q.cx-runtime.boy.position.x)*ux+(q.cz-runtime.boy.position.z)*uz,side=Math.abs((q.cx-runtime.boy.position.x)*uz-(q.cz-runtime.boy.position.z)*ux),need=Math.max(q.ax,q.az)+runtime.MOUNTED_ROCK_RADIUS+1.8;if(along>Math.max(q.ax,q.az)+runtime.MOUNTED_ROCK_RADIUS+.25&&along<need+.4&&side<Math.max(q.ax,q.az)+.45){request={height:q.top-runtime.terrainHeightAt(q.cx,q.cz),target:m};break;}}}
 runtime.rideHop.update(dt,request,support);
}


function mountedRockFreeAt(x,z,slack=0){
 // v119: one geometric truth for the whole mounted body against every visible rock.
 // This helper is independent of current rider state so audits can validate approach points too.
 return !runtime.rockPositions.some(([, , ,m])=>m?.visible!==false&&!mountedHopClears(m)&&runtime.rockEllipse(m,x,z,runtime.MOUNTED_ROCK_RADIUS+slack).n<1);
}

function mountedRockBlocked(x,z){
 if(!runtime.mountedFriend)return false;
 
 return !mountedRockFreeAt(x,z,0);
}


function helperBlocksPlayer(x,z){
 for(const f of runtime.exitHelpers){const hit=runtime.boarPlayerContact(f,f.g.position.x,f.g.position.z,f.g.rotation.y,x,z),old=runtime.boarPlayerContact(f);
 if(hit&&(!old||hit.depth>old.depth+.001))return true;}
 return false;
}


function movementBlocked(x,z){return runtime.playerWorldBlocked(x,z,0)||mountedRockBlocked(x,z)}

function movePlayerCollisionStep(mx,mz){
 if(runtime.level===3)runtime.updateFamilyHouseReveal();runtime.catLife.avoidPlayer(runtime.boy.position.x+mx,runtime.boy.position.z+mz,runtime.boy.position.y,Math.min(.01,Math.hypot(mx,mz)/6));depenetratePlayer();
 if(Math.hypot(mx,mz)<.00001)return;
 const px=runtime.boy.position.x,pz=runtime.boy.position.z,tx=px+mx,tz=pz+mz;runtime.stepOverLowLog(tx,tz);
 // v108: the mounted boar has a real stone footprint of its own. Do not reuse Timur's
 // much smaller rock radius, otherwise the boar model visibly clips through a stone.
 if(!movementBlocked(tx,tz)){runtime.boy.position.x=tx;runtime.boy.position.z=tz;return}
 const xFirst=Math.abs(mx)>=Math.abs(mz),attempts=xFirst?[[px+mx,pz],[px,pz+mz]]:[[px,pz+mz],[px+mx,pz]];
 for(const [x,z] of attempts)if(!movementBlocked(x,z)){runtime.boy.position.x=x;runtime.boy.position.z=z;return}
 let hitRock=null,hitN=Infinity;for(const [, , ,m] of runtime.rockPositions){if(!m||m.visible===false)continue;const e=runtime.rockEllipse(m,tx,tz,runtime.mountedFriend?runtime.MOUNTED_ROCK_RADIUS:runtime.ROCK_PLAYER_RADIUS);if(e.n<hitN){hitN=e.n;hitRock=m}}
 if(hitRock&&hitN<1){const radius=runtime.mountedFriend?runtime.MOUNTED_ROCK_RADIUS:runtime.ROCK_PLAYER_RADIUS,e=runtime.rockEllipse(hitRock,px,pz,radius+.012),c=Math.cos(e.q.yaw),sn=Math.sin(e.q.yaw);let wx=e.lx/e.ax,wz=e.lz/e.az,wl=Math.hypot(wx,wz)||1;wx/=wl;wz/=wl;const txl=-wz,tzl=wx,mag=Math.hypot(mx,mz);for(const sg of [1,-1]){const llx=txl*e.ax*mag*sg,llz=tzl*e.az*mag*sg;const sx=px+llx*c+llz*sn,sz=pz-llx*sn+llz*c;if(!movementBlocked(sx,sz)){runtime.boy.position.x=sx;runtime.boy.position.z=sz;return}}}
 let nearest=null,nd=Infinity;for(const m of runtime.treeSolidMeshes){if(!m?.parent||m.parent.visible===false)continue;const t=runtime.treeTrunkShape(m),d=Math.hypot(tx-t.x,tz-t.z)-(t.r+runtime.PLAYER_RADIUS);if(d<nd){nd=d;nearest={x:t.x,z:t.z,r:t.r}}}
 for(const o of runtime.solidCircles().filter(o=>o.type!=='rock'&&o.type!=='tree')){const d=Math.hypot(tx-o.x,tz-o.z)-(o.r+runtime.PLAYER_RADIUS);if(d<nd){nd=d;nearest=o}}
 for(const hit of runtime.mountainContactsAt(tx,tz,runtime.mountedFriend?runtime.MOUNTED_ROCK_RADIUS:runtime.PLAYER_RADIUS)){if(hit.depth<nd||!nearest){nd=hit.depth;nearest={x:hit.x,z:hit.z,r:0}}}
 if(nearest){const rx=px-nearest.x,rz=pz-nearest.z,rl=Math.hypot(rx,rz)||1,txv=-rz/rl,tzv=rx/rl,sgn=(mx*txv+mz*tzv)>=0?1:-1,mag=Math.hypot(mx,mz);const sx=px+txv*mag*sgn,sz=pz+tzv*mag*sgn;if(!movementBlocked(sx,sz)){runtime.boy.position.x=sx;runtime.boy.position.z=sz}}
}

function playerCrossesHouseWall(ax,az,bx,bz){
 if(runtime.level!==3)return false;
 for(const w of runtime.wallGeometry()){
  if(w.furniture)continue;const top=w.shell&&w.root.userData.enterable?Math.max(w.box.max.y,w.roofTop):w.box.max.y;
  if(runtime.py+runtime.terrainHeightAt(ax,az)>=top-.015)continue;
  const y=(w.box.min.y+w.box.max.y)/2;
  if(segmentHitsBox({x:ax,y,z:az},{x:bx,y,z:bz},w.box))return true;
 }
 return false;
}

function movePlayerCollision(mx,mz){
 // v107 swept/sub-stepped motion prevents a fast mounted boar from tunnelling through
 // a narrow rock between rendered frames. Every slice re-runs the full collision solver.
 const dist=Math.hypot(mx,mz),step=.055,n=Math.max(1,Math.ceil(dist/step));
 for(let i=0;i<n;i++){
  const safeX=runtime.boy.position.x,safeZ=runtime.boy.position.z;
  movePlayerCollisionStep(mx/n,mz/n);
  if(playerCrossesHouseWall(safeX,safeZ,runtime.boy.position.x,runtime.boy.position.z)){runtime.boy.position.x=safeX;runtime.boy.position.z=safeZ;}
  // v119: resolve the whole neighbouring-rock cluster, then require a globally valid mounted
  // footprint. If overlapping ellipses cannot be resolved simultaneously, keep the last safe
  // position instead of allowing one rock's push-out to place the boar inside another rock.
  if(runtime.mountedFriend){
   depenetratePlayer();
   if(!mountedRockFreeAt(runtime.boy.position.x,runtime.boy.position.z,.004)&&mountedRockFreeAt(safeX,safeZ,.004)){
    runtime.boy.position.x=safeX;runtime.boy.position.z=safeZ;
   }
  }
 }
}
 return {
  bindings:{
"depenetratePlayer":{get:()=>depenetratePlayer},
"smallRideRock":{get:()=>smallRideRock},
"mountedHopClears":{get:()=>mountedHopClears},
"updateMountedHop":{get:()=>updateMountedHop},
"mountedRockFreeAt":{get:()=>mountedRockFreeAt},
"mountedRockBlocked":{get:()=>mountedRockBlocked},
"helperBlocksPlayer":{get:()=>helperBlocksPlayer},
"movementBlocked":{get:()=>movementBlocked},
"movePlayerCollisionStep":{get:()=>movePlayerCollisionStep},
"playerCrossesHouseWall":{get:()=>playerCrossesHouseWall},
"movePlayerCollision":{get:()=>movePlayerCollision}
  },
  initialize(){

  }
 };

}
