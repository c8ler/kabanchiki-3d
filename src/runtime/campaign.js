

// Owns 4 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

function clearWorldFires(){runtime.resetStormLocationState();for(const [tree,b] of runtime.burningTrees){tree.remove(b.light);tree.remove(b.flames);runtime.restoreStormObject(tree)}runtime.burningTrees.clear();}

function resetNewRun(resetHome=true){if(resetHome){runtime.craftUnlocked=runtime.homeUnlocked=false;runtime.leaveSandbox();}if(resetHome){runtime.totalTime=0;runtime.score=0;runtime.familyFound=0;runtime.statsData={fed:0,forage:0,berries:0,damage:0,family:0,minions:0,bossHits:0};}runtime.resetAdventureItems(resetHome);if(resetHome){runtime.home.reset();runtime.saveHome();runtime.syncHomeVisual();}runtime.rideHop.reset();runtime.nextRegularFood='apple';runtime.foodView.throwTime=0;runtime.deathSceneActive=runtime.deathSceneFinished=false;runtime.lastDeathCause='boar';runtime.lastDeathBoar=null;
 runtime.attemptProgress.begin();runtime.currentSeason=runtime.unlockedSeasons().includes(runtime.chosenSeason)?runtime.chosenSeason:runtime.attemptProgress.season;
 clearWorldFires();
 for(const tree of runtime.treeObjects){if(tree.userData.beforeYellowScale){tree.scale.copy(tree.userData.beforeYellowScale);delete tree.userData.beforeYellowScale;delete tree.userData.yellowAppleGrown}tree.traverse(o=>{if(o.material?.emissive)o.material.emissive.set(0x000000)})}
 if(runtime.friend?.g)runtime.scene.remove(runtime.friend.g);runtime.friend=null;runtime.mountedFriend=false;runtime.setRiderPose(false);runtime.friendKnockbackActive=false;runtime.friendYield.reset();runtime.friendAttack=0;
 runtime.keys={};runtime.stick.x=runtime.stick.y=0;runtime.jump=runtime.act=false;runtime.hasFlashlight=false;runtime.torch.intensity=0;runtime.yellowMushroomStock=0;runtime.yellowAppleStock=0;runtime.fishStock=0;runtime.boarFormTime=0;runtime.catFormTime=0;if(runtime.catFormModel)runtime.catFormModel.g.visible=false;if(runtime.boarFormVisual)runtime.boarFormVisual.visible=false;runtime.boy.visible=true;
 for(const shot of runtime.shots)runtime.scene.remove(shot.g);runtime.shots.length=0;runtime.throwCooldown=0;runtime.hurricaneCarry=0;runtime.underwaterTime=0;runtime.underwaterDamageCd=0;runtime.weatherBaseSky=null;
}

function startCampaignLevel(){const testing=runtime.__autoTest||runtime.__autoParams.get('openingtest')==='1',initial=testing?1:runtime.campaignProgress.firstLevel;runtime.loadLevel(initial);if(initial===1&&!testing)runtime.campaignProgress.enteredTutorial();if(initial===2){runtime.familyFound=1;runtime.statsData.family=1;}runtime.hud();runtime.startMusic();runtime.notice(initial===1?'👩 Мама впереди. Иди по дорожке!':'🌊 Новое приключение начинается у озера.');}

