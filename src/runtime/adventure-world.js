import { CraftWorld } from "../craft-world.js?v=219";
import { capturedByTornado, TORNADO_REACH, tornadoInfluence } from "../tornado-rules.js?v=219";
import * as THREE from "../../vendor/three/three.module.min.js";
import { riverCenterAt, lakeInletCenterAt } from "../world-surface.js?v=219";

// Owns 15 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let craftWorld,adventureInventory,adventurePickups,armedBombs,blastEffects,adventureCollected,adventureDestroyed,bombShellMat,bombFuseMat,blastRingGeo,blastRingMat;

function objectWorldPoint(o){return o.getWorldPosition(new THREE.Vector3())}

function destroyAdventureObject(obj,kind='tree',reason='bomb'){
 if(!obj?.visible||obj===runtime.personalHouse&&runtime.home.stage===0)return false;
 const at=objectWorldPoint(obj);if(reason==='bomb'){if(kind==='tree'||kind==='log')adventureInventory.wood+=2;if(kind==='tree')runtime.makeCharredTreeRemains(at.x,at.z,.8);if(kind==='house'){const rubble=runtime.makeCharredHouseRemains(obj);rubble.userData.bombHome=obj===runtime.personalHouse;}}
 if(kind==='house'){
  if(obj===runtime.personalHouse){runtime.home.reset();runtime.saveHome();runtime.syncHomeVisual();runtime.syncHomeLocation(runtime.level);}
  else{
   for(const member of runtime.familyMembers)if(!member.done&&Math.hypot(member.g.position.x-at.x,member.g.position.z-at.z)<6){const safe=runtime.nearestSafeSpawn(at.x,at.z+7,.65,{allowRoad:true})||[0,12];member.g.position.set(safe[0],runtime.terrainHeightAt(...safe),safe[1]);member.x=safe[0];member.z=safe[1];}
   obj.visible=false;
  }
 }else obj.visible=false;
 if(obj!==runtime.personalHouse){let set=adventureDestroyed.get(runtime.level);if(!set)adventureDestroyed.set(runtime.level,set=new Set());set.add(obj)}
 runtime.worldEpoch++;runtime.wallCacheEpoch=-1;if(runtime.sceneryBatches)runtime.sceneryEpoch=runtime.worldEpoch;
 return true;
}

function removeAdventureFoe(f,reason){if(!f||f===runtime.friend||f.isBoss||f.flee)return false;const i=runtime.foes.indexOf(f);if(i>=0){runtime.foes.splice(i,1);runtime.levelBoarsDone++;runtime.sendBoarAway(f,reason);return true}return false}

