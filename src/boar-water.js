export const BOAR_WADING_DEPTH=.65,BOAR_AIR_SECONDS=8;
export function boarWaterStep(current,next){return next<=BOAR_WADING_DEPTH||next<=current+1e-5}
export function updateBoarBreath(actor,depth,dt,scale=1){
 const submerged=depth>.95*scale;
 actor.underwaterSeconds=submerged?(actor.underwaterSeconds||0)+dt:Math.max(0,(actor.underwaterSeconds||0)-dt*3);
 actor.waterDamageClock=submerged?Math.max(0,(actor.waterDamageClock||0)-dt):0;
 if(actor.underwaterSeconds>BOAR_AIR_SECONDS&&actor.waterDamageClock<=0){actor.waterDamageClock=3;return true}return false;
}
export function shoreGoal(x,z,depthAt,blocked=()=>false){
 let best=null;for(let r=1;r<=28;r+=1)for(let i=0;i<32;i++){const a=i*Math.PI/16,px=x+Math.sin(a)*r,pz=z+Math.cos(a)*r;
 if(depthAt(px,pz)<=.25&&!blocked(px,pz)){return {x:px,z:pz}}}return best;
}
