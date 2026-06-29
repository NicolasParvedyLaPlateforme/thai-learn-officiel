import { Exercise, Word } from "@/types";
import { buildIntro, buildWordMatch, buildMissingLetter, buildSoundToLetter } from '../builders';

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
    
    const missingLetterEx = buildMissingLetter(word, language, { numDistractors: 1, targetType: 'consonant' });
    if (missingLetterEx) {
      exercises.push(missingLetterEx);
    }
    
    const missingLetterVowelEx = buildMissingLetter(word, language, { numDistractors: 1, targetType: 'vowel' });
    if (missingLetterVowelEx) {
      exercises.push(missingLetterVowelEx);
    }
    
    const soundToLetterVowelEx = buildSoundToLetter(word, language, { numDistractors: 1, targetType: 'vowel' });
    if (soundToLetterVowelEx) {
      exercises.push(soundToLetterVowelEx);
    }
    
    const soundToLetterConsonantEx = buildSoundToLetter(word, language, { numDistractors: 1, targetType: 'consonant' });
    if (soundToLetterConsonantEx) {
      exercises.push(soundToLetterConsonantEx);
    }
    
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
