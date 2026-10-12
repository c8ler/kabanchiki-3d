import * as THREE from '../vendor/three/three.module.min.js';

function visibleInScene(mesh,scene){let node=mesh;while(node){if(!node.visible)return false;if(node===scene)return true;node=node.parent}return false}
function materialKey(m){return [m.type,m.color?.getHex(),m.map?.uuid,m.side,m.emissive?.getHex(),m.emissiveIntensity,m.roughness,m.metalness,m.depthWrite].join(':')}
function snapshots(mesh,scene){const chain=[];for(let node=mesh;node&&node!==scene;node=node.parent)chain.push({node,parent:node.parent,p:node.position.clone(),q:node.quaternion.clone(),s:node.scale.clone()});return chain}
function unchanged(chain){return chain.every(v=>v.node.parent===v.parent&&v.node.position.equals(v.p)&&v.node.quaternion.equals(v.q)&&v.node.scale.equals(v.s))}

// Originals stay in the world for physics, fire and camera fading. Only their
// rendering is replaced, and visibility is restored immediately after drawing.
export class StaticSceneryBatches{
 constructor(scene,candidates){this.scene=scene;this.groups=[];this.hidden=[];this.ownedGeometry=new Set();this.frustum=new THREE.Frustum();this.projection=new THREE.Matrix4();this.drawn=0;const groups=new Map();let box=null,cone=null;
  for(const {mesh,owner,detail=false} of candidates){if(!mesh.isMesh||mesh.isInstancedMesh||Array.isArray(mesh.material)||!visibleInScene(mesh,scene)||mesh.material.opacity<.999)continue;
   const p=mesh.geometry.parameters||{};let geometry=mesh.geometry,shape=mesh.geometry.type+JSON.stringify(p),scale=null;
   if(shape.startsWith('BoxGeometry')&&(p.widthSegments||1)===1&&(p.heightSegments||1)===1&&(p.depthSegments||1)===1){box??=new THREE.BoxGeometry(1,1,1);geometry=box;shape='box';scale=[p.width,p.height,p.depth];this.ownedGeometry.add(box)}
   else if(mesh.geometry.type==='ConeGeometry'&&p.radialSegments===5&&p.heightSegments===1&&!p.openEnded){cone??=new THREE.ConeGeometry(1,1,5);geometry=cone;shape='cone5';scale=[p.radius,p.height,p.radius];this.ownedGeometry.add(cone)}
   else if(!['CylinderGeometry','DodecahedronGeometry'].includes(mesh.geometry.type))continue;
   const key=shape+':'+materialKey(mesh.material)+':'+mesh.castShadow+':'+mesh.receiveShadow;let group=groups.get(key);if(!group){group={geometry,material:mesh.material.clone(),items:[],castShadow:mesh.castShadow,receiveShadow:mesh.receiveShadow};group.material.transparent=false;groups.set(key,group)}
   mesh.updateWorldMatrix(true,false);mesh.geometry.computeBoundingSphere();const matrix=mesh.matrixWorld.clone();if(scale)matrix.multiply(new THREE.Matrix4().makeScale(...scale));const sphere=mesh.geometry.boundingSphere.clone().applyMatrix4(mesh.matrixWorld);
   group.items.push({mesh,owner,detail,material:mesh.material,geometry:mesh.geometry,materialKey:materialKey(mesh.material),matrix,sphere,chain:snapshots(mesh,scene)});
  }
  for(const group of groups.values()){if(group.items.length<2){group.material.dispose();continue}const batch=new THREE.InstancedMesh(group.geometry,group.material,group.items.length);batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);batch.frustumCulled=false;batch.castShadow=group.castShadow;batch.receiveShadow=group.receiveShadow;batch.visible=false;batch.userData.visualBatch=true;scene.add(batch);group.batch=batch;this.groups.push(group)}
 }
 begin(camera,blocked=()=>false,detailDistance=Infinity){this.end();this.drawn=0;camera.updateMatrixWorld();this.projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);this.frustum.setFromProjectionMatrix(this.projection);
  for(const group of this.groups){let count=0;for(const item of group.items){const mesh=item.mesh;if(!visibleInScene(mesh,this.scene)||mesh.material!==item.material||mesh.geometry!==item.geometry||mesh.material.opacity<.999||materialKey(mesh.material)!==item.materialKey||mesh.userData._cameraFade||blocked(item.owner)||!unchanged(item.chain)||!this.frustum.intersectsSphere(item.sphere))continue;if(item.detail&&camera.position.distanceToSquared(item.sphere.center)>detailDistance*detailDistance){mesh.visible=false;this.hidden.push(mesh);continue}group.batch.setMatrixAt(count++,item.matrix);mesh.visible=false;this.hidden.push(mesh)}group.batch.count=count;group.batch.visible=count>0;if(count)group.batch.instanceMatrix.needsUpdate=true;this.drawn+=count}
 }
 end(){for(const mesh of this.hidden)mesh.visible=true;this.hidden.length=0;for(const group of this.groups)group.batch.visible=false}
 dispose(){this.end();for(const group of this.groups){this.scene.remove(group.batch);group.batch.dispose();group.material.dispose()}for(const geometry of this.ownedGeometry)geometry.dispose();this.groups.length=0}
}
