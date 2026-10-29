import {cinematicShot} from "../cinematic-support.js?v=220";
import { reunionProfile } from "../family-reunion.js?v=220";
import { CinematicTreeGuard } from "../cinematic-tree-guard.js?v=220";
import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 4 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function cineSetup(kind,detail={}){runtime.sceneryBatches?.dispose();runtime.sceneryBatches=null;runtime.sceneryEpoch=-1;
 runtime.$('cinematicScene').innerHTML='';runtime.$('cinematicScene').style.background='none';
 const existingGeometries=new Set(),existingMaterials=new Set(),capture=o=>{if(o.geometry)existingGeometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])existingMaterials.add(m)};runtime.scene.traverse(capture);detail.member?.g?.traverse(capture);
 const visibility=[runtime.boy,runtime.catLife.root,runtime.catFormModel?.g,runtime.friend?.g,...runtime.foes.map(f=>f.g),...runtime.familyMembers.map(f=>f.g),...runtime.apples.map(a=>a.g)].filter(Boolean).map(o=>[o,o.visible]);const saved={visibility,sky:runtime.scene.background.clone(),fog:runtime.scene.fog.color.clone(),sun:runtime.sun.intensity,hemi:runtime.hemi.intensity,fov:runtime.camera.fov};for(const [o] of visibility)o.visible=false;
 if(kind==='family'&&detail.role===2){saved.doorMaterial=runtime.familyDoorSlab.material;runtime.familyDoorSlab.material=runtime.familyDoorSlab.material.clone();runtime.familyDoorSlab.material.transparent=true;runtime.familyDoorSlab.material.opacity=.12;runtime.familyDoorSlab.material.depthWrite=false}
 runtime.movie={kind,detail,saved,start:performance.now(),elapsed:0,people:[],boars:[],car:null};if(kind==='family'){runtime.hemi.intensity=Math.max(1.3,runtime.hemi.intensity);runtime.sun.intensity=Math.max(1.2,runtime.sun.intensity);}runtime.camera.fov=kind==='family'?48:55;runtime.camera.updateProjectionMatrix();
 const heroForm=!['intro','outro'].includes(kind)?(detail.form||(runtime.catFormTime>0?'cat':runtime.boarFormTime>0?'boar':'human')):'human';runtime.movie.heroForm=heroForm;runtime.movie.reunion=reunionProfile(heroForm,detail.role);
 let hero;if(heroForm==='cat'){hero=runtime.catLife.model(2,runtime.movieRoot).g;hero.scale.setScalar(1.35)}else if(heroForm==='boar'){const actor=runtime.makeBoar(0,0,true);hero=actor.g;runtime.scene.remove(hero);actor.aura.visible=false;actor.bolt.visible=false;for(const o of hero.children)if(o.isMesh&&o.geometry.type==='RingGeometry')o.visible=false;hero.scale.setScalar(.86)}else hero=runtime.boy.clone(true);hero.visible=true;if(heroForm==='human')hero.children.forEach(o=>{o.rotation.x=0;o.rotation.z=0});hero.traverse(o=>{if(o.isMesh&&o.userData._cameraFade)o.userData._cameraFade=false});const lamp=heroForm==='human'?hero.children.find(o=>o.type==='Group'):null;if(lamp)lamp.visible=false;
 if(runtime.hasFlashlight&&heroForm==='human'){const held=new THREE.Group();runtime.block(held,runtime.mats.black,.6,1.0,.5,.22,.22,.55);runtime.block(held,runtime.flashlightLensMat,.6,1.0,.79,.19,.19,.04);hero.add(held);runtime.movie.lamp=held;const light=new THREE.SpotLight(0xfff0cd,38,28,.48,.58,1.1),target=new THREE.Object3D();runtime.movieRoot.add(light,target);light.target=target;runtime.movie.lampLight=light}
