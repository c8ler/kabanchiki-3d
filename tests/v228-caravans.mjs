import test from 'node:test';import assert from 'node:assert/strict';import * as T from '../vendor/three/three.module.min.js';
import {CaravanRaid,caravanRouteClear,caravanFootprint,caravanRoof,RAID_SECONDS} from '../src/caravan-raid.js';import {createCaravanVisual} from '../src/caravan-visual.js';
import {parseCheatCode} from '../src/cheat-codes.js';
const route=[{x:0,z:-30},{x:0,z:30}],env={near:true,helper:true,clear:true};
test('caravans require a usable route, a nearby boar and a clear approach',()=>{
 assert.throws(()=>new CaravanRaid([]));assert.throws(()=>new CaravanRaid([{x:0,z:0},{x:1,z:0}]));
 const c=new CaravanRaid(route);for(const e of [{},{near:true},{near:true,helper:true,clear:false}])assert.equal(c.start(e),false);
 assert.equal(c.start(env),true);assert.equal(c.start(env),false);
});
test('a raid gives one reward, pauses when the helper leaves, and requires three hits',()=>{
 const c=new CaravanRaid(route);c.start(env);for(let i=0;i<10;i++)c.update(.1,env);const saved=c.progress;for(let i=0;i<10;i++)c.update(.1,{...env,helper:false});assert.equal(c.progress,saved);
 let score=0,hits=0,opened=0;for(let i=0;i<100;i++){const e=c.update(.1,env);score+=e.score||0;if(e.opened)opened++;if(e.hit)hits++}assert.equal(c.state,'loot');assert.equal(score,0);assert.equal(opened,1);assert.equal(hits,3);assert.equal(c.hits,3);assert.equal(c.open(),null);assert.equal(c.start(env),false);
});
test('abandoning a raid resets it without awarding loot; explosions do not award a raid score',()=>{
 const c=new CaravanRaid(route);c.start(env);c.update(.2,env);for(let i=0;i<90;i++)c.update(.1,{helper:false});assert.equal(c.state,'travel');assert.equal(c.progress,0);assert.equal(c.rewarded,false);
 assert.equal(c.open('bomb').score,0);assert.equal(c.open('raid'),null);
});
test('a blocked caravan stands still without shaking or passing through an obstacle',()=>{
 const c=new CaravanRaid(route),before=c.point();for(let i=0;i<100;i++)c.update(.1,{blocked:()=>true});assert.deepEqual(c.point(),before);assert.equal(c.blocked,true);
 c.update(.1);assert.ok(c.point().z>before.z);assert.equal(c.blocked,false);
});
test('routes check the whole corridor and rotated wagon collisions match the visible footprint',()=>{
 assert.equal(caravanRouteClear(route,(x,z)=>Math.abs(z)<.1),false);assert.equal(caravanRouteClear(route,()=>false),true);
 const p={x:0,z:0,yaw:Math.PI/2};assert.equal(caravanFootprint(p,1.8,0,.1),true);assert.equal(caravanFootprint(p,0,2,.1),false);assert.equal(caravanFootprint(p,0,0,.4,3.2),false);
});
test('a convoy exits once; long pauses cannot teleport it or finish an entire raid at once',()=>{
 const c=new CaravanRaid(route),before=c.distance;c.update(100);assert.ok(c.distance-before<=.4+.00001);for(let i=0;i<2000;i++)c.update(.1);assert.equal(c.state,'gone');
 const raid=new CaravanRaid(route);raid.start(env);raid.update(100,env);assert.ok(raid.progress<RAID_SECONDS);
});
test('the animated convoy uses two bounded instance batches and keeps actors grounded',()=>{
 const visual=createCaravanVisual(new T.Scene()),c=new CaravanRaid(route),ground=(x,z)=>x*.1;visual.update({raid:c,time:1,lootTaken:new Set(),openedAt:0},ground);
 assert.equal(visual.drawCalls,2);assert.equal(visual.actors.length,4);assert.ok(visual.root.children.filter(m=>m.isInstancedMesh).every(m=>m.count<160));
 for(const a of visual.actors)assert.ok(Number.isFinite(a.g.position.y));
 c.open();c.age=3;visual.update({raid:c,time:3,lootTaken:new Set([1]),openedAt:1},ground);assert.equal(visual.loot[1].visible,false);for(const g of visual.loot)assert.ok(Math.abs(g.position.y-ground(g.position.x,g.position.z))<.00001);
 for(let i=0;i<300;i++){c.age+=.1;visual.update({raid:c,time:c.age,lootTaken:new Set(),openedAt:1},ground)}assert.ok(visual.actors.every(a=>!a.g.visible));visual.hide();assert.equal(visual.root.visible,false);
});

test('caravan is a hidden toggle with language aliases',()=>{for(const code of ['CARAVAN','караван','караваны'])assert.deepEqual(parseCheatCode(code),{type:'caravan'})});
test('jumpers can land on a rotated canopy and walk off instead of getting trapped',()=>{for(const yaw of [0,Math.PI/2,Math.PI/4]){const p={x:4,z:-8,yaw};const roof=caravanRoof(p,p.x,p.z);assert.equal(roof,3);assert.equal(caravanFootprint(p,p.x,p.z,.4,roof),false);assert.equal(caravanFootprint(p,p.x,p.z,.4,0),true);assert.equal(caravanRoof(p,p.x+10,p.z),0)}});
