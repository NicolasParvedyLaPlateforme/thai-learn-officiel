'use client';

import dynamic from 'next/dynamic';
import Loading from '@/app/alphabet/loading';

const AlphabetClientPage = dynamic(() => import('./AlphabetClientPage'), {
  ssr: false,
  loading: () => <Loading />
});

export default function AlphabetClientWrapper({ lightweightLessons }: { lightweightLessons: any[] }) {
  return <AlphabetClientPage lightweightLessons={lightweightLessons} />;
}
