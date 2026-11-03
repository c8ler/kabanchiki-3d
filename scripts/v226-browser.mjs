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
  // Inspect the actual vector artwork without running a second 3D scene.
  const art=await browser.newPage({viewport:page.viewportSize()});
  await art.route('**/ident-review',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0;background:#000"><canvas id="art" style="width:100vw;height:100vh"></canvas>'}));
  await art.goto('http://127.0.0.1:8080/ident-review');
  for(const index of [0,1]){
   const stats=await art.evaluate(async index=>{
    const {drawStartupCredit}=await import('/src/startup-art.js'),canvas=document.getElementById('art');
    const count=()=>{const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let bright=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]+pixels[i+1]+pixels[i+2]>120)bright++;return bright};
    drawStartupCredit(canvas,index,0);const darkStart=count();
    drawStartupCredit(canvas,index,1);const darkEnd=count();
    drawStartupCredit(canvas,index,.5);const visible=count(),corner=[...canvas.getContext('2d').getImageData(0,0,1,1).data];
    return{darkStart,darkEnd,visible,corner,width:canvas.width,height:canvas.height};
   },index);
   assert.equal(stats.darkStart,0);assert.equal(stats.darkEnd,0);assert.ok(stats.visible>400);assert.deepEqual(stats.corner,[0,0,0,255]);assert.ok(stats.width<=1920&&stats.height<=1920);
   const data=(await art.screenshot({path:'screenshots/v227-'+engine.name()+'-ident-'+index+'.jpg',type:'jpeg',quality:60})).toString('base64');
   for(let i=0;i<data.length;i+=6000)console.log('REVIEW_IMAGE:v227-'+engine.name()+'-ident-'+index+':'+i/6000+':'+data.slice(i,i+6000));
  }
  await art.close();
  await page.goto('http://127.0.0.1:8080/');
  await page.locator('#cinematic').waitFor({state:'visible',timeout:120000});
  assert.deepEqual(await page.evaluate(()=>window.__credits226),['Made by c8ler','Powered by ChatGPT']);assert.equal(await page.locator('#startupCredits button').count(),0);assert.equal(await page.locator('canvas#startupCreditText').count(),1);
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
