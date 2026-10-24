import { bombFlight } from "../blast-terrain.js?v=217";
import { RECIPES, blastDamage, advanceFuse, BOMB_FUSE, BOMB_RADIUS } from "../crafting-rules.js?v=217";
import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 5 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function placeAdventureBomb(){
 if(!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.endShown||runtime.life<=0||runtime.adventureInventory.bombs<=0)return false;
 const g=runtime.bombModel(runtime.scene),start={x:runtime.boy.position.x,y:runtime.boy.position.y+1.1,z:runtime.boy.position.z},heading=runtime.boy.rotation.y;
 g.position.set(start.x,start.y,start.z);const ring=new THREE.Mesh(new THREE.RingGeometry(BOMB_RADIUS*.96,BOMB_RADIUS,40),runtime.blastRingMat);ring.rotation.x=-Math.PI/2;ring.visible=false;runtime.scene.add(ring);
 runtime.armedBombs.push({g,ring,left:BOMB_FUSE,x:start.x,z:start.z,y:start.y,start,heading,age:0,landed:false});runtime.adventureInventory.bombs--;runtime.stopFishing();runtime.notice('💣 Бросок! 4 секунды до взрыва — уходи из круга.');runtime.hud();return true;
}

function refreshBlastSurface(){const pos=runtime.surfaceGeometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,runtime.groundSurfaceHeightAt(pos.getX(i),-pos.getY(i)));pos.needsUpdate=true;runtime.surfaceGeometry.computeVertexNormals();runtime.surfaceGeometry.computeBoundingSphere();for(const road of [runtime.roadSurface,runtime.roadEdge]){const vertices=road.geometry.attributes.position;for(let i=0;i<vertices.count;i++)vertices.setY(i,road.userData.roadLift-runtime.blastTerrain.depression(runtime.level,vertices.getX(i),vertices.getZ(i)));vertices.needsUpdate=true;road.geometry.computeVertexNormals();road.geometry.computeBoundingSphere();}runtime.syncMeadowGrass();}


function explodeAdventureBomb(b){
 const d=(x,z)=>Math.hypot(x-b.x,z-b.z),wet=runtime.waterAt(b.x,b.z);
 if(wet){for(let i=0;i<7;i++){const angle=i/7*Math.PI*2;runtime.spawnWaterSplash(b.x+Math.cos(angle)*1.5,b.z+Math.sin(angle)*1.5,3.5)}}else{runtime.blastTerrain.add(runtime.level,b.x,b.z);refreshBlastSurface();}

 const hit=blastDamage(d(runtime.boy.position.x,runtime.boy.position.z),runtime.diffCfg().playerHP);
 if(hit&&runtime.py<3){runtime.life=Math.max(0,runtime.life-hit);runtime.playerHitFeedback('bomb');runtime.notice('💥 Тимур оказался рядом со взрывом!');if(runtime.life<=0)runtime.showEnd(false)}
 if(runtime.friend?.g&&d(runtime.friend.g.position.x,runtime.friend.g.position.z)<BOMB_RADIUS){runtime.friendHP=Math.max(0,runtime.friendHP-2);if(runtime.friendHP===0){if(runtime.mountedFriend){runtime.mountedFriend=false;runtime.setRiderPose(false);runtime.py=runtime.vy=0}runtime.scene.remove(runtime.friend.g);runtime.friend=null;runtime.notice('💔 Друг попал под взрыв.')}}
 for(const f of [...runtime.foes])if(d(f.g.position.x,f.g.position.z)<BOMB_RADIUS){if(f.isBoss){f.stagger=Math.max(f.stagger||0,.6);runtime.bossRage=Math.max(.72,runtime.bossRage-.2)}else runtime.removeAdventureFoe(f,'bomb')}
 for(const obj of runtime.treeObjects)if(obj.visible&&d(obj.position.x,obj.position.z)<BOMB_RADIUS)runtime.destroyAdventureObject(obj,'tree');
 for(const obj of runtime.houseObjects)if(obj.visible&&d(obj.position.x,obj.position.z)<BOMB_RADIUS)runtime.destroyAdventureObject(obj,'house');
 for(const obj of runtime.logObstacles)if(obj.g.visible&&d(obj.g.position.x,obj.g.position.z)<BOMB_RADIUS)runtime.destroyAdventureObject(obj.g,'log');
 for(const item of [...runtime.craftWorld.items])if(item.g.visible&&d(item.g.position.x,item.g.position.z)<BOMB_RADIUS)runtime.craftWorld.remove(item);
 for(const a of runtime.apples)if(!a.done&&d(a.x,a.z)<BOMB_RADIUS){a.done=true;runtime.scene.remove(a.g)}
 runtime.disposePickupVisual(b.g);b.ring.removeFromParent();b.ring.geometry?.dispose();const flash=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshBasicMaterial({color:0xffbd70,transparent:true,opacity:.65,depthWrite:false}));flash.position.set(b.x,b.y+1,b.z);runtime.scene.add(flash);runtime.blastEffects.push({g:flash,t:0});runtime.softEffectTone(85,.42,'triangle',.04,0,40);runtime.worldEpoch++;if(runtime.sceneryBatches)runtime.sceneryEpoch=runtime.worldEpoch;runtime.hud();
}

