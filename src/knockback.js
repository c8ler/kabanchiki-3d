// Four metres of recoil with a fast impact and gradual deceleration.
export class Knockback {
  constructor(dx, dz, distance = 4, duration = .6) {
    const length = Math.hypot(dx, dz);
    this.nx = length > .001 ? dx / length : 0;
    this.nz = length > .001 ? dz / length : 1;
    this.distance = distance;
    this.duration = duration;
    this.elapsed = 0;
  }
  get active() { return this.elapsed < this.duration; }
  step(dt) {
    const previous = this.elapsed / this.duration;
    this.elapsed = Math.min(this.duration, this.elapsed + Math.max(0, dt));
    const progress = this.elapsed / this.duration;
    const distance = this.distance * ((1 - previous) ** 2 - (1 - progress) ** 2);
    return { dx: this.nx * distance, dz: this.nz * distance, progress };
  }
}
