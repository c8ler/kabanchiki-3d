import {exitObstacleShapes} from "../exit-collisions.js?v=222";
import * as THREE from "../../vendor/three/three.module.min.js";
import { polygonContact } from "../movement-geometry.js?v=222";
import { segmentHitsBox } from "../navigation.js?v=222";

// Owns 7 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let wallCacheEpoch,wallCache,doorCollisionCache;
 let exitCacheKey="",exitCache=[];
 function exitWallGeometry(){
  const props=runtime.level===2?runtime.lakeExitProps:runtime.locationExitProps.get(runtime.level),barrier=props?.userData.exitBarrier;
  if(!props?.visible||!barrier)return [];
  const part=barrier.parts[0]?.mesh,key=runtime.worldEpoch+":"+runtime.level+":"+props.userData.breakerTime+":"+barrier.root.userData.open+":"+part?.rotation.x+":"+part?.rotation.y+":"+part?.position.x;
  if(key!==exitCacheKey){exitCacheKey=key;exitCache=exitObstacleShapes(props)}return exitCache;
 }

function doorCollisionBox(door){
 door.updateWorldMatrix(true,false);
 const matrix=door.matrixWorld.elements,cached=doorCollisionCache.get(door);
 if(cached&&cached.frame===runtime.boarCollisionEpoch&&cached.epoch===runtime.worldEpoch&&cached.matrix.every((v,i)=>v===matrix[i]))return cached.box;
 const box=new THREE.Box3().setFromObject(door);
 doorCollisionCache.set(door,{frame:runtime.boarCollisionEpoch,epoch:runtime.worldEpoch,matrix:Array.from(matrix),box});
 return box;
}

function wallGeometry(){if(wallCacheEpoch!==runtime.worldEpoch){wallCacheEpoch=runtime.worldEpoch;wallCache=[];if(runtime.level===3)for(const h of runtime.houseObjects){const walls=h.userData.cutawayWalls,objects=walls?[...walls.front,...walls.back,...walls.left,...walls.right,...(h===runtime.familyHideout?runtime.houseFurnishings.children:h===runtime.personalHouse&&runtime.home.stage>=3?runtime.homeParts.furnishings.children:[])]:[h];for(const o of objects){if(o.userData.doorLintel)continue;o.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(o);const shell=!!walls&&['front','back','left','right'].some(side=>walls[side].includes(o));const roofTop=walls?.roof?new THREE.Box3().setFromObject(walls.roof).max.y:box.max.y;wallCache.push({root:h,box,shell,roofTop,furniture:!!o.userData.furniture||h===runtime.personalHouse&&runtime.homeParts.furnishings.children.includes(o),polygon:[{x:box.min.x,z:box.min.z},{x:box.max.x,z:box.min.z},{x:box.max.x,z:box.max.z},{x:box.min.x,z:box.max.z}]})}}}const result=wallCache.filter(q=>q.root.visible);if(runtime.level===3&&runtime.familyHideout.visible&&runtime.familyDoor.userData.closed){const box=doorCollisionBox(runtime.familyDoor);result.push({root:runtime.familyHideout,box,polygon:[{x:box.min.x,z:box.min.z},{x:box.max.x,z:box.min.z},{x:box.max.x,z:box.max.z},{x:box.min.x,z:box.max.z}]})}if(runtime.level===3&&runtime.home.stage>=2&&runtime.personalHouse?.visible&&runtime.homeParts.door.userData.closed){const box=doorCollisionBox(runtime.homeParts.door);result.push({root:runtime.personalHouse,box,polygon:[{x:box.min.x,z:box.min.z},{x:box.max.x,z:box.min.z},{x:box.max.x,z:box.max.z},{x:box.min.x,z:box.max.z}]});}return result.concat(exitWallGeometry())}

function clearWallLine(a,b){const start={x:a.x,y:a.y??.8,z:a.z},end={x:b.x,y:b.y??.8,z:b.z};if([...wallGeometry(),...runtime.craftWorld.walls()].some(w=>segmentHitsBox(start,end,w.box)))return false;if(runtime.level===3&&runtime.familyHideout.visible&&runtime.familyDoor.userData.closed){const box=new THREE.Box3().setFromObject(runtime.familyDoor);if(segmentHitsBox(start,end,box))return false}return true}

function boarWallContacts(f,x=f.g.position.x,z=f.g.position.z,yaw=f.g.rotation.y){const body=runtime.boarBody(f,x,z,yaw),contacts=[];for(const w of [...wallGeometry(),...runtime.craftWorld.walls().map(w=>({...w,crafted:true}))]){if(f.flee&&(w.exit||w.crafted))continue;const feet=f.g===runtime.boy&&runtime.mountedFriend?runtime.terrainHeightAt(x,z)+runtime.rideHop.height:(f.feet??f.g.position.y);if((w.exit||w.crafted)&&(feet>=w.box.max.y-.015||feet+1.6*runtime.boarScale(f)<=w.box.min.y+.01))continue;const top=w.shell&&w.root.userData.enterable?Math.max(w.box.max.y,w.roofTop):w.box.max.y;if(f.playerControlled&&f.feet>=top-.015)continue;const pad=body.r+.04;if(Math.max(body.ax,body.bx)+pad<w.box.min.x||Math.min(body.ax,body.bx)-pad>w.box.max.x||Math.max(body.az,body.bz)+pad<w.box.min.z||Math.min(body.az,body.bz)-pad>w.box.max.z)continue;for(const [px,pz] of [[body.ax,body.az],[(body.ax+body.bx)/2,(body.az+body.bz)/2],[body.bx,body.bz]]){const hit=polygonContact(w.polygon,px,pz,body.r+.04);if(hit)contacts.push(hit)}}return contacts}
 return {
  bindings:{
"wallCacheEpoch":{get:()=>wallCacheEpoch,set:value=>{wallCacheEpoch=value}},
"wallCache":{get:()=>wallCache,set:value=>{wallCache=value}},
"doorCollisionCache":{get:()=>doorCollisionCache},
"doorCollisionBox":{get:()=>doorCollisionBox},
"wallGeometry":{get:()=>wallGeometry},
"clearWallLine":{get:()=>clearWallLine},
"boarWallContacts":{get:()=>boarWallContacts}
  },
  initialize(){

/* init:let */ wallCacheEpoch = -1;
/* init:let */ wallCache = [];

/* init:const */ doorCollisionCache = new WeakMap();
  }
 };

}
