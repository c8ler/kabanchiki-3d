import * as T from '../../vendor/three/three.module.min.js';
import {FlyingInsects} from '../flying-insects.js?v=222';
import {FlowerField} from '../flower-field.js?v=222';
import {CraftWorld} from '../craft-world.js?v=222';
export function createModule(runtime){
 let flyingInsects,flowerField,natureFauna,lastLevel=0,flowerKey='',insectClock=22,groundClock=12,spiderClock=36,still=0,lastPosition={x:1e9,z:1e9},time=0;
 let shapeEpoch='',trunks=[];function shapes(){const key=runtime.worldEpoch+':'+runtime.level;if(key!==shapeEpoch){shapeEpoch=key;trunks=runtime.treeSolidMeshes.filter(m=>m.parent?.visible!==false).map(m=>runtime.treeTrunkShape(m))}return trunks}
 const ground=(x,z)=>runtime.terrainHeightAt(x,z)+runtime.familyFloorAt(x,z);
 function pointClear(x,z,r=.3){if(Math.abs(x)>41||Math.abs(z)>41||(runtime.waterAt(x,z)?.depth||0)>.08||runtime.familyFloorAt(x,z)>.05||runtime.craftWorld.blocked(x,z,ground(x,z),r,1))return false;for(const q of runtime.wallGeometry()){const b=q.box;if(x>b.min.x-r&&x<b.max.x+r&&z>b.min.z-r&&z<b.max.z+r)return false}for(const q of shapes()){if(Math.hypot(x-q.x,z-q.z)<q.r+r)return false}return true}
 function flightClear(a,b){if(!runtime.clearWallLine(new T.Vector3(a.x,a.y,a.z),new T.Vector3(b.x,b.y,b.z)))return false;const distance=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(distance/.25));for(let i=1;i<=n;i++){const x=a.x+(b.x-a.x)*i/n,z=a.z+(b.z-a.z)*i/n,y=a.y+(b.y-a.y)*i/n;for(const mesh of runtime.treeSolidMeshes)if(mesh.parent?.visible!==false){const q=runtime.treeTrunkShape(mesh);if(y<ground(x,z)+5&&Math.hypot(x-q.x,z-q.z)<q.r+.1)return false}}return true}
 function spawnFlying(kind,count=1,cheat=true){flyingInsects.visit(runtime.level);let made=0;for(let i=0;i<count;i++){if(!runtime.creatureRoom())break;const angle=runtime.yaw+(i-1)*.65,x=runtime.boy.position.x+Math.sin(angle)*2.7,z=runtime.boy.position.z+Math.cos(angle)*2.7,q=cheat?null:flowerField.nearest({x,z},14),px=q?.x??x,pz=q?.z??z;if(!pointClear(px,pz,.12))continue;if(flyingInsects.spawn(kind,px,ground(px,pz)+1.05,pz,runtime.level,{cheat,life:50+flyingInsects.random()*20}))made++}return made}
 function resetNature(){flyingInsects.clear();natureFauna.clear();for(const s of [...runtime.spiderLife.spiders])if(s.natural)runtime.spiderLife.remove(s);lastLevel=0;flowerKey='';insectClock=22;groundClock=12;spiderClock=36;still=0}
 function updateNature(dt,elapsed){const active=Math.min(1,Math.max(0,elapsed));time+=active;
 if(lastLevel!==runtime.level){for(const i of [...natureFauna.items])natureFauna.remove(i);for(const i of [...flyingInsects.items])if(!i.cheat)flyingInsects.remove(i);for(const s of [...runtime.spiderLife.spiders])if(s.natural)runtime.spiderLife.remove(s);lastLevel=runtime.level;insectClock=22;groundClock=12;spiderClock=36;still=0}
 flyingInsects.visit(runtime.level);const key=runtime.worldEpoch+':'+runtime.level+':'+runtime.currentSeason;if(key!==flowerKey){flowerKey=key;flowerField.reset(runtime.level,ground,(x,z)=>pointClear(x,z,.7),runtime.currentSeason)}
 flowerField.mesh.visible=runtime.started&&!runtime.cinematicRunning&&runtime.currentSeason!=='winter'&&runtime.level!==6;
 const p=runtime.boy.position;still=Math.hypot(p.x-lastPosition.x,p.z-lastPosition.z)<.025?still+active:0;lastPosition.x=p.x;lastPosition.z=p.z;
 if(runtime.currentSeason==='winter')for(const i of [...flyingInsects.items])if(!i.cheat)flyingInsects.remove(i);
 const natural=runtime.started&&!runtime.cinematicRunning&&runtime.currentSeason!=='winter'&&runtime.level!==6&&runtime.familyFloorAt(p.x,p.z)<.05;
 if(natural){insectClock-=active;groundClock-=active;spiderClock-=active;
 if(insectClock<=0){insectClock=55+flyingInsects.random()*20;if([2,4,5].includes(runtime.level))spawnFlying('mosquito',2,false);else{spawnFlying('bee',1,false);spawnFlying('butterfly',1,false)}}
 if(groundClock<=0){groundClock=65+flyingInsects.random()*30;for(const kind of ['worm','snail']){if(!runtime.creatureRoom()||natureFauna.items.length>=4)break;for(let i=0;i<10;i++){const a=flyingInsects.random()*Math.PI*2,r=3+flyingInsects.random()*5,x=p.x+Math.sin(a)*r,z=p.z+Math.cos(a)*r;if(!pointClear(x,z,.25))continue;const item=natureFauna.create(kind,x,ground(x,z),z,runtime.level);if(item)item.life=65;break}}}
 if(spiderClock<=0){spiderClock=100+flyingInsects.random()*35;if(runtime.creatureRoom()&&runtime.spiderLife.spiders.filter(s=>s.natural&&s.level===runtime.level).length<2)runtime.spawnTreeSpider()}
 }
 for(const i of [...natureFauna.items]){i.life-=active;if(i.life<=0||runtime.currentSeason==='winter')natureFauna.remove(i)}
 for(const s of [...runtime.spiderLife.spiders])if(s.natural&&s.level===runtime.level){s.life-=active;if(s.life<=0||runtime.currentSeason==='winter')runtime.spiderLife.remove(s)}
 natureFauna.update(dt,time,runtime.level,ground,(x,z)=>!pointClear(x,z,.18),p);
 flyingInsects.root.visible=runtime.started&&!runtime.cinematicRunning&&!runtime.endShown;flyingInsects.update(active,{ground,clear:flightClear,player:p,still,disturbed:runtime.throwCooldown>.3,damage:kind=>{if(runtime.sandboxMode||runtime.invuln>0||runtime.paused||runtime.cinematicRunning||runtime.endShown||runtime.life<=0)return false;runtime.life=Math.max(0,runtime.life-1);runtime.statsData.damage++;runtime.invuln=1.5;runtime.lastDeathCause=kind;runtime.playerHitFeedback(kind);runtime.notice(kind==='bee'?'🐝 Пчела ужалила! Лучше не тревожить её.':'🦟 Укус комарика. Продолжай двигаться.');runtime.hud();if(runtime.life<=0)runtime.showEnd(false);return true}});
 }
 return{bindings:{flyingInsects:{get:()=>flyingInsects},flowerField:{get:()=>flowerField},natureFauna:{get:()=>natureFauna},spawnFlying:{get:()=>spawnFlying},resetNature:{get:()=>resetNature},updateNature:{get:()=>updateNature}},initialize(){flyingInsects=new FlyingInsects(runtime.scene);flowerField=new FlowerField(runtime.scene,{mobile:runtime.mobile});natureFauna=new CraftWorld(runtime.scene,runtime.mats,{});natureFauna.canCreateCreature=()=>runtime.creatureRoom()}}
}
