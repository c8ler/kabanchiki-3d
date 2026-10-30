import { installGameInformation } from "../game-information.js?v=221";
import { cinematicScore } from "../music-player.js?v=221";

// Owns 1 bindings. See docs/architecture.md for startup order.
export function createModule(runtime){
 let gameInformation;

 return {
  bindings:{
"gameInformation":{get:()=>gameInformation}
  },
  initialize(){


/* init:const */ gameInformation = installGameInformation({onOpen:()=>{if(runtime.started)runtime.setPause(true);runtime.keys={}},playMusic:()=>{runtime.stopMusic();if(runtime.musicEnabled)runtime.ensureMusicPlayer().play('creators',cinematicScore('outro',runtime.HAPPY_CINE_NOTES))},stopMusic:()=>{runtime.musicPlayer?.stop();runtime.startMusic()}});
  }
 };

}
