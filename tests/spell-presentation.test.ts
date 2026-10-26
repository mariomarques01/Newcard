import test from 'node:test';
import assert from 'node:assert/strict';
import {spellPresentation,heroCombatState,schoolForElement} from '../src/game/spellPresentation';
import type {ActionCard,Hero,Element} from '../src/types/game';
const card=(element:Element):ActionCard=>({id:'elemental_fire',name:'Magia',element,suit:'copas',rank:'A',cost:2,type:'attack',badgeText:'',badgeColor:'',description:'',value:1});
test('four elements have distinct palettes independently of former suit and rank',()=>{
 const tones=new Set<string>();for(const element of ['fogo','agua','terra','ar'] as const){const presentation=spellPresentation(card(element));assert.equal(presentation.school,element);assert.equal(schoolForElement(element),element);assert.equal(presentation.intensity,'normal');tones.add(presentation.tone);}assert.equal(tones.size,4);
});
test('a traditional card without an element cannot choose a visual effect',()=>{assert.throws(()=>spellPresentation({...card('fogo'),element:undefined,id:'card_as_copas'}));assert.throws(()=>schoolForElement(undefined));});
test('combat-state thresholds',()=>{const hero={isAlive:true,currentHp:4,maxHp:10} as Hero;assert.equal(heroCombatState(hero),'wounded');assert.equal(heroCombatState({...hero,currentHp:3}),'critical');assert.equal(heroCombatState({...hero,isAlive:false}),'fallen');});
