import React from 'react';
import { AboutSection } from '../components/AboutSection';
import { FaqSection } from '../components/FaqSection';

export const AboutPage: React.FC = () => {
  return (
    <main style={{ paddingTop: 'var(--nav-height)' }} id="main-content">
      <AboutSection showTeamSection={true} />
      <FaqSection />
    </main>
  );
};
