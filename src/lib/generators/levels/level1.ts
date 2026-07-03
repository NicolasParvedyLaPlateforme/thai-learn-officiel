import { Exercise, Word, Phrase } from "@/types";
import { shuffle, getRandomDistractorMode } from '../utils';
import { buildWordMatch, buildFillInTheBlank, buildOneLetterDifference } from '../builders';

export function generateLevel1(validLessonWords: Word[], lessonPhrases: Phrase[], globalWords: Word[], language: string): Exercise[] {
  let wmExercises: Exercise[] = [];
  
  validLessonWords.forEach(word => {
    for (let i = 0; i < 2; i++) {
      wmExercises.push(buildWordMatch(word, language, {
        distractorMode: getRandomDistractorMode(),
        numDistractors: 3,
        maxMistakes: 2,
        validLessonWords,
        pool: globalWords
      }));
    }
    
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

  return [...shuffle(wmExercises), ...shuffle(fillInBlankPool)];
}
