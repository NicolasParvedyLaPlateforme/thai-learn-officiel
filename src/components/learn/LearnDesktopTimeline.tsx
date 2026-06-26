import { m as motion } from "motion/react";
import { BookOpen, Star, CheckCircle, Lock, Play, Crown, ChevronLeft } from 'lucide-react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import IconImage from '../ui/IconImage';
import React, { useState, useEffect } from 'react';
import BannerUnitsButton from '../ui/BannerUnitsButton';
import DesktopStickyBanner from '../path-ui/DesktopStickyBanner';

interface LearnDesktopTimelineProps {
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
  setModalLevel: (level: number | null) => void;
  setLockedReviewModalOpen: (open: boolean) => void;
  setSelectedLesson: (data: any) => void;
  nextUnit?: any;
}

import { SharedLessonCard } from '../path-ui/SharedLessonCard';
import { NextUnitCard } from './NextUnitCard';
import PathTimelineLine from '../path-ui/PathTimelineLine';
import { PathDecorations } from '../path-ui/PathDecorations';
import { DesktopTimelineNodeLayout } from '../path-ui/DesktopTimelineNodeLayout';
import { useActiveTimelineNode } from '@/hooks/useActiveTimelineNode';
import { DesktopUnitHeader } from "../path-ui/DesktopUnitHeader";

export default function LearnDesktopTimeline({
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
  nextUnit
}: LearnDesktopTimelineProps) {
  const maxLevelsInUnit = unitLessons.length * 10;
  const completedLevelsInUnit = mounted ? unitLessons.reduce((acc, l) => acc + (lessonLevels[l.id] || 0), 0) : 0;
  const progressPercent = mounted ? (completedLevelsInUnit / maxLevelsInUnit) * 100 : 0;

  const [activeCenteredLessonId, setActiveCenteredLessonId] = useActiveTimelineNode(unitLessons.length > 0 ? unitLessons[0].id : null);

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
          masteryKey="auto.mastery_5"
          levelsDescription={getTranslation('auto.10_levels_per_lesson_total_mas', language)}
          onOpenUnitsList={() => setShowDesktopUnitsList(true)}
        />

        <div className="flex flex-col w-full mt-10">
          <div className="flex flex-col relative w-full pb-8 md:pb-16">
            {unitLessons.map((lesson, idx) => {
              const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
              const isBilan = lesson.isReview || lesson.id?.startsWith('bilan-') || lesson.id?.includes('-bilan');
              let isReviewLocked = false;
              if (isBilan && mounted) {
                const otherLessonsInUnit = unitLessons.filter(l => l.id !== lesson.id && !l.isReview && !l.id?.startsWith('bilan-') && !l.id?.includes('-bilan'));
                isReviewLocked = !otherLessonsInUnit.every(l => (lessonLevels[l.id] || 0) >= 4);
              }

              const isMaxLevel = level >= 10;
              const isLeft = idx % 2 === 0;

              return (
                <motion.div
                  id={`desktop-lesson-${lesson.id}`}
                  key={`desktop-node-${lesson.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                  className={`relative w-full flex ${isLeft ? 'justify-start' : 'justify-end'} scroll-mt-24 z-10 mb-16 group/node`}
                >
                  <PathTimelineLine level={level} maxLevel={10} colorClass={unit.colorClass} isDesktop={true} />
                  <PathDecorations index={idx} isDesktop={true} />
                  <DesktopTimelineNodeLayout
                    isLeft={isLeft}
                    cardContent={
                      <SharedLessonCard
                        pathType="learn"
                        lesson={lesson}
                        level={level}
                        unit={unit}
                        language={language}
                        isReviewLocked={isReviewLocked}
                        suggestedLessonId={suggestedLessonId}
                        onClick={() => {
                          if (isReviewLocked) {
                            setLockedReviewModalOpen(true);
                            return;
                          }
                          setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                          const saved = localStorage.getItem(`last_level_${lesson.id}`);
                          setModalLevel(saved !== null ? parseInt(saved, 10) : null);
                          setShowDesktopUnitsList(false);
                        }}
                      />
                    }
                    centerNode={
                      <>
                        {isMaxLevel && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 drop-shadow-md">
                            <Crown size={28} className="text-amber-400 fill-amber-400" />
                          </div>
                        )}
                        <div
                          className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-[6px] transition-transform overflow-hidden bg-white shadow-md hover:scale-105 active:scale-95 cursor-pointer
                        ${isMaxLevel ? unit.colorClass + ' text-white border-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : isReviewLocked ? 'bg-slate-100 text-slate-300 border-white' : level >= 8 ? unit.shades.l4 + ' border-white' : level >= 6 ? unit.shades.l3 + ' border-white' : level >= 3 ? unit.shades.l2 + ' border-white' : level >= 1 ? unit.shades.l1 + ' border-white' : 'bg-white ' + unit.textClass + ' border-slate-200'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isReviewLocked) {
                              setLockedReviewModalOpen(true);
                              return;
                            }
                            setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                            const saved = localStorage.getItem(`last_level_${lesson.id}`);
                            setModalLevel(saved !== null ? parseInt(saved, 10) : null);
                            setShowDesktopUnitsList(false);
                          }}
                        >
                          {(lesson as any).imageUrl ? (
                            <>
                              <IconImage src={(lesson as any).imageUrl} alt={lesson.title} fill className={`object-cover ${level === 0 && suggestedLessonId !== lesson.id ? 'grayscale opacity-70' : ''} ${isReviewLocked ? 'opacity-30 grayscale' : ''}`} sizes="(max-width: 768px) 4rem, 5rem" />
                              {isMaxLevel && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"><CheckCircle size={32} className="stroke-[3] text-white" /></div>}
                              {isReviewLocked && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/10"><Lock size={32} className="text-slate-500 stroke-[2]" /></div>}
                            </>
                          ) : (
                            isMaxLevel ? <CheckCircle size={32} className="stroke-[3]" /> : isReviewLocked ? <Lock size={32} className="fill-slate-200 text-slate-400 stroke-[2]" /> : isBilan ? <Star size={32} className="fill-current stroke-current" /> : <Play size={32} className="ml-1 fill-current stroke-[2]" />
                          )}
                        </div>
                      </>
                    }
                    isImageActive={activeCenteredLessonId === lesson.id}
                    imageNode={
                      (lesson as any).imageUrl ? (
                        <IconImage src={(lesson as any).imageUrl} alt={lesson.title} fill className="object-cover" sizes="(max-width: 768px) 200px, 500px" />
                      ) : undefined
                    }
                  />

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
