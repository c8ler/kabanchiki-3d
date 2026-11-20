// Test-only observations and replay plans; no game state is modified here.
export function inspectState(s){
 const issues=[];
 if(s.positions.some(p=>p.some(n=>!Number.isFinite(n)||Math.abs(n)>1000)))issues.push('invalid-position');
 for(const [key,value]of Object.entries(s.numbers))if(!Number.isFinite(value))issues.push('invalid-number:'+key);
 if(s.creatures>16)issues.push('creature-cap:'+s.creatures);
 if(s.pets>2)issues.push('pet-cap:'+s.pets);
 if(s.cat&&s.boar)issues.push('simultaneous-forms');
 if(s.flight&&s.level!==7)issues.push('flight-outside-island');
 if(s.bombs.some(b=>!Number.isFinite(b.left)||b.left<0||!Number.isFinite(b.age)))issues.push('invalid-bomb');
 return issues;
}
export function actionPlan(seed,count){
 let value=seed>>>0;const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296};
 const kinds=['walk','walk','walk','walk','jump','feed','form','bomb','craft','camera','mount','menu','storm','pause'];
 return Array.from({length:count},(_,index)=>({index,seed:(random()*4294967296)>>>0,kind:kinds[Math.floor(random()*kinds.length)],direction:Math.floor(random()*4),value:Math.floor(random()*4),seconds:.1+random()*.3,fps:[10,15,30,60][Math.floor(random()*4)]}));
}
export function resourceIssues(samples,allowance={geometries:64,textures:16,children:24}){
 const issues=[];
 for(const level of new Set(samples.map(s=>s.level))){
  const rows=samples.filter(s=>s.level===level);
  if(rows.length<3)continue;
  // Discard the cold first visit; compare equal map/scenario visits.
  const warm=rows[1],end=rows.at(-1);
  for(const key of ['geometries','textures','children'])if(end[key]>warm[key]+allowance[key])issues.push('resource-growth:'+level+':'+key+':'+warm[key]+'->'+end[key]);
 }
 return issues;
}
