import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { BookOpen, Star, Lock, Crown, Clock, Pencil, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { playThaiTTS } from "@/lib/tts";
import IconImage from '../ui/IconImage';
import { LessonPathMap } from '../learn/LessonPathMap';
import SharedLessonModal from '../ui/SharedLessonModal';

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
  const wordCount = selectedLesson.lesson.words?.length || 0;
  const stepsCount = 10 + wordCount + (selectedLesson.lesson.phrases?.length || 0);
  
  let secsPerStep = 5;
  if (modalLevel <= 1) secsPerStep = 5;
  else if (modalLevel <= 3) secsPerStep = 7;
  else if (modalLevel <= 6) secsPerStep = 10;
  else if (modalLevel === 7) secsPerStep = 20;
  else secsPerStep = 40;

  let estimatedSecs = stepsCount * secsPerStep;
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
        <div className="flex items-center gap-3 w-full mt-1">
          {isBrave ? (
            <button
              disabled
              className={`w-full py-4 rounded-xl font-bold text-[17px] text-white shadow-md flex items-center justify-center opacity-50 cursor-not-allowed bg-slate-400`}
            >
              {getTranslation('auto.unavailable_on_brave', language)}
            </button>
          ) : (
            <Link
              href={`/speak/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`}
              className={`flex-1 py-4 xl:py-4 md:py-3 rounded-xl font-bold text-[17px] text-white shadow-md flex items-center justify-center hover:opacity-90 active:translate-y-1 transition-all ${selectedLesson.unitColor}`}
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
        <div className="flex items-center justify-center gap-3 mb-8 border-b border-slate-100 pb-8 w-full flex-wrap">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold whitespace-nowrap shadow-sm bg-white">
            <Clock size={16} className="text-slate-500" />
            {estimatedMins} min
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-bold shadow-sm whitespace-nowrap">
            <Star size={16} className="fill-amber-500 text-amber-600" />
            {isFirstTime ? `+${expectedXp} XP` : (
              <>
                <span className="text-xl font-black text-amber-600">
                  {!isFirstTime && maxXp > expectedXp && (
                    <span className="line-through text-amber-400/60 mr-1 opacity-80 text-sm">+{maxXp}</span>
                  )}
                  +{expectedXp} XP
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </SharedLessonModal>
  );
}
