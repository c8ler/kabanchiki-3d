import { BlastTerrain } from "../blast-terrain.js?v=216";
import * as THREE from "../../vendor/three/three.module.min.js";
import { riverCenterAt, riverDepthAt, lakeInletCenterAt, lakeInletHalfWidthAt, lakeInletDepthAt, WorldSurface, lakePointAt, lakeDepth } from "../world-surface.js?v=216";

// Owns 41 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let riverVisual,riverMat,tributaryWater,tributaryBed,tributaryFlow,rv,ri,riverGeo,riverWater,riverFlow,bridgeWood,fordSign,fordLabel,lakeWaves,shoreIndices,shorePositions,shoreIndex,lakeColors,lakePositions,underwaterMat,lakeBed,riverBedGeo,bedPositions,rb,rbi,bedGeo,riverBed,aquaticRoots,aquaticFish,aquaticWeeds,blastTerrain,winterDrifts,winterSnowMinute,worldSurface,puddleRain,puddleObjects,surfaceGeometry;

function tributaryGeometry(bed=false){const vertices=[],uv=[],indices=[],segments=96,across=12;for(let i=0;i<=segments;i++){const x=-46+i*.25,c=lakeInletCenterAt(x),w=lakeInletHalfWidthAt(x);for(let j=0;j<=across;j++){const z=c-w+j/across*w*2;vertices.push(x,bed?-Math.max(lakeDepth(x,z),lakeInletDepthAt(x,z))+.022:.12,z);uv.push(x*.16,z*.16);if(i<segments&&j<across){const a=i*(across+1)+j,b=a+across+1;if(bed||lakeDepth(x,z)<.015)indices.push(a,b,a+1,a+1,b,b+1)}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g}

function deformLakeDisk(geometry){const p=geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=-p.getY(i),radius=Math.hypot(x,z),q=lakePointAt(Math.atan2(z,x),radius);p.setXY(i,q.x+18,-(q.z+17))}p.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere()}



function lakeSurfaceGeometry(bed=false){const vertices=[],indices=[],segments=80,rings=16;for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const p=lakePointAt(i/segments*Math.PI*2,13.6*j/rings);vertices.push(p.x+18,bed?-Math.max(lakeDepth(p.x,p.z),lakeInletDepthAt(p.x,p.z))+.022:0,p.z+17);if(j<rings&&i<segments){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(vertices.flatMap((v,i)=>i%3===0?[v*.15,vertices[i+2]*.15]:[]),2));g.setIndex(indices);g.computeVertexNormals();return g}

function updateAquaticLife(dt,now){for(const f of aquaticFish){if(f.level!==runtime.level)continue;f.phase+=dt*f.speed;let x,z,nx,nz;if(runtime.level===2&&f.tributary){f.x+=dt*1.1;if(f.x<-45||f.x>-27)f.x=-45;x=f.x;z=lakeInletCenterAt(x)+Math.sin(f.phase)*1.4;nx=x+.2;nz=lakeInletCenterAt(nx)+Math.sin(f.phase+.01)*1.4}else if(runtime.level===2){const p=lakePointAt(f.phase,f.radius),n=lakePointAt(f.phase+.02,f.radius);x=p.x;z=p.z;nx=n.x;nz=n.z}else{f.x+=dt*(1.0+(f.radius-5)*.15);if(f.x>42)f.x=-42;x=f.x;z=riverCenterAt(x)+Math.sin(f.phase)*1.4;nx=x+.2;nz=riverCenterAt(nx)+Math.sin(f.phase+.01)*1.4}const d=runtime.level===2?Math.max(lakeDepth(x,z),lakeInletDepthAt(x,z)):riverDepthAt(x,z);f.g.position.set(x,-Math.min(.72,d*.58),z);f.g.visible=d>.25;f.g.rotation.y=Math.atan2(nx-x,nz-z);f.tail.rotation.z=Math.sin(now*.012+f.phase)*.22}for(const w of aquaticWeeds)if(w.level===runtime.level)w.g.rotation.z=Math.sin(now*.0015+w.phase)*.13}
 return {
  bindings:{
"tributaryGeometry":{get:()=>tributaryGeometry},
"riverVisual":{get:()=>riverVisual},
"riverMat":{get:()=>riverMat},
"tributaryWater":{get:()=>tributaryWater},
"tributaryBed":{get:()=>tributaryBed},
"tributaryFlow":{get:()=>tributaryFlow},
"rv":{get:()=>rv},
"ri":{get:()=>ri},
"riverGeo":{get:()=>riverGeo},
"riverWater":{get:()=>riverWater},
"riverFlow":{get:()=>riverFlow},
"bridgeWood":{get:()=>bridgeWood},
"fordSign":{get:()=>fordSign},
"fordLabel":{get:()=>fordLabel},
"lakeWaves":{get:()=>lakeWaves},
"deformLakeDisk":{get:()=>deformLakeDisk},
"shoreIndices":{get:()=>shoreIndices},
"shorePositions":{get:()=>shorePositions},
"shoreIndex":{get:()=>shoreIndex},
"lakeSurfaceGeometry":{get:()=>lakeSurfaceGeometry},
"lakeColors":{get:()=>lakeColors},
"lakePositions":{get:()=>lakePositions},
"underwaterMat":{get:()=>underwaterMat},
"lakeBed":{get:()=>lakeBed},
"riverBedGeo":{get:()=>riverBedGeo},
"bedPositions":{get:()=>bedPositions},
"rb":{get:()=>rb},
"rbi":{get:()=>rbi},
"bedGeo":{get:()=>bedGeo},
"riverBed":{get:()=>riverBed},
"aquaticRoots":{get:()=>aquaticRoots},
"aquaticFish":{get:()=>aquaticFish},
"aquaticWeeds":{get:()=>aquaticWeeds},
"updateAquaticLife":{get:()=>updateAquaticLife},
"blastTerrain":{get:()=>blastTerrain},
"winterDrifts":{get:()=>winterDrifts},
"winterSnowMinute":{get:()=>winterSnowMinute,set:value=>{winterSnowMinute=value}},
"worldSurface":{get:()=>worldSurface,set:value=>{worldSurface=value}},
"puddleRain":{get:()=>puddleRain,set:value=>{puddleRain=value}},
"puddleObjects":{get:()=>puddleObjects},
"surfaceGeometry":{get:()=>surfaceGeometry}
  },
  initialize(){

/* init:const */ riverVisual = new THREE.Group();

runtime.scene.add(riverVisual);

runtime.biomeMesh(riverVisual,4);

/* init:const */ riverMat = new THREE.MeshPhongMaterial({color:0x4d9eaf,transparent:true,opacity:.48,depthWrite:false,shininess:100,specular:0xc8efff});

/* init:const */ tributaryWater = new THREE.Mesh(tributaryGeometry(),riverMat);

runtime.lakeInlet.add(tributaryWater);

/* init:const */ tributaryBed = new THREE.Mesh(tributaryGeometry(true),new THREE.MeshLambertMaterial({color:0x7d9b82,map:runtime.pixelTexture(165,[136,147,103],[75,103,87],'stone'),side:THREE.DoubleSide}));

runtime.lakeInlet.add(tributaryBed);

/* init:const */ tributaryFlow = [];

for(let i=0;i<12;i++){const x=-45+i*1.8,m=runtime.block(runtime.lakeInlet,new THREE.MeshBasicMaterial({color:0xdaf6f0,transparent:true,opacity:.3}),x,.145,lakeInletCenterAt(x)+Math.sin(i*2.7)*2.8,1.4,.012,.07);m.userData.waterFlow=true;tributaryFlow.push(m)}

/* init:const */ rv = [];
/* init:const */ ri = [];

for(let i=0;i<=92;i++){const x=-46+i,z=riverCenterAt(x);rv.push(x,.035,z-4.2,x,.035,z+4.2);if(i<92){const j=i*2;ri.push(j,j+1,j+2,j+1,j+3,j+2)}}

/* init:const */ riverGeo = new THREE.BufferGeometry();

riverGeo.setAttribute('position',new THREE.Float32BufferAttribute(rv,3));

riverGeo.setIndex(ri);

riverGeo.computeVertexNormals();

/* init:const */ riverWater = new THREE.Mesh(riverGeo,riverMat);

riverVisual.add(riverWater);

/* init:const */ riverFlow = [];

for(let i=0;i<38;i++){const x=-46+i*2.4,z=riverCenterAt(x)+Math.sin(i*2.7)*2.8,m=runtime.block(riverVisual,new THREE.MeshBasicMaterial({color:0xdaf6f0,transparent:true,opacity:.3}),x,.06,z,1.4,.012,.07);riverFlow.push(m)}

/* init:const */ bridgeWood = new THREE.MeshLambertMaterial({color:0xa57845,map:runtime.mats.wood.map});

for(let z=-19;z<=-9;z+=.55)runtime.block(riverVisual,bridgeWood,0,.22,z,5.1,.12,.5);

for(const x of [-2.55,2.55]){runtime.block(riverVisual,runtime.mats.wood,x,.9,-14,.12,.12,10.5);for(const z of [-19,-16.5,-14,-11.5,-9])runtime.block(riverVisual,runtime.mats.wood,x,.52,z,.15,1.08,.15)}

for(let side of [-1,1]){let x=-41;while(x<42){x+=runtime.rand(2.3,7.5);if(Math.abs(x)<4.7||x>42)continue;const z=riverCenterAt(x)+side*runtime.rand(5.3,8.3),m=new THREE.Mesh(runtime.rockGeo,runtime.mats.stone);const rx=runtime.rand(.34,1.05),ry=runtime.rand(.28,.83),rz=runtime.rand(.4,.98);m.scale.set(rx,ry,rz);m.rotation.set(runtime.rand(-.2,.2),runtime.rand(0,6.28),runtime.rand(-.16,.16));m.position.set(x,ry*.55,z);riverVisual.add(m);runtime.rockPositions.push([x,z,Math.max(rx,rz)*.8,m]);m.userData.biomeLevel=4;runtime.biomeObjects.push(m)}}

/* init:const */ fordSign = runtime.group(28,riverCenterAt(28)+6.2);

runtime.block(fordSign,runtime.mats.wood,0,.65,0,.15,1.3,.15);

runtime.block(fordSign,runtime.mats.gold,0,1.3,0,1.1,.55,.1);

riverVisual.add(fordSign);

fordSign.userData.fallTime=0;

fordSign.userData.fallingSign=true;

runtime.signBoards.push(fordSign);

/* init:const */ fordLabel = runtime.fixedSignLabel('БРОД →');

fordLabel.position.set(0,1.3,.06);

fordLabel.scale.set(1,.45,1);

fordSign.add(fordLabel);

// Sculpt the visible shoreline from the same function used by water physics.

for(const m of [runtime.rippleA,runtime.rippleB,runtime.lakeDeepCenter,runtime.lakeAbyss])m.visible=false;

/* init:const */ lakeWaves = [];

for(let i=0;i<18;i++){const q=lakePointAt(i*2.399,4+(i%5)*1.45),pts=[];for(let j=0;j<=8;j++){const a=(j/8-.5)*1.15;pts.push(new THREE.Vector3(Math.sin(a)*.75,0,(1-Math.cos(a))*.35))}const g=new THREE.BufferGeometry().setFromPoints(pts),m=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xc8edf2,transparent:true,opacity:.19,depthWrite:false}));m.position.set(q.x,.145,q.z);runtime.lakeVisual.add(m);lakeWaves.push(m)}

