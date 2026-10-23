import type { Hero } from '../types/game';
export type CharacterAction = 'idle'|'attack'|'cast'|'guard'|'hurt';
export const CHARACTER_ROWS: Record<string,number> = {p_rei_espadas:0,p_rainha_copas:1,p_valete_paus:2,r_rei_ouros:3,r_rainha_paus:4,r_valete_copas:5};
export const CHARACTER_EVENT='royal-character-action';
export type CharacterCue={heroId:string;action:CharacterAction};
export function cueCharacter(elementId:string,action:CharacterAction){
  const heroId=elementId.replace(/^hero-card-/,'');
  if(heroId in CHARACTER_ROWS) window.dispatchEvent(new CustomEvent<CharacterCue>(CHARACTER_EVENT,{detail:{heroId,action}}));
}
export function attackFlavor(hero: Pick<Hero,'suit'|'rank'>): 'blade'|'flame'|'coin'|'heart'|'thorn'{
  return hero.suit==='espadas'?'blade':hero.suit==='ouros'?'coin':hero.suit==='copas'?'heart':hero.rank==='Q'?'thorn':'flame';
}
