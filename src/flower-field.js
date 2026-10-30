import * as T from '../vendor/three/three.module.min.js';
export class FlowerField{
 constructor(scene,{mobile=false}={}){this.max=mobile?18:30;this.points=[];this.geometry=new T.BoxGeometry(1,1,1);this.material=new T.MeshLambertMaterial({color:0xffffff});this.mesh=new T.InstancedMesh(this.geometry,this.material,this.max*7);this.mesh.name='sparse-flowers';this.mesh.frustumCulled=false;this.mesh.count=0;scene.add(this.mesh);this.dummy=new T.Object3D()}
 reset(level,ground,allowed,season='summer'){this.points=[];this.mesh.visible=season!=='winter'&&level!==6;if(!this.mesh.visible){this.mesh.count=0;return}let seed=level*991+71;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};let n=0;
 for(let i=0;i<100&&this.points.length<this.max;i++){const cluster=i%3,angle=random()*Math.PI*2,r=random()*5,x=[-15,14,27][cluster]+Math.cos(angle)*r,z=[18,-5,-23][cluster]+Math.sin(angle)*r;if(Math.abs(x)<5||!allowed(x,z))continue;const y=ground(x,z),height=.25+random()*.18;this.points.push({x,y:y+height,z});const parts=[[0,height/2,0,.035,height,.035,0x538252],[.08,height*.4,0,.14,.035,.08,0x75a765],[0,height,0,.1,.07,.1,0xf1d266]];
 for(let k=0;k<4;k++){const a=k*Math.PI/2;parts.push([Math.cos(a)*.095,height,Math.sin(a)*.095,.12,.035,.12,[0xc3a4de,0xf0b3bd,0xe9dfb2][cluster]])}
 for(const [dx,dy,dz,w,h,d,color] of parts){const q=this.dummy;q.position.set(x+dx,y+dy,z+dz);q.scale.set(w,h,d);q.rotation.set(0,0,0);q.updateMatrix();this.mesh.setMatrixAt(n,q.matrix);this.mesh.setColorAt(n++,new T.Color(color))}
 }this.mesh.count=n;this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true}
 nearest(p,r=20){let best=null;for(const q of this.points){const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<r){best=q;r=d}}return best}
}
