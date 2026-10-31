import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';await mkdir('screenshots',{recursive:true});
for(const engine of [chromium,webkit]){
 const mobile=engine===webkit,browser=await engine.launch(),page=await browser.newPage({serviceWorkers:'block',viewport:mobile?{width:390,height:844}:{width:1024,height:720},isMobile:mobile,hasTouch:mobile}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 try{
  await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready&&window.__KABANCHIKI_TEST__.auditsComplete!==false,null,{timeout:120000});
  let r=await qa('v223Capture');assert.equal(r.active,true,JSON.stringify(r));assert.equal(r.paused,false);assert.equal(r.cinematic,false);assert.equal(r.end,false);assert.equal(r.carry,0);
  await page.waitForFunction(()=>window.__KABANCHIKI_QA__.v223FlightState().py>6,null,{timeout:15000});
  r=await qa('v223FlightStep',3);assert.equal(r.active,true);assert.equal(r.end,false);assert.equal(r.paused,false);
  await qa('v223FlightPark');const before=await qa('v223FlightState');await page.keyboard.down('KeyW');await page.waitForTimeout(350);await page.keyboard.up('KeyW');r=await qa('v223FlightState');assert.ok(Math.hypot(r.x-before.x,r.z-before.z)>.4);
  const y=r.py;if(mobile)await page.locator('#jump').click();else await page.keyboard.press('Space');await page.waitForTimeout(350);r=await qa('v223FlightState');assert.ok(r.py>y+.3,JSON.stringify(r));
  await page.screenshot({path:'screenshots/v223-flight-'+engine.name()+'.png'});
  const land=page.locator('#landFlightAction');await land.waitFor({state:'visible'});const box=await land.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=page.viewportSize().width);assert.ok(box.y>=0&&box.y+box.height<=page.viewportSize().height);
  await land.click();await page.waitForFunction(()=>!window.__KABANCHIKI_QA__.v223FlightState().active,null,{timeout:15000});r=await qa('v223FlightState');assert.equal(r.end,false);assert.equal(r.paused,false);assert.ok(r.py<1);await land.waitFor({state:'hidden'});
  await page.keyboard.press('Escape');assert.equal((await qa('v223FlightState')).paused,true);await page.keyboard.press('Escape');assert.equal((await qa('v223FlightState')).paused,false);
  await qa('v223Capture');r=await qa('v223ExitFlight');assert.equal(r.active,false);assert.equal(r.level,3);
  assert.deepEqual(errors,[]);console.log('PASS223',engine.name(),'real tornado capture, launch, movement, jump ascent, landing, pause and map exit');
 }finally{await browser.close()}
}
