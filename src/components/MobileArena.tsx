import { CharacterPortrait } from './CharacterPortrait';
import type { CSSProperties, PointerEvent } from 'react';
import type { Hero, ActionCard } from '../types/game';

export function ArenaHero({hero, active, targeted, valid, hovered, hit, onSelect, onInspect, onStart}: {
  hero:Hero; active?:boolean; targeted?:boolean; valid?:boolean; hovered?:boolean; hit?:boolean;
  onSelect:()=>void; onInspect:()=>void; onStart?:(e:PointerEvent)=>void;
}) {
  const ratio=hero.maxHp>0?hero.currentHp/hero.maxHp:0;
  const hpState=ratio<=.34?'low':ratio<=.67?'mid':'high';
  return <div id={`hero-card-${hero.id}`} data-hero-id={hero.id} data-suit={hero.suit} data-rank={hero.rank} data-hp={hpState} className={`arena-hero ${active?'active':''} ${targeted?'targeted':''} ${valid?'valid-target':''} ${hovered&&valid?'drop-target':''} ${!hero.isAlive?'fallen':''} ${hero.shield>0&&hero.isAlive?'protected':''} ${hit?'hero-under-attack':''}`}>
    <button className="hero-face" aria-label={`Selecionar ${hero.name}`} onClick={onSelect} onPointerDown={onStart} disabled={!hero.isAlive}>
      <CharacterPortrait hero={hero}/>
      {hero.shield>0&&hero.isAlive&&<span className="hero-barrier" aria-label={`Protegido por ${hero.shield} de escudo`}><span>⛨</span></span>}
      <span className="hero-hp" aria-label={`Vida ${hero.currentHp} de ${hero.maxHp}`}>♥ {hero.currentHp}<small>/{hero.maxHp}</small></span>
      <span className="hero-condition">{!hero.isAlive?'ABATIDO':hero.isDefending?'DEFENDENDO':hero.hasAttacked?'AGIU':active?'ATIVO':targeted?'ALVO':''}</span>
      <span className="hero-name">{hero.name}</span>
      <span className="hero-stats"><span className="atk-stat" aria-label={`Ataque ${hero.atk}`}>⚔ {hero.atk}</span><span className="shield-stat" aria-label={`Escudo ${hero.shield}`}>⛨ {hero.shield}</span></span>
      <span className="hero-health"><i style={{width:`${ratio*100}%`}}/></span>
    </button>
    {!hero.isAlive&&<div className="hero-defeat-burst" aria-hidden="true"><span className="defeat-flash"/>{Array.from({length:10},(_,i)=><i key={i} style={{'--piece':i} as CSSProperties}/>)}</div>}
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
      <span className="hand-name">{card.name}</span>
    </button>
    <button className="hand-info" onClick={onInspect} aria-label={`Habilidade de ${card.name}`}>i</button>
  </div>;
}
