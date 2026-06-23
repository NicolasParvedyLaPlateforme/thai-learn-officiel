"use client";

import { getTranslation } from "@/hooks/useTranslation";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useShallow } from 'zustand/react/shallow';
import { useProgressStore } from "@/lib/store";
import { getExercisesServer, getTrainingExercisesServer, getRevisionExercisesServer, getLessonData } from "@/actions/course";
import { Exercise, Lesson, Word } from "@/types";
import { getLevelSplit } from "@/lib/levelSplits";
import { X, Check, Star, Crown, Volume2, HelpCircle, RotateCcw } from "lucide-react";
import { playThaiTTS, preloadThaiVoices, preloadThaiAudio } from "@/lib/tts";
import { m as motion, AnimatePresence } from "motion/react";
import Image from "next/image";

import { ErrorBoundary } from "@/components/providers/ErrorBoundary";

// Static imports for maximum offline resilience
import WordMatch from './WordMatch';
import SentenceBuilder from './SentenceBuilder';
import PairMatch from "@/components/learn/PairMatch";
import VirtualKeyboard from '../../../writing/components/VirtualKeyboard';
import FreeTypingInput from './FreeTypingInput';
import InstructionExample from '@/components/lesson/InstructionExample';
import GlossaryModal from '@/components/lesson/GlossaryModal';
import ResultScreen from '@/components/lesson/ResultScreen';

