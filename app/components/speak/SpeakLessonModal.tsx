import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { BookOpen, Star, Lock, Crown, Clock, Pencil, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { getTranslation, getLocalizedField } from '../../hooks/useTranslation';
import { playThaiTTS } from '../../lib/tts';
import IconImage from '../../components/IconImage';
import { LessonPathMap } from '../../components/LessonPathMap';

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
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm xl:hidden" />
        <Drawer.Content className="xl:hidden bg-white flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[100] max-h-[95vh] outline-none">
          <Drawer.Title className="sr-only">Course Details</Drawer.Title>
          <Drawer.Description className="sr-only">Choose a level or start practice</Drawer.Description>
          <div className="w-full flex justify-center py-3 shrink-0 bg-transparent z-10 absolute top-0 left-0 right-0">
            <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
          </div>
          
          <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar pt-6">
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

              {(selectedLesson.lesson.isReview || modalLevel === 10) && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[12px] font-black uppercase text-slate-500 tracking-wider">
                      {modalLevel === 10
                        ? (getTranslation('auto.stats_mastery', language))
                        : (`${getTranslation('auto.stats', language) || 'Stats'} (${getTranslation('auto.lvl', language)} ${modalLevel + 1}) :`)
                      }
                    </h4>
                  </div>

                  <div className="flex flex-col gap-3">
                    {(() => {
                      const stats = reviewStats?.[selectedLesson.lesson.id]?.[modalLevel];
                      if (stats?.bestTime !== undefined && stats.bestTime !== null) {
                        const m = Math.floor(stats.bestTime / 60);
                        const s = stats.bestTime % 60;
                        return (
                          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                              <Clock size={20} className="stroke-[2.5]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-emerald-800 font-bold text-[15px]">
                                {getTranslation('auto.best_time', language)}
                              </span>
                              <span className="text-emerald-600 font-medium text-sm">
                                {m}min {s}s
                              </span>
                            </div>
                          </div>
                        );
                      } else if (stats?.maxPercentage !== undefined && stats.maxPercentage !== null) {
                        return (
                          <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-200 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-rose-800 font-bold text-[15px]">
                                {getTranslation('auto.best_survival', language)}
                              </span>
                              <span className="text-rose-600 font-medium text-sm">
                                {stats.maxPercentage}%
                              </span>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-sm font-medium">
                            {getTranslation('auto.not_completed_yet', language)}
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 p-6 pt-4 bg-white/95 backdrop-blur z-10 flex flex-col gap-3 pb-6 border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
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
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
