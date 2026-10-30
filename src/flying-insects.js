import * as T from '../vendor/three/three.module.min.js';
export const INSECT_KINDS=['bee','mosquito','butterfly'],INSECT_HIT_GAP=45;
export class FlyingInsects{
 constructor(scene,{seed=22217}={}){this.seed=seed;this.root=new T.Group();scene.add(this.root);this.items=[];this.serial=0;this.level=1;this.time=0;this.nextBite=20;this.assets=null;this.dummy=new T.Object3D()}
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296}
 ready(){if(this.assets)return;const sphere=new T.SphereGeometry(1,6,4),box=new T.BoxGeometry(1,1,1),material=new T.MeshLambertMaterial({color:0xffffff}),wing=new T.MeshBasicMaterial({color:0xd6e8ef,transparent:true,opacity:.55,depthWrite:false,side:T.DoubleSide});this.assets={};
 for(const kind of INSECT_KINDS){const body=new T.InstancedMesh(sphere,material,16*5),wings=new T.InstancedMesh(box,kind==='butterfly'?material:wing,16*4);body.count=wings.count=0;body.frustumCulled=wings.frustumCulled=false;body.instanceMatrix.setUsage(T.DynamicDrawUsage);wings.instanceMatrix.setUsage(T.DynamicDrawUsage);
 for(let i=0;i<16*5;i++)body.setColorAt(i,new T.Color(kind==='bee'?(i%5===0||i%5===3?0x3d3430:0xe9bf43):kind==='mosquito'?0x514b48:0x645257));
 if(kind==='butterfly')for(let i=0;i<64;i++)wings.setColorAt(i,new T.Color(i%4<2?0xe4b169:0xa49ada));
 this.root.add(body,wings);this.assets[kind]={body,wings}}}
 spawn(kind,x,y,z,level=this.level,{cheat=false,life=60}={}){if(!INSECT_KINDS.includes(kind)||this.items.filter(i=>i.level===level).length>=16)return null;this.ready();const item={id:++this.serial,kind,level,cheat,life,p:new T.Vector3(x,y,z),anchor:{x,y,z},phase:this.random()*7,goal:null,think:0,touch:0,eligible:kind!=='butterfly'&&this.random()<.18,spent:false};this.items.push(item);return item}
 remove(item){const i=this.items.indexOf(item);if(i>=0)this.items.splice(i,1)}
 clear(kind,{onlyCheats=false,level=null}={}){this.items=this.items.filter(i=>(kind&&i.kind!==kind)||(onlyCheats&&!i.cheat)||(level!==null&&i.level!==level))}
 visit(level){this.level=level}
 blast(p,r,level=this.level){for(const i of [...this.items])if(i.level===level&&i.p.distanceTo(p)<r)this.remove(i)}
 update(seconds,env){let left=Math.min(1,Math.max(0,seconds));while(left>1e-8){const dt=Math.min(.05,left);left-=dt;this.time+=dt;
 for(const i of [...this.items]){if(i.level!==this.level)continue;if(!i.cheat){i.life-=dt;if(i.life<=0){this.remove(i);continue}}
 i.think-=dt;i.phase+=dt;if(i.think<=0||!i.goal){i.think=1.2+this.random()*2;const a=this.random()*Math.PI*2,r=1+this.random()*2.5,x=i.anchor.x+Math.sin(a)*r,z=i.anchor.z+Math.cos(a)*r,y=Math.max(env.ground(x,z)+.35,i.anchor.y+Math.sin(i.phase)*.5);const goal={x,y,z};if(env.clear(i.p,goal))i.goal=goal}
 const q=i.goal;if(q){const dx=q.x-i.p.x,dy=q.y-i.p.y,dz=q.z-i.p.z,len=Math.hypot(dx,dy,dz),step=Math.min(len,dt*(i.kind==='mosquito'?1.1:.75)),next={x:i.p.x+dx/Math.max(.001,len)*step,y:i.p.y+dy/Math.max(.001,len)*step,z:i.p.z+dz/Math.max(.001,len)*step};if(env.clear(i.p,next)){i.p.set(next.x,Math.max(env.ground(next.x,next.z)+.3,next.y),next.z)}else{i.goal=null;i.think=1}}
 const player=env.player,distance=Math.hypot(i.p.x-player.x,i.p.y-player.y-.9,i.p.z-player.z);i.touch=distance<1.3?i.touch+dt:0;
 const provoked=i.kind==='bee'?(distance<.55&&i.touch>.8||env.disturbed&&distance<1.6):i.kind==='mosquito'&&env.still>10&&i.touch>10;
 if(i.eligible&&!i.spent&&provoked&&this.time>=this.nextBite&&env.clear(i.p,{x:player.x,y:player.y+.9,z:player.z})){i.spent=true;if(env.damage?.(i.kind))this.nextBite=this.time+INSECT_HIT_GAP;else this.nextBite=this.time+3}
 }}}
 render(){if(!this.assets)return;for(const kind of INSECT_KINDS){const {body,wings}=this.assets[kind];let n=0;for(const i of this.items){if(i.level!==this.level)continue;const d=this.dummy,s=kind==='mosquito'?.055:kind==='bee'?.095:.065,yaw=i.goal?Math.atan2(i.goal.x-i.p.x,i.goal.z-i.p.z):0;
 for(let k=0;k<5;k++){d.position.set(i.p.x+Math.sin(yaw)*(k-2)*s*.75,i.p.y,i.p.z+Math.cos(yaw)*(k-2)*s*.75);d.rotation.set(0,yaw,0);d.scale.set(s*.75,s*.75,s);d.updateMatrix();body.setMatrixAt(n*5+k,d.matrix)}
 for(let k=0;k<4;k++){const side=k%2?1:-1,rear=k>1?-.07:.03;d.position.set(i.p.x+Math.cos(yaw)*side*s,i.p.y+.03,i.p.z-Math.sin(yaw)*side*s+rear);d.rotation.set(0,yaw,side*Math.sin(this.time*(kind==='butterfly'?10:42)+i.phase)*.85);d.scale.set(kind==='butterfly'?.22:.15,.015,kind==='butterfly'?.19:.08);d.updateMatrix();wings.setMatrixAt(n*4+k,d.matrix)}n++}
 body.count=n*5;wings.count=n*4;body.instanceMatrix.needsUpdate=wings.instanceMatrix.needsUpdate=true}}
}
