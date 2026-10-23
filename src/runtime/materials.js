import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 8 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let textureSpecs,signBoards,cube;

function pixelTexture(seed=1,base=[180,180,180],accent=[130,130,130],kind='noise'){
 const w=16,h=16,data=new Uint8Array(w*h*4);let n=(seed*1103515245+12345)>>>0;
 const rnd=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)>>>8)/16777216;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let mix=.10+rnd()*.18;
  if(kind==='grass'&&((x+y*3)%7===0||rnd()<.08))mix=.42;
  if(kind==='wood'&&(x%4===0||x%4===1))mix=.34+rnd()*.12;
  if(kind==='stone'&&((x*3+y*5+seed)%11<2))mix=.36;
  if(kind==='cloth'&&((x+y)%4===0))mix=.24;
  if(kind==='fur'&&((x*5+y*3+seed)%9<2))mix=.30;
  if(kind==='roof'&&((x+y)%5===0))mix=.38;
  const i=(y*w+x)*4;data[i]=base[0]*(1-mix)+accent[0]*mix;data[i+1]=base[1]*(1-mix)+accent[1]*mix;data[i+2]=base[2]*(1-mix)+accent[2]*mix;data[i+3]=255;
 }
 const t=new THREE.DataTexture(data,w,h,THREE.RGBAFormat);t.needsUpdate=true;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t
}

function block(parent,mat,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(cube,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=!runtime.mobile;m.receiveShadow=!runtime.mobile;parent.add(m);return m}

function sphere(parent,mat,x,y,z,r=.3){const m=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),mat);m.position.set(x,y,z);m.castShadow=!runtime.mobile;m.receiveShadow=!runtime.mobile;parent.add(m);return m}

function group(x,z){const g=new THREE.Group();g.position.set(x,0,z);runtime.scene.add(g);return g}

function rand(a,b){return a+Math.random()*(b-a)}
 return {
  bindings:{
"pixelTexture":{get:()=>pixelTexture},
"textureSpecs":{get:()=>textureSpecs},
"signBoards":{get:()=>signBoards},
"cube":{get:()=>cube},
"block":{get:()=>block},
"sphere":{get:()=>sphere},
"group":{get:()=>group},
"rand":{get:()=>rand}
  },
  initialize(){

/* init:const */ textureSpecs = {
 grass:[1,[170,211,115],[133,184,89],'grass'],soil:[2,[146,113,77],[92,69,48],'noise'],path:[3,[183,160,109],[135,111,73],'stone'],leaf:[4,[57,131,75],[29,92,47],'grass'],leaf2:[5,[77,152,84],[40,112,58],'grass'],wood:[6,[118,82,57],[72,47,32],'wood'],stone:[7,[139,154,157],[91,104,108],'stone'],skin:[8,[242,186,131],[215,147,100],'noise'],hair:[9,[101,64,43],[57,37,27],'fur'],shirt:[10,[55,118,188],[31,72,126],'cloth'],pants:[11,[53,70,91],[31,43,60],'cloth'],boar:[12,[128,81,60],[76,46,35],'fur'],boar2:[13,[168,121,85],[112,76,54],'fur'],pink:[14,[228,165,160],[184,115,111],'noise'],white:[15,[248,241,223],[204,199,184],'cloth'],black:[16,[33,28,28],[12,10,10],'noise'],red:[17,[210,60,55],[137,35,32],'cloth'],gold:[18,[255,213,94],[191,142,43],'noise'],roof:[19,[182,92,67],[116,52,43],'roof']};

for(const name of Object.keys(runtime.mats)){const old=runtime.mats[name];runtime.mats[name]=new THREE.MeshStandardMaterial({color:old.color,roughness:name==='gold'?.48:.92,metalness:name==='gold'?.18:0});old.dispose()}

for(const [name,spec] of Object.entries(textureSpecs)){const [seed,base,accent,kind]=spec;runtime.mats[name].map=pixelTexture(seed,base,accent,kind);runtime.mats[name].color.set(0xffffff);runtime.mats[name].needsUpdate=true}

/* init:const */ signBoards = [];

/* init:const */ cube = new THREE.BoxGeometry(1,1,1);
  }
 };

}
