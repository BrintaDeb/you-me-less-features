import React, { useEffect } from 'react';
import { Phone, Mail, ArrowLeft, Sparkles, MapPin, MessageSquare } from 'lucide-react';
import { EnquirySection } from '../components/EnquirySection';
import { businessInfo } from '../data/businessData';
import './ContactPage.css';

interface ContactPageProps {
  onBackToHome?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBackToHome }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <main className="contact-page" id="main-content">
      {/* ── 1. Atelier Contact Hero ──────────────────────────── */}
      <section className="contact-page-hero">
        <div className="contact-page-container">
          <a
            href="/"
            className="contact-back-link"
            onClick={handleBack}
            aria-label="Return to Homepage"
          >
            <ArrowLeft size={16} /> Back to Home
          </a>

          <div className="contact-hero-content">
            <p className="contact-eyebrow">
              <Sparkles size={14} /> SECURE YOUR CELEBRATION · ATELIER DIALOGUE
            </p>

            <h1 className="contact-title">LET'S SCRIPT YOUR STORY</h1>

            <p className="contact-subtitle">
              We accept an intentional curation of only 25 weddings each season to guarantee
              undivided focus, artistic devotion, and timeless cinematic craft.
            </p>

            {/* Direct Studio Concierge Badges */}
            <div className="contact-concierge-row">
              <a
                href={businessInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="concierge-badge whatsapp"
              >
                <MessageSquare size={16} />
                <span>WhatsApp Studio Direct</span>
              </a>

              <a
                href={`tel:${businessInfo.phoneRaw}`}
                className="concierge-badge phone"
              >
                <Phone size={15} />
                <span>{businessInfo.phone}</span>
              </a>

              <a
                href={`mailto:${businessInfo.email}`}
                className="concierge-badge email"
              >
                <Mail size={15} />
                <span>{businessInfo.email}</span>
              </a>

              <div className="concierge-badge location">
                <MapPin size={15} />
                <span>Kolkata Atelier · Available Globally</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Full Enquiry Experience ──────────────────────── */}
      <section className="contact-form-section">
        <EnquirySection />
      </section>
    </main>
  );
};
