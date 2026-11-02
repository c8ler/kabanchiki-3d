import * as T from '../../vendor/three/three.module.min.js';
import {CraftDebris} from '../craft-debris.js?v=225';
import {segmentBoxEntry} from '../projectile-impact.js?v=225';
export function createModule(runtime){
 const pendingCraftDestruction=new Map();let craftDebris,lastNotice=-100;
 function cancelCraftDestruction(root){delete root.userData.craftDestructing;runtime.sceneryEpoch=-1;const state=pendingCraftDestruction.get(root);if(!state)return;root.position.copy(state.position);root.rotation.copy(state.rotation);pendingCraftDestruction.delete(root)}
 function resetCraftDestruction(){for(const root of [...pendingCraftDestruction.keys()])cancelCraftDestruction(root);craftDebris?.clear();lastNotice=-100}
 function beginCraftDestruction(item,cause='tornado'){
  const root=item?.g;if(!root||!root.parent||!root.visible||item.living||item.level!==runtime.level||pendingCraftDestruction.has(root)||pendingCraftDestruction.size>=(runtime.mobile?2:4))return false;
  if(cause==='tornado'){
   const a=new T.Vector3(runtime.tornadoState.x,runtime.terrainHeightAt(runtime.tornadoState.x,runtime.tornadoState.z)+1,runtime.tornadoState.z),box=new T.Box3();for(const part of [...(item.solids||[]),...(item.supports||[])])box.union(part);if(box.isEmpty())box.setFromObject(root);const b=box.getCenter(new T.Vector3());
   for(const wall of [...runtime.wallGeometry(),...runtime.craftWorld.walls()])if(wall.root!==root&&segmentBoxEntry(a,b,wall.box)!==null)return false;
  }
  root.userData.craftDestructing=true;runtime.sceneryEpoch=-1;
  pendingCraftDestruction.set(root,{item,cause,age:0,position:root.position.clone(),rotation:root.rotation.clone()});
  if(runtime.levelTime-lastNotice>1){lastNotice=runtime.levelTime;runtime.notice(cause==='fire'?'🔥 Обуглившаяся постройка обрушивается!':'🌪 Постройку раскачивает торнадо! Отойди — сейчас она разрушится!')}
  return true;
 }
 function updateCraftDestruction(dt){
  for(const [root,state]of [...pendingCraftDestruction]){
   const {item}=state;
   if(state.cause==='tornado'&&runtime.tornadoState.active===false||item.level!==runtime.level||!root.parent||!root.visible||!item.world&&!runtime.craftWorld.items.includes(item)){cancelCraftDestruction(root);continue}
   state.age+=Math.max(0,dt);const k=Math.min(1,state.age/1.35),amplitude=.008+k*.032;
   root.rotation.x=state.rotation.x+Math.sin(state.age*22)*amplitude;root.rotation.z=state.rotation.z+Math.sin(state.age*17)*amplitude;root.position.y=state.position.y+Math.abs(Math.sin(state.age*25))*.035*k;
   if(k>=1){
    root.position.copy(state.position);root.rotation.copy(state.rotation);pendingCraftDestruction.delete(root);delete root.userData.craftDestructing;
    craftDebris.emit(root,state.cause,state.cause==='tornado'?runtime.tornadoState:null);
    if(item.world)runtime.destroyAdventureObject(root,item.kind,state.cause);else runtime.craftWorld.remove(item);
    runtime.worldEpoch++;runtime.wallCacheEpoch=-1;
   }
  }
  craftDebris.update(dt,runtime.terrainHeightAt);
 }
 return{bindings:{pendingCraftDestruction:{get:()=>pendingCraftDestruction},craftDebris:{get:()=>craftDebris},beginCraftDestruction:{get:()=>beginCraftDestruction},updateCraftDestruction:{get:()=>updateCraftDestruction},cancelCraftDestruction:{get:()=>cancelCraftDestruction},resetCraftDestruction:{get:()=>resetCraftDestruction}},initialize(){craftDebris=new CraftDebris(runtime.scene,{mobile:runtime.mobile})}}
}
