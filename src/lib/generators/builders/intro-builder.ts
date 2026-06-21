import { Exercise, Word, Phrase } from "@/types";
import { getExerciseTranslation } from '@/lib/translation-utils';

export function buildIntro(item: Word | Phrase, language: string = 'fr'): Exercise {
  return {
    id: `intro-${item.id}-${Math.random()}`,
    type: 'intro',
    question: getExerciseTranslation(item, language),
    answer: item.th,
    options: [],
    introItem: item,
    hideHints: false
  };
}
