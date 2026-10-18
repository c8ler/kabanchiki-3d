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
