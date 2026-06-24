import React, { useState, useEffect } from 'react';
import { m as motion } from "motion/react";
import { BookOpen, Star, Target, ChevronRight, CheckCircle, Lock, Play, Crown, Map } from 'lucide-react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { useRouter } from 'next/navigation';
import { useNextConversationObjective } from "@/hooks/useNextConversationObjective";
import IconImage from '../ui/IconImage';

interface LearnMobileTimelineProps {
  unit: any;
  unitLessons: any[];
  activeUnitIndex: number;
  totalUnits: number;
  language: string;
  lessonLevels: Record<string, number>;
  suggestedLessonId: string | null;
  globalSuggestedLesson?: any;
  learnQuests: any[];
  mounted: boolean;
  handleUnitSelect: (index: number) => void;
  setIsUnitsModalOpen: (open: boolean) => void;
  setIsQuestsModalOpen: (open: boolean) => void;
  setSelectedLesson: (data: any) => void;
  setModalLevel: (level: number | null) => void;
  setLockedReviewModalOpen: (open: boolean) => void;
  nextUnit?: any;
}

import { SharedLessonCard } from '../path-ui/SharedLessonCard';
import { NextUnitCard } from './NextUnitCard';
import BannerUnitsButton from '../ui/BannerUnitsButton';
import MobileStickyBanner from '../path-ui/MobileStickyBanner';
import PathTimelineLine from "@/components/path-ui/PathTimelineLine";
import { PathDecorations } from "@/components/path-ui/PathDecorations";
import { useMobileTimelineNodeClick } from "@/hooks/useMobileTimelineNodeClick";
import { MobileTimelineNodeLayout } from '../path-ui/MobileTimelineNodeLayout';

