import test from 'node:test';import assert from 'node:assert/strict';import * as T from '../vendor/three/three.module.min.js';import {fitFamilyFrame} from '../src/family-framing.js';import {projectedBox} from '../src/cinematic-tree-guard.js';
test('a tall relative and animal fit both landscape and portrait shots',()=>{for(const aspect of [1.5,.46,2.5]){
 const camera=new T.PerspectiveCamera(48,aspect,.1,100),target=new T.Vector3(.2,1.25,0);camera.position.set(2.8,1.9,4);camera.lookAt(target);
 const relative=new T.Mesh(new T.BoxGeometry(.9,3.4,.8));relative.position.set(.5,1.7,0);relative.updateMatrixWorld(true);
 const animal=new T.Mesh(new T.BoxGeometry(1.5,.8,2));animal.position.set(-1,.4,0);animal.updateMatrixWorld(true);
 fitFamilyFrame(T,camera,target,[relative,animal]);
 for(const actor of [relative,animal]){const r=projectedBox(T,new T.Box3().setFromObject(actor),camera);assert.ok(r.left>=-.83&&r.right<=.83&&r.top<=.83&&r.bottom>=-.83,JSON.stringify(r))}
 const before=camera.position.clone();fitFamilyFrame(T,camera,target,[relative,animal]);assert.ok(before.distanceTo(camera.position)<.001);
}});
