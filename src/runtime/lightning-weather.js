import { HOME_SITE } from "../home-construction.js?v=222";
import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 12 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function lightningCandidates(){const a=[];for(const t of runtime.treeObjects)if(t.visible!==false&&t.userData.stormLocationId===runtime.worldEpoch)a.push({o:t,k:'tree'});for(const h of runtime.houseObjects)if(h.visible!==false&&h!==runtime.familyHideout&&!h.userData.personalHome&&h.userData.stormLocationId===runtime.worldEpoch)a.push({o:h,k:'house'});for(const l of runtime.logObstacles)if(l.g?.visible!==false&&runtime.forestVisual.visible&&l.g.userData.stormLocationId===runtime.worldEpoch)a.push({o:l.g,k:'log'});for(const rock of runtime.stormRockTargets())if(rock.visible!==false&&rock.parent?.visible!==false&&rock.userData.stormLocationId===runtime.worldEpoch&&!rock.userData.stormBlackened)a.push({o:rock,k:'rock'});return a.filter(q=>!runtime.stormBurning.has(q.o)&&!runtime.burningTrees.has(q.o))}

function removeLightningBolt(bolt){runtime.scene.remove(bolt.g);bolt.g.traverse(o=>{o.traverse?.(m=>{m.geometry?.dispose();if(m.material&&m.material!==runtime.winterRoadMaterial)m.material.dispose?.()})});const i=runtime.lightningBolts.indexOf(bolt);if(i>=0)runtime.lightningBolts.splice(i,1)}

function updateLightningBolts(dt){for(const bolt of [...runtime.lightningBolts]){bolt.time-=dt;if(bolt.time<=0){removeLightningBolt(bolt);continue}const alpha=Math.min(1,bolt.time/.18);bolt.g.traverse(o=>{if(o.material)o.material.opacity=o.userData.boltOpacity*alpha})}}

function spawnLightningBolt(target){
 const box=new THREE.Box3().setFromObject(target),end=new THREE.Vector3((box.min.x+box.max.x)/2,box.max.y,(box.min.z+box.max.z)/2);
 const start=new THREE.Vector3(end.x+runtime.rand(-2.5,2.5),Math.max(24,end.y+8),end.z+runtime.rand(-2,2)),pts=[start];
 for(let i=1;i<7;i++){const k=i/7;pts.push(new THREE.Vector3(THREE.MathUtils.lerp(start.x,end.x,k)+runtime.rand(-.75,.75),THREE.MathUtils.lerp(start.y,end.y,k),THREE.MathUtils.lerp(start.z,end.z,k)+runtime.rand(-.55,.55)))}pts.push(end);
 const path=new THREE.CurvePath();for(let i=1;i<pts.length;i++)path.add(new THREE.LineCurve3(pts[i-1],pts[i]));const g=new THREE.Group();
 for(const [radius,color,opacity] of [[.14,0x65caff,.32],[.055,0xf7fbff,1]]){const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,toneMapped:false,fog:false});const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,42,radius,5,false),mat);mesh.userData.boltOpacity=opacity;g.add(mesh)}
 const impact=new THREE.Mesh(new THREE.SphereGeometry(.24,8,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:1,toneMapped:false,fog:false}));impact.position.copy(end);impact.userData.boltOpacity=1;g.add(impact);runtime.scene.add(g);const bolt={g,time:.6,target};runtime.lightningBolts.push(bolt);return bolt;
}

