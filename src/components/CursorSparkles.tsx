import React, { useEffect, useRef, useCallback } from 'react';
import './CursorSparkles.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  symbol: string;
  size: number;
  rotation: number;
  vx: number;
  vy: number;
  life: number;
  el: HTMLDivElement;
}

// Premium wedding sparkle symbols: 4-pointed stars, 5-point star, heart, florette, diamond, sparkles
const SYMBOLS = [
  '\u2726', // ✦ Black four-pointed star
  '\u2727', // ✧ White four-pointed star
  '\u2605', // ★ Five-pointed star
  '\u2661', // ♡ Heart
  '\u273F', // ✿ Florette
  '\u25C8', // ◈ Diamond
  '\u2728', // ✨ Sparkles
  '\u2742', // ❂ Circled open center eight-pointed star
];
const MAX_PARTICLES = 28;

interface CursorSparklesProps {
  containerRef: React.RefObject<HTMLElement>;
}

export const CursorSparkles: React.FC<CursorSparklesProps> = ({ containerRef }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const particles = useRef<Particle[]>([]);
  const uidRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);

  const spawnParticle = useCallback((x: number, y: number) => {
    if (!hostRef.current) return;
    const now = performance.now();
    if (now - lastSpawnRef.current < 38) return;
    lastSpawnRef.current = now;

    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const size = 10 + Math.random() * 14;
    const rotation = Math.random() * 360;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.6 + Math.random() * 1.2;

    const colors = ['#D4AF37', '#F5C842', '#E8C587', '#FFE082', '#FFF5C0'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const el = document.createElement('div');
    el.className = 'cs-particle';
    el.textContent = symbol;
    el.style.cssText = `left:${x}px;top:${y}px;font-size:${size}px;transform:rotate(${rotation}deg) scale(1);color:${color};`;
    hostRef.current.appendChild(el);

    const p: Particle = { id: ++uidRef.current, x, y, symbol, size, rotation, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.4, life: 1, el };

    if (particles.current.length >= MAX_PARTICLES) {
      const oldest = particles.current.shift();
      oldest?.el.remove();
    }
    particles.current.push(p);
  }, []);

  useEffect(() => {
    let lastTime = 0;
    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.life -= 0.022 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.07 * dt;
        p.rotation += 3 * dt;
        if (p.life <= 0) { p.el.remove(); particles.current.splice(i, 1); continue; }
        const scale = 0.4 + p.life * 0.7;
        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;
        p.el.style.opacity = String(Math.min(1, p.life * 2.5));
        p.el.style.transform = `rotate(${p.rotation}deg) scale(${scale})`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hostRef.current) return;
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      spawnParticle(e.clientX - rect.left, e.clientY - rect.top);
    };
    const onTouch = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const t = e.touches[0];
      if (t) {
        spawnParticle(t.clientX - rect.left, t.clientY - rect.top);
      }
    };

    container.addEventListener('mousemove', onMove, { passive: true });
    container.addEventListener('touchmove', onTouch, { passive: true });
    return () => { container.removeEventListener('mousemove', onMove); container.removeEventListener('touchmove', onTouch); };
  }, [containerRef, spawnParticle]);

  return <div ref={hostRef} className="cs-sparkle-host" aria-hidden="true" />;
};
