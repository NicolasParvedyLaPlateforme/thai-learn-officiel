import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTranslation } from "@/hooks/useTranslation";
import { buttonVariants } from '../ui/Button';
import SharedLessonModal from '../ui/SharedLessonModal';
import { useProgressStore } from "@/lib/store";
import { LessonDetailsStats } from '../path-ui/LessonDetailsStats';

interface AlphabetLessonModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLesson: { lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string } | null;
  modalLevel: number;
  setModalLevel: (level: number) => void;
  language: string;
  lessonLevels: Record<string, number>;
  lessonStars: Record<string, number[]>;
  resetLessonLevel: (lessonId: string) => void;
}

export default function AlphabetLessonModal({
  isOpen,
  onOpenChange,
  selectedLesson: selectedLessonProp,
  modalLevel,
  setModalLevel,
  language,
  lessonLevels,
  lessonStars,
  resetLessonLevel,
}: AlphabetLessonModalProps) {
  const [selectedLesson, setSelectedLesson] = useState(selectedLessonProp);
  const getExpectedXp = useProgressStore(state => state.getExpectedXp);

  useEffect(() => {
    if (selectedLessonProp) {
      setSelectedLesson(selectedLessonProp);
    }
  }, [selectedLessonProp]);

  if (!selectedLesson) return null;

  const isMastery = false; // Alphabet doesn't use mastery in the same way right now
  const isReviewOrMastery = false;

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

  const isReviewOrBilan = selectedLesson.lesson.isReview || selectedLesson.lesson.title?.toLowerCase().includes('bilan');
  const { xp: expectedXp, isFirstTime, maxXp } = getExpectedXp(
    `alphabet_${selectedLesson.lesson.id}`,
    modalLevel,
    !!isReviewOrBilan
  );

  return (
    <SharedLessonModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      language={language}
      isReviewOrMastery={isReviewOrMastery}
      isMastery={isMastery}
      modalLevel={modalLevel}
      lessonId={selectedLesson.lesson.id}
      footer={
        <div className="flex items-center gap-2 w-full mt-1 relative">
          <Link
            href={`/alphabet/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`}
            className={buttonVariants({ 
              variant: 'gamified', 
              size: 'lg', 
              className: `w-full rounded-xl ${selectedLesson.unitColor} ${selectedLesson.unitColor.replace('bg-', 'border-').replace(/500$/, '600').replace(/400$/, '500')}` 
            })}
          >
            {getTranslation('auto.start_lesson', language)}
          </Link>
        </div>
      }
    >
      <div className="px-7 pt-2 flex flex-col">
        <h3 className="text-2xl font-extrabold text-slate-800 mb-2 mt-4 text-center">
          {getTranslation(selectedLesson.lesson.type === 'consonant' ? 'auto.consonants' : 'auto.vowels', language)} {selectedLesson.lesson.id.split('-').pop()}
        </h3>
        <p className="text-sm font-medium text-slate-500 text-center mb-6">
          {getTranslation('lesson.level', language)} {modalLevel + 1}
        </p>

        <div className="flex flex-col items-center mb-8 border-b border-slate-100 pb-8 w-full">
          <LessonDetailsStats 
            stepsCount={stepsCount}
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
