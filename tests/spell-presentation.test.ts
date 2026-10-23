import test from 'node:test';
import assert from 'node:assert/strict';
import {spellPresentation,heroCombatState} from '../src/game/spellPresentation';
import type {ActionCard,Hero} from '../src/types/game';
const card=(suit:ActionCard['suit'],rank='5'):ActionCard=>({id:'test',name:'Carta',suit,rank,cost:2,type:'attack',badgeText:'',badgeColor:'',description:'',value:1});
test('each suit has distinct spell presentation',()=>{
 const tones=new Set((['espadas','copas','ouros','paus','coringa'] as const).map(s=>spellPresentation(card(s)).tone));
 assert.equal(tones.size,5);
});
test('aces and jokers display legendary intensity',()=>{
 assert.equal(spellPresentation(card('copas','A')).intensity,'legendary');
 assert.equal(spellPresentation({...card('coringa'),type:'joker'}).intensity,'legendary');
});
test('combat-state thresholds',()=>{
 const hero={isAlive:true,currentHp:4,maxHp:10} as Hero;
 assert.equal(heroCombatState(hero),'wounded');
 assert.equal(heroCombatState({...hero,currentHp:3}),'critical');
 assert.equal(heroCombatState({...hero,isAlive:false}),'fallen');
});
