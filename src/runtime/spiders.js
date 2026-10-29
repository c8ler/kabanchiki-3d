import * as THREE from '../../vendor/three/three.module.min.js';
import {SpiderLife} from '../spider-life.js?v=220';
export function createModule(runtime){
 let spiderLife,surfaceKey='',surfaceAt=-Infinity,lastLevel=1;
 const ground=(x,z)=>runtime.terrainHeightAt(x,z)+runtime.familyFloorAt(x,z);
 function environment(){return{ground,wet:(x,z)=>(runtime.waterAt(x,z)?.depth||0)>.08,player:runtime.boy,animal:runtime.catFormTime>0||runtime.boarFormTime>0,
  clear:(a,b)=>runtime.clearWallLine(a,new THREE.Vector3(b.x,b.y+.45,b.z)),
  attached:()=>runtime.notice('🕷 Паук забрался на Тимура! Прыгни, чтобы его стряхнуть.'),
  damage:kind=>{
   if(!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown||runtime.win||runtime.life<=0||runtime.sandboxMode||runtime.invuln>0)return false;
   runtime.life=Math.max(0,runtime.life-1);runtime.statsData.damage++;runtime.invuln=1.2;runtime.playerHitFeedback('spider');
   runtime.notice(kind==='bite'?'🕷 Укус! Яд действует 8 секунд. Прыгай, чтобы стряхнуть паука.':'🕷 Яд от укуса отнимает здоровье.');
   runtime.hud();if(runtime.life<=0)runtime.showEnd(false);return true;
  }}}
 function refreshSpiderSurfaces(force=false){
  const key=runtime.worldEpoch+':'+runtime.craftWorld.epoch+':'+runtime.level,now=performance.now();
  if(!force&&key===surfaceKey&&now-surfaceAt<1200)return;surfaceKey=key;surfaceAt=now;
  const surfaces=[],seen=new Set(),add=mesh=>{if(!mesh?.isMesh||seen.has(mesh))return;seen.add(mesh);mesh.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(mesh);if(!box.isEmpty())surfaces.push({root:mesh,mesh,box})};
  for(const h of runtime.houseObjects)if(h.visible){const walls=h.userData.cutawayWalls;if(walls){for(const side of ['front','back','left','right'])for(const m of walls[side])add(m);add(walls.roof)}else h.traverse(add)}
  if(runtime.level===3){runtime.houseFurnishings.traverse(add);if(runtime.home.stage>=3)runtime.homeParts.furnishings.traverse(add);if(runtime.familyHideout.visible)add(runtime.familyDoor)}
  for(const mesh of runtime.treeSolidMeshes)if(mesh.parent?.visible!==false)add(mesh);
  for(const [,,,mesh]of runtime.rockPositions)if(mesh?.visible&&mesh.parent?.visible!==false)add(mesh);
  for(const item of runtime.craftWorld.items)if(item.g.visible&&!item.living)item.g.traverse(add);
  for(const w of runtime.wallGeometry())if(w.exit)surfaces.push({root:w.root,box:w.box.clone()});
  spiderLife.setSurfaces(surfaces);
 }
 function spawnCheatSpiders(count=3){
  refreshSpiderSurfaces(true);let made=0;
  runtime.visualOnly(()=>{for(let i=0;i<count;i++){const a=runtime.yaw+(i-1)*.8,x=runtime.boy.position.x+Math.sin(a)*1.5,z=runtime.boy.position.z+Math.cos(a)*1.5,q=runtime.nearestSafeSpawn(x,z,.22,{allowRoad:true})||[runtime.boy.position.x,runtime.boy.position.z];if((runtime.waterAt(...q)?.depth||0)>.08)continue;if(spiderLife.spawn(q[0],ground(...q),q[1],runtime.level))made++}});
  spiderLife.root.visible=runtime.started&&!runtime.cinematicRunning;return made;
 }
 function shakeOffSpiders(){const count=spiderLife.shake(runtime.boy,environment());if(count)runtime.notice('🕷 Паук стряхнут! Если он успел укусить, яд ещё немного действует.');return count}
 function resetSpiders(){spiderLife.clear();surfaceKey='';for(const b of runtime.boarBodies()){b.spiderFear=0;b.spiderEscape=null;b.route=null;b.navigation=null}}
 function updateSpiders(dt,elapsed){
  if(lastLevel!==runtime.level){for(const b of runtime.boarBodies()){b.spiderFear=0;b.spiderEscape=null}lastLevel=runtime.level}spiderLife.visit(runtime.level);if(!spiderLife.spiders.length&&!spiderLife.venom)return;refreshSpiderSurfaces();
  runtime.visualOnly(()=>spiderLife.update(elapsed,environment()));
  if(runtime.life<=0||runtime.cinematicRunning)return;
  for(const b of runtime.boarBodies()){
   if(b.flee)continue;const threat=spiderLife.threat(b.g.position,4.4),seen=threat&&runtime.clearWallLine(b.g.position.clone().add(new THREE.Vector3(0,.7,0)),threat.p);
   b.spiderFear=Math.max(0,(b.spiderFear||0)-dt);
   if(seen){let dx=b.g.position.x-threat.p.x,dz=b.g.position.z-threat.p.z,len=Math.hypot(dx,dz);if(len<.1){dx=1;dz=.4;len=Math.hypot(dx,dz)}
    const target={x:THREE.MathUtils.clamp(b.g.position.x+dx/len*5,-40,40),z:THREE.MathUtils.clamp(b.g.position.z+dz/len*5,-35,40)};
    if(!b.spiderFear){b.route=null;b.navigation=null;b.graze=0;if(b===runtime.friend)runtime.notice('🐗 Друг испугался паука!')}
    if(!b.spiderEscape||Math.hypot(target.x-b.spiderEscape.x,target.z-b.spiderEscape.z)>2){b.spiderEscape=target;b.route=null}
    b.spiderFear=1.8;
   }
   if(b.spiderFear>0&&b.spiderEscape&&!b.exitBreaking&&!(runtime.mountedFriend&&b===runtime.friend)){runtime.moveBoarToward(b,b.spiderEscape.x,b.spiderEscape.z,4.8,dt);runtime.resolveBoarClearance(b);b.b.position.y=Math.abs(Math.sin(spiderLife.time*16))*.045}
  }
 }
 return{bindings:{
  spiderLife:{get:()=>spiderLife},spawnCheatSpiders:{get:()=>spawnCheatSpiders},shakeOffSpiders:{get:()=>shakeOffSpiders},resetSpiders:{get:()=>resetSpiders},updateSpiders:{get:()=>updateSpiders}
 },initialize(){spiderLife=runtime.visualOnly(()=>new SpiderLife(runtime.scene,{mobile:runtime.mobile}))}};
}
