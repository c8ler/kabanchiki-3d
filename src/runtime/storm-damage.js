import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 18 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let charColor,fireEmissiveColor,zeroEmissiveColor;

function spawnStormLeaf(now){if(runtime.stormLeaves.length>(runtime.mobile?34:70))return;const candidates=runtime.treeObjects.filter(t=>t.visible!==false&&Math.hypot(t.position.x-runtime.boy.position.x,t.position.z-runtime.boy.position.z)<28);if(!candidates.length)return;const t=candidates[Math.floor(Math.random()*candidates.length)],m=new THREE.Mesh(new THREE.PlaneGeometry(.18,.10),runtime.stormLeafMat.clone());m.position.set(t.position.x+runtime.rand(-1.4,1.4),runtime.rand(2.2,5.8),t.position.z+runtime.rand(-1.4,1.4));m.rotation.set(runtime.rand(0,6.28),runtime.rand(0,6.28),runtime.rand(0,6.28));runtime.scene.add(m);runtime.stormLeaves.push({g:m,t:runtime.rand(1.8,4.2),spin:runtime.rand(-7,7)})}

function charredCylinder(parent,x,y,z,r,h,tilt=0){const m=new THREE.Mesh(new THREE.CylinderGeometry(r*.72,r,h,7),new THREE.MeshLambertMaterial({color:0x241b18,roughness:1}));m.position.set(x,y,z);m.rotation.z=tilt;m.rotation.y=runtime.rand(0,6.28);parent.add(m);return m}

function makeCharredTreeRemains(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);charredCylinder(g,0,.48*scale,0,.42*scale,.96*scale,runtime.rand(-.05,.05));charredCylinder(g,-.32*scale,.25*scale,.05,.16*scale,.72*scale,-1.05);charredCylinder(g,.30*scale,.22*scale,-.08,.14*scale,.62*scale,1.12);const ash=new THREE.Mesh(new THREE.RingGeometry(.34*scale,.78*scale,11),new THREE.MeshBasicMaterial({color:0x171313,transparent:true,opacity:.72,side:THREE.DoubleSide}));ash.rotation.x=-Math.PI/2;ash.position.y=.012;g.add(ash);runtime.scene.add(g);g.userData.charredStump=true;runtime.charredStumps.push(g);runtime.stormRemains.push(g);return g}

function makeCharredHouseRemains(h){const g=new THREE.Group();g.position.copy(h.position);g.rotation.y=h.rotation.y;for(const [x,z,tilt] of [[-2,-1.55,.10],[2,-1.55,-.08],[-2,1.55,-.12],[2,1.55,.09]])charredCylinder(g,x,.72,z,.17,1.45,tilt);charredCylinder(g,-.8,.30,-.25,.13,2.6,Math.PI/2+runtime.rand(-.15,.15));charredCylinder(g,.9,.24,.55,.12,2.2,Math.PI/2+runtime.rand(-.2,.2));const ash=new THREE.Mesh(new THREE.CircleGeometry(2.65,14),new THREE.MeshBasicMaterial({color:0x201817,transparent:true,opacity:.66,side:THREE.DoubleSide}));ash.rotation.x=-Math.PI/2;ash.position.y=.018;ash.scale.z=.78;g.add(ash);runtime.scene.add(g);runtime.stormRemains.push(g);return g}

function rememberStormObject(obj){if(!obj||obj.userData.stormSnapshot)return;const materials=[];obj.traverse(o=>{if(o.isMesh&&o.material)materials.push([o,o.material])});obj.userData.stormSnapshot={visible:obj.visible,materials};runtime.stormTouched.add(obj)}

function restoreStormObject(obj){const snap=obj?.userData?.stormSnapshot;if(!snap)return;for(const [mesh,mat] of snap.materials)mesh.material=mat;obj.visible=snap.visible;delete obj.userData.stormSnapshot;delete obj.userData.stormBurnEpoch;delete obj.userData.stormBlackened;runtime.stormTouched.delete(obj)}

