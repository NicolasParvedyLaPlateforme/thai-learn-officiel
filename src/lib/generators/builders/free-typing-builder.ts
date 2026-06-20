import { Exercise, Word, Phrase } from "@/types";
import { getExerciseTranslation } from '@/lib/translation-utils';

export interface FreeTypingOptions {
  hideRomanization?: boolean;
  hideHints?: boolean;
  disableTooltips?: boolean;
}

export function buildFreeTyping(
  item: Word | Phrase,
  language: string,
  options: FreeTypingOptions = {}
): Exercise {
  const { hideRomanization = true, hideHints = true, disableTooltips = false } = options;
  
  return {
    id: `ft-${item.id}-${Date.now()}-${Math.random()}`,
    type: 'free-typing',
    question: getExerciseTranslation(item, language),
    answer: item.th,
    options: [],
    hideHints,
    disableTooltips,
    imageUrl: item.imageUrl,
    forceHideRomanization: hideRomanization
  };
}
