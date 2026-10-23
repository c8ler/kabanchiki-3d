

// Owns 17 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let DIFF_NAMES,DIFF_SCORE,DIFF_CONFIG,selectedDiff,diffCfg,diffScore,exitHelpers,nextRegularFood,opening,openingProps,lakeExitProps,locationExit,locationExitProps;


function riderSeatHeight(){return 1.18*(runtime.friend?.g?runtime.friend.g.scale.y/runtime.boarScale(runtime.friend):1)}

function mountFriendNow(explicit=false){if(!runtime.friend?.g||runtime.friend.exitBreaking||runtime.friend.flee||runtime.mountedFriend||runtime.catFormTime>0||!runtime.dismountLatch.allow(performance.now(),Math.hypot(runtime.boy.position.x-runtime.friend.g.position.x,runtime.boy.position.z-runtime.friend.g.position.z),explicit,runtime.py<.35))return false;runtime.mountedFriend=true;runtime.py=riderSeatHeight();runtime.vy=0;runtime.boy.position.x=runtime.friend.g.position.x;runtime.boy.position.z=runtime.friend.g.position.z;runtime.boy.position.y=runtime.py;runtime.boy.rotation.y=runtime.friend.g.rotation.y;runtime.setRiderPose(true);runtime.repairCompanion(runtime.playerBoarBody(),true);runtime.friend.g.position.x=runtime.boy.position.x;runtime.friend.g.position.z=runtime.boy.position.z;runtime.effect('mount');runtime.notice('🐗 Верхом! Тимур сел как на коня. Прыжок — короткий подскок; Q или кнопка — спрыгнуть.');if(runtime.level===1&&opening){opening.update({friend:true,mounted:true});runtime.notice('🏇 Теперь вы команда! Езжай по дорожке к маме.')}return true}

// v89: while Timur is riding, the friendly boar still protects him and rams hostile boars on contact.
// v131: boss minions can still be befriended with food, but combat minions fall in one friendly-boar hit.
function hitBossMinion(target,ax,az,al){
 if(!target?.isMinion||!runtime.foes.includes(target))return false;
 target.hp=Math.max(0,(target.hp??1)-1);target.stagger=Math.max(target.stagger||0,.48);
 target.aura.material.color.set(0xffffff);target.aura.material.opacity=.58;
 setTimeout(()=>{if(target?.g?.parent&&runtime.foes.includes(target)){target.aura.material.color.set(0xff4b4b);target.aura.material.opacity=.18}},130);
 const push=.72;target.g.position.x+=ax/al*push;target.g.position.z+=az/al*push;
 if(target.hp<=0){runtime.sendBoarAway(target,'minion-hit');const fi=runtime.foes.indexOf(target);if(fi>=0)runtime.foes.splice(fi,1);target.flee=true;target.fleeSpeed=8.4;runtime.levelBoarsDone++;runtime.statsData.minions++;runtime.score+=diffScore(25);runtime.softBoarDefeatSound();runtime.notice('💥 Первый удар! Миньон испугался и убегает за границу карты!');return true}
 runtime.sound(175,.13,'triangle');return false
}

