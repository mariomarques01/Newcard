import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from 'react';
import './combat-effects.css';
import './combat-polish-v2.css';
import './combat-cinematic-v3.css';
import './combat-target-focus-v45.css';
import './combat-choreography.css';
import {cueCharacter,attackFlavor} from '../game/characterMotion';
import {BattleActor} from './BattleActor';
import {spellPresentation,schoolForSuit} from '../game/spellPresentation';
import {CHARACTER_PERSONALITY} from '../game/characterMotion';
import {PROJECTILE_IMPACT_MS} from '../game/combatTiming';
import {impactFor,type CombatOutcome,type ImpactKind} from '../game/combatImpact';
import {PowerAnnouncement,type PowerAnnouncementData} from './PowerAnnouncement';
import {heroPowerPresentation,type HeroPowerTarget} from '../game/heroPowerPresentation';
import {SpellScene} from './SpellScene';
import type {ActionCard,Hero} from '../types/game';

export type ParticleEffectType = 'slash' | 'arcane' | 'gold_blast' | 'pierce' | 'heal' | 'shield';
export interface CombatParticleCanvasRef {
  triggerBurst: (x:number,y:number,type:ParticleEffectType,label?:string,card?:ActionCard)=>void;
  triggerCardBurst: (elementId:string,type:ParticleEffectType,label?:string,card?:ActionCard)=>void;
  triggerAttack: (sourceId:string,targetId:string,type?:ParticleEffectType,label?:string,card?:ActionCard)=>void;
  triggerBoard: (type:ParticleEffectType,label:string,card?:ActionCard)=>void;
  revealCard: (card:ActionCard,casterId:string)=>void;
  triggerHeroPower:(hero:Hero,targets:HeroPowerTarget[])=>void;
  triggerOutcome:(elementId:string,outcome:CombatOutcome)=>void;
  clear: ()=>void;
}
type Point = {x:number;y:number};
export type BattleEffect = {id:number;from:Point;to:Point;type:ParticleEffectType;label:string;travel:boolean;flavor?:string;school?:string;started:number;intensity?:'normal'|'legendary';impact?:ImpactKind;scope?:'board';actor?:{id:string;name:string;casting?:boolean}};
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
  const [reveal,setReveal]=useState<PowerAnnouncementData|null>(null);
  const sequence=useRef(0);
  const revealSequence=useRef(0);
  const timers=useRef(new Set<ReturnType<typeof setTimeout>>());
  const clear=()=>{timers.current.forEach(clearTimeout);timers.current.clear();setEffects([]);setReveal(null);
    document.querySelectorAll('[data-hero-id]').forEach(el=>cueCharacter(el.id,'idle'));};
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);timers.current.clear();},[]);
  useImperativeHandle(ref,()=>{
    const emit=(from:Point,to:Point,type:ParticleEffectType,label?:string,travel=false,flavor?:string,scope?:'board',actor?:BattleEffect['actor'],school?:string,presentation:Pick<BattleEffect,'intensity'|'impact'>={})=>{
      const id=++sequence.current;
      setEffects(prev=>[...prev.slice(-(MAX_ACTIVE_EFFECTS - 1)),{id,from,to,type,label:label||labels[type],travel,flavor,scope,actor,school,...presentation,started:performance.now()}]);
      const timer=setTimeout(()=>{setEffects(prev=>prev.filter(e=>e.id!==id));timers.current.delete(timer);},EFFECT_LIFETIME_MS);
      timers.current.add(timer);
    };
    const actorFor=(id:string)=>{const el=document.getElementById(id);const heroId=el?.dataset.heroId;return heroId?{id:heroId,name:el?.querySelector('.hero-name')?.textContent||''}:undefined;};
    const board=(type:ParticleEffectType,label:string,card?:ActionCard)=>{
      const rect=document.querySelector('[data-battlefield]')?.getBoundingClientRect();
      if(rect){const p={x:rect.left+rect.width/2,y:rect.top+rect.height/2};emit(p,p,type,label,false,undefined,'board',undefined,card?spellPresentation(card).school:undefined,{intensity:card?spellPresentation(card).intensity:'normal'});}
    };
    const announce=(data:Omit<PowerAnnouncementData,'id'|'y'>)=>{
      const rect=document.querySelector('.battle-divider')?.getBoundingClientRect();
      const y=Math.max(48,Math.min(window.innerHeight-105,rect?rect.top+rect.height/2-32:window.innerHeight*.45));
      const id=++revealSequence.current;setReveal({...data,id,y});
      const timer=setTimeout(()=>{setReveal(current=>current?.id===id?null:current);timers.current.delete(timer);},1600);timers.current.add(timer);
    };
    return {
      clear,
      triggerHeroPower:(hero,targets)=>{
        const sourceId=`hero-card-${hero.id}`,from=center(sourceId);if(!from)return;
        const power=heroPowerPresentation(hero);
        announce({title:power.title,summary:power.summary,image:hero.image,kind:'hero',school:power.school});
        cueCharacter(sourceId,hero.rank==='J'?'attack':'cast');
        for(const target of targets){
          const id=`hero-card-${target.id}`,to=center(id);if(!to)continue;
          emit(from,to,target.type,target.label,hero.id!==target.id,hero.rank==='J'?'flame':hero.rank==='Q'?'heart':'blade',undefined,{id:hero.id,name:hero.name,casting:hero.rank!=='J'},power.school,{intensity:'legendary'});
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
        cueCharacter(casterId,'cast');
        if(card.type==='joker'||card.rank==='A'){
          const presentation=spellPresentation(card);
          announce({title:presentation.title,summary:card.description,image:card.image,kind:card.type==='joker'?'joker':'ace',school:presentation.school});board(card.type==='joker'?'arcane':'gold_blast',card.skillName||card.name,card);
        }
      },
      triggerBurst:(x,y,type,label,card)=>emit({x,y},{x,y},type,label,false,undefined,undefined,undefined,card?spellPresentation(card).school:undefined,{intensity:card?spellPresentation(card).intensity:'normal'}),
      triggerCardBurst:(id,type,label,card)=>{const p=center(id);if(p){emit(p,p,type,label,false,undefined,undefined,type==='shield'||type==='gold_blast'?actorFor(id):undefined,card?spellPresentation(card).school:undefined,{intensity:card?spellPresentation(card).intensity:'normal'});if(type==='shield')cueCharacter(id,'guard');else if(type==='gold_blast'||type==='arcane'||type==='heal')cueCharacter(id,'cast');}},
      triggerAttack:(sourceId,targetId,type='slash',label,card)=>{
        const from=center(sourceId),to=center(targetId);if(!from||!to)return;
        const source=document.getElementById(sourceId);
        const suit=source?.dataset.suit as Hero['suit']|undefined;
        const rank=source?.dataset.rank as Hero['rank']|undefined;
        const flavor=card?({steel:'blade',nature:'heart',solar:'coin',storm:'thorn',wild:'spell'} as const)[spellPresentation(card).school]:suit&&rank?attackFlavor({suit,rank}):undefined;
        const royal=source?.dataset.heroId?CHARACTER_PERSONALITY[source.dataset.heroId]:undefined;
        const combatLabel=label||(type==='shield'?royal?.guard:type==='slash'||type==='pierce'?royal?.attack:undefined);
        const actor=actorFor(sourceId);
        emit(from,to,type,combatLabel,sourceId!==targetId,flavor,undefined,actor?{...actor,casting:!!card}:undefined,card?spellPresentation(card).school:suit?schoolForSuit(suit):undefined,{intensity:card?spellPresentation(card).intensity:'normal'});
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
    return <div key={e.id} className={`combat-fx fx-${e.type} flavor-${e.flavor||"spell"} ${e.scope==='board'?'fx-board':''}`} data-intensity={e.intensity||'normal'} data-school={e.school} data-effect={e.type} data-travel={e.travel} data-scope={e.scope||'target'} style={vars}>
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
  })}{reveal&&<PowerAnnouncement key={reveal.id} power={reveal}/>}</div>;
});
