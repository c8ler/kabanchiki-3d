/**
 * Shared live bindings during the migration from a single lexical scope.
 * Each binding has one owner. Other modules use getters/setters, so updates to
 * level, friend, player state and other replaced objects are visible immediately.
 */
export function createRuntime(){return Object.create(null)}
export async function initializeModules(runtime,modules){
 const registered=new Set();
 for(const module of modules){
  for(const name of Object.keys(module.bindings)){
   if(registered.has(name))throw new Error('Duplicate game binding: '+name);
   registered.add(name);
  }
  Object.defineProperties(runtime,module.bindings);
 }
 Object.preventExtensions(runtime);
 for(const module of modules){
  const result=module.initialize();
  if(result&&typeof result.then==='function')await result;
 }
 return runtime;
}
