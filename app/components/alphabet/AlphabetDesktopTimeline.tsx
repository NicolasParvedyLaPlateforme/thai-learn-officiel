import { m as motion } from "motion/react";
import { BookOpen, Star, CheckCircle, Lock, Crown } from 'lucide-react';
import { getTranslation, getLocalizedField } from '../../hooks/useTranslation';
import IconImage from '../../components/IconImage';
import { useState } from 'react';
import { AlphabetLessonCard } from './AlphabetLessonCard';
import { formatCombiningChar } from '../../lib/alphabet-utils';

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
  setLockedReviewModalOpen: (open: boolean) => void;
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
  setLockedReviewModalOpen,
  maxLevelPerLesson = 4,
  nextUnit
}: AlphabetDesktopTimelineProps) {
  const maxLevelsInUnit = unitLessons.length * maxLevelPerLesson;
  const completedLevelsInUnit = mounted ? unitLessons.reduce((acc: number, l: any) => acc + Math.min(lessonLevels[l.id] || 0, maxLevelPerLesson), 0) : 0;
  const progressPercent = mounted ? (completedLevelsInUnit / maxLevelsInUnit) * 100 : 0;
  
  const [activeCenteredLessonId, setActiveCenteredLessonId] = useState<string | null>(unitLessons.length > 0 ? unitLessons[0].id : null);

  return (
    <div key={`desktop-unit-${unit.id}`} className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div
        onClick={(e) => { e.stopPropagation(); setShowDesktopUnitsList(true); }}
        className={`p-8 md:p-10 ${unit.colorClass} border-b-[6px] ${unit.borderClass} rounded-[2rem] text-white shadow-lg relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform min-h-[200px] flex items-center`}
      >
        {unit.imageUrl && (
          <div 
            className="absolute top-0 right-0 bottom-0 w-[60%] md:w-[55%] z-0 pointer-events-none"
            style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%)', maskImage: 'linear-gradient(to right, transparent 0%, black 25%)' }}
          >
            <IconImage src={unit.imageUrl} alt={unit.title} fill className="object-cover opacity-80" priority />
          </div>
        )}
        
        <div className="relative z-10 w-full md:w-[65%] lg:w-[60%] pr-4 md:pr-8">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-tight">
              {mounted ? getLocalizedField(unit, 'title', language) : unit.title}
            </h2>
          </div>
          <p className={`${unit.lightTextClass || 'text-white/90'} mb-8 font-medium text-lg leading-snug`}>
            {mounted ? getLocalizedField(unit, 'description', language) : unit.description}
          </p>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className={`flex flex-col`}>
                <div className={`text-sm text-white font-bold mb-2 flex justify-between uppercase tracking-wide`}>
                  <span>{getTranslation('auto.mastery_13', language)}</span>
                  <span>{completedLevelsInUnit} / {maxLevelsInUnit} {getTranslation('auto.levels', language)}</span>
                </div>
                <div className={`w-full bg-black/15 rounded-full h-3 overflow-hidden shadow-inner mb-2`}>
                  <div
                    className={`bg-white h-full rounded-full transition-all duration-1000 origin-left`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className={`text-[11px] ${unit.lightTextClass || 'text-white/80'} font-bold`}>
                  {getTranslation('auto.4_levels_per_letter_total_mast', language)}
                </div>
              </div>
            </div>
          </div>
        </div>
        {!unit.imageUrl && (
          <div className={`absolute -bottom-10 -right-10 opacity-10 drop-shadow-2xl text-black rotate-[-15deg] pointer-events-none`}>
            <BookOpen size={200} />
          </div>
        )}
      </div>

      <div className="flex flex-col relative w-full mt-4 pb-32 items-center">
        <div className="absolute left-1/2 top-8 bottom-0 w-3 -translate-x-1/2 bg-slate-200 rounded-full z-0"></div>

        {unitLessons.map((lesson, idx) => {
          const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
          const isMaxLevel = level >= maxLevelPerLesson;
          let isReviewLocked = false; 

          const isLeft = idx % 2 === 0;

          return (
            <motion.div
              id={`desktop-lesson-${lesson.id}`}
              key={`desktop-node-${lesson.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
              className={`relative w-full flex ${isLeft ? 'justify-start' : 'justify-end'} z-10 mb-16 group`}
              onViewportEnter={() => setActiveCenteredLessonId(lesson.id)}
              viewport={{ margin: "-35% 0px -35% 0px" }}
            >
              <div className={`w-1/2 flex ${isLeft ? 'justify-end pr-10 xl:pr-16' : 'justify-start pl-10 xl:pl-16'}`}>
                <div className="w-full max-w-[360px]">
                  <AlphabetLessonCard
                    lesson={lesson}
                    level={level}
                    unit={unit}
                    language={language}
                    isReviewLocked={isReviewLocked}
                    suggestedLessonId={suggestedLessonId}
                    maxLevelPerLesson={maxLevelPerLesson}
                    onClick={() => {
                      setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                      const saved = localStorage.getItem(`last_level_${lesson.id}`);
                      setModalLevel(saved !== null ? parseInt(saved, 10) : null);
                      setShowDesktopUnitsList(false);
                    }}
                  />
                </div>
              </div>

              {/* Center icon */}
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-20">
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
                    const saved = localStorage.getItem(`last_level_${lesson.id}`);
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

              </div>

              {/* Side Image */}
              <div className={`absolute top-1/2 -translate-y-1/2 w-1/2 flex items-center ${isLeft ? 'right-0 justify-start pl-10 xl:pl-20' : 'left-0 justify-end pr-10 xl:pl-20'} z-0`}>
                 <motion.div
                    initial={false}
                    animate={{ 
                       opacity: activeCenteredLessonId === lesson.id ? 0.9 : 0, 
                       x: activeCenteredLessonId === lesson.id ? 0 : (isLeft ? -40 : 40),
                       scale: activeCenteredLessonId === lesson.id ? 1 : 0.9
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-56 h-56 md:w-64 md:h-64 relative rounded-[2rem] overflow-hidden shadow-xl border-4 border-white pointer-events-none"
                 >
                    <IconImage src={lesson.imageUrl || "/images/letters.svg"} alt={lesson.title} fill className="object-cover" sizes="(max-width: 768px) 200px, 500px" />
                 </motion.div>
              </div>
            </motion.div>
          )
        })}

          {nextUnit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative flex items-center w-full z-10 gap-6 md:gap-8 min-h-[8.5rem] py-3 cursor-pointer group mt-4 mb-16"
              onClick={() => handleUnitSelect(activeUnitIndex + 1)}
            >
              <div className="relative shrink-0 py-6 z-10">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-white border-[4px] border-[#FAFAFA] flex items-center justify-center shadow-sm group-hover:scale-105 group-active:scale-95 transition-all ${nextUnit.colorClass || 'bg-indigo-500'} text-white`}>
                  <BookOpen size={32} className="fill-current" />
                </div>
              </div>

              <div className="flex-1 rounded-[1.5rem] border-2 border-slate-100 border-b-[4px] p-5 md:p-6 bg-white flex flex-col justify-center shadow-sm group-hover:border-slate-200 group-hover:-translate-y-1 group-active:border-b-2 group-active:translate-y-0 transition-all">
                <span className={`text-xs font-black uppercase tracking-wider mb-1 ${nextUnit.textClass || 'text-slate-500'}`}>
                  {getTranslation('auto.next_unit', language)}
                </span>
                <h3 className="text-xl font-extrabold text-slate-700 leading-tight">
                  {getLocalizedField(nextUnit, 'title', language)}
                </h3>
              </div>
            </motion.div>
          )}
      </div>
    </div>
  );
}
