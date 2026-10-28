import * as THREE from '../../vendor/three/three.module.min.js';
import {parseCheatCode} from '../cheat-codes.js?v=219';
import {createIsland,islandDepth,SECRET_LEVEL} from '../creative-island.js?v=219';
import {SecretEntry} from '../secret-entry.js?v=219';
export function createModule(runtime){
 let secretEntry=new SecretEntry(),secretMenuOpen=false;
 function openSecretMenu(){
  if(!runtime.started||runtime.cinematicRunning||runtime.endShown||runtime.win||runtime.life<=0)return false;
  runtime.setPause(true);secretMenuOpen=true;runtime.$('pauseMenu').style.display='none';runtime.$('secretMenu').style.display='grid';runtime.$('secretMenu').firstElementChild.scrollTop=0;return true;
 }
 function closeSecretMenu(backToPause=true){
  secretMenuOpen=false;secretEntry.reset();runtime.$('secretMenu').style.display='none';
  if(backToPause&&runtime.started&&!runtime.cinematicRunning&&!runtime.endShown)runtime.setPause(true);
 }

 let sandboxReturnSeason=null;
 let craftUnlocked,homeUnlocked,sandboxMode,sandboxVisual,creativeNight;
 function refillCreative(){runtime.adventureInventory.wood=200;runtime.adventureInventory.wool=200;runtime.adventureInventory.bombs=20;runtime.food=runtime.foodCapacity();runtime.life=runtime.diffCfg().playerHP;runtime.invuln=999}
 function leaveSandbox(){
  if(!sandboxMode)return;sandboxMode=false;if(sandboxReturnSeason)runtime.currentSeason=sandboxReturnSeason;
  if(sandboxVisual){sandboxVisual.visible=false;for(const m of sandboxVisual.userData.solids){const index=runtime.treeSolidMeshes.indexOf(m);if(index>=0)runtime.treeSolidMeshes.splice(index,1)}for(const entry of sandboxVisual.userData.rocks){const index=runtime.rockPositions.indexOf(entry);if(index>=0)runtime.rockPositions.splice(index,1)}}
  runtime.syncSeasonChoices();runtime.weatherBaseSky=null;runtime.worldEpoch++;runtime.wallCacheEpoch=-1;
 }
 function enterSandbox(){
  leaveSandbox();sandboxReturnSeason=runtime.currentSeason;runtime.loadLevel(2);sandboxMode=true;craftUnlocked=homeUnlocked=true;runtime.level=SECRET_LEVEL;
  runtime.clearEntities(runtime.foes);runtime.clearEntities(runtime.familyMembers);runtime.clearEntities(runtime.friends);
  runtime.locationExit=null;runtime.opening=null;runtime.lakeExitProps.visible=false;
  for(const props of runtime.locationExitProps.values())props.visible=false;
  for(const h of runtime.houseObjects)h.visible=false;
  runtime.homeYard.visible=false;for(const p of runtime.homePiles)p.visible=false;
  runtime.lakeVisual.visible=runtime.riverVisual.visible=runtime.forestVisual.visible=runtime.forestGround.visible=false;
  for(const t of runtime.treeObjects)t.visible=false;for(const [,,,m]of runtime.rockPositions)if(m)m.visible=false;
  for(const o of runtime.biomeObjects)o.visible=false;
  for(const a of runtime.apples)runtime.scene.remove(a.g);runtime.apples.length=0;
  for(const a of runtime.adventurePickups)runtime.disposePickupVisual(a.g);runtime.adventurePickups.length=0;
  sandboxVisual??=createIsland(THREE,runtime.mats);if(!sandboxVisual.parent)runtime.scene.add(sandboxVisual);sandboxVisual.visible=true;
  runtime.treeSolidMeshes.push(...sandboxVisual.userData.solids);runtime.rockPositions.push(...sandboxVisual.userData.rocks);
  for(const [,,,m]of sandboxVisual.userData.rocks)m.visible=true;
  runtime.craftWorld.visible(SECRET_LEVEL);runtime.catLife.root.visible=false;runtime.birdLife.root&&(runtime.birdLife.root.visible=false);
  runtime.portalObj.g.visible=false;runtime.roadSurface.visible=runtime.roadEdge.visible=false;
  runtime.currentSeason='summer';runtime.seasonVisual.visible=false;runtime.levelTime=0;runtime.weatherStage=0;runtime.weatherGroup.visible=false;runtime.tornadoState.reset();
  runtime.$('pauseSeason').closest('label').hidden=true;creativeNight=false;runtime.scene.background.set(0xb1a8e0);runtime.scene.fog.color.copy(runtime.scene.background);runtime.scene.fog.near=40;runtime.scene.fog.far=120;
  runtime.sun.intensity=2;runtime.hemi.intensity=1.8;runtime.ground.material.color.set(0xcbd2eb);
  runtime.boy.position.set(0,0,12);runtime.py=runtime.vy=0;runtime.yaw=Math.PI;runtime.worldEpoch++;runtime.wallCacheEpoch=-1;
  runtime.rebuildWorldSurface();runtime.refreshBlastSurface();refillCreative();runtime.syncCraftUI();runtime.hud();
  runtime.notice('✨ Секретный остров. В меню читов создавай зверьков и строй всё, что захочешь. Здесь можно экспериментировать без спешки.');
  return true;
 }
 function updateCreative(dt){if(!sandboxMode)return;refillCreative();runtime.weatherGroup.visible=false;runtime.tornadoState.active=false;if(sandboxVisual?.userData.ring)sandboxVisual.userData.ring.rotation.z+=dt*.08}
 function applyCheat(value){
  const code=parseCheatCode(value),result=runtime.$('cheatResult');
  if(!code){result.textContent='Неизвестный код.';return false}
  if(!runtime.started||runtime.endShown||runtime.win||runtime.life<=0||runtime.cinematicRunning){result.textContent='Открой читы в меню паузы во время игры.';return false}
  runtime.keys={};runtime.stick.x=runtime.stick.y=0;runtime.jump=false;runtime.stopFishing();
  const supply=()=>{runtime.adventureInventory.wood=200;runtime.adventureInventory.wool=200;runtime.food=runtime.foodCapacity();runtime.home.wood=Math.max(8,runtime.home.wood)};
  if(code.type==='sandbox'){enterSandbox();result.textContent='✨ Секретный остров открыт. Нажми «Продолжить».'}
  else if(code.type==='level'){
   for(const shot of runtime.shots)runtime.scene.remove(shot.g);runtime.shots.length=0;runtime.throwCooldown=0;runtime.endBoarForm();
   runtime.life=runtime.diffCfg().playerHP;runtime.invuln=3;runtime.py=runtime.vy=0;runtime.hasFlashlight=false;runtime.torch.intensity=0;runtime.loadLevel(code.level);
   result.textContent='Локация '+code.level+': '+runtime.levels[code.level-1]+'. Нажми «Продолжить».';
  }else if(code.type==='craft'){craftUnlocked=true;supply();runtime.$('craftPanel').hidden=false;runtime.$('craftPanel').open=true;result.textContent='⚒ Мастерская открыта. Создай предмет и вернись в игру: T — поставить, Z — повернуть.'}
  else if(code.type==='home'){homeUnlocked=true;supply();if(sandboxMode){runtime.craftWorld.addStock('house');result.textContent='🏠 Домик подготовлен: T — поставить.'}else{runtime.syncHomeVisual();runtime.syncHomeLocation(runtime.level);result.textContent='🏠 Стройка включена. В деревне иди к площадке «Мой домик»; B — строить.'}}
  else if(code.type==='supplies'){supply();result.textContent='🎒 Припасы пополнены.'}
  else if(code.type==='heal'){runtime.life=runtime.diffCfg().playerHP;result.textContent='💚 Здоровье восстановлено.'}
  else if(code.type==='clear'){runtime.craftWorld.clear();runtime.worldEpoch++;runtime.wallCacheEpoch=-1;result.textContent='🧹 Созданные предметы и спутники убраны.'}
  else if(code.type==='spawnCat'||code.type==='spawnDog'){craftUnlocked=true;runtime.craftWorld.addStock(code.type==='spawnCat'?'cat':'dog');result.textContent='Спутник подготовлен. Вернись в игру: T — выпустить перед собой.'}
  else if(code.type==='friend'){
   if(runtime.friend?.g)runtime.scene.remove(runtime.friend.g);const q=runtime.nearestSafeSpawn(runtime.boy.position.x+3,runtime.boy.position.z,.9,{allowRoad:true})||[0,12];
   runtime.friend=runtime.makeBoar(q[0],q[1],true);runtime.friendHP=runtime.diffCfg().friendHP;result.textContent='🐗 Кабанчик-друг рядом.';
  }else if(code.type==='bomb'){runtime.adventureInventory.bombs++;result.textContent='💣 Получена 1 бомбочка. Нажми «Продолжить», затем G или кнопку 💣.'}
  else if(code.type==='light'){runtime.hasFlashlight=!runtime.hasFlashlight;runtime.torch.intensity=runtime.hasFlashlight?42:0;if(runtime.hasFlashlight){if(runtime.flashlightObj){runtime.scene.remove(runtime.flashlightObj);runtime.flashlightObj=null}result.textContent='Фонарик получен.';}else{if(runtime.flashlightObj)runtime.scene.remove(runtime.flashlightObj);const point=runtime.nearestSafeSpawn(runtime.boy.position.x+Math.sin(runtime.yaw)*2.8,runtime.boy.position.z+Math.cos(runtime.yaw)*2.8,.5)||[runtime.boy.position.x,runtime.boy.position.z];runtime.flashlightObj=runtime.group(point[0],point[1]);runtime.flashlightObj.position.y=runtime.terrainHeightAt(point[0],point[1]);runtime.block(runtime.flashlightObj,runtime.mats.gold,0,.45,0,.35,.35,.8);runtime.block(runtime.flashlightObj,runtime.mats.white,0,.45,.55,.28,.28,.28);runtime.flashlightDropUntil=performance.now()+3000;result.textContent='Фонарик выброшен рядом. Его можно подобрать или вернуть кодом LIGHT.';}}
  else {if(code.form==='boar')runtime.startBoarForm();else if(code.form==='cat')runtime.startCatForm();else runtime.endBoarForm();result.textContent=code.form==='human'?'Тимур снова мальчик.':'Превращение на 30 секунд.'}
  runtime.hud();return true;
 }
 return {bindings:{
 "secretMenuOpen":{get:()=>secretMenuOpen},
 "openSecretMenu":{get:()=>openSecretMenu},
 "closeSecretMenu":{get:()=>closeSecretMenu},
 "craftUnlocked":{get:()=>craftUnlocked,set:v=>{craftUnlocked=v}},
 "homeUnlocked":{get:()=>homeUnlocked,set:v=>{homeUnlocked=v}},
 "sandboxMode":{get:()=>sandboxMode},
 "sandboxVisual":{get:()=>sandboxVisual},
 "creativeNight":{get:()=>creativeNight},
 "refillCreative":{get:()=>refillCreative},"leaveSandbox":{get:()=>leaveSandbox},"enterSandbox":{get:()=>enterSandbox},"updateCreative":{get:()=>updateCreative},"applyCheat":{get:()=>applyCheat}
 },initialize(){
 runtime.$("versionSecret").textContent=runtime.GAME_VERSION;
 runtime.$("versionSecret").onclick=()=>{if(runtime.paused&&secretEntry.tap(performance.now()))openSecretMenu()};
 runtime.$("secretBack").onclick=()=>closeSecretMenu();
 runtime.$("secretResume").onclick=()=>{closeSecretMenu(false);runtime.setPause(false);runtime.requestDesktopMouseLock()};
 craftUnlocked=false;homeUnlocked=false;sandboxMode=false;sandboxVisual=null;creativeNight=false}}
}
