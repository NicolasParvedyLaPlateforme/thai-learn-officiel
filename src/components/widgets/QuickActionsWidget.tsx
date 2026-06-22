import React, { useMemo } from 'react';
import { useProgressStore } from "@/lib/store";
import { getTranslation } from "@/hooks/useTranslation";
import { Zap, Play, RotateCcw, Target, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
    setLastActiveUnitIndex
  } = useProgressStore();
  const router = useRouter();

  const [lessonsData, setLessonsData] = React.useState<any[]>(lightweightLessons || []);

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
    randomMasteredLesson
  } = useMemo(() => {
    let nextLsn = null;
    let nextLvl = 0;
    
    // Check for furthest in progress first
    for (const lesson of lessonsData) {
      if (!lesson) continue;
      const level = lessonLevels[lesson.id] || 0;
      if (level > 0 && level < 10 && !nextLsn) {
        nextLsn = lesson;
        nextLvl = level;
      }
    }
    
    // If none in progress, find first zero level
    if (!nextLsn) {
      for (const lesson of lessonsData) {
        if (!lesson) continue;
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

    const masteredLessons = lessonsData.filter(l => (lessonLevels[l.id] || 0) >= 10);
    const rndMastered = masteredLessons.length > 0 
      ? masteredLessons[Math.floor(Math.random() * masteredLessons.length)] 
      : null;

    return {
      nextLesson: nextLsn,
      nextLevel: nextLvl,
      nextPart: nPart,
      nextTotalParts: nTotalParts,
      isUnitCompleted: unitCompleted,
      randomMasteredLesson: rndMastered
    };
  }, [lessonsData, lessonLevels, lessonPartsCompleted]);

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

  if (variant === 'mobile-bubble') {
    return (
      <div className="flex bg-white rounded-[1.25rem] shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-slate-100 p-1.5 gap-1.5 relative">
        {/* Flèche pointant vers le bas */}
        <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-b border-r border-slate-100 transform rotate-45" />
        
        {/* Bouton Suivant */}
        <button 
          onClick={handleSuivant}
          className={`flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl transition-all ${isUnitCompleted ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-400'}`}
        >
          <Play size={14} className="fill-current stroke-current" />
          <span className="font-extrabold text-[11px] tracking-wide">Suivant</span>
        </button>

        {/* Bouton Entraînement */}
        <button 
          onClick={handleEntrainement}
          disabled={!nextLesson}
          className={`flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl transition-all ${nextLesson ? 'bg-blue-50 text-blue-500 hover:bg-blue-100' : 'bg-slate-50 text-slate-300'}`}
        >
          <Target size={15} />
          <span className="font-bold text-[11px] tracking-wide">S'entraîner</span>
        </button>

        {/* Bouton Révision */}
        <button 
          onClick={handleRevision}
          disabled={!randomMasteredLesson}
          className={`flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl transition-all ${randomMasteredLesson ? 'bg-purple-50 text-purple-500 hover:bg-purple-100' : 'bg-slate-50 text-slate-300'}`}
        >
          <RotateCcw size={15} />
          <span className="font-bold text-[11px] tracking-wide">Réviser</span>
        </button>
      </div>
    );
  }

  if (variant === 'desktop-floating') {
    return (
      <div className="flex bg-white/95 backdrop-blur-xl rounded-[1.25rem] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200 p-2 gap-2 relative items-center">
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
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-[14px] transition-all cursor-pointer ${isUnitCompleted ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 shadow-sm'}`}
        >
          <Play size={18} className="fill-current stroke-current" />
          <span className="font-extrabold text-[15px] tracking-wide">Suivant</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3 relative group">
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
    </div>
  );
}
