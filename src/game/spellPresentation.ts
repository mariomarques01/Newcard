import type {ActionCard,Hero} from '../types/game';
import {abilityFor} from './cards';

export function schoolForSuit(suit:ActionCard['suit']):ArcaneSchool {
  return suit==='espadas'?'steel':suit==='copas'?'nature':suit==='ouros'?'solar':suit==='paus'?'storm':'wild';
}

/** Pure presentation metadata so spell theming never changes game balance. */
export type ArcaneSchool='steel'|'nature'|'solar'|'storm'|'wild';
export type SpellPresentation={school:ArcaneSchool; title:string; announcement:string; tone:string; intensity:'normal'|'legendary'};
export function spellPresentation(card:ActionCard):SpellPresentation {
  const ability=abilityFor(card);
  const school:ArcaneSchool=schoolForSuit(card.suit);
  const tone=({steel:'#8bdcff',nature:'#79efb4',solar:'#ffcf68',storm:'#bb93ff',wild:'#ff9edb'} as const)[school];
  const verb=ability.damage?'Golpe Arcano':ability.heal?'Restauração':ability.shield?'Proteção':ability.energy?'Convergência':ability.glory?'Glória Real':'Encantamento';
  return {school,title:card.skillName||card.name,announcement:verb,tone,intensity:card.rank==='A'||card.type==='joker'?'legendary':'normal'};
}
export function heroCombatState(hero:Hero):'fallen'|'critical'|'wounded'|'healthy' {
  if(!hero.isAlive||hero.currentHp<=0)return 'fallen';
  const ratio=hero.maxHp>0?hero.currentHp/hero.maxHp:0;
  return ratio<=.34?'critical':ratio<=.67?'wounded':'healthy';
}
