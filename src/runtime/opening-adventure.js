import { buildExitLandscape, makeExitFence } from "../exit-scenery.js?v=222";
import { forestEdgeAt } from "../world-interactions.js?v=222";
import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 7 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){


function buildExitFence(props,z){makeExitFence(props,z,runtime.mats)}

function openingLabel(text){
 const canvas=document.createElement('canvas');canvas.width=320;canvas.height=80;const ctx=canvas.getContext('2d');
 let fontSize=28;ctx.font='800 '+fontSize+'px Trebuchet MS,sans-serif';while(ctx.measureText(text).width>292&&fontSize>16){fontSize--;ctx.font='800 '+fontSize+'px Trebuchet MS,sans-serif';}ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=9;ctx.strokeStyle='#173b33';ctx.strokeText(text,160,40);ctx.fillStyle='#fff0cf';ctx.fillText(text,160,40);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}


function buildForestEdge(props){
 const edge=new THREE.Group();props.add(edge);props.userData.edge=edge;edge.userData.profile=[];
 const points=[];for(const side of [-1,1])for(let x=6.1;x<=45;x+=1.2)points.push({x:side*x,z:forestEdgeAt(side*x)-.38,h:2.1+.4*Math.sin(x*.9)});
 const wood=new THREE.InstancedMesh(runtime.cube,runtime.mats.wood,points.length),leaf=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),runtime.mats.leaf,points.length),shrubs=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),runtime.mats.leaf2,points.length),matrix=new THREE.Matrix4();
 points.forEach((p,i)=>{matrix.makeScale(.36,p.h,.36).setPosition(p.x,p.h/2,p.z);wood.setMatrixAt(i,matrix);matrix.makeScale(1.15,1.1,1).setPosition(p.x,p.h+.1,p.z);leaf.setMatrixAt(i,matrix);matrix.makeScale(.65,.52,.65).setPosition(p.x,.5,p.z+.05);shrubs.setMatrixAt(i,matrix);edge.userData.profile.push(p)});
 edge.add(wood,leaf,shrubs);
}


