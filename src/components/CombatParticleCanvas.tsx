import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export type ParticleEffectType = 'slash' | 'arcane' | 'gold_blast' | 'pierce' | 'heal' | 'shield';

export interface CombatParticleCanvasRef {
  triggerBurst: (x: number, y: number, type: ParticleEffectType) => void;
  triggerCardBurst: (elementId: string, type: ParticleEffectType) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  rotation: number;
  vRot: number;
  shape: 'circle' | 'spark' | 'star' | 'slash';
  length?: number;
}

export const CombatParticleCanvas = forwardRef<CombatParticleCanvasRef>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const createBurst = (x: number, y: number, type: ParticleEffectType) => {
    const newParticles: Particle[] = [];
    const count = type === 'gold_blast' ? 65 : type === 'slash' ? 45 : 35;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = Math.random() * 8 + 3;

      let color = '#f59e0b';
      let shape: Particle['shape'] = 'circle';
      let size = Math.random() * 4 + 2;
      let decay = Math.random() * 0.025 + 0.015;
      let gravity = 0.15;

      if (type === 'slash') {
        // Fiery amber and steel slash shards
        const slashColors = ['#f43f5e', '#fbbf24', '#f97316', '#ffffff', '#e11d48'];
        color = slashColors[Math.floor(Math.random() * slashColors.length)];
        shape = Math.random() > 0.4 ? 'slash' : 'spark';
        size = Math.random() * 5 + 3;
        gravity = 0.1;
      } else if (type === 'arcane') {
        // Mystical cosmic violet and electric cyan
        const arcaneColors = ['#a855f7', '#c084fc', '#38bdf8', '#818cf8', '#ffffff'];
        color = arcaneColors[Math.floor(Math.random() * arcaneColors.length)];
        shape = Math.random() > 0.3 ? 'star' : 'circle';
        size = Math.random() * 4 + 2.5;
        decay = Math.random() * 0.02 + 0.012;
        gravity = -0.05; // floats slightly upward!
      } else if (type === 'gold_blast') {
        // Radiant imperial gold explosion
        const goldColors = ['#fde047', '#fbbf24', '#f59e0b', '#ffffff', '#ca8a04'];
        color = goldColors[Math.floor(Math.random() * goldColors.length)];
        shape = Math.random() > 0.5 ? 'star' : 'spark';
        size = Math.random() * 6 + 3;
        decay = Math.random() * 0.018 + 0.012;
        gravity = 0.08;
      } else if (type === 'pierce') {
        // High-velocity ruby rose piercing shards
        const pierceColors = ['#ef4444', '#dc2626', '#f43f5e', '#fda4af', '#ffffff'];
        color = pierceColors[Math.floor(Math.random() * pierceColors.length)];
        shape = 'slash';
        size = Math.random() * 5 + 2;
        decay = Math.random() * 0.03 + 0.02;
        gravity = 0.12;
      } else if (type === 'heal') {
        // Radiant emerald & holy blessing motes
        const healColors = ['#34d399', '#10b981', '#6ee7b7', '#a7f3d0', '#ffffff'];
        color = healColors[Math.floor(Math.random() * healColors.length)];
        shape = 'star';
        size = Math.random() * 4 + 2;
        decay = Math.random() * 0.02 + 0.01;
        gravity = -0.08; // ascends like a blessing
      } else if (type === 'shield') {
        // Cyan crystal defense barrier shards
        const shieldColors = ['#38bdf8', '#0ea5e9', '#7dd3fc', '#bae6fd', '#ffffff'];
        color = shieldColors[Math.floor(Math.random() * shieldColors.length)];
        shape = 'spark';
        size = Math.random() * 4 + 2;
        decay = Math.random() * 0.025 + 0.015;
        gravity = 0.05;
      }

      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color,
        alpha: 1,
        decay,
        gravity,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        shape,
        length: Math.random() * 16 + 8,
      });
    }

    particlesRef.current.push(...newParticles);

    // If loop isn't running, start it
    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(render);
    }
  };

  useImperativeHandle(ref, () => ({
    triggerBurst: (x: number, y: number, type: ParticleEffectType) => {
      createBurst(x, y, type);
    },
    triggerCardBurst: (elementId: string, type: ParticleEffectType) => {
      const el = document.getElementById(elementId);
      if (el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        createBurst(centerX, centerY, type);
      } else {
        // Fallback to center of screen
        createBurst(window.innerWidth / 2, window.innerHeight / 3, type);
      }
    },
  }));

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      animFrameRef.current = null;
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animFrameRef.current = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.96; // drag
      p.vy *= 0.96;
      p.rotation += p.vRot;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'slash') {
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(-(p.length || 12) / 2, 0);
        ctx.lineTo((p.length || 12) / 2, 0);
        ctx.stroke();
      } else if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.5);
        ctx.lineTo(p.size * 0.5, 0);
        ctx.lineTo(0, p.size * 1.5);
        ctx.lineTo(-p.size * 0.5, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'star') {
        ctx.beginPath();
        for (let s = 0; s < 5; s++) {
          ctx.lineTo(
            Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size,
            -Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size
          );
          ctx.lineTo(
            Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size / 2),
            -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size / 2)
          );
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      animFrameRef.current = null;
    }
  };

  // Resize canvas to match window
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
});
