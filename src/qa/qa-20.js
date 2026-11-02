import * as T from '../../vendor/three/three.module.min.js';
import {HOME_SITE} from '../home-construction.js?v=222';
export function createQaPart(runtime){
 let tracked=[];
 const snapshot=()=>({items:tracked.map(i=>({kind:i.kind,exists:runtime.craftWorld.items.includes(i),visible:i.g.visible,rotation:i.g.rotation.z})),pending:runtime.pendingCraftDestruction.size,debris:runtime.craftDebris.items.length,fires:runtime.craftFires.size,shots:runtime.fireballs.length,life:runtime.life,level:runtime.level});
 function quiet(){for(const t of runtime.treeObjects)t.visible=false;for(const list of [runtime.rockPositions,runtime.mountainObstacles,runtime.lairObstacles])for(const [,,,m]of list)if(m)m.visible=false;runtime.worldEpoch++;runtime.boy.position.set(30,0,30);runtime.py=runtime.vy=0;runtime.invuln=0;runtime.paused=true}
 return{
 v225Setup(n=6){runtime.resetCheatMode();this.v222Setup(n);runtime.craftWorld.clear();runtime.fireballs.forEach(q=>q.g.removeFromParent());runtime.fireballs.length=0;quiet();tracked=[];return snapshot()},
 v225Fire(kind='house',rotation=0,dt=.05){runtime.craftWorld.clear();runtime.fireballs.forEach(q=>q.g.removeFromParent());runtime.fireballs.length=0;runtime.life=runtime.diffCfg().playerHP;runtime.invuln=0;runtime.boy.position.set(0,0,20);runtime.py=runtime.vy=0;
  const item=runtime.craftWorld.create(kind,0,0,12,runtime.level,rotation);tracked=[item];const g=new T.Group(),core=new T.Mesh(runtime.fireballAssets.coreGeometry,runtime.fireballAssets.coreMaterial),flame=new T.Mesh(runtime.fireballAssets.flameGeometry,runtime.fireballAssets.flameMaterial);g.add(core,flame);g.position.set(0,1,4);runtime.scene.add(g);runtime.fireballs.push({g,flame,a:0});
  const before=runtime.life;for(let i=0;i<Math.ceil(4/dt)&&runtime.fireballs.length;i++)runtime.updateBossFireballs(dt,i*dt*1000);runtime.updateCraftFires(.1,100);
  return{...snapshot(),blocked:runtime.fireballs.length===0,ignited:runtime.craftFires.has(item),safe:runtime.life===before};
 },
 v225Burn(seconds=48){for(let i=0;i<seconds*20;i++){runtime.updateCraftFires(.05,i*50);runtime.updateCraftDestruction(.05)}return snapshot()},
 v225Storm(){runtime.craftWorld.clear();runtime.boy.position.set(30,0,30);tracked=[runtime.craftWorld.create('house',10,0,10,runtime.level),runtime.craftWorld.create('bed',10,0,10,runtime.level),runtime.craftWorld.create('wall',15,0,15,runtime.level),runtime.craftWorld.create('table',14,0,12,runtime.level)];
  runtime.applyCheat('TORNADO');const waiting=snapshot();runtime.levelTime+=16;runtime.updateTornado(.01,performance.now());runtime.tornadoState.active=true;runtime.tornadoState.x=10;runtime.tornadoState.z=15;runtime.tornadoSweep=0;runtime.updateTornado(0,performance.now());
  return{waiting,started:snapshot(),wallSolid:runtime.craftWorld.blocked(12.3,10,0)};
 },
 v225StormStep(seconds=1.5){for(let i=0;i<seconds*20;i++)runtime.updateCraftDestruction(.05);return{...snapshot(),wallSolid:runtime.craftWorld.blocked(12.3,10,0)}},
 v225StormCancel(){runtime.tornadoState.cancel();runtime.tornadoVisual.reset();runtime.updateCraftDestruction(.05);return snapshot()},
 v225Home(){runtime.homeUnlocked=true;runtime.home.stage=3;runtime.syncHomeVisual();runtime.syncHomeLocation(3);runtime.tornadoState.active=true;runtime.tornadoState.x=HOME_SITE.x;runtime.tornadoState.z=HOME_SITE.z+5;runtime.beginCraftDestruction({g:runtime.personalHouse,kind:'house',level:3,world:true});
  const before=runtime.home.stage;runtime.updateCraftDestruction(.4);const during=runtime.home.stage;for(let i=0;i<30;i++)runtime.updateCraftDestruction(.05);return{before,during,after:runtime.home.stage,debris:runtime.craftDebris.items.length};
 },
 v225Focus(){runtime.boy.position.set(10,0,21);runtime.yaw=Math.PI;runtime.camMode=0;runtime.hemi.intensity=1.1;return snapshot()},
 v225Inspect(){return snapshot()}
 };
}
