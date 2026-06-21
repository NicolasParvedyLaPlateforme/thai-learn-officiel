import { Exercise, Phrase } from "@/types";
import { getExerciseTranslation } from '@/lib/translation-utils';
import { shuffle } from '../utils';

export interface PhraseMatchOptions {
  maxMistakes?: number;
  hideRomanization?: boolean;
  hideHints?: boolean;
  disableTooltips?: boolean;
  allPhrases?: Phrase[];
}

export function buildPhraseMatch(
  phrase: Phrase,
  language: string,
  options: PhraseMatchOptions
): Exercise {
  const { maxMistakes = 1, hideRomanization = false, hideHints = false, disableTooltips = false, allPhrases = [] } = options;
  
  const similar = allPhrases.filter(p => p.id !== phrase.id && p.components.some(c => phrase.components.includes(c)));
  const distractorPhrase = similar.length > 0 ? shuffle(similar)[0] : (shuffle(allPhrases.filter(p => p.id !== phrase.id))[0] || phrase);
  
  return {
    id: `pmatch-${phrase.id}-${Date.now()}-${Math.random()}`,
    type: 'word-match',
    question: getExerciseTranslation(phrase, language),
    answer: phrase.th,
    options: shuffle([
      { id: phrase.id, th: phrase.th, fr: phrase.fr, phonetic: phrase.phonetic },
      { id: distractorPhrase.id, th: distractorPhrase.th, fr: distractorPhrase.fr, phonetic: distractorPhrase.phonetic }
    ]) as any,
    hideHints,
    disableTooltips,
    maxMistakes,
    imageUrl: phrase.imageUrl,
    forceHideRomanization: hideRomanization
  };
}
