import { Exercise, Word, Phrase } from "@/types";
import { shuffle, getRandomDistractorMode } from '../utils';
import { 
  buildWordMatch, 
  buildFillInTheBlank, 
  buildOneLetterDifference, 
  buildWordPosition, 
  buildPhraseOrder,
  buildMissingLetter,
  buildSoundToLetter,
  buildTrueFalseSpelling
} from '../builders';

export function generateLevel1(validLessonWords: Word[], lessonPhrases: Phrase[], globalWords: Word[], language: string): Exercise[] {
  let wmExercises: Exercise[] = [];
  
  validLessonWords.forEach(word => {
    let pool: Exercise[] = [];

    const missingLetterEx = buildMissingLetter(word, language, { numDistractors: 1, targetType: 'consonant' });
    if (missingLetterEx) pool.push(missingLetterEx);
    
    const missingLetterVowelEx = buildMissingLetter(word, language, { numDistractors: 1, targetType: 'vowel' });
    if (missingLetterVowelEx) pool.push(missingLetterVowelEx);
    
    const soundToLetterVowelEx = buildSoundToLetter(word, language, { numDistractors: 1, targetType: 'vowel' });
    if (soundToLetterVowelEx) pool.push(soundToLetterVowelEx);
    
    const soundToLetterConsonantEx = buildSoundToLetter(word, language, { numDistractors: 1, targetType: 'consonant' });
    if (soundToLetterConsonantEx) pool.push(soundToLetterConsonantEx);
    
    const tfModes = ['random-replace', 'misplaced-consonant', 'misplaced-vowel', 'similar-consonant', 'similar-vowel'] as const;
    const selectedTfMode = tfModes[Math.floor(Math.random() * tfModes.length)];
    pool.push(buildTrueFalseSpelling(word, language, { mode: selectedTfMode }));

    for (let i = 0; i < 2; i++) {
      pool.push(buildWordMatch(word, language, {
        distractorMode: getRandomDistractorMode(),
        numDistractors: 3,
        maxMistakes: 2,
        validLessonWords,
        pool: globalWords
      }));
    }
    
    const hintTypes: Array<'sound' | 'image' | 'pronunciation'> = ['sound', 'image', 'pronunciation'];
    hintTypes.forEach(hintType => {
      const ex = buildOneLetterDifference(word, language, {
        hintType,
        numDistractors: 3,
        maxMistakes: 2,
        pool: globalWords
      });
      if (ex) pool.push(ex);
    });

    pool = shuffle(pool);
    wmExercises.push(...pool.slice(0, 2));
  });

  let fillInBlankPool: Exercise[] = [];
  let wordPositionPool: Exercise[] = [];
  let phraseOrderPool: Exercise[] = [];
  
  lessonPhrases.forEach((phrase) => {
    const fibEx = buildFillInTheBlank(phrase, language, {
       numMisspelledDistractors: 1,
       maxMistakes: 2,
       pool: globalWords
    });
    if (fibEx) fillInBlankPool.push(fibEx);

    const wpEx = buildWordPosition(phrase, language, {
      pool: globalWords
    });
    if (wpEx) wordPositionPool.push(wpEx);

    const poEx = buildPhraseOrder(phrase, language, {
      pool: globalWords
    });
    if (poEx) phraseOrderPool.push(poEx);
  });

  return [...shuffle(wmExercises), ...shuffle(fillInBlankPool), ...shuffle(wordPositionPool), ...shuffle(phraseOrderPool)];
}
