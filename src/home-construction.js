export const HOME_SITE={x:-31,z:31};
export const WOOD_PILES=[{x:-35,z:24},{x:-23,z:34},{x:-36,z:36},{x:-25,z:24}];
export class HomeConstruction{
 constructor(saved={}){this.stage=Number.isInteger(saved.stage)?Math.max(0,Math.min(4,saved.stage)):0;this.collected=WOOD_PILES.map((_,i)=>saved.collected?.[i]===true);this.wood=Math.max(0,this.collected.filter(Boolean).length*2-this.stage*2)}
 reset(){this.stage=0;this.wood=0;this.collected=WOOD_PILES.map(()=>false)}
 collect(i){if(!Number.isInteger(i)||i<0||i>=WOOD_PILES.length||this.collected[i])return false;this.collected[i]=true;this.wood+=2;return true}
 build(){if(this.stage>=4||this.wood<2)return false;this.wood-=2;this.stage++;return true}
 save(){return {stage:this.stage,collected:this.collected.slice()}}
}
