import {PET_PLAY_TURN} from './pet-rivalry.js?v=222';
import * as T from '../vendor/three/three.module.min.js';
import {StableRoute} from './navigation.js?v=222';
const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function createDog(materials){
 const g=new T.Group(),legs=[],wood=materials.boar;
 const box=(m,x,y,z,w,h,d,parent=g)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);parent.add(mesh);return mesh};
 const body=box(wood,0,.62,0,.48,.45,.95),head=new T.Group();head.position.set(0,.91,.47);g.add(head);
 box(wood,0,0,0,.44,.42,.42,head);box(materials.white,0,-.09,.24,.31,.22,.27,head);box(materials.black,0,-.05,.39,.17,.12,.08,head);
 for(const side of [-1,1]){const ear=box(materials.wood,side*.25,.04,-.03,.13,.38,.25,head);ear.rotation.z=side*.2;box(materials.black,side*.15,.06,.215,.065,.075,.03,head);
  for(const front of [-1,1]){const pivot=new T.Group();pivot.position.set(side*.18,.45,front*.32);g.add(pivot);box(wood,0,-.17,0,.13,.38,.15,pivot);box(materials.white,0,-.35,.035,.15,.1,.21,pivot);legs.push(pivot)}}
 const tail=new T.Group();tail.position.set(0,.78,-.48);g.add(tail);box(wood,0,.05,-.2,.1,.12,.43,tail);tail.rotation.x=-.55;
 box(materials.gold,0,.78,.38,.51,.08,.08);g.companionRig={body,head,legs,tail};return g;
}
export class DogCompanion{
 constructor(g,home){this.g=g;this.home={...home};this.route=new StableRoute({incremental:true});this.time=0;this.steps=0;this.following=false;this.state='idle';this.goal=null;this.goalUntil=0}
 update(dt,terrain,blocked,player,epoch=0){
  dt=Math.max(0,Math.min(.05,dt));this.time+=dt;const p=this.g.position,play=this.petPlan?.active?this.petPlan:null,turnRate=play?PET_PLAY_TURN:3.2,d=Math.hypot(p.x-player.x,p.z-player.z);
  if(d>4.2)this.following=true;if(d<2.3)this.following=false;
  if(play){this.state='rival-'+play.kind;this.goal=play.goal;this.following=false}else if(this.following){this.state='follow';if(!this.goal||Math.hypot(this.goal.x-player.x,this.goal.z-player.z)>1.4){this.goal={x:player.x,z:player.z};this.route.invalidate?.()}}
  else if(this.time>this.goalUntil||!this.goal){this.state='sniff';this.goalUntil=this.time+5;const angle=this.time*.43;this.goal={x:this.home.x+Math.sin(angle)*2,z:this.home.z+Math.cos(angle)*2};if(d<2.5){this.goal={x:p.x,z:p.z};this.state='sit'}}
  let moved=0;
  if(this.goal&&Math.hypot(p.x-this.goal.x,p.z-this.goal.z)>(play?play.stop:this.following?1.8:.25)){
   const query=(x,z)=>blocked(x,z,terrain(x,z,p.y),.36,1.25),waypoint=this.route.next(p,this.goal,query,dt,{step:.7,bound:41,epoch});
   if(waypoint){const dx=waypoint.x-p.x,dz=waypoint.z-p.z,length=Math.hypot(dx,dz),desired=Math.atan2(dx,dz),turn=Math.max(-dt*turnRate,Math.min(dt*turnRate,angleDelta(this.g.rotation.y,desired)));
    this.g.rotation.y+=turn;const step=Math.min(length,dt*(play?play.speed:this.following?2.8:.8))*Math.max(0,Math.cos(angleDelta(this.g.rotation.y,desired)))*Math.min(1,length/.6);
    const x=p.x+Math.sin(this.g.rotation.y)*step,z=p.z+Math.cos(this.g.rotation.y)*step,y=terrain(x,z,p.y),reach=.4;
    if(Math.abs(y-p.y)<.3&&[0,-reach,reach].every(a=>!blocked(x+Math.sin(this.g.rotation.y)*a,z+Math.cos(this.g.rotation.y)*a,y,.28,1.25))){p.set(x,y,z);moved=step;this.steps+=step*9}this.route.record(moved,dt);
   }
  }
  const floor=terrain(p.x,p.z,p.y),hop=play?.hop||0;p.y=!hop||blocked(p.x,p.z,floor+hop,.36,1.25)?floor:floor+hop;
  const rig=this.g.companionRig;if(rig){for(let i=0;i<rig.legs.length;i++)rig.legs[i].rotation.x=moved>0?Math.sin(this.steps+(i===0||i===3?0:Math.PI))*.65:rig.legs[i].rotation.x*Math.max(0,1-dt*12);
   rig.tail.rotation.y=Math.sin(this.time*(play?17:d<5?9:4))*(play?.65:d<5?.45:.18);rig.head.rotation.x=play?.kind==='spar'?-.2:this.state==='sniff'?.3:Math.sin(this.time*.7)*.04;if(play?.kind==='spar'){rig.legs[0].rotation.x=-.8+play.swipe*.4;rig.legs[2].rotation.x=-.8-play.swipe*.4}rig.body.position.y=.62+(moved?Math.sin(this.steps*2)*(play?.08:.025):0)}
  this.moving=moved>0;return moved;
 }
}
