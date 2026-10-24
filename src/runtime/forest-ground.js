import * as THREE from "../../vendor/three/three.module.min.js";
import { riverDepthAt, onRiverBridge, lakeInletDepthAt, lakeDepth } from "../world-surface.js?v=217";
import { AdaptiveQuality } from "../adaptive-quality.js?v=217";

// Owns 36 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let ground,forestGround,mossMat,darkGrassMat,pathEdgeMat,pebbleMat,roadEdge,roadSurface,forestVisual,grassBladeGeo,grassBladeMat,grassCount,grassBlades,grassDummy,meadowGrassRoot,meadowGrassGeo,meadowGrassMat,summerGrassTexture,autumnGrassTexture,meadowGrassCount,meadowGrass,meadowDummy,meadowSeeds,meadowActiveCount,meadowGrassFraction,graphicsParticleFactor,graphicsCloudFactor,adaptiveGraphics;

// v117: the central road is reserved for traversal. Solid rocks/mountains/lair props must stay outside its visible width.
function roadHalfWidthAt(z){return 2.2+Math.sin(z*.18)*.21+Math.sin(z*.51)*.09}

function roadClearForRadius(x,z,r=.4,margin=.18){return Math.abs(x)>roadHalfWidthAt(z)+r+margin}

function safeSolidScenerySpot(radius,max=40){for(let tries=0;tries<120;tries++){const x=runtime.rand(-max,max),z=runtime.rand(-max,max);if(roadClearForRadius(x,z,radius))return [x,z]}return [Math.random()<.5?-max:max,runtime.rand(-max,max)]}

