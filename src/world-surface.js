export const BOSS_HITS = [5, 8, 12, 16, 20];
export const riverCenterAt = x => -14 + Math.sin(x * .105) * 2.3;
export const onRiverBridge = (x, z) => Math.abs(x) < 2.8 && Math.abs(z - riverCenterAt(x)) < 5.3;
export function riverDepthAt(x, z) {
  if (Math.abs(x)>46||onRiverBridge(x, z)) return 0;
  const distance = Math.abs(z - riverCenterAt(x));
  if (distance >= 4.2) return 0;
  const depth = 3.0 * (1 - distance / 4.2) ** 2;
  return Math.abs(x - 28) < 3 ? Math.min(.2, depth) : depth;
}
const smooth = n => { n = Math.max(0, Math.min(1, n)); return n * n * (3 - 2 * n); };
export class WorldSurface {
  constructor(level, zones = [], basins = []) { this.level = level; this.zones = zones; this.basins = basins; }
  height(x, z) {
    if (Math.abs(x) < 3.5 || Math.abs(x) > 46 || Math.abs(z) > 46) return 0;
    
    
    let weight = smooth((Math.abs(x) - 3.5) / 2);
    if (this.level === 2) weight = Math.min(weight, smooth((lakeRadiusAt(x,z) - 17) / 2));
    if (this.level === 4) weight = Math.min(weight, smooth((Math.abs(z - riverCenterAt(x)) - 6.4) / 2));
    for (const q of this.zones) {
      weight = Math.min(weight, smooth((Math.hypot(x - q.x, z - q.z) - q.r) / 2));
      if (weight === 0) return 0;
    }
    let height = .2 + .16 * Math.sin(x * .16 + this.level) * Math.cos(z * .13) + .1 * Math.sin((x + z) * .1);
    for (const b of this.basins) {
      const d = Math.hypot(x - b.x, z - b.z) / b.r;
      if (d < 1) height -= .52 * (1 - d * d) ** 2;
    }
    return height * weight;
  }
}
// One shoreline definition for geometry, depth, vegetation and spawning.
export const LAKE_CENTER={x:-18,z:-17};
const shoreScale=a=>1+.08*Math.sin(a*3)+.045*Math.cos(a*5);
export function lakePointAt(angle,radius=13.6){const k=radius/13.6*shoreScale(angle);return {x:-18+Math.cos(angle)*12.2*k,z:-17+Math.sin(angle)*20.2*k}}
export function lakeRadiusAt(x,z){const dx=(x+18)/12.2,dz=(z+17)/20.2;return Math.hypot(dx,dz)/shoreScale(Math.atan2(dz,dx))*13.6}
export function lakeDepth(x,z){const k=Math.max(0,1-lakeRadiusAt(x,z)/13.6);return Math.min(5.2,k*k*6.4)}

export const lakeInletCenterAt=x=>-27+Math.sin((x+46)*.15)*2;
export function lakeInletDepthAt(x,z){if(x<-46||x>-22)return 0;const k=Math.max(0,1-Math.abs(z-lakeInletCenterAt(x))/1.65);return .85*k*k}
export function bridgeRailBlocked(x,z,radius=.31){return Math.abs(z+14)<5.3+radius&&[-2.55,2.55].some(rail=>Math.abs(x-rail)<radius+.10)}
export const weatherDeadline=(season,level,seconds)=>seconds<300||level===6?null:season==='winter'?'freeze':'carry';
export const rainFillLimit=stage=>[0,.45,.95,1.55,2.1][stage]||0;
export const rainFillRate=stage=>[0,1/65,1/25,1/14,1/9][stage]||0;
