import * as THREE from "../../vendor/three/three.module.min.js";
import { capsuleCircleContact } from "../boar-physics.js?v=218";
import { convexHull, polygonContact } from "../movement-geometry.js?v=218";

// Owns 15 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let mountainFootprints,PLAYER_RADIUS,ROCK_PLAYER_RADIUS,MOUNTED_ROCK_RADIUS;

// v102: fallen logs use a capsule footprint: a thin segment with round ends, matching the visible trunk.
function logDistance(o,x,z){
 const dx=x-o.x,dz=z-o.z,c=Math.cos(o.yaw),sn=Math.sin(o.yaw),along=dx*c+dz*sn,side=-dx*sn+dz*c;
 const half=Math.max(.08,o.len*.5-o.r),clamped=Math.max(-half,Math.min(half,along));
 return {distance:Math.hypot(along-clamped,side),along,side,clamped,half};
}

function logFootprintHit(o,x,z,pad=PLAYER_RADIUS,allowJump=true){
 if(runtime.level!==1||!runtime.forestVisual.visible||!o?.g?.visible)return false;
 // v121: fallen branches are low traversal geometry, not walls. Normal player/rider movement may
 // cross their capsule footprint; the vertical solver supplies the visible step-over/jump arc.
 if(allowJump&&(runtime.mountedFriend||runtime.py+runtime.terrainHeightAt(x,z)>=o.top-.025))return false;
 return logDistance(o,x,z).distance<o.r+pad;
}

function pushOutOfLog(o){
 if(!logFootprintHit(o,runtime.boy.position.x,runtime.boy.position.z,PLAYER_RADIUS+.015,true))return false;
 const d=logDistance(o,runtime.boy.position.x,runtime.boy.position.z),need=o.r+PLAYER_RADIUS+.025,c=Math.cos(o.yaw),sn=Math.sin(o.yaw);
 let vx=d.along-d.clamped,vz=d.side,n=Math.hypot(vx,vz);if(n<.0001){vx=0;vz=1;n=1}
 const a=d.clamped+vx/n*need,b=vz/n*need;
 runtime.boy.position.x=o.x+a*c-b*sn;runtime.boy.position.z=o.z+a*sn+b*c;return true;
}


function openingDebrisCapsules(){
 if(runtime.level!==1||!runtime.openingProps?.visible||!runtime.opening)return [];
 if(!runtime.opening.passageBroken&&runtime.openingProps.userData.trunk.visible){const closedKey=runtime.worldEpoch+':closed:'+runtime.opening.passageTime;if(openingDebrisCapsules.key===closedKey)return openingDebrisCapsules.cache;const trunk=runtime.openingProps.userData.trunk,bark=trunk.children.find(m=>m.geometry?.type==='CylinderGeometry');bark.updateWorldMatrix(true,false);const half=bark.geometry.parameters.height/2,a=bark.localToWorld(new THREE.Vector3(0,-half,0)),b=bark.localToWorld(new THREE.Vector3(0,half,0));openingDebrisCapsules.key=closedKey;return openingDebrisCapsules.cache=[{closed:true,body:{ax:a.x,az:a.z,bx:b.x,bz:b.z,r:.78},top:new THREE.Box3().setFromObject(bark).max.y}];}
 if(!runtime.opening.passageBroken||!runtime.openingProps.userData.debris.visible)return [];
 const key=runtime.worldEpoch+':'+runtime.opening.passageTime;if(openingDebrisCapsules.key===key)return openingDebrisCapsules.cache;
 const result=[];for(const chip of runtime.openingProps.userData.debris.children){if(!chip.userData.large)continue;chip.updateWorldMatrix(true,false);const half=chip.geometry.parameters.height/2,a=chip.localToWorld(new THREE.Vector3(0,-half,0)),b=chip.localToWorld(new THREE.Vector3(0,half,0)),scale=chip.getWorldScale(new THREE.Vector3());result.push({body:{ax:a.x,az:a.z,bx:b.x,bz:b.z,r:.7*Math.max(Math.abs(scale.x),Math.abs(scale.z))},top:new THREE.Box3().setFromObject(chip).max.y});}
 openingDebrisCapsules.key=key;openingDebrisCapsules.cache=result;return result;
}

function debrisBlocks(x,z,radius){
 const feet=runtime.mountedFriend?runtime.terrainHeightAt(x,z)+runtime.rideHop.height+runtime.rideBump:runtime.py+runtime.terrainHeightAt(x,z);
 return openingDebrisCapsules().some(q=>feet<q.top-.02&&capsuleCircleContact(q.body,x,z,radius));
}

