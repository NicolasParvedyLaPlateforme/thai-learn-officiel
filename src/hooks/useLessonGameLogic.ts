import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useShallow } from 'zustand/react/shallow';
import { useProgressStore } from "@/lib/store";
import { getExercisesServer, getTrainingExercisesServer, getRevisionExercisesServer } from "@/actions/course";
import { Exercise } from "@/types";
import { getLevelSplit } from "@/lib/levelSplits";
import { playThaiTTS, preloadThaiVoices, preloadThaiAudio } from "@/lib/tts";
import { triggerConfetti } from "@/lib/confetti";
import { useLessonEngine } from "@/hooks/useLessonEngine";
import { getTranslation } from "@/hooks/useTranslation";

const getInstructionKey = (ex: Exercise | undefined) => {
  if (!ex) return null;
  if (ex.type === "intro") return null;
  if (ex.type === "composition") return null;
  if (ex.type === "word-match") return "word-match";
  if (ex.type === "pair-matching") return "pair-matching";
  if (ex.type === "sentence-builder") return "sentence-builder";
  if (ex.type === "writing") return ex.blindMode ? "writing-blind" : "writing";
  if (ex.type === "free-typing") return "free-typing";
  return null;
};

const getInstructionText = (key: string | null, lang: string) => {
  if (!key) return null;
  return getTranslation(`instruction.${key.replace("-", "_")}`, lang);
};

