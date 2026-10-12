export function parseCheatCode(value){
 const code=String(value??'').trim().toLowerCase().replace(/\s+/g,'');
 const match=/^(?:level|уровень)([1-6])$/.exec(code);
 if(match)return {type:'level',level:Number(match[1])};
 if(['light','фонарь','flashlight'].includes(code))return {type:'light'};
 if(['boar','кабан','кабанчик'].includes(code))return {type:'form',form:'boar'};
 if(['cat','кот','котик'].includes(code))return {type:'form',form:'cat'};
 if(['timur','тимур'].includes(code))return {type:'form',form:'human'};
 return null;
}
