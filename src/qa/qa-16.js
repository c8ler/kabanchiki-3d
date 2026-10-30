import * as THREE from '../../vendor/three/three.module.min.js';
import {polygonContact} from '../movement-geometry.js?v=221';
import {cinematicShot} from '../cinematic-support.js?v=221';
export function createQaPart(runtime){return {
 v219Exit(n=3,done=false,only='both'){
  this.v212Setup(n);runtime.levelBoarsTotal=n<6?3:1;runtime.levelBoarsDone=done||only==='family'?runtime.levelBoarsTotal:1;runtime.levelFamilyTotal=[1,0,1,0,2,0][n-1];runtime.levelFamilyDone=done||only==='boars'?runtime.levelFamilyTotal:0;for(const f of runtime.familyMembers)f.done=done||only==='boars';
  if(n===6&&done)for(const f of runtime.foes)f.isBoss=false;
  runtime.boy.position.set(0,runtime.terrainHeightAt(0,-31),-31);runtime.camMode=1;runtime.yaw=Math.PI;runtime.camera.position.set(0,6,-21);runtime.camera.lookAt(0,1,-37);runtime.paused=false;runtime.updateAdventureHints(performance.now());runtime.paused=true;
  const el=document.querySelector('[data-hint="goal"]');return{text:el.querySelector('span').textContent,kind:el.dataset.kind,hidden:el.hidden};
 },
 v219FeedSetup({blocked=false,full=false,mounted=false,food='apple'}={}){
  this.v212Setup(3);runtime.craftWorld.clear();for(const f of runtime.foes)f.flee=true;if(runtime.friend)runtime.scene.remove(runtime.friend.g);const q=runtime.nearestSafeSpawn(0,20,.8)||[0,20];runtime.boy.position.set(q[0],runtime.terrainHeightAt(...q),q[1]);runtime.friend=runtime.makeBoar(q[0]+3,q[1],true);runtime.friendHP=full?runtime.diffCfg().friendHP:Math.max(1,runtime.diffCfg().friendHP-1);runtime.friend.g.position.y=runtime.terrainHeightAt(q[0]+3,q[1]);runtime.food=4;runtime.fishStock=food==='fish'?1:0;runtime.yellowAppleStock=food==='yellow'?1:0;runtime.yellowMushroomStock=0;runtime.nextRegularFood='apple';runtime.throwCooldown=0;runtime.yaw=Math.PI;runtime.camMode=1;runtime.py=runtime.vy=0;runtime.invuln=999;
  if(blocked){runtime.craftWorld.create('wall',q[0]+1.5,0,q[1],3,Math.PI/2);runtime.worldEpoch++;runtime.wallCacheEpoch=-1}
  if(mounted){runtime.boy.position.x=runtime.friend.g.position.x-1.5;runtime.boy.position.z=runtime.friend.g.position.z;runtime.mountFriendNow(true);runtime.friendHP=full?runtime.diffCfg().friendHP:Math.max(1,runtime.diffCfg().friendHP-1)}
  runtime.paused=false;return this.v219FeedInspect();
 },
 v219FeedInspect(){return{mounted:runtime.mountedFriend,food:runtime.food,fish:runtime.fishStock,yellow:runtime.yellowAppleStock,hp:runtime.friendHP,max:runtime.diffCfg().friendHP,shots:runtime.shots.map(s=>({friend:s.foe===runtime.friend,type:s.type,start:s.start.toArray(),target:s.target.toArray()})),fed:runtime.statsData.fed}},
 v219ResolveShots(){for(const shot of runtime.shots)runtime.resolveMeat(shot);runtime.shots.length=0;return this.v219FeedInspect()},
 v219Signs(){this.v212Setup(3);const board=runtime.physicalSign(runtime.scene,'ПРОВЕРКА',0,2,20,3,.8);runtime.boy.position.set(0,0,20);for(let i=0;i<20;i++)runtime.updateFallingSigns(.05);board.updateWorldMatrix(true,true);const label=board.children.find(o=>o.userData.fixedSign),normal=new THREE.Vector3(0,0,1).transformDirection(label.matrixWorld),box=new THREE.Box3().setFromObject(board),result={normal:normal.toArray(),min:box.min.y,ground:runtime.terrainHeightAt(0,20),angle:board.rotation.x};board.removeFromParent();runtime.signBoards.splice(runtime.signBoards.indexOf(board),1);return result},
 v219Markers(){const results=[];for(const n of [1,3,5]){this.v212Setup(n);results.push({level:n,count:runtime.familyMembers.length,markers:runtime.familyMembers.flatMap(f=>{const all=[];f.g.traverse(o=>{if(o.userData.familyMarker)all.push(o)});return all}).length})}return results},
 v219CinemaAudit(kind='intro',cause='boar',n=1){
  this.v212Setup(n);runtime.boy.position.set(12,runtime.terrainHeightAt(12,15),15);runtime.py=0;runtime.playCinematic(kind,()=>{},{cause});const m=runtime.movie,frames=[],end=kind==='intro'?18.4:kind==='outro'?15.4:4.4;let previous=null,changes=0,minClearance=Infinity,visible=0;
  for(let i=0;i<=Math.ceil(end*10);i++){const t=Math.min(end,i/10);m.elapsedOverride=t;runtime.updateCinematic(m.start+t*1000,new THREE.Vector3());runtime.updateCameraOcclusion(m.start+t*1000);
   const shot=cinematicShot(kind,t),mask=[...m.treeGuard.entries.values()].map(e=>e.root.visible?'1':'0').join('');if(previous?.shot===shot&&previous.mask!==mask)changes++;previous={shot,mask};
   const box=new THREE.Box3().setFromObject(m.hero);if(kind==='death'){const floor=cause==='water'?.05:runtime.terrainHeightAt((box.min.x+box.max.x)/2,(box.min.z+box.max.z)/2)+runtime.playerSupportHeightAt((box.min.x+box.max.x)/2,(box.min.z+box.max.z)/2);minClearance=Math.min(minClearance,box.min.y-floor);if(box.max.y>floor+.25)visible++}
   if(i%10===0)frames.push({t,shot,hidden:m.treeGuard.hidden});
  }
  const faded=runtime.fadedRoots.size;runtime.cinematicFinish();runtime.paused=true;return{changes,minClearance:Number.isFinite(minClearance)?minClearance:null,visible,frames,faded,restored:[...m.treeGuard.entries.values()].every(e=>e.root.visible===e.visible)};
 },
 v219CatsSetup(){
  this.v212Setup(3);for(const f of runtime.foes)f.flee=true;if(runtime.friend)runtime.scene.remove(runtime.friend.g);runtime.friend=runtime.makeBoar(0,20,true);runtime.friendHP=runtime.diffCfg().friendHP;runtime.boy.position.set(-1.5,0,20);runtime.mountFriendNow(true);
  runtime.craftWorld.create('cat',-3,runtime.terrainHeightAt(-3,20),20,3);runtime.craftWorld.create('cat',3,runtime.terrainHeightAt(3,20),20,3);
  for(const [i,c]of runtime.catLife.cats.entries()){c.jump=null;c.boar=null;c.state='play';c.timer=0;c.gameTimer=0;c.g.position.set(i?-2:2,runtime.terrainHeightAt(i?-2:2,22),22)}
  runtime.paused=false;return this.v219CatsInspect();
 },
 v219CatsInspect(){const cats=[...runtime.catLife.cats,...runtime.craftWorld.items.filter(i=>i.catActor&&i.g.visible).map(i=>i.catActor)];return{mounted:runtime.mountedFriend,cats:cats.map(c=>({state:c.state,jump:c.jump?.then,boar:c.boar===runtime.friend,x:c.g.position.x,y:c.g.position.y,z:c.g.position.z}))}},
 v219Walls(n=3,form='human',open=false){
  this.v212Setup(n);runtime.craftWorld.clear();for(const f of runtime.foes)f.flee=true;if(runtime.friend){runtime.scene.remove(runtime.friend.g);runtime.friend=null}
  for(const t of runtime.treeObjects)t.visible=false;for(const[,,,m]of runtime.rockPositions)if(m)m.visible=false;for(const o of runtime.logObstacles)o.g.visible=false;for(const[,,,m]of [...runtime.mountainObstacles,...runtime.lairObstacles])if(m)m.visible=false;runtime.catLife.root.visible=false;
  runtime.levelBoarsDone=runtime.levelBoarsTotal;runtime.levelFamilyDone=runtime.levelFamilyTotal;
  const props=n===2?runtime.lakeExitProps:runtime.locationExitProps.get(n);
  if(props?.userData.exitBarrier){props.userData.breakerTime=open?.85:0;runtime.animateBreakableExit(props,open?1:0);if(n===2)props.userData.gateProgress=open?1:0;else runtime.locationExit.progress=open?1:0}
  if(n===1){runtime.opening.passageOpen=runtime.opening.passageBroken=open;runtime.openingProps.userData.trunk.visible=!open;runtime.openingProps.userData.debris.visible=open}
  runtime.craftWorld.create('wall',0,0,12,n);runtime.worldEpoch++;runtime.wallCacheEpoch=-1;runtime.keys={};runtime.boarFormTime=form==='boar'?30:0;runtime.catFormTime=form==='cat'?30:0;runtime.mountedFriend=form==='mounted';
  if(runtime.mountedFriend){runtime.friend=runtime.makeBoar(0,20,true);runtime.setRiderPose(true)}
  const walls=[...runtime.wallGeometry().filter(w=>!w.furniture&&w.box.min.y<1.4&&w.box.max.y>.4).slice(0,6),...runtime.craftWorld.walls()],issues=[];let tested=0;
  for(const w of walls)for(const side of [0,1,2,3]){
   const b=w.box,cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2,reach=form==='mounted'?1.75:form==='boar'?1.5:.48;
   const x=side===0?b.min.x-reach-.2:side===1?b.max.x+reach+.2:cx,z=side===2?b.min.z-reach-.2:side===3?b.max.z+reach+.2:cz;
   runtime.py=runtime.mountedFriend?runtime.riderSeatHeight():0;runtime.vy=0;runtime.boy.position.set(x,runtime.terrainHeightAt(x,z)+runtime.py,z);runtime.boy.rotation.y=Math.atan2(cx-x,cz-z);runtime.yaw=runtime.boy.rotation.y;
   if(runtime.friend)runtime.friend.g.position.set(x,runtime.terrainHeightAt(x,z),z);
   if(runtime.playerWorldBlocked(x,z))continue;tested++;
   const dx=cx-x,dz=cz-z,d=Math.hypot(dx,dz),length=d+reach+.6;
   runtime.movePlayerCollision(dx/d*length,dz/d*length);const px=runtime.boy.position.x,pz=runtime.boy.position.z,feet=runtime.py+runtime.terrainHeightAt(px,pz);
   const crossed=side===0?px>b.max.x+.01&&pz>b.min.z&&pz<b.max.z:side===1?px<b.min.x-.01&&pz>b.min.z&&pz<b.max.z:side===2?pz>b.max.z+.01&&px>b.min.x&&px<b.max.x:pz<b.min.z-.01&&px>b.min.x&&px<b.max.x;if(crossed)issues.push({side,kind:'crossed',x:px,z:pz});
   const body=form==='mounted'||form==='boar'?runtime.boarWallContacts(runtime.playerBoarBody()):[];
   if(body.length)issues.push({side,kind:'body',x:px,z:pz});
   if(form==='human'||form==='cat'){const hit=[...runtime.wallGeometry(),...runtime.craftWorld.walls()].find(q=>feet<q.box.max.y-.015&&feet+runtime.playerPhysicalHeight()>q.box.min.y+.01&&polygonContact(q.polygon,px,pz,runtime.PLAYER_RADIUS-.005));if(hit)issues.push({side,kind:'foot',x:px,z:pz})}
  }
  runtime.mountedFriend=false;runtime.boarFormTime=runtime.catFormTime=0;runtime.setRiderPose(false);return{level:n,form,open,tested,issues};
 },
 v219DeathPreview(cause='boar',n=5){this.v212Setup(n);runtime.boy.position.set(12,runtime.terrainHeightAt(12,15),15);runtime.playCinematic('death',()=>{},{cause});runtime.movie.elapsedOverride=3.5;runtime.updateCinematic(performance.now(),new THREE.Vector3());return true}
};}
