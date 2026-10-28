import {islandDepth} from '../creative-island.js?v=219';
import { TornadoState } from "../tornado-rules.js?v=219";
import { TornadoVisual } from "../tornado-visual.js?v=219";
import * as THREE from "../../vendor/three/three.module.min.js";
import { riverDepthAt, lakeInletDepthAt, lakeRadiusAt, lakeDepth } from "../world-surface.js?v=219";
import { openingStreamDepth } from "../opening-adventure.js?v=219";

// Owns 29 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let weatherGroup,rainCount,rainPos,rainGeo,rainMat,rainPoints,stormLeaves,stormLeafMat,stormBurning,stormRemains,stormTouched,lightningBolts,worldEpoch,lightningSky,lightningSun,tornadoState,tornadoVisual,tornadoSweep,weatherStage,underwaterTime,underwaterDamageCd,hurricaneCarry,leafSpawnCd,nextLightningAt,lightningFlash,weatherBaseSky;

// v134: physical lake depth. Characters descend below the water surface toward the centre.
function lakeDepthAt(x,z){if(runtime.level===7)return islandDepth(x,z);if(runtime.currentSeason==='winter')return 0;if(runtime.level===4)return riverDepthAt(x,z);if(runtime.level===1&&runtime.opening)return openingStreamDepth(x,z);if(runtime.level!==2)return 0;return Math.max(lakeDepth(x,z),lakeInletDepthAt(x,z))}

function inLake(x,z,margin=0){return runtime.level===2&&lakeRadiusAt(x,z)<13.6+margin}


function windVector(now){const gust=Math.sin(now*.00083)*.28+Math.sin(now*.00191+1.7)*.16;const a=gust;return {x:Math.sin(a),z:Math.cos(a),power:weatherStage>=4?1.0:weatherStage===3?.62:weatherStage===2?.34:0}}
 return {
  bindings:{
"lakeDepthAt":{get:()=>lakeDepthAt},
"inLake":{get:()=>inLake},
"weatherGroup":{get:()=>weatherGroup},
"rainCount":{get:()=>rainCount},
"rainPos":{get:()=>rainPos},
"rainGeo":{get:()=>rainGeo},
"rainMat":{get:()=>rainMat},
"rainPoints":{get:()=>rainPoints},
"stormLeaves":{get:()=>stormLeaves},
"stormLeafMat":{get:()=>stormLeafMat},
"stormBurning":{get:()=>stormBurning},
"stormRemains":{get:()=>stormRemains},
"stormTouched":{get:()=>stormTouched},
"lightningBolts":{get:()=>lightningBolts},
"worldEpoch":{get:()=>worldEpoch,set:value=>{worldEpoch=value}},
"lightningSky":{get:()=>lightningSky},
"lightningSun":{get:()=>lightningSun},
"tornadoState":{get:()=>tornadoState},
"tornadoVisual":{get:()=>tornadoVisual},
"tornadoSweep":{get:()=>tornadoSweep,set:value=>{tornadoSweep=value}},
"weatherStage":{get:()=>weatherStage,set:value=>{weatherStage=value}},
"underwaterTime":{get:()=>underwaterTime,set:value=>{underwaterTime=value}},
"underwaterDamageCd":{get:()=>underwaterDamageCd,set:value=>{underwaterDamageCd=value}},
"hurricaneCarry":{get:()=>hurricaneCarry,set:value=>{hurricaneCarry=value}},
"leafSpawnCd":{get:()=>leafSpawnCd,set:value=>{leafSpawnCd=value}},
"nextLightningAt":{get:()=>nextLightningAt,set:value=>{nextLightningAt=value}},
"lightningFlash":{get:()=>lightningFlash,set:value=>{lightningFlash=value}},
"weatherBaseSky":{get:()=>weatherBaseSky,set:value=>{weatherBaseSky=value}},
"windVector":{get:()=>windVector}
  },
  initialize(){

// v138 weather escalation: cloud buildup, wind-driven cloud drift, whole-sky lightning and destructive strikes.
/* init:const */ weatherGroup = new THREE.Group();

runtime.scene.add(weatherGroup);

weatherGroup.visible=false;

/* init:const */ rainCount = runtime.mobile?360:720;
/* init:const */ rainPos = new Float32Array(rainCount*3);

for(let i=0;i<rainCount;i++){rainPos[i*3]=runtime.rand(-24,24);rainPos[i*3+1]=runtime.rand(1,24);rainPos[i*3+2]=runtime.rand(-24,24)}

/* init:const */ rainGeo = new THREE.BufferGeometry();

rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));

/* init:const */ rainMat = new THREE.PointsMaterial({color:0xb9dcff,size:.075,transparent:true,opacity:.68,depthWrite:false});

/* init:const */ rainPoints = new THREE.Points(rainGeo,rainMat);

weatherGroup.add(rainPoints);

/* init:const */ stormLeaves = [];

/* init:const */ stormLeafMat = new THREE.MeshBasicMaterial({color:0x6f8f35,side:THREE.DoubleSide,transparent:true,opacity:.86});

/* init:const */ stormBurning = new Map();
/* init:const */ stormRemains = [];
/* init:const */ stormTouched = new Set();
/* init:const */ lightningBolts = [];

/* init:let */ worldEpoch = 0;

/* init:const */ lightningSky = new THREE.HemisphereLight(0xf2fbff,0xb8d5ff,0);

runtime.scene.add(lightningSky);

/* init:const */ lightningSun = new THREE.DirectionalLight(0xeaf6ff,0);

lightningSun.position.set(8,24,6);

runtime.scene.add(lightningSun);

/* init:const */ tornadoState = new TornadoState();
/* init:const */ tornadoVisual = new TornadoVisual(runtime.scene,runtime.mobile);

/* init:let */ tornadoSweep = 0;

/* init:let */ weatherStage = 0;
/* init:let */ underwaterTime = 0;
/* init:let */ underwaterDamageCd = 0;
/* init:let */ hurricaneCarry = 0;
/* init:let */ leafSpawnCd = 0;
/* init:let */ nextLightningAt = 0;
/* init:let */ lightningFlash = 0;
/* init:let */ weatherBaseSky = null;
  }
 };

}
