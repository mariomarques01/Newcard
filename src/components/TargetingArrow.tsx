import React from 'react';

interface TargetingArrowProps {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isTargetValid?: boolean;
  targetType?: 'enemy' | 'ally' | 'board';
}

export const TargetingArrow: React.FC<TargetingArrowProps> = ({
  startX,
  startY,
  currentX,
  currentY,
  isTargetValid = false,
  targetType = 'enemy',
}) => {
  // Compute quadratic / cubic bezier control points for a dynamic Hearthstone-like arc
  const dx = currentX - startX;
  const dy = currentY - startY;
  const distance = Math.hypot(dx, dy);

  if (distance < 15) return null;

  // Arc bend
  const bendFactor = Math.min(120, distance * 0.25);
  // Perpendicular offset for arc curve
  const normalX = -dy / (distance || 1);
  const normalY = dx / (distance || 1);

  const ctrlX = (startX + currentX) / 2 + normalX * (bendFactor * 0.5);
  const ctrlY = (startY + currentY) / 2 + normalY * (bendFactor * 0.5);

  // Generate intermediate dots along the bezier curve
  const dotCount = Math.max(6, Math.min(16, Math.floor(distance / 35)));
  const dots: { x: number; y: number; size: number; opacity: number }[] = [];

  for (let i = 1; i < dotCount; i++) {
    const t = i / dotCount;
    // Quadratic bezier formula: (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
    const oneMinusT = 1 - t;
    const px = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * ctrlX + t * t * currentX;
    const py = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * ctrlY + t * t * currentY;
    dots.push({
      x: px,
      y: py,
      size: 4 + t * 6,
      opacity: 0.4 + t * 0.6,
    });
  }

  // Color schemes: Red for enemy target, emerald for heal/ally, amber for board
  let mainColor = '#f43f5e'; // red/rose
  let glowColor = 'rgba(244, 63, 94, 0.7)';
  if (targetType === 'ally') {
    mainColor = '#10b981'; // emerald
    glowColor = 'rgba(16, 185, 129, 0.7)';
  } else if (targetType === 'board') {
    mainColor = '#fbbf24'; // amber
    glowColor = 'rgba(251, 191, 36, 0.7)';
  }

  // Angle for arrowhead pointing towards (currentX, currentY)
  const angle = Math.atan2(currentY - ctrlY, currentX - ctrlX);
  const arrowSize = isTargetValid ? 28 : 22;

  return (
    <svg className="pointer-events-none fixed inset-0 z-50 w-full h-full overflow-visible">
      <defs>
        <filter id="arrow-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main Bezier Line */}
      <path
        d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${currentX} ${currentY}`}
        fill="none"
        stroke={mainColor}
        strokeWidth="4"
        strokeDasharray="6 4"
        opacity="0.85"
        filter="url(#arrow-glow)"
      />

      {/* Intermediate Pulsing Dots */}
      {dots.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={dot.size}
          fill={mainColor}
          opacity={dot.opacity}
          filter="url(#arrow-glow)"
        />
      ))}

      {/* Hearthstone Arrowhead / Reticle */}
      <g
        transform={`translate(${currentX}, ${currentY}) rotate(${(angle * 180) / Math.PI})`}
        filter="url(#arrow-glow)"
      >
        {/* Arrow Spike Head */}
        <polygon
          points={`0,0 -${arrowSize},-${arrowSize * 0.6} -${arrowSize * 0.7},0 -${arrowSize},${arrowSize * 0.6}`}
          fill={mainColor}
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        {/* Glow center */}
        <circle cx="-5" cy="0" r={isTargetValid ? 6 : 4} fill="#ffffff" />
      </g>

      {/* Reticle ring around target cursor if hovering a valid hero */}
      {isTargetValid && (
        <g transform={`translate(${currentX}, ${currentY})`}>
          <circle
            cx="0"
            cy="0"
            r="32"
            fill="none"
            stroke={mainColor}
            strokeWidth="3"
            strokeDasharray="8 6"
            className="animate-spin"
            style={{ animationDuration: '4s' }}
          />
          <circle cx="0" cy="0" r="10" fill={glowColor} className="animate-pulse" />
        </g>
      )}
    </svg>
  );
};
