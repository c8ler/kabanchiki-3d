import { onRiverBridge } from "../world-surface.js?v=215";
import { findGridPath } from "../navigation.js?v=215";

export function createQaPart(runtime){
 return {
v211ReunionInspect(){const meshes=[];runtime.movie?.hero.traverse(o=>{if(o.isMesh)meshes.push({visible:o.visible,opacity:o.material.opacity,position:o.position.toArray(),scale:o.scale.toArray()})});return {draws:runtime.movie?.hero.userData.qaDraws,meshes};},
v211Clock(form='boar',dt=.5){
  runtime.cinematicFinish?.();runtime.paused=true;if(form==='cat')runtime.startCatForm();else runtime.startBoarForm();const start=Math.max(runtime.catFormTime,runtime.boarFormTime);
  for(let t=0;t<30-1e-8;t+=dt)if(form==='cat')runtime.updateCatForm(Math.min(dt,30-t),performance.now());else runtime.updateBoarForm(Math.min(dt,30-t));
  const expired=Math.max(runtime.catFormTime,runtime.boarFormTime);if(form==='cat')runtime.startCatForm();else runtime.startBoarForm();const repeated=Math.max(runtime.catFormTime,runtime.boarFormTime);if(form==='cat')runtime.updateCatForm(31,performance.now());else runtime.updateBoarForm(31);
  return {start,expired,repeated,end:Math.max(runtime.catFormTime,runtime.boarFormTime)};
 },
v211Scene(n=3,kind='normal'){
  runtime.cinematicFinish?.();this.season(0);this.load(n);runtime.paused=false;runtime.started=true;runtime.win=false;runtime.endShown=false;runtime.boarFormTime=runtime.catFormTime=0;runtime.mountedFriend=false;runtime.py=runtime.vy=0;runtime.invuln=999;runtime.keys={};runtime.stick.x=runtime.stick.y=0;runtime.foes.forEach(f=>f.flee=true);
  runtime.boy.position.set(0,0,kind==='exit'?-26:12);runtime.yaw=runtime.boy.rotation.y=Math.PI;runtime.camMode=kind==='exit'?3:1;
  runtime.life=kind==='low'?1:runtime.diffCfg().playerHP-1;runtime.food=kind==='low'?0:3;runtime.yellowAppleStock=runtime.yellowMushroomStock=runtime.fishStock=0;runtime.hud(true);
  if(kind==='pickup'){runtime.food++;runtime.life=Math.min(runtime.diffCfg().playerHP,runtime.life+1);runtime.hud(true);}
  const props=n===1?runtime.openingProps:n===2?runtime.lakeExitProps:runtime.locationExitProps.get(n);
  return {version:runtime.GAME_VERSION,barrier:props?.userData.exitBarrier?.kind||'trunk',fence:props?.userData.fenceExtent,landscape:props?.userData.exitLandscape?.userData.destination,trail:props?.userData.exitLandscape?.userData.trailRange};
 },
boarRobot(n=1,season=0,fps=30,seed=208){
  this.season(season);this.load(n);runtime.paused=true;runtime.mountedFriend=false;
  for(const f of runtime.foes)runtime.scene.remove(f.g);runtime.foes.length=0;
  if(runtime.friend)runtime.scene.remove(runtime.friend.g);runtime.friend=null;
  runtime.boy.position.set(0,0,42);
  const f=runtime.makeBoar(0,10,true),issues=[],samples=[];let checks=0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const blocked=runtime.companionNavBlocked(f);
  try{
   for(let route=0;route<3;route++){
    let start,goal,path;
    for(let tries=0;tries<160;tries++){
     const a={x:random()*66-33,z:random()*60-28},b={x:random()*66-33,z:random()*60-28};
     if(blocked(a.x,a.z)||blocked(b.x,b.z)||Math.hypot(a.x-b.x,a.z-b.z)<8)continue;
     f.g.position.set(a.x,0,a.z);f.g.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);
     if(!runtime.companionValid(f))continue;
     path=findGridPath(a,b,blocked,{step:.8,bound:42,maxNodes:22000});
     if(path.length&&Math.hypot(path.at(-1).x-b.x,path.at(-1).z-b.z)<.6){start=a;goal=b;break;}
    }
    if(!start){issues.push('missing-route-'+route);continue;}
    f.route=null;let remaining=Infinity,frames=0;
    for(;frames<45*fps;frames++){
     runtime.catLife.update(1/fps,runtime.birdLife,[f]);runtime.moveBoarToward(f,goal.x,goal.z,4,1/fps);runtime.resolveBoarClearance(f,false);runtime.settleBoarOnGround(f);
     if(!runtime.companionValid(f)){issues.push('penetration-'+route);break;}
     const expected=runtime.terrainHeightAt(f.g.position.x,f.g.position.z)+Math.max(runtime.familyFloorAt(f.g.position.x,f.g.position.z),runtime.level===4&&onRiverBridge(f.g.position.x,f.g.position.z)?.28:0)-runtime.lakeDepthAt(f.g.position.x,f.g.position.z)-runtime.puddleDepthAt(f.g.position.x,f.g.position.z);
     if(!Number.isFinite(f.g.position.y)||Math.abs(f.g.position.y-expected)>.001)issues.push('floating-'+route);
     checks++;remaining=Math.hypot(f.g.position.x-goal.x,f.g.position.z-goal.z);if(remaining<.65)break;
    }
    if(remaining>=.65)issues.push('stuck-'+route);
    samples.push({start,goal,remaining,frames,plans:f.route?.plans,position:f.g.position.toArray(),heading:f.g.rotation.y,next:f.route?.path[0],catBlocked:runtime.catLife.blocksBoar(runtime.boarBody(f),runtime.terrainHeightAt(f.g.position.x,f.g.position.z)-runtime.lakeDepthAt(f.g.position.x,f.g.position.z))});
   }
   return {level:n,season:runtime.currentSeason,fps,seed,checks,issues:[...new Set(issues)],samples};
  }finally{runtime.scene.remove(f.g);}
 },
boarExitRobot(n=3,withFriend=true,fps=30){
  this.season(0);this.load(n);runtime.paused=true;runtime.mountedFriend=false;
  for(const f of runtime.foes)runtime.scene.remove(f.g);runtime.foes.length=0;
  if(runtime.friend)runtime.scene.remove(runtime.friend.g);runtime.friend=withFriend?runtime.makeBoar(8,-27,true):null;
  const props=n===1?runtime.openingProps:n===2?runtime.lakeExitProps:runtime.locationExitProps.get(n);
  runtime.resetExitBreaker(props);runtime.boy.position.set(0,0,n===1?-30:-34);if(runtime.friend)runtime.repairCompanion(runtime.friend,true);
  const issues=[];let frames=0,maxHeight=0,done=false;
  for(;frames<30*fps;frames++){
   done=runtime.updateExitBreaker(props,1/fps,n===1?-35:-39);
   const f=props.userData.breaker;
   if(f){runtime.resolveBoarClearance(f);runtime.settleBoarOnGround(f);maxHeight=Math.max(maxHeight,Math.abs(f.g.position.y));if(!runtime.companionValid(f))issues.push('penetration');}
   if(done)break;
  }
  if(!done)issues.push('exit-never-opened');
  return {level:n,withFriend,fps,done,frames,maxHeight,position:props.userData.breaker?.g.position.toArray(),path:props.userData.breaker?.route?.path.slice(0,3),issues:[...new Set(issues)]};
 },
v207HomeReset(retry=false){this.v207BuildDoor();runtime.saveHome();runtime.endShown=retry;runtime.win=false;runtime.totalTime=123;runtime.score=42;runtime.restartGame();runtime.paused=true;const saved=JSON.parse(localStorage.getItem('kabanchiki3d_home'));const result={stage:runtime.home.stage,wood:runtime.home.wood,collected:runtime.home.collected.slice(),saved,level: runtime.level,totalTime: runtime.totalTime,score: runtime.score};this.load(3);runtime.paused=true;return {...result,floorVisible:runtime.homeParts.floor.visible,furnitureVisible:runtime.homeParts.furnishings.visible,piles:runtime.homePiles.filter(p=>p.visible).length,solid:runtime.wallGeometry().filter(w=>w.root===runtime.personalHouse).length};}
 };
}