export default function LearnMobileTimeline({
  unit,
  unitLessons,
  activeUnitIndex,
  totalUnits,
  language,
  lessonLevels,
  suggestedLessonId,
  learnQuests,
  mounted,
  handleUnitSelect,
  setIsUnitsModalOpen,
  setIsQuestsModalOpen,
  setSelectedLesson,
  setModalLevel,
  setLockedReviewModalOpen,
  nextUnit,
  globalSuggestedLesson
}: LearnMobileTimelineProps) {
  const router = useRouter();
  const storyObjective = useNextConversationObjective();
  
  const handleNodeClick = useMobileTimelineNodeClick({
    setSelectedLesson,
    setModalLevel,
    setLockedReviewModalOpen,
    maxLevelPerLesson: 10
  });
  const maxLevelsInUnit = unitLessons.length * 10;
  const completedLevelsInUnit = mounted ? unitLessons.reduce((acc, l) => acc + (lessonLevels[l.id] || 0), 0) : 0;
  const progressPercent = mounted ? (completedLevelsInUnit / maxLevelsInUnit) * 100 : 0;

  return (
    <>
      <MobileStickyBanner 
        unit={unit} 
        language={language} 
        mounted={mounted} 
        onOpenUnitsList={() => setIsUnitsModalOpen(true)} 
      />

      <main className="max-w-2xl mx-auto px-4 mt-2 flex flex-col gap-8 md:hidden">
        <motion.div
        key={unit.id}
        className="relative z-0"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onPanEnd={(e, info) => {
          const swipeThreshold = 50;
          if (Math.abs(info.offset.x) > Math.abs(info.offset.y) && Math.abs(info.offset.x) > swipeThreshold) {
            if (info.offset.x < 0) {
              if (activeUnitIndex < totalUnits - 1) handleUnitSelect(activeUnitIndex + 1);
              else setIsUnitsModalOpen(true);
            } else {
              if (activeUnitIndex > 0) handleUnitSelect(activeUnitIndex - 1);
              else setIsUnitsModalOpen(true);
            }
          }
        }}
      >
        <div
          onClick={(e) => { e.stopPropagation(); setIsUnitsModalOpen(true); }}
          className={`-mx-4 -mt-2 mb-0 p-5 sm:p-6 pb-6 ${unit.colorClass} rounded-none text-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform min-h-[160px] flex items-center group`}
        >
          {unit.imageUrl && (
            <div 
              className="absolute top-0 right-0 bottom-0 w-[70%] sm:w-[60%] z-0 pointer-events-none overflow-hidden"
              style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)', maskImage: 'linear-gradient(to right, transparent 0%, black 50%)' }}
            >
              <IconImage src={unit.imageUrl} alt={unit.title} fill className="object-cover opacity-85 transition-transform duration-1000 group-hover:scale-105" priority />
            </div>
          )}
          
          <div className="relative z-10 w-[80%] sm:w-[70%] flex flex-col items-start text-left">
            <div className="flex justify-between items-start w-[60%] mb-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words drop-shadow-sm">
                {(() => {
                  const titleStr = mounted ? getLocalizedField(unit, 'title', language) : unit.title;
                  return titleStr.includes(':') ? titleStr.substring(titleStr.indexOf(':') + 1).trim() : titleStr;
                })()}
              </h2>
            </div>
            <p className="text-white w-[60%] mb-0 font-medium text-sm sm:text-base leading-snug drop-shadow-sm">
              {mounted ? getLocalizedField(unit, 'description', language) : unit.description}
            </p>
          </div>
          <BannerUnitsButton 
            onClick={() => setIsUnitsModalOpen(true)} 
            language={language}
            className="absolute bottom-0 right-0 z-20 rounded-tl-[15px] rounded-tr-none rounded-b-none border-b-0 border-r-0"
          />
        {!unit.imageUrl && (
            <>
              <div className={`absolute -bottom-8 -left-8 opacity-10 drop-shadow-lg text-black rotate-[-15deg] pointer-events-none`}>
                <BookOpen size={160} />
              </div>
              <div className={`absolute -top-8 -right-8 opacity-10 drop-shadow-lg text-white rotate-[15deg] pointer-events-none`}>
                <Star size={100} />
              </div>
            </>
          )}
        </div>

        <div className="-mx-4 mb-6 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.03)] flex flex-col">
          <div className="flex justify-between items-center px-5 sm:px-6 py-2.5">
            <span className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              {getTranslation('auto.mastery_3', language)}
            </span>
            <span className="text-xs font-extrabold text-slate-700">
              {completedLevelsInUnit} / {maxLevelsInUnit}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-[6px] shadow-inner">
            <div
              className={`h-full ${unit.colorClass} transition-all duration-1000`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {mounted && (
          learnQuests.filter(q => !q.completed).length > 0 ? (
            <div
              onClick={() => setIsQuestsModalOpen(true)}
              className="xl:hidden mt-6 w-full bg-white rounded-2xl border-0 p-4 shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition-all gap-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Target size={20} className="text-emerald-500" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-400">
                    {getTranslation('auto.daily_quest', language)}
                  </span>
                  <span className="text-sm font-bold text-slate-700 truncate">
                    {getLocalizedField(learnQuests.filter(q => !q.completed)[0], 'title', language)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-slate-400 whitespace-nowrap">
                  {learnQuests.filter(q => !q.completed)[0].progress} / {learnQuests.filter(q => !q.completed)[0].target}
                </span>
                <ChevronRight size={18} className="text-slate-300 shrink-0" />
              </div>
            </div>
          ) : storyObjective ? (
            <div
              onClick={() => setIsQuestsModalOpen(true)}
              className="xl:hidden mt-6 w-full bg-white rounded-2xl border-0 p-4 shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition-all gap-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <Map size={20} className="text-blue-500" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-400">
                    {language === 'en' ? 'Story Objective' : "Objectif d'histoire"}
                  </span>
                  <span className="text-sm font-bold text-slate-700 truncate">
                    {storyObjective.type === 'vocab' 
                      ? getLocalizedField(storyObjective.lesson, 'title', language)
                      : getLocalizedField(storyObjective.conversation, 'title', language)
                    }
                  </span>
                </div>
              </div>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (storyObjective.type === 'vocab') {
                    router.push(`/lesson/${storyObjective.lesson.id}?level=1`);
                  } else {
                    router.push(`/conversations/${storyObjective.conversation.id}${storyObjective.levelToComplete > 0 ? `?level=${storyObjective.levelToComplete}` : ''}`);
                  }
                }}
                className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm text-white hover:bg-emerald-600 transition-colors"
              >
                <Play size={18} className="ml-1 fill-current" />
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsQuestsModalOpen(true)}
              className="xl:hidden mt-6 w-full bg-white rounded-2xl border-0 p-4 shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition-all gap-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Target size={20} className="text-emerald-500" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-400">
                    {getTranslation('auto.daily_quest', language)}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 truncate">
                    {getTranslation('auto.all_quests_completed', language)}
                  </span>
                </div>
              </div>
            </div>
          )
        )}

        <div className="flex flex-col w-full mt-8 pl-2 pr-2 sm:pl-4 sm:pr-4">
          <div className="flex flex-col relative w-full pb-8">
          {unitLessons.map((lesson, idx) => {
            const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
            const isBilan = lesson.isReview || lesson.id?.startsWith('bilan-') || lesson.id?.includes('-bilan');
            let isReviewLocked = false;
            if (isBilan && mounted) {
              const otherLessonsInUnit = unitLessons.filter(l => l.id !== lesson.id && !l.isReview && !l.id?.startsWith('bilan-') && !l.id?.includes('-bilan'));
              isReviewLocked = !otherLessonsInUnit.every(l => (lessonLevels[l.id] || 0) >= 4);
            }

            const isMaxLevel = level >= 10;

            return (
              <MobileTimelineNodeLayout
                key={`mobile-node-${lesson.id}`}
                lessonId={lesson.id}
                index={idx}
                level={level}
                maxLevel={10}
                unitColorClass={unit.colorClass}
                unitTextClass={unit.textClass}
                unitShades={unit.shades}
                isReviewLocked={isReviewLocked}
                isMaxLevel={isMaxLevel}
                isReview={isBilan}
                onNodeClick={handleNodeClick(lesson, level, unit, isReviewLocked, 'learn')}
                cardContent={
                  <SharedLessonCard
                    pathType="learn"
                    lesson={lesson}
                    level={level}
                    unit={unit}
                    language={language}
                    isReviewLocked={isReviewLocked}
                    suggestedLessonId={suggestedLessonId}
                    isMobileLayout={true}
                    index={idx}
                    onClick={() => {
                      if (isReviewLocked) {
                        setLockedReviewModalOpen(true);
                        return;
                      }
                      setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                      setModalLevel(null);
                    }}
                  />
                }
              />
            );
          })}
          </div>

          {nextUnit && (
            <div className="w-full">
              <NextUnitCard
                nextUnit={nextUnit}
                nextUnitIndex={activeUnitIndex + 1}
                language={language}
                handleUnitSelect={handleUnitSelect}
                isMobile={true}
              />
            </div>
          )}
        </div>
      </motion.div>
    </main>
    </>
  );
}
