import { m as motion, AnimatePresence } from "motion/react";
import { BookOpen, Star, CheckCircle, Lock, Play, Crown, ChevronLeft } from 'lucide-react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import IconImage from '../ui/IconImage';
import React, { useState, useEffect, useRef } from 'react';
import DesktopStickyBanner from '../path-ui/DesktopStickyBanner';
import { SharedLessonCard } from '../path-ui/SharedLessonCard';
import { NextUnitCard } from './NextUnitCard';
import PathTimelineLine from '../path-ui/PathTimelineLine';
import { PathDecorations } from '../path-ui/PathDecorations';
import { MobileTimelineNodeLayout } from '../path-ui/MobileTimelineNodeLayout';
import { useActiveTimelineNode } from '@/hooks/useActiveTimelineNode';
import { DesktopUnitHeader } from "../path-ui/DesktopUnitHeader";
import { formatCombiningChar } from "@/lib/alphabet-utils";
import { LessonPathMap } from '../learn/LessonPathMap';
import { useProgressStore } from '@/lib/store';
import { LessonHorizontalCarousel } from './LessonHorizontalCarousel';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';
interface PathDesktopTimelineProps {
  pathType: 'learn' | 'speak' | 'alphabet';
  unit: any;
  unitLessons: any[];
  activeUnitIndex: number;
  totalUnits: number;
  language: string;
  lessonLevels: Record<string, number>;
  suggestedLessonId: string | null;
  mounted: boolean;
  handleUnitSelect: (index: number) => void;
  setShowDesktopUnitsList: (open: boolean) => void;
  setSelectedLesson: (data: any) => void;
  setModalLevel: (level: number | null) => void;
  setLockedReviewModalOpen: (open: boolean) => void;
  maxLevelPerLesson?: number;
  nextUnit?: any;
  selectedLesson?: any;
  lessonStars?: Record<string, number[]>;
  modalLevel?: number | null;
}

