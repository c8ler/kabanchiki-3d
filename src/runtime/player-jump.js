import { BOAR_JUMP_SPEED } from "../tornado-rules.js?v=219";
import { ceilingMotion } from "../player-house-physics.js?v=219";
import { capsuleCircleContact } from "../boar-physics.js?v=219";
import { polygonContact } from "../movement-geometry.js?v=219";
import { riverDepthAt, onRiverBridge, lakeInletDepthAt, lakeDepth } from "../world-surface.js?v=219";
import { CAT_JUMP_SPEED } from "../form-rules.js?v=219";

// Owns 6 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function queuePlayerJump(){
 if(!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown||runtime.win||runtime.life<=0)return false;
 runtime.jump=true;runtime.boy.userData.jumpQueuedAt=performance.now();runtime.boy.userData.jumpFresh=true;return true;
}

function tryPlayerJump(now,supported){
 const fresh=runtime.boy.userData.jumpFresh;runtime.boy.userData.jumpFresh=false;
 if(!runtime.jump||!supported||!fresh&&now-(runtime.boy.userData.jumpQueuedAt||now)>=220)return false;
 runtime.softEffectTone(240,.15,'sine',.018,0,370);if(runtime.waterAt(runtime.boy.position.x,runtime.boy.position.z))runtime.spawnWaterSplash(runtime.boy.position.x,runtime.boy.position.z,1.8);
 runtime.vy=runtime.catFormTime>0?CAT_JUMP_SPEED:runtime.boarFormTime>0?BOAR_JUMP_SPEED:7;runtime.jump=false;return true;
}

function manualRideJump(){if(!runtime.mountedFriend||runtime.rideHop.active)return false;runtime.rideHop.active=true;runtime.rideHop.time=0;runtime.rideHop.height=0;runtime.rideHop.peak=.35;runtime.rideHop.duration=.55;runtime.rideHop.target=null;return true}

function dismountFriendNow(){
 if(!runtime.mountedFriend||runtime.paused||runtime.cinematicRunning)return false;
 const ox=runtime.boy.position.x,oz=runtime.boy.position.z,oldPy=runtime.py,oldVy=runtime.vy,scale=runtime.friend?runtime.boarScale(runtime.friend):1,yaw=runtime.friend?.g.rotation.y||runtime.boy.rotation.y;let landing=null;
 runtime.mountedFriend=false;runtime.py=0;runtime.vy=0;
 for(const radius of [2.6,2.2,1.8,1.4,3.2]){for(const turn of [Math.PI/2,-Math.PI/2,Math.PI,0,.75,-.75,2.4,-2.4]){
  const x=ox+Math.sin(yaw+turn)*radius*scale,z=oz+Math.cos(yaw+turn)*radius*scale;let clear=true;
  for(let i=1;i<=12;i++)if(runtime.playerWorldBlocked(ox+(x-ox)*i/12,oz+(z-oz)*i/12)){clear=false;break}
  if(clear&&!runtime.playerCrossesHouseWall(ox,oz,x,z)&&(!runtime.friend||!runtime.boarPlayerContact(runtime.friend,runtime.friend.g.position.x,runtime.friend.g.position.z,runtime.friend.g.rotation.y,x,z))&&!runtime.blockedByBoar(x,z,runtime.friend,runtime.PLAYER_RADIUS)){landing={x,z};break}
 }if(landing)break}
 runtime.py=oldPy;runtime.vy=oldVy;runtime.dismountLatch.leave(performance.now());runtime.setRiderPose(false);runtime.boy.rotation.z=0;runtime.jump=false;
 if(landing){runtime.boy.position.x=landing.x;runtime.boy.position.z=landing.z}
 if(runtime.friend?.g){runtime.friend.route=null;runtime.friend.graze=0;runtime.settleBoarOnGround(runtime.friend)}
 runtime.rideHop.reset();runtime.rideBump=0;runtime.py=Math.max(runtime.py,runtime.riderSeatHeight());runtime.vy=4;runtime.boy.position.y=runtime.py;runtime.notice('🐗 Тимур спрыгнул с кабанчика.');return true;
}

function movePlayerVertical(dt){
 const prevPy=runtime.py;runtime.vy-=18*dt;let nextPy=runtime.py+runtime.vy*dt;
 const ceiling=ceilingMotion(runtime.py,runtime.vy,nextPy,runtime.houseCeilingAt(runtime.boy.position.x,runtime.boy.position.z),runtime.playerPhysicalHeight());nextPy=ceiling.feet;runtime.vy=ceiling.velocity;
 const support=playerSupportHeightAt(runtime.boy.position.x,runtime.boy.position.z);
 if(runtime.vy<=0&&prevPy>=support-.10&&nextPy<=support){if(runtime.vy<-2){if(runtime.waterAt(runtime.boy.position.x,runtime.boy.position.z))runtime.spawnWaterSplash(runtime.boy.position.x,runtime.boy.position.z,2.8);else runtime.effect('land');}runtime.py=support;runtime.vy=0}else{runtime.py=Math.max(0,nextPy);if(runtime.py===0)runtime.vy=0}
 runtime.boy.position.y=runtime.py;
}


function playerSupportHeightAt(x,z){
 let top=Math.max(runtime.familyFloorAt(x,z),runtime.level===4&&onRiverBridge(x,z)?.28:0);if(runtime.currentSeason==='winter'&&((runtime.level===2&&(lakeDepth(x,z)>0||lakeInletDepthAt(x,z)>0))||(runtime.level===4&&riverDepthAt(x,z)>0)))top=Math.max(top,runtime.level===2?.12:.05);
 // v121: a low branch creates a small physical step while crossing it; it never blocks horizontal motion.
 top=Math.max(top,runtime.branchStepHeightAt(x,z));
 // Rock tops are real platforms: land on them instead of being pushed back to the ground.
 for(const [, , ,m] of runtime.rockPositions){
  if(!m||m.visible===false)continue;const e=runtime.rockEllipse(m,x,z,runtime.PLAYER_RADIUS*.12);
  if(e.n<1)top=Math.max(top,e.q.top);
 }
 // Furniture supports descending feet, while its sides remain solid.
 if(runtime.level===3)for(const q of runtime.wallGeometry())if(q.furniture&&runtime.py>=q.box.max.y-runtime.terrainHeightAt(x,z)-.10&&polygonContact(q.polygon,x,z,runtime.PLAYER_RADIUS*.08))top=Math.max(top,q.box.max.y-runtime.terrainHeightAt(x,z));
 // Each roof section supports only its own physical footprint.
 for(const q of runtime.openingDebrisCapsules())if(runtime.py>=q.top-.1&&capsuleCircleContact(q.body,x,z,runtime.PLAYER_RADIUS*.1))top=Math.max(top,q.top);
 const roofTop=runtime.roofHeightAt(x,z);if(runtime.py>=roofTop-.10)top=Math.max(top,roofTop);
 return Math.max(top,runtime.craftWorld.support(x,z,runtime.py+runtime.terrainHeightAt(x,z))-runtime.terrainHeightAt(x,z));
}
 return {
  bindings:{
"queuePlayerJump":{get:()=>queuePlayerJump},
"tryPlayerJump":{get:()=>tryPlayerJump},
"manualRideJump":{get:()=>manualRideJump},
"dismountFriendNow":{get:()=>dismountFriendNow},
"movePlayerVertical":{get:()=>movePlayerVertical},
"playerSupportHeightAt":{get:()=>playerSupportHeightAt}
  },
  initialize(){

  }
 };

}
