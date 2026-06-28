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
        
        // Scroll to the card instantly (no cleanup so it's guaranteed to run)
        setTimeout(() => {
            const circleEl = document.getElementById(`mobile-node-circle-${toExpand?.id}`);
            if (circleEl) {
                circleEl.scrollIntoView({ behavior: 'auto', block: 'center' });
            } else {
                const nodeEl = document.getElementById(`desktop-node-${toExpand?.id}`);
                if (nodeEl) {
                    nodeEl.scrollIntoView({ behavior: 'auto', block: 'center' });
                }
            }
        }, 100);
    }
  }, [mounted, unitLessons, suggestedLessonId, lessonLevels, maxLevelPerLesson]);

  return (
    <div key={`desktop-unit-${unit.id}`} className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <AnimatePresence>
        {mounted && isInitializingScroll && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 z-[60] bg-slate-50/90 flex flex-col items-center justify-center backdrop-blur-md touch-none"
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
          >
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin opacity-80" />
          </motion.div>
        )}
      </AnimatePresence>

      <DesktopStickyBanner
        unit={unit}
        language={language}
        mounted={mounted}
        onOpenUnitsList={() => {
          setShowDesktopUnitsList(true);
          setSelectedLesson(null);
        }}
      />

      <div className="flex flex-col gap-8 w-full relative">
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

        <div className="flex flex-col w-full mt-10">
          <div className="flex flex-col relative w-full pb-4 md:pb-8">
            {unitLessons.map((lesson, idx) => {
              const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
              const isMaxLevel = level >= maxLevelPerLesson;
              const isBilan = lesson.isReview || lesson.id?.startsWith('bilan-') || lesson.id?.includes('-bilan');
              let isReviewLocked = false;
              if (isBilan && mounted && pathType !== 'alphabet') {
                const otherLessonsInUnit = unitLessons.filter(l => l.id !== lesson.id && !l.isReview && !l.id?.startsWith('bilan-') && !l.id?.includes('-bilan'));
                isReviewLocked = !otherLessonsInUnit.every(l => (lessonLevels[l.id] || 0) >= 4);
              }

              const onNodeClick = (e?: React.MouseEvent) => {
                if (e) e.stopPropagation();
                if (isReviewLocked) {
                  setLockedReviewModalOpen(true);
                  return;
                }
                
                const isCurrentlyExpanded = expandedLessons.has(lesson.id);
                
                setExpandedLessons(prev => {
                  const next = new Set(prev);
                  if (next.has(lesson.id)) {
                    next.delete(lesson.id);
                  } else {
                    next.add(lesson.id);
                  }
                  return next;
                });

                if (isCurrentlyExpanded) {
                  if (selectedLesson?.lesson.id === lesson.id) {
                    setSelectedLesson(null);
                  }
                } else {
                  setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                  const storageKey = pathType === 'speak' ? `last_speak_level_${lesson.id}` : pathType === 'alphabet' ? `last_alphabet_level_${lesson.id}` : `last_level_${lesson.id}`;
                  const saved = localStorage.getItem(storageKey);
                  setModalLevel(saved !== null ? parseInt(saved, 10) : null);
                }

                setShowDesktopUnitsList(false);
              };

              return (
                <div id={`desktop-node-${lesson.id}`} key={`desktop-node-${lesson.id}`} className="w-full relative">
                  <div className="w-full relative">
                    <MobileTimelineNodeLayout
                      lessonId={lesson.id}
                      index={idx}
                      level={level}
                      maxLevel={maxLevelPerLesson}
                      unitColorClass={unit.colorClass}
                      unitTextClass={unit.textClass}
                      unitShades={unit.shades}
                      isReviewLocked={isReviewLocked}
                      isMaxLevel={isMaxLevel}
                      isReview={isBilan}
                      onNodeClick={onNodeClick}
                      lesson={lesson}
                      cardContent={
                        <SharedLessonCard
                          pathType={pathType}
                          lesson={lesson}
                          level={level}
                          maxLevelPerLesson={maxLevelPerLesson}
                          unit={unit}
                          language={language}
                          isReviewLocked={isReviewLocked}
                          suggestedLessonId={suggestedLessonId}
                          isMobileLayout={true}
                          onClick={onNodeClick}
                        />
                      }
                    />
                  </div>

                  <AnimatePresence>
                    {expandedLessons.has(lesson.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        className="w-full overflow-visible flex flex-col items-center pt-[60px] relative"
                      >
                        <div className="w-full relative">
                          <LessonPathMap
                            maxLevel={maxLevelPerLesson}
                            currentProgress={level}
                            modalLevel={modalLevel ?? null}
                            setModalLevel={setModalLevel}
                            earnedStarsArray={lessonStars?.[lesson.id] || Array(maxLevelPerLesson + 1).fill(0)}
                            unitColor={unit.colorClass}
                            unitBorder={unit.borderClass}
                            unitText={unit.textClass}
                            language={language}
                            lessonId={lesson.id}
                            lesson={lesson}
                            lessonPartsCompleted={useProgressStore.getState().lessonPartsCompleted}
                            suggestionType={pathType}
                            initialScrollLevel={selectedLesson?.initialScrollLevel}
                            onReady={() => {}}
                            onBack={() => {
                              setExpandedLessons(prev => {
                                const next = new Set(prev);
                                next.delete(lesson.id);
                                return next;
                              });
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

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