export default function PathDesktopTimeline({
  pathType,
  unit,
  unitLessons,
  activeUnitIndex,
  totalUnits,
  language,
  lessonLevels,
  suggestedLessonId,
  mounted,
  handleUnitSelect,
  setShowDesktopUnitsList,
  setSelectedLesson,
  setModalLevel,
  setLockedReviewModalOpen,
  maxLevelPerLesson = 10,
  nextUnit,
  selectedLesson,
  lessonStars,
  modalLevel
}: PathDesktopTimelineProps) {
  const currentPartsCompleted = useProgressStore(state => state.lessonPartsCompleted);
  const maxLevelsInUnit = unitLessons.length * maxLevelPerLesson;
  const completedLevelsInUnit = mounted ? unitLessons.reduce((acc: number, l: any) => acc + Math.min(lessonLevels[l.id] || 0, maxLevelPerLesson), 0) : 0;
  const progressPercent = mounted ? (completedLevelsInUnit / maxLevelsInUnit) * 100 : 0;

  const [activeCenteredLessonId, setActiveCenteredLessonId] = useActiveTimelineNode(unitLessons.length > 0 ? unitLessons[0].id : null);

  let masteryKey = 'auto.mastery_5';
  let levelsDescription = '';
  if (pathType === 'alphabet') {
    masteryKey = 'auto.mastery_13';
    levelsDescription = getTranslation('auto.4_levels_per_letter_total_mast', language);
  } else if (pathType === 'speak') {
    levelsDescription = maxLevelPerLesson === 5 ? getTranslation('auto.5_levels_per_lesson_total_mas', language) : `${maxLevelPerLesson} ${getTranslation('auto.levels', language)}`;
  } else {
    levelsDescription = getTranslation('auto.10_levels_per_lesson_total_mas', language);
  }

  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [isInitializingScroll, setIsInitializingScroll] = useState(true);
  const hasInitializedScrollRef = useRef(false);

  // Guaranteed fog dismissal after 800ms
  useEffect(() => {
      if (!mounted) return;
      const fallbackTimer = setTimeout(() => setIsInitializingScroll(false), 800);
      return () => clearTimeout(fallbackTimer);
  }, [mounted]);

  // Scroll logic that only runs once
  useEffect(() => {
    if (!mounted || hasInitializedScrollRef.current) return;
    
    // Wait until unitLessons has data
    if (!unitLessons || unitLessons.length === 0) return;

    hasInitializedScrollRef.current = true;

    let toExpand = null;
    if (suggestedLessonId) {
        toExpand = unitLessons.find(l => l.id === suggestedLessonId);
    }
    if (!toExpand) {
        toExpand = unitLessons.find(l => (lessonLevels[l.id] || 0) < maxLevelPerLesson);
    }

    if (toExpand) {
        setExpandedLessons(new Set([toExpand.id]));
        
        const hasAnyProgressInUnit = unitLessons.some(l => {
            if ((lessonLevels[l.id] || 0) > 0) return true;
            const partsKey = `${l.id}_level-0`;
            if ((currentPartsCompleted[partsKey] || []).length > 0) return true;
            return false;
        });

        if (hasAnyProgressInUnit) {
            // Scroll to the card instantly (no cleanup so it's guaranteed to run)
            (window as any)._isProgrammaticScroll = Date.now();
            setTimeout(() => {
                const circleEl = document.getElementById(`desktop-node-circle-${toExpand?.id}`);
                if (circleEl) {
                    (window as any)._isProgrammaticScroll = Date.now();
                    circleEl.scrollIntoView({ behavior: 'auto', block: 'center' });
                } else {
                    const nodeEl = document.getElementById(`desktop-node-${toExpand?.id}`);
                    if (nodeEl) {
                        (window as any)._isProgrammaticScroll = Date.now();
                        nodeEl.scrollIntoView({ behavior: 'auto', block: 'center' });
                    }
                }
            }, 450);
        }
    }
  }, [mounted, unitLessons, suggestedLessonId, lessonLevels, maxLevelPerLesson]);

    // Logic for active lesson index
    const [activeLessonIndex, setActiveLessonIndex] = React.useState(0);
    const screen2Ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!mounted || !unitLessons || unitLessons.length === 0) return;
        
        let toExpandIdx = 0;
        if (selectedLesson && selectedLesson.lesson) {
             toExpandIdx = unitLessons.findIndex(l => l.id === selectedLesson.lesson.id);
        } else if (suggestedLessonId) {
             toExpandIdx = unitLessons.findIndex(l => l.id === suggestedLessonId);
        } else {
             const idx = unitLessons.findIndex(l => (lessonLevels[l.id] || 0) < maxLevelPerLesson);
             if (idx !== -1) toExpandIdx = idx;
        }
        
        if (toExpandIdx !== -1) {
            setActiveLessonIndex(toExpandIdx);
        }
    }, [mounted, unitLessons, suggestedLessonId, lessonLevels, maxLevelPerLesson, selectedLesson]);

    // Intersection Observer to hide/show global header when on Screen 2
    React.useEffect(() => {
        const el = screen2Ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    window.dispatchEvent(new Event('hideGlobalHeader'));
                    window.dispatchEvent(new Event('hideGlobalFooter'));
                } else {
                    window.dispatchEvent(new Event('showGlobalHeader'));
                    window.dispatchEvent(new Event('showGlobalFooter'));
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Initial Scroll handling for returning from lesson
    React.useEffect(() => {
        if (!mounted || hasInitializedScrollRef.current) return;
        if (!unitLessons || unitLessons.length === 0) return;
        hasInitializedScrollRef.current = true;

        if (selectedLesson) {
             setTimeout(() => {
                  screen2Ref.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
             }, 100);
        }
    }, [mounted, unitLessons, selectedLesson]);

    const activeQuests = []; // On Desktop, quests are handled in sidebar or modal, but let's just rely on the same logic if we want to display them here.
    // We can get them from store
    const { dailyQuests } = useProgressStore();
    const activeDesktopQuests = dailyQuests?.[pathType === 'speak' ? 'speak' : 'learn']?.filter(q => !q.completed) || [];

    const handleAccessLessons = () => {
         screen2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const activeLesson = unitLessons[activeLessonIndex];
    const activeLessonLevel = activeLesson && mounted ? (lessonLevels[activeLesson.id] || 0) : 0;

  return (
    <div key={`desktop-unit-${unit.id}`} className="flex flex-col w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <AnimatePresence>
        {mounted && isInitializingScroll && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[150] bg-slate-50/90 flex flex-col items-center justify-center backdrop-blur-md touch-none"
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
          >
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin opacity-80" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCREEN 1: Base UI */}
      <div className="w-full min-h-[100dvh] snap-start flex flex-col items-center pt-[80px] pb-8 relative z-0">
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
              <DesktopUnitHeader
                unit={unit}
                language={language}
                completedLevels={completedLevelsInUnit}
                maxLevels={maxLevelsInUnit}
                progressPercent={progressPercent}
                mounted={mounted}
                masteryKey={masteryKey}
                levelsDescription={levelsDescription}
                onOpenUnitsList={() => {
                  setShowDesktopUnitsList(true);
                  setSelectedLesson(null);
                }}
              />

              {mounted && activeDesktopQuests.length > 0 && (
                  <div className="flex flex-col gap-3 mt-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">
                          {getTranslation('auto.daily_quests', language) || 'Quêtes Journalières'}
                      </h3>
                      {activeDesktopQuests.map((quest, idx) => (
                          <div key={idx} className="flex flex-col gap-2">
                              <div className="flex justify-between items-center font-bold text-slate-700">
                                  <span>{getLocalizedField(quest, 'title', language)}</span>
                                  <span className="text-slate-400">{quest.progress} / {quest.target}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(quest.progress / quest.target) * 100}%` }} />
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              <div className="flex justify-center mt-8 w-full">
                   <button onClick={handleAccessLessons} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-2xl shadow-sm text-xl flex items-center gap-3 transition-colors">
                       <BookOpen size={28} /> {getTranslation('auto.lessons', language) || 'Accès aux leçons'}
                   </button>
              </div>

              {/* Quick Actions (Next / Practice) */}
              <div className="flex justify-center w-full mt-6 mb-8 z-10 relative">
                  <QuickActionsWidget 
                      variant="desktop-floating" 
                      pathType={pathType} 
                  />
              </div>
          </div>
      </div>

      {/* SCREEN 2: Lesson Map */}
      {activeLesson && (
          <div 
              ref={screen2Ref} 
              className="w-full min-h-[100dvh] snap-start flex flex-col relative z-50 bg-[#FAFAFA]"
          >
              <div className="sticky top-0 z-[60] w-full max-w-4xl mx-auto">
                   <LessonHorizontalCarousel 
                       lessons={unitLessons}
                       activeLessonIndex={activeLessonIndex}
                       onLessonChange={(idx) => {
                           setActiveLessonIndex(idx);
                           if (setModalLevel) setModalLevel(null);
                       }}
                       language={language}
                       pathType={pathType}
                   />
              </div>
              <div className="flex-1 w-full max-w-4xl mx-auto px-4 pb-12 flex flex-col items-center pt-8">
                   <div className="w-full relative min-h-[600px] bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                        <LessonPathMap
                            key={activeLesson.id}
                            maxLevel={maxLevelPerLesson}
                            currentProgress={activeLessonLevel}
                            modalLevel={modalLevel ?? null}
                            setModalLevel={setModalLevel}
                            earnedStarsArray={lessonStars?.[activeLesson.id] || Array(maxLevelPerLesson + 1).fill(0)}
                            unitColor={unit.colorClass}
                            unitBorder={unit.borderClass}
                            unitText={unit.textClass}
                            language={language}
                            lessonId={activeLesson.id}
                            lesson={activeLesson}
                            lessonPartsCompleted={currentPartsCompleted}
                            suggestionType={pathType}
                            initialScrollLevel={selectedLesson?.initialScrollLevel}
                            disableAutoScroll={!isInitializingScroll}
                            onReady={() => {}}
                            onBack={() => {}}
                        />
                   </div>
              </div>
          </div>
      )}

      {/* SCREEN 3: Next Unit */}
      <div className="w-full min-h-[100dvh] snap-start snap-always flex flex-col items-center justify-center pt-8 pb-32 relative z-50 bg-white">
          <div className="w-full max-w-4xl mx-auto">
            {nextUnit && (
              <NextUnitCard
                nextUnit={nextUnit}
                nextUnitIndex={activeUnitIndex + 1}
                language={language}
                handleUnitSelect={handleUnitSelect}
                isMobile={false}
              />
            )}
          </div>
      </div>
    </div>
  );
}
