import * as T from '../../vendor/three/three.module.min.js';
import {installResourceWatch} from './resource-watch.js';
import {inspectState} from './audit-observer.js';
export function createQaPart(runtime){
 let clock=performance.now(),resourceWatch=null;
 function state(){
  const active=[runtime.boy,...[runtime.friend,...runtime.foes,...runtime.friends].filter(Boolean).map(a=>a.g),...runtime.craftWorld.items.map(a=>a.g)];
  const managed=runtime.creatureEntries().length,fish=runtime.aquaticFish.filter(a=>a.level===runtime.level&&a.g.visible).length,birds=runtime.birdLife.root.visible?runtime.birdLife.body.count:0;
  const observation={level:runtime.level,positions:active.map(g=>g.position.toArray()),numbers:{life:runtime.life,food:runtime.food,py:runtime.py,vy:runtime.vy,time:runtime.levelTime,total:runtime.totalTime,score:runtime.score},
   creatures:managed+fish+birds,pets:runtime.craftWorld.petCount(),cat:runtime.catFormTime>0,boar:runtime.boarFormTime>0,flight:runtime.islandFlight.active,
   bombs:runtime.armedBombs.map(b=>({left:b.left,age:b.age})),paused:runtime.paused,cinematic:runtime.cinematicRunning,ended:runtime.endShown||runtime.life<=0||runtime.win,
   geometries:runtime.renderer.info.memory.geometries,textures:runtime.renderer.info.memory.textures,children:runtime.scene.children.length,
   calls:runtime.renderer.info.render.calls,triangles:runtime.renderer.info.render.triangles,score:runtime.score,cheats:runtime.cheatSession.active,friend:!!runtime.friend};
  return{...observation,issues:inspectState(observation)};
 }
 function advance(elapsed){
  const dt=Math.min(.05,elapsed);clock+=elapsed*1000;runtime.boarCollisionEpoch++;
  if(!runtime.cinematicRunning&&!runtime.endShown&&runtime.life>0&&!runtime.win){
   runtime.updateSimulation(dt,clock,elapsed);runtime.catLife.epoch=runtime.worldEpoch;
   runtime.catLife.update(dt,runtime.birdLife,runtime.boarBodies(),runtime.boy.position,runtime.mountedFriend?runtime.friend:null,runtime.craftWorld.items.filter(i=>i.g.visible&&i.catActor).map(i=>i.catActor));
  }
  runtime.enforceCreatureLimit(true);
 }
 return{
  deepSetup(level=3){this.releaseSetup(level,true);runtime.adventureInventory.bombs=8;runtime.adventureInventory.wood=100;runtime.adventureInventory.wool=100;runtime.food=runtime.foodCapacity();clock=performance.now();return state()},
  deepState(){return state()},
  deepTornadoFood(){
   this.deepSetup(3);for(const a of runtime.apples)runtime.disposePickupVisual(a.g);runtime.apples.length=0;
   let disposed=0;const owned=new Set();
   for(let i=0;i<3;i++){runtime.makeForage('berry',i*.15,0);const a=runtime.apples.at(-1);a.g.traverse(m=>{if(m.geometry&&m.geometry!==runtime.cube)owned.add(m.geometry)})}
   for(const g of owned)g.addEventListener('dispose',()=>disposed++);
   runtime.boy.position.set(30,0,30);runtime.tornadoVisual.reset();runtime.tornadoState.active=true;runtime.tornadoState.x=runtime.tornadoState.z=0;runtime.tornadoSweep=0;
   runtime.updateTornado(0,performance.now());runtime.paused=true;
   return{consumed:runtime.apples.filter(a=>a.done).length,remaining:runtime.apples.filter(a=>a.g.parent).length,owned:owned.size,disposed,...state()};
  },
  deepWatchResources(){resourceWatch??=installResourceWatch(T);return resourceWatch.snapshot(runtime.scene)},
  deepResources(){return resourceWatch?.snapshot(runtime.scene)},
  deepAction(action,live=false){
   const previousRandom=Math.random;let seed=action.seed>>>0;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
   try{
    if(runtime.cinematicRunning||runtime.endShown||runtime.life<=0||runtime.win)return state();
    runtime.paused=false;runtime.keys={};runtime.jump=false;runtime.keys[['KeyW','KeyD','KeyS','KeyA'][action.direction%4]]=true;
    if(action.kind==='jump')runtime.queuePlayerJump();
    if(action.kind==='feed')runtime.feed();
    if(action.kind==='form')runtime.applyCheat(['CAT','BOAR','TIMUR'][action.value%3]);
    if(action.kind==='bomb')runtime.placeAdventureBomb();
    if(action.kind==='craft'){const kind=['block','chair','flower'][action.value%3];runtime.craftWorld.addStock(kind);runtime.craftWorld.selected=kind;runtime.craftRotation=action.value*Math.PI/2;runtime.placeCraftItem()}
    if(action.kind==='camera')runtime.$('camera').click();
    if(action.kind==='mount'){if(runtime.mountedFriend)runtime.dismountFriendNow();else runtime.mountFriendNow(false)}
    if(action.kind==='menu'){runtime.openSecretMenu();runtime.closeSecretMenu(false);runtime.paused=false}
    if(action.kind==='pause'){runtime.setPause(true);runtime.setPause(false)}
    if(action.kind==='storm'){runtime.tornadoState.schedule(runtime.levelTime-16);runtime.updateTornado(0,clock)}
    for(let i=0;i<Math.max(1,Math.ceil(action.seconds*action.fps));i++)advance(1/action.fps);
    runtime.keys={};runtime.jump=false;runtime.paused=!live;return state();
   }finally{Math.random=previousRandom}
  },
  deepLive(on=true){runtime.clearInput();runtime.paused=!on;return state()},
  deepPause(on=true){runtime.setPause(on);return state()},
  deepGap(seconds=1){runtime.paused=false;runtime.keys={KeyW:true};const before=runtime.boy.position.clone(),time=runtime.levelTime;advance(seconds);runtime.keys={};runtime.paused=true;return{before:before.toArray(),distance:before.distanceTo(runtime.boy.position),elapsed:runtime.levelTime-time,...state()}},
  deepMovingObjects(){
   this.deepSetup(3);runtime.paused=false;runtime.keys={KeyW:true};runtime.craftWorld.addStock('block');runtime.craftWorld.selected='block';
   const before=runtime.boy.position.clone();advance(.05);const bomb=runtime.placeAdventureBomb(),placed=runtime.placeCraftItem();advance(.05);runtime.keys={};runtime.paused=true;
   return{bomb:!!bomb,placed:!!placed,moved:before.distanceTo(runtime.boy.position),blocks:runtime.craftWorld.items.filter(i=>i.kind==='block').length,...state()};
  },
  deepBombPause(){this.deepSetup(3);runtime.paused=false;runtime.placeAdventureBomb();advance(.05);runtime.setPause(true);return state()},
  deepMapWithBomb(){this.deepSetup(3);runtime.paused=false;runtime.placeAdventureBomb();const before=runtime.armedBombs.length;runtime.loadLevel(4);runtime.paused=true;return{before,...state()}},
  deepStormPause(){this.deepSetup(7);runtime.tornadoState.schedule(runtime.levelTime-16);runtime.updateTornado(.01,clock);runtime.setPause(true);return{active:runtime.tornadoState.active,age:runtime.tornadoState.age,...state()}},
  deepStormAge(){return runtime.tornadoState.age},
  deepDream(){this.v221DreamBed();runtime.startBedDream();runtime.cinematicFinish?.();runtime.cinematicFinish?.();return this.v221DreamInspect()},
  deepDreamWake(){runtime.wakeFromDream();runtime.paused=true;return this.v221DreamInspect()},
  deepResetEffects(){runtime.exitCheatMode();runtime.paused=true;runtime.enforceCreatureLimit(true);return state()}
 };
}
