import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:60000});
const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
const walls=await qa('v205HouseWalls');console.log('Wall sweeps',JSON.stringify(walls));assert.ok(walls.samples.length===32);assert.ok(walls.samples.every(s=>s.blocked&&!s.crossed));assert.equal(walls.aboveRoofBlocked,false);
const home=await qa('v205HomeInterior');console.log('Interior',home);assert.ok(home.furnishings.every(s=>s.opacity===1&&!s.roofVisible&&s.hidden===1));assert.ok(home.roofRestored&&home.wallsRestored);
const doors=await qa('v165Doors');console.log('Door passage',doors);assert.ok(doors.results.every(s=>s.entered&&s.exited));assert.deepEqual(errors,[]);console.log('v205 swept walls, door passage and opaque furniture PASS');}finally{await browser.close();}
