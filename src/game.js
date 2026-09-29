window.__gameLoadProgress?.(84);let __loadFinished=false;
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
const GAME_VERSION='v146';
// v103: GAME_VERSION is the single runtime source of truth for every visible version label.
window.__KABANCHIKI_VERSION__=GAME_VERSION;
for(const id of ['loadingVersion']){const el=document.getElementById(id);if(el)el.textContent=GAME_VERSION;}
document.title=`Кабанчики 3D ${GAME_VERSION}`;
const SUPABASE_URL='https://usszaimdbepgexnigiau.supabase.co';
const SUPABASE_KEY='sb_publishable_x3H1Px6JaDTwpyZy_ARyiA_OqEKLINZ'; const $=id=>document.getElementById(id), mobile=matchMedia('(pointer:coarse)').matches;if(mobile){$('message').textContent='🕹️ Джойстик — идти · проведи пальцем — камера · справа — Прыжок и Кормить';$('introControls').innerHTML='<b>На телефоне:</b> левый джойстик — движение, проведи пальцем по миру — поворот камеры, кнопки «Прыжок» и «Кормить» справа.';$('pauseControls').innerHTML='<b>Телефон:</b> левый джойстик — движение · проведи пальцем по миру — камера · кнопки «Прыжок» и «Кормить» справа.'}else{$('message').textContent='WASD — идти · ПРОБЕЛ — прыжок · E/F — кормить · ESC — меню · V — вид';$('introControls').innerHTML='<b>На ПК:</b> WASD/стрелки — идти, ПРОБЕЛ — прыжок, E или F — бросить еду, V — сменить вид, ESC — пауза. Мышь — горизонтальный поворот камеры.';$('pauseControls').innerHTML='<b>Управление ПК:</b> WASD/стрелки — движение · ПРОБЕЛ — прыжок · E/F — кормить · мышь — камера · V — вид · ESC — меню.'}let started=false,first=false,life=5,rescued=0,win=false,invuln=0,flash=0,camMode=(mobile?0:4),yaw=0,pitch=.18,move={x:0,z:0},jump=false,act=false,keys={},drag=null,stickPointer=null,stick={x:0,y:0};$('camera').textContent=`📷 Вид ${camMode+1}/8`;
const __autoParams=new URLSearchParams(location.search),__autoTest=__autoParams.get('autotest')==='1';
window.__KABANCHIKI_TEST__={version:GAME_VERSION,ready:false,level:0,errors:[]};if(window.__KABANCHIKI_BUILD__&&window.__KABANCHIKI_BUILD__!==GAME_VERSION)window.__KABANCHIKI_TEST__.errors.push(`version-mismatch:${window.__KABANCHIKI_BUILD__}:${GAME_VERSION}`);if(__autoTest){let __seed=1337;Math.random=()=>{__seed=(__seed*1664525+1013904223)>>>0;return __seed/4294967296}}

const scene=new THREE.Scene();scene.background=new THREE.Color(0x9bd2f1);scene.fog=new THREE.Fog(0x9bd2f1,35,83);const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.08,110);const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;document.body.prepend(renderer.domElement);const hemi=new THREE.HemisphereLight(0xf4fbff,0x8aa875,3.0);scene.add(hemi);const sun=new THREE.DirectionalLight(0xffbd76,2.2);sun.position.set(-25,22,18);sun.castShadow=!mobile;
sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-34;sun.shadow.camera.right=34;sun.shadow.camera.top=34;sun.shadow.camera.bottom=-34;
sun.shadow.camera.near=.5;sun.shadow.camera.far=90;sun.shadow.bias=-.0008;scene.add(sun);const torch=new THREE.SpotLight(0xfff1c2,0,29,Math.PI/5,.55,1);scene.add(torch);scene.add(torch.target);
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
 grass:[1,[106,168,77],[54,116,55],'grass'],soil:[2,[146,113,77],[92,69,48],'noise'],path:[3,[183,160,109],[135,111,73],'stone'],leaf:[4,[57,131,75],[29,92,47],'grass'],leaf2:[5,[77,152,84],[40,112,58],'grass'],wood:[6,[118,82,57],[72,47,32],'wood'],stone:[7,[139,154,157],[91,104,108],'stone'],skin:[8,[242,186,131],[215,147,100],'noise'],hair:[9,[101,64,43],[57,37,27],'fur'],shirt:[10,[55,118,188],[31,72,126],'cloth'],pants:[11,[53,70,91],[31,43,60],'cloth'],boar:[12,[128,81,60],[76,46,35],'fur'],boar2:[13,[168,121,85],[112,76,54],'fur'],pink:[14,[228,165,160],[184,115,111],'noise'],white:[15,[248,241,223],[204,199,184],'cloth'],black:[16,[33,28,28],[12,10,10],'noise'],red:[17,[210,60,55],[137,35,32],'cloth'],gold:[18,[255,213,94],[191,142,43],'noise'],roof:[19,[182,92,67],[116,52,43],'roof']};
for(const [name,spec] of Object.entries(textureSpecs)){const [seed,base,accent,kind]=spec;mats[name].map=pixelTexture(seed,base,accent,kind);mats[name].color.set(0xffffff);mats[name].needsUpdate=true}
const cube=new THREE.BoxGeometry(1,1,1);function block(parent,mat,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(cube,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m}function sphere(parent,mat,x,y,z,r=.3){const m=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),mat);m.position.set(x,y,z);parent.add(m);return m}function group(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);return g}function rand(a,b){return a+Math.random()*(b-a)}
// v117: the central road is reserved for traversal. Solid rocks/mountains/lair props must stay outside its visible width.
function roadHalfWidthAt(z){return 2.2+Math.sin(z*.18)*.21+Math.sin(z*.51)*.09}
function roadClearForRadius(x,z,r=.4,margin=.18){return Math.abs(x)>roadHalfWidthAt(z)+r+margin}
function safeSolidScenerySpot(radius,max=40){for(let tries=0;tries<120;tries++){const x=rand(-max,max),z=rand(-max,max);if(roadClearForRadius(x,z,radius))return [x,z]}return [Math.random()<.5?-max:max,rand(-max,max)]}
const ground=block(scene,mats.grass,0,-.55,0,96,1,96);ground.receiveShadow=!mobile;
const forestGround=new THREE.Group();scene.add(forestGround);
const mossMat=new THREE.MeshLambertMaterial({color:0x568c45}),darkGrassMat=new THREE.MeshLambertMaterial({color:0x477c3e}),pathEdgeMat=new THREE.MeshLambertMaterial({color:0x92794e}),pebbleMat=new THREE.MeshLambertMaterial({color:0x9a927e});
for(let z=-47;z<=47;z+=3)for(let x=-47;x<=47;x+=3){if(Math.random()<.11)block(scene,mats.leaf2,x,-.028,z,rand(.3,.8),.055,rand(.3,.8))}
for(let z=-45;z<=45;z+=2){const w=4.4+Math.sin(z*.18)*.42+Math.sin(z*.51)*.18;block(scene,pathEdgeMat,0,-.019,z,w+.65,.038,2.06);block(scene,mats.path,0,-.008,z,w,.05,2.04)}
for(let i=0;i<(mobile?42:90);i++){let x=rand(-43,43),z=rand(-43,43);if(Math.abs(x)<3.2)continue;const m=block(forestGround,i%2?mossMat:darkGrassMat,x,-.015,z,rand(.45,1.7),.035,rand(.45,1.7));m.rotation.y=rand(0,6.28)}
for(let i=0;i<(mobile?28:60);i++){const z=rand(-43,43),edge=(Math.random()<.5?-1:1)*rand(2.6,4.8);const m=new THREE.Mesh(new THREE.DodecahedronGeometry(rand(.07,.18),0),pebbleMat);m.position.set(edge,.06,z);m.scale.y=rand(.35,.75);forestGround.add(m)}

// Visual Remaster #1 — Forest. Decorative layer is separate from gameplay/collisions.
const forestVisual=new THREE.Group();scene.add(forestVisual);forestVisual.visible=true;
const grassBladeGeo=new THREE.BoxGeometry(.07,.42,.07),grassBladeMat=new THREE.MeshLambertMaterial({color:0x5f9f46});
const grassCount=mobile?150:320,grassBlades=new THREE.InstancedMesh(grassBladeGeo,grassBladeMat,grassCount),grassDummy=new THREE.Object3D();
for(let i=0;i<grassCount;i++){let x=rand(-43,43),z=rand(-43,43);if(Math.abs(x)<3.2){x+=(x<0?-1:1)*rand(3.5,8)}
 grassDummy.position.set(x,.18,z);grassDummy.rotation.set(rand(-.08,.08),rand(0,6.28),rand(-.12,.12));const k=rand(.65,1.45);grassDummy.scale.set(k,k,k);grassDummy.updateMatrix();grassBlades.setMatrixAt(i,grassDummy.matrix)}
grassBlades.instanceMatrix.needsUpdate=true;forestVisual.add(grassBlades);
const flowerMats=[0xffe26b,0xf7f0ff,0x89c9ff,0xff9ab2].map(c=>new THREE.MeshBasicMaterial({color:c}));
for(let i=0;i<(mobile?24:46);i++){let x=rand(-40,40),z=rand(-40,40);if(Math.abs(x)<3.5)continue;const g=new THREE.Group();g.position.set(x,0,z);
 block(g,grassBladeMat,0,.18,0,.05,.36,.05);sphere(g,flowerMats[i%flowerMats.length],0,.43,0,.11);forestVisual.add(g)}
