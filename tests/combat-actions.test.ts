import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ActionBar} from '../src/components/ActionBar';
import type {Hero,ActionCard} from '../src/types/game';
const props={
 selectedCard:{cost:1,name:'5 de Espadas'} as ActionCard,
 activeHero:{isAlive:true,hasAttacked:false,isDefending:false,name:'Rei',rank:'K'} as Hero,
 targetedRival:{isAlive:true,name:'Valete'} as Hero,
 playerEnergy:5,currentTurn:'player' as const,
 onUseCard:()=>{},onAttack:()=>{},onDefend:()=>{},onUseAce:()=>{},onEndTurn:()=>{},
};
test('all five actions wait while a projectile resolves, including end turn',()=>{
 const html=renderToStaticMarkup(React.createElement(ActionBar,{...props,resolving:true}));
 assert.equal((html.match(/disabled=""/g)||[]).length,5);
 assert.equal((html.match(/Em combate/g)||[]).length,5);
});
test('actions become available again after combat, preserving rival-turn gating',()=>{
 const ready=renderToStaticMarkup(React.createElement(ActionBar,{...props,resolving:false}));
 assert.equal((ready.match(/disabled=""/g)||[]).length,0);
 const rival=renderToStaticMarkup(React.createElement(ActionBar,{...props,currentTurn:'rival'}));
 assert.equal((rival.match(/disabled=""/g)||[]).length,5);
});
test('jack power waits for a living enemy while reinforcement remains usable',()=>{
 const jack={...props.activeHero,rank:'J'} as Hero;
 const fallen={...props.targetedRival,isAlive:false} as Hero;
 const renderAce=(activeHero:Hero,targetedRival?:Hero)=>{
  const html=renderToStaticMarkup(React.createElement(ActionBar,{...props,activeHero,targetedRival}));
  return html.match(/<button\b[^>]*data-action="ace"[\s\S]*?<\/button>/)?.[0]||'';
 };
 assert.match(renderAce(jack,fallen),/disabled=""/);
 assert.match(renderAce(jack,fallen),/Escolha alvo/);
 assert.doesNotMatch(renderAce(props.activeHero,fallen),/disabled=""/);
 assert.doesNotMatch(renderAce(jack,props.targetedRival),/disabled=""/);
});
