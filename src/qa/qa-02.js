import { RECIPES } from "../crafting-rules.js?v=218";
import * as THREE from "../../vendor/three/three.module.min.js";
import { riverCenterAt } from "../world-surface.js?v=218";

export function createQaPart(runtime){
 return {

v216PlacementScenario(scenario='crafted',kind='chair',rotation=0,previewOnly=false){
 this.v212Setup(3);runtime.craftWorld.clear();
 for(const member of runtime.familyMembers){member.done=true;member.g.visible=false}
 for(const t of runtime.treeObjects)t.visible=false;for(const [,,,m] of runtime.rockPositions)if(m)m.visible=false;
 let x=0,z=20;
 if(scenario==='personal'){runtime.home.stage=4;runtime.syncHomeVisual();runtime.syncHomeLocation(3);x=runtime.personalHouse.position.x;z=runtime.personalHouse.position.z+.7;runtime.homeParts.door.userData.closed=false}
 else if(scenario==='family'){x=runtime.familyHideout.position.x;z=runtime.familyHideout.position.z+.5;runtime.familyDoor.userData.closed=false}
 else {for(const h of runtime.houseObjects)h.visible=false}
 if(['crafted','roof','wall'].includes(scenario))runtime.craftWorld.create('house',0,0,20,3);
 if(scenario==='surface')runtime.craftWorld.create('table',0,0,20,3);
 if(scenario==='near-wall')runtime.craftWorld.create('wall',0,0,20.52,3);
 if(scenario==='wall'){x=2.3;z=20}
 runtime.py=scenario==='roof'?3.075:0;runtime.vy=0;
 runtime.boy.position.set(x,runtime.py,z-1.5);runtime.yaw=0;if(scenario==='wall'){runtime.boy.position.set(x-1.5,0,z);runtime.yaw=Math.PI/2}runtime.craftRotation=rotation;
 runtime.craftWorld.addStock(kind);runtime.worldEpoch++;runtime.wallCacheEpoch=-1;runtime.paused=false;runtime.syncCraftPlacement();
 const before=runtime.craftWorld.items.length,epoch=runtime.craftWorld.epoch,target=runtime.updateCraftPreview();
 const preview=runtime.scene.children.find(g=>g.userData.craftPreview&&g.visible),materials=[];
 preview?.traverse(m=>{if(m.isMesh)materials.push({transparent:m.material.transparent,opacity:m.material.opacity,depthWrite:m.material.depthWrite,depthTest:m.material.depthTest})});
 const unchanged=runtime.craftWorld.items.length===before&&runtime.craftWorld.epoch===epoch&&runtime.craftWorld.stock[kind]===1;
 if(previewOnly)return {target,unchanged};
 const placed=runtime.placeCraftItem(),item=runtime.craftWorld.items.at(-1);
 runtime.paused=true;runtime.updateCraftPreview();
 return {scenario,kind,target,unchanged,materials,placed,remaining:runtime.craftWorld.stock[kind],position:placed?item.g.position.toArray():null,hiddenAfterPause:!preview?.visible};
},
v216PreviewSetup(){
 this.v212Setup(3);runtime.craftWorld.clear();runtime.craftWorld.addStock('chair');runtime.boy.position.set(0,0,20);runtime.yaw=0;runtime.craftRotation=0;
 for(const h of runtime.houseObjects)h.visible=false;
 runtime.worldEpoch++;runtime.wallCacheEpoch=-1;runtime.paused=false;runtime.syncCraftPlacement();return runtime.updateCraftPreview();
},
v216PreviewInspect(){const g=runtime.scene.children.find(o=>o.userData.craftPreview&&o.visible);return {visible:!!g,position:g?.position.toArray(),rotation:g?.rotation.y,count:runtime.craftWorld.items.length,stock:runtime.craftWorld.stock.chair,paused:runtime.paused}},
v216Crawl(fps=60,live=false){
 this.v212Setup(3);runtime.craftWorld.clear();for(const t of runtime.treeObjects)t.visible=false;for(const [,,,m] of runtime.rockPositions)if(m)m.visible=false;for(const h of runtime.houseObjects)h.visible=false;
 const worm=runtime.craftWorld.create('worm',0,0,20,3),snail=runtime.craftWorld.create('snail',1,0,20,3);runtime.craftWorld.create('wall',0,0,21,3);
 runtime.worldEpoch++;runtime.wallCacheEpoch=-1;runtime.paused=false;
 const initial=[worm,snail].map(i=>i.g.position.toArray());
 if(!live)for(let i=0;i<fps*20;i++)runtime.updateCraftCreatures(1/fps,i*1000/fps);
 const result={initial,items:[worm,snail].map(i=>({kind:i.kind,position:i.g.position.toArray(),age:i.age||0,animated:i.kind==='worm'?i.g.children.map(m=>m.position.x):i.g.children[0].scale.z,blocked:runtime.craftWorld.blocked(i.g.position.x,i.g.position.z,i.g.position.y,.09,.5)}))};
 if(!live){runtime.paused=true;const before=worm.g.position.clone();runtime.updateCraftCreatures(1,99999);result.stopsWhenPaused=before.equals(worm.g.position)}
 return result;
},
v216CrawlInspect(){return runtime.craftWorld.items.filter(i=>i.living).map(i=>({kind:i.kind,position:i.g.position.toArray(),age:i.age||0}))},
v214MinionRobot(angle=0,fps=60,crowd=false){
  this.v212Setup(6);for(const f of runtime.foes)runtime.scene.remove(f.g);runtime.foes.length=0;if(runtime.friend){runtime.scene.remove(runtime.friend.g);runtime.friend=null}
  runtime.boy.position.set(0,0,0);const m=runtime.makeBoar(0,0,false);m.isMinion=true;const q=runtime.minionSpawnPoint(m,angle);
  if(!q){runtime.scene.remove(m.g);return {spawn:false}}m.g.position.set(q.x,0,q.z);m.g.rotation.y=Math.atan2(-q.x,-q.z);runtime.foes.push(m);if(crowd){const boss=runtime.makeBoar(q.x*.48,q.z*.48,false);boss.g.scale.setScalar(2.3);boss.isBoss=true;runtime.foes.push(boss)}const initial=Math.hypot(q.x,q.z);let maxStep=0,penetrations=0,reversals=0,last=null,moved=0;
  for(let i=0;i<fps*24;i++){runtime.boarCollisionEpoch++;const x=m.g.position.x,z=m.g.position.z;runtime.moveBoarToward(m,0,0,2.1,1/fps);runtime.resolveBoarClearance(m);runtime.settleBoarOnGround(m);const dx=m.g.position.x-x,dz=m.g.position.z-z,d=Math.hypot(dx,dz);maxStep=Math.max(maxStep,d);moved+=d;if(runtime.boarSceneryBlockedAt(m,m.g.position.x,m.g.position.z))penetrations++;if(d>.008){if(last&&last.x*dx+last.z*dz<-.5*last.d*d)reversals++;last={x:dx,z:dz,d}}if(Math.hypot(m.g.position.x,m.g.position.z)<4)break}
  return {spawn:true,initial,remaining:Math.hypot(m.g.position.x,m.g.position.z),maxStep,penetrations,reversals,moved,plans:m.route?.plans};
 },
revisionProbe(){return {version:runtime.GAME_VERSION,level: runtime.level,life: runtime.life,food: runtime.food,capacity:runtime.foodCapacity(),inventory:{...runtime.adventureInventory},selected:runtime.craftWorld.selected,stock:{...runtime.craftWorld.stock},items:runtime.craftWorld.items.map(item=>({kind:item.kind,level:item.level,position:item.g.position.toArray()})),bombs:runtime.armedBombs.map(b=>({x:b.x,z:b.z,y:b.y,left:b.left,landed:b.landed})),craters:(runtime.blastTerrain.levels.get(runtime.level)||[]).length,tornado:{active:runtime.tornadoState.active,actors:runtime.tornadoVisual.actors.map(a=>({kind:a.kind,meshes:(()=>{let n=0;a.g.traverse(o=>{if(o.isMesh)n++});return n})()})),grass:runtime.tornadoVisual.grass.count,water:runtime.tornadoVisual.water.count,sources:runtime.tornadoVisual.waterSources.length,birds:runtime.birdLife.lifted.size},movie:runtime.movie?{kind:runtime.movie.kind,form:runtime.movie.heroForm,cause:runtime.movie.deathCause,text:runtime.$('cinematicText').textContent,camera:runtime.camera.position.toArray(),hug:runtime.movie.heroForm==='human'?runtime.movie.hero.children[5]?.rotation.x:(runtime.movie.people[0]?.children.find(c=>c.isGroup)||runtime.movie.people[0])?.children.filter(o=>o.isMesh&&Math.abs(o.position.x)>.49&&Math.abs(o.position.x)<.62&&o.position.y>1&&o.position.y<1.5).map(o=>o.rotation.x)}:null}},
revisionCraft(kind,place=false){this.v212Setup(3);runtime.adventureInventory.wood=50;runtime.adventureInventory.wool=50;runtime.food=50;runtime.boy.position.set(0,0,20);runtime.yaw=runtime.boy.rotation.y=Math.PI;const crafted=runtime.craftAdventure(kind);let placed=false;if(place){runtime.paused=false;placed=runtime.placeCraftItem();runtime.paused=true}return {crafted,placed,...this.revisionProbe()}},
revisionAllCrafts(){this.v212Setup(3);runtime.adventureInventory.wood=100;runtime.adventureInventory.wool=100;runtime.food=100;const results=[];for(const kind of Object.keys(RECIPES)){if(kind==='wool'){const cat=runtime.catLife.cats[0];cat.g.position.copy(runtime.boy.position);runtime.catLife.root.visible=cat.g.visible=true;}if(kind==='aid')runtime.life=1;results.push({kind,ok:runtime.craftAdventure(kind)});if(!['bomb','lamp','aid','wool','backpack'].includes(kind)){const i=runtime.craftWorld.items.length,x=-30+(i%6)*11,z=24-Math.floor(i/6)*12;runtime.craftWorld.create(kind,x,runtime.terrainHeightAt(x,z),z,3);}}return {results,...this.revisionProbe()}},
revisionSelfExit(n=3,complete=true){this.v212Setup(n);if(runtime.friend){runtime.scene.remove(runtime.friend.g);runtime.friend=null}runtime.startBoarForm();if(complete){runtime.levelBoarsDone=runtime.levelBoarsTotal;runtime.levelFamilyDone=runtime.levelFamilyTotal;}runtime.boy.position.set(0,0,n===1?-32:-35.4);for(let i=0;i<100;i++){if(n===1)runtime.updateOpeningAdventure(.05);else if(n===2)runtime.updateLakeExit(.05);else runtime.updateLocationExit(.05);}const props=n===1?runtime.openingProps:n===2?runtime.lakeExitProps:runtime.locationExitProps.get(n);return {open:n===1?runtime.opening.passageOpen:n===2?runtime.lakeExitReady():runtime.locationExitReady(),helper:!!props?.userData.breaker,fence:props?.userData.fenceExtent,quests:runtime.questsComplete()}},
revisionMovie(form='human',kind='family',cause='bomb'){this.v212Setup(3);if(form==='cat')runtime.startCatForm();else if(form==='boar')runtime.startBoarForm();runtime.playCinematic(kind,()=>{runtime.paused=false},{role:0,cause,line:'Тимур встретил маму.'});runtime.movie.elapsedOverride=kind==='family'?5.7:1;runtime.updateCinematic(performance.now(),new THREE.Vector3());return this.revisionProbe()},
revisionBomb(water=false,die=false){this.v212Setup(water?4:3);runtime.paused=false;runtime.boy.position.set(water?16:0,0,water?riverCenterAt(16)+5.8:20);runtime.yaw=runtime.boy.rotation.y=Math.PI;runtime.adventureInventory.bombs=2;const accepted=runtime.placeAdventureBomb();const b=runtime.armedBombs[0];for(let i=0;i<18;i++)runtime.updateAdventureItems(.05);const at={x:b.x,z:b.z,y:b.y};if(die){runtime.life=1;runtime.invuln=0;runtime.boy.position.set(b.x,0,b.z)}else runtime.boy.position.set(0,0,30);for(let i=0;i<70;i++)runtime.updateAdventureItems(.05);const depression=runtime.blastTerrain.depression(runtime.level,at.x,at.z),roadLow=Math.min(...Array.from(runtime.roadSurface.geometry.attributes.position.array).filter((_,i)=>i%3===1));runtime.paused=true;return {accepted,water,at,depression,roadLow,...this.revisionProbe()}},
revisionVortex(n=4){this.v212Setup(n);runtime.levelTime=301;runtime.updateTornado(0,performance.now());runtime.tornadoState.x=n===2?-18:16;runtime.tornadoState.z=n===2?-17:n===4?riverCenterAt(16):0;runtime.boy.position.set(runtime.tornadoState.x+15,0,runtime.tornadoState.z+4);const boar=runtime.foes.find(f=>!f.isBoss);boar.g.position.set(runtime.tornadoState.x+1,0,runtime.tornadoState.z);const cat=runtime.craftWorld.create('cat',runtime.tornadoState.x-1,0,runtime.tornadoState.z,n);runtime.birdLife.update(.05,runtime.terrainHeightAt);if(runtime.birdLife.positions[0])Object.assign(runtime.birdLife.positions[0],{x:runtime.tornadoState.x,y:1,z:runtime.tornadoState.z});runtime.tornadoSweep=0;runtime.updateTornado(.05,performance.now());runtime.tornadoVisual.update(performance.now()/1000,runtime.tornadoState,runtime.terrainHeightAt(runtime.tornadoState.x,runtime.tornadoState.z));runtime.yaw=runtime.boy.rotation.y=Math.atan2(runtime.tornadoState.x-runtime.boy.position.x,runtime.tornadoState.z-runtime.boy.position.z);runtime.camMode=1;return this.revisionProbe()}
 };
}
