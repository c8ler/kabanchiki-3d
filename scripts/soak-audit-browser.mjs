import assert from 'node:assert/strict';
import {startAudit} from './audit-driver.mjs';
import {actionPlan,resourceIssues} from '../src/qa/audit-observer.js';
const d=await startAudit('soak'),minutes=Number(process.env.SOAK_MINUTES||30);
assert.ok(Number.isFinite(minutes)&&minutes>=30&&minutes<=60,'soak must run for 30–60 real minutes');
const plan=actionPlan(d.seed,5000),samples=[];
try{
 await d.open();await d.qa('deepWatchResources');
 await d.check('continuous-'+minutes+'-minutes',async()=>{
  const start=Date.now(),deadline=start+minutes*60000;let mapAt=0,index=0,visits=0,currentLevel=0,lastTime=0;
  while(Date.now()<deadline){
   if(Date.now()>=mapAt){
    currentLevel=1+(visits%7);await d.qa('deepSetup',currentLevel);
    await d.page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const state=await d.qa('deepState');assert.deepEqual(state.issues,[]);
    const resources=await d.qa('deepResources');samples.push({...state,resources});d.record({event:'visit',visits,state,resources});await d.trace('minute-'+visits);
    visits++;mapAt=Date.now()+60000;await d.qa('deepLive',true);
   }
   const action=plan[index++%plan.length],state=await d.qa('deepAction',action,true);
   d.record({event:'action',index,action,state});assert.deepEqual(state.issues,[],JSON.stringify(state));
   if(state.cinematic)await d.qa('movieDone');
   if(state.ended){d.record({event:'recovery',state});await d.qa('deepSetup',currentLevel);await d.qa('deepLive',true)}
   await d.page.waitForTimeout(1000);
   if(index%10===0){
    const s=await d.qa('deepState'),resources=await d.qa('deepResources');assert.deepEqual(s.issues,[]);assert.ok(resources.orphaned<=40,JSON.stringify(resources));d.report.metrics.push({elapsed:Date.now()-start,...s,resources});d.save();
    console.log('SOAK_HEARTBEAT',JSON.stringify({engine:d.engine,minutes:(Date.now()-start)/60000,actions:index,level:s.level,geometries:s.geometries,textures:s.textures,creatures:s.creatures}));
    assert.ok(s.numbers.time!==lastTime||s.cinematic||s.ended,'simulation stopped advancing');lastTime=s.numbers.time;
   }
  }
  const issues=resourceIssues(samples.map(s=>({...s,geometries:s.resources.referenced})),{geometries:64,textures:16,children:32}),native=await d.qa('deepResources');
  d.report.metrics.push({elapsed:Date.now()-start,actions:index,visits,resourceIssues:issues,geometryObservation:'scene-references',native,samples});
  console.log('SOAK_COMPLETE',JSON.stringify({elapsed:Date.now()-start,actions:index,visits,resourceIssues:issues,native}));
  assert.deepEqual(issues,[]);assert.ok(native.orphaned<=40,JSON.stringify(native));assert.ok(Date.now()-start>=minutes*60000);assert.ok(visits>=20);
 });
}catch(error){d.report.errors.push(error.stack);console.error('SOAK_FATAL',error.stack)}
finally{await d.finish()}