for(const m of [runtime.shoreRing,runtime.rippleA,runtime.rippleB,runtime.lakeDeepCenter,runtime.lakeAbyss])deformLakeDisk(m.geometry);

/* init:const */ shoreIndices = [];
/* init:const */ shorePositions = runtime.shoreRing.geometry.attributes.position;
/* init:const */ shoreIndex = runtime.shoreRing.geometry.index;

for(let i=0;i<shoreIndex.count;i+=3){let blocked=false;for(let j=0;j<3;j++){const n=shoreIndex.getX(i+j);if(lakeInletDepthAt(shorePositions.getX(n)-18,-shorePositions.getY(n)-17)>.001)blocked=true}if(!blocked)shoreIndices.push(shoreIndex.getX(i),shoreIndex.getX(i+1),shoreIndex.getX(i+2))}

runtime.shoreRing.geometry.setIndex(shoreIndices);

runtime.lake.geometry.dispose();

runtime.lake.geometry=lakeSurfaceGeometry();

/* init:const */ lakeColors = [];
/* init:const */ lakePositions = runtime.lake.geometry.attributes.position;

for(let i=0;i<lakePositions.count;i++){const c=new THREE.Color(0x78bfcb).lerp(new THREE.Color(0x285f90),lakeDepth(lakePositions.getX(i)-18,lakePositions.getZ(i)-17)/2.4);lakeColors.push(c.r,c.g,c.b)}

