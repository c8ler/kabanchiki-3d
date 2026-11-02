// Each pause page has its own controls; Back and Escape return one level.
export function installPauseNavigation(root){
 const pages=new Map([...root.querySelectorAll('[data-pause-page]')].map(e=>[e.dataset.pausePage,e]));
 const history=['root'],title=root.querySelector('#pauseTitle'),back=root.querySelector('#pauseBack');
 const names={root:'Пауза',help:'Помощь',controls:'Управление',settings:'Настройки',journal:'Задачи и события',about:'Об игре'};
 const current=()=>history.at(-1);
 function fitHeader(){const h=root.querySelector('.pauseHeader')?.getBoundingClientRect?.()?.height;if(h)root.firstElementChild.style?.setProperty('--pause-header',Math.ceil(h+12)+'px')}
 function render(focus=false){fitHeader();for(const [name,node]of pages)node.hidden=name!==current();title.textContent=names[current()];back.hidden=current()==='root';root.firstElementChild.scrollTop=0;if(focus)(pages.get(current()).querySelector('button,select,[tabindex]')||back).focus({preventScroll:true})}
 function open(name){if(!pages.has(name))return false;if(name!==current())history.push(name);render(true);return true}
 function goBack(){if(history.length===1)return false;const old=history.pop();render();root.querySelector('[data-pause-open="'+old+'"]')?.focus({preventScroll:true});return true}
 function reset(){history.splice(0,history.length,'root');render()}
 for(const b of root.querySelectorAll('[data-pause-open]'))b.onclick=()=>open(b.dataset.pauseOpen);
 const Observer=root.ownerDocument?.defaultView?.ResizeObserver,header=root.querySelector('.pauseHeader');if(Observer&&header)new Observer(fitHeader).observe(header);
 back.onclick=goBack;reset();return{open,back:goBack,reset,get current(){return current()}};
}
