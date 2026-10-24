import React, { useState } from 'react';
import { Hero, ActionCard } from '../types/game';
import {evolutionCharge,EVOLUTION_ACTIONS} from '../game/evolution';
import { SuitIcon } from './SuitIcon';
import { X, Heart, Swords, Shield, Sparkles, Flame, Zap, Eye, BookOpen, AlertTriangle } from 'lucide-react';

interface CardInspectModalProps {
  item: Hero | ActionCard | null;
  onClose: () => void;
}

export const CardInspectModal: React.FC<CardInspectModalProps> = ({ item, onClose }) => {
  const [viewMode, setViewMode] = useState<'card' | 'stats'>('card');

  if (!item) return null;

  const isHero = 'maxHp' in item;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/70 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-950/90 border-b border-amber-900/40 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-royal text-base sm:text-lg font-black text-amber-300">{item.rank}</span>
            <SuitIcon suit={item.suit} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <h3 className="font-royal text-sm sm:text-base md:text-lg font-black text-amber-100 truncate max-w-[130px] sm:max-w-[240px]">
              {item.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'card' ? 'stats' : 'card')}
              className="px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold font-royal rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 flex items-center gap-1 transition-all cursor-pointer active:scale-95 min-h-[32px]"
            >
              {viewMode === 'card' ? (
                <>
                  <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Atributos</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Carta Real</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center active:scale-95"
              title="Fechar"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col items-center">
          {isHero&&<div className="evolution-detail" data-evolution-detail={item.evolved?'evolved':'charging'}>
            <strong>{item.evolved?'✦ CARTA EVOLUÍDA':`✧ EVOLUÇÃO · ${evolutionCharge(item)}/${EVOLUTION_ACTIONS}`}</strong>
            <div className="evolution-track" role="progressbar" aria-label="Ações para evoluir" aria-valuenow={evolutionCharge(item)} aria-valuemin={0} aria-valuemax={EVOLUTION_ACTIONS}>{Array.from({length:EVOLUTION_ACTIONS},(_,i)=><i key={i} className={i<evolutionCharge(item)?'filled':''}/>)}</div>
            <p>{item.evolved?'Bônus já aplicado: +1 ATQ e +2 Escudo. A forma evoluída dura até o fim desta batalha.':'Ataque, defenda, jogue uma habilidade ou use o poder ÁS com esta carta. Na terceira ação, ela desperta com +1 ATQ e +2 Escudo.'}</p>
          </div>}

          {viewMode === 'card' ? (
            /* FULL CARD AUTHENTIC VIEW */
            <div className="flex flex-col items-center w-full">
              <div className="relative max-h-[68vh] overflow-hidden rounded-xl border-2 border-amber-400/60 shadow-2xl bg-black flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="max-h-[65vh] w-auto object-contain rounded-lg"
                />
              </div>

              {/* Quick Summary Strip below full card */}
              <div className="mt-3 w-full max-w-md p-2.5 rounded-xl bg-slate-950/80 border border-amber-900/40 text-center">
                {isHero ? (
                  <p className="text-xs text-amber-200/90 font-medium italic">
                    "{item.flavorQuote}"
                  </p>
                ) : (
                  <p className="text-xs text-amber-200/90 font-medium">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* STATS & LORE BREAKDOWN VIEW */
            <div className="w-full flex flex-col items-center">
              {isHero ? (
                /* HERO DETAILS */
                <div className="w-full flex flex-col items-center">
                  <p className="text-xs text-amber-300 italic mb-3 text-center">{item.title}</p>

                  {/* Artwork Preview */}
                  <div className="w-36 h-48 rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-lg mb-4 bg-slate-950 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 w-full mb-3">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-rose-950/60 border border-rose-900/60">
                      <span className="text-[10px] text-rose-300 flex items-center gap-1 font-bold">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        VIDA
                      </span>
                      <span className="font-mono text-sm font-bold text-rose-100">
                        {item.currentHp}/{item.maxHp}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-red-950/60 border border-red-900/60">
                      <span className="text-[10px] text-red-300 flex items-center gap-1 font-bold">
                        <Swords className="w-3 h-3 text-red-400" />
                        ATQ
                      </span>
                      <span className="font-mono text-sm font-bold text-red-100">{item.atk}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-sky-950/60 border border-sky-900/60">
                      <span className="text-[10px] text-sky-300 flex items-center gap-1 font-bold">
                        <Shield className="w-3 h-3 text-sky-400" />
                        DEF
                      </span>
                      <span className="font-mono text-sm font-bold text-sky-100">{item.def}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-cyan-950/60 border border-cyan-900/60">
                      <span className="text-[10px] text-cyan-300 flex items-center gap-1 font-bold">
                        <Shield className="w-3 h-3 text-cyan-400 fill-cyan-400/20" />
                        ESC
                      </span>
                      <span className="font-mono text-sm font-bold text-cyan-100">{item.shield}</span>
                    </div>
                  </div>

                  {/* Abilities & Passives */}
                  <div className="w-full flex flex-col gap-2.5 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        Habilidade Passiva: {item.passiveName}
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{item.passiveDescription}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-950/50 border border-cyan-800/60">
                      <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Poder de Ás (Custo: 2 Energia)
                      </div>
                      <p className="text-cyan-100 text-xs leading-relaxed">{item.acePowerDescription}</p>
                    </div>

                    {item.defect && (
                      <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/50 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-rose-300 text-[11px] block">Fraqueza / Defeito:</span>
                          <p className="text-rose-100/80 text-[11px] leading-relaxed">{item.defect}</p>
                        </div>
                      </div>
                    )}

                    <blockquote className="text-xs text-slate-400 italic text-center border-t border-white/5 pt-2">
                      "{item.flavorQuote}"
                    </blockquote>
                  </div>
                </div>
              ) : (
                /* ACTION CARD DETAILS */
                <div className="w-full flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-bold">
                      <Zap className="w-3 h-3 fill-cyan-400" />
                      Custo: {item.cost} Energia
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${item.badgeColor}`}>
                      {item.badgeText}
                    </span>
                  </div>

                  {/* Artwork Preview */}
                  <div className="w-36 h-48 rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-lg mb-4 bg-slate-950 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="w-full p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center mb-3">
                    {item.skillName && (
                      <div className="text-amber-300 font-bold text-xs mb-1 flex items-center justify-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        {item.skillName}
                      </div>
                    )}
                    <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">{item.description}</p>
                  </div>

                  {item.quote && (
                    <blockquote className="text-xs text-amber-200/80 italic text-center border-t border-white/5 pt-2.5">
                      "{item.quote}"
                    </blockquote>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
