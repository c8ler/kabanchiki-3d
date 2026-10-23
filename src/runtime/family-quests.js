

// Owns 4 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){


function showFamilyPopup(role=0,member=null){
const names=['маму','папу','братика','бабушку'],icons=['👩','👨','👦','👵'];
const messages=[
['Мама улыбается: «Вот ты где! Я из окна видела, как один кабанчик гонялся за собственной тенью. Не все они страшные — иногда им просто нужен вкусный обед.»','Мама шепчет: «В этих местах полезно смотреть по сторонам. Самые хорошие находки часто лежат не на дороге, а чуть в стороне.»'],
['Папа смеётся: «Неплохая у тебя команда! Если кабанчик-друг идёт рядом, береги его — в серьёзной драке он может сделать то, чего Тимур один не сможет.»','Папа говорит: «Я слышал впереди странный грохот. Чем дальше идёшь, тем важнее не нестись напролом — иногда обход спасает больше сердец, чем храбрость.»'],
['Братик выпаливает: «Я всё это время сидел тихо-тихо! Ну… почти. Один кабан услышал мой живот и убежал. Наверное, решил, что здесь кабан побольше!»','Братик говорит: «Если увидишь ягоды — не проходи мимо. Я одну попробовал и сразу почувствовал себя бодрее. Остальные, правда, я уже съел.»'],
['Бабушка говорит: «Доброе сердце здесь полезнее большой палки. Накорми того, кто сердится, и однажды он может встать на твою сторону.»','Бабушка предупреждает: «Впереди логово, а там темнота такая, что собственный нос потеряешь. Увидишь фонарик — бери, внучек.»']
];
const i=Math.max(0,Math.min(3,Number(role)||0)),line=runtime.level===1&&i===0?(runtime.friend?'Мама обнимает Тимура: «Ты нашёл друга! Братик в деревне за озером. Кабанчик поможет разбить дерево на тропе — поезжайте вместе».':'Мама обнимает Тимура: «Вот ты где! Братик в деревне за озером, но тропу перекрыл ствол. Покорми кабанчика яблоком — новый друг поможет его разбить».'):messages[i][(runtime.level+runtime.familyFound+i)%messages[i].length];
runtime.familyPopupOpen=true;runtime.paused=true;
runtime.$('familyTitle').textContent=`${icons[i]} Тимур нашёл ${names[i]}!`;
runtime.$('familyText').textContent=`❤️ Здоровье и еда восстановлены.\n\n${line}`;
runtime.$('familyText').style.whiteSpace='pre-line';
runtime.playCinematic('family',()=>{runtime.familyPopupOpen=false;runtime.paused=false;runtime.startMusic()},{role,member,line})
}

function formatTime(sec){const m=Math.floor(sec/60),s=Math.floor(sec%60);return `${m}:${String(s).padStart(2,'0')}`}

function questsComplete(){if(runtime.level===6)return !runtime.foes.some(f=>f.isBoss);return runtime.levelBoarsDone>=runtime.levelBoarsTotal&&runtime.levelFamilyDone>=runtime.levelFamilyTotal}

function questState(){if(runtime.level===1&&runtime.opening)return {move:'👩 Мама впереди — иди по дорожке',feed:'🍎 Кабанчик догоняет! Брось ему яблоко',ride:'💚 Друг рядом — сядь на него',rescue:'🏇 Езжай к маме по дорожке',complete:runtime.opening.passageOpen?'💚 Тропа открыта — вперёд к озеру!':'🪵 Езжай с другом к дереву — открой дорогу к озеру'}[runtime.opening.stage];if(runtime.level===6){const boss=runtime.foes.find(f=>f.isBoss);if(boss)return `👑 Босс: ${boss.hp}/${boss.maxHp} · Подружи миньона и помоги ему победить босса`;return '🎉 Босс побеждён!'}const boarsLeft=Math.max(0,runtime.levelBoarsTotal-runtime.levelBoarsDone),familyLeft=Math.max(0,runtime.levelFamilyTotal-runtime.levelFamilyDone);if(boarsLeft>0&&familyLeft>0)return `🐗 Накорми кабанов: ${runtime.levelBoarsDone}/${runtime.levelBoarsTotal} · 👨‍👩‍👦 Найди родных: ${runtime.levelFamilyDone}/${runtime.levelFamilyTotal}`;if(boarsLeft>0)return `🐗 Накорми кабанов: ${runtime.levelBoarsDone}/${runtime.levelBoarsTotal}`;if(familyLeft>0)return `👨‍👩‍👦 Найди родных: ${runtime.levelFamilyDone}/${runtime.levelFamilyTotal}`;return runtime.level===2?'🏘️ Все задания выполнены — через калитку к деревне!':runtime.locationExit?'💚 Все задания выполнены — '+runtime.locationExit.config.destination.toLowerCase()+'!':'🎉 Задание выполнено!' }
 return {
  bindings:{
"showFamilyPopup":{get:()=>showFamilyPopup},
"formatTime":{get:()=>formatTime},
"questsComplete":{get:()=>questsComplete},
"questState":{get:()=>questState}
  },
  initialize(){

runtime.$('familyOk').onclick=()=>{runtime.familyPopupOpen=false;runtime.$('familyPopup').style.display='none';runtime.paused=false};
  }
 };

}
