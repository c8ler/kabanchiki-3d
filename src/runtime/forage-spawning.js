import * as THREE from "../../vendor/three/three.module.min.js";
import { riverCenterAt, lakeInletDepthAt, lakeRadiusAt } from "../world-surface.js?v=222";
import { isCatBerryRoll } from "../form-rules.js?v=222";

// Owns 9 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let BONUS_FORAGE_CHANCE,BERRY_BONUS_CHANCE;

function makeForage(type,x,z,y=0,bonus=false){const g=runtime.group(x,z);g.position.y=y+(y===0?runtime.terrainHeightAt(x,z):0);if(type==='berry'||type==='catberry'){const leaf=new THREE.MeshLambertMaterial({color:bonus?0xc6b42c:0x3f8b45}),berry=new THREE.MeshLambertMaterial({color:type==='catberry'?0xff86c5:bonus?0xffe33b:0x4d3ca6});runtime.block(g,leaf,0,.16,0,.65,.22,.65);for(const [bx,bz] of [[-.22,-.12],[.18,-.18],[-.12,.18],[.24,.16]])runtime.sphere(g,berry,bx,.34,bz,.13)}else{const model=runtime.makeFoodModel(type,g,0,.30,0);model.scale.setScalar(1.25);if(bonus)model.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();if(o.material.color)o.material.color.set(type==='apple'?0xffdc32:0xffe13b)}})}if(bonus){const glow=runtime.makeEffectLight(0xffdf45,3.5,4);glow.position.y=.55;g.add(glow)}runtime.apples.push({g,x,z,y,type,done:false,bonus:!!bonus})}

function safeForageSpot(){for(let tries=0;tries<90;tries++){const x=runtime.rand(-34,34),z=runtime.rand(-35,27);if(Math.abs(x)<3.4)continue;if(runtime.level===4&&Math.abs(z-riverCenterAt(x))<4.7)continue;if(runtime.level===2&&(lakeRadiusAt(x,z)<15.8||lakeInletDepthAt(x,z)>.001))continue;if(Math.hypot(x,z-4)<6)continue;if(runtime.level===3&&runtime.houseObjects.some(h=>{if(!h.visible)return false;const b=new THREE.Box3().setFromObject(h);return x>b.min.x-1.4&&x<b.max.x+1.4&&z>b.min.z-1.4&&z<b.max.z+1.4}))continue;if(runtime.treePositions.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<1.5))continue;if(runtime.rockPositions.some(([rx,rz,r])=>Math.hypot(x-rx,z-rz)<r+1.1))continue;return [x,z]}return [runtime.rand(-25,25),runtime.rand(-28,20)]}

function branchApplePoint(br){
 // v117: fruit twigs grow OUTWARD from the visible trunk. The apple center is beyond the trunk silhouette,
 // never buried inside the wood, while keeping the fruit low enough to collect by a normal jump.
 if(!br||br.visible===false||!br.parent)return null;const tree=br.parent;if(tree.visible===false||!tree.userData?.isTree)return null;
 tree.updateWorldMatrix(true,true);const trunk=tree.children.find(o=>o.isMesh&&o.geometry===runtime.trunkGeo),trunkR=trunk?runtime.treeTrunkShape(trunk).r:.66;
 const a=runtime.rand(0,Math.PI*2),len=runtime.rand(.62,.82),out=new THREE.Vector3(Math.cos(a),0,Math.sin(a)),twig=new THREE.Mesh(runtime.branchGeo,runtime.mats.wood);twig.userData.appleTwig=true;twig.userData.appleBranch=true;twig.userData.appleTree=tree;
 const branchY=runtime.rand(2.22,2.24),startR=trunkR+.08;twig.position.set(out.x*(startR+len*.5),branchY/tree.scale.y,out.z*(startR+len*.5));twig.scale.set(.16,len,.16);twig.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),out);
 tree.add(twig);runtime.treeBranchMeshes.push(twig);tree.updateWorldMatrix(true,true);twig.updateWorldMatrix(true,false);
 const tip=new THREE.Vector3(0,.5,0).applyMatrix4(twig.matrixWorld),appleY=tip.y-.16;
 if(appleY<2.05||appleY>2.08||(runtime.level===4&&Math.abs(tip.z-riverCenterAt(tip.x))<4.8)){tree.remove(twig);const i=runtime.treeBranchMeshes.indexOf(twig);if(i>=0)runtime.treeBranchMeshes.splice(i,1);return null}
 return [tip.x,tip.z,appleY,twig,tree]
}

