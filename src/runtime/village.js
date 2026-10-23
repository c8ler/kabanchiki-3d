import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 41 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let houseObjects,darkWindow,wallCream,wallBrick,wallPale,familyHideout,dadWallMat,dadRoofMat,dadFloorMat,dadFrontL,dadFrontR,dadBack,dadLeft,dadRight,dadRoof,dadFloor,hideDoor,windowGlowMat,familyWindow,windowFrameMat,doorMat,familyDoorHinge,familyDoor,familyDoorSlab,doorTrimMat,doorLintel,doorKnob,porchGlowMat,porchLamp,hideDoorGlow,dadInteriorGlow,houseFurnishings,insideTable,insideChair,insideBed,insideFireplace,hearthFlame,hearthLight,insideFamilyHouse;

function villageHouse(x,z,type=0,rot=0){
 const g=runtime.group(x,z);g.rotation.y=rot;
 const wall=[runtime.mats.wood,wallCream,wallBrick,wallPale][type%4];
 if(type===0){
   runtime.block(g,wall,0,1.45,0,5.4,2.9,4.4);runtime.block(g,runtime.mats.roof,0,3.15,0,6.1,.65,5.1);
   runtime.block(g,darkWindow,-1.55,1.55,2.22,.85,.85,.10);runtime.block(g,darkWindow,1.55,1.55,2.22,.85,.85,.10);
   runtime.block(g,runtime.mats.black,0,.9,2.25,.85,1.8,.12);
 }else if(type===1){
   runtime.block(g,wall,0,1.75,0,4.5,3.5,5.8);runtime.block(g,runtime.mats.roof,0,3.75,0,5.2,.72,6.5);
   runtime.block(g,wall,-1.35,3.85,0,1.45,1.35,2.1);runtime.block(g,runtime.mats.roof,-1.35,4.7,0,1.8,.42,2.45);
   runtime.block(g,darkWindow,1.2,1.8,2.92,.82,.92,.10);runtime.block(g,darkWindow,-1.2,1.8,2.92,.82,.92,.10);
   runtime.block(g,runtime.mats.black,0,.95,2.95,.82,1.9,.12);
 }else if(type===2){
   runtime.block(g,wall,-1.35,1.35,0,4.1,2.7,4.2);runtime.block(g,wall,1.45,1.1,-1.0,2.4,2.2,2.4);
   runtime.block(g,runtime.mats.roof,-1.35,2.95,0,4.8,.58,4.9);runtime.block(g,runtime.mats.roof,1.45,2.55,-1,2.9,.48,2.9);
   runtime.block(g,darkWindow,-1.55,1.45,2.12,.78,.78,.10);runtime.block(g,runtime.mats.black,.15,.82,2.14,.78,1.65,.12);
 }else{
   runtime.block(g,wall,0,1.25,0,6.5,2.5,3.5);runtime.block(g,runtime.mats.roof,0,2.78,0,7.2,.55,4.2);
   runtime.block(g,darkWindow,-2,1.35,1.77,.8,.78,.10);runtime.block(g,darkWindow,0,1.35,1.77,.8,.78,.10);runtime.block(g,darkWindow,2,1.35,1.77,.8,.78,.10);
   runtime.block(g,runtime.mats.black,2.7,.78,1.8,.72,1.55,.12);
 }
 g.visible=false;g.userData.enterable=false;houseObjects.push(g);return g
}

