import React, { useRef, useState } from 'react';
import { Play, PlayCircle, Star, Target, CheckCircle2, Lock, Clock, GraduationCap, Medal, Pencil, RotateCcw, BookOpen, X, Users, ChevronLeft, Flag, Crown, PieChart, Circle } from 'lucide-react';
import Link from 'next/link';
import IconImage from '../ui/IconImage';
import { buttonVariants } from '../ui/Button';
import { playThaiTTS } from "@/lib/tts";
import { formatCombiningChar } from "@/lib/alphabet-utils";
import { m as motion , AnimatePresence } from "motion/react";
import { DailyQuestsWidget } from '../widgets/DailyQuestsWidget';
import { ConversationObjectiveWidget } from '../widgets/ConversationObjectiveWidget';
import { LeaderboardWidget } from '../widgets/LeaderboardWidget';
import { useProgressStore } from "@/lib/store";
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { getLevelSplit } from "@/lib/levelSplits";

interface Unit {
  id: string;
  title: string;
  titleEn?: string;
  colorClass: string;
  textClass: string;
  startIndex?: number;
  endIndex?: number;
  lessons?: any[];
  imageUrl?: string;
}

interface DesktopSidebarRightProps {
  units: Unit[];
  activeUnitIndex: number;
  onUnitSelect: (index: number) => void;
  language: string;
  globalSuggested?: any;
  lessons: any[];
  lessonLevels: Record<string, number>;
  mounted: boolean;
  maxLevelPerLesson?: number;
  suggestionType?: 'learn' | 'alphabet' | string;
  // Modal props
  selectedLesson?: { lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string } | null;
  onCloseLesson?: () => void;
  modalLevel?: number | null;
  setModalLevel?: (level: number | null) => void;
  lessonStars?: Record<string, number[]>;
  resetLessonLevel?: (lessonId: string) => void;
  questsCategory?: 'learn' | 'alphabet' | 'speak';
  showUnitsList?: boolean;
  setShowUnitsList?: (show: boolean) => void;
  reviewStats?: Record<string, Record<number, { bestTime?: number, maxPercentage?: number }>>;
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
  resetLessonLevel,
  questsCategory = 'learn',
  showUnitsList: externalShowUnitsList,
  setShowUnitsList: externalSetShowUnitsList,
  reviewStats
}: DesktopSidebarRightProps) {
  const [internalShowUnitsList, setInternalShowUnitsList] = useState(false);
  const showUnitsList = externalShowUnitsList !== undefined ? externalShowUnitsList : internalShowUnitsList;
  const setShowUnitsList = externalSetShowUnitsList || setInternalShowUnitsList;

  const [playFullLevel, setPlayFullLevel] = useState(false);
  const [manualPartIndex, setManualPartIndex] = useState<number | null>(null);
  const lessonPartsCompleted = useProgressStore(state => state.lessonPartsCompleted);

  React.useEffect(() => {
    setPlayFullLevel(false);
    setManualPartIndex(null);
  }, [modalLevel]);

  const dragRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });
  const levelsScrollRef = useRef<HTMLDivElement>(null);

  const [isBrave, setIsBrave] = useState(false);
  React.useEffect(() => {
    const checkBrave = async () => {
      if ((navigator as any).brave && await (navigator as any).brave.isBrave()) {
        setIsBrave(true);
      }
    };
    checkBrave();
  }, []);

  const renderContent = () => {
    if (selectedLesson && setModalLevel && lessonStars && resetLessonLevel && onCloseLesson) {
      if (modalLevel === null) {
        return (
          <motion.div
            key="empty-lesson-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50/50"
          >
            <BookOpen size={64} className="mb-6 text-slate-300 drop-shadow-sm" />
            <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Choisissez un niveau</h3>
            <p className="text-sm font-medium leading-relaxed">
              Sélectionnez un niveau dans la liste pour voir son contenu, choisir une partie et commencer.
            </p>
          </motion.div>
        );
      }

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
      if (selectedLesson.lesson.isReview) {
        estimatedMins = (modalLevel + 1) * 2;
      } else if (modalLevel === 10) {
        estimatedMins = 20;
      } else {
        if (modalLevel === 9) estimatedMins = Math.max(30, estimatedMins);
        else estimatedMins = Math.max(1, estimatedMins);
      }

      const totalParts = suggestionType === 'learn' ? getLevelSplit(modalLevel, selectedLesson.lesson) : 1;
      const partsKey = `${selectedLesson.lesson.id}_level-${modalLevel}`;
      const completedParts = lessonPartsCompleted[partsKey] || [];
      const currentProgress = lessonLevels[selectedLesson.lesson.id] || 0;
      
      const isLevelFullyCompleted = currentProgress > modalLevel || completedParts.length >= totalParts;
      const showSlices = totalParts > 1 && !playFullLevel;

      const nextUncompletedPart = completedParts.length < totalParts ? completedParts.length : 0;
      const selectedPartIndex = playFullLevel ? -1 : (manualPartIndex !== null ? manualPartIndex : nextUncompletedPart);

      const { getExpectedXp } = useProgressStore.getState();
      const lessonIdForXp = suggestionType === 'speak' ? `speak_${selectedLesson.lesson.id}` : selectedLesson.lesson.id;
      
      const { xp: expectedXp, isFirstTime } = getExpectedXp(
        lessonIdForXp, 
        modalLevel, 
        selectedLesson.lesson.isReview || selectedLesson.lesson.title?.toLowerCase().includes('bilan'),
        showSlices,
        !showSlices && (modalLevel === 7 || modalLevel === 8),
        selectedPartIndex >= 0 ? selectedPartIndex : 0
      );

      return (
        <motion.div
          key="lesson-view"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full h-full flex flex-col relative"
        >
          <div className="w-full h-full flex flex-col relative overflow-hidden bg-white text-slate-800">
            <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar">
              
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1">
                  {suggestionType === 'alphabet' && (selectedLesson.lesson.type === 'consonant' || selectedLesson.lesson.type === 'vowel')
                    ? `${getTranslation(selectedLesson.lesson.type === 'consonant' ? 'auto.consonants' : 'auto.vowels', language)}`
                    : getLocalizedField(selectedLesson.lesson, 'title', language)}
                </h3>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
                  {modalLevel === 10 ? getTranslation('auto.mastery', language) : `${getTranslation('auto.lvl', language)} ${modalLevel + 1}`}
                </h2>
                <p className="text-slate-400 text-sm font-medium">
                  {getLocalizedField(selectedLesson.lesson, 'description', language)}
                </p>
              </div>

              {totalParts > 1 && (
                <div className="p-6 pb-2 flex flex-col items-center">
                  <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-6 self-start">
                    CHOISISSEZ UNE PARTIE
                  </h4>

                  <div className="relative w-48 h-48 mb-6">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
                      {Array.from({ length: totalParts }).map((_, i) => {
                        const isPartCompleted = completedParts.includes(i);
                        const isSelected = selectedPartIndex === i;
                        const angle = 360 / totalParts;
                        const startAngle = i * angle - 90;
                        const endAngle = (i + 1) * angle - 90;
                        
                        const x1 = 50 + 48 * Math.cos(Math.PI * startAngle / 180);
                        const y1 = 50 + 48 * Math.sin(Math.PI * startAngle / 180);
                        const x2 = 50 + 48 * Math.cos(Math.PI * endAngle / 180);
                        const y2 = 50 + 48 * Math.sin(Math.PI * endAngle / 180);
                        const largeArc = angle > 180 ? 1 : 0;
                        
                        const pathData = `M 50 50 L ${x1} ${y1} A 48 48 0 ${largeArc} 1 ${x2} ${y2} Z`;
                        
                        const midAngle = startAngle + angle / 2;
                        const textR = 30;
                        const tx = 50 + textR * Math.cos(Math.PI * midAngle / 180);
                        const ty = 50 + textR * Math.sin(Math.PI * midAngle / 180);

                        // If not selected but fully completed, use a green slice, otherwise orange, otherwise gray
                        const baseColorClass = "fill-slate-100 text-slate-100";
                        const colorClass = isSelected ? `${selectedLesson.unitText} fill-current` : baseColorClass;
                        
                        // User can click parts up to nextUncompletedPart
                        const isAccessible = isLevelFullyCompleted || i <= completedParts.length;

                        return (
                          <g 
                            key={i} 
                            onClick={() => { if(isAccessible) { setPlayFullLevel(false); setManualPartIndex(i); } }}
                            className={`${isAccessible ? 'cursor-pointer hover:opacity-90' : 'opacity-50 cursor-not-allowed'} transition-opacity`}
                            style={isSelected ? { transform: `scale(1.05)`, transformOrigin: '50px 50px' } : {}}
                          >
                            <path d={pathData} className={`${colorClass} stroke-white stroke-[3]`} />
                            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" className={`text-[8px] font-black ${isSelected ? 'fill-white' : (isPartCompleted ? 'fill-white' : 'fill-slate-400')}`}>
                              P{i + 1}
                            </text>
                          </g>
                        );
                      })}
                      
                      <circle cx="50" cy="50" r="18" className={`${playFullLevel ? `${selectedLesson.unitText} fill-current ring-2 ${selectedLesson.unitColor.replace('bg-', 'ring-')}` : 'fill-white'} stroke-white stroke-[3] ${isLevelFullyCompleted ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'} transition-colors`} 
                        onClick={() => { if(isLevelFullyCompleted) setPlayFullLevel(true); }}
                      />
                      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className={`text-[6.5px] font-black ${playFullLevel ? 'fill-white' : (isLevelFullyCompleted ? 'fill-slate-800' : 'fill-slate-400')} pointer-events-none`}>
                        ENTIER
                      </text>
                    </svg>

                    {(() => {
                      let tx = 50;
                      let ty = 50;
                      let midAngle = -90; // Default for ENTIER
                      
                      if (!isLevelFullyCompleted) {
                        const nextPart = completedParts.length;
                        const angle = 360 / totalParts;
                        const startAngle = nextPart * angle - 90;
                        midAngle = startAngle + angle / 2;
                        const tooltipR = 64; // Distance from center (outside the pie)
                        tx = 50 + tooltipR * Math.cos(Math.PI * midAngle / 180);
                        ty = 50 + tooltipR * Math.sin(Math.PI * midAngle / 180);
                      } else {
                        const tooltipR = 26; // Above the center circle
                        tx = 50 + tooltipR * Math.cos(Math.PI * midAngle / 180);
                        ty = 50 + tooltipR * Math.sin(Math.PI * midAngle / 180);
                      }

                      const theta = (midAngle + 180) * Math.PI / 180;
                      const cx = Math.cos(theta);
                      const cy = Math.sin(theta);
                      const scale = Math.min(28 / Math.max(Math.abs(cx), 0.001), 10 / Math.max(Math.abs(cy), 0.001));
                      const ptrX = cx * (scale + 2);
                      const ptrY = cy * (scale + 2);

                      return (
                        <div 
                          className="absolute z-20 pointer-events-none drop-shadow-md"
                          style={{
                            left: `${tx}%`,
                            top: `${ty}%`
                          }}
                        >
                          <div className="relative flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
                            <div className="animate-bounce flex items-center justify-center relative">
                              <div 
                                className="absolute w-2.5 h-2.5 bg-[#10B981] rounded-[1px]"
                                style={{
                                  transform: `translate(${ptrX}px, ${ptrY}px) rotate(45deg)`
                                }}
                              />
                              <div className="relative z-10 bg-[#10B981] text-white font-black text-[9px] uppercase px-2.5 py-1 rounded-md tracking-wider whitespace-nowrap shadow-sm">
                                La Suite
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <button
                    onClick={() => { if(isLevelFullyCompleted) setPlayFullLevel(true); }}
                    disabled={!isLevelFullyCompleted}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm border-2 transition-all flex items-center gap-2 mb-6
                      ${playFullLevel ? `${selectedLesson.unitColor} border-transparent text-white shadow-lg` : 
                        isLevelFullyCompleted ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 cursor-pointer' : 
                        'bg-transparent border-slate-100 text-slate-600 opacity-50 cursor-not-allowed'}
                    `}
                  >
                    <div className={`w-3 h-3 rounded-full ${playFullLevel ? 'bg-white' : 'bg-slate-300'}`}></div>
                    Niveau entier
                  </button>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {Array.from({ length: totalParts }).map((_, i) => {
                       const isSelected = selectedPartIndex === i;
                       return (
                         <button 
                           key={i} 
                           onClick={() => {
                             if (isLevelFullyCompleted || i <= completedParts.length) {
                               setPlayFullLevel(false);
                               setManualPartIndex(i);
                             }
                           }}
                           className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wide cursor-pointer transition-colors
                           ${isSelected ? `${selectedLesson.unitColor} text-white` : 
                             (isLevelFullyCompleted || i <= completedParts.length) ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}
                         `}>
                           Partie {i + 1}
                         </button>
                       )
                    })}
                  </div>
                </div>
              )}

              {/* Stats Section */}
              <div className="p-6 border-b border-slate-100 flex flex-col items-center">
                <h4 className="text-[12px] font-black uppercase text-slate-400 tracking-widest mb-6 text-center">
                  {playFullLevel ? "NIVEAU ENTIER" : totalParts > 1 ? `PARTIE ${selectedPartIndex + 1}` : "DÉTAILS"}
                </h4>
                
                <div className="flex items-center justify-center gap-4 w-full">
                  <div className="flex flex-col items-center justify-center py-4 bg-slate-50 border border-slate-100 rounded-2xl flex-1">
                    <BookOpen size={20} className="text-slate-400 mb-2" />
                    <span className="text-xl font-black text-slate-700">{playFullLevel ? stepsCount : Math.ceil(stepsCount/totalParts)}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">étapes</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-4 bg-amber-50 border border-amber-100 rounded-2xl flex-1">
                    <Star size={20} className="text-amber-500 mb-2" />
                    <span className="text-xl font-black text-amber-600">+{expectedXp}</span>
                    <span className="text-[10px] uppercase tracking-wider text-amber-500/70 font-bold mt-1">XP</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-4 bg-blue-50 border border-blue-100 rounded-2xl flex-1">
                    <Clock size={20} className="text-blue-500 mb-2" />
                    <span className="text-xl font-black text-slate-700">{playFullLevel ? estimatedMins : Math.max(1, Math.ceil(estimatedMins/totalParts))}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">min</span>
                  </div>
                </div>
              </div>

              
            </div>

            <div className="shrink-0 p-6 pt-4 bg-white border-t border-slate-100 z-10 flex flex-col gap-3">
              <div className="flex items-center gap-2 w-full mt-1 relative">
                {(() => {
                  const href = suggestionType === 'alphabet' 
                          ? `/alphabet/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}` 
                          : suggestionType === 'speak' 
                            ? `/speak/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}` 
                            : (totalParts > 1 && !playFullLevel) 
                              ? `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}&part=${selectedPartIndex}&totalParts=${totalParts}` 
                              : `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`;

                  return (
                    <Link
                      href={href}
                      className={buttonVariants({ 
                        variant: 'gamified', 
                        size: 'lg', 
                        className: `w-full rounded-xl ${selectedLesson.unitColor} ${selectedLesson.unitColor.replace('bg-', 'border-').replace(/500$/, '600').replace(/400$/, '500')}` 
                      })}
                    >
                      <Play size={20} className="mr-2 fill-current" />
                      {getTranslation('auto.start_lesson', language)}
                    </Link>
                  )
                })()}
              </div>
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
          className="w-full h-full relative px-6 overflow-y-auto hide-scrollbar pt-6 pb-16 flex flex-col gap-0"
        >
          <div className="w-auto -mt-6 -mx-6 px-6 pt-8 pb-6 mb-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-center">
            <h1 className="text-[26px] font-light font-serif text-slate-800 tracking-wide text-center">
              {getTranslation('auto.my_adventure', language)}
            </h1>
          </div>

          <div className="w-full flex flex-col gap-0">
            <ConversationObjectiveWidget />
            <DailyQuestsWidget category={questsCategory} />
            <LeaderboardWidget />
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
                {getTranslation('auto.units', language)}
              </h2>
            </div>
            <button
              onClick={() => setShowUnitsList(false)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-3 pb-6 w-full">
            {units.map((u, i) => {
              const isCurrent = i === activeUnitIndex;
              const status = isCurrent ? (getTranslation('auto.in_progress_1', language)) : '';
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
                    className={`w-full text-left rounded-3xl transition-all relative overflow-hidden flex flex-col p-4 shrink-0 bg-white border cursor-default ${u.colorClass.replace('bg-', 'border-')} shadow-sm`}
                  >
                    {hasSuggestion && (
                      <span className="absolute top-3 right-3 w-3 h-3 bg-amber-400 border-2 border-white rounded-full z-10"></span>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                      {u.imageUrl ? (
                        <div className={`w-16 h-16 rounded-2xl overflow-hidden relative shadow-sm shrink-0 border-2 ${u.colorClass.replace('bg-', 'border-')}`}>
                          <img src={u.imageUrl} alt={getLocalizedField(u, 'title', language)} className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-[20px] text-white ${u.colorClass} shadow-sm shrink-0`}>
                          {i + 1}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 pr-2 py-1">
                        <h3 className="font-extrabold text-[16px] text-slate-800 leading-tight mb-1 whitespace-normal break-words">{getLocalizedField(u, 'title', language)}</h3>
                        <span className={`text-[13px] font-black uppercase tracking-wider ${u.textClass}`}>{status}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${u.colorClass}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <div className="text-[12px] font-medium text-slate-400 select-none">
                      {completedLessonsCount}/{totalLessonsCount} {getTranslation('auto.lessons', language)}
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={u.id}
                  onClick={() => onUnitSelect(i)}
                  className="w-full text-left rounded-3xl transition-all relative flex flex-row items-center p-3 shrink-0 bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50 hover:shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] group/btn cursor-pointer"
                >
                  {hasSuggestion && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full z-10"></span>
                  )}
                  {u.imageUrl ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden relative shadow-sm shrink-0 mr-4 border border-slate-100 group-hover/btn:border-slate-200 transition-colors bg-white">
                      <img src={u.imageUrl} alt={getLocalizedField(u, 'title', language)} className="object-cover w-full h-full opacity-80 group-hover/btn:opacity-100 transition-opacity grayscale-[30%] group-hover/btn:grayscale-0" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-[16px] bg-slate-50 text-slate-400 group-hover/btn:bg-white group-hover/btn:text-slate-600 shrink-0 mr-4 transition-colors border border-slate-100 group-hover/btn:border-slate-200">
                      {i + 1}
                    </div>
                  )}

                  <div className="flex flex-col justify-center min-w-0 overflow-hidden pr-2">
                    <h3 className="font-bold text-[15px] leading-snug text-slate-500 group-hover/btn:text-slate-700 transition-colors whitespace-normal break-words">{getLocalizedField(u, 'title', language)}</h3>
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

