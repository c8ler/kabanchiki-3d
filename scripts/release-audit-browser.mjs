import {chromium,webkit,firefox} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const engine=process.env.BROWSER||'chromium',seed=Number(process.env.RELEASE_SEED||1901);
const browser=await ({chromium,webkit,firefox}[engine]).launch({headless:true});
fs.mkdirSync('logs',{recursive:true});fs.mkdirSync('screenshots',{recursive:true});
const report={engine,seed,checks:[],warnings:[],errors:[],metrics:[]};
const page=await browser.newPage({serviceWorkers:'block',viewport:engine==='webkit'?{width:360,height:640}:{width:1280,height:720},...(engine==='webkit'?{isMobile:true,hasTouch:true}:{})});
page.on('pageerror',e=>report.errors.push(e.message));
page.on('crash',()=>report.errors.push('page-crash'));
page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:8080/')&&r.status()>=400)report.errors.push('HTTP '+r.status()+' '+r.url())});
const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
const save=()=>fs.writeFileSync('logs/release-'+engine+'.json',JSON.stringify(report,null,2));
async function check(name,fn){try{await fn();report.checks.push({name,ok:true});console.log('RELEASE_PASS',engine,name)}catch(e){report.checks.push({name,ok:false,error:e.stack});console.error('RELEASE_FAIL',engine,name,e.stack);await page.screenshot({path:'screenshots/release-'+engine+'-'+name+'.png'}).catch(()=>{})}save()}
const watchdog=setTimeout(()=>{console.error('release audit exceeded 20 minutes');save();process.exit(1)},1200000);watchdog.unref();
try{
 await page.addInitScript(seed=>{
  let value=seed;Math.random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296};
  window.__releaseFrames=[];window.__releaseCPU=[];
  const raf=window.requestAnimationFrame;
  window.requestAnimationFrame=function(fn){return raf.call(this,now=>{const start=performance.now();try{return fn(now)}finally{if(fn.name==='loop'&&window.__releaseMeasure)window.__releaseCPU.push(performance.now()-start)}})};
  window.addEventListener('unhandledrejection',e=>{(window.__releaseRejections??=[]).push(String(e.reason))});
 },seed);
 await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');
 await page.waitForFunction(()=>window.__KABANCHIKI_QA__?.releaseSetup&&window.__KABANCHIKI_TEST__?.auditsComplete!==false,null,{timeout:120000});
 await check('mixed-actions',async()=>{
  for(const stress of [false,true])for(let level=1;level<=7;level++){
   let state=await qa('releaseSetup',level,stress);assert.equal(state.level,level);assert.deepEqual(state.issues,[]);
   for(let step=0;step<12;step++){
    if(stress&&step===4)await qa('releaseStorm');
    state=await qa('releaseStep',.5,step%2?60:20,(seed+step*7+level)%17);
    assert.deepEqual(state.issues,[],JSON.stringify({level,stress,step,state}));
   }
   report.metrics.push({kind:'mixed',stress,...state});
  }
 });
 await check('pause-clock',async()=>{
  await qa('releaseSetup',3,false);const time=await qa('releaseTime');await page.waitForTimeout(700);assert.equal(await qa('releaseTime'),time);
  await qa('releaseLive',true);await page.waitForTimeout(700);const progressed=await qa('releaseTime');assert.ok(progressed>time);
  const paused=await qa('releasePause');await page.waitForTimeout(700);assert.equal(await qa('releaseTime'),paused.before);
 });
 await check('real-frame-profile',async()=>{
  for(let level=1;level<=7;level++){
   await qa('releaseSetup',level,true);await qa('releaseLive',true);await page.waitForTimeout(1500);
   const data=await page.evaluate(()=>new Promise(resolve=>{
    window.__releaseCPU=[];window.__releaseMeasure=true;
    const intervals=[];let start,last;
    function tick(now){if(start===undefined){start=last=now} else {intervals.push(now-last);last=now}
     if(now-start<5000)return requestAnimationFrame(tick);
     window.__releaseMeasure=false;const cpu=window.__releaseCPU.slice().sort((a,b)=>a-b);intervals.sort((a,b)=>a-b);
     const stats=a=>({count:a.length,p50:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1),over100:a.filter(v=>v>100).length});
     resolve({cpu:stats(cpu),frames:stats(intervals)});
    }requestAnimationFrame(tick);
   }));
   const state=await qa('releaseInspect');report.metrics.push({kind:'profile',level,...data,...state});console.log('RELEASE_PROFILE',engine,level,JSON.stringify(data));
   assert.deepEqual(state.issues,[]);assert.ok(data.frames.count>=5,'render loop stalled');
   if(data.cpu.p95>50||data.frames.p95>100)report.warnings.push({kind:'slow-frames',level,...data});
  }
 });
 await check('resource-stability',async()=>{
  const rounds=[];
  for(let round=0;round<4;round++){
   const samples=[];
   for(let level=1;level<=7;level++){
    await qa('releaseSetup',level,false);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    samples.push(await qa('releaseInspect'));
   }
   rounds.push(samples);report.metrics.push({kind:'transition-round',round,samples});console.log('RELEASE_RESOURCES',engine,round,JSON.stringify(samples.map(s=>({level:s.level,scene:s.sceneChildren,memory:s.memory}))));
  }
  for(let i=0;i<7;i++){
   const warm=rounds[1][i],end=rounds[3][i];
   assert.ok(end.sceneChildren<=warm.sceneChildren+24,JSON.stringify({level:i+1,warm,end}));
   assert.ok(end.memory.geometries<=warm.memory.geometries+64,JSON.stringify({level:i+1,warm,end}));
   assert.ok(end.memory.textures<=warm.memory.textures+16,JSON.stringify({level:i+1,warm,end}));
  }
 });
 await check('continuous-session',async()=>{
  await qa('releaseSetup',3,true);await qa('releaseLive',true);
  for(let i=0;i<18;i++){
   const key=['w','d','s','a'][i%4];await page.keyboard.down(key);
   if(i%3===0)await page.keyboard.press('Space');
   await page.waitForTimeout(2500);await page.keyboard.up(key);
   const state=await qa('releaseInspect');assert.deepEqual(state.issues,[]);report.metrics.push({kind:'soak',sample:i,...state});
  }
  await page.screenshot({path:'screenshots/release-'+engine+'-session.png'});
 });
 await check('runtime-errors',async()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(await page.evaluate(()=>window.__releaseRejections||[]),[])});
}finally{clearTimeout(watchdog);save();await browser.close()}
console.log('RELEASE_SUMMARY',JSON.stringify({engine,checks:report.checks,warnings:report.warnings}));
if(report.checks.some(c=>!c.ok))process.exitCode=1;
