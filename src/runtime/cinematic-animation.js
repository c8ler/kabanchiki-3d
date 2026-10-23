import {fitFamilyFrame} from '../family-framing.js?v=215';
import * as THREE from "../../vendor/three/three.module.min.js";
import { introStagingAt, outroStagingAt } from "../cinematic-staging.js?v=215";

// Owns 2 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function updateCinematic(now,look){if(!runtime.movie)return;const m=runtime.movie,t=m.elapsedOverride??(now-m.start)/1000;m.elapsed=t;const ease=runtime.movieEase;
 const world=(x,y,z)=>new THREE.Vector3(x,y,z).add(runtime.movieRoot.position);let from,to,target,k;
 if(m.kind==='death'){const k=ease((t-.6)/2);if(m.deathCause==='bomb'){m.hero.position.set(-k*1.4,Math.sin(k*Math.PI)*1.8,-k*.8);m.hero.rotation.z=-k*1.2;if(m.deathFlash){m.deathFlash.scale.setScalar(.3+Math.min(1,t/.8)*5);m.deathFlash.material.opacity=Math.max(0,.65-t*.65)}}else if(m.deathCause==='water'){m.hero.position.y=-k*1.8;if(m.heroForm==='human')m.hero.children[5].rotation.x=Math.sin(t*6)*.35-1;if(m.deathRing)m.deathRing.scale.setScalar(1+t*.25)}else{m.hero.rotation.z=-k*Math.PI/2;m.hero.position.y=-k*.25;if(m.heroForm==='human')m.hero.children[5].rotation.x=-.8*k}if(m.deathBoar){const jump=ease(t/.7);m.deathBoar.position.x=-2+jump*.8;m.deathBoar.position.y=Math.sin(jump*Math.PI)*.55}from=world(4,3.2,5);to=world(3,2.4,4);target=world(0,.4,0);runtime.camera.position.lerpVectors(from,to,ease(t/4));runtime.camera.up.set(0,1,0);runtime.camera.lookAt(target);updateCinematicLamp(m);runtime.protectCinematicAction(m);return
 }else if(m.kind==='storm'){const k=ease(t/6),a=t*4,r=2+k*2;m.hero.position.set(Math.cos(a)*r,k*12+.2,Math.sin(a)*r);m.hero.rotation.set(.18,a+Math.PI/2,Math.sin(t*2)*.35);from=world(-13,8,18);to=world(-15,11,19);target=world(0,6,0);runtime.camera.position.lerpVectors(from,to,ease(t/6));runtime.camera.up.set(0,1,0);runtime.camera.lookAt(target);updateCinematicLamp(m);runtime.protectCinematicAction(m);return
 }else if(m.kind==='intro'){
  runtime.camera.fov=t>=12&&t<15?65:48;runtime.camera.updateProjectionMatrix();const stage=introStagingAt(t);m.car.position.z=stage.carZ;for(const light of m.car.userData.headlights)light.intensity=stage.headlights?32:0;for(const lens of m.car.userData.headlightLenses){lens.material.color.set(stage.headlights?0xffefcb:0x8e9a97);if(lens.material.emissive)lens.material.emissiveIntensity=stage.headlights?1:0}
  m.hero.visible=stage.hero.visible;const heroGround=Math.max(0,runtime.terrainHeightAt(stage.hero.x,stage.hero.z));m.hero.position.set(stage.hero.x,heroGround+.04,stage.hero.z);
  stage.people.forEach((q,i)=>{const p=m.people[i];p.visible=q.visible;const ground=Math.max(0,runtime.terrainHeightAt(q.x,q.z));p.position.set(q.x,ground,q.z);p.rotation.set(q.spread*.35,q.yaw,0);const model=p.children.find(c=>c.isGroup)||p;model.children.filter(o=>o.isMesh&&o.position.y<.9&&o.position.y>.2&&Math.abs(o.position.x)>.1).forEach((leg,j)=>leg.rotation.x=q.running?Math.sin(t*12+i+j*Math.PI)*.6:0)});
  stage.boars.forEach((q,i)=>{const b=m.boars[i];b.g.visible=q.visible;const ground=Math.max(0,runtime.terrainHeightAt(q.x,q.z));b.g.position.set(q.x,ground,q.z);b.g.rotation.y=q.yaw;b.g.scale.setScalar(q.scale??1);b.b.rotation.z=Math.sin(now*.014+i)*.04});
  m.picnic.visible=stage.blanketVisible;m.picnic.scale.set(stage.blanketScale,1,stage.blanketScale);m.picnic.children.forEach((o,i)=>{if(i>0)o.visible=stage.foodVisible});
  if(t<4){from=world(10,5,24);to=world(7,3.6,15);target=world(0,1,m.car.position.z);k=ease(t/4)}else if(t<8){from=world(-16,3.6,14);to=world(-14,2.5,12);target=world(-9,1.2,6.5);k=ease((t-4)/4)}else if(t<12){from=world(5,2.8,-2);to=world(4,2.2,3);target=world(0,.8,m.boars[0].g.position.z);k=ease((t-8)/4)}else if(t<15){from=world(0,30,42);to=world(0,36,46);target=world(0,1,15);k=ease((t-12)/3)}else{from=world(-5.2,1.9,10);to=world(-6.2,1.7,8.8);target=world(-8,.8,6);k=ease((t-15)/3)}
 }else if(m.kind==='outro'){
  const flee=ease(t/4);m.fleeingBoss.g.position.set(-5-flee*26,0,1-flee*24);m.fleeingBoss.g.rotation.y=Math.atan2(-26,-24);m.fleeingBoss.g.visible=t<4;m.fleeingBoss.b.rotation.z=Math.sin(now*.017)*.07;
  runtime.scene.background.copy(m.saved.sky).lerp(new THREE.Color(0xdfb18f),ease(t/15));runtime.scene.fog.color.copy(runtime.scene.background);runtime.sun.intensity=Math.max(.38,m.saved.sun+ease(t/12)*1.35);runtime.hemi.intensity=Math.max(.65,m.saved.hemi+ease(t/12)*.9);
  m.boars[0].g.position.set(3.1,0,5);m.boars[0].g.rotation.y=Math.PI;m.boars[0].g.visible=true;const stage=outroStagingAt(t);m.car.position.z=stage.carZ;m.car.rotation.y=0;m.hero.visible=true;m.hero.position.set(stage.hero.x,0,stage.hero.z);m.hero.rotation.y=0;
  stage.people.forEach((q,i)=>{const person=m.people[i];person.visible=true;person.position.set(q.x,0,q.z);person.rotation.y=q.yaw;const model=person.children.find(c=>c.isGroup)||person;model.children.filter(o=>o.isMesh&&o.position.y<.9&&o.position.y>.2&&Math.abs(o.position.x)>.1).forEach((leg,j)=>leg.rotation.x=q.walking?Math.sin(t*10+j*Math.PI)*.4:0)});
  for(const i of [0,1])m.hero.children[i].rotation.x=t>6&&t<9?Math.sin(t*10+i*Math.PI)*.25:0;
  if(t<3){from=world(-11,4,9);to=world(-9,3.5,5);target=world(m.fleeingBoss.g.position.x,1.8,m.fleeingBoss.g.position.z);k=ease(t/3)}else if(t<6){from=world(7,3.2,12);to=world(5,2.4,9);target=world(0,1.2,6);k=ease((t-3)/3)}else if(t<10){from=world(-6,3,15);to=world(-5,3,13);target=world(0,1,8);k=ease((t-6)/4)}else{from=world(-7,4,15);to=world(-9,6,18);target=world(0,1,8);k=ease((t-10)/5)}
 }else{
  const meet=ease(t/2.5),hug=ease((t-4.4)/1.1)*ease((8.5-t)/.9);m.hero.position.x=-.7+meet*.3+hug*.13;m.people[0].position.x=.85-meet*.22-hug*.31;runtime.cinemaHug(m.people[0],hug);m.gift.visible=t>2.8&&t<4.5;m.gift.position.set(.25,1.1,0);from=world(3.8,2.2,5);to=world(2.6,1.8,3.8);target=world(.2,1.25,0);k=ease(t/8);
  if(m.heroForm!=='human'){
   const cat=m.heroForm==='cat';m.hero.position.x=cat?-.65+meet*.1+hug*.12:-1.35+meet*.1+hug*.1;m.hero.position.y=cat?hug*.16:0;m.hero.position.z=hug*(cat?.45:.25);m.hero.rotation.z=Math.sin(t*3)*.025;
   m.people[0].position.x=cat?.85-meet*.2-hug*.38:1.1-meet*.1-hug*.25;m.people[0].position.y=-hug*(cat?.22:.08);m.people[0].rotation.z=-hug*.12;runtime.cinemaHug(m.people[0],hug);
   if(cat){const tail=m.hero.children.find(o=>o.isGroup&&o.position.z<-.3);if(tail)tail.rotation.y=Math.sin(t*6)*.35;for(const leg of m.hero.children.filter(o=>o.isMesh&&o.position.y<.3))leg.rotation.x=-hug*.45;}
   m.gift.position.set(.2,cat?.55:.8,.3);m.gift.scale.setScalar(.55);
  }

 }
 updateCinematicLamp(m);
 runtime.camera.up.set(0,1,0);runtime.camera.position.lerpVectors(from,to,k);if(runtime.camera.aspect<1)runtime.camera.position.sub(target).multiplyScalar(Math.min(1.7,1/runtime.camera.aspect)).add(target);look.copy(target);runtime.camera.lookAt(look);if(m.kind==='family'){runtime.movieRoot.updateWorldMatrix(true,true);fitFamilyFrame(THREE,runtime.camera,target,[m.hero,...m.people]);}runtime.protectCinematicAction(m);runtime.$('cinematic').dataset.kind=m.kind;
}

function updateCinematicLamp(m){if(m.lampLight){const origin=m.hero.localToWorld(new THREE.Vector3(.6,1.0,.8)),direction=new THREE.Vector3(Math.sin(m.hero.rotation.y),-.035,Math.cos(m.hero.rotation.y));m.lampLight.position.copy(runtime.movieRoot.worldToLocal(origin.clone()));m.lampLight.target.position.copy(runtime.movieRoot.worldToLocal(origin.addScaledVector(direction,14)));m.lampLight.visible=m.hero.visible}}
 return {
  bindings:{
"updateCinematic":{get:()=>updateCinematic},
"updateCinematicLamp":{get:()=>updateCinematicLamp}
  },
  initialize(){

  }
 };

}
