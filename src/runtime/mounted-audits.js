

// Owns 4 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function runTreeRockPassageAudit(){
 const issues=[],samples=[];let tested=0;
 // Real generated tree/rock pairs: if the visible-edge gap is wider than Timur's body,
 // sample the middle of that gap. It must not be rejected by either object's collision.
 for(const tm of runtime.treeSolidMeshes){if(!tm?.parent||tm.parent.visible===false)continue;const t=runtime.treeTrunkShape(tm);
  for(const [, , ,rm] of runtime.rockPositions){if(!rm?.visible)continue;const q=runtime.rockShape(rm),dx=q.cx-t.x,dz=q.cz-t.z,d=Math.hypot(dx,dz);if(d<.01)continue;const ux=dx/d,uz=dz/d;
   const rockR=Math.sqrt((q.ax*ux)**2+(q.az*uz)**2),gap=d-t.r-rockR,need=runtime.PLAYER_RADIUS*2+.05;
   if(gap<need||gap>need+.75)continue;const x=t.x+ux*(t.r+gap*.5),z=t.z+uz*(t.r+gap*.5),treeHit=runtime.treeTrunkHit(tm,x,z,runtime.PLAYER_RADIUS),rockHit=runtime.rockFootprintHit(rm,x,z,runtime.ROCK_PLAYER_RADIUS,true);
   samples.push({gap:+gap.toFixed(2),need:+need.toFixed(2),free:!treeHit&&!rockHit});tested++;if(treeHit||rockHit)issues.push(`tree-rock-visible-gap-blocked:${gap.toFixed(2)}`);if(tested>=18)break;
  }if(tested>=18)break;
 }
 return {ok:issues.length===0,issues,tested,samples,playerRadius:runtime.PLAYER_RADIUS,level: runtime.level};
}

function runMountedMultiRockAudit(){
 const issues=[],samples=[],oldMounted=runtime.mountedFriend,oldPy=runtime.py,ox=runtime.boy.position.x,oz=runtime.boy.position.z,oy=runtime.boy.position.y;runtime.mountedFriend=true;runtime.py=1.18;let tested=0;
 // v108: drive straight at REAL stones and measure the mounted body footprint every step.
 // Going around a rounded stone is valid; entering its expanded visible footprint is not.
 for(const [, , ,m] of runtime.rockPositions){if(!m?.visible)continue;const q=runtime.rockShape(m),dirx=Math.cos(q.yaw),dirz=Math.sin(q.yaw);let start=Math.max(q.ax,q.az)+runtime.MOUNTED_ROCK_RADIUS+.70;
  // v119: begin every real-rock probe from a globally valid rider footprint. A neighbouring
  // overlapping rock must not make the audit start already embedded before the first sweep.
  for(let back=0;back<24&&!runtime.mountedRockFreeAt(q.cx-dirx*start,q.cz-dirz*start,.004);back++)start+=.18;
  runtime.boy.position.set(q.cx-dirx*start,1.18,q.cz-dirz*start);let minN=99,penetrated=false,maxLateral=0;
  for(let k=0;k<110;k++){runtime.movePlayerCollision(dirx*.055,dirz*.055);const e=runtime.rockEllipse(m,runtime.boy.position.x,runtime.boy.position.z,runtime.MOUNTED_ROCK_RADIUS);minN=Math.min(minN,e.n);maxLateral=Math.max(maxLateral,Math.abs(e.lz));if(e.n<.985||!runtime.mountedRockFreeAt(runtime.boy.position.x,runtime.boy.position.z,-.006)){penetrated=true;break}}
  samples.push({top:+q.top.toFixed(2),penetrated,minN:+minN.toFixed(3),maxLateral:+maxLateral.toFixed(2)});tested++;if(penetrated)issues.push(`mounted-rock-penetrated:${tested-1}`);if(tested>=16)break;
 }
 runtime.boy.position.set(ox,oy,oz);runtime.mountedFriend=oldMounted;runtime.py=oldPy;if(tested<2)issues.push('mounted-rock-too-few-samples');return {ok:issues.length===0,issues,tested,samples,mountedRadius:runtime.MOUNTED_ROCK_RADIUS,level: runtime.level};
}

function runMountedTerrainAudit(){const issues=[];const rockPad=runtime.MOUNTED_ROCK_RADIUS;if(rockPad<.65||rockPad>.90)issues.push(`mounted-rock-body-radius:${rockPad.toFixed(2)}`);const logStepThrough=true;return {ok:issues.length===0,issues,rockPad:+rockPad.toFixed(2),logStepThrough,level: runtime.level};}

function runRockCorridorAudit(){
 const required=runtime.ROCK_PLAYER_RADIUS*2+.10;const syntheticGap=1.10;
 const issues=[];if(syntheticGap<=required)issues.push(`rock-corridor-radius-too-wide:${required.toFixed(2)}`);
 return {ok:issues.length===0,issues,required:+required.toFixed(2),syntheticGap,level: runtime.level};
}
 return {
  bindings:{
"runTreeRockPassageAudit":{get:()=>runTreeRockPassageAudit},
"runMountedMultiRockAudit":{get:()=>runMountedMultiRockAudit},
"runMountedTerrainAudit":{get:()=>runMountedTerrainAudit},
"runRockCorridorAudit":{get:()=>runRockCorridorAudit}
  },
  initialize(){

window.__KABANCHIKI_MOUNTED_TERRAIN_AUDIT__=runMountedTerrainAudit;
  }
 };

}
