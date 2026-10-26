import * as THREE from "../../vendor/three/three.module.min.js";
import { polygonContact } from "../movement-geometry.js?v=218";
import { riverCenterAt, lakeInletDepthAt, lakeRadiusAt } from "../world-surface.js?v=218";

// Owns 29 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let seasonVisual,seasonBaseMaterials,seasonMaterialCache,seasonTextures,snowCount,snowPositions,snowGeometry,snowPixels,snowMap,snowMaterial,snowGroup,springBloomTime,christmasSolid,waterFxRoot,sprayPool,rainRingPool,sprayGeo,ringGeo,sprayCursor,ringCursor,rainRippleClock,wetStepDistance,wetLast;

function resetCats(){const houses=runtime.houseObjects.filter(h=>h.visible&&!h.userData.enterable).map(h=>{h.updateWorldMatrix(true,true);const roof=h.children.filter(m=>m.isMesh&&(seasonBaseMaterials.get(m)||m.material).map===runtime.mats.roof.map).sort((a,b)=>b.position.y-a.position.y)[0];const b=new THREE.Box3().setFromObject(roof||h),c=new THREE.Vector3();b.getCenter(c);const full=new THREE.Box3().setFromObject(h);return {exit:{x:full.max.x+1,z:(full.min.z+full.max.z)/2},x:c.x,z:c.z,y:b.max.y,w:b.max.x-b.min.x,d:b.max.z-b.min.z}});const objects=[...runtime.treeSolidMeshes.filter(m=>m.parent?.visible).map(m=>runtime.treeTrunkShape(m)),...runtime.rockPositions.filter(q=>q[3]?.visible).map(q=>({x:q[0],z:q[1],r:q[2]})),...houses.map(h=>({x:h.x,z:h.z,r:h.w*.6}))];const trunks=runtime.treeSolidMeshes.filter(m=>m.parent?.visible).map(m=>runtime.treeTrunkShape(m)),rocks=runtime.rockPositions.filter(q=>q[3]?.visible).map(q=>({x:q[0],z:q[1],r:q[2]})),walls=runtime.wallGeometry();runtime.catLife.reset(runtime.currentSeason==='winter'?0:runtime.level,houses,objects,runtime.terrainHeightAt,(x,z)=>trunks.some(t=>Math.hypot(x-t.x,z-t.z)<t.r+.22)||rocks.some(t=>Math.hypot(x-t.x,z-t.z)<t.r+.22)||walls.some(w=>polygonContact(w.polygon,x,z,.22)));}

function seasonalMaterial(mesh,kind,index=0){
 let original=seasonBaseMaterials.get(mesh);if(!original){original=mesh.material;seasonBaseMaterials.set(mesh,original)}
 if(runtime.currentSeason==='summer'){mesh.material=original;return}
 let variants=seasonMaterialCache.get(original);if(!variants){variants={};seasonMaterialCache.set(original,variants)}const key=runtime.currentSeason+kind+index%3;
 if(!variants[key]){const m=original.clone();if(kind==='grass'||kind==='leaf'||kind==='leaf2'){m.map=seasonTextures[runtime.currentSeason][kind];m.color.set(0xffffff)}else if(kind==='snowstone'){m.map=seasonTextures.winter.grass;m.color.set(0xe5edf5)}else m.color.set(runtime.currentSeason==='spring'?0x9ac75d:runtime.currentSeason==='winter'?0xd3e2e5:[0xbf7134,0xd99b3c,0x9e512c][index%3]);m.needsUpdate=true;variants[key]=m}mesh.material=variants[key];
}

function updateSpringBloom(dt){if(runtime.currentSeason!=='spring')return;springBloomTime=Math.min(60,springBloomTime+dt);const k=.3+.7*(springBloomTime/60);for(const t of runtime.treeObjects)t.traverse(m=>{if(m.userData.springCrown)m.scale.copy(m.userData.fullCrownScale).multiplyScalar(k)})}

