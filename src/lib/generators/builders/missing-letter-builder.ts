import { Exercise, Word } from "@/types";
import { getExerciseTranslation } from '@/lib/translation-utils';
import { THAI_ALPHABET } from "@/data/alphabet-data";
import { shuffle } from '../utils';

export interface MissingLetterOptions {
  numDistractors: number;
  targetType?: 'consonant' | 'vowel';
}

export function buildMissingLetter(
  word: Word,
  language: string,
  options: MissingLetterOptions
): Exercise | null {
  const { numDistractors, targetType = 'consonant' } = options;
  
  const candidates = THAI_ALPHABET.filter(i => i.type === targetType);
  
  const availableInWord = candidates.filter(c => word.th.includes(c.letter));
  
  if (availableInWord.length === 0) return null;
  
  const targetChar = availableInWord[Math.floor(Math.random() * availableInWord.length)];
  
  // Replace the first occurrence with '_'
  const missingIndex = word.th.indexOf(targetChar.letter);
  const missingLetterText = word.th.replace(targetChar.letter, '_');
  
  const aboveVowels = ['ิ', 'ี', 'ึ', 'ื', 'ั', '็', '์', 'ํ', '๋', '้', '๊', '่'];
  const belowVowels = ['ุ', 'ู'];
  let placeholderType: 'normal' | 'above' | 'below' = 'normal';
  if (aboveVowels.includes(targetChar.letter)) {
    placeholderType = 'above';
  } else if (belowVowels.includes(targetChar.letter)) {
    placeholderType = 'below';
  }
  
  let possibleDistractors = candidates.filter(c => c.letter !== targetChar.letter);
  possibleDistractors = shuffle(possibleDistractors).slice(0, numDistractors);
  
  const finalOptions = shuffle([
    { id: targetChar.letter, th: targetChar.letter, fr: '', phonetic: targetChar.pronunciation },
    ...possibleDistractors.map(d => ({ id: d.letter, th: d.letter, fr: '', phonetic: d.pronunciation }))
  ]);

  return {
    id: `missing-letter-${word.id}-${Date.now()}-${Math.random()}`,
    type: 'missing-letter',
    question: getExerciseTranslation(word, language),
    answer: targetChar.letter, // The answer is the letter itself! (for auto-checking)
    options: finalOptions,
    missingLetterText,
    originalWord: word.th,
    missingIndex,
    placeholderType,
    targetLetter: targetChar.letter,
    targetLetterPhonetic: targetChar.pronunciation,
    showPhoneticHint: true,
    imageUrl: word.imageUrl,
    maxMistakes: 1
  };
}
