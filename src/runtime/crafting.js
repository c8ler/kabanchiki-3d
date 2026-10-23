import { PROP_FOOTPRINTS } from "../craft-world.js?v=215";
import { RECIPES, craftResult } from "../crafting-rules.js?v=215";
import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 15 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let nextGatherTime,craftRotation,backpackModel;

function bombModel(parent){const g=new THREE.Group();parent.add(g);const ball=new THREE.Mesh(new THREE.SphereGeometry(.24,8,6),runtime.bombShellMat);ball.position.y=.26;g.add(ball);const fuse=runtime.block(g,runtime.bombFuseMat,.08,.54,0,.06,.18,.06);fuse.rotation.z=-.4;return g}

function disposePickupVisual(o){o.removeFromParent();o.traverse(m=>{if(m.geometry&&m.geometry!==runtime.cube)m.geometry.dispose()})}

function syncAdventureItems(){
 for(const a of runtime.adventurePickups)disposePickupVisual(a.g);runtime.adventurePickups.length=0;
 for(const b of runtime.armedBombs){disposePickupVisual(b.g);b.ring.removeFromParent();b.ring.geometry?.dispose()}runtime.armedBombs.length=0;
 for(const b of runtime.blastEffects)b.g.removeFromParent();runtime.blastEffects.length=0;
 if(runtime.level>=6){syncCraftUI();return}
 for(const obj of runtime.adventureDestroyed.get(runtime.level)||[])obj.visible=false;
 for(let i=0;i<5;i++){
  const key=runtime.level+':'+i;if(runtime.adventureCollected.has(key))continue;
  const tree=runtime.treeObjects.filter(t=>t.visible&&Math.abs(t.position.x)>8)[(runtime.level*11+i*13)%Math.max(1,runtime.treeObjects.filter(t=>t.visible&&Math.abs(t.position.x)>8).length)];
  const q=runtime.nearestSafeSpawn((i%2?1:-1)*(5.5+i%2),20-i*9,.9,{allowRoad:true});if(!q||!runtime.clearWallLine(new THREE.Vector3(0,.8,q[1]),new THREE.Vector3(q[0],.8,q[1]))||runtime.lakeDepthAt(...q)>.1)continue;
  const kind=i<2?'bomb':'wood',g=kind==='bomb'?bombModel(runtime.scene):new THREE.Group();if(kind==='wood'){runtime.scene.add(g);for(let j=0;j<3;j++)runtime.block(g,runtime.mats.wood,(j-1)*.13,.12,0,.1,.16,.65)}
  g.position.set(q[0],runtime.forageGroundAt(...q),q[1]);runtime.adventurePickups.push({g,key,kind});
 }
 syncCraftUI();
}

function foodCapacity(){return runtime.diffCfg().foodMax+(runtime.adventureInventory.backpack?6:0)}

function woolAnimalNearby(){return [...runtime.catLife.cats.filter(c=>runtime.catLife.root.visible&&c.g.visible).map(c=>c.g),...runtime.boarBodies().map(b=>b.g),...runtime.craftWorld.items.filter(item=>item.g.visible&&['cat','dog'].includes(item.kind)).map(item=>item.g)].some(g=>g.position.distanceTo(runtime.boy.position)<4)}

function updateBackpackVisual(){if(!backpackModel&&runtime.adventureInventory.backpack){backpackModel=new THREE.Group();backpackModel.userData.backpack=true;backpackModel.position.set(0,1.28,-.43);runtime.block(backpackModel,runtime.mats.leaf2,0,0,0,.72,.85,.35);runtime.block(backpackModel,runtime.mats.gold,0,-.15,-.22,.5,.3,.12);for(const side of [-1,1])runtime.block(backpackModel,runtime.mats.wood,side*.28,0,.2,.09,.95,.09);runtime.boy.add(backpackModel)}if(backpackModel)backpackModel.visible=runtime.adventureInventory.backpack;}