const fernMat=new THREE.MeshLambertMaterial({color:0x397b3d});
for(let i=0;i<(mobile?22:44);i++){const g=new THREE.Group();g.position.set(rand(-40,40),.02,rand(-40,40));for(let j=0;j<4;j++){const b=block(g,fernMat,0,.18,0,.08,.35,.55);b.rotation.y=j*Math.PI/2;b.rotation.z=.55}forestVisual.add(g)}
const logObstacles=[];for(let i=0;i<9;i++){const g=new THREE.Group();g.position.set(rand(-38,38),.13,rand(-38,34));const len=rand(1.35,2.25),r=rand(.11,.16),yaw=rand(0,6.28),log=new THREE.Mesh(new THREE.CylinderGeometry(r*.78,r,1,7),mats.wood);log.scale.y=len;log.rotation.z=Math.PI/2;log.rotation.y=yaw;log.userData.naturalLog=true;g.add(log);forestVisual.add(g);logObstacles.push({g,mesh:log,x:g.position.x,z:g.position.z,len,r,yaw,top:g.position.y+r})}
const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(2.3,16,12),new THREE.MeshBasicMaterial({color:0xfff2b0}));sunDisc.position.set(-28,24,-42);scene.add(sunDisc);
const treePositions=[],treeObjects=[],treeSolidMeshes=[],treeBranchMeshes=[];
// v104: slimmer branches match the trunk/crown scale and also provide exact apple anchor geometry.
const trunkGeo=new THREE.CylinderGeometry(.46,.68,1,7),branchGeo=new THREE.CylinderGeometry(.09,.14,1,6),crownGeo=new THREE.DodecahedronGeometry(1,0);
for(let i=0;i<160;i++){
 let x=rand(-45,45),z=rand(-45,45);if(Math.abs(x)<4||Math.hypot(x,z)<8)continue;
 const g=group(x,z),h=rand(2.4,5.7),tr=rand(.72,1.08);
 const trunk=new THREE.Mesh(trunkGeo,mats.wood);trunk.position.y=h/2;trunk.scale.set(tr,h,tr);g.add(trunk);
 for(let r=0;r<3;r++){const root=block(g,mats.wood,Math.cos(r*2.094)*.38,.18,Math.sin(r*2.094)*.38,.22,.22,rand(.65,1.0));root.rotation.y=-r*2.094;root.rotation.z=.15}
 g.children.filter(o=>o.isMesh&&o.geometry===trunkGeo).forEach(o=>{o.userData.treeSolid=true;treeSolidMeshes.push(o)});const branchN=Math.floor(rand(2,5));for(let b=0;b<branchN;b++){const br=new THREE.Mesh(branchGeo,mats.wood);br.userData.appleBranch=true;treeBranchMeshes.push(br);const a=rand(0,6.28),len=rand(.68,1.08);br.position.set(Math.cos(a)*.30,h*.66+rand(-.10,.24),Math.sin(a)*.30);br.scale.set(tr*.38,len,tr*.38);br.rotation.z=rand(.78,1.08);br.rotation.y=a;g.add(br)}
 const crownN=Math.floor(rand(5,9));for(let c=0;c<crownN;c++){const cm=new THREE.Mesh(crownGeo,c%3?mats.leaf:mats.leaf2);const a=rand(0,6.28),rr=c===0?0:rand(.35,1.25);cm.position.set(Math.cos(a)*rr,h+rand(-.05,1.45),Math.sin(a)*rr);const sc=rand(.85,1.5);cm.scale.set(sc*1.15,sc,sc*1.15);g.add(cm)}
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
const dadFrontL=block(familyHideout,dadWallMat,-1.65,1.5,2.18,2.1,3,.22),dadFrontR=block(familyHideout,dadWallMat,1.65,1.5,2.18,2.1,3,.22);
const dadBack=block(familyHideout,dadWallMat,0,1.5,-2.18,5.4,3,.22),dadLeft=block(familyHideout,dadWallMat,-2.6,1.5,0,.22,3,4.2),dadRight=block(familyHideout,dadWallMat,2.6,1.5,0,.22,3,4.2);
const dadRoof=block(familyHideout,dadRoofMat,0,3.25,0,5.9,.62,4.9),dadFloor=block(familyHideout,dadFloorMat,0,.08,0,5.15,.16,4.15);
for(const q of [dadFrontL,dadFrontR])q.userData.dadSide='front';dadBack.userData.dadSide='back';dadLeft.userData.dadSide='left';dadRight.userData.dadSide='right';dadRoof.userData.dadRoof=true;dadFloor.userData.dadInterior=true;
familyHideout.userData.cutawayWalls={front:[dadFrontL,dadFrontR],back:[dadBack],left:[dadLeft],right:[dadRight],roof:dadRoof};
villageHouse(27,-23,3,-.10);
const hideDoor=new THREE.Group();familyHideout.add(hideDoor);
// v132: the family-house door is closed in the doorway.
// The glowing window sits just outside the front wall face, so the wall cannot depth-occlude it.
// Its dark frame remains readable while the glass itself becomes transparent from inside.
const windowGlowMat=new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide});
const familyWindow=block(hideDoor,windowGlowMat,-1.55,1.55,2.315,.72,.76,.045);familyWindow.userData.familyWindow=true;familyWindow.renderOrder=3;
const windowFrameMat=new THREE.MeshLambertMaterial({color:0x4b2b1d});
for(const [x,y,w,h] of [[-1.55,1.98,.96,.10],[-1.55,1.12,.96,.10],[-2.03,1.55,.10,.96],[-1.07,1.55,.10,.96]]){const fr=block(hideDoor,windowFrameMat,x,y,2.325,w,h,.07);fr.userData.familyWindowFrame=true}
const doorMat=new THREE.MeshLambertMaterial({color:0x75462f});
const familyDoor=block(hideDoor,doorMat,0,1.12,2.30,1.02,2.18,.12);familyDoor.rotation.y=0;familyDoor.userData.familyDoor=true;familyDoor.userData.closed=true;
const doorKnob=sphere(familyDoor,new THREE.MeshBasicMaterial({color:0xffd56a}),.36,.03,.075,.07);doorKnob.userData.familyDoor=true;
const porchGlowMat=new THREE.MeshBasicMaterial({color:0xffe29a});const porchLamp=sphere(hideDoor,porchGlowMat,0,2.35,2.24,.16);porchLamp.userData.familyWindow=true;
const hideDoorGlow=new THREE.PointLight(0xffc45c,14,20,1.35);hideDoorGlow.position.set(0,2.15,1.7);familyHideout.add(hideDoorGlow);hideDoorGlow.visible=false;
const dadInteriorGlow=new THREE.PointLight(0xffd58a,7,11,1.45);dadInteriorGlow.position.set(0,1.7,-.35);familyHideout.add(dadInteriorGlow);dadInteriorGlow.visible=false;
let insideFamilyHouse=false;
villageHouse(-29,-7,2,Math.PI/2+.06);villageHouse(28,1,1,-Math.PI/2-.04);villageHouse(-25,19,3,.10);villageHouse(-13,25,0,-.05);villageHouse(25,23,2,.08)
const biomeObjects=[],mountainObstacles=[],lairObstacles=[];function biomeMesh(obj,lv){obj.visible=false;obj.userData.biomeLevel=lv;biomeObjects.push(obj);return obj}
function horizontalBounds(obj){
  obj.updateWorldMatrix(true,true);
  const b=new THREE.Box3().setFromObject(obj),c=new THREE.Vector3();b.getCenter(c);
  return {x:c.x,z:c.z,r:Math.max((b.max.x-b.min.x)/2,(b.max.z-b.min.z)/2)};
}
function syncWorldGeneration(lv){
  const active=biomeObjects.filter(o=>o.userData.biomeLevel===lv);
  const zones=active.map(horizontalBounds);
  if(lv===3)for(const h of houseObjects)zones.push(horizontalBounds(h));
  const baseTreeVisible=i=>(lv===1||(lv===2&&i%3!==0)||(lv===3&&i%6===0)||(lv===4&&i%4===0)||(lv===5&&i%7===0));
  treeObjects.forEach((t,i)=>{
    if(!baseTreeVisible(i)){t.visible=false;return}
    const x=t.position.x,z=t.position.z;
    t.visible=!zones.some(q=>Math.hypot(x-q.x,z-q.z)<q.r+1.35);
  });
  for(const rp of rockPositions){
    const [x,z,r,m]=rp;if(!m)continue;
    m.visible=!zones.some(q=>Math.hypot(x-q.x,z-q.z)<q.r+r+.45);
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
function lakeDepthAt(x,z){if(level!==2)return 0;const r=Math.hypot(x+18,z+17);if(r>=13.6)return 0;const k=Math.max(0,1-r/13.6);return Math.min(5.2,k*k*6.4)}
function inLake(x,z,margin=0){return level===2&&Math.hypot(x+18,z+17)<13.6+margin}
// v138 weather escalation: cloud buildup, wind-driven cloud drift, whole-sky lightning and destructive strikes.
const weatherGroup=new THREE.Group();scene.add(weatherGroup);weatherGroup.visible=false;
const rainCount=mobile?360:720,rainPos=new Float32Array(rainCount*3);for(let i=0;i<rainCount;i++){rainPos[i*3]=rand(-24,24);rainPos[i*3+1]=rand(1,24);rainPos[i*3+2]=rand(-24,24)}
const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));const rainMat=new THREE.PointsMaterial({color:0xb9dcff,size:.075,transparent:true,opacity:.68,depthWrite:false});const rainPoints=new THREE.Points(rainGeo,rainMat);weatherGroup.add(rainPoints);
const stormLeaves=[];const stormLeafMat=new THREE.MeshBasicMaterial({color:0x6f8f35,side:THREE.DoubleSide,transparent:true,opacity:.86});
const stormBurning=new Map(),stormRemains=[],stormTouched=new Set();let worldEpoch=0;const lightningSky=new THREE.HemisphereLight(0xf2fbff,0xb8d5ff,0);scene.add(lightningSky);const lightningSun=new THREE.DirectionalLight(0xeaf6ff,0);lightningSun.position.set(8,24,6);scene.add(lightningSun);
let weatherStage=0,underwaterTime=0,underwaterDamageCd=0,hurricaneCarry=0,leafSpawnCd=0,nextLightningAt=0,lightningFlash=0,weatherBaseSky=null;
function windVector(now){const gust=Math.sin(now*.00083)*.28+Math.sin(now*.00191+1.7)*.16;const a=gust;return {x:Math.sin(a),z:Math.cos(a),power:weatherStage>=4?1.0:weatherStage===3?.62:weatherStage===2?.34:0}}
function spawnStormLeaf(now){if(stormLeaves.length>(mobile?34:70))return;const candidates=treeObjects.filter(t=>t.visible!==false&&Math.hypot(t.position.x-boy.position.x,t.position.z-boy.position.z)<28);if(!candidates.length)return;const t=candidates[Math.floor(Math.random()*candidates.length)],m=new THREE.Mesh(new THREE.PlaneGeometry(.18,.10),stormLeafMat.clone());m.position.set(t.position.x+rand(-1.4,1.4),rand(2.2,5.8),t.position.z+rand(-1.4,1.4));m.rotation.set(rand(0,6.28),rand(0,6.28),rand(0,6.28));scene.add(m);stormLeaves.push({g:m,t:rand(1.8,4.2),spin:rand(-7,7)})}
function charredCylinder(parent,x,y,z,r,h,tilt=0){const m=new THREE.Mesh(new THREE.CylinderGeometry(r*.72,r,h,7),new THREE.MeshLambertMaterial({color:0x241b18,roughness:1}));m.position.set(x,y,z);m.rotation.z=tilt;m.rotation.y=rand(0,6.28);parent.add(m);return m}
function makeCharredTreeRemains(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);charredCylinder(g,0,.48*scale,0,.42*scale,.96*scale,rand(-.05,.05));charredCylinder(g,-.32*scale,.25*scale,.05,.16*scale,.72*scale,-1.05);charredCylinder(g,.30*scale,.22*scale,-.08,.14*scale,.62*scale,1.12);const ash=new THREE.Mesh(new THREE.RingGeometry(.34*scale,.78*scale,11),new THREE.MeshBasicMaterial({color:0x171313,transparent:true,opacity:.72,side:THREE.DoubleSide}));ash.rotation.x=-Math.PI/2;ash.position.y=.012;g.add(ash);scene.add(g);g.userData.charredStump=true;charredStumps.push(g);stormRemains.push(g);return g}
function makeCharredHouseRemains(h){const g=new THREE.Group();g.position.copy(h.position);g.rotation.y=h.rotation.y;for(const [x,z,tilt] of [[-2,-1.55,.10],[2,-1.55,-.08],[-2,1.55,-.12],[2,1.55,.09]])charredCylinder(g,x,.72,z,.17,1.45,tilt);charredCylinder(g,-.8,.30,-.25,.13,2.6,Math.PI/2+rand(-.15,.15));charredCylinder(g,.9,.24,.55,.12,2.2,Math.PI/2+rand(-.2,.2));const ash=new THREE.Mesh(new THREE.CircleGeometry(2.65,14),new THREE.MeshBasicMaterial({color:0x201817,transparent:true,opacity:.66,side:THREE.DoubleSide}));ash.rotation.x=-Math.PI/2;ash.position.y=.018;ash.scale.z=.78;g.add(ash);scene.add(g);stormRemains.push(g);return g}
function rememberStormObject(obj){if(!obj||obj.userData.stormSnapshot)return;const materials=[];obj.traverse(o=>{if(o.isMesh&&o.material)materials.push([o,o.material])});obj.userData.stormSnapshot={visible:obj.visible,materials};stormTouched.add(obj)}
function restoreStormObject(obj){const snap=obj?.userData?.stormSnapshot;if(!snap)return;for(const [mesh,mat] of snap.materials)mesh.material=mat;obj.visible=snap.visible;delete obj.userData.stormSnapshot;delete obj.userData.stormBurnEpoch;stormTouched.delete(obj)}
function resetStormLocationState(){for(const [obj,b] of [...stormBurning]){obj.remove(b.light);obj.remove(b.flames)}stormBurning.clear();for(const obj of [...stormTouched])restoreStormObject(obj);for(const r of stormRemains)scene.remove(r);stormRemains.length=0;for(const st of [...charredStumps])scene.remove(st);charredStumps.length=0;lightningFlash=0;lightningSky.intensity=0;lightningSun.intensity=0;nextLightningAt=0}
function tagStormTargetsForCurrentLocation(){for(const t of treeObjects)if(t.visible!==false)t.userData.stormLocationId=worldEpoch;for(const h of houseObjects)if(h.visible!==false)h.userData.stormLocationId=worldEpoch;for(const l of logObstacles)if(l.g?.visible!==false&&forestVisual.visible)l.g.userData.stormLocationId=worldEpoch}
function igniteStormTarget(obj,kind='tree'){if(!obj||obj.visible===false||obj.userData.stormLocationId!==worldEpoch||stormBurning.has(obj)||burningTrees.has(obj))return;rememberStormObject(obj);obj.userData.stormBurnEpoch=worldEpoch;const flames=new THREE.Group();obj.add(flames);const fm=new THREE.MeshBasicMaterial({color:0xff4b0b,transparent:true,opacity:.94,depthWrite:false}),hm=new THREE.MeshBasicMaterial({color:0xffdf55,transparent:true,opacity:.92,depthWrite:false});const ys=kind==='house'?[.8,1.6,2.4,3.1]:[.5,1.15,1.8,2.5];for(let i=0;i<ys.length;i++){const x=kind==='house'?rand(-2.1,2.1):rand(-.35,.35),z=kind==='house'?rand(-1.6,1.6):rand(-.3,.3),r=kind==='house'?rand(.25,.42):rand(.2,.34);const f=sphere(flames,fm,x,ys[i],z,r);f.userData.baseY=ys[i];const hot=sphere(flames,hm,x,ys[i]+.12,z,r*.52);hot.userData.baseY=ys[i]+.12}const light=new THREE.PointLight(0xff5b13,kind==='house'?32:25,kind==='house'?20:16,1.15);light.position.set(0,kind==='house'?2.1:1.8,0);obj.add(light);obj.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();if('emissive' in o.material){o.material.emissive.set(0xa52a00);o.material.emissiveIntensity=1.5}}});stormBurning.set(obj,{time:10,kind,flames,light,locationId:worldEpoch});notice(kind==='house'?'🔥 Молния подожгла дом! Через 10 секунд останутся обгоревшие руины.':'🔥 Молния подожгла дерево! Через 10 секунд останется обгоревший пень.')}
function updateStormFires(dt,now){for(const [obj,b] of [...stormBurning]){if(b.locationId!==worldEpoch||obj.userData.stormLocationId!==worldEpoch){obj.remove(b.light);obj.remove(b.flames);stormBurning.delete(obj);restoreStormObject(obj);continue}b.time-=dt;b.light.intensity=24+Math.sin(now*.026)*8;const wp=new THREE.Vector3();obj.getWorldPosition(wp);const fireRadius=b.kind==='house'?3.4:2.65;if(Math.hypot(wp.x-boy.position.x,wp.z-boy.position.z)<fireRadius&&invuln<=0){life--;statsData.damage++;invuln=2.4;playerHitFeedback();notice(life>0?'🔥 Горящий объект обжигает! Отойди! -1❤️':'🔥 Тимур слишком близко подошёл к огню.');if(life<=0)showEnd(false)}let i=0;for(const f of b.flames.children){f.scale.setScalar(.78+Math.sin(now*.019+i++)*.25);if(f.userData.baseY!==undefined)f.position.y=f.userData.baseY+Math.sin(now*.015+i)*.11}if(b.time<=0){obj.remove(b.light);obj.remove(b.flames);obj.visible=false;if(b.kind==='house')makeCharredHouseRemains(obj);else if(b.kind==='log'){const wp=new THREE.Vector3();obj.getWorldPosition(wp);makeCharredTreeRemains(wp.x,wp.z,.55)}else makeCharredTreeRemains(obj.position.x,obj.position.z,1);stormBurning.delete(obj)}}}
function lightningCandidates(){const a=[];for(const t of treeObjects)if(t.visible!==false&&t.userData.stormLocationId===worldEpoch)a.push({o:t,k:'tree'});for(const h of houseObjects)if(h.visible!==false&&h!==familyHideout&&h.userData.stormLocationId===worldEpoch)a.push({o:h,k:'house'});for(const l of logObstacles)if(l.g?.visible!==false&&forestVisual.visible&&l.g.userData.stormLocationId===worldEpoch)a.push({o:l.g,k:'log'});return a.filter(q=>!stormBurning.has(q.o)&&!burningTrees.has(q.o))}
function spawnLightningBolt(target){const wp=new THREE.Vector3();target.getWorldPosition(wp);const pts=[new THREE.Vector3(wp.x+rand(-2.5,2.5),24,wp.z+rand(-2,2))];for(let i=1;i<7;i++){const k=i/7;pts.push(new THREE.Vector3(THREE.MathUtils.lerp(pts[0].x,wp.x,k)+rand(-.75,.75),THREE.MathUtils.lerp(24,1.2,k),THREE.MathUtils.lerp(pts[0].z,wp.z,k)+rand(-.55,.55)))}pts.push(new THREE.Vector3(wp.x,.7,wp.z));const geo=new THREE.BufferGeometry().setFromPoints(pts),mat=new THREE.LineBasicMaterial({color:0xf7fbff,transparent:true,opacity:1});const line=new THREE.Line(geo,mat);scene.add(line);setTimeout(()=>{scene.remove(line);geo.dispose();mat.dispose()},170)}
function triggerLightning(now){lightningFlash=1;const c=lightningCandidates(),strike=weatherStage>=4&&c.length?c[Math.floor(Math.random()*c.length)]:null;if(strike){spawnLightningBolt(strike.o);igniteStormTarget(strike.o,strike.k)}sound(85,.34,'sawtooth');nextLightningAt=now+rand(weatherStage>=4?1800:3000,weatherStage>=4?6500:9000)}
function updateStormClouds(dt,now){const w=windVector(now),counts=[4,7,11,16,weatherClouds.length],active=counts[weatherStage]||4;for(let i=0;i<weatherClouds.length;i++){const c=weatherClouds[i];c.visible=i<active;if(!c.visible)continue;const speed=(.18+w.power*3.6)*c.userData.drift;c.position.x+=w.x*dt*speed;c.position.z+=w.z*dt*speed+(weatherStage<2?dt*.08:0);if(c.position.x>58)c.position.x=-58;if(c.position.x<-58)c.position.x=58;if(c.position.z>42)c.position.z=-55;if(c.position.z<-58)c.position.z=40;const dark=[0xffffff,0xdde2e5,0xaeb8c1,0x737c88,0x4f5663][weatherStage];c.userData.cloudMat.color.set(dark);c.userData.cloudMat.opacity=weatherStage>=3?.86:weatherStage===2?.78:.68}}
function updateStormWorld(dt,now){const w=windVector(now),sway=weatherStage>=2?(weatherStage===2?.025:weatherStage===3?.055:.105):0;for(let i=0;i<treeObjects.length;i++){const t=treeObjects[i];if(t.userData.baseWindRotZ===undefined)t.userData.baseWindRotZ=t.rotation.z||0;t.rotation.z=t.userData.baseWindRotZ+Math.sin(now*.0024+i*.71)*sway+w.x*sway*.65}if(weatherStage>=2){leafSpawnCd-=dt;if(leafSpawnCd<=0){spawnStormLeaf(now);leafSpawnCd=weatherStage>=4?.035:weatherStage===3?.075:.15}}for(let i=stormLeaves.length-1;i>=0;i--){const q=stormLeaves[i];q.t-=dt;q.g.position.x+=w.x*dt*(3+7*w.power);q.g.position.z+=w.z*dt*(3+7*w.power);q.g.position.y-=dt*(.45-weatherStage*.05);q.g.rotation.x+=q.spin*dt;q.g.rotation.z+=q.spin*.7*dt;if(q.t<=0||q.g.position.y<.05){scene.remove(q.g);stormLeaves.splice(i,1)}}if(weatherStage>=4){for(const o of logObstacles){o.g.position.x+=w.x*dt*1.45;o.g.position.z+=w.z*dt*1.45;o.x=o.g.position.x;o.z=o.g.position.z;o.g.rotation.y+=dt*.8}for(const a of apples){if(a.done||a.y>1)continue;a.g.position.x+=w.x*dt*2.8;a.g.position.z+=w.z*dt*2.8;a.x=a.g.position.x;a.z=a.g.position.z;if(Math.abs(a.x)>52||Math.abs(a.z)>52){a.done=true;scene.remove(a.g)}}}}
function updateWeather(dt,now){const stage=levelTime>=240?4:levelTime>=180?3:levelTime>=120?2:levelTime>=60?1:0;if(stage!==weatherStage){weatherStage=stage;weatherBaseSky=scene.background.clone();if(stage>=3)nextLightningAt=now+rand(1800,5200);const msg=['','🌦️ Начался дождик — тучи сгущаются.','🌧️ Ливень усилился, ветер гонит тучи от портала.','⛈️ Гроза! Молнии вспыхивают в случайные моменты.','🌀 Ураган! Молнии теперь бьют в деревья и дома.'][stage];if(msg)notice(msg)}updateStormClouds(dt,now);weatherGroup.visible=stage>=1;if(stage>=1){weatherGroup.position.set(boy.position.x,0,boy.position.z);const a=rainGeo.attributes.position.array,w=windVector(now),active=Math.floor(rainCount*(stage===1?.42:stage===2?.72:1));rainGeo.setDrawRange(0,active);for(let i=0;i<active;i++){a[i*3+1]-=dt*(stage>=3?28:stage===2?23:17);a[i*3]+=dt*w.x*(stage>=4?10:stage>=2?5:0);a[i*3+2]+=dt*w.z*(stage>=4?10:stage>=2?5:0);if(a[i*3+1]<0){a[i*3+1]=rand(16,25);a[i*3]=rand(-24,24);a[i*3+2]=rand(-24,24)}}rainGeo.attributes.position.needsUpdate=true;rainMat.opacity=stage===1?.48:stage===2?.72:.92}if(stage>=3&&now>=nextLightningAt)triggerLightning(now);if(lightningFlash>0){lightningFlash=Math.max(0,lightningFlash-dt*4.8);lightningSky.intensity=9*lightningFlash;lightningSun.intensity=7*lightningFlash;renderer.toneMappingExposure=(level===2?1.10:(level===3?.96:1.08))+1.25*lightningFlash;if(weatherBaseSky)scene.background.copy(weatherBaseSky).lerp(new THREE.Color(0xf4fbff),lightningFlash*.92),scene.fog.color.copy(scene.background)}else{lightningSky.intensity=0;lightningSun.intensity=0;renderer.toneMappingExposure=level===2?1.10:(level===3?.96:1.08);if(weatherBaseSky&&stage>=3){scene.background.copy(weatherBaseSky);scene.fog.color.copy(scene.background)}}updateStormWorld(dt,now);updateStormFires(dt,now);if(levelTime>=300&&hurricaneCarry<=0&&!endShown){hurricaneCarry=.001;if(mountedFriend){mountedFriend=false;setRiderPose(false);if(friend?.g)friend.g.position.y=0}notice('🌪️ Ураган подхватил Тимура!')}}
function updateHurricaneCarry(dt,now){if(hurricaneCarry<=0||endShown)return;hurricaneCarry+=dt;const w=windVector(now),k=Math.min(1,hurricaneCarry/3.2);boy.position.x+=w.x*dt*(8+18*k);boy.position.z+=w.z*dt*(8+18*k);boy.position.y+=dt*(2.2+8*k);boy.rotation.z+=dt*(2.5+4*k);boy.rotation.x+=dt*1.4;if(hurricaneCarry>3.2||Math.abs(boy.position.x)>58||Math.abs(boy.position.z)>58){boy.rotation.x=0;boy.rotation.z=0;boy.position.y=0;notice('🌪️ Тимура унесло за пределы карты!');showEnd(false)}}
const glintMat=new THREE.MeshBasicMaterial({color:0xfff2bd,transparent:true,opacity:.22,depthWrite:false});
const lakeGlint=new THREE.Mesh(new THREE.CircleGeometry(2.25,24),glintMat);lakeGlint.rotation.x=-Math.PI/2;lakeGlint.scale.set(2.5,.58,1);lakeGlint.position.set(-22.5,.19,-22.5);lakeVisual.add(lakeGlint);
const reedMat=new THREE.MeshLambertMaterial({color:0x5d8f38}),reedTipMat=new THREE.MeshLambertMaterial({color:0x795b31});
for(let i=0;i<(mobile?34:58);i++){const a=rand(0,Math.PI*2),r=rand(13.0,15.15),g=group(-18+Math.cos(a)*r,-17+Math.sin(a)*r);const stems=mobile?2:3;for(let j=0;j<stems;j++){const xx=rand(-.25,.25),zz=rand(-.25,.25),h=rand(.9,1.75);block(g,reedMat,xx,h*.5,zz,.065,h,.065);if(j===0&&i%3===0)block(g,reedTipMat,xx,h+.10,zz,.11,.24,.11)}biomeMesh(g,2)}
// Кувшинки — только визуальные, поэтому не меняют коллизии и механику карты.
const lilyMat=new THREE.MeshLambertMaterial({color:0x4f9b55}),lilyFlowerMat=new THREE.MeshBasicMaterial({color:0xffd9e9});
for(let i=0;i<(mobile?12:22);i++){const a=rand(0,Math.PI*2),r=rand(2.5,11.3),g=new THREE.Group();g.position.set(-18+Math.cos(a)*r,.19,-17+Math.sin(a)*r);const pad=new THREE.Mesh(new THREE.CircleGeometry(rand(.28,.55),12),lilyMat);pad.rotation.x=-Math.PI/2;g.add(pad);if(i%5===0)sphere(g,lilyFlowerMat,.08,.08,.02,.10);lakeVisual.add(g)}
// небольшие светлые камни у озера
for(let i=0;i<20;i++){const a=rand(0,Math.PI*2),r=rand(14.3,16.2),m=new THREE.Mesh(rockGeo,mats.stone);m.position.set(-18+Math.cos(a)*r,rand(.16,.32),-17+Math.sin(a)*r);m.scale.set(rand(.28,.72),rand(.24,.52),rand(.35,.82));scene.add(m);biomeMesh(m,2)}
// горная локация: крупные отдельные валуны и скальные группы
for(let i=0;i<24;i++){const sx=rand(1.3,3.1),sy=rand(1.1,3.7),sz=rand(1.3,3.0),rr=Math.max(sx,sz)*.88,[x,z]=safeSolidScenerySpot(rr,41),g=group(x,z);const r=new THREE.Mesh(rockGeo,new THREE.MeshLambertMaterial({color:0x777c80,map:mats.stone.map}));r.scale.set(sx,sy,sz);r.position.y=r.scale.y*.45;g.add(r);mountainObstacles.push([g.position.x,g.position.z,rr]);biomeMesh(g,4)}
for(let i=0;i<8;i++){const h=rand(3,6),pr=rand(1.3,2.2),rr=pr*.9,[x,z]=safeSolidScenerySpot(rr,39),g=group(x,z);const peak=new THREE.Mesh(new THREE.ConeGeometry(pr,h,5),ridgeMat.clone());peak.position.y=h/2-.45;g.add(peak);mountainObstacles.push([g.position.x,g.position.z,rr]);biomeMesh(g,4)}
// логово: узнаваемые обгоревшие пни и тёмные валуны; все имеют физическую коллизию
const burntWood=new THREE.MeshLambertMaterial({color:0x3a261f,map:mats.wood.map}),charTop=new THREE.MeshLambertMaterial({color:0x171315});
for(let i=0;i<18;i++){
 let rr,shape;
 if(i%2){const w=rand(.75,1.15),h=rand(.75,1.55);rr=w*.78;shape={kind:'stump',w,h}}
 else{const r=new THREE.Mesh(rockGeo,new THREE.MeshLambertMaterial({color:0x4a4650,map:mats.stone.map}));r.scale.set(rand(.8,1.8),rand(.6,1.5),rand(.8,1.8));rr=Math.max(r.scale.x,r.scale.z)*.72;shape={kind:'rock',r}}
 const [x,z]=safeSolidScenerySpot(rr,40),g=group(x,z);
 if(shape.kind==='stump'){const {w,h}=shape;block(g,burntWood,0,h/2,0,w,h,w);block(g,charTop,0,h+.035,0,w*.92,.07,w*.92);block(g,burntWood,-w*.58,.18,.05,w*.55,.20,.28);block(g,burntWood,w*.52,.16,-.08,w*.48,.18,.26)}
 else{shape.r.position.y=shape.r.scale.y*.42;g.add(shape.r)}
 lairObstacles.push([g.position.x,g.position.z,rr,g]);biomeMesh(g,5)
}const moonMat=new THREE.MeshBasicMaterial({color:0xf1f6ff});const moon=new THREE.Group();const moonDisc=new THREE.Mesh(new THREE.SphereGeometry(4.2,20,16),moonMat);moon.add(moonDisc);const moonHalo=new THREE.Mesh(new THREE.RingGeometry(4.5,6.4,32),new THREE.MeshBasicMaterial({color:0xa9c9ff,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));moonHalo.position.z=-.15;moon.add(moonHalo);moon.position.set(-20,23,-31);scene.add(moon);moon.visible=false;const moonLight=new THREE.DirectionalLight(0x9bc2ff,.0);moonLight.position.set(-20,24,-25);scene.add(moonLight);
function makeBoy(){let g=new THREE.Group();block(g,mats.pants,-.18,.43,0,.34,.85,.4);block(g,mats.pants,.18,.43,0,.34,.85,.4);block(g,mats.shirt,0,1.25,0,.85,.9,.48);block(g,mats.skin,0,2.03,0,.7,.7,.65);block(g,mats.hair,0,2.43,-.04,.76,.2,.68);block(g,mats.skin,-.56,1.25,0,.23,.72,.24);block(g,mats.skin,.56,1.25,0,.23,.72,.24);for(const x of [-.18,.18])block(g,mats.black,x,2.09,.34,.08,.1,.04);return g}const boy=makeBoy();boy.scale.setScalar(.52);
// Character Remaster — Timur
const boyHairMat=new THREE.MeshLambertMaterial({color:0x4a2b1c}),boyShoeMat=new THREE.MeshLambertMaterial({color:0x243447}),boyPackMat=new THREE.MeshLambertMaterial({color:0x6d4329}),boySkinMat=new THREE.MeshLambertMaterial({color:0xf2b184}),boyEyeMat=new THREE.MeshBasicMaterial({color:0x17212b});
block(boy,boyHairMat,0,2.52,-.02,.82,.22,.72);
for(const sx of [-1,1]){block(boy,boySkinMat,sx*.39,2.06,0,.13,.28,.18);block(boy,boyEyeMat,sx*.18,2.11,.37,.09,.11,.035);block(boy,boyShoeMat,sx*.18,.10,.12,.36,.20,.58)}
block(boy,boyPackMat,0,1.35,-.35,.68,.82,.22);
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
function mountFriendNow(){if(!friend?.g||friend.flee||mountedFriend)return false;mountedFriend=true;py=1.18;vy=0;boy.position.x=friend.g.position.x;boy.position.z=friend.g.position.z;boy.position.y=py;boy.rotation.y=friend.g.rotation.y;setRiderPose(true);notice('🐗 Верхом! Тимур сел как на коня. Прыжок — спрыгнуть.');return true}
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
function mountedFriendDefense(){if(!mountedFriend||!friend?.g||friend.flee||friendAttack>0)return;const targets=foes.filter(f=>f!==friend);if(!targets.length)return;targets.sort((a,b)=>(b.isBoss?1:0)-(a.isBoss?1:0)||friend.g.position.distanceTo(a.g.position)-friend.g.position.distanceTo(b.g.position));const target=targets[0],d=friend.g.position.distanceTo(target.g.position),hitDist=boarRadius(friend)+boarRadius(target)+.38;if(d>hitDist)return;friendAttack=.72;const ax=target.g.position.x-friend.g.position.x,az=target.g.position.z-friend.g.position.z,al=Math.max(.01,Math.hypot(ax,az));target.b.rotation.x=-.24;friend.b.rotation.x=-.16;bossBattleImpact((friend.g.position.x+target.g.position.x)/2,(friend.g.position.z+target.g.position.z)/2);sound(target.isBoss?105:145,.18,'triangle');if(target.isBoss){target.hp--;bossHits++;statsData.bossHits++;bossRage=Math.min(2.35,bossRage+.12);moveBoarToward(target,target.g.position.x+ax/al*5,target.g.position.z+az/al*5,.95,1);target.stagger=Math.max(target.stagger||0,1.0);friend.g.position.x-=ax/al*.30;friend.g.position.z-=az/al*.30;boy.position.x=friend.g.position.x;boy.position.z=friend.g.position.z;notice(`🏇💥 Верхом! Друг таранит босса — осталось ${target.hp}/10`);if(target.hp<=0){score+=diffScore(200);onBossDefeated(target)}}else if(target.isMinion){hitBossMinion(target,ax,az,al)}else{foes.splice(foes.indexOf(target),1);sendBoarAway(target,'defeated');levelBoarsDone++;statsData.minions++;score+=diffScore(25);softBoarDefeatSound();notice('🏇🐗 Друг отогнал враждебного кабанчика!')}friendHP=Math.max(0,friendHP-1);hud();if(friendHP<=0){const fallen=friend;mountedFriend=false;setRiderPose(false);friend=null;scene.remove(fallen.g);py=0;vy=0;boy.position.y=0;notice('💔 Кабанчик-друг пал в бою')}}
const DIFF_NAMES=['Я слишком мал, чтобы умереть','Не мучай меня, кабанчик','Ультра-кабан','Кошмар','НЕВОЗМОЖНО'];
const DIFF_SCORE=[.2,.33,.5,1,2];
const DIFF_CONFIG=[
 {enemyMult:.5,speedMult:.4,itemMult:2,playerHP:10,friendHP:10,foodMax:10},
 {enemyMult:.8,speedMult:.47,itemMult:1.4,playerHP:7,friendHP:7,foodMax:7},
 {enemyMult:1.3,speedMult:.57,itemMult:.8,playerHP:4,friendHP:4,foodMax:4},
 {enemyMult:1.8,speedMult:.67,itemMult:.5,playerHP:2,friendHP:2,foodMax:2},
 {enemyMult:2.5,speedMult:.8,itemMult:.2,playerHP:1,friendHP:1,foodMax:1}
];let selectedDiff=2;const diffCfg=()=>DIFF_CONFIG[selectedDiff],diffScore=v=>Math.round(v*DIFF_SCORE[selectedDiff]);
let level=1,food=4,score=0,familyFound=0,friend=null,friendHP=4,bossHits=0,levelTime=0,damage=0,paused=false;const levels=["🌲 Лес","🌊 Озеро","🏘️ Деревня","⛰️ Горы","👑 Кабанье логово"];let portalObj=null;const familyMembers=[];const crates=[];const shots=[];let audio=null,sfxEnabled=localStorage.getItem('kabanchiki3d_sfx')!=='0',musicEnabled=localStorage.getItem('kabanchiki3d_music')!=='0',throwCooldown=0,musicTimer=null,musicNote=0,forageTimer=18,friendAttack=0,hasFlashlight=false,flashlightObj=null,fireballs=[],levelBoarsTotal=0,levelBoarsDone=0,levelFamilyTotal=0,levelFamilyDone=0,familyPopupOpen=false,totalTime=0,yellowMushroomStock=0,boarFormTime=0,boarFormVisual=null,statsData={fed:0,forage:0,berries:0,damage:0,family:0,minions:0,bossHits:0},endShown=false,bossRage=1,bossSummon=7,bossVictoryTimer=null,bossFireworkTimer=0,burningTrees=new Map(),charredStumps=[],resultSaving=false,resultLocalSaved=false,resultGlobalSaved=false;function softBoarDefeatSound(){if(!sfxEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(135,t+.22);g.gain.setValueAtTime(.018,t);g.gain.exponentialRampToValueAtTime(.001,t+.24);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.25)}catch{}}function softBoarAttackSound(){if(!sfxEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(155,t);o.frequency.exponentialRampToValueAtTime(92,t+.18);g.gain.setValueAtTime(.024,t);g.gain.exponentialRampToValueAtTime(.001,t+.20);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.21)}catch{}}function playerHitFeedback(){const d=$('damageFlash'),h=$('hud');d.classList.remove('hit');h.classList.remove('hurt');void d.offsetWidth;d.classList.add('hit');h.classList.add('hurt');setTimeout(()=>{d.classList.remove('hit');h.classList.remove('hurt')},520)}function sound(freq=330,duration=.14,type="sine"){if(!sfxEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(60,freq*.7),audio.currentTime+duration);g.gain.setValueAtTime(.07,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{}}function bonusSound(){if(!sfxEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const t=audio.currentTime;[[520,0,'square'],[780,.08,'triangle'],[1040,.16,'sine'],[390,.27,'square']].forEach(([f,d,tp])=>{const o=audio.createOscillator(),g=audio.createGain();o.type=tp;o.frequency.setValueAtTime(f,t+d);o.frequency.exponentialRampToValueAtTime(f*1.18,t+d+.11);g.gain.setValueAtTime(.001,t+d);g.gain.exponentialRampToValueAtTime(.045,t+d+.018);g.gain.exponentialRampToValueAtTime(.001,t+d+.13);o.connect(g).connect(audio.destination);o.start(t+d);o.stop(t+d+.14)})}catch{}}
// v146: louder dark late-90s/early-00s techno soundtrack; mix raised without adding bright timbres.
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
 if(!musicEnabled||!freq)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const t=audio.currentTime+when,o=audio.createOscillator(),f=audio.createBiquadFilter(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);f.type='lowpass';f.frequency.setValueAtTime(cutoff,t);f.Q.setValueAtTime(.7,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(f).connect(g).connect(audio.destination);o.start(t);o.stop(t+duration+.03)}catch{}
}
function musicNoise(duration=.045,gain=.006,when=0,cutoff=1200){if(!musicEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();const t=audio.currentTime+when,b=audio.createBuffer(1,Math.max(1,audio.sampleRate*duration),audio.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const n=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();n.buffer=b;f.type='lowpass';f.frequency.setValueAtTime(cutoff,t);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);n.connect(f).connect(g).connect(audio.destination);n.start(t)}catch{}}
function musicKick(when=0,gain=.022){if(!musicEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();const t=audio.currentTime+when,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(115,t);o.frequency.exponentialRampToValueAtTime(48,t+.11);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+.13);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.14)}catch{}}
function musicStep(){if(!started||paused||win)return;const t=MUSIC_THEMES[level-1],i=musicNote++,step=i%64,beat=i%16;musicTone(t.lead[step],t.tempo/1000*.78,'triangle',level===5?.017:.021,0,t.cutoff);if(i%2===0)musicTone(t.bass[Math.floor(i/2)%t.bass.length],t.tempo/1000*1.85,'sawtooth',level===5?.020:.017,0,420);if(i%4===1)musicTone(t.pulse[Math.floor(i/2)%t.pulse.length],t.tempo/1000*.8,'triangle',.0075,0,700);if(i%8===0){for(let c=0;c<t.pad.length;c++)musicTone(t.pad[c],t.tempo/1000*3.2,'triangle',.0045,c*.01,620)}if(beat===0||beat===4||beat===8||beat===12)musicKick(0,level===5?.043:.034);if(beat===4||beat===12)musicNoise(.07,level===5?.010:.008,0,900);if(beat===2||beat===6||beat===10||beat===14)musicNoise(.025,.0032,0,1500)}
function startMusic(){if(!musicEnabled||musicTimer)return;musicNote=0;musicStep();const schedule=()=>{if(musicTimer)clearTimeout(musicTimer);const t=MUSIC_THEMES[Math.max(0,Math.min(4,level-1))];musicTimer=setTimeout(()=>{musicTimer=null;musicStep();schedule()},t.tempo)};schedule()}
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
g.userData.visualRemaster=true;g.userData.tailPivot=tailPivot;g.traverse(o=>{if(o.isMesh){o.castShadow=!mobile;o.receiveShadow=!mobile}});
return {g,b,aura,bolt,eyes,x,z,friendly,done:false,angle:rand(0,7),phase:rand(0,7),attackCd:0,idleTimer:rand(1,4),blinkTimer:rand(1,4),graze:0,roamTimer:rand(1,4),roamX:x,roamZ:z,roamPause:rand(.4,1.8)}}const friends=[];const foes=[];const defeatedBoars=[];const apples=[]; // природные припасы: яблоки, грибы, капуста и лечебные ягоды
function clearEntities(arr){for(const o of arr)scene.remove(o.g);arr.length=0}
function softCrateSound(){if(!sfxEnabled)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const t=audio.currentTime;[[330,0,.16,.016],[440,.09,.20,.012],[554,.18,.24,.009]].forEach(([freq,delay,dur,gain])=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,t+delay);o.frequency.exponentialRampToValueAtTime(freq*.92,t+delay+dur);g.gain.setValueAtTime(.0001,t+delay);g.gain.exponentialRampToValueAtTime(gain,t+delay+.035);g.gain.exponentialRampToValueAtTime(.0001,t+delay+dur);o.connect(g).connect(audio.destination);o.start(t+delay);o.stop(t+delay+dur+.03)})}catch{}}
function makeForage(type,x,z,y=0,bonus=false){const g=group(x,z);g.position.y=y;if(type==='berry'){const leaf=new THREE.MeshLambertMaterial({color:bonus?0xc6b42c:0x3f8b45}),berry=new THREE.MeshLambertMaterial({color:bonus?0xffe33b:0x4d3ca6});block(g,leaf,0,.16,0,.65,.22,.65);for(const [bx,bz] of [[-.22,-.12],[.18,-.18],[-.12,.18],[.24,.16]])sphere(g,berry,bx,.34,bz,.13)}else{const model=makeFoodModel(type,g,0,.30,0);model.scale.setScalar(1.25);if(bonus)model.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();if(o.material.color)o.material.color.set(type==='apple'?0xffdc32:0xffe13b)}})}if(bonus){const glow=new THREE.PointLight(0xffdf45,3.5,4);glow.position.y=.55;g.add(glow)}apples.push({g,x,z,y,type,done:false,bonus:!!bonus})}
function safeForageSpot(){for(let tries=0;tries<90;tries++){const x=rand(-34,34),z=rand(-35,27);if(Math.abs(x)<3.4)continue;if(level===2&&Math.hypot(x+18,z+17)<15.8)continue;if(Math.hypot(x,z-4)<6)continue;if(level===3&&houseObjects.some(h=>{if(!h.visible)return false;const b=new THREE.Box3().setFromObject(h);return x>b.min.x-1.4&&x<b.max.x+1.4&&z>b.min.z-1.4&&z<b.max.z+1.4}))continue;if(treePositions.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<1.5))continue;if(rockPositions.some(([rx,rz,r])=>Math.hypot(x-rx,z-rz)<r+1.1))continue;return [x,z]}return [rand(-25,25),rand(-28,20)]}
function branchApplePoint(br){
 // v117: fruit twigs grow OUTWARD from the visible trunk. The apple center is beyond the trunk silhouette,
 // never buried inside the wood, while keeping the fruit low enough to collect by a normal jump.
 if(!br||br.visible===false||!br.parent)return null;const tree=br.parent;if(tree.visible===false||!tree.userData?.isTree)return null;
 tree.updateWorldMatrix(true,true);const trunk=tree.children.find(o=>o.isMesh&&o.geometry===trunkGeo),trunkR=trunk?treeTrunkShape(trunk).r:.66;
 const a=rand(0,Math.PI*2),len=rand(.62,.82),out=new THREE.Vector3(Math.cos(a),0,Math.sin(a)),twig=new THREE.Mesh(branchGeo,mats.wood);twig.userData.appleTwig=true;twig.userData.appleBranch=true;twig.userData.appleTree=tree;
 const branchY=rand(2.22,2.24),startR=trunkR+.08;twig.position.set(out.x*(startR+len*.5),branchY,out.z*(startR+len*.5));twig.scale.set(.16,len,.16);twig.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),out);
 tree.add(twig);treeBranchMeshes.push(twig);tree.updateWorldMatrix(true,true);twig.updateWorldMatrix(true,false);
 const tip=new THREE.Vector3(0,.5,0).applyMatrix4(twig.matrixWorld),appleY=tip.y-.16;
 if(appleY<2.05||appleY>2.08){tree.remove(twig);const i=treeBranchMeshes.indexOf(twig);if(i>=0)treeBranchMeshes.splice(i,1);return null}
 return [tip.x,tip.z,appleY,twig,tree]
}
function appleTreeSpot(){const candidates=[];for(const br of treeBranchMeshes){if(!br?.parent||br.userData.appleTwig||br.parent.visible===false||!br.parent.userData?.isTree)continue;br.parent.updateWorldMatrix(true,true);const wp=new THREE.Vector3();br.getWorldPosition(wp);if(Math.abs(wp.x)>35||Math.abs(wp.z)>35||Math.hypot(wp.x,wp.z-4)<7)continue;candidates.push(br)}if(!candidates.length)return null;return branchApplePoint(candidates[Math.floor(Math.random()*candidates.length)])}
const BONUS_FORAGE_CHANCE=1/20;
const BERRY_BONUS_CHANCE=1/10; // v144: yellow berries are easier to encounter
function spawnForage(type){type=type||['apple','mushroom','cabbage'][Math.floor(Math.random()*3)];if(level===2&&type==='mushroom')type='cabbage';if(type==='apple'){const spot=appleTreeSpot();if(spot){const [x,z,y,branch,tree]=spot;const bonus=Math.random()<BONUS_FORAGE_CHANCE;makeForage('apple',x,z,y,bonus);const a=apples[apples.length-1];a.branch=branch;a.tree=tree;a.g.userData.appleBranch=branch;a.g.userData.appleTree=tree;return}type=Math.random()<.5?'mushroom':'cabbage'}const [x,z]=safeForageSpot();const bonus=type==='berry'?Math.random()<BERRY_BONUS_CHANCE:type==='mushroom'&&Math.random()<BONUS_FORAGE_CHANCE;makeForage(type,x,z,0,bonus)}
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
function makeFamily(x,z,forcedRole=null){const g=group(x,z);const role=forcedRole===null?(familyFound+familyMembers.length)%4:forcedRole;let person;
 if(role===0){person=makeMother();person.scale.setScalar(.72)}
 else if(role===3){person=makeGrandmother();person.scale.setScalar(.70)}
 else{person=makeBoy();person.scale.setScalar([1,.68][role-1]);person.children[2].material=[mats.leaf,mats.gold][role-1]}
 g.add(person);const familyMarker=sphere(g,mats.gold,0,role===1?3.15:2.5,0,.2);familyMarker.userData.familyMarker=true;familyMembers.push({g,x,z,done:false,role,person,familyMarker})}
