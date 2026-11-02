import {IntroSequence,INTRO_STORY,fillControls} from '../intro-sequence.js?v=224';
import {familyDialogue,DialogueCursor} from '../family-dialogue.js?v=222';
import {leaderboardRequest,leaderboardError} from '../leaderboard-client.js?v=222';
import { cinematicLines } from "../campaign-progress.js?v=222";
import { reunionProfile } from "../family-reunion.js?v=222";

// Owns 4 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let familyCursor=null,dialogueVariant=0;
 function advanceFamilyDialogue(){if(!runtime.cinematicRunning||runtime.movie?.kind!=='family'||!familyCursor)return false;if(familyCursor.next()){runtime.$('cinematicText').textContent=familyCursor.text;runtime.$('cinematicNext').textContent=familyCursor.last?'Продолжить приключение ✓':'Дальше →'}else runtime.cinematicFinish?.();return true}


function playCinematic(kind,onDone,detail={}){
 runtime.stopFishing();runtime.spiderLife.root.visible=false;
 if(kind==='family'){runtime.shakeOffSpiders();runtime.spiderLife.cure()}
 runtime.cineClear();
 if(kind==='family'){const form=runtime.catFormTime>0?'cat':runtime.boarFormTime>0?'boar':'human';if(form!=='human'){const profile=reunionProfile(form,detail.role);detail={...detail,form,line:profile.line,after:profile.after}}}
 runtime.cinematicRunning=true;runtime.paused=true;
 if(runtime.boarFormVisual)runtime.boarFormVisual.visible=false;
 const overlay=runtime.$('cinematic'),text=runtime.$('cinematicText'),next=runtime.$('cinematicNext'),skip=runtime.$('cinematicSkip'),lesson=runtime.$('cinematicLesson'),progress=runtime.$('cinematicProgress');
 overlay.style.display='block';lesson.hidden=true;progress.hidden=true;skip.hidden=false;skip.textContent='⏭ Пропустить заставку';
 runtime.cineSetup(kind,detail);runtime.startCinematicMusic(kind);
 const finish=()=>{if(!runtime.cinematicRunning)return;runtime.cinematicRunning=false;runtime.cinematicFinish=null;runtime.cineClear();runtime.stopCinematicMusic();overlay.style.display='none';lesson.hidden=true;progress.hidden=true;next.hidden=true;skip.hidden=false;onDone?.();if(!runtime.cinematicRunning)runtime.startMusic()};
 runtime.cinematicFinish=finish;
 if(kind==='intro'){
  const sequence=new IntroSequence(performance.now());runtime.movie.introSequence=sequence;fillControls(runtime.$('cinematicControls'),runtime.mobile);
  const render=()=>{const story=sequence.phase==='story';text.hidden=!story;text.textContent=sequence.current.text;lesson.hidden=story;progress.hidden=false;progress.textContent=story?'История · '+(sequence.index+1)+' / '+INTRO_STORY.length:'Теперь — управление';next.hidden=false;next.textContent=story?(sequence.index===INTRO_STORY.length-1?'Продолжить → Управление':'Дальше →'):'Понятно, продолжить →';skip.hidden=!story;skip.textContent='К управлению →'};
  next.onclick=()=>{if(sequence.advance(performance.now()))finish();else {if(sequence.phase==='story'&&sequence.index===2)runtime.softBoarAttackSound();render()}};
  skip.onclick=()=>{sequence.skipStory();render()};render();return;
 }
 text.hidden=false;
 const steps=kind==='outro'?[['Босс сбежал. Семья снова вместе.',0],['Верный кабанчик помог найти дорогу домой.',3200],['Пора возвращаться к машине.',6300],['Спасибо, кабанчик! Пора домой.',10000]]:cinematicLines(kind,detail);
 if(kind==='family'){familyCursor=new DialogueCursor(familyDialogue(detail.role,detail,dialogueVariant++));steps.splice(0,steps.length,[familyCursor.text,0])}
 next.hidden=kind!=='family';next.textContent='Дальше →';next.onclick=advanceFamilyDialogue;
 for(const [line,at]of steps)if(at===0)text.textContent=line;else runtime.cineLater(()=>text.textContent=line,at);
 if(kind==='family')runtime.bonusSound();
 skip.onclick=finish;
 if(kind!=='family')runtime.cineLater(finish,kind==='sleep'?4200:kind==='dream'?3500:kind==='outro'?15500:kind==='storm'?6500:kind==='death'?4500:8500);
}


