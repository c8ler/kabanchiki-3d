import * as THREE from "../../vendor/three/three.module.min.js";
import { BOAR_FORM_SECONDS, CAT_FORM_SECONDS, formTimeAfterStep } from "../form-rules.js?v=221";

// Owns 10 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

// v99: mounted riders collect tree apples without having to dismount. Keep the rule centralized so gameplay and the audit use the same code.
function canCollectForage(a){
 if(!a||a.done)return false;
 const nearForage=Math.hypot(a.x-runtime.boy.position.x,a.z-runtime.boy.position.z)<1.25;
 const appleReach=a.type!=='apple'||runtime.mountedFriend||(runtime.py>.58&&Math.abs((a.y||0)-runtime.boy.position.y)<1.18);
 return nearForage&&appleReach;
}

function updateBoarForm(dt){if(runtime.boarFormTime>0){runtime.boarFormTime=formTimeAfterStep(runtime.boarFormTime,dt);if(runtime.boarFormVisual){runtime.boarFormVisual.visible=true;runtime.boarFormVisual.position.set(runtime.boy.position.x,runtime.boy.position.y,runtime.boy.position.z);runtime.boarFormVisual.rotation.y=runtime.boy.rotation.y}if(runtime.boarFormTime<=0)endBoarForm()}}

function startBoarForm(){runtime.catFormTime=0;if(runtime.catFormModel)runtime.catFormModel.g.visible=false;runtime.boarFormTime=BOAR_FORM_SECONDS;if(runtime.mountedFriend){runtime.mountedFriend=false;runtime.setRiderPose(false);runtime.py=0;runtime.vy=0;runtime.boy.position.y=0}if(!runtime.boarFormVisual){const q=runtime.makeBoar(runtime.boy.position.x,runtime.boy.position.z,true);runtime.boarFormVisual=q.g;q.aura.visible=false;q.bolt.visible=false;for(const mesh of q.g.children)if(mesh.isMesh&&mesh.geometry.type==='RingGeometry')mesh.visible=false;q.g.scale.setScalar(.86)}runtime.boarFormVisual.visible=true;runtime.boy.visible=false;runtime.bonusSound();runtime.notice('🟡 Ягода превратила Тимура в кабанчика на 30 секунд! Можно ходить, собирать еду и кормить кабанчиков. Враги принимают Тимура за своего!')}

function startCatForm(){runtime.stopFishing();runtime.boarFormTime=0;if(runtime.boarFormVisual)runtime.boarFormVisual.visible=false;runtime.catFormTime=CAT_FORM_SECONDS;if(runtime.mountedFriend){runtime.mountedFriend=false;runtime.setRiderPose(false);runtime.py=runtime.vy=0}if(!runtime.catFormModel){runtime.catFormModel=runtime.catLife.model(2,runtime.scene);runtime.catFormModel.g.scale.setScalar(1.35)}runtime.catFormModel.g.visible=true;runtime.boy.visible=false;runtime.bonusSound();runtime.notice('🌸🐱 Тимур стал котиком на 30 секунд! Высоко прыгай и корми кабанчиков — они не атакуют.');runtime.hud()}

function updateCatForm(dt,now){if(runtime.catFormTime<=0)return;runtime.catFormTime=formTimeAfterStep(runtime.catFormTime,dt);if(runtime.catFormTime===0){runtime.catFormModel.g.visible=false;runtime.boy.visible=true;runtime.bonusSound();runtime.notice('✨ Тимур снова стал собой!')}else{runtime.catFormModel.g.position.copy(runtime.boy.position);runtime.catFormModel.g.rotation.y=runtime.boy.rotation.y;runtime.catFormModel.tail.rotation.y=Math.sin(now*.006)*.5;for(const [i,leg] of runtime.catFormModel.legs.entries())leg.rotation.x=Math.hypot(runtime.stick.x,runtime.stick.y)>.08||runtime.keys.KeyW||runtime.keys.KeyA||runtime.keys.KeyS||runtime.keys.KeyD?Math.sin(now*.018+i%2*Math.PI)*.6:0}}

function endBoarForm(){runtime.boarFormTime=0;runtime.catFormTime=0;if(runtime.catFormModel)runtime.catFormModel.g.visible=false;if(runtime.boarFormVisual)runtime.boarFormVisual.visible=false;runtime.boy.visible=true;runtime.bonusSound();runtime.notice('✨ Тимур снова стал собой!')}

function growBoarFromApple(f){if(!f?.g||f.appleGrown)return;f.appleGrown=true;f.g.scale.y*=1.5;runtime.bonusSound()}

function setBoarYellow(f){if(!f?.g||f.yellowPermanent)return;f.yellowPermanent=true;f.g.traverse(o=>{if(o.isMesh&&o.material?.color){o.material=o.material.clone();o.material.color.set(0xffd92f)}});runtime.bonusSound();runtime.notice(f.isBoss?'🟡 Босс стал жёлтым!':'🟡 Кабанчик стал жёлтым!')}

