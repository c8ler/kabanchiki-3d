import * as T from '../vendor/three/three.module.min.js';
export class CraftDebris{
 constructor(scene,{mobile=false}={}){this.scene=scene;this.capacity=mobile?96:160;this.perObject=mobile?12:18;this.items=[];this.mesh=null;this.dummy=new T.Object3D();this.serial=0}
 ready(){if(this.mesh)return;this.mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshLambertMaterial({color:0xffffff}),this.capacity);this.mesh.name='craft-destruction-debris';this.mesh.frustumCulled=false;this.mesh.count=0;this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.scene.add(this.mesh)}
 emit(root,cause='tornado',eye=null){
  this.ready();root.updateWorldMatrix(true,true);let count=0;
  root.traverse(m=>{
   if(!m.isMesh||count>=this.perObject||m.userData.firePhase!==undefined)return;for(let q=m;q&&q!==root;q=q.parent)if(!q.visible)return;
   const bounds=new T.Box3().setFromObject(m),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
   if(bounds.isEmpty()||size.lengthSq()<.002)return;
   const split=Math.min(3,Math.max(1,Math.ceil(Math.max(size.x,size.y,size.z)/1.7))),axis=size.x>=size.y&&size.x>=size.z?'x':size.y>=size.z?'y':'z';
   for(let j=0;j<split&&count<this.perObject;j++){
    const p=center.clone(),s=size.clone();s[axis]/=split;p[axis]+=(j-(split-1)/2)*s[axis];
    for(const a of ['x','y','z'])s[a]=Math.max(.07,Math.min(1.9,s[a]));
    const angle=++this.serial*2.399,dx=eye?eye.x-p.x:Math.sin(angle),dz=eye?eye.z-p.z:Math.cos(angle),len=Math.max(1,Math.hypot(dx,dz)),speed=cause==='fire'?1.2:3.4;
    const color=m.material?.color?.clone()||new T.Color(0x76533a);
    if(cause==='fire')color.multiplyScalar(.45);
    this.items.push({p,s,v:new T.Vector3(dx/len*speed+Math.cos(angle),cause==='fire'?1.5:5+this.serial%3,dz/len*speed+Math.sin(angle)),r:new T.Vector3(),spin:angle,age:0,cause,eye:eye?{x:eye.x,z:eye.z}:null,color});
    if(this.items.length>this.capacity)this.items.shift();count++;
   }
  });
  return count;
 }
 clear(){this.items.length=0;if(this.mesh)this.mesh.count=0}
 update(dt,ground){
  dt=Math.min(.05,Math.max(0,dt));for(const q of this.items){
   q.age+=dt;
   if(q.cause==='tornado'&&q.eye&&q.age<1.8){const dx=q.eye.x-q.p.x,dz=q.eye.z-q.p.z,d=Math.max(1,Math.hypot(dx,dz));q.v.x+=(dx-dz)*dt*2/d;q.v.z+=(dz+dx)*dt*2/d;q.v.y+=dt*3}
   q.v.y-=dt*8;q.p.addScaledVector(q.v,dt);const floor=ground(q.p.x,q.p.z)+q.s.y*.35;
   if(q.p.y<floor){q.p.y=floor;q.v.y=Math.abs(q.v.y)>.8?Math.abs(q.v.y)*.2:0;q.v.x*=.65;q.v.z*=.65}else{q.r.x+=dt*2;q.r.z+=dt*(q.spin%3-1.5)}
  }
  this.items=this.items.filter(q=>q.age<20);
  if(!this.mesh)return;this.mesh.count=this.items.length;
  this.items.forEach((q,i)=>{this.dummy.position.copy(q.p);this.dummy.rotation.set(q.r.x,q.spin,q.r.z);this.dummy.scale.copy(q.s).multiplyScalar(Math.min(1,(20-q.age)/2));this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix);this.mesh.setColorAt(i,q.color)});
  this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;
 }
}
