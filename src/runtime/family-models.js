import * as THREE from "../../vendor/three/three.module.min.js";

// Owns 3 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function makeMother(){
 const g=new THREE.Group();
 // ноги и обувь
 runtime.block(g,runtime.mats.black,-.18,.34,0,.28,.68,.34);runtime.block(g,runtime.mats.black,.18,.34,0,.28,.68,.34);
 // платье: верх + расширенная юбка, чтобы силуэт не был копией Тимура
 runtime.block(g,runtime.mats.red,0,1.16,0,.82,.82,.48);
 runtime.block(g,runtime.mats.red,0,.82,0,1.02,.58,.58);
 // голова
 runtime.block(g,runtime.mats.skin,0,1.92,0,.72,.72,.66);
 // длинные волосы: верх, затылок и боковые пряди
 runtime.block(g,runtime.mats.hair,0,2.32,-.04,.80,.22,.72);
 runtime.block(g,runtime.mats.hair,0,1.88,-.34,.78,.82,.16);
 runtime.block(g,runtime.mats.hair,-.39,1.84,-.05,.16,.72,.48);
 runtime.block(g,runtime.mats.hair,.39,1.84,-.05,.16,.72,.48);
 // руки
 runtime.block(g,runtime.mats.skin,-.56,1.22,0,.22,.72,.23);runtime.block(g,runtime.mats.skin,.56,1.22,0,.22,.72,.23);
 // глаза и улыбка
 for(const x of [-.17,.17])runtime.block(g,runtime.mats.black,x,1.99,.35,.075,.09,.035);
 runtime.block(g,runtime.mats.pink,0,1.77,.35,.24,.055,.035);
 return g
}

function makeGrandmother(){
 const g=new THREE.Group();
 // обувь и длинное платье
 runtime.block(g,runtime.mats.black,-.17,.28,0,.27,.56,.34);runtime.block(g,runtime.mats.black,.17,.28,0,.27,.56,.34);
 runtime.block(g,runtime.mats.pink,0,.92,0,1.02,1.05,.60);
 runtime.block(g,runtime.mats.pink,0,1.43,0,.80,.48,.50);
 // голова
 runtime.block(g,runtime.mats.skin,0,1.98,0,.72,.70,.66);
 // седые волосы и пучок
 const gray=new THREE.MeshLambertMaterial({color:0xbfc1c5,map:runtime.mats.hair.map});
 runtime.block(g,gray,0,2.34,-.04,.80,.22,.72);
 runtime.block(g,gray,0,2.03,-.34,.78,.54,.16);
 runtime.block(g,gray,-.39,2.02,-.04,.16,.50,.46);runtime.block(g,gray,.39,2.02,-.04,.16,.50,.46);
 runtime.sphere(g,gray,0,2.42,-.25,.22);
 // руки
 runtime.block(g,runtime.mats.skin,-.55,1.39,0,.21,.66,.22);runtime.block(g,runtime.mats.skin,.55,1.39,0,.21,.66,.22);
 // глаза, очки и улыбка
 for(const x of [-.17,.17]){runtime.block(g,runtime.mats.black,x,2.03,.35,.065,.075,.03);const rim=new THREE.Mesh(new THREE.TorusGeometry(.13,.025,6,12),new THREE.MeshBasicMaterial({color:0x5b4636}));rim.position.set(x,2.03,.385);g.add(rim)}
 runtime.block(g,new THREE.MeshLambertMaterial({color:0x5b4636}),0,2.03,.385,.12,.025,.025);
 runtime.block(g,runtime.mats.pink,0,1.82,.35,.22,.05,.03);
 return g
}

function makeFamily(x,z,forcedRole=null){const g=runtime.group(x,z);g.position.y=runtime.terrainHeightAt(x,z);const role=forcedRole===null?(runtime.familyFound+runtime.familyMembers.length)%4:forcedRole;let person;
 if(role===0){person=makeMother();person.scale.setScalar(.72)}
 else if(role===3){person=makeGrandmother();person.scale.setScalar(.70)}
 else{person=runtime.makeBoy();person.scale.setScalar([1,.46][role-1]);person.children[2].material=[runtime.mats.leaf,runtime.mats.gold][role-1]}
 g.add(person);const familyMarker=runtime.sphere(g,runtime.mats.gold,0,role===1?3.15:2.5,0,.2);familyMarker.userData.familyMarker=true;runtime.familyMembers.push({g,x,z,done:false,role,person,familyMarker})}
 return {
  bindings:{
"makeMother":{get:()=>makeMother},
"makeGrandmother":{get:()=>makeGrandmother},
"makeFamily":{get:()=>makeFamily}
  },
  initialize(){

  }
 };

}
