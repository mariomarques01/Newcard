import {useState} from 'react';
import type {Hero,ActionCard,Element} from '../types/game';
import {INITIAL_PLAYER_HEROES,INITIAL_RIVAL_HEROES,DECK_TEMPLATES} from '../data/gameData';
import {ElementIcon,elementLabel} from './ElementIcon';
export function CardCompendiumModal({onClose,onInspect}:{onClose:()=>void;onInspect:(item:Hero|ActionCard)=>void}) {
 const [element,setElement]=useState<Element|'all'>('all');
 const cards=[...INITIAL_PLAYER_HEROES,...INITIAL_RIVAL_HEROES,...DECK_TEMPLATES].filter(card=>element==='all'||card.element===element);
 return <div className="arena-modal" role="dialog" aria-modal="true" aria-label="Coleção elemental"><div><button className="close-log" onClick={onClose} aria-label="Fechar coleção">Fechar ×</button><h2>Coleção Elemental</h2><div className="elemental-filters">{(['all','fogo','agua','terra','ar'] as const).map(value=><button key={value} aria-pressed={element===value} onClick={()=>setElement(value)}>{value==='all'?'Todas':elementLabel(value)}</button>)}</div><div className="elemental-collection">{cards.map(card=><button key={card.id} onClick={()=>onInspect(card)}><img src={card.image} alt=""/><strong>{card.name}</strong><ElementIcon element={card.element}/><span>{'maxHp' in card?`Vida ${card.maxHp} · Ataque ${card.atk} · Defesa ${card.def}`:`Custo ${card.cost} de energia`}</span><small>{'maxHp' in card?card.acePowerDescription:card.description}</small></button>)}</div></div></div>;
}
