import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 16 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let cinematicRunning,cinematicTimers,cinematicFinish,movie,movieRoot,cinematicAssets,cachedCinemaCar,cachedCinemaPeople;

function cineClear(){movie?.treeGuard?.restore();for(const t of cinematicTimers)clearTimeout(t);cinematicTimers=[];if(movie){if(movie.saved.doorMaterial){runtime.familyDoorSlab.material.dispose();runtime.familyDoorSlab.material=movie.saved.doorMaterial}for(const [o,visible] of movie.saved.visibility)o.visible=visible;runtime.scene.background.copy(movie.saved.sky);runtime.scene.fog.color.copy(movie.saved.fog);runtime.sun.intensity=movie.saved.sun;runtime.hemi.intensity=movie.saved.hemi;runtime.camera.fov=movie.saved.fov;runtime.camera.updateProjectionMatrix();for(const g of movie.privateGeometries||[])g.dispose();for(const m of movie.privateMaterials||[])m.dispose();movie=null}if(cachedCinemaCar?.parent===movieRoot)cinematicAssets.add(cachedCinemaCar);movieRoot.clear();}

function cineLater(fn,ms){cinematicTimers.push(setTimeout(fn,ms))}

function buildCinemaPerson(role){runtime.makeFamily(0,0,role);const p=runtime.familyMembers.pop();runtime.scene.remove(p.g);p.g.traverse(o=>{if(o.userData.familyMarker)o.visible=false});movieRoot.add(p.g);return p.g}

function buildCinemaCar(){const g=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color:0x315c55,roughness:.4,metalness:.35}),trim=new THREE.MeshStandardMaterial({color:0xd5d7ce,roughness:.28,metalness:.8}),glass=new THREE.MeshPhongMaterial({color:0x80b4c8,transparent:true,opacity:.7,shininess:110}),rubber=new THREE.MeshLambertMaterial({color:0x202329});runtime.block(g,paint,0,.74,0,2.3,.68,4.35);runtime.block(g,paint,0,1.36,-.25,2.02,.72,2.2);runtime.block(g,trim,0,1.79,-.25,2.05,.09,2.25);runtime.block(g,glass,0,1.4,.87,1.8,.52,.035);runtime.block(g,glass,0,1.4,-1.36,1.8,.52,.035);runtime.block(g,paint,0,1.05,1.47,2.15,.13,1.25);for(const x of [-1.03,1.03]){runtime.block(g,glass,x,1.4,-.24,.03,.5,1.87);runtime.block(g,trim,x,1.05,-.05,.05,.035,3.4);runtime.block(g,trim,x,1.14,.6,.07,.05,.27);runtime.block(g,paint,x*1.16,1.39,.7,.26,.18,.22);for(const z of [-1.35,1.35]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.28,16),rubber);wheel.rotation.z=Math.PI/2;wheel.position.set(x*1.07,.43,z);g.add(wheel);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.3,10),trim);hub.rotation.z=Math.PI/2;hub.position.copy(wheel.position);g.add(hub)}}for(const z of [-2.21,2.21])runtime.block(g,trim,0,.53,z,2.3,.16,.1);runtime.block(g,runtime.mats.black,0,.83,2.2,1.08,.32,.04);for(let i=-2;i<=2;i++)runtime.block(g,trim,i*.19,.83,2.23,.035,.28,.04);const beams=[],lenses=[];for(const x of [-.8,.8]){lenses.push(runtime.block(g,runtime.flashlightLensMat.clone(),x,.88,2.2,.46,.28,.05));const light=new THREE.SpotLight(0xffefcb,32,28,.32,.6,1.1);light.position.set(x,.88,2.24);light.target.position.set(x,.1,16);g.add(light,light.target);beams.push(light);runtime.block(g,new THREE.MeshBasicMaterial({color:0xd85138}),x,.86,-2.2,.35,.19,.05)}g.userData.headlights=beams;g.userData.headlightLenses=lenses;movieRoot.add(g);return g}

function prepareCinematicAssets(){runtime.visualOnly(()=>{cachedCinemaCar=buildCinemaCar();cinematicAssets.add(cachedCinemaCar);for(let role=0;role<4;role++){const person=buildCinemaPerson(role);cinematicAssets.add(person);cachedCinemaPeople.push(person)}})}

function cinemaCar(){const car=cachedCinemaCar;movieRoot.add(car);for(const light of car.userData.headlights)light.intensity=32;for(const lens of car.userData.headlightLenses){lens.material.color.set(0xffefcb);if(lens.material.emissive)lens.material.emissiveIntensity=1}return car}

function cinemaPerson(role){const person=cachedCinemaPeople[role].clone(true);movieRoot.add(person);return person}

function cinemaHug(person,amount){const model=person.children.find(c=>c.isGroup)||person;const arms=model.children.filter(o=>o.isMesh&&Math.abs(o.position.x)>.49&&Math.abs(o.position.x)<.62&&o.position.y>1&&o.position.y<1.5);for(const arm of arms){arm.rotation.x=-1.2*amount;arm.rotation.z=(arm.position.x<0?-.5:.5)*amount;arm.position.z=.22*amount}if(movie.heroForm==='human')for(const i of [5,6]){movie.hero.children[i].rotation.x=-1.25*amount;movie.hero.children[i].rotation.z=(i===5?-.35:.35)*amount}}
 return {
  bindings:{
"cinematicRunning":{get:()=>cinematicRunning,set:value=>{cinematicRunning=value}},
"cinematicTimers":{get:()=>cinematicTimers,set:value=>{cinematicTimers=value}},
"cinematicFinish":{get:()=>cinematicFinish,set:value=>{cinematicFinish=value}},
"movie":{get:()=>movie,set:value=>{movie=value}},
"movieRoot":{get:()=>movieRoot},
"cineClear":{get:()=>cineClear},
"cineLater":{get:()=>cineLater},
"buildCinemaPerson":{get:()=>buildCinemaPerson},
"buildCinemaCar":{get:()=>buildCinemaCar},
"cinematicAssets":{get:()=>cinematicAssets},
"cachedCinemaCar":{get:()=>cachedCinemaCar,set:value=>{cachedCinemaCar=value}},
"cachedCinemaPeople":{get:()=>cachedCinemaPeople,set:value=>{cachedCinemaPeople=value}},
"prepareCinematicAssets":{get:()=>prepareCinematicAssets},
"cinemaCar":{get:()=>cinemaCar},
"cinemaPerson":{get:()=>cinemaPerson},
"cinemaHug":{get:()=>cinemaHug}
  },
  initialize(){

/* init:let */ cinematicRunning = false;
/* init:let */ cinematicTimers = [];
/* init:let */ cinematicFinish = null;
/* init:let */ movie = null;

/* init:const */ movieRoot = new THREE.Group();

runtime.scene.add(movieRoot);

window.addEventListener('keydown',e=>{if(cinematicRunning&&['Escape','Space','Enter'].includes(e.code)){e.preventDefault();cinematicFinish?.()}});

/* init:const */ cinematicAssets = new THREE.Group();

cinematicAssets.visible=false;

runtime.scene.add(cinematicAssets);

/* init:let */ cachedCinemaCar = null;
/* init:let */ cachedCinemaPeople = [];
  }
 };

}
