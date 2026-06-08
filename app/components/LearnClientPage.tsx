'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useProgressStore } from '../lib/store';
import BASE_UNITS from '../data/units.json';
import { useGlobalSuggestedLesson } from '../lib/useGlobalSuggestedLesson';

import dynamic from 'next/dynamic';

const WritingConfigModal = dynamic(() => import('../components/WritingConfigModal').then(mod => mod.WritingConfigModal), { ssr: false });
const DesktopSidebarRight = dynamic(() => import('../components/DesktopSidebarRight').then(mod => mod.DesktopSidebarRight), { ssr: false });
const MobileHeaderMenu = dynamic(() => import('../components/MobileHeaderMenu').then(mod => mod.MobileHeaderMenu), { ssr: false });

import LearnMobileHeader from './learn/LearnMobileHeader';
import LearnMobileTimeline from './learn/LearnMobileTimeline';
import LearnDesktopTimeline from './learn/LearnDesktopTimeline';

const LearnLessonModal = dynamic(() => import('./learn/LearnLessonModal'), { ssr: false });
const LearnUnitsModal = dynamic(() => import('./learn/LearnUnitsModal'), { ssr: false });
const LearnQuestsModal = dynamic(() => import('./learn/LearnQuestsModal'), { ssr: false });
const LearnLockedReviewModal = dynamic(() => import('./learn/LearnLockedReviewModal'), { ssr: false });

