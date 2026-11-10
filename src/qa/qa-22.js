import * as T from '../../vendor/three/three.module.min.js';
export function createQaPart(runtime){
 let bad=0,compact=false,restore=[];
 const state=()=>({distance:Math.hypot(runtime.friend.g.position.x-runtime.boy.position.x,runtime.friend.g.position.z-runtime.boy.position.z),position:runtime.friend.g.position.toArray(),compact:!!runtime.friend.passageMode,everCompact:compact,bad,hp:runtime.friendHP,water:runtime.waterAt(runtime.friend.g.position.x,runtime.friend.g.position.z)});
 function wall(x,z,w,d){const g=new T.Mesh(new T.BoxGeometry(w,3,d),new T.MeshLambertMaterial({color:0x927157}));g.position.set(x,1.5,z);runtime.scene.add(g);runtime.craftWorld.items.push({g,kind:'wall',level:3,living:false,solids:[new T.Box3().setFromObject(g)],supports:[]});runtime.craftWorld.epoch++;runtime.worldEpoch++}
 function seed(points){for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.32);for(let j=0;j<=n;j++)runtime.friendTrail.record({x:a.x+(b.x-a.x)*j/n,z:a.z+(b.z-a.z)*j/n},runtime.level)}}
 function setup(n=3){
  for(const [g,v]of restore)g.visible=v;restore=[];runtime.resetCheatMode();this.v222Setup(n);runtime.started=true;runtime.paused=true;runtime.$('intro').style.display=runtime.$('pauseMenu').style.display='none';runtime.clearEntities(runtime.foes);runtime.catLife.root.visible=false;runtime.resetNature();runtime.craftWorld.clear();runtime.mountedFriend=false;runtime.py=runtime.vy=0;
  for(const g of [...runtime.houseObjects,...runtime.treeObjects,...runtime.rockPositions.map(r=>r[3])])if(g){restore.push([g,g.visible]);g.visible=false}
  if(runtime.friend)runtime.friend.g.removeFromParent();runtime.friend=runtime.makeBoar(.13,7,true);runtime.friend.g.rotation.y=Math.PI;runtime.friend.followManaged=true;runtime.friendHP=runtime.diffCfg().friendHP;runtime.resetFriendTrail();runtime.worldEpoch++;runtime.wallCacheEpoch=-1;bad=0;compact=false;runtime.camMode=1;runtime.yaw=Math.PI;
 }
 function step(seconds=15){for(let i=0;i<Math.ceil(seconds/.05);i++){runtime.boarCollisionEpoch++;runtime.updateFriendTrail(.05);runtime.updateBoarWater(.05);if(runtime.friendFollowingNeeded())runtime.moveFriendAroundObstacles(runtime.boy.position.x,runtime.boy.position.z,3.25,.05);runtime.settleBoarOnGround(runtime.friend);compact||=!!runtime.friend.passageMode;if(runtime.boarSceneryBlockedAt(runtime.friend,runtime.friend.g.position.x,runtime.friend.g.position.z))bad++}return state()}
 return{
 v229Setup(kind='gap'){setup.call(this);if(kind==='gap'){wall(-1.66,0,2.68,8);wall(1.79,0,2.42,8);runtime.boy.position.set(.13,0,-7);seed([{x:.13,z:8},{x:.13,z:-7}])}else if(kind==='near'){wall(0,0,6,.25);runtime.friend.g.position.set(0,0,1.2);runtime.boy.position.set(0,0,-1.2);seed([{x:0,z:1.2},{x:4,z:2},{x:4,z:-2},{x:0,z:-1.2}])}else{wall(0,-1,8,2);wall(-3.5,1.5,1,7);wall(3.5,1.5,1,7);runtime.friend.g.position.set(0,0,2);runtime.boy.position.set(0,0,-6);seed([{x:0,z:2},{x:0,z:6},{x:5,z:6},{x:5,z:-6},{x:0,z:-6}])}return{needed:runtime.friendFollowingNeeded(),...state()}},
 v229Step:step,
 v229Expand(){runtime.boy.position.set(.13,0,-14);return step(7)},
 v229Door(){setup.call(this);const item=runtime.craftWorld.create('house',0,0,0,3);runtime.friend.g.position.set(0,0,5);runtime.boy.position.set(0,0,-.5);for(let i=0;i<200;i++){runtime.craftWorld.update(.05,i*.05,3,()=>0,()=>false,runtime.boy.position,runtime.friend.g.position);step(.05)}return{closed:item.doorRig.closed,...state()}},
 v229Water(){setup.call(this,2);runtime.friend.g.position.set(0,0,0);runtime.boy.position.set(18,0,18);const before=runtime.friendHP;for(let i=0;i<600;i++){runtime.updateBoarWater(.1);runtime.settleBoarOnGround(runtime.friend)}return{before,escaping:runtime.friend.waterEscaping,...step(15)}},
 v229Menu(){runtime.openSecretMenu();return [...runtime.$('cheatButtons').querySelectorAll('.cheatGroup summary')].map(g=>g.textContent)}
 };
}
