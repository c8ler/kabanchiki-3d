import test from 'node:test';import assert from 'node:assert/strict';
import {runStartup} from '../src/startup-sequence.js';import {CREDIT_DURATION} from '../src/startup-art.js';
import {familyDialogue,DialogueCursor} from '../src/family-dialogue.js';
function setup(extra={}){
 const nodes=Object.fromEntries(['intro','startupCredits','startupCreditText','start'].map(id=>[id,{dataset:{},style:{display:'none'},hidden:true,inert:true,setAttribute(){},removeAttribute(){},focus(){},getContext(){return null}}]));
 const frames=new Map(),listeners=new Map();let serial=0,done,stories=0,sounds=0,loading=true;
 const document={getElementById:id=>id==='loadingScreen'?(loading?{}:null):nodes[id],addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
 runStartup({document,story:after=>{stories++;done=after},requestFrame:fn=>{frames.set(++serial,fn);return serial},cancelFrame:id=>frames.delete(id),sound:()=>{sounds++;return true},...extra});
 const frame=now=>{const [id,fn]=frames.entries().next().value;frames.delete(id);fn(now)};
 return{nodes,frames,listeners,frame,loaded:()=>{loading=false},get stories(){return stories},get sounds(){return sounds},finishStory:()=>done()};
}
test('button-free animated credits wait for loading, then finish automatically before the story and menu',()=>{
 const s=setup();assert.equal(s.nodes.startupCreditText.textContent,'Made by c8ler');assert.equal(s.nodes.intro.inert,true);
 s.frame(10000);assert.equal(s.stories,0);assert.equal(s.sounds,0);s.loaded();s.frame(20000);assert.equal(s.sounds,1);
 s.frame(20000+CREDIT_DURATION-1);assert.equal(s.nodes.startupCreditText.textContent,'Made by c8ler');
 s.frame(20000+CREDIT_DURATION);assert.equal(s.nodes.startupCreditText.textContent,'Powered by ChatGPT');
 s.frame(20000+CREDIT_DURATION*2);assert.equal(s.stories,1);assert.equal(s.nodes.startupCredits.hidden,true);assert.equal(s.frames.size,0);assert.equal(s.listeners.size,0);
 assert.equal(s.nodes.startupCreditText.width,1);assert.equal(s.nodes.intro.style.display,'none');s.finishStory();assert.equal(s.nodes.intro.style.display,'flex');assert.equal(s.nodes.intro.inert,false);
});
test('muted settings suppress the ident sound and skipping does not schedule animation',()=>{
 const s=setup({audioEnabled:false});s.loaded();s.frame(0);assert.equal(s.sounds,0);
 const skipped=setup({skip:true});assert.equal(skipped.frames.size,0);assert.equal(skipped.stories,0);assert.equal(skipped.nodes.intro.style.display,'flex');
});
test('family advice covers weather and darkness; only the brother occasionally hints at the island',()=>{
 const all=[];let secrets=0;
 for(let role=0;role<4;role++)for(let turn=0;turn<8;turn++){
  const lines=familyDialogue(role,{line:'Привет!',after:'Пока!'},turn),text=lines.join(' ');all.push(text);
  assert.equal(lines.length,6);assert.equal(lines[0],'Привет!');assert.equal(lines.at(-1),'Пока!');assert.doesNotMatch(text,/чит|режим/i);
  if(/присни|кровать|сон/.test(text)){secrets++;assert.equal(role,2)}
  const cursor=new DialogueCursor(lines);while(cursor.next());assert.equal(cursor.text,'Пока!');
 }
 assert.equal(secrets,2);assert.match(all.join(' '),/торнадо/);assert.match(all.join(' '),/темнот/);assert.match(all.join(' '),/фонарик/);
 assert.notDeepEqual(familyDialogue(0,{},0),familyDialogue(0,{},1));
});
