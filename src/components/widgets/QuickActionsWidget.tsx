import React, { useMemo } from 'react';
import { useProgressStore } from "@/lib/store";
import { getTranslation } from "@/hooks/useTranslation";
import { Zap, Play, RotateCcw, Target, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLightweightLessons } from "@/actions/course";
import { getLevelSplit } from "@/lib/levelSplits";

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
    <div className="w-full border-b border-slate-200 py-6 px-1 flex flex-col gap-4 relative group">
      <div className="flex items-center justify-between relative z-10 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100/50 text-amber-500 rounded-xl flex items-center justify-center shadow-sm">
            <Zap size={22} className="stroke-[2.5]" />
          </div>
          <h2 className="font-extrabold text-slate-800 text-[17px] tracking-tight">
            Action Rapide
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        
        {/* BOUTON SUIVANT */}
        <button 
          onClick={handleSuivant}
          className={`w-full relative overflow-hidden rounded-[16px] p-4 flex items-center justify-between group/btn transition-all
            ${isUnitCompleted 
              ? 'bg-slate-100 border-slate-200 text-slate-600' 
              : 'bg-emerald-500 border-emerald-600 text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0'}`}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUnitCompleted ? 'bg-white/50 text-slate-500' : 'bg-white/20 text-white'}`}>
              <Play size={18} className="fill-current stroke-current ml-0.5" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-extrabold text-[16px] leading-tight">
                {isUnitCompleted ? 'Toutes les leçons maîtrisées !' : 'Suivant'}
              </span>
              {!isUnitCompleted && nextLesson && (
                <span className={`text-[12px] font-medium opacity-90 truncate max-w-[140px] md:max-w-[200px]`}>
                  Continuer {language === 'en' ? nextLesson.titleEn : nextLesson.title}
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="flex gap-3">
          {/* BOUTON ENTRAINEMENT */}
          <button 
            onClick={handleEntrainement}
            disabled={!nextLesson}
            className={`flex-1 relative overflow-hidden rounded-[16px] p-3 flex flex-col items-center justify-center gap-1.5 transition-all
              ${nextLesson 
                ? 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95 cursor-pointer' 
                : 'bg-slate-50 border-2 border-slate-100 text-slate-400 cursor-not-allowed opacity-50'}`}
          >
            <Target size={20} className={nextLesson ? "text-blue-500" : "text-slate-400"} />
            <span className="font-bold text-[13px]">Entraînement</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
              +10 XP
            </div>
          </button>

          {/* BOUTON REVISION */}
          <button 
            onClick={handleRevision}
            disabled={!randomMasteredLesson}
            className={`flex-1 relative overflow-hidden rounded-[16px] p-3 flex flex-col items-center justify-center gap-1.5 transition-all
              ${randomMasteredLesson 
                ? 'bg-white border-2 border-slate-200 text-slate-700 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600 active:scale-95 cursor-pointer' 
                : 'bg-slate-50 border-2 border-slate-100 text-slate-400 cursor-not-allowed opacity-50'}`}
          >
            <RotateCcw size={20} className={randomMasteredLesson ? "text-purple-500" : "text-slate-400"} />
            <span className="font-bold text-[13px]">Réviser</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
              +50 XP
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
