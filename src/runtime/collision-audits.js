import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 2 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function runCollisionAudit(){
 const issues=[];
 // Every ordinary family member must be clear of solid scenery. Father is intentionally inside the enterable house.
 for(const f of runtime.familyMembers){if(runtime.level===3&&f.role===2)continue;if(runtime.worldObstacleAt(f.x,f.z,.55))issues.push(`family-in-obstacle:${f.role}`)}
 // v115: do not call an intentionally clustered mountain/lair prop "sealed" just because all
 // four cardinal samples overlap neighbouring scenery. Spawn Guard is the meaningful trap check;
 // rocks and trees are covered by geometry-aware robot audits below/after this audit.
 // Keep a bounds sanity check for environmental circles without turning valid clusters into random CI failures.
 for(const o of runtime.solidCircles().filter(o=>o.type==='mountain'||o.type==='lair'))if(!Number.isFinite(o.x)||!Number.isFinite(o.z)||!Number.isFinite(o.r)||o.r<=0)issues.push(`invalid-${o.type}-circle`);
 // Probe every visible trunk/branch: a player-sized circle at its projected box center must be blocked.
 for(const m of runtime.treeSolidMeshes){if(!m?.parent||m.parent.visible===false)continue;m.updateWorldMatrix(true,false);const b=new THREE.Box3().setFromObject(m),c=new THREE.Vector3();b.getCenter(c);if(!runtime.circleHitsTreeGeometry(c.x,c.z,runtime.PLAYER_RADIUS))issues.push(`branch-not-solid:${c.x.toFixed(1)},${c.z.toFixed(1)}`)}
 return {ok:issues.length===0,issues,obstacles:runtime.solidCircles().length,preciseRockFootprints:runtime.rockPositions.filter(([, , ,m])=>m?.visible!==false).length,treeSolids:runtime.treeSolidMeshes.filter(m=>m?.parent&&m.parent.visible!==false).length,level: runtime.level}
}

