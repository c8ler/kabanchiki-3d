import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {findGridPath} from '../src/navigation.js';
const game=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
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
 const move=new Function('StableRoute','worldEpoch','level','smoothHeading','boarSceneryBlockedAt','boarPlayerContact','blockedByBoar','catLife','boarBody','terrainHeightAt','lakeDepthAt',
  extract('moveBoarToward')+';return moveBoarToward');
 class Route{next(){return {x:1,z:0}}record(distance){this.distance=distance}}
 const f={g:{position:{x:0,z:0},rotation:{y:0}}};
 const fn=move(Route,1,1,(a,b,dt)=>a+Math.min(b-a,dt*3.2),(f,x,z)=>x>0&&f.g.rotation.y<1,()=>null,()=>false,{blocksBoar:()=>false},()=>({}),()=>0,()=>0);
 for(let i=0;i<30;i++)fn(f,1,0,1,.05);
 assert.ok(f.g.rotation.y>=1);assert.ok(f.g.position.x>.1);
});
