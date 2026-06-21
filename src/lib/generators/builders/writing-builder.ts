import { Exercise, Word, Phrase } from "@/types";
import { getExerciseTranslation } from '@/lib/translation-utils';
import { shuffle, getWritingClustersAndGroups } from '../utils';

export interface WritingOptions {
  blindMode?: boolean;
  hideRomanization?: boolean;
  hideHints?: boolean;
  disableTooltips?: boolean;
}

export function buildWriting(
  item: Word | Phrase,
  language: string,
  options: WritingOptions
): Exercise {
  const { blindMode = false, hideRomanization = false, hideHints = true, disableTooltips = false } = options;
  
  const { characters, groups } = getWritingClustersAndGroups(item.th.replace(/\s+/g, ''));
  
  return {
    id: `wr-${item.id}-${Date.now()}-${Math.random()}`,
    type: 'writing',
    question: getExerciseTranslation(item, language),
    answer: item.th,
    options: shuffle(characters.map((c, i) => ({ id: `c-${i}`, th: c, fr: '', phonetic: '' }))),
    correctComponents: characters,
    componentGroups: groups,
    hideHints,
    disableTooltips,
    blindMode,
    imageUrl: item.imageUrl,
    forceHideRomanization: hideRomanization
  };
}
