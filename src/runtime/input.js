import * as THREE from "../../vendor/three/three.module.min.js";
import { BOSS_HITS } from "../world-surface.js?v=218";

// Owns 9 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let stickEl,nub,editable;

function closeDifficultyChoice(){
  runtime.$('difficultyScreen').style.display='none';
  runtime.$('difficultyStart').innerHTML='Отправиться в путь <span>→</span>';
  if(runtime.difficultyFromPause){runtime.difficultyFromPause=false;runtime.$('pauseMenu').style.display='grid'}
  else runtime.$('intro').style.display='grid';
}

function requestDesktopMouseLock(){
 if(runtime.mobile||runtime.__autoTest)return false;
 const el=runtime.renderer.domElement,request=el.requestPointerLock||el.webkitRequestPointerLock;
 if(!request)return false;
 try{const result=request.call(el);result?.catch?.(()=>{});return true}catch{return false}
}

function endCameraDrag(e){if(runtime.drag?.id===e.pointerId)runtime.drag=null}

function setStick(e){const r=stickEl.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.max(1,Math.hypot(dx,dy)),s=Math.min(1,len/52);runtime.stick.x=dx/len*s;runtime.stick.y=dy/len*s;nub.style.transform=`translate(${runtime.stick.x*43}px,${runtime.stick.y*43}px)`}

function resetStick(e){if(runtime.stickPointer===e.pointerId){runtime.stickPointer=null;runtime.stick.x=runtime.stick.y=0;nub.style.transform=''}}

