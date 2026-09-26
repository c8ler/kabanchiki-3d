import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const game=fs.readFileSync('src/game.js','utf8');
const levels=fs.readFileSync('levels/levels.js','utf8');
const checks=[
 ['version v86',/GAME_VERSION='v86'/.test(game)],
 ['precise rock footprint',/function rockFootprintHit/.test(game)],
 ['jump clears low rocks',/py>b.max.y/.test(game)],
 ['page audio suspension',/visibilitychange/.test(game)&&/audio.suspend/.test(game)],
 ['walking arm swing',/boy.children\[6\]\.rotation\.x/.test(game)],
 ['tree apples',/function appleTreeSpot\(\)/.test(game)&&/py>\.58/.test(game)],
 ['unified collision solver',/function movePlayerCollision\(mx,mz\)/.test(game)&&/function depenetratePlayer\(\)/.test(game)],
 ['collision audit',/function runCollisionAudit\(\)/.test(game)&&/__KABANCHIKI_COLLISION_AUDIT__/.test(game)],
 ['robot collision audit',/function runRobotCollisionTest\(\)/.test(game)&&/__KABANCHIKI_ROBOT_TEST__/.test(game)&&/robotAudit/.test(game)],
 ['branches use geometry collision',/circleHitsTreeGeometry/.test(game)&&/treeSolidMeshes/.test(game)],
 ['external game module',/src="\.\/src\/game\.js"/.test(html)],
 ['no giant inline game module',!/<script type="module">[\s\S]{5000,}<\/script>/.test(html)],
 ['five level metadata entries',(levels.match(/id:/g)||[]).length===5],
 ['forest remaster layer',/const forestVisual=new THREE.Group/.test(game)],
 ['layered forest ground',/const forestGround=new THREE.Group/.test(game)],
 ['organic tree geometry',/CylinderGeometry\(.46,.68,1,7\)/.test(game)],
 ['clustered tree crowns',/const crownN=Math.floor/.test(game)],
 ['instanced forest grass',/new THREE.InstancedMesh/.test(game)],
 ['cinematic tone mapping',/ACESFilmicToneMapping/.test(game)],
 ['Timur remaster',/boy\.userData\.visualRemaster=true/.test(game)],
 ['boar remaster',/g\.userData\.visualRemaster=true/.test(game)],
 ['boar tusks and ears',/tuskMat/.test(game)&&/ConeGeometry\(.19,.42,4\)/.test(game)],
 ['animated boar tail',/tailPivot\.rotation\.y/.test(game)],
 ['lake remaster layer',/const lakeVisual=new THREE.Group/.test(game)],
 ['animated lake ripples',/rippleA\.rotation\.z/.test(game)&&/waterRippleMatA\.opacity/.test(game)],
 ['lake lilies and reeds',/lilyMat/.test(game)&&/reedTipMat/.test(game)],
 ['lake sun glint',/const lakeGlint=new THREE.Mesh/.test(game)],
 ['game loop',/function loop\(now\)/.test(game)],
 ['friend portal persistence',/const carriedFriend=friend,carriedFriendHP=friendHP/.test(game)],
 ['difficulty system',/const DIFF_CONFIG=\[/.test(game)],
 ['automation hook',/__KABANCHIKI_TEST__/.test(game)],
 ['audio toggles',/toggleMusic/.test(html)&&/toggleSfx/.test(html)&&/musicEnabled/.test(game)&&/sfxEnabled/.test(game)],
 ['lake evening restored',/0xe59a78/.test(game)],
 ['global leaderboard config',game.includes('SUPABASE_URL')&&game.includes('submitGlobalResult')&&game.includes('globalStatsHtml')]
];
let bad=0;for(const [n,ok] of checks){console.log(`${ok?'✓':'✗'} ${n}`);if(!ok)bad++}
if(bad)process.exit(1);

