import * as THREE from '../vendor/three/three.module.min.js';
import {convexHull} from './movement-geometry.js?v=221';
function shape(box,matrix,root){
 const points=[],world=new THREE.Box3();for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z).applyMatrix4(matrix);world.expandByPoint(p);points.push({x:p.x,z:p.z})}
 return{root,box:world,polygon:convexHull(points),exit:true};
}
function instances(mesh,first=0){mesh.geometry.computeBoundingBox();const boxes=[],matrix=new THREE.Matrix4();for(let i=first;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);boxes.push({box:mesh.geometry.boundingBox,matrix:new THREE.Matrix4().multiplyMatrices(mesh.matrixWorld,matrix)})}return boxes}
function localBounds(root){const inverse=root.matrixWorld.clone().invert(),box=new THREE.Box3();root.traverse(m=>{if(!m.isMesh)return;m.geometry.computeBoundingBox();const items=m.isInstancedMesh?instances(m):[{box:m.geometry.boundingBox,matrix:m.matrixWorld}];for(const q of items)box.union(q.box.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,q.matrix)))});return box}
export function exitObstacleShapes(props){
 const barrier=props?.userData.exitBarrier;if(!props?.visible||!barrier)return [];
 props.updateWorldMatrix(true,true);const result=[],addMesh=(mesh,first=0)=>{for(const q of mesh.isInstancedMesh?instances(mesh,first):[{box:(mesh.geometry.computeBoundingBox(),mesh.geometry.boundingBox),matrix:mesh.matrixWorld}])result.push(shape(q.box,q.matrix,props))};
 for(const q of barrier.parts){
  if(barrier.kind==='gate')result.push(shape(localBounds(q.mesh),q.mesh.matrixWorld,props));
  else if(barrier.kind==='bridge'){for(const mesh of q.mesh.children)if(mesh.isInstancedMesh)addMesh(mesh,barrier.root.userData.open?18:0)}
  else addMesh(q.mesh);
 }
 for(const child of barrier.root.children)if(child.isInstancedMesh)addMesh(child);
 if(props.userData.exitFence)addMesh(props.userData.exitFence);
 return result;
}