function collectForageItem(a,silent=false){
 if(!a||a.done)return false;a.done=true;runtime.scene.remove(a.g);runtime.score+=runtime.diffScore(5);
 if(a.type==='catberry'){runtime.statsData.berries++;startCatForm()}
 else if(a.bonus&&a.type==='berry'){runtime.statsData.berries++;startBoarForm()}
 else if(a.bonus&&a.type==='mushroom'){runtime.yellowMushroomStock++;runtime.statsData.forage++;runtime.bonusSound();if(!silent)runtime.notice(`🟡 Жёлтый мухомор! Следующее кормление накормит и навсегда окрасит кабанчика или босса. Запас: ${runtime.yellowMushroomStock}`)}
 else if(a.bonus&&a.type==='apple'){runtime.yellowAppleStock++;runtime.statsData.forage++;if(a.tree&&!a.tree.userData.yellowAppleGrown){a.tree.userData.beforeYellowScale=a.tree.scale.clone();a.tree.scale.y*=3;a.tree.userData.yellowAppleGrown=true;runtime.repairTreeApples([],[])}runtime.bonusSound();if(!silent)runtime.notice(`🍏✨ Жёлтое яблоко в запасе: ${runtime.yellowAppleStock}. Дерево стало втрое выше! Накорми кабанчика — он вырастет в 1,5 раза по высоте.`)}
 else if(a.type==='berry'){const before=runtime.life;runtime.life=Math.min(runtime.diffCfg().playerHP,runtime.life+1);runtime.statsData.berries++;if(!silent){runtime.sound(760,.16,'sine');runtime.notice(before<runtime.diffCfg().playerHP?'🫐 Ягоды восстановили 1❤️!':'🫐 Ягоды собраны, но здоровье уже полное.')}}
 else{runtime.food=Math.min(runtime.foodCapacity(),runtime.food+1);runtime.statsData.forage++;if(!silent){runtime.sound(560,.12,'triangle');runtime.adventureHud.log(`Собрано: ${runtime.foodLabel(a.type)} · запас еды ${runtime.food}/${runtime.foodCapacity()}`)}}
 return true;
}

function runMountedAppleAudit(){
 const issues=[];const oldMounted=runtime.mountedFriend,oldFood=runtime.food,oldScore=runtime.score,oldForage=runtime.statsData.forage,ox=runtime.boy.position.x,oz=runtime.boy.position.z,oy=runtime.boy.position.y,opy=runtime.py;
 const max=runtime.foodCapacity();const testApple={g:new THREE.Group(),x:12.25,z:-7.5,y:1.72,type:'apple',done:false};runtime.scene.add(testApple.g);testApple.g.position.set(testApple.x,testApple.y,testApple.z);
 runtime.mountedFriend=true;runtime.food=Math.max(0,max-1);runtime.boy.position.set(testApple.x,1.18,testApple.z);runtime.py=1.18;
 const before=runtime.food,reachable=canCollectForage(testApple),collected=reachable&&collectForageItem(testApple,true),after=runtime.food;
 if(!reachable)issues.push('mounted-apple-not-reachable');if(!collected||!testApple.done)issues.push('mounted-apple-not-collected');if(after!==Math.min(max,before+1))issues.push(`mounted-apple-food:${before}->${after}`);
 runtime.scene.remove(testApple.g);runtime.mountedFriend=oldMounted;runtime.food=oldFood;runtime.score=oldScore;runtime.statsData.forage=oldForage;runtime.boy.position.set(ox,oy,oz);runtime.py=opy;
 return {ok:issues.length===0,issues,reachable,collected,before,after,level: runtime.level};
}
 return {
  bindings:{
"canCollectForage":{get:()=>canCollectForage},
"updateBoarForm":{get:()=>updateBoarForm},
"startBoarForm":{get:()=>startBoarForm},
"startCatForm":{get:()=>startCatForm},
"updateCatForm":{get:()=>updateCatForm},
"endBoarForm":{get:()=>endBoarForm},
"growBoarFromApple":{get:()=>growBoarFromApple},
"setBoarYellow":{get:()=>setBoarYellow},
"collectForageItem":{get:()=>collectForageItem},
"runMountedAppleAudit":{get:()=>runMountedAppleAudit}
  },
  initialize(){

window.__KABANCHIKI_MOUNTED_APPLE_AUDIT__=runMountedAppleAudit;

window.__KABANCHIKI_ROCK_CLIMB_AUDIT__=runtime.runRockClimbAudit;

window.__KABANCHIKI_ROCK_CORRIDOR_AUDIT__=runtime.runRockCorridorAudit;

window.__KABANCHIKI_COLLISION_AUDIT__=runtime.runCollisionAudit;

window.__KABANCHIKI_SPAWN_AUDIT__=runtime.repairAndAuditSpawns;

window.__KABANCHIKI_ROBOT_TEST__=runtime.runRobotCollisionTest;
  }
 };

}