function applySeason(){
 runtime.worldEpoch++;if(christmasSolid){runtime.treeSolidMeshes.splice(runtime.treeSolidMeshes.indexOf(christmasSolid),1);christmasSolid=null}
 runtime.syncSeasonChoices();springBloomTime=0;for(const t of runtime.treeObjects)t.traverse(m=>{if(m.userData.springCrown)m.scale.copy(m.userData.fullCrownScale).multiplyScalar(runtime.currentSeason==='spring'?.3:1)});
 while(seasonVisual.children.length){const o=seasonVisual.children[0];seasonVisual.remove(o);o.geometry?.dispose();o.material?.dispose()}
 snowGroup.visible=false;runtime.weatherGroup.visible=false;runtime.winterDrifts.length=0;runtime.winterSnowMinute=-1;
 const frozen=runtime.currentSeason==='winter';runtime.roadSurface.material=frozen?runtime.winterRoadMaterial:runtime.mats.path;runtime.roadEdge.material=frozen?runtime.winterRoadMaterial:runtime.pathEdgeMat;for(const m of [runtime.lake,runtime.riverWater,runtime.tributaryWater]){if(!m.isMesh)continue;if(!m.userData.liquidMaterial)m.userData.liquidMaterial=m.material;m.material=frozen?runtime.iceWaterMaterial:m.userData.liquidMaterial}runtime.lakeWaves.forEach(m=>m.visible=!frozen);runtime.tributaryFlow.forEach(m=>m.visible=!frozen);for(const m of runtime.lakeVisual.children)if(m.userData.lily)m.visible=!frozen;
 runtime.scene.traverse(mesh=>{if(!mesh.isMesh||!mesh.material||Array.isArray(mesh.material))return;const base=seasonBaseMaterials.get(mesh)||mesh.material;for(const kind of ['grass','leaf','leaf2'])if(base.map===runtime.mats[kind].map){seasonalMaterial(mesh,kind);break}if(base.map===runtime.mats.roof.map||base.map===runtime.mats.stone.map){if(runtime.currentSeason==='winter')seasonalMaterial(mesh,'snowstone');else if(seasonBaseMaterials.has(mesh))mesh.material=base}});
 for(let i=0;i<runtime.treeObjects.length;i++)runtime.treeObjects[i].traverse(mesh=>{if(!mesh.isMesh||!mesh.material?.color)return;const base=seasonBaseMaterials.get(mesh)||mesh.material,hsl={};base.color.getHSL(hsl);if(hsl.h>.16&&hsl.h<.49&&hsl.s>.18)seasonalMaterial(mesh,'foliage',i)});
 runtime.forestGround.children.forEach(m=>m.visible=runtime.currentSeason!=='winter');for(const mesh of [runtime.grassBlades,...runtime.forestGround.children.filter(m=>(seasonBaseMaterials.get(m)||m.material)===runtime.mossMat||(seasonBaseMaterials.get(m)||m.material)===runtime.darkGrassMat)])seasonalMaterial(mesh,'foliage');
 runtime.grassBlades.visible=(runtime.currentSeason==='summer'||runtime.currentSeason==='spring');runtime.forestVisual.children.filter(g=>g.userData.seasonPlant).forEach(g=>g.visible=runtime.currentSeason==='summer'||runtime.currentSeason==='spring');runtime.ground.material.color.set(runtime.currentSeason==='summer'?[0xffffff,0xffead0,0xd9f0cf,0xd3e6cc,0xaeb3b6,0x76636b][runtime.level-1]:0xffffff);runtime.stormLeafMat.color.set(runtime.currentSeason==='autumn'?0xc7772d:runtime.currentSeason==='winter'?0xddeaf2:0x6f8f35);
 if(runtime.currentSeason!=='summer'){
  runtime.ground.material.color.set(0xffffff);
  runtime.stormLeafMat.color.set(runtime.currentSeason==='autumn'?0xc7772d:0xddeaf2);
  if(runtime.currentSeason==='spring'){runtime.addSpringFlowers()}else if(runtime.currentSeason==='autumn'){
   const g=new THREE.PlaneGeometry(.23,.12),m=new THREE.MeshLambertMaterial({color:0xd69a3d,side:THREE.DoubleSide});const leaves=new THREE.InstancedMesh(g,m,runtime.mobile?160:400),d=new THREE.Object3D();for(let i=0;i<leaves.count;i++){const x=Math.sin(i*71.7)*41,z=Math.cos(i*32.9)*41;d.position.set(x,runtime.terrainHeightAt(x,z)+.025,z);d.rotation.set(-Math.PI/2,0,i*2.13);d.updateMatrix();leaves.setMatrixAt(i,d.matrix)}leaves.instanceMatrix.needsUpdate=true;seasonVisual.add(leaves)
  }else if(runtime.currentSeason==='winter'){
   runtime.addChristmasTree();runtime.addWinterRoadBorders();
   runtime.scene.background.lerp(new THREE.Color(runtime.level>=5?0x39445e:0xc8d7e1),.55);runtime.scene.fog.color.copy(runtime.scene.background);runtime.scene.fog.far=runtime.level>=5?48:68;runtime.hemi.intensity=Math.max(runtime.hemi.intensity,.55);snowGroup.visible=true;
  }
 }
 runtime.syncMeadowGrass();resetCats();runtime.tagStormTargetsForCurrentLocation();runtime.birdLife.reset(runtime.currentSeason,runtime.treeObjects.filter(t=>t.visible),runtime.level===3?runtime.catLife.houses.map(h=>({x:h.x,z:h.z,y:h.y+.12})):[]);runtime.weatherBaseSky=runtime.scene.background.clone();
}

