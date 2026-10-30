import * as THREE from "../../vendor/three/three.module.min.js";
import { seasonForAttempts } from "../seasons.js?v=222";

export function createQaPart(runtime){
 return {
season(n){runtime.attemptProgress.failed=n;runtime.currentSeason=seasonForAttempts(n);runtime.clearWorldFires();runtime.loadLevel(runtime.level);return this.state()},
form(){runtime.startBoarForm();return runtime.boarFormVisual.children.filter(o=>o.isMesh&&o.geometry.type==='RingGeometry'&&o.visible).length},
swim(x=-18,z=-17){if(runtime.friend)runtime.scene.remove(runtime.friend.g);runtime.friend=runtime.makeBoar(x,z,true);runtime.mountedFriend=true;runtime.boy.position.set(x,runtime.riderSeatHeight()-.58,z);runtime.friend.g.position.set(x,-.58,z);runtime.py=runtime.riderSeatHeight();runtime.vy=0;return this.state()},
position(){return {x:runtime.boy.position.x,y:runtime.boy.position.y,z:runtime.boy.position.z,boarY:runtime.friend?.g.position.y,depth:runtime.lakeDepthAt(runtime.boy.position.x,runtime.boy.position.z),mounted:runtime.mountedFriend}},
top(){runtime.camMode=8;runtime.$('camera').textContent='📷 Вид 9/10';return this.state()},
cameraDirection(){return runtime.camera.getWorldDirection(new THREE.Vector3()).toArray()},
snow(seconds=30){runtime.levelTime=190;runtime.updateWeather(seconds,performance.now());return {season:runtime.currentSeason,stage:runtime.weatherStage,lightning:runtime.lightningBolts.length,snow:runtime.snowGroup.visible,rain:runtime.weatherGroup.visible,carry:runtime.hurricaneCarry}},
movie(kind='intro',time=2,role=0){const member=runtime.familyMembers.find(f=>f.role===role);runtime.playCinematic(kind,()=>{runtime.paused=false;runtime.familyPopupOpen=false},{role,member,line:'Тимур нашёл родного человека. Семья снова рядом.'});runtime.movie.elapsedOverride=time;return {running:runtime.cinematicRunning,actors:runtime.movieRoot.children.length}},
movieSeek(time){if(runtime.movie)runtime.movie.elapsedOverride=time;return {kind:runtime.movie?.kind,time}},
movieDone(){runtime.cinematicFinish?.();return {running:runtime.cinematicRunning,actors:runtime.movieRoot.children.length,paused: runtime.paused}},
lamp(){runtime.hasFlashlight=true;runtime.boarFormTime=0;runtime.boy.visible=true;runtime.paused=true;runtime.boy.rotation.y=Math.PI/3;runtime.updateHandFlashlight();return {visible:runtime.handFlashlight.visible,origin:runtime.torch.position.toArray(),target:runtime.torch.target.position.toArray(),heading:runtime.boy.rotation.y}},
aquatic(){return {fish:runtime.aquaticFish.filter(f=>f.level===runtime.level).length,weeds:runtime.aquaticWeeds.filter(f=>f.level===runtime.level).length,riverX:runtime.riverGeo.attributes.position.getX(runtime.riverGeo.attributes.position.count-1),carved:runtime.surfaceGeometry.attributes.position.array.some(v=>v<-1)}},
viewRiver(){runtime.boy.position.set(0,0,-2);runtime.yaw=Math.PI;runtime.camMode=3;return this.state()},
lose(){runtime.showEnd(false);return this.state()},
puddles(stage,seconds){runtime.weatherStage=stage;runtime.updatePuddles(seconds);return {fill:runtime.puddleRain,radius:runtime.puddleObjects[0]?.scale.x,height:runtime.puddleObjects[0]?.position.y}},
rain(seconds=100){runtime.levelTime=120;runtime.weatherStage=2;runtime.puddleRain=0;runtime.updatePuddles(seconds);const p=runtime.puddleObjects[0];if(p)runtime.boy.position.set(p.position.x,0,p.position.z+5);runtime.yaw=Math.PI;runtime.camMode=3;return this.state()}
 };
}
