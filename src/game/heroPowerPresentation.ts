import type {Hero} from '../types/game';
import {schoolForSuit} from './spellPresentation';
export type HeroPowerTarget={id:string;type:'gold_blast'|'heal'|'pierce';label:string};
/** Describes existing royal powers; no cards are created and no balance is changed. */
export function heroPowerPresentation(hero:Hero){
 return {school:schoolForSuit(hero.suit),title:hero.rank==='K'?'Reforços da Coroa':hero.rank==='Q'?'Cálice de Copas':'Investida Titânica',
  summary:hero.rank==='K'?'Até 2 cartas · +2 ATQ':hero.rank==='Q'?'Restaura até 4 de vida por aliado':'5 de dano direto · +1 energia',
  needsEnemy:hero.rank==='J'};
}
export function heroPowerTargets(hero:Hero,allies:Hero[],enemy?:Hero):HeroPowerTarget[]{
 if(hero.rank==='J')return enemy?.isAlive?[{id:enemy.id,type:'pierce',label:'−5 INVESTIDA'}]:[];
 if(hero.rank==='K')return [{id:hero.id,type:'gold_blast',label:'+2 ATQ · REFORÇOS'}];
 const targets:HeroPowerTarget[]=allies.filter(h=>h.isAlive&&h.currentHp<h.maxHp).map(h=>({id:h.id,type:'heal',label:`+${Math.min(4,h.maxHp-h.currentHp)} VIDA`}));
 return targets.length?targets:[{id:hero.id,type:'heal',label:'VIDA NO MÁXIMO'}];
}
