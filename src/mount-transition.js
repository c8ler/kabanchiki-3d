export class DismountLatch{
 constructor(){this.reset()}
 reset(){this.active=false;this.until=0}
 leave(now){this.active=true;this.until=now+650}
 observe(now,distance){if(this.active&&now>=this.until&&distance>3.1)this.reset()}
 allow(now,distance,explicit=false,grounded=false){this.observe(now,distance);if(!this.active)return true;if(now<this.until)return false;if(explicit&&grounded){this.reset();return true}return false}
}
