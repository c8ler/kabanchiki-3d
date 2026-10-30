export const CREATURE_LIMIT=16;
export function createModule(runtime){
 function creatureEntries(){
 const entries=[],seen=new Set(),add=(id,priority,remove)=>{if(!id||seen.has(id))return;seen.add(id);entries.push({id,priority,remove})};
 for(const b of [...runtime.foes,...runtime.friends,...runtime.defeatedBoars,...runtime.exitHelpers,runtime.friend])if(b?.g?.parent&&b.g.visible)add(b,100,()=>{});
 if(runtime.catLife.root.visible)for(const c of runtime.catLife.cats)if(c.g.visible)add(c,90,()=>{c.g.visible=false});
 for(const i of runtime.craftWorld.items)if(i.level===runtime.level&&i.living)add(i,70,()=>runtime.craftWorld.remove(i));
 for(const s of runtime.spiderLife.spiders)if(s.level===runtime.level)add(s,s.natural?35:65,()=>runtime.spiderLife.remove(s));
 for(const m of runtime.monsterLife.items)if(m.level===runtime.level)add(m,65,()=>runtime.monsterLife.remove(m));
 for(const i of runtime.flyingInsects.items)if(i.level===runtime.level)add(i,i.cheat?65:35,()=>runtime.flyingInsects.remove(i));
 for(const i of runtime.natureFauna.items)if(i.level===runtime.level)add(i,35,()=>runtime.natureFauna.remove(i));
 return entries}
 function creatureRoom(count=1,priority=false){let entries=creatureEntries();if(priority){const optional=entries.filter(e=>e.priority<90).sort((a,b)=>a.priority-b.priority);while(entries.length+count>CREATURE_LIMIT&&optional.length){optional.shift().remove();entries=creatureEntries()}}return entries.length+count<=CREATURE_LIMIT}
 function enforceCreatureLimit(render=false){let entries=creatureEntries().sort((a,b)=>b.priority-a.priority);for(const e of entries.slice(CREATURE_LIMIT))e.remove();entries=creatureEntries();let left=Math.max(0,CREATURE_LIMIT-entries.length),fish=0;
 for(const f of runtime.aquaticFish){if(f.level!==runtime.level)continue;const wet=f.wetVisible??f.g.visible,visible=wet&&left>0&&fish<4&&!runtime.cinematicRunning;f.g.visible=visible;if(visible){left--;fish++}}
 runtime.birdLife.setBudget(runtime.cinematicRunning?0:left,!render);if(render)runtime.flyingInsects.render();return{managed:entries.length,fish,birds:runtime.birdLife.root.visible?runtime.birdLife.body.count:0,total:entries.length+fish+(runtime.birdLife.root.visible?runtime.birdLife.body.count:0),limit:CREATURE_LIMIT}}
 return{bindings:{creatureEntries:{get:()=>creatureEntries},creatureRoom:{get:()=>creatureRoom},enforceCreatureLimit:{get:()=>enforceCreatureLimit}},initialize(){}}
}
