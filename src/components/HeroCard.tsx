import React, { useState, useEffect, useRef } from 'react';
import { Hero } from '../types/game';
import { SuitIcon } from './SuitIcon';
import { Shield, Swords, Heart, Crosshair, Eye, Sparkles, Flame, Target } from 'lucide-react';

interface HeroCardProps {
  hero: Hero;
  isPlayer: boolean;
  isActive?: boolean;
  isTargeted?: boolean;
  isHoveredAsTarget?: boolean;
  isHit?: boolean;
  enterDelay?: number;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onInspect: (hero: Hero) => void;
  onDragStartAttack?: (hero: Hero, e: React.PointerEvent) => void;
  onPointerEnterTarget?: (heroId: string) => void;
  onPointerLeaveTarget?: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  hero,
  isPlayer,
  isActive = false,
  isTargeted = false,
  isHoveredAsTarget = false,
  isHit = false,
  enterDelay = 0,
  onClick,
  onInspect,
  onDragStartAttack,
  onPointerEnterTarget,
  onPointerLeaveTarget,
}) => {
  const [internalHit, setInternalHit] = useState(false);
  const prevHpRef = useRef(hero.currentHp);
  const prevShieldRef = useRef(hero.shield);

  // Monitor damage taken (HP or Shield) to trigger animate-card-hit
  useEffect(() => {
    if (hero.currentHp < prevHpRef.current || hero.shield < prevShieldRef.current) {
      setInternalHit(true);
      const timer = setTimeout(() => {
        setInternalHit(false);
      }, 420);
      prevHpRef.current = hero.currentHp;
      prevShieldRef.current = hero.shield;
      return () => clearTimeout(timer);
    }
    prevHpRef.current = hero.currentHp;
    prevShieldRef.current = hero.shield;
  }, [hero.currentHp, hero.shield]);

  const takingHit = isHit || internalHit;
  const hpPercent = Math.max(0, Math.min(100, (hero.currentHp / hero.maxHp) * 100));

  let hpBarColor = 'bg-emerald-500';
  if (hpPercent < 30) {
    hpBarColor = 'bg-red-500';
  } else if (hpPercent < 60) {
    hpBarColor = 'bg-amber-500';
  }

  // Dynamic state classes with fluid transition
  let borderClasses = 'border-amber-900/40 hover:border-amber-500/50';
  let stateTransform = '';

  if (!hero.isAlive) {
    borderClasses = 'border-slate-800 opacity-50 grayscale';
  } else if (isHoveredAsTarget) {
    // Hearthstone targeted drop highlight
    borderClasses = 'border-rose-400 shadow-[0_0_28px_rgba(244,63,94,0.9)] ring-4 ring-rose-400 animate-pulse';
    stateTransform = 'scale-[1.06] -translate-y-2';
  } else if (isActive) {
    borderClasses = 'border-cyan-400 shadow-[0_0_22px_rgba(34,211,238,0.6)] ring-2 ring-cyan-400/80';
    stateTransform = 'scale-[1.03] -translate-y-1.5';
  } else if (isTargeted) {
    borderClasses = 'border-rose-500 shadow-[0_0_22px_rgba(244,63,94,0.7)] ring-2 ring-rose-500/80 animate-pulse';
    stateTransform = 'scale-[1.02]';
  } else if (hero.isDefending) {
    borderClasses = 'border-blue-400 shadow-[0_0_18px_rgba(96,165,250,0.5)]';
    stateTransform = 'scale-[1.01]';
  }

  const enterAnimationClass = isPlayer ? 'animate-card-slide-up' : 'animate-card-slide-down';

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPlayer && hero.isAlive && !hero.hasAttacked && onDragStartAttack) {
      onDragStartAttack(hero, e);
    }
  };

  return (
    <div
      id={`hero-card-${hero.id}`}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerEnter={() => onPointerEnterTarget && onPointerEnterTarget(hero.id)}
      onPointerLeave={() => onPointerLeaveTarget && onPointerLeaveTarget()}
      className={`relative group cursor-pointer card-fluid-transition ${
        takingHit ? 'animate-card-hit z-30' : enterAnimationClass
      } select-none rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 ${borderClasses} ${stateTransform} ${
        hero.isAlive ? 'hover:-translate-y-2 hover:shadow-2xl' : 'cursor-not-allowed'
      } flex flex-col justify-between`}
      style={{
        minHeight: '175px',
        maxWidth: '190px',
        width: '100%',
        animationDelay: `${enterDelay}ms`,
        touchAction: 'none',
      }}
    >
      {/* Top Header with Rank, Suit and Name */}
      <div className="relative px-1.5 sm:px-2 py-1 sm:py-1.5 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-900/40">
        <div className="flex items-center gap-0.5 sm:gap-1 font-royal font-black text-[10px] sm:text-xs md:text-sm text-amber-200">
          <span>{hero.rank}</span>
          <SuitIcon suit={hero.suit} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
        </div>

        <h3 className="font-royal text-[9px] sm:text-[11px] md:text-xs font-bold text-amber-100 truncate px-0.5 sm:px-1 tracking-wider text-center flex-1">
          {hero.name}
        </h3>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInspect(hero);
          }}
          className="opacity-70 md:opacity-0 md:group-hover:opacity-100 p-0.5 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
          title="Ver detalhes da carta"
        >
          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>

      {/* Card Artwork & Overlays */}
      <div className="relative h-20 sm:h-28 md:h-32 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
        {/* The generated high-res portrait image */}
        <img
          src={hero.image}
          alt={hero.name}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 pointer-events-none ${
            !hero.isAlive ? 'filter grayscale brightness-50 contrast-125' : ''
          }`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Fallback decorative element behind image */}
        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950/80 to-slate-950 p-2 text-center">
          <SuitIcon suit={hero.suit} className="w-8 h-8 opacity-40 mb-1" />
          <span className="text-[10px] text-amber-300/60 font-royal font-semibold">{hero.name}</span>
        </div>

        {/* Status Badges Overlay */}
        <div className="absolute top-1 left-1 flex flex-col gap-1 z-10 pointer-events-none">
          {hero.isDefending && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold text-blue-200 bg-blue-950/90 border border-blue-400/60 rounded backdrop-blur-xs">
              <Shield className="w-2.5 h-2.5 text-blue-400" />
              GUARDA
            </span>
          )}
          {hero.hasAttacked && isPlayer && (
            <span className="flex items-center gap-0.5 px-1 py-0.5 text-[9px] font-semibold text-slate-400 bg-slate-950/80 border border-slate-700 rounded backdrop-blur-xs">
              ATILIZOU
            </span>
          )}
        </div>

        {/* Target Reticle for rival */}
        {(isTargeted || isHoveredAsTarget) && (
          <div className="absolute inset-0 flex items-center justify-center bg-rose-950/35 backdrop-blur-[1px] pointer-events-none">
            {isHoveredAsTarget ? (
              <Target className="w-14 h-14 text-rose-400 animate-pulse drop-shadow-[0_0_12px_rgba(244,63,94,1)]" />
            ) : (
              <Crosshair className="w-10 h-10 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
            )}
          </div>
        )}

        {/* Active Hero Indicator Aura */}
        {isActive && isPlayer && (
          <div className="absolute top-1 right-1 z-10 flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-cyan-200 bg-cyan-950/90 border border-cyan-400/80 rounded backdrop-blur-xs pointer-events-none">
            <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
            ATIVO
          </div>
        )}

        {/* Drag to attack hint on player hero */}
        {isPlayer && hero.isAlive && !hero.hasAttacked && (
          <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
            <span className="text-[9px] font-bold text-cyan-300 flex items-center gap-1">
              <Swords className="w-2.5 h-2.5" /> Arraste p/ Atacar
            </span>
          </div>
        )}

        {/* Defeated overlay */}
        {!hero.isAlive && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-xs pointer-events-none">
            <span className="font-royal font-black text-xs text-red-400 tracking-widest border border-red-500/50 bg-red-950/80 px-2 py-1 rounded">
              DERROTADO
            </span>
          </div>
        )}
      </div>

      {/* HP & Shield Progress Bar */}
      <div className="px-2 pt-1 pb-0.5 bg-slate-950">
        <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium mb-0.5">
          <span className="flex items-center gap-1">
            <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-500" />
            <span className="font-semibold text-slate-200">VIDA</span>
          </span>
          <span className="font-mono tabular-nums text-xs">
            {hero.currentHp}/{hero.maxHp}
            {hero.shield > 0 && <span className="text-cyan-400 ml-1 font-bold">+{hero.shield}</span>}
          </span>
        </div>
        <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
          <div
            className={`h-full transition-all duration-300 ${hpBarColor}`}
            style={{ width: `${hpPercent}%` }}
          />
          {hero.shield > 0 && (
            <div
              className="absolute top-0 right-0 h-full bg-cyan-400 opacity-90 animate-pulse"
              style={{ width: `${Math.min(100, (hero.shield / 10) * 100)}%` }}
            />
          )}
        </div>
      </div>

      {/* Hero Unique Ability Badge Strip */}
      <div
        className="px-1 sm:px-1.5 py-0.5 bg-gradient-to-r from-amber-950/60 via-slate-900/80 to-amber-950/60 border-t border-b border-amber-500/20 flex items-center justify-between text-[8px] sm:text-[9px]"
        title={`${hero.passiveName}: ${hero.passiveDescription}`}
      >
        <span className="font-bold text-amber-300 flex items-center gap-0.5 truncate flex-1 min-w-0 pr-1">
          <Flame className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-400 shrink-0" />
          <span className="truncate">{hero.passiveName}</span>
        </span>
        <span className="text-[7px] sm:text-[8px] text-amber-200/60 font-mono tracking-tight shrink-0 hidden xs:inline">
          HABILIDADE
        </span>
      </div>

      {/* Hero Stats Footer (ATQ, DEF, ESC) */}
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-1 sm:py-1.5 bg-gradient-to-t from-black via-slate-950 to-slate-950 border-t border-amber-900/30 text-center">
        <div className="flex flex-col items-center justify-center p-0.5 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-[8px] sm:text-[9px] text-rose-300 font-medium flex items-center gap-0.5">
            <Swords className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-rose-400 shrink-0" />
            ATQ
          </span>
          <span className="font-mono text-[10px] sm:text-xs font-bold text-rose-100">{hero.atk}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-0.5 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-[8px] sm:text-[9px] text-sky-300 font-medium flex items-center gap-0.5">
            <Shield className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-sky-400 shrink-0" />
            DEF
          </span>
          <span className="font-mono text-[10px] sm:text-xs font-bold text-sky-100">{hero.def}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-0.5 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-[8px] sm:text-[9px] text-cyan-300 font-medium flex items-center gap-0.5">
            <Shield className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-cyan-400 fill-cyan-400/20 shrink-0" />
            ESC
          </span>
          <span className={`font-mono text-[10px] sm:text-xs font-bold ${hero.shield > 0 ? 'text-cyan-300 font-black' : 'text-slate-400'}`}>
            {hero.shield}
          </span>
        </div>
      </div>
    </div>
  );
};
