import { forestEdgeBlocked } from "../world-interactions.js?v=219";
import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 3 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

// v98: real-trajectory rock climb audit. Unlike the old robot "jump" probe, this starts on the ground,
// applies the same jump velocity/gravity as gameplay, moves toward a real rock every frame and requires a landing on top.
function runRockClimbAudit(){
 const issues=[],samples=[];const ox=runtime.boy.position.x,oz=runtime.boy.position.z,opy=runtime.py,ovy=runtime.vy,oy=runtime.boy.position.y;
 const dirs=[[1,0],[-1,0],[0,1],[0,-1]];let tested=0,passed=0;
 for(let ri=0;ri<runtime.rockPositions.length&&tested<12;ri++){
  const m=runtime.rockPositions[ri][3];if(!m||m.visible===false)continue;m.updateWorldMatrix(true,false);const b=new THREE.Box3().setFromObject(m),c=new THREE.Vector3();b.getCenter(c);
  // Closed forest-edge scenery is deliberately unreachable before the exit opens.
  if(runtime.level===1&&runtime.opening&&forestEdgeBlocked(c.x,c.z,runtime.PLAYER_RADIUS,runtime.opening.passageOpen))continue;
  // Normal jump apex is ~1.36 m. Test only genuinely reachable rocks.
  if(b.max.y<.22||b.max.y>1.34)continue;
  let landed=false,maxY=0,approaches=0;const attempts=[];
  for(const [ux,uz] of dirs){
   const ex=(b.max.x-b.min.x)/2,ez=(b.max.z-b.min.z)/2;
   const sx=c.x+ux*(ex+runtime.ROCK_PLAYER_RADIUS+.18),sz=c.z+uz*(ez+runtime.ROCK_PLAYER_RADIUS+.18);
   runtime.py=runtime.vy=0;runtime.boy.position.y=0;
   if(runtime.playerWorldBlocked(sx,sz))continue;
   approaches++;runtime.boy.position.set(sx,0,sz);runtime.py=0;runtime.vy=7;
   for(let frame=0;frame<100;frame++){
    // Only the target rock may stop this approach: a nearby branch or rock
    // must not masquerade as having reached the target's support footprint.
    if(runtime.rockEllipse(m,runtime.boy.position.x,runtime.boy.position.z,runtime.PLAYER_RADIUS*.12).n>=1)runtime.movePlayerCollision(-ux*.075,-uz*.075);
    const prev=runtime.py;runtime.vy-=18/60;let next=runtime.py+runtime.vy/60;const support=runtime.playerSupportHeightAt(runtime.boy.position.x,runtime.boy.position.z);
    if(runtime.vy<=0&&prev>=support-.04&&next<=support){runtime.py=support;runtime.vy=0}else{runtime.py=Math.max(0,next);if(runtime.py===0)runtime.vy=0}
    runtime.boy.position.y=runtime.py;maxY=Math.max(maxY,runtime.py);
    if(runtime.vy===0&&runtime.rockEllipse(m,runtime.boy.position.x,runtime.boy.position.z,runtime.PLAYER_RADIUS*.12).n<1&&Math.abs(runtime.py-b.max.y)<.10){landed=true;break}
    if(runtime.vy===0&&runtime.py===0&&frame>25)break;
   }
   attempts.push({start:{x:sx,z:sz},end:{x:runtime.boy.position.x,z:runtime.boy.position.z},py: runtime.py,support:runtime.playerSupportHeightAt(runtime.boy.position.x,runtime.boy.position.z),onTarget:runtime.rockEllipse(m,runtime.boy.position.x,runtime.boy.position.z,runtime.PLAYER_RADIUS*.12).n});
   if(landed)break;
  }
  if(!approaches)continue;tested++;
  samples.push({rock:ri,top:+b.max.y.toFixed(3),maxY:+maxY.toFixed(3),landed,approaches,attempts});
  if(landed)passed++;else issues.push(`rock-climb-failed:${ri}:top=${b.max.y.toFixed(2)}`);
 }
 runtime.boy.position.set(ox,oy,oz);runtime.py=opy;runtime.vy=ovy;
 if(tested===0)issues.push('rock-climb-no-reachable-samples');
 return {ok:issues.length===0,issues,tested,passed,samples,level: runtime.level};
}

