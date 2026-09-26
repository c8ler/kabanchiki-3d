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

## v89 autotest pipeline
v89 adds explicit collisionAudit + robotAudit reporting. Important: the repository's Auto Update workflow must dispatch web-check.yml *after* it publishes the ZIP, otherwise GitHub tests the pre-update commit. Files `auto-update-v89.yml` and `.github/workflows/web-check.yml` contain the corrected workflows.


## v89
Spawn Guard repairs and audits boar, friend, ground forage and family start positions after level geometry visibility is finalized. Loading screen shows the game version in small text.