function triggerLightning(now){if(runtime.currentSeason==='winter')return;runtime.effect('lightning');runtime.effect('thunder');
 runtime.lightningFlash=1;const c=lightningCandidates();let strike=null;
 if(runtime.weatherStage>=3&&c.length){
  runtime.camera.updateMatrixWorld();const near=c.filter(q=>{const p=new THREE.Vector3();q.o.getWorldPosition(p);return Math.hypot(p.x-runtime.boy.position.x,p.z-runtime.boy.position.z)<28});
  const visible=near.filter(q=>{const b=new THREE.Box3().setFromObject(q.o),p=b.getCenter(new THREE.Vector3()).project(runtime.camera);return p.z>=-1&&p.z<=1&&Math.abs(p.x)<.9&&Math.abs(p.y)<.9});
  const pool=visible.length?visible:near.length?near:c,kinds=[...new Set(pool.map(q=>q.k))],kind=kinds[Math.floor(Math.random()*kinds.length)],targets=pool.filter(q=>q.k===kind);strike=targets[Math.floor(Math.random()*targets.length)];
  spawnLightningBolt(strike.o);if(strike.k==='rock')runtime.charStormRock(strike.o);else runtime.igniteStormTarget(strike.o,strike.k);
 }
 runtime.sound(85,.34,'sawtooth');runtime.nextLightningAt=runtime.levelTime+20;return strike;
}

function updateStormClouds(dt,now){const w=runtime.windVector(now),counts=[4,7,11,16,runtime.weatherClouds.length],active=Math.min(counts[runtime.weatherStage]||4,Math.ceil(runtime.weatherClouds.length*runtime.graphicsCloudFactor));for(let i=0;i<runtime.weatherClouds.length;i++){const c=runtime.weatherClouds[i];c.visible=i<active;if(!c.visible)continue;const speed=(.18+w.power*3.6)*c.userData.drift;c.position.x+=w.x*dt*speed;c.position.z+=w.z*dt*speed+(runtime.weatherStage<2?dt*.08:0);if(c.position.x>58)c.position.x=-58;if(c.position.x<-58)c.position.x=58;if(c.position.z>42)c.position.z=-55;if(c.position.z<-58)c.position.z=40;const dark=[0xffffff,0xdde2e5,0xaeb8c1,0x737c88,0x4f5663][runtime.weatherStage];c.userData.cloudMat.color.set(dark);c.userData.cloudMat.opacity=runtime.weatherStage>=3?.86:runtime.weatherStage===2?.78:.68}}

function forageGroundAt(x,z){return Math.max(runtime.terrainHeightAt(x,z),runtime.waterAt(x,z)?.y??-Infinity)}

function updateStormWorld(dt,now){const w=runtime.windVector(now),sway=runtime.weatherStage>=2?(runtime.weatherStage===2?.025:runtime.weatherStage===3?.055:.105):0;for(let i=0;i<runtime.treeObjects.length;i++){const t=runtime.treeObjects[i];if(t.userData.baseWindRotZ===undefined)t.userData.baseWindRotZ=t.rotation.z||0;t.rotation.z=t.userData.baseWindRotZ+Math.sin(now*.0024+i*.71)*sway+w.x*sway*.65}if(runtime.weatherStage>=2){runtime.leafSpawnCd-=dt;if(runtime.leafSpawnCd<=0){runtime.spawnStormLeaf(now);runtime.leafSpawnCd=runtime.weatherStage>=4?.035:runtime.weatherStage===3?.075:.15}}for(let i=runtime.stormLeaves.length-1;i>=0;i--){const q=runtime.stormLeaves[i];q.t-=dt;q.g.position.x+=w.x*dt*(3+7*w.power);q.g.position.z+=w.z*dt*(3+7*w.power);q.g.position.y-=dt*(.45-runtime.weatherStage*.05);q.g.rotation.x+=q.spin*dt;q.g.rotation.z+=q.spin*.7*dt;if(q.t<=0||q.g.position.y<.05){runtime.scene.remove(q.g);runtime.stormLeaves.splice(i,1)}}if(runtime.weatherStage>=4){for(const o of runtime.logObstacles){o.g.position.x+=w.x*dt*1.45;o.g.position.z+=w.z*dt*1.45;o.x=o.g.position.x;o.z=o.g.position.z;o.g.rotation.y+=dt*.8}for(const a of runtime.apples){if(a.done||a.y>1)continue;a.g.position.x+=w.x*dt*2.8;a.g.position.z+=w.z*dt*2.8;a.x=a.g.position.x;a.z=a.g.position.z;a.g.position.y=forageGroundAt(a.x,a.z);a.y=a.g.position.y;if(Math.abs(a.x)>52||Math.abs(a.z)>52){a.done=true;runtime.scene.remove(a.g)}}}}

