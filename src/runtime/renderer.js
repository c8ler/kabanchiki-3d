import * as THREE from "../../vendor/three/three.module.min.js";
import { StaticSceneryBatches } from "../static-batching.js?v=217";
import { lightBudget, selectEffectLights } from "../render-budget.js?v=217";

// Owns 24 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let effectLights,hemi,sun,torch,visualSeed,skyUniforms,skyDome,softGlowTexture,fireballAssets,renderLights,selectedRenderLights,lastLightSelection,lightSelectionEpoch,distanceOptimizations,sceneryBatches,sceneryEpoch,scenerySeason,mats;

function makeEffectLight(...args){const light=new THREE.PointLight(...args);effectLights.push(light);return light}

function visualOnly(build){const previous=Math.random;Math.random=()=>{visualSeed=(Math.imul(visualSeed,1664525)+1013904223)>>>0;return visualSeed/4294967296};try{return build()}finally{Math.random=previous}}

function glowTexture(){const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=255;data[i+3]=Math.max(0,Math.pow(Math.max(0,1-r),2)*180)}const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.needsUpdate=true;return t}

function fallingSignPart(o){for(let p=o;p;p=p.parent)if(p.userData.fallingSign)return true;return false;}

function ensureSceneryBatches(){if(runtime.cinematicRunning){sceneryBatches?.dispose();sceneryBatches=null;sceneryEpoch=-1;return;}if(sceneryEpoch===runtime.worldEpoch&&scenerySeason===runtime.currentSeason)return;sceneryBatches?.dispose();const candidates=[],seen=new Set();const add=root=>{if(!root||runtime.burningTrees.has(root)||runtime.stormBurning.has(root))return;root.traverse(mesh=>{if(mesh.isMesh&&!fallingSignPart(mesh)&&!seen.has(mesh)){seen.add(mesh);candidates.push({mesh,owner:root,detail:root.userData.isTree&&(mesh.userData.appleBranch||(mesh.geometry?.type==='BoxGeometry'&&mesh.geometry.parameters.height<.3))})}})};for(const root of runtime.treeObjects)add(root);for(const root of runtime.boundaryDecor)add(root);for(const root of runtime.biomeObjects)add(root);for(const item of runtime.craftWorld.items)if(item.g.visible&&!item.living)add(item.g);for(const rock of runtime.rockPositions)add(rock[3]);sceneryBatches=visualOnly(()=>new StaticSceneryBatches(runtime.scene,candidates));sceneryEpoch=runtime.worldEpoch;scenerySeason=runtime.currentSeason;}

