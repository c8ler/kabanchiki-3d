import { CampaignProgress } from "../campaign-progress.js?v=220";
import { DismountLatch } from "../mount-transition.js?v=220";
import { installMenuViewport } from "../menu-viewport.js?v=220";
import { FirstPersonFood } from "../first-person-food.js?v=220";
import * as THREE from "../../vendor/three/three.module.min.js";
import { AttemptProgress } from "../seasons.js?v=220";

// Owns 37 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let __loadFinished,GAME_VERSION,campaignProgress,dismountLatch,attemptProgress,currentSeason,chosenSeason,SUPABASE_URL,SUPABASE_KEY,$,mobile,started,first,life,rescued,win,invuln,flash,camMode,yaw,pitch,move,jump,act,keys,drag,stickPointer,stick,__autoParams,__autoTest,scene,camera,foodView,renderer;

function unlockedSeasons(){return attemptProgress.failed>=60?['summer','autumn','winter','spring']:attemptProgress.failed>=40?['summer','autumn','winter']:attemptProgress.failed>=20?['summer','autumn']:['summer']}

function syncSeasonChoices(){for(const id of ['introSeason','pauseSeason']){const select=document.getElementById(id);if(!select)continue;select.parentElement.hidden=unlockedSeasons().length<2;select.replaceChildren(...unlockedSeasons().map(value=>{const option=document.createElement('option');option.value=value;option.textContent={summer:'☀️ Лето',autumn:'🍂 Осень',winter:'❄️ Зима',spring:'🌸 Весна'}[value];return option}));select.value=currentSeason}}

