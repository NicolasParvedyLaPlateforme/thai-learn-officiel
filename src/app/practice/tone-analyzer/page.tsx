'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ToneAnalyzerContent } from "@/components/tone-analyzer/ToneAnalyzerContent";

function ToneAnalyzerPageContent() {
  const searchParams = useSearchParams();
  const initialWord = searchParams.get('word') || '';

  return <ToneAnalyzerContent initialWord={initialWord} isModal={false} />;
}

export default function ToneAnalyzerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">Loading...</div>}>
      <ToneAnalyzerPageContent />
    </Suspense>
  );
}
