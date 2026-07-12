'use client';

import { useState, useEffect, useMemo } from 'react';
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

// Sidebar removed

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
    
    // Lock body scroll so PathLayout container can snap scroll correctly
    document.body.style.overflow = 'hidden';
    
    return () => {
        window.removeEventListener('resize', handleResize);
        document.body.style.overflow = 'auto';
    };
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

  useEffect(() => {
    if (selectedLesson?.lesson?.id && modalLevel !== null) {
      const storageKey = pathType === 'speak' ? `last_speak_level_${selectedLesson.lesson.id}` : pathType === 'alphabet' ? `last_alphabet_level_${selectedLesson.lesson.id}` : `last_level_${selectedLesson.lesson.id}`;
      localStorage.setItem(storageKey, modalLevel.toString());
    }
  }, [modalLevel, selectedLesson, pathType]);

  // We need to put useActiveUnit here, but wait, useLessonHashRouting needs setActiveUnitIndex which is returned by useActiveUnit.
  // And useActiveUnit needs setLastActiveUnitIndex which is defined earlier.
  // Let's reorder carefully.



  const { activeUnitIndex, handleUnitSelect: baseHandleUnitSelect, setActiveUnitIndex } = useActiveUnit(
    mounted,
    units,
    lessons,
    completedLessons,
    pathType,
    lastActiveUnitIndex,
    setLastActiveUnitIndex
  );

  const handleUnitSelect = (index: number) => {
      baseHandleUnitSelect(index);
      setSelectedLesson(null);
  };

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
      // Removed setSelectedLesson here so that the sidebar/modal doesn't open automatically on page load.
      // Auto-expansion of the timeline will be handled by the timeline components based on suggestedLessonId.
    }
  }, [mounted, isProcessingHash, selectedLesson, hasAutoSelected]);

  const activeUnit = units[activeUnitIndex];
  const pageTitleKey = pathType === 'alphabet' ? 'sidebar.alphabet' : pathType === 'speak' ? 'sidebar.speaking' : 'sidebar.vocabulary';

  const unitLessons = useMemo(() => {
    if (!activeUnit) return [];
    return pathType === 'alphabet' 
      ? activeUnit.lessons 
      : lessons.slice(activeUnit.startIndex, activeUnit.endIndex);
  }, [activeUnit, pathType, lessons]);

  return (
    <div id="path-scroll-container" className="min-h-[100dvh] overflow-y-auto overflow-x-hidden snap-y snap-mandatory bg-[#FAFAFA] font-sans text-slate-800 pb-28 md:pb-0 relative h-screen">
      <PathMobileHeader
        showHeader={showHeader}
        mounted={mounted}
        language={language}
        setIsUnitsModalOpen={setIsUnitsModalOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        pageTitleKey={pageTitleKey}
        pathType={pathType}
      />

      <MobileHeaderMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenQuests={() => setIsQuestsModalOpen(true)}
      />

      {/* Main Content (Mobile Only) */}
      <div className="md:hidden">
        {!mounted || isProcessingHash ? (
          <PathMobileSkeleton />
        ) : (
          renderMobileTimeline({
            key: activeUnit?.id,
            unit: activeUnit,
            unitLessons,
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
      </div>

      {/* Desktop Main Content */}
      <div className="hidden md:block">
        {!mounted || isProcessingHash ? (
          <PathDesktopSkeleton />
        ) : (
          <div
            className="hidden md:flex flex-row w-full items-start justify-center relative min-h-screen"
            onClick={() => {
              setShowDesktopUnitsList(false);
            }}
          >
            <div className={`flex-1 flex justify-center w-full max-w-4xl`}>
              <div className={`flex flex-col w-full h-full`}>
                {renderDesktopTimeline({
                  key: activeUnit?.id,
                  unit: activeUnit,
                  unitLessons,
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
          </div>
        )}
      </div>

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
