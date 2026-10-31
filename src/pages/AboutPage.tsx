import React from 'react';
import { AboutSection } from '../components/AboutSection';
import { StudioMetricsSection } from '../components/StudioMetricsSection';
import { FaqSection } from '../components/FaqSection';

export const AboutPage: React.FC = () => {
  return (
    <main style={{ paddingTop: 'var(--nav-height)' }} id="main-content">
      <AboutSection showTeamSection={true} showPillarsSection={true} />
      <StudioMetricsSection />
      <FaqSection />
    </main>
  );
};