function showEnd(won){if(runtime.sandboxMode){runtime.life=runtime.diffCfg().playerHP;return}if(runtime.endShown)return;if(runtime.deathSceneActive&&!runtime.deathSceneFinished)return;if(!won&&!runtime.deathSceneActive&&runtime.lastDeathCause!=='wind'){runtime.deathSceneActive=true;runtime.life=0;playCinematic('death',()=>{runtime.deathSceneFinished=true;showEnd(false)},{cause:runtime.lastDeathCause,line:{boar:'Кабанчик сбил Тимура с ног. Приключение можно начать снова.',fire:'Тимур оказался слишком близко к огню.',water:'Тимур слишком долго пробыл под водой.',ice:'Тимур замёрз. Нужно успеть найти семью.',monster:'Тимур встретил монстра. Кабанчики и бомбы помогут защититься.',bee:'Пчела ужалила Тимура. Не тревожь её.',mosquito:'Тимура покусали комарики. Продолжай двигаться.',spider:'Тимур погиб от укуса паука. Прыжком можно стряхнуть паука до укуса.'}[runtime.lastDeathCause]});return}runtime.$('endRestart').textContent=won?'🔄 Новая игра':'🔄 Повторить уровень';if(!won){runtime.attemptProgress.lose();runtime.syncSeasonChoices();runtime.clearWorldFires();runtime.hasFlashlight=false;runtime.torch.intensity=0;runtime.playDeathMusic()}runtime.endShown=true;runtime.paused=true;runtime.resultSaving=false;runtime.resultLocalSaved=false;runtime.resultGlobalSaved=false;if(!runtime.mobile){try{(document.exitPointerLock||document.webkitExitPointerLock)?.call(document)}catch{}}const best=(()=>{try{return JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]')}catch{return[]}})();runtime.$('endTitle').textContent=won?'🎉 Победа!':'💀 Игра окончена';runtime.$('endStats').innerHTML=`⏱ Время: <b>${runtime.formatTime(runtime.totalTime)}</b><br>🏆 Очки: <b>${runtime.score}</b><br>🍎 Кормлений: <b>${runtime.statsData.fed}</b><br>🌿 Собрано еды: <b>${runtime.statsData.forage}</b><br>🫐 Лечебных ягод: <b>${runtime.statsData.berries}</b><br>❤️ Получено урона: <b>${runtime.statsData.damage}</b><br>👨‍👩‍👦 Найдено семьи: <b>${runtime.familyFound}/4</b><br>🐗 Побеждено миньонов: <b>${runtime.statsData.minions}</b><br>👑 Ударов друга по боссу: <b>${runtime.statsData.bossHits}</b>`;runtime.$('playerName').value=localStorage.getItem('kabanchiki3d_player_name')||'';runtime.$('endScreen').style.display='grid';setTimeout(()=>{runtime.$('playerName').focus();runtime.$('playerName').select()},40)}

async function submitGlobalResult(name){if(runtime.cheatSession.active)return{ok:false,error:'В режиме читов рекорды не отправляются.'};
 // v121: completed and failed runs use the same existing leaderboard row schema.
 const payload={player_name:name,score:Math.max(0,Math.round(runtime.score)),play_time:Math.max(0,Math.round(runtime.totalTime)),difficulty:runtime.selectedDiff,family:Math.max(0,Math.min(4,runtime.familyFound)),game_version:runtime.GAME_VERSION};
 try{await leaderboardRequest(`${runtime.SUPABASE_URL}/rest/v1/leaderboard`,runtime.SUPABASE_KEY,{method:'POST',payload});return {ok:true}}catch(e){console.warn('Global leaderboard submit failed',e);return {ok:false,error:leaderboardError(e)}}
}
 return {
  bindings:{
"playCinematic":{get:()=>playCinematic},
"showEnd":{get:()=>showEnd},
"advanceFamilyDialogue":{get:()=>advanceFamilyDialogue},
"submitGlobalResult":{get:()=>submitGlobalResult}
  },
  initialize(){

  }
 };

}
