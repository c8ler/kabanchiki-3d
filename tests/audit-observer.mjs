import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectState,actionPlan,resourceIssues} from '../src/qa/audit-observer.js';
const good=()=>({positions:[[0,0,0]],numbers:{life:4,time:5},creatures:16,pets:2,cat:false,boar:false,flight:false,level:3,bombs:[{left:3,age:.1}]});
test('audit rejects invalid coordinates, counters, caps and conflicting modes',()=>{
 assert.deepEqual(inspectState(good()),[]);
 for(const mutate of [s=>s.positions[0][1]=NaN,s=>s.numbers.life=Infinity,s=>s.creatures=17,s=>s.pets=3,s=>{s.cat=s.boar=true},s=>s.flight=true,s=>s.bombs[0].left=-1]){
  const state=good();mutate(state);assert.ok(inspectState(state).length);
 }
});
test('replay plans are reproducible, bounded and include all action classes',()=>{
 const a=actionPlan(1901,1024);assert.deepEqual(a,actionPlan(1901,1024));assert.notDeepEqual(a,actionPlan(7331,1024));
 assert.equal(a.length,1024);assert.equal(new Set(a.map(a=>a.kind)).size,11);
 assert.ok(a.every(a=>a.seconds>=.1&&a.seconds<.4&&a.fps>=10));
});
test('resource observer compares like maps, ignores cold setup and detects a leak',()=>{
 const rows=[{level:1,geometries:999,textures:36,children:1000},{level:2,geometries:500,textures:36,children:1000},{level:1,geometries:710,textures:36,children:1000},{level:1,geometries:720,textures:36,children:1000}];
 assert.deepEqual(resourceIssues(rows),[]);rows.at(-1).geometries=900;assert.match(resourceIssues(rows)[0],/resource-growth:1:geometries/);
});
