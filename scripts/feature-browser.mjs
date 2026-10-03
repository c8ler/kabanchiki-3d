import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.BASE_URL||'http://127.0.0.1:8080';
fs.mkdirSync('screenshots',{recursive:true});

async function checkStartup(browser){const page=await browser.newPage(),errors=[];page.on("pageerror",e=>errors.push(e.message));await page.goto(base+"/");await page.waitForFunction(()=>!document.querySelector("#loadingScreen"),null,{timeout:60000});await page.click("#start");await page.waitForSelector("#difficultyScreen",{state:"visible"});await page.click("#difficultyStart");await page.waitForTimeout(1500);assert.deepEqual(errors,[]);await page.close();console.log("Normal startup and intro PASS")}
const browser=await chromium.launch({headless:true});
try{
 await checkStartup(browser);
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/?autotest=1&level=1');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready);await page.waitForTimeout(1200);
 const qa=async(method,...args)=>{console.log('Check: '+method+' '+JSON.stringify(args));return await page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args})};
 const walls=await qa('v161Walls');assert.ok(walls.blocked&&walls.open&&walls.noseClear);
 const recovery=await qa('v161Recover');assert.ok(recovery.foot&&recovery.ride);
 const routes=[];for(const n of [1,3,5]){const route=await qa('v161Navigate',n);assert.ok(route.remaining<3.3&&route.penetrations===0,JSON.stringify(route));routes.push(route)}
 const exit=await qa('v161Exit');assert.ok(exit.distance<3.3&&exit.walls===0,JSON.stringify(exit));
 const bridge=await qa('v161Bridge');assert.ok(bridge.foot<2.2&&bridge.ride<1.8);
 const splash=await qa('v161Water');assert.ok(splash.spray>0&&splash.rings>0);
 const drowning=await qa('v161Drown');assert.ok(drowning.dead&&drowning.after<drowning.before);await qa('restart');
 for(const failed of [0,20,40]){const deadline=await qa('v161BossSeason',failed);assert.equal(deadline.carry,0);assert.equal(deadline.ice,false);const state=await qa('v161Inspect');assert.equal(state.birds.visible,failed<40);if(failed<40)assert.ok(state.birds.count>0)}
 const frozen=await qa('v161Freeze',4);assert.ok(frozen.ice&&frozen.tree&&frozen.life===0);await qa('restart');
 const snowfall=[];for(let minute=0;minute<5;minute++){const s=await qa('v161Snow',minute);assert.ok(s.iceWater&&s.roadSnow);if(minute)assert.ok(s.driftHeight>snowfall.at(-1).driftHeight&&s.snowStrength>snowfall.at(-1).snowStrength);snowfall.push(s)}
 await qa('season',0);await qa('load',4);await qa('lamp');for(let role=0;role<4;role++){await qa('movie','family',6,role);await page.waitForTimeout(100);const s=await qa('v161Inspect');assert.ok(s.movie.light>0&&s.movie.hug<-.7);await qa('movieDone')}
 await qa('load',6);await qa('movie','outro',1);await page.waitForTimeout(100);const finale=await qa('v161Inspect');assert.ok(finale.movie.boss&&finale.movie.headlights===2);await qa('movieDone');
 const firstFire=await qa('v161Fire',0),laterFire=await qa('v161Fire',12);assert.equal(firstFire.emissive,0);assert.ok(laterFire.emissive>0&&laterFire.time===24);
 const fishing=await qa('v161Fish');assert.ok(fishing.fishing);await qa('load',2);await qa('rain',0);for(let stage=1;stage<=4;stage++)await qa('puddles',stage,100);const puddle=await qa('v161Inspect');assert.ok(puddle.depth>1.3);
 assert.deepEqual(errors,[]);assert.deepEqual(await page.evaluate(()=>window.__KABANCHIKI_TEST__.errors),[]);console.log(JSON.stringify({walls,recovery,routes,bridge,drowning,puddleDepth:puddle.depth,snowDrifts:snowfall.map(s=>s.drifts)}));
}finally{await browser.close()}
const safari=await webkit.launch({headless:true});
try{
 await checkStartup(safari);
 const context=await safari.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/?autotest=1&level=1');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,{timeout:60000});
 const before=await page.evaluate(()=>window.__KABANCHIKI_QA__.position());const stick=page.locator('#stick'),box=await stick.boundingBox();await stick.dispatchEvent('pointerdown',{pointerId:9,pointerType:'touch',clientX:box.x+box.width/2,clientY:box.y+box.height/2-45,bubbles:true,cancelable:true});await page.waitForTimeout(1000);await stick.dispatchEvent('pointerup',{pointerId:9,pointerType:'touch',bubbles:true,cancelable:true});
 const foodBefore=await page.evaluate(()=>window.__KABANCHIKI_QA__.v161Inspect().food);await page.locator('#interact').tap();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>window.__KABANCHIKI_QA__.v161Inspect().food),foodBefore-1);await page.locator('#jump').tap();await page.waitForTimeout(100);assert.ok((await page.evaluate(()=>window.__KABANCHIKI_QA__.position().y))>.1);
 const state=await page.evaluate(()=>({position:window.__KABANCHIKI_QA__.position(),select:getComputedStyle(document.body).webkitUserSelect,touch:getComputedStyle(document.querySelector('canvas')).touchAction,scroll:[scrollX,scrollY],selection:String(getSelection()),selectCanceled:!document.querySelector('#hud').dispatchEvent(new Event('selectstart',{bubbles:true,cancelable:true})),gestureCanceled:!document.querySelector('canvas').dispatchEvent(new Event('gesturestart',{bubbles:true,cancelable:true})),input:getComputedStyle(document.querySelector('#playerName')).webkitUserSelect}));assert.ok(Math.abs(state.position.z-before.z)>1);assert.equal(state.select,'none');assert.equal(state.touch,'none');assert.equal(state.input,'text');assert.deepEqual(state.scroll,[0,0]);assert.equal(state.selection,'');assert.ok(state.selectCanceled&&state.gestureCanceled);assert.deepEqual(errors,[]);await page.screenshot({path:'screenshots/v161-webkit-mobile.png'});console.log(JSON.stringify({webkit:state}));
}finally{await safari.close()}
