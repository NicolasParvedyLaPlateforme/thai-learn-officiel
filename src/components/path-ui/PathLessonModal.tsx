import { useState, useEffect } from 'react';
import { BookOpen, Clock, Pencil } from 'lucide-react';
import Link from 'next/link';
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import IconImage from '../ui/IconImage';
import { useProgressStore } from "@/lib/store";
import { Button, buttonVariants, getGamifiedVariant } from '../ui/Button';
import { Typography } from '../ui/Typography';
import SharedLessonModal from '../ui/SharedLessonModal';
import { LessonDetailsStats } from '../path-ui/LessonDetailsStats';
import stepsLearn from "@/data/steps_metadata_learn.json";
import stepsSpeak from "@/data/steps_metadata_speak.json";
import stepsAlphabet from "@/data/steps_metadata_alphabet.json";
import { getLevelSplit } from "@/lib/levelSplits";
import { LessonPartsSelector } from '../learn/LessonPartsSelector';

interface PathLessonModalProps {
  pathType: 'learn' | 'speak' | 'alphabet';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLesson: { lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string } | null;
  modalLevel: number;
  setModalLevel: (level: number) => void;
  language: string;
  lessonLevels: Record<string, number>;
  lessonStars: Record<string, number[]>;
  resetLessonLevel: (lessonId: string) => void;
  reviewStats?: Record<string, Record<number, any>>;
  getExpectedXp: any;
  maxLevelPerLesson?: number;
}

