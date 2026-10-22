import assert from 'node:assert/strict';
import { test } from 'node:test';
import { abilityFor, makeDeck, resolveCard, targetFor } from '../src/game/cards';
import type { ActionCard, Hero } from '../src/types/game';
const hero=(id:string,hp=5):Hero=>({id,currentHp:hp,maxHp:14,atk:4,shield:0,def:3,isAlive:true} as Hero);
const card=(suit:string,rank:string,id='test'):ActionCard=>({id,suit,rank} as ActionCard);
test('every numbered card and ace has an implemented ability',()=>{
 for(const suit of ['espadas','copas','paus']) for(let rank=1;rank<=10;rank++) assert.ok(Object.keys(abilityFor(card(suit,String(rank)))).length);
 for(const suit of ['espadas','copas','paus','ouros']) assert.ok(Object.keys(abilityFor(card(suit,'A'))).length);
});
test('copas heals the dropped ally, without changing another hero or the input',()=>{
 const allies=[hero('a'),hero('b')]; const result=resolveCard(card('copas','2'),allies,[hero('r')],'b');
 assert.equal(result.allies[0].currentHp,5);assert.equal(result.allies[1].currentHp,7);assert.equal(result.allies[1].shield,2);assert.equal(allies[1].currentHp,5);
});
test('area healing applies only to living allies',()=>{
 const result=resolveCard(card('copas','A'),[hero('a'),{...hero('b',0),isAlive:false}],[hero('r')],'a');
 assert.equal(result.allies[0].currentHp,8);assert.equal(result.allies[0].shield,3);assert.equal(result.allies[1].currentHp,0);
});
test('jokers have distinct effects',()=>{
 assert.deepEqual(abilityFor(card('coringa','★','card_coringa_liberdade')),{attack:3,shield:3,steal:1});
 assert.deepEqual(abilityFor(card('coringa','★','card_coringa_oportunidade')),{heal:4,shield:4,glory:1});
});
test('damage hits only selected rival and awards lethal glory',()=>{
 const result=resolveCard(card('espadas','5'),[hero('a')],[hero('r',3),hero('s')],'a','r');
 assert.equal(result.enemies[0].isAlive,false);assert.equal(result.enemies[1].currentHp,5);assert.equal(result.killGlory,2);
});
test('copies have unique ids and keep their original ability',()=>{
 const deck=makeDeck([card('coringa','★','card_coringa_oportunidade')]);
 assert.equal(new Set(deck.map(c=>c.id)).size,deck.length);assert.equal(abilityFor(deck[2]).heal,4);
});
test('drag targets follow actual abilities',()=>{
 assert.equal(targetFor(card('espadas','5')),'enemy');assert.equal(targetFor(card('copas','2')),'ally');assert.equal(targetFor(card('copas','A')),'board');assert.equal(targetFor(card('espadas','3')),'ally');
});
