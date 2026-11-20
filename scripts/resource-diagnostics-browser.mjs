import {chromium} from 'playwright';import fs from 'node:fs';import assert from 'node:assert/strict';import {actionPlan} from '../src/qa/audit-observer.js';
fs.mkdirSync('logs',{recursive:true});const browser=await chromium.launch(),page=await browser.newPage({serviceWorkers:'block',viewport:{width:640,height:360}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});const report=[];
try{
 await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_QA__?.deepResources&&window.__KABANCHIKI_TEST__?.auditsComplete!==false,null,{timeout:120000});
 await page.evaluate(()=>{const c=window.__KABANCHIKI_ADAPTIVE__.controller;c.setTier(0,performance.now());c.sample=()=>{}});
 await qa('deepWatchResources');const plan=actionPlan(20261120,1000);let index=0;
 outer:for(let round=0;round<4;round++)for(let level=1;level<=7;level++){
  await qa('deepSetup',level);
  for(let step=0;step<24;step++){
   const action={...plan[index++],seconds:2,fps:20},state=await qa('deepAction',action);assert.deepEqual(state.issues,[]);
   if(state.cinematic)await qa('movieDone');if(state.ended)await qa('deepSetup',level);
  }
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const state=await qa('deepState'),resources=await qa('deepResources');report.push({round,level,state,resources});
  console.log('RESOURCE_DIAG',JSON.stringify({round,level,geometries:state.geometries,...resources}));
  fs.writeFileSync('logs/resource-diagnostics.json',JSON.stringify({report,errors},null,2));
  if(resources.orphaned>40)break outer;
 }
 assert.deepEqual(errors,[]);assert.ok(report.at(-1).resources.orphaned<=40,JSON.stringify(report.at(-1).resources));
}finally{await browser.close()}
