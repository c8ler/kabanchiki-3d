import test from 'node:test';import assert from 'node:assert/strict';
import {ceilingMotion,PLAYER_HEIGHTS} from '../src/player-house-physics.js';
import {BOAR_FORM_SECONDS,CAT_FORM_SECONDS,formTimeAfterStep} from '../src/form-rules.js';
import {reunionProfile,reunionPose} from '../src/family-reunion.js';
test('jumping from raised furniture hits the underside of a roof in every form',()=>{
 for(const height of Object.values(PLAYER_HEIGHTS))for(const platform of [.55,.9,1.25])for(const fps of [15,30,60,144]){
  let feet=platform,velocity=14,hit=false,maxHead=feet+height;
  for(let i=0;i<fps;i++){velocity-=18/fps;const s=ceilingMotion(feet,velocity,feet+velocity/fps,3.05,height);feet=s.feet;velocity=s.velocity;hit||=s.hit;maxHead=Math.max(maxHead,feet+height)}
  assert.ok(hit);assert.ok(maxHead<=3.05+1e-8);
 }
});
test('a jump already above the roof is never pulled through it',()=>{assert.equal(ceilingMotion(3.7,7,3.9,3.05,1.65).hit,false)});
test('both transformations last 30 active seconds, including slow frames and repeated application',()=>{
 assert.equal(BOAR_FORM_SECONDS,30);assert.equal(CAT_FORM_SECONDS,30);
 for(const duration of [BOAR_FORM_SECONDS,CAT_FORM_SECONDS])for(const fps of [2,5,15,30,60,144]){
  let left=duration;for(let i=0;i<fps*30;i++)left=formTimeAfterStep(left,1/fps);
  assert.ok(left<1e-8);assert.equal(formTimeAfterStep(duration,31),0);
 }
});
test('animal reunion dialogue is distinct for every relative and form',()=>{
 const lines=new Set();for(const form of ['cat','boar'])for(let role=0;role<4;role++){const p=reunionProfile(form,role);assert.ok(p.line&&p.after&&p.name);assert.ok(!lines.has(p.line));lines.add(p.line);assert.notEqual(p.gesture,'hug');for(const t of [0,1,2.5,4,6,8])for(const n of Object.values(reunionPose(form,t)))assert.ok(Number.isFinite(n))}
 assert.equal(reunionProfile('human',0).gesture,'hug');
});

import {resourceLevel,briefNotice} from '../src/adventure-hud.js';
test('resource indicators identify low supplies and clamp filled bars',()=>{assert.equal(resourceLevel(1,5).low,true);assert.equal(resourceLevel(5,5).low,false);assert.equal(resourceLevel(12,5).ratio,1);assert.equal(resourceLevel(-2,5).ratio,0);assert.ok(briefNotice('Новая еда. '+('Подробная подсказка '.repeat(15))).length<=96)});
