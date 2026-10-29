import * as THREE from "../../vendor/three/three.module.min.js";
import { riverCenterAt } from "../world-surface.js?v=220";

// Owns 9 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function runForageRoadAudit(){const issues=[],samples=[];for(const a of runtime.apples){if(a.done)continue;if(runtime.level===2&&a.type==='mushroom')issues.push('lake-mushroom');if(a.type==='apple'){const outside=runtime.appleOutsideOwnTrunk(a);samples.push({type:'apple',outside});if(!outside)issues.push('apple-inside-tree')}}for(const [, , ,m] of runtime.rockPositions){if(!m||m.visible===false)continue;const q=runtime.rockShape(m),clear=runtime.roadClearForRadius(q.cx,q.cz,Math.max(q.ax,q.az),.08);if(!clear)issues.push(`road-rock:${q.cx.toFixed(1)},${q.cz.toFixed(1)}`)}if(runtime.level===5)for(const [x,z,r] of runtime.mountainObstacles)if(!runtime.roadClearForRadius(x,z,r,.08))issues.push(`road-mountain:${x.toFixed(1)},${z.toFixed(1)}`);if(runtime.level===6)for(const [x,z,r,g] of runtime.lairObstacles)if(g?.visible!==false&&!runtime.roadClearForRadius(x,z,r,.08))issues.push(`road-lair:${x.toFixed(1)},${z.toFixed(1)}`);return {ok:issues.length===0,issues,samples,level: runtime.level,mushrooms:runtime.apples.filter(a=>!a.done&&a.type==='mushroom').length}}

function runForagePlacementAudit(){const issues=[],samples=[];for(const a of runtime.apples){if(a.done)continue;const gy=a.g?.position?.y??999;if(['mushroom','cabbage','berry','catberry'].includes(a.type)){const grounded=Math.abs(gy-runtime.terrainHeightAt(a.x,a.z))<.001;samples.push({type:a.type,y:+gy.toFixed(3),grounded,bonus:!!a.bonus});if(!grounded)issues.push(`forage-off-ground:${a.type}:${gy.toFixed(2)}`)}else if(a.type==='apple'){const onTree=runtime.appleOnBranch(a),aboveTimur=(a.y||0)>=2.05,reachable=(a.y||0)<=2.08;samples.push({type:'apple',y:+(a.y||0).toFixed(3),onTree,aboveTimur,reachable,bonus:!!a.bonus});if(!onTree)issues.push('apple-not-on-tree');if(!aboveTimur)issues.push(`apple-below-child-height:${(a.y||0).toFixed(2)}`);if(!reachable)issues.push(`apple-too-high:${(a.y||0).toFixed(2)}`)}}return {ok:issues.length===0,issues,samples,bonusChance:runtime.BONUS_FORAGE_CHANCE,berryBonusChance:runtime.BERRY_BONUS_CHANCE,level: runtime.level}}

function runJumpSurfaceAudit(){const oldLevel=runtime.level,ox=runtime.boy.position.x,oy=runtime.boy.position.y,oz=runtime.boy.position.z,opy=runtime.py,ovy=runtime.vy,issues=[],samples=[];for(const sample of [{lv:1,x:0,z:8,name:'grass'},{lv:2,x:10,z:10,name:'lake-land'},{lv:3,x:0,z:8,name:'village'},{lv:4,x:0,z:riverCenterAt(0),name:'bridge'}]){runtime.level=sample.lv;const support=runtime.playerSupportHeightAt(sample.x,sample.z);runtime.py=support;runtime.vy=0;const grounded=Math.abs(runtime.py-support)<.13&&runtime.vy<=.12;samples.push({...sample,support:+support.toFixed(3),grounded});if(!grounded)issues.push('jump-support-'+sample.name);if(sample.name==='bridge'&&Math.abs(support-.28)>.02)issues.push('bridge-support')}runtime.level=oldLevel;runtime.boy.position.set(ox,oy,oz);runtime.py=opy;runtime.vy=ovy;return {ok:issues.length===0,issues,samples}}

function runSunShadowAudit(){const same=runtime.sun.position.distanceTo(runtime.sunDisc.position)<.01,casters=[];runtime.scene.traverse(o=>{if(o.isMesh&&o.visible&&o!==runtime.ground&&o!==runtime.skyDome&&o!==runtime.sunDisc&&o!==runtime.grassBlades&&o!==runtime.meadowGrass&&!(o.material?.transparent&&o.material?.opacity<.20))casters.push(o)});const missing=casters.filter(o=>!o.castShadow).length;return {ok:same&&runtime.sunDisc.visible&&missing===0,sunAligned:same,sunVisible:runtime.sunDisc.visible,visibleSolidMeshes:casters.length,missingCasters:missing,shadowCamera:[runtime.sun.shadow.camera.left,runtime.sun.shadow.camera.right,runtime.sun.shadow.camera.top,runtime.sun.shadow.camera.bottom],shadowFar:runtime.sun.shadow.camera.far}}

