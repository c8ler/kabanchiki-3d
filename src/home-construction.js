export const HOME_SITE={x:-31,z:31};
export const WOOD_PILES=[{x:-35,z:24},{x:-23,z:34},{x:-36,z:36}];
export class HomeConstruction{
 constructor(saved={}){this.stage=Number.isInteger(saved.stage)?Math.max(0,Math.min(3,saved.stage)):0;this.collected=Array.from({length:3},(_,i)=>saved.collected?.[i]===true);this.wood=Math.max(0,this.collected.filter(Boolean).length*2-this.stage*2)}
 collect(i){if(i<0||i>=3||this.collected[i])return false;this.collected[i]=true;this.wood+=2;return true}
 build(){if(this.stage>=3||this.wood<2)return false;this.wood-=2;this.stage++;return true}
 save(){return {stage:this.stage,collected:this.collected.slice()}}
}
