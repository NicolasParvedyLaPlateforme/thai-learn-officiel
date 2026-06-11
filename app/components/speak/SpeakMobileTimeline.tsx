import { m as motion } from "motion/react";
import { BookOpen, Star, Target, ChevronRight, CheckCircle, Lock, Play } from 'lucide-react';
import { getTranslation, getLocalizedField } from '../../hooks/useTranslation';
import IconImage from '../../components/IconImage';

interface SpeakMobileTimelineProps {
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
  setModalLevel: (level: number) => void;
  setLockedReviewModalOpen: (open: boolean) => void;
  maxLevelPerLesson?: number;
}

export default function SpeakMobileTimeline({
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
  maxLevelPerLesson
}: SpeakMobileTimelineProps) {
  const maxLevelsInUnit = unitLessons.length * (maxLevelPerLesson || 10);
  const completedLevelsInUnit = mounted ? unitLessons.reduce((acc: number, l: any) => {
    return acc + Math.min(lessonLevels[l.id] || 0, (maxLevelPerLesson || 10));
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
          className={`mb-6 p-4 sm:p-5 ${unit.colorClass} border-b-4 ${unit.borderClass} rounded-2xl text-white shadow-md relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform`}
        >
          {unit.imageUrl && (
            <>
              <IconImage src={unit.imageUrl} alt={unit.title} fill className="object-cover opacity-50 mix-blend-overlay" priority />
              <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-0`}></div>
            </>
          )}
          <div className="relative z-10 w-full flex flex-col items-start text-left">
            <div className="flex justify-between items-start w-full mb-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-md uppercase tracking-tight break-words pr-2">
                {mounted ? getLocalizedField(unit, 'title', language) : unit.title}
              </h2>
            </div>
            <p className={`${unit.imageUrl ? 'text-white' : unit.lightTextClass} mb-4 font-medium text-sm sm:text-base leading-snug drop-shadow`}>
              {mounted ? getLocalizedField(unit, 'description', language) : unit.description}
            </p>

            <div className="w-full">
              <div className="flex flex-col">
                <div className="flex justify-between text-xs font-bold text-white mb-1 px-1 drop-shadow-sm uppercase tracking-wide">
                  <span>{getTranslation('auto.mastery_3', language)}</span>
                  <span>{completedLevelsInUnit} / {maxLevelsInUnit} {getTranslation('auto.levels', language)}</span>
                </div>
                <div className={`w-full ${unit.imageUrl ? 'bg-black/20 backdrop-blur-sm' : 'bg-black/15'} rounded-full h-2 overflow-hidden mb-1 shadow-inner`}>
                  <div
                    className={`bg-white h-full rounded-full transition-all duration-1000 ${unit.imageUrl && 'shadow-[0_0_10px_rgba(255,255,255,0.7)]'}`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className={`${unit.imageUrl ? 'text-white' : unit.lightTextClass} font-bold text-[10px] px-1 drop-shadow-sm`}>
                  {(maxLevelPerLesson || 10) === 10 ? getTranslation('auto.10_levels_lesson_mastery', language) : `${(maxLevelPerLesson || 10)} ${getTranslation('auto.levels', language) || 'niveaux'}`}
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

        <div className="flex flex-col relative w-full items-center mt-8 pb-20">
          <div className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 bg-slate-200 rounded-full z-0"></div>

          {unitLessons.map((lesson, idx) => {
            const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
            let isReviewLocked = false;
            if (lesson.isReview && mounted) {
              const otherLessonsInUnit = unitLessons.filter(l => l.id !== lesson.id && !l.isReview);
              isReviewLocked = !otherLessonsInUnit.every(l => (lessonLevels[l.id] || 0) >= 4);
            }

            const isMaxLevel = level >= (maxLevelPerLesson || 10);
            const showLineToNext = idx < unitLessons.length - 1;
            const lineToNextColor = level > 0 ? unit.colorClass : "bg-slate-200";

            return (
              <motion.div
                id={`mobile-lesson-${lesson.id}`}
                key={`mobile-node-${lesson.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                className="relative flex flex-col items-center w-full scroll-mt-24 z-10 mb-8 sm:mb-12 group"
              >
                <div
                  className={`relative shrink-0 mb-4 z-10 cursor-pointer hover:scale-105 active:scale-95 transition-all`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isReviewLocked) {
                      setLockedReviewModalOpen(true);
                      return;
                    }
                    setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                    setModalLevel(Math.min(level, (maxLevelPerLesson || 10) - 1));
                  }}
                >
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-b-[6px] relative z-10 text-4xl sm:text-5xl font-thai shadow-sm overflow-hidden
                      ${isMaxLevel
                      ? unit.colorClass + ' text-white ' + unit.borderClass
                      : isReviewLocked
                        ? 'bg-slate-100 text-slate-300 border-slate-200 border-2 active:border-b-2 active:translate-y-1'
                        : level >= 8 ? unit.shades.l4 : level >= 6 ? unit.shades.l3 : level >= 3 ? unit.shades.l2 : level >= 1 ? unit.shades.l1
                          : 'bg-white ' + unit.textClass + ' border-slate-200 border-2 active:border-b-2 active:translate-y-1'}`}
                  >
                    {lesson.imageUrl ? (
                      <>
                        <IconImage src={lesson.imageUrl} alt={lesson.title} fill className={`object-cover ${level === 0 && suggestedLessonId !== lesson.id ? 'grayscale opacity-70' : ''} ${isReviewLocked ? 'opacity-30 grayscale' : ''}`} sizes="(max-width: 640px) 5rem, 6rem" />
                        {isMaxLevel && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"><CheckCircle size={40} className="stroke-[3] text-white" /></div>}
                        {isReviewLocked && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/10"><Lock size={40} className="text-slate-500 stroke-[2.5]" /></div>}
                      </>
                    ) : (
                      isMaxLevel ? <CheckCircle size={40} className="stroke-[3]" /> : isReviewLocked ? <Lock size={40} className="fill-slate-200 text-slate-400 stroke-[2.5]" /> : level > 0 ? <CheckCircle size={40} className="stroke-current stroke-[2.5]" /> : lesson.isReview ? <Star size={40} className="fill-current stroke-current" /> : <Play size={40} className="ml-1 fill-current stroke-[2]" />
                    )}
                  </div>
                </div>

                <div
                  className={`w-full max-w-[280px] sm:max-w-[320px] rounded-[1.5rem] p-5 flex flex-col items-center text-center transition-all z-10 border-2 border-b-[6px] cursor-pointer active:translate-y-[4px] active:border-b-2 shadow-sm relative ${isMaxLevel ? 'bg-emerald-50 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : isReviewLocked ? 'bg-slate-50 border-slate-200' : suggestedLessonId === lesson.id ? 'bg-white border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.5)]' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isReviewLocked) {
                      setLockedReviewModalOpen(true);
                      return;
                    }
                    setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                    setModalLevel(Math.min(level, (maxLevelPerLesson || 10) - 1));
                  }}
                >
                  {isMaxLevel ? (
                    <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                      <CheckCircle size={14} className="fill-current text-white stroke-emerald-500" /> {getTranslation('auto.mastered', language)}
                    </div>
                  ) : suggestedLessonId === lesson.id && (
                    <div className="absolute -top-3.5 left-6 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                      <Star size={12} fill="currentColor" /> {getTranslation('auto.suggested', language)}
                    </div>
                  )}
                  <h4 className={`font-extrabold text-xl text-slate-800`}>
                    {mounted ? getLocalizedField(lesson, 'title', language) : lesson.title}
                  </h4>
                  <span className={`text-sm font-bold mt-1 tracking-wide text-slate-500`}>
                    {mounted ? getLocalizedField(lesson, 'description', language) : lesson.description}
                  </span>

                  <div className="w-full mt-4">
                    {level === 0 ? (
                      suggestedLessonId === lesson.id ? (
                        <div className="text-sm font-bold text-slate-400 mt-2 py-1">
                          {getTranslation('auto.start_learning', language)}
                        </div>
                      ) : null
                    ) : (
                      <div className="flex flex-col w-full px-2 gap-1.5 opacity-90 mt-1 z-10">
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 px-1">
                          <span>{getTranslation('auto.mastery_4', language)}</span>
                          <span className={unit.textClass}>{level}/{maxLevelPerLesson || 10}</span>
                        </div>
                        <div className="flex justify-between gap-[2px] w-full">
                          {Array.from({ length: maxLevelPerLesson || 10 }).map((_, i) => (
                            <div key={i} className={`h-2.5 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full ${i < level ? unit.colorClass : 'bg-slate-100'}`}></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {showLineToNext && (
                  <div className={`absolute top-[4.5rem] left-1/2 -translate-x-1/2 w-3 h-[calc(100%+2rem)] sm:h-[calc(100%+3rem)] ${lineToNextColor} z-0`}></div>
                )}
              </motion.div>
            )
          })}

          {activeUnitIndex < totalUnits - 1 && (
            <div className="mt-8 z-10 w-full px-4 relative flex justify-center">
              <button
                onClick={() => handleUnitSelect(activeUnitIndex + 1)}
                className="px-8 py-4 rounded-2xl bg-amber-50 text-amber-500 border-b-4 border-amber-200 hover:bg-amber-100 hover:border-amber-300 hover:text-amber-600 font-extrabold shadow-sm transition-all text-center active:border-b-0 active:translate-y-1 w-full max-w-[280px] sm:max-w-[320px]"
              >
                {mounted && getTranslation('auto.next_unit', language)}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
