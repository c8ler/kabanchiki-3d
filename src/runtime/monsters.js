import * as T from '../../vendor/three/three.module.min.js';
import {MonsterLife} from '../monster-life.js?v=222';
export function createModule(runtime){
 let monsterLife,lastScare=-100,lastLevel=0,playerAttack=0;
 let shapeEpoch='',trunks=[];function shapes(){const key=runtime.worldEpoch+':'+runtime.level;if(key!==shapeEpoch){shapeEpoch=key;trunks=runtime.treeSolidMeshes.filter(m=>m.parent?.visible!==false).map(m=>runtime.treeTrunkShape(m))}return trunks}
 const waist=p=>new T.Vector3(p.x,p.y+.9,p.z);
 const clear=(a,b)=>runtime.clearWallLine(waist(a),waist(b));
 function blocked(x,z,r=.55,height=2.4){if(Math.abs(x)>41||Math.abs(z)>41||(runtime.waterAt(x,z)?.depth||0)>.3)return true;const y=runtime.terrainHeightAt(x,z)+runtime.familyFloorAt(x,z);if(runtime.craftWorld.blocked(x,z,y,r,height))return true;
 for(const q of runtime.wallGeometry()){const b=q.box;if(x>b.min.x-r&&x<b.max.x+r&&z>b.min.z-r&&z<b.max.z+r&&y+height>b.min.y&&y<b.max.y)return true}
 for(const q of shapes()){if(Math.hypot(x-q.x,z-q.z)<r+q.r)return true}return false}
 function spawnMonster(kind){if(!runtime.creatureRoom())return null;for(let i=0;i<12;i++){const a=runtime.yaw+(i%2?-1:1)*Math.ceil(i/2)*.35,x=runtime.boy.position.x+Math.sin(a)*5,z=runtime.boy.position.z+Math.cos(a)*5;if(blocked(x,z,.8,3))continue;return monsterLife.spawn(kind,x,runtime.terrainHeightAt(x,z)+runtime.familyFloorAt(x,z),z,runtime.level)}return null}
 function updateMonsters(dt,elapsed){monsterLife.visit(runtime.level);monsterLife.root.visible=runtime.started&&!runtime.cinematicRunning&&!runtime.endShown;if(lastLevel!==runtime.level){lastLevel=runtime.level;lastScare=-100}playerAttack=Math.max(0,playerAttack-elapsed);
 const boars=runtime.boarBodies();for(const b of boars){b.monsterFocus=null;if(b.flee||b.spiderFear>0||b.waterEscaping||b.exitBreaking)continue;const p=b.g.position,targets=monsterLife.items.filter(m=>m.level===runtime.level&&m.revealed&&Math.hypot(m.g.position.x-p.x,m.g.position.z-p.z)<9&&clear(p,m.g.position)).sort((a,c)=>p.distanceToSquared(a.g.position)-p.distanceToSquared(c.g.position)),m=targets[0];if(!m)continue;b.monsterFocus=m;b.graze=0;
 if(p.distanceTo(m.g.position)<2.5){if(m.boarHit<=0){m.boarHit=1.1;monsterLife.strike(m,'boar');b.b.rotation.x=-.2;runtime.sound(130,.1,'triangle')}}else if(!(runtime.mountedFriend&&b===runtime.friend))runtime.moveBoarToward(b,m.g.position.x,m.g.position.z,3.8,dt)}
 const player=runtime.boy.position;if(runtime.boarFormTime>0&&playerAttack<=0&&(runtime.jump||runtime.act||runtime.keys.KeyF||runtime.keys.Space)){const m=monsterLife.items.find(m=>m.level===runtime.level&&m.revealed&&m.g.position.distanceTo(player)<2.8&&clear(player,m.g.position));if(m){monsterLife.strike(m,'boar');playerAttack=1.1;runtime.notice('🐗 Удар кабанчика!')}}
 monsterLife.update(elapsed,{player:runtime.boy,epoch:runtime.worldEpoch,ground:(x,z)=>runtime.terrainHeightAt(x,z)+runtime.familyFloorAt(x,z),blocked,clear,occupied:(m,x,z)=>monsterLife.items.some(q=>q!==m&&q.level===runtime.level&&Math.hypot(q.g.position.x-x,q.g.position.z-z)<1),
 scare:()=>{if(runtime.levelTime-lastScare<25)return;lastScare=runtime.levelTime;runtime.notice('👻 Кто-то прятался за преградой! Кабанчики могут защитить Тимура.');runtime.sound(85,.22,'triangle')},
 damage:()=>{if(runtime.sandboxMode||runtime.invuln>0||runtime.cinematicRunning||runtime.endShown||runtime.life<=0)return false;runtime.life=Math.max(0,runtime.life-1);runtime.statsData.damage++;runtime.invuln=1.8;runtime.lastDeathCause='monster';runtime.playerHitFeedback('monster');runtime.hud();if(runtime.life<=0)runtime.showEnd(false);return true}});
 }
 function resetMonsters(){monsterLife.clear();for(const b of runtime.boarBodies())b.monsterFocus=null}
 return{bindings:{monsterLife:{get:()=>monsterLife},spawnMonster:{get:()=>spawnMonster},updateMonsters:{get:()=>updateMonsters},resetMonsters:{get:()=>resetMonsters}},initialize(){monsterLife=new MonsterLife(runtime.scene)}}
}
