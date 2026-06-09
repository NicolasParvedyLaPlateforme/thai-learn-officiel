'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, MessageCircle, Brain, Search, ChevronUp, Pencil, Mic, Wand2, GraduationCap, RotateCcw } from 'lucide-react';
import { m as motion , AnimatePresence } from "motion/react";
import { useProgressStore } from '../lib/store';
import { useGlobalSuggestedLesson } from '../lib/useGlobalSuggestedLesson';
import { useTranslation, getTranslation } from '../hooks/useTranslation';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useProgressStore();
  const globalSuggested = useGlobalSuggestedLesson();

  const [mounted, setMounted] = useState(false);
  const [activePopover, setActivePopover] = useState<'learn' | 'practice' | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Define visibility logic
  const isLearnActive = pathname === '/learn';
  const isAlphabetActive = pathname === '/alphabet';
  const isConversationsActive = pathname === '/conversations';
  const isPracticeActive = pathname === '/practice';
  const isDetectiveActive = pathname === '/detective';
  
  const isLearnOrAlphabetActive = isLearnActive || isAlphabetActive;

  // We show BottomNav if we are on any of these main paths
  const isVisible = isLearnActive || isAlphabetActive || isConversationsActive || isPracticeActive || isDetectiveActive;

  if (!isVisible || !mounted) return null;

  const getHrefWithHash = (basePath: string, type: 'learn' | 'alphabet') => {
    return globalSuggested?.type === type ? `${basePath}#${globalSuggested.id}` : basePath;
  };

  const handleLearnClick = (e: React.MouseEvent) => {
    if (activePopover === 'learn') {
      setActivePopover(null);
      // Double click goes to default learn page? Optional. Let's just toggle popover
      e.preventDefault();
    } else {
      e.preventDefault();
      setActivePopover('learn');
    }
  };

  const handlePracticeClick = (e: React.MouseEvent) => {
    if (activePopover === 'practice') {
      // Allow navigation to /practice on second click
      setActivePopover(null);
    } else {
      e.preventDefault();
      setActivePopover('practice');
    }
  };

  return (
    <>
      <nav ref={navRef} className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex justify-around items-center h-[72px] px-2 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
        
        {/* POPOVERS */}
        <AnimatePresence>
          {activePopover === 'learn' && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-[80px] left-4 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex flex-col gap-1 z-50 w-44 origin-bottom-left"
            >
              <Link href={getHrefWithHash('/learn', 'learn')} onClick={() => setActivePopover(null)} className={`flex items-center gap-3 p-3 rounded-xl transition-colors font-bold text-sm ${isLearnActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                 <BookOpen size={20} className={isLearnActive ? 'text-emerald-500' : 'text-slate-400'} />
                 {t('sidebar.path')}
                 {globalSuggested?.type === 'learn' && !isLearnActive && (
                    <span className="w-2 h-2 bg-amber-400 rounded-full ml-auto"></span>
                 )}
              </Link>
              <Link href={getHrefWithHash('/alphabet', 'alphabet')} onClick={() => setActivePopover(null)} className={`flex items-center gap-3 p-3 rounded-xl transition-colors font-bold text-sm ${isAlphabetActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'}`}>
                 <div className={`w-5 h-5 flex items-center justify-center font-black text-lg ${isAlphabetActive ? 'text-emerald-500' : 'text-slate-400'}`}>A</div>
                 {t('sidebar.alphabet')}
                 {globalSuggested?.type === 'alphabet' && !isAlphabetActive && (
                    <span className="w-2 h-2 bg-amber-400 rounded-full ml-auto"></span>
                 )}
              </Link>
            </motion.div>
          )}

          {activePopover === 'practice' && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-[80px] right-4 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex flex-col gap-1 z-50 w-52 origin-bottom-right"
            >
              <Link href="/practice?action=review" onClick={(e) => {
                 if (pathname === '/practice') {
                    e.preventDefault();
                    window.dispatchEvent(new Event('openReviewModal'));
                 }
                 setActivePopover(null);
              }} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700 font-bold text-sm">
                 <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                   <RotateCcw size={16} className="text-indigo-500" />
                 </div>
                 {getTranslation('auto.review_9', language)}
              </Link>
              <Link href="/review-pairs" onClick={() => setActivePopover(null)} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700 font-bold text-sm">
                 <div className="w-8 h-8 rounded-lg bg-fuchsia-50 flex items-center justify-center shrink-0">
                   <BookOpen size={16} className="text-fuchsia-500" />
                 </div>
                 {getTranslation('auto.pairs', language)}
              </Link>
              <Link href="/practice?action=writing" onClick={(e) => {
                 if (pathname === '/practice') {
                    e.preventDefault();
                    window.dispatchEvent(new Event('openWritingModal'));
                 }
                 setActivePopover(null);
              }} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700 font-bold text-sm">
                 <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                   <Pencil size={16} className="text-sky-500" />
                 </div>
                 {getTranslation('auto.writing', language)}
              </Link>
              <Link href="/practice?action=speaking" onClick={(e) => {
                 if (pathname === '/practice') {
                    e.preventDefault();
                    window.dispatchEvent(new Event('openSpeakingModal'));
                 }
                 setActivePopover(null);
              }} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700 font-bold text-sm">
                 <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                   <Mic size={16} className="text-orange-500" />
                 </div>
                 {getTranslation('auto.speaking', language)}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Apprendre Group */}
        <Link 
          href="/learn" 
          onClick={handleLearnClick}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${isLearnOrAlphabetActive ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="relative flex items-center justify-center">
            <GraduationCap size={24} className={isLearnOrAlphabetActive ? 'fill-emerald-100 mb-1' : 'mb-1'} />
            {globalSuggested && !isLearnOrAlphabetActive && (
              <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-amber-400 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div className="flex items-center gap-0.5 text-[10px] font-bold">
             {language === 'en' ? 'Learn' : 'Apprendre'}
             <ChevronUp size={12} className={`transition-transform duration-200 ${activePopover === 'learn' ? 'rotate-180' : ''}`} />
          </div>
        </Link>

        {/* Separator */}
        <div className="w-px h-8 bg-slate-200 shrink-0"></div>

        {/* 2. Dialogues */}
        <Link href="/conversations" onClick={() => setActivePopover(null)} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isConversationsActive ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
          <MessageCircle size={24} className={isConversationsActive ? 'fill-emerald-100 mb-1' : 'mb-1'} />
          <span className="text-[10px] font-bold">{t('sidebar.dialogs')}</span>
        </Link>

        {/* Separator */}
        <div className="w-px h-8 bg-slate-200 shrink-0"></div>

        {/* 3. Détective */}
        <Link href="/detective" onClick={() => setActivePopover(null)} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isDetectiveActive ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
          <Search size={24} className={isDetectiveActive ? 'fill-emerald-100 mb-1' : 'mb-1'} />
          <span className="text-[10px] font-bold">{t('sidebar.detective')}</span>
        </Link>

        {/* Separator */}
        <div className="w-px h-8 bg-slate-200 shrink-0"></div>

        {/* 4. Pratique Group */}
        <Link 
          href="/practice" 
          onClick={handlePracticeClick}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isPracticeActive ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Brain size={24} className={isPracticeActive ? 'fill-emerald-100 mb-1' : 'mb-1'} />
          <div className="flex items-center gap-0.5 text-[10px] font-bold">
             {t('sidebar.practice')}
             <ChevronUp size={12} className={`transition-transform duration-200 ${activePopover === 'practice' ? 'rotate-180' : ''}`} />
          </div>
        </Link>

      </nav>
    </>
  );
}
