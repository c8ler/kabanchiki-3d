import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true}),context=await browser.newContext({viewport:{width:800,height:600}}),page=await context.newPage(),requests=[],errors=[];
 page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8080/');await page.waitForFunction(()=>!document.getElementById('loadingScreen'),null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__KABANCHIKI_VERSION__),'v215');assert.equal(await page.evaluate(()=>typeof window.__KABANCHIKI_QA__),'undefined');
  assert.equal(requests.some(url=>url.includes('/src/qa/')),false,'normal startup loads test scenarios');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready});await page.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:60000});
  const cached=await page.evaluate(async()=>{const cache=await caches.open('kabanchiki-pwa-v215');return (await cache.keys()).map(r=>r.url)});
  assert.ok(cached.filter(url=>url.includes('/src/runtime/')).length>=73);
  assert.equal(cached.some(url=>url.includes('/src/qa/')),false);
  await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.getElementById('loadingScreen'),null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__KABANCHIKI_VERSION__),'v215');assert.ok(await page.locator('canvas').count());assert.equal(await page.evaluate(()=>typeof window.__KABANCHIKI_QA__),'undefined');
  await context.setOffline(false);await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:120000});
  assert.ok(await page.evaluate(()=>Object.keys(window.__KABANCHIKI_QA__).length)>100);assert.ok(requests.some(url=>url.includes('/src/qa/')));assert.deepEqual(errors,[]);
  console.log(engine.name(),'normal modules, offline startup and lazy QA PASS');
 }finally{await browser.close()}
}
