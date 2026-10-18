import test from 'node:test';
import assert from 'node:assert/strict';
import {findGridPath,StableRoute} from '../src/navigation.js';

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

test('live route planning splits a sealed search across frames without changing the result',()=>{
 let queries=0,maxQueries=0,frames=0;
 const blocked=(x,z)=>Math.abs(x)<.4||Math.hypot(x-15,z-15)<1.8;
 const start={x:-15,z:-15},goal={x:15,z:15},route=new StableRoute({incremental:true});
 do{const before=queries;route.next(start,goal,(x,z)=>{queries++;return blocked(x,z)},1/60,{bound:20,step:.8});maxQueries=Math.max(maxQueries,queries-before);frames++}while(route.pending&&frames<200);
 assert.ok(frames>1&&frames<200);assert.ok(maxQueries<1000,'single-frame geometry work: '+maxQueries);
 assert.deepEqual(route.path,findGridPath(start,goal,blocked,{bound:20,step:.8,maxNodes:22000}));
});
test('world changes cancel an unfinished route and never expose its old path',()=>{
 const r=new StableRoute({incremental:true}),start={x:-15,z:-15},blocked=(x,z)=>Math.abs(x)<.4;
 r.next(start,{x:15,z:15},blocked,1/60,{bound:20});assert.ok(r.pending);const old=r.pending;
 r.next(start,{x:-15,z:-14},blocked,1/60,{bound:20,epoch:1});assert.notEqual(r.pending,old);assert.equal(r.epoch,1);
 assert.ok(r.path.every(p=>p.x<0));
});

test('a moving target cannot restart a pending search every frame',()=>{
 const r=new StableRoute({incremental:true}),start={x:-15,z:-15},blocked=(x,z)=>Math.abs(x)<.4||Math.hypot(x-15,z-15)<1.8;
 r.next(start,{x:15,z:15},blocked,1/60,{bound:20,step:.8});const pending=r.pending;assert.ok(pending);
 r.next(start,{x:15,z:10},blocked,1/60,{bound:20,step:.8});assert.equal(r.pending,pending);assert.equal(r.plans,1);
 for(let i=0;r.pending&&i<200;i++)r.next(start,{x:15,z:10},blocked,1/60,{bound:20,step:.8});
 assert.ok(r.path.length);
 const waypoint=r.next(start,{x:15,z:10},blocked,1/60,{bound:20,step:.8});
 assert.ok(waypoint,'follow the existing route during replacement planning');
});
test('replacement routes rejoin the actor position without walking back to the old start',()=>{
 const blocked=(x,z)=>Math.abs(x)<.4||Math.hypot(x-15,z-15)<1.8,r=new StableRoute({incremental:true});
 let p={x:-15,z:-15};r.next(p,{x:15,z:15},blocked,1/60,{bound:20,step:.8});
 for(let i=0;r.pending&&i<200;i++)r.next(p,{x:15,z:15},blocked,1/60,{bound:20,step:.8});
 const oldPath=r.path.slice();r.next(p,{x:15,z:10},blocked,1/60,{bound:20,step:.8});assert.ok(r.pending);
 p={...oldPath[3]};
 for(let i=0;r.pending&&i<200;i++)r.next(p,{x:15,z:10},blocked,1/60,{bound:20,step:.8});
 assert.ok(Math.hypot(r.path[0].x-p.x,r.path[0].z-p.z)<1.5);
 for(let i=1;i<=20;i++)assert.equal(blocked(p.x+(r.path[0].x-p.x)*i/20,p.z+(r.path[0].z-p.z)*i/20),false);
});
