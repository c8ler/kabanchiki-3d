import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
await mkdir('screenshots',{recursive:true});const failures=[];
for(const engine of [chromium,webkit]){
 const mobile=engine===webkit,browser=await engine.launch(),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1024,height:720},isMobile:mobile,hasTouch:mobile}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 const check=async(name,fn)=>{try{await fn();console.log('PASS219',engine.name(),name)}catch(e){failures.push(engine.name()+' '+name+': '+e.stack);console.log('FAIL219',engine.name(),name,e.stack)}};
 const shot=async name=>{const b=await page.screenshot({path:'screenshots/v219-'+engine.name()+'-'+name+'.jpg',type:'jpeg',quality:50});if(!mobile){const data=b.toString('base64');for(let i=0;i<data.length;i+=6000)console.log('REVIEW_IMAGE:v219-'+name+':'+i/6000+':'+data.slice(i,i+6000))}};
 try{
  await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:120000});
  for(let n=1;n<=6;n++)await check('exit '+n,async()=>{let r=await qa('v219Exit',n);assert.ok(!r.hidden&&r.kind==='exit',JSON.stringify({n,r}));assert.match(r.text,n===6?/босса/:/Накорми/);if([1,3,5].includes(n))assert.match(r.text,/Найди/);r=await qa('v219Exit',n,true);assert.ok(r.hidden||r.kind!=='exit',JSON.stringify({n,r}));if(n<6){r=await qa('v219Exit',n,false,'boars');assert.ok(!r.text.includes('Найди')&&r.text.includes('Накорми'))}});
  console.log('PASS219',engine.name(),'all exit hints update with objective completion');
  for(const opts of [{},{full:true},{food:'fish'},{food:'yellow'},{mounted:true},{blocked:true}])await check('feeding '+JSON.stringify(opts),async()=>{
   const before=await qa('v219FeedSetup',opts);if(opts.mounted)assert.equal(before.mounted,true);
   await page.keyboard.press('KeyE');const thrown=await qa('v219FeedInspect');
   if(!opts.blocked){assert.ok(thrown.shots.length===1||thrown.fed>before.fed);if(thrown.shots.length)assert.equal(thrown.shots[0].friend,true);const after=await qa('v219ResolveShots');assert.equal(after.hp,after.max);assert.ok(after.fed>before.fed)}else assert.ok(thrown.shots.every(s=>!s.friend));
  });
  console.log('PASS219',engine.name(),'real throw button chooses nearby friend and respects a wall');
  await check('occupied boar cats',async()=>{await qa('v219CatsSetup');for(let i=0;i<25;i++){await page.waitForTimeout(150);const r=await qa('v219CatsInspect');assert.ok(r.mounted);for(const c of r.cats)assert.ok(!c.boar&&c.state!=='ride'&&c.state!=='boarPlay'&&c.jump!=='ride',JSON.stringify(c))}});
  console.log('PASS219',engine.name(),'village and created cats leave the occupied boar alone');
  await check('flat readable signs',async()=>{const sign=await qa('v219Signs');assert.ok(sign.normal[1]>.9999&&sign.min>=sign.ground+.039);assert.ok(Math.abs(sign.angle+Math.PI/2)<.0001)});
  await check('no family markers',async()=>{for(const r of await qa('v219Markers'))assert.equal(r.markers,0)});
  console.log('PASS219',engine.name(),'sign inscription faces up and family markers are absent');
  for(const kind of ['intro','outro'])await check(kind+' stable trees',async()=>{const r=await qa('v219CinemaAudit',kind);console.log('CINEMA219',engine.name(),kind,JSON.stringify(r));assert.equal(r.changes,0);assert.equal(r.faded,0);assert.ok(r.restored)});
  for(let n=1;n<=6;n++)for(const cause of ['boar','fire','bomb','water','ice'])await check('death '+n+' '+cause,async()=>{const r=await qa('v219CinemaAudit','death',cause,n);assert.ok(r.visible>=40,JSON.stringify({n,cause,r}));if(cause!=='water')assert.ok(r.minClearance>=.039,JSON.stringify({n,cause,r}));assert.ok(r.restored)});
  await qa('v219DeathPreview','fire',5);await shot('grounded-death');
  await check('runtime errors',async()=>assert.deepEqual(errors,[]));console.log('v219 exits, cats, cinematic stability, feeding and signs PASS',engine.name());
 }finally{await browser.close()}
}

assert.deepEqual(failures,[]);
