import { stormClock } from "../tornado-rules.js?v=219";
import { briefNotice } from "../adventure-hud.js?v=219";
import { parseCheatCode } from "../cheat-codes.js?v=219";

// Owns 5 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let lastHudUpdate;

function notice(t){runtime.adventureHud.log(t);const m=runtime.$('message');m.textContent=briefNotice(t);m.classList.remove('hidden');runtime.flash=3;clearTimeout(runtime.noticeTimer);runtime.noticeTimer=setTimeout(()=>m.classList.add('hidden'),3200)}

function hud(force=true){const now=performance.now();if(!force&&now-lastHudUpdate<150)return;lastHudUpdate=now;runtime.syncCraftUI();
 runtime.adventureHud.update({life: runtime.life,maxLife:runtime.diffCfg().playerHP,food:runtime.food+runtime.fishStock+runtime.yellowAppleStock+runtime.yellowMushroomStock,maxFood:runtime.foodCapacity(),form:runtime.catFormTime>0?'cat':runtime.boarFormTime>0?'boar':null,seconds:Math.max(runtime.catFormTime,runtime.boarFormTime),storm:stormClock(runtime.levelTime,runtime.level)},now);
 runtime.$('stats').textContent=`${(runtime.level===7?'✨ Секретный остров':runtime.levels[runtime.level-1])} · ${{summer:'Лето',autumn:'Осень',winter:'Зима',spring:'Весна'}[runtime.currentSeason]}\nСложность: ${runtime.DIFF_NAMES[runtime.selectedDiff]} · Семья: ${runtime.familyFound}/4 · Очки: ${runtime.score}\nПрипасы: обычные ${runtime.food}, рыба ${runtime.fishStock}, жёлтые яблоки ${runtime.yellowAppleStock}, мухоморы ${runtime.yellowMushroomStock}${runtime.friend?'\nДруг: '+runtime.friendHP+'/'+runtime.diffCfg().friendHP+' здоровья':''}${runtime.hasFlashlight?' · Фонарик есть':''}`;
 runtime.$('quest').textContent=runtime.win?'Семья снова вместе!':runtime.questState();
}

function setPause(on){if(!on)runtime.closeSecretMenu(false);if(!runtime.started)return;runtime.paused=on;if(on)runtime.$('pauseMenu').firstElementChild.scrollTop=0;if(on){runtime.$('homeAction').hidden=true;runtime.$('craftResult').textContent='';}runtime.syncCraftUI();if(on)runtime.stopMusic();else runtime.startMusic();runtime.$('pauseMenu').style.display=on?'grid':'none';runtime.$('pauseBtn').textContent=on?'▶':'☰';if(on&&!runtime.mobile){try{(document.exitPointerLock||document.webkitExitPointerLock)?.call(document)}catch{}}}

function togglePause(){if(runtime.secretMenuOpen){runtime.closeSecretMenu();return}if(runtime.difficultyFromPause){runtime.closeDifficultyChoice();return}setPause(!runtime.paused)}
 return {
  bindings:{
"notice":{get:()=>notice},
"lastHudUpdate":{get:()=>lastHudUpdate,set:value=>{lastHudUpdate=value}},
"hud":{get:()=>hud},
"setPause":{get:()=>setPause},
"togglePause":{get:()=>togglePause}
  },
  initialize(){

/* init:let */ lastHudUpdate = -Infinity;

runtime.$('start').onclick=()=>{runtime.$('intro').style.display='none';runtime.$('difficultyScreen').style.display='grid'};

runtime.$('difficultyBack').onclick=()=>{runtime.$('difficultyScreen').style.display='none';runtime.$('intro').style.display='grid'};

runtime.$('difficultyStart').onclick=()=>{try{if(!runtime.mobile)runtime.requestDesktopMouseLock();runtime.selectedDiff=Number(document.querySelector('input[name="diff3d"]:checked')?.value??2);runtime.life=runtime.diffCfg().playerHP;runtime.food=runtime.foodCapacity();runtime.friendHP=runtime.diffCfg().friendHP;runtime.$('difficultyScreen').style.display='none';runtime.resetNewRun();runtime.food=runtime.foodCapacity();runtime.applySeason();runtime.started=true;runtime.paused=false;runtime.startCampaignLevel()}catch(e){window.__showGameError('Ошибка запуска игры',e.stack||String(e))}};

runtime.$('camera').onclick=()=>{runtime.camMode=(runtime.camMode+1)%10;runtime.first=runtime.camMode===9;if(runtime.first)runtime.pitch=0;runtime.$('camera').textContent=`📷 Вид ${runtime.camMode+1}/10`;runtime.$('cross').style.display='none';notice(['Высоко · далеко','Средне · далеко','Низко · близко','Очень высоко','За плечом','Низко · далеко','Сверху под углом','Близко · средне','Строго сверху · 90°','От первого лица · еда в руке'][runtime.camMode])};

runtime.$('restart').onclick=runtime.restartGame;

runtime.$('menuRestart').onclick=runtime.restartGame;

runtime.$('jump').onpointerdown=e=>{e.preventDefault();runtime.queuePlayerJump()};

runtime.$('interact').onpointerdown=e=>{e.preventDefault();runtime.feed()};

runtime.$('pauseBtn').onclick=togglePause;

runtime.$('resume').onclick=()=>{setPause(false);runtime.requestDesktopMouseLock()};

runtime.$('cheatForm').addEventListener('submit',e=>{e.preventDefault();runtime.applyCheat(runtime.$('cheatCode').value);runtime.$('cheatCode').value=''});
for(const button of document.querySelectorAll('[data-cheat]'))button.onclick=()=>runtime.applyCheat(button.dataset.cheat);

  }
 };

}