function updateWeather(dt,now){if(runtime.sandboxMode){runtime.weatherGroup.visible=false;if(runtime.tornadoState.forcedAt!==null||runtime.tornadoState.active)runtime.updateTornado(dt,now);return}if(runtime.currentSeason==='winter'){runtime.updateSnow(dt,now);runtime.updateTornado(dt,now);return}runtime.updatePuddles(dt);const stage=runtime.levelTime>=240?4:runtime.levelTime>=180?3:runtime.levelTime>=120?2:runtime.levelTime>=60?1:0;if(stage!==runtime.weatherStage){runtime.weatherStage=stage;runtime.weatherBaseSky=runtime.scene.background.clone();if(stage>=3&&runtime.nextLightningAt===0)runtime.nextLightningAt=runtime.levelTime;const msg=['','🌦️ Начался дождик — тучи сгущаются.','🌧️ Ливень усилился. Ветер гонит тучи.','⛈️ Гроза! Каждые 20 секунд молния бьёт в дерево, дом или камень.','💨 Ветер усилился. Берегись молний и ищи выход.'][stage];if(msg)runtime.notice(msg)}updateStormClouds(dt,now);runtime.weatherGroup.visible=stage>=1;if(stage>=1){runtime.weatherGroup.position.set(runtime.boy.position.x,0,runtime.boy.position.z);const a=runtime.rainGeo.attributes.position.array,w=runtime.windVector(now),active=Math.floor(runtime.rainCount*(stage===1?.42:stage===2?.72:1));runtime.rainGeo.setDrawRange(0,Math.floor(active*runtime.graphicsParticleFactor));for(let i=0;i<active;i++){a[i*3+1]-=dt*(stage>=3?28:stage===2?23:17);a[i*3]+=dt*w.x*(stage>=4?10:stage>=2?5:0);a[i*3+2]+=dt*w.z*(stage>=4?10:stage>=2?5:0);if(a[i*3+1]<0){a[i*3+1]=runtime.rand(16,25);a[i*3]=runtime.rand(-24,24);a[i*3+2]=runtime.rand(-24,24)}}runtime.rainGeo.attributes.position.needsUpdate=true;runtime.rainMat.opacity=stage===1?.48:stage===2?.72:.92}if(stage>=3&&runtime.levelTime>=runtime.nextLightningAt)triggerLightning(now);updateLightningBolts(dt);if(runtime.lightningFlash>0){runtime.lightningFlash=Math.max(0,runtime.lightningFlash-dt*4.8);runtime.lightningSky.intensity=9*runtime.lightningFlash;runtime.lightningSun.intensity=7*runtime.lightningFlash;runtime.renderer.toneMappingExposure=(runtime.level===2?1.10:(runtime.level===3?.96:1.08))+1.25*runtime.lightningFlash;if(runtime.weatherBaseSky)runtime.scene.background.copy(runtime.weatherBaseSky).lerp(new THREE.Color(0xf4fbff),runtime.lightningFlash*.92),runtime.scene.fog.color.copy(runtime.scene.background)}else{runtime.lightningSky.intensity=0;runtime.lightningSun.intensity=0;runtime.renderer.toneMappingExposure=runtime.level===2?1.10:(runtime.level===3?.96:1.08);if(runtime.weatherBaseSky&&stage>=3){runtime.scene.background.copy(runtime.weatherBaseSky);runtime.scene.fog.color.copy(runtime.scene.background)}}updateStormWorld(dt,now);runtime.updateStormFires(dt,now);runtime.updateTornado(dt,now);}

