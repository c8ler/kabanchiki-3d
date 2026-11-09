import * as T from '../../vendor/three/three.module.min.js';
export function createQaPart(runtime){
 const snap=()=>({...runtime.caravanSnapshot(),food:runtime.food,life:runtime.life,wood:runtime.adventureInventory.wood,wool:runtime.adventureInventory.wool,budget:runtime.enforceCreatureLimit(true).total});
 const tick=seconds=>{runtime.paused=false;for(let i=0;i<Math.ceil(seconds*10);i++)runtime.updateCaravan(.1);runtime.paused=true;return snap()};
 const move=(side=3.5,back=0)=>{const p=runtime.caravanSnapshot().point;runtime.boy.position.set(p.x+Math.cos(p.yaw)*side+Math.sin(p.yaw)*back,0,p.z-Math.sin(p.yaw)*side+Math.cos(p.yaw)*back);runtime.py=runtime.vy=0;runtime.yaw=Math.atan2(p.x-runtime.boy.position.x,p.z-runtime.boy.position.z);runtime.camMode=1;runtime.keys={}};
 return{
 v228Setup(){this.v222Setup(3);runtime.started=true;runtime.win=false;runtime.endShown=false;for(const id of ['intro','pauseMenu','difficultyScreen','secretMenu'])runtime.$(id).style.display='none';runtime.resetCheatMode();runtime.clearEntities(runtime.foes);runtime.clearEntities(runtime.defeatedBoars);runtime.clearEntities(runtime.friends);if(runtime.friend)runtime.friend.g.removeFromParent();runtime.friend=null;runtime.mountedFriend=false;runtime.catLife.root.visible=false;runtime.resetNature();runtime.resetMonsters();runtime.resetSpiders();runtime.craftWorld.clear();runtime.resetCaravan(3);runtime.boy.position.set(0,0,34);runtime.invuln=999;tick(9);const hiddenBefore=runtime.caravanSnapshot().state;runtime.applyCheat('CARAVAN');move(0,9);runtime.boarFormTime=0;return{hiddenBefore,...snap()}},
 v228Inspect(){return{...snap(),cheats:runtime.cheatSession.active}},
 v228Menu(){runtime.openSecretMenu();return snap()},
 v228Toggle(){runtime.applyCheat('CARAVAN');return snap()},
 v228Exit(){runtime.exitCheatMode();tick(20);return{...snap(),cheats:runtime.cheatSession.active}},
 v228Move(helper=false){move();runtime.boarFormTime=helper?30:0;runtime.catFormTime=0;runtime.paused=false;runtime.syncCaravanUI();return snap()},
 v228Key(helper=false){runtime.boarFormTime=helper?30:0;runtime.paused=false;document.dispatchEvent(new KeyboardEvent('keydown',{key:'e',code:'KeyE',bubbles:true}));runtime.paused=true;return snap()},
 v228Tick:tick,
 v228Wall(){const p=runtime.caravanSnapshot().point;runtime.craftWorld.create('wall',p.x+Math.sin(p.yaw)*8,0,p.z+Math.cos(p.yaw)*8,runtime.level);tick(8);const before=runtime.caravanSnapshot().point;tick(2);return{before,after:runtime.caravanSnapshot().point,...snap()}},
 v228Roof(){const p=runtime.caravanSnapshot().point;runtime.py=3;return{support:runtime.playerSupportHeightAtNoRock(p.x,p.z),blocked:runtime.playerWorldBlocked(p.x,p.z)}} ,
 v228Collision(){runtime.py=0;const p=runtime.caravanSnapshot().point;return{inside:runtime.playerWorldBlocked(p.x,p.z),outside:runtime.caravanObstacle(p.x+4,p.z),...snap()}},
 v228Loot(index){const p=runtime.caravanSnapshot().point;if(index===0)runtime.food=0;if(index===2)runtime.life=1;move(index===0?-2:index===1?2:0,index===2?-3:0);runtime.boarFormTime=0;return tick(1.2)},
 v228Bomb(){const p=runtime.caravanSnapshot().point;runtime.blastCaravan({x:p.x,z:p.z,y:0},7);return tick(1)},
 v228Limit(){for(let i=0;i<20;i++)runtime.spawnFlying('butterfly',3,true);return snap()},
 v228Leave(){runtime.loadLevel(2);runtime.paused=true;return snap()}
 };
}
