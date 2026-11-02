export const INTRO_STORY=[
 {at:0,end:3.95,text:'Тимур приехал с мамой, папой, бабушкой и братиком на пикник у лесного озера.'},
 {at:4.2,end:7.95,text:'Семья выбрала полянку и разложила угощение. Все собирались провести день вместе.'},
 {at:8,end:11.95,text:'Запах еды привлёк кабанчиков. Они выбежали из леса прямо к пикнику!'},
 {at:12,end:14.95,text:'Родные испугались и разбежались в разные стороны. Тимур потерял их из виду.'},
 {at:15.5,end:18.4,text:'Тимур остался один. Теперь ему нужно найти всех родных и вместе вернуться домой.'}
];
export function introControls(mobile=false){return[
 {title:'Иди и осматривайся',text:mobile?'Левый джойстик — идти. Проведи пальцем по свободному месту на экране, чтобы повернуть камеру.':'W/S — вперёд и назад, A/D — в стороны. Мышь поворачивает камеру. Нажми на игровой мир, чтобы включить управление мышью.'},
 {title:'Подружись с кабанчиком',text:mobile?'Подойди к кабанчику и нажми «Кормить». Когда он станет другом, подойди и нажми «Прыжок», чтобы сесть верхом.':'E, F, Enter или левая кнопка мыши — бросить еду. Покорми кабанчика, затем подойди к другу и нажми пробел, чтобы сесть верхом. Q — спрыгнуть.'},
 {title:'Найди семью',text:'Следуй подсказкам над персонажами и выполняй задания локации. Если запутался, открой меню: там есть помощь, история и текущая задача.'}
]}
export class IntroSequence{
 constructor(now=0){this.index=0;this.since=now;this.phase='story'}
 get current(){return INTRO_STORY[this.index]}
 sceneTime(now){const s=this.current;return this.phase==='story'?Math.min(s.end,s.at+Math.max(0,(now-this.since)/1000)):INTRO_STORY.at(-1).end}
 advance(now=0){if(this.phase==='done')return true;if(this.phase==='controls'){this.phase='done';return true}if(this.index<INTRO_STORY.length-1){this.index++;this.since=now}else this.phase='controls';return false}
 skipStory(){if(this.phase==='story'){this.index=INTRO_STORY.length-1;this.phase='controls'}}
}
export function fillControls(host,mobile=false,doc=document){host.replaceChildren();for(const item of introControls(mobile)){const section=doc.createElement('section'),title=doc.createElement('h3'),text=doc.createElement('p');title.textContent=item.title;text.textContent=item.text;section.append(title,text);host.append(section)}}
