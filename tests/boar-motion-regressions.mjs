import {readGameSource} from '../scripts/game-source.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {findGridPath,findClearEscape} from '../src/navigation.js';
const game=readGameSource();
function extract(name){
 const start=game.indexOf('function '+name+'(');assert.ok(start>=0,name);
 let p=game.indexOf('{',start),depth=1,end=p+1;
 for(;depth&&end<game.length;end++){if(game[end]==='{')depth++;if(game[end]==='}')depth--;}
 return game.slice(start,end);
}
test('helper elevation is absolute on slopes, floors, water and bridge, at any frame rate',()=>{
 const settle=new Function('terrainHeightAt','familyFloorAt','lakeDepthAt','puddleDepthAt','onRiverBridge','level',extract('settleBoarOnGround')+';return settleBoarOnGround');
 for(const fps of [15,30,60,144])for(const level of [1,2,3,4,5,6]){
  const fn=settle(()=>.3,()=>.16,()=>.1,()=>.02,()=>true,level),f={g:{position:{x:1,y:100,z:2}}};
  for(let i=0;i<fps*5;i++)fn(f);
  assert.ok(Math.abs(f.g.position.y-(.3+(level===4?.28:.16)-.12))<1e-10);
 }
});
test('navigation does not tunnel through a thin wall between free grid nodes',()=>{
 const blocked=(x,z)=>x>.39&&x<.61&&Math.abs(z)<2;
 const start={x:0,z:0},path=findGridPath(start,{x:2,z:0},blocked,{bound:4,step:1});
 assert.deepEqual(path.at(-1),{x:2,z:0});
 let previous=start;
 for(const point of path){for(let i=0;i<=100;i++)assert.equal(blocked(previous.x+(point.x-previous.x)*i/100,previous.z+(point.z-previous.z)*i/100),false);previous=point;}
});
test('a blocked long body turns in place instead of freezing its heading',()=>{
 const move=new Function('companionNavBlocked','StableRoute','worldEpoch','level','smoothHeading','boarSceneryBlockedAt','boarPlayerContact','blockedByBoar','catLife','boarBody','terrainHeightAt','lakeDepthAt',
  extract('moveBoarToward')+';return moveBoarToward');
 class Route{next(){return {x:1,z:0}}record(distance){this.distance=distance}}
 const f={g:{position:{x:0,z:0},rotation:{y:0}}};
 const fn=move(()=>()=>false,Route,1,1,(a,b,dt)=>a+Math.min(b-a,dt*3.2),(f,x,z)=>x>0&&f.g.rotation.y<1,()=>null,()=>false,{blocksBoar:()=>false},()=>({}),()=>0,()=>0);
 for(let i=0;i<30;i++)fn(f,1,0,1,.05);
 assert.ok(f.g.rotation.y>=1);assert.ok(f.g.position.x>.1);
});

test('a valid capsule escapes an inflated navigation mask without teleporting through scenery',()=>{
 const blocked=(x,z)=>Math.abs(x)<1.7,clear=(x,z)=>Math.abs(x)>=.75;
 const start={x:1,z:0},target=findClearEscape(start,blocked,clear);
 assert.ok(target);assert.ok(!blocked(target.x,target.z));
 for(let i=0;i<=100;i++)assert.ok(clear(start.x+(target.x-start.x)*i/100,start.z+(target.z-start.z)*i/100));
});
test('escape recovery waits when every physical route is sealed',()=>{
 const target=findClearEscape({x:0,z:0},(x,z)=>Math.hypot(x,z)<2,(x,z)=>Math.hypot(x,z)<1);
 assert.equal(target,null);
});
test('off-grid first leg cannot cut through an inflated obstacle',()=>{
 const blocked=(x,z)=>Math.abs(x-.5)<.18&&Math.abs(z+1.2)<1.2;
 const start={x:-.41,z:-1.81},path=findGridPath(start,{x:2,z:-1.2},blocked,{bound:4,step:.8});
 assert.ok(path.length);let a=start;
 for(const b of path){for(let i=1;i<=100;i++)assert.equal(blocked(a.x+(b.x-a.x)*i/100,a.z+(b.z-a.z)*i/100),false);a=b;}
});

test('fallback recovery restores the safe heading as well as the safe position',()=>{
 const checks={checks:0,repairs:0};
 const valid=(f,x=f.g.position.x,z=f.g.position.z,yaw=f.g.rotation.y)=>x===10&&z===10&&yaw===1;
 const repair=new Function('performance','companionChecks','companionValid',extract('repairCompanion')+';return repairCompanion')({now:()=>1000},checks,valid);
 const f={g:{position:{x:0,z:0},rotation:{y:0},userData:{}},lastSafe:{x:10,z:10,yaw:1},route:{}};
 repair(f,true);assert.ok(valid(f));assert.equal(f.route,null);assert.equal(checks.repairs,1);
});

test('movement rejects coordinates outside the actual depenetration boundary',()=>{
 const blocked=new Function('locationExit','level','opening',extract('playerWorldBlocked')+';return playerWorldBlocked')(null,3,null);
 for(const [x,z] of [[43.10001,0],[-43.10001,0],[0,43.10001],[0,-43.10001]])assert.equal(blocked(x,z),true);
});

test('static rock geometry is reused and invalidated after a transform or geometry change',()=>{
 let boxes=0;
 const THREE={Box3:class{setFromObject(mesh){boxes++;this.max={y:mesh.position.y+mesh.scale.y};return this}}};
 const shape=new Function('THREE','rockShapeCache',extract('rockShape')+';return rockShape')(THREE,new WeakMap());
 const mesh={position:{x:1,y:.3,z:2},scale:{x:1,y:1,z:1},rotation:{y:0},geometry:{},matrixWorld:{elements:[]},updateWorldMatrix(){this.matrixWorld.elements=[this.position.x,this.position.y,this.position.z,this.scale.x,this.scale.y,this.scale.z,this.rotation.y]}};
 for(let i=0;i<100;i++)assert.equal(shape(mesh).top,1.3);
 assert.equal(boxes,1);
 mesh.scale.y=2;assert.equal(shape(mesh).top,2.3);assert.equal(boxes,2);
 mesh.position.x=4;assert.equal(shape(mesh).cx,4);assert.equal(boxes,3);
 mesh.rotation.y=.4;assert.equal(shape(mesh).yaw,.4);assert.equal(boxes,4);
 mesh.geometry={};shape(mesh);assert.equal(boxes,5);
});
