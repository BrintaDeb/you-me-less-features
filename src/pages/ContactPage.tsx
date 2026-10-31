import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Calendar as CalendarIcon,
  Sparkles,
  Film,
  Heart,
  ShieldCheck,
  Send,
  Compass,
  ChevronDown,
  Award
} from 'lucide-react';
import { businessInfo } from '../data/businessData';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { WaxSealStamp } from '../components/WaxSealStamp';
import { triggerHaptic } from '../utils/haptics';
import './ContactPage.css';

interface ContactPageProps {
  onBackToHome?: () => void;
}

interface CelebrationScaleOption {
  id: string;
  title: string;
  scale: string;
  icon: React.ElementType;
}

const CELEBRATION_SCALES: CelebrationScaleOption[] = [
  {
    id: 'heritage',
    title: 'Heritage & Courtyard',
    scale: 'Intimate Gathering (Under 150 Guests)',
    icon: Heart
  },
  {
    id: 'destination',
    title: 'Destination Retreat',
    scale: 'Beach, Hills, or Scenic Getaway (150–350 Guests)',
    icon: Compass
  },
  {
    id: 'royal',
    title: 'Palace & Royal Gala',
    scale: 'Multi-Day Grand Celebration (350+ Guests)',
    icon: Award
  },
  {
    id: 'prewedding',
    title: 'Cinematic Pre-Wedding',
    scale: 'Editorial Motion Film & Master Still Session',
    icon: Film
  }
];

const QUICK_CEREMONY_TAGS = [
  'Haldi & Mehendi',
  'Sangeet Night',
  'Saat Phere / Pheras',
  'Sindoor Daan',
  'Reception Gala',
  'Bidaai Moments'
];

const CONTACT_FAQS = [
  {
    q: 'How far in advance should we secure our dates?',
    a: 'Because we intentionally limit our atelier to only 25 weddings per year, dates are typically commissioned 6 to 12 months ahead. Peak winter auspicious dates (November–February) fill particularly early.'
  },
  {
    q: 'Do you personally travel for destination weddings?',
    a: 'Yes. Principal artists lead every outstation and destination celebration personally. We have documented ceremonies across Rajasthan, Goa, Bengal, Delhi, Kerala, and international destinations.'
  },
  {
    q: 'How do you approach couples who feel shy in front of cameras?',
    a: 'Quiet documentary truth is our cornerstone. We never demand awkward stiff poses or freeze sacred rituals. You simply live your day with your family; we chase natural light and honest emotion discreetly.'
  },
  {
    q: 'What is the delivery timeline for films and archival galleries?',
    a: 'A hand-selected "Next-Day Highlights" preview is delivered within 48–72 hours for family sharing. The complete 4K cinematic film and color-graded master stills collection are completed within 6 to 8 weeks.'
  }
];

const STORAGE_KEY = 'youandme_contact_dialogue_draft_v3';