function furniture(name,x,z){const g=new THREE.Group();g.position.set(x,.16,z);g.userData.furniture=name;houseFurnishings.add(g);return g}
 return {
  bindings:{
"houseObjects":{get:()=>houseObjects},
"darkWindow":{get:()=>darkWindow},
"wallCream":{get:()=>wallCream},
"wallBrick":{get:()=>wallBrick},
"wallPale":{get:()=>wallPale},
"villageHouse":{get:()=>villageHouse},
"familyHideout":{get:()=>familyHideout},
"dadWallMat":{get:()=>dadWallMat},
"dadRoofMat":{get:()=>dadRoofMat},
"dadFloorMat":{get:()=>dadFloorMat},
"dadFrontL":{get:()=>dadFrontL},
"dadFrontR":{get:()=>dadFrontR},
"dadBack":{get:()=>dadBack},
"dadLeft":{get:()=>dadLeft},
"dadRight":{get:()=>dadRight},
"dadRoof":{get:()=>dadRoof},
"dadFloor":{get:()=>dadFloor},
"hideDoor":{get:()=>hideDoor},
"windowGlowMat":{get:()=>windowGlowMat},
"familyWindow":{get:()=>familyWindow},
"windowFrameMat":{get:()=>windowFrameMat},
"doorMat":{get:()=>doorMat},
"familyDoorHinge":{get:()=>familyDoorHinge},
"familyDoor":{get:()=>familyDoor},
"familyDoorSlab":{get:()=>familyDoorSlab},
"doorTrimMat":{get:()=>doorTrimMat},
"doorLintel":{get:()=>doorLintel},
"doorKnob":{get:()=>doorKnob},
"porchGlowMat":{get:()=>porchGlowMat},
"porchLamp":{get:()=>porchLamp},
"hideDoorGlow":{get:()=>hideDoorGlow},
"dadInteriorGlow":{get:()=>dadInteriorGlow},
"houseFurnishings":{get:()=>houseFurnishings},
"furniture":{get:()=>furniture},
"insideTable":{get:()=>insideTable},
"insideChair":{get:()=>insideChair},
"insideBed":{get:()=>insideBed},
"insideFireplace":{get:()=>insideFireplace},
"hearthFlame":{get:()=>hearthFlame},
"hearthLight":{get:()=>hearthLight},
"insideFamilyHouse":{get:()=>insideFamilyHouse,set:value=>{insideFamilyHouse=value}}
  },
  initialize(){

/* init:const */ houseObjects = [];

/* init:const */ darkWindow = new THREE.MeshLambertMaterial({color:0x27323a,map:runtime.pixelTexture(31,[39,50,58],[17,24,30],'stone')});

/* init:const */ wallCream = new THREE.MeshLambertMaterial({color:0xd7b77d,map:runtime.mats.wood.map});

/* init:const */ wallBrick = new THREE.MeshLambertMaterial({color:0xa85e45,map:runtime.mats.wood.map});

/* init:const */ wallPale = new THREE.MeshLambertMaterial({color:0xc7c09d,map:runtime.mats.wood.map});

villageHouse(-27,-27,0,.08);

villageHouse(-12,-29,1,-.08);

// v131: family hideout uses separate geometry; never fade/hide the whole building.
/* init:const */ familyHideout = runtime.group(30,-31);

familyHideout.userData.enterable=true;

familyHideout.userData.familyHideout=true;

familyHideout.visible=false;

houseObjects.push(familyHideout);

/* init:const */ dadWallMat = wallCream.clone();
/* init:const */ dadRoofMat = runtime.mats.roof.clone();
/* init:const */ dadFloorMat = runtime.mats.wood.clone();

/* init:const */ dadFrontL = runtime.block(familyHideout,dadWallMat,-1.75,1.5,2.18,1.9,3,.22);
/* init:const */ dadFrontR = runtime.block(familyHideout,dadWallMat,1.75,1.5,2.18,1.9,3,.22);

/* init:const */ dadBack = runtime.block(familyHideout,dadWallMat,0,1.5,-2.18,5.4,3,.22);
/* init:const */ dadLeft = runtime.block(familyHideout,dadWallMat,-2.6,1.5,0,.22,3,4.2);
/* init:const */ dadRight = runtime.block(familyHideout,dadWallMat,2.6,1.5,0,.22,3,4.2);

/* init:const */ dadRoof = runtime.block(familyHideout,dadRoofMat,0,3.25,0,5.9,.62,4.9);
/* init:const */ dadFloor = runtime.block(familyHideout,dadFloorMat,0,.08,0,5.15,.16,4.15);

for(const q of [dadFrontL,dadFrontR])q.userData.dadSide='front';

dadBack.userData.dadSide='back';

dadLeft.userData.dadSide='left';

dadRight.userData.dadSide='right';

dadRoof.userData.dadRoof=true;

dadFloor.userData.dadInterior=true;

familyHideout.userData.cutawayWalls={front:[dadFrontL,dadFrontR],back:[dadBack],left:[dadLeft],right:[dadRight],roof:dadRoof};

villageHouse(20,-23,3,-.10);

/* init:const */ hideDoor = new THREE.Group();

familyHideout.add(hideDoor);

// v132: the family-house door is closed in the doorway.
// The glowing window sits just outside the front wall face, so the wall cannot depth-occlude it.
// Its dark frame remains readable while the glass itself becomes transparent from inside.
/* init:const */ windowGlowMat = new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide});

/* init:const */ familyWindow = runtime.block(hideDoor,windowGlowMat,-1.55,1.55,2.315,.72,.76,.045);

familyWindow.userData.familyWindow=true;

familyWindow.renderOrder=3;

/* init:const */ windowFrameMat = new THREE.MeshLambertMaterial({color:0x4b2b1d});

for(const [x,y,w,h] of [[-1.55,1.98,.96,.10],[-1.55,1.12,.96,.10],[-2.03,1.55,.10,.96],[-1.07,1.55,.10,.96]]){const fr=runtime.block(hideDoor,windowFrameMat,x,y,2.325,w,h,.07);fr.userData.familyWindowFrame=true}

/* init:const */ doorMat = new THREE.MeshLambertMaterial({color:0x75462f});

/* init:const */ familyDoorHinge = new THREE.Group();

familyDoorHinge.position.set(-.8,.16,2.30);

hideDoor.add(familyDoorHinge);

