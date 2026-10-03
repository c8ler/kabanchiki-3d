export const ATTEMPTS_KEY='kabanchiki3d_failed_runs';
export function normalizeAttempts(value){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.floor(n)):0}
export function seasonForAttempts(value){const n=normalizeAttempts(value);return n>=60?'spring':n>=40?'winter':n>=20?'autumn':'summer'}
export class AttemptProgress{
 constructor(storage){this.storage=storage;try{this.failed=normalizeAttempts(storage?.getItem(ATTEMPTS_KEY))}catch{this.failed=0}this.recorded=false}
 begin(){this.recorded=false}
 lose(){if(!this.recorded){this.recorded=true;this.failed++;try{this.storage?.setItem(ATTEMPTS_KEY,String(this.failed))}catch{}}return this.failed}
 get season(){return seasonForAttempts(this.failed)}
}
