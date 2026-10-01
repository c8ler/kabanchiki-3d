import test from 'node:test';
import assert from 'node:assert/strict';
import { Knockback } from '../src/knockback.js';

test('counterattack travels four metres away at different frame rates', () => {
  for (const fps of [30, 60, 120]) {
    const recoil = new Knockback(3, 4);
    let x = 0, z = 0, previousStep = Infinity;
    while (recoil.active) {
      const step = recoil.step(1 / fps), length = Math.hypot(step.dx, step.dz);
      assert.ok(length <= previousStep + 1e-9);
      previousStep = length;
      x += step.dx; z += step.dz;
    }
    assert.ok(Math.abs(x - 2.4) < 1e-9);
    assert.ok(Math.abs(z - 3.2) < 1e-9);
    assert.deepEqual(recoil.step(1), { dx: 0, dz: 0, progress: 1 });
  }
});

test('pausing preserves recoil and overlapping positions have a finite direction', () => {
  const recoil = new Knockback(0, 0);
  assert.deepEqual(recoil.step(0), { dx: 0, dz: 0, progress: 0 });
  assert.ok(recoil.active);
  const step = recoil.step(10);
  assert.equal(step.dx, 0); assert.equal(step.dz, 4);
  assert.equal(recoil.active, false);
});
