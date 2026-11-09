import * as T from '../vendor/three/three.module.min.js';
// All moving figures and the wagon share two instanced draws. Reused between visits.
export function createCaravanVisual(scene){
 const root=new T.Group(),rig=new T.Group();root.add(rig);scene.add(root);root.visible=false;
 const parts=[],wheels=[],people=[],legs=[],loot=[],puller=new T.Group();rig.add(puller);
 const colors={wood:0x82522f,dark:0x332b29,cloth:0xf1ddaa,red:0x9f4136,skin:0xdab18b,blue:0x416b88,gold:0xdeb044,pink:0xcf8a78,white:0xe9e0ca,boar:0x79564a};
 const box=(parent,color,x,y,z,sx,sy,sz)=>{const g=new T.Object3D();g.position.set(x,y,z);g.scale.set(sx,sy,sz);parent.add(g);parts.push({g,color:colors[color]||color});return g};
 const wagon=new T.Group();rig.add(wagon);
 box(wagon,'wood',0,.82,0,2.1,.25,3.5);
 for(const x of [-1.05,1.05]){box(wagon,'wood',x,1.22,0,.14,.8,3.6);for(const z of [-1.5,1.5])box(wagon,'wood',x,2,z,.1,1.8,.1)}
 for(const z of [-1.7,1.7])box(wagon,'wood',0,1.22,z,2.1,.8,.14);
 box(wagon,'cloth',0,2.92,0,1.25,.16,3.7);
 for(const x of [-.86,.86]){const a=box(wagon,'cloth',x,2.62,0,.82,.16,3.7);a.rotation.z=x>0?-.7:.7}
 for(const z of [-1.3,0,1.3])box(wagon,'red',0,3.02,z,1.25,.025,.23);
 box(wagon,'wood',0,.6,2.6,.12,.12,2.2);box(wagon,'wood',0,1.3,1.5,1.8,.16,.5);
 const lid=new T.Group();lid.position.set(0,1.4,-1);wagon.add(lid);box(lid,'gold',0,0,.5,1.35,.16,1.1);box(wagon,'dark',0,1.3,-.5,1.4,.7,1.2);
 const wheelRig=new T.Group();rig.add(wheelRig);
 for(const x of [-1.22,1.22])for(const z of [-1.1,1.1]){const g=new T.Object3D();g.position.set(x,.55,z);g.rotation.z=Math.PI/2;wheelRig.add(g);wheels.push(g)}
 box(puller,'boar',0,.62,0,1,.8,1.5);box(puller,'boar',0,.81,.73,.82,.75,.65);box(puller,'pink',0,.66,1.12,.62,.32,.15);
 for(const x of [-.29,.29]){box(puller,'dark',x,1,.99,.07,.09,.03);box(puller,'boar',x,1.28,.52,.18,.3,.14);box(puller,'white',x,.56,.98,.12,.25,.14)}
 for(const x of [-.32,.32])for(const z of [-.49,.48]){const g=new T.Group();g.position.set(x,.42,z);puller.add(g);box(g,'boar',0,-.15,0,.22,.38,.25);legs.push({g,phase:z<0?Math.PI:0})}
 box(puller,'red',0,1,0,1.04,.1,.3);
 const human=(color,seated=false)=>{
  const g=new T.Group();rig.add(g);g.scale.setScalar(seated?.62:.72);
  box(g,color,0,1.18,0,.7,.86,.4);box(g,'skin',0,1.96,0,.58,.6,.55);box(g,'dark',0,2.3,0,.74,.12,.68);
  for(const x of [-.14,.14])box(g,'dark',x,2.02,.29,.055,.07,.03);
  const moving=[];for(const x of [-.2,.2]){const leg=new T.Group();leg.position.set(x,.8,0);g.add(leg);box(leg,'dark',0,-.38,0,.25,.76,.3);if(seated)leg.rotation.x=-1.3;moving.push(leg)}
  for(const x of [-.48,.48])box(g,'skin',x,1.25,0,.18,.65,.18);
  if(!seated){box(g,'gold',-.56,1.15,.12,.52,.73,.16);box(g,'dark',-.56,1.15,.21,.08,.65,.025);box(g,'wood',.64,1.2,0,.09,1.65,.09)}
  return{g,legs:moving,seated};
 };
 people.push(human('red'),human('blue'),human('blue',true));
 for(let i=0;i<3;i++){const g=new T.Group();rig.add(g);box(g,i===0?'red':i===1?'wood':'gold',0,.3,0,.65,.6,.65);box(g,'cloth',0,.61,0,.72,.06,.72);box(g,'gold',0,.34,.34,.13,.17,.04);loot.push(g)}
 const cubes=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshLambertMaterial({color:0xffffff}),parts.length);cubes.frustumCulled=false;root.add(cubes);
 parts.forEach((p,i)=>cubes.setColorAt(i,new T.Color(p.color)));
 const wheelMesh=new T.InstancedMesh(new T.CylinderGeometry(.55,.55,.18,10),new T.MeshLambertMaterial({color:0x49392b}),4);wheelMesh.frustumCulled=false;root.add(wheelMesh);
 const hidden=new T.Matrix4().makeScale(0,0,0);
 function flush(){rig.updateMatrixWorld(true);parts.forEach((p,i)=>{let visible=true;for(let g=p.g;g&&g!==rig;g=g.parent)if(!g.visible)visible=false;cubes.setMatrixAt(i,visible?p.g.matrixWorld:hidden)});wheels.forEach((g,i)=>wheelMesh.setMatrixAt(i,g.matrixWorld));cubes.instanceMatrix.needsUpdate=true;wheelMesh.instanceMatrix.needsUpdate=true}
 const actors=[{g:puller},...people.map(p=>({g:p.g}))];
 let previousRaid=null,lastAge=0,flight=null;
 function update(state,ground){
  const {raid,time,lootTaken}=state,p=raid.point();if(previousRaid!==raid){previousRaid=raid;lastAge=raid.age;flight=null}const delta=Math.max(0,Math.min(.25,raid.age-lastAge));lastAge=raid.age;root.visible=true;wagon.position.set(p.x,ground(p.x,p.z),p.z);wagon.rotation.y=p.yaw;
  wheelRig.position.copy(wagon.position);wheelRig.rotation.y=p.yaw;wheelMesh.visible=true;
  for(const w of wheels)w.rotation.x=-raid.distance/.55;
  const opened=raid.state==='loot',flee=opened?Math.max(0,raid.age-state.openedAt):0;
  lid.rotation.x=opened?-1.15:Math.sin(time*16)*(raid.state==='raid'?.035:0);wagon.rotation.z=raid.state==='raid'?Math.sin(time*20)*.018:0;
  if(opened&&!flight)flight=[raid.distance+3.6,raid.distance,raid.distance,raid.distance+1.1];
  const fleePoint=(index,speed,side=0)=>{
   const old=flight?.[index]??raid.distance+(index===0?3.6:index===3?1.1:0),next=opened?Math.min(raid.total-1,old+delta*speed):old,q=raid.point(next);
   const x=q.x+Math.cos(q.yaw)*side,z=q.z-Math.sin(q.yaw)*side,blocked=opened&&state.blocked?.(x,z,index===0?.75:.4);
   if(opened&&!blocked)flight[index]=next;const point=raid.point(blocked?old:next);
   return{...point,x:point.x+Math.cos(point.yaw)*side,z:point.z-Math.sin(point.yaw)*side,moving:opened?!blocked&&next>old:raid.state==='travel'&&!raid.blocked,visible:!opened||(flight[index]<raid.total-1)};
  };
  const animal=fleePoint(0,2.8);puller.position.set(animal.x,ground(animal.x,animal.z),animal.z);puller.rotation.y=animal.yaw;puller.visible=animal.visible;
  for(const l of legs)l.g.rotation.x=animal.moving?Math.sin(time*9+l.phase)*.5:0;
  people.forEach((a,i)=>{const side=i===2?0:(i===0?-1.95:1.95),q=fleePoint(i+1,3.2,side),x=q.x,z=q.z;
   a.g.position.set(x,ground(x,z)+(i===2&&!opened?1.25:0),z);a.g.rotation.y=q.yaw+(raid.state==='raid'&&i<2?Math.sin(time*6)*.18:0);a.g.visible=q.visible;
   a.legs.forEach((leg,j)=>leg.rotation.x=a.seated&&!opened?-1.3:q.moving?Math.sin(time*8+j*Math.PI)*.55:0);
  });
  loot.forEach((g,i)=>{g.visible=opened&&!lootTaken.has(i);const side=i===0?-2:i===1?2:0,back=i===2?-3:0,x=p.x+Math.cos(p.yaw)*side+Math.sin(p.yaw)*back,z=p.z-Math.sin(p.yaw)*side+Math.cos(p.yaw)*back;g.position.set(x,ground(x,z)+Math.max(0,Math.sin(Math.min(1,flee)*Math.PI)*.9),z);g.rotation.y=p.yaw;});
  flush();
 }
 return{root,actors,loot,wagon,update,hide:()=>{root.visible=false},drawCalls:2};
}
