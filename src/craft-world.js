import {createDog,DogCompanion} from './companion-dog.js?v=222';
import * as T from '../vendor/three/three.module.min.js';
export const PROP_FOOTPRINTS={flower:[.6,.6],house:[4.8,4.8],wall:[3,.25],floor:[3,3],roof:[3.5,3.5],block:[1,1],bed:[1.6,2.2],chair:[.7,.7],table:[1.8,1.2],standingLamp:[.5,.5],wardrobe:[1.5,.7],stove:[1.2,1.2],palm:[.7,.7]};
export class CraftWorld{
 constructor(scene,materials,builders){this.scene=scene;this.materials=materials;this.builders=builders;this.items=[];this.stock={};this.selected='';this.epoch=0}
 petCount(){return this.items.filter(i=>i.kind==='cat'||i.kind==='dog').length+(this.stock.cat||0)+(this.stock.dog||0)}
 addStock(kind){if((kind==='cat'||kind==='dog')&&this.petCount()>=2)return false;this.stock[kind]=(this.stock[kind]||0)+1;this.selected=kind;return true}
 clear(){for(const item of [...this.items])this.remove(item);this.stock={};this.selected=''}
 remove(item){item.g.removeFromParent();item.g.traverse(mesh=>{if(mesh.isMesh&&!mesh.userData.sharedCraftGeometry)mesh.geometry.dispose()});const i=this.items.indexOf(item);if(i>=0)this.items.splice(i,1);this.epoch++}
 create(kind,x,y,z,level,rotation=0,preview=false){if(!preview&&['cat','dog','human','worm','snail'].includes(kind)&&this.canCreateCreature&&!this.canCreateCreature(kind,level))return null;if(!preview&&(kind==='cat'||kind==='dog')&&this.items.filter(i=>i.kind==='cat'||i.kind==='dog').length>=2)return null;let g=new T.Group();const m=this.materials,solids=[],supports=[];let living=false,light=null,doorRig=null;
 const box=(material,bx,by,bz,w,h,d,solid=true,support=true)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material);mesh.position.set(bx,by,bz);mesh.castShadow=false;mesh.receiveShadow=true;g.add(mesh);if(solid)solids.push(mesh);if(support)supports.push(mesh);return mesh};
 const legs=(w,d,h)=>{for(const a of [-1,1])for(const b of [-1,1])box(m.wood,a*w*.4,h/2,b*d*.4,.1,h,.1)};
 if(kind==='cat'||kind==='human'){const actor=this.builders[kind]();if(kind==='cat')g=actor;else g.add(actor);living=true}
 else if(kind==='dog'){g=createDog(m);living=true}
 else if(kind==='worm'){for(let i=0;i<7;i++)box(m.pink,Math.sin(i)*.04,.09,(i-3)*.12,.14,.14,.14,false,false);living=true}
 else if(kind==='snail'){box(m.gold,0,.1,0,.25,.15,.6,false,false);const shell=new T.Mesh(new T.SphereGeometry(.24,8,6),m.wood);shell.position.y=.3;g.add(shell);for(const a of [-1,1]){box(m.gold,a*.1,.27,.26,.04,.25,.04,false,false);box(m.black,a*.1,.4,.26,.06,.05,.05,false,false)}living=true}
 else if(kind==='house'){box(m.wood,0,.08,0,4.8,.16,4.8,false);box(m.wood,-1.7,1.4,2.3,1.4,2.6,.2);box(m.wood,1.7,1.4,2.3,1.4,2.6,.2);box(m.wood,0,1.4,-2.3,4.8,2.6,.2);for(const side of [-1,1])box(m.wood,side*2.3,1.4,0,.2,2.6,4.6);box(m.roof,0,2.9,0,5.2,.35,5.2);const hinge=new T.Group();hinge.position.set(-1,.16,2.42);g.add(hinge);const slab=new T.Mesh(new T.BoxGeometry(2,2.3,.12),m.wood);slab.position.set(1,1.15,0);hinge.add(slab);const knob=new T.Mesh(new T.SphereGeometry(.065,6,4),m.gold);knob.position.set(1.72,1.15,.11);hinge.add(knob);doorRig={hinge,slab,closed:true};}
 else if(kind==='flower'){for(let k=0;k<3;k++){const x=(k-1)*.18,z=k%2*.14,h=.3+k*.055;box(m.leaf,x,h/2,z,.035,h,.035,false,false);box(m.gold,x,h,z,.08,.06,.08,false,false);for(let i=0;i<4;i++){const a=i*Math.PI/2;box(m.pink,x+Math.cos(a)*.09,h,z+Math.sin(a)*.09,.12,.035,.12,false,false)}}}
 else if(kind==='block')box(m.wood,0,.5,0,1,1,1);
 else if(kind==='wall')box(m.wood,0,1.35,0,3,2.7,.25);
 else if(kind==='floor')box(m.wood,0,.08,0,3,.16,3,false);
 else if(kind==='roof'){box(m.roof,0,.14,0,3.5,.28,3.5);}
 else if(kind==='table'){box(m.wood,0,.85,0,1.8,.15,1.2);legs(1.8,1.2,.8)}
 else if(kind==='chair'){box(m.wood,0,.45,0,.7,.12,.7);box(m.wood,0,.85,-.3,.7,.75,.12);legs(.7,.7,.4)}
 else if(kind==='bed'){box(m.wood,0,.28,0,1.6,.4,2.2);box(m.white,0,.55,0,1.5,.2,2.1);box(m.white,0,.72,-.65,1.2,.16,.5)}
 else if(kind==='wardrobe'){box(m.wood,0,1,0,1.5,2,.7);box(m.gold,.15,1,.38,.08,.1,.07,false,false);box(m.gold,-.15,1,.38,.08,.1,.07,false,false)}
 else if(kind==='standingLamp'){box(m.stone,0,.05,0,.5,.1,.5);box(m.wood,0,.9,0,.08,1.7,.08);box(m.gold,0,1.85,0,.6,.35,.6,false,false);light=preview?new T.PointLight(0,0):this.builders.light();light.position.set(0,1.8,0);g.add(light)}
 else if(kind==='stove'){box(m.stone,0,.6,0,1.2,1.2,1.2);box(m.black,0,.45,.62,.8,.6,.04,false,false);box(m.gold,0,.4,.65,.5,.3,.02,false,false);box(m.stone,.3,1.8,-.3,.35,1.6,.35);light=preview?new T.PointLight(0,0):this.builders.light();light.position.set(0,.5,1);g.add(light)}
 else if(kind==='palm'){box(m.wood,0,2,0,.45,4,.45);for(let i=0;i<6;i++){const leaf=box(m.leaf,Math.sin(i*Math.PI/3)*1.2,4,Math.cos(i*Math.PI/3)*1.2,.6,.18,2.7,false,false);leaf.rotation.y=i*Math.PI/3;leaf.rotation.x=.2}}
 g.position.set(x,y,z);g.rotation.y=rotation;this.scene.add(g);g.updateWorldMatrix(true,true);const bounds=solids.map(mesh=>new T.Box3().setFromObject(mesh)),platforms=supports.map(mesh=>new T.Box3().setFromObject(mesh)),item={g,kind,level,living,solids:bounds,supports:platforms,home:{x,y,z},phase:this.items.length*2.4,light,doorRig};if(doorRig){doorRig.box=new T.Box3().setFromObject(doorRig.slab);item.solids.push(doorRig.box)}if(kind==='dog')item.dog=new DogCompanion(g,item.home);if(kind==='cat')item.catActor=g.craftedCatActor;
 if(!preview){this.items.push(item);this.epoch++}return item;
 }
 visible(level){for(const item of this.items)item.g.visible=item.level===level}
 blocked(x,z,y,r=.43,height=1.65){return this.items.some(item=>item.g.visible&&!item.living&&item.solids.some(b=>x>b.min.x-r&&x<b.max.x+r&&z>b.min.z-r&&z<b.max.z+r&&y<b.max.y-.025&&y+height>b.min.y+.03))}
 support(x,z,feet){let top=-Infinity;for(const item of this.items)if(item.g.visible&&!item.living)for(const b of item.supports)if(x>b.min.x+.03&&x<b.max.x-.03&&z>b.min.z+.03&&z<b.max.z-.03&&feet>=b.max.y-.12)top=Math.max(top,b.max.y);return top}
 walls(){return this.items.filter(item=>item.g.visible&&!item.living).flatMap(item=>item.solids.map(box=>({root:item.g,box,polygon:[{x:box.min.x,z:box.min.z},{x:box.max.x,z:box.min.z},{x:box.max.x,z:box.max.z},{x:box.min.x,z:box.max.z}]})))}
 update(dt,now,level,terrain,blocked,player){
  for(const item of this.items){
   if(item.doorRig&&item.level===level&&item.g.visible&&player){const p=item.g.worldToLocal(new T.Vector3(player.x,player.y||0,player.z)),near=Math.abs(p.x)<2.3&&p.z>-.5&&p.z<5,inside=Math.abs(p.x)<2.25&&Math.abs(p.z)<2.25,closed=!(near||inside);if(item.doorRig.closed!==closed){item.doorRig.closed=closed;item.doorRig.hinge.rotation.y=closed?0:-Math.PI*.48;item.g.updateWorldMatrix(true,true);item.doorRig.box.setFromObject(item.doorRig.slab);this.epoch++}}
   if(item.level!==level||!item.g.visible||!item.living||item.airborne||item.catActor)continue;
   if(item.dog){const cat=this.items.find(i=>i.catActor&&i.level===level&&i.g.visible),playing=cat&&Math.floor(now/8)%3===0&&Math.hypot(item.g.position.x-cat.g.position.x,item.g.position.z-cat.g.position.z)<14;item.dog.update(dt,terrain,blocked,playing?cat.g.position:player,this.epoch);continue}
   const p=item.g.position,small=item.kind==='worm'||item.kind==='snail',speed=item.kind==='worm'?.3:item.kind==='snail'?.16:item.kind==='dog'?2.6:1.1;
   item.age=(item.age||0)+Math.max(0,dt);
   const t=item.age,following=item.kind==='dog'&&Math.hypot(p.x-player.x,p.z-player.z)>3;
   const target=following?player:{x:item.home.x+Math.sin(t*.14+item.phase)*3,z:item.home.z+Math.cos(t*.17+item.phase)*3};
   const d=Math.hypot(target.x-p.x,target.z-p.z),desired=Math.atan2(target.x-p.x,target.z-p.z);
   if(d>.08){
    const step=Math.min(d,Math.max(0,dt)*speed),base=item.detourUntil>t?item.heading:desired;
    let moved=false;
    // Keep a chosen detour for a while; retrying opposite sides every frame causes shaking.
    for(const turn of [0,.65,-.65,1.3,-1.3,Math.PI]){
     const angle=base+turn,x=p.x+Math.sin(angle)*step,z=p.z+Math.cos(angle)*step,y=terrain(x,z,p.y);
     const radius=item.kind==='snail'?.24:small?.14:.25,height=item.kind==='snail'?.56:small?.2:1.6,reach=item.kind==='worm'?.33:item.kind==='snail'?.12:0;
     if(Math.abs(y-p.y)>.3||[0,-reach,reach].some(offset=>blocked(x+Math.sin(angle)*offset,z+Math.cos(angle)*offset,y,radius,height,item)))continue;
     p.set(x,y,z);item.heading=angle;
     if(turn!==0)item.detourUntil=t+2;
     item.g.rotation.y=angle;item.g.rotation.z=small?0:Math.sin(t*7+item.phase)*.02;
     moved=true;break;
    }
    item.moving=moved;
   }
   if(item.kind==='worm')for(let i=0;i<item.g.children.length;i++){
    const segment=item.g.children[i],wave=t*6-i*.9;
    segment.position.x=Math.sin(wave)*.045;segment.position.y=.09+Math.sin(wave)*.014;
    segment.scale.z=1+Math.sin(wave)*.14;
   }
   if(item.kind==='snail'){
    // The foot ripples under a steady shell; eyestalks sway independently.
    item.g.children[0].scale.z=1+Math.sin(t*3)*.08;
    for(const eye of item.g.children.slice(2))eye.rotation.z=Math.sin(t*2+item.phase)*.055;
   }
  }
 }
}
