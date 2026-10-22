import React, { useState } from 'react';
import { Hero, ActionCard } from '../types/game';
import { ALL_HEROES_CATALOG, ALL_ACTION_CARDS_CATALOG } from '../data/allCardsCatalog';
import { SuitIcon } from './SuitIcon';
import { X, Sparkles, Zap, Flame, Eye, Filter } from 'lucide-react';

interface CardCompendiumModalProps {
  onClose: () => void;
  onInspect: (item: Hero | ActionCard) => void;
}

export const CardCompendiumModal: React.FC<CardCompendiumModalProps> = ({ onClose, onInspect }) => {
  const [filterSuit, setFilterSuit] = useState<string>('all');
  const [category, setCategory] = useState<'all' | 'heroes' | 'actions'>('all');

  const heroes = ALL_HEROES_CATALOG;
  const actions = ALL_ACTION_CARDS_CATALOG;

  // Filter items
  const filteredHeroes = heroes.filter((h) => {
    if (category === 'actions') return false;
    if (filterSuit !== 'all' && h.suit !== filterSuit) return false;
    return true;
  });

  const filteredActions = actions.filter((c) => {
    if (category === 'heroes') return false;
    if (filterSuit === 'all') return true;
    if (filterSuit === 'coringa') return c.suit === 'coringa';
    return c.suit === filterSuit;
  });

  const totalCount = filteredHeroes.length + filteredActions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/70 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-b border-amber-900/40 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-royal text-sm sm:text-base md:text-lg font-black text-amber-100 tracking-wide truncate">
                COMPÊNDIO REAL DE CARTAS
              </h2>
              <span className="text-[10px] sm:text-[11px] text-amber-300/70 font-sans block truncate">
                {totalCount} cartas ilustradas autênticas
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0 active:scale-95"
            title="Fechar"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Filter Navigation Bar */}
        <div className="px-2.5 sm:px-4 py-2 sm:py-2.5 border-b border-white/5 bg-slate-950/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Category Toggle */}
          <div className="flex items-center justify-center gap-1 bg-slate-900/90 p-0.5 sm:p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-royal font-bold transition-all cursor-pointer text-center ${
                category === 'all' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({heroes.length + actions.length})
            </button>
            <button
              type="button"
              onClick={() => setCategory('heroes')}
              className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-royal font-bold transition-all cursor-pointer text-center ${
                category === 'heroes' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              Heróis ({heroes.length})
            </button>
            <button
              type="button"
              onClick={() => setCategory('actions')}
              className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-royal font-bold transition-all cursor-pointer text-center ${
                category === 'actions' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ações ({actions.length})
            </button>
          </div>

          {/* Naipe / Suit filter */}
          <div className="flex items-center justify-center flex-wrap gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-0.5 hidden md:block" />
            <button
              type="button"
              onClick={() => setFilterSuit('all')}
              className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-xs font-medium transition-all cursor-pointer ${
                filterSuit === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilterSuit('espadas')}
              className={`px-1.5 sm:px-2.5 py-1 rounded text-[10px] sm:text-xs font-medium flex items-center gap-0.5 sm:gap-1 transition-all cursor-pointer ${
                filterSuit === 'espadas' ? 'bg-sky-600 text-white font-bold' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <SuitIcon suit="espadas" className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Espadas
            </button>
            <button
              type="button"
              onClick={() => setFilterSuit('copas')}
              className={`px-1.5 sm:px-2.5 py-1 rounded text-[10px] sm:text-xs font-medium flex items-center gap-0.5 sm:gap-1 transition-all cursor-pointer ${
                filterSuit === 'copas' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <SuitIcon suit="copas" className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Copas
            </button>
            <button
              type="button"
              onClick={() => setFilterSuit('paus')}
              className={`px-1.5 sm:px-2.5 py-1 rounded text-[10px] sm:text-xs font-medium flex items-center gap-0.5 sm:gap-1 transition-all cursor-pointer ${
                filterSuit === 'paus' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <SuitIcon suit="paus" className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Paus
            </button>
            <button
              type="button"
              onClick={() => setFilterSuit('ouros')}
              className={`px-1.5 sm:px-2.5 py-1 rounded text-[10px] sm:text-xs font-medium flex items-center gap-0.5 sm:gap-1 transition-all cursor-pointer ${
                filterSuit === 'ouros' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <SuitIcon suit="ouros" className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Ouros
            </button>
            <button
              type="button"
              onClick={() => setFilterSuit('coringa')}
              className={`px-1.5 sm:px-2.5 py-1 rounded text-[10px] sm:text-xs font-medium flex items-center gap-0.5 sm:gap-1 transition-all cursor-pointer ${
                filterSuit === 'coringa' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <SuitIcon suit="coringa" className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Coringa
            </button>
          </div>
        </div>

        {/* Card Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* HEROES */}
            {filteredHeroes.map((hero) => (
              <div
                key={hero.id}
                onClick={() => onInspect(hero)}
                className="group relative cursor-pointer rounded-xl overflow-hidden bg-slate-950 border border-amber-900/40 hover:border-amber-400 p-1 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                {/* Artwork View */}
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-black">
                  <img
                    src={hero.image}
                    alt={hero.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 border border-amber-500/40 text-[10px] font-black font-royal text-amber-300 flex items-center gap-1">
                    <span>{hero.rank}</span>
                    <SuitIcon suit={hero.suit} className="w-2.5 h-2.5" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="px-2 py-0.5 rounded-full bg-black/90 border border-amber-400/80 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Ver Carta
                    </span>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="pt-1.5 pb-0.5 px-1 text-center">
                  <h4 className="font-royal text-[11px] font-bold text-amber-100 truncate">
                    {hero.name}
                  </h4>
                  <span className="text-[9px] text-amber-300/70 truncate block">
                    {hero.passiveName}
                  </span>
                </div>
              </div>
            ))}

            {/* ACTIONS */}
            {filteredActions.map((card) => (
              <div
                key={card.id}
                onClick={() => onInspect(card)}
                className="group relative cursor-pointer rounded-xl overflow-hidden bg-slate-950 border border-amber-900/40 hover:border-amber-400 p-1 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                {/* Artwork View */}
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-black">
                  <img
                    src={card.image}
                    alt={card.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 border border-cyan-400/50 text-[10px] font-black font-mono text-cyan-300 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-cyan-400" />
                    <span>{card.cost}</span>
                  </div>
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 border border-amber-500/40 text-[10px] font-black font-royal text-amber-300 flex items-center gap-1">
                    <span>{card.rank}</span>
                    <SuitIcon suit={card.suit} className="w-2.5 h-2.5" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="px-2 py-0.5 rounded-full bg-black/90 border border-amber-400/80 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Ver Carta
                    </span>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="pt-1.5 pb-0.5 px-1 text-center">
                  <h4 className="font-royal text-[11px] font-bold text-amber-100 truncate">
                    {card.name}
                  </h4>
                  <span className="text-[9px] text-slate-300 truncate block">
                    {card.badgeText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
