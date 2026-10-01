import test from 'node:test';
import assert from 'node:assert/strict';
import {convexHull,polygonContact,FriendYield} from '../src/movement-geometry.js';
const square=convexHull([{x:1,z:1},{x:-1,z:1},{x:0,z:0},{x:-1,z:-1},{x:1,z:-1},{x:1,z:1}]);
test('actual polygon leaves former enclosing-circle corners free',()=>{
 assert.equal(square.length,4);assert.equal(polygonContact(square,1.3,1.3,.3),null);
 assert.ok(polygonContact(square,1.25,0,.3));assert.ok(polygonContact(square,0,0,.3));
});
test('contact resolution clears interior, edges and corners',()=>{
 for(const [x,z] of [[0,0],[.95,0],[1.1,1.1],[-1.1,.2]]){const c=polygonContact(square,x,z,.43);assert.ok(c);assert.equal(polygonContact(square,x+c.nx*(c.depth+.001),z+c.nz*(c.depth+.001),.43),null)}
});
test('narrow mountain uses its own shape rather than its longest radius',()=>{
 const narrow=convexHull([{x:-3,z:-.6},{x:3,z:-.6},{x:3,z:.6},{x:-3,z:.6}]);assert.equal(polygonContact(narrow,0,1.05,.43),null);assert.ok(polygonContact(narrow,0,.9,.43));
});
function simulate(fps,{x=0,z=2.6,canMove=()=>true,seconds=1,playerSpeed=0}={}){
 const c=new FriendYield();let playerZ=0;const frames=[];
 for(let i=0;i<fps*seconds;i++){const before={x,z};const result=c.step({x,z,playerX:0,playerZ,dx:0,dz:1,dt:1/fps,canMove});x=result.x;z=result.z;assert.ok(Math.hypot(x-before.x,z-before.z)<=6.8/fps+1e-6);assert.ok(canMove(x,z));frames.push(result);playerZ+=playerSpeed/fps}
 return {x,z,frames};
}
test('friend proactively moves sideways without fixed frame nudges',()=>{const r=simulate(60);assert.ok(r.x>1.85);assert.ok(Math.abs(r.z-2.6)<1e-6);assert.ok(r.frames[0].x<r.frames[4].x)});
test('sidestep speed is consistent at 30, 60 and 120 FPS',()=>{const a=simulate(30),b=simulate(60),c=simulate(120);assert.ok(Math.abs(a.x-b.x)<.1);assert.ok(Math.abs(c.x-b.x)<.1)});
test('friend chooses the other side when a mountain blocks the preferred side',()=>{const r=simulate(60,{canMove:(x)=>x<=.01});assert.ok(r.x<-1.85)});
test('friend never teleports through a blocked intermediate path',()=>{const r=simulate(60,{canMove:(x)=>Math.abs(x)<.30||Math.abs(x)>1.5});assert.ok(Math.abs(r.x)<.30)});
test('stationary friend outside the movement corridor stays put',()=>{const r=simulate(60,{x:3,z:2});assert.equal(r.x,3);assert.equal(r.z,2)});
test('friend escapes an initial overlap gradually',()=>{const r=simulate(60,{x:0,z:0});assert.ok(Math.abs(r.x)>1.85);assert.ok(r.frames[0].x<.05)});
