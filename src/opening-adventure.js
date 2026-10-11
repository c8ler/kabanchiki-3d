// A short, action-led first encounter; stages advance on player actions, never timers alone.
export class OpeningAdventure{
 constructor(){this.stage='move';this.elapsed=0;this.chasing=false;this.hit=false;this.rode=false;this.rescued=false;this.refills=0;this.passageTime=0;this.passageStarted=false;this.passageOpen=false;this.crateApples=3;this.passageBroken=false}
 update({dt=0,distance=0,friend=false,mounted=false,rescued=false}={}){
  this.elapsed+=dt;
  if(distance>2||this.elapsed>=8)this.chasing=true;
  if(mounted)this.rode=true;
  if(rescued)this.rescued=true;
  this.stage=this.rescued?'complete':this.rode&&friend?'rescue':friend?'ride':this.chasing?'feed':'move';
  return this.stage;
 }
 updatePassage(dt,{near=false,friend=false}={}){
  if(this.rescued&&near&&friend)this.passageStarted=true;
  if(this.passageStarted){this.passageTime=Math.min(2.4,this.passageTime+Math.max(0,dt));this.passageBroken=this.passageTime>=1.1;this.passageOpen=this.passageTime>=2.4}
  return this.passageTime/2.4;
 }
 collectCrate(food,max){const count=Math.min(this.crateApples,Math.max(0,max-food));this.crateApples-=count;return count}
 get canRescue(){return true}
 get complete(){return this.rescued}
}
export function openingStreamDepth(x,z){const r=(x/4.6)**2+((z+5)/1.9)**2;return r<1?.08*(1-r):0}

// A continuous thicket closes the forest edge; only its central opening is cleared.
export function forestExitBlocked(x,z,radius=0,open=false){
 if(!open)return z-radius<-33.2;
 return Math.abs(x)+radius>5.5&&z-radius<-33.2&&z+radius>-36.8;
}
