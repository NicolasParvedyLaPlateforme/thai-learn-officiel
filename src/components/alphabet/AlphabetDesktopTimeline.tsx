import { m as motion } from "motion/react";
import { BookOpen, Star, CheckCircle, Lock, Crown, ChevronLeft } from 'lucide-react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import IconImage from '../ui/IconImage';
import React, { useState, useEffect } from 'react';
import BannerUnitsButton from '../ui/BannerUnitsButton';
import DesktopStickyBanner from '../path-ui/DesktopStickyBanner';
import { SharedLessonCard } from '../path-ui/SharedLessonCard';
import { formatCombiningChar } from "@/lib/alphabet-utils";
import { NextUnitCard } from '../learn/NextUnitCard';
import PathTimelineLine from '../path-ui/PathTimelineLine';
import { PathDecorations } from '../path-ui/PathDecorations';
import { DesktopTimelineNodeLayout } from '../path-ui/DesktopTimelineNodeLayout';
import { useActiveTimelineNode } from '@/hooks/useActiveTimelineNode';
import { DesktopUnitHeader } from "../path-ui/DesktopUnitHeader";

interface AlphabetDesktopTimelineProps {
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
  maxLevelPerLesson?: number;
  nextUnit?: any;
}

export default function AlphabetDesktopTimeline({
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
  maxLevelPerLesson = 4,
  nextUnit
}: AlphabetDesktopTimelineProps) {
  const maxLevelsInUnit = unitLessons.length * maxLevelPerLesson;
  const completedLevelsInUnit = mounted ? unitLessons.reduce((acc: number, l: any) => acc + Math.min(lessonLevels[l.id] || 0, maxLevelPerLesson), 0) : 0;
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
          masteryKey="auto.mastery_13"
          levelsDescription={getTranslation('auto.4_levels_per_letter_total_mast', language)}
          onOpenUnitsList={() => setShowDesktopUnitsList(true)}
        />

        <div className="flex flex-col w-full mt-10">
          <div className="flex flex-col relative w-full pb-8 md:pb-16">
            {unitLessons.map((lesson, idx) => {
              const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
              const isMaxLevel = level >= maxLevelPerLesson;
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
                  <PathTimelineLine level={level} maxLevel={4} colorClass={unit.colorClass} isDesktop={true} />
                  <PathDecorations index={idx} isDesktop={true} />
                  <DesktopTimelineNodeLayout
                    isLeft={isLeft}
                    cardContent={
                      <SharedLessonCard
                        pathType="alphabet"
                        lesson={lesson}
                        level={level}
                        maxLevelPerLesson={4}
                        unit={unit}
                        language={language}
                        isReviewLocked={false}
                        suggestedLessonId={suggestedLessonId}
                        onClick={() => {
                          setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                          const saved = localStorage.getItem(`last_alphabet_level_${lesson.id}`);
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
                          className={`relative w-20 h-20 rounded-full flex items-center justify-center border-[6px] transition-transform overflow-hidden shadow-md cursor-pointer hover:scale-105 active:scale-95 text-2xl font-thai
                        ${isMaxLevel ? unit.colorClass + ' text-white border-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                              : level >= 3 ? unit.shades.l3 + ' border-white' : level >= 2 ? unit.shades.l2 + ' border-white' : level >= 1 ? unit.shades.l1 + ' border-white'
                                : 'bg-white ' + unit.textClass + ' border-slate-200'}
                      `}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                            const saved = localStorage.getItem(`last_alphabet_level_${lesson.id}`);
                            setModalLevel(saved !== null ? parseInt(saved, 10) : null);
                            setShowDesktopUnitsList(false);
                          }}
                        >
                          <div className={`flex items-center justify-center ${level === 0 && suggestedLessonId !== lesson.id ? 'opacity-50' : ''} ${isMaxLevel ? 'opacity-30' : ''}`}>
                            {lesson.items.map((i: any) => formatCombiningChar(i.letter)).join('')}
                          </div>
                          {isMaxLevel && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center">
                              <CheckCircle size={36} className="stroke-[3] text-white" />
                            </div>
                          )}
                        </div>
                      </>
                    }
                    isImageActive={activeCenteredLessonId === lesson.id}
                    imageNode={
                      <IconImage src={lesson.imageUrl || "/images/letters.svg"} alt={lesson.title} fill className="object-cover" sizes="(max-width: 768px) 200px, 500px" />
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