function growSnowDrifts(minute){if(minute<1)return;while(runtime.winterDrifts.length<Math.min(24,minute*6)){const i=runtime.winterDrifts.length;let found=null;for(let n=0;n<500;n++){const x=runtime.rand(-37,37),z=runtime.rand(-37,35);if(Math.abs(x)<7||(runtime.level===2&&(lakeRadiusAt(x,z)<16.5||lakeInletDepthAt(x,z)>0))||(runtime.level===4&&Math.abs(z-riverCenterAt(x))<7)||runtime.worldObstacleAt(x,z,1.8)||runtime.winterDrifts.some(d=>Math.hypot(d.x-x,d.z-z)<5))continue;found={x,z};break}if(!found)break;const r=runtime.rand(1.2,2.5),m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),runtime.winterRoadMaterial);m.position.set(found.x,runtime.worldSurface.height(found.x,found.z)-.015,found.z);m.receiveShadow=!runtime.mobile;seasonVisual.add(m);runtime.winterDrifts.push({...found,r,height:0,m})}for(const d of runtime.winterDrifts){d.height=.16+minute*.17;d.m.scale.set(d.r,d.height,d.r)}const p=runtime.surfaceGeometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,runtime.groundSurfaceHeightAt(p.getX(i),-p.getY(i)));p.needsUpdate=true;runtime.surfaceGeometry.computeVertexNormals()}

