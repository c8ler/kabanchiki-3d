export const BOAR_MAX_WATER_DEPTH=.35;
export function attacksPlayer(boarFormTime){return boarFormTime<=0}
export function shallowStepAllowed(currentDepth,nextDepth){return nextDepth<=BOAR_MAX_WATER_DEPTH||nextDepth<currentDepth-1e-5}
export function capsuleAt(x,z,yaw=0,scale=1){const ux=Math.sin(yaw),uz=Math.cos(yaw);return {ax:x-ux*.65*scale,az:z-uz*.65*scale,bx:x+ux*.90*scale,bz:z+uz*.90*scale,r:.75*scale}}
export function capsuleCircleContact(body,x,z,radius){
 const dx=body.bx-body.ax,dz=body.bz-body.az,len2=dx*dx+dz*dz;
 const t=len2>1e-12?Math.max(0,Math.min(1,((x-body.ax)*dx+(z-body.az)*dz)/len2)):0;
 const px=body.ax+dx*t,pz=body.az+dz*t,rx=px-x,rz=pz-z,distance=Math.hypot(rx,rz),need=body.r+radius;
 if(distance>=need)return null;
 const length=Math.sqrt(len2);return {nx:distance>1e-8?rx/distance:length>1e-8?dz/length:1,nz:distance>1e-8?rz/distance:length>1e-8?-dx/length:0,depth:need-distance};
}
export function capsuleCapsuleContact(a,b){
 const ux=a.bx-a.ax,uz=a.bz-a.az,vx=b.bx-b.ax,vz=b.bz-b.az,rx=a.ax-b.ax,rz=a.az-b.az;
 const aa=ux*ux+uz*uz,bb=ux*vx+uz*vz,ee=vx*vx+vz*vz,cc=ux*rx+uz*rz,ff=vx*rx+vz*rz,denom=aa*ee-bb*bb;
 if(aa<1e-12){const q=capsuleCircleContact(b,a.ax,a.az,a.r);return q?{nx:-q.nx,nz:-q.nz,depth:q.depth}:null}
 if(ee<1e-12)return capsuleCircleContact(a,b.ax,b.az,b.r);
 const clamp=v=>Math.max(0,Math.min(1,v));let s=denom>1e-8?clamp((bb*ff-cc*ee)/denom):0,t=(bb*s+ff)/ee;
 if(t<0){t=0;s=clamp(-cc/aa)}else if(t>1){t=1;s=clamp((bb-cc)/aa)}
 let dx=a.ax+ux*s-b.ax-vx*t,dz=a.az+uz*s-b.az-vz*t;const distance=Math.hypot(dx,dz),need=a.r+b.r;
 if(distance>=need)return null;
 if(distance<1e-8){dx=(a.ax+a.bx-b.ax-b.bx)/2;dz=(a.az+a.bz-b.az-b.bz)/2;if(Math.hypot(dx,dz)<1e-8){dx=uz;dz=-ux}}
 const length=Math.hypot(dx,dz);return {nx:dx/length,nz:dz/length,depth:need-distance};
}
