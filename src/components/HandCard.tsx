import React from 'react';
import { ActionCard } from '../types/game';
import { SuitIcon } from './SuitIcon';
import { Zap, Eye, Move } from 'lucide-react';

interface HandCardProps {
  card: ActionCard;
  isSelected: boolean;
  canAfford: boolean;
  isDragging?: boolean;
  enterDelay?: number;
  onClick: () => void;
  onInspect: (card: ActionCard) => void;
  onDragStartAction?: (card: ActionCard, e: React.PointerEvent) => void;
}

export const HandCard: React.FC<HandCardProps> = ({
  card,
  isSelected,
  canAfford,
  isDragging = false,
  enterDelay = 0,
  onClick,
  onInspect,
  onDragStartAction,
}) => {
  // Suit-based background gradient
  let bgGradient = 'from-slate-900 via-slate-950 to-black';
  let borderStyle = 'border-amber-900/50 hover:border-amber-400';
  let stateTransform = '';

  if (card.suit === 'coringa') {
    bgGradient = 'from-purple-950/90 via-slate-950 to-indigo-950';
    borderStyle = 'border-purple-500/70 hover:border-purple-300';
  } else if (card.suit === 'espadas') {
    bgGradient = 'from-sky-950/70 via-slate-950 to-slate-900';
    borderStyle = 'border-sky-700/60 hover:border-sky-400';
  } else if (card.suit === 'copas') {
    bgGradient = 'from-rose-950/70 via-slate-950 to-slate-900';
    borderStyle = 'border-rose-700/60 hover:border-rose-400';
  } else if (card.suit === 'ouros') {
    bgGradient = 'from-amber-950/70 via-slate-950 to-slate-900';
    borderStyle = 'border-amber-700/60 hover:border-amber-400';
  } else if (card.suit === 'paus') {
    bgGradient = 'from-emerald-950/70 via-slate-950 to-slate-900';
    borderStyle = 'border-emerald-700/60 hover:border-emerald-400';
  }

  // Hearthstone-style Playable Green Glow
  if (canAfford && !isSelected && !isDragging) {
    borderStyle = 'border-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.7)] ring-1 ring-emerald-400/80';
  }

  if (isSelected) {
    borderStyle = 'border-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.8)] ring-2 ring-amber-300/80';
    stateTransform = '-translate-y-4 scale-105';
  }

  if (isDragging) {
    stateTransform = 'scale-95 opacity-50 ring-2 ring-amber-400';
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canAfford) return;
    if (onDragStartAction) {
      onDragStartAction(card, e);
    }
  };

  return (
    <div
      onClick={canAfford ? onClick : undefined}
      onPointerDown={handlePointerDown}
      className={`relative group cursor-grab active:cursor-grabbing card-fluid-transition animate-card-deal select-none rounded-xl overflow-hidden bg-gradient-to-b ${bgGradient} border-2 ${borderStyle} ${stateTransform} ${
        !canAfford
          ? 'opacity-40 grayscale cursor-not-allowed hover:translate-y-0'
          : 'hover:-translate-y-2.5 hover:scale-[1.03] hover:shadow-2xl'
      } flex flex-col justify-between shrink-0 snap-center`}
      style={{
        width: '106px',
        minWidth: '100px',
        height: '156px',
        animationDelay: `${enterDelay}ms`,
        touchAction: 'none',
      }}
    >
      {/* Energy Cost Crystal Orb (Hearthstone Mana style) */}
      <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 z-20 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border border-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.9)] text-slate-950 font-black font-mono text-[10px] sm:text-xs">
        <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-[-2px] text-yellow-300 fill-yellow-300" />
        <span>{card.cost}</span>
      </div>

      {/* Top Header: Rank & Suit */}
      <div className="relative pl-6 sm:pl-8 pr-1 pt-1 pb-0.5 sm:pt-1.5 sm:pb-1 flex items-center justify-between border-b border-white/5">
        <span className="font-royal text-[8.5px] sm:text-[10px] font-bold text-slate-200 truncate pr-0.5">
          {card.name}
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          <span className="font-mono font-bold text-[10px] sm:text-xs text-amber-300">{card.rank}</span>
          <SuitIcon suit={card.suit} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </div>
      </div>

      {/* Card Artwork / Icon center slot */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-0.5 sm:p-1 overflow-hidden bg-black/20 min-h-0">
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top rounded filter brightness-95 group-hover:brightness-105 transition-all pointer-events-none"
          />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center rounded bg-slate-900/40 border border-white/5 p-1 text-center pointer-events-none">
            <SuitIcon suit={card.suit} className="w-6 h-6 sm:w-8 sm:h-8 opacity-70 group-hover:scale-110 transition-transform mb-1" />
            <p className="text-[8px] sm:text-[9px] text-slate-300 line-clamp-2 leading-tight px-0.5 font-medium">
              {card.description}
            </p>
          </div>
        )}

        {/* Drag Hint on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
          <span className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-amber-300 uppercase tracking-widest bg-black/80 px-1.5 py-0.5 rounded-full border border-amber-400/50">
            <Move className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> Arraste
          </span>
        </div>

        {/* Quick Inspect Button - Visible on touch devices and hover */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInspect(card);
          }}
          className="absolute top-0.5 right-0.5 opacity-70 md:opacity-0 md:group-hover:opacity-100 p-1 bg-black/80 hover:bg-black text-amber-300 rounded transition-all z-20 cursor-pointer"
          title="Ver detalhes da carta"
        >
          <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>

      {/* Effect Badge Banner */}
      <div className="p-0.5 sm:p-1 bg-slate-950/90 border-t border-amber-900/30 flex flex-col gap-0.5">
        <div
          className={`w-full py-0.2 sm:py-0.5 px-0.5 sm:px-1 rounded text-center text-[8.5px] sm:text-[10px] font-extrabold tracking-wider border shadow-sm ${card.badgeColor} uppercase truncate`}
        >
          {card.badgeText}
        </div>
        <span className="text-[7.5px] sm:text-[8.5px] text-slate-300 text-center truncate px-0.5 font-medium leading-tight">
          {card.description}
        </span>
      </div>
    </div>
  );
};
