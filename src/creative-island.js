export const SECRET_LEVEL=7;
export function islandDepth(x,z){const r=Math.hypot(x+18,z+15);return r<8?1.3*(1-r/8)**2:0}
export function islandHeight(x,z){if(Math.hypot(x+18,z+15)<10||Math.abs(x)<5)return 0;return .18*Math.sin(x*.11)**2*Math.sin(z*.1)**2}
export function createIsland(T,materials){
 const root=new T.Group(),solids=[],rocks=[],mushrooms=[],supplies=[],make=(geo,material,x,y,z)=>{const m=new T.Mesh(geo,material);m.position.set(x,y,z);root.add(m);return m};
 const colors=[0x65e4df,0xf58cc7,0xb99afa,0xf2d479],mats=colors.map(color=>new T.MeshLambertMaterial({color}));
 const water=new T.Mesh(new T.CircleGeometry(8,48),new T.MeshPhongMaterial({color:0x67ebcb,transparent:true,opacity:.62,depthWrite:false,side:T.DoubleSide,shininess:90}));water.rotation.x=-Math.PI/2;water.position.set(-18,.12,-15);root.add(water);
 for(let i=0;i<12;i++){const first=root.children.length,a=i*2.399,x=Math.sin(a)*30,z=Math.cos(a)*29,h=3+i%4;
  const stem=make(new T.CylinderGeometry(.45,.65,h,7),materials.wood,x,h/2,z);stem.userData.collisionRadius=.55;solids.push(stem);
  const cap=make(new T.SphereGeometry(2.4+i%3*.35,10,6,0,Math.PI*2,0,Math.PI*.55),mats[i%4],x,h,z);cap.scale.y=.45;
  for(let j=0;j<3;j++)make(new T.SphereGeometry(.2,6,4),materials.white,x+Math.sin(j*2.1)*1.3,h+.7,z+Math.cos(j*2.1)*1.3);
  mushrooms.push({x,z,stem,cap,parts:root.children.slice(first),left:null,spent:false});
 }
 for(let i=0;i<7;i++){const x=10+(i%3)*5,z=-20+Math.floor(i/3)*7,h=1.2+i%3;
  const crystal=make(new T.OctahedronGeometry(1,5),mats[i%4],x,h*.55,z);crystal.scale.set(.75,h,.75);rocks.push([x,z,.8,crystal]);
 }
 const ring=make(new T.TorusGeometry(11,.22,6,40),mats[0],0,17,-26);ring.rotation.y=.4;root.userData.ring=ring;
 for(let i=0;i<5;i++){const a=i*1.6,m=make(new T.ConeGeometry(5+i%2,6,5),mats[(i+2)%4],Math.sin(a)*51,10+i*3,Math.cos(a)*51);m.rotation.z=Math.PI;const grass=make(new T.CylinderGeometry(5+i%2,5+i%2,.35,6),mats[i%4],m.position.x,m.position.y+3,m.position.z);grass.rotation.y=.3*i}
 for(let i=0;i<16;i++){const kind=['wood','wool','food','bomb'][i%4],a=i*2.399,x=i===0?0:Math.sin(a)*(12+i%3*5),z=i===0?16:Math.cos(a)*(12+i%3*5),g=make(new T.BoxGeometry(.85,.65,.85),mats[i%4],x,.45,z);const band=new T.Mesh(new T.BoxGeometry(.9,.12,.9),materials.white);g.add(band);supplies.push({g,kind,count:kind==='bomb'?2:8,left:0})}
 root.userData.supplies=supplies;root.userData.mushrooms=mushrooms;root.userData.solids=solids;root.userData.rocks=rocks;return root;
}

export function islandMushroomTop(root,x,z){let top=-Infinity;for(const m of root?.userData.mushrooms||[]){if(m.spent||!m.cap.visible)continue;const r=m.cap.geometry.parameters.radius,d=Math.hypot(x-m.x,z-m.z);if(d<r-.1)top=Math.max(top,m.cap.position.y+Math.sqrt(Math.max(0,r*r-d*d))*m.cap.scale.y)}return top}
