import React from 'react';
import { Crown, RotateCcw, Skull, Trophy, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  status: 'victory' | 'defeat';
  playerPg: number;
  rivalPg: number;
  rounds: number;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  status,
  playerPg,
  rivalPg,
  rounds,
  onPlayAgain,
}) => {
  const isVictory = status === 'victory';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-md p-4 sm:p-6 rounded-2xl border-2 text-center shadow-2xl flex flex-col items-center ${
          isVictory
            ? 'bg-gradient-to-b from-amber-950 via-slate-950 to-black border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)]'
            : 'bg-gradient-to-b from-red-950 via-slate-950 to-black border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
        }`}
      >
        {/* Emblem Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 border-2 ${
            isVictory
              ? 'bg-gradient-to-tr from-yellow-500 to-amber-300 border-yellow-200 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.8)]'
              : 'bg-gradient-to-tr from-rose-800 to-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)]'
          }`}
        >
          {isVictory ? <Trophy className="w-10 h-10" /> : <Skull className="w-10 h-10" />}
        </div>

        {/* Title */}
        <h2 className="font-royal text-2xl md:text-3xl font-black mb-1 tracking-wider text-amber-100">
          {isVictory ? 'VITÓRIA GLORIOSA!' : 'DERROTA NO REINO'}
        </h2>

        <p className="text-xs md:text-sm text-slate-300 mb-6">
          {isVictory
            ? 'Seus heróis triunfaram sobre a dinastia rival e conquistaram a coroa eterna dos Reinos do Destino!'
            : 'As forças adversárias prevaleceram neste confronto. Reorganize suas cortes e tente novamente!'}
        </p>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 w-full p-3 rounded-xl bg-black/60 border border-white/10 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Sua Glória</span>
            <span className="font-mono text-base font-black text-amber-300">{playerPg} PG</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/10">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Glória Rival</span>
            <span className="font-mono text-base font-black text-rose-400">{rivalPg} PG</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Rodadas</span>
            <span className="font-mono text-base font-black text-sky-300">{rounds}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onPlayAgain}
          className={`w-full py-3 px-6 rounded-xl font-royal font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
            isVictory
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]'
              : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>JOGAR NOVAMENTE</span>
        </button>
      </div>
    </div>
  );
};
