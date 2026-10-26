import {findFishingWater,fishingCatchPosition} from '../fishing-rules.js?v=218';
import { HomeConstruction } from "../home-construction.js?v=218";
import * as THREE from "../../vendor/three/three.module.min.js";
import { onRiverBridge } from "../world-surface.js?v=218";

// Owns 25 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let probe=null,probeAt=-Infinity,probeX=Infinity,probeZ=Infinity;
 let fishStock,fishingNextBite,fishingIdle,fishingTime,fishingTarget,fishingPrevious,fishingCatch,iceShell,freezeTime,homeSaved,home,personalHouse,homeYard,homePiles,homeParts;

function stopFishing(){runtime.fishingRig.visible=runtime.fishingLine.visible=runtime.fishingFloat.visible=runtime.caughtFish.visible=false;fishingTarget=null;fishingTime=0;fishingIdle=0;fishingPrevious=null;fishingCatch=-1;fishingNextBite=10;runtime.boy.children[5].rotation.x=0}

function nearbyFishingWater(){
 if(runtime.currentSeason==='winter'||![1,2,4,7].includes(runtime.level))return null;
 const {x,z}=runtime.boy.position;
 return findFishingWater({x,z,yaw:runtime.yaw,waterAt:runtime.waterAt,bridge:(px,pz)=>runtime.level===4&&onRiverBridge(px,pz),
 clear:(px,pz,y)=>runtime.clearWallLine(new THREE.Vector3(x,Math.max(runtime.boy.position.y,runtime.terrainHeightAt(x,z))+1,z),new THREE.Vector3(px,y+.1,pz))});
}
function fishingAvailable(){
 const now=performance.now(),p=runtime.boy.position;
 if(now-probeAt>450||Math.hypot(p.x-probeX,p.z-probeZ)>.5){probe=nearbyFishingWater();probeAt=now;probeX=p.x;probeZ=p.z}
 return probe;
}
function updateFishing(dt,now){
 const x=runtime.boy.position.x,z=runtime.boy.position.z,moving=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>runtime.keys[k])||Math.hypot(runtime.stick.x,runtime.stick.y)>.08||runtime.jump||runtime.act||Math.abs(runtime.vy)>.1||(fishingPrevious&&Math.hypot(x-fishingPrevious.x,z-fishingPrevious.z)>.25);
 fishingPrevious={x,z};
 if(moving||runtime.mountedFriend||runtime.boarFormTime>0||runtime.catFormTime>0||runtime.currentSeason==='winter'||(runtime.waterAt(x,z)?.depth||0)>.28||(!fishingTarget&&!runtime.friend&&runtime.foes.some(f=>!f.flee&&Math.hypot(x-f.g.position.x,z-f.g.position.z)<6))){
  if(fishingTarget)stopFishing();fishingIdle=0;return;
 }
 fishingIdle+=dt;
 if(!fishingTarget&&fishingIdle>1.25&&fishingAvailable()){fishingTarget=nearbyFishingWater();if(fishingTarget){runtime.yaw=Math.atan2(fishingTarget.x-x,fishingTarget.z-z);runtime.fishingRig.visible=runtime.fishingLine.visible=runtime.fishingFloat.visible=true;fishingTime=0;fishingNextBite=runtime.rand(7,11);fishingCatch=-1;runtime.notice('🎣 Тимур ловит рыбу. Двигайся, чтобы убрать удочку.')}}
 if(!fishingTarget)return;
 const water=runtime.waterAt(fishingTarget.x,fishingTarget.z);if(!water||water.depth<.02){stopFishing();return}
 fishingTime+=dt;
 if(fishingTime>=fishingNextBite){fishingNextBite=fishingTime+runtime.rand(8,14);if(fishStock<10){fishingCatch=fishingTime;fishStock++;runtime.spawnWaterSplash(fishingTarget.x,fishingTarget.z,1.2);runtime.notice('🐟 Рыба поймана! Можно покормить кабанчика.');runtime.score+=5}}
}
function updateFishingVisual(now){
 const active=runtime.started&&!runtime.paused&&!runtime.cinematicRunning&&!runtime.endShown&&runtime.life>0&&runtime.catFormTime<=0&&runtime.boarFormTime<=0&&!runtime.mountedFriend;
 if(!fishingTarget||!active){runtime.fishingRig.visible=runtime.fishingLine.visible=runtime.fishingFloat.visible=runtime.caughtFish.visible=false;return}
 runtime.boy.rotation.y=Math.atan2(fishingTarget.x-runtime.boy.position.x,fishingTarget.z-runtime.boy.position.z);
 const arm=runtime.boy.children[5];arm.rotation.x=-1.05;arm.rotation.z=-.08;runtime.boy.updateWorldMatrix(true,true);
 const wrist=arm.localToWorld(new THREE.Vector3(0,-.34,0));runtime.fishingRig.position.copy(wrist);runtime.fishingRig.rotation.set(.85,runtime.boy.rotation.y,0,'YXZ');runtime.fishingRig.visible=true;runtime.fishingRig.updateWorldMatrix(true,true);
 const start=runtime.rod.localToWorld(new THREE.Vector3(0,3,0)),end=new THREE.Vector3(fishingTarget.x,fishingTarget.y+.07+Math.sin(now*.003)*.02,fishingTarget.z);
 const age=fishingTime-fishingCatch,caught=fishingCatch>=0&&age<2.8;
 runtime.caughtFish.visible=caught;
 if(caught){const p=fishingCatchPosition(end,wrist,age);runtime.caughtFish.position.set(p.x,p.y,p.z);runtime.caughtFish.rotation.set(Math.sin(age*17)*.18,Math.atan2(wrist.x-end.x,wrist.z-end.z),Math.sin(age*20)*.25);end.copy(runtime.caughtFish.position)}
 runtime.fishingFloat.position.set(fishingTarget.x,fishingTarget.y+.07+Math.sin(now*.003)*(caught?.06:.015),fishingTarget.z);runtime.fishingFloat.visible=runtime.fishingLine.visible=true;
 const vertices=runtime.fishingLine.geometry.attributes.position;
 for(let i=0;i<vertices.count;i++){const t=i/(vertices.count-1);vertices.setXYZ(i,start.x+(end.x-start.x)*t,start.y+(end.y-start.y)*t-Math.sin(Math.PI*t)*(caught?.02:.15),start.z+(end.z-start.z)*t)}
 vertices.needsUpdate=true;runtime.fishingLine.geometry.computeBoundingSphere();
}

