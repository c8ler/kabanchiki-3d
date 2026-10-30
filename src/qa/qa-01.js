import { stormClock } from "../tornado-rules.js?v=221";
import { StableRoute } from "../navigation.js?v=221";

export function createQaPart(runtime){
 return {
exitHandoverRobot(n=1,mode='near',fps=30){
  this.season(0);this.load(n);runtime.paused=true;runtime.mountedFriend=false;runtime.py=runtime.vy=0;
  for(const f of runtime.foes)runtime.scene.remove(f.g);runtime.foes.length=0;
  if(runtime.friend)runtime.scene.remove(runtime.friend.g);
  const z=n===1?-35:-39,pz=n===1?-31:-34;
  runtime.boy.position.set(0,0,pz);runtime.friend=runtime.makeBoar(.6,pz+1.2,true);runtime.friend.g.rotation.y=Math.PI;
  const props=n===1?runtime.openingProps:n===2?runtime.lakeExitProps:runtime.locationExitProps.get(n);runtime.resetExitBreaker(props);
  runtime.levelBoarsDone=runtime.levelBoarsTotal;runtime.levelFamilyDone=runtime.levelFamilyTotal;
  runtime.friendYield.reset();runtime.friendYieldOwner=runtime.friend;runtime.friendYieldActive=false;
  if(mode==='mounted'){runtime.friend.g.position.set(0,0,pz);runtime.mountedFriend=true;runtime.py=runtime.riderSeatHeight();runtime.boy.position.y=runtime.py;runtime.setRiderPose(true)}
  runtime.friend.route=new StableRoute({incremental:true});
  runtime.friend.route.next({x:runtime.friend.g.position.x,z:runtime.friend.g.position.z},{x:0,z:pz},()=>false,1/fps);
  const oldRoute=runtime.friend.route;
  let oldRouteRetained=false,activeYield=0,frames=0,done=false,reversals=0,previous=null,maxStep=0;
  const issues=[];
  for(;frames<20*fps;frames++){
   runtime.boarCollisionEpoch++;
   const before={x:runtime.friend.g.position.x,z:runtime.friend.g.position.z};
   if(mode==='blocking'&&frames>fps/2&&frames<fps*2){
    const tx=props.userData.approachX??2.5,step=Math.sign(tx-runtime.boy.position.x)*Math.min(.1,Math.abs(tx-runtime.boy.position.x));
    if(!runtime.playerWorldBlocked(runtime.boy.position.x+step,runtime.boy.position.z)&&!runtime.boarPlayerContact(runtime.friend,runtime.friend.g.position.x,runtime.friend.g.position.z,runtime.friend.g.rotation.y,runtime.boy.position.x+step,runtime.boy.position.z))runtime.boy.position.x+=step;
   }
   if(n===1)runtime.updateOpeningAdventure(1/fps);else if(n===2)runtime.updateLakeExit(1/fps);else runtime.updateLocationExit(1/fps);
   if(frames===0)oldRouteRetained=runtime.friend.route===oldRoute;
   runtime.updateFriendYield(0,mode==='standing'?0:-1,1/fps);
   if(runtime.friend.exitBreaking&&runtime.friendYieldActive)activeYield++;
   runtime.resolveBoarClearance(runtime.friend);runtime.repairCompanion(runtime.friend);runtime.settleBoarOnGround(runtime.friend);
   const dx=runtime.friend.g.position.x-before.x,dz=runtime.friend.g.position.z-before.z,d=Math.hypot(dx,dz);maxStep=Math.max(maxStep,d);
   if(d>.01){if(previous&&dx*previous.x+dz*previous.z<-.5*d*previous.d)reversals++;previous={x:dx,z:dz,d}}
   done=n===1?runtime.opening.passageOpen:n===2?runtime.lakeExitReady():runtime.locationExitReady();
   if(done)break;
  }
  if(!done)issues.push('exit-never-opened');
  if(activeYield)issues.push('competing-yield-controller');
  if(oldRouteRetained)issues.push('old-route-retained-on-handover');
  return {level:n,mode,fps,done,frames,seconds:frames/fps,activeYield,oldRouteRetained,reversals,maxStep,position:runtime.friend.g.position.toArray(),goal:runtime.friend.route?.goal,issues};
 },
v214Mounted(n=3){
  this.v212Setup(n);for(const f of runtime.foes)runtime.scene.remove(f.g);runtime.foes.length=0;if(runtime.friend)runtime.scene.remove(runtime.friend.g);runtime.friend=runtime.makeBoar(0,20,true);runtime.friend.g.rotation.y=0;runtime.boy.position.set(0,0,20);runtime.friendHP=runtime.diffCfg().playerHP;runtime.mountedFriend=false;const ok=runtime.mountFriendNow(true);runtime.paused=false;runtime.hud();runtime.updateAdventureHints(performance.now());return {ok,mounted:runtime.mountedFriend};
 },
v214MountInspect(){return {mounted:runtime.mountedFriend,py: runtime.py,vy: runtime.vy,x:runtime.boy.position.x,z:runtime.boy.position.z,friendX:runtime.friend?.g.position.x,friendZ:runtime.friend?.g.position.z,distance:runtime.friend?Math.hypot(runtime.boy.position.x-runtime.friend.g.position.x,runtime.boy.position.z-runtime.friend.g.position.z):0,blocked:runtime.playerWorldBlocked(runtime.boy.position.x,runtime.boy.position.z),latched:runtime.dismountLatch.active};},
v214Clock(seconds,n=3){this.v212Setup(n);runtime.levelTime=seconds;runtime.hud();runtime.adventureHud.active(true);runtime.adventureHud.active(true);return {hidden:runtime.$('stormMeter').hidden,clock:stormClock(seconds,n)};},
v214Menu(id='pauseMenu'){
  if(!runtime.paused||runtime.level!==3)this.v212Setup(3);for(const name of ['intro','pauseMenu','difficultyScreen','familyPopup','endScreen','statsScreen'])runtime.$(name).style.display='none';
  if(id==='pauseMenu'){runtime.setPause(true);for(const d of runtime.$('pauseMenu').querySelectorAll('details'))d.open=true}
  else {runtime.$(id).style.display='grid';if(id==='statsScreen'){const before=localStorage.getItem('kabanchiki3d_results');localStorage.setItem('kabanchiki3d_results',JSON.stringify(Array.from({length:20},(_,i)=>({name:'ДлинноеИмяИгрока12345',score:999999,time:99999,win:i%2===0}))));runtime.$('statsTable').innerHTML=runtime.localStatsHtml();if(before===null)localStorage.removeItem('kabanchiki3d_results');else localStorage.setItem('kabanchiki3d_results',before);}if(id==='familyPopup'){runtime.$('familyTitle').textContent='Семья найдена!';runtime.$('familyText').textContent='Тимур, наконец-то ты пришёл! Мы так долго тебя ждали.'}}
  return true;
 },
v214MinionSwarm(fps=30){
  this.v212Setup(6);if(runtime.friend){runtime.scene.remove(runtime.friend.g);runtime.friend=null}runtime.boy.position.set(0,0,0);
  const minions=[];for(let k=0;k<4;k++){const m=runtime.makeBoar(0,0,false);m.isMinion=true;const q=runtime.minionSpawnPoint(m,Math.PI+(k-1.5)*.14);if(!q){runtime.scene.remove(m.g);continue}m.g.position.set(q.x,0,q.z);m.g.rotation.y=Math.atan2(-q.x,-q.z);runtime.foes.push(m);minions.push({m,previous:null,stalled:0,longest:0,reversals:0,penetrations:0})}
  for(let i=0;i<fps*30;i++){runtime.boarCollisionEpoch++;for(const a of minions){const m=a.m,before={x:m.g.position.x,z:m.g.position.z};if(Math.hypot(before.x,before.z)<7)continue;runtime.moveBoarToward(m,0,0,2.1,1/fps);runtime.resolveBoarClearance(m);runtime.settleBoarOnGround(m);const dx=m.g.position.x-before.x,dz=m.g.position.z-before.z,d=Math.hypot(dx,dz);a.stalled=d<.002?a.stalled+1/fps:0;a.longest=Math.max(a.longest,a.stalled);if(runtime.boarSceneryBlockedAt(m,m.g.position.x,m.g.position.z))a.penetrations++;if(d>.008){if(a.previous&&a.previous.x*dx+a.previous.z*dz<-.5*a.previous.d*d)a.reversals++;a.previous={x:dx,z:dz,d}}}}
  return minions.map(a=>({remaining:Math.hypot(a.m.g.position.x,a.m.g.position.z),longest:a.longest,reversals:a.reversals,penetrations:a.penetrations}));
 },
v214BossLive(){this.v212Setup(6);if(runtime.friend){runtime.scene.remove(runtime.friend.g);runtime.friend=null}runtime.boy.position.set(0,0,0);runtime.bossSummon=.01;runtime.paused=false;return true;},
v214BossInspect(){return runtime.foes.filter(f=>f.isMinion).map(f=>({x:f.g.position.x,z:f.g.position.z,entering:!!f.entering,blocked:runtime.boarSceneryBlockedAt(f,f.g.position.x,f.g.position.z)}));}
 };
}
