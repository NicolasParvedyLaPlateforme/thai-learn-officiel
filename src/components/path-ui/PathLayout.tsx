'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useProgressStore } from "@/lib/store";
import PathMobileHeader from './PathMobileHeader';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';

// Custom Hooks
import { useScrollHeader } from '@/hooks/useScrollHeader';
import { useActiveUnit } from '@/hooks/useActiveUnit';
import { useLessonHashRouting } from '@/hooks/useLessonHashRouting';
import { useLessonSelection } from '@/hooks/useLessonSelection';

// Skeletons
import { PathMobileSkeleton } from './skeletons/PathMobileSkeleton';
import { PathDesktopSkeleton } from './skeletons/PathDesktopSkeleton';

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

  // Modal States
  const [isWritingConfigModalOpen, setWritingConfigModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuestsModalOpen, setIsQuestsModalOpen] = useState(false);
  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);
  const [showDesktopUnitsList, setShowDesktopUnitsList] = useState(false);
  const [lockedReviewModalOpen, setLockedReviewModalOpen] = useState(false);
  const [modalLevel, setModalLevel] = useState<number | null>(null);

  const showHeader = useScrollHeader(50);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const { selectedLesson, setSelectedLesson } = useLessonSelection();

  // We need to put useActiveUnit here, but wait, useLessonHashRouting needs setActiveUnitIndex which is returned by useActiveUnit.
  // And useActiveUnit needs setLastActiveUnitIndex which is defined earlier.
  // Let's reorder carefully.



  const { activeUnitIndex, handleUnitSelect, setActiveUnitIndex } = useActiveUnit(
    mounted,
    units,
    lessons,
    completedLessons,
    pathType,
    lastActiveUnitIndex,
    setLastActiveUnitIndex
  );

  const isProcessingHash = useLessonHashRouting(
    lessons,
    units,
    pathType,
    completedLessons,
    setActiveUnitIndex,
    setSelectedLesson,
    setModalLevel,
    setMounted,
    autoDetectLanguage
  );

  useEffect(() => {
    if (mounted && !isProcessingHash && !selectedLesson && !hasAutoSelected) {
      setHasAutoSelected(true);
      let toSelect = null;
      if (suggestedLessonId) {
        toSelect = lessons.find(l => l.id === suggestedLessonId);
      } else {
        toSelect = lessons.find(l => (lessonLevels[l.id] || 0) < maxLevelPerLesson);
      }
      if (toSelect) {
        const lessonIndex = lessons.indexOf(toSelect);
        const unit = units.find(u => u.startIndex <= lessonIndex && u.endIndex > lessonIndex);
        if (unit) {
          setSelectedLesson({
            lesson: toSelect,
            isCompleted: (lessonLevels[toSelect.id] || 0) >= maxLevelPerLesson,
            unitColor: unit.colorClass,
            unitBorder: unit.borderClass,
            unitText: unit.textClass,
            unitHover: unit.hoverClass
          });
        }
      }
    }
  }, [mounted, isProcessingHash, selectedLesson, hasAutoSelected, lessons, units, lessonLevels, maxLevelPerLesson, suggestedLessonId, setSelectedLesson]);

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
        <PathMobileSkeleton />
      ) : (
        renderMobileTimeline({
          unit: activeUnit,
          unitLessons: pathType === 'alphabet' ? activeUnit?.lessons : lessons.slice(activeUnit?.startIndex, activeUnit?.endIndex),
          activeUnitIndex,
          totalUnits: units.length,
          language,
          lessonLevels,
          lessonStars,
          suggestedLessonId,
          globalSuggestedLesson: suggestedLessonId ? lessons.find((l: any) => l.id === suggestedLessonId) : null,
          quests,
          mounted,
          handleUnitSelect,
          setIsUnitsModalOpen,
          setIsQuestsModalOpen,
          setSelectedLesson,
          selectedLesson,
          modalLevel,
          setModalLevel,
          setLockedReviewModalOpen,
          nextUnit: activeUnitIndex < units.length - 1 ? units[activeUnitIndex + 1] : undefined
        })
      )}

      {/* Desktop Main Content */}
      <div className="hidden md:block">
        {!mounted || isProcessingHash ? (
          <PathDesktopSkeleton />
        ) : (
          <div
            className="hidden md:flex flex-row w-full items-start relative min-h-screen"
            onClick={() => {
              setShowDesktopUnitsList(false);
            }}
          >
            <div className={`flex-1 flex justify-center w-full pt-8 pb-32 px-6 lg:px-8 pr-8 xl:pr-12`}>
              <div className={`flex flex-col gap-10 w-full max-w-4xl`}>
                {renderDesktopTimeline({
                  unit: activeUnit,
                  unitLessons: pathType === 'alphabet' ? activeUnit?.lessons : lessons.slice(activeUnit?.startIndex, activeUnit?.endIndex),
                  activeUnitIndex,
                  totalUnits: units.length,
                  language,
                  lessonLevels,
                  lessonStars,
                  suggestedLessonId,
                  mounted,
                  handleUnitSelect,
                  setShowDesktopUnitsList,
                  setSelectedLesson,
                  selectedLesson,
                  modalLevel,
                  setModalLevel,
                  setLockedReviewModalOpen,
                  nextUnit: activeUnitIndex < units.length - 1 ? units[activeUnitIndex + 1] : undefined
                })}
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
              questsCategory={pathType as any}
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
