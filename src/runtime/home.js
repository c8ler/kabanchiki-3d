import { HOME_SITE, WOOD_PILES } from "../home-construction.js?v=222";
import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 7 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function saveHome(){try{localStorage.setItem('kabanchiki3d_home',JSON.stringify(runtime.home.save()))}catch{}}

function prepareHome(){if(runtime.personalHouse)return;runtime.personalHouse=new THREE.Group();runtime.personalHouse.position.set(HOME_SITE.x,0,HOME_SITE.z);runtime.personalHouse.userData.enterable=true;runtime.personalHouse.userData.personalHome=true;runtime.scene.add(runtime.personalHouse);runtime.houseObjects.push(runtime.personalHouse);
 const floor=runtime.block(runtime.personalHouse,runtime.mats.wood,0,.08,0,4.8,.16,4.8),front=[runtime.block(runtime.personalHouse,runtime.mats.wood,-1.6,1.45,2.4,1.6,2.7,.2),runtime.block(runtime.personalHouse,runtime.mats.wood,1.6,1.45,2.4,1.6,2.7,.2)],back=[runtime.block(runtime.personalHouse,runtime.mats.wood,0,1.45,-2.4,4.8,2.7,.2)],left=[runtime.block(runtime.personalHouse,runtime.mats.wood,-2.4,1.45,0,.2,2.7,4.8)],right=[runtime.block(runtime.personalHouse,runtime.mats.wood,2.4,1.45,0,.2,2.7,4.8)],roof=runtime.block(runtime.personalHouse,runtime.mats.roof,0,3,0,5.3,.4,5.3);
 const furnishings=new THREE.Group();runtime.personalHouse.add(furnishings);runtime.block(furnishings,runtime.mats.wood,1.2,.7,-.9,1.1,.12,.9);for(const x of [.8,1.6])for(const z of [-1.2,-.6])runtime.block(furnishings,runtime.mats.wood,x,.35,z,.1,.65,.1);runtime.block(furnishings,runtime.mats.wood,.9,.35,.3,.6,.1,.6);runtime.block(furnishings,runtime.mats.wood,.9,.55,.65,.6,.6,.1);runtime.block(furnishings,runtime.mats.wood,-1.3,.32,-1,1.3,.35,2);runtime.block(furnishings,runtime.mats.white,-1.3,.58,-1,1.25,.18,1.9);
 front.push(runtime.block(runtime.personalHouse,runtime.mats.wood,0,2.45,2.4,1.6,.7,.2));front.at(-1).userData.doorLintel=true;
 const doorHinge=new THREE.Group();doorHinge.position.set(-.8,.16,2.52);runtime.personalHouse.add(doorHinge);
 const door=runtime.block(doorHinge,runtime.doorMat,.8,.95,0,1.6,1.9,.12);runtime.sphere(door,runtime.mats.gold,.55,0,.09,.07);door.userData.homeDoor=true;
 const lamp=new THREE.Group();runtime.personalHouse.add(lamp);runtime.block(lamp,runtime.mats.wood,0,2.52,0,.28,.08,.28);const glow=runtime.block(lamp,new THREE.MeshBasicMaterial({color:0xffdf9b}),0,2.35,0,.2,.28,.2),light=runtime.makeEffectLight(0xffdfaa,5,9);light.position.set(0,2.2,0);light.userData.primary=true;lamp.add(light);furnishings.traverse(o=>{if(o.isMesh)o.userData.solidInterior=true;});runtime.homeParts={floor,front,back,left,right,roof,furnishings,doorHinge,door,lamp,light};runtime.homeYard=new THREE.Group();runtime.scene.add(runtime.homeYard);for(const [x,z] of [[-2.6,-2.6],[2.6,-2.6],[-2.6,2.6],[2.6,2.6]])runtime.block(runtime.homeYard,runtime.mats.wood,HOME_SITE.x+x,.4,HOME_SITE.z+z,.15,.8,.15);runtime.physicalSign(runtime.homeYard,'МОЙ ДОМИК · B',HOME_SITE.x,3.8,HOME_SITE.z+3,5,1);const trail=new THREE.Mesh(new THREE.PlaneGeometry(23,2.2),runtime.mats.path);trail.rotation.x=-Math.PI/2;trail.position.set(-17.5,.024,31.5);runtime.homeYard.add(trail);runtime.homeYard.userData.trail=trail;runtime.physicalSign(runtime.homeYard,'← СВОЙ ДОМИК',-5,2.1,32,4,.9);
 for(const p of WOOD_PILES){const pile=new THREE.Group();pile.position.set(p.x,0,p.z);for(let i=0;i<5;i++){const log=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,2,8),runtime.mats.wood);log.rotation.z=Math.PI/2;log.position.set((i%2)*.28,.18+Math.floor(i/2)*.22,0);pile.add(log);}runtime.scene.add(pile);runtime.homePiles.push(pile)}syncHomeVisual();syncHomeLocation(runtime.level);
}