function updateSnow(dt,now){
 const minute=Math.min(4,Math.floor(runtime.levelTime/60));runtime.weatherStage=Math.min(4,minute+1);if(minute!==runtime.winterSnowMinute){runtime.winterSnowMinute=minute;growSnowDrifts(minute);if(minute>0)runtime.notice('❄️ Снегопад усиливается, сугробы растут!')}runtime.scene.fog.far=Math.max(runtime.level>=5?28:36,(runtime.level>=5?48:68)-minute*7);snowMaterial.size=.13+minute*.018;
 runtime.nextLightningAt=0;runtime.lightningFlash=0;runtime.lightningSky.intensity=0;runtime.lightningSun.intensity=0;runtime.weatherGroup.visible=false;snowGroup.visible=true;snowGroup.position.set(runtime.boy.position.x,0,runtime.boy.position.z);snowGeometry.setDrawRange(0,Math.floor(snowCount*runtime.graphicsParticleFactor*Math.min(1,.35+minute*.2)));for(let i=0;i<snowCount;i++){const j=i*3;snowPositions[j]+=dt*(1.5+Math.sin(now*.001+i)*.75);snowPositions[j+1]-=dt*(3.2+minute*.8+(i%7)*.22);snowPositions[j+2]+=dt*(2.4+Math.cos(now*.0012+i)*.45);if(snowPositions[j+1]<-.5){snowPositions[j]=runtime.rand(-26,26);snowPositions[j+1]=runtime.rand(23,29);snowPositions[j+2]=runtime.rand(-26,26)}if(snowPositions[j]>26)snowPositions[j]=-26;if(snowPositions[j+2]>26)snowPositions[j+2]=-26}snowGeometry.attributes.position.needsUpdate=true;runtime.updateStormClouds(dt,now);for(const cloud of runtime.weatherClouds)if(cloud.visible)cloud.userData.cloudMat.color.set(0xcdd8e2);runtime.updateStormFires(dt,now);
}
 return {
  bindings:{
"resetCats":{get:()=>resetCats},
"seasonVisual":{get:()=>seasonVisual},
"seasonBaseMaterials":{get:()=>seasonBaseMaterials},
"seasonMaterialCache":{get:()=>seasonMaterialCache},
"seasonTextures":{get:()=>seasonTextures},
"snowCount":{get:()=>snowCount},
"snowPositions":{get:()=>snowPositions},
"snowGeometry":{get:()=>snowGeometry},
"snowPixels":{get:()=>snowPixels},
"snowMap":{get:()=>snowMap},
"snowMaterial":{get:()=>snowMaterial},
"snowGroup":{get:()=>snowGroup},
"seasonalMaterial":{get:()=>seasonalMaterial},
"springBloomTime":{get:()=>springBloomTime,set:value=>{springBloomTime=value}},
"updateSpringBloom":{get:()=>updateSpringBloom},
"christmasSolid":{get:()=>christmasSolid,set:value=>{christmasSolid=value}},
"applySeason":{get:()=>applySeason},
"growSnowDrifts":{get:()=>growSnowDrifts},
"updateSnow":{get:()=>updateSnow},
"waterFxRoot":{get:()=>waterFxRoot},
"sprayPool":{get:()=>sprayPool},
"rainRingPool":{get:()=>rainRingPool},
"sprayGeo":{get:()=>sprayGeo},
"ringGeo":{get:()=>ringGeo},
"sprayCursor":{get:()=>sprayCursor,set:value=>{sprayCursor=value}},
"ringCursor":{get:()=>ringCursor,set:value=>{ringCursor=value}},
"rainRippleClock":{get:()=>rainRippleClock,set:value=>{rainRippleClock=value}},
"wetStepDistance":{get:()=>wetStepDistance,set:value=>{wetStepDistance=value}},
"wetLast":{get:()=>wetLast,set:value=>{wetLast=value}}
  },
  initialize(){

/* init:const */ seasonVisual = new THREE.Group();

runtime.scene.add(seasonVisual);

/* init:const */ seasonBaseMaterials = new WeakMap();
/* init:const */ seasonMaterialCache = new WeakMap();

/* init:const */ seasonTextures = {spring:{grass:runtime.pixelTexture(164,[127,178,84],[76,133,54],'grass'),leaf:runtime.pixelTexture(165,[148,194,76],[73,148,58],'grass'),leaf2:runtime.pixelTexture(166,[179,215,112],[113,174,71],'grass')},autumn:{grass:runtime.pixelTexture(157,[169,119,56],[121,79,38],'grass'),leaf:runtime.pixelTexture(158,[214,133,40],[155,57,30],'grass'),leaf2:runtime.pixelTexture(159,[227,176,67],[179,97,34],'grass')},winter:{grass:runtime.pixelTexture(160,[232,240,247],[195,210,223],'noise'),leaf:runtime.pixelTexture(161,[218,230,235],[151,179,184],'grass'),leaf2:runtime.pixelTexture(162,[241,244,247],[188,208,216],'grass')}};

/* init:const */ snowCount = runtime.mobile?550:1250;
/* init:const */ snowPositions = new Float32Array(snowCount*3);

for(let i=0;i<snowCount;i++){snowPositions[i*3]=runtime.rand(-26,26);snowPositions[i*3+1]=runtime.rand(0,28);snowPositions[i*3+2]=runtime.rand(-26,26)}

/* init:const */ snowGeometry = new THREE.BufferGeometry();

snowGeometry.setAttribute('position',new THREE.BufferAttribute(snowPositions,3));

/* init:const */ snowPixels = new Uint8Array(32*32*4);

for(let y=0;y<32;y++)for(let x=0;x<32;x++){const i=(y*32+x)*4,r=Math.hypot(x-15.5,y-15.5)/15.5;snowPixels[i]=snowPixels[i+1]=snowPixels[i+2]=255;snowPixels[i+3]=Math.round(Math.max(0,Math.min(1,(1-r)*3))*255)}

/* init:const */ snowMap = new THREE.DataTexture(snowPixels,32,32,THREE.RGBAFormat);

snowMap.needsUpdate=true;

/* init:const */ snowMaterial = new THREE.PointsMaterial({map:snowMap,color:0xf4f8ff,size:.16,transparent:true,opacity:.92,depthWrite:false});

/* init:const */ snowGroup = new THREE.Points(snowGeometry,snowMaterial);

snowGroup.visible=false;

runtime.scene.add(snowGroup);

/* init:let */ springBloomTime = 0;

/* init:let */ christmasSolid = null;



// Bounded pools: water animation never allocates meshes in the frame loop.
/* init:const */ waterFxRoot = new THREE.Group();

runtime.scene.add(waterFxRoot);

/* init:const */ sprayPool = [];
/* init:const */ rainRingPool = [];

/* init:const */ sprayGeo = new THREE.SphereGeometry(.035,5,4);
/* init:const */ ringGeo = new THREE.RingGeometry(.92,1,24);

for(let i=0;i<(runtime.mobile?48:96);i++){const m=new THREE.Mesh(sprayGeo,new THREE.MeshBasicMaterial({color:0xc5eef5,transparent:true,opacity:.8,depthWrite:false}));m.visible=false;waterFxRoot.add(m);sprayPool.push({m,t:0,v:new THREE.Vector3()})}

for(let i=0;i<(runtime.mobile?24:48);i++){const m=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0xccebf0,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.visible=false;waterFxRoot.add(m);rainRingPool.push({m,t:0})}

/* init:let */ sprayCursor = 0;
/* init:let */ ringCursor = 0;
/* init:let */ rainRippleClock = 0;
/* init:let */ wetStepDistance = 0;
/* init:let */ wetLast = null;
  }
 };

}
