import { m as motion } from "motion/react";
import { ChevronLeft, Star, Clock, CheckCircle, Lock } from 'lucide-react';
import IconImage from './IconImage';
import { getTranslation, getLocalizedField } from '../hooks/useTranslation';
import { getLevelSplit } from '../lib/levelSplits';
import { LessonPathMap } from './LessonPathMap';
import { useProgressStore } from '../lib/store';
import { useState, useEffect, useRef } from 'react';

interface DesktopLessonLevelsViewProps {
  lessonData: { lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string, initialScrollLevel?: number };
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
  const lessonPartsCompleted = useProgressStore(state => state.lessonPartsCompleted);

  const colorMatch = unitColor.match(/bg-([a-z]+)-\d+/);
  const colorName = colorMatch ? colorMatch[1] : 'emerald';
  const unitLabelColor = `text-${colorName}-600`;
  const titleTextColor = `text-${colorName}-800`;

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateSnap = () => {
      if (window.innerWidth < 1024) {
        document.documentElement.style.scrollSnapType = 'y mandatory';
      } else {
        document.documentElement.style.scrollSnapType = 'none';
      }
    };

    updateSnap();
    window.addEventListener('resize', updateSnap);

    const nav = document.getElementById('bottom-nav');
    if (nav && window.innerWidth < 1024) {
      nav.style.transform = 'translateY(100%)';
      nav.style.opacity = '0';
      nav.style.pointerEvents = 'none';
    }

    return () => {
      window.removeEventListener('resize', updateSnap);
      document.documentElement.style.scrollSnapType = '';
      if (nav) {
        nav.style.transform = 'translateY(0)';
        nav.style.opacity = '1';
        nav.style.pointerEvents = 'auto';
      }
    };
  }, []);

  const lessonTitle = suggestionType === 'alphabet' && (lesson.type === 'consonant' || lesson.type === 'vowel')
    ? `${getTranslation(lesson.type === 'consonant' ? 'auto.consonants' : 'auto.vowels', language)} ${lesson.id.split('-').pop()}`
    : getLocalizedField(lesson, 'title', language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 20 }}
      exit={{ opacity: 0, y: 20 }}
      className={`flex flex-col gap-6 w-full transition-opacity duration-700 ease-out ${isReady ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Desktop Header */}
      <div className={`hidden md:flex snap-start scroll-mt-[100px] p-0 ${unitColor} border-b-[6px] ${unitBorder} rounded-[2rem] shadow-xl relative overflow-hidden min-h-[280px] items-center`}>
        {lesson.imageUrl ? (
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <IconImage src={lesson.imageUrl} alt="" fill className="object-cover opacity-100" priority />
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full z-0 bg-black/10 pointer-events-none"></div>
        )}
        
        {/* Glassmorphism Card */}
        <div className="relative z-10 p-5 md:p-8 mx-4 md:mx-10 my-4 md:my-10 max-w-xl w-[calc(100%-2rem)] sm:w-auto bg-white/85 md:bg-white/70 backdrop-blur-xl border border-white/60 rounded-[1.5rem] md:rounded-3xl shadow-xl flex flex-col items-start gap-3 md:gap-4">
          <button 
            onClick={onBack}
            className={`flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-5 md:py-2.5 ${unitColor} hover:opacity-90 text-white rounded-xl font-bold md:font-extrabold transition-all shadow-md active:scale-95 text-sm md:text-base`}
          >
            <ChevronLeft size={18} className="stroke-[3] md:w-5 md:h-5" />
            {getTranslation('auto.back', language)}
          </button>
          
          <div className="flex flex-col gap-0.5 md:gap-1 w-full">
            {unitTitle && (
              <h3 className={`${unitLabelColor} font-bold uppercase tracking-widest text-xs md:text-sm`}>
                {unitTitle}
              </h3>
            )}
            
            <h2 className={`text-2xl md:text-3xl lg:text-4xl font-medium ${titleTextColor} tracking-tight leading-tight`}>
              {lessonTitle}
            </h2>
            <p className={`${titleTextColor} opacity-80 text-sm md:text-lg leading-snug mt-0.5 md:mt-1`}>
              {getLocalizedField(lesson, 'description', language) || 'Sélectionnez un niveau pour voir ses détails et choisir partie.'}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Immersive Header Banner */}
      <div className="flex md:hidden w-[calc(100%+2rem)] -mx-4 -mt-2 relative">
        <div className={`w-full h-[220px] ${unitColor} relative overflow-hidden rounded-b-3xl shadow-sm`}>
          {lesson.imageUrl ? (
            <IconImage src={lesson.imageUrl} alt="" fill className="object-cover opacity-100" priority />
          ) : (
            <div className="absolute inset-0 w-full h-full z-0 bg-black/10 pointer-events-none"></div>
          )}
        </div>
      </div>
        
      {/* Sticky Title Box (Mobile) */}
      <div className="sticky top-4 z-50 px-6 -mt-14 flex md:hidden justify-center w-full pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 rounded-[1.25rem] py-3 px-6 max-w-[90%] pointer-events-auto">
          <h2 className={`text-lg font-extrabold ${titleTextColor} text-center leading-tight`}>
            {lessonTitle}
          </h2>
        </div>
      </div>

      <div className="w-full relative">
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
          lessonId={lesson.id}
          lesson={lesson}
          lessonPartsCompleted={lessonPartsCompleted}
          suggestionType={suggestionType}
          initialScrollLevel={lessonData.initialScrollLevel}
          onReady={() => setIsReady(true)}
          onBack={onBack}
        />
      </div>
    </motion.div>
  );
}
