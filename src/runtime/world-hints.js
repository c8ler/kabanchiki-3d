import {blockedExitHint} from "../exit-hints.js?v=221";
import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 2 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let hintPoint;

function updateAdventureHints(now){
 const active=runtime.started&&!runtime.paused&&!runtime.cinematicRunning&&!runtime.endShown&&runtime.life>0;runtime.adventureHud.active(active);runtime.$('bombAction').hidden=!active||runtime.mountedFriend||runtime.adventureInventory.bombs<=0;runtime.$('dismountAction').hidden=!active||!runtime.mountedFriend;if(!active)return;
 runtime.camera.updateMatrixWorld();
 const screen=(x,y,z)=>{hintPoint.set(x,y,z).project(runtime.camera);if(hintPoint.z<-1||hintPoint.z>1||Math.abs(hintPoint.x)>.95||Math.abs(hintPoint.y)>.9)return null;return {x:(hintPoint.x*.5+.5)*innerWidth,y:(-.5*hintPoint.y+.5)*innerHeight}};
 let goal=null;const boss=runtime.level===6?runtime.foes.find(f=>f.isBoss):null;
 const exit=blockedExitHint({level:runtime.level,boarsDone:runtime.levelBoarsDone,boarsTotal:runtime.levelBoarsTotal,familyDone:runtime.levelFamilyDone,familyTotal:runtime.levelFamilyTotal,missingRoles:runtime.familyMembers.filter(f=>!f.done).map(f=>f.role),boss},runtime.boy.position.x,runtime.boy.position.z);
 if(exit){goal={...(screen(0,3.1,runtime.level===1?-33:-37)||{x:innerWidth*.5,y:innerHeight*.24}),text:exit,kind:'exit'}}
 else if(boss){const point=screen(boss.g.position.x,boss.g.position.y+4.6,boss.g.position.z);if(point)goal={...point,text:'Босс · '+boss.hp+'/'+boss.maxHp,ratio:boss.hp/boss.maxHp,kind:'boss'};}
 else if(runtime.questsComplete()&&runtime.level<6){const z=runtime.level===1?-33:-37,point=screen(0,3.1,z);if(point&&Math.hypot(runtime.boy.position.x,runtime.boy.position.z-z)<35)goal={...point,text:(runtime.level===1?runtime.opening?.passageOpen:runtime.level===2?runtime.lakeExitReady():runtime.locationExitReady())?'Путь открыт →':'Друг открывает путь',kind:'goal'};}
 else{const member=runtime.familyMembers.filter(f=>!f.done&&f.g.visible).sort((a,b)=>a.g.position.distanceToSquared(runtime.boy.position)-b.g.position.distanceToSquared(runtime.boy.position))[0];if(member&&member.g.position.distanceTo(runtime.boy.position)<22){const point=screen(member.g.position.x,member.g.position.y+2.5,member.g.position.z);if(point)goal={...point,text:['Мама','Папа','Братик','Бабушка'][member.role]+' · подойди',kind:'goal'};}}
 runtime.adventureHud.hint('goal',goal);
 let ally=null;if(runtime.friend?.g&&runtime.friend.g.position.distanceTo(runtime.boy.position)<16&&!runtime.mountedFriend){const point=screen(runtime.friend.g.position.x,runtime.friend.g.position.y+2.5*runtime.boarScale(runtime.friend),runtime.friend.g.position.z);if(point)ally={...point,text:'Друг · '+runtime.friendHP+'/'+runtime.diffCfg().friendHP,ratio:runtime.friendHP/runtime.diffCfg().friendHP};}runtime.adventureHud.hint('friend',ally);
 const gain=runtime.adventureHud.gain,point=gain&&now<gain.until?screen(runtime.boy.position.x,runtime.boy.position.y+2.2,runtime.boy.position.z):null;runtime.adventureHud.hint('reward',point?{...point,text:gain.text,kind:'reward'}:null);
}
 return {
  bindings:{
"hintPoint":{get:()=>hintPoint},
"updateAdventureHints":{get:()=>updateAdventureHints}
  },
  initialize(){


/* init:const */ hintPoint = new THREE.Vector3();
  }
 };

}
