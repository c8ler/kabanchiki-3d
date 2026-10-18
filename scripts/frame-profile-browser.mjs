import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
const reports=[];
try{
 for(const [label,port] of [['baseline',8080],['candidate',8081]]){
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{let seed=208;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}});
 await page.goto('http://127.0.0.1:'+port+'/?autotest=1&level=1');
 await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:60000});
 for(const level of [1,2,3,4,5,6]){
 await page.evaluate(n=>{const q=window.__KABANCHIKI_QA__;if(n===6)q.performanceScenario();else q.load(n)},level);
 await page.waitForTimeout(2500);
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
 const frames=await page.evaluate(()=>new Promise(resolve=>{
 const out=[];let last=performance.now(),start=last;
 function tick(now){out.push(now-last);last=now;if(now-start>=6000)resolve(out);else requestAnimationFrame(tick)}requestAnimationFrame(tick);
 }));
 const {profile}=await cdp.send('Profiler.stop');await cdp.detach();
 const nodes=new Map(profile.nodes.map(n=>[n.id,n])),times=new Map();
 for(let i=0;i<(profile.samples||[]).length;i++){const n=nodes.get(profile.samples[i]);const name=n?.callFrame.functionName||'(anonymous)';times.set(name,(times.get(name)||0)+(profile.timeDeltas[i]||0))}
 frames.sort((a,b)=>a-b);const pct=p=>frames[Math.min(frames.length-1,Math.floor(frames.length*p))];
 const row={label,level,frames:frames.length,p50:pct(.5),p95:pct(.95),p99:pct(.99),max:frames.at(-1),over50:frames.filter(x=>x>50).length,over100:frames.filter(x=>x>100).length,
 inspect:await page.evaluate(()=>window.__KABANCHIKI_QA__.performanceInspect()),hotspots:[...times].sort((a,b)=>b[1]-a[1]).slice(0,18),errors};
 reports.push(row);console.log(JSON.stringify(row));
 }
 await page.close();
 }
}finally{fs.mkdirSync('logs',{recursive:true});fs.writeFileSync('logs/frame-profile.json',JSON.stringify(reports,null,2));await browser.close()}
