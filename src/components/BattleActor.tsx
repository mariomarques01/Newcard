import type {CSSProperties} from 'react';
import {CHARACTER_PERSONALITY,spriteGeometry} from '../game/characterMotion';
import type {BattleEffect} from './CombatParticleCanvas';
export function BattleActor({effect:e}:{effect:BattleEffect}){
 if(!e.actor)return null;
 const profile=CHARACTER_PERSONALITY[e.actor.id],g=spriteGeometry(e.actor.id);
 const action=e.travel?'attack':e.type==='shield'?'guard':'cast';
 const distance=e.travel?.62:0;
 const w=Math.min(window.innerWidth*.43,210),half=w/2;
 const safe=half*1.25+8;
 const x=Math.max(safe,Math.min(window.innerWidth-safe,e.from.x));
 const targetX=Math.max(safe,Math.min(window.innerWidth-safe,e.to.x));
 const y=Math.max(100,Math.min(window.innerHeight-130,e.from.y));
 const vars={left:x,top:y,'--actor-dx':`${(targetX-x)*distance}px`,'--actor-dy':`${(e.to.y-y)*distance}px`,'--sprite-row':g.row,'--actor-width':`${w}px`,'--actor-aspect':g.aspect} as CSSProperties;
 return <div className={`battle-actor actor-${action} actor-${e.flavor||(e.type==='gold_blast'?'coin':'magic')}`} data-battle-actor={e.actor.id} data-performance={action} style={vars}>
  <div className="actor-spotlight"/><div className="actor-platform"/>
  <div className="actor-sprite" style={{backgroundImage:`url("${import.meta.env.BASE_URL}assets/characters/royal-actions.webp")`,backgroundSize:g.size}}/>
  {action==='guard'?<svg className="actor-great-shield" viewBox="0 0 100 120"><path d="M50 5 93 20v40c0 28-25 47-43 55C32 107 7 88 7 60V20Z"/><path d="M50 22v73M24 48h52"/></svg>:<div className="actor-power-orb"/>}
  <div className="actor-nameplate"><small>{e.actor.name}</small><strong>{action==='guard'?profile.guard:action==='attack'?profile.attack:'PODER DESPERTADO'}</strong></div>
  <span className="actor-battle-cry">{action==='guard'?'Não passará!':profile.cry}</span>
 </div>;
}
