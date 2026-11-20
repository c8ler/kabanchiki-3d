// Test-only mixed-session probes. Never imported during normal startup.
export function createQaPart(runtime){
 let clock=0;
 const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z);
 function snapshot(){
  const actors=[runtime.boy,...[runtime.friend,...runtime.foes,...runtime.friends].filter(Boolean).map(b=>b.g),...runtime.craftWorld.items.map(i=>i.g)];
  const issues=[];
  if(actors.some(g=>!finite(g.position)))issues.push('non-finite-actor-position');
  for(const key of ['py','vy','life','food','levelTime','totalTime'])if(!Number.isFinite(runtime[key]))issues.push('non-finite-'+key);
  const budget=runtime.enforceCreatureLimit(true);
  if(budget.total>16)issues.push('creature-budget:'+budget.total);
  return{level:runtime.level,position:runtime.boy.position.toArray(),life:runtime.life,food:runtime.food,cinematic:runtime.cinematicRunning,end:runtime.endShown,score:runtime.score,budget,issues,
   sceneChildren:runtime.scene.children.length,craft:runtime.craftWorld.items.length,shots:runtime.shots.length,fireballs:runtime.fireballs.length,pickups:runtime.adventurePickups.length,
   memory:{...runtime.renderer.info.memory},render:{calls:runtime.renderer.info.render.calls,triangles:runtime.renderer.info.render.triangles},tier:runtime.adaptiveGraphics.tier};
 }
 return{
  releaseSetup(level=3,stress=false){
   this.v212Setup(level===7?3:level);if(level===7)runtime.enterSandbox();
   runtime.closeSecretMenu(false);runtime.$('intro').style.display=runtime.$('pauseMenu').style.display=runtime.$('secretMenu').style.display='none';
   runtime.paused=true;runtime.invuln=999;runtime.life=runtime.diffCfg().playerHP;runtime.food=runtime.foodCapacity();clock=performance.now();
   if(stress){
    for(const code of ['FRIEND','BEES','MOSQUITOES','BUTTERFLIES','SPIDERS','ZOMBIE','DOG','SPAWNCAT'])runtime.applyCheat(code);
    for(const [kind,x,z]of [['house',12,18],['wall',-6,15],['lamp',13,18],['flower',4,16]])runtime.craftWorld.create(kind,x,runtime.terrainHeightAt(x,z),z,runtime.level);
    runtime.closeSecretMenu(false);runtime.$('secretMenu').style.display='none';
   }
   runtime.paused=true;return snapshot();
  },
  releaseStep(seconds=.5,fps=30,action=0){
   const dt=1/fps,issues=[];runtime.paused=false;
   runtime.keys={KeyW:action%4===0,KeyD:action%4===1,KeyS:action%4===2,KeyA:action%4===3};runtime.jump=action%5===0;
   runtime.yaw+=action%2?.18:-.21;
   for(let i=0;i<Math.ceil(seconds*fps);i++){
    clock+=dt*1000;runtime.boarCollisionEpoch++;
    if(!runtime.cinematicRunning&&!runtime.endShown&&!runtime.win&&runtime.life>0){
     runtime.birdLife.update(dt,runtime.terrainHeightAt);
     runtime.catLife.epoch=runtime.worldEpoch;
     runtime.catLife.update(dt,runtime.birdLife,runtime.boarBodies(),runtime.boy.position,runtime.mountedFriend?runtime.friend:null,runtime.craftWorld.items.filter(i=>i.g.visible&&i.catActor).map(i=>i.catActor));
     runtime.updateSimulation(dt,clock,dt);
    }
    runtime.enforceCreatureLimit();
    if(i%10===0)issues.push(...snapshot().issues);
   }
   runtime.keys={};runtime.jump=false;runtime.paused=true;return{...snapshot(),issues:[...new Set(issues)]};
  },
  releaseInspect(){return snapshot()},
  releaseLive(on=true){runtime.keys={};runtime.jump=false;runtime.paused=!on;return snapshot()},
  releaseStorm(){runtime.tornadoState.schedule(runtime.levelTime);return snapshot()},
  releasePause(){const before=runtime.levelTime;runtime.setPause(true);return{before,...snapshot()}},
  releaseTime(){return runtime.levelTime}
 };
}
