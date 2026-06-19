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
    const nav = document.getElementById('bottom-nav');
    if (nav && window.innerWidth < 1024) {
      nav.style.transform = 'translateY(100%)';
      nav.style.opacity = '0';
      nav.style.pointerEvents = 'none';
    }

    const sidebarSpacer = document.getElementById('desktop-sidebar-spacer');
    const sidebarNav = document.getElementById('desktop-sidebar-nav');
    if (sidebarSpacer) sidebarSpacer.style.display = 'none';
    if (sidebarNav) sidebarNav.style.display = 'none';

    return () => {
      if (nav) {
        nav.style.transform = 'translateY(0)';
        nav.style.opacity = '1';
        nav.style.pointerEvents = 'auto';
      }
      if (sidebarSpacer) sidebarSpacer.style.display = '';
      if (sidebarNav) sidebarNav.style.display = '';
    };
  }, []);

  const lessonTitle = suggestionType === 'alphabet' && (lesson.type === 'consonant' || lesson.type === 'vowel')
    ? `${getTranslation(lesson.type === 'consonant' ? 'auto.consonants' : 'auto.vowels', language)} ${lesson.id.split('-').pop()}`
    : getLocalizedField(lesson, 'title', language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 30 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col gap-6 w-full transition-opacity duration-500 ease-out ${isReady ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Immersive Header Banner */}
      <div className="flex w-[calc(100%+2rem)] md:w-full -mx-4 md:mx-0 -mt-2 md:-mt-8 relative">
        <div className={`w-full h-[220px] md:h-[360px] ${unitColor} relative overflow-hidden rounded-none`}>
          {lesson.imageUrl ? (
            <>
              <IconImage src={lesson.imageUrl} alt="" fill className="object-cover object-center opacity-100" priority unoptimized />
              {/* Gradient Overlay pour incruster la bannière dans le fond */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
            </>
          ) : (
            <div className="absolute inset-0 w-full h-full z-0 bg-black/10 pointer-events-none"></div>
          )}
        </div>
      </div>
        
      {/* Sticky Title Box */}
      <div className="sticky top-4 z-50 px-6 -mt-10 md:-mt-12 flex justify-center w-full pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 rounded-[1.25rem] py-3 px-6 max-w-[90%] pointer-events-auto">
          <h2 className={`text-lg md:text-xl font-extrabold ${titleTextColor} text-center leading-tight`}>
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
