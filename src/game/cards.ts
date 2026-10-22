import type { ActionCard, Hero } from '../types/game';

export type Ability = { damage?: number; heal?: number; shield?: number; energy?: number; draw?: number; attack?: number; defense?: number; glory?: number; steal?: number; all?: boolean; weakest?: boolean; temporary?: boolean };
const abilities: Record<string, Ability[]> = {
  espadas: [{damage:2},{shield:3},{draw:1,attack:1,temporary:true},{shield:4},{damage:3},{energy:2},{damage:4},{shield:5,defense:1},{draw:2},{damage:5}],
  copas: [{heal:2,weakest:true},{heal:2,shield:2},{heal:2,all:true},{shield:3,heal:2},{heal:4},{heal:3,energy:1},{heal:4,draw:1},{shield:4,all:true},{heal:5},{heal:4,shield:3,all:true}],
  paus: [{energy:1,attack:1,temporary:true},{shield:3},{energy:2},{shield:4},{damage:3},{damage:3,energy:1},{damage:4},{shield:5,defense:1},{energy:3},{damage:5,glory:1}],
};
export function abilityFor(card: ActionCard): Ability {
  const id = card.templateId || card.id;
  if (id === 'card_coringa_liberdade') return {attack:3,shield:3,steal:1};
  if (id === 'card_coringa_oportunidade') return {heal:4,shield:4,glory:1};
  if (card.rank === 'A') return ({espadas:{draw:2,energy:1},copas:{heal:3,shield:3,all:true},ouros:{glory:2},paus:{energy:3}} as Record<string,Ability>)[card.suit] || {};
  return abilities[card.suit]?.[Number(card.rank)-1] || {};
}
export function targetFor(card: ActionCard): 'enemy' | 'ally' | 'board' {
  const a = abilityFor(card);
  return a.damage ? 'enemy' : a.all || a.weakest || (!a.heal && !a.shield && !a.attack && !a.defense) ? 'board' : 'ally';
}
export function makeDeck(templates: ActionCard[]): ActionCard[] {
  const opening = ['card_coringa_liberdade','card_5_espadas','card_2_copas'];
  const ordered = [...opening.map(id=>templates.find(c=>c.id===id)!).filter(Boolean), ...templates.filter(c=>!opening.includes(c.id))];
  return [...ordered, ...templates, ...templates].map((c,i)=>({...c,templateId:c.id,id:`${c.id}__${i}`}));
}
export function resolveCard(card: ActionCard, allies: Hero[], enemies: Hero[], allyId: string, enemyId?: string) {
  const a = abilityFor(card);
  let targetId = allyId;
  if (a.weakest) targetId = allies.filter(h=>h.isAlive).sort((x,y)=>(y.maxHp-y.currentHp)-(x.maxHp-x.currentHp))[0]?.id;
  const nextAllies = allies.map(h=> !h.isAlive || (!a.all && h.id!==targetId) ? {...h} : ({...h,
    currentHp: Math.min(h.maxHp,h.currentHp+(a.heal||0)), shield:h.shield+(a.shield||0),
    atk:h.atk+(a.attack||0), def:h.def+(a.defense||0), temporaryAttack:(h.temporaryAttack||0)+(a.temporary?(a.attack||0):0),
  }));
  let killGlory=0;
  const nextEnemies = enemies.map(h=>{
    if (!a.damage || h.id!==enemyId || !h.isAlive) return {...h};
    const hp=Math.max(0,h.currentHp-a.damage);
    if(hp===0) killGlory=2;
    return {...h,currentHp:hp,isAlive:hp>0};
  });
  return {allies:nextAllies,enemies:nextEnemies,ability:a,killGlory};
}
