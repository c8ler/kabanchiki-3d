import { forestEdgeLimit, forestEdgeBlocked } from "../world-interactions.js?v=222";
import { BOAR_WADING_DEPTH } from "../boar-water.js?v=222";
import { capsuleCircleContact, capsuleCapsuleContact } from "../boar-physics.js?v=222";
import { polygonContact } from "../movement-geometry.js?v=222";
import { onRiverBridge } from "../world-surface.js?v=222";
import { forestExitBlocked } from "../opening-adventure.js?v=222";

// Owns 8 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let companionChecks;

function companionValid(f,x=f.g.position.x,z=f.g.position.z,yaw=f.g.rotation.y){return !boarSceneryBlockedAt(f,x,z,yaw)}

function settleBoarOnGround(f){
 const {x,z}=f.g.position;
 // Absolute world support; exit helpers and actors skipped by distance LOD
 // must never accumulate last frame's elevation.
 const bridge=runtime.level===4&&onRiverBridge(x,z)?.28:0;
 f.g.position.y=runtime.terrainHeightAt(x,z)+Math.max(runtime.familyFloorAt(x,z),bridge)-runtime.lakeDepthAt(x,z)-runtime.puddleDepthAt(x,z);
}

function repairCompanion(f,force=false){if(!f?.g||f.flee)return;const now=performance.now();if(!force&&now-(f.g.userData.lastRecoveryAt||0)<200)return;f.g.userData.lastRecoveryAt=now;companionChecks.checks++;if(companionValid(f)){f.lastSafe={x:f.g.position.x,z:f.g.position.z,yaw:f.g.rotation.y};return}const current={x:f.g.position.x,z:f.g.position.z};let safe=null;for(let r=.15;r<5&&!safe;r+=.25)for(let i=0;i<24;i++){const a=i/24*Math.PI*2,x=current.x+Math.sin(a)*r,z=current.z+Math.cos(a)*r;if(companionValid(f,x,z)){safe={x,z};break}}if(!safe&&f.lastSafe&&companionValid(f,f.lastSafe.x,f.lastSafe.z,f.lastSafe.yaw))safe=f.lastSafe;if(safe){f.g.position.x=safe.x;f.g.position.z=safe.z;if(Number.isFinite(safe.yaw))f.g.rotation.y=safe.yaw;f.route=null;f.tightEscape=null;f.escapeRetry=0;f.navigation=null;f.lastSafe={x:safe.x,z:safe.z,yaw:f.g.rotation.y};companionChecks.repairs++}}

function companionNavBlocked(f){
 const traffic=f.isMinion?runtime.boarBodies().filter(b=>b!==f&&!b.flee).map(b=>runtime.boarBody(b)):[];
 // Each search is synchronous: snapshot dynamic gates and inflated geometry once,
 // rather than rebuilding the same shapes for every A* point and swept edge.
 const scale=runtime.boarScale(f),radius=1.65*scale+.05,
 trees=runtime.treeObjects.filter(t=>t.visible).map(t=>{const m=t.children.find(m=>m.userData.treeSolid);if(!m)return null;const q=runtime.treeTrunkShape(m);return {...q,r2:(q.r+1.65*scale)**2}}).filter(Boolean),
 rocks=runtime.rockPositions.filter(q=>q[3]?.visible!==false&&q[3]?.parent?.visible!==false).map(q=>{const s=runtime.rockShape(q[3]);return {...s,c:Math.cos(s.yaw),sn:Math.sin(s.yaw),ix:1/(s.ax+radius)**2,iz:1/(s.az+radius)**2}}),
 walls=runtime.wallGeometry().filter(w=>!w.exit||f.g.position.y<w.box.max.y-.015&&f.g.position.y+1.6*scale>w.box.min.y+.01),mountains=runtime.level===5?runtime.mountainObstacles.filter(q=>q[3]?.parent?.visible!==false).map(q=>{const polygon=runtime.mountainFootprint(q[3]);return {polygon,minX:Math.min(...polygon.map(p=>p.x)),maxX:Math.max(...polygon.map(p=>p.x)),minZ:Math.min(...polygon.map(p=>p.z)),maxZ:Math.max(...polygon.map(p=>p.z))}}):[],
 debris=runtime.openingDebrisCapsules().filter(q=>!q.closed||!f.exitBreaking),
 exitReady=runtime.locationExit?runtime.locationExitReady():false,lakeReady=runtime.level===2?runtime.lakeExitReady():false,
 avoidsWater=!runtime.controlledSwimmer(f)&&!f.waterEscaping;
 return (x,z)=>{
  if(traffic.some(body=>capsuleCircleContact(body,x,z,radius+.08)))return true;
  if(runtime.locationExit&&forestExitBlocked(x,z+4,.7*scale,exitReady))return true;
  if(runtime.level===2&&forestExitBlocked(x,z+4,.7*scale,lakeReady))return true;
  if(runtime.level===1&&runtime.opening&&forestEdgeBlocked(x,z,.7*scale,runtime.opening.passageOpen))return true;
  for(const q of debris)if(capsuleCircleContact(q.body,x,z,radius))return true;
  if(f.exitBreaking&&Math.hypot(x-runtime.boy.position.x,z-runtime.boy.position.z)<runtime.boarRadius(f)+runtime.PLAYER_RADIUS+.7)return true;
  if(Math.abs(x)>42||Math.abs(z)>42||(avoidsWater&&runtime.boarWaterDepth(f,x,z)>BOAR_WADING_DEPTH))return true;
  for(const t of trees)if((x-t.x)**2+(z-t.z)**2<t.r2)return true;
  for(const q of rocks){const dx=x-q.cx,dz=z-q.cz,lx=dx*q.c-dz*q.sn,lz=dx*q.sn+dz*q.c;if(lx*lx*q.ix+lz*lz*q.iz<1)return true}
  for(const w of walls){if(x+radius<w.box.min.x||x-radius>w.box.max.x||z+radius<w.box.min.z||z-radius>w.box.max.z)continue;if(polygonContact(w.polygon,x,z,radius))return true}
  return mountains.some(q=>x+radius>=q.minX&&x-radius<=q.maxX&&z+radius>=q.minZ&&z-radius<=q.maxZ&&polygonContact(q.polygon,x,z,radius))||(runtime.level===6&&runtime.lairObstacles.some(([px,pz,r,o])=>o.visible&&Math.hypot(x-px,z-pz)<r+radius));
 };
}

