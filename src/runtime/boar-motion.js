import { BOAR_WADING_DEPTH, updateBoarBreath, shoreGoal } from "../boar-water.js?v=215";
import * as THREE from "../../vendor/three/three.module.min.js";
import { findGridPath, StableRoute, smoothHeading, findClearEscape } from "../navigation.js?v=215";

// Owns 6 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let battleFx;

function bossBattleImpact(x,z){
 const g=new THREE.Group();g.position.set(x,.42,z);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.25,.48,20),new THREE.MeshBasicMaterial({color:0xffb13b,transparent:true,opacity:.95,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;g.add(ring);
 for(let i=0;i<7;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.09,.09,.09),new THREE.MeshBasicMaterial({color:i%2?0xff6a22:0xffd45b}));const a=i/7*Math.PI*2;p.position.set(Math.sin(a)*.35,.12,Math.cos(a)*.35);g.add(p)}
 runtime.scene.add(g);battleFx.push({g,t:0,ring})
}

function minionSpawnPoint(f,angle){
 const blocked=runtime.companionNavBlocked(f);
 for(const radius of [34,30,26,22])for(let k=0;k<24;k++){
  const a=angle+(k%2?-1:1)*Math.ceil(k/2)*Math.PI/12,x=Math.sin(a)*radius,z=Math.cos(a)*radius,yaw=Math.atan2(-x,-z);
  if(blocked(x,z)||runtime.boarSceneryBlockedAt(f,x,z,yaw)||runtime.blockedByBoar(x,z,f,.78,yaw))continue;
  // Reserve a clear inward corridor, rather than merely a clear centre point.
  let safe=true;for(let i=1;i<=12;i++){const t=i/12,nx=x-Math.sin(a)*3*t,nz=z-Math.cos(a)*3*t;if(blocked(nx,nz)||runtime.boarSceneryBlockedAt(f,nx,nz,yaw)){safe=false;break}}
  if(safe)return {x,z};
 }
 return null;
}

function moveBoarToward(f,tx,tz,speed,dt){
 const ox=f.g.position.x,oz=f.g.position.z,dx=tx-ox,dz=tz-oz,d=Math.hypot(dx,dz);if(d<.001)return false;
 const step=Math.min(speed*dt,d),ux=dx/d,uz=dz/d;
 // Fleeing boars ignore trees and stones, but always respect house walls.
 if(f.flee){let vx=ux,vz=uz;if(runtime.level===3&&Math.abs(ox)<41&&Math.abs(oz)<41&&((f.fleePath?.length>0)||Array.from({length:20},(_,i)=>runtime.boarWallContacts(f,ox+ux*(i+1),oz+uz*(i+1),Math.atan2(ux,uz)).length).some(Boolean))){const blocked=(x,z)=>runtime.boarWallContacts(f,x,z,Math.atan2(vx,vz)).length>0;if(!f.fleePath||f.fleePathAge<=0){f.fleePath=findGridPath({x:ox,z:oz},{x:Math.max(-42,Math.min(42,ox+ux*20)),z:Math.max(-42,Math.min(42,oz+uz*20))},blocked,{step:.8,bound:43,maxNodes:15000});f.fleePathAge=1.5}f.fleePathAge-=dt;while(f.fleePath.length&&Math.hypot(f.fleePath[0].x-ox,f.fleePath[0].z-oz)<.5)f.fleePath.shift();if(f.fleePath.length){const q=f.fleePath[0],len=Math.max(.01,Math.hypot(q.x-ox,q.z-oz));vx=(q.x-ox)/len;vz=(q.z-oz)/len}if(runtime.boarWallContacts(f,ox+vx*step,oz+vz*step,Math.atan2(vx,vz)).length)return false}f.g.position.x+=vx*step;f.g.position.z+=vz*step;f.g.rotation.y=smoothHeading(f.g.rotation.y,Math.atan2(vx,vz),dt);return true}

 if(f.waterEscaping)return moveBoarOutOfWater(f,tx,tz,Math.max(speed,5.5),dt);
 f.route??=new StableRoute({incremental:true});const point={x:ox,z:oz},goal={x:tx,z:tz};let navGeometry;const navBlocked=(x,z)=>(navGeometry??=runtime.companionNavBlocked(f))(x,z);
 const clear=(x,z,yaw)=>!runtime.boarSceneryBlockedAt(f,x,z,yaw)&&!runtime.boarPlayerContact(f,x,z,yaw)&&!runtime.blockedByBoar(x,z,f,.78,yaw)&&!runtime.catLife.blocksBoar(runtime.boarBody(f,x,z,yaw),runtime.terrainHeightAt(x,z)-runtime.lakeDepthAt(x,z));
 f.escapeRetry=Math.max(0,(f.escapeRetry||0)-dt);
 if((!f.route.goal||f.tightEscape||f.route.stuck>.5)&&navBlocked(ox,oz)){
  const yaw=f.g.rotation.y;
  if(!f.tightEscape||navBlocked(f.tightEscape.x,f.tightEscape.z)){if(f.escapeRetry>0)return false;f.tightEscape=findClearEscape(point,navBlocked,(x,z)=>clear(x,z,yaw));if(!f.tightEscape)f.escapeRetry=.75;}
  const q=f.tightEscape;if(!q)return false;
  const dx=q.x-ox,dz=q.z-oz,len=Math.hypot(dx,dz);if(len<1e-6){f.tightEscape=null;return false;}
  const distance=Math.min(speed*dt,len),count=Math.max(1,Math.ceil(distance/.055));
  for(let i=1;i<=count;i++)if(!clear(ox+dx/len*distance*i/count,oz+dz/len*distance*i/count,yaw)){f.tightEscape=null;return false;}
  f.g.position.x=ox+dx/len*distance;f.g.position.z=oz+dz/len*distance;f.route=null;return true;
 }
 f.tightEscape=null;
 const target=f.route.next(point,goal,navBlocked,dt,{epoch:runtime.worldEpoch,step:runtime.level===3?.5:.8});
 if(!target){f.route.record(0,dt);return false;}
 const vx=target.x-ox,vz=target.z-oz,len=Math.hypot(vx,vz),desired=Math.atan2(vx,vz),heading=smoothHeading(f.g.rotation.y,desired,dt),stepSize=Math.min(speed*dt,len);
 let valid=true;const count=Math.max(1,Math.ceil(stepSize/.055));
 const delta=Math.atan2(Math.sin(heading-f.g.rotation.y),Math.cos(heading-f.g.rotation.y));
 const slices=Math.max(count,Math.ceil(Math.abs(delta)/.06));
 for(let i=1;i<=slices;i++)if(!clear(ox+vx/len*stepSize*i/slices,oz+vz/len*stepSize*i/slices,f.g.rotation.y+delta*i/slices)){valid=false;break;}
 if(valid){f.g.position.x=ox+vx/len*stepSize;f.g.position.z=oz+vz/len*stepSize;f.g.rotation.y=heading;}
 // A long capsule must be able to turn while waiting at a corner.
 // Previously the heading only changed after translation succeeded: a blocked
 // nose froze the heading forever, followed by repeated route exclusions.
 let turned=false;
 if(!valid){
  const delta=Math.atan2(Math.sin(heading-f.g.rotation.y),Math.cos(heading-f.g.rotation.y));
  const turns=Math.max(1,Math.ceil(Math.abs(delta)/.06));
  let safe=true;for(let i=1;i<=turns;i++)if(!clear(ox,oz,f.g.rotation.y+delta*i/turns)){safe=false;break;}
  if(safe&&Math.abs(delta)>1e-6){f.g.rotation.y=heading;turned=true;}
 }
 f.route.record(valid?stepSize:turned?.003:0,dt);return valid;
}

