import React from 'react';
import './IlluminatedDropCap.css';

interface IlluminatedDropCapProps {
  letter: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const IlluminatedDropCap: React.FC<IlluminatedDropCapProps> = ({
  letter,
  size = 'md',
  className = ''
}) => {
  const initial = (letter || 'E').charAt(0).toUpperCase();

  return (
    <span
      className={`illuminated-dropcap-wrap size-${size} ${className}`}
      aria-hidden="true"
    >
      <svg
        className="dropcap-ornament-svg"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dropcapGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2C6" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#F3E196" />
            <stop offset="75%" stopColor="#AA8222" />
            <stop offset="100%" stopColor="#6C4E08" />
          </linearGradient>

          <linearGradient id="dropcapCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A1212" />
            <stop offset="50%" stopColor="#580808" />
            <stop offset="100%" stopColor="#2D0303" />
          </linearGradient>

          <filter id="dropcapGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="1" dy="2" result="offsetblur" />
            <feFlood floodColor="rgba(0,0,0,0.4)" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Ornate Mughal/Renaissance Embossed Outer Cartouche */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="6"
          fill="url(#dropcapCrimson)"
          stroke="url(#dropcapGold)"
          strokeWidth="1.8"
          filter="url(#dropcapGlow)"
          className="dropcap-cartouche"
        />

        {/* 2. Inner Guilloche Filigree Border */}
        <rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="4"
          fill="none"
          stroke="url(#dropcapGold)"
          strokeWidth="0.8"
          strokeDasharray="4 2"
          className="dropcap-inner-frame"
        />

        {/* 3. Four Corner Lotus/Acanthus Petal Accents */}
        <circle cx="12" cy="12" r="3" fill="url(#dropcapGold)" />
        <circle cx="88" cy="12" r="3" fill="url(#dropcapGold)" />
        <circle cx="12" cy="88" r="3" fill="url(#dropcapGold)" />
        <circle cx="88" cy="88" r="3" fill="url(#dropcapGold)" />

        {/* Foliage flourishes */}
        <path
          d="M 16 26 C 24 16, 32 18, 36 28 C 30 28, 24 32, 20 40"
          stroke="url(#dropcapGold)"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
          className="dropcap-vine"
        />
        <path
          d="M 84 74 C 76 84, 68 82, 64 72 C 70 72, 76 68, 80 60"
          stroke="url(#dropcapGold)"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
          className="dropcap-vine"
        />

        {/* 4. Center Gold Foil Embossed Initial Letter */}
        <text
          x="50"
          y="68"
          textAnchor="middle"
          fontFamily="Playfair Display, Cormorant Garamond, serif"
          fontSize="54"
          fontWeight="700"
          fill="url(#dropcapGold)"
          stroke="rgba(90, 60, 10, 0.4)"
          strokeWidth="0.8"
          className="dropcap-letter-text"
        >
          {initial}
        </text>
      </svg>
    </span>
  );
};

