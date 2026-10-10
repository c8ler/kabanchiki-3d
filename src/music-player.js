// Render a complete loop once; the audio thread plays it without JS note timers.
export function gameScore(theme,boss=false){
 const step=theme.tempo/1000,events=[];
 const tone=(at,freq,duration,type,gain,cutoff)=>{if(freq)events.push({kind:'tone',at,freq,duration,type,gain,cutoff})};
 for(let i=0;i<64;i++){
  const at=i*step,beat=i%16;
  tone(at,theme.lead[i],step*.78,'triangle',boss?.017:.021,theme.cutoff);
  if(i%2===0)tone(at,theme.bass[Math.floor(i/2)%theme.bass.length],step*1.85,'sawtooth',boss?.020:.017,420);
  if(i%4===1)tone(at,theme.pulse[Math.floor(i/2)%theme.pulse.length],step*.8,'triangle',.0075,700);
  if(i%8===0)theme.pad.forEach((freq,c)=>tone(at+c*.01,freq,step*3.2,'triangle',.0045,620));
  if(beat%4===0)events.push({kind:'kick',at,duration:.14,gain:boss?.043:.034});
  if(beat===4||beat===12)events.push({kind:'noise',at,duration:.07,gain:boss?.010:.008,cutoff:900});
  if(beat%4===2)events.push({kind:'noise',at,duration:.025,gain:.0032,cutoff:1500});
 }
 return {duration:64*step,events};
}
export function cinematicScore(kind,notes){
 const happy=kind==='outro',step=happy?.27:.36,events=[];
 notes.forEach((freq,i)=>{events.push({kind:'tone',at:i*step,freq,duration:happy?.34:.48,type:happy?'triangle':'sine',gain:happy?.038:.026,cutoff:1000});if(i%4===0)events.push({kind:'tone',at:i*step,freq:freq/2,duration:.65,type:'sine',gain:.009,cutoff:1000})});
 return {duration:notes.length*step,events};
}
export async function renderScore(score,sampleRate=24000){
 const Offline=globalThis.OfflineAudioContext||globalThis.webkitOfflineAudioContext;
 const frames=Math.round(score.duration*sampleRate),duration=frames/sampleRate;
 const context=new Offline(1,frames*2+sampleRate,sampleRate);
 for(let cycle=0;cycle<2;cycle++)for(const event of score.events){
  const at=event.at+cycle*duration,g=context.createGain();let source,filter;
  if(event.kind==='noise'){
   source=context.createBufferSource();const buffer=context.createBuffer(1,Math.ceil(sampleRate*event.duration),sampleRate),data=buffer.getChannelData(0);
   for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
   source.buffer=buffer;g.gain.setValueAtTime(event.gain,at);g.gain.exponentialRampToValueAtTime(.0001,at+event.duration);
  }else{
   source=context.createOscillator();source.type=event.type||'sine';source.frequency.setValueAtTime(event.freq||115,at);g.gain.setValueAtTime(.0001,at);
   if(event.kind==='kick'){source.frequency.exponentialRampToValueAtTime(48,at+.11);g.gain.linearRampToValueAtTime(event.gain*.8,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+.13)}
   else{g.gain.exponentialRampToValueAtTime(event.gain,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+event.duration)}
  }
  if(event.cutoff){filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=event.cutoff;filter.Q.value=.7;source.connect(filter).connect(g)}else source.connect(g);
  g.connect(context.destination);source.start(at);source.stop(at+event.duration+.03);
 }
 const rendered=await context.startRendering(),loop=context.createBuffer(1,frames,sampleRate);
 // The second cycle includes tails from the first, so the loop seam stays continuous.
 loop.getChannelData(0).set(rendered.getChannelData(0).subarray(frames,frames*2));return loop;
}
export class BufferedMusic{
 constructor(context,destination){this.context=context;this.destination=destination;this.cache=new Map();this.source=null;this.gain=null;this.key=null;this.generation=0}
 async play(key,score){
  if(this.key===key)return;
  this.stop();const generation=this.generation;this.key=key;
  let promise=this.cache.get(key);if(!promise){promise=renderScore(score);this.cache.set(key,promise);promise.catch(()=>this.cache.delete(key))}
  try{
   const buffer=await promise;if(generation!==this.generation)return;
   const c=this.context,source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;source.loop=true;
   gain.gain.setValueAtTime(0,c.currentTime);gain.gain.linearRampToValueAtTime(1,c.currentTime+.03);
   source.connect(gain).connect(this.destination);source.onended=()=>{source.disconnect();gain.disconnect()};source.start();this.source=source;this.gain=gain;
  }catch(error){if(generation===this.generation)this.key=null;console.warn('Музыка:',error)}
 }
 stop(){
  this.generation++;this.key=null;
  if(this.source){const now=this.context.currentTime;this.gain.gain.cancelScheduledValues(now);this.gain.gain.setTargetAtTime(0,now,.01);this.source.stop(now+.06);this.source=null;this.gain=null}
 }
}