function stepOverLowLog(x,z){
 if(runtime.mountedFriend||runtime.boarFormTime>0||runtime.level!==1||runtime.vy>.05)return;
 const top=runtime.branchStepHeightAt(x,z);if(top>runtime.py&&top-runtime.py<=.38){runtime.py=top;runtime.vy=0;runtime.boy.position.y=runtime.py;}
}

function mountainFootprint(mesh){
 let polygon=mountainFootprints.get(mesh);if(polygon)return polygon;
 mesh.updateWorldMatrix(true,false);const positions=mesh.geometry.attributes.position,index=mesh.geometry.index,points=[];
 const count=index?index.count:positions.count;
 // Clip triangles at ground level; buried cone bases must not create an invisible halo.
 for(let i=0;i<count;i+=3){const triangle=[];for(let j=0;j<3;j++)triangle.push(new THREE.Vector3().fromBufferAttribute(positions,index?index.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld));
  for(let j=0;j<3;j++){const a=triangle[j],b=triangle[(j+1)%3];if(a.y>=0)points.push({x:a.x,z:a.z});if((a.y<0)!==(b.y<0)){const t=-a.y/(b.y-a.y);points.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t})}}
 }
 polygon=convexHull(points);mountainFootprints.set(mesh,polygon);return polygon;
}

function mountainContactsAt(x,z,radius){
 if(runtime.level!==5)return [];
 const contacts=[];for(const [,,,mesh] of runtime.mountainObstacles)if(mesh&&mesh.parent?.visible!==false){const hit=polygonContact(mountainFootprint(mesh),x,z,radius);if(hit)contacts.push(hit)}return contacts;
}

function mountainBlockedAt(x,z,radius){return mountainContactsAt(x,z,radius).length>0}

function worldObstacleAt(x,z,pad=.38){
 // v105: only the visible trunk is solid; decorative/apple branches never create an invisible tree halo.
 if(runtime.circleHitsTreeGeometry(x,z,PLAYER_RADIUS+pad))return true;
 if(runtime.logObstacles.some(o=>logFootprintHit(o,x,z,PLAYER_RADIUS+pad,false)))return true;
 if(runtime.rockPositions.some(([, , ,m])=>m?.visible!==false&&runtime.rockFootprintHit(m,x,z,pad,false)))return true;
 if(mountainBlockedAt(x,z,pad))return true;
 if(runtime.level===6&&runtime.lairObstacles.some(([lx,lz,r,g])=>g.visible&&Math.hypot(x-lx,z-lz)<r+pad))return true;
 if(runtime.houseBlockAt(x,z,pad))return true;
 return false;
}

function solidCircles(){
 const out=[];
 for(let i=0;i<runtime.treePositions.length;i++){const t=runtime.treeObjects[i];if(t?.visible!==false){const [x,z]=runtime.treePositions[i];out.push({x,z,r:1.62,type:'tree'})}}
 for(const [x,z,r,m] of runtime.rockPositions)if(m?.visible!==false)out.push({x,z,r:r+.48,type:'rock'});

 if(runtime.level===6)for(const [x,z,r,g] of runtime.lairObstacles)if(g?.visible!==false)out.push({x,z,r:r+.52,type:'lair'});
 return out
}
 return {
  bindings:{
"logDistance":{get:()=>logDistance},
"logFootprintHit":{get:()=>logFootprintHit},
"pushOutOfLog":{get:()=>pushOutOfLog},
"openingDebrisCapsules":{get:()=>openingDebrisCapsules},
"debrisBlocks":{get:()=>debrisBlocks},
"stepOverLowLog":{get:()=>stepOverLowLog},
"mountainFootprints":{get:()=>mountainFootprints},
"mountainFootprint":{get:()=>mountainFootprint},
"mountainContactsAt":{get:()=>mountainContactsAt},
"mountainBlockedAt":{get:()=>mountainBlockedAt},
"worldObstacleAt":{get:()=>worldObstacleAt},
"PLAYER_RADIUS":{get:()=>PLAYER_RADIUS},
"ROCK_PLAYER_RADIUS":{get:()=>ROCK_PLAYER_RADIUS},
"MOUNTED_ROCK_RADIUS":{get:()=>MOUNTED_ROCK_RADIUS},
"solidCircles":{get:()=>solidCircles}
  },
  initialize(){


/* init:const */ mountainFootprints = new WeakMap();

// v77: one collision model for player, generation audit and automated tests.
/* init:const */ PLAYER_RADIUS = .43;
/* init:const */ ROCK_PLAYER_RADIUS = .31;
/* init:const */ MOUNTED_ROCK_RADIUS = .78;
  }
 };

}
