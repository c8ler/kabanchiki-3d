import assert from 'node:assert/strict';
import {startAudit} from './audit-driver.mjs';
import {actionPlan,resourceIssues} from '../src/qa/audit-observer.js';
const d=await startAudit('deep'),{page,qa,check}=d;
const healthy=s=>assert.deepEqual(s.issues,[],JSON.stringify(s));
try{
 await d.open();
 await check('tornado-releases-food-geometry',async()=>{const s=await qa('deepTornadoFood');assert.equal(s.consumed,3);assert.equal(s.remaining,0);assert.ok(s.owned>0);assert.equal(s.disposed,s.owned);healthy(s)});
 await check('storm-reset-releases-remains',async()=>{const s=await qa('deepStormRemains');assert.ok(s.owned>0);assert.equal(s.disposed,s.owned);assert.equal(s.attached,false);assert.equal(s.remains,0);assert.equal(s.stumps,0);healthy(s)});
 await check('bomb-releases-food-geometry',async()=>{const s=await qa('deepBombFood');assert.ok(s.owned>0);assert.equal(s.disposed,s.owned);assert.equal(s.done,true);assert.equal(s.attached,false);healthy(s)});
 await check('repeated-stress-resource-plateau',async()=>{
  const samples=[];
  for(let round=0;round<4;round++)for(let level=1;level<=7;level++){
   await qa('deepSetup',level);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const state=await qa('deepState');healthy(state);samples.push(state);
  }
  const issues=resourceIssues(samples);d.report.metrics.push({kind:'stress-resources',samples,issues});
  console.log('HOT_RESOURCE_CHECK',d.engine,JSON.stringify({issues,forest:samples.filter(s=>s.level===1).map(s=>s.geometries)}));assert.deepEqual(issues,[]);
 });
 for(const seed of [d.seed,d.seed+7331])await check('fuzz-'+seed,async()=>{
  const plan=actionPlan(seed,512);d.record({event:'plan',seed,actions:plan});
  for(const action of plan){
   if(action.index%64===0){await qa('deepSetup',1+(Math.floor(action.index/64)%7));await d.trace('fuzz-'+seed+'-'+action.index)}
   const s=await qa('deepAction',action);healthy(s);d.record({event:'action',action,state:s});
   if(s.cinematic)await qa('movieDone');
   if(s.ended){d.record({event:'recover',index:action.index});await qa('deepSetup',s.level)}
   if(action.index%32===0){await qa('deepLive',true);await page.keyboard.press(action.index%64?'Space':'KeyF');await qa('deepLive',false);healthy(await qa('deepState'))}
  }
 });
 await check('moving-bomb-and-placement',async()=>{const s=await qa('deepMovingObjects');healthy(s);assert.ok(s.moved>0);assert.ok(s.bombs.length>0);assert.ok(s.blocks>0);assert.equal(s.placed,true)});
 await check('paused-bomb-fuse',async()=>{const a=await qa('deepBombPause');assert.ok(a.bombs.length>0);await page.waitForTimeout(1200);const b=await qa('deepState');assert.equal(b.numbers.time,a.numbers.time);assert.deepEqual(b.bombs,a.bombs);healthy(b)});
 await check('paused-active-tornado',async()=>{const a=await qa('deepStormPause');assert.equal(a.active,true);await page.waitForTimeout(1200);assert.equal(await qa('deepStormAge'),a.age);healthy(await qa('deepState'))});
 await check('map-change-with-armed-bomb',async()=>{const s=await qa('deepMapWithBomb');assert.equal(s.before,1);assert.equal(s.level,4);assert.equal(s.bombs.length,0);healthy(s)});
 await check('long-frame-uses-capped-movement',async()=>{await qa('deepSetup',3);await qa('deepResetEffects');for(const gap of [.1,.25,1]){const s=await qa('deepGap',gap);healthy(s);assert.ok(s.distance<2,JSON.stringify(s));assert.ok(Math.abs(s.elapsed-gap)<.001)}});
 await check('dream-bomb-form-return',async()=>{let r=await qa('deepDream');assert.equal(r.active,true);assert.equal(r.level,7);await qa('v221DreamBomb');r=await qa('deepDreamWake');assert.equal(r.level,3);assert.equal(r.active,false);assert.equal(r.form,0);assert.equal(r.orphanDreamFriend,false);healthy(await qa('deepState'))});
 await check('burning-house-and-tornado-cancel',async()=>{await qa('v225Setup',3);const fire=await qa('v225Fire','house',Math.PI/4,.05);assert.equal(fire.blocked,true);assert.equal(fire.ignited,true);await qa('v225Storm');await qa('v225StormStep',.3);const s=await qa('v225StormCancel');assert.equal(s.pending,0);healthy(await qa('deepState'))});
 await check('portrait-and-rotation',async()=>{for(const [width,height]of [[320,568],[568,320],[360,640]]){await page.setViewportSize({width,height});await qa('deepSetup',3);await qa('deepPause',true);for(const b of await page.locator('#pauseMenu button:visible').all()){await b.scrollIntoViewIfNeeded();const r=await b.boundingBox();assert.ok(r&&r.x>=0&&r.y>=0&&r.x+r.width<=width+1&&r.y+r.height<=height+1)}}});
 await check('first-appearance-profiles',async()=>{
  for(let level=1;level<=7;level++){
   await page.evaluate(()=>window.__deepFrames=[]);const start=Date.now();await qa('deepSetup',level);const loadMs=Date.now()-start;
   await qa('deepLive',true);await page.waitForTimeout(3000);await qa('deepLive',false);
   const frames=await page.evaluate(()=>window.__deepFrames.slice().sort((a,b)=>a-b));assert.ok(frames.length>=3);
   const metrics={level,loadMs,frames:frames.length,p50:frames[Math.floor(frames.length*.5)],p95:frames[Math.floor(frames.length*.95)],max:frames.at(-1)};
   d.report.metrics.push({kind:'first-appearance',...metrics});console.log('APPEARANCE_PROFILE',d.engine,JSON.stringify(metrics));healthy(await qa('deepState'));
  }
 });
 await check('corrupt-json-and-unavailable-leaderboard',async()=>{
  const p=await d.context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  try{
   await p.addInitScript(()=>{for(const key of ['kabanchiki3d_home','kabanchiki3d_results','kabanchiki3d_campaign'])localStorage.setItem(key,'{broken-json')});
   await p.goto('http://127.0.0.1:8080/?autotest=1&level=3');await p.waitForFunction(()=>window.__KABANCHIKI_QA__?.deepSetup&&window.__KABANCHIKI_TEST__?.auditsComplete!==false,null,{timeout:120000});
   await p.evaluate(()=>window.__KABANCHIKI_QA__.v221Stats());await p.waitForTimeout(1000);assert.deepEqual(errors,[]);
   assert.match(await p.locator('#statsScreen').innerText(),/результат|таблиц|рекорд|сохран/i);
  }finally{await p.close()}
 });
 await check('runtime-errors',async()=>assert.deepEqual(d.report.errors,[]));
}catch(error){d.report.errors.push(error.stack);console.error('DEEP_FATAL',error.stack)}
finally{await d.finish()}
