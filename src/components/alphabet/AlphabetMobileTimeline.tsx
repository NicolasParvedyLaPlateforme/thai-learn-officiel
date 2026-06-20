import { m as motion } from "motion/react";
import { BookOpen, Star, Target, ChevronRight, CheckCircle, Lock, Play, Crown } from 'lucide-react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import IconImage from '../ui/IconImage';
import { AlphabetLessonCard } from './AlphabetLessonCard';
import { formatCombiningChar } from "@/lib/alphabet-utils";
import { NextUnitCard } from '../learn/NextUnitCard';
import PathTimelineLine from "@/components/path-ui/PathTimelineLine";
import { PathDecorations } from "@/components/path-ui/PathDecorations";

interface AlphabetMobileTimelineProps {
  unit: any;
  unitLessons: any[];
  activeUnitIndex: number;
  totalUnits: number;
  language: string;
  lessonLevels: Record<string, number>;
  suggestedLessonId: string | null;
  alphabetQuests: any[];
  mounted: boolean;
  handleUnitSelect: (index: number) => void;
  setIsUnitsModalOpen: (open: boolean) => void;
  setIsQuestsModalOpen: (open: boolean) => void;
  setSelectedLesson: (data: any) => void;
  setModalLevel: (level: number | null) => void;
  maxLevelPerLesson?: number;
  nextUnit?: any;
}

export default function AlphabetMobileTimeline({
  unit,
  unitLessons,
  activeUnitIndex,
  totalUnits,
  language,
  lessonLevels,
  suggestedLessonId,
  alphabetQuests,
  mounted,
  handleUnitSelect,
  setIsUnitsModalOpen,
  setIsQuestsModalOpen,
  setSelectedLesson,
  setModalLevel,
  maxLevelPerLesson = 4,
  nextUnit
}: AlphabetMobileTimelineProps) {
  const maxLevelsInUnit = unitLessons.length * maxLevelPerLesson;
  const completedLevelsInUnit = mounted ? unitLessons.reduce((acc: number, l: any) => {
    return acc + Math.min(lessonLevels[l.id] || 0, maxLevelPerLesson);
  }, 0) : 0;
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
          className={`mb-6 p-5 sm:p-6 ${unit.colorClass} rounded-2xl text-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform min-h-[160px] flex items-center group`}
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
            <div className="flex justify-between items-start w-full mb-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words pr-2 drop-shadow-sm">
                {mounted ? getLocalizedField(unit, 'title', language) : unit.title}
              </h2>
            </div>
            <p className={`${unit.lightTextClass || 'text-white/90'} mb-5 font-medium text-sm sm:text-base leading-snug drop-shadow-sm`}>
              {mounted ? getLocalizedField(unit, 'description', language) : unit.description}
            </p>

            <div className="w-full">
              <div className="flex flex-col">
                <div className={`flex justify-between text-xs font-bold text-white mb-1.5 uppercase tracking-wide drop-shadow-sm`}>
                  <span>{getTranslation('auto.mastery_13', language)}</span>
                  <span>{completedLevelsInUnit} / {maxLevelsInUnit} {getTranslation('auto.levels', language)}</span>
                </div>
                <div className={`w-full bg-black/20 backdrop-blur-sm rounded-full h-2.5 overflow-hidden mb-1 shadow-inner`}>
                  <div
                    className={`bg-white h-full rounded-full transition-all duration-1000 origin-left`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className={`${unit.lightTextClass || 'text-white/80'} font-bold text-[10px] drop-shadow-sm`}>
                  {getTranslation('auto.4_levels_per_letter_total_mast', language)}
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
            className="xl:hidden mt-6 w-full bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md cursor-pointer active:scale-95 transition-all gap-2 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                <Target size={20} className="text-emerald-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-400">
                  {getTranslation('auto.daily_quest', language)}
                </span>
                {alphabetQuests.filter(q => !q.completed).length > 0 ? (
                  <span className="text-sm font-bold text-slate-700 truncate">
                    {getLocalizedField(alphabetQuests.filter(q => !q.completed)[0], 'title', language)}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-emerald-600 truncate">
                    {getTranslation('auto.all_quests_completed', language)}
                  </span>
                )}
              </div>
            </div>
            {alphabetQuests.filter(q => !q.completed).length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-slate-400 whitespace-nowrap">
                  {alphabetQuests.filter(q => !q.completed)[0].progress} / {alphabetQuests.filter(q => !q.completed)[0].target}
                </span>
                <ChevronRight size={18} className="text-slate-300 shrink-0" />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col w-full mt-8 pl-2 pr-2 sm:pl-4 sm:pr-4">
          <div className="flex flex-col relative w-full pb-8">
          {unitLessons.map((lesson, idx) => {
            const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
            let isReviewLocked = false;
            
            const isMaxLevel = level >= maxLevelPerLesson;
            const showLineToNext = idx < unitLessons.length - 1;

            return (
              <motion.div
                id={`mobile-lesson-${lesson.id}`}
                key={`mobile-node-${lesson.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                className="relative flex flex-row items-center w-full scroll-mt-24 z-10 mb-6 sm:mb-8 group gap-3 sm:gap-4"
              >
                <PathTimelineLine level={level} maxLevel={maxLevelPerLesson} colorClass={unit.colorClass} />
                <PathDecorations index={idx} isDesktop={false} />

                <div
                  className={`relative shrink-0 z-10 cursor-pointer hover:scale-105 active:scale-95 transition-all`}
                    onClick={(e) => {
                    e.stopPropagation();
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
                      : level >= 3 ? unit.shades.l3 + ' border-white' : level >= 2 ? unit.shades.l2 + ' border-white' : level >= 1 ? unit.shades.l1 + ' border-white'
                          : 'bg-white ' + unit.textClass + ' border-slate-200'}`}
                  >
                    {isMaxLevel ? <CheckCircle size={22} className="stroke-[3]" /> : level > 0 ? <CheckCircle size={22} className="stroke-current stroke-[2.5]" /> : <Play size={22} className="ml-0.5 fill-current stroke-[2]" />}
                  </div>

                  {(!isMaxLevel && level > 0) && (
                    <div className={`absolute -right-1 -top-1 sm:top-0 ${unit.colorClass} text-white rounded-full p-0.5 border border-white z-20 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center`}>
                      <span className="text-[8px] sm:text-[9px] font-bold">{level}/4</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 z-10">
                  <AlphabetLessonCard 
                    lesson={lesson}
                    level={level}
                    unit={unit}
                    language={language}
                    isReviewLocked={isReviewLocked}
                    suggestedLessonId={suggestedLessonId}
                    maxLevelPerLesson={maxLevelPerLesson}
                    isMobileLayout={true}
                    onClick={() => {
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
