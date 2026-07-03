import { Exercise, Word, Phrase } from "@/types";
import { shuffle, getRandomDistractorMode } from '../utils';
import { buildWordMatch, buildFillInTheBlank, buildSentenceBuilder, buildOneLetterDifference } from '../builders';
import { getExerciseTranslation } from '@/lib/translation-utils';

export function generateLevel2(validLessonWords: Word[], lessonPhrases: Phrase[], globalWords: Word[], language: string): Exercise[] {
  let wmExercises: Exercise[] = [];
  
  validLessonWords.forEach(word => {
    wmExercises.push(buildWordMatch(word, language, {
      distractorMode: getRandomDistractorMode(),
      numDistractors: 3,
      maxMistakes: 2,
      validLessonWords,
      pool: globalWords
    }));
    
    // Add 3 one-letter-difference steps per word
    const hintTypes: Array<'sound' | 'image' | 'pronunciation'> = ['sound', 'image', 'pronunciation'];
    hintTypes.forEach(hintType => {
      const ex = buildOneLetterDifference(word, language, {
        hintType,
        numDistractors: 3,
        maxMistakes: 2,
        pool: globalWords
      });
      if (ex) wmExercises.push(ex);
    });
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
