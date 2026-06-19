import { m as motion } from "motion/react";
import { BookOpen, Star, Target, ChevronRight, CheckCircle, Lock, Play, Crown } from 'lucide-react';
import { getTranslation, getLocalizedField } from '../../hooks/useTranslation';
import IconImage from '../../components/IconImage';

interface LearnMobileTimelineProps {
  unit: any;
  unitLessons: any[];
  activeUnitIndex: number;
  totalUnits: number;
  language: string;
  lessonLevels: Record<string, number>;
  suggestedLessonId: string | null;
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

import { LessonCard } from './LessonCard';
import { NextUnitCard } from '../NextUnitCard';

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
  setSelectedLesson,
  setModalLevel,
  setLockedReviewModalOpen,
  nextUnit
}: LearnMobileTimelineProps) {
  const maxLevelsInUnit = unitLessons.length * 10;
  const completedLevelsInUnit = mounted ? unitLessons.reduce((acc, l) => acc + (lessonLevels[l.id] || 0), 0) : 0;
  const progressPercent = mounted ? (completedLevelsInUnit / maxLevelsInUnit) * 100 : 0;

  return (
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
          className={`mb-6 p-4 sm:p-5 ${unit.colorClass} border-b-4 ${unit.borderClass} -mx-4 -mt-2 text-white shadow-md relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform min-h-[140px] flex items-center`}
        >
          {unit.imageUrl && (
            <div 
              className="absolute top-0 right-0 bottom-0 w-[60%] sm:w-[50%] z-0 pointer-events-none"
              style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)', maskImage: 'linear-gradient(to right, transparent 0%, black 35%)' }}
            >
              <IconImage src={unit.imageUrl} alt={unit.title} fill className="object-cover opacity-80" priority />
            </div>
          )}
          
          <div className="relative z-10 w-[80%] sm:w-[70%] flex flex-col items-start text-left">
            <div className="flex justify-between items-start w-full mb-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight break-words pr-2">
                {mounted ? getLocalizedField(unit, 'title', language) : unit.title}
              </h2>
            </div>
            <p className={`${unit.lightTextClass || 'text-white/90'} mb-4 font-medium text-sm sm:text-base leading-snug`}>
              {mounted ? getLocalizedField(unit, 'description', language) : unit.description}
            </p>

            <div className="w-full">
              <div className="flex flex-col">
                <div className="flex justify-between text-xs font-bold text-white mb-1 px-1 uppercase tracking-wide">
                  <span>{getTranslation('auto.mastery_3', language)}</span>
                  <span>{completedLevelsInUnit} / {maxLevelsInUnit} {getTranslation('auto.levels', language)}</span>
                </div>
                <div className={`w-full bg-black/15 rounded-full h-2 overflow-hidden mb-1 shadow-inner`}>
                  <div
                    className={`bg-white h-full rounded-full transition-all duration-1000 origin-left`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className={`${unit.lightTextClass || 'text-white/80'} font-bold text-[10px] px-1`}>
                  {getTranslation('auto.10_levels_lesson_mastery', language)}
                </div>
              </div>
            </div>
          </div>
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

        {mounted && (
          <div
            onClick={() => setIsQuestsModalOpen(true)}
            className="xl:hidden mt-6 w-full bg-white rounded-2xl border-2 border-slate-100 p-4 shadow-sm flex items-center justify-between cursor-pointer active:scale-95 transition-transform gap-2"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Target size={20} className="text-emerald-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-400">
                  {getTranslation('auto.daily_quest', language)}
                </span>
                {learnQuests.filter(q => !q.completed).length > 0 ? (
                  <span className="text-sm font-bold text-slate-700 truncate">
                    {getLocalizedField(learnQuests.filter(q => !q.completed)[0], 'title', language)}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-emerald-600 truncate">
                    {getTranslation('auto.all_quests_completed', language)}
                  </span>
                )}
              </div>
            </div>
            {learnQuests.filter(q => !q.completed).length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-slate-400 whitespace-nowrap">
                  {learnQuests.filter(q => !q.completed)[0].progress} / {learnQuests.filter(q => !q.completed)[0].target}
                </span>
                <ChevronRight size={18} className="text-slate-300 shrink-0" />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col w-full mt-8 pl-2 pr-2 sm:pl-4 sm:pr-4">
          <div className="flex flex-col relative w-full pb-8">
            <div className={`absolute left-[1.25rem] sm:left-[1.5rem] top-0 bottom-0 w-2 -translate-x-1/2 ${unit.colorClass} rounded-full z-0 opacity-80`}></div>

          {unitLessons.map((lesson, idx) => {
            const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
            let isReviewLocked = false;
            if (lesson.isReview && mounted) {
              const otherLessonsInUnit = unitLessons.filter(l => l.id !== lesson.id && !l.isReview);
              isReviewLocked = !otherLessonsInUnit.every(l => (lessonLevels[l.id] || 0) >= 4);
            }

            const isMaxLevel = level >= 10;

            return (
              <motion.div
                id={`mobile-lesson-${lesson.id}`}
                key={`mobile-node-${lesson.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                className="relative flex flex-row items-center w-full scroll-mt-24 z-10 mb-6 sm:mb-8 group gap-3 sm:gap-4"
              >
                {/* Compact Timeline Node */}
                <div
                  className={`relative shrink-0 z-10 cursor-pointer hover:scale-105 active:scale-95 transition-all`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isReviewLocked) {
                      setLockedReviewModalOpen(true);
                      return;
                    }
                    setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                    setModalLevel(null);
                  }}
                >
                  {isMaxLevel && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 drop-shadow-md">
                      <Crown size={22} className="text-amber-400 fill-amber-400" />
                    </div>
                  )}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-[4px] relative z-10 shadow-sm overflow-hidden
                      ${isMaxLevel
                      ? unit.colorClass + ' text-white border-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : isReviewLocked
                        ? 'bg-slate-100 text-slate-300 border-white'
                        : level >= 8 ? unit.shades.l4 + ' border-white' : level >= 6 ? unit.shades.l3 + ' border-white' : level >= 3 ? unit.shades.l2 + ' border-white' : level >= 1 ? unit.shades.l1 + ' border-white'
                          : 'bg-white ' + unit.textClass + ' border-slate-200'}`}
                  >
                    {isMaxLevel ? <CheckCircle size={22} className="stroke-[3]" /> : isReviewLocked ? <Lock size={18} className="fill-slate-200 text-slate-400 stroke-[2.5]" /> : level > 0 ? <CheckCircle size={22} className="stroke-current stroke-[2.5]" /> : lesson.isReview ? <Star size={20} className="fill-current stroke-current" /> : <Play size={22} className="ml-0.5 fill-current stroke-[2]" />}
                  </div>
                </div>

                {/* Lesson Card */}
                <div className="flex-1 min-w-0 z-10">
                  <LessonCard 
                    lesson={lesson}
                    level={level}
                    unit={unit}
                    language={language}
                    isReviewLocked={isReviewLocked}
                    suggestedLessonId={suggestedLessonId}
                    isMobileLayout={true}
                    onClick={() => {
                      if (isReviewLocked) {
                        setLockedReviewModalOpen(true);
                        return;
                      }
                      setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                      setModalLevel(null);
                    }}
                  />
                </div>
              </motion.div>
            )
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
  );
}
