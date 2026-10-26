import { stormClock } from "../tornado-rules.js?v=218";
import { RECIPES } from "../crafting-rules.js?v=218";
import { forestEdgeAt, forestEdgeBlocked } from "../world-interactions.js?v=218";
import { visibleInTree, projectedBox } from "../cinematic-tree-guard.js?v=218";
import { HOME_SITE, WOOD_PILES } from "../home-construction.js?v=218";
import * as THREE from "../../vendor/three/three.module.min.js";
import { attacksPlayer } from "../boar-physics.js?v=218";
import { polygonContact } from "../movement-geometry.js?v=218";
import { riverCenterAt, riverDepthAt, onRiverBridge, lakeInletCenterAt, lakeInletHalfWidthAt, lakeInletDepthAt, lakePointAt, lakeDepth } from "../world-surface.js?v=218";
import { seasonForAttempts } from "../seasons.js?v=218";
import { lightBudget } from "../render-budget.js?v=218";
import { findGridPath, StableRoute } from "../navigation.js?v=218";
import { CAT_BERRY_CHANCE, CAT_JUMP_SPEED } from "../form-rules.js?v=218";

// Owns 0 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){

 return {
  bindings:{

  },
  initialize(){
if(runtime.__autoTest||runtime.__autoParams.get('openingtest')==='1')return import('../qa/index.js?v=218').then(({createGameQa})=>{window.__KABANCHIKI_QA__=createGameQa(runtime)});
  }
 };

}
