import React from 'react';
import { Suit } from '../types/game';

interface SuitIconProps {
  suit: Suit;
  className?: string;
}

export const SuitIcon: React.FC<SuitIconProps> = ({ suit, className = 'w-4 h-4' }) => {
  switch (suit) {
    case 'espadas':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-sky-400 select-none ${className}`} title="Espadas (Aço & Astúcia)">
          ♠
        </span>
      );
    case 'copas':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-rose-500 select-none ${className}`} title="Copas (Vida & Graça)">
          ♥
        </span>
      );
    case 'ouros':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-amber-400 select-none ${className}`} title="Ouros (Fortuna & Resiliência)">
          ♦
        </span>
      );
    case 'paus':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-emerald-400 select-none ${className}`} title="Paus (Força & Natureza)">
          ♣
        </span>
      );
    case 'coringa':
      return (
        <span className={`inline-flex items-center justify-center font-bold text-purple-400 select-none ${className}`} title="Coringa (Caos & Transmutação)">
          ★
        </span>
      );
    default:
      return null;
  }
};