function clearInput(){runtime.keys={};runtime.drag=null;runtime.stickPointer=null;runtime.stick.x=runtime.stick.y=0;nub.style.transform='';runtime.jump=false;runtime.act=false}
 return {
  bindings:{
"closeDifficultyChoice":{get:()=>closeDifficultyChoice},
"requestDesktopMouseLock":{get:()=>requestDesktopMouseLock},
"endCameraDrag":{get:()=>endCameraDrag},
"stickEl":{get:()=>stickEl},
"nub":{get:()=>nub},
"setStick":{get:()=>setStick},
"resetStick":{get:()=>resetStick},
"editable":{get:()=>editable},
"clearInput":{get:()=>clearInput}
  },
  initialize(){

runtime.$('difficultyBack').onclick=closeDifficultyChoice;

runtime.$('menuDifficulty').onclick=()=>{
  runtime.difficultyFromPause=true;
  document.querySelector(`input[name="diff3d"][value="${runtime.selectedDiff}"]`).checked=true;
  runtime.$('pauseMenu').style.display='none';runtime.$('difficultyScreen').style.display='grid';
  runtime.$('difficultyStart').textContent='Применить сложность';
};

runtime.$('difficultyStart').onclick=()=>{
  if(!runtime.difficultyFromPause)return runtime.startDifficultyRun();
  const previous=runtime.diffCfg(),next=Number(document.querySelector('input[name="diff3d"]:checked')?.value??runtime.selectedDiff);
  const healthRatio=runtime.life/previous.playerHP,friendRatio=runtime.friendHP/previous.friendHP;
  runtime.selectedDiff=next;
  runtime.life=Math.max(1,Math.ceil(healthRatio*runtime.diffCfg().playerHP));
  runtime.friendHP=Math.max(1,Math.ceil(friendRatio*runtime.diffCfg().friendHP));
  runtime.food=Math.min(runtime.food,runtime.foodCapacity());
  const boss=runtime.foes.find(f=>f.isBoss);
  if(boss&&boss.hp>0){const ratio=boss.hp/boss.maxHp;boss.maxHp=BOSS_HITS[runtime.selectedDiff];boss.hp=Math.max(1,Math.ceil(ratio*boss.maxHp))}
  closeDifficultyChoice();runtime.hud();runtime.notice(`🎮 Сложность: ${runtime.DIFF_NAMES[runtime.selectedDiff]}`);
};

document.addEventListener('pointerlockchange',()=>{if(!runtime.mobile&&runtime.started&&!runtime.cinematicRunning&&!runtime.win&&!runtime.endShown&&!document.pointerLockElement&&!runtime.paused)runtime.setPause(true)});

document.addEventListener('webkitpointerlockchange',()=>{if(!runtime.mobile&&runtime.started&&!runtime.cinematicRunning&&!runtime.win&&!runtime.endShown&&!document.pointerLockElement&&!document.webkitPointerLockElement&&!runtime.paused)runtime.setPause(true)});

document.addEventListener('mousemove',e=>{
 const locked=document.pointerLockElement===runtime.renderer.domElement||document.webkitPointerLockElement===runtime.renderer.domElement;
 if(!runtime.mobile&&locked&&runtime.started&&!runtime.paused&&!runtime.cinematicRunning){runtime.yaw-=e.movementX*.0027;if(runtime.camMode===9)runtime.pitch=Math.max(-1.2,Math.min(1.2,runtime.pitch-e.movementY*.0027));}
});

document.addEventListener('fullscreenchange',runtime.syncFullscreenButton);

document.addEventListener('webkitfullscreenchange',runtime.syncFullscreenButton);

document.addEventListener('mozfullscreenchange',runtime.syncFullscreenButton);

document.addEventListener('MSFullscreenChange',runtime.syncFullscreenButton);

document.addEventListener('keydown',e=>{if(runtime.gameInformation.isOpen){if(e.code==='Escape')runtime.gameInformation.close();return}if(e.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;runtime.keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&!e.repeat){e.preventDefault();runtime.togglePause()}if(e.code==='KeyV'&&!e.repeat)runtime.$('camera').click();if(e.code==='Space'&&!e.repeat){runtime.queuePlayerJump()};if((e.code==='KeyE'||e.code==='KeyF')&&!e.repeat)runtime.feed();if((e.code==='Enter'||e.code==='NumpadEnter')&&!e.repeat&&runtime.started&&!runtime.paused&&!runtime.win&&!runtime.endShown&&!runtime.cinematicRunning&&!e.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])')){e.preventDefault();runtime.feed()}if(e.code==='KeyB'&&!e.repeat)runtime.interactHome();if(e.code==='KeyQ'&&!e.repeat)runtime.dismountFriendNow();if(e.code==='KeyZ'&&!e.repeat)runtime.$('rotateCraft').click();if(e.code==='KeyR'&&!e.repeat)runtime.gatherCraftMaterial();if(e.code==='KeyT'&&!e.repeat)runtime.placeCraftItem();if(e.code==='KeyG'&&!e.repeat)runtime.placeAdventureBomb();if(e.code==='KeyC'&&!e.repeat&&runtime.craftUnlocked&&runtime.started&&!runtime.cinematicRunning&&!runtime.endShown){runtime.openSecretMenu();runtime.$('craftPanel').open=true;runtime.$('craftPanel').scrollIntoView({block:'center'});}if(e.code==='KeyP'&&!e.repeat)runtime.togglePause()});

document.addEventListener('keyup',e=>runtime.keys[e.code]=false);

runtime.renderer.domElement.addEventListener('pointerdown',e=>{e.preventDefault();if(!runtime.started)return;if(e.pointerType==='mouse'){
 const locked=document.pointerLockElement===runtime.renderer.domElement||document.webkitPointerLockElement===runtime.renderer.domElement;
 if(e.button===0){if(locked&&!runtime.paused&&!runtime.cinematicRunning)runtime.feed();else requestDesktopMouseLock();return}
 if(e.button===2){if(locked&&!runtime.paused&&!runtime.cinematicRunning){runtime.queuePlayerJump()}else requestDesktopMouseLock();return}
 return
}runtime.drag={id:e.pointerId,x:e.clientX,y:e.clientY};try{runtime.renderer.domElement.setPointerCapture(e.pointerId)}catch(_){}});

runtime.renderer.domElement.addEventListener('pointermove',e=>{if(e.cancelable)e.preventDefault();const locked=document.pointerLockElement===runtime.renderer.domElement||document.webkitPointerLockElement===runtime.renderer.domElement;if(e.pointerType==='mouse'&&locked)return;if(runtime.drag?.id!==e.pointerId)return;const delta=e.clientX-runtime.drag.x;/* v165: touch keeps drag camera; desktop prefers pointer-lock mouse look with drag fallback. */runtime.yaw+=(e.pointerType==='touch'?-delta:delta)*.006;if(runtime.camMode===9)runtime.pitch=Math.max(-1.2,Math.min(1.2,runtime.pitch-(e.clientY-runtime.drag.y)*.005));runtime.drag.x=e.clientX;runtime.drag.y=e.clientY});

runtime.renderer.domElement.addEventListener('pointerup',endCameraDrag);

runtime.renderer.domElement.addEventListener('pointercancel',endCameraDrag);

runtime.renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());

/* init:const */ stickEl = runtime.$('stick');
/* init:const */ nub = runtime.$('nub');

stickEl.addEventListener('pointerdown',e=>{e.preventDefault();runtime.stickPointer=e.pointerId;try{stickEl.setPointerCapture(e.pointerId)}catch{}setStick(e)});

stickEl.addEventListener('pointermove',e=>{if(e.cancelable)e.preventDefault();if(runtime.stickPointer===e.pointerId)setStick(e)});

stickEl.addEventListener('lostpointercapture',resetStick);

stickEl.addEventListener('pointerup',resetStick);

stickEl.addEventListener('pointercancel',resetStick);

addEventListener('resize',()=>{runtime.camera.aspect=innerWidth/innerHeight;runtime.camera.updateProjectionMatrix();runtime.renderer.setSize(innerWidth,innerHeight)});

runtime.makePortal();

/* init:const */ editable = e=>e.target?.closest?.('input,textarea,[contenteditable="true"]');

for(const event of ['selectstart','dragstart','gesturestart','gesturechange','gestureend'])document.addEventListener(event,e=>{if(!editable(e)&&e.cancelable)e.preventDefault()},{passive:false});

for(const event of ['touchstart','touchmove'])document.addEventListener(event,e=>{if(runtime.started&&!runtime.paused&&!runtime.cinematicRunning&&!editable(e)&&!e.target?.closest?.('button,select')&&e.cancelable)e.preventDefault()},{passive:false});

addEventListener('blur',clearInput);

document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInput()});

runtime.renderer.domElement.addEventListener('lostpointercapture',endCameraDrag);

// Local visual inspection helper, available only in the existing autotest mode.
if(runtime.__autoTest)window.__KABANCHIKI_VISUAL__={focus(kind){if(kind==='portal'){runtime.portalObj.g.visible=true;runtime.boy.position.set(0,0,-35);runtime.yaw=Math.PI;runtime.camMode=1}else{const f=runtime.foes.find(f=>!f.flee);if(!f)return;runtime.boy.position.set(f.g.position.x,0,f.g.position.z+6);f.g.rotation.y=0;runtime.yaw=Math.PI;runtime.camMode=4}return {enemyEyes:runtime.foes.flatMap(f=>f.g.userData.enemyEyes||[]).filter(e=>e.visible).length,portalVisible:runtime.portalObj.g.visible}},befriend(){const f=runtime.foes[0];if(f)runtime.resolveMeat({g:new THREE.Group(),foe:f,type:'apple'});return runtime.friend?.g.userData.enemyEyes.every(e=>!e.visible)}};
  }
 };

}
