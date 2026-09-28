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


## v117 — Foot Rock Climb Isolation
- Mounted rock depenetration keeps the v115 boar-body radius.
- On-foot depenetration again respects ballistic jump clearance, so Timur can enter a reachable rock footprint while airborne and land naturally on top.
- Validator checks that mounted and on-foot rock rules stay separated.
