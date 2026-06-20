import { Exercise, Word, Phrase } from "@/types";
import { shuffle } from '../utils';
import { buildWordMatch, buildFillInTheBlank, buildSentenceBuilder } from '../builders';
import { getExerciseTranslation } from '@/lib/translation-utils';

export function generateLevel2(validLessonWords: Word[], lessonPhrases: Phrase[], globalWords: Word[], language: string): Exercise[] {
  let wmExercises: Exercise[] = [];
  
  validLessonWords.forEach(word => {
    const rand = Math.random();
    let mode: 'random' | 'misspelled' | 'reverse' = 'random';
    if (rand < 0.33) mode = 'random';
    else if (rand < 0.66) mode = 'misspelled';
    else mode = 'reverse';
    
    wmExercises.push(buildWordMatch(word, language, {
      distractorMode: mode,
      numDistractors: 3,
      maxMistakes: 2,
      validLessonWords,
      pool: globalWords
    }));
  });

  let fillInBlankPool: Exercise[] = [];
  lessonPhrases.forEach((phrase) => {
    const fibEx = buildFillInTheBlank(phrase, language, {
       numMisspelledDistractors: 1,
       maxMistakes: 2,
       pool: globalWords
    });
    if (fibEx) fillInBlankPool.push(fibEx);
  });

  let sbPool: Exercise[] = [];
  lessonPhrases.forEach(phrase => {
    sbPool.push(buildSentenceBuilder(phrase, language, {
      numDistractors: 0,
      pool: globalWords
    }));
  });

  if (sbPool.length === 0) {
    sbPool = globalWords.slice(0, 2).map((w, i) => ({
      id: `fallback-sb-3-${Date.now()}-${i}`,
      type: 'sentence-builder',
      question: getExerciseTranslation(w, language),
      answer: w.th,
      options: [w],
      correctComponents: [w.th]
    }));
  }

  return [...shuffle(wmExercises), ...shuffle(fillInBlankPool), ...shuffle(sbPool)];
}
