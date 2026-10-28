import { makeExitBarrier, animateExitBarrier, buildExitLandscape } from "../exit-scenery.js?v=219";
import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 13 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function prepareOpeningClearing(){
 const inRoute=(x,z)=>Math.abs(x)<9&&z>-43&&z<29;
 for(const tree of runtime.treeObjects)if(inRoute(tree.position.x,tree.position.z))tree.visible=false;
 for(const [x,z,,mesh] of runtime.rockPositions)if(inRoute(x,z))mesh.visible=false;
 for(const log of runtime.logObstacles)if(inRoute(log.x,log.z))log.g.visible=false;
 // Clear both rows of border scenery so the trail visibly continues beyond the map.
 for(const decor of runtime.boundaryDecor)if(Math.abs(decor.position.x)<10&&decor.position.z<-40)decor.visible=false;
 const log=runtime.logObstacles[0];if(log){log.x=0;log.z=5;log.len=3.4;log.yaw=0;log.g.position.set(0,.13,5);log.g.visible=true;log.mesh.scale.y=3.4;log.mesh.rotation.y=0;log.top=.13+log.r;}
}

function prepareLakeExit(){
 for(const decor of runtime.boundaryDecor)if(Math.abs(decor.position.x)<10&&decor.position.z<-40)decor.visible=false;
 for(const tree of runtime.treeObjects)if(Math.abs(tree.position.x)<7&&tree.position.z<-28)tree.visible=false;
 for(const [x,z,,mesh] of runtime.rockPositions)if(Math.abs(x)<7&&z<-28)mesh.visible=false;
}


function buildBreakableExit(props,z){props.userData.exitBarrier=makeExitBarrier(props,runtime.level===2?'gate':runtime.locationExit?.config.kind||'gate',z,runtime.mats);animateExitBarrier(props.userData.exitBarrier,0);}


function resetExitBreaker(props){
 const d=props.userData;if(d.breaker&&d.breaker!==runtime.friend){runtime.exitHelpers.delete(d.breaker);runtime.scene.remove(d.breaker.g);}
 d.breaker=null;d.approachX=null;d.approachCooldown=0;d.approachStall=0;d.lastApproachDistance=undefined;d.breakerTime=0;d.breakerHit=false;d.breakerDone=false;
 animateBreakableExit(props,0);
}

function animateBreakableExit(props,p){
 if(props.userData.exitBarrier){animateExitBarrier(props.userData.exitBarrier,p);return;}
 for(const q of props.userData.breakPieces||[]){const k=Math.min(1,p);
 q.g.visible=k<1;q.g.position.set(q.x+q.side*5*k,q.y*(1-k)+Math.sin(k*Math.PI)*2,q.z+(q.x%2)*k);
 q.g.rotation.set(k*q.side,k*2,q.side*(.12+k*1.4));}
}

function updateExitBreaker(props,dt,z){
 const d=props.userData;if(d.breakerDone)return true;
 if(runtime.boarFormTime>0){if(!runtime.questsComplete())return false;
  if(d.breaker){d.breaker.exitBreaking=false;if(d.breaker!==runtime.friend){runtime.exitHelpers.delete(d.breaker);runtime.scene.remove(d.breaker.g)}d.breaker=null;}
  if(Math.abs(runtime.boy.position.x)>3.6||Math.abs(runtime.boy.position.z-(z+3.6))>2.8)return false;
  if(!d.breakerHit){d.breakerHit=true;runtime.bossBattleImpact(runtime.boy.position.x,z+1.8);runtime.effect('woodBreak');runtime.notice('🐗 Ты сам открываешь дорогу!')}
  d.breakerTime+=dt;animateBreakableExit(props,d.breakerTime/.85);if(d.breakerTime>=.85){d.breakerDone=true;if(d.breaker)d.breaker.exitBreaking=false;}return !!d.breakerDone;
 }

 if(!d.breaker){
  if(runtime.mountedFriend){runtime.mountedFriend=false;runtime.setRiderPose(false);runtime.py=runtime.vy=0;runtime.boy.position.y=0;}
  d.breaker=runtime.friend&&!runtime.friend.flee?runtime.friend:(()=>{let q=runtime.nearestSafeSpawn(8,z+8,1.8)||[8,z+8];if(Math.hypot(q[0]-runtime.boy.position.x,q[1]-runtime.boy.position.z)<3.2)q=runtime.nearestSafeSpawn(-8,z+8,1.8)||[-8,z+8];const helper=runtime.makeBoar(q[0],q[1],true);helper.exitHelper=true;runtime.exitHelpers.add(helper);return helper})();
  d.breaker.exitBreaking=true;d.breaker.graze=0;
  d.breaker.route=null;d.breaker.tightEscape=null;d.breaker.escapeRetry=0;d.breaker.navigation=null;
  if(d.breaker===runtime.friend){runtime.friendYield.reset();runtime.friendYieldActive=false;}
  d.approachX=runtime.boy.position.x>0?-2.5:2.5;
  runtime.notice('Друг открывает путь');
 }
 const f=d.breaker;
 if(!d.breakerHit){
  d.approachCooldown=Math.max(0,(d.approachCooldown||0)-dt);const progress=Math.hypot(f.g.position.x-(d.approachX??0),f.g.position.z-(z+3.6));d.approachStall=d.lastApproachDistance!==undefined&&d.lastApproachDistance-progress<.005*dt?(d.approachStall||0)+dt:0;d.lastApproachDistance=progress;if(d.approachStall>2&&d.approachCooldown<=0&&Math.hypot((d.approachX??0)-runtime.boy.position.x,z+3.6-runtime.boy.position.z)<3.2){d.approachX=-(d.approachX||2.5);d.approachCooldown=4;f.route=null;}
  const moved=runtime.moveBoarToward(f,d.approachX??0,z+3.6,5.5,dt);f.breakStride=(f.breakStride||0)+(moved?dt:0);
  f.b.position.y=moved?Math.abs(Math.sin(f.breakStride*16))*.08:0;
  if(Math.abs(f.g.position.x)>3.3||f.g.position.z>z+4.3||f.g.position.z<z+2.4)return false;
  d.breakerHit=true;f.b.rotation.x=-.3;runtime.bossBattleImpact(f.g.position.x,z+1.8);runtime.effect('woodBreak');
  runtime.notice(({gate:'Друг распахнул ворота',bridge:'Мост опускается',rocks:'Камни освободили дорогу'})[props.userData.exitBarrier?.kind]||'Друг разбил ствол');
 }
 d.breakerTime+=dt;animateBreakableExit(props,d.breakerTime/.85);
 if(d.breakerTime>=.85){d.breakerDone=true;f.exitBreaking=runtime.level===1&&f===runtime.friend;f.route=null;f.tightEscape=null;f.escapeRetry=0;f.b.rotation.x=0;f.b.position.y=0;
  if(f!==runtime.friend){runtime.exitHelpers.delete(f);runtime.sendBoarAway(f,'opened-passage');d.breaker=null;}
 }
 return !!d.breakerDone;
}


