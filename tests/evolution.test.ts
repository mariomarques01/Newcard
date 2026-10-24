import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceEvolution,evolutionCharge,EVOLUTION_ACTIONS} from '../src/game/evolution';
import type {Hero} from '../src/types/game';
const hero=(id='p_rei_espadas'):Hero=>({id,atk:4,baseAtk:4,shield:2,currentHp:10,maxHp:14,isAlive:true} as Hero);
test('third action awakens once and applies real combat bonuses without changing the input',()=>{
 const original=hero();let court=[original];
 for(let count=1;count<=EVOLUTION_ACTIONS;count++){
  const result=advanceEvolution(court,original.id);court=result.heroes;
  assert.equal(evolutionCharge(court[0]),count);
  assert.equal(!!result.awakened,count===EVOLUTION_ACTIONS);
 }
 assert.equal(court[0].atk,5);assert.equal(court[0].shield,4);assert.equal(court[0].evolved,true);
 assert.equal(original.atk,4);assert.equal(original.shield,2);assert.equal(original.evolutionCharge,undefined);
 const again=advanceEvolution(court,original.id);
 assert.deepEqual(again.heroes,court);assert.equal(again.awakened,undefined);
});
test('only the living actor progresses, with the same rules for rivals',()=>{
 const alive=hero(),rival=hero('r_rei_ouros'),fallen={...hero('fallen'),currentHp:0,isAlive:false,evolutionCharge:2};
 const first=advanceEvolution([alive,rival,fallen],rival.id);
 assert.equal(evolutionCharge(first.heroes[0]),0);assert.equal(evolutionCharge(first.heroes[1]),1);
 assert.deepEqual(advanceEvolution(first.heroes,fallen.id).heroes,first.heroes);
 assert.deepEqual(advanceEvolution(first.heroes,'missing').heroes,first.heroes);
});
test('save restoration preserves progress and never grants an already applied bonus twice',()=>{
 let court=[hero()];court=advanceEvolution(court,court[0].id).heroes;
 const saved=JSON.parse(JSON.stringify(court)) as Hero[];
 assert.equal(evolutionCharge(saved[0]),1);
 let evolved=advanceEvolution(saved,saved[0].id).heroes;evolved=advanceEvolution(evolved,evolved[0].id).heroes;
 const restored=JSON.parse(JSON.stringify(evolved)) as Hero[];
 assert.deepEqual(advanceEvolution(restored,restored[0].id).heroes,evolved);
 assert.equal(evolutionCharge(hero()),0,'a new battle starts without charges');
});
test('legacy or malformed charge values remain bounded',()=>{
 for(const value of [undefined,NaN,Infinity,-4]) assert.equal(evolutionCharge({...hero(),evolutionCharge:value}),0);
 assert.equal(evolutionCharge({...hero(),evolutionCharge:1.8}),1);
 assert.equal(evolutionCharge({...hero(),evolutionCharge:200}),EVOLUTION_ACTIONS);
});
