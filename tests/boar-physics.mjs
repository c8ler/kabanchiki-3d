import test from 'node:test';
import assert from 'node:assert/strict';
import {capsuleAt,capsuleCircleContact,shallowStepAllowed,attacksPlayer,BOAR_MAX_WATER_DEPTH} from '../src/boar-physics.js';
test('boar form prevents hostile attempts until the transformation ends',()=>{assert.equal(attacksPlayer(30),false);assert.equal(attacksPlayer(.001),false);assert.equal(attacksPlayer(0),true)});
test('snout and rear have physical clearance against trunks',()=>{const body=capsuleAt(0,0,0);assert.ok(capsuleCircleContact(body,0,1.8,.6));assert.ok(capsuleCircleContact(body,0,-1.6,.6));assert.equal(capsuleCircleContact(body,0,2.26,.6),null)});
test('narrow sides stay accessible without a large circular wall',()=>{assert.equal(capsuleCircleContact(capsuleAt(0,0,0),1.28,0,.5),null)});
test('rotated bodies and boss scale extend the correct physical shape',()=>{assert.ok(capsuleCircleContact(capsuleAt(0,0,Math.PI/2),1.8,0,.6));assert.ok(capsuleCircleContact(capsuleAt(0,0,0,2.3),0,3.6,.43));assert.equal(capsuleCircleContact(capsuleAt(0,0,0,2.3),0,4.3,.43),null)});
test('contact resolution separates the snout from Timur and the whole body from a trunk',()=>{for(const [x,z,r] of [[0,1.9,.50],[.2,.3,.65]]){const b=capsuleAt(0,0,0),hit=capsuleCircleContact(b,x,z,r);assert.ok(hit);const separated=capsuleAt(hit.nx*(hit.depth+.001),hit.nz*(hit.depth+.001),0);assert.equal(capsuleCircleContact(separated,x,z,r),null)}});
test('only shallow water is walkable; deeper positions permit escape but not further immersion',()=>{assert.equal(BOAR_MAX_WATER_DEPTH,.35);assert.ok(shallowStepAllowed(0,.34));assert.equal(shallowStepAllowed(.34,.36),false);assert.ok(shallowStepAllowed(1,.9));assert.equal(shallowStepAllowed(1,1),false);assert.equal(shallowStepAllowed(1,1.1),false)});
test('two boar shapes detect nose-to-nose, parallel and crossing overlaps',async()=>{
 const {capsuleCapsuleContact}=await import('../src/boar-physics.js');
 assert.ok(capsuleCapsuleContact(capsuleAt(0,0,0),capsuleAt(0,3,Math.PI)));
 assert.equal(capsuleCapsuleContact(capsuleAt(0,0,0),capsuleAt(0,3.4,Math.PI)),null);
 assert.ok(capsuleCapsuleContact(capsuleAt(0,0,0),capsuleAt(0,0,Math.PI/2)));
 assert.equal(capsuleCapsuleContact(capsuleAt(0,0,0),capsuleAt(1.6,0,0)),null);
});
