import * as THREE from "../../vendor/three/three.module.min.js";
import { onRiverBridge } from "../world-surface.js?v=222";
import { GRAPHICS_TIERS } from "../adaptive-quality.js?v=222";
import { lightBudget } from "../render-budget.js?v=222";

// Owns 9 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let trackPerformance,performanceFrames,last,fpsFrames,fpsLast,fpsValue,warmLightVisibility,cinematicWarmup;

function loop(now){runtime.$("landFlightAction").hidden=!runtime.islandFlight.active||!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown||runtime.win;const frameStart=trackPerformance?performance.now():0;requestAnimationFrame(loop);if(runtime.gameInformation.isOpen){last=now;return}if(runtime.spiderLife.level!==runtime.level)runtime.spiderLife.visit(runtime.level);runtime.spiderLife.root.visible=runtime.started&&!runtime.cinematicRunning&&!runtime.endShown&&runtime.spiderLife.spiders.length>0;runtime.boarCollisionEpoch++;runtime.adaptiveGraphics.sample(now,runtime.started&&!runtime.paused&&!runtime.endShown&&!runtime.cinematicRunning&&!document.hidden);fpsFrames++;if(now-fpsLast>=500){fpsValue=Math.round(fpsFrames*1000/(now-fpsLast));fpsFrames=0;fpsLast=now;const pe=runtime.$('perf');if(pe)pe.textContent=`FPS ${fpsValue} · Авто: ${GRAPHICS_TIERS[runtime.adaptiveGraphics.tier].name} · ⏱ всего ${runtime.formatTime(runtime.totalTime)} · 📍 ${runtime.formatTime(runtime.levelTime)}`;}const activeElapsed=document.hidden?0:Math.max(0,(now-last)/1000),dt=Math.min(.05,activeElapsed);last=now;runtime.updateSpringBloom(dt);if(runtime.level===3){runtime.hearthFlame.scale.set(.9+Math.sin(now*.012)*.09,1+Math.sin(now*.009)*.15,1);runtime.hearthLight.intensity=2.5+Math.sin(now*.017)*.4}runtime.enforceCreatureLimit();runtime.birdLife.update(dt,runtime.terrainHeightAt);if(runtime.started&&!runtime.paused&&!runtime.cinematicRunning){runtime.catLife.epoch=runtime.worldEpoch;runtime.catLife.update(dt,runtime.birdLife,runtime.boarBodies(),{x:runtime.boy.position.x,y:runtime.boy.position.y,z:runtime.boy.position.z},runtime.mountedFriend?runtime.friend:null,runtime.craftWorld.items.filter(i=>i.g.visible&&i.catActor).map(i=>i.catActor));}runtime.updateAquaticLife(dt,now);runtime.updateWaterEffects(dt,now);runtime.updateVictoryFireworks(dt);if(runtime.started&&runtime.life>0&&!runtime.win&&!runtime.paused){runtime.updateSimulation(dt,now,activeElapsed)}const pos=runtime.boy.position;const camPresets=[{pitch:.30,dist:8.8,lift:3.8},{pitch:.22,dist:7.5,lift:3.0},{pitch:.14,dist:6.4,lift:2.35},{pitch:.38,dist:10.5,lift:5.6},{pitch:.12,dist:4.7,lift:2.05},{pitch:.10,dist:9.8,lift:2.2},{pitch:.46,dist:7.2,lift:6.6},{pitch:.20,dist:5.5,lift:2.75},{pitch:Math.PI/2,dist:0,lift:22},{pitch:0,dist:0,lift:0}],cp=camPresets[runtime.camMode];const fixedPitch=runtime.camMode===9?runtime.pitch:cp.pitch,distCam=cp.dist;/* v133: rider animation may bounce, camera anchor must not. */const cameraAnchorY=runtime.mountedFriend?runtime.riderSeatHeight()+runtime.rideHop.height-runtime.lakeDepthAt(pos.x,pos.z)+runtime.terrainHeightAt(pos.x,pos.z)+runtime.familyFloorAt(pos.x,pos.z)+(runtime.level===4&&onRiverBridge(pos.x,pos.z)?.28:0):pos.y,cy=cameraAnchorY+1.55;const look=new THREE.Vector3(pos.x+Math.sin(runtime.yaw)*Math.cos(fixedPitch)*7,cy-.15+Math.sin(fixedPitch)*1.2,pos.z+Math.cos(runtime.yaw)*Math.cos(fixedPitch)*7);runtime.camera.position.set(pos.x-Math.sin(runtime.yaw)*distCam,cy+cp.lift,pos.z-Math.cos(runtime.yaw)*distCam);runtime.boy.visible=runtime.camMode!==9&&runtime.boarFormTime<=0&&runtime.catFormTime<=0&&!runtime.cinematicRunning;if(runtime.catFormModel){runtime.catFormModel.g.visible=runtime.camMode!==9&&runtime.catFormTime>0&&!runtime.cinematicRunning;runtime.catFormModel.g.position.copy(runtime.boy.position);runtime.catFormModel.g.rotation.y=runtime.boy.rotation.y;}if(runtime.boarFormVisual&&runtime.boarFormTime>0&&!runtime.cinematicRunning){runtime.boarFormVisual.visible=runtime.camMode!==9;runtime.boarFormVisual.position.set(pos.x,pos.y,pos.z);runtime.boarFormVisual.rotation.y=runtime.boy.rotation.y}if(runtime.camMode===9){runtime.camera.position.set(pos.x,cy,pos.z);look.set(pos.x+Math.sin(runtime.yaw)*Math.cos(runtime.pitch)*7,cy+Math.sin(runtime.pitch)*7,pos.z+Math.cos(runtime.yaw)*Math.cos(runtime.pitch)*7);}if(runtime.camMode===8){runtime.camera.position.set(pos.x,cy+22,pos.z);look.set(pos.x,cy,pos.z);runtime.camera.up.set(Math.sin(runtime.yaw),0,Math.cos(runtime.yaw))}else runtime.camera.up.set(0,1,0);runtime.camera.lookAt(look);if(runtime.cinematicRunning)runtime.updateCinematic(now,look);runtime.updateHandFlashlight();runtime.spiderLife.syncHosts();runtime.foodView.update(dt,now,runtime.camMode===9&&runtime.started&&!runtime.cinematicRunning&&!runtime.endShown&&!runtime.fishingTarget,runtime.nextFoodKind(),runtime.yellowMushroomStock>0||runtime.yellowAppleStock>0,Object.values(runtime.keys).some(Boolean)||Math.hypot(runtime.stick.x,runtime.stick.y)>.1);runtime.$('cross').style.display=runtime.camMode===9&&runtime.started&&!runtime.paused&&!runtime.cinematicRunning?'block':'none';
// v124: anything large between camera and Timur fades: houses, trees, rocks and cliffs.
// Track only last frame's roots, avoiding a full-world material reset every frame.
runtime.updateCameraOcclusion(now);if(runtime.soundscape)runtime.soundscape.update({active:runtime.started&&!runtime.paused&&!runtime.win&&!runtime.endShown&&!document.hidden,sfx:runtime.sfxEnabled,music:runtime.musicEnabled,season:runtime.currentSeason,stage:runtime.weatherStage,water:runtime.walkingInWater(pos.x,pos.z),mounted:runtime.mountedFriend,x:pos.x,z:pos.z,grounded:runtime.mountedFriend||runtime.py<.1,dt});runtime.updateFamilyHouseReveal();if(runtime.level===6&&runtime.moon.visible){runtime.moonHalo.lookAt(runtime.camera.position);runtime.moonDisc.rotation.y=now*.00003;}runtime.syncOpeningGuide();runtime.skyDome.position.copy(runtime.camera.position);runtime.skyUniforms.horizon.value.copy(runtime.scene.background);runtime.skyUniforms.zenith.value.set(runtime.sandboxMode?0xa8b4e2:runtime.movie?.kind==='outro'?0x617e9e:runtime.level<=4?0x709bc9:runtime.level===5?0x171d39:0x03020b);if(runtime.weatherStage>=2)runtime.skyUniforms.zenith.value.lerp(runtime.scene.background,.65);runtime.tornadoVisual.update(now/1000,runtime.tornadoState,runtime.terrainHeightAt(runtime.tornadoState.x,runtime.tornadoState.z));runtime.updateAdventureHints(now);runtime.updateFishingVisual(now);runtime.updateCraftPreview();runtime.updateCheatMode();runtime.enforceCreatureLimit(true);const renderStart=trackPerformance?performance.now():0;runtime.renderWithLightBudget(now);if(trackPerformance&&runtime.level===6&&runtime.started&&!runtime.paused){performanceFrames.push({cpu:renderStart-frameStart,render:performance.now()-renderStart,calls:runtime.renderer.info.render.calls,triangles:runtime.renderer.info.render.triangles});if(performanceFrames.length>120)performanceFrames.shift()}if(!runtime.__loadFinished){runtime.__loadFinished=true;window.__gameLoaded?.();if(!runtime.campaignProgress.introSeen&&!runtime.__autoTest&&runtime.__autoParams.get('openingtest')!=='1')setTimeout(()=>{if(runtime.started||runtime.cinematicRunning)return;runtime.$('watchIntro').click()},650);}}
 return {
  bindings:{
"trackPerformance":{get:()=>trackPerformance},
"performanceFrames":{get:()=>performanceFrames},
"last":{get:()=>last,set:value=>{last=value}},
"fpsFrames":{get:()=>fpsFrames,set:value=>{fpsFrames=value}},
"fpsLast":{get:()=>fpsLast,set:value=>{fpsLast=value}},
"fpsValue":{get:()=>fpsValue,set:value=>{fpsValue=value}},
"loop":{get:()=>loop},
"warmLightVisibility":{get:()=>warmLightVisibility},
"cinematicWarmup":{get:()=>cinematicWarmup}
  },
  initialize(){

/* init:const */ trackPerformance = runtime.__autoTest||runtime.__autoParams.get('openingtest')==='1';
/* init:const */ performanceFrames = [];

/* init:let */ last = performance.now();
/* init:let */ fpsFrames = 0;
/* init:let */ fpsLast = last;
/* init:let */ fpsValue = 0;

runtime.hud();

runtime.prepareHome();

runtime.prepareCinematicAssets();

runtime.cinematicAssets.visible=true;

/* init:const */ warmLightVisibility = runtime.effectLights.map(light=>light.visible);

runtime.effectLights.forEach(light=>light.visible=false);

for(let i=0;i<runtime.renderLights.length;i++)runtime.renderLights[i].visible=i<lightBudget(runtime.adaptiveGraphics.tier);

/* init:const */ cinematicWarmup = runtime.renderer.compileAsync?runtime.renderer.compileAsync(runtime.cinematicAssets,runtime.camera,runtime.scene):Promise.resolve();

runtime.cinematicAssets.visible=false;

runtime.effectLights.forEach((light,i)=>light.visible=warmLightVisibility[i]);

cinematicWarmup.catch(()=>{}).finally(()=>requestAnimationFrame(loop));
  }
 };

}