// v101: regression test for the exact phone-video failure: visible corner clearance and smooth orbiting.
function runRockEdgeAudit(){
 const issues=[],samples=[];let tested=0;
 for(let ri=0;ri<runtime.rockPositions.length&&tested<10;ri++){
  const m=runtime.rockPositions[ri][3];if(!m||m.visible===false)continue;const q=runtime.rockShape(m);tested++;
  // A point just outside the rounded visible corner must be free. The old Box3 collision failed this.
  const a=q.yaw,c=Math.cos(a),sn=Math.sin(a),lx=q.ax*.82+runtime.ROCK_PLAYER_RADIUS+.12,lz=q.az*.82+runtime.ROCK_PLAYER_RADIUS+.12;
  const x=q.cx+lx*c+lz*sn,z=q.cz-lx*sn+lz*c;const cornerBlocked=runtime.rockFootprintHit(m,x,z,runtime.ROCK_PLAYER_RADIUS,true);
  if(cornerBlocked)issues.push(`rock-invisible-corner:${ri}`);
  // 16 points on a player-radius orbit must not collide with this rock.
  let orbitBlocked=0;for(let k=0;k<16;k++){const t=k/16*Math.PI*2,ex=(q.ax+runtime.ROCK_PLAYER_RADIUS+.08)*Math.cos(t),ez=(q.az+runtime.ROCK_PLAYER_RADIUS+.08)*Math.sin(t),px=q.cx+ex*c+ez*sn,pz=q.cz-ex*sn+ez*c;if(runtime.rockFootprintHit(m,px,pz,runtime.ROCK_PLAYER_RADIUS,true))orbitBlocked++}
  if(orbitBlocked)issues.push(`rock-orbit-blocked:${ri}:${orbitBlocked}`);samples.push({rock:ri,cornerBlocked,orbitBlocked});
 }
 if(!tested)issues.push('rock-edge-no-samples');return {ok:issues.length===0,issues,tested,samples,level: runtime.level};
}

// Deterministic corridor math check: a visibly player-wide gap must remain wider than two collision pads.
function runLogPhysicsAudit(){
 const issues=[],samples=[];if(runtime.level!==1)return {ok:true,issues,tested:0,samples,level: runtime.level};
 const save={x:runtime.boy.position.x,z:runtime.boy.position.z,py: runtime.py,vy: runtime.vy};let tested=0;
 for(let i=0;i<Math.min(9,runtime.logObstacles.length);i++){
  const o=runtime.logObstacles[i],c=Math.cos(o.yaw),sn=Math.sin(o.yaw),clear=o.r+runtime.PLAYER_RADIUS+.10;
  // Both rounded ends and both side lanes must be usable immediately outside the visible capsule.
  const pts=[[o.x+c*(o.len/2+runtime.PLAYER_RADIUS+.08),o.z+sn*(o.len/2+runtime.PLAYER_RADIUS+.08)],
             [o.x-c*(o.len/2+runtime.PLAYER_RADIUS+.08),o.z-sn*(o.len/2+runtime.PLAYER_RADIUS+.08)],
             [o.x-sn*clear,o.z+c*clear],[o.x+sn*clear,o.z-c*clear]];
  const free=pts.every(([x,z])=>!runtime.logFootprintHit(o,x,z,0,false));
  // A normal jump from beside the log must clear its low top without teleport/step-up.
  runtime.py=0;runtime.vy=7;let cleared=false,maxY=0;for(let f=0;f<70;f++){runtime.vy-=18/60;runtime.py+=runtime.vy/60;maxY=Math.max(maxY,runtime.py);if(runtime.py>o.top+.04&&!runtime.logFootprintHit(o,o.x,o.z,runtime.PLAYER_RADIUS,true))cleared=true;if(runtime.py<=0&&runtime.vy<0){runtime.py=0;break}}
  samples.push({log:i,freeEndsAndSides:free,jumpClears:cleared,top:+o.top.toFixed(2),maxY:+maxY.toFixed(2)});tested++;
  if(!free)issues.push(`log-clearance-failed:${i}`);if(!cleared)issues.push(`log-jump-failed:${i}`);
 }
 runtime.boy.position.set(save.x,save.py,save.z);runtime.py=save.py;runtime.vy=save.vy;
 return {ok:issues.length===0,issues,tested,samples,level: runtime.level};
}
 return {
  bindings:{
"runRockClimbAudit":{get:()=>runRockClimbAudit},
"runRockEdgeAudit":{get:()=>runRockEdgeAudit},
"runLogPhysicsAudit":{get:()=>runLogPhysicsAudit}
  },
  initialize(){

window.__KABANCHIKI_ROCK_EDGE_AUDIT__=runRockEdgeAudit;

window.__KABANCHIKI_LOG_PHYSICS_AUDIT__=runLogPhysicsAudit;
  }
 };

}
