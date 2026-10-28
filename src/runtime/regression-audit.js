import * as THREE from "../../vendor/three/three.module.min.js";
import { riverCenterAt, lakeDepth } from "../world-surface.js?v=219";

// Owns 1 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function runV156Audit(){
 const issues=[],samples=[],saved={friend: runtime.friend,friendHP: runtime.friendHP,mounted:runtime.mountedFriend,py: runtime.py,vy: runtime.vy,x:runtime.boy.position.x,y:runtime.boy.position.y,z:runtime.boy.position.z,food: runtime.food,stock:runtime.yellowAppleStock,mushrooms:runtime.yellowMushroomStock,score: runtime.score,stats:{...runtime.statsData},foes:runtime.foes.slice(),done:runtime.levelBoarsDone,form:runtime.boarFormTime,stage:runtime.weatherStage,rain:runtime.puddleRain,sfx:runtime.sfxEnabled,started: runtime.started,paused: runtime.paused,win: runtime.win,life: runtime.life,cooldown:runtime.throwCooldown,yaw: runtime.yaw};
 const f=runtime.visualOnly(()=>runtime.makeBoar(0,8,false));let tree=null,treeScale=null,treeGrown,treeBefore;
 try{
  runtime.sfxEnabled=false;runtime.mountedFriend=false;runtime.friend=null;runtime.boarFormTime=0;runtime.started=true;runtime.paused=false;runtime.win=false;runtime.life=5;runtime.throwCooldown=0;runtime.boy.position.set(0,0,4);runtime.food=0;runtime.yellowMushroomStock=0;runtime.yellowAppleStock=1;runtime.foes.splice(0,runtime.foes.length,f);runtime.yaw=0;
  const shotCount=runtime.shots.length;runtime.visualOnly(runtime.feed);const shot=runtime.shots.at(-1);if(runtime.shots.length!==shotCount+1||!shot.specialYellowApple)issues.push('yellow-apple-inventory-shot');else{runtime.visualOnly(()=>runtime.resolveMeat(shot));runtime.shots.pop();if(runtime.friend!==f||!f.friendly||Math.abs(f.g.scale.y-1.5)>.001||runtime.yellowAppleStock!==0||runtime.food!==0)issues.push('yellow-apple-growth-or-food');const h=f.g.scale.y;runtime.growBoarFromApple(f);if(f.g.scale.y!==h)issues.push('yellow-apple-growth-stacks');samples.push({appleFriend:runtime.friend===f,boarHeight:f.g.scale.y,stock:runtime.yellowAppleStock})}
  tree=runtime.treeObjects.find(t=>t.visible&&!t.userData.yellowAppleGrown);if(tree){treeScale=tree.scale.clone();treeGrown=tree.userData.yellowAppleGrown;treeBefore=tree.userData.beforeYellowScale;const item={g:new THREE.Group(),type:'apple',bonus:true,done:false,tree};const stock=runtime.yellowAppleStock;runtime.collectForageItem(item,true);if(runtime.yellowAppleStock!==stock+1||Math.abs(tree.scale.y/treeScale.y-3)>.001)issues.push('yellow-apple-tree-or-stock');samples.push({treeHeightFactor:tree.scale.y/treeScale.y});tree.scale.copy(treeScale);delete tree.userData.yellowAppleGrown;delete tree.userData.beforeYellowScale;runtime.repairTreeApples([],[]);
   const materials=[];tree.traverse(m=>{if(m.isMesh&&m.material?.emissive)materials.push([m,m.material.emissive.getHex(),m.material.color.getHex()])});runtime.igniteBossTree(tree);const fire=runtime.burningTrees.get(tree);if(!fire)issues.push('boss-tree-test-not-ignited');else{tree.remove(fire.light);tree.remove(fire.flames);runtime.burningTrees.delete(tree);runtime.restoreStormObject(tree);if(materials.some(([m,e,c])=>m.material.emissive.getHex()!==e||m.material.color.getHex()!==c))issues.push('boss-tree-red-after-reset');samples.push({bossTreeRestored:true})}
  }
  runtime.ground.updateMatrixWorld();const sp=runtime.surfaceGeometry.attributes.position;for(const i of [1577,3329,6810]){const point=new THREE.Vector3().fromBufferAttribute(sp,i).applyMatrix4(runtime.ground.matrixWorld);if(Math.abs(point.y-runtime.groundSurfaceHeightAt(point.x,point.z))>.002)issues.push('terrain-visual-height-mismatch')}
  if(!runtime.puddleObjects.length)issues.push('no-rain-basins');runtime.weatherStage=2;runtime.puddleRain=0;runtime.updatePuddles(15);const early=runtime.puddleRain;runtime.updatePuddles(45);if(!(early>0&&runtime.puddleRain>early)||!runtime.puddleObjects.some(p=>p.visible))issues.push('puddles-do-not-fill');samples.push({basins:runtime.puddleObjects.length,earlyRain:early,laterRain:runtime.puddleRain});
  runtime.friend=f;runtime.foes.splice(0,runtime.foes.length,...saved.foes);runtime.mountedFriend=true;runtime.py=1.18;f.g.scale.set(1,1,1);
  if(runtime.level===2&&runtime.currentSeason!=='winter'){runtime.boy.position.set(-18+13.1,1.18,-17);f.g.position.copy(runtime.boy.position);f.g.rotation.y=-Math.PI/2;let deepest=0;for(let i=0;i<160;i++){runtime.movePlayerCollision(-.13,0);deepest=Math.max(deepest,runtime.boarWaterDepth(runtime.playerBoarBody()))}if(deepest<lakeDepth(-18,-17)-.1)issues.push('rider-cannot-enter-lake-centre');runtime.boy.position.set(-18,1.18,-17);const deepX=runtime.boy.position.x,deepZ=runtime.boy.position.z;runtime.resolveBoarClearance(runtime.playerBoarBody(),false);if(Math.hypot(runtime.boy.position.x-deepX,runtime.boy.position.z-deepZ)>.01||runtime.boarWaterDepth(runtime.playerBoarBody())<lakeDepth(-18,-17)-.1)issues.push('deep-rider-pushed-to-shore');samples.push({riderMaxLakeDepth:deepest})}
  if(runtime.level===4){runtime.boy.position.set(0,1.18,-6);f.g.rotation.y=Math.PI;for(let i=0;i<130;i++)runtime.movePlayerCollision(0,-.13);if(runtime.boy.position.z>-21)issues.push('rider-cannot-cross-river-bridge');runtime.boy.position.set(15,1.18,riverCenterAt(15)+6);for(let i=0;i<100;i++)runtime.movePlayerCollision(0,-.13);if(runtime.boy.position.z>=riverCenterAt(15)+4)issues.push('rider-cannot-enter-river');samples.push({bridgeAndRiverSafe:true})}
 }finally{
  if(tree&&treeScale){tree.scale.copy(treeScale);if(treeGrown!==undefined)tree.userData.yellowAppleGrown=treeGrown;else delete tree.userData.yellowAppleGrown;if(treeBefore)tree.userData.beforeYellowScale=treeBefore;else delete tree.userData.beforeYellowScale}
  runtime.scene.remove(f.g);runtime.friend=saved.friend;runtime.friendHP=saved.friendHP;runtime.mountedFriend=saved.mounted;runtime.py=saved.py;runtime.vy=saved.vy;runtime.boy.position.set(saved.x,saved.y,saved.z);runtime.food=saved.food;runtime.yellowAppleStock=saved.stock;runtime.yellowMushroomStock=saved.mushrooms;runtime.score=saved.score;Object.assign(runtime.statsData,saved.stats);runtime.foes.splice(0,runtime.foes.length,...saved.foes);runtime.levelBoarsDone=saved.done;runtime.boarFormTime=saved.form;runtime.weatherStage=saved.stage;runtime.puddleRain=saved.rain;runtime.updatePuddles(0);runtime.sfxEnabled=saved.sfx;runtime.started=saved.started;runtime.paused=saved.paused;runtime.win=saved.win;runtime.life=saved.life;runtime.throwCooldown=saved.cooldown;runtime.yaw=saved.yaw;runtime.hud();
 }
 return {ok:issues.length===0,issues,samples,level: runtime.level};
}
 return {
  bindings:{
"runV156Audit":{get:()=>runV156Audit}
  },
  initialize(){

window.__KABANCHIKI_V156_AUDIT__=runV156Audit;
  }
 };

}
