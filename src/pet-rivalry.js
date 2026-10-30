// One shared encounter clock: partners alternate roles instead of both following.
export const PET_CHASE_SPEED={cat:5.4,dog:5.0},PET_PLAY_TURN=6.2;
export class PetRivalry{
 constructor(){this.time=0;this.phase=-1;this.fleeGoal=null;this.think=0;this.center=null;this.serial=0}
 reset(){this.time=0;this.phase=-1;this.fleeGoal=null;this.think=0;this.center=null}
 update(dt,cat,dog,{blocked=()=>false,ground=()=>0,anchor=null}={}){
 this.time+=Math.max(0,Math.min(.05,dt));const t=this.time%16,phase=t<6?0:t<7?1:t<13?2:t<14?3:4;
 this.center??={x:(cat.x+dog.x)/2,z:(cat.z+dog.z)/2};if(anchor&&Math.hypot(this.center.x-anchor.x,this.center.z-anchor.z)>12){this.center.x+=(anchor.x-this.center.x)*Math.min(1,dt*.5);this.center.z+=(anchor.z-this.center.z)*Math.min(1,dt*.5)}
 if(phase!==this.phase){this.phase=phase;this.fleeGoal=null;this.think=0}
 const d=Math.hypot(cat.x-dog.x,cat.z-dog.z),catChases=phase===2,prey=catChases?dog:cat,hunter=catChases?cat:dog;
 const base={cat:{active:false},dog:{active:false},phase:phase===4?'rest':phase===1||phase===3?'spar':catChases?'catChase':'dogChase'};
 if(phase===4){base.cat={active:true,kind:'rest',goal:{x:cat.x,z:cat.z},speed:0,stop:.3,partner:dog,hop:0,swipe:0};base.dog={active:true,kind:'rest',goal:{x:dog.x,z:dog.z},speed:0,stop:.3,partner:cat,hop:0,swipe:0};return base}
 const safe=(x,z)=>Math.abs(x)<39&&Math.abs(z)<39&&Math.hypot(x-this.center.x,z-this.center.z)<12&&!blocked(x,z,ground(x,z),.48,1.3);
 if(phase===1||phase===3){const dx=(cat.x-dog.x)/Math.max(.01,d),dz=(cat.z-dog.z)/Math.max(.01,d),mid={x:(cat.x+dog.x)/2,z:(cat.z+dog.z)/2};for(const [kind,sign,other]of [['cat',1,dog],['dog',-1,cat]]){const current=kind==='cat'?cat:dog,goal={x:mid.x+dx*sign*.75,z:mid.z+dz*sign*.75};base[kind]={active:true,kind:'spar',goal:safe(goal.x,goal.z)?goal:{x:current.x,z:current.z},speed:3.2,stop:.15,partner:other,hop:Math.max(0,Math.sin((t%1)*Math.PI*2))* .2,swipe:Math.sin(this.time*24)}}
 return base}
 this.think-=dt;
 if(!this.fleeGoal||this.think<=0||Math.hypot(prey.x-this.fleeGoal.x,prey.z-this.fleeGoal.z)<1){this.think=1.2;const away=Math.atan2(prey.x-hunter.x,prey.z-hunter.z),bend=Math.sin(this.serial++*2.4)*1.1;let found=null;
 for(const turn of [bend,bend+.9,bend-.9,1.8,-1.8,Math.PI]){const a=away+turn,x=prey.x+Math.sin(a)*5,z=prey.z+Math.cos(a)*5;if(!safe(x,z))continue;const slices=10;let clear=true;for(let i=1;i<=slices;i++){const k=i/slices,px=prey.x+(x-prey.x)*k,pz=prey.z+(z-prey.z)*k;if(blocked(px,pz,ground(px,pz),.4,1.3)){clear=false;break}}if(clear){found={x,z};break}}
 this.fleeGoal=found||{x:this.center.x,z:this.center.z}}
 const dx=(hunter.x-prey.x)/Math.max(.01,d),dz=(hunter.z-prey.z)/Math.max(.01,d),huntGoal={x:prey.x+dx*1.05,z:prey.z+dz*1.05},burst=.88+.12*Math.max(0,Math.sin(this.time*5)),catPrey=!catChases;
 base.cat={active:true,kind:catPrey?'run':'chase',goal:catPrey?this.fleeGoal:huntGoal,speed:PET_CHASE_SPEED.cat*burst,stop:.35,partner:dog,hop:0,swipe:0};
 base.dog={active:true,kind:catPrey?'chase':'run',goal:catPrey?huntGoal:this.fleeGoal,speed:PET_CHASE_SPEED.dog*burst,stop:.35,partner:cat,hop:0,swipe:0};
 return base;
 }
}
