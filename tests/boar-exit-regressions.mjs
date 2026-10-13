import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
function extract(name){const start=game.indexOf('function '+name+'(');assert.ok(start>=0);let p=game.indexOf('{',start),depth=1,end=p+1;for(;depth&&end<game.length;end++){if(game[end]==='{')depth++;if(game[end]==='}')depth--;}return game.slice(start,end)}
test('ordinary boars can enter shallow river water',()=>{const run=new Function('level','controlledSwimmer','boarWaterStep','boarWaterDepth',extract('boarLakeStepAllowed')+';return boarLakeStepAllowed({},0,0)');assert.equal(run(4,()=>false,()=>true,()=>.2),true)});
test('fleeing boars cross closed location exits without being clamped back',()=>{const run=new Function(extract('resolveBoarClearance')+';const f={flee:true,g:{position:{x:0,z:-40}}};resolveBoarClearance(f);return f.g.position.z');assert.equal(run(),-40)});
test('exit remains closed while the helper approaches and opens only after impact',()=>{const props={userData:{breaker:{g:{position:{x:8,z:-30}},b:{position:{y:0},rotation:{x:0}}},breakerHit:false,breakerTime:0}};
const run=new Function('friend','moveFriendAroundObstacles','moveBoarToward','companionNavBlocked','findGridPath','levelTime','bossBattleImpact','effect','notice','animateBreakableExit','scene',extract('updateExitBreaker')+';return updateExitBreaker');
const f=props.userData.breaker;let hits=0;const update=run(f,()=>{},()=>{},()=>()=>false,()=>[],1,()=>hits++,()=>{},()=>{},()=>{},{remove(){}});
assert.equal(update(props,.1,-39),false);assert.equal(hits,0);
f.g.position={x:0,z:-36.3};assert.equal(update(props,.1,-39),false);assert.equal(hits,1);
assert.equal(update(props,1,-39),true);assert.equal(hits,1);assert.equal(f.exitBreaking,false)});
