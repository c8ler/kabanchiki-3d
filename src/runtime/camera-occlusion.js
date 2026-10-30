import * as THREE from "../../vendor/three/three.module.min.js";
import { OcclusionSchedule } from "../render-budget.js?v=222";

// Owns 7 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let occlusionSchedule,occlusionRay,occlusionDirection,occlusionRoots,occlusionEpoch,fadedRoots;

function updateCameraOcclusion(now){if(runtime.cinematicRunning){for(const root of fadedRoots)runtime.setObjectCameraFade(root,false);fadedRoots.clear();return}if(!occlusionSchedule.due(now,runtime.worldEpoch,runtime.boy.position.x,runtime.boy.position.z,runtime.camera.position.x,runtime.camera.position.z))return;
 if(occlusionEpoch!==runtime.worldEpoch){occlusionEpoch=runtime.worldEpoch;occlusionRoots=[...new Set([...runtime.treeObjects,...runtime.rockPositions.map(q=>q[3]),...runtime.houseObjects.filter(h=>h!==runtime.familyHideout),...runtime.craftWorld.items.filter(item=>['house','wall','roof'].includes(item.kind)).map(item=>item.g),...runtime.ridgeObjects,...runtime.boundaryDecor,...runtime.biomeObjects])].filter(Boolean)}
 const roots=occlusionRoots.filter(root=>{for(let p=root;p;p=p.parent)if(!p.visible)return false;return Math.hypot(root.position.x-runtime.boy.position.x,root.position.z-runtime.boy.position.z)<30});const rootSet=new Set(roots);
 occlusionDirection.copy(runtime.boy.position);occlusionDirection.y+=1.1;occlusionDirection.sub(runtime.camera.position);const length=occlusionDirection.length();occlusionDirection.normalize();occlusionRay.set(runtime.camera.position,occlusionDirection);occlusionRay.far=length;const next=new Set();for(const hit of occlusionRay.intersectObjects(roots,true)){let root=hit.object;while(root.parent&&!rootSet.has(root))root=root.parent;if(rootSet.has(root))next.add(root)}
 for(const root of fadedRoots)if(!next.has(root))runtime.setObjectCameraFade(root,false);for(const root of next)if(!fadedRoots.has(root))runtime.setObjectCameraFade(root,true);fadedRoots=next;
}
 return {
  bindings:{
"occlusionSchedule":{get:()=>occlusionSchedule},
"occlusionRay":{get:()=>occlusionRay},
"occlusionDirection":{get:()=>occlusionDirection},
"occlusionRoots":{get:()=>occlusionRoots,set:value=>{occlusionRoots=value}},
"occlusionEpoch":{get:()=>occlusionEpoch,set:value=>{occlusionEpoch=value}},
"fadedRoots":{get:()=>fadedRoots,set:value=>{fadedRoots=value}},
"updateCameraOcclusion":{get:()=>updateCameraOcclusion}
  },
  initialize(){

/* init:const */ occlusionSchedule = new OcclusionSchedule();
/* init:const */ occlusionRay = new THREE.Raycaster();
/* init:const */ occlusionDirection = new THREE.Vector3();

/* init:let */ occlusionRoots = [];
/* init:let */ occlusionEpoch = -1;
/* init:let */ fadedRoots = new Set();
  }
 };

}
