import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { acousticFeedback } from '../utils/acousticFeedback';
import './WaxSealStamp.css';

interface WaxSealStampProps {
  onStampComplete?: () => void;
  className?: string;
  coupleNames?: string;
}

export const WaxSealStamp: React.FC<WaxSealStampProps> = ({
  onStampComplete,
  className = '',
  coupleNames
}) => {
  const [stampPhase, setStampPhase] = useState<'descending' | 'pressing' | 'cooling' | 'sealed'>('descending');

  useEffect(() => {
    // 1. Descend and impact at 180ms
    const t1 = setTimeout(() => {
      setStampPhase('pressing');
      triggerHaptic('heavy');
      acousticFeedback.playWaxStampCrackle();
    }, 220);

    // 2. Brass stamp lifts off at 750ms leaving embossed wax
    const t2 = setTimeout(() => {
      setStampPhase('cooling');
      triggerHaptic('light');
    }, 750);

    // 3. Complete seal solidification at 1100ms
    const t3 = setTimeout(() => {
      setStampPhase('sealed');
      if (onStampComplete) onStampComplete();
    }, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onStampComplete]);

  const handleSealClick = () => {
    triggerHaptic('light');
    acousticFeedback.playThemeChime();
  };

  return (
    <div
      className={`wax-seal-container phase-${stampPhase} ${className}`}
      onClick={handleSealClick}
      title="Authentic YOU & ME Atelier Sealing Wax Crest"
    >
      {/* 3D Turned Brass Stamp Handle (Descends, presses, and retracts) */}
      {(stampPhase === 'descending' || stampPhase === 'pressing' || stampPhase === 'cooling') && (
        <div className="brass-stamp-handle" aria-hidden="true">
          <div className="handle-knob" />
          <div className="handle-stem" />
          <div className="handle-collar" />
          <div className="handle-die-face" />
        </div>
      )}

      {/* Realistic 3D Molten Burgundy Wax Seal Crest */}
      <div className="molten-wax-seal">
        <svg
          viewBox="0 0 160 160"
          className="wax-seal-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Burgundy Wax Radial Gradient */}
            <radialGradient id="waxGradient" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#A81D2E" />
              <stop offset="40%" stopColor="#82111E" />
              <stop offset="75%" stopColor="#5C0812" />
              <stop offset="100%" stopColor="#350308" />
            </radialGradient>

            {/* Specular Wax Highlight */}
            <radialGradient id="waxHighlight" cx="35%" cy="30%" r="40%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
              <stop offset="45%" stopColor="rgba(255, 200, 200, 0.12)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>

            {/* Antique Gold Inset Tint */}
            <linearGradient id="waxGoldTint" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EED582" />
              <stop offset="50%" stopColor="#C59B27" />
              <stop offset="100%" stopColor="#8A6510" />
            </linearGradient>

            {/* Deep Emboss Filter */}
            <filter id="waxEmbossShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="rgba(0,0,0,0.65)" />
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.4)" />
            </filter>
          </defs>

          {/* 1. Organic Melted Wax Outer Spreading Lip */}
          <path
            d="M 80 8 
               C 106 6, 128 16, 142 34 
               C 155 52, 156 78, 149 104 
               C 142 128, 126 148, 102 154 
               C 76 160, 48 155, 28 140 
               C 10 124, 4 98, 8 74 
               C 12 48, 28 26, 52 14 
               C 62 9, 70 8, 80 8 Z"
            fill="url(#waxGradient)"
            filter="url(#waxEmbossShadow)"
            className="wax-outer-lip"
          />

          {/* 2. Concentric Beveled Wax Ridge */}
          <circle
            cx="80"
            cy="80"
            r="56"
            fill="url(#waxGradient)"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="1.5"
            className="wax-inner-bed"
          />
          <circle
            cx="80"
            cy="80"
            r="51"
            fill="none"
            stroke="url(#waxGoldTint)"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.85"
          />

          {/* 3. Outer Curved Text Path: YOU & ME · ATELIER PROVENANCE */}
          <path
            id="textArcTop"
            d="M 36 80 A 44 44 0 0 1 124 80"
            fill="none"
          />
          <path
            id="textArcBottom"
            d="M 124 80 A 44 44 0 0 1 36 80"
            fill="none"
          />

          <text
            fontSize="7.5"
            fontFamily="Cinzel, Playfair Display, serif"
            fontWeight="700"
            letterSpacing="0.2em"
            fill="url(#waxGoldTint)"
            className="wax-embossed-text"
          >
            <textPath href="#textArcTop" startOffset="50%" textAnchor="middle">
              YOU &amp; ME ATELIER
            </textPath>
          </text>

          <text
            fontSize="6.5"
            fontFamily="sans-serif"
            fontWeight="600"
            letterSpacing="0.22em"
            fill="url(#waxGoldTint)"
            className="wax-embossed-text"
          >
            <textPath href="#textArcBottom" startOffset="50%" textAnchor="middle">
              EST. 2018 · INDIA
            </textPath>
          </text>

          {/* 4. Center Double-Heart Crest Emblem */}
          <g transform="translate(80, 80) scale(0.95)" className="wax-center-crest">
            {/* Heart 1 */}
            <path
              d="M -12 -6 C -18 -14, -26 -6, -26 2 C -26 12, -12 20, -12 20 C -12 20, 2 12, 2 2 C 2 -6, -6 -14, -12 -6 Z"
              fill="rgba(40, 2, 6, 0.4)"
              stroke="url(#waxGoldTint)"
              strokeWidth="1.2"
              transform="translate(4, -4) scale(0.72)"
            />
            {/* Heart 2 */}
            <path
              d="M 12 -6 C 6 -14, -2 -6, -2 2 C -2 12, 12 20, 12 20 C 12 20, 26 12, 26 2 C 26 -6, 18 -14, 12 -6 Z"
              fill="none"
              stroke="url(#waxGoldTint)"
              strokeWidth="1.2"
              transform="translate(-4, -4) scale(0.72)"
            />

            {/* Crown / Star motif */}
            <polygon
              points="0,-16 4,-9 11,-9 6,-4 8,3 0,-1 -8,3 -6,-4 -11,-9 -4,-9"
              fill="url(#waxGoldTint)"
              transform="scale(0.55)"
            />
          </g>

          {/* 5. Surface Specular Gloss Highlight Overlay */}
          <path
            d="M 80 8 
               C 106 6, 128 16, 142 34 
               C 155 52, 156 78, 149 104 
               C 142 128, 126 148, 102 154 
               C 76 160, 48 155, 28 140 
               C 10 124, 4 98, 8 74 
               C 12 48, 28 26, 52 14 
               C 62 9, 70 8, 80 8 Z"
            fill="url(#waxHighlight)"
            pointerEvents="none"
            className="wax-specular-light"
          />
        </svg>

        {coupleNames && (
          <div className="wax-seal-ribbon">
            <span className="ribbon-tail left" />
            <span className="ribbon-label">COMMISSION SEALED · {coupleNames}</span>
            <span className="ribbon-tail right" />
          </div>
        )}
      </div>
    </div>
  );
};

