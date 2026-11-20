import test from 'node:test';import assert from 'node:assert/strict';
import {polygonContact} from '../src/movement-geometry.js';
test('2000 seeded edge and interior probes resolve without penetration for three body sizes',()=>{
 let seed=20261120;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<2000;i++){
  const cx=rnd()*60-30,cz=rnd()*60-30,w=.2+rnd()*4,d=.2+rnd()*4,r=[.38,.43,.7][i%3];
  const polygon=[{x:cx-w,z:cz-d},{x:cx+w,z:cz-d},{x:cx+w,z:cz+d},{x:cx-w,z:cz+d}];
  const x=cx+(rnd()*2-1)*w,z=cz+(rnd()*2-1)*d,c=polygonContact(polygon,x,z,r);
  assert.ok(c,JSON.stringify({i,seed,x,z,r,polygon}));assert.equal(polygonContact(polygon,x+c.nx*(c.depth+.001),z+c.nz*(c.depth+.001),r),null,JSON.stringify({i,seed,x,z,r,c}));
 }
});