export function useLessonGameLogic(lesson: any) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    completeLesson,
    completeLessonPart,
    lessonLevels,
    language,
    completedLessons,
    unlockedLessons,
    _hasHydrated,
    showRomanization,
    setShowRomanization,
    setLastPlayedLesson,
    hiddenInstructions,
    hideInstruction,
    unhideInstruction,
    saveReviewStat,
    lessonPartsCompleted,
    inProgressLessons,
    saveInProgressLesson
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
      setLastPlayedLesson: state.setLastPlayedLesson,
      hiddenInstructions: state.hiddenInstructions,
      hideInstruction: state.hideInstruction,
      unhideInstruction: state.unhideInstruction,
      saveReviewStat: state.saveReviewStat,
      lessonPartsCompleted: state.lessonPartsCompleted,
      inProgressLessons: state.inProgressLessons,
      saveInProgressLesson: state.saveInProgressLesson
    }))
  );

  const lessonId = params.id as string;
  const requestedLevelStr = searchParams.get("level");
  const isDev = searchParams.has("dev");
  const mode = searchParams.get('mode');

  const savedLevel = lesson ? lessonLevels[lesson.id] || 0 : 0;

  const isPartCompleted = (l: number, p: number) => {
    const key = `${lessonId}_level-${l}`;
    const parts = lessonPartsCompleted?.[key] || [];
    return parts.includes(p);
  };

  let maxAccessibleLevel = 0;
  const maxL = 10;
  const currentFullLevels = Object.keys(lessonPartsCompleted || {})
    .filter(k => k.startsWith(`${lessonId}_level-`))
    .map(k => parseInt(k.split('-')[1], 10))
    .filter(l => {
      const total = lesson ? getLevelSplit(l, lesson) : 1;
      return (lessonPartsCompleted?.[`${lessonId}_level-${l}`] || []).length >= total;
    });

  for (let l = 1; l <= maxL; l++) {
    const isVerticalMet = isPartCompleted(l - 1, 0);
    if (!isVerticalMet) break;

    let isBlocked = false;
    if (l >= 4) {
      for (let i = 4; i <= l; i++) {
        if (!currentFullLevels.includes(i - 4)) {
          isBlocked = true;
          break;
        }
      }
      if (l === 4) {
        const partsL3 = lesson ? getLevelSplit(3, lesson) : 1;
        const completedL3 = lessonPartsCompleted?.[`${lessonId}_level-3`] || [];
        if (completedL3.length < partsL3) {
            isBlocked = true;
        }
      }
    }
    if (isBlocked) break;
    maxAccessibleLevel = l;
  }

  const effectiveProgress = Math.max(savedLevel, maxAccessibleLevel);

  const [exercisesGeneratedFor, setExercisesGeneratedFor] = useState<{
    id: string;
    level: number;
    partIndex?: number | null;
    mode?: string | null;
  } | null>(null);

  const currentLevel = requestedLevelStr
    ? isDev
      ? Math.max(0, parseInt(requestedLevelStr, 10) - 1)
      : Math.min(effectiveProgress, Math.max(0, parseInt(requestedLevelStr, 10) - 1))
    : (exercisesGeneratedFor?.level !== undefined ? exercisesGeneratedFor.level : effectiveProgress);

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
  const [acknowledgedInstructions, setAcknowledgedInstructions] = useState<Set<string>>(new Set());
  const [showResumePrompt, setShowResumePrompt] = useState(false);

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
    isExerciseIntroOrReview: (ex) => ex.type === 'intro' || ex.type === 'composition',
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
      if (ex.type === "word-match" || ex.type === "missing-letter" || ex.type === "sound-to-letter" || ex.type === "true-false" || ex.type === "one-letter-difference" || ex.type === "word-position" || ex.type === "phrase-order") {
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
      let finalXp = 0;

      if (mode === 'training') {
        finalXp = 10;
        setEarnedXp(finalXp);
        useProgressStore.getState().addXp(finalXp);
        if (Math.random() < 0.2) {
          const coinsEarned = Math.floor(Math.random() * 3) + 1;
          useProgressStore.setState((s) => ({ goldCoins: s.goldCoins + coinsEarned }));
        }
      } else if (mode === 'revision') {
        finalXp = 50;
        setEarnedXp(finalXp);
        useProgressStore.getState().addXp(finalXp);
        if (Math.random() < 0.2) {
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
        if (currentVH > maxVH) maxVH = currentVH;
        if (currentVH < maxVH - 150) setIsKeyboardOpen(true);
        else setIsKeyboardOpen(false);
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

  const handleExercisesLoaded = (generated: any[], modeParam?: string | null) => {
    if (!generated || generated.length === 0) {
      console.error(`Exercises empty! ID: ${lesson.id}, Level: ${currentLevel}, partIndex: ${partIndex}, totalParts: ${totalParts}`);
      window.location.reload();
      return;
    }
    setInitialExercises(generated);
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
    setExercisesGeneratedFor({ id: lesson.id, level: currentLevel, partIndex, mode: modeParam ?? null });
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!lesson) {
      router.push(`/learn#lesson-${lessonId}`);
      return;
    }

    const currentMode = searchParams.get('mode');
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
      let generatorPromise;
      if (currentMode === 'training') {
        generatorPromise = getTrainingExercisesServer(lesson.id, language, isPart ? partIndex : null, isPart ? totalParts : null, currentLevel);
      } else if (currentMode === 'revision') {
        generatorPromise = getRevisionExercisesServer(lesson.id, language);
      } else {
        generatorPromise = getExercisesServer(lesson.id, currentLevel, language, isPart ? partIndex : null, isPart ? totalParts : null);
      }

      generatorPromise.then(generated => handleExercisesLoaded(generated, currentMode)).catch(e => {
        console.error("Failed to load exercises:", e);
        window.location.reload();
      });
    }
  }, [lesson, router, currentLevel, language, completedLessons, _hasHydrated, lessonId, unlockedLessons, exercisesGeneratedFor]);

  // Preload images and audio in background
  useEffect(() => {
    if (exercises.length > 0) {
      const imageUrls = new Set<string>();
      const audioTexts = new Set<string>();

      exercises.forEach(ex => {
        if (ex.imageUrl) imageUrls.add(ex.imageUrl);
        if (ex.introItem?.imageUrl) imageUrls.add(ex.introItem.imageUrl);
        if (ex.answer && /[\u0E00-\u0E7F]/.test(ex.answer)) audioTexts.add(ex.answer);
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

      setTimeout(() => {
        imageUrls.forEach(url => {
          const img = new window.Image();
          img.src = url;
        });
        if (audioTexts.size > 0) preloadThaiAudio(Array.from(audioTexts));
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
    getExercisesServer(lesson.id, currentLevel, language, isPart ? partIndex : null, isPart ? totalParts : null)
      .then(generated => handleExercisesLoaded(generated))
      .catch(e => {
        console.error("Failed to load exercises:", e);
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

  // Auto-check for free-typing
  useEffect(() => {
    if (currentExercise && currentExercise.type === "free-typing" && !isChecking && typeof selectedAnswer === "string" && !isFinished) {
      const targetLength = currentExercise.answer.replace(/\s+/g, "").length;
      const currentLength = selectedAnswer.replace(/\s+/g, "").length;
      if (currentLength >= targetLength && currentLength > 0) {
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

  const isAnswerComplete = currentExercise
    ? currentExercise.type === "intro" || currentExercise.type === "composition"
      ? true
      : currentExercise.type === "free-typing"
        ? false
        : (currentExercise.type === "writing" ||
          currentExercise.type === "sentence-builder") &&
          currentExercise.correctComponents
          ? Array.isArray(selectedAnswer) &&
          selectedAnswer.length ===
          currentExercise.correctComponents.filter((c) => c !== "w_dots").length
          : selectedAnswer !== null &&
          (!Array.isArray(selectedAnswer) || (selectedAnswer as any[]).length > 0)
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

  return {
    state: {
      lessonId,
      currentLevel,
      isPart,
      partIndex,
      totalParts,
      isDev,
      mode,
      showExerciseUI,
      isDataLoaded,
      showResumePrompt,
      isFinished,
      earnedStars,
      exercises,
      currentExercise,
      currentIndex,
      progress,
      isChecking,
      isCorrect,
      selectedAnswer,
      isExiting,
      showInfoModal,
      showHelpModal,
      dontShowAgain,
      timeLeft,
      initialTime,
      failedDueToTime,
      earnedXp,
      isKeyboardOpen,
      instructionKey,
      instructionText,
      showInstruction,
      isAnswerComplete,
      showFooter,
      elapsedTimeSec,
      language,
      showRomanization,
    },
    actions: {
      setShowExerciseUI,
      setShowInfoModal,
      setShowHelpModal,
      setDontShowAgain,
      setSelectedAnswer,
      handleCheck,
      handleResume,
      handleRestart,
      hideInstruction,
      unhideInstruction,
      setAcknowledgedInstructions,
      setShowRomanization,
      setMistakes,
    }
  };
}
