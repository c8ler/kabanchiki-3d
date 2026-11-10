import {FriendTrail,sweptClear} from '../friend-trail.js?v=229';
import { capsuleCapsuleContact } from "../boar-physics.js?v=222";
import { FriendYield } from "../movement-geometry.js?v=222";
import { Knockback } from "../knockback.js?v=222";

// Owns 9 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let friendKnockbackActive,friendYield,friendYieldActive,friendYieldOwner;
 const friendTrail=new FriendTrail();

function bossRepelsFriend(boss,ally){
 if(!ally?.g||ally.flee)return;
 ally.knockback=new Knockback(ally.g.position.x-boss.g.position.x,ally.g.position.z-boss.g.position.z);
 ally.graze=0;friendYield.reset();friendYieldActive=false;runtime.friendAttack=Math.max(runtime.friendAttack,1.25);ally.b.rotation.x=.42;
}

function moveRecoilBoar(ally,dx,dz){
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.045)),sx=dx/count,sz=dz/count;
 for(let i=0;i<count;i++){
  const x=ally.g.position.x+sx,z=ally.g.position.z+sz;
  if(runtime.boarSceneryBlockedAt(ally,x,z))break;
  // Existing contact with the boss may shrink while the friend moves away from it.
  const oldPlayer=runtime.boarPlayerContact(ally),newPlayer=runtime.boarPlayerContact(ally,x,z);
  if(newPlayer&&(!oldPlayer||newPlayer.depth>oldPlayer.depth+.00001))break;
  const body=runtime.boarBody(ally,x,z),oldBody=runtime.boarBody(ally);let blocked=false;
  for(const other of runtime.boarBodies()){if(other===ally)continue;const hit=capsuleCapsuleContact(body,runtime.boarBody(other)),old=capsuleCapsuleContact(oldBody,runtime.boarBody(other));if(hit&&(!old||hit.depth>old.depth+.00001)){blocked=true;break}}
  if(blocked)break;ally.g.position.x=x;ally.g.position.z=z;
 }
}

function updateFriendKnockback(dt){
 if(!runtime.friend?.g||runtime.friend.flee||!runtime.friend.knockback?.active)return false;
 const recoil=runtime.friend.knockback,step=recoil.step(dt),facing=runtime.friend.g.rotation.y;
 if(runtime.mountedFriend){
  // The rider and mount travel together through the existing swept terrain solver.
  runtime.movePlayerCollision(step.dx,step.dz);runtime.friend.g.position.x=runtime.boy.position.x;runtime.friend.g.position.z=runtime.boy.position.z;
 }else{
  const distance=Math.hypot(step.dx,step.dz);
  if(distance>0)moveRecoilBoar(runtime.friend,step.dx,step.dz);
  runtime.friend.g.rotation.y=facing;
 }
 runtime.friend.b.rotation.x=.42*(1-step.progress);runtime.friend.b.position.y=Math.sin(step.progress*Math.PI)*.28;
 if(!recoil.active){runtime.friend.knockback=null;runtime.friend.b.position.y=0}
 return true;
}

function updateFriendYield(dx,dz,dt){
 friendYieldActive=false;if(!runtime.friend?.g||runtime.friend.flee||runtime.friend.exitBreaking||runtime.friend.windFlightUntil||runtime.friend.knockback?.active||friendKnockbackActive||runtime.mountedFriend||runtime.py>.58){friendYield.reset();return}
 if(friendYieldOwner!==runtime.friend){friendYieldOwner=runtime.friend;friendYield.reset()}
 const ox=runtime.friend.g.position.x,oz=runtime.friend.g.position.z;
 const canMove=(x,z)=>Math.abs(x)<42.7&&Math.abs(z)<42.7&&!runtime.boarSceneryBlockedAt(runtime.friend,x,z)&&!runtime.blockedByBoar(x,z,runtime.friend,.72);
 const result=friendYield.step({x:ox,z:oz,playerX:runtime.boy.position.x,playerZ:runtime.boy.position.z,dx,dz,dt,canMove});
 friendYieldActive=result.active&&result.moved;
 if(result.moved){runtime.friend.g.position.x=result.x;runtime.friend.g.position.z=result.z;const target=Math.atan2(result.x-ox,result.z-oz),angle=Math.atan2(Math.sin(target-runtime.friend.g.rotation.y),Math.cos(target-runtime.friend.g.rotation.y));runtime.friend.g.rotation.y+=angle*(1-Math.exp(-6*dt));runtime.friend.graze=0;runtime.friend.b.rotation.x*=Math.exp(-10*dt);runtime.friend.b.position.y*=Math.exp(-10*dt)}
}


