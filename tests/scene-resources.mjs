import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three/three.module.min.js';
import {captureSceneResources,disposeDetachedResources,removeSceneObject,removeSceneObjects} from '../src/scene-resources.js';
function observed(resource){let count=0;resource.addEventListener('dispose',()=>count++);return()=>count}
test('level replacement releases detached geometry and materials once per snapshot',()=>{
 const scene=new T.Scene(),geometry=new T.BoxGeometry(),material=new T.MeshBasicMaterial();
 scene.add(new T.Mesh(geometry,material),new T.Mesh(geometry,material));
 const g=observed(geometry),m=observed(material),previous=captureSceneResources(scene);
 scene.clear();assert.deepEqual(disposeDetachedResources(previous,scene),{geometries:1,materials:1});assert.equal(g(),1);assert.equal(m(),1);
});
test('shared resources survive while another hidden mesh still uses them',()=>{
 const scene=new T.Scene(),geometry=new T.BoxGeometry(),material=new T.MeshBasicMaterial(),a=new T.Mesh(geometry,material),b=new T.Mesh(geometry,material);
 scene.add(a,b);b.visible=false;const previous=captureSceneResources(scene),g=observed(geometry),m=observed(material);
 a.removeFromParent();assert.deepEqual(disposeDetachedResources(previous,scene),{geometries:0,materials:0});assert.equal(g(),0);assert.equal(m(),0);
});
test('replaced geometry is freed without disposing textures owned by the asset cache',()=>{
 const scene=new T.Scene(),texture=new T.Texture(),old=new T.BoxGeometry(),material=new T.MeshBasicMaterial({map:texture}),mesh=new T.Mesh(old,[material,material]);scene.add(mesh);
 const previous=captureSceneResources(scene),g=observed(old),t=observed(texture);mesh.geometry=new T.SphereGeometry();mesh.material=new T.MeshBasicMaterial();
 assert.deepEqual(disposeDetachedResources(previous,scene),{geometries:1,materials:1});assert.equal(g(),1);assert.equal(t(),0);
 assert.ok(old.attributes.position.count>0,'detached cached objects remain reusable');
});

test('hot removal frees owned resources immediately and ignores already removed objects',()=>{
 const scene=new T.Scene(),root=new T.Group(),geometry=new T.SphereGeometry(),material=new T.MeshBasicMaterial();root.add(new T.Mesh(geometry,material));scene.add(root);
 const g=observed(geometry),m=observed(material);
 assert.deepEqual(removeSceneObject(scene,root),{geometries:1,materials:1});assert.equal(root.parent,null);
 assert.deepEqual(removeSceneObject(scene,root),{geometries:0,materials:0});assert.equal(g(),1);assert.equal(m(),1);
});
test('batch entity removal preserves shared geometry and materials of hidden actors',()=>{
 const scene=new T.Scene(),geometry=new T.BoxGeometry(),material=new T.MeshBasicMaterial(),a=new T.Mesh(geometry,material),b=new T.Mesh(geometry,material),keep=new T.Mesh(geometry,material);
 keep.visible=false;scene.add(a,b,keep);const g=observed(geometry),m=observed(material);
 assert.deepEqual(removeSceneObjects(scene,[a,b,a]),{geometries:0,materials:0});assert.equal(g(),0);assert.equal(m(),0);assert.equal(scene.children.length,1);
 removeSceneObject(scene,keep);assert.equal(g(),1);assert.equal(m(),1);
});
