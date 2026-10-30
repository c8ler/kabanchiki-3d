import {CatLife} from "../cat-life.js?v=221";
import { candidateBoxes, placementHeight, placementProblem } from "../craft-placement.js?v=221";
import { PROP_FOOTPRINTS } from "../craft-world.js?v=221";
import { RECIPES, craftResult } from "../crafting-rules.js?v=221";
import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 18 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let nextGatherTime,craftRotation,backpackModel;
 let craftedCats=null;
 let craftPreview=null,placementScene=null,placementSceneKey="",placementSceneAt=-Infinity;


function bombModel(parent){const g=new THREE.Group();parent.add(g);const ball=new THREE.Mesh(new THREE.SphereGeometry(.24,8,6),runtime.bombShellMat);ball.position.y=.26;g.add(ball);const fuse=runtime.block(g,runtime.bombFuseMat,.08,.54,0,.06,.18,.06);fuse.rotation.z=-.4;return g}

function disposePickupVisual(o){o.removeFromParent();o.traverse(m=>{if(m.geometry&&m.geometry!==runtime.cube)m.geometry.dispose()})}

function syncAdventureItems(){
 for(const a of runtime.adventurePickups)disposePickupVisual(a.g);runtime.adventurePickups.length=0;
 for(const b of runtime.armedBombs){disposePickupVisual(b.g);b.ring.removeFromParent();b.ring.geometry?.dispose()}runtime.armedBombs.length=0;
 for(const b of runtime.blastEffects)b.g.removeFromParent();runtime.blastEffects.length=0;
 if(runtime.level>=6){syncCraftUI();return}
 for(const obj of runtime.adventureDestroyed.get(runtime.level)||[])obj.visible=false;
 for(let i=2;runtime.craftUnlocked&&i<5;i++){
  const key=runtime.level+':'+i;if(runtime.adventureCollected.has(key))continue;
  const tree=runtime.treeObjects.filter(t=>t.visible&&Math.abs(t.position.x)>8)[(runtime.level*11+i*13)%Math.max(1,runtime.treeObjects.filter(t=>t.visible&&Math.abs(t.position.x)>8).length)];
  const q=runtime.nearestSafeSpawn((i%2?1:-1)*(5.5+i%2),20-i*9,.9,{allowRoad:true});if(!q||!runtime.clearWallLine(new THREE.Vector3(0,.8,q[1]),new THREE.Vector3(q[0],.8,q[1]))||runtime.lakeDepthAt(...q)>.1)continue;
  const kind='wood',g=new THREE.Group();if(kind==='wood'){runtime.scene.add(g);for(let j=0;j<3;j++)runtime.block(g,runtime.mats.wood,(j-1)*.13,.12,0,.1,.16,.65)}
  g.position.set(q[0],runtime.forageGroundAt(...q),q[1]);runtime.adventurePickups.push({g,key,kind});
 }
 syncCraftUI();
}

function foodCapacity(){return runtime.diffCfg().foodMax+(runtime.adventureInventory.backpack?6:0)}

function woolAnimalNearby(){return [...runtime.catLife.cats.filter(c=>runtime.catLife.root.visible&&c.g.visible).map(c=>c.g),...runtime.boarBodies().map(b=>b.g),...runtime.craftWorld.items.filter(item=>item.g.visible&&['cat','dog'].includes(item.kind)).map(item=>item.g)].some(g=>g.position.distanceTo(runtime.boy.position)<4)}

function updateBackpackVisual(){if(!backpackModel&&runtime.adventureInventory.backpack){backpackModel=new THREE.Group();backpackModel.userData.backpack=true;backpackModel.position.set(0,1.28,-.43);runtime.block(backpackModel,runtime.mats.leaf2,0,0,0,.72,.85,.35);runtime.block(backpackModel,runtime.mats.gold,0,-.15,-.22,.5,.3,.12);for(const side of [-1,1])runtime.block(backpackModel,runtime.mats.wood,side*.28,0,.2,.09,.95,.09);runtime.boy.add(backpackModel)}if(backpackModel)backpackModel.visible=runtime.adventureInventory.backpack;}