function boarSceneryBlockedAt(f,x,z,yaw=f.g.rotation.y){if(runtime.craftWorld.blocked(x,z,f.g.position.y,runtime.boarRadius(f),1.5*runtime.boarScale(f)))return true;
  if(f.flee)return runtime.boarWallContacts(f,x,z,yaw).length>0;
 if(runtime.locationExit&&forestExitBlocked(x,z+4,.7*runtime.boarScale(f),runtime.locationExitReady()))return true;
 if(runtime.level===2&&forestExitBlocked(x,z+4,.7*runtime.boarScale(f),runtime.lakeExitReady()))return true;
 if(runtime.level===1&&runtime.opening&&forestEdgeBlocked(x,z,.7*runtime.boarScale(f),runtime.opening.passageOpen))return true;
 if(Math.abs(x)>43.1||Math.abs(z)>43.1||runtime.boarTreeContacts(f,x,z,yaw).length||!runtime.boarLakeStepAllowed(f,x,z))return true;
 if(runtime.boarWallContacts(f,x,z,yaw).length)return true;
 const body=runtime.boarBody(f,x,z,yaw);if(runtime.openingDebrisCapsules().some(q=>(!q.closed||!f.exitBreaking)&&capsuleCapsuleContact(body,q.body)))return true;
 for(const [px,pz] of [[body.ax,body.az],[(body.ax+body.bx)/2,(body.az+body.bz)/2],[body.bx,body.bz]]){
  if(runtime.rockPositions.some(([,,,m])=>m?.visible!==false&&((runtime.mountedFriend&&(f===runtime.friend||f.g===runtime.boy))?runtime.rockFootprintHit(m,px,pz,body.r,false):runtime.rockEllipse(m,px,pz,body.r).n<1))||runtime.mountainBlockedAt(px,pz,body.r))return true;
 }
 return runtime.level===6&&runtime.lairObstacles.some(([px,pz,r,g])=>g.visible&&Math.hypot(x-px,z-pz)<r+body.r);
}

function resolveBoarClearance(f,protectPlayer=true){
  if(f.flee)return;
 if(runtime.locationExit&&!runtime.locationExitReady())f.g.position.z=Math.max(f.g.position.z,-37.2+.7*runtime.boarScale(f));
 if(runtime.level===2&&!runtime.lakeExitReady())f.g.position.z=Math.max(f.g.position.z,-37.2+.7*runtime.boarScale(f));
 if(runtime.level===1&&runtime.opening&&forestEdgeBlocked(f.g.position.x,f.g.position.z,.7*runtime.boarScale(f),runtime.opening.passageOpen))f.g.position.z=forestEdgeLimit(f.g.position.x,.7*runtime.boarScale(f));
 if(f.flee){for(let pass=0;pass<4;pass++){const contacts=runtime.boarWallContacts(f);if(!contacts.length)break;for(const hit of contacts){f.g.position.x+=hit.nx*(hit.depth+.004);f.g.position.z+=hit.nz*(hit.depth+.004)}}return}
 for(let pass=0;pass<(f.playerControlled?12:4);pass++){
  const contacts=[...runtime.boarTreeContacts(f),...runtime.boarWallContacts(f)];const playerHit=protectPlayer?runtime.boarPlayerContact(f):null;if(playerHit)contacts.push(playerHit);
  if(!contacts.length)break;
  const moves=f.playerControlled?contacts.filter(hit=>!runtime.playerCrossesHouseWall(f.g.position.x,f.g.position.z,f.g.position.x+hit.nx*(hit.depth+.004),f.g.position.z+hit.nz*(hit.depth+.004))).sort((a,b)=>b.depth-a.depth).slice(0,1):contacts;
  if(!moves.length)break;
  for(const hit of moves){f.g.position.x+=hit.nx*(hit.depth+.004);f.g.position.z+=hit.nz*(hit.depth+.004)}
 }

}

function blockedByBoar(x,z,ignore=null,r=1.03,yaw=ignore?.g.rotation.y){
 const own=ignore?runtime.boarBody(ignore,x,z,yaw):null;if(own)own.r+=.025;
 for(const b of runtime.boarBodies()){if(b===ignore)continue;if(own?capsuleCapsuleContact(own,runtime.boarBody(b)):capsuleCircleContact(runtime.boarBody(b),x,z,r))return true}return false
}
 return {
  bindings:{
"companionChecks":{get:()=>companionChecks},
"companionValid":{get:()=>companionValid},
"settleBoarOnGround":{get:()=>settleBoarOnGround},
"repairCompanion":{get:()=>repairCompanion},
"companionNavBlocked":{get:()=>companionNavBlocked},
"boarSceneryBlockedAt":{get:()=>boarSceneryBlockedAt},
"resolveBoarClearance":{get:()=>resolveBoarClearance},
"blockedByBoar":{get:()=>blockedByBoar}
  },
  initialize(){

/* init:const */ companionChecks = {checks:0,repairs:0,replans:0};
  }
 };

}
