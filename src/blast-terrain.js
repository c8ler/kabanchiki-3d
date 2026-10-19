export class BlastTerrain{
 constructor(){this.levels=new Map()}
 clear(){this.levels.clear()}
 add(level,x,z,radius=3,depth=.9){let craters=this.levels.get(level);if(!craters)this.levels.set(level,craters=[]);craters.push({x,z,radius,depth});if(craters.length>40)craters.shift()}
 depression(level,x,z){let depth=0;for(const c of this.levels.get(level)||[]){const d=Math.hypot(x-c.x,z-c.z)/c.radius;if(d<1)depth=Math.max(depth,c.depth*(1-d*d)**2)}return depth}
}
export function bombFlight(start,heading,age,groundAt){
 const duration=.8,t=Math.max(0,Math.min(1,age/duration)),distance=t*9,x=Math.max(-42.5,Math.min(42.5,start.x+Math.sin(heading)*distance)),z=Math.max(-42.5,Math.min(42.5,start.z+Math.cos(heading)*distance)),ground=groundAt(x,z);
 return {x,z,y:t>=1?ground:start.y+(ground-start.y)*t+Math.sin(t*Math.PI)*2.8,landed:t>=1};
}
