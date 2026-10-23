export type ImpactKind='blocked'|'shield-break'|'heavy'|'lethal'|'hit';
export type CombatOutcome={shieldLost:number;hpLost:number;defeated:boolean;shieldBroken:boolean};
/** Presentation follows the resolved result; it never rolls a critical hit or changes damage. */
export function impactFor(outcome:CombatOutcome):ImpactKind|null {
 if(outcome.defeated)return 'lethal';
 if(outcome.shieldBroken&&outcome.shieldLost>0)return 'shield-break';
 if(outcome.shieldLost>0&&outcome.hpLost===0)return 'blocked';
 if(outcome.hpLost>=3)return 'heavy';
 return outcome.hpLost>0?'hit':null;
}
