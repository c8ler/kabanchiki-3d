export const CARAVAN_LEVEL=3,CARAVAN_ACTORS=4,RAID_SECONDS=4.2;
export class CaravanRaid{
 constructor(route){
  if(!Array.isArray(route)||route.length<2)throw Error('A caravan needs a route');
  this.route=route.map(p=>({...p}));this.lengths=[0];
  for(let i=1;i<route.length;i++){if(![route[i].x,route[i].z,route[i-1].x,route[i-1].z].every(Number.isFinite))throw Error('Invalid caravan route');this.lengths[i]=this.lengths[i-1]+Math.hypot(route[i].x-route[i-1].x,route[i].z-route[i-1].z)}
  this.total=this.lengths.at(-1);if(this.total<12)throw Error('Caravan route too short');
  this.distance=4;this.state='travel';this.progress=0;this.hits=0;this.rewarded=false;this.blocked=false;this.idle=0;this.age=0;
 }
 point(distance=this.distance){
  const d=Math.max(0,Math.min(this.total,distance));let i=1;while(i<this.lengths.length-1&&this.lengths[i]<d)i++;
  const a=this.route[i-1],b=this.route[i],t=(d-this.lengths[i-1])/Math.max(.0001,this.lengths[i]-this.lengths[i-1]);
  return{x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:Math.atan2(b.x-a.x,b.z-a.z)};
 }
 start({near=false,helper=false,clear=true}={}){
  if(this.state!=='travel'||!near||!helper||!clear)return false;
  this.state='raid';this.progress=0;this.hits=0;this.idle=0;return true;
 }
 open(reason='raid'){
  if(!['travel','raid'].includes(this.state))return null;
  this.state='loot';const score=0;this.rewarded=true;this.reason=reason;
  return{opened:true,score,reason};
 }
 update(dt,{blocked=()=>false,near=false,helper=false,clear=true}={}){
  const elapsed=Math.max(0,Math.min(.25,Number.isFinite(dt)?dt:0));this.age+=elapsed;
  if(this.state==='travel'){
   const next=Math.min(this.total-4,this.distance+elapsed*1.6),p=this.point(next),ahead=this.point(next+3.6);
   this.blocked=blocked(p.x,p.z)||blocked(ahead.x,ahead.z);
   if(!this.blocked)this.distance=next;
   if(this.distance>=this.total-4)this.state='gone';
  }else if(this.state==='raid'){
   if(near&&helper&&clear){this.idle=0;this.progress=Math.min(RAID_SECONDS,this.progress+elapsed);const hits=Math.min(3,Math.floor(this.progress/1.4+.00001)),hit=hits>this.hits;this.hits=hits;if(this.progress>=RAID_SECONDS-.00001)return{...this.open(),hit};return{hit}}
   else{this.idle+=elapsed;if(this.idle>=8){this.state='travel';this.progress=0;this.hits=0;return{abandoned:true}}}
  }
  return{};
 }
}
// Grounded corridor validation is shared by runtime placement and regression tests.
export function caravanRouteClear(route,blocked){
 for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],steps=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.5);for(let j=0;j<=steps;j++){const t=j/Math.max(1,steps);if(blocked(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t))return false}}
 return true;
}
export function caravanFootprint(point,x,z,radius=.4,height=0){
 if(!point||height>=3.1)return false;const dx=x-point.x,dz=z-point.z,c=Math.cos(point.yaw),s=Math.sin(point.yaw),side=dx*c-dz*s,along=dx*s+dz*c;
 return Math.abs(side)<1.2+radius&&Math.abs(along)<1.9+radius;
}
