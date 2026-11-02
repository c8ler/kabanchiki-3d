import * as T from '../../vendor/three/three.module.min.js';
import {firstProjectileImpact,segmentBoxEntry} from '../projectile-impact.js?v=225';
const FLAMMABLE=new Set(['house','wall','floor','roof','block','bed','chair','table','wardrobe','palm','flower','standingLamp']);
export function createModule(runtime){
 const craftFires=new Map();let sceneryKey='',scenery=[];
 function releaseVisual(b){
  if(b.flames){b.flames.removeFromParent();b.flames.traverse(m=>{m.geometry?.dispose();m.material?.dispose?.()});b.flames=null}
  if(b.light){b.light.removeFromParent();b.light.dispose?.();b.light=null}
 }
 function cleanupCraftFire(item){
  delete item.g.userData.craftBurning;runtime.sceneryEpoch=-1;
  const b=craftFires.get(item);if(!b)return;releaseVisual(b);
  for(const [mesh,material]of b.originals){const burned=mesh.material;mesh.material=material;if(burned!==material)burned?.dispose?.()}
  craftFires.delete(item);
 }
 function resetCraftHazards(){for(const item of [...craftFires.keys()])cleanupCraftFire(item);sceneryKey='';scenery=[]}
 function igniteCraftObject(item,point){
  if(!item||item.living||item.level!==runtime.level||!item.g.visible||!FLAMMABLE.has(item.kind))return false;
  if(craftFires.has(item))return true;
  item.g.userData.craftBurning=true;runtime.sceneryEpoch=-1;
  const originals=[];item.g.traverse(m=>{if(m.isMesh&&m.material?.color)originals.push([m,m.material])});
  const materials=runtime.prepareFireMaterials(item.g),duration=item.kind==='house'?45:28;
  craftFires.set(item,{time:duration,duration,materials,originals,point:new T.Vector3(point.x,point.y,point.z),flames:null,light:null});
  runtime.notice(item.kind==='house'?'🔥 Домик загорелся от огня босса! Стены остановили снаряд.':'🔥 Огонь босса поджёг преграду. Отойди от пламени!');
  return true;
 }
 function updateCraftFires(dt,now){
  let visuals=0;const limit=runtime.mobile?2:4;
  for(const [item,b]of [...craftFires]){
   if(!runtime.craftWorld.items.includes(item)||item.level!==runtime.level||!item.g.parent){cleanupCraftFire(item);continue}
   if(b.time<=0){runtime.beginCraftDestruction(item,'fire');continue;}
   b.time=Math.max(0,b.time-Math.max(0,dt));
   if(item.g.visible&&visuals<limit){
    visuals++;if(!b.flames){b.flames=runtime.createLivingFire(item.g,item.kind==='house'?'house':'log');b.light=runtime.makeEffectLight(0xff882f,8,14,1.2);b.light.position.set(0,1,0);item.g.add(b.light)}
   }else releaseVisual(b);
   // Material progression is independent of the visual flame budget.
   const dummyLight={intensity:0},dummyFlames={children:[]};
   runtime.updateLivingFire(item.g,{...b,light:b.light||dummyLight,flames:b.flames||dummyFlames},now);
   if(b.time<b.duration-2&&runtime.invuln<=0&&!runtime.cinematicRunning&&!runtime.endShown&&runtime.life>0&&Math.hypot(runtime.boy.position.x-b.point.x,runtime.boy.position.z-b.point.z)<1.2&&Math.abs(runtime.boy.position.y-b.point.y)<2.2){runtime.life--;runtime.statsData.damage++;runtime.invuln=2.4;runtime.lastDeathCause='fire';runtime.playerHitFeedback('fire');runtime.notice('🔥 Горящая преграда обжигает! Отойди!');runtime.hud();if(runtime.life<=0)runtime.showEnd(false)}
   if(b.time===0){releaseVisual(b);runtime.beginCraftDestruction(item,'fire')};
  }
 }
 function sceneryObstacles(){
  const key=runtime.level+':'+runtime.worldEpoch;if(key===sceneryKey)return scenery;
  sceneryKey=key;scenery=[];
  for(const tree of runtime.treeObjects){if(!tree.visible||!tree.parent)continue;const trunk=tree.children.find(m=>m.isMesh&&m.geometry===runtime.trunkGeo);if(trunk)scenery.push({kind:'tree',target:tree,box:new T.Box3().setFromObject(trunk)})}
  for(const [,,,mesh]of [...runtime.rockPositions,...runtime.mountainObstacles,...runtime.lairObstacles])if(mesh?.visible&&mesh.parent?.visible!==false)scenery.push({kind:'stone',target:mesh,box:new T.Box3().setFromObject(mesh)});
  return scenery;
 }
 function bossFireImpact(a,b){
  const obstacles=[...sceneryObstacles().filter(o=>o.target.visible&&o.target.parent?.visible!==false),...runtime.wallGeometry().map(w=>({kind:runtime.houseObjects.includes(w.root)?'house':'wall',target:w.root,box:w.box}))];
  for(const house of runtime.houseObjects)if(house.visible){const roof=house.userData.cutawayWalls?.roof;if(roof)obstacles.push({kind:'house',target:house,box:new T.Box3().setFromObject(roof)})}
  for(const item of runtime.craftWorld.items)if(item.level===runtime.level&&item.g.visible&&!item.living&&!item.airborne)for(const box of [...item.solids,...item.supports])obstacles.push({kind:'craft',target:item,box});
  return firstProjectileImpact(a,b,obstacles,.22);
 }
 function removeBossFireball(index){const shot=runtime.fireballs[index];if(!shot)return;shot.g.removeFromParent();runtime.fireballs.splice(index,1)}
 function updateBossFireballs(dt,now){
  for(let i=runtime.fireballs.length-1;i>=0;i--){
   const q=runtime.fireballs[i],start=q.g.position.clone(),end=start.clone();end.x+=Math.sin(q.a)*dt*5.4;end.z+=Math.cos(q.a)*dt*5.4;end.y=1+Math.sin(now*.018+i)*.18;
   q.age=(q.age||0)+Math.max(0,dt);q.flame.scale.setScalar(.85+Math.sin(now*.025+i)*.25);
   const impact=bossFireImpact(start,end),feet=runtime.boy.position,playerBox={min:{x:feet.x-.43,y:feet.y,z:feet.z-.43},max:{x:feet.x+.43,y:feet.y+runtime.playerPhysicalHeight(),z:feet.z+.43}},playerHit=runtime.invuln<=0&&runtime.boarFormTime<=0?segmentBoxEntry(start,end,playerBox,.22):null;
   if(playerHit!==null&&(!impact||playerHit<impact.t)){
    runtime.life--;runtime.statsData.damage++;runtime.invuln=3;runtime.lastDeathCause='fire';runtime.sound(120,.3,'sawtooth');runtime.playerHitFeedback('fire');removeBossFireball(i);runtime.notice('🔥 Огонь попал! -1❤️');if(runtime.life<=0)runtime.showEnd(false);continue;
   }
   if(impact){q.g.position.copy(impact.point);if(impact.kind==='craft')igniteCraftObject(impact.target,impact.point);else if(impact.kind==='tree')runtime.igniteBossTree(impact.target);else if(impact.kind==='house')runtime.igniteStormTarget(impact.target,'house','boss');removeBossFireball(i);continue}
   q.g.position.copy(end);
   if(q.age>20||Math.abs(end.x)>50||Math.abs(end.z)>50||end.y<runtime.terrainHeightAt(end.x,end.z)){removeBossFireball(i)}
  }
 }
 return{bindings:{craftFires:{get:()=>craftFires},igniteCraftObject:{get:()=>igniteCraftObject},updateCraftFires:{get:()=>updateCraftFires},cleanupCraftFire:{get:()=>cleanupCraftFire},resetCraftHazards:{get:()=>resetCraftHazards},bossFireImpact:{get:()=>bossFireImpact},removeBossFireball:{get:()=>removeBossFireball},updateBossFireballs:{get:()=>updateBossFireballs}},initialize(){runtime.craftWorld.onRemove=item=>{cleanupCraftFire(item);runtime.cancelCraftDestruction(item.g)};runtime.craftWorld.onClear=()=>{resetCraftHazards();runtime.resetCraftDestruction()}}}
}