function updateUnderwater(dt){if(runtime.boarFormTime>0){runtime.underwaterTime=runtime.underwaterDamageCd=0;return}const fullyUnder=(runtime.level===2||runtime.level===4||runtime.level===7)&&(runtime.boy.position.y+1.2)<(runtime.level===2?.14:.05);if(fullyUnder){runtime.underwaterTime+=dt;runtime.underwaterDamageCd=Math.max(0,runtime.underwaterDamageCd-dt);if(runtime.underwaterTime>8&&runtime.underwaterDamageCd<=0){runtime.life--;runtime.statsData.damage++;runtime.underwaterDamageCd=3;runtime.playerHitFeedback('water');runtime.notice(runtime.life>0?'🌊 Тимур слишком долго под водой! Всплывай! -1❤️':'🌊 Тимур слишком долго пробыл под водой.');if(runtime.life<=0)runtime.showEnd(false)}}else{runtime.underwaterTime=Math.max(0,runtime.underwaterTime-dt*2);runtime.underwaterDamageCd=0}}

function updateWinterFreeze(dt){freezeTime=0;iceShell.visible=false;}

function resetWaterActivity(){probe=null;probeAt=-Infinity;freezeTime=0;iceShell.visible=false;stopFishing();fishingPrevious=null;runtime.wetLast=null;runtime.wetStepDistance=0;runtime.rainRippleClock=0;for(const q of [...runtime.sprayPool,...runtime.rainRingPool]){q.t=0;q.m.visible=false}}

function addSpringFlowers(){const head=new THREE.InstancedMesh(new THREE.SphereGeometry(.13,6,4),new THREE.MeshLambertMaterial({color:0xffffff}),runtime.mobile?45:110),stem=new THREE.InstancedMesh(new THREE.BoxGeometry(.04,.28,.04),new THREE.MeshLambertMaterial({color:0x669642}),head.count),d=new THREE.Object3D();for(let i=0;i<head.count;i++){const [x,z]=runtime.safeForageSpot(),y=runtime.terrainHeightAt(x,z);d.position.set(x,y+.3,z);d.updateMatrix();head.setMatrixAt(i,d.matrix);head.setColorAt(i,new THREE.Color([0xffb3d4,0xffe891,0xe8d6ff][i%3]));d.position.y=y+.14;d.updateMatrix();stem.setMatrixAt(i,d.matrix)}runtime.seasonVisual.add(head,stem);head.userData.springFlowers=true}

