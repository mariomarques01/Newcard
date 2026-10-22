import React from 'react';
import { Volume2, VolumeX, BookOpen, RotateCcw, Crown, ShieldAlert } from 'lucide-react';

interface TopBarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenCompendium: () => void;
  onOpenRules: () => void;
  onOpenLog: () => void;
  onNewGame: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenCompendium,
  onOpenRules,
  onOpenLog,
  onNewGame,
}) => {
  return (
    <header className="w-full bg-slate-950/95 border-b border-amber-900/40 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          <span className="font-royal text-sm sm:text-base md:text-xl font-black tracking-wider text-amber-100 whitespace-nowrap">
            REINOS DO DESTINO
          </span>
        </div>

        {/* Zone 2: Navigation links (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            type="button"
            onClick={onOpenRules}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Regras & Combate
          </button>
          <button
            type="button"
            onClick={onOpenCompendium}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Coleção de Cartas
          </button>
          <button
            type="button"
            onClick={onOpenLog}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Registro de Batalha
          </button>
        </nav>

        {/* Zone 3: Quick mobile + desktop actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile direct access to Rules */}
          <button
            type="button"
            onClick={onOpenRules}
            className="md:hidden p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95"
            title="Regras do Jogo"
            aria-label="Regras"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>

          {/* Mobile direct access to Collection */}
          <button
            type="button"
            onClick={onOpenCompendium}
            className="md:hidden p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95"
            title="Coleção de 48 Cartas"
            aria-label="Coleção"
          >
            <Crown className="w-4 h-4 text-amber-400" />
          </button>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95"
            title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Efeitos Sonoros'}
            aria-label="Controle de Som"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* New Game */}
          <button
            type="button"
            onClick={onNewGame}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-bold text-amber-200 bg-gradient-to-r from-amber-700/80 to-amber-900/80 hover:from-amber-600 hover:to-amber-800 border border-amber-500/60 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95 min-h-[36px]"
            title="Iniciar Nova Partida"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nova Partida</span>
          </button>
        </div>
      </div>
    </header>
  );
};
