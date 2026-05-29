'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, MessageCircle, Brain, Globe, Star, Heart, Flame } from 'lucide-react';
import { useProgressStore } from '../lib/store';
import { useGlobalSuggestedLesson } from '../lib/useGlobalSuggestedLesson';

export default function DesktopSidebarLeft() {
  const pathname = usePathname();
  const { language, setLanguage, xp, currentStreak, completedLessons, isExerciseRunning } = useProgressStore();
  const globalSuggested = useGlobalSuggestedLesson();

  // Hidden on routes where we don't want the app shell
  const isLearnActive = pathname === '/learn';
  const isAlphabetActive = pathname === '/alphabet';
  const isConversationsActive = pathname === '/conversations';
  const isReviewActive = pathname === '/review';
  const isPairsActive = pathname === '/review-pairs';
  const isPracticeActive = pathname === '/practice';
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Decide whether to show navigation
  const isVisible = (isLearnActive || isAlphabetActive || isConversationsActive || isReviewActive || isPairsActive || pathname === '/writing' || isPracticeActive) && !isExerciseRunning;

  if (!isVisible || !mounted) return null;

  // Compute a simple level based on completed lessons 
  const userLevel = Math.floor(completedLessons.length / 5) + 1;
  const levelTitle = userLevel < 5 ? (language === 'en' ? 'Beginner' : 'Débutant') : userLevel < 10 ? 'Intermediate' : 'Advanced';

  const getHrefWithHash = (basePath: string, type: 'learn' | 'alphabet') => {
    return globalSuggested?.type === type ? `${basePath}#${globalSuggested.id}` : basePath;
  };

  return (
    <>
      {/* Spacer for desktop layout so content doesn't get hidden behind absolute sidebar depending on setup we want */}
      <div className="hidden md:block w-20 xl:w-64 shrink-0 transition-all duration-300 ease-in-out"></div>

      <nav 
        className="hidden md:flex fixed top-0 left-0 h-screen bg-[#F0FDF4] border-r border-emerald-100 flex-col py-6 transition-all duration-300 ease-in-out z-50 shadow-sm w-20 px-2 hover:w-64 hover:px-4 xl:w-64 xl:px-4 group"
      >
        <div className="flex items-center gap-2 mb-10 overflow-hidden shrink-0 px-2 justify-center group-hover:justify-start xl:justify-start relative">
          <div className="bg-emerald-500 text-white p-2 rounded-xl shrink-0 absolute left-1/2 -translate-x-1/2 transition-all duration-300 xl:translate-x-0 xl:relative xl:left-auto group-hover:translate-x-0 group-hover:relative group-hover:left-auto">
            <BookOpen size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight whitespace-nowrap transition-opacity duration-300 opacity-0 group-hover:opacity-100 xl:opacity-100 xl:ml-1 group-hover:ml-1">
            ThaiLearn
          </h1>
          <button 
            onClick={() => useProgressStore.getState().setShowCommunityModal(true)}
            className="text-rose-500 bg-rose-50 p-1.5 rounded-full hover:bg-rose-100 transition-all opacity-0 w-0 md:group-hover:opacity-100 md:group-hover:w-auto xl:opacity-100 xl:w-auto ml-1 shrink-0"
            title="Soutien & Communauté"
          >
            <Heart size={16} fill="currentColor" />
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-1 w-full">
          <NavItem href={getHrefWithHash('/learn', 'learn')} icon={<BookOpen size={24} />} label={language === 'en' ? 'Path' : 'Parcours'} active={isLearnActive} hasSuggestion={globalSuggested?.type === 'learn' && !isLearnActive} />
          <NavItem href={getHrefWithHash('/alphabet', 'alphabet')} icon={<Globe size={24} />} label="Alphabet" active={isAlphabetActive} hasSuggestion={globalSuggested?.type === 'alphabet' && !isAlphabetActive} />
          <NavItem href="/conversations" icon={<MessageCircle size={24} />} label={language === 'en' ? 'Dialogs' : 'Dialogues'} active={isConversationsActive} />
          <NavItem href="/practice" icon={<Brain size={24} />} label={language === 'en' ? 'Practice' : 'Pratique'} active={isPracticeActive} />
        </div>

        {/* User Summary / Level */}
        <div className="mt-auto shrink-0 border-t border-emerald-200/60 pt-6 overflow-hidden flex flex-col items-center gap-3 px-0 group-hover:px-2 xl:px-2 transition-all">
          
          <div className="flex gap-2 w-full justify-center group-hover:justify-start xl:justify-start transition-all">
            <div className="bg-amber-100 text-amber-600 font-bold rounded-xl shadow-sm h-10 flex-1 flex items-center justify-center whitespace-nowrap px-0 group-hover:px-2 xl:px-2 overflow-hidden border border-amber-200 relative group/stat">
              <span className="transition-all duration-300 opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto flex items-center gap-1.5 text-sm">
                <Star size={16} fill="currentColor" />
                {xp}
              </span>
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 xl:opacity-0 pointer-events-none">
                 <Star size={20} fill="currentColor" />
              </div>
            </div>
            
            <div className="bg-orange-100 text-orange-500 font-bold rounded-xl shadow-sm h-10 flex-1 flex items-center justify-center whitespace-nowrap px-0 group-hover:px-2 xl:px-2 overflow-hidden border border-orange-200 relative group/stat">
              <span className="transition-all duration-300 opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto flex items-center gap-1.5 text-sm">
                <Flame size={16} fill="currentColor" className={`${currentStreak > 0 ? 'text-orange-500' : 'text-slate-400 opacity-50'}`} />
                <span className={`${currentStreak > 0 ? '' : 'text-slate-400 opacity-50'}`}>{currentStreak}</span>
              </span>
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 xl:opacity-0 pointer-events-none">
                 <Flame size={20} fill="currentColor" className={`${currentStreak > 0 ? 'text-orange-500' : 'text-slate-400 opacity-50'}`} />
              </div>
            </div>
          </div>

          <button 
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="mt-2 w-full h-10 flex items-center justify-center rounded-xl font-bold border-2 border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition-colors shadow-sm overflow-hidden px-0 group-hover:px-3 xl:px-3"
            title={language === 'fr' ? "Switch to English" : "Passer en Français"}
          >
            <span className="transition-all duration-300 overflow-hidden opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto mr-0 group-hover:mr-2 xl:mr-2 text-sm whitespace-nowrap">
              {language === 'fr' ? 'Langue' : 'Language'}
            </span>
            <div className="flex items-center justify-center shrink-0 w-6 h-6 bg-slate-200 text-slate-700 rounded text-xs">
              {language === 'fr' ? 'FR' : 'EN'}
            </div>
          </button>
        </div>
      </nav>
    </>
  );
}

function NavItem({ href, icon, label, active, hasSuggestion }: { href: string, icon: React.ReactNode, label: string, active: boolean, hasSuggestion?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center rounded-xl transition-all h-12 overflow-hidden w-12 mx-auto justify-center group-hover:w-full group-hover:justify-start group-hover:px-4 group-hover:gap-4 xl:gap-4 xl:w-full xl:justify-start xl:px-4 ${active ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600 font-medium hover:bg-emerald-50 hover:text-emerald-700'}`}
    >
      <div className={`shrink-0 flex items-center justify-center w-6 h-6 transition-transform duration-300 relative ${active ? 'scale-110 group-hover:scale-100 xl:scale-100' : ''}`}>
        {icon}
        {hasSuggestion && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-white rounded-full"></span>
        )}
      </div>
      <span className="whitespace-nowrap flex-1 transition-all duration-300 overflow-hidden opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto flex items-center justify-between">
        {label}
        {hasSuggestion && (
           <span className="bg-amber-400 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ml-2">
              Suggéré
           </span>
        )}
      </span>
    </Link>
  );
}
