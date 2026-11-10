import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';await mkdir('screenshots',{recursive:true});
for(const engine of [chromium,webkit]){
 const mobile=engine===webkit,browser=await engine.launch(),page=await browser.newPage({serviceWorkers:'block',viewport:mobile?{width:390,height:844}:{width:1024,height:720},isMobile:mobile,hasTouch:mobile}),errors=[];page.on('pageerror',e=>errors.push(e.message));const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 try{
  await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_QA__&&window.__KABANCHIKI_TEST__?.auditsComplete!==false,null,{timeout:120000});
  for(const kind of ['gap','u','near']){let r=await qa('v229Setup',kind);assert.equal(r.needed,true);r=await qa('v229Step',25);assert.ok(r.distance<3,JSON.stringify({kind,...r}));assert.equal(r.bad,0,JSON.stringify({kind,...r}));if(kind==='gap'){assert.equal(r.everCompact,true);r=await qa('v229Expand');assert.equal(r.compact,false);assert.ok(r.distance<3)}}
  let r=await qa('v229Door');assert.equal(r.closed,false);assert.ok(r.distance<3,JSON.stringify(r));assert.equal(r.bad,0);
  r=await qa('v229Water');assert.equal(r.hp,r.before);assert.equal(r.escaping,false);assert.ok(r.distance<3,JSON.stringify(r));assert.equal(r.bad,0);
  await qa('v229Setup','gap');await qa('v229Step',1.2);const data=(await page.screenshot({path:'screenshots/friend-'+engine.name()+'.jpg',type:'jpeg',quality:45})).toString('base64');for(let i=0;i<data.length;i+=6000)console.log('REVIEW_IMAGE:friend-'+engine.name()+':'+i/6000+':'+data.slice(i,i+6000));
  const groups=await qa('v229Menu');assert.match(groups.at(-1),/Шутки/);assert.equal(await page.locator('[data-cheat="CARAVAN"]').count(),1);assert.deepEqual(errors,[]);console.log('PASS229',engine.name(),'tight gap, U detour, close wall, door, swimming and caravan group at bottom');
 }finally{await browser.close()}
}
