import { visibleInTree, projectedBox } from "../cinematic-tree-guard.js?v=222";
import { HOME_SITE } from "../home-construction.js?v=222";
import * as THREE from "../../vendor/three/three.module.min.js";
import { CAT_JUMP_SPEED } from "../form-rules.js?v=222";

export function createQaPart(runtime){
 return {
v212RebuildHome(){
  const before=this.v212BlastHome();for(let i=0;i<4;i++)runtime.home.collect(i);runtime.boy.position.set(HOME_SITE.x,0,HOME_SITE.z+3.8);runtime.paused=false;for(let i=0;i<4;i++)runtime.interactHome();runtime.paused=true;return {destroyed:before.stage===0,stage:runtime.home.stage,lit:runtime.homeParts.lamp.visible};
 },
v212Reunion(form='cat',role=0,time=6){this.v212Setup(role===0?1:role===2?3:5);if(form==='cat')runtime.startCatForm();else if(form==='boar')runtime.startBoarForm();const member=runtime.familyMembers.find(f=>f.role===role);runtime.showFamilyPopup(role,member);runtime.movie.elapsedOverride=time;runtime.updateCinematic(performance.now(),new THREE.Vector3());runtime.movie.people[0].userData.qaDraws=0;runtime.movie.people[0].traverse(o=>{if(o.isMesh)o.onBeforeRender=()=>runtime.movie?.people[0]&&(runtime.movie.people[0].userData.qaDraws++)});return {form:runtime.movie.heroForm,role,people:runtime.movie.people.length,text:runtime.$('cinematicText').textContent};},
v212ReunionInspect(){const person=runtime.movie?.people[0];if(!person)return null;const box=new THREE.Box3().setFromObject(person),rect=projectedBox(THREE,box,runtime.camera);return {draws:person.userData.qaDraws,visible:visibleInTree(person),rect};},
v212Scene(kind='storm'){
  this.v212Setup(kind==='fishing'?2:3);runtime.paused=false;runtime.foes.forEach(f=>f.flee=true);if(kind==='storm'){runtime.levelTime=302;runtime.updateTornado(0,performance.now());runtime.boy.position.set(0,0,8);runtime.tornadoState.x=3;runtime.tornadoState.z=-8;runtime.nextLightningAt=9999;runtime.lightningFlash=0;runtime.lightningSky.intensity=runtime.lightningSun.intensity=0;for(let i=0;i<12;i++)runtime.tornadoVisual.capture(i%3?'tree':'house',performance.now()/1000-i*.2);runtime.yaw=runtime.boy.rotation.y=Math.PI;runtime.camMode=1;}
  if(kind==='warning'){runtime.levelTime=245;runtime.nextLightningAt=9999;runtime.yaw=runtime.boy.rotation.y=Math.PI;runtime.camMode=1;}
  if(kind==='home'){runtime.home.stage=4;runtime.syncHomeVisual();runtime.syncHomeLocation(3);runtime.boy.position.set(HOME_SITE.x,0,HOME_SITE.z);runtime.sun.intensity=.25;runtime.hemi.intensity=.45;runtime.yaw=0;runtime.camMode=1;}
  if(kind==='craft'){runtime.adventureInventory.wood=4;runtime.adventureInventory.bombs=2;runtime.food=4;runtime.setPause(true);runtime.$('craftPanel').open=true;runtime.$('craftPanel').scrollIntoView({block:'center'});}
  if(kind==='bomb'){runtime.adventureInventory.bombs=1;runtime.boy.rotation.y=0;runtime.placeAdventureBomb();runtime.boy.position.set(0,0,15);runtime.paused=true;}
  runtime.hud();return {kind,version:runtime.GAME_VERSION};
 },
v211FurnitureJumps(){
  this.v207BuildDoor();this.season(0);this.load(3);runtime.paused=true;runtime.mountedFriend=false;runtime.boarFormTime=runtime.catFormTime=0;runtime.foes.forEach(f=>f.flee=true);if(runtime.friend){runtime.scene.remove(runtime.friend.g);runtime.friend=null;}
  const samples=[],issues=[],reveal=runtime.updateFamilyHouseReveal;
  try{
   for(const h of [runtime.familyHideout,runtime.personalHouse]){
    const furniture=h===runtime.familyHideout?runtime.houseFurnishings.children:runtime.homeParts.furnishings.children.filter((o,i)=>[0,6,8].includes(i));
    for(let index=0;index<furniture.length;index++)for(const form of ['human','cat','boar'])for(const cutaway of [false,true])for(const side of ['left','right','back','front'])for(const fps of [30,60]){
     const item=furniture[index],box=new THREE.Box3().setFromObject(item),start=new THREE.Vector3((box.min.x+box.max.x)/2,0,(box.min.z+box.max.z)/2),local=h.worldToLocal(start.clone());
     const goalLocal=side==='left'?new THREE.Vector3(-4,0,local.z):side==='right'?new THREE.Vector3(4,0,local.z):side==='back'?new THREE.Vector3(local.x,0,-4):new THREE.Vector3(local.x<0?-1.9:1.9,0,4),goal=h.localToWorld(goalLocal);
     runtime.boy.position.set(start.x,0,start.z);runtime.py=box.max.y-runtime.terrainHeightAt(start.x,start.z)+.02;runtime.vy=form==='cat'?CAT_JUMP_SPEED:7;runtime.catFormTime=form==='cat'?30:0;runtime.boarFormTime=form==='boar'?30:0;
     const worldCam=h.localToWorld(new THREE.Vector3(side==='left'?-8:side==='right'?8:0,4,side==='back'?-8:side==='front'?8:0));runtime.camera.position.copy(worldCam);
     runtime.updateFamilyHouseReveal=()=>{reveal();runtime.setDadHouseCutaway(h===runtime.familyHideout&&cutaway);runtime.setHomeHouseCutaway(h===runtime.personalHouse&&cutaway)};
     let escaped=false,headClip=false,firstEscape=null;
     for(let frame=0;frame<fps*1.5;frame++){
      runtime.boarCollisionEpoch++;const dx=goal.x-runtime.boy.position.x,dz=goal.z-runtime.boy.position.z,d=Math.hypot(dx,dz);if(d)runtime.movePlayerCollision(dx/d*6/fps,dz/d*6/fps);runtime.movePlayerVertical(1/fps);
      const q=h.worldToLocal(new THREE.Vector3(runtime.boy.position.x,0,runtime.boy.position.z)),wallX=h===runtime.familyHideout?2.6:2.4,wallZ=h===runtime.familyHideout?2.18:2.4;
      if(Math.abs(q.x)>wallX+.12||q.z<-wallZ-.12||(q.z>wallZ+.12&&Math.abs(q.x)>1.2)){escaped=true;firstEscape??={frame,x:q.x,z:q.z,py: runtime.py};}
      const roof=runtime.doorCollisionBox(h.userData.cutawayWalls.roof),head=runtime.py+runtime.terrainHeightAt(runtime.boy.position.x,runtime.boy.position.z)+runtime.playerPhysicalHeight();
      if(Math.abs(q.x)<wallX-.4&&Math.abs(q.z)<wallZ-.4&&runtime.py<roof.min.y&&head>roof.min.y+.06)headClip=true;
     }
     if(escaped)issues.push('wall-'+(h===runtime.familyHideout?'family':'home')+'-'+index+'-'+form+'-'+side+'-'+fps+'-'+cutaway);
     if(headClip)issues.push('ceiling-'+(h===runtime.familyHideout?'family':'home')+'-'+index+'-'+form+'-'+fps);
     samples.push({house:h===runtime.familyHideout?'family':'home',index,form,side,fps,cutaway,escaped,headClip,firstEscape});
    }
   }
  }finally{runtime.updateFamilyHouseReveal=reveal;runtime.boarFormTime=runtime.catFormTime=0;runtime.py=runtime.vy=0;runtime.boy.position.set(0,0,12);runtime.setDadHouseCutaway(false);runtime.setHomeHouseCutaway(false);}
  return {cases:samples.length,issues:[...new Set(issues)],samples:samples.filter(s=>s.escaped||s.headClip)};
 },
v211Reunion(form='human',role=0,time=6){
  runtime.cinematicFinish?.();this.season(0);this.load(3);runtime.paused=true;runtime.boarFormTime=runtime.catFormTime=0;
  runtime.boy.position.set(0,0,12);if(form==='cat')runtime.startCatForm();else if(form==='boar')runtime.startBoarForm();
  const member=runtime.familyMembers.find(f=>f.role===role);runtime.showFamilyPopup(role,member);runtime.movie.elapsedOverride=time;runtime.updateCinematic(performance.now(),new THREE.Vector3());
  runtime.movie.hero.userData.qaDraws=0;runtime.movie.hero.traverse(o=>{if(o.isMesh)o.onBeforeRender=()=>runtime.movie?.hero&&(runtime.movie.hero.userData.qaDraws++)});
  return {form:runtime.movie.heroForm,gesture:runtime.movie.reunion.gesture,text:runtime.$('cinematicText').textContent,after:runtime.movie.reunion.after,heroVisible:runtime.movie.hero.visible,cat:runtime.catFormTime,boar:runtime.boarFormTime,heroY:runtime.movie.hero.position.y};
 }
 };
}
