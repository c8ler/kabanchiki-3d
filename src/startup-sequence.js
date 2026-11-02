// Branding runs only on a fresh page load; story replays use showIntroStory directly.
export function runStartup({document,skip=false,story,schedule=setTimeout,cancel=clearTimeout}){
 const menu=document.getElementById('intro'),card=document.getElementById('startupCredits'),label=document.getElementById('startupCreditText'),next=document.getElementById('startupCreditNext');
 let index=0,timer=null,finished=false;
 const showMenu=()=>{menu.style.display='flex';menu.inert=false;menu.removeAttribute('aria-hidden');document.getElementById('start').focus({preventScroll:true})};
 const finish=()=>{if(finished)return;finished=true;cancel(timer);card.hidden=true;next.onclick=null;if(skip)showMenu();else story(showMenu)};
 if(skip){finish();return}
 menu.style.display='none';menu.inert=true;menu.setAttribute('aria-hidden','true');
 const advance=()=>{cancel(timer);if(index===2){finish();return}label.textContent=['Made by c8ler','Powered by ChatGPT'][index++];card.dataset.card=String(index);card.hidden=false;next.focus({preventScroll:true});timer=schedule(advance,index===1?2400:1800)};
 next.onclick=advance;advance();
}