function gatherCraftMaterial(){if(!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown||performance.now()<nextGatherTime)return;const wool=woolAnimalNearby(),tree=runtime.treeObjects.find(t=>t.visible&&Math.hypot(t.position.x-runtime.boy.position.x,t.position.z-runtime.boy.position.z)<3.8);if(!wool&&!tree){runtime.notice('🪵 Ветки ищи под деревьями, шерсть — рядом с котиком или кабанчиком.');return}nextGatherTime=performance.now()+2200;if(wool){runtime.adventureInventory.wool++;runtime.notice('🧶 Вычесал немного шерсти. Можно сшить рюкзак или создать зверька.')}else{runtime.adventureInventory.wood++;runtime.notice('🪵 Собрал упавшие ветки для крафта.')}runtime.hud();}

function populateCraftCatalog(){const box=runtime.$('craftCatalog');for(const [kind,recipe] of Object.entries(RECIPES)){if(runtime.$('craft-'+kind))continue;const button=document.createElement('button');button.id='craft-'+kind;button.type='button';button.dataset.category=recipe.category||'equipment';button.textContent=recipe.name+' · '+[recipe.wood?recipe.wood+' ветки':'',recipe.food?recipe.food+' еда':'',recipe.wool?recipe.wool+' шерсть':''].filter(Boolean).join(' + ');box.append(button)}}

function syncCraftPlacement(){const select=runtime.$('craftedChoice'),chosen=runtime.craftWorld.selected;const signature=JSON.stringify(runtime.craftWorld.stock);if(select.dataset.stock!==signature){select.replaceChildren();for(const [kind,count] of Object.entries(runtime.craftWorld.stock)){if(!count)continue;const option=document.createElement('option');option.value=kind;option.textContent=RECIPES[kind].name+' × '+count;select.append(option)}select.dataset.stock=signature}if(runtime.craftWorld.stock[chosen]>0)select.value=chosen;else runtime.craftWorld.selected=select.value||'';select.hidden=!select.options.length;const active=runtime.started&&!runtime.paused&&!runtime.cinematicRunning&&!runtime.endShown;runtime.$('placeCraftAction').hidden=!active||!runtime.craftWorld.selected;runtime.$('placeCraftAction').textContent='Поставить: '+(RECIPES[runtime.craftWorld.selected]?.name||'')+' · T';runtime.$('gatherCraftAction').hidden=!active||!(woolAnimalNearby()||runtime.treeObjects.some(t=>t.visible&&Math.hypot(t.position.x-runtime.boy.position.x,t.position.z-runtime.boy.position.z)<3.8));}

function placeCraftItem(){if(!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown)return false;const kind=runtime.craftWorld.selected;if(!kind||!runtime.craftWorld.stock[kind])return false;if(runtime.craftWorld.items.length>=48){runtime.notice('На карте уже 48 созданных предметов. Сначала освободи место.');return false}const footprint=PROP_FOOTPRINTS[kind]||[1,1],[w,d]=Math.round(craftRotation/(Math.PI/2))%2?[footprint[1],footprint[0]]:footprint,distance=kind==='house'?6:RECIPES[kind].category==='furniture'?1.5:3,x=runtime.boy.position.x+Math.sin(runtime.yaw)*distance,z=runtime.boy.position.z+Math.cos(runtime.yaw)*distance;if(Math.abs(x)+w/2>42||Math.abs(z)+d/2>40||runtime.lakeDepthAt(x,z)>.08){runtime.notice('Найди свободный сухой участок перед собой.');return false}for(const [dx,dz] of [[0,0],[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]])if(runtime.playerWorldBlocked(x+dx,z+dz,.08)){runtime.notice('Здесь мешают деревья, стены или камни. Отойди немного.');return false}const y=Math.max(runtime.terrainHeightAt(x,z)+runtime.familyFloorAt(x,z),runtime.craftWorld.support(x,z,Infinity));const item=runtime.craftWorld.create(kind,x,y,z,runtime.level,craftRotation);if(item.living)item.g.userData.craftedCreature=true;runtime.craftWorld.stock[kind]--;runtime.worldEpoch++;runtime.wallCacheEpoch=-1;runtime.tagStormTargetsForCurrentLocation();runtime.notice('Готово: '+RECIPES[kind].name);syncCraftPlacement();return true;}

