import { Exercise, Word } from "@/types";
import { buildIntro, buildWordMatch } from '../builders';

export function generateLevel0(validLessonWords: Word[], globalWords: Word[], language: string): Exercise[] {
  let exercises: Exercise[] = [];
  
  validLessonWords.forEach(word => {
    exercises.push(buildIntro(word, language));
    
    exercises.push(buildWordMatch(word, language, {
      distractorMode: 'random',
      numDistractors: 1,
      maxMistakes: 1,
      validLessonWords,
      pool: globalWords
    }));
    
    exercises.push(buildWordMatch(word, language, {
      distractorMode: 'random',
      numDistractors: 3,
      maxMistakes: 2,
      validLessonWords,
      pool: globalWords
    }));
    
    exercises.push(buildWordMatch(word, language, {
      distractorMode: 'misspelled',
      numDistractors: 3,
      maxMistakes: 2,
      validLessonWords,
      pool: globalWords
    }));
  });
  
  return exercises;
}
