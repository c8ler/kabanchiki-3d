window.__gameLoadProgress?.(84);let __loadFinished=false;
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { BOAR_MAX_WATER_DEPTH, attacksPlayer, shallowStepAllowed, capsuleAt, capsuleCircleContact, capsuleCapsuleContact } from './boar-physics.js?v=181';
import { convexHull, polygonContact, FriendYield } from './movement-geometry.js?v=181';
import { BOSS_HITS, riverCenterAt, riverDepthAt, onRiverBridge, lakeInletCenterAt, lakeInletHalfWidthAt, lakeInletDepthAt, bridgeRailBlocked, weatherDeadline, rainFillLimit, rainFillRate, WorldSurface, lakePointAt, lakeRadiusAt, lakeDepth } from './world-surface.js?v=181';
import { Knockback } from './knockback.js?v=181';
import { AdaptiveQuality, GRAPHICS_TIERS } from './adaptive-quality.js?v=181';
import { AttemptProgress, seasonForAttempts } from './seasons.js?v=181';
import { Soundscape } from './soundscape.js?v=181';
import { introStagingAt } from './cinematic-staging.js?v=181';
import { segmentHitsBox, findGridPath } from './navigation.js?v=181';
import { CatLife } from './cat-life.js?v=181';
import { BirdLife } from './bird-life.js?v=181';
import { CAT_BERRY_CHANCE, CAT_FORM_SECONDS, CAT_JUMP_SPEED, isCatBerryRoll, formTimeAfterStep } from './form-rules.js?v=181';
const GAME_VERSION='v181';
const attemptProgress=new AttemptProgress((()=>{try{return window.localStorage}catch{return null}})());let currentSeason=attemptProgress.season;
let chosenSeason=null;try{chosenSeason=localStorage.getItem('kabanchiki3d_chosen_season')}catch{}
function unlockedSeasons(){return attemptProgress.failed>=60?['summer','autumn','winter','spring']:attemptProgress.failed>=40?['summer','autumn','winter']:attemptProgress.failed>=20?['summer','autumn']:['summer']}
if(unlockedSeasons().includes(chosenSeason))currentSeason=chosenSeason;else chosenSeason=null;
function syncSeasonChoices(){for(const id of ['introSeason','pauseSeason']){const select=document.getElementById(id);if(!select)continue;select.parentElement.hidden=unlockedSeasons().length<2;select.replaceChildren(...unlockedSeasons().map(value=>{const option=document.createElement('option');option.value=value;option.textContent={summer:'☀️ Лето',autumn:'🍂 Осень',winter:'❄️ Зима',spring:'🌸 Весна'}[value];return option}));select.value=currentSeason}}
function chooseSeason(event){const value=event.target.value;if(!unlockedSeasons().includes(value))return;chosenSeason=value;currentSeason=value;try{localStorage.setItem('kabanchiki3d_chosen_season',value)}catch{}if(started){clearWorldFires();scene.background.set([0xeac096,0xe9a67f,0xd99580,0x707686,0x34385e,0x080611][level-1]);scene.fog.color.copy(scene.background);scene.fog.near=level===1?32:level===4?18:level>=5?9:28;scene.fog.far=level===1?88:level===4?62:level>=5?38:78;sun.intensity=[2.8,2.35,1.95,1.05,.28,.015][level-1];hemi.intensity=[1.65,1.75,1.38,1.0,.75,.075][level-1];applySeason();const pos=surfaceGeometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,groundSurfaceHeightAt(pos.getX(i),-pos.getY(i)));pos.needsUpdate=true;surfaceGeometry.computeVertexNormals();hud()}else syncSeasonChoices()}
// v103: GAME_VERSION is the single runtime source of truth for every visible version label.
window.__KABANCHIKI_VERSION__=GAME_VERSION;
for(const id of ['loadingVersion']){const el=document.getElementById(id);if(el)el.textContent=GAME_VERSION;}
document.title=`Кабанчики 3D ${GAME_VERSION}`;
const SUPABASE_URL='https://usszaimdbepgexnigiau.supabase.co';
const SUPABASE_KEY='sb_publishable_x3H1Px6JaDTwpyZy_ARyiA_OqEKLINZ'; const $=id=>document.getElementById(id), mobile=matchMedia('(pointer:coarse)').matches;if(mobile){$('message').textContent='🕹️ Джойстик — идти · проведи пальцем — камера · справа — Прыжок и Кормить';$('introControls').innerHTML='<b>На телефоне:</b> левый джойстик — движение, проведи пальцем по миру — поворот камеры, кнопки «Прыжок» и «Кормить» справа.';$('pauseControls').innerHTML='<b>Телефон:</b> левый джойстик — движение · проведи пальцем по миру — камера · кнопки «Прыжок» и «Кормить» справа.'}else{$('message').textContent='W/S — вперёд/назад · A/D и ←/→ — стрейф · мышь — камера · ЛКМ — кормить · ПКМ — прыжок';$('introControls').innerHTML='<b>На ПК:</b> W/S и ↑/↓ — вперёд/назад, A/D и ←/→ — стрейф, ПРОБЕЛ/ПКМ — прыжок, ЛКМ/E/F/Enter — бросить еду, V — сменить вид, ESC — пауза. Мышь сразу поворачивает камеру.';$('pauseControls').innerHTML='<b>Управление ПК:</b> W/S и ↑/↓ — вперёд/назад · A/D и ←/→ — стрейф · ПРОБЕЛ/ПКМ — прыжок · ЛКМ/E/F/Enter — кормить · мышь — камера без зажатия · V — вид · ESC — меню.'}let started=false,first=false,life=5,rescued=0,win=false,invuln=0,flash=0,camMode=(mobile?0:4),yaw=0,pitch=.18,move={x:0,z:0},jump=false,act=false,keys={},drag=null,stickPointer=null,stick={x:0,y:0};$('camera').textContent=`📷 Вид ${camMode+1}/9`;
const __autoParams=new URLSearchParams(location.search),__autoTest=__autoParams.get('autotest')==='1';
window.__KABANCHIKI_TEST__={version:GAME_VERSION,ready:false,level:0,errors:[]};if(window.__KABANCHIKI_BUILD__&&window.__KABANCHIKI_BUILD__!==GAME_VERSION)window.__KABANCHIKI_TEST__.errors.push(`version-mismatch:${window.__KABANCHIKI_BUILD__}:${GAME_VERSION}`);if(__autoTest){let __seed=1337;Math.random=()=>{__seed=(__seed*1664525+1013904223)>>>0;return __seed/4294967296}}

const scene=new THREE.Scene();scene.background=new THREE.Color(0x9bd2f1);scene.fog=new THREE.Fog(0x9bd2f1,35,83);const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.08,110);const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;document.body.prepend(renderer.domElement);const hemi=new THREE.HemisphereLight(0xb9d5ff,0x52613b,1.4);scene.add(hemi);const sun=new THREE.DirectionalLight(0xffbd76,2.2);sun.position.set(-28,24,-42);sun.target.position.set(0,0,0);scene.add(sun.target);sun.castShadow=!mobile;
sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-78;sun.shadow.camera.right=78;sun.shadow.camera.top=78;sun.shadow.camera.bottom=-78;
sun.shadow.camera.near=.1;sun.shadow.camera.far=180;sun.shadow.bias=-.00012;sun.shadow.normalBias=.018;sun.shadow.radius=2;scene.add(sun);const torch=new THREE.SpotLight(0xfff1c2,0,29,Math.PI/5,.55,1);scene.add(torch);scene.add(torch.target);
// New visual assets use their own random stream so Three.js UUID allocation does not shift world generation.
let visualSeed=8147;
function visualOnly(build){const previous=Math.random;Math.random=()=>{visualSeed=(Math.imul(visualSeed,1664525)+1013904223)>>>0;return visualSeed/4294967296};try{return build()}finally{Math.random=previous}}
// Procedural sky: cool zenith, warm horizon, no external texture downloads.
const skyUniforms={horizon:{value:new THREE.Color(0xeac096)},zenith:{value:new THREE.Color(0x739ecb)}};
const skyDome=visualOnly(()=>new THREE.Mesh(new THREE.SphereGeometry(100,24,12),new THREE.ShaderMaterial({uniforms:skyUniforms,side:THREE.BackSide,depthWrite:false,vertexShader:'varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 horizon;uniform vec3 zenith;varying vec3 skyDirection;void main(){float h=max(0.0,normalize(skyDirection).y);vec3 c=mix(horizon,zenith,smoothstep(0.0,0.78,h));gl_FragColor=vec4(c,1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'})));skyDome.frustumCulled=false;skyDome.renderOrder=-10;scene.add(skyDome);
function glowTexture(){const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=255;data[i+3]=Math.max(0,Math.pow(Math.max(0,1-r),2)*180)}const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.needsUpdate=true;return t}
const softGlowTexture=visualOnly(glowTexture);
const mats={grass:new THREE.MeshLambertMaterial({color:0x6aa84d}),soil:new THREE.MeshLambertMaterial({color:0x92714d}),path:new THREE.MeshLambertMaterial({color:0xb7a06d}),leaf:new THREE.MeshLambertMaterial({color:0x39834b}),leaf2:new THREE.MeshLambertMaterial({color:0x4d9854}),wood:new THREE.MeshLambertMaterial({color:0x765239}),stone:new THREE.MeshLambertMaterial({color:0x8b9a9d}),skin:new THREE.MeshLambertMaterial({color:0xf2ba83}),hair:new THREE.MeshLambertMaterial({color:0x65402b}),shirt:new THREE.MeshLambertMaterial({color:0x3776bc}),pants:new THREE.MeshLambertMaterial({color:0x35465b}),boar:new THREE.MeshLambertMaterial({color:0x80513c}),boar2:new THREE.MeshLambertMaterial({color:0xa87955}),pink:new THREE.MeshLambertMaterial({color:0xe4a5a0}),white:new THREE.MeshLambertMaterial({color:0xf8f1df}),black:new THREE.MeshLambertMaterial({color:0x211c1c}),red:new THREE.MeshLambertMaterial({color:0xd23c37}),gold:new THREE.MeshLambertMaterial({color:0xffd55e}),roof:new THREE.MeshLambertMaterial({color:0xb65c43})};
function pixelTexture(seed=1,base=[180,180,180],accent=[130,130,130],kind='noise'){
 const w=16,h=16,data=new Uint8Array(w*h*4);let n=(seed*1103515245+12345)>>>0;
 const rnd=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)>>>8)/16777216;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let mix=.10+rnd()*.18;
  if(kind==='grass'&&((x+y*3)%7===0||rnd()<.08))mix=.42;
  if(kind==='wood'&&(x%4===0||x%4===1))mix=.34+rnd()*.12;
  if(kind==='stone'&&((x*3+y*5+seed)%11<2))mix=.36;
  if(kind==='cloth'&&((x+y)%4===0))mix=.24;
  if(kind==='fur'&&((x*5+y*3+seed)%9<2))mix=.30;
  if(kind==='roof'&&((x+y)%5===0))mix=.38;
  const i=(y*w+x)*4;data[i]=base[0]*(1-mix)+accent[0]*mix;data[i+1]=base[1]*(1-mix)+accent[1]*mix;data[i+2]=base[2]*(1-mix)+accent[2]*mix;data[i+3]=255;
 }
 const t=new THREE.DataTexture(data,w,h,THREE.RGBAFormat);t.needsUpdate=true;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t
}
const textureSpecs={
 grass:[1,[170,211,115],[133,184,89],'grass'],soil:[2,[146,113,77],[92,69,48],'noise'],path:[3,[183,160,109],[135,111,73],'stone'],leaf:[4,[57,131,75],[29,92,47],'grass'],leaf2:[5,[77,152,84],[40,112,58],'grass'],wood:[6,[118,82,57],[72,47,32],'wood'],stone:[7,[139,154,157],[91,104,108],'stone'],skin:[8,[242,186,131],[215,147,100],'noise'],hair:[9,[101,64,43],[57,37,27],'fur'],shirt:[10,[55,118,188],[31,72,126],'cloth'],pants:[11,[53,70,91],[31,43,60],'cloth'],boar:[12,[128,81,60],[76,46,35],'fur'],boar2:[13,[168,121,85],[112,76,54],'fur'],pink:[14,[228,165,160],[184,115,111],'noise'],white:[15,[248,241,223],[204,199,184],'cloth'],black:[16,[33,28,28],[12,10,10],'noise'],red:[17,[210,60,55],[137,35,32],'cloth'],gold:[18,[255,213,94],[191,142,43],'noise'],roof:[19,[182,92,67],[116,52,43],'roof']};
for(const name of Object.keys(mats)){const old=mats[name];mats[name]=new THREE.MeshStandardMaterial({color:old.color,roughness:name==='gold'?.48:.92,metalness:name==='gold'?.18:0});old.dispose()}
for(const [name,spec] of Object.entries(textureSpecs)){const [seed,base,accent,kind]=spec;mats[name].map=pixelTexture(seed,base,accent,kind);mats[name].color.set(0xffffff);mats[name].needsUpdate=true}
const cube=new THREE.BoxGeometry(1,1,1);function block(parent,mat,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(cube,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=!mobile;m.receiveShadow=!mobile;parent.add(m);return m}function sphere(parent,mat,x,y,z,r=.3){const m=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),mat);m.position.set(x,y,z);m.castShadow=!mobile;m.receiveShadow=!mobile;parent.add(m);return m}function group(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);return g}function rand(a,b){return a+Math.random()*(b-a)}
// v117: the central road is reserved for traversal. Solid rocks/mountains/lair props must stay outside its visible width.
function roadHalfWidthAt(z){return 2.2+Math.sin(z*.18)*.21+Math.sin(z*.51)*.09}
function roadClearForRadius(x,z,r=.4,margin=.18){return Math.abs(x)>roadHalfWidthAt(z)+r+margin}
function safeSolidScenerySpot(radius,max=40){for(let tries=0;tries<120;tries++){const x=rand(-max,max),z=rand(-max,max);if(roadClearForRadius(x,z,radius))return [x,z]}return [Math.random()<.5?-max:max,rand(-max,max)]}
const ground=block(scene,mats.grass,0,-.55,0,96,1,96);ground.receiveShadow=!mobile;
const forestGround=new THREE.Group();scene.add(forestGround);
const mossMat=new THREE.MeshLambertMaterial({color:0x568c45}),darkGrassMat=new THREE.MeshLambertMaterial({color:0x477c3e}),pathEdgeMat=new THREE.MeshLambertMaterial({color:0x92794e}),pebbleMat=new THREE.MeshLambertMaterial({color:0x9a927e});
for(let z=-47;z<=47;z+=3)for(let x=-47;x<=47;x+=3){if(Math.abs(x)>roadHalfWidthAt(z)+.9&&Math.random()<.11)block(scene,mats.leaf2,x,-.028,z,rand(.3,.8),.055,rand(.3,.8))}
function roadRibbon(extra,y,material){const vertices=[],indices=[];for(let i=0;i<=96;i++){const z=-48+i,w=roadHalfWidthAt(z)+extra;vertices.push(-w,y,z,w,y,z);if(i<96){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(vertices.flatMap((v,i)=>i%3===0?[v*.4,vertices[i+2]*.4]:[]),2));g.setIndex(indices);g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.receiveShadow=!mobile;scene.add(m);return m}const roadEdge=roadRibbon(.32,.025,pathEdgeMat),roadSurface=roadRibbon(0,.05,mats.path);
for(let i=0;i<(mobile?42:90);i++){let x=rand(-43,43),z=rand(-43,43);if(Math.abs(x)<roadHalfWidthAt(z)+1.2)continue;const m=block(forestGround,i%2?mossMat:darkGrassMat,x,-.015,z,rand(.45,1.7),.035,rand(.45,1.7));m.rotation.y=rand(0,6.28)}
for(let i=0;i<(mobile?28:60);i++){const z=rand(-43,43),edge=(Math.random()<.5?-1:1)*rand(2.6,4.8);const m=new THREE.Mesh(new THREE.DodecahedronGeometry(rand(.07,.18),0),pebbleMat);m.position.set(edge,.06,z);m.scale.y=rand(.35,.75);forestGround.add(m)}

// Visual Remaster #1 — Forest. Decorative layer is separate from gameplay/collisions.
const forestVisual=new THREE.Group();scene.add(forestVisual);forestVisual.visible=true;
function makeGrassTexture(palette=['#b8df83','#a9d476','#c9e795','#dbefa9']){const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');x.clearRect(0,0,16,16);const cols=palette;for(let i=0;i<18;i++){x.fillStyle=cols[i%cols.length];const bx=1+(i*7)%14,w=i%4===0?2:1,top=2+(i*5)%8;x.fillRect(bx,top,w,15-top);if(i%3===0)x.fillRect(Math.max(0,bx-1),top+3,3,2)}const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t}
function crossedGrassGeometry(){const g=new THREE.BufferGeometry(),p=[],uv=[],idx=[];for(const a of [0,Math.PI/2]){const n=p.length/3,dx=Math.cos(a)*.24,dz=Math.sin(a)*.24;p.push(-dx,0,-dz,dx,0,dz,dx,.58,dz,-dx,.58,-dz);uv.push(0,0,1,0,1,1,0,1);idx.push(n,n+1,n+2,n,n+2,n+3)}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}
const grassBladeGeo=crossedGrassGeometry(),grassBladeMat=new THREE.MeshStandardMaterial({map:makeGrassTexture(),color:0xffffff,roughness:1,transparent:true,alphaTest:.32,side:THREE.DoubleSide,depthWrite:true});
function grassClumpTransform(dummy,x,z,height=1,spread=1){dummy.position.set(x,.015,z);dummy.rotation.set(rand(-.05,.05),rand(0,6.28),rand(-.06,.06));dummy.scale.set(rand(.72,1.18)*spread,rand(.72,1.32)*height,rand(.72,1.18)*spread);dummy.updateMatrix()}
const grassCount=mobile?650:2400,grassBlades=new THREE.InstancedMesh(grassBladeGeo,grassBladeMat,grassCount),grassDummy=new THREE.Object3D();
for(let i=0;i<grassCount;i++){const patch=i%5,px=((i*17)%23-11)*3.45,pz=((i*29)%23-11)*3.45;let x=px+rand(-2.7,2.7),z=pz+rand(-2.7,2.7);if(patch===0){x=rand(-43,43);z=rand(-43,43)}if(Math.abs(x)<3.2){x+=(x<0?-1:1)*rand(3.5,8)}
 grassClumpTransform(grassDummy,x,z,rand(.72,1.25),rand(.75,1.28));grassBlades.setMatrixAt(i,grassDummy.matrix);grassBlades.setColorAt(i,new THREE.Color().setHSL(.20+(i%5)*.012,.48,.25+(i%7)*.025))}
grassBlades.instanceMatrix.needsUpdate=true;grassBlades.instanceColor.needsUpdate=true;grassBlades.receiveShadow=!mobile;forestVisual.add(grassBlades);
// v179: one evenly seeded grass layer reused across all six locations.
const meadowGrassRoot=new THREE.Group();scene.add(meadowGrassRoot);
const meadowGrassGeo=grassBladeGeo.clone(),meadowGrassMat=grassBladeMat.clone();
const summerGrassTexture=meadowGrassMat.map,autumnGrassTexture=makeGrassTexture(['#d8bc89','#cdb07b','#e7cd9c','#efdab2']);
const meadowGrassCount=grassCount,meadowGrass=new THREE.InstancedMesh(meadowGrassGeo,meadowGrassMat,meadowGrassCount),meadowDummy=new THREE.Object3D(),meadowSeeds=[];
let meadowActiveCount=0,meadowGrassFraction=1;
visualOnly(()=>{const side=Math.ceil(Math.sqrt(meadowGrassCount)),cells=side*side,spacing=86/side;
 for(let i=0;i<meadowGrassCount;i++){const cell=(i*743)%cells,x=-43+((cell%side)+rand(.18,.82))*spacing,z=-43+(Math.floor(cell/side)+rand(.18,.82))*spacing;
  grassClumpTransform(meadowDummy,x,z,rand(.72,1.25),rand(.75,1.28));meadowSeeds.push(meadowDummy.matrix.clone());
 }
});
meadowGrass.receiveShadow=!mobile;meadowGrassRoot.add(meadowGrass);
function syncMeadowGrass(){
 const houses=level===3?houseObjects.filter(h=>h.visible).map(h=>new THREE.Box3().setFromObject(h)):[];
 const matrix=new THREE.Matrix4(),tint=new THREE.Color();meadowActiveCount=0;
 for(let i=0;i<meadowSeeds.length;i++){matrix.copy(meadowSeeds[i]);const x=matrix.elements[12],z=matrix.elements[14];
  if(Math.abs(x)<roadHalfWidthAt(z)+.4)continue;
  if(level===2&&(lakeDepth(x,z)>0||lakeInletDepthAt(x,z)>0))continue;
  if(level===4&&(riverDepthAt(x,z)>0||onRiverBridge(x,z)))continue;
  if(houses.some(b=>x>b.min.x-.25&&x<b.max.x+.25&&z>b.min.z-.25&&z<b.max.z+.25))continue;
  if(rockPositions.some(q=>q[3]?.visible&&rockFootprintHit(q[3],x,z,.2,false)))continue;
  if(level===5&&mountainBlockedAt(x,z,.2))continue;
  if(level===6&&lairObstacles.some(([lx,lz,r,g])=>g.visible&&Math.hypot(x-lx,z-lz)<r+.2))continue;
  matrix.elements[13]=.015+terrainHeightAt(x,z);meadowGrass.setMatrixAt(meadowActiveCount,matrix);
  tint.setHSL(currentSeason==='autumn'?.10:.23+(i%5)*.009,.28,.80+(i%5)*.018);meadowGrass.setColorAt(meadowActiveCount,tint);meadowActiveCount++;
 }
 meadowGrassMat.map=currentSeason==='autumn'?autumnGrassTexture:summerGrassTexture;
 meadowGrass.instanceMatrix.needsUpdate=true;if(meadowGrass.instanceColor)meadowGrass.instanceColor.needsUpdate=true;
 meadowGrass.count=meadowActiveCount;meadowGrass.computeBoundingSphere();meadowGrass.count=Math.floor(meadowActiveCount*meadowGrassFraction);
 meadowGrassRoot.visible=currentSeason!=='winter';grassBlades.count=0;
 if(window.__KABANCHIKI_TEST__.graphics)window.__KABANCHIKI_TEST__.graphics.grass=meadowGrass.count;
}

let graphicsParticleFactor=1,graphicsCloudFactor=1;
const adaptiveGraphics=new AdaptiveQuality({initial:mobile?1:3,max:mobile?2:3,onChange:applyGraphicsQuality});
function applyGraphicsQuality(tier){
 const preset=GRAPHICS_TIERS[tier],shadows=!mobile;
 renderer.setPixelRatio(Math.min(devicePixelRatio,preset.pixelRatio));renderer.setSize(innerWidth,innerHeight);
 renderer.shadowMap.enabled=shadows;sun.castShadow=shadows;
 if(sun.shadow.mapSize.x!==preset.shadowSize){
  sun.shadow.map?.dispose();sun.shadow.map=null;
  sun.shadow.mapPass?.dispose();sun.shadow.mapPass=null;
  sun.shadow.mapSize.set(preset.shadowSize,preset.shadowSize);
 }
 sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;
 grassBlades.count=0;meadowGrassFraction=preset.grass;meadowGrass.count=Math.floor(meadowActiveCount*meadowGrassFraction);
 graphicsParticleFactor=preset.particles;graphicsCloudFactor=preset.clouds;
 const label=$('graphicsQuality');if(label)label.textContent='Графика: Авто · '+preset.name;
 window.__KABANCHIKI_TEST__.graphics={auto:true,tier,name:preset.name,pixelRatio:renderer.getPixelRatio(),shadows,grass:meadowGrass.count,particles:graphicsParticleFactor};
}
applyGraphicsQuality(adaptiveGraphics.tier);
document.addEventListener('visibilitychange',()=>adaptiveGraphics.resetSample());
if(__autoTest)window.__KABANCHIKI_ADAPTIVE__={controller:adaptiveGraphics,apply:applyGraphicsQuality,tiers:GRAPHICS_TIERS};
const flowerMats=[0xffe26b,0xf7f0ff,0x89c9ff,0xff9ab2].map(c=>new THREE.MeshBasicMaterial({color:c}));
for(let i=0;i<(mobile?24:46);i++){let x=rand(-40,40),z=rand(-40,40);if(Math.abs(x)<3.5)continue;const g=new THREE.Group();g.position.set(x,0,z);
 block(g,grassBladeMat,0,.18,0,.05,.36,.05);sphere(g,flowerMats[i%flowerMats.length],0,.43,0,.11);g.userData.seasonPlant=true;forestVisual.add(g)}
const fernMat=new THREE.MeshLambertMaterial({color:0x397b3d});
for(let i=0;i<(mobile?22:44);i++){const g=new THREE.Group();g.position.set(rand(-40,40),.02,rand(-40,40));if(Math.abs(g.position.x)<roadHalfWidthAt(g.position.z)+.9)continue;for(let j=0;j<4;j++){const b=block(g,fernMat,0,.18,0,.08,.35,.55);b.rotation.y=j*Math.PI/2;b.rotation.z=.55}g.userData.seasonPlant=true;forestVisual.add(g)}
const logObstacles=[];for(let i=0;i<9;i++){const g=new THREE.Group();g.position.set(rand(-38,38),.13,rand(-38,34));const len=rand(1.35,2.25),r=rand(.11,.16),yaw=rand(0,6.28),log=new THREE.Mesh(new THREE.CylinderGeometry(r*.78,r,1,7),mats.wood);log.scale.y=len;log.rotation.z=Math.PI/2;log.rotation.y=yaw;log.userData.naturalLog=true;log.castShadow=!mobile;log.receiveShadow=!mobile;g.add(log);forestVisual.add(g);logObstacles.push({g,mesh:log,x:g.position.x,z:g.position.z,len,r,yaw,top:g.position.y+r})}
const sunHalo=visualOnly(()=>new THREE.Sprite(new THREE.SpriteMaterial({map:softGlowTexture,color:0xffb653,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false})));sunHalo.position.set(-28,24,-42);sunHalo.scale.set(19,19,1);scene.add(sunHalo);
const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(2.3,16,12),new THREE.MeshBasicMaterial({color:0xfff2b0}));sunDisc.position.copy(sun.position);sunDisc.renderOrder=2;scene.add(sunDisc);
const treePositions=[],treeObjects=[],treeSolidMeshes=[],treeBranchMeshes=[];
function syncWorldShadowCasters(){if(mobile)return;scene.traverse(o=>{if(!o.isMesh)return;if(o===skyDome||o===sunDisc)return;const transparent=o.material?.transparent&&o.material?.opacity<.20;if(!transparent){o.castShadow=true;o.receiveShadow=true}});ground.castShadow=false;ground.receiveShadow=true;grassBlades.castShadow=false;meadowGrass.castShadow=false;sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true}

// v104: slimmer branches match the trunk/crown scale and also provide exact apple anchor geometry.
const trunkGeo=new THREE.CylinderGeometry(.46,.68,1,7),branchGeo=new THREE.CylinderGeometry(.09,.14,1,6),crownGeo=new THREE.BoxGeometry(1.65,1.55,1.65);
for(let i=0;i<160;i++){
 let x=rand(-45,45),z=rand(-45,45);if(Math.abs(x)<4||Math.hypot(x,z)<8)continue;
 const g=group(x,z),h=rand(2.4,5.7),tr=rand(.72,1.08);
 const trunk=new THREE.Mesh(trunkGeo,mats.wood);trunk.position.y=h/2;trunk.scale.set(tr,h,tr);trunk.castShadow=!mobile;trunk.receiveShadow=!mobile;g.add(trunk);
 for(let r=0;r<3;r++){const root=block(g,mats.wood,Math.cos(r*2.094)*.38,.18,Math.sin(r*2.094)*.38,.22,.22,rand(.65,1.0));root.rotation.y=-r*2.094;root.rotation.z=.15}
 g.children.filter(o=>o.isMesh&&o.geometry===trunkGeo).forEach(o=>{o.userData.treeSolid=true;treeSolidMeshes.push(o)});const branchN=Math.floor(rand(2,5));for(let b=0;b<branchN;b++){const br=new THREE.Mesh(branchGeo,mats.wood);br.userData.appleBranch=true;treeBranchMeshes.push(br);const a=rand(0,6.28),len=rand(.68,1.08);br.position.set(Math.cos(a)*.30,h*.66+rand(-.10,.24),Math.sin(a)*.30);br.scale.set(tr*.38,len,tr*.38);br.rotation.z=rand(.78,1.08);br.rotation.y=a;br.castShadow=!mobile;br.receiveShadow=!mobile;g.add(br)}
 const crownN=Math.floor(rand(5,9));for(let c=0;c<crownN;c++){const cm=new THREE.Mesh(crownGeo,c%3?mats.leaf:mats.leaf2);const a=rand(0,6.28),rr=c===0?0:rand(.35,1.25);cm.position.set(Math.cos(a)*rr,h+rand(-.05,1.45),Math.sin(a)*rr);const sc=rand(.85,1.5);cm.scale.set(sc*1.15,sc,sc*1.15);cm.userData.springCrown=true;cm.userData.fullCrownScale=cm.scale.clone();g.add(cm)}
 g.rotation.y=rand(0,Math.PI*2);g.userData.isTree=true;
 g.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();o.material.transparent=true}});
 if(!mobile&&treeObjects.length<58)g.traverse(o=>{if(o.isMesh)o.castShadow=true});
 treePositions.push([x,z]);treeObjects.push(g)
}const rockPositions=[];const rockGeo=new THREE.DodecahedronGeometry(1,0);for(let i=0;i<50;i++){let x=rand(-43,43),z=rand(-43,43);const sx=rand(.35,1.15),sz=rand(.4,1.25),roadR=Math.max(sx,sz)*.92;if(!roadClearForRadius(x,z,roadR,.24)||Math.hypot(x,z-4)<7||treePositions.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<2.2))continue;const m=new THREE.Mesh(rockGeo,mats.stone);m.position.set(x,rand(.18,.45),z);m.scale.set(sx,rand(.3,.8),sz);m.rotation.set(rand(-.3,.3),rand(0,6.28),rand(-.2,.2));scene.add(m);rockPositions.push([x,z,Math.max(.55,Math.min(1.15,Math.max(sx,sz)*.8)),m])}
// Мягкие облака высоко в небе: заметны, но не мешают игре.
const weatherClouds=[];for(let i=0;i<(mobile?14:22);i++){const cm=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.68}),cg=new THREE.Group();cg.position.set(rand(-52,52),rand(16,23),rand(-52,26));cg.userData.cloudMat=cm;cg.userData.drift=rand(.75,1.28);for(let j=0;j<4;j++){const c=new THREE.Mesh(new THREE.SphereGeometry(rand(1.5,2.7),8,6),cm);c.position.set(j*1.6+rand(-.5,.5),rand(-.25,.35),rand(-.5,.5));c.scale.y=.55;cg.add(c)}scene.add(cg);weatherClouds.push(cg)}
// Естественная плотная граница мира: не ровный забор из гор, а случайные "куски" леса, валунов и скал.
// Объекты идут короткими сериями (например 2–4 дерева, затем несколько камней, затем гора),
// стоят достаточно близко, чтобы визуально было ясно: дальше дороги нет. Физический предел карты остаётся отдельным.
const ridgeMat=new THREE.MeshLambertMaterial({color:0x6f7778,map:pixelTexture(30,[111,119,120],[67,73,75],'stone'),transparent:true,opacity:1});
const ridgeObjects=[],boundaryDecor=[];
function boundaryTree(x,z){const g=group(x,z),h=rand(3.0,5.5),tr=rand(.42,.68);block(g,mats.wood,0,h/2,0,tr,h,tr);const layers=Math.random()<.45?2:3;for(let j=0;j<layers;j++)block(g,j%2?mats.leaf:mats.leaf2,rand(-.16,.16),h+j*.56,rand(-.16,.16),rand(2.35,2.9)-j*.38,rand(.9,1.18),rand(2.2,2.75)-j*.34);g.rotation.y=rand(0,Math.PI*2);g.userData.isTree=true;g.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();o.material.transparent=true}});treeObjects.push(g);boundaryDecor.push(g)}
function boundaryRock(x,z){const m=new THREE.Mesh(rockGeo,mats.stone);m.position.set(x,rand(.45,.75),z);m.scale.set(rand(1.25,2.05),rand(.75,1.45),rand(1.2,2.0));m.rotation.set(rand(-.2,.2),rand(0,6.28),rand(-.18,.18));scene.add(m);boundaryDecor.push(m)}
function boundaryMountain(x,z){const h=rand(4.2,7.3),r=new THREE.Mesh(new THREE.ConeGeometry(rand(2.25,2.9),h,5),ridgeMat.clone());const sy=rand(.88,1.28);r.position.set(x,h*sy/2-.42,z);r.scale.set(rand(.85,1.28),sy,rand(.85,1.28));r.rotation.y=rand(0,6.28);r.userData.isRidge=true;scene.add(r);ridgeObjects.push(r);boundaryDecor.push(r)}
function buildBoundarySide(side){/* v35: две смещённые плотные линии декора без больших визуальных дыр */for(let row=0;row<2;row++){let kind=Math.floor(rand(0,3)),run=0;const step=row?1.55:1.72,base=46.4+row*1.55;for(let along=-48;along<=48;along+=step){if(run<=0){const old=kind;kind=Math.floor(rand(0,3));if(kind===old&&Math.random()<.6)kind=(kind+1+Math.floor(rand(0,2)))%3;run=kind===0?Math.floor(rand(2,5)):Math.floor(rand(1,4))}run--;const edge=base+rand(-.22,.22),a=along+(row?step*.48:0)+rand(-.25,.25);let x,z;if(side===0){x=a;z=-edge}else if(side===1){x=a;z=edge}else if(side===2){x=-edge;z=a}else{x=edge;z=a}if(kind===0)boundaryTree(x,z);else if(kind===1)boundaryRock(x,z);else boundaryMountain(x,z)}}}
for(let side=0;side<4;side++)buildBoundarySide(side);
const houseObjects=[];
const darkWindow=new THREE.MeshLambertMaterial({color:0x27323a,map:pixelTexture(31,[39,50,58],[17,24,30],'stone')});
const wallCream=new THREE.MeshLambertMaterial({color:0xd7b77d,map:mats.wood.map});
const wallBrick=new THREE.MeshLambertMaterial({color:0xa85e45,map:mats.wood.map});
const wallPale=new THREE.MeshLambertMaterial({color:0xc7c09d,map:mats.wood.map});
function villageHouse(x,z,type=0,rot=0){
 const g=group(x,z);g.rotation.y=rot;
 const wall=[mats.wood,wallCream,wallBrick,wallPale][type%4];
 if(type===0){
   block(g,wall,0,1.45,0,5.4,2.9,4.4);block(g,mats.roof,0,3.15,0,6.1,.65,5.1);
   block(g,darkWindow,-1.55,1.55,2.22,.85,.85,.10);block(g,darkWindow,1.55,1.55,2.22,.85,.85,.10);
   block(g,mats.black,0,.9,2.25,.85,1.8,.12);
 }else if(type===1){
   block(g,wall,0,1.75,0,4.5,3.5,5.8);block(g,mats.roof,0,3.75,0,5.2,.72,6.5);
   block(g,wall,-1.35,3.85,0,1.45,1.35,2.1);block(g,mats.roof,-1.35,4.7,0,1.8,.42,2.45);
   block(g,darkWindow,1.2,1.8,2.92,.82,.92,.10);block(g,darkWindow,-1.2,1.8,2.92,.82,.92,.10);
   block(g,mats.black,0,.95,2.95,.82,1.9,.12);
 }else if(type===2){
   block(g,wall,-1.35,1.35,0,4.1,2.7,4.2);block(g,wall,1.45,1.1,-1.0,2.4,2.2,2.4);
   block(g,mats.roof,-1.35,2.95,0,4.8,.58,4.9);block(g,mats.roof,1.45,2.55,-1,2.9,.48,2.9);
   block(g,darkWindow,-1.55,1.45,2.12,.78,.78,.10);block(g,mats.black,.15,.82,2.14,.78,1.65,.12);
 }else{
   block(g,wall,0,1.25,0,6.5,2.5,3.5);block(g,mats.roof,0,2.78,0,7.2,.55,4.2);
   block(g,darkWindow,-2,1.35,1.77,.8,.78,.10);block(g,darkWindow,0,1.35,1.77,.8,.78,.10);block(g,darkWindow,2,1.35,1.77,.8,.78,.10);
   block(g,mats.black,2.7,.78,1.8,.72,1.55,.12);
 }
 g.visible=false;g.userData.enterable=false;houseObjects.push(g);return g
}
villageHouse(-27,-27,0,.08);villageHouse(-12,-29,1,-.08);
// v131: family hideout uses separate geometry; never fade/hide the whole building.
const familyHideout=group(30,-31);familyHideout.userData.enterable=true;familyHideout.userData.familyHideout=true;familyHideout.visible=false;houseObjects.push(familyHideout);
const dadWallMat=wallCream.clone(),dadRoofMat=mats.roof.clone(),dadFloorMat=mats.wood.clone();
const dadFrontL=block(familyHideout,dadWallMat,-1.9,1.5,2.18,1.6,3,.22),dadFrontR=block(familyHideout,dadWallMat,1.9,1.5,2.18,1.6,3,.22);
const dadBack=block(familyHideout,dadWallMat,0,1.5,-2.18,5.4,3,.22),dadLeft=block(familyHideout,dadWallMat,-2.6,1.5,0,.22,3,4.2),dadRight=block(familyHideout,dadWallMat,2.6,1.5,0,.22,3,4.2);
const dadRoof=block(familyHideout,dadRoofMat,0,3.25,0,5.9,.62,4.9),dadFloor=block(familyHideout,dadFloorMat,0,.08,0,5.15,.16,4.15);
for(const q of [dadFrontL,dadFrontR])q.userData.dadSide='front';dadBack.userData.dadSide='back';dadLeft.userData.dadSide='left';dadRight.userData.dadSide='right';dadRoof.userData.dadRoof=true;dadFloor.userData.dadInterior=true;
familyHideout.userData.cutawayWalls={front:[dadFrontL,dadFrontR],back:[dadBack],left:[dadLeft],right:[dadRight],roof:dadRoof};
villageHouse(20,-23,3,-.10);
const hideDoor=new THREE.Group();familyHideout.add(hideDoor);
// v132: the family-house door is closed in the doorway.
// The glowing window sits just outside the front wall face, so the wall cannot depth-occlude it.
// Its dark frame remains readable while the glass itself becomes transparent from inside.
const windowGlowMat=new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide});
const familyWindow=block(hideDoor,windowGlowMat,-1.55,1.55,2.315,.72,.76,.045);familyWindow.userData.familyWindow=true;familyWindow.renderOrder=3;
const windowFrameMat=new THREE.MeshLambertMaterial({color:0x4b2b1d});
for(const [x,y,w,h] of [[-1.55,1.98,.96,.10],[-1.55,1.12,.96,.10],[-2.03,1.55,.10,.96],[-1.07,1.55,.10,.96]]){const fr=block(hideDoor,windowFrameMat,x,y,2.325,w,h,.07);fr.userData.familyWindowFrame=true}
const doorMat=new THREE.MeshLambertMaterial({color:0x75462f});
const familyDoorHinge=new THREE.Group();familyDoorHinge.position.set(-1.1,.16,2.30);hideDoor.add(familyDoorHinge);const familyDoor=block(familyDoorHinge,doorMat,1.1,1.125,0,2.2,2.25,.12);familyDoor.rotation.y=0;familyDoor.userData.familyDoor=true;familyDoor.userData.closed=true;
const familyDoorSlab=familyDoor;const doorTrimMat=new THREE.MeshLambertMaterial({color:0x4b2b1d});for(const [x,y,w,h] of [[-1.12,1.285,.12,2.25],[1.12,1.285,.12,2.25],[0,2.47,2.36,.12]]){const trim=block(hideDoor,doorTrimMat,x,y,2.315,w,h,.10);trim.userData.familyDoorFrame=true}
const doorLintel=block(familyHideout,dadWallMat,0,2.76,2.18,2.2,.48,.22);doorLintel.userData.doorLintel=true;familyHideout.userData.cutawayWalls.front.push(doorLintel);
const doorKnob=sphere(familyDoor,new THREE.MeshBasicMaterial({color:0xffd56a}),.36,.03,.075,.07);doorKnob.userData.familyDoor=true;
const porchGlowMat=new THREE.MeshBasicMaterial({color:0xffe29a});const porchLamp=sphere(hideDoor,porchGlowMat,0,2.70,2.35,.12);porchLamp.userData.familyWindow=true;
const hideDoorGlow=new THREE.PointLight(0xffc45c,14,20,1.35);hideDoorGlow.position.set(0,2.15,1.7);familyHideout.add(hideDoorGlow);hideDoorGlow.visible=false;
const dadInteriorGlow=new THREE.PointLight(0xffd58a,7,11,1.45);dadInteriorGlow.position.set(0,1.7,-.35);familyHideout.add(dadInteriorGlow);dadInteriorGlow.visible=false;
const houseFurnishings=new THREE.Group();familyHideout.add(houseFurnishings);
function furniture(name,x,z){const g=new THREE.Group();g.position.set(x,.16,z);g.userData.furniture=name;houseFurnishings.add(g);return g}
const insideTable=furniture('table',-1.72,.35);block(insideTable,mats.wood,0,.68,0,1.0,.13,.8);for(const x of [-.4,.4])for(const z of [-.3,.3])block(insideTable,mats.wood,x,.32,z,.10,.64,.10);
const insideChair=furniture('chair',-1.72,1.23);block(insideChair,mats.wood,0,.42,0,.52,.10,.52);block(insideChair,mats.wood,0,.75,.22,.52,.62,.10);for(const x of [-.2,.2])for(const z of [-.2,.2])block(insideChair,mats.wood,x,.2,z,.09,.4,.09);
const insideBed=furniture('bed',1.76,-.82);block(insideBed,mats.wood,0,.22,0,1.05,.25,1.85);block(insideBed,mats.white,0,.42,0,.98,.18,1.76);block(insideBed,mats.shirt,0,.55,.27,1.0,.12,1.18);block(insideBed,mats.white,0,.56,-.63,.76,.15,.39);block(insideBed,mats.wood,0,.61,-.95,1.12,.8,.12);
const insideFireplace=furniture('fireplace',-1.68,-1.47);block(insideFireplace,mats.stone,0,.13,0,1.08,.25,.62);for(const x of [-.45,.45])block(insideFireplace,mats.stone,x,.56,0,.22,.88,.55);block(insideFireplace,mats.stone,0,1.01,0,1.15,.2,.65);block(insideFireplace,mats.black,0,.51,-.18,.67,.66,.10);block(insideFireplace,mats.wood,0,.28,.05,.61,.13,.16);
const hearthFlame=new THREE.Mesh(new THREE.ConeGeometry(.21,.55,7),new THREE.MeshBasicMaterial({color:0xffa43c,transparent:true,opacity:.85}));hearthFlame.position.set(0,.58,.05);insideFireplace.add(hearthFlame);const hearthLight=new THREE.PointLight(0xff9d3c,2.5,5);hearthLight.position.copy(hearthFlame.position);insideFireplace.add(hearthLight);
let insideFamilyHouse=false;
villageHouse(-29,-7,2,Math.PI/2+.06);villageHouse(28,1,1,-Math.PI/2-.04);villageHouse(-25,19,3,.10);villageHouse(-13,25,0,-.05);villageHouse(25,23,2,.08)
const biomeObjects=[],mountainObstacles=[],lairObstacles=[];function biomeMesh(obj,lv){obj.visible=false;obj.userData.biomeLevel=lv;biomeObjects.push(obj);return obj}
function horizontalBounds(obj){
  obj.updateWorldMatrix(true,true);
  const b=new THREE.Box3().setFromObject(obj),c=new THREE.Vector3();b.getCenter(c);
  return {x:c.x,z:c.z,r:Math.max((b.max.x-b.min.x)/2,(b.max.z-b.min.z)/2)};
}
function syncWorldGeneration(lv){
 for(const o of boundaryDecor)if(!o.userData.isTree)o.visible=true;
 for(const o of scene.children)if(o.isMesh&&o.material?.map===mats.leaf2.map&&o.scale.y<.07)o.visible=!(lv===2&&lakeRadiusAt(o.position.x,o.position.z)<14.2);
  const active=biomeObjects.filter(o=>o.userData.biomeLevel===lv&&o!==riverVisual&&o!==lake);
  const zones=active.map(horizontalBounds);
  if(lv===3)for(const h of houseObjects)zones.push(horizontalBounds(h));
  const baseTreeVisible=i=>(lv===1||(lv===2&&i%3!==0)||(lv===3&&i%6===0)||(lv===4&&i%2===0)||(lv===5&&i%4===0)||(lv===6&&i%7===0));
  treeObjects.forEach((t,i)=>{
    if(!baseTreeVisible(i)){t.visible=false;return}
    const x=t.position.x,z=t.position.z;
    t.visible=!(lv===2&&(lakeRadiusAt(x,z)<15.3||lakeInletDepthAt(x,z)>.001))&&!(lv===4&&Math.abs(z-riverCenterAt(x))<6.5)&&!zones.some(q=>Math.hypot(x-q.x,z-q.z)<q.r+1.35);
  });
  for(const rp of rockPositions){
    const [x,z,r,m]=rp;if(!m)continue;if(m.userData.biomeLevel){m.visible=m.userData.biomeLevel===lv;continue}
    m.visible=!(lv===2&&(lakeRadiusAt(x,z)<15.0||lakeInletDepthAt(x,z)>.001))&&!(lv===4&&Math.abs(z-riverCenterAt(x))<5.5)&&!zones.some(q=>Math.hypot(x-q.x,z-q.z)<q.r+r+.45);
  }
}
// v35: каждая локация получает собственные заметные объекты, а не только другой цвет неба.
const waterMat=new THREE.MeshPhongMaterial({color:0x3f9dcc,map:pixelTexture(32,[67,157,204],[31,105,160],'noise'),transparent:true,opacity:.78,shininess:95,specular:0xccefff});
const lake=new THREE.Mesh(new THREE.CylinderGeometry(13,14,.18,48),waterMat);lake.position.set(-18,.015,-17);scene.add(lake);biomeMesh(lake,2);
// v71: отдельный дешёвый визуальный слой озера — волны, берег, кувшинки и солнечный блик.
const lakeVisual=new THREE.Group();scene.add(lakeVisual);lakeVisual.visible=false;
const shoreMat=new THREE.MeshLambertMaterial({color:0xb9aa78,map:pixelTexture(32,[185,170,120],[133,122,84],'noise')});
const shoreRing=new THREE.Mesh(new THREE.RingGeometry(13.25,15.45,56),shoreMat);shoreRing.rotation.x=-Math.PI/2;shoreRing.position.set(-18,.035,-17);lakeVisual.add(shoreRing);
const waterRippleMatA=new THREE.MeshPhongMaterial({color:0x7fd4ed,transparent:true,opacity:.20,shininess:120,specular:0xffffff,depthWrite:false});
const waterRippleMatB=new THREE.MeshPhongMaterial({color:0x2f86bd,transparent:true,opacity:.16,shininess:85,specular:0xd8f6ff,depthWrite:false});
const rippleA=new THREE.Mesh(new THREE.CircleGeometry(12.72,48),waterRippleMatA);rippleA.rotation.x=-Math.PI/2;rippleA.position.set(-18,.145,-17);lakeVisual.add(rippleA);
const rippleB=new THREE.Mesh(new THREE.RingGeometry(5.5,12.35,48),waterRippleMatB);rippleB.rotation.x=-Math.PI/2;rippleB.position.set(-18,.16,-17);lakeVisual.add(rippleB);
// v133: stronger depth gradient: the lake gets visibly darker and deeper toward the center.
const lakeDeepMat=new THREE.MeshBasicMaterial({color:0x155c91,transparent:true,opacity:.42,depthWrite:false});
const lakeDeepCenter=new THREE.Mesh(new THREE.CircleGeometry(7.4,48),lakeDeepMat);lakeDeepCenter.rotation.x=-Math.PI/2;lakeDeepCenter.position.set(-18,.126,-17);lakeVisual.add(lakeDeepCenter);lakeDeepCenter.userData.depthMeters=4.5;
const lakeAbyssMat=new THREE.MeshBasicMaterial({color:0x083b69,transparent:true,opacity:.48,depthWrite:false});
const lakeAbyss=new THREE.Mesh(new THREE.CircleGeometry(3.9,40),lakeAbyssMat);lakeAbyss.rotation.x=-Math.PI/2;lakeAbyss.position.set(-18,.124,-17);lakeVisual.add(lakeAbyss);lakeAbyss.userData.depthMeters=6.0;
// v134: physical lake depth. Characters descend below the water surface toward the centre.
function lakeDepthAt(x,z){if(currentSeason==='winter')return 0;if(level===4)return riverDepthAt(x,z);if(level!==2)return 0;return Math.max(lakeDepth(x,z),lakeInletDepthAt(x,z))}
function inLake(x,z,margin=0){return level===2&&lakeRadiusAt(x,z)<13.6+margin}
// v138 weather escalation: cloud buildup, wind-driven cloud drift, whole-sky lightning and destructive strikes.
const weatherGroup=new THREE.Group();scene.add(weatherGroup);weatherGroup.visible=false;
const rainCount=mobile?360:720,rainPos=new Float32Array(rainCount*3);for(let i=0;i<rainCount;i++){rainPos[i*3]=rand(-24,24);rainPos[i*3+1]=rand(1,24);rainPos[i*3+2]=rand(-24,24)}
const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));const rainMat=new THREE.PointsMaterial({color:0xb9dcff,size:.075,transparent:true,opacity:.68,depthWrite:false});const rainPoints=new THREE.Points(rainGeo,rainMat);weatherGroup.add(rainPoints);
const stormLeaves=[];const stormLeafMat=new THREE.MeshBasicMaterial({color:0x6f8f35,side:THREE.DoubleSide,transparent:true,opacity:.86});
const stormBurning=new Map(),stormRemains=[],stormTouched=new Set(),lightningBolts=[];let worldEpoch=0;const lightningSky=new THREE.HemisphereLight(0xf2fbff,0xb8d5ff,0);scene.add(lightningSky);const lightningSun=new THREE.DirectionalLight(0xeaf6ff,0);lightningSun.position.set(8,24,6);scene.add(lightningSun);
let weatherStage=0,underwaterTime=0,underwaterDamageCd=0,hurricaneCarry=0,leafSpawnCd=0,nextLightningAt=0,lightningFlash=0,weatherBaseSky=null;

function windVector(now){const gust=Math.sin(now*.00083)*.28+Math.sin(now*.00191+1.7)*.16;const a=gust;return {x:Math.sin(a),z:Math.cos(a),power:weatherStage>=4?1.0:weatherStage===3?.62:weatherStage===2?.34:0}}
function spawnStormLeaf(now){if(stormLeaves.length>(mobile?34:70))return;const candidates=treeObjects.filter(t=>t.visible!==false&&Math.hypot(t.position.x-boy.position.x,t.position.z-boy.position.z)<28);if(!candidates.length)return;const t=candidates[Math.floor(Math.random()*candidates.length)],m=new THREE.Mesh(new THREE.PlaneGeometry(.18,.10),stormLeafMat.clone());m.position.set(t.position.x+rand(-1.4,1.4),rand(2.2,5.8),t.position.z+rand(-1.4,1.4));m.rotation.set(rand(0,6.28),rand(0,6.28),rand(0,6.28));scene.add(m);stormLeaves.push({g:m,t:rand(1.8,4.2),spin:rand(-7,7)})}
function charredCylinder(parent,x,y,z,r,h,tilt=0){const m=new THREE.Mesh(new THREE.CylinderGeometry(r*.72,r,h,7),new THREE.MeshLambertMaterial({color:0x241b18,roughness:1}));m.position.set(x,y,z);m.rotation.z=tilt;m.rotation.y=rand(0,6.28);parent.add(m);return m}
function makeCharredTreeRemains(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);charredCylinder(g,0,.48*scale,0,.42*scale,.96*scale,rand(-.05,.05));charredCylinder(g,-.32*scale,.25*scale,.05,.16*scale,.72*scale,-1.05);charredCylinder(g,.30*scale,.22*scale,-.08,.14*scale,.62*scale,1.12);const ash=new THREE.Mesh(new THREE.RingGeometry(.34*scale,.78*scale,11),new THREE.MeshBasicMaterial({color:0x171313,transparent:true,opacity:.72,side:THREE.DoubleSide}));ash.rotation.x=-Math.PI/2;ash.position.y=.012;g.add(ash);scene.add(g);g.userData.charredStump=true;charredStumps.push(g);stormRemains.push(g);return g}
function makeCharredHouseRemains(h){const g=new THREE.Group();g.position.copy(h.position);g.rotation.y=h.rotation.y;for(const [x,z,tilt] of [[-2,-1.55,.10],[2,-1.55,-.08],[-2,1.55,-.12],[2,1.55,.09]])charredCylinder(g,x,.72,z,.17,1.45,tilt);charredCylinder(g,-.8,.30,-.25,.13,2.6,Math.PI/2+rand(-.15,.15));charredCylinder(g,.9,.24,.55,.12,2.2,Math.PI/2+rand(-.2,.2));const ash=new THREE.Mesh(new THREE.CircleGeometry(2.65,14),new THREE.MeshBasicMaterial({color:0x201817,transparent:true,opacity:.66,side:THREE.DoubleSide}));ash.rotation.x=-Math.PI/2;ash.position.y=.018;ash.scale.z=.78;g.add(ash);scene.add(g);stormRemains.push(g);return g}
function rememberStormObject(obj){if(!obj||obj.userData.stormSnapshot)return;const materials=[];obj.traverse(o=>{if(o.isMesh&&o.material)materials.push([o,o.material])});obj.userData.stormSnapshot={visible:obj.visible,materials};stormTouched.add(obj)}
function restoreStormObject(obj){const snap=obj?.userData?.stormSnapshot;if(!snap)return;for(const [mesh,mat] of snap.materials)mesh.material=mat;obj.visible=snap.visible;delete obj.userData.stormSnapshot;delete obj.userData.stormBurnEpoch;delete obj.userData.stormBlackened;stormTouched.delete(obj)}
function resetStormLocationState(){for(const bolt of [...lightningBolts])removeLightningBolt(bolt);for(const [obj,b] of [...stormBurning]){obj.remove(b.light);obj.remove(b.flames)}stormBurning.clear();for(const obj of [...stormTouched])restoreStormObject(obj);for(const r of stormRemains)scene.remove(r);stormRemains.length=0;for(const st of [...charredStumps])scene.remove(st);charredStumps.length=0;lightningFlash=0;lightningSky.intensity=0;lightningSun.intensity=0;nextLightningAt=0}
function tagStormTargetsForCurrentLocation(){for(const t of treeObjects)if(t.visible!==false)t.userData.stormLocationId=worldEpoch;for(const h of houseObjects)if(h.visible!==false)h.userData.stormLocationId=worldEpoch;for(const l of logObstacles)if(l.g?.visible!==false&&forestVisual.visible)l.g.userData.stormLocationId=worldEpoch;for(const rock of stormRockTargets())if(rock.visible!==false)rock.userData.stormLocationId=worldEpoch}
function createLivingFire(obj,kind){const g=new THREE.Group();obj.add(g);const wide=kind==='house'?2:kind==='log'?.6:.95;for(let i=0;i<16;i++){const smoke=i>=11,mat=new THREE.MeshBasicMaterial({color:smoke?0x474348:i%2?0xffc34b:0xff641a,transparent:true,opacity:smoke?.24:.85,depthWrite:false});const geo=smoke?new THREE.SphereGeometry(.3,7,5):new THREE.ConeGeometry(.16+i%3*.04,.9,7);const m=new THREE.Mesh(geo,mat);m.userData.firePhase=i*.619;m.userData.fireX=Math.sin(i*2.399)*wide;m.userData.fireZ=Math.cos(i*2.399)*wide;m.userData.smoke=smoke;g.add(m)}return g}
function prepareFireMaterials(obj){const materials=[];obj.traverse(o=>{if(o.isMesh&&o.material?.color){const base=o.material;o.material=base.clone();materials.push({mesh:o,base:base.color.clone(),emissive:base.emissive?.clone()})}});return materials}
function updateLivingFire(obj,b,now){const progress=Math.max(0,1-b.time/b.duration),heat=Math.min(1,progress*3),char=Math.max(0,(progress-.25)/.75);for(const q of b.materials||[]){q.mesh.material.color.copy(q.base).lerp(new THREE.Color(0x272321),char*.78);if(q.mesh.material.emissive){q.mesh.material.emissive.copy(q.emissive||new THREE.Color(0)).lerp(new THREE.Color(0x6d2408),heat*.22);q.mesh.material.emissiveIntensity=.45}}b.light.intensity=(8+heat*20)*(1+Math.sin(now*.017)*.12);for(const m of b.flames.children){const phase=(now*.0008+m.userData.firePhase)%1,smoke=m.userData.smoke;if(m.userData.firePhase===undefined)continue;const grow=.25+heat*.75;m.position.set(m.userData.fireX+Math.sin(now*.002+m.userData.firePhase)*phase*.15,.2+phase*(smoke?8:4.5)*grow,m.userData.fireZ);m.scale.set((smoke?.5+phase:.7)*grow,(smoke?.5+phase:1.2-phase*.6)*grow,(smoke?.5+phase:.7)*grow);m.material.opacity=(smoke?.24:.9)*(1-phase)*grow}}
function igniteStormTarget(obj,kind='tree'){if(!obj||obj.visible===false||obj.userData.stormLocationId!==worldEpoch||stormBurning.has(obj)||burningTrees.has(obj))return;rememberStormObject(obj);obj.userData.stormBurnEpoch=worldEpoch;const materials=prepareFireMaterials(obj),flames=createLivingFire(obj,kind),light=new THREE.PointLight(0xff882f,8,kind==='house'?20:16,1.2);light.position.set(0,1.8,0);obj.add(light);const duration=kind==='house'?45:36;stormBurning.set(obj,{time:duration,duration,kind,flames,light,materials,locationId:worldEpoch});notice(kind==='house'?'🔥 Молния подожгла дом! Огонь постепенно разгорается.':'🔥 Дерево загорелось — держись подальше от огня!')}
function updateStormFires(dt,now){for(const [obj,b] of [...stormBurning]){if(b.locationId!==worldEpoch||obj.userData.stormLocationId!==worldEpoch){obj.remove(b.light);obj.remove(b.flames);stormBurning.delete(obj);restoreStormObject(obj);continue}b.time-=dt;updateLivingFire(obj,b,now);const wp=new THREE.Vector3();obj.getWorldPosition(wp);const fireRadius=b.kind==='house'?3.4:2.65;if(Math.hypot(wp.x-boy.position.x,wp.z-boy.position.z)<fireRadius&&invuln<=0){life--;statsData.damage++;invuln=2.4;playerHitFeedback('fire');notice(life>0?'🔥 Горящий объект обжигает! Отойди! -1❤️':'🔥 Тимур слишком близко подошёл к огню.');if(life<=0)showEnd(false)}if(b.time<=0){obj.remove(b.light);obj.remove(b.flames);obj.visible=false;if(b.kind==='house')makeCharredHouseRemains(obj);else if(b.kind==='log'){const wp=new THREE.Vector3();obj.getWorldPosition(wp);makeCharredTreeRemains(wp.x,wp.z,.55)}else makeCharredTreeRemains(obj.position.x,obj.position.z,1);stormBurning.delete(obj)}}}
function stormRockTargets(){return [...rockPositions.map(q=>q[3]),...boundaryDecor,...mountainObstacles.map(q=>q[3]),...lairObstacles.filter(q=>q[3].children.some(m=>m.geometry===rockGeo)).map(q=>q[3])].filter(Boolean)}
function charStormRock(obj){rememberStormObject(obj);obj.userData.stormBlackened=true;obj.traverse(o=>{if(o.isMesh&&o.material?.color){o.material=o.material.clone();o.material.color.set(0x161616)}});notice('⚡ Молния ударила в камень — он почернел!')}
function lightningCandidates(){const a=[];for(const t of treeObjects)if(t.visible!==false&&t.userData.stormLocationId===worldEpoch)a.push({o:t,k:'tree'});for(const h of houseObjects)if(h.visible!==false&&h!==familyHideout&&h.userData.stormLocationId===worldEpoch)a.push({o:h,k:'house'});for(const l of logObstacles)if(l.g?.visible!==false&&forestVisual.visible&&l.g.userData.stormLocationId===worldEpoch)a.push({o:l.g,k:'log'});for(const rock of stormRockTargets())if(rock.visible!==false&&rock.parent?.visible!==false&&rock.userData.stormLocationId===worldEpoch&&!rock.userData.stormBlackened)a.push({o:rock,k:'rock'});return a.filter(q=>!stormBurning.has(q.o)&&!burningTrees.has(q.o))}
function removeLightningBolt(bolt){scene.remove(bolt.g);bolt.g.traverse(o=>{o.traverse?.(m=>{m.geometry?.dispose();if(m.material&&m.material!==winterRoadMaterial)m.material.dispose?.()})});const i=lightningBolts.indexOf(bolt);if(i>=0)lightningBolts.splice(i,1)}
function updateLightningBolts(dt){for(const bolt of [...lightningBolts]){bolt.time-=dt;if(bolt.time<=0){removeLightningBolt(bolt);continue}const alpha=Math.min(1,bolt.time/.18);bolt.g.traverse(o=>{if(o.material)o.material.opacity=o.userData.boltOpacity*alpha})}}
function spawnLightningBolt(target){
 const box=new THREE.Box3().setFromObject(target),end=new THREE.Vector3((box.min.x+box.max.x)/2,box.max.y,(box.min.z+box.max.z)/2);
 const start=new THREE.Vector3(end.x+rand(-2.5,2.5),Math.max(24,end.y+8),end.z+rand(-2,2)),pts=[start];
 for(let i=1;i<7;i++){const k=i/7;pts.push(new THREE.Vector3(THREE.MathUtils.lerp(start.x,end.x,k)+rand(-.75,.75),THREE.MathUtils.lerp(start.y,end.y,k),THREE.MathUtils.lerp(start.z,end.z,k)+rand(-.55,.55)))}pts.push(end);
 const path=new THREE.CurvePath();for(let i=1;i<pts.length;i++)path.add(new THREE.LineCurve3(pts[i-1],pts[i]));const g=new THREE.Group();
 for(const [radius,color,opacity] of [[.14,0x65caff,.32],[.055,0xf7fbff,1]]){const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,toneMapped:false,fog:false});const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,42,radius,5,false),mat);mesh.userData.boltOpacity=opacity;g.add(mesh)}
 const impact=new THREE.Mesh(new THREE.SphereGeometry(.24,8,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:1,toneMapped:false,fog:false}));impact.position.copy(end);impact.userData.boltOpacity=1;g.add(impact);scene.add(g);const bolt={g,time:.6,target};lightningBolts.push(bolt);return bolt;
}
function triggerLightning(now){if(currentSeason==='winter')return;effect('lightning');effect('thunder');
 lightningFlash=1;const c=lightningCandidates();let strike=null;
 if(weatherStage>=3&&c.length){
  camera.updateMatrixWorld();const near=c.filter(q=>{const p=new THREE.Vector3();q.o.getWorldPosition(p);return Math.hypot(p.x-boy.position.x,p.z-boy.position.z)<28});
  const visible=near.filter(q=>{const b=new THREE.Box3().setFromObject(q.o),p=b.getCenter(new THREE.Vector3()).project(camera);return p.z>=-1&&p.z<=1&&Math.abs(p.x)<.9&&Math.abs(p.y)<.9});
  const pool=visible.length?visible:near.length?near:c,kinds=[...new Set(pool.map(q=>q.k))],kind=kinds[Math.floor(Math.random()*kinds.length)],targets=pool.filter(q=>q.k===kind);strike=targets[Math.floor(Math.random()*targets.length)];
  spawnLightningBolt(strike.o);if(strike.k==='rock')charStormRock(strike.o);else igniteStormTarget(strike.o,strike.k);
 }
 sound(85,.34,'sawtooth');nextLightningAt=levelTime+20;return strike;
}
function updateStormClouds(dt,now){const w=windVector(now),counts=[4,7,11,16,weatherClouds.length],active=Math.min(counts[weatherStage]||4,Math.ceil(weatherClouds.length*graphicsCloudFactor));for(let i=0;i<weatherClouds.length;i++){const c=weatherClouds[i];c.visible=i<active;if(!c.visible)continue;const speed=(.18+w.power*3.6)*c.userData.drift;c.position.x+=w.x*dt*speed;c.position.z+=w.z*dt*speed+(weatherStage<2?dt*.08:0);if(c.position.x>58)c.position.x=-58;if(c.position.x<-58)c.position.x=58;if(c.position.z>42)c.position.z=-55;if(c.position.z<-58)c.position.z=40;const dark=[0xffffff,0xdde2e5,0xaeb8c1,0x737c88,0x4f5663][weatherStage];c.userData.cloudMat.color.set(dark);c.userData.cloudMat.opacity=weatherStage>=3?.86:weatherStage===2?.78:.68}}
function updateStormWorld(dt,now){const w=windVector(now),sway=weatherStage>=2?(weatherStage===2?.025:weatherStage===3?.055:.105):0;for(let i=0;i<treeObjects.length;i++){const t=treeObjects[i];if(t.userData.baseWindRotZ===undefined)t.userData.baseWindRotZ=t.rotation.z||0;t.rotation.z=t.userData.baseWindRotZ+Math.sin(now*.0024+i*.71)*sway+w.x*sway*.65}if(weatherStage>=2){leafSpawnCd-=dt;if(leafSpawnCd<=0){spawnStormLeaf(now);leafSpawnCd=weatherStage>=4?.035:weatherStage===3?.075:.15}}for(let i=stormLeaves.length-1;i>=0;i--){const q=stormLeaves[i];q.t-=dt;q.g.position.x+=w.x*dt*(3+7*w.power);q.g.position.z+=w.z*dt*(3+7*w.power);q.g.position.y-=dt*(.45-weatherStage*.05);q.g.rotation.x+=q.spin*dt;q.g.rotation.z+=q.spin*.7*dt;if(q.t<=0||q.g.position.y<.05){scene.remove(q.g);stormLeaves.splice(i,1)}}if(weatherStage>=4){for(const o of logObstacles){o.g.position.x+=w.x*dt*1.45;o.g.position.z+=w.z*dt*1.45;o.x=o.g.position.x;o.z=o.g.position.z;o.g.rotation.y+=dt*.8}for(const a of apples){if(a.done||a.y>1)continue;a.g.position.x+=w.x*dt*2.8;a.g.position.z+=w.z*dt*2.8;a.x=a.g.position.x;a.z=a.g.position.z;if(Math.abs(a.x)>52||Math.abs(a.z)>52){a.done=true;scene.remove(a.g)}}}}
function updateWeather(dt,now){if(currentSeason==='winter'){updateSnow(dt,now);return}updatePuddles(dt);const stage=levelTime>=240?4:levelTime>=180?3:levelTime>=120?2:levelTime>=60?1:0;if(stage!==weatherStage){weatherStage=stage;weatherBaseSky=scene.background.clone();if(stage>=3&&nextLightningAt===0)nextLightningAt=levelTime;const msg=['','🌦️ Начался дождик — тучи сгущаются.','🌧️ Ливень усилился, ветер гонит тучи от портала.','⛈️ Гроза! Каждые 20 секунд молния бьёт в дерево, дом или камень.','🌀 Ураган! Молнии продолжают бить каждые 20 секунд.'][stage];if(msg)notice(msg)}updateStormClouds(dt,now);weatherGroup.visible=stage>=1;if(stage>=1){weatherGroup.position.set(boy.position.x,0,boy.position.z);const a=rainGeo.attributes.position.array,w=windVector(now),active=Math.floor(rainCount*(stage===1?.42:stage===2?.72:1));rainGeo.setDrawRange(0,Math.floor(active*graphicsParticleFactor));for(let i=0;i<active;i++){a[i*3+1]-=dt*(stage>=3?28:stage===2?23:17);a[i*3]+=dt*w.x*(stage>=4?10:stage>=2?5:0);a[i*3+2]+=dt*w.z*(stage>=4?10:stage>=2?5:0);if(a[i*3+1]<0){a[i*3+1]=rand(16,25);a[i*3]=rand(-24,24);a[i*3+2]=rand(-24,24)}}rainGeo.attributes.position.needsUpdate=true;rainMat.opacity=stage===1?.48:stage===2?.72:.92}if(stage>=3&&levelTime>=nextLightningAt)triggerLightning(now);updateLightningBolts(dt);if(lightningFlash>0){lightningFlash=Math.max(0,lightningFlash-dt*4.8);lightningSky.intensity=9*lightningFlash;lightningSun.intensity=7*lightningFlash;renderer.toneMappingExposure=(level===2?1.10:(level===3?.96:1.08))+1.25*lightningFlash;if(weatherBaseSky)scene.background.copy(weatherBaseSky).lerp(new THREE.Color(0xf4fbff),lightningFlash*.92),scene.fog.color.copy(scene.background)}else{lightningSky.intensity=0;lightningSun.intensity=0;renderer.toneMappingExposure=level===2?1.10:(level===3?.96:1.08);if(weatherBaseSky&&stage>=3){scene.background.copy(weatherBaseSky);scene.fog.color.copy(scene.background)}}updateStormWorld(dt,now);updateStormFires(dt,now);if(weatherDeadline(currentSeason,level,levelTime)==='carry'&&hurricaneCarry<=0&&!endShown&&!shelteredFromWind()&&!cinematicRunning){beginHurricaneScene();if(mountedFriend){mountedFriend=false;setRiderPose(false);if(friend?.g)friend.g.position.y=0}notice('🌪️ Ураган подхватил Тимура!')}}
function shelteredFromWind(){if(level!==3||!familyHideout.visible)return false;familyHideout.updateWorldMatrix(true,true);const p=familyHideout.worldToLocal(boy.position.clone());return Math.abs(p.x)<2.4&&p.z> -1.95&&p.z<2.08&&p.y<2.8}
function beginHurricaneScene(){hurricaneCarry=.001;paused=true;playCinematic('storm',()=>{hurricaneCarry=0;lastDeathCause='wind';boy.rotation.set(0,yaw,0);showEnd(false)},{line:'Ураган подхватил Тимура. Пора искать укрытие!'})}
function updateHurricaneCarry(dt,now){if(level===6){hurricaneCarry=0;return}if(hurricaneCarry<=0||endShown)return;hurricaneCarry+=dt;const w=windVector(now),k=Math.min(1,hurricaneCarry/3.2);boy.position.x+=w.x*dt*(8+18*k);boy.position.z+=w.z*dt*(8+18*k);boy.position.y+=dt*(2.2+8*k);boy.rotation.z=Math.sin(hurricaneCarry*2)*.18;boy.rotation.x=.12;if(hurricaneCarry>3.2||Math.abs(boy.position.x)>58||Math.abs(boy.position.z)>58){boy.rotation.x=0;boy.rotation.z=0;boy.position.y=0;notice('🌪️ Тимура унесло за пределы карты!');showEnd(false)}}
const glintMat=new THREE.MeshBasicMaterial({color:0xfff2bd,transparent:true,opacity:.22,depthWrite:false});
const lakeGlint=new THREE.Mesh(new THREE.CircleGeometry(2.25,24),glintMat);lakeGlint.rotation.x=-Math.PI/2;lakeGlint.scale.set(2.5,.58,1);lakeGlint.position.set(-22.5,.19,-22.5);lakeVisual.add(lakeGlint);lakeGlint.visible=false;
const reedMat=new THREE.MeshLambertMaterial({color:0x5d8f38}),reedTipMat=new THREE.MeshLambertMaterial({color:0x795b31});
for(let i=0;i<(mobile?34:58);i++){const a=rand(0,Math.PI*2),r=rand(13.0,15.15),g=group(-18+Math.cos(a)*r,-17+Math.sin(a)*r);const stems=mobile?2:3;for(let j=0;j<stems;j++){const xx=rand(-.25,.25),zz=rand(-.25,.25),h=rand(.9,1.75);block(g,reedMat,xx,h*.5,zz,.065,h,.065);if(j===0&&i%3===0)block(g,reedTipMat,xx,h+.10,zz,.11,.24,.11)}biomeMesh(g,2)}
// Кувшинки — только визуальные, поэтому не меняют коллизии и механику карты.
const lilyMat=new THREE.MeshLambertMaterial({color:0x4f9b55}),lilyFlowerMat=new THREE.MeshBasicMaterial({color:0xffd9e9});
for(let i=0;i<(mobile?12:22);i++){const a=rand(0,Math.PI*2),r=rand(2.5,11.3),g=new THREE.Group();g.position.set(-18+Math.cos(a)*r,.19,-17+Math.sin(a)*r);const pad=new THREE.Mesh(new THREE.CircleGeometry(rand(.28,.55),12),lilyMat);pad.rotation.x=-Math.PI/2;g.add(pad);if(i%5===0)sphere(g,lilyFlowerMat,.08,.08,.02,.10);g.userData.lily=true;lakeVisual.add(g)}
// небольшие светлые камни у озера
for(let i=0,tries=0;i<20&&tries<160;tries++){const a=rand(0,Math.PI*2),r=rand(14.3,16.2),m=new THREE.Mesh(rockGeo,mats.stone);m.position.set(-18+Math.cos(a)*r,rand(.16,.32),-17+Math.sin(a)*r);m.scale.set(rand(.28,.72),rand(.24,.52),rand(.35,.82));if(!roadClearForRadius(m.position.x,m.position.z,Math.max(m.scale.x,m.scale.z),.12))continue;scene.add(m);biomeMesh(m,2);rockPositions.push([m.position.x,m.position.z,Math.max(m.scale.x,m.scale.z)*.8,m]);i++}
// горная локация: крупные отдельные валуны и скальные группы
for(let i=0;i<24;i++){const sx=rand(1.3,3.1),sy=rand(1.1,3.7),sz=rand(1.3,3.0),rr=Math.max(sx,sz)*.88,[x,z]=safeSolidScenerySpot(rr,41),g=group(x,z);const r=new THREE.Mesh(rockGeo,new THREE.MeshLambertMaterial({color:0x777c80,map:mats.stone.map}));r.scale.set(sx,sy,sz);r.position.y=r.scale.y*.45;g.add(r);mountainObstacles.push([g.position.x,g.position.z,rr,r]);biomeMesh(g,5)}
for(let i=0;i<8;i++){const h=rand(3,6),pr=rand(1.3,2.2),rr=pr*.9,[x,z]=safeSolidScenerySpot(rr,39),g=group(x,z);const peak=new THREE.Mesh(new THREE.ConeGeometry(pr,h,5),ridgeMat.clone());peak.position.y=h/2-.45;g.add(peak);mountainObstacles.push([g.position.x,g.position.z,rr,peak]);biomeMesh(g,5)}
// логово: узнаваемые обгоревшие пни и тёмные валуны; все имеют физическую коллизию
const burntWood=new THREE.MeshLambertMaterial({color:0x3a261f,map:mats.wood.map}),charTop=new THREE.MeshLambertMaterial({color:0x171315});
for(let i=0;i<18;i++){
 let rr,shape;
 if(i%2){const w=rand(.75,1.15),h=rand(.75,1.55);rr=w*.78;shape={kind:'stump',w,h}}
 else{const r=new THREE.Mesh(rockGeo,new THREE.MeshLambertMaterial({color:0x4a4650,map:mats.stone.map}));r.scale.set(rand(.8,1.8),rand(.6,1.5),rand(.8,1.8));rr=Math.max(r.scale.x,r.scale.z)*.72;shape={kind:'rock',r}}
 const [x,z]=safeSolidScenerySpot(rr,40),g=group(x,z);
 if(shape.kind==='stump'){const {w,h}=shape;block(g,burntWood,0,h/2,0,w,h,w);block(g,charTop,0,h+.035,0,w*.92,.07,w*.92);block(g,burntWood,-w*.58,.18,.05,w*.55,.20,.28);block(g,burntWood,w*.52,.16,-.08,w*.48,.18,.26)}
 else{shape.r.position.y=shape.r.scale.y*.42;g.add(shape.r)}
 lairObstacles.push([g.position.x,g.position.z,rr,g]);biomeMesh(g,6)
}const moonMat=new THREE.MeshBasicMaterial({color:0xf1f6ff});const moon=new THREE.Group();const moonDisc=new THREE.Mesh(new THREE.SphereGeometry(4.2,20,16),moonMat);moon.add(moonDisc);const moonHalo=new THREE.Mesh(new THREE.RingGeometry(4.5,6.4,32),new THREE.MeshBasicMaterial({color:0xa9c9ff,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));moonHalo.position.z=-.15;moon.add(moonHalo);moon.position.set(-20,23,-31);scene.add(moon);moon.visible=false;const moonLight=new THREE.DirectionalLight(0x9bc2ff,.0);moonLight.position.set(-20,24,-25);scene.add(moonLight);
function makeBoy(){let g=new THREE.Group();block(g,mats.pants,-.18,.43,0,.34,.85,.4);block(g,mats.pants,.18,.43,0,.34,.85,.4);block(g,mats.shirt,0,1.25,0,.85,.9,.48);block(g,mats.skin,0,2.03,0,.7,.7,.65);block(g,mats.hair,0,2.43,-.04,.76,.2,.68);block(g,mats.skin,-.56,1.25,0,.23,.72,.24);block(g,mats.skin,.56,1.25,0,.23,.72,.24);for(const x of [-.18,.18])block(g,mats.black,x,2.09,.34,.08,.1,.04);return g}const boy=makeBoy();boy.scale.setScalar(.52);
// Character Remaster — Timur
const boyHairMat=new THREE.MeshLambertMaterial({color:0x4a2b1c}),boyShoeMat=new THREE.MeshLambertMaterial({color:0x243447}),boyPackMat=new THREE.MeshLambertMaterial({color:0x6d4329}),boySkinMat=new THREE.MeshLambertMaterial({color:0xf2b184}),boyEyeMat=new THREE.MeshBasicMaterial({color:0x17212b});
block(boy,boyHairMat,0,2.52,-.02,.82,.22,.72);
for(const sx of [-1,1]){block(boy,boySkinMat,sx*.39,2.06,0,.13,.28,.18);block(boy,boyEyeMat,sx*.18,2.11,.37,.09,.11,.035);block(boy,boyShoeMat,sx*.18,.10,.12,.36,.20,.58)}
block(boy,boyPackMat,0,1.35,-.35,.68,.82,.22);
// Chunky fringe, white eyes, eyebrows and a small mouth like the reference hero.
for(const sx of [-1,1]){block(boy,mats.white,sx*.18,2.11,.365,.19,.19,.025);block(boy,boyEyeMat,sx*.15,2.10,.386,.075,.12,.028);const brow=block(boy,boyHairMat,sx*.18,2.25,.377,.23,.06,.045);brow.rotation.z=sx*-.10;block(boy,mats.shirt,sx*.56,1.53,0,.25,.25,.27)}
for(let i=0;i<4;i++)block(boy,boyHairMat,-.30+i*.20,2.37+(i%2)*.04,.32,.21,.25,.14);
block(boy,boyHairMat,0,1.88,.341,.19,.045,.024);
boy.userData.visualRemaster=true;boy.traverse(o=>{if(o.isMesh){o.castShadow=!mobile;o.receiveShadow=!mobile}});scene.add(boy);boy.position.set(0,0,4);let vy=0,py=0,mountedFriend=false,rideBump=0,rideGallop=0,footBranchBump=0;
// v87 riding pose: Timur visibly sits astride the friendly boar instead of standing on its back.
const riderPoseParts={leftLeg:boy.children[0],rightLeg:boy.children[1],leftArm:boy.children[5],rightArm:boy.children[6]};
function setRiderPose(on){
 const {leftLeg,rightLeg,leftArm,rightArm}=riderPoseParts;
 if(leftLeg){leftLeg.rotation.x=on?-1.02:0;leftLeg.rotation.z=on?-.18:0;leftLeg.position.y=on?.70:.43;leftLeg.position.z=on?.18:0}
 if(rightLeg){rightLeg.rotation.x=on?-1.02:0;rightLeg.rotation.z=on?.18:0;rightLeg.position.y=on?.70:.43;rightLeg.position.z=on?.18:0}
 if(leftArm){leftArm.rotation.x=on?-.72:0;leftArm.rotation.z=on?-.18:0}
 if(rightArm){rightArm.rotation.x=on?-.72:0;rightArm.rotation.z=on?.18:0}
}

const lakeInlet=new THREE.Group();lakeVisual.add(lakeInlet);
function tributaryGeometry(bed=false){const vertices=[],uv=[],indices=[],segments=96,across=12;for(let i=0;i<=segments;i++){const x=-46+i*.25,c=lakeInletCenterAt(x),w=lakeInletHalfWidthAt(x);for(let j=0;j<=across;j++){const z=c-w+j/across*w*2;vertices.push(x,bed?-Math.max(lakeDepth(x,z),lakeInletDepthAt(x,z))+.022:.12,z);uv.push(x*.16,z*.16);if(i<segments&&j<across){const a=i*(across+1)+j,b=a+across+1;if(bed||lakeDepth(x,z)<.015)indices.push(a,b,a+1,a+1,b,b+1)}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g}
const riverVisual=new THREE.Group();scene.add(riverVisual);biomeMesh(riverVisual,4);
const riverMat=new THREE.MeshPhongMaterial({color:0x4d9eaf,transparent:true,opacity:.48,depthWrite:false,shininess:100,specular:0xc8efff});
const tributaryWater=new THREE.Mesh(tributaryGeometry(),riverMat);lakeInlet.add(tributaryWater);const tributaryBed=new THREE.Mesh(tributaryGeometry(true),new THREE.MeshLambertMaterial({color:0x7d9b82,map:pixelTexture(165,[136,147,103],[75,103,87],'stone'),side:THREE.DoubleSide}));lakeInlet.add(tributaryBed);
const tributaryFlow=[];for(let i=0;i<12;i++){const x=-45+i*1.8,m=block(lakeInlet,new THREE.MeshBasicMaterial({color:0xdaf6f0,transparent:true,opacity:.3}),x,.145,lakeInletCenterAt(x)+Math.sin(i*2.7)*2.8,1.4,.012,.07);m.userData.waterFlow=true;tributaryFlow.push(m)}
const rv=[],ri=[];for(let i=0;i<=92;i++){const x=-46+i,z=riverCenterAt(x);rv.push(x,.035,z-4.2,x,.035,z+4.2);if(i<92){const j=i*2;ri.push(j,j+1,j+2,j+1,j+3,j+2)}}
const riverGeo=new THREE.BufferGeometry();riverGeo.setAttribute('position',new THREE.Float32BufferAttribute(rv,3));riverGeo.setIndex(ri);riverGeo.computeVertexNormals();const riverWater=new THREE.Mesh(riverGeo,riverMat);riverVisual.add(riverWater);
const riverFlow=[];for(let i=0;i<38;i++){const x=-46+i*2.4,z=riverCenterAt(x)+Math.sin(i*2.7)*2.8,m=block(riverVisual,new THREE.MeshBasicMaterial({color:0xdaf6f0,transparent:true,opacity:.3}),x,.06,z,1.4,.012,.07);riverFlow.push(m)}
const bridgeWood=new THREE.MeshLambertMaterial({color:0xa57845,map:mats.wood.map});for(let z=-19;z<=-9;z+=.55)block(riverVisual,bridgeWood,0,.22,z,5.1,.12,.5);
for(const x of [-2.55,2.55]){block(riverVisual,mats.wood,x,.9,-14,.12,.12,10.5);for(const z of [-19,-16.5,-14,-11.5,-9])block(riverVisual,mats.wood,x,.52,z,.15,1.08,.15)}
for(let side of [-1,1]){let x=-41;while(x<42){x+=rand(2.3,7.5);if(Math.abs(x)<4.7||x>42)continue;const z=riverCenterAt(x)+side*rand(5.3,8.3),m=new THREE.Mesh(rockGeo,mats.stone);const rx=rand(.34,1.05),ry=rand(.28,.83),rz=rand(.4,.98);m.scale.set(rx,ry,rz);m.rotation.set(rand(-.2,.2),rand(0,6.28),rand(-.16,.16));m.position.set(x,ry*.55,z);riverVisual.add(m);rockPositions.push([x,z,Math.max(rx,rz)*.8,m]);m.userData.biomeLevel=4;biomeObjects.push(m)}}
const fordSign=group(28,riverCenterAt(28)+6.2);block(fordSign,mats.wood,0,.65,0,.15,1.3,.15);block(fordSign,mats.gold,0,1.3,0,1.1,.55,.1);riverVisual.add(fordSign);
// Sculpt the visible shoreline from the same function used by water physics.

for(const m of [rippleA,rippleB,lakeDeepCenter,lakeAbyss])m.visible=false;
const lakeWaves=[];for(let i=0;i<18;i++){const q=lakePointAt(i*2.399,4+(i%5)*1.45),pts=[];for(let j=0;j<=8;j++){const a=(j/8-.5)*1.15;pts.push(new THREE.Vector3(Math.sin(a)*.75,0,(1-Math.cos(a))*.35))}const g=new THREE.BufferGeometry().setFromPoints(pts),m=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xc8edf2,transparent:true,opacity:.19,depthWrite:false}));m.position.set(q.x,.145,q.z);lakeVisual.add(m);lakeWaves.push(m)}
function deformLakeDisk(geometry){const p=geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=-p.getY(i),radius=Math.hypot(x,z),q=lakePointAt(Math.atan2(z,x),radius);p.setXY(i,q.x+18,-(q.z+17))}p.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere()}
for(const m of [shoreRing,rippleA,rippleB,lakeDeepCenter,lakeAbyss])deformLakeDisk(m.geometry);
const shoreIndices=[],shorePositions=shoreRing.geometry.attributes.position,shoreIndex=shoreRing.geometry.index;for(let i=0;i<shoreIndex.count;i+=3){let blocked=false;for(let j=0;j<3;j++){const n=shoreIndex.getX(i+j);if(lakeInletDepthAt(shorePositions.getX(n)-18,-shorePositions.getY(n)-17)>.001)blocked=true}if(!blocked)shoreIndices.push(shoreIndex.getX(i),shoreIndex.getX(i+1),shoreIndex.getX(i+2))}shoreRing.geometry.setIndex(shoreIndices);


function lakeSurfaceGeometry(bed=false){const vertices=[],indices=[],segments=80,rings=16;for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const p=lakePointAt(i/segments*Math.PI*2,13.6*j/rings);vertices.push(p.x+18,bed?-Math.max(lakeDepth(p.x,p.z),lakeInletDepthAt(p.x,p.z))+.022:0,p.z+17);if(j<rings&&i<segments){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(vertices.flatMap((v,i)=>i%3===0?[v*.15,vertices[i+2]*.15]:[]),2));g.setIndex(indices);g.computeVertexNormals();return g}
lake.geometry.dispose();lake.geometry=lakeSurfaceGeometry();const lakeColors=[],lakePositions=lake.geometry.attributes.position;for(let i=0;i<lakePositions.count;i++){const c=new THREE.Color(0x78bfcb).lerp(new THREE.Color(0x285f90),lakeDepth(lakePositions.getX(i)-18,lakePositions.getZ(i)-17)/5.2);lakeColors.push(c.r,c.g,c.b)}lake.geometry.setAttribute("color",new THREE.Float32BufferAttribute(lakeColors,3));waterMat.vertexColors=true;waterMat.color.set(0xffffff);waterMat.map=null;lake.position.y=.12;waterMat.transparent=true;waterMat.opacity=.43;waterMat.depthWrite=false;waterMat.side=THREE.DoubleSide;lakeDeepMat.opacity=.13;lakeAbyssMat.opacity=.10;
const underwaterMat=new THREE.MeshLambertMaterial({color:0x7d9b82,map:pixelTexture(163,[136,147,103],[75,103,87],'stone'),side:THREE.DoubleSide});const lakeBed=new THREE.Mesh(lakeSurfaceGeometry(true),underwaterMat);lakeBed.position.set(-18,0,-17);lakeVisual.add(lakeBed);
// Reposition reeds, lilies and shoreline rocks along the elongated bank.
for(const o of lakeVisual.children){if(o===lakeBed||o.isMesh)continue;const dx=o.position.x+18,dz=o.position.z+17,r=Math.hypot(dx,dz);if(r>0&&r<18){const p=lakePointAt(Math.atan2(dz,dx),r);o.position.x=p.x;o.position.z=p.z}}
for(const p of rockPositions){const m=p[3];if(m.userData.biomeLevel!==2)continue;const a=Math.atan2(m.position.z+17,m.position.x+18),q=lakePointAt(a,Math.hypot(m.position.x+18,m.position.z+17));m.position.x=p[0]=q.x;m.position.z=p[1]=q.z}
for(const o of biomeObjects)if(o.userData.biomeLevel===2&&o.isGroup){const dx=o.position.x+18,dz=o.position.z+17,p=lakePointAt(Math.atan2(dz,dx),Math.hypot(dx,dz));o.position.x=p.x;o.position.z=p.z}
const riverBedGeo=riverGeo.clone(),bedPositions=riverBedGeo.attributes.position;for(let i=0;i<bedPositions.count;i++)bedPositions.setY(i,-riverDepthAt(bedPositions.getX(i),bedPositions.getZ(i))+.022); // add centre vertices so the bed has real depth
const rb=[],rbi=[];for(let i=0;i<=92;i++){const x=-46+i,c=riverCenterAt(x);for(const d of [-4.2,-2.1,0,2.1,4.2])rb.push(x,-riverDepthAt(x,c+d)+.018,c+d);if(i<92)for(let j=0;j<4;j++){const a=i*5+j,b=a+5;rbi.push(a,b,a+1,a+1,b,b+1)}}riverBedGeo.dispose();const bedGeo=new THREE.BufferGeometry();bedGeo.setAttribute('position',new THREE.Float32BufferAttribute(rb,3));bedGeo.setIndex(rbi);bedGeo.computeVertexNormals();const riverBed=new THREE.Mesh(bedGeo,underwaterMat);riverVisual.add(riverBed);riverMat.side=THREE.DoubleSide;
const aquaticRoots={2:new THREE.Group(),4:new THREE.Group()},aquaticFish=[],aquaticWeeds=[];lakeVisual.add(aquaticRoots[2]);riverVisual.add(aquaticRoots[4]);
visualOnly(()=>{for(const lv of [2,4]){
 const root=aquaticRoots[lv],weedMat=new THREE.MeshLambertMaterial({color:0x427b5b,side:THREE.DoubleSide});
 for(let i=0;i<(mobile?35:65);i++){let x,z;if(lv===2){if(i<16){x=rand(-45,-30);z=lakeInletCenterAt(x)+rand(-2.7,2.7)}else{const p=lakePointAt(i*2.39996,rand(5,11.7));x=p.x;z=p.z}}else{x=rand(-41,41);z=riverCenterAt(x)+rand(-3,3)}const depth=lv===2?Math.max(lakeDepth(x,z),lakeInletDepthAt(x,z)):riverDepthAt(x,z);if(depth<.4)continue;const plant=new THREE.Group();plant.position.set(x,-depth+.055,z);for(let j=0;j<3;j++){const height=Math.min(depth*.7,rand(.45,1.15)),leaf=new THREE.Mesh(new THREE.PlaneGeometry(.12,height,1,3),weedMat);leaf.position.set((j-1)*.11,height/2,0);leaf.rotation.y=j*1.2;plant.add(leaf)}root.add(plant);aquaticWeeds.push({g:plant,level:lv,phase:i*.7})}
 for(let i=0;i<(mobile?7:14);i++){const g=new THREE.Group(),bodyMat=new THREE.MeshLambertMaterial({color:[0xdcaa67,0xa6cfbd,0x839fbc][i%3]}),body=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),bodyMat);body.scale.set(.7,1,2.0);g.add(body);const tail=new THREE.Mesh(new THREE.ConeGeometry(.15,.28,3),bodyMat);tail.position.z=-.36;tail.rotation.x=-Math.PI/2;g.add(tail);for(const sx of [-1,1])sphere(g,mats.black,sx*.11,.05,.19,.025);root.add(g);aquaticFish.push({g,tail,level:lv,tributary:lv===2&&i<4,phase:i*1.9,speed:rand(.12,.23),radius:rand(5.5,9.8),x:rand(-40,40)})}
}});
function updateAquaticLife(dt,now){for(const f of aquaticFish){if(f.level!==level)continue;f.phase+=dt*f.speed;let x,z,nx,nz;if(level===2&&f.tributary){f.x+=dt*1.1;if(f.x<-45||f.x>-27)f.x=-45;x=f.x;z=lakeInletCenterAt(x)+Math.sin(f.phase)*1.4;nx=x+.2;nz=lakeInletCenterAt(nx)+Math.sin(f.phase+.01)*1.4}else if(level===2){const p=lakePointAt(f.phase,f.radius),n=lakePointAt(f.phase+.02,f.radius);x=p.x;z=p.z;nx=n.x;nz=n.z}else{f.x+=dt*(1.0+(f.radius-5)*.15);if(f.x>42)f.x=-42;x=f.x;z=riverCenterAt(x)+Math.sin(f.phase)*1.4;nx=x+.2;nz=riverCenterAt(nx)+Math.sin(f.phase+.01)*1.4}const d=level===2?Math.max(lakeDepth(x,z),lakeInletDepthAt(x,z)):riverDepthAt(x,z);f.g.position.set(x,-Math.min(.72,d*.58),z);f.g.visible=d>.25;f.g.rotation.y=Math.atan2(nx-x,nz-z);f.tail.rotation.z=Math.sin(now*.012+f.phase)*.22}for(const w of aquaticWeeds)if(w.level===level)w.g.rotation.z=Math.sin(now*.0015+w.phase)*.13}

const winterDrifts=[];let winterSnowMinute=-1;let worldSurface=new WorldSurface(1),puddleRain=0;const puddleObjects=[],surfaceGeometry=new THREE.PlaneGeometry(96,96,96,96);ground.geometry=surfaceGeometry;ground.scale.set(1,1,1);ground.rotation.x=-Math.PI/2;ground.position.set(0,0,0);
function terrainHeightAt(x,z){let height=worldSurface.height(x,z);if(currentSeason!=='winter')for(const p of puddleObjects){if(!p.visible)continue;const r=Math.hypot(x-p.position.x,z-p.position.z)/Math.max(.01,p.scale.x);if(r<1.2){const k=Math.max(0,Math.min(1,(1.2-r)/.2));height=Math.min(height,height+(p.userData.baseY+.018-height)*k)}}if(currentSeason==='winter')for(const d of winterDrifts){const r=Math.hypot(x-d.x,z-d.z)/d.r;if(r<1)height+=d.height*Math.sqrt(1-r*r)}return height}
function groundSurfaceHeightAt(x,z){const depth=level===2?Math.max(lakeDepth(x,z),lakeInletDepthAt(x,z)):level===4?riverDepthAt(x,z):0;return terrainHeightAt(x,z)-depth-puddleDepthAt(x,z)}
function rebuildWorldSurface(){
 for(const p of puddleObjects)p.visible=false;
 const zones=[];for(const t of treeObjects)if(t.visible)zones.push({x:t.position.x,z:t.position.z,r:2.0});for(const [x,z,r,m] of rockPositions)if(m.visible&&m.parent?.visible!==false)zones.push({x,z,r:r+1.0});for(const h of houseObjects)if(h.visible){const b=horizontalBounds(h);zones.push({...b,r:b.r+1.2})}for(const [x,z,r,m] of [...mountainObstacles,...lairObstacles])if(m.visible&&m.parent?.visible!==false)zones.push({x,z,r:r+1.5});
 const basins=[];for(let i=0;i<360&&basins.length<12;i++){const x=Math.sin(i*23.31+level*2.1)*37,z=Math.cos(i*7.17+level)*37,r=3.0;if(Math.abs(x)<7||basins.some(b=>Math.hypot(x-b.x,z-b.z)<7)||zones.some(q=>Math.hypot(x-q.x,z-q.z)<q.r+3.2)||(level===2&&lakeRadiusAt(x,z)<19)||(level===4&&Math.abs(z-riverCenterAt(x))<9))continue;basins.push({x,z,r})}
 worldSurface=new WorldSurface(level,zones,basins);const pos=surfaceGeometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,groundSurfaceHeightAt(pos.getX(i),-pos.getY(i)));pos.needsUpdate=true;surfaceGeometry.computeVertexNormals();surfaceGeometry.computeBoundingSphere();
 const matrix=new THREE.Matrix4();for(let i=0;i<grassCount;i++){grassBlades.getMatrixAt(i,matrix);matrix.elements[13]=.1+terrainHeightAt(matrix.elements[12],matrix.elements[14]);grassBlades.setMatrixAt(i,matrix)}grassBlades.instanceMatrix.needsUpdate=true;syncMeadowGrass();
 for(const p of puddleObjects){scene.remove(p);p.geometry.dispose();p.material.dispose()}puddleObjects.length=0;puddleRain=0;
 for(const b of basins){const y=terrainHeightAt(b.x,b.z);if(y>-.06)continue;const p=new THREE.Mesh(new THREE.CircleGeometry(1,32),new THREE.MeshPhongMaterial({color:0x91b9be,transparent:true,opacity:.62,shininess:110,specular:0xe2ffff,depthWrite:false}));p.rotation.x=-Math.PI/2;p.position.set(b.x,y+.01,b.z);p.userData.basin=b;p.userData.baseY=y;p.visible=false;scene.add(p);puddleObjects.push(p)}
}
function puddleDepthAt(x,z){let depth=0;for(const p of puddleObjects){const b=p.userData.basin,k=Math.max(0,1-Math.hypot(x-b.x,z-b.z)/Math.max(.01,p.scale.x));depth=Math.max(depth,(p.visible?.14:0)*k*k)}return depth}
function updatePuddles(dt){const cap=rainFillLimit(weatherStage),rate=rainFillRate(weatherStage);if(rate&&puddleRain<cap)puddleRain=Math.min(cap,puddleRain+dt*rate);for(const p of puddleObjects){p.visible=puddleRain>.025;p.scale.setScalar(Math.min(p.userData.basin.r*1.85,.15+puddleRain*2.8));p.position.y=p.userData.baseY+.018;p.material.opacity=Math.min(.78,.3+puddleRain*.25)}if(Math.abs(puddleRain-(updatePuddles.lastFill||0))>.025||dt===0){updatePuddles.lastFill=puddleRain;const a=surfaceGeometry.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,groundSurfaceHeightAt(a.getX(i),-a.getY(i)));a.needsUpdate=true;surfaceGeometry.computeVertexNormals()}}
function waterAt(x,z){if(lakeDepthAt(x,z)>.012)return {depth:lakeDepthAt(x,z),y:level===2?.12:.035};for(const p of puddleObjects)if(p.visible&&Math.hypot(x-p.position.x,z-p.position.z)<p.scale.x*.94)return {depth:puddleDepthAt(x,z),y:p.position.y};return null}
function walkingInWater(x,z){return !!waterAt(x,z)}
function updateRiverFlow(dt){if(level===2&&currentSeason!=='winter')for(const [i,m] of tributaryFlow.entries()){m.position.x+=dt*1.2;if(m.position.x>-22)m.position.x=-46;m.position.z=lakeInletCenterAt(m.position.x)+Math.sin(i*2.7)*2.8}if(level!==4)return;for(const m of riverFlow){m.position.x+=dt*1.2;if(m.position.x>47)m.position.x=-47;m.position.z=riverCenterAt(m.position.x)+Math.sin(riverFlow.indexOf(m)*2.7)*2.8}}

function riderSeatHeight(){return 1.18*(friend?.g?friend.g.scale.y/boarScale(friend):1)}
function mountFriendNow(){if(!friend?.g||friend.flee||mountedFriend||catFormTime>0)return false;mountedFriend=true;py=riderSeatHeight();vy=0;boy.position.x=friend.g.position.x;boy.position.z=friend.g.position.z;boy.position.y=py;boy.rotation.y=friend.g.rotation.y;setRiderPose(true);repairCompanion(playerBoarBody(),true);friend.g.position.x=boy.position.x;friend.g.position.z=boy.position.z;effect('mount');notice('🐗 Верхом! Тимур сел как на коня. Прыжок — спрыгнуть.');return true}
// v89: while Timur is riding, the friendly boar still protects him and rams hostile boars on contact.
// v131: boss minions can still be befriended with food, but combat minions fall in one friendly-boar hit.
function hitBossMinion(target,ax,az,al){
 if(!target?.isMinion||!foes.includes(target))return false;
 target.hp=Math.max(0,(target.hp??1)-1);target.stagger=Math.max(target.stagger||0,.48);
 target.aura.material.color.set(0xffffff);target.aura.material.opacity=.58;
 setTimeout(()=>{if(target?.g?.parent&&foes.includes(target)){target.aura.material.color.set(0xff4b4b);target.aura.material.opacity=.18}},130);
 const push=.72;target.g.position.x+=ax/al*push;target.g.position.z+=az/al*push;
 if(target.hp<=0){sendBoarAway(target,'minion-hit');const fi=foes.indexOf(target);if(fi>=0)foes.splice(fi,1);target.flee=true;target.fleeSpeed=8.4;levelBoarsDone++;statsData.minions++;score+=diffScore(25);softBoarDefeatSound();notice('💥 Первый удар! Миньон испугался и убегает за границу карты!');return true}
 sound(175,.13,'triangle');return false
}
function mountedFriendDefense(){if(!mountedFriend||!friend?.g||friend.flee||friend.knockback?.active||friendKnockbackActive||friendAttack>0)return;const targets=foes.filter(f=>f!==friend);if(!targets.length)return;targets.sort((a,b)=>(b.isBoss?1:0)-(a.isBoss?1:0)||friend.g.position.distanceTo(a.g.position)-friend.g.position.distanceTo(b.g.position));const target=targets[0],d=friend.g.position.distanceTo(target.g.position),hitDist=boarRadius(friend)+boarRadius(target)+.38;if(!boarsInContact(friend,target,.38))return;friendAttack=.72;const ax=target.g.position.x-friend.g.position.x,az=target.g.position.z-friend.g.position.z,al=Math.max(.01,Math.hypot(ax,az));target.b.rotation.x=-.24;friend.b.rotation.x=-.16;bossBattleImpact((friend.g.position.x+target.g.position.x)/2,(friend.g.position.z+target.g.position.z)/2);sound(target.isBoss?105:145,.18,'triangle');if(target.isBoss){target.hp--;bossHits++;statsData.bossHits++;bossRage=Math.min(2.35,bossRage+.12);moveBoarToward(target,target.g.position.x+ax/al*5,target.g.position.z+az/al*5,.95,1);target.stagger=Math.max(target.stagger||0,1.0);bossRepelsFriend(target,friend);notice(`🏇💥 Верхом! Друг ударил босса, а босс отшвыривает его! Осталось ${target.hp}/${target.maxHp}`);if(target.hp<=0){score+=diffScore(200);onBossDefeated(target)}}else if(target.isMinion){hitBossMinion(target,ax,az,al)}else{foes.splice(foes.indexOf(target),1);sendBoarAway(target,'defeated');levelBoarsDone++;statsData.minions++;score+=diffScore(25);softBoarDefeatSound();notice('🏇🐗 Друг отогнал враждебного кабанчика!')}friendHP=Math.max(0,friendHP-1);hud();if(friendHP<=0){const fallen=friend;mountedFriend=false;setRiderPose(false);friend=null;scene.remove(fallen.g);py=0;vy=0;boy.position.y=0;notice('💔 Кабанчик-друг пал в бою')}}
const DIFF_NAMES=['Я слишком мал, чтобы умереть','Не мучай меня, кабанчик','Ультра-кабан','Кошмар','НЕВОЗМОЖНО'];
const DIFF_SCORE=[.2,.33,.5,1,2];
const DIFF_CONFIG=[
 {enemyMult:.5,speedMult:.4,itemMult:2,playerHP:10,friendHP:10,foodMax:10},
 {enemyMult:.8,speedMult:.47,itemMult:1.4,playerHP:7,friendHP:7,foodMax:7},
 {enemyMult:1.3,speedMult:.57,itemMult:.8,playerHP:4,friendHP:4,foodMax:4},
 {enemyMult:1.8,speedMult:.67,itemMult:.5,playerHP:2,friendHP:2,foodMax:2},
 {enemyMult:2.5,speedMult:.8,itemMult:.2,playerHP:1,friendHP:1,foodMax:1}
];let selectedDiff=2;const diffCfg=()=>DIFF_CONFIG[selectedDiff],diffScore=v=>Math.round(v*DIFF_SCORE[selectedDiff]);
let level=1,food=4,score=0,familyFound=0,friend=null,friendHP=4,bossHits=0,levelTime=0,damage=0,paused=false;const levels=["🌲 Лес","🌊 Озеро","🏘️ Деревня","🏞️ Река","⛰️ Горы","👑 Кабанье логово"];let portalObj=null;const familyMembers=[];const crates=[];const shots=[];let audio=null,sfxEnabled=localStorage.getItem('kabanchiki3d_sfx')!=='0',musicEnabled=localStorage.getItem('kabanchiki3d_music')!=='0',throwCooldown=0,musicTimer=null,musicNote=0,forageTimer=18,friendAttack=0,hasFlashlight=false,flashlightObj=null,fireballs=[],levelBoarsTotal=0,levelBoarsDone=0,levelFamilyTotal=0,levelFamilyDone=0,familyPopupOpen=false,totalTime=0,yellowMushroomStock=0,yellowAppleStock=0,boarFormTime=0,boarFormVisual=null,catFormTime=0,catFormModel=null,statsData={fed:0,forage:0,berries:0,damage:0,family:0,minions:0,bossHits:0},endShown=false,bossRage=1,bossSummon=7,bossVictoryTimer=null,bossFireworkTimer=0,burningTrees=new Map(),charredStumps=[],resultSaving=false,resultLocalSaved=false,resultGlobalSaved=false;let soundscape=null;function audioBus(kind){soundscape??=new Soundscape(audio);return soundscape[kind]}
function effect(name){if(!sfxEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();soundscape??=new Soundscape(audio);soundscape.event(name)}catch{}}
function softEffectTone(freq,duration,type='sine',gain=.035,delay=0,endFreq=freq*.7){
 if(!sfxEnabled)return;
 try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();
  const t=audio.currentTime+delay,length=Math.max(.08,duration),attack=Math.min(.025,length*.20),release=.035;
  const o=audio.createOscillator(),filter=audio.createBiquadFilter(),g=audio.createGain();
  // Rounded waves and a low-pass filter remove the buzzy edges of combat and bonus sounds.
  o.type=type==='square'||type==='sawtooth'?'triangle':type;
  o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(45,endFreq),t+length);
  filter.type='lowpass';filter.frequency.setValueAtTime(Math.min(1800,Math.max(420,freq*2)),t);filter.Q.setValueAtTime(.5,t);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain,t+attack);
  g.gain.exponentialRampToValueAtTime(.0001,t+length);g.gain.linearRampToValueAtTime(0,t+length+release);
  o.connect(filter).connect(g).connect(audioBus('effects'));o.start(t);o.stop(t+length+release+.005);
 }catch{}
}
function softBoarDefeatSound(){softEffectTone(210,.24,'sine',.015,0,135)}function softBoarAttackSound(){softEffectTone(155,.22,'sine',.018,0,92)}function playerDamageSound(){softEffectTone(150,.23,'triangle',.035,0,72)}let lastDeathCause='boar',lastDeathBoar=null,deathSceneActive=false,deathSceneFinished=false;
function playerHitFeedback(cause='boar',attacker=null){lastDeathCause=cause;if(attacker)lastDeathBoar=attacker;playerDamageSound();const d=$('damageFlash'),h=$('hud');d.classList.remove('hit');h.classList.remove('hurt');void d.offsetWidth;d.classList.add('hit');h.classList.add('hurt');setTimeout(()=>{d.classList.remove('hit');h.classList.remove('hurt')},520)}function sound(freq=330,duration=.14,type="sine"){softEffectTone(freq,duration,type,.035)}function bonusSound(){[[520,0],[780,.10],[1040,.20],[390,.32]].forEach(([f,d])=>softEffectTone(f,.17,'sine',.024,d,f*1.10))}
// v157: rounded event transients and a shared compressor keep effects clear above the score.
// The music intentionally avoids bright bell/chiptune timbres; every voice passes through a low-pass filter.
const N={C3:131,D3:147,E3:165,F3:175,G3:196,A3:220,B3:247,C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784,A5:880,B5:988,C6:1047};
const MUSIC_THEMES=[
 {name:'forest',tempo:180,cutoff:1050,lead:[262,0,294,330,294,262,220,0,196,220,262,294,262,220,196,0,262,294,330,392,330,294,262,0,220,262,294,262,220,196,165,0,196,220,262,0,294,262,220,196,165,0,196,220,262,220,196,165,0,220,262,294,262,220,196,165,0,165,196,220,262,220,196,165,0],bass:[65,65,98,98,73,73,98,98,87,87,65,65,98,98,65,65],pad:[131,165,196],pulse:[131,196,165,196]},
 {name:'lake',tempo:188,cutoff:900,lead:[220,0,262,330,294,262,220,0,196,220,262,294,262,220,196,0,330,294,262,0,220,262,330,0,349,330,294,262,220,196,220,0,262,294,330,392,330,294,262,0,220,262,294,262,220,196,165,0,220,262,330,294,262,220,196,0,165,196,220,262,220,196,165,0],bass:[55,55,82,82,65,65,98,98,49,49,73,73,82,82,55,55],pad:[110,131,165],pulse:[110,165,131,165]},
 {name:'village',tempo:172,cutoff:1150,lead:[196,262,330,392,330,262,294,0,330,392,440,392,330,294,262,0,262,330,392,523,494,392,330,0,294,330,392,330,294,262,196,0,220,262,349,440,392,349,330,0,196,262,330,392,330,294,262,0,330,392,523,494,440,392,330,0,294,330,392,330,294,262,262,0],bass:[65,65,98,98,55,55,82,82,87,87,65,65,98,98,65,65],pad:[131,165,196],pulse:[131,196,165,196]},
 {name:'mountains',tempo:196,cutoff:850,lead:[165,0,247,330,294,247,220,0,196,220,247,294,247,220,196,0,330,392,494,440,392,330,294,0,247,294,330,392,330,294,247,0,220,247,294,330,294,247,220,0,196,247,330,294,247,220,196,0,247,294,392,330,294,247,220,0,196,220,247,294,247,220,165,0],bass:[41,41,62,62,49,49,73,73,55,55,41,41,62,62,41,41],pad:[82,98,123],pulse:[82,123,98,123]},
 {name:'boss',tempo:158,cutoff:720,lead:[165,0,165,196,220,196,165,0,147,165,196,247,220,196,165,0,165,196,247,262,247,220,196,0,175,220,262,247,220,196,175,0,165,165,196,220,247,220,196,0,147,175,220,262,247,220,196,0,165,196,247,330,294,247,220,0,196,220,247,196,165,147,165,0],bass:[41,41,49,49,55,55,49,49,36.5,36.5,41,41,31,31,41,41],pad:[82,98,123],pulse:[82,123,98,123]}
];
function musicTone(freq,duration=.18,type='triangle',gain=.014,when=0,cutoff=1000){
 if(!musicEnabled||!freq)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const t=audio.currentTime+when,o=audio.createOscillator(),f=audio.createBiquadFilter(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);f.type='lowpass';f.frequency.setValueAtTime(cutoff,t);f.Q.setValueAtTime(.7,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(f).connect(g).connect(audioBus('music'));o.start(t);o.stop(t+duration+.03)}catch{}
}
function musicNoise(duration=.045,gain=.006,when=0,cutoff=1200){if(!musicEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();const t=audio.currentTime+when,b=audio.createBuffer(1,Math.max(1,audio.sampleRate*duration),audio.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const n=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();n.buffer=b;f.type='lowpass';f.frequency.setValueAtTime(cutoff,t);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);n.connect(f).connect(g).connect(audioBus('music'));n.start(t)}catch{}}
function musicKick(when=0,gain=.022){if(!musicEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();const t=audio.currentTime+when,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(115,t);o.frequency.exponentialRampToValueAtTime(48,t+.11);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain*.8,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.13);o.connect(g).connect(audioBus('music'));o.start(t);o.stop(t+.14)}catch{}}
MUSIC_THEMES.splice(3,0,{...MUSIC_THEMES[1],name:'river'});
function musicStep(){if(!started||paused||win)return;const t=MUSIC_THEMES[level-1],i=musicNote++,step=i%64,beat=i%16;musicTone(t.lead[step],t.tempo/1000*.78,'triangle',level===6?.017:.021,0,t.cutoff);if(i%2===0)musicTone(t.bass[Math.floor(i/2)%t.bass.length],t.tempo/1000*1.85,'sawtooth',level===6?.020:.017,0,420);if(i%4===1)musicTone(t.pulse[Math.floor(i/2)%t.pulse.length],t.tempo/1000*.8,'triangle',.0075,0,700);if(i%8===0){for(let c=0;c<t.pad.length;c++)musicTone(t.pad[c],t.tempo/1000*3.2,'triangle',.0045,c*.01,620)}if(beat===0||beat===4||beat===8||beat===12)musicKick(0,level===6?.043:.034);if(beat===4||beat===12)musicNoise(.07,level===6?.010:.008,0,900);if(beat===2||beat===6||beat===10||beat===14)musicNoise(.025,.0032,0,1500)}
function startMusic(){if(!musicEnabled||musicTimer)return;musicNote=0;musicStep();const schedule=()=>{if(musicTimer)clearTimeout(musicTimer);const t=MUSIC_THEMES[Math.max(0,Math.min(5,level-1))];musicTimer=setTimeout(()=>{musicTimer=null;musicStep();schedule()},t.tempo)};schedule()}
function stopMusic(){if(musicTimer){clearTimeout(musicTimer);musicTimer=null}}
// v79: browser/app backgrounding must immediately release audio. On Android this also cooperates with phone-call audio focus.
let audioSuspendedByPage=false;async function suspendPageAudio(){audioSuspendedByPage=true;stopMusic();stopCinematicMusic();try{if(audio&&audio.state==='running')await audio.suspend()}catch{}}
async function resumePageAudio(){if(!audioSuspendedByPage||document.hidden)return;audioSuspendedByPage=false;try{if(audio&&audio.state==='suspended')await audio.resume()}catch{}if(started&&!paused&&!win&&musicEnabled&&!cinematicRunning)startMusic()}
document.addEventListener('visibilitychange',()=>document.hidden?suspendPageAudio():resumePageAudio());window.addEventListener('pagehide',suspendPageAudio);window.addEventListener('blur',suspendPageAudio);window.addEventListener('focus',()=>{if(!document.hidden)resumePageAudio()});
let cinematicMusicTimer=null,cinematicMusicStep=0,cinematicMusicKind='';
const INTRO_CINE_NOTES=[262,330,392,440,392,330,294,349,440,494,440,349,330,392,523,494];
const HAPPY_CINE_NOTES=[523,659,784,659,698,784,880,784,659,784,1047,988,880,784,659,523];
function stopCinematicMusic(){if(cinematicMusicTimer){clearInterval(cinematicMusicTimer);cinematicMusicTimer=null}cinematicMusicStep=0;cinematicMusicKind=''}
function cineMusicStep(){
 if(!cinematicRunning)return;
 const notes=cinematicMusicKind==='outro'?HAPPY_CINE_NOTES:INTRO_CINE_NOTES,f=notes[cinematicMusicStep++%notes.length];
 musicTone(f,cinematicMusicKind==='outro'?.34:.48,cinematicMusicKind==='outro'?'triangle':'sine',cinematicMusicKind==='outro'?.038:.026);
 if(cinematicMusicStep%4===1)musicTone(f/2,.65,'sine',.009)
}
function startCinematicMusic(kind){stopMusic();stopCinematicMusic();cinematicMusicKind=kind;cineMusicStep();cinematicMusicTimer=setInterval(cineMusicStep,kind==='outro'?270:360)}
function playDeathMusic(){
 stopMusic();stopCinematicMusic();
 // Мотив проигрыша из 2D: нисходящие 400 → 350 → 300 → 250 Гц.
 [400,350,300,250].forEach((f,i)=>setTimeout(()=>musicTone(f,.38,'sawtooth',.052),i*260))
}


function makeBoar(x,z,friendly){const g=group(x,z);const b=new THREE.Group();g.add(b);const aura=new THREE.Mesh(new THREE.RingGeometry(1.05,1.28,20),new THREE.MeshBasicMaterial({color:friendly?0x4cff72:0xff4b4b,transparent:true,opacity:.18,side:THREE.DoubleSide}));aura.rotation.x=-Math.PI/2;aura.position.y=.04;g.add(aura);const bolt=block(g,mats.gold,0,2.15,0,.18,.55,.18);bolt.rotation.z=.45;bolt.visible=false;block(b,friendly?mats.boar2:mats.boar,0,.65,0,1.2,.85,1.7);block(b,friendly?mats.boar2:mats.boar,0,.85,.83,1.04,.9,.9);block(b,mats.pink,0,.67,1.35,.67,.4,.25);for(const xx of [-.18,.18])block(b,mats.black,xx,.69,1.49,.075,.075,.025);for(const xx of [-.55,.55]){block(b,mats.white,xx,.64,1.18,.19,.3,.18);block(b,mats.boar,xx,1.32,.5,.32,.46,.18)}const eyes=[];for(const xx of [-.34,.34]){block(b,mats.white,xx,.98,1.29,.15,.15,.1);const eye=block(b,mats.black,xx,1,1.36,.07,.07,.04);eyes.push(eye);block(b,mats.boar,xx,.24,-.5,.25,.46,.3);block(b,mats.boar,xx,.24,.58,.25,.46,.3);block(b,mats.boar,xx,1.44,.65,.28,.42,.25)}block(b,mats.boar,0,.83,-1.02,.2,.22,.5);if(friendly){const mark=new THREE.Mesh(new THREE.RingGeometry(.18,.28,16),new THREE.MeshBasicMaterial({color:0x65ff7b,side:THREE.DoubleSide}));mark.position.set(0,2.05,0);mark.rotation.x=Math.PI/2;g.add(mark)}else{}
const earMat=new THREE.MeshLambertMaterial({color:friendly?0x7a5638:0x5b3b2b}),tuskMat=new THREE.MeshLambertMaterial({color:0xf1e1bd}),hoofMat=new THREE.MeshLambertMaterial({color:0x2b211c});
for(const sx of [-1,1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.19,.42,4),earMat);ear.position.set(sx*.52,1.52,.52);ear.rotation.z=sx*.34;ear.rotation.x=-.12;b.add(ear);const tusk=new THREE.Mesh(new THREE.ConeGeometry(.075,.30,6),tuskMat);tusk.position.set(sx*.35,.83,1.38);tusk.rotation.x=Math.PI/2;b.add(tusk)}
for(const sx of [-1,1])for(const zz of [-.48,.48])block(b,hoofMat,sx*.52,.13,zz,.34,.25,.42);
const tailPivot=new THREE.Group();tailPivot.position.set(0,.92,-1.18);const tail=block(tailPivot,earMat,0,.12,-.18,.12,.12,.48);tail.rotation.x=.45;b.add(tailPivot);
// Shared geometry and materials keep the extra fur inexpensive.
const furMat=friendly?mats.boar2:mats.boar;
for(let i=0;i<9;i++){const tuft=block(b,furMat,0,1.13+(i%3)*.035,-.78+i*.18,.32,.24+(i%2)*.08,.22);tuft.rotation.x=-.24}
for(const sx of [-1,1])for(let i=0;i<5;i++){const tuft=block(b,furMat,sx*.59,.62+(i%2)*.18,-.65+i*.29,.14,.24,.25);tuft.rotation.z=sx*.22}
block(b,furMat,0,.79,1.38,.72,.42,.14);
for(const sx of [-1,1]){block(b,mats.black,sx*.18,.80,1.46,.10,.10,.025);const brow=block(b,furMat,sx*.34,1.14,1.32,.27,.09,.14);brow.rotation.z=sx*(friendly?.08:-.20)}
const enemyEyeMat=new THREE.MeshStandardMaterial({color:0xff342c,emissive:0xff1008,emissiveIntensity:3,roughness:.5});
const enemyEyes=[];for(const sx of [-1,1]){const e=block(b,enemyEyeMat,sx*.34,1.0,1.39,.13,.12,.035);e.visible=!friendly;enemyEyes.push(e)}
const jaw=block(b,furMat,0,.48,1.31,.64,.15,.30);const mouthful=new THREE.Group();mouthful.position.set(0,.48,1.53);for(let i=0;i<5;i++){const blade=block(mouthful,mats.grass,(i-2)*.065,0,0,.035,.32,.025);blade.rotation.z=(i-2)*.3}mouthful.visible=false;b.add(mouthful);g.userData.grazingJaw=jaw;g.userData.grazingGrass=mouthful;g.userData.enemyEyes=enemyEyes;
g.userData.visualRemaster=true;g.userData.tailPivot=tailPivot;g.traverse(o=>{if(o.isMesh){o.castShadow=!mobile;o.receiveShadow=!mobile}});
return {g,b,aura,bolt,eyes,x,z,friendly,done:false,angle:rand(0,7),phase:rand(0,7),attackCd:0,idleTimer:rand(1,4),blinkTimer:rand(1,4),graze:0,roamTimer:rand(1,4),roamX:x,roamZ:z,roamPause:rand(.4,1.8)}}const friends=[];const foes=[];const defeatedBoars=[];const apples=[]; // природные припасы: яблоки, грибы, капуста и лечебные ягоды
function updateBoarChewing(f,now,active){const jaw=f.g.userData.grazingJaw,grass=f.g.userData.grazingGrass;if(!jaw||!grass)return;grass.visible=active;const chew=active?Math.sin(now*.018+f.phase):0;jaw.position.y=.48+chew*.045;jaw.position.x=chew*.035;grass.rotation.z=chew*.12;grass.position.y=.48+chew*.045;if(active){f.b.rotation.x=.34+Math.sin(now*.004+f.phase)*.035;f.b.position.y=-.10}}
function clearEntities(arr){for(const o of arr)scene.remove(o.g);arr.length=0}
function softCrateSound(){if(!sfxEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const t=audio.currentTime;[[330,0,.16,.016],[440,.09,.20,.012],[554,.18,.24,.009]].forEach(([freq,delay,dur,gain])=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,t+delay);o.frequency.exponentialRampToValueAtTime(freq*.92,t+delay+dur);g.gain.setValueAtTime(.0001,t+delay);g.gain.exponentialRampToValueAtTime(gain,t+delay+.035);g.gain.exponentialRampToValueAtTime(.0001,t+delay+dur);o.connect(g).connect(audioBus('effects'));o.start(t+delay);o.stop(t+delay+dur+.03)})}catch{}}
function makeForage(type,x,z,y=0,bonus=false){const g=group(x,z);g.position.y=y+(y===0?terrainHeightAt(x,z):0);if(type==='berry'||type==='catberry'){const leaf=new THREE.MeshLambertMaterial({color:bonus?0xc6b42c:0x3f8b45}),berry=new THREE.MeshLambertMaterial({color:type==='catberry'?0xff86c5:bonus?0xffe33b:0x4d3ca6});block(g,leaf,0,.16,0,.65,.22,.65);for(const [bx,bz] of [[-.22,-.12],[.18,-.18],[-.12,.18],[.24,.16]])sphere(g,berry,bx,.34,bz,.13)}else{const model=makeFoodModel(type,g,0,.30,0);model.scale.setScalar(1.25);if(bonus)model.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();if(o.material.color)o.material.color.set(type==='apple'?0xffdc32:0xffe13b)}})}if(bonus){const glow=new THREE.PointLight(0xffdf45,3.5,4);glow.position.y=.55;g.add(glow)}apples.push({g,x,z,y,type,done:false,bonus:!!bonus})}
function safeForageSpot(){for(let tries=0;tries<90;tries++){const x=rand(-34,34),z=rand(-35,27);if(Math.abs(x)<3.4)continue;if(level===4&&Math.abs(z-riverCenterAt(x))<4.7)continue;if(level===2&&(lakeRadiusAt(x,z)<15.8||lakeInletDepthAt(x,z)>.001))continue;if(Math.hypot(x,z-4)<6)continue;if(level===3&&houseObjects.some(h=>{if(!h.visible)return false;const b=new THREE.Box3().setFromObject(h);return x>b.min.x-1.4&&x<b.max.x+1.4&&z>b.min.z-1.4&&z<b.max.z+1.4}))continue;if(treePositions.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<1.5))continue;if(rockPositions.some(([rx,rz,r])=>Math.hypot(x-rx,z-rz)<r+1.1))continue;return [x,z]}return [rand(-25,25),rand(-28,20)]}
function branchApplePoint(br){
 // v117: fruit twigs grow OUTWARD from the visible trunk. The apple center is beyond the trunk silhouette,
 // never buried inside the wood, while keeping the fruit low enough to collect by a normal jump.
 if(!br||br.visible===false||!br.parent)return null;const tree=br.parent;if(tree.visible===false||!tree.userData?.isTree)return null;
 tree.updateWorldMatrix(true,true);const trunk=tree.children.find(o=>o.isMesh&&o.geometry===trunkGeo),trunkR=trunk?treeTrunkShape(trunk).r:.66;
 const a=rand(0,Math.PI*2),len=rand(.62,.82),out=new THREE.Vector3(Math.cos(a),0,Math.sin(a)),twig=new THREE.Mesh(branchGeo,mats.wood);twig.userData.appleTwig=true;twig.userData.appleBranch=true;twig.userData.appleTree=tree;
 const branchY=rand(2.22,2.24),startR=trunkR+.08;twig.position.set(out.x*(startR+len*.5),branchY/tree.scale.y,out.z*(startR+len*.5));twig.scale.set(.16,len,.16);twig.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),out);
 tree.add(twig);treeBranchMeshes.push(twig);tree.updateWorldMatrix(true,true);twig.updateWorldMatrix(true,false);
 const tip=new THREE.Vector3(0,.5,0).applyMatrix4(twig.matrixWorld),appleY=tip.y-.16;
 if(appleY<2.05||appleY>2.08||(level===4&&Math.abs(tip.z-riverCenterAt(tip.x))<4.8)){tree.remove(twig);const i=treeBranchMeshes.indexOf(twig);if(i>=0)treeBranchMeshes.splice(i,1);return null}
 return [tip.x,tip.z,appleY,twig,tree]
}
function appleTreeSpot(){const candidates=[];for(const br of treeBranchMeshes){if(!br?.parent||br.userData.appleTwig||br.parent.visible===false||!br.parent.userData?.isTree)continue;br.parent.updateWorldMatrix(true,true);const wp=new THREE.Vector3();br.getWorldPosition(wp);if(Math.abs(wp.x)>35||Math.abs(wp.z)>35||Math.hypot(wp.x,wp.z-4)<7||(level===4&&Math.abs(wp.z-riverCenterAt(wp.x))<6.0))continue;candidates.push(br)}if(!candidates.length)return null;return branchApplePoint(candidates[Math.floor(Math.random()*candidates.length)])}
const BONUS_FORAGE_CHANCE=1/20;
const BERRY_BONUS_CHANCE=1/10; // v144: yellow berries are easier to encounter
function spawnForage(type){type=type||['apple','mushroom','cabbage'][Math.floor(Math.random()*3)];if(level===2&&type==='mushroom')type='cabbage';if(type==='apple'){const spot=appleTreeSpot();if(spot){const [x,z,y,branch,tree]=spot;const bonus=Math.random()<BONUS_FORAGE_CHANCE;makeForage('apple',x,z,y,bonus);const a=apples[apples.length-1];a.branch=branch;a.tree=tree;a.g.userData.appleBranch=branch;a.g.userData.appleTree=tree;return}type=level===2?'cabbage':Math.random()<.5?'mushroom':'cabbage'}const [x,z]=safeForageSpot();if(type==='berry'&&isCatBerryRoll(Math.random())){makeForage('catberry',x,z);return}const bonus=type==='berry'?Math.random()<BERRY_BONUS_CHANCE:type==='mushroom'&&Math.random()<BONUS_FORAGE_CHANCE;makeForage(type,x,z,0,bonus)}
function seedForage(){for(const a of apples)scene.remove(a.g);apples.length=0;['apple','mushroom','cabbage','apple','mushroom','cabbage','berry','berry'].forEach((t,i)=>spawnForage(t));forageTimer=rand(14,22)}
function makeCrate(x,z,drop=false){const g=group(x,z);block(g,mats.wood,0,.45,0,1.0,.9,1.0);for(const q of [-.42,.42]){block(g,mats.gold,q,.45,.51,.08,.78,.06);block(g,mats.gold,.51,.45,q,.06,.78,.08)}block(g,mats.gold,0,.45,.52,.82,.09,.06);g.position.y=drop?12:0;crates.push({g,x,z,done:false,dropping:drop})}
function makeMother(){
 const g=new THREE.Group();
 // ноги и обувь
 block(g,mats.black,-.18,.34,0,.28,.68,.34);block(g,mats.black,.18,.34,0,.28,.68,.34);
 // платье: верх + расширенная юбка, чтобы силуэт не был копией Тимура
 block(g,mats.red,0,1.16,0,.82,.82,.48);
 block(g,mats.red,0,.82,0,1.02,.58,.58);
 // голова
 block(g,mats.skin,0,1.92,0,.72,.72,.66);
 // длинные волосы: верх, затылок и боковые пряди
 block(g,mats.hair,0,2.32,-.04,.80,.22,.72);
 block(g,mats.hair,0,1.88,-.34,.78,.82,.16);
 block(g,mats.hair,-.39,1.84,-.05,.16,.72,.48);
 block(g,mats.hair,.39,1.84,-.05,.16,.72,.48);
 // руки
 block(g,mats.skin,-.56,1.22,0,.22,.72,.23);block(g,mats.skin,.56,1.22,0,.22,.72,.23);
 // глаза и улыбка
 for(const x of [-.17,.17])block(g,mats.black,x,1.99,.35,.075,.09,.035);
 block(g,mats.pink,0,1.77,.35,.24,.055,.035);
 return g
}
function makeGrandmother(){
 const g=new THREE.Group();
 // обувь и длинное платье
 block(g,mats.black,-.17,.28,0,.27,.56,.34);block(g,mats.black,.17,.28,0,.27,.56,.34);
 block(g,mats.pink,0,.92,0,1.02,1.05,.60);
 block(g,mats.pink,0,1.43,0,.80,.48,.50);
 // голова
 block(g,mats.skin,0,1.98,0,.72,.70,.66);
 // седые волосы и пучок
 const gray=new THREE.MeshLambertMaterial({color:0xbfc1c5,map:mats.hair.map});
 block(g,gray,0,2.34,-.04,.80,.22,.72);
 block(g,gray,0,2.03,-.34,.78,.54,.16);
 block(g,gray,-.39,2.02,-.04,.16,.50,.46);block(g,gray,.39,2.02,-.04,.16,.50,.46);
 sphere(g,gray,0,2.42,-.25,.22);
 // руки
 block(g,mats.skin,-.55,1.39,0,.21,.66,.22);block(g,mats.skin,.55,1.39,0,.21,.66,.22);
 // глаза, очки и улыбка
 for(const x of [-.17,.17]){block(g,mats.black,x,2.03,.35,.065,.075,.03);const rim=new THREE.Mesh(new THREE.TorusGeometry(.13,.025,6,12),new THREE.MeshBasicMaterial({color:0x5b4636}));rim.position.set(x,2.03,.385);g.add(rim)}
 block(g,new THREE.MeshLambertMaterial({color:0x5b4636}),0,2.03,.385,.12,.025,.025);
 block(g,mats.pink,0,1.82,.35,.22,.05,.03);
 return g
}
function makeFamily(x,z,forcedRole=null){const g=group(x,z);g.position.y=terrainHeightAt(x,z);const role=forcedRole===null?(familyFound+familyMembers.length)%4:forcedRole;let person;
 if(role===0){person=makeMother();person.scale.setScalar(.72)}
 else if(role===3){person=makeGrandmother();person.scale.setScalar(.70)}
 else{person=makeBoy();person.scale.setScalar([1,.46][role-1]);person.children[2].material=[mats.leaf,mats.gold][role-1]}
 g.add(person);const familyMarker=sphere(g,mats.gold,0,role===1?3.15:2.5,0,.2);familyMarker.userData.familyMarker=true;familyMembers.push({g,x,z,done:false,role,person,familyMarker})}
function makePortal(){
 const g=group(0,-42),frameMat=new THREE.MeshStandardMaterial({color:0x51465f,roughness:.94,map:mats.stone.map});
 // A stepped stone arch frames the luminous opening; gameplay trigger stays at the same point.
 for(const sx of [-1,1]){for(let j=0;j<6;j++)block(g,frameMat,sx*1.38,.30+j*.52,0,.62,.50,.72);block(g,frameMat,sx*1.72,.16,0,1.0,.32,1.12)}
 block(g,frameMat,0,3.25,0,3.35,.62,.82);block(g,frameMat,0,3.68,0,2.15,.25,.68);
 const runeMat=new THREE.MeshBasicMaterial({color:0xdd9aff});for(const sx of [-1,1])for(let j=0;j<3;j++)block(g,runeMat,sx*1.38,.80+j*.78,.37,.10,.26,.025);
 const ring=new THREE.Mesh(new THREE.PlaneGeometry(2.13,2.72),new THREE.MeshBasicMaterial({color:0x8b20ff,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}));ring.position.set(0,1.63,-.035);g.add(ring);
 const portalHalo=visualOnly(()=>new THREE.Sprite(new THREE.SpriteMaterial({map:softGlowTexture,color:0xb44aff,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false})));portalHalo.position.set(0,1.7,.10);portalHalo.scale.set(5.8,6.1,1);g.add(portalHalo);
 const core=new THREE.Mesh(new THREE.PlaneGeometry(1.95,2.58),new THREE.MeshBasicMaterial({map:portalTexture(),color:0xffffff,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));core.position.set(0,1.63,.02);g.add(core);
 const glow=new THREE.PointLight(0xb44aff,7,13,1.6);glow.position.set(0,1.8,.65);g.add(glow);portalObj={g,ring,core,glow};g.visible=false
}
function portalTexture(){const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=(x-size/2)/(size/2),v=(y-size/2)/(size/2),wave=(Math.sin(u*10+Math.sin(v*8)*2)+Math.cos(v*12-u*5))*.25+.5;const i=(y*size+x)*4;data[i]=125+wave*115;data[i+1]=25+wave*75;data[i+2]=255;data[i+3]=230}const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t}

const handFlashlight=new THREE.Group();boy.add(handFlashlight);handFlashlight.visible=false;const flashlightBodyMat=new THREE.MeshStandardMaterial({color:0x424f57,metalness:.55,roughness:.4}),flashlightLensMat=new THREE.MeshBasicMaterial({color:0xfff0b7});block(handFlashlight,flashlightBodyMat,0,0,0,.25,.25,.56);block(handFlashlight,mats.gold,0,0,.16,.28,.28,.11);const handLens=new THREE.Mesh(new THREE.CircleGeometry(.13,12),flashlightLensMat);handLens.position.z=.295;handFlashlight.add(handLens);
function updateHandFlashlight(){
 handFlashlight.visible=hasFlashlight&&boarFormTime<=0&&catFormTime<=0&&!cinematicRunning;if(!handFlashlight.visible){torch.intensity=0;return}
 const arm=boy.children[6];arm.rotation.x=-.55;arm.rotation.z=-.12;boy.updateWorldMatrix(true,true);const wrist=arm.localToWorld(new THREE.Vector3(0,-.5,0));handFlashlight.position.copy(boy.worldToLocal(wrist.clone()));handFlashlight.position.z+=.23;handFlashlight.updateWorldMatrix(true,true);handLens.getWorldPosition(torch.position);const forward=new THREE.Vector3(Math.sin(boy.rotation.y),-.035,Math.cos(boy.rotation.y));torch.target.position.copy(torch.position).addScaledVector(forward,14);torch.intensity=level>=4?42:16;
}

const winterRoadMaterial=new THREE.MeshLambertMaterial({color:0xe1eaf0}),iceWaterMaterial=new THREE.MeshPhongMaterial({color:0xbcdce8,transparent:true,opacity:.94,shininess:75,specular:0xffffff,side:THREE.DoubleSide});
const birdLife=new BirdLife(THREE,scene,mobile);const catLife=new CatLife(THREE,scene,mobile);
function resetCats(){const houses=houseObjects.filter(h=>h.visible&&!h.userData.enterable).map(h=>{h.updateWorldMatrix(true,true);const roof=h.children.filter(m=>m.isMesh&&(seasonBaseMaterials.get(m)||m.material).map===mats.roof.map).sort((a,b)=>b.position.y-a.position.y)[0];const b=new THREE.Box3().setFromObject(roof||h),c=new THREE.Vector3();b.getCenter(c);const full=new THREE.Box3().setFromObject(h);return {exit:{x:full.max.x+1,z:(full.min.z+full.max.z)/2},x:c.x,z:c.z,y:b.max.y,w:b.max.x-b.min.x,d:b.max.z-b.min.z}});const objects=[...treeSolidMeshes.filter(m=>m.parent?.visible).map(m=>treeTrunkShape(m)),...rockPositions.filter(q=>q[3]?.visible).map(q=>({x:q[0],z:q[1],r:q[2]})),...houses.map(h=>({x:h.x,z:h.z,r:h.w*.6}))];const trunks=treeSolidMeshes.filter(m=>m.parent?.visible).map(m=>treeTrunkShape(m)),rocks=rockPositions.filter(q=>q[3]?.visible).map(q=>({x:q[0],z:q[1],r:q[2]})),walls=wallGeometry();catLife.reset(currentSeason==='winter'?0:level,houses,objects,terrainHeightAt,(x,z)=>trunks.some(t=>Math.hypot(x-t.x,z-t.z)<t.r+.22)||rocks.some(t=>Math.hypot(x-t.x,z-t.z)<t.r+.22)||walls.some(w=>polygonContact(w.polygon,x,z,.22)));}
const seasonVisual=new THREE.Group();scene.add(seasonVisual);
const seasonBaseMaterials=new WeakMap(),seasonMaterialCache=new WeakMap();
const seasonTextures={spring:{grass:pixelTexture(164,[127,178,84],[76,133,54],'grass'),leaf:pixelTexture(165,[148,194,76],[73,148,58],'grass'),leaf2:pixelTexture(166,[179,215,112],[113,174,71],'grass')},autumn:{grass:pixelTexture(157,[169,119,56],[121,79,38],'grass'),leaf:pixelTexture(158,[214,133,40],[155,57,30],'grass'),leaf2:pixelTexture(159,[227,176,67],[179,97,34],'grass')},winter:{grass:pixelTexture(160,[232,240,247],[195,210,223],'noise'),leaf:pixelTexture(161,[218,230,235],[151,179,184],'grass'),leaf2:pixelTexture(162,[241,244,247],[188,208,216],'grass')}};
const snowCount=mobile?550:1250,snowPositions=new Float32Array(snowCount*3);for(let i=0;i<snowCount;i++){snowPositions[i*3]=rand(-26,26);snowPositions[i*3+1]=rand(0,28);snowPositions[i*3+2]=rand(-26,26)}
const snowGeometry=new THREE.BufferGeometry();snowGeometry.setAttribute('position',new THREE.BufferAttribute(snowPositions,3));const snowPixels=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const i=(y*32+x)*4,r=Math.hypot(x-15.5,y-15.5)/15.5;snowPixels[i]=snowPixels[i+1]=snowPixels[i+2]=255;snowPixels[i+3]=Math.round(Math.max(0,Math.min(1,(1-r)*3))*255)}const snowMap=new THREE.DataTexture(snowPixels,32,32,THREE.RGBAFormat);snowMap.needsUpdate=true;const snowMaterial=new THREE.PointsMaterial({map:snowMap,color:0xf4f8ff,size:.16,transparent:true,opacity:.92,depthWrite:false});const snowGroup=new THREE.Points(snowGeometry,snowMaterial);snowGroup.visible=false;scene.add(snowGroup);
function seasonalMaterial(mesh,kind,index=0){
 let original=seasonBaseMaterials.get(mesh);if(!original){original=mesh.material;seasonBaseMaterials.set(mesh,original)}
 if(currentSeason==='summer'){mesh.material=original;return}
 let variants=seasonMaterialCache.get(original);if(!variants){variants={};seasonMaterialCache.set(original,variants)}const key=currentSeason+kind+index%3;
 if(!variants[key]){const m=original.clone();if(kind==='grass'||kind==='leaf'||kind==='leaf2'){m.map=seasonTextures[currentSeason][kind];m.color.set(0xffffff)}else if(kind==='snowstone'){m.map=seasonTextures.winter.grass;m.color.set(0xe5edf5)}else m.color.set(currentSeason==='spring'?0x9ac75d:currentSeason==='winter'?0xd3e2e5:[0xbf7134,0xd99b3c,0x9e512c][index%3]);m.needsUpdate=true;variants[key]=m}mesh.material=variants[key];
}
let springBloomTime=0;
function updateSpringBloom(dt){if(currentSeason!=='spring')return;springBloomTime=Math.min(60,springBloomTime+dt);const k=.3+.7*(springBloomTime/60);for(const t of treeObjects)t.traverse(m=>{if(m.userData.springCrown)m.scale.copy(m.userData.fullCrownScale).multiplyScalar(k)})}
let christmasSolid=null;
function applySeason(){
 worldEpoch++;if(christmasSolid){treeSolidMeshes.splice(treeSolidMeshes.indexOf(christmasSolid),1);christmasSolid=null}
 syncSeasonChoices();springBloomTime=0;for(const t of treeObjects)t.traverse(m=>{if(m.userData.springCrown)m.scale.copy(m.userData.fullCrownScale).multiplyScalar(currentSeason==='spring'?.3:1)});
 while(seasonVisual.children.length){const o=seasonVisual.children[0];seasonVisual.remove(o);o.geometry?.dispose();o.material?.dispose()}
 snowGroup.visible=false;weatherGroup.visible=false;winterDrifts.length=0;winterSnowMinute=-1;
 const frozen=currentSeason==='winter';roadSurface.material=frozen?winterRoadMaterial:mats.path;roadEdge.material=frozen?winterRoadMaterial:pathEdgeMat;for(const m of [lake,riverWater,tributaryWater]){if(!m.isMesh)continue;if(!m.userData.liquidMaterial)m.userData.liquidMaterial=m.material;m.material=frozen?iceWaterMaterial:m.userData.liquidMaterial}lakeWaves.forEach(m=>m.visible=!frozen);tributaryFlow.forEach(m=>m.visible=!frozen);for(const m of lakeVisual.children)if(m.userData.lily)m.visible=!frozen;
 scene.traverse(mesh=>{if(!mesh.isMesh||!mesh.material||Array.isArray(mesh.material))return;const base=seasonBaseMaterials.get(mesh)||mesh.material;for(const kind of ['grass','leaf','leaf2'])if(base.map===mats[kind].map){seasonalMaterial(mesh,kind);break}if(base.map===mats.roof.map||base.map===mats.stone.map){if(currentSeason==='winter')seasonalMaterial(mesh,'snowstone');else if(seasonBaseMaterials.has(mesh))mesh.material=base}});
 for(let i=0;i<treeObjects.length;i++)treeObjects[i].traverse(mesh=>{if(!mesh.isMesh||!mesh.material?.color)return;const base=seasonBaseMaterials.get(mesh)||mesh.material,hsl={};base.color.getHSL(hsl);if(hsl.h>.16&&hsl.h<.49&&hsl.s>.18)seasonalMaterial(mesh,'foliage',i)});
 forestGround.children.forEach(m=>m.visible=currentSeason!=='winter');for(const mesh of [grassBlades,...forestGround.children.filter(m=>(seasonBaseMaterials.get(m)||m.material)===mossMat||(seasonBaseMaterials.get(m)||m.material)===darkGrassMat)])seasonalMaterial(mesh,'foliage');
 grassBlades.visible=(currentSeason==='summer'||currentSeason==='spring');forestVisual.children.filter(g=>g.userData.seasonPlant).forEach(g=>g.visible=currentSeason==='summer'||currentSeason==='spring');ground.material.color.set(currentSeason==='summer'?[0xffffff,0xffead0,0xd9f0cf,0xd3e6cc,0xaeb3b6,0x76636b][level-1]:0xffffff);stormLeafMat.color.set(currentSeason==='autumn'?0xc7772d:currentSeason==='winter'?0xddeaf2:0x6f8f35);
 if(currentSeason!=='summer'){
  ground.material.color.set(0xffffff);
  stormLeafMat.color.set(currentSeason==='autumn'?0xc7772d:0xddeaf2);
  if(currentSeason==='spring'){addSpringFlowers()}else if(currentSeason==='autumn'){
   const g=new THREE.PlaneGeometry(.23,.12),m=new THREE.MeshLambertMaterial({color:0xd69a3d,side:THREE.DoubleSide});const leaves=new THREE.InstancedMesh(g,m,mobile?160:400),d=new THREE.Object3D();for(let i=0;i<leaves.count;i++){const x=Math.sin(i*71.7)*41,z=Math.cos(i*32.9)*41;d.position.set(x,terrainHeightAt(x,z)+.025,z);d.rotation.set(-Math.PI/2,0,i*2.13);d.updateMatrix();leaves.setMatrixAt(i,d.matrix)}leaves.instanceMatrix.needsUpdate=true;seasonVisual.add(leaves)
  }else if(currentSeason==='winter'){
   addChristmasTree();addWinterRoadBorders();
   scene.background.lerp(new THREE.Color(level>=5?0x39445e:0xc8d7e1),.55);scene.fog.color.copy(scene.background);scene.fog.far=level>=5?48:68;hemi.intensity=Math.max(hemi.intensity,.55);snowGroup.visible=true;
  }
 }
 syncMeadowGrass();resetCats();tagStormTargetsForCurrentLocation();birdLife.reset(currentSeason,treeObjects.filter(t=>t.visible),level===3?catLife.houses.map(h=>({x:h.x,z:h.z,y:h.y+.12})):[]);weatherBaseSky=scene.background.clone();
}
function growSnowDrifts(minute){if(minute<1)return;while(winterDrifts.length<Math.min(24,minute*6)){const i=winterDrifts.length;let found=null;for(let n=0;n<500;n++){const x=rand(-37,37),z=rand(-37,35);if(Math.abs(x)<7||(level===2&&(lakeRadiusAt(x,z)<16.5||lakeInletDepthAt(x,z)>0))||(level===4&&Math.abs(z-riverCenterAt(x))<7)||worldObstacleAt(x,z,1.8)||winterDrifts.some(d=>Math.hypot(d.x-x,d.z-z)<5))continue;found={x,z};break}if(!found)break;const r=rand(1.2,2.5),m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),winterRoadMaterial);m.position.set(found.x,worldSurface.height(found.x,found.z)-.015,found.z);m.receiveShadow=!mobile;seasonVisual.add(m);winterDrifts.push({...found,r,height:0,m})}for(const d of winterDrifts){d.height=.16+minute*.17;d.m.scale.set(d.r,d.height,d.r)}const p=surfaceGeometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,groundSurfaceHeightAt(p.getX(i),-p.getY(i)));p.needsUpdate=true;surfaceGeometry.computeVertexNormals()}
function updateSnow(dt,now){
 const minute=Math.min(4,Math.floor(levelTime/60));weatherStage=Math.min(4,minute+1);if(minute!==winterSnowMinute){winterSnowMinute=minute;growSnowDrifts(minute);if(minute>0)notice('❄️ Снегопад усиливается, сугробы растут!')}scene.fog.far=Math.max(level>=5?28:36,(level>=5?48:68)-minute*7);snowMaterial.size=.13+minute*.018;
 nextLightningAt=0;lightningFlash=0;lightningSky.intensity=0;lightningSun.intensity=0;hurricaneCarry=0;weatherGroup.visible=false;snowGroup.visible=true;snowGroup.position.set(boy.position.x,0,boy.position.z);snowGeometry.setDrawRange(0,Math.floor(snowCount*graphicsParticleFactor*Math.min(1,.35+minute*.2)));for(let i=0;i<snowCount;i++){const j=i*3;snowPositions[j]+=dt*(1.5+Math.sin(now*.001+i)*.75);snowPositions[j+1]-=dt*(3.2+minute*.8+(i%7)*.22);snowPositions[j+2]+=dt*(2.4+Math.cos(now*.0012+i)*.45);if(snowPositions[j+1]<-.5){snowPositions[j]=rand(-26,26);snowPositions[j+1]=rand(23,29);snowPositions[j+2]=rand(-26,26)}if(snowPositions[j]>26)snowPositions[j]=-26;if(snowPositions[j+2]>26)snowPositions[j+2]=-26}snowGeometry.attributes.position.needsUpdate=true;updateStormClouds(dt,now);for(const cloud of weatherClouds)if(cloud.visible)cloud.userData.cloudMat.color.set(0xcdd8e2);updateStormFires(dt,now);
}


// Bounded pools: water animation never allocates meshes in the frame loop.
const waterFxRoot=new THREE.Group();scene.add(waterFxRoot);const sprayPool=[],rainRingPool=[];
const sprayGeo=new THREE.SphereGeometry(.035,5,4),ringGeo=new THREE.RingGeometry(.92,1,24);
for(let i=0;i<(mobile?48:96);i++){const m=new THREE.Mesh(sprayGeo,new THREE.MeshBasicMaterial({color:0xc5eef5,transparent:true,opacity:.8,depthWrite:false}));m.visible=false;waterFxRoot.add(m);sprayPool.push({m,t:0,v:new THREE.Vector3()})}
for(let i=0;i<(mobile?24:48);i++){const m=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0xccebf0,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.visible=false;waterFxRoot.add(m);rainRingPool.push({m,t:0})}
let sprayCursor=0,ringCursor=0,rainRippleClock=0,wetStepDistance=0,wetLast=null;
function spawnWaterRing(x,z,y,size=1){const q=rainRingPool[ringCursor++%rainRingPool.length];q.t=.7;q.size=size;q.m.position.set(x,y+.015,z);q.m.visible=true;q.m.scale.setScalar(.06)}
function spawnWaterSplash(x,z,power=1){const water=waterAt(x,z);if(!water)return;for(let i=0;i<Math.round(8*power);i++){const q=sprayPool[sprayCursor++%sprayPool.length],a=i*2.399;q.t=.6+.15*power;q.m.position.set(x,water.y+.03,z);q.v.set(Math.cos(a)*(.5+power*.65),1+power*.9,Math.sin(a)*(.5+power*.65));q.m.visible=true}spawnWaterRing(x,z,water.y,power*.65);effect('splash')}
function updateWaterEffects(dt,now){const active=started&&!paused&&!win&&!endShown;waterFxRoot.visible=!cinematicRunning;
 for(const q of sprayPool)if(q.t>0){q.t-=dt;q.v.y-=dt*7;q.m.position.addScaledVector(q.v,dt);q.m.material.opacity=Math.max(0,q.t);q.m.visible=q.t>0}
 for(const q of rainRingPool)if(q.t>0){q.t-=dt;q.m.visible=q.t>0;q.m.scale.setScalar((.1+(1-q.t/.7)*.7)*q.size);q.m.material.opacity=Math.max(0,q.t*.65)}
 if(!active){wetLast=null;return}const x=boy.position.x,z=boy.position.z;if(wetLast){const d=Math.hypot(x-wetLast.x,z-wetLast.z);if(d<2)wetStepDistance+=d;else wetStepDistance=0}wetLast={x,z};if(wetStepDistance>.65&&walkingInWater(x,z)&&Math.abs(vy)<2){wetStepDistance=0;spawnWaterSplash(x,z,mountedFriend?1.35:.65)}
 if(currentSeason!=='winter'&&weatherStage>=1){rainRippleClock+=dt*(weatherStage*10);while(rainRippleClock>=1){rainRippleClock--;let x,z;const visible=puddleObjects.filter(p=>p.visible);if(visible.length&&Math.random()<.55){const p=visible[Math.floor(Math.random()*visible.length)],a=Math.random()*6.28,r=Math.sqrt(Math.random())*p.scale.x*.8;x=p.position.x+Math.cos(a)*r;z=p.position.z+Math.sin(a)*r}else{x=boy.position.x+rand(-15,15);z=boy.position.z+rand(-15,15)}const w=waterAt(x,z);if(w)spawnWaterRing(x,z,w.y,.4+Math.random()*.6)}}
}
const fishingRig=new THREE.Group();boy.add(fishingRig);fishingRig.visible=false;
const rod=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,3.2,6),new THREE.MeshLambertMaterial({color:0x6c4324}));rod.position.set(-.7,2.15,.85);rod.rotation.x=-.75;fishingRig.add(rod);
const fishingLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0xc2d8d7,transparent:true,opacity:.65}));scene.add(fishingLine);fishingLine.visible=false;
const fishingFloat=new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),new THREE.MeshBasicMaterial({color:0xed765a}));scene.add(fishingFloat);fishingFloat.visible=false;
const caughtFish=new THREE.Mesh(new THREE.SphereGeometry(.17,8,6),new THREE.MeshLambertMaterial({color:0xb3d4c1}));caughtFish.scale.set(.55,.6,1.6);scene.add(caughtFish);caughtFish.visible=false;
let fishStock=0,fishingNextBite=10;let fishingIdle=0,fishingTime=0,fishingTarget=null,fishingPrevious=null,fishingCatch=-1;
function stopFishing(){fishingRig.visible=fishingLine.visible=fishingFloat.visible=caughtFish.visible=false;fishingTarget=null;fishingTime=0;fishingIdle=0;fishingPrevious=null;fishingCatch=-1;fishingNextBite=10;boy.children[5].rotation.x=0}
function nearbyFishingWater(){if(currentSeason==='winter')return null;let best=null;for(let r=1.4;r<=4.2;r+=.7)for(let i=0;i<24;i++){const a=i/24*Math.PI*2,x=boy.position.x+Math.sin(a)*r,z=boy.position.z+Math.cos(a)*r,w=waterAt(x,z);if(w&&lakeDepthAt(x,z)>.25&&!((level===4)&&onRiverBridge(x,z))){best={x,z,y:w.y};return best}}return null}
function updateFishing(dt,now){const x=boy.position.x,z=boy.position.z,moving=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>keys[k])||Math.hypot(stick.x,stick.y)>.08||jump||act||Math.abs(vy)>.1||(fishingPrevious&&Math.hypot(x-fishingPrevious.x,z-fishingPrevious.z)>.01);fishingPrevious={x,z};if(moving||mountedFriend||boarFormTime>0||catFormTime>0||walkingInWater(x,z)||![2,4].includes(level)||foes.some(f=>!f.flee&&Math.hypot(x-f.g.position.x,z-f.g.position.z)<6)){if(fishingTarget)stopFishing();fishingIdle=0;return}fishingIdle+=dt;if(!fishingTarget&&fishingIdle>4){fishingTarget=nearbyFishingWater();if(fishingTarget){fishingRig.visible=fishingLine.visible=fishingFloat.visible=true;fishingTime=0;fishingNextBite=rand(8,15);fishingCatch=-1;notice('🎣 Тимур ловит рыбу. Двигайся, чтобы убрать удочку.')}}if(!fishingTarget)return;fishingTime+=dt;boy.rotation.y=Math.atan2(fishingTarget.x-x,fishingTarget.z-z);boy.children[5].rotation.x=-1.0;boy.updateWorldMatrix(true,true);const start=rod.localToWorld(new THREE.Vector3(0,1.6,0)),end=new THREE.Vector3(fishingTarget.x,fishingTarget.y+.035+Math.sin(now*.003)*.025,fishingTarget.z);fishingFloat.position.copy(end);const vertices=fishingLine.geometry.attributes.position;vertices.setXYZ(0,start.x,start.y,start.z);vertices.setXYZ(1,end.x,end.y,end.z);vertices.needsUpdate=true;fishingLine.geometry.computeBoundingSphere();if(fishingTime>=fishingNextBite){fishingNextBite=fishingTime+rand(8,16);if(Math.random()<.7&&fishStock<10){fishingCatch=fishingTime;fishStock++;spawnWaterSplash(end.x,end.z,1.2);notice('🐟 Рыба поймана! Можно покормить кабанчика.');score+=5}}const catchAge=fishingTime-fishingCatch;caughtFish.visible=fishingCatch>=0&&catchAge<1.8;if(caughtFish.visible)caughtFish.position.set(end.x,end.y+Math.sin(catchAge/1.8*Math.PI)*1.3,end.z)}
const iceShell=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshPhongMaterial({color:0x8ecff0,transparent:true,opacity:.58,shininess:100,depthWrite:false}));iceShell.visible=false;scene.add(iceShell);let freezeTime=0;
function updateUnderwater(dt){if(boarFormTime>0){underwaterTime=underwaterDamageCd=0;return}const fullyUnder=(level===2||level===4)&&(boy.position.y+1.2)<(level===2?.14:.05);if(fullyUnder){underwaterTime+=dt;underwaterDamageCd=Math.max(0,underwaterDamageCd-dt);if(underwaterTime>8&&underwaterDamageCd<=0){life--;statsData.damage++;underwaterDamageCd=3;playerHitFeedback('water');notice(life>0?'🌊 Тимур слишком долго под водой! Всплывай! -1❤️':'🌊 Тимур слишком долго пробыл под водой.');if(life<=0)showEnd(false)}}else{underwaterTime=Math.max(0,underwaterTime-dt*2);underwaterDamageCd=0}}
function updateWinterFreeze(dt){if(weatherDeadline(currentSeason,level,levelTime)!=='freeze')return;freezeTime+=dt;stopFishing();iceShell.visible=true;iceShell.position.copy(boy.position);iceShell.position.y+=.65;const k=Math.min(1,freezeTime/2.5);iceShell.scale.set(.58*k,.95*k,.58*k);if(freezeTime>=2.5&&!endShown){life=0;lastDeathCause='ice';notice('🧊 Тимур замёрз и превратился в ледышку!');showEnd(false)}}
function resetWaterActivity(){freezeTime=0;iceShell.visible=false;stopFishing();fishingPrevious=null;wetLast=null;wetStepDistance=0;rainRippleClock=0;for(const q of [...sprayPool,...rainRingPool]){q.t=0;q.m.visible=false}}
function addSpringFlowers(){const head=new THREE.InstancedMesh(new THREE.SphereGeometry(.13,6,4),new THREE.MeshLambertMaterial({color:0xffffff}),mobile?45:110),stem=new THREE.InstancedMesh(new THREE.BoxGeometry(.04,.28,.04),new THREE.MeshLambertMaterial({color:0x669642}),head.count),d=new THREE.Object3D();for(let i=0;i<head.count;i++){const [x,z]=safeForageSpot(),y=terrainHeightAt(x,z);d.position.set(x,y+.3,z);d.updateMatrix();head.setMatrixAt(i,d.matrix);head.setColorAt(i,new THREE.Color([0xffb3d4,0xffe891,0xe8d6ff][i%3]));d.position.y=y+.14;d.updateMatrix();stem.setMatrixAt(i,d.matrix)}seasonVisual.add(head,stem);head.userData.springFlowers=true}
function addWinterRoadBorders(){const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.35,.16,1.65),winterRoadMaterial,112),d=new THREE.Object3D();let count=0;for(let z=-44;z<=44;z+=1.6){if(level===4&&onRiverBridge(0,z))continue;for(const side of [-1,1]){const x=side*(roadHalfWidthAt(z)+.22);d.position.set(x,.11,z);d.rotation.set(0,side*Math.atan((roadHalfWidthAt(z+.1)-roadHalfWidthAt(z-.1))/.2),0);d.scale.set(1,1,1);d.updateMatrix();mesh.setMatrixAt(count++,d.matrix)}}mesh.count=count;mesh.userData.snowRoadBorder=true;mesh.instanceMatrix.needsUpdate=true;seasonVisual.add(mesh)}
function addChristmasTree(){const g=new THREE.Group();g.position.set(10,terrainHeightAt(10,26),26);seasonVisual.add(g);const needles=new THREE.MeshLambertMaterial({color:0x1f603e});christmasSolid=block(g,mats.wood,0,.45,0,.3,.9,.3);christmasSolid.userData.collisionRadius=1.7;treeSolidMeshes.push(christmasSolid);for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(1.7-i*.3,1.8,10),needles);m.position.y=1.2+i*.75;g.add(m)}for(let i=0;i<24;i++){const a=i*2.399,y=.9+i/24*2.7,r=1.55-(y-.9)*.34;sphere(g,new THREE.MeshBasicMaterial({color:[0xffd06d,0xe75b54,0x67c8ed][i%3]}),Math.sin(a)*r,y,Math.cos(a)*r,.1)}const star=new THREE.Mesh(new THREE.OctahedronGeometry(.24),new THREE.MeshBasicMaterial({color:0xffe28b}));star.position.y=4.2;g.add(star);const glow=new THREE.PointLight(0xffcb70,3,7);glow.position.y=2.3;g.add(glow);g.userData.christmasTree=true}

function loadLevel(n){resetWaterActivity();const carriedMounted=mountedFriend;mountedFriend=false;setRiderPose(false);const carriedFriend=friend,carriedFriendHP=friendHP;resetStormLocationState();worldEpoch++;level=n;rescued=0;bossHits=0;levelTime=0;weatherStage=0;underwaterTime=0;underwaterDamageCd=0;hurricaneCarry=0;weatherGroup.visible=false;for(const q of stormLeaves)scene.remove(q.g);stormLeaves.length=0;forageTimer=18;if(n===1){totalTime=0;statsData={fed:0,forage:0,berries:0,damage:0,family:0,minions:0,bossHits:0};endShown=false;}bossRage=1;bossSummon=7;bossVictoryTimer=null;bossFireworkTimer=0;levelBoarsDone=0;levelFamilyDone=0;clearEntities(friends);clearEntities(foes);clearEntities(familyMembers);clearEntities(crates);fireballs.forEach(f=>scene.remove(f.g));fireballs=[];defeatedBoars.forEach(f=>scene.remove(f.g));defeatedBoars.length=0;for(const [t,b] of [...burningTrees]){if(b.light)t.remove(b.light);if(b.flames)t.remove(b.flames);t.visible=true}burningTrees.clear();friendKnockbackActive=false;friend=carriedFriend;friendHP=carriedFriendHP;if(friend){friend.knockback=null;if(!friend.g.parent)scene.add(friend.g);friend.g.position.set(1.8,0,5.2);friend.g.rotation.set(0,0,0);friend.g.visible=true;friend.friendly=true;friend.aura.material.color.set(0x4cff72);friend.aura.material.opacity=.24}for(const a of apples)scene.remove(a.g);apples.length=0
const enemyCounts=[3,4,5,5,6,1];const enemyCount=n===6?1:Math.max(1,Math.min(8,Math.round(enemyCounts[n-1]*diffCfg().enemyMult)));levelBoarsTotal=enemyCount;const spawnSets=[[-18,-10],[18,-13],[-15,-25],[16,-29],[-20,-36],[20,-39],[-8,-42],[9,-43]];if(n<6){for(let i=0;i<enemyCount;i++){const pos=spawnSets[i];foes.push(makeBoar(pos[0],pos[1],false))}}else{const b=makeBoar(0,-31,false);b.g.scale.setScalar(2.3);b.hp=BOSS_HITS[selectedDiff];b.maxHp=b.hp;b.isBoss=true;b.baseSpeed=2.05;b.rage=1;foes.push(b)}
// v112: tree visibility must be finalized before spawning apples. Otherwise an apple can be attached to a tree that this level hides.
for(const h of houseObjects){if(h!==familyHideout)setHouseTransparent(h,false);h.visible=(n===3)};setDadHouseCutaway(false);for(const o of biomeObjects)o.visible=(o.userData.biomeLevel===n);syncWorldGeneration(n);rebuildWorldSurface();
seedForage();tagStormTargetsForCurrentLocation();
// v120: family members use safe randomized places instead of one repeated coordinate per map.
// Dad remains tied to the enterable hideout, while the hideout itself can move between safe village plots.
const familyCounts=[0,1,1,0,2,0],familyRoles={2:[0],3:[2],5:[1,3]};levelFamilyTotal=familyCounts[n-1];
function randomFamilySpot(used=[]){for(let tries=0;tries<180;tries++){const x=rand(-36,36),z=rand(-36,34);if(n===2&&lakeRadiusAt(x,z)<16.2)continue;if(Math.abs(x)<5.2||Math.hypot(x,z-4)<8)continue;if(used.some(q=>Math.hypot(x-q[0],z-q[1])<8))continue;if(!spawnPointBlocked(x,z,.72))return [x,z]}return nearestSafeSpawn(14,-18,.72)||[14,-18]}
if(n===3){familyHideout.position.set(30,0,-31);familyHideout.rotation.y=0;familyHideout.updateWorldMatrix(true,true);syncWorldGeneration(n)}
const familyUsed=[];for(const role of (familyRoles[n]||[])){if(n===3&&role===2){const brotherLocal=new THREE.Vector3(0,0,-1.05),brotherWorld=familyHideout.localToWorld(brotherLocal.clone());makeFamily(brotherWorld.x,brotherWorld.z,2)}else{const q=randomFamilySpot(familyUsed);familyUsed.push(q);makeFamily(q[0],q[1],role)}}
const entryZ=n===1?4:34;boy.position.set(0,0,entryZ);py=0;vy=0;if(n>1){yaw=Math.PI;boy.rotation.y=Math.PI}if(friend){friend.g.position.set(1.8,0,entryZ+1.2);friend.g.rotation.y=yaw}if(carriedMounted&&friend){mountedFriend=true;friend.g.position.set(0,0,entryZ);boy.position.set(0,1.18,entryZ);py=1.18;setRiderPose(true)}if(portalObj)portalObj.g.visible=false;insideFamilyHouse=false;familyWindow.material.opacity=1;hideDoor.visible=(n===3);hideDoorGlow.visible=(n===3);dadInteriorGlow.visible=(n===3);const __occlusionAudit=runOcclusionVisibilityAudit();window.__KABANCHIKI_TEST__.occlusionAudit=__occlusionAudit;if(__autoTest&&!__occlusionAudit.ok)window.__KABANCHIKI_TEST__.errors.push(...__occlusionAudit.issues);moon.visible=(n===6);moonLight.intensity=n===6?.62:0;window.__KABANCHIKI_TEST__.bossFinaleAudit={ok:level!==6||(moon.visible&&moonLight.intensity>=.6),moonVisible:moon.visible,moonLight:moonLight.intensity,fireFromStart:true,defeatDelay:5};if(__autoTest&&!window.__KABANCHIKI_TEST__.bossFinaleAudit.ok)window.__KABANCHIKI_TEST__.errors.push('boss-finale-environment');forestVisual.visible=(n===1);forestGround.visible=(n===1);syncMeadowGrass();sunDisc.visible=(n<=4);sunHalo.visible=(n<=4);syncWorldShadowCasters();lakeVisual.visible=(n===2);const __spawnAudit=repairAndAuditSpawns();window.__KABANCHIKI_TEST__.spawnAudit=__spawnAudit;if(__autoTest&&!__spawnAudit.ok)window.__KABANCHIKI_TEST__.errors.push(...__spawnAudit.issues);const __worldAudit=runWorldIntegrityAudit();window.__KABANCHIKI_TEST__.worldAudit=__worldAudit;window.__KABANCHIKI_TEST__.forageRoadAudit=runForageRoadAudit();const __familyAudit=runFamilyPlacementAudit();window.__KABANCHIKI_TEST__.familyPlacementAudit=__familyAudit;if(__autoTest&&!__worldAudit.ok)window.__KABANCHIKI_TEST__.errors.push(...__worldAudit.issues);if(__autoTest&&!__familyAudit.ok)window.__KABANCHIKI_TEST__.errors.push(...__familyAudit.issues);const skies=[0xeac096,0xe9a67f,0xd99580,0x707686,0x34385e,0x080611];scene.background=new THREE.Color(skies[n-1]);scene.fog.color.copy(scene.background);scene.fog.near=n===1?32:(n===4?18:n>=5?9:28);scene.fog.far=n===1?88:(n===4?62:n>=5?38:78);sun.color.set(n===1?0xffcf8c:n===2?0xffa65a:n===3?0xffa36f:n===4?0xa5a2ba:0x7680aa);sun.intensity=[2.8,2.35,1.95,1.05,.28,.015][n-1];hemi.intensity=[1.65,1.75,1.38,1.0,.75,.075][n-1];renderer.toneMappingExposure=n===1?1.18:(n===2?1.10:(n===3?.96:1.08));ground.material.color.set(n===1?0xffffff:n===2?0xffead0:n===3?0xd9f0cf:n===4?0xd3e6cc:n===5?0xaeb3b6:0x76636b);torch.intensity=(n>=5&&hasFlashlight)?42:0;if(n===6&&!hasFlashlight)notice('🌙 Фонарика нет. Лунный свет очень слабый. Разозли босса — его глаза и огонь немного осветят логово.');if(flashlightObj){scene.remove(flashlightObj);flashlightObj=null}if((n===5||n===6)&&!hasFlashlight){const fx=n===5?8:-12,fz=n===5?-18:10;flashlightObj=group(fx,fz);block(flashlightObj,mats.gold,0,.45,0,.35,.35,.8);block(flashlightObj,mats.white,0,.45,.55,.28,.28,.28);sphere(flashlightObj,mats.gold,0,1.25,0,.18);if(n===6)notice('🔦 В логове где-то лежит запасной фонарик. В темноте ищи слабый золотистый отблеск.')}notice(`⚠️ ${n===6?'Ночь. Если нет фонарика — будет очень темно. Подружи миньона: только кабанчик-друг может ранить босса (${BOSS_HITS[selectedDiff]} ударов). Корми босса, чтобы успокоить и замедлить!':'Покорми кабанчика яблоком, грибом или капустой 🍎🍄🥬 — иначе он разозлится и нападёт!'}`);if(n===3)setTimeout(()=>notice('🏠 Кто-то из семьи спрятался внутри дома. Ищи дверь с тёплым светом — в неё можно войти.'),700);const __audit=runCollisionAudit();window.__KABANCHIKI_TEST__.collisionAudit=__audit;if(__autoTest&&!__audit.ok)window.__KABANCHIKI_TEST__.errors.push(...__audit.issues);if(__autoTest)window.__KABANCHIKI_TEST__.robotAudit={ok:false,pending:true,issues:[],samples:[],treesTested:0,rocksTested:0,level};applySeason();const navigationAudit=runNavigationSafetyAudit();window.__KABANCHIKI_TEST__.navigationAudit=navigationAudit;if(__autoTest&&!navigationAudit.ok)window.__KABANCHIKI_TEST__.errors.push(...navigationAudit.issues);hud()}
function makeFoodModel(type,parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);if(type==='fish'){const m=sphere(g,new THREE.MeshLambertMaterial({color:0x9fbcc4}),0,0,0,.25);m.scale.set(.5,.6,1.5);const tail=block(g,mats.white,0,0,-.4,.25,.22,.07);tail.rotation.z=.6;sphere(g,mats.black,.1,.04,.22,.035)}else if(type==='apple'){const red=new THREE.MeshLambertMaterial({color:0xd83a32}),darkRed=new THREE.MeshLambertMaterial({color:0xb92522}),green=new THREE.MeshLambertMaterial({color:0x4f9a3f});sphere(g,red,-.12,0,0,.25);sphere(g,red,.12,0,0,.25);sphere(g,darkRed,0,-.08,0,.23);block(g,mats.wood,0,.31,0,.055,.20,.055);const leaf=block(g,green,.13,.35,0,.22,.055,.13);leaf.rotation.z=-.35}else if(type==='mushroom'){const cap=new THREE.MeshLambertMaterial({color:0xd92f2f}),spot=new THREE.MeshLambertMaterial({color:0xfff6dc});block(g,mats.white,0,.02,0,.18,.38,.18);const capMesh=new THREE.Mesh(new THREE.SphereGeometry(.34,12,8,0,Math.PI*2,0,Math.PI/2),cap);capMesh.position.y=.18;capMesh.scale.y=.62;g.add(capMesh);for(const [sx,sz,ss] of [[-.13,.05,.055],[.11,.08,.045],[.02,-.12,.05],[-.05,.16,.04]])sphere(g,spot,sx,.34,sz,ss)}else{const green=new THREE.MeshLambertMaterial({color:0x65a94f});sphere(g,green,0,0,0,.34);for(const [a,b] of [[.2,0],[-.2,0],[0,.2],[0,-.2]])sphere(g,green,a,.03,b,.23)}g.userData.foodType=type;return g}
function foodLabel(type){return type==='fish'?'рыбу 🐟':type==='apple'?'яблоко 🍎':type==='mushroom'?'гриб 🍄':'капусту 🥬'}
function feed(){if(!started||paused||win||life<=0||throwCooldown>0)return;if(food<=0&&fishStock<=0&&yellowMushroomStock<=0&&yellowAppleStock<=0){notice('🍎 Еда закончилась! Яблоки растут на деревьях — подпрыгни, чтобы сорвать. Грибы и капуста растут на земле.');sound(170,.2);return}stopFishing();if(mountedFriend&&friend&&friendHP<diffCfg().friendHP&&(food>0||fishStock>0)&&yellowMushroomStock<=0&&yellowAppleStock<=0){if(fishStock>0)fishStock--;else food--;throwCooldown=.6;friendHP=Math.min(diffCfg().friendHP,friendHP+1);statsData.fed++;sound(520,.16,'sine');notice(`💚 Друг подкрепился: 🐗❤️ ${friendHP}/${diffCfg().friendHP}`);hud();return}const hasYellowReady=yellowMushroomStock>0||yellowAppleStock>0; const useFish=!hasYellowReady&&fishStock>0;if(useFish)fishStock--;else if(!hasYellowReady)food--;throwCooldown=.6;const start=boy.position.clone().add(new THREE.Vector3(0,1,0));const dir=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));const target=start.clone().addScaledVector(dir,10);const foeNear=foes.filter(f=>(f.g.position.distanceTo(target)<4.5||f.g.position.distanceTo(boy.position)<9)&&clearWallLine(start,f.g.position.clone().add(new THREE.Vector3(0,.8,0)))).sort((a,b)=>a.g.position.distanceTo(target)-b.g.position.distanceTo(target))[0];const friendNear=friend&&(yellowMushroomStock>0||yellowAppleStock>0||friendHP<diffCfg().friendHP)&&friend.g.position.distanceTo(boy.position)<6.5&&clearWallLine(start,friend.g.position.clone().add(new THREE.Vector3(0,.8,0)))?friend:null;let near=foeNear;if(friendNear){const fd=friendNear.g.position.distanceTo(target),ed=foeNear?foeNear.g.position.distanceTo(target):Infinity;if(fd<3.2&&fd<=ed+.6)near=friendNear}if(near)target.copy(near.g.position).add(new THREE.Vector3(0,.8,0));const useYellow=yellowMushroomStock>0&&!!near,useYellowApple=!useYellow&&yellowAppleStock>0&&!!near;if(useYellow)yellowMushroomStock--;else if(useYellowApple)yellowAppleStock--;else if(hasYellowReady&&food>0)food--;else if(hasYellowReady&&!near){notice('🟡 Жёлтые припасы нужно бросить именно в кабанчика или босса.');return}const types=['apple','mushroom','cabbage'],type=useFish?'fish':useYellow?'mushroom':useYellowApple?'apple':types[Math.floor(Math.random()*types.length)],foodObj=makeFoodModel(type,scene,start.x,start.y,start.z);if(useYellow||useYellowApple)foodObj.traverse(o=>{if(o.isMesh&&o.material?.color){o.material=o.material.clone();o.material.color.set(0xffdf32)}});shots.push({g:foodObj,start,target,t:0,foe:near,type,specialYellow:useYellow,specialYellowApple:useYellowApple});boy.children[5].rotation.x=-1.1;effect('throw');notice(near?`Тимур бросил ${foodLabel(type)}!`:`${foodLabel(type)} летит вперёд — целься в кабана!`);hud()}
function sendBoarAway(f,reason='defeated'){if(!f||!f.g)return;updateBoarChewing(f,0,false);f.graze=0;f.flee=true;f.fleeTime=0;f.fleeReason=reason;f.aura.visible=false;f.bolt.visible=false;const away=new THREE.Vector3(f.g.position.x-boy.position.x,0,f.g.position.z-boy.position.z);if(away.lengthSq()<.1)away.set(rand(-1,1),0,rand(-1,1));away.normalize();f.fleeDir=away;defeatedBoars.push(f)}
function resolveMeat(shot){effect('eat');scene.remove(shot.g);const f=shot.foe;if(!f)return;if(shot.start&&!clearWallLine(shot.start,f.g.position.clone().add(new THREE.Vector3(0,.8,0)))){notice('🧱 Еда не проходит сквозь стену.');return}const label=foodLabel(shot.type||'apple');if(shot.specialYellow)setBoarYellow(f);if(shot.specialYellowApple)growBoarFromApple(f);if(f===friend){if(friendHP<diffCfg().friendHP){friendHP=Math.min(diffCfg().friendHP,friendHP+1);statsData.fed++;score+=2;sound(520,.16,'sine');notice(`💚 Друг съел ${label}: 🐗❤️ ${friendHP}/${diffCfg().friendHP}`);hud()}else notice('🐗❤️ Друг уже полностью здоров!');return}if(!foes.includes(f))return;if(f.isBoss){bossRage=Math.max(.72,bossRage-.28);statsData.fed++;score+=5;sound(360,.22,'triangle');notice(`👑 Босс съел ${label} и успокоился — здоровье не восстановилось, для победы нужно ${f.maxHp} ударов.`)}else{statsData.fed++;foes.splice(foes.indexOf(f),1);if(friend&&friend!==f){const oldFriend=friend;const wasMounted=mountedFriend&&oldFriend===friend;if(wasMounted){mountedFriend=false;setRiderPose(false);py=0;vy=0;boy.position.y=0;const a=boy.rotation.y;const dx=Math.sin(a)*1.35,dz=Math.cos(a)*1.35;if(!playerWorldBlocked(boy.position.x+dx,boy.position.z+dz,.04)){boy.position.x+=dx;boy.position.z+=dz}}friend=null;sendBoarAway(oldFriend,'jealous');notice('💔 Старый кабанчик обиделся и убежал: Тимур накормил другого!')}f.flee=false;f.fleeTime=0;f.friendly=true;for(const eye of f.g.userData.enemyEyes||[])eye.visible=false;levelBoarsDone++;f.aura.visible=true;f.aura.material.color.set(0x4cff72);f.aura.material.opacity=.24;f.bolt.visible=false;friend=f;friendHP=diffCfg().friendHP;
const fd=Math.hypot(f.g.position.x-boy.position.x,f.g.position.z-boy.position.z);
if(fd<2.25){
  let ax=f.g.position.x-boy.position.x,az=f.g.position.z-boy.position.z;
  if(Math.hypot(ax,az)<.01){ax=Math.sin(yaw+Math.PI);az=Math.cos(yaw+Math.PI)}
  const al=Math.max(.01,Math.hypot(ax,az));
  f.g.position.x=boy.position.x+ax/al*2.25;
  f.g.position.z=boy.position.z+az/al*2.25;
}
score+=diffScore(20);sound(740,.22);notice(`🐗 Кабан съел ${label} и стал другом!`)}hud()}
function showFamilyPopup(role=0,member=null){
const names=['маму','папу','братика','бабушку'],icons=['👩','👨','👦','👵'];
const messages=[
['Мама улыбается: «Вот ты где! Я из окна видела, как один кабанчик гонялся за собственной тенью. Не все они страшные — иногда им просто нужен вкусный обед.»','Мама шепчет: «В этих местах полезно смотреть по сторонам. Самые хорошие находки часто лежат не на дороге, а чуть в стороне.»'],
['Папа смеётся: «Неплохая у тебя команда! Если кабанчик-друг идёт рядом, береги его — в серьёзной драке он может сделать то, чего Тимур один не сможет.»','Папа говорит: «Я слышал впереди странный грохот. Чем дальше идёшь, тем важнее не нестись напролом — иногда обход спасает больше сердец, чем храбрость.»'],
['Братик выпаливает: «Я всё это время сидел тихо-тихо! Ну… почти. Один кабан услышал мой живот и убежал. Наверное, решил, что здесь кабан побольше!»','Братик говорит: «Если увидишь ягоды — не проходи мимо. Я одну попробовал и сразу почувствовал себя бодрее. Остальные, правда, я уже съел.»'],
['Бабушка говорит: «Доброе сердце здесь полезнее большой палки. Накорми того, кто сердится, и однажды он может встать на твою сторону.»','Бабушка предупреждает: «Впереди логово, а там темнота такая, что собственный нос потеряешь. Увидишь фонарик — бери, внучек.»']
];
const i=Math.max(0,Math.min(3,Number(role)||0)),line=messages[i][(level+familyFound+i)%messages[i].length];
familyPopupOpen=true;paused=true;
$('familyTitle').textContent=`${icons[i]} Тимур нашёл ${names[i]}!`;
$('familyText').textContent=`❤️ Здоровье и еда восстановлены.\n\n${line}`;
$('familyText').style.whiteSpace='pre-line';
playCinematic('family',()=>{familyPopupOpen=false;paused=false;startMusic()},{role,member,line})
}$('familyOk').onclick=()=>{familyPopupOpen=false;$('familyPopup').style.display='none';paused=false};function formatTime(sec){const m=Math.floor(sec/60),s=Math.floor(sec%60);return `${m}:${String(s).padStart(2,'0')}`}function questsComplete(){if(level===6)return !foes.some(f=>f.isBoss);return levelBoarsDone>=levelBoarsTotal&&levelFamilyDone>=levelFamilyTotal}function questState(){if(level===6){const boss=foes.find(f=>f.isBoss);if(boss)return `👑 Босс: ${boss.hp}/${boss.maxHp} · Подружи миньона и помоги ему победить босса`;return '🎉 Босс побеждён!'}const boarsLeft=Math.max(0,levelBoarsTotal-levelBoarsDone),familyLeft=Math.max(0,levelFamilyTotal-levelFamilyDone);if(boarsLeft>0&&familyLeft>0)return `🐗 Накорми кабанов: ${levelBoarsDone}/${levelBoarsTotal} · 👨‍👩‍👦 Найди родных: ${levelFamilyDone}/${levelFamilyTotal}`;if(boarsLeft>0)return `🐗 Накорми кабанов: ${levelBoarsDone}/${levelBoarsTotal}`;if(familyLeft>0)return `👨‍👩‍👦 Найди родных: ${levelFamilyDone}/${levelFamilyTotal}`;return '🌀 Задание выполнено — иди в портал!' }
let cinematicRunning=false,cinematicTimers=[],cinematicFinish=null,movie=null;const movieRoot=new THREE.Group();scene.add(movieRoot);
window.addEventListener('keydown',e=>{if(cinematicRunning&&['Escape','Space','Enter'].includes(e.code)){e.preventDefault();cinematicFinish?.()}});
function cineClear(){for(const t of cinematicTimers)clearTimeout(t);cinematicTimers=[];if(movie){if(movie.saved.doorMaterial){familyDoorSlab.material.dispose();familyDoorSlab.material=movie.saved.doorMaterial}for(const [o,visible] of movie.saved.visibility)o.visible=visible;scene.background.copy(movie.saved.sky);scene.fog.color.copy(movie.saved.fog);sun.intensity=movie.saved.sun;hemi.intensity=movie.saved.hemi;camera.fov=movie.saved.fov;camera.updateProjectionMatrix();for(const g of movie.privateGeometries||[])g.dispose();for(const m of movie.privateMaterials||[])m.dispose();movie=null}movieRoot.clear();}
function cineLater(fn,ms){cinematicTimers.push(setTimeout(fn,ms))}
function cinemaPerson(role){makeFamily(0,0,role);const p=familyMembers.pop();scene.remove(p.g);p.g.traverse(o=>{if(o.userData.familyMarker)o.visible=false});movieRoot.add(p.g);return p.g}
function cinemaCar(){const g=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color:0x315c55,roughness:.4,metalness:.35}),trim=new THREE.MeshStandardMaterial({color:0xd5d7ce,roughness:.28,metalness:.8}),glass=new THREE.MeshPhongMaterial({color:0x80b4c8,transparent:true,opacity:.7,shininess:110}),rubber=new THREE.MeshLambertMaterial({color:0x202329});block(g,paint,0,.74,0,2.3,.68,4.35);block(g,paint,0,1.36,-.25,2.02,.72,2.2);block(g,trim,0,1.79,-.25,2.05,.09,2.25);block(g,glass,0,1.4,.87,1.8,.52,.035);block(g,glass,0,1.4,-1.36,1.8,.52,.035);block(g,paint,0,1.05,1.47,2.15,.13,1.25);for(const x of [-1.03,1.03]){block(g,glass,x,1.4,-.24,.03,.5,1.87);block(g,trim,x,1.05,-.05,.05,.035,3.4);block(g,trim,x,1.14,.6,.07,.05,.27);block(g,paint,x*1.16,1.39,.7,.26,.18,.22);for(const z of [-1.35,1.35]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.28,16),rubber);wheel.rotation.z=Math.PI/2;wheel.position.set(x*1.07,.43,z);g.add(wheel);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.3,10),trim);hub.rotation.z=Math.PI/2;hub.position.copy(wheel.position);g.add(hub)}}for(const z of [-2.21,2.21])block(g,trim,0,.53,z,2.3,.16,.1);block(g,mats.black,0,.83,2.2,1.08,.32,.04);for(let i=-2;i<=2;i++)block(g,trim,i*.19,.83,2.23,.035,.28,.04);const beams=[],lenses=[];for(const x of [-.8,.8]){lenses.push(block(g,flashlightLensMat.clone(),x,.88,2.2,.46,.28,.05));const light=new THREE.SpotLight(0xffefcb,32,28,.32,.6,1.1);light.position.set(x,.88,2.24);light.target.position.set(x,.1,16);g.add(light,light.target);beams.push(light);block(g,new THREE.MeshBasicMaterial({color:0xd85138}),x,.86,-2.2,.35,.19,.05)}g.userData.headlights=beams;g.userData.headlightLenses=lenses;movieRoot.add(g);return g}
function cinemaHug(person,amount){const model=person.children.find(c=>c.isGroup)||person;const arms=model.children.filter(o=>o.isMesh&&Math.abs(o.position.x)>.49&&Math.abs(o.position.x)<.62&&o.position.y>1&&o.position.y<1.5);for(const arm of arms){arm.rotation.x=-1.2*amount;arm.rotation.z=(arm.position.x<0?-.5:.5)*amount;arm.position.z=.22*amount}for(const i of [5,6]){movie.hero.children[i].rotation.x=-1.25*amount;movie.hero.children[i].rotation.z=(i===5?-.35:.35)*amount}}
function cineSetup(kind,detail={}){
 $('cinematicScene').innerHTML='';$('cinematicScene').style.background='none';
 const existingGeometries=new Set(),existingMaterials=new Set(),capture=o=>{if(o.geometry)existingGeometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])existingMaterials.add(m)};scene.traverse(capture);detail.member?.g?.traverse(capture);
 const visibility=[boy,catLife.root,catFormModel?.g,friend?.g,...foes.map(f=>f.g),...familyMembers.map(f=>f.g),...apples.map(a=>a.g)].filter(Boolean).map(o=>[o,o.visible]);const saved={visibility,sky:scene.background.clone(),fog:scene.fog.color.clone(),sun:sun.intensity,hemi:hemi.intensity,fov:camera.fov};for(const [o] of visibility)o.visible=false;
 if(kind==='family'&&detail.role===2){saved.doorMaterial=familyDoorSlab.material;familyDoorSlab.material=familyDoorSlab.material.clone();familyDoorSlab.material.transparent=true;familyDoorSlab.material.opacity=.12;familyDoorSlab.material.depthWrite=false}
 movie={kind,detail,saved,start:performance.now(),elapsed:0,people:[],boars:[],car:null};camera.fov=kind==='family'?48:55;camera.updateProjectionMatrix();
 const hero=boy.clone(true);hero.visible=true;hero.children.forEach(o=>{o.rotation.x=0;o.rotation.z=0});hero.traverse(o=>{if(o.isMesh&&o.userData._cameraFade)o.userData._cameraFade=false});const lamp=hero.children.find(o=>o.type==='Group');if(lamp)lamp.visible=false;
 if(hasFlashlight){const held=new THREE.Group();block(held,mats.black,.6,1.0,.5,.22,.22,.55);block(held,flashlightLensMat,.6,1.0,.79,.19,.19,.04);hero.add(held);movie.lamp=held;const light=new THREE.SpotLight(0xfff0cd,38,28,.48,.58,1.1),target=new THREE.Object3D();movieRoot.add(light,target);light.target=target;movie.lampLight=light}
movieRoot.add(hero);movie.hero=hero;
 if(kind==='death'){movieRoot.position.set(boy.position.x,detail.cause==='water'?.05:terrainHeightAt(boy.position.x,boy.position.z),boy.position.z);hero.position.set(0,0,0);hero.rotation.y=boy.rotation.y;movie.deathCause=detail.cause;if(detail.cause==='boar'){const b=lastDeathBoar?.g.clone(true)||makeBoar(0,0,false).g;scene.remove(b);b.position.set(-2,0,0);b.rotation.y=Math.PI/2;b.visible=true;movieRoot.add(b);movie.deathBoar=b}if(detail.cause==='water'){const ring=new THREE.Mesh(new THREE.RingGeometry(.5,.65,24),new THREE.MeshBasicMaterial({color:0xc3e3ef,transparent:true,opacity:.65,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;movieRoot.add(ring);movie.deathRing=ring}
 }else if(kind==='storm'){movieRoot.position.copy(boy.position);hero.position.set(0,0,0);hero.rotation.y=boy.rotation.y;movie.stormHeading=boy.rotation.y;movie.people=[];
 }else if(kind==='family'){
  const cx=boy.position.x,cz=boy.position.z;movieRoot.position.set(cx,terrainHeightAt(cx,cz),cz);hero.position.set(-.7,0,0);hero.rotation.y=Math.PI/2;const person=detail.member?.g?.clone(true)||cinemaPerson(detail.role||0);person.traverse(o=>{if(o.userData.familyMarker)o.visible=false});person.visible=true;movieRoot.add(person);person.position.set(.85,0,0);person.rotation.y=-Math.PI/2;movie.people=[person];const gift=new THREE.Group();makeFoodModel('apple',gift,0,0,0);movieRoot.add(gift);movie.gift=gift;gift.visible=false;
 }else{
  movieRoot.position.set(0,0,0);hero.position.set(0,0,3);hero.rotation.y=0;
  for(let i=0;i<4;i++){const person=cinemaPerson(i);person.position.set([-2.6,2.7,-1.3,1.2][i],0,[7,7,5.3,6][i]);person.rotation.y=Math.PI;movie.people.push(person)}
  movie.car=cinemaCar();movie.car.position.set(0,0,kind==='intro'?24:10);movie.car.rotation.y=Math.PI;
  for(let i=0;i<(kind==='intro'?3:1);i++){const b=makeBoar(0,0,kind==='outro');scene.remove(b.g);b.aura.visible=false;b.bolt.visible=false;movieRoot.add(b.g);b.g.position.set((i-1)*2,0,-12-i*2);movie.boars.push(b)}
  if(kind==='outro'){const fleeing=makeBoar(0,0,false);scene.remove(fleeing.g);fleeing.aura.visible=fleeing.bolt.visible=false;fleeing.g.scale.setScalar(2.3);movieRoot.add(fleeing.g);movie.fleeingBoss=fleeing;}
  if(kind==='intro'){const picnic=new THREE.Group();block(picnic,new THREE.MeshLambertMaterial({color:0xd28366}),0,.07,0,3,.07,2);picnic.position.set(-11.2,0,8);movieRoot.add(picnic);movie.picnic=picnic;picnic.visible=false;hero.visible=false;movie.people.forEach(p=>p.visible=false);movie.boars.forEach(b=>b.g.visible=false);makeFoodModel('apple',picnic,.3,.35,0);makeFoodModel('cabbage',picnic,-.5,.2,.2)}
 }
 movie.privateGeometries=new Set();movie.privateMaterials=new Set();movieRoot.traverse(o=>{if(o.geometry&&!existingGeometries.has(o.geometry))movie.privateGeometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])if(!existingMaterials.has(m))movie.privateMaterials.add(m)});
}
function movieEase(a){a=Math.max(0,Math.min(1,a));return a*a*(3-2*a)}
function updateCinematic(now,look){if(!movie)return;const m=movie,t=m.elapsedOverride??(now-m.start)/1000;m.elapsed=t;const ease=movieEase;
 const world=(x,y,z)=>new THREE.Vector3(x,y,z).add(movieRoot.position);let from,to,target,k;
 if(m.kind==='death'){const k=ease((t-.6)/2);if(m.deathCause==='water'){m.hero.position.y=-k*1.8;m.hero.children[5].rotation.x=Math.sin(t*6)*.35-1;if(m.deathRing)m.deathRing.scale.setScalar(1+t*.25)}else{m.hero.rotation.z=-k*Math.PI/2;m.hero.position.y=-k*.25;m.hero.children[5].rotation.x=-.8*k}if(m.deathBoar){const jump=ease(t/.7);m.deathBoar.position.x=-2+jump*.8;m.deathBoar.position.y=Math.sin(jump*Math.PI)*.55}from=world(4,3.2,5);to=world(3,2.4,4);target=world(0,.4,0);camera.position.lerpVectors(from,to,ease(t/4));camera.up.set(0,1,0);camera.lookAt(target);updateCinematicLamp(m);return
 }else if(m.kind==='storm'){const k=ease(t/6);m.hero.position.set(Math.sin(m.stormHeading)*k*14,k*9,Math.cos(m.stormHeading)*k*14);m.hero.rotation.z=Math.sin(t*2)*.16;m.hero.rotation.x=.12;from=world(-7,4,8);to=world(-10,10,12);target=world(m.hero.position.x,m.hero.position.y+1,m.hero.position.z);camera.position.lerpVectors(from,to,ease(t/6));camera.up.set(0,1,0);camera.lookAt(target);updateCinematicLamp(m);return
 }else if(m.kind==='intro'){
  camera.fov=t>=12&&t<15?65:48;camera.updateProjectionMatrix();const stage=introStagingAt(t);m.car.position.z=stage.carZ;for(const light of m.car.userData.headlights)light.intensity=stage.headlights?32:0;for(const lens of m.car.userData.headlightLenses){lens.material.color.set(stage.headlights?0xffefcb:0x8e9a97);if(lens.material.emissive)lens.material.emissiveIntensity=stage.headlights?1:0}
  m.hero.visible=stage.hero.visible;const heroGround=Math.max(0,terrainHeightAt(stage.hero.x,stage.hero.z));m.hero.position.set(stage.hero.x,heroGround+.04,stage.hero.z);
  stage.people.forEach((q,i)=>{const p=m.people[i];p.visible=q.visible;const ground=Math.max(0,terrainHeightAt(q.x,q.z));p.position.set(q.x,ground,q.z);p.rotation.set(q.spread*.35,q.yaw,0);const model=p.children.find(c=>c.isGroup)||p;model.children.filter(o=>o.isMesh&&o.position.y<.9&&o.position.y>.2&&Math.abs(o.position.x)>.1).forEach((leg,j)=>leg.rotation.x=q.running?Math.sin(t*12+i+j*Math.PI)*.6:0)});
  stage.boars.forEach((q,i)=>{const b=m.boars[i];b.g.visible=q.visible;const ground=Math.max(0,terrainHeightAt(q.x,q.z));b.g.position.set(q.x,ground,q.z);b.g.rotation.y=q.yaw;b.g.scale.setScalar(q.scale??1);b.b.rotation.z=Math.sin(now*.014+i)*.04});
  m.picnic.visible=stage.blanketVisible;m.picnic.scale.set(stage.blanketScale,1,stage.blanketScale);m.picnic.children.forEach((o,i)=>{if(i>0)o.visible=stage.foodVisible});
  if(t<4){from=world(10,5,24);to=world(7,3.6,15);target=world(0,1,m.car.position.z);k=ease(t/4)}else if(t<8){from=world(-16,3.6,14);to=world(-14,2.5,12);target=world(-9,1.2,6.5);k=ease((t-4)/4)}else if(t<12){from=world(5,2.8,-2);to=world(4,2.2,3);target=world(0,.8,m.boars[0].g.position.z);k=ease((t-8)/4)}else if(t<15){from=world(0,30,42);to=world(0,36,46);target=world(0,1,15);k=ease((t-12)/3)}else{from=world(-5.2,1.9,10);to=world(-6.2,1.7,8.8);target=world(-8,.8,6);k=ease((t-15)/3)}
 }else if(m.kind==='outro'){
  const flee=ease(t/4);m.fleeingBoss.g.position.set(-5-flee*26,0,1-flee*24);m.fleeingBoss.g.rotation.y=Math.atan2(-26,-24);m.fleeingBoss.g.visible=t<4;m.fleeingBoss.b.rotation.z=Math.sin(now*.017)*.07;
  scene.background.copy(m.saved.sky).lerp(new THREE.Color(0xdfb18f),ease(t/15));scene.fog.color.copy(scene.background);sun.intensity=Math.max(.38,m.saved.sun+ease(t/12)*1.35);hemi.intensity=Math.max(.65,m.saved.hemi+ease(t/12)*.9);
  m.boars[0].g.position.set(3.1,0,5);m.boars[0].g.rotation.y=Math.PI;const enter=ease((t-6)/3),drive=ease((t-9)/5);m.car.position.z=10+drive*30;m.car.rotation.y=0;
  for(let i=0;i<4;i++){const p=m.people[i];p.position.z=[7,7,5.3,6][i]+enter*(10-[7,7,5.3,6][i]);p.position.x=[-2.6,2.7,-1.3,1.2][i]*(1-enter);p.visible=t<9}m.hero.visible=t<9;m.boars[0].g.visible=t<9;
  if(t<3){from=world(-11,4,9);to=world(-9,3.5,5);target=world(m.fleeingBoss.g.position.x,1.8,m.fleeingBoss.g.position.z);k=ease(t/3)}else if(t<6){from=world(7,3.2,12);to=world(5,2.4,9);target=world(0,1.2,6);k=ease((t-3)/3)}else if(t<10){from=world(-6,3,15);to=world(-4,2.4,17);target=world(0,1,10);k=ease((t-6)/4)}else{from=world(-10,5,21);to=world(-6,7,28);target=world(0,1,m.car.position.z);k=ease((t-10)/5)}
 }else{
  const meet=ease(t/2.5),hug=ease((t-4.4)/1.1)*ease((8.5-t)/.9);m.hero.position.x=-.7+meet*.3+hug*.13;m.people[0].position.x=.85-meet*.22-hug*.31;cinemaHug(m.people[0],hug);m.gift.visible=t>2.8&&t<4.5;m.gift.position.set(.25,1.1,0);from=world(3.8,2.2,5);to=world(2.6,1.8,3.8);target=world(.2,1.25,0);k=ease(t/8);
 }
 updateCinematicLamp(m);
 camera.up.set(0,1,0);camera.position.lerpVectors(from,to,k);if(camera.aspect<1)camera.position.sub(target).multiplyScalar(Math.min(1.7,1/camera.aspect)).add(target);look.copy(target);camera.lookAt(look);$('cinematic').dataset.kind=m.kind;
}
function updateCinematicLamp(m){if(m.lampLight){const origin=m.hero.localToWorld(new THREE.Vector3(.6,1.0,.8)),direction=new THREE.Vector3(Math.sin(m.hero.rotation.y),-.035,Math.cos(m.hero.rotation.y));m.lampLight.position.copy(movieRoot.worldToLocal(origin.clone()));m.lampLight.target.position.copy(movieRoot.worldToLocal(origin.addScaledVector(direction,14)));m.lampLight.visible=m.hero.visible}}
function playCinematic(kind,onDone,detail={}){
 stopFishing();cineClear();cinematicRunning=true;paused=true;if(boarFormVisual)boarFormVisual.visible=false;$('cinematic').style.display='block';cineSetup(kind,detail);startCinematicMusic(kind);
 const steps=kind==='intro'?[["Семья приехала отдохнуть в лесу.",0],["У озера их ждал пикник…",4200],["Но из чащи появились кабанчики.",8000],["Все разбежались в разные стороны.",12000],["Тимур остался один. Ему предстоит найти родных.",15000]]:kind==='outro'?[["Босс повержен. Семья снова вместе.",0],["Верный кабанчик помог найти дорогу домой.",3200],["Пора возвращаться к машине.",6300],["Это приключение они запомнят надолго.",10000]]:[[detail.line||'Тимур нашёл родного человека.',0],["Здоровье и припасы восстановлены. Путешествие продолжается.",5500]];
 const text=$('cinematicText');for(const [line,at] of steps)if(at===0)text.textContent=line;else cineLater(()=>text.textContent=line,at);if(kind==='intro')cineLater(softBoarAttackSound,8000);else if(kind==='family')bonusSound();
 const finish=()=>{if(!cinematicRunning)return;cinematicRunning=false;cinematicFinish=null;cineClear();stopCinematicMusic();$('cinematic').style.display='none';onDone?.()};cinematicFinish=finish;$('cinematicSkip').onclick=finish;cineLater(finish,kind==='intro'?18500:kind==='outro'?15500:kind==='storm'?6500:kind==='death'?4500:8500);
}

function showEnd(won){if(endShown)return;if(deathSceneActive&&!deathSceneFinished)return;if(!won&&!deathSceneActive&&lastDeathCause!=='wind'){deathSceneActive=true;life=0;playCinematic('death',()=>{deathSceneFinished=true;showEnd(false)},{cause:lastDeathCause,line:{boar:'Кабанчик сбил Тимура с ног. Приключение можно начать снова.',fire:'Тимур оказался слишком близко к огню.',water:'Тимур слишком долго пробыл под водой.',ice:'Тимур замёрз. Нужно успеть найти семью.'}[lastDeathCause]});return}if(!won){attemptProgress.lose();syncSeasonChoices();clearWorldFires();hasFlashlight=false;torch.intensity=0;playDeathMusic()}endShown=true;paused=true;resultSaving=false;resultLocalSaved=false;resultGlobalSaved=false;if(!mobile){try{(document.exitPointerLock||document.webkitExitPointerLock)?.call(document)}catch{}}const best=(()=>{try{return JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]')}catch{return[]}})();$('endTitle').textContent=won?'🎉 Победа!':'💀 Игра окончена';$('endStats').innerHTML=`⏱ Время: <b>${formatTime(totalTime)}</b><br>🏆 Очки: <b>${score}</b><br>🍎 Кормлений: <b>${statsData.fed}</b><br>🌿 Собрано еды: <b>${statsData.forage}</b><br>🫐 Лечебных ягод: <b>${statsData.berries}</b><br>❤️ Получено урона: <b>${statsData.damage}</b><br>👨‍👩‍👦 Найдено семьи: <b>${familyFound}/4</b><br>🐗 Побеждено миньонов: <b>${statsData.minions}</b><br>👑 Ударов друга по боссу: <b>${statsData.bossHits}</b>`;$('playerName').value=localStorage.getItem('kabanchiki3d_player_name')||'';$('endScreen').style.display='grid';setTimeout(()=>{$('playerName').focus();$('playerName').select()},40)}async function submitGlobalResult(name){
 // v121: completed and failed runs use the same existing leaderboard row schema.
 const payload={player_name:name,score:Math.max(0,Math.round(score)),play_time:Math.max(0,Math.round(totalTime)),difficulty:selectedDiff,family:Math.max(0,Math.min(4,familyFound)),game_version:GAME_VERSION};
 try{const r=await fetch(`${SUPABASE_URL}/rest/v1/leaderboard`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload)});if(!r.ok)throw new Error(`HTTP ${r.status}`);return {ok:true}}catch(e){console.warn('Global leaderboard submit failed',e);return {ok:false,error:e}}
}
$('playerName').addEventListener('keydown',e=>{if(e.key!=='Enter')return;e.preventDefault();e.stopPropagation();if(resultGlobalSaved){restartGame();return}if(!resultSaving)$('saveResult').click()});$('endScreen').addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement!==$('playerName')&&resultGlobalSaved){e.preventDefault();e.stopPropagation();restartGame()}});$('saveResult').onclick=async()=>{if(resultSaving||resultGlobalSaved)return;const name=($('playerName').value.trim()||'Аноним').slice(0,20);resultSaving=true;$('saveResult').disabled=true;$('saveMsg').textContent='💾 Сохраняю результат…';let localOk=resultLocalSaved;if(!resultLocalSaved){try{localStorage.setItem('kabanchiki3d_player_name',name);const a=JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]');a.unshift({name,score,time:Math.round(totalTime),win,level,difficulty:selectedDiff,family:familyFound,version:GAME_VERSION,date:new Date().toLocaleDateString()});localStorage.setItem('kabanchiki3d_results',JSON.stringify(a.slice(0,50)));resultLocalSaved=true;localOk=true}catch{localOk=false}}let global={ok:resultGlobalSaved};if(!resultGlobalSaved)global=await submitGlobalResult(name);if(global.ok){resultGlobalSaved=true;$('saveMsg').textContent='✅ Результат сохранён один раз — на устройстве и в 🌍 мировой таблице!'}else $('saveMsg').textContent=(localOk?'✅ Локально сохранено один раз. ':'⚠️ Локальное сохранение недоступно. ')+'🌍 Мировая таблица сейчас недоступна — можно повторить отправку.';resultSaving=false;$('saveResult').disabled=resultGlobalSaved};function clearWorldFires(){resetStormLocationState();for(const [tree,b] of burningTrees){tree.remove(b.light);tree.remove(b.flames);restoreStormObject(tree)}burningTrees.clear();}
function resetNewRun(){deathSceneActive=deathSceneFinished=false;lastDeathCause='boar';lastDeathBoar=null;
 attemptProgress.begin();currentSeason=unlockedSeasons().includes(chosenSeason)?chosenSeason:attemptProgress.season;
 clearWorldFires();
 for(const tree of treeObjects){if(tree.userData.beforeYellowScale){tree.scale.copy(tree.userData.beforeYellowScale);delete tree.userData.beforeYellowScale;delete tree.userData.yellowAppleGrown}tree.traverse(o=>{if(o.material?.emissive)o.material.emissive.set(0x000000)})}
 if(friend?.g)scene.remove(friend.g);friend=null;mountedFriend=false;setRiderPose(false);friendKnockbackActive=false;friendYield.reset();friendAttack=0;
 hasFlashlight=false;torch.intensity=0;yellowMushroomStock=0;yellowAppleStock=0;fishStock=0;boarFormTime=0;catFormTime=0;if(catFormModel)catFormModel.g.visible=false;if(boarFormVisual)boarFormVisual.visible=false;boy.visible=true;
 for(const shot of shots)scene.remove(shot.g);shots.length=0;throwCooldown=0;hurricaneCarry=0;underwaterTime=0;underwaterDamageCd=0;weatherBaseSky=null;
}
function restartGame(){
 if(!mobile)requestDesktopMouseLock();stopMusic();stopCinematicMusic();cineClear();cinematicRunning=false;cinematicFinish=null;
 $('cinematic').style.display='none';$('endScreen').style.display='none';$('pauseMenu').style.display='none';$('familyPopup').style.display='none';$('statsScreen').style.display='none';
 win=false;started=true;paused=false;endShown=false;resultSaving=false;resultLocalSaved=false;resultGlobalSaved=false;life=diffCfg().playerHP;food=diffCfg().foodMax;score=0;familyFound=0;friendHP=diffCfg().friendHP;bossHits=0;damage=0;totalTime=0;invuln=0;
 resetNewRun();boy.position.set(0,0,4);py=0;vy=0;loadLevel(1);startMusic();notice('🌲 Новая игра началась. Найди семью!');
}
$('endRestart').onclick=restartGame;
function escStat(v){return String(v??'').replace(/[<>&"']/g,'')}
function localStatsHtml(){let a=[];try{a=JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]')}catch{}if(!a.length)return '<p>Пока нет сохранённых результатов. После игры введи имя и нажми «💾 Сохранить результат».</p>';const rows=a.slice().sort((x,y)=>(y.score||0)-(x.score||0)||(x.time||999999)-(y.time||999999)).slice(0,20);return '<div style="display:grid;grid-template-columns:34px 1fr 68px 70px 76px;gap:6px;align-items:center;font-size:13px"><b>№</b><b>Игрок</b><b>Очки</b><b>Время</b><b>Итог</b>'+rows.map((r,i)=>`<span>${i+1}</span><b>${escStat(r.name||'Аноним')}</b><span>🏆${r.score||0}</span><span>⏱${formatTime(r.time||0)}</span><span>${r.win?'✅ Победа':'💀 Проигрыш'}</span>`).join('')+'</div>'}
async function globalStatsHtml(){try{const q='select=player_name,score,play_time,difficulty,family,game_version&order=score.desc,play_time.asc&limit=20';const r=await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?${q}`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});if(!r.ok)throw new Error(`HTTP ${r.status}`);const rows=await r.json();if(!rows.length)return '<p>🌍 Мировой рейтинг пока пуст. Стань первым победителем!</p>';return '<div style="display:grid;grid-template-columns:30px 1fr 62px 66px 42px;gap:6px;align-items:center;font-size:13px"><b>№</b><b>Игрок</b><b>Очки</b><b>Время</b><b>Сл.</b>'+rows.map((x,i)=>`<span>${i+1}</span><b>${escStat(x.player_name||'Аноним')}</b><span>🏆${x.score||0}</span><span>⏱${formatTime(x.play_time||0)}</span><span>${Number(x.difficulty)+1}</span>`).join('')+'</div>'}catch(e){console.warn('Global leaderboard load failed',e);return '<p>⚠️ Не удалось загрузить мировой рейтинг. Проверь интернет — локальная статистика продолжает работать.</p>'}}
async function showPlayerStats(mode='global'){const box=$('statsTable');$('statsScreen').style.display='grid';box.innerHTML='<div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px"><button id="globalStatsTab">🌍 Мир</button><button id="localStatsTab">📱 Мои</button></div><div id="statsRows">Загрузка…</div>';const rows=$('statsRows'),g=$('globalStatsTab'),l=$('localStatsTab');const showLocal=()=>{rows.innerHTML=localStatsHtml();g.disabled=false;l.disabled=true};const showGlobal=async()=>{g.disabled=true;l.disabled=false;rows.textContent='🌍 Загружаю мировой ТОП-20…';rows.innerHTML=await globalStatsHtml()};g.onclick=showGlobal;l.onclick=showLocal;if(mode==='local')showLocal();else await showGlobal()}
$('showStatsIntro').onclick=()=>showPlayerStats('global');$('showStatsEnd').onclick=()=>showPlayerStats('global');$('closeStats').onclick=()=>$('statsScreen').style.display='none';
let noticeTimer=null;function notice(t){const m=$('message');m.textContent=t;m.classList.remove('hidden');flash=3;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>m.classList.add('hidden'),3200)}function hud(){$('stats').textContent=` · ${GAME_VERSION}${currentSeason==='winter'?' · ❄️ Зима':currentSeason==='autumn'?' · 🍂 Осень':currentSeason==='spring'?' · 🌸 Весна':''} · 📍 Локация ${level}/${levels.length}: ${levels[level-1]} · ❤️ ${life}/${diffCfg().playerHP} · 🍎 ${food}/${diffCfg().foodMax} · 🏆 ${score} · 🎮 ${DIFF_NAMES[selectedDiff]} · 👨‍👩‍👦 ${familyFound}/4${friend?` · 🐗❤️ ${friendHP}/${diffCfg().friendHP}`:''}${yellowMushroomStock?` · 🟡🍄 ${yellowMushroomStock}`:''}${yellowAppleStock?` · 🟡🍎 ${yellowAppleStock}`:''}${fishStock?' · 🐟 '+fishStock:''}${catFormTime>0?' · 🐱 '+Math.ceil(catFormTime)+'с':''}${hasFlashlight?' · 🔦':''}`+(level===6&&foes.find(f=>f.isBoss)?` · 👑 ${foes.find(f=>f.isBoss).hp}/${foes.find(f=>f.isBoss).maxHp}`:``); $('quest').textContent=win?'🎉 Тимур нашёл семью!':questState()}$('start').onclick=()=>{$('intro').style.display='none';$('difficultyScreen').style.display='grid'};$('difficultyBack').onclick=()=>{$('difficultyScreen').style.display='none';$('intro').style.display='grid'};$('difficultyStart').onclick=()=>{try{if(!mobile)requestDesktopMouseLock();selectedDiff=Number(document.querySelector('input[name="diff3d"]:checked')?.value??2);life=diffCfg().playerHP;food=diffCfg().foodMax;friendHP=diffCfg().friendHP;$('difficultyScreen').style.display='none';resetNewRun();applySeason();playCinematic('intro',()=>{started=true;paused=false;loadLevel(1);startMusic();notice(mobile?'📱 Камера: проведи пальцем по миру влево/вправо':'🖱️ Поворот камеры: зажми мышь и веди влево/вправо')})}catch(e){window.__showGameError('Ошибка запуска игры',e.stack||String(e))}};$('camera').onclick=()=>{camMode=(camMode+1)%9;first=false;$('camera').textContent=`📷 Вид ${camMode+1}/9`;$('cross').style.display='none';notice(['Высоко · далеко','Средне · далеко','Низко · близко','Очень высоко','За плечом','Низко · далеко','Сверху под углом','Близко · средне','Строго сверху · 90°'][camMode])};$('restart').onclick=restartGame;$('menuRestart').onclick=restartGame;$('jump').onpointerdown=e=>{e.preventDefault();jump=true};$('interact').onpointerdown=e=>{e.preventDefault();feed()};function setPause(on){if(!started)return;paused=on;$('pauseMenu').style.display=on?'grid':'none';$('pauseBtn').textContent=on?'▶':'☰';if(on&&!mobile){try{(document.exitPointerLock||document.webkitExitPointerLock)?.call(document)}catch{}}}function togglePause(){if(difficultyFromPause){closeDifficultyChoice();return}setPause(!paused)}$('pauseBtn').onclick=togglePause;$('resume').onclick=()=>{setPause(false);requestDesktopMouseLock()};
function syncAudioButtons(){const m=$('toggleMusic'),s=$('toggleSfx');if(m)m.textContent=musicEnabled?'🎵 Музыка: ВКЛ':'🔇 Музыка: ВЫКЛ';if(s)s.textContent=sfxEnabled?'🔊 Звуки: ВКЛ':'🔈 Звуки: ВЫКЛ'}
$('toggleMusic').onclick=()=>{musicEnabled=!musicEnabled;localStorage.setItem('kabanchiki3d_music',musicEnabled?'1':'0');if(musicEnabled)startMusic();else stopMusic();syncAudioButtons()};
$('toggleSfx').onclick=()=>{sfxEnabled=!sfxEnabled;localStorage.setItem('kabanchiki3d_sfx',sfxEnabled?'1':'0');syncAudioButtons()};syncAudioButtons();async function goFullscreen(){
  const active=document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement;
  try{
    if(active){
      const exit=document.exitFullscreen||document.webkitExitFullscreen||document.mozCancelFullScreen||document.msExitFullscreen;
      if(exit) await Promise.resolve(exit.call(document));
      return;
    }
    // Call the browser API directly from the button click (required by Chrome/Android).
    const targets=[document.documentElement,document.body,renderer.domElement];
    let lastError=null;
    for(const el of targets){
      const req=el.requestFullscreen||el.webkitRequestFullscreen||el.webkitRequestFullScreen||el.mozRequestFullScreen||el.msRequestFullscreen;
      if(!req) continue;
      try{
        await Promise.resolve(req.call(el));
        notice('⛶ Полноэкранный режим включён');
        syncFullscreenButton();
        return;
      }catch(err){lastError=err}
    }
    throw lastError||new Error('Fullscreen API unavailable');
  }catch(e){
    // A sandboxed iframe (including ChatGPT preview) can forbid fullscreen at browser level.
    notice('⛶ Браузер запретил полный экран этому встроенному окну. Открой игру отдельной вкладкой/на сайте — кнопка использует настоящий Fullscreen API.');
  }
}
function syncFullscreenButton(){
  const on=!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement);
  $('fullscreen').textContent=on?'🗗':'⛶';
  $('introFullscreen').textContent=on?'🗗 Выйти из полного экрана':'⛶ На весь экран';
  $('menuFullscreen').textContent=on?'🗗 Выйти из полного экрана':'⛶ Полный экран';
}
$('fullscreen').onclick=goFullscreen;$('menuFullscreen').onclick=goFullscreen;$('introFullscreen').onclick=goFullscreen;$('introSeason').onchange=chooseSeason;$('pauseSeason').onchange=chooseSeason;syncSeasonChoices();
let difficultyFromPause=false;
const startDifficultyRun=$('difficultyStart').onclick;
function closeDifficultyChoice(){
  $('difficultyScreen').style.display='none';
  $('difficultyStart').innerHTML='Отправиться в путь <span>→</span>';
  if(difficultyFromPause){difficultyFromPause=false;$('pauseMenu').style.display='grid'}
  else $('intro').style.display='grid';
}
$('difficultyBack').onclick=closeDifficultyChoice;
$('menuDifficulty').onclick=()=>{
  difficultyFromPause=true;
  document.querySelector(`input[name="diff3d"][value="${selectedDiff}"]`).checked=true;
  $('pauseMenu').style.display='none';$('difficultyScreen').style.display='grid';
  $('difficultyStart').textContent='Применить сложность';
};
$('difficultyStart').onclick=()=>{
  if(!difficultyFromPause)return startDifficultyRun();
  const previous=diffCfg(),next=Number(document.querySelector('input[name="diff3d"]:checked')?.value??selectedDiff);
  const healthRatio=life/previous.playerHP,friendRatio=friendHP/previous.friendHP;
  selectedDiff=next;
  life=Math.max(1,Math.ceil(healthRatio*diffCfg().playerHP));
  friendHP=Math.max(1,Math.ceil(friendRatio*diffCfg().friendHP));
  food=Math.min(food,diffCfg().foodMax);
  const boss=foes.find(f=>f.isBoss);
  if(boss&&boss.hp>0){const ratio=boss.hp/boss.maxHp;boss.maxHp=BOSS_HITS[selectedDiff];boss.hp=Math.max(1,Math.ceil(ratio*boss.maxHp))}
  closeDifficultyChoice();hud();notice(`🎮 Сложность: ${DIFF_NAMES[selectedDiff]}`);
};
function requestDesktopMouseLock(){
 if(mobile||__autoTest)return false;
 const el=renderer.domElement,request=el.requestPointerLock||el.webkitRequestPointerLock;
 if(!request)return false;
 try{const result=request.call(el);result?.catch?.(()=>{});return true}catch{return false}
}
document.addEventListener('pointerlockchange',()=>{if(!mobile&&started&&!cinematicRunning&&!win&&!endShown&&!document.pointerLockElement&&!paused)setPause(true)});
document.addEventListener('webkitpointerlockchange',()=>{if(!mobile&&started&&!cinematicRunning&&!win&&!endShown&&!document.pointerLockElement&&!document.webkitPointerLockElement&&!paused)setPause(true)});
document.addEventListener('mousemove',e=>{
 const locked=document.pointerLockElement===renderer.domElement||document.webkitPointerLockElement===renderer.domElement;
 if(!mobile&&locked&&started&&!paused&&!cinematicRunning)yaw-=e.movementX*.0027;
});
document.addEventListener('fullscreenchange',syncFullscreenButton);document.addEventListener('webkitfullscreenchange',syncFullscreenButton);document.addEventListener('mozfullscreenchange',syncFullscreenButton);document.addEventListener('MSFullscreenChange',syncFullscreenButton);document.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&!e.repeat){e.preventDefault();togglePause()}if(e.code==='KeyV'&&!e.repeat)$('camera').click();if(e.code==='Space'&&!e.repeat){jump=true;boy.userData.jumpQueuedAt=performance.now()};if((e.code==='KeyE'||e.code==='KeyF')&&!e.repeat)feed();if((e.code==='Enter'||e.code==='NumpadEnter')&&!e.repeat&&started&&!paused&&!win&&!endShown&&!cinematicRunning&&!e.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])')){e.preventDefault();feed()}if(e.code==='KeyP'&&!e.repeat)togglePause()});document.addEventListener('keyup',e=>keys[e.code]=false);renderer.domElement.addEventListener('pointerdown',e=>{e.preventDefault();if(!started)return;if(e.pointerType==='mouse'){
 const locked=document.pointerLockElement===renderer.domElement||document.webkitPointerLockElement===renderer.domElement;
 if(e.button===0){if(locked&&!paused&&!cinematicRunning)feed();else requestDesktopMouseLock();return}
 if(e.button===2){if(locked&&!paused&&!cinematicRunning){jump=true;boy.userData.jumpQueuedAt=performance.now()}else requestDesktopMouseLock();return}
 return
}drag={id:e.pointerId,x:e.clientX,y:e.clientY};try{renderer.domElement.setPointerCapture(e.pointerId)}catch(_){}});renderer.domElement.addEventListener('pointermove',e=>{if(e.cancelable)e.preventDefault();const locked=document.pointerLockElement===renderer.domElement||document.webkitPointerLockElement===renderer.domElement;if(e.pointerType==='mouse'&&locked)return;if(drag?.id!==e.pointerId)return;const delta=e.clientX-drag.x;/* v165: touch keeps drag camera; desktop prefers pointer-lock mouse look with drag fallback. */yaw+=(e.pointerType==='touch'?-delta:delta)*.006;drag.x=e.clientX;drag.y=e.clientY});function endCameraDrag(e){if(drag?.id===e.pointerId)drag=null}renderer.domElement.addEventListener('pointerup',endCameraDrag);renderer.domElement.addEventListener('pointercancel',endCameraDrag);renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());const stickEl=$('stick'),nub=$('nub');function setStick(e){const r=stickEl.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.max(1,Math.hypot(dx,dy)),s=Math.min(1,len/52);stick.x=dx/len*s;stick.y=dy/len*s;nub.style.transform=`translate(${stick.x*43}px,${stick.y*43}px)`}stickEl.addEventListener('pointerdown',e=>{e.preventDefault();stickPointer=e.pointerId;try{stickEl.setPointerCapture(e.pointerId)}catch{}setStick(e)});stickEl.addEventListener('pointermove',e=>{if(e.cancelable)e.preventDefault();if(stickPointer===e.pointerId)setStick(e)});stickEl.addEventListener('lostpointercapture',resetStick);function resetStick(e){if(stickPointer===e.pointerId){stickPointer=null;stick.x=stick.y=0;nub.style.transform=''}}stickEl.addEventListener('pointerup',resetStick);stickEl.addEventListener('pointercancel',resetStick);addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});makePortal();
const editable=e=>e.target?.closest?.('input,textarea,[contenteditable="true"]');
for(const event of ['selectstart','dragstart','gesturestart','gesturechange','gestureend'])document.addEventListener(event,e=>{if(!editable(e)&&e.cancelable)e.preventDefault()},{passive:false});
for(const event of ['touchstart','touchmove'])document.addEventListener(event,e=>{if(started&&!paused&&!cinematicRunning&&!editable(e)&&!e.target?.closest?.('button,select')&&e.cancelable)e.preventDefault()},{passive:false});
function clearInput(){keys={};drag=null;stickPointer=null;stick.x=stick.y=0;nub.style.transform='';jump=false;act=false}
addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInput()});renderer.domElement.addEventListener('lostpointercapture',endCameraDrag);
// Local visual inspection helper, available only in the existing autotest mode.
if(__autoTest)window.__KABANCHIKI_VISUAL__={focus(kind){if(kind==='portal'){portalObj.g.visible=true;boy.position.set(0,0,-35);yaw=Math.PI;camMode=1}else{const f=foes.find(f=>!f.flee);if(!f)return;boy.position.set(f.g.position.x,0,f.g.position.z+6);f.g.rotation.y=0;yaw=Math.PI;camMode=4}return {enemyEyes:foes.flatMap(f=>f.g.userData.enemyEyes||[]).filter(e=>e.visible).length,portalVisible:portalObj.g.visible}},befriend(){const f=foes[0];if(f)resolveMeat({g:new THREE.Group(),foe:f,type:'apple'});return friend?.g.userData.enemyEyes.every(e=>!e.visible)}};
function boarBodies(){const a=foes.filter(f=>f?.g&&!f.flee);if(friend?.g&&!friend.flee)a.push(friend);return a}
function boarRadius(b){return b?.isBoss?2.45:1.02}
// v124: transparency has two independent causes: camera occlusion and being inside Dad's house.
// Materials are cloned per mesh so fading one rock/house never fades every object sharing that material.
function ensureFadeMaterial(o){
 if(!o?.isMesh||!o.material)return;
 if(!o.userData._fadeOwnMaterial){o.material=o.material.clone();o.userData._fadeOwnMaterial=true}
 if(o.userData._fadeBaseOpacity===undefined){o.userData._fadeBaseOpacity=o.material.opacity??1;o.userData._fadeBaseTransparent=!!o.material.transparent;o.userData._fadeBaseDepthWrite=o.material.depthWrite!==false}
}
function applyObjectFade(o){
 if(!o?.isMesh||!o.material)return;ensureFadeMaterial(o);
 const cameraFade=o.userData._cameraFade?0.18:1,houseFade=o.userData._houseFade?0.16:1;
 // Dad's warm window must stay bright and readable even while the walls fade.
 const k=o.userData.familyWindow?1:Math.min(cameraFade,houseFade),base=o.userData._fadeBaseOpacity;
 o.material.opacity=base*k;o.material.transparent=k<1||o.userData._fadeBaseTransparent;o.material.depthWrite=k<1?false:o.userData._fadeBaseDepthWrite;
}
function setObjectCameraFade(root,on){if(!root)return;root.traverse(o=>{if(o.isMesh){o.userData._cameraFade=!!on;applyObjectFade(o)}})}
function setHouseTransparent(h,on){if(!h)return;h.traverse(o=>{if(o.isMesh){o.userData._houseFade=!!on;applyObjectFade(o)}})}
function familyHouseRevealAt(x,z){
 if(level!==3||!familyHideout?.visible)return false;
 // v124: use a generous local interior/threshold zone. This triggers as Timur crosses the real shell,
 // not only after he reaches a narrow point deeper inside the scaled house.
 familyHideout.updateWorldMatrix(true,true);const q=familyHideout.worldToLocal(new THREE.Vector3(x,0,z));
 const doorway=Math.abs(q.x)<1.18&&q.z>1.18&&q.z<2.82;
 const insideShell=q.x>-2.28&&q.x<2.28&&q.z>-2.18&&q.z<2.48;
 return doorway||insideShell;
}
function setDadHouseCutaway(on){
 const p=familyHideout?.userData?.cutawayWalls;if(!p)return;
 for(const side of ['front','back','left','right'])for(const m of p[side])m.visible=true;p.roof.visible=true;
 if(!on)return;
 familyHideout.updateWorldMatrix(true,true);const c=familyHideout.worldToLocal(camera.position.clone());
 const side=Math.abs(c.x)>Math.abs(c.z)?(c.x<0?'left':'right'):(c.z>0?'front':'back');
 for(const m of p[side])m.visible=false;p.roof.visible=false;
}
function updateFamilyHouseReveal(){
 const nowInside=familyHouseRevealAt(boy.position.x,boy.position.z);
 if(nowInside!==insideFamilyHouse){insideFamilyHouse=nowInside;if(nowInside)notice('🏠 Вошёл в дом — открылась сторона дома, теперь братика видно внутри!')}
 const door=familyHideout.localToWorld(new THREE.Vector3(0,0,2.3)),nearBoy=Math.hypot(boy.position.x-door.x,boy.position.z-door.z)<4.5,nearFriend=friend?.g&&Math.hypot(friend.g.position.x-door.x,friend.g.position.z-door.z)<4.5;familyDoor.userData.closed=!(nearBoy||nearFriend||nowInside);familyDoorHinge.rotation.y=familyDoor.userData.closed?0:-Math.PI*.48;
 familyWindow.material.opacity=nowInside?.18:1;familyWindow.material.depthWrite=false;
 setDadHouseCutaway(nowInside);
}
function houseBlockAt(x,z,pad=.45,allowJump=false){
 if(level!==3)return false;
 for(const wall of wallGeometry()){
  if(allowJump&&!mountedFriend&&py>wall.box.max.y+.04)continue;
  if(polygonContact(wall.polygon,x,z,pad))return true;
 }
 return false;
}
function treeTrunkShape(m){m.updateWorldMatrix(true,false);const c=new THREE.Vector3(),sc=new THREE.Vector3();m.getWorldPosition(c);m.getWorldScale(sc);return {x:c.x,z:c.z,r:(m.userData.collisionRadius??.68)*Math.max(Math.abs(sc.x),Math.abs(sc.z))*.96}}
function treeTrunkHit(m,x,z,r){const t=treeTrunkShape(m);return Math.hypot(x-t.x,z-t.z)<t.r+r}
function circleHitsTreeGeometry(x,z,r){
 // v106: tree collision is the actual cylindrical trunk footprint, not its world AABB.
 // This removes the invisible square/halo around rotated/scaled trees.
 for(const m of treeSolidMeshes){if(!m?.parent||m.parent.visible===false)continue;if(treeTrunkHit(m,x,z,r))return true}
 return false
}
// v101: rock collision follows the visible rounded footprint instead of the rotated Box3.
// A Box3 turns a rotated rock into a large invisible rectangle, which was the source of the
// "empty space around the stone" seen in the phone recording.
function rockShape(mesh){
 mesh.updateWorldMatrix(true,false);
 const sx=Math.max(.08,Math.abs(mesh.scale.x)),sz=Math.max(.08,Math.abs(mesh.scale.z));
 // DodecahedronGeometry(1) is roughly unit-radius. A tiny inset keeps the collision on the
 // visible stone rather than outside its silhouette.
 return {cx:mesh.position.x,cz:mesh.position.z,ax:sx*.92,az:sz*.92,yaw:mesh.rotation.y,top:new THREE.Box3().setFromObject(mesh).max.y};
}
function rockEllipse(mesh,x,z,pad=0){
 const q=rockShape(mesh),dx=x-q.cx,dz=z-q.cz,c=Math.cos(q.yaw),sn=Math.sin(q.yaw);
 const lx= dx*c-dz*sn,lz=dx*sn+dz*c,ax=q.ax+pad,az=q.az+pad;
 return {q,lx,lz,ax,az,n:(lx*lx)/(ax*ax)+(lz*lz)/(az*az)};
}
function rockFootprintHit(mesh,x,z,pad=.34,allowJump=true){
 if(!mesh||mesh.visible===false)return false;
 const e=rockEllipse(mesh,x,z,pad),top=e.q.top;
 // v105: riding height must never disable stone collision. The boar still slides around every rock.
 if(mountedFriend)return e.n<1;
 if(allowJump){
  if(py>top+.035)return false;
  // While airborne, side collision disappears only when the *actual ballistic apex* can
  // clear this top. There is no special teleport/step-up: vertical physics still does landing.
  const remainingRise=vy>0?(vy*vy)/(2*18):0;
  if(vy>0&&py>.04&&top<=py+remainingRise+.08)return false;
  // Descending above the top belongs to the landing solver, not side collision.
  if(vy<=0&&py>=top-.045)return false;
 }
 return e.n<1;
}
function pushOutOfRock(mesh){
 // v116: mounted and on-foot depenetration are deliberately separate. The rider always uses
 // the boar body radius, while Timur keeps the jump-aware rock rule so airborne movement can
 // cross a reachable rock footprint and land on its top instead of being pushed away.
 const riding=!!mountedFriend,bodyRadius=riding?MOUNTED_ROCK_RADIUS:ROCK_PLAYER_RADIUS;
 if(!mesh||mesh.visible===false||!rockFootprintHit(mesh,boy.position.x,boy.position.z,bodyRadius+.015,!riding))return false;
 const e=rockEllipse(mesh,boy.position.x,boy.position.z,bodyRadius+.025);
 // Radial projection in ellipse space gives a smooth rounded push, unlike snapping to one
 // side of an AABB. This also prevents the jitter/teleport effect at rock corners.
 let lx=e.lx,lz=e.lz;let n=Math.sqrt((lx*lx)/(e.ax*e.ax)+(lz*lz)/(e.az*e.az));
 if(n<.0001){lx=e.ax;lz=0;n=1}
 lx/=n;lz/=n;const c=Math.cos(e.q.yaw),sn=Math.sin(e.q.yaw);
 boy.position.x=e.q.cx+lx*c+lz*sn;boy.position.z=e.q.cz-lx*sn+lz*c;return true;
}
// v102: fallen logs use a capsule footprint: a thin segment with round ends, matching the visible trunk.
function logDistance(o,x,z){
 const dx=x-o.x,dz=z-o.z,c=Math.cos(o.yaw),sn=Math.sin(o.yaw),along=dx*c+dz*sn,side=-dx*sn+dz*c;
 const half=Math.max(.08,o.len*.5-o.r),clamped=Math.max(-half,Math.min(half,along));
 return {distance:Math.hypot(along-clamped,side),along,side,clamped,half};
}
function logFootprintHit(o,x,z,pad=PLAYER_RADIUS,allowJump=true){
 if(level!==1||!forestVisual.visible||!o?.g?.visible)return false;
 // v121: fallen branches are low traversal geometry, not walls. Normal player/rider movement may
 // cross their capsule footprint; the vertical solver supplies the visible step-over/jump arc.
 if(allowJump)return false;
 return logDistance(o,x,z).distance<o.r+pad;
}
function pushOutOfLog(o){
 if(!logFootprintHit(o,boy.position.x,boy.position.z,PLAYER_RADIUS+.015,true))return false;
 const d=logDistance(o,boy.position.x,boy.position.z),need=o.r+PLAYER_RADIUS+.025,c=Math.cos(o.yaw),sn=Math.sin(o.yaw);
 let vx=d.along-d.clamped,vz=d.side,n=Math.hypot(vx,vz);if(n<.0001){vx=0;vz=1;n=1}
 const a=d.clamped+vx/n*need,b=vz/n*need;
 boy.position.x=o.x+a*c-b*sn;boy.position.z=o.z+a*sn+b*c;return true;
}
const mountainFootprints=new WeakMap();
function mountainFootprint(mesh){
 let polygon=mountainFootprints.get(mesh);if(polygon)return polygon;
 mesh.updateWorldMatrix(true,false);const positions=mesh.geometry.attributes.position,index=mesh.geometry.index,points=[];
 const count=index?index.count:positions.count;
 // Clip triangles at ground level; buried cone bases must not create an invisible halo.
 for(let i=0;i<count;i+=3){const triangle=[];for(let j=0;j<3;j++)triangle.push(new THREE.Vector3().fromBufferAttribute(positions,index?index.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld));
  for(let j=0;j<3;j++){const a=triangle[j],b=triangle[(j+1)%3];if(a.y>=0)points.push({x:a.x,z:a.z});if((a.y<0)!==(b.y<0)){const t=-a.y/(b.y-a.y);points.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t})}}
 }
 polygon=convexHull(points);mountainFootprints.set(mesh,polygon);return polygon;
}
function mountainContactsAt(x,z,radius){
 if(level!==5)return [];
 const contacts=[];for(const [,,,mesh] of mountainObstacles)if(mesh&&mesh.parent?.visible!==false){const hit=polygonContact(mountainFootprint(mesh),x,z,radius);if(hit)contacts.push(hit)}return contacts;
}
function mountainBlockedAt(x,z,radius){return mountainContactsAt(x,z,radius).length>0}
function worldObstacleAt(x,z,pad=.38){
 // v105: only the visible trunk is solid; decorative/apple branches never create an invisible tree halo.
 if(circleHitsTreeGeometry(x,z,PLAYER_RADIUS+pad))return true;
 if(logObstacles.some(o=>logFootprintHit(o,x,z,PLAYER_RADIUS+pad,false)))return true;
 if(rockPositions.some(([, , ,m])=>m?.visible!==false&&rockFootprintHit(m,x,z,pad,false)))return true;
 if(mountainBlockedAt(x,z,pad))return true;
 if(level===6&&lairObstacles.some(([lx,lz,r,g])=>g.visible&&Math.hypot(x-lx,z-lz)<r+pad))return true;
 if(houseBlockAt(x,z,pad))return true;
 return false;
}
// v77: one collision model for player, generation audit and automated tests.
const PLAYER_RADIUS=.43,ROCK_PLAYER_RADIUS=.31,MOUNTED_ROCK_RADIUS=.78;
function solidCircles(){
 const out=[];
 for(let i=0;i<treePositions.length;i++){const t=treeObjects[i];if(t?.visible!==false){const [x,z]=treePositions[i];out.push({x,z,r:1.62,type:'tree'})}}
 for(const [x,z,r,m] of rockPositions)if(m?.visible!==false)out.push({x,z,r:r+.48,type:'rock'});

 if(level===6)for(const [x,z,r,g] of lairObstacles)if(g?.visible!==false)out.push({x,z,r:r+.52,type:'lair'});
 return out
}
function playerWorldBlocked(x,z,pad=0){
 if(x<-43.15||x>43.15||z<-43.15||z>43.15)return true;
 const rr=PLAYER_RADIUS+pad;
 // v165: on foot the bridge rail blocks at deck height, but a normal jump can clear it.
 if(level===4&&(mountedFriend||py<.62)&&bridgeRailBlocked(x,z,mountedFriend?.86:rr))return true;
 if(catLife.blocks(x,z,py,rr))return true;if(circleHitsTreeGeometry(x,z,rr))return true;
 if((mountedFriend||boarFormTime>0)&&(boarTreeContacts(playerBoarBody(),x,z).length||!boarLakeStepAllowed(playerBoarBody(),x,z)))return true;
 if(mountainBlockedAt(x,z,mountedFriend?MOUNTED_ROCK_RADIUS:rr))return true;
 if(logObstacles.some(o=>logFootprintHit(o,x,z,rr,true)))return true;
 if(rockPositions.some(([, , ,m])=>rockFootprintHit(m,x,z,ROCK_PLAYER_RADIUS+pad,true)))return true;
 if(solidCircles().some(o=>o.type!=='tree'&&o.type!=='rock'&&Math.hypot(x-o.x,z-o.z)<o.r+rr))return true;
 if(houseBlockAt(x,z,rr,true))return true;
 return false
}
function roofHeightAt(x,z){let top=0;if(level!==3)return top;for(const h of houseObjects){if(!h.visible)continue;h.updateWorldMatrix(true,true);for(const m of h.children){if(!m.isMesh||(!m.userData.dadRoof&&(seasonBaseMaterials.get(m)||m.material).map!==mats.roof.map))continue;m.geometry.computeBoundingBox();const q=m.worldToLocal(new THREE.Vector3(x,0,z)),b=m.geometry.boundingBox;if(q.x>b.min.x+PLAYER_RADIUS*.12&&q.x<b.max.x-PLAYER_RADIUS*.12&&q.z>b.min.z+PLAYER_RADIUS*.12&&q.z<b.max.z-PLAYER_RADIUS*.12){const world=m.localToWorld(new THREE.Vector3(q.x,b.max.y,q.z));top=Math.max(top,world.y)}}}return top}
function playerSupportHeightAtNoRock(x,z){return roofHeightAt(x,z)}
function familyFloorAt(x,z){if(level!==3||!familyHideout.visible)return 0;const p=familyHideout.worldToLocal(new THREE.Vector3(x,0,z));return Math.abs(p.x)<2.4&&p.z>-1.95&&p.z<2.08?.16:0}
function branchStepHeightAt(x,z){
 let top=familyFloorAt(x,z);if(level===1&&forestVisual.visible)for(const o of logObstacles)if(o?.g?.visible!==false&&logDistance(o,x,z).distance<o.r+PLAYER_RADIUS*.10)top=Math.max(top,o.top);return top;
}
function playerSupportHeightAt(x,z){
 let top=Math.max(familyFloorAt(x,z),level===4&&onRiverBridge(x,z)?.28:0);if(currentSeason==='winter'&&((level===2&&(lakeDepth(x,z)>0||lakeInletDepthAt(x,z)>0))||(level===4&&riverDepthAt(x,z)>0)))top=Math.max(top,level===2?.12:.05);
 // v121: a low branch creates a small physical step while crossing it; it never blocks horizontal motion.
 top=Math.max(top,branchStepHeightAt(x,z));
 // Rock tops are real platforms: land on them instead of being pushed back to the ground.
 for(const [, , ,m] of rockPositions){
  if(!m||m.visible===false)continue;const e=rockEllipse(m,x,z,PLAYER_RADIUS*.12);
  if(e.n<1)top=Math.max(top,e.q.top);
 }
 // Each roof section supports only its own physical footprint.
 const roofTop=roofHeightAt(x,z);if(py>=roofTop-.10)top=Math.max(top,roofTop);
 return top;
}
function depenetratePlayer(){
 if(mountedFriend||boarFormTime>0)resolveBoarClearance(playerBoarBody(),false);
 // Never leave Timur trapped inside a rock/tree after a level change, jump or knockback.
 for(let pass=0;pass<(mountedFriend?14:6);pass++){
  let changed=false;
  if(level===3&&!mountedFriend&&boarFormTime<=0)for(const wall of wallGeometry()){if(py>wall.box.max.y+.04)continue;const hit=polygonContact(wall.polygon,boy.position.x,boy.position.z,PLAYER_RADIUS);if(hit){boy.position.x+=hit.nx*(hit.depth+.004);boy.position.z+=hit.nz*(hit.depth+.004);changed=true}}
  for(const o of logObstacles)if(pushOutOfLog(o))changed=true;
  for(const [, , ,m] of rockPositions)if(pushOutOfRock(m))changed=true;
  for(const hit of mountainContactsAt(boy.position.x,boy.position.z,mountedFriend?MOUNTED_ROCK_RADIUS:PLAYER_RADIUS)){boy.position.x+=hit.nx*(hit.depth+.005);boy.position.z+=hit.nz*(hit.depth+.005);changed=true}
  for(const o of solidCircles().filter(o=>o.type!=='tree'&&o.type!=='rock')){
   let dx=boy.position.x-o.x,dz=boy.position.z-o.z,d=Math.hypot(dx,dz),need=o.r+PLAYER_RADIUS+.035;
   if(d<need){if(d<.001){dx=1;dz=0;d=1}boy.position.x=o.x+dx/d*need;boy.position.z=o.z+dz/d*need;changed=true}
  }
  boy.position.x=Math.max(-43.1,Math.min(43.1,boy.position.x));boy.position.z=Math.max(-43.1,Math.min(43.1,boy.position.z));
  if(!changed)break
 }
}
function mountedRockFreeAt(x,z,slack=0){
 // v119: one geometric truth for the whole mounted body against every visible rock.
 // This helper is independent of current rider state so audits can validate approach points too.
 return !rockPositions.some(([, , ,m])=>m?.visible!==false&&rockEllipse(m,x,z,MOUNTED_ROCK_RADIUS+slack).n<1);
}
function mountedRockBlocked(x,z){
 if(!mountedFriend)return false;
 
 return !mountedRockFreeAt(x,z,0);
}
function movementBlocked(x,z){return playerWorldBlocked(x,z,0)||mountedRockBlocked(x,z)}
function movePlayerCollisionStep(mx,mz){
 if(level===3)updateFamilyHouseReveal();catLife.avoidPlayer(boy.position.x+mx,boy.position.z+mz,boy.position.y,Math.min(.01,Math.hypot(mx,mz)/6));depenetratePlayer();
 if(Math.hypot(mx,mz)<.00001)return;
 const px=boy.position.x,pz=boy.position.z,tx=px+mx,tz=pz+mz;
 // v108: the mounted boar has a real stone footprint of its own. Do not reuse Timur's
 // much smaller rock radius, otherwise the boar model visibly clips through a stone.
 if(!movementBlocked(tx,tz)){boy.position.x=tx;boy.position.z=tz;return}
 const xFirst=Math.abs(mx)>=Math.abs(mz),attempts=xFirst?[[px+mx,pz],[px,pz+mz]]:[[px,pz+mz],[px+mx,pz]];
 for(const [x,z] of attempts)if(!movementBlocked(x,z)){boy.position.x=x;boy.position.z=z;return}
 let hitRock=null,hitN=Infinity;for(const [, , ,m] of rockPositions){if(!m||m.visible===false)continue;const e=rockEllipse(m,tx,tz,mountedFriend?MOUNTED_ROCK_RADIUS:ROCK_PLAYER_RADIUS);if(e.n<hitN){hitN=e.n;hitRock=m}}
 if(hitRock&&hitN<1){const radius=mountedFriend?MOUNTED_ROCK_RADIUS:ROCK_PLAYER_RADIUS,e=rockEllipse(hitRock,px,pz,radius+.012),c=Math.cos(e.q.yaw),sn=Math.sin(e.q.yaw);let wx=e.lx/e.ax,wz=e.lz/e.az,wl=Math.hypot(wx,wz)||1;wx/=wl;wz/=wl;const txl=-wz,tzl=wx,mag=Math.hypot(mx,mz);for(const sg of [1,-1]){const llx=txl*e.ax*mag*sg,llz=tzl*e.az*mag*sg;const sx=px+llx*c+llz*sn,sz=pz-llx*sn+llz*c;if(!movementBlocked(sx,sz)){boy.position.x=sx;boy.position.z=sz;return}}}
 let nearest=null,nd=Infinity;for(const m of treeSolidMeshes){if(!m?.parent||m.parent.visible===false)continue;const t=treeTrunkShape(m),d=Math.hypot(tx-t.x,tz-t.z)-(t.r+PLAYER_RADIUS);if(d<nd){nd=d;nearest={x:t.x,z:t.z,r:t.r}}}
 for(const o of solidCircles().filter(o=>o.type!=='rock'&&o.type!=='tree')){const d=Math.hypot(tx-o.x,tz-o.z)-(o.r+PLAYER_RADIUS);if(d<nd){nd=d;nearest=o}}
 for(const hit of mountainContactsAt(tx,tz,mountedFriend?MOUNTED_ROCK_RADIUS:PLAYER_RADIUS)){if(hit.depth<nd||!nearest){nd=hit.depth;nearest={x:hit.x,z:hit.z,r:0}}}
 if(nearest){const rx=px-nearest.x,rz=pz-nearest.z,rl=Math.hypot(rx,rz)||1,txv=-rz/rl,tzv=rx/rl,sgn=(mx*txv+mz*tzv)>=0?1:-1,mag=Math.hypot(mx,mz);const sx=px+txv*mag*sgn,sz=pz+tzv*mag*sgn;if(!movementBlocked(sx,sz)){boy.position.x=sx;boy.position.z=sz}}
}
function movePlayerCollision(mx,mz){
 // v107 swept/sub-stepped motion prevents a fast mounted boar from tunnelling through
 // a narrow rock between rendered frames. Every slice re-runs the full collision solver.
 const dist=Math.hypot(mx,mz),step=.055,n=Math.max(1,Math.ceil(dist/step));
 for(let i=0;i<n;i++){
  const safeX=boy.position.x,safeZ=boy.position.z,safeWater=(mountedFriend||boarFormTime>0)?boarWaterDepth(playerBoarBody()):0;
  movePlayerCollisionStep(mx/n,mz/n);
  if(level!==2&&!mountedFriend&&boarFormTime>0&&safeWater<=BOAR_MAX_WATER_DEPTH&&boarWaterDepth(playerBoarBody())>BOAR_MAX_WATER_DEPTH){boy.position.x=safeX;boy.position.z=safeZ}
  // v119: resolve the whole neighbouring-rock cluster, then require a globally valid mounted
  // footprint. If overlapping ellipses cannot be resolved simultaneously, keep the last safe
  // position instead of allowing one rock's push-out to place the boar inside another rock.
  if(mountedFriend){
   depenetratePlayer();
   if(!mountedRockFreeAt(boy.position.x,boy.position.z,.004)&&mountedRockFreeAt(safeX,safeZ,.004)){
    boy.position.x=safeX;boy.position.z=safeZ;
   }
  }
 }
}
function spawnPointBlocked(x,z,pad=.72,{allowRoad=false}={}){
 if(x<-41.5||x>41.5||z<-41.5||z>41.5)return true;
 if(level===2&&lakeRadiusAt(x,z)<14.5)return true;
 if(level===4&&Math.abs(z-riverCenterAt(x))<4.7)return true;
 if(!allowRoad&&Math.abs(x)<3.7)return true;
 return worldObstacleAt(x,z,pad);
}
function nearestSafeSpawn(x,z,pad=.72,opts={}){
 if(!spawnPointBlocked(x,z,pad,opts))return [x,z];
 for(const r of [2,3,4,5,6,8,10,12,16,20,24,28])for(let i=0;i<24;i++){
  const a=i/24*Math.PI*2,px=x+Math.sin(a)*r,pz=z+Math.cos(a)*r;
  if(!spawnPointBlocked(px,pz,pad,opts))return [px,pz];
 }
 return null;
}
function nearestVisibleAppleTree(x,z){
 let best=null,bd=Infinity;
 for(let i=0;i<treePositions.length;i++){const t=treeObjects[i];if(!t||t.visible===false)continue;const [tx,tz]=treePositions[i],d=Math.hypot(x-tx,z-tz);if(d<bd){bd=d;best=[tx,tz]}}
 return best?{x:best[0],z:best[1],d:bd}:null;
}
function nearestVisibleAppleBranch(x,z){let best=null,bd=Infinity;for(const br of treeBranchMeshes){if(!br?.parent||br.parent.visible===false)continue;br.updateWorldMatrix(true,false);const b=new THREE.Box3().setFromObject(br),p=new THREE.Vector3();b.clampPoint(new THREE.Vector3(x,(b.min.y+b.max.y)/2,z),p);const d=Math.hypot(x-p.x,z-p.z);if(d<bd){bd=d;best={branch:br,point:p,d}}}return best;}
function appleOnBranch(a){if(!a||a.type!=='apple')return true;const br=a.branch,tree=a.tree||a.g?.userData?.appleTree;if(!br?.parent||!tree||tree.visible===false||!tree.userData?.isTree||br.parent!==tree||!br.userData?.appleTwig)return false;br.updateWorldMatrix(true,false);const tip=new THREE.Vector3(0,.46,0).applyMatrix4(br.matrixWorld);const tipGap=Math.hypot(a.x-tip.x,a.z-tip.z,(a.y+.16)-tip.y);return tipGap<.16;}
function appleOutsideOwnTrunk(a){if(!a||a.type!=='apple')return true;const tree=a.tree||a.g?.userData?.appleTree;if(!tree)return false;const trunk=tree.children.find(o=>o.isMesh&&o.geometry===trunkGeo);if(!trunk)return false;const t=treeTrunkShape(trunk);return Math.hypot(a.x-t.x,a.z-t.z)>=t.r+.18}
function runForageRoadAudit(){const issues=[],samples=[];for(const a of apples){if(a.done)continue;if(level===2&&a.type==='mushroom')issues.push('lake-mushroom');if(a.type==='apple'){const outside=appleOutsideOwnTrunk(a);samples.push({type:'apple',outside});if(!outside)issues.push('apple-inside-tree')}}for(const [, , ,m] of rockPositions){if(!m||m.visible===false)continue;const q=rockShape(m),clear=roadClearForRadius(q.cx,q.cz,Math.max(q.ax,q.az),.08);if(!clear)issues.push(`road-rock:${q.cx.toFixed(1)},${q.cz.toFixed(1)}`)}if(level===5)for(const [x,z,r] of mountainObstacles)if(!roadClearForRadius(x,z,r,.08))issues.push(`road-mountain:${x.toFixed(1)},${z.toFixed(1)}`);if(level===6)for(const [x,z,r,g] of lairObstacles)if(g?.visible!==false&&!roadClearForRadius(x,z,r,.08))issues.push(`road-lair:${x.toFixed(1)},${z.toFixed(1)}`);return {ok:issues.length===0,issues,samples,level,mushrooms:apples.filter(a=>!a.done&&a.type==='mushroom').length}}
window.__KABANCHIKI_FORAGE_ROAD_AUDIT__=runForageRoadAudit;
function runForagePlacementAudit(){const issues=[],samples=[];for(const a of apples){if(a.done)continue;const gy=a.g?.position?.y??999;if(['mushroom','cabbage','berry','catberry'].includes(a.type)){const grounded=Math.abs(gy-terrainHeightAt(a.x,a.z))<.001;samples.push({type:a.type,y:+gy.toFixed(3),grounded,bonus:!!a.bonus});if(!grounded)issues.push(`forage-off-ground:${a.type}:${gy.toFixed(2)}`)}else if(a.type==='apple'){const onTree=appleOnBranch(a),aboveTimur=(a.y||0)>=2.05,reachable=(a.y||0)<=2.08;samples.push({type:'apple',y:+(a.y||0).toFixed(3),onTree,aboveTimur,reachable,bonus:!!a.bonus});if(!onTree)issues.push('apple-not-on-tree');if(!aboveTimur)issues.push(`apple-below-child-height:${(a.y||0).toFixed(2)}`);if(!reachable)issues.push(`apple-too-high:${(a.y||0).toFixed(2)}`)}}return {ok:issues.length===0,issues,samples,bonusChance:BONUS_FORAGE_CHANCE,berryBonusChance:BERRY_BONUS_CHANCE,level}}
window.__KABANCHIKI_FORAGE_PLACEMENT_AUDIT__=runForagePlacementAudit;
function runJumpSurfaceAudit(){const oldLevel=level,ox=boy.position.x,oy=boy.position.y,oz=boy.position.z,opy=py,ovy=vy,issues=[],samples=[];for(const sample of [{lv:1,x:0,z:8,name:'grass'},{lv:2,x:10,z:10,name:'lake-land'},{lv:3,x:0,z:8,name:'village'},{lv:4,x:0,z:riverCenterAt(0),name:'bridge'}]){level=sample.lv;const support=playerSupportHeightAt(sample.x,sample.z);py=support;vy=0;const grounded=Math.abs(py-support)<.13&&vy<=.12;samples.push({...sample,support:+support.toFixed(3),grounded});if(!grounded)issues.push('jump-support-'+sample.name);if(sample.name==='bridge'&&Math.abs(support-.28)>.02)issues.push('bridge-support')}level=oldLevel;boy.position.set(ox,oy,oz);py=opy;vy=ovy;return {ok:issues.length===0,issues,samples}}
window.__KABANCHIKI_JUMP_SURFACE_AUDIT__=runJumpSurfaceAudit;
function runSunShadowAudit(){const same=sun.position.distanceTo(sunDisc.position)<.01,casters=[];scene.traverse(o=>{if(o.isMesh&&o.visible&&o!==ground&&o!==skyDome&&o!==sunDisc&&o!==grassBlades&&o!==meadowGrass&&!(o.material?.transparent&&o.material?.opacity<.20))casters.push(o)});const missing=casters.filter(o=>!o.castShadow).length;return {ok:same&&sunDisc.visible&&missing===0,sunAligned:same,sunVisible:sunDisc.visible,visibleSolidMeshes:casters.length,missingCasters:missing,shadowCamera:[sun.shadow.camera.left,sun.shadow.camera.right,sun.shadow.camera.top,sun.shadow.camera.bottom],shadowFar:sun.shadow.camera.far}}
window.__KABANCHIKI_SUN_SHADOW_AUDIT__=runSunShadowAudit;
function repairTreeApples(issues,repairs){
 for(const a of apples){if(a.done||a.type!=='apple'||a.y<=1)continue;if(appleOnBranch(a))continue;const n=nearestVisibleAppleBranch(a.x,a.z);if(!n){issues.push('apple-no-visible-branch');continue}const p=branchApplePoint(n.branch);if(!p){issues.push('apple-no-visible-branch');continue}a.g.position.set(p[0],p[2],p[1]);a.x=p[0];a.z=p[1];a.y=p[2];a.branch=p[3];a.tree=p[4];a.g.userData.appleBranch=p[3];a.g.userData.appleTree=p[4];repairs.push('apple-branch-anchor');if(!appleOnBranch(a))issues.push(`apple-off-branch:${a.x.toFixed(1)},${a.z.toFixed(1)}`);
 }
}

function runOcclusionVisibilityAudit(){
 const issues=[],samples=[];
 // Verify per-object fade does not leak through shared materials and restores cleanly.
 const candidates=[treeObjects.find(o=>o?.visible),rockPositions.find(q=>q[3]?.visible)?.[3],houseObjects.find(o=>o?.visible),ridgeObjects.find(o=>o?.visible)].filter(Boolean);
 for(const root of candidates){let mesh=null;root.traverse?.(o=>{if(!mesh&&o.isMesh&&!o.userData.familyWindow)mesh=o});if(root.isMesh)mesh=root;if(!mesh)continue;setObjectCameraFade(root,true);const faded=mesh.material.opacity<.5;setObjectCameraFade(root,false);const restored=mesh.material.opacity>.75;samples.push({faded,restored});if(!faded)issues.push('camera-occluder-not-faded');if(!restored)issues.push('camera-occluder-not-restored')}
 if(level===3&&familyHideout?.visible){
  const old=insideFamilyHouse;setDadHouseCutaway(true);const cp=familyHideout.userData.cutawayWalls;const hiddenWalls=['front','back','left','right'].flatMap(k=>cp[k]).filter(m=>!m.visible).length;if(hiddenWalls<1||hiddenWalls>Math.max(...['front','back','left','right'].map(k=>cp[k].length)))issues.push('dad-house-cutaway-wrong-wall-count');if(!cp.roof||cp.roof.visible)issues.push('dad-house-roof-not-cutaway');if(!familyWindow?.visible||familyWindow.material.opacity<.9)issues.push('dad-window-not-bright');if(!hideDoorGlow?.visible||hideDoorGlow.intensity<10||!dadInteriorGlow?.visible)issues.push('dad-house-light-off');setDadHouseCutaway(old);
 }
 return {ok:issues.length===0,issues,samples,level};
}
window.__KABANCHIKI_OCCLUSION_AUDIT__=runOcclusionVisibilityAudit;
function runWorldIntegrityAudit(){
 const issues=[];
 // Elevated apples must visibly belong to a currently visible tree and sit outside its trunk.
 for(const a of apples){if(a.done||a.type!=='apple'||a.y<=1)continue;if(!appleOnBranch(a))issues.push(`apple-off-branch:${a.x.toFixed(1)},${a.z.toFixed(1)}`);if(!appleOutsideOwnTrunk(a))issues.push(`apple-inside-tree:${a.x.toFixed(1)},${a.z.toFixed(1)}`)}
 const forageRoadAudit=runForageRoadAudit();if(!forageRoadAudit.ok)issues.push(...forageRoadAudit.issues);const foragePlacementAudit=runForagePlacementAudit();if(!foragePlacementAudit.ok)issues.push(...foragePlacementAudit.issues);
 // The father's hideout must actually become translucent from a point inside its walkable room.
 if(level===3&&familyHideout?.visible){const ox=boy.position.x,oz=boy.position.z,oldInside=insideFamilyHouse;familyHideout.updateWorldMatrix(true,true);const doorWorld=new THREE.Vector3(0,0,1.72).applyMatrix4(familyHideout.matrixWorld);boy.position.x=doorWorld.x;boy.position.z=doorWorld.z;insideFamilyHouse=false;setHouseTransparent(familyHideout,false);updateFamilyHouseReveal();const cp=familyHideout.userData.cutawayWalls;const hiddenAtDoor=['front','back','left','right'].flatMap(k=>cp[k]).some(m=>!m.visible);if(!hiddenAtDoor||cp.roof.visible)issues.push('family-house-cutaway-not-open-at-door');if(!familyHouseRevealAt(doorWorld.x,doorWorld.z))issues.push('family-house-door-reveal-zone-missing');const brother=familyMembers.find(f=>f.role===2&&!f.done);if(!brother)issues.push('family-brother-missing');else{const dl=familyHideout.worldToLocal(new THREE.Vector3(brother.x,0,brother.z));if(!(dl.x>-1.85&&dl.x<.55&&dl.z>-1.72&&dl.z<2.08))issues.push('family-brother-outside-house');if(!brother.g.visible)issues.push('family-brother-not-visible');}const fw=familyWindow?.getWorldPosition(new THREE.Vector3()),fl=familyHideout.worldToLocal(fw.clone());if(familyWindow?.parent!==hideDoor||hideDoor.parent!==familyHideout)issues.push('family-window-detached');if(Math.abs(fl.x+1.55)>.08||Math.abs(fl.z-2.315)>.08)issues.push('family-window-off-wall');setDadHouseCutaway(false);insideFamilyHouse=oldInside;boy.position.x=ox;boy.position.z=oz}
 // Rock collision must leave player-sized corridors when the visible AABB gap is clearly wide enough.
 const rs=rockPositions.filter(([, , ,m])=>m?.visible!==false).map((r,i)=>{r[3].updateWorldMatrix(true,false);return {i,b:new THREE.Box3().setFromObject(r[3])}});let corridors=0;
 for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){const a=rs[i].b,b=rs[j].b;const gx=Math.max(0,Math.max(a.min.x,b.min.x)-Math.min(a.max.x,b.max.x)),gz=Math.max(0,Math.max(a.min.z,b.min.z)-Math.min(a.max.z,b.max.z));const gap=Math.hypot(gx,gz);if(gap>=1.05&&gap<=2.2)corridors++}
 // v98: zero naturally occurring sample pairs is not a failure by itself; a deterministic synthetic corridor probe validates the mechanic.
 if(rs.length>1&&corridors===0){}
 return {ok:issues.length===0,issues,level,treeApples:apples.filter(a=>!a.done&&a.type==='apple'&&a.y>1).length,rockCorridors:corridors,familyHouseChecked:level===3};
}
function runFamilyPlacementAudit(){const issues=[],spots=familyMembers.filter(f=>!f.done).map(f=>({role:f.role,x:+f.x.toFixed(2),z:+f.z.toFixed(2)}));for(const f of familyMembers){if(level===3&&f.role===2)continue;if(Math.abs(f.x)<5.2)issues.push(`family-on-road:${f.role}`);if(worldObstacleAt(f.x,f.z,.55))issues.push(`family-in-obstacle:${f.role}`)}if(level===3){const brother=familyMembers.find(f=>f.role===2);if(!brother)issues.push('family-brother-missing');else{const q=familyHideout.worldToLocal(new THREE.Vector3(brother.x,0,brother.z));if(!(q.x>-1.85&&q.x<.55&&q.z>-1.72&&q.z<2.08))issues.push('family-brother-not-in-hideout')}const door=new THREE.Vector3(0,0,1.72).applyMatrix4(familyHideout.matrixWorld);if(!familyHouseRevealAt(door.x,door.z))issues.push('family-house-not-reveal-at-entry')}return {ok:issues.length===0,issues,spots,hideout:level===3?{x:+familyHideout.position.x.toFixed(1),z:+familyHideout.position.z.toFixed(1)}:null,level}}
window.__KABANCHIKI_FAMILY_PLACEMENT_AUDIT__=runFamilyPlacementAudit;
function repairAndAuditSpawns(){
 const issues=[],repairs=[];repairTreeApples(issues,repairs);
 const fixBoar=(b,label,allowRoad=false)=>{if(!b?.g)return;if(spawnPointBlocked(b.g.position.x,b.g.position.z,boarRadius(b)*.72,{allowRoad})){
   const q=nearestSafeSpawn(b.g.position.x,b.g.position.z,boarRadius(b)*.72,{allowRoad});
   if(q){b.g.position.x=q[0];b.g.position.z=q[1];b.x=q[0];b.z=q[1];b.roamX=q[0];b.roamZ=q[1];repairs.push(label)}else issues.push(`spawn-blocked:${label}`)
  }};
 if(friend)fixBoar(friend,'friend',mountedFriend);
 foes.forEach((b,i)=>fixBoar(b,b.isBoss?'boss':`boar${i}`,!!b.isBoss));
 for(const a of apples){if(a.y>1)continue;if(spawnPointBlocked(a.g.position.x,a.g.position.z,.38)){const q=nearestSafeSpawn(a.g.position.x,a.g.position.z,.38);if(q){a.g.position.x=q[0];a.g.position.z=q[1];a.x=q[0];a.z=q[1];a.g.position.y=terrainHeightAt(a.x,a.z);repairs.push(`forage-${a.type}`)}else issues.push(`spawn-blocked:forage-${a.type}`)}}
 for(const f of familyMembers){if(level===3&&f.role===2)continue;if(spawnPointBlocked(f.g.position.x,f.g.position.z,.55)){const q=nearestSafeSpawn(f.g.position.x,f.g.position.z,.55);if(q){f.g.position.x=q[0];f.g.position.z=q[1];f.x=q[0];f.z=q[1];f.g.position.y=terrainHeightAt(f.x,f.z);repairs.push(`family${f.role}`)}else issues.push(`spawn-blocked:family${f.role}`)}}
 // Recheck after repair: no ordinary boar/ground pickup/family member may begin inside scenery or on the road.
 const check=(x,z,pad,label,opts={})=>{if(spawnPointBlocked(x,z,pad,opts))issues.push(`spawn-invalid:${label}`)};
 if(friend)check(friend.g.position.x,friend.g.position.z,boarRadius(friend)*.72,'friend',{allowRoad:mountedFriend});
 foes.forEach((b,i)=>check(b.g.position.x,b.g.position.z,boarRadius(b)*.72,b.isBoss?'boss':`boar${i}`,{allowRoad:!!b.isBoss}));
 apples.forEach((a,i)=>{if(a.y<=1)check(a.g.position.x,a.g.position.z,.38,`forage${i}`)});
 familyMembers.forEach((f,i)=>{if(!(level===3&&f.role===2))check(f.g.position.x,f.g.position.z,.55,`family${i}`)});
 return {ok:issues.length===0,issues,repairs,level,boars:foes.length+(friend?1:0),forage:apples.length,family:familyMembers.length};
}
function runCollisionAudit(){
 const issues=[];
 // Every ordinary family member must be clear of solid scenery. Father is intentionally inside the enterable house.
 for(const f of familyMembers){if(level===3&&f.role===2)continue;if(worldObstacleAt(f.x,f.z,.55))issues.push(`family-in-obstacle:${f.role}`)}
 // v115: do not call an intentionally clustered mountain/lair prop "sealed" just because all
 // four cardinal samples overlap neighbouring scenery. Spawn Guard is the meaningful trap check;
 // rocks and trees are covered by geometry-aware robot audits below/after this audit.
 // Keep a bounds sanity check for environmental circles without turning valid clusters into random CI failures.
 for(const o of solidCircles().filter(o=>o.type==='mountain'||o.type==='lair'))if(!Number.isFinite(o.x)||!Number.isFinite(o.z)||!Number.isFinite(o.r)||o.r<=0)issues.push(`invalid-${o.type}-circle`);
 // Probe every visible trunk/branch: a player-sized circle at its projected box center must be blocked.
 for(const m of treeSolidMeshes){if(!m?.parent||m.parent.visible===false)continue;m.updateWorldMatrix(true,false);const b=new THREE.Box3().setFromObject(m),c=new THREE.Vector3();b.getCenter(c);if(!circleHitsTreeGeometry(c.x,c.z,PLAYER_RADIUS))issues.push(`branch-not-solid:${c.x.toFixed(1)},${c.z.toFixed(1)}`)}
 return {ok:issues.length===0,issues,obstacles:solidCircles().length,preciseRockFootprints:rockPositions.filter(([, , ,m])=>m?.visible!==false).length,treeSolids:treeSolidMeshes.filter(m=>m?.parent&&m.parent.visible!==false).length,level}
}
// v85: geometry-aware robot collision test with destination-clear escape probes. It tests real penetration and escape without
// treating a neighbouring obstacle or a deliberately walkable low rock as a collision bug.
function runRobotCollisionTest(){
 const issues=[],samples=[];const ox=boy.position.x,oz=boy.position.z,opy=py,ovy=vy,oy=boy.position.y;
 // v110: judge collision by the actual obstacle geometry after movement, not by total distance moved.
 // The solver is allowed to slide tangentially around a rounded obstacle, so "moved almost the full
 // requested distance" is NOT pass-through. A failure means the player penetrated or crossed to the
 // far side of the same obstacle. This uses the same trunk circle / rotated rock ellipse as gameplay.
 const run=(label,sx,sz,mx,mz,insideFn,crossFn,expectBlocked)=>{
  boy.position.set(sx,0,sz);py=0;vy=0;
  const bx=sx,bz=sz;let pathPenetrated=false;const steps=Math.max(1,Math.ceil(Math.hypot(mx,mz)/.055));for(let i=0;i<steps;i++){const px=boy.position.x,pz=boy.position.z;movePlayerCollision(mx/steps,mz/steps);for(let j=1;j<=4;j++)if(insideFn(px+(boy.position.x-px)*j/4,pz+(boy.position.z-pz)*j/4))pathPenetrated=true}
  const fx=boy.position.x,fz=boy.position.z,moved=Math.hypot(fx-bx,fz-bz);
  const penetrated=insideFn(fx,fz),crossed=crossFn?crossFn(fx,fz):false,blocked=!penetrated&&!pathPenetrated;
  samples.push({label,moved:+moved.toFixed(3),blocked,penetrated,crossed,pathPenetrated});
  if(expectBlocked&&(penetrated||pathPenetrated))issues.push(`robot-pass-through:${label}`);
  if(!expectBlocked&&moved<Math.hypot(mx,mz)*.55)issues.push(`robot-stuck:${label}`);
  return blocked;
 };
 let ti=0;for(const m of treeSolidMeshes){if(ti>=24)break;if(!m?.parent||m.parent.visible===false)continue;
  const t=treeTrunkShape(m),edge=t.r+PLAYER_RADIUS+.10;
  const dirs=[['E',1,0],['W',-1,0],['S',0,1],['N',0,-1]];
  for(const [name,ux,uz] of dirs){
   const sx=t.x+ux*edge,sz=t.z+uz*edge;
   if(playerWorldBlocked(sx,sz)){samples.push({label:`tree${ti}-${name}-crowded`,moved:0,blocked:true,skipped:true});continue}
   const inside=(x,z)=>treeTrunkHit(m,x,z,PLAYER_RADIUS-.01);
   const crossed=(x,z)=>(x-t.x)*ux+(z-t.z)*uz<-(t.r+PLAYER_RADIUS*.35);
   run(`tree${ti}-${name}-into`,sx,sz,-ux*(edge*2+.20),-uz*(edge*2+.20),inside,crossed,true);
   const ax=sx+ux*.42,az=sz+uz*.42;
   if(!playerWorldBlocked(ax,az))run(`tree${ti}-${name}-away`,sx,sz,ux*.42,uz*.42,inside,null,false);
   else samples.push({label:`tree${ti}-${name}-away-crowded`,moved:0,blocked:true,skipped:true});
  }
  ti++
 }
 let ri=0;for(const [, , ,m] of rockPositions){if(ri>=20)break;if(!m||m.visible===false)continue;
  const q=rockShape(m),c=Math.cos(q.yaw),sn=Math.sin(q.yaw),edge=q.ax+ROCK_PLAYER_RADIUS+.10;
  const ux=c,uz=-sn,sx=q.cx+ux*edge,sz=q.cz+uz*edge;
  const inside=(x,z)=>rockEllipse(m,x,z,ROCK_PLAYER_RADIUS).n<.985;
  const crossed=(x,z)=>{const e=rockEllipse(m,x,z,ROCK_PLAYER_RADIUS);return e.lx<-(e.ax*.35)};
  if(!playerWorldBlocked(sx,sz)){
   run(`rock${ri}-into`,sx,sz,-ux*(edge*2+.20),-uz*(edge*2+.20),inside,crossed,true);
   const ax=sx+ux*.42,az=sz+uz*.42;
   if(!playerWorldBlocked(ax,az))run(`rock${ri}-away`,sx,sz,ux*.42,uz*.42,inside,null,false);
   else samples.push({label:`rock${ri}-away-crowded`,moved:0,blocked:true,skipped:true});
  }else samples.push({label:`rock${ri}-crowded`,moved:0,blocked:true,skipped:true});
  // Above the real top, crossing the footprint is intentionally allowed.
  boy.position.set(sx,q.top+.18,sz);py=q.top+.18;vy=0;
  const bx=boy.position.x,bz=boy.position.z,want=edge*2+.20;movePlayerCollision(-ux*want,-uz*want);
  const jumpMoved=Math.hypot(boy.position.x-bx,boy.position.z-bz),jumpBlocked=jumpMoved<want*.65;
  samples.push({label:`rock${ri}-jump`,moved:+jumpMoved.toFixed(3),blocked:jumpBlocked});if(jumpBlocked)issues.push(`robot-jump-blocked:rock${ri}`);ri++
 }
 boy.position.set(ox,oy,oz);py=opy;vy=ovy;
 return {ok:issues.length===0,issues,samples:samples.slice(0,220),treesTested:ti,rocksTested:ri,level};
}
// v98: real-trajectory rock climb audit. Unlike the old robot "jump" probe, this starts on the ground,
// applies the same jump velocity/gravity as gameplay, moves toward a real rock every frame and requires a landing on top.
function runRockClimbAudit(){
 const issues=[],samples=[];const ox=boy.position.x,oz=boy.position.z,opy=py,ovy=vy,oy=boy.position.y;
 const dirs=[[1,0],[-1,0],[0,1],[0,-1]];let tested=0,passed=0;
 for(let ri=0;ri<rockPositions.length&&tested<12;ri++){
  const m=rockPositions[ri][3];if(!m||m.visible===false)continue;m.updateWorldMatrix(true,false);const b=new THREE.Box3().setFromObject(m),c=new THREE.Vector3();b.getCenter(c);
  // Normal jump apex is ~1.36 m. Test only genuinely reachable rocks.
  if(b.max.y<.22||b.max.y>1.34)continue;
  let chosen=null;
  for(const [ux,uz] of dirs){
   const ex=(b.max.x-b.min.x)/2,ez=(b.max.z-b.min.z)/2;
   const sx=c.x+ux*(ex+ROCK_PLAYER_RADIUS+.18),sz=c.z+uz*(ez+ROCK_PLAYER_RADIUS+.18);
   if(!playerWorldBlocked(sx,sz)){chosen=[ux,uz,sx,sz];break}
  }
  if(!chosen)continue;tested++;const [ux,uz,sx,sz]=chosen;
  boy.position.set(sx,0,sz);py=0;vy=7;boy.position.y=0;let landed=false,maxY=0;
  for(let frame=0;frame<100;frame++){
   // Move toward the rock until Timur is actually over its support footprint, then stop
   // horizontal input and let the normal vertical solver complete the landing.
   const supportBefore=playerSupportHeightAt(boy.position.x,boy.position.z);
   if(supportBefore<.12)movePlayerCollision(-ux*.075,-uz*.075);
   const prev=py;vy-=18/60;let next=py+vy/60;const support=playerSupportHeightAt(boy.position.x,boy.position.z);
   if(vy<=0&&prev>=support-.04&&next<=support){py=support;vy=0}else{py=Math.max(0,next);if(py===0)vy=0}
   boy.position.y=py;maxY=Math.max(maxY,py);
   if(vy===0&&support>0.12&&Math.abs(py-b.max.y)<.10){landed=true;break}
   if(vy===0&&py===0&&frame>25)break;
  }
  samples.push({rock:ri,top:+b.max.y.toFixed(3),maxY:+maxY.toFixed(3),landed});
  if(landed)passed++;else issues.push(`rock-climb-failed:${ri}:top=${b.max.y.toFixed(2)}`);
 }
 boy.position.set(ox,oy,oz);py=opy;vy=ovy;
 if(tested===0)issues.push('rock-climb-no-reachable-samples');
 return {ok:issues.length===0,issues,tested,passed,samples,level};
}
// v101: regression test for the exact phone-video failure: visible corner clearance and smooth orbiting.
function runRockEdgeAudit(){
 const issues=[],samples=[];let tested=0;
 for(let ri=0;ri<rockPositions.length&&tested<10;ri++){
  const m=rockPositions[ri][3];if(!m||m.visible===false)continue;const q=rockShape(m);tested++;
  // A point just outside the rounded visible corner must be free. The old Box3 collision failed this.
  const a=q.yaw,c=Math.cos(a),sn=Math.sin(a),lx=q.ax*.82+ROCK_PLAYER_RADIUS+.12,lz=q.az*.82+ROCK_PLAYER_RADIUS+.12;
  const x=q.cx+lx*c+lz*sn,z=q.cz-lx*sn+lz*c;const cornerBlocked=rockFootprintHit(m,x,z,ROCK_PLAYER_RADIUS,true);
  if(cornerBlocked)issues.push(`rock-invisible-corner:${ri}`);
  // 16 points on a player-radius orbit must not collide with this rock.
  let orbitBlocked=0;for(let k=0;k<16;k++){const t=k/16*Math.PI*2,ex=(q.ax+ROCK_PLAYER_RADIUS+.08)*Math.cos(t),ez=(q.az+ROCK_PLAYER_RADIUS+.08)*Math.sin(t),px=q.cx+ex*c+ez*sn,pz=q.cz-ex*sn+ez*c;if(rockFootprintHit(m,px,pz,ROCK_PLAYER_RADIUS,true))orbitBlocked++}
  if(orbitBlocked)issues.push(`rock-orbit-blocked:${ri}:${orbitBlocked}`);samples.push({rock:ri,cornerBlocked,orbitBlocked});
 }
 if(!tested)issues.push('rock-edge-no-samples');return {ok:issues.length===0,issues,tested,samples,level};
}
window.__KABANCHIKI_ROCK_EDGE_AUDIT__=runRockEdgeAudit;
// Deterministic corridor math check: a visibly player-wide gap must remain wider than two collision pads.
function runLogPhysicsAudit(){
 const issues=[],samples=[];if(level!==1)return {ok:true,issues,tested:0,samples,level};
 const save={x:boy.position.x,z:boy.position.z,py,vy};let tested=0;
 for(let i=0;i<Math.min(9,logObstacles.length);i++){
  const o=logObstacles[i],c=Math.cos(o.yaw),sn=Math.sin(o.yaw),clear=o.r+PLAYER_RADIUS+.10;
  // Both rounded ends and both side lanes must be usable immediately outside the visible capsule.
  const pts=[[o.x+c*(o.len/2+PLAYER_RADIUS+.08),o.z+sn*(o.len/2+PLAYER_RADIUS+.08)],
             [o.x-c*(o.len/2+PLAYER_RADIUS+.08),o.z-sn*(o.len/2+PLAYER_RADIUS+.08)],
             [o.x-sn*clear,o.z+c*clear],[o.x+sn*clear,o.z-c*clear]];
  const free=pts.every(([x,z])=>!logFootprintHit(o,x,z,0,false));
  // A normal jump from beside the log must clear its low top without teleport/step-up.
  py=0;vy=7;let cleared=false,maxY=0;for(let f=0;f<70;f++){vy-=18/60;py+=vy/60;maxY=Math.max(maxY,py);if(py>o.top+.04&&!logFootprintHit(o,o.x,o.z,PLAYER_RADIUS,true))cleared=true;if(py<=0&&vy<0){py=0;break}}
  samples.push({log:i,freeEndsAndSides:free,jumpClears:cleared,top:+o.top.toFixed(2),maxY:+maxY.toFixed(2)});tested++;
  if(!free)issues.push(`log-clearance-failed:${i}`);if(!cleared)issues.push(`log-jump-failed:${i}`);
 }
 boy.position.set(save.x,save.py,save.z);py=save.py;vy=save.vy;
 return {ok:issues.length===0,issues,tested,samples,level};
}
window.__KABANCHIKI_LOG_PHYSICS_AUDIT__=runLogPhysicsAudit;
function runBranchAppleAudit(){const issues=[],samples=[];let checked=0;for(const a of apples){if(a.done||a.type!=='apple'||a.y<=1)continue;const ok=appleOnBranch(a);samples.push({x:+a.x.toFixed(2),z:+a.z.toFixed(2),y:+a.y.toFixed(2),onBranch:ok});checked++;if(!ok)issues.push(`apple-off-branch:${a.x.toFixed(1)},${a.z.toFixed(1)}`)}return {ok:issues.length===0,issues,checked,samples,level};}
window.__KABANCHIKI_BRANCH_APPLE_AUDIT__=runBranchAppleAudit;
function runTreeTrunkAudit(){const issues=[],samples=[];for(let i=0;i<Math.min(20,treeObjects.length);i++){const g=treeObjects[i];if(!g?.visible)continue;const trunk=g.children.find(o=>o.isMesh&&o.geometry===trunkGeo);if(!trunk)continue;const t=treeTrunkShape(trunk),near=t.r+PLAYER_RADIUS+.06;const blockedInside=treeTrunkHit(trunk,t.x+t.r*.5,t.z,PLAYER_RADIUS),freeX=!treeTrunkHit(trunk,t.x+near,t.z,PLAYER_RADIUS),freeZ=!treeTrunkHit(trunk,t.x,t.z+near,PLAYER_RADIUS);samples.push({radius:+t.r.toFixed(2),blockedInside,freeX,freeZ});if(!blockedInside)issues.push(`tree-trunk-not-solid:${i}`);if(!freeX||!freeZ)issues.push(`tree-halo:${i}`)}return {ok:issues.length===0,issues,samples,level};}
function runReachableAppleTwigAudit(){const issues=[],samples=[];for(const a of apples){if(a.done||a.type!=='apple')continue;const twig=a.branch,tree=a.tree||a.g?.userData?.appleTree,treeVisible=!!tree&&tree.visible!==false,attached=treeVisible&&!!twig?.userData?.appleTwig&&!!twig.parent&&twig.parent===tree&&!!tree?.userData?.isTree,aboveTimur=(a.y||0)>=2.05,reachable=(a.y||0)<=2.08;let tipGap=999,on=false;if(attached){tree.updateWorldMatrix(true,true);twig.updateWorldMatrix(true,false);const tip=new THREE.Vector3(0,.46,0).applyMatrix4(twig.matrixWorld);tipGap=Math.hypot(a.x-tip.x,a.z-tip.z,(a.y+.16)-tip.y);on=tipGap<.16&&appleOnBranch(a)}samples.push({y:+(a.y||0).toFixed(2),treeVisible,attached,aboveTimur,reachable,on,tipGap:+tipGap.toFixed(3)});if(!treeVisible)issues.push('apple-hidden-tree');if(!attached)issues.push('apple-not-on-tree-twig');if(!aboveTimur)issues.push(`apple-below-child-height:${(a.y||0).toFixed(2)}`);if(!reachable)issues.push(`apple-too-high:${(a.y||0).toFixed(2)}`);if(!on)issues.push('apple-off-visible-twig')}return {ok:issues.length===0,issues,samples,level};}
function runBranchTraversalAudit(){
 const issues=[],samples=[];
 // Fallen branches belong to the forest. Other maps intentionally hide forestVisual, so there is
 // no branch traversal contract to test there.
 if(level!==1||!forestVisual.visible)return {ok:true,issues,tested:0,samples,level};
 const oldMounted=mountedFriend,oldPy=py,oldVy=vy,ox=boy.position.x,oz=boy.position.z,oy=boy.position.y;
 mountedFriend=false;py=0;vy=0;let tested=0;
 for(let bi=0;bi<logObstacles.length&&tested<8;bi++){
  const o=logObstacles[bi];if(!o?.g?.visible)continue;
  // Cross the branch ACROSS its capsule, not along its length. Try either side and only use a
  // generated sample whose approach/exit are clear of unrelated rocks/trees/world geometry.
  const c=Math.cos(o.yaw),sn=Math.sin(o.yaw),nx=-sn,nz=c,start=o.r+PLAYER_RADIUS+.42;
  let dir=0;
  for(const sg of [1,-1]){
   const sx=o.x+nx*start*sg,sz=o.z+nz*start*sg,ex=o.x-nx*start*sg,ez=o.z-nz*start*sg;
   if(!playerWorldBlocked(sx,sz)&&!playerWorldBlocked(ex,ez)){dir=sg;break}
  }
  if(!dir)continue;
  const sx=o.x+nx*start*dir,sz=o.z+nz*start*dir;
  boy.position.set(sx,0,sz);py=0;vy=0;let crossed=false,maxSupport=0,maxY=0;
  for(let k=0;k<42;k++){
   movePlayerCollision(-nx*.065*dir,-nz*.065*dir);
   if(level===4&&onRiverBridge(boy.position.x,boy.position.z)&&py<.28&&vy<=0)py=.28;
 const branchTop=branchStepHeightAt(boy.position.x,boy.position.z);maxSupport=Math.max(maxSupport,branchTop);
   // Use the same low-obstacle step-up rule as live gameplay.
   if(py<=.08&&vy<=.05&&branchTop>0){py=branchTop;vy=0}
   else if(branchTop<=0&&py>0){py=Math.max(0,py-.055)}
   boy.position.y=py;maxY=Math.max(maxY,py);
   const side=-(boy.position.x-o.x)*sn+(boy.position.z-o.z)*c;
   if(side*dir<-(o.r+PLAYER_RADIUS*.08)){crossed=true;break}
  }
  samples.push({branch:bi,crossed,maxSupport:+maxSupport.toFixed(3),maxY:+maxY.toFixed(3)});
  if(!crossed)issues.push(`foot-branch-not-crossed:${bi}`);
  if(maxSupport<=0||maxY<=0)issues.push(`foot-branch-no-bump:${bi}`);
  tested++;
 }
 mountedFriend=oldMounted;py=oldPy;vy=oldVy;boy.position.set(ox,oy,oz);
 if(tested<3)issues.push(`foot-branch-too-few-clear-samples:${tested}`);
 return {ok:issues.length===0,issues,tested,samples,level};
}
function runTreeRockPassageAudit(){
 const issues=[],samples=[];let tested=0;
 // Real generated tree/rock pairs: if the visible-edge gap is wider than Timur's body,
 // sample the middle of that gap. It must not be rejected by either object's collision.
 for(const tm of treeSolidMeshes){if(!tm?.parent||tm.parent.visible===false)continue;const t=treeTrunkShape(tm);
  for(const [, , ,rm] of rockPositions){if(!rm?.visible)continue;const q=rockShape(rm),dx=q.cx-t.x,dz=q.cz-t.z,d=Math.hypot(dx,dz);if(d<.01)continue;const ux=dx/d,uz=dz/d;
   const rockR=Math.sqrt((q.ax*ux)**2+(q.az*uz)**2),gap=d-t.r-rockR,need=PLAYER_RADIUS*2+.05;
   if(gap<need||gap>need+.75)continue;const x=t.x+ux*(t.r+gap*.5),z=t.z+uz*(t.r+gap*.5),treeHit=treeTrunkHit(tm,x,z,PLAYER_RADIUS),rockHit=rockFootprintHit(rm,x,z,ROCK_PLAYER_RADIUS,true);
   samples.push({gap:+gap.toFixed(2),need:+need.toFixed(2),free:!treeHit&&!rockHit});tested++;if(treeHit||rockHit)issues.push(`tree-rock-visible-gap-blocked:${gap.toFixed(2)}`);if(tested>=18)break;
  }if(tested>=18)break;
 }
 return {ok:issues.length===0,issues,tested,samples,playerRadius:PLAYER_RADIUS,level};
}
function runMountedMultiRockAudit(){
 const issues=[],samples=[],oldMounted=mountedFriend,oldPy=py,ox=boy.position.x,oz=boy.position.z,oy=boy.position.y;mountedFriend=true;py=1.18;let tested=0;
 // v108: drive straight at REAL stones and measure the mounted body footprint every step.
 // Going around a rounded stone is valid; entering its expanded visible footprint is not.
 for(const [, , ,m] of rockPositions){if(!m?.visible)continue;const q=rockShape(m),dirx=Math.cos(q.yaw),dirz=Math.sin(q.yaw);let start=Math.max(q.ax,q.az)+MOUNTED_ROCK_RADIUS+.70;
  // v119: begin every real-rock probe from a globally valid rider footprint. A neighbouring
  // overlapping rock must not make the audit start already embedded before the first sweep.
  for(let back=0;back<24&&!mountedRockFreeAt(q.cx-dirx*start,q.cz-dirz*start,.004);back++)start+=.18;
  boy.position.set(q.cx-dirx*start,1.18,q.cz-dirz*start);let minN=99,penetrated=false,maxLateral=0;
  for(let k=0;k<110;k++){movePlayerCollision(dirx*.055,dirz*.055);const e=rockEllipse(m,boy.position.x,boy.position.z,MOUNTED_ROCK_RADIUS);minN=Math.min(minN,e.n);maxLateral=Math.max(maxLateral,Math.abs(e.lz));if(e.n<.985||!mountedRockFreeAt(boy.position.x,boy.position.z,-.006)){penetrated=true;break}}
  samples.push({top:+q.top.toFixed(2),penetrated,minN:+minN.toFixed(3),maxLateral:+maxLateral.toFixed(2)});tested++;if(penetrated)issues.push(`mounted-rock-penetrated:${tested-1}`);if(tested>=16)break;
 }
 boy.position.set(ox,oy,oz);mountedFriend=oldMounted;py=oldPy;if(tested<2)issues.push('mounted-rock-too-few-samples');return {ok:issues.length===0,issues,tested,samples,mountedRadius:MOUNTED_ROCK_RADIUS,level};
}
function runMountedTerrainAudit(){const issues=[];const rockPad=MOUNTED_ROCK_RADIUS;if(rockPad<.65||rockPad>.90)issues.push(`mounted-rock-body-radius:${rockPad.toFixed(2)}`);const logStepThrough=true;return {ok:issues.length===0,issues,rockPad:+rockPad.toFixed(2),logStepThrough,level};}
window.__KABANCHIKI_MOUNTED_TERRAIN_AUDIT__=runMountedTerrainAudit;
function runRockCorridorAudit(){
 const required=ROCK_PLAYER_RADIUS*2+.10;const syntheticGap=1.10;
 const issues=[];if(syntheticGap<=required)issues.push(`rock-corridor-radius-too-wide:${required.toFixed(2)}`);
 return {ok:issues.length===0,issues,required:+required.toFixed(2),syntheticGap,level};
}
// v99: mounted riders collect tree apples without having to dismount. Keep the rule centralized so gameplay and the audit use the same code.
function canCollectForage(a){
 if(!a||a.done)return false;
 const nearForage=Math.hypot(a.x-boy.position.x,a.z-boy.position.z)<1.25;
 const appleReach=a.type!=='apple'||mountedFriend||(py>.58&&Math.abs((a.y||0)-boy.position.y)<1.18);
 return nearForage&&appleReach;
}
function startBoarForm(){catFormTime=0;if(catFormModel)catFormModel.g.visible=false;boarFormTime=30;if(mountedFriend){mountedFriend=false;setRiderPose(false);py=0;vy=0;boy.position.y=0}if(!boarFormVisual){const q=makeBoar(boy.position.x,boy.position.z,true);boarFormVisual=q.g;q.aura.visible=false;q.bolt.visible=false;for(const mesh of q.g.children)if(mesh.isMesh&&mesh.geometry.type==='RingGeometry')mesh.visible=false;q.g.scale.setScalar(.86)}boarFormVisual.visible=true;boy.visible=false;bonusSound();notice('🟡 Ягода превратила Тимура в кабанчика на 30 секунд! Можно ходить, собирать еду и кормить кабанчиков. Враги принимают Тимура за своего!')}
function startCatForm(){stopFishing();boarFormTime=0;if(boarFormVisual)boarFormVisual.visible=false;catFormTime=CAT_FORM_SECONDS;if(mountedFriend){mountedFriend=false;setRiderPose(false);py=vy=0}if(!catFormModel){catFormModel=catLife.model(2,scene);catFormModel.g.scale.setScalar(1.35)}catFormModel.g.visible=true;boy.visible=false;bonusSound();notice('🌸🐱 Тимур стал котиком на 30 секунд! Высоко прыгай и корми кабанчиков — они не атакуют.');hud()}
function updateCatForm(dt,now){if(catFormTime<=0)return;catFormTime=formTimeAfterStep(catFormTime,dt);if(catFormTime===0){catFormModel.g.visible=false;boy.visible=true;bonusSound();notice('✨ Тимур снова стал собой!')}else{catFormModel.g.position.copy(boy.position);catFormModel.g.rotation.y=boy.rotation.y;catFormModel.tail.rotation.y=Math.sin(now*.006)*.5;for(const [i,leg] of catFormModel.legs.entries())leg.rotation.x=Math.hypot(stick.x,stick.y)>.08||keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD?Math.sin(now*.018+i%2*Math.PI)*.6:0}}
function endBoarForm(){boarFormTime=0;catFormTime=0;if(catFormModel)catFormModel.g.visible=false;if(boarFormVisual)boarFormVisual.visible=false;boy.visible=true;bonusSound();notice('✨ Тимур снова стал собой!')}
function growBoarFromApple(f){if(!f?.g||f.appleGrown)return;f.appleGrown=true;f.g.scale.y*=1.5;bonusSound()}
function setBoarYellow(f){if(!f?.g||f.yellowPermanent)return;f.yellowPermanent=true;f.g.traverse(o=>{if(o.isMesh&&o.material?.color){o.material=o.material.clone();o.material.color.set(0xffd92f)}});bonusSound();notice(f.isBoss?'🟡 Босс стал жёлтым!':'🟡 Кабанчик стал жёлтым!')}
function collectForageItem(a,silent=false){
 if(!a||a.done)return false;a.done=true;scene.remove(a.g);score+=diffScore(5);
 if(a.type==='catberry'){statsData.berries++;startCatForm()}
 else if(a.bonus&&a.type==='berry'){statsData.berries++;startBoarForm()}
 else if(a.bonus&&a.type==='mushroom'){yellowMushroomStock++;statsData.forage++;bonusSound();if(!silent)notice(`🟡 Жёлтый мухомор! Следующее кормление накормит и навсегда окрасит кабанчика или босса. Запас: ${yellowMushroomStock}`)}
 else if(a.bonus&&a.type==='apple'){yellowAppleStock++;statsData.forage++;if(a.tree&&!a.tree.userData.yellowAppleGrown){a.tree.userData.beforeYellowScale=a.tree.scale.clone();a.tree.scale.y*=3;a.tree.userData.yellowAppleGrown=true;repairTreeApples([],[])}bonusSound();if(!silent)notice(`🍏✨ Жёлтое яблоко в запасе: ${yellowAppleStock}. Дерево стало втрое выше! Накорми кабанчика — он вырастет в 1,5 раза по высоте.`)}
 else if(a.type==='berry'){const before=life;life=Math.min(diffCfg().playerHP,life+1);statsData.berries++;if(!silent){sound(760,.16,'sine');notice(before<diffCfg().playerHP?'🫐 Ягоды восстановили 1❤️!':'🫐 Ягоды собраны, но здоровье уже полное.')}}
 else{food=Math.min(diffCfg().foodMax,food+1);statsData.forage++;if(!silent){sound(560,.12,'triangle');notice(`🌿 Собрано: ${foodLabel(a.type)} · еда ${food}/${diffCfg().foodMax}`)}}
 return true;
}
function runMountedAppleAudit(){
 const issues=[];const oldMounted=mountedFriend,oldFood=food,oldScore=score,oldForage=statsData.forage,ox=boy.position.x,oz=boy.position.z,oy=boy.position.y,opy=py;
 const max=diffCfg().foodMax;const testApple={g:new THREE.Group(),x:12.25,z:-7.5,y:1.72,type:'apple',done:false};scene.add(testApple.g);testApple.g.position.set(testApple.x,testApple.y,testApple.z);
 mountedFriend=true;food=Math.max(0,max-1);boy.position.set(testApple.x,1.18,testApple.z);py=1.18;
 const before=food,reachable=canCollectForage(testApple),collected=reachable&&collectForageItem(testApple,true),after=food;
 if(!reachable)issues.push('mounted-apple-not-reachable');if(!collected||!testApple.done)issues.push('mounted-apple-not-collected');if(after!==Math.min(max,before+1))issues.push(`mounted-apple-food:${before}->${after}`);
 scene.remove(testApple.g);mountedFriend=oldMounted;food=oldFood;score=oldScore;statsData.forage=oldForage;boy.position.set(ox,oy,oz);py=opy;
 return {ok:issues.length===0,issues,reachable,collected,before,after,level};
}
window.__KABANCHIKI_MOUNTED_APPLE_AUDIT__=runMountedAppleAudit;
window.__KABANCHIKI_ROCK_CLIMB_AUDIT__=runRockClimbAudit;
window.__KABANCHIKI_ROCK_CORRIDOR_AUDIT__=runRockCorridorAudit;
window.__KABANCHIKI_COLLISION_AUDIT__=runCollisionAudit;
window.__KABANCHIKI_SPAWN_AUDIT__=repairAndAuditSpawns;
window.__KABANCHIKI_ROBOT_TEST__=runRobotCollisionTest;
function validFamilySpot(f){
 if(worldObstacleAt(f.x,f.z,.15))return false;
 if(Math.abs(f.x)<3.6)return false; // keep family off the road
 return true;
}
function slideAroundTree(px,pz,nx,nz,r=.82){
 let best=null,bestMove=0;
 for(let i=0;i<treePositions.length;i++){
  if(treeObjects[i]?.visible===false)continue;
  const [tx,tz]=treePositions[i],dx=nx-tx,dz=nz-tz,d=Math.hypot(dx,dz);
  if(d>=r)continue;
  const mx=nx-px,mz=nz-pz,ml=Math.hypot(mx,mz)||1;
  const rx=px-tx,rz=pz-tz,rl=Math.hypot(rx,rz)||1;
  const tangentA={x:-rz/rl,z:rx/rl},tangentB={x:rz/rl,z:-rx/rl};
  const ta=mx/ml*tangentA.x+mz/ml*tangentA.z,tb=mx/ml*tangentB.x+mz/ml*tangentB.z;
  const t=ta>=tb?tangentA:tangentB;
  const speed=.34; // deliberately slow, soft tree slide
  const sx=px+t.x*Math.hypot(mx,mz)*speed,sz=pz+t.z*Math.hypot(mx,mz)*speed;
  if(!houseBlockAt(sx,sz,.35)&&!rockPositions.some(([x,z,rr,m])=>m?.visible!==false&&Math.hypot(sx-x,sz-z)<rr+.38)){
    const moved=Math.hypot(sx-px,sz-pz);if(moved>bestMove){bestMove=moved;best={x:sx,z:sz}}
  }
 }
 return best
}
function boarScale(f){return f.bodyScale??Math.max(Math.abs(f.g.scale.x),Math.abs(f.g.scale.z))}
function boarBody(f,x=f.g.position.x,z=f.g.position.z,yaw=f.g.rotation.y){return capsuleAt(x,z,yaw,boarScale(f))}
function playerBoarBody(){return {g:boy,bodyScale:boarFormTime>0?.86:(friend?boarScale(friend):1)}}
function playerBodyRadius(){return boarFormTime>0?.90:PLAYER_RADIUS}
function boarWaterDepth(f,x=f.g.position.x,z=f.g.position.z){if(level!==2&&level!==4)return 0;const body=boarBody(f,x,z);let depth=0;for(const [px,pz] of [[body.ax,body.az],[x,z],[body.bx,body.bz]])for(const [ox,oz] of [[0,0],[body.r,0],[-body.r,0],[0,body.r],[0,-body.r]])depth=Math.max(depth,lakeDepthAt(px+ox,pz+oz));return depth}
function controlledSwimmer(f){return mountedFriend&&(f===friend||f.g===boy)}
function boarLakeStepAllowed(f,x,z){if(level===2||controlledSwimmer(f))return true;return shallowStepAllowed(boarWaterDepth(f),boarWaterDepth(f,x,z))}
let boarCollisionEpoch=0;const boarTrunkCache=new WeakMap();
function cachedBoarTrunk(m){let cached=boarTrunkCache.get(m);if(!cached||cached.epoch!==boarCollisionEpoch){cached={epoch:boarCollisionEpoch,shape:treeTrunkShape(m)};boarTrunkCache.set(m,cached)}return cached.shape}
function boarTreeContacts(f,x=f.g.position.x,z=f.g.position.z,yaw=f.g.rotation.y){
 const body=boarBody(f,x,z,yaw),contacts=[];
 for(const m of treeSolidMeshes){if(!m?.parent||m.parent.visible===false)continue;const q=cachedBoarTrunk(m),reach=1.65*boarScale(f)+q.r;if(Math.abs(x-q.x)>reach||Math.abs(z-q.z)>reach)continue;const hit=capsuleCircleContact(body,q.x,q.z,q.r);if(hit)contacts.push(hit)}return contacts;
}
function boarPlayerContact(f,x=f.g.position.x,z=f.g.position.z,yaw=f.g.rotation.y,playerX=boy.position.x,playerZ=boy.position.z){
 const body=boarBody(f,x,z,yaw);
 if(boarFormTime>0){const player=boarBody(playerBoarBody(),playerX,playerZ);player.r+=.07;return capsuleCapsuleContact(body,player)}
 return capsuleCircleContact(body,playerX,playerZ,PLAYER_RADIUS+.07)
}
function boarsInContact(a,b,padding=0){const body=boarBody(a);body.r+=padding;return !!capsuleCapsuleContact(body,boarBody(b))}
function boarShouldChasePlayer(f,d){return attacksPlayer(boarFormTime+catFormTime)&&d<13&&d>1.05}
function boarAttackDistance(f){return 1.65*boarScale(f)+playerBodyRadius()+.18}
let wallCacheEpoch=-1,wallCache=[];
function wallGeometry(){if(wallCacheEpoch!==worldEpoch){wallCacheEpoch=worldEpoch;wallCache=[];if(level===3)for(const h of houseObjects){const walls=h.userData.cutawayWalls,objects=walls?[...walls.front,...walls.back,...walls.left,...walls.right,...(h===familyHideout?houseFurnishings.children:[])]:[h];for(const o of objects){if(o.userData.doorLintel)continue;o.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(o);wallCache.push({root:h,box,polygon:[{x:box.min.x,z:box.min.z},{x:box.max.x,z:box.min.z},{x:box.max.x,z:box.max.z},{x:box.min.x,z:box.max.z}]})}}}const result=wallCache.filter(q=>q.root.visible);if(level===3&&familyHideout.visible&&familyDoor.userData.closed){const box=new THREE.Box3().setFromObject(familyDoor);result.push({root:familyHideout,box,polygon:[{x:box.min.x,z:box.min.z},{x:box.max.x,z:box.min.z},{x:box.max.x,z:box.max.z},{x:box.min.x,z:box.max.z}]})}return result}
function clearWallLine(a,b){const start={x:a.x,y:a.y??.8,z:a.z},end={x:b.x,y:b.y??.8,z:b.z};if(wallGeometry().some(w=>segmentHitsBox(start,end,w.box)))return false;if(level===3&&familyHideout.visible&&familyDoor.userData.closed){const box=new THREE.Box3().setFromObject(familyDoor);if(segmentHitsBox(start,end,box))return false}return true}
function boarWallContacts(f,x=f.g.position.x,z=f.g.position.z,yaw=f.g.rotation.y){const body=boarBody(f,x,z,yaw),contacts=[];for(const w of wallGeometry())for(const [px,pz] of [[body.ax,body.az],[(body.ax+body.bx)/2,(body.az+body.bz)/2],[body.bx,body.bz]]){const hit=polygonContact(w.polygon,px,pz,body.r+.04);if(hit)contacts.push(hit)}return contacts}
const companionChecks={checks:0,repairs:0,replans:0};
function companionValid(f,x=f.g.position.x,z=f.g.position.z,yaw=f.g.rotation.y){return !boarSceneryBlockedAt(f,x,z,yaw)}
function repairCompanion(f,force=false){if(!f?.g||f.flee)return;const now=performance.now();if(!force&&now-(f.g.userData.lastRecoveryAt||0)<200)return;f.g.userData.lastRecoveryAt=now;companionChecks.checks++;if(companionValid(f)){f.lastSafe={x:f.g.position.x,z:f.g.position.z,yaw:f.g.rotation.y};return}const current={x:f.g.position.x,z:f.g.position.z};let safe=null;for(let r=.15;r<5&&!safe;r+=.25)for(let i=0;i<24;i++){const a=i/24*Math.PI*2,x=current.x+Math.sin(a)*r,z=current.z+Math.cos(a)*r;if(companionValid(f,x,z)){safe={x,z};break}}if(!safe&&f.lastSafe&&companionValid(f,f.lastSafe.x,f.lastSafe.z,f.lastSafe.yaw))safe=f.lastSafe;if(safe){f.g.position.x=safe.x;f.g.position.z=safe.z;f.navigation=null;companionChecks.repairs++}}
function companionNavBlocked(f){const scale=boarScale(f),radius=.88*scale,trees=treeObjects.filter(t=>t.visible).map(t=>{const m=t.children.find(m=>m.userData.treeSolid);return m?treeTrunkShape(m):null}).filter(Boolean),rocks=rockPositions.filter(q=>q[3]?.visible!==false&&q[3]?.parent?.visible!==false).map(q=>rockShape(q[3])),walls=wallGeometry(),mountains=level===5?mountainObstacles.filter(q=>q[3]?.parent?.visible!==false).map(q=>mountainFootprint(q[3])):[];return (x,z)=>{if(Math.abs(x)>42||Math.abs(z)>42||(level!==2&&!controlledSwimmer(f)&&boarWaterDepth(f,x,z)>BOAR_MAX_WATER_DEPTH))return true;if(trees.some(t=>Math.hypot(x-t.x,z-t.z)<t.r+radius))return true;if(rocks.some(q=>{const dx=x-q.cx,dz=z-q.cz,c=Math.cos(q.yaw),sn=Math.sin(q.yaw),lx=dx*c-dz*sn,lz=dx*sn+dz*c;return lx*lx/(q.ax+radius)**2+lz*lz/(q.az+radius)**2<1}))return true;return walls.some(w=>polygonContact(w.polygon,x,z,radius))||mountains.some(poly=>polygonContact(poly,x,z,radius))}}
function boarSceneryBlockedAt(f,x,z,yaw=f.g.rotation.y){
 if(Math.abs(x)>43.1||Math.abs(z)>43.1||boarTreeContacts(f,x,z,yaw).length||!boarLakeStepAllowed(f,x,z))return true;
 if(boarWallContacts(f,x,z,yaw).length)return true;
 const body=boarBody(f,x,z,yaw);
 for(const [px,pz] of [[body.ax,body.az],[(body.ax+body.bx)/2,(body.az+body.bz)/2],[body.bx,body.bz]]){
  if(rockPositions.some(([,,,m])=>m?.visible!==false&&rockFootprintHit(m,px,pz,body.r,false))||mountainBlockedAt(px,pz,body.r))return true;
 }
 return level===6&&lairObstacles.some(([px,pz,r,g])=>g.visible&&Math.hypot(x-px,z-pz)<r+body.r);
}
function resolveBoarClearance(f,protectPlayer=true){
 if(f.flee){for(let pass=0;pass<4;pass++){const contacts=boarWallContacts(f);if(!contacts.length)break;for(const hit of contacts){f.g.position.x+=hit.nx*(hit.depth+.004);f.g.position.z+=hit.nz*(hit.depth+.004)}}return}
 for(let pass=0;pass<4;pass++){
  const contacts=[...boarTreeContacts(f),...boarWallContacts(f)];const playerHit=protectPlayer?boarPlayerContact(f):null;if(playerHit)contacts.push(playerHit);
  if(!contacts.length)break;
  for(const hit of contacts){f.g.position.x+=hit.nx*(hit.depth+.004);f.g.position.z+=hit.nz*(hit.depth+.004)}
 }
 if(!controlledSwimmer(f)&&level===4&&boarWaterDepth(f)>BOAR_MAX_WATER_DEPTH){for(let r=.25;r<12;r+=.25){let found=false;for(let i=0;i<24;i++){const a=i/24*Math.PI*2,x=f.g.position.x+Math.sin(a)*r,z=f.g.position.z+Math.cos(a)*r;if(boarWaterDepth(f,x,z)<=BOAR_MAX_WATER_DEPTH&&!boarSceneryBlockedAt(f,x,z)){f.g.position.x=x;f.g.position.z=z;found=true;break}}if(found)break}}

}
function blockedByBoar(x,z,ignore=null,r=1.03,yaw=ignore?.g.rotation.y){
 const own=ignore?boarBody(ignore,x,z,yaw):null;if(own)own.r+=.025;
 for(const b of boarBodies()){if(b===ignore)continue;if(own?capsuleCapsuleContact(own,boarBody(b)):capsuleCircleContact(boarBody(b),x,z,r))return true}return false
}
const battleFx=[];
function bossBattleImpact(x,z){
 const g=new THREE.Group();g.position.set(x,.42,z);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.25,.48,20),new THREE.MeshBasicMaterial({color:0xffb13b,transparent:true,opacity:.95,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;g.add(ring);
 for(let i=0;i<7;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.09,.09,.09),new THREE.MeshBasicMaterial({color:i%2?0xff6a22:0xffd45b}));const a=i/7*Math.PI*2;p.position.set(Math.sin(a)*.35,.12,Math.cos(a)*.35);g.add(p)}
 scene.add(g);battleFx.push({g,t:0,ring})
}function moveBoarToward(f,tx,tz,speed,dt){
 const ox=f.g.position.x,oz=f.g.position.z,dx=tx-ox,dz=tz-oz,d=Math.hypot(dx,dz);if(d<.001)return false;
 const step=Math.min(speed*dt,d),ux=dx/d,uz=dz/d;
 // Fleeing boars ignore trees and stones, but always respect house walls.
 if(f.flee){let vx=ux,vz=uz;if(level===3&&Math.abs(ox)<41&&Math.abs(oz)<41&&((f.fleePath?.length>0)||Array.from({length:20},(_,i)=>boarWallContacts(f,ox+ux*(i+1),oz+uz*(i+1),Math.atan2(ux,uz)).length).some(Boolean))){const blocked=(x,z)=>boarWallContacts(f,x,z,Math.atan2(vx,vz)).length>0;if(!f.fleePath||f.fleePathAge<=0){f.fleePath=findGridPath({x:ox,z:oz},{x:Math.max(-42,Math.min(42,ox+ux*20)),z:Math.max(-42,Math.min(42,oz+uz*20))},blocked,{step:.8,bound:43,maxNodes:15000});f.fleePathAge=1.5}f.fleePathAge-=dt;while(f.fleePath.length&&Math.hypot(f.fleePath[0].x-ox,f.fleePath[0].z-oz)<.5)f.fleePath.shift();if(f.fleePath.length){const q=f.fleePath[0],len=Math.max(.01,Math.hypot(q.x-ox,q.z-oz));vx=(q.x-ox)/len;vz=(q.z-oz)/len}if(boarWallContacts(f,ox+vx*step,oz+vz*step,Math.atan2(vx,vz)).length)return false}f.g.position.x+=vx*step;f.g.position.z+=vz*step;f.g.rotation.y=Math.atan2(vx,vz);return true}
 const blocked=(x,z)=>{
   const boyBlock=!!boarPlayerContact(f,x,z,Math.atan2(ux,uz));
   const treeBlock=boarTreeContacts(f,x,z,Math.atan2(ux,uz)).length>0;
   const rockBlock=rockPositions.some(([px,pz,r,mesh])=>mesh?.visible!==false&&Math.hypot(x-px,z-pz)<r+.52);
   const mountainBlock=mountainBlockedAt(x,z,boarRadius(f)*.72);
   const lairBlock=level===6&&lairObstacles.some(([px,pz,r,g])=>g.visible&&Math.hypot(x-px,z-pz)<r+1.02);
   const houseBlock=boarWallContacts(f,x,z,Math.atan2(ux,uz)).length>0;
   // v135: boars may use the shallow rim, but never choose a step deeper into the lake centre.
   const currentLakeR=Math.hypot(ox+18,oz+17),nextLakeR=Math.hypot(x+18,z+17);
   const lakeCoreBlock=!boarLakeStepAllowed(f,x,z);
   return boyBlock||treeBlock||rockBlock||mountainBlock||lairBlock||houseBlock||lakeCoreBlock||blockedByBoar(x,z,f,.78,Math.atan2(ux,uz))
 };
 const pathBlocked=(x,z)=>{const count=Math.max(1,Math.ceil(Math.hypot(x-ox,z-oz)/.055));for(let i=1;i<=count;i++)if(blocked(ox+(x-ox)*i/count,oz+(z-oz)*i/count))return true;return false};
 let nx=ox+ux*step,nz=oz+uz*step;
 if(pathBlocked(nx,nz)){
   let ok=false;
   for(const side of [1,-1]){
     const sx=-uz*side,sz=ux*side;
     const ax=ox+(ux*.22+sx*.98)*step*.82,az=oz+(uz*.22+sz*.98)*step*.82;
     if(!pathBlocked(ax,az)){nx=ax;nz=az;ok=true;break}
   }
   if(!ok){if(!f.isBoss){f.roamTimer=0;f.roamPause=rand(.12,.35)}return false}
 }
 f.g.position.x=nx;f.g.position.z=nz;f.g.rotation.y=Math.atan2(ux,uz);return true
}
let friendKnockbackActive=false;
function bossRepelsFriend(boss,ally){
 if(!ally?.g||ally.flee)return;
 ally.knockback=new Knockback(ally.g.position.x-boss.g.position.x,ally.g.position.z-boss.g.position.z);
 ally.graze=0;friendYield.reset();friendYieldActive=false;friendAttack=Math.max(friendAttack,1.25);ally.b.rotation.x=.42;
}
function moveRecoilBoar(ally,dx,dz){
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.045)),sx=dx/count,sz=dz/count;
 for(let i=0;i<count;i++){
  const x=ally.g.position.x+sx,z=ally.g.position.z+sz;
  if(boarSceneryBlockedAt(ally,x,z))break;
  // Existing contact with the boss may shrink while the friend moves away from it.
  const oldPlayer=boarPlayerContact(ally),newPlayer=boarPlayerContact(ally,x,z);
  if(newPlayer&&(!oldPlayer||newPlayer.depth>oldPlayer.depth+.00001))break;
  const body=boarBody(ally,x,z),oldBody=boarBody(ally);let blocked=false;
  for(const other of boarBodies()){if(other===ally)continue;const hit=capsuleCapsuleContact(body,boarBody(other)),old=capsuleCapsuleContact(oldBody,boarBody(other));if(hit&&(!old||hit.depth>old.depth+.00001)){blocked=true;break}}
  if(blocked)break;ally.g.position.x=x;ally.g.position.z=z;
 }
}
function updateFriendKnockback(dt){
 if(!friend?.g||friend.flee||!friend.knockback?.active)return false;
 const recoil=friend.knockback,step=recoil.step(dt),facing=friend.g.rotation.y;
 if(mountedFriend){
  // The rider and mount travel together through the existing swept terrain solver.
  movePlayerCollision(step.dx,step.dz);friend.g.position.x=boy.position.x;friend.g.position.z=boy.position.z;
 }else{
  const distance=Math.hypot(step.dx,step.dz);
  if(distance>0)moveRecoilBoar(friend,step.dx,step.dz);
  friend.g.rotation.y=facing;
 }
 friend.b.rotation.x=.42*(1-step.progress);friend.b.position.y=Math.sin(step.progress*Math.PI)*.28;
 if(!recoil.active){friend.knockback=null;friend.b.position.y=0}
 return true;
}
// v133: when the friendly boar cannot follow Timur directly, probe a fan of detours and keep
// the best free heading. This prevents it from repeatedly pushing into the same tree/rock/house.
const friendYield=new FriendYield();let friendYieldActive=false,friendYieldOwner=null;
function updateFriendYield(dx,dz,dt){
 friendYieldActive=false;if(!friend?.g||friend.flee||friend.knockback?.active||friendKnockbackActive||mountedFriend||py>.58){friendYield.reset();return}
 if(friendYieldOwner!==friend){friendYieldOwner=friend;friendYield.reset()}
 const ox=friend.g.position.x,oz=friend.g.position.z;
 const canMove=(x,z)=>Math.abs(x)<42.7&&Math.abs(z)<42.7&&!boarSceneryBlockedAt(friend,x,z)&&!blockedByBoar(x,z,friend,.72);
 const result=friendYield.step({x:ox,z:oz,playerX:boy.position.x,playerZ:boy.position.z,dx,dz,dt,canMove});
 friendYieldActive=result.active;
 if(result.moved){friend.g.position.x=result.x;friend.g.position.z=result.z;const target=Math.atan2(result.x-ox,result.z-oz),angle=Math.atan2(Math.sin(target-friend.g.rotation.y),Math.cos(target-friend.g.rotation.y));friend.g.rotation.y+=angle*(1-Math.exp(-6*dt));friend.graze=0;friend.b.rotation.x*=Math.exp(-10*dt);friend.b.position.y*=Math.exp(-10*dt)}
}
function moveFriendAroundObstacles(tx,tz,speed,dt){if(!friend?.g)return false;const f=friend,x=f.g.position.x,z=f.g.position.z,nav=f.navigation,gridStep=level===3&&Math.min(Math.hypot(x-familyHideout.position.x,z-familyHideout.position.z),Math.hypot(tx-familyHideout.position.x,tz-familyHideout.position.z))<12?.5:.8;if(nav&&nav.step!==gridStep)f.blockedNavCells?.clear();if(!f.blockedNavCells)f.blockedNavCells=new Map();for(const [key,until] of f.blockedNavCells)if(until<levelTime)f.blockedNavCells.delete(key);if(nav?.stuck>.6&&nav.path?.length){const p=nav.path[0];f.blockedNavCells.set(Math.round(p.x/gridStep)+","+Math.round(p.z/gridStep),levelTime+3)}let path=nav?.path;const age=(nav?.age||0)+dt;if(!nav||nav.step!==gridStep||nav.epoch!==worldEpoch||Math.hypot(nav.tx-tx,nav.tz-tz)>2||age>1.3||nav.stuck>.65){const blocked=companionNavBlocked(f);path=findGridPath({x,z},{x:tx,z:tz},(x,z)=>blocked(x,z)||f.blockedNavCells.has(Math.round(x/gridStep)+","+Math.round(z/gridStep)),{step:gridStep,bound:42,maxNodes:22000});f.navigation={path,step:gridStep,tx,tz,epoch:worldEpoch,age:0,stuck:0};companionChecks.replans++}else nav.age=age;const current=f.navigation;while(current.path.length&&Math.hypot(current.path[0].x-x,current.path[0].z-z)<.45)current.path.shift();const goal=current.path[0]||{x:tx,z:tz};const moved=moveBoarToward(f,goal.x,goal.z,speed,dt);current.stuck=moved?0:current.stuck+dt;if(current.stuck>.5)repairCompanion(f);return moved}
function runNavigationSafetyAudit(){const issues=[];if(riverGeo.attributes.position.getX(riverGeo.attributes.position.count-1)>46)issues.push('river-outside-map');if(level===4&&apples.some(a=>!a.done&&Math.abs(a.z-riverCenterAt(a.x))<4.6))issues.push('food-in-river');for(const season of ['summer','autumn','winter'])if(weatherDeadline(season,6,600)!==null)issues.push('boss-weather-deadline');if(level===3){const h=familyHideout;h.updateWorldMatrix(true,true);const a=new THREE.Vector3(-3.5,.8,0).applyMatrix4(h.matrixWorld),b=new THREE.Vector3(-1.5,.8,0).applyMatrix4(h.matrixWorld);if(clearWallLine(a,b))issues.push('house-wall-line-open')}if(currentSeason==='winter'&&(roadSurface.material!==winterRoadMaterial||(level===2&&lake.material!==iceWaterMaterial)||(level===4&&riverWater.material!==iceWaterMaterial)))issues.push('winter-surface-not-frozen');return {ok:issues.length===0,issues,level,season:currentSeason,automaticRecovery:true,companion:companionChecks}}
function runBoarBehaviorAudit(){
 const issues=[],samples=[],saved={friend,friendHP,foes:foes.slice(),form:boarFormTime,food,stock:yellowMushroomStock,cooldown:throwCooldown,score,done:levelBoarsDone,stats:{...statsData},x:boy.position.x,y:boy.position.y,z:boy.position.z,yaw,started,paused,win,life,sfx:sfxEnabled,shotCount:shots.length};
 const f=visualOnly(()=>makeBoar(0,8,false));
 try{
  friend=null;boarFormTime=30;started=true;paused=false;win=false;life=5;sfxEnabled=false;food=4;yellowMushroomStock=0;throwCooldown=0;boy.position.set(0,0,4);yaw=0;foes.splice(0,foes.length,f);
  visualOnly(feed);const shot=shots.at(-1);if(shots.length!==saved.shotCount+1||shot.foe!==f)issues.push('boar-form-cannot-feed');else{visualOnly(()=>resolveMeat(shot));shots.pop();if(friend!==f||!f.friendly||food!==3)issues.push('boar-form-friend-not-created')}
  if(boarShouldChasePlayer(f,3)||attacksPlayer(boarFormTime+catFormTime))issues.push('boar-form-still-targeted');boarFormTime=0;if(!boarShouldChasePlayer(f,3))issues.push('human-chase-not-restored');
  samples.push({feeding:friend===f,protectedInForm:!attacksPlayer(30),chaseAfterForm:boarShouldChasePlayer(f,3)});
  friend=null;foes.splice(0,foes.length,...saved.foes);boy.position.set(0,0,42);
  for(const scale of [1,2.3]){f.g.scale.setScalar(scale);f.isBoss=scale>1;let trees=0;
   for(const mesh of treeSolidMeshes){if(mesh.parent?.visible===false)continue;const q=treeTrunkShape(mesh);f.g.position.set(q.x,0,q.z+q.r+1.65*scale+.10);f.g.rotation.y=Math.PI;
    for(let frame=0;frame<12;frame++)moveBoarToward(f,q.x,q.z,6,.05);
    const hit=capsuleCircleContact(boarBody(f),q.x,q.z,q.r-.01);if(hit)issues.push('boar-body-in-tree');if(++trees>=8)break;
   }
   f.g.position.set(0,0,4+1.2*scale);f.g.rotation.y=Math.PI;boy.position.set(0,0,4);resolveBoarClearance(f);
   if(capsuleCircleContact(boarBody(f),boy.position.x,boy.position.z,PLAYER_RADIUS+.05))issues.push('boar-body-in-timur');
   samples.push({scale,trees,playerClear:!boarPlayerContact(f)});boy.position.set(0,0,42);
  }
  if(level===2){f.g.scale.setScalar(1);f.isBoss=false;f.g.position.set(-18+13.1,0,-17);f.g.rotation.y=-Math.PI/2;
   for(let frame=0;frame<50;frame++)moveBoarToward(f,-18,-17,6,.05);
   const depth=boarWaterDepth(f);if(currentSeason!=='winter'&&depth<1)issues.push('boar-cannot-enter-lake');
   f.g.position.set(-18+8,0,-17);resolveBoarClearance(f);if(currentSeason!=='winter'&&boarWaterDepth(f)<1)issues.push('swimming-boar-pushed-to-shore');
   samples.push({lakeDepth:+depth.toFixed(3),recoveredDepth:+boarWaterDepth(f).toFixed(3)});
  }
 }finally{
  while(shots.length>saved.shotCount){const shot=shots.pop();scene.remove(shot.g)}scene.remove(f.g);friend=saved.friend;friendHP=saved.friendHP;foes.splice(0,foes.length,...saved.foes);boarFormTime=saved.form;food=saved.food;yellowMushroomStock=saved.stock;throwCooldown=saved.cooldown;score=saved.score;levelBoarsDone=saved.done;Object.assign(statsData,saved.stats);boy.position.set(saved.x,saved.y,saved.z);yaw=saved.yaw;started=saved.started;paused=saved.paused;win=saved.win;life=saved.life;sfxEnabled=saved.sfx;
 }
 return {ok:issues.length===0,issues,samples,level};
}
window.__KABANCHIKI_BOAR_BEHAVIOR_AUDIT__=runBoarBehaviorAudit;
function runLakeStormFeedingAudit(){
 const issues=[],samples=[],saved={friend,friendHP,food,stock:yellowMushroomStock,foes:foes.slice(),done:levelBoarsDone,score,stats:{...statsData},rage:bossRage,started,paused,win,life,sfx:sfxEnabled,cooldown:throwCooldown,x:boy.position.x,y:boy.position.y,z:boy.position.z,yaw,py,vy,mounted:mountedFriend,stage:weatherStage,time:levelTime,next:nextLightningAt,flash:lightningFlash},oldBurning=new Set(stormBurning.keys()),oldTouched=new Set(stormTouched),oldBolts=new Set(lightningBolts);
 const f=visualOnly(()=>makeBoar(0,8,false));
 try{
  started=true;paused=false;win=false;life=5;sfxEnabled=false;mountedFriend=false;friend=null;food=0;yellowMushroomStock=1;throwCooldown=0;boy.position.set(0,0,4);yaw=0;foes.splice(0,foes.length,f);
  const count=shots.length;visualOnly(feed);const shot=shots.at(-1);if(shots.length!==count+1||!shot.specialYellow||shot.foe!==f)issues.push('yellow-mushroom-shot');else{visualOnly(()=>resolveMeat(shot));shots.pop();if(friend!==f||!f.friendly||!f.yellowPermanent||yellowMushroomStock!==0||statsData.fed!==saved.stats.fed+1)issues.push('yellow-mushroom-no-friend');samples.push({yellowFriend:friend===f,food,stock:yellowMushroomStock})}
  friend=f;friendHP=Math.max(0,diffCfg().friendHP-1);const hp=friendHP;visualOnly(()=>resolveMeat({g:new THREE.Group(),foe:f,type:'mushroom',specialYellow:true}));if(friendHP!==hp+1)issues.push('yellow-mushroom-no-healing');
  friend=null;f.isBoss=true;f.hp=7;bossRage=1.8;foes.splice(0,foes.length,f);visualOnly(()=>resolveMeat({g:new THREE.Group(),foe:f,type:'mushroom',specialYellow:true}));if(bossRage>=1.8||f.hp!==7)issues.push('yellow-mushroom-boss-food');samples.push({healed:friendHP===hp+1,bossRage,bossHP:f.hp,yellowPermanent:f.yellowPermanent});
  f.isBoss=false;f.flee=true;const tree=treeSolidMeshes.find(m=>m.parent?.visible!==false),q=tree?treeTrunkShape(tree):{x:0,z:0};
  for(const [x,z,label] of [[q.x,q.z,'tree'],[-18,-17,'lake'],[44,44,'boundary'],...rockPositions.filter(q=>q[3]?.visible).slice(0,3).map(q=>[q[0],q[1],'rock']),...houseObjects.filter(h=>h.visible).slice(0,1).map(h=>{const box=new THREE.Box3().setFromObject(h);return [box.min.x-boarRadius(f)-2,(box.min.z+box.max.z)/2,'house']})]){
   f.g.position.set(x,0,z);f.fleePath=null;f.fleePathAge=0;resolveBoarClearance(f);const start=f.g.position.clone();let traveled=0;for(let i=0;i<80;i++){const previous=f.g.position.clone();moveBoarToward(f,f.g.position.x+10,f.g.position.z,6,.05);resolveBoarClearance(f);traveled+=f.g.position.distanceTo(previous);if(boarWallContacts(f).length)issues.push('flee-through-wall-'+label)}if(traveled<1)issues.push('flee-blocked-'+label);samples.push({flee:label,traveled})
  }
  f.g.position.set(0,0,0);f.fleePath=null;f.fleePathAge=0;for(let i=0;i<200;i++){moveBoarToward(f,60,0,6,.05);resolveBoarClearance(f)}if(f.g.position.x<=55)issues.push('flee-cannot-exit-map');samples.push({fleeExitX:f.g.position.x});
  if(level===2){const rocks=rockPositions.filter(q=>q[3]?.userData.biomeLevel===2);if(rocks.length!==20)issues.push('lake-rocks-not-registered');py=0;vy=0;for(const [x,z,r,m] of rocks){if(!m.visible||!rockFootprintHit(m,x,z,ROCK_PLAYER_RADIUS,true))issues.push('lake-rock-not-solid')}samples.push({lakeRocks:rocks.length,solid:!issues.some(i=>i.startsWith('lake-rock'))})}
  const rock=stormRockTargets().find(r=>r.visible&&r.parent?.visible!==false),candidate=lightningCandidates().find(q=>q.k==='rock');if(!rock||!candidate)issues.push('lightning-no-rock-target');else{
   const before=rock.material||rock.children.find(m=>m.material)?.material;charStormRock(rock);if(!rock.visible||stormBurning.has(rock)||!rock.userData.stormBlackened)issues.push('lightning-rock-burns');const black=[];rock.traverse(m=>{if(m.isMesh&&m.material?.color)black.push(m.material.color.getHex()===0x161616)});if(!black.length||black.includes(false))issues.push('lightning-rock-not-black');
   const bolt=spawnLightningBolt(rock),box=new THREE.Box3().setFromObject(rock),end=bolt.g.children.at(-1).position;if(Math.abs(end.y-box.max.y)>.0001||bolt.time<.5||!bolt.g.children[0].isMesh)issues.push('lightning-invisible-or-misses-target');removeLightningBolt(bolt);restoreStormObject(rock);const after=rock.material||rock.children.find(m=>m.material)?.material;if(before!==after||rock.userData.stormBlackened)issues.push('lightning-rock-not-restored');samples.push({rockBlack:true,rockSolid:true,boltEndsAtTop:true})
  }
  if(currentSeason==='winter'){const before=lightningBolts.length;triggerLightning(0);if(lightningBolts.length!==before)issues.push('winter-lightning');samples.push({winterNoLightning:true})}else{weatherStage=3;levelTime=180;triggerLightning(0);if(nextLightningAt!==200||!lightningBolts.length)issues.push('minute-three-lightning-missing');levelTime=200;triggerLightning(999999);if(nextLightningAt!==220)issues.push('lightning-not-20-game-seconds');samples.push({strikeAt:180,next:220});}
 }finally{
  for(const bolt of [...lightningBolts])if(!oldBolts.has(bolt))removeLightningBolt(bolt);
  for(const [obj,b] of [...stormBurning])if(!oldBurning.has(obj)){obj.remove(b.light);obj.remove(b.flames);stormBurning.delete(obj)}
  for(const obj of [...stormTouched])if(!oldTouched.has(obj))restoreStormObject(obj);
  scene.remove(f.g);friend=saved.friend;friendHP=saved.friendHP;food=saved.food;yellowMushroomStock=saved.stock;foes.splice(0,foes.length,...saved.foes);levelBoarsDone=saved.done;score=saved.score;Object.assign(statsData,saved.stats);bossRage=saved.rage;started=saved.started;paused=saved.paused;win=saved.win;life=saved.life;sfxEnabled=saved.sfx;throwCooldown=saved.cooldown;boy.position.set(saved.x,saved.y,saved.z);yaw=saved.yaw;py=saved.py;vy=saved.vy;mountedFriend=saved.mounted;weatherStage=saved.stage;levelTime=saved.time;nextLightningAt=saved.next;lightningFlash=saved.flash;hud();
 }
 return {ok:issues.length===0,issues,samples,level};
}
window.__KABANCHIKI_LAKE_STORM_FEEDING_AUDIT__=runLakeStormFeedingAudit;
function runBossCounterattackAudit(){
 const issues=[],samples=[];if(level!==6)return {ok:true,issues,samples,level};
 const saved={friend,friendHP,mounted:mountedFriend,x:boy.position.x,y:boy.position.y,z:boy.position.z,py,vy,attack:friendAttack,active:friendKnockbackActive,foes:foes.slice(),bossHits,rage:bossRage,stats:{...statsData},sfx:sfxEnabled};
 const ally=visualOnly(()=>makeBoar(0,12,true)),boss=visualOnly(()=>makeBoar(0,8.5,false));boss.isBoss=true;boss.g.scale.setScalar(2.3);boss.hp=10;
 try{
  friend=ally;friendHP=7;sfxEnabled=false;mountedFriend=false;boy.position.set(12,0,30);foes.splice(0,foes.length,boss);
  for(const fps of [30,60,120]){ally.g.position.set(0,0,12);ally.g.rotation.y=Math.PI;bossRepelsFriend(boss,ally);let maxStep=0;
   while(ally.knockback?.active){const z=ally.g.position.z;updateFriendKnockback(1/fps);maxStep=Math.max(maxStep,Math.abs(ally.g.position.z-z));resolveBoarClearance(ally)}
   const travel=ally.g.position.z-12;if(Math.abs(travel-4)>.03)issues.push('friend-recoil-distance-'+fps);if(maxStep>.45)issues.push('friend-recoil-teleport');samples.push({fps,travel,maxStep})
  }
  ally.g.position.set(0,0,12);ally.g.rotation.y=Math.PI;boss.g.position.set(0,0,8.5);boss.g.rotation.y=0;boss.hp=10;friendHP=7;friendAttack=0;friendKnockbackActive=false;mountedFriend=true;boy.position.set(0,1.18,12);py=1.18;vy=0;
  visualOnly(mountedFriendDefense);if(boss.hp!==9||!ally.knockback?.active||friendHP!==6)issues.push('mounted-boss-hit-no-counterattack');
  const hp=boss.hp;visualOnly(mountedFriendDefense);if(boss.hp!==hp)issues.push('attack-during-recoil');
  while(ally.knockback?.active)updateFriendKnockback(1/60);
  const travel=boy.position.z-12;if(Math.abs(travel-4)>.03||Math.abs(ally.g.position.z-boy.position.z)>.001)issues.push('mounted-recoil-desync');samples.push({mountedTravel:travel,bossHP:boss.hp,friendHP});
  mountedFriend=false;ally.g.position.set(0,0,39);boy.position.set(12,0,30);boss.g.position.set(0,0,35);bossRepelsFriend(boss,ally);while(ally.knockback?.active){updateFriendKnockback(1/60);resolveBoarClearance(ally)}if(ally.g.position.z>43.1)issues.push('recoil-leaves-map');samples.push({boundaryZ:ally.g.position.z});
 }finally{
  scene.remove(ally.g);scene.remove(boss.g);friend=saved.friend;friendHP=saved.friendHP;mountedFriend=saved.mounted;boy.position.set(saved.x,saved.y,saved.z);py=saved.py;vy=saved.vy;friendAttack=saved.attack;friendKnockbackActive=saved.active;foes.splice(0,foes.length,...saved.foes);bossHits=saved.bossHits;bossRage=saved.rage;Object.assign(statsData,saved.stats);sfxEnabled=saved.sfx;hud();
 }
 return {ok:issues.length===0,issues,samples,level};
}
window.__KABANCHIKI_BOSS_COUNTERATTACK_AUDIT__=runBossCounterattackAudit;
function runV156Audit(){
 const issues=[],samples=[],saved={friend,friendHP,mounted:mountedFriend,py,vy,x:boy.position.x,y:boy.position.y,z:boy.position.z,food,stock:yellowAppleStock,mushrooms:yellowMushroomStock,score,stats:{...statsData},foes:foes.slice(),done:levelBoarsDone,form:boarFormTime,stage:weatherStage,rain:puddleRain,sfx:sfxEnabled,started,paused,win,life,cooldown:throwCooldown,yaw};
 const f=visualOnly(()=>makeBoar(0,8,false));let tree=null,treeScale=null,treeGrown,treeBefore;
 try{
  sfxEnabled=false;mountedFriend=false;friend=null;boarFormTime=0;started=true;paused=false;win=false;life=5;throwCooldown=0;boy.position.set(0,0,4);food=0;yellowMushroomStock=0;yellowAppleStock=1;foes.splice(0,foes.length,f);yaw=0;
  const shotCount=shots.length;visualOnly(feed);const shot=shots.at(-1);if(shots.length!==shotCount+1||!shot.specialYellowApple)issues.push('yellow-apple-inventory-shot');else{visualOnly(()=>resolveMeat(shot));shots.pop();if(friend!==f||!f.friendly||Math.abs(f.g.scale.y-1.5)>.001||yellowAppleStock!==0||food!==0)issues.push('yellow-apple-growth-or-food');const h=f.g.scale.y;growBoarFromApple(f);if(f.g.scale.y!==h)issues.push('yellow-apple-growth-stacks');samples.push({appleFriend:friend===f,boarHeight:f.g.scale.y,stock:yellowAppleStock})}
  tree=treeObjects.find(t=>t.visible&&!t.userData.yellowAppleGrown);if(tree){treeScale=tree.scale.clone();treeGrown=tree.userData.yellowAppleGrown;treeBefore=tree.userData.beforeYellowScale;const item={g:new THREE.Group(),type:'apple',bonus:true,done:false,tree};const stock=yellowAppleStock;collectForageItem(item,true);if(yellowAppleStock!==stock+1||Math.abs(tree.scale.y/treeScale.y-3)>.001)issues.push('yellow-apple-tree-or-stock');samples.push({treeHeightFactor:tree.scale.y/treeScale.y});tree.scale.copy(treeScale);delete tree.userData.yellowAppleGrown;delete tree.userData.beforeYellowScale;repairTreeApples([],[]);
   const materials=[];tree.traverse(m=>{if(m.isMesh&&m.material?.emissive)materials.push([m,m.material.emissive.getHex(),m.material.color.getHex()])});igniteBossTree(tree);const fire=burningTrees.get(tree);if(!fire)issues.push('boss-tree-test-not-ignited');else{tree.remove(fire.light);tree.remove(fire.flames);burningTrees.delete(tree);restoreStormObject(tree);if(materials.some(([m,e,c])=>m.material.emissive.getHex()!==e||m.material.color.getHex()!==c))issues.push('boss-tree-red-after-reset');samples.push({bossTreeRestored:true})}
  }
  ground.updateMatrixWorld();const sp=surfaceGeometry.attributes.position;for(const i of [1577,3329,6810]){const point=new THREE.Vector3().fromBufferAttribute(sp,i).applyMatrix4(ground.matrixWorld);if(Math.abs(point.y-groundSurfaceHeightAt(point.x,point.z))>.002)issues.push('terrain-visual-height-mismatch')}
  if(!puddleObjects.length)issues.push('no-rain-basins');weatherStage=2;puddleRain=0;updatePuddles(15);const early=puddleRain;updatePuddles(45);if(!(early>0&&puddleRain>early)||!puddleObjects.some(p=>p.visible))issues.push('puddles-do-not-fill');samples.push({basins:puddleObjects.length,earlyRain:early,laterRain:puddleRain});
  friend=f;foes.splice(0,foes.length,...saved.foes);mountedFriend=true;py=1.18;f.g.scale.set(1,1,1);
  if(level===2&&currentSeason!=='winter'){boy.position.set(-18+13.1,1.18,-17);f.g.position.copy(boy.position);f.g.rotation.y=-Math.PI/2;let deepest=0;for(let i=0;i<160;i++){movePlayerCollision(-.13,0);deepest=Math.max(deepest,boarWaterDepth(playerBoarBody()))}if(deepest<4)issues.push('rider-cannot-enter-lake-centre');boy.position.set(-18+7,1.18,-17);resolveBoarClearance(playerBoarBody(),false);if(boarWaterDepth(playerBoarBody())<1)issues.push('deep-rider-pushed-to-shore');samples.push({riderMaxLakeDepth:deepest})}
  if(level===4){boy.position.set(0,1.18,-6);f.g.rotation.y=Math.PI;for(let i=0;i<130;i++)movePlayerCollision(0,-.13);if(boy.position.z>-21)issues.push('rider-cannot-cross-river-bridge');boy.position.set(15,1.18,riverCenterAt(15)+6);for(let i=0;i<100;i++)movePlayerCollision(0,-.13);if(boy.position.z>=riverCenterAt(15)+4)issues.push('rider-cannot-enter-river');samples.push({bridgeAndRiverSafe:true})}
 }finally{
  if(tree&&treeScale){tree.scale.copy(treeScale);if(treeGrown!==undefined)tree.userData.yellowAppleGrown=treeGrown;else delete tree.userData.yellowAppleGrown;if(treeBefore)tree.userData.beforeYellowScale=treeBefore;else delete tree.userData.beforeYellowScale}
  scene.remove(f.g);friend=saved.friend;friendHP=saved.friendHP;mountedFriend=saved.mounted;py=saved.py;vy=saved.vy;boy.position.set(saved.x,saved.y,saved.z);food=saved.food;yellowAppleStock=saved.stock;yellowMushroomStock=saved.mushrooms;score=saved.score;Object.assign(statsData,saved.stats);foes.splice(0,foes.length,...saved.foes);levelBoarsDone=saved.done;boarFormTime=saved.form;weatherStage=saved.stage;puddleRain=saved.rain;updatePuddles(0);sfxEnabled=saved.sfx;started=saved.started;paused=saved.paused;win=saved.win;life=saved.life;throwCooldown=saved.cooldown;yaw=saved.yaw;hud();
 }
 return {ok:issues.length===0,issues,samples,level};
}
window.__KABANCHIKI_V156_AUDIT__=runV156Audit;
if(__autoTest)window.__KABANCHIKI_QA__={
 v165Snapshot(kind){this.season(kind==='winter'?40:0);this.load(kind==='house'||kind==='cats'?3:2);paused=true;if(kind==='house'){boy.position.set(30,.16,-31);camera.position.set(35,5,-23);camera.lookAt(30,1,-31);setDadHouseCutaway(true)}else if(kind==='cats'){camera.position.set(-33,6,-20);camera.lookAt(-27,3,-27)}else{camera.position.set(-38,22,-3);camera.lookAt(-31,0,-21)}renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png')},
 v165Pause(){paused=true;return this.state()},
 v179Grass(){const matrix=new THREE.Matrix4(),samples=[],quadrants=[0,0,0,0];for(let i=0;i<meadowGrass.count;i++){meadowGrass.getMatrixAt(i,matrix);const x=matrix.elements[12],y=matrix.elements[13],z=matrix.elements[14];quadrants[(x>0?1:0)+(z>0?2:0)]++;samples.push({x,y,z})}return {level,season:currentSeason,visible:meadowGrassRoot.visible,count:meadowGrass.count,active:meadowActiveCount,legacy:grassBlades.count,quadrants,samples}},
 v178HouseStand(z=-31){this.season(0);this.load(3);mountedFriend=false;boarFormTime=catFormTime=0;py=vy=0;keys={};stick.x=stick.y=0;jump=act=false;invuln=100;foes.forEach(f=>f.flee=true);familyMembers.forEach(f=>f.done=true);boy.position.set(30,0,z);paused=false;updateFamilyHouseReveal();return true},
 v178HouseMotion(){return {py,vy,y:boy.position.y,support:playerSupportHeightAt(boy.position.x,boy.position.z)}},
 v165Doors(){this.season(0);this.load(3);paused=true;const results=[];const originalFriend=friend;friend=null;for(const mode of ['foot','ride','tallRide','cat'])for(const offset of (mode==='foot'?[-.6,0,.6]:[0])){mountedFriend=mode==='ride'||mode==='tallRide';boarFormTime=0;catFormTime=mode==='cat'?30:0;if(mountedFriend){friend=makeBoar(30,-25,true);if(mode==='tallRide')friend.g.scale.y=1.5}py=vy=0;boy.position.set(30+offset,0,-24);boy.rotation.y=Math.PI;familyDoor.userData.closed=true;for(let i=0;i<120;i++){if(friend){friend.g.position.x=boy.position.x;friend.g.position.z=boy.position.z}movePlayerCollision(0,-.055)}const entered=boy.position.z<-30.3&&Math.abs(boy.position.x-30)<1.1,insideX=boy.position.x;boy.rotation.y=0;for(let i=0;i<150;i++){if(friend){friend.g.position.x=boy.position.x;friend.g.position.z=boy.position.z}movePlayerCollision(0,.055)}const exited=boy.position.z>-25;results.push({mode,offset,entered,exited,insideX,x:boy.position.x,z:boy.position.z});if(friend){scene.remove(friend.g);friend=null}}mountedFriend=false;catFormTime=0;friend=originalFriend;py=vy=0;boy.position.set(30,0,-24);updateFamilyHouseReveal();return {results,wallBlocked:houseBlockAt(32.6,-31,.43),furniture:houseFurnishings.children.map(g=>g.userData.furniture)}},
 v165Cats(seconds=240){this.season(0);this.load(3);paused=true;const issues=[],states=new Set();let checks=0;for(let i=0;i<seconds*20;i++){birdLife.update(.05,terrainHeightAt);catLife.update(.05,birdLife);for(const c of catLife.cats){states.add(c.state);if(!c.g.visible)issues.push('invisible');if(c.jump||c.state==='ride')continue;const p=catLife.point(c),h=catLife.houses[c.home],expected=['roof','hide'].includes(c.state)?h.y:terrainHeightAt(p.x,p.z);if(Math.abs(p.y-expected)>.005)issues.push('floating');if(['roof','hide'].includes(c.state)&&(Math.abs(p.x-h.x)>h.w*.31||Math.abs(p.z-h.z)>h.d*.31))issues.push('outside-roof');checks++}}const c=catLife.cats[1],ground=catLife.safeGround({x:4,z:10});c.jump=null;c.state='play';c.g.position.set(ground.x,ground.y,ground.z);const before=c.g.position.clone();for(let i=0;i<20;i++)catLife.avoidPlayer(ground.x-.4,ground.z,ground.y,.05);const yields=c.g.position.distanceTo(before)>.4,blocks=catLife.blocks(c.g.position.x,c.g.position.z,c.g.position.y);const b=makeBoar(c.g.position.x+2,c.g.position.z,true);b.g.position.y=terrainHeightAt(b.g.position.x,b.g.position.z);c.gameTimer=0;for(let i=0;i<220;i++)catLife.update(.05,{nearest:()=>null,scare(){}},[b]);scene.remove(b.g);return {...catLife.inspect(),issues:[...new Set(issues)],checks,states:[...states],yields,blocks}},
 v165CatStart(location=3){this.season(0);this.load(location);paused=false;boarFormTime=0;catFormTime=0;mountedFriend=false;py=vy=0;boy.position.set(0,0,10);keys={};stick.x=stick.y=0;jump=act=false;life=diffCfg().playerHP;invuln=0;startCatForm();return {seconds:catFormTime,protected:!attacksPlayer(boarFormTime+catFormTime),model:catFormModel.g.visible,chance:CAT_BERRY_CHANCE}},
 v177CatAttack(){const f=makeBoar(boy.position.x,boy.position.z+.9,false);f.attackLeap=.6;foes.push(f);invuln=0;return life},
 v165CatInspect(){return {time:catFormTime,py,y:boy.position.y,protected:!attacksPlayer(boarFormTime+catFormTime),visible:catFormModel?.g.visible,life,leaps:foes.filter(f=>f.attackLeap>0).length,food,shots:shots.length,sceneCats:catLife.inspect().count}},
 v165CatFeed(){paused=false;throwCooldown=0;food=3;yellowAppleStock=yellowMushroomStock=fishStock=0;feed();paused=true;return {food,shot:shots.at(-1)?.type,protected:!attacksPlayer(boarFormTime+catFormTime)}},
 v165CatExpire(){updateCatForm(31,performance.now());return this.v165CatInspect()},
 v165Lake(kind='wild'){this.season(0);this.load(2);foes.forEach(f=>scene.remove(f.g));foes.length=0;if(friend){scene.remove(friend.g);friend=null}mountedFriend=false;boarFormTime=catFormTime=0;py=vy=0;paused=false;invuln=100;boy.position.set(0,0,15);if(kind==='wild'){const f=makeBoar(-18,-17,false);f.roamPause=100;f.graze=100;foes.push(f)}else{friend=makeBoar(-18,-17,true);if(kind==='ride'){boy.position.set(-18,0,-17);mountFriendNow()}else{friend.roamPause=100;friend.graze=100;boy.position.set(-18,0,-14)}}return kind},
 v165LakeInspect(){const q=friend||foes[0];return {y:q?.g.position.y,bottom:q?groundSurfaceHeightAt(q.g.position.x,q.g.position.z):null,depth:q?lakeDepthAt(q.g.position.x,q.g.position.z):0,playerY:boy.position.y,ride:mountedFriend,lilies:lakeVisual.children.filter(g=>g.userData.lily&&g.visible).length,inletMaterial:tributaryWater.material===riverWater.material,inletWidth:lakeInletHalfWidthAt(-35),inletDepth:lakeInletDepthAt(-35,lakeInletCenterAt(-35)),endDepth:lakeDepth(-22,lakeInletCenterAt(-22))}},
 v164Inspect(){return {cats:catLife.inspect(),fish:fishStock,yaw,heading:boy.rotation.y,bloom:springBloomTime,flowers:seasonVisual.children.some(m=>m.userData.springFlowers),groundPatches:forestGround.children.filter(m=>m.visible).length,doorOpacity:familyDoor.material.opacity,brotherScale:movie?.people[0]?.children.find(c=>c.isGroup)?.scale.x,puddleRadius:puddleObjects[0]?.scale.x,puddleDepth:puddleObjects[0]?puddleDepthAt(puddleObjects[0].position.x,puddleObjects[0].position.z):0,movie:movie?.kind,stormRotation:movie?.hero.rotation.toArray()}},
 v164Cats(seconds=60){this.season(0);this.load(3);const states=new Set();for(let i=0;i<seconds*20;i++){birdLife.update(.05,terrainHeightAt);catLife.update(.05,birdLife);for(const c of catLife.cats)states.add(c.state)}paused=true;return {...catLife.inspect(),states:[...states]}},
 v164Spring(){this.season(60);this.load(3);const before=treeObjects[0].children.find(m=>m.userData.springCrown).scale.x;for(let i=0;i<600;i++){birdLife.update(.1,terrainHeightAt);updateSpringBloom(.1)}return {before,after:treeObjects[0].children.find(m=>m.userData.springCrown).scale.x,birds:birdLife.inspect(),...this.v164Inspect()}},
 v164Shelter(){this.season(0);this.load(3);paused=false;boy.position.copy(familyHideout.position);py=0;levelTime=301;updateWeather(0,performance.now());const sheltered=hurricaneCarry===0&&!movie;boy.position.set(0,0,20);updateWeather(0,performance.now());return {sheltered,carry:hurricaneCarry,movie:movie?.kind}},
 v164Death(cause){cinematicFinish?.();cineClear();cinematicRunning=false;deathSceneActive=deathSceneFinished=endShown=false;lastDeathCause=cause;life=0;showEnd(false);return {kind:movie?.kind,cause:movie?.deathCause,active:deathSceneActive}},
 v164Chewing(){this.season(0);this.load(1);const f=foes[0];updateBoarChewing(f,0,true);const first=f.g.userData.grazingJaw.position.y;updateBoarChewing(f,90,true);const moving=first!==f.g.userData.grazingJaw.position.y,grass=f.g.userData.grazingGrass.visible;updateBoarChewing(f,100,false);return {moving,grass,hidden:!f.g.userData.grazingGrass.visible}},
 v164Fishing(){this.v161Fish();fishStock=0;const sessions=[];for(let session=0;session<3;session++){keys.KeyW=true;updateFishing(.1,performance.now());keys.KeyW=false;for(let i=0;i<650;i++)updateFishing(.1,performance.now()+i*100);sessions.push({active:!!fishingTarget,stock:fishStock})} const initial=yaw;yaw+=1.2;for(let i=0;i<1200;i++)updateFishing(.1,performance.now()+i*100);const cameraFree=Math.abs(yaw-initial)>1,stock=fishStock;paused=false;throwCooldown=0;yellowAppleStock=yellowMushroomStock=0;feed();paused=true;return {cameraFree,stock,remaining:fishStock,type:shots.at(-1)?.type,sessions,stoppedAfterFeed:!fishingTarget}},
 v164Swim(){this.season(0);this.load(2);const f=makeBoar(-5, -17,false);f.g.rotation.y=-Math.PI/2;for(let i=0;i<100;i++)moveBoarToward(f,-18,-17,5,.05);resolveBoarClearance(f,false);const depth=boarWaterDepth(f),x=f.g.position.x;scene.remove(f.g);return {depth,x}},

 v163Inspect(){return {season:currentSeason,grass:grassBlades.visible,plants:forestVisual.children.filter(g=>g.userData.seasonPlant&&g.visible).length,borders:seasonVisual.children.filter(g=>g.userData.snowRoadBorder).length,treeBlocked:christmasSolid?circleHitsTreeGeometry(10,26,PLAYER_RADIUS):false,treeBoarBlocked:christmasSolid?boarTreeContacts({g:{position:{x:10,z:26},rotation:{y:0},scale:{x:1,y:1,z:1}}},10,26,0).length>0:false,headlights:movie?.car?.userData.headlights.map(l=>l.intensity),actors:movie?.people.map(p=>({x:p.position.x,z:p.position.z,visible:p.visible,yaw:p.rotation.y})),boars:movie?.boars.map(b=>({x:b.g.position.x,z:b.g.position.z,visible:b.g.visible}))}},
 v161Walls(){this.load(3);const h=familyHideout;h.updateWorldMatrix(true,true);const outside=new THREE.Vector3(-3.8,.8,0).applyMatrix4(h.matrixWorld),inside=new THREE.Vector3(-1.5,.8,0).applyMatrix4(h.matrixWorld);const blocked=!clearWallLine(outside,inside),open=clearWallLine(new THREE.Vector3(-8,1,8),new THREE.Vector3(8,1,8));const b=makeBoar(outside.x,outside.z,false);b.g.rotation.y=Math.PI/2;for(let i=0;i<120;i++)moveBoarToward(b,inside.x,inside.z,3,.05);resolveBoarClearance(b,false);const noseClear=boarWallContacts(b).length===0;scene.remove(b.g);return {blocked,open,noseClear,boar:[b.g.position.x,b.g.position.z]}},
 v161Navigate(level=3){this.season(0);this.load(level);if(friend)scene.remove(friend.g);const obstacles=level===3?houseObjects.filter(h=>h.visible&&!h.userData.enterable):level===5?mountainObstacles.map(q=>q[3]):rockPositions.filter(q=>q[3]?.visible).map(q=>q[3]);const obstacle=obstacles.find(o=>Math.abs(o.position.x)>8)||obstacles[0],box=new THREE.Box3().setFromObject(obstacle),start={x:(box.min.x+box.max.x)/2,z:box.max.z+3.0},target={x:start.x,z:box.min.z-4.0};friend=makeBoar(start.x,start.z,true);friend.g.rotation.y=Math.PI;mountedFriend=false;boy.position.set(target.x,0,target.z);foes.forEach(f=>f.flee=true);let penetrations=0;for(let i=0;i<700;i++){moveFriendAroundObstacles(target.x,target.z,4,.05);resolveBoarClearance(friend,false);if(boarWallContacts(friend).length)penetrations++;if(Math.hypot(friend.g.position.x-target.x,friend.g.position.z-target.z)<3)break}paused=true;return {level,remaining:Math.hypot(friend.g.position.x-target.x,friend.g.position.z-target.z),penetrations,checks:{...companionChecks}}},
 v161Exit(){this.season(0);this.load(3);if(friend)scene.remove(friend.g);friend=makeBoar(familyHideout.position.x,familyHideout.position.z,true);friend.g.rotation.y=0;familyDoor.userData.closed=false;mountedFriend=false;const target={x:familyHideout.position.x,z:familyHideout.position.z+9};boy.position.set(target.x,0,target.z);foes.forEach(f=>f.flee=true);for(let i=0;i<400;i++){moveFriendAroundObstacles(target.x,target.z,4,.05);resolveBoarClearance(friend,false);if(Math.hypot(friend.g.position.x-target.x,friend.g.position.z-target.z)<3)break}return {distance:Math.hypot(friend.g.position.x-target.x,friend.g.position.z-target.z),walls:boarWallContacts(friend).length}},
 v161Recover(){this.load(3);if(friend)scene.remove(friend.g);friend=makeBoar(familyHideout.position.x-2.6,familyHideout.position.z,true);friend.g.scale.y=1.5;friend.g.rotation.y=0;mountedFriend=false;repairCompanion(friend,true);const foot=companionValid(friend);mountFriendNow();const ride=companionValid(playerBoarBody());return {foot,ride,mounted:mountedFriend}},
 v161Snow(minutes){this.season(40);this.load(2);levelTime=minutes*60;updateSnow(.01,performance.now());return this.v161Inspect()},
 v161Inspect(){return {food,shots:shots.length,birds:birdLife.inspect(),snowMinute:winterSnowMinute,snowStrength:Math.min(1,.35+Math.max(0,winterSnowMinute)*.2),driftHeight:Math.max(0,...winterDrifts.map(d=>d.m.scale.y)),drifts:winterDrifts.length,snowDraw:snowGeometry.drawRange.count,iceWater:lake.material===iceWaterMaterial,roadSnow:roadSurface.material===winterRoadMaterial,checks:{...companionChecks},version:GAME_VERSION,season:currentSeason,level,life,underwater:underwaterTime,ice:iceShell.visible,freeze:freezeTime,tree:seasonVisual.children.some(g=>g.userData.christmasTree),fishing:fishingRig.visible,catch:caughtFish.visible,spray:sprayPool.filter(q=>q.t>0).length,rings:rainRingPool.filter(q=>q.t>0).length,puddles:puddleRain,depth:puddleObjects[0]?puddleDepthAt(puddleObjects[0].position.x,puddleObjects[0].position.z):0,riverEnd:riverGeo.attributes.position.getX(riverGeo.attributes.position.count-1),foodInRiver:level===4?apples.filter(a=>!a.done&&Math.abs(a.z-riverCenterAt(a.x))<4.6).length:0,rocks:rockPositions.filter(q=>q[3]?.userData.biomeLevel===4).map(q=>({x:q[0],z:q[1],scale:q[3].scale.toArray()})),movie:movie?{kind:movie.kind,light:movie.lampLight?.visible&&movie.lampLight?.intensity,headlights:movie.car?.userData.headlights?.length,boss:movie.fleeingBoss?.g.visible,hug:movie.hero.children[5].rotation.x}:null}},
 v161Bridge(){this.load(4);mountedFriend=false;py=.28;boy.position.set(0,.28,-14);for(let i=0;i<70;i++)movePlayerCollision(.06,0);const foot=boy.position.x;boy.position.set(0,.28,-14);mountedFriend=true;for(let i=0;i<70;i++)movePlayerCollision(.06,0);const ride=boy.position.x;mountedFriend=false;return {foot,ride}},
 v161Drown(){this.load(4);mountedFriend=false;boy.position.set(15,-3,riverCenterAt(15));const before=life;updateUnderwater(9);const after=life;while(life>0)updateUnderwater(4);return {before,after,dead:life===0&&(endShown||deathSceneActive)}},
 v161Freeze(level=1){this.season(40);this.load(level);levelTime=301;updateWinterFreeze(3);return this.v161Inspect()},
 v161BossSeason(failed){this.season(failed);this.load(6);levelTime=310;updateWinterFreeze(3);updateWeather(.016,performance.now());updateHurricaneCarry(.016,performance.now());return {carry:hurricaneCarry,ice:iceShell.visible,life}},
 v161Fish(){this.season(0);this.load(4);mountedFriend=false;boarFormTime=0;py=vy=0;keys={};stick.x=stick.y=0;jump=act=false;boy.position.set(17,0,riverCenterAt(17)+4.9);foes.forEach(f=>f.flee=true);for(let i=0;i<145;i++)updateFishing(.1,performance.now()+i*100);paused=true;return this.v161Inspect()},
 v161Water(){this.load(4);paused=true;boy.position.set(15,0,riverCenterAt(15));spawnWaterSplash(15,riverCenterAt(15),2.8);return this.v161Inspect()},
 v161Fire(seconds=0){this.load(1);paused=true;const tree=treeObjects.find(t=>t.visible);igniteStormTarget(tree);const b=stormBurning.get(tree);b.time-=seconds;updateLivingFire(tree,b,performance.now());boy.position.set(tree.position.x,0,tree.position.z+5);yaw=Math.PI;camMode=3;return {time:b.time,emissive:b.materials[0].mesh.material.emissive?.getHex(),color:b.materials[0].mesh.material.color.getHex()}},
 revision(){return {entry:[boy.position.x,boy.position.z],heading:yaw,topHeight:camera.position.y-boy.position.y,movie:movie?{people:movie.people.map(p=>p.visible),hero:movie.hero.visible,blanket:movie.picnic?.visible,carZ:movie.car?.position.z}:null,vortices:false,waves:lakeWaves.length}},

 state(){return {season:currentSeason,failedAttempts:attemptProgress.failed,camMode,level,version:GAME_VERSION,flashlight:hasFlashlight,friend:!!friend,apples:yellowAppleStock,mushrooms:yellowMushroomStock,form:boarFormTime,basins:puddleObjects.length,boss:foes.find(f=>f.isBoss)?.maxHp,redTrees:treeObjects.filter(t=>{let red=false;t.traverse(m=>{if(m.material?.emissive?.getHex())red=true});return red}).length}},
 prepareRestart(){hasFlashlight=true;yellowAppleStock=2;yellowMushroomStock=2;boarFormTime=30;const t=treeObjects.find(t=>t.visible);if(t)igniteBossTree(t);friend=makeBoar(3,6,true);mountedFriend=true;return this.state()},
 restart(){restartGame();return this.state()},
 load(n,diff=2){selectedDiff=diff;loadLevel(n);return this.state()},
 season(n){attemptProgress.failed=n;currentSeason=seasonForAttempts(n);clearWorldFires();loadLevel(level);return this.state()},
 form(){startBoarForm();return boarFormVisual.children.filter(o=>o.isMesh&&o.geometry.type==='RingGeometry'&&o.visible).length},
 swim(x=-18,z=-17){if(friend)scene.remove(friend.g);friend=makeBoar(x,z,true);mountedFriend=true;boy.position.set(x,riderSeatHeight()-.58,z);friend.g.position.set(x,-.58,z);py=riderSeatHeight();vy=0;return this.state()},
 position(){return {x:boy.position.x,y:boy.position.y,z:boy.position.z,boarY:friend?.g.position.y,depth:lakeDepthAt(boy.position.x,boy.position.z),mounted:mountedFriend}},
 top(){camMode=8;$('camera').textContent='📷 Вид 9/9';return this.state()},
 cameraDirection(){return camera.getWorldDirection(new THREE.Vector3()).toArray()},
 snow(seconds=30){levelTime=190;updateWeather(seconds,performance.now());return {season:currentSeason,stage:weatherStage,lightning:lightningBolts.length,snow:snowGroup.visible,rain:weatherGroup.visible,carry:hurricaneCarry}},
 movie(kind='intro',time=2,role=0){const member=familyMembers.find(f=>f.role===role);playCinematic(kind,()=>{paused=false;familyPopupOpen=false},{role,member,line:'Тимур нашёл родного человека. Семья снова рядом.'});movie.elapsedOverride=time;return {running:cinematicRunning,actors:movieRoot.children.length}},
 movieSeek(time){if(movie)movie.elapsedOverride=time;return {kind:movie?.kind,time}},
 movieDone(){cinematicFinish?.();return {running:cinematicRunning,actors:movieRoot.children.length,paused}},
 lamp(){hasFlashlight=true;boarFormTime=0;boy.visible=true;paused=true;boy.rotation.y=Math.PI/3;updateHandFlashlight();return {visible:handFlashlight.visible,origin:torch.position.toArray(),target:torch.target.position.toArray(),heading:boy.rotation.y}},
 aquatic(){return {fish:aquaticFish.filter(f=>f.level===level).length,weeds:aquaticWeeds.filter(f=>f.level===level).length,riverX:riverGeo.attributes.position.getX(riverGeo.attributes.position.count-1),carved:surfaceGeometry.attributes.position.array.some(v=>v<-1)}},
 viewRiver(){boy.position.set(0,0,-2);yaw=Math.PI;camMode=3;return this.state()},
 lose(){showEnd(false);return this.state()},
 puddles(stage,seconds){weatherStage=stage;updatePuddles(seconds);return {fill:puddleRain,radius:puddleObjects[0]?.scale.x,height:puddleObjects[0]?.position.y}},
 rain(seconds=100){levelTime=120;weatherStage=2;puddleRain=0;updatePuddles(seconds);const p=puddleObjects[0];if(p)boy.position.set(p.position.x,0,p.position.z+5);yaw=Math.PI;camMode=3;return this.state()}
};
function runMountainGeometryAudit(){
 const issues=[],samples=[];if(level!==5)return {ok:true,issues,samples,tested:0,level};
 const saved={x:boy.position.x,y:boy.position.y,z:boy.position.z,mounted:mountedFriend,py,vy};let sweeps=0;
 try{py=0;vy=0;
  for(const [,,,mesh] of mountainObstacles){const polygon=mountainFootprint(mesh);if(polygon.length<3){issues.push('mountain-empty-footprint');continue}
   const center=polygon.reduce((a,p)=>({x:a.x+p.x/polygon.length,z:a.z+p.z/polygon.length}),{x:0,z:0});
   if(!polygonContact(polygon,center.x,center.z,PLAYER_RADIUS))issues.push('mountain-center-not-solid');
   for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],length=Math.hypot(b.x-a.x,b.z-a.z),nx=(b.z-a.z)/length,nz=-(b.x-a.x)/length,cx=(a.x+b.x)/2,cz=(a.z+b.z)/2;
    for(const mounted of [false,true]){const radius=mounted?MOUNTED_ROCK_RADIUS:PLAYER_RADIUS,x=cx+nx*(radius+.06),z=cz+nz*(radius+.06);
     if(polygonContact(polygon,x,z,radius))issues.push('mountain-invisible-halo');
     if(!polygonContact(polygon,cx+nx*radius*.5,cz+nz*radius*.5,radius))issues.push('mountain-edge-not-solid');
     mountedFriend=mounted;if(sweeps<24&&!playerWorldBlocked(x,z)){boy.position.set(x,0,z);movePlayerCollision(-nx*.55,-nz*.55);if(polygonContact(polygon,boy.position.x,boy.position.z,radius-.01))issues.push('mountain-sweep-penetration');sweeps++}
    }
   }
   samples.push({vertices:polygon.length});
  }
 }finally{boy.position.set(saved.x,saved.y,saved.z);mountedFriend=saved.mounted;py=saved.py;vy=saved.vy}
 if(!sweeps)issues.push('mountain-no-clear-sweeps');return {ok:issues.length===0,issues,samples,tested:samples.length,sweeps,level};
}
function runFriendYieldAudit(){
 const issues=[],samples=[],saved={friend,owner:friendYieldOwner,active:friendYieldActive,yield:{...friendYield},x:boy.position.x,y:boy.position.y,z:boy.position.z,py,vy,mounted:mountedFriend};
 const testFriend=visualOnly(()=>makeBoar(0,6.6,true));
 try{friend=testFriend;mountedFriend=false;py=0;vy=0;
  for(const fps of [30,60,120]){boy.position.set(0,0,4);friend.g.position.set(0,0,6.6);friendYield.reset();friendYieldOwner=null;let maxStep=0,minDistance=Infinity;
   for(let frame=0;frame<fps;frame++){const ox=friend.g.position.x,oz=friend.g.position.z;updateFriendYield(0,1,1/fps);maxStep=Math.max(maxStep,Math.hypot(friend.g.position.x-ox,friend.g.position.z-oz));
    if(Math.hypot(boy.position.x-friend.g.position.x,boy.position.z+6/fps-friend.g.position.z)>=1.50)movePlayerCollision(0,6/fps);
    minDistance=Math.min(minDistance,Math.hypot(boy.position.x-friend.g.position.x,boy.position.z-friend.g.position.z));
   }
   const lateral=Math.abs(friend.g.position.x),travel=boy.position.z-4;
   if(maxStep>6.8/fps+.001)issues.push('friend-sidestep-teleport');if(lateral<1.8)issues.push('friend-did-not-yield');if(travel<5.5)issues.push('friend-blocked-player');if(minDistance<1.49)issues.push('friend-player-overlap');
   samples.push({fps,lateral:+lateral.toFixed(3),travel:+travel.toFixed(3),maxStep:+maxStep.toFixed(3),minDistance:+minDistance.toFixed(3)});
  }
 }finally{scene.remove(testFriend.g);friend=saved.friend;friendYieldOwner=saved.owner;friendYieldActive=saved.active;Object.assign(friendYield,saved.yield);boy.position.set(saved.x,saved.y,saved.z);py=saved.py;vy=saved.vy;mountedFriend=saved.mounted}
 return {ok:issues.length===0,issues,samples,level};
}
window.__KABANCHIKI_MOUNTAIN_AUDIT__=runMountainGeometryAudit;
window.__KABANCHIKI_FRIEND_YIELD_AUDIT__=runFriendYieldAudit;
if(__autoTest){
 try{
  selectedDiff=2;life=diffCfg().playerHP;food=diffCfg().foodMax;friendHP=diffCfg().friendHP;
  $('intro').style.display='none';$('cinematic').style.display='none';paused=false;started=true;win=false;
  const __lv=Math.max(1,Math.min(6,Number(__autoParams.get('level')||1)));loadLevel(__lv);
  window.__KABANCHIKI_TEST__.level=__lv;
  // v83: readiness must not wait for the expensive robot sweep. GitHub can now distinguish startup from collision-test work.
  window.__KABANCHIKI_TEST__.ready=true;document.documentElement.dataset.kabanchikiReady='1';
  setTimeout(()=>{try{const __v156=runV156Audit();window.__KABANCHIKI_TEST__.v156Audit=__v156;if(!__v156.ok)window.__KABANCHIKI_TEST__.errors.push(...__v156.issues);const __counter=runBossCounterattackAudit();window.__KABANCHIKI_TEST__.bossCounterattackAudit=__counter;if(!__counter.ok)window.__KABANCHIKI_TEST__.errors.push(...__counter.issues);const __revision=runLakeStormFeedingAudit();window.__KABANCHIKI_TEST__.lakeStormFeedingAudit=__revision;if(!__revision.ok)window.__KABANCHIKI_TEST__.errors.push(...__revision.issues);const __boars=runBoarBehaviorAudit();window.__KABANCHIKI_TEST__.boarBehaviorAudit=__boars;if(!__boars.ok)window.__KABANCHIKI_TEST__.errors.push(...__boars.issues);const __mountains=runMountainGeometryAudit();window.__KABANCHIKI_TEST__.mountainAudit=__mountains;if(!__mountains.ok)window.__KABANCHIKI_TEST__.errors.push(...__mountains.issues);const __yield=runFriendYieldAudit();window.__KABANCHIKI_TEST__.friendYieldAudit=__yield;if(!__yield.ok)window.__KABANCHIKI_TEST__.errors.push(...__yield.issues);const __robot=runRobotCollisionTest();window.__KABANCHIKI_TEST__.robotAudit=__robot;if(!__robot.ok)window.__KABANCHIKI_TEST__.errors.push(...__robot.issues);const __climb=runRockClimbAudit();window.__KABANCHIKI_TEST__.rockClimbAudit=__climb;if(!__climb.ok)window.__KABANCHIKI_TEST__.errors.push(...__climb.issues);const __edge=runRockEdgeAudit();window.__KABANCHIKI_TEST__.rockEdgeAudit=__edge;if(!__edge.ok)window.__KABANCHIKI_TEST__.errors.push(...__edge.issues);const __log=runLogPhysicsAudit();window.__KABANCHIKI_TEST__.logPhysicsAudit=__log;if(!__log.ok)window.__KABANCHIKI_TEST__.errors.push(...__log.issues);const __branchApple=runBranchAppleAudit();window.__KABANCHIKI_TEST__.branchAppleAudit=__branchApple;if(!__branchApple.ok)window.__KABANCHIKI_TEST__.errors.push(...__branchApple.issues);const __mountedTerrain=runMountedTerrainAudit();window.__KABANCHIKI_TEST__.mountedTerrainAudit=__mountedTerrain;if(!__mountedTerrain.ok)window.__KABANCHIKI_TEST__.errors.push(...__mountedTerrain.issues);const __treeTrunk=runTreeTrunkAudit();window.__KABANCHIKI_TEST__.treeTrunkAudit=__treeTrunk;if(!__treeTrunk.ok)window.__KABANCHIKI_TEST__.errors.push(...__treeTrunk.issues);const __appleTwig=runReachableAppleTwigAudit();window.__KABANCHIKI_TEST__.reachableAppleTwigAudit=__appleTwig;if(!__appleTwig.ok)window.__KABANCHIKI_TEST__.errors.push(...__appleTwig.issues);const __branchTravel=runBranchTraversalAudit();window.__KABANCHIKI_TEST__.branchTraversalAudit=__branchTravel;if(!__branchTravel.ok)window.__KABANCHIKI_TEST__.errors.push(...__branchTravel.issues);const __passage=runTreeRockPassageAudit();window.__KABANCHIKI_TEST__.treeRockPassageAudit=__passage;if(!__passage.ok)window.__KABANCHIKI_TEST__.errors.push(...__passage.issues);const __multiRock=runMountedMultiRockAudit();window.__KABANCHIKI_TEST__.mountedMultiRockAudit=__multiRock;if(!__multiRock.ok)window.__KABANCHIKI_TEST__.errors.push(...__multiRock.issues);const __corr=runRockCorridorAudit();window.__KABANCHIKI_TEST__.rockCorridorAudit=__corr;if(!__corr.ok)window.__KABANCHIKI_TEST__.errors.push(...__corr.issues);const __mountedApple=runMountedAppleAudit();window.__KABANCHIKI_TEST__.mountedAppleAudit=__mountedApple;if(!__mountedApple.ok)window.__KABANCHIKI_TEST__.errors.push(...__mountedApple.issues)}catch(e){const msg='robot-exception:'+String(e);window.__KABANCHIKI_TEST__.robotAudit={ok:false,pending:false,issues:[msg],samples:[],treesTested:0,rocksTested:0,level:__lv};window.__KABANCHIKI_TEST__.errors.push(msg)}},50);
 }catch(e){window.__KABANCHIKI_TEST__.errors.push(String(e));document.documentElement.dataset.kabanchikiError=String(e)}
}
const victoryFireworks=[];
function spawnVictoryFirework(){if(level!==6)return;const g=new THREE.Group(),colors=[0xffd54a,0xff4b73,0x5be7ff,0x7dff78,0xd88cff],mat=new THREE.MeshBasicMaterial({color:colors[Math.floor(Math.random()*colors.length)],transparent:true,opacity:1});const cx=rand(-18,18),cz=rand(-35,-8),cy=rand(9,17);for(let i=0;i<18;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.10,5,4),mat.clone()),a=Math.PI*2*i/18+rand(-.12,.12),up=rand(.3,1);p.position.set(cx,cy,cz);p.userData.v=new THREE.Vector3(Math.cos(a)*rand(3.2,6),up*rand(2.5,5.5),Math.sin(a)*rand(3.2,6));g.add(p)}scene.add(g);victoryFireworks.push({g,t:0});sound(rand(520,900),.16,'triangle')}
function updateVictoryFireworks(dt){for(let i=victoryFireworks.length-1;i>=0;i--){const fx=victoryFireworks[i];fx.t+=dt;for(const p of fx.g.children){p.position.addScaledVector(p.userData.v,dt);p.userData.v.y-=dt*2.4;p.material.opacity=Math.max(0,1-fx.t/1.8)}if(fx.t>=1.8){scene.remove(fx.g);victoryFireworks.splice(i,1)}}}
function igniteBossTree(t){if(!t||!t.visible||burningTrees.has(t))return;rememberStormObject(t);const materials=prepareFireMaterials(t),flames=createLivingFire(t,'tree'),lm=new THREE.PointLight(0xff882f,8,16,1.2);lm.position.set(0,1.8,0);t.add(lm);burningTrees.set(t,{time:36,duration:36,light:lm,flames,materials,damageRadius:2.65});notice('🔥 Дерево загорелось — огонь постепенно разгорается!')}
function onBossDefeated(boss){if(level!==6||bossVictoryTimer!==null||win)return;scene.remove(boss.g);const bi=foes.indexOf(boss);if(bi>=0)foes.splice(bi,1);for(const m of [...foes]){if(m.isMinion){foes.splice(foes.indexOf(m),1);sendBoarAway(m,'boss-defeated')}}fireballs.forEach(f=>scene.remove(f.g));fireballs=[];bossVictoryTimer=5;bossFireworkTimer=0;notice('👑 Босс побеждён! 🎆 Миньоны разбегаются — через 5 секунд домой!')}
function finishBossVictory(){if(win)return;bossVictoryTimer=null;win=true;score+=familyFound*50;try{localStorage.setItem('kabanchiki3d_best',String(Math.max(score,Number(localStorage.getItem('kabanchiki3d_best')||0))))}catch{}notice(`🎉 ПОБЕДА! Тимур нашёл семью! Очки: ${score}.`);playCinematic('outro',()=>showEnd(true))}
let last=performance.now(),fpsFrames=0,fpsLast=last,fpsValue=0;hud();function loop(now){requestAnimationFrame(loop);boarCollisionEpoch++;adaptiveGraphics.sample(now,started&&!paused&&!endShown&&!cinematicRunning&&!document.hidden);fpsFrames++;if(now-fpsLast>=500){fpsValue=Math.round(fpsFrames*1000/(now-fpsLast));fpsFrames=0;fpsLast=now;const pe=$('perf');if(pe)pe.textContent=`${GAME_VERSION} · FPS ${fpsValue} · Авто: ${GRAPHICS_TIERS[adaptiveGraphics.tier].name} · ⏱ всего ${formatTime(totalTime)} · 📍 ${formatTime(levelTime)}`;}const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;updateSpringBloom(dt);if(level===3){hearthFlame.scale.set(.9+Math.sin(now*.012)*.09,1+Math.sin(now*.009)*.15,1);hearthLight.intensity=2.5+Math.sin(now*.017)*.4}birdLife.update(dt,terrainHeightAt);if(started&&!paused&&!cinematicRunning)catLife.update(dt,birdLife,boarBodies(),{x:boy.position.x,y:boy.position.y,z:boy.position.z});updateAquaticLife(dt,now);updateWaterEffects(dt,now);updateVictoryFireworks(dt);if(started&&life>0&&!win&&!paused){updateCatForm(dt,now);levelTime+=dt;totalTime+=dt;updateFamilyHouseReveal();updateWinterFreeze(dt);updateWeather(dt,now);updateRiverFlow(dt);updateFishing(dt,now);updateHurricaneCarry(dt,now);if(boarFormTime>0){boarFormTime=Math.max(0,boarFormTime-dt);if(boarFormVisual){boarFormVisual.visible=true;boarFormVisual.position.set(boy.position.x,boy.position.y,boy.position.z);boarFormVisual.rotation.y=boy.rotation.y}if(boarFormTime<=0)endBoarForm()}for(const __b of [...friends,...foes]){if(__b?.g?.userData?.tailPivot)__b.g.userData.tailPivot.rotation.y=Math.sin(now*.006+__b.phase)*.42}if(level===1){forestVisual.rotation.z=Math.sin(now*.00045)*.0018;}if(level===2){lakeWaves.forEach((m,i)=>{m.material.opacity=.12+Math.sin(now*.0013+i)*.06;m.position.y=.145+Math.sin(now*.001+i)*.003});waterRippleMatA.opacity=.17+Math.sin(now*.0012)*.045;waterRippleMatB.opacity=.13+Math.sin(now*.00105+1.4)*.035;lakeGlint.scale.x=2.35+Math.sin(now*.0008)*.32;lakeGlint.material.opacity=.18+Math.sin(now*.0011)*.055;}throwCooldown=Math.max(0,throwCooldown-dt);friendAttack=Math.max(0,friendAttack-dt);forageTimer-=dt;if(forageTimer<=0){const activeFood=apples.filter(a=>!a.done&&!['berry','catberry'].includes(a.type)).length,activeBerries=apples.filter(a=>!a.done&&['berry','catberry'].includes(a.type)).length;if(activeFood<4){spawnForage();notice('🌱 Появилась новая еда! 🍎 Яблоки ищи на деревьях — до них нужно допрыгнуть.')}else if(activeBerries<1&&life<diffCfg().playerHP){spawnForage('berry');notice('🫐 Где-то появились лечебные ягоды!')}forageTimer=rand(14,22)}if(flashlightObj&&!hasFlashlight&&Math.hypot(flashlightObj.position.x-boy.position.x,flashlightObj.position.z-boy.position.z)<1.8){hasFlashlight=true;scene.remove(flashlightObj);flashlightObj=null;torch.intensity=42;sound(900,.25);notice('🔦 Фонарик найден! Теперь можно идти в ночное логово.')} boy.children[5].rotation.x*=Math.max(0,1-dt*7);for(let i=shots.length-1;i>=0;i--){const sh=shots[i],previous=sh.g.position.clone();sh.t+=dt*2.8;const t=Math.min(1,sh.t);sh.g.position.lerpVectors(sh.start,sh.target,t);sh.g.position.y+=Math.sin(Math.PI*t)*1.7;if(!clearWallLine(previous,sh.g.position)){scene.remove(sh.g);shots.splice(i,1);continue}sh.g.rotation.y+=dt*9;if(t>=1){resolveMeat(sh);shots.splice(i,1)}}for(const f of familyMembers){if(!f.done){if(level===2&&lakeRadiusAt(f.g.position.x,f.g.position.z)<16.2){const q=nearestSafeSpawn(18,-4,.72)||[18,-4];f.g.position.x=f.x=q[0];f.g.position.z=f.z=q[1]}f.person.rotation.y=0;f.g.rotation.y=Math.atan2(boy.position.x-f.g.position.x,boy.position.z-f.g.position.z)}}// v165: classic shooter axes — W/S (or ↑/↓) move forward/back; A/D (or ←/→) strafe relative to camera yaw.
const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-stick.y,side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+stick.x;const len=Math.max(1,Math.hypot(forward,side));let dx=(Math.sin(yaw)*forward-Math.cos(yaw)*side)/len,dz=(Math.cos(yaw)*forward+Math.sin(yaw)*side)/len;if(hurricaneCarry>0){dx=0;dz=0}// v87: pressing jump close to a friendly boar mounts it directly; no tree/wall pinning is needed.
if(boarFormTime<=0&&!mountedFriend&&jump&&friend?.g&&!friend.flee&&py<.35&&Math.hypot(boy.position.x-friend.g.position.x,boy.position.z-friend.g.position.z)<2.65){jump=false;mountFriendNow()}
friendKnockbackActive=updateFriendKnockback(dt);if(friendKnockbackActive){dx=0;dz=0}
const moveSpeed=mountedFriend?8.6:6;let windSlow=1;if(weatherStage>=2&&Math.hypot(dx,dz)>.05){const w=windVector(now),against=Math.max(0,-(dx*w.x+dz*w.z));windSlow=Math.max(weatherStage>=4?.42:.58,1-against*w.power*.58)}let mx=dx*dt*moveSpeed*windSlow,mz=dz*dt*moveSpeed*windSlow;
// v77 collision solver: trees (including branches), rocks, mountains and lair props use the same solid model.
// v86: while airborne, Timur may pass over the friendly boar so he can actually land on its back.
updateFriendYield(dx,dz,dt);
const friendTouch=!mountedFriend&&py<.58&&friend?.g&&!friend.flee&&Math.hypot(boy.position.x+mx-friend.g.position.x,boy.position.z+mz-friend.g.position.z)<1.50;
const blockingBoar=boarBodies().find(b=>b!==friend&&boarPlayerContact(b,b.g.position.x,b.g.position.z,b.g.rotation.y,boy.position.x+mx,boy.position.z+mz));
if(!friendTouch&&!blockingBoar)movePlayerCollision(mx,mz);
else if(blockingBoar||friendTouch){
 const body=blockingBoar||friend;
 const rx=boy.position.x-body.g.position.x,rz=boy.position.z-body.g.position.z,rl=Math.max(.001,Math.hypot(rx,rz));
 const tx=-rz/rl,tz=rx/rl,sign=(dx*tx+dz*tz)>=0?1:-1,mag=Math.hypot(mx,mz)*.68;
 const sx=tx*sign*mag,sz=tz*sign*mag;if(!playerWorldBlocked(boy.position.x+sx,boy.position.z+sz)&&(!friendTouch||Math.hypot(boy.position.x+sx-friend.g.position.x,boy.position.z+sz-friend.g.position.z)>=1.50))movePlayerCollision(sx,sz)
}
if(Math.hypot(dx,dz)>.05){boy.rotation.y=Math.atan2(dx,dz);const walk=Math.sin(now*.014);boy.children[0].rotation.x=walk*.24;boy.children[1].rotation.x=-walk*.24;if(throwCooldown<=.18)boy.children[5].rotation.x=-walk*.16;boy.children[6].rotation.x=walk*.16}else{boy.children[0].rotation.x=boy.children[1].rotation.x=0;if(throwCooldown<=.18){boy.children[5].rotation.x*=Math.max(0,1-dt*9);boy.children[6].rotation.x*=Math.max(0,1-dt*9)}}
if(mountedFriend&&(!friend||friend.flee)){mountedFriend=false;setRiderPose(false);boy.rotation.z=0;py=0;vy=0}
if(mountedFriend){
 if(jump){mountedFriend=false;setRiderPose(false);boy.rotation.z=0;jump=false;if(friend?.g)friend.g.position.y=0;rideBump=0;py=1.18;vy=6.2;const a=boy.rotation.y;boy.position.x+=Math.sin(a)*1.15;boy.position.z+=Math.cos(a)*1.15;notice('🐗 Тимур спрыгнул с кабанчика!')}
 else{const nearLog=level===1?logObstacles.reduce((best,o)=>{const d=logDistance(o,boy.position.x,boy.position.z).distance-(o.r+.48);return Math.min(best,d)},99):99;const bumpTarget=nearLog<0?Math.min(.48,(-nearLog/.48)*.48):0;rideBump+=(bumpTarget-rideBump)*Math.min(1,dt*12);const ridingMoving=Math.hypot(dx,dz)>.05;rideGallop+=(ridingMoving?dt*11:dt*3.5);const gallop=ridingMoving?Math.abs(Math.sin(rideGallop))*.15:Math.sin(rideGallop)*.025;const bridgeLift=familyFloorAt(boy.position.x,boy.position.z)+(level===4&&onRiverBridge(boy.position.x,boy.position.z)?.28:0);py=riderSeatHeight()+bridgeLift+rideBump+gallop;vy=0;friend.g.position.x=boy.position.x;friend.g.position.z=boy.position.z;friend.g.position.y=bridgeLift+rideBump+gallop*.48;friend.g.rotation.y=boy.rotation.y;friend.b.rotation.x=ridingMoving?Math.sin(rideGallop)*.08:0;boy.position.y=py;boy.rotation.z=ridingMoving?Math.sin(rideGallop)*.035:0;setRiderPose(true);const legKick=Math.sin(rideGallop)*.18;if(riderPoseParts.leftLeg)riderPoseParts.leftLeg.rotation.x=-1.02+legKick;if(riderPoseParts.rightLeg)riderPoseParts.rightLeg.rotation.x=-1.02-legKick;mountedFriendDefense()}
}else{
 // v122: a low fallen branch is a real step-over surface. When Timur walks into it from ground
 // level, lift his feet onto the visible branch instead of leaving the model sunk through it.
 const branchTop=branchStepHeightAt(boy.position.x,boy.position.z);
 if(py<=.08&&vy<=.05&&branchTop>0){py=branchTop;vy=0;boy.position.y=py}
 const supportNow=playerSupportHeightAt(boy.position.x,boy.position.z),grounded=Math.abs(py-supportNow)<.13&&vy<=.12;
 if(grounded){boy.userData.lastGroundedAt=now;if(Math.abs(py-supportNow)<.13&&vy<=.05){py=supportNow;boy.position.y=py}}
 const jumpSupported=grounded||(now-(boy.userData.lastGroundedAt||0)<140);
 if(jump&&now-(boy.userData.jumpQueuedAt||now)<220&&jumpSupported&&boarFormTime<=0){softEffectTone(240,.15,'sine',.018,0,370);if(waterAt(boy.position.x,boy.position.z))spawnWaterSplash(boy.position.x,boy.position.z,1.8);vy=catFormTime>0?CAT_JUMP_SPEED:7;jump=false}else if(jump&&boarFormTime>0)jump=false
 const prevPy=py;vy-=18*dt;let nextPy=py+vy*dt;const support=playerSupportHeightAt(boy.position.x,boy.position.z);
 // Land on the top surface only while descending from above; never teleport through a rock/roof from below.
 if(vy<=0&&prevPy>=support-.10&&nextPy<=support){if(vy<-2){if(waterAt(boy.position.x,boy.position.z))spawnWaterSplash(boy.position.x,boy.position.z,2.8);else effect('land');}py=support;vy=0}else{py=Math.max(0,nextPy);if(py===0)vy=0}
 boy.position.y=py;
 if(catFormTime<=0&&friend?.g&&!friend.flee&&py>.62&&py<2.35&&vy<=2.2&&Math.hypot(boy.position.x-friend.g.position.x,boy.position.z-friend.g.position.z)<1.95){mountFriendNow()}
}
// v134: lake depth affects Timur and boars. Staying fully submerged too long costs health.
const sink=lakeDepthAt(boy.position.x,boy.position.z)+puddleDepthAt(boy.position.x,boy.position.z);if(sink>0){const swimSink=sink;boy.position.y=py-swimSink;if(mountedFriend&&friend?.g)friend.g.position.y=rideBump+(Math.abs(Math.sin(rideGallop))*.15)*.48-swimSink}for(const q of foes){if(!q.flee)q.g.position.y=-Math.min(lakeDepthAt(q.g.position.x,q.g.position.z),level===2?Infinity:BOAR_MAX_WATER_DEPTH)}if(friend?.g&&!mountedFriend&&!friend.flee)friend.g.position.y=-Math.min(lakeDepthAt(friend.g.position.x,friend.g.position.z),level===2?Infinity:BOAR_MAX_WATER_DEPTH);
updateUnderwater(dt);
invuln=Math.max(0,invuln-dt);
for(const f of familyMembers){if(!f.done&&Math.hypot(f.x-boy.position.x,f.z-boy.position.z)<2){f.done=true;scene.remove(f.g);familyFound=Math.min(4,familyFound+1);statsData.family++;levelFamilyDone++;life=diffCfg().playerHP;food=diffCfg().foodMax;if(friend)friendHP=diffCfg().friendHP;invuln=3;score+=diffScore(50);sound(880,.25,'sine');showFamilyPopup(f.role,f)}}
for(let i=defeatedBoars.length-1;i>=0;i--){const f=defeatedBoars[i];f.fleeTime+=dt;moveBoarToward(f,f.g.position.x+f.fleeDir.x*10,f.g.position.z+f.fleeDir.z*10,(f.fleeSpeed||6.5)+f.fleeTime*1.8,dt);f.b.rotation.z=Math.sin(now*.025)*.08;f.b.position.y=Math.abs(Math.sin(now*.025))*.10;if(Math.abs(f.g.position.x)>55||Math.abs(f.g.position.z)>55){scene.remove(f.g);defeatedBoars.splice(i,1)}}
if(friend&&!mountedFriend&&!friendYieldActive&&!friendKnockbackActive&&!friend.knockback?.active){friend.b.rotation.z*=Math.max(0,1-dt*8);friend.b.position.y*=Math.max(0,1-dt*8);friend.blinkTimer-=dt;if(friend.blinkTimer<=0){for(const e of (friend.eyes||[]))e.scale.y=.012;setTimeout(()=>{if(friend)for(const e of (friend.eyes||[]))e.scale.y=.07},120);friend.blinkTimer=rand(2.2,5.5)}friend.idleTimer-=dt;if(friend.idleTimer<=0&&friend.g.position.distanceTo(boy.position)<5){friend.graze=rand(1.5,3.4);friend.idleTimer=rand(5,10)}if(friend.graze>0){friend.graze-=dt;friend.b.rotation.x=.28+Math.sin(now*.004)*.06;friend.b.position.y=-.10;friend.g.rotation.y+=Math.sin(now*.0015)*dt*.25}else{friend.b.rotation.x*=Math.max(0,1-dt*5)}const targets=attacksPlayer(boarFormTime+catFormTime)?foes.filter(f=>f!==friend):[];targets.sort((a,b)=>(b.isBoss?1:0)-(a.isBoss?1:0)||friend.g.position.distanceTo(a.g.position)-friend.g.position.distanceTo(b.g.position));const target=targets[0];const td=target?friend.g.position.distanceTo(target.g.position):99;if(target&&td<10){const combatYaw=Math.atan2(target.g.position.x-friend.g.position.x,target.g.position.z-friend.g.position.z),combatTurn=Math.atan2(Math.sin(combatYaw-friend.g.rotation.y),Math.cos(combatYaw-friend.g.rotation.y));friend.g.rotation.y+=combatTurn*(1-Math.exp(-7*dt));const combatDist=boarRadius(friend)+boarRadius(target)+.12;if(!boarsInContact(friend,target,.25)){moveFriendAroundObstacles(target.g.position.x,target.g.position.z,4.6,dt)}else if(friendAttack<=0&&clearWallLine(friend.g.position.clone().add(new THREE.Vector3(0,.8,0)),target.g.position.clone().add(new THREE.Vector3(0,.8,0)))){friendAttack=.92;target.b.rotation.x=-.24;friend.b.rotation.x=-.18;
const ax=target.g.position.x-friend.g.position.x,az=target.g.position.z-friend.g.position.z,al=Math.max(.01,Math.hypot(ax,az));if(target.isBoss)bossRepelsFriend(target,friend);else{friend.g.position.x-=ax/al*.16;friend.g.position.z-=az/al*.16}
bossBattleImpact((friend.g.position.x+target.g.position.x)/2,(friend.g.position.z+target.g.position.z)/2);sound(target.isBoss?105:145,.18,'triangle');
if(target.isBoss){target.hp--;bossHits++;statsData.bossHits++;bossRage=Math.min(2.35,bossRage+.12);moveBoarToward(target,target.g.position.x+ax/al*5,target.g.position.z+az/al*5,.95,1);target.stagger=Math.max(target.stagger||0,1.0);notice(`⚔️ Друг ударил босса, а босс отшвыривает друга! Осталось ${target.hp}/${target.maxHp}`);if(target.hp<=0){score+=diffScore(200);onBossDefeated(target)}}else if(target.isMinion){hitBossMinion(target,ax,az,al)}else{foes.splice(foes.indexOf(target),1);sendBoarAway(target,'defeated');levelBoarsDone++;statsData.minions++;score+=diffScore(25);softBoarDefeatSound();notice('💚 Побеждённый кабанчик испугался и убегает!')}friendHP--;if(friendHP<=0){scene.remove(friend.g);friend=null;notice('💔 Кабанчик-друг пал в бою')}}}else{const d=Math.hypot(friend.g.position.x-boy.position.x,friend.g.position.z-boy.position.z);if(d>4.2){moveFriendAroundObstacles(boy.position.x,boy.position.z,3.25,dt)}if(d<=3.6){const idleYaw=Math.atan2(boy.position.x-friend.g.position.x,boy.position.z-friend.g.position.z),idleTurn=Math.atan2(Math.sin(idleYaw-friend.g.rotation.y),Math.cos(idleYaw-friend.g.rotation.y));friend.g.rotation.y+=idleTurn*(1-Math.exp(-3.2*dt))}}}
if(level<6&&questsComplete()){if(!portalObj.g.visible){effect('portal');softEffectTone(392,.34,'sine',.025,0,784)}portalObj.g.visible=true;portalObj.ring.rotation.z=0;portalObj.core.material.opacity=.42+Math.sin(now*.006)*.14;portalObj.glow.intensity=7+Math.sin(now*.008)*2;if(Math.hypot(boy.position.x,boy.position.z+42)<2.2){score+=Math.max(0,Math.round(120-levelTime));const hadFriend=!!friend;loadLevel(level+1);if(hadFriend)notice('💚 Кабанчик-друг прошёл через портал вместе с Тимуром!')}}
if(level===6&&bossVictoryTimer!==null&&!win){bossVictoryTimer=Math.max(0,bossVictoryTimer-dt);bossFireworkTimer-=dt;if(bossFireworkTimer<=0){spawnVictoryFirework();bossFireworkTimer=.32}if(bossVictoryTimer<=0)finishBossVictory()}
for(const f of foes){f.phase+=dt;f.stagger=Math.max(0,(f.stagger||0)-dt);if(f.isBoss){f.b.position.y=Math.sin(now*.004)*.035;f.b.rotation.z=Math.sin(now*.0032)*.018}const d=Math.hypot(f.g.position.x-boy.position.x,f.g.position.z-boy.position.z);f.bolt.visible=attacksPlayer(boarFormTime+catFormTime)&&d<13;if(boarShouldChasePlayer(f,d)){const chaseSpeed=(f.isBoss?f.baseSpeed*bossRage:1.65)*(.65+diffCfg().speedMult*.55);if(!(f.stagger>0))moveBoarToward(f,boy.position.x,boy.position.z,chaseSpeed,dt);f.g.rotation.y=Math.atan2(boy.position.x-f.g.position.x,boy.position.z-f.g.position.z)}else if(!f.isBoss){
  f.roamTimer=(f.roamTimer??0)-dt; f.roamPause=(f.roamPause??0)-dt; f.blinkTimer=(f.blinkTimer??rand(1,4))-dt;
  if(f.blinkTimer<=0){for(const e of (f.eyes||[]))e.scale.y=.012; f._blink=.12; f.blinkTimer=rand(2.4,6)}
  if(f._blink>0){f._blink-=dt;if(f._blink<=0)for(const e of (f.eyes||[]))e.scale.y=.07}
  if(f.graze>0){f.graze-=dt;f.b.rotation.x=.25+Math.sin(now*.004+f.phase)*.05;f.b.position.y=-.08}
  else if(f.roamPause>0){f.b.rotation.x*=Math.max(0,1-dt*5)}
  else{
    if(f.roamTimer<=0||Math.hypot((f.roamX??f.g.position.x)-f.g.position.x,(f.roamZ??f.g.position.z)-f.g.position.z)<1){
      if(Math.random()<.38){f.graze=rand(1.4,3.2);f.roamPause=rand(.4,1.2)}
      const a=rand(0,Math.PI*2),r=rand(3,8);f.roamX=Math.max(-40,Math.min(40,f.g.position.x+Math.sin(a)*r));f.roamZ=Math.max(-40,Math.min(40,f.g.position.z+Math.cos(a)*r));f.roamTimer=rand(3.5,7.5)
    }
    if(f.graze<=0){moveBoarToward(f,f.roamX,f.roamZ,.75,dt);f.g.rotation.y=Math.atan2(f.roamX-f.g.position.x,f.roamZ-f.g.position.z)}
  }
}else{f.g.rotation.y+=dt*.2}if(attacksPlayer(boarFormTime+catFormTime)&&d<4){f.b.rotation.x=-.11;f.b.rotation.z=Math.sin(now*.035)*.045;f.b.position.z=Math.sin(now*.018)*.10}else{f.b.rotation.x=0;f.b.rotation.z=0;f.b.position.z=0}f.b.position.y=0;const attackDist=boarAttackDistance(f);f.attackLeap=attacksPlayer(boarFormTime+catFormTime)?Math.max(0,(f.attackLeap||0)-dt):0;const attackLine=clearWallLine(f.g.position.clone().add(new THREE.Vector3(0,.8,0)),boy.position.clone().add(new THREE.Vector3(0,1,0)));if(!f.attackLeap&&d<attackDist+1&&invuln<=0&&boarFormTime<=0&&catFormTime<=0&&attackLine&&!(f.stagger>0))f.attackLeap=.6;if(f.attackLeap>0){const progress=1-f.attackLeap/.6;f.b.position.y=Math.sin(progress*Math.PI)*.55;f.b.rotation.x=-Math.sin(progress*Math.PI)*.18;moveBoarToward(f,boy.position.x,boy.position.z,4,dt)}
if(f.attackLeap>0&&f.attackLeap<.2&&d<attackDist&&invuln<=0&&boarFormTime<=0&&catFormTime<=0&&clearWallLine(f.g.position.clone().add(new THREE.Vector3(0,.8,0)),boy.position.clone().add(new THREE.Vector3(0,1,0)))){life--;damage++;statsData.damage++;invuln=3;softBoarAttackSound();playerHitFeedback('boar',f);
 if(f.isBoss){
   const ax=f.g.position.x-boy.position.x,az=f.g.position.z-boy.position.z,al=Math.max(.001,Math.hypot(ax,az));
   f.g.position.x+=ax/al*.85;f.g.position.z+=az/al*.85;f.stagger=1.15;bossRage=Math.max(.9,bossRage-.16);
   notice(life>0?'💥 Босс таранит! Он отшатнулся — уходи в сторону, пока есть окно!':'💔 Игра окончена.');
 }else notice(life>0?'💥 Кабан атаковал! Отбеги и брось еду 🍎':'💔 Игра окончена.');
 if(life<=0)showEnd(false)}}if(level===6){const boss=foes.find(f=>f.isBoss);if(boss){bossRage=Math.min(2.35,bossRage+dt*.018);bossSummon-=dt;if(bossSummon<=0){const minions=foes.filter(f=>!f.isBoss).length;if(minions<4){const count=Math.min(2,4-minions);for(let k=0;k<count;k++){const a=rand(0,Math.PI*2),r=rand(8,13),m=makeBoar(boss.g.position.x+Math.sin(a)*r,boss.g.position.z+Math.cos(a)*r,false);m.isMinion=true;m.hp=1;m.maxHp=1;m.stagger=0;foes.push(m)}notice(`👑 Босс призвал ${count} кабанчика-миньона! Накорми одного, чтобы получить друга.`)}bossSummon=rand(8,13)}const eyeMat=new THREE.MeshBasicMaterial({color:0xff4a16});if(!boss.eyeGlow){boss.eyeGlow=[];for(const xx of [-.34,.34])boss.eyeGlow.push(sphere(boss.b,eyeMat,xx,1.01,1.39,.10));boss.rageLight=new THREE.PointLight(0xff5420,0,24,1.35);boss.rageLight.position.set(0,1.08,1.48);boss.b.add(boss.rageLight);boss.auraGlow=new THREE.Mesh(new THREE.RingGeometry(2.45,3.35,32),new THREE.MeshBasicMaterial({color:0xff4a16,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));boss.auraGlow.rotation.x=-Math.PI/2;boss.auraGlow.position.y=.08;boss.g.add(boss.auraGlow);boss.crownLight=new THREE.PointLight(0xff2d00,8,28,1.25);boss.crownLight.position.set(0,2.2,0);boss.g.add(boss.crownLight)}const eyePower=Math.min(1,Math.max(.18,(bossRage-.75)/1.6));for(const e of boss.eyeGlow)e.scale.setScalar(1+eyePower*.55);boss.rageLight.intensity=8+eyePower*13+(boss.hp<=2?7:0);boss.crownLight.intensity=7+eyePower*10+(boss.hp<=2?5:0);boss.auraGlow.material.opacity=.20+eyePower*.24+Math.sin(now*.008)*.05;boss.auraGlow.rotation.z+=dt*(.35+eyePower*.45);boss.attackCd-=dt;const bossBoyDist=Math.hypot(boss.g.position.x-boy.position.x,boss.g.position.z-boy.position.z);if(attacksPlayer(boarFormTime+catFormTime)&&boss.attackCd<=0&&bossBoyDist>6.5&&fireballs.length<3&&!(boss.stagger>0)){const shotsN=boss.hp<=1?Math.min(2,3-fireballs.length):1;for(let k=0;k<shotsN;k++){const a=Math.atan2(boy.position.x-boss.g.position.x,boy.position.z-boss.g.position.z)+(k-(shotsN-1)/2)*.18;const fg=new THREE.Group(),core=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),new THREE.MeshBasicMaterial({color:0xfff0a0})),flame=new THREE.Mesh(new THREE.SphereGeometry(.52,10,8),new THREE.MeshBasicMaterial({color:0xff4a00,transparent:true,opacity:.72})),light=new THREE.PointLight(0xff5a18,9,9);fg.add(core,flame,light);fg.position.set(boss.g.position.x,1.25,boss.g.position.z);scene.add(fg);fireballs.push({g:fg,a,flame,light})}boss.attackCd=boss.hp<=1?1.15:1.65;effect('fire');notice(shotsN===2?'🔥 Босс выпускает два огненных сгустка!':'🔥 Босс швыряет настоящий огонь!')}}for(let i=fireballs.length-1;i>=0;i--){const q=fireballs[i];q.g.position.x+=Math.sin(q.a)*dt*5.4;q.g.position.z+=Math.cos(q.a)*dt*5.4;q.flame.scale.setScalar(.85+Math.sin(now*.025+i)*.25);q.g.position.y=1.0+Math.sin(now*.018+i)*.18;let burned=false;for(const t of treeObjects){if(t.visible&&t.position.distanceTo(q.g.position)<1.5){igniteBossTree(t);scene.remove(q.g);fireballs.splice(i,1);burned=true;break}}if(burned)continue;if(q.g.position.distanceTo(boy.position)<1.1&&invuln<=0&&boarFormTime<=0){life--;statsData.damage++;invuln=3;sound(120,.3,'sawtooth');playerHitFeedback('fire');scene.remove(q.g);fireballs.splice(i,1);notice('🔥 Огонь попал! -1❤️');if(life<=0)showEnd(false);continue}if(Math.abs(q.g.position.x)>50||Math.abs(q.g.position.z)>50){scene.remove(q.g);fireballs.splice(i,1)}}for(const [t,b] of burningTrees){b.time-=dt;updateLivingFire(t,b,now);if(Math.hypot(t.position.x-boy.position.x,t.position.z-boy.position.z)<b.damageRadius&&invuln<=0){life--;statsData.damage++;invuln=2.4;playerHitFeedback('fire');notice(life>0?'🔥 Слишком близко к горящему дереву! -1❤️':'🔥 Тимур обжёгся у горящего дерева.');if(life<=0)showEnd(false)}if(b.time<=0){t.remove(b.light);if(b.flames)t.remove(b.flames);for(const a of apples){if(!a.done&&(a.tree===t||a.g?.userData?.appleTree===t)){a.done=true;scene.remove(a.g)}}t.visible=false;makeCharredTreeRemains(t.position.x,t.position.z,1);burningTrees.delete(t);notice('🪵 Дерево сгорело — остался метровый обгоревший пень с обломанными ветвями.')}}}for(let i=battleFx.length-1;i>=0;i--){const fx=battleFx[i];fx.t+=dt;const k=fx.t/.42;fx.g.scale.setScalar(1+k*3.2);fx.ring.material.opacity=Math.max(0,1-k);for(let j=1;j<fx.g.children.length;j++){const p=fx.g.children[j];p.position.y+=dt*1.5;p.material.opacity=Math.max(0,1-k);p.material.transparent=true}if(k>=1){scene.remove(fx.g);battleFx.splice(i,1)}}
if(friend){repairCompanion(mountedFriend?playerBoarBody():friend);if(mountedFriend){friend.g.position.x=boy.position.x;friend.g.position.z=boy.position.z}}for(const f of [...boarBodies(),...defeatedBoars])if(!(mountedFriend&&f===friend))resolveBoarClearance(f);if(mountedFriend||boarFormTime>0){resolveBoarClearance(playerBoarBody(),false);if(mountedFriend&&friend){friend.g.position.x=boy.position.x;friend.g.position.z=boy.position.z}}
for(const f of boarBodies()){const calm=f.graze>0&&!f.flee&&!f.attackLeap&&!(f.stagger>0)&&lakeDepthAt(f.g.position.x,f.g.position.z)<.08&&(currentSeason==='summer'||currentSeason==='spring')&&(f===friend?!mountedFriend&&!friendYieldActive&&!friendKnockbackActive&&friend.g.position.distanceTo(boy.position)<3&&!foes.some(q=>q!==friend&&q.g.position.distanceTo(friend.g.position)<10):!boarShouldChasePlayer(f,Math.hypot(f.g.position.x-boy.position.x,f.g.position.z-boy.position.z)));updateBoarChewing(f,now,calm)}
if(fishingTarget)boy.rotation.y=Math.atan2(fishingTarget.x-boy.position.x,fishingTarget.z-boy.position.z);boy.position.y+=terrainHeightAt(boy.position.x,boy.position.z);for(const q of [...boarBodies(),...defeatedBoars])q.g.position.y=q.flee?terrainHeightAt(q.g.position.x,q.g.position.z)-lakeDepthAt(q.g.position.x,q.g.position.z)-puddleDepthAt(q.g.position.x,q.g.position.z):q.g.position.y+terrainHeightAt(q.g.position.x,q.g.position.z)+(mountedFriend&&q===friend?0:familyFloorAt(q.g.position.x,q.g.position.z));for(const a of apples){if(level===4&&!a.done&&Math.abs(a.z-riverCenterAt(a.x))<4.6){a.done=true;scene.remove(a.g);continue}if(canCollectForage(a))collectForageItem(a)}act=false;hud()}const pos=boy.position;const camPresets=[{pitch:.30,dist:8.8,lift:3.8},{pitch:.22,dist:7.5,lift:3.0},{pitch:.14,dist:6.4,lift:2.35},{pitch:.38,dist:10.5,lift:5.6},{pitch:.12,dist:4.7,lift:2.05},{pitch:.10,dist:9.8,lift:2.2},{pitch:.46,dist:7.2,lift:6.6},{pitch:.20,dist:5.5,lift:2.75},{pitch:Math.PI/2,dist:0,lift:22}],cp=camPresets[camMode];const fixedPitch=cp.pitch,distCam=cp.dist;/* v133: rider animation may bounce, camera anchor must not. */const cameraAnchorY=mountedFriend?riderSeatHeight()-lakeDepthAt(pos.x,pos.z)+terrainHeightAt(pos.x,pos.z)+familyFloorAt(pos.x,pos.z)+(level===4&&onRiverBridge(pos.x,pos.z)?.28:0):pos.y,cy=cameraAnchorY+1.55;const look=new THREE.Vector3(pos.x+Math.sin(yaw)*Math.cos(fixedPitch)*7,cy-.15+Math.sin(fixedPitch)*1.2,pos.z+Math.cos(yaw)*Math.cos(fixedPitch)*7);camera.position.set(pos.x-Math.sin(yaw)*distCam,cy+cp.lift,pos.z-Math.cos(yaw)*distCam);boy.visible=boarFormTime<=0&&catFormTime<=0&&!cinematicRunning;if(catFormModel){catFormModel.g.visible=catFormTime>0&&!cinematicRunning;catFormModel.g.position.copy(boy.position);catFormModel.g.rotation.y=boy.rotation.y;}if(boarFormVisual&&boarFormTime>0&&!cinematicRunning){boarFormVisual.visible=true;boarFormVisual.position.set(pos.x,pos.y,pos.z);boarFormVisual.rotation.y=boy.rotation.y}if(camMode===8){camera.position.set(pos.x,cy+22,pos.z);look.set(pos.x,cy,pos.z);camera.up.set(Math.sin(yaw),0,Math.cos(yaw))}else camera.up.set(0,1,0);camera.lookAt(look);if(cinematicRunning)updateCinematic(now,look);updateHandFlashlight();
// v124: anything large between camera and Timur fades: houses, trees, rocks and cliffs.
// Track only last frame's roots, avoiding a full-world material reset every frame.
const occluderRoots=[...treeObjects,...rockPositions.map(q=>q[3]),...houseObjects.filter(h=>h!==familyHideout),...ridgeObjects,...boundaryDecor,...(level>=5?biomeObjects.filter(o=>o.visible):[])].filter(Boolean);
if(!loop._fadedRoots)loop._fadedRoots=new Set();for(const root of loop._fadedRoots)setObjectCameraFade(root,false);loop._fadedRoots.clear();
const rayDir=boy.position.clone().add(new THREE.Vector3(0,1.1,0)).sub(camera.position),rayLen=rayDir.length();rayDir.normalize();const occlusionRay=new THREE.Raycaster(camera.position,rayDir,0,rayLen);const hits=occlusionRay.intersectObjects(occluderRoots,true),rootSet=new Set(occluderRoots);
for(const hit of hits){let root=hit.object;while(root.parent&&!rootSet.has(root))root=root.parent;if(rootSet.has(root)&&!loop._fadedRoots.has(root)){loop._fadedRoots.add(root);setObjectCameraFade(root,true)}}if(soundscape)soundscape.update({active:started&&!paused&&!win&&!endShown&&!document.hidden,sfx:sfxEnabled,music:musicEnabled,season:currentSeason,stage:weatherStage,water:walkingInWater(pos.x,pos.z),mounted:mountedFriend,x:pos.x,z:pos.z,grounded:mountedFriend||py<.1,dt});updateFamilyHouseReveal();if(level===6&&moon.visible){moonHalo.lookAt(camera.position);moonDisc.rotation.y=now*.00003;}skyDome.position.copy(camera.position);skyUniforms.horizon.value.copy(scene.background);skyUniforms.zenith.value.set(movie?.kind==='outro'?0x617e9e:level<=4?0x709bc9:level===5?0x171d39:0x03020b);if(weatherStage>=2)skyUniforms.zenith.value.lerp(scene.background,.65);renderer.render(scene,camera);if(!__loadFinished){__loadFinished=true;window.__gameLoaded?.()}}requestAnimationFrame(loop);