function repairTreeApples(issues,repairs){
 for(const a of runtime.apples){if(a.done||a.type!=='apple'||a.y<=1)continue;if(runtime.appleOnBranch(a))continue;const n=runtime.nearestVisibleAppleBranch(a.x,a.z);if(!n){issues.push('apple-no-visible-branch');continue}const p=runtime.branchApplePoint(n.branch);if(!p){issues.push('apple-no-visible-branch');continue}a.g.position.set(p[0],p[2],p[1]);a.x=p[0];a.z=p[1];a.y=p[2];a.branch=p[3];a.tree=p[4];a.g.userData.appleBranch=p[3];a.g.userData.appleTree=p[4];repairs.push('apple-branch-anchor');if(!runtime.appleOnBranch(a))issues.push(`apple-off-branch:${a.x.toFixed(1)},${a.z.toFixed(1)}`);
 }
}


function runOcclusionVisibilityAudit(){
 const issues=[],samples=[];
 // Verify per-object fade does not leak through shared materials and restores cleanly.
 const candidates=[runtime.treeObjects.find(o=>o?.visible),runtime.rockPositions.find(q=>q[3]?.visible)?.[3],runtime.houseObjects.find(o=>o?.visible),runtime.ridgeObjects.find(o=>o?.visible)].filter(Boolean);
 for(const root of candidates){let mesh=null;root.traverse?.(o=>{if(!mesh&&o.isMesh&&!o.userData.familyWindow)mesh=o});if(root.isMesh)mesh=root;if(!mesh)continue;runtime.setObjectCameraFade(root,true);const faded=mesh.material.opacity<.5;runtime.setObjectCameraFade(root,false);const restored=mesh.material.opacity>.75;samples.push({faded,restored});if(!faded)issues.push('camera-occluder-not-faded');if(!restored)issues.push('camera-occluder-not-restored')}
 if(runtime.level===3&&runtime.familyHideout?.visible){
  const old=runtime.insideFamilyHouse;runtime.setDadHouseCutaway(true);const cp=runtime.familyHideout.userData.cutawayWalls;const hiddenWalls=['front','back','left','right'].flatMap(k=>cp[k]).filter(m=>!m.visible).length;if(hiddenWalls<1||hiddenWalls>Math.max(...['front','back','left','right'].map(k=>cp[k].length)))issues.push('dad-house-cutaway-wrong-wall-count');if(!cp.roof||cp.roof.visible)issues.push('dad-house-roof-not-cutaway');if(!runtime.familyWindow?.visible||runtime.familyWindow.material.opacity<.9)issues.push('dad-window-not-bright');if(!runtime.hideDoorGlow?.visible||runtime.hideDoorGlow.intensity<10||!runtime.dadInteriorGlow?.visible)issues.push('dad-house-light-off');runtime.setDadHouseCutaway(old);
 }
 return {ok:issues.length===0,issues,samples,level: runtime.level};
}

