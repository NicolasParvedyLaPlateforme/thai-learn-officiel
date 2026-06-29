import { Exercise, Word } from "@/types";
import { buildIntro, buildWordMatch, buildMissingLetter, buildSoundToLetter, buildTrueFalseSpelling } from '../builders';
import { shuffle } from '../utils';

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
    
    let pool: Exercise[] = [];
    
    const missingLetterEx = buildMissingLetter(word, language, { numDistractors: 1, targetType: 'consonant' });
    if (missingLetterEx) pool.push(missingLetterEx);
    
    const missingLetterVowelEx = buildMissingLetter(word, language, { numDistractors: 1, targetType: 'vowel' });
    if (missingLetterVowelEx) pool.push(missingLetterVowelEx);
    
    const soundToLetterVowelEx = buildSoundToLetter(word, language, { numDistractors: 1, targetType: 'vowel' });
    if (soundToLetterVowelEx) pool.push(soundToLetterVowelEx);
    
    const soundToLetterConsonantEx = buildSoundToLetter(word, language, { numDistractors: 1, targetType: 'consonant' });
    if (soundToLetterConsonantEx) pool.push(soundToLetterConsonantEx);
    
    pool.push(buildWordMatch(word, language, {
      distractorMode: 'random',
      numDistractors: 3,
      maxMistakes: 2,
      validLessonWords,
      pool: globalWords
    }));
    
    pool.push(buildWordMatch(word, language, {
      distractorMode: 'misspelled',
      numDistractors: 3,
      maxMistakes: 2,
      validLessonWords,
      pool: globalWords
    }));

    // Add True/False exercises (choose 1 randomly)
    const tfModes = ['random-replace', 'misplaced-consonant', 'misplaced-vowel', 'similar-consonant', 'similar-vowel'] as const;
    const selectedTfMode = tfModes[Math.floor(Math.random() * tfModes.length)];
    pool.push(buildTrueFalseSpelling(word, language, { mode: selectedTfMode }));
    
    // Shuffle pool and take 4
    pool = shuffle(pool);
    exercises.push(...pool.slice(0, 4));
  });
  
  return exercises;
}
