import { stormClock } from "../tornado-rules.js?v=215";
import { briefNotice } from "../adventure-hud.js?v=215";
import { parseCheatCode } from "../cheat-codes.js?v=215";

// Owns 5 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let lastHudUpdate;

function notice(t){runtime.adventureHud.log(t);const m=runtime.$('message');m.textContent=briefNotice(t);m.classList.remove('hidden');runtime.flash=3;clearTimeout(runtime.noticeTimer);runtime.noticeTimer=setTimeout(()=>m.classList.add('hidden'),3200)}

function hud(force=true){const now=performance.now();if(!force&&now-lastHudUpdate<150)return;lastHudUpdate=now;runtime.syncCraftUI();
 runtime.adventureHud.update({life: runtime.life,maxLife:runtime.diffCfg().playerHP,food:runtime.food+runtime.fishStock+runtime.yellowAppleStock+runtime.yellowMushroomStock,maxFood:runtime.foodCapacity(),form:runtime.catFormTime>0?'cat':runtime.boarFormTime>0?'boar':null,seconds:Math.max(runtime.catFormTime,runtime.boarFormTime),storm:stormClock(runtime.levelTime,runtime.level)},now);
 runtime.$('stats').textContent=`${runtime.levels[runtime.level-1]} · ${{summer:'Лето',autumn:'Осень',winter:'Зима',spring:'Весна'}[runtime.currentSeason]}\nСложность: ${runtime.DIFF_NAMES[runtime.selectedDiff]} · Семья: ${runtime.familyFound}/4 · Очки: ${runtime.score}\nПрипасы: обычные ${runtime.food}, рыба ${runtime.fishStock}, жёлтые яблоки ${runtime.yellowAppleStock}, мухоморы ${runtime.yellowMushroomStock}${runtime.friend?'\nДруг: '+runtime.friendHP+'/'+runtime.diffCfg().friendHP+' здоровья':''}${runtime.hasFlashlight?' · Фонарик есть':''}`;
 runtime.$('quest').textContent=runtime.win?'Семья снова вместе!':runtime.questState();
}

function setPause(on){if(!runtime.started)return;runtime.paused=on;if(on)runtime.$('pauseMenu').firstElementChild.scrollTop=0;if(on){runtime.$('homeAction').hidden=true;runtime.$('craftResult').textContent='';}runtime.syncCraftUI();if(on)runtime.stopMusic();else runtime.startMusic();runtime.$('pauseMenu').style.display=on?'grid':'none';runtime.$('pauseBtn').textContent=on?'▶':'☰';if(on&&!runtime.mobile){try{(document.exitPointerLock||document.webkitExitPointerLock)?.call(document)}catch{}}}

function togglePause(){if(runtime.difficultyFromPause){runtime.closeDifficultyChoice();return}setPause(!runtime.paused)}
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

runtime.$('cheatForm').addEventListener('submit',e=>{e.preventDefault();const result=runtime.$('cheatResult'),code=parseCheatCode(runtime.$('cheatCode').value);if(!code){result.textContent='Неизвестный код. Используй LEVEL1–LEVEL6, BOAR, CAT, TIMUR, LIGHT или BOMB.';return}if(!runtime.started||runtime.endShown||runtime.win||runtime.life<=0||runtime.cinematicRunning){result.textContent='Примени код во время игры через меню паузы.';return}runtime.keys={};runtime.stick.x=runtime.stick.y=0;runtime.jump=false;runtime.stopFishing();if(code.type==='level'){for(const shot of runtime.shots)runtime.scene.remove(shot.g);runtime.shots.length=0;runtime.throwCooldown=0;runtime.endBoarForm();runtime.life=runtime.diffCfg().playerHP;runtime.invuln=3;runtime.py=runtime.vy=0;runtime.hasFlashlight=false;runtime.torch.intensity=0;runtime.loadLevel(code.level);result.textContent=`Локация ${code.level}: ${runtime.levels[code.level-1]}. Нажми «Продолжить».`}else if(code.type==='bomb'){runtime.adventureInventory.bombs++;result.textContent='💣 Получена 1 бомбочка. Нажми «Продолжить», затем G или кнопку 💣, чтобы поставить её.';}else if(code.type==='light'){runtime.hasFlashlight=!runtime.hasFlashlight;runtime.torch.intensity=runtime.hasFlashlight?42:0;if(runtime.hasFlashlight){if(runtime.flashlightObj){runtime.scene.remove(runtime.flashlightObj);runtime.flashlightObj=null}result.textContent='Фонарик получен.';}else{if(runtime.flashlightObj)runtime.scene.remove(runtime.flashlightObj);const point=runtime.nearestSafeSpawn(runtime.boy.position.x+Math.sin(runtime.yaw)*2.8,runtime.boy.position.z+Math.cos(runtime.yaw)*2.8,.5)||[runtime.boy.position.x,runtime.boy.position.z];runtime.flashlightObj=runtime.group(point[0],point[1]);runtime.flashlightObj.position.y=runtime.terrainHeightAt(point[0],point[1]);runtime.block(runtime.flashlightObj,runtime.mats.gold,0,.45,0,.35,.35,.8);runtime.block(runtime.flashlightObj,runtime.mats.white,0,.45,.55,.28,.28,.28);runtime.flashlightDropUntil=performance.now()+3000;result.textContent='Фонарик выброшен рядом. Его можно подобрать или вернуть кодом LIGHT.';}}else{if(code.form==='boar')runtime.startBoarForm();else if(code.form==='cat')runtime.startCatForm();else runtime.endBoarForm();result.textContent=code.form==='human'?'Тимур снова мальчик.':`Тимур стал ${code.form==='cat'?'котиком':'кабанчиком'} на 30 секунд.`}hud();runtime.$('cheatCode').value='';});
  }
 };

}
