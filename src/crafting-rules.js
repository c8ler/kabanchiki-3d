export const BOMB_FUSE=4,BOMB_RADIUS=6;
export const RECIPES={
 bomb:{name:'Бомбочка',wood:2,food:1},lamp:{name:'Фонарик',wood:1,food:1},aid:{name:'Аптечка',wood:0,food:2},
 wool:{name:'Шерсть · покормить и вычесать',wood:0,food:1,category:'materials'},
 cat:{name:'Котик',wood:1,food:2,wool:1,category:'living'},human:{name:'Человек',wood:2,food:2,wool:2,category:'living'},dog:{name:'Собака',wood:1,food:2,wool:1,category:'living'},worm:{name:'Червячок',wood:0,food:1,category:'living'},snail:{name:'Улитка',wood:1,food:1,category:'living'},
 backpack:{name:'Рюкзак · +6 мест для еды',wood:1,food:0,wool:2,category:'equipment'},
 house:{name:'Домик с дверным проёмом',wood:6,food:0,category:'building'},block:{name:'Блок',wood:1,food:0,category:'building'},wall:{name:'Стена',wood:2,food:0,category:'building'},floor:{name:'Пол',wood:2,food:0,category:'building'},roof:{name:'Крыша',wood:2,food:0,category:'building'},
 bed:{name:'Кровать',wood:2,food:0,wool:1,category:'furniture'},chair:{name:'Стул',wood:1,food:0,category:'furniture'},table:{name:'Стол',wood:2,food:0,category:'furniture'},standingLamp:{name:'Лампа',wood:1,food:1,category:'furniture'},wardrobe:{name:'Шкаф',wood:3,food:0,category:'furniture'},stove:{name:'Печка',wood:3,food:1,category:'furniture'},palm:{name:'Пальма',wood:1,food:1,category:'building'}
};
export function craftResult(kind,stock){const r=RECIPES[kind];if(!r||!Number.isFinite(stock.wood)||!Number.isFinite(stock.food)||stock.wood<r.wood||stock.food<r.food||(stock.wool||0)<(r.wool||0))return null;const next={...stock,wood:stock.wood-r.wood,food:stock.food-r.food,bombs:(stock.bombs||0)+(kind==='bomb'?1:0)};if(r.wool||kind==='wool')next.wool=(stock.wool||0)-(r.wool||0)+(kind==='wool'?2:0);return next}
export function blastDamage(distance,maxHealth=4){return distance>=BOMB_RADIUS?0:Math.max(1,Math.ceil(maxHealth*(1-distance/BOMB_RADIUS)))}
export function advanceFuse(left,dt){return Math.max(0,left-Math.max(0,dt))}
