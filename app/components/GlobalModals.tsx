'use client';

import dynamic from 'next/dynamic';

const CommunityModal = dynamic(() => import('./CommunityModal').then(m => m.CommunityModal), { ssr: false });
const LanguageSelectorModal = dynamic(() => import('./LanguageSelectorModal').then(m => m.LanguageSelectorModal), { ssr: false });
const GoldConversionModal = dynamic(() => import('./GoldConversionModal').then(m => m.GoldConversionModal), { ssr: false });
const ToneAnalyzerModal = dynamic(() => import('./ToneAnalyzerModal').then(m => m.ToneAnalyzerModal), { ssr: false });

export default function GlobalModals() {
  return (
    <>
      <CommunityModal />
      <LanguageSelectorModal />
      <GoldConversionModal />
      <ToneAnalyzerModal />
    </>
  );
}