export default function LearnClientPage({ lightweightLessons }: { lightweightLessons: any[] }) {
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

  const { completedLessons, lessonLevels, lessonStars, dailyQuests, resetLessonLevel, language, autoDetectLanguage, lastActiveUnitIndex, setLastActiveUnitIndex, reviewStats, getExpectedXp } = useProgressStore();
  
  const learnQuests = dailyQuests?.learn || [];
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
  const [selectedLesson, setSelectedLesson] = useState<{ lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string } | null>(null);
  const [modalLevel, setModalLevel] = useState(0);
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);
  const [lockedReviewModalOpen, setLockedReviewModalOpen] = useState(false);

  const globalSuggested = useGlobalSuggestedLesson(lightweightLessons);
  const suggestedLessonId = globalSuggested?.type === 'learn' ? globalSuggested.id : null;

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
    const timer = setTimeout(() => {
      setMounted(true);
      autoDetectLanguage();
      useProgressStore.getState().checkAndGenerateQuests();
    }, 0);
    return () => clearTimeout(timer);
  }, [autoDetectLanguage]);

  useEffect(() => {
    if (!mounted) return;
    if (lastActiveUnitIndex !== undefined && lastActiveUnitIndex >= 0 && lastActiveUnitIndex < UNITS.length) {
      setActiveUnitIndex(lastActiveUnitIndex);
    } else {
      const lastUnlockedIndex = data.lessons.findIndex(l => !completedLessons.includes(l.id));
      const targetIndex = lastUnlockedIndex === -1 ? data.lessons.length - 1 : lastUnlockedIndex;
      const unitIndex = UNITS.findIndex(u => targetIndex >= u.startIndex && targetIndex < u.endIndex);
      if (unitIndex !== -1) {
        setActiveUnitIndex(unitIndex);
        setLastActiveUnitIndex(unitIndex);
      }
    }
  }, [mounted, lastActiveUnitIndex, setLastActiveUnitIndex, UNITS, data.lessons, completedLessons]);

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

  useEffect(() => {
    if (mounted) {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          try {
            const baseId = hash.substring(1).replace('lesson-', '');
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
          } catch (e) {
            console.error(e);
          }
        }, 100);
      }
    }
  }, [mounted]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-28 md:pb-0">

      <LearnMobileHeader 
        showHeader={showHeader}
        mounted={mounted}
        language={language}
        setIsUnitsModalOpen={setIsUnitsModalOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <MobileHeaderMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        onOpenQuests={() => setIsQuestsModalOpen(true)} 
      />

      {/* Main Content (Mobile Only) */}
      {(() => {
        const unit = UNITS[activeUnitIndex];
        const unitLessons = data.lessons.slice(unit.startIndex, unit.endIndex);
        return (
          <LearnMobileTimeline 
            unit={unit}
            unitLessons={unitLessons}
            activeUnitIndex={activeUnitIndex}
            totalUnits={UNITS.length}
            language={language}
            lessonLevels={lessonLevels}
            suggestedLessonId={suggestedLessonId}
            learnQuests={learnQuests}
            mounted={mounted}
            handleUnitSelect={handleUnitSelect}
            setIsUnitsModalOpen={setIsUnitsModalOpen}
            setIsQuestsModalOpen={setIsQuestsModalOpen}
            setSelectedLesson={setSelectedLesson}
            setModalLevel={setModalLevel}
            setLockedReviewModalOpen={setLockedReviewModalOpen}
          />
        );
      })()}

      {/* Main Content (Desktop Only) */}
      {mounted && (
        <div
          className="hidden md:flex flex-row w-full items-start relative min-h-screen"
          onClick={() => {
            setSelectedLesson(null);
            setShowDesktopUnitsList(false);
          }}
        >
          <div className="flex-1 flex justify-center w-full pt-8 pb-32 px-6 lg:px-8 pr-8 xl:pr-12">
            <div className="flex flex-col gap-10 w-full max-w-4xl">
              {(() => {
                const unit = UNITS[activeUnitIndex];
                const unitLessons = data.lessons.slice(unit.startIndex, unit.endIndex);
                return (
                  <LearnDesktopTimeline 
                    unit={unit}
                    unitLessons={unitLessons}
                    activeUnitIndex={activeUnitIndex}
                    totalUnits={UNITS.length}
                    language={language}
                    lessonLevels={lessonLevels}
                    suggestedLessonId={suggestedLessonId}
                    mounted={mounted}
                    handleUnitSelect={handleUnitSelect}
                    setShowDesktopUnitsList={setShowDesktopUnitsList}
                    setSelectedLesson={setSelectedLesson}
                    setModalLevel={setModalLevel}
                    setLockedReviewModalOpen={setLockedReviewModalOpen}
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
            lessonLevels={lessonLevels}
            mounted={mounted}
            maxLevelPerLesson={10}
            suggestionType="learn"
            selectedLesson={selectedLesson}
            onCloseLesson={() => setSelectedLesson(null)}
            modalLevel={modalLevel}
            setModalLevel={setModalLevel}
            lessonStars={lessonStars}
            resetLessonLevel={resetLessonLevel}
            reviewStats={reviewStats}
          />
        </div>
      )}

      {/* Selected Lesson Modal */}
      {mounted && windowWidth < 1280 && (
        <LearnLessonModal 
          isOpen={!!selectedLesson}
          onOpenChange={(open) => !open && setSelectedLesson(null)}
          selectedLesson={selectedLesson}
          modalLevel={modalLevel}
          setModalLevel={setModalLevel}
          language={language}
          lessonLevels={lessonLevels}
          lessonStars={lessonStars}
          resetLessonLevel={resetLessonLevel}
          reviewStats={reviewStats}
          getExpectedXp={getExpectedXp}
        />
      )}

      {mounted && windowWidth < 768 && (
        <LearnUnitsModal 
          isOpen={isUnitsModalOpen}
          onOpenChange={setIsUnitsModalOpen}
          language={language}
          units={UNITS}
          activeUnitIndex={activeUnitIndex}
          onUnitSelect={handleUnitSelect}
        />
      )}

      {mounted && windowWidth < 1280 && (
        <LearnQuestsModal 
          isOpen={isQuestsModalOpen}
          onOpenChange={setIsQuestsModalOpen}
        />
      )}

      <WritingConfigModal
        isOpen={isWritingConfigModalOpen}
        onClose={() => setWritingConfigModalOpen(false)}
      />

      {mounted && (
        <LearnLockedReviewModal 
          isOpen={lockedReviewModalOpen}
          onClose={() => setLockedReviewModalOpen(false)}
          language={language}
        />
      )}

    </div>
  );
}
