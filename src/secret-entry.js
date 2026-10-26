export class SecretEntry {
 constructor(taps=5,windowMs=15000){this.taps=taps;this.windowMs=windowMs;this.reset()}
 reset(){this.count=0;this.started=null}
 tap(now){if(this.started===null||now-this.started>this.windowMs||now<this.started){this.count=0;this.started=now}if(++this.count<this.taps)return false;this.reset();return true}
}
