window.__gameLoadProgress?.(84);let __loadFinished=false;
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
const GAME_VERSION='v70'; const $=id=>document.getElementById(id), mobile=matchMedia('(pointer:coarse)').matches;if(mobile){$('message').textContent='🕹️ Джойстик — идти · проведи пальцем — камера · справа — Прыжок и Кормить';$('introControls').innerHTML='<b>На телефоне:</b> левый джойстик — движение, проведи пальцем по миру — поворот камеры, кнопки «Прыжок» и «Кормить» справа.';$('pauseControls').innerHTML='<b>Телефон:</b> левый джойстик — движение · проведи пальцем по миру — камера · кнопки «Прыжок» и «Кормить» справа.'}else{$('message').textContent='WASD — идти · ПРОБЕЛ — прыжок · E/F — кормить · ESC — меню · V — вид';$('introControls').innerHTML='<b>На ПК:</b> WASD/стрелки — идти, ПРОБЕЛ — прыжок, E или F — бросить еду, V — сменить вид, ESC — пауза. Мышь — горизонтальный поворот камеры.';$('pauseControls').innerHTML='<b>Управление ПК:</b> WASD/стрелки — движение · ПРОБЕЛ — прыжок · E/F — кормить · мышь — камера · V — вид · ESC — меню.'}let started=false,first=false,life=5,rescued=0,win=false,invuln=0,flash=0,camMode=(mobile?0:4),yaw=0,pitch=.18,move={x:0,z:0},jump=false,act=false,keys={},drag=null,stickPointer=null,stick={x:0,y:0};$('camera').textContent=`📷 Вид ${camMode+1}/8`;
const __autoParams=new URLSearchParams(location.search),__autoTest=__autoParams.get('autotest')==='1';
window.__KABANCHIKI_TEST__={version:GAME_VERSION,ready:false,level:0,errors:[]};if(__autoTest){let __seed=1337;Math.random=()=>{__seed=(__seed*1664525+1013904223)>>>0;return __seed/4294967296}}

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
const cube=new THREE.BoxGeometry(1,1,1);function block(parent,mat,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(cube,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m}function sphere(parent,mat,x,y,z,r=.3){const m=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),mat);m.position.set(x,y,z);parent.add(m);return m}function group(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);return g}function rand(a,b){return a+Math.random()*(b-a)}const ground=block(scene,mats.grass,0,-.55,0,96,1,96);ground.receiveShadow=!mobile;
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
for(let i=0;i<9;i++){const g=new THREE.Group();g.position.set(rand(-38,38),.12,rand(-38,34));const log=block(g,mats.wood,0,.28,0,rand(1.0,1.8),.42,.42);log.rotation.y=rand(0,6.28);forestVisual.add(g)}
const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(2.3,16,12),new THREE.MeshBasicMaterial({color:0xfff2b0}));sunDisc.position.set(-28,24,-42);scene.add(sunDisc);
const treePositions=[],treeObjects=[];
const trunkGeo=new THREE.CylinderGeometry(.46,.68,1,7),branchGeo=new THREE.CylinderGeometry(.13,.20,1,6),crownGeo=new THREE.DodecahedronGeometry(1,0);
for(let i=0;i<160;i++){
 let x=rand(-45,45),z=rand(-45,45);if(Math.abs(x)<4||Math.hypot(x,z)<8)continue;
 const g=group(x,z),h=rand(2.4,5.7),tr=rand(.72,1.08);
 const trunk=new THREE.Mesh(trunkGeo,mats.wood);trunk.position.y=h/2;trunk.scale.set(tr,h,tr);g.add(trunk);
 for(let r=0;r<3;r++){const root=block(g,mats.wood,Math.cos(r*2.094)*.38,.18,Math.sin(r*2.094)*.38,.22,.22,rand(.65,1.0));root.rotation.y=-r*2.094;root.rotation.z=.15}
 const branchN=Math.floor(rand(2,5));for(let b=0;b<branchN;b++){const br=new THREE.Mesh(branchGeo,mats.wood);const a=rand(0,6.28),len=rand(.8,1.45);br.position.set(Math.cos(a)*.35,h*.72+rand(-.2,.5),Math.sin(a)*.35);br.scale.set(tr*.55,len,tr*.55);br.rotation.z=rand(.65,1.0);br.rotation.y=a;g.add(br)}
 const crownN=Math.floor(rand(5,9));for(let c=0;c<crownN;c++){const cm=new THREE.Mesh(crownGeo,c%3?mats.leaf:mats.leaf2);const a=rand(0,6.28),rr=c===0?0:rand(.35,1.25);cm.position.set(Math.cos(a)*rr,h+rand(-.05,1.45),Math.sin(a)*rr);const sc=rand(.85,1.5);cm.scale.set(sc*1.15,sc,sc*1.15);g.add(cm)}
 g.rotation.y=rand(0,Math.PI*2);g.userData.isTree=true;
 g.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();o.material.transparent=true}});
 if(!mobile&&treeObjects.length<58)g.traverse(o=>{if(o.isMesh)o.castShadow=true});
 treePositions.push([x,z]);treeObjects.push(g)
}const rockPositions=[];const rockGeo=new THREE.DodecahedronGeometry(1,0);for(let i=0;i<50;i++){let x=rand(-43,43),z=rand(-43,43);if(Math.abs(x)<3||Math.hypot(x,z-4)<7||treePositions.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<2.2))continue;const m=new THREE.Mesh(rockGeo,mats.stone);m.position.set(x,rand(.18,.45),z);const sx=rand(.35,1.15),sz=rand(.4,1.25);m.scale.set(sx,rand(.3,.8),sz);m.rotation.set(rand(-.3,.3),rand(0,6.28),rand(-.2,.2));scene.add(m);rockPositions.push([x,z,Math.max(.55,Math.min(1.15,Math.max(sx,sz)*.8)),m])}
// Мягкие облака высоко в небе: заметны, но не мешают игре.
const cloudMat=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.72});for(let i=0;i<9;i++){const cg=new THREE.Group();cg.position.set(rand(-38,38),rand(16,23),rand(-38,20));for(let j=0;j<4;j++){const c=new THREE.Mesh(new THREE.SphereGeometry(rand(1.5,2.7),8,6),cloudMat);c.position.set(j*1.6+rand(-.5,.5),rand(-.25,.35),rand(-.5,.5));c.scale.y=.55;cg.add(c)}scene.add(cg)}
// Естественная плотная граница мира: не ровный забор из гор, а случайные "куски" леса, валунов и скал.
// Объекты идут короткими сериями (например 2–4 дерева, затем несколько камней, затем гора),
// стоят достаточно близко, чтобы визуально было ясно: дальше дороги нет. Физический предел карты остаётся отдельным.
const ridgeMat=new THREE.MeshLambertMaterial({color:0x6f7778,map:pixelTexture(30,[111,119,120],[67,73,75],'stone'),transparent:true,opacity:1});
const ridgeObjects=[],boundaryDecor=[];
function boundaryTree(x,z){const g=group(x,z),h=rand(3.0,5.5),tr=rand(.42,.68);block(g,mats.wood,0,h/2,0,tr,h,tr);const layers=Math.random()<.45?2:3;for(let j=0;j<layers;j++)block(g,j%2?mats.leaf:mats.leaf2,rand(-.16,.16),h+j*.56,rand(-.16,.16),rand(2.35,2.9)-j*.38,rand(.9,1.18),rand(2.2,2.75)-j*.34);g.rotation.y=rand(0,Math.PI*2);g.userData.isTree=true;g.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();o.material.transparent=true}});treeObjects.push(g);boundaryDecor.push(g)}
function boundaryRock(x,z){const m=new THREE.Mesh(rockGeo,mats.stone);m.position.set(x,rand(.45,.75),z);m.scale.set(rand(1.25,2.05),rand(.75,1.45),rand(1.2,2.0));m.rotation.set(rand(-.2,.2),rand(0,6.28),rand(-.18,.18));scene.add(m);boundaryDecor.push(m)}
function boundaryMountain(x,z){const h=rand(4.2,7.3),r=new THREE.Mesh(new THREE.ConeGeometry(rand(2.25,2.9),h,5),ridgeMat.clone());const sy=rand(.88,1.28);r.position.set(x,h*sy/2-.42,z);r.scale.set(rand(.85,1.28),sy,rand(.85,1.28));r.rotation.y=rand(0,6.28);r.userData.isRidge=true;scene.add(r);ridgeObjects.push(r);boundaryDecor.push(r)}
function buildBoundarySide(side){/* v35: две смещённые плотные линии декора без больших визуальных дыр */for(let row=0;row<2;row++){let kind=Math.floor(rand(0,3)),run=0;const step=row?2.05:2.25,base=46.4+row*1.55;for(let along=-48;along<=48;along+=step){if(run<=0){const old=kind;kind=Math.floor(rand(0,3));if(kind===old&&Math.random()<.6)kind=(kind+1+Math.floor(rand(0,2)))%3;run=kind===0?Math.floor(rand(2,5)):Math.floor(rand(1,4))}run--;const edge=base+rand(-.22,.22),a=along+(row?step*.48:0)+rand(-.25,.25);let x,z;if(side===0){x=a;z=-edge}else if(side===1){x=a;z=edge}else if(side===2){x=-edge;z=a}else{x=edge;z=a}if(kind===0)boundaryTree(x,z);else if(kind===1)boundaryRock(x,z);else boundaryMountain(x,z)}}}
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
const familyHideout=villageHouse(9,-28,2,0);familyHideout.userData.enterable=true;villageHouse(27,-23,3,-.10);
const hideDoor=group(9,-25.86);
const windowGlowMat=new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:.96});
block(hideDoor,windowGlowMat,-1.45,1.65,.02,.82,.82,.08);block(hideDoor,windowGlowMat,1.45,1.65,.02,.82,.82,.08);
const hideDoorGlow=new THREE.PointLight(0xffc45c,5.2,12,1.8);hideDoorGlow.position.set(9,2.15,-25.0);hideDoorGlow.visible=false;scene.add(hideDoorGlow);
let insideFamilyHouse=false;
villageHouse(-29,-7,2,Math.PI/2+.06);villageHouse(28,1,1,-Math.PI/2-.04);villageHouse(-25,19,3,.10);villageHouse(1,25,0,-.05);villageHouse(25,23,2,.08)
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
const waterMat=new THREE.MeshLambertMaterial({color:0x3d91bd,map:pixelTexture(32,[61,145,189],[35,101,151],'noise'),transparent:true,opacity:.86});
const lake=new THREE.Mesh(new THREE.CylinderGeometry(13,14,.22,40),waterMat);lake.position.set(-18,.02,-17);scene.add(lake);biomeMesh(lake,2);
const reedMat=new THREE.MeshLambertMaterial({color:0x5d8f38});for(let i=0;i<28;i++){const a=rand(0,Math.PI*2),r=rand(12.2,14.8),g=group(-18+Math.cos(a)*r,-17+Math.sin(a)*r);for(let j=0;j<3;j++)block(g,reedMat,rand(-.28,.28),rand(.45,.8),rand(-.28,.28),.09,rand(.8,1.5),.09);biomeMesh(g,2)}
// небольшие светлые камни у озера
for(let i=0;i<12;i++){const a=rand(0,Math.PI*2),r=rand(12.8,16),m=new THREE.Mesh(rockGeo,mats.stone);m.position.set(-18+Math.cos(a)*r,rand(.18,.35),-17+Math.sin(a)*r);m.scale.set(rand(.35,.8),rand(.3,.6),rand(.4,.9));scene.add(m);biomeMesh(m,2)}
// горная локация: крупные отдельные валуны и скальные группы
for(let i=0;i<24;i++){const g=group(rand(-41,41),rand(-41,41));const r=new THREE.Mesh(rockGeo,new THREE.MeshLambertMaterial({color:0x777c80,map:mats.stone.map}));r.scale.set(rand(1.3,3.1),rand(1.1,3.7),rand(1.3,3.0));r.position.y=r.scale.y*.45;g.add(r);mountainObstacles.push([g.position.x,g.position.z,Math.max(r.scale.x,r.scale.z)*.88]);biomeMesh(g,4)}
for(let i=0;i<8;i++){const g=group(rand(-39,39),rand(-39,39));const h=rand(3,6),pr=rand(1.3,2.2);const peak=new THREE.Mesh(new THREE.ConeGeometry(pr,h,5),ridgeMat.clone());peak.position.y=h/2-.45;g.add(peak);mountainObstacles.push([g.position.x,g.position.z,pr*.9]);biomeMesh(g,4)}
// логово: узнаваемые обгоревшие пни и тёмные валуны; все имеют физическую коллизию
const burntWood=new THREE.MeshLambertMaterial({color:0x3a261f,map:mats.wood.map}),charTop=new THREE.MeshLambertMaterial({color:0x171315});
for(let i=0;i<18;i++){
 const g=group(rand(-40,40),rand(-40,40));let rr;
 if(i%2){
   const w=rand(.75,1.15),h=rand(.75,1.55);
   block(g,burntWood,0,h/2,0,w,h,w);
   block(g,charTop,0,h+.035,0,w*.92,.07,w*.92);
   block(g,burntWood,-w*.58,.18,.05,w*.55,.20,.28);
   block(g,burntWood,w*.52,.16,-.08,w*.48,.18,.26);
   rr=w*.78;
 }else{
   const r=new THREE.Mesh(rockGeo,new THREE.MeshLambertMaterial({color:0x4a4650,map:mats.stone.map}));
   r.scale.set(rand(.8,1.8),rand(.6,1.5),rand(.8,1.8));r.position.y=r.scale.y*.42;g.add(r);rr=Math.max(r.scale.x,r.scale.z)*.72;
 }
 lairObstacles.push([g.position.x,g.position.z,rr,g]);biomeMesh(g,5)
}
const moonMat=new THREE.MeshBasicMaterial({color:0xdbe9ff});const moon=new THREE.Mesh(new THREE.SphereGeometry(3,16,12),moonMat);moon.position.set(-24,25,-38);scene.add(moon);moon.visible=false;const moonLight=new THREE.DirectionalLight(0x91b8ff,.0);moonLight.position.set(-20,24,-25);scene.add(moonLight);
function makeBoy(){let g=new THREE.Group();block(g,mats.pants,-.18,.43,0,.34,.85,.4);block(g,mats.pants,.18,.43,0,.34,.85,.4);block(g,mats.shirt,0,1.25,0,.85,.9,.48);block(g,mats.skin,0,2.03,0,.7,.7,.65);block(g,mats.hair,0,2.43,-.04,.76,.2,.68);block(g,mats.skin,-.56,1.25,0,.23,.72,.24);block(g,mats.skin,.56,1.25,0,.23,.72,.24);for(const x of [-.18,.18])block(g,mats.black,x,2.09,.34,.08,.1,.04);return g}const boy=makeBoy();boy.scale.setScalar(.52);
// Character Remaster — Timur
const boyHairMat=new THREE.MeshLambertMaterial({color:0x4a2b1c}),boyShoeMat=new THREE.MeshLambertMaterial({color:0x243447}),boyPackMat=new THREE.MeshLambertMaterial({color:0x6d4329}),boySkinMat=new THREE.MeshLambertMaterial({color:0xf2b184}),boyEyeMat=new THREE.MeshBasicMaterial({color:0x17212b});
block(boy,boyHairMat,0,2.52,-.02,.82,.22,.72);
for(const sx of [-1,1]){block(boy,boySkinMat,sx*.39,2.06,0,.13,.28,.18);block(boy,boyEyeMat,sx*.18,2.11,.37,.09,.11,.035);block(boy,boyShoeMat,sx*.18,.10,.12,.36,.20,.58)}
block(boy,boyPackMat,0,1.35,-.35,.68,.82,.22);
boy.userData.visualRemaster=true;boy.traverse(o=>{if(o.isMesh){o.castShadow=!mobile;o.receiveShadow=!mobile}});scene.add(boy);boy.position.set(0,0,4);let vy=0,py=0;const DIFF_NAMES=['Я слишком мал, чтобы умереть','Не мучай меня, кабанчик','Ультра-кабан','Кошмар','НЕВОЗМОЖНО'];
const DIFF_SCORE=[.2,.33,.5,1,2];
const DIFF_CONFIG=[
 {enemyMult:.5,speedMult:.4,itemMult:2,playerHP:10,friendHP:10,foodMax:10},
 {enemyMult:.8,speedMult:.47,itemMult:1.4,playerHP:7,friendHP:7,foodMax:7},
 {enemyMult:1.3,speedMult:.57,itemMult:.8,playerHP:4,friendHP:4,foodMax:4},
 {enemyMult:1.8,speedMult:.67,itemMult:.5,playerHP:2,friendHP:2,foodMax:2},
 {enemyMult:2.5,speedMult:.8,itemMult:.2,playerHP:1,friendHP:1,foodMax:1}
];let selectedDiff=2;const diffCfg=()=>DIFF_CONFIG[selectedDiff],diffScore=v=>Math.round(v*DIFF_SCORE[selectedDiff]);
let level=1,food=4,score=0,familyFound=0,friend=null,friendHP=4,bossHits=0,levelTime=0,damage=0,paused=false;const levels=["🌲 Лес","🌊 Озеро","🏘️ Деревня","⛰️ Горы","👑 Кабанье логово"];let portalObj=null;const familyMembers=[];const crates=[];const shots=[];let audio=null,throwCooldown=0,musicTimer=null,musicNote=0,forageTimer=18,friendAttack=0,hasFlashlight=false,flashlightObj=null,fireballs=[],levelBoarsTotal=0,levelBoarsDone=0,levelFamilyTotal=0,levelFamilyDone=0,familyPopupOpen=false,totalTime=0,statsData={fed:0,forage:0,berries:0,damage:0,family:0,minions:0,bossHits:0},endShown=false,bossRage=1,bossSummon=7,burningTrees=new Map();function softBoarDefeatSound(){try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(210,t);o.frequency.exponentialRampToValueAtTime(135,t+.22);g.gain.setValueAtTime(.018,t);g.gain.exponentialRampToValueAtTime(.001,t+.24);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.25)}catch{}}function softBoarAttackSound(){try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(155,t);o.frequency.exponentialRampToValueAtTime(92,t+.18);g.gain.setValueAtTime(.024,t);g.gain.exponentialRampToValueAtTime(.001,t+.20);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.21)}catch{}}function playerHitFeedback(){const d=$('damageFlash'),h=$('hud');d.classList.remove('hit');h.classList.remove('hurt');void d.offsetWidth;d.classList.add('hit');h.classList.add('hurt');setTimeout(()=>{d.classList.remove('hit');h.classList.remove('hurt')},520)}function sound(freq=330,duration=.14,type="sine"){try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(60,freq*.7),audio.currentTime+duration);g.gain.setValueAtTime(.07,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{}}
// Новая музыка: сохраняет лёгкий сказочный характер 2D-версии, но играет реже,
// тише и многослойнее, чтобы короткие ноты не утомляли во время исследования.
const MUSIC_THEMES=[
 {tempo:360,lead:[523,659,784,659,587,659,523,0,494,587,659,784,659,587,523,0],bass:[131,0,196,0,147,0,196,0],wave:'triangle'},
 {tempo:380,lead:[440,523,659,587,523,440,392,0,440,587,659,784,659,587,523,0],bass:[110,0,165,0,131,0,196,0],wave:'triangle'},
 {tempo:400,lead:[392,494,587,523,494,440,392,0,349,440,523,494,440,392,330,0],bass:[98,0,147,0,110,0,165,0],wave:'sine'},
 {tempo:430,lead:[330,392,494,440,392,330,294,0,330,440,523,494,440,392,330,0],bass:[82,0,123,0,98,0,147,0],wave:'triangle'},
 {tempo:330,lead:[220,0,247,262,220,0,196,185,220,247,262,294,262,247,220,0],bass:[55,0,55,0,62,0,49,0],wave:'sawtooth'}
];
function musicTone(freq,duration=.32,type='triangle',gain=.018){
 if(!freq)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,audio.currentTime);g.gain.exponentialRampToValueAtTime(gain,audio.currentTime+.035);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+duration+.03)}catch{}
}
function musicStep(){if(!started||paused||win)return;const t=MUSIC_THEMES[level-1],i=musicNote++;musicTone(t.lead[i%t.lead.length],t.tempo/1000*.82,t.wave,level===5?.014:.017);if(i%2===0)musicTone(t.bass[(i/2)%t.bass.length],t.tempo/1000*1.55,'sine',.010);if(i%8===0&&level<5){const root=t.bass[(i/2)%t.bass.length];musicTone(root?root*2:0,t.tempo/1000*2.2,'sine',.006)}}
function startMusic(){if(musicTimer)return;musicNote=0;musicStep();const schedule=()=>{if(musicTimer)clearTimeout(musicTimer);const t=MUSIC_THEMES[Math.max(0,Math.min(4,level-1))];musicTimer=setTimeout(()=>{musicTimer=null;musicStep();schedule()},t.tempo)};schedule()}
function stopMusic(){if(musicTimer){clearTimeout(musicTimer);musicTimer=null}}
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
function softCrateSound(){try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const t=audio.currentTime;[[330,0,.16,.016],[440,.09,.20,.012],[554,.18,.24,.009]].forEach(([freq,delay,dur,gain])=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,t+delay);o.frequency.exponentialRampToValueAtTime(freq*.92,t+delay+dur);g.gain.setValueAtTime(.0001,t+delay);g.gain.exponentialRampToValueAtTime(gain,t+delay+.035);g.gain.exponentialRampToValueAtTime(.0001,t+delay+dur);o.connect(g).connect(audio.destination);o.start(t+delay);o.stop(t+delay+dur+.03)})}catch{}}
function makeForage(type,x,z){const g=group(x,z);if(type==='berry'){const leaf=new THREE.MeshLambertMaterial({color:0x3f8b45}),berry=new THREE.MeshLambertMaterial({color:0x4d3ca6});block(g,leaf,0,.16,0,.65,.22,.65);for(const [bx,bz] of [[-.22,-.12],[.18,-.18],[-.12,.18],[.24,.16]])sphere(g,berry,bx,.34,bz,.13)}else{const model=makeFoodModel(type,g,0,.30,0);model.scale.setScalar(1.25)}apples.push({g,x,z,type,done:false})}
function safeForageSpot(){for(let tries=0;tries<40;tries++){const x=rand(-34,34),z=rand(-35,27);if(Math.hypot(x,z-4)<6)continue;if(treePositions.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<1.5))continue;if(rockPositions.some(([rx,rz,r])=>Math.hypot(x-rx,z-rz)<r+1.1))continue;return [x,z]}return [rand(-25,25),rand(-28,20)]}
function spawnForage(type){const [x,z]=safeForageSpot();makeForage(type||['apple','mushroom','cabbage'][Math.floor(Math.random()*3)],x,z)}
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
function makeFamily(x,z){const g=group(x,z);const role=(familyFound+familyMembers.length)%4;let person;
 if(role===0){person=makeMother();person.scale.setScalar(.72)}
 else if(role===3){person=makeGrandmother();person.scale.setScalar(.70)}
 else{person=makeBoy();person.scale.setScalar([1,.68][role-1]);person.children[2].material=[mats.leaf,mats.gold][role-1]}
 g.add(person);sphere(g,mats.gold,0,2.5,0,.2);familyMembers.push({g,x,z,done:false,role,person})}
