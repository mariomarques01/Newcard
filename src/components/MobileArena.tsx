import {useEffect,useRef,useState} from 'react';
import {evolutionCharge,EVOLUTION_ACTIONS} from '../game/evolution';
import {PROJECTILE_IMPACT_MS} from '../game/combatTiming';
import type { CSSProperties, PointerEvent } from 'react';
import type { Hero, ActionCard } from '../types/game';

export function ArenaHero({hero:liveHero, active, targeted, valid, hovered, hit, onSelect, onInspect, onStart}: {
  hero:Hero; active?:boolean; targeted?:boolean; valid?:boolean; hovered?:boolean; hit?:boolean;
  onSelect:()=>void; onInspect:()=>void; onStart?:(e:PointerEvent)=>void;
}) {
  // Keep target vitals visible during flight; gameplay still resolves immediately.
  const [vitals,setVitals]=useState(()=>({currentHp:liveHero.currentHp,shield:liveHero.shield,isAlive:liveHero.isAlive}));
  const shown=useRef(vitals);
  const [defeatBurst,setDefeatBurst]=useState(false);
  useEffect(()=>{
    const next={currentHp:liveHero.currentHp,shield:liveHero.shield,isAlive:liveHero.isAlive};
    const damaged=next.currentHp<shown.current.currentHp||next.shield<shown.current.shield;
    const apply=()=>{
      setDefeatBurst(shown.current.isAlive&&!next.isAlive);
      shown.current=next;setVitals(next);
    };
    if(!damaged){apply();return;}
    const timer=setTimeout(apply,PROJECTILE_IMPACT_MS);
    return()=>clearTimeout(timer);
  },[liveHero.currentHp,liveHero.shield,liveHero.isAlive]);
  const [evolutionVisible,setEvolutionVisible]=useState(!!liveHero.evolved);
  const [evolutionFlash,setEvolutionFlash]=useState(false);
  useEffect(()=>{
    if(!liveHero.evolved){setEvolutionVisible(false);setEvolutionFlash(false);return;}
    if(evolutionVisible)return;
    const timer=setTimeout(()=>{setEvolutionVisible(true);setEvolutionFlash(true);},PROJECTILE_IMPACT_MS);
    return()=>clearTimeout(timer);
  },[liveHero.evolved,evolutionVisible]);
  const hero={...liveHero,...vitals,evolved:evolutionVisible};
  const charge=evolutionCharge(liveHero);
  const ratio=hero.maxHp>0?hero.currentHp/hero.maxHp:0;
  const hpState=ratio<=.34?'low':ratio<=.67?'mid':'high';
  return <div id={`hero-card-${hero.id}`} data-evolved={evolutionVisible?'yes':'no'} data-evolution-charge={charge} data-hero-id={hero.id} data-suit={hero.suit} data-rank={hero.rank} data-hp={hpState} className={`arena-hero ${active?'active':''} ${targeted?'targeted':''} ${valid?'valid-target':''} ${hovered&&valid?'drop-target':''} ${!hero.isAlive?'fallen':''} ${defeatBurst?'defeat-fresh':''} ${evolutionFlash?'evolution-flash':''} ${hero.shield>0&&hero.isAlive?'protected':''} ${hit?'hero-under-attack':''}`}>
    <button className="hero-face" aria-label={`Selecionar ${hero.name}`} onClick={onSelect} onPointerDown={onStart} disabled={!liveHero.isAlive}>
      <img className="hero-original-art" src={hero.image} alt="" draggable={false} loading="eager" decoding="async"/>
      <span className="hero-evolution" aria-label={evolutionVisible?'Carta evoluída: +1 de ataque e +2 de escudo nesta batalha':`Evolução: ${charge} de ${EVOLUTION_ACTIONS} ações`} title={evolutionVisible?'Evoluída nesta batalha':`${charge}/${EVOLUTION_ACTIONS} ações para evoluir`}><b>{evolutionVisible?'✦':'✧'}</b>{evolutionVisible?'EVO':`${charge}/${EVOLUTION_ACTIONS}`}</span>
      {evolutionFlash&&<span className="evolution-transformation" aria-hidden="true"/>}
      {hero.shield>0&&hero.isAlive&&<span className="hero-barrier" aria-label={`Protegido por ${hero.shield} de escudo`}><span>⛨</span></span>}
      <span className="hero-hp" aria-label={`Vida ${hero.currentHp} de ${hero.maxHp}`}>♥ {hero.currentHp}<small>/{hero.maxHp}</small></span>
      <span className="hero-condition">{!hero.isAlive?'ABATIDO':hero.isDefending?'DEFENDENDO':hero.hasAttacked?'AGIU':active?'ATIVO':targeted?'ALVO':''}</span>
      <span className="hero-name">{hero.name}</span>
      <span className="hero-stats"><span className="atk-stat" aria-label={`Ataque ${hero.atk}`}>⚔ {hero.atk}</span><span className="shield-stat" aria-label={`Escudo ${hero.shield}`}>⛨ {hero.shield}</span></span>
      <span className="hero-health"><i style={{width:`${ratio*100}%`}}/></span>
    </button>
    {defeatBurst&&<div className="hero-defeat-burst" aria-hidden="true"><span className="defeat-flash"/>{Array.from({length:10},(_,i)=><i key={i} style={{'--piece':i} as CSSProperties}/>)}</div>}
    <button className="hero-info" aria-label={`Habilidade de ${hero.name}`} onClick={onInspect}>i</button>
  </div>;
}
export function ArenaHand({card,selected,affordable,missingEnergy=0,index=0,count=1,onSelect,onInspect,onStart}: {
  card:ActionCard;selected:boolean;affordable:boolean;missingEnergy?:number;index?:number;count?:number;onSelect:()=>void;onInspect:()=>void;onStart:(e:PointerEvent)=>void;
}) {
  const style={'--n':count,'--c':index-(count-1)/2,'--ov':count<=3?'0px':count===4?'10px':'18px'} as CSSProperties;
  return <div id={`hand-card-${card.id}`} style={style} data-type={card.type} data-playable={affordable?'yes':'no'} data-selected={selected?'yes':'no'} data-suit={card.suit} className={`arena-hand-card ${selected?'selected':''} ${!affordable?'unaffordable':''} ${card.type==='joker'?'special-joker':card.rank==='A'?'special-ace':''}`}>
    <button className="hand-face" onClick={onSelect} onPointerDown={onStart} aria-pressed={selected} aria-label={`Selecionar ${card.name}, custo ${card.cost} de energia${affordable?', disponível para jogar':`, faltam ${missingEnergy} de energia`}`} >
      <img src={card.image} alt={card.name} draggable={false}/><b className="energy-cost">{card.cost}</b>
      {selected&&<span className="hand-selected-indicator" aria-hidden="true">✓</span>}
      {!affordable&&<span className="hand-lack">⚡ falta {missingEnergy}</span>}
      {selected&&<span className="hand-ability" aria-label={`Habilidade: ${card.description}`}>{card.description}</span>}
      <span className="hand-name">{card.name}</span>
    </button>
    <button className="hand-info" onClick={onInspect} aria-label={`Habilidade de ${card.name}`}>i</button>
  </div>;
}