function setupLakeExit(){
 if(!runtime.lakeExitProps){runtime.lakeExitProps=new THREE.Group();runtime.scene.add(runtime.lakeExitProps);
 const trail=new THREE.Mesh(new THREE.PlaneGeometry(6.2,9),runtime.mats.path);trail.rotation.x=-Math.PI/2;trail.position.set(0,.05,-52.5);runtime.lakeExitProps.add(trail);runtime.lakeExitProps.userData.trail=trail;
 runtime.buildForestCorridor(runtime.lakeExitProps);buildExitLandscape(runtime.lakeExitProps,2,runtime.mats,runtime.terrainHeightAt);buildBreakableExit(runtime.lakeExitProps,-37.2);runtime.buildExitFence(runtime.lakeExitProps,-37.2);runtime.physicalSign(runtime.lakeExitProps,'К ДЕРЕВНЕ →',4,2,-34,3.4,.85);}
 runtime.syncForestCorridor(runtime.lakeExitProps);runtime.lakeExitProps.visible=true;runtime.lakeExitProps.userData.gateProgress=0;resetExitBreaker(runtime.lakeExitProps);
 runtime.lakeExitProps.userData.trail.material=runtime.currentSeason==='winter'?runtime.winterRoadMaterial:runtime.mats.path;
}

function lakeExitReady(){return !!runtime.lakeExitProps&&runtime.questsComplete()&&runtime.lakeExitProps.userData.gateProgress>=1}

function updateLakeExit(dt){if(runtime.level!==2||!runtime.lakeExitProps)return;
 if(runtime.questsComplete()&&updateExitBreaker(runtime.lakeExitProps,dt,-39))runtime.lakeExitProps.userData.gateProgress=1;
}

function setupLocationExit(){
 let props=runtime.locationExitProps.get(runtime.level);
 if(!props){props=new THREE.Group();runtime.scene.add(props);runtime.locationExitProps.set(runtime.level,props);
 const trail=new THREE.Mesh(new THREE.PlaneGeometry(6.2,9),runtime.mats.path);trail.rotation.x=-Math.PI/2;trail.position.set(0,.05,-52.5);props.add(trail);props.userData.trail=trail;
 if(runtime.level===3)runtime.buildForestCorridor(props);buildExitLandscape(props,runtime.level,runtime.mats,runtime.terrainHeightAt);buildBreakableExit(props,-37.2);runtime.buildExitFence(props,-37.2);
 runtime.physicalSign(props,runtime.locationExit.config.destination+' →',4,2,-34,3.4,.85);}
 runtime.syncForestCorridor(props);props.visible=true;props.userData.trail.material=runtime.currentSeason==='winter'?runtime.winterRoadMaterial:runtime.mats.path;resetExitBreaker(props);
}

function locationExitReady(){return !!runtime.locationExit&&runtime.locationExit.ready(runtime.questsComplete())}

function animateLocationExit(progress){const props=runtime.locationExitProps.get(runtime.level);if(props)animateBreakableExit(props,progress)}

function updateLocationExit(dt){if(!runtime.locationExit)return;const props=runtime.locationExitProps.get(runtime.level);
 if(runtime.questsComplete()&&updateExitBreaker(props,dt,-39)&&runtime.locationExit.progress<1){runtime.locationExit.progress=1;runtime.notice('💚 Дорога свободна! '+runtime.locationExit.config.destination);}
}
 return {
  bindings:{
"prepareOpeningClearing":{get:()=>prepareOpeningClearing},
"prepareLakeExit":{get:()=>prepareLakeExit},
"buildBreakableExit":{get:()=>buildBreakableExit},
"resetExitBreaker":{get:()=>resetExitBreaker},
"animateBreakableExit":{get:()=>animateBreakableExit},
"updateExitBreaker":{get:()=>updateExitBreaker},
"setupLakeExit":{get:()=>setupLakeExit},
"lakeExitReady":{get:()=>lakeExitReady},
"updateLakeExit":{get:()=>updateLakeExit},
"setupLocationExit":{get:()=>setupLocationExit},
"locationExitReady":{get:()=>locationExitReady},
"animateLocationExit":{get:()=>animateLocationExit},
"updateLocationExit":{get:()=>updateLocationExit}
  },
  initialize(){

  }
 };

}
