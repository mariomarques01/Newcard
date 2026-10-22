import React from 'react';
import { FloatingNumber } from '../types/game';

interface FloatingNumberOverlayProps {
  items: FloatingNumber[];
}

export const FloatingNumberOverlay: React.FC<FloatingNumberOverlayProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {items.map((item) => {
        let styleClass = 'text-red-400 font-extrabold text-2xl drop-shadow-[0_2px_8px_rgba(239,68,68,0.8)]';

        if (item.type === 'heal') {
          styleClass = 'text-emerald-400 font-extrabold text-2xl drop-shadow-[0_2px_8px_rgba(16,185,129,0.8)]';
        } else if (item.type === 'shield') {
          styleClass = 'text-cyan-300 font-extrabold text-2xl drop-shadow-[0_2px_8px_rgba(6,182,212,0.8)]';
        } else if (item.type === 'pg') {
          styleClass = 'text-amber-300 font-black text-3xl drop-shadow-[0_2px_12px_rgba(245,158,11,0.9)]';
        } else if (item.type === 'crit') {
          styleClass = 'text-rose-500 font-black text-3xl drop-shadow-[0_2px_12px_rgba(244,63,94,0.9)]';
        }

        return (
          <div
            key={item.id}
            className={`absolute animate-float-number select-none tracking-tight ${styleClass}`}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
            }}
          >
            {item.value}
          </div>
        );
      })}
    </div>
  );
};