function addWinterRoadBorders(){const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.35,.16,1.65),runtime.winterRoadMaterial,112),d=new THREE.Object3D();let count=0;for(let z=-44;z<=44;z+=1.6){if(runtime.level===4&&onRiverBridge(0,z))continue;for(const side of [-1,1]){const x=side*(runtime.roadHalfWidthAt(z)+.22);d.position.set(x,.11,z);d.rotation.set(0,side*Math.atan((runtime.roadHalfWidthAt(z+.1)-runtime.roadHalfWidthAt(z-.1))/.2),0);d.scale.set(1,1,1);d.updateMatrix();mesh.setMatrixAt(count++,d.matrix)}}mesh.count=count;mesh.userData.snowRoadBorder=true;mesh.instanceMatrix.needsUpdate=true;runtime.seasonVisual.add(mesh)}

function addChristmasTree(){const g=new THREE.Group();g.position.set(10,runtime.terrainHeightAt(10,26),26);runtime.seasonVisual.add(g);const needles=new THREE.MeshLambertMaterial({color:0x1f603e});runtime.christmasSolid=runtime.block(g,runtime.mats.wood,0,.45,0,.3,.9,.3);runtime.christmasSolid.userData.collisionRadius=1.7;runtime.treeSolidMeshes.push(runtime.christmasSolid);for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(1.7-i*.3,1.8,10),needles);m.position.y=1.2+i*.75;g.add(m)}for(let i=0;i<24;i++){const a=i*2.399,y=.9+i/24*2.7,r=1.55-(y-.9)*.34;runtime.sphere(g,new THREE.MeshBasicMaterial({color:[0xffd06d,0xe75b54,0x67c8ed][i%3]}),Math.sin(a)*r,y,Math.cos(a)*r,.1)}const star=new THREE.Mesh(new THREE.OctahedronGeometry(.24),new THREE.MeshBasicMaterial({color:0xffe28b}));star.position.y=4.2;g.add(star);const glow=runtime.makeEffectLight(0xffcb70,3,7);glow.position.y=2.3;g.add(glow);g.userData.christmasTree=true}
 return {
  bindings:{
"fishStock":{get:()=>fishStock,set:value=>{fishStock=value}},
"fishingNextBite":{get:()=>fishingNextBite,set:value=>{fishingNextBite=value}},
"fishingIdle":{get:()=>fishingIdle,set:value=>{fishingIdle=value}},
"fishingTime":{get:()=>fishingTime,set:value=>{fishingTime=value}},
"fishingTarget":{get:()=>fishingTarget,set:value=>{fishingTarget=value}},
"fishingPrevious":{get:()=>fishingPrevious,set:value=>{fishingPrevious=value}},
"fishingCatch":{get:()=>fishingCatch,set:value=>{fishingCatch=value}},
"stopFishing":{get:()=>stopFishing},
"nearbyFishingWater":{get:()=>nearbyFishingWater},
"updateFishing":{get:()=>updateFishing},
"updateFishingVisual":{get:()=>updateFishingVisual},
"iceShell":{get:()=>iceShell},
"freezeTime":{get:()=>freezeTime,set:value=>{freezeTime=value}},
"updateUnderwater":{get:()=>updateUnderwater},
"updateWinterFreeze":{get:()=>updateWinterFreeze},
"resetWaterActivity":{get:()=>resetWaterActivity},
"addSpringFlowers":{get:()=>addSpringFlowers},
"addWinterRoadBorders":{get:()=>addWinterRoadBorders},
"addChristmasTree":{get:()=>addChristmasTree},
"homeSaved":{get:()=>homeSaved,set:value=>{homeSaved=value}},
"home":{get:()=>home},
"personalHouse":{get:()=>personalHouse,set:value=>{personalHouse=value}},
"homeYard":{get:()=>homeYard,set:value=>{homeYard=value}},
"homePiles":{get:()=>homePiles,set:value=>{homePiles=value}},
"homeParts":{get:()=>homeParts,set:value=>{homeParts=value}}
  },
  initialize(){

/* init:let */ fishStock = 0;
/* init:let */ fishingNextBite = 10;

/* init:let */ fishingIdle = 0;
/* init:let */ fishingTime = 0;
/* init:let */ fishingTarget = null;
/* init:let */ fishingPrevious = null;
/* init:let */ fishingCatch = -1;

/* init:const */ iceShell = new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshPhongMaterial({color:0x8ecff0,transparent:true,opacity:.58,shininess:100,depthWrite:false}));

iceShell.visible=false;

runtime.scene.add(iceShell);

/* init:let */ freezeTime = 0;


/* init:let */ homeSaved = {};

try{homeSaved=JSON.parse(localStorage.getItem('kabanchiki3d_home')||'{}')||{}}catch{}

/* init:const */ home = new HomeConstruction(homeSaved);

/* init:let */ personalHouse = null;
/* init:let */ homeYard = null;
/* init:let */ homePiles = [];
/* init:let */ homeParts = null;
  }
 };

}
