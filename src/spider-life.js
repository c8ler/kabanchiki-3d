import * as T from '../vendor/three/three.module.min.js';
export const SPIDER_LIMIT=12,WEB_LIMIT=24;
const visible=root=>{if(!root)return true;let p=root;for(;p.parent;p=p.parent)if(!p.visible)return false;return !!p.isScene&&p.visible};
const UP=new T.Vector3(0,1,0),axes=['x','y','z'],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class SpiderLife{
 constructor(scene,{mobile=false,seed=2701}={}){this.root=new T.Group();this.root.name='cheat-spiders';this.root.visible=false;scene.add(this.root);this.mobile=mobile;this.seed=seed;this.spiders=[];this.webs=[];this.level=1;this.time=0;this.venom=0;this.poisonClock=0;this.biteCooldown=0;this.grid=new Map();this.surfaces=[];this.serial=0;this.stats={bites:0,webs:0,climbs:0,attachments:0};this.assets=null;this.ray=new T.Raycaster();this.dummy=new T.Object3D()}
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296}
 assetsReady(){if(this.assets)return;const lines=[];for(let i=0;i<12;i++){const a=i*Math.PI/6;lines.push(0,0,0,Math.cos(a),0,Math.sin(a))}let last=null;for(let i=0;i<=120;i++){const a=i*.41,r=.12+.88*i/120,p=[Math.cos(a)*r,0,Math.sin(a)*r];if(last)lines.push(...last,...p);last=p}const web=new T.BufferGeometry();web.setAttribute('position',new T.Float32BufferAttribute(lines,3));this.assets={body:new T.SphereGeometry(1,6,4),material:new T.MeshLambertMaterial({color:0xffffff}),web,thread:new T.LineBasicMaterial({color:0xe0e8e4,transparent:true,opacity:.52,depthWrite:false})}}
 model(){this.assetsReady();const g=new T.Group(),mesh=new T.InstancedMesh(this.assets.body,this.assets.material,22);mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);for(let i=0;i<22;i++)mesh.setColorAt(i,new T.Color(i===18||i===19?0xf7a23e:i<2?0x3b2830:0x30252a));g.add(mesh);g.scale.setScalar(.75);this.root.add(g);return{g,mesh}}
 spawn(x,y,z,level=this.level){if(this.spiders.length>=SPIDER_LIMIT)return null;const model=this.model(),s={...model,id:++this.serial,level,p:new T.Vector3(x,y+.035,z),normal:UP.clone(),visualNormal:UP.clone(),direction:new T.Vector3(Math.sin(this.serial*2.4),0,Math.cos(this.serial*2.4)),surface:null,face:null,mode:'ground',host:null,wait:2+this.random()*3,webClock:4+this.random()*5,bite:1.8,immune:2,steps:0};s.g.visible=level===this.level;this.spiders.push(s);this.pose(s,0);return s}
 visit(level){if(level===this.level)return;if(level!==this.level){for(const s of this.spiders)if(s.host){s.host=null;s.mode='ground';s.surface=null;s.p.copy(s.lastGround||s.p);s.normal.copy(UP)}this.cure()}this.level=level;for(const s of this.spiders)s.g.visible=s.level===level;for(const w of this.webs)w.g.visible=w.level===level}
 clear(){for(const s of this.spiders){s.mesh.dispose();s.g.removeFromParent()}for(const w of this.webs)w.g.removeFromParent();this.spiders.length=this.webs.length=0;this.root.visible=false;this.cure();this.stats={bites:0,webs:0,climbs:0,attachments:0}}
 clearCheats(){for(const s of [...this.spiders])if(!s.natural)this.remove(s);for(const w of [...this.webs])if(!w.natural){w.g.removeFromParent();this.webs.splice(this.webs.indexOf(w),1)}if(!this.spiders.length)this.root.visible=false;this.cure()}
 cure(){this.venom=0;this.poisonClock=0;this.biteCooldown=0}
 setSurfaces(surfaces){this.surfaces=surfaces;this.grid.clear();for(const q of surfaces){if(q.box.isEmpty())continue;for(let x=Math.floor(q.box.min.x/8);x<=Math.floor(q.box.max.x/8);x++)for(let z=Math.floor(q.box.min.z/8);z<=Math.floor(q.box.max.z/8);z++){const key=x+':'+z,list=this.grid.get(key)||[];list.push(q);this.grid.set(key,list)}}}
 nearby(p){const set=new Set(),cx=Math.floor(p.x/8),cz=Math.floor(p.z/8);for(let x=cx-1;x<=cx+1;x++)for(let z=cz-1;z<=cz+1;z++)for(const q of this.grid.get(x+':'+z)||[])if(visible(q.root))set.add(q);return [...set]}
 enterFace(s,q,axis,sign){s.surface=q;s.face={axis,sign};s.mode='surface';s.normal.set(0,0,0)[axis]=sign;s.p[axis]=(sign>0?q.box.max:q.box.min)[axis]+sign*.035;for(const k of axes)if(k!==axis)s.p[k]=clamp(s.p[k],q.box.min[k],q.box.max[k]);s.direction.set(0,1,0);if(axis==='y')s.direction.set(Math.sin(s.id),0,Math.cos(s.id));this.stats.climbs++}
 seekSupport(s,env){const choices=this.nearby(s.p).filter(q=>q.box.max.y>env.ground(s.p.x,s.p.z)+1&&q.box.min.y<env.ground(s.p.x,s.p.z)+.25).map(q=>{const p=q.box.clampPoint(s.p,new T.Vector3());return{q,p,d:Math.hypot(p.x-s.p.x,p.z-s.p.z)}}).filter(q=>q.d<14).sort((a,b)=>a.d-b.d);if(!choices.length)return;const target=choices[0].p;s.direction.set(target.x-s.p.x,0,target.z-s.p.z);if(s.direction.lengthSq()>.001)s.direction.normalize();s.wait=1}
 remove(s){const i=this.spiders.indexOf(s);if(i<0)return;s.host=null;s.mesh.dispose();s.g.removeFromParent();this.spiders.splice(i,1)}
 blast(point,radius,level=this.level){let killed=0;for(const s of [...this.spiders])if(s.level===level&&s.p.distanceTo(new T.Vector3(point.x,point.y,point.z))<radius){this.remove(s);killed++}for(let i=this.webs.length-1;i>=0;i--){const w=this.webs[i];if(w.level===level&&w.g.position.distanceTo(new T.Vector3(point.x,point.y,point.z))<radius){w.g.removeFromParent();this.webs.splice(i,1)}}return killed}
 ground(s,dt,env){this.seekSupport(s,env);const step=.72*dt,next=s.p.clone().addScaledVector(s.direction,step),floor=env.ground(next.x,next.z);if(Math.abs(next.x)>42||Math.abs(next.z)>42||env.wet?.(next.x,next.z)){s.direction.negate();s.wait=1;return}
  const obstacle=this.nearby(next).filter(q=>q.box.min.y<floor+.22&&q.box.max.y>floor+.08&&next.x>q.box.min.x-.12&&next.x<q.box.max.x+.12&&next.z>q.box.min.z-.12&&next.z<q.box.max.z+.12).sort((a,b)=>a.box.distanceToPoint(s.p)-b.box.distanceToPoint(s.p))[0];
  if(obstacle){const b=obstacle.box,faces=[['x',-1,Math.abs(s.p.x-b.min.x)],['x',1,Math.abs(s.p.x-b.max.x)],['z',-1,Math.abs(s.p.z-b.min.z)],['z',1,Math.abs(s.p.z-b.max.z)]].sort((a,b)=>a[2]-b[2]);this.enterFace(s,obstacle,faces[0][0],faces[0][1]);return}
  s.p.set(next.x,floor+.035,next.z);s.normal.copy(UP);s.lastGround=s.p.clone();
 }
 crawl(s,dt,env){const q=s.surface;if(!q||!visible(q.root)){s.surface=null;s.mode='ground';s.p.y=env.ground(s.p.x,s.p.z)+.035;s.normal.copy(UP);return}
  if(q.mesh){q.mesh.updateWorldMatrix(true,false);q.box.setFromObject(q.mesh)}
  const b=q.box,next=s.p.clone().addScaledVector(s.direction,.62*dt),old=s.normal.clone();
  for(const axis of axes){if(axis===s.face.axis)continue;const sign=next[axis]>b.max[axis]?1:next[axis]<b.min[axis]?-1:0;if(!sign)continue;
   if(axis==='y'&&sign<0&&b.min.y<=env.ground(s.p.x,s.p.z)+.18){s.mode='ground';s.surface=null;s.normal.copy(UP);s.direction.copy(old);s.direction.y=0;if(s.direction.lengthSq()<.01)s.direction.set(1,0,0);s.direction.normalize();s.p.y=env.ground(s.p.x,s.p.z)+.035;return}
   this.enterFace(s,q,axis,sign);s.direction.copy(old).negate();return;
  }
  s.p.copy(next);s.p[s.face.axis]=(s.face.sign>0?b.max:b.min)[s.face.axis]+s.face.sign*.035;
  if(q.mesh){q.mesh.updateWorldMatrix(true,false);this.ray.set(s.p.clone().addScaledVector(s.normal,.3),s.normal.clone().negate());this.ray.far=2;let hits=this.ray.intersectObject(q.mesh,false);if(!hits.length){const origin=s.p.clone().addScaledVector(s.normal,.3),toward=q.box.getCenter(new T.Vector3()).sub(origin).normalize();this.ray.set(origin,toward);this.ray.far=q.box.getSize(new T.Vector3()).length()+1;hits=this.ray.intersectObject(q.mesh,false)}if(hits[0]){const hit=hits[0],normal=hit.face.normal.clone().applyMatrix3(new T.Matrix3().getNormalMatrix(q.mesh.matrixWorld)).normalize();s.p.copy(hit.point).addScaledVector(normal,.035);s.normal.copy(normal)}}
  // Join overlapping shell, roof and furniture surfaces without entering their solid volume.
  for(const other of this.nearby(s.p)){if(other===q||!other.box.containsPoint(s.p))continue;const options=[];for(const axis of axes)for(const sign of [-1,1])options.push({axis,sign,d:Math.abs(s.p[axis]-(sign>0?other.box.max:other.box.min)[axis])});options.sort((a,b)=>a.d-b.d);if(options[0].d<.4){this.enterFace(s,other,options[0].axis,options[0].sign);break}}
 }
 weave(s,env={ground:()=>0}){
  if(s.mode!=='surface'||!s.surface||s.p.y<env.ground(s.p.x,s.p.z)+.7)return false;
  // Prefer separate supports: the sheet spans the opening instead of lying on soil.
  const own=s.surface,other=this.nearby(s.p).filter(q=>q!==own&&q.box.min.y<s.p.y&&q.box.max.y>s.p.y).map(q=>({q,p:q.box.clampPoint(s.p,new T.Vector3())})).filter(v=>v.p.distanceTo(s.p)>.5&&v.p.distanceTo(s.p)<5).sort((a,b)=>a.p.distanceTo(s.p)-b.p.distanceTo(s.p))[0];
  if(other){
   const a=s.p.clone(),b=other.p.clone();b.y=a.y;const x=b.clone().sub(a).normalize(),up=UP.clone(),normal=new T.Vector3().crossVectors(up,x).normalize(),height=Math.min(.85,(a.y-env.ground((a.x+b.x)/2,(a.z+b.z)/2))*.65);
   if(height<.3)return false;this.assetsReady();if(this.webs.length>=(this.mobile?18:WEB_LIMIT))this.webs.shift().g.removeFromParent();
   const g=new T.LineSegments(this.assets.web,this.assets.thread);g.position.copy(a).add(b).multiplyScalar(.5);g.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(x,normal,up));g.scale.set(a.distanceTo(b)/2,1,height);this.root.add(g);this.webs.push({g,level:s.level,natural:!!s.natural,left:90,anchor:own.root,anchor2:other.q.root,normal});this.stats.webs++;return true;
  }
  this.assetsReady();let radius=Math.min(.6+this.random()*.35,s.p.y-env.ground(s.p.x,s.p.z)-.3);if(s.surface){const b=s.surface.box,room=axes.filter(k=>k!==s.face.axis).map(k=>(b.max[k]-b.min[k])*.46);radius=Math.min(radius,...room)}if(radius<.14)return false;
  if(this.webs.length>=(this.mobile?18:WEB_LIMIT)){this.webs.shift().g.removeFromParent()}
  const g=new T.LineSegments(this.assets.web,this.assets.thread);g.position.copy(s.p).addScaledVector(s.normal,.014);g.quaternion.setFromUnitVectors(UP,s.normal);g.scale.setScalar(radius);this.root.add(g);g.visible=s.level===this.level;this.webs.push({g,level:s.level,natural:!!s.natural,left:90,anchor:s.surface?.root||null,normal:s.normal.clone()});this.stats.webs++;return true;
 }
 attach(s,host){s.host=host;s.mode='host';s.surface=null;s.bite=1.8;s.lastGround=s.p.clone();this.stats.attachments++}
 hostPose(s){const a=Math.sin(this.time*.7+s.id)*2.1,y=.6+(Math.sin(this.time*.9+s.id)+1)*.75,local=new T.Vector3(Math.sin(a)*.4,y,Math.cos(a)*.29);s.host.updateWorldMatrix(true,true);s.p.copy(s.host.localToWorld(local));s.normal.set(Math.sin(a),0,Math.cos(a)).transformDirection(s.host.matrixWorld);s.direction.set(0,1,0)}
 syncHosts(){if(!this.root.visible)return;for(const s of this.spiders)if(s.host&&s.level===this.level){this.hostPose(s);this.pose(s,0)}}
 detach(s,env){const host=s.host;if(!host)return;host.updateWorldMatrix(true,false);const p=host.getWorldPosition(new T.Vector3()),a=s.id*2.4;s.p.set(clamp(p.x+Math.sin(a)*1.8,-41,41),0,clamp(p.z+Math.cos(a)*1.8,-41,41));if(env.wet?.(s.p.x,s.p.z)&&s.lastGround)s.p.copy(s.lastGround);s.p.y=env.ground(s.p.x,s.p.z)+.035;s.host=null;s.mode='ground';s.surface=null;s.normal.copy(UP);s.direction.set(Math.sin(a),0,Math.cos(a));s.immune=4;s.wait=3}
 shake(host,env){let count=0;for(const s of this.spiders)if(s.host===host){this.detach(s,env);count++}return count}
 update(elapsed,env){if(!this.spiders.length&&!this.venom)return;const total=clamp(elapsed,0,.5),steps=Math.max(1,Math.ceil(total/.05));for(let n=0;n<steps;n++)this.step(total/steps,env)}
 step(dt,env){this.time+=dt;this.biteCooldown=Math.max(0,this.biteCooldown-dt);
  if(this.venom>0){this.venom=Math.max(0,this.venom-dt);this.poisonClock-=dt;if(this.poisonClock<=0){this.poisonClock=2.5;env.damage?.('poison')}}
  for(let i=this.webs.length-1;i>=0;i--){const w=this.webs[i];w.g.visible=w.level===this.level&&visible(w.anchor)&&visible(w.anchor2);if(w.anchor&&!visible(w.anchor)||w.anchor2&&!visible(w.anchor2))w.left=0;if(w.level===this.level)w.left-=dt;if(w.left<=0){w.g.removeFromParent();this.webs.splice(i,1)}}
  for(const s of [...this.spiders]){s.g.visible=s.level===this.level&&(!s.surface||visible(s.surface.root));if(!s.g.visible)continue;if(s.mode==='sinking'){s.sinkAge+=dt;s.p.y-=dt*.8;s.normal.copy(UP);this.pose(s,dt);if(s.sinkAge>1.4)this.remove(s);continue}
   const water=env.water?.(s.p.x,s.p.z),wet=env.wet?.(s.p.x,s.p.z),waterY=water?.y??env.ground(s.p.x,s.p.z)+.15;
   if(!s.host&&wet&&s.p.y<=waterY+.06){s.mode='sinking';s.host=null;s.surface=null;s.sinkAge=0;continue}
   s.immune=Math.max(0,s.immune-dt);s.steps+=dt*8;s.webClock-=dt;
   if(s.mode==='host'){
    if(!env.player||s.host!==env.player||env.animal){this.detach(s,env);continue}
    this.hostPose(s);s.bite-=dt;
    if(s.bite<=0&&this.biteCooldown<=0){s.bite=3.5;this.biteCooldown=2.5;if(env.damage?.('bite')!==false){this.venom=8;this.poisonClock=2.5;this.stats.bites++}}
   }else{
    if(env.player&&!env.animal&&s.immune<=0&&!this.spiders.some(o=>o.host===env.player)){const p=env.player.getWorldPosition(new T.Vector3());if(Math.hypot(s.p.x-p.x,s.p.z-p.z)<.62&&s.p.y>p.y-.15&&s.p.y<p.y+1.8&&env.clear?.(s.p,p)!==false){this.attach(s,env.player);env.attached?.();continue}}
    s.wait-=dt;if(s.wait<=0){const v=new T.Vector3(this.random()-.5,this.random()-.3,this.random()-.5);v.addScaledVector(s.normal,-v.dot(s.normal));if(v.lengthSq()>.01)s.direction.copy(v.normalize());s.wait=3+this.random()*4}
    if(s.mode==='surface'){if(s.face.axis!=='y'&&s.p.y<env.ground(s.p.x,s.p.z)+2.2){s.direction.set(0,1,0);s.wait=1}this.crawl(s,dt,env)}else this.ground(s,dt,env);
    if(s.webClock<=0){this.weave(s,env);s.webClock=8+this.random()*7}
   }
   this.pose(s,dt);
  }
 }
 pose(s,dt){s.visualNormal.lerp(s.normal,Math.min(1,dt*12||1)).normalize();const forward=s.direction.clone().addScaledVector(s.visualNormal,-s.direction.dot(s.visualNormal));if(forward.lengthSq()<.001){forward.set(0,Math.abs(s.visualNormal.y)<.9?1:0,Math.abs(s.visualNormal.y)<.9?0:1);forward.addScaledVector(s.visualNormal,-forward.dot(s.visualNormal))}forward.normalize();const right=new T.Vector3().crossVectors(s.visualNormal,forward).normalize(),matrix=new T.Matrix4().makeBasis(right,s.visualNormal,forward);s.g.quaternion.setFromRotationMatrix(matrix);s.g.position.copy(s.p);
  const dummy=this.dummy,put=(i,pos,scale,q=null)=>{dummy.position.copy(pos);dummy.scale.copy(scale);dummy.quaternion.copy(q||new T.Quaternion());dummy.updateMatrix();s.mesh.setMatrixAt(i,dummy.matrix)};
  put(0,new T.Vector3(0,.12,-.11),new T.Vector3(.14,.1,.19));put(1,new T.Vector3(0,.11,.14),new T.Vector3(.1,.08,.11));
  for(let leg=0;leg<8;leg++){const side=leg<4?-1:1,row=leg%4,z=-.17+row*.115,phase=s.steps+row*Math.PI*.65+(side<0?Math.PI:0),swing=Math.sin(phase)*.055,lift=Math.max(0,Math.cos(phase))*.055,base=new T.Vector3(side*.07,.12,z),joint=new T.Vector3(side*.24,.17,z+swing),tip=new T.Vector3(side*.39,.025+lift,z*1.6+swing);for(const [j,a,b]of [[0,base,joint],[1,joint,tip]]){const v=b.clone().sub(a),q=new T.Quaternion().setFromUnitVectors(UP,v.clone().normalize());put(2+leg*2+j,a.clone().add(b).multiplyScalar(.5),new T.Vector3(.018,v.length()/2,.018),q)}}
  for(const [i,x]of [[18,-.045],[19,.045]])put(i,new T.Vector3(x,.15,.23),new T.Vector3(.022,.022,.022));for(const [i,x]of [[20,-.04],[21,.04]])put(i,new T.Vector3(x,.07,.23),new T.Vector3(.014,.022,.04));s.mesh.instanceMatrix.needsUpdate=true;
 }
 threat(p,radius=4.5){let best=null,distance=radius;for(const s of this.spiders){if(s.level!==this.level||s.mode==='sinking'||Math.abs(s.p.y-p.y)>1.8)continue;const d=Math.hypot(s.p.x-p.x,s.p.z-p.z);if(d<distance){best=s;distance=d}}return best}
 inspect(){return{...this.stats,websSpun:this.stats.webs,level:this.level,count:this.spiders.filter(s=>s.level===this.level).length,total:this.spiders.length,webs:this.webs.filter(w=>w.level===this.level).length,venom:this.venom,spiders:this.spiders.map(s=>({id:s.id,level:s.level,mode:s.mode,position:s.p.toArray(),normal:s.normal.toArray(),host:!!s.host}))}}
}