function syncHomeVisual(){if(!runtime.personalHouse)return;for(const r of runtime.stormRemains)if(r.userData.bombHome&&runtime.home.stage>0)r.visible=false;const p=runtime.homeParts;p.floor.visible=runtime.home.stage>0;for(const side of ['front','back','left','right'])for(const m of p[side])m.visible=runtime.home.stage>=2;p.roof.visible=p.furnishings.visible=runtime.home.stage>=3;p.doorHinge.visible=runtime.home.stage>=2;p.lamp.visible=runtime.home.stage>=4;runtime.personalHouse.userData.cutawayWalls={front:runtime.home.stage>=2?p.front:[],back:runtime.home.stage>=2?p.back:[],left:runtime.home.stage>=2?p.left:[],right:runtime.home.stage>=2?p.right:[],roof:p.roof};for(let i=0;i<runtime.homePiles.length;i++)runtime.homePiles[i].visible=runtime.level===3&&!runtime.home.collected[i];runtime.wallCacheEpoch=-1;}

function syncHomeLocation(n){if(!runtime.personalHouse)return;runtime.personalHouse.visible=runtime.homeYard.visible=n===3&&runtime.homeUnlocked;if(runtime.homeParts?.lamp)runtime.homeParts.lamp.visible=n===3&&runtime.homeUnlocked&&runtime.home.stage>=4;runtime.homeYard.userData.trail.material=runtime.currentSeason==='winter'?runtime.winterRoadMaterial:runtime.mats.path;for(let i=0;i<runtime.homePiles.length;i++)runtime.homePiles[i].visible=n===3&&runtime.homeUnlocked&&!runtime.home.collected[i];if(n===3&&runtime.homeUnlocked){const clear=(x,z)=>Math.hypot(x-HOME_SITE.x,z-HOME_SITE.z)<7||(x>-29&&x<-5&&Math.abs(z-31.5)<2.1)||WOOD_PILES.some(p=>Math.hypot(x-p.x,z-p.z)<3);for(const tree of runtime.treeObjects)if(clear(tree.position.x,tree.position.z))tree.visible=false;for(const [x,z,,mesh] of runtime.rockPositions)if(clear(x,z))mesh.visible=false;}}

function homeInteraction(){if(!runtime.homeUnlocked||runtime.level!==3||!runtime.started||runtime.paused||runtime.cinematicRunning||runtime.life<=0||runtime.mountedFriend||runtime.catFormTime>0||runtime.boarFormTime>0)return null;for(let i=0;i<WOOD_PILES.length;i++)if(!runtime.home.collected[i]&&Math.hypot(runtime.boy.position.x-WOOD_PILES[i].x,runtime.boy.position.z-WOOD_PILES[i].z)<3)return {kind:'wood',i};if(Math.hypot(runtime.boy.position.x-HOME_SITE.x,runtime.boy.position.z-(HOME_SITE.z+3.8))<4&&runtime.home.stage<4)return {kind:'build'};return null}

function updateHomeUI(){if(runtime.level===3&&runtime.homeParts?.doorHinge){const near=Math.hypot(runtime.boy.position.x-HOME_SITE.x,runtime.boy.position.z-HOME_SITE.z-2.4)<3||runtime.friend?.g&&Math.hypot(runtime.friend.g.position.x-HOME_SITE.x,runtime.friend.g.position.z-HOME_SITE.z-2.4)<3;runtime.homeParts.doorHinge.rotation.y=near?-Math.PI*.48:0;runtime.homeParts.door.userData.closed=!near;}const action=homeInteraction(),button=runtime.$('homeAction');button.hidden=!action;if(action)button.textContent=action.kind==='wood'?'🪵 Собрать доски · B':`🏠 ${['Построить пол','Построить стены','Построить крышу','Провести освещение'][runtime.home.stage]} · B (${runtime.home.wood}/2)`;if(runtime.home.stage>=3&&runtime.personalHouse?.visible)runtime.setHomeHouseCutaway(Math.abs(runtime.boy.position.x-HOME_SITE.x)<2.25&&Math.abs(runtime.boy.position.z-HOME_SITE.z)<2.25&&runtime.py<2.8);}

function interactHome(){const action=homeInteraction();if(!action)return;if(action.kind==='wood'){runtime.home.collect(action.i);runtime.notice(`🪵 Собраны доски: ${runtime.home.wood}. Неси их к площадке «Мой домик».`)}else{if(!runtime.home.build()){runtime.notice('🪵 Нужны 2 доски. Найди штабели рядом с поляной.');return}runtime.worldEpoch++;runtime.tagStormTargetsForCurrentLocation();runtime.notice(runtime.home.stage===4?'💡 Свет включён! Домик достроен.':runtime.home.stage===3?'🏠 Крыша готова! Дверь уже на месте. Осталось провести освещение.':['','🏠 Пол готов. Теперь нужны стены.','🚪 Стены и дверь готовы. Осталось построить крышу.'][runtime.home.stage])}saveHome();syncHomeVisual();syncHomeLocation(runtime.level);updateHomeUI();}
 return {
  bindings:{
"saveHome":{get:()=>saveHome},
"prepareHome":{get:()=>prepareHome},
"syncHomeVisual":{get:()=>syncHomeVisual},
"syncHomeLocation":{get:()=>syncHomeLocation},
"homeInteraction":{get:()=>homeInteraction},
"updateHomeUI":{get:()=>updateHomeUI},
"interactHome":{get:()=>interactHome}
  },
  initialize(){

runtime.$('homeAction').onclick=interactHome;
  }
 };

}