function setupOpeningProps(){
 if(!runtime.openingProps){
  runtime.openingProps=new THREE.Group();runtime.scene.add(runtime.openingProps);buildForestEdge(runtime.openingProps);
  const mat=new THREE.MeshPhongMaterial({color:0x6db6c9,transparent:true,opacity:.66,shininess:90,depthWrite:false});
  const brook=new THREE.Mesh(new THREE.CircleGeometry(1,32),mat);brook.rotation.x=-Math.PI/2;brook.scale.set(4.6,1.9,1);brook.position.set(0,.05,-5);runtime.openingProps.add(brook);runtime.openingProps.userData.brook=brook;runtime.openingProps.userData.waterMaterial=mat;
  runtime.openingProps.userData.crateFruit=[];runtime.block(runtime.openingProps,runtime.mats.wood,-2.9,.16,24.3,1,.25,.7);for(const [x,z] of [[-3.1,24.15],[-2.7,24.15],[-2.9,24.45]])runtime.openingProps.userData.crateFruit.push(runtime.makeFoodModel('apple',runtime.openingProps,x,.46,z));
  for(const z of [12,0,-12])runtime.physicalSign(runtime.openingProps,'К МАМЕ →',3.1,1.2,z,1.65,.45);
  const marker=new THREE.Sprite(new THREE.SpriteMaterial({map:openingLabel('МАМА'),transparent:true,depthWrite:false,toneMapped:false,fog:false}));marker.scale.set(4,1,1);runtime.openingProps.add(marker);runtime.openingProps.userData.marker=marker;
  const exit=new THREE.Group();exit.position.set(0,0,-39);runtime.openingProps.add(exit);runtime.openingProps.userData.exit=exit;
  const trail=new THREE.Mesh(new THREE.PlaneGeometry(6.2,9),new THREE.MeshLambertMaterial({color:0xc3ab79,side:THREE.DoubleSide}));trail.rotation.x=-Math.PI/2;trail.position.set(0,.05,-13.5);exit.add(trail);runtime.openingProps.userData.trail=trail;
  const shore=new THREE.Mesh(new THREE.PlaneGeometry(23,18),new THREE.MeshLambertMaterial({color:0xb4c281,side:THREE.DoubleSide}));shore.rotation.x=-Math.PI/2;shore.position.set(0,-.015,-21);exit.add(shore);
  const distantLake=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshPhongMaterial({color:0x68aec1,shininess:80,side:THREE.DoubleSide}));distantLake.rotation.x=-Math.PI/2;distantLake.scale.set(10,6,1);distantLake.position.set(0,.04,-23);exit.add(distantLake);runtime.openingProps.userData.distantLake=distantLake;runtime.openingProps.userData.distantWater=distantLake.material;
  for(const [x,z] of [[-4,0],[4,0],[-4.6,-4],[4.6,-4],[-5.2,-9],[5.2,-9],[-8,-16],[8,-16]]){runtime.block(exit,runtime.mats.wood,x,2.1,z,.55,4.2,.55);runtime.sphere(exit,runtime.mats.leaf,x,4.1,z,2.25)}

  for(const x of [-5.8,5.8]){runtime.block(exit,runtime.mats.wood,x,2,0,.65,4,.65);runtime.sphere(exit,runtime.mats.leaf,x,4,0,2.6)}
  const trunk=new THREE.Group();trunk.position.set(0,.72,5.8);exit.add(trunk);runtime.openingProps.userData.trunk=trunk;
  const bark=new THREE.Mesh(new THREE.CylinderGeometry(.64,.78,10.5,9),runtime.mats.wood);bark.rotation.z=Math.PI/2;trunk.add(bark);
  const debris=new THREE.Group();exit.add(debris);runtime.openingProps.userData.debris=debris;
  for(let i=0;i<18;i++){const side=i%2?1:-1,chip=i<2?new THREE.Mesh(new THREE.CylinderGeometry(.64,.7,4.5,9),runtime.mats.wood):runtime.block(debris,runtime.mats.wood,0,0,0,.12+(i%3)*.07,.12,.25);if(i<2)debris.add(chip);chip.userData={large:i<2,side,offset:i<2?4.4:3.3+(i%5)*.35,height:i<2?.5:.15,spread:(i%4-1.5)*.7};}
  for(const x of [-3,1,3.8]){const branch=runtime.block(trunk,runtime.mats.wood,x,.65,0,.28,1.5,.28);branch.rotation.z=.5}
  runtime.physicalSign(exit,'К ОЗЕРУ →',3.6,2.15,2,2.6,.75);buildExitLandscape(runtime.openingProps,1,runtime.mats,runtime.terrainHeightAt);runtime.openingProps.userData.distantLake.visible=false;
 }
 runtime.openingProps.visible=true;runtime.resetExitBreaker(runtime.openingProps);runtime.openingProps.userData.label='';runtime.openingProps.userData.trunk.position.set(0,.72,5.8);runtime.openingProps.userData.trunk.rotation.set(0,0,0);runtime.openingProps.userData.trunk.visible=true;runtime.openingProps.userData.debris.visible=false;runtime.openingProps.userData.distantLake.material=runtime.currentSeason==='winter'?runtime.iceWaterMaterial:runtime.openingProps.userData.distantWater;for(const fruit of runtime.openingProps.userData.crateFruit)fruit.visible=true;
 runtime.syncForestCorridor(runtime.openingProps);const brook=runtime.openingProps.userData.brook;brook.position.y=Math.max(.04,runtime.terrainHeightAt(0,-5)+.025);brook.material=runtime.currentSeason==='winter'?runtime.iceWaterMaterial:runtime.openingProps.userData.waterMaterial;
}

