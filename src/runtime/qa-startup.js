

// Owns 0 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

 return {
  bindings:{

  },
  initialize(){

if(runtime.__autoTest){window.__KABANCHIKI_TEST__.auditsComplete=false;
 try{
  runtime.selectedDiff=2;runtime.life=runtime.diffCfg().playerHP;runtime.food=runtime.foodCapacity();runtime.friendHP=runtime.diffCfg().friendHP;
  runtime.$('intro').style.display='none';runtime.$('cinematic').style.display='none';runtime.paused=false;runtime.started=true;runtime.win=false;
  const __lv=Math.max(1,Math.min(6,Number(runtime.__autoParams.get('level')||1)));runtime.loadLevel(__lv);
  window.__KABANCHIKI_TEST__.level=__lv;
  // v83: readiness must not wait for the expensive robot sweep. GitHub can now distinguish startup from collision-test work.
  window.__KABANCHIKI_TEST__.ready=true;document.documentElement.dataset.kabanchikiReady='1';
  setTimeout(()=>{try{const __v156=runtime.runV156Audit();window.__KABANCHIKI_TEST__.v156Audit=__v156;if(!__v156.ok)window.__KABANCHIKI_TEST__.errors.push(...__v156.issues);const __counter=runtime.runBossCounterattackAudit();window.__KABANCHIKI_TEST__.bossCounterattackAudit=__counter;if(!__counter.ok)window.__KABANCHIKI_TEST__.errors.push(...__counter.issues);const __revision=runtime.runLakeStormFeedingAudit();window.__KABANCHIKI_TEST__.lakeStormFeedingAudit=__revision;if(!__revision.ok)window.__KABANCHIKI_TEST__.errors.push(...__revision.issues);const __boars=runtime.runBoarBehaviorAudit();window.__KABANCHIKI_TEST__.boarBehaviorAudit=__boars;if(!__boars.ok)window.__KABANCHIKI_TEST__.errors.push(...__boars.issues);const __mountains=runtime.runMountainGeometryAudit();window.__KABANCHIKI_TEST__.mountainAudit=__mountains;if(!__mountains.ok)window.__KABANCHIKI_TEST__.errors.push(...__mountains.issues);const __yield=runtime.runFriendYieldAudit();window.__KABANCHIKI_TEST__.friendYieldAudit=__yield;if(!__yield.ok)window.__KABANCHIKI_TEST__.errors.push(...__yield.issues);const __robot=runtime.runRobotCollisionTest();window.__KABANCHIKI_TEST__.robotAudit=__robot;if(!__robot.ok)window.__KABANCHIKI_TEST__.errors.push(...__robot.issues);const __climb=runtime.runRockClimbAudit();window.__KABANCHIKI_TEST__.rockClimbAudit=__climb;if(!__climb.ok)window.__KABANCHIKI_TEST__.errors.push(...__climb.issues);const __edge=runtime.runRockEdgeAudit();window.__KABANCHIKI_TEST__.rockEdgeAudit=__edge;if(!__edge.ok)window.__KABANCHIKI_TEST__.errors.push(...__edge.issues);const __log=runtime.runLogPhysicsAudit();window.__KABANCHIKI_TEST__.logPhysicsAudit=__log;if(!__log.ok)window.__KABANCHIKI_TEST__.errors.push(...__log.issues);const __branchApple=runtime.runBranchAppleAudit();window.__KABANCHIKI_TEST__.branchAppleAudit=__branchApple;if(!__branchApple.ok)window.__KABANCHIKI_TEST__.errors.push(...__branchApple.issues);const __mountedTerrain=runtime.runMountedTerrainAudit();window.__KABANCHIKI_TEST__.mountedTerrainAudit=__mountedTerrain;if(!__mountedTerrain.ok)window.__KABANCHIKI_TEST__.errors.push(...__mountedTerrain.issues);const __treeTrunk=runtime.runTreeTrunkAudit();window.__KABANCHIKI_TEST__.treeTrunkAudit=__treeTrunk;if(!__treeTrunk.ok)window.__KABANCHIKI_TEST__.errors.push(...__treeTrunk.issues);const __appleTwig=runtime.runReachableAppleTwigAudit();window.__KABANCHIKI_TEST__.reachableAppleTwigAudit=__appleTwig;if(!__appleTwig.ok)window.__KABANCHIKI_TEST__.errors.push(...__appleTwig.issues);const __branchTravel=runtime.runBranchTraversalAudit();window.__KABANCHIKI_TEST__.branchTraversalAudit=__branchTravel;if(!__branchTravel.ok)window.__KABANCHIKI_TEST__.errors.push(...__branchTravel.issues);const __passage=runtime.runTreeRockPassageAudit();window.__KABANCHIKI_TEST__.treeRockPassageAudit=__passage;if(!__passage.ok)window.__KABANCHIKI_TEST__.errors.push(...__passage.issues);const __multiRock=runtime.runMountedMultiRockAudit();window.__KABANCHIKI_TEST__.mountedMultiRockAudit=__multiRock;if(!__multiRock.ok)window.__KABANCHIKI_TEST__.errors.push(...__multiRock.issues);const __corr=runtime.runRockCorridorAudit();window.__KABANCHIKI_TEST__.rockCorridorAudit=__corr;if(!__corr.ok)window.__KABANCHIKI_TEST__.errors.push(...__corr.issues);const __mountedApple=runtime.runMountedAppleAudit();window.__KABANCHIKI_TEST__.mountedAppleAudit=__mountedApple;if(!__mountedApple.ok)window.__KABANCHIKI_TEST__.errors.push(...__mountedApple.issues)}catch(e){const msg='robot-exception:'+String(e);window.__KABANCHIKI_TEST__.robotAudit={ok:false,pending:false,issues:[msg],samples:[],treesTested:0,rocksTested:0,level:__lv};window.__KABANCHIKI_TEST__.errors.push(msg)}finally{window.__KABANCHIKI_TEST__.auditsComplete=true}},50);
 }catch(e){window.__KABANCHIKI_TEST__.errors.push(String(e));document.documentElement.dataset.kabanchikiError=String(e)}
}
  }
 };

}
