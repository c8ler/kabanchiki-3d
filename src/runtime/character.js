import { RideHop } from "../world-interactions.js?v=217";
import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 17 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let boy,boyHairMat,boyShoeMat,boyPackMat,boySkinMat,boyEyeMat,vy,py,mountedFriend,rideBump,rideGallop,footBranchBump,rideHop,riderPoseParts,lakeInlet;

function makeBoy(){let g=new THREE.Group();runtime.block(g,runtime.mats.pants,-.18,.43,0,.34,.85,.4);runtime.block(g,runtime.mats.pants,.18,.43,0,.34,.85,.4);runtime.block(g,runtime.mats.shirt,0,1.25,0,.85,.9,.48);runtime.block(g,runtime.mats.skin,0,2.03,0,.7,.7,.65);runtime.block(g,runtime.mats.hair,0,2.43,-.04,.76,.2,.68);runtime.block(g,runtime.mats.skin,-.56,1.25,0,.23,.72,.24);runtime.block(g,runtime.mats.skin,.56,1.25,0,.23,.72,.24);for(const x of [-.18,.18])runtime.block(g,runtime.mats.black,x,2.09,.34,.08,.1,.04);return g}

function setRiderPose(on){
 const {leftLeg,rightLeg,leftArm,rightArm}=riderPoseParts;
 if(leftLeg){leftLeg.rotation.x=on?-1.02:0;leftLeg.rotation.z=on?-.18:0;leftLeg.position.y=on?.70:.43;leftLeg.position.z=on?.18:0}
 if(rightLeg){rightLeg.rotation.x=on?-1.02:0;rightLeg.rotation.z=on?.18:0;rightLeg.position.y=on?.70:.43;rightLeg.position.z=on?.18:0}
 if(leftArm){leftArm.rotation.x=on?-.72:0;leftArm.rotation.z=on?-.18:0}
 if(rightArm){rightArm.rotation.x=on?-.72:0;rightArm.rotation.z=on?.18:0}
}
 return {
  bindings:{
"makeBoy":{get:()=>makeBoy},
"boy":{get:()=>boy},
"boyHairMat":{get:()=>boyHairMat},
"boyShoeMat":{get:()=>boyShoeMat},
"boyPackMat":{get:()=>boyPackMat},
"boySkinMat":{get:()=>boySkinMat},
"boyEyeMat":{get:()=>boyEyeMat},
"vy":{get:()=>vy,set:value=>{vy=value}},
"py":{get:()=>py,set:value=>{py=value}},
"mountedFriend":{get:()=>mountedFriend,set:value=>{mountedFriend=value}},
"rideBump":{get:()=>rideBump,set:value=>{rideBump=value}},
"rideGallop":{get:()=>rideGallop,set:value=>{rideGallop=value}},
"footBranchBump":{get:()=>footBranchBump,set:value=>{footBranchBump=value}},
"rideHop":{get:()=>rideHop},
"riderPoseParts":{get:()=>riderPoseParts},
"setRiderPose":{get:()=>setRiderPose},
"lakeInlet":{get:()=>lakeInlet}
  },
  initialize(){

/* init:const */ boy = makeBoy();

boy.scale.setScalar(.52);

// Character Remaster — Timur
/* init:const */ boyHairMat = new THREE.MeshLambertMaterial({color:0x4a2b1c});
/* init:const */ boyShoeMat = new THREE.MeshLambertMaterial({color:0x243447});
/* init:const */ boyPackMat = new THREE.MeshLambertMaterial({color:0x6d4329});
/* init:const */ boySkinMat = new THREE.MeshLambertMaterial({color:0xf2b184});
/* init:const */ boyEyeMat = new THREE.MeshBasicMaterial({color:0x17212b});

runtime.block(boy,boyHairMat,0,2.52,-.02,.82,.22,.72);

for(const sx of [-1,1]){runtime.block(boy,boySkinMat,sx*.39,2.06,0,.13,.28,.18);runtime.block(boy,boyEyeMat,sx*.18,2.11,.37,.09,.11,.035);runtime.block(boy,boyShoeMat,sx*.18,.10,.12,.36,.20,.58)}

runtime.block(boy,boyPackMat,0,1.35,-.35,.68,.82,.22);

// Chunky fringe, white eyes, eyebrows and a small mouth like the reference hero.
for(const sx of [-1,1]){runtime.block(boy,runtime.mats.white,sx*.18,2.11,.365,.19,.19,.025);runtime.block(boy,boyEyeMat,sx*.15,2.10,.386,.075,.12,.028);const brow=runtime.block(boy,boyHairMat,sx*.18,2.25,.377,.23,.06,.045);brow.rotation.z=sx*-.10;runtime.block(boy,runtime.mats.shirt,sx*.56,1.53,0,.25,.25,.27)}

for(let i=0;i<4;i++)runtime.block(boy,boyHairMat,-.30+i*.20,2.37+(i%2)*.04,.32,.21,.25,.14);

runtime.block(boy,boyHairMat,0,1.88,.341,.19,.045,.024);

boy.userData.visualRemaster=true;

boy.traverse(o=>{if(o.isMesh){o.castShadow=!runtime.mobile;o.receiveShadow=!runtime.mobile}});

runtime.scene.add(boy);

boy.position.set(0,0,4);

/* init:let */ vy = 0;
/* init:let */ py = 0;
/* init:let */ mountedFriend = false;
/* init:let */ rideBump = 0;
/* init:let */ rideGallop = 0;
/* init:let */ footBranchBump = 0;

/* init:const */ rideHop = new RideHop();

// v87 riding pose: Timur visibly sits astride the friendly boar instead of standing on its back.
/* init:const */ riderPoseParts = {leftLeg:boy.children[0],rightLeg:boy.children[1],leftArm:boy.children[5],rightArm:boy.children[6]};


/* init:const */ lakeInlet = new THREE.Group();

runtime.lakeVisual.add(lakeInlet);
  }
 };

}