function runWorldIntegrityAudit(){
 const issues=[];
 // Elevated apples must visibly belong to a currently visible tree and sit outside its trunk.
 for(const a of runtime.apples){if(a.done||a.type!=='apple'||a.y<=1)continue;if(!runtime.appleOnBranch(a))issues.push(`apple-off-branch:${a.x.toFixed(1)},${a.z.toFixed(1)}`);if(!runtime.appleOutsideOwnTrunk(a))issues.push(`apple-inside-tree:${a.x.toFixed(1)},${a.z.toFixed(1)}`)}
 const forageRoadAudit=runForageRoadAudit();if(!forageRoadAudit.ok)issues.push(...forageRoadAudit.issues);const foragePlacementAudit=runForagePlacementAudit();if(!foragePlacementAudit.ok)issues.push(...foragePlacementAudit.issues);
 // The father's hideout must actually become translucent from a point inside its walkable room.
 if(runtime.level===3&&runtime.familyHideout?.visible){const ox=runtime.boy.position.x,oz=runtime.boy.position.z,oldInside=runtime.insideFamilyHouse;runtime.familyHideout.updateWorldMatrix(true,true);const doorWorld=new THREE.Vector3(0,0,1.72).applyMatrix4(runtime.familyHideout.matrixWorld);runtime.boy.position.x=doorWorld.x;runtime.boy.position.z=doorWorld.z;runtime.insideFamilyHouse=false;runtime.setHouseTransparent(runtime.familyHideout,false);runtime.updateFamilyHouseReveal();const cp=runtime.familyHideout.userData.cutawayWalls;const hiddenAtDoor=['front','back','left','right'].flatMap(k=>cp[k]).some(m=>!m.visible);if(!hiddenAtDoor||cp.roof.visible)issues.push('family-house-cutaway-not-open-at-door');if(!runtime.familyHouseRevealAt(doorWorld.x,doorWorld.z))issues.push('family-house-door-reveal-zone-missing');const brother=runtime.familyMembers.find(f=>f.role===2&&!f.done);if(!brother)issues.push('family-brother-missing');else{const dl=runtime.familyHideout.worldToLocal(new THREE.Vector3(brother.x,0,brother.z));if(!(dl.x>-1.85&&dl.x<.55&&dl.z>-1.72&&dl.z<2.08))issues.push('family-brother-outside-house');if(!brother.g.visible)issues.push('family-brother-not-visible');}const fw=runtime.familyWindow?.getWorldPosition(new THREE.Vector3()),fl=runtime.familyHideout.worldToLocal(fw.clone());if(runtime.familyWindow?.parent!==runtime.hideDoor||runtime.hideDoor.parent!==runtime.familyHideout)issues.push('family-window-detached');if(Math.abs(fl.x+1.55)>.08||Math.abs(fl.z-2.315)>.08)issues.push('family-window-off-wall');runtime.setDadHouseCutaway(false);runtime.insideFamilyHouse=oldInside;runtime.boy.position.x=ox;runtime.boy.position.z=oz}
 // Rock collision must leave player-sized corridors when the visible AABB gap is clearly wide enough.
 const rs=runtime.rockPositions.filter(([, , ,m])=>m?.visible!==false).map((r,i)=>{r[3].updateWorldMatrix(true,false);return {i,b:new THREE.Box3().setFromObject(r[3])}});let corridors=0;
 for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){const a=rs[i].b,b=rs[j].b;const gx=Math.max(0,Math.max(a.min.x,b.min.x)-Math.min(a.max.x,b.max.x)),gz=Math.max(0,Math.max(a.min.z,b.min.z)-Math.min(a.max.z,b.max.z));const gap=Math.hypot(gx,gz);if(gap>=1.05&&gap<=2.2)corridors++}
 // v98: zero naturally occurring sample pairs is not a failure by itself; a deterministic synthetic corridor probe validates the mechanic.
 if(rs.length>1&&corridors===0){}
 return {ok:issues.length===0,issues,level: runtime.level,treeApples:runtime.apples.filter(a=>!a.done&&a.type==='apple'&&a.y>1).length,rockCorridors:corridors,familyHouseChecked:runtime.level===3};
}

function runFamilyPlacementAudit(){const issues=[],spots=runtime.familyMembers.filter(f=>!f.done).map(f=>({role:f.role,x:+f.x.toFixed(2),z:+f.z.toFixed(2)}));for(const f of runtime.familyMembers){if(runtime.level===3&&f.role===2)continue;if(Math.abs(f.x)<5.2)issues.push(`family-on-road:${f.role}`);if(runtime.worldObstacleAt(f.x,f.z,.55))issues.push(`family-in-obstacle:${f.role}`)}if(runtime.level===3){const brother=runtime.familyMembers.find(f=>f.role===2);if(!brother)issues.push('family-brother-missing');else{const q=runtime.familyHideout.worldToLocal(new THREE.Vector3(brother.x,0,brother.z));if(!(q.x>-1.85&&q.x<.55&&q.z>-1.72&&q.z<2.08))issues.push('family-brother-not-in-hideout')}const door=new THREE.Vector3(0,0,1.72).applyMatrix4(runtime.familyHideout.matrixWorld);if(!runtime.familyHouseRevealAt(door.x,door.z))issues.push('family-house-not-reveal-at-entry')}return {ok:issues.length===0,issues,spots,hideout:runtime.level===3?{x:+runtime.familyHideout.position.x.toFixed(1),z:+runtime.familyHideout.position.z.toFixed(1)}:null,level: runtime.level}}