function shelteredFromWind(){if(runtime.sandboxMode&&runtime.islandFlight.active)return true;for(const item of runtime.craftWorld.items)if(item.kind==='house'&&item.level===runtime.level&&item.g.visible){const p=item.g.worldToLocal(runtime.boy.position.clone());if(Math.abs(p.x)<2.2&&Math.abs(p.z)<2.2&&p.y<2.8)return true}if(runtime.tornadoState.active){const a=new THREE.Vector3(runtime.tornadoState.x,runtime.terrainHeightAt(runtime.tornadoState.x,runtime.tornadoState.z)+1,runtime.tornadoState.z),b=runtime.boy.position.clone().add(new THREE.Vector3(0,1,0));if(!runtime.clearWallLine(a,b))return true}if(runtime.level===3&&runtime.home.stage>=3&&Math.abs(runtime.boy.position.x-HOME_SITE.x)<2.25&&Math.abs(runtime.boy.position.z-HOME_SITE.z)<2.25&&runtime.py<2.8)return true;if(runtime.level!==3||!runtime.familyHideout.visible)return false;runtime.familyHideout.updateWorldMatrix(true,true);const p=runtime.familyHideout.worldToLocal(runtime.boy.position.clone());return Math.abs(p.x)<2.4&&p.z> -1.95&&p.z<2.08&&p.y<2.8}

function beginHurricaneScene(){if(shelteredFromWind())return;if(runtime.sandboxMode){runtime.startIslandFlight();return}runtime.stopFishing();if(runtime.mountedFriend){runtime.mountedFriend=false;runtime.setRiderPose(false)}runtime.hurricaneCarry=.001;runtime.paused=true;runtime.playCinematic('storm',()=>{runtime.hurricaneCarry=0;runtime.lastDeathCause='wind';runtime.boy.rotation.set(0,runtime.yaw,0);runtime.showEnd(false)},{line:'Торнадо подхватило Тимура! Держись подальше от воронки.'})}

function updateHurricaneCarry(dt,now){if(runtime.level===6){runtime.hurricaneCarry=0;return}if(runtime.hurricaneCarry<=0||runtime.endShown)return;runtime.hurricaneCarry+=dt;const w=runtime.windVector(now),k=Math.min(1,runtime.hurricaneCarry/3.2);runtime.boy.position.x+=w.x*dt*(8+18*k);runtime.boy.position.z+=w.z*dt*(8+18*k);runtime.boy.position.y+=dt*(2.2+8*k);runtime.boy.rotation.z=Math.sin(runtime.hurricaneCarry*2)*.18;runtime.boy.rotation.x=.12;if(runtime.hurricaneCarry>3.2||Math.abs(runtime.boy.position.x)>58||Math.abs(runtime.boy.position.z)>58){runtime.boy.rotation.x=0;runtime.boy.rotation.z=0;runtime.boy.position.y=0;runtime.notice('🌪️ Тимура унесло за пределы карты!');runtime.showEnd(false)}}
 return {
  bindings:{
"lightningCandidates":{get:()=>lightningCandidates},
"removeLightningBolt":{get:()=>removeLightningBolt},
"updateLightningBolts":{get:()=>updateLightningBolts},
"spawnLightningBolt":{get:()=>spawnLightningBolt},
"triggerLightning":{get:()=>triggerLightning},
"updateStormClouds":{get:()=>updateStormClouds},
"forageGroundAt":{get:()=>forageGroundAt},
"updateStormWorld":{get:()=>updateStormWorld},
"updateWeather":{get:()=>updateWeather},
"shelteredFromWind":{get:()=>shelteredFromWind},
"beginHurricaneScene":{get:()=>beginHurricaneScene},
"updateHurricaneCarry":{get:()=>updateHurricaneCarry}
  },
  initialize(){

  }
 };

}
