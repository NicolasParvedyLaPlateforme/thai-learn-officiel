import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { BookOpen, Star, Lock, Crown, Clock, Pencil, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { playThaiTTS } from "@/lib/tts";
import IconImage from '../ui/IconImage';
import { LessonPathMap } from '../learn/LessonPathMap';
import { buttonVariants } from '../ui/Button';
import SharedLessonModal from '../ui/SharedLessonModal';
import { LessonDetailsStats } from '../path-ui/LessonDetailsStats';
import stepsSpeak from "@/data/steps_metadata_speak.json";

interface SpeakLessonModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLesson: { lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string } | null;
  modalLevel: number;
  setModalLevel: (level: number) => void;
  language: string;
  lessonLevels: Record<string, number>;
  lessonStars: Record<string, number[]>;
  resetLessonLevel: (lessonId: string) => void;
  reviewStats: Record<string, Record<number, any>>;
  getExpectedXp: (lessonId: string, levelIndex: number, isBilan: boolean, isPart?: boolean, isFullLongLevel?: boolean, partIndex?: number | null) => { xp: number, maxXp: number, isFirstTime: boolean, key: string };
  maxLevelPerLesson?: number;
}

export default function SpeakLessonModal({
  isOpen,
  onOpenChange,
  selectedLesson: selectedLessonProp,
  modalLevel,
  setModalLevel,
  language,
  lessonLevels,
  lessonStars,
  resetLessonLevel,
  reviewStats,
  getExpectedXp,
  maxLevelPerLesson = 10
}: SpeakLessonModalProps) {
  const [selectedLesson, setSelectedLesson] = useState(selectedLessonProp);
  const [isBrave, setIsBrave] = useState(false);
  
  useEffect(() => {
    if (selectedLessonProp) {
      setSelectedLesson(selectedLessonProp);
    }
  }, [selectedLessonProp]);

  useEffect(() => {
    const checkBrave = async () => {
      if ((navigator as any).brave && await (navigator as any).brave.isBrave()) {
        setIsBrave(true);
      }
    };
    checkBrave();
  }, []);

  if (!selectedLesson) return null;

  const currentProgress = lessonLevels[selectedLesson.lesson.id] || 0;
  const exactStepsCount = (stepsSpeak as any)?.[selectedLesson.lesson.id]?.[modalLevel]?.['full'] || 0;
  
  let secsPerStep = 5;
  if (modalLevel <= 1) secsPerStep = 5;
  else if (modalLevel <= 3) secsPerStep = 7;
  else if (modalLevel <= 6) secsPerStep = 10;
  else if (modalLevel === 7) secsPerStep = 20;
  else secsPerStep = 40;

  let estimatedSecs = exactStepsCount * secsPerStep;
  let estimatedMins = Math.ceil(estimatedSecs / 60);
  
  if (selectedLesson.lesson.isReview) {
    estimatedMins = (modalLevel + 1) * 2;
  } else if (modalLevel === maxLevelPerLesson) {
    estimatedMins = 20;
  } else {
    if (modalLevel === 9) estimatedMins = Math.max(30, estimatedMins);
    else estimatedMins = Math.max(1, estimatedMins);
  }

  const isReviewOrBilan = selectedLesson.lesson.isReview || selectedLesson.lesson.title?.toLowerCase().includes('bilan');
  const { xp: expectedXp, maxXp, isFirstTime } = getExpectedXp(`speak_${selectedLesson.lesson.id}`, modalLevel, !!isReviewOrBilan);

  // Mastery Logic
  const isUnlockedMastery = currentProgress >= maxLevelPerLesson;
  const isSelectedMastery = modalLevel === maxLevelPerLesson;
  const starsArrayMastery = lessonStars[selectedLesson.lesson.id] || Array(maxLevelPerLesson + 1).fill(0);
  const earnedStarsMastery = starsArrayMastery[maxLevelPerLesson] || 0;
  const isCompletedMastery = isUnlockedMastery && earnedStarsMastery > 0;

  return (
    <SharedLessonModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      language={language}
      isReviewOrMastery={!!isReviewOrBilan || modalLevel === maxLevelPerLesson}
      isMastery={modalLevel === maxLevelPerLesson}
      modalLevel={modalLevel}
      lessonId={selectedLesson.lesson.id}
      reviewStats={reviewStats}
      footer={
        <div className="flex items-center gap-2 w-full mt-1 relative">
          {isBrave ? (
            <button
              disabled
              className={buttonVariants({ variant: 'gamified', size: 'lg', className: "w-full rounded-xl opacity-50 cursor-not-allowed bg-slate-400 border-slate-500" })}
            >
              {getTranslation('auto.unavailable_on_brave', language)}
            </button>
          ) : (
            <Link
              href={`/speak/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`}
              className={buttonVariants({ 
                variant: 'gamified', 
                size: 'lg', 
                className: `w-full rounded-xl ${selectedLesson.unitColor} ${selectedLesson.unitColor.replace('bg-', 'border-').replace(/500$/, '600').replace(/400$/, '500')}` 
              })}
            >
              {getTranslation('auto.start_lesson', language)}
            </Link>
          )}
        </div>
      }
    >
      <div className="w-full shrink-0 z-0">
        <div className={`w-full h-[120px] bg-amber-50 flex items-center justify-center relative overflow-hidden`}>
          {selectedLesson.lesson.imageUrl ? (
            <IconImage src={selectedLesson.lesson.imageUrl} alt="" fill className="object-cover" />
          ) : (
            <BookOpen size={48} className="text-slate-200" />
          )}
        </div>
      </div>

      <div className="p-6 pt-5 pb-2 text-center flex flex-col items-center">
        <h3 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight font-sans tracking-tight">
          {getLocalizedField(selectedLesson.lesson, 'title', language)}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
          {getLocalizedField(selectedLesson.lesson, 'description', language)}
        </p>
      </div>

      <div className="px-7 pt-2 flex flex-col">
        <div className="flex flex-col items-center mb-8 border-b border-slate-100 pb-8 w-full">
          <LessonDetailsStats 
            stepsCount={exactStepsCount}
            expectedXp={expectedXp}
            maxXp={maxXp}
            isFirstTime={isFirstTime}
            estimatedMins={Math.max(1, estimatedMins)}
          />
        </div>
      </div>
    </SharedLessonModal>
  );
}
