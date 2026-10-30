import { AdventureHud } from "../adventure-hud.js?v=221";

// Owns 7 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let flashlightDropUntil,noticeTimer,adventureHud;

function escStat(v){return String(v??'').replace(/[<>&"']/g,'')}

function localStatsHtml(){let a=[];try{a=JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]')}catch{}if(!a.length)return '<p>Пока нет сохранённых результатов. После игры введи имя и нажми «💾 Сохранить результат».</p>';const rows=a.slice().sort((x,y)=>(y.score||0)-(x.score||0)||(x.time||999999)-(y.time||999999)).slice(0,20);return '<div style="display:grid;grid-template-columns:34px 1fr 68px 70px 76px;gap:6px;align-items:center;font-size:13px"><b>№</b><b>Игрок</b><b>Очки</b><b>Время</b><b>Итог</b>'+rows.map((r,i)=>`<span>${i+1}</span><b>${escStat(r.name||'Аноним')}</b><span>🏆${r.score||0}</span><span>⏱${runtime.formatTime(r.time||0)}</span><span>${r.win?'✅ Победа':'💀 Проигрыш'}</span>`).join('')+'</div>'}

async function globalStatsHtml(){try{const q='select=player_name,score,play_time,difficulty,family,game_version&order=score.desc,play_time.asc&limit=20';const r=await fetch(`${runtime.SUPABASE_URL}/rest/v1/leaderboard?${q}`,{headers:{apikey:runtime.SUPABASE_KEY,Authorization:`Bearer ${runtime.SUPABASE_KEY}`}});if(!r.ok)throw new Error(`HTTP ${r.status}`);const rows=await r.json();if(!rows.length)return '<p>🌍 Мировой рейтинг пока пуст. Стань первым победителем!</p>';return '<div style="display:grid;grid-template-columns:30px 1fr 62px 66px 42px;gap:6px;align-items:center;font-size:13px"><b>№</b><b>Игрок</b><b>Очки</b><b>Время</b><b>Сл.</b>'+rows.map((x,i)=>`<span>${i+1}</span><b>${escStat(x.player_name||'Аноним')}</b><span>🏆${x.score||0}</span><span>⏱${runtime.formatTime(x.play_time||0)}</span><span>${Number(x.difficulty)+1}</span>`).join('')+'</div>'}catch(e){console.warn('Global leaderboard load failed',e);return '<p>⚠️ Не удалось загрузить мировой рейтинг. Проверь интернет — локальная статистика продолжает работать.</p>'}}

async function showPlayerStats(mode='global'){const box=runtime.$('statsTable');runtime.$('statsScreen').style.display='grid';box.innerHTML='<div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px"><button id="globalStatsTab">🌍 Мир</button><button id="localStatsTab">📱 Мои</button></div><div id="statsRows">Загрузка…</div>';const rows=runtime.$('statsRows'),g=runtime.$('globalStatsTab'),l=runtime.$('localStatsTab');const showLocal=()=>{rows.innerHTML=localStatsHtml();g.disabled=false;l.disabled=true};const showGlobal=async()=>{g.disabled=true;l.disabled=false;rows.textContent='🌍 Загружаю мировой ТОП-20…';rows.innerHTML=await globalStatsHtml()};g.onclick=showGlobal;l.onclick=showLocal;if(mode==='local')showLocal();else await showGlobal()}
 return {
  bindings:{
"escStat":{get:()=>escStat},
"localStatsHtml":{get:()=>localStatsHtml},
"globalStatsHtml":{get:()=>globalStatsHtml},
"showPlayerStats":{get:()=>showPlayerStats},
"flashlightDropUntil":{get:()=>flashlightDropUntil,set:value=>{flashlightDropUntil=value}},
"noticeTimer":{get:()=>noticeTimer,set:value=>{noticeTimer=value}},
"adventureHud":{get:()=>adventureHud}
  },
  initialize(){

runtime.$('showStatsIntro').onclick=()=>showPlayerStats('global');

runtime.$('showStatsEnd').onclick=()=>showPlayerStats('global');

runtime.$('closeStats').onclick=()=>runtime.$('statsScreen').style.display='none';

/* init:let */ flashlightDropUntil = 0;

/* init:let */ noticeTimer = null;

/* init:const */ adventureHud = new AdventureHud(document);
  }
 };

}