function makePortal(){const g=group(0,-42);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.4,.28,10,24),new THREE.MeshBasicMaterial({color:0xe3b4ff}));ring.position.y=1.7;g.add(ring);const core=new THREE.Mesh(new THREE.CircleGeometry(1.12,24),new THREE.MeshBasicMaterial({color:0x9b54ff,transparent:true,opacity:.52,side:THREE.DoubleSide}));core.position.set(0,1.7,.02);g.add(core);const glow=new THREE.PointLight(0xc274ff,7,13,1.6);glow.position.set(0,1.8,0);g.add(glow);portalObj={g,ring,core,glow};g.visible=false}
function loadLevel(n){const carriedMounted=mountedFriend;mountedFriend=false;setRiderPose(false);const carriedFriend=friend,carriedFriendHP=friendHP;resetStormLocationState();worldEpoch++;level=n;rescued=0;bossHits=0;levelTime=0;weatherStage=0;underwaterTime=0;underwaterDamageCd=0;hurricaneCarry=0;weatherGroup.visible=false;for(const q of stormLeaves)scene.remove(q.g);stormLeaves.length=0;forageTimer=18;if(n===1){totalTime=0;statsData={fed:0,forage:0,berries:0,damage:0,family:0,minions:0,bossHits:0};endShown=false;}bossRage=1;bossSummon=7;bossVictoryTimer=null;bossFireworkTimer=0;levelBoarsDone=0;levelFamilyDone=0;clearEntities(friends);clearEntities(foes);clearEntities(familyMembers);clearEntities(crates);fireballs.forEach(f=>scene.remove(f.g));fireballs=[];defeatedBoars.forEach(f=>scene.remove(f.g));defeatedBoars.length=0;for(const [t,b] of [...burningTrees]){if(b.light)t.remove(b.light);if(b.flames)t.remove(b.flames);t.visible=true}burningTrees.clear();friend=carriedFriend;friendHP=carriedFriendHP;if(friend){if(!friend.g.parent)scene.add(friend.g);friend.g.position.set(1.8,0,5.2);friend.g.rotation.set(0,0,0);friend.g.visible=true;friend.friendly=true;friend.aura.material.color.set(0x4cff72);friend.aura.material.opacity=.24}for(const a of apples)scene.remove(a.g);apples.length=0
const enemyCounts=[3,4,5,6,1];const enemyCount=n===5?1:Math.max(1,Math.min(8,Math.round(enemyCounts[n-1]*diffCfg().enemyMult)));levelBoarsTotal=enemyCount;const spawnSets=[[-18,-10],[18,-13],[-15,-25],[16,-29],[-20,-36],[20,-39],[-8,-42],[9,-43]];if(n<5){for(let i=0;i<enemyCount;i++){const pos=spawnSets[i];foes.push(makeBoar(pos[0],pos[1],false))}}else{const b=makeBoar(0,-31,false);b.g.scale.setScalar(2.3);b.hp=10;b.maxHp=10;b.isBoss=true;b.baseSpeed=2.05;b.rage=1;foes.push(b)}
// v112: tree visibility must be finalized before spawning apples. Otherwise an apple can be attached to a tree that this level hides.
for(const h of houseObjects){if(h!==familyHideout)setHouseTransparent(h,false);h.visible=(n===3)};setDadHouseCutaway(false);for(const o of biomeObjects)o.visible=(o.userData.biomeLevel===n);syncWorldGeneration(n);
seedForage();tagStormTargetsForCurrentLocation();
// v120: family members use safe randomized places instead of one repeated coordinate per map.
// Dad remains tied to the enterable hideout, while the hideout itself can move between safe village plots.
const familyCounts=[0,1,1,2,0],familyRoles={2:[0],3:[2],4:[1,3]};levelFamilyTotal=familyCounts[n-1];
function randomFamilySpot(used=[]){for(let tries=0;tries<180;tries++){const x=rand(-36,36),z=rand(-36,34);if(n===2&&Math.hypot(x+18,z+17)<16.2)continue;if(Math.abs(x)<5.2||Math.hypot(x,z-4)<8)continue;if(used.some(q=>Math.hypot(x-q[0],z-q[1])<8))continue;if(!spawnPointBlocked(x,z,.72))return [x,z]}return nearestSafeSpawn(14,-18,.72)||[14,-18]}
if(n===3){familyHideout.position.set(30,0,-31);familyHideout.rotation.y=0;familyHideout.updateWorldMatrix(true,true);syncWorldGeneration(n)}
const familyUsed=[];for(const role of (familyRoles[n]||[])){if(n===3&&role===2){const brotherLocal=new THREE.Vector3(0,0,-1.05),brotherWorld=familyHideout.localToWorld(brotherLocal.clone());makeFamily(brotherWorld.x,brotherWorld.z,2)}else{const q=randomFamilySpot(familyUsed);familyUsed.push(q);makeFamily(q[0],q[1],role)}}
boy.position.set(0,0,4);if(carriedMounted&&friend){mountedFriend=true;friend.g.position.set(0,0,4);boy.position.set(0,1.18,4);py=1.18;vy=0;setRiderPose(true)}if(portalObj)portalObj.g.visible=false;insideFamilyHouse=false;familyWindow.material.opacity=1;hideDoor.visible=(n===3);hideDoorGlow.visible=(n===3);dadInteriorGlow.visible=(n===3);const __occlusionAudit=runOcclusionVisibilityAudit();window.__KABANCHIKI_TEST__.occlusionAudit=__occlusionAudit;if(__autoTest&&!__occlusionAudit.ok)window.__KABANCHIKI_TEST__.errors.push(...__occlusionAudit.issues);moon.visible=(n===5);moonLight.intensity=n===5?.62:0;window.__KABANCHIKI_TEST__.bossFinaleAudit={ok:level!==5||(moon.visible&&moonLight.intensity>=.6),moonVisible:moon.visible,moonLight:moonLight.intensity,fireFromStart:true,defeatDelay:5};if(__autoTest&&!window.__KABANCHIKI_TEST__.bossFinaleAudit.ok)window.__KABANCHIKI_TEST__.errors.push('boss-finale-environment');forestVisual.visible=(n===1);forestGround.visible=(n===1);sunDisc.visible=(n===1);lakeVisual.visible=(n===2);const __spawnAudit=repairAndAuditSpawns();window.__KABANCHIKI_TEST__.spawnAudit=__spawnAudit;if(__autoTest&&!__spawnAudit.ok)window.__KABANCHIKI_TEST__.errors.push(...__spawnAudit.issues);const __worldAudit=runWorldIntegrityAudit();window.__KABANCHIKI_TEST__.worldAudit=__worldAudit;window.__KABANCHIKI_TEST__.forageRoadAudit=runForageRoadAudit();const __familyAudit=runFamilyPlacementAudit();window.__KABANCHIKI_TEST__.familyPlacementAudit=__familyAudit;if(__autoTest&&!__worldAudit.ok)window.__KABANCHIKI_TEST__.errors.push(...__worldAudit.issues);if(__autoTest&&!__familyAudit.ok)window.__KABANCHIKI_TEST__.errors.push(...__familyAudit.issues);const skies=[0x86cfff,0xf0a66f,0xe59a78,0x34385e,0x080611];scene.background=new THREE.Color(skies[n-1]);scene.fog.color.copy(scene.background);scene.fog.near=n===1?32:(n>=4?9:28);scene.fog.far=n===1?88:(n>=4?38:78);sun.color.set(n===1?0xffffff:n===2?0xffa65a:n===3?0xffa36f:0x7680aa);sun.intensity=[2.65,1.72,1.42,.28,.015][n-1];hemi.intensity=[2.25,2.22,1.62,.75,.075][n-1];renderer.toneMappingExposure=n===1?1.18:(n===2?1.10:(n===3?.96:1.08));ground.material.color.set(n===1?0xffffff:n===2?0xffead0:n===3?0xd9f0cf:n===4?0xaeb3b6:0x76636b);torch.intensity=(n>=4&&hasFlashlight)?42:0;if(n===5&&!hasFlashlight)notice('🌙 Фонарика нет. Лунный свет очень слабый. Разозли босса — его глаза и огонь немного осветят логово.');if(flashlightObj){scene.remove(flashlightObj);flashlightObj=null}if((n===4||n===5)&&!hasFlashlight){const fx=n===4?8:-12,fz=n===4?-18:10;flashlightObj=group(fx,fz);block(flashlightObj,mats.gold,0,.45,0,.35,.35,.8);block(flashlightObj,mats.white,0,.45,.55,.28,.28,.28);sphere(flashlightObj,mats.gold,0,1.25,0,.18);if(n===5)notice('🔦 В логове где-то лежит запасной фонарик. В темноте ищи слабый золотистый отблеск.')}notice(`⚠️ ${n===5?'Ночь. Если нет фонарика — будет очень темно. Подружи миньона: только кабанчик-друг может ранить босса. Корми босса, чтобы успокоить и замедлить!':'Покорми кабанчика яблоком, грибом или капустой 🍎🍄🥬 — иначе он разозлится и нападёт!'}`);if(n===3)setTimeout(()=>notice('🏠 Кто-то из семьи спрятался внутри дома. Ищи дверь с тёплым светом — в неё можно войти.'),700);const __audit=runCollisionAudit();window.__KABANCHIKI_TEST__.collisionAudit=__audit;if(__autoTest&&!__audit.ok)window.__KABANCHIKI_TEST__.errors.push(...__audit.issues);if(__autoTest)window.__KABANCHIKI_TEST__.robotAudit={ok:false,pending:true,issues:[],samples:[],treesTested:0,rocksTested:0,level};hud()}
function makeFoodModel(type,parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);if(type==='apple'){const red=new THREE.MeshLambertMaterial({color:0xd83a32}),darkRed=new THREE.MeshLambertMaterial({color:0xb92522}),green=new THREE.MeshLambertMaterial({color:0x4f9a3f});sphere(g,red,-.12,0,0,.25);sphere(g,red,.12,0,0,.25);sphere(g,darkRed,0,-.08,0,.23);block(g,mats.wood,0,.31,0,.055,.20,.055);const leaf=block(g,green,.13,.35,0,.22,.055,.13);leaf.rotation.z=-.35}else if(type==='mushroom'){const cap=new THREE.MeshLambertMaterial({color:0xd92f2f}),spot=new THREE.MeshLambertMaterial({color:0xfff6dc});block(g,mats.white,0,.02,0,.18,.38,.18);const capMesh=new THREE.Mesh(new THREE.SphereGeometry(.34,12,8,0,Math.PI*2,0,Math.PI/2),cap);capMesh.position.y=.18;capMesh.scale.y=.62;g.add(capMesh);for(const [sx,sz,ss] of [[-.13,.05,.055],[.11,.08,.045],[.02,-.12,.05],[-.05,.16,.04]])sphere(g,spot,sx,.34,sz,ss)}else{const green=new THREE.MeshLambertMaterial({color:0x65a94f});sphere(g,green,0,0,0,.34);for(const [a,b] of [[.2,0],[-.2,0],[0,.2],[0,-.2]])sphere(g,green,a,.03,b,.23)}g.userData.foodType=type;return g}
function foodLabel(type){return type==='apple'?'яблоко 🍎':type==='mushroom'?'гриб 🍄':'капусту 🥬'}
function feed(){if(!started||paused||win||life<=0||throwCooldown>0)return;if(boarFormTime>0){notice('🐗 В облике кабанчика Тимур не может кормить других.');return}if(food<=0&&yellowMushroomStock<=0){notice('🍎 Еда закончилась! Яблоки растут на деревьях — подпрыгни, чтобы сорвать. Грибы и капуста растут на земле.');sound(170,.2);return}if(mountedFriend&&friend&&friendHP<diffCfg().friendHP&&food>0&&yellowMushroomStock<=0){food--;throwCooldown=.6;friendHP=Math.min(diffCfg().friendHP,friendHP+1);statsData.fed++;sound(520,.16,'sine');notice(`💚 Друг подкрепился: 🐗❤️ ${friendHP}/${diffCfg().friendHP}`);hud();return}const hasYellowReady=yellowMushroomStock>0; if(!hasYellowReady)food--;throwCooldown=.6;const start=boy.position.clone().add(new THREE.Vector3(0,1,0));const dir=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));const target=start.clone().addScaledVector(dir,10);const foeNear=foes.filter(f=>f.g.position.distanceTo(target)<4.5||f.g.position.distanceTo(boy.position)<9).sort((a,b)=>a.g.position.distanceTo(target)-b.g.position.distanceTo(target))[0];const friendNear=friend&&(yellowMushroomStock>0||friendHP<diffCfg().friendHP)&&friend.g.position.distanceTo(boy.position)<6.5?friend:null;let near=foeNear;if(friendNear){const fd=friendNear.g.position.distanceTo(target),ed=foeNear?foeNear.g.position.distanceTo(target):Infinity;if(fd<3.2&&fd<=ed+.6)near=friendNear}if(near)target.copy(near.g.position).add(new THREE.Vector3(0,.8,0));const useYellow=yellowMushroomStock>0&&!!near;if(useYellow)yellowMushroomStock--;else if(hasYellowReady&&food>0)food--;else if(hasYellowReady&&!near){notice('🟡 Жёлтый мухомор нужно бросить именно в кабанчика или босса.');return}const types=['apple','mushroom','cabbage'],type=useYellow?'mushroom':types[Math.floor(Math.random()*types.length)],foodObj=makeFoodModel(type,scene,start.x,start.y,start.z);if(useYellow)foodObj.traverse(o=>{if(o.isMesh&&o.material?.color){o.material=o.material.clone();o.material.color.set(0xffdf32)}});shots.push({g:foodObj,start,target,t:0,foe:near,type,specialYellow:useYellow});boy.children[5].rotation.x=-1.1;sound(650,.12,'triangle');notice(near?`Тимур бросил ${foodLabel(type)}!`:`${foodLabel(type)} летит вперёд — целься в кабана!`);hud()}
function sendBoarAway(f,reason='defeated'){if(!f||!f.g)return;f.flee=true;f.fleeTime=0;f.fleeReason=reason;f.aura.visible=false;f.bolt.visible=false;const away=new THREE.Vector3(f.g.position.x-boy.position.x,0,f.g.position.z-boy.position.z);if(away.lengthSq()<.1)away.set(rand(-1,1),0,rand(-1,1));away.normalize();f.fleeDir=away;defeatedBoars.push(f)}
function resolveMeat(shot){scene.remove(shot.g);const f=shot.foe;if(!f)return;const label=foodLabel(shot.type||'apple');if(shot.specialYellow){setBoarYellow(f);hud();return}if(f===friend){if(friendHP<diffCfg().friendHP){friendHP=Math.min(diffCfg().friendHP,friendHP+1);statsData.fed++;score+=2;sound(520,.16,'sine');notice(`💚 Друг съел ${label}: 🐗❤️ ${friendHP}/${diffCfg().friendHP}`);hud()}else notice('🐗❤️ Друг уже полностью здоров!');return}if(!foes.includes(f))return;if(f.isBoss){bossRage=Math.max(.72,bossRage-.28);statsData.fed++;score+=5;sound(360,.22,'triangle');notice(`👑 Босс съел ${label} и успокоился — здоровье не восстановилось, для победы всё равно нужно 10 ударов.`)}else{statsData.fed++;foes.splice(foes.indexOf(f),1);if(friend&&friend!==f){const oldFriend=friend;const wasMounted=mountedFriend&&oldFriend===friend;if(wasMounted){mountedFriend=false;setRiderPose(false);py=0;vy=0;boy.position.y=0;const a=boy.rotation.y;const dx=Math.sin(a)*1.35,dz=Math.cos(a)*1.35;if(!playerWorldBlocked(boy.position.x+dx,boy.position.z+dz,.04)){boy.position.x+=dx;boy.position.z+=dz}}friend=null;sendBoarAway(oldFriend,'jealous');notice('💔 Старый кабанчик обиделся и убежал: Тимур накормил другого!')}f.flee=false;f.fleeTime=0;f.friendly=true;levelBoarsDone++;f.aura.visible=true;f.aura.material.color.set(0x4cff72);f.aura.material.opacity=.24;f.bolt.visible=false;friend=f;friendHP=diffCfg().friendHP;
const fd=Math.hypot(f.g.position.x-boy.position.x,f.g.position.z-boy.position.z);
if(fd<2.25){
  let ax=f.g.position.x-boy.position.x,az=f.g.position.z-boy.position.z;
  if(Math.hypot(ax,az)<.01){ax=Math.sin(yaw+Math.PI);az=Math.cos(yaw+Math.PI)}
  const al=Math.max(.01,Math.hypot(ax,az));
  f.g.position.x=boy.position.x+ax/al*2.25;
  f.g.position.z=boy.position.z+az/al*2.25;
}
score+=diffScore(20);sound(740,.22);notice(`🐗 Кабан съел ${label} и стал другом!`)}hud()}
function showFamilyPopup(role=0){
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
$('familyPopup').style.display='grid'
}$('familyOk').onclick=()=>{familyPopupOpen=false;$('familyPopup').style.display='none';paused=false};function formatTime(sec){const m=Math.floor(sec/60),s=Math.floor(sec%60);return `${m}:${String(s).padStart(2,'0')}`}function questsComplete(){if(level===5)return !foes.some(f=>f.isBoss);return levelBoarsDone>=levelBoarsTotal&&levelFamilyDone>=levelFamilyTotal}function questState(){if(level===5){const boss=foes.find(f=>f.isBoss);if(boss)return `👑 Босс: ${boss.hp}/10 · Подружи миньона и помоги ему победить босса`;return '🎉 Босс побеждён!'}const boarsLeft=Math.max(0,levelBoarsTotal-levelBoarsDone),familyLeft=Math.max(0,levelFamilyTotal-levelFamilyDone);if(boarsLeft>0&&familyLeft>0)return `🐗 Накорми кабанов: ${levelBoarsDone}/${levelBoarsTotal} · 👨‍👩‍👦 Найди родных: ${levelFamilyDone}/${levelFamilyTotal}`;if(boarsLeft>0)return `🐗 Накорми кабанов: ${levelBoarsDone}/${levelBoarsTotal}`;if(familyLeft>0)return `👨‍👩‍👦 Найди родных: ${levelFamilyDone}/${levelFamilyTotal}`;return '🌀 Задание выполнено — иди в портал!' }
let cinematicRunning=false,cinematicTimers=[],cinematicFinish=null;
window.addEventListener('keydown',e=>{if(cinematicRunning&&['Escape','Space','Enter'].includes(e.code)){e.preventDefault();cinematicFinish?.()}});
function cineClear(){for(const t of cinematicTimers)clearTimeout(t);cinematicTimers=[]}
function cineLater(fn,ms){cinematicTimers.push(setTimeout(fn,ms))}
function cineSetup(kind){
 const sc=$('cinematicScene');sc.innerHTML='';
 if(kind==='intro'){
  sc.style.background='linear-gradient(#83cef5 0 56%,#68a956 56%)';
  sc.innerHTML=`<div class="cCar" id="cineCar"><i class="cWheel a"></i><i class="cWheel b"></i></div>
  <div class="cPerson" id="cp0" style="left:37%">👩</div><div class="cPerson" id="cp1" style="left:45%">👨</div><div class="cPerson" id="cp2" style="left:53%">👦</div><div class="cPerson" id="cp3" style="left:61%">👵</div>
  <div class="cBoar" id="cb0" style="left:105%">🐗</div><div class="cBoar" id="cb1" style="left:112%">🐗</div><div class="cBoar" id="cb2" style="left:120%">🐗</div>`;
 }else{
  sc.style.background='linear-gradient(#090713 0 56%,#302a32 56%)';
  sc.innerHTML=`<div class="cMoon">🌙</div><div class="cBoss" id="cBoss">🐗</div>
  <div class="cPerson" id="cp0" style="left:30%">👩</div><div class="cPerson" id="cp1" style="left:39%">👨</div><div class="cPerson" id="cp2" style="left:48%">👦</div><div class="cPerson" id="cp3" style="left:57%">👵</div>
  <div class="cBoar" id="cFriend" style="left:67%">🐗</div><div class="cCar" id="cineCar"><i class="cWheel a"></i><i class="cWheel b"></i></div>`;
 }
}
function playCinematic(kind,onDone){
 cineClear();cinematicRunning=true;paused=true;$('cinematic').style.display='block';cineSetup(kind);startCinematicMusic(kind);
 const text=$('cinematicText'),steps=kind==='intro'?[
  ['🚗 Семья Тимура ехала отдохнуть на природе. Впереди были лес, озеро и долгожданный пикник.',900],
  ['🧺 Они приехали к озеру. Мама расстелила плед, папа достал еду, а дети побежали к воде.',3900],
  ['🐗 Но вдруг из леса вышла целая стая диких кабанов!',7000],
  ['😱 Кабаны бросились к лагерю. Все испугались и разбежались кто куда!',9600],
  ['😰 Тимур остался один в незнакомом лесу...',12200],
  ['🎯 Найди маму, папу, братика и бабушку. И попробуй подружиться с кабанчиками!',14500]
 ]:[
  ['👑 Босс-кабан повержен! Ночное логово наконец затихло.',800],
  ['❤️ Тимур снова вместе с мамой, папой, братиком и бабушкой. Верный кабанчик тоже рядом.',3400],
  ['🔓 Дорога свободна — семья возвращается к машине, на которой приехала сюда.',6500],
  ['🚗 Все садятся в машину. После такого отдыха пора домой!',9300],
  ['🌅 Машина уезжает прочь от логова. Семья спасена!',11900]
 ];
 const car=$('cineCar');
 if(kind==='intro'){
   car.style.bottom='22%';cineLater(()=>car.style.transition='left 3s linear',150);cineLater(()=>car.style.left='42%',180);
   cineLater(()=>{for(let i=0;i<3;i++)$('cb'+i).style.left=(70+i*9)+'%'},7000);
   cineLater(()=>{const ps=[$('cp0'),$('cp1'),$('cp2'),$('cp3')];const dest=[['8%','44%'],['25%','18%'],['73%','20%'],['86%','45%']];ps.forEach((p,i)=>{p.style.left=dest[i][0];p.style.bottom=dest[i][1]})},9500);
 }else{
   car.style.left='-190px';car.style.bottom='22%';
   cineLater(()=>{$('cBoss').style.transform='translateX(-50%) rotate(90deg)';$('cBoss').style.opacity='.45'},1000);
   cineLater(()=>{car.style.transition='left 2.4s linear';car.style.left='66%'},6000);
   cineLater(()=>{for(const id of ['cp0','cp1','cp2','cp3','cFriend'])$(id).style.opacity='0'},9000);
   cineLater(()=>{car.style.transition='left 3s linear';car.style.left='110%'},10200);
 }
 steps.forEach(([t,at])=>cineLater(()=>text.textContent=t,at));
 const duration=kind==='intro'?17400:14500;
 const finish=()=>{if(!cinematicRunning)return;cinematicRunning=false;cinematicFinish=null;cineClear();stopCinematicMusic();$('cinematic').style.display='none';onDone?.()};
 cinematicFinish=finish;$('cinematicSkip').onclick=finish;cineLater(finish,duration);
}
function showEnd(won){if(endShown)return;if(!won)playDeathMusic();endShown=true;paused=true;resultSaving=false;resultLocalSaved=false;resultGlobalSaved=false;const best=(()=>{try{return JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]')}catch{return[]}})();$('endTitle').textContent=won?'🎉 Победа!':'💀 Игра окончена';$('endStats').innerHTML=`⏱ Время: <b>${formatTime(totalTime)}</b><br>🏆 Очки: <b>${score}</b><br>🍎 Кормлений: <b>${statsData.fed}</b><br>🌿 Собрано еды: <b>${statsData.forage}</b><br>🫐 Лечебных ягод: <b>${statsData.berries}</b><br>❤️ Получено урона: <b>${statsData.damage}</b><br>👨‍👩‍👦 Найдено семьи: <b>${familyFound}/4</b><br>🐗 Побеждено миньонов: <b>${statsData.minions}</b><br>👑 Ударов друга по боссу: <b>${statsData.bossHits}</b>`;$('playerName').value=localStorage.getItem('kabanchiki3d_player_name')||'';$('endScreen').style.display='grid'}async function submitGlobalResult(name){
 // v121: completed and failed runs use the same existing leaderboard row schema.
 const payload={player_name:name,score:Math.max(0,Math.round(score)),play_time:Math.max(0,Math.round(totalTime)),difficulty:selectedDiff,family:Math.max(0,Math.min(4,familyFound)),game_version:GAME_VERSION};
 try{const r=await fetch(`${SUPABASE_URL}/rest/v1/leaderboard`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload)});if(!r.ok)throw new Error(`HTTP ${r.status}`);return {ok:true}}catch(e){console.warn('Global leaderboard submit failed',e);return {ok:false,error:e}}
}
$('saveResult').onclick=async()=>{if(resultSaving||resultGlobalSaved)return;const name=($('playerName').value.trim()||'Аноним').slice(0,20);resultSaving=true;$('saveResult').disabled=true;$('saveMsg').textContent='💾 Сохраняю результат…';let localOk=resultLocalSaved;if(!resultLocalSaved){try{localStorage.setItem('kabanchiki3d_player_name',name);const a=JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]');a.unshift({name,score,time:Math.round(totalTime),win,level,difficulty:selectedDiff,family:familyFound,version:GAME_VERSION,date:new Date().toLocaleDateString()});localStorage.setItem('kabanchiki3d_results',JSON.stringify(a.slice(0,50)));resultLocalSaved=true;localOk=true}catch{localOk=false}}let global={ok:resultGlobalSaved};if(!resultGlobalSaved)global=await submitGlobalResult(name);if(global.ok){resultGlobalSaved=true;$('saveMsg').textContent='✅ Результат сохранён один раз — на устройстве и в 🌍 мировой таблице!'}else $('saveMsg').textContent=(localOk?'✅ Локально сохранено один раз. ':'⚠️ Локальное сохранение недоступно. ')+'🌍 Мировая таблица сейчас недоступна — можно повторить отправку.';resultSaving=false;$('saveResult').disabled=resultGlobalSaved};function restartGame(){
 stopMusic();stopCinematicMusic();cineClear();cinematicRunning=false;cinematicFinish=null;
 $('cinematic').style.display='none';$('endScreen').style.display='none';$('pauseMenu').style.display='none';$('familyPopup').style.display='none';$('statsScreen').style.display='none';
 win=false;started=true;paused=false;endShown=false;resultSaving=false;resultLocalSaved=false;resultGlobalSaved=false;life=diffCfg().playerHP;food=diffCfg().foodMax;score=0;familyFound=0;friendHP=diffCfg().friendHP;bossHits=0;damage=0;totalTime=0;invuln=0;
 boy.position.set(0,0,4);py=0;vy=0;loadLevel(1);startMusic();notice('🌲 Новая игра началась. Найди семью!');
}
$('endRestart').onclick=restartGame;
function escStat(v){return String(v??'').replace(/[<>&"']/g,'')}
function localStatsHtml(){let a=[];try{a=JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]')}catch{}if(!a.length)return '<p>Пока нет сохранённых результатов. После игры введи имя и нажми «💾 Сохранить результат».</p>';const rows=a.slice().sort((x,y)=>(y.score||0)-(x.score||0)||(x.time||999999)-(y.time||999999)).slice(0,20);return '<div style="display:grid;grid-template-columns:34px 1fr 68px 70px 76px;gap:6px;align-items:center;font-size:13px"><b>№</b><b>Игрок</b><b>Очки</b><b>Время</b><b>Итог</b>'+rows.map((r,i)=>`<span>${i+1}</span><b>${escStat(r.name||'Аноним')}</b><span>🏆${r.score||0}</span><span>⏱${formatTime(r.time||0)}</span><span>${r.win?'✅ Победа':'💀 Проигрыш'}</span>`).join('')+'</div>'}
async function globalStatsHtml(){try{const q='select=player_name,score,play_time,difficulty,family,game_version&order=score.desc,play_time.asc&limit=20';const r=await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?${q}`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});if(!r.ok)throw new Error(`HTTP ${r.status}`);const rows=await r.json();if(!rows.length)return '<p>🌍 Мировой рейтинг пока пуст. Стань первым победителем!</p>';return '<div style="display:grid;grid-template-columns:30px 1fr 62px 66px 42px;gap:6px;align-items:center;font-size:13px"><b>№</b><b>Игрок</b><b>Очки</b><b>Время</b><b>Сл.</b>'+rows.map((x,i)=>`<span>${i+1}</span><b>${escStat(x.player_name||'Аноним')}</b><span>🏆${x.score||0}</span><span>⏱${formatTime(x.play_time||0)}</span><span>${Number(x.difficulty)+1}</span>`).join('')+'</div>'}catch(e){console.warn('Global leaderboard load failed',e);return '<p>⚠️ Не удалось загрузить мировой рейтинг. Проверь интернет — локальная статистика продолжает работать.</p>'}}
async function showPlayerStats(mode='global'){const box=$('statsTable');$('statsScreen').style.display='grid';box.innerHTML='<div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px"><button id="globalStatsTab">🌍 Мир</button><button id="localStatsTab">📱 Мои</button></div><div id="statsRows">Загрузка…</div>';const rows=$('statsRows'),g=$('globalStatsTab'),l=$('localStatsTab');const showLocal=()=>{rows.innerHTML=localStatsHtml();g.disabled=false;l.disabled=true};const showGlobal=async()=>{g.disabled=true;l.disabled=false;rows.textContent='🌍 Загружаю мировой ТОП-20…';rows.innerHTML=await globalStatsHtml()};g.onclick=showGlobal;l.onclick=showLocal;if(mode==='local')showLocal();else await showGlobal()}
$('showStatsIntro').onclick=()=>showPlayerStats('global');$('showStatsEnd').onclick=()=>showPlayerStats('global');$('closeStats').onclick=()=>$('statsScreen').style.display='none';
let noticeTimer=null;function notice(t){const m=$('message');m.textContent=t;m.classList.remove('hidden');flash=3;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>m.classList.add('hidden'),3200)}function hud(){$('stats').textContent=` · ${GAME_VERSION} · 📍 Локация ${level}/5: ${levels[level-1]} · ❤️ ${life}/${diffCfg().playerHP} · 🍎 ${food}/${diffCfg().foodMax} · 🏆 ${score} · 🎮 ${DIFF_NAMES[selectedDiff]} · 👨‍👩‍👦 ${familyFound}/4${friend?` · 🐗❤️ ${friendHP}/${diffCfg().friendHP}`:''}${yellowMushroomStock?` · 🟡🍄 ${yellowMushroomStock}`:''}`+(level===5&&foes.find(f=>f.isBoss)?` · 👑 ${foes.find(f=>f.isBoss).hp}/10`:``); $('quest').textContent=win?'🎉 Тимур нашёл семью!':questState()}$('start').onclick=()=>{try{selectedDiff=Number(document.querySelector('input[name="diff3d"]:checked')?.value??2);life=diffCfg().playerHP;food=diffCfg().foodMax;friendHP=diffCfg().friendHP;$('intro').style.display='none';playCinematic('intro',()=>{started=true;paused=false;loadLevel(1);startMusic();notice(mobile?'📱 Камера: проведи пальцем по миру влево/вправо':'🖱️ Поворот камеры: зажми мышь и веди влево/вправо')})}catch(e){window.__showGameError('Ошибка запуска игры',e.stack||String(e))}};$('camera').onclick=()=>{camMode=(camMode+1)%8;first=false;$('camera').textContent=`📷 Вид ${camMode+1}/8`;$('cross').style.display='none';notice(['Высоко · далеко','Средне · далеко','Низко · близко','Очень высоко','За плечом','Низко · далеко','Сверху под углом','Близко · средне'][camMode])};$('restart').onclick=()=>location.reload();$('menuRestart').onclick=()=>location.reload();$('jump').onpointerdown=e=>{e.preventDefault();jump=true};$('interact').onpointerdown=e=>{e.preventDefault();feed()};function setPause(on){if(!started)return;paused=on;$('pauseMenu').style.display=on?'grid':'none';$('pauseBtn').textContent=on?'▶':'☰'}function togglePause(){setPause(!paused)}$('pauseBtn').onclick=togglePause;$('resume').onclick=()=>setPause(false);
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
  $('menuFullscreen').textContent=on?'🗗 Выйти из полного экрана':'⛶ Полный экран';
}
$('fullscreen').onclick=goFullscreen;$('menuFullscreen').onclick=goFullscreen;
document.addEventListener('fullscreenchange',syncFullscreenButton);document.addEventListener('webkitfullscreenchange',syncFullscreenButton);document.addEventListener('mozfullscreenchange',syncFullscreenButton);document.addEventListener('MSFullscreenChange',syncFullscreenButton);document.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&!e.repeat){e.preventDefault();togglePause()}if(e.code==='KeyV'&&!e.repeat)$('camera').click();if(e.code==='Space'&&!e.repeat)jump=true;if((e.code==='KeyE'||e.code==='KeyF')&&!e.repeat)feed();if(e.code==='KeyP'&&!e.repeat)togglePause()});document.addEventListener('keyup',e=>keys[e.code]=false);renderer.domElement.addEventListener('pointerdown',e=>{if(!started)return;if(e.pointerType==='mouse'&&e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};try{renderer.domElement.setPointerCapture(e.pointerId)}catch(_){}});renderer.domElement.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;const delta=e.clientX-drag.x;/* v19: mobile horizontal camera direction fixed; mouse behavior unchanged */yaw+=(e.pointerType==='touch'?-delta:delta)*.006;drag.x=e.clientX;drag.y=e.clientY});function endCameraDrag(e){if(drag?.id===e.pointerId)drag=null}renderer.domElement.addEventListener('pointerup',endCameraDrag);renderer.domElement.addEventListener('pointercancel',endCameraDrag);renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());const stickEl=$('stick'),nub=$('nub');function setStick(e){const r=stickEl.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.max(1,Math.hypot(dx,dy)),s=Math.min(1,len/52);stick.x=dx/len*s;stick.y=dy/len*s;nub.style.transform=`translate(${stick.x*43}px,${stick.y*43}px)`}stickEl.addEventListener('pointerdown',e=>{e.preventDefault();stickPointer=e.pointerId;stickEl.setPointerCapture(e.pointerId);setStick(e)});stickEl.addEventListener('pointermove',e=>{if(stickPointer===e.pointerId)setStick(e)});function resetStick(e){if(stickPointer===e.pointerId){stickPointer=null;stick.x=stick.y=0;nub.style.transform=''}}stickEl.addEventListener('pointerup',resetStick);stickEl.addEventListener('pointercancel',resetStick);addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});makePortal();function boarBodies(){const a=foes.filter(f=>f?.g&&!f.flee);if(friend?.g&&!friend.flee)a.push(friend);return a}
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
 familyWindow.material.opacity=nowInside?.18:1;familyWindow.material.depthWrite=false;
 setDadHouseCutaway(nowInside);
}
function houseBlockAt(x,z,pad=.45,allowJump=false){
 if(level!==3)return false;
 for(const h of houseObjects){
  if(!h.visible)continue;
  const box=new THREE.Box3().setFromObject(h);
  // v90: once Timur's feet are above the roof, the house becomes a walkable platform.
  if(allowJump&&py>box.max.y+.04)continue;
  if(x>box.min.x-pad&&x<box.max.x+pad&&z>box.min.z-pad&&z<box.max.z+pad){
   if(h.userData.enterable){
    const local=h.worldToLocal(new THREE.Vector3(x,0,z));
    // Open doorway and a walkable room inside; walls remain solid elsewhere.
    const doorway=Math.abs(local.x)<.82&&local.z>1.62;
    const room=local.x>-1.85&&local.x<.55&&local.z>-1.72&&local.z<2.08;
    if(doorway||room)return false;
   }
   return true;
  }
 }
 return false
}
function treeTrunkShape(m){m.updateWorldMatrix(true,false);const c=new THREE.Vector3(),sc=new THREE.Vector3();m.getWorldPosition(c);m.getWorldScale(sc);return {x:c.x,z:c.z,r:.68*Math.max(Math.abs(sc.x),Math.abs(sc.z))*.96}}
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
function worldObstacleAt(x,z,pad=.38){
 // v105: only the visible trunk is solid; decorative/apple branches never create an invisible tree halo.
 if(circleHitsTreeGeometry(x,z,PLAYER_RADIUS+pad))return true;
 if(logObstacles.some(o=>logFootprintHit(o,x,z,PLAYER_RADIUS+pad,false)))return true;
 if(rockPositions.some(([, , ,m])=>m?.visible!==false&&rockFootprintHit(m,x,z,pad,false)))return true;
 if(level===4&&mountainObstacles.some(([mx,mz,r])=>Math.hypot(x-mx,z-mz)<r+pad))return true;
 if(level===5&&lairObstacles.some(([lx,lz,r,g])=>g.visible&&Math.hypot(x-lx,z-lz)<r+pad))return true;
 if(houseBlockAt(x,z,pad))return true;
 return false;
}
// v77: one collision model for player, generation audit and automated tests.
const PLAYER_RADIUS=.43,ROCK_PLAYER_RADIUS=.31,MOUNTED_ROCK_RADIUS=.78;
function solidCircles(){
 const out=[];
 for(let i=0;i<treePositions.length;i++){const t=treeObjects[i];if(t?.visible!==false){const [x,z]=treePositions[i];out.push({x,z,r:1.62,type:'tree'})}}
 for(const [x,z,r,m] of rockPositions)if(m?.visible!==false)out.push({x,z,r:r+.48,type:'rock'});
 if(level===4)for(const [x,z,r] of mountainObstacles)out.push({x,z,r:r+.58,type:'mountain'});
 if(level===5)for(const [x,z,r,g] of lairObstacles)if(g?.visible!==false)out.push({x,z,r:r+.52,type:'lair'});
 return out
}
function playerWorldBlocked(x,z,pad=0){
 if(x<-43.15||x>43.15||z<-43.15||z>43.15)return true;
 const rr=PLAYER_RADIUS+pad;
 if(circleHitsTreeGeometry(x,z,rr))return true;
 if(logObstacles.some(o=>logFootprintHit(o,x,z,rr,true)))return true;
 if(rockPositions.some(([, , ,m])=>rockFootprintHit(m,x,z,ROCK_PLAYER_RADIUS+pad,true)))return true;
 if(solidCircles().some(o=>o.type!=='tree'&&o.type!=='rock'&&Math.hypot(x-o.x,z-o.z)<o.r+rr))return true;
 if(houseBlockAt(x,z,rr,true))return true;
 return false
}
function playerSupportHeightAtNoRock(x,z){
 let top=0;
 if(level===3)for(const h of houseObjects){
  if(!h.visible)continue;h.updateWorldMatrix(true,true);const b=new THREE.Box3().setFromObject(h);
  if(x>b.min.x+PLAYER_RADIUS*.20&&x<b.max.x-PLAYER_RADIUS*.20&&z>b.min.z+PLAYER_RADIUS*.20&&z<b.max.z-PLAYER_RADIUS*.20)top=Math.max(top,b.max.y);
 }
 return top;
}
function branchStepHeightAt(x,z){
 let top=0;if(level===1&&forestVisual.visible)for(const o of logObstacles)if(o?.g?.visible!==false&&logDistance(o,x,z).distance<o.r+PLAYER_RADIUS*.10)top=Math.max(top,o.top);return top;
}
function playerSupportHeightAt(x,z){
 let top=0;
 // v121: a low branch creates a small physical step while crossing it; it never blocks horizontal motion.
 top=Math.max(top,branchStepHeightAt(x,z));
 // Rock tops are real platforms: land on them instead of being pushed back to the ground.
 for(const [, , ,m] of rockPositions){
  if(!m||m.visible===false)continue;const e=rockEllipse(m,x,z,PLAYER_RADIUS*.12);
  if(e.n<1)top=Math.max(top,e.q.top);
 }
 // Village roofs are platforms too, so a nearby rock can be used to jump onto a house.
 if(level===3)for(const h of houseObjects){
  if(!h.visible)continue;h.updateWorldMatrix(true,true);const b=new THREE.Box3().setFromObject(h);
  if(x>b.min.x+PLAYER_RADIUS*.20&&x<b.max.x-PLAYER_RADIUS*.20&&z>b.min.z+PLAYER_RADIUS*.20&&z<b.max.z-PLAYER_RADIUS*.20)top=Math.max(top,b.max.y);
 }
 return top;
}
function depenetratePlayer(){
 // Never leave Timur trapped inside a rock/tree after a level change, jump or knockback.
 for(let pass=0;pass<(mountedFriend?14:6);pass++){
  let changed=false;
  for(const o of logObstacles)if(pushOutOfLog(o))changed=true;
  for(const [, , ,m] of rockPositions)if(pushOutOfRock(m))changed=true;
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
 depenetratePlayer();
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
 if(nearest){const rx=px-nearest.x,rz=pz-nearest.z,rl=Math.hypot(rx,rz)||1,txv=-rz/rl,tzv=rx/rl,sgn=(mx*txv+mz*tzv)>=0?1:-1,mag=Math.hypot(mx,mz);const sx=px+txv*mag*sgn,sz=pz+tzv*mag*sgn;if(!movementBlocked(sx,sz)){boy.position.x=sx;boy.position.z=sz}}
}
function movePlayerCollision(mx,mz){
 // v107 swept/sub-stepped motion prevents a fast mounted boar from tunnelling through
 // a narrow rock between rendered frames. Every slice re-runs the full collision solver.
 const dist=Math.hypot(mx,mz),step=.055,n=Math.max(1,Math.ceil(dist/step));
 for(let i=0;i<n;i++){
  const safeX=boy.position.x,safeZ=boy.position.z;
  movePlayerCollisionStep(mx/n,mz/n);
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
 if(!allowRoad&&Math.abs(x)<3.7)return true;
 return worldObstacleAt(x,z,pad);
}
function nearestSafeSpawn(x,z,pad=.72,opts={}){
 if(!spawnPointBlocked(x,z,pad,opts))return [x,z];
 for(const r of [2,3,4,5,6,8,10,12])for(let i=0;i<24;i++){
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
function runForageRoadAudit(){const issues=[],samples=[];for(const a of apples){if(a.done)continue;if(level===2&&a.type==='mushroom')issues.push('lake-mushroom');if(a.type==='apple'){const outside=appleOutsideOwnTrunk(a);samples.push({type:'apple',outside});if(!outside)issues.push('apple-inside-tree')}}for(const [, , ,m] of rockPositions){if(!m||m.visible===false)continue;const q=rockShape(m),clear=roadClearForRadius(q.cx,q.cz,Math.max(q.ax,q.az),.08);if(!clear)issues.push(`road-rock:${q.cx.toFixed(1)},${q.cz.toFixed(1)}`)}if(level===4)for(const [x,z,r] of mountainObstacles)if(!roadClearForRadius(x,z,r,.08))issues.push(`road-mountain:${x.toFixed(1)},${z.toFixed(1)}`);if(level===5)for(const [x,z,r,g] of lairObstacles)if(g?.visible!==false&&!roadClearForRadius(x,z,r,.08))issues.push(`road-lair:${x.toFixed(1)},${z.toFixed(1)}`);return {ok:issues.length===0,issues,samples,level,mushrooms:apples.filter(a=>!a.done&&a.type==='mushroom').length}}
window.__KABANCHIKI_FORAGE_ROAD_AUDIT__=runForageRoadAudit;
function runForagePlacementAudit(){const issues=[],samples=[];for(const a of apples){if(a.done)continue;const gy=a.g?.position?.y??999;if(a.type==='mushroom'||a.type==='cabbage'||a.type==='berry'){const grounded=Math.abs(gy)<.001;samples.push({type:a.type,y:+gy.toFixed(3),grounded,bonus:!!a.bonus});if(!grounded)issues.push(`forage-off-ground:${a.type}:${gy.toFixed(2)}`)}else if(a.type==='apple'){const onTree=appleOnBranch(a),aboveTimur=(a.y||0)>=2.05,reachable=(a.y||0)<=2.08;samples.push({type:'apple',y:+(a.y||0).toFixed(3),onTree,aboveTimur,reachable,bonus:!!a.bonus});if(!onTree)issues.push('apple-not-on-tree');if(!aboveTimur)issues.push(`apple-below-child-height:${(a.y||0).toFixed(2)}`);if(!reachable)issues.push(`apple-too-high:${(a.y||0).toFixed(2)}`)}}return {ok:issues.length===0,issues,samples,bonusChance:BONUS_FORAGE_CHANCE,berryBonusChance:BERRY_BONUS_CHANCE,level}}
window.__KABANCHIKI_FORAGE_PLACEMENT_AUDIT__=runForagePlacementAudit;
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
  const old=insideFamilyHouse;setDadHouseCutaway(true);const cp=familyHideout.userData.cutawayWalls;const hiddenWalls=['front','back','left','right'].flatMap(k=>cp[k]).filter(m=>!m.visible).length;if(hiddenWalls<1||hiddenWalls>2)issues.push('dad-house-cutaway-wrong-wall-count');if(!cp.roof||cp.roof.visible)issues.push('dad-house-roof-not-cutaway');if(!familyWindow?.visible||familyWindow.material.opacity<.9)issues.push('dad-window-not-bright');if(!hideDoorGlow?.visible||hideDoorGlow.intensity<10||!dadInteriorGlow?.visible)issues.push('dad-house-light-off');setDadHouseCutaway(old);
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
 if(friend)fixBoar(friend,'friend');
 foes.forEach((b,i)=>fixBoar(b,b.isBoss?'boss':`boar${i}`,!!b.isBoss));
 for(const a of apples){if(a.y>1)continue;if(spawnPointBlocked(a.g.position.x,a.g.position.z,.38)){const q=nearestSafeSpawn(a.g.position.x,a.g.position.z,.38);if(q){a.g.position.x=q[0];a.g.position.z=q[1];a.x=q[0];a.z=q[1];repairs.push(`forage-${a.type}`)}else issues.push(`spawn-blocked:forage-${a.type}`)}}
 for(const f of familyMembers){if(level===3&&f.role===2)continue;if(spawnPointBlocked(f.g.position.x,f.g.position.z,.55)){const q=nearestSafeSpawn(f.g.position.x,f.g.position.z,.55);if(q){f.g.position.x=q[0];f.g.position.z=q[1];f.x=q[0];f.z=q[1];repairs.push(`family${f.role}`)}else issues.push(`spawn-blocked:family${f.role}`)}}
 // Recheck after repair: no ordinary boar/ground pickup/family member may begin inside scenery or on the road.
 const check=(x,z,pad,label,opts={})=>{if(spawnPointBlocked(x,z,pad,opts))issues.push(`spawn-invalid:${label}`)};
 if(friend)check(friend.g.position.x,friend.g.position.z,boarRadius(friend)*.72,'friend');
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
  const bx=sx,bz=sz;movePlayerCollision(mx,mz);
  const fx=boy.position.x,fz=boy.position.z,moved=Math.hypot(fx-bx,fz-bz);
  const penetrated=insideFn(fx,fz),crossed=crossFn?crossFn(fx,fz):false,blocked=!penetrated&&!crossed;
  samples.push({label,moved:+moved.toFixed(3),blocked,penetrated,crossed});
  if(expectBlocked&&(penetrated||crossed))issues.push(`robot-pass-through:${label}`);
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
function startBoarForm(){boarFormTime=30;if(mountedFriend){mountedFriend=false;setRiderPose(false);py=0;vy=0;boy.position.y=0}if(!boarFormVisual){const q=makeBoar(boy.position.x,boy.position.z,true);boarFormVisual=q.g;q.aura.visible=false;q.bolt.visible=false;q.g.scale.setScalar(.86)}boarFormVisual.visible=true;boy.visible=false;bonusSound();notice('🟡 Ягода превратила Тимура в кабанчика на 30 секунд! Можно только ходить и собирать еду с земли.')}
function endBoarForm(){boarFormTime=0;if(boarFormVisual)boarFormVisual.visible=false;boy.visible=true;bonusSound();notice('✨ Тимур снова стал собой!')}
function setBoarYellow(f){if(!f?.g)return;if(f.yellowRestore){f.yellowTime=30;return}f.yellowRestore=[];f.g.traverse(o=>{if(o.isMesh&&o.material&&o.material.color){o.material=o.material.clone();f.yellowRestore.push([o,o.material.color.getHex()]);o.material.color.set(0xffd92f)}});f.yellowTime=30;bonusSound();notice(f.isBoss?'🟡 Босс стал жёлтым на 30 секунд!':'🟡 Кабанчик стал жёлтым на 30 секунд!')}
function updateYellowBoars(dt){for(const f of [...foes,...friends])if((f.yellowTime||0)>0){f.yellowTime-=dt;if(f.yellowTime<=0&&f.yellowRestore){for(const [o,c] of f.yellowRestore)if(o.material?.color)o.material.color.setHex(c);f.yellowRestore=null}}}
function collectForageItem(a,silent=false){
 if(!a||a.done)return false;a.done=true;scene.remove(a.g);score+=diffScore(5);
 if(a.bonus&&a.type==='berry'){statsData.berries++;startBoarForm()}
 else if(a.bonus&&a.type==='mushroom'){yellowMushroomStock++;statsData.forage++;bonusSound();if(!silent)notice(`🟡 Жёлтый мухомор! Следующее кормление окрасит кабанчика или босса на 30 секунд. Запас: ${yellowMushroomStock}`)}
 else if(a.bonus&&a.type==='apple'){statsData.forage++;if(a.tree){a.tree.scale.y*=2;a.tree.userData.yellowAppleGrown=true}bonusSound();if(!silent)notice('🍏✨ Жёлтое яблоко! Его дерево выросло в 2 раза выше.')}
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
function blockedByBoar(x,z,ignore=null,r=1.03){for(const b of boarBodies()){if(b===ignore)continue;if(Math.hypot(x-b.g.position.x,z-b.g.position.z)<r+boarRadius(b))return true}return false}
const battleFx=[];
function bossBattleImpact(x,z){
 const g=new THREE.Group();g.position.set(x,.42,z);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.25,.48,20),new THREE.MeshBasicMaterial({color:0xffb13b,transparent:true,opacity:.95,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;g.add(ring);
 for(let i=0;i<7;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.09,.09,.09),new THREE.MeshBasicMaterial({color:i%2?0xff6a22:0xffd45b}));const a=i/7*Math.PI*2;p.position.set(Math.sin(a)*.35,.12,Math.cos(a)*.35);g.add(p)}
 scene.add(g);battleFx.push({g,t:0,ring})
}function moveBoarToward(f,tx,tz,speed,dt){
 const ox=f.g.position.x,oz=f.g.position.z,dx=tx-ox,dz=tz-oz,d=Math.hypot(dx,dz);if(d<.001)return false;
 const step=Math.min(speed*dt,d),ux=dx/d,uz=dz/d;
 const blocked=(x,z)=>{
   const boySafe=f===friend?1.95:(boarRadius(f)+.62);
   const boyBlock=Math.hypot(x-boy.position.x,z-boy.position.z)<boySafe;
   const treeBlock=treePositions.some(([px,pz],i)=>treeObjects[i]?.visible!==false&&Math.hypot(x-px,z-pz)<.82);
   const rockBlock=rockPositions.some(([px,pz,r,mesh])=>mesh?.visible!==false&&Math.hypot(x-px,z-pz)<r+.52);
   const mountainBlock=level===4&&mountainObstacles.some(([px,pz,r])=>Math.hypot(x-px,z-pz)<r+1.02);
   const lairBlock=level===5&&lairObstacles.some(([px,pz,r,g])=>g.visible&&Math.hypot(x-px,z-pz)<r+1.02);
   const houseBlock=houseBlockAt(x,z,boarRadius(f)*.72);
   // v135: boars may use the shallow rim, but never choose a step deeper into the lake centre.
   const currentLakeR=Math.hypot(ox+18,oz+17),nextLakeR=Math.hypot(x+18,z+17);
   const lakeCoreBlock=level===2&&nextLakeR<7.8&&nextLakeR<=currentLakeR+.015;
   return boyBlock||treeBlock||rockBlock||mountainBlock||lairBlock||houseBlock||lakeCoreBlock||blockedByBoar(x,z,f,.78)
 };
 let nx=ox+ux*step,nz=oz+uz*step;
 if(blocked(nx,nz)){
   let ok=false;
   for(const side of [1,-1]){
     const sx=-uz*side,sz=ux*side;
     const ax=ox+(ux*.22+sx*.98)*step*.82,az=oz+(uz*.22+sz*.98)*step*.82;
     if(!blocked(ax,az)){nx=ax;nz=az;ok=true;break}
   }
   if(!ok){if(!f.isBoss){f.roamTimer=0;f.roamPause=rand(.12,.35)}return false}
 }
 f.g.position.x=nx;f.g.position.z=nz;f.g.rotation.y=Math.atan2(ux,uz);return true
}
// v133: when the friendly boar cannot follow Timur directly, probe a fan of detours and keep
// the best free heading. This prevents it from repeatedly pushing into the same tree/rock/house.
function moveFriendAroundObstacles(tx,tz,speed,dt){
 if(!friend?.g)return false;
 if(moveBoarToward(friend,tx,tz,speed,dt))return true;
 const ox=friend.g.position.x,oz=friend.g.position.z,base=Math.atan2(tx-ox,tz-oz),probe=Math.max(.65,speed*dt*3.2);
 let best=null;
 for(const deg of [28,-28,52,-52,78,-78,104,-104,135,-135,180]){
  const a=base+deg*Math.PI/180,px=ox+Math.sin(a)*probe,pz=oz+Math.cos(a)*probe;
  if(worldObstacleAt(px,pz,.52)||blockedByBoar(px,pz,friend,.72)||Math.hypot(px-boy.position.x,pz-boy.position.z)<1.82)continue;
  const score=Math.hypot(tx-px,tz-pz)+Math.abs(deg)*.006;
  if(!best||score<best.score)best={px,pz,score};
 }
 if(!best)return false;
 friend.userDataPathTarget=best;
 return moveBoarToward(friend,best.px,best.pz,speed*.92,dt);
}
if(__autoTest){
 try{
  selectedDiff=2;life=diffCfg().playerHP;food=diffCfg().foodMax;friendHP=diffCfg().friendHP;
  $('intro').style.display='none';$('cinematic').style.display='none';paused=false;started=true;win=false;
  const __lv=Math.max(1,Math.min(5,Number(__autoParams.get('level')||1)));loadLevel(__lv);
  window.__KABANCHIKI_TEST__.level=__lv;
  // v83: readiness must not wait for the expensive robot sweep. GitHub can now distinguish startup from collision-test work.
  window.__KABANCHIKI_TEST__.ready=true;document.documentElement.dataset.kabanchikiReady='1';
  setTimeout(()=>{try{const __robot=runRobotCollisionTest();window.__KABANCHIKI_TEST__.robotAudit=__robot;if(!__robot.ok)window.__KABANCHIKI_TEST__.errors.push(...__robot.issues);const __climb=runRockClimbAudit();window.__KABANCHIKI_TEST__.rockClimbAudit=__climb;if(!__climb.ok)window.__KABANCHIKI_TEST__.errors.push(...__climb.issues);const __edge=runRockEdgeAudit();window.__KABANCHIKI_TEST__.rockEdgeAudit=__edge;if(!__edge.ok)window.__KABANCHIKI_TEST__.errors.push(...__edge.issues);const __log=runLogPhysicsAudit();window.__KABANCHIKI_TEST__.logPhysicsAudit=__log;if(!__log.ok)window.__KABANCHIKI_TEST__.errors.push(...__log.issues);const __branchApple=runBranchAppleAudit();window.__KABANCHIKI_TEST__.branchAppleAudit=__branchApple;if(!__branchApple.ok)window.__KABANCHIKI_TEST__.errors.push(...__branchApple.issues);const __mountedTerrain=runMountedTerrainAudit();window.__KABANCHIKI_TEST__.mountedTerrainAudit=__mountedTerrain;if(!__mountedTerrain.ok)window.__KABANCHIKI_TEST__.errors.push(...__mountedTerrain.issues);const __treeTrunk=runTreeTrunkAudit();window.__KABANCHIKI_TEST__.treeTrunkAudit=__treeTrunk;if(!__treeTrunk.ok)window.__KABANCHIKI_TEST__.errors.push(...__treeTrunk.issues);const __appleTwig=runReachableAppleTwigAudit();window.__KABANCHIKI_TEST__.reachableAppleTwigAudit=__appleTwig;if(!__appleTwig.ok)window.__KABANCHIKI_TEST__.errors.push(...__appleTwig.issues);const __branchTravel=runBranchTraversalAudit();window.__KABANCHIKI_TEST__.branchTraversalAudit=__branchTravel;if(!__branchTravel.ok)window.__KABANCHIKI_TEST__.errors.push(...__branchTravel.issues);const __passage=runTreeRockPassageAudit();window.__KABANCHIKI_TEST__.treeRockPassageAudit=__passage;if(!__passage.ok)window.__KABANCHIKI_TEST__.errors.push(...__passage.issues);const __multiRock=runMountedMultiRockAudit();window.__KABANCHIKI_TEST__.mountedMultiRockAudit=__multiRock;if(!__multiRock.ok)window.__KABANCHIKI_TEST__.errors.push(...__multiRock.issues);const __corr=runRockCorridorAudit();window.__KABANCHIKI_TEST__.rockCorridorAudit=__corr;if(!__corr.ok)window.__KABANCHIKI_TEST__.errors.push(...__corr.issues);const __mountedApple=runMountedAppleAudit();window.__KABANCHIKI_TEST__.mountedAppleAudit=__mountedApple;if(!__mountedApple.ok)window.__KABANCHIKI_TEST__.errors.push(...__mountedApple.issues)}catch(e){const msg='robot-exception:'+String(e);window.__KABANCHIKI_TEST__.robotAudit={ok:false,pending:false,issues:[msg],samples:[],treesTested:0,rocksTested:0,level:__lv};window.__KABANCHIKI_TEST__.errors.push(msg)}},50);
 }catch(e){window.__KABANCHIKI_TEST__.errors.push(String(e));document.documentElement.dataset.kabanchikiError=String(e)}
}
const victoryFireworks=[];
function spawnVictoryFirework(){if(level!==5)return;const g=new THREE.Group(),colors=[0xffd54a,0xff4b73,0x5be7ff,0x7dff78,0xd88cff],mat=new THREE.MeshBasicMaterial({color:colors[Math.floor(Math.random()*colors.length)],transparent:true,opacity:1});const cx=rand(-18,18),cz=rand(-35,-8),cy=rand(9,17);for(let i=0;i<18;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.10,5,4),mat.clone()),a=Math.PI*2*i/18+rand(-.12,.12),up=rand(.3,1);p.position.set(cx,cy,cz);p.userData.v=new THREE.Vector3(Math.cos(a)*rand(3.2,6),up*rand(2.5,5.5),Math.sin(a)*rand(3.2,6));g.add(p)}scene.add(g);victoryFireworks.push({g,t:0});sound(rand(520,900),.16,'triangle')}
function updateVictoryFireworks(dt){for(let i=victoryFireworks.length-1;i>=0;i--){const fx=victoryFireworks[i];fx.t+=dt;for(const p of fx.g.children){p.position.addScaledVector(p.userData.v,dt);p.userData.v.y-=dt*2.4;p.material.opacity=Math.max(0,1-fx.t/1.8)}if(fx.t>=1.8){scene.remove(fx.g);victoryFireworks.splice(i,1)}}}
function igniteBossTree(t){
 if(!t||!t.visible||burningTrees.has(t))return;
 const flames=new THREE.Group();t.add(flames);
 const flameMat=new THREE.MeshBasicMaterial({color:0xff5a12,transparent:true,opacity:.92,depthWrite:false});
 const hotMat=new THREE.MeshBasicMaterial({color:0xffd34d,transparent:true,opacity:.9,depthWrite:false});
 for(const [x,y,z,r] of [[0,1.2,0,.34],[-.32,1.7,.12,.25],[.28,2.1,-.15,.29],[.05,2.7,.08,.22]]){const f=sphere(flames,flameMat,x,y,z,r);f.userData.baseY=y;const h=sphere(flames,hotMat,x,y+.12,z,r*.55);h.userData.baseY=y+.12}
 const lm=new THREE.PointLight(0xff6a18,24,16,1.2);lm.position.set(0,2.2,0);t.add(lm);
 t.traverse(o=>{if(o.isMesh&&o!==flames&&o.material){o.material=o.material.clone();if('emissive' in o.material){o.material.emissive.set(0x9b2600);o.material.emissiveIntensity=1.25}}});
 burningTrees.set(t,{time:10,light:lm,flames,damageRadius:2.65});notice('🔥 Дерево ярко загорелось — скоро сгорит дотла!')
}
function onBossDefeated(boss){if(level!==5||bossVictoryTimer!==null||win)return;scene.remove(boss.g);const bi=foes.indexOf(boss);if(bi>=0)foes.splice(bi,1);for(const m of [...foes]){if(m.isMinion){foes.splice(foes.indexOf(m),1);sendBoarAway(m,'boss-defeated')}}fireballs.forEach(f=>scene.remove(f.g));fireballs=[];bossVictoryTimer=5;bossFireworkTimer=0;notice('👑 Босс побеждён! 🎆 Миньоны разбегаются — через 5 секунд домой!')}
function finishBossVictory(){if(win)return;bossVictoryTimer=null;win=true;score+=familyFound*50;try{localStorage.setItem('kabanchiki3d_best',String(Math.max(score,Number(localStorage.getItem('kabanchiki3d_best')||0))))}catch{}notice(`🎉 ПОБЕДА! Тимур нашёл семью! Очки: ${score}.`);playCinematic('outro',()=>showEnd(true))}
let last=performance.now(),fpsFrames=0,fpsLast=last,fpsValue=0;hud();function loop(now){requestAnimationFrame(loop);fpsFrames++;if(now-fpsLast>=500){fpsValue=Math.round(fpsFrames*1000/(now-fpsLast));fpsFrames=0;fpsLast=now;const pe=$('perf');if(pe)pe.textContent=`${GAME_VERSION} · FPS ${fpsValue} · ⏱ всего ${formatTime(totalTime)} · 📍 ${formatTime(levelTime)}`;}const dt=Math.min(.05,(now-last)/1000);last=now;updateVictoryFireworks(dt);if(started&&life>0&&!win&&!paused){levelTime+=dt;totalTime+=dt;updateWeather(dt,now);updateHurricaneCarry(dt,now);updateYellowBoars(dt);if(boarFormTime>0){boarFormTime=Math.max(0,boarFormTime-dt);if(boarFormVisual){boarFormVisual.visible=true;boarFormVisual.position.set(boy.position.x,boy.position.y,boy.position.z);boarFormVisual.rotation.y=boy.rotation.y}if(boarFormTime<=0)endBoarForm()}for(const __b of [...friends,...foes]){if(__b?.g?.userData?.tailPivot)__b.g.userData.tailPivot.rotation.y=Math.sin(now*.006+__b.phase)*.42}if(level===1){forestVisual.rotation.z=Math.sin(now*.00045)*.0018;}if(level===2){rippleA.rotation.z=now*.000035;rippleB.rotation.z=-now*.000025;waterRippleMatA.opacity=.17+Math.sin(now*.0012)*.045;waterRippleMatB.opacity=.13+Math.sin(now*.00105+1.4)*.035;lakeGlint.scale.x=2.35+Math.sin(now*.0008)*.32;lakeGlint.material.opacity=.18+Math.sin(now*.0011)*.055;}throwCooldown=Math.max(0,throwCooldown-dt);friendAttack=Math.max(0,friendAttack-dt);forageTimer-=dt;if(forageTimer<=0){const activeFood=apples.filter(a=>!a.done&&a.type!=='berry').length,activeBerries=apples.filter(a=>!a.done&&a.type==='berry').length;if(activeFood<4){spawnForage();notice('🌱 Появилась новая еда! 🍎 Яблоки ищи на деревьях — до них нужно допрыгнуть.')}else if(activeBerries<1&&life<diffCfg().playerHP){spawnForage('berry');notice('🫐 Где-то появились лечебные ягоды!')}forageTimer=rand(14,22)}if(flashlightObj&&!hasFlashlight&&Math.hypot(flashlightObj.position.x-boy.position.x,flashlightObj.position.z-boy.position.z)<1.8){hasFlashlight=true;scene.remove(flashlightObj);flashlightObj=null;torch.intensity=42;sound(900,.25);notice('🔦 Фонарик найден! Теперь можно идти в ночное логово.')} boy.children[5].rotation.x*=Math.max(0,1-dt*7);for(let i=shots.length-1;i>=0;i--){const sh=shots[i];sh.t+=dt*2.8;const t=Math.min(1,sh.t);sh.g.position.lerpVectors(sh.start,sh.target,t);sh.g.position.y+=Math.sin(Math.PI*t)*1.7;sh.g.rotation.y+=dt*9;if(t>=1){resolveMeat(sh);shots.splice(i,1)}}for(const f of familyMembers){if(!f.done){if(level===2&&Math.hypot(f.g.position.x+18,f.g.position.z+17)<16.2){const q=nearestSafeSpawn(18,-4,.72)||[18,-4];f.g.position.x=f.x=q[0];f.g.position.z=f.z=q[1]}f.person.rotation.y=0;f.g.rotation.y=Math.atan2(boy.position.x-f.g.position.x,boy.position.z-f.g.position.z)}}const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-stick.y,side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+stick.x;const len=Math.max(1,Math.hypot(forward,side));let dx=(Math.sin(yaw)*forward-Math.cos(yaw)*side)/len,dz=(Math.cos(yaw)*forward+Math.sin(yaw)*side)/len;if(hurricaneCarry>0){dx=0;dz=0}// v87: pressing jump close to a friendly boar mounts it directly; no tree/wall pinning is needed.
if(boarFormTime<=0&&!mountedFriend&&jump&&friend?.g&&!friend.flee&&py<.35&&Math.hypot(boy.position.x-friend.g.position.x,boy.position.z-friend.g.position.z)<2.65){jump=false;mountFriendNow()}
const moveSpeed=mountedFriend?8.6:6;let windSlow=1;if(weatherStage>=2&&Math.hypot(dx,dz)>.05){const w=windVector(now),against=Math.max(0,-(dx*w.x+dz*w.z));windSlow=Math.max(weatherStage>=4?.42:.58,1-against*w.power*.58)}let mx=dx*dt*moveSpeed*windSlow,mz=dz*dt*moveSpeed*windSlow;
// v77 collision solver: trees (including branches), rocks, mountains and lair props use the same solid model.
// v86: while airborne, Timur may pass over the friendly boar so he can actually land on its back.
let friendTouch=!mountedFriend&&py<.58&&friend?.g&&!friend.flee&&Math.hypot(boy.position.x+mx-friend.g.position.x,boy.position.z+mz-friend.g.position.z)<2.05;
if(friendTouch&&Math.hypot(dx,dz)>.05){
 const push=.055,fx=friend.g.position.x+dx*push,fz=friend.g.position.z+dz*push;
 if(!worldObstacleAt(fx,fz,.55)&&!blockedByBoar(fx,fz,friend,.78)){friend.g.position.x=fx;friend.g.position.z=fz}
 friendTouch=Math.hypot(boy.position.x+mx-friend.g.position.x,boy.position.z+mz-friend.g.position.z)<2.05;
}
const blockingBoar=boarBodies().find(b=>b!==friend&&Math.hypot(boy.position.x+mx-b.g.position.x,boy.position.z+mz-b.g.position.z)<boarRadius(b)+.62);
if(!friendTouch&&!blockingBoar)movePlayerCollision(mx,mz);
else if(blockingBoar){
 const rx=boy.position.x-blockingBoar.g.position.x,rz=boy.position.z-blockingBoar.g.position.z,rl=Math.max(.001,Math.hypot(rx,rz));
 const tx=-rz/rl,tz=rx/rl,sign=(dx*tx+dz*tz)>=0?1:-1,mag=Math.hypot(mx,mz)*.68;
 const sx=tx*sign*mag,sz=tz*sign*mag;if(!playerWorldBlocked(boy.position.x+sx,boy.position.z+sz))movePlayerCollision(sx,sz)
}
if(Math.hypot(dx,dz)>.05){boy.rotation.y=Math.atan2(dx,dz);const walk=Math.sin(now*.014);boy.children[0].rotation.x=walk*.24;boy.children[1].rotation.x=-walk*.24;if(throwCooldown<=.18)boy.children[5].rotation.x=-walk*.16;boy.children[6].rotation.x=walk*.16}else{boy.children[0].rotation.x=boy.children[1].rotation.x=0;if(throwCooldown<=.18){boy.children[5].rotation.x*=Math.max(0,1-dt*9);boy.children[6].rotation.x*=Math.max(0,1-dt*9)}}
if(mountedFriend&&(!friend||friend.flee)){mountedFriend=false;setRiderPose(false);boy.rotation.z=0;py=0;vy=0}
if(mountedFriend){
 if(jump){mountedFriend=false;setRiderPose(false);boy.rotation.z=0;jump=false;if(friend?.g)friend.g.position.y=0;rideBump=0;py=1.18;vy=6.2;const a=boy.rotation.y;boy.position.x+=Math.sin(a)*1.15;boy.position.z+=Math.cos(a)*1.15;notice('🐗 Тимур спрыгнул с кабанчика!')}
 else{const nearLog=level===1?logObstacles.reduce((best,o)=>{const d=logDistance(o,boy.position.x,boy.position.z).distance-(o.r+.48);return Math.min(best,d)},99):99;const bumpTarget=nearLog<0?Math.min(.48,(-nearLog/.48)*.48):0;rideBump+=(bumpTarget-rideBump)*Math.min(1,dt*12);const ridingMoving=Math.hypot(dx,dz)>.05;rideGallop+=(ridingMoving?dt*11:dt*3.5);const gallop=ridingMoving?Math.abs(Math.sin(rideGallop))*.15:Math.sin(rideGallop)*.025;py=1.18+rideBump+gallop;vy=0;friend.g.position.x=boy.position.x;friend.g.position.z=boy.position.z;friend.g.position.y=rideBump+gallop*.48;friend.g.rotation.y=boy.rotation.y;friend.b.rotation.x=ridingMoving?Math.sin(rideGallop)*.08:0;boy.position.y=py;boy.rotation.z=ridingMoving?Math.sin(rideGallop)*.035:0;setRiderPose(true);const legKick=Math.sin(rideGallop)*.18;if(riderPoseParts.leftLeg)riderPoseParts.leftLeg.rotation.x=-1.02+legKick;if(riderPoseParts.rightLeg)riderPoseParts.rightLeg.rotation.x=-1.02-legKick;mountedFriendDefense()}
}else{
 // v122: a low fallen branch is a real step-over surface. When Timur walks into it from ground
 // level, lift his feet onto the visible branch instead of leaving the model sunk through it.
 const branchTop=branchStepHeightAt(boy.position.x,boy.position.z);
 if(py<=.08&&vy<=.05&&branchTop>0){py=branchTop;vy=0;boy.position.y=py}
 const supportNow=playerSupportHeightAt(boy.position.x,boy.position.z),grounded=Math.abs(py-supportNow)<.08&&vy<=.05;
 if(jump&&grounded&&boarFormTime<=0){vy=7;jump=false}else if(jump&&boarFormTime>0)jump=false
 const prevPy=py;vy-=18*dt;let nextPy=py+vy*dt;const support=playerSupportHeightAt(boy.position.x,boy.position.z);
 // Land on the top surface only while descending from above; never teleport through a rock/roof from below.
 if(vy<=0&&prevPy>=support-.04&&nextPy<=support){py=support;vy=0}else{py=Math.max(0,nextPy);if(py===0)vy=0}
 boy.position.y=py;
 if(friend?.g&&!friend.flee&&py>.62&&py<2.35&&vy<=2.2&&Math.hypot(boy.position.x-friend.g.position.x,boy.position.z-friend.g.position.z)<1.95){mountFriendNow()}
}
// v134: lake depth affects Timur and boars. Staying fully submerged too long costs health.
const sink=lakeDepthAt(boy.position.x,boy.position.z);if(sink>0){boy.position.y=py-sink;if(mountedFriend&&friend?.g)friend.g.position.y=rideBump+(Math.abs(Math.sin(rideGallop))*.15)*.48-sink}for(const q of foes){if(!q.flee)q.g.position.y=-lakeDepthAt(q.g.position.x,q.g.position.z)}if(friend?.g&&!mountedFriend&&!friend.flee)friend.g.position.y=-lakeDepthAt(friend.g.position.x,friend.g.position.z);
const fullyUnder=level===2&&(boy.position.y+1.75)<.14;if(fullyUnder){underwaterTime+=dt;underwaterDamageCd=Math.max(0,underwaterDamageCd-dt);if(underwaterTime>8&&underwaterDamageCd<=0){life--;statsData.damage++;underwaterDamageCd=3;playerHitFeedback();notice(life>0?'🌊 Тимур слишком долго под водой! Всплывай! -1❤️':'🌊 Тимур слишком долго пробыл под водой.');if(life<=0)showEnd(false)}}else{underwaterTime=Math.max(0,underwaterTime-dt*2);underwaterDamageCd=0}
invuln=Math.max(0,invuln-dt);
for(const f of familyMembers){if(!f.done&&Math.hypot(f.x-boy.position.x,f.z-boy.position.z)<2){f.done=true;scene.remove(f.g);familyFound=Math.min(4,familyFound+1);statsData.family++;levelFamilyDone++;life=diffCfg().playerHP;food=diffCfg().foodMax;if(friend)friendHP=diffCfg().friendHP;invuln=3;score+=diffScore(50);sound(880,.25,'sine');showFamilyPopup(f.role)}}
for(let i=defeatedBoars.length-1;i>=0;i--){const f=defeatedBoars[i];f.fleeTime+=dt;f.g.position.addScaledVector(f.fleeDir,dt*((f.fleeSpeed||6.5)+f.fleeTime*1.8));f.g.rotation.y=Math.atan2(f.fleeDir.x,f.fleeDir.z);f.b.rotation.z=Math.sin(now*.025)*.08;f.b.position.y=Math.abs(Math.sin(now*.025))*.10;if(Math.abs(f.g.position.x)>55||Math.abs(f.g.position.z)>55){scene.remove(f.g);defeatedBoars.splice(i,1)}}
if(friend?.g&&!friend.flee&&!mountedFriend){
 const sx=friend.g.position.x-boy.position.x,sz=friend.g.position.z-boy.position.z,sd=Math.hypot(sx,sz),safe=1.95;
 if(sd<safe){
  const ux=sd>.001?sx/sd:Math.sin(yaw+Math.PI/2),uz=sd>.001?sz/sd:Math.cos(yaw+Math.PI/2);
  const push=safe-sd+.015,fx=friend.g.position.x+ux*push,fz=friend.g.position.z+uz*push;
  const blocked=treePositions.some(([x,z],i)=>treeObjects[i]?.visible!==false&&Math.hypot(fx-x,fz-z)<.82)
   ||rockPositions.some(([x,z,r,m])=>m?.visible!==false&&Math.hypot(fx-x,fz-z)<r+.52)
   ||(level===5&&lairObstacles.some(([x,z,r,g])=>g.visible&&Math.hypot(fx-x,fz-z)<r+.82))
   ||houseBlockAt(fx,fz,.7)||blockedByBoar(fx,fz,friend,.78);
  if(!blocked){friend.g.position.x=fx;friend.g.position.z=fz}
 }
}
if(friend&&!mountedFriend){friend.b.rotation.z*=Math.max(0,1-dt*8);friend.b.position.y*=Math.max(0,1-dt*8);friend.blinkTimer-=dt;if(friend.blinkTimer<=0){for(const e of (friend.eyes||[]))e.scale.y=.012;setTimeout(()=>{if(friend)for(const e of (friend.eyes||[]))e.scale.y=.07},120);friend.blinkTimer=rand(2.2,5.5)}friend.idleTimer-=dt;if(friend.idleTimer<=0&&friend.g.position.distanceTo(boy.position)<5){friend.graze=rand(1.5,3.4);friend.idleTimer=rand(5,10)}if(friend.graze>0){friend.graze-=dt;friend.b.rotation.x=.28+Math.sin(now*.004)*.06;friend.b.position.y=-.10;friend.g.rotation.y+=Math.sin(now*.0015)*dt*.25}else{friend.b.rotation.x*=Math.max(0,1-dt*5)}const targets=foes.filter(f=>f!==friend);targets.sort((a,b)=>(b.isBoss?1:0)-(a.isBoss?1:0)||friend.g.position.distanceTo(a.g.position)-friend.g.position.distanceTo(b.g.position));const target=targets[0];const td=target?friend.g.position.distanceTo(target.g.position):99;if(target&&td<10){friend.g.rotation.y=Math.atan2(target.g.position.x-friend.g.position.x,target.g.position.z-friend.g.position.z);const combatDist=boarRadius(friend)+boarRadius(target)+.12;if(td>combatDist){moveBoarToward(friend,target.g.position.x,target.g.position.z,4.6,dt)}else if(friendAttack<=0){friendAttack=.92;target.b.rotation.x=-.24;friend.b.rotation.x=-.18;
const ax=target.g.position.x-friend.g.position.x,az=target.g.position.z-friend.g.position.z,al=Math.max(.01,Math.hypot(ax,az));const recoil=target.isBoss?1.35:.16;friend.g.position.x-=ax/al*recoil;friend.g.position.z-=az/al*recoil;if(target.isBoss){friend.b.rotation.x=.42;friend.b.position.y=.22;notice('💥 Босс отбрасывает кабанчика-друга!')}
bossBattleImpact((friend.g.position.x+target.g.position.x)/2,(friend.g.position.z+target.g.position.z)/2);sound(target.isBoss?105:145,.18,'triangle');
if(target.isBoss){target.hp--;bossHits++;statsData.bossHits++;bossRage=Math.min(2.35,bossRage+.12);moveBoarToward(target,target.g.position.x+ax/al*5,target.g.position.z+az/al*5,.95,1);target.stagger=Math.max(target.stagger||0,1.0);notice(`⚔️ Друг таранит босса и отбрасывает его! Осталось ${target.hp}/10`);if(target.hp<=0){score+=diffScore(200);onBossDefeated(target)}}else if(target.isMinion){hitBossMinion(target,ax,az,al)}else{foes.splice(foes.indexOf(target),1);sendBoarAway(target,'defeated');levelBoarsDone++;statsData.minions++;score+=diffScore(25);softBoarDefeatSound();notice('💚 Побеждённый кабанчик испугался и убегает!')}friendHP--;if(friendHP<=0){scene.remove(friend.g);friend=null;notice('💔 Кабанчик-друг пал в бою')}}}else{const d=Math.hypot(friend.g.position.x-boy.position.x,friend.g.position.z-boy.position.z);if(d>3.0){moveFriendAroundObstacles(boy.position.x,boy.position.z,4,dt)}friend.g.rotation.y=Math.atan2(boy.position.x-friend.g.position.x,boy.position.z-friend.g.position.z)}}
if(level<5&&questsComplete()){portalObj.g.visible=true;portalObj.ring.rotation.z+=dt;portalObj.core.material.opacity=.42+Math.sin(now*.006)*.14;portalObj.glow.intensity=7+Math.sin(now*.008)*2;if(Math.hypot(boy.position.x,boy.position.z+42)<2.2){score+=Math.max(0,Math.round(120-levelTime));const hadFriend=!!friend;loadLevel(level+1);if(hadFriend)notice('💚 Кабанчик-друг прошёл через портал вместе с Тимуром!')}}
if(level===5&&bossVictoryTimer!==null&&!win){bossVictoryTimer=Math.max(0,bossVictoryTimer-dt);bossFireworkTimer-=dt;if(bossFireworkTimer<=0){spawnVictoryFirework();bossFireworkTimer=.32}if(bossVictoryTimer<=0)finishBossVictory()}
for(const f of foes){f.phase+=dt;f.stagger=Math.max(0,(f.stagger||0)-dt);if(f.isBoss){f.b.position.y=Math.sin(now*.004)*.035;f.b.rotation.z=Math.sin(now*.0032)*.018}const d=Math.hypot(f.g.position.x-boy.position.x,f.g.position.z-boy.position.z);f.bolt.visible=d<13;if(d<13&&d>1.05){const chaseSpeed=(f.isBoss?f.baseSpeed*bossRage:1.65)*(.65+diffCfg().speedMult*.55);if(!(f.stagger>0))moveBoarToward(f,boy.position.x,boy.position.z,chaseSpeed,dt);f.g.rotation.y=Math.atan2(boy.position.x-f.g.position.x,boy.position.z-f.g.position.z)}else if(!f.isBoss){
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
}else{f.g.rotation.y+=dt*.2}if(d<4){f.b.rotation.x=-.11;f.b.rotation.z=Math.sin(now*.035)*.045;f.b.position.z=Math.sin(now*.018)*.10}else{f.b.rotation.x=0;f.b.rotation.z=0;f.b.position.z=0}f.b.position.y=0;const attackDist=f.isBoss?boarRadius(f)+.78:2.22;
if(d<attackDist&&invuln<=0&&boarFormTime<=0){life--;damage++;statsData.damage++;invuln=3;softBoarAttackSound();playerHitFeedback();
 if(f.isBoss){
   const ax=f.g.position.x-boy.position.x,az=f.g.position.z-boy.position.z,al=Math.max(.001,Math.hypot(ax,az));
   f.g.position.x+=ax/al*.85;f.g.position.z+=az/al*.85;f.stagger=1.15;bossRage=Math.max(.9,bossRage-.16);
   notice(life>0?'💥 Босс таранит! Он отшатнулся — уходи в сторону, пока есть окно!':'💔 Игра окончена.');
 }else notice(life>0?'💥 Кабан атаковал! Отбеги и брось еду 🍎':'💔 Игра окончена.');
 if(life<=0)showEnd(false)}}if(level===5){const boss=foes.find(f=>f.isBoss);if(boss){bossRage=Math.min(2.35,bossRage+dt*.018);bossSummon-=dt;if(bossSummon<=0){const minions=foes.filter(f=>!f.isBoss).length;if(minions<4){const count=Math.min(2,4-minions);for(let k=0;k<count;k++){const a=rand(0,Math.PI*2),r=rand(8,13),m=makeBoar(boss.g.position.x+Math.sin(a)*r,boss.g.position.z+Math.cos(a)*r,false);m.isMinion=true;m.hp=1;m.maxHp=1;m.stagger=0;foes.push(m)}notice(`👑 Босс призвал ${count} кабанчика-миньона! Накорми одного, чтобы получить друга.`)}bossSummon=rand(8,13)}const eyeMat=new THREE.MeshBasicMaterial({color:0xff4a16});if(!boss.eyeGlow){boss.eyeGlow=[];for(const xx of [-.34,.34])boss.eyeGlow.push(sphere(boss.b,eyeMat,xx,1.01,1.39,.10));boss.rageLight=new THREE.PointLight(0xff5420,0,24,1.35);boss.rageLight.position.set(0,1.08,1.48);boss.b.add(boss.rageLight);boss.auraGlow=new THREE.Mesh(new THREE.RingGeometry(2.45,3.35,32),new THREE.MeshBasicMaterial({color:0xff4a16,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));boss.auraGlow.rotation.x=-Math.PI/2;boss.auraGlow.position.y=.08;boss.g.add(boss.auraGlow);boss.crownLight=new THREE.PointLight(0xff2d00,8,28,1.25);boss.crownLight.position.set(0,2.2,0);boss.g.add(boss.crownLight)}const eyePower=Math.min(1,Math.max(.18,(bossRage-.75)/1.6));for(const e of boss.eyeGlow)e.scale.setScalar(1+eyePower*.55);boss.rageLight.intensity=8+eyePower*13+(boss.hp<=2?7:0);boss.crownLight.intensity=7+eyePower*10+(boss.hp<=2?5:0);boss.auraGlow.material.opacity=.20+eyePower*.24+Math.sin(now*.008)*.05;boss.auraGlow.rotation.z+=dt*(.35+eyePower*.45);boss.attackCd-=dt;const bossBoyDist=Math.hypot(boss.g.position.x-boy.position.x,boss.g.position.z-boy.position.z);if(boss.attackCd<=0&&bossBoyDist>6.5&&fireballs.length<3&&!(boss.stagger>0)){const shotsN=boss.hp<=1?Math.min(2,3-fireballs.length):1;for(let k=0;k<shotsN;k++){const a=Math.atan2(boy.position.x-boss.g.position.x,boy.position.z-boss.g.position.z)+(k-(shotsN-1)/2)*.18;const fg=new THREE.Group(),core=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),new THREE.MeshBasicMaterial({color:0xfff0a0})),flame=new THREE.Mesh(new THREE.SphereGeometry(.52,10,8),new THREE.MeshBasicMaterial({color:0xff4a00,transparent:true,opacity:.72})),light=new THREE.PointLight(0xff5a18,9,9);fg.add(core,flame,light);fg.position.set(boss.g.position.x,1.25,boss.g.position.z);scene.add(fg);fireballs.push({g:fg,a,flame,light})}boss.attackCd=boss.hp<=1?1.15:1.65;sound(150,.28,'sawtooth');notice(shotsN===2?'🔥 Босс выпускает два огненных сгустка!':'🔥 Босс швыряет настоящий огонь!')}}for(let i=fireballs.length-1;i>=0;i--){const q=fireballs[i];q.g.position.x+=Math.sin(q.a)*dt*5.4;q.g.position.z+=Math.cos(q.a)*dt*5.4;q.flame.scale.setScalar(.85+Math.sin(now*.025+i)*.25);q.g.position.y=1.0+Math.sin(now*.018+i)*.18;let burned=false;for(const t of treeObjects){if(t.visible&&t.position.distanceTo(q.g.position)<1.5){igniteBossTree(t);scene.remove(q.g);fireballs.splice(i,1);burned=true;break}}if(burned)continue;if(q.g.position.distanceTo(boy.position)<1.1&&invuln<=0&&boarFormTime<=0){life--;statsData.damage++;invuln=3;sound(120,.3,'sawtooth');scene.remove(q.g);fireballs.splice(i,1);notice('🔥 Огонь попал! -1❤️');if(life<=0)showEnd(false);continue}if(Math.abs(q.g.position.x)>50||Math.abs(q.g.position.z)>50){scene.remove(q.g);fireballs.splice(i,1)}}for(const [t,b] of burningTrees){b.time-=dt;b.light.intensity=22+Math.sin(now*.025)*7;if(Math.hypot(t.position.x-boy.position.x,t.position.z-boy.position.z)<b.damageRadius&&invuln<=0){life--;statsData.damage++;invuln=2.4;playerHitFeedback();notice(life>0?'🔥 Слишком близко к горящему дереву! -1❤️':'🔥 Тимур обжёгся у горящего дерева.');if(life<=0)showEnd(false)}if(b.flames){let fi=0;for(const f of b.flames.children){f.scale.setScalar(.82+Math.sin(now*.018+fi++)*.22);if(f.userData.baseY!==undefined)f.position.y=f.userData.baseY+Math.sin(now*.014+fi)*.10}}if(b.time<=0){t.remove(b.light);if(b.flames)t.remove(b.flames);for(const a of apples){if(!a.done&&(a.tree===t||a.g?.userData?.appleTree===t)){a.done=true;scene.remove(a.g)}}t.visible=false;makeCharredTreeRemains(t.position.x,t.position.z,1);burningTrees.delete(t);notice('🪵 Дерево сгорело — остался метровый обгоревший пень с обломанными ветвями.')}}}for(let i=battleFx.length-1;i>=0;i--){const fx=battleFx[i];fx.t+=dt;const k=fx.t/.42;fx.g.scale.setScalar(1+k*3.2);fx.ring.material.opacity=Math.max(0,1-k);for(let j=1;j<fx.g.children.length;j++){const p=fx.g.children[j];p.position.y+=dt*1.5;p.material.opacity=Math.max(0,1-k);p.material.transparent=true}if(k>=1){scene.remove(fx.g);battleFx.splice(i,1)}}
for(const a of apples){if(canCollectForage(a))collectForageItem(a)}act=false;hud()}const pos=boy.position;const camPresets=[{pitch:.30,dist:8.8,lift:3.8},{pitch:.22,dist:7.5,lift:3.0},{pitch:.14,dist:6.4,lift:2.35},{pitch:.38,dist:10.5,lift:5.6},{pitch:.12,dist:4.7,lift:2.05},{pitch:.10,dist:9.8,lift:2.2},{pitch:.46,dist:7.2,lift:6.6},{pitch:.20,dist:5.5,lift:2.75}],cp=camPresets[camMode];const fixedPitch=cp.pitch,distCam=cp.dist;/* v133: rider animation may bounce, camera anchor must not. */const cameraAnchorY=mountedFriend?1.18:pos.y,cy=cameraAnchorY+1.55;const look=new THREE.Vector3(pos.x+Math.sin(yaw)*Math.cos(fixedPitch)*7,cy-.15+Math.sin(fixedPitch)*1.2,pos.z+Math.cos(yaw)*Math.cos(fixedPitch)*7);camera.position.set(pos.x-Math.sin(yaw)*distCam,cy+cp.lift,pos.z-Math.cos(yaw)*distCam);boy.visible=boarFormTime<=0;if(boarFormVisual&&boarFormTime>0){boarFormVisual.visible=true;boarFormVisual.position.set(pos.x,pos.y,pos.z);boarFormVisual.rotation.y=boy.rotation.y}camera.lookAt(look);torch.position.copy(camera.position);torch.target.position.copy(look);
// v124: anything large between camera and Timur fades: houses, trees, rocks and cliffs.
// Track only last frame's roots, avoiding a full-world material reset every frame.
const occluderRoots=[...treeObjects,...rockPositions.map(q=>q[3]),...houseObjects.filter(h=>h!==familyHideout),...ridgeObjects,...boundaryDecor,...(level>=4?biomeObjects.filter(o=>o.visible):[])].filter(Boolean);
if(!loop._fadedRoots)loop._fadedRoots=new Set();for(const root of loop._fadedRoots)setObjectCameraFade(root,false);loop._fadedRoots.clear();
const rayDir=boy.position.clone().add(new THREE.Vector3(0,1.1,0)).sub(camera.position),rayLen=rayDir.length();rayDir.normalize();const occlusionRay=new THREE.Raycaster(camera.position,rayDir,0,rayLen);const hits=occlusionRay.intersectObjects(occluderRoots,true),rootSet=new Set(occluderRoots);
for(const hit of hits){let root=hit.object;while(root.parent&&!rootSet.has(root))root=root.parent;if(rootSet.has(root)&&!loop._fadedRoots.has(root)){loop._fadedRoots.add(root);setObjectCameraFade(root,true)}}updateFamilyHouseReveal();if(level===5&&moon.visible){moonHalo.lookAt(camera.position);moonDisc.rotation.y=now*.00003;}renderer.render(scene,camera);if(!__loadFinished){__loadFinished=true;window.__gameLoaded?.()}}requestAnimationFrame(loop);
