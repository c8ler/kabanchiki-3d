export function performanceRegressions(rows){
 const issues=[],pairs=[];
 for(let level=1;level<=6;level++){
  const base=rows.find(r=>r.label==='baseline'&&r.level===level),next=rows.find(r=>r.label==='candidate'&&r.level===level);
  if(!base||!next){issues.push('missing-profile:'+level);continue}
  if([base,next].some(r=>!Number.isFinite(r.cpu?.p50)||r.cpu.p50<0||r.cpu.frames<5)){issues.push('invalid-cpu-profile:'+level);continue}
  pairs.push([base.cpu.p50,next.cpu.p50]);
  if(next.cpu.p50>Math.max(base.cpu.p50*1.6,base.cpu.p50+6))issues.push('cpu-regression:'+level+':'+base.cpu.p50+'->'+next.cpu.p50);
 }
 if(pairs.length===6){
  const base=pairs.reduce((n,p)=>n+p[0],0),next=pairs.reduce((n,p)=>n+p[1],0);
  if(next>Math.max(base*1.35,base+12))issues.push('aggregate-cpu-regression:'+base+'->'+next);
 }
 return issues;
}
