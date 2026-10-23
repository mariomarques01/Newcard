import { CharacterPortrait } from './CharacterPortrait';
import type { PointerEvent } from 'react';
import type { Hero, ActionCard } from '../types/game';

export function ArenaHero({hero, active, targeted, valid, hovered, hit, onSelect, onInspect, onStart}: {
  hero:Hero; active?:boolean; targeted?:boolean; valid?:boolean; hovered?:boolean; hit?:boolean;
  onSelect:()=>void; onInspect:()=>void; onStart?:(e:PointerEvent)=>void;
}) {
  return <div id={`hero-card-${hero.id}`} data-hero-id={hero.id} data-suit={hero.suit} data-rank={hero.rank} className={`arena-hero ${active?'active':''} ${targeted?'targeted':''} ${valid?'valid-target':''} ${hovered&&valid?'drop-target':''} ${!hero.isAlive?'fallen':''} ${hero.shield>0&&hero.isAlive?'protected':''} ${hit?'hero-under-attack':''}`}>
    <button className="hero-face" aria-label={`Selecionar ${hero.name}`} onClick={onSelect} onPointerDown={onStart} disabled={!hero.isAlive}>
      <CharacterPortrait hero={hero}/>
      {hero.shield>0&&hero.isAlive&&<span className="hero-barrier" aria-label={`Protegido por ${hero.shield} de escudo`}><span>⛨</span></span>}
      <span className="hero-name">{hero.name}</span>
      <span className="hero-condition">{!hero.isAlive?'ABATIDO':hero.isDefending?'DEFENDENDO':hero.hasAttacked?'AGIU':active?'ATIVO':''}</span>
      <span className="hero-stats"><b>♥ {hero.currentHp}<small>/{hero.maxHp}</small></b><span>⚔ {hero.atk}</span><span className="shield-stat">⛨ {hero.shield}</span></span>
      <span className="hero-health"><i style={{width:`${hero.currentHp/hero.maxHp*100}%`}}/></span>
    </button>
    <button className="hero-info" aria-label={`Habilidade de ${hero.name}`} onClick={onInspect}>i</button>
  </div>;
}
export function ArenaHand({card,selected,affordable,onSelect,onInspect,onStart}: {
  card:ActionCard;selected:boolean;affordable:boolean;onSelect:()=>void;onInspect:()=>void;onStart:(e:PointerEvent)=>void;
}) {
  return <div id={`hand-card-${card.id}`} className={`arena-hand-card ${selected?'selected':''} ${!affordable?'unaffordable':''} ${card.type==='joker'?'special-joker':card.rank==='A'?'special-ace':''}`}>
    <button className="hand-face" onClick={onSelect} onPointerDown={onStart} aria-label={`Selecionar ${card.name}, ${card.cost} energia`}>
      <img src={card.image} alt={card.name} draggable={false}/><b className="energy-cost">{card.cost}</b>
      <span className="hand-name">{card.name}</span>
    </button>
    <button className="hand-info" onClick={onInspect} aria-label={`Habilidade de ${card.name}`}>i</button>
  </div>;
}
