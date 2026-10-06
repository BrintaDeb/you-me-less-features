import React, { useEffect, useRef, useState } from 'react';
import { Play, ArrowRight, Sparkles, Film, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { featuredStories } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { businessInfo } from '../data/businessData';
import { triggerHaptic } from '../utils/haptics';
import { handleImageError } from '../utils/imageFallback';
import { smoothScrollTo } from '../hooks/useSmoothScroll';
import { CursorSparkles } from './CursorSparkles';
import './CameraPathExperience.css';

interface CameraPathExperienceProps {
  onSelectStory: (story: WeddingStory) => void;
  onPlayFilm: (story: WeddingStory) => void;
}

interface HeroSlide {
  image: string;
  alt: string;
  couple: string;
  location: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    image: 'https://static.wixstatic.com/media/62230b_019e6537a70840b5b7ed80f4e77bad72~mv2.jpg',
    alt: 'Paraj & Mrinmoyee romantic wedding celebration',
    couple: 'Paraj & Mrinmoyee',
    location: 'Calcutta Classical'
  },
  {
    image: 'https://static.wixstatic.com/media/62230b_669876f3c423429a86a5811c0658ecb1~mv2.jpg',
    alt: 'Jasraj & Urmi royal evening pheras celebration',
    couple: 'Jasraj & Urmi',
    location: 'Rajasthan Royal Heritage'
  },
  {
    image: 'https://static.wixstatic.com/media/62230b_7f2c09302c3b404eacc7c85a95aff72e~mv2.jpg',
    alt: 'Avik & Binita joyful day ceremony',
    couple: 'Avik & Binita',
    location: 'Kolkata Celebration'
  },
  {
    image: 'https://static.wixstatic.com/media/62230b_ea8e74edd8f04eb7920b4d2b3b425611~mv2.jpg',
    alt: 'Subhadeep & Ankita sacred rituals and vows',
    couple: 'Subhadeep & Ankita',
    location: 'Traditional Bengali Wedding'
  },
  {
    image: 'https://static.wixstatic.com/media/62230b_85222df8c6dc4d72931d5f6693fbbafe~mv2.jpg',
    alt: 'Hira & Suchi timeless wedding reception',
    couple: 'Hira & Suchi',
    location: 'Grand Heritage Palace'
  }
];

const MORPH_WORDS = ['WEDDING', 'MOMENTS', 'STORIES', 'FOREVER', 'MEMORIES'];

