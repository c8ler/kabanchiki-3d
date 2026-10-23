import * as THREE from "../../vendor/three/three.module.min.js";
import { capsuleCircleContact } from "../boar-physics.js?v=215";

// Owns 4 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function fixedSignLabel(text){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:runtime.openingLabel(text),transparent:true,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));mesh.userData.fixedSign=true;return mesh}

function physicalSign(parent,text,x,y,z,w,h){
 const board=new THREE.Group();board.position.set(x,0,z);parent.add(board);
 runtime.block(board,runtime.mats.wood,0,y/2,0,.16,y,.16);runtime.block(board,runtime.mats.wood,0,y,0,w,h,.14);
 const label=fixedSignLabel(text);label.position.set(0,y,.075);label.scale.set(w-.12,h-.08,1);board.add(label);board.userData.fallTime=0;board.userData.fallingSign=true;runtime.signBoards.push(board);return board;
}


function resetFallingSigns(){for(const board of runtime.signBoards){board.userData.fallTime=0;board.userData.fallen=false;board.rotation.set(0,0,0);}}

function updateFallingSigns(dt){
 for(const board of runtime.signBoards){let visible=true;for(let p=board;p;p=p.parent)if(!p.visible)visible=false;if(!visible)continue;
 const d=board.userData,world=board.getWorldPosition(new THREE.Vector3());
 if(!d.fallen){
 const touched=runtime.py<2&&Math.hypot(runtime.boy.position.x-world.x,runtime.boy.position.z-world.z)<.7||runtime.boarBodies().some(f=>capsuleCircleContact(runtime.boarBody(f),world.x,world.z,.12));
 if(touched){d.fallen=true;d.fallAngle=Math.atan2(world.x-runtime.boy.position.x,world.z-runtime.boy.position.z);runtime.effect('woodBreak');}
 }
 if(d.fallen){d.fallTime=Math.min(1,d.fallTime+dt/ .65);const k=d.fallTime*d.fallTime*(3-2*d.fallTime),angle=k*Math.PI*.48;board.rotation.x=Math.cos(d.fallAngle)*angle;board.rotation.z=-Math.sin(d.fallAngle)*angle;}
 }
}
 return {
  bindings:{
"fixedSignLabel":{get:()=>fixedSignLabel},
"physicalSign":{get:()=>physicalSign},
"resetFallingSigns":{get:()=>resetFallingSigns},
"updateFallingSigns":{get:()=>updateFallingSigns}
  },
  initialize(){

  }
 };

}
