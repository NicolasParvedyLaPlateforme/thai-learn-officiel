import React, { useRef, useState } from 'react';
import { BookOpen, CheckCircle, Clock, Lock, Pencil, Play, RotateCcw, Star, Volume2, X, Users, Target, ChevronLeft, Flag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { playThaiTTS } from '../lib/tts';
import { motion, AnimatePresence } from 'motion/react';
import { DailyQuestsWidget } from './DailyQuestsWidget';

interface Unit {
  id: string;
  title: string;
  titleEn?: string;
  colorClass: string;
  textClass: string;
  startIndex?: number;
  endIndex?: number;
  lessons?: any[];
}

interface DesktopSidebarRightProps {
  units: Unit[];
  activeUnitIndex: number;
  onUnitSelect: (index: number) => void;
  language: 'fr' | 'en';
  globalSuggested?: any;
  lessons: any[];
  lessonLevels: Record<string, number>;
  mounted: boolean;
  maxLevelPerLesson?: number;
  suggestionType?: 'learn' | 'alphabet' | string;
  // Modal props
  selectedLesson?: {lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string} | null;
  onCloseLesson?: () => void;
  modalLevel?: number;
  setModalLevel?: (level: number) => void;
  lessonStars?: Record<string, number[]>;
  resetLessonLevel?: (lessonId: string) => void;
}

export function DesktopSidebarRight({
  units,
  activeUnitIndex,
  onUnitSelect,
  language,
  globalSuggested,
  lessons,
  lessonLevels,
  mounted,
  maxLevelPerLesson = 10,
  suggestionType = 'learn',
  selectedLesson,
  onCloseLesson,
  modalLevel = 0,
  setModalLevel,
  lessonStars,
  resetLessonLevel
}: DesktopSidebarRightProps) {
  const [showUnitsList, setShowUnitsList] = useState(false);
  const dragRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });
  const levelsScrollRef = useRef<HTMLDivElement>(null);

  const renderContent = () => {
    if (selectedLesson && setModalLevel && lessonStars && resetLessonLevel && onCloseLesson) {
      const wordCount = selectedLesson.lesson.words?.length || 0;
      const stepsCount = 10 + wordCount + (selectedLesson.lesson.phrases?.length || 0);
      let secsPerStep = 5;
      if (modalLevel <= 1) secsPerStep = 5;
      else if (modalLevel <= 3) secsPerStep = 7;
      else if (modalLevel <= 6) secsPerStep = 10;
      else if (modalLevel === 7) secsPerStep = 20;
      else secsPerStep = 40;
      
      let estimatedSecs = stepsCount * secsPerStep;
      let estimatedMins = Math.ceil(estimatedSecs / 60);
      if (modalLevel === 9) estimatedMins = Math.max(30, estimatedMins);
      else estimatedMins = Math.max(1, estimatedMins);

      return (
        <motion.div
          key="lesson-view"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full h-full flex flex-col relative"
        >
          <div className="w-full h-full flex flex-col relative overflow-hidden">
            {/* Removed Close Button */}

            {/* Scrollable Content */}
            <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar p-3">
              {/* Image Header */}
              <div className="w-full shrink-0 z-0">
                 <div className={`w-full h-[180px] relative border-b border-slate-100 ${!selectedLesson.lesson.imageUrl && 'bg-amber-50 flex items-center justify-center'}`}>
                   {selectedLesson.lesson.imageUrl ? (
                      <Image src={selectedLesson.lesson.imageUrl} alt="" fill className="object-cover" />
                   ) : (
                      <BookOpen size={48} className="text-slate-200" />
                   )}
                 </div>
              </div>

              <div className="p-6 pt-5 pb-5 flex flex-col">
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight font-sans tracking-tight">
                  {language === 'en' ? (selectedLesson.lesson.titleEn || selectedLesson.lesson.title) : selectedLesson.lesson.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  {language === 'en' ? (selectedLesson.lesson.descriptionEn || selectedLesson.lesson.description) : selectedLesson.lesson.description}
                </p>

                {/* Levels Grid */}
                <div className="grid grid-cols-5 gap-y-4 gap-x-2 w-full mb-6 max-w-[17rem] mx-auto">
                  {Array.from({ length: maxLevelPerLesson }).map((_, levelIndex) => {
                    const currentProgress = lessonLevels[selectedLesson.lesson.id] || 0;
                    const starsArray = lessonStars[selectedLesson.lesson.id] || Array(maxLevelPerLesson).fill(0);
                    const earnedStars = starsArray[levelIndex] || 0;

                    const isAccessible = levelIndex <= currentProgress;
                    const isCompleted = levelIndex < currentProgress;
                    const isSelected = modalLevel === levelIndex;
                    const isCurrent = levelIndex === currentProgress;
                    
                    return (
                      <button
                        key={levelIndex}
                        onClick={() => {
                          if (isAccessible) {
                            setModalLevel(levelIndex);
                          }
                        }}
                        className={`flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:active:scale-100 disabled:cursor-not-allowed`}
                        disabled={!isAccessible}
                      >
                        <div className={`
                          w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                          ${isSelected ? 'scale-110 ring-[4px] ring-offset-[3px] ring-[#0a6c4a]/40 shadow-lg relative z-10' : ''}
                          ${isCompleted ? 'bg-amber-400 border border-amber-500 shadow-sm text-amber-900' : 
                            isCurrent ? 'bg-white border-[3px] border-[#0a6c4a] shadow-sm text-[#0a6c4a]' : 
                            'bg-slate-50 border border-slate-200 text-slate-300'
                          }
                        `}>
                          {isCompleted ? (
                            <div className="flex gap-[1px]">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <Star key={i} className={`stroke-[1.5] ${i < earnedStars ? "fill-amber-900 stroke-amber-900" : "fill-white stroke-white"}`} size={10} />
                              ))}
                            </div>
                          ) : isCurrent ? (
                            <span className="font-extrabold text-lg">{levelIndex + 1}</span>
                          ) : (
                            <Lock size={16} className="stroke-[2.5]" />
                          )}
                        </div>
                        <span className={`text-[9px] font-black tracking-widest uppercase
                          ${isCurrent ? 'text-[#0a6c4a]' : isCompleted ? 'text-amber-500' : 'text-slate-300'}
                        `}>
                          {isCurrent ? (language === 'en' ? 'IN PROGRESS' : 'EN COURS') : `NIV. ${levelIndex + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Badges Container */}
                <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-100 pb-6 w-full flex-wrap">
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold whitespace-nowrap shadow-sm bg-white">
                    <Clock size={16} className="text-slate-500" />
                    {estimatedMins} min
                  </div>
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-bold shadow-sm whitespace-nowrap">
                    <Star size={16} className="fill-amber-500 text-amber-600" />
                    +15 XP
                  </div>
                </div>

                {/* Vocab preview */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[12px] font-black uppercase text-slate-500 tracking-wider">
                      {language === 'en' ? `Vocabulary (LVL ${modalLevel + 1}) :` : `Vocabulaire (NIV. ${modalLevel + 1}) :`}
                    </h4>
                    <div className="bg-blue-50/50 text-blue-700 font-black text-[10px] uppercase px-2 py-0.5 rounded">Chips</div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pb-2">
                      {selectedLesson.lesson.words?.map((w: any) => (
                        <button onClick={() => playThaiTTS(w.th)} key={w.id} className="group shrink-0 bg-white border border-slate-200 rounded-[2rem] px-4 py-2 flex items-center justify-center gap-2.5 shadow-sm hover:border-[#0a6c4a] hover:bg-[#0a6c4a]/5 transition-colors cursor-pointer active:scale-95">
                            <span className="font-bold text-[#0a6c4a] text-[17px]">{w.th}</span> 
                            <span className="text-slate-500 text-[13px] font-medium">({language === 'en' ? w.en : w.fr})</span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="shrink-0 p-6 pt-4 bg-white/95 backdrop-blur z-10 flex flex-col gap-3 pb-6 border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                <Link
                  href={`/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`}
                  className="w-full py-4 rounded-xl font-bold text-[17px] text-white shadow-md flex items-center justify-center hover:opacity-90 active:translate-y-1 transition-all bg-[#0a6c4a]"
                >
                  {language === 'en' ? `Start lesson` : `Commencer la leçon`}
                </Link>

                {selectedLesson.isCompleted && (
                  <div className="flex gap-3">
                    {suggestionType !== 'alphabet' && (
                      <Link
                        href={`/writing?lessonId=${selectedLesson.lesson.id}`}
                        className="flex-1 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center hover:bg-slate-100 transition-colors"
                      >
                        <Pencil size={16} className="mr-2" />
                        {language === 'en' ? 'Writing' : 'Écriture'}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        resetLessonLevel(selectedLesson.lesson.id);
                        setModalLevel(0);
                      }}
                      className="flex-1 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-sm flex items-center justify-center hover:bg-rose-100 transition-colors"
                    >
                      <RotateCcw size={16} className="mr-2" />
                      {language === 'en' ? 'Reset' : 'Réinitialiser'}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </motion.div>
      );
    }

    if (!showUnitsList) {
      return (
        <motion.div
           key="dashboard-view"
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: 20 }}
           transition={{ duration: 0.2, ease: "easeOut" }}
           className="w-full h-full relative px-6 overflow-y-auto hide-scrollbar pt-6 pb-16 flex flex-col gap-6"
        >
           <button 
             onClick={() => setShowUnitsList(true)}
             className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-colors group"
           >
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                 <BookOpen size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
               </div>
               <div className="flex flex-col text-left">
                 <span className="font-bold text-slate-800 tracking-tight">
                   {language === 'en' ? 'Course Units' : 'Unités du Cours'}
                 </span>
                 <span className="text-xs text-slate-500 font-medium">
                   {language === 'en' ? 'Change or view units' : 'Changer ou voir les unités'}
                 </span>
               </div>
             </div>
             <ChevronLeft size={20} className="text-slate-400 group-hover:text-slate-600 rotate-180 transition-transform group-hover:translate-x-1" />
           </button>

           <div className="w-full">
             <DailyQuestsWidget />
           </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="units-view"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full h-full relative px-6 overflow-y-auto hide-scrollbar pt-6 pb-16"
      >
        <div className="w-full relative flex flex-col gap-4 group">
          <div className="flex items-center justify-between gap-3 mb-2 px-1 shrink-0">
            <div className="flex items-center gap-3 text-slate-800 font-bold">
              <BookOpen size={20} className="text-slate-400 shrink-0" />
              <h2 className="whitespace-nowrap text-lg text-slate-600">
                {language === 'en' ? 'Units' : 'Unités'}
              </h2>
            </div>
            <button 
              onClick={() => setShowUnitsList(false)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-3 pb-6 w-full">
            {units.map((u, i) => {
              const isCurrent = i === activeUnitIndex;
              const status = isCurrent ? (language === 'en' ? 'In progress' : 'En cours') : '';
              const unitLessons = u.lessons ? u.lessons : lessons.slice(u.startIndex || 0, u.endIndex || 0);
              
              const hasSuggestion = globalSuggested?.type === suggestionType && 
                                    globalSuggested.id && 
                                    unitLessons.some((l: any) => l.id === globalSuggested.id);
              const maxLevelsInUnit = unitLessons.length * maxLevelPerLesson;
              const completedLevelsInUnit = mounted ? unitLessons.reduce((acc: number, l: any) => acc + (lessonLevels[l.id] || 0), 0) : 0;
              const progressPercent = mounted && maxLevelsInUnit > 0 ? Math.min(100, (completedLevelsInUnit / maxLevelsInUnit) * 100) : 0;
              const completedLessonsCount = mounted ? unitLessons.filter((l: any) => (lessonLevels[l.id] || 0) >= maxLevelPerLesson).length : 0;
              const totalLessonsCount = unitLessons.length;

              if (isCurrent) {
                return (
                  <div 
                    key={u.id}
                    className={`w-full text-left rounded-2xl transition-all relative overflow-hidden flex flex-col p-4 shrink-0 bg-white border-2 cursor-default ${u.colorClass.replace('bg-', 'border-')} shadow-sm`}
                  >
                    {hasSuggestion && (
                      <span className="absolute top-3 right-3 w-3 h-3 bg-amber-400 border-2 border-white rounded-full z-10"></span>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[16px] text-white ${u.colorClass} shadow-sm shrink-0`}>
                        {i + 1}
                      </div>
                      <div className="flex flex-col min-w-0 pr-2">
                        <h3 className="font-bold text-[15px] text-slate-800 truncate leading-tight mb-0.5">{language === 'en' ? (u.titleEn || u.title) : u.title}</h3>
                        <span className={`text-[13px] font-semibold ${u.textClass} tracking-tight`}>{status}</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                       <div className={`h-full rounded-full transition-all duration-1000 ${u.colorClass}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <div className="text-[12px] font-medium text-slate-400 select-none">
                       {completedLessonsCount}/{totalLessonsCount} {language === 'en' ? 'lessons' : 'leçons'}
                    </div>
                  </div>
                );
              }

              return (
                <button 
                  key={u.id}
                  onClick={() => onUnitSelect(i)}
                  className="w-full text-left rounded-2xl transition-all relative flex flex-row items-center p-3 shrink-0 bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-slate-100 active:scale-[0.98] group/btn"
                >
                  {hasSuggestion && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full z-10"></span>
                  )}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[15px] bg-white text-slate-400 group-hover/btn:bg-white group-hover/btn:text-slate-500 shrink-0 mr-3 transition-colors shadow-sm">
                     {i + 1}
                  </div>

                  <div className="flex flex-col justify-center min-w-0 overflow-hidden pr-2">
                    <h3 className="font-bold text-[14px] truncate text-slate-400 group-hover/btn:text-slate-500 transition-colors">{language === 'en' ? (u.titleEn || u.title) : u.title}</h3>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div 
      className="h-screen sticky top-0 hidden xl:block w-[24rem] flex-shrink-0 relative z-40 bg-white border-l border-slate-200 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}