function compactFriend(f,on){
 if(!f?.g||!!f.passageMode===on)return;f.passageMode=on;f.passageRadius=runtime.PLAYER_RADIUS;f.passageCooldown=.8;f.tightEscape=null;
 if(f.b){f.passageVisual??={x:f.b.scale.x,z:f.b.scale.z};f.b.scale.x=f.passageVisual.x*(on?.42:1);f.b.scale.z=f.passageVisual.z*(on?.20:1)}
}
function prepareFriendPassage(f,tx,tz,dt){
 if(!f?.g||!f.followManaged)return;
 f.passageCooldown=Math.max(0,(f.passageCooldown||0)-dt);
 if(!f.passageMode){if(runtime.boarSceneryBlockedAt(f,f.g.position.x,f.g.position.z)||f.route?.stuck>.35)compactFriend(f,true);return}
 if(f.passageCooldown>0)return;f.passageCooldown=.35;
 const p=f.g.position,d=Math.hypot(tx-p.x,tz-p.z),q=d>.01?{x:p.x+(tx-p.x)/d*2,z:p.z+(tz-p.z)/d*2}:p,wide=runtime.companionNavBlocked(f,true);
 if(wide(p.x,p.z)||!sweptClear(p,q,wide))return;
 f.passageMode=false;const safe=!runtime.boarSceneryBlockedAt(f,p.x,p.z)&&!runtime.blockedByBoar(p.x,p.z,f)&&(runtime.mountedFriend||!runtime.boarPlayerContact(f));f.passageMode=true;
 if(safe)compactFriend(f,false);
}
function resetFriendTrail(){friendTrail.reset(runtime.level)}
function updateFriendTrail(dt){
 if(friendTrail.level!==runtime.level)resetFriendTrail();
 if(runtime.py<.6&&!runtime.mountedFriend&&!runtime.hurricaneCarry&&!runtime.islandFlight.active)friendTrail.record(runtime.boy.position,runtime.level);
 if(runtime.friend?.g){runtime.friend.followManaged=true;if(runtime.friend.passageMode)prepareFriendPassage(runtime.friend,runtime.boy.position.x,runtime.boy.position.z,dt)}
}
function friendFollowingNeeded(){
 if(!runtime.friend?.g)return false;const a=runtime.friend.g.position,b=runtime.boy.position;
 return Math.hypot(a.x-b.x,a.z-b.z)>2.8||!runtime.clearWallLine({x:a.x,y:a.y+.8,z:a.z},{x:b.x,y:b.y+.8,z:b.z});
}
function moveFriendAroundObstacles(tx,tz,speed,dt){
 const f=runtime.friend;if(!f?.g)return false;f.followManaged=true;prepareFriendPassage(f,tx,tz,dt);
 const p=f.g.position,key=runtime.worldEpoch+':'+runtime.craftWorld.epoch+':'+runtime.familyDoor?.userData.closed+':'+runtime.homeParts?.door?.userData.closed+':'+Math.round(p.y*5);
 f.followNavAge=(f.followNavAge||0)+dt;const changed=key!==f.followNavKey;
 if(changed||!f.followNav||f.followNavAge>.35){f.followNav=runtime.companionNavBlocked(f);f.followNavKey=key;f.followNavAge=0}
 f.trailThink=(f.trailThink||0)-dt;if(changed||f.trailThink<=0||(f.trailTarget&&Math.hypot(p.x-f.trailTarget.x,p.z-f.trailTarget.z)<.16)){f.trailTarget=friendTrail.target(p,{x:tx,z:tz},f.followNav);f.trailThink=.18}
 const target=f.trailTarget?{...f.trailTarget}:null,d=Math.hypot(tx-p.x,tz-p.z);
 if(Math.hypot(tx-runtime.boy.position.x,tz-runtime.boy.position.z)<.1){
  speed=Math.max(speed,Math.min(8.2,5.4+Math.max(0,d-5)*.35));
  if(target&&Math.hypot(target.x-tx,target.z-tz)<.01&&d>2.7){target.x=tx-(tx-p.x)/d*2.7;target.z=tz-(tz-p.z)/d*2.7}
 }
 f.friendTrailTarget=target;f.graze=0;
 try{return runtime.moveBoarToward(f,tx,tz,speed,dt)}finally{f.friendTrailTarget=null}
}

 return {
  bindings:{
"friendTrail":{get:()=>friendTrail},
"compactFriend":{get:()=>compactFriend},
"prepareFriendPassage":{get:()=>prepareFriendPassage},
"resetFriendTrail":{get:()=>resetFriendTrail},
"updateFriendTrail":{get:()=>updateFriendTrail},
"friendFollowingNeeded":{get:()=>friendFollowingNeeded},
"friendKnockbackActive":{get:()=>friendKnockbackActive,set:value=>{friendKnockbackActive=value}},
"bossRepelsFriend":{get:()=>bossRepelsFriend},
"moveRecoilBoar":{get:()=>moveRecoilBoar},
"updateFriendKnockback":{get:()=>updateFriendKnockback},
"friendYield":{get:()=>friendYield},
"friendYieldActive":{get:()=>friendYieldActive,set:value=>{friendYieldActive=value}},
"friendYieldOwner":{get:()=>friendYieldOwner,set:value=>{friendYieldOwner=value}},
"updateFriendYield":{get:()=>updateFriendYield},
"moveFriendAroundObstacles":{get:()=>moveFriendAroundObstacles}
  },
  initialize(){


/* init:let */ friendKnockbackActive = false;

// v133: when the friendly boar cannot follow Timur directly, probe a fan of detours and keep
// the best free heading. This prevents it from repeatedly pushing into the same tree/rock/house.
/* init:const */ friendYield = new FriendYield();

/* init:let */ friendYieldActive = false;
/* init:let */ friendYieldOwner = null;
  }
 };

}
