import test from 'node:test';
import assert from 'node:assert/strict';
import {isCatBerryRoll,CAT_FORM_SECONDS,CAT_JUMP_SPEED,formTimeAfterStep} from '../src/form-rules.js';
test('exactly one twentieth of the berry rolls become cat berries',()=>{assert.equal(Array.from({length:2000},(_,i)=>isCatBerryRoll(i/2000)).filter(Boolean).length,100);assert.ok(isCatBerryRoll(.04999));assert.equal(isCatBerryRoll(.05),false)});
test('cat form expires after thirty active seconds and high jump clears village roofs',()=>{let time=CAT_FORM_SECONDS;for(let i=0;i<1800;i++)time=formTimeAfterStep(time,1/60);assert.ok(time<1e-9);assert.equal(formTimeAfterStep(1,2),0);assert.equal(formTimeAfterStep(20,0),20);assert.ok(CAT_JUMP_SPEED**2/(2*18)>4.91)});
