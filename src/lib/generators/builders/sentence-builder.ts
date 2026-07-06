import { Exercise, Word, Phrase } from "@/types";
import { getExerciseTranslation } from '@/lib/translation-utils';
import { shuffle, generateMisspelledWords } from '../utils';

export interface SentenceBuilderOptions {
  numDistractors?: number;
  pool?: Word[];
  hideRomanization?: boolean;
  hideHints?: boolean;
  disableTooltips?: boolean;
}

export function buildSentenceBuilder(
  phrase: Phrase,
  language: string,
  options: SentenceBuilderOptions
): Exercise {
  const { numDistractors = 0, pool = [], hideRomanization = false, hideHints = false, disableTooltips = false } = options;
  
  const phraseWords = phrase.components.map(id => pool.find(w => w.id === id)).filter(Boolean) as Word[];
  const distractors = shuffle(pool.filter(w => !phrase.components.includes(w.id))).slice(0, numDistractors);
  
  return {
    id: `sb-${phrase.id}-${Date.now()}-${Math.random()}`,
    type: 'sentence-builder',
    question: getExerciseTranslation(phrase, language),
    answer: phrase.th,
    options: shuffle([...phraseWords, ...distractors]),
    correctComponents: phrase.components,
    hideHints,
    disableTooltips,
    imageUrl: phrase.imageUrl,
    forceHideRomanization: hideRomanization
  };
}

export interface FillInBlankOptions {
  numMisspelledDistractors?: number;
  maxMistakes?: number;
  hideRomanization?: boolean;
  hideHints?: boolean;
  disableTooltips?: boolean;
  pool?: Word[];
  mode?: 'classic' | 'translation' | 'audio';
}

export function buildFillInTheBlank(
  phrase: Phrase,
  language: string,
  options: FillInBlankOptions
): Exercise | null {
  const { numMisspelledDistractors = 1, maxMistakes = 2, hideRomanization = false, hideHints = false, disableTooltips = false, pool = [], mode = 'classic' } = options;
  
  if (!phrase.components || phrase.components.length <= 1) return null;
  const validIndices = phrase.components.map((c, i) => c !== 'w_dots' ? i : -1).filter(i => i !== -1);
  if (validIndices.length === 0) return null;
  
  const blankIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
  const blankWordId = phrase.components[blankIndex];
  
  const blankWord = pool.find(w => w.id === blankWordId) || {id: blankWordId, th: blankWordId, fr: '', en: '', phonetic: ''};
  
  let optionsList: any[] = [];
  if (mode === 'classic') {
    const misspelledOptions = generateMisspelledWords(blankWord as any, numMisspelledDistractors);
    optionsList = [blankWord, ...misspelledOptions];
  } else {
    const validDistractors = pool.filter(w => w.id !== blankWordId);
    const shuffledDistractors = shuffle(validDistractors).slice(0, numMisspelledDistractors);
    optionsList = [blankWord, ...shuffledDistractors];
  }
  
  const prefilledComponents = phrase.components.map((id, i) => {
      if (i === blankIndex) return '';
      if (id === 'w_dots') return '...';
      const w = pool.find(w => w.id === id);
      return w ? w.th : id;
  });
  
  const missingWordFr = getExerciseTranslation(blankWord, language);
  const blankHint = language === 'en' ? `(Missing: ${missingWordFr})` : `(Mot manquant : ${missingWordFr})`;

  return {
    id: `fib-${phrase.id}-${Date.now()}-${Math.random()}`,
    type: 'sentence-builder',
    question: getExerciseTranslation(phrase, language),
    answer: phrase.th,
    options: shuffle(optionsList) as any,
    correctComponents: phrase.components,
    prefilledComponents,
    isFillInBlank: true,
    fillInBlankMode: mode,
    blankIndex,
    blankHint,
    hideHints,
    disableTooltips,
    maxMistakes,
    imageUrl: phrase.imageUrl,
    forceHideRomanization: hideRomanization
  };
}
