// Shared wall visibility and bounded A* for companion navigation.
export function segmentHitsBox(a,b,box){let lo=0,hi=1;for(const axis of ['x','y','z']){const d=b[axis]-a[axis],min=box.min[axis],max=box.max[axis];if(Math.abs(d)<1e-9){if(a[axis]<min||a[axis]>max)return false;continue}let t=(min-a[axis])/d,u=(max-a[axis])/d;if(t>u)[t,u]=[u,t];lo=Math.max(lo,t);hi=Math.min(hi,u);if(lo>hi)return false}return hi>=0&&lo<=1}
export function findGridPath(start,goal,blocked,{step=1,bound=42,maxNodes=12000}={}){
 const width=Math.floor(bound*2/step)+1,toCell=p=>({x:Math.max(0,Math.min(width-1,Math.round((p.x+bound)/step))),z:Math.max(0,Math.min(width-1,Math.round((p.z+bound)/step)))}),point=id=>({x:(id%width)*step-bound,z:Math.floor(id/width)*step-bound}),s=toCell(start),g=toCell(goal),sid=s.z*width+s.x,gid=g.z*width+g.x;
 const costs=new Float64Array(width*width).fill(Infinity),parents=new Int32Array(width*width).fill(-1),occupancy=new Int8Array(width*width).fill(-1),heap=[];costs[sid]=0;
 const isBlocked=id=>{if(id===sid)return false;if(occupancy[id]<0){const p=point(id);occupancy[id]=blocked(p.x,p.z)?1:0}return occupancy[id]===1};
 const push=v=>{heap.push(v);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=v.f)break;heap[i]=heap[p];i=p}heap[i]=v},pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c}heap[i]=last}return top};
 const estimate=id=>{const p=point(id);return Math.hypot(p.x-goal.x,p.z-goal.z)};push({id:sid,g:0,f:estimate(sid)});let best=sid,bestD=estimate(sid),visited=0;
 while(heap.length&&visited++<maxNodes){const cur=pop();if(cur.g!==costs[cur.id])continue;const d=estimate(cur.id);if(d<bestD){bestD=d;best=cur.id}if(cur.id===gid&&!isBlocked(gid)){best=gid;break}const x=cur.id%width,z=Math.floor(cur.id/width);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=width||nz>=width)continue;const id=nz*width+nx;if(isBlocked(id)||(dx&&dz&&(isBlocked(z*width+nx)||isBlocked(nz*width+x))))continue;const cost=cur.g+Math.hypot(dx,dz)*step;if(cost>=costs[id])continue;costs[id]=cost;parents[id]=cur.id;push({id,g:cost,f:cost+estimate(id)})}}
 const path=[];for(let id=best;id!==sid&&id>=0;id=parents[id])path.push(point(id));path.reverse();return path;
}

export function smoothHeading(current,target,dt,rate=3.2){const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));return current+Math.max(-rate*dt,Math.min(rate*dt,delta))}
export class StableRoute{
 constructor(){this.path=[];this.age=0;this.stuck=0;this.plans=0;this.wait=0;this.excluded=new Map()}
 next(position,goal,blocked,dt,{epoch=0,step=.8,bound=42}={}){
 this.age+=dt;this.wait=Math.max(0,this.wait-dt);for(const [key,life] of this.excluded){if(life<=dt)this.excluded.delete(key);else this.excluded.set(key,life-dt)}
 const changed=!this.goal||Math.hypot(goal.x-this.goal.x,goal.z-this.goal.z)>2||this.epoch!==epoch;
 if(changed||(this.path.length>0&&this.stuck>.65&&this.age>.8)||(this.path.length===0&&this.age>3&&this.wait<=0)){
 if(this.stuck>.65&&this.path[0])this.excluded.set(this.key(this.path[0],step),3);
 this.path=findGridPath(position,goal,(x,z)=>blocked(x,z)||this.excluded.has(this.key({x,z},step)),{step,bound,maxNodes:22000});
 this.goal={...goal};this.epoch=epoch;this.age=0;this.stuck=0;this.plans++;this.wait=this.path.length?0:3;
 }
 while(this.path.length&&Math.hypot(position.x-this.path[0].x,position.z-this.path[0].z)<.22)this.path.shift();
 return this.path[0]||null;
 }
 key(p,step){return Math.round(p.x/step)+','+Math.round(p.z/step)}
 record(distance,dt){this.stuck=distance>.002?0:this.stuck+dt}
}