function updateOpeningAdventure(dt){
 if(runtime.level!==1||!runtime.opening)return;
 const previous=runtime.opening.stage;runtime.opening.update({dt,distance:Math.hypot(runtime.boy.position.x,runtime.boy.position.z-24),friend:!!runtime.friend,mounted:runtime.mountedFriend,rescued:runtime.levelFamilyDone>0});
 if(runtime.opening.stage==='feed'&&runtime.food===0&&runtime.shots.length===0&&runtime.throwCooldown<=0&&runtime.opening.elapsed-(runtime.opening.lastRefill||0)>4){runtime.food=1;runtime.opening.refills++;runtime.opening.lastRefill=runtime.opening.elapsed;runtime.notice('🍎 В кармане нашлось ещё яблоко. Попробуй покормить кабанчика!');}
 if(Math.hypot(runtime.boy.position.x+2.9,runtime.boy.position.z-24.3)<1.7&&runtime.opening.crateApples>0){const taken=runtime.opening.collectCrate(runtime.food,runtime.foodCapacity());if(taken){runtime.food+=taken;runtime.effect('pickup');runtime.notice(`🍎 Взял из ящика ${taken} яблока.`);runtime.openingProps.userData.crateFruit.forEach((fruit,i)=>fruit.visible=i<runtime.opening.crateApples);runtime.hud()}else if(runtime.opening.elapsed-(runtime.opening.crateNotice||-10)>5){runtime.opening.crateNotice=runtime.opening.elapsed;runtime.notice('🍎 Карманы полны. В ящике можно пополнить еду после кормления.')}}
 const wasStarted=runtime.opening.passageStarted,wasOpen=runtime.opening.passageOpen,wasBroken=runtime.opening.passageBroken;
 const atExit=Math.hypot(runtime.boy.position.x,runtime.boy.position.z+33)<3,breakerReady=runtime.questsComplete()&&(atExit||!!runtime.openingProps?.userData.breaker)&&runtime.updateExitBreaker(runtime.openingProps,dt,-35);
 const progress=runtime.opening.updatePassage(dt,{near:runtime.questsComplete()&&(atExit||runtime.openingProps?.userData.breakerDone),friend:breakerReady});
 if(runtime.openingProps){const trunk=runtime.openingProps.userData.trunk,debris=runtime.openingProps.userData.debris;trunk.visible=!runtime.opening.passageBroken;trunk.position.x=0;trunk.position.z=5.8;trunk.rotation.z=runtime.opening.passageStarted&&!runtime.opening.passageBroken?Math.sin(runtime.opening.passageTime*28)*.025:0;debris.visible=runtime.opening.passageBroken;if(runtime.opening.passageBroken){const t=Math.min(1.3,runtime.opening.passageTime-1.1),k=Math.min(1,t/1.3);for(const chip of debris.children){const d=chip.userData;chip.position.set(d.side*(.8+(d.offset-.8)*k),d.height+Math.sin(k*Math.PI)*(d.large?.7:2),5.8+d.spread*k);chip.rotation.set(k*(d.side+.4),k*d.spread,k*d.side*.65+(d.large?Math.PI/2:0))}}}
 if(!wasBroken&&runtime.opening.passageBroken){runtime.effect('woodBreak');runtime.softEffectTone(95,.22,'triangle',.055);runtime.notice('🪵 Хрясь! Кабанчик разбил ствол — щепки разлетелись.')}
 if(!wasStarted&&runtime.opening.passageStarted){runtime.notice('🐗 Друг готовится разбить дерево!');guideRefresh();runtime.effect('jump')}
 if(!wasOpen&&runtime.opening.passageOpen){if(runtime.openingProps?.userData.breaker)runtime.openingProps.userData.breaker.exitBreaking=false;runtime.notice('💚 Друг открыл дорогу! Идите по тропе к озеру.');guideRefresh();}
 if(previous!==runtime.opening.stage)runtime.hud();
}

