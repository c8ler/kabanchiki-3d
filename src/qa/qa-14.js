import * as THREE from '../../vendor/three/three.module.min.js';
import {lakePointAt,riverCenterAt,lakeInletCenterAt} from '../world-surface.js?v=218';
export function createQaPart(runtime){return {
 v217Fresh(){this.v212Setup(3);runtime.resetNewRun();runtime.loadLevel(3);runtime.paused=true;runtime.$('pauseMenu').style.display='grid';runtime.syncCraftUI();return this.v217Inspect()},
 v217Inspect(){return {secretOpen:runtime.secretMenuOpen,bombs:runtime.adventureInventory.bombs,pickupBombs:runtime.adventurePickups.filter(p=>p.kind==="bomb").length,level:runtime.level,sandbox:runtime.sandboxMode,craft:runtime.craftUnlocked,home:runtime.homeUnlocked,homeVisible:runtime.personalHouse.visible,yard:runtime.homeYard.visible,craftHidden:runtime.$('craftPanel').hidden,stock:{...runtime.craftWorld.stock},items:runtime.craftWorld.items.map(i=>({kind:i.kind,position:i.g.position.toArray(),cat:!!i.catActor,dog:!!i.dog,legs:i.g.companionRig?.legs.map(l=>l.rotation.x)})),position:runtime.boy.position.toArray(),time:runtime.levelTime,tornado:runtime.tornadoState.active,foes:runtime.foes.length,life:runtime.life,food:runtime.food,version:runtime.GAME_VERSION}},
 v217Cheat(value){runtime.paused=true;return {ok:runtime.applyCheat(value),...this.v217Inspect()}},
 v217Fishing(n=4,x=17,z=riverCenterAt(17)+4.9,catchNow=false){
  this.v212Setup(n);for(const f of runtime.foes)f.flee=true;runtime.mountedFriend=false;runtime.py=runtime.vy=0;runtime.py=runtime.playerSupportHeightAt(x,z);runtime.boy.position.set(x,runtime.terrainHeightAt(x,z)+runtime.py,z);runtime.keys={};runtime.jump=runtime.act=false;runtime.paused=false;
  for(let i=0;i<16;i++)runtime.updateFishing(.1,performance.now());const started=!!runtime.fishingTarget;if(started){runtime.fishingNextBite=catchNow?runtime.fishingTime+.01:100;runtime.updateFishing(.1,performance.now());runtime.updateFishingVisual(performance.now())}
  return {started,...this.v217FishInspect()};
 },
 v217FishInspect(){
  const arm=runtime.boy.children[5];runtime.boy.updateWorldMatrix(true,true);const wrist=arm.localToWorld(new THREE.Vector3(0,-.34,0)),grip=runtime.fishingRig.getWorldPosition(new THREE.Vector3());
  return {camera:runtime.camMode,active:!!runtime.fishingTarget,target:runtime.fishingTarget,stock:runtime.fishStock,fishVisible:runtime.caughtFish.visible,fish:runtime.caughtFish.position.toArray(),gripDistance:wrist.distanceTo(grip),rod:runtime.fishingRig.visible,line:runtime.fishingLine.visible,arm:arm.rotation.x,button:!!document.getElementById('fishAction')};
 },
 v217ShoreAudit(){
  const results=[];
  for(const n of [1,2,4]){this.v212Setup(n);for(const t of runtime.treeObjects)t.visible=false;for(const [,,,m]of runtime.rockPositions)if(m)m.visible=false;runtime.worldEpoch++;runtime.wallCacheEpoch=-1;
   let points=n===1?[[0,-2.8],[5,-5]]:n===2?Array.from({length:12},(_,i)=>{const p=lakePointAt(i*Math.PI/6,14.2);return[p.x,p.z]}):[-38,-22,-8,8,18,38].flatMap(x=>[-1,1].map(side=>[x,riverCenterAt(x)+side*4.7]));
   if(n===2)points.push(...[-43,-35,-26].flatMap(x=>[-1,1].map(side=>[x,lakeInletCenterAt(x)+side*4.6])));
   for(const[x,z]of points){runtime.boy.position.set(x,runtime.terrainHeightAt(x,z),z);runtime.py=0;const target=runtime.nearbyFishingWater();results.push({level:n,x,z,target})}
  }return results;
 },
 v217PetRobot(fps=60){
  this.v212Setup(3);for(const t of runtime.treeObjects)t.visible=false;for(const [,,,m]of runtime.rockPositions)if(m)m.visible=false;for(const h of runtime.houseObjects)h.visible=false;
  const dog=runtime.craftWorld.create('dog',-4,0,20,3),cat=runtime.craftWorld.create('cat',4,0,20,3);runtime.craftWorld.create('wall',-1,0,20,3,Math.PI/2);
  const boar=runtime.makeBoar(6,20,true);if(runtime.friend)runtime.scene.remove(runtime.friend.g);runtime.friend=boar;runtime.friendHP=4;runtime.boy.position.set(5,0,22);runtime.paused=false;runtime.worldEpoch++;runtime.wallCacheEpoch=-1;
  let turn=0,step=0,legs=0,catJump=false,catRide=false;const before=dog.g.position.clone();
  for(let i=0;i<fps*24;i++){
   const a=dog.g.rotation.y,p=dog.g.position.clone();runtime.updateCraftCreatures(1/fps,i*1000/fps);turn=Math.max(turn,Math.abs(Math.atan2(Math.sin(dog.g.rotation.y-a),Math.cos(dog.g.rotation.y-a))));step=Math.max(step,Math.hypot(p.x-dog.g.position.x,p.z-dog.g.position.z));legs=Math.max(legs,...dog.g.companionRig.legs.map(l=>Math.abs(l.rotation.x)));catJump ||=!!cat.catActor.jump;catRide ||=cat.catActor.state==='ride';
  }runtime.paused=true;return {turn,step,legs,travel:before.distanceTo(dog.g.position),remaining:dog.g.position.distanceTo(runtime.boy.position),catJump,catRide,catState:cat.catActor.state,position:dog.g.position.toArray()};
 },
 v217SandboxSetup(){this.v212Setup(3);runtime.applyCheat('SANDBOX');runtime.paused=false;runtime.$('pauseMenu').style.display='none';runtime.camMode=1;return this.v217Inspect()},
 v217SandboxClock(){runtime.levelTime=900;runtime.updateWeather(.1,performance.now());runtime.updateCreative(.1);runtime.life=0;runtime.showEnd(false);runtime.hud();return {...this.v217Inspect(),ended:runtime.endShown}},
 v217LivePets(){runtime.applyCheat('SPAWNCAT');runtime.craftWorld.create('cat',4,0,12,runtime.level);runtime.craftWorld.create('dog',-3,0,12,runtime.level);runtime.worldEpoch++;runtime.paused=false;runtime.$('pauseMenu').style.display='none';return this.v217Inspect()}
};}
