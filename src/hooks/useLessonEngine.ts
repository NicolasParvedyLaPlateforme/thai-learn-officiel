import { useState, useEffect, useCallback } from 'react';

export interface UseLessonEngineOptions<TExercise> {
  initialExercises: TExercise[];
  initialIndex?: number;
  initialMistakes?: number;
  isExerciseIntroOrReview: (exercise: TExercise) => boolean;
  evaluateAnswer: (exercise: TExercise, answer: any) => boolean;
  onComplete: (mistakes: number) => void;
  onCorrect?: (exercise: TExercise, answer: any) => void;
  onIncorrect?: (exercise: TExercise, answer: any) => void;
  onExerciseChange?: (exercise: TExercise) => void;
  retryIncorrect?: boolean; 
  cloneExerciseForRetry?: (exercise: TExercise) => TExercise; 
  animationDelay?: number;
}

export function useLessonEngine<TExercise, TAnswer = any>({
  initialExercises,
  initialIndex = 0,
  initialMistakes = 0,
  isExerciseIntroOrReview,
  evaluateAnswer,
  onComplete,
  onCorrect,
  onIncorrect,
  onExerciseChange,
  retryIncorrect = true,
  cloneExerciseForRetry,
  animationDelay = 0,
}: UseLessonEngineOptions<TExercise>) {
  const [exercises, setExercises] = useState<TExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<TAnswer | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (initialExercises.length > 0) {
      setExercises(initialExercises);
      setCurrentIndex(initialIndex);
      setIsChecking(false);
      setIsCorrect(null);
      setIsFinished(false);
      setMistakes(initialMistakes);
      setSelectedAnswer(null);
      setIsExiting(false);
    }
  }, [initialExercises, initialIndex, initialMistakes]);

  const currentExercise = exercises.length > 0 && currentIndex < exercises.length ? exercises[currentIndex] : null;
  const progress = exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;

  const performProceed = useCallback((targetLength: number) => {
    setIsExiting(false);
    if (currentIndex < targetLength - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsChecking(false);
      setIsCorrect(null);
      setSelectedAnswer(null);
      if (onExerciseChange) onExerciseChange(exercises[nextIdx]);
    } else {
      setIsFinished(true);
      onComplete(mistakes);
    }
  }, [currentIndex, exercises, mistakes, onComplete, onExerciseChange]);

  const proceedToNext = useCallback((targetLength: number = exercises.length) => {
    if (animationDelay > 0) {
      setIsExiting(true);
      setTimeout(() => performProceed(targetLength), animationDelay);
    } else {
      performProceed(targetLength);
    }
  }, [animationDelay, performProceed, exercises.length]);

  const handleCheck = useCallback((overrideAnswer?: TAnswer) => {
    if (!currentExercise) return;

    if (isExerciseIntroOrReview(currentExercise)) {
      if (onCorrect) onCorrect(currentExercise, null);
      proceedToNext(exercises.length);
      return;
    }

    if (isChecking) {
      if (isCorrect) {
        proceedToNext(exercises.length);
      } else {
        if (retryIncorrect) {
          const retryExercise = cloneExerciseForRetry 
            ? cloneExerciseForRetry(currentExercise)
            : { ...currentExercise, id: (currentExercise as any).id + '-retry-' + Date.now() };
          setExercises(prev => [...prev, retryExercise]);
          proceedToNext(exercises.length + 1);
        } else {
          proceedToNext(exercises.length);
        }
      }
      return;
    }

    const answerToCheck = overrideAnswer !== undefined ? overrideAnswer : selectedAnswer;
    if (answerToCheck === null || answerToCheck === undefined) return;

    const correct = evaluateAnswer(currentExercise, answerToCheck);
    
    setIsCorrect(correct);
    setIsChecking(true);
    
    if (correct) {
      if (onCorrect) onCorrect(currentExercise, answerToCheck);
    } else {
      setMistakes(m => m + 1);
      if (onIncorrect) onIncorrect(currentExercise, answerToCheck);
    }
  }, [
    currentExercise, isChecking, isCorrect, exercises.length, selectedAnswer, 
    isExerciseIntroOrReview, proceedToNext, retryIncorrect, cloneExerciseForRetry, 
    evaluateAnswer, onCorrect, onIncorrect
  ]);

  return {
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
  };
}