function updateAdventureItems(dt){
 for(let i=runtime.adventurePickups.length-1;i>=0;i--){const a=runtime.adventurePickups[i];if(a.g.position.distanceTo(runtime.boy.position)>1.6)continue;runtime.adventureCollected.add(a.key);if(a.kind==='bomb')runtime.adventureInventory.bombs++;else runtime.adventureInventory.wood+=2;runtime.disposePickupVisual(a.g);runtime.adventurePickups.splice(i,1);runtime.notice(a.kind==='bomb'?'💣 Нашёл спрятанную бомбочку. G — бросить; после броска отойди!':'🪵 Нашёл обломки для крафта. Крафт — в меню паузы или C.');runtime.hud()}
 for(let i=runtime.armedBombs.length-1;i>=0;i--){const b=runtime.armedBombs[i];if(b.start&&!b.landed){b.age+=dt;const previous=b.g.position.clone(),p=bombFlight(b.start,b.heading,b.age,(x,z)=>Math.max(runtime.waterAt(x,z)?.y??runtime.terrainHeightAt(x,z),runtime.roofHeightAt(x,z))+runtime.familyFloorAt(x,z));if(!runtime.clearWallLine(previous,p)){p.x=previous.x;p.z=previous.z;p.y=runtime.waterAt(p.x,p.z)?.y??runtime.terrainHeightAt(p.x,p.z);p.landed=true;}b.x=p.x;b.z=p.z;b.y=p.y;b.landed=p.landed;b.g.position.set(p.x,p.y,p.z);b.g.rotation.y+=dt*8;if(b.landed){b.ring.position.set(p.x,p.y+.05,p.z);b.ring.visible=true;}}
 b.left=advanceFuse(b.left,dt);b.g.children[1].scale.y=.18*(.25+.75*b.left/BOMB_FUSE);if(b.left===0){runtime.armedBombs.splice(i,1);explodeAdventureBomb(b)}}
 for(let i=runtime.blastEffects.length-1;i>=0;i--){const b=runtime.blastEffects[i];b.t+=dt;b.g.scale.setScalar(.5+b.t*8);b.g.material.opacity=Math.max(0,.65-b.t);if(b.t>.65){b.g.removeFromParent();b.g.geometry.dispose();b.g.material.dispose();runtime.blastEffects.splice(i,1)}}
}

function resetAdventureItems(fresh){if(fresh){runtime.blastTerrain.clear();for(const objects of runtime.adventureDestroyed.values())for(const o of objects)o.visible=true;runtime.adventureInventory.wood=runtime.adventureInventory.bombs=runtime.adventureInventory.wool=0;runtime.adventureInventory.backpack=false;runtime.craftWorld.clear();runtime.adventureCollected.clear();runtime.adventureDestroyed.clear()}}
 return {
  bindings:{
"placeAdventureBomb":{get:()=>placeAdventureBomb},
"refreshBlastSurface":{get:()=>refreshBlastSurface},
"explodeAdventureBomb":{get:()=>explodeAdventureBomb},
"updateAdventureItems":{get:()=>updateAdventureItems},
"resetAdventureItems":{get:()=>resetAdventureItems}
  },
  initialize(){

runtime.$('bombAction').onclick=placeAdventureBomb;

runtime.$('dismountAction').onclick=runtime.dismountFriendNow;

for(const kind of Object.keys(RECIPES))runtime.$('craft-'+kind).onclick=()=>runtime.craftAdventure(kind);
  }
 };

}