function roadRibbon(extra,y,material){const vertices=[],indices=[],columns=8;for(let i=0;i<=96;i++){const z=-48+i,w=roadHalfWidthAt(z)+extra;for(let col=0;col<=columns;col++)vertices.push(-w+2*w*col/columns,y,z);if(i<96)for(let col=0;col<columns;col++){const j=i*(columns+1)+col;indices.push(j,j+columns+1,j+1,j+1,j+columns+1,j+columns+2)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(vertices.flatMap((v,i)=>i%3===0?[v*.4,vertices[i+2]*.4]:[]),2));g.setIndex(indices);g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.userData.roadLift=y;m.receiveShadow=!runtime.mobile;runtime.scene.add(m);return m}

function makeGrassTexture(palette=['#b8df83','#a9d476','#c9e795','#dbefa9']){const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');x.clearRect(0,0,16,16);const cols=palette;for(let i=0;i<18;i++){x.fillStyle=cols[i%cols.length];const bx=1+(i*7)%14,w=i%4===0?2:1,top=2+(i*5)%8;x.fillRect(bx,top,w,15-top);if(i%3===0)x.fillRect(Math.max(0,bx-1),top+3,3,2)}const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t}

function crossedGrassGeometry(){const g=new THREE.BufferGeometry(),p=[],uv=[],idx=[];for(const a of [0,Math.PI/2]){const n=p.length/3,dx=Math.cos(a)*.24,dz=Math.sin(a)*.24;p.push(-dx,0,-dz,dx,0,dz,dx,.58,dz,-dx,.58,-dz);uv.push(0,0,1,0,1,1,0,1);idx.push(n,n+1,n+2,n,n+2,n+3)}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}

function grassClumpTransform(dummy,x,z,height=1,spread=1){dummy.position.set(x,.015,z);dummy.rotation.set(runtime.rand(-.05,.05),runtime.rand(0,6.28),runtime.rand(-.06,.06));dummy.scale.set(runtime.rand(.72,1.18)*spread,runtime.rand(.72,1.32)*height,runtime.rand(.72,1.18)*spread);dummy.updateMatrix()}

function syncMeadowGrass(){
 const houses=runtime.level===3?runtime.houseObjects.filter(h=>h.visible).map(h=>new THREE.Box3().setFromObject(h)):[];
 const matrix=new THREE.Matrix4(),tint=new THREE.Color();meadowActiveCount=0;
 for(let i=0;i<meadowSeeds.length;i++){matrix.copy(meadowSeeds[i]);const x=matrix.elements[12],z=matrix.elements[14];
  if(Math.abs(x)<roadHalfWidthAt(z)+.4)continue;
  if(runtime.level===3&&x>-29.3&&x<-5.7&&Math.abs(z-31.5)<1.4)continue;
  if(runtime.level===7&&runtime.lakeDepthAt(x,z)>0)continue;
  if(runtime.level===2&&(lakeDepth(x,z)>0||lakeInletDepthAt(x,z)>0))continue;
  if(runtime.level===4&&(riverDepthAt(x,z)>0||onRiverBridge(x,z)))continue;
  if(houses.some(b=>x>b.min.x-.25&&x<b.max.x+.25&&z>b.min.z-.25&&z<b.max.z+.25))continue;
  if(runtime.rockPositions.some(q=>q[3]?.visible&&runtime.rockFootprintHit(q[3],x,z,.2,false)))continue;
  if(runtime.level===5&&runtime.mountainBlockedAt(x,z,.2))continue;
  if(runtime.level===6&&runtime.lairObstacles.some(([lx,lz,r,g])=>g.visible&&Math.hypot(x-lx,z-lz)<r+.2))continue;
  matrix.elements[13]=.015+runtime.terrainHeightAt(x,z);meadowGrass.setMatrixAt(meadowActiveCount,matrix);
  tint.setHSL(runtime.currentSeason==='autumn'?.10:.23+(i%5)*.009,.28,.80+(i%5)*.018);meadowGrass.setColorAt(meadowActiveCount,tint);meadowActiveCount++;
 }
 meadowGrassMat.map=runtime.currentSeason==='autumn'?autumnGrassTexture:summerGrassTexture;
 meadowGrass.instanceMatrix.needsUpdate=true;if(meadowGrass.instanceColor)meadowGrass.instanceColor.needsUpdate=true;
 meadowGrass.count=meadowActiveCount;meadowGrass.computeBoundingSphere();meadowGrass.count=Math.floor(meadowActiveCount*meadowGrassFraction);
 meadowGrassRoot.visible=runtime.currentSeason!=='winter';grassBlades.count=0;
 if(window.__KABANCHIKI_TEST__.graphics)window.__KABANCHIKI_TEST__.graphics.grass=meadowGrass.count;
}
 return {
  bindings:{
"roadHalfWidthAt":{get:()=>roadHalfWidthAt},
"roadClearForRadius":{get:()=>roadClearForRadius},
"safeSolidScenerySpot":{get:()=>safeSolidScenerySpot},
"ground":{get:()=>ground},
"forestGround":{get:()=>forestGround},
"mossMat":{get:()=>mossMat},
"darkGrassMat":{get:()=>darkGrassMat},
"pathEdgeMat":{get:()=>pathEdgeMat},
"pebbleMat":{get:()=>pebbleMat},
"roadRibbon":{get:()=>roadRibbon},
"roadEdge":{get:()=>roadEdge},
"roadSurface":{get:()=>roadSurface},
"forestVisual":{get:()=>forestVisual},
"makeGrassTexture":{get:()=>makeGrassTexture},
"crossedGrassGeometry":{get:()=>crossedGrassGeometry},
"grassBladeGeo":{get:()=>grassBladeGeo},
"grassBladeMat":{get:()=>grassBladeMat},
"grassClumpTransform":{get:()=>grassClumpTransform},
"grassCount":{get:()=>grassCount},
"grassBlades":{get:()=>grassBlades},
"grassDummy":{get:()=>grassDummy},
"meadowGrassRoot":{get:()=>meadowGrassRoot},
"meadowGrassGeo":{get:()=>meadowGrassGeo},
"meadowGrassMat":{get:()=>meadowGrassMat},
"summerGrassTexture":{get:()=>summerGrassTexture},
"autumnGrassTexture":{get:()=>autumnGrassTexture},
"meadowGrassCount":{get:()=>meadowGrassCount},
"meadowGrass":{get:()=>meadowGrass},
"meadowDummy":{get:()=>meadowDummy},
"meadowSeeds":{get:()=>meadowSeeds},
"meadowActiveCount":{get:()=>meadowActiveCount,set:value=>{meadowActiveCount=value}},
"meadowGrassFraction":{get:()=>meadowGrassFraction,set:value=>{meadowGrassFraction=value}},
"syncMeadowGrass":{get:()=>syncMeadowGrass},
"graphicsParticleFactor":{get:()=>graphicsParticleFactor,set:value=>{graphicsParticleFactor=value}},
"graphicsCloudFactor":{get:()=>graphicsCloudFactor,set:value=>{graphicsCloudFactor=value}},
"adaptiveGraphics":{get:()=>adaptiveGraphics}
  },
  initialize(){

/* init:const */ ground = runtime.block(runtime.scene,runtime.mats.grass,0,-.55,0,96,1,96);

ground.receiveShadow=!runtime.mobile;

/* init:const */ forestGround = new THREE.Group();

runtime.scene.add(forestGround);

/* init:const */ mossMat = new THREE.MeshLambertMaterial({color:0x568c45});
/* init:const */ darkGrassMat = new THREE.MeshLambertMaterial({color:0x477c3e});
/* init:const */ pathEdgeMat = new THREE.MeshLambertMaterial({color:0x92794e});
/* init:const */ pebbleMat = new THREE.MeshLambertMaterial({color:0x9a927e});

for(let z=-47;z<=47;z+=3)for(let x=-47;x<=47;x+=3){if(Math.abs(x)>roadHalfWidthAt(z)+.9&&Math.random()<.11)runtime.block(runtime.scene,runtime.mats.leaf2,x,-.028,z,runtime.rand(.3,.8),.055,runtime.rand(.3,.8))}

/* init:const */ roadEdge = roadRibbon(.32,.025,pathEdgeMat);
/* init:const */ roadSurface = roadRibbon(0,.05,runtime.mats.path);

for(let i=0;i<(runtime.mobile?42:90);i++){let x=runtime.rand(-43,43),z=runtime.rand(-43,43);if(Math.abs(x)<roadHalfWidthAt(z)+1.2)continue;const m=runtime.block(forestGround,i%2?mossMat:darkGrassMat,x,-.015,z,runtime.rand(.45,1.7),.035,runtime.rand(.45,1.7));m.rotation.y=runtime.rand(0,6.28)}

for(let i=0;i<(runtime.mobile?28:60);i++){const z=runtime.rand(-43,43),edge=(Math.random()<.5?-1:1)*runtime.rand(2.6,4.8);const m=new THREE.Mesh(new THREE.DodecahedronGeometry(runtime.rand(.07,.18),0),pebbleMat);m.position.set(edge,.06,z);m.scale.y=runtime.rand(.35,.75);forestGround.add(m)}


// Visual Remaster #1 — Forest. Decorative layer is separate from gameplay/collisions.
/* init:const */ forestVisual = new THREE.Group();

runtime.scene.add(forestVisual);

forestVisual.visible=true;

/* init:const */ grassBladeGeo = crossedGrassGeometry();
/* init:const */ grassBladeMat = new THREE.MeshStandardMaterial({map:makeGrassTexture(),color:0xffffff,roughness:1,transparent:true,alphaTest:.32,side:THREE.DoubleSide,depthWrite:true});

/* init:const */ grassCount = runtime.mobile?650:2400;
/* init:const */ grassBlades = new THREE.InstancedMesh(grassBladeGeo,grassBladeMat,grassCount);
/* init:const */ grassDummy = new THREE.Object3D();

for(let i=0;i<grassCount;i++){const patch=i%5,px=((i*17)%23-11)*3.45,pz=((i*29)%23-11)*3.45;let x=px+runtime.rand(-2.7,2.7),z=pz+runtime.rand(-2.7,2.7);if(patch===0){x=runtime.rand(-43,43);z=runtime.rand(-43,43)}if(Math.abs(x)<3.2){x+=(x<0?-1:1)*runtime.rand(3.5,8)}
 grassClumpTransform(grassDummy,x,z,runtime.rand(.72,1.25),runtime.rand(.75,1.28));grassBlades.setMatrixAt(i,grassDummy.matrix);grassBlades.setColorAt(i,new THREE.Color().setHSL(.20+(i%5)*.012,.48,.25+(i%7)*.025))}

grassBlades.instanceMatrix.needsUpdate=true;

grassBlades.instanceColor.needsUpdate=true;

grassBlades.receiveShadow=!runtime.mobile;

forestVisual.add(grassBlades);

// v179: one evenly seeded grass layer reused across all six locations.
/* init:const */ meadowGrassRoot = new THREE.Group();

runtime.scene.add(meadowGrassRoot);

/* init:const */ meadowGrassGeo = grassBladeGeo.clone();
/* init:const */ meadowGrassMat = grassBladeMat.clone();

/* init:const */ summerGrassTexture = meadowGrassMat.map;
/* init:const */ autumnGrassTexture = makeGrassTexture(['#d8bc89','#cdb07b','#e7cd9c','#efdab2']);

/* init:const */ meadowGrassCount = grassCount;
/* init:const */ meadowGrass = new THREE.InstancedMesh(meadowGrassGeo,meadowGrassMat,meadowGrassCount);
/* init:const */ meadowDummy = new THREE.Object3D();
/* init:const */ meadowSeeds = [];

/* init:let */ meadowActiveCount = 0;
/* init:let */ meadowGrassFraction = 1;

runtime.visualOnly(()=>{const side=Math.ceil(Math.sqrt(meadowGrassCount)),cells=side*side,spacing=86/side;
 for(let i=0;i<meadowGrassCount;i++){const cell=(i*743)%cells,x=-43+((cell%side)+runtime.rand(.18,.82))*spacing,z=-43+(Math.floor(cell/side)+runtime.rand(.18,.82))*spacing;
  grassClumpTransform(meadowDummy,x,z,runtime.rand(.72,1.25),runtime.rand(.75,1.28));meadowSeeds.push(meadowDummy.matrix.clone());
 }
});

meadowGrass.receiveShadow=!runtime.mobile;

meadowGrassRoot.add(meadowGrass);


/* init:let */ graphicsParticleFactor = 1;
/* init:let */ graphicsCloudFactor = 1;

/* init:const */ adaptiveGraphics = new AdaptiveQuality({initial:1,max:runtime.mobile?2:3,onChange:runtime.applyGraphicsQuality});
  }
 };

}
