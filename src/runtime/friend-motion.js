import { capsuleCapsuleContact } from "../boar-physics.js?v=215";
import { FriendYield } from "../movement-geometry.js?v=215";
import { Knockback } from "../knockback.js?v=215";

// Owns 9 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let friendKnockbackActive,friendYield,friendYieldActive,friendYieldOwner;

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
 friendYieldActive=result.active;
 if(result.moved){runtime.friend.g.position.x=result.x;runtime.friend.g.position.z=result.z;const target=Math.atan2(result.x-ox,result.z-oz),angle=Math.atan2(Math.sin(target-runtime.friend.g.rotation.y),Math.cos(target-runtime.friend.g.rotation.y));runtime.friend.g.rotation.y+=angle*(1-Math.exp(-6*dt));runtime.friend.graze=0;runtime.friend.b.rotation.x*=Math.exp(-10*dt);runtime.friend.b.position.y*=Math.exp(-10*dt)}
}

function moveFriendAroundObstacles(tx,tz,speed,dt){if(!runtime.friend?.g)return false;return runtime.moveBoarToward(runtime.friend,tx,tz,speed,dt)}
 return {
  bindings:{
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
