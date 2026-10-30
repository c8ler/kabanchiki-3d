import { BufferedMusic, gameScore, cinematicScore } from "../music-player.js?v=221";

// Owns 14 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let audioSuspendedByPage,cinematicMusicKind,INTRO_CINE_NOTES,HAPPY_CINE_NOTES,pursuitBoltMaterial;

function musicTone(freq,duration=.18,type='triangle',gain=.014,when=0,cutoff=1000){
 if(!runtime.musicEnabled||!freq)return;try{runtime.audio??=new (window.AudioContext||window.webkitAudioContext)();if(runtime.audio.state==='suspended')runtime.audio.resume();const t=runtime.audio.currentTime+when,o=runtime.audio.createOscillator(),f=runtime.audio.createBiquadFilter(),g=runtime.audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);f.type='lowpass';f.frequency.setValueAtTime(cutoff,t);f.Q.setValueAtTime(.7,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(f).connect(g).connect(runtime.audioBus('music'));o.start(t);o.stop(t+duration+.03)}catch{}
}

function ensureMusicPlayer(){runtime.audio??=new (window.AudioContext||window.webkitAudioContext)();if(runtime.audio.state==='suspended'&&!audioSuspendedByPage)runtime.audio.resume();return runtime.musicPlayer??=new BufferedMusic(runtime.audio,runtime.audioBus('music'))}

function startMusic(){if(!runtime.musicEnabled||!runtime.started||runtime.paused||runtime.win||runtime.cinematicRunning||document.hidden||audioSuspendedByPage)return;const theme=runtime.MUSIC_THEMES[runtime.level===7?2:runtime.level-1];ensureMusicPlayer().play('level:'+runtime.level,gameScore(theme,runtime.level===6))}

function stopMusic(){runtime.musicPlayer?.stop()}

async function suspendPageAudio(){audioSuspendedByPage=true;stopMusic();stopCinematicMusic();try{if(runtime.audio&&runtime.audio.state==='running')await runtime.audio.suspend()}catch{}}

async function resumePageAudio(){if(!audioSuspendedByPage||document.hidden)return;audioSuspendedByPage=false;try{if(runtime.audio&&runtime.audio.state==='suspended')await runtime.audio.resume()}catch{}if(runtime.musicEnabled&&!runtime.paused){if(runtime.cinematicRunning)startCinematicMusic(runtime.movie?.kind||'intro');else if(runtime.started&&!runtime.win)startMusic()}}

function stopCinematicMusic(){if(cinematicMusicKind)runtime.musicPlayer?.stop();cinematicMusicKind=''}

function startCinematicMusic(kind){stopMusic();stopCinematicMusic();cinematicMusicKind=kind;if(runtime.musicEnabled&&!document.hidden&&!audioSuspendedByPage)ensureMusicPlayer().play('cinematic:'+kind,cinematicScore(kind,kind==='outro'?HAPPY_CINE_NOTES:INTRO_CINE_NOTES))}

function playDeathMusic(){
 stopMusic();stopCinematicMusic();
 // Мотив проигрыша из 2D: нисходящие 400 → 350 → 300 → 250 Гц.
 [400,350,300,250].forEach((f,i)=>musicTone(f,.38,'sawtooth',.052,i*.26))
}
 return {
  bindings:{
"musicTone":{get:()=>musicTone},
"ensureMusicPlayer":{get:()=>ensureMusicPlayer},
"startMusic":{get:()=>startMusic},
"stopMusic":{get:()=>stopMusic},
"audioSuspendedByPage":{get:()=>audioSuspendedByPage,set:value=>{audioSuspendedByPage=value}},
"suspendPageAudio":{get:()=>suspendPageAudio},
"resumePageAudio":{get:()=>resumePageAudio},
"cinematicMusicKind":{get:()=>cinematicMusicKind,set:value=>{cinematicMusicKind=value}},
"INTRO_CINE_NOTES":{get:()=>INTRO_CINE_NOTES},
"HAPPY_CINE_NOTES":{get:()=>HAPPY_CINE_NOTES},
"stopCinematicMusic":{get:()=>stopCinematicMusic},
"startCinematicMusic":{get:()=>startCinematicMusic},
"playDeathMusic":{get:()=>playDeathMusic},
"pursuitBoltMaterial":{get:()=>pursuitBoltMaterial,set:value=>{pursuitBoltMaterial=value}}
  },
  initialize(){

runtime.MUSIC_THEMES.splice(3,0,{...runtime.MUSIC_THEMES[1],name:'river'});

// v79: browser/app backgrounding must immediately release audio. On Android this also cooperates with phone-call audio focus.
/* init:let */ audioSuspendedByPage = false;

document.addEventListener('visibilitychange',()=>document.hidden?suspendPageAudio():resumePageAudio());

window.addEventListener('pagehide',suspendPageAudio);

window.addEventListener('blur',suspendPageAudio);

window.addEventListener('focus',()=>{if(!document.hidden)resumePageAudio()});

/* init:let */ cinematicMusicKind = '';

/* init:const */ INTRO_CINE_NOTES = [262,330,392,440,392,330,294,349,440,494,440,349,330,392,523,494];

/* init:const */ HAPPY_CINE_NOTES = [523,659,784,659,698,784,880,784,659,784,1047,988,880,784,659,523];



/* init:let */ pursuitBoltMaterial = null;
  }
 };

}
