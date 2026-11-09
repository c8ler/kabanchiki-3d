import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';await mkdir('screenshots',{recursive:true});
for(const engine of [chromium,webkit]){
 const mobile=engine===webkit,browser=await engine.launch(),page=await browser.newPage({serviceWorkers:'block',viewport:mobile?{width:390,height:844}:{width:1024,height:720},isMobile:mobile,hasTouch:mobile}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 const shot=async name=>{const b=await page.screenshot({path:'screenshots/v228-'+engine.name()+'-'+name+'.jpg',type:'jpeg',quality:50}),s=b.toString('base64');for(let i=0;i<s.length;i+=6000)console.log('REVIEW_IMAGE:v228-'+engine.name()+'-'+name+':'+i/6000+':'+s.slice(i,i+6000))};
 try{
  await page.goto('http://127.0.0.1:8080/?openingtest=1');await page.waitForFunction(()=>!!window.__KABANCHIKI_QA__,null,{timeout:120000});
  let r=await qa('v228Setup');assert.equal(r.hiddenBefore,'none');assert.equal(r.state,'travel');assert.equal(r.actors,4);assert.equal(r.drawCalls,2);assert.ok(r.budget<=16);await shot('caravan');
  r=await qa('v228Collision');assert.equal(r.inside,true);assert.equal(r.outside,false);
  await qa('v228Move',false);r=await qa('v228Key',false);assert.equal(r.state,'travel');const food=r.food;
  await qa('v228Move',true);const box=await page.locator('#caravanAction').boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=page.viewportSize().width);
  if(mobile)await page.locator('#caravanAction').tap();else await page.keyboard.press('e');
  r=await qa('v228Inspect');assert.equal(r.state,'raid');assert.equal(r.food,food);const before=r.score;
  r=await qa('v228Tick',5);assert.equal(r.state,'loot');assert.equal(r.hits,3);assert.equal(r.score,before);await shot('loot');
  const score=r.score;r=await qa('v228Tick',2);assert.equal(r.score,score);
  r=await qa('v228Loot',0);assert.ok(r.food>0);assert.ok(r.loot.includes(0));
  r=await qa('v228Loot',1);assert.ok(r.wood>=6&&r.wool>=2);assert.ok(r.loot.includes(1));
  r=await qa('v228Loot',2);assert.ok(r.life>1);assert.ok(r.loot.includes(2));
  await qa('v228Setup');r=await qa('v228Wall');assert.deepEqual(r.before,r.after);
  await qa('v228Setup');const bombScore=(await qa('v228Inspect')).score;r=await qa('v228Bomb');assert.equal(r.state,'loot');assert.equal(r.score,bombScore);
  await qa('v228Setup');r=await qa('v228Limit');assert.ok(r.budget<=16);
  await qa('v228Menu');await page.locator('[data-cheat="CARAVAN"]').click();r=await qa('v228Inspect');assert.equal(r.state,'none');assert.equal(await page.locator('[data-cheat="CARAVAN"]').getAttribute('aria-pressed'),'false');await page.locator('[data-cheat="CARAVAN"]').click();r=await qa('v228Inspect');assert.equal(r.state,'travel');await page.locator('[data-undo-cheat="CARAVAN"]').click();r=await qa('v228Inspect');assert.equal(r.state,'none');await page.locator('#secretResume').click();
  await qa('v228Setup');r=await qa('v228Exit');assert.equal(r.state,'none');assert.equal(r.cheats,false);
  r=await qa('v228Leave');assert.equal(r.state,'none');assert.equal(r.actors,0);assert.equal(await page.locator('#caravanAction').isVisible(),false);
  assert.deepEqual(errors,[]);console.log('PASS228',engine.name(),'hidden joke cheat, boar raid, physical loot, frozen score, walls, quota, bomb, toggles, exit and portrait action');
 }finally{await browser.close()}
}
