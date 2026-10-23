import * as THREE from "../../vendor/three/three.module.min.js";
import { GRAPHICS_TIERS } from "../adaptive-quality.js?v=215";

// Owns 24 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let flowerMats,fernMat,logObstacles,sunHalo,sunDisc,treePositions,treeObjects,treeSolidMeshes,treeBranchMeshes,trunkGeo,branchGeo,crownGeo,rockPositions,rockGeo,weatherClouds,ridgeMat,ridgeObjects,boundaryDecor;

function applyGraphicsQuality(tier){
 const preset=GRAPHICS_TIERS[tier],shadows=preset.shadows&&!runtime.mobile;
 runtime.renderer.setPixelRatio(Math.min(devicePixelRatio,preset.pixelRatio));runtime.renderer.setSize(innerWidth,innerHeight);
 runtime.renderer.shadowMap.enabled=shadows;runtime.sun.castShadow=shadows;
 if(runtime.sun.shadow.mapSize.x!==preset.shadowSize){
  runtime.sun.shadow.map?.dispose();runtime.sun.shadow.map=null;
  runtime.sun.shadow.mapPass?.dispose();runtime.sun.shadow.mapPass=null;
  runtime.sun.shadow.mapSize.set(preset.shadowSize,preset.shadowSize);
 }
 runtime.sun.shadow.needsUpdate=true;runtime.renderer.shadowMap.needsUpdate=true;
 runtime.grassBlades.count=0;runtime.meadowGrassFraction=preset.grass;runtime.meadowGrass.count=Math.floor(runtime.meadowActiveCount*runtime.meadowGrassFraction);
 runtime.graphicsParticleFactor=preset.particles;runtime.graphicsCloudFactor=preset.clouds;
 const label=runtime.$('graphicsQuality');if(label)label.textContent='Графика: Авто · '+preset.name;
 window.__KABANCHIKI_TEST__.graphics={auto:true,tier,name:preset.name,pixelRatio:runtime.renderer.getPixelRatio(),shadows,grass:runtime.meadowGrass.count,particles:runtime.graphicsParticleFactor};
}

function syncWorldShadowCasters(){if(runtime.mobile)return;runtime.scene.traverse(o=>{if(!o.isMesh)return;if(o===runtime.skyDome||o===sunDisc)return;const transparent=o.material?.transparent&&o.material?.opacity<.20;if(!transparent){o.castShadow=true;o.receiveShadow=true}});runtime.ground.castShadow=false;runtime.ground.receiveShadow=true;runtime.grassBlades.castShadow=false;runtime.meadowGrass.castShadow=false;runtime.sun.shadow.needsUpdate=true;runtime.renderer.shadowMap.needsUpdate=true}

function boundaryTree(x,z){const g=runtime.group(x,z),h=runtime.rand(3.0,5.5),tr=runtime.rand(.42,.68);runtime.block(g,runtime.mats.wood,0,h/2,0,tr,h,tr);const layers=Math.random()<.45?2:3;for(let j=0;j<layers;j++)runtime.block(g,j%2?runtime.mats.leaf:runtime.mats.leaf2,runtime.rand(-.16,.16),h+j*.56,runtime.rand(-.16,.16),runtime.rand(2.35,2.9)-j*.38,runtime.rand(.9,1.18),runtime.rand(2.2,2.75)-j*.34);g.rotation.y=runtime.rand(0,Math.PI*2);g.userData.isTree=true;g.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();o.material.transparent=true}});treeObjects.push(g);boundaryDecor.push(g)}

function boundaryRock(x,z){const m=new THREE.Mesh(rockGeo,runtime.mats.stone);m.position.set(x,runtime.rand(.45,.75),z);m.scale.set(runtime.rand(1.25,2.05),runtime.rand(.75,1.45),runtime.rand(1.2,2.0));m.rotation.set(runtime.rand(-.2,.2),runtime.rand(0,6.28),runtime.rand(-.18,.18));runtime.scene.add(m);boundaryDecor.push(m)}

