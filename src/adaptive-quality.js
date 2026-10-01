export const GRAPHICS_TIERS = [
 {name:'Низкая',pixelRatio:.65,shadows:false,shadowSize:512,grass:.20,particles:.35,clouds:.45},
 {name:'Средняя',pixelRatio:1,shadows:false,shadowSize:512,grass:.45,particles:.60,clouds:.65},
 {name:'Высокая',pixelRatio:1.5,shadows:true,shadowSize:1024,grass:.75,particles:.85,clouds:.85},
 {name:'Максимальная',pixelRatio:2,shadows:true,shadowSize:2048,grass:1,particles:1,clouds:1}
];

// Two-second samples, fast degradation and slow recovery prevent quality flicker.
export class AdaptiveQuality {
 constructor({initial=2,max=3,onChange=()=>{}}={}) {
  this.max=max;this.tier=Math.min(initial,max);this.onChange=onChange;
  this.last=null;this.elapsed=0;this.frames=0;this.slow=0;this.fast=0;
  this.cooldownUntil=0;this.recoveryUntil=0;this.fps=0;
 }
 resetSample(){this.last=null;this.elapsed=0;this.frames=0;this.slow=0;this.fast=0}
 sample(now,active=true){
  if(!active){this.resetSample();return}
  if(this.last===null){this.last=now;return}
  const delta=now-this.last;this.last=now;
  // Background-tab delays and loading stalls do not describe sustained rendering speed.
  if(delta<=0||delta>1000){this.resetSample();return}
  this.elapsed+=delta;this.frames++;
  if(this.elapsed<2000)return;
  const duration=this.elapsed;this.fps=this.frames*1000/duration;this.elapsed=0;this.frames=0;
  if(now<this.cooldownUntil){this.slow=0;this.fast=0;return}
  this.slow=this.fps<42?this.slow+duration:0;
  this.fast=this.fps>=57?this.fast+duration:0;
  if(this.tier>0&&(this.fps<25||this.slow>=4000)){
   this.setTier(this.tier-1,now);this.recoveryUntil=now+60000;
  }else if(this.tier<this.max&&this.fast>=20000&&now>=this.recoveryUntil){
   this.setTier(this.tier+1,now);
  }
 }
 setTier(tier,now){
  this.tier=Math.max(0,Math.min(this.max,tier));this.slow=0;this.fast=0;
  this.cooldownUntil=now+4000;this.onChange(this.tier,this.fps);
 }
}
