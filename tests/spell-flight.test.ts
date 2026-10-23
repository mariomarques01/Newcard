import test from 'node:test';
import assert from 'node:assert/strict';
import {spellFlight,SPELL_CHARGE_MS} from '../src/game/spellFlight';
import {PROJECTILE_IMPACT_MS} from '../src/game/combatTiming';
const from={x:50,y:550},to={x:250,y:180};
test('spell remains at the caster through charge and reaches the target at impact',()=>{
 for(const elapsed of [-100,0,SPELL_CHARGE_MS]){
  const f=spellFlight(from,to,elapsed);assert.equal(f.x,from.x);assert.equal(f.y,from.y);
 }
 for(const elapsed of [PROJECTILE_IMPACT_MS,PROJECTILE_IMPACT_MS+1000]){
  const f=spellFlight(from,to,elapsed);assert.equal(f.x,to.x);assert.ok(Math.abs(f.y-to.y)<1e-9);
 }
});
test('projectile accelerates and wake samples never overtake its head',()=>{
 const duration=PROJECTILE_IMPACT_MS-SPELL_CHARGE_MS;
 const first=spellFlight(from,to,SPELL_CHARGE_MS+duration*.25);
 const middle=spellFlight(from,to,SPELL_CHARGE_MS+duration*.5);
 const last=spellFlight(from,to,SPELL_CHARGE_MS+duration*.75);
 assert.ok(last.x-middle.x>middle.x-first.x);
 for(let elapsed=SPELL_CHARGE_MS;elapsed<=PROJECTILE_IMPACT_MS;elapsed+=17){
  assert.ok(spellFlight(from,to,elapsed-13).x<=spellFlight(from,to,elapsed).x);
 }
});
test('vertical and zero-distance casts have finite geometry',()=>{
 for(const target of [from,{x:50,y:100}])for(const elapsed of [0,300,500,880]){
  const sample=spellFlight(from,target,elapsed);
  assert.ok(Object.values(sample).every(Number.isFinite));
 }
 assert.deepEqual(from,{x:50,y:550});
});
