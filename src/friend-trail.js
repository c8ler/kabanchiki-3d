export function sweptClear(a,b,blocked){
 const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.1));
 for(let i=0;i<=n;i++)if(blocked(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n))return false;return true;
}
export class FriendTrail{
 constructor(){this.points=[];this.level=null}
 reset(level){this.points=[];this.level=level}
 record(p,level){if(level!==this.level)this.reset(level);if(!Number.isFinite(p.x)||!Number.isFinite(p.z))return;const last=this.points.at(-1);if(last&&Math.hypot(last.x-p.x,last.z-p.z)<.32)return;this.points.push({x:p.x,z:p.z});if(this.points.length>256)this.points.shift()}
 target(position,goal,blocked){
  if(sweptClear(position,goal,blocked))return {...goal};
  const candidates=[];for(let i=0;i<this.points.length;i++){const p=this.points[i],d=Math.hypot(p.x-position.x,p.z-position.z);if(d<4)candidates.push({i,d})}
  candidates.sort((a,b)=>a.d-b.d||b.i-a.i);
  for(const {i}of candidates.slice(0,16)){if(!sweptClear(position,this.points[i],blocked))continue;for(let j=Math.min(this.points.length-1,i+6);j>i;j--)if(Math.hypot(this.points[j].x-position.x,this.points[j].z-position.z)>.12&&sweptClear(position,this.points[j],blocked))return {...this.points[j]};}
  return null;
 }
}