runtime.lake.geometry.setAttribute("color",new THREE.Float32BufferAttribute(lakeColors,3));

runtime.waterMat.vertexColors=true;

runtime.waterMat.color.set(0xffffff);

runtime.waterMat.map=null;

runtime.lake.position.y=.12;

runtime.waterMat.transparent=true;

runtime.waterMat.opacity=.43;

runtime.waterMat.depthWrite=false;

runtime.waterMat.side=THREE.DoubleSide;

runtime.lakeDeepMat.opacity=.13;

runtime.lakeAbyssMat.opacity=.10;

/* init:const */ underwaterMat = new THREE.MeshLambertMaterial({color:0x7d9b82,map:runtime.pixelTexture(163,[136,147,103],[75,103,87],'stone'),side:THREE.DoubleSide});

/* init:const */ lakeBed = new THREE.Mesh(lakeSurfaceGeometry(true),underwaterMat);

lakeBed.position.set(-18,0,-17);

runtime.lakeVisual.add(lakeBed);

// Reposition reeds, lilies and shoreline rocks along the elongated bank.
for(const o of runtime.lakeVisual.children){if(o===lakeBed||o.isMesh)continue;const dx=o.position.x+18,dz=o.position.z+17,r=Math.hypot(dx,dz);if(r>0&&r<18){const p=lakePointAt(Math.atan2(dz,dx),r);o.position.x=p.x;o.position.z=p.z}}

