export class CampaignProgress{
 constructor(storage){this.storage=storage;let saved={};try{saved=JSON.parse(storage?.getItem('kabanchiki3d_campaign')||'{}')||{}}catch{}this.introSeen=saved.introSeen===true;this.tutorialSeen=saved.tutorialSeen===true}
 save(){try{this.storage?.setItem('kabanchiki3d_campaign',JSON.stringify({introSeen:this.introSeen,tutorialSeen:this.tutorialSeen}))}catch{}}
 sawIntro(){this.introSeen=true;this.save()}
 enteredTutorial(){this.tutorialSeen=true;this.save()}
 get firstLevel(){return this.tutorialSeen?2:1}
}
export function cinematicLines(kind,detail={}){
 if(kind==='sleep')return [['Тимур устроился на кровати братика…',0],['Глаза закрываются. Кажется, начинается необычный сон.',2200]];
 if(kind==='dream')return [['Где это я? Грибы огромные, а небо совсем другое!',0],['Это сон. У тебя две минуты до пробуждения.',1800]];
 if(kind==='death'){const causes={bomb:'Взрыв отбросил Тимура. Держись подальше от бомбочки до конца отсчёта.',boar:'Кабанчик сбил Тимура с ног.',fire:'Тимур попал в огонь.',water:'Тимур слишком долго был под водой.',ice:'Тимур замёрз. Нужно найти укрытие.',wind:'Торнадо подхватило Тимура.',spider:'Тимур погиб от укуса паука. Прыгай, чтобы стряхнуть паука до укуса.'};return [[causes[detail.cause]||'Тимур попал в беду.',0],['Попробуй снова — теперь ты знаешь, где опасность.',2600]]}
 if(kind==='storm')return [['Воронка подхватила Тимура!',0],['В следующий раз держись дальше от торнадо или найди дом с крышей.',3000]];
 if(kind==='family')return [[detail.line||'Тимур встретил родного человека.',0],[detail.after||'Обнялись! Здоровье и припасы восстановлены.',5500]];
 return [];
}
export const INTRO_LESSONS=[{at:0,text:'Семья приехала на пикник. Тимуру предстоит найти родных.'},{at:4.2,text:'W/S — вперёд и назад, A/D — шаги вбок. Мышь или свайп — осмотреться.'},{at:8,text:'E, F или Enter — покормить кабанчика. Пробел — прыгнуть и сесть на друга.'},{at:12,text:'Котик высоко прыгает, кабанчик заходит в воду. C — крафт, G — бросить бомбу.'},{at:15,text:'Выполни все квесты и открой проход. До торнадо ищи укрытие! Это вступление показывается один раз.'}];
