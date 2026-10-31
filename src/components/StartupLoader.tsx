import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sparkles, Heart, Compass, Camera, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { businessInfo } from '../data/businessData';
import { triggerHaptic } from '../utils/haptics';
import { acousticFeedback } from '../utils/acousticFeedback';
import './StartupLoader.css';

interface StartupLoaderProps {
  onComplete: () => void;
}

interface PetalParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  swayAmp: number;
  swaySpeed: number;
  swayOffset: number;
  pitch: number;
  pitchSpeed: number;
  roll: number;
  rollSpeed: number;
  yaw: number;
  yawSpeed: number;
  scale: number;
  opacity: number;
  imgIndex: number;
  burstVx?: number;
  burstVy?: number;
}

interface GoldSparkle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedY: number;
  speedX: number;
  phase: number;
}

const PETAL_SPRITES = [
  '/assets/petals/petal_1.png',
  '/assets/petals/petal_2.png',
  '/assets/petals/petal_3.png',
  '/assets/petals/petal_4.png',
  '/assets/petals/petal_5.png',
  '/assets/petals/petal_6.png'
];

const PREVIEW_FRAMES = [
  {
    url: '/assets/posters/urmi_jasraj.jpg',
    caption: 'Jasraj & Urmi — The Royal Gala',
    filmStock: 'Kodak Vision3 500T'
  },
  {
    url: '/assets/posters/ankita_subhadeep.jpg',
    caption: 'Ankita & Subhadeep — Heritage Bengal',
    filmStock: 'Cinestill 800T'
  },
  {
    url: '/assets/posters/paraj_mrinmoyee.jpg',
    caption: 'Paraj & Mrinmoyee — Sacred Flame',
    filmStock: 'Kodak Portra 400'
  },
  {
    url: '/assets/posters/suchi_hira.jpg',
    caption: 'Suchi & Hira — Twilight Horizon',
    filmStock: 'Fuji Pro 400H'
  }
];

const CRAFT_STAGES = [
  {
    stage: '01',
    name: 'Emulsion & Light Calibration',
    desc: 'Sensitizing camera sensor & balancing golden hour exposure',
    range: [0, 25]
  },
  {
    stage: '02',
    name: 'Documentary Master Stills',
    desc: 'Developing 35mm fine-art frames & unposed intimacies',
    range: [26, 50]
  },
  {
    stage: '03',
    name: 'Sacred Ritual Chronicles',
    desc: 'Color grading joyous laughter, sacred phere & tender tears',
    range: [51, 80]
  },
  {
    stage: '04',
    name: 'Atelier Sanctuary Ready',
    desc: 'Orchestrating 2026/27 seasonal curated monograph',
    range: [81, 100]
  }
];