function updateTornado(dt,now){
 if(runtime.friend?.windFlightUntil&&runtime.levelTime>=runtime.friend.windFlightUntil){runtime.friend.g.visible=true;runtime.friend.windFlightUntil=0;runtime.friend.exitBreaking=false;runtime.notice('🐗 Друг приземлился и снова рядом!')}
 for(const member of runtime.familyMembers)if(member.windFlightUntil&&runtime.levelTime>=member.windFlightUntil){member.g.visible=!member.done;member.windFlightUntil=0;}
 const status=runtime.tornadoState.step(dt,runtime.levelTime,runtime.level,runtime.boy.position);
 if(status.warning)runtime.notice('🌪️ До торнадо одна минута! Завершай дела и поспеши к выходу.');
 if(status.spawn)runtime.notice('🌪️ Торнадо появилось! Обходи воронку — вблизи она подхватывает всё.');
 if(!runtime.tornadoState.active||runtime.cinematicRunning||runtime.endShown)return;
 const pull=tornadoInfluence(runtime.boy.position,runtime.tornadoState,runtime.shelteredFromWind());if(pull.strength>0)runtime.movePlayerCollision(pull.x*dt,pull.z*dt);
 if(capturedByTornado(runtime.boy.position,runtime.tornadoState,runtime.shelteredFromWind())){runtime.notice('🌪️ Торнадо подхватило Тимура!');runtime.beginHurricaneScene();return}
 runtime.tornadoSweep-=dt;if(runtime.tornadoSweep>0)return;runtime.tornadoSweep=.22;let grabbed=0;
 const close=(o,r)=>{const q=objectWorldPoint(o);return Math.hypot(q.x-runtime.tornadoState.x,q.z-runtime.tornadoState.z)<r};
 for(const a of runtime.apples){if(grabbed>=3)break;if(!a.done&&close(a.g,TORNADO_REACH)&&runtime.tornadoVisual.capture('food',now/1000,.65)){a.done=true;runtime.scene.remove(a.g);grabbed++}}
 for(let i=adventurePickups.length-1;i>=0&&grabbed<3;i--){const q=adventurePickups[i];if(close(q.g,10)&&runtime.tornadoVisual.capture(q.kind==='wood'?'log':'food',now/1000,.6)){adventureCollected.add(q.key);runtime.disposePickupVisual(q.g);adventurePickups.splice(i,1);grabbed++}}
 for(const [kind,objects] of [['tree',runtime.treeObjects],['house',runtime.houseObjects],['rock',runtime.rockPositions.map(q=>q[3])],['log',runtime.logObstacles.map(o=>o.g)]]){
  if(grabbed>=3)break;
  for(const obj of objects){if(!obj?.visible||!obj.parent||obj===runtime.personalHouse&&runtime.home.stage===0||!close(obj,kind==='house'?4:kind==='tree'?6:9))continue;let shown=true;for(let q=obj.parent;q;q=q.parent)if(!q.visible)shown=false;if(!shown)continue;
   if(runtime.tornadoVisual.capture(kind,now/1000,kind==='tree'?1.2:1)){destroyAdventureObject(obj,kind,'tornado');grabbed++;break}
  }
 }
 for(const f of [...runtime.foes])if(!f.flee&&close(f.g,5)&&runtime.tornadoVisual.captureActor('boar',f.g,now/1000)){if(f.isBoss)continue;if(removeAdventureFoe(f,'tornado'))f.g.visible=false}
 if(runtime.friend?.g&&!runtime.mountedFriend&&!runtime.friend.windFlightUntil&&close(runtime.friend.g,5)&&runtime.tornadoVisual.captureActor('boar',runtime.friend.g,now/1000)){runtime.friend.g.visible=false;runtime.friend.windFlightUntil=runtime.levelTime+7;runtime.friend.exitBreaking=true;const safe=runtime.nearestSafeSpawn(runtime.tornadoState.x>0?-8:8,12,1.8,{allowRoad:true})||[0,12];runtime.friend.g.position.set(safe[0],0,safe[1]);runtime.friend.route=null;runtime.friend.knockback=null;runtime.friendHP=Math.max(1,runtime.friendHP-1);runtime.settleBoarOnGround(runtime.friend);runtime.notice('🐗 Друг кружится в воронке! Он попробует выбраться.')}
 for(const cat of runtime.catLife.cats)if(cat.g.visible&&runtime.catLife.root.visible&&close(cat.g,8)&&runtime.tornadoVisual.captureActor('cat',cat.g,now/1000)){cat.tornadoUntil=runtime.catLife.time+7;cat.g.visible=false;cat.jump=null;const safe=runtime.catLife.safeGround({x:runtime.tornadoState.x>0?-15:15,z:20});cat.g.position.set(safe.x,safe.y,safe.z);cat.state='play';cat.navigation=null;}
 for(const member of runtime.familyMembers)if(!member.done&&member.g.visible&&close(member.g,8)&&runtime.tornadoVisual.captureActor('human',member.g,now/1000)){member.g.visible=false;member.windFlightUntil=runtime.levelTime+7;const safe=runtime.nearestSafeSpawn(runtime.tornadoState.x>0?-12:12,20,.8,{allowRoad:true})||[0,20];member.x=safe[0];member.z=safe[1];member.g.position.set(safe[0],runtime.terrainHeightAt(...safe),safe[1]);}
 for(const item of [...craftWorld.items])if(item.g.visible&&close(item.g,item.living?8:6)){if(item.living?runtime.tornadoVisual.captureActor(item.kind,item.g,now/1000):runtime.tornadoVisual.capture('house',now/1000,1))craftWorld.remove(item);}
 runtime.tornadoVisual.waterSources=[];
 if(runtime.currentSeason!=='winter'){
  const sources=runtime.level===4?[{x:runtime.tornadoState.x,z:riverCenterAt(runtime.tornadoState.x)}]:runtime.level===2?[{x:-18,z:-17},{x:Math.max(-45,Math.min(-22,runtime.tornadoState.x)),z:lakeInletCenterAt(runtime.tornadoState.x)}]:[];
  for(const q of sources)if(Math.hypot(q.x-runtime.tornadoState.x,q.z-runtime.tornadoState.z)<28)runtime.tornadoVisual.waterSources.push({...q,y:runtime.level===2?.14:.05});
 }
 for(const bird of runtime.birdLife.positions||[])if(runtime.birdLife.root.visible&&Math.hypot(bird.x-runtime.tornadoState.x,bird.z-runtime.tornadoState.z)<12){runtime.birdLife.lift?.(bird.index,runtime.tornadoState,8);}

}
 return {
  bindings:{
"craftWorld":{get:()=>craftWorld},
"adventureInventory":{get:()=>adventureInventory},
"adventurePickups":{get:()=>adventurePickups},
"armedBombs":{get:()=>armedBombs},
"blastEffects":{get:()=>blastEffects},
"adventureCollected":{get:()=>adventureCollected},
"adventureDestroyed":{get:()=>adventureDestroyed},
"bombShellMat":{get:()=>bombShellMat},
"bombFuseMat":{get:()=>bombFuseMat},
"blastRingGeo":{get:()=>blastRingGeo},
"blastRingMat":{get:()=>blastRingMat},
"objectWorldPoint":{get:()=>objectWorldPoint},
"destroyAdventureObject":{get:()=>destroyAdventureObject},
"removeAdventureFoe":{get:()=>removeAdventureFoe},
"updateTornado":{get:()=>updateTornado}
  },
  initialize(){


/* init:const */ craftWorld = new CraftWorld(runtime.scene,runtime.mats,{cat:()=>{const actor=runtime.catLife.model(2,new THREE.Group());actor.gameTimer=0;actor.g.craftedCatActor=actor;return actor.g},human:()=>{const g=runtime.makeBoy();g.traverse(m=>{if(m.isMesh)m.geometry=m.geometry.clone()});g.scale.setScalar(.52);return g},light:()=>runtime.makeEffectLight(0xffd59b,7,10)});

/* init:const */ adventureInventory = {wood:0,bombs:0,wool:0,backpack:false};
/* init:const */ adventurePickups = [];
/* init:const */ armedBombs = [];
/* init:const */ blastEffects = [];
/* init:const */ adventureCollected = new Set();
/* init:const */ adventureDestroyed = new Map();

/* init:const */ bombShellMat = new THREE.MeshLambertMaterial({color:0x313b49});
/* init:const */ bombFuseMat = new THREE.MeshBasicMaterial({color:0xffcc78});
/* init:const */ blastRingGeo = new THREE.RingGeometry(.96,1,40);
/* init:const */ blastRingMat = new THREE.MeshBasicMaterial({color:0xf09968,transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false});
  }
 };

}
