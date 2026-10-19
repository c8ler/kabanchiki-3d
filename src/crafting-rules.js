export const BOMB_FUSE=4,BOMB_RADIUS=6;
export const RECIPES={bomb:{name:'Бомбочка',wood:2,food:1},lamp:{name:'Фонарик',wood:1,food:1},aid:{name:'Аптечка',wood:0,food:2}};
export function craftResult(kind,stock){const r=RECIPES[kind];if(!r||stock.wood<r.wood||stock.food<r.food)return null;return {...stock,wood:stock.wood-r.wood,food:stock.food-r.food,bombs:stock.bombs+(kind==='bomb'?1:0)}}
export function blastDamage(distance,maxHealth=4){return distance>=BOMB_RADIUS?0:Math.max(1,Math.ceil(maxHealth*(1-distance/BOMB_RADIUS)))}
export function advanceFuse(left,dt){return Math.max(0,left-Math.max(0,dt))}
