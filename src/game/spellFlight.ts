import {PROJECTILE_IMPACT_MS} from './combatTiming';
export const SPELL_CHARGE_MS=300;
export type SpellPoint={x:number;y:number};
/** Frame-independent accelerating arc, shared by projectile and its wake. */
export function spellFlight(from:SpellPoint,to:SpellPoint,elapsed:number){
 const progress=Math.max(0,Math.min(1,(elapsed-SPELL_CHARGE_MS)/(PROJECTILE_IMPACT_MS-SPELL_CHARGE_MS)));
 const t=progress*progress;
 const dx=to.x-from.x,dy=to.y-from.y;
 const arc=Math.min(42,Math.hypot(dx,dy)*.12);
 return {progress,x:from.x+dx*t,y:from.y+dy*t-Math.sin(t*Math.PI)*arc,
  angle:Math.atan2(dy-Math.cos(t*Math.PI)*Math.PI*arc,dx)};
}
