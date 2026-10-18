import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
await mkdir('screenshots',{recursive:true});
for(const [engine,mobile] of [[chromium,false],[webkit,true]]){
 const browser=await engine.launch({headless:true}),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:960,height:600},isMobile:mobile,hasTouch:mobile}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:90000});
 const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 const furniture=await qa('v211FurnitureJumps');console.log('FURNITURE',JSON.stringify(furniture));assert.deepEqual(furniture.issues,[]);
 for(const form of ['cat','boar']){const clock=await qa('v211Clock',form,.5);console.log('CLOCK',form,clock);assert.equal(clock.end,0);for(let role=0;role<4;role++){const r=await qa('v211Reunion',form,role,3);console.log('REUNION',form,role,JSON.stringify(r));assert.equal(r.form,form);assert.equal(r.heroVisible,true);}}
 const shot=async(name)=>{await page.waitForTimeout(250);const b=await page.screenshot({path:'screenshots/v211-'+name+'.jpg',type:'jpeg',quality:45});if(!mobile||name.includes('low')||name.includes('normal')){const s=b.toString('base64');for(let i=0;i<s.length;i+=6000)console.log('REVIEW_IMAGE:'+name+':'+Math.floor(i/6000)+':'+s.slice(i,i+6000));}};
 for(const n of [1,2,3,4,5]){const scene=await qa('v211Scene',n,'exit');console.log('EXIT',JSON.stringify(scene));if(n===3)assert.deepEqual(scene.fence,{left:-48,right:48,opening:11});await shot((mobile?'mobile-':'desktop-')+'exit-'+n);}
 for(const kind of ['normal','low','pickup']){await qa('v211Scene',3,kind);await shot((mobile?'mobile-':'desktop-')+kind);}
 for(const form of ['cat','boar']){await qa('v211Reunion',form,2,3);await shot((mobile?'mobile-':'desktop-')+'reunion-'+form);}
 assert.deepEqual(errors,[]);console.log('v211 browser PASS',mobile?'webkit-mobile':'chromium-desktop');
 }finally{await browser.close();}
}
