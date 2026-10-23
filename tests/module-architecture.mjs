import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createRuntime,initializeModules} from '../src/runtime/context.js';
import {GAME_MODULES,GAME_SOURCES} from '../src/runtime/module-manifest.js';
import {readGameSource} from '../scripts/game-source.mjs';

test('entry point and feature modules stay small',()=>{
 const size=path=>fs.statSync(new URL('../'+path,import.meta.url)).size;
 assert.ok(size('src/game.js')<12000);
 assert.ok(GAME_MODULES.length>20);
 for(const path of GAME_SOURCES)assert.ok(size(path)<48000,path+' exceeds 48 KB');
});
test('every binding has one declared owner and dependencies resolve',()=>{
 const owners=new Map();
 for(const m of GAME_MODULES)for(const name of m.owns){assert.equal(owners.has(name),false,name+' owned twice');owners.set(name,m.name)}
 for(const m of GAME_MODULES)for(const name of m.dependencies)assert.ok(owners.has(name),m.name+' needs '+name);
});
test('factories are safe before browser initialization and match their ownership contract',async()=>{
 for(const m of GAME_MODULES){
  const {createModule}=await import('../'+m.path);
  const module=createModule(createRuntime());
  assert.deepEqual(Object.keys(module.bindings),m.owns,m.name);
  assert.equal(typeof module.initialize,'function');
 }
});
test('registration precedes ordered initialization and mutable fields stay live',async()=>{
 const runtime=createRuntime(),events=[];let life;
 const first={bindings:{life:{get:()=>life,set:v=>{life=v}},read:{get:()=>()=>runtime.life}},initialize(){events.push('state');life=4}},
 second={bindings:{constant:{get:()=>42}},async initialize(){events.push('consumer');assert.equal(runtime.read(),4);await Promise.resolve();runtime.life=7}};
 await initializeModules(runtime,[first,second]);assert.deepEqual(events,['state','consumer']);assert.equal(runtime.read(),7);
 assert.throws(()=>{runtime.constant=1},TypeError);assert.throws(()=>{runtime.typo=1},TypeError);
});
test('duplicate state owners fail before initialization',async()=>{
 let initialized=false;const make=()=>({bindings:{same:{get:()=>1}},initialize(){initialized=true}});
 await assert.rejects(initializeModules(createRuntime(),[make(),make()]),/Duplicate game binding/);assert.equal(initialized,false);
});
test('all local imports resolve and every extracted module has valid syntax',()=>{
 const paths=['src/game.js','src/runtime/context.js',...GAME_SOURCES];
 for(const path of paths){
  const url=new URL('../'+path,import.meta.url),code=fs.readFileSync(url,'utf8');
  for(const m of code.matchAll(/(?:from\s*|import\s*\()(['"])(\.[^'"]+)\1/g)){const target=new URL(m[2],url);assert.ok(fs.existsSync(target),path+' imports missing '+m[2])}
  const result=spawnSync(process.execPath,['--check',url.pathname],{encoding:'utf8'});assert.equal(result.status,0,path+' '+result.stderr);
  assert.doesNotMatch(code,/\beval\s*\(|new Function\s*\(/,path+' executes assembled source');
 }
});
test('normal startup loads QA only through the explicit test gate',()=>{
 const entry=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8'),gate=fs.readFileSync(new URL('../src/runtime/qa-install.js',import.meta.url),'utf8');
 assert.doesNotMatch(entry,/from ['"][^'"]*qa\//);
 assert.match(gate,/__autoTest/);assert.match(gate,/openingtest/);assert.match(gate,/return import\(['"]\.\.\/qa\/index/);
});
test('legacy source contracts read actual modules, not an archived monolith',()=>{
 const source=readGameSource();assert.match(source,/function loadLevel\(/);assert.match(source,/function updateSimulation\(/);assert.match(source,/function movePlayerCollision\(/);assert.doesNotMatch(source,/runtime\.boy/);
});
