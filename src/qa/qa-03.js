import { stormClock } from "../tornado-rules.js?v=218";
import { HOME_SITE } from "../home-construction.js?v=218";
import * as THREE from "../../vendor/three/three.module.min.js";

export function createQaPart(runtime){
 return {
v212Setup(n=3){runtime.closeSecretMenu(false);runtime.craftUnlocked=runtime.homeUnlocked=true;
  runtime.cineClear();runtime.cinematicRunning=false;runtime.cinematicFinish=null;runtime.$('cinematic').style.display='none';runtime.$('pauseMenu').style.display='none';runtime.endShown=runtime.win=false;runtime.started=true;runtime.paused=true;runtime.boarFormTime=runtime.catFormTime=0;runtime.mountedFriend=false;runtime.py=runtime.vy=0;runtime.keys={};runtime.stick.x=runtime.stick.y=0;runtime.jump=runtime.act=false;runtime.invuln=999;runtime.resetAdventureItems(true);this.season(0);this.load(n);runtime.paused=true;runtime.life=runtime.diffCfg().playerHP;runtime.food=4;runtime.stopFishing();runtime.boy.position.set(0,0,20);return true;
 },
v212Tornado(seconds=300,near=false,season=0,n=3){
  this.v212Setup(n);this.season(season*20);runtime.levelTime=seconds;runtime.boy.position.set(0,0,20);runtime.updateTornado(0,performance.now());const farCarry=runtime.hurricaneCarry;
  if(near&&runtime.tornadoState.active){runtime.boy.position.set(runtime.tornadoState.x+.5,0,runtime.tornadoState.z);runtime.updateTornado(0,performance.now())}
  runtime.hud();return {clock:stormClock(runtime.levelTime,runtime.level),active:runtime.tornadoState.active,farCarry,carry:runtime.hurricaneCarry,movie:runtime.movie?.kind,eye:{x:runtime.tornadoState.x,z:runtime.tornadoState.z},text:runtime.$('message').textContent};
 },
v212WeatherWarning(season=0){this.v212Setup(3);this.season(season*20);runtime.levelTime=240;runtime.updateWeather(0,performance.now());return {text:runtime.$('message').textContent,warned:runtime.tornadoState.warned};},
v212Swirl(){
  this.v212Setup(3);
  // Keep the per-sweep capture budget focused on this fixture, not random forage.
  for(const food of runtime.apples)runtime.scene.remove(food.g);runtime.apples.length=0;
  for(const pickup of runtime.adventurePickups)runtime.disposePickupVisual(pickup.g);runtime.adventurePickups.length=0;
  runtime.levelTime=300;runtime.updateTornado(0,performance.now());const tree=runtime.treeObjects.find(t=>t.visible&&Math.hypot(t.position.x,t.position.z-20)>18);runtime.tornadoState.x=tree.position.x;runtime.tornadoState.z=tree.position.z;const g=runtime.makeFoodModel('mushroom',runtime.scene,runtime.tornadoState.x,0,runtime.tornadoState.z+1),a={g,x:g.position.x,y:0,z:g.position.z,type:'mushroom',done:false};runtime.apples.push(a);runtime.tornadoSweep=0;runtime.updateTornado(0,performance.now());return {treeLifted:!tree.visible,foodLifted:a.done,kinds:runtime.tornadoVisual.items.map(q=>q.kind)};
 },
v212BoarJump(fps=60,mounted=false){
  this.v212Setup(3);if(runtime.friend){runtime.scene.remove(runtime.friend.g);runtime.friend=null}runtime.startBoarForm();const origin=runtime.boy.position.clone();
  if(mounted){runtime.boarFormTime=0;runtime.friend=runtime.makeBoar(0,20,true);runtime.mountedFriend=true;runtime.manualRideJump();let peak=0;for(let i=0;i<fps;i++){runtime.updateMountedHop(1/fps,0,0);peak=Math.max(peak,runtime.rideHop.height)}runtime.mountedFriend=false;return {peak,done:!runtime.rideHop.active}}
  runtime.jump=true;runtime.boy.userData.jumpQueuedAt=performance.now();const accepted=runtime.tryPlayerJump(performance.now(),true);let peak=0;for(let i=0;i<fps;i++){runtime.boarCollisionEpoch++;runtime.movePlayerVertical(1/fps);peak=Math.max(peak,runtime.py)}return {accepted,peak,end:runtime.py};
 },
v212ExitFloor(n=3){
  this.v212Setup(n);runtime.levelBoarsDone=runtime.levelBoarsTotal;runtime.levelFamilyDone=runtime.levelFamilyTotal;
  const props=n===1?runtime.openingProps:n===2?runtime.lakeExitProps:runtime.locationExitProps.get(n);if(n===1)runtime.opening.passageOpen=true;else if(n===2)props.userData.gateProgress=1;else if(runtime.locationExit)runtime.locationExit.progress=1;if(props)runtime.animateBreakableExit(props,1);
  const samples=[];for(const x of [-4,-2,0,2,4])for(let z=-33;z>=-42;z-=.5){runtime.boy.position.set(x,0,z);runtime.py=runtime.playerSupportHeightAt(x,z);runtime.vy=0;for(let k=0;k<12;k++)runtime.movePlayerVertical(1/60);const feet=runtime.py+runtime.terrainHeightAt(x,z),floor=runtime.familyFloorAt(x,z)+runtime.terrainHeightAt(x,z);samples.push({x,z,feet,floor,ok:feet>=floor-.015&&Number.isFinite(feet)})}
  return {level:n,samples:samples.length,issues:samples.filter(q=>!q.ok),near:props?.userData.exitLandscape?.userData.trailRange.near};
 },
v212ForageWind(){
  this.v212Setup(3);runtime.weatherStage=4;const a=runtime.apples.find(q=>q.type==='mushroom'&&!q.done)||runtime.apples.find(q=>q.y<=1&&!q.done);let worst=0;
  for(let i=0;i<120;i++){runtime.updateStormWorld(1/60,1000+i*16);worst=Math.min(worst,a.g.position.y-runtime.forageGroundAt(a.x,a.z))}
  return {worst,y:a.g.position.y,ground:runtime.forageGroundAt(a.x,a.z)};
 },
v212FishingDefense(){
  this.v212Setup(2);this.v161Fish();runtime.paused=true;const before=!!runtime.fishingTarget;if(runtime.friend)runtime.scene.remove(runtime.friend.g);runtime.friend=runtime.makeBoar(runtime.boy.position.x+2,runtime.boy.position.z,true);const foe=runtime.makeBoar(runtime.boy.position.x+3,runtime.boy.position.z,false);runtime.foes.push(foe);
  for(let i=0;i<30;i++){runtime.friendAttack=.5;runtime.updateFishing(1/60,performance.now());}
  const during=!!runtime.fishingTarget;runtime.playerHitFeedback('boar',foe);return {before,during,stoppedOnHit:!runtime.fishingTarget};
 },
v212CraftAndBomb(){
  this.v212Setup(3);runtime.adventureInventory.wood=4;runtime.food=4;const ok=runtime.craftAdventure('bomb');runtime.hasFlashlight=false;const lamp=runtime.craftAdventure('lamp');const insufficient=runtime.craftAdventure('bomb');const stock={...runtime.adventureInventory,food: runtime.food};
  runtime.boy.position.set(0,0,20);runtime.boy.rotation.y=0;runtime.py=0;runtime.paused=false;const placed=runtime.placeAdventureBomb();const b=runtime.armedBombs[0];runtime.boy.position.set(20,0,20);for(let i=0;i<300;i++)runtime.updateAdventureItems(1/60);runtime.paused=true;
  return {ok,lamp,hasFlashlight: runtime.hasFlashlight,insufficient,stock,placed,remaining:runtime.armedBombs.length,life: runtime.life,bombX:b?.x};
 },
v212BlastHome(){
  this.v212Setup(3);runtime.home.stage=4;runtime.home.collected=[true,true,true,true];runtime.home.wood=0;runtime.syncHomeVisual();const lit=runtime.homeParts.lamp.visible&&runtime.homeParts.light.intensity>0;runtime.boy.position.set(HOME_SITE.x+9,0,HOME_SITE.z);runtime.life=runtime.diffCfg().playerHP;const b={g:runtime.bombModel(runtime.scene),ring:new THREE.Group(),x:HOME_SITE.x,z:HOME_SITE.z,y:0};runtime.explodeAdventureBomb(b);return {lit,stage:runtime.home.stage,refill:runtime.home.collected.every(v=>!v),life: runtime.life,lamp:runtime.homeParts.lamp.visible};
 },
v212BlastDamage(distance=3){
  this.v212Setup(3);if(runtime.friend)runtime.scene.remove(runtime.friend.g);runtime.friend=runtime.makeBoar(2,20,true);runtime.friendHP=runtime.diffCfg().friendHP;runtime.boy.position.set(distance,0,20);const b={g:runtime.bombModel(runtime.scene),ring:new THREE.Group(),x:0,z:20,y:0};runtime.explodeAdventureBomb(b);return {distance,life: runtime.life,maxLife:runtime.diffCfg().playerHP,friendHP: runtime.friendHP};
 },
v212BlastRescue(){
  this.v212Setup(3);const member=runtime.familyMembers.find(f=>f.role===2),at=runtime.familyHideout.position.clone();runtime.boy.position.set(0,0,20);member.g.position.copy(at);member.x=at.x;member.z=at.z;
  const b={g:runtime.bombModel(runtime.scene),ring:new THREE.Group(),x:at.x,z:at.z,y:0};runtime.explodeAdventureBomb(b);return {destroyed:!runtime.familyHideout.visible,present:member.g.parent===runtime.scene,unfinished:!member.done,distance:member.g.position.distanceTo(at),safe:!runtime.worldObstacleAt(member.x,member.z,.5)};
 }
 };
}
