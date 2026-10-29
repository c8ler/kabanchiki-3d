export function parseCheatCode(value){
 const code=String(value??'').trim().toLowerCase().replace(/\s+/g,'');
 if(['sandbox','secret','level7','остров','песочница','секрет'].includes(code))return {type:'sandbox'};
 const action={craft:'craft',крафт:'craft',home:'home',дом:'home',supplies:'supplies',припасы:'supplies',spawncat:'spawnCat',spider:'spawnSpider',spiders:'spawnSpider',паук:'spawnSpider',пауки:'spawnSpider',котики:'spawnCat',dog:'spawnDog',собака:'spawnDog',friend:'friend',друг:'friend',clear:'clear',очистить:'clear',heal:'heal',здоровье:'heal'}[code];if(action)return {type:action};
 const match=/^(?:level|уровень)([1-6])$/.exec(code);
 if(match)return {type:'level',level:Number(match[1])};
 if(['bomb','бомба','бомбочка'].includes(code))return {type:'bomb'};
 if(['light','фонарь','flashlight'].includes(code))return {type:'light'};
 if(['boar','кабан','кабанчик'].includes(code))return {type:'form',form:'boar'};
 if(['cat','кот','котик'].includes(code))return {type:'form',form:'cat'};
 if(['timur','тимур'].includes(code))return {type:'form',form:'human'};
 return null;
}
