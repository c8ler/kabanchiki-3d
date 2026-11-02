import {CREDIT_DURATION,CREDIT_NAMES,drawStartupCredit,playStartupSound} from './startup-art.js?v=227';
// Branding runs only on a fresh page load; story replays use showIntroStory directly.
export function runStartup({document,skip=false,story,audioEnabled=true,requestFrame=requestAnimationFrame,cancelFrame=cancelAnimationFrame,sound=playStartupSound}){
 const menu=document.getElementById('intro'),card=document.getElementById('startupCredits'),canvas=document.getElementById('startupCreditText'),view=document.defaultView;
 const reducedMotion=!!view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 let ticket=null,started=null,index=-1,finished=false,sounded=false;
 const showMenu=()=>{menu.style.display='flex';menu.inert=false;menu.removeAttribute('aria-hidden');document.getElementById('start').focus({preventScroll:true})};
 const trySound=()=>{if(audioEnabled&&!sounded&&!finished&&started!==null)sounded=!!sound()};
 const gesture=event=>{if(event.isTrusted)trySound()};
 const finish=()=>{
  if(finished)return;finished=true;cancelFrame(ticket);card.hidden=true;
  document.removeEventListener('pointerdown',gesture);document.removeEventListener('keydown',gesture);
  // Release the backing store; no animation frames remain after the ident.
  canvas.width=1;canvas.height=1;
  if(skip)showMenu();else story(showMenu);
 };
 if(skip){finish();return}
 menu.style.display='none';menu.inert=true;menu.setAttribute('aria-hidden','true');card.hidden=false;
 const setCard=value=>{index=value;canvas.textContent=CREDIT_NAMES[index];canvas.setAttribute('aria-label',CREDIT_NAMES[index]);card.dataset.card=String(index+1)};
 setCard(0);
 document.addEventListener('pointerdown',gesture,{passive:true});document.addEventListener('keydown',gesture);
 const frame=now=>{
  if(finished)return;
  // The loading overlay must have disappeared before any credit time is consumed.
  if(document.getElementById('loadingScreen')){ticket=requestFrame(frame);return}
  if(started===null){started=now;trySound()}
  const elapsed=Math.max(0,now-started),next=Math.floor(elapsed/CREDIT_DURATION);
  if(next>=CREDIT_NAMES.length){finish();return}
  if(next!==index)setCard(next);
  drawStartupCredit(canvas,index,(elapsed%CREDIT_DURATION)/CREDIT_DURATION,{reducedMotion,pixelRatio:view?.devicePixelRatio||1});
  ticket=requestFrame(frame);
 };
 ticket=requestFrame(frame);
}
