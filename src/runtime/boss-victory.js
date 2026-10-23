import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 6 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let victoryFireworks;

function spawnVictoryFirework(){if(runtime.level!==6)return;const g=new THREE.Group(),colors=[0xffd54a,0xff4b73,0x5be7ff,0x7dff78,0xd88cff],mat=new THREE.MeshBasicMaterial({color:colors[Math.floor(Math.random()*colors.length)],transparent:true,opacity:1});const cx=runtime.rand(-18,18),cz=runtime.rand(-35,-8),cy=runtime.rand(9,17);for(let i=0;i<18;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.10,5,4),mat.clone()),a=Math.PI*2*i/18+runtime.rand(-.12,.12),up=runtime.rand(.3,1);p.position.set(cx,cy,cz);p.userData.v=new THREE.Vector3(Math.cos(a)*runtime.rand(3.2,6),up*runtime.rand(2.5,5.5),Math.sin(a)*runtime.rand(3.2,6));g.add(p)}runtime.scene.add(g);victoryFireworks.push({g,t:0});runtime.sound(runtime.rand(520,900),.16,'triangle')}

function updateVictoryFireworks(dt){for(let i=victoryFireworks.length-1;i>=0;i--){const fx=victoryFireworks[i];fx.t+=dt;for(const p of fx.g.children){p.position.addScaledVector(p.userData.v,dt);p.userData.v.y-=dt*2.4;p.material.opacity=Math.max(0,1-fx.t/1.8)}if(fx.t>=1.8){runtime.scene.remove(fx.g);victoryFireworks.splice(i,1)}}}

function igniteBossTree(t){if(!t||!t.visible||runtime.burningTrees.has(t))return;runtime.rememberStormObject(t);const materials=runtime.prepareFireMaterials(t),flames=runtime.createLivingFire(t,'tree'),lm=runtime.makeEffectLight(0xff882f,8,16,1.2);lm.position.set(0,1.8,0);t.add(lm);runtime.burningTrees.set(t,{time:36,duration:36,light:lm,flames,materials,damageRadius:2.65});runtime.notice('🔥 Дерево загорелось — огонь постепенно разгорается!')}

function onBossDefeated(boss){if(runtime.level!==6||runtime.bossVictoryTimer!==null||runtime.win)return;runtime.scene.remove(boss.g);const bi=runtime.foes.indexOf(boss);if(bi>=0)runtime.foes.splice(bi,1);for(const m of [...runtime.foes]){if(m.isMinion){runtime.foes.splice(runtime.foes.indexOf(m),1);runtime.sendBoarAway(m,'boss-defeated')}}runtime.fireballs.forEach(f=>runtime.scene.remove(f.g));runtime.fireballs=[];runtime.bossVictoryTimer=5;runtime.bossFireworkTimer=0;runtime.notice('👑 Босс побеждён! 🎆 Миньоны разбегаются — через 5 секунд домой!')}

function finishBossVictory(){if(runtime.win)return;runtime.bossVictoryTimer=null;runtime.win=true;runtime.score+=runtime.familyFound*50;try{localStorage.setItem('kabanchiki3d_best',String(Math.max(runtime.score,Number(localStorage.getItem('kabanchiki3d_best')||0))))}catch{}runtime.notice(`🎉 ПОБЕДА! Тимур нашёл семью! Очки: ${runtime.score}.`);runtime.playCinematic('outro',()=>runtime.showEnd(true))}
 return {
  bindings:{
"victoryFireworks":{get:()=>victoryFireworks},
"spawnVictoryFirework":{get:()=>spawnVictoryFirework},
"updateVictoryFireworks":{get:()=>updateVictoryFireworks},
"igniteBossTree":{get:()=>igniteBossTree},
"onBossDefeated":{get:()=>onBossDefeated},
"finishBossVictory":{get:()=>finishBossVictory}
  },
  initialize(){

/* init:const */ victoryFireworks = [];
  }
 };

}
