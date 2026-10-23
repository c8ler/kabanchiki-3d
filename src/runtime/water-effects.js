import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 8 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let fishingRig,rod,fishingLine,fishingFloat,caughtFish;

function spawnWaterRing(x,z,y,size=1){const q=runtime.rainRingPool[runtime.ringCursor++%runtime.rainRingPool.length];q.t=.7;q.size=size;q.m.position.set(x,y+.015,z);q.m.visible=true;q.m.scale.setScalar(.06)}

function spawnWaterSplash(x,z,power=1){const water=runtime.waterAt(x,z);if(!water)return;for(let i=0;i<Math.round(8*power);i++){const q=runtime.sprayPool[runtime.sprayCursor++%runtime.sprayPool.length],a=i*2.399;q.t=.6+.15*power;q.m.position.set(x,water.y+.03,z);q.v.set(Math.cos(a)*(.5+power*.65),1+power*.9,Math.sin(a)*(.5+power*.65));q.m.visible=true}spawnWaterRing(x,z,water.y,power*.65);runtime.effect('splash')}

function updateWaterEffects(dt,now){const active=runtime.started&&!runtime.paused&&!runtime.win&&!runtime.endShown;runtime.waterFxRoot.visible=!runtime.cinematicRunning;
 for(const q of runtime.sprayPool)if(q.t>0){q.t-=dt;q.v.y-=dt*7;q.m.position.addScaledVector(q.v,dt);q.m.material.opacity=Math.max(0,q.t);q.m.visible=q.t>0}
 for(const q of runtime.rainRingPool)if(q.t>0){q.t-=dt;q.m.visible=q.t>0;q.m.scale.setScalar((.1+(1-q.t/.7)*.7)*q.size);q.m.material.opacity=Math.max(0,q.t*.65)}
 if(!active){runtime.wetLast=null;return}const x=runtime.boy.position.x,z=runtime.boy.position.z;if(runtime.wetLast){const d=Math.hypot(x-runtime.wetLast.x,z-runtime.wetLast.z);if(d<2)runtime.wetStepDistance+=d;else runtime.wetStepDistance=0}runtime.wetLast={x,z};if(runtime.wetStepDistance>.65&&runtime.walkingInWater(x,z)&&Math.abs(runtime.vy)<2){runtime.wetStepDistance=0;spawnWaterSplash(x,z,runtime.mountedFriend?1.35:.65)}
 if(runtime.currentSeason!=='winter'&&runtime.weatherStage>=1){runtime.rainRippleClock+=dt*(runtime.weatherStage*10);while(runtime.rainRippleClock>=1){runtime.rainRippleClock--;let x,z;const visible=runtime.puddleObjects.filter(p=>p.visible);if(visible.length&&Math.random()<.55){const p=visible[Math.floor(Math.random()*visible.length)],a=Math.random()*6.28,r=Math.sqrt(Math.random())*p.scale.x*.8;x=p.position.x+Math.cos(a)*r;z=p.position.z+Math.sin(a)*r}else{x=runtime.boy.position.x+runtime.rand(-15,15);z=runtime.boy.position.z+runtime.rand(-15,15)}const w=runtime.waterAt(x,z);if(w)spawnWaterRing(x,z,w.y,.4+Math.random()*.6)}}
}
 return {
  bindings:{
"spawnWaterRing":{get:()=>spawnWaterRing},
"spawnWaterSplash":{get:()=>spawnWaterSplash},
"updateWaterEffects":{get:()=>updateWaterEffects},
"fishingRig":{get:()=>fishingRig},
"rod":{get:()=>rod},
"fishingLine":{get:()=>fishingLine},
"fishingFloat":{get:()=>fishingFloat},
"caughtFish":{get:()=>caughtFish}
  },
  initialize(){

/* init:const */ fishingRig = new THREE.Group();

runtime.boy.add(fishingRig);

fishingRig.visible=false;

/* init:const */ rod = new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,3.2,6),new THREE.MeshLambertMaterial({color:0x6c4324}));

rod.position.set(-.7,2.15,.85);

rod.rotation.x=-.75;

fishingRig.add(rod);

/* init:const */ fishingLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0xc2d8d7,transparent:true,opacity:.65}));

runtime.scene.add(fishingLine);

fishingLine.visible=false;

/* init:const */ fishingFloat = new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),new THREE.MeshBasicMaterial({color:0xed765a}));

runtime.scene.add(fishingFloat);

fishingFloat.visible=false;

/* init:const */ caughtFish = new THREE.Mesh(new THREE.SphereGeometry(.17,8,6),new THREE.MeshLambertMaterial({color:0xb3d4c1}));

caughtFish.scale.set(.55,.6,1.6);

runtime.scene.add(caughtFish);

caughtFish.visible=false;
  }
 };

}
