import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{await page.goto('http://127.0.0.1:8080/?autotest=1&level=3');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:60000});
const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
const m=await qa('v206Mechanics');assert.equal(m.piles,4);assert.equal(m.door.width,1.6);assert.equal(m.door.height,1.9);assert.equal(m.familyDoor.width,1.6);assert.equal(m.familyDoor.height,1.9);assert.equal(m.lake,2.4);assert.equal(m.river,1.35);
const house=await qa('v206BuildDoor');console.log('Built door',house);assert.equal(house.stage,4);assert.equal(house.wood,0);assert.ok(house.doorVisible&&house.inside);
for(const n of [2,4]){const water=await qa('v206Water',n);console.log('Water',n,water);assert.ok(water.alive);assert.ok(water.depth<=.65);assert.ok(water.air<8);}
for(const n of [1,3,5]){const route=await qa('v161Navigate',n);console.log('Navigation',n,route);assert.ok(route.remaining<3.3,JSON.stringify(route));assert.equal(route.penetrations,0);}
for(const n of [1,2,3,4,5,6]){const r=await qa('v206Road',n);console.log('Smooth road route',r);assert.ok(r.remaining<3.3,JSON.stringify(r));assert.ok(r.maxTurn<=.16001);assert.ok(r.maxStep<=.20001);assert.equal(r.reversals,0);}
assert.deepEqual(errors,[]);console.log('v206 water, doors and actual-world routes PASS');
}finally{await browser.close();}
