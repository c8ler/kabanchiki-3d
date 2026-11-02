import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';import {INTRO_STORY} from '../src/intro-sequence.js';
await mkdir('screenshots',{recursive:true});
for(const engine of [chromium,webkit]){
 const browser=await engine.launch(),page=await browser.newPage({serviceWorkers:'block',viewport:engine===webkit?{width:390,height:844}:{width:1024,height:720},isMobile:engine===webkit,hasTouch:engine===webkit}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__bootLeak=[];
  const observer=new MutationObserver(()=>{const menu=document.getElementById('intro');if(!menu||!menu.getClientRects().length)return;if(!window.__allowMenu226)window.__bootLeak.push('menu visible before story completion')});
  observer.observe(document,{subtree:true,attributes:true,childList:true});
 });
 try{
  await page.goto('http://127.0.0.1:8080/');
  await page.locator('#startupCredits').waitFor({state:'visible',timeout:120000});
  assert.equal(await page.locator('#intro').isVisible(),false);
  assert.equal(await page.locator('#startupCreditText').textContent(),'Made by c8ler');
  await page.waitForFunction(()=>!document.getElementById('loadingScreen'),null,{timeout:120000});
  assert.equal(await page.locator('#intro').evaluate(el=>el.inert),true);
  await page.waitForFunction(()=>document.getElementById('startupCreditText').textContent==='Powered by ChatGPT');
  const box=await page.locator('#startupCreditText').boundingBox(),viewport=page.viewportSize();assert.ok(box.x>=0&&box.x+box.width<=viewport.width);
  const shot=await page.screenshot({path:'screenshots/v226-'+engine.name()+'-credits.jpg',type:'jpeg',quality:45}),data=shot.toString('base64');for(let i=0;i<data.length;i+=6000)console.log('REVIEW_IMAGE:v226-'+engine.name()+'-credits:'+i/6000+':'+data.slice(i,i+6000));
  await page.locator('#startupCreditNext').click();
  await page.locator('#cinematic').waitFor({state:'visible'});
  for(const scene of INTRO_STORY){assert.equal(await page.locator('#intro').isVisible(),false);assert.equal(await page.locator('#cinematicText').textContent(),scene.text);await page.locator('#cinematicNext').click()}
  assert.equal(await page.locator('#cinematicLesson').isVisible(),true);assert.deepEqual(await page.evaluate(()=>window.__bootLeak),[]);
  await page.evaluate(()=>window.__allowMenu226=true);await page.locator('#cinematicNext').click();
  await page.locator('#intro').waitFor({state:'visible'});assert.equal(await page.locator('#intro').evaluate(el=>el.inert),false);
  await page.locator('#watchIntro').click();assert.equal(await page.locator('#startupCredits').isVisible(),false);assert.equal(await page.locator('#cinematicText').textContent(),INTRO_STORY[0].text);
  await page.locator('#cinematicSkip').click();await page.locator('#cinematicNext').click();await page.locator('#intro').waitFor({state:'visible'});
  // Returning visitors still receive the opening order, without losing campaign progress.
  await page.reload();await page.locator('#startupCredits').waitFor({state:'visible',timeout:120000});assert.equal(await page.locator('#intro').isVisible(),false);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('kabanchiki3d_campaign')).introSeen),true);
  await page.waitForFunction(()=>!document.getElementById('loadingScreen'));await page.locator('#startupCreditNext').click();await page.locator('#startupCreditNext').click();await page.locator('#cinematic').waitFor({state:'visible'});assert.equal(await page.locator('#intro').isVisible(),false);
  assert.deepEqual(errors,[]);console.log('PASS226',engine.name(),'credits → story → controls → menu; no menu flash; replay; returning visitor; portrait');
 }finally{await browser.close()}
}
