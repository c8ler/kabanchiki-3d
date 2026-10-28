export function remainingExitTasks({level,boarsDone=0,boarsTotal=0,familyDone=0,familyTotal=0,missingRoles=[],boss=null}){
 if(level<1||level>6)return [];
 if(level===6)return boss?['Победи босса: осталось '+boss.hp+' ударов']:[];
 const tasks=[],boars=Math.max(0,boarsTotal-boarsDone),family=Math.max(0,familyTotal-familyDone);
 if(boars)tasks.push('Накорми кабанчиков: ещё '+boars);
 if(family){const names=[...new Set(missingRoles)].map(r=>['маму','папу','братика','бабушку'][r]).filter(Boolean);tasks.push(names.length?'Найди '+names.join(' и '):'Найди родных: ещё '+family)}
 return tasks;
}
export function blockedExitHint(state,x,z){
 if(Math.abs(x)>10||z>-27||z<-49)return null;
 const tasks=remainingExitTasks(state);return tasks.length?'Осталось: '+tasks.join(' · '):null;
}
