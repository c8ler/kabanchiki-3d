import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
await mkdir('screenshots',{recursive:true});
for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true}),mobile=engine===webkit;
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:960,height:640},isMobile:mobile,hasTouch:mobile}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:120000});
  const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
  for(const scenario of ['family','personal','crafted','roof','surface','near-wall','wall']){
   const kind=scenario==='surface'?'standingLamp':'chair',r=await qa('v216PlacementScenario',scenario,kind);
   console.log('PLACEMENT',engine.name(),JSON.stringify(r));assert.ok(r.unchanged);assert.ok(r.materials.length);assert.ok(r.materials.every(m=>m.transparent&&m.opacity>0&&m.opacity<.6&&!m.depthWrite&&!m.depthTest));
   assert.equal(r.placed,scenario!=='wall',scenario+' '+r.target?.reason);assert.equal(r.remaining,r.placed?0:1);assert.ok(r.hiddenAfterPause);
   if(r.placed){assert.deepEqual(r.position,[r.target.x,r.target.y,r.target.z]);assert.ok(Math.abs(r.position[1]-(scenario==='roof'?3.075:scenario==='surface'?.925:['family','personal','crafted'].includes(scenario)?.16:0))<.001)}
  }
  for(const kind of ['bed','chair','table','standingLamp','wardrobe','stove'])for(const angle of [0,Math.PI/2]){
   const r=await qa('v216PlacementScenario','crafted',kind,angle);assert.ok(r.placed,kind+' '+angle+' '+r.target?.reason);assert.ok(r.position[1]<.2);
  }
  for(const room of ['crafted','family','personal']){
   await qa('v216PlacementScenario',room,'chair',0,true);await page.waitForTimeout(120);
   const buffer=await page.screenshot({path:'screenshots/v216-'+engine.name()+'-'+room+'.jpg',type:'jpeg',quality:50});
   if(!mobile){const data=buffer.toString('base64');for(let i=0;i<data.length;i+=6000)console.log('REVIEW_IMAGE:v216-'+room+':'+(i/6000)+':'+data.slice(i,i+6000))}
  }
  await qa('v216PreviewSetup');await page.waitForTimeout(100);let p=await qa('v216PreviewInspect');assert.ok(p.visible&&p.stock===1&&p.count===0);
  await page.keyboard.press('KeyZ');await page.waitForTimeout(100);p=await qa('v216PreviewInspect');assert.ok(Math.abs(p.rotation-Math.PI/2)<.001);
  const before=p.position;await page.keyboard.down('KeyW');await page.waitForFunction(([x,z])=>{const p=window.__KABANCHIKI_QA__.v216PreviewInspect().position;return p&&Math.hypot(p[0]-x,p[2]-z)>.15},[before[0],before[2]],{timeout:10000});await page.keyboard.up('KeyW');p=await qa('v216PreviewInspect');assert.ok(Math.hypot(p.position[0]-before[0],p.position[2]-before[2])>.1);
  await page.screenshot({path:'screenshots/v216-'+engine.name()+'-ghost.jpg'});
  await page.keyboard.press('Escape');await page.waitForTimeout(100);p=await qa('v216PreviewInspect');assert.ok(p.paused&&!p.visible);
  for(const fps of [15,30,60,144]){const r=await qa('v216Crawl',fps);console.log('CRAWL',engine.name(),fps,JSON.stringify(r));assert.ok(r.stopsWhenPaused);for(let i=0;i<2;i++){const p=r.items[i].position;assert.ok(Math.hypot(p[0]-r.initial[i][0],p[2]-r.initial[i][2])>.5);assert.equal(r.items[i].blocked,false);assert.ok(r.items[i].age>19)}}
  await qa('v216Crawl',60,true);const a=await qa('v216CrawlInspect');await page.waitForFunction(ages=>window.__KABANCHIKI_QA__.v216CrawlInspect().every((item,i)=>item.age>ages[i]+.4),a.map(i=>i.age),{timeout:10000});const b=await qa('v216CrawlInspect');for(let i=0;i<2;i++){assert.ok(b[i].age>a[i].age+.3,'real game loop must update creatures');assert.ok(Math.hypot(b[i].position[0]-a[i].position[0],b[i].position[2]-a[i].position[2])>.015)}
  assert.deepEqual(errors,[]);console.log('v216 placement and crawling PASS',engine.name());
 }finally{await browser.close()}
}
