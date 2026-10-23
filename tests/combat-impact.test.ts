import test from 'node:test';
import assert from 'node:assert/strict';
import {impactFor,type CombatOutcome} from '../src/game/combatImpact';
const outcome=(changes:Partial<CombatOutcome>):CombatOutcome=>({shieldLost:0,hpLost:0,defeated:false,shieldBroken:false,...changes});
test('only fully absorbed hits show a block; depleted shields shatter instead',()=>{
 assert.equal(impactFor(outcome({shieldLost:2})),'blocked');
 assert.equal(impactFor(outcome({shieldLost:2,shieldBroken:true})),'shield-break');
 assert.equal(impactFor(outcome({shieldLost:2,hpLost:1})),'hit');
});
test('lethal takes precedence over shield break and heavy damage',()=>{
 assert.equal(impactFor(outcome({shieldLost:3,hpLost:8,shieldBroken:true,defeated:true})),'lethal');
 assert.equal(impactFor(outcome({hpLost:3})),'heavy');
 assert.equal(impactFor(outcome({hpLost:2})),'hit');
});
test('zero damage emits no hit and classification does not mutate results',()=>{
 const result=outcome({});assert.equal(impactFor(result),null);
 assert.deepEqual(result,outcome({}));
});
