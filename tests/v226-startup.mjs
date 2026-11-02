import test from 'node:test';import assert from 'node:assert/strict';
import {runStartup} from '../src/startup-sequence.js';
import {familyDialogue,DialogueCursor} from '../src/family-dialogue.js';
test('credits finish before story and the menu waits for story completion',()=>{
 const nodes=Object.fromEntries(['intro','startupCredits','startupCreditText','startupCreditNext','start'].map(id=>[id,{dataset:{},style:{display:'none'},hidden:true,inert:true,setAttribute(){},removeAttribute(){},focus(){}}]));
 const timers=new Map();let serial=0,done,stories=0;
 runStartup({document:{getElementById:id=>nodes[id]},story:after=>{stories++;done=after},schedule:fn=>{timers.set(++serial,fn);return serial},cancel:id=>timers.delete(id)});
 assert.equal(nodes.startupCreditText.textContent,'Made by c8ler');assert.equal(nodes.intro.inert,true);assert.equal(nodes.intro.style.display,'none');
 nodes.startupCreditNext.onclick();assert.equal(nodes.startupCreditText.textContent,'Powered by ChatGPT');assert.equal(timers.size,1);assert.equal(stories,0);
 [...timers.values()][0]();assert.equal(stories,1);assert.equal(nodes.startupCredits.hidden,true);assert.equal(nodes.intro.style.display,'none');assert.equal(nodes.startupCreditNext.onclick,null);
 done();assert.equal(nodes.intro.style.display,'flex');assert.equal(nodes.intro.inert,false);assert.equal(timers.size,0);
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