function mountedFriendDefense(){if(!runtime.mountedFriend||!runtime.friend?.g||runtime.friend.flee||runtime.friend.knockback?.active||runtime.friendKnockbackActive||runtime.friendAttack>0)return;const targets=runtime.foes.filter(f=>f!==runtime.friend);if(!targets.length)return;targets.sort((a,b)=>(b.isBoss?1:0)-(a.isBoss?1:0)||runtime.friend.g.position.distanceTo(a.g.position)-runtime.friend.g.position.distanceTo(b.g.position));const target=targets[0],d=runtime.friend.g.position.distanceTo(target.g.position),hitDist=runtime.boarRadius(runtime.friend)+runtime.boarRadius(target)+.38;if(!runtime.boarsInContact(runtime.friend,target,.38))return;runtime.friendAttack=.72;const ax=target.g.position.x-runtime.friend.g.position.x,az=target.g.position.z-runtime.friend.g.position.z,al=Math.max(.01,Math.hypot(ax,az));target.b.rotation.x=-.24;runtime.friend.b.rotation.x=-.16;runtime.bossBattleImpact((runtime.friend.g.position.x+target.g.position.x)/2,(runtime.friend.g.position.z+target.g.position.z)/2);runtime.sound(target.isBoss?105:145,.18,'triangle');if(target.isBoss){target.hp--;runtime.bossHits++;runtime.statsData.bossHits++;runtime.bossRage=Math.min(2.35,runtime.bossRage+.12);runtime.moveBoarToward(target,target.g.position.x+ax/al*5,target.g.position.z+az/al*5,.95,1);target.stagger=Math.max(target.stagger||0,1.0);runtime.bossRepelsFriend(target,runtime.friend);runtime.notice(`🏇💥 Верхом! Друг ударил босса, а босс отшвыривает его! Осталось ${target.hp}/${target.maxHp}`);if(target.hp<=0){runtime.score+=diffScore(200);runtime.onBossDefeated(target)}}else if(target.isMinion){hitBossMinion(target,ax,az,al)}else{runtime.foes.splice(runtime.foes.indexOf(target),1);runtime.sendBoarAway(target,'defeated');runtime.levelBoarsDone++;runtime.statsData.minions++;runtime.score+=diffScore(25);runtime.softBoarDefeatSound();runtime.notice('🏇🐗 Друг отогнал враждебного кабанчика!')}runtime.friendHP=Math.max(0,runtime.friendHP-1);runtime.hud();if(runtime.friendHP<=0){const fallen=runtime.friend;runtime.mountedFriend=false;runtime.setRiderPose(false);runtime.friend=null;runtime.scene.remove(fallen.g);runtime.py=0;runtime.vy=0;runtime.boy.position.y=0;runtime.notice('💔 Кабанчик-друг пал в бою')}}
 return {
  bindings:{
"riderSeatHeight":{get:()=>riderSeatHeight},
"mountFriendNow":{get:()=>mountFriendNow},
"hitBossMinion":{get:()=>hitBossMinion},
"mountedFriendDefense":{get:()=>mountedFriendDefense},
"DIFF_NAMES":{get:()=>DIFF_NAMES},
"DIFF_SCORE":{get:()=>DIFF_SCORE},
"DIFF_CONFIG":{get:()=>DIFF_CONFIG},
"selectedDiff":{get:()=>selectedDiff,set:value=>{selectedDiff=value}},
"diffCfg":{get:()=>diffCfg},
"diffScore":{get:()=>diffScore},
"exitHelpers":{get:()=>exitHelpers},
"nextRegularFood":{get:()=>nextRegularFood,set:value=>{nextRegularFood=value}},
"opening":{get:()=>opening,set:value=>{opening=value}},
"openingProps":{get:()=>openingProps,set:value=>{openingProps=value}},
"lakeExitProps":{get:()=>lakeExitProps,set:value=>{lakeExitProps=value}},
"locationExit":{get:()=>locationExit,set:value=>{locationExit=value}},
"locationExitProps":{get:()=>locationExitProps}
  },
  initialize(){

/* init:const */ DIFF_NAMES = ['Я слишком мал, чтобы умереть','Не мучай меня, кабанчик','Ультра-кабан','Кошмар','НЕВОЗМОЖНО'];

/* init:const */ DIFF_SCORE = [.2,.33,.5,1,2];

/* init:const */ DIFF_CONFIG = [
 {enemyMult:.5,speedMult:.4,itemMult:2,playerHP:10,friendHP:10,foodMax:10},
 {enemyMult:.8,speedMult:.47,itemMult:1.4,playerHP:7,friendHP:7,foodMax:7},
 {enemyMult:1.3,speedMult:.57,itemMult:.8,playerHP:4,friendHP:4,foodMax:4},
 {enemyMult:1.8,speedMult:.67,itemMult:.5,playerHP:2,friendHP:2,foodMax:2},
 {enemyMult:2.5,speedMult:.8,itemMult:.2,playerHP:1,friendHP:1,foodMax:1}
];

/* init:let */ selectedDiff = 2;

/* init:const */ diffCfg = ()=>DIFF_CONFIG[selectedDiff];
/* init:const */ diffScore = v=>Math.round(v*DIFF_SCORE[selectedDiff]);

/* init:const */ exitHelpers = new Set();

/* init:let */ nextRegularFood = 'apple';

/* init:let */ opening = null;
/* init:let */ openingProps = null;
/* init:let */ lakeExitProps = null;
/* init:let */ locationExit = null;

/* init:const */ locationExitProps = new Map();
  }
 };

}
