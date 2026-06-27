import React, { useMemo } from 'react';
import { useProgressStore } from "@/lib/store";
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { ActionCardButton } from "@/components/ui/ActionCardButton";
import { Zap, Play, RotateCcw, Target, Crown, ChevronLeft } from 'lucide-react';
import { m as motion, AnimatePresence } from "motion/react";
import { useRouter } from 'next/navigation';
import BASE_UNITS from "@/data/units.json";
import { getLightweightLessons } from "@/actions/course";
import { getLevelSplit } from "@/lib/levelSplits";
import { Button } from "@/components/ui/Button";

import ALPHABET_BASE_UNITS from "@/data/alphabet_units.json";
import { getAlphabetLessons } from "@/lib/alphabet-utils";
import SPEAK_BASE_UNITS from "@/data/speak_units.json";
import { getLightweightSpeakLessons } from "@/actions/speak_course";

interface QuickActionsWidgetProps {
  lightweightLessons?: any[];
  variant?: 'desktop' | 'mobile-bubble' | 'desktop-floating';
  pathType?: 'learn' | 'alphabet' | 'speak';
  units?: any[];
}

export function QuickActionsWidget({ lightweightLessons, variant = 'desktop', pathType = 'learn', units }: QuickActionsWidgetProps) {
  const { 
    language, 
    lessonLevels: learnLessonLevels, 
    lessonPartsCompleted,
    lastActiveUnitIndex,
    speakLessonLevels
  } = useProgressStore();
  const router = useRouter();

  const [lessonsData, setLessonsData] = React.useState<any[]>(lightweightLessons || []);
  const [isFabOpen, setIsFabOpen] = React.useState(false);

  React.useEffect(() => {
    if (!lightweightLessons || lightweightLessons.length === 0) {
      if (pathType === 'learn') {
        getLightweightLessons().then(data => setLessonsData(data));
      } else if (pathType === 'speak') {
        getLightweightSpeakLessons().then(data => setLessonsData(data));
      }
    } else {
      setLessonsData(lightweightLessons);
    }
  }, [lightweightLessons, pathType]);

  const {
    nextLesson,
    nextLevel,
    nextPart,
    nextTotalParts,
    isUnitCompleted,
    randomMasteredLesson,
    hasStartedUnit,
    hasCompletedFirstLevel,
    currentUnitColorClass,
    currentUnitHoverClass
  } = useMemo(() => {
    let unitLessons: any[] = [];
    const targetUnitIndex = lastActiveUnitIndex || 0;
    
    let currentUnit: any = null;

    if (pathType === 'alphabet') {
      let activeUnits = units;
      if (!activeUnits) {
        const { consonants, vowels } = getAlphabetLessons();
        activeUnits = [
          { ...ALPHABET_BASE_UNITS[0], lessons: consonants },
          { ...ALPHABET_BASE_UNITS[1], lessons: vowels }
        ];
      }
      currentUnit = activeUnits[targetUnitIndex] || activeUnits[0];
      if (currentUnit) {
        unitLessons = currentUnit.lessons || [];
      }
    } else {
      let activeUnits = units;
      if (!activeUnits) {
        activeUnits = pathType === 'speak' ? SPEAK_BASE_UNITS : BASE_UNITS;
      }
      currentUnit = activeUnits[targetUnitIndex] || activeUnits[0];
      
      let currentStartIndex = 0;
      let targetStartIndex = 0;
      let targetEndIndex = lessonsData.length;

      for (let i = 0; i < activeUnits.length; i++) {
        let endIndex = currentStartIndex;
        for (let j = currentStartIndex; j < lessonsData.length; j++) {
          const title = lessonsData[j]?.title || "";
          const titleEn = lessonsData[j]?.titleEn || "";
          if (title.toLowerCase().includes("bilan") || titleEn.toLowerCase().includes("review")) {
            endIndex = j + 1;
            break;
          }
        }
        if (endIndex === currentStartIndex && currentStartIndex < lessonsData.length) {
          endIndex = lessonsData.length;
        }

        if (i === targetUnitIndex) {
          targetStartIndex = currentStartIndex;
          targetEndIndex = endIndex;
          break;
        }
        currentStartIndex = endIndex;
      }
      unitLessons = lessonsData.slice(targetStartIndex, targetEndIndex);
    }

    const lessonLevels = pathType === 'speak' ? speakLessonLevels : learnLessonLevels;

    let nextLsn = null;
    let nextLvl = 0;
    
    let started = false;
    let completedFirstLevel = false;
    const masteredUnitLessons = [];
    
    const maxLevel = pathType === 'alphabet' ? 4 : pathType === 'speak' ? 5 : 10;

    for (const lesson of unitLessons) {
      if (!lesson) continue;
      const level = lessonLevels[lesson.id] || 0;
      
      if (level > 0) {
        started = true;
        completedFirstLevel = true;
      } else {
        const partsKey = `${lesson.id}_level-0`;
        const completedParts = lessonPartsCompleted[partsKey] || [];
        if (completedParts.length > 0) {
          started = true;
        }
      }

      if (level >= maxLevel) {
        masteredUnitLessons.push(lesson);
      }
    }

    // Strictly check sequentially for the first unmastered lesson
    for (const lesson of unitLessons) {
      if (!lesson) continue;
      const level = lessonLevels[lesson.id] || 0;
      if (level < maxLevel && !nextLsn) {
        nextLsn = lesson;
        nextLvl = level;
      }
    }

    let nPart = 0;
    let nTotalParts = 1;
    let unitCompleted = false;

    if (nextLsn) {
      nTotalParts = getLevelSplit(nextLvl, nextLsn);

      if (nTotalParts > 1) {
        const partsKey = `${nextLsn.id}_level-${nextLvl}`;
        const completedParts = lessonPartsCompleted[partsKey] || [];
        for (let p = 0; p < nTotalParts; p++) {
          if (!completedParts.includes(p)) {
            nPart = p;
            break;
          }
        }
      }
    } else {
      unitCompleted = true;
    }

    const rndMastered = masteredUnitLessons.length > 0 
      ? masteredUnitLessons[Math.floor(Math.random() * masteredUnitLessons.length)] 
      : null;

    return {
      nextLesson: nextLsn,
      nextLevel: nextLvl,
      nextPart: nPart,
      nextTotalParts: nTotalParts,
      isUnitCompleted: unitCompleted,
      randomMasteredLesson: rndMastered,
      hasStartedUnit: started,
      hasCompletedFirstLevel: completedFirstLevel,
      currentUnitColorClass: currentUnit?.colorClass || 'bg-emerald-500',
      currentUnitHoverClass: currentUnit?.hoverClass || 'hover:bg-emerald-400'
    };
  }, [lessonsData, learnLessonLevels, speakLessonLevels, lessonPartsCompleted, lastActiveUnitIndex, pathType, units]);

  const getBasePath = () => {
    if (pathType === 'alphabet') return '/alphabet/lesson/';
    if (pathType === 'speak') return '/speak/lesson/';
    return '/lesson/';
  };

  const handleSuivant = () => {
    if (isUnitCompleted) {
      alert(getTranslation('auto.all_mastered_unit_coming_soon', language) || "Tout est maîtrisé ! L'unité suivante arrive bientôt.");
      return;
    }
    if (!nextLesson) return;
    
    let url = `${getBasePath()}${nextLesson.id}?level=${nextLevel + 1}`;
    if (nextTotalParts > 1) {
      url += `&part=${nextPart}&totalParts=${nextTotalParts}`;
    }
    router.push(url);
  };

  const handleEntrainement = () => {
    if (!nextLesson) return;
    let url = `${getBasePath()}${nextLesson.id}?level=${nextLevel + 1}&mode=training`;
    if (nextTotalParts > 1) {
      url += `&part=${nextPart}&totalParts=${nextTotalParts}`;
    }
    router.push(url);
  };

  const handleRevision = () => {
    if (!randomMasteredLesson) return;
    const maxLvl = pathType === 'alphabet' ? 4 : pathType === 'speak' ? 5 : 10;
    router.push(`${getBasePath()}${randomMasteredLesson.id}?level=${maxLvl}&mode=revision`);
  };

  const unitColorClass = currentUnitColorClass;
  const unitHoverClass = currentUnitHoverClass;
  const currentUnitIndex = lastActiveUnitIndex || 0;

  if (variant === 'mobile-bubble') {
    return (
      <AnimatePresence mode="wait">
        {hasStartedUnit && (
          <motion.div 
            key={`mobile-fab-${currentUnitIndex}`}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-end"
          >
            <div className="flex items-center bg-white/90 backdrop-blur-xl p-1.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200/60 gap-1.5">
          
          {hasCompletedFirstLevel && (
            <button 
              onClick={() => setIsFabOpen(!isFabOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
            >
              <div className={`transition-transform duration-300 ${isFabOpen ? 'rotate-180' : ''}`}>
                 <ChevronLeft size={20} />
              </div>
            </button>
          )}

          <AnimatePresence>
            {isFabOpen && hasCompletedFirstLevel && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ clipPath: 'inset(-100px 0 -100px 0)' }}
              >
                <div className="flex items-center gap-1.5 min-w-max">
                  {/* Bouton Révision */}
                  {randomMasteredLesson && (
                    <button 
                      onClick={handleRevision}
                      className={`relative flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full transition-all shadow-sm bg-purple-50 text-purple-600 hover:bg-purple-100`}
                    >
                      {/* Tooltip Révision */}
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white border border-slate-200/60 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center px-3 py-2 pointer-events-none z-[60] min-w-max">
                        <span className="text-amber-500 font-black text-[13px] leading-none">+50 XP</span>
                        <span className="text-slate-500 font-bold text-[11px] leading-none mt-1.5">🎲 1/5 🪙</span>
                        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b border-r border-slate-200/60 rotate-45"></div>
                      </div>

                      <RotateCcw size={14} />
                      <span className="font-bold text-[12px] tracking-wide">{getTranslation('auto.review_action', language) || "Réviser"}</span>
                    </button>
                  )}

                  {/* Bouton Entraînement */}
                  <button 
                    onClick={handleEntrainement}
                    disabled={!nextLesson}
                    className={`relative flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full transition-all shadow-sm ${nextLesson ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-slate-50 text-slate-300'}`}
                  >
                    {/* Tooltip Entraînement */}
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white border border-slate-200/60 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center px-3 py-2 pointer-events-none z-[60] min-w-max">
                      <span className="text-amber-500 font-black text-[13px] leading-none">+10 XP</span>
                      <span className="text-slate-500 font-bold text-[11px] leading-none mt-1.5">🎲 1/5 🪙</span>
                      <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b border-r border-slate-200/60 rotate-45"></div>
                    </div>

                    <Target size={14} />
                    <span className="font-bold text-[12px] tracking-wide">{getTranslation('auto.practice_action', language) || "S'entraîner"}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Bouton Suivant */}
          <button 
            onClick={handleSuivant}
            className={`relative flex items-center justify-center gap-1.5 h-9 px-4 rounded-full transition-all shadow-sm shrink-0 ${isUnitCompleted ? 'bg-slate-100 text-slate-400' : `${unitColorClass} text-white ${unitHoverClass}`}`}
          >
            {/* Tooltip Suivant */}
            <AnimatePresence>
              {isFabOpen && !isUnitCompleted && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white border border-slate-200/60 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center px-3 py-2 pointer-events-none z-[60] min-w-max"
                >
                  <span className="text-amber-500 font-black text-[13px] leading-none">+ XP</span>
                  <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b border-r border-slate-200/60 rotate-45"></div>
                </motion.div>
              )}
            </AnimatePresence>

            <Play size={13} className="fill-current stroke-current" />
            <span className="font-extrabold text-[12px] tracking-wide">{getTranslation('auto.next', language) || "Suivant"}</span>
          </button>
          
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'desktop-floating') {
    return (
      <AnimatePresence mode="wait">
        {hasStartedUnit && (
          <motion.div 
            key={`desktop-float-${currentUnitIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex bg-white/95 backdrop-blur-xl rounded-[1.25rem] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200 p-2 gap-2 relative items-center"
          >
        {/* Info XP + Pièces (Tooltip explicatif) */}
        <div className="flex gap-2 relative group/coins">
          {/* Bouton Révision */}
          <button 
            onClick={handleRevision}
            disabled={!randomMasteredLesson}
            className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-[14px] transition-all cursor-pointer ${randomMasteredLesson ? 'bg-white text-slate-600 hover:text-purple-500 hover:bg-purple-50 hover:scale-[1.02] active:scale-95 border-2 border-slate-100 hover:border-purple-100' : 'bg-slate-50 text-slate-300 border-2 border-slate-100'}`}
          >
            <RotateCcw size={18} className={randomMasteredLesson ? "text-purple-500" : ""} />
            <span className="font-bold text-[14px] tracking-wide w-[75px] text-left">{getTranslation('auto.review_action', language) || "Réviser"}</span>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded w-[52px] text-center shrink-0">+50 XP</span>
          </button>

          {/* Bouton Entraînement */}
          <button 
            onClick={handleEntrainement}
            disabled={!nextLesson}
            className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-[14px] transition-all cursor-pointer ${nextLesson ? 'bg-white text-slate-600 hover:text-blue-500 hover:bg-blue-50 hover:scale-[1.02] active:scale-95 border-2 border-slate-100 hover:border-blue-100' : 'bg-slate-50 text-slate-300 border-2 border-slate-100'}`}
          >
            <Target size={18} className={nextLesson ? "text-blue-500" : ""} />
            <span className="font-bold text-[14px] tracking-wide w-[75px] text-left">{getTranslation('auto.practice_action', language) || "S'entraîner"}</span>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded w-[52px] text-center shrink-0">+10 XP</span>
          </button>

          <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-[13px] font-bold px-4 py-2.5 rounded-xl opacity-0 group-hover/coins:opacity-100 transition-opacity pointer-events-none shadow-xl">
            {getTranslation('auto.chance_win_coins', language) || "1 chance sur 5 de gagner 1 à 3 pièces ! 🪙"}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
          </div>
        </div>

        {/* Bouton Suivant */}
        {/* Bouton Suivant */}
        <button 
          onClick={handleSuivant}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-[14px] transition-all cursor-pointer ${isUnitCompleted ? 'bg-slate-100 text-slate-400' : `${unitColorClass} text-white ${unitHoverClass} hover:scale-[1.02] active:scale-95 shadow-sm`}`}
        >
          <Play size={18} className="fill-current stroke-current" />
          <span className="font-extrabold text-[15px] tracking-wide">{getTranslation('auto.next', language) || "Suivant"}</span>
        </button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {hasStartedUnit && (
        <motion.div 
          key={`desktop-main-${currentUnitIndex}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="w-full flex flex-col gap-3 relative group"
        >
          <div className="flex flex-col gap-3 relative z-10">
        
        <div className="flex gap-3">
          {/* BOUTON ENTRAINEMENT */}
          {/* BOUTON ENTRAINEMENT */}
          <ActionCardButton
            onClick={handleEntrainement}
            disabled={!nextLesson}
            icon={<Target size={20} />}
            label={getTranslation('auto.training', language) || "Entraînement"}
            activeColorClass="hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
            activeIconColorClass="text-blue-500"
            tooltip={
              <>
                <span className="text-amber-500 font-extrabold">+10 XP</span> • {getTranslation('auto.chance_win_coins', language) || "1 chance sur 5 de gagner 1 à 3 pièces ! 🪙"}
              </>
            }
          />

          {/* BOUTON REVISION */}
          <ActionCardButton
            onClick={handleRevision}
            disabled={!randomMasteredLesson}
            icon={<RotateCcw size={20} />}
            label={getTranslation('auto.review_action', language) || "Réviser"}
            activeColorClass="hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600"
            activeIconColorClass="text-purple-500"
            tooltip={
              <>
                <span className="text-amber-500 font-extrabold">+50 XP</span> • {getTranslation('auto.chance_win_coins', language) || "1 chance sur 5 de gagner 1 à 3 pièces ! 🪙"}
              </>
            }
            className="[&>div:last-child]:right-0 [&>div:last-child]:left-auto [&>div:last-child>div]:right-[30%] [&>div:last-child>div]:left-auto [&>div:last-child>div]:translate-x-1/2"
          />
        </div>

        {/* BOUTON SUIVANT */}
        <Button 
          variant={isUnitCompleted ? "gamifiedSecondary" : "blueGamified"}
          onClick={handleSuivant}
          className="w-full relative p-4 flex items-center justify-between group/btn transition-all cursor-pointer h-auto py-3.5"
        >
          <div className="flex items-center gap-3 relative z-10 w-full">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUnitCompleted ? 'bg-slate-200 text-slate-500' : 'bg-white/20 text-white'}`}>
              <Play size={18} className="fill-current stroke-current ml-0.5" />
            </div>
            <div className="flex flex-col items-start text-left flex-1 min-w-0">
              <span className={`font-extrabold text-[16px] leading-tight ${isUnitCompleted ? 'text-slate-600' : 'text-white'}`}>
                {isUnitCompleted ? (getTranslation('auto.all_lessons_mastered', language) || 'Toutes les leçons maîtrisées !') : (getTranslation('auto.next', language) || 'Suivant')}
              </span>
              {!isUnitCompleted && nextLesson && (
                <span className={`text-[12px] font-medium opacity-90 truncate w-full text-white/90`}>
                  {getTranslation('auto.continue', language) || "Continuer"} {getLocalizedField(nextLesson, 'title', language)}
                </span>
              )}
            </div>
          </div>
        </Button>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