for(const p of runtime.rockPositions){const m=p[3];if(m.userData.biomeLevel!==2)continue;const a=Math.atan2(m.position.z+17,m.position.x+18),q=lakePointAt(a,Math.hypot(m.position.x+18,m.position.z+17));m.position.x=p[0]=q.x;m.position.z=p[1]=q.z}

for(const o of runtime.biomeObjects)if(o.userData.biomeLevel===2&&o.isGroup){const dx=o.position.x+18,dz=o.position.z+17,p=lakePointAt(Math.atan2(dz,dx),Math.hypot(dx,dz));o.position.x=p.x;o.position.z=p.z}

/* init:const */ riverBedGeo = riverGeo.clone();
/* init:const */ bedPositions = riverBedGeo.attributes.position;

for(let i=0;i<bedPositions.count;i++)bedPositions.setY(i,-riverDepthAt(bedPositions.getX(i),bedPositions.getZ(i))+.022);
 // add centre vertices so the bed has real depth
/* init:const */ rb = [];
/* init:const */ rbi = [];

for(let i=0;i<=92;i++){const x=-46+i,c=riverCenterAt(x);for(const d of [-4.2,-2.1,0,2.1,4.2])rb.push(x,-riverDepthAt(x,c+d)+.018,c+d);if(i<92)for(let j=0;j<4;j++){const a=i*5+j,b=a+5;rbi.push(a,b,a+1,a+1,b,b+1)}}

