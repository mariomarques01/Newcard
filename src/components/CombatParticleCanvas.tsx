import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties } from 'react';
import './combat-effects.css';

export type ParticleEffectType = 'slash' | 'arcane' | 'gold_blast' | 'pierce' | 'heal' | 'shield';
export interface CombatParticleCanvasRef {
  triggerBurst: (x:number,y:number,type:ParticleEffectType,label?:string)=>void;
  triggerCardBurst: (elementId:string,type:ParticleEffectType,label?:string)=>void;
  triggerAttack: (sourceId:string,targetId:string,type?:ParticleEffectType,label?:string)=>void;
  clear: ()=>void;
}
type Point = {x:number;y:number};
type Effect = {id:number;from:Point;to:Point;type:ParticleEffectType;label:string;travel:boolean};
const labels:Record<ParticleEffectType,string>={slash:'ATAQUE',pierce:'PERFURAÇÃO',shield:'DEFESA',heal:'CURA',arcane:'MAGIA',gold_blast:'PODER REAL'};
const center=(id:string):Point|null=>{
  const rect=document.getElementById(id)?.getBoundingClientRect();
  return rect?{x:rect.left+rect.width/2,y:rect.top+rect.height/2}:null;
};
export const CombatParticleCanvas=forwardRef<CombatParticleCanvasRef>(function CombatEffects(_,ref){
  const [effects,setEffects]=useState<Effect[]>([]);
  const sequence=useRef(0);
  const timers=useRef(new Set<ReturnType<typeof setTimeout>>());
  const clear=()=>{timers.current.forEach(clearTimeout);timers.current.clear();setEffects([]);};
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);timers.current.clear();},[]);
  useImperativeHandle(ref,()=>{
    const emit=(from:Point,to:Point,type:ParticleEffectType,label?:string,travel=false)=>{
      const id=++sequence.current;
      setEffects(prev=>[...prev.slice(-15),{id,from,to,type,label:label||labels[type],travel}]);
      const timer=setTimeout(()=>{setEffects(prev=>prev.filter(e=>e.id!==id));timers.current.delete(timer);},1500);
      timers.current.add(timer);
    };
    return {
      clear,
      triggerBurst:(x,y,type,label)=>emit({x,y},{x,y},type,label),
      triggerCardBurst:(id,type,label)=>{const p=center(id);if(p)emit(p,p,type,label);},
      triggerAttack:(sourceId,targetId,type='slash',label)=>{
        const from=center(sourceId),to=center(targetId);if(!from||!to)return;
        emit(from,to,type,label,true);
        if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          document.getElementById(sourceId)?.animate([{transform:'translate(0,0)'},{transform:`translate(${(to.x-from.x)*.09}px,${(to.y-from.y)*.09}px) scale(1.04)`,offset:.35},{transform:'translate(0,0)'}],{duration:430,easing:'ease-out'});
        }
      },
    };
  });
  return <div className="combat-effects" aria-hidden="true">{effects.map(e=>{
    const dx=e.to.x-e.from.x,dy=e.to.y-e.from.y;
    const vars={'--fx-x':`${dx}px`,'--fx-y':`${dy}px`,'--fx-angle':`${Math.atan2(dy,dx)}rad`,'--fx-delay':e.travel?'380ms':'0ms'} as CSSProperties;
    return <div key={e.id} className={`combat-fx fx-${e.type}`} data-effect={e.type} data-travel={e.travel} style={vars}>
      {e.travel&&<div className="fx-flight" style={{left:e.from.x,top:e.from.y}}><div className="fx-bolt"><i/><b>✦</b></div></div>}
      <div className="fx-impact" style={{left:e.to.x,top:e.to.y}}>
        <div className="fx-ring"/><div className="fx-ring fx-ring-second"/>
        {e.type==='shield'?<svg className="fx-symbol" viewBox="0 0 80 90"><path d="M40 5 72 17v27c0 20-17 33-32 41C25 77 8 64 8 44V17Z"/><path d="m23 43 12 12 23-27"/></svg>:e.type==='heal'?<span className="fx-symbol fx-plus">✚</span>:<span className="fx-symbol fx-star">{e.type==='slash'||e.type==='pierce'?'╱':'✦'}</span>}
        {Array.from({length:8},(_,i)=><i key={i} className="fx-spark" style={{'--spark-angle':`${i*45}deg`} as CSSProperties}/>)}
        <strong className="fx-label">{e.label}</strong>
      </div>
    </div>;
  })}</div>;
});
