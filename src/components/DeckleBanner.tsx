import React from 'react';
import './DeckleBanner.css';
import { UNIFIED_TORN_PATHS } from './deckleBannerUnifiedPaths';

interface DeckleBannerProps {
  quote?: string;
  author?: string;
  prefix?: string;
  title?: string;
  className?: string;
  variant?: 'crimson' | 'charcoal';
}

export const DeckleBanner: React.FC<DeckleBannerProps> = ({
  quote,
  author,
  prefix,
  title,
  className = '',
  variant = 'crimson'
}) => {
  const isCrimson = variant === 'crimson';

  return (
    <div className={`deckle-banner-wrapper ${variant} ${className}`} aria-hidden={!title && !quote ? undefined : undefined}>
      {/* ── UNIFIED TORN PAPER BACKGROUND (100% continuous, zero seams, perfectly blended) ── */}
      <svg
        className="deckle-paper-svg"
        viewBox={UNIFIED_TORN_PATHS.viewBox}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* Crimson fine-art paper gradient */}
          <linearGradient id="deckleCrimsonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7a0f0f" />
            <stop offset="18%" stopColor="#891212" />
            <stop offset="50%" stopColor="#961717" />
            <stop offset="82%" stopColor="#891212" />
            <stop offset="100%" stopColor="#700d0d" />
          </linearGradient>
          <radialGradient id="deckleCrimsonVignette" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#a31c1c" stopOpacity="0.32" />
            <stop offset="65%" stopColor="#891212" stopOpacity="0" />
            <stop offset="100%" stopColor="#4f0808" stopOpacity="0.38" />
          </radialGradient>

          {/* Charcoal fine-art paper gradient */}
          <linearGradient id="deckleCharcoalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#140e10" />
            <stop offset="20%" stopColor="#1a1215" />
            <stop offset="50%" stopColor="#22181c" />
            <stop offset="80%" stopColor="#1a1215" />
            <stop offset="100%" stopColor="#120c0e" />
          </linearGradient>
          <radialGradient id="deckleCharcoalVignette" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#2e2025" stopOpacity="0.3" />
            <stop offset="65%" stopColor="#1a1215" stopOpacity="0" />
            <stop offset="100%" stopColor="#0a0607" stopOpacity="0.45" />
          </radialGradient>
        </defs>

        {/* 1. Exposed Cotton Paper Fibers along top & bottom tears */}
        <path
          d={UNIFIED_TORN_PATHS.topFiber}
          fill={isCrimson ? "rgba(255, 242, 228, 0.28)" : "rgba(240, 230, 220, 0.22)"}
          className="deckle-paper-fiber"
        />
        <path
          d={UNIFIED_TORN_PATHS.botFiber}
          fill={isCrimson ? "rgba(255, 242, 228, 0.28)" : "rgba(240, 230, 220, 0.22)"}
          className="deckle-paper-fiber"
        />

        {/* 2. Main Continuous Torn Paper Body (Seamless from top rip to bottom rip!) */}
        <path
          d={UNIFIED_TORN_PATHS.bodyPath}
          fill={isCrimson ? "url(#deckleCrimsonGrad)" : "url(#deckleCharcoalGrad)"}
          className="deckle-paper-body"
        />

        {/* 3. Subtle atmospheric depth vignette on the same paper body */}
        <path
          d={UNIFIED_TORN_PATHS.bodyPath}
          fill={isCrimson ? "url(#deckleCrimsonVignette)" : "url(#deckleCharcoalVignette)"}
          className="deckle-paper-vignette"
        />

        {/* 4. Fine micro-highlight reflection along physical tear lines */}
        <path
          d={UNIFIED_TORN_PATHS.topLine}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.8"
          fill="none"
          className="deckle-paper-tear-line"
        />
        <path
          d={UNIFIED_TORN_PATHS.botLine}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.8"
          fill="none"
          className="deckle-paper-tear-line"
        />
      </svg>

      {/* Tactile paper grain & fold lighting overlays */}
      <div className="deckle-paper-grain" aria-hidden="true" />
      <div className="deckle-paper-folds" aria-hidden="true" />

      {/* Editorial Quote Content (Floating cleanly on the unified paper surface) */}
      <div className="deckle-banner-content">
        {title && (
          <div className="deckle-banner-header">
            {prefix && <span className="deckle-banner-prefix">{prefix}</span>}
            <h2 className="deckle-banner-title">{title}</h2>
          </div>
        )}

        {quote && (
          <div className="deckle-quote-container">
            <span className="deckle-quote-mark" aria-hidden="true">“</span>
            <p className="deckle-quote-text">{quote}</p>
            {author && <span className="deckle-quote-author">— {author}</span>}
          </div>
        )}
      </div>
    </div>
  );
};


