// Shared wall visibility and bounded A* for companion navigation.
export function segmentHitsBox(a,b,box){let lo=0,hi=1;for(const axis of ['x','y','z']){const d=b[axis]-a[axis],min=box.min[axis],max=box.max[axis];if(Math.abs(d)<1e-9){if(a[axis]<min||a[axis]>max)return false;continue}let t=(min-a[axis])/d,u=(max-a[axis])/d;if(t>u)[t,u]=[u,t];lo=Math.max(lo,t);hi=Math.min(hi,u);if(lo>hi)return false}return hi>=0&&lo<=1}
// Yield after a small number of expansions so live actors cannot monopolize a frame.
export function* gridPathSearch(start,goal,blocked,{step=1,bound=42,maxNodes=12000,batchSize=32,partial=false}={}){
 const width=Math.floor(bound*2/step)+1,toCell=p=>({x:Math.max(0,Math.min(width-1,Math.round((p.x+bound)/step))),z:Math.max(0,Math.min(width-1,Math.round((p.z+bound)/step)))}),point=id=>({x:(id%width)*step-bound,z:Math.floor(id/width)*step-bound}),s=toCell(start),g=toCell(goal),sid=s.z*width+s.x,gid=g.z*width+g.x;
 const costs=new Float64Array(width*width).fill(Infinity),parents=new Int32Array(width*width).fill(-1),occupancy=new Int8Array(width*width).fill(-1),heap=[];costs[sid]=0;
 const isBlocked=id=>{if(id===sid)return false;if(occupancy[id]<0){const p=point(id);occupancy[id]=blocked(p.x,p.z)?1:0}return occupancy[id]===1};
 const push=v=>{heap.push(v);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=v.f)break;heap[i]=heap[p];i=p}heap[i]=v},pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c}heap[i]=last}return top};
 const trace=best=>{const path=[];for(let id=best;id!==sid&&id>=0;id=parents[id])path.push(point(id));path.reverse();return path};
 const estimate=id=>{const p=point(id);return Math.hypot(p.x-goal.x,p.z-goal.z)};push({id:sid,g:0,f:estimate(sid)});let best=sid,bestD=estimate(sid),visited=0,expanded=0;
 while(heap.length&&visited++<maxNodes){const cur=pop();if(cur.g!==costs[cur.id])continue;const d=estimate(cur.id);if(d<bestD){bestD=d;best=cur.id}if(cur.id===gid&&!isBlocked(gid)){best=gid;break}const x=cur.id%width,z=Math.floor(cur.id/width);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=width||nz>=width)continue;const id=nz*width+nx,cost=cur.g+Math.hypot(dx,dz)*step;if(cost>=costs[id])continue;if(isBlocked(id)||(dx&&dz&&(isBlocked(z*width+nx)||isBlocked(nz*width+x))))continue;const from=cur.id===sid?start:point(cur.id),to=point(id);let crosses=false;const slices=Math.ceil(Math.hypot(dx,dz)*step/.15);for(let i=1;i<slices;i++)if(blocked(from.x+(to.x-from.x)*i/slices,from.z+(to.z-from.z)*i/slices)){crosses=true;break}if(crosses)continue;costs[id]=cost;parents[id]=cur.id;push({id,g:cost,f:cost+estimate(id)})}if(++expanded%batchSize===0)yield partial?trace(best):null;}
 return trace(best);
}

export function findGridPath(start,goal,blocked,options){
 const search=gridPathSearch(start,goal,blocked,options);let result;
 do{result=search.next()}while(!result.done);
 return result.value;
}

export function smoothHeading(current,target,dt,rate=3.2){const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));return current+Math.max(-rate*dt,Math.min(rate*dt,delta))}
export class StableRoute{
 constructor({incremental=false}={}){this.incremental=incremental;this.pending=null;this.path=[];this.age=0;this.stuck=0;this.plans=0;this.wait=0;this.excluded=new Map()}
 next(position,goal,blocked,dt,{epoch=0,step=.8,bound=42}={}){
 this.age+=dt;this.wait=Math.max(0,this.wait-dt);for(const [key,life] of this.excluded){if(life<=dt)this.excluded.delete(key);else this.excluded.set(key,life-dt)}
 const changed=!this.goal||this.epoch!==epoch||Math.hypot(goal.x-this.goal.x,goal.z-this.goal.z)>(this.pending?8:2);
 if(changed||(!this.pending&&((this.path.length>0&&this.stuck>.65&&this.age>.8)||(this.path.length===0&&this.age>3&&this.wait<=0)))){
 if(this.stuck>.65&&this.path[0])this.excluded.set(this.key(this.path[0],step),3);
 const predicate=(x,z)=>blocked(x,z)||this.excluded.has(this.key({x,z},step)),options={step,bound,maxNodes:22000,partial:this.incremental};
 if(this.incremental){if(this.epoch!==epoch)this.path=[];this.searchStart={...position};this.pending=gridPathSearch({...position},{...goal},predicate,options)}
 else this.path=findGridPath(position,goal,predicate,options);
 this.goal={...goal};this.epoch=epoch;this.age=0;this.stuck=0;this.plans++;this.wait=this.pending||this.path.length?0:3;
 }
 if(this.pending){const result=this.pending.next();if(result.done||(!this.path.length&&result.value?.length)){
  // The actor may have followed its old route while this search was pending.
  // Adopt the nearest new waypoint only after checking its connecting segment.
  let path=result.value;
  if(path.length&&Math.hypot(position.x-this.searchStart.x,position.z-this.searchStart.z)>.06){
   let nearest=0,distance=Infinity;
   for(let i=0;i<path.length;i++){const d=Math.hypot(path[i].x-position.x,path[i].z-position.z);if(d<distance){nearest=i;distance=d}}
   let safe=distance<=step*2;
   if(safe){const p=path[nearest],slices=Math.max(1,Math.ceil(distance/.15));for(let i=1;i<=slices;i++)if(blocked(position.x+(p.x-position.x)*i/slices,position.z+(p.z-position.z)*i/slices)){safe=false;break}}
   path=safe?path.slice(nearest):this.path;
  }
  this.path=path;if(result.done){this.pending=null;this.stuck=0;this.age=0;this.wait=this.path.length?0:3}
 }}
 while(this.path.length&&Math.hypot(position.x-this.path[0].x,position.z-this.path[0].z)<.06)this.path.shift();
 return this.path[0]||null;
 }
 key(p,step){return Math.round(p.x/step)+','+Math.round(p.z/step)}
 record(distance,dt){this.stuck=distance>.002?0:this.stuck+dt}
}

 // Escape a conservative navigation mask without ignoring physical collision.
 // Keep the capsule heading fixed and validate every slice of the translation.
export function findClearEscape(start,blocked,clear,{step=.3,range=4.2}={}){
 for(let r=step;r<=range+1e-8;r+=step)for(let k=0;k<24;k++){
  const angle=k*Math.PI/12,q={x:start.x+Math.sin(angle)*r,z:start.z+Math.cos(angle)*r};
  if(blocked(q.x,q.z))continue;
  const count=Math.ceil(r/.055);let safe=true;
  for(let i=1;i<=count;i++)if(!clear(start.x+(q.x-start.x)*i/count,start.z+(q.z-start.z)*i/count)){safe=false;break;}
  if(safe)return q;
 }
 return null;
}