function restartGame(){
 const retry=runtime.endShown&&!runtime.win,restartLevel=retry?(runtime.level===1&&runtime.campaignProgress.tutorialSeen?2:runtime.level):runtime.campaignProgress.firstLevel,elapsed=retry?runtime.totalTime:0,previousFamily=retry?Math.max(runtime.level===1&&runtime.campaignProgress.tutorialSeen?1:0,runtime.familyFound-runtime.levelFamilyDone):(runtime.campaignProgress.firstLevel===2?1:0);
 if(!runtime.mobile)runtime.requestDesktopMouseLock();runtime.stopMusic();runtime.stopCinematicMusic();runtime.cineClear();runtime.cinematicRunning=false;runtime.cinematicFinish=null;
 runtime.$('cinematic').style.display='none';runtime.$('endScreen').style.display='none';runtime.$('pauseMenu').style.display='none';runtime.$('familyPopup').style.display='none';runtime.$('statsScreen').style.display='none';
 runtime.win=false;runtime.started=true;runtime.paused=false;runtime.endShown=false;runtime.resultSaving=false;runtime.resultLocalSaved=false;runtime.resultGlobalSaved=false;runtime.life=runtime.diffCfg().playerHP;runtime.food=runtime.foodCapacity();runtime.score=0;runtime.familyFound=0;runtime.friendHP=runtime.diffCfg().friendHP;runtime.bossHits=0;runtime.damage=0;runtime.totalTime=0;runtime.invuln=0;
 resetNewRun(!retry);runtime.familyFound=previousFamily;runtime.statsData={fed:0,forage:0,berries:0,damage:0,family:previousFamily,minions:0,bossHits:0};runtime.boy.position.set(0,0,4);runtime.py=0;runtime.vy=0;runtime.loadLevel(restartLevel);runtime.totalTime=elapsed;runtime.startMusic();runtime.notice(retry?'🔄 Попробуй снова! Очки сброшены, общее время продолжается.':'👩 Мама впереди. Иди по дорожке!');
}
 return {
  bindings:{
"clearWorldFires":{get:()=>clearWorldFires},
"resetNewRun":{get:()=>resetNewRun},
"startCampaignLevel":{get:()=>startCampaignLevel},
"restartGame":{get:()=>restartGame}
  },
  initialize(){

runtime.$('playerName').addEventListener('keydown',e=>{if(e.key!=='Enter')return;e.preventDefault();e.stopPropagation();if(runtime.resultGlobalSaved){restartGame();return}if(!runtime.resultSaving)runtime.$('saveResult').click()});

runtime.$('endScreen').addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement!==runtime.$('playerName')&&runtime.resultGlobalSaved){e.preventDefault();e.stopPropagation();restartGame()}});

runtime.$('saveResult').onclick=async()=>{if(runtime.resultSaving||runtime.resultGlobalSaved)return;const name=(runtime.$('playerName').value.trim()||'Аноним').slice(0,20);runtime.resultSaving=true;runtime.$('saveResult').disabled=true;runtime.$('saveMsg').textContent='💾 Сохраняю результат…';let localOk=runtime.resultLocalSaved;if(!runtime.resultLocalSaved){try{localStorage.setItem('kabanchiki3d_player_name',name);const a=JSON.parse(localStorage.getItem('kabanchiki3d_results')||'[]');a.unshift({name,score: runtime.score,time:Math.round(runtime.totalTime),win: runtime.win,level: runtime.level,difficulty:runtime.selectedDiff,family:runtime.familyFound,version:runtime.GAME_VERSION,date:new Date().toLocaleDateString()});localStorage.setItem('kabanchiki3d_results',JSON.stringify(a.slice(0,50)));runtime.resultLocalSaved=true;localOk=true}catch{localOk=false}}let global={ok:runtime.resultGlobalSaved};if(!runtime.resultGlobalSaved)global=await runtime.submitGlobalResult(name);if(global.ok){runtime.resultGlobalSaved=true;runtime.$('saveMsg').textContent='✅ Результат сохранён один раз — на устройстве и в 🌍 мировой таблице!'}else runtime.$('saveMsg').textContent=(localOk?'✅ Локально сохранено один раз. ':'⚠️ Локальное сохранение недоступно. ')+'🌍 Мировая таблица сейчас недоступна — можно повторить отправку.';runtime.resultSaving=false;runtime.$('saveResult').disabled=runtime.resultGlobalSaved};

runtime.$('endRestart').onclick=restartGame;
  }
 };

}
