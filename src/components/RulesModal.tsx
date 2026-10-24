import React from 'react';
import { X, Crown, Zap, Shield, Swords, Sparkles, BookOpen } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-4 border-b border-amber-900/40 flex items-center justify-between bg-slate-950 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <h2 className="font-royal text-sm sm:text-base md:text-xl font-black text-amber-100 truncate">
              COMO JOGAR: REINOS DO DESTINO
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center active:scale-95"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 text-xs md:text-sm leading-relaxed">
          {/* Section 1: Objective */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/40">
            <h3 className="font-royal text-sm md:text-base font-bold text-amber-300 flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-400" />
              1. Objetivo da Vitória
            </h3>
            <p className="text-slate-300">
              Você pode vencer o duelo de duas maneiras:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-slate-200">
              <li>
                <strong className="text-amber-200">Pontos de Glória (12 PG):</strong> Acumule 12 PG atacando inimigos, derrotando heróis ou jogando cartas áureas.
              </li>
              <li>
                <strong className="text-amber-200">Conquista Total:</strong> Reduza a vida de todos os 3 heróis da corte rival a zero.
              </li>
            </ul>
          </div>

          {/* Section 2: Combat Flow */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <h3 className="font-royal text-sm md:text-base font-bold text-amber-300 flex items-center gap-2 mb-1">
              <Swords className="w-4 h-4 text-rose-400" />
              2. Dinâmica de Combate
            </h3>
            <p className="text-slate-300 mb-2">
              Em cada turno, você comanda seus 3 heróis lendários:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="font-bold text-rose-400">Atacar:</span> O Herói Ativo ataca o Herói Adversário selecionado. Dano = ATQ - DEF alvo.
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="font-bold text-sky-400">Defender:</span> O Herói Ativo entra em postura de guarda, absorvendo danos e ativando bônus táticos.
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="font-bold text-amber-400">Poder de Ás:</span> Cada herói possui uma magia suprema que custa 2 cristais de energia.
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="font-bold text-purple-400">Cartas da Mão:</span> Feitiços e táticas consumem Energia (⚡) para curar, perfurar ou transformar a mesa.
              </div>
            </div>
          </div>

          {/* Section 3: Royal Archetypes */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <h3 className="font-royal text-sm md:text-base font-bold text-amber-300 flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              3. Arquétipos da Realeza
            </h3>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              <li>
                <strong className="text-slate-100">Reis (K):</strong> Força bruta e liderança. O Rei de Espadas destrói defesas, enquanto o Rei de Ouros acumula escudos inquebráveis.
              </li>
              <li>
                <strong className="text-slate-100">Rainhas (Q):</strong> Magia vital e sagacidade. A Rainha de Copas cura aliados feridos e a Rainha de Paus retribui ataques com espinhos.
              </li>
              <li>
                <strong className="text-slate-100">Valetes (J):</strong> Duelistas ágeis. Geram energia, roubam vida e aplicam táticas relâmpago.
              </li>
            </ul>
          </div>
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40">
            <h3 className="font-royal text-sm font-bold text-purple-200 mb-1">4. Evolução durante a batalha</h3>
            <p>Cada carta de personagem, sua ou do rival, evolui após 3 ações válidas: atacar, defender, jogar uma habilidade ou usar o poder ÁS. O medidor fica na carta; toque em “i” para ver os detalhes.</p>
            <p className="mt-2">Ao despertar, a carta ganha +1 ATQ e +2 Escudo uma única vez. O ataque maior dura até o fim da batalha; o escudo pode ser consumido normalmente pelos golpes. A evolução é salva com a partida em andamento e recomeça do zero em uma nova batalha.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-900/40 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-royal font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Entendido, Para a Batalha!
          </button>
        </div>
      </div>
    </div>
  );
};
