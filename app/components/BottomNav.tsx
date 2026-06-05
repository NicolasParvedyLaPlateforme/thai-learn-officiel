'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, MessageCircle, Brain, Search } from 'lucide-react';
import { useProgressStore } from '../lib/store';
import { useGlobalSuggestedLesson } from '../lib/useGlobalSuggestedLesson';
import { useTranslation } from '../hooks/useTranslation';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const globalSuggested = useGlobalSuggestedLesson();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Define visibility logic
  const isLearnActive = pathname === '/learn';
  const isAlphabetActive = pathname === '/alphabet';
  const isConversationsActive = pathname === '/conversations';
  const isPracticeActive = pathname === '/practice';
  const isDetectiveActive = pathname.startsWith('/detective');
  
  const isVisible = isLearnActive || isAlphabetActive || isConversationsActive || isPracticeActive || isDetectiveActive;

  if (!isVisible || !mounted) return null;

  const getHrefWithHash = (basePath: string, type: 'learn' | 'alphabet') => {
    return globalSuggested?.type === type ? `${basePath}#${globalSuggested.id}` : basePath;
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex justify-around items-center h-[72px]">
        <Link href={getHrefWithHash('/learn', 'learn')} className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${isLearnActive ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className="relative">
            <BookOpen size={24} className={isLearnActive ? 'fill-emerald-100 mb-1' : 'mb-1'} />
            {globalSuggested?.type === 'learn' && !isLearnActive && (
              <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-amber-400 border-2 border-white rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] font-bold">{t('sidebar.path')}</span>
        </Link>
        <Link href={getHrefWithHash('/alphabet', 'alphabet')} className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${isAlphabetActive ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className="relative">
            <div className="w-6 h-6 flex items-center justify-center font-black text-xl mb-1">A</div>
            {globalSuggested?.type === 'alphabet' && !isAlphabetActive && (
              <span className="absolute -top-0 -right-1.5 w-3 h-3 bg-amber-400 border-2 border-white rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] font-bold">{t('sidebar.alphabet')}</span>
        </Link>
        <Link href="/conversations" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isConversationsActive ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
          <MessageCircle size={24} className={isConversationsActive ? 'fill-emerald-100 mb-1' : 'mb-1'} />
          <span className="text-[10px] font-bold">{t('sidebar.dialogs')}</span>
        </Link>
        <Link href="/detective" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isDetectiveActive ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
          <Search size={24} className={isDetectiveActive ? 'fill-emerald-100 mb-1' : 'mb-1'} />
          <span className="text-[10px] font-bold">{t('sidebar.detective')}</span>
        </Link>
        <Link href="/practice" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isPracticeActive ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
          <Brain size={24} className={isPracticeActive ? 'fill-emerald-100 mb-1' : 'mb-1'} />
          <span className="text-[10px] font-bold">{t('sidebar.practice')}</span>
        </Link>
      </nav>
    </>
  );
}
