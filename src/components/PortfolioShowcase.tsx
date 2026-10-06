import React from 'react';
import { ArrowRight, Sparkles, Image as ImageIcon, MapPin } from 'lucide-react';
import { couplesData } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { handleImageError } from '../utils/imageFallback';
import { LetterFlipHeading } from './LetterFlipHeading';
import { PhotoShowreel } from './PhotoShowreel';
import './PortfolioShowcase.css';

interface PortfolioShowcaseProps {
  onSelectStory: (story: WeddingStory) => void;
  onViewAllPortfolio: () => void;
}

const CURATORIAL_TAGS = [
  'Editorial Monograph',
  'Ceremonial Splendor',
  'Spontaneous Intimacy',
  'Fine-Art Heirloom',
  'Anamorphic Motion',
  'Heritage Ritual'
];

const LOCATION_NAME_MAP: Record<string, string> = {
  'Kolkata': 'Calcutta Classical',
  'Rajasthan': 'Royal Heritage, Rajasthan',
  'Goa': 'Coastal Horizon, Goa',
  'Traditional Bengali Wedding': 'Traditional Atelier',
  'Grand Heritage Palace': 'Grand Heritage Palace',
  'Calcutta Classical': 'Calcutta Classical'
};

const cleanLocation = (loc?: string): string => {
  if (!loc) return 'Calcutta Classical';
  const mapped = LOCATION_NAME_MAP[loc] || loc;
  return mapped.replace(/\d+°\d+'?[NSEW]?\s*\d+°\d+'?[NSEW]?\s*[•·-]?\s*/gi, '').trim() || 'Calcutta Classical';
};

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  onSelectStory,
  onViewAllPortfolio
}) => {
  // Display top 6 curated stories for homepage editorial showcase
  const displayedCouples = couplesData.slice(0, 6);

  return (
    <section className="portfolio-showcase" id="portfolio" aria-labelledby="portfolio-heading">
      <div className="container-wide">
        <div className="portfolio-header">
          <div className="eyebrow">
            <Sparkles size={14} /> Curated Stories
          </div>
          <LetterFlipHeading
            prefix="Our Curated"
            text="WEDDING STORIES"
            as="h2"
            align="center"
            delay={150}
            className="portfolio-heading-flip"
          />
          <p className="portfolio-subtitle">
            Every celebration holds its own rhythm, tenderness, and grandeur. Explore a curated selection of authentic celebrations and timeless love stories.
          </p>
        </div>

        {/* Cinematic Dual-Ribbon Photo Showreel */}
        <PhotoShowreel
          onPhotoClick={onSelectStory}
          tiltAngle={-1.5}
        />

        {/* Interactive Editorial Magazine Grid */}
        <div className="editorial-magazine-grid">
          {displayedCouples.map((story, idx) => {
            const curatorialTag = CURATORIAL_TAGS[idx % CURATORIAL_TAGS.length];
            const displayLocation = cleanLocation(story.location);

            return (
              <article
                key={story.id}
                className={`editorial-card story-card editorial-card-${idx}`}
                data-cursor="story"
                data-cursor-label="READ STORY"
                onClick={() => onSelectStory(story)}
                tabIndex={0}
                role="button"
                aria-label={`Open gallery for ${story.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectStory(story);
                  }
                }}
              >
                <div className="editorial-card-media-wrap">
                  {/* Viewfinder corner pips */}
                  <span className="corner-pip corner-tl" aria-hidden="true" />
                  <span className="corner-pip corner-tr" aria-hidden="true" />
                  <span className="corner-pip corner-bl" aria-hidden="true" />
                  <span className="corner-pip corner-br" aria-hidden="true" />

                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="portfolio-card-img"
                    loading={idx < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={handleImageError}
                  />

                  <div className="portfolio-card-gradient">
                    <div className="portfolio-card-top-meta">
                      <span className="portfolio-card-cat">{story.category}</span>
                      <span className="portfolio-curatorial-tag">{curatorialTag}</span>
                    </div>

                    <h3 className="portfolio-card-name">{story.title}</h3>

                    {story.tagline && (
                      <p className="portfolio-card-tagline">{story.tagline}</p>
                    )}

                    <div className="portfolio-card-footer">
                      <div className="portfolio-card-meta-left">
                        <span>
                          <ImageIcon size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                          {story.imageCount} Master Frames
                        </span>
                        <span className="portfolio-card-loc" title={displayLocation}>
                          <MapPin size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                          {displayLocation}
                        </span>
                      </div>
                      <span className="portfolio-card-link">
                        Inspect Story <ArrowRight size={13} className="portfolio-card-arrow" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="portfolio-actions">
          <button
            type="button"
            className="btn btn-outline"
            data-magnetic
            onClick={onViewAllPortfolio}
          >
            Explore Complete Portfolio Archive &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};
