import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';import {INTRO_STORY} from '../src/intro-sequence.js';
await mkdir('screenshots',{recursive:true});
for(const engine of [chromium,webkit]){
 const browser=await engine.launch(),page=await browser.newPage({serviceWorkers:'block',viewport:engine===webkit?{width:390,height:844}:{width:1024,height:720},isMobile:engine===webkit,hasTouch:engine===webkit}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__bootLeak=[];window.__credits226=[];
  const observer=new MutationObserver(()=>{const card=document.getElementById('startupCredits'),text=document.getElementById('startupCreditText')?.textContent;if(card&&!card.hidden&&text&&window.__credits226.at(-1)!==text)window.__credits226.push(text);const menu=document.getElementById('intro');if(!menu||!menu.getClientRects().length)return;if(!window.__allowMenu226)window.__bootLeak.push('menu visible before story completion')});
  observer.observe(document,{subtree:true,attributes:true,childList:true});
 });
 try{
  await page.goto('http://127.0.0.1:8080/');
  await page.locator('#cinematic').waitFor({state:'visible',timeout:120000});
  assert.deepEqual(await page.evaluate(()=>window.__credits226),['Made by c8ler','Powered by ChatGPT']);
  assert.equal(await page.locator('#intro').isVisible(),false);assert.equal(await page.locator('#intro').evaluate(el=>el.inert),true);
  const shot=await page.screenshot({path:'screenshots/v226-'+engine.name()+'-opening.jpg',type:'jpeg',quality:45}),data=shot.toString('base64');for(let i=0;i<data.length;i+=6000)console.log('REVIEW_IMAGE:v226-'+engine.name()+'-opening:'+i/6000+':'+data.slice(i,i+6000));
  for(const scene of INTRO_STORY){assert.equal(await page.locator('#intro').isVisible(),false);assert.equal(await page.locator('#cinematicText').textContent(),scene.text);await page.locator('#cinematicNext').click()}
  assert.equal(await page.locator('#cinematicLesson').isVisible(),true);assert.deepEqual(await page.evaluate(()=>window.__bootLeak),[]);
  await page.evaluate(()=>window.__allowMenu226=true);await page.locator('#cinematicNext').click();
  await page.locator('#intro').waitFor({state:'visible'});assert.equal(await page.locator('#intro').evaluate(el=>el.inert),false);
  await page.locator('#watchIntro').click();assert.equal(await page.locator('#startupCredits').isVisible(),false);assert.equal(await page.locator('#cinematicText').textContent(),INTRO_STORY[0].text);
  await page.locator('#cinematicSkip').click();await page.locator('#cinematicNext').click();await page.locator('#intro').waitFor({state:'visible'});
  // Returning visitors still receive the opening order, without losing campaign progress.
  await page.reload();await page.locator('#cinematic').waitFor({state:'visible',timeout:120000});assert.equal(await page.locator('#intro').isVisible(),false);
  assert.deepEqual(await page.evaluate(()=>window.__credits226),['Made by c8ler','Powered by ChatGPT']);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('kabanchiki3d_campaign')).introSeen),true);
  assert.deepEqual(await page.evaluate(()=>window.__bootLeak),[]);
  assert.deepEqual(errors,[]);console.log('PASS226',engine.name(),'credits → story → controls → menu; no menu flash; replay; returning visitor; portrait');
 }finally{await browser.close()}
}
