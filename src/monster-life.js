import * as T from '../vendor/three/three.module.min.js';
import {StableRoute,smoothHeading} from './navigation.js?v=222';
export const MONSTER_KINDS=Object.freeze({zombie:{hp:3,speed:1.5,scale:1,color:0x668063},screamer:{hp:2,speed:2.5,scale:.92,color:0xc2b7bf},brute:{hp:5,speed:1.25,scale:1.35,color:0x645472}});
export class MonsterLife{
 constructor(scene){this.root=new T.Group();this.root.name='cheat-monsters';scene.add(this.root);this.items=[];this.serial=0;this.level=1;this.geometry=null;this.material=null;this.dummy=new T.Object3D()}
 spawn(kind,x,y,z,level=this.level){const cfg=MONSTER_KINDS[kind];if(!cfg||this.items.filter(m=>m.level===level).length>=16)return null;
 this.geometry??=new T.BoxGeometry(1,1,1);this.material??=new T.MeshLambertMaterial({color:0xffffff});
 const mesh=new T.InstancedMesh(this.geometry,this.material,12),g=new T.Group();g.add(mesh);g.position.set(x,y,z);g.scale.setScalar(cfg.scale);mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
 for(let i=0;i<12;i++)mesh.setColorAt(i,new T.Color(i===10||i===11?0xefa25d:i===6?0x28313b:cfg.color));
 const m={id:++this.serial,kind,g,mesh,level,hp:cfg.hp,home:{x,z},route:new StableRoute({incremental:true}),time:0,cooldown:0,revealed:kind!=='screamer',hit:0,boarHit:0};this.items.push(m);this.root.add(g);g.visible=level===this.level&&m.revealed;this.pose(m,false);return m}
 remove(m){const i=this.items.indexOf(m);if(i<0)return false;m.g.removeFromParent();m.mesh.dispose();this.items.splice(i,1);return true}
 clear(kind){for(const m of [...this.items])if(!kind||m.kind===kind)this.remove(m)}
 blast(point,radius,level=this.level,clear=()=>true){let hit=0;for(const m of [...this.items]){const d=m.g.position.distanceTo(point);if(m.level===level&&d<radius&&clear(point,m.g.position)){this.strike(m,'bomb',Math.max(1,Math.ceil(5*(1-d/radius))));hit++}}return hit}
 visit(level){this.level=level;for(const m of this.items)m.g.visible=m.level===level&&m.revealed}
 strike(m,source,damage=1){if(!['boar','bomb'].includes(source)||!this.items.includes(m))return false;m.hp-=Math.max(1,Math.floor(damage));m.hit=.22;if(m.hp<=0)this.remove(m);return true}
 pose(m,moving){const d=this.dummy,walk=moving?Math.sin(m.time*9)*.45:0;
 const parts=[[0,1.15,0,.65,.85,.38,0],[-.2,.4,0,.23,.8,.25,walk],[.2,.4,0,.23,.8,.25,-walk],[-.48,1.15,.23,.22,.75,.24,-.9-walk*.3],[.48,1.15,.23,.22,.75,.24,-.9+walk*.3],[0,1.87,0,.57,.57,.5,0],[0,1.08,.205,.48,.5,.035,0],[0,1.72,.26,.28,.05,.035,0],[-.18,2.17,0,.15,.12,.2,0],[.18,2.17,0,.15,.12,.2,0],[-.14,1.95,.26,.075,.075,.04,0],[.14,1.95,.26,.075,.075,.04,0]];
 for(let i=0;i<parts.length;i++){const [x,y,z,w,h,depth,rx]=parts[i];d.position.set(x,y,z);d.scale.set(w,h,depth);d.rotation.set(rx,0,0);d.updateMatrix();m.mesh.setMatrixAt(i,d.matrix)}m.mesh.instanceMatrix.needsUpdate=true}
 update(seconds,env){let left=Math.min(1,Math.max(0,seconds));while(left>1e-8){const dt=Math.min(.05,left);left-=dt;for(const m of [...this.items]){if(m.level!==this.level)continue;m.time+=dt;m.cooldown=Math.max(0,m.cooldown-dt);m.boarHit=Math.max(0,m.boarHit-dt);m.hit=Math.max(0,m.hit-dt);const p=m.g.position,cfg=MONSTER_KINDS[m.kind],target=env.player.position||env.player,distance=Math.hypot(p.x-target.x,p.z-target.z),clear=env.clear(p,target);
 if(!m.revealed){if(distance>7||!clear)continue;m.revealed=true;m.g.visible=true;env.scare?.(m)}
 const inTerritory=m.kind!=='brute'||Math.hypot(target.x-m.home.x,target.z-m.home.z)<12,goal=distance<24&&inTerritory?target:m.home;
 let moved=false;if(Math.hypot(goal.x-p.x,goal.z-p.z)>1.3){const blocked=(x,z)=>env.blocked(x,z,.48*cfg.scale,2.2*cfg.scale),q=m.route.next(p,goal,blocked,dt,{epoch:env.epoch,step:.7});if(q){const dx=q.x-p.x,dz=q.z-p.z,len=Math.hypot(dx,dz),step=Math.min(len,cfg.speed*dt),x=p.x+dx/Math.max(.001,len)*step,z=p.z+dz/Math.max(.001,len)*step;
 if(!blocked(x,z)&&!env.occupied?.(m,x,z)){p.x=x;p.z=z;m.g.rotation.y=smoothHeading(m.g.rotation.y,Math.atan2(dx,dz),dt);moved=true}m.route.record(moved?step:0,dt)}}
 p.y=env.ground(p.x,p.z);if(distance<1.5*cfg.scale&&clear&&m.cooldown<=0){m.cooldown=3;env.damage?.(m)}m.g.rotation.z=m.hit>0?Math.sin(m.hit*40)*.08:0;this.pose(m,moved)
 }}}
}
