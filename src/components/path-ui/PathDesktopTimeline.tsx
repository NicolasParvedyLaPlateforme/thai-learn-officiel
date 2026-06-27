import { m as motion, AnimatePresence } from "motion/react";
import { BookOpen, Star, CheckCircle, Lock, Play, Crown, ChevronLeft } from 'lucide-react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import IconImage from '../ui/IconImage';
import React, { useState, useEffect } from 'react';
import DesktopStickyBanner from '../path-ui/DesktopStickyBanner';
import { SharedLessonCard } from '../path-ui/SharedLessonCard';
import { NextUnitCard } from './NextUnitCard';
import PathTimelineLine from '../path-ui/PathTimelineLine';
import { PathDecorations } from '../path-ui/PathDecorations';
import { DesktopTimelineNodeLayout } from '../path-ui/DesktopTimelineNodeLayout';
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

  useEffect(() => {
    if (selectedLesson && expandedLessons.size === 0) {
      setExpandedLessons(new Set([selectedLesson.lesson.id]));
    }
  }, [selectedLesson]);

  return (
    <div key={`desktop-unit-${unit.id}`} className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <DesktopStickyBanner
        unit={unit}
        language={language}
        mounted={mounted}
        onOpenUnitsList={() => setShowDesktopUnitsList(true)}
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
          onOpenUnitsList={() => setShowDesktopUnitsList(true)}
        />

        <div className="flex flex-col w-full mt-10">
          <div className="flex flex-col relative w-full pb-8 md:pb-16">
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
                <motion.div
                  id={`desktop-lesson-${lesson.id}`}
                  key={`desktop-node-${lesson.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                  className="relative w-full flex flex-col items-center scroll-mt-24 z-10 mb-16 group/node"
                >
                  <div className="w-full flex relative justify-center">
                    <div className="absolute inset-y-0 left-8 md:left-12 lg:left-24 pointer-events-none">
                      <PathTimelineLine level={level} maxLevel={maxLevelPerLesson} colorClass={unit.colorClass} isDesktop={true} />
                    </div>
                    <PathDecorations index={idx} isDesktop={true} />
                    <DesktopTimelineNodeLayout
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
                          onClick={onNodeClick}
                        />
                      }
                      centerNode={
                        <div className="relative">
                          {isMaxLevel && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 drop-shadow-md">
                              <Crown size={28} className="text-amber-400 fill-amber-400" />
                            </div>
                          )}
                          <div
                            className={`relative ${pathType === 'alphabet' ? 'w-20 h-20 text-2xl font-thai' : 'w-16 h-16 md:w-20 md:h-20'} rounded-full flex items-center justify-center border-[6px] transition-transform overflow-hidden bg-white shadow-md hover:scale-105 active:scale-95 cursor-pointer
                          ${isMaxLevel ? unit.colorClass + ' text-white border-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : isReviewLocked ? 'bg-slate-100 text-slate-300 border-white' : level >= (maxLevelPerLesson * 0.8) ? unit.shades.l4 + ' border-white' : level >= (maxLevelPerLesson * 0.6) ? unit.shades.l3 + ' border-white' : level >= (maxLevelPerLesson * 0.3) ? unit.shades.l2 + ' border-white' : level >= 1 ? unit.shades.l1 + ' border-white' : 'bg-white ' + unit.textClass + ' border-slate-200'}`}
                            onClick={onNodeClick}
                          >
                            {pathType === 'alphabet' ? (
                              <>
                                 <div className={`flex items-center justify-center ${level === 0 && suggestedLessonId !== lesson.id ? 'opacity-50' : ''} ${isMaxLevel ? 'opacity-30' : ''}`}>
                                    {lesson.items?.map((i: any) => formatCombiningChar(i.letter)).join('')}
                                 </div>
                                 {isMaxLevel && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                                       <CheckCircle size={36} className="stroke-[3] text-white" />
                                    </div>
                                 )}
                              </>
                            ) : (lesson as any).imageUrl ? (
                              <>
                                <IconImage src={(lesson as any).imageUrl} alt={lesson.title} fill className={`object-cover ${level === 0 && suggestedLessonId !== lesson.id ? 'grayscale opacity-70' : ''} ${isReviewLocked ? 'opacity-30 grayscale' : ''}`} sizes="(max-width: 768px) 4rem, 5rem" />
                                {isMaxLevel && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"><CheckCircle size={32} className="stroke-[3] text-white" /></div>}
                                {isReviewLocked && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/10"><Lock size={32} className="text-slate-500 stroke-[2]" /></div>}
                              </>
                            ) : (
                              isMaxLevel ? <CheckCircle size={32} className="stroke-[3]" /> : isReviewLocked ? <Lock size={32} className="fill-slate-200 text-slate-400 stroke-[2]" /> : isBilan ? <Star size={32} className="fill-current stroke-current" /> : <Play size={32} className="ml-1 fill-current stroke-[2]" />
                            )}
                          </div>
                        </div>
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
                        className="w-full overflow-hidden flex flex-col items-center mt-8 relative"
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
                </motion.div>
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
