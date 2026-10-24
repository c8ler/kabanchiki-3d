import test from 'node:test';import assert from 'node:assert/strict';import {parseCheatCode} from '../src/cheat-codes.js';
test('all six levels accept mixed case and whitespace',()=>{for(let n=1;n<=6;n++)assert.deepEqual(parseCheatCode(` LeVeL ${n} `),{type:'level',level:n})});
test('forms and Russian aliases',()=>{for(const [code,form] of [['BOAR','boar'],['кабанчик','boar'],['CAT','cat'],['котик','cat'],['TIMUR','human']])assert.deepEqual(parseCheatCode(code),{type:'form',form})});
test('invalid codes never load missing levels',()=>{for(const code of ['',null,'level0','level8','level10','level1abc','cat<script>'])assert.equal(parseCheatCode(code),null)});
test('flashlight toggle code accepts English and Russian',()=>{for(const code of ['LIGHT','фонарь','flashlight'])assert.deepEqual(parseCheatCode(code),{type:'light'})});
