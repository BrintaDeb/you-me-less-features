import React, { useState, useRef } from 'react';
import {
  Play,
  Sparkles,
  Camera,
  ChevronLeft,
  ChevronRight,
  Tv,
  Layers,
  Compass,
  ArrowRight
} from 'lucide-react';
import { VideoModal } from '../components/VideoModal';
import { smoothScrollTo } from '../hooks/useSmoothScroll';
import './BehindTheScenesPage.css';

interface BehindTheLensReel {
  id: string;
  number: string;
  title: string;
  category: 'directing' | 'golden-hour' | 'candids' | 'drone';
  categoryLabel: string;
  poster: string;
  videoUrl: string;
  duration: string;
  crewCredit: string;
  location: string;
  note: string;
}

const BTS_REELS: BehindTheLensReel[] = [
  {
    id: 'bts-1',
    number: '01',
    title: 'DIRECTING THE CHAOS',
    category: 'directing',
    categoryLabel: 'Director Take',
    poster: '/assets/team/brinta_deb.jpg',
    videoUrl: '/assets/videos/paraj_mrinmoyee.mp4',
    duration: '0:45',
    crewCredit: 'Brinta Deb · Lead Director',
    location: 'Sovabazar Rajbari, Kolkata',
    note: 'Coordinating 4 camera bodies through dense smoke bombs and baraat rhythm.'
  },
  {
    id: 'bts-2',
    number: '02',
    title: 'GOLDEN HOUR RUN',
    category: 'golden-hour',
    categoryLabel: 'Lighting Chase',
    poster: '/assets/posters/suchi_hira.jpg',
    videoUrl: '/assets/videos/suchi_hira.mp4',
    duration: '0:38',
    crewCredit: 'Anirban Roy · Cinematography',
    location: 'Pushkar Desert Dunes, Rajasthan',
    note: 'A 6-minute window when the sun turns to pure molten copper across the ridge.'
  },
  {
    id: 'bts-3',
    number: '03',
    title: 'BETWEEN TAKES & LAUGHTER',
    category: 'candids',
    categoryLabel: 'Unscripted Moment',
    poster: '/assets/team/anirban_roy.jpg',
    videoUrl: '/assets/videos/ankita_subhadeep.mp4',
    duration: '0:52',
    crewCredit: 'Anirban & Sayan · Stills Team',
    location: 'Vedic Village Resort, Rajarhat',
    note: 'The pure, unposed breathing space right before the bride steps into the mandap.'
  },
  {
    id: 'bts-4',
    number: '04',
    title: 'CANDID SMILES IN THE RAIN',
    category: 'candids',
    categoryLabel: 'Atmosphere',
    poster: '/assets/team/sayan_mukherjee.jpg',
    videoUrl: '/assets/videos/avik_binita.mp4',
    duration: '0:42',
    crewCredit: 'Sayan Mukherjee · Candid Eye',
    location: 'Calcutta Rowing Club, Dhakuria',
    note: 'Raindrops hitting the lens hood while the bride laughed without an umbrella.'
  },
  {
    id: 'bts-5',
    number: '05',
    title: 'DRONE PERSPECTIVE & GEOMETRY',
    category: 'drone',
    categoryLabel: 'Aerial Cinema',
    poster: '/assets/portfolio/default_wedding_photo.jpg',
    videoUrl: '/assets/videos/portfolio_bg.mp4',
    duration: '1:05',
    crewCredit: 'Anirban Roy · Drone Pilot',
    location: 'Mandawa Fort Palace, Rajasthan',
    note: 'Top-down symmetrical framing of the royal courtyard flower shower.'
  },
  {
    id: 'bts-6',
    number: '06',
    title: 'CELEBRATION GLOW AT MIDNIGHT',
    category: 'directing',
    categoryLabel: 'Night Cinematography',
    poster: '/assets/posters/urmi_jasraj.jpg',
    videoUrl: '/assets/videos/urmi_jasraj.mp4',
    duration: '0:48',
    crewCredit: 'Brinta & Crew',
    location: 'Taj Bengal Courtyard, Kolkata',
    note: 'Low-light 12,800 ISO capture preserving true candle warmth without harsh strobe.'
  }
];

