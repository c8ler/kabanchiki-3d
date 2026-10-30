import {createRuntime,initializeModules} from './runtime/context.js?v=222';
import {createModule as createFoundation} from './runtime/foundation.js?v=222';
import {createModule as createRenderer} from './runtime/renderer.js?v=222';
import {createModule as createMaterials} from './runtime/materials.js?v=222';
import {createModule as createForestGround} from './runtime/forest-ground.js?v=222';
import {createModule as createSceneryLayout} from './runtime/scenery-layout.js?v=222';
import {createModule as createVillage} from './runtime/village.js?v=222';
import {createModule as createBiomes} from './runtime/biomes.js?v=222';
import {createModule as createStormState} from './runtime/storm-state.js?v=222';
import {createModule as createStormDamage} from './runtime/storm-damage.js?v=222';
import {createModule as createLightningWeather} from './runtime/lightning-weather.js?v=222';
import {createModule as createLakeScenery} from './runtime/lake-scenery.js?v=222';
import {createModule as createCharacter} from './runtime/character.js?v=222';
import {createModule as createWaterSurface} from './runtime/water-surface.js?v=222';
import {createModule as createTerrain} from './runtime/terrain.js?v=222';
import {createModule as createRidingCombat} from './runtime/riding-combat.js?v=222';
import {createModule as createAudioEffects} from './runtime/audio-effects.js?v=222';
import {createModule as createMusic} from './runtime/music.js?v=222';
import {createModule as createBoarModel} from './runtime/boar-model.js?v=222';
import {createModule as createForageSpawning} from './runtime/forage-spawning.js?v=222';
import {createModule as createFamilyModels} from './runtime/family-models.js?v=222';
import {createModule as createPortalFlashlight} from './runtime/portal-flashlight.js?v=222';
import {createModule as createSeasons} from './runtime/seasons.js?v=222';
import {createModule as createWaterEffects} from './runtime/water-effects.js?v=222';
import {createModule as createFishing} from './runtime/fishing.js?v=222';
import {createModule as createHome} from './runtime/home.js?v=222';
import {createModule as createAdventureWorld} from './runtime/adventure-world.js?v=222';
import {createModule as createCreative} from './runtime/creative.js?v=222';
import {createModule as createCrafting} from './runtime/crafting.js?v=222';
import {createModule as createBombs} from './runtime/bombs.js?v=222';
import {createModule as createLevelLifecycle} from './runtime/level-lifecycle.js?v=222';
import {createModule as createFeeding} from './runtime/feeding.js?v=222';
import {createModule as createExitBarriers} from './runtime/exit-barriers.js?v=222';
import {createModule as createSigns} from './runtime/signs.js?v=222';
import {createModule as createOpeningAdventure} from './runtime/opening-adventure.js?v=222';
import {createModule as createFamilyQuests} from './runtime/family-quests.js?v=222';
import {createModule as createCinematicAssets} from './runtime/cinematic-assets.js?v=222';
import {createModule as createCinematicStaging} from './runtime/cinematic-staging.js?v=222';
import {createModule as createCinematicAnimation} from './runtime/cinematic-animation.js?v=222';
import {createModule as createCinematicLifecycle} from './runtime/cinematic-lifecycle.js?v=222';
import {createModule as createCampaign} from './runtime/campaign.js?v=222';
import {createModule as createLeaderboard} from './runtime/leaderboard.js?v=222';
import {createModule as createHudPause} from './runtime/hud-pause.js?v=222';
import {createModule as createDisplayAudioMenu} from './runtime/display-audio-menu.js?v=222';
import {createModule as createInput} from './runtime/input.js?v=222';
import {createModule as createCameraFade} from './runtime/camera-fade.js?v=222';
import {createModule as createTreeRockCollisions} from './runtime/tree-rock-collisions.js?v=222';
import {createModule as createWorldCollisions} from './runtime/world-collisions.js?v=222';
import {createModule as createPlayerSupport} from './runtime/player-support.js?v=222';
import {createModule as createPlayerJump} from './runtime/player-jump.js?v=222';
import {createModule as createPlayerMovement} from './runtime/player-movement.js?v=222';
import {createModule as createSpawnSafety} from './runtime/spawn-safety.js?v=222';
import {createModule as createWorldAudits} from './runtime/world-audits.js?v=222';
import {createModule as createCollisionAudits} from './runtime/collision-audits.js?v=222';
import {createModule as createRockAudits} from './runtime/rock-audits.js?v=222';
import {createModule as createBranchAudits} from './runtime/branch-audits.js?v=222';
import {createModule as createMountedAudits} from './runtime/mounted-audits.js?v=222';
import {createModule as createAnimalForms} from './runtime/animal-forms.js?v=222';
import {createModule as createBoarShapes} from './runtime/boar-shapes.js?v=222';
import {createModule as createWallCollisions} from './runtime/wall-collisions.js?v=222';
import {createModule as createBoarNavigation} from './runtime/boar-navigation.js?v=222';
import {createModule as createBoarMotion} from './runtime/boar-motion.js?v=222';
import {createModule as createFriendMotion} from './runtime/friend-motion.js?v=222';
import {createModule as createBehaviorAudits} from './runtime/behavior-audits.js?v=222';
import {createModule as createRegressionAudit} from './runtime/regression-audit.js?v=222';
import {createModule as createQaInstall} from './runtime/qa-install.js?v=222';
import {createModule as createAdditionalAudits} from './runtime/additional-audits.js?v=222';
import {createModule as createQaStartup} from './runtime/qa-startup.js?v=222';
import {createModule as createBossVictory} from './runtime/boss-victory.js?v=222';
import {createModule as createCameraOcclusion} from './runtime/camera-occlusion.js?v=222';
import {createModule as createWorldHints} from './runtime/world-hints.js?v=222';
import {createModule as createGameInformation} from './runtime/game-information.js?v=222';
import {createModule as createGameLoop} from './runtime/game-loop.js?v=222';
import {createModule as createDream} from './runtime/dream.js?v=222';
import {createModule as createCreatures} from './runtime/creatures.js?v=222';
import {createModule as createNature} from './runtime/nature.js?v=222';
import {createModule as createMonsters} from './runtime/monsters.js?v=222';
import {createModule as createCheatMode} from './runtime/cheat-mode.js?v=222';
import {createModule as createSpiders} from './runtime/spiders.js?v=222';
import {createModule as createFrameSimulation} from './runtime/frame-simulation.js?v=222';

