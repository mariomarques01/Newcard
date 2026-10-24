import test from 'node:test';
import assert from 'node:assert/strict';
import {heroPowerPresentation,heroPowerTargets} from '../src/game/heroPowerPresentation';
import type {Hero} from '../src/types/game';
const hero=(id:string,rank:Hero['rank'],hp=10,alive=true):Hero=>({id,rank,suit:rank==='Q'?'copas':rank==='J'?'paus':'espadas',currentHp:hp,maxHp:10,isAlive:alive} as Hero);
test('queen targets only living wounded allies and announces actual healing',()=>{
 const queen=hero('q','Q'),allies=[queen,hero('k','K',9),hero('j','J',2),hero('dead','J',0,false)];
 assert.deepEqual(heroPowerTargets(queen,allies),[{id:'k',type:'heal',label:'+1 VIDA'},{id:'j',type:'heal',label:'+4 VIDA'}]);
 assert.equal(allies[1].currentHp,9);
});
test('jack requires a living enemy while king can reinforce without one',()=>{
 const jack=hero('j','J'),king=hero('k','K');
 assert.equal(heroPowerPresentation(jack).needsEnemy,true);
 assert.deepEqual(heroPowerTargets(jack,[],hero('dead','K',0,false)),[]);
 assert.equal(heroPowerTargets(jack,[],hero('enemy','K'))[0].id,'enemy');
 assert.equal(heroPowerTargets(king,[])[0].id,king.id);
});
test('full-health queen uses a caster aura without inventing restored HP',()=>{
 const queen=hero('q','Q');
 assert.deepEqual(heroPowerTargets(queen,[queen]),[{id:'q',type:'heal',label:'VIDA NO MÁXIMO'}]);
 assert.equal(heroPowerPresentation(queen).school,'nature');
});
