import fs from 'node:fs';
import {GAME_SOURCES} from '../src/runtime/module-manifest.js';

/** Read actual module implementations for legacy text/function contract tests.
 * Normalize the shared-scope qualification and initializer declaration markers.
 * No archived monolith or generated browser bundle is used.
 */
export function readGameSource(){
 return GAME_SOURCES.map(path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8')
  .replace(/\b([A-Za-z_$][\w$]*): runtime\.\1\b/g,'$1')
  .replace(/\bruntime\./g,'')
  .replace(/\/\* init:(const|let|var) \*\/ (\w+) = /g,'$1 $2=')
 ).join('\n');
}
