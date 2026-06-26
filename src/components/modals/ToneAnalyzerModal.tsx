'use client';

import React, { useEffect } from 'react';
import { useProgressStore } from "@/lib/store";
import { ToneAnalyzerContent } from '../tone-analyzer/ToneAnalyzerContent';
import { ResponsiveModal } from '../ui/ResponsiveModal';

export function ToneAnalyzerModal() {
  const { toneAnalyzerModalWord, setToneAnalyzerModalWord } = useProgressStore();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setToneAnalyzerModalWord(null);
      }
    };
    if (toneAnalyzerModalWord) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toneAnalyzerModalWord, setToneAnalyzerModalWord]);

  return (
    <ResponsiveModal
      isOpen={!!toneAnalyzerModalWord}
      onClose={() => setToneAnalyzerModalWord(null)}
    >
      {/* Wrapper to maintain the specific background color from original design */}
      <div className="bg-[#F5F7FA] -m-6 p-6 sm:rounded-3xl">
        <ToneAnalyzerContent
          initialWord={toneAnalyzerModalWord || ''}
          isModal={true}
          onClose={() => setToneAnalyzerModalWord(null)}
        />
      </div>
    </ResponsiveModal>
  );
}