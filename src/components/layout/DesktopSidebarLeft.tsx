'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, MessageCircle, Brain, Globe, Star, Heart, Flame, Search, User, LogOut, Coins, Mic, ChevronUp, Pencil, RotateCcw, GraduationCap } from 'lucide-react';
import { useProgressStore } from "@/lib/store";
import { useGlobalSuggestedLesson } from "@/hooks/useGlobalSuggestedLesson";
import { useSession, signOut } from 'next-auth/react';
import { useTranslation, getTranslation } from "@/hooks/useTranslation";

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

  const isLearnCategoryActive = isLearnActive || isAlphabetActive || isSpeakActive;
  const isImmersionCategoryActive = isConversationsActive || isDetectiveActive;
  const isPracticeCategoryActive = isPracticeActive || isPairsActive || isReviewActive || pathname === '/writing';

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    learn: isLearnCategoryActive,
    immersion: isImmersionCategoryActive,
    practice: isPracticeCategoryActive,
  });

  useEffect(() => {
    setOpenCategories({
      learn: isLearnCategoryActive,
      immersion: isImmersionCategoryActive,
      practice: isPracticeCategoryActive,
    });
  }, [pathname, isLearnCategoryActive, isImmersionCategoryActive, isPracticeCategoryActive]);

  const toggleCategory = (key: string) => {
    setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible || !mounted) return null;

  // Compute a simple level based on completed lessons 
  const userLevel = Math.floor(completedLessons.length / 5) + 1;
  const levelTitle = userLevel < 5 ? t('sidebar.level.beginner') : userLevel < 10 ? t('sidebar.level.intermediate') : t('sidebar.level.advanced');

  const getHrefWithHash = (basePath: string, type: 'learn' | 'alphabet' | 'speak') => {
    return globalSuggested?.type === type ? `${basePath}#${globalSuggested.id}` : basePath;
  };

  return (
    <>
      {/* Spacer for desktop layout so content doesn't get hidden behind absolute sidebar depending on setup we want */}
      <div id="desktop-sidebar-spacer" className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${isMobileLandscape ? 'w-0' : 'w-20 xl:w-64'}`}></div>

      <nav 
        id="desktop-sidebar-nav"
        className={`hidden md:flex fixed top-0 left-0 h-screen bg-slate-50 border-r border-slate-200/60 flex-col py-6 transition-all duration-300 ease-in-out z-[70] ${
          isMobileLandscape 
            ? (isMobileSidebarOpen ? 'w-64 px-2 translate-x-0' : 'w-64 px-2 -translate-x-full')
            : 'w-20 px-2 hover:w-64 xl:w-64'
        } group`}
      >
        {isMobileLandscape && isMobileSidebarOpen && (
           <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-200 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
           </button>
        )}
        <div className="flex items-center gap-2 mb-10 shrink-0 px-2 justify-center group-hover:justify-start xl:justify-start relative">
          <div className="bg-emerald-500 text-white p-2 rounded-xl shrink-0 absolute left-1/2 -translate-x-1/2 transition-all duration-300 xl:translate-x-0 xl:relative xl:left-auto group-hover:translate-x-0 group-hover:relative group-hover:left-auto">
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 whitespace-nowrap transition-opacity duration-300 opacity-0 group-hover:opacity-100 xl:opacity-100 xl:ml-1 group-hover:ml-1">
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
            title={t('sidebar.category.learn') || 'Apprendre'} 
            icon={<GraduationCap size={24} strokeWidth={2.5} />} 
            isOpen={openCategories.learn} 
            onToggle={() => toggleCategory('learn')}
            isActive={isLearnCategoryActive}
          >
            <NavItem href={getHrefWithHash('/learn', 'learn')} icon={<BookOpen size={20} strokeWidth={2.5} />} label={t('sidebar.vocabulary') || 'Vocabulaire'} active={isLearnActive} hasSuggestion={globalSuggested?.type === 'learn' && !isLearnActive} isSubItem />
            <NavItem href={getHrefWithHash('/alphabet', 'alphabet')} icon={<Globe size={20} strokeWidth={2.5} />} label={t('sidebar.alphabet')} active={isAlphabetActive} hasSuggestion={globalSuggested?.type === 'alphabet' && !isAlphabetActive} isSubItem />
            <NavItem href={getHrefWithHash('/speak', 'speak')} icon={<Mic size={20} strokeWidth={2.5} />} label={t('sidebar.speaking') || 'Parler'} active={isSpeakActive} isSubItem />
          </NavCategory>

          <NavCategory 
            title={t('sidebar.category.immersion') || 'Immersion'} 
            icon={<MessageCircle size={24} strokeWidth={2.5} />} 
            isOpen={openCategories.immersion} 
            onToggle={() => toggleCategory('immersion')}
            isActive={isImmersionCategoryActive}
          >
            <NavItem href="/conversations" icon={<MessageCircle size={20} strokeWidth={2.5} />} label={t('sidebar.dialogs')} active={isConversationsActive} isSubItem />
            <NavItem href="/detective" icon={<Search size={20} strokeWidth={2.5} />} label={t('sidebar.detective')} active={isDetectiveActive} isSubItem />
          </NavCategory>

          <NavCategory 
            title={t('sidebar.practice') || 'Pratique'} 
            icon={<Brain size={24} strokeWidth={2.5} />} 
            isOpen={openCategories.practice} 
            onToggle={() => toggleCategory('practice')}
            isActive={isPracticeCategoryActive}
          >
            <NavItem 
              href="/practice?action=review" 
              onClick={(e) => {
                if (pathname === '/practice') {
                   e.preventDefault();
                   window.dispatchEvent(new Event('openReviewModal'));
                }
              }}
              icon={<RotateCcw size={20} strokeWidth={2.5} />} 
              label={getTranslation('auto.review_9', language) || 'Rappel'} 
              active={isPracticeActive && !pathname.includes('writing') && !pathname.includes('speaking')} 
              isSubItem 
            />
            <NavItem href="/review-pairs" icon={<BookOpen size={20} strokeWidth={2.5} />} label={getTranslation('auto.pairs', language) || 'Paires'} active={isPairsActive} isSubItem />
            <NavItem 
              href="/practice?action=writing" 
              onClick={(e) => {
                if (pathname === '/practice') {
                   e.preventDefault();
                   window.dispatchEvent(new Event('openWritingModal'));
                }
              }}
              icon={<Pencil size={20} strokeWidth={2.5} />} 
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
              icon={<Mic size={20} strokeWidth={2.5} />} 
              label={getTranslation('auto.speaking', language) || 'Parler'} 
              active={isPracticeActive && typeof window !== 'undefined' && window.location.search.includes('speaking')} 
              isSubItem 
            />
          </NavCategory>
        </div>

        {/* User Summary / Level */}
        <div className="mt-auto shrink-0 pt-4 overflow-hidden flex flex-col items-center gap-3 w-full px-2">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col w-full overflow-hidden transition-all duration-300">
            <div className="flex gap-1 w-full justify-center transition-all bg-transparent p-2">
              {/* XP */}
              <div className="flex-1 flex justify-center items-center h-10 rounded-xl hover:bg-amber-50 text-amber-500 font-extrabold transition-colors cursor-pointer relative group/stat" title="XP">
                <span className="transition-all duration-300 opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto flex items-center gap-1.5 text-[15px]">
                  <Star size={18} className="fill-amber-400 text-amber-400 drop-shadow-sm" />
                  <span>{xp >= 10000 ? (xp / 1000).toFixed(1) + 'k' : xp}</span>
                </span>
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 xl:opacity-0 pointer-events-none">
                  <Star size={20} className="fill-amber-400 text-amber-400 drop-shadow-sm" />
                </div>
              </div>

              <div className="w-[1px] h-6 bg-slate-100 my-auto rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 xl:opacity-100"></div>

              {/* Coins */}
              <div className="flex-1 flex justify-center items-center h-10 rounded-xl hover:bg-yellow-50 text-yellow-500 font-extrabold transition-colors cursor-pointer relative group/stat" title="Pièces">
                <span className="transition-all duration-300 opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto flex items-center gap-1.5 text-[15px]">
                  <Coins size={18} className="fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                  <span>{goldCoins >= 10000 ? (goldCoins / 1000).toFixed(1) + 'k' : (goldCoins || 0)}</span>
                </span>
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 xl:opacity-0 pointer-events-none">
                  <Coins size={20} className="fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                </div>
              </div>

              <div className="w-[1px] h-6 bg-slate-100 my-auto rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 xl:opacity-100"></div>
              
              {/* Streak */}
              <div className="flex-1 flex justify-center items-center h-10 rounded-xl hover:bg-orange-50 text-orange-500 font-extrabold transition-colors cursor-pointer relative group/stat" title="Série">
                <span className="transition-all duration-300 opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto flex items-center gap-1.5 text-[15px]">
                  <Flame size={18} className={`${currentStreak > 0 ? 'fill-orange-500 text-orange-500 drop-shadow-sm' : 'text-slate-300 fill-slate-200'}`} />
                  <span className={`${currentStreak > 0 ? '' : 'text-slate-400'}`}>{currentStreak}</span>
                </span>
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 xl:opacity-0 pointer-events-none">
                  <Flame size={20} className={`${currentStreak > 0 ? 'fill-orange-500 text-orange-500 drop-shadow-sm' : 'text-slate-300 fill-slate-200'}`} />
                </div>
              </div>
            </div>

            <div className="w-full h-[1px] bg-slate-100 transition-all duration-300 opacity-0 group-hover:opacity-100 xl:opacity-100"></div>

            {/* Language Button */}
            <button 
              onClick={() => setShowLanguageModal(true)}
              className="w-full h-10 flex items-center justify-center font-bold bg-transparent hover:bg-slate-50 text-slate-500 transition-all px-0 group-hover:px-4 xl:px-4 relative group/lang"
              title={t('sidebar.language')}
            >
              <span className="transition-all duration-300 overflow-hidden opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto flex items-center justify-center gap-3 text-sm whitespace-nowrap w-full">
                <div className="text-slate-400 text-xs uppercase font-black tracking-widest">
                  {language.substring(0,2)}
                </div>
                <span className="uppercase tracking-widest text-[11px] text-slate-400 font-bold">{t('sidebar.language')}</span>
              </span>
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 xl:opacity-0 pointer-events-none">
                <div className="text-slate-400 text-xs uppercase font-black tracking-widest">
                  {language.substring(0,2)}
                </div>
              </div>
            </button>

            <div className="w-full h-[1px] bg-slate-100 transition-all duration-300 opacity-0 group-hover:opacity-100 xl:opacity-100"></div>

            {/* User Account / Auth */}
            <div className="w-full">
              {status === 'loading' ? (
                <div className="h-12 w-full animate-pulse bg-slate-50" />
              ) : session?.user ? (
                <div className="flex items-center justify-between gap-2 w-full group-hover:px-2 xl:px-2 transition-all h-14">
                  <Link href="/profile" className="flex items-center gap-2 overflow-hidden flex-1 opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto transition-all duration-300 hover:opacity-80">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0 text-sm">
                      {session.user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-[13px] font-bold text-slate-700 truncate">
                      {session.user.name}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      useProgressStore.getState().resetProgress();
                      signOut();
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 mx-auto group-hover:mx-0 xl:mx-0 transition-colors"
                    title={t('sidebar.logout')}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login"
                  className="w-full h-14 flex items-center justify-center font-bold bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors px-0 group-hover:px-3 xl:px-3"
                >
                  <div className="shrink-0 flex items-center justify-center w-6 h-6 transition-transform duration-300 relative">
                    <User size={18} />
                  </div>
                  <span className="transition-all duration-300 overflow-hidden opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto ml-0 group-hover:ml-3 xl:ml-3 text-[13px] whitespace-nowrap">
                    {t('sidebar.login')}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function NavCategory({ title, icon, isOpen, onToggle, isActive, children }: any) {
  return (
    <div className="flex flex-col w-full mb-1 px-2">
      <button 
        onClick={onToggle}
        className={`flex items-center rounded-xl transition-all h-10 overflow-hidden w-12 mx-auto justify-center group-hover:w-full group-hover:justify-start group-hover:px-3 group-hover:gap-3 xl:gap-3 xl:w-full xl:justify-start xl:px-3 cursor-pointer hover:bg-slate-50 ${isActive ? 'text-slate-700' : 'text-slate-500'}`}
      >
        <div className="shrink-0 flex items-center justify-center w-6 h-6 transition-transform duration-300 relative">
          {icon}
        </div>
        <div className="flex items-center justify-between flex-1 transition-all duration-300 overflow-hidden opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto whitespace-nowrap">
          <span className="font-bold text-[11px] tracking-widest uppercase text-slate-400">
            {title}
          </span>
          <ChevronUp size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
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
      className={`flex items-center rounded-xl transition-all overflow-hidden mx-auto justify-center relative
        ${isSubItem 
          ? 'h-10 w-10 group-hover:w-full group-hover:justify-start group-hover:px-3 group-hover:gap-3 xl:gap-3 xl:w-full xl:justify-start xl:px-3 group-hover:pl-9 xl:pl-9' 
          : 'h-12 w-12 group-hover:w-full group-hover:justify-start group-hover:px-3 group-hover:gap-3 xl:gap-3 xl:w-full xl:justify-start xl:px-3'} 
        ${active ? 'text-emerald-600 font-bold bg-transparent' : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-700'}`}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-emerald-500 rounded-r-full"></div>
      )}
      <div className={`shrink-0 flex items-center justify-center transition-transform duration-300 relative ${isSubItem ? 'w-5 h-5' : 'w-6 h-6'} ${active ? 'scale-105' : ''}`}>
        {icon}
        {hasSuggestion && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-white rounded-full"></span>
        )}
      </div>
      <span className={`transition-all duration-300 overflow-hidden opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto xl:opacity-100 xl:w-auto whitespace-nowrap ${isSubItem ? 'text-[14px]' : 'text-[15px]'}`}>
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
