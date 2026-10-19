export const PLAYER_HEIGHTS={human:1.65,cat:1.28,boar:1.5};
export function ceilingMotion(feet,velocity,nextFeet,ceiling,height=PLAYER_HEIGHTS.human){
 if(velocity>0&&Number.isFinite(ceiling)&&feet<ceiling-.03&&nextFeet+height>ceiling){
  return {feet:Math.min(nextFeet,Math.max(0,ceiling-height)),velocity:0,hit:true};
 }
 return {feet:nextFeet,velocity,hit:false};
}
