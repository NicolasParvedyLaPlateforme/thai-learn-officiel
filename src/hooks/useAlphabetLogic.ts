import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useProgressStore } from "@/lib/store";
import { getAlphabetLessons } from "@/lib/alphabet-utils";
import { AlphabetItem, AlphabetExercise } from "@/types";
import { getAlphabetExercisesServer } from "@/actions/course";
import { playThaiTTS, preloadThaiVoices } from "@/lib/tts";
import { triggerConfetti } from "@/lib/confetti";
import { useLessonEngine } from '@/hooks/useLessonEngine';

export function useAlphabetLogic() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    completeLesson,
    lessonLevels,
    language,
    seenAlphabets,
    markAlphabetSeen,
    completedLessons,
    unlockedLessons,
    _hasHydrated,
    setLastPlayedLesson
  } = useProgressStore(
    useShallow(state => ({
      completeLesson: state.completeLesson,
      lessonLevels: state.lessonLevels,
      language: state.language,
      seenAlphabets: state.seenAlphabets,
      markAlphabetSeen: state.markAlphabetSeen,
      completedLessons: state.completedLessons,
      unlockedLessons: state.unlockedLessons,
      _hasHydrated: state._hasHydrated,
      setLastPlayedLesson: state.setLastPlayedLesson
    }))
  );

  const lessonId = params.id as string;
  const requestedLevelStr = searchParams.get('level');
  const isDev = searchParams.has('dev');

  const { consonants, vowels } = getAlphabetLessons();
  const allLessons = [...consonants, ...vowels];
  const lesson = allLessons.find(l => l.id === lessonId);
  const savedLevel = lesson ? (lessonLevels[lesson.id] || 0) : 0;

  const [exercisesGeneratedFor, setExercisesGeneratedFor] = useState<{ id: string, level: number } | null>(null);

  const currentLevel = requestedLevelStr ? (isDev ? Math.max(0, parseInt(requestedLevelStr, 10) - 1) : Math.min(savedLevel, Math.max(0, parseInt(requestedLevelStr, 10) - 1))) : (exercisesGeneratedFor?.level !== undefined ? exercisesGeneratedFor.level : savedLevel);

  const [initialExercises, setInitialExercises] = useState<AlphabetExercise[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showExerciseUI, setShowExerciseUI] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTimeSec, setElapsedTimeSec] = useState<number | undefined>(undefined);

  const {
    exercises,
    currentExercise,
    currentIndex,
    progress,
    isChecking,
    isCorrect,
    isFinished,
    mistakes,
    selectedAnswer: selectedOption,
    setSelectedAnswer: setSelectedOption,
    handleCheck,
  } = useLessonEngine<AlphabetExercise, AlphabetItem>({
    initialExercises,
    isExerciseIntroOrReview: (ex) => ex.type === 'intro' || ex.type === 'review',
    evaluateAnswer: (ex, ans) => ans?.letter === ex.letterToPick,
    onComplete: (totalMistakes) => {
      if (lesson) {
        const expected = useProgressStore.getState().getExpectedXp(lesson.id, currentLevel, false);
        setEarnedXp(expected.xp);
        const earnedStarsLocal = Math.max(0, 5 - totalMistakes);
        completeLesson(lesson.id, 0, currentLevel, earnedStarsLocal, false);
      }
      triggerConfetti();
    },
    onCorrect: (ex) => {
      if (ex.type === 'intro' && !seenAlphabets.includes(ex.item.letter)) {
        markAlphabetSeen(ex.item.letter);
      } else if (ex.type !== 'intro') {
        if (ex.type === 'phonetic-match' || ex.type === 'audio-match') {
          playThaiTTS(ex.item.exampleWord);
        } else {
          playThaiTTS(ex.targetText);
        }
      }
    },
    onIncorrect: () => {
      if (lesson) setLastPlayedLesson(lesson.id, "alphabet");
    },
    onExerciseChange: () => {
      setShowHint(false);
    }
  });

  const earnedStars = Math.max(0, 5 - mistakes);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (exercises.length > 0 && exercises[currentIndex]) {
      const ex = exercises[currentIndex];
      if (ex.type === 'audio-match') {
        const t = setTimeout(() => {
          playThaiTTS(ex.item.exampleWord);
        }, 300);
        return () => clearTimeout(t);
      }
    }
  }, [currentIndex, exercises]);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!lesson) {
      router.push('/alphabet');
      return;
    }

    if (!exercisesGeneratedFor || exercisesGeneratedFor.id !== lesson.id || exercisesGeneratedFor.level !== currentLevel) {
      preloadThaiVoices();
      const isRevision = searchParams.get('mode') === 'revision';

      if (isRevision) {
        import("@/actions/course").then(({ getAlphabetRevisionExercisesServer }) => {
          getAlphabetRevisionExercisesServer(lesson.id, language).then(generated => {
            const finalEx = generated.slice(0, 8);
            setInitialExercises(finalEx as unknown as AlphabetExercise[]);
            setStartTime(Date.now());
            setExercisesGeneratedFor({ id: lesson.id, level: currentLevel });
          });
        });
      } else {
        getAlphabetExercisesServer(lesson.id, currentLevel, language).then(generated => {
          const mode = searchParams.get('mode');
          let finalEx = generated;
          if (mode === 'training') {
            finalEx = generated.slice(0, 8);
          }
          setInitialExercises(finalEx as unknown as AlphabetExercise[]);
          setStartTime(Date.now());
          setExercisesGeneratedFor({ id: lesson.id, level: currentLevel });
        });
      }
    }
  }, [lesson, router, currentLevel, language, completedLessons, _hasHydrated, lessonId, unlockedLessons, exercisesGeneratedFor, searchParams]);

  useEffect(() => {
    if (searchParams.get("dev") === "validate" && exercises.length > 0 && !isFinished) {
      if (lesson) {
        const expected = useProgressStore.getState().getExpectedXp(lesson.id, currentLevel, false);
        setEarnedXp(expected.xp);
        completeLesson(lesson.id, 0, currentLevel, 3, false);
      }
      triggerConfetti();
    }
  }, [searchParams, exercises.length, isFinished, lesson?.id, currentLevel, completeLesson]);

  useEffect(() => {
    if (isFinished && startTime && elapsedTimeSec === undefined) {
      setElapsedTimeSec(Math.floor((Date.now() - startTime) / 1000));
    }
  }, [isFinished, startTime, elapsedTimeSec]);

  const isDataLoaded = isClient && _hasHydrated && !!lesson && exercises.length > 0;

  const showFooter = isChecking || (currentExercise && (currentExercise.type === 'intro' || currentExercise.type === 'review')) || selectedOption !== null;

  return {
    state: {
      lesson,
      consonants,
      vowels,
      currentLevel,
      exercises,
      currentExercise,
      currentIndex,
      progress,
      isChecking,
      isCorrect,
      isFinished,
      selectedOption,
      earnedStars,
      earnedXp,
      elapsedTimeSec,
      isDataLoaded,
      showExerciseUI,
      showHint,
      showFooter,
      language,
      searchParams
    },
    actions: {
      setShowExerciseUI,
      setShowHint,
      setSelectedOption,
      handleCheck
    }
  };
}
