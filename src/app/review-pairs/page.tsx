'use client';

import { getTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStore } from "@/lib/store";
import { Exercise, CourseData, Word } from "@/types";
import { X, Check, Play, LogOut } from 'lucide-react';
import { playThaiTTS, preloadThaiVoices } from "@/lib/tts";
import { m as motion, AnimatePresence } from "motion/react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

// Exercise Components
import PairMatch from "@/components/learn/PairMatch";
import { getEndlessPairMatchingServer } from "@/actions/course";

import Footer from '@/components/lesson/Footer';
import { Button } from "@/components/ui/Button";
import EmptyLessonState from "@/components/lesson/EmptyLessonState";
import PracticeHeader from "@/components/lesson/PracticeHeader";
import ExerciseLayout from "@/components/lesson/ExerciseLayout";

export default function ReviewPairsPage() {
  const router = useRouter();
  const { completedLessons, xp, addXp, language, setExerciseRunning } = useProgressStore();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Interaction State
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExerciseUI, setShowExerciseUI] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setExerciseRunning(true);
    return () => setExerciseRunning(false);
  }, [setExerciseRunning]);

  useEffect(() => {
    let initialized = false;
    const timer = setTimeout(() => {
      setMounted(true);
      if (!initialized && completedLessons.length > 0) {
        getEndlessPairMatchingServer(completedLessons, language).then(generated => {
          setExercises(generated);
        });
        initialized = true;
      }
    }, 0);

    preloadThaiVoices();
    return () => clearTimeout(timer);
  }, [completedLessons, language]);

  const fetchMore = () => {
    getEndlessPairMatchingServer(completedLessons, language).then(generated => {
      setExercises(prev => [...prev, ...generated]);
    });
  };

  if (!mounted) return null;

  if (completedLessons.length === 0) {
    return <EmptyLessonState language={language} />;
  }

  const isDataLoaded = exercises.length > 0;

  if (!isDataLoaded && !showExerciseUI) {
    // Early return prevention
  }

  const currentExercise = exercises[currentIndex] || null;
  const progress = ((currentIndex % 10) / 10) * 100;

  const handleCheck = () => {
    if (isChecking) {
      if (isCorrect) {
        setIsExiting(true);
        setTimeout(() => {
          setIsExiting(false);
          addXp(3);
          if (currentIndex >= exercises.length - 3) {
            fetchMore();
          }
          setCurrentIndex(prev => prev + 1);
          setIsChecking(false);
          setIsCorrect(null);
        }, 150);
      } else {
        // If wrong, wait for user to click Continue (which calls handleCheck)
        setIsExiting(true);
        setTimeout(() => {
          setIsExiting(false);
          // put exercise at the end? Or just proceed.
          setExercises([...exercises, currentExercise]);
          setCurrentIndex(currentIndex + 1);
          setIsChecking(false);
          setIsCorrect(null);
        }, 150);
      }
      return;
    }
  };

  return (
    <ExerciseLayout
      isDataLoaded={isDataLoaded}
      showExerciseUI={showExerciseUI}
      onReady={() => setShowExerciseUI(true)}
    >
      {/* Header / Progress bar */}
      <PracticeHeader
        progress={progress}
        title={getTranslation('auto.pairs_10', language)}
        onClose={() => router.push('/practice')}
        colorClass="bg-fuchsia-500"
        shadowClass="shadow-[0_0_8px_rgba(217,70,239,0.3)]"
      />

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
              {/* Scrollable / Main Area */}
              <motion.div
                animate={{ opacity: isExiting ? 0 : 1, y: 0, scale: 1 }}
                transition={{ duration: isExiting ? 0.15 : 0.3, delay: isExiting ? 0 : 0.1 }}
                className={`flex flex-1 md:flex-none w-full max-w-3xl overflow-y-auto md:overflow-y-visible px-4 py-4 md:py-4 flex-col justify-center hide-scrollbar`}
              >
                <div className="mt-2 text-center w-full max-w-3xl flex flex-col justify-center items-center flex-1">
                  <PairMatch
                    key={currentExercise.id}
                    pairs={currentExercise.pairs as Word[]}
                    mode={currentExercise.pairMatchMode}
                    disabled={isChecking}
                    onComplete={(failed?: boolean) => {
                      if (failed) {
                        setIsCorrect(false);
                        setIsChecking(true);
                      } else {
                        setIsExiting(true);
                        setTimeout(() => {
                          setIsExiting(false);
                          addXp(3);
                          if (currentIndex >= exercises.length - 3) {
                            fetchMore();
                          }
                          setCurrentIndex(prev => prev + 1);
                          setIsChecking(false);
                          setIsCorrect(null);
                        }, 150);
                      }
                    }}
                  />
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
        selectedAnswer={null}
        showFooter={isChecking && !isCorrect}
        handleCheck={handleCheck}
      />
    </ExerciseLayout>
  );
}