runtime.movieRoot.add(hero);runtime.movie.hero=hero;
 if(kind==='death'){runtime.movieRoot.position.set(runtime.boy.position.x,detail.cause==='water'?.05:runtime.terrainHeightAt(runtime.boy.position.x,runtime.boy.position.z)+runtime.playerSupportHeightAt(runtime.boy.position.x,runtime.boy.position.z),runtime.boy.position.z);hero.position.set(0,0,0);hero.rotation.y=runtime.boy.rotation.y;runtime.movie.deathCause=detail.cause;if(detail.cause==='bomb'){const flash=new THREE.Mesh(new THREE.SphereGeometry(1,10,6),new THREE.MeshBasicMaterial({color:0xffbd70,transparent:true,opacity:.65,depthWrite:false}));flash.position.set(0,.7,0);runtime.movieRoot.add(flash);runtime.movie.deathFlash=flash}if(detail.cause==='boar'){const b=runtime.lastDeathBoar?.g.clone(true)||runtime.makeBoar(0,0,false).g;runtime.scene.remove(b);b.position.set(-2,0,0);b.rotation.y=Math.PI/2;b.visible=true;runtime.movieRoot.add(b);runtime.movie.deathBoar=b}if(detail.cause==='water'){const ring=new THREE.Mesh(new THREE.RingGeometry(.5,.65,24),new THREE.MeshBasicMaterial({color:0xc3e3ef,transparent:true,opacity:.65,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;runtime.movieRoot.add(ring);runtime.movie.deathRing=ring}
 }else if(kind==='storm'){runtime.movieRoot.position.set(runtime.tornadoState.x,runtime.terrainHeightAt(runtime.tornadoState.x,runtime.tornadoState.z),runtime.tornadoState.z);hero.position.set(0,0,0);hero.rotation.y=runtime.boy.rotation.y;runtime.movie.stormHeading=runtime.boy.rotation.y;runtime.movie.people=[];
 }else if(kind==='family'){
  const cx=0,cz=Math.max(-25,Math.min(25,runtime.boy.position.z));runtime.movieRoot.position.set(cx,runtime.terrainHeightAt(cx,cz),cz);hero.position.set(-.7,0,0);hero.rotation.y=Math.PI/2;const person=runtime.buildCinemaPerson(detail.role||0);person.traverse(o=>{if(o.userData.familyMarker)o.visible=false});person.visible=true;runtime.movieRoot.add(person);person.position.set(.85,0,0);person.rotation.y=-Math.PI/2;runtime.movie.people=[person];const gift=new THREE.Group();runtime.makeFoodModel('apple',gift,0,0,0);runtime.movieRoot.add(gift);runtime.movie.gift=gift;gift.visible=false;
 }else{
  runtime.movieRoot.position.set(0,0,0);hero.position.set(0,0,3);hero.rotation.y=0;
  for(let i=0;i<4;i++){const person=runtime.cinemaPerson(i);person.position.set([-2.6,2.7,-1.3,1.2][i],0,[7,7,5.3,6][i]);person.rotation.y=Math.PI;runtime.movie.people.push(person)}
  runtime.movie.car=runtime.cinemaCar();runtime.movie.car.position.set(0,0,kind==='intro'?24:10);runtime.movie.car.rotation.y=Math.PI;
  for(let i=0;i<(kind==='intro'?3:1);i++){const b=runtime.makeBoar(0,0,kind==='outro');runtime.scene.remove(b.g);b.aura.visible=false;b.bolt.visible=false;runtime.movieRoot.add(b.g);b.g.position.set((i-1)*2,0,-12-i*2);runtime.movie.boars.push(b)}
  if(kind==='outro'){const fleeing=runtime.makeBoar(0,0,false);runtime.scene.remove(fleeing.g);fleeing.aura.visible=fleeing.bolt.visible=false;fleeing.g.scale.setScalar(2.3);runtime.movieRoot.add(fleeing.g);runtime.movie.fleeingBoss=fleeing;}
  if(kind==='intro'){const picnic=new THREE.Group();runtime.block(picnic,new THREE.MeshLambertMaterial({color:0xd28366}),0,.07,0,3,.07,2);picnic.position.set(-11.2,0,8);runtime.movieRoot.add(picnic);runtime.movie.picnic=picnic;picnic.visible=false;hero.visible=false;runtime.movie.people.forEach(p=>p.visible=false);runtime.movie.boars.forEach(b=>b.g.visible=false);runtime.makeFoodModel('apple',picnic,.3,.35,0);runtime.makeFoodModel('cabbage',picnic,-.5,.2,.2)}
 }
 runtime.movie.treeGuard=new CinematicTreeGuard(THREE,[...new Set([...runtime.treeObjects,...[runtime.openingProps?.userData.edge,runtime.openingProps?.userData.forestCorridor,runtime.lakeExitProps?.userData.forestCorridor,...[...runtime.locationExitProps.values()].map(p=>p.userData.forestCorridor)].filter(Boolean)])]);
 runtime.movie.privateGeometries=new Set();runtime.movie.privateMaterials=new Set();runtime.movieRoot.traverse(o=>{if(o.geometry&&!existingGeometries.has(o.geometry))runtime.movie.privateGeometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])if(!existingMaterials.has(m))runtime.movie.privateMaterials.add(m)});
 // Reserve a fixed set of obstructing trees before the first frame of each moving shot.
 if(kind==='intro'||kind==='outro'){
  const m=runtime.movie,end=kind==='intro'?18.5:15.5,look=new THREE.Vector3();
  for(let t=0;t<end;t+=.125){m.elapsedOverride=t;runtime.updateCinematic(m.start+t*1000,look)}
  m.treeGuard.seal();delete m.elapsedOverride;runtime.updateCinematic(m.start,look);
 }
}

function movieEase(a){a=Math.max(0,Math.min(1,a));return a*a*(3-2*a)}

function cinematicActors(m){return [m.hero,...m.people,...m.boars.map(b=>b.g),m.car,m.picnic,m.fleeingBoss?.g,m.deathBoar].filter(Boolean)}

function protectCinematicAction(m){runtime.movieRoot.updateWorldMatrix(true,true);m.treeGuard?.update(runtime.camera,cinematicActors(m),cinematicShot(m.kind,m.elapsed||0));}
 return {
  bindings:{
"cineSetup":{get:()=>cineSetup},
"movieEase":{get:()=>movieEase},
"cinematicActors":{get:()=>cinematicActors},
"protectCinematicAction":{get:()=>protectCinematicAction}
  },
  initialize(){

  }
 };

}