function boundaryMountain(x,z){const h=runtime.rand(4.2,7.3),r=new THREE.Mesh(new THREE.ConeGeometry(runtime.rand(2.25,2.9),h,5),ridgeMat.clone());const sy=runtime.rand(.88,1.28);r.position.set(x,h*sy/2-.42,z);r.scale.set(runtime.rand(.85,1.28),sy,runtime.rand(.85,1.28));r.rotation.y=runtime.rand(0,6.28);r.userData.isRidge=true;runtime.scene.add(r);ridgeObjects.push(r);boundaryDecor.push(r)}

function buildBoundarySide(side){/* v35: две смещённые плотные линии декора без больших визуальных дыр */for(let row=0;row<2;row++){let kind=Math.floor(runtime.rand(0,3)),run=0;const step=row?1.55:1.72,base=46.4+row*1.55;for(let along=-48;along<=48;along+=step){if(run<=0){const old=kind;kind=Math.floor(runtime.rand(0,3));if(kind===old&&Math.random()<.6)kind=(kind+1+Math.floor(runtime.rand(0,2)))%3;run=kind===0?Math.floor(runtime.rand(2,5)):Math.floor(runtime.rand(1,4))}run--;const edge=base+runtime.rand(-.22,.22),a=along+(row?step*.48:0)+runtime.rand(-.25,.25);let x,z;if(side===0){x=a;z=-edge}else if(side===1){x=a;z=edge}else if(side===2){x=-edge;z=a}else{x=edge;z=a}if(kind===0)boundaryTree(x,z);else if(kind===1)boundaryRock(x,z);else boundaryMountain(x,z)}}}
 return {
  bindings:{
"applyGraphicsQuality":{get:()=>applyGraphicsQuality},
"flowerMats":{get:()=>flowerMats},
"fernMat":{get:()=>fernMat},
"logObstacles":{get:()=>logObstacles},
"sunHalo":{get:()=>sunHalo},
"sunDisc":{get:()=>sunDisc},
"treePositions":{get:()=>treePositions},
"treeObjects":{get:()=>treeObjects},
"treeSolidMeshes":{get:()=>treeSolidMeshes},
"treeBranchMeshes":{get:()=>treeBranchMeshes},
"syncWorldShadowCasters":{get:()=>syncWorldShadowCasters},
"trunkGeo":{get:()=>trunkGeo},
"branchGeo":{get:()=>branchGeo},
"crownGeo":{get:()=>crownGeo},
"rockPositions":{get:()=>rockPositions},
"rockGeo":{get:()=>rockGeo},
"weatherClouds":{get:()=>weatherClouds},
"ridgeMat":{get:()=>ridgeMat},
"ridgeObjects":{get:()=>ridgeObjects},
"boundaryDecor":{get:()=>boundaryDecor},
"boundaryTree":{get:()=>boundaryTree},
"boundaryRock":{get:()=>boundaryRock},
"boundaryMountain":{get:()=>boundaryMountain},
"buildBoundarySide":{get:()=>buildBoundarySide}
  },
  initialize(){

applyGraphicsQuality(runtime.adaptiveGraphics.tier);

document.addEventListener('visibilitychange',()=>{runtime.adaptiveGraphics.resetSample();runtime.last=performance.now()});

if(runtime.__autoTest)window.__KABANCHIKI_ADAPTIVE__={controller:runtime.adaptiveGraphics,apply:applyGraphicsQuality,tiers:GRAPHICS_TIERS};

/* init:const */ flowerMats = [0xffe26b,0xf7f0ff,0x89c9ff,0xff9ab2].map(c=>new THREE.MeshBasicMaterial({color:c}));

for(let i=0;i<(runtime.mobile?24:46);i++){let x=runtime.rand(-40,40),z=runtime.rand(-40,40);if(Math.abs(x)<3.5)continue;const g=new THREE.Group();g.position.set(x,0,z);
 runtime.block(g,runtime.grassBladeMat,0,.18,0,.05,.36,.05);runtime.sphere(g,flowerMats[i%flowerMats.length],0,.43,0,.11);g.userData.seasonPlant=true;runtime.forestVisual.add(g)}

/* init:const */ fernMat = new THREE.MeshLambertMaterial({color:0x397b3d});

for(let i=0;i<(runtime.mobile?22:44);i++){const g=new THREE.Group();g.position.set(runtime.rand(-40,40),.02,runtime.rand(-40,40));if(Math.abs(g.position.x)<runtime.roadHalfWidthAt(g.position.z)+.9)continue;for(let j=0;j<4;j++){const b=runtime.block(g,fernMat,0,.18,0,.08,.35,.55);b.rotation.y=j*Math.PI/2;b.rotation.z=.55}g.userData.seasonPlant=true;runtime.forestVisual.add(g)}

/* init:const */ logObstacles = [];

for(let i=0;i<9;i++){const g=new THREE.Group();g.position.set(runtime.rand(-38,38),.13,runtime.rand(-38,34));const len=runtime.rand(1.35,2.25),r=runtime.rand(.11,.16),yaw=runtime.rand(0,6.28),log=new THREE.Mesh(new THREE.CylinderGeometry(r*.78,r,1,7),runtime.mats.wood);log.scale.y=len;log.rotation.z=Math.PI/2;log.rotation.y=-yaw;log.userData.naturalLog=true;log.castShadow=!runtime.mobile;log.receiveShadow=!runtime.mobile;g.add(log);runtime.forestVisual.add(g);logObstacles.push({g,mesh:log,x:g.position.x,z:g.position.z,len,r,yaw,top:g.position.y+r})}

/* init:const */ sunHalo = runtime.visualOnly(()=>new THREE.Sprite(new THREE.SpriteMaterial({map:runtime.softGlowTexture,color:0xffb653,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false})));

sunHalo.position.set(-28,24,-42);

sunHalo.scale.set(19,19,1);

runtime.scene.add(sunHalo);

/* init:const */ sunDisc = new THREE.Mesh(new THREE.SphereGeometry(2.3,16,12),new THREE.MeshBasicMaterial({color:0xfff2b0}));

sunDisc.position.copy(runtime.sun.position);

sunDisc.renderOrder=2;

runtime.scene.add(sunDisc);

/* init:const */ treePositions = [];
/* init:const */ treeObjects = [];
/* init:const */ treeSolidMeshes = [];
/* init:const */ treeBranchMeshes = [];


// v104: slimmer branches match the trunk/crown scale and also provide exact apple anchor geometry.
/* init:const */ trunkGeo = new THREE.CylinderGeometry(.46,.68,1,7);
/* init:const */ branchGeo = new THREE.CylinderGeometry(.09,.14,1,6);
/* init:const */ crownGeo = new THREE.BoxGeometry(1.65,1.55,1.65);

for(let i=0;i<160;i++){
 let x=runtime.rand(-45,45),z=runtime.rand(-45,45);if(Math.abs(x)<4||Math.hypot(x,z)<8)continue;
 const g=runtime.group(x,z),h=runtime.rand(2.4,5.7),tr=runtime.rand(.72,1.08);
 const trunk=new THREE.Mesh(trunkGeo,runtime.mats.wood);trunk.position.y=h/2;trunk.scale.set(tr,h,tr);trunk.castShadow=!runtime.mobile;trunk.receiveShadow=!runtime.mobile;g.add(trunk);
 for(let r=0;r<3;r++){const root=runtime.block(g,runtime.mats.wood,Math.cos(r*2.094)*.38,.18,Math.sin(r*2.094)*.38,.22,.22,runtime.rand(.65,1.0));root.rotation.y=-r*2.094;root.rotation.z=.15}
 g.children.filter(o=>o.isMesh&&o.geometry===trunkGeo).forEach(o=>{o.userData.treeSolid=true;treeSolidMeshes.push(o)});const branchN=Math.floor(runtime.rand(2,5));for(let b=0;b<branchN;b++){const br=new THREE.Mesh(branchGeo,runtime.mats.wood);br.userData.appleBranch=true;treeBranchMeshes.push(br);const a=runtime.rand(0,6.28),len=runtime.rand(.68,1.08);br.position.set(Math.cos(a)*.30,h*.66+runtime.rand(-.10,.24),Math.sin(a)*.30);br.scale.set(tr*.38,len,tr*.38);br.rotation.z=runtime.rand(.78,1.08);br.rotation.y=a;br.castShadow=!runtime.mobile;br.receiveShadow=!runtime.mobile;g.add(br)}
 const crownN=Math.floor(runtime.rand(5,9));for(let c=0;c<crownN;c++){const cm=new THREE.Mesh(crownGeo,c%3?runtime.mats.leaf:runtime.mats.leaf2);const a=runtime.rand(0,6.28),rr=c===0?0:runtime.rand(.35,1.25);cm.position.set(Math.cos(a)*rr,h+runtime.rand(-.05,1.45),Math.sin(a)*rr);const sc=runtime.rand(.85,1.5);cm.scale.set(sc*1.15,sc,sc*1.15);cm.userData.springCrown=true;cm.userData.fullCrownScale=cm.scale.clone();g.add(cm)}
 g.rotation.y=runtime.rand(0,Math.PI*2);g.userData.isTree=true;
 g.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();o.material.transparent=true}});
 if(!runtime.mobile&&treeObjects.length<58)g.traverse(o=>{if(o.isMesh)o.castShadow=true});
 treePositions.push([x,z]);treeObjects.push(g)
}