function appleTreeSpot(){const candidates=[];for(const br of runtime.treeBranchMeshes){if(!br?.parent||br.userData.appleTwig||br.parent.visible===false||!br.parent.userData?.isTree)continue;br.parent.updateWorldMatrix(true,true);const wp=new THREE.Vector3();br.getWorldPosition(wp);if(Math.abs(wp.x)>35||Math.abs(wp.z)>35||Math.hypot(wp.x,wp.z-4)<7||(runtime.level===4&&Math.abs(wp.z-riverCenterAt(wp.x))<6.0))continue;candidates.push(br)}if(!candidates.length)return null;return branchApplePoint(candidates[Math.floor(Math.random()*candidates.length)])}
 // v144: yellow berries are easier to encounter
function spawnForage(type){type=type||['apple','mushroom','cabbage'][Math.floor(Math.random()*3)];if(runtime.level===2&&type==='mushroom')type='cabbage';if(type==='apple'){const spot=appleTreeSpot();if(spot){const [x,z,y,branch,tree]=spot;const bonus=Math.random()<BONUS_FORAGE_CHANCE;makeForage('apple',x,z,y,bonus);const a=runtime.apples[runtime.apples.length-1];a.branch=branch;a.tree=tree;a.g.userData.appleBranch=branch;a.g.userData.appleTree=tree;return}type=runtime.level===2?'cabbage':Math.random()<.5?'mushroom':'cabbage'}const [x,z]=safeForageSpot();if(type==='berry'&&isCatBerryRoll(Math.random())){makeForage('catberry',x,z);return}const bonus=type==='berry'?Math.random()<BERRY_BONUS_CHANCE:type==='mushroom'&&Math.random()<BONUS_FORAGE_CHANCE;makeForage(type,x,z,0,bonus)}

function seedForage(){for(const a of runtime.apples)runtime.scene.remove(a.g);runtime.apples.length=0;['apple','mushroom','cabbage','apple','mushroom','cabbage','berry','berry'].forEach((t,i)=>spawnForage(t));runtime.forageTimer=runtime.rand(14,22)}

function makeCrate(x,z,drop=false){const g=runtime.group(x,z);runtime.block(g,runtime.mats.wood,0,.45,0,1.0,.9,1.0);for(const q of [-.42,.42]){runtime.block(g,runtime.mats.gold,q,.45,.51,.08,.78,.06);runtime.block(g,runtime.mats.gold,.51,.45,q,.06,.78,.08)}runtime.block(g,runtime.mats.gold,0,.45,.52,.82,.09,.06);g.position.y=drop?12:0;runtime.crates.push({g,x,z,done:false,dropping:drop})}
 return {
  bindings:{
"makeForage":{get:()=>makeForage},
"safeForageSpot":{get:()=>safeForageSpot},
"branchApplePoint":{get:()=>branchApplePoint},
"appleTreeSpot":{get:()=>appleTreeSpot},
"BONUS_FORAGE_CHANCE":{get:()=>BONUS_FORAGE_CHANCE},
"BERRY_BONUS_CHANCE":{get:()=>BERRY_BONUS_CHANCE},
"spawnForage":{get:()=>spawnForage},
"seedForage":{get:()=>seedForage},
"makeCrate":{get:()=>makeCrate}
  },
  initialize(){

/* init:const */ BONUS_FORAGE_CHANCE = 1/20;

/* init:const */ BERRY_BONUS_CHANCE = 1/10;
  }
 };

}
