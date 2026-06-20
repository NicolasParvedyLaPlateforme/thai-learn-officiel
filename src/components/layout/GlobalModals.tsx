'use client';

import dynamic from 'next/dynamic';

const CommunityModal = dynamic(() => import('../modals/CommunityModal').then(m => m.CommunityModal), { ssr: false });
const LanguageSelectorModal = dynamic(() => import('../modals/LanguageSelectorModal').then(m => m.LanguageSelectorModal), { ssr: false });
const GoldConversionModal = dynamic(() => import('../modals/GoldConversionModal').then(m => m.GoldConversionModal), { ssr: false });
const ToneAnalyzerModal = dynamic(() => import('../modals/ToneAnalyzerModal').then(m => m.ToneAnalyzerModal), { ssr: false });

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
