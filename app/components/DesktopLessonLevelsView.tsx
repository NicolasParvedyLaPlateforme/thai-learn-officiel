import { m as motion } from "motion/react";
import { ChevronLeft, Star, Clock, CheckCircle, Lock } from 'lucide-react';
import { getTranslation, getLocalizedField } from '../hooks/useTranslation';
import { getLevelSplit } from '../lib/levelSplits';

interface DesktopLessonLevelsViewProps {
  lessonData: { lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string };
  unitTitle?: string;
  modalLevel: number | null;
  setModalLevel: (level: number) => void;
  onBack: () => void;
  language: string;
  lessonLevels: Record<string, number>;
  lessonStars: Record<string, number[]>;
  maxLevelPerLesson: number;
  suggestionType: string;
}

export function DesktopLessonLevelsView({
  lessonData,
  unitTitle,
  modalLevel,
  setModalLevel,
  onBack,
  language,
  lessonLevels,
  lessonStars,
  maxLevelPerLesson,
  suggestionType
}: DesktopLessonLevelsViewProps) {
  const { lesson, unitColor, unitBorder, unitText } = lessonData;
  const currentProgress = lessonLevels[lesson.id] || 0;
  const starsArray = lessonStars[lesson.id] || Array(maxLevelPerLesson + 1).fill(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {/* Header */}
      <div className={`p-8 md:p-10 ${unitColor} border-b-[6px] ${unitBorder} rounded-3xl text-white shadow-xl relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col items-start gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 text-white rounded-xl font-bold transition-colors shadow-sm backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
            {getTranslation('auto.back', language)}
          </button>
          
          {unitTitle && (
            <h3 className="text-white/80 font-black uppercase tracking-widest text-sm drop-shadow-sm">
              {unitTitle}
            </h3>
          )}
          
          <div className="flex flex-col">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white drop-shadow-md tracking-tight mb-2">
              {suggestionType === 'alphabet' && (lesson.type === 'consonant' || lesson.type === 'vowel')
                ? `${getTranslation(lesson.type === 'consonant' ? 'auto.consonants' : 'auto.vowels', language)} ${lesson.id.split('-').pop()}`
                : getLocalizedField(lesson, 'title', language)}
            </h2>
            <p className="text-white/90 font-medium text-lg drop-shadow">
              {getTranslation('auto.level_selection_subtitle', language) || 'Sélectionnez un niveau pour voir ses détails et choisir votre partie.'}
            </p>
          </div>
        </div>
      </div>

      {/* Levels List */}
      <div className="flex flex-col gap-4 w-full">
        {Array.from({ length: maxLevelPerLesson }).map((_, levelIndex) => {
          const isAccessible = levelIndex <= currentProgress;
          const isCompleted = levelIndex < currentProgress;
          const isCurrent = levelIndex === currentProgress;
          const isSelected = modalLevel === levelIndex;
          
          const earnedStars = starsArray[levelIndex] || 0;
          const totalParts = suggestionType === 'learn' ? getLevelSplit(levelIndex, lesson) : 1;
          
          // Estimate time & XP for display
          const wordCount = lesson.words?.length || 0;
          const stepsCount = 10 + wordCount + (lesson.phrases?.length || 0);
          let secsPerStep = 5;
          if (levelIndex <= 1) secsPerStep = 5;
          else if (levelIndex <= 3) secsPerStep = 7;
          else if (levelIndex <= 6) secsPerStep = 10;
          else if (levelIndex === 7) secsPerStep = 20;
          else secsPerStep = 40;
          
          let estimatedMins = Math.ceil((stepsCount * secsPerStep) / 60);
          if (lesson.isReview) estimatedMins = (levelIndex + 1) * 2;
          else if (levelIndex === 9) estimatedMins = Math.max(30, estimatedMins);
          else estimatedMins = Math.max(1, estimatedMins);

          // Expected XP logic summary
          const baseXP = levelIndex <= 6 ? 30 : levelIndex === 7 ? 50 : levelIndex === 8 ? 100 : 300;
          const totalExpectedXp = baseXP * totalParts; // Approximation pour affichage

          return (
            <button
              key={levelIndex}
              onClick={(e) => {
                e.stopPropagation();
                if (isAccessible) setModalLevel(levelIndex);
              }}
              disabled={!isAccessible}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                isSelected 
                  ? `bg-white border-slate-300 ring-4 ring-slate-100 shadow-md scale-[1.02] z-10` 
                  : isAccessible 
                    ? `bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm cursor-pointer`
                    : `bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed`
              }`}
            >
              <div className="flex items-center gap-5">
                {/* Status Icon / Level Number */}
                <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xl shadow-sm border-b-4
                  ${isCompleted ? 'bg-amber-100 text-amber-600 border-amber-200' : 
                    isCurrent ? `${unitColor} text-white ${unitBorder}` : 
                    'bg-slate-200 text-slate-400 border-slate-300'}
                `}>
                  {isCompleted ? <CheckCircle size={28} className="fill-current text-white stroke-amber-500" /> : 
                   !isAccessible ? <Lock size={24} className="text-slate-400" /> :
                   (levelIndex + 1)}
                </div>
                
                {/* Level Title & Status */}
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-extrabold text-xl text-slate-800">
                      {getTranslation('auto.lvl', language)} {levelIndex + 1}
                    </h4>
                    {isCompleted ? (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                        {getTranslation('auto.mastered', language)}
                      </span>
                    ) : isCurrent ? (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                        {getTranslation('auto.in_progress', language)}
                      </span>
                    ) : null}
                  </div>
                  
                  {/* Stars visually representing parts/score */}
                  {isAccessible && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < earnedStars ? "fill-amber-400 text-amber-500" : "fill-slate-100 text-slate-200"} 
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-400 ml-1">
                        {earnedStars}/10
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats on the right */}
              {isAccessible && (
                <div className="hidden md:flex flex-col items-end gap-1.5">
                  <span className="text-sm font-bold text-slate-500">
                    {totalParts > 1 ? `${totalParts} parties` : '1 partie'}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                      <Star size={14} className="fill-current" />
                      {totalExpectedXp} XP
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Clock size={14} />
                      {estimatedMins} min
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
