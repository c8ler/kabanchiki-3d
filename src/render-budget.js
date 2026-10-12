export function lightBudget(tier){return [2,3,4,6][Math.max(0,Math.min(3,tier))]}
export function selectEffectLights(candidates,budget){return candidates.filter(c=>c.intensity>0).sort((a,b)=>(b.primary?1000:0)+b.intensity/(1+b.distanceSquared*.025)-((a.primary?1000:0)+a.intensity/(1+a.distanceSquared*.025))).slice(0,budget)}
export class OcclusionSchedule{
 constructor(){this.last=-Infinity;this.epoch=-1;this.x=this.z=this.cx=this.cz=Infinity}
 due(now,epoch,x,z,cx,cz){const changed=epoch!==this.epoch||Math.hypot(x-this.x,z-this.z)>1.5||Math.hypot(cx-this.cx,cz-this.cz)>2;
  if(!changed&&now-this.last<100)return false;this.last=now;this.epoch=epoch;this.x=x;this.z=z;this.cx=cx;this.cz=cz;return true}
}

// Only idle, distant actors use a slower clock. Collision sweeps still run for
// every movement step, and nearby actors immediately return to the frame clock.
export function distantActorDt(actor,dt,distant){
 if(!distant){actor._distantDt=0;return dt}
 actor._distantDt=(actor._distantDt||0)+dt;
 if(actor._distantDt<.15)return 0;
 const elapsed=actor._distantDt;actor._distantDt=0;return elapsed;
}
