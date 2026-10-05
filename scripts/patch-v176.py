from pathlib import Path
p=Path('src/game.js');s=p.read_text();h=Path('index.html');html=h.read_text();v=Path('scripts/validate.mjs');val=v.read_text()
assert "GAME_VERSION='v175'" in s
s=s.replace('?v=175','?v=176').replace("GAME_VERSION='v175'","GAME_VERSION='v176'");html=html.replace('v175','v176').replace('?v=175','?v=176');val=val.replace('v175','v176').replace('v=175','v=176')
old="const bolt=block(g,mats.gold,0,2.15,0,.18,.55,.18);bolt.rotation.z=.45;bolt.visible=false;"
new="const boltShape=new THREE.Shape();boltShape.moveTo(-.10,.52);boltShape.lineTo(.18,.52);boltShape.lineTo(.02,.12);boltShape.lineTo(.25,.12);boltShape.lineTo(-.16,-.58);boltShape.lineTo(-.03,-.12);boltShape.lineTo(-.25,-.12);boltShape.closePath();const bolt=new THREE.Mesh(new THREE.ShapeGeometry(boltShape),new THREE.MeshBasicMaterial({color:0xffe229,side:THREE.DoubleSide,toneMapped:false,fog:false}));bolt.position.set(0,2.35,0);bolt.scale.setScalar(1.18);bolt.visible=false;bolt.renderOrder=5;g.add(bolt);"
assert old in s
s=s.replace(old,new)
p.write_text(s);h.write_text(html);v.write_text(val)
