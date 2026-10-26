import {islandHeight,islandDepth} from '../creative-island.js?v=218';
import * as THREE from "../../vendor/three/three.module.min.js";
import { riverCenterAt, riverDepthAt, lakeInletCenterAt, lakeInletDepthAt, rainFillLimit, rainFillRate, WorldSurface, lakeRadiusAt, lakeDepth } from "../world-surface.js?v=218";
import { openingStreamDepth } from "../opening-adventure.js?v=218";

// Owns 8 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function terrainHeightAt(x,z){let height=runtime.level===7?islandHeight(x,z):runtime.worldSurface.height(x,z);if(runtime.currentSeason!=='winter')for(const p of runtime.puddleObjects){if(!p.visible)continue;const r=Math.hypot(x-p.position.x,z-p.position.z)/Math.max(.01,p.scale.x);if(r<1.2){const k=Math.max(0,Math.min(1,(1.2-r)/.2));height=Math.min(height,height+(p.userData.baseY+.018-height)*k)}}if(runtime.currentSeason==='winter')for(const d of runtime.winterDrifts){const r=Math.hypot(x-d.x,z-d.z)/d.r;if(r<1)height+=d.height*Math.sqrt(1-r*r)}return height-runtime.blastTerrain.depression(runtime.level,x,z)}

function groundSurfaceHeightAt(x,z){const depth=runtime.level===7?islandDepth(x,z):runtime.level===2?Math.max(lakeDepth(x,z),lakeInletDepthAt(x,z)):runtime.level===4?riverDepthAt(x,z):0;return terrainHeightAt(x,z)-depth-puddleDepthAt(x,z)}

function rebuildWorldSurface(){
 for(const p of runtime.puddleObjects)p.visible=false;
 const zones=[];for(const t of runtime.treeObjects)if(t.visible)zones.push({x:t.position.x,z:t.position.z,r:2.0});for(const [x,z,r,m] of runtime.rockPositions)if(m.visible&&m.parent?.visible!==false)zones.push({x,z,r:r+1.0});for(const h of runtime.houseObjects)if(h.visible){const b=runtime.horizontalBounds(h);zones.push({...b,r:b.r+1.2})}for(const [x,z,r,m] of [...runtime.mountainObstacles,...runtime.lairObstacles])if(m.visible&&m.parent?.visible!==false)zones.push({x,z,r:r+1.5});
 const basins=[];for(let i=0;i<360&&basins.length<12;i++){const x=Math.sin(i*23.31+runtime.level*2.1)*37,z=Math.cos(i*7.17+runtime.level)*37,r=3.0;if(Math.abs(x)<7||basins.some(b=>Math.hypot(x-b.x,z-b.z)<7)||zones.some(q=>Math.hypot(x-q.x,z-q.z)<q.r+3.2)||(runtime.level===2&&lakeRadiusAt(x,z)<19)||(runtime.level===4&&Math.abs(z-riverCenterAt(x))<9))continue;basins.push({x,z,r})}
 runtime.worldSurface=new WorldSurface(runtime.level,zones,basins);const pos=runtime.surfaceGeometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,groundSurfaceHeightAt(pos.getX(i),-pos.getY(i)));pos.needsUpdate=true;runtime.surfaceGeometry.computeVertexNormals();runtime.surfaceGeometry.computeBoundingSphere();
 const matrix=new THREE.Matrix4();for(let i=0;i<runtime.grassCount;i++){runtime.grassBlades.getMatrixAt(i,matrix);matrix.elements[13]=.1+terrainHeightAt(matrix.elements[12],matrix.elements[14]);runtime.grassBlades.setMatrixAt(i,matrix)}runtime.grassBlades.instanceMatrix.needsUpdate=true;runtime.syncMeadowGrass();
 for(const p of runtime.puddleObjects){runtime.scene.remove(p);p.geometry.dispose();p.material.dispose()}runtime.puddleObjects.length=0;runtime.puddleRain=0;
 for(const b of basins){const y=terrainHeightAt(b.x,b.z);if(y>-.06)continue;const p=new THREE.Mesh(new THREE.CircleGeometry(1,32),new THREE.MeshPhongMaterial({color:0x91b9be,transparent:true,opacity:.62,shininess:110,specular:0xe2ffff,depthWrite:false}));p.rotation.x=-Math.PI/2;p.position.set(b.x,y+.01,b.z);p.userData.basin=b;p.userData.baseY=y;p.visible=false;runtime.scene.add(p);runtime.puddleObjects.push(p)}
}

