"use client";

import { getTranslation } from '../../../hooks/useTranslation';
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useShallow } from 'zustand/react/shallow';
import { useProgressStore } from "../../../lib/store";
import { getExercisesServer, getLessonData } from "../../../actions/course";
import { Exercise, Lesson, Word } from "../../../types";
import { getLevelSplit } from "../../../lib/levelSplits";
import { X, Check, Star, Crown, Volume2, HelpCircle, RotateCcw } from "lucide-react";
import { playThaiTTS, preloadThaiVoices, preloadThaiAudio } from "../../../lib/tts";
import { m as motion, AnimatePresence } from "motion/react";
import Image from "next/image";

import { ErrorBoundary } from "../../../components/ErrorBoundary";

// Static imports for maximum offline resilience
import WordMatch from './WordMatch';
import SentenceBuilder from './SentenceBuilder';
import PairMatch from '../../../components/PairMatch';
import VirtualKeyboard from '../../../writing/components/VirtualKeyboard';
import FreeTypingInput from './FreeTypingInput';
import InstructionExample from './InstructionExample';
import GlossaryModal from './GlossaryModal';
import ResultScreen from './ResultScreen';

import { Suspense } from "react";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { TooltipHint, SentenceWithHints } from "../../../components/Hints";
import HeaderProgressBar from "./HeaderProgressBar";
import InstructionBlock from "./InstructionBlock";
import Footer from "./Footer";
import QuestionArea from "./QuestionArea";

const triggerConfetti = () => {
  import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  });
};

const getInstructionKey = (ex: Exercise | undefined) => {
  if (!ex) return null;
  if (ex.type === "intro") return null;
  if (ex.type === "word-match") return "word-match";
  if (ex.type === "pair-matching") return "pair-matching";
  if (ex.type === "sentence-builder") return "sentence-builder";
  if (ex.type === "writing")
    return ex.blindMode ? "writing-blind" : "writing";
  if (ex.type === "free-typing") return "free-typing";
  return null;
};

const getInstructionText = (key: string | null, lang: string) => {
  if (!key) return null;
  return getTranslation(`instruction.${key.replace("-", "_")}`, lang);
};

