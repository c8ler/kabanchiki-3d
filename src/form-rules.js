export const CAT_BERRY_CHANCE=1/20;
export const CAT_FORM_SECONDS=30;
export const CAT_JUMP_SPEED=14;
export const isCatBerryRoll=roll=>roll>=0&&roll<CAT_BERRY_CHANCE;
export const formTimeAfterStep=(seconds,dt)=>Math.max(0,seconds-Math.max(0,dt));
