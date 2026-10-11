export const LOCATION_EXITS={
 3:{name:'ворота деревни',destination:'К РЕКЕ',message:'Братик открыл ворота. Теперь можно идти к реке.',kind:'gate'},
 4:{name:'подъёмный мост',destination:'В ГОРЫ',message:'Мост опущен. Дорога в горы свободна.',kind:'bridge'},
 5:{name:'каменный завал',destination:'К ЛОГОВУ',message:'Каменный завал рассыпался. Проход к логову открыт.',kind:'rocks'}
};
export class LocationExit{
 constructor(level){this.config=LOCATION_EXITS[level];this.progress=0;this.announced=false}
 update(dt,complete){if(complete)this.progress=Math.min(1,this.progress+Math.max(0,dt)/1.6);return this.progress}
 ready(complete){return !!complete&&this.progress>=1}
}