const CREW_MEMBERS = [
  {
    name: 'Brinta Deb',
    role: 'Lead Visionary & Director',
    image: '/assets/team/brinta_deb.jpg',
    bio: 'Crafting the narrative arc, establishing emotional trust with families, and directing cinematic multi-camera rhythms.',
    gear: 'Sony FX6 Cinema Line · Zeiss Supreme Primes'
  },
  {
    name: 'Anirban Roy',
    role: 'Director of Photography & Drone Pilot',
    image: '/assets/team/anirban_roy.jpg',
    bio: 'Sculpting light, masterminding aerial perspectives, and catching fleeting cinematic silhouettes.',
    gear: 'Sony FX3 · DJI Mavic 3 Pro Cine · 50mm f/1.2 GM'
  },
  {
    name: 'Sayan Mukherjee',
    role: 'Principal Candid Stills Master',
    image: '/assets/team/sayan_mukherjee.jpg',
    bio: 'Silent, observant, and lightning-fast. Finding poetry in the quiet corners while everyone else looks at the stage.',
    gear: 'Sony A1 · 35mm f/1.4 GM · 85mm f/1.4 GM'
  },
  {
    name: 'Debolina Sen',
    role: 'Creative Producer & Colorist',
    image: '/assets/team/debolina_sen.jpg',
    bio: 'Orchestrating schedules on set, grading cinematic film luts, and preserving natural skin tones.',
    gear: 'DaVinci Resolve Studio · Calibrated OLED Monitor'
  }
];

const GEAR_ITEMS = [
  {
    title: 'Cinema Cameras',
    spec: 'Sony FX3 & FX6 Full-Frame',
    desc: 'Dual native ISO sensors allowing noise-free capture by candle and diyas.'
  },
  {
    title: 'Master Prime Glass',
    spec: 'Sony G-Master f/1.2 & f/1.4',
    desc: 'Ultra-fast primes producing painterly falloff and buttery organic bokeh.'
  },
  {
    title: 'Gimbal Stabilization',
    spec: 'DJI RS3 Pro + Lidar Focus',
    desc: 'Continuous gliding movement through fast-moving baraat crowds.'
  },
  {
    title: 'Aerial Cinematography',
    spec: 'DJI Mavic 3 Pro Cine (ProRes)',
    desc: 'Triple-camera aerial array delivering grand architecture and landscape depth.'
  },
  {
    title: '32-Bit Float Sound',
    spec: 'Wireless Lavalier Transmitters',
    desc: 'Captures whispered vows and laughter without clipping or distortion.'
  },
  {
    title: 'Signature Color Grading',
    spec: 'Custom Film LUTs in DaVinci',
    desc: 'Warm Bengali vermilion, royal gold, and timeless film stock grain.'
  }
];

interface BehindTheScenesPageProps {
  onNavigateToContact?: () => void;
}

