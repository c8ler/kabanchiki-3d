const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
export const CREDIT_DURATION=3400;
export const CREDIT_NAMES=['Made by c8ler','Powered by ChatGPT'];
// A small vector ident: no textures, downloads, particles or WebGL resources.
export function drawStartupCredit(canvas,index,progress,{reducedMotion=false,pixelRatio=1}={}){
 const ctx=canvas.getContext?.('2d');if(!ctx)return;
 const rect=canvas.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height),ratio=Math.max(.25,Math.min(2,pixelRatio,1920/w,1920/h));
 const width=Math.round(w*ratio),height=Math.round(h*ratio);
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);
 const t=clamp(progress),fade=ease(t/.18)*ease((1-t)/.20),scale=Math.min(w/820,h/440);
 ctx.setTransform(ratio*scale,0,0,ratio*scale,width/2,height/2);
 ctx.globalAlpha=fade;ctx.strokeStyle=index?'#acd8c8':'#e9e4da';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=2.5;
 ctx.save();ctx.translate(0,-142);
 if(index){
  // Six interlocking orbital strokes, quietly forming a single mark.
  for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3+(reducedMotion?0:(1-ease(t/.35))*.18));ctx.beginPath();ctx.ellipse(0,-12,18,27,0,-Math.PI*.7,Math.PI*.75);ctx.stroke();ctx.restore()}
 }else{
  // An original boar crest, echoing the game's hero.
  ctx.beginPath();ctx.moveTo(-27,4);ctx.lineTo(-34,-30);ctx.lineTo(-11,-17);ctx.quadraticCurveTo(0,-23,11,-17);ctx.lineTo(34,-30);ctx.lineTo(27,4);ctx.quadraticCurveTo(23,29,0,30);ctx.quadraticCurveTo(-23,29,-27,4);ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,10,17,11,0,0,Math.PI*2);ctx.stroke();
  for(const x of [-6,6]){ctx.beginPath();ctx.arc(x,10,1.8,0,Math.PI*2);ctx.fill()}
  for(const x of [-17,17]){ctx.beginPath();ctx.arc(x,-7,2,0,Math.PI*2);ctx.fill()}
 }
 ctx.restore();
 const letters=(text,y,size,spacing,weight,delay)=>{
  ctx.font=weight+' '+size+'px Arial, sans-serif';ctx.textBaseline='middle';
  const widths=Array.from(text,c=>ctx.measureText(c).width),total=widths.reduce((a,b)=>a+b,0)+(text.length-1)*spacing;
  let x=-total/2;
  [...text].forEach((c,i)=>{
   const reveal=reducedMotion?1:ease((t-delay-i*.012)/.17);
   ctx.globalAlpha=fade*reveal;ctx.shadowColor=index?'#9edac1':'#e5decb';ctx.shadowBlur=reducedMotion?0:(1-reveal)*16;
   ctx.fillText(c,x,y+(reducedMotion?0:(1-reveal)*9));x+=widths[i]+spacing;
  });
  ctx.shadowBlur=0;ctx.globalAlpha=fade;
 };
 letters(index?'POWERED BY':'MADE BY',-47,18,8,'400',.025);
 letters(index?'ChatGPT':'c8ler',35,index?100:134,index?5:11,'600',.07);
 const line=reducedMotion?1:ease((t-.16)/.25);
 ctx.globalAlpha=fade*.48;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-92*line,117);ctx.lineTo(92*line,117);ctx.stroke();
 ctx.globalAlpha=1;
}
export function playStartupSound(){
 let audio;
 try{
  const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return false;
  audio=new Audio();
  // Never queue a suspended ident that might suddenly play later in the game.
  if(audio.state!=='running'){audio.close().catch(()=>{});return false}
  const start=audio.currentTime;
  [261.63,392,523.25].forEach((frequency,i)=>{
   const oscillator=audio.createOscillator(),gain=audio.createGain(),at=start+i*.11;
   oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,at);
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.022,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+.6);
   oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(at);oscillator.stop(at+.65);
  });
  setTimeout(()=>audio.close().catch(()=>{}),1000);return true;
 }catch{try{audio?.close()?.catch(()=>{})}catch{}return false}
}
