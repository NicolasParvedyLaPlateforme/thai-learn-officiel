'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, MessageCircle, Brain, Globe, Star, Heart, Flame, Search, User, LogOut, Coins, Mic, ChevronUp, Pencil, RotateCcw, GraduationCap } from 'lucide-react';
import { useProgressStore } from '../lib/store';
import { useGlobalSuggestedLesson } from '../lib/useGlobalSuggestedLesson';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation, getTranslation } from '../hooks/useTranslation';

export default function DesktopSidebarLeft() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { language, setLanguage, xp, goldCoins, currentStreak, completedLessons, isExerciseRunning, isMobileSidebarOpen, setMobileSidebarOpen, setShowLanguageModal } = useProgressStore();
  const { t } = useTranslation();
  const globalSuggested = useGlobalSuggestedLesson();

  // Hidden on routes where we don't want the app shell
  const isLearnActive = pathname === '/learn';
  const isAlphabetActive = pathname === '/alphabet';
  const isConversationsActive = pathname === '/conversations';
  const isReviewActive = pathname === '/review';
  const isPairsActive = pathname === '/review-pairs';
  const isPracticeActive = pathname === '/practice';
  const isSpeakActive = pathname === '/speak';
  const isDetectiveActive = pathname.startsWith('/detective');
  
  const [mounted, setMounted] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobileLandscape(window.matchMedia('(max-height: 600px) and (orientation: landscape)').matches);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Decide whether to show navigation
  const isVisible = (isLearnActive || isAlphabetActive || isConversationsActive || isSpeakActive || isReviewActive || isPairsActive || pathname === '/writing' || isPracticeActive || isDetectiveActive) && !isExerciseRunning;

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    learn: true,
    immersion: true,
    practice: true,
  });

  const toggleCategory = (key: string) => {
    setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible || !mounted) return null;

  // Compute a simple level based on completed lessons 
  const userLevel = Math.floor(completedLessons.length / 5) + 1;
  const levelTitle = userLevel < 5 ? t('sidebar.level.beginner') : userLevel < 10 ? t('sidebar.level.intermediate') : t('sidebar.level.advanced');

  const getHrefWithHash = (basePath: string, type: 'learn' | 'alphabet') => {
    return globalSuggested?.type === type ? `${basePath}#${globalSuggested.id}` : basePath;
  };

  return (
    <>
      {/* Spacer for desktop layout so content doesn't get hidden behind absolute sidebar depending on setup we want */}
      <div className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${isMobileLandscape ? 'w-0' : 'w-20 xl:w-64'}`}></div>

      <nav 
        className={`hidden md:flex fixed top-0 left-0 h-screen bg-[#F0FDF4] border-r border-emerald-100 flex-col py-6 transition-all duration-300 ease-in-out z-[70] shadow-sm ${
          isMobileLandscape 
            ? (isMobileSidebarOpen ? 'w-64 px-4 translate-x-0' : 'w-64 px-4 -translate-x-full')
            : 'w-20 px-2 hover:w-64 hover:px-4 xl:w-64 xl:px-4'
        } group`}
      >
        {isMobileLandscape && isMobileSidebarOpen && (
           <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-emerald-100 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
           </button>
        )}
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
            title={t('sidebar.support')}
          >
            <Heart size={16} fill="currentColor" />
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-1 w-full overflow-y-auto hide-scrollbar pb-4">
          <NavCategory 
            title={language === 'en' ? 'Learn' : 'Apprendre'} 
            icon={<GraduationCap size={24} />} 
            isOpen={openCategories.learn} 
            onToggle={() => toggleCategory('learn')}
            isActive={isLearnActive || isAlphabetActive || isSpeakActive}
          >
            <NavItem href={getHrefWithHash('/learn', 'learn')} icon={<BookOpen size={20} />} label={t('sidebar.vocabulary') || 'Vocabulaire'} active={isLearnActive} hasSuggestion={globalSuggested?.type === 'learn' && !isLearnActive} isSubItem />
            <NavItem href={getHrefWithHash('/alphabet', 'alphabet')} icon={<Globe size={20} />} label={t('sidebar.alphabet')} active={isAlphabetActive} hasSuggestion={globalSuggested?.type === 'alphabet' && !isAlphabetActive} isSubItem />
            <NavItem href={getHrefWithHash('/speak', 'speak')} icon={<Mic size={20} />} label={t('sidebar.speaking') || 'Parler'} active={isSpeakActive} isSubItem />
          </NavCategory>

          <NavCategory 
            title={language === 'en' ? 'Immersion' : 'Immersion'} 
            icon={<MessageCircle size={24} />} 
            isOpen={openCategories.immersion} 
            onToggle={() => toggleCategory('immersion')}
            isActive={isConversationsActive || isDetectiveActive}
          >
            <NavItem href="/conversations" icon={<MessageCircle size={20} />} label={t('sidebar.dialogs')} active={isConversationsActive} isSubItem />
            <NavItem href="/detective" icon={<Search size={20} />} label={t('sidebar.detective')} active={isDetectiveActive} isSubItem />
          </NavCategory>

          <NavCategory 
            title={t('sidebar.practice') || 'Pratique'} 
            icon={<Brain size={24} />} 
            isOpen={openCategories.practice} 
            onToggle={() => toggleCategory('practice')}
            isActive={isPracticeActive || isPairsActive || isReviewActive || pathname === '/writing'}
          >
            <NavItem 
              href="/practice?action=review" 
              onClick={(e) => {
                if (pathname === '/practice') {
                   e.preventDefault();
                   window.dispatchEvent(new Event('openReviewModal'));
                }
              }}
              icon={<RotateCcw size={20} />} 
              label={getTranslation('auto.review_9', language) || 'Rappel'} 
              active={isPracticeActive && !pathname.includes('writing') && !pathname.includes('speaking')} 
              isSubItem 
            />
            <NavItem href="/review-pairs" icon={<BookOpen size={20} />} label={getTranslation('auto.pairs', language) || 'Paires'} active={isPairsActive} isSubItem />
            <NavItem 
              href="/practice?action=writing" 
              onClick={(e) => {
                if (pathname === '/practice') {
                   e.preventDefault();
                   window.dispatchEvent(new Event('openWritingModal'));
                }
              }}
              icon={<Pencil size={20} />} 
              label={getTranslation('auto.writing', language) || 'Écriture'} 
              active={pathname === '/writing' || (isPracticeActive && typeof window !== 'undefined' && window.location.search.includes('writing'))} 
              isSubItem 
            />
            <NavItem 
              href="/practice?action=speaking" 
              onClick={(e) => {
                if (pathname === '/practice') {
                   e.preventDefault();
                   window.dispatchEvent(new Event('openSpeakingModal'));
                }
              }}
              icon={<Mic size={20} />} 
              label={getTranslation('auto.speaking', language) || 'Parler'} 
              active={isPracticeActive && typeof window !== 'undefined' && window.location.search.includes('speaking')} 
              isSubItem 
            />
          </NavCategory>
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

            <div className="bg-yellow-100 text-yellow-600 font-bold rounded-xl shadow-sm h-10 flex-1 flex items-center justify-center whitespace-nowrap px-0 group-hover:px-2 xl:px-2 overflow-hidden border border-yellow-200 relative group/stat">
              <span className="transition-all duration-300 opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto flex items-center gap-1.5 text-sm">
                <Coins size={16} fill="currentColor" />
                {goldCoins || 0}
              </span>
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 xl:opacity-0 pointer-events-none">
                 <Coins size={20} fill="currentColor" />
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
            onClick={() => setShowLanguageModal(true)}
            className="mt-2 w-full h-10 flex items-center justify-center rounded-xl font-bold border-2 border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition-colors shadow-sm overflow-hidden px-0 group-hover:px-3 xl:px-3"
            title={t('sidebar.language')}
          >
            <span className="transition-all duration-300 overflow-hidden opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto mr-0 group-hover:mr-2 xl:mr-2 text-sm whitespace-nowrap">
              {t('sidebar.language')}
            </span>
            <div className="flex items-center justify-center shrink-0 w-6 h-6 bg-slate-200 text-slate-700 rounded text-xs uppercase">
              {language}
            </div>
          </button>

          {/* User Account / Auth */}
          <div className="mt-2 w-full pt-2 border-t border-emerald-200/60">
            {status === 'loading' ? (
              <div className="h-10 w-full animate-pulse bg-slate-200 rounded-xl" />
            ) : session?.user ? (
              <div className="flex items-center justify-between gap-2 w-full group-hover:px-2 xl:px-2 transition-all">
                <Link href="/profile" className="flex items-center gap-2 overflow-hidden flex-1 opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto transition-all duration-300 hover:opacity-80">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                    {session.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 truncate">
                    {session.user.name}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    useProgressStore.getState().resetProgress();
                    signOut();
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 mx-auto group-hover:mx-0 xl:mx-0"
                  title={t('sidebar.logout')}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="w-full h-10 flex items-center justify-center rounded-xl font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors px-0 group-hover:px-3 xl:px-3"
              >
                <div className="shrink-0 flex items-center justify-center w-6 h-6 transition-transform duration-300 relative">
                  <User size={20} />
                </div>
                <span className="transition-all duration-300 overflow-hidden opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto ml-0 group-hover:ml-2 xl:ml-2 text-sm whitespace-nowrap">
                  {t('sidebar.login')}
                </span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

function NavCategory({ title, icon, isOpen, onToggle, isActive, children }: any) {
  return (
    <div className="flex flex-col w-full mb-1">
      <button 
        onClick={onToggle}
        className={`flex items-center rounded-xl transition-all h-10 overflow-hidden w-12 mx-auto justify-center group-hover:w-full group-hover:justify-start group-hover:px-4 group-hover:gap-3 xl:gap-3 xl:w-full xl:justify-start xl:px-4 hover:bg-emerald-50 cursor-pointer ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
      >
        <div className="shrink-0 flex items-center justify-center w-6 h-6 transition-transform duration-300 relative">
          {icon}
        </div>
        <div className="flex items-center justify-between flex-1 transition-all duration-300 overflow-hidden opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto whitespace-nowrap">
          <span className="font-bold text-xs tracking-wider uppercase">
            {title}
          </span>
          <ChevronUp size={16} className={`transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
        </div>
      </button>
      
      <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active, hasSuggestion, isSubItem, onClick }: { href: string, icon: React.ReactNode, label: string, active: boolean, hasSuggestion?: boolean, isSubItem?: boolean, onClick?: (e: any) => void }) {
  const { t } = useTranslation();
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center rounded-xl transition-all overflow-hidden mx-auto justify-center 
        ${isSubItem 
          ? 'h-10 w-10 group-hover:w-full group-hover:justify-start group-hover:px-4 group-hover:gap-3 xl:gap-3 xl:w-full xl:justify-start xl:px-4 group-hover:pl-10 xl:pl-10' 
          : 'h-12 w-12 group-hover:w-full group-hover:justify-start group-hover:px-4 group-hover:gap-4 xl:gap-4 xl:w-full xl:justify-start xl:px-4'} 
        ${active ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-600 font-medium hover:bg-emerald-50 hover:text-emerald-700'}`}
    >
      <div className={`shrink-0 flex items-center justify-center transition-transform duration-300 relative ${isSubItem ? 'w-5 h-5' : 'w-6 h-6'} ${active ? 'scale-110 group-hover:scale-100 xl:scale-100' : ''}`}>
        {icon}
        {hasSuggestion && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-white rounded-full"></span>
        )}
      </div>
      <span className={`transition-all duration-300 overflow-hidden opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto whitespace-nowrap ${isSubItem ? 'text-sm' : ''}`}>
        {label}
        {hasSuggestion && (
           <span className="bg-amber-400 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ml-2">
              {t('sidebar.suggested')}
           </span>
        )}
      </span>
    </Link>
  );
}
