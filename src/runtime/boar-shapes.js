import { boarWaterStep } from "../boar-water.js?v=215";
import { attacksPlayer, capsuleAt, capsuleCircleContact, capsuleCapsuleContact } from "../boar-physics.js?v=215";

// Owns 17 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let boarCollisionEpoch,boarTrunkCache;

function validFamilySpot(f){
 if(runtime.worldObstacleAt(f.x,f.z,.15))return false;
 if(Math.abs(f.x)<3.6)return false; // keep family off the road
 return true;
}

function slideAroundTree(px,pz,nx,nz,r=.82){
 let best=null,bestMove=0;
 for(let i=0;i<runtime.treePositions.length;i++){
  if(runtime.treeObjects[i]?.visible===false)continue;
  const [tx,tz]=runtime.treePositions[i],dx=nx-tx,dz=nz-tz,d=Math.hypot(dx,dz);
  if(d>=r)continue;
  const mx=nx-px,mz=nz-pz,ml=Math.hypot(mx,mz)||1;
  const rx=px-tx,rz=pz-tz,rl=Math.hypot(rx,rz)||1;
  const tangentA={x:-rz/rl,z:rx/rl},tangentB={x:rz/rl,z:-rx/rl};
  const ta=mx/ml*tangentA.x+mz/ml*tangentA.z,tb=mx/ml*tangentB.x+mz/ml*tangentB.z;
  const t=ta>=tb?tangentA:tangentB;
  const speed=.34; // deliberately slow, soft tree slide
  const sx=px+t.x*Math.hypot(mx,mz)*speed,sz=pz+t.z*Math.hypot(mx,mz)*speed;
  if(!runtime.houseBlockAt(sx,sz,.35)&&!runtime.rockPositions.some(([x,z,rr,m])=>m?.visible!==false&&Math.hypot(sx-x,sz-z)<rr+.38)){
    const moved=Math.hypot(sx-px,sz-pz);if(moved>bestMove){bestMove=moved;best={x:sx,z:sz}}
  }
 }
 return best
}

function boarScale(f){return f.bodyScale??Math.max(Math.abs(f.g.scale.x),Math.abs(f.g.scale.z))}

function boarBody(f,x=f.g.position.x,z=f.g.position.z,yaw=f.g.rotation.y){return capsuleAt(x,z,yaw,boarScale(f))}

function playerBoarBody(){return {g:runtime.boy,bodyScale:runtime.boarFormTime>0?.86:(runtime.friend?boarScale(runtime.friend):1),playerControlled:runtime.boarFormTime>0&&!runtime.mountedFriend,feet:runtime.py+runtime.terrainHeightAt(runtime.boy.position.x,runtime.boy.position.z)}}

function playerBodyRadius(){return runtime.boarFormTime>0?.90:runtime.PLAYER_RADIUS}

function boarWaterDepth(f,x=f.g.position.x,z=f.g.position.z){if(runtime.level!==2&&runtime.level!==4)return 0;const body=boarBody(f,x,z);let depth=0;for(const [px,pz] of [[body.ax,body.az],[x,z],[body.bx,body.bz]])for(const [ox,oz] of [[0,0],[body.r,0],[-body.r,0],[0,body.r],[0,-body.r]])depth=Math.max(depth,runtime.lakeDepthAt(px+ox,pz+oz));return depth}

function controlledSwimmer(f){return (runtime.boarFormTime>0&&f.g===runtime.boy)||runtime.mountedFriend&&(f===runtime.friend||f.g===runtime.boy)}

function boarLakeStepAllowed(f,x,z){if(controlledSwimmer(f))return true;return boarWaterStep(boarWaterDepth(f),boarWaterDepth(f,x,z))}

function cachedBoarTrunk(m){let cached=boarTrunkCache.get(m);if(!cached||cached.epoch!==boarCollisionEpoch){cached={epoch:boarCollisionEpoch,shape:runtime.treeTrunkShape(m)};boarTrunkCache.set(m,cached)}return cached.shape}

function boarTreeContacts(f,x=f.g.position.x,z=f.g.position.z,yaw=f.g.rotation.y){
 const body=boarBody(f,x,z,yaw),contacts=[];
 for(const m of runtime.treeSolidMeshes){if(!m?.parent||m.parent.visible===false)continue;const q=cachedBoarTrunk(m),reach=1.65*boarScale(f)+q.r;if(Math.abs(x-q.x)>reach||Math.abs(z-q.z)>reach)continue;const hit=capsuleCircleContact(body,q.x,q.z,q.r);if(hit)contacts.push(hit)}return contacts;
}

function boarPlayerContact(f,x=f.g.position.x,z=f.g.position.z,yaw=f.g.rotation.y,playerX=runtime.boy.position.x,playerZ=runtime.boy.position.z){
 if(!runtime.mountedFriend&&runtime.py>boarScale(f)*1.8+.25)return null;
 const body=boarBody(f,x,z,yaw);
 if(runtime.boarFormTime>0){const player=boarBody(playerBoarBody(),playerX,playerZ);player.r+=.07;return capsuleCapsuleContact(body,player)}
 return capsuleCircleContact(body,playerX,playerZ,runtime.PLAYER_RADIUS+.07)
}

function boarsInContact(a,b,padding=0){const body=boarBody(a);body.r+=padding;return !!capsuleCapsuleContact(body,boarBody(b))}

function boarShouldChasePlayer(f,d){if(f.waterEscaping)return false;if(runtime.level===1&&f.openingBoar&&runtime.opening)return runtime.opening.chasing&&attacksPlayer(runtime.boarFormTime+runtime.catFormTime)&&d>1.05;return attacksPlayer(runtime.boarFormTime+runtime.catFormTime)&&(f.isMinion||d<13)&&d>1.05}

function boarAttackDistance(f){return 1.65*boarScale(f)+playerBodyRadius()+.18}
 return {
  bindings:{
"validFamilySpot":{get:()=>validFamilySpot},
"slideAroundTree":{get:()=>slideAroundTree},
"boarScale":{get:()=>boarScale},
"boarBody":{get:()=>boarBody},
"playerBoarBody":{get:()=>playerBoarBody},
"playerBodyRadius":{get:()=>playerBodyRadius},
"boarWaterDepth":{get:()=>boarWaterDepth},
"controlledSwimmer":{get:()=>controlledSwimmer},
"boarLakeStepAllowed":{get:()=>boarLakeStepAllowed},
"boarCollisionEpoch":{get:()=>boarCollisionEpoch,set:value=>{boarCollisionEpoch=value}},
"boarTrunkCache":{get:()=>boarTrunkCache},
"cachedBoarTrunk":{get:()=>cachedBoarTrunk},
"boarTreeContacts":{get:()=>boarTreeContacts},
"boarPlayerContact":{get:()=>boarPlayerContact},
"boarsInContact":{get:()=>boarsInContact},
"boarShouldChasePlayer":{get:()=>boarShouldChasePlayer},
"boarAttackDistance":{get:()=>boarAttackDistance}
  },
  initialize(){

/* init:let */ boarCollisionEpoch = 0;

/* init:const */ boarTrunkCache = new WeakMap();
  }
 };

}
