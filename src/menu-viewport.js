export function installMenuViewport(win,doc){
 let pending=false;
 const update=()=>{pending=false;const v=win.visualViewport,s=doc.documentElement.style;s.setProperty('--menu-vh',Math.max(1,v?.height||win.innerHeight)+'px');s.setProperty('--menu-vw',Math.max(1,v?.width||win.innerWidth)+'px');s.setProperty('--menu-top',(v?.offsetTop||0)+'px');s.setProperty('--menu-left',(v?.offsetLeft||0)+'px')};
 const schedule=()=>{if(!pending){pending=true;win.requestAnimationFrame(update)}};
 win.addEventListener('resize',schedule);win.visualViewport?.addEventListener('resize',schedule);win.visualViewport?.addEventListener('scroll',schedule);update();return update;
}
