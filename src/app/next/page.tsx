import { Suspense } from 'react';
import NextClientPage from '@/components/next/NextClientPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mode Automatique — ThaiLearn',
  description: 'Lance automatiquement la prochaine leçon optimale de la journée.',
};

export default function NextPage() {
  return (
    <Suspense fallback={null}>
      <NextClientPage />
    </Suspense>
  );
}
