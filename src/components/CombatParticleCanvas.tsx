import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from 'react';
import './combat-effects.css';
import './combat-polish-v2.css';
import './combat-cinematic-v3.css';
import './combat-target-focus-v45.css';
import './combat-choreography.css';
import {cueCharacter} from '../game/characterMotion';
import {BattleActor} from './BattleActor';
import {spellPresentation,schoolForElement,isElement} from '../game/spellPresentation';
import {CHARACTER_PERSONALITY} from '../game/characterMotion';
import {PROJECTILE_IMPACT_MS} from '../game/combatTiming';
import {impactFor,type CombatOutcome,type ImpactKind} from '../game/combatImpact';
import {PowerAnnouncement,type PowerAnnouncementData} from './PowerAnnouncement';
import {heroPowerPresentation,type HeroPowerTarget} from '../game/heroPowerPresentation';
import {ElementIcon} from './ElementIcon';
import {abilityFor} from '../game/cards';
import {elementalVariant,creatureVariantFor,type SpellVariant} from '../game/spellChoreography';
import {SpellScene} from './SpellScene';
import type {ActionCard,Hero,Element} from '../types/game';

export type ParticleEffectType = 'slash' | 'arcane' | 'gold_blast' | 'pierce' | 'heal' | 'shield';
export interface CombatParticleCanvasRef {
  triggerBurst: (x:number,y:number,type:ParticleEffectType,label?:string,card?:ActionCard)=>void;
  triggerCardBurst: (elementId:string,type:ParticleEffectType,label?:string,card?:ActionCard)=>void;
  triggerAttack: (sourceId:string,targetId:string,type?:ParticleEffectType,label?:string,card?:ActionCard)=>void;
  triggerBoard: (type:ParticleEffectType,label:string,card?:ActionCard)=>void;
  revealCard: (card:ActionCard,casterId:string)=>void;
  triggerHeroPower:(hero:Hero,targets:HeroPowerTarget[])=>void;
  triggerEvolution:(hero:Hero)=>void;
  triggerOutcome:(elementId:string,outcome:CombatOutcome)=>void;
  clear: ()=>void;
}
type Point = {x:number;y:number};
export type BattleEffect = {variant?:SpellVariant;id:number;from:Point;to:Point;type:ParticleEffectType;label:string;travel:boolean;flavor?:string;school?:string;started:number;intensity?:'normal'|'legendary';impact?:ImpactKind;evolution?:boolean;scope?:'board';actor?:{id:string;name:string;image:string;element:Element;casting?:boolean}};
const MAX_ACTIVE_EFFECTS = 6;
// Projectile travel (900ms) + impact animation (1350ms) + cleanup margin.
const EFFECT_LIFETIME_MS = 2400;
const labels:Record<ParticleEffectType,string>={slash:'ATAQUE',pierce:'PERFURAÇÃO',shield:'DEFESA',heal:'CURA',arcane:'MAGIA',gold_blast:'PODER ELEMENTAL'};
const center=(id:string):Point|null=>{
  const rect=document.getElementById(id)?.getBoundingClientRect();
  return rect?{x:rect.left+rect.width/2,y:rect.top+rect.height/2}:null;
};
export const CombatParticleCanvas=forwardRef<CombatParticleCanvasRef>(function CombatEffects(_,ref){
  const [effects,setEffects]=useState<BattleEffect[]>([]);
  const [reveal,setReveal]=useState<PowerAnnouncementData|null>(null);
  const sequence=useRef(0);
  const revealSequence=useRef(0);
  const timers=useRef(new Set<ReturnType<typeof setTimeout>>());
  const clear=()=>{timers.current.forEach(clearTimeout);timers.current.clear();setEffects([]);setReveal(null);
    document.querySelectorAll('[data-hero-id]').forEach(el=>cueCharacter(el.id,'idle'));};
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);timers.current.clear();},[]);
  useImperativeHandle(ref,()=>{
    const emit=(from:Point,to:Point,type:ParticleEffectType,label?:string,travel=false,flavor?:string,scope?:'board',actor?:BattleEffect['actor'],school?:string,presentation:Pick<BattleEffect,'intensity'|'impact'|'evolution'|'variant'>={})=>{
      const id=++sequence.current;
      setEffects(prev=>[...prev.slice(-(MAX_ACTIVE_EFFECTS - 1)),{id,from,to,type,label:label||labels[type],travel,flavor,scope,actor,school,variant:isElement(school)?elementalVariant(school,type):undefined,...presentation,started:performance.now()}]);
      const timer=setTimeout(()=>{setEffects(prev=>prev.filter(e=>e.id!==id));timers.current.delete(timer);},EFFECT_LIFETIME_MS);
      timers.current.add(timer);
    };
    const actorFor=(id:string)=>{const el=document.getElementById(id);const heroId=el?.dataset.heroId;const element=el?.dataset.element;return heroId&&isElement(element)?{id:heroId,name:el?.querySelector('.hero-name')?.textContent||'',image:el?.querySelector<HTMLImageElement>('.hero-original-art')?.src||'',element}:undefined;};
    const board=(type:ParticleEffectType,label:string,card?:ActionCard)=>{
      if(!card)return;
      const affectedCourt=abilityFor(card).enemyAll?'.enemy-row':'.player-row';
      const rect=document.querySelector(affectedCourt)?.getBoundingClientRect();
      if(card&&(!isElement(card.element)||!Object.keys(abilityFor(card)).length))return;
      if(rect){const p={x:rect.left+rect.width/2,y:rect.top+rect.height/2};emit(p,p,type,label,false,undefined,'board',undefined,card?spellPresentation(card).school:undefined,{intensity:card?spellPresentation(card).intensity:'normal',variant:card?spellPresentation(card).variant:undefined});}
    };
    const announce=(data:Omit<PowerAnnouncementData,'id'|'y'>)=>{
      const rect=document.querySelector('.battle-divider')?.getBoundingClientRect();
      const y=Math.max(48,Math.min(window.innerHeight-105,rect?rect.top+rect.height/2-32:window.innerHeight*.45));
      const id=++revealSequence.current;setReveal({...data,id,y});
      const timer=setTimeout(()=>{setReveal(current=>current?.id===id?null:current);timers.current.delete(timer);},1600);timers.current.add(timer);
    };
    return {
      clear,
      triggerEvolution:(hero)=>{
        const p=center(`hero-card-${hero.id}`);if(!p)return;
        if(!isElement(hero.element))return;
        const school=schoolForElement(hero.element);
        announce({title:`${hero.name} despertou`,summary:'+1 ATQ · +2 Escudo até o fim da batalha',image:hero.image,kind:'evolution',school});
        emit(p,p,'gold_blast','EVOLUÍDO',false,undefined,undefined,{id:hero.id,name:hero.name,image:hero.image,element:hero.element,casting:true},school,{intensity:'legendary',evolution:true});
        cueCharacter(`hero-card-${hero.id}`,'cast');
      },
      triggerHeroPower:(hero,targets)=>{
        if(!isElement(hero.element))return;
        const sourceId=`hero-card-${hero.id}`,from=center(sourceId);if(!from)return;
        const power=heroPowerPresentation(hero);
        announce({title:power.title,summary:power.summary,image:hero.image,kind:'hero',school:power.school});
        cueCharacter(sourceId,'cast');
        for(const target of targets){
          const id=`hero-card-${target.id}`,to=center(id);if(!to)continue;
          emit(from,to,target.type,target.label,hero.id!==target.id,hero.element,undefined,{id:hero.id,name:hero.name,image:hero.image,element:hero.element,casting:true},power.school,{intensity:'legendary',variant:creatureVariantFor(hero,target.type)});
          if(target.type==='pierce'){
            const timer=setTimeout(()=>{cueCharacter(id,'hurt');timers.current.delete(timer);},PROJECTILE_IMPACT_MS);timers.current.add(timer);
          }
        }
      },
      triggerBoard:board,
      triggerOutcome:(id,outcome)=>{
        const p=center(id),impact=impactFor(outcome);if(!p||!impact)return;
        emit(p,p,impact==='blocked'||impact==='shield-break'?'shield':'arcane','',false,undefined,undefined,undefined,undefined,{impact});
      },
      revealCard:(card,casterId)=>{
        if(!isElement(card.element)||!Object.keys(abilityFor(card)).length)return;
        cueCharacter(casterId,'cast');
        const presentation=spellPresentation(card);
        announce({title:presentation.title,summary:card.description,image:card.image,kind:'elemental',school:presentation.school});
      },
      triggerBurst:(x,y,type,label,card)=>{if(!card||!isElement(card.element)||!Object.keys(abilityFor(card)).length)return;emit({x,y},{x,y},type,label,false,card.element,undefined,undefined,card.element,{variant:spellPresentation(card).variant});},
      triggerCardBurst:(id,type,label,card)=>{
        const p=center(id),actor=actorFor(id);if(!p||!actor)return;
        if(card&&(!isElement(card.element)||!Object.keys(abilityFor(card)).length))return;
        const element=card?.element||actor.element;
        emit(p,p,type,label,false,element,undefined,actor,element,{intensity:'normal',variant:card?spellPresentation(card).variant:elementalVariant(element,type)});
        cueCharacter(id,type==='shield'?'guard':'cast');
      },
      triggerAttack:(sourceId,targetId,type='slash',label,card)=>{
        const from=center(sourceId),to=center(targetId);if(!from||!to)return;
        const actor=actorFor(sourceId);
        if(!actor || (card&&(!isElement(card.element)||!Object.keys(abilityFor(card)).length)))return;
        const element=card?.element||actor.element;
        const profile=CHARACTER_PERSONALITY[actor.id];
        const combatLabel=label||(type==='shield'?profile?.guard:type==='slash'||type==='pierce'?profile?.attack:undefined);
        emit(from,to,type,combatLabel,sourceId!==targetId,element,undefined,{...actor,casting:!!card},element,{intensity:'normal',variant:card?spellPresentation(card).variant:elementalVariant(element,type)});
        cueCharacter(sourceId,card||type==='heal'||type==='arcane'?'cast':'attack');
        if(type==='slash'||type==='pierce'||type==='arcane'||type==='gold_blast'){
          const timer=setTimeout(()=>{cueCharacter(targetId,'hurt');timers.current.delete(timer);},PROJECTILE_IMPACT_MS);timers.current.add(timer);
        }
      },
    };
  });
  return <div className="combat-effects" aria-hidden="true"><SpellScene effects={effects}/>{effects.filter(e=>e.actor).slice(-1).map(e=><BattleActor key={e.id} effect={e}/>)}{effects.map(e=>{
    const dx=e.to.x-e.from.x,dy=e.to.y-e.from.y;
    const vars={'--fx-x':`${dx}px`,'--fx-y':`${dy}px`,'--fx-angle':`${Math.atan2(dy,dx)}rad`,'--fx-delay':e.travel?`${PROJECTILE_IMPACT_MS}ms`:'0ms'} as CSSProperties;
    if(e.impact)return <div key={e.id} className={`combat-outcome outcome-${e.impact}`} data-outcome={e.impact} style={{left:e.to.x,top:e.to.y}}><span className="outcome-seal">{e.impact==='blocked'?'⛨':e.impact==='shield-break'?'✧':e.impact==='lethal'?'✦':e.impact==='heavy'?'⚔':'✧'}</span></div>;
    return <div key={e.id} className={`combat-fx fx-${e.type} flavor-${e.flavor||"spell"} ${e.scope==='board'?'fx-board':''}`} data-evolution={e.evolution||undefined} data-intensity={e.intensity||'normal'} data-school={e.school} data-variant={e.variant} data-effect={e.type} data-travel={e.travel} data-scope={e.scope||'target'} style={vars}>
      <div className="scene-light" style={{left:e.to.x,top:e.to.y}}/>
      {e.travel&&<div className="casting-seal" style={{left:e.from.x,top:e.from.y}}><i/><span>✧</span></div>}
      {e.travel&&<div className="fx-flight" style={{left:e.from.x,top:e.from.y}}><div className="fx-bolt"><i/><b>{isElement(e.school)&&<ElementIcon element={e.school}/>}</b></div></div>}
      <div className="fx-impact" style={{left:e.to.x,top:e.to.y}}>
        <div className="impact-cracks"/><div className="fx-ring"/><div className="fx-ring fx-ring-second"/>
        {e.type==='shield'?<svg className="fx-symbol" viewBox="0 0 80 90"><path d="M40 5 72 17v27c0 20-17 33-32 41C25 77 8 64 8 44V17Z"/><path d="m23 43 12 12 23-27"/></svg>:e.type==='heal'?<span className="fx-symbol fx-plus">✚</span>:<span className="fx-symbol fx-star">{e.type==='slash'||e.type==='pierce'?'╱':'✦'}</span>}
        {Array.from({length:5},(_,i)=><i key={i} className="fx-spark" style={{'--spark-angle':`${i*72}deg`} as CSSProperties}/>)}
        <strong className="fx-label">{e.label}</strong>
      </div>
    </div>;
  })}{reveal&&<PowerAnnouncement key={reveal.id} power={reveal}/>}</div>;
});
