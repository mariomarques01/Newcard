import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from 'react';
import './combat-effects.css';
import './combat-polish-v2.css';
import './combat-cinematic-v3.css';
import {cueCharacter,attackFlavor} from '../game/characterMotion';
import {BattleActor} from './BattleActor';
import {SpellScene} from './SpellScene';
import type {ActionCard,Hero} from '../types/game';

export type ParticleEffectType = 'slash' | 'arcane' | 'gold_blast' | 'pierce' | 'heal' | 'shield';
export interface CombatParticleCanvasRef {
  triggerBurst: (x:number,y:number,type:ParticleEffectType,label?:string)=>void;
  triggerCardBurst: (elementId:string,type:ParticleEffectType,label?:string)=>void;
  triggerAttack: (sourceId:string,targetId:string,type?:ParticleEffectType,label?:string)=>void;
  triggerBoard: (type:ParticleEffectType,label:string)=>void;
  revealCard: (card:ActionCard,casterId:string)=>void;
  clear: ()=>void;
}
type Point = {x:number;y:number};
export type BattleEffect = {id:number;from:Point;to:Point;type:ParticleEffectType;label:string;travel:boolean;flavor?:string;started:number;scope?:'board';actor?:{id:string;name:string}};
const MAX_ACTIVE_EFFECTS = 6;
// Projectile travel (900ms) + impact animation (1350ms) + cleanup margin.
const EFFECT_LIFETIME_MS = 2400;
const labels:Record<ParticleEffectType,string>={slash:'ATAQUE',pierce:'PERFURAÇÃO',shield:'DEFESA',heal:'CURA',arcane:'MAGIA',gold_blast:'PODER REAL'};
const center=(id:string):Point|null=>{
  const rect=document.getElementById(id)?.getBoundingClientRect();
  return rect?{x:rect.left+rect.width/2,y:rect.top+rect.height/2}:null;
};
export const CombatParticleCanvas=forwardRef<CombatParticleCanvasRef>(function CombatEffects(_,ref){
  const [effects,setEffects]=useState<BattleEffect[]>([]);
  const [reveal,setReveal]=useState<ActionCard|null>(null);
  const sequence=useRef(0);
  const timers=useRef(new Set<ReturnType<typeof setTimeout>>());
  const clear=()=>{timers.current.forEach(clearTimeout);timers.current.clear();setEffects([]);setReveal(null);
    document.querySelectorAll('[data-hero-id]').forEach(el=>cueCharacter(el.id,'idle'));};
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);timers.current.clear();},[]);
  useImperativeHandle(ref,()=>{
    const emit=(from:Point,to:Point,type:ParticleEffectType,label?:string,travel=false,flavor?:string,scope?:'board',actor?:BattleEffect['actor'])=>{
      const id=++sequence.current;
      setEffects(prev=>[...prev.slice(-(MAX_ACTIVE_EFFECTS - 1)),{id,from,to,type,label:label||labels[type],travel,flavor,scope,actor,started:performance.now()}]);
      const timer=setTimeout(()=>{setEffects(prev=>prev.filter(e=>e.id!==id));timers.current.delete(timer);},EFFECT_LIFETIME_MS);
      timers.current.add(timer);
    };
    const actorFor=(id:string)=>{const el=document.getElementById(id);const heroId=el?.dataset.heroId;return heroId?{id:heroId,name:el?.querySelector('.hero-name')?.textContent||''}:undefined;};
    const board=(type:ParticleEffectType,label:string)=>{
      const rect=document.querySelector('[data-battlefield]')?.getBoundingClientRect();
      if(rect){const p={x:rect.left+rect.width/2,y:rect.top+rect.height/2};emit(p,p,type,label,false,undefined,'board');}
    };
    return {
      clear,
      triggerBoard:board,
      revealCard:(card,casterId)=>{
        cueCharacter(casterId,'cast');
        if(card.type==='joker'||card.rank==='A'){
          setReveal(card);board(card.type==='joker'?'arcane':'gold_blast',card.skillName||card.name);
          const timer=setTimeout(()=>{setReveal(null);timers.current.delete(timer);},1600);timers.current.add(timer);
        }
      },
      triggerBurst:(x,y,type,label)=>emit({x,y},{x,y},type,label),
      triggerCardBurst:(id,type,label)=>{const p=center(id);if(p){emit(p,p,type,label,false,undefined,undefined,type==='shield'||type==='gold_blast'?actorFor(id):undefined);if(type==='shield')cueCharacter(id,'guard');else if(type==='gold_blast'||type==='arcane'||type==='heal')cueCharacter(id,'cast');}},
      triggerAttack:(sourceId,targetId,type='slash',label)=>{
        const from=center(sourceId),to=center(targetId);if(!from||!to)return;
        const source=document.getElementById(sourceId);
        const suit=source?.dataset.suit as Hero['suit']|undefined;
        const rank=source?.dataset.rank as Hero['rank']|undefined;
        const flavor=suit&&rank?attackFlavor({suit,rank}):undefined;
        emit(from,to,type,label,true,flavor,undefined,actorFor(sourceId));
        cueCharacter(sourceId,type==='heal'||type==='arcane'?'cast':'attack');
        if(type==='slash'||type==='pierce'){
          const timer=setTimeout(()=>{cueCharacter(targetId,'hurt');timers.current.delete(timer);},880);timers.current.add(timer);
        }
      },
    };
  });
  return <div className="combat-effects" aria-hidden="true"><SpellScene effects={effects}/>{effects.filter(e=>e.actor).slice(-2).map(e=><BattleActor key={e.id} effect={e}/>)}{effects.map(e=>{
    const dx=e.to.x-e.from.x,dy=e.to.y-e.from.y;
    const vars={'--fx-x':`${dx}px`,'--fx-y':`${dy}px`,'--fx-angle':`${Math.atan2(dy,dx)}rad`,'--fx-delay':e.travel?'880ms':'0ms'} as CSSProperties;
    return <div key={e.id} className={`combat-fx fx-${e.type} flavor-${e.flavor||"spell"} ${e.scope==='board'?'fx-board':''}`} data-effect={e.type} data-travel={e.travel} data-scope={e.scope||'target'} style={vars}>
      <div className="scene-light" style={{left:e.to.x,top:e.to.y}}/>
      {e.travel&&<div className="casting-seal" style={{left:e.from.x,top:e.from.y}}><i/><span>✧</span></div>}
      {e.travel&&<div className="fx-flight" style={{left:e.from.x,top:e.from.y}}><div className="fx-bolt"><i/><b>{e.flavor==='heart'?'♥':e.flavor==='coin'?'◆':e.flavor==='flame'?'♨':e.flavor==='thorn'?'♣':e.flavor==='blade'?'⚔':'✦'}</b></div></div>}
      <div className="fx-impact" style={{left:e.to.x,top:e.to.y}}>
        <div className="impact-cracks"/><div className="fx-ring"/><div className="fx-ring fx-ring-second"/>
        {e.type==='shield'?<svg className="fx-symbol" viewBox="0 0 80 90"><path d="M40 5 72 17v27c0 20-17 33-32 41C25 77 8 64 8 44V17Z"/><path d="m23 43 12 12 23-27"/></svg>:e.type==='heal'?<span className="fx-symbol fx-plus">✚</span>:<span className="fx-symbol fx-star">{e.type==='slash'||e.type==='pierce'?'╱':'✦'}</span>}
        {Array.from({length:5},(_,i)=><i key={i} className="fx-spark" style={{'--spark-angle':`${i*72}deg`} as CSSProperties}/>)}
        <strong className="fx-label">{e.label}</strong>
      </div>
    </div>;
  })}{reveal&&<div key={reveal.id} className={`special-reveal ${reveal.type==='joker'?'reveal-joker':'reveal-ace'}`} data-special={reveal.type}>
    <div className="legendary-halo"/><img src={reveal.image} alt=""/><div><small>{reveal.type==='joker'?'CORINGA DESPERTADO':'PODER DE ÁS'}</small><strong>{reveal.skillName||reveal.name}</strong><span>{reveal.description}</span></div>
  </div>}</div>;
});
