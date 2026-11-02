import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';await mkdir('screenshots',{recursive:true});
for(const engine of [chromium,webkit]){
 const mobile=engine===webkit,browser=await engine.launch(),page=await browser.newPage({serviceWorkers:'block',viewport:mobile?{width:390,height:844}:{width:1024,height:720},isMobile:mobile,hasTouch:mobile}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 const shot=async name=>{const b=await page.screenshot({path:'screenshots/v225-'+engine.name()+'-'+name+'.jpg',type:'jpeg',quality:45}),s=b.toString('base64');for(let i=0;i<s.length;i+=6000)console.log('REVIEW_IMAGE:v225-'+engine.name()+'-'+name+':'+i/6000+':'+s.slice(i,i+6000))};
 try{
  await page.goto('http://127.0.0.1:8080/?autotest=1&level=6');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready&&window.__KABANCHIKI_TEST__.auditsComplete!==false,null,{timeout:120000});
  await qa('v225Setup',6);
  for(const [kind,angle]of [['house',0],['house',Math.PI/4],['wall',0],['wall',Math.PI/2]])for(const dt of [.05,.5,2]){const r=await qa('v225Fire',kind,angle,dt);assert.equal(r.blocked,true,JSON.stringify(r));assert.equal(r.ignited,true);assert.equal(r.safe,true);assert.equal(r.items[0].exists,true)}
  await qa('v225Fire','house',0,.05);await shot('burning-house');let r=await qa('v225Burn',48);assert.equal(r.items[0].exists,false);assert.equal(r.fires,0);assert.ok(r.debris>0);
  await qa('v225Setup',7);r=await qa('v225Storm');assert.ok(r.waiting.items.every(i=>i.exists));assert.ok(r.started.pending>0,JSON.stringify(r));assert.equal(r.started.items[1].exists,true);assert.equal(r.wallSolid,true);
  r=await qa('v225StormStep',.4);assert.equal(r.items[0].exists,true);assert.notEqual(r.items[0].rotation,0);r=await qa('v225StormStep',1.2);assert.equal(r.items[0].exists,false);assert.equal(r.items[1].exists,true);assert.equal(r.wallSolid,false);assert.ok(r.debris>0);await qa('v225Focus');await shot('tornado-debris');
  await qa('v225Setup',7);await qa('v225Storm');await qa('v225StormStep',.3);r=await qa('v225StormCancel');assert.equal(r.pending,0);assert.ok(r.items.every(i=>i.exists));assert.equal(r.items[0].rotation,0);
  await qa('v225Setup',3);r=await qa('v225Home');assert.equal(r.before,3);assert.equal(r.during,3);assert.equal(r.after,0);assert.ok(r.debris>0);
  assert.deepEqual(errors,[]);console.log('PASS225',engine.name(),'swept fire collision, rotated cover, delayed ignition collapse, actual tornado scheduling, sheltered furniture, cancellation and personal home');
 }finally{await browser.close()}
}