export const CameraPathExperience: React.FC<CameraPathExperienceProps> = ({
  onSelectStory,
  onPlayFilm
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [morphWordIdx, setMorphWordIdx] = useState(0);
  const [morphTransitioning, setMorphTransitioning] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // ── Authentic photography hero slides ──
  const heroSlides: HeroSlide[] = HERO_SLIDES;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroRevealed(true);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // ── Liquid text morph: cycle through MORPH_WORDS every 2.5s ──
  useEffect(() => {
    const interval = setInterval(() => {
      setMorphTransitioning(true);
      setTimeout(() => {
        setMorphWordIdx(i => (i + 1) % MORPH_WORDS.length);
        setMorphTransitioning(false);
      }, 420); // half of CSS transition duration
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Preload and pre-decode all hero slide images to ensure seamless, flicker-free crossfades
  useEffect(() => {
    heroSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      if (img.decode) {
        img.decode().catch(() => {});
      }
    });
  }, [heroSlides]);

  const goToSlide = (nextIndex: number) => {
    setCurrentSlide((prev) => {
      if (prev === nextIndex) return prev;
      setPrevSlide(prev);
      return nextIndex;
    });
  };

  // Auto-advance hero background images in intervals of 5 seconds
  useEffect(() => {
    if (!heroSlides.length) return;
    const timer = setInterval(() => {
      goToSlide((currentSlide + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, heroSlides.length]);

  // Clean up prevSlide after 1.8s crossfade has fully completed
  useEffect(() => {
    if (prevSlide === null) return;
    const timer = setTimeout(() => {
      setPrevSlide(null);
    }, 1900);
    return () => clearTimeout(timer);
  }, [prevSlide]);

  useEffect(() => {
    let animFrame: number;
    let targetProgress = 0;
    let currentProgress = 0;

    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const trackHeight = trackRef.current.offsetHeight - window.innerHeight;
      if (trackHeight <= 0) return;

      const raw = -rect.top / trackHeight;
      targetProgress = Math.max(0, Math.min(1, raw));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      // Normalized mouse coordinates from -1 to 1 for interactive 3D parallax
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    const updateLoop = () => {
      // Silky lerp interpolation for 60fps cinematic fluidity (slightly snappier on mobile thumb scroll)
      currentProgress += (targetProgress - currentProgress) * (isMobile ? 0.18 : 0.1);
      setScrollProgress(currentProgress);

      // Determine active story index based on progress (0 to total-1)
      const total = featuredStories.length;
      const idx = Math.min(total - 1, Math.max(0, Math.round(currentProgress * (total - 1))));
      setActiveStoryIdx(idx);

      animFrame = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animFrame = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, [isMobile]);

  const jumpToStory = (index: number) => {
    if (!trackRef.current) return;
    triggerHaptic('selection');
    const trackTop = trackRef.current.getBoundingClientRect().top + window.scrollY;
    const trackHeight = trackRef.current.offsetHeight - window.innerHeight;
    const targetScroll = trackTop + (index / (featuredStories.length - 1)) * trackHeight;

    smoothScrollTo(targetScroll, { duration: 0.95 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal swipe threshold > 40px and dominant over vertical
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0 && activeStoryIdx < featuredStories.length - 1) {
        jumpToStory(activeStoryIdx + 1);
      } else if (deltaX > 0 && activeStoryIdx > 0) {
        jumpToStory(activeStoryIdx - 1);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const totalStories = featuredStories.length;

  return (
    <div className="camera-path-container" id="stories">
      {/* Scene 1 — Cinematic Opening */}
      <section className="hero-scene" aria-label="Hero Wedding Showcase" ref={heroRef as React.RefObject<HTMLElement>}>
        {/* Golden cursor sparkle trail — scoped to hero only */}
        <CursorSparkles containerRef={heroRef as React.RefObject<HTMLElement>} />
        <div className="hero-background-wrapper" aria-hidden="true">
          {heroSlides.map((slide, idx) => {
            const isActive = currentSlide === idx;
            const isPrev = prevSlide === idx;
            return (
              <div
                key={slide.image}
                className={`hero-slide-layer ${isActive ? 'active' : ''} ${isPrev ? 'prev' : ''}`}
                style={{
                  zIndex: isActive ? 3 : isPrev ? 2 : 1
                }}
              >
                <div
                  className="hero-slide-ambient"
                  style={{ backgroundImage: `url(${slide.image})` }}
                  aria-hidden="true"
                />
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="hero-slide-img"
                  loading="eager"
                  decoding="async"
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  onError={handleImageError}
                />
              </div>
            );
          })}
          <div className="hero-overlay-gradient" />
        </div>

        <div className={`hero-content ${heroRevealed ? 'text-revealed' : ''}`}>
          <div className="hero-logo-badge">
            <img
              src="/assets/brand/logo_white.png"
              alt={businessInfo.name}
              className="hero-logo-img logo-theme-dark"
              width="260"
              height="80"
            />
            <img
              src="/assets/brand/logo_black.png"
              alt={businessInfo.name}
              className="hero-logo-img logo-theme-light"
              width="260"
              height="80"
            />
          </div>

          <div className="eyebrow">
            <Sparkles size={14} /> Documentary Photography &amp; Cinema
          </div>

          <h1 className="hero-heading">
            <span
              className={`hero-morph-word ${morphTransitioning ? 'morph-out' : 'morph-in'}`}
              aria-live="polite"
            >
              {MORPH_WORDS[morphWordIdx]}
            </span>
            {' '}Stories, Honestly Told
          </h1>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              data-magnetic
              onClick={() => {
                smoothScrollTo('camera-journey');
              }}
            >
              Explore Our Stories <ArrowRight size={16} />
            </button>
            <a
              href="#contact"
              className="btn btn-outline"
              data-magnetic
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo('contact');
              }}
            >
              Check Your Date
            </a>
          </div>

          {/* Discreet Hero Carousel Indicators (5-Second Interval Progress) */}
          <div className="hero-carousel-controls" role="tablist" aria-label="Hero background slides switcher">
            <div className="hero-carousel-dots">
              {HERO_SLIDES.map((slide, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={slide.image}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Switch to slide ${idx + 1}: ${slide.couple}`}
                    className={`hero-carousel-dot ${isActive ? 'active' : ''}`}
                    onClick={() => goToSlide(idx)}
                  >
                    <span className="dot-progress" />
                  </button>
                );
              })}
            </div>
            <div className="hero-slide-badge" aria-live="polite">
              <span className="slide-badge-dot" />
              <span className="slide-badge-name">{HERO_SLIDES[currentSlide].couple}</span>
              <span className="slide-badge-sep">•</span>
              <span className="slide-badge-loc">{HERO_SLIDES[currentSlide].location}</span>
            </div>
          </div>
        </div>

        <div className="scroll-indicator" aria-hidden="true">
          <span>Scroll into the Storyboard</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* Scene 2 — 3D Camera-Path Space (Selected Stories Multi-Plane Exhibition) */}
      <section
        ref={trackRef}
        id="camera-journey"
        className="camera-track-section"
        aria-label="3D Cinematic Storyboard Showcase"
      >
        <div
          className="camera-viewport"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Dynamic Ambient Glow Backdrop that shifts as stories advance */}
          <div
            className="camera-ambient-glow"
            style={{
              transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`
            }}
          />

          {/* Film Grain & Cinematic Atmosphere Overlay */}
          <div className="camera-film-atmosphere" aria-hidden="true" />

          {/* Top HUD Status & Chapter Header */}
          <div className="camera-hud-header" aria-hidden="true">
            <div className="hud-badge">
              <Film size={13} className="hud-badge-icon" />
              <span>CHAPTER II // SELECTED LOVE STORIES</span>
            </div>
            <div className="hud-scene-counter">
              <span>STORY // <strong>{featuredStories[activeStoryIdx]?.title}</strong></span>
            </div>
          </div>

          {/* Scene 2 Multi-Plane Parallax: Foreground Floating Golden Bokeh */}
          <div
            className="camera-foreground-bokeh"
            style={{
              transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 24 - scrollProgress * 120}px, 0)`
            }}
            aria-hidden="true"
          >
            <span className="journey-bokeh-orb orb-a" />
            <span className="journey-bokeh-orb orb-b" />
            <span className="journey-bokeh-orb orb-c" />
            <span className="journey-bokeh-orb orb-d" />
          </div>

          {/* 3D World Stage */}
          <div className="camera-world">
            {featuredStories.map((story, i) => {
              // storyOffset: 0 when this story is active center, < 0 when coming from distance, > 0 when passed
              const storyOffset = scrollProgress * (totalStories - 1) - i;

              // Only render if reasonably close to viewport (within -2 to +2 range)
              const isVisible = Math.abs(storyOffset) < (isMobile ? 1.5 : 1.8);
              if (!isVisible) return null;

              // Smooth 3D trajectory calculations
              // Main Card: Center swoop with curved X-drift and Z-depth
              const xSpread = isMobile ? Math.min(window.innerWidth * 0.9, 390) : 780;
              const mainZ = isMobile
                ? -Math.abs(storyOffset) * 440
                : -Math.abs(storyOffset) * 750 + (storyOffset > 0 ? storyOffset * 350 : 0);
              const mainX = storyOffset * -xSpread + (isMobile ? 0 : mousePos.x * 22);
              const mainY = isMobile
                ? Math.sin(storyOffset * Math.PI) * -16
                : Math.sin(storyOffset * Math.PI) * -45 + mousePos.y * 16;
              const mainRotY = isMobile
                ? storyOffset * 10
                : storyOffset * 24 + mousePos.x * 6;
              const mainRotX = isMobile
                ? -storyOffset * 3
                : -storyOffset * 6 - mousePos.y * 5;
              const mainScale = isMobile
                ? Math.max(0.85, 1 - Math.abs(storyOffset) * 0.15)
                : Math.max(0.72, 1 - Math.abs(storyOffset) * 0.28);
              const mainOpacity = isMobile
                ? Math.max(0, 1 - Math.pow(Math.abs(storyOffset), 1.8))
                : Math.max(0, 1 - Math.pow(Math.abs(storyOffset), 1.6));
              const mainBlur = isMobile
                ? Math.min(4, Math.abs(storyOffset) * 3)
                : Math.min(10, Math.abs(storyOffset) * 7);

              // Companion Photo 1 (Left floating polaroid): Moves with dynamic parallax
              const comp1X = -430 + storyOffset * -620 + mousePos.x * 12;
              const comp1Y = -25 + storyOffset * 80 + mousePos.y * 10;
              const comp1Z = 120 - Math.abs(storyOffset) * 900;
              const comp1RotY = 14 + storyOffset * 18;
              const comp1RotZ = -4 + storyOffset * 8;
              const comp1Opacity = Math.max(0, 1 - Math.abs(storyOffset) * 1.3);

              // Companion Photo 2 (Right floating frame): Offsets opposite side
              const comp2X = 440 + storyOffset * -650 + mousePos.x * 14;
              const comp2Y = 60 - storyOffset * 70 + mousePos.y * 12;
              const comp2Z = -100 - Math.abs(storyOffset) * 950;
              const comp2RotY = -16 + storyOffset * 15;
              const comp2RotZ = 6 - storyOffset * 6;
              const comp2Opacity = Math.max(0, 1 - Math.abs(storyOffset) * 1.4);

              // Watermark Background Numeral: Deep in the Z-plane
              const bgNumZ = -400 - Math.abs(storyOffset) * 600;
              const bgNumX = storyOffset * -400;

              // Extract authentic secondary images for companion frames
              const companionImg1 = story.images[1]?.url || story.heroImage;
              const companionImg2 = story.images[2]?.url || story.coverImage;

              return (
                <div
                  key={story.id}
                  className="storyboard-cluster"
                  style={{
                    opacity: mainOpacity,
                    pointerEvents: Math.abs(storyOffset) < 0.45 ? 'auto' : 'none'
                  }}
                  aria-hidden={Math.abs(storyOffset) >= 0.5}
                >
                  {/* Floating Giant Chapter Watermark in Background */}
                  <div
                    className="storyboard-bg-watermark"
                    style={{
                      transform: `translate3d(calc(-50% + ${bgNumX}px), -50%, ${bgNumZ}px)`,
                      opacity: Math.max(0, 0.08 - Math.abs(storyOffset) * 0.06)
                    }}
                  >
                    0{i + 1}
                  </div>

                  {!isMobile && (
                    <>
                      {/* Left Companion Polaroid Frame */}
                      <div
                        className="companion-print companion-left"
                        data-cursor="expand"
                        data-cursor-label="EXPAND"
                        style={{
                          transform: `translate3d(calc(-50% + ${comp1X}px), calc(-50% + ${comp1Y}px), ${comp1Z}px) rotateY(${comp1RotY}deg) rotateZ(${comp1RotZ}deg)`,
                          opacity: comp1Opacity,
                          filter: `blur(${mainBlur * 0.7}px)`
                        }}
                        onClick={() => onSelectStory(story)}
                      >
                        <div className="polaroid-inner">
                          <span className="polaroid-tape" aria-hidden="true" />
                          <img
                            src={companionImg1}
                            alt={`${story.title} candid detail`}
                            className="polaroid-photo"
                            loading="lazy"
                            onError={handleImageError}
                          />
                          <span className="polaroid-caption">Ceremony Moments</span>
                        </div>
                      </div>

                      {/* Right Companion Fine-Art Frame */}
                      <div
                        className="companion-print companion-right"
                        data-cursor="expand"
                        data-cursor-label="EXPAND"
                        style={{
                          transform: `translate3d(calc(-50% + ${comp2X}px), calc(-50% + ${comp2Y}px), ${comp2Z}px) rotateY(${comp2RotY}deg) rotateZ(${comp2RotZ}deg)`,
                          opacity: comp2Opacity,
                          filter: `blur(${mainBlur * 0.7}px)`
                        }}
                        onClick={() => onSelectStory(story)}
                      >
                        <div className="fineart-inner">
                          <img
                            src={companionImg2}
                            alt={`${story.title} portrait frame`}
                            className="fineart-photo"
                            loading="lazy"
                            onError={handleImageError}
                          />
                          <div className="fineart-tag">
                            <Sparkles size={10} />
                            <span>Handcrafted</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Centerpiece Hero Storyboard Card */}
                  <div
                    className="story-main-card specular-card"
                    style={{
                      transform: `translate3d(calc(-50% + ${mainX}px), calc(-50% + ${mainY}px), ${mainZ}px) rotateY(${mainRotY}deg) rotateX(${mainRotX}deg) scale(${mainScale})`,
                      filter: `blur(${mainBlur}px)`
                    }}
                    tabIndex={Math.abs(storyOffset) < 0.45 ? 0 : -1}
                    role="region"
                    aria-label={`${story.title} wedding chronicle`}
                  >
                    {/* Viewfinder corner pips */}
                    <span className="corner-pip corner-tl" aria-hidden="true" />
                    <span className="corner-pip corner-tr" aria-hidden="true" />
                    <span className="corner-pip corner-bl" aria-hidden="true" />
                    <span className="corner-pip corner-br" aria-hidden="true" />

                    {/* Glowing Edge Light Border */}
                    <div className="card-ambient-glow" />

                    <div className="card-media-wrapper">
                      <img
                        src={story.videoPoster || story.coverImage}
                        alt={story.title}
                        className="card-media-img"
                        loading={i < 2 ? 'eager' : 'lazy'}
                        onError={handleImageError}
                      />
                      <div className="card-vignette-overlay" />
                    </div>

                    {/* Top Meta Bar */}
                    <div className="card-top-bar">
                      <span className="card-category-pill">
                        {story.category}
                      </span>
                    </div>

                    {/* Bottom Editorial Content */}
                    <div className="card-editorial-content">
                      <div className="card-eyebrow">
                        <span>Chronicle 0{i + 1}</span>
                        <span className="card-eyebrow-bullet">•</span>
                        <span>{story.imageCount} Curated Photographs</span>
                      </div>

                      <h2 className="card-couple-title">
                        {story.title}
                      </h2>

                      <p className="card-story-tagline">
                        {story.tagline}
                      </p>

                      {/* Interactive Action Bar */}
                      <div className="card-actions-bar">
                        <button
                          type="button"
                          className="btn-story-explore"
                          data-magnetic
                          onClick={() => onSelectStory(story)}
                          aria-label={`Explore full story gallery of ${story.title}`}
                        >
                          <ImageIcon size={15} />
                          <span>Explore Story Gallery</span>
                          <ChevronRight size={14} />
                        </button>

                        {story.videoUrl && (
                          <button
                            type="button"
                            className="btn-story-play-film"
                            data-cursor="play"
                            data-cursor-label="PLAY FILM"
                            data-magnetic
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayFilm(story);
                            }}
                            aria-label={`Watch ${story.title} cinematic wedding film`}
                          >
                            <span className="play-icon-ring">
                              <Play size={13} fill="currentColor" />
                            </span>
                            <span>Watch Film</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Interactive Storyboard Timeline Navigator */}
          <nav
            className="storyboard-timeline-nav"
            aria-label="Storyboard Story Navigation"
          >
            <div className="timeline-items-wrapper">
              {featuredStories.map((story, idx) => {
                const isActive = activeStoryIdx === idx;
                return (
                  <button
                    key={story.id}
                    type="button"
                    className={`timeline-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => jumpToStory(idx)}
                    aria-label={`Jump to chronicle 0${idx + 1}: ${story.title}`}
                  >
                    <span className="timeline-nav-index">0{idx + 1}</span>
                    <span className="timeline-nav-name">{story.title.replace('&amp;', '&')}</span>
                    <span className="timeline-nav-pill" />
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </section>
    </div>
  );
};

