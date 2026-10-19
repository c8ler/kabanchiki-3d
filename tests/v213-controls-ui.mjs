import {test} from 'node:test';import assert from 'node:assert/strict';
import {DismountLatch} from '../src/mount-transition.js';import {stormClock} from '../src/tornado-rules.js';import {installMenuViewport} from '../src/menu-viewport.js';
test('dismount survives landing beside friend and allows deliberate remount',()=>{
 const l=new DismountLatch();assert.equal(l.allow(0,1),true);l.leave(1000);
 for(const now of [1000,1300,1650,3000,30000])assert.equal(l.allow(now,2.5),false);
 assert.equal(l.allow(1200,2,true,true),false);assert.equal(l.allow(31000,2,true,false),false);assert.equal(l.allow(31000,2,true,true),true);
 l.leave(32000);l.observe(33000,3.2);assert.equal(l.allow(33001,2),true);l.leave(34000);l.reset();assert.equal(l.allow(34001,2),true);
});
test('countdown only appears in requested warning windows without disabling tornado',()=>{
 for(const t of [0,54.999,60,114.999,120,174.999,180,234.999,240,284.999,300,301,1000])assert.equal(stormClock(t).shown,false,'hidden at '+t);
 for(const t of [55,59.999,115,119.999,175,179.999,235,239.999,285,299.999])assert.equal(stormClock(t).shown,true,'shown at '+t);
 for(let t=0;t<600;t++){assert.equal(stormClock(t,6).shown,false);assert.equal(stormClock(t).active,t>=300);assert.equal(stormClock(t).visible,true)}
});
test('menus follow visible viewport resize, keyboard and panning',()=>{
 const handlers={},props={},frames=[],visualViewport={width:390,height:844,offsetTop:0,offsetLeft:0,addEventListener:(k,f)=>handlers['v'+k]=f},win={visualViewport,innerWidth:390,innerHeight:844,addEventListener:(k,f)=>handlers[k]=f,requestAnimationFrame:f=>frames.push(f)},doc={documentElement:{style:{setProperty:(k,v)=>props[k]=v}}};
 installMenuViewport(win,doc);assert.equal(props['--menu-vh'],'844px');visualViewport.height=300;visualViewport.offsetTop=40;handlers.vresize();handlers.vscroll();assert.equal(frames.length,1);frames.shift()();assert.equal(props['--menu-vh'],'300px');assert.equal(props['--menu-top'],'40px');visualViewport.width=568;handlers.resize();frames.shift()();assert.equal(props['--menu-vw'],'568px');
});
import {parseCheatCode} from '../src/cheat-codes.js';
test('bomb cheat supports English and Russian names',()=>{for(const code of ['BOMB',' bomb ','БОМБА','бомбочка'])assert.deepEqual(parseCheatCode(code),{type:'bomb'})});