function renderWithLightBudget(now){
 ensureSceneryBatches();
 const budget=lightBudget(runtime.adaptiveGraphics.tier);
 if(now-lastLightSelection>=100||lightSelectionEpoch!==runtime.worldEpoch){lastLightSelection=now;lightSelectionEpoch=runtime.worldEpoch;effectLights=effectLights.filter(l=>{let root=l;while(root.parent)root=root.parent;return root===runtime.scene});const candidates=[];for(const source of effectLights){if(!source.visible||source.intensity<=0)continue;let visible=true;for(let p=source.parent;p;p=p.parent)if(!p.visible){visible=false;break}if(!visible)continue;const position=source.getWorldPosition(new THREE.Vector3());candidates.push({source,intensity:source.intensity,distanceSquared:position.distanceToSquared(runtime.boy.position),primary:!!source.userData.primary&&!runtime.cinematicRunning})}selectedRenderLights=selectEffectLights(candidates,budget)}
 for(let i=0;i<renderLights.length;i++){const light=renderLights[i],source=selectedRenderLights[i]?.source;light.visible=i<budget;if(!source||!source.parent){light.intensity=0;continue}source.getWorldPosition(light.position);light.color.copy(source.color);light.intensity=source.intensity;light.distance=source.distance;light.decay=source.decay}
 const visibility=effectLights.map(l=>l.visible);effectLights.forEach(l=>l.visible=false);const fogCulled=[];for(const root of runtime.boundaryDecor)if(root.visible&&Math.hypot(root.position.x-runtime.camera.position.x,root.position.z-runtime.camera.position.z)>runtime.scene.fog.far+8){root.visible=false;fogCulled.push(root)}
 try{sceneryBatches?.begin(runtime.camera,root=>runtime.burningTrees.has(root)||runtime.stormBurning.has(root)||root.userData.stormBlackened,distanceOptimizations?[26,32,38,Infinity][runtime.adaptiveGraphics.tier]:Infinity);runtime.renderer.render(runtime.scene,runtime.camera)}finally{sceneryBatches?.end();effectLights.forEach((l,i)=>l.visible=visibility[i]);for(const root of fogCulled)root.visible=true}
}
 return {
  bindings:{
"effectLights":{get:()=>effectLights,set:value=>{effectLights=value}},
"makeEffectLight":{get:()=>makeEffectLight},
"hemi":{get:()=>hemi},
"sun":{get:()=>sun},
"torch":{get:()=>torch},
"visualSeed":{get:()=>visualSeed,set:value=>{visualSeed=value}},
"visualOnly":{get:()=>visualOnly},
"skyUniforms":{get:()=>skyUniforms},
"skyDome":{get:()=>skyDome},
"glowTexture":{get:()=>glowTexture},
"softGlowTexture":{get:()=>softGlowTexture},
"fireballAssets":{get:()=>fireballAssets},
"renderLights":{get:()=>renderLights},
"selectedRenderLights":{get:()=>selectedRenderLights,set:value=>{selectedRenderLights=value}},
"lastLightSelection":{get:()=>lastLightSelection,set:value=>{lastLightSelection=value}},
"lightSelectionEpoch":{get:()=>lightSelectionEpoch,set:value=>{lightSelectionEpoch=value}},
"distanceOptimizations":{get:()=>distanceOptimizations,set:value=>{distanceOptimizations=value}},
"sceneryBatches":{get:()=>sceneryBatches,set:value=>{sceneryBatches=value}},
"sceneryEpoch":{get:()=>sceneryEpoch,set:value=>{sceneryEpoch=value}},
"scenerySeason":{get:()=>scenerySeason,set:value=>{scenerySeason=value}},
"fallingSignPart":{get:()=>fallingSignPart},
"ensureSceneryBatches":{get:()=>ensureSceneryBatches},
"renderWithLightBudget":{get:()=>renderWithLightBudget},
"mats":{get:()=>mats}
  },
  initialize(){

/* init:let */ effectLights = [];

runtime.renderer.outputColorSpace=THREE.SRGBColorSpace;

runtime.renderer.toneMapping=THREE.ACESFilmicToneMapping;

runtime.renderer.toneMappingExposure=1.12;

document.body.prepend(runtime.renderer.domElement);

/* init:const */ hemi = new THREE.HemisphereLight(0xb9d5ff,0x52613b,1.4);

runtime.scene.add(hemi);

/* init:const */ sun = new THREE.DirectionalLight(0xffbd76,2.2);

sun.position.set(-28,24,-42);

sun.target.position.set(0,0,0);

runtime.scene.add(sun.target);

sun.castShadow=!runtime.mobile;

sun.shadow.mapSize.set(2048,2048);

sun.shadow.camera.left=-78;

sun.shadow.camera.right=78;

sun.shadow.camera.top=78;

sun.shadow.camera.bottom=-78;

sun.shadow.camera.near=.1;

sun.shadow.camera.far=180;

sun.shadow.bias=-.00012;

sun.shadow.normalBias=.018;

sun.shadow.radius=2;

runtime.scene.add(sun);

/* init:const */ torch = new THREE.SpotLight(0xfff1c2,0,29,Math.PI/5,.55,1);

runtime.scene.add(torch);

runtime.scene.add(torch.target);

// New visual assets use their own random stream so Three.js UUID allocation does not shift world generation.
/* init:let */ visualSeed = 8147;

// Procedural sky: cool zenith, warm horizon, no external texture downloads.
/* init:const */ skyUniforms = {horizon:{value:new THREE.Color(0xeac096)},zenith:{value:new THREE.Color(0x739ecb)}};

/* init:const */ skyDome = visualOnly(()=>new THREE.Mesh(new THREE.SphereGeometry(100,24,12),new THREE.ShaderMaterial({uniforms:skyUniforms,side:THREE.BackSide,depthWrite:false,vertexShader:'varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 horizon;uniform vec3 zenith;varying vec3 skyDirection;void main(){float h=max(0.0,normalize(skyDirection).y);vec3 c=mix(horizon,zenith,smoothstep(0.0,0.78,h));gl_FragColor=vec4(c,1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'})));

skyDome.frustumCulled=false;

skyDome.renderOrder=-10;

runtime.scene.add(skyDome);

/* init:const */ softGlowTexture = visualOnly(glowTexture);

/* init:const */ fireballAssets = visualOnly(()=>({coreGeometry:new THREE.SphereGeometry(.32,10,8),flameGeometry:new THREE.SphereGeometry(.52,10,8),coreMaterial:new THREE.MeshBasicMaterial({color:0xfff0a0}),flameMaterial:new THREE.MeshBasicMaterial({color:0xff4a00,transparent:true,opacity:.72})}));

/* init:const */ renderLights = visualOnly(()=>Array.from({length:6},()=>{const l=new THREE.PointLight(0xffffff,0,10);runtime.scene.add(l);return l}));

/* init:let */ selectedRenderLights = [];
/* init:let */ lastLightSelection = -Infinity;
/* init:let */ lightSelectionEpoch = -1;

/* init:let */ distanceOptimizations = true;

/* init:let */ sceneryBatches = null;
/* init:let */ sceneryEpoch = -1;
/* init:let */ scenerySeason = null;


/* init:const */ mats = {grass:new THREE.MeshLambertMaterial({color:0x6aa84d}),soil:new THREE.MeshLambertMaterial({color:0x92714d}),path:new THREE.MeshLambertMaterial({color:0xb7a06d}),leaf:new THREE.MeshLambertMaterial({color:0x39834b}),leaf2:new THREE.MeshLambertMaterial({color:0x4d9854}),wood:new THREE.MeshLambertMaterial({color:0x765239}),stone:new THREE.MeshLambertMaterial({color:0x8b9a9d}),skin:new THREE.MeshLambertMaterial({color:0xf2ba83}),hair:new THREE.MeshLambertMaterial({color:0x65402b}),shirt:new THREE.MeshLambertMaterial({color:0x3776bc}),pants:new THREE.MeshLambertMaterial({color:0x35465b}),boar:new THREE.MeshLambertMaterial({color:0x80513c}),boar2:new THREE.MeshLambertMaterial({color:0xa87955}),pink:new THREE.MeshLambertMaterial({color:0xe4a5a0}),white:new THREE.MeshLambertMaterial({color:0xf8f1df}),black:new THREE.MeshLambertMaterial({color:0x211c1c}),red:new THREE.MeshLambertMaterial({color:0xd23c37}),gold:new THREE.MeshLambertMaterial({color:0xffd55e}),roof:new THREE.MeshLambertMaterial({color:0xb65c43})};
  }
 };

}
