import {CreatureArtwork} from './CreatureArtwork';
import type {CSSProperties} from 'react';
import {Shield} from 'lucide-react';
import {ELEMENT_TONES,isElement} from '../game/spellPresentation';
import type {BattleEffect} from './CombatParticleCanvas';
export function BattleActor({effect:e}:{effect:BattleEffect}){
 if(!e.actor?.image||!isElement(e.actor.element))return null;
 const action=e.actor.casting?'cast':e.type==='shield'?'guard':e.travel?'attack':'cast';
 const distance=action==='attack'?Math.min(.42,95/Math.max(1,Math.hypot(e.to.x-e.from.x,e.to.y-e.from.y))):0;
 const w=Math.min(window.innerWidth*.25,106),safe=w*.625+8;
 const x=Math.max(safe,Math.min(window.innerWidth-safe,e.from.x)),targetX=Math.max(safe,Math.min(window.innerWidth-safe,e.to.x));
 const y=Math.max(100,Math.min(window.innerHeight-130,e.from.y));
 const vars={left:x,top:y,'--actor-tone':ELEMENT_TONES[e.actor.element],'--actor-dx':`${(targetX-x)*distance}px`,'--actor-dy':`${(e.to.y-y)*distance}px`,'--actor-width':`${w}px`,'--actor-aspect':.75} as CSSProperties;
 return <div className={`battle-actor actor-${action} actor-elemental`} data-battle-actor={e.actor.id} data-performance={action} data-school={e.actor.element} style={vars}>
  <div className="actor-spotlight"/><div className="actor-platform"/>
  <div className="actor-sprite elemental-actor-art"><CreatureArtwork hero={e.actor}/></div>
  {action==='guard'?<Shield className="actor-great-shield"/>:<div className="actor-power-orb"/>}
 </div>;
}
