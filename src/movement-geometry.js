export function convexHull(points){
 const sorted=points.slice().sort((a,b)=>a.x-b.x||a.z-b.z).filter((p,i,a)=>!i||Math.hypot(p.x-a[i-1].x,p.z-a[i-1].z)>1e-6);
 const cross=(a,b,c)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
 const half=sequence=>{const result=[];for(const p of sequence){while(result.length>1&&cross(result.at(-2),result.at(-1),p)<=1e-8)result.pop();result.push(p)}return result};
 if(sorted.length<3)return sorted;
 const lower=half(sorted),upper=half(sorted.slice().reverse());lower.pop();upper.pop();return lower.concat(upper);
}
export function polygonContact(polygon,x,z,radius){
 if(polygon.length<3)return null;
 let inside=true,nearest=null,best=Infinity;
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],dx=b.x-a.x,dz=b.z-a.z,len2=dx*dx+dz*dz;
  if(dx*(z-a.z)-dz*(x-a.x)<-1e-8)inside=false;
  const t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/len2)),px=a.x+dx*t,pz=a.z+dz*t,d=Math.hypot(x-px,z-pz);
  if(d<best){best=d;nearest={x:px,z:pz,nx:dz/Math.sqrt(len2),nz:-dx/Math.sqrt(len2)}};
 }
 if(!inside&&best>=radius)return null;
 const nx=!inside&&best>1e-8?(x-nearest.x)/best:nearest.nx,nz=!inside&&best>1e-8?(z-nearest.z)/best:nearest.nz;
 return {x:nearest.x,z:nearest.z,nx,nz,depth:inside?radius+best:radius-best};
}

// A persistent side target and damped velocity avoid alternating left/right nudges.
export class FriendYield {
 constructor(){this.reset()}
 reset(){this.target=null;this.vx=0;this.vz=0;this.side=1;this.blockedTime=0}
 step({x,z,playerX,playerZ,dx,dz,dt,canMove}){
  const moving=Math.hypot(dx,dz)>.05,rx=x-playerX,rz=z-playerZ,distance=Math.hypot(rx,rz);
  const length=Math.hypot(dx,dz)||1,ux=moving?dx/length:0,uz=moving?dz/length:1;
  const ahead=rx*ux+rz*uz,lateral=rx*uz-rz*ux;
  const danger=distance<1.65||(moving&&ahead>-.3&&ahead<3.3&&Math.abs(lateral)<1.85);
  if(!this.target&&danger){
   const preferred=Math.abs(lateral)>.12?Math.sign(lateral):this.side;
   for(const side of [preferred,-preferred]){
    const tx=x+uz*side*2.1,tz=z-ux*side*2.1;
    if(canMove(tx,tz)){this.target={x:tx,z:tz};this.side=side;break}
   }
   if(!this.target){const inv=distance>.001?1/distance:0,tx=x+(inv?rx*inv:uz)*1.9,tz=z+(inv?rz*inv:-ux)*1.9;if(canMove(tx,tz))this.target={x:tx,z:tz}}
  }
  if(!this.target)return {x,z,active:false,moved:false};
  const tx=this.target.x-x,tz=this.target.z-z,remaining=Math.hypot(tx,tz);
  if(remaining<.12){this.reset();return {x,z,active:true,moved:false}}
  const speed=Math.min(6.8,remaining*7),blend=1-Math.exp(-14*dt);
  this.vx+=(tx/remaining*speed-this.vx)*blend;this.vz+=(tz/remaining*speed-this.vz)*blend;
  let mx=this.vx*dt,mz=this.vz*dt;const step=Math.hypot(mx,mz);if(step>remaining){mx*=remaining/step;mz*=remaining/step}
  const count=Math.max(1,Math.ceil(Math.hypot(mx,mz)/.055));let nx=x,nz=z;
  for(let i=0;i<count;i++){const px=nx+mx/count,pz=nz+mz/count;if(!canMove(px,pz)||Math.hypot(px-playerX,pz-playerZ)<Math.min(distance,1.50)-.005)break;nx=px;nz=pz}
  const moved=Math.hypot(nx-x,nz-z)>.0001;this.blockedTime=moved?0:this.blockedTime+dt;
  if(this.blockedTime>.30)this.reset();
  return {x:nx,z:nz,active:true,moved};
 }
}
