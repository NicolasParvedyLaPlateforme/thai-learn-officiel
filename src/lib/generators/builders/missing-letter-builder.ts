import { Exercise, Word } from "@/types";
import { getExerciseTranslation } from '@/lib/translation-utils';
import { THAI_ALPHABET } from "@/data/alphabet-data";
import { shuffle } from '../utils';

export interface MissingLetterOptions {
  numDistractors: number;
}

export function buildMissingLetter(
  word: Word,
  language: string,
  options: MissingLetterOptions
): Exercise | null {
  const { numDistractors } = options;
  
  const consonants = THAI_ALPHABET.filter(i => i.type === 'consonant');
  
  const availableConsonantsInWord = consonants.filter(c => word.th.includes(c.letter));
  
  if (availableConsonantsInWord.length === 0) return null;
  
  const targetConsonant = availableConsonantsInWord[Math.floor(Math.random() * availableConsonantsInWord.length)];
  
  // Replace the first occurrence of the consonant with '_'
  const missingLetterText = word.th.replace(targetConsonant.letter, '_');
  
  let possibleDistractors = consonants.filter(c => c.letter !== targetConsonant.letter);
  possibleDistractors = shuffle(possibleDistractors).slice(0, numDistractors);
  
  const finalOptions = shuffle([
    { id: targetConsonant.letter, th: targetConsonant.letter, fr: '', phonetic: targetConsonant.pronunciation },
    ...possibleDistractors.map(d => ({ id: d.letter, th: d.letter, fr: '', phonetic: d.pronunciation }))
  ]);

  return {
    id: `missing-letter-${word.id}-${Date.now()}-${Math.random()}`,
    type: 'missing-letter',
    question: getExerciseTranslation(word, language),
    answer: targetConsonant.letter, // The answer is the letter itself! (for auto-checking)
    options: finalOptions,
    missingLetterText,
    targetLetter: targetConsonant.letter,
    targetLetterPhonetic: targetConsonant.pronunciation,
    showPhoneticHint: true,
    imageUrl: word.imageUrl,
    maxMistakes: 1
  };
}
