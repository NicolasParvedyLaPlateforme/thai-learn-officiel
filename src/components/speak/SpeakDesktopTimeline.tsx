import { m as motion } from "motion/react";
import { BookOpen, Star, CheckCircle, Lock, Play, Crown, ChevronLeft } from 'lucide-react';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import IconImage from '../ui/IconImage';
import { NextUnitCard } from '../learn/NextUnitCard';

import { useState } from 'react';
import { SharedLessonCard } from '../path-ui/SharedLessonCard';
import PathTimelineLine from '../path-ui/PathTimelineLine';
import { PathDecorations } from '../path-ui/PathDecorations';

interface SpeakDesktopTimelineProps {
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

export default function SpeakDesktopTimeline({
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
  maxLevelPerLesson,
  nextUnit
}: SpeakDesktopTimelineProps) {
  const maxLevelsInUnit = unitLessons.length * (maxLevelPerLesson || 10);
  const completedLevelsInUnit = mounted ? unitLessons.reduce((acc: number, l: any) => acc + Math.min(lessonLevels[l.id] || 0, maxLevelPerLesson || 10), 0) : 0;
  const progressPercent = mounted ? (completedLevelsInUnit / maxLevelsInUnit) * 100 : 0;
  
  const [activeCenteredLessonId, setActiveCenteredLessonId] = useState<string | null>(unitLessons.length > 0 ? unitLessons[0].id : null);

  return (
    <div key={`desktop-unit-${unit.id}`} className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div
        onClick={(e) => { e.stopPropagation(); setShowDesktopUnitsList(true); }}
        className={`p-8 md:p-10 ${unit.colorClass} rounded-3xl text-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] relative overflow-hidden cursor-pointer transition-transform min-h-[220px] flex items-center group`}
      >
        {unit.imageUrl && (
          <div 
            className="absolute top-0 right-0 bottom-0 w-[80%] md:w-[70%] z-0 pointer-events-none overflow-hidden"
            style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)', maskImage: 'linear-gradient(to right, transparent 0%, black 40%)' }}
          >
            <IconImage src={unit.imageUrl} alt={unit.title} fill className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105" priority />
          </div>
        )}
        
        <div className="relative z-10 w-full md:w-[65%] lg:w-[60%] pr-4 md:pr-8">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
              {getLocalizedField(unit, 'title', language)}
            </h2>
          </div>
          <p className={`${unit.lightTextClass || 'text-white/90'} mb-8 font-medium text-lg leading-snug drop-shadow-sm max-w-xl`}>
            {getLocalizedField(unit, 'description', language)}
          </p>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className={`flex flex-col`}>
                <div className={`text-sm text-white font-bold mb-2 flex justify-between uppercase tracking-wide drop-shadow-sm`}>
                  <span>{getTranslation('auto.mastery_5', language)}</span>
                  <span>{completedLevelsInUnit} / {maxLevelsInUnit} {getTranslation('auto.levels', language)}</span>
                </div>
                <div className={`w-full bg-black/20 backdrop-blur-sm rounded-full h-3 overflow-hidden shadow-inner mb-2`}>
                  <div
                    className={`bg-white h-full rounded-full transition-all duration-1000 origin-left`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className={`text-[11px] ${unit.lightTextClass || 'text-white/80'} font-bold drop-shadow-sm`}>
                  {(maxLevelPerLesson || 10) === 10 ? getTranslation('auto.10_levels_per_lesson_total_mas', language) : `${maxLevelPerLesson} ${getTranslation('auto.levels', language) || 'niveaux'}`}
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

        <div className="absolute bottom-6 right-6 z-20 hidden md:block">
          <button
            onClick={(e) => { e.stopPropagation(); setShowDesktopUnitsList(true); }}
            className="flex items-center justify-between p-3.5 pr-4 bg-white/80 backdrop-blur-lg border border-white/60 rounded-[1.25rem] shadow-lg transition-all duration-300 group cursor-pointer min-w-[240px]"
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100`}>
                <BookOpen size={20} className={`text-slate-500`} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-[15px] text-slate-800 tracking-tight leading-tight">
                  {getTranslation('auto.course_units', language)}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {getTranslation('auto.change_or_view_units', language)}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 ml-4 rounded-full bg-slate-50 group-hover:bg-slate-100 border border-slate-100 flex items-center justify-center transition-all">
              <ChevronLeft size={16} className="text-slate-400 group-hover:text-slate-600 rotate-180 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col w-full mt-10">
        <div className="flex flex-col relative w-full pb-8 md:pb-16">
        {unitLessons.map((lesson, idx) => {
          const level = mounted ? (lessonLevels[lesson.id] || 0) : 0;
          const isMaxLevel = level >= (maxLevelPerLesson || 10);
          let isReviewLocked = false;
          if (lesson.isReview && mounted) {
            const otherLessonsInUnit = unitLessons.filter(l => l.id !== lesson.id && !l.isReview);
            isReviewLocked = !otherLessonsInUnit.every(l => (lessonLevels[l.id] || 0) >= 4);
          }

          const isLeft = idx % 2 === 0;

          return (
            <motion.div
              id={`desktop-lesson-${lesson.id}`}
              key={`desktop-node-${lesson.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
              onViewportEnter={() => setActiveCenteredLessonId(lesson.id)}
              viewport={{ margin: "-35% 0px -35% 0px" }}
              className={`relative w-full flex ${isLeft ? 'justify-start' : 'justify-end'} scroll-mt-24 z-10 mb-16 group/node`}
            >
              <PathTimelineLine level={level} maxLevel={10} colorClass={unit.colorClass} isDesktop={true} />
              <PathDecorations index={idx} isDesktop={true} />
              <div className={`w-1/2 flex ${isLeft ? 'justify-end pr-10 xl:pr-16' : 'justify-start pl-10 xl:pl-16'}`}>
                <div className="w-full max-w-[360px]">
                  <SharedLessonCard 
                    pathType="speak"
                    lesson={lesson}
                    level={level}
                    unit={unit}
                    language={language}
                    isReviewLocked={isReviewLocked}
                    suggestedLessonId={suggestedLessonId}
                    onClick={() => {
                      setSelectedLesson({ lesson, isCompleted: isMaxLevel, unitColor: unit.colorClass, unitBorder: unit.borderClass, unitText: unit.textClass, unitHover: unit.hoverClass });
                      const saved = localStorage.getItem(`last_speak_level_${lesson.id}`);
                      setModalLevel(saved !== null ? parseInt(saved, 10) : null);
                    }}
                  />
                </div>
              </div>

              {/* Center icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                {isMaxLevel && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 drop-shadow-md">
                    <Crown size={28} className="text-amber-400 fill-amber-400" />
                  </div>
                )}
                <div
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center border-[6px] transition-transform overflow-hidden bg-white shadow-md cursor-pointer hover:scale-105 active:scale-95
                    ${isMaxLevel ? unit.colorClass + ' text-white ' + unit.borderClass 
                    : isReviewLocked ? 'bg-slate-100 text-slate-300 border-slate-200 border-2 active:border-b-2 active:translate-y-1' 
                    : level >= 8 ? unit.shades.l4 : level >= 6 ? unit.shades.l3 : level >= 3 ? unit.shades.l2 : level >= 1 ? unit.shades.l1 
                    : 'bg-white ' + unit.textClass + ' border-slate-200 border-2 active:border-b-2 active:translate-y-1'}
                  `}
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
                      <IconImage src={(lesson as any).imageUrl} alt={lesson.title} fill className={`object-cover ${level === 0 && suggestedLessonId !== lesson.id ? 'grayscale opacity-70' : ''} ${isReviewLocked ? 'opacity-30 grayscale' : ''}`} sizes="(max-width: 768px) 5rem" />
                      {isMaxLevel && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"><CheckCircle size={32} className="stroke-[3] text-white" /></div>}
                      {isReviewLocked && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/10"><Lock size={32} className="text-slate-500 stroke-[2]" /></div>}
                    </>
                  ) : (
                    isMaxLevel ? <CheckCircle size={32} className="stroke-[3]" /> : isReviewLocked ? <Lock size={32} className="fill-slate-200 text-slate-400 stroke-[2]" /> : lesson.isReview ? <Star size={32} className="fill-current stroke-current" /> : <Play size={32} className="ml-1 fill-current stroke-[2]" />
                  )}
                </div>
              </div>



              {/* Side Image */}
              {(lesson as any).imageUrl && (
                <div className={`absolute top-1/2 -translate-y-1/2 w-1/2 flex items-center ${isLeft ? 'right-0 justify-start pl-16 xl:pl-24' : 'left-0 justify-end pr-16 xl:pr-24'} z-0`}>
                   <motion.div
                      initial={false}
                      animate={{ 
                         opacity: activeCenteredLessonId === lesson.id ? 1 : 0.4, 
                         x: activeCenteredLessonId === lesson.id ? 0 : (isLeft ? -20 : 20),
                         scale: activeCenteredLessonId === lesson.id ? 1 : 0.85,
                         filter: activeCenteredLessonId === lesson.id ? 'grayscale(0%)' : 'grayscale(60%)'
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="w-56 h-56 md:w-64 md:h-64 relative rounded-[2rem] overflow-hidden shadow-xl border-4 border-white pointer-events-none"
                   >
                      <IconImage src={(lesson as any).imageUrl} alt={lesson.title} fill className="object-cover" sizes="(max-width: 768px) 200px, 500px" />
                   </motion.div>
                </div>
              )}
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
  );
}
