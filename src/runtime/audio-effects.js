import { Soundscape } from "../soundscape.js?v=222";

// Owns 64 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let level,food,score,familyFound,friend,friendHP,bossHits,levelTime,damage,paused,levels,portalObj,familyMembers,crates,shots,audio,sfxEnabled,musicEnabled,throwCooldown,musicPlayer,forageTimer,friendAttack,hasFlashlight,flashlightObj,fireballs,levelBoarsTotal,levelBoarsDone,levelFamilyTotal,levelFamilyDone,familyPopupOpen,totalTime,yellowMushroomStock,yellowAppleStock,boarFormTime,boarFormVisual,catFormTime,catFormModel,statsData,endShown,bossRage,bossSummon,bossVictoryTimer,bossFireworkTimer,burningTrees,charredStumps,resultSaving,resultLocalSaved,resultGlobalSaved,soundscape,lastDeathCause,lastDeathBoar,deathSceneActive,deathSceneFinished,N,MUSIC_THEMES;

function audioBus(kind){soundscape??=new Soundscape(audio);return soundscape[kind]}

function effect(name){if(!sfxEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();soundscape??=new Soundscape(audio);soundscape.event(name)}catch{}}

function softEffectTone(freq,duration,type='sine',gain=.035,delay=0,endFreq=freq*.7){
 if(!sfxEnabled)return;
 try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();
  const t=audio.currentTime+delay,length=Math.max(.08,duration),attack=Math.min(.025,length*.20),release=.035;
  const o=audio.createOscillator(),filter=audio.createBiquadFilter(),g=audio.createGain();
  // Rounded waves and a low-pass filter remove the buzzy edges of combat and bonus sounds.
  o.type=type==='square'||type==='sawtooth'?'triangle':type;
  o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(45,endFreq),t+length);
  filter.type='lowpass';filter.frequency.setValueAtTime(Math.min(1800,Math.max(420,freq*2)),t);filter.Q.setValueAtTime(.5,t);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain,t+attack);
  g.gain.exponentialRampToValueAtTime(.0001,t+length);g.gain.linearRampToValueAtTime(0,t+length+release);
  o.connect(filter).connect(g).connect(audioBus('effects'));o.start(t);o.stop(t+length+release+.005);
 }catch{}
}

function softBoarDefeatSound(){softEffectTone(210,.24,'sine',.015,0,135)}

function softBoarAttackSound(){softEffectTone(155,.22,'sine',.018,0,92)}

function playerDamageSound(){softEffectTone(150,.23,'triangle',.035,0,72)}

function playerHitFeedback(cause='boar',attacker=null){if(runtime.fishingTarget)runtime.stopFishing();lastDeathCause=cause;if(attacker)lastDeathBoar=attacker;playerDamageSound();const d=runtime.$('damageFlash'),h=runtime.$('hud');d.classList.remove('hit');h.classList.remove('hurt');void d.offsetWidth;d.classList.add('hit');h.classList.add('hurt');setTimeout(()=>{d.classList.remove('hit');h.classList.remove('hurt')},520)}

function sound(freq=330,duration=.14,type="sine"){softEffectTone(freq,duration,type,.035)}