function guideRefresh(){runtime.$('openingGuide').dataset.stage=''}

function syncOpeningGuide(){
 const guide=runtime.$('openingGuide');if(!guide)return;
 guide.hidden=!(runtime.started&&runtime.level===1&&runtime.opening&&!runtime.paused&&!runtime.cinematicRunning&&!runtime.endShown&&!runtime.win)||['rescue','complete'].includes(runtime.opening?.stage);if(guide.hidden)return;
 const stage=runtime.opening.stage;
 if(guide.dataset.stage!==stage){
  guide.dataset.stage=stage;
  const copy={
   move:['1/4 · НАЙДИ МАМУ','Мама впереди',runtime.mobile?'Иди по дорожке с помощью джойстика.':'W/S или стрелки — идти. Мышь — поворот камеры.'],
   feed:['2/4 · ПОГОНЯ','Угости кабанчика!',runtime.mobile?'Нажми «Кормить». Еда уже есть в кармане.':'Enter или левая кнопка мыши — бросить яблоко.'],
   ride:['3/4 · НОВЫЙ ДРУГ','Теперь он на твоей стороне',runtime.mobile?'Подойди к другу и нажми «Прыжок», чтобы сесть.':'Подойди к другу. Пробел — сесть верхом.'],
   rescue:['4/4 · СПАСЕНИЕ','Поезжайте к маме!',runtime.mobile?'Езжай по меткам. «Прыжок» — подскок; 🐗 — спрыгнуть.':'Езжай к метке «МАМА». Пробел — подскок; Q — спрыгнуть.'],
   complete:['ПЕРВОЕ ПРИКЛЮЧЕНИЕ ПРОЙДЕНО','Мама спасена!',!runtime.friend?'Подойди к дереву — помощник прибежит и освободит проход.':runtime.opening.passageOpen?'Тропа свободна! Езжай прямо к озеру.':runtime.opening.passageStarted?'Друг разбивает дерево. Берегись щепок!':'Езжай с другом к поваленному дереву. Он поможет открыть тропу.']
  }[stage];runtime.$('openingStep').textContent=copy[0];runtime.$('openingTitle').textContent=copy[1];runtime.$('openingHint').textContent=copy[2];
 }
 const mother=runtime.familyMembers.find(f=>f.role===0&&!f.done),enemy=runtime.foes.find(f=>f.openingBoar),target=stage==='feed'?enemy?.g:stage==='ride'?runtime.friend?.g:stage==='complete'?runtime.openingProps?.userData.exit:mother?.g;
 if(runtime.openingProps&&target){const marker=runtime.openingProps.userData.marker;marker.visible=true;marker.position.copy(target.position);marker.position.y+=stage==='complete'?5:3.4;const label={feed:'КАБАНЧИК',ride:'ТВОЙ ДРУГ',complete:'К ОЗЕРУ'}[stage]||'МАМА';if(runtime.openingProps.userData.label!==label){marker.material.map?.dispose();marker.material.map=openingLabel(label);runtime.openingProps.userData.label=label}}
}
 return {
  bindings:{
"buildExitFence":{get:()=>buildExitFence},
"openingLabel":{get:()=>openingLabel},
"buildForestEdge":{get:()=>buildForestEdge},
"setupOpeningProps":{get:()=>setupOpeningProps},
"updateOpeningAdventure":{get:()=>updateOpeningAdventure},
"guideRefresh":{get:()=>guideRefresh},
"syncOpeningGuide":{get:()=>syncOpeningGuide}
  },
  initialize(){

runtime.$('watchIntro').onclick=()=>{runtime.$('intro').style.display='none';runtime.playCinematic('intro',()=>{runtime.campaignProgress.sawIntro();runtime.started=false;runtime.paused=false;runtime.$('intro').style.display='grid';try{document.exitPointerLock?.()}catch{}})};
  }
 };

}
