import test from 'node:test';import assert from 'node:assert/strict';import * as T from '../vendor/three/three.module.min.js';import {installResourceWatch} from '../src/qa/resource-watch.js';
test('resource watch distinguishes an orphan from shared, disposed and never-uploaded geometry',()=>{
 const watch=installResourceWatch(T),scene=new T.Scene();
 try{
  const g=new T.BoxGeometry(),material=new T.MeshBasicMaterial(),a=new T.Mesh(g,material),b=new T.Mesh(g,material);scene.add(a,b);
  g.addEventListener('dispose',()=>{});watch.snapshot(scene);scene.remove(a);assert.equal(watch.snapshot(scene).orphaned,0);
  scene.remove(b);assert.equal(watch.snapshot(scene).orphaned,1);g.dispose();assert.equal(watch.snapshot(scene).orphaned,0);
  const never=new T.Mesh(new T.BoxGeometry(),material);scene.add(never);watch.snapshot(scene);scene.remove(never);assert.equal(watch.snapshot(scene).orphaned,0);
  scene.add(a);g.addEventListener('dispose',()=>{});scene.remove(a);assert.equal(watch.snapshot(scene).orphaned,1);
 }finally{watch.stop()}
});
