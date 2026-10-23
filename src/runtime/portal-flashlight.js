import * as THREE from "../../vendor/three/three.module.min.js";
import { CatLife } from "../cat-life.js?v=216";
import { BirdLife } from "../bird-life.js?v=216";

// Owns 11 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let handFlashlight,flashlightBodyMat,flashlightLensMat,handLens,winterRoadMaterial,iceWaterMaterial,birdLife,catLife;

function makePortal(){
 const g=runtime.group(0,-42),frameMat=new THREE.MeshStandardMaterial({color:0x51465f,roughness:.94,map:runtime.mats.stone.map});
 // A stepped stone arch frames the luminous opening; gameplay trigger stays at the same point.
 for(const sx of [-1,1]){for(let j=0;j<6;j++)runtime.block(g,frameMat,sx*1.38,.30+j*.52,0,.62,.50,.72);runtime.block(g,frameMat,sx*1.72,.16,0,1.0,.32,1.12)}
 runtime.block(g,frameMat,0,3.25,0,3.35,.62,.82);runtime.block(g,frameMat,0,3.68,0,2.15,.25,.68);
 const runeMat=new THREE.MeshBasicMaterial({color:0xdd9aff});for(const sx of [-1,1])for(let j=0;j<3;j++)runtime.block(g,runeMat,sx*1.38,.80+j*.78,.37,.10,.26,.025);
 const ring=new THREE.Mesh(new THREE.PlaneGeometry(2.13,2.72),new THREE.MeshBasicMaterial({color:0x8b20ff,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}));ring.position.set(0,1.63,-.035);g.add(ring);
 const portalHalo=runtime.visualOnly(()=>new THREE.Sprite(new THREE.SpriteMaterial({map:runtime.softGlowTexture,color:0xb44aff,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false})));portalHalo.position.set(0,1.7,.10);portalHalo.scale.set(5.8,6.1,1);g.add(portalHalo);
 const core=new THREE.Mesh(new THREE.PlaneGeometry(1.95,2.58),new THREE.MeshBasicMaterial({map:portalTexture(),color:0xffffff,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));core.position.set(0,1.63,.02);g.add(core);
 const glow=runtime.makeEffectLight(0xb44aff,7,13,1.6);glow.position.set(0,1.8,.65);g.add(glow);runtime.portalObj={g,ring,core,glow};g.visible=false
}

function portalTexture(){const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=(x-size/2)/(size/2),v=(y-size/2)/(size/2),wave=(Math.sin(u*10+Math.sin(v*8)*2)+Math.cos(v*12-u*5))*.25+.5;const i=(y*size+x)*4;data[i]=125+wave*115;data[i+1]=25+wave*75;data[i+2]=255;data[i+3]=230}const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t}

function updateHandFlashlight(){
 handFlashlight.visible=runtime.hasFlashlight&&runtime.boarFormTime<=0&&runtime.catFormTime<=0&&!runtime.cinematicRunning;if(!handFlashlight.visible){runtime.torch.intensity=0;return}
 const arm=runtime.boy.children[6];arm.rotation.x=-.55;arm.rotation.z=-.12;runtime.boy.updateWorldMatrix(true,true);const wrist=arm.localToWorld(new THREE.Vector3(0,-.5,0));handFlashlight.position.copy(runtime.boy.worldToLocal(wrist.clone()));handFlashlight.position.z+=.23;handFlashlight.updateWorldMatrix(true,true);handLens.getWorldPosition(runtime.torch.position);const forward=new THREE.Vector3(Math.sin(runtime.boy.rotation.y),-.035,Math.cos(runtime.boy.rotation.y));runtime.torch.target.position.copy(runtime.torch.position).addScaledVector(forward,14);runtime.torch.intensity=runtime.level>=4?42:16;
}
 return {
  bindings:{
"makePortal":{get:()=>makePortal},
"portalTexture":{get:()=>portalTexture},
"handFlashlight":{get:()=>handFlashlight},
"flashlightBodyMat":{get:()=>flashlightBodyMat},
"flashlightLensMat":{get:()=>flashlightLensMat},
"handLens":{get:()=>handLens},
"updateHandFlashlight":{get:()=>updateHandFlashlight},
"winterRoadMaterial":{get:()=>winterRoadMaterial},
"iceWaterMaterial":{get:()=>iceWaterMaterial},
"birdLife":{get:()=>birdLife},
"catLife":{get:()=>catLife}
  },
  initialize(){


/* init:const */ handFlashlight = new THREE.Group();

runtime.boy.add(handFlashlight);

handFlashlight.visible=false;

/* init:const */ flashlightBodyMat = new THREE.MeshStandardMaterial({color:0x424f57,metalness:.55,roughness:.4});
/* init:const */ flashlightLensMat = new THREE.MeshBasicMaterial({color:0xfff0b7});

runtime.block(handFlashlight,flashlightBodyMat,0,0,0,.25,.25,.56);

runtime.block(handFlashlight,runtime.mats.gold,0,0,.16,.28,.28,.11);

/* init:const */ handLens = new THREE.Mesh(new THREE.CircleGeometry(.13,12),flashlightLensMat);

handLens.position.z=.295;

handFlashlight.add(handLens);


/* init:const */ winterRoadMaterial = new THREE.MeshLambertMaterial({color:0xe1eaf0});
/* init:const */ iceWaterMaterial = new THREE.MeshPhongMaterial({color:0xbcdce8,transparent:true,opacity:.94,shininess:75,specular:0xffffff,side:THREE.DoubleSide});

/* init:const */ birdLife = new BirdLife(THREE,runtime.scene,runtime.mobile);

/* init:const */ catLife = new CatLife(THREE,runtime.scene,runtime.mobile);
  }
 };

}
