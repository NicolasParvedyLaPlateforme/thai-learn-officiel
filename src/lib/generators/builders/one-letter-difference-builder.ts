import { Exercise, Word, Phrase } from "@/types";
import { getExerciseTranslation } from '@/lib/translation-utils';
import { shuffle, generateMisspelledWords } from '../utils';

export interface OneLetterDifferenceOptions {
  hintType: 'sound' | 'image' | 'pronunciation';
  numDistractors: number;
  maxMistakes?: number;
  pool?: Word[]; 
}

export function buildOneLetterDifference(
  item: Word | Phrase, 
  language: string, 
  options: OneLetterDifferenceOptions
): Exercise | null {
  const { 
    hintType, 
    numDistractors, 
    maxMistakes = 2
  } = options;
  
  if ('components' in item) {
    return null; // Not supporting phrases yet
  }

  const word = item as Word;
  const distractors = generateMisspelledWords(word, numDistractors);
  const finalOptions = shuffle([word, ...distractors]);

  return {
    id: `1ld-${hintType}-${word.id}-${Date.now()}-${Math.random()}`,
    type: 'one-letter-difference',
    question: getExerciseTranslation(word, language),
    answer: word.th,
    options: finalOptions,
    maxMistakes,
    oneLetterHintType: hintType,
    diffReveal: true
  };
}
