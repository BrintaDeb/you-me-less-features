import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Volume2,
  ArrowRight,
  Film,
  Bookmark,
  Sun
} from 'lucide-react';
import { couplesData } from '../data/couplesData';
import type { WeddingStory } from '../data/couplesData';
import { handleImageError } from '../utils/imageFallback';
import './WeddingFilmsSection.css';

interface WeddingFilmsSectionProps {
  onPlayFilm: (story: WeddingStory) => void;
}

export interface FilmChapter {
  label: string;
  time: string;
  seconds: number;
}

export interface FilmStoryItem {
  id: string;
  story: WeddingStory;
  title: string;
  category: string;
  genre: 'wedding' | 'pre-wedding';
  location: string;
  duration: string;
  soundscape: string;
  videoUrl: string;
  posterUrl: string;
  stills: string[];
  tagline: string;
  chapters: FilmChapter[];
}

export const WeddingFilmsSection: React.FC<WeddingFilmsSectionProps> = ({ onPlayFilm }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'wedding' | 'pre-wedding'>('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Feature 1: Silent Looping Micro-Trailer on Hover
  const [activeTrailerId, setActiveTrailerId] = useState<string | null>(null);
  const trailerDebounceRef = useRef<number | null>(null);

  // Feature 4: Interactive Soundscape Audio Preview
  const [activeAudioPreviewId, setActiveAudioPreviewId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Feature: Cinema Dim / Theatre Lights Switch
  const [isTheatreMode, setIsTheatreMode] = useState(false);

  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const autoSlideTimerRef = useRef<number | null>(null);

  // Curated master cinematic films with authentic chapters and soundscapes
  const filmCatalog: FilmStoryItem[] = useMemo(() => {
    const rawFilms = [
      {
        slug: 'jasraj-urmi',
        title: 'Jasraj & Urmi',
        category: 'Destination Wedding',
        genre: 'wedding' as const,
        location: 'Jaipur, Rajasthan',
        duration: '04:22',
        soundscape: 'Acoustic Sitar & Ambient Strings',
        videoUrl: '/assets/videos/urmi_jasraj.mp4',
        posterUrl: '/assets/posters/urmi_jasraj.jpg',
        tagline: 'An intimate symphony of golden light, laughter, and royal heritage',
        chapters: [
          { label: 'Arrival & Grandeur', time: '00:15', seconds: 15 },
          { label: 'The Royal Vows', time: '01:45', seconds: 105 },
          { label: 'Euphoria Finale', time: '03:10', seconds: 190 }
        ]
      },
      {
        slug: 'avik-binita',
        title: 'Avik & Binita',
        category: 'Bengali Wedding',
        genre: 'wedding' as const,
        location: 'Calcutta Classical',
        duration: '05:14',
        soundscape: 'Sacred Shehnai & Classical Score',
        videoUrl: '/assets/videos/avik_binita.mp4',
        posterUrl: '/assets/posters/avik_binita.jpg',
        tagline: 'Vibrant heritage bathed in deep vermillion, song, and ancestral rituals',
        chapters: [
          { label: 'Sindoor Daan', time: '00:20', seconds: 20 },
          { label: 'Ancestral Songs', time: '01:50', seconds: 110 },
          { label: 'Evening Rituals', time: '03:40', seconds: 220 }
        ]
      },
      {
        slug: 'paraj-mrinmoyee',
        title: 'Paraj & Mrinmoyee',
        category: 'Traditional Bengali',
        genre: 'wedding' as const,
        location: 'Agartala, Tripura',
        duration: '03:48',
        soundscape: 'Vedic Chants & Cello Resonance',
        videoUrl: '/assets/videos/paraj_mrinmoyee.mp4',
        posterUrl: '/assets/posters/paraj_mrinmoyee.jpg',
        tagline: 'Sacred rituals framed in candlelight, sacred mantras, and solemn vows',
        chapters: [
          { label: 'Vedic Chants', time: '00:30', seconds: 30 },
          { label: 'Candlelight Vows', time: '02:00', seconds: 120 },
          { label: 'Solemn Union', time: '03:15', seconds: 195 }
        ]
      },
      {
        slug: 'subhadeep-ankita',
        title: 'Subhadeep & Ankita',
        category: 'Traditional Heritage',
        genre: 'wedding' as const,
        location: 'Heritage Atelier, Bengal',
        duration: '04:45',
        soundscape: 'Soulful Rabindra Sangeet & Violin',
        videoUrl: '/assets/videos/ankita_subhadeep.mp4',
        posterUrl: '/assets/posters/ankita_subhadeep.jpg',
        tagline: 'A poetic visual sonnet of love, tender laughter, and sacred rituals',
        chapters: [
          { label: 'Shehnai Prelude', time: '00:25', seconds: 25 },
          { label: 'Sacred Mala', time: '02:10', seconds: 130 },
          { label: 'Tender Laughter', time: '03:50', seconds: 230 }
        ]
      },
      {
        slug: 'hira-suchi',
        title: 'Hira & Suchi',
        category: 'Pre-Wedding Cinema',
        genre: 'pre-wedding' as const,
        location: 'Mountain Twilight Horizon',
        duration: '03:15',
        soundscape: 'Ambient Acoustic & Twilight Piano',
        videoUrl: '/assets/videos/suchi_hira.mp4',
        posterUrl: '/assets/posters/suchi_hira.jpg',
        tagline: 'Gentle whispers among highland mist, pine breeze, and golden hour serenity',
        chapters: [
          { label: 'Pine Mist Horizon', time: '00:15', seconds: 15 },
          { label: 'Golden Hour', time: '01:30', seconds: 90 },
          { label: 'Highland Serenity', time: '02:40', seconds: 160 }
        ]
      },
      {
        slug: 'arnab-shirsha',
        title: 'Arnab & Shirsha',
        category: 'Pre-Wedding Atelier',
        genre: 'pre-wedding' as const,
        location: 'Colonial Gardens, Kolkata',
        duration: '03:56',
        soundscape: 'Cinematic Modern Symphony',
        videoUrl: '/assets/videos/portfolio_bg.mp4',
        posterUrl: '/assets/posters/suchi_hira.jpg',
        tagline: 'Spontaneous joy, candid glances, and unhurried contemporary romance',
        chapters: [
          { label: 'Colonial Courtyard', time: '00:20', seconds: 20 },
          { label: 'Spontaneous Joy', time: '01:40', seconds: 100 },
          { label: 'Twilight Promenade', time: '02:50', seconds: 170 }
        ]
      }
    ];

    return rawFilms.map((item, idx) => {
      const matched = couplesData.find(c => c.slug === item.slug) || couplesData[idx % couplesData.length];
      const stills = (matched.images && matched.images.length >= 3)
        ? matched.images.slice(0, 3).map(img => img.url)
        : [matched.coverImage, matched.heroImage || matched.coverImage, matched.coverImage];

      return {
        id: `film-${item.slug}`,
        story: {
          ...matched,
          videoUrl: item.videoUrl,
          videoPoster: item.posterUrl,
          title: item.title
        },
        title: item.title,
        category: item.category,
        genre: item.genre,
        location: item.location,
        duration: item.duration,
        soundscape: item.soundscape,
        videoUrl: item.videoUrl,
        posterUrl: item.posterUrl,
        stills,
        tagline: item.tagline,
        chapters: item.chapters
      };
    });
  }, []);

  const filteredFilms = useMemo(() => {
    if (activeFilter === 'all') return filmCatalog;
    return filmCatalog.filter(f => f.genre === activeFilter);
  }, [activeFilter, filmCatalog]);

  const updateScrollStatus = useCallback(() => {
    const el = sliderTrackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 25);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 25);

    const firstCard = el.querySelector<HTMLElement>('.film-card-interactive');
    const step = firstCard ? firstCard.offsetWidth + 24 : 480;
    const idx = Math.round(el.scrollLeft / step);
    setCurrentSlideIndex(Math.max(0, Math.min(idx, filteredFilms.length - 1)));
  }, [filteredFilms.length]);

  useEffect(() => {
    updateScrollStatus();
    const el = sliderTrackRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollStatus, { passive: true });
      return () => el.removeEventListener('scroll', updateScrollStatus);
    }
  }, [filteredFilms, updateScrollStatus]);

  const slidePrev = () => {
    const el = sliderTrackRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('.film-card-interactive');
    const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : 480;
    el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  const slideNext = () => {
    const el = sliderTrackRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('.film-card-interactive');
    const scrollAmount = firstCard ? firstCard.offsetWidth + 24 : 480;
    const maxScroll = el.scrollWidth - el.clientWidth;

    // Loop back smoothly to beginning if at the end
    if (el.scrollLeft >= maxScroll - 30) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Reset scroll to start whenever activeFilter changes
  useEffect(() => {
    if (sliderTrackRef.current) {
      sliderTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeFilter]);

  // Auto-slide effect: continuously auto-advances, STOPS when cursor is hovered
  useEffect(() => {
    if (isHovered || filteredFilms.length <= 1) {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
      return;
    }

    autoSlideTimerRef.current = window.setInterval(() => {
      slideNext();
    }, 3600);

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
    };
  }, [isHovered, filteredFilms.length]);

  // Feature 1: Debounced Card Mouse Enter for Silent Looping Micro-Trailer
  const handleCardMouseEnter = (filmId: string) => {
    setIsHovered(true);
    if (trailerDebounceRef.current) {
      clearTimeout(trailerDebounceRef.current);
    }
    trailerDebounceRef.current = window.setTimeout(() => {
      setActiveTrailerId(filmId);
    }, 280);
  };

  const handleCardMouseLeave = () => {
    if (trailerDebounceRef.current) {
      clearTimeout(trailerDebounceRef.current);
      trailerDebounceRef.current = null;
    }
    setActiveTrailerId(null);
  };

  // Feature 4: Toggle Soundscape Audio Preview
  const handleToggleAudioPreview = (e: React.MouseEvent, film: FilmStoryItem) => {
    e.stopPropagation();

    if (activeAudioPreviewId === film.id) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current.currentTime = 0;
      }
      setActiveAudioPreviewId(null);
      return;
    }

    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio();
      audioPreviewRef.current.volume = 0.6;
      audioPreviewRef.current.onended = () => {
        setActiveAudioPreviewId(null);
      };
    }

    audioPreviewRef.current.src = film.videoUrl;
    audioPreviewRef.current.currentTime = 12; // Seek to ambient musical passage
    audioPreviewRef.current.play().then(() => {
      setActiveAudioPreviewId(film.id);
    }).catch(() => {
      setActiveAudioPreviewId(null);
    });
  };

  // Cleanup audio preview on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    };
  }, []);

  // Launch full film modal with optional chapter seek
  const handlePlayFilm = (story: WeddingStory, initialTime?: number) => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setActiveAudioPreviewId(null);
    }
    onPlayFilm({ ...story, initialTime });
  };

  // Theatre Mode: Sync body class and listen for Escape key
  useEffect(() => {
    if (isTheatreMode) {
      document.body.classList.add('theatre-dim-active');
    } else {
      document.body.classList.remove('theatre-dim-active');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTheatreMode(false);
      }
    };

    if (isTheatreMode) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.classList.remove('theatre-dim-active');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTheatreMode]);

  return (
    <>
      {/* Feature: Fullscreen Theatre Lights Dimmer Backdrop */}
      {isTheatreMode && (
        <div
          className="films-theatre-dim-overlay"
          onClick={() => setIsTheatreMode(false)}
          role="button"
          tabIndex={0}
          aria-label="Exit cinema theatre mode"
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter') setIsTheatreMode(false);
          }}
        >
          <div className="theatre-spotlight-core" />
          <div className="theatre-active-banner">
            <Sparkles size={13} className="gold-icon" />
            <span>THEATRE MODE ACTIVE • Lights Dimmed (95%)</span>
            <button
              type="button"
              className="theatre-exit-pill"
              onClick={() => setIsTheatreMode(false)}
            >
              Restore Lights [ESC]
            </button>
          </div>
        </div>
      )}

      <section
        className={`films-section ${isTheatreMode ? 'theatre-mode-engaged' : ''}`}
        id="films"
        aria-labelledby="films-heading"
      >
        <div className="container-wide">
          {/* Expanded Editorial Cinema Header */}
          <div className="films-header-expanded">
            <div className="films-header-text">
              <div className="eyebrow">
                <Sparkles size={14} /> Motion &amp; Emotion • Cinematic Atelier
              </div>
              <h2 id="films-heading" className="films-title">
                Love in Motion
              </h2>
              <p className="films-subtitle">
                Documentary wedding films and poetic pre-wedding chronicles crafted on cinema anamorphic primes.
                Every unrepeatable vow, silent tear, and euphoric celebration preserved with unhurried grace.
              </p>
            </div>

            {/* Navigation Controls & Slide Progress */}
            <div className="films-nav-panel">
              <div className="films-genre-filters" role="tablist" aria-label="Filter wedding films">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'all'}
                  className={`film-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All Cinema ({filmCatalog.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'wedding'}
                  className={`film-filter-btn ${activeFilter === 'wedding' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('wedding')}
                >
                  Weddings ({filmCatalog.filter(f => f.genre === 'wedding').length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'pre-wedding'}
                  className={`film-filter-btn ${activeFilter === 'pre-wedding' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('pre-wedding')}
                >
                  Pre-Wedding ({filmCatalog.filter(f => f.genre === 'pre-wedding').length})
                </button>
              </div>

              <div className="films-arrows-wrap">
                {/* Theatre Mode / Cinema Dim Lights Switch */}
                <button
                  type="button"
                  className={`theatre-mode-toggle-btn ${isTheatreMode ? 'active' : ''}`}
                  onClick={() => setIsTheatreMode((prev) => !prev)}
                  title={isTheatreMode ? 'Restore Room Lights (Esc)' : 'Dim website lights to 95% for theatrical spotlight'}
                  aria-pressed={isTheatreMode}
                >
                  {isTheatreMode ? <Sun size={13} className="theatre-btn-icon" /> : <Film size={13} className="theatre-btn-icon" />}
                  <span className="theatre-btn-text">{isTheatreMode ? 'Lights On' : 'Cinema Dim'}</span>
                  <span className="theatre-status-glow" />
                </button>

                {/* Auto-Slide Status Pill */}
                <div
                  className="films-auto-pill"
                  title={isHovered ? 'Auto-slide paused (cursor hovering)' : 'Auto-slide active'}
                  aria-live="polite"
                >
                  <span className={`auto-pill-dot ${isHovered ? 'is-paused' : 'is-playing'}`} />
                  <span className="auto-pill-text">{isHovered ? 'PAUSED' : 'AUTO'}</span>
                </div>

                <span className="films-slide-counter">
                  <strong>{String(currentSlideIndex + 1).padStart(2, '0')}</strong>
                  <span className="counter-sep">/</span>
                  {String(filteredFilms.length).padStart(2, '0')}
                </span>

                <button
                  type="button"
                  className="film-nav-arrow"
                  onClick={slidePrev}
                  disabled={!canScrollLeft}
                  aria-label="Previous wedding film"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  className="film-nav-arrow"
                  onClick={slideNext}
                  disabled={!canScrollRight && currentSlideIndex >= filteredFilms.length - 1}
                  aria-label="Next wedding film"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Sliding Films Reel Track with Hover Slide Effects & Cursor Stop */}
          <div
            className="films-slider-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsHovered(false);
              }
            }}
            onPointerOver={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
            onFocusCapture={() => setIsHovered(true)}
            onBlurCapture={() => setIsHovered(false)}
          >
            <div
              className="films-slider-track"
              ref={sliderTrackRef}
              role="region"
              aria-label="Interactive wedding films reel"
            >
              {filteredFilms.map((film, idx) => (
                <article
                  key={film.id}
                  className={`film-card-interactive ${activeTrailerId === film.id ? 'is-previewing-trailer' : ''}`}
                  data-cursor="play"
                  data-cursor-label="PLAY FILM"
                  onMouseEnter={() => handleCardMouseEnter(film.id)}
                  onMouseLeave={handleCardMouseLeave}
                  onPointerEnter={() => handleCardMouseEnter(film.id)}
                  onPointerLeave={handleCardMouseLeave}
                  onClick={() => handlePlayFilm(film.story)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Play cinema documentary for ${film.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePlayFilm(film.story);
                    }
                  }}
                >
                  {/* Viewfinder corner pips */}
                  <span className="film-pip corner-tl" aria-hidden="true" />
                  <span className="film-pip corner-tr" aria-hidden="true" />
                  <span className="film-pip corner-bl" aria-hidden="true" />
                  <span className="film-pip corner-br" aria-hidden="true" />

                  {/* Media Wrapper with Camera-Pan Slide Effect & Feature 1 Micro-Trailer */}
                  <div className="film-media-wrapper">
                    <img
                      src={film.posterUrl}
                      alt={`${film.title} cinema poster`}
                      className={`film-poster-slide-img ${activeTrailerId === film.id ? 'trailer-active' : ''}`}
                      loading={idx < 2 ? 'eager' : 'lazy'}
                      onError={handleImageError}
                    />

                    {/* Feature 1: Silent Looping Micro-Trailer on Hover */}
                    {activeTrailerId === film.id && (
                      <video
                        ref={(videoEl) => {
                          if (videoEl) {
                            videoEl.currentTime = 0;
                            videoEl.play().catch(() => {});
                          }
                        }}
                        src={film.videoUrl}
                        muted
                        loop
                        playsInline
                        className="film-hover-trailer-video is-playing"
                        aria-hidden="true"
                      />
                    )}

                    {/* Live Trailer Indicator Badge */}
                    {activeTrailerId === film.id && (
                      <div className="film-trailer-live-tag" aria-hidden="true">
                        <span className="live-dot-pulse" /> LIVE PREVIEW
                      </div>
                    )}

                    {/* Gradient Vignette Atmosphere */}
                    <div className="film-ambient-vignette" />

                    {/* Top Badges */}
                    <div className="film-card-top-tags">
                      <span className="film-genre-pill">
                        {film.category}
                      </span>
                      <span className="film-duration-badge">
                        <Clock size={11} /> {film.duration}
                      </span>
                    </div>

                    {/* Central Animated Glowing Play Hub — Revealed on hover when auto-slide pauses */}
                    <div className="film-play-hub" aria-hidden="true">
                      <div className="film-play-circle">
                        <Play size={24} fill="currentColor" className="film-play-icon" />
                        <span className="film-play-text">PLAY FILM</span>
                      </div>
                      <span className="film-play-pulse-ring" />
                      <span className="film-play-pulse-ring-outer" />
                    </div>
                  </div>

                  {/* Bottom Sliding Drawer (Smoothly slides up on hover) */}
                  <div className="film-card-slide-drawer">
                    <div className="film-primary-info">
                      <h3 className="film-slide-title">{film.title}</h3>
                      <p className="film-slide-tagline">{film.tagline}</p>

                      {/* Feature 4: Soundscape Row with Interactive Listen Button */}
                      <div className="film-soundscape-row">
                        <div className="soundscape-info-wrap">
                          <Volume2 size={12} className="gold-icon" />
                          <span>{film.soundscape}</span>
                        </div>
                        <button
                          type="button"
                          className={`film-score-preview-btn ${activeAudioPreviewId === film.id ? 'is-playing' : ''}`}
                          onClick={(e) => handleToggleAudioPreview(e, film)}
                          title={activeAudioPreviewId === film.id ? 'Stop score preview' : 'Listen to authentic score'}
                          aria-label={activeAudioPreviewId === film.id ? `Stop score preview for ${film.title}` : `Listen to authentic soundscape score for ${film.title}`}
                        >
                          <span className="score-bars" aria-hidden="true">
                            <span className="score-bar bar-1" />
                            <span className="score-bar bar-2" />
                            <span className="score-bar bar-3" />
                          </span>
                          <span className="score-btn-text">
                            {activeAudioPreviewId === film.id ? 'Mute' : 'Listen'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Feature 4: Interactive Film Chapters */}
                    <div className="film-chapters-wrap">
                      <span className="film-chapters-label">
                        <Bookmark size={11} className="gold-icon" /> Chapters:
                      </span>
                      <div className="film-chapters-list">
                        {film.chapters.map((ch, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            className="film-chapter-pill"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayFilm(film.story, ch.seconds);
                            }}
                            title={`Jump to ${ch.label} (${ch.time})`}
                          >
                            <span className="chapter-time">{ch.time}</span>
                            <span className="chapter-name">{ch.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Micro Stills Filmstrip (Slides into view on hover) */}
                    <div className="film-stills-strip" aria-hidden="true">
                      <span className="film-stills-label">Scene Stills:</span>
                      <div className="film-stills-row">
                        {film.stills.map((stillUrl, sIdx) => (
                          <div key={sIdx} className="film-still-thumb">
                            <img src={stillUrl} alt="" loading="lazy" onError={handleImageError} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Slide-Up CTA Action Bar */}
                    <div className="film-slide-cta-row">
                      <span className="film-location-tag">
                        <MapPin size={11} className="gold-icon" />
                        {film.location}
                      </span>

                      <span className="film-watch-cta">
                        Watch Film <ArrowRight size={13} className="cta-arrow" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
