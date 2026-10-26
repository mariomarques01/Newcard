import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spellVariantFor,creatureVariantFor,creatureStatuses} from '../src/game/spellChoreography';
import {resolveCard,expireElementalEffects} from '../src/game/cards';
import type {ActionCard,Hero} from '../src/types/game';
const card=(id:string,element:ActionCard['element']):ActionCard=>({id,element} as ActionCard);
const hero=(id:string):Hero=>({id,element:'ar',maxHp:12,currentHp:12,atk:4,def:4,shield:0,isAlive:true} as Hero);
test('each registered spell has its own choreography, including copies',()=>{
 const ids=['elemental_fire','elemental_wave','elemental_water','elemental_earth','elemental_eruption','elemental_tornado','elemental_air'];
 assert.equal(new Set(ids.map(id=>spellVariantFor(card(id,'fogo')))).size,7);
 for(const id of ids)assert.equal(spellVariantFor({...card('copy','ar'),templateId:id}),spellVariantFor(card(id,'fogo')));
});
test('healing, shielding and offense remain visually distinct for the same creature',()=>{
 const h={...hero('ent'),element:'terra' as const};assert.equal(creatureVariantFor(h,'heal'),'forest-renewal');assert.equal(creatureVariantFor(h,'shield'),'stone-armor');assert.equal(creatureVariantFor(h,'pierce'),'earth-eruption');
});
test('badges match resolved debuffs and disappear on expiration without changing stats',()=>{
 const enemy=hero('r'),ally=hero('p');
 const earth=resolveCard(card('elemental_eruption','terra'),[ally],[enemy],ally.id,enemy.id).enemies[0];
 assert.deepEqual(creatureStatuses(earth).map(s=>s.label),['−2 DEF']);assert.equal(earth.def,2);assert.equal(enemy.def,4);
 const tornado=resolveCard(card('elemental_tornado','ar'),[ally],[earth],ally.id,enemy.id).enemies[0];
 assert.deepEqual(creatureStatuses(tornado).map(s=>s.id),['stunned','defense-down']);assert.deepEqual(creatureStatuses(expireElementalEffects(tornado)),[]);
});
test('defeated creatures never display active status badges',()=>{assert.deepEqual(creatureStatuses({...hero('dead'),isAlive:false,stunned:true,temporaryAttack:2}),[]);});
