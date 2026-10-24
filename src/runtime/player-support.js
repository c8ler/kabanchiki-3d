import { PLAYER_HEIGHTS } from "../player-house-physics.js?v=217";
import { forestEdgeBlocked } from "../world-interactions.js?v=217";
import { HOME_SITE } from "../home-construction.js?v=217";
import * as THREE from "../../vendor/three/three.module.min.js";
import { bridgeRailBlocked } from "../world-surface.js?v=217";
import { forestExitBlocked } from "../opening-adventure.js?v=217";

// Owns 8 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function playerWorldBlocked(x,z,pad=0){
 if(runtime.locationExit&&forestExitBlocked(x,z+4,runtime.mountedFriend?.7:runtime.PLAYER_RADIUS+pad,runtime.locationExitReady()))return true;
 if(x<-43.1||x>43.1||z<-43.1||z>43.1)return true;
 if(runtime.level===2&&forestExitBlocked(x,z+4,runtime.mountedFriend?.7:runtime.PLAYER_RADIUS+pad,runtime.lakeExitReady()))return true;
 if(runtime.level===1&&runtime.opening&&forestEdgeBlocked(x,z,runtime.mountedFriend?.7:runtime.PLAYER_RADIUS+pad,runtime.opening.passageOpen))return true;
 const rr=runtime.PLAYER_RADIUS+pad;if(runtime.helperBlocksPlayer(x,z)||runtime.debrisBlocks(x,z,rr))return true;
 // v165: on foot the bridge rail blocks at deck height, but a normal jump can clear it.
 if(runtime.level===4&&(runtime.mountedFriend||runtime.py<.62)&&bridgeRailBlocked(x,z,runtime.mountedFriend?.86:rr))return true;
 if(runtime.craftWorld.blocked(x,z,runtime.terrainHeightAt(x,z)+runtime.py,rr,playerPhysicalHeight()))return true;if(runtime.catLife.blocks(x,z,runtime.py,rr))return true;if(runtime.circleHitsTreeGeometry(x,z,rr))return true;
 if((runtime.mountedFriend||runtime.boarFormTime>0)&&(runtime.boarTreeContacts(runtime.playerBoarBody(),x,z).length||!runtime.boarLakeStepAllowed(runtime.playerBoarBody(),x,z)))return true;
 if(runtime.mountainBlockedAt(x,z,runtime.mountedFriend?runtime.MOUNTED_ROCK_RADIUS:rr))return true;
 if(runtime.logObstacles.some(o=>runtime.logFootprintHit(o,x,z,rr,true)))return true;
 if(runtime.rockPositions.some(([, , ,m])=>runtime.rockFootprintHit(m,x,z,runtime.ROCK_PLAYER_RADIUS+pad,true)))return true;
 if(runtime.solidCircles().some(o=>o.type!=='tree'&&o.type!=='rock'&&Math.hypot(x-o.x,z-o.z)<o.r+rr))return true;
 if(runtime.houseBlockAt(x,z,rr,true))return true;
 return false
}

function roofHeightAt(x,z){let top=0;if(runtime.level!==3)return top;for(const h of runtime.houseObjects){if(!h.visible)continue;h.updateWorldMatrix(true,true);for(const m of h.children){if((!m.visible&&!h.userData.enterable)||!m.isMesh||(!m.userData.dadRoof&&(runtime.seasonBaseMaterials.get(m)||m.material).map!==runtime.mats.roof.map))continue;m.geometry.computeBoundingBox();const q=m.worldToLocal(new THREE.Vector3(x,0,z)),b=m.geometry.boundingBox;if(q.x>b.min.x+runtime.PLAYER_RADIUS*.12&&q.x<b.max.x-runtime.PLAYER_RADIUS*.12&&q.z>b.min.z+runtime.PLAYER_RADIUS*.12&&q.z<b.max.z-runtime.PLAYER_RADIUS*.12){const world=m.localToWorld(new THREE.Vector3(q.x,b.max.y,q.z));top=Math.max(top,world.y)}}}return top}

function playerSupportHeightAtNoRock(x,z){return roofHeightAt(x,z)}

function familyFloorAt(x,z){if(runtime.level===3&&runtime.personalHouse?.visible&&runtime.home.stage>0&&Math.abs(x-HOME_SITE.x)<2.35&&Math.abs(z-HOME_SITE.z)<2.35)return .16;if(runtime.level===4&&runtime.locationExitReady()&&Math.abs(x)<5.4&&z<-37&&z>-47)return .37;if(runtime.level!==3||!runtime.familyHideout.visible)return 0;const p=runtime.familyHideout.worldToLocal(new THREE.Vector3(x,0,z));return Math.abs(p.x)<2.4&&p.z>-1.95&&p.z<2.08?.16:0}

function branchStepHeightAt(x,z){
 let top=familyFloorAt(x,z),craftedFloor=runtime.craftWorld.support(x,z,runtime.terrainHeightAt(x,z)+.25)-runtime.terrainHeightAt(x,z);if(craftedFloor<=.25)top=Math.max(top,craftedFloor);if(runtime.level===1&&runtime.forestVisual.visible)for(const o of runtime.logObstacles)if(o?.g?.visible!==false&&runtime.logDistance(o,x,z).distance<o.r+runtime.PLAYER_RADIUS+.015)top=Math.max(top,o.top);return top;
}


function playerPhysicalHeight(){return PLAYER_HEIGHTS[runtime.catFormTime>0?'cat':runtime.boarFormTime>0?'boar':'human']}


function houseLintelContacts(x,z,pad){
 const result=[];if(runtime.level!==3)return result;
 for(const h of runtime.houseObjects){if(!h.visible)continue;for(const m of h.userData.cutawayWalls?.front||[])if(m.userData.doorLintel){const box=runtime.doorCollisionBox(m);if(x+pad>box.min.x&&x-pad<box.max.x&&z+pad>box.min.z&&z-pad<box.max.z)result.push(box);}}
 return result;
}


function houseCeilingAt(x,z){
 if(runtime.level!==3)return Infinity;let ceiling=Infinity;
 for(const h of runtime.houseObjects){
  if(!h.visible||!h.userData.enterable||(h===runtime.personalHouse&&runtime.home.stage<3))continue;
  const roof=h.userData.cutawayWalls?.roof;if(!roof)continue;
  const box=runtime.doorCollisionBox(roof);
  if(x>box.min.x+.05&&x<box.max.x-.05&&z>box.min.z+.05&&z<box.max.z-.05)ceiling=Math.min(ceiling,box.min.y-runtime.terrainHeightAt(x,z));
 }
 for(const box of houseLintelContacts(x,z,runtime.PLAYER_RADIUS*.7))ceiling=Math.min(ceiling,box.min.y-runtime.terrainHeightAt(x,z));
 return ceiling;
}
 return {
  bindings:{
"playerWorldBlocked":{get:()=>playerWorldBlocked},
"roofHeightAt":{get:()=>roofHeightAt},
"playerSupportHeightAtNoRock":{get:()=>playerSupportHeightAtNoRock},
"familyFloorAt":{get:()=>familyFloorAt},
"branchStepHeightAt":{get:()=>branchStepHeightAt},
"playerPhysicalHeight":{get:()=>playerPhysicalHeight},
"houseLintelContacts":{get:()=>houseLintelContacts},
"houseCeilingAt":{get:()=>houseCeilingAt}
  },
  initialize(){

  }
 };

}