function gatherCraftMaterial(){if(!runtime.craftUnlocked||!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown||performance.now()<nextGatherTime)return;const wool=woolAnimalNearby(),tree=runtime.treeObjects.find(t=>t.visible&&Math.hypot(t.position.x-runtime.boy.position.x,t.position.z-runtime.boy.position.z)<3.8);if(!wool&&!tree){runtime.notice('🪵 Ветки ищи под деревьями, шерсть — рядом с котиком или кабанчиком.');return}nextGatherTime=performance.now()+2200;if(wool){runtime.adventureInventory.wool++;runtime.notice('🧶 Вычесал немного шерсти. Можно сшить рюкзак или создать зверька.')}else{runtime.adventureInventory.wood++;runtime.notice('🪵 Собрал упавшие ветки для крафта.')}runtime.hud();}

function populateCraftCatalog(){const box=runtime.$('craftCatalog');for(const [kind,recipe] of Object.entries(RECIPES)){if(runtime.$('craft-'+kind))continue;const button=document.createElement('button');button.id='craft-'+kind;button.type='button';button.dataset.category=recipe.category||'equipment';button.textContent=recipe.name+' · '+[recipe.wood?recipe.wood+' ветки':'',recipe.food?recipe.food+' еда':'',recipe.wool?recipe.wool+' шерсть':''].filter(Boolean).join(' + ');box.append(button)}}

function syncCraftPlacement(){const select=runtime.$('craftedChoice'),chosen=runtime.craftWorld.selected;const signature=JSON.stringify(runtime.craftWorld.stock);if(select.dataset.stock!==signature){select.replaceChildren();for(const [kind,count] of Object.entries(runtime.craftWorld.stock)){if(!count)continue;const option=document.createElement('option');option.value=kind;option.textContent=RECIPES[kind].name+' × '+count;select.append(option)}select.dataset.stock=signature}if(runtime.craftWorld.stock[chosen]>0)select.value=chosen;else runtime.craftWorld.selected=select.value||'';select.hidden=!select.options.length;const active=runtime.craftUnlocked&&runtime.started&&!runtime.paused&&!runtime.cinematicRunning&&!runtime.endShown;runtime.$('placeCraftAction').hidden=!active||!runtime.craftWorld.selected;runtime.$('placeCraftAction').textContent='Поставить: '+(RECIPES[runtime.craftWorld.selected]?.name||'')+' · T';runtime.$('gatherCraftAction').hidden=!active||!(woolAnimalNearby()||runtime.treeObjects.some(t=>t.visible&&Math.hypot(t.position.x-runtime.boy.position.x,t.position.z-runtime.boy.position.z)<3.8));}

function placementGeometry(fresh=false){
 const key=runtime.worldEpoch+':'+runtime.craftWorld.epoch+':'+runtime.level,now=performance.now();
 if(!fresh&&placementScene&&placementSceneKey===key&&now-placementSceneAt<200)return placementScene;
 const solids=[],surfaces=[],circles=[],seen=new Set();
 const addBox=b=>{if(!b.isEmpty()){solids.push(b);surfaces.push(b)}};
 const addMesh=o=>{if(!o?.isMesh||seen.has(o))return;seen.add(o);addBox(new THREE.Box3().setFromObject(o))};
 const addRoot=(root,includeHidden=false)=>{
  if(!root||!root.visible)return;
  root.updateWorldMatrix(true,true);
  const visit=o=>{if(!includeHidden&&!o.visible)return;if(o.isMesh)addMesh(o);for(const child of o.children)visit(child)};
  visit(root);
 };
 for(const q of runtime.wallGeometry()){
  if(q.furniture){q.root.updateWorldMatrix(true,true);const groups=q.root===runtime.familyHideout?runtime.houseFurnishings:runtime.homeParts?.furnishings;
   if(groups)for(const o of groups.children)o.traverse(addMesh);
  }else addBox(q.box);
 }
 for(const h of runtime.houseObjects)if(h.visible){
  const roof=h.userData.cutawayWalls?.roof;
  if(roof&&(h!==runtime.personalHouse||runtime.home.stage>=3)){roof.updateWorldMatrix(true,true);addMesh(roof)}
 }
 for(const item of runtime.craftWorld.items)if(item.g.visible&&!item.living){solids.push(...item.solids);surfaces.push(...item.supports)}
 for(const m of runtime.treeSolidMeshes)if(m?.parent&&m.parent.visible){
  const t=runtime.treeTrunkShape(m),b=new THREE.Box3().setFromObject(m);circles.push({...t,bottom:b.min.y,top:b.max.y});
 }
 for(const [,,,mesh] of runtime.rockPositions)if(mesh?.visible&&mesh.parent?.visible!==false)addRoot(mesh);
 if(runtime.level===1&&runtime.forestVisual.visible)for(const o of runtime.logObstacles)if(o.g?.visible)addRoot(o.g);
 for(const [,,,mesh] of runtime.mountainObstacles)if(runtime.level===5&&mesh?.parent?.visible!==false)addRoot(mesh);
 for(const [,,,mesh] of runtime.lairObstacles)if(runtime.level===6)addRoot(mesh);
 if(runtime.level===1)addRoot(runtime.openingProps);
 if(runtime.level===2)addRoot(runtime.lakeExitProps);
 addRoot(runtime.locationExitProps.get(runtime.level));
 placementSceneKey=key;placementSceneAt=now;return placementScene={solids,surfaces,circles};
}

