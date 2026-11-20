import {test} from 'node:test';import assert from 'node:assert/strict';import {introStagingAt} from '../src/cinematic-staging.js';import {capsuleAt,capsuleCircleContact} from '../src/boar-physics.js';
test('family stays inside the moving car and unfolds blanket after exiting',()=>{for(let t=0;t<4;t+=.02){const s=introStagingAt(t);assert.ok(s.people.every(p=>!p.visible));assert.ok(!s.hero.visible&&!s.blanketVisible)}assert.equal(introStagingAt(7.6).blanketScale,1);assert.ok(introStagingAt(7.6).foodVisible)});
test('intro boars avoid all visible people throughout the scene',()=>{for(let t=0;t<=18.5;t+=.02){const s=introStagingAt(t);for(const b of s.boars.filter(b=>b.visible)){const body=capsuleAt(b.x,b.z,b.yaw);for(const p of [...s.people,s.hero].filter(p=>p.visible))assert.ok(!capsuleCircleContact(body,p.x,p.z,.5),'contact at '+t)}}});
test('parked car lights switch off, mother faces blanket and boars leave Timur alone',()=>{assert.equal(introStagingAt(2).headlights,true);assert.equal(introStagingAt(7).headlights,false);const mother=introStagingAt(7).people[0];assert.ok(Math.sin(mother.yaw)*(-11.2-mother.x)+Math.cos(mother.yaw)*(8-mother.z)>0);const end=introStagingAt(16);assert.ok(end.boars.every(b=>!b.visible));assert.ok(end.people.every(p=>!p.visible));assert.ok(end.hero.visible)});
test('outro family stays outside the parked car throughout the scene',async()=>{const {outroStagingAt}=await import('../src/cinematic-staging.js');for(let t=0;t<=16;t+=.05){const s=outroStagingAt(t);assert.equal(s.carZ,10);for(const p of [...s.people,s.hero])assert.ok(Math.abs(p.x)>1.65||Math.abs(p.z-10)>2.8,`person enters car at ${t}`)}const last=outroStagingAt(15);assert.equal(last.people.length,4);assert.equal(last.hero.z,6.5)});

test('intro actors avoid the parked car and boars wait for their shot',()=>{
 for(let t=4;t<8;t+=.02){
  const stage=introStagingAt(t);
  assert.ok(stage.boars.every(boar=>!boar.visible));
  for(const actor of [...stage.people,stage.hero].filter(actor=>actor.visible)){
   assert.ok(Math.abs(actor.x)>=1.6||Math.abs(actor.z-stage.carZ)>=2.6,'car overlap at '+t);
  }
 }
 assert.ok(introStagingAt(8).boars[0].visible);
 for(let i=0;i<4;i++){
  const first=introStagingAt(13.8).people[i],last=introStagingAt(14.9).people[i];
  assert.ok(Math.hypot(last.x-first.x,last.z-first.z)>3,'runner '+i+' stopped inside the shot');
 }
});

test('intro boars keep running until the camera cuts away',()=>{
 const before=introStagingAt(14.7).boars,end=introStagingAt(14.95).boars;
 for(let i=0;i<end.length;i++){
  assert.ok(end[i].visible);
  assert.ok(Math.hypot(end[i].x-before[i].x,end[i].z-before[i].z)>1);
 }
 assert.ok(introStagingAt(15).boars.every(boar=>!boar.visible));
});
