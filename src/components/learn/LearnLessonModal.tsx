import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { BookOpen, Star, Lock, Crown, Clock, Pencil, RotateCcw, PieChart, Circle } from 'lucide-react';
import Link from 'next/link';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { playThaiTTS } from "@/lib/tts";
import IconImage from '../ui/IconImage';
import { useProgressStore } from "@/lib/store";
import { getLevelSplit, getEstimatedStepsCount } from "@/lib/levelSplits";
import { LessonPathMap } from './LessonPathMap';
import { buttonVariants } from '../ui/Button';
import SharedLessonModal from '../ui/SharedLessonModal';
import { LessonPartsSelector } from './LessonPartsSelector';
import { LessonDetailsStats } from '../path-ui/LessonDetailsStats';
import stepsMetadata from "@/data/steps_metadata.json";

interface LearnLessonModalProps {
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
}

export default function LearnLessonModal({
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
  getExpectedXp
}: LearnLessonModalProps) {
  const [selectedLesson, setSelectedLesson] = useState(selectedLessonProp);
  const [playFullLevel, setPlayFullLevel] = useState(false);
  const [manualPartIndex, setManualPartIndex] = useState<number | null>(null);
  const lessonPartsCompleted = useProgressStore(state => state.lessonPartsCompleted);
  
  useEffect(() => {
    if (selectedLessonProp) {
      setSelectedLesson(selectedLessonProp);
    }
  }, [selectedLessonProp]);

  useEffect(() => {
    setPlayFullLevel(false);
    setManualPartIndex(null);
  }, [modalLevel]);

  if (!selectedLesson) return null;

  const currentProgress = lessonLevels[selectedLesson.lesson.id] || 0;

  const totalParts = getLevelSplit(modalLevel, selectedLesson.lesson);
  const partsKey = `${selectedLesson.lesson.id}_level-${modalLevel}`;
  const completedParts = lessonPartsCompleted[partsKey] || [];
  const isLevelFullyCompleted = currentProgress > modalLevel || completedParts.length >= totalParts;
  const showSlices = totalParts > 1 && isLevelFullyCompleted && !playFullLevel;
  
  const isPlayingPart = totalParts > 1 && !playFullLevel;
  const nextUncompletedPart = completedParts.length < totalParts ? completedParts.length : 0;
  const selectedPartIndex = playFullLevel ? -1 : (manualPartIndex !== null ? manualPartIndex : nextUncompletedPart);

  const exactStepsCount = (stepsMetadata as any)['learn']?.[selectedLesson.lesson.id]?.[modalLevel]?.[playFullLevel ? 'full' : `part_${Math.max(0, selectedPartIndex)}`] || 0;

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
  } else if (modalLevel === 10) {
    estimatedMins = 20;
  } else {
    if (modalLevel === 9) estimatedMins = Math.max(30, estimatedMins);
    else estimatedMins = Math.max(1, estimatedMins);
  }

  const isReviewOrBilan = selectedLesson.lesson.isReview || selectedLesson.lesson.title?.toLowerCase().includes('bilan');
  const { xp: expectedXp, maxXp, isFirstTime } = getExpectedXp(
    selectedLesson.lesson.id, 
    modalLevel, 
    !!isReviewOrBilan,
    isPlayingPart,
    !isPlayingPart && (modalLevel === 7 || modalLevel === 8),
    selectedPartIndex >= 0 ? selectedPartIndex : 0
  );

  // Mastery Logic
  const isUnlockedMastery = currentProgress >= 10;
  const isSelectedMastery = modalLevel === 10;
  const starsArrayMastery = lessonStars[selectedLesson.lesson.id] || Array(11).fill(0);
  const earnedStarsMastery = starsArrayMastery[10] || 0;
  const isCompletedMastery = isUnlockedMastery && earnedStarsMastery > 0;

  return (
    <SharedLessonModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      language={language}
      isReviewOrMastery={selectedLesson.lesson.isReview || modalLevel === 10}
      isMastery={modalLevel === 10}
      modalLevel={modalLevel}
      lessonId={selectedLesson.lesson.id}
      reviewStats={reviewStats}
      footer={
        <>
          {selectedLesson.isCompleted && (
            <div className="flex gap-3">
              <Link
                href={`/writing?lessonId=${selectedLesson.lesson.id}`}
                className={buttonVariants({ variant: 'flat', size: 'lg', className: "w-full rounded-xl" })}
              >
                <Pencil size={16} className="mr-2" />
                {getTranslation('auto.writing', language)}
              </Link>
            </div>
          )}
          <div className="flex items-center gap-2 w-full mt-1 relative">
            <Link
              href={(totalParts > 1 && !playFullLevel)
                ? `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}&part=${selectedPartIndex}&totalParts=${totalParts}` 
                : `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`}
              className={buttonVariants({ 
                variant: 'gamified', 
                size: 'lg', 
                className: `w-full rounded-xl ${selectedLesson.unitColor} ${selectedLesson.unitColor.replace('bg-', 'border-').replace(/500$/, '600').replace(/400$/, '500')}` 
              })}
            >
              {getTranslation('auto.start_lesson', language)}
            </Link>
          </div>
        </>
      }
    >
      <div className="px-7 pt-2 flex flex-col">
        <div className="flex flex-col items-center mb-8 border-b border-slate-100 pb-8 w-full">
                <LessonPartsSelector
                  totalParts={totalParts}
                  completedParts={completedParts}
                  selectedPartIndex={selectedPartIndex}
                  playFullLevel={playFullLevel}
                  setPlayFullLevel={setPlayFullLevel}
                  setManualPartIndex={setManualPartIndex}
                  selectedLesson={selectedLesson}
                  isLevelFullyCompleted={isLevelFullyCompleted}
                />

                <LessonDetailsStats 
                  stepsCount={exactStepsCount}
                  expectedXp={expectedXp}
                  maxXp={maxXp}
                  isFirstTime={isFirstTime}
                  estimatedMins={playFullLevel ? estimatedMins : Math.ceil(estimatedMins/totalParts)}
                  title={playFullLevel ? "NIVEAU ENTIER" : totalParts > 1 ? `PARTIE ${selectedPartIndex + 1}` : "DÉTAILS"}
                />
        </div>
      </div>
    </SharedLessonModal>
  );
}
