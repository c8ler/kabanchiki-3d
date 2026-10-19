import * as T from '../vendor/three/three.module.min.js';
export const PROP_FOOTPRINTS={house:[4.8,4.8],wall:[3,.25],floor:[3,3],roof:[3.5,3.5],block:[1,1],bed:[1.6,2.2],chair:[.7,.7],table:[1.8,1.2],standingLamp:[.5,.5],wardrobe:[1.5,.7],stove:[1.2,1.2],palm:[.7,.7]};
export class CraftWorld{
 constructor(scene,materials,builders){this.scene=scene;this.materials=materials;this.builders=builders;this.items=[];this.stock={};this.selected='';this.epoch=0}
 addStock(kind){this.stock[kind]=(this.stock[kind]||0)+1;this.selected=kind}
 clear(){for(const item of [...this.items])this.remove(item);this.stock={};this.selected=''}
 remove(item){item.g.removeFromParent();item.g.traverse(mesh=>{if(mesh.isMesh&&!mesh.userData.sharedCraftGeometry)mesh.geometry.dispose()});const i=this.items.indexOf(item);if(i>=0)this.items.splice(i,1);this.epoch++}
 create(kind,x,y,z,level,rotation=0){const g=new T.Group(),m=this.materials,solids=[],supports=[];let living=false,light=null;
 const box=(material,bx,by,bz,w,h,d,solid=true,support=true)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material);mesh.position.set(bx,by,bz);mesh.castShadow=false;mesh.receiveShadow=true;g.add(mesh);if(solid)solids.push(mesh);if(support)supports.push(mesh);return mesh};
 const legs=(w,d,h)=>{for(const a of [-1,1])for(const b of [-1,1])box(m.wood,a*w*.4,h/2,b*d*.4,.1,h,.1)};
 if(kind==='cat'||kind==='human'){const actor=this.builders[kind]();g.add(actor);living=true}
 else if(kind==='dog'){box(m.boar,0,.6,0,.5,.5,1,false,false);box(m.boar,0,.9,.6,.5,.5,.45,false,false);for(const a of [-1,1]){box(m.wood,a*.22,.98,.62,.15,.5,.25,false,false);box(m.black,a*.15,1.0,.84,.08,.08,.03,false,false);for(const b of [-1,1])box(m.boar,a*.18,.25,b*.35,.14,.5,.15,false,false)}box(m.black,0,.8,.9,.2,.15,.15,false,false);const tail=box(m.boar,0,.85,-.65,.12,.12,.5,false,false);tail.rotation.x=-.6;living=true}
 else if(kind==='worm'){for(let i=0;i<7;i++)box(m.pink,Math.sin(i)*.04,.09,i*.12,.14,.14,.14,false,false);living=true}
 else if(kind==='snail'){box(m.gold,0,.1,0,.25,.15,.6,false,false);const shell=new T.Mesh(new T.SphereGeometry(.24,8,6),m.wood);shell.position.y=.3;g.add(shell);for(const a of [-1,1]){box(m.gold,a*.1,.27,.26,.04,.25,.04,false,false);box(m.black,a*.1,.4,.26,.06,.05,.05,false,false)}living=true}
 else if(kind==='house'){box(m.wood,0,.08,0,4.8,.16,4.8,false);box(m.wood,-1.7,1.4,2.3,1.4,2.6,.2);box(m.wood,1.7,1.4,2.3,1.4,2.6,.2);box(m.wood,0,1.4,-2.3,4.8,2.6,.2);for(const side of [-1,1])box(m.wood,side*2.3,1.4,0,.2,2.6,4.6);box(m.roof,0,2.9,0,5.2,.35,5.2);}
 else if(kind==='block')box(m.wood,0,.5,0,1,1,1);
 else if(kind==='wall')box(m.wood,0,1.35,0,3,2.7,.25);
 else if(kind==='floor')box(m.wood,0,.08,0,3,.16,3,false);
 else if(kind==='roof'){box(m.roof,0,.14,0,3.5,.28,3.5);}
 else if(kind==='table'){box(m.wood,0,.85,0,1.8,.15,1.2);legs(1.8,1.2,.8)}
 else if(kind==='chair'){box(m.wood,0,.45,0,.7,.12,.7);box(m.wood,0,.85,-.3,.7,.75,.12);legs(.7,.7,.4)}
 else if(kind==='bed'){box(m.wood,0,.28,0,1.6,.4,2.2);box(m.white,0,.55,0,1.5,.2,2.1);box(m.white,0,.72,-.65,1.2,.16,.5)}
 else if(kind==='wardrobe'){box(m.wood,0,1,0,1.5,2,.7);box(m.gold,.15,1,.38,.08,.1,.07,false,false);box(m.gold,-.15,1,.38,.08,.1,.07,false,false)}
 else if(kind==='standingLamp'){box(m.stone,0,.05,0,.5,.1,.5);box(m.wood,0,.9,0,.08,1.7,.08);box(m.gold,0,1.85,0,.6,.35,.6,false,false);light=this.builders.light();light.position.set(0,1.8,0);g.add(light)}
 else if(kind==='stove'){box(m.stone,0,.6,0,1.2,1.2,1.2);box(m.black,0,.45,.62,.8,.6,.04,false,false);box(m.gold,0,.4,.65,.5,.3,.02,false,false);box(m.stone,.3,1.8,-.3,.35,1.6,.35);light=this.builders.light();light.position.set(0,.5,1);g.add(light)}
 else if(kind==='palm'){box(m.wood,0,2,0,.45,4,.45);for(let i=0;i<6;i++){const leaf=box(m.leaf,Math.sin(i*Math.PI/3)*1.2,4,Math.cos(i*Math.PI/3)*1.2,.6,.18,2.7,false,false);leaf.rotation.y=i*Math.PI/3;leaf.rotation.x=.2}}
 g.position.set(x,y,z);g.rotation.y=rotation;this.scene.add(g);g.updateWorldMatrix(true,true);const bounds=solids.map(mesh=>new T.Box3().setFromObject(mesh)),platforms=supports.map(mesh=>new T.Box3().setFromObject(mesh)),item={g,kind,level,living,solids:bounds,supports:platforms,home:{x,y,z},phase:this.items.length*2.4,light};this.items.push(item);this.epoch++;return item;
 }
 visible(level){for(const item of this.items)item.g.visible=item.level===level}
 blocked(x,z,y,r=.43,height=1.65){return this.items.some(item=>item.g.visible&&!item.living&&item.solids.some(b=>x>b.min.x-r&&x<b.max.x+r&&z>b.min.z-r&&z<b.max.z+r&&y<b.max.y-.025&&y+height>b.min.y+.03))}
 support(x,z,feet){let top=-Infinity;for(const item of this.items)if(item.g.visible&&!item.living)for(const b of item.supports)if(x>b.min.x+.03&&x<b.max.x-.03&&z>b.min.z+.03&&z<b.max.z-.03&&feet>=b.max.y-.12)top=Math.max(top,b.max.y);return top}
 walls(){return this.items.filter(item=>item.g.visible&&!item.living).flatMap(item=>item.solids.map(box=>({root:item.g,box,polygon:[{x:box.min.x,z:box.min.z},{x:box.max.x,z:box.min.z},{x:box.max.x,z:box.max.z},{x:box.min.x,z:box.max.z}]})))}
 update(dt,now,level,terrain,blocked,player){for(const item of this.items){if(item.level!==level||!item.living||item.airborne)continue;const p=item.g.position,small=item.kind==='worm'||item.kind==='snail',speed=small?.2:item.kind==='dog'?2.6:1.1,target=item.kind==='dog'&&Math.hypot(p.x-player.x,p.z-player.z)>3?player:{x:item.home.x+Math.sin(now*.14+item.phase)*3,z:item.home.z+Math.cos(now*.17+item.phase)*3},d=Math.hypot(target.x-p.x,target.z-p.z);if(d>.25){const step=Math.min(d,dt*speed),x=p.x+(target.x-p.x)/d*step,z=p.z+(target.z-p.z)/d*step;if(!blocked(x,z)){p.set(x,terrain(x,z),z);item.g.rotation.y=Math.atan2(target.x-x,target.z-z);item.g.rotation.z=small?Math.sin(now*5+item.phase)*.035:Math.sin(now*7+item.phase)*.02;}}}}
}
