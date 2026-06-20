'use client';

import { getTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from "@/lib/store";
import type { ReviewOptions } from "@/lib/generators";
import { Exercise, CourseData, Word } from "@/types";
import { X, Check, Settings, Play } from 'lucide-react';
import { playThaiTTS, preloadThaiVoices } from "@/lib/tts";
import { m as motion, AnimatePresence } from "motion/react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

// Exercise Components
import WordMatch from '../lesson/[id]/components/WordMatch';
import SentenceBuilder from '../lesson/[id]/components/SentenceBuilder';
import FreeTypingInput from '../lesson/[id]/components/FreeTypingInput';
import VirtualKeyboard from '../writing/components/VirtualKeyboard';
import QuestionArea from '@/components/lesson/QuestionArea';
import Footer from '@/components/lesson/Footer';
import { SentenceWithHints } from "@/components/learn/Hints";
import { getEndlessReviewServer, getDictionaryForExerciseServer, getPhrasesForExerciseServer } from "@/actions/course";

export default function ReviewPage() {
  const router = useRouter();
  const { completedLessons, xp, addXp, language, setExerciseRunning, reviewConfig } = useProgressStore();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Interaction State
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExerciseUI, setShowExerciseUI] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [allPhrases, setAllPhrases] = useState<any[]>([]);

  useEffect(() => {
    let initialized = false;
    const timer = setTimeout(() => {
      setMounted(true);
      // We don't generate exercises right away anymore, we wait for user to click Start
    }, 0);

    getDictionaryForExerciseServer().then(words => {
      setAllWords(words as Word[]);
    });
    getPhrasesForExerciseServer().then(phrases => {
      setAllPhrases(phrases);
    });

    preloadThaiVoices();
    return () => clearTimeout(timer);
  }, [completedLessons, language]);

  useEffect(() => {
    if (!mounted || completedLessons.length === 0) return;
    // Launch review immediately instead of waiting for start button
    getEndlessReviewServer(completedLessons, language, reviewConfig).then(generated => {
      setExercises(generated);
      setExerciseRunning(true);
    });
  }, [mounted, completedLessons, language, reviewConfig, setExerciseRunning]);

  const fetchMore = () => {
    getEndlessReviewServer(completedLessons, language, reviewConfig).then(generated => {
      setExercises(prev => [...prev, ...generated]);
    });
  };

  if (!mounted) return null;

  if (completedLessons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAFA] font-sans">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4 text-center">
          {getTranslation('auto.no_completed_lessons', language)}
        </h1>
        <p className="text-slate-500 mb-8 text-center text-lg font-medium">
          {getTranslation('auto.you_must_complete_at_least_one', language)}
        </p>
        <button
          onClick={() => router.push('/practice')}
          className="px-12 py-3 rounded-xl bg-indigo-500 border-b-4 border-indigo-700 text-white font-bold text-lg shadow-lg hover:bg-indigo-400 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest w-full max-w-sm"
        >
          {getTranslation('auto.back', language)}
        </button>
      </div>
    );
  }

  const isDataLoaded = exercises.length > 0;

  if (!isDataLoaded && !showExerciseUI) {
    // Early return prevention
  }

  const currentExercise = exercises[currentIndex] || null;
  // Since it's endless, the progress is just cosmetic, let's keep it fixed or bouncing
  const progress = ((currentIndex % 10) / 10) * 100;

  const handleCheck = (overrideAnswer?: string | string[]) => {
    if (!currentExercise) return;
    if (isChecking) {
      // Move to next exercise
      if (isCorrect) {
        // Give 1 XP per correct answer
        addXp(3);

        if (currentIndex >= exercises.length - 3) {
          // Refill exercises when running low
          fetchMore();
        }

        setCurrentIndex(currentIndex + 1);
        setIsChecking(false);
        setIsCorrect(null);
        setSelectedAnswer(null);
      } else {
        // If wrong, we re-add the exercise to the end of the current batch
        setExercises([...exercises, currentExercise]);
        setCurrentIndex(currentIndex + 1);
        setIsChecking(false);
        setIsCorrect(null);
        setSelectedAnswer(null);
      }
      return;
    }

    // Validate
    const answerToCheck = overrideAnswer !== undefined && overrideAnswer !== null && (typeof overrideAnswer === 'string' || Array.isArray(overrideAnswer)) ? overrideAnswer : selectedAnswer;
    if (!answerToCheck) return;

    let correct = false;
    if (currentExercise.type === 'word-match' || currentExercise.type === 'intro') {
      correct = answerToCheck === currentExercise.answer;
    } else if (currentExercise.type === 'sentence-builder') {
      const builtSentence = (answerToCheck as string[]).join('').replace(/\s+/g, '');
      const expectedSentence = currentExercise.answer.replace(/\s+/g, '').replace(/\.\.\./g, '');
      correct = builtSentence === expectedSentence;
    } else if (currentExercise.type === "free-typing") {
      const a = (answerToCheck as string).replace(/\s+/g, "");
      const b = currentExercise.answer.replace(/\s+/g, "");
      if (a === b) {
        correct = true;
      } else {
        try {
          const matrix = Array.from({ length: a.length + 1 }, () =>
            new Array(b.length + 1).fill(0)
          );
          for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
          for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
          for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
              const cost = a[i - 1] === b[j - 1] ? 0 : 1;
              matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
              );
            }
          }
          const similarity =
            1 - matrix[a.length][b.length] / Math.max(a.length, b.length);
          correct = similarity >= 0.8;
        } catch (e) {
          correct = false;
        }
      }
    } else if (currentExercise.type === "writing") {
      if (currentExercise.blindMode && currentExercise.correctComponents) {
        correct =
          (answerToCheck as string[]).join("") ===
          currentExercise.correctComponents.join("");
      } else {
        correct =
          (answerToCheck as string[]).join("").replace(/\s+/g, "") ===
          currentExercise.answer.replace(/\s+/g, "").replace(/\.\.\./g, "");
      }
    }

    setIsCorrect(correct);
    setIsChecking(true);
    playThaiTTS(currentExercise.answer);
  };

  const showFooter = (() => {
    if (!currentExercise) return false;
    if (
      !isChecking &&
      (currentExercise.type === "word-match" ||
        currentExercise.type === "sentence-builder" ||
        currentExercise.type === "writing" ||
        currentExercise.type === "free-typing")
    ) {
      return false;
    }
    return true;
  })();

  return (
    <div className="h-[100dvh] flex flex-col bg-[#FAFAFA] font-sans text-slate-800 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!showExerciseUI ? (
          <LoadingScreen
            key="loading-screen"
            isLoadingData={!isDataLoaded}
            onReady={() => setShowExerciseUI(true)}
          />
        ) : (
          <motion.div
            key="exercise-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 flex flex-col h-full w-full absolute inset-0"
          >
            {/* Header / Progress bar */}
            <header className="h-16 flex items-center shrink-0 justify-between border-b border-slate-200 bg-white">
              <div className="flex items-center gap-6 w-full max-w-2xl mx-auto h-full px-4 flex-1">
                <button onClick={() => router.push('/practice')} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} strokeWidth={2.5} />
                </button>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="font-bold text-slate-400">{getTranslation('auto.review_9', language)}</div>
              </div>
            </header>

            {/* Main Exercise Area */}
            <main className="flex-1 flex flex-col w-full relative">
              <AnimatePresence mode="wait">
                {currentExercise && (
                  <motion.div
                    key={currentExercise.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col items-center md:justify-center md:overflow-y-auto hide-scrollbar"
                  >
                    {/* Scrollable Upper Area */}
                    <motion.div
                      className={`flex flex-1 md:flex-none w-full max-w-3xl overflow-y-auto md:overflow-y-visible px-4 py-4 md:py-4 flex-col justify-center hide-scrollbar`}
                    >
                      <QuestionArea
                        currentExercise={{
                          ...currentExercise,
                          hideHints: !reviewConfig.showWordHints,
                          disableTooltips: !reviewConfig.showWordHints,
                        }}
                        lesson={{ words: allWords, phrases: allPhrases } as any}
                        language={language}
                        showRomanization={true}
                        isChecking={isChecking}
                        selectedAnswer={selectedAnswer}
                      />
                    </motion.div>

                    {/* Exercise Options (Fixed at bottom on Mobile) */}
                    <motion.div
                      className={`flex shrink-0 md:shrink-0 bg-transparent px-4 pb-4 pt-2 md:pt-4 md:pb-8 justify-center z-10 w-full max-w-3xl`}
                    >
                      <div className="w-full relative">
                        {currentExercise.type === 'word-match' ? (
                          <WordMatch
                            exercise={currentExercise}
                            selected={selectedAnswer as string}
                            onChange={setSelectedAnswer}
                            disabled={isChecking}
                            onAutoCheck={(val) => handleCheck(val)}
                          />
                        ) : currentExercise.type === 'sentence-builder' ? (
                          <SentenceBuilder
                            exercise={currentExercise}
                            selected={selectedAnswer as string[] || []}
                            onChange={setSelectedAnswer}
                            disabled={isChecking}
                            onAutoCheck={(val) => handleCheck(val)}
                          />
                        ) : currentExercise.type === "free-typing" ? (
                          <FreeTypingInput
                            exercise={currentExercise}
                            selected={selectedAnswer as string}
                            onChange={setSelectedAnswer}
                            disabled={isChecking}
                          />
                        ) : currentExercise.type === "writing" ? (
                          <VirtualKeyboard
                            exercise={currentExercise}
                            selected={selectedAnswer as string[] || []}
                            onChange={setSelectedAnswer}
                            disabled={isChecking}
                            onAutoCheck={(val) => handleCheck(val)}
                          />
                        ) : null}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <Footer
              currentExercise={currentExercise!}
              isChecking={isChecking}
              isCorrect={isCorrect}
              language={language}
              selectedAnswer={selectedAnswer}
              showFooter={showFooter}
              handleCheck={handleCheck}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
