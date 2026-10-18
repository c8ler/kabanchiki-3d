import * as THREE from '../vendor/three/three.module.min.js';
const cube=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
function boxes(parent,material,items){const mesh=new THREE.InstancedMesh(cube,material,items.length);for(let i=0;i<items.length;i++){const [x,y,z,sx,sy,sz]=items[i];dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)}mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
export function makeExitBarrier(parent,kind,z,mats){
 const root=new THREE.Group();parent.add(root);root.userData.kind=kind;const parts=[];
 if(kind==='gate'){
  for(const side of [-1,1]){const hinge=new THREE.Group();hinge.position.set(side*5.4,0,z);root.add(hinge);const items=[];for(let i=0;i<9;i++)items.push([-side*(.35+i*.59),1.05,0,.22,2.1,.18]);for(const y of [.55,1.55])items.push([-side*2.7,y,0,5.4,.18,.22]);boxes(hinge,mats.wood,items);parts.push({mesh:hinge,side})}
  boxes(root,mats.stone,[[-5.65,1.45,z,.6,2.9,.7],[5.65,1.45,z,.6,2.9,.7]]);
 }else if(kind==='bridge'){
  const deck=new THREE.Group();deck.position.set(0,.26,z);root.add(deck);const items=[];for(let i=0;i<18;i++)items.push([0,0,-.22-i*.44,10.8,.22,.4]);for(const x of [-5.2,5.2]){items.push([x,.65,-4,.16,.16,8]);for(let i=0;i<6;i++)items.push([x,.32,-.3-i*1.4,.16,.75,.16]);}boxes(deck,mats.wood,items);parts.push({mesh:deck});
  boxes(root,mats.stone,[[-5.8,1,z,.8,2,.9],[5.8,1,z,.8,2,.9]]);
 }else{
  const geo=new THREE.DodecahedronGeometry(1,0);for(let i=0;i<9;i++){const mesh=new THREE.Mesh(geo,mats.stone),x=(i%5-2)*1.95,y=i<5?.65:1.9,zz=z+(i%2)*.35;mesh.position.set(x,y,zz);mesh.scale.set(1.25,.9+(i%3)*.12,1);root.add(mesh);parts.push({mesh,x,y,z:zz,side:x<0?-1:1,index:i})}
 }
 if(kind==='gate')boxes(root,mats.wood,[[0,3.1,z,11.6,.32,.5]]);
 return {root,kind,parts};
}
export function animateExitBarrier(barrier,progress){
 const t=Math.max(0,Math.min(1,progress)),k=t*t*(3-2*t);
 for(const q of barrier.parts)if(barrier.kind==='gate')q.mesh.rotation.y=q.side*k*Math.PI*.48;
 else if(barrier.kind==='bridge')q.mesh.rotation.x=(1-k)*Math.PI/2;
 else{q.mesh.position.set(q.x+(q.side*(6.4+q.index*.2)-q.x)*k,q.y+(.65-q.y)*k+Math.sin(k*Math.PI)*.5,q.z-k*(1+q.index*.12));q.mesh.rotation.z=q.side*k*.8;q.mesh.rotation.y=k*(q.index+1)}
 barrier.root.userData.open=t>=1;
}
export function makeExitFence(parent,z,mats){const items=[];parent.userData.fenceExtent={left:-48,right:48,opening:11};for(const side of [-1,1]){for(const y of [.65,1.55])items.push([side*26.75,y,z,42.5,.22,.22]);for(let x=5.5;x<=48;x+=2.5)items.push([side*x,1.05,z,.2,2.1,.2]);}return boxes(parent,mats.wood,items)}
export function refreshExitLandscape(root,heightAt){for(const {mesh,lift} of root.userData.surfaces||[]){const pos=mesh.geometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,heightAt(Math.max(-42,Math.min(42,pos.getX(i))),Math.max(-43,Math.min(42,pos.getZ(i))))+lift);pos.needsUpdate=true;mesh.geometry.computeVertexNormals();}}
export function buildExitLandscape(parent,level,mats,heightAt=()=>0){
 const root=new THREE.Group();root.userData.surfaces=[];root.userData.destination=['','lake','village','river','mountains','lair'][level];root.userData.trailRange={near:-34,far:-72};parent.add(root);
 // The path and surrounding land share sampled edge heights: no detached rectangle.
 const groundMat=new THREE.MeshLambertMaterial({color:level>=4?0x737c6c:0x779752}),roadMat=mats.path;
 root.userData.groundMaterial=groundMat;
 const points=[{x:0,z:-34,w:5.7},{x:0,z:-42,w:5.7},{x:1,z:-50,w:5.1},{x:3,z:-60,w:4.5},{x:6,z:-72,w:3.6}];
 const vertices=[],land=[];const height=(x,z)=>heightAt(Math.max(-42,Math.min(42,x)),Math.max(-43,Math.min(42,z)));
 for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];for(const target of [vertices,land]){const wide=target===land?42:null;const al=a.x-(wide||a.w),ar=a.x+(wide||a.w),bl=b.x-(wide||b.w),br=b.x+(wide||b.w),lift=target===land?-.025:.025;target.push(al,height(al,a.z)+lift,a.z,ar,height(ar,a.z)+lift,a.z,br,height(br,b.z)+lift,b.z,al,height(al,a.z)+lift,a.z,br,height(br,b.z)+lift,b.z,bl,height(bl,b.z)+lift,b.z)}}
 for(const [data,material] of [[land,groundMat],[vertices,roadMat]]){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(data,3));geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,material);mesh.material.side=THREE.DoubleSide;mesh.receiveShadow=true;root.add(mesh);root.userData.surfaces.push({mesh,lift:data===land?-.025:.025});if(data===vertices)root.userData.trail=mesh}
 if(level===1||level===3||level===4){
  const water=new THREE.Mesh(new THREE.PlaneGeometry(82,level===4?6:18),new THREE.MeshLambertMaterial({color:0x5c9eae}));
  water.rotation.x=-Math.PI/2;water.position.set(0,.04,level===4?-41:level===3?-62:-65);root.add(water);root.userData.water=water;root.userData.waterMaterial=water.material;if(level===3)boxes(root,mats.wood,[[3,.22,-62,10,.26,20],[-2.2,.75,-62,.18,.18,20],[8.2,.75,-62,.18,.18,20]]);
 }
 if(level===2){
  const homes=[];for(const side of [-1,1])for(let i=0;i<3;i++){const x=side*(12+i*7),z=-53-i*4;homes.push([x,1.6,z,5,3.2,4],[x,3.45,z,5.7,.5,4.8]);}boxes(root,mats.wood,homes);
  boxes(root,mats.leaf,[[14,4,-56,5,2,5],[-20,4,-61,5,2,5],[24,5,-64,6,3,6]]);
 }else if(level>=4){
  const geometry=new THREE.ConeGeometry(1,1,5),peaks=new THREE.InstancedMesh(geometry,mats.stone,10);
  for(let i=0;i<10;i++){const side=i%2?1:-1;dummy.position.set(side*(12+(i%5)*7),3.2+(i%3),-52-Math.floor(i/2)*5);dummy.rotation.set(0,i*.7,0);dummy.scale.set(8+(i%3),8+(i%4)*2,7);dummy.updateMatrix();peaks.setMatrixAt(i,dummy.matrix)}peaks.instanceMatrix.needsUpdate=true;root.add(peaks);
  if(level===5){boxes(root,mats.stone,[[-.6,2.1,-66,3,4.2,3],[7,2.1,-66,3,4.2,3],[3.2,4.4,-66,11,1.6,3]]);const dark=new THREE.Mesh(cube,new THREE.MeshBasicMaterial({color:0x171c22}));dark.position.set(3.2,1.9,-67);dark.scale.set(5,3.8,.3);root.add(dark);}
 }
 const oldTrail=parent.userData.trail;if(oldTrail){oldTrail.removeFromParent();oldTrail.geometry.dispose();}parent.userData.trail=root.userData.trail;parent.userData.exitLandscape=root;return root;
}
