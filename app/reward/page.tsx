import { Suspense } from 'react';
import RewardClient from './RewardClient';

export default function RewardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold">Chargement...</div>}>
      <RewardClient />
    </Suspense>
  );
}