function LessonPageContent({ lesson }: { lesson: any }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    completeLesson,
    completeLessonPart,
    lessonPartsCompleted,
    lessonLevels,
    language,
    completedLessons,
    unlockedLessons,
    _hasHydrated,
    showRomanization,
    setShowRomanization,
    setLastActiveUnitIndex,
    setLastPlayedLesson,
    hiddenInstructions,
    hideInstruction,
    unhideInstruction,
    saveReviewStat,
  } = useProgressStore(
    useShallow((state) => ({
      completeLesson: state.completeLesson,
      completeLessonPart: state.completeLessonPart,
      lessonLevels: state.lessonLevels,
      language: state.language,
      completedLessons: state.completedLessons,
      unlockedLessons: state.unlockedLessons,
      _hasHydrated: state._hasHydrated,
      showRomanization: state.showRomanization,
      setShowRomanization: state.setShowRomanization,
      setLastActiveUnitIndex: state.setLastActiveUnitIndex,
      setLastPlayedLesson: state.setLastPlayedLesson,
      hiddenInstructions: state.hiddenInstructions,
      hideInstruction: state.hideInstruction,
      unhideInstruction: state.unhideInstruction,
      saveReviewStat: state.saveReviewStat,
      lessonPartsCompleted: state.lessonPartsCompleted,
    }))
  );

  const lessonId = params.id as string;
  const requestedLevelStr = searchParams.get("level");
  const isDev = searchParams.has("dev");

  // We got lesson from props!
  const savedLevel = lesson ? lessonLevels[lesson.id] || 0 : 0;

  // Use requested level if provided, otherwise the saved level
  const currentLevel = requestedLevelStr
    ? isDev
      ? Math.max(0, parseInt(requestedLevelStr, 10) - 1)
      : Math.min(savedLevel, Math.max(0, parseInt(requestedLevelStr, 10) - 1))
    : savedLevel;

  const partStr = searchParams.get("part");
  const totalPartsStr = searchParams.get("totalParts");
  const partIndex = partStr ? parseInt(partStr, 10) : null;
  const totalParts = totalPartsStr ? parseInt(totalPartsStr, 10) : null;
  const isPart = partIndex !== null && totalParts !== null && totalParts > 1;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Interaction State
  const [selectedAnswer, setSelectedAnswer] = useState<
    string | string[] | null
  >(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [initialTime, setInitialTime] = useState<number | null>(null);
  const [failedDueToTime, setFailedDueToTime] = useState(false);
  const [earnedXp, setEarnedXp] = useState<number>(0);

  const earnedStars = Math.max(0, 5 - mistakes);

  const [exercisesGeneratedFor, setExercisesGeneratedFor] = useState<{
    id: string;
    level: number;
    partIndex?: number | null;
  } | null>(null);

  const [isClient, setIsClient] = useState(false);
  const [showExerciseUI, setShowExerciseUI] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [acknowledgedInstructions, setAcknowledgedInstructions] = useState<
    Set<string>
  >(new Set());

  const currentExerciseTop = exercises[currentIndex];
  const instructionKeyTop = getInstructionKey(currentExerciseTop);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const { inProgressLessons, saveInProgressLesson } = useProgressStore(
    useShallow((state) => ({
      inProgressLessons: state.inProgressLessons,
      saveInProgressLesson: state.saveInProgressLesson
    }))
  );

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined' && window.visualViewport) {
      let maxVH = window.visualViewport.height;

      const handleResize = () => {
        const currentVH = window.visualViewport!.height;

        // Update maxVH if the screen grows (keyboard closed or orientation changed)
        if (currentVH > maxVH) {
          maxVH = currentVH;
        }

        // Keyboard is likely open if current height is at least 150px smaller than the max height
        if (currentVH < maxVH - 150) {
          setIsKeyboardOpen(true);
        } else {
          setIsKeyboardOpen(false);
        }
      };

      window.visualViewport.addEventListener('resize', handleResize);
      handleResize();
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (instructionKeyTop) {
      setDontShowAgain(hiddenInstructions.includes(instructionKeyTop));
    }
  }, [instructionKeyTop, hiddenInstructions, showHelpModal]);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!lesson) {
      router.push("/learn");
      return;
    }

    // Security check for parts
    const actualTotalParts = getLevelSplit(currentLevel, lesson);
    const partsKey = `${lesson.id}_level-${currentLevel}`;
    const completedParts = lessonPartsCompleted[partsKey] || [];
    
    if (!isDev && !lesson.isReview && actualTotalParts > 1) {
      const isLevelFullyCompleted = savedLevel > currentLevel || completedParts.length >= actualTotalParts;
      if (!isLevelFullyCompleted) {
        const expectedPart = completedParts.length;
        if (!isPart || partIndex > expectedPart || totalParts !== actualTotalParts) {
          router.replace(`/lesson/${lesson.id}?level=${currentLevel + 1}&part=${expectedPart}&totalParts=${actualTotalParts}`);
          return;
        }
      }
    }

    if (
      !exercisesGeneratedFor ||
      exercisesGeneratedFor.id !== lesson.id ||
      exercisesGeneratedFor.level !== currentLevel ||
      exercisesGeneratedFor.partIndex !== partIndex
    ) {
      setIsFinished(false);
      setExercises([]);
      setShowExerciseUI(false);

      const savedStateKey = `${lesson.id}_${currentLevel}${isPart ? `_part_${partIndex}` : ''}`;
      const savedState = inProgressLessons[savedStateKey];

      if (savedState && savedState.exercises && savedState.exercises.length > 0) {
        setShowResumePrompt(true);
        setExercisesGeneratedFor({ id: lesson.id, level: currentLevel, partIndex });
        return;
      }

      preloadThaiVoices();
      getExercisesServer(lesson.id, currentLevel, language, isPart ? partIndex : null, isPart ? totalParts : null).then(generated => {
        let finalExercises = generated;
        setExercises(finalExercises);
        setCurrentIndex(0);
        setIsFinished(false);
        setIsChecking(false);
        setIsCorrect(null);
        setSelectedAnswer(null);
        setMistakes(0);
        setFailedDueToTime(false);
        if (lesson.isReview) {
          const time = (currentLevel + 1) * 2 * 60;
          setTimeLeft(time);
          setInitialTime(time);
        } else if (currentLevel === 10) {
          const time = 20 * 60;
          setTimeLeft(time);
          setInitialTime(time);
        } else {
          setTimeLeft(null);
          setInitialTime(null);
        }
        setExercisesGeneratedFor({ id: lesson.id, level: currentLevel, partIndex });
      });
    }
  }, [
    lesson,
    router,
    currentLevel,
    language,
    completedLessons,
    _hasHydrated,
    lessonId,
    unlockedLessons,
    exercisesGeneratedFor,
  ]);

  // Preload images and audio in background
  useEffect(() => {
    if (exercises.length > 0) {
      const imageUrls = new Set<string>();
      const audioTexts = new Set<string>();

      exercises.forEach(ex => {
        if (ex.imageUrl) imageUrls.add(ex.imageUrl);
        if (ex.introItem?.imageUrl) imageUrls.add(ex.introItem.imageUrl);

        if (ex.answer && /[\u0E00-\u0E7F]/.test(ex.answer)) {
          audioTexts.add(ex.answer);
        }

        if (ex.options) {
          ex.options.forEach((opt: any) => {
            if (opt.imageUrl) imageUrls.add(opt.imageUrl);
            if (opt.th) audioTexts.add(opt.th);
          });
        }
        if (ex.pairs) {
          ex.pairs.forEach((pair: any) => {
            if (pair.imageUrl) imageUrls.add(pair.imageUrl);
            if (pair.th) audioTexts.add(pair.th);
          });
        }
      });

      // Delay slightly to not block initial render
      setTimeout(() => {
        imageUrls.forEach(url => {
          const img = new window.Image();
          img.src = url;
        });

        // Background audio preloading
        if (audioTexts.size > 0) {
          preloadThaiAudio(Array.from(audioTexts));
        }
      }, 500);
    }
  }, [exercises]);

  const handleResume = () => {
    const savedStateKey = `${lesson.id}_${currentLevel}${isPart ? `_part_${partIndex}` : ''}`;
    const savedState = inProgressLessons[savedStateKey];
    if (savedState) {
      setExercises(savedState.exercises);
      setCurrentIndex(savedState.currentIndex);
      setMistakes(savedState.mistakes);
      setTimeLeft(savedState.timeLeft);
      setInitialTime(savedState.initialTime);
      setIsFinished(false);
      setIsChecking(false);
      setIsCorrect(null);
      setSelectedAnswer(null);
      setFailedDueToTime(false);
    }
    setShowResumePrompt(false);
  };

  const handleRestart = () => {
    const savedStateKey = `${lesson.id}_${currentLevel}${isPart ? `_part_${partIndex}` : ''}`;
    saveInProgressLesson(savedStateKey, null);
    setShowResumePrompt(false);

    setIsFinished(false);
    setExercises([]);
    setShowExerciseUI(false);

    preloadThaiVoices();
    getExercisesServer(lesson.id, currentLevel, language, isPart ? partIndex : null, isPart ? totalParts : null).then(generated => {
      let finalExercises = generated;
      setExercises(finalExercises);
      setCurrentIndex(0);
      setIsFinished(false);
      setIsChecking(false);
      setIsCorrect(null);
      setSelectedAnswer(null);
      setMistakes(0);
      setFailedDueToTime(false);
      if (lesson.isReview) {
        const time = (currentLevel + 1) * 2 * 60;
        setTimeLeft(time);
        setInitialTime(time);
      } else if (currentLevel === 10) {
        const time = 20 * 60;
        setTimeLeft(time);
        setInitialTime(time);
      } else {
        setTimeLeft(null);
        setInitialTime(null);
      }
      setExercisesGeneratedFor({ id: lesson.id, level: currentLevel, partIndex });
    });
  };

  useEffect(() => {
    if (!lesson) return;
    if (searchParams.get("dev") === "validate" && exercises.length > 0 && !isFinished) {
      const isBilan = lesson.isReview || lesson.title?.toLowerCase().includes('bilan');
      const expected = useProgressStore.getState().getExpectedXp(lesson.id, currentLevel, isBilan, isPart, !isPart && (currentLevel === 7 || currentLevel === 8), isPart ? partIndex : null);
      setEarnedXp(expected.xp);
      setIsFinished(true);
      if (isPart && partIndex !== null && totalParts !== null) {
         completeLessonPart(lesson.id, 0, currentLevel, partIndex, totalParts, 3, isBilan);
      } else {
         completeLesson(lesson.id, 0, currentLevel, 3, isBilan);
      }
      triggerConfetti();
    }
  }, [searchParams, exercises.length, isFinished, lesson?.id, currentLevel, completeLesson]);

  const isDataLoaded = isClient && _hasHydrated && !!lesson && exercises.length > 0;

  useEffect(() => {
    if (!lesson) return;
    if (exercises.length > 0 && !isFinished && !showResumePrompt && isDataLoaded) {
      const savedStateKey = `${lesson.id}_${currentLevel}${isPart ? `_part_${partIndex}` : ''}`;
      saveInProgressLesson(savedStateKey, {
        exercises,
        currentIndex,
        mistakes,
        timeLeft,
        initialTime,
        lastUpdated: Date.now()
      });
    }
  }, [exercises, currentIndex, mistakes, timeLeft, initialTime, isFinished, showResumePrompt, isDataLoaded, lesson?.id, currentLevel, isPart, partIndex, saveInProgressLesson]);

  useEffect(() => {
    if (!lesson) return;
    if (isFinished) {
      const savedStateKey = `${lesson.id}_${currentLevel}${isPart ? `_part_${partIndex}` : ''}`;
      saveInProgressLesson(savedStateKey, null);
    }
  }, [isFinished, lesson?.id, currentLevel, saveInProgressLesson]);

  useEffect(() => {
    if (timeLeft === null || isFinished || !showExerciseUI || !isDataLoaded) return;

    if (timeLeft <= 0) {
      setIsFinished(true);
      setFailedDueToTime(true);
      const percentage = Math.round((currentIndex / exercises.length) * 100);
      saveReviewStat(lesson.id, currentLevel, { maxPercentage: percentage });
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isFinished, showExerciseUI, isDataLoaded, currentIndex, exercises.length, lesson?.id, currentLevel, saveReviewStat]);

  if (!isDataLoaded && !showExerciseUI) {
    // Need this block to prevent early variable access if exercises is empty
    // but the loading screen is still active.
  }

  const currentExercise = exercises.length > 0 ? exercises[currentIndex] : null;
  const progress = exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;

  // Auto-check for free-typing
  useEffect(() => {
    if (currentExercise && currentExercise.type === "free-typing" && !isChecking && typeof selectedAnswer === "string") {
      const targetLength = currentExercise.answer.replace(/\s+/g, "").length;
      const currentLength = selectedAnswer.replace(/\s+/g, "").length;
      if (currentLength >= targetLength && currentLength > 0) {
        // Use setTimeout to ensure the React state has fully updated the input UI
        const timer = setTimeout(() => handleCheck(selectedAnswer), 50);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedAnswer, currentExercise, isChecking]);

  const handleCheck = (overrideAnswer?: any) => {
    if (!currentExercise) return;
    if (currentExercise.type === "intro") {
      setIsExiting(true);
      setTimeout(() => {
        setIsExiting(false);
        if (currentIndex < exercises.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsChecking(false);
          setIsCorrect(null);
          setSelectedAnswer(null);
        } else {
          const isBilan = lesson.isReview || lesson.title?.toLowerCase().includes('bilan');
          const expected = useProgressStore.getState().getExpectedXp(lesson.id, currentLevel, isBilan, isPart, !isPart && (currentLevel === 7 || currentLevel === 8), isPart ? partIndex : null);
          setEarnedXp(expected.xp);
          setIsFinished(true);
          if (isPart && partIndex !== null && totalParts !== null) {
             completeLessonPart(lesson.id, 0, currentLevel, partIndex, totalParts, earnedStars, isBilan);
          } else {
             completeLesson(lesson.id, 0, currentLevel, earnedStars, isBilan);
          }
          if ((lesson.isReview || currentLevel === 10) && initialTime !== null && timeLeft !== null) {
            saveReviewStat(lesson.id, currentLevel, { bestTime: initialTime - timeLeft, maxPercentage: 100 });
          }
          triggerConfetti();
        }
      }, 150);
      return;
    }

    if (isChecking) {
      setIsExiting(true);
      setTimeout(() => {
        setIsExiting(false);
        // Move to next exercise
        if (isCorrect) {
          if (currentIndex < exercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsChecking(false);
            setIsCorrect(null);
            setSelectedAnswer(null);
          } else {
            // Finished
            const isBilan = lesson.isReview || lesson.title?.toLowerCase().includes('bilan');
            const expected = useProgressStore.getState().getExpectedXp(lesson.id, currentLevel, isBilan, isPart, !isPart && (currentLevel === 7 || currentLevel === 8), isPart ? partIndex : null);
            setEarnedXp(expected.xp);
            setIsFinished(true);
            if (isPart && partIndex !== null && totalParts !== null) {
               completeLessonPart(lesson.id, 0, currentLevel, partIndex, totalParts, earnedStars, isBilan);
            } else {
               completeLesson(lesson.id, 0, currentLevel, earnedStars, isBilan);
            }
            if ((lesson.isReview || currentLevel === 10) && initialTime !== null && timeLeft !== null) {
              saveReviewStat(lesson.id, currentLevel, { bestTime: initialTime - timeLeft, maxPercentage: 100 });
            }
            triggerConfetti();
          }
        } else {
          // If wrong, we re-add the exercise to the end with a new ID to force remount
          setExercises([...exercises, { ...currentExercise, id: `${currentExercise.id}-retry-${Date.now()}` }]);
          setCurrentIndex(currentIndex + 1);
          setIsChecking(false);
          setIsCorrect(null);
          setSelectedAnswer(null);
        }
      }, 150);
      return;
    }

    // Validate
    const answerToCheck = overrideAnswer !== undefined && overrideAnswer !== null && (typeof overrideAnswer === 'string' || Array.isArray(overrideAnswer)) ? overrideAnswer : selectedAnswer;
    if (!answerToCheck) return;

    let correct = false;
    if (currentExercise.type === "word-match") {
      correct = answerToCheck === currentExercise.answer;
    } else if (currentExercise.type === "sentence-builder") {
      if (currentExercise.isFillInBlank && currentExercise.correctComponents && currentExercise.blankIndex !== undefined) {
        if (Array.isArray(answerToCheck) && answerToCheck.length === 1) {
          const expectedWordId = currentExercise.correctComponents[currentExercise.blankIndex];
          const expectedWord = currentExercise.options.find(o => o.id === expectedWordId)?.th;
          correct = answerToCheck[0] === expectedWord;
        }
      } else {
        const builtSentence = (answerToCheck as string[])
          .join("")
          .replace(/\s+/g, "");
        const expectedSentence = currentExercise.answer
          .replace(/\s+/g, "")
          .replace(/\.\.\./g, "");
        correct = builtSentence === expectedSentence;
      }
    } else if (currentExercise.type === "writing") {
      const builtValue = (answerToCheck as string[])
        .join("")
        .replace(/\s+/g, "");
      const targetValue = currentExercise.answer.replace(/\s+/g, "");
      correct = builtValue === targetValue;
    } else if (currentExercise.type === "free-typing") {
      const builtValue =
        typeof answerToCheck === "string"
          ? answerToCheck.replace(/\s+/g, "")
          : "";
      const targetValue = currentExercise.answer.replace(/\s+/g, "");

      const levenshtein = (a: string, b: string): number => {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = Array.from({ length: a.length + 1 }, () =>
          new Array(b.length + 1).fill(0),
        );
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
              matrix[i - 1][j] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j - 1] + cost,
            );
          }
        }
        return matrix[a.length][b.length];
      };

      const editDist = levenshtein(builtValue, targetValue);
      const similarity =
        1 - editDist / Math.max(builtValue.length, targetValue.length);
      correct = similarity >= 0.8;
    }

    setIsCorrect(correct);
    if (!correct) {
      setLastPlayedLesson(lessonId, 'learn');
      setMistakes(m => m + 1);
    }
    setIsChecking(true);
    playThaiTTS(currentExercise.answer);
  };

  if (showResumePrompt) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-[#FAFAFA] font-sans">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col items-center text-center shadow-xl m-4 border-2 border-slate-100">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
            <RotateCcw size={32} className="stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
            {getTranslation('auto.resume_lesson', language) || 'Partie en cours'}
          </h2>
          <p className="text-slate-500 font-medium mb-8 text-sm">
            {getTranslation('auto.resume_lesson_desc', language) || 'Vous avez commencé ce niveau précédemment. Voulez-vous reprendre là où vous en étiez ?'}
          </p>
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleResume}
              className="w-full bg-amber-400 text-white font-extrabold rounded-2xl py-4 transition-all shadow-sm border-b-4 border-amber-500 active:translate-y-1 active:border-b-0 hover:bg-amber-300"
            >
              {getTranslation('auto.resume_button', language) || 'Reprendre la partie'}
            </button>
            <button
              onClick={handleRestart}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl py-4 transition-all"
            >
              {getTranslation('auto.restart_button', language) || 'Recommencer à zéro'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const lessonIndex = parseInt(lesson.id.replace("lesson-", "")) - 1;
    const unitEndIndices = [11, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    let currentUnitIndex = unitEndIndices.findIndex((idx) => lessonIndex < idx);
    if (currentUnitIndex === -1 && lessonIndex >= 0)
      currentUnitIndex = unitEndIndices.length - 1;
    const isEndOfUnit = unitEndIndices.includes(lessonIndex + 1);
    const nextUnitIndex =
      isEndOfUnit &&
        currentUnitIndex !== -1 &&
        currentUnitIndex < unitEndIndices.length - 1
        ? currentUnitIndex + 1
        : -1;

    return (
      <ResultScreen
        lesson={lesson}
        currentLevel={currentLevel}
        earnedStars={earnedStars}
        exercisesLength={exercises.length}
        language={language}
        nextUnitIndex={nextUnitIndex}
        failedDueToTime={failedDueToTime}
        timeLeft={timeLeft}
        initialTime={initialTime}
        currentIndex={currentIndex}
        earnedXp={earnedXp}
        isPart={isPart}
        partIndex={partIndex}
        totalParts={totalParts}
      />
    );
  }

  const isAnswerComplete = currentExercise
    ? currentExercise.type === "intro"
      ? true
      : currentExercise.type === "free-typing"
        ? false
        : (currentExercise.type === "writing" ||
          currentExercise.type === "sentence-builder") &&
          currentExercise.correctComponents
          ? Array.isArray(selectedAnswer) &&
          selectedAnswer.length ===
          currentExercise.correctComponents.filter((c) => c !== "w_dots")
            .length
          : selectedAnswer !== null &&
          (!Array.isArray(selectedAnswer) ||
            (selectedAnswer as any[]).length > 0)
    : false;

  const showFooter = currentExercise
    ? (currentExercise.type !== "pair-matching" || (isChecking && !isCorrect)) &&
    (isChecking || isAnswerComplete)
    : false;

  const instructionKey = getInstructionKey(currentExercise || undefined);
  const instructionText = getInstructionText(instructionKey, language);
  const isAcknowledged = instructionKey
    ? acknowledgedInstructions.has(instructionKey) || hiddenInstructions.includes(instructionKey)
    : true;

  const showInstruction = !!(instructionText && !isAcknowledged);

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
            <HeaderProgressBar
              lessonId={lesson.id}
              language={language}
              currentLevel={currentLevel}
              progress={progress}
              earnedStars={earnedStars}
              currentIndex={currentIndex}
              exercisesLength={exercises.length}
              currentExercise={currentExercise as Exercise}
              showRomanization={showRomanization}
              setShowRomanization={setShowRomanization}
              setShowInfoModal={setShowInfoModal}
              isReview={lesson.isReview || currentLevel === 10}
              timeLeft={timeLeft}
              initialTime={initialTime}
            />

            {/* Main Exercise Area */}
            <main className="flex-1 flex flex-col w-full relative">
              {/* Glossary Modal */}
              <GlossaryModal
                isOpen={showInfoModal}
                lesson={lesson}
                language={language}
                showRomanization={showRomanization}
                onClose={() => setShowInfoModal(false)}
              />

              {/* The Question / Hint System */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentExercise?.id || 'loading'}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col items-center md:justify-center md:overflow-y-auto hide-scrollbar"
                >
                  {/* Instruction Screen */}
                  {(showInstruction || showHelpModal) && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full flex justify-center"
                    >
                      <InstructionBlock
                        language={language}
                        instructionText={instructionText}
                        instructionKey={instructionKey}
                        currentExercise={currentExercise as Exercise}
                        dontShowAgain={dontShowAgain}
                        setDontShowAgain={setDontShowAgain}
                        showHelpModal={showHelpModal}
                        setShowHelpModal={setShowHelpModal}
                        hideInstruction={hideInstruction}
                        unhideInstruction={unhideInstruction}
                        setAcknowledgedInstructions={setAcknowledgedInstructions}
                      />
                    </motion.div>
                  )}

                  {/* Help Button - Above Exercise */}
                  {!(showInstruction || showHelpModal) && instructionKey && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                      className="w-full max-w-3xl px-4 pt-4 md:pt-6 flex justify-end shrink-0">
                      <button
                        onClick={() => setShowHelpModal(true)}
                        className="text-slate-500 hover:text-amber-600 transition-colors bg-white rounded-full py-1.5 px-3 shadow-sm border border-slate-200 flex items-center gap-1.5 text-sm font-bold active:scale-95"
                        title={getTranslation('auto.help_instructions', language)}
                      >
                        <HelpCircle size={18} strokeWidth={2.5} />
                        {getTranslation('auto.help', language)}
                      </button>
                    </motion.div>
                  )}

                  {/* Scrollable Upper Area */}
                  <motion.div
                    animate={{ opacity: isExiting ? 0 : 1, y: 0, scale: 1 }}
                    transition={{ duration: isExiting ? 0.15 : 0.3, delay: isExiting ? 0 : 0.1 }}
                    className={`${showInstruction || showHelpModal || currentExercise?.type === "pair-matching" ? "hidden" : "flex"} flex-1 md:flex-none w-full max-w-3xl overflow-y-auto md:overflow-y-visible px-4 py-4 md:py-4 flex-col ${isKeyboardOpen ? "justify-end pb-[5vh] md:justify-center md:pb-4" : "justify-center"} hide-scrollbar`}
                  >
                    {currentExercise?.type !== "pair-matching" && (
                      <QuestionArea
                        currentExercise={currentExercise as Exercise}
                        lesson={lesson}
                        language={language}
                        showRomanization={showRomanization}
                        isChecking={isChecking}
                        selectedAnswer={selectedAnswer}
                      />
                    )}
                  </motion.div>

                  {/* Exercise Options (Fixed at bottom on Mobile) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isExiting ? { opacity: 0 } : { opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: isExiting ? 0.15 : 0.3, delay: isExiting ? 0 : 0.3 }}
                    className={`${showInstruction || showHelpModal ? "hidden" : "flex"} ${currentExercise?.type === "pair-matching" ? "flex-1 items-center" : "shrink-0 md:shrink-0"} bg-transparent px-4 pb-4 pt-2 md:pt-4 md:pb-8 justify-center z-10 w-full max-w-3xl`}
                  >
                    <div className="w-full relative">
                      <ErrorBoundary>
                        {currentExercise?.type ===
                          "intro" ? null : currentExercise?.type === "word-match" ? (
                            <WordMatch
                              exercise={currentExercise as Exercise}
                              selected={selectedAnswer as string}
                              onChange={setSelectedAnswer}
                              disabled={isChecking}
                              isChecking={isChecking}
                              isCorrect={isCorrect}
                              onAutoCheck={(val) => handleCheck(val)}
                              language={language}
                              onAddMistake={() => setMistakes(m => m + 1)}
                            />
                          ) : currentExercise?.type === "pair-matching" ? (
                            <PairMatch
                              key={currentExercise.id}
                              pairs={currentExercise.pairs as Word[]}
                              mode={currentExercise.pairMatchMode}
                              forceHideRomanization={
                                currentExercise.forceHideRomanization
                              }
                              disabled={isChecking}
                              onComplete={(failed?: boolean) => {
                                if (failed) {
                                  setIsCorrect(false);
                                  setIsChecking(true);
                                  setMistakes((m) => m + 1);
                                  setLastPlayedLesson(lessonId, 'learn');
                                  playThaiTTS("ผิดครับ");
                                } else {
                                  setIsExiting(true);
                                  setTimeout(() => {
                                    setIsExiting(false);
                                    if (currentIndex < exercises.length - 1) {
                                      setCurrentIndex((prev) => prev + 1);
                                      setIsChecking(false);
                                      setIsCorrect(null);
                                      setSelectedAnswer(null);
                                    } else {
                                      const isBilan = lesson.isReview || lesson.title?.toLowerCase().includes('bilan');
                                      const expected = useProgressStore.getState().getExpectedXp(lesson.id, currentLevel, isBilan);
                                      setEarnedXp(expected.xp);
                                      setIsFinished(true);
                                      completeLesson(
                                        lesson.id,
                                        0,
                                        currentLevel,
                                        earnedStars,
                                        isBilan
                                      );
                                      if ((lesson.isReview || currentLevel === 10) && initialTime !== null && timeLeft !== null) {
                                        saveReviewStat(lesson.id, currentLevel, { bestTime: initialTime - timeLeft, maxPercentage: 100 });
                                      }
                                      triggerConfetti();
                                    }
                                  }, 150);
                                }
                              }}
                            />
                          ) : currentExercise?.type === "writing" ? (
                            <VirtualKeyboard
                              exercise={currentExercise as Exercise}
                              selected={(selectedAnswer as string[]) || []}
                              onChange={setSelectedAnswer as any}
                              disabled={isChecking}
                              onAutoCheck={(val) => handleCheck(val)}
                            />
                          ) : currentExercise?.type === "free-typing" ? (
                            <FreeTypingInput
                              exercise={currentExercise as Exercise}
                              selected={(selectedAnswer as string) || ""}
                              onChange={setSelectedAnswer as any}
                              disabled={isChecking}
                            />
                          ) : currentExercise && (
                            <SentenceBuilder
                              exercise={currentExercise as Exercise}
                              selected={(selectedAnswer as string[]) || []}
                              onChange={setSelectedAnswer as any}
                              disabled={isChecking}
                              onAutoCheck={(val) => handleCheck(val)}
                            />
                          )}
                      </ErrorBoundary>
                    </div>
                  </motion.div>
                  {/* The transparent spacer to allow footer absolute positioning without overlapping options */}
                  <div
                    className="hidden"
                  ></div>
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Footer Actions */}
            <Footer
              currentExercise={currentExercise as Exercise}
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

export default function LessonClientPage({ lesson }: { lesson: any }) {
  return (
    <Suspense fallback={null}>
      <LessonPageContent lesson={lesson} />
    </Suspense>
  );
}
