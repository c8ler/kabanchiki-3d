import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.BASE_URL||'http://127.0.0.1:8080';
const engine=process.env.BROWSER||'chromium',seed=Number(process.env.ROBOT_SEED||208);
fs.mkdirSync('logs',{recursive:true});fs.mkdirSync('screenshots',{recursive:true});
const browser=await ({chromium,webkit}[engine]).launch({headless:true});
const report=[],errors=[];let page;
try{
 page=await browser.newPage(engine==='webkit'?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:1280,height:720}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?autotest=1&level=1');
 await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:60000});
 const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
 const record=async(label,result)=>{
  report.push({label,...result});console.log(label,JSON.stringify(result));
  fs.writeFileSync('logs/boar-robot-'+engine+'.json',JSON.stringify({seed,engine,errors,report},null,2));
  if(result.issues.length){await page.screenshot({path:'screenshots/boar-robot-'+engine+'-failure.png'});assert.deepEqual(result.issues,[],label);}
 };
 for(const season of (engine==='webkit'?[0]:[0,20,40,60]))for(let level=1;level<=6;level++){
  await record('route-'+level+'-season-'+season,await qa('boarRobot',level,season,30,seed+level+season));
 }
 if(engine==='chromium')for(let level=1;level<=6;level++)await record('route-'+level+'-60fps',await qa('boarRobot',level,0,60,seed+level));
 for(let level=1;level<=5;level++)for(const withFriend of [false,true]){
  await record('exit-'+level+'-friend-'+withFriend,await qa('boarExitRobot',level,withFriend,30));
 }
 assert.deepEqual(errors,[]);
 console.log('Boar navigation, support and closed-exit robot PASS');
}finally{
 fs.writeFileSync('logs/boar-robot-'+engine+'.json',JSON.stringify({seed,engine,errors,report},null,2));
 await browser.close();
}
