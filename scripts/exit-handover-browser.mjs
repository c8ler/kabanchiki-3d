import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const engine=process.env.BROWSER||'chromium',browser=await ({chromium,webkit}[engine]).launch({headless:true});
const report=[],errors=[];
try{
 const page=await browser.newPage(engine==='webkit'?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:1280,height:720}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const schedule=window.setTimeout;window.setTimeout=function(fn,...args){if(typeof fn==='function'&&fn.toString().includes('const __v156=runV156Audit()'))return 0;return schedule.call(this,fn,...args)}});
 await page.goto('http://127.0.0.1:8080/?autotest=1&level=1');
 await page.waitForFunction(()=>(window.__KABANCHIKI_TEST__?.ready&&window.__KABANCHIKI_TEST__.auditsComplete!==false),null,{timeout:60000});
 for(const fps of (engine==='chromium'?[30,60]:[30]))for(let level=1;level<=5;level++)for(const mode of ['near','standing','mounted','blocking']){
  const result=await page.evaluate(({level,mode,fps})=>window.__KABANCHIKI_QA__.exitHandoverRobot(level,mode,fps),{level,mode,fps});
  report.push(result);console.log(JSON.stringify(result));
 }
 fs.mkdirSync('logs',{recursive:true});fs.writeFileSync('logs/exit-handover-'+engine+'.json',JSON.stringify({report,errors},null,2));
 assert.deepEqual(errors,[]);
 if(process.env.EXIT_EXPECT_FIXED!=='0')assert.deepEqual(report.filter(r=>r.issues.length),[]);
 console.log('Exit handover robot finished: '+engine);
}finally{await browser.close()}
