import { BOAR_WADING_DEPTH } from "../boar-water.js?v=219";
import * as THREE from "../../vendor/three/three.module.min.js";
import { attacksPlayer, capsuleCircleContact } from "../boar-physics.js?v=219";
import { riverCenterAt, weatherDeadline } from "../world-surface.js?v=219";

// Owns 4 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function runNavigationSafetyAudit(){const issues=[];if(runtime.riverGeo.attributes.position.getX(runtime.riverGeo.attributes.position.count-1)>46)issues.push('river-outside-map');if(runtime.level===4&&runtime.apples.some(a=>!a.done&&Math.abs(a.z-riverCenterAt(a.x))<4.6))issues.push('food-in-river');for(const season of ['summer','autumn','winter'])if(weatherDeadline(season,6,600)!==null)issues.push('boss-weather-deadline');if(runtime.level===3){const h=runtime.familyHideout;h.updateWorldMatrix(true,true);const a=new THREE.Vector3(-3.5,.8,0).applyMatrix4(h.matrixWorld),b=new THREE.Vector3(-1.5,.8,0).applyMatrix4(h.matrixWorld);if(runtime.clearWallLine(a,b))issues.push('house-wall-line-open')}if(runtime.currentSeason==='winter'&&(runtime.roadSurface.material!==runtime.winterRoadMaterial||(runtime.level===2&&runtime.lake.material!==runtime.iceWaterMaterial)||(runtime.level===4&&runtime.riverWater.material!==runtime.iceWaterMaterial)))issues.push('winter-surface-not-frozen');return {ok:issues.length===0,issues,level: runtime.level,season:runtime.currentSeason,automaticRecovery:true,companion:runtime.companionChecks}}

