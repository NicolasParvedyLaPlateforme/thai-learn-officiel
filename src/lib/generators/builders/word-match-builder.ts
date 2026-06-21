import { Exercise, Word } from "@/types";
import { getExerciseTranslation } from '@/lib/translation-utils';
import { shuffle, generateMisspelledWords } from '../utils';

export interface WordMatchOptions {
  distractorMode: 'random' | 'misspelled' | 'reverse';
  numDistractors: number;
  maxMistakes?: number;
  hideRomanization?: boolean;
  pool?: Word[];
  validLessonWords?: Word[];
  hideHints?: boolean;
  disableTooltips?: boolean;
}

export function buildWordMatch(
  word: Word, 
  language: string, 
  options: WordMatchOptions
): Exercise {
  const { 
    distractorMode, 
    numDistractors, 
    maxMistakes = 2, 
    hideRomanization = false, 
    pool = [], 
    validLessonWords = [], 
    hideHints = false, 
    disableTooltips = false 
  } = options;
  
  let finalOptions: any[] = [];
  
  if (distractorMode === 'misspelled') {
    const distractors = generateMisspelledWords(word, numDistractors);
    finalOptions = shuffle([word, ...distractors]);
  } else {
    // 'random' or 'reverse'
    let distractors = shuffle(validLessonWords.filter(w => w.id !== word.id)).slice(0, numDistractors);
    if (distractors.length < numDistractors) {
       distractors.push(...shuffle(pool.filter(w => w.id !== word.id && !distractors.find(sw => sw.id === w.id))).slice(0, numDistractors - distractors.length));
    }
    finalOptions = shuffle([word, ...distractors]);
  }

  return {
    id: `wm-${distractorMode}-${word.id}-${Date.now()}-${Math.random()}`,
    type: 'word-match',
    question: distractorMode === 'reverse' ? word.th : getExerciseTranslation(word, language),
    answer: word.th,
    options: finalOptions,
    hideHints,
    disableTooltips,
    imageUrl: word.imageUrl,
    maxMistakes,
    reverse: distractorMode === 'reverse',
    forceHideRomanization: hideRomanization
  };
}
