import type {Hero} from '../types/game';
export const EVOLUTION_ACTIONS=3;
export const EVOLUTION_ATTACK_BONUS=1;
export const EVOLUTION_SHIELD_BONUS=2;
export function evolutionCharge(hero:Hero):number{
 if(hero.evolved)return EVOLUTION_ACTIONS;
 const charge=hero.evolutionCharge;
 return typeof charge==='number'&&Number.isFinite(charge)?Math.max(0,Math.min(EVOLUTION_ACTIONS,Math.floor(charge))):0;
}
/** Apply exactly once, only to the living actor of a successfully resolved action. */
export function advanceEvolution(court:Hero[],actorId:string):{heroes:Hero[];awakened?:Hero}{
 let awakened:Hero|undefined;
 const heroes=court.map(hero=>{
  if(hero.id!==actorId||!hero.isAlive||hero.evolved)return hero;
  const charge=Math.min(EVOLUTION_ACTIONS,evolutionCharge(hero)+1);
  const evolved=charge===EVOLUTION_ACTIONS;
  const next={...hero,evolutionCharge:charge,evolved,
   atk:hero.atk+(evolved?EVOLUTION_ATTACK_BONUS:0),
   shield:hero.shield+(evolved?EVOLUTION_SHIELD_BONUS:0)};
  if(evolved)awakened=next;
  return next;
 });
 return {heroes,awakened};
}
