import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ZoomIn, Play, Calendar, Sparkles } from 'lucide-react';
import { couplesData } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { Lightbox } from '../components/Lightbox';
import { CinemaWalkthroughModal } from '../components/CinemaWalkthroughModal';
import { ResponsiveImage } from '../components/ResponsiveImage';
import { triggerHaptic } from '../utils/haptics';
import { galleryStorage } from '../utils/galleryStorage';
import { scrollToTop } from '../hooks/useSmoothScroll';
import { IlluminatedDropCap } from '../components/IlluminatedDropCap';
import './StoryGalleryPage.css';

interface StoryGalleryPageProps {
  story: WeddingStory;
  onBackToPortfolio: () => void;
  onSelectStory: (story: WeddingStory) => void;
  onPlayFilm?: (story: WeddingStory) => void;
  onCheckDate?: () => void;
}

export const StoryGalleryPage: React.FC<StoryGalleryPageProps> = ({
  story,
  onBackToPortfolio,
  onSelectStory,
  onPlayFilm,
  onCheckDate
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allStories, setAllStories] = useState<WeddingStory[]>(couplesData);

  useEffect(() => {
    let isMounted = true;
    galleryStorage.getUnifiedStories().then(stories => {
      if (isMounted && stories && stories.length > 0) {
        setAllStories(stories);
      }
    }).catch(() => { });
    return () => {
      isMounted = false;
    };
  }, []);

  // Find index of current story in allStories
  const currentIndex = allStories.findIndex(c => c.id === story.id);
  const validIndex = currentIndex !== -1 ? currentIndex : 0;
  const prevStory = allStories[(validIndex - 1 + allStories.length) % allStories.length];
  const nextStory = allStories[(validIndex + 1) % allStories.length];

  const handleOpenLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <main className="story-gallery-page" id="main-content">
      <header className="gallery-hero">
        <div className="container">
          <nav className="gallery-breadcrumb" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={onBackToPortfolio}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={14} /> Back to Portfolio
            </button>
            <span>/</span>
            <span style={{ color: 'var(--accent-gold)' }}>{story.title}</span>
          </nav>

          <h1 className="gallery-hero-title">{story.title}</h1>
          <p className="gallery-hero-tagline">&ldquo;{story.tagline}&rdquo;</p>

          <div className="gallery-hero-meta">
            <span>{story.category}</span>
            <span>•</span>
            <span>{story.imageCount} Curated Photographs</span>
            <span>•</span>
            <button
              type="button"
              className="cinema-walkthrough-btn"
              onClick={() => {
                triggerHaptic('medium');
                setWalkthroughOpen(true);
              }}
              title="Launch full-screen immersive slideshow"
            >
              <Sparkles size={14} className="sparkle-icon" /> Cinema Walkthrough
            </button>
            {story.videoUrl && onPlayFilm && (
              <>
                <span>•</span>
                <button
                  type="button"
                  className="play-film-btn"
                  onClick={() => onPlayFilm(story)}
                >
                  <Play size={14} fill="currentColor" /> Watch Film
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Editorial Chapter Monograph Introduction */}
      <section className="story-chapter-monograph" aria-label="Story chapter monograph">
        <div className="container-narrow">
          <div className="chapter-rubric">
            <span className="rubric-line" aria-hidden="true" />
            <span className="rubric-kicker">CHAPTER I · SACRED VOWS &amp; CHRONICLES</span>
            <span className="rubric-line" aria-hidden="true" />
          </div>
          <div className="chapter-prose-card">
            <IlluminatedDropCap letter={story.title.charAt(0)} size="lg" />
            <p className="chapter-prose-lead">
              <strong>{story.title}</strong> is an intimate testament to timeless devotion and generational continuity.
              {story.tagline ? ` Preserved under the ethos "${story.tagline}", ` : ' '}
              every photograph in this curated collection was captured through unhurried documentary discretion.
              From sacred rituals and emotional sindoor ceremonies to spontaneous twilight laughter, each master still is permanently archived for future generations.
            </p>
          </div>
        </div>
      </section>

      <section className="gallery-masonry-section">
        <div className="container-wide">
          <div className="gallery-masonry-grid" role="region" aria-label="Wedding Photographs Masonry">
            {story.images.map((img, idx) => (
              <figure
                key={img.id}
                className="gallery-item"
                onClick={() => {
                  triggerHaptic('light');
                  handleOpenLightbox(idx);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Enlarge photograph ${idx + 1} of ${story.images.length}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    triggerHaptic('light');
                    handleOpenLightbox(idx);
                  }
                }}
              >
                <ResponsiveImage
                  src={img.url}
                  alt={img.alt}
                  className="gallery-item-img"
                  priority={idx < 4}
                />
                <figcaption className="gallery-item-overlay" aria-hidden="true">
                  <ZoomIn size={28} />
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="gallery-footer-nav">
            <button
              type="button"
              className="gallery-nav-btn"
              onClick={() => {
                triggerHaptic('light');
                onSelectStory(prevStory);
                scrollToTop(true);
              }}
            >
              <ArrowLeft size={16} /> Previous: {prevStory.title}
            </button>

            {onCheckDate && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  triggerHaptic('medium');
                  onCheckDate();
                }}
              >
                <Calendar size={16} /> Check Your Date for Similar Story
              </button>
            )}

            <button
              type="button"
              className="gallery-nav-btn"
              onClick={() => {
                triggerHaptic('light');
                onSelectStory(nextStory);
                scrollToTop(true);
              }}
            >
              Next: {nextStory.title} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <Lightbox
        images={story.images}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentImageIndex}
      />

      {walkthroughOpen && (
        <CinemaWalkthroughModal
          story={story}
          isOpen={walkthroughOpen}
          onClose={() => setWalkthroughOpen(false)}
        />
      )}
    </main>
  );
};
