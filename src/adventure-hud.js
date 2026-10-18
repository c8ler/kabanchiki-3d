export function resourceLevel(value,max){return {ratio:Math.max(0,Math.min(1,value/Math.max(1,max))),low:value<=Math.max(1,Math.floor(max*.25))}}
export function briefNotice(text){if(text.length<=96)return text;const first=text.split(/[.!?](?:\s|$)/)[0];return first.length<=96?first:text.slice(0,90).replace(/\s+\S*$/,'')+'…'}
export class AdventureHud{
 constructor(doc){this.doc=doc;this.root=doc.getElementById('hud');this.hints=doc.getElementById('worldHints');this.last={};this.attention={};this.journal=[];this.gain=null;
  this.slots={};for(const key of ['goal','friend','reward'])this.slots[key]=doc.querySelector('[data-hint="'+key+'"]');
 }
 update(state,now=performance.now()){
  for(const [key,value,max] of [['health',state.life,state.maxLife],['food',state.food,state.maxFood]]){
   const el=this.doc.getElementById(key+'Meter'),s=resourceLevel(value,max),old=this.last[key];
   if(old!==undefined&&old!==value){this.attention[key]=now+1600;if(value>old)this.gain={text:'+'+(value-old)+(key==='food'?' еда':' здоровье'),until:now+1600};}
   this.last[key]=value;el.querySelector('.meter-value').textContent=String(value);el.querySelector('.meter-capacity').textContent=key==='health'?'/ '+max:'';
   el.querySelector('.meter-label').textContent=key==='health'?(s.low?'Здоровье · мало':'Здоровье'):(s.low?'Еда · пополни':'Еда');
   el.style.setProperty('--fill',Math.round(s.ratio*100)+'%');el.classList.toggle('low',s.low);el.classList.toggle('attention',now<(this.attention[key]||0));
   el.setAttribute('aria-valuenow',String(value));el.setAttribute('aria-valuemax',String(Math.max(value,max)));
  }
  const form=this.doc.getElementById('formMeter');form.hidden=!state.form;
  if(state.form){form.querySelector('.meter-label').textContent=state.form==='cat'?'Котик':'Кабанчик';form.querySelector('.meter-value').textContent=Math.ceil(state.seconds)+' с';form.style.setProperty('--fill',Math.round(state.seconds/30*100)+'%');form.classList.toggle('low',state.seconds<=5);}
 }
 active(on){this.root.hidden=!on;this.hints.hidden=!on}
 log(text){if(this.journal[0]!==text)this.journal.unshift(text);this.journal.length=Math.min(this.journal.length,5);const list=this.doc.getElementById('pauseJournal');if(list)list.textContent=this.journal.join('\n')}
 hint(key,data){const el=this.slots[key];el.hidden=!data;if(!data)return;el.style.left=data.x+'px';el.style.top=data.y+'px';el.querySelector('span').textContent=data.text;el.dataset.kind=data.kind||key;const bar=el.querySelector('i');bar.hidden=data.ratio===undefined;if(data.ratio!==undefined)el.style.setProperty('--fill',Math.round(Math.max(0,Math.min(1,data.ratio))*100)+'%')}
}
