import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
await mkdir('screenshots',{recursive:true});const failures=[];
for(const [engine,mobile] of [[chromium,false],[webkit,true]]){
 const browser=await engine.launch({headless:true}),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:960,height:640},isMobile:mobile,hasTouch:mobile}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:120000});
 const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 const check=async(name,fn)=>{try{await fn();console.log('PASS',mobile?'webkit':'chromium',name)}catch(e){failures.push(name+': '+e.message);console.log('CHECK_FAILED',name,e.stack)}};
 const shot=async(name)=>{const b=await page.screenshot({path:'screenshots/v213-'+(mobile?'mobile-':'desktop-')+name+'.jpg',type:'jpeg',quality:45});const s=b.toString('base64');for(let i=0;i<s.length;i+=6000)console.log('REVIEW_IMAGE:'+(mobile?'mobile-':'desktop-')+name+':'+Math.floor(i/6000)+':'+s.slice(i,i+6000));};
 for(const n of [1,2,3,4,5,6])await check('real '+(mobile?'button':'Q')+' dismount level '+n,async()=>{
 const start=await qa('v214Mounted',n);assert.ok(start.ok&&start.mounted);
 if(mobile)await page.locator('#dismountAction').tap();else await page.keyboard.press('q');
 await page.waitForTimeout(1600);await page.waitForFunction(()=>{const r=window.__KABANCHIKI_QA__.v214MountInspect();return !r.mounted&&r.py<.1&&Math.abs(r.vy)<.1},null,{timeout:10000});const r=await qa('v214MountInspect');console.log('DISMOUNT',n,r);assert.equal(r.mounted,false);assert.ok(r.py<.1&&Math.abs(r.vy)<.1);assert.ok(r.distance>1.25&&!r.blocked);});
 await check('fresh intentional jump mounts again',async()=>{await page.keyboard.press('Space');await page.waitForTimeout(150);const r=await qa('v214MountInspect');assert.equal(r.mounted,true)});
 await check('countdown DOM survives active update',async()=>{for(const t of [0,54.9,55,59.9,60,115,120,175,180,235,240,284.9,285,299.9,300,301]){const r=await qa('v214Clock',t);assert.equal(r.hidden,!r.clock.shown,'DOM at '+t)}});
 await check('minions traverse arena from all directions',async()=>{for(const fps of [15,60])for(let k=0;k<8;k++){const r=await qa('v214MinionRobot',k*Math.PI/4,fps);console.log('MINION',fps,k,r);assert.ok(r.spawn&&r.remaining<8);assert.equal(r.penetrations,0);assert.ok(r.maxStep<=2.1/fps+.01&&r.reversals<8)}});
 await check('minions route around a stationary boss',async()=>{for(let k=0;k<4;k++){const r=await qa('v214MinionRobot',k*Math.PI/2,30,true);console.log('MINION_TRAFFIC',k,r);assert.ok(r.spawn&&r.remaining<8);assert.equal(r.penetrations,0);assert.ok(r.reversals<8)}});
 await check('four minions progress around boss and one another',async()=>{const r=await qa('v214MinionSwarm');console.log('MINION_SWARM',r);assert.equal(r.length,4);for(const m of r){assert.ok(m.remaining<8&&m.longest<3&&m.reversals<8,JSON.stringify(m));assert.equal(m.penetrations,0)}});
 await check('real boss summons mobile unobstructed minions',async()=>{await qa('v214BossLive');await page.waitForTimeout(400);const before=await qa('v214BossInspect');assert.equal(before.length,2);await page.waitForFunction(before=>{const after=window.__KABANCHIKI_QA__.v214BossInspect();return after.length===2&&after.every((m,i)=>Math.hypot(m.x-before[i].x,m.z-before[i].z)>.6)},before,{timeout:15000});const after=await qa('v214BossInspect');console.log('MINIONS_LIVE',before,after);assert.equal(after.length,2);for(let i=0;i<2;i++){assert.equal(after[i].entering,false);assert.equal(after[i].blocked,false);assert.ok(Math.hypot(after[i].x-before[i].x,after[i].z-before[i].z)>.6)}});
 const menus=['intro','difficultyScreen','pauseMenu','familyPopup','endScreen','statsScreen'];
 for(const [width,height] of [[320,568],[568,320],[390,844],[844,390],[1024,600],[240,320],[320,240]])for(const id of menus)await check('menu '+id+' '+width+'x'+height,async()=>{
 await page.setViewportSize({width,height});await qa('v214Menu',id);await page.waitForTimeout(80);
 const r=await page.evaluate(id=>{const e=document.getElementById(id),c=e.firstElementChild,b=c.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:innerWidth,height:innerHeight,overflow:c.scrollWidth-c.clientWidth,scroll:c.scrollHeight>c.clientHeight}},id);
 assert.ok(r.left>=-1&&r.top>=-1&&r.right<=width+1&&r.bottom<=height+1,JSON.stringify(r));assert.ok(r.overflow<=2,JSON.stringify(r));
 await page.evaluate(id=>{const c=document.getElementById(id).firstElementChild;c.scrollTop=c.scrollHeight},id);
 if(id==='pauseMenu'){const b=await page.locator('#resume').boundingBox();assert.ok(b&&b.y>=0&&b.y+b.height<=height,'resume remains visible')}
 if((id==='pauseMenu'&&width===320&&height===240)||(id==='difficultyScreen'&&width===568&&height===320))await shot(id+'-'+width+'x'+height);
 });
 await check('bomb cheat through the real pause form',async()=>{await qa('v214Menu','pauseMenu');await page.locator('#cheatCode').fill('BOMB');await page.locator('#cheatForm button').click();assert.match(await page.locator('#cheatResult').textContent(),/Получена 1 бомбочка/);await page.locator('#resume').click();await page.waitForTimeout(100);assert.equal(await page.locator('#bombAction').isVisible(),true)});
 await check('resume works after scrolling',async()=>{await qa('v214Menu','pauseMenu');await page.locator('#resume').click();await page.waitForTimeout(100);assert.equal(await page.locator('#pauseMenu').isVisible(),false)});
 await check('runtime errors',async()=>assert.deepEqual(errors,[]));
 }finally{await browser.close()}
}
assert.deepEqual(failures,[]);console.log('v213 controls, viewport, timer and minions PASS');