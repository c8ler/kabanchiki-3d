export function createQaPart(runtime){return {
 v218CampaignAudit(){this.v217Fresh();const result=[];for(let n=1;n<=6;n++){runtime.loadLevel(n);runtime.updateAdventureItems(.1);result.push({level:n,bombs:runtime.adventureInventory.bombs,pickups:runtime.adventurePickups.map(p=>p.kind),craft:runtime.craftUnlocked,home:runtime.homeUnlocked,placed:runtime.placeAdventureBomb()})}runtime.loadLevel(3);runtime.setPause(true);return result},
 v218FishingApproach(){this.v212Setup(4);for(const f of runtime.foes)f.flee=true;runtime.stopFishing();runtime.keys={};runtime.stick.x=runtime.stick.y=0;runtime.mountedFriend=false;runtime.py=runtime.vy=0;runtime.jump=runtime.act=false;runtime.boy.position.set(17,0,20);runtime.setPause(false);return this.v217FishInspect()},
 v218MoveToBank(){runtime.boy.position.set(17,runtime.terrainHeightAt(17,-7),-7);runtime.py=runtime.vy=0;runtime.fishingPrevious=null},
 v218SecretState(){return{open:runtime.secretMenuOpen,paused:runtime.paused,visible:runtime.$('secretMenu').style.display!=='none',version:runtime.GAME_VERSION}}
};}
