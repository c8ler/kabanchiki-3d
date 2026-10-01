## Облик кабанчика, коллизии и мелководье

После жёлтой ягоды можно кормить других кабанов и получать друга. Пока Тимур кабанчик, враги не преследуют его, не принимают атакующую позу и босс не стреляет в него. После окончания превращения обычное поведение возвращается.

Коллизии учитывают вытянутый корпус, голову, заднюю часть и масштаб босса. Проверяются промежуточные точки движения, повороты и отдача; проникновение в стволы и Тимура исправляется до отрисовки кадра.

Кабаны заходят только на мелководье: максимальная глубина у края тела 0.35 м. Более глубокие позиции разрешают движение к берегу; случайное попадание в глубину исправляется. Ограничение применяется также к другу, убегающим кабанам, верховой езде и облику Тимура-кабанчика.

Проверки: node --test tests/boar-physics.mjs tests/movement-geometry.mjs tests/adaptive-quality.mjs. Runtime-проверка boarBehaviorAudit включена в autotest.

## Горы и кабанчик-друг

Горы используют выпуклый контур видимой геометрии с отсечением подземного основания. Общий круг с дополнительным запасом больше не блокирует пустое пространство у склона. Проверяется движение пешком и верхом.

Друг заранее замечает приближение Тимура, выбирает свободную сторону и плавно отходит с разгоном до 6.8 м/с. Старые покадровые толчки и мгновенное выталкивание удалены. При отходе друг не переключается на следование или бой, которые раньше могли двигать его в обратную сторону.

Проверки: node --test tests/movement-geometry.mjs tests/adaptive-quality.mjs. Runtime-аудиты формы гор и отхода друга включены в autotest.

## Автоматическая графика

Четыре уровня качества. Разрешение, тени, трава, дождь и облака автоматически упрощаются при устойчивых просадках FPS. Возврат качества происходит медленно, с минутной задержкой после снижения. Пауза, скрытая вкладка и длинные остановки не участвуют в оценке. На телефоне тени отключены. Текущий уровень виден рядом с FPS и в меню паузы. Тесты: node --test tests/adaptive-quality.mjs.

# Графика по референсу — v147, проход 1

Тёплый направленный свет, градиентное небо, мягкий солнечный ореол, матовые материалы и тени 2048 на ПК. Кубические кроны, более густая трава, детали лица и одежды Тимура, объёмные пряди шерсти кабанов, красные светящиеся глаза врагов. После кормления красное свечение исчезает. Портал теперь оформлен как каменная арка с рунами и фиолетовым свечением.

Исходные файлы сохранены в backups/graphics-v147. Снимки и результаты проверок — в screenshots. Проверка: node scripts/validate.mjs; runtime-аудиты: ?autotest=1&level=1..5. Материалы и эффекты создаются кодом, дополнительных загрузок ассетов нет.

# Kabanchiki 3D v138 — Storm Lightning & Burn Remains

- Weather now builds progressively more clouds; stronger wind drives them faster.
- Lightning timing is randomized and lights the whole sky/world, not just exposure.
- From minute 4, lightning can strike trees, ordinary village houses, and fallen logs.
- Struck scenery burns for 10 seconds. Trees leave rounded charred stumps with broken limbs; houses leave irregular charred posts/beams and ash rather than cube debris.
- Boss-fire tree remains use the same improved non-cubic charred geometry.

## v134
Миньоны убегают после первого удара; огонь опасен и оставляет обгоревшие пни; верховая езда сохраняется между локациями; физическая глубина озера и удушье; семья не спавнится в озере; погодная эскалация 1–5 минут.

# Kabanchiki 3D v131 — Dad House Real Cutaway

Dad house uses separate walls, roof and floor. Entering hides only the camera-facing wall and roof. Exterior window and porch lamp glow from village load; warm point lights stay active. Dad is deeper inside and the house is fixed at (30, -31).

# Кабанчики 3D v79 — Collision Autotest

- Коллизия деревьев теперь строится по реальной геометрии ствола и каждой низкой ветки, а не по одному кругу вокруг дерева.
- Collision audit проверяет видимые стволы/ветки и передаёт ошибки в `window.__KABANCHIKI_TEST__.errors`, поэтому GitHub Actions блокирует runtime-тест при такой регрессии.
- Вторая локация снова вечерняя: тёплое небо, солнце и более мягкая экспозиция.
- В меню паузы перенесены смена камеры, перезапуск, полноэкранный режим, отдельные переключатели музыки и звуков. На игровом экране оставлены только меню/пауза и полноэкранный режим.
- Настройки музыки и звуков сохраняются в localStorage.

Автотест: `?autotest=1&level=1..5`. Состояние доступно через `window.__KABANCHIKI_TEST__`, включая `collisionAudit`.


