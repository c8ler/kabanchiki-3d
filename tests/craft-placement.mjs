import test from 'node:test';import assert from 'node:assert/strict';
import * as T from '../vendor/three/three.module.min.js';
import {CraftWorld} from '../src/craft-world.js';
import {placementHeight,placementProblem,overlapVolume,candidateBoxes} from '../src/craft-placement.js';
const box=(x,y,z,w,h,d)=>new T.Box3(new T.Vector3(x-w/2,y,z-d/2),new T.Vector3(x+w/2,y+h,z+d/2));
const make=()=>{const material=new T.MeshLambertMaterial();return new CraftWorld(new T.Scene(),Object.fromEntries(['wood','roof','white','black','stone','gold','leaf','pink','boar'].map(k=>[k,material])),{light:()=>new T.PointLight()})};
test('placement chooses the floor indoors, a table in reach, and roof only from roof height',()=>{
 const surfaces=[box(0,0,0,4.8,.16,4.8),box(0,2.725,0,5.2,.35,5.2)];
 assert.equal(placementHeight(0,0,0,0,surfaces),.16);
 assert.equal(placementHeight(0,0,3.075,0,surfaces),3.075);
 surfaces.push(box(0,.775,0,1.8,.15,1.2));
 assert.equal(placementHeight(0,0,0,0,surfaces),.925);
});
test('adjacent objects use mesh bounds with a small fitting tolerance, without a human-sized halo',()=>{
 const chair=box(0,0,0,.7,1.2,.7),wall=box(0,0,.5,3,2.7,.25);
 assert.equal(placementProblem([chair],{solids:[wall]}),'');
 wall.translate(new T.Vector3(0,0,-.3));assert.ok(placementProblem([chair],{solids:[wall]}));
 assert.equal(overlapVolume(chair,box(0,1.2,0,.7,.2,.7)),false);
 assert.ok(placementProblem([box(42,0,0,1,1,1)]));
});
test('tree fitting uses the trunk rather than its square bounding box or player radius',()=>{
 const circle={x:0,z:0,r:.5,bottom:0,top:3};
 assert.equal(placementProblem([box(.6,0,.6,.3,.3,.3)],{circles:[circle]}),'');
 assert.ok(placementProblem([box(.3,0,0,.3,.3,.3)],{circles:[circle]}));
});
test('preview creation never consumes stock, registers collisions, advances epochs, or creates active lights',()=>{
 const world=make();world.addStock('standingLamp');const epoch=world.epoch;
 const preview=world.create('standingLamp',0,0,0,3,0,true);
 assert.equal(world.items.length,0);assert.equal(world.stock.standingLamp,1);assert.equal(world.epoch,epoch);
 assert.equal(world.blocked(0,0,0),false);assert.equal(preview.light.intensity,0);
 assert.ok(candidateBoxes(preview).length>0);
});
test('furniture fits under a crafted roof and can sit on a table without intersecting it',()=>{
 const world=make(),house=world.create('house',0,0,0,3);
 const chair=world.create('chair',0,.16,0,3,0,true);
 assert.equal(placementProblem(candidateBoxes(chair),{solids:house.solids}),'');
 chair.g.position.x=2.2;assert.ok(placementProblem(candidateBoxes(chair),{solids:house.solids}));
 world.clear();
 const table=world.create('table',0,0,0,3),lamp=world.create('standingLamp',0,.925,0,3,0,true);
 assert.equal(placementProblem(candidateBoxes(lamp),{solids:table.solids}),'');
});
test('worms and snails crawl, animate, steer around barriers, and stay on support at different frame rates',()=>{
 for(const fps of [15,30,60,144]){
  const world=make(),items=['worm','snail'].map((kind,i)=>world.create(kind,i,0,0,3)),initial=items.map(i=>i.g.position.clone());
  let worst=0;
  const blocked=(x,z)=>Math.abs(x)<.4&&z>.6&&z<.8;
  for(let i=0;i<fps*20;i++){
   const previous=items.map(i=>i.g.position.clone());
   world.update(1/fps,i/fps,3,()=>0,blocked,{x:10,z:10});
   items.forEach((item,j)=>{worst=Math.max(worst,item.g.position.distanceTo(previous[j]));assert.equal(blocked(item.g.position.x,item.g.position.z),false);assert.equal(item.g.position.y,0)});
  }
  items.forEach((item,i)=>assert.ok(item.g.position.distanceTo(initial[i])>.5,item.kind));
  assert.ok(worst<=.3/fps+.00001);
  assert.ok(new Set(items[0].g.children.map(m=>m.position.x)).size>3);
  assert.notEqual(items[1].g.children[0].scale.z,1);
  const hidden=items[0].g.position.clone();world.visible(4);world.update(1,50,3,()=>0,()=>false,{x:0,z:0});assert.ok(hidden.equals(items[0].g.position));
 }
});
