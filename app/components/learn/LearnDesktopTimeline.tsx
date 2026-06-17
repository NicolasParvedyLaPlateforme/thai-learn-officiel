import { m as motion } from "motion/react";
import { BookOpen, Star, CheckCircle, Lock, Play } from 'lucide-react';
import { getTranslation, getLocalizedField } from '../../hooks/useTranslation';
import IconImage from '../../components/IconImage';

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
  setSelectedLesson: (data: any) => void;
  setModalLevel: (level: number | null) => void;
  setLockedReviewModalOpen: (open: boolean) => void;
}

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
  setLockedReviewModalOpen
}: LearnDesktopTimelineProps) {
  const maxLevelsInUnit = unitLessons.length * 10;
  const completedLevelsInUnit = mounted ? unitLessons.reduce((acc, l) => acc + (lessonLevels[l.id] || 0), 0) : 0;
  const progressPercent = mounted ? (completedLevelsInUnit / maxLevelsInUnit) * 100 : 0;

  return (
    <div key={`desktop-unit-${unit.id}`} className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div
        onClick={(e) => { e.stopPropagation(); setShowDesktopUnitsList(true); }}
        className={`p-8 md:p-10 ${unit.colorClass} border-b-[6px] ${unit.borderClass} rounded-3xl text-white shadow-xl relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform`}
      >
        {unit.imageUrl && (
          <>
            <IconImage src={unit.imageUrl} alt={unit.title} fill className="object-cover opacity-50 mix-blend-overlay" priority />
            <div className={`absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent z-0`}></div>
            <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-0`}></div>
          </>
        )}
        <div className="relative z-10 w-full">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white drop-shadow-md uppercase tracking-tight">
              {getLocalizedField(unit, 'title', language)}
            </h2>
          </div>
          <p className={`${unit.imageUrl ? 'text-white' : unit.lightTextClass} mb-10 font-medium text-xl drop-shadow`}>
            {getLocalizedField(unit, 'description', language)}
          </p>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className={`flex flex-col mb-3`}>
                <div className={`text-sm text-white font-bold mb-2 flex justify-between uppercase tracking-wide drop-shadow-sm`}>
                  <span>{getTranslation('auto.mastery_5', language)}</span>
                  <span>{completedLevelsInUnit} / {maxLevelsInUnit} {getTranslation('auto.levels', language)}</span>
                </div>
                <div className={`w-full ${unit.imageUrl ? 'bg-black/20 backdrop-blur-sm' : unit.bgMutedClass} rounded-full h-4 overflow-hidden shadow-inner mb-2`}>
                  <div
                    className={`bg-white h-full rounded-full transition-all duration-1000 origin-left ${unit.imageUrl && 'shadow-[0_0_10px_rgba(255,255,255,0.7)]'}`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className={`text-sm ${unit.imageUrl ? 'text-white' : unit.lightTextClass} font-bold drop-shadow-sm`}>
                  {getTranslation('auto.10_levels_per_lesson_total_mas', language)}
                </div>
              </div>
            </div>
          </div>
        </div>
        {!unit.imageUrl && (
          <div className={`absolute -bottom-10 -right-10 opacity-20 drop-shadow-2xl text-black rotate-[-15deg] pointer-events-none`}>
            <BookOpen size={200} />
          </div>
        )}
      </div>

      <div className="flex flex-col relative w-full pl-6 md:pl-10 mt-4 pb-32">
        <div className="absolute left-[calc(3.5rem-5px)] md:left-[calc(5rem-5px)] top-[5rem] bottom-[8rem] w-[10px] bg-slate-200 rounded-full z-0"></div>

        {unitLessons.map((lesson, idx) => {
          const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
          let isReviewLocked = false;
          if (lesson.isReview && mounted) {
            const otherLessonsInUnit = unitLessons.filter(l => l.id !== lesson.id && !l.isReview);
            isReviewLocked = !otherLessonsInUnit.every(l => (lessonLevels[l.id] || 0) >= 4);
          }

          const showLineToNext = idx < unitLessons.length - 1;
          const lineToNextColor = level > 0 ? unit.colorClass : "bg-slate-200";
          const isMaxLevel = level >= 10;

          return (
            <motion.div
              id={`desktop-lesson-${lesson.id}`}
              key={`desktop-node-${lesson.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
              className="relative flex items-center w-full z-10 gap-6 md:gap-8 min-h-[8.5rem] py-3 group"
            >
              <div
                className={`relative shrink-0 py-6 cursor-pointer hover:brightness-95 hover:scale-105 active:scale-95 transition-all z-10`}
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
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center border-b-[6px] relative z-20 transition-transform overflow-hidden bg-white ${isMaxLevel ? unit.colorClass + ' text-white ' + unit.borderClass : isReviewLocked ? 'bg-slate-100 text-slate-300 border-slate-200 border-2 active:border-b-2 active:translate-y-1' : level >= 8 ? unit.shades.l4 : level >= 6 ? unit.shades.l3 : level >= 3 ? unit.shades.l2 : level >= 1 ? unit.shades.l1 : 'bg-white ' + unit.textClass + ' border-slate-200 border-2 active:border-b-2 active:translate-y-1'}`}>
                  {(lesson as any).imageUrl ? (
                    <>
                      <IconImage src={(lesson as any).imageUrl} alt={lesson.title} fill className={`object-cover ${level === 0 && suggestedLessonId !== lesson.id ? 'grayscale opacity-70' : ''} ${isReviewLocked ? 'opacity-30 grayscale' : ''}`} sizes="(max-width: 768px) 4rem, 5rem" />
                      {isMaxLevel && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"><CheckCircle size={32} className="stroke-[3] text-white" /></div>}
                      {isReviewLocked && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/10"><Lock size={32} className="text-slate-500 stroke-[2]" /></div>}
                    </>
                  ) : (
                    isMaxLevel ? <CheckCircle size={32} className="stroke-[3]" /> : isReviewLocked ? <Lock size={32} className="fill-slate-200 text-slate-400 stroke-[2]" /> : lesson.isReview ? <Star size={32} className="fill-current stroke-current" /> : <Play size={32} className="ml-1 fill-current stroke-[2]" />
                  )}
                </div>
              </div>

              <div
                className={`flex-1 rounded-[1.5rem] border-2 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group border-b-[6px] cursor-pointer active:translate-y-[4px] active:border-b-2 shadow-sm relative z-10 ${isMaxLevel ? 'bg-emerald-50 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : isReviewLocked ? 'bg-slate-50 border-slate-200' : suggestedLessonId === lesson.id ? 'bg-white border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.5)]' : 'bg-white border-slate-200 hover:border-slate-300'}`}
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
                {isMaxLevel ? (
                  <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle size={14} className="fill-current text-white stroke-emerald-500" /> {getTranslation('auto.mastered', language)}
                  </div>
                ) : suggestedLessonId === lesson.id && (
                  <div className="absolute -top-3.5 left-6 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                    <Star size={12} fill="currentColor" /> {getTranslation('auto.suggested', language)}
                  </div>
                )}
                <div className="flex flex-col items-start text-left flex-1 md:pr-4">
                  <h4 className="font-extrabold text-xl text-slate-800">
                    {getLocalizedField(lesson, 'title', language)}
                  </h4>
                  <span className={`text-sm font-bold mt-1 tracking-wide text-slate-500`}>
                    {getLocalizedField(lesson, 'description', language)}
                  </span>
                </div>

                <div className="w-full md:w-48 shrink-0 mt-4 md:mt-0 flex flex-col justify-center">
                  {level === 0 ? (
                    suggestedLessonId === lesson.id ? (
                      <div className="text-sm font-bold text-slate-400 text-left md:text-right">
                        {getTranslation('auto.start_learning', language)}
                      </div>
                    ) : null
                  ) : (
                    <>
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 px-1">
                        <span>{getTranslation('auto.mastery_6', language)}</span>
                        <span className={unit.textClass}>{level}/10</span>
                      </div>
                      <div className="flex justify-between gap-[2px] w-full">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className={`h-3 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full ${i < level ? unit.colorClass : 'bg-slate-100'}`}></div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {showLineToNext && (
                <div className={`absolute top-1/2 left-[calc(2rem-5px)] md:left-[calc(2.5rem-5px)] w-[10px] h-[calc(100%+4rem)] ${lineToNextColor} z-0`}></div>
              )}
            </motion.div>
          )
        })}

        {activeUnitIndex < totalUnits - 1 && (
          <div className="mt-12 z-10 w-full pl-0 md:pl-[6rem] relative flex justify-start">
            <button
              onClick={() => handleUnitSelect(activeUnitIndex + 1)}
              className="px-8 py-4 rounded-2xl bg-amber-50 text-amber-500 hover:bg-amber-100 hover:text-amber-600 font-extrabold shadow-sm transition-all text-center border-2 border-amber-200 border-b-4 active:border-b-2 active:translate-y-1 text-lg w-full max-w-[280px]"
            >
              {getTranslation('auto.next_unit', language)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
