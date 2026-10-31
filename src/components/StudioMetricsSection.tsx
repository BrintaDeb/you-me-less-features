import React from 'react';
import './StudioMetricsSection.css';

interface ProvenanceMetric {
  id: string;
  roman: string;
  number: string;
  label: string;
  detail: string;
}

const PROVENANCE_METRICS: ProvenanceMetric[] = [
  {
    id: 'years',
    roman: 'I',
    number: '8+',
    label: 'YEARS OF CRAFT',
    detail: 'Chronicling sacred love stories'
  },
  {
    id: 'weddings',
    roman: 'II',
    number: '250+',
    label: 'WEDDINGS DIRECTED',
    detail: 'Personally guided & shot'
  },
  {
    id: 'films',
    roman: 'III',
    number: '180+',
    label: 'CINEMATIC FILMS',
    detail: 'Narrative motion masteries'
  },
  {
    id: 'frames',
    roman: 'IV',
    number: '500k+',
    label: 'AUTHENTIC FRAMES',
    detail: 'Preserved without posing'
  },
  {
    id: 'quality',
    roman: 'V',
    number: '100%',
    label: 'ARCHIVAL QUALITY',
    detail: 'Centennial print guarantee'
  }
];

export const StudioMetricsSection: React.FC = () => {
  return (
    <section
      id="studio-metrics"
      className="provenance-section"
      aria-labelledby="provenance-heading"
    >
      <div className="provenance-container">
        {/* Editorial Section Header — Clean, Quiet Luxury */}
        <header className="provenance-header">
          <div className="provenance-kicker">
            <span className="kicker-line" aria-hidden="true" />
            <span className="kicker-label">ATELIER PROVENANCE · EST. 2018</span>
            <span className="kicker-line" aria-hidden="true" />
          </div>

          <h2 id="provenance-heading" className="provenance-title">
            The Measure of <em>Our Craft</em>
          </h2>

          <p className="provenance-lede">
            Eight seasons devoted to documentary honesty, quiet luxury, and the art of preserving
            fleeting wedding moments as timeless heirlooms.
          </p>
        </header>

        {/* ── Bespoke 5-Pillar Architectural Card ──────────────────────── */}
        <div className="provenance-card-envelope">
          <div className="provenance-card">
            {PROVENANCE_METRICS.map((metric, index) => (
              <React.Fragment key={metric.id}>
                {index > 0 && <div className="provenance-divider" aria-hidden="true" />}
                <div className="provenance-col">
                  {/* Subtle Archival Index Roman Numeral */}
                  <span className="col-index" aria-hidden="true">
                    {metric.roman}
                  </span>

                  {/* Crimson Editorial Serif Number */}
                  <div className="col-num-wrap">
                    <span className="col-num">{metric.number}</span>
                  </div>

                  {/* Uppercase Tracked Label */}
                  <h3 className="col-label">{metric.label}</h3>

                  {/* Grounded Human Detail */}
                  <p className="col-detail">{metric.detail}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Handcrafted Editorial Footnote ─────────────────────────── */}
        <footer className="provenance-footnote">
          <span className="footnote-mark">FOLIO 08</span>
          <span className="footnote-separator">/</span>
          <span className="footnote-text">
            Every celebration personally directed by principal artists · Never outsourced to substitute crews
          </span>
          <span className="footnote-separator">/</span>
          <span className="footnote-mark">KOLKATA & DESTINATIONS</span>
        </footer>
      </div>
    </section>
  );
};