// v85: geometry-aware robot collision test with destination-clear escape probes. It tests real penetration and escape without
// treating a neighbouring obstacle or a deliberately walkable low rock as a collision bug.
function runRobotCollisionTest(){
 const issues=[],samples=[];const ox=runtime.boy.position.x,oz=runtime.boy.position.z,opy=runtime.py,ovy=runtime.vy,oy=runtime.boy.position.y;
 // v110: judge collision by the actual obstacle geometry after movement, not by total distance moved.
 // The solver is allowed to slide tangentially around a rounded obstacle, so "moved almost the full
 // requested distance" is NOT pass-through. A failure means the player penetrated or crossed to the
 // far side of the same obstacle. This uses the same trunk circle / rotated rock ellipse as gameplay.
 const run=(label,sx,sz,mx,mz,insideFn,crossFn,expectBlocked)=>{
  runtime.boy.position.set(sx,0,sz);runtime.py=0;runtime.vy=0;
  const bx=sx,bz=sz;let pathPenetrated=false,firstPenetration=null;const steps=Math.max(1,Math.ceil(Math.hypot(mx,mz)/.055));for(let i=0;i<steps;i++){const px=runtime.boy.position.x,pz=runtime.boy.position.z;runtime.movePlayerCollision(mx/steps,mz/steps);for(let j=1;j<=4;j++)if(insideFn(px+(runtime.boy.position.x-px)*j/4,pz+(runtime.boy.position.z-pz)*j/4)){pathPenetrated=true;firstPenetration??={from:{x:px,z:pz},to:{x:runtime.boy.position.x,z:runtime.boy.position.z},py: runtime.py,vy: runtime.vy};}}
  const fx=runtime.boy.position.x,fz=runtime.boy.position.z,moved=Math.hypot(fx-bx,fz-bz);
  const penetrated=insideFn(fx,fz),crossed=crossFn?crossFn(fx,fz):false,blocked=!penetrated&&!pathPenetrated;
  samples.push({label,moved:+moved.toFixed(3),blocked,penetrated,crossed,pathPenetrated,firstPenetration,start:{x:sx,z:sz},end:{x:fx,z:fz}});
  if(expectBlocked&&(penetrated||pathPenetrated))issues.push(`robot-pass-through:${label}`);
  if(!expectBlocked&&moved<Math.hypot(mx,mz)*.55)issues.push(`robot-stuck:${label}`);
  return blocked;
 };
 let ti=0;for(const m of runtime.treeSolidMeshes){if(ti>=24)break;if(!m?.parent||m.parent.visible===false)continue;
  const t=runtime.treeTrunkShape(m),edge=t.r+runtime.PLAYER_RADIUS+.10;
  const dirs=[['E',1,0],['W',-1,0],['S',0,1],['N',0,-1]];
  for(const [name,ux,uz] of dirs){
   const sx=t.x+ux*edge,sz=t.z+uz*edge;
   if(runtime.playerWorldBlocked(sx,sz)){samples.push({label:`tree${ti}-${name}-crowded`,moved:0,blocked:true,skipped:true});continue}
   const inside=(x,z)=>runtime.treeTrunkHit(m,x,z,runtime.PLAYER_RADIUS-.01);
   const crossed=(x,z)=>(x-t.x)*ux+(z-t.z)*uz<-(t.r+runtime.PLAYER_RADIUS*.35);
   run(`tree${ti}-${name}-into`,sx,sz,-ux*(edge*2+.20),-uz*(edge*2+.20),inside,crossed,true);
   const ax=sx+ux*.42,az=sz+uz*.42;
   if(!runtime.playerWorldBlocked(ax,az))run(`tree${ti}-${name}-away`,sx,sz,ux*.42,uz*.42,inside,null,false);
   else samples.push({label:`tree${ti}-${name}-away-crowded`,moved:0,blocked:true,skipped:true});
  }
  ti++
 }
 let ri=0;for(const [, , ,m] of runtime.rockPositions){if(ri>=20)break;if(!m||m.visible===false)continue;
  const q=runtime.rockShape(m),c=Math.cos(q.yaw),sn=Math.sin(q.yaw),edge=q.ax+runtime.ROCK_PLAYER_RADIUS+.10;
  const ux=c,uz=-sn,sx=q.cx+ux*edge,sz=q.cz+uz*edge;
  const inside=(x,z)=>runtime.py<q.top-.045&&runtime.rockEllipse(m,x,z,runtime.ROCK_PLAYER_RADIUS).n<.985;
  const crossed=(x,z)=>{const e=runtime.rockEllipse(m,x,z,runtime.ROCK_PLAYER_RADIUS);return e.lx<-(e.ax*.35)};
  if(!runtime.playerWorldBlocked(sx,sz)){
   run(`rock${ri}-into`,sx,sz,-ux*(edge*2+.20),-uz*(edge*2+.20),inside,crossed,true);
   const ax=sx+ux*.42,az=sz+uz*.42;
   if(!runtime.playerWorldBlocked(ax,az))run(`rock${ri}-away`,sx,sz,ux*.42,uz*.42,inside,null,false);
   else samples.push({label:`rock${ri}-away-crowded`,moved:0,blocked:true,skipped:true});
  }else samples.push({label:`rock${ri}-crowded`,moved:0,blocked:true,skipped:true});
  // Above the real top, crossing the footprint is intentionally allowed.
  runtime.boy.position.set(sx,q.top+.18,sz);runtime.py=q.top+.18;runtime.vy=0;
  const bx=runtime.boy.position.x,bz=runtime.boy.position.z,want=edge*2+.20;
  // Check other scenery along the whole flight before expecting a free crossing of this rock.
  const visible=m.visible;let corridorClear=true;m.visible=false;
  try{const count=Math.ceil(want/.1);for(let i=0;i<=count;i++)if(runtime.playerWorldBlocked(sx-ux*want*i/count,sz-uz*want*i/count)){corridorClear=false;break}}finally{m.visible=visible}
  if(!corridorClear){samples.push({label:`rock${ri}-jump-crowded`,moved:0,blocked:true,skipped:true});ri++;continue}
  runtime.movePlayerCollision(-ux*want,-uz*want);
  const jumpMoved=Math.hypot(runtime.boy.position.x-bx,runtime.boy.position.z-bz),jumpBlocked=jumpMoved<want*.65;
  samples.push({label:`rock${ri}-jump`,moved:+jumpMoved.toFixed(3),blocked:jumpBlocked});if(jumpBlocked)issues.push(`robot-jump-blocked:rock${ri}`);ri++
 }
 runtime.boy.position.set(ox,oy,oz);runtime.py=opy;runtime.vy=ovy;
 return {ok:issues.length===0,issues,samples:samples.slice(0,220),treesTested:ti,rocksTested:ri,level: runtime.level};
}
 return {
  bindings:{
"runCollisionAudit":{get:()=>runCollisionAudit},
"runRobotCollisionTest":{get:()=>runRobotCollisionTest}
  },
  initialize(){

  }
 };

}
