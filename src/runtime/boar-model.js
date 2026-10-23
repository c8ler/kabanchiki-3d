import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 9 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let friends,foes,defeatedBoars,apples;

function makePursuitBolt(){
 if(!runtime.pursuitBoltMaterial){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=192;
  const ctx=canvas.getContext('2d');ctx.lineJoin='round';ctx.lineWidth=10;ctx.strokeStyle='#493119';
  ctx.beginPath();ctx.moveTo(78,14);ctx.lineTo(26,106);ctx.lineTo(62,106);ctx.lineTo(48,178);ctx.lineTo(108,76);ctx.lineTo(72,76);ctx.closePath();
  const fill=ctx.createLinearGradient(0,14,0,178);fill.addColorStop(0,'#fff4a3');fill.addColorStop(1,'#ffbc26');ctx.fillStyle=fill;ctx.stroke();ctx.fill();
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  runtime.pursuitBoltMaterial=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false,fog:false});
 }
 const bolt=new THREE.Sprite(runtime.pursuitBoltMaterial);bolt.position.set(0,2.35,0);bolt.scale.set(.7,1.05,1);bolt.visible=false;bolt.userData.pursuitIndicator=true;return bolt;
}

function makeBoar(x,z,friendly){const g=runtime.group(x,z);const b=new THREE.Group();g.add(b);const aura=new THREE.Mesh(new THREE.RingGeometry(1.05,1.28,20),new THREE.MeshBasicMaterial({color:friendly?0x4cff72:0xff4b4b,transparent:true,opacity:.18,side:THREE.DoubleSide}));aura.rotation.x=-Math.PI/2;aura.position.y=.04;g.add(aura);const bolt=makePursuitBolt();g.add(bolt);runtime.block(b,friendly?runtime.mats.boar2:runtime.mats.boar,0,.65,0,1.2,.85,1.7);runtime.block(b,friendly?runtime.mats.boar2:runtime.mats.boar,0,.85,.83,1.04,.9,.9);runtime.block(b,runtime.mats.pink,0,.67,1.35,.67,.4,.25);for(const xx of [-.18,.18])runtime.block(b,runtime.mats.black,xx,.69,1.49,.075,.075,.025);for(const xx of [-.55,.55]){runtime.block(b,runtime.mats.white,xx,.64,1.18,.19,.3,.18);runtime.block(b,runtime.mats.boar,xx,1.32,.5,.32,.46,.18)}const eyes=[];for(const xx of [-.34,.34]){runtime.block(b,runtime.mats.white,xx,.98,1.29,.15,.15,.1);const eye=runtime.block(b,runtime.mats.black,xx,1,1.36,.07,.07,.04);eyes.push(eye);runtime.block(b,runtime.mats.boar,xx,.24,-.5,.25,.46,.3);runtime.block(b,runtime.mats.boar,xx,.24,.58,.25,.46,.3);runtime.block(b,runtime.mats.boar,xx,1.44,.65,.28,.42,.25)}runtime.block(b,runtime.mats.boar,0,.83,-1.02,.2,.22,.5);if(friendly){const mark=new THREE.Mesh(new THREE.RingGeometry(.18,.28,16),new THREE.MeshBasicMaterial({color:0x65ff7b,side:THREE.DoubleSide}));mark.position.set(0,2.05,0);mark.rotation.x=Math.PI/2;g.add(mark)}else{}
const earMat=new THREE.MeshLambertMaterial({color:friendly?0x7a5638:0x5b3b2b}),tuskMat=new THREE.MeshLambertMaterial({color:0xf1e1bd}),hoofMat=new THREE.MeshLambertMaterial({color:0x2b211c});
for(const sx of [-1,1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.19,.42,4),earMat);ear.position.set(sx*.52,1.52,.52);ear.rotation.z=sx*.34;ear.rotation.x=-.12;b.add(ear);const tusk=new THREE.Mesh(new THREE.ConeGeometry(.075,.30,6),tuskMat);tusk.position.set(sx*.35,.83,1.38);tusk.rotation.x=Math.PI/2;b.add(tusk)}
for(const sx of [-1,1])for(const zz of [-.48,.48])runtime.block(b,hoofMat,sx*.52,.13,zz,.34,.25,.42);
const tailPivot=new THREE.Group();tailPivot.position.set(0,.92,-1.18);const tail=runtime.block(tailPivot,earMat,0,.12,-.18,.12,.12,.48);tail.rotation.x=.45;b.add(tailPivot);
// Shared geometry and materials keep the extra fur inexpensive.
const furMat=friendly?runtime.mats.boar2:runtime.mats.boar;
for(let i=0;i<9;i++){const tuft=runtime.block(b,furMat,0,1.13+(i%3)*.035,-.78+i*.18,.32,.24+(i%2)*.08,.22);tuft.rotation.x=-.24}
for(const sx of [-1,1])for(let i=0;i<5;i++){const tuft=runtime.block(b,furMat,sx*.59,.62+(i%2)*.18,-.65+i*.29,.14,.24,.25);tuft.rotation.z=sx*.22}
runtime.block(b,furMat,0,.79,1.38,.72,.42,.14);
for(const sx of [-1,1]){runtime.block(b,runtime.mats.black,sx*.18,.80,1.46,.10,.10,.025);const brow=runtime.block(b,furMat,sx*.34,1.14,1.32,.27,.09,.14);brow.rotation.z=sx*(friendly?.08:-.20)}
const enemyEyeMat=new THREE.MeshStandardMaterial({color:0xff342c,emissive:0xff1008,emissiveIntensity:3,roughness:.5});
const enemyEyes=[];for(const sx of [-1,1]){const e=runtime.block(b,enemyEyeMat,sx*.34,1.0,1.39,.13,.12,.035);e.visible=!friendly;enemyEyes.push(e)}
const jaw=runtime.block(b,furMat,0,.48,1.31,.64,.15,.30);const mouthful=new THREE.Group();mouthful.position.set(0,.48,1.53);for(let i=0;i<5;i++){const blade=runtime.block(mouthful,runtime.mats.grass,(i-2)*.065,0,0,.035,.32,.025);blade.rotation.z=(i-2)*.3}mouthful.visible=false;b.add(mouthful);g.userData.grazingJaw=jaw;g.userData.grazingGrass=mouthful;g.userData.enemyEyes=enemyEyes;
g.userData.visualRemaster=true;g.userData.tailPivot=tailPivot;g.traverse(o=>{if(o.isMesh){o.castShadow=!runtime.mobile;o.receiveShadow=!runtime.mobile}});
return {g,b,aura,bolt,eyes,x,z,friendly,done:false,angle:runtime.rand(0,7),phase:runtime.rand(0,7),attackCd:0,idleTimer:runtime.rand(1,4),blinkTimer:runtime.rand(1,4),graze:0,roamTimer:runtime.rand(1,4),roamX:x,roamZ:z,roamPause:runtime.rand(.4,1.8)}}
 // природные припасы: яблоки, грибы, капуста и лечебные ягоды
