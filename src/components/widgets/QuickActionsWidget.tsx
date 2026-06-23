import React, { useMemo } from 'react';
import { useProgressStore } from "@/lib/store";
import { getTranslation } from "@/hooks/useTranslation";
import { Zap, Play, RotateCcw, Target, Crown, ChevronLeft } from 'lucide-react';
import { m as motion, AnimatePresence } from "motion/react";
import { useRouter } from 'next/navigation';
import BASE_UNITS from "@/data/units.json";
import { getLightweightLessons } from "@/actions/course";
import { getLevelSplit } from "@/lib/levelSplits";
import { Button } from "@/components/ui/Button";

interface QuickActionsWidgetProps {
  lightweightLessons?: any[];
  variant?: 'desktop' | 'mobile-bubble' | 'desktop-floating';
}

export function QuickActionsWidget({ lightweightLessons, variant = 'desktop' }: QuickActionsWidgetProps) {
  const { 
    language, 
    lessonLevels, 
    lessonPartsCompleted,
    lastActiveUnitIndex
  } = useProgressStore();
  const router = useRouter();

  const [lessonsData, setLessonsData] = React.useState<any[]>(lightweightLessons || []);
  const [isFabOpen, setIsFabOpen] = React.useState(false);

  React.useEffect(() => {
    if (!lightweightLessons || lightweightLessons.length === 0) {
      getLightweightLessons().then(data => setLessonsData(data));
    }
  }, [lightweightLessons]);

  const {
    nextLesson,
    nextLevel,
    nextPart,
    nextTotalParts,
    isUnitCompleted,
    randomMasteredLesson,
    hasStartedUnit,
    hasCompletedFirstLevel
  } = useMemo(() => {
    let currentStartIndex = 0;
    let targetStartIndex = 0;
    let targetEndIndex = lessonsData.length;
    const targetUnitIndex = lastActiveUnitIndex || 0;

    for (let i = 0; i < BASE_UNITS.length; i++) {
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

    const unitLessons = lessonsData.slice(targetStartIndex, targetEndIndex);

    let nextLsn = null;
    let nextLvl = 0;
    
    let started = false;
    let completedFirstLevel = false;
    const masteredUnitLessons = [];
    
    for (const lesson of unitLessons) {
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

      if (level >= 10) {
        masteredUnitLessons.push(lesson);
      }
    }

    // Check for furthest in progress first
    for (const lesson of unitLessons) {
      const level = lessonLevels[lesson.id] || 0;
      if (level > 0 && level < 10 && !nextLsn) {
        nextLsn = lesson;
        nextLvl = level;
      }
    }
    
    // If none in progress, find first zero level
    if (!nextLsn) {
      for (const lesson of unitLessons) {
        const level = lessonLevels[lesson.id] || 0;
        if (level === 0) {
          nextLsn = lesson;
          nextLvl = 0;
          break;
        }
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
      hasCompletedFirstLevel: completedFirstLevel
    };
  }, [lessonsData, lessonLevels, lessonPartsCompleted, lastActiveUnitIndex]);

  const handleSuivant = () => {
    if (isUnitCompleted) {
      alert("Tout est maîtrisé ! L'unité suivante arrive bientôt.");
      return;
    }
    if (!nextLesson) return;
    
    let url = `/lesson/${nextLesson.id}?level=${nextLevel + 1}`;
    if (nextTotalParts > 1) {
      url += `&part=${nextPart}&totalParts=${nextTotalParts}`;
    }
    router.push(url);
  };

  const handleEntrainement = () => {
    if (!nextLesson) return;
    let url = `/lesson/${nextLesson.id}?level=${nextLevel + 1}&mode=training`;
    if (nextTotalParts > 1) {
      url += `&part=${nextPart}&totalParts=${nextTotalParts}`;
    }
    router.push(url);
  };

  const handleRevision = () => {
    if (!randomMasteredLesson) return;
    router.push(`/lesson/${randomMasteredLesson.id}?level=10&mode=revision`);
  };

  const currentUnitIndex = lastActiveUnitIndex || 0;
  const currentUnit = BASE_UNITS[currentUnitIndex] || BASE_UNITS[0];
  const unitColorClass = currentUnit.colorClass || 'bg-emerald-500';
  const unitHoverClass = currentUnit.hoverClass || 'hover:bg-emerald-400';

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
                      <span className="font-bold text-[12px] tracking-wide">Réviser</span>
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
                    <span className="font-bold text-[12px] tracking-wide">S'entraîner</span>
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
            <span className="font-extrabold text-[12px] tracking-wide">Suivant</span>
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
            <span className="font-bold text-[14px] tracking-wide w-[75px] text-left">Réviser</span>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded w-[52px] text-center shrink-0">+50 XP</span>
          </button>

          {/* Bouton Entraînement */}
          <button 
            onClick={handleEntrainement}
            disabled={!nextLesson}
            className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-[14px] transition-all cursor-pointer ${nextLesson ? 'bg-white text-slate-600 hover:text-blue-500 hover:bg-blue-50 hover:scale-[1.02] active:scale-95 border-2 border-slate-100 hover:border-blue-100' : 'bg-slate-50 text-slate-300 border-2 border-slate-100'}`}
          >
            <Target size={18} className={nextLesson ? "text-blue-500" : ""} />
            <span className="font-bold text-[14px] tracking-wide w-[75px] text-left">S'entraîner</span>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded w-[52px] text-center shrink-0">+10 XP</span>
          </button>

          <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-[13px] font-bold px-4 py-2.5 rounded-xl opacity-0 group-hover/coins:opacity-100 transition-opacity pointer-events-none shadow-xl">
            1 chance sur 5 de gagner 1 à 3 pièces ! 🪙
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
          </div>
        </div>

        {/* Bouton Suivant */}
        <button 
          onClick={handleSuivant}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-[14px] transition-all cursor-pointer ${isUnitCompleted ? 'bg-slate-100 text-slate-400' : `${unitColorClass} text-white ${unitHoverClass} hover:scale-[1.02] active:scale-95 shadow-sm`}`}
        >
          <Play size={18} className="fill-current stroke-current" />
          <span className="font-extrabold text-[15px] tracking-wide">Suivant</span>
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
          <button 
            onClick={handleEntrainement}
            disabled={!nextLesson}
            className={`flex-1 relative rounded-[16px] p-3 flex flex-col items-center justify-center gap-1.5 transition-all group/btn
              ${nextLesson 
                ? 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 cursor-pointer' 
                : 'bg-slate-50 border-2 border-slate-100 text-slate-400 cursor-not-allowed opacity-50'}`}
          >
            <Target size={20} className={nextLesson ? "text-blue-500" : "text-slate-400"} />
            <span className="font-bold text-[13px]">Entraînement</span>

            {/* Bulle Tooltip */}
            <div className="absolute -top-16 left-0 bg-white border-2 border-slate-100 text-slate-600 text-[13px] font-bold px-4 py-3 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-all pointer-events-none shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-20 w-[220px] text-center leading-snug">
              <span className="text-amber-500 font-extrabold">+10 XP</span> • 1 chance sur 5 de gagner 1 à 3 pièces ! 🪙
              <div className="absolute -bottom-2 left-[30%] -translate-x-1/2 w-3.5 h-3.5 bg-white border-b-2 border-r-2 border-slate-100 rotate-45"></div>
            </div>
          </button>

          {/* BOUTON REVISION */}
          <button 
            onClick={handleRevision}
            disabled={!randomMasteredLesson}
            className={`flex-1 relative rounded-[16px] p-3 flex flex-col items-center justify-center gap-1.5 transition-all group/btn
              ${randomMasteredLesson 
                ? 'bg-white border-2 border-slate-200 text-slate-700 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600 active:scale-95 cursor-pointer' 
                : 'bg-slate-50 border-2 border-slate-100 text-slate-400 cursor-not-allowed opacity-50'}`}
          >
            <RotateCcw size={20} className={randomMasteredLesson ? "text-purple-500" : "text-slate-400"} />
            <span className="font-bold text-[13px]">Réviser</span>

            {/* Bulle Tooltip */}
            <div className="absolute -top-16 right-0 bg-white border-2 border-slate-100 text-slate-600 text-[13px] font-bold px-4 py-3 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-all pointer-events-none shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-20 w-[220px] text-center leading-snug">
              <span className="text-amber-500 font-extrabold">+50 XP</span> • 1 chance sur 5 de gagner 1 à 3 pièces ! 🪙
              <div className="absolute -bottom-2 right-[30%] translate-x-1/2 w-3.5 h-3.5 bg-white border-b-2 border-r-2 border-slate-100 rotate-45"></div>
            </div>
          </button>
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
                {isUnitCompleted ? 'Toutes les leçons maîtrisées !' : 'Suivant'}
              </span>
              {!isUnitCompleted && nextLesson && (
                <span className={`text-[12px] font-medium opacity-90 truncate w-full text-white/90`}>
                  Continuer {language === 'en' ? nextLesson.titleEn : nextLesson.title}
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
