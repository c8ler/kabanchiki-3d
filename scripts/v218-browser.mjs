import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';
for(const engine of [chromium,webkit]){
 const mobile=engine===webkit,browser=await engine.launch(),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1024,height:720},isMobile:mobile,hasTouch:mobile}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 const reveal=async()=>{for(let i=0;i<5;i++)await page.locator('#versionSecret').click();await page.locator('#secretMenu').waitFor({state:'visible'})};
 try{
  await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:120000});
  for(const r of await qa('v218CampaignAudit')){assert.equal(r.bombs,0);assert.ok(!r.pickups.includes('bomb'));assert.ok(!r.craft&&!r.home&&!r.placed)}
  assert.equal(await page.locator('#pauseMenu [data-cheat]').count(),0);assert.equal(await page.locator('#fishAction').count(),0);
  for(let i=0;i<4;i++){await page.locator('#versionSecret').click();assert.equal((await qa('v218SecretState')).open,false)}
  await page.locator('#versionSecret').click();assert.equal((await qa('v218SecretState')).open,true);assert.equal(await page.locator('#pauseMenu').isVisible(),false);
  await page.locator('[data-cheat="BOMB"]').click();assert.equal((await qa('v217Inspect')).bombs,1);
  await page.keyboard.press('Escape');assert.deepEqual(await qa('v218SecretState'),{open:false,paused:true,visible:false,version:'v218'});
  await reveal();await page.locator('#secretResume').click();assert.equal((await qa('v218SecretState')).paused,false);
  await page.keyboard.press('KeyG');assert.equal((await qa('v217Inspect')).bombs,0);
  await qa('v217Fresh');assert.equal((await qa('v217Inspect')).bombs,0);assert.equal((await qa('v218SecretState')).visible,false);
  await qa('v218FishingApproach');await page.keyboard.press('KeyH');assert.equal((await qa('v217FishInspect')).active,false);
  await qa('v218MoveToBank');await page.waitForFunction(()=>window.__KABANCHIKI_QA__.v217FishInspect().active,null,{timeout:30000});
  await page.keyboard.press('KeyH');assert.equal((await qa('v217FishInspect')).active,true);
  await page.keyboard.down('KeyA');await page.waitForFunction(()=>!window.__KABANCHIKI_QA__.v217FishInspect().active,null,{timeout:10000});await page.keyboard.up('KeyA');
  assert.deepEqual(errors,[]);console.log('v218 hidden tools and automatic fishing PASS',engine.name());
 }finally{await browser.close()}
}
