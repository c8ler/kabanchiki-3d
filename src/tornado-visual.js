import * as T from '../vendor/three/three.module.min.js';
import {orbitPose} from './tornado-rules.js?v=212';
export class TornadoVisual{
 constructor(scene,mobile=false){this.root=new T.Group();scene.add(this.root);this.root.visible=false;this.items=[];this.dummy=new T.Object3D();
 const haze=new T.Mesh(new T.CylinderGeometry(5.3,.55,16,20,1,true),new T.MeshBasicMaterial({color:0x8a969b,transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false}));haze.position.y=8;this.root.add(haze);this.haze=haze;
 this.rings=new T.InstancedMesh(new T.TorusGeometry(1,.1,4,20),new T.MeshBasicMaterial({color:0xb3b9b5,transparent:true,opacity:.38,depthWrite:false}),24);this.rings.frustumCulled=false;this.root.add(this.rings);
 this.debris=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshLambertMaterial({color:0xffffff}),96);this.debris.instanceMatrix.setUsage(T.DynamicDrawUsage);this.debris.frustumCulled=false;this.debris.count=0;scene.add(this.debris);this.capacity=mobile?12:24;
 }
 reset(){this.root.visible=false;this.items.length=0;this.debris.count=0}
 capture(kind,now,size=1){if(this.items.length>=this.capacity)return false;this.items.push({kind,start:now,size:Math.max(.25,Math.min(2,size)),index:this.items.length});return true}
 update(now,eye,ground=0){this.root.visible=eye.active;this.debris.visible=eye.active;if(!eye.active)return;this.root.position.set(eye.x,ground,eye.z);this.haze.rotation.y=now*.8;
 for(let i=0;i<24;i++){const y=.25+i*.66,r=.55+y*.29,a=now*3-i*.6;this.dummy.position.set(Math.cos(a)*r*.12,y,Math.sin(a)*r*.12);this.dummy.rotation.set(Math.PI/2,0,a);this.dummy.scale.set(r,r,.75);this.dummy.updateMatrix();this.rings.setMatrixAt(i,this.dummy.matrix)}this.rings.instanceMatrix.needsUpdate=true;
 this.items=this.items.filter(q=>now-q.start<7);let n=0;const color=new T.Color();
 for(const q of this.items){const p=orbitPose(eye,now-q.start,q.index),shapes=q.kind==='tree'?[[0,.5,0,.24,2,.24,0x70533c],[0,1.5,0,1.6,1.2,1.6,0x497746]]:q.kind==='house'?[[0,0,0,2,.18,1.5,0x966b42],[0,.6,0,1.7,.2,1.7,0xa46146],[.7,.3,0,.18,1.1,1.5,0x966b42]]:[[0,0,0,q.kind==='food'?.35:1,.6,1,q.kind==='rock'?0x879095:0x98633f]];
 for(const [x,y,z,sx,sy,sz,c] of shapes){this.dummy.position.set(p.x+x,ground+p.y+y,p.z+z);this.dummy.rotation.set(p.angle*.7,p.angle,p.angle*.4);this.dummy.scale.set(sx*q.size,sy*q.size,sz*q.size);this.dummy.updateMatrix();this.debris.setMatrixAt(n,this.dummy.matrix);this.debris.setColorAt(n++,color.setHex(c))}}
 this.debris.count=n;this.debris.instanceMatrix.needsUpdate=true;if(this.debris.instanceColor)this.debris.instanceColor.needsUpdate=true;
 }
}
