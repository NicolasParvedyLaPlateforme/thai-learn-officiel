import { m as motion } from "motion/react";
import { ChevronLeft, Star, Clock, CheckCircle, Lock } from 'lucide-react';
import IconImage from './IconImage';
import { getTranslation, getLocalizedField } from '../hooks/useTranslation';
import { getLevelSplit } from '../lib/levelSplits';
import { LessonPathMap } from './LessonPathMap';
import { useProgressStore } from '../lib/store';
import { useState, useEffect, useRef } from 'react';

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
  const lessonPartsCompleted = useProgressStore(state => state.lessonPartsCompleted);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { rootMargin: '-100px 0px 0px 0px', threshold: 0 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setIsScrollingUp(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsScrollingUp(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsScrollingUp(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const lessonTitle = suggestionType === 'alphabet' && (lesson.type === 'consonant' || lesson.type === 'vowel')
    ? `${getTranslation(lesson.type === 'consonant' ? 'auto.consonants' : 'auto.vowels', language)} ${lesson.id.split('-').pop()}`
    : getLocalizedField(lesson, 'title', language);

  const showStickyBanner = isScrolled && isScrollingUp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 20 }}
      exit={{ opacity: 0, y: 20 }}
      className={`flex flex-col gap-6 w-full transition-opacity duration-700 ease-out ${isReady ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Sticky Mini Banner */}
      <div className={`sticky top-[72px] md:top-8 z-50 w-full py-3 px-4 ${unitColor} rounded-2xl shadow-xl border-b-[4px] ${unitBorder} flex items-center justify-between text-white backdrop-blur-md bg-opacity-95 transition-all duration-300 ${showStickyBanner ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center gap-3 w-full">
          <button 
            onClick={onBack}
            className="flex items-center justify-center p-2 bg-black/20 hover:bg-black/30 rounded-xl transition-colors shrink-0"
          >
            <ChevronLeft size={20} className="stroke-[3]" />
          </button>
          <span className="font-extrabold text-base md:text-lg truncate drop-shadow-sm flex-1">
            {lessonTitle}
          </span>
        </div>
      </div>

      {/* Header */}
      <div ref={headerRef} className={`p-8 md:p-10 ${unitColor} border-b-[6px] ${unitBorder} rounded-3xl text-white shadow-xl relative overflow-hidden -mt-20 md:-mt-24`}>
        {lesson.imageUrl && (
          <>
            <div className="absolute inset-0 w-full h-full opacity-60">
              <IconImage src={lesson.imageUrl} alt="" fill className="object-cover" priority />
            </div>
            <div className="absolute inset-0 bg-black/40"></div>
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
              {lessonTitle}
            </h2>
            <p className="text-white/90 font-medium text-lg drop-shadow">
              {getLocalizedField(lesson, 'description', language) || 'Sélectionnez un niveau pour voir ses détails et choisir votre partie.'}
            </p>
          </div>
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
          onReady={() => setIsReady(true)}
        />
      </div>
    </motion.div>
  );
}
