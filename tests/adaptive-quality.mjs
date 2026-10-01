import test from 'node:test';
import assert from 'node:assert/strict';
import {AdaptiveQuality,GRAPHICS_TIERS} from '../src/adaptive-quality.js';
function run(controller,fps,seconds,start=0,active=true){let now=start;controller.sample(now,active);for(let i=0;i<Math.ceil(fps*seconds);i++){now+=1000/fps;controller.sample(now,active)}return now}
test('sustained low FPS steps down to the minimum',()=>{const c=new AdaptiveQuality({initial:3});run(c,20,25);assert.equal(c.tier,0)});
test('a brief dip and middle-band FPS preserve quality',()=>{const c=new AdaptiveQuality({initial:3});let now=run(c,20,1);now=run(c,60,10,now);run(c,48,20,now);assert.equal(c.tier,3)});
test('moderate sustained slowdown reduces quality',()=>{const c=new AdaptiveQuality({initial:3});run(c,35,5);assert.equal(c.tier,2)});
test('recovery waits a minute after degradation',()=>{const c=new AdaptiveQuality({initial:3});let now=run(c,20,3);assert.equal(c.tier,2);now=run(c,60,35,now);assert.equal(c.tier,2);run(c,60,35,now);assert.equal(c.tier,3)});
test('hidden or paused frames and long gaps do not degrade quality',()=>{const c=new AdaptiveQuality({initial:3});let now=run(c,10,30,0,false);c.sample(now+10000,true);c.sample(now+20000,true);run(c,60,5,now+20000);assert.equal(c.tier,3)});
test('mobile cap and cooldown prevent rapid oscillation',()=>{const changes=[];const c=new AdaptiveQuality({initial:1,max:2,onChange:(tier,fps)=>changes.push({tier,fps})});let now=run(c,60,30);assert.equal(c.tier,2);now=run(c,20,3,now);assert.equal(c.tier,1);run(c,20,2,now);assert.equal(c.tier,1);assert.equal(changes.length,2)});
test('tiers reduce expensive rendering settings monotonically',()=>{for(let i=1;i<GRAPHICS_TIERS.length;i++)for(const key of ['pixelRatio','shadowSize','grass','particles','clouds'])assert.ok(GRAPHICS_TIERS[i][key]>=GRAPHICS_TIERS[i-1][key])});
