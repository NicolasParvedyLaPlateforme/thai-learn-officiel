'use client';

import { useEffect, useState } from 'react';
import { useProgressStore } from '../lib/store';
import LandingHeader from './landing/LandingHeader';
import LandingHero from './landing/LandingHero';
import LandingShowcase from './landing/LandingShowcase';
import LandingMetrics from './landing/LandingMetrics';
import LandingFeatures from './landing/LandingFeatures';
import LandingCTAAndFooter from './landing/LandingCTAAndFooter';

export default function LandingPageClient() {
  const [mounted, setMounted] = useState(false);
  const { autoDetectLanguage } = useProgressStore();

  useEffect(() => {
    setMounted(true);
    autoDetectLanguage();
    
    // Redirect returning users directly to the app
    const { completedLessons } = useProgressStore.getState();
    if (completedLessons && completedLessons.length > 0) {
      window.location.replace('/learn');
    }
  }, [autoDetectLanguage]);

  // Optionally return null or a loader until mounted to avoid hydration errors
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800">
      <LandingHeader />
      <LandingHero />
      <LandingShowcase />
      <LandingMetrics />
      <LandingFeatures />
      <LandingCTAAndFooter />
    </div>
  );
}