function ensureCraftPreview(kind){
 if(craftPreview?.kind===kind)return craftPreview;
 if(craftPreview){
  craftPreview.g.removeFromParent();const materials=new Set();
  craftPreview.g.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m)}});
  for(const material of materials)material.dispose();
 }
 craftPreview=runtime.craftWorld.create(kind,0,0,0,runtime.level,craftRotation,true);
 craftPreview.g.userData.craftPreview=true;
 craftPreview.g.traverse(o=>{
  if(o.isLight)o.visible=false;
  if(o.isMesh){o.material=new THREE.MeshBasicMaterial({color:0x81e8ad,transparent:true,opacity:.38,depthWrite:false,depthTest:false});o.castShadow=false;o.receiveShadow=false;o.renderOrder=4}
 });
 return craftPreview;
}

function craftPlacementTarget(fresh=false){
 const kind=runtime.craftWorld.selected;
 if(!kind||!runtime.craftWorld.stock[kind])return null;
 const item=ensureCraftPreview(kind),distance=kind==='house'?6:RECIPES[kind].category==='furniture'?1.5:3,
 x=runtime.boy.position.x+Math.sin(runtime.yaw)*distance,z=runtime.boy.position.z+Math.cos(runtime.yaw)*distance,
 geometry=placementGeometry(fresh),ground=runtime.terrainHeightAt(x,z)+runtime.familyFloorAt(x,z),
 feet=runtime.terrainHeightAt(runtime.boy.position.x,runtime.boy.position.z)+runtime.py,
 y=placementHeight(x,z,feet,ground,geometry.surfaces);
 item.g.position.set(x,y,z);item.g.rotation.y=craftRotation;
 const boxes=candidateBoxes(item);
 let reason=runtime.craftWorld.items.length>=48?'На карте уже 48 созданных предметов':placementProblem(boxes,{...geometry,wet:(px,pz)=>runtime.lakeDepthAt(px,pz)>.08,ground:runtime.terrainHeightAt});
 // Do not reach through the house shell to furnish the room from outside.
 if(!reason&&!runtime.clearWallLine(new THREE.Vector3(runtime.boy.position.x,feet+1.4,runtime.boy.position.z),new THREE.Vector3(x,Math.max(feet+1.4,y+.2),z)))reason='Мешает стена: подойди к месту размещения';
 return {kind,x,y,z,rotation:craftRotation,valid:!reason,reason};
}

function updateCraftPreview(){
 const active=runtime.craftUnlocked&&runtime.started&&!runtime.paused&&!runtime.cinematicRunning&&!runtime.endShown&&!runtime.win&&runtime.life>0&&!!runtime.craftWorld.stock[runtime.craftWorld.selected];
 if(!active){if(craftPreview)craftPreview.g.visible=false;return null}
 const target=craftPlacementTarget();
 if(craftPreview){craftPreview.g.visible=true;craftPreview.g.traverse(o=>{if(o.isMesh)o.material.color.setHex(target.valid?0x81e8ad:0xff7575)})}
 const button=runtime.$('placeCraftAction');button.title=target.reason||'T — поставить, Z — повернуть';button.dataset.valid=String(target.valid);
 return target;
}

