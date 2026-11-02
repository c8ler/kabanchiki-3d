import test from 'node:test';import assert from 'node:assert/strict';
import {IntroSequence,INTRO_STORY,introControls} from '../src/intro-sequence.js';
import {installPauseNavigation} from '../src/pause-navigation.js';
import {createModule as opening} from '../src/runtime/opening-adventure.js';
test('the complete family story precedes all controls and waits for the reader',()=>{
 const s=new IntroSequence(1000);assert.match(s.current.text,/мамой.*папой.*бабушкой.*братиком/);
 for(let i=0;i<INTRO_STORY.length;i++){assert.equal(s.index,i);assert.equal(s.phase,'story');assert.ok(s.sceneTime(1000000)<=s.current.end);assert.equal(s.index,i);assert.doesNotMatch(s.current.text,/W\/S|джойстик|пробел|кнопк/i);assert.equal(s.advance(2000+i*1000),false)}
 assert.equal(s.phase,'controls');assert.equal(s.sceneTime(1e9),INTRO_STORY.at(-1).end);assert.equal(s.advance(),true);assert.equal(s.phase,'done');
});
test('skip leads to controls and a replay starts from the beginning',()=>{const a=new IntroSequence();a.skipStory();assert.equal(a.phase,'controls');assert.equal(a.advance(),true);const b=new IntroSequence();assert.equal(b.index,0);assert.equal(b.phase,'story');for(const mobile of [true,false]){const lessons=introControls(mobile);assert.equal(lessons.length,3);assert.match(lessons[0].text,mobile?/джойстик/:/W\/S/);assert.match(lessons[1].text,/друг/);assert.doesNotMatch(lessons.map(s=>s.text).join(' '),/(?:^|\\s)(?:чит|крафт|бомб)/i)}});
function navFixture(){const make=()=>({hidden:false,textContent:'',focus(){this.focused=true}}),pages=new Map(['root','help','controls','settings','journal','about'].map(name=>[name,{...make(),dataset:{pausePage:name},querySelector:()=>make()}])),title=make(),back=make(),buttons=[['help'],['controls'],['settings']].map(([name])=>({...make(),dataset:{pauseOpen:name}})),root={firstElementChild:{scrollTop:99},querySelectorAll(q){return q==='[data-pause-page]'?[...pages.values()]:buttons},querySelector(q){if(q==='#pauseTitle')return title;if(q==='#pauseBack')return back;return buttons.find(b=>q.includes('"'+b.dataset.pauseOpen+'"'))}};
 return{nav:installPauseNavigation(root),pages,title,back,buttons};
}
test('pause navigation shows one page and Back returns one level before resuming',()=>{const {nav,pages,back}=navFixture();assert.equal(nav.current,'root');assert.equal(back.hidden,true);nav.open('help');nav.open('controls');assert.equal(nav.current,'controls');assert.equal([...pages.values()].filter(p=>!p.hidden).length,1);assert.equal(nav.back(),true);assert.equal(nav.current,'help');assert.equal(nav.back(),true);assert.equal(nav.current,'root');assert.equal(nav.back(),false);assert.equal(nav.open('unknown'),false);nav.open('settings');nav.reset();assert.equal(nav.current,'root')});
test('replaying the story preserves an ongoing paused game and its menu',()=>{
 const savedDocument=globalThis.document;globalThis.document={};try{
 const nodes=Object.fromEntries(['intro','pauseMenu','difficultyScreen','replayIntro','difficultyStory','watchIntro'].map(id=>[id,{style:{display:id==='pauseMenu'?'grid':'none'},focus(){}}]));
 const r={started:true,paused:true,level:4,score:81,food:3,cinematicRunning:false,campaignProgress:{sawIntro(){this.introSeen=true}},$:id=>nodes[id],clearInput(){},playCinematic(kind,done){assert.equal(kind,'intro');this.cinematicRunning=true;this.complete=done}};
 const m=opening(r);m.bindings.showIntroStory.get()();assert.equal(nodes.pauseMenu.style.display,'none');r.cinematicRunning=false;r.complete();assert.equal(r.started,true);assert.equal(r.paused,true);assert.equal(r.level,4);assert.equal(r.score,81);assert.equal(r.food,3);assert.equal(nodes.pauseMenu.style.display,'grid');assert.equal(r.campaignProgress.introSeen,true);
 }finally{globalThis.document=savedDocument}
});
