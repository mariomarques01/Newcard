import React, { useState } from 'react';
import { CombatLogEntry } from '../types/game';
import { Shield, Swords, Sparkles, Heart, ChevronUp, ChevronDown, History, Crown } from 'lucide-react';

interface CombatLogProps {
  logs: CombatLogEntry[];
  onOpenCompendium: () => void;
  onNewGame: () => void;
  onOpenRules: () => void;
}

export const CombatLog: React.FC<CombatLogProps> = ({
  logs,
  onOpenCompendium,
  onNewGame,
  onOpenRules,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const latestLog = logs[0];

  const getLogIcon = (type: CombatLogEntry['type']) => {
    switch (type) {
      case 'attack':
        return <Swords className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case 'defense':
        return <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'heal':
        return <Heart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'ace':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'victory':
        return <Crown className="w-3.5 h-3.5 text-yellow-300 shrink-0" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-2 pb-2 sm:pb-3">
      {/* Footer Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between text-[11px] sm:text-xs text-slate-400 py-1 sm:py-1.5 px-2.5 sm:px-3 mb-1 sm:mb-1.5 bg-slate-950/80 rounded-lg border border-amber-900/30 gap-1.5">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={onNewGame}
            className="hover:text-amber-300 font-medium transition-colors cursor-pointer active:text-amber-200"
          >
            Nova Partida
          </button>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <button
            type="button"
            onClick={onOpenCompendium}
            className="hover:text-amber-300 font-medium transition-colors cursor-pointer active:text-amber-200"
          >
            Coleção
          </button>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <button
            type="button"
            onClick={onOpenRules}
            className="hover:text-amber-300 font-medium transition-colors cursor-pointer active:text-amber-200"
          >
            Regras
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors text-[10px] sm:text-[11px] font-semibold cursor-pointer active:text-amber-200"
        >
          <History className="w-3 h-3 text-amber-400" />
          <span>{isOpen ? 'Ocultar' : 'Histórico'}</span>
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>

      {/* Latest Combat Event Ticker Banner */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer group flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-900/40 hover:border-amber-500/50 transition-all shadow-md"
      >
        <div className="flex items-center gap-2 min-w-0">
          {latestLog ? getLogIcon(latestLog.type) : <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          <p className="text-xs text-slate-200 truncate">
            {latestLog ? (
              <>
                <strong className="text-amber-300 font-semibold">{latestLog.speaker}: </strong>
                <span>{latestLog.text}</span>
                {latestLog.detail && <span className="text-slate-400 ml-1">({latestLog.detail})</span>}
                {latestLog.pgChange && latestLog.pgChange > 0 && (
                  <span className="text-yellow-400 font-bold ml-1.5 font-mono">+{latestLog.pgChange} PG</span>
                )}
              </>
            ) : (
              'A batalha épica começou. Prepare suas táticas e lidere seu reino à glória!'
            )}
          </p>
        </div>

        <span className="text-[10px] text-amber-400/80 uppercase tracking-widest font-mono shrink-0 group-hover:text-amber-300">
          LOG
        </span>
      </div>

      {/* Full History Drawer */}
      {isOpen && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-xl bg-slate-950 border border-amber-900/50 p-2.5 flex flex-col gap-1.5 shadow-2xl">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 text-xs py-1 px-2 rounded bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition-colors"
            >
              <div className="mt-0.5">{getLogIcon(log.type)}</div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-amber-200 mr-1.5">{log.speaker}</span>
                <span className="text-slate-300">{log.text}</span>
                {log.detail && <span className="text-slate-400 ml-1 italic">{log.detail}</span>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {log.pgChange && log.pgChange > 0 && (
                  <span className="text-yellow-300 font-mono font-bold text-[11px] bg-yellow-950/60 border border-yellow-700/60 px-1 rounded">
                    +{log.pgChange} PG
                  </span>
                )}
                <span className="font-mono text-[10px] text-slate-500 tabular-nums">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