function updateCraftCreatures(dt,now){
 if(runtime.cinematicRunning||runtime.paused)return;
 if(!runtime.craftWorld.items.some(item=>item.g.visible&&item.living))return;
 const geometry=placementGeometry();
 const terrain=(x,z,feet=runtime.terrainHeightAt(x,z))=>placementHeight(x,z,feet,runtime.terrainHeightAt(x,z)+runtime.familyFloorAt(x,z),geometry.surfaces,.2);
 const blocked=(x,z,y,r=.22,height=1)=>!!placementProblem([new THREE.Box3(new THREE.Vector3(x-r,y+.04,z-r),new THREE.Vector3(x+r,y+height,z+r))],{...geometry,wet:(px,pz)=>runtime.lakeDepthAt(px,pz)>.08});
 const cats=runtime.craftWorld.items.filter(i=>i.g.visible&&i.catActor).map(i=>i.catActor);
 if(!cats.length&&craftedCats){craftedCats.cats=[];craftedCats.root.visible=false}
 if(cats.length){
  craftedCats??=new CatLife(THREE,runtime.scene,runtime.mobile,true);craftedCats.root.visible=true;craftedCats.cats=cats;craftedCats.epoch=runtime.worldEpoch;craftedCats.jumpBlocked=(x,z,y,r)=>blocked(x,z,y,r,.95);
  craftedCats.houses=runtime.catLife.houses?.length?runtime.catLife.houses:[{x:0,z:0,y:0,w:3,d:3,exit:{x:2,z:2}}];craftedCats.objects=runtime.catLife.objects||[];
  craftedCats.terrain=(x,z)=>terrain(x,z);craftedCats.blocked=(x,z)=>blocked(x,z,terrain(x,z),.22,.95);
  const dog=runtime.craftWorld.items.find(i=>i.kind==='dog'&&i.level===runtime.level&&i.g.visible);for(const c of cats){c.petChaseTarget=dog&&Math.floor(now/1000/8)%3===1&&c.g.position.distanceTo(dog.g.position)<14?dog.g.position:null}
  craftedCats.update(dt,runtime.birdLife,runtime.boarBodies(),runtime.boy.position,runtime.mountedFriend?runtime.friend:null,runtime.catLife.root.visible?runtime.catLife.cats:[]);
 }
 runtime.craftWorld.update(dt,now/1000,runtime.level,terrain,blocked,runtime.boy.position);
}

function placeCraftItem(){
 if(!runtime.craftUnlocked||!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown)return false;
 const target=craftPlacementTarget(true);if(!target)return false;
 if(!target.valid){runtime.notice(target.reason);return false}
 const {kind,x,y,z,rotation}=target,item=runtime.craftWorld.create(kind,x,y,z,runtime.level,rotation);
 if(!item){runtime.notice('🐾 Лимит: два котика и собаки вместе.');return false}if(item.living)item.g.userData.craftedCreature=true;
 runtime.craftWorld.stock[kind]--;runtime.worldEpoch++;runtime.wallCacheEpoch=-1;
 runtime.tagStormTargetsForCurrentLocation();runtime.notice('Готово: '+RECIPES[kind].name);syncCraftPlacement();updateCraftPreview();return true;
}

function syncCraftUI(){
 runtime.$('craftPanel').hidden=!runtime.craftUnlocked;updateBackpackVisual();const stock=runtime.$('craftStock');if(!stock)return;stock.textContent='Обломки: '+runtime.adventureInventory.wood+' · Бомбочки: '+runtime.adventureInventory.bombs+' · Шерсть: '+runtime.adventureInventory.wool+' · Еда: '+runtime.food;
 for(const [kind,recipe] of Object.entries(RECIPES)){const button=runtime.$('craft-'+kind);button.disabled=!craftResult(kind,{...runtime.adventureInventory,food: runtime.food})||kind==='lamp'&&runtime.hasFlashlight||kind==='aid'&&runtime.life>=runtime.diffCfg().playerHP||kind==='backpack'&&runtime.adventureInventory.backpack||kind==='wool'&&!woolAnimalNearby()}
 runtime.$('bombAction').hidden=!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown||runtime.adventureInventory.bombs<=0;runtime.$('dismountAction').hidden=!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown||!runtime.mountedFriend;
 runtime.$('bombAction').textContent='💣 Бросить · '+runtime.adventureInventory.bombs;syncCraftPlacement();
}

