import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';import {INTRO_STORY} from '../src/intro-sequence.js';await mkdir('screenshots',{recursive:true});
for(const engine of [chromium,webkit]){
 const mobile=engine===webkit,browser=await engine.launch(),page=await browser.newPage({serviceWorkers:'block',viewport:mobile?{width:390,height:844}:{width:1024,height:720},isMobile:mobile,hasTouch:mobile}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const shot=async name=>{const b=await page.screenshot({path:'screenshots/v224-'+engine.name()+'-'+name+'.jpg',type:'jpeg',quality:45}),data=b.toString('base64');for(let i=0;i<data.length;i+=6000)console.log('REVIEW_IMAGE:v224-'+engine.name()+'-'+name+':'+i/6000+':'+data.slice(i,i+6000))};
 const menuBack=async()=>{while(await page.locator('#pauseBack').isVisible())await page.locator('#pauseBack').click()};
 try{
  await page.goto('http://127.0.0.1:8080/');await page.waitForFunction(()=>!document.getElementById('loadingScreen'),null,{timeout:120000});await page.locator('#cinematic').waitFor({state:'visible',timeout:30000});
  for(let i=0;i<INTRO_STORY.length;i++){
   assert.equal(await page.locator('#cinematicText').textContent(),INTRO_STORY[i].text);assert.equal(await page.locator('#cinematicLesson').isVisible(),false);
   if(i===1)await shot('story');await page.locator('#cinematicNext').click();
  }
  assert.equal(await page.locator('#cinematicLesson').isVisible(),true);assert.equal(await page.locator('#cinematicText').isVisible(),false);assert.equal(await page.locator('#cinematicControls h3').count(),3);
  await page.locator('#cinematicNext').click();await page.locator('#intro').waitFor({state:'visible'});
  await page.locator('#watchIntro').click();assert.equal(await page.locator('#cinematicText').textContent(),INTRO_STORY[0].text);await page.keyboard.press('Space');assert.equal(await page.locator('#cinematicText').textContent(),INTRO_STORY[1].text);await page.keyboard.press('Escape');assert.equal(await page.locator('#cinematicLesson').isVisible(),true);await page.keyboard.press('Enter');
  await page.locator('#start').click();await page.locator('input[name="diff3d"][value="1"]').check({force:true});await page.locator('#difficultyStart').click();await page.locator('#pauseBtn').click();await page.locator('#pauseMenu').waitFor({state:'visible'});
  assert.equal(await page.locator('#menuDifficulty').isVisible(),false);assert.equal(await page.locator('#perf').isVisible(),false);
  const saved=await page.locator('#stats').textContent();await page.locator('#menuHelp').click();await page.locator('#showControls').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#replayIntro').isVisible(),true);await page.locator('#replayIntro').click();
  await page.locator('#cinematicSkip').click();await page.locator('#cinematicNext').click();assert.equal(await page.locator('#pauseMenu').isVisible(),true);assert.equal(await page.locator('#replayIntro').isVisible(),true);assert.equal(await page.locator('#stats').textContent(),saved);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#restart').isVisible(),true);await shot('pause');
  await page.locator('#restart').click();await page.locator('input[name="diff3d"][value="0"]').check({force:true});await page.locator('#difficultyStory').click();await page.locator('#cinematicSkip').click();await page.locator('#cinematicNext').click();
  assert.equal(await page.locator('#difficultyScreen').isVisible(),true);assert.equal(await page.locator('input[name="diff3d"][value="0"]').isChecked(),true);await page.locator('#difficultyBack').click();assert.equal(await page.locator('#stats').textContent(),saved);
  await page.locator('#restart').click();await page.locator('input[name="diff3d"][value="0"]').check({force:true});await page.locator('#difficultyStart').click();await page.locator('#pauseBtn').click();assert.equal(await page.locator('#healthMeter').getAttribute('aria-valuemax'),'10');
  await page.locator('#menuSettings').click();await page.locator('#menuDifficulty').click();await page.locator('input[name="diff3d"][value="1"]').check({force:true});await page.locator('#difficultyStart').click();assert.equal(await page.locator('#healthMeter').getAttribute('aria-valuemax'),'7');assert.equal(await page.locator('#menuDifficulty').isVisible(),true);
  for(const [width,height]of [[320,568],[390,844],[240,320],[568,320]])for(const name of ['root','help','controls','settings','journal','about']){
   await page.setViewportSize({width,height});await menuBack();
   if(name==='controls'){await page.locator('#menuHelp').click();await page.locator('#showControls').click()}else if(name!=='root')await page.locator('[data-pause-open="'+name+'"]').click();
   const card=await page.locator('#pauseMenu>div').boundingBox();assert.ok(card.x>=0&&card.y>=0&&card.x+card.width<=width+1&&card.y+card.height<=height+1,JSON.stringify(card));
   assert.equal(await page.locator('#pauseMenu>div').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
   for(const b of await page.locator('#pauseMenu button:visible').all()){await b.evaluate(e=>e.scrollIntoView({block:'center'}));const hit=await b.evaluate(e=>{const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,h=document.elementFromPoint(x,y);return x>=0&&x<innerWidth&&y>=0&&y<innerHeight&&(h===e||e.contains(h))});assert.equal(hit,true,await b.textContent())}
  }
  assert.deepEqual(errors,[]);console.log('PASS224',engine.name(),'story before controls, keyboard navigation, safe replay, restart difficulty, cancellation and nested menus');
 }finally{await browser.close()}
}
