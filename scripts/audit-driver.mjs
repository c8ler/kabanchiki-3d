import {chromium,webkit,firefox} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
export async function startAudit(label){
 const engine=process.env.BROWSER||'chromium',seed=Number(process.env.AUDIT_SEED||1901);
 const folder=path.join('logs',label+'-'+engine);fs.mkdirSync(folder,{recursive:true});
 const browser=await ({chromium,webkit,firefox}[engine]).launch(engine==='firefox'?{headless:false,firefoxUserPrefs:{'webgl.force-enabled':true},env:{...process.env,LIBGL_ALWAYS_SOFTWARE:'1'}}:{headless:true});
 const context=await browser.newContext({serviceWorkers:'block',viewport:engine==='webkit'?{width:360,height:640}:{width:960,height:640},...(engine==='webkit'?{isMobile:true,hasTouch:true}:{}),recordVideo:{dir:folder,size:{width:480,height:320}}});
 await context.route('**/*.supabase.co/**',r=>r.fulfill({status:503,contentType:'application/json',body:'{"message":"audit: service unavailable"}'}));
 const page=await context.newPage(),report={label,engine,seed,sha:process.env.GITHUB_SHA||'local',started:new Date().toISOString(),checks:[],errors:[],metrics:[]};
 let chunk=false;
 const record=entry=>fs.appendFileSync(path.join(folder,'actions.jsonl'),JSON.stringify({at:Date.now(),...entry})+'\n');
 const save=()=>fs.writeFileSync(path.join(folder,'report.json'),JSON.stringify(report,null,2));
 page.on('pageerror',e=>{report.errors.push(e.message);record({event:'pageerror',message:e.message})});page.on('crash',()=>report.errors.push('page-crash'));
 await page.addInitScript(seed=>{
  window.__deepFrames=[];const raf=requestAnimationFrame;
  window.requestAnimationFrame=fn=>raf(now=>{const start=performance.now();try{return fn(now)}finally{if(fn.name==='loop'){window.__deepFrames.push(performance.now()-start);if(window.__deepFrames.length>600)window.__deepFrames.shift()}}});
  let n=seed;Math.random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
  window.__auditRejections=[];addEventListener('unhandledrejection',e=>window.__auditRejections.push(String(e.reason)));
 },seed);
 await context.tracing.start({screenshots:true,snapshots:true,sources:false});
 async function trace(name,keep=false){if(chunk)await context.tracing.stopChunk(keep?{path:path.join(folder,name+'.zip')}:{});await context.tracing.startChunk({title:name});chunk=true}
 await trace('startup');
 const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 async function check(name,fn){
  await trace(name);const start=Date.now();
  try{await fn();report.checks.push({name,ok:true,ms:Date.now()-start});console.log('DEEP_PASS',engine,name)}
  catch(error){report.checks.push({name,ok:false,error:error.stack,ms:Date.now()-start});record({event:'failure',name,message:error.stack,state:await qa('deepState').catch(()=>null)});await page.screenshot({path:path.join(folder,name+'.png')}).catch(()=>{});await trace('after-'+name,true);console.error('DEEP_FAIL',engine,name,error.stack)}
  save();
 }
 async function open(){
  await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');
  await page.waitForFunction(()=>window.__KABANCHIKI_QA__?.deepSetup&&window.__KABANCHIKI_TEST__?.auditsComplete!==false,null,{timeout:120000});
  record({event:'ready',version:await page.evaluate(()=>window.__KABANCHIKI_VERSION__)});
 }
 async function finish(){
  const rejected=await page.evaluate(()=>window.__auditRejections||[]).catch(()=>['page-unavailable']);report.errors.push(...rejected);report.finished=new Date().toISOString();
  const failed=report.errors.length>0||report.checks.some(c=>!c.ok);
  if(chunk)await context.tracing.stopChunk(failed?{path:path.join(folder,'last-trace.zip')}:{}).catch(()=>{});
  await context.tracing.stop().catch(()=>{});const video=page.video();await context.close();if(video){const file=await video.path();if(!failed)fs.rmSync(file,{force:true})}
  save();console.log('DEEP_SUMMARY',JSON.stringify(report));await browser.close();if(failed)process.exitCode=1;
 }
 return{engine,seed,page,context,report,qa,check,record,trace,save,open,finish};
}