## v79
- Камни: точный XZ-footprint по реальному bounding box каждого mesh вместо большого общего круга.
- Прыжок позволяет пересечь камень, когда ноги Тимура выше фактической верхушки камня.
- Автовыталкивание из камней использует тот же точный footprint.
- Руки Тимура слегка качаются в противофазе при ходьбе.
- WebAudio при visibilitychange/pagehide/blur немедленно suspend; при возврате корректно resume. Это убирает звук игры при сворачивании и помогает Android отдавать аудиофокус телефонному звонку.

## v108 autotest pipeline
v105 adds explicit collisionAudit + robotAudit reporting. Important: the repository's Auto Update workflow must dispatch web-check.yml *after* it publishes the ZIP, otherwise GitHub tests the pre-update commit. Files `auto-update-v105.yml` and `.github/workflows/web-check.yml` contain the corrected workflows.


## v105
Spawn Guard repairs and audits boar, friend, ground forage and family start positions after level geometry visibility is finalized. Loading screen shows the game version in small text.


## v108
Cache/version sync hardened; trunk collision uses cylindrical footprint; apple twigs are registered and apples are placed at reachable twig tips.


## v108
Mounted boar now uses a dedicated visible-body rock radius; real-rock audit rejects penetration while allowing legitimate sliding around rounded stones.


## v110
Robot rock probes now use the same rotated rounded ellipse as gameplay instead of a world Box3. Walk-in, escape and above-rock probes are aligned to the real collision normal; mounted penetration checks remain unchanged.


## v111 — Tree Branch Apples
Яблоки создаются только на деревьях: видимая плодовая веточка крепится к существующей ветке того же дерева, а позиция яблока вычисляется из фактического world-space конца веточки. Runtime-аудит проверяет принадлежность дереву и геометрический зазор яблоко↔ветка.


## v112 — Visible Tree Apples
- Видимость деревьев текущей локации рассчитывается до генерации еды.
- Яблоко допускается только на собственной плодовой веточке видимого дерева.
- Repair сохраняет новую веточку и дерево, а не старую исходную ветку.
- Runtime-аудит выдаёт `apple-hidden-tree`, если дерево яблока скрыто.


## v113 — Reachable Tree Apples
- Каждое яблоко создаётся только на собственной видимой плодовой веточке видимого дерева.
- Плодовая ветка крепится непосредственно к стволу на гарантированно достижимой высоте; высота больше 2.08 отклоняется ещё до появления яблока.
- Runtime-аудит `apple-too-high` сохранён и остаётся блокирующим: тест не маскирует недостижимые яблоки.
- Версия HTML, build marker и cache-buster синхронизированы на v113.


## v114 — House Reveal + Window Fix
- Дом с папой становится прозрачным сразу при пересечении дверного проёма, до спасения папы.
- Светящееся окно теперь является дочерней геометрией самого дома и совпадает с реальным окном фасада; отдельное висящее окно удалено.
- World Integrity проверяет прозрачность в дверном проёме и привязку окна к дому.


## v115 — Collision Stability
- Mounted rock depenetration now uses the boar/rider body radius, preventing neighbouring scenery from pushing the mounted body into a rock.
- Collision Audit no longer reports random `sealed-mountain`/`sealed-lair` failures for intentionally clustered scenery; Spawn Guard and geometry-aware rock/tree tests remain active.
- Existing house, apple, robot, rock-climb and mounted penetration tests remain enabled.


## v118 — Foot Rock Climb Isolation
- Mounted rock depenetration keeps the v115 boar-body radius.
- On-foot depenetration again respects ballistic jump clearance, so Timur can enter a reachable rock footprint while airborne and land naturally on top.
- Validator checks that mounted and on-foot rock rules stay separated.


## v118 — Mounted cluster stability
- Keeps the v117 lake/apple/road rules.
- Resolves neighbouring rock overlaps after every mounted swept movement slice.
- Extra depenetration passes apply only while riding; on-foot v116 rock climbing stays jump-aware.


## v120 — Family & Hideout Randomization
- Dad is explicitly role 1 and always spawns inside the enterable hideout.
- The hideout chooses one of four safe village plots each run; its warm window stays parented to the house.
- Entering the doorway/room makes the house transparent before Dad is collected.
- Other family members use randomized safe off-road positions on their assigned maps.
- Runtime family placement audit checks Dad, doorway reveal, road clearance and obstacle clearance.


## v121 — Branch Traversal + All Global Results
- Fallen branches remain non-blocking during normal movement, while their low capsule top supplies a physical step/bump under Timur.
- Branch traversal audit now performs real swept movement across generated branches instead of only calling the collision predicate at one point.
- Global leaderboard submission now accepts both victories and failed/incomplete runs using the existing leaderboard schema (score, time, difficulty, family, version).
- Duplicate submission protection remains active.


