import { m as motion } from "motion/react";
import { ChevronLeft, Star, Clock, CheckCircle, Lock } from 'lucide-react';
import IconImage from './IconImage';
import { getTranslation, getLocalizedField } from '../hooks/useTranslation';
import { getLevelSplit } from '../lib/levelSplits';
import { LessonPathMap } from './LessonPathMap';
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
        {lesson.imageUrl && (
          <>
            <div className="absolute inset-0 w-full h-full opacity-60">
              <IconImage src={lesson.imageUrl} alt="" fill className="object-cover" priority unoptimized />
            </div>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          </>
        )}
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
              {getLocalizedField(lesson, 'description', language) || 'Sélectionnez un niveau pour voir ses détails et choisir votre partie.'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <LessonPathMap
          maxLevel={maxLevelPerLesson}
          currentProgress={currentProgress}
          modalLevel={modalLevel}
          setModalLevel={setModalLevel}
          earnedStarsArray={starsArray}
          unitColor={unitColor}
          unitBorder={unitBorder}
          unitText={unitText}
          language={language}
        />
      </div>
    </motion.div>
  );
}
