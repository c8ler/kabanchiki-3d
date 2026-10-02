import test from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_HITS, riverCenterAt, riverDepthAt, WorldSurface } from '../src/world-surface.js';

test('boss difficulty ranges from five to twenty hits', () => {
  assert.equal(BOSS_HITS.length, 5);
  assert.equal(BOSS_HITS[0], 5); assert.equal(BOSS_HITS.at(-1), 20);
  for (let i = 1; i < 5; i++) assert.ok(BOSS_HITS[i] > BOSS_HITS[i - 1]);
});
test('river has dry bridge, shallow ford, deep centre and dry banks', () => {
  assert.equal(riverDepthAt(0, riverCenterAt(0)), 0);
  assert.equal(riverDepthAt(28, riverCenterAt(28)), .2);
  assert.equal(riverDepthAt(15, riverCenterAt(15)), 1.8);
  assert.equal(riverDepthAt(15, riverCenterAt(15) + 5), 0);
});
test('every level has gentle terrain, flat roads and flat prop foundations', () => {
  for (let level = 1; level <= 6; level++) {
    const surface = new WorldSurface(level, [{ x: 20, z: 20, r: 3 }]);
    assert.equal(surface.height(0, 15), 0);
    assert.equal(surface.height(20, 20), 0);
    let min = Infinity, max = -Infinity;
    for (let x = -40; x <= 40; x += 2) for (let z = -40; z <= 40; z += 2) {
      const h = surface.height(x, z); min = Math.min(min, h); max = Math.max(max, h);
      assert.ok(Math.abs(h) < .6);
      assert.ok(Math.abs(surface.height(x + .05, z) - h) < .03);
    }
    assert.ok(max - min > .25);
  }
});
test('basins are lower than their rims and water locations remain flat', () => {
  const s = new WorldSurface(1, [], [{ x: 22, z: 10, r: 4 }]);
  assert.ok(s.height(22, 10) < s.height(26, 10) - .3);
  assert.equal(new WorldSurface(2).height(-18, -17), 0);
  assert.equal(new WorldSurface(4).height(15, riverCenterAt(15)), 0);
});
