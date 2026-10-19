import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
await mkdir('screenshots',{recursive:true});const failures=[];
for(const [engine,mobile] of [[chromium,false],[webkit,true]]){
 const browser=await engine.launch({headless:true}),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:960,height:640},isMobile:mobile,hasTouch:mobile}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:120000});
 const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 const check=async(name,fn)=>{try{await fn();console.log('PASS',mobile?'webkit':'chromium',name)}catch(e){failures.push(name+': '+e.message);console.log('CHECK_FAILED',name,e.stack)}};
 const shot=async(name,show=true)=>{await page.waitForTimeout(300);const b=await page.screenshot({path:'screenshots/v212-'+(mobile?'mobile-':'desktop-')+name+'.jpg',type:'jpeg',quality:45});if(show){const s=b.toString('base64');for(let i=0;i<s.length;i+=6000)console.log('REVIEW_IMAGE:'+(mobile?'mobile-':'desktop-')+name+':'+Math.floor(i/6000)+':'+s.slice(i,i+6000));}};
 await check('warning and avoidable seasonal tornado',async()=>{for(const season of [0,1,2,3]){const warning=await qa('v212Tornado',240,false,season);assert.equal(warning.clock.warning,true);assert.equal(warning.active,false);const far=await qa('v212Tornado',300,false,season);assert.equal(far.active,true);assert.equal(far.farCarry,0);const near=await qa('v212Tornado',301,true,season);assert.equal(near.movie,'storm')}const boss=await qa('v212Tornado',999,false,0,6);assert.equal(boss.active,false)});
 await check('objects spiral into the vortex',async()=>{const r=await qa('v212Swirl');console.log('SWIRL',r);assert.ok(r.treeLifted&&r.foodLifted&&r.kinds.includes('tree')&&r.kinds.includes('food'))});
 await check('low boar jumps on foot and mounted',async()=>{for(const fps of [15,30,60,144])for(const mounted of [false,true]){const r=await qa('v212BoarJump',fps,mounted);console.log('HOP',fps,mounted,r);assert.ok(r.peak>.15&&r.peak<=.36);if(!mounted)assert.ok(r.accepted&&r.end<.02)}});
 await check('all exit floor lanes',async()=>{for(const n of [1,2,3,4,5]){const r=await qa('v212ExitFloor',n);console.log('EXIT_FLOOR',r);assert.deepEqual(r.issues,[]);assert.equal(r.near,-46)}});
 await check('ground forage follows terrain in wind',async()=>{const r=await qa('v212ForageWind');console.log('FORAGE',r);assert.ok(r.worst>=-.005)});
 await check('friend combat preserves fishing until player is hit',async()=>{const r=await qa('v212FishingDefense');console.log('FISHING',r);assert.ok(r.before&&r.during&&r.stoppedOnHit)});
 await check('crafting and timed bomb placement',async()=>{const r=await qa('v212CraftAndBomb');console.log('CRAFT',r);assert.ok(r.ok&&r.lamp&&r.hasFlashlight&&r.placed&&!r.insufficient);assert.equal(r.remaining,0);assert.ok(r.life>0)});
 await check('lit home can be destroyed and rebuilt',async()=>{const r=await qa('v212BlastHome');console.log('HOME',r);assert.ok(r.lit&&r.refill);assert.equal(r.stage,0);assert.equal(r.lamp,false)});
 await check('blast danger and safe perimeter',async()=>{for(const distance of [0,3,6,8]){const r=await qa('v212BlastDamage',distance);console.log('DAMAGE',r);assert.equal(r.life,distance===0?0:distance===3?r.maxLife-Math.ceil(r.maxLife/2):r.maxLife);assert.equal(r.friendHP,r.maxLife-2)}});
 await check('family survives house destruction and player home rebuilds',async()=>{const r=await qa('v212BlastRescue');console.log('EVACUATE',r);assert.ok(r.destroyed&&r.present&&r.unfinished&&r.safe&&r.distance>5);const home=await qa('v212RebuildHome');console.log('REBUILD',home);assert.ok(home.destroyed&&home.stage===4&&home.lit)});
 for(const form of ['cat','boar'])for(const role of [0,1,2,3])await check('visible relative '+form+' '+role,async()=>{await qa('v212Reunion',form,role,6);await shot('reunion-'+form+'-'+role,!mobile&&role!==2);const r=await qa('v212ReunionInspect');console.log('RELATIVE',form,role,r);assert.ok(r.visible&&r.draws>5&&r.rect);assert.ok(r.rect.left>-.95&&r.rect.right<.95&&r.rect.top<.9&&r.rect.bottom>-.9)});
 for(const kind of ['storm','warning','home','craft','bomb'])await check('preview '+kind,async()=>{await qa('v212Scene',kind);await shot(kind,!mobile||kind==='storm'||kind==='craft')});
 await check('runtime errors',async()=>assert.deepEqual(errors,[]));console.log('ENGINE_DONE',mobile?'webkit':'chromium');
 }finally{await browser.close();}
}
assert.deepEqual(failures,[]);console.log('v212 tornado, survival, crafting and presentation PASS');
