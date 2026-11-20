import test from 'node:test';import assert from 'node:assert/strict';import {performanceRegressions} from '../scripts/performance-gate.mjs';
const rows=(ratio=1)=>[...Array.from({length:6},(_,i)=>({label:'baseline',level:i+1,cpu:{p50:10+i,frames:30}})),...Array.from({length:6},(_,i)=>({label:'candidate',level:i+1,cpu:{p50:(10+i)*ratio,frames:30}}))];
test('performance gate tolerates small same-run variation',()=>assert.deepEqual(performanceRegressions(rows(1.08)),[]));
test('performance gate rejects sustained and map-local regressions',()=>{assert.ok(performanceRegressions(rows(2)).length);const r=rows();r[6].cpu.p50=30;assert.match(performanceRegressions(r)[0],/cpu-regression:1/)});
test('performance gate rejects missing or broken instrumentation',()=>{assert.ok(performanceRegressions([]).length);const r=rows();r[6].cpu.frames=undefined;assert.match(performanceRegressions(r)[0],/invalid-cpu-profile/)});
