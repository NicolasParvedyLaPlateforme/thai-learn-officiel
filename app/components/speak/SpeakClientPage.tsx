'use client';

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useProgressStore } from '../../lib/store';
import BASE_UNITS from '../../data/speak_units.json';
import { useGlobalSuggestedLesson } from '../../lib/useGlobalSuggestedLesson';

import dynamic from 'next/dynamic';

const WritingConfigModal = dynamic(() => import('../modals/WritingConfigModal').then(mod => mod.WritingConfigModal), { ssr: false });
const DesktopSidebarRight = dynamic(() => import('../layout/DesktopSidebarRight').then(mod => mod.DesktopSidebarRight), { 
  ssr: false,
  loading: () => (
    <div className="hidden xl:flex w-80 shrink-0 flex-col gap-6 sticky top-8">
       <div className="w-full h-40 bg-slate-200 rounded-[24px] animate-pulse" />
       <div className="w-full h-64 bg-slate-200 rounded-[24px] animate-pulse" />
    </div>
  )
});
const MobileHeaderMenu = dynamic(() => import('../layout/MobileHeaderMenu').then(mod => mod.MobileHeaderMenu), { ssr: false });

import SpeakMobileHeader from './SpeakMobileHeader';
import SpeakMobileTimeline from './SpeakMobileTimeline';
import SpeakDesktopTimeline from './SpeakDesktopTimeline';
import { DesktopLessonLevelsView } from '../learn/DesktopLessonLevelsView';

const SpeakLessonModal = dynamic(() => import('./SpeakLessonModal'), { ssr: false });
const SpeakUnitsModal = dynamic(() => import('./SpeakUnitsModal'), { ssr: false });
const SpeakQuestsModal = dynamic(() => import('./SpeakQuestsModal'), { ssr: false });
const SpeakLockedReviewModal = dynamic(() => import('./SpeakLockedReviewModal'), { ssr: false });

