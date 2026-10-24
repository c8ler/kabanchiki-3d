import { polygonContact } from "../movement-geometry.js?v=217";

// Owns 2 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function runMountainGeometryAudit(){
 const issues=[],samples=[];if(runtime.level!==5)return {ok:true,issues,samples,tested:0,level: runtime.level};
 const saved={x:runtime.boy.position.x,y:runtime.boy.position.y,z:runtime.boy.position.z,mounted:runtime.mountedFriend,py: runtime.py,vy: runtime.vy};let sweeps=0;
 try{runtime.py=0;runtime.vy=0;
  for(const [,,,mesh] of runtime.mountainObstacles){const polygon=runtime.mountainFootprint(mesh);if(polygon.length<3){issues.push('mountain-empty-footprint');continue}
   const center=polygon.reduce((a,p)=>({x:a.x+p.x/polygon.length,z:a.z+p.z/polygon.length}),{x:0,z:0});
   if(!polygonContact(polygon,center.x,center.z,runtime.PLAYER_RADIUS))issues.push('mountain-center-not-solid');
   for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],length=Math.hypot(b.x-a.x,b.z-a.z),nx=(b.z-a.z)/length,nz=-(b.x-a.x)/length,cx=(a.x+b.x)/2,cz=(a.z+b.z)/2;
    for(const mounted of [false,true]){const radius=mounted?runtime.MOUNTED_ROCK_RADIUS:runtime.PLAYER_RADIUS,x=cx+nx*(radius+.06),z=cz+nz*(radius+.06);
     if(polygonContact(polygon,x,z,radius))issues.push('mountain-invisible-halo');
     if(!polygonContact(polygon,cx+nx*radius*.5,cz+nz*radius*.5,radius))issues.push('mountain-edge-not-solid');
     runtime.mountedFriend=mounted;if(sweeps<24&&!runtime.playerWorldBlocked(x,z)){runtime.boy.position.set(x,0,z);runtime.movePlayerCollision(-nx*.55,-nz*.55);if(polygonContact(polygon,runtime.boy.position.x,runtime.boy.position.z,radius-.01))issues.push('mountain-sweep-penetration');sweeps++}
    }
   }
   samples.push({vertices:polygon.length});
  }
 }finally{runtime.boy.position.set(saved.x,saved.y,saved.z);runtime.mountedFriend=saved.mounted;runtime.py=saved.py;runtime.vy=saved.vy}
 if(!sweeps)issues.push('mountain-no-clear-sweeps');return {ok:issues.length===0,issues,samples,tested:samples.length,sweeps,level: runtime.level};
}

function runFriendYieldAudit(){
 const issues=[],samples=[],saved={friend: runtime.friend,owner:runtime.friendYieldOwner,active:runtime.friendYieldActive,yield:{...runtime.friendYield},x:runtime.boy.position.x,y:runtime.boy.position.y,z:runtime.boy.position.z,py: runtime.py,vy: runtime.vy,mounted:runtime.mountedFriend};
 const testFriend=runtime.visualOnly(()=>runtime.makeBoar(0,6.6,true));
 try{runtime.friend=testFriend;runtime.mountedFriend=false;runtime.py=0;runtime.vy=0;
  for(const fps of [30,60,120]){runtime.boy.position.set(0,0,4);runtime.friend.g.position.set(0,0,6.6);runtime.friendYield.reset();runtime.friendYieldOwner=null;let maxStep=0,minDistance=Infinity;
   for(let frame=0;frame<fps;frame++){const ox=runtime.friend.g.position.x,oz=runtime.friend.g.position.z;runtime.updateFriendYield(0,1,1/fps);maxStep=Math.max(maxStep,Math.hypot(runtime.friend.g.position.x-ox,runtime.friend.g.position.z-oz));
    if(Math.hypot(runtime.boy.position.x-runtime.friend.g.position.x,runtime.boy.position.z+6/fps-runtime.friend.g.position.z)>=1.50)runtime.movePlayerCollision(0,6/fps);
    minDistance=Math.min(minDistance,Math.hypot(runtime.boy.position.x-runtime.friend.g.position.x,runtime.boy.position.z-runtime.friend.g.position.z));
   }
   const lateral=Math.abs(runtime.friend.g.position.x),travel=runtime.boy.position.z-4;
   if(maxStep>6.8/fps+.001)issues.push('friend-sidestep-teleport');if(lateral<1.8)issues.push('friend-did-not-yield');if(travel<5.5)issues.push('friend-blocked-player');if(minDistance<1.49)issues.push('friend-player-overlap');
   samples.push({fps,lateral:+lateral.toFixed(3),travel:+travel.toFixed(3),maxStep:+maxStep.toFixed(3),minDistance:+minDistance.toFixed(3)});
  }
 }finally{runtime.scene.remove(testFriend.g);runtime.friend=saved.friend;runtime.friendYieldOwner=saved.owner;runtime.friendYieldActive=saved.active;Object.assign(runtime.friendYield,saved.yield);runtime.boy.position.set(saved.x,saved.y,saved.z);runtime.py=saved.py;runtime.vy=saved.vy;runtime.mountedFriend=saved.mounted}
 return {ok:issues.length===0,issues,samples,level: runtime.level};
}
 return {
  bindings:{
"runMountainGeometryAudit":{get:()=>runMountainGeometryAudit},
"runFriendYieldAudit":{get:()=>runFriendYieldAudit}
  },
  initialize(){

window.__KABANCHIKI_MOUNTAIN_AUDIT__=runMountainGeometryAudit;

window.__KABANCHIKI_FRIEND_YIELD_AUDIT__=runFriendYieldAudit;
  }
 };

}