export const StartupLoader: React.FC<StartupLoaderProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => acousticFeedback.getIsEnabled());
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);
  const particlesRef = useRef<PetalParticle[]>([]);
  const sparklesRef = useRef<GoldSparkle[]>([]);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const animFrameIdRef = useRef<number | null>(null);
  const hasTriggeredOpenRef = useRef(false);

  // Prevent background scrolling while startup overlay is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Cycle preview photograph exposures in the viewfinder
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFrameIdx((prev) => (prev + 1) % PREVIEW_FRAMES.length);
    }, 950);
    return () => clearInterval(timer);
  }, []);

  // Preload real photographic rose petal sprites
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    PETAL_SPRITES.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === PETAL_SPRITES.length) {
          loadedImagesRef.current = images;
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === PETAL_SPRITES.length) {
          loadedImagesRef.current = images;
        }
      };
      images.push(img);
    });
  }, []);

  // Initialize Particles (3D Rose Petals & Golden Stardust)
  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = window.innerWidth < 768 ? 28 : 46;
    const petals: PetalParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const z = 0.45 + Math.random() * 0.95; // Depth factor
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height * 1.3 - height * 0.3,
        z,
        vx: 0,
        vy: (1.1 + Math.random() * 1.6) * z,
        swayAmp: (1.5 + Math.random() * 2.4) * z,
        swaySpeed: 0.015 + Math.random() * 0.018,
        swayOffset: Math.random() * Math.PI * 2,
        pitch: Math.random() * Math.PI * 2,
        pitchSpeed: (0.012 + Math.random() * 0.024) * (Math.random() > 0.5 ? 1 : -1),
        roll: Math.random() * Math.PI * 2,
        rollSpeed: (0.01 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1),
        yaw: Math.random() * Math.PI * 2,
        yawSpeed: (0.008 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1),
        scale: (26 + Math.random() * 32) * z,
        opacity: 0.75 + Math.random() * 0.25,
        imgIndex: Math.floor(Math.random() * PETAL_SPRITES.length)
      });
    }
    particlesRef.current = petals;

    // Golden ambient sparkle dust
    const sparkles: GoldSparkle[] = [];
    const sparkleCount = window.innerWidth < 768 ? 26 : 45;
    for (let j = 0; j < sparkleCount; j++) {
      sparkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2.8,
        alpha: 0.25 + Math.random() * 0.65,
        speedY: 0.25 + Math.random() * 0.65,
        speedX: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }
    sparklesRef.current = sparkles;
  }, []);

  // Trigger the Grand Aperture Opening Reveal
  const handleOpenHomepage = useCallback(() => {
    if (hasTriggeredOpenRef.current) return;
    hasTriggeredOpenRef.current = true;

    triggerHaptic('medium');
    if (soundEnabled) {
      acousticFeedback.playShutterClick();
      setTimeout(() => {
        acousticFeedback.playThemeChime();
      }, 150);
    }
    setIsOpening(true);

    // Dynamic explosive petal dispersion outward from the central viewfinder
    const width = window.innerWidth;
    const height = window.innerHeight;
    const cx = width / 2;
    const cy = height * 0.44;

    particlesRef.current.forEach((p) => {
      const angle = Math.atan2(p.y - cy, p.x - cx);
      const force = 12 + Math.random() * 18;
      p.burstVx = Math.cos(angle) * force;
      p.burstVy = Math.sin(angle) * force - (3 + Math.random() * 5);
    });

    // Sequence transition into homepage
    setTimeout(() => {
      setIsExiting(true);
    }, 720);

    setTimeout(() => {
      onComplete();
    }, 1150);
  }, [onComplete, soundEnabled]);

  // Keyboard shortcut listener (Space or Enter to enter immediately)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleOpenHomepage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenHomepage]);

  // Smooth Craft Progress Counter (2.7s luxury cadence with acoustic feedback pips)
  useEffect(() => {
    let current = 0;
    const startTime = performance.now();
    const duration = 2700;
    let lastPip = 0;

    const interval = setInterval(() => {
      // Allow visual design preview without auto-dismiss if ?loader=preview is present
      if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('loader') === 'preview') {
        setProgress(56);
        return;
      }

      const elapsed = performance.now() - startTime;
      const progressRatio = Math.min(1, elapsed / duration);
      // EaseOutCubic curve for organic deceleration
      const ease = 1 - Math.pow(1 - progressRatio, 3);
      current = Math.min(100, Math.round(ease * 100));
      setProgress(current);

      // Acoustic micro-clicks at major 25% craft stage milestones
      const stageIdx = Math.floor(current / 25);
      if (stageIdx > lastPip && stageIdx <= 3) {
        lastPip = stageIdx;
        triggerHaptic('light');
      }

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          handleOpenHomepage();
        }, 320);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [handleOpenHomepage]);

  // Canvas Particle Physics & Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    initParticles(width, height);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      mousePosRef.current = { x: clientX, y: clientY, active: true };
    };

    const handlePointerLeave = () => {
      mousePosRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // 1. Render Golden Star Dust
      ctx.save();
      sparklesRef.current.forEach((sp) => {
        sp.y -= sp.speedY;
        sp.x += sp.speedX;
        if (sp.y < -10) sp.y = height + 10;
        if (sp.x < -10) sp.x = width + 10;
        if (sp.x > width + 10) sp.x = -10;

        const pulseAlpha = sp.alpha * (0.6 + 0.4 * Math.sin(time * 3 + sp.phase));
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${pulseAlpha})`;
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 6;
        ctx.fill();
      });
      ctx.restore();

      // 2. Render Falling 3D Tumbling Rose Petals
      const petals = particlesRef.current;
      const images = loadedImagesRef.current;
      const mouse = mousePosRef.current;

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        if (p.burstVx !== undefined && p.burstVy !== undefined) {
          p.x += p.burstVx;
          p.y += p.burstVy;
          p.burstVx *= 0.95;
          p.burstVy += 0.2; // Gravity
          p.pitch += p.pitchSpeed * 3;
          p.roll += p.rollSpeed * 3;
          p.yaw += p.yawSpeed * 3;
        } else {
          p.y += p.vy;
          const sway = Math.sin(time * 2 + p.swayOffset) * p.swayAmp;
          p.x += sway * 0.85;

          p.pitch += p.pitchSpeed;
          p.roll += p.rollSpeed;
          p.yaw += p.yawSpeed;

          // Interactive cursor wind draft
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140 && dist > 0) {
              const push = ((140 - dist) / 140) * 3.2;
              p.x += (dx / dist) * push;
              p.y += (dy / dist) * push * 0.7;
              p.yaw += 0.05;
            }
          }

          if (p.y > height + 80) {
            p.y = -70;
            p.x = Math.random() * width;
            p.pitch = Math.random() * Math.PI * 2;
            p.roll = Math.random() * Math.PI * 2;
          }
          if (p.x < -80) p.x = width + 70;
          if (p.x > width + 80) p.x = -70;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.yaw);

        // 3D perspective squish with lighting factor
        const scaleX = Math.cos(p.roll);
        const scaleY = Math.cos(p.pitch);
        ctx.scale(Math.abs(scaleX) < 0.1 ? 0.1 : scaleX, Math.abs(scaleY) < 0.1 ? 0.1 : scaleY);

        ctx.globalAlpha = p.opacity;

        const img = images[p.imgIndex % images.length];
        if (img && img.complete && img.naturalWidth > 0) {
          const aspect = img.naturalHeight / (img.naturalWidth || 1);
          const drawW = p.scale;
          const drawH = p.scale * aspect;
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        } else {
          // Velvet crimson petal fallback
          ctx.beginPath();
          ctx.moveTo(0, -p.scale / 2);
          ctx.bezierCurveTo(p.scale / 2, -p.scale / 2, p.scale / 2, p.scale / 3, 0, p.scale / 2);
          ctx.bezierCurveTo(-p.scale / 2, p.scale / 3, -p.scale / 2, -p.scale / 2, 0, -p.scale / 2);
          const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, p.scale / 2);
          grad.addColorStop(0, '#8B1428');
          grad.addColorStop(0.6, '#560B18');
          grad.addColorStop(1, '#2E050C');
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [initParticles]);

  // Current active craft stage description
  const activeStage = useMemo(() => {
    return (
      CRAFT_STAGES.find((s) => progress >= s.range[0] && progress <= s.range[1]) || CRARAFT_FALLBACK
    );
  }, [progress]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    acousticFeedback.setEnabled(nextState);
    triggerHaptic('selection');
  };

  const activePhoto = PREVIEW_FRAMES[currentFrameIdx];

  return (
    <aside
      className={`startup-loader-overlay ${isOpening ? 'is-opening' : ''} ${isExiting ? 'is-exiting' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to YOU & ME Wedding Photography Atelier"
    >
      {/* 1. Dynamic Falling Rose Petals & Golden Stardust Canvas */}
      <canvas ref={canvasRef} className="startup-petals-canvas" />

      {/* 2. Atmospheric Darkroom Backdrops & Radial Light Rays */}
      <div className="loader-ambient-vignette" aria-hidden="true" />
      <div className="loader-radial-glow" aria-hidden="true" />
      <div className="loader-light-beam beam-left" aria-hidden="true" />
      <div className="loader-light-beam beam-right" aria-hidden="true" />

      {/* 3. Top Editorial Atelier Bar */}
      <header className="loader-top-bar">
        <div className="loader-brand-kicker">
          <span className="live-camera-dot" aria-hidden="true" />
          <span>YOU &amp; ME · ATELIER CINÉMATOGRAPHIQUE</span>
        </div>

        <div className="loader-center-crest">
          <span className="crest-line" />
          <span className="crest-text">EST. 2018 · INDIA &amp; WORLDWIDE</span>
          <span className="crest-line" />
        </div>

        <div className="loader-audio-control">
          <button
            type="button"
            className="loader-sound-toggle"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Disable Atelier Sound' : 'Enable Atelier Sound'}
            title={soundEnabled ? 'Mute acoustic cues' : 'Unmute acoustic cues'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="sound-label">{soundEnabled ? 'SOUND ON' : 'MUTED'}</span>
          </button>
        </div>
      </header>

      {/* 4. Ornate Gold Filigree Corner Accents with Animated Geometric Strokes */}
      <svg className="loader-corner-svg corner-tl" viewBox="0 0 80 80" aria-hidden="true">
        <path d="M 2 78 L 2 2 L 78 2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M 12 70 L 12 12 L 70 12" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 3" />
        <circle cx="2" cy="2" r="2.5" fill="#D4AF37" />
        <circle cx="70" cy="12" r="1.5" fill="#D4AF37" />
        <circle cx="12" cy="70" r="1.5" fill="#D4AF37" />
      </svg>

      <svg className="loader-corner-svg corner-tr" viewBox="0 0 80 80" aria-hidden="true">
        <path d="M 78 78 L 78 2 L 2 2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M 68 70 L 68 12 L 10 12" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 3" />
        <circle cx="78" cy="2" r="2.5" fill="#D4AF37" />
        <circle cx="10" cy="12" r="1.5" fill="#D4AF37" />
        <circle cx="68" cy="70" r="1.5" fill="#D4AF37" />
      </svg>

      <svg className="loader-corner-svg corner-bl" viewBox="0 0 80 80" aria-hidden="true">
        <path d="M 2 2 L 2 78 L 78 78" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M 12 10 L 12 68 L 70 68" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 3" />
        <circle cx="2" cy="78" r="2.5" fill="#D4AF37" />
        <circle cx="70" cy="68" r="1.5" fill="#D4AF37" />
        <circle cx="12" cy="10" r="1.5" fill="#D4AF37" />
      </svg>

      <svg className="loader-corner-svg corner-br" viewBox="0 0 80 80" aria-hidden="true">
        <path d="M 78 2 L 78 78 L 2 78" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M 68 10 L 68 68 L 10 68" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 3" />
        <circle cx="78" cy="78" r="2.5" fill="#D4AF37" />
        <circle cx="10" cy="68" r="1.5" fill="#D4AF37" />
        <circle cx="68" cy="10" r="1.5" fill="#D4AF37" />
      </svg>

      {/* 5. Center Stage: Camera Shutter Viewfinder & Brand Monogram */}
      <main className="loader-center-stage">
        {/* Concentric Golden Lens Calibration Rings */}
        <div className="loader-viewfinder-frame">
          {/* Rotating Outer Lens Barrel with Engraved Measurement Ticks */}
          <div
            className="lens-barrel-ring outer"
            style={{ transform: `rotate(${progress * 0.6}deg)` }}
            aria-hidden="true"
          >
            <span className="lens-tick tick-0">50mm f/1.2</span>
            <span className="lens-tick tick-90">KODAK 500T</span>
            <span className="lens-tick tick-180">1/250s · 35mm</span>
            <span className="lens-tick tick-270">ARCHIVAL RAW</span>
          </div>

          <div
            className="lens-barrel-ring middle"
            style={{ transform: `rotate(-${progress * 0.4}deg)` }}
            aria-hidden="true"
          />

          {/* Golden Aura Glow behind Lens */}
          <div className="loader-halo-aura" aria-hidden="true" />

          {/* 8-Blade Mechanical Camera Aperture Iris SVG */}
          <svg className="loader-aperture-iris" viewBox="0 0 200 200" aria-hidden="true">
            <g
              transform={`rotate(${progress * 0.35} 100 100)`}
              style={{ transition: 'transform 0.08s linear' }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                <path
                  key={idx}
                  d="M 100 30 C 130 50, 150 80, 160 100 C 140 90, 115 85, 100 85 Z"
                  fill="rgba(212, 175, 55, 0.16)"
                  stroke="rgba(212, 175, 55, 0.55)"
                  strokeWidth="0.8"
                  transform={`rotate(${angle} 100 100)`}
                />
              ))}
            </g>
          </svg>

          {/* Central Glass Lens Element with Photographic Exposure Previews */}
          <div
            className="lens-inner-glass"
            onClick={handleOpenHomepage}
            role="button"
            tabIndex={0}
            title="Click or press Space to enter sanctuary"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleOpenHomepage();
              }
            }}
          >
            {/* Cross-fading Authentic Master Frames inside the Lens Glass */}
            <div className="lens-film-preview">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption}
                className="film-exposure-img"
              />
              <div className="film-amber-wash" aria-hidden="true" />
            </div>

            {/* Glass caustic light reflection */}
            <div className="lens-glass-reflection" aria-hidden="true" />

            {/* Central Brand Badge Floating over the Glass */}
            <div className="loader-brand-emblem">
              <img
                src="/assets/brand/logo_white.png"
                alt={businessInfo.name}
                className="loader-logo-img"
                width="280"
                height="86"
              />
              <div className="emblem-curatorial-pill">
                <Sparkles size={11} className="gold-icon" />
                <span>HEIRLOOM CINEMA &amp; STILLS</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Active Frame Caption Indicator */}
        <div className="loader-shutter-meta">
          <Camera size={12} className="meta-camera-icon" />
          <span className="shutter-caption">{activePhoto.caption}</span>
          <span className="shutter-dot">·</span>
          <span className="shutter-stock">{activePhoto.filmStock}</span>
        </div>

        {/* 7. Craft Progress Storytelling Section */}
        <div className="loader-craft-stepper">
          {/* Dual-Rail Precision Progress Track */}
          <div className="stepper-track-wrap">
            <div
              className="stepper-track-fill"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span className="stepper-head-spark" />
            </div>
          </div>

          {/* 4 Interactive Milestone Node Indicators */}
          <div className="stepper-nodes-row" aria-hidden="true">
            {CRAFT_STAGES.map((s) => {
              const isPast = progress >= s.range[0];
              const isCurrent = progress >= s.range[0] && progress <= s.range[1];
              return (
                <div
                  key={s.stage}
                  className={`stepper-node ${isPast ? 'is-past' : ''} ${isCurrent ? 'is-current' : ''}`}
                >
                  <span className="node-diamond" />
                  <span className="node-num">{s.stage}</span>
                </div>
              );
            })}
          </div>

          {/* Dynamic Editorial Milestone Label */}
          <div className="stepper-info-row">
            <div className="stepper-text-col">
              <span className="stepper-stage-title">{activeStage.name}</span>
              <p className="stepper-stage-desc">{activeStage.desc}</p>
            </div>
            <div className="stepper-counter-col">
              <span className="stepper-percentage">{String(progress).padStart(2, '0')}%</span>
              <span className="stepper-cal-mark">CALIBRATION</span>
            </div>
          </div>
        </div>

        {/* 8. Skip / Fast Enter Sanctuary Button */}
        <div className="loader-action-row">
          <button
            type="button"
            className="loader-enter-btn"
            onClick={handleOpenHomepage}
            aria-label="Enter YOU & ME Atelier"
          >
            <span>Enter Sanctuary</span>
            <ArrowRight size={14} className="enter-arrow" />
          </button>
          <span className="loader-keyhint">Press [Space] or [Enter] anytime</span>
        </div>
      </main>

      {/* 9. Bottom Director's Vow & Archival Heritage Guarantee */}
      <footer className="loader-footer-bar">
        <div className="footer-location-tag">
          <Compass size={12} className="gold-icon" />
          <span>Atelier Agartala &amp; Kolkata · Destination Worldwide</span>
        </div>

        <p className="footer-vow-quote">
          &ldquo;Every love story deserves to be preserved with reverence, quiet intimacy, and enduring artistic truth.&rdquo;
        </p>

        <div className="footer-heritage-tag">
          <Heart size={11} className="crimson-icon" />
          <span>Centennial Archival Quality Guaranteed</span>
        </div>
      </footer>
    </aside>
  );
};

const CRARAFT_FALLBACK = {
  stage: '04',
  name: 'Atelier Sanctuary Ready',
  desc: 'Welcome to YOU & ME Atelier',
  range: [81, 100]
};