export const ContactPage: React.FC<ContactPageProps> = ({ onBackToHome }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Form Fields State (Unified, Zero Duplication)
  const [celebrationScale, setCelebrationScale] = useState<string>('destination');
  const [coupleNames, setCoupleNames] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingLocation, setWeddingLocation] = useState('');
  const [visionNotes, setVisionNotes] = useState('');
  const [selectedDateNote, setSelectedDateNote] = useState('');
  const [botTrap, setBotTrap] = useState('');

  // Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load draft from localStorage on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.coupleNames) setCoupleNames(parsed.coupleNames);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.weddingDate) setWeddingDate(parsed.weddingDate);
        if (parsed.weddingLocation) setWeddingLocation(parsed.weddingLocation);
        if (parsed.celebrationScale) setCelebrationScale(parsed.celebrationScale);
        if (parsed.visionNotes) setVisionNotes(parsed.visionNotes);
      }
    } catch {}
  }, []);

  // Auto-save draft on changes
  useEffect(() => {
    const draft = {
      coupleNames,
      email,
      phone,
      weddingDate,
      weddingLocation,
      celebrationScale,
      visionNotes
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {}
  }, [coupleNames, email, phone, weddingDate, weddingLocation, celebrationScale, visionNotes]);

  // Compute completion progress for the subtle progress bar
  const completionProgress = useMemo(() => {
    let score = 0;
    if (coupleNames.trim().length >= 3) score += 30;
    if (email.includes('@') && email.includes('.')) score += 25;
    if (phone.trim().length >= 8) score += 20;
    if (weddingDate.trim()) score += 15;
    if (weddingLocation.trim() || visionNotes.trim()) score += 10;
    return Math.min(100, score);
  }, [coupleNames, email, phone, weddingDate, weddingLocation, visionNotes]);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic('light');
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleSelectScale = (id: string) => {
    triggerHaptic('selection');
    setCelebrationScale(id);
  };

  const handleAddVisionTag = (tag: string) => {
    triggerHaptic('light');
    setVisionNotes((prev) => {
      if (prev.includes(tag)) return prev;
      return prev ? `${prev}, ${tag}` : tag;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!coupleNames.trim()) {
      errs.coupleNames = 'Please enter both of your names.';
    }

    if (!email.trim()) {
      errs.email = 'Please provide an email address for dialogue.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!phone.trim()) {
      errs.phone = 'Please provide a telephone number for WhatsApp concierge.';
    } else if (!/^[+]?[\d\s\-()]{8,20}$/.test(phone)) {
      errs.phone = 'Please enter a valid telephone number.';
    }

    if (!weddingDate.trim()) {
      errs.weddingDate = 'Please select your intended wedding date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (botTrap) return; // Silent discard for honeypot

    if (!validate()) {
      triggerHaptic('warning');
      const firstErr = document.querySelector('.dialogue-input.has-error') as HTMLElement;
      firstErr?.focus();
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      // Simulate robust network submission / webhook persistence
      await new Promise((resolve) => setTimeout(resolve, 1100));

      setSubmitStatus('success');
      triggerHaptic('success');
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    } catch {
      setSubmitStatus('error');
      triggerHaptic('warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedScaleObj = useMemo(() => {
    return CELEBRATION_SCALES.find((s) => s.id === celebrationScale) || CELEBRATION_SCALES[1];
  }, [celebrationScale]);

  const generatedWhatsAppUrl = useMemo(() => {
    const text =
      `Hello YOU & ME Studio! We would love to enquire about reserving our wedding celebration.\n\n` +
      `💍 Couple: ${coupleNames || 'Our Wedding'}\n` +
      `📅 Date: ${weddingDate || 'Date to be confirmed'}\n` +
      `📍 Location: ${weddingLocation || 'To be confirmed'}\n` +
      `🏛️ Setting & Scale: ${selectedScaleObj.title} (${selectedScaleObj.scale})\n` +
      (visionNotes ? `💭 Vision & Events: ${visionNotes}\n` : '') +
      `\nLooking forward to hearing about your availability.`;

    return `https://wa.me/918119805161?text=${encodeURIComponent(text)}`;
  }, [coupleNames, weddingDate, weddingLocation, selectedScaleObj, visionNotes]);

  return (
    <main className="contact-suite-page" id="main-content">
      {/* Dynamic Ambient Background Illumination */}
      <div className="contact-ambient-vignette" aria-hidden="true" />

      <div className="contact-suite-container">
        {/* Navigation Breadcrumb */}
        <div className="contact-nav-bar">
          <a
            href="/"
            onClick={handleBack}
            className="contact-back-button"
            aria-label="Return to Atelier Homepage"
          >
            <ArrowLeft size={16} />
            <span>Return to Portfolio</span>
          </a>

          <div className="season-curation-pill">
            <span className="live-status-dot" aria-hidden="true" />
            <span className="status-copy">2026 / 2027 SEASON · 8 ATELIER SLOTS REMAINING</span>
          </div>
        </div>

        {/* ── Main Two-Column Editorial Suite ─────────────────────────── */}
        <div className="contact-split-grid">
          {/* LEFT COLUMN: Atelier Director Concierge Hub */}
          <aside className="concierge-col">
            <div className="concierge-header">
              <span className="concierge-kicker">ATELIER CONSULTATION · DIRECT DIALOGUE</span>
              <h1 className="concierge-headline">
                Scripting Your <em>Heirloom</em>
              </h1>
              <p className="concierge-intro">
                We accept an intentional curation of only 25 weddings each season to guarantee
                undivided artistic focus, principal presence, and museum-grade permanence.
              </p>
            </div>

            {/* Direct Studio Channels */}
            <div className="concierge-channel-cards">
              <a
                href={generatedWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="channel-card vip-whatsapp"
                onClick={() => triggerHaptic('light')}
              >
                <div className="channel-icon-wrap whatsapp">
                  <MessageSquare size={18} />
                </div>
                <div className="channel-text">
                  <div className="channel-label-row">
                    <span className="channel-label">DIRECT VIP WHATSAPP</span>
                    <span className="channel-badge">Instant Reply</span>
                  </div>
                  <span className="channel-val">(+91) 81198 05161</span>
                </div>
              </a>

              <a
                href={`tel:${businessInfo.phoneRaw}`}
                className="channel-card"
                onClick={() => triggerHaptic('light')}
              >
                <div className="channel-icon-wrap">
                  <Phone size={18} />
                </div>
                <div className="channel-text">
                  <span className="channel-label">ATELIER DIRECT LINE</span>
                  <span className="channel-val">{businessInfo.phone}</span>
                </div>
              </a>

              <a
                href={`mailto:${businessInfo.email}`}
                className="channel-card"
                onClick={() => triggerHaptic('light')}
              >
                <div className="channel-icon-wrap">
                  <Mail size={18} />
                </div>
                <div className="channel-text">
                  <span className="channel-label">PRIVATE CORRESPONDENCE</span>
                  <span className="channel-val">{businessInfo.email}</span>
                </div>
              </a>
            </div>

            {/* Director's Personal Vow Card */}
            <div className="atelier-vow-card">
              <p className="vow-quote">
                &ldquo;When you welcome us into your sacred circles, you receive our undivided heart,
                unhurried presence, and full creative devotion.&rdquo;
              </p>
              <div className="vow-signature">
                <span className="vow-author">Brinta Deb</span>
                <span className="vow-role">Founder & Principal Director, YOU & ME</span>
              </div>
            </div>

            {/* Location & Global Travel Badge */}
            <div className="atelier-location-banner">
              <MapPin size={16} className="location-pin-icon" />
              <div>
                <strong className="location-city">Atelier Agartala</strong>
                <span className="location-sub">Available Worldwide for Destination Weddings</span>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Streamlined, Unified Consultation Experience */}
          <section className="dialogue-col" aria-label="Wedding Reservation Dialogue">
            <div className="dialogue-card">
              {/* Subtle Completion Progress Hairline */}
              <div className="dialogue-progress-track" aria-hidden="true">
                <div
                  className="dialogue-progress-bar"
                  style={{ width: `${submitStatus === 'success' ? 100 : completionProgress}%` }}
                />
              </div>

              {submitStatus === 'success' ? (
                /* ── Success Confirmation Screen with 3D Sealing Wax Stamp ── */
                <div className="dialogue-success-state" role="status" aria-live="polite">
                  <WaxSealStamp coupleNames={coupleNames} />

                  <span className="success-eyebrow">DIALOGUE INITIATED</span>
                  <h2 className="success-title">Your Story Has Been Received</h2>

                  <p className="success-body">
                    Thank you, <strong>{coupleNames}</strong>. Principal Director Brinta Deb has received
                    your enquiry for <strong>{weddingDate}</strong> at <strong>{weddingLocation || 'your destination'}</strong>.
                    Our team will review date availability and respond within 24 hours.
                  </p>

                  <div className="success-actions-row">
                    <a
                      href={generatedWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-success-whatsapp"
                      onClick={() => triggerHaptic('medium')}
                    >
                      <MessageSquare size={18} />
                      <span>Continue Instantly on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      className="btn-success-reset"
                      onClick={() => {
                        triggerHaptic('light');
                        setSubmitStatus('idle');
                        setCoupleNames('');
                        setEmail('');
                        setPhone('');
                        setWeddingDate('');
                        setWeddingLocation('');
                        setVisionNotes('');
                      }}
                    >
                      Submit Another Query
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Streamlined Consultation Form ── */
                <form onSubmit={handleSubmit} noValidate className="dialogue-form">
                  {/* Honeypot for Bot Prevention */}
                  <input
                    type="text"
                    name="botTrap"
                    value={botTrap}
                    onChange={(e) => setBotTrap(e.target.value)}
                    tabIndex={-1}
                    className="visually-hidden"
                    aria-hidden="true"
                  />

                  {/* Form Header */}
                  <div className="dialogue-form-header">
                    <span className="dialogue-header-badge">COMMISSION INQUIRY</span>
                    <h2 className="dialogue-header-title">Tell Us About Your Celebration</h2>
                    <p className="dialogue-header-sub">
                      Share your dates and vision. We will review our seasonal schedule and prepare a bespoke proposal.
                    </p>
                  </div>

                  {/* 1. Core Couple Information Inputs */}
                  <div className="form-section-block">
                    <label className="section-label">
                      <span>1. THE COUPLE & CELEBRATION DATE</span>
                      <span className="label-guide">Essential for availability checks</span>
                    </label>

                    <div className="input-field-group">
                      <div className="floating-input-wrap">
                        <label htmlFor="couple-names" className="field-caption">
                          Couple Names *
                        </label>
                        <input
                          id="couple-names"
                          type="text"
                          required
                          value={coupleNames}
                          onChange={(e) => {
                            setCoupleNames(e.target.value);
                            if (errors.coupleNames) setErrors((prev) => ({ ...prev, coupleNames: '' }));
                          }}
                          placeholder="e.g. Prianka Sen & Rohan Roy"
                          className={`dialogue-input ${errors.coupleNames ? 'has-error' : ''}`}
                        />
                        {errors.coupleNames && (
                          <span className="field-error-text">{errors.coupleNames}</span>
                        )}
                      </div>

                      <div className="two-columns-row">
                        <div className="floating-input-wrap">
                          <label htmlFor="contact-email" className="field-caption">
                            Email Address *
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                            }}
                            placeholder="prianka@domain.com"
                            className={`dialogue-input ${errors.email ? 'has-error' : ''}`}
                          />
                          {errors.email && (
                            <span className="field-error-text">{errors.email}</span>
                          )}
                        </div>

                        <div className="floating-input-wrap">
                          <label htmlFor="contact-phone" className="field-caption">
                            Telephone / WhatsApp *
                          </label>
                          <input
                            id="contact-phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                            }}
                            placeholder="+91 98765 43210"
                            className={`dialogue-input ${errors.phone ? 'has-error' : ''}`}
                          />
                          {errors.phone && (
                            <span className="field-error-text">{errors.phone}</span>
                          )}
                        </div>
                      </div>

                      {/* Date & Location Row */}
                      <div className="two-columns-row">
                        <div className="floating-input-wrap">
                          <div className="caption-with-action">
                            <label htmlFor="wedding-date" className="field-caption">
                              Wedding Date *
                            </label>
                            <button
                              type="button"
                              className="inline-calendar-trigger"
                              onClick={() => {
                                triggerHaptic('light');
                                setShowCalendar(true);
                              }}
                            >
                              <CalendarIcon size={12} />
                              <span>View Studio Calendar</span>
                            </button>
                          </div>

                          <input
                            id="wedding-date"
                            type="date"
                            required
                            value={weddingDate}
                            onChange={(e) => {
                              setWeddingDate(e.target.value);
                              setSelectedDateNote('');
                              if (errors.weddingDate) setErrors((prev) => ({ ...prev, weddingDate: '' }));
                            }}
                            className={`dialogue-input ${errors.weddingDate ? 'has-error' : ''}`}
                          />

                          {selectedDateNote && (
                            <div className="selected-date-indicator">
                              <Sparkles size={12} />
                              <span>{selectedDateNote}</span>
                            </div>
                          )}

                          {errors.weddingDate && (
                            <span className="field-error-text">{errors.weddingDate}</span>
                          )}
                        </div>

                        <div className="floating-input-wrap">
                          <label htmlFor="wedding-location" className="field-caption">
                            Venue / City / Destination
                          </label>
                          <input
                            id="wedding-location"
                            type="text"
                            value={weddingLocation}
                            onChange={(e) => setWeddingLocation(e.target.value)}
                            placeholder="e.g. Taj Umaid Bhawan, Jodhpur"
                            className="dialogue-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Celebration Setting & Scale (Combined & Non-Redundant) */}
                  <div className="form-section-block">
                    <label className="section-label">
                      <span>2. CELEBRATION SETTING & SCALE</span>
                      <span className="label-guide">Defines the creative footprint</span>
                    </label>

                    <div className="celebration-chips-grid">
                      {CELEBRATION_SCALES.map((scale) => {
                        const isSelected = celebrationScale === scale.id;
                        const Icon = scale.icon;
                        return (
                          <button
                            key={scale.id}
                            type="button"
                            className={`celebration-chip ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectScale(scale.id)}
                          >
                            <div className="chip-icon-box">
                              <Icon size={16} />
                            </div>
                            <div className="chip-content">
                              <span className="chip-title">{scale.title}</span>
                              <span className="chip-desc">{scale.scale}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Personal Vision & Ceremony Notes */}
                  <div className="form-section-block">
                    <div className="section-label-with-tags">
                      <label htmlFor="vision-notes" className="section-label-inline">
                        <span>3. CEREMONY DETAILS & SACRED RITES</span>
                      </label>
                      <span className="label-guide">Tap tags to add to your brief:</span>
                    </div>

                    {/* Quick suggestion tag chips */}
                    <div className="quick-tags-row">
                      {QUICK_CEREMONY_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="quick-tag-chip"
                          onClick={() => handleAddVisionTag(tag)}
                        >
                          <span>+ {tag}</span>
                        </button>
                      ))}
                    </div>

                    <textarea
                      id="vision-notes"
                      rows={3}
                      value={visionNotes}
                      onChange={(e) => setVisionNotes(e.target.value)}
                      placeholder="Tell us about the ceremonies planned, unique cultural rituals, estimated timeline, or anything meaningful to your families..."
                      className="dialogue-textarea"
                    />
                  </div>

                  {/* Action Submission Buttons */}
                  <div className="form-submit-row">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-atelier-submit"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="submit-spinner" />
                          <span>Dispatching to Director...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Reservation Brief</span>
                          <Send size={15} />
                        </>
                      )}
                    </button>

                    <a
                      href={generatedWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp-shortcut"
                      title="Open WhatsApp with current form details"
                      onClick={() => triggerHaptic('light')}
                    >
                      <MessageSquare size={16} />
                      <span>WhatsApp Direct</span>
                    </a>
                  </div>

                  {/* Privacy & Confidentiality Guarantee */}
                  <div className="dialogue-security-banner">
                    <ShieldCheck size={14} className="shield-icon" />
                    <span>
                      Strictly Confidential · We never share contact details or wedding schedules with 3rd parties.
                    </span>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>

        {/* ── Interactive Atelier FAQ Accordion ───────────────────────── */}
        <section className="contact-faq-subsuite" aria-labelledby="contact-faq-heading">
          <header className="faq-subsuite-header">
            <span className="faq-subsuite-kicker">FREQUENT INQUIRIES</span>
            <h2 id="contact-faq-heading" className="faq-subsuite-title">
              Atelier Policies & Consultation <em>Guidance</em>
            </h2>
          </header>

          <div className="contact-faq-grid">
            {CONTACT_FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`contact-faq-card ${isOpen ? 'is-expanded' : ''}`}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveFaq(isOpen ? null : idx);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveFaq(isOpen ? null : idx);
                    }
                  }}
                  aria-expanded={isOpen}
                >
                  <div className="faq-question-row">
                    <h3 className="faq-question-text">{faq.q}</h3>
                    <ChevronDown size={18} className="faq-chevron" />
                  </div>
                  {isOpen && <p className="faq-answer-text">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Studio Interactive Availability Calendar Modal ─────────── */}
      {showCalendar && (
        <AvailabilityCalendar
          selectedDate={weddingDate}
          onSelectDate={(date, note) => {
            triggerHaptic('selection');
            setWeddingDate(date);
            if (note) setSelectedDateNote(note);
            setShowCalendar(false);
          }}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </main>
  );
};
