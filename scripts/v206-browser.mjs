import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{await page.goto('http://127.0.0.1:8080/?autotest=1&level=1');await page.waitForFunction(()=>window.__KABANCHIKI_TEST__?.ready,null,{timeout:60000});const qa=(method,...args)=>page.evaluate(({method,args})=>window.__KABANCHIKI_QA__[method](...args),{method,args});
for(let n=1;n<=6;n++){const signs=await qa('v206Signs',n);console.log('Signs',JSON.stringify(signs));assert.equal(signs.count,[4,1,3,2,1,0][n-1]);assert.ok(signs.results.every(s=>s.fell&&s.angle>1.4));assert.ok(signs.reset);}
const logs=await qa('v206Logs');console.log('Logs',logs);assert.ok(logs.lowLogRaised&&logs.centreFree);assert.equal(logs.samples.length,2);assert.ok(logs.samples.every(s=>s.blocked&&s.pushed));
const edge=await qa('v206Boundary');console.log('Curved edge',edge);assert.ok(edge.samples.every(s=>s.inside&&s.outside&&s.model));assert.ok(edge.oldStraightEdgeOpen&&edge.centralOpen&&edge.wingsClosed);
for(let n=1;n<=6;n++){for(const large of [false,true]){const hop=await qa('v206Hop',n,large);console.log('Ride hop',hop);assert.equal(hop.unsafe,0);assert.equal(hop.crossed,!large);if(!large)assert.ok(hop.peak>.5);}}
for(let n=1;n<=6;n++)for(const portrait of [false,true]){const movie=await qa('v206Cinematics',n,portrait);console.log('Cinematic coverage',JSON.stringify(movie));assert.equal(movie.results.length,10);assert.ok(movie.results.every(s=>s.samples>0&&s.hidden===s.samples&&s.restored));}
assert.deepEqual(errors,[]);console.log('v206 all signs, scenes, small rock hops, log halves and curved edge PASS');}finally{await browser.close();}
