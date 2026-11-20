import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=path.resolve(new URL('..',import.meta.url).pathname),temp=await fs.mkdtemp(path.join(os.tmpdir(),'kabanchiki-mutations-'));
const cases=[
 {name:'cleanup-disabled',file:'src/scene-resources.js',from:'resource.dispose();',to:'/* disabled by mutation test */',test:'tests/scene-resources.mjs'},
 {name:'collision-disabled',file:'src/movement-geometry.js',from:'export function polygonContact(polygon,x,z,radius){',to:'export function polygonContact(polygon,x,z,radius){return null;',test:'tests/movement-geometry.mjs'},
 {name:'creature-cap-disabled',file:'src/runtime/creatures.js',from:'CREATURE_LIMIT=16',to:'CREATURE_LIMIT=160',test:'tests/v222-wildlife.mjs'}
];
const report=[];
try{
 await fs.cp(root,temp,{recursive:true,filter:source=>!['.git','node_modules','logs','screenshots'].includes(path.basename(source))});
 for(const c of cases){
  const run=()=>spawnSync(process.execPath,['--test','--test-reporter=tap',c.test],{cwd:temp,encoding:'utf8',timeout:90000,maxBuffer:8*1024*1024});
  const control=run();assert.equal(control.status,0,c.name+' original control failed: '+control.stdout+control.stderr);
  const file=path.join(temp,c.file),original=await fs.readFile(file,'utf8');assert.equal(original.split(c.from).length,2,'mutation target must be unique');
  try{
   await fs.writeFile(file,original.replace(c.from,c.to));const result=run();
   const caught=result.status===1&&/not ok \d+/.test(result.stdout)&&/# fail [1-9]/.test(result.stdout)&&!result.error&&!/SyntaxError/.test(result.stderr);
   report.push({name:c.name,caught,failedTests:result.stdout.match(/not ok .*/g)});
   console.log('MUTATION',JSON.stringify(report.at(-1)));assert.equal(caught,true,c.name+' survived or failed for an unrelated reason');
  }finally{await fs.writeFile(file,original)}
 }
}finally{await fs.mkdir('logs',{recursive:true});await fs.writeFile('logs/mutations.json',JSON.stringify(report,null,2));await fs.rm(temp,{recursive:true,force:true})}
