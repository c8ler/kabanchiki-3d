import {chromium,webkit} from 'playwright';import assert from 'node:assert/strict';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),base='http://127.0.0.1:8082';
async function startServer(){
 const server=http.createServer((request,response)=>{
  const name=decodeURIComponent(new URL(request.url,base).pathname),file=path.resolve(root,'.'+(name.endsWith('/')?name+'index.html':name));
  if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return}
  fs.stat(file,(error,stat)=>{if(error||!stat.isFile()){response.writeHead(404).end();return}
   const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webmanifest':'application/manifest+json','.png':'image/png','.ico':'image/x-icon'}[path.extname(file)]||'application/octet-stream';
   response.writeHead(200,{'Content-Type':mime});fs.createReadStream(file).pipe(response);
  });
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8082,'127.0.0.1',resolve)});return server;
}
async function stopServer(server){if(server?.listening)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections()})}

for(const engine of [chromium,webkit]){
 let server=await startServer();const browser=await engine.launch({headless:true}),context=await browser.newContext({viewport:{width:800,height:600}}),page=await context.newPage(),requests=[],errors=[];
 page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'/');await page.waitForFunction(()=>!document.getElementById('loadingScreen'),null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__KABANCHIKI_VERSION__),'v222');assert.equal(await page.evaluate(()=>typeof window.__KABANCHIKI_QA__),'undefined');
  assert.equal(requests.some(url=>url.includes('/src/qa/')),false,'normal startup loads test scenarios');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready});await page.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:60000});
  const cached=await page.evaluate(async()=>{const cache=await caches.open('kabanchiki-pwa-v222');return (await cache.keys()).map(r=>r.url)});
  assert.ok(cached.filter(url=>url.includes('/src/runtime/')).length>=73);
  assert.equal(cached.some(url=>url.includes('/src/qa/')),false);
  await stopServer(server);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.getElementById('loadingScreen'),null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__KABANCHIKI_VERSION__),'v222');assert.ok(await page.locator('canvas').count());assert.equal(await page.evaluate(()=>typeof window.__KABANCHIKI_QA__),'undefined');
  server=await startServer();await page.goto(base+'/?autotest=1&level=3');await page.waitForFunction(()=>(window.__KABANCHIKI_TEST__?.ready&&window.__KABANCHIKI_TEST__.auditsComplete!==false),null,{timeout:120000});
  assert.ok(await page.evaluate(()=>Object.keys(window.__KABANCHIKI_QA__).length)>100);assert.ok(requests.some(url=>url.includes('/src/qa/')));assert.deepEqual(errors,[]);
  console.log(engine.name(),'normal modules, offline startup and lazy QA PASS');
 }finally{await browser.close();await stopServer(server)}
}