function runBoarBehaviorAudit(){
 const issues=[],samples=[],saved={friend: runtime.friend,friendHP: runtime.friendHP,foes:runtime.foes.slice(),form:runtime.boarFormTime,food: runtime.food,stock:runtime.yellowMushroomStock,cooldown:runtime.throwCooldown,score: runtime.score,done:runtime.levelBoarsDone,stats:{...runtime.statsData},x:runtime.boy.position.x,y:runtime.boy.position.y,z:runtime.boy.position.z,yaw: runtime.yaw,started: runtime.started,paused: runtime.paused,win: runtime.win,life: runtime.life,sfx:runtime.sfxEnabled,shotCount:runtime.shots.length};
 const f=runtime.visualOnly(()=>runtime.makeBoar(0,8,false));
 try{
  runtime.friend=null;runtime.boarFormTime=30;runtime.started=true;runtime.paused=false;runtime.win=false;runtime.life=5;runtime.sfxEnabled=false;runtime.food=4;runtime.yellowMushroomStock=0;runtime.throwCooldown=0;runtime.boy.position.set(0,0,4);runtime.yaw=0;runtime.foes.splice(0,runtime.foes.length,f);
  runtime.visualOnly(runtime.feed);const shot=runtime.shots.at(-1);if(runtime.shots.length!==saved.shotCount+1||shot.foe!==f)issues.push('boar-form-cannot-feed');else{runtime.visualOnly(()=>runtime.resolveMeat(shot));runtime.shots.pop();if(runtime.friend!==f||!f.friendly||runtime.food!==3)issues.push('boar-form-friend-not-created')}
  if(runtime.boarShouldChasePlayer(f,3)||attacksPlayer(runtime.boarFormTime+runtime.catFormTime))issues.push('boar-form-still-targeted');runtime.boarFormTime=0;if(!runtime.boarShouldChasePlayer(f,3))issues.push('human-chase-not-restored');
  samples.push({feeding:runtime.friend===f,protectedInForm:!attacksPlayer(30),chaseAfterForm:runtime.boarShouldChasePlayer(f,3)});
  runtime.friend=null;runtime.foes.splice(0,runtime.foes.length,...saved.foes);runtime.boy.position.set(0,0,42);
  for(const scale of [1,2.3]){f.g.scale.setScalar(scale);f.isBoss=scale>1;let trees=0;
   for(const mesh of runtime.treeSolidMeshes){if(mesh.parent?.visible===false)continue;const q=runtime.treeTrunkShape(mesh);f.g.position.set(q.x,0,q.z+q.r+1.65*scale+.10);f.g.rotation.y=Math.PI;
    for(let frame=0;frame<12;frame++)runtime.moveBoarToward(f,q.x,q.z,6,.05);
    const hit=capsuleCircleContact(runtime.boarBody(f),q.x,q.z,q.r-.01);if(hit)issues.push('boar-body-in-tree');if(++trees>=8)break;
   }
   f.g.position.set(0,0,4+1.2*scale);f.g.rotation.y=Math.PI;runtime.boy.position.set(0,0,4);runtime.resolveBoarClearance(f);
   if(capsuleCircleContact(runtime.boarBody(f),runtime.boy.position.x,runtime.boy.position.z,runtime.PLAYER_RADIUS+.05))issues.push('boar-body-in-timur');
   samples.push({scale,trees,playerClear:!runtime.boarPlayerContact(f)});runtime.boy.position.set(0,0,42);
  }
  if(runtime.level===2){f.g.scale.setScalar(1);f.isBoss=false;f.g.position.set(-18+13.1,0,-17);f.g.rotation.y=-Math.PI/2;
   for(let frame=0;frame<50;frame++)runtime.moveBoarToward(f,-18,-17,6,.05);
   const depth=runtime.boarWaterDepth(f);if(runtime.currentSeason!=='winter'&&depth>BOAR_WADING_DEPTH+.05)issues.push('boar-enters-unsafe-depth');
   f.g.position.set(-18+8,0,-17);const beforeDepth=runtime.boarWaterDepth(f);runtime.resolveBoarClearance(f);if(runtime.currentSeason!=='winter'&&Math.abs(runtime.boarWaterDepth(f)-beforeDepth)>.05)issues.push('swimming-boar-teleported');
   samples.push({lakeDepth:+depth.toFixed(3),recoveredDepth:+runtime.boarWaterDepth(f).toFixed(3)});
  }
 }finally{
  while(runtime.shots.length>saved.shotCount){const shot=runtime.shots.pop();runtime.scene.remove(shot.g)}runtime.scene.remove(f.g);runtime.friend=saved.friend;runtime.friendHP=saved.friendHP;runtime.foes.splice(0,runtime.foes.length,...saved.foes);runtime.boarFormTime=saved.form;runtime.food=saved.food;runtime.yellowMushroomStock=saved.stock;runtime.throwCooldown=saved.cooldown;runtime.score=saved.score;runtime.levelBoarsDone=saved.done;Object.assign(runtime.statsData,saved.stats);runtime.boy.position.set(saved.x,saved.y,saved.z);runtime.yaw=saved.yaw;runtime.started=saved.started;runtime.paused=saved.paused;runtime.win=saved.win;runtime.life=saved.life;runtime.sfxEnabled=saved.sfx;
 }
 return {ok:issues.length===0,issues,samples,level: runtime.level};
}