/* init:const */ familyDoor = runtime.block(familyDoorHinge,doorMat,.8,.95,0,1.6,1.9,.12);

familyDoor.rotation.y=0;

familyDoor.userData.familyDoor=true;

familyDoor.userData.closed=true;

/* init:const */ familyDoorSlab = familyDoor;

/* init:const */ doorTrimMat = new THREE.MeshLambertMaterial({color:0x4b2b1d});

for(const [x,y,w,h] of [[-.82,1.11,.12,1.9],[.82,1.11,.12,1.9],[0,2.12,1.76,.12]]){const trim=runtime.block(hideDoor,doorTrimMat,x,y,2.315,w,h,.10);trim.userData.familyDoorFrame=true}

/* init:const */ doorLintel = runtime.block(familyHideout,dadWallMat,0,2.58,2.18,1.6,.84,.22);

doorLintel.userData.doorLintel=true;

familyHideout.userData.cutawayWalls.front.push(doorLintel);

/* init:const */ doorKnob = runtime.sphere(familyDoor,new THREE.MeshBasicMaterial({color:0xffd56a}),.36,.03,.075,.07);

doorKnob.userData.familyDoor=true;

/* init:const */ porchGlowMat = new THREE.MeshBasicMaterial({color:0xffe29a});

/* init:const */ porchLamp = runtime.sphere(hideDoor,porchGlowMat,0,2.70,2.35,.12);

porchLamp.userData.familyWindow=true;

/* init:const */ hideDoorGlow = runtime.makeEffectLight(0xffc45c,14,20,1.35);

hideDoorGlow.position.set(0,2.15,1.7);

familyHideout.add(hideDoorGlow);

hideDoorGlow.visible=false;

/* init:const */ dadInteriorGlow = runtime.makeEffectLight(0xffd58a,7,11,1.45);

dadInteriorGlow.position.set(0,1.7,-.35);

familyHideout.add(dadInteriorGlow);

dadInteriorGlow.visible=false;

/* init:const */ houseFurnishings = new THREE.Group();

familyHideout.add(houseFurnishings);

/* init:const */ insideTable = furniture('table',-1.72,.35);

runtime.block(insideTable,runtime.mats.wood,0,.68,0,1.0,.13,.8);

for(const x of [-.4,.4])for(const z of [-.3,.3])runtime.block(insideTable,runtime.mats.wood,x,.32,z,.10,.64,.10);

/* init:const */ insideChair = furniture('chair',-1.72,1.23);

runtime.block(insideChair,runtime.mats.wood,0,.42,0,.52,.10,.52);

runtime.block(insideChair,runtime.mats.wood,0,.75,.22,.52,.62,.10);

for(const x of [-.2,.2])for(const z of [-.2,.2])runtime.block(insideChair,runtime.mats.wood,x,.2,z,.09,.4,.09);

/* init:const */ insideBed = furniture('bed',1.76,-.82);

runtime.block(insideBed,runtime.mats.wood,0,.22,0,1.05,.25,1.85);

runtime.block(insideBed,runtime.mats.white,0,.42,0,.98,.18,1.76);

runtime.block(insideBed,runtime.mats.shirt,0,.55,.27,1.0,.12,1.18);

runtime.block(insideBed,runtime.mats.white,0,.56,-.63,.76,.15,.39);

runtime.block(insideBed,runtime.mats.wood,0,.61,-.95,1.12,.8,.12);

/* init:const */ insideFireplace = furniture('fireplace',-1.68,-1.47);

runtime.block(insideFireplace,runtime.mats.stone,0,.13,0,1.08,.25,.62);

for(const x of [-.45,.45])runtime.block(insideFireplace,runtime.mats.stone,x,.56,0,.22,.88,.55);

runtime.block(insideFireplace,runtime.mats.stone,0,1.01,0,1.15,.2,.65);

runtime.block(insideFireplace,runtime.mats.black,0,.51,-.18,.67,.66,.10);

runtime.block(insideFireplace,runtime.mats.wood,0,.28,.05,.61,.13,.16);

/* init:const */ hearthFlame = new THREE.Mesh(new THREE.ConeGeometry(.21,.55,7),new THREE.MeshBasicMaterial({color:0xffa43c,transparent:true,opacity:.85}));

hearthFlame.position.set(0,.58,.05);

insideFireplace.add(hearthFlame);

/* init:const */ hearthLight = runtime.makeEffectLight(0xff9d3c,2.5,5);

hearthLight.position.copy(hearthFlame.position);

insideFireplace.add(hearthLight);

/* init:let */ insideFamilyHouse = false;

villageHouse(-29,-7,2,Math.PI/2+.06);

villageHouse(28,1,1,-Math.PI/2-.04);

villageHouse(-25,19,3,.10);

villageHouse(-13,25,0,-.05);

villageHouse(25,23,2,.08)
  }
 };

}