function moveBoarOutOfWater(f,tx,tz,speed,dt){
 const x=f.g.position.x,z=f.g.position.z,depth=runtime.boarWaterDepth(f),a=Math.atan2(tx-x,tz-z),step=Math.min(speed*dt,Math.hypot(tx-x,tz-z));
 for(const turn of [0,.35,-.35,.7,-.7,1.4,-1.4]){const heading=a+turn,nx=x+Math.sin(heading)*step,nz=z+Math.cos(heading)*step;
 if(runtime.lakeDepthAt(nx,nz)<=runtime.lakeDepthAt(x,z)+1e-5&&!runtime.boarTreeContacts(f,nx,nz,heading).length&&!runtime.boarWallContacts(f,nx,nz,heading).length&&!runtime.blockedByBoar(nx,nz,f,.78,heading)&&!runtime.catLife.blocksBoar(runtime.boarBody(f,nx,nz,heading),-runtime.lakeDepthAt(nx,nz))){f.g.position.x=nx;f.g.position.z=nz;f.g.rotation.y=smoothHeading(f.g.rotation.y,heading,dt);return true;}}
 return false;
}

function updateBoarWater(dt){
 for(const f of [...runtime.boarBodies()]){
  const depth=runtime.boarWaterDepth(f);f.waterEscaping=depth>BOAR_WADING_DEPTH;
  if(f.waterEscaping){f.graze=0;f.waterGoal??=shoreGoal(f.g.position.x,f.g.position.z,(x,z)=>runtime.boarWaterDepth(f,x,z),(x,z)=>runtime.boarWallContacts(f,x,z).length>0||runtime.boarTreeContacts(f,x,z).length>0);
   if(f.waterGoal)moveBoarOutOfWater(f,f.waterGoal.x,f.waterGoal.z,6.5,dt);
   if(f===runtime.friend&&runtime.mountedFriend){runtime.boy.position.x=f.g.position.x;runtime.boy.position.z=f.g.position.z;}
  }else f.waterGoal=null;
  if(updateBoarBreath(f,runtime.lakeDepthAt(f.g.position.x,f.g.position.z),dt,runtime.boarScale(f))){
   if(f===runtime.friend){runtime.friendHP--;runtime.notice('🌊 Кабанчик-друг слишком долго под водой!');if(runtime.friendHP<=0){if(runtime.mountedFriend){runtime.mountedFriend=false;runtime.setRiderPose(false);runtime.py=runtime.vy=0;}runtime.friend=null;runtime.scene.remove(f.g);}}
   else{f.hp=(f.hp??3)-1;if(f.hp<=0){const i=runtime.foes.indexOf(f);if(i>=0)runtime.foes.splice(i,1);runtime.scene.remove(f.g);runtime.levelBoarsDone++;}}
  }
 }
}
 return {
  bindings:{
"battleFx":{get:()=>battleFx},
"bossBattleImpact":{get:()=>bossBattleImpact},
"minionSpawnPoint":{get:()=>minionSpawnPoint},
"moveBoarToward":{get:()=>moveBoarToward},
"moveBoarOutOfWater":{get:()=>moveBoarOutOfWater},
"updateBoarWater":{get:()=>updateBoarWater}
  },
  initialize(){

/* init:const */ battleFx = [];
  }
 };

}