export default function PathLessonModal({
  pathType,
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
}: PathLessonModalProps) {
  const [selectedLesson, setSelectedLesson] = useState(selectedLessonProp);
  const [isBrave, setIsBrave] = useState(false);
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

  useEffect(() => {
    if (pathType === 'speak') {
      const checkBrave = async () => {
        if ((navigator as any).brave && await (navigator as any).brave.isBrave()) {
          setIsBrave(true);
        }
      };
      checkBrave();
    }
  }, [pathType]);

  if (!selectedLesson) return null;

  const currentProgress = lessonLevels[selectedLesson.lesson.id] || 0;
  const isBilanLesson = selectedLesson.lesson.isReview || selectedLesson.lesson.id?.startsWith('bilan-') || selectedLesson.lesson.id?.includes('-bilan') || selectedLesson.lesson.title?.toLowerCase().includes('bilan');
  const isReviewOrMastery = isBilanLesson || modalLevel === maxLevelPerLesson;
  const isSelectedMastery = modalLevel === maxLevelPerLesson;

  let totalParts = 1;
  let completedParts: number[] = [];
  let isLevelFullyCompleted = currentProgress > modalLevel;
  
  if (pathType === 'learn') {
    totalParts = getLevelSplit(modalLevel, selectedLesson.lesson);
    const partsKey = `${selectedLesson.lesson.id}_level-${modalLevel}`;
    completedParts = lessonPartsCompleted[partsKey] || [];
    isLevelFullyCompleted = currentProgress > modalLevel || completedParts.length >= totalParts;
  }

  const isPlayingPart = totalParts > 1 && !playFullLevel;
  const nextUncompletedPart = completedParts.length < totalParts ? completedParts.length : 0;
  const selectedPartIndex = playFullLevel ? -1 : (manualPartIndex !== null ? manualPartIndex : nextUncompletedPart);

  let stepsData: any = stepsLearn;
  if (pathType === 'speak') stepsData = stepsSpeak;
  else if (pathType === 'alphabet') stepsData = stepsAlphabet;

  let exactStepsCount = 0;
  if (pathType === 'learn') {
     exactStepsCount = stepsData?.[selectedLesson.lesson.id]?.[modalLevel]?.[(playFullLevel || totalParts === 1) ? 'full' : `part_${Math.max(0, selectedPartIndex)}`] || 0;
  } else {
     exactStepsCount = stepsData?.[selectedLesson.lesson.id]?.[modalLevel]?.['full'] || 0;
  }

  let secsPerStep = 5;
  if (modalLevel <= 1) secsPerStep = 5;
  else if (modalLevel <= 3) secsPerStep = 7;
  else if (modalLevel <= 6) secsPerStep = 10;
  else if (modalLevel === 7) secsPerStep = 20;
  else secsPerStep = 40;

  let estimatedSecs = exactStepsCount * secsPerStep;
  let estimatedMins = Math.ceil(estimatedSecs / 60);
  
  if (isBilanLesson) {
    estimatedMins = (modalLevel + 1) * 2;
  } else if (modalLevel === maxLevelPerLesson) {
    estimatedMins = 20;
  } else {
    if (modalLevel === 9) estimatedMins = Math.max(30, estimatedMins);
    else estimatedMins = Math.max(1, estimatedMins);
  }

  let xpData;
  if (pathType === 'learn') {
    xpData = getExpectedXp(selectedLesson.lesson.id, modalLevel, !!isBilanLesson, isPlayingPart, !isPlayingPart && (modalLevel === 7 || modalLevel === 8), selectedPartIndex >= 0 ? selectedPartIndex : 0);
  } else if (pathType === 'speak') {
    xpData = getExpectedXp(`speak_${selectedLesson.lesson.id}`, modalLevel, !!isBilanLesson);
  } else {
    xpData = getExpectedXp(`alphabet_${selectedLesson.lesson.id}`, modalLevel, !!isBilanLesson);
  }

  const { xp: expectedXp, maxXp, isFirstTime } = xpData || { xp: 0, maxXp: 0, isFirstTime: true };

  const getStartLink = () => {
    if (pathType === 'alphabet') return `/alphabet/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`;
    if (pathType === 'speak') return `/speak/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`;
    
    // learn
    if (totalParts > 1 && !playFullLevel) {
      return `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}&part=${selectedPartIndex}&totalParts=${totalParts}`;
    }
    return `/lesson/${selectedLesson.lesson.id}?level=${modalLevel + 1}`;
  };

  return (
    <SharedLessonModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      language={language}
      isReviewOrMastery={isReviewOrMastery}
      isMastery={isSelectedMastery}
      modalLevel={modalLevel}
      lessonId={selectedLesson.lesson.id}
      reviewStats={reviewStats}
      footer={
        <>
          {pathType === 'learn' && selectedLesson.isCompleted && !isBilanLesson && (
            <div className="flex gap-3 mb-3 w-full">
              <Link 
                href={`/writing?lessonId=${selectedLesson.lesson.id}`}
                className={buttonVariants({ variant: "flat", size: "lg", className: "w-full" })}
              >
                <Pencil size={16} className="mr-2" />
                {getTranslation('auto.writing', language)}
              </Link>
            </div>
          )}
          <div className="flex items-center gap-2 w-full relative">
            {pathType === 'speak' && isBrave ? (
              <Button disabled variant="gamified" size="lg" className="w-full">
                {getTranslation('auto.unavailable_on_brave', language)}
              </Button>
            ) : (
              <Link 
                href={getStartLink()}
                className={buttonVariants({ variant: getGamifiedVariant(selectedLesson.unitColor), size: "lg", className: "w-full" })}
              >
                {isBilanLesson ? (language === 'en' ? 'Start Assessment' : 'Commencer le bilan') : getTranslation('auto.start_lesson', language)}
              </Link>
            )}
          </div>
        </>
      }
    >
      {pathType === 'speak' && (
        <div className="w-full shrink-0 z-0">
          <div className={`w-full h-[120px] bg-amber-50 flex items-center justify-center relative overflow-hidden`}>
            {selectedLesson.lesson.imageUrl ? (
              <IconImage src={selectedLesson.lesson.imageUrl} alt="" fill className="object-cover" />
            ) : (
              <BookOpen size={48} className="text-slate-200" />
            )}
          </div>
        </div>
      )}

      {pathType === 'speak' && (
        <div className="p-6 pt-5 pb-2 text-center flex flex-col items-center">
          <Typography variant="h3-modal">
            {getLocalizedField(selectedLesson.lesson, 'title', language)}
          </Typography>
          <Typography variant="p-modal">
            {getLocalizedField(selectedLesson.lesson, 'description', language)}
          </Typography>
        </div>
      )}

      {pathType === 'alphabet' && (
        <div className="px-7 pt-2 flex flex-col">
          <Typography variant="h3-modal-center">
            {getTranslation(selectedLesson.lesson.type === 'consonant' ? 'auto.consonants' : 'auto.vowels', language)} {selectedLesson.lesson.id.split('-').pop()}
          </Typography>
          <Typography variant="p-modal-center">
            {getTranslation('auto.level', language)} {modalLevel + 1}
          </Typography>
        </div>
      )}

      <div className="px-7 pt-2 flex flex-col">
        {pathType === 'learn' && isBilanLesson && (
          <div className="flex items-start gap-3 mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Clock size={16} className="text-amber-600 stroke-[2.5]" />
            </div>
            <div className="flex flex-col gap-1">
              <Typography variant="alert-title">
                {language === 'en' ? 'Timed Assessment' : 'Évaluation chronométrée'}
              </Typography>
              <Typography variant="alert-desc">
                {language === 'en'
                  ? `You have ${estimatedMins} minute${estimatedMins > 1 ? 's' : ''} to answer as many questions as possible. The further you get, the better your score!`
                  : `Vous avez ${estimatedMins} minute${estimatedMins > 1 ? 's' : ''} pour répondre à un maximum de questions. Plus vous allez loin, meilleur est votre score !`}
              </Typography>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center mb-8 border-b border-slate-100 pb-8 w-full">
          {pathType === 'learn' && (
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
          )}

          <LessonDetailsStats 
            stepsCount={exactStepsCount}
            expectedXp={expectedXp}
            maxXp={maxXp}
            isFirstTime={isFirstTime}
            estimatedMins={isBilanLesson ? estimatedMins : (playFullLevel ? estimatedMins : Math.ceil(estimatedMins/totalParts))}
            title={pathType === 'learn' ? (isBilanLesson ? 'BILAN' : (playFullLevel ? "NIVEAU ENTIER" : totalParts > 1 ? `PARTIE ${selectedPartIndex + 1}` : "DÉTAILS")) : undefined}
          />
        </div>
      </div>
    </SharedLessonModal>
  );
}
