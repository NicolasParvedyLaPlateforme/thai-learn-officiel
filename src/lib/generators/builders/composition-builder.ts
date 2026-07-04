import { Exercise, Word, Phrase } from "@/types";
import { getExerciseTranslation } from '@/lib/translation-utils';

export function buildComposition(item: Word | Phrase, language: string = 'fr'): Exercise {
  return {
    id: `composition-${item.id}-${Math.random()}`,
    type: 'composition',
    question: getExerciseTranslation(item, language),
    answer: item.th,
    options: [],
    introItem: item,
  };
}