function resetStormLocationState(){runtime.tornadoState.reset();runtime.tornadoVisual.reset();runtime.tornadoSweep=0;for(const bolt of [...runtime.lightningBolts])runtime.removeLightningBolt(bolt);for(const [obj,b] of [...runtime.stormBurning]){obj.remove(b.light);obj.remove(b.flames)}runtime.stormBurning.clear();for(const obj of [...runtime.stormTouched])restoreStormObject(obj);for(const r of runtime.stormRemains)runtime.scene.remove(r);runtime.stormRemains.length=0;for(const st of [...runtime.charredStumps])runtime.scene.remove(st);runtime.charredStumps.length=0;runtime.lightningFlash=0;runtime.lightningSky.intensity=0;runtime.lightningSun.intensity=0;runtime.nextLightningAt=0}

function tagStormTargetsForCurrentLocation(){for(const t of runtime.treeObjects)if(t.visible!==false)t.userData.stormLocationId=runtime.worldEpoch;for(const h of runtime.houseObjects)if(h.visible!==false)h.userData.stormLocationId=runtime.worldEpoch;for(const l of runtime.logObstacles)if(l.g?.visible!==false&&runtime.forestVisual.visible)l.g.userData.stormLocationId=runtime.worldEpoch;for(const rock of stormRockTargets())if(rock.visible!==false)rock.userData.stormLocationId=runtime.worldEpoch}

function createLivingFire(obj,kind){const g=new THREE.Group();obj.add(g);const wide=kind==='house'?2:kind==='log'?.6:.95;const count=Math.max(7,Math.round(16*runtime.graphicsParticleFactor));for(let i=0;i<count;i++){const smoke=i>=Math.ceil(count*.7),mat=new THREE.MeshBasicMaterial({color:smoke?0x474348:i%2?0xffc34b:0xff641a,transparent:true,opacity:smoke?.24:.85,depthWrite:false});const geo=smoke?new THREE.SphereGeometry(.3,7,5):new THREE.ConeGeometry(.16+i%3*.04,.9,7);const m=new THREE.Mesh(geo,mat);m.userData.firePhase=i*.619;m.userData.fireX=Math.sin(i*2.399)*wide;m.userData.fireZ=Math.cos(i*2.399)*wide;m.userData.smoke=smoke;g.add(m)}return g}

function prepareFireMaterials(obj){const materials=[];obj.traverse(o=>{if(o.isMesh&&o.material?.color){const base=o.material;o.material=base.clone();materials.push({mesh:o,base:base.color.clone(),emissive:base.emissive?.clone()})}});return materials}

function updateLivingFire(obj,b,now){const progress=Math.max(0,1-b.time/b.duration),heat=Math.min(1,progress*3),char=Math.max(0,(progress-.25)/.75);for(const q of b.materials||[]){q.mesh.material.color.copy(q.base).lerp(charColor,char*.78);if(q.mesh.material.emissive){q.mesh.material.emissive.copy(q.emissive||zeroEmissiveColor).lerp(fireEmissiveColor,heat*.22);q.mesh.material.emissiveIntensity=.45}}b.light.intensity=(8+heat*20)*(1+Math.sin(now*.017)*.12);for(const m of b.flames.children){const phase=(now*.0008+m.userData.firePhase)%1,smoke=m.userData.smoke;if(m.userData.firePhase===undefined)continue;const grow=.25+heat*.75;m.position.set(m.userData.fireX+Math.sin(now*.002+m.userData.firePhase)*phase*.15,.2+phase*(smoke?8:4.5)*grow,m.userData.fireZ);m.scale.set((smoke?.5+phase:.7)*grow,(smoke?.5+phase:1.2-phase*.6)*grow,(smoke?.5+phase:.7)*grow);m.material.opacity=(smoke?.24:.9)*(1-phase)*grow}}

