import type { ActionCard, Hero } from '../types/game';

export type Ability = { enemyAll?: boolean; splash?: number; attackDown?: number; defenseDown?: number; stun?: boolean; damage?: number; heal?: number; shield?: number; energy?: number; draw?: number; attack?: number; defense?: number; glory?: number; steal?: number; all?: boolean; weakest?: boolean; temporary?: boolean };
const abilities: Record<string, Ability[]> = {
  espadas: [{damage:2},{shield:3},{draw:1,attack:1,temporary:true},{shield:4},{damage:3},{energy:2},{damage:4},{shield:5,defense:1},{draw:2},{damage:5}],
  copas: [{heal:2,weakest:true},{heal:2,shield:2},{heal:2,all:true},{shield:3,heal:2},{heal:4},{heal:3,energy:1},{heal:4,draw:1},{shield:4,all:true},{heal:5},{heal:4,shield:3,all:true}],
  paus: [{energy:1,attack:1,temporary:true},{shield:3},{energy:2},{shield:4},{damage:3},{damage:3,energy:1},{damage:4},{shield:5,defense:1},{energy:3},{damage:5,glory:1}],
};
export function abilityFor(card: ActionCard): Ability {
  const id = card.templateId || card.id;
  const elemental: Record<string, Ability> = {elemental_fire:{damage:4},elemental_water:{heal:4},elemental_earth:{shield:4,defense:1},elemental_air:{damage:6},elemental_wave:{damage:3,enemyAll:true,attackDown:1},elemental_eruption:{damage:4,defenseDown:2},elemental_tornado:{damage:4,stun:true}};
  if (elemental[id]) return elemental[id];
  if (id === 'card_coringa_liberdade') return {attack:3,shield:3,steal:1};
  if (id === 'card_coringa_oportunidade') return {heal:4,shield:4,glory:1};
  if (card.rank === 'A') return ({espadas:{draw:2,energy:1},copas:{heal:3,shield:3,all:true},ouros:{glory:2},paus:{energy:3}} as Record<string,Ability>)[card.suit] || {};
  return abilities[card.suit]?.[Number(card.rank)-1] || {};
}
export function targetFor(card: ActionCard): 'enemy' | 'ally' | 'board' {
  const a = abilityFor(card);
  return a.enemyAll ? 'board' : a.damage ? 'enemy' : a.all || a.weakest || (!a.heal && !a.shield && !a.attack && !a.defense) ? 'board' : 'ally';
}
export function makeDeck(templates: ActionCard[]): ActionCard[] {
  if (templates.length && templates.every(card => card.element)) return Array.from({length:34},(_,i)=>({...templates[i%templates.length],templateId:templates[i%templates.length].id,id:`${templates[i%templates.length].id}__${i}`}));
  const opening = ['card_coringa_liberdade','card_5_espadas','card_2_copas'];
  const ordered = [...opening.map(id=>templates.find(c=>c.id===id)!).filter(Boolean), ...templates.filter(c=>!opening.includes(c.id))];
  return [...ordered, ...templates, ...templates].map((c,i)=>({...c,templateId:c.id,id:`${c.id}__${i}`}));
}
export function resolveCard(card: ActionCard, allies: Hero[], enemies: Hero[], allyId: string, enemyId?: string) {
  return resolveAbility(abilityFor(card),allies,enemies,allyId,enemyId);
}
export function resolveAbility(a: Ability, allies: Hero[], enemies: Hero[], allyId: string, enemyId?: string) {
  let targetId = allyId;
  if (a.weakest) targetId = allies.filter(h=>h.isAlive).sort((x,y)=>(y.maxHp-y.currentHp)-(x.maxHp-x.currentHp))[0]?.id;
  const nextAllies = allies.map(h=> !h.isAlive || (!a.all && h.id!==targetId) ? {...h} : ({...h,
    currentHp: Math.min(h.maxHp,h.currentHp+(a.heal||0)), shield:h.shield+(a.shield||0),
    atk:h.atk+(a.attack||0), def:h.def+(a.defense||0), temporaryAttack:(h.temporaryAttack||0)+(a.temporary?(a.attack||0):0),
  }));
  let killGlory=0;
  const nextEnemies = enemies.map(h=>{
    if (!h.isAlive) return {...h};
    const affected = a.enemyAll || h.id===enemyId;
    const damage = affected ? (a.damage||0) : (a.splash||0);
    const hp=Math.max(0,h.currentHp-damage);
    if(hp===0) killGlory+=2;
    const attackLoss=affected?Math.min(h.atk,a.attackDown||0):0;
    const defenseLoss=affected?Math.min(h.def,a.defenseDown||0):0;
    return {...h,currentHp:hp,isAlive:hp>0,atk:h.atk-attackLoss,def:h.def-defenseLoss,
      temporaryAttackReduction:(h.temporaryAttackReduction||0)+attackLoss,
      temporaryDefenseReduction:(h.temporaryDefenseReduction||0)+defenseLoss,
      stunned:h.stunned||!!(affected&&a.stun)};
  });
  return {allies:nextAllies,enemies:nextEnemies,ability:a,killGlory};
}


/** Expire effects after the affected court has had its turn. */
export function expireElementalEffects(hero: Hero): Hero {
 return {...hero,atk:hero.atk+(hero.temporaryAttackReduction||0),def:hero.def+(hero.temporaryDefenseReduction||0),temporaryAttackReduction:0,temporaryDefenseReduction:0,stunned:false};
}
export function creaturePower(caster: Hero, allies: Hero[], enemies: Hero[], enemyId?: string) {
 const ability: Ability = caster.id==='r_rei_ouros'?{damage:4,splash:1}:caster.id==='r_rainha_paus'?{damage:3}:caster.id==='p_rei_espadas'?{damage:3,attack:1,temporary:true}:caster.id==='r_valete_copas'?{shield:2}:caster.rank==='J'?{damage:5,energy:1}:{heal:4,all:true};
 // Resolve through the same targeting and damage rules as action cards.
 const result=resolveAbility(ability,allies,enemies,caster.id,enemyId);
 if(caster.id==='r_rainha_paus') result.enemies=result.enemies.map(h=>{if(!h.isAlive)return h;const loss=Math.min(1,h.atk);return {...h,atk:h.atk-loss,temporaryAttackReduction:(h.temporaryAttackReduction||0)+loss};});
 if(caster.id==='r_valete_copas') {const ally=allies.find(h=>h.isAlive&&h.id!==caster.id);if(ally)result.allies=result.allies.map(h=>h.id===ally.id?{...h,shield:h.shield+1}:h);}
 return result;
}