function bonusSound(){[[520,0],[780,.10],[1040,.20],[390,.32]].forEach(([f,d])=>softEffectTone(f,.17,'sine',.024,d,f*1.10))}
 return {
  bindings:{
"level":{get:()=>level,set:value=>{level=value}},
"food":{get:()=>food,set:value=>{food=value}},
"score":{get:()=>score,set:value=>{if(!runtime.cheatSession?.active)score=value}},
"familyFound":{get:()=>familyFound,set:value=>{familyFound=value}},
"friend":{get:()=>friend,set:value=>{friend=value}},
"friendHP":{get:()=>friendHP,set:value=>{friendHP=value}},
"bossHits":{get:()=>bossHits,set:value=>{bossHits=value}},
"levelTime":{get:()=>levelTime,set:value=>{levelTime=value}},
"damage":{get:()=>damage,set:value=>{damage=value}},
"paused":{get:()=>paused,set:value=>{paused=value}},
"levels":{get:()=>levels},
"portalObj":{get:()=>portalObj,set:value=>{portalObj=value}},
"familyMembers":{get:()=>familyMembers},
"crates":{get:()=>crates},
"shots":{get:()=>shots},
"audio":{get:()=>audio,set:value=>{audio=value}},
"sfxEnabled":{get:()=>sfxEnabled,set:value=>{sfxEnabled=value}},
"musicEnabled":{get:()=>musicEnabled,set:value=>{musicEnabled=value}},
"throwCooldown":{get:()=>throwCooldown,set:value=>{throwCooldown=value}},
"musicPlayer":{get:()=>musicPlayer,set:value=>{musicPlayer=value}},
"forageTimer":{get:()=>forageTimer,set:value=>{forageTimer=value}},
"friendAttack":{get:()=>friendAttack,set:value=>{friendAttack=value}},
"hasFlashlight":{get:()=>hasFlashlight,set:value=>{hasFlashlight=value}},
"flashlightObj":{get:()=>flashlightObj,set:value=>{flashlightObj=value}},
"fireballs":{get:()=>fireballs,set:value=>{fireballs=value}},
"levelBoarsTotal":{get:()=>levelBoarsTotal,set:value=>{levelBoarsTotal=value}},
"levelBoarsDone":{get:()=>levelBoarsDone,set:value=>{levelBoarsDone=value}},
"levelFamilyTotal":{get:()=>levelFamilyTotal,set:value=>{levelFamilyTotal=value}},
"levelFamilyDone":{get:()=>levelFamilyDone,set:value=>{levelFamilyDone=value}},
"familyPopupOpen":{get:()=>familyPopupOpen,set:value=>{familyPopupOpen=value}},
"totalTime":{get:()=>totalTime,set:value=>{totalTime=value}},
"yellowMushroomStock":{get:()=>yellowMushroomStock,set:value=>{yellowMushroomStock=value}},
"yellowAppleStock":{get:()=>yellowAppleStock,set:value=>{yellowAppleStock=value}},
"boarFormTime":{get:()=>boarFormTime,set:value=>{boarFormTime=value}},
"boarFormVisual":{get:()=>boarFormVisual,set:value=>{boarFormVisual=value}},
"catFormTime":{get:()=>catFormTime,set:value=>{catFormTime=value}},
"catFormModel":{get:()=>catFormModel,set:value=>{catFormModel=value}},
"statsData":{get:()=>statsData,set:value=>{statsData=value}},
"endShown":{get:()=>endShown,set:value=>{endShown=value}},
"bossRage":{get:()=>bossRage,set:value=>{bossRage=value}},
"bossSummon":{get:()=>bossSummon,set:value=>{bossSummon=value}},
"bossVictoryTimer":{get:()=>bossVictoryTimer,set:value=>{bossVictoryTimer=value}},
"bossFireworkTimer":{get:()=>bossFireworkTimer,set:value=>{bossFireworkTimer=value}},
"burningTrees":{get:()=>burningTrees,set:value=>{burningTrees=value}},
"charredStumps":{get:()=>charredStumps,set:value=>{charredStumps=value}},
"resultSaving":{get:()=>resultSaving,set:value=>{resultSaving=value}},
"resultLocalSaved":{get:()=>resultLocalSaved,set:value=>{resultLocalSaved=value}},
"resultGlobalSaved":{get:()=>resultGlobalSaved,set:value=>{resultGlobalSaved=value}},
"soundscape":{get:()=>soundscape,set:value=>{soundscape=value}},
"audioBus":{get:()=>audioBus},
"effect":{get:()=>effect},
"softEffectTone":{get:()=>softEffectTone},
"softBoarDefeatSound":{get:()=>softBoarDefeatSound},
"softBoarAttackSound":{get:()=>softBoarAttackSound},
"playerDamageSound":{get:()=>playerDamageSound},
"lastDeathCause":{get:()=>lastDeathCause,set:value=>{lastDeathCause=value}},
"lastDeathBoar":{get:()=>lastDeathBoar,set:value=>{lastDeathBoar=value}},
"deathSceneActive":{get:()=>deathSceneActive,set:value=>{deathSceneActive=value}},
"deathSceneFinished":{get:()=>deathSceneFinished,set:value=>{deathSceneFinished=value}},
"playerHitFeedback":{get:()=>playerHitFeedback},
"sound":{get:()=>sound},
"bonusSound":{get:()=>bonusSound},
"N":{get:()=>N},
"MUSIC_THEMES":{get:()=>MUSIC_THEMES}
  },
  initialize(){

/* init:let */ level = 1;
/* init:let */ food = 4;
/* init:let */ score = 0;
/* init:let */ familyFound = 0;
/* init:let */ friend = null;
/* init:let */ friendHP = 4;
/* init:let */ bossHits = 0;
/* init:let */ levelTime = 0;
/* init:let */ damage = 0;
/* init:let */ paused = false;

/* init:const */ levels = ["🌲 Лес","🌊 Озеро","🏘️ Деревня","🏞️ Река","⛰️ Горы","👑 Кабанье логово"];

/* init:let */ portalObj = null;

/* init:const */ familyMembers = [];

/* init:const */ crates = [];

/* init:const */ shots = [];

/* init:let */ audio = null;
/* init:let */ sfxEnabled = localStorage.getItem('kabanchiki3d_sfx')!=='0';
/* init:let */ musicEnabled = localStorage.getItem('kabanchiki3d_music')!=='0';
/* init:let */ throwCooldown = 0;
/* init:let */ musicPlayer = null;
/* init:let */ forageTimer = 18;
/* init:let */ friendAttack = 0;
/* init:let */ hasFlashlight = false;
/* init:let */ flashlightObj = null;
/* init:let */ fireballs = [];
/* init:let */ levelBoarsTotal = 0;
/* init:let */ levelBoarsDone = 0;
/* init:let */ levelFamilyTotal = 0;
/* init:let */ levelFamilyDone = 0;
/* init:let */ familyPopupOpen = false;
/* init:let */ totalTime = 0;
/* init:let */ yellowMushroomStock = 0;
/* init:let */ yellowAppleStock = 0;
/* init:let */ boarFormTime = 0;
/* init:let */ boarFormVisual = null;
/* init:let */ catFormTime = 0;
/* init:let */ catFormModel = null;
/* init:let */ statsData = {fed:0,forage:0,berries:0,damage:0,family:0,minions:0,bossHits:0};
/* init:let */ endShown = false;
/* init:let */ bossRage = 1;
/* init:let */ bossSummon = 7;
/* init:let */ bossVictoryTimer = null;
/* init:let */ bossFireworkTimer = 0;
/* init:let */ burningTrees = new Map();
/* init:let */ charredStumps = [];
/* init:let */ resultSaving = false;
/* init:let */ resultLocalSaved = false;
/* init:let */ resultGlobalSaved = false;

/* init:let */ soundscape = null;

/* init:let */ lastDeathCause = 'boar';
/* init:let */ lastDeathBoar = null;
/* init:let */ deathSceneActive = false;
/* init:let */ deathSceneFinished = false;

// v157: rounded event transients and a shared compressor keep effects clear above the score.
// The music intentionally avoids bright bell/chiptune timbres; every voice passes through a low-pass filter.
/* init:const */ N = {C3:131,D3:147,E3:165,F3:175,G3:196,A3:220,B3:247,C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784,A5:880,B5:988,C6:1047};

/* init:const */ MUSIC_THEMES = [
 {name:'forest',tempo:180,cutoff:1050,lead:[262,0,294,330,294,262,220,0,196,220,262,294,262,220,196,0,262,294,330,392,330,294,262,0,220,262,294,262,220,196,165,0,196,220,262,0,294,262,220,196,165,0,196,220,262,220,196,165,0,220,262,294,262,220,196,165,0,165,196,220,262,220,196,165,0],bass:[65,65,98,98,73,73,98,98,87,87,65,65,98,98,65,65],pad:[131,165,196],pulse:[131,196,165,196]},
 {name:'lake',tempo:188,cutoff:900,lead:[220,0,262,330,294,262,220,0,196,220,262,294,262,220,196,0,330,294,262,0,220,262,330,0,349,330,294,262,220,196,220,0,262,294,330,392,330,294,262,0,220,262,294,262,220,196,165,0,220,262,330,294,262,220,196,0,165,196,220,262,220,196,165,0],bass:[55,55,82,82,65,65,98,98,49,49,73,73,82,82,55,55],pad:[110,131,165],pulse:[110,165,131,165]},
 {name:'village',tempo:172,cutoff:1150,lead:[196,262,330,392,330,262,294,0,330,392,440,392,330,294,262,0,262,330,392,523,494,392,330,0,294,330,392,330,294,262,196,0,220,262,349,440,392,349,330,0,196,262,330,392,330,294,262,0,330,392,523,494,440,392,330,0,294,330,392,330,294,262,262,0],bass:[65,65,98,98,55,55,82,82,87,87,65,65,98,98,65,65],pad:[131,165,196],pulse:[131,196,165,196]},
 {name:'mountains',tempo:196,cutoff:850,lead:[165,0,247,330,294,247,220,0,196,220,247,294,247,220,196,0,330,392,494,440,392,330,294,0,247,294,330,392,330,294,247,0,220,247,294,330,294,247,220,0,196,247,330,294,247,220,196,0,247,294,392,330,294,247,220,0,196,220,247,294,247,220,165,0],bass:[41,41,62,62,49,49,73,73,55,55,41,41,62,62,41,41],pad:[82,98,123],pulse:[82,123,98,123]},
 {name:'boss',tempo:158,cutoff:720,lead:[165,0,165,196,220,196,165,0,147,165,196,247,220,196,165,0,165,196,247,262,247,220,196,0,175,220,262,247,220,196,175,0,165,165,196,220,247,220,196,0,147,175,220,262,247,220,196,0,165,196,247,330,294,247,220,0,196,220,247,196,165,147,165,0],bass:[41,41,49,49,55,55,49,49,36.5,36.5,41,41,31,31,41,41],pad:[82,98,123],pulse:[82,123,98,123]}
];
  }
 };

}
