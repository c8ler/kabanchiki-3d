// Island-only flight: launched by a tornado, ended by a deliberate landing.
export class IslandFlight{
 constructor(){this.stop()}
 start(){this.active=true;this.launch=1.5;this.lift=0;this.landing=false}
 stop(){this.active=false;this.launch=0;this.lift=0;this.landing=false}
 land(){if(this.active){this.landing=true;this.launch=this.lift=0}}
 step(seconds,{rise=false,pulse=false,down=false}={}){
  if(!this.active)return 0;
  const dt=Math.min(.05,Math.max(0,Number.isFinite(seconds)?seconds:0));
  if(pulse)this.lift=.65;
  if(rise||pulse){this.landing=false;this.launch=0}
  const speed=down||this.landing?-4:rise||this.lift>0?5:this.launch>0?6:0;
  this.launch=Math.max(0,this.launch-dt);this.lift=Math.max(0,this.lift-dt);
  return speed;
 }
}
