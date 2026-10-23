import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 13 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let glintMat,lakeGlint,reedMat,reedTipMat,lilyMat,lilyFlowerMat,burntWood,charTop,moonMat,moon,moonDisc,moonHalo,moonLight;

 return {
  bindings:{
"glintMat":{get:()=>glintMat},
"lakeGlint":{get:()=>lakeGlint},
"reedMat":{get:()=>reedMat},
"reedTipMat":{get:()=>reedTipMat},
"lilyMat":{get:()=>lilyMat},
"lilyFlowerMat":{get:()=>lilyFlowerMat},
"burntWood":{get:()=>burntWood},
"charTop":{get:()=>charTop},
"moonMat":{get:()=>moonMat},
"moon":{get:()=>moon},
"moonDisc":{get:()=>moonDisc},
"moonHalo":{get:()=>moonHalo},
"moonLight":{get:()=>moonLight}
  },
  initialize(){

/* init:const */ glintMat = new THREE.MeshBasicMaterial({color:0xfff2bd,transparent:true,opacity:.22,depthWrite:false});

/* init:const */ lakeGlint = new THREE.Mesh(new THREE.CircleGeometry(2.25,24),glintMat);

lakeGlint.rotation.x=-Math.PI/2;

lakeGlint.scale.set(2.5,.58,1);

lakeGlint.position.set(-22.5,.19,-22.5);

runtime.lakeVisual.add(lakeGlint);

lakeGlint.visible=false;

/* init:const */ reedMat = new THREE.MeshLambertMaterial({color:0x5d8f38});
/* init:const */ reedTipMat = new THREE.MeshLambertMaterial({color:0x795b31});

for(let i=0;i<(runtime.mobile?34:58);i++){const a=runtime.rand(0,Math.PI*2),r=runtime.rand(13.0,15.15),g=runtime.group(-18+Math.cos(a)*r,-17+Math.sin(a)*r);const stems=runtime.mobile?2:3;for(let j=0;j<stems;j++){const xx=runtime.rand(-.25,.25),zz=runtime.rand(-.25,.25),h=runtime.rand(.9,1.75);runtime.block(g,reedMat,xx,h*.5,zz,.065,h,.065);if(j===0&&i%3===0)runtime.block(g,reedTipMat,xx,h+.10,zz,.11,.24,.11)}runtime.biomeMesh(g,2)}

// Кувшинки — только визуальные, поэтому не меняют коллизии и механику карты.
/* init:const */ lilyMat = new THREE.MeshLambertMaterial({color:0x4f9b55});
/* init:const */ lilyFlowerMat = new THREE.MeshBasicMaterial({color:0xffd9e9});

for(let i=0;i<(runtime.mobile?12:22);i++){const a=runtime.rand(0,Math.PI*2),r=runtime.rand(2.5,11.3),g=new THREE.Group();g.position.set(-18+Math.cos(a)*r,.19,-17+Math.sin(a)*r);const pad=new THREE.Mesh(new THREE.CircleGeometry(runtime.rand(.28,.55),12),lilyMat);pad.rotation.x=-Math.PI/2;g.add(pad);if(i%5===0)runtime.sphere(g,lilyFlowerMat,.08,.08,.02,.10);g.userData.lily=true;runtime.lakeVisual.add(g)}

// небольшие светлые камни у озера
for(let i=0,tries=0;i<20&&tries<160;tries++){const a=runtime.rand(0,Math.PI*2),r=runtime.rand(14.3,16.2),m=new THREE.Mesh(runtime.rockGeo,runtime.mats.stone);m.position.set(-18+Math.cos(a)*r,runtime.rand(.16,.32),-17+Math.sin(a)*r);m.scale.set(runtime.rand(.28,.72),runtime.rand(.24,.52),runtime.rand(.35,.82));if(!runtime.roadClearForRadius(m.position.x,m.position.z,Math.max(m.scale.x,m.scale.z),.12))continue;runtime.scene.add(m);runtime.biomeMesh(m,2);runtime.rockPositions.push([m.position.x,m.position.z,Math.max(m.scale.x,m.scale.z)*.8,m]);i++}

// горная локация: крупные отдельные валуны и скальные группы
for(let i=0;i<24;i++){const sx=runtime.rand(1.3,3.1),sy=runtime.rand(1.1,3.7),sz=runtime.rand(1.3,3.0),rr=Math.max(sx,sz)*.88,[x,z]=runtime.safeSolidScenerySpot(rr,41),g=runtime.group(x,z);const r=new THREE.Mesh(runtime.rockGeo,new THREE.MeshLambertMaterial({color:0x777c80,map:runtime.mats.stone.map}));r.scale.set(sx,sy,sz);r.position.y=r.scale.y*.45;g.add(r);runtime.mountainObstacles.push([g.position.x,g.position.z,rr,r]);runtime.biomeMesh(g,5)}

for(let i=0;i<8;i++){const h=runtime.rand(3,6),pr=runtime.rand(1.3,2.2),rr=pr*.9,[x,z]=runtime.safeSolidScenerySpot(rr,39),g=runtime.group(x,z);const peak=new THREE.Mesh(new THREE.ConeGeometry(pr,h,5),runtime.ridgeMat.clone());peak.position.y=h/2-.45;g.add(peak);runtime.mountainObstacles.push([g.position.x,g.position.z,rr,peak]);runtime.biomeMesh(g,5)}

// логово: узнаваемые обгоревшие пни и тёмные валуны; все имеют физическую коллизию
/* init:const */ burntWood = new THREE.MeshLambertMaterial({color:0x3a261f,map:runtime.mats.wood.map});
/* init:const */ charTop = new THREE.MeshLambertMaterial({color:0x171315});

for(let i=0;i<18;i++){
 let rr,shape;
 if(i%2){const w=runtime.rand(.75,1.15),h=runtime.rand(.75,1.55);rr=w*.78;shape={kind:'stump',w,h}}
 else{const r=new THREE.Mesh(runtime.rockGeo,new THREE.MeshLambertMaterial({color:0x4a4650,map:runtime.mats.stone.map}));r.scale.set(runtime.rand(.8,1.8),runtime.rand(.6,1.5),runtime.rand(.8,1.8));rr=Math.max(r.scale.x,r.scale.z)*.72;shape={kind:'rock',r}}
 const [x,z]=runtime.safeSolidScenerySpot(rr,40),g=runtime.group(x,z);
 if(shape.kind==='stump'){const {w,h}=shape;runtime.block(g,burntWood,0,h/2,0,w,h,w);runtime.block(g,charTop,0,h+.035,0,w*.92,.07,w*.92);runtime.block(g,burntWood,-w*.58,.18,.05,w*.55,.20,.28);runtime.block(g,burntWood,w*.52,.16,-.08,w*.48,.18,.26)}
 else{shape.r.position.y=shape.r.scale.y*.42;g.add(shape.r)}
 runtime.lairObstacles.push([g.position.x,g.position.z,rr,g]);runtime.biomeMesh(g,6)
}

/* init:const */ moonMat = new THREE.MeshBasicMaterial({color:0xf1f6ff});

/* init:const */ moon = new THREE.Group();

/* init:const */ moonDisc = new THREE.Mesh(new THREE.SphereGeometry(4.2,20,16),moonMat);

moon.add(moonDisc);

/* init:const */ moonHalo = new THREE.Mesh(new THREE.RingGeometry(4.5,6.4,32),new THREE.MeshBasicMaterial({color:0xa9c9ff,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));

moonHalo.position.z=-.15;

moon.add(moonHalo);

moon.position.set(-20,23,-31);

runtime.scene.add(moon);

moon.visible=false;

/* init:const */ moonLight = new THREE.DirectionalLight(0x9bc2ff,.0);

moonLight.position.set(-20,24,-25);

runtime.scene.add(moonLight);
  }
 };

}