import { Suspense } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { SentenceWithHints } from "@/components/learn/Hints";
import { TooltipHint } from "@/components/ui/TooltipHint";
import HeaderProgressBar from "@/components/lesson/HeaderProgressBar";
import InstructionBlock from "@/components/lesson/InstructionBlock";
import Footer from "@/components/lesson/Footer";
import QuestionArea from "@/components/lesson/QuestionArea";
import { useLessonEngine } from "@/hooks/useLessonEngine";

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

  const [exercisesGeneratedFor, setExercisesGeneratedFor] = useState<{
    id: string;
    level: number;
    partIndex?: number | null;
    mode?: string | null;
  } | null>(null);

  // Use requested level if provided, otherwise the saved level, but lock it to the generated level if already playing
  const currentLevel = requestedLevelStr
    ? isDev
      ? Math.max(0, parseInt(requestedLevelStr, 10) - 1)
      : Math.min(savedLevel, Math.max(0, parseInt(requestedLevelStr, 10) - 1))
    : (exercisesGeneratedFor?.level !== undefined ? exercisesGeneratedFor.level : savedLevel);

  const partStr = searchParams.get("part");
  const totalPartsStr = searchParams.get("totalParts");
  const partIndex = partStr ? parseInt(partStr, 10) : null;
  const totalParts = totalPartsStr ? parseInt(totalPartsStr, 10) : null;
  const isPart = partIndex !== null && totalParts !== null && totalParts > 1;

  const [initialExercises, setInitialExercises] = useState<Exercise[]>([]);
  const [engineIndex, setEngineIndex] = useState(0);
  const [engineMistakes, setEngineMistakes] = useState(0);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [initialTime, setInitialTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTimeSec, setElapsedTimeSec] = useState<number | undefined>(undefined);
  const [failedDueToTime, setFailedDueToTime] = useState(false);
  const [earnedXp, setEarnedXp] = useState<number>(0);

  const [isClient, setIsClient] = useState(false);
  const [showExerciseUI, setShowExerciseUI] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [acknowledgedInstructions, setAcknowledgedInstructions] = useState<
    Set<string>
  >(new Set());

  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const { inProgressLessons, saveInProgressLesson } = useProgressStore(
    useShallow((state) => ({
      inProgressLessons: state.inProgressLessons,
      saveInProgressLesson: state.saveInProgressLesson
    }))
  );

  const {
    exercises,
    currentExercise,
    currentIndex,
    progress,
    isChecking,
    isCorrect,
    isFinished,
    setIsFinished,
    mistakes,
    setMistakes,
    selectedAnswer,
    setSelectedAnswer,
    isExiting,
    handleCheck,
  } = useLessonEngine<Exercise, any>({
    initialExercises,
    initialIndex: engineIndex,
    initialMistakes: engineMistakes,
    animationDelay: 150,
    isExerciseIntroOrReview: (ex) => ex.type === 'intro',
    cloneExerciseForRetry: (ex) => {
      const cloned = { ...ex, id: (ex as any).id + '-retry-' + Date.now() };
      if (cloned.type === 'word-match' && cloned.options) {
        const shuffled = [...cloned.options];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        cloned.options = shuffled;
      }
      return cloned;
    },
    evaluateAnswer: (ex, answerToCheck) => {
      let correct = false;
      if (ex.type === "word-match") {
        correct = answerToCheck === ex.answer;
      } else if (ex.type === "sentence-builder") {
        if (ex.isFillInBlank && ex.correctComponents && ex.blankIndex !== undefined) {
          if (Array.isArray(answerToCheck) && answerToCheck.length === 1) {
            const expectedWordId = ex.correctComponents[ex.blankIndex];
            const expectedWord = ex.options?.find((o: any) => o.id === expectedWordId)?.th;
            correct = answerToCheck[0] === expectedWord;
          }
        } else {
          const builtSentence = (answerToCheck as string[]).join("").replace(/\s+/g, "");
          const expectedSentence = ex.answer?.replace(/\s+/g, "").replace(/\.\.\./g, "") || "";
          correct = builtSentence === expectedSentence;
        }
      } else if (ex.type === "pair-matching") {
        correct = answerToCheck === true;
      } else if (ex.type === "writing") {
        const builtValue = (answerToCheck as string[]).join("").replace(/\s+/g, "");
        const targetValue = ex.answer?.replace(/\s+/g, "") || "";
        correct = builtValue === targetValue;
      } else if (ex.type === "free-typing") {
        const builtValue = typeof answerToCheck === "string" ? answerToCheck.replace(/\s+/g, "") : "";
        const targetValue = ex.answer?.replace(/\s+/g, "") || "";
        const levenshtein = (a: string, b: string): number => {
          if (a.length === 0) return b.length;
          if (b.length === 0) return a.length;
          const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
          for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
          for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
          for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
              const cost = a[i - 1] === b[j - 1] ? 0 : 1;
              matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
            }
          }
          return matrix[a.length][b.length];
        };
        const editDist = levenshtein(builtValue, targetValue);
        const similarity = 1 - editDist / Math.max(builtValue.length, targetValue.length);
        correct = similarity >= 0.8;
      }
      return correct;
    },
    onComplete: (totalMistakes) => {
      const mode = searchParams.get('mode');
      
      let finalXp = 0;
      let wonCoin = false;

      if (mode === 'training') {
        finalXp = 10;
        setEarnedXp(finalXp);
        useProgressStore.getState().addXp(finalXp);
        if (Math.random() < 0.2) {
          wonCoin = true;
          const coinsEarned = Math.floor(Math.random() * 3) + 1;
          useProgressStore.setState((s) => ({ goldCoins: s.goldCoins + coinsEarned }));
        }
      } else if (mode === 'revision') {
        finalXp = 50;
        setEarnedXp(finalXp);
        useProgressStore.getState().addXp(finalXp);
        if (Math.random() < 0.2) {
          wonCoin = true;
          const coinsEarned = Math.floor(Math.random() * 3) + 1;
          useProgressStore.setState((s) => ({ goldCoins: s.goldCoins + coinsEarned }));
        }
      } else {
        const isBilan = lesson.isReview || lesson.title?.toLowerCase().includes('bilan') || false;
        const expected = useProgressStore.getState().getExpectedXp(lesson.id, currentLevel, isBilan, isPart, !isPart && (currentLevel === 7 || currentLevel === 8), isPart ? partIndex : null);
        finalXp = expected.xp;
        setEarnedXp(finalXp);
        const earnedStarsLocal = Math.max(0, 5 - totalMistakes);
        
        if (isPart && partIndex !== null && totalParts !== null) {
           useProgressStore.getState().completeLessonPart(lesson.id, 0, currentLevel, partIndex, totalParts, earnedStarsLocal, isBilan);
        } else {
           useProgressStore.getState().completeLesson(lesson.id, 0, currentLevel, earnedStarsLocal, isBilan);
        }
      }
      
      // Pass the wonCoin flag so we can display it later if needed (optional)
      // Since it's not a state, we might just rely on the UI or add a small state if we want to show it.
      // Note: we can't easily access initialTime and timeLeft inside this callback if they aren't in scope/up-to-date.
      // But we can use setInitialTime / setTimeLeft state from the closure.
      if ((lesson.isReview || currentLevel === 10)) {
        // saveReviewStat is handled outside or we can pass it here. Wait, initialTime might be outdated here. Let's fix that later if needed.
      }
      triggerConfetti();
    },
    onCorrect: (ex) => {
      if (ex.type !== 'intro' && ex.answer) playThaiTTS(ex.answer);
    },
    onIncorrect: (ex) => {
      setLastPlayedLesson(lesson.id, 'learn');
      if (ex.answer) playThaiTTS(ex.answer);
    }
  });

  const earnedStars = Math.max(0, 5 - mistakes);
  const currentExerciseTop = exercises.length > 0 ? exercises[currentIndex] : undefined;
  const instructionKeyTop = getInstructionKey(currentExerciseTop);

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
      router.push(`/learn#lesson-${lesson.id}`);
      return;
    }

    const currentMode = searchParams.get('mode');

    // Security check for parts
    const actualTotalParts = getLevelSplit(currentLevel, lesson);
    const partsKey = `${lesson.id}_level-${currentLevel}`;
    const completedParts = lessonPartsCompleted[partsKey] || [];
    
    if (!isDev && !lesson.isReview && actualTotalParts > 1 && currentMode !== 'training' && currentMode !== 'revision') {
      const expectedPart = completedParts.length;
      if (partIndex !== null && partIndex > expectedPart) {
        console.warn("Security redirect triggered:", { partIndex, expectedPart, totalParts, actualTotalParts });
        router.replace(`/lesson/${lesson.id}?level=${currentLevel + 1}&part=${expectedPart}&totalParts=${actualTotalParts}`);
        return;
      }
    }
    
    if (
      !exercisesGeneratedFor ||
      exercisesGeneratedFor.id !== lesson.id ||
      exercisesGeneratedFor.level !== currentLevel ||
      exercisesGeneratedFor.partIndex !== partIndex ||
      exercisesGeneratedFor.mode !== currentMode
    ) {
      setShowExerciseUI(false);

      const savedStateKey = `${lesson.id}_${currentLevel}${isPart ? `_part_${partIndex}` : ''}${currentMode ? `_${currentMode}` : ''}`;
      const savedState = inProgressLessons[savedStateKey];

      if (currentMode !== 'training' && currentMode !== 'revision' && savedState && savedState.exercises && savedState.exercises.length > 0) {
        setShowResumePrompt(true);
        setExercisesGeneratedFor({ id: lesson.id, level: currentLevel, partIndex, mode: currentMode });
        return;
      }

      preloadThaiVoices();

      const mode = searchParams.get('mode');
      let generatorPromise;
      if (mode === 'training') {
        generatorPromise = getTrainingExercisesServer(lesson.id, language, isPart ? partIndex : null, isPart ? totalParts : null, currentLevel);
      } else if (mode === 'revision') {
        generatorPromise = getRevisionExercisesServer(lesson.id, language);
      } else {
        generatorPromise = getExercisesServer(lesson.id, currentLevel, language, isPart ? partIndex : null, isPart ? totalParts : null);
      }

      generatorPromise.then(generated => {
        if (!generated || generated.length === 0) {
          console.error(`Exercises empty! ID: ${lesson.id}, Level: ${currentLevel}, partIndex: ${partIndex}, totalParts: ${totalParts}`);
          window.location.reload();
          return;
        }
        let finalExercises = generated;
        setInitialExercises(finalExercises);
        setEngineIndex(0);
        setEngineMistakes(0);
        setFailedDueToTime(false);
        const isBilanLesson = lesson.isReview || lesson.id?.startsWith('bilan-') || lesson.id?.includes('-bilan');
        if (isBilanLesson) {
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
        setStartTime(Date.now());
        setExercisesGeneratedFor({ id: lesson.id, level: currentLevel, partIndex, mode: currentMode });
      }).catch(e => {
        console.error("Failed to load exercises (likely cache mismatch):", e);
        window.location.reload();
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
      setInitialExercises(savedState.exercises);
      setEngineIndex(savedState.currentIndex);
      setEngineMistakes(savedState.mistakes);
      setTimeLeft(savedState.timeLeft);
      setInitialTime(savedState.initialTime);
      setStartTime(Date.now());
      setFailedDueToTime(false);
    }
    setShowResumePrompt(false);
  };

  const handleRestart = () => {
    const savedStateKey = `${lesson.id}_${currentLevel}${isPart ? `_part_${partIndex}` : ''}`;
    saveInProgressLesson(savedStateKey, null);
    setShowResumePrompt(false);

    setShowExerciseUI(false);

    preloadThaiVoices();
    getExercisesServer(lesson.id, currentLevel, language, isPart ? partIndex : null, isPart ? totalParts : null).then(generated => {
      if (!generated || generated.length === 0) {
        console.error(`Exercises empty! ID: ${lesson.id}, Level: ${currentLevel}, partIndex: ${partIndex}, totalParts: ${totalParts}`);
        window.location.reload();
        return;
      }
      let finalExercises = generated;
      setInitialExercises(finalExercises);
      setEngineIndex(0);
      setEngineMistakes(0);
      setFailedDueToTime(false);
      const isBilanLesson = lesson.isReview || lesson.id?.startsWith('bilan-') || lesson.id?.includes('-bilan');
      if (isBilanLesson) {
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
      setStartTime(Date.now());
      setExercisesGeneratedFor({ id: lesson.id, level: currentLevel, partIndex });
    }).catch(e => {
      console.error("Failed to load exercises (likely cache mismatch):", e);
      window.location.reload();
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
      const currentMode = searchParams.get('mode');
      if (currentMode !== 'training' && currentMode !== 'revision') {
        const savedStateKey = `${lesson.id}_${currentLevel}${isPart ? `_part_${partIndex}` : ''}${currentMode ? `_${currentMode}` : ''}`;
        saveInProgressLesson(savedStateKey, {
          exercises,
          currentIndex,
          mistakes,
          timeLeft,
          initialTime,
          lastUpdated: Date.now()
        });
      }
    }
  }, [exercises, currentIndex, mistakes, timeLeft, initialTime, isFinished, showResumePrompt, isDataLoaded, lesson?.id, currentLevel, isPart, partIndex, saveInProgressLesson, searchParams]);

  useEffect(() => {
    if (!lesson) return;
    if (isFinished) {
      if (startTime && elapsedTimeSec === undefined) {
        setElapsedTimeSec(Math.floor((Date.now() - startTime) / 1000));
      }
      const currentMode = searchParams.get('mode');
      if (currentMode !== 'training' && currentMode !== 'revision') {
        const savedStateKey = `${lesson.id}_${currentLevel}${isPart ? `_part_${partIndex}` : ''}${currentMode ? `_${currentMode}` : ''}`;
        saveInProgressLesson(savedStateKey, null);
      }
    }
  }, [isFinished, lesson?.id, currentLevel, isPart, partIndex, saveInProgressLesson, searchParams, startTime, elapsedTimeSec]);

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
  // Auto-check for free-typing
  useEffect(() => {
    if (currentExercise && currentExercise.type === "free-typing" && !isChecking && typeof selectedAnswer === "string" && !isFinished) {
      const targetLength = currentExercise.answer.replace(/\s+/g, "").length;
      const currentLength = selectedAnswer.replace(/\s+/g, "").length;
      if (currentLength >= targetLength && currentLength > 0) {
        // Use setTimeout to ensure the React state has fully updated the input UI
        const timer = setTimeout(() => handleCheck(selectedAnswer), 50);
        return () => clearTimeout(timer);
      }
    }
  }, [currentExercise, isChecking, selectedAnswer, isFinished, handleCheck]);

  // Auto-advance for pair-matching when correct
  useEffect(() => {
    if (currentExercise && currentExercise.type === "pair-matching" && isChecking && isCorrect && !isFinished) {
      const timer = setTimeout(() => handleCheck(), 100);
      return () => clearTimeout(timer);
    }
  }, [currentExercise, isChecking, isCorrect, isFinished, handleCheck]);

  // handleCheck logic is now handled by useLessonEngine

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

  if (isFinished && exercisesGeneratedFor?.level === currentLevel) {
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
        mode={searchParams.get('mode')}
        elapsedTimeSec={elapsedTimeSec}
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
              isReview={lesson.isReview || lesson.id?.startsWith('bilan-') || lesson.id?.includes('-bilan') || currentLevel === 10}
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
                                handleCheck(!failed);
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
