import React from 'react';
import { couplesData } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { handleImageError } from '../utils/imageFallback';
import './PhotoShowreel.css';

interface ShowreelCard {
  id: string;
  story: WeddingStory;
  imageIndex: number;
  imageUrl: string;
  coupleTitle: string;
  category: string;
  location: string;
}

interface PhotoShowreelProps {
  onPhotoClick?: (story: WeddingStory, imageIndex: number) => void;
  tiltAngle?: number;
  className?: string;
  showCaption?: boolean;
}

// Curate high-impact photo slides with stable, pure indexing across couplesData
const buildShowreelCards = () => {
  const CARDS_PER_ROW = 8;
  const couples = couplesData;
  const r1Couples = couples.slice(0, CARDS_PER_ROW);
  const r2Couples = couples.length >= CARDS_PER_ROW * 2
    ? couples.slice(CARDS_PER_ROW, CARDS_PER_ROW * 2)
    : couples.slice(0, CARDS_PER_ROW);

  const createCard = (story: WeddingStory, offset: number): ShowreelCard => {
    const imagesCount = story.images.length;
    const imgIdx = imagesCount > 0 ? (offset % imagesCount) : 0;
    const img = story.images[imgIdx] || {
      id: `${story.id}-cover`,
      url: story.coverImage,
      alt: story.title
    };

    return {
      id: `${story.id}-${img.id || imgIdx}`,
      story,
      imageIndex: imgIdx,
      imageUrl: img.url,
      coupleTitle: story.title,
      category: story.category,
      location: story.location || 'Agartala • Kolkata'
    };
  };

  return {
    row1Cards: r1Couples.map((story, i) => createCard(story, i * 3)),
    row2Cards: r2Couples.map((story, i) => createCard(story, i * 3 + 1))
  };
};

const STATIC_SHOWREEL_CARDS = buildShowreelCards();

export const PhotoShowreel: React.FC<PhotoShowreelProps> = ({
  onPhotoClick,
  tiltAngle = -2,
  className = '',
  showCaption = false
}) => {
  const { row1Cards, row2Cards } = STATIC_SHOWREEL_CARDS;

  const handleCardClick = (card: ShowreelCard) => {
    if (onPhotoClick) {
      onPhotoClick(card.story, card.imageIndex);
    }
  };

  return (
    <div
      className={`photo-showreel-container ${className}`}
      style={{ '--showreel-tilt': `${tiltAngle}deg` } as React.CSSProperties}
      aria-label="Continuous cinematic wedding photography showreel"
    >
      {/* ── Ribbon Row 1: Scrolling Left ────────────────────── */}
      <div className="showreel-row-wrapper" role="region" aria-label="Showreel track 1">
        <div className="showreel-track scroll-left">
          {/* First loop sequence */}
          {row1Cards.map((card, idx) => (
            <div
              key={`r1-a-${card.id}-${idx}`}
              className="showreel-card"
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card);
                }
              }}
              aria-label={`View photo of ${card.coupleTitle}`}
            >
              <div className="showreel-media">
                <img
                  src={card.imageUrl}
                  alt={card.coupleTitle}
                  className="showreel-img"
                  loading="lazy"
                  onError={handleImageError}
                />
                <div className="showreel-card-overlay" aria-hidden="true">
                  <div className="showreel-hover-meta">
                    <span className="showreel-hover-title">{card.coupleTitle}</span>
                    <span className="showreel-hover-tag">{card.category}</span>
                  </div>
                </div>
              </div>
              {showCaption && (
                <div className="showreel-card-caption">
                  <span className="showreel-card-name">{card.coupleTitle}</span>
                  <span className="showreel-card-tag">{card.category}</span>
                </div>
              )}
            </div>
          ))}

          {/* Seamless duplicate sequence for infinite seamless marquee */}
          {row1Cards.map((card, idx) => (
            <div
              key={`r1-b-${card.id}-${idx}`}
              className="showreel-card"
              role="button"
              tabIndex={0}
              aria-hidden="true"
              onClick={() => handleCardClick(card)}
            >
              <div className="showreel-media">
                <img
                  src={card.imageUrl}
                  alt=""
                  className="showreel-img"
                  loading="lazy"
                  onError={handleImageError}
                />
                <div className="showreel-card-overlay">
                  <div className="showreel-hover-meta">
                    <span className="showreel-hover-title">{card.coupleTitle}</span>
                    <span className="showreel-hover-tag">{card.category}</span>
                  </div>
                </div>
              </div>
              {showCaption && (
                <div className="showreel-card-caption">
                  <span className="showreel-card-name">{card.coupleTitle}</span>
                  <span className="showreel-card-tag">{card.category}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Ribbon Row 2: Scrolling Right (Reverse Parallax) ── */}
      <div className="showreel-row-wrapper" role="region" aria-label="Showreel track 2">
        <div className="showreel-track scroll-right">
          {/* First loop sequence */}
          {row2Cards.map((card, idx) => (
            <div
              key={`r2-a-${card.id}-${idx}`}
              className="showreel-card"
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card);
                }
              }}
              aria-label={`View photo of ${card.coupleTitle}`}
            >
              <div className="showreel-media">
                <img
                  src={card.imageUrl}
                  alt={card.coupleTitle}
                  className="showreel-img"
                  loading="lazy"
                  onError={handleImageError}
                />
                <div className="showreel-card-overlay" aria-hidden="true">
                  <div className="showreel-hover-meta">
                    <span className="showreel-hover-title">{card.coupleTitle}</span>
                    <span className="showreel-hover-tag">{card.category}</span>
                  </div>
                </div>
              </div>
              {showCaption && (
                <div className="showreel-card-caption">
                  <span className="showreel-card-name">{card.coupleTitle}</span>
                  <span className="showreel-card-tag">{card.category}</span>
                </div>
              )}
            </div>
          ))}

          {/* Seamless duplicate sequence for infinite seamless marquee */}
          {row2Cards.map((card, idx) => (
            <div
              key={`r2-b-${card.id}-${idx}`}
              className="showreel-card"
              role="button"
              tabIndex={0}
              aria-hidden="true"
              onClick={() => handleCardClick(card)}
            >
              <div className="showreel-media">
                <img
                  src={card.imageUrl}
                  alt=""
                  className="showreel-img"
                  loading="lazy"
                  onError={handleImageError}
                />
                <div className="showreel-card-overlay">
                  <div className="showreel-hover-meta">
                    <span className="showreel-hover-title">{card.coupleTitle}</span>
                    <span className="showreel-hover-tag">{card.category}</span>
                  </div>
                </div>
              </div>
              {showCaption && (
                <div className="showreel-card-caption">
                  <span className="showreel-card-name">{card.coupleTitle}</span>
                  <span className="showreel-card-tag">{card.category}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
