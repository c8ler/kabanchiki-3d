import test from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_HITS, riverCenterAt, riverDepthAt, WorldSurface, lakePointAt, lakeRadiusAt, lakeDepth, bridgeRailBlocked, weatherDeadline, rainFillLimit, rainFillRate, lakeInletCenterAt, lakeInletDepthAt } from '../src/world-surface.js';

test('boss difficulty ranges from five to twenty hits', () => {
  assert.equal(BOSS_HITS.length, 5);
  assert.equal(BOSS_HITS[0], 5); assert.equal(BOSS_HITS.at(-1), 20);
  for (let i = 1; i < 5; i++) assert.ok(BOSS_HITS[i] > BOSS_HITS[i - 1]);
});
test('river has dry bridge, shallow ford, deep centre and dry banks', () => {
  assert.equal(riverDepthAt(0, riverCenterAt(0)), 0);
  assert.equal(riverDepthAt(28, riverCenterAt(28)), .2);
  assert.equal(riverDepthAt(15, riverCenterAt(15)), 3);
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

test('elongated irregular lake shares its visible bank and depth',()=>{let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;for(let i=0;i<180;i++){const a=i/180*Math.PI*2,p=lakePointAt(a);assert.ok(Math.abs(lakeRadiusAt(p.x,p.z)-13.6)<1e-10);assert.ok(lakeDepth(p.x,p.z)<1e-10);const inside=lakePointAt(a,8),outside=lakePointAt(a,15);assert.ok(lakeDepth(inside.x,inside.z)>.5);assert.equal(lakeDepth(outside.x,outside.z),0);minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z)}assert.ok(maxZ-minZ>(maxX-minX)*1.4);assert.equal(lakeDepth(-18,-17),5.2)});

test('bridge rails block both sides but leave entrances and centre open',()=>{assert.ok(bridgeRailBlocked(2.5,-14));assert.ok(bridgeRailBlocked(-2.5,-14));assert.equal(bridgeRailBlocked(0,-14),false);assert.equal(bridgeRailBlocked(2.5,-7),false)});
test('five minute deadline never ends a boss fight in any season',()=>{for(const season of ['summer','autumn','winter'])assert.equal(weatherDeadline(season,6,900),null);assert.equal(weatherDeadline('winter',4,301),'freeze');assert.equal(weatherDeadline('summer',4,301),'carry');assert.equal(weatherDeadline('autumn',4,299),null)});
test('rain increases basin capacity and fill speed at every stage',()=>{for(let i=1;i<=4;i++){assert.ok(rainFillLimit(i)>rainFillLimit(i-1));assert.ok(rainFillRate(i)>rainFillRate(i-1))}});
test('lake inlet connects to the lake and river ends within world bounds',()=>{assert.ok(lakeInletDepthAt(-35,lakeInletCenterAt(-35))>.5);assert.ok(lakeDepth(-22,lakeInletCenterAt(-22))>.3);assert.equal(lakeInletDepthAt(-47,-27),0);assert.equal(riverDepthAt(47,riverCenterAt(47)),0)});