function igniteStormTarget(obj,kind='tree'){if(!obj||obj.visible===false||obj.userData.stormLocationId!==runtime.worldEpoch||runtime.stormBurning.has(obj)||runtime.burningTrees.has(obj))return;rememberStormObject(obj);obj.userData.stormBurnEpoch=runtime.worldEpoch;const materials=prepareFireMaterials(obj),flames=createLivingFire(obj,kind),light=runtime.makeEffectLight(0xff882f,8,kind==='house'?20:16,1.2);light.position.set(0,1.8,0);obj.add(light);const duration=kind==='house'?45:36;runtime.stormBurning.set(obj,{time:duration,duration,kind,flames,light,materials,locationId:runtime.worldEpoch});runtime.notice(kind==='house'?'🔥 Молния подожгла дом! Огонь постепенно разгорается.':'🔥 Дерево загорелось — держись подальше от огня!')}

function updateStormFires(dt,now){for(const [obj,b] of [...runtime.stormBurning]){if(b.locationId!==runtime.worldEpoch||obj.userData.stormLocationId!==runtime.worldEpoch){obj.remove(b.light);obj.remove(b.flames);runtime.stormBurning.delete(obj);restoreStormObject(obj);continue}b.time-=dt;updateLivingFire(obj,b,now);const wp=new THREE.Vector3();obj.getWorldPosition(wp);const fireRadius=b.kind==='house'?3.4:2.65;if(Math.hypot(wp.x-runtime.boy.position.x,wp.z-runtime.boy.position.z)<fireRadius&&runtime.invuln<=0){runtime.life--;runtime.statsData.damage++;runtime.invuln=2.4;runtime.playerHitFeedback('fire');runtime.notice(runtime.life>0?'🔥 Горящий объект обжигает! Отойди! -1❤️':'🔥 Тимур слишком близко подошёл к огню.');if(runtime.life<=0)runtime.showEnd(false)}if(b.time<=0){obj.remove(b.light);obj.remove(b.flames);obj.visible=false;if(b.kind==='house')makeCharredHouseRemains(obj);else if(b.kind==='log'){const wp=new THREE.Vector3();obj.getWorldPosition(wp);makeCharredTreeRemains(wp.x,wp.z,.55)}else makeCharredTreeRemains(obj.position.x,obj.position.z,1);runtime.stormBurning.delete(obj)}}}

function stormRockTargets(){return [...runtime.rockPositions.map(q=>q[3]),...runtime.boundaryDecor,...runtime.mountainObstacles.map(q=>q[3]),...runtime.lairObstacles.filter(q=>q[3].children.some(m=>m.geometry===runtime.rockGeo)).map(q=>q[3])].filter(Boolean)}

function charStormRock(obj){rememberStormObject(obj);obj.userData.stormBlackened=true;obj.traverse(o=>{if(o.isMesh&&o.material?.color){o.material=o.material.clone();o.material.color.set(0x161616)}});runtime.notice('⚡ Молния ударила в камень — он почернел!')}
 return {
  bindings:{
"spawnStormLeaf":{get:()=>spawnStormLeaf},
"charredCylinder":{get:()=>charredCylinder},
"makeCharredTreeRemains":{get:()=>makeCharredTreeRemains},
"makeCharredHouseRemains":{get:()=>makeCharredHouseRemains},
"rememberStormObject":{get:()=>rememberStormObject},
"restoreStormObject":{get:()=>restoreStormObject},
"resetStormLocationState":{get:()=>resetStormLocationState},
"tagStormTargetsForCurrentLocation":{get:()=>tagStormTargetsForCurrentLocation},
"createLivingFire":{get:()=>createLivingFire},
"prepareFireMaterials":{get:()=>prepareFireMaterials},
"charColor":{get:()=>charColor},
"fireEmissiveColor":{get:()=>fireEmissiveColor},
"zeroEmissiveColor":{get:()=>zeroEmissiveColor},
"updateLivingFire":{get:()=>updateLivingFire},
"igniteStormTarget":{get:()=>igniteStormTarget},
"updateStormFires":{get:()=>updateStormFires},
"stormRockTargets":{get:()=>stormRockTargets},
"charStormRock":{get:()=>charStormRock}
  },
  initialize(){

/* init:const */ charColor = new THREE.Color(0x272321);
/* init:const */ fireEmissiveColor = new THREE.Color(0x6d2408);
/* init:const */ zeroEmissiveColor = new THREE.Color(0);
  }
 };

}
