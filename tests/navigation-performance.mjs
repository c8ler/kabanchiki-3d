import test from 'node:test';
import assert from 'node:assert/strict';
import {findGridPath} from '../src/navigation.js';

// Count geometric work, independent of CI CPU speed. This sealed target forces
// a full search; checking already dominated edges used nearly 60,000 queries.
test('sealed navigation target bounds expensive geometry queries',()=>{
 let queries=0;
 const blocked=(x,z)=>{queries++;return Math.abs(x)<.4||Math.hypot(x-15,z-15)<1.8};
 const start={x:-15,z:-15},path=findGridPath(start,{x:15,z:15},blocked,{step:.8,bound:20,maxNodes:22000});
 assert.ok(path.length);
 assert.ok(queries<18000,'geometry queries: '+queries);
 let previous=start;
 for(const p of path){for(let i=1;i<=20;i++)assert.equal(blocked(previous.x+(p.x-previous.x)*i/20,previous.z+(p.z-previous.z)*i/20),false);previous=p}
});

import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
function extract(name){const start=game.indexOf('function '+name+'(');assert.ok(start>=0);let p=game.indexOf('{',start),depth=1,end=p+1;for(;depth&&end<game.length;end++){if(game[end]==='{')depth++;if(game[end]==='}')depth--;}return game.slice(start,end)}
test('door bounds are shared within a frame and refresh after movement or world changes',()=>{
 let boxes=0;
 const THREE={Box3:class{setFromObject(door){boxes++;this.min={x:door.x};return this}}};
 const make=new Function('THREE','doorCollisionCache',`let boarCollisionEpoch=0,worldEpoch=0;${extract('doorCollisionBox')};return {box:doorCollisionBox,frame(){boarCollisionEpoch++},world(){worldEpoch++}}`);
 const cache=make(THREE,new WeakMap()),door={x:1,matrixWorld:{elements:[]},updateWorldMatrix(){this.matrixWorld.elements=[this.x]}};
 const first=cache.box(door);for(let i=0;i<100;i++)assert.equal(cache.box(door),first);assert.equal(boxes,1);
 door.x=2;assert.equal(cache.box(door).min.x,2);assert.equal(boxes,2);
 cache.frame();cache.box(door);assert.equal(boxes,3);
 cache.world();cache.box(door);assert.equal(boxes,4);
});
