import * as THREE from "../../vendor/three/three.module.min.js";
import { riverCenterAt, lakeRadiusAt } from "../world-surface.js?v=217";

// Owns 6 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function spawnPointBlocked(x,z,pad=.72,{allowRoad=false}={}){
 if(x<-41.5||x>41.5||z<-41.5||z>41.5)return true;
 if(runtime.level===2&&lakeRadiusAt(x,z)<14.5)return true;
 if(runtime.level===4&&Math.abs(z-riverCenterAt(x))<4.7)return true;
 if(!allowRoad&&Math.abs(x)<3.7)return true;
 return runtime.worldObstacleAt(x,z,pad);
}

function nearestSafeSpawn(x,z,pad=.72,opts={}){
 if(!spawnPointBlocked(x,z,pad,opts))return [x,z];
 for(const r of [2,3,4,5,6,8,10,12,16,20,24,28])for(let i=0;i<24;i++){
  const a=i/24*Math.PI*2,px=x+Math.sin(a)*r,pz=z+Math.cos(a)*r;
  if(!spawnPointBlocked(px,pz,pad,opts))return [px,pz];
 }
 return null;
}

function nearestVisibleAppleTree(x,z){
 let best=null,bd=Infinity;
 for(let i=0;i<runtime.treePositions.length;i++){const t=runtime.treeObjects[i];if(!t||t.visible===false)continue;const [tx,tz]=runtime.treePositions[i],d=Math.hypot(x-tx,z-tz);if(d<bd){bd=d;best=[tx,tz]}}
 return best?{x:best[0],z:best[1],d:bd}:null;
}

function nearestVisibleAppleBranch(x,z){let best=null,bd=Infinity;for(const br of runtime.treeBranchMeshes){if(!br?.parent||br.parent.visible===false)continue;br.updateWorldMatrix(true,false);const b=new THREE.Box3().setFromObject(br),p=new THREE.Vector3();b.clampPoint(new THREE.Vector3(x,(b.min.y+b.max.y)/2,z),p);const d=Math.hypot(x-p.x,z-p.z);if(d<bd){bd=d;best={branch:br,point:p,d}}}return best;}

function appleOnBranch(a){if(!a||a.type!=='apple')return true;const br=a.branch,tree=a.tree||a.g?.userData?.appleTree;if(!br?.parent||!tree||tree.visible===false||!tree.userData?.isTree||br.parent!==tree||!br.userData?.appleTwig)return false;br.updateWorldMatrix(true,false);const tip=new THREE.Vector3(0,.46,0).applyMatrix4(br.matrixWorld);const tipGap=Math.hypot(a.x-tip.x,a.z-tip.z,(a.y+.16)-tip.y);return tipGap<.16;}

function appleOutsideOwnTrunk(a){if(!a||a.type!=='apple')return true;const tree=a.tree||a.g?.userData?.appleTree;if(!tree)return false;const trunk=tree.children.find(o=>o.isMesh&&o.geometry===runtime.trunkGeo);if(!trunk)return false;const t=runtime.treeTrunkShape(trunk);return Math.hypot(a.x-t.x,a.z-t.z)>=t.r+.18}
 return {
  bindings:{
"spawnPointBlocked":{get:()=>spawnPointBlocked},
"nearestSafeSpawn":{get:()=>nearestSafeSpawn},
"nearestVisibleAppleTree":{get:()=>nearestVisibleAppleTree},
"nearestVisibleAppleBranch":{get:()=>nearestVisibleAppleBranch},
"appleOnBranch":{get:()=>appleOnBranch},
"appleOutsideOwnTrunk":{get:()=>appleOutsideOwnTrunk}
  },
  initialize(){

  }
 };

}