export const BehindTheScenesPage: React.FC<BehindTheScenesPageProps> = ({ onNavigateToContact }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'directing' | 'golden-hour' | 'candids' | 'drone'>('all');
  const [viewMode, setViewMode] = useState<'track' | 'grid'>('track');
  const [activeVideo, setActiveVideo] = useState<{ url: string; poster: string; title: string } | null>(null);
  const reelTrackRef = useRef<HTMLDivElement>(null);

  const filteredReels = activeFilter === 'all'
    ? BTS_REELS
    : BTS_REELS.filter(r => r.category === activeFilter);

  const scrollReelTrack = (direction: 'left' | 'right') => {
    if (!reelTrackRef.current) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    reelTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/assets/portfolio/default_wedding_photo.jpg';
  };

  const handleCheckDateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToContact) {
      onNavigateToContact();
    } else {
      smoothScrollTo('contact');
    }
  };

  return (
    <main className="bts-page" id="main-content">
      {/* ── 1. Hero Viewfinder Header ────────────────────────── */}
      <section className="bts-hero-section">
        <div className="bts-viewfinder-grid" aria-hidden="true" />

        <div className="bts-container">
          {/* Status & Live REC Ribbon */}
          <div className="bts-rec-badge-row">
            <span className="bts-rec-indicator">
              <span className="bts-rec-dot" />
              REC
            </span>
            <span className="bts-timecode">00:04:28:12</span>
            <span className="bts-fps-pill">4K · 120 FPS</span>
            <span className="bts-raw-pill">S-CINETONE</span>
          </div>

          <p className="bts-eyebrow">
            <Sparkles size={14} /> REEL 03 · OFF CAMERA &amp; CREW AT WORK
          </p>

          <h1 className="bts-display-title">BEHIND THE LENS</h1>

          <p className="bts-subtitle">
            The frames you never see — raw moments, relentless sprint takes, director cues,
            and crew energy straight from the ground.
          </p>

          {/* Quick Metrics Strip */}
          <div className="bts-metrics-strip">
            <div className="bts-metric-pill">
              <span className="metric-num">6+</span>
              <span className="metric-label">Live Reel Takes</span>
            </div>
            <div className="bts-metric-pill">
              <span className="metric-num">4</span>
              <span className="metric-label">Principal Artists</span>
            </div>
            <div className="bts-metric-pill">
              <span className="metric-num">100%</span>
              <span className="metric-label">Unfiltered Emotion</span>
            </div>
            <div className="bts-metric-pill">
              <span className="metric-num">25</span>
              <span className="metric-label">Weddings Per Year</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Featured Director Spotlight ──────────────────── */}
      <section className="bts-spotlight-section">
        <div className="bts-container">
          <div className="bts-spotlight-card">
            <div className="bts-spotlight-media">
              <img
                src="/assets/posters/suchi_hira.jpg"
                alt="Off Camera Spotlight"
                className="bts-spotlight-img"
                loading="eager"
                onError={handleImageError}
              />
              <div className="bts-spotlight-scrim" />

              <button
                type="button"
                className="bts-spotlight-play-btn"
                onClick={() => setActiveVideo({
                  url: '/assets/videos/suchi_hira.mp4',
                  poster: '/assets/posters/suchi_hira.jpg',
                  title: 'Behind The Lens — The Golden Hour Sprint'
                })}
                aria-label="Play Featured Behind The Scenes Spotlight"
              >
                <Play size={28} fill="currentColor" />
              </button>

              <div className="bts-spotlight-tag">
                <Tv size={14} /> FEATURED DIRECTOR CUT
              </div>
            </div>

            <div className="bts-spotlight-content">
              <span className="bts-spotlight-badge">ATELIER ARCHIVE · 2026</span>
              <h2 className="bts-spotlight-title">THE 6-MINUTE SUNSET SPRINT</h2>
              <p className="bts-spotlight-desc">
                When the Rajasthan twilight dipped over the dunes, we had exactly six minutes before the gold faded into blue.
                Watch our crew coordinate dual gimbal tracks, drone passes, and candid laughter without breaking the couple’s sacred calm.
              </p>

              <div className="bts-spotlight-specs">
                <div className="spec-pill">
                  <Camera size={13} /> Sony FX3 + 35mm f/1.4 GM
                </div>
                <div className="spec-pill">
                  <Compass size={13} /> Pushkar, Rajasthan
                </div>
                <div className="spec-pill">
                  <Layers size={13} /> Directed by Brinta Deb
                </div>
              </div>

              <div className="bts-spotlight-action">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveVideo({
                    url: '/assets/videos/suchi_hira.mp4',
                    poster: '/assets/posters/suchi_hira.jpg',
                    title: 'Behind The Lens — The Golden Hour Sprint'
                  })}
                >
                  <Play size={16} fill="currentColor" /> Watch Full Reel (0:38)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Reel Gallery & Controls (From User Screenshot) ── */}
      <section className="bts-reels-section" id="reels-gallery">
        <div className="bts-container">
          <div className="bts-section-header">
            <div>
              <p className="bts-section-eyebrow">REEL 03 · OFF CAMERA</p>
              <h2 className="bts-section-title">THE VERTICAL REEL ARCHIVE</h2>
              <p className="bts-section-sub">
                Select any reel below to launch the theater view. Shot in native 9:16 vertical cinema.
              </p>
            </div>

            {/* Filter Tabs & View Mode */}
            <div className="bts-controls-row">
              <div className="bts-filter-pills" role="tablist" aria-label="Reel categories">
                <button
                  type="button"
                  className={`bts-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All ({BTS_REELS.length})
                </button>
                <button
                  type="button"
                  className={`bts-filter-btn ${activeFilter === 'directing' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('directing')}
                >
                  Director Takes
                </button>
                <button
                  type="button"
                  className={`bts-filter-btn ${activeFilter === 'golden-hour' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('golden-hour')}
                >
                  Golden Hour
                </button>
                <button
                  type="button"
                  className={`bts-filter-btn ${activeFilter === 'candids' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('candids')}
                >
                  Candids
                </button>
                <button
                  type="button"
                  className={`bts-filter-btn ${activeFilter === 'drone' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('drone')}
                >
                  Drone &amp; Aerial
                </button>
              </div>

              <div className="bts-view-toggle">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'track' ? 'active' : ''}`}
                  onClick={() => setViewMode('track')}
                  title="Horizontal Reel Track View"
                >
                  Reel Slider
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  All Grid
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Reel Slider or Grid */}
          {viewMode === 'track' ? (
            <div className="bts-reel-carousel-container">
              {/* Carousel Arrows */}
              <button
                type="button"
                className="bts-carousel-arrow left"
                onClick={() => scrollReelTrack('left')}
                aria-label="Scroll left"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="bts-carousel-arrow right"
                onClick={() => scrollReelTrack('right')}
                aria-label="Scroll right"
              >
                <ChevronRight size={22} />
              </button>

              {/* Horizontal 9:16 Reel Track */}
              <div className="bts-reel-track" ref={reelTrackRef}>
                {filteredReels.map((reel) => (
                  <button
                    key={reel.id}
                    type="button"
                    className="bts-reel-card"
                    onClick={() => setActiveVideo({
                      url: reel.videoUrl,
                      poster: reel.poster,
                      title: `Behind The Lens — ${reel.title}`
                    })}
                    aria-label={`Play Behind The Lens Reel ${reel.number}: ${reel.title}`}
                  >
                    <div className="bts-reel-media">
                      <img
                        src={reel.poster}
                        alt={reel.title}
                        className="bts-reel-poster"
                        loading="lazy"
                        onError={handleImageError}
                      />
                      <div className="bts-reel-overlay" />

                      {/* Viewfinder corner pips */}
                      <span className="corner-pip corner-tl" aria-hidden="true" />
                      <span className="corner-pip corner-tr" aria-hidden="true" />
                      <span className="corner-pip corner-bl" aria-hidden="true" />
                      <span className="corner-pip corner-br" aria-hidden="true" />

                      {/* Category Pill Tag */}
                      <span className="bts-reel-cat-badge">{reel.categoryLabel}</span>

                      {/* Play Badge */}
                      <div className="bts-reel-play-btn">
                        <Play size={18} fill="currentColor" />
                      </div>

                      {/* Duration Pill */}
                      <span className="bts-reel-duration">{reel.duration}</span>

                      {/* Bottom Metadata */}
                      <div className="bts-reel-meta">
                        <span className="bts-reel-number">REEL {reel.number}</span>
                        <h3 className="bts-reel-title">{reel.title}</h3>
                        <p className="bts-reel-credit">{reel.crewCredit}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bts-reel-grid">
              {filteredReels.map((reel) => (
                <button
                  key={reel.id}
                  type="button"
                  className="bts-reel-card"
                  onClick={() => setActiveVideo({
                    url: reel.videoUrl,
                    poster: reel.poster,
                    title: `Behind The Lens — ${reel.title}`
                  })}
                  aria-label={`Play Behind The Lens Reel ${reel.number}: ${reel.title}`}
                >
                  <div className="bts-reel-media">
                    <img
                      src={reel.poster}
                      alt={reel.title}
                      className="bts-reel-poster"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <div className="bts-reel-overlay" />

                    <span className="corner-pip corner-tl" aria-hidden="true" />
                    <span className="corner-pip corner-tr" aria-hidden="true" />
                    <span className="corner-pip corner-bl" aria-hidden="true" />
                    <span className="corner-pip corner-br" aria-hidden="true" />

                    <span className="bts-reel-cat-badge">{reel.categoryLabel}</span>

                    <div className="bts-reel-play-btn">
                      <Play size={18} fill="currentColor" />
                    </div>

                    <span className="bts-reel-duration">{reel.duration}</span>

                    <div className="bts-reel-meta">
                      <span className="bts-reel-number">REEL {reel.number}</span>
                      <h3 className="bts-reel-title">{reel.title}</h3>
                      <p className="bts-reel-credit">{reel.crewCredit}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. Meet The Crew Behind The Cameras ──────────────── */}
      <section className="bts-crew-section">
        <div className="bts-container">
          <div className="bts-section-header text-center">
            <p className="bts-section-eyebrow">THE ATELIER ARTISTS</p>
            <h2 className="bts-section-title">THE FACES BEHIND THE CAMERAS</h2>
            <p className="bts-section-sub max-w-600">
              Passionate, calm, and obsessive about light. Meet the artisans who live inside each celebration with you.
            </p>
          </div>

          <div className="bts-crew-grid">
            {CREW_MEMBERS.map((member) => (
              <div key={member.name} className="bts-crew-card">
                <div className="bts-crew-photo-wrap">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="bts-crew-photo"
                    loading="lazy"
                    onError={handleImageError}
                  />
                  <div className="bts-crew-badge">{member.role}</div>
                </div>
                <div className="bts-crew-info">
                  <h3 className="bts-crew-name">{member.name}</h3>
                  <p className="bts-crew-bio">{member.bio}</p>
                  <div className="bts-crew-gear">
                    <Camera size={13} />
                    <span>{member.gear}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Technical Rig & Gear Philosophy ────────────────── */}
      <section className="bts-gear-section">
        <div className="bts-container">
          <div className="bts-section-header text-center">
            <p className="bts-section-eyebrow">OUR CINEMA ARSENAL</p>
            <h2 className="bts-section-title">THE TOOLS OF THE ATELIER</h2>
            <p className="bts-section-sub max-w-600">
              We never compromise on optics, sensor dynamic range, or sound clarity.
            </p>
          </div>

          <div className="bts-gear-grid">
            {GEAR_ITEMS.map((item, idx) => (
              <div key={item.title} className="bts-gear-card">
                <span className="bts-gear-idx">0{idx + 1}</span>
                <h3 className="bts-gear-title">{item.title}</h3>
                <h4 className="bts-gear-spec">{item.spec}</h4>
                <p className="bts-gear-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Field Stories / Director Journal ──────────────── */}
      <section className="bts-stories-section">
        <div className="bts-container">
          <div className="bts-section-header text-center">
            <p className="bts-section-eyebrow">DISPATCHES FROM THE FLOOR</p>
            <h2 className="bts-section-title">DIRECTOR'S FIELD NOTES</h2>
          </div>

          <div className="bts-notes-grid">
            <div className="bts-note-card">
              <span className="note-num">ENTRY 14</span>
              <h3 className="note-title">Dancing in the Downpour</h3>
              <p className="note-body">
                "When Kolkata skies opened during Subhadeep &amp; Ankita's entry, umbrellas vanished and everyone took to the rain.
                Our cameras were weather-sealed, but our grins were wide. The resulting dance reel remains our most viral moment."
              </p>
              <span className="note-author">— Sayan Mukherjee</span>
            </div>

            <div className="bts-note-card">
              <span className="note-num">ENTRY 21</span>
              <h3 className="note-title">The Silent Dawn Shehnai</h3>
              <p className="note-body">
                "At 5:15 AM before anyone was awake, we caught the father of the bride sitting alone with his tea while the shehnai
                soundcheck drifted across the courtyard. That unscripted 3-minute sequence became the heartbeat of their film."
              </p>
              <span className="note-author">— Brinta Deb</span>
            </div>

            <div className="bts-note-card">
              <span className="note-num">ENTRY 33</span>
              <h3 className="note-title">Chasing Jaipur Golden Dust</h3>
              <p className="note-body">
                "Running backward with a 15-kilogram gimbal rig while Jasraj spun Urmi into the golden haze. You don't direct moments
                like that — you just make sure the camera moves like a breath with them."
              </p>
              <span className="note-author">— Anirban Roy</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Finale CTA ────────────────────────────────────── */}
      <section className="bts-cta-section">
        <div className="bts-container">
          <div className="bts-cta-box">
            <div className="bts-cta-content">
              <p className="bts-cta-eyebrow">YOUR WEDDING · OUR PASSION</p>
              <h2 className="bts-cta-title">Want this energy documenting your day?</h2>
              <p className="bts-cta-desc">
                We accept only 25 weddings per calendar year to dedicate this relentless craft and care to every single couple.
              </p>
              <div className="bts-cta-actions">
                <a
                  href="#contact"
                  className="btn btn-primary"
                  onClick={handleCheckDateClick}
                >
                  Check Your Date <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Active Video Modal ────────────────────────────── */}
      {activeVideo && (
        <VideoModal
          videoUrl={activeVideo.url}
          posterUrl={activeVideo.poster}
          title={activeVideo.title}
          isOpen={true}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </main>
  );
};