// Factories register live bindings before ordered initialization starts.
const runtime=createRuntime();
await initializeModules(runtime,[
 createFoundation(runtime),
 createRenderer(runtime),
 createMaterials(runtime),
 createForestGround(runtime),
 createSceneryLayout(runtime),
 createVillage(runtime),
 createBiomes(runtime),
 createStormState(runtime),
 createStormDamage(runtime),
 createLightningWeather(runtime),
 createLakeScenery(runtime),
 createCharacter(runtime),
 createWaterSurface(runtime),
 createTerrain(runtime),
 createRidingCombat(runtime),
 createAudioEffects(runtime),
 createMusic(runtime),
 createBoarModel(runtime),
 createForageSpawning(runtime),
 createFamilyModels(runtime),
 createPortalFlashlight(runtime),
 createSeasons(runtime),
 createWaterEffects(runtime),
 createFishing(runtime),
 createHome(runtime),
 createAdventureWorld(runtime),
 createCreative(runtime),
 createDream(runtime),
 createSpiders(runtime),
 createCreatures(runtime),
 createNature(runtime),
 createMonsters(runtime),
 createCheatMode(runtime),
 createCrafting(runtime),
 createBombs(runtime),
 createLevelLifecycle(runtime),
 createFeeding(runtime),
 createExitBarriers(runtime),
 createSigns(runtime),
 createOpeningAdventure(runtime),
 createFamilyQuests(runtime),
 createCinematicAssets(runtime),
 createCinematicStaging(runtime),
 createCinematicAnimation(runtime),
 createCinematicLifecycle(runtime),
 createCampaign(runtime),
 createLeaderboard(runtime),
 createHudPause(runtime),
 createDisplayAudioMenu(runtime),
 createInput(runtime),
 createCameraFade(runtime),
 createTreeRockCollisions(runtime),
 createWorldCollisions(runtime),
 createPlayerSupport(runtime),
 createPlayerJump(runtime),
 createPlayerMovement(runtime),
 createSpawnSafety(runtime),
 createWorldAudits(runtime),
 createCollisionAudits(runtime),
 createRockAudits(runtime),
 createBranchAudits(runtime),
 createMountedAudits(runtime),
 createAnimalForms(runtime),
 createBoarShapes(runtime),
 createWallCollisions(runtime),
 createBoarNavigation(runtime),
 createBoarMotion(runtime),
 createFriendMotion(runtime),
 createBehaviorAudits(runtime),
 createRegressionAudit(runtime),
 createQaInstall(runtime),
 createAdditionalAudits(runtime),
 createQaStartup(runtime),
 createBossVictory(runtime),
 createCameraOcclusion(runtime),
 createWorldHints(runtime),
 createGameInformation(runtime),
 createGameLoop(runtime),
 createFrameSimulation(runtime)
]);
