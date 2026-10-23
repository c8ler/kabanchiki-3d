# Game modules (v215)

The browser entry point is `src/game.js`. It imports small native ES modules
directly; no bundler, text concatenation, eval or generated game bundle is needed.

## Startup and ownership

Each factory in `src/runtime/` returns `bindings` and `initialize()`.
Factories only declare state/functions. First all bindings are registered;
then initializers run in the order listed in `src/game.js`. This preserves
the original creation order, including seeded random generation, scene objects,
input handlers and rendering warm-up.

Every state field/function has exactly one owner. Mutable state exposes a setter;
constants/functions expose only a getter. Replacing `friend`, `keys`, a level or
an array remains visible to all modules through the live runtime context.
`src/runtime/context.js` rejects duplicate bindings and unknown writes.
This explicit bridge replaces the previous shared lexical scope without copying
state or creating circular imports between game systems.

## Where to edit

| Feature | Modules |
| --- | --- |
| Scene, graphics, scenery | renderer, materials, forest-ground, scenery-layout, village, biomes |
| Player | character, player-support, player-jump, player-movement, riding-combat |
| Boars | boar-model, boar-shapes, wall-collisions, boar-navigation, boar-motion, friend-motion |
| Weather and terrain | storm-state, storm-damage, lightning-weather, seasons, terrain, water-surface |
| Food, fishing, crafting | forage-spawning, feeding, fishing, adventure-world, crafting, bombs, home |
| Campaign and exits | campaign, level-lifecycle, exit-barriers, signs, opening-adventure, family-quests |
| Movies | cinematic-assets, cinematic-staging, cinematic-animation, cinematic-lifecycle |
| UI, sound and input | hud-pause, display-audio-menu, input, leaderboard, audio-effects, music, game-information |
| Frame orchestration | game-loop, frame-simulation, camera-occlusion, world-hints |

Existing standalone rule/model modules in `src/` remain shared imports.
The full ownership/dependency map is `src/runtime/module-manifest.js`;
it is tooling metadata, not part of browser startup.

## Tests

`src/qa/` contains the browser robot facade in small scenario groups.
It is dynamically imported only with `?autotest=1` or `?openingtest=1`.
Do not move production logic into scenario modules.

Run `npm test` and `npm run validate`. Existing Playwright workflows cover
all six locations, boar navigation, collision, forms, crafting, menus and movies.
The architecture tests check module syntax, ownership, startup, source size and
local imports. Legacy source-contract tests use `scripts/game-source.mjs` to
read the actual module bodies, normalize runtime qualifications, and reconstruct
declaration markers next to their real initializer expressions.

When adding a state field, declare it in the owning factory, initialize it in
`initialize()`, and expose a getter (plus a setter only if it is mutable).
Keep factories free of side effects before `initialize()`.
When adding a runtime module, register it in `src/game.js`, the manifest and
the service worker's module list. Keep modules below 48 KB and split by feature.
