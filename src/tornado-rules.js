export const TORNADO_START=300,TORNADO_WARNING=240,TORNADO_CAPTURE=4.6,TORNADO_REACH=32;
export const BOAR_JUMP_SPEED=3.4;
export function stormClock(seconds,level=1){
 const next=Math.min(TORNADO_START,(Math.floor(Math.max(0,seconds)/60)+1)*60),lead=next===TORNADO_START?15:5;
 return {visible:level<6,shown:level<6&&seconds<TORNADO_START&&seconds>=next-lead,remaining:Math.max(0,TORNADO_START-seconds),warning:seconds>=TORNADO_WARNING,active:level<6&&seconds>=TORNADO_START};
}
export function windSpeedFactor(against,power){return Math.max(.84,1-Math.max(0,Math.min(1,against))*Math.max(0,Math.min(1,power))*.16)}
export function capturedByTornado(player,eye,sheltered=false){return !sheltered&&Math.hypot(player.x-eye.x,player.z-eye.z)<TORNADO_CAPTURE}
export function orbitPose(eye,age,index=0){const r=1.1+Math.min(6,age*.7)+index%3*.4,a=age*3.8+index*2.399;return {x:eye.x+Math.cos(a)*r,y:Math.max(.2,age*1.8+Math.sin(age*2+index)*.3),z:eye.z+Math.sin(a)*r,angle:a}}
export class TornadoState{
 constructor(){this.reset()}
 reset(){this.active=false;this.forcedAt=null;this.suppressed=false;this.warned=false;this.x=22;this.z=-6;this.age=0;this.sweep=0}
 schedule(seconds){if(this.active||this.forcedAt!==null)return false;this.forcedAt=seconds+15;this.suppressed=false;this.warned=true;return true}
 cancel(){this.active=false;this.forcedAt=null;this.suppressed=true}
 clock(seconds,level){if(this.suppressed)return{visible:false,shown:false,remaining:0,warning:false,active:false};if(this.forcedAt!==null)return{visible:true,shown:seconds<this.forcedAt,remaining:Math.max(0,this.forcedAt-seconds),warning:true,active:seconds>=this.forcedAt};return stormClock(seconds,level)}
 step(dt,seconds,level,player){const state=this.clock(seconds,level);let warning=false,spawn=false;if(state.visible&&state.warning&&!this.warned){warning=this.warned=true}if(!state.visible){this.active=false;return {warning,spawn}}if(state.active&&!this.active){spawn=this.active=true;this.x=player.x>=0?-22:22;this.z=-6;this.age=0}if(this.active){this.age+=Math.max(0,dt);this.x+=(Math.cos(this.age*.065)*22-this.x)*Math.min(1,dt*.08);this.z+=(Math.sin(this.age*.065)*24-6-this.z)*Math.min(1,dt*.08)}return {warning,spawn}}
}

export function tornadoInfluence(player,eye,sheltered=false){
 const dx=eye.x-player.x,dz=eye.z-player.z,d=Math.hypot(dx,dz);
 if(sheltered||!eye.active||d>=TORNADO_REACH)return {x:0,z:0,strength:0,speed:1};
 const strength=(1-d/TORNADO_REACH)**1.5,pull=1.2+strength*22,swirl=strength*5,unit=1/Math.max(.5,d);
 return {x:(dx*pull-dz*swirl)*unit,z:(dz*pull+dx*swirl)*unit,strength,speed:Math.max(.18,1-strength*.86)};
}