## v123 — Branch Physics
- Branch traversal audit runs only in the forest and crosses each fallen branch perpendicular to its capsule.
- Runtime movement now lifts Timur onto the visible low branch while walking across it, preserving normal jumping.
- Audit requires multiple clear generated branch samples and verifies both crossing and visible vertical bump.


## v123 — Occlusion + Lit Dad Hideout
- Dad's hideout becomes transparent immediately when Timur crosses the doorway/house shell.
- The hideout keeps a bright warm window and point light while its walls are transparent.
- Houses, trees, rocks and cliffs between the camera and Timur fade automatically, then restore.
- Runtime occlusion audit checks fade/restore and Dad-house light/transparency.


## v124 — Cache Sync
- The game module URL now uses the same v124 build number as GAME_VERSION and the HTML build marker.
- Validator now fails if GAME_VERSION, HTML build marker, and game.js cache-buster ever diverge.


## v125 — Boss Finale
- Defeating the boss immediately starts a 5-second victory celebration even if minions are alive.
- Boss minions flee, fireworks burst over the lair, then the outro starts automatically.
- Boss throws fireballs from the start of the fight and has stronger red/orange lighting.
- The moon is bright and visible in the boss arena.
- Unrescued family members turn to face Timur.


## v126 — Minion Combat
- Boss minions keep the peaceful feeding/friend route.
- A friendly boar can also drive a boss minion away with three hits, on foot or while mounted.
- Each hit flashes the minion aura, knocks it back and briefly staggers it; at 0/3 HP it flees instead of dying.
- Validator covers both combat paths and preserves boss/minion stat separation.


## v131
- Swapped level 2/3 weather progression so the lake is brighter than the village.
- Added visible gallop/bounce animation while Timur rides a boar.
- Fleeing boars persist until they cross the map boundary.
- Family hideout now has a visible open door; window is wall-anchored and turns transparent from inside; brother/father placements swapped.
- Lake center reads deeper.
- Boss minions fall in one hit; boss requires 10 hits.
- Boss fire makes trees burn brighter and then burn away completely.


## v135
- Dad family marker raised above his head.
- Boss minions enter explicit flee state on the first friendly-boar hit and run to the map boundary.
- Boars avoid the deep centre of the lake while still using the shallow rim.
- Escalating weather now sways trees, sheds leaves, increases rain density, applies headwind resistance, blows fallen logs and ground food, and ends with a scripted hurricane carry beyond the map.

## v139
- Burning storm objects damage Timur nearby; active storm fires are cleared on location change.
- 1/20 yellow berries: Timur becomes a boar for 30 seconds, can only walk and collect ground items, enemies ignore him.
- 1/20 yellow fly agarics: stored special feed colors a boar/boss yellow for 30 seconds.
- 1/20 yellow apples: collecting one doubles its tree height.
- Bonus items use a new comic sound.
- HUD timer moved to bottom: total run time + current location time.


## v140
- Storm/fire state is isolated per location. Lightning targets are tagged with a world epoch, and all temporary burn materials, flames, lights and charred remains are restored/removed before the next map loads.
- Prevents red/burned trees from leaking into later locations.

## v141
- Fixed forage Y bug: mushrooms, cabbage and berries are always spawned on ground level.
- Apples are anchored to visible tree twigs at 2.05–2.08 m, above Timur but reachable by jump.
- Yellow berry, mushroom and apple bonuses now use an explicit 1/20 chance; fixed the berry/mushroom bonus flag bug.
- Added runtime forage placement audit and validation checks.


## v144
- Yellow berry chance increased from 1/20 to 1/10. Yellow mushrooms and yellow apples remain 1/20.


## v145
- Music reworked into darker late-90s/early-00s techno: muted low-pass synths, deeper bass and tracker-style kick/noise drums.
- Removed bright square-wave/chiptune lead character from location music.


## v146
- Raised the dark retro-techno mix roughly 1.7–2x across lead, bass, pads and tracker drums while preserving the muted low-pass sound.


## Обновление озера, кормления и грозы

- Камни на берегу озера используют ту же физику, что остальные камни.
- Убегающие кабаны проходят через препятствия и покидают карту без остановок.
- Жёлтый гриб навсегда окрашивает кабана и работает как обычная еда: создаёт друга, лечит друга или успокаивает босса.
- С 3:00 молнии бьют каждые 20 секунд игрового времени. Видимый разряд попадает в дерево, дом или камень; камни чернеют без пожара и сохраняют коллизию. Пауза останавливает отсчёт.

После атаки кабанчика-друга босс отшвыривает его на 4 метра с плавным замедлением. Препятствия ограничивают отбрасывание. Верхом Тимур отлетает вместе с другом; движение и повторные атаки приостанавливаются на время отбрасывания.
