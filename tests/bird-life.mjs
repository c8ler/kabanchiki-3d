import test from 'node:test';
import assert from 'node:assert/strict';
import {BirdLife} from '../src/bird-life.js';

test('summer birds tolerate an early first animation timestamp and keep flying across cycles',()=>{
 const positions=[];
 const mesh=()=>({count:1,instanceMatrix:{},setMatrixAt(){}});
 const body=mesh(),left=mesh(),right=mesh();
 const bird={root:{visible:true,children:[body,left,right]},body,left,right,time:0,season:'summer',perches:[{x:1,y:5,z:2},{x:8,y:6,z:9}],d:{position:{set(...p){positions.push(p)}},rotation:{set(){}},scale:{setScalar(){}},updateMatrix(){},matrix:{}}};
 BirdLife.prototype.update.call(bird,-.01,()=>0);
 assert.equal(bird.time,0);
 for(let i=0;i<1000;i++)BirdLife.prototype.update.call(bird,.05,()=>0);
 assert.ok(positions.every(p=>p.every(Number.isFinite)));
 assert.ok(bird.time>49);
});
