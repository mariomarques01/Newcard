import React from 'react';
import { Swords, Shield, Zap, Sparkles, ArrowRight, Play } from 'lucide-react';
import { ActionCard, Hero } from '../types/game';

interface ActionBarProps {
  resolving?: boolean;
  selectedCard: ActionCard | null;
  activeHero: Hero | undefined;
  targetedRival: Hero | undefined;
  playerEnergy: number;
  currentTurn: 'player' | 'rival';
  onUseCard: () => void;
  onAttack: () => void;
  onDefend: () => void;
  onUseAce: () => void;
  onEndTurn: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  resolving=false,
  selectedCard,
  activeHero,
  targetedRival,
  playerEnergy,
  currentTurn,
  onUseCard,
  onAttack,
  onDefend,
  onUseAce,
  onEndTurn,
}) => {
  const isPlayerTurn = currentTurn === 'player' && !resolving;
  const canUseCard = isPlayerTurn && selectedCard !== null && playerEnergy >= selectedCard.cost;
  const canAttack = isPlayerTurn && activeHero?.isAlive && !activeHero?.hasAttacked && targetedRival?.isAlive;
  const canDefend = isPlayerTurn && activeHero?.isAlive && !activeHero?.isDefending;
  const canUseAce = isPlayerTurn && activeHero?.isAlive && playerEnergy >= 2 && (activeHero.rank!=='J'||targetedRival?.isAlive);

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-2 py-1 sm:py-2">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
        {/* JOGAR */}
        <button
          type="button"
          onClick={onUseCard}
          disabled={!canUseCard}
          data-action="play" data-ready={canUseCard}
          className={`min-h-[48px] sm:min-h-[52px] flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl font-royal font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
            canUseCard
              ? 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(251,191,36,0.5)] hover:scale-[1.02] active:scale-95 active:brightness-125'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
          }`}
          title={
            selectedCard
              ? `Jogar ${selectedCard.name} (Custa ${selectedCard.cost} Energia)`
              : 'Selecione uma carta da sua mão para usar'
          }
        >
          <div className="flex items-center gap-1">
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            <span>JOGAR</span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-sans font-normal opacity-90 truncate max-w-[120px]">
            {resolving ? 'Em combate' : !isPlayerTurn ? 'Aguarde' : !selectedCard ? 'Selecione' : playerEnergy < selectedCard.cost ? 'Sem energia' : `${selectedCard.cost} ⚡ · Pronto`}
          </span>
        </button>

        {/* ATACAR */}
        <button
          type="button"
          onClick={onAttack}
          disabled={!canAttack}
          data-action="attack" data-ready={!!canAttack}
          className={`min-h-[48px] sm:min-h-[52px] flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl font-royal font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
            canAttack
              ? 'bg-gradient-to-b from-rose-700 via-rose-800 to-rose-950 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.5)] hover:scale-[1.02] active:scale-95 active:brightness-125'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
          }`}
          title={
            !activeHero?.isAlive
              ? 'Herói ativo abatido'
              : activeHero?.hasAttacked
              ? 'Este herói já atacou nesta rodada'
              : !targetedRival?.isAlive
              ? 'Selecione um herói adversário vivo para atacar'
              : `Atacar ${targetedRival.name} com ${activeHero.name}`
          }
        >
          <div className="flex items-center gap-1">
            <Swords className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>ATACAR</span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-sans font-normal opacity-90 truncate max-w-[120px]">
            {resolving ? 'Em combate' : !isPlayerTurn ? 'Aguarde' : !activeHero?.isAlive ? 'Herói abatido' : activeHero.hasAttacked ? 'Já atacou' : !targetedRival?.isAlive ? 'Escolha alvo' : `Alvo: ${targetedRival.name.split(' ')[0]}`}
          </span>
        </button>

        {/* DEFENDER */}
        <button
          type="button"
          onClick={onDefend}
          disabled={!canDefend}
          data-action="defend" data-ready={!!canDefend}
          className={`min-h-[48px] sm:min-h-[52px] flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl font-royal font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
            canDefend
              ? 'bg-gradient-to-b from-blue-700 via-blue-800 to-blue-950 border-blue-400 text-blue-100 shadow-[0_0_15px_rgba(96,165,250,0.5)] hover:scale-[1.02] active:scale-95 active:brightness-125'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
          }`}
          title="Assumir postura defensiva (+2 DEF, +3 Escudo e bônus tático)"
        >
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>DEFENDER</span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-sans font-normal opacity-90">
            {resolving ? 'Em combate' : !isPlayerTurn ? 'Aguarde' : !activeHero?.isAlive ? 'Indisponível' : activeHero.isDefending ? 'Em Guarda' : '+3 Escudo'}
          </span>
        </button>

        {/* ÁS (2) */}
        <button
          type="button"
          onClick={onUseAce}
          disabled={!canUseAce}
          data-action="ace" data-ready={!!canUseAce}
          className={`min-h-[48px] sm:min-h-[52px] flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl font-royal font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
            canUseAce
              ? 'bg-gradient-to-b from-emerald-700 via-emerald-800 to-emerald-950 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.5)] hover:scale-[1.02] active:scale-95 active:brightness-125'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
          }`}
          title={
            activeHero
              ? `Poder Supremo de Ás de ${activeHero.name} (Custa 2 Energia): ${activeHero.acePowerDescription}`
              : 'Poder Supremo do Ás'
          }
        >
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300" />
            <span>ÁS (2 ⚡)</span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-sans font-normal opacity-90 truncate max-w-[120px]">
            {resolving ? 'Em combate' : !isPlayerTurn ? 'Aguarde' : !activeHero?.isAlive ? 'Indisponível' : playerEnergy < 2 ? 'Sem energia' : activeHero.rank==='J'&&!targetedRival?.isAlive ? 'Escolha alvo' : activeHero.rank === 'K' ? 'Compra 2' : activeHero.rank === 'Q' ? 'Cura 4' : 'Ataque 5'}
          </span>
        </button>

        {/* ENCERRAR */}
        <button
          type="button"
          onClick={onEndTurn}
          disabled={!isPlayerTurn}
          data-action="end" data-ready={isPlayerTurn}
          className={`col-span-2 sm:col-span-1 min-h-[48px] sm:min-h-[52px] flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl font-royal font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
            isPlayerTurn
              ? 'bg-gradient-to-b from-red-800 via-red-900 to-black border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:scale-[1.02] active:scale-95 active:brightness-125'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
          }`}
          title="Passar a vez para o adversário"
        >
          <div className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>ENCERRAR</span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-sans font-normal opacity-80">
            {resolving ? 'Em combate' : isPlayerTurn ? 'Vez do Rival' : 'Aguardando...'}
          </span>
        </button>
      </div>
    </div>
  );
};