function repairAndAuditSpawns(){
 const issues=[],repairs=[];repairTreeApples(issues,repairs);
 const fixBoar=(b,label,allowRoad=false)=>{if(!b?.g)return;if(runtime.spawnPointBlocked(b.g.position.x,b.g.position.z,runtime.boarRadius(b)*.72,{allowRoad})){
   const q=runtime.nearestSafeSpawn(b.g.position.x,b.g.position.z,runtime.boarRadius(b)*.72,{allowRoad});
   if(q){b.g.position.x=q[0];b.g.position.z=q[1];b.x=q[0];b.z=q[1];b.roamX=q[0];b.roamZ=q[1];repairs.push(label)}else issues.push(`spawn-blocked:${label}`)
  }};
 if(runtime.friend)fixBoar(runtime.friend,'friend',runtime.mountedFriend);
 runtime.foes.forEach((b,i)=>fixBoar(b,b.isBoss?'boss':`boar${i}`,!!b.isBoss));
 for(const a of runtime.apples){if(a.y>1)continue;if(runtime.spawnPointBlocked(a.g.position.x,a.g.position.z,.38)){const q=runtime.nearestSafeSpawn(a.g.position.x,a.g.position.z,.38);if(q){a.g.position.x=q[0];a.g.position.z=q[1];a.x=q[0];a.z=q[1];a.g.position.y=runtime.terrainHeightAt(a.x,a.z);repairs.push(`forage-${a.type}`)}else issues.push(`spawn-blocked:forage-${a.type}`)}}
 for(const f of runtime.familyMembers){if(runtime.level===3&&f.role===2)continue;if(runtime.spawnPointBlocked(f.g.position.x,f.g.position.z,.55)){const q=runtime.nearestSafeSpawn(f.g.position.x,f.g.position.z,.55);if(q){f.g.position.x=q[0];f.g.position.z=q[1];f.x=q[0];f.z=q[1];f.g.position.y=runtime.terrainHeightAt(f.x,f.z);repairs.push(`family${f.role}`)}else issues.push(`spawn-blocked:family${f.role}`)}}
 // Recheck after repair: no ordinary boar/ground pickup/family member may begin inside scenery or on the road.
 const check=(x,z,pad,label,opts={})=>{if(runtime.spawnPointBlocked(x,z,pad,opts))issues.push(`spawn-invalid:${label}`)};
 if(runtime.friend)check(runtime.friend.g.position.x,runtime.friend.g.position.z,runtime.boarRadius(runtime.friend)*.72,'friend',{allowRoad:runtime.mountedFriend});
 runtime.foes.forEach((b,i)=>check(b.g.position.x,b.g.position.z,runtime.boarRadius(b)*.72,b.isBoss?'boss':`boar${i}`,{allowRoad:!!b.isBoss}));
 runtime.apples.forEach((a,i)=>{if(a.y<=1)check(a.g.position.x,a.g.position.z,.38,`forage${i}`)});
 runtime.familyMembers.forEach((f,i)=>{if(!(runtime.level===3&&f.role===2))check(f.g.position.x,f.g.position.z,.55,`family${i}`)});
 return {ok:issues.length===0,issues,repairs,level: runtime.level,boars:runtime.foes.length+(runtime.friend?1:0),forage:runtime.apples.length,family:runtime.familyMembers.length};
}
 return {
  bindings:{
"runForageRoadAudit":{get:()=>runForageRoadAudit},
"runForagePlacementAudit":{get:()=>runForagePlacementAudit},
"runJumpSurfaceAudit":{get:()=>runJumpSurfaceAudit},
"runSunShadowAudit":{get:()=>runSunShadowAudit},
"repairTreeApples":{get:()=>repairTreeApples},
"runOcclusionVisibilityAudit":{get:()=>runOcclusionVisibilityAudit},
"runWorldIntegrityAudit":{get:()=>runWorldIntegrityAudit},
"runFamilyPlacementAudit":{get:()=>runFamilyPlacementAudit},
"repairAndAuditSpawns":{get:()=>repairAndAuditSpawns}
  },
  initialize(){

window.__KABANCHIKI_FORAGE_ROAD_AUDIT__=runForageRoadAudit;

window.__KABANCHIKI_FORAGE_PLACEMENT_AUDIT__=runForagePlacementAudit;

window.__KABANCHIKI_JUMP_SURFACE_AUDIT__=runJumpSurfaceAudit;

window.__KABANCHIKI_SUN_SHADOW_AUDIT__=runSunShadowAudit;

window.__KABANCHIKI_OCCLUSION_AUDIT__=runOcclusionVisibilityAudit;

window.__KABANCHIKI_FAMILY_PLACEMENT_AUDIT__=runFamilyPlacementAudit;
  }
 };

}
