import { Exercise, Word, Phrase } from "@/types";
import { shuffle } from '../utils';
import { buildWordMatch, buildFillInTheBlank } from '../builders';

export function generateLevel1(validLessonWords: Word[], lessonPhrases: Phrase[], globalWords: Word[], language: string): Exercise[] {
  let wmExercises: Exercise[] = [];
  
  validLessonWords.forEach(word => {
    for (let i = 0; i < 2; i++) {
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
    }
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

  return [...shuffle(wmExercises), ...shuffle(fillInBlankPool)];
}
