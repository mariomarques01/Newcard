import type {ActionCard,Hero,Element} from '../types/game';
import {abilityFor} from './cards';
export type ArcaneSchool=Element;
export const ELEMENT_TONES: Record<Element,string>={fogo:'#ff771e',agua:'#38cfff',terra:'#82d34c',ar:'#c4eaff'};
export function isElement(value:unknown):value is Element {return value==='fogo'||value==='agua'||value==='terra'||value==='ar';}
export function schoolForElement(element?:Element):Element {
 if(!isElement(element))throw new Error('Efeitos exigem uma carta ou criatura elemental.');
 return element;
}
export type SpellPresentation={school:Element;title:string;announcement:string;tone:string;intensity:'normal'|'legendary'};
export function spellPresentation(card:ActionCard):SpellPresentation {
 const school=schoolForElement(card.element),ability=abilityFor(card);
 return {school,title:card.skillName||card.name,announcement:ability.damage?'Ataque Elemental':ability.heal?'Restauração':ability.shield?'Proteção Elemental':'Habilidade Elemental',tone:ELEMENT_TONES[school],intensity:'normal'};
}
export function heroCombatState(hero:Hero):'fallen'|'critical'|'wounded'|'healthy' {
 if(!hero.isAlive||hero.currentHp<=0)return 'fallen';
 const ratio=hero.maxHp>0?hero.currentHp/hero.maxHp:0;
 return ratio<=.34?'critical':ratio<=.67?'wounded':'healthy';
}
