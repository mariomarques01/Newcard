import assert from 'node:assert/strict';
import { test } from 'node:test';
import { abilityFor, elementalCards, makeDeck, resolveCard, targetFor } from '../src/game/cards';
import type { ActionCard, Hero } from '../src/types/game';
const hero=(id:string,hp=5):Hero=>({id,currentHp:hp,maxHp:14,atk:4,shield:0,def:3,isAlive:true} as Hero);
const fire:ActionCard={id:'elemental_fire',element:'fogo',name:'Explosão Ígnea',cost:1,suit:'paus',rank:'5',type:'attack',badgeText:'FOGO',badgeColor:'red',description:'Causa 4 de dano.',value:4};
const water:ActionCard={...fire,id:'elemental_water',element:'agua',name:'Fonte de Cura',cost:2,suit:'copas',type:'heal'};
const legacy:ActionCard={...fire,id:'card_5_espadas',element:undefined,suit:'espadas'};
test('traditional numbered cards, aces and jokers have no playable abilities',()=>{
 for(const suit of ['espadas','copas','ouros','paus','coringa']) for(const rank of ['1','5','10','A','★']) assert.deepEqual(abilityFor({...legacy,id:`card_${rank}_${suit}`,suit:suit as ActionCard['suit'],rank}),{});
 for(const id of ['card_coringa_liberdade','card_coringa_oportunidade'])assert.deepEqual(abilityFor({...legacy,id}),{});
});
test('a mixed deck contains only registered elemental cards and unique instance ids',()=>{
 const deck=makeDeck([legacy,fire,water,{...legacy,id:'unknown',element:'fogo'}]);
 assert.equal(deck.length,34);assert.equal(new Set(deck.map(c=>c.id)).size,34);
 for(const card of deck){assert.ok(['elemental_fire','elemental_water'].includes(card.templateId!));assert.ok(card.element);assert.ok(Object.keys(abilityFor(card)).length);}
});
test('empty and traditional-only templates cannot create a deck',()=>{assert.deepEqual(makeDeck([]),[]);assert.deepEqual(makeDeck([legacy]),[]);});
test('restored cards discard legacy entries and refresh elemental metadata without losing ids',()=>{
 const saved=[legacy,{...fire,templateId:fire.id,id:'elemental_fire__17',name:'5 de Paus',image:'old.png'}, {...legacy,id:'card_coringa_liberdade'}];
 const cards=elementalCards(saved,[fire,water]);assert.equal(cards.length,1);assert.equal(cards[0].id,'elemental_fire__17');assert.equal(cards[0].name,'Explosão Ígnea');assert.equal(cards[0].image,fire.image);
});
test('elemental healing affects only the selected living ally and never mutates input',()=>{
 const allies=[hero('a'),hero('b')];const r=resolveCard(water,allies,[hero('r')],'b');assert.equal(r.allies[0].currentHp,5);assert.equal(r.allies[1].currentHp,9);assert.equal(allies[1].currentHp,5);assert.equal(targetFor(water),'ally');
});
test('elemental damage affects the selected enemy and awards lethal glory',()=>{
 const r=resolveCard(fire,[hero('a')],[hero('r',4),hero('s')],'a','r');assert.equal(r.enemies[0].isAlive,false);assert.equal(r.enemies[1].currentHp,5);assert.equal(r.killGlory,2);assert.equal(targetFor(fire),'enemy');
});