function chooseSeason(event){if(runtime.sandboxMode){syncSeasonChoices();return}const value=event.target.value;if(!unlockedSeasons().includes(value))return;chosenSeason=value;currentSeason=value;try{localStorage.setItem('kabanchiki3d_chosen_season',value)}catch{}if(started){runtime.clearWorldFires();scene.background.set([0xeac096,0xe9a67f,0xd99580,0x707686,0x34385e,0x080611][runtime.level-1]);scene.fog.color.copy(scene.background);scene.fog.near=runtime.level===1?32:runtime.level===4?18:runtime.level>=5?9:28;scene.fog.far=runtime.level===1?88:runtime.level===4?62:runtime.level>=5?38:78;runtime.sun.intensity=[2.8,2.35,1.95,1.05,.28,.015][runtime.level-1];runtime.hemi.intensity=[1.65,1.75,1.38,1.0,.75,.075][runtime.level-1];runtime.applySeason();const pos=runtime.surfaceGeometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,runtime.groundSurfaceHeightAt(pos.getX(i),-pos.getY(i)));pos.needsUpdate=true;runtime.surfaceGeometry.computeVertexNormals();runtime.hud()}else syncSeasonChoices()}
 return {
  bindings:{
"__loadFinished":{get:()=>__loadFinished,set:value=>{__loadFinished=value}},
"GAME_VERSION":{get:()=>GAME_VERSION},
"campaignProgress":{get:()=>campaignProgress},
"dismountLatch":{get:()=>dismountLatch},
"attemptProgress":{get:()=>attemptProgress},
"currentSeason":{get:()=>currentSeason,set:value=>{currentSeason=value}},
"chosenSeason":{get:()=>chosenSeason,set:value=>{chosenSeason=value}},
"unlockedSeasons":{get:()=>unlockedSeasons},
"syncSeasonChoices":{get:()=>syncSeasonChoices},
"chooseSeason":{get:()=>chooseSeason},
"SUPABASE_URL":{get:()=>SUPABASE_URL},
"SUPABASE_KEY":{get:()=>SUPABASE_KEY},
"$":{get:()=>$},
"mobile":{get:()=>mobile},
"started":{get:()=>started,set:value=>{started=value}},
"first":{get:()=>first,set:value=>{first=value}},
"life":{get:()=>life,set:value=>{life=value}},
"rescued":{get:()=>rescued,set:value=>{rescued=value}},
"win":{get:()=>win,set:value=>{win=value}},
"invuln":{get:()=>invuln,set:value=>{invuln=value}},
"flash":{get:()=>flash,set:value=>{flash=value}},
"camMode":{get:()=>camMode,set:value=>{camMode=value}},
"yaw":{get:()=>yaw,set:value=>{yaw=value}},
"pitch":{get:()=>pitch,set:value=>{pitch=value}},
"move":{get:()=>move,set:value=>{move=value}},
"jump":{get:()=>jump,set:value=>{jump=value}},
"act":{get:()=>act,set:value=>{act=value}},
"keys":{get:()=>keys,set:value=>{keys=value}},
"drag":{get:()=>drag,set:value=>{drag=value}},
"stickPointer":{get:()=>stickPointer,set:value=>{stickPointer=value}},
"stick":{get:()=>stick,set:value=>{stick=value}},
"__autoParams":{get:()=>__autoParams},
"__autoTest":{get:()=>__autoTest},
"scene":{get:()=>scene},
"camera":{get:()=>camera},
"foodView":{get:()=>foodView},
"renderer":{get:()=>renderer}
  },
  initialize(){

window.__gameLoadProgress?.(84);

/* init:let */ __loadFinished = false;

/* init:const */ GAME_VERSION = 'v220';

/* init:const */ campaignProgress = new CampaignProgress(window.localStorage);

installMenuViewport(window,document);

/* init:const */ dismountLatch = new DismountLatch();

/* init:const */ attemptProgress = new AttemptProgress((()=>{try{return window.localStorage}catch{return null}})());

/* init:let */ currentSeason = attemptProgress.season;

/* init:let */ chosenSeason = null;

try{chosenSeason=localStorage.getItem('kabanchiki3d_chosen_season')}catch{}

if(unlockedSeasons().includes(chosenSeason))currentSeason=chosenSeason;else chosenSeason=null;

// v103: GAME_VERSION is the single runtime source of truth for every visible version label.
window.__KABANCHIKI_VERSION__=GAME_VERSION;

for(const id of ['loadingVersion']){const el=document.getElementById(id);if(el)el.textContent=GAME_VERSION;}

document.title=`Кабанчики 3D ${GAME_VERSION}`;

/* init:const */ SUPABASE_URL = 'https://usszaimdbepgexnigiau.supabase.co';

/* init:const */ SUPABASE_KEY = 'sb_publishable_x3H1Px6JaDTwpyZy_ARyiA_OqEKLINZ';
 /* init:const */ $ = id=>document.getElementById(id);
/* init:const */ mobile = matchMedia('(pointer:coarse)').matches;

if(mobile){$('message').textContent='🕹️ Джойстик — идти · проведи пальцем — камера · справа — Прыжок и Кормить';$('introControls').innerHTML='<b>На телефоне:</b> левый джойстик — движение, проведи пальцем по миру — поворот камеры, кнопки «Прыжок» и «Кормить» справа.';$('pauseControls').innerHTML='<b>Телефон:</b> левый джойстик — движение · проведи пальцем по миру — камера · кнопки «Прыжок» и «Кормить» справа.'}else{$('message').textContent='W/S — вперёд/назад · A/D и ←/→ — стрейф · мышь — камера · ЛКМ — кормить · ПКМ — прыжок';$('introControls').innerHTML='<b>На ПК:</b> W/S и ↑/↓ — вперёд/назад, A/D и ←/→ — стрейф, ПРОБЕЛ/ПКМ — прыжок, ЛКМ/E/F/Enter — бросить еду, V — сменить вид, ESC — пауза. Мышь сразу поворачивает камеру.';$('pauseControls').innerHTML='<b>Управление ПК:</b> W/S и ↑/↓ — вперёд/назад · A/D и ←/→ — стрейф · ПРОБЕЛ/ПКМ — прыжок · ЛКМ/E/F/Enter — кормить · мышь — камера без зажатия · V — вид · Q — спрыгнуть · G — поставить бомбочку · C — крафт · ESC — меню.'}

/* init:let */ started = false;
/* init:let */ first = false;
/* init:let */ life = 5;
/* init:let */ rescued = 0;
/* init:let */ win = false;
/* init:let */ invuln = 0;
/* init:let */ flash = 0;
/* init:let */ camMode = mobile?0:4;
/* init:let */ yaw = 0;
/* init:let */ pitch = .18;
/* init:let */ move = {x:0,z:0};
/* init:let */ jump = false;
/* init:let */ act = false;
/* init:let */ keys = {};
/* init:let */ drag = null;
/* init:let */ stickPointer = null;
/* init:let */ stick = {x:0,y:0};

$('camera').textContent=`📷 Вид ${camMode+1}/10`;

/* init:const */ __autoParams = new URLSearchParams(location.search);
/* init:const */ __autoTest = __autoParams.get('autotest')==='1';

window.__KABANCHIKI_TEST__={version:GAME_VERSION,ready:false,level:0,errors:[]};

if(window.__KABANCHIKI_BUILD__&&window.__KABANCHIKI_BUILD__!==GAME_VERSION)window.__KABANCHIKI_TEST__.errors.push(`version-mismatch:${window.__KABANCHIKI_BUILD__}:${GAME_VERSION}`);

if(__autoTest){let __seed=1337;Math.random=()=>{__seed=(__seed*1664525+1013904223)>>>0;return __seed/4294967296}}


/* init:const */ scene = new THREE.Scene();

scene.background=new THREE.Color(0x9bd2f1);

scene.fog=new THREE.Fog(0x9bd2f1,35,83);

/* init:const */ camera = new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.08,110);

scene.add(camera);

/* init:const */ foodView = new FirstPersonFood(THREE,camera);

/* init:const */ renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});

renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));

renderer.setSize(innerWidth,innerHeight);

renderer.shadowMap.enabled=!mobile;

renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  }
 };

}
