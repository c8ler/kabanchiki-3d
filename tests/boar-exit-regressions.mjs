import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
function extract(name){const start=game.indexOf('function '+name+'(');assert.ok(start>=0);let p=game.indexOf('{',start),depth=1,end=p+1;for(;depth&&end<game.length;end++){if(game[end]==='{')depth++;if(game[end]==='}')depth--;}return game.slice(start,end)}
test('ordinary boars can enter shallow river water',()=>{const run=new Function('level','controlledSwimmer','boarWaterStep','boarWaterDepth',extract('boarLakeStepAllowed')+';return boarLakeStepAllowed({},0,0)');assert.equal(run(4,()=>false,()=>true,()=>.2),true)});
test('fleeing boars cross closed location exits without being clamped back',()=>{const run=new Function(extract('resolveBoarClearance')+';const f={flee:true,g:{position:{x:0,z:-40}}};resolveBoarClearance(f);return f.g.position.z');assert.equal(run(),-40)});
test('exit remains closed while the helper approaches and opens only after impact',()=>{const props={userData:{breaker:{g:{position:{x:8,z:-30}},b:{position:{y:0},rotation:{x:0}}},breakerHit:false,breakerTime:0}};
const run=new Function('friend','moveFriendAroundObstacles','moveBoarToward','companionNavBlocked','findGridPath','levelTime','bossBattleImpact','effect','notice','animateBreakableExit','scene','const level=3;'+extract('updateExitBreaker')+';return updateExitBreaker');
const f=props.userData.breaker;let hits=0;const update=run(f,()=>{},()=>{},()=>()=>false,()=>[],1,()=>hits++,()=>{},()=>{},()=>{},{remove(){}});
assert.equal(update(props,.1,-39),false);assert.equal(hits,0);
f.g.position={x:0,z:-36.3};assert.equal(update(props,.1,-39),false);assert.equal(hits,1);
assert.equal(update(props,1,-39),true);assert.equal(hits,1);assert.equal(f.exitBreaking,false)});

test('the exit task exclusively owns movement and cancels player yielding',()=>{
 let steps=0,resets=0;const friend={g:{},exitBreaking:true};
 const make=new Function('friend','friendYield',`let friendYieldActive=true,friendYieldOwner=null,friendKnockbackActive=false,mountedFriend=false,py=0;${extract('updateFriendYield')};return {run:updateFriendYield,active:()=>friendYieldActive}`);
 const ctl=make(friend,{reset(){resets++},step(){steps++;throw Error('yield controller must not move an exit breaker')}});
 ctl.run(0,-1,.05);assert.equal(steps,0);assert.equal(resets,1);assert.equal(ctl.active(),false);
});
test('starting the exit task discards following routes and pending yield targets',()=>{
 const f={g:{position:{x:8,z:-27}},b:{position:{y:0},rotation:{x:0}},route:{old:true},tightEscape:{x:1,z:2},escapeRetry:.75,navigation:{}};
 const props={userData:{breaker:null,breakerTime:0}},reset={count:0};let sawFresh=false;
 const make=new Function('friend','boy','friendYield','moveBoarToward','notice',`let mountedFriend=false,friendYieldActive=true;const level=3;${extract('updateExitBreaker')};return {run:updateExitBreaker,active:()=>friendYieldActive}`);
 const ctl=make(f,{position:{x:0,z:-34}},{reset(){reset.count++}},actor=>{sawFresh=actor.route===null&&actor.tightEscape===null&&actor.escapeRetry===0&&actor.navigation===null},()=>{});
 assert.equal(ctl.run(props,.05,-39),false);assert.equal(sawFresh,true);assert.equal(reset.count,1);assert.equal(ctl.active(),false);assert.equal(f.exitBreaking,true);
});
test('finishing the exit task releases the old route before ordinary following resumes',()=>{
 const f={g:{position:{x:2.5,z:-35.4}},b:{position:{y:0},rotation:{x:0}},route:{old:true},tightEscape:{},escapeRetry:.7,exitBreaking:true};
 const props={userData:{breaker:f,breakerHit:true,breakerTime:.8}};
 const update=new Function('friend','animateBreakableExit',`const level=3;${extract('updateExitBreaker')};return updateExitBreaker`)(f,()=>{});
 assert.equal(update(props,.1,-39),true);assert.equal(f.exitBreaking,false);assert.equal(f.route,null);assert.equal(f.tightEscape,null);assert.equal(f.escapeRetry,0);
});
