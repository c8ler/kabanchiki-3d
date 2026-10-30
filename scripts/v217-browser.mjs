import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
await mkdir('screenshots',{recursive:true});
for(const engine of [chromium,webkit]){
 const mobile=engine===webkit,browser=await engine.launch(),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1024,height:720},isMobile:mobile,hasTouch:mobile}),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(e.message));
 const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 const check=async(name,fn)=>{try{await fn();console.log('PASS217',engine.name(),name)}catch(e){failures.push(name+': '+e.stack);console.log('FAIL217',name,e.stack)}};
 const reveal=async()=>{for(let i=0;i<5;i++)await page.locator('#versionSecret').click();await page.locator('#secretMenu').waitFor({state:'visible'})};
 const shot=async name=>{const b=await page.screenshot({path:'screenshots/v217-'+engine.name()+'-'+name+'.jpg',type:'jpeg',quality:50});if(!mobile){const data=b.toString('base64');for(let i=0;i<data.length;i+=6000)console.log('REVIEW_IMAGE:v217-'+name+':'+i/6000+':'+data.slice(i,i+6000))}};
 try{
  await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:120000});
  await check('ordinary campaign gates all creation until a cheat button is pressed',async()=>{
   const r=await qa('v217Fresh');assert.ok(!r.craft&&!r.home&&!r.homeVisible&&!r.yard&&r.craftHidden);
   assert.equal(r.bombs,0);assert.equal(r.pickupBombs,0);assert.equal(await page.locator('#cheatPanel').isVisible(),false);await reveal();assert.equal(await page.locator('#cheatCode').isVisible(),false);
   assert.equal(await page.locator('[data-cheat="CRAFT"]').count(),0);let p=await qa('v217Inspect');assert.ok(p.craft&&!p.craftHidden);
   await page.locator('[data-cheat="HOME"]').click();p=await qa('v217Inspect');assert.ok(p.home&&p.homeVisible&&p.yard);await shot('cheat-buttons');
  });
  await check('secret island can be entered, played and left through buttons',async()=>{
   await page.locator('[data-cheat="SANDBOX"]').click();let r=await qa('v217Inspect');assert.equal(r.level,7);assert.ok(r.sandbox&&r.craft&&r.home&&r.foes===0);
   await qa('v221Collect','wood');await page.locator('#craftPanel').evaluate(el=>el.open=true);await page.locator('#craft-block').click();assert.equal((await qa('v217Inspect')).stock.block,1);
   await page.locator('#secretResume').click();await page.keyboard.press('KeyT');await page.waitForFunction(()=>window.__KABANCHIKI_QA__.v217Inspect().items.some(item=>item.kind==='block'),null,{timeout:10000});
   const before=(await qa('v217Inspect')).position;await page.keyboard.down('KeyW');await page.waitForFunction(([x,z])=>{const p=window.__KABANCHIKI_QA__.v217Inspect().position;return Math.hypot(p[0]-x,p[2]-z)>.2},[before[0],before[2]],{timeout:10000});await page.keyboard.up('KeyW');await shot('island');
   r=await qa('v217SandboxClock');assert.ok(r.sandbox&&!r.tornado&&!r.ended&&r.life>0);assert.equal(r.time,900);
   await page.keyboard.press('Escape');await reveal();await page.locator('[data-cheat="LEVEL2"]').click();r=await qa('v217Inspect');assert.equal(r.level,2);assert.equal(r.sandbox,false);
  });
  await check('cheated cats share the village cat AI and dogs move smoothly',async()=>{
   for(const fps of [20,30,60,144]){const r=await qa('v217PetRobot',fps);console.log('PET217',fps,JSON.stringify(r));assert.ok(r.turn<=3.2/fps+.001);assert.ok(r.step<=2.8/fps+.001);assert.ok(r.legs>.2&&r.travel>2);assert.ok(r.remaining<4);assert.ok(r.catJump&&r.catRide)}
  });
  await check('fishing finds water around every accessible shoreline',async()=>{
   const results=await qa('v217ShoreAudit');console.log('SHORE217',JSON.stringify(results));for(const r of results)assert.ok(r.target,'no fishing '+JSON.stringify(r));
  });
  await check('fishing from a bridge walkway',async()=>{const r=await qa('v217Fishing',4,1.8,-13,false);assert.ok(r.started&&r.active);assert.ok(r.gripDistance<.0001)});
  await check('the rod follows the hand, fish is visible, first-person fishing and controls work',async()=>{
   let r=await qa('v217Fishing',4,17,0,false); // Move to the real bank using the audited target below.
   const shores=await qa('v217ShoreAudit'),bank=shores.find(p=>p.level===4&&p.x===18);
   r=await qa('v217Fishing',4,bank.x,bank.z,true);console.log('FISH217',JSON.stringify(r));assert.ok(r.started&&r.active&&r.fishVisible);assert.ok(r.gripDistance<.0001);assert.ok(r.fish[1]>.12);
   await page.waitForFunction(()=>window.__KABANCHIKI_QA__.v217FishInspect().active);await shot('fish-catch');
   assert.equal(await page.locator('#fishAction').count(),0);await page.keyboard.press('KeyH');r=await qa('v217FishInspect');assert.equal(r.active,true);
   for(let i=0;i<10&&(await qa('v217FishInspect')).camera!==9;i++)await page.keyboard.press('KeyV');await page.waitForTimeout(100);r=await qa('v217FishInspect');assert.ok(r.camera===9&&r.rod&&r.line&&r.gripDistance<.0001);await shot('fishing-first-person');
   await page.keyboard.down('KeyW');await page.waitForFunction(()=>!window.__KABANCHIKI_QA__.v217FishInspect().active,null,{timeout:10000});await page.keyboard.up('KeyW');assert.equal((await qa('v217FishInspect')).active,false);
  });
  await check('cheat menu fits small screens in both orientations',async()=>{
   await qa('v217Fresh');await reveal();
   for(const size of [{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(size);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const rect=await page.locator('#secretMenu > div').evaluate(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}});console.log('MENU217',engine.name(),JSON.stringify({size,rect}));assert.ok(rect.x>=0&&rect.y>=0&&rect.w<=size.width&&rect.h<=size.height&&rect.scrollWidth<=rect.clientWidth+2)}
  });
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);console.log('v217 creative island, companion AI and fishing PASS',engine.name());
 }finally{await browser.close()}
}