function craftAdventure(kind){
 if(!runtime.craftUnlocked||!runtime.started||runtime.endShown||runtime.cinematicRunning||runtime.life<=0)return false;
 if(kind==='lamp'&&runtime.hasFlashlight||kind==='aid'&&runtime.life>=runtime.diffCfg().playerHP||kind==='backpack'&&runtime.adventureInventory.backpack||kind==='wool'&&!woolAnimalNearby())return false;
 if((kind==='cat'||kind==='dog')&&runtime.craftWorld.petCount()>=2){runtime.$('craftResult').textContent='🐾 Можно иметь только двух читерских котиков и собак вместе.';return false}
 const next=craftResult(kind,{...runtime.adventureInventory,food: runtime.food});if(!next){runtime.$('craftResult').textContent='Не хватает припасов.';return false}
 runtime.adventureInventory.wood=next.wood;runtime.adventureInventory.bombs=next.bombs;runtime.adventureInventory.wool=next.wool||0;runtime.food=next.food;if(kind==='backpack')runtime.adventureInventory.backpack=true;else if(!['bomb','lamp','aid','wool'].includes(kind))runtime.craftWorld.addStock(kind);
 if(kind==='lamp')runtime.hasFlashlight=true;if(kind==='aid')runtime.life=Math.min(runtime.diffCfg().playerHP,runtime.life+2);
 runtime.$('craftResult').textContent=!['bomb','lamp','aid','wool','backpack'].includes(kind)?'Готово! В игре появится полупрозрачный предмет: зелёный — можно поставить, красный — мешает преграда. T — поставить, Z — повернуть.':kind==='wool'?'Получено 2 пучка шерсти.':kind==='backpack'?'Рюкзак готов: теперь помещается больше еды.':kind==='bomb'?'Бомбочка готова. Вернись в игру и поставь её кнопкой 💣 или G.':kind==='lamp'?'Фонарик готов.':'Здоровье восстановлено.';
 runtime.adventureHud.log('Изготовлено: '+RECIPES[kind].name);runtime.hud();syncCraftUI();return true;
}
 return {
  bindings:{
"bombModel":{get:()=>bombModel},
"disposePickupVisual":{get:()=>disposePickupVisual},
"syncAdventureItems":{get:()=>syncAdventureItems},
"foodCapacity":{get:()=>foodCapacity},
"woolAnimalNearby":{get:()=>woolAnimalNearby},
"nextGatherTime":{get:()=>nextGatherTime,set:value=>{nextGatherTime=value}},
"craftRotation":{get:()=>craftRotation,set:value=>{craftRotation=value}},
"backpackModel":{get:()=>backpackModel,set:value=>{backpackModel=value}},
"updateBackpackVisual":{get:()=>updateBackpackVisual},
"gatherCraftMaterial":{get:()=>gatherCraftMaterial},
"populateCraftCatalog":{get:()=>populateCraftCatalog},
"syncCraftPlacement":{get:()=>syncCraftPlacement},
"placeCraftItem":{get:()=>placeCraftItem},
"craftPlacementTarget":{get:()=>craftPlacementTarget},
"updateCraftPreview":{get:()=>updateCraftPreview},
"updateCraftCreatures":{get:()=>updateCraftCreatures},
"syncCraftUI":{get:()=>syncCraftUI},
"craftAdventure":{get:()=>craftAdventure}
  },
  initialize(){

/* init:let */ nextGatherTime = 0;
/* init:let */ craftRotation = 0;
/* init:let */ backpackModel = null;

runtime.$('rotateCraft').onclick=()=>{craftRotation=(craftRotation+Math.PI/2)%(Math.PI*2);runtime.notice('Повернуть: '+Math.round(craftRotation*180/Math.PI)+'°')};

runtime.$('craftedChoice').onchange=()=>{runtime.craftWorld.selected=runtime.$('craftedChoice').value;syncCraftPlacement()};

runtime.$('placeCraftAction').onclick=placeCraftItem;

runtime.$('gatherCraftAction').onclick=gatherCraftMaterial;

populateCraftCatalog();
  }
 };

}
