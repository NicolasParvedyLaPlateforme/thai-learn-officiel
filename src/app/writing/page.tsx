'use client';

import { getLocalizedField, getTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from "@/lib/store";
import { Exercise, CourseData, Word } from "@/types";
import { X, Check, Volume2, LogOut } from 'lucide-react';
import { playThaiTTS } from "@/lib/tts";

import { getCharacterHint } from "@/data/phonetic-mapper";
import VirtualKeyboard from "@/components/writing/VirtualKeyboard";
import { SentenceWithHints } from "@/components/learn/Hints";
import { formatCombiningChar } from "@/lib/alphabet-utils";
import { getWritingExercisesServer, getDictionaryForExerciseServer, getPhrasesForExerciseServer } from "@/actions/course";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { m as motion, AnimatePresence } from "motion/react";
import Footer from "@/components/lesson/Footer";
import { useLessonEngine } from "@/hooks/useLessonEngine";
import { Button } from "@/components/ui/Button";
import { PlayAudioButton } from "@/components/ui/PlayAudioButton";
import ExerciseHeader from "@/components/lesson/ExerciseHeader";
import EmptyLessonState from "@/components/lesson/EmptyLessonState";
import ExerciseLayout from "@/components/lesson/ExerciseLayout";

export default function WritingPage() {
  const router = useRouter();
  const { completedLessons, unlockedLessons, addXp, language, _hasHydrated, writingConfig, showRomanization, setShowRomanization, setExerciseRunning } = useProgressStore();

  const [initialExercises, setInitialExercises] = useState<Exercise[]>([]);
  const [showExerciseUI, setShowExerciseUI] = useState(false);

  const [mounted, setMounted] = useState(false);

  const [allWords, setAllWords] = useState<Word[]>([]);
  const [allPhrases, setAllPhrases] = useState<any[]>([]);

  useEffect(() => {
    setExerciseRunning(true);
    return () => setExerciseRunning(false);
  }, [setExerciseRunning]);

  useEffect(() => {
    if (!_hasHydrated) return;
    let initialized = false;
    const timer = setTimeout(() => {
      setMounted(true);
      if (!initialized) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLessonId = urlParams.get('lessonId');

        let targetLessons = completedLessons;

        if (urlLessonId) {
          targetLessons = [urlLessonId];
        } else if (writingConfig.lessonId !== 'all') {
          targetLessons = [writingConfig.lessonId];
        }

        if (targetLessons.length > 0) {
          getWritingExercisesServer(targetLessons, language, urlLessonId ? null : writingConfig.selectedWordIds).then(generated => {
            setInitialExercises(generated);
          });
        }
        initialized = true;
      }
    }, 0);
    getDictionaryForExerciseServer().then(words => {
      setAllWords(words as Word[]);
    });
    getPhrasesForExerciseServer().then(phrases => {
      setAllPhrases(phrases);
    });
    return () => clearTimeout(timer);
  }, [completedLessons, language, _hasHydrated, unlockedLessons, writingConfig]);

  const {
    exercises,
    currentExercise,
    progress,
    isChecking,
    isCorrect,
    selectedAnswer: engineSelectedAnswer,
    setSelectedAnswer,
    handleCheck,
  } = useLessonEngine<Exercise, string[]>({
    initialExercises,
    isExerciseIntroOrReview: () => false,
    evaluateAnswer: (ex, answerToCheck) => {
      const builtValue = answerToCheck.join('').replace(/\s+/g, '');
      const targetValue = ex.answer?.replace(/\s+/g, '') || '';
      return builtValue === targetValue;
    },
    onComplete: () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLessonId = urlParams.get('lessonId');

      let targetLessons = completedLessons;
      if (urlLessonId) {
        targetLessons = [urlLessonId];
      } else if (writingConfig.lessonId !== 'all') {
        targetLessons = [writingConfig.lessonId];
      }
      getWritingExercisesServer(targetLessons, language, urlLessonId ? null : writingConfig.selectedWordIds).then(generated => {
        setInitialExercises(generated);
      });
    },
    onCorrect: (ex) => {
      addXp(3);
      if (ex.answer) playThaiTTS(ex.answer);
    },
    onIncorrect: (ex) => {
      if (ex.answer) playThaiTTS(ex.answer);
    },
    retryIncorrect: true,
  });

  if (!mounted) return null;

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const hasLessonId = !!params?.get('lessonId');

  if (completedLessons.length === 0 && !hasLessonId) {
    return (
      <EmptyLessonState
        language={language}
        messageKey="auto.you_must_complete_at_least_one_11"
        onBack={() => {
          if (hasLessonId) {
            router.push(`/learn#lesson-${params?.get('lessonId')}`);
          } else {
            router.push('/practice');
          }
        }}
      />
    );
  }

  const selectedAnswer = engineSelectedAnswer || [];

  const isDataLoaded = mounted && exercises.length > 0;

  if (!isDataLoaded && !showExerciseUI) {
    // prevent early render
  }

  const nextCharIdx = selectedAnswer.length;
  const charHint = currentExercise?.correctComponents && nextCharIdx < currentExercise.correctComponents.length
    ? getCharacterHint(currentExercise.correctComponents, nextCharIdx)
    : undefined;

  return (
    <ExerciseLayout
      isDataLoaded={isDataLoaded}
      showExerciseUI={showExerciseUI}
      onReady={() => setShowExerciseUI(true)}
    >
      {/* Header */}
      <ExerciseHeader
        progress={progress}
        onClose={() => {
          if (hasLessonId) {
            router.push(`/learn#lesson-${params?.get('lessonId')}`);
          } else {
            router.push('/practice');
          }
        }}
        showRomanization={showRomanization}
        onToggleRomanization={() => setShowRomanization(!showRomanization)}
        forceHideRomanization={currentExercise?.forceHideRomanization}
        title={getTranslation('auto.writing_12', language)}
        language={language}
      />

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto hide-scrollbar flex flex-col items-center py-2 sm:py-6 md:py-12 px-4 w-full">
        {currentExercise && (
          <div className="w-full max-w-3xl flex flex-col justify-center flex-1">

            <div className="flex items-start gap-4 md:gap-8 mb-4 md:mb-8">
              <div className="hidden md:flex w-32 h-32 bg-emerald-100 rounded-3xl items-center justify-center text-5xl shadow-sm border border-emerald-200 flex-shrink-0">
                <span>✍️</span>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4 md:mb-6 text-center md:text-left">
                  {language === 'en'
                    ? "Write this " + (currentExercise.id.includes('phrase') ? "sentence" : "word") + " in Thai"
                    : "Écrivez " + (currentExercise.id.includes('phrase') ? "cette phrase" : "ce mot") + " en thaï"}
                </h2>
                <div className="relative pb-1 w-full text-center md:text-left min-h-[40px]">
                  {!writingConfig.hideTranslation ? (
                    <SentenceWithHints
                      text={currentExercise.question}
                      dictionary={allWords}
                      phrases={allPhrases}
                      isSentence={false}
                      exerciseOptions={[]} // No vocab needed for hints here as it's writing
                      hideHints={false}
                      disableTooltips={writingConfig.disableDictionaryClick}
                      alwaysShowPhonetic={true}
                      charHintRegex={charHint?.highlightRegex}
                      isChecking={isChecking}
                      forceHideRomanization={currentExercise.forceHideRomanization}
                      rightElement={
                        !isChecking ? (
                          <PlayAudioButton text={currentExercise.answer} language={language} />
                        ) : undefined
                      }
                    />
                  ) : (
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <div className="relative inline-block group">
                        <div className={`text-xl md:text-2xl text-indigo-500 font-medium tracking-wider ${!writingConfig.disableDictionaryClick ? 'cursor-help border-b-2 border-dashed border-indigo-200 pb-1' : ''}`}>
                          {(() => {
                            const matchItem = [...allWords, ...allPhrases].find(item => item.th === currentExercise.answer);
                            return matchItem?.phonetic || currentExercise.question;
                          })()}
                        </div>
                        {!writingConfig.disableDictionaryClick && (
                          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-slate-800 text-white font-thai text-2xl rounded-xl shadow-xl whitespace-nowrap pointer-events-none z-10">
                            {currentExercise.answer}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
                          </div>
                        )}
                      </div>
                      {!isChecking && (
                        <PlayAudioButton text={currentExercise.answer} language={language} />
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-8 md:mt-10">
                  <div className="text-4xl md:text-5xl font-thai font-medium flex flex-wrap gap-x-1 gap-y-3 leading-normal">
                    {(() => {
                      if (!currentExercise.correctComponents) return <span>{currentExercise.answer}</span>;

                      const groupedComponents: { cluster: string; idx: number; groupIndex: number }[][] = [];
                      let currentGroup: { cluster: string; idx: number; groupIndex: number }[] = [];
                      let currentGroupIndex = currentExercise.componentGroups?.[0] ?? -1;

                      currentExercise.correctComponents.forEach((cluster, idx) => {
                        const groupIndex = currentExercise.componentGroups?.[idx] ?? idx;
                        if (groupIndex === currentGroupIndex) {
                          currentGroup.push({ cluster, idx, groupIndex });
                        } else {
                          if (currentGroup.length > 0) groupedComponents.push(currentGroup);
                          currentGroup = [{ cluster, idx, groupIndex }];
                          currentGroupIndex = groupIndex;
                        }
                      });
                      if (currentGroup.length > 0) groupedComponents.push(currentGroup);

                      return groupedComponents.map((group, gIdx) => {

                        // First determine the color and text for each item
                        const items = group.map(({ cluster, idx }) => {
                          let color = "text-slate-300"; // remaining
                          if (idx < selectedAnswer.length) {
                            if (selectedAnswer[idx] === cluster) {
                              color = "text-emerald-500";
                            } else {
                              color = "text-rose-500";
                            }
                          } else {
                            if (writingConfig.hideThai) {
                              color = "text-transparent";
                            } else if (idx === selectedAnswer.length) {
                              color = "text-orange-500";
                            }
                          }

                          // We handle combining marks using formatCombiningChar
                          let displayCluster = cluster;
                          if (idx >= selectedAnswer.length) {
                            displayCluster = formatCombiningChar(cluster);
                          }

                          return { text: displayCluster, color };
                        });

                        // Group contiguous items with the same color
                        const mergedItems: { text: string; color: string }[] = [];
                        for (const item of items) {
                          if (mergedItems.length > 0 && mergedItems[mergedItems.length - 1].color === item.color) {
                            // Merge text if they have the same color, this is crucial for mobile WebKit combining marks
                            mergedItems[mergedItems.length - 1].text += item.text;
                          } else {
                            mergedItems.push({ text: item.text, color: item.color });
                          }
                        }

                        return (
                          <span
                            key={gIdx}
                            className={`inline-block mx-[2px] px-[6px] py-[4px] rounded-xl transition-colors ${group.length > 1 ? (gIdx % 2 === 0 ? 'bg-slate-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200' : 'bg-slate-50 border border-slate-200/50') : 'bg-transparent'}`}
                          >
                            {mergedItems.map((mi, i) => (
                              <span key={i} className={`${mi.color}`}>
                                {mi.text}
                              </span>
                            ))}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>

                {!writingConfig.hideCharacterHints && charHint && !isChecking && (
                  <div className="mt-6 p-4 rounded-xl border border-orange-200 bg-orange-50 flex items-start gap-3">
                    <div className="text-xl">💡</div>
                    <div className="text-orange-800 text-sm font-medium leading-relaxed">
                      {getLocalizedField(charHint, 'note', language)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <VirtualKeyboard
                exercise={currentExercise}
                selected={selectedAnswer}
                onChange={setSelectedAnswer}
                disabled={isChecking}
                onAutoCheck={(val) => handleCheck(val)}
              />
            </div>
          </div>
        )}
      </main>

      <Footer
        currentExercise={currentExercise!}
        isChecking={isChecking}
        isCorrect={isCorrect}
        language={language}
        selectedAnswer={selectedAnswer}
        showFooter={isChecking}
        handleCheck={() => handleCheck(selectedAnswer)}
      />
    </ExerciseLayout>
  );
}
