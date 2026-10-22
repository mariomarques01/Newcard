import React from 'react';
import { Hero } from '../types/game';
import { SuitIcon } from './SuitIcon';
import { Swords, Shield, Heart, Sparkles, Flame, Info } from 'lucide-react';

interface ActiveHeroBannerProps {
  hero: Hero | undefined;
  onInspect: (hero: Hero) => void;
}

export const ActiveHeroBanner: React.FC<ActiveHeroBannerProps> = ({ hero, onInspect }) => {
  if (!hero) return null;

  return (
    <div className="relative w-full rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 p-2 sm:p-3 shadow-lg flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
      {/* Decorative Golden Corner Accents */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-amber-400" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-amber-400" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-amber-400" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-amber-400" />

      {/* Hero Mini Avatar with Rank & Suit Badge */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <div
          onClick={() => onInspect(hero)}
          className="relative group cursor-pointer w-12 h-16 sm:w-16 sm:h-20 md:w-20 md:h-24 rounded-lg overflow-hidden border-2 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.3)] shrink-0 transition-transform group-hover:scale-105 active:scale-95"
          title="Toque para inspecionar carta"
        >
          <img
            src={hero.image}
            alt={hero.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent py-0.5 text-center">
            <span className="font-royal font-black text-[9px] sm:text-[10px] text-amber-300 flex items-center justify-center gap-0.5">
              {hero.rank}
              <SuitIcon suit={hero.suit} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </span>
          </div>
        </div>

        {/* Mobile Header and Status next to avatar on small screens */}
        <div className="flex-1 min-w-0 sm:hidden">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[8px] font-bold tracking-widest text-amber-400/90 font-royal uppercase border border-amber-500/30 px-1 py-0.2 rounded bg-amber-950/40">
              COMANDO
            </span>
            <h2 className="font-royal text-xs font-black text-amber-100 truncate">
              {hero.name}
            </h2>
          </div>
          <p className="text-[10px] text-amber-200/90 font-medium truncate flex items-center gap-1">
            {hero.hasAttacked ? (
              <>
                <Info className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">Já atacou. Use cartas ou passe o turno.</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-cyan-300 shrink-0" />
                <span className="truncate">Pronto! Arraste ou clique para atacar.</span>
              </>
            )}
          </p>
          <div className="text-[9px] text-amber-300/80 truncate mt-0.5 flex items-center gap-1">
            <Flame className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-300">{hero.passiveName}:</span>
            <span className="text-slate-300 truncate">{hero.passiveDescription}</span>
          </div>
        </div>
      </div>

      {/* Main Info & Tactical Context (Tablet & Desktop) */}
      <div className="hidden sm:block flex-1 min-w-0 text-left">
        <div className="flex flex-wrap items-center justify-start gap-2 mb-1">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-amber-400/90 font-royal uppercase border border-amber-500/30 px-1.5 py-0.5 rounded bg-amber-950/40">
            HERÓI EM COMANDO
          </span>
          <h2 className="font-royal text-sm sm:text-base md:text-lg font-black text-amber-100 truncate">
            {hero.name}
          </h2>
          <span className="text-xs text-slate-400 hidden lg:inline">
            — {hero.title}
          </span>
        </div>

        {/* Live Status readout */}
        <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium mb-1.5 flex items-center justify-start gap-1.5">
          {hero.hasAttacked ? (
            <>
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Você já atacou com este campeão. Jogue uma carta de apoio ou encerre o turno.</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Pronto para o combate! Escolha um herói rival para atacar ou adote postura de defesa.</span>
            </>
          )}
        </p>

        {/* Passive & Ace Ability Preview */}
        <div className="flex flex-wrap items-center justify-start gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-300">{hero.passiveName}:</span>
            <span className="text-slate-300 truncate max-w-[160px] md:max-w-xs">{hero.passiveDescription}</span>
          </div>

          <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-200">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 shrink-0" />
            <span className="font-semibold text-cyan-300">Ás:</span>
            <span className="text-cyan-100 truncate max-w-[150px] md:max-w-xs">{hero.acePowerDescription}</span>
          </div>
        </div>
      </div>

      {/* Hero Vital Attributes Strip */}
      <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 w-full sm:w-auto shrink-0 bg-black/40 border border-amber-900/40 p-1 sm:p-2 rounded-lg">
        <div className="flex flex-1 sm:flex-initial flex-col items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-rose-950/40 border border-rose-900/50 rounded">
          <span className="text-[8px] sm:text-[10px] text-rose-300 flex items-center gap-0.5">
            <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500 fill-rose-500 shrink-0" />
            VIDA
          </span>
          <span className="font-mono text-[10px] sm:text-xs font-bold text-rose-100">
            {hero.currentHp}/{hero.maxHp}
          </span>
        </div>

        <div className="flex flex-1 sm:flex-initial flex-col items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-950/40 border border-red-900/50 rounded">
          <span className="text-[8px] sm:text-[10px] text-red-300 flex items-center gap-0.5">
            <Swords className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 shrink-0" />
            ATQ
          </span>
          <span className="font-mono text-[10px] sm:text-xs font-bold text-red-100">{hero.atk}</span>
        </div>

        <div className="flex flex-1 sm:flex-initial flex-col items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-sky-950/40 border border-sky-900/50 rounded">
          <span className="text-[8px] sm:text-[10px] text-sky-300 flex items-center gap-0.5">
            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-400 shrink-0" />
            DEF
          </span>
          <span className="font-mono text-[10px] sm:text-xs font-bold text-sky-100">{hero.def}</span>
        </div>

        <div className="flex flex-1 sm:flex-initial flex-col items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-cyan-950/40 border border-cyan-900/50 rounded">
          <span className="text-[8px] sm:text-[10px] text-cyan-300 flex items-center gap-0.5">
            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 fill-cyan-400/20 shrink-0" />
            ESC
          </span>
          <span className="font-mono text-[10px] sm:text-xs font-bold text-cyan-200">{hero.shield}</span>
        </div>
      </div>
    </div>
  );
};
