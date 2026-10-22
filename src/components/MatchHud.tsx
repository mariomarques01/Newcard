import React from 'react';
import { Crown, Zap, Shield, Sparkles, Layers } from 'lucide-react';

interface MatchHudProps {
  playerPg: number;
  rivalPg: number;
  maxPg?: number;
  playerEnergy: number;
  maxEnergy: number;
  rivalEnergy: number;
  round: number;
  currentTurn: 'player' | 'rival';
  deckCount: number;
  discardCount: number;
  rivalHandCount: number;
}

export const MatchHud: React.FC<MatchHudProps> = ({
  playerPg,
  rivalPg,
  maxPg = 12,
  playerEnergy,
  maxEnergy,
  rivalEnergy,
  round,
  currentTurn,
  deckCount,
  discardCount,
  rivalHandCount,
}) => {
  const playerPgPercent = Math.min(100, (playerPg / maxPg) * 100);
  const rivalPgPercent = Math.min(100, (rivalPg / maxPg) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-2 py-1 sm:py-2 flex flex-col gap-1.5 sm:gap-2">
      {/* Top Glory Points & Turn Status Bar */}
      <div className="rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-900/40 p-2 sm:p-2.5 shadow-md flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Player Stats Box */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-950 border border-sky-500/60 flex items-center justify-center text-sky-300 font-royal font-bold text-[10px] sm:text-xs shadow-[0_0_8px_rgba(56,189,248,0.3)]">
            VOCÊ
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] text-slate-300 font-semibold tracking-wide flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
              <span className="hidden xs:inline">GLÓRIA:</span>{' '}
              <strong className="text-amber-300 font-mono text-[11px] sm:text-xs">{playerPg}/{maxPg} PG</strong>
            </span>
            {/* Energy Crystals */}
            <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5" title={`Energia: ${playerEnergy}/${maxEnergy}`}>
              <span className="text-[9px] sm:text-[10px] text-cyan-300 font-bold flex items-center mr-0.5">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-cyan-400 text-cyan-400 shrink-0" />
                <span>{playerEnergy}</span>
              </span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: maxEnergy }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                      i < playerEnergy
                        ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-[0_0_6px_rgba(6,182,212,0.9)] scale-105'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Round & Active Turn Indicator */}
        <div className="flex flex-col items-center justify-center px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-black/50 border border-amber-950/60 shrink-0">
          <span className="font-royal text-[8px] sm:text-[10px] uppercase tracking-widest text-amber-400/80 font-bold leading-none">
            R{round}
          </span>
          <div className="mt-0.5">
            {currentTurn === 'player' ? (
              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-black tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse whitespace-nowrap">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
                <span>SEU TURNO</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-black tracking-wider text-rose-300 bg-rose-950/80 border border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse whitespace-nowrap">
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400 shrink-0" />
                <span>RIVAL</span>
              </span>
            )}
          </div>
        </div>

        {/* Rival Stats Box */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[9px] sm:text-[10px] text-slate-300 font-semibold tracking-wide flex items-center justify-end gap-0.5">
              <strong className="text-rose-300 font-mono text-[11px] sm:text-xs">{rivalPg}/{maxPg} PG</strong>
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400 shrink-0" />
            </span>
            {/* Rival Energy Crystals */}
            <div className="flex items-center justify-end gap-0.5 sm:gap-1 mt-0.5" title={`Energia Rival: ${rivalEnergy}`}>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                      i < rivalEnergy
                        ? 'bg-gradient-to-tr from-rose-400 to-amber-500 shadow-[0_0_6px_rgba(244,63,94,0.8)] scale-105'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] sm:text-[10px] text-rose-300 font-bold ml-0.5">
                ⚡{rivalEnergy}
              </span>
            </div>
          </div>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-950 border border-rose-500/60 flex items-center justify-center text-rose-300 font-royal font-bold text-[10px] sm:text-xs shadow-[0_0_8px_rgba(244,63,94,0.3)]">
            RIVAL
          </div>
        </div>
      </div>

      {/* Dual Glory Point Tug-of-War Progress Bar (Race to 12 PG) */}
      <div className="w-full flex flex-col gap-0.5 px-0.5">
        <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-slate-400 font-semibold px-0.5">
          <span className="text-sky-300 font-medium truncate">Você ({playerPg}/12)</span>
          <span className="text-amber-400 font-royal font-bold tracking-tight text-[8px] sm:text-[10px] text-center">
            META: 12 PG
          </span>
          <span className="text-rose-300 font-medium truncate text-right">Rival ({rivalPg}/12)</span>
        </div>
        <div className="relative w-full h-1.5 sm:h-2 rounded-full bg-slate-900 border border-amber-900/40 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${playerPgPercent / 2}%` }}
          />
          <div className="flex-1 bg-slate-950/80" />
          <div
            className="h-full bg-gradient-to-l from-rose-500 to-amber-500 transition-all duration-500"
            style={{ width: `${rivalPgPercent / 2}%` }}
          />
        </div>
      </div>

      {/* Baralho / Descarte / Mão Rival metadata strip */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-400 py-0.5 border-t border-b border-amber-900/20 font-medium">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
          <span className="hidden xs:inline">Baralho:</span>
          <strong className="text-amber-200 font-mono tabular-nums">{deckCount}</strong>
        </span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>
          <span className="hidden xs:inline">Descarte: </span>
          <strong className="text-slate-200 font-mono tabular-nums">{discardCount}</strong>
        </span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span>
          <span className="hidden xs:inline">Mão rival: </span>
          <strong className="text-rose-300 font-mono tabular-nums">{rivalHandCount} cartas</strong>
        </span>
      </div>
    </div>
  );
};
