'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import { useProgressStore } from "@/lib/store";
import PathMobileHeader from './PathMobileHeader';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';

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
const WritingConfigModal = dynamic(() => import('../modals/WritingConfigModal').then(mod => mod.WritingConfigModal), { ssr: false });

export interface PathLayoutProps {
  pathType: 'learn' | 'alphabet' | 'speak';
  units: any[];
  lessons: any[];
  quests: any[];
  globalSuggested: any;
  suggestedLessonId: string | null;
  maxLevelPerLesson?: number;
  renderMobileTimeline: (props: any) => React.ReactNode;
  renderDesktopTimeline: (props: any) => React.ReactNode;
  renderLessonLevelsView?: (props: any) => React.ReactNode;
  renderLessonModal?: (props: any) => React.ReactNode;
  renderUnitsModal?: (props: any) => React.ReactNode;
  renderQuestsModal?: (props: any) => React.ReactNode;
  renderLockedReviewModal?: (props: any) => React.ReactNode;
}

export default function PathLayout({
  pathType,
  units,
  lessons,
  quests,
  globalSuggested,
  suggestedLessonId,
  maxLevelPerLesson = 10,
  renderMobileTimeline,
  renderDesktopTimeline,
  renderLessonLevelsView,
  renderLessonModal,
  renderUnitsModal,
  renderQuestsModal,
  renderLockedReviewModal
}: PathLayoutProps) {
  const store = useProgressStore();
  const completedLessons = pathType === 'speak' ? store.speakCompletedLessons : store.completedLessons;
  const lessonLevels = pathType === 'speak' ? store.speakLessonLevels : store.lessonLevels;
  const lessonStars = pathType === 'speak' ? store.speakLessonStars : store.lessonStars;
  const { resetLessonLevel, language, autoDetectLanguage, lastActiveUnitIndex, setLastActiveUnitIndex, reviewStats, getExpectedXp } = store;

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
  const [selectedLesson, _setSelectedLesson] = useState<{ lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string, initialScrollLevel?: number } | null>(null);
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
    if (!mounted || units.length === 0) return;

    let targetIndex = 0;

    // For alphabet, we might have ?unit= query param
    const params = new URLSearchParams(window.location.search);
    const unitParam = params.get('unit');
    if (pathType === 'alphabet' && unitParam && parseInt(unitParam) >= 0 && parseInt(unitParam) < units.length) {
      targetIndex = parseInt(unitParam);
      window.history.replaceState({}, '', `/${pathType}`);
    } else if (lastActiveUnitIndex !== undefined && lastActiveUnitIndex >= 0 && lastActiveUnitIndex < units.length) {
      targetIndex = lastActiveUnitIndex;
    } else {
      // Find first unfinished lesson's unit
      const lastUnlockedIndex = lessons.findIndex(l => !completedLessons.includes(l.id));
      const targetLessonIndex = lastUnlockedIndex === -1 ? lessons.length - 1 : lastUnlockedIndex;
      if (targetLessonIndex !== -1) {
        // Find which unit contains this lesson index
        // This depends on pathType. Learn uses startIndex/endIndex
        if (pathType === 'learn') {
          const unitIndex = units.findIndex(u => targetLessonIndex >= u.startIndex && targetLessonIndex < u.endIndex);
          if (unitIndex !== -1) targetIndex = unitIndex;
        } else if (pathType === 'alphabet') {
          const targetLesson = lessons[targetLessonIndex];
          const unitIndex = units.findIndex(u => u.lessons?.some((l: any) => l.id === targetLesson.id));
          if (unitIndex !== -1) targetIndex = unitIndex;
        } else if (pathType === 'speak') {
          const unitIndex = units.findIndex(u => targetLessonIndex >= u.startIndex && targetLessonIndex < u.endIndex);
          if (unitIndex !== -1) targetIndex = unitIndex;
        }
      }
    }

    setActiveUnitIndex(targetIndex);
    if (pathType !== 'alphabet') { // alphabet doesn't sync active unit to store in original code ? Wait, let's just sync it.
      setLastActiveUnitIndex(targetIndex);
    }
  }, [mounted, lastActiveUnitIndex, setLastActiveUnitIndex, units, lessons, completedLessons, pathType]);

  const handleUnitSelect = (index: number) => {
    setActiveUnitIndex(index);
    setLastActiveUnitIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isProcessingHash, setIsProcessingHash] = useState(true);
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    let hashProcessed = false;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#lesson-')) {
      try {
        const baseId = hash.substring(1).replace('lesson-', '');

        const foundLesson = lessons.find(l => l.id === baseId);
        if (foundLesson) {
          const isCompleted = completedLessons.includes(baseId);

          let unitIndex = -1;
          if (pathType === 'learn' || pathType === 'speak') {
            const targetIdx = lessons.findIndex(l => l.id === baseId);
            unitIndex = units.findIndex(u => targetIdx >= u.startIndex && targetIdx < u.endIndex);
          } else if (pathType === 'alphabet') {
            unitIndex = units.findIndex(u => u.lessons?.some((l: any) => l.id === baseId));
          }

          if (unitIndex !== -1) {
            const unit = units[unitIndex];
            const lastLvlStr = localStorage.getItem(`last_level_${baseId}`);
            const parsedLastLvl = lastLvlStr !== null ? parseInt(lastLvlStr, 10) : undefined;

            setSelectedLesson({
              lesson: foundLesson,
              isCompleted,
              unitColor: unit.colorClass,
              unitBorder: unit.borderClass,
              unitText: unit.textClass,
              unitHover: unit.hoverClass,
              initialScrollLevel: parsedLastLvl
            });
            setActiveUnitIndex(unitIndex);

            if (parsedLastLvl !== undefined && window.innerWidth >= 1280) {
              setModalLevel(parsedLastLvl);
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
  }, [autoDetectLanguage, lessons, completedLessons, units, pathType]);

  const activeUnit = units[activeUnitIndex];
  const pageTitleKey = pathType === 'alphabet' ? 'sidebar.alphabet' : pathType === 'speak' ? 'sidebar.speaking' : 'sidebar.vocabulary';

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-28 md:pb-0">

      {!selectedLesson && (
        <PathMobileHeader
          showHeader={showHeader}
          mounted={mounted}
          language={language}
          setIsUnitsModalOpen={setIsUnitsModalOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          pageTitleKey={pageTitleKey}
          pathType={pathType}
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
        if (selectedLesson && renderLessonLevelsView) {
          return (
            <div className="md:hidden flex flex-col w-full px-4 mt-2 pb-32">
              {renderLessonLevelsView({
                lessonData: selectedLesson,
                unitTitle: activeUnit ? (activeUnit.title || activeUnit.titleEn) : undefined,
                modalLevel,
                setModalLevel: (lvl: number | null) => {
                  setModalLevel(lvl);
                  if (lvl !== null) {
                    localStorage.setItem(`last_level_${selectedLesson.lesson.id}`, lvl.toString());
                  }
                },
                onBack: () => {
                  setSelectedLesson(null);
                  setModalLevel(null);
                },
                language,
                lessonLevels,
                lessonStars,
                maxLevelPerLesson
              })}
            </div>
          );
        }

        return renderMobileTimeline({
          unit: activeUnit,
          unitLessons: pathType === 'alphabet' ? activeUnit?.lessons : lessons.slice(activeUnit?.startIndex, activeUnit?.endIndex),
          activeUnitIndex,
          totalUnits: units.length,
          language,
          lessonLevels,
          suggestedLessonId,
          globalSuggestedLesson: suggestedLessonId ? lessons.find((l: any) => l.id === suggestedLessonId) : null,
          quests,
          mounted,
          handleUnitSelect,
          setIsUnitsModalOpen,
          setIsQuestsModalOpen,
          setSelectedLesson,
          setModalLevel,
          setLockedReviewModalOpen,
          nextUnit: activeUnitIndex < units.length - 1 ? units[activeUnitIndex + 1] : undefined
        });
      })()}

      {/* Desktop Main Content */}
      <div className="hidden md:block">
        {!mounted || isProcessingHash ? (
          <div className="flex flex-row w-full items-start relative min-h-screen">
            <div className="flex-1 flex justify-center w-full pt-8 pb-32 px-6 lg:px-8 pr-8 xl:pr-12">
              <div className="flex flex-col gap-10 w-full max-w-4xl">
                <div className="flex flex-col gap-8 w-full">
                  <div className="p-8 md:p-10 bg-slate-200 border-b-[6px] border-slate-300 rounded-3xl h-[300px] w-full flex flex-col justify-between overflow-hidden relative">
                    <div className="relative z-10">
                      <div className="w-64 h-10 bg-slate-300 rounded-lg animate-pulse mb-4" />
                      <div className="w-96 h-6 bg-slate-300 rounded-md animate-pulse" />
                    </div>
                  </div>
                  <div className="flex flex-col relative w-full pl-6 md:pl-10 mt-4 pb-32">
                    <div className="absolute left-[calc(3.5rem-5px)] md:left-[calc(5rem-5px)] top-[5rem] bottom-[8rem] w-[10px] bg-slate-200 rounded-full z-0 animate-pulse"></div>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="relative flex items-center w-full z-10 gap-6 md:gap-8 min-h-[8.5rem] py-3">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-white border-2 border-slate-200 border-b-[6px] flex items-center justify-center"></div>
                        <div className="flex-1 rounded-[1.5rem] border-2 border-slate-100 h-[8.5rem] bg-white"></div>
                      </div>
                    ))}
                  </div>
                </div>
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
                  if (selectedLesson && renderLessonLevelsView) {
                    return renderLessonLevelsView({
                      lessonData: selectedLesson,
                      unitTitle: activeUnit ? (activeUnit.title || activeUnit.titleEn) : undefined,
                      modalLevel,
                      setModalLevel: (lvl: number | null) => {
                        setModalLevel(lvl);
                        if (lvl !== null) {
                          localStorage.setItem(`last_level_${selectedLesson.lesson.id}`, lvl.toString());
                        }
                      },
                      onBack: () => {
                        setSelectedLesson(null);
                        setShowDesktopUnitsList(false);
                      },
                      language,
                      lessonLevels,
                      lessonStars,
                      maxLevelPerLesson
                    });
                  }
                  return renderDesktopTimeline({
                    unit: activeUnit,
                    unitLessons: pathType === 'alphabet' ? activeUnit?.lessons : lessons.slice(activeUnit?.startIndex, activeUnit?.endIndex),
                    activeUnitIndex,
                    totalUnits: units.length,
                    language,
                    lessonLevels,
                    suggestedLessonId,
                    mounted,
                    handleUnitSelect,
                    setShowDesktopUnitsList,
                    setSelectedLesson,
                    setModalLevel,
                    setLockedReviewModalOpen,
                    nextUnit: activeUnitIndex < units.length - 1 ? units[activeUnitIndex + 1] : undefined
                  });
                })()}
              </div>
            </div>

            <DesktopSidebarRight
              showUnitsList={showDesktopUnitsList}
              setShowUnitsList={setShowDesktopUnitsList}
              units={units}
              activeUnitIndex={activeUnitIndex}
              onUnitSelect={handleUnitSelect}
              language={language}
              globalSuggested={globalSuggested}
              lessons={lessons}
              lessonLevels={lessonLevels}
              mounted={mounted}
              maxLevelPerLesson={maxLevelPerLesson}
              suggestionType={pathType}
              selectedLesson={selectedLesson}
              onCloseLesson={() => setSelectedLesson(null)}
              modalLevel={modalLevel}
              setModalLevel={setModalLevel}
              lessonStars={lessonStars}
              resetLessonLevel={resetLessonLevel}
              reviewStats={reviewStats}
              questsCategory={pathType}
            />
          </div>
        )}
      </div>

      {mounted && windowWidth < 1280 && renderLessonModal && renderLessonModal({
        isOpen: !!selectedLesson && modalLevel !== null,
        onOpenChange: (open: boolean) => {
          if (!open) setModalLevel(null);
        },
        selectedLesson,
        modalLevel: modalLevel ?? 0,
        setModalLevel: (lvl: number | null) => setModalLevel(lvl),
        language,
        lessonLevels,
        lessonStars,
        resetLessonLevel,
        reviewStats,
        getExpectedXp
      })}

      {mounted && windowWidth < 768 && renderUnitsModal && renderUnitsModal({
        isOpen: isUnitsModalOpen,
        onOpenChange: setIsUnitsModalOpen,
        language,
        units,
        activeUnitIndex,
        onUnitSelect: handleUnitSelect
      })}

      {mounted && windowWidth < 1280 && renderQuestsModal && renderQuestsModal({
        isOpen: isQuestsModalOpen,
        onOpenChange: setIsQuestsModalOpen
      })}

      <WritingConfigModal
        isOpen={isWritingConfigModalOpen}
        onClose={() => setWritingConfigModalOpen(false)}
      />

      {mounted && renderLockedReviewModal && renderLockedReviewModal({
        isOpen: lockedReviewModalOpen,
        onClose: () => setLockedReviewModalOpen(false),
        language
      })}

    </div>
  );
}
