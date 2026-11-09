import * as T from '../../vendor/three/three.module.min.js';
import {CaravanRaid,CARAVAN_LEVEL,CARAVAN_ACTORS,RAID_SECONDS,caravanRouteClear,caravanFootprint,caravanRoof} from '../caravan-raid.js?v=228';
import {createCaravanVisual} from '../caravan-visual.js?v=228';
export function createModule(runtime){
 let obstacleEpoch=-1,obstacleCache=new Map();
 let caravan=null,visual=null,visit=0,spawnClock=0,attempted=false,lootTaken=new Set(),openedAt=0,hurtClock=0,clock=0;
 const active=()=>runtime.started&&!runtime.paused&&!runtime.cinematicRunning&&!runtime.endShown&&!runtime.win&&runtime.life>0;
 const helper=()=>runtime.boarFormTime>0||!!(runtime.mountedFriend&&runtime.friend&&!runtime.friend.flee);
 function caravanObstacle(x,z,r=.4,height=0){return !!(caravan&&runtime.level===visit&&caravan.state!=='gone'&&caravanFootprint(caravan.point(),x,z,r,height))}
 function actorBlocked(x,z,r=.55){
  if(obstacleEpoch!==runtime.worldEpoch||obstacleCache.size>600){obstacleEpoch=runtime.worldEpoch;obstacleCache.clear()}
  const key=x.toFixed(1)+':'+z.toFixed(1)+':'+r;let blocked=obstacleCache.get(key);if(blocked===undefined){blocked=runtime.worldObstacleAt(x,z,r,true)||runtime.craftWorld.blocked(x,z,runtime.terrainHeightAt(x,z),r,3.4);obstacleCache.set(key,blocked)}return blocked;
 }
 function caravanSupport(x,z){if(!caravan||runtime.level!==visit||caravan.state==='gone')return 0;const p=caravan.point(),roof=caravanRoof(p,x,z);return roof?Math.max(0,runtime.terrainHeightAt(p.x,p.z)+roof-runtime.terrainHeightAt(x,z)):0}
 function corridorBlocked(x,z){
  if(Math.abs(x)>37||Math.abs(z)>37||(runtime.waterAt(x,z)?.depth||0)>.12)return true;
  return actorBlocked(x,z,2.6);
 }
 function caravanActors(){return caravan&&visual?.root.visible&&runtime.level===CARAVAN_LEVEL?visual.actors.filter(a=>a.g.visible):[]}
 function resetCaravan(level=runtime.level){caravan=null;visual?.hide();visit=level;spawnClock=0;attempted=false;lootTaken=new Set();openedAt=0;hurtClock=0;runtime.$('caravanAction').hidden=true;runtime.$('caravanHint').hidden=true}
 function spawnCaravan(){
  if(!runtime.cheatSession.active||caravan||!runtime.creatureRoom(CARAVAN_ACTORS))return false;
  const routes=[],origin=runtime.boy.position;
  for(const angle of [runtime.yaw,0,Math.PI,Math.PI/2,-Math.PI/2])for(const length of [26,18]){
   const dx=Math.sin(angle),dz=Math.cos(angle);routes.push([{x:origin.x+dx*7,z:origin.z+dz*7},{x:origin.x+dx*(7+length),z:origin.z+dz*(7+length)}]);
  }
  if(runtime.level===CARAVAN_LEVEL)routes.push([{x:0,z:-30},{x:0,z:30}]);
  for(const route of routes){
   if(!caravanRouteClear(route,corridorBlocked))continue;visit=runtime.level;
   caravan=new CaravanRaid(route);visual??=createCaravanVisual(runtime.scene);lootTaken=new Set();openedAt=0;attempted=true;
   visual.update({raid:caravan,time:clock,lootTaken,openedAt,blocked:actorBlocked},runtime.terrainHeightAt);
   runtime.notice('🛞 Караван вызван! Подъедь к повозке верхом на кабанчике — можно устроить налёт.');return true;
  }
  return false;
 }
 function nearCaravan(range=5.2){const p=caravan?.point();return !!p&&Math.hypot(p.x-runtime.boy.position.x,p.z-runtime.boy.position.z)<range}
 function clearApproach(){if(!caravan)return false;const p=caravan.point();return runtime.clearWallLine(runtime.boy.position.clone().add(new T.Vector3(0,.9,0)),new T.Vector3(p.x,runtime.terrainHeightAt(p.x,p.z)+1.1,p.z))}
 function interactCaravan(){
  if(!active()||!caravan||!nearCaravan()||!['travel','raid'].includes(caravan.state)||!clearApproach())return false;
  if(caravan.state==='raid')return true;
  if(!helper()){runtime.notice('🐗 Для налёта сядь на кабанчика-друга или превратись в кабанчика.');return true}
  if(caravan.start({near:true,helper:true,clear:clearApproach()})){runtime.stopFishing();runtime.notice('🐗 Налёт! Держись рядом с повозкой: кабанчик прорвёт охрану тремя ударами.');runtime.sound(170,.18,'triangle')}
  return true;
 }
 function opened(result){
  if(!result)return;openedAt=caravan.age;
  if(result.reason==='raid'){runtime.notice('💰 Караван ограблен! Подбери ящики: еда, материалы и лечебные припасы.');runtime.softCrateSound()}
  else runtime.notice('💥 Повозка разбита! Припасы рассыпались рядом.');
  runtime.hud();
 }
 function blastCaravan(b,radius=7){
  if(!caravan||caravan.state==='gone')return false;const p=caravan.point();if(Math.hypot(p.x-b.x,p.z-b.z)>radius)return false;
  const source=new T.Vector3(b.x,b.y+.5,b.z),target=new T.Vector3(p.x,runtime.terrainHeightAt(p.x,p.z)+1,p.z);if(!runtime.clearWallLine(source,target))return false;
  opened(caravan.open('bomb'));return true;
 }
 function updateCaravan(dt){
  if(visit!==runtime.level)resetCaravan(runtime.level);
  if(!active())return;
  if(!runtime.cheatSession.has('caravan')){if(caravan)resetCaravan(runtime.level);return}
  const elapsed=Math.max(0,Math.min(.25,dt));clock+=elapsed;
  if(!caravan){spawnClock+=elapsed;if(!attempted&&spawnClock>=2){spawnClock=0;spawnCaravan()}return}
  if(caravan.state==='gone'){visual.hide();return}
  const p=caravan.point(),close=nearCaravan(5.5),help=helper(),clear=clearApproach();
  const result=caravan.update(elapsed,{near:close,helper:help,clear,blocked:(x,z)=>corridorBlocked(x,z)||Math.hypot(runtime.boy.position.x-x,runtime.boy.position.z-z)<3.1||runtime.boarBodies().some(b=>b.g.visible&&!b.flee&&Math.hypot(b.g.position.x-x,b.g.position.z-z)<2.9)||runtime.familyMembers.some(f=>!f.done&&Math.hypot(f.g.position.x-x,f.g.position.z-z)<3)});
  if(result.hit){if(runtime.friend?.b&&runtime.mountedFriend)runtime.friend.b.rotation.x=-.22;runtime.sound(110,.12,'triangle')}
  if(result.opened)opened(result);
  if(result.abandoned)runtime.notice('🛞 Караван отбился и продолжает путь. Подъедь на кабанчике, чтобы попробовать снова.');
  if(runtime.tornadoState.active&&Math.hypot(p.x-runtime.tornadoState.x,p.z-runtime.tornadoState.z)<5)opened(caravan.open('tornado'));
  hurtClock=Math.max(0,hurtClock-elapsed);
  if(caravan.state==='raid'&&close&&!help&&hurtClock<=0&&runtime.invuln<=0&&clear){
   hurtClock=2;runtime.life=Math.max(0,runtime.life-1);runtime.invuln=1.7;runtime.statsData.damage++;runtime.playerHitFeedback('caravan');runtime.notice('🛡️ Охрана оттесняет Тимура! Вернись на кабанчика или отойди.');if(runtime.life<=0)runtime.showEnd(false);
  }
  visual.update({raid:caravan,time:clock,lootTaken,openedAt},runtime.terrainHeightAt);
  if(caravan.state==='loot'&&caravan.age-openedAt>.8){
   for(let i=0;i<visual.loot.length;i++){const g=visual.loot[i];if(lootTaken.has(i)||g.position.distanceTo(runtime.boy.position)>2)continue;
    if(i===0){const amount=Math.min(4,runtime.foodCapacity()-runtime.food);if(amount<=0)continue;runtime.food+=amount;runtime.notice('🍎 Из каравана: +'+amount+' еды.')}
    else if(i===1){runtime.adventureInventory.wood+=6;runtime.adventureInventory.wool+=2;runtime.notice('📦 Из каравана: 6 веток и 2 шерсти.')}
    else{if(runtime.life>=runtime.diffCfg().playerHP)continue;runtime.life=Math.min(runtime.diffCfg().playerHP,runtime.life+2);runtime.notice('🫐 Лечебные припасы из каравана: здоровье восстановлено.')}
    lootTaken.add(i);runtime.effect('pickup');runtime.hud();
   }
  }
 }
 function syncCaravanUI(){
  const button=runtime.$('caravanAction'),hint=runtime.$('caravanHint'),show=active()&&caravan&&caravan.state!=='gone'&&runtime.level===CARAVAN_LEVEL;
  button.hidden=!show||!nearCaravan()||caravan.state==='loot'||!clearApproach();hint.hidden=true;if(!show)return;
  button.disabled=caravan.state==='raid';button.textContent=caravan.state==='raid'?'🐗 Налёт · '+caravan.hits+'/3':'🐗 Ограбить караван · E';
  const p=caravan.point();if(Math.hypot(p.x-runtime.boy.position.x,p.z-runtime.boy.position.z)>25)return;
  const point=new T.Vector3(p.x,runtime.terrainHeightAt(p.x,p.z)+4,p.z).project(runtime.camera);if(point.z<-1||point.z>1||Math.abs(point.x)>.88||Math.abs(point.y)>.85)return;
  hint.hidden=false;hint.style.left=(point.x*.5+.5)*innerWidth+'px';hint.style.top=(-point.y*.5+.5)*innerHeight+'px';
  hint.querySelector('span').textContent=caravan.state==='loot'?'📦 Подбери добычу':caravan.state==='raid'?'Охрана · '+caravan.hits+'/3':'🛞 Караван · '+(helper()?'можно ограбить':'нужен кабанчик');
  hint.querySelector('i').hidden=caravan.state!=='raid';hint.style.setProperty('--fill',Math.round(caravan.progress/RAID_SECONDS*100)+'%');
 }
 function caravanSnapshot(){return{state:caravan?.state||'none',level:runtime.level,point:caravan?.point(),hits:caravan?.hits||0,score:runtime.score,loot:[...lootTaken],actors:caravanActors().length,drawCalls:visual?.drawCalls||0}}
 return{bindings:{caravanSupport:{get:()=>caravanSupport},caravanObstacle:{get:()=>caravanObstacle},caravanActors:{get:()=>caravanActors},resetCaravan:{get:()=>resetCaravan},spawnCaravan:{get:()=>spawnCaravan},interactCaravan:{get:()=>interactCaravan},blastCaravan:{get:()=>blastCaravan},updateCaravan:{get:()=>updateCaravan},syncCaravanUI:{get:()=>syncCaravanUI},caravanSnapshot:{get:()=>caravanSnapshot}},initialize(){}}
}
