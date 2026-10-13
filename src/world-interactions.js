export function forestEdgeAt(x){const t=Math.max(0,Math.min(1,(Math.abs(x)-5.5)/36)),s=t*t*(3-2*t);return -33.2-8.2*s+.55*Math.sin(Math.abs(x)*.22)*s}
export function forestEdgeLimit(x,radius=0){const slope=(forestEdgeAt(x+.02)-forestEdgeAt(x-.02))/.04;return forestEdgeAt(x)+radius*Math.hypot(1,slope)}
export function forestEdgeBlocked(x,z,radius=0,open=false){if(open&&Math.abs(x)+radius<=5.5)return false;return z<forestEdgeLimit(x,radius)}
export class RideHop{
 constructor(){this.reset()}
 reset(){this.active=false;this.time=0;this.height=0;this.peak=0;this.duration=.9;this.target=null}
 update(dt,request=null,support=0){if(!this.active&&request){this.active=true;this.time=0;this.peak=Math.max(.9,request.height+.5);this.target=request.target}
 if(this.active){this.time=Math.min(this.duration,this.time+dt);const t=this.time/this.duration;this.height=4*this.peak*t*(1-t);if(t>=1){this.active=false;this.height=support;this.target=null}}else this.height=support;return this.height}
}