function makePortal(){const g=group(0,-42);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.4,.28,10,24),new THREE.MeshBasicMaterial({color:0xe3b4ff}));ring.position.y=1.7;g.add(ring);const core=new THREE.Mesh(new THREE.CircleGeometry(1.12,24),new THREE.MeshBasicMaterial({color:0x9b54ff,transparent:true,opacity:.52,side:THREE.DoubleSide}));core.position.set(0,1.7,.02);g.add(core);const glow=new THREE.PointLight(0xc274ff,7,13,1.6);glow.position.set(0,1.8,0);g.add(glow);portalObj={g,ring,core,glow};g.visible=false}
function loadLevel(n){const carriedFriend=friend,carriedFriendHP=friendHP;level=n;rescued=0;bossHits=0;levelTime=0;forageTimer=18;if(n===1){totalTime=0;statsData={fed:0,forage:0,berries:0,damage:0,family:0,minions:0,bossHits:0};endShown=false;}bossRage=1;bossSummon=7;levelBoarsDone=0;levelFamilyDone=0;clearEntities(friends);clearEntities(foes);clearEntities(familyMembers);clearEntities(crates);fireballs.forEach(f=>scene.remove(f.g));fireballs=[];defeatedBoars.forEach(f=>scene.remove(f.g));defeatedBoars.length=0;friend=carriedFriend;friendHP=carriedFriendHP;if(friend){if(!friend.g.parent)scene.add(friend.g);friend.g.position.set(1.8,0,5.2);friend.g.rotation.set(0,0,0);friend.g.visible=true;friend.friendly=true;friend.aura.material.color.set(0x4cff72);friend.aura.material.opacity=.24}for(const a of apples)scene.remove(a.g);apples.length=0
const enemyCounts=[3,4,5,6,1];const enemyCount=n===5?1:Math.max(1,Math.min(8,Math.round(enemyCounts[n-1]*diffCfg().enemyMult)));levelBoarsTotal=enemyCount;const spawnSets=[[-18,-10],[18,-13],[-15,-25],[16,-29],[-20,-36],[20,-39],[-8,-42],[9,-43]];if(n<5){for(let i=0;i<enemyCount;i++){const pos=spawnSets[i];foes.push(makeBoar(pos[0],pos[1],false))}}else{const b=makeBoar(0,-31,false);b.g.scale.setScalar(2.3);b.hp=8;b.maxHp=8;b.isBoss=true;b.baseSpeed=2.05;b.rage=1;foes.push(b)}
seedForage();
const familyCounts=[0,1,1,2,0];levelFamilyTotal=familyCounts[n-1];const familyPos=[[11,-29],[-14,-33]];
for(let i=0;i<levelFamilyTotal;i++){if(n===3&&i===0)makeFamily(8.15,-28);else makeFamily(familyPos[i][0],familyPos[i][1])}
boy.position.set(0,0,4);if(portalObj)portalObj.g.visible=false;insideFamilyHouse=false;for(const h of houseObjects){setHouseTransparent(h,false);h.visible=(n===3)}hideDoor.visible=(n===3);hideDoorGlow.visible=(n===3);for(const o of biomeObjects)o.visible=(o.userData.biomeLevel===n);moon.visible=(n===5);moonLight.intensity=n===5?.10:0;forestVisual.visible=(n===1);forestGround.visible=(n===1);sunDisc.visible=(n===1);syncWorldGeneration(n);const skies=[0x86cfff,0x8fc9e8,0xf0a66f,0x34385e,0x080611];scene.background=new THREE.Color(skies[n-1]);scene.fog.color.copy(scene.background);scene.fog.near=n===1?32:(n>=4?9:28);scene.fog.far=n===1?88:(n>=4?38:78);sun.color.set(n===1?0xffffff:n===2?0xffe1b0:n===3?0xffa65a:0x7680aa);sun.intensity=[2.65,2.35,1.55,.28,.015][n-1];hemi.intensity=[2.25,2.7,2.15,.75,.075][n-1];renderer.toneMappingExposure=n===1?1.18:1.08;ground.material.color.set(n===1?0xffffff:n===2?0xd9f0cf:n===3?0xffead0:n===4?0xaeb3b6:0x76636b);torch.intensity=(n>=4&&hasFlashlight)?42:0;if(n===5&&!hasFlashlight)notice('🌙 Фонарика нет. Лунный свет очень слабый. Разозли босса — его глаза и огонь немного осветят логово.');if(flashlightObj){scene.remove(flashlightObj);flashlightObj=null}if((n===4||n===5)&&!hasFlashlight){const fx=n===4?8:-12,fz=n===4?-18:10;flashlightObj=group(fx,fz);block(flashlightObj,mats.gold,0,.45,0,.35,.35,.8);block(flashlightObj,mats.white,0,.45,.55,.28,.28,.28);sphere(flashlightObj,mats.gold,0,1.25,0,.18);if(n===5)notice('🔦 В логове где-то лежит запасной фонарик. В темноте ищи слабый золотистый отблеск.')}notice(`⚠️ ${n===5?'Ночь. Если нет фонарика — будет очень темно. Подружи миньона: только кабанчик-друг может ранить босса. Корми босса, чтобы успокоить и замедлить!':'Покорми кабанчика яблоком, грибом или капустой 🍎🍄🥬 — иначе он разозлится и нападёт!'}`);if(n===3)setTimeout(()=>notice('🏠 Кто-то из семьи спрятался внутри дома. Ищи дверь с тёплым светом — в неё можно войти.'),700);hud()}
function makeFoodModel(type,parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);if(type==='apple'){const red=new THREE.MeshLambertMaterial({color:0xd83a32}),darkRed=new THREE.MeshLambertMaterial({color:0xb92522}),green=new THREE.MeshLambertMaterial({color:0x4f9a3f});sphere(g,red,-.12,0,0,.25);sphere(g,red,.12,0,0,.25);sphere(g,darkRed,0,-.08,0,.23);block(g,mats.wood,0,.31,0,.055,.20,.055);const leaf=block(g,green,.13,.35,0,.22,.055,.13);leaf.rotation.z=-.35}else if(type==='mushroom'){const cap=new THREE.MeshLambertMaterial({color:0xc75a43});block(g,mats.white,0,-.02,0,.16,.30,.16);sphere(g,cap,0,.18,0,.30)}else{const green=new THREE.MeshLambertMaterial({color:0x65a94f});sphere(g,green,0,0,0,.34);for(const [a,b] of [[.2,0],[-.2,0],[0,.2],[0,-.2]])sphere(g,green,a,.03,b,.23)}g.userData.foodType=type;return g}
function foodLabel(type){return type==='apple'?'яблоко 🍎':type==='mushroom'?'гриб 🍄':'капусту 🥬'}
function feed(){if(!started||paused||win||life<=0||throwCooldown>0)return;if(food<=0){notice('🍎 Еда закончилась! Осмотрись: на карте растут яблоки, грибы и капуста.');sound(170,.2);return}food--;throwCooldown=.6;const start=boy.position.clone().add(new THREE.Vector3(0,1,0));const dir=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));const target=start.clone().addScaledVector(dir,10);const near=foes.filter(f=>f.g.position.distanceTo(target)<4.5||f.g.position.distanceTo(boy.position)<9).sort((a,b)=>a.g.position.distanceTo(target)-b.g.position.distanceTo(target))[0];if(near)target.copy(near.g.position).add(new THREE.Vector3(0,.8,0));const types=['apple','mushroom','cabbage'],type=types[Math.floor(Math.random()*types.length)],foodObj=makeFoodModel(type,scene,start.x,start.y,start.z);shots.push({g:foodObj,start,target,t:0,foe:near,type});boy.children[5].rotation.x=-1.1;sound(650,.12,'triangle');notice(near?`Тимур бросил ${foodLabel(type)}!`:`${foodLabel(type)} летит вперёд — целься в кабана!`);hud()}
function sendBoarAway(f,reason='defeated'){if(!f||!f.g)return;f.flee=true;f.fleeTime=0;f.fleeReason=reason;f.aura.visible=false;f.bolt.visible=false;const away=new THREE.Vector3(f.g.position.x-boy.position.x,0,f.g.position.z-boy.position.z);if(away.lengthSq()<.1)away.set(rand(-1,1),0,rand(-1,1));away.normalize();f.fleeDir=away;defeatedBoars.push(f)}
function resolveMeat(shot){scene.remove(shot.g);const f=shot.foe;if(!f||!foes.includes(f)){return}const label=foodLabel(shot.type||'apple');if(f.isBoss){const before=f.hp;f.hp=Math.min(f.maxHp,f.hp+1);bossRage=Math.max(.72,bossRage-.28);statsData.fed++;score+=5;sound(360,.22,'triangle');notice(before<f.maxHp?`👑 Босс съел ${label}: здоровье ${f.hp}/8, зато успокоился и замедлился.`:`👑 Босс съел ${label} и стал спокойнее — скорость временно снизилась.`)}else{statsData.fed++;foes.splice(foes.indexOf(f),1);if(friend&&friend!==f){const oldFriend=friend;friend=null;sendBoarAway(oldFriend,'jealous');notice('💔 Старый кабанчик обиделся и убежал: Тимур накормил другого!')}f.friendly=true;levelBoarsDone++;f.aura.material.color.set(0x4cff72);f.aura.material.opacity=.24;f.bolt.visible=false;friend=f;friendHP=diffCfg().friendHP;
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
}$('familyOk').onclick=()=>{familyPopupOpen=false;$('familyPopup').style.display='none';paused=false};function formatTime(sec){const m=Math.floor(sec/60),s=Math.floor(sec%60);return `${m}:${String(s).padStart(2,'0')}`}function questsComplete(){if(level===5)return !foes.some(f=>f.isBoss);return levelBoarsDone>=levelBoarsTotal&&levelFamilyDone>=levelFamilyTotal}function questState(){if(level===5){const boss=foes.find(f=>f.isBoss);if(boss)return `👑 Босс: ${boss.hp}/8 · Подружи миньона и помоги ему победить босса`;return '🎉 Босс побеждён!'}const boarsLeft=Math.max(0,levelBoarsTotal-levelBoarsDone),familyLeft=Math.max(0,levelFamilyTotal-levelFamilyDone);if(boarsLeft>0&&familyLeft>0)return `🐗 Накорми кабанов: ${levelBoarsDone}/${levelBoarsTotal} · 👨‍👩‍👦 Найди родных: ${levelFamilyDone}/${levelFamilyTotal}`;if(boarsLeft>0)return `🐗 Накорми кабанов: ${levelBoarsDone}/${levelBoarsTotal}`;if(familyLeft>0)return `👨‍👩‍👦 Найди родных: ${levelFamilyDone}/${levelFamilyTotal}`;return '🌀 Задание выполнено — иди в портал!' }
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
function showEnd(won){if(endShown)return;if(!won)playDeathMusic();endShown=true;paused=true;const best=(()=>{try{return JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]')}catch{return[]}})();$('endTitle').textContent=won?'🎉 Победа!':'💀 Игра окончена';$('endStats').innerHTML=`⏱ Время: <b>${formatTime(totalTime)}</b><br>🏆 Очки: <b>${score}</b><br>🍎 Кормлений: <b>${statsData.fed}</b><br>🌿 Собрано еды: <b>${statsData.forage}</b><br>🫐 Лечебных ягод: <b>${statsData.berries}</b><br>❤️ Получено урона: <b>${statsData.damage}</b><br>👨‍👩‍👦 Найдено семьи: <b>${familyFound}/4</b><br>🐗 Побеждено миньонов: <b>${statsData.minions}</b><br>👑 Ударов друга по боссу: <b>${statsData.bossHits}</b>`;$('playerName').value=localStorage.getItem('kabanchiki3d_player_name')||'';$('endScreen').style.display='grid'}$('saveResult').onclick=()=>{const name=$('playerName').value.trim()||'Аноним';try{localStorage.setItem('kabanchiki3d_player_name',name);const a=JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]');a.unshift({name,score,time:Math.round(totalTime),win,level,date:new Date().toLocaleDateString()});localStorage.setItem('kabanchiki3d_results',JSON.stringify(a.slice(0,50)));$('saveMsg').textContent='✅ Имя и результат сохранены на этом устройстве.'}catch{$('saveMsg').textContent='⚠️ Браузер запретил локальное сохранение.'}};function restartGame(){
 stopMusic();stopCinematicMusic();cineClear();cinematicRunning=false;cinematicFinish=null;
 $('cinematic').style.display='none';$('endScreen').style.display='none';$('pauseMenu').style.display='none';$('familyPopup').style.display='none';$('statsScreen').style.display='none';
 win=false;started=true;paused=false;endShown=false;life=diffCfg().playerHP;food=diffCfg().foodMax;score=0;familyFound=0;friendHP=diffCfg().friendHP;bossHits=0;damage=0;totalTime=0;invuln=0;
 boy.position.set(0,0,4);py=0;vy=0;loadLevel(1);startMusic();notice('🌲 Новая игра началась. Найди семью!');
}
$('endRestart').onclick=restartGame;function showPlayerStats(){
 let a=[];try{a=JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]')}catch{}
 const box=$('statsTable');
 if(!a.length){box.innerHTML='<p>Пока нет сохранённых результатов. После игры введи имя и нажми «💾 Сохранить результат».</p>'}
 else{
  const rows=a.slice().sort((x,y)=>(y.score||0)-(x.score||0)||(x.time||999999)-(y.time||999999)).slice(0,20);
  box.innerHTML='<div style="display:grid;grid-template-columns:42px 1fr 80px 80px 85px;gap:7px;align-items:center;font-size:14px"><b>№</b><b>Игрок</b><b>Очки</b><b>Время</b><b>Итог</b>'+
   rows.map((r,i)=>`<span>${i+1}</span><b>${String(r.name||'Аноним').replace(/[<>&]/g,'')}</b><span>🏆 ${r.score||0}</span><span>⏱ ${formatTime(r.time||0)}</span><span>${r.win?'✅ Победа':'💀 Проигрыш'}</span>`).join('')+'</div>';
 }
 $('statsScreen').style.display='grid';
}
$('showStatsIntro').onclick=showPlayerStats;$('showStatsEnd').onclick=showPlayerStats;$('closeStats').onclick=()=>$('statsScreen').style.display='none';
let noticeTimer=null;function notice(t){const m=$('message');m.textContent=t;m.classList.remove('hidden');flash=3;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>m.classList.add('hidden'),3200)}function hud(){$('stats').textContent=` · ${GAME_VERSION} · 📍 Локация ${level}/5: ${levels[level-1]} · ❤️ ${life}/${diffCfg().playerHP} · 🍎 ${food}/${diffCfg().foodMax} · 🏆 ${score} · 🎮 ${DIFF_NAMES[selectedDiff]} · 👨‍👩‍👦 ${familyFound}/4 · ⏱ ${formatTime(totalTime)}`+(level===5&&foes.find(f=>f.isBoss)?` · 👑 ${foes.find(f=>f.isBoss).hp}/8`:``); $('quest').textContent=win?'🎉 Тимур нашёл семью!':questState()}$('start').onclick=()=>{try{selectedDiff=Number(document.querySelector('input[name="diff3d"]:checked')?.value??2);life=diffCfg().playerHP;food=diffCfg().foodMax;friendHP=diffCfg().friendHP;$('intro').style.display='none';playCinematic('intro',()=>{started=true;paused=false;loadLevel(1);startMusic();notice(mobile?'📱 Камера: проведи пальцем по миру влево/вправо':'🖱️ Поворот камеры: зажми мышь и веди влево/вправо')})}catch(e){window.__showGameError('Ошибка запуска игры',e.stack||String(e))}};$('camera').onclick=()=>{camMode=(camMode+1)%8;first=false;$('camera').textContent=`📷 Вид ${camMode+1}/8`;$('cross').style.display='none';notice(['Высоко · далеко','Средне · далеко','Низко · близко','Очень высоко','За плечом','Низко · далеко','Сверху под углом','Близко · средне'][camMode])};$('restart').onclick=()=>location.reload();$('menuRestart').onclick=()=>location.reload();$('jump').onpointerdown=e=>{e.preventDefault();jump=true};$('interact').onpointerdown=e=>{e.preventDefault();feed()};function setPause(on){if(!started)return;paused=on;$('pauseMenu').style.display=on?'grid':'none';$('pauseBtn').textContent=on?'▶':'⏸'}function togglePause(){setPause(!paused)}$('pauseBtn').onclick=togglePause;$('resume').onclick=()=>setPause(false);async function goFullscreen(){
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
function setHouseTransparent(h,on){h.traverse(o=>{if(o.isMesh){if(o.userData._baseOpacity===undefined){o.userData._baseOpacity=o.material.opacity??1;o.userData._baseTransparent=!!o.material.transparent}o.material.transparent=on||o.userData._baseTransparent;o.material.opacity=on?.16:o.userData._baseOpacity;o.material.depthWrite=!on}})}
function updateFamilyHouseReveal(){
 if(level!==3||!familyHideout?.visible)return;
 const local=familyHideout.worldToLocal(new THREE.Vector3(boy.position.x,0,boy.position.z));
 const nowInside=local.x>-1.8&&local.x<.55&&local.z>-1.65&&local.z<1.98;
 if(nowInside!==insideFamilyHouse){insideFamilyHouse=nowInside;setHouseTransparent(familyHideout,nowInside);if(nowInside)notice('🏠 Дом становится прозрачным — теперь видно, кто прячется внутри!')}
}
function houseBlockAt(x,z,pad=.45){
 if(level!==3)return false;
 for(const h of houseObjects){
  if(!h.visible)continue;
  const box=new THREE.Box3().setFromObject(h);
  if(x>box.min.x-pad&&x<box.max.x+pad&&z>box.min.z-pad&&z<box.max.z+pad){
   if(h.userData.enterable){
    const local=h.worldToLocal(new THREE.Vector3(x,0,z));
    // Open doorway and a walkable room inside; walls remain solid elsewhere.
    const doorway=Math.abs(local.x)<.78&&local.z>1.72;
    const room=local.x>-1.75&&local.x<.45&&local.z>-1.55&&local.z<1.95;
    if(doorway||room)return false;
   }
   return true;
  }
 }
 return false
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
   return boyBlock||treeBlock||rockBlock||mountainBlock||lairBlock||houseBlock||blockedByBoar(x,z,f,.78)
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
if(__autoTest){
 try{
  selectedDiff=2;life=diffCfg().playerHP;food=diffCfg().foodMax;friendHP=diffCfg().friendHP;
  $('intro').style.display='none';$('cinematic').style.display='none';paused=false;started=true;win=false;
  const __lv=Math.max(1,Math.min(5,Number(__autoParams.get('level')||1)));loadLevel(__lv);
  window.__KABANCHIKI_TEST__.level=__lv;
  setTimeout(()=>{window.__KABANCHIKI_TEST__.ready=true;document.documentElement.dataset.kabanchikiReady='1'},900);
 }catch(e){window.__KABANCHIKI_TEST__.errors.push(String(e));document.documentElement.dataset.kabanchikiError=String(e)}
}
let last=performance.now(),fpsFrames=0,fpsLast=last,fpsValue=0;hud();function loop(now){requestAnimationFrame(loop);fpsFrames++;if(now-fpsLast>=500){fpsValue=Math.round(fpsFrames*1000/(now-fpsLast));fpsFrames=0;fpsLast=now;const pe=$('perf');if(pe)pe.textContent=`${GAME_VERSION} · FPS ${fpsValue} · ⏱ ${formatTime(totalTime)}`;}const dt=Math.min(.05,(now-last)/1000);last=now;if(started&&life>0&&!win&&!paused){levelTime+=dt;totalTime+=dt;for(const __b of [...friends,...foes]){if(__b?.g?.userData?.tailPivot)__b.g.userData.tailPivot.rotation.y=Math.sin(now*.006+__b.phase)*.42}if(level===1){forestVisual.rotation.z=Math.sin(now*.00045)*.0018;}throwCooldown=Math.max(0,throwCooldown-dt);friendAttack=Math.max(0,friendAttack-dt);forageTimer-=dt;if(forageTimer<=0){const activeFood=apples.filter(a=>!a.done&&a.type!=='berry').length,activeBerries=apples.filter(a=>!a.done&&a.type==='berry').length;if(activeFood<4){spawnForage();notice('🌱 Где-то на карте выросла новая еда!')}else if(activeBerries<1&&life<diffCfg().playerHP){spawnForage('berry');notice('🫐 Где-то появились лечебные ягоды!')}forageTimer=rand(14,22)}if(flashlightObj&&!hasFlashlight&&Math.hypot(flashlightObj.position.x-boy.position.x,flashlightObj.position.z-boy.position.z)<1.8){hasFlashlight=true;scene.remove(flashlightObj);flashlightObj=null;torch.intensity=42;sound(900,.25);notice('🔦 Фонарик найден! Теперь можно идти в ночное логово.')} boy.children[5].rotation.x*=Math.max(0,1-dt*7);for(let i=shots.length-1;i>=0;i--){const sh=shots[i];sh.t+=dt*2.8;const t=Math.min(1,sh.t);sh.g.position.lerpVectors(sh.start,sh.target,t);sh.g.position.y+=Math.sin(Math.PI*t)*1.7;sh.g.rotation.y+=dt*9;if(t>=1){resolveMeat(sh);shots.splice(i,1)}}for(const f of familyMembers){if(!f.done)f.person.rotation.y=Math.sin(now*.002+f.x)*.25}const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-stick.y,side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+stick.x;const len=Math.max(1,Math.hypot(forward,side));let dx=(Math.sin(yaw)*forward-Math.cos(yaw)*side)/len,dz=(Math.cos(yaw)*forward+Math.sin(yaw)*side)/len;let nx=boy.position.x+dx*dt*6,nz=boy.position.z+dz*dt*6;nx=Math.max(-44,Math.min(44,nx));nz=Math.max(-44,Math.min(44,nz));let hitTree=treePositions.some(([x,z],i)=>treeObjects[i]?.visible!==false&&Math.hypot(nx-x,nz-z)<.82),hitRock=py<.72&&rockPositions.some(([x,z,r,m])=>m?.visible!==false&&Math.hypot(nx-x,nz-z)<r+.38),hitLair=level===5&&py<.72&&lairObstacles.some(([x,z,r,g])=>g.visible&&Math.hypot(nx-x,nz-z)<r+.42),hitHouse=houseBlockAt(nx,nz,.34);
let friendTouch=friend?.g&&!friend.flee&&Math.hypot(nx-friend.g.position.x,nz-friend.g.position.z)<2.05;
if(friendTouch&&Math.hypot(dx,dz)>.05){
  const push=.055,fx=friend.g.position.x+dx*push,fz=friend.g.position.z+dz*push;
  const fTree=treePositions.some(([x,z],i)=>treeObjects[i]?.visible!==false&&Math.hypot(fx-x,fz-z)<.82),fRock=rockPositions.some(([x,z,r,m])=>m?.visible!==false&&Math.hypot(fx-x,fz-z)<r+.52),fLair=level===5&&lairObstacles.some(([x,z,r,g])=>g.visible&&Math.hypot(fx-x,fz-z)<r+.82);
  if(!fTree&&!fRock&&!fLair&&!houseBlockAt(fx,fz,.7)&&!blockedByBoar(fx,fz,friend,.78)){friend.g.position.x=fx;friend.g.position.z=fz}
  friendTouch=Math.hypot(nx-friend.g.position.x,nz-friend.g.position.z)<2.05;
  if(friendTouch){
    const rx=boy.position.x-friend.g.position.x,rz=boy.position.z-friend.g.position.z,rl=Math.max(.001,Math.hypot(rx,rz));
    const tx=-rz/rl,tz=rx/rl,sign=(dx*tx+dz*tz)>=0?1:-1,slide=.78;
    const sx=boy.position.x+tx*sign*dt*6*slide,sz=boy.position.z+tz*sign*dt*6*slide;
    const sTree=treePositions.some(([x,z],i)=>treeObjects[i]?.visible!==false&&Math.hypot(sx-x,sz-z)<.7),sRock=py<.72&&rockPositions.some(([x,z,r,m])=>m?.visible!==false&&Math.hypot(sx-x,sz-z)<r+.38),sLair=level===5&&lairObstacles.some(([x,z,r,g])=>g.visible&&Math.hypot(sx-x,sz-z)<r+.42);
    if(!sTree&&!sRock&&!sLair&&!houseBlockAt(sx,sz,.7)&&!blockedByBoar(sx,sz,friend,1.03)&&Math.hypot(sx-friend.g.position.x,sz-friend.g.position.z)>=1.96){nx=sx;nz=sz;friendTouch=false}
  }
}
const blockingBoar=boarBodies().find(b=>b!==friend&&Math.hypot(nx-b.g.position.x,nz-b.g.position.z)<boarRadius(b)+.62);
const hitOtherBoar=!!blockingBoar;
if(!hitTree&&!hitRock&&!hitLair&&!hitHouse&&!friendTouch&&!hitOtherBoar){boy.position.x=nx;boy.position.z=nz}
else if(hitTree&&!hitRock&&!hitLair&&!hitHouse&&!friendTouch&&!hitOtherBoar){const sl=slideAroundTree(boy.position.x,boy.position.z,nx,nz);if(sl){boy.position.x=sl.x;boy.position.z=sl.z}}
else if(hitOtherBoar&&!hitTree&&!hitRock&&!hitLair&&!hitHouse&&!friendTouch&&blockingBoar){
 const rx=boy.position.x-blockingBoar.g.position.x,rz=boy.position.z-blockingBoar.g.position.z,rl=Math.max(.001,Math.hypot(rx,rz));
 const tx=-rz/rl,tz=rx/rl,sign=(dx*tx+dz*tz)>=0?1:-1;
 const sx=boy.position.x+tx*sign*dt*6*.62,sz=boy.position.z+tz*sign*dt*6*.62;
 const safe=boarRadius(blockingBoar)+.62;
 if(Math.hypot(sx-blockingBoar.g.position.x,sz-blockingBoar.g.position.z)>=safe-.03&&!houseBlockAt(sx,sz,.34)
 &&!treePositions.some(([x,z],i)=>treeObjects[i]?.visible!==false&&Math.hypot(sx-x,sz-z)<.82)
 &&!rockPositions.some(([x,z,r,m])=>m?.visible!==false&&Math.hypot(sx-x,sz-z)<r+.38)){
   boy.position.x=sx;boy.position.z=sz;
 }
}if(Math.hypot(dx,dz)>.05){boy.rotation.y=Math.atan2(dx,dz);boy.children[0].rotation.x=Math.sin(now*.014)*.24;boy.children[1].rotation.x=-boy.children[0].rotation.x}else{boy.children[0].rotation.x=boy.children[1].rotation.x=0}if(jump&&py<=0.001){vy=7;jump=false}vy-=18*dt;py=Math.max(0,py+vy*dt);if(py===0)vy=0;boy.position.y=py;invuln=Math.max(0,invuln-dt);
for(const f of familyMembers){if(!f.done&&Math.hypot(f.x-boy.position.x,f.z-boy.position.z)<2){f.done=true;scene.remove(f.g);familyFound=Math.min(4,familyFound+1);statsData.family++;levelFamilyDone++;life=diffCfg().playerHP;food=diffCfg().foodMax;if(friend)friendHP=diffCfg().friendHP;invuln=3;score+=diffScore(50);sound(880,.25,'sine');showFamilyPopup(f.role)}}
for(let i=defeatedBoars.length-1;i>=0;i--){const f=defeatedBoars[i];f.fleeTime+=dt;f.g.position.addScaledVector(f.fleeDir,dt*(6.5+f.fleeTime*1.8));f.g.rotation.y=Math.atan2(f.fleeDir.x,f.fleeDir.z);f.b.rotation.z=Math.sin(now*.025)*.08;f.b.position.y=Math.abs(Math.sin(now*.025))*.10;if(f.fleeTime>3.2||Math.abs(f.g.position.x)>55||Math.abs(f.g.position.z)>55){scene.remove(f.g);defeatedBoars.splice(i,1)}}
if(friend?.g&&!friend.flee){
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
if(friend){friend.b.rotation.z*=Math.max(0,1-dt*8);friend.b.position.y*=Math.max(0,1-dt*8);friend.blinkTimer-=dt;if(friend.blinkTimer<=0){for(const e of (friend.eyes||[]))e.scale.y=.012;setTimeout(()=>{if(friend)for(const e of (friend.eyes||[]))e.scale.y=.07},120);friend.blinkTimer=rand(2.2,5.5)}friend.idleTimer-=dt;if(friend.idleTimer<=0&&friend.g.position.distanceTo(boy.position)<5){friend.graze=rand(1.5,3.4);friend.idleTimer=rand(5,10)}if(friend.graze>0){friend.graze-=dt;friend.b.rotation.x=.28+Math.sin(now*.004)*.06;friend.b.position.y=-.10;friend.g.rotation.y+=Math.sin(now*.0015)*dt*.25}else{friend.b.rotation.x*=Math.max(0,1-dt*5)}const targets=foes.filter(f=>f!==friend);targets.sort((a,b)=>(b.isBoss?1:0)-(a.isBoss?1:0)||friend.g.position.distanceTo(a.g.position)-friend.g.position.distanceTo(b.g.position));const target=targets[0];const td=target?friend.g.position.distanceTo(target.g.position):99;if(target&&td<10){friend.g.rotation.y=Math.atan2(target.g.position.x-friend.g.position.x,target.g.position.z-friend.g.position.z);const combatDist=boarRadius(friend)+boarRadius(target)+.12;if(td>combatDist){moveBoarToward(friend,target.g.position.x,target.g.position.z,4.6,dt)}else if(friendAttack<=0){friendAttack=.92;target.b.rotation.x=-.24;friend.b.rotation.x=-.18;
const ax=target.g.position.x-friend.g.position.x,az=target.g.position.z-friend.g.position.z,al=Math.max(.01,Math.hypot(ax,az));friend.g.position.x-=ax/al*.16;friend.g.position.z-=az/al*.16;
bossBattleImpact((friend.g.position.x+target.g.position.x)/2,(friend.g.position.z+target.g.position.z)/2);sound(target.isBoss?105:145,.18,'triangle');
if(target.hp){target.hp--;bossHits++;statsData.bossHits++;bossRage=Math.min(2.35,bossRage+.12);target.g.position.x+=ax/al*.10;target.g.position.z+=az/al*.10;notice(`⚔️ Друг таранит босса! Осталось ${target.hp}/8`);if(target.hp<=0){scene.remove(target.g);foes.splice(foes.indexOf(target),1);score+=diffScore(200)}}else{foes.splice(foes.indexOf(target),1);sendBoarAway(target,'defeated');levelBoarsDone++;statsData.minions++;score+=diffScore(25);softBoarDefeatSound();notice('💚 Побеждённый кабанчик испугался и убегает!')}friendHP--;if(friendHP<=0){scene.remove(friend.g);friend=null;notice('💔 Кабанчик-друг пал в бою')}}}else{const d=Math.hypot(friend.g.position.x-boy.position.x,friend.g.position.z-boy.position.z);if(d>3.0){moveBoarToward(friend,boy.position.x,boy.position.z,4,dt)}friend.g.rotation.y=Math.atan2(boy.position.x-friend.g.position.x,boy.position.z-friend.g.position.z)}}
if(level<5&&questsComplete()){portalObj.g.visible=true;portalObj.ring.rotation.z+=dt;portalObj.core.material.opacity=.42+Math.sin(now*.006)*.14;portalObj.glow.intensity=7+Math.sin(now*.008)*2;if(Math.hypot(boy.position.x,boy.position.z+42)<2.2){score+=Math.max(0,Math.round(120-levelTime));const hadFriend=!!friend;loadLevel(level+1);if(hadFriend)notice('💚 Кабанчик-друг прошёл через портал вместе с Тимуром!')}}
if(level===5&&foes.length===0&&!win){win=true;score+=familyFound*50;try{localStorage.setItem('kabanchiki3d_best',String(Math.max(score,Number(localStorage.getItem('kabanchiki3d_best')||0))))}catch{}notice(`🎉 ПОБЕДА! Тимур нашёл семью! Очки: ${score}.`);playCinematic('outro',()=>showEnd(true))}
for(const f of foes){f.phase+=dt;if(f.isBoss){f.stagger=Math.max(0,(f.stagger||0)-dt);f.b.position.y=Math.sin(now*.004)*.035;f.b.rotation.z=Math.sin(now*.0032)*.018}const d=Math.hypot(f.g.position.x-boy.position.x,f.g.position.z-boy.position.z);f.bolt.visible=d<13;if(d<13&&d>1.05){const chaseSpeed=(f.isBoss?f.baseSpeed*bossRage:1.65)*(.65+diffCfg().speedMult*.55);if(!f.isBoss||!(f.stagger>0))moveBoarToward(f,boy.position.x,boy.position.z,chaseSpeed,dt);f.g.rotation.y=Math.atan2(boy.position.x-f.g.position.x,boy.position.z-f.g.position.z)}else if(!f.isBoss){
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
if(d<attackDist&&invuln<=0){life--;damage++;statsData.damage++;invuln=3;softBoarAttackSound();playerHitFeedback();
 if(f.isBoss){
   const ax=f.g.position.x-boy.position.x,az=f.g.position.z-boy.position.z,al=Math.max(.001,Math.hypot(ax,az));
   f.g.position.x+=ax/al*.85;f.g.position.z+=az/al*.85;f.stagger=1.15;bossRage=Math.max(.9,bossRage-.16);
   notice(life>0?'💥 Босс таранит! Он отшатнулся — уходи в сторону, пока есть окно!':'💔 Игра окончена.');
 }else notice(life>0?'💥 Кабан атаковал! Отбеги и брось еду 🍎':'💔 Игра окончена.');
 if(life<=0)showEnd(false)}}if(level===5){const boss=foes.find(f=>f.isBoss);if(boss){bossRage=Math.min(2.35,bossRage+dt*.018);bossSummon-=dt;if(bossSummon<=0){const minions=foes.filter(f=>!f.isBoss).length;if(minions<4){const count=Math.min(2,4-minions);for(let k=0;k<count;k++){const a=rand(0,Math.PI*2),r=rand(8,13),m=makeBoar(boss.g.position.x+Math.sin(a)*r,boss.g.position.z+Math.cos(a)*r,false);m.isMinion=true;foes.push(m)}notice(`👑 Босс призвал ${count} кабанчика-миньона! Накорми одного, чтобы получить друга.`)}bossSummon=rand(8,13)}const eyeMat=new THREE.MeshBasicMaterial({color:0xff4a16});if(!boss.eyeGlow){boss.eyeGlow=[];for(const xx of [-.34,.34])boss.eyeGlow.push(sphere(boss.b,eyeMat,xx,1.01,1.39,.085));boss.rageLight=new THREE.PointLight(0xff5420,0,10,1.7);boss.rageLight.position.set(0,1.08,1.48);boss.b.add(boss.rageLight)}const eyePower=Math.min(1,Math.max(.18,(bossRage-.75)/1.6));for(const e of boss.eyeGlow)e.scale.setScalar(.85+eyePower*.28);boss.rageLight.intensity=1.2+eyePower*4.2+(boss.hp<=2?2.8:0);if(boss.hp<=2){boss.attackCd-=dt;const bossBoyDist=Math.hypot(boss.g.position.x-boy.position.x,boss.g.position.z-boy.position.z);if(boss.attackCd<=0&&bossBoyDist>6.5&&fireballs.length<3&&!(boss.stagger>0)){const shotsN=boss.hp<=1?Math.min(2,3-fireballs.length):1;for(let k=0;k<shotsN;k++){const a=Math.atan2(boy.position.x-boss.g.position.x,boy.position.z-boss.g.position.z)+(k-(shotsN-1)/2)*.18;const fg=new THREE.Group(),core=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),new THREE.MeshBasicMaterial({color:0xfff0a0})),flame=new THREE.Mesh(new THREE.SphereGeometry(.52,10,8),new THREE.MeshBasicMaterial({color:0xff4a00,transparent:true,opacity:.72})),light=new THREE.PointLight(0xff5a18,9,9);fg.add(core,flame,light);fg.position.set(boss.g.position.x,1.25,boss.g.position.z);scene.add(fg);fireballs.push({g:fg,a,flame,light})}boss.attackCd=boss.hp<=1?1.15:1.65;sound(150,.28,'sawtooth');notice(shotsN===2?'🔥 Босс выпускает два огненных сгустка!':'🔥 Босс швыряет настоящий огонь!')}}}for(let i=fireballs.length-1;i>=0;i--){const q=fireballs[i];q.g.position.x+=Math.sin(q.a)*dt*5.4;q.g.position.z+=Math.cos(q.a)*dt*5.4;q.flame.scale.setScalar(.85+Math.sin(now*.025+i)*.25);q.g.position.y=1.0+Math.sin(now*.018+i)*.18;let burned=false;for(const t of treeObjects){if(t.visible&&t.position.distanceTo(q.g.position)<1.5){if(!burningTrees.has(t)){const lm=new THREE.PointLight(0xff5a16,7,8);lm.position.set(0,2,0);t.add(lm);burningTrees.set(t,{time:18,light:lm});t.traverse(o=>{if(o.isMesh&&o.material){o.material.emissive?.set?.(0x5b1800);o.material.emissiveIntensity=.45}});notice('🔥 Дерево загорелось! Теперь вокруг стало светлее.')}scene.remove(q.g);fireballs.splice(i,1);burned=true;break}}if(burned)continue;if(q.g.position.distanceTo(boy.position)<1.1&&invuln<=0){life--;statsData.damage++;invuln=3;sound(120,.3,'sawtooth');scene.remove(q.g);fireballs.splice(i,1);notice('🔥 Огонь попал! -1❤️');if(life<=0)showEnd(false);continue}if(Math.abs(q.g.position.x)>50||Math.abs(q.g.position.z)>50){scene.remove(q.g);fireballs.splice(i,1)}}for(const [t,b] of burningTrees){b.time-=dt;b.light.intensity=5+Math.sin(now*.02)*2;if(b.time<=0){t.remove(b.light);t.traverse(o=>{if(o.isMesh&&o.material&&o.material.emissive){o.material.emissive.set(0x000000);o.material.emissiveIntensity=0}});burningTrees.delete(t)}}}for(let i=battleFx.length-1;i>=0;i--){const fx=battleFx[i];fx.t+=dt;const k=fx.t/.42;fx.g.scale.setScalar(1+k*3.2);fx.ring.material.opacity=Math.max(0,1-k);for(let j=1;j<fx.g.children.length;j++){const p=fx.g.children[j];p.position.y+=dt*1.5;p.material.opacity=Math.max(0,1-k);p.material.transparent=true}if(k>=1){scene.remove(fx.g);battleFx.splice(i,1)}}
for(const a of apples){if(!a.done&&Math.hypot(a.x-boy.position.x,a.z-boy.position.z)<1.25){a.done=true;scene.remove(a.g);score+=diffScore(5);if(a.type==='berry'){const before=life;life=Math.min(diffCfg().playerHP,life+1);statsData.berries++;sound(760,.16,'sine');notice(before<diffCfg().playerHP?'🫐 Ягоды восстановили 1❤️!':'🫐 Ягоды собраны, но здоровье уже полное.')}else{food=Math.min(diffCfg().foodMax,food+1);statsData.forage++;sound(560,.12,'triangle');notice(`🌿 Собрано: ${foodLabel(a.type)} · еда ${food}/${diffCfg().foodMax}`)}}}act=false;hud()}const pos=boy.position;const camPresets=[{pitch:.30,dist:8.8,lift:3.8},{pitch:.22,dist:7.5,lift:3.0},{pitch:.14,dist:6.4,lift:2.35},{pitch:.38,dist:10.5,lift:5.6},{pitch:.12,dist:4.7,lift:2.05},{pitch:.10,dist:9.8,lift:2.2},{pitch:.46,dist:7.2,lift:6.6},{pitch:.20,dist:5.5,lift:2.75}],cp=camPresets[camMode];const fixedPitch=cp.pitch,distCam=cp.dist,cy=pos.y+1.55;const look=new THREE.Vector3(pos.x+Math.sin(yaw)*Math.cos(fixedPitch)*7,cy-.15+Math.sin(fixedPitch)*1.2,pos.z+Math.cos(yaw)*Math.cos(fixedPitch)*7);camera.position.set(pos.x-Math.sin(yaw)*distCam,cy+cp.lift,pos.z-Math.cos(yaw)*distCam);boy.visible=true;camera.lookAt(look);torch.position.copy(camera.position);torch.target.position.copy(look);for(const t of treeObjects)t.traverse(o=>{if(o.isMesh&&o.material)o.material.opacity=1});for(const r of ridgeObjects)r.material.opacity=1;const rayDir=boy.position.clone().add(new THREE.Vector3(0,1.1,0)).sub(camera.position),rayLen=rayDir.length();rayDir.normalize();const treeRay=new THREE.Raycaster(camera.position,rayDir,0,rayLen);const hits=treeRay.intersectObjects([...treeObjects,...ridgeObjects],true);const faded=new Set();for(const hit of hits){let root=hit.object;if(root.userData.isRidge){root.material.opacity=.20;continue}while(root.parent&&!root.userData.isTree)root=root.parent;if(root.userData.isTree&&!faded.has(root)){faded.add(root);root.traverse(o=>{if(o.isMesh&&o.material)o.material.opacity=.22})}}updateFamilyHouseReveal();renderer.render(scene,camera);if(!__loadFinished){__loadFinished=true;window.__gameLoaded?.()}}requestAnimationFrame(loop);
