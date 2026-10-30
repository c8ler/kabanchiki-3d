import * as THREE from "../../vendor/three/three.module.min.js";
import { onRiverBridge } from "../world-surface.js?v=221";

// Owns 4 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function runBranchAppleAudit(){const issues=[],samples=[];let checked=0;for(const a of runtime.apples){if(a.done||a.type!=='apple'||a.y<=1)continue;const ok=runtime.appleOnBranch(a);samples.push({x:+a.x.toFixed(2),z:+a.z.toFixed(2),y:+a.y.toFixed(2),onBranch:ok});checked++;if(!ok)issues.push(`apple-off-branch:${a.x.toFixed(1)},${a.z.toFixed(1)}`)}return {ok:issues.length===0,issues,checked,samples,level: runtime.level};}

function runTreeTrunkAudit(){const issues=[],samples=[];for(let i=0;i<Math.min(20,runtime.treeObjects.length);i++){const g=runtime.treeObjects[i];if(!g?.visible)continue;const trunk=g.children.find(o=>o.isMesh&&o.geometry===runtime.trunkGeo);if(!trunk)continue;const t=runtime.treeTrunkShape(trunk),near=t.r+runtime.PLAYER_RADIUS+.06;const blockedInside=runtime.treeTrunkHit(trunk,t.x+t.r*.5,t.z,runtime.PLAYER_RADIUS),freeX=!runtime.treeTrunkHit(trunk,t.x+near,t.z,runtime.PLAYER_RADIUS),freeZ=!runtime.treeTrunkHit(trunk,t.x,t.z+near,runtime.PLAYER_RADIUS);samples.push({radius:+t.r.toFixed(2),blockedInside,freeX,freeZ});if(!blockedInside)issues.push(`tree-trunk-not-solid:${i}`);if(!freeX||!freeZ)issues.push(`tree-halo:${i}`)}return {ok:issues.length===0,issues,samples,level: runtime.level};}

function runReachableAppleTwigAudit(){const issues=[],samples=[];for(const a of runtime.apples){if(a.done||a.type!=='apple')continue;const twig=a.branch,tree=a.tree||a.g?.userData?.appleTree,treeVisible=!!tree&&tree.visible!==false,attached=treeVisible&&!!twig?.userData?.appleTwig&&!!twig.parent&&twig.parent===tree&&!!tree?.userData?.isTree,aboveTimur=(a.y||0)>=2.05,reachable=(a.y||0)<=2.08;let tipGap=999,on=false;if(attached){tree.updateWorldMatrix(true,true);twig.updateWorldMatrix(true,false);const tip=new THREE.Vector3(0,.46,0).applyMatrix4(twig.matrixWorld);tipGap=Math.hypot(a.x-tip.x,a.z-tip.z,(a.y+.16)-tip.y);on=tipGap<.16&&runtime.appleOnBranch(a)}samples.push({y:+(a.y||0).toFixed(2),treeVisible,attached,aboveTimur,reachable,on,tipGap:+tipGap.toFixed(3)});if(!treeVisible)issues.push('apple-hidden-tree');if(!attached)issues.push('apple-not-on-tree-twig');if(!aboveTimur)issues.push(`apple-below-child-height:${(a.y||0).toFixed(2)}`);if(!reachable)issues.push(`apple-too-high:${(a.y||0).toFixed(2)}`);if(!on)issues.push('apple-off-visible-twig')}return {ok:issues.length===0,issues,samples,level: runtime.level};}

function runBranchTraversalAudit(){
 const issues=[],samples=[];
 // Fallen branches belong to the forest. Other maps intentionally hide forestVisual, so there is
 // no branch traversal contract to test there.
 if(runtime.level!==1||!runtime.forestVisual.visible)return {ok:true,issues,tested:0,samples,level: runtime.level};
 const oldMounted=runtime.mountedFriend,oldPy=runtime.py,oldVy=runtime.vy,ox=runtime.boy.position.x,oz=runtime.boy.position.z,oy=runtime.boy.position.y;
 runtime.mountedFriend=false;runtime.py=0;runtime.vy=0;let tested=0;
 for(let bi=0;bi<runtime.logObstacles.length&&tested<8;bi++){
  const o=runtime.logObstacles[bi];if(!o?.g?.visible)continue;
  // Cross the branch ACROSS its capsule, not along its length. Try either side and only use a
  // generated sample whose approach/exit are clear of unrelated rocks/trees/world geometry.
  const c=Math.cos(o.yaw),sn=Math.sin(o.yaw),nx=-sn,nz=c,start=o.r+runtime.PLAYER_RADIUS+.42;
  let dir=0;
  for(const sg of [1,-1]){
   const sx=o.x+nx*start*sg,sz=o.z+nz*start*sg,ex=o.x-nx*start*sg,ez=o.z-nz*start*sg;
   if(!runtime.playerWorldBlocked(sx,sz)&&!runtime.playerWorldBlocked(ex,ez)){dir=sg;break}
  }
  if(!dir)continue;
  const sx=o.x+nx*start*dir,sz=o.z+nz*start*dir;
  runtime.boy.position.set(sx,0,sz);runtime.py=0;runtime.vy=0;let crossed=false,maxSupport=0,maxY=0;
  for(let k=0;k<42;k++){
   runtime.movePlayerCollision(-nx*.065*dir,-nz*.065*dir);
   if(runtime.level===4&&onRiverBridge(runtime.boy.position.x,runtime.boy.position.z)&&runtime.py<.28&&runtime.vy<=0)runtime.py=.28;
 const branchTop=runtime.branchStepHeightAt(runtime.boy.position.x,runtime.boy.position.z);maxSupport=Math.max(maxSupport,branchTop);
   // Use the same low-obstacle step-up rule as live gameplay.
   if(runtime.py<=.08&&runtime.vy<=.05&&branchTop>0){runtime.py=branchTop;runtime.vy=0}
   else if(branchTop<=0&&runtime.py>0){runtime.py=Math.max(0,runtime.py-.055)}
   runtime.boy.position.y=runtime.py;maxY=Math.max(maxY,runtime.py);
   const side=-(runtime.boy.position.x-o.x)*sn+(runtime.boy.position.z-o.z)*c;
   if(side*dir<-(o.r+runtime.PLAYER_RADIUS*.08)){crossed=true;break}
  }
  samples.push({branch:bi,crossed,maxSupport:+maxSupport.toFixed(3),maxY:+maxY.toFixed(3)});
  if(!crossed)issues.push(`foot-branch-not-crossed:${bi}`);
  if(maxSupport<=0||maxY<=0)issues.push(`foot-branch-no-bump:${bi}`);
  tested++;
 }
 runtime.mountedFriend=oldMounted;runtime.py=oldPy;runtime.vy=oldVy;runtime.boy.position.set(ox,oy,oz);
 if(tested<3)issues.push(`foot-branch-too-few-clear-samples:${tested}`);
 return {ok:issues.length===0,issues,tested,samples,level: runtime.level};
}
 return {
  bindings:{
"runBranchAppleAudit":{get:()=>runBranchAppleAudit},
"runTreeTrunkAudit":{get:()=>runTreeTrunkAudit},
"runReachableAppleTwigAudit":{get:()=>runReachableAppleTwigAudit},
"runBranchTraversalAudit":{get:()=>runBranchTraversalAudit}
  },
  initialize(){

window.__KABANCHIKI_BRANCH_APPLE_AUDIT__=runBranchAppleAudit;
  }
 };

}
