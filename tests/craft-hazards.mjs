import test from 'node:test';import assert from 'node:assert/strict';import * as T from '../vendor/three/three.module.min.js';
import {segmentBoxEntry,firstProjectileImpact} from '../src/projectile-impact.js';
import {CraftWorld} from '../src/craft-world.js';import {CraftDebris} from '../src/craft-debris.js';
import {createModule as fireModule} from '../src/runtime/boss-fire.js';import {createModule as destructionModule} from '../src/runtime/craft-destruction.js';import {createModule as stormModule} from '../src/runtime/storm-damage.js';
const box=(x,y,z,w,h,d)=>new T.Box3(new T.Vector3(x-w/2,y-h/2,z-d/2),new T.Vector3(x+w/2,y+h/2,z+d/2));
function fixture(mobile=false){
 const scene=new T.Scene(),mats=Object.fromEntries(['wood','roof','white','black','stone','gold','leaf','pink'].map(k=>[k,new T.MeshLambertMaterial({color:0xa98655})]));
 const r={scene,mobile,mats,level:6,levelTime:10,worldEpoch:1,treeObjects:[],rockPositions:[],mountainObstacles:[],lairObstacles:[],houseObjects:[],wallGeometry:()=>[],terrainHeightAt:()=>0,playerPhysicalHeight:()=>1.65,fireballs:[],boy:new T.Group(),life:4,boarFormTime:0,invuln:0,statsData:{damage:0},graphicsParticleFactor:.5,tornadoState:{active:true,x:0,z:5},notice(){},sound(){},playerHitFeedback(){},hud(){},showEnd(){this.endShown=true},makeEffectLight:()=>new T.PointLight(),igniteBossTree(){},igniteStormTarget(){},destroyAdventureObject(root){root.visible=false},rand:(a,b)=>(a+b)/2};
 r.boy.position.set(0,0,5);scene.add(r.boy);r.craftWorld=new CraftWorld(scene,mats,{light:()=>new T.PointLight()});
 const modules=[stormModule(r),destructionModule(r),fireModule(r)];for(const m of modules)Object.defineProperties(r,m.bindings);for(const m of modules)m.initialize();return r;
}
function shot(r,start,heading=0){const g=new T.Group(),flame=new T.Group();g.position.copy(start);g.add(flame);r.scene.add(g);r.fireballs.push({g,flame,a:heading});return g}
test('swept collision catches thin walls and selects the closest physical hit',()=>{
 const a={x:0,y:1,z:-10},b={x:0,y:1,z:10},wall=box(0,1,0,3,2,.1),far=box(0,1,5,3,2,.1);
 assert.ok(segmentBoxEntry(a,b,wall)>0);assert.equal(firstProjectileImpact(a,b,[{box:far,target:'far'},{box:wall,target:'near'}]).target,'near');
 assert.equal(segmentBoxEntry({x:4,y:1,z:-10},{x:4,y:1,z:10},wall),null);assert.equal(segmentBoxEntry(a,a,wall),null);assert.equal(segmentBoxEntry({x:0,y:1,z:0},{x:0,y:1,z:0},wall),0);
 assert.equal(segmentBoxEntry({x:NaN,y:0,z:0},b,wall),null);
});
test('houses and rotated thin walls block a projectile before the sheltered player',()=>{
 for(const kind of ['house','wall'])for(const angle of [0,Math.PI/4,Math.PI/2])for(const dt of [.05,.5,2]){
  const r=fixture(),item=r.craftWorld.create(kind,0,0,0,6,angle);shot(r,new T.Vector3(0,1,-6));
  for(let i=0;i<Math.ceil(3/dt)&&r.fireballs.length;i++)r.updateBossFireballs(dt,0);
  assert.equal(r.fireballs.length,0,kind+' '+angle);assert.equal(r.life,4);assert.equal(r.craftFires.has(item),true);assert.equal(r.craftWorld.items.includes(item),true);
 }
});
test('a closed door stops fire, while an open doorway permits passage into the house',()=>{
 const r=fixture(),h=r.craftWorld.create('house',0,0,0,6),a=new T.Vector3(0,1,5),b=new T.Vector3(0,1,0);
 assert.equal(r.bossFireImpact(a,b).target,h);r.craftWorld.update(.05,0,6,()=>0,()=>false,{x:0,y:0,z:0});assert.equal(h.doorRig.closed,false);assert.equal(r.bossFireImpact(a,b),null);
});
test('raised floors and roofs stop fire only at their physical height',()=>{
 const r=fixture(),h=r.craftWorld.create('house',0,3,0,6);
 assert.equal(r.bossFireImpact(new T.Vector3(0,1,-6),new T.Vector3(0,1,6)),null);
 assert.equal(r.bossFireImpact(new T.Vector3(0,10,0),new T.Vector3(0,4,0)).target,h);
});
test('fire cannot pass a stone obstruction to ignite wood behind it',()=>{
 const r=fixture(),rock=new T.Mesh(new T.BoxGeometry(3,2,1),r.mats.stone);rock.position.set(0,1,-3);r.scene.add(rock);r.rockPositions.push([0,-3,1,rock]);
 const wall=r.craftWorld.create('wall',0,0,0,6);shot(r,new T.Vector3(0,1,-6));r.updateBossFireballs(2,0);assert.equal(r.life,4);assert.equal(r.craftFires.has(wall),false);assert.equal(r.fireballs.length,0);
 rock.visible=false;shot(r,new T.Vector3(0,1,-6));r.updateBossFireballs(2,0);assert.equal(r.craftFires.has(wall),true);
});
test('a player in front of cover can be hit, and the projectile is consumed once',()=>{
 const r=fixture();r.boy.position.set(0,0,-4);r.craftWorld.create('wall',0,0,0,6);shot(r,new T.Vector3(0,1,-6));r.updateBossFireballs(2,0);assert.equal(r.life,3);assert.equal(r.statsData.damage,1);assert.equal(r.fireballs.length,0);r.updateBossFireballs(2,0);assert.equal(r.life,3);
});
test('fire survives unrelated placement and eventually collapses with debris and no ghost wall',()=>{
 const r=fixture(),wall=r.craftWorld.create('wall',0,0,0,6),other=r.craftWorld.create('wall',6,0,0,6),base=other.g.children[0].material;
 r.igniteCraftObject(wall,new T.Vector3(0,1,0));r.worldEpoch++;r.updateCraftFires(5,5000);assert.ok(r.craftFires.get(wall).time<28);assert.equal(other.g.children[0].material,base);
 r.updateCraftFires(30,35000);assert.equal(r.pendingCraftDestruction.has(wall.g),true);assert.equal(r.craftWorld.items.includes(wall),true);
 for(let i=0;i<30;i++)r.updateCraftDestruction(.05);
 assert.equal(r.craftWorld.items.includes(wall),false);assert.ok(r.craftDebris.items.length>0);assert.equal(r.craftWorld.blocked(0,0,0),false);assert.equal(r.craftFires.has(wall),false);assert.equal(base.color.getHex(),0xa98655);
});
test('tornado destruction visibly shakes before removing a house and keeps interior items sheltered',()=>{
 const r=fixture(),house=r.craftWorld.create('house',0,0,0,6),bed=r.craftWorld.create('bed',0,0,0,6);
 assert.equal(r.beginCraftDestruction(bed),false);assert.equal(r.beginCraftDestruction(house),true);r.updateCraftDestruction(.4);assert.equal(r.craftWorld.items.includes(house),true);assert.notEqual(house.g.rotation.z,0);
 for(let i=0;i<30;i++)r.updateCraftDestruction(.05);
 assert.equal(r.craftWorld.items.includes(house),false);assert.ok(r.craftDebris.items.length);assert.equal(r.craftWorld.items.includes(bed),true);assert.equal(r.beginCraftDestruction(bed),true);
});
test('clear and map reset cancel pending destruction and release fire effects without deleting intact objects',()=>{
 const r=fixture(),wall=r.craftWorld.create('wall',0,0,0,6);r.beginCraftDestruction(wall);r.updateCraftDestruction(.3);r.igniteCraftObject(wall,new T.Vector3(0,1,0));r.updateCraftFires(.1,100);
 r.resetCraftDestruction();r.resetCraftHazards();assert.equal(wall.g.rotation.z,0);assert.equal(r.pendingCraftDestruction.size,0);assert.equal(r.craftFires.size,0);assert.equal(r.craftWorld.items.includes(wall),true);
 r.beginCraftDestruction(wall);r.craftWorld.clear();assert.equal(r.pendingCraftDestruction.size,0);assert.equal(r.craftWorld.items.length,0);
});
test('fragment effects have a fixed pool, reuse one instanced draw and settle above terrain',()=>{
 for(const mobile of [true,false]){
  const scene=new T.Scene(),pool=new CraftDebris(scene,{mobile}),wall=new T.Mesh(new T.BoxGeometry(4,3,.2),new T.MeshLambertMaterial());scene.add(wall);
  for(let i=0;i<200;i++)pool.emit(wall);assert.equal(pool.items.length,pool.capacity);
  for(let i=0;i<120;i++)pool.update(.05,()=>1);assert.equal(pool.mesh.count,pool.capacity);assert.ok(pool.items.every(q=>Number.isFinite(q.p.x)&&q.p.y>=1));assert.equal(scene.children.filter(m=>m.isInstancedMesh).length,1);
  for(let i=0;i<300;i++)pool.update(.05,()=>1);assert.equal(pool.items.length,0);assert.equal(pool.mesh.count,0);
 }
});

test('house flames are visible outside its walls and furniture fire starts at the contact point',()=>{const r=fixture(),h=r.craftWorld.create('house',0,0,0,6);r.igniteCraftObject(h,new T.Vector3(0,1,-2.5));r.updateCraftFires(.1,100);const fire=r.craftFires.get(h);assert.ok(fire.flames.children.every(m=>Math.abs(m.position.x)>2.4||Math.abs(m.position.z)>2.4));const wall=r.craftWorld.create('wall',6,0,0,6),point=new T.Vector3(6,1,-.35);r.igniteCraftObject(wall,point);r.updateCraftFires(.1,200);const flames=r.craftFires.get(wall).flames;assert.ok(flames.getWorldPosition(new T.Vector3()).distanceTo(point)<.001)});
