import type {ActionCard,Hero,Element} from '../types/game';
export type SpellVariant='elemental-barrier'|'fireball'|'tidal-wave'|'healing-spring'|'stone-armor'|'earth-eruption'|'tornado'|'wind-blades'|'forest-renewal';
const CARD_VARIANTS:Record<string,SpellVariant>={elemental_fire:'fireball',elemental_wave:'tidal-wave',elemental_water:'healing-spring',elemental_earth:'stone-armor',elemental_eruption:'earth-eruption',elemental_tornado:'tornado',elemental_air:'wind-blades'};
export function elementalVariant(element?:Element,type?:string):SpellVariant {
 if(type==='shield')return element==='terra'?'stone-armor':'elemental-barrier';
 if(type==='heal')return element==='terra'?'forest-renewal':'healing-spring';
 return element==='fogo'?'fireball':element==='agua'?'tidal-wave':element==='terra'?'earth-eruption':'wind-blades';
}
export function spellVariantFor(card:ActionCard):SpellVariant{return CARD_VARIANTS[card.templateId||card.id]||elementalVariant(card.element);}
export function creatureVariantFor(hero:Hero,type:string):SpellVariant{return elementalVariant(hero.element,type);}
export type CreatureStatus={id:'stunned'|'attack-down'|'defense-down'|'attack-up';label:string;description:string};
/** Status badges describe real pending gameplay modifiers, never cosmetic debuffs. */
export function creatureStatuses(hero:Hero):CreatureStatus[]{
 if(!hero.isAlive)return [];
 const statuses:CreatureStatus[]=[];
 if(hero.stunned)statuses.push({id:'stunned',label:'ATAQUE IMPEDIDO',description:'Não pode atacar neste turno. Termina após o turno desta corte.'});
 if(hero.temporaryAttackReduction)statuses.push({id:'attack-down',label:`−${hero.temporaryAttackReduction} ATQ`,description:'Ataque reduzido até o fim do turno desta corte.'});
 if(hero.temporaryDefenseReduction)statuses.push({id:'defense-down',label:`−${hero.temporaryDefenseReduction} DEF`,description:'Defesa reduzida até o fim do turno desta corte.'});
 if(hero.temporaryAttack)statuses.push({id:'attack-up',label:`+${hero.temporaryAttack} ATQ`,description:'Ataque aumentado até o início da próxima rodada.'});
 return statuses;
}
