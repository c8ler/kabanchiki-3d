import * as THREE from "../../vendor/three/three.module.min.js";
import { riverCenterAt, lakeInletDepthAt, lakeRadiusAt } from "../world-surface.js?v=216";

// Owns 19 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let biomeObjects,mountainObstacles,lairObstacles,waterMat,lake,lakeVisual,shoreMat,shoreRing,waterRippleMatA,waterRippleMatB,rippleA,rippleB,lakeDeepMat,lakeDeepCenter,lakeAbyssMat,lakeAbyss;

function biomeMesh(obj,lv){obj.visible=false;obj.userData.biomeLevel=lv;biomeObjects.push(obj);return obj}

function horizontalBounds(obj){
  obj.updateWorldMatrix(true,true);
  const b=new THREE.Box3().setFromObject(obj),c=new THREE.Vector3();b.getCenter(c);
  return {x:c.x,z:c.z,r:Math.max((b.max.x-b.min.x)/2,(b.max.z-b.min.z)/2)};
}

function syncWorldGeneration(lv){
 for(const o of runtime.boundaryDecor)if(!o.userData.isTree)o.visible=true;
 for(const o of runtime.scene.children)if(o.isMesh&&o.material?.map===runtime.mats.leaf2.map&&o.scale.y<.07)o.visible=!(lv===2&&lakeRadiusAt(o.position.x,o.position.z)<14.2);
  const active=biomeObjects.filter(o=>o.userData.biomeLevel===lv&&o!==runtime.riverVisual&&o!==lake);
  const zones=active.map(horizontalBounds);
  if(lv===3)for(const h of runtime.houseObjects)zones.push(horizontalBounds(h));
  const baseTreeVisible=i=>(lv===1||(lv===2&&i%3!==0)||(lv===3&&i%6===0)||(lv===4&&i%2===0)||(lv===5&&i%4===0)||(lv===6&&i%7===0));
  runtime.treeObjects.forEach((t,i)=>{
    if(!baseTreeVisible(i)){t.visible=false;return}
    const x=t.position.x,z=t.position.z;
    t.visible=!(lv===2&&(lakeRadiusAt(x,z)<15.3||lakeInletDepthAt(x,z)>.001))&&!(lv===4&&Math.abs(z-riverCenterAt(x))<6.5)&&!zones.some(q=>Math.hypot(x-q.x,z-q.z)<q.r+1.35);
  });
  for(const rp of runtime.rockPositions){
    const [x,z,r,m]=rp;if(!m)continue;if(m.userData.biomeLevel){m.visible=m.userData.biomeLevel===lv;continue}
    m.visible=!(lv===2&&(lakeRadiusAt(x,z)<15.0||lakeInletDepthAt(x,z)>.001))&&!(lv===4&&Math.abs(z-riverCenterAt(x))<5.5)&&!zones.some(q=>Math.hypot(x-q.x,z-q.z)<q.r+r+.45);
  }
}
 return {
  bindings:{
"biomeObjects":{get:()=>biomeObjects},
"mountainObstacles":{get:()=>mountainObstacles},
"lairObstacles":{get:()=>lairObstacles},
"biomeMesh":{get:()=>biomeMesh},
"horizontalBounds":{get:()=>horizontalBounds},
"syncWorldGeneration":{get:()=>syncWorldGeneration},
"waterMat":{get:()=>waterMat},
"lake":{get:()=>lake},
"lakeVisual":{get:()=>lakeVisual},
"shoreMat":{get:()=>shoreMat},
"shoreRing":{get:()=>shoreRing},
"waterRippleMatA":{get:()=>waterRippleMatA},
"waterRippleMatB":{get:()=>waterRippleMatB},
"rippleA":{get:()=>rippleA},
"rippleB":{get:()=>rippleB},
"lakeDeepMat":{get:()=>lakeDeepMat},
"lakeDeepCenter":{get:()=>lakeDeepCenter},
"lakeAbyssMat":{get:()=>lakeAbyssMat},
"lakeAbyss":{get:()=>lakeAbyss}
  },
  initialize(){

/* init:const */ biomeObjects = [];
/* init:const */ mountainObstacles = [];
/* init:const */ lairObstacles = [];

// v35: каждая локация получает собственные заметные объекты, а не только другой цвет неба.
/* init:const */ waterMat = new THREE.MeshPhongMaterial({color:0x3f9dcc,map:runtime.pixelTexture(32,[67,157,204],[31,105,160],'noise'),transparent:true,opacity:.78,shininess:95,specular:0xccefff});

/* init:const */ lake = new THREE.Mesh(new THREE.CylinderGeometry(13,14,.18,48),waterMat);

lake.position.set(-18,.015,-17);

runtime.scene.add(lake);

biomeMesh(lake,2);

// v71: отдельный дешёвый визуальный слой озера — волны, берег, кувшинки и солнечный блик.
/* init:const */ lakeVisual = new THREE.Group();

runtime.scene.add(lakeVisual);

lakeVisual.visible=false;

/* init:const */ shoreMat = new THREE.MeshLambertMaterial({color:0xb9aa78,map:runtime.pixelTexture(32,[185,170,120],[133,122,84],'noise')});

/* init:const */ shoreRing = new THREE.Mesh(new THREE.RingGeometry(13.25,15.45,56),shoreMat);

shoreRing.rotation.x=-Math.PI/2;

shoreRing.position.set(-18,.035,-17);

lakeVisual.add(shoreRing);

/* init:const */ waterRippleMatA = new THREE.MeshPhongMaterial({color:0x7fd4ed,transparent:true,opacity:.20,shininess:120,specular:0xffffff,depthWrite:false});

/* init:const */ waterRippleMatB = new THREE.MeshPhongMaterial({color:0x2f86bd,transparent:true,opacity:.16,shininess:85,specular:0xd8f6ff,depthWrite:false});

/* init:const */ rippleA = new THREE.Mesh(new THREE.CircleGeometry(12.72,48),waterRippleMatA);

rippleA.rotation.x=-Math.PI/2;

rippleA.position.set(-18,.145,-17);

lakeVisual.add(rippleA);

/* init:const */ rippleB = new THREE.Mesh(new THREE.RingGeometry(5.5,12.35,48),waterRippleMatB);

rippleB.rotation.x=-Math.PI/2;

rippleB.position.set(-18,.16,-17);

lakeVisual.add(rippleB);

// v133: stronger depth gradient: the lake gets visibly darker and deeper toward the center.
/* init:const */ lakeDeepMat = new THREE.MeshBasicMaterial({color:0x155c91,transparent:true,opacity:.42,depthWrite:false});

/* init:const */ lakeDeepCenter = new THREE.Mesh(new THREE.CircleGeometry(7.4,48),lakeDeepMat);

lakeDeepCenter.rotation.x=-Math.PI/2;

lakeDeepCenter.position.set(-18,.126,-17);

lakeVisual.add(lakeDeepCenter);

lakeDeepCenter.userData.depthMeters=1.6;

/* init:const */ lakeAbyssMat = new THREE.MeshBasicMaterial({color:0x083b69,transparent:true,opacity:.48,depthWrite:false});

/* init:const */ lakeAbyss = new THREE.Mesh(new THREE.CircleGeometry(3.9,40),lakeAbyssMat);

lakeAbyss.rotation.x=-Math.PI/2;

lakeAbyss.position.set(-18,.124,-17);

lakeVisual.add(lakeAbyss);

lakeAbyss.userData.depthMeters=2.4;
  }
 };

}
