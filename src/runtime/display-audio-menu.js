

// Owns 5 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let difficultyFromPause,startDifficultyRun;

function syncAudioButtons(){const m=runtime.$('toggleMusic'),s=runtime.$('toggleSfx');if(m)m.textContent=runtime.musicEnabled?'🎵 Музыка: ВКЛ':'🔇 Музыка: ВЫКЛ';if(s)s.textContent=runtime.sfxEnabled?'🔊 Звуки: ВКЛ':'🔈 Звуки: ВЫКЛ'}

async function goFullscreen(){
  const active=document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;
  try{
    if(active){
      const exit=document.exitFullscreen||document.webkitExitFullscreen||document.mozCancelFullScreen||document.msExitFullscreen;
      if(exit) await Promise.resolve(exit.call(document));
      return;
    }
    // Call the browser API directly from the button click (required by Chrome/Android).
    const targets=[document.documentElement,document.body,runtime.renderer.domElement];
    let lastError=null;
    for(const el of targets){
      const req=el.requestFullscreen||el.webkitRequestFullscreen||el.webkitRequestFullScreen||el.mozRequestFullScreen||el.msRequestFullscreen;
      if(!req) continue;
      try{
        await Promise.resolve(req.call(el));
        runtime.notice('⛶ Полноэкранный режим включён');
        syncFullscreenButton();
        return;
      }catch(err){lastError=err}
    }
    throw lastError||new Error('Fullscreen API unavailable');
  }catch(e){
    // A sandboxed iframe (including ChatGPT preview) can forbid fullscreen at browser level.
    runtime.notice('⛶ Браузер запретил полный экран этому встроенному окну. Открой игру отдельной вкладкой/на сайте — кнопка использует настоящий Fullscreen API.');
  }
}

function syncFullscreenButton(){
  const on=!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement);
  runtime.$('fullscreen').textContent=on?'🗗':'⛶';
  runtime.$('introFullscreen').textContent=on?'🗗 Выйти из полного экрана':'⛶ На весь экран';
  runtime.$('menuFullscreen').textContent=on?'🗗 Выйти из полного экрана':'⛶ Полный экран';
}
 return {
  bindings:{
"syncAudioButtons":{get:()=>syncAudioButtons},
"goFullscreen":{get:()=>goFullscreen},
"syncFullscreenButton":{get:()=>syncFullscreenButton},
"difficultyFromPause":{get:()=>difficultyFromPause,set:value=>{difficultyFromPause=value}},
"startDifficultyRun":{get:()=>startDifficultyRun}
  },
  initialize(){

runtime.$('toggleMusic').onclick=()=>{runtime.musicEnabled=!runtime.musicEnabled;localStorage.setItem('kabanchiki3d_music',runtime.musicEnabled?'1':'0');if(runtime.audio)runtime.audioBus('music').gain.setTargetAtTime(runtime.musicEnabled?.62:0,runtime.audio.currentTime,.03);if(runtime.musicEnabled){if(runtime.cinematicRunning)runtime.startCinematicMusic(runtime.movie?.kind||'intro');else runtime.startMusic()}else{runtime.stopMusic();runtime.stopCinematicMusic()}syncAudioButtons()};

runtime.$('toggleSfx').onclick=()=>{runtime.sfxEnabled=!runtime.sfxEnabled;localStorage.setItem('kabanchiki3d_sfx',runtime.sfxEnabled?'1':'0');syncAudioButtons()};

syncAudioButtons();

runtime.$('fullscreen').onclick=goFullscreen;

runtime.$('menuFullscreen').onclick=goFullscreen;

runtime.$('introFullscreen').onclick=goFullscreen;

runtime.$('introSeason').onchange=runtime.chooseSeason;

runtime.$('pauseSeason').onchange=runtime.chooseSeason;

runtime.syncSeasonChoices();

/* init:let */ difficultyFromPause = false;

/* init:const */ startDifficultyRun = runtime.$('difficultyStart').onclick;
  }
 };

}