function updateBoarChewing(f,now,active){const jaw=f.g.userData.grazingJaw,grass=f.g.userData.grazingGrass;if(!jaw||!grass)return;grass.visible=active;const chew=active?Math.sin(now*.018+f.phase):0;jaw.position.y=.48+chew*.045;jaw.position.x=chew*.035;grass.rotation.z=chew*.12;grass.position.y=.48+chew*.045;if(active){f.b.rotation.x=.34+Math.sin(now*.004+f.phase)*.035;f.b.position.y=-.10}}

function clearEntities(arr){for(const o of arr)runtime.scene.remove(o.g);arr.length=0}

function softCrateSound(){if(!runtime.sfxEnabled)return;try{runtime.audio??=new (window.AudioContext||window.webkitAudioContext)();if(runtime.audio.state==='suspended')runtime.audio.resume();const t=runtime.audio.currentTime;[[330,0,.16,.016],[440,.09,.20,.012],[554,.18,.24,.009]].forEach(([freq,delay,dur,gain])=>{const o=runtime.audio.createOscillator(),g=runtime.audio.createGain();o.type='sine';o.frequency.setValueAtTime(freq,t+delay);o.frequency.exponentialRampToValueAtTime(freq*.92,t+delay+dur);g.gain.setValueAtTime(.0001,t+delay);g.gain.exponentialRampToValueAtTime(gain,t+delay+.035);g.gain.exponentialRampToValueAtTime(.0001,t+delay+dur);o.connect(g).connect(runtime.audioBus('effects'));o.start(t+delay);o.stop(t+delay+dur+.03)})}catch{}}
 return {
  bindings:{
"makePursuitBolt":{get:()=>makePursuitBolt},
"makeBoar":{get:()=>makeBoar},
"friends":{get:()=>friends},
"foes":{get:()=>foes},
"defeatedBoars":{get:()=>defeatedBoars},
"apples":{get:()=>apples},
"updateBoarChewing":{get:()=>updateBoarChewing},
"clearEntities":{get:()=>clearEntities},
"softCrateSound":{get:()=>softCrateSound}
  },
  initialize(){

/* init:const */ friends = [];

/* init:const */ foes = [];

/* init:const */ defeatedBoars = [];

/* init:const */ apples = [];
  }
 };

}
