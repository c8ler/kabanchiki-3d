export class CheatSession{
 constructor(){this.active=false;this.effects=new Set();this.baseline=null;this.revision=0}
 enter(baseline){if(this.active)return false;this.active=true;this.baseline=baseline;this.effects.clear();this.revision++;return true}
 mark(code){if(!this.active||code.type==='clear')return;let key=code.type;if(key==='form'){this.effects.delete('form:cat');this.effects.delete('form:boar');if(code.form==='human'){this.revision++;return}key='form:'+code.form}this.effects.add(key);this.revision++}
 has(key){return this.active&&this.effects.has(key)}
 stop(code){this.effects.delete(code.type==='form'?'form:'+code.form:code.type);this.revision++}
 leave(){const baseline=this.baseline;this.active=false;this.effects.clear();this.baseline=null;this.revision++;return baseline}
}