function puddleDepthAt(x,z){let depth=0;for(const p of runtime.puddleObjects){const b=p.userData.basin,k=Math.max(0,1-Math.hypot(x-b.x,z-b.z)/Math.max(.01,p.scale.x));depth=Math.max(depth,(p.visible?.14:0)*k*k)}return depth}

function updatePuddles(dt){const cap=rainFillLimit(runtime.weatherStage),rate=rainFillRate(runtime.weatherStage);if(rate&&runtime.puddleRain<cap)runtime.puddleRain=Math.min(cap,runtime.puddleRain+dt*rate);for(const p of runtime.puddleObjects){p.visible=runtime.puddleRain>.025;p.scale.setScalar(Math.min(p.userData.basin.r*1.85,.15+runtime.puddleRain*2.8));p.position.y=p.userData.baseY+.018;p.material.opacity=Math.min(.78,.3+runtime.puddleRain*.25)}if(Math.abs(runtime.puddleRain-(updatePuddles.lastFill||0))>.025||dt===0){updatePuddles.lastFill=runtime.puddleRain;const a=runtime.surfaceGeometry.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,groundSurfaceHeightAt(a.getX(i),-a.getY(i)));a.needsUpdate=true;runtime.surfaceGeometry.computeVertexNormals()}}

function waterAt(x,z){if(runtime.level===7&&islandDepth(x,z)>.012)return {depth:islandDepth(x,z),y:.12,kind:'pond'};if(runtime.level===1&&runtime.opening&&runtime.currentSeason!=='winter'&&openingStreamDepth(x,z)>.012)return {kind:'brook',depth:openingStreamDepth(x,z),y:runtime.openingProps?.userData.brook?.position.y||.05};if(runtime.lakeDepthAt(x,z)>.012)return {kind:runtime.level===4?'river':'lake',depth:runtime.lakeDepthAt(x,z),y:runtime.level===2?.12:.035};for(const p of runtime.puddleObjects)if(p.visible&&Math.hypot(x-p.position.x,z-p.position.z)<p.scale.x*.94)return {kind:'puddle',depth:puddleDepthAt(x,z),y:p.position.y};return null}

function walkingInWater(x,z){return !!waterAt(x,z)}

function updateRiverFlow(dt){if(runtime.level===2&&runtime.currentSeason!=='winter')for(const [i,m] of runtime.tributaryFlow.entries()){m.position.x+=dt*1.2;if(m.position.x>-22)m.position.x=-46;m.position.z=lakeInletCenterAt(m.position.x)+Math.sin(i*2.7)*2.8}if(runtime.level!==4)return;for(const m of runtime.riverFlow){m.position.x+=dt*1.2;if(m.position.x>47)m.position.x=-47;m.position.z=riverCenterAt(m.position.x)+Math.sin(runtime.riverFlow.indexOf(m)*2.7)*2.8}}
 return {
  bindings:{
"terrainHeightAt":{get:()=>terrainHeightAt},
"groundSurfaceHeightAt":{get:()=>groundSurfaceHeightAt},
"rebuildWorldSurface":{get:()=>rebuildWorldSurface},
"puddleDepthAt":{get:()=>puddleDepthAt},
"updatePuddles":{get:()=>updatePuddles},
"waterAt":{get:()=>waterAt},
"walkingInWater":{get:()=>walkingInWater},
"updateRiverFlow":{get:()=>updateRiverFlow}
  },
  initialize(){

  }
 };

}
