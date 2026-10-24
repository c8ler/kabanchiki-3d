import { cinematicLines, INTRO_LESSONS } from "../campaign-progress.js?v=217";
import { reunionProfile } from "../family-reunion.js?v=217";

// Owns 3 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function playCinematic(kind,onDone,detail={}){
 runtime.stopFishing();runtime.cineClear();if(kind==='family'){const form=runtime.catFormTime>0?'cat':runtime.boarFormTime>0?'boar':'human';if(form!=='human'){const profile=reunionProfile(form,detail.role);detail={...detail,form,line:profile.line,after:profile.after};}}runtime.cinematicRunning=true;runtime.paused=true;if(runtime.boarFormVisual)runtime.boarFormVisual.visible=false;runtime.$('cinematic').style.display='block';runtime.cineSetup(kind,detail);runtime.startCinematicMusic(kind);
 const steps=kind==='intro'?[["Семья приехала отдохнуть в лесу.",0],["У озера их ждал пикник…",4200],["Но из чащи появились кабанчики.",8000],["Все разбежались в разные стороны.",12000],["Тимур остался один. Ему предстоит найти родных.",15000]]:kind==='outro'?[["Босс сбежал. Семья снова вместе.",0],["Верный кабанчик помог найти дорогу домой.",3200],["Пора возвращаться к машине.",6300],["Спасибо, кабанчик! Пора домой.",10000]]:cinematicLines(kind,detail);
 const text=runtime.$('cinematicText');if(kind==='intro'){steps.splice(0,steps.length,...INTRO_LESSONS.map((s,i)=>[runtime.mobile?['Семья приехала на пикник. Тимуру предстоит найти родных.','Джойстик — идти, свайп по миру — осмотреться.','Кнопка еды — покормить кабанчика. Прыжок — запрыгнуть на друга.','Котик высоко прыгает. Крафт — в меню; кнопки помогут собрать материалы и поставить предмет.','Выполни все квесты и открой проход. От торнадо ищи укрытие!'][i]:s.text,s.at*1000]));}for(const [line,at] of steps)if(at===0)text.textContent=line;else runtime.cineLater(()=>text.textContent=line,at);if(kind==='intro')runtime.cineLater(runtime.softBoarAttackSound,8000);else if(kind==='family')runtime.bonusSound();
 const finish=()=>{if(!runtime.cinematicRunning)return;runtime.cinematicRunning=false;runtime.cinematicFinish=null;runtime.cineClear();runtime.stopCinematicMusic();runtime.$('cinematic').style.display='none';onDone?.();runtime.startMusic()};runtime.cinematicFinish=finish;runtime.$('cinematicSkip').onclick=finish;runtime.cineLater(finish,kind==='intro'?18500:kind==='outro'?15500:kind==='storm'?6500:kind==='death'?4500:8500);
}


function showEnd(won){if(runtime.sandboxMode){runtime.life=runtime.diffCfg().playerHP;return}if(runtime.endShown)return;if(runtime.deathSceneActive&&!runtime.deathSceneFinished)return;if(!won&&!runtime.deathSceneActive&&runtime.lastDeathCause!=='wind'){runtime.deathSceneActive=true;runtime.life=0;playCinematic('death',()=>{runtime.deathSceneFinished=true;showEnd(false)},{cause:runtime.lastDeathCause,line:{boar:'Кабанчик сбил Тимура с ног. Приключение можно начать снова.',fire:'Тимур оказался слишком близко к огню.',water:'Тимур слишком долго пробыл под водой.',ice:'Тимур замёрз. Нужно успеть найти семью.'}[runtime.lastDeathCause]});return}runtime.$('endRestart').textContent=won?'🔄 Новая игра':'🔄 Повторить уровень';if(!won){runtime.attemptProgress.lose();runtime.syncSeasonChoices();runtime.clearWorldFires();runtime.hasFlashlight=false;runtime.torch.intensity=0;runtime.playDeathMusic()}runtime.endShown=true;runtime.paused=true;runtime.resultSaving=false;runtime.resultLocalSaved=false;runtime.resultGlobalSaved=false;if(!runtime.mobile){try{(document.exitPointerLock||document.webkitExitPointerLock)?.call(document)}catch{}}const best=(()=>{try{return JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]')}catch{return[]}})();runtime.$('endTitle').textContent=won?'🎉 Победа!':'💀 Игра окончена';runtime.$('endStats').innerHTML=`⏱ Время: <b>${runtime.formatTime(runtime.totalTime)}</b><br>🏆 Очки: <b>${runtime.score}</b><br>🍎 Кормлений: <b>${runtime.statsData.fed}</b><br>🌿 Собрано еды: <b>${runtime.statsData.forage}</b><br>🫐 Лечебных ягод: <b>${runtime.statsData.berries}</b><br>❤️ Получено урона: <b>${runtime.statsData.damage}</b><br>👨‍👩‍👦 Найдено семьи: <b>${runtime.familyFound}/4</b><br>🐗 Побеждено миньонов: <b>${runtime.statsData.minions}</b><br>👑 Ударов друга по боссу: <b>${runtime.statsData.bossHits}</b>`;runtime.$('playerName').value=localStorage.getItem('kabanchiki3d_player_name')||'';runtime.$('endScreen').style.display='grid';setTimeout(()=>{runtime.$('playerName').focus();runtime.$('playerName').select()},40)}

async function submitGlobalResult(name){
 // v121: completed and failed runs use the same existing leaderboard row schema.
 const payload={player_name:name,score:Math.max(0,Math.round(runtime.score)),play_time:Math.max(0,Math.round(runtime.totalTime)),difficulty:runtime.selectedDiff,family:Math.max(0,Math.min(4,runtime.familyFound)),game_version:runtime.GAME_VERSION};
 try{const r=await fetch(`${runtime.SUPABASE_URL}/rest/v1/leaderboard`,{method:'POST',headers:{apikey:runtime.SUPABASE_KEY,Authorization:`Bearer ${runtime.SUPABASE_KEY}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload)});if(!r.ok)throw new Error(`HTTP ${r.status}`);return {ok:true}}catch(e){console.warn('Global leaderboard submit failed',e);return {ok:false,error:e}}
}
 return {
  bindings:{
"playCinematic":{get:()=>playCinematic},
"showEnd":{get:()=>showEnd},
"submitGlobalResult":{get:()=>submitGlobalResult}
  },
  initialize(){

  }
 };

}
