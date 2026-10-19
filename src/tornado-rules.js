export const TORNADO_START=300,TORNADO_WARNING=240,TORNADO_CAPTURE=3.8,TORNADO_REACH=12;
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
 reset(){this.active=false;this.warned=false;this.x=22;this.z=-6;this.age=0;this.sweep=0}
 step(dt,seconds,level,player){const state=stormClock(seconds,level);let warning=false,spawn=false;if(state.visible&&state.warning&&!this.warned){warning=this.warned=true}if(!state.visible){this.active=false;return {warning,spawn}}if(state.active&&!this.active){spawn=this.active=true;this.x=player.x>=0?-22:22;this.z=-6;this.age=0}if(this.active){this.age+=Math.max(0,dt);this.x+=(Math.cos(this.age*.065)*22-this.x)*Math.min(1,dt*.08);this.z+=(Math.sin(this.age*.065)*24-6-this.z)*Math.min(1,dt*.08)}return {warning,spawn}}
}