function syncCraftUI(){
 updateBackpackVisual();const stock=runtime.$('craftStock');if(!stock)return;stock.textContent='Обломки: '+runtime.adventureInventory.wood+' · Бомбочки: '+runtime.adventureInventory.bombs+' · Шерсть: '+runtime.adventureInventory.wool+' · Еда: '+runtime.food;
 for(const [kind,recipe] of Object.entries(RECIPES)){const button=runtime.$('craft-'+kind);button.disabled=!craftResult(kind,{...runtime.adventureInventory,food: runtime.food})||kind==='lamp'&&runtime.hasFlashlight||kind==='aid'&&runtime.life>=runtime.diffCfg().playerHP||kind==='backpack'&&runtime.adventureInventory.backpack||kind==='wool'&&!woolAnimalNearby()}
 runtime.$('bombAction').hidden=!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown||runtime.adventureInventory.bombs<=0;runtime.$('dismountAction').hidden=!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown||!runtime.mountedFriend;
 runtime.$('bombAction').textContent='💣 Бросить · '+runtime.adventureInventory.bombs;syncCraftPlacement();
}

function craftAdventure(kind){
 if(!runtime.started||runtime.endShown||runtime.cinematicRunning||runtime.life<=0)return false;
 if(kind==='lamp'&&runtime.hasFlashlight||kind==='aid'&&runtime.life>=runtime.diffCfg().playerHP||kind==='backpack'&&runtime.adventureInventory.backpack||kind==='wool'&&!woolAnimalNearby())return false;
 const next=craftResult(kind,{...runtime.adventureInventory,food: runtime.food});if(!next){runtime.$('craftResult').textContent='Не хватает припасов.';return false}
 runtime.adventureInventory.wood=next.wood;runtime.adventureInventory.bombs=next.bombs;runtime.adventureInventory.wool=next.wool||0;runtime.food=next.food;if(kind==='backpack')runtime.adventureInventory.backpack=true;else if(!['bomb','lamp','aid','wool'].includes(kind))runtime.craftWorld.addStock(kind);
 if(kind==='lamp')runtime.hasFlashlight=true;if(kind==='aid')runtime.life=Math.min(runtime.diffCfg().playerHP,runtime.life+2);
 runtime.$('craftResult').textContent=!['bomb','lamp','aid','wool','backpack'].includes(kind)?'Готово! Вернись в игру: T или кнопка размещения — поставить перед собой.':kind==='wool'?'Получено 2 пучка шерсти.':kind==='backpack'?'Рюкзак готов: теперь помещается больше еды.':kind==='bomb'?'Бомбочка готова. Вернись в игру и поставь её кнопкой 💣 или G.':kind==='lamp'?'Фонарик готов.':'Здоровье восстановлено.';
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
"syncCraftUI":{get:()=>syncCraftUI},
"craftAdventure":{get:()=>craftAdventure}
  },
  initialize(){

/* init:let */ nextGatherTime = 0;
/* init:let */ craftRotation = 0;
/* init:let */ backpackModel = null;

runtime.$('rotateCraft').onclick=()=>{craftRotation=(craftRotation+Math.PI/2)%(Math.PI*2);runtime.notice('Направление постройки: '+Math.round(craftRotation*180/Math.PI)+'°')};

runtime.$('craftedChoice').onchange=()=>{runtime.craftWorld.selected=runtime.$('craftedChoice').value;syncCraftPlacement()};

runtime.$('placeCraftAction').onclick=placeCraftItem;

runtime.$('gatherCraftAction').onclick=gatherCraftMaterial;

populateCraftCatalog();
  }
 };

}