export default function SpeakClientPage({ lightweightLessons }: { lightweightLessons: any[] }) {
  const data = { lessons: lightweightLessons };

  const UNITS = useMemo(() => {
    const computedUnits = [];
    let currentStartIndex = 0;

    for (let i = 0; i < BASE_UNITS.length; i++) {
      const baseUnit = BASE_UNITS[i];
      let endIndex = currentStartIndex;

      for (let j = currentStartIndex; j < data.lessons.length; j++) {
        const title = data.lessons[j].title || "";
        const titleEn = data.lessons[j].titleEn || "";
        if (title.toLowerCase().includes("bilan") || titleEn.toLowerCase().includes("review")) {
          endIndex = j + 1;
          break;
        }
      }

      if (endIndex === currentStartIndex && currentStartIndex < data.lessons.length) {
        endIndex = data.lessons.length;
      }

      computedUnits.push({
        ...baseUnit,
        startIndex: currentStartIndex,
        endIndex: endIndex
      });

      currentStartIndex = endIndex;
    }
    return computedUnits;
  }, [lightweightLessons, data.lessons.length]);

  const { speakCompletedLessons, speakLessonLevels, speakLessonStars, dailyQuests, resetLessonLevel, language, autoDetectLanguage, lastActiveUnitIndex, setLastActiveUnitIndex, reviewStats, getExpectedXp } = useProgressStore();
  
  const speakQuests = dailyQuests?.speak || [];
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isWritingConfigModalOpen, setWritingConfigModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuestsModalOpen, setIsQuestsModalOpen] = useState(false);
  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);
  const [showDesktopUnitsList, setShowDesktopUnitsList] = useState(false);
  const [selectedLesson, _setSelectedLesson] = useState<{ lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string } | null>(null);
  const scrollPositionRef = useRef<number>(0);

  const setSelectedLesson = (lessonData: any) => {
    if (lessonData !== null && selectedLesson === null) {
      scrollPositionRef.current = window.scrollY;
      _setSelectedLesson(lessonData);
      window.history.replaceState(null, '', `#lesson-${lessonData.lesson.id}`);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
    } else if (lessonData === null && selectedLesson !== null) {
      _setSelectedLesson(null);
      window.history.replaceState(null, '', window.location.pathname);
      setTimeout(() => window.scrollTo({ top: scrollPositionRef.current, behavior: 'auto' }), 0);
    } else {
      _setSelectedLesson(lessonData);
      if (lessonData) {
        window.history.replaceState(null, '', `#lesson-${lessonData.lesson.id}`);
      }
    }
  };
  const [modalLevel, setModalLevel] = useState<number | null>(null);
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);
  const [lockedReviewModalOpen, setLockedReviewModalOpen] = useState(false);

  const globalSuggested = null as any;
  const suggestedLessonId = false ? globalSuggested?.id : null;

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setShowHeader(true);
        setLastScrollY(0);
        return;
      }
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (!mounted) return;
    if (lastActiveUnitIndex !== undefined && lastActiveUnitIndex >= 0 && lastActiveUnitIndex < UNITS.length) {
      setActiveUnitIndex(lastActiveUnitIndex);
    } else {
      const lastUnlockedIndex = data.lessons.findIndex(l => !speakCompletedLessons.includes(l.id));
      const targetIndex = lastUnlockedIndex === -1 ? data.lessons.length - 1 : lastUnlockedIndex;
      const unitIndex = UNITS.findIndex(u => targetIndex >= u.startIndex && targetIndex < u.endIndex);
      if (unitIndex !== -1) {
        setActiveUnitIndex(unitIndex);
        setLastActiveUnitIndex(unitIndex);
      }
    }
  }, [mounted, lastActiveUnitIndex, setLastActiveUnitIndex, UNITS, data.lessons, speakCompletedLessons]);

  const handleUnitSelect = (index: number) => {
    setActiveUnitIndex(index);
    setLastActiveUnitIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (mounted) {
      const el = document.getElementById(`unit-tab-${activeUnitIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [mounted, activeUnitIndex]);

  const [isProcessingHash, setIsProcessingHash] = useState(true);

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    let hashProcessed = false;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#lesson-')) {
      try {
        const baseId = hash.substring(1).replace('lesson-', '');
        
        const foundLesson = data.lessons.find(l => l.id === baseId);
        if (foundLesson) {
          const isCompleted = speakCompletedLessons.includes(baseId);
          const unitIndex = UNITS.findIndex(u => data.lessons.findIndex(l => l.id === baseId) >= u.startIndex && data.lessons.findIndex(l => l.id === baseId) < u.endIndex);
          
          if (unitIndex !== -1) {
            const unit = UNITS[unitIndex];
            setSelectedLesson({
              lesson: foundLesson,
              isCompleted,
              unitColor: unit.colorClass,
              unitBorder: unit.borderClass,
              unitText: unit.textClass,
              unitHover: unit.hoverClass
            });
            setActiveUnitIndex(unitIndex);
            
            const lastLvl = localStorage.getItem(`last_level_${baseId}`);
            if (lastLvl !== null) {
              if (window.innerWidth >= 1280) {
                setModalLevel(parseInt(lastLvl, 10));
              }
            }
          }
        }

        setTimeout(() => {
          const isDesktop = window.innerWidth >= 768;
          const targetId = isDesktop ? `#desktop-lesson-${baseId}` : `#mobile-lesson-${baseId}`;

          let el = document.querySelector(targetId);
          if (!el) {
            el = document.querySelector(hash);
          }

          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 50);
        hashProcessed = true;
      } catch (e) {
        console.error(e);
      }
    }
    
    setIsProcessingHash(false);
    setMounted(true);
    autoDetectLanguage();
    useProgressStore.getState().checkAndGenerateQuests();
  }, [autoDetectLanguage, data.lessons, speakCompletedLessons, UNITS]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-28 md:pb-0">

      {!selectedLesson && (
        <SpeakMobileHeader 
          showHeader={showHeader}
          mounted={mounted}
          language={language}
          setIsUnitsModalOpen={setIsUnitsModalOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      )}
      
      <MobileHeaderMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        onOpenQuests={() => setIsQuestsModalOpen(true)} 
      />

      {/* Main Content (Mobile Only) */}
      {!mounted || isProcessingHash ? (
        <div className="md:hidden flex flex-col items-center w-full px-4 mt-2">
          {/* Hero Card Mobile */}
          <div className="w-full h-[180px] bg-slate-200 rounded-2xl animate-pulse mb-6" />
          
          <div className="flex flex-col relative w-full items-center mt-8 pb-20">
            <div className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 bg-slate-200 rounded-full z-0 animate-pulse"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative flex flex-col items-center w-full z-10 mb-8 sm:mb-12">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 animate-pulse mb-4 border-[6px] border-[#FAFAFA]" />
                <div className="w-full max-w-[280px] sm:max-w-[320px] rounded-[1.5rem] h-32 bg-slate-200 animate-pulse border-2 border-slate-100" />
              </div>
            ))}
          </div>
        </div>
      ) : (() => {
        const unit = UNITS[activeUnitIndex];
        const unitLessons = data.lessons.slice(unit.startIndex, unit.endIndex);
        if (selectedLesson) {
          return (
            <div className="md:hidden flex flex-col w-full px-4 mt-2 pb-32">
              <DesktopLessonLevelsView
                lessonData={selectedLesson}
                unitTitle={unit ? (unit.title || unit.titleEn) : undefined}
                modalLevel={modalLevel}
                setModalLevel={(lvl) => {
                  setModalLevel(lvl);
                  if (lvl !== null) {
                    localStorage.setItem(`last_level_${selectedLesson.lesson.id}`, lvl.toString());
                  }
                }}
                onBack={() => {
                  setSelectedLesson(null);
                  setModalLevel(null);
                }}
                language={language}
                lessonLevels={speakLessonLevels}
                lessonStars={speakLessonStars}
                maxLevelPerLesson={5}
                suggestionType="speak"
              />
            </div>
          );
        }

        return (
          <SpeakMobileTimeline 
            unit={unit}
            unitLessons={unitLessons}
            activeUnitIndex={activeUnitIndex}
            totalUnits={UNITS.length}
            language={language}
            lessonLevels={speakLessonLevels}
            suggestedLessonId={suggestedLessonId}
            speakQuests={speakQuests}
            mounted={mounted}
            handleUnitSelect={handleUnitSelect}
            setIsUnitsModalOpen={setIsUnitsModalOpen}
            setIsQuestsModalOpen={setIsQuestsModalOpen}
            setSelectedLesson={setSelectedLesson}
            setModalLevel={setModalLevel}
            setLockedReviewModalOpen={setLockedReviewModalOpen}
            maxLevelPerLesson={5}
            nextUnit={activeUnitIndex < UNITS.length - 1 ? UNITS[activeUnitIndex + 1] : undefined}
          />
        );
      })()}

      {/* Main Content (Desktop Only) */}
      {!mounted || isProcessingHash ? (
        <div className="hidden md:flex flex-row w-full items-start relative min-h-screen">
          <div className="flex-1 flex justify-center w-full pt-8 pb-32 px-6 lg:px-8 pr-8 xl:pr-12">
            <div className="flex flex-col gap-10 w-full max-w-4xl">
               <div className="flex flex-col gap-8 w-full">
                  {/* Header hero */}
                  <div className="p-8 md:p-10 bg-slate-200 border-b-[6px] border-slate-300 rounded-3xl h-[300px] w-full flex flex-col justify-between overflow-hidden relative">
                     <div className="relative z-10">
                       <div className="w-64 h-10 bg-slate-300 rounded-lg animate-pulse mb-4" />
                       <div className="w-96 h-6 bg-slate-300 rounded-md animate-pulse" />
                     </div>
                     <div className="w-full mt-auto relative z-10">
                       <div className="flex justify-between w-full mb-3">
                          <div className="w-24 h-4 bg-slate-300 rounded animate-pulse" />
                          <div className="w-32 h-4 bg-slate-300 rounded animate-pulse" />
                       </div>
                       <div className="w-full h-4 bg-slate-300 rounded-full animate-pulse" />
                     </div>
                  </div>

                  <div className="flex flex-col relative w-full pl-6 md:pl-10 mt-4 pb-32">
                     <div className="absolute left-[calc(3.5rem-5px)] md:left-[calc(5rem-5px)] top-[5rem] bottom-[8rem] w-[10px] bg-slate-200 rounded-full z-0 animate-pulse"></div>

                     {[...Array(6)].map((_, i) => (
                       <div key={i} className="relative flex items-center w-full z-10 gap-6 md:gap-8 min-h-[8.5rem] py-3">
                         <div className="relative shrink-0 py-6 z-10">
                           <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-white border-2 border-slate-200 border-b-[6px] flex items-center justify-center">
                             <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                           </div>
                         </div>
                         <div className="flex-1 rounded-[1.5rem] border-2 border-slate-100 p-5 md:p-6 bg-white h-[8.5rem] flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 shadow-sm">
                           <div className="flex flex-col items-start w-full max-w-[200px] gap-3">
                              <div className="w-32 h-6 bg-slate-200 rounded animate-pulse" />
                              <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
                           </div>
                           <div className="w-full md:w-48 shrink-0 mt-4 md:mt-0 flex flex-col justify-center gap-2">
                              <div className="flex justify-between w-full">
                                <div className="w-16 h-3 bg-slate-200 rounded animate-pulse" />
                                <div className="w-8 h-3 bg-slate-200 rounded animate-pulse" />
                              </div>
                              <div className="flex justify-between gap-[2px] w-full">
                                {Array.from({ length: 10 }).map((_, j) => (
                                  <div key={j} className="h-3 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full bg-slate-100 animate-pulse"></div>
                                ))}
                              </div>
                           </div>
                         </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
          <div className="hidden xl:flex w-80 shrink-0 flex-col gap-6 sticky top-8">
             {/* Unités du Cours Skeleton */}
             <div className="w-full h-[72px] bg-white border-2 border-slate-100 rounded-2xl flex items-center px-4 gap-4">
               <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse" />
               <div className="flex flex-col gap-2 flex-1">
                 <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
                 <div className="w-32 h-3 bg-slate-200 rounded animate-pulse" />
               </div>
             </div>
             
             {/* Quêtes journalières Skeleton */}
             <div className="w-full bg-white border-2 border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
                 <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
               </div>
               {[1, 2, 3].map(i => (
                 <div key={i} className="w-full h-[60px] bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
               ))}
             </div>

             {/* Objectif d'histoire Skeleton */}
             <div className="w-full bg-white border-2 border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
                 <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
               </div>
               <div className="w-40 h-4 bg-slate-200 rounded animate-pulse mb-2" />
               <div className="w-full h-[80px] bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
               <div className="w-full h-12 bg-slate-200 rounded-xl animate-pulse mt-2" />
             </div>
          </div>
        </div>
      ) : (
        <div
          className="hidden md:flex flex-row w-full items-start relative min-h-screen"
          onClick={() => {
            setShowDesktopUnitsList(false);
          }}
        >
          <div className={`flex-1 flex justify-center w-full pt-8 pb-32 ${!selectedLesson ? 'px-6 lg:px-8 pr-8 xl:pr-12' : ''}`}>
            <div className={`flex flex-col gap-10 w-full ${!selectedLesson ? 'max-w-4xl' : ''}`}>
              {(() => {
                const unit = UNITS[activeUnitIndex];
                const unitLessons = data.lessons.slice(unit.startIndex, unit.endIndex);
                if (selectedLesson) {
                   return (
                     <DesktopLessonLevelsView
                       lessonData={selectedLesson}
                       unitTitle={unit ? (unit.title || unit.titleEn) : undefined}
                       modalLevel={modalLevel}
                       setModalLevel={(lvl) => {
                         setModalLevel(lvl);
                         if (lvl !== null && selectedLesson?.lesson?.id) {
                           localStorage.setItem(`last_level_${selectedLesson.lesson.id}`, lvl.toString());
                         }
                       }}
                       onBack={() => {
                         setSelectedLesson(null);
                         setShowDesktopUnitsList(false);
                       }}
                       language={language}
                       lessonLevels={speakLessonLevels}
                       lessonStars={speakLessonStars}
                       maxLevelPerLesson={5}
                       suggestionType="speak"
                     />
                   );
                }
                return (
                  <SpeakDesktopTimeline 
                    unit={unit}
                    unitLessons={unitLessons}
                    activeUnitIndex={activeUnitIndex}
                    totalUnits={UNITS.length}
                    language={language}
                    lessonLevels={speakLessonLevels}
                    suggestedLessonId={suggestedLessonId}
                    mounted={mounted}
                    handleUnitSelect={handleUnitSelect}
                    setShowDesktopUnitsList={setShowDesktopUnitsList}
                    setSelectedLesson={setSelectedLesson}
                    setModalLevel={setModalLevel}
                    setLockedReviewModalOpen={setLockedReviewModalOpen}
                    maxLevelPerLesson={5}
                    nextUnit={activeUnitIndex < UNITS.length - 1 ? UNITS[activeUnitIndex + 1] : undefined}
                  />
                );
              })()}
            </div>
          </div>

          <DesktopSidebarRight
            showUnitsList={showDesktopUnitsList}
            setShowUnitsList={setShowDesktopUnitsList}
            units={UNITS}
            activeUnitIndex={activeUnitIndex}
            onUnitSelect={handleUnitSelect}
            language={language}
            globalSuggested={globalSuggested}
            lessons={data.lessons}
            lessonLevels={speakLessonLevels}
            mounted={mounted}
            maxLevelPerLesson={5}
            suggestionType="speak"
            selectedLesson={selectedLesson}
            onCloseLesson={() => setSelectedLesson(null)}
            modalLevel={modalLevel}
            setModalLevel={setModalLevel}
            lessonStars={speakLessonStars}
            resetLessonLevel={resetLessonLevel}
            questsCategory="speak"
            reviewStats={reviewStats}
          />
        </div>
      )}

      {/* Selected Lesson Modal */}
      {mounted && windowWidth < 1280 && (
        <SpeakLessonModal 
          isOpen={!!selectedLesson && modalLevel !== null}
          onOpenChange={(open) => {
            if (!open) setModalLevel(null);
          }}
          selectedLesson={selectedLesson}
          modalLevel={modalLevel ?? 0}
          setModalLevel={(lvl) => setModalLevel(lvl)}
          language={language}
          lessonLevels={speakLessonLevels}
          lessonStars={speakLessonStars}
          resetLessonLevel={resetLessonLevel}
          reviewStats={reviewStats}
          getExpectedXp={getExpectedXp}
          maxLevelPerLesson={5}
        />
      )}

      {mounted && windowWidth < 768 && (
        <SpeakUnitsModal 
          isOpen={isUnitsModalOpen}
          onOpenChange={setIsUnitsModalOpen}
          language={language}
          units={UNITS}
          activeUnitIndex={activeUnitIndex}
          onUnitSelect={handleUnitSelect}
        />
      )}

      {mounted && windowWidth < 1280 && (
        <SpeakQuestsModal 
          isOpen={isQuestsModalOpen}
          onOpenChange={setIsQuestsModalOpen}
        />
      )}

      <WritingConfigModal
        isOpen={isWritingConfigModalOpen}
        onClose={() => setWritingConfigModalOpen(false)}
      />

      {mounted && (
        <SpeakLockedReviewModal 
          isOpen={lockedReviewModalOpen}
          onClose={() => setLockedReviewModalOpen(false)}
          language={language}
        />
      )}

    </div>
  );
}