function runLakeStormFeedingAudit(){
 const issues=[],samples=[],saved={friend: runtime.friend,friendHP: runtime.friendHP,food: runtime.food,stock:runtime.yellowMushroomStock,foes:runtime.foes.slice(),done:runtime.levelBoarsDone,score: runtime.score,stats:{...runtime.statsData},rage:runtime.bossRage,started: runtime.started,paused: runtime.paused,win: runtime.win,life: runtime.life,sfx:runtime.sfxEnabled,cooldown:runtime.throwCooldown,x:runtime.boy.position.x,y:runtime.boy.position.y,z:runtime.boy.position.z,yaw: runtime.yaw,py: runtime.py,vy: runtime.vy,mounted:runtime.mountedFriend,stage:runtime.weatherStage,time:runtime.levelTime,next:runtime.nextLightningAt,flash:runtime.lightningFlash},oldBurning=new Set(runtime.stormBurning.keys()),oldTouched=new Set(runtime.stormTouched),oldBolts=new Set(runtime.lightningBolts);
 const f=runtime.visualOnly(()=>runtime.makeBoar(0,8,false));
 try{
  runtime.started=true;runtime.paused=false;runtime.win=false;runtime.life=5;runtime.sfxEnabled=false;runtime.mountedFriend=false;runtime.friend=null;runtime.food=0;runtime.yellowMushroomStock=1;runtime.throwCooldown=0;runtime.boy.position.set(0,0,4);runtime.yaw=0;runtime.foes.splice(0,runtime.foes.length,f);
  const count=runtime.shots.length;runtime.visualOnly(runtime.feed);const shot=runtime.shots.at(-1);if(runtime.shots.length!==count+1||!shot.specialYellow||shot.foe!==f)issues.push('yellow-mushroom-shot');else{runtime.visualOnly(()=>runtime.resolveMeat(shot));runtime.shots.pop();if(runtime.friend!==f||!f.friendly||!f.yellowPermanent||runtime.yellowMushroomStock!==0||runtime.statsData.fed!==saved.stats.fed+1)issues.push('yellow-mushroom-no-friend');samples.push({yellowFriend:runtime.friend===f,food: runtime.food,stock:runtime.yellowMushroomStock})}
  runtime.friend=f;runtime.friendHP=Math.max(0,runtime.diffCfg().friendHP-1);const hp=runtime.friendHP;runtime.visualOnly(()=>runtime.resolveMeat({g:new THREE.Group(),foe:f,type:'mushroom',specialYellow:true}));if(runtime.friendHP!==hp+1)issues.push('yellow-mushroom-no-healing');
  runtime.friend=null;f.isBoss=true;f.hp=7;runtime.bossRage=1.8;runtime.foes.splice(0,runtime.foes.length,f);runtime.visualOnly(()=>runtime.resolveMeat({g:new THREE.Group(),foe:f,type:'mushroom',specialYellow:true}));if(runtime.bossRage>=1.8||f.hp!==7)issues.push('yellow-mushroom-boss-food');samples.push({healed:runtime.friendHP===hp+1,bossRage: runtime.bossRage,bossHP:f.hp,yellowPermanent:f.yellowPermanent});
  f.isBoss=false;f.flee=true;const tree=runtime.treeSolidMeshes.find(m=>m.parent?.visible!==false),q=tree?runtime.treeTrunkShape(tree):{x:0,z:0};
  for(const [x,z,label] of [[q.x,q.z,'tree'],[-18,-17,'lake'],[44,44,'boundary'],...runtime.rockPositions.filter(q=>q[3]?.visible).slice(0,3).map(q=>[q[0],q[1],'rock']),...runtime.houseObjects.filter(h=>h.visible).slice(0,1).map(h=>{const box=new THREE.Box3().setFromObject(h);return [box.min.x-runtime.boarRadius(f)-2,(box.min.z+box.max.z)/2,'house']})]){
   f.g.position.set(x,0,z);f.fleePath=null;f.fleePathAge=0;runtime.resolveBoarClearance(f);const start=f.g.position.clone();let traveled=0;for(let i=0;i<80;i++){const previous=f.g.position.clone();runtime.moveBoarToward(f,f.g.position.x+10,f.g.position.z,6,.05);runtime.resolveBoarClearance(f);traveled+=f.g.position.distanceTo(previous);if(runtime.boarWallContacts(f).length)issues.push('flee-through-wall-'+label)}if(traveled<1)issues.push('flee-blocked-'+label);samples.push({flee:label,traveled})
  }
  f.g.position.set(0,0,0);f.fleePath=null;f.fleePathAge=0;for(let i=0;i<200;i++){runtime.moveBoarToward(f,60,0,6,.05);runtime.resolveBoarClearance(f)}if(f.g.position.x<=55)issues.push('flee-cannot-exit-map');samples.push({fleeExitX:f.g.position.x});
  if(runtime.level===2){const rocks=runtime.rockPositions.filter(q=>q[3]?.userData.biomeLevel===2);if(rocks.length!==20)issues.push('lake-rocks-not-registered');runtime.py=0;runtime.vy=0;for(const [x,z,r,m] of rocks){if(!m.visible||!runtime.rockFootprintHit(m,x,z,runtime.ROCK_PLAYER_RADIUS,true))issues.push('lake-rock-not-solid')}samples.push({lakeRocks:rocks.length,solid:!issues.some(i=>i.startsWith('lake-rock'))})}
  const rock=runtime.stormRockTargets().find(r=>r.visible&&r.parent?.visible!==false),candidate=runtime.lightningCandidates().find(q=>q.k==='rock');if(!rock||!candidate)issues.push('lightning-no-rock-target');else{
   const before=rock.material||rock.children.find(m=>m.material)?.material;runtime.charStormRock(rock);if(!rock.visible||runtime.stormBurning.has(rock)||!rock.userData.stormBlackened)issues.push('lightning-rock-burns');const black=[];rock.traverse(m=>{if(m.isMesh&&m.material?.color)black.push(m.material.color.getHex()===0x161616)});if(!black.length||black.includes(false))issues.push('lightning-rock-not-black');
   const bolt=runtime.spawnLightningBolt(rock),box=new THREE.Box3().setFromObject(rock),end=bolt.g.children.at(-1).position;if(Math.abs(end.y-box.max.y)>.0001||bolt.time<.5||!bolt.g.children[0].isMesh)issues.push('lightning-invisible-or-misses-target');runtime.removeLightningBolt(bolt);runtime.restoreStormObject(rock);const after=rock.material||rock.children.find(m=>m.material)?.material;if(before!==after||rock.userData.stormBlackened)issues.push('lightning-rock-not-restored');samples.push({rockBlack:true,rockSolid:true,boltEndsAtTop:true})
  }
  if(runtime.currentSeason==='winter'){const before=runtime.lightningBolts.length;runtime.triggerLightning(0);if(runtime.lightningBolts.length!==before)issues.push('winter-lightning');samples.push({winterNoLightning:true})}else{runtime.weatherStage=3;runtime.levelTime=180;runtime.triggerLightning(0);if(runtime.nextLightningAt!==200||!runtime.lightningBolts.length)issues.push('minute-three-lightning-missing');runtime.levelTime=200;runtime.triggerLightning(999999);if(runtime.nextLightningAt!==220)issues.push('lightning-not-20-game-seconds');samples.push({strikeAt:180,next:220});}
 }finally{
  for(const bolt of [...runtime.lightningBolts])if(!oldBolts.has(bolt))runtime.removeLightningBolt(bolt);
  for(const [obj,b] of [...runtime.stormBurning])if(!oldBurning.has(obj)){obj.remove(b.light);obj.remove(b.flames);runtime.stormBurning.delete(obj)}
  for(const obj of [...runtime.stormTouched])if(!oldTouched.has(obj))runtime.restoreStormObject(obj);
  runtime.scene.remove(f.g);runtime.friend=saved.friend;runtime.friendHP=saved.friendHP;runtime.food=saved.food;runtime.yellowMushroomStock=saved.stock;runtime.foes.splice(0,runtime.foes.length,...saved.foes);runtime.levelBoarsDone=saved.done;runtime.score=saved.score;Object.assign(runtime.statsData,saved.stats);runtime.bossRage=saved.rage;runtime.started=saved.started;runtime.paused=saved.paused;runtime.win=saved.win;runtime.life=saved.life;runtime.sfxEnabled=saved.sfx;runtime.throwCooldown=saved.cooldown;runtime.boy.position.set(saved.x,saved.y,saved.z);runtime.yaw=saved.yaw;runtime.py=saved.py;runtime.vy=saved.vy;runtime.mountedFriend=saved.mounted;runtime.weatherStage=saved.stage;runtime.levelTime=saved.time;runtime.nextLightningAt=saved.next;runtime.lightningFlash=saved.flash;runtime.hud();
 }
 return {ok:issues.length===0,issues,samples,level: runtime.level};
}

