export function findFishingWater({x,z,yaw=0,waterAt,clear=()=>true,bridge=()=>false}){
 let best=null,bestScore=Infinity;
 for(let radius=.7;radius<=5.95;radius+=.35){for(let i=0;i<64;i++){
  const angle=i*Math.PI/32,px=x+Math.sin(angle)*radius,pz=z+Math.cos(angle)*radius,w=waterAt(px,pz);
  if(!w||w.kind==='puddle'||w.depth<.04||bridge(px,pz)||!clear(px,pz,w.y))continue;
  const score=radius+.15*(1-Math.cos(angle-yaw))-.1*Math.min(.5,w.depth);
  if(score<bestScore){bestScore=score;best={x:px,z:pz,y:w.y}}
 }
 if(best)return best;
 }
 return null;
}
export function fishingCatchPosition(start,hand,age,duration=2.8){
 const t=Math.max(0,Math.min(1,age/duration)),ease=t*t*(3-2*t);
 return {x:start.x+(hand.x-start.x)*ease,y:start.y+(hand.y-start.y)*ease+Math.sin(Math.PI*t)*1.15+.12,z:start.z+(hand.z-start.z)*ease};
}
