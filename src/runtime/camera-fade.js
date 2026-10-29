import * as THREE from "../../vendor/three/three.module.min.js";
import { polygonContact } from "../movement-geometry.js?v=220";

// Owns 11 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function boarBodies(){const a=runtime.foes.filter(f=>f?.g&&!f.flee);if(runtime.friend?.g&&!runtime.friend.flee&&!runtime.friend.windFlightUntil)a.push(runtime.friend);for(const f of runtime.exitHelpers)if(f.g?.parent&&!f.flee&&!a.includes(f))a.push(f);return a}

function boarRadius(b){return b?.isBoss?2.45:1.02}

// v124: transparency has two independent causes: camera occlusion and being inside Dad's house.
// Materials are cloned per mesh so fading one rock/house never fades every object sharing that material.
function ensureFadeMaterial(o){
 if(!o?.isMesh||!o.material)return;
 if(!o.userData._fadeOwnMaterial){o.material=o.material.clone();o.userData._fadeOwnMaterial=true}
 if(o.userData._fadeBaseOpacity===undefined){o.userData._fadeBaseOpacity=o.material.opacity??1;o.userData._fadeBaseTransparent=!!o.material.transparent;o.userData._fadeBaseDepthWrite=o.material.depthWrite!==false}
}

function applyObjectFade(o){
 if(!o?.isMesh||!o.material)return;ensureFadeMaterial(o);
 const cameraFade=o.userData._cameraFade?0.18:1,houseFade=o.userData._houseFade?0.16:1;
 // Dad's warm window must stay bright and readable even while the walls fade.
 const k=(o.userData.familyWindow||o.userData.solidInterior)?1:Math.min(cameraFade,houseFade),base=o.userData._fadeBaseOpacity;
 o.material.opacity=base*k;o.material.transparent=k<1||o.userData._fadeBaseTransparent;o.material.depthWrite=k<1?false:o.userData._fadeBaseDepthWrite;
}

function setObjectCameraFade(root,on){if(!root)return;root.traverse(o=>{if(o.isMesh){o.userData._cameraFade=!!on;applyObjectFade(o)}})}

function setHouseTransparent(h,on){if(!h)return;h.traverse(o=>{if(o.isMesh){o.userData._houseFade=!!on;applyObjectFade(o)}})}

function familyHouseRevealAt(x,z){
 if(runtime.level!==3||!runtime.familyHideout?.visible)return false;
 // v124: use a generous local interior/threshold zone. This triggers as Timur crosses the real shell,
 // not only after he reaches a narrow point deeper inside the scaled house.
 runtime.familyHideout.updateWorldMatrix(true,true);const q=runtime.familyHideout.worldToLocal(new THREE.Vector3(x,0,z));
 const doorway=Math.abs(q.x)<1.18&&q.z>1.18&&q.z<2.82;
 const insideShell=q.x>-2.28&&q.x<2.28&&q.z>-2.18&&q.z<2.48;
 return doorway||insideShell;
}

function setHomeHouseCutaway(on){
 if(!runtime.personalHouse||runtime.home.stage<3)return;
 const p=runtime.personalHouse.userData.cutawayWalls;setHouseTransparent(runtime.personalHouse,false);
 for(const side of ['front','back','left','right'])for(const m of p[side])m.visible=true;p.roof.visible=true;
 if(!on)return;
 runtime.personalHouse.updateWorldMatrix(true,true);const c=runtime.personalHouse.worldToLocal(runtime.camera.position.clone());
 const side=Math.abs(c.x)>Math.abs(c.z)?(c.x<0?'left':'right'):(c.z>0?'front':'back');
 for(const m of p[side])m.visible=false;p.roof.visible=false;
}

function setDadHouseCutaway(on){
 const p=runtime.familyHideout?.userData?.cutawayWalls;if(!p)return;
 for(const side of ['front','back','left','right'])for(const m of p[side])m.visible=true;p.roof.visible=true;
 if(!on)return;
 runtime.familyHideout.updateWorldMatrix(true,true);const c=runtime.familyHideout.worldToLocal(runtime.camera.position.clone());
 const side=Math.abs(c.x)>Math.abs(c.z)?(c.x<0?'left':'right'):(c.z>0?'front':'back');
 for(const m of p[side])m.visible=false;p.roof.visible=false;
}

function updateFamilyHouseReveal(){
 const nowInside=familyHouseRevealAt(runtime.boy.position.x,runtime.boy.position.z);
 if(nowInside!==runtime.insideFamilyHouse){runtime.insideFamilyHouse=nowInside;if(nowInside)runtime.notice('🏠 Вошёл в дом — открылась сторона дома, теперь братика видно внутри!')}
 const door=runtime.familyHideout.localToWorld(new THREE.Vector3(0,0,2.3)),nearBoy=Math.hypot(runtime.boy.position.x-door.x,runtime.boy.position.z-door.z)<4.5,nearFriend=runtime.friend?.g&&Math.hypot(runtime.friend.g.position.x-door.x,runtime.friend.g.position.z-door.z)<4.5;runtime.familyDoor.userData.closed=!(nearBoy||nearFriend||nowInside);runtime.familyDoorHinge.rotation.y=runtime.familyDoor.userData.closed?0:-Math.PI*.48;
 runtime.familyWindow.material.opacity=nowInside?.18:1;runtime.familyWindow.material.depthWrite=false;
 setDadHouseCutaway(nowInside);
}

function houseBlockAt(x,z,pad=.45,allowJump=false){
 if(allowJump)for(const box of runtime.houseLintelContacts(x,z,pad)){const ground=runtime.terrainHeightAt(x,z);if(runtime.py<box.max.y-ground&&runtime.py+runtime.playerPhysicalHeight()>box.min.y-ground+.01)return true;}
 for(const wall of runtime.wallGeometry()){
  const feet=runtime.py+runtime.terrainHeightAt(x,z);if(wall.exit&&(feet>=wall.box.max.y-.015||feet+runtime.playerPhysicalHeight()<=wall.box.min.y+.01))continue;
  const top=wall.shell&&wall.root.userData.enterable?Math.max(wall.box.max.y,wall.roofTop):wall.box.max.y;
  if(allowJump&&!runtime.mountedFriend&&runtime.py>=top-.015)continue;
  if(polygonContact(wall.polygon,x,z,pad))return true;
 }
 return false;
}
 return {
  bindings:{
"boarBodies":{get:()=>boarBodies},
"boarRadius":{get:()=>boarRadius},
"ensureFadeMaterial":{get:()=>ensureFadeMaterial},
"applyObjectFade":{get:()=>applyObjectFade},
"setObjectCameraFade":{get:()=>setObjectCameraFade},
"setHouseTransparent":{get:()=>setHouseTransparent},
"familyHouseRevealAt":{get:()=>familyHouseRevealAt},
"setHomeHouseCutaway":{get:()=>setHomeHouseCutaway},
"setDadHouseCutaway":{get:()=>setDadHouseCutaway},
"updateFamilyHouseReveal":{get:()=>updateFamilyHouseReveal,set:value=>{updateFamilyHouseReveal=value}},
"houseBlockAt":{get:()=>houseBlockAt}
  },
  initialize(){

  }
 };

}