function runBossCounterattackAudit(){
 const issues=[],samples=[];if(runtime.level!==6)return {ok:true,issues,samples,level: runtime.level};
 const saved={friend: runtime.friend,friendHP: runtime.friendHP,mounted:runtime.mountedFriend,x:runtime.boy.position.x,y:runtime.boy.position.y,z:runtime.boy.position.z,py: runtime.py,vy: runtime.vy,attack:runtime.friendAttack,active:runtime.friendKnockbackActive,foes:runtime.foes.slice(),bossHits: runtime.bossHits,rage:runtime.bossRage,stats:{...runtime.statsData},sfx:runtime.sfxEnabled};
 const ally=runtime.visualOnly(()=>runtime.makeBoar(0,12,true)),boss=runtime.visualOnly(()=>runtime.makeBoar(0,8.5,false));boss.isBoss=true;boss.g.scale.setScalar(2.3);boss.hp=10;
 try{
  runtime.friend=ally;runtime.friendHP=7;runtime.sfxEnabled=false;runtime.mountedFriend=false;runtime.boy.position.set(12,0,30);runtime.foes.splice(0,runtime.foes.length,boss);
  for(const fps of [30,60,120]){ally.g.position.set(0,0,12);ally.g.rotation.y=Math.PI;runtime.bossRepelsFriend(boss,ally);let maxStep=0;
   while(ally.knockback?.active){const z=ally.g.position.z;runtime.updateFriendKnockback(1/fps);maxStep=Math.max(maxStep,Math.abs(ally.g.position.z-z));runtime.resolveBoarClearance(ally)}
   const travel=ally.g.position.z-12;if(Math.abs(travel-4)>.03)issues.push('friend-recoil-distance-'+fps);if(maxStep>.45)issues.push('friend-recoil-teleport');samples.push({fps,travel,maxStep})
  }
  ally.g.position.set(0,0,12);ally.g.rotation.y=Math.PI;boss.g.position.set(0,0,8.5);boss.g.rotation.y=0;boss.hp=10;runtime.friendHP=7;runtime.friendAttack=0;runtime.friendKnockbackActive=false;runtime.mountedFriend=true;runtime.boy.position.set(0,1.18,12);runtime.py=1.18;runtime.vy=0;
  runtime.visualOnly(runtime.mountedFriendDefense);if(boss.hp!==9||!ally.knockback?.active||runtime.friendHP!==6)issues.push('mounted-boss-hit-no-counterattack');
  const hp=boss.hp;runtime.visualOnly(runtime.mountedFriendDefense);if(boss.hp!==hp)issues.push('attack-during-recoil');
  while(ally.knockback?.active)runtime.updateFriendKnockback(1/60);
  const travel=runtime.boy.position.z-12;if(Math.abs(travel-4)>.03||Math.abs(ally.g.position.z-runtime.boy.position.z)>.001)issues.push('mounted-recoil-desync');samples.push({mountedTravel:travel,bossHP:boss.hp,friendHP: runtime.friendHP});
  runtime.mountedFriend=false;ally.g.position.set(0,0,39);runtime.boy.position.set(12,0,30);boss.g.position.set(0,0,35);runtime.bossRepelsFriend(boss,ally);while(ally.knockback?.active){runtime.updateFriendKnockback(1/60);runtime.resolveBoarClearance(ally)}if(ally.g.position.z>43.1)issues.push('recoil-leaves-map');samples.push({boundaryZ:ally.g.position.z});
 }finally{
  runtime.scene.remove(ally.g);runtime.scene.remove(boss.g);runtime.friend=saved.friend;runtime.friendHP=saved.friendHP;runtime.mountedFriend=saved.mounted;runtime.boy.position.set(saved.x,saved.y,saved.z);runtime.py=saved.py;runtime.vy=saved.vy;runtime.friendAttack=saved.attack;runtime.friendKnockbackActive=saved.active;runtime.foes.splice(0,runtime.foes.length,...saved.foes);runtime.bossHits=saved.bossHits;runtime.bossRage=saved.rage;Object.assign(runtime.statsData,saved.stats);runtime.sfxEnabled=saved.sfx;runtime.hud();
 }
 return {ok:issues.length===0,issues,samples,level: runtime.level};
}
 return {
  bindings:{
"runNavigationSafetyAudit":{get:()=>runNavigationSafetyAudit},
"runBoarBehaviorAudit":{get:()=>runBoarBehaviorAudit},
"runLakeStormFeedingAudit":{get:()=>runLakeStormFeedingAudit},
"runBossCounterattackAudit":{get:()=>runBossCounterattackAudit}
  },
  initialize(){

window.__KABANCHIKI_BOAR_BEHAVIOR_AUDIT__=runBoarBehaviorAudit;

window.__KABANCHIKI_LAKE_STORM_FEEDING_AUDIT__=runLakeStormFeedingAudit;

window.__KABANCHIKI_BOSS_COUNTERATTACK_AUDIT__=runBossCounterattackAudit;
  }
 };

}