riverBedGeo.dispose();

/* init:const */ bedGeo = new THREE.BufferGeometry();

bedGeo.setAttribute('position',new THREE.Float32BufferAttribute(rb,3));

bedGeo.setIndex(rbi);

bedGeo.computeVertexNormals();

/* init:const */ riverBed = new THREE.Mesh(bedGeo,underwaterMat);

riverVisual.add(riverBed);

riverMat.side=THREE.DoubleSide;

/* init:const */ aquaticRoots = {2:new THREE.Group(),4:new THREE.Group()};
/* init:const */ aquaticFish = [];
/* init:const */ aquaticWeeds = [];

runtime.lakeVisual.add(aquaticRoots[2]);

riverVisual.add(aquaticRoots[4]);

runtime.visualOnly(()=>{for(const lv of [2,4]){
 const root=aquaticRoots[lv],weedMat=new THREE.MeshLambertMaterial({color:0x427b5b,side:THREE.DoubleSide});
 for(let i=0;i<(runtime.mobile?35:65);i++){let x,z;if(lv===2){if(i<16){x=runtime.rand(-45,-30);z=lakeInletCenterAt(x)+runtime.rand(-2.7,2.7)}else{const p=lakePointAt(i*2.39996,runtime.rand(5,11.7));x=p.x;z=p.z}}else{x=runtime.rand(-41,41);z=riverCenterAt(x)+runtime.rand(-3,3)}const depth=lv===2?Math.max(lakeDepth(x,z),lakeInletDepthAt(x,z)):riverDepthAt(x,z);if(depth<.4)continue;const plant=new THREE.Group();plant.position.set(x,-depth+.055,z);for(let j=0;j<3;j++){const height=Math.min(depth*.7,runtime.rand(.45,1.15)),leaf=new THREE.Mesh(new THREE.PlaneGeometry(.12,height,1,3),weedMat);leaf.position.set((j-1)*.11,height/2,0);leaf.rotation.y=j*1.2;plant.add(leaf)}root.add(plant);aquaticWeeds.push({g:plant,level:lv,phase:i*.7})}
 for(let i=0;i<(runtime.mobile?7:14);i++){const g=new THREE.Group(),bodyMat=new THREE.MeshLambertMaterial({color:[0xdcaa67,0xa6cfbd,0x839fbc][i%3]}),body=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),bodyMat);body.scale.set(.7,1,2.0);g.add(body);const tail=new THREE.Mesh(new THREE.ConeGeometry(.15,.28,3),bodyMat);tail.position.z=-.36;tail.rotation.x=-Math.PI/2;g.add(tail);for(const sx of [-1,1])runtime.sphere(g,runtime.mats.black,sx*.11,.05,.19,.025);root.add(g);aquaticFish.push({g,tail,level:lv,tributary:lv===2&&i<4,phase:i*1.9,speed:runtime.rand(.12,.23),radius:runtime.rand(5.5,9.8),x:runtime.rand(-40,40)})}
}});


/* init:const */ blastTerrain = new BlastTerrain();

/* init:const */ winterDrifts = [];

/* init:let */ winterSnowMinute = -1;

/* init:let */ worldSurface = new WorldSurface(1);
/* init:let */ puddleRain = 0;

/* init:const */ puddleObjects = [];
/* init:const */ surfaceGeometry = new THREE.PlaneGeometry(96,96,96,96);

runtime.ground.geometry=surfaceGeometry;

runtime.ground.scale.set(1,1,1);

runtime.ground.rotation.x=-Math.PI/2;

runtime.ground.position.set(0,0,0);
  }
 };

}