/* init:const */ rockPositions = [];

/* init:const */ rockGeo = new THREE.DodecahedronGeometry(1,0);

for(let i=0;i<50;i++){let x=runtime.rand(-43,43),z=runtime.rand(-43,43);const sx=runtime.rand(.35,1.15),sz=runtime.rand(.4,1.25),roadR=Math.max(sx,sz)*.92;if(!runtime.roadClearForRadius(x,z,roadR,.24)||Math.hypot(x,z-4)<7||treePositions.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<2.2))continue;const m=new THREE.Mesh(rockGeo,runtime.mats.stone);m.position.set(x,runtime.rand(.18,.45),z);m.scale.set(sx,runtime.rand(.3,.8),sz);m.rotation.set(runtime.rand(-.3,.3),runtime.rand(0,6.28),runtime.rand(-.2,.2));runtime.scene.add(m);rockPositions.push([x,z,Math.max(.55,Math.min(1.15,Math.max(sx,sz)*.8)),m])}

// Мягкие облака высоко в небе: заметны, но не мешают игре.
/* init:const */ weatherClouds = [];

for(let i=0;i<(runtime.mobile?14:22);i++){const cm=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.68}),cg=new THREE.Group();cg.position.set(runtime.rand(-52,52),runtime.rand(16,23),runtime.rand(-52,26));cg.userData.cloudMat=cm;cg.userData.drift=runtime.rand(.75,1.28);for(let j=0;j<4;j++){const c=new THREE.Mesh(new THREE.SphereGeometry(runtime.rand(1.5,2.7),8,6),cm);c.position.set(j*1.6+runtime.rand(-.5,.5),runtime.rand(-.25,.35),runtime.rand(-.5,.5));c.scale.y=.55;cg.add(c)}runtime.scene.add(cg);weatherClouds.push(cg)}

// Естественная плотная граница мира: не ровный забор из гор, а случайные "куски" леса, валунов и скал.
// Объекты идут короткими сериями (например 2–4 дерева, затем несколько камней, затем гора),
// стоят достаточно близко, чтобы визуально было ясно: дальше дороги нет. Физический предел карты остаётся отдельным.
/* init:const */ ridgeMat = new THREE.MeshLambertMaterial({color:0x6f7778,map:runtime.pixelTexture(30,[111,119,120],[67,73,75],'stone'),transparent:true,opacity:1});

/* init:const */ ridgeObjects = [];
/* init:const */ boundaryDecor = [];

for(let side=0;side<4;side++)buildBoundarySide(side);
  }
 };

}
