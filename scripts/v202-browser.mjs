import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{await page.goto('http://127.0.0.1:8080/?autotest=1&level=1');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:60000});
const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
let s=await qa('v207Inspect');assert.equal(s.version,'v211');assert.equal(s.guideButtons,0);
for(const n of [1,2,3,4,5,6]){await qa('load',n);s=await qa('v207Inspect');assert.equal(s.sprites,0);assert.ok(s.fixed>=1);}
for(const n of [1,4]){s=await qa('v207Retry',n);assert.equal(s.level,n);assert.equal(s.score,0);assert.equal(s.totalTime,123.5);assert.equal(s.familyFound,n===1?0:1);}
await qa('lakeExitScenario');s=await qa('v207Inspect');assert.deepEqual(s.fence,{left:-48,right:48,opening:11});
const exit=await qa('lakeExitInspect');assert.ok(exit.blocked.every(Boolean));
assert.deepEqual(errors,[]);console.log('v207 signs, guide, retry and fence browser checks PASS');}finally{await browser.close();}
