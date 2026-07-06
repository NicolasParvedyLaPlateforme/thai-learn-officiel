import { Exercise, Word, Phrase } from "@/types";
import { shuffle } from '../utils';
import { getTranslation } from '@/hooks/useTranslation';

export interface PairMatchingOptions {
  mode: 'normal' | 'audio-only' | 'script-only';
  hideRomanization?: boolean;
  pool: (Word | Phrase)[];
  language: string;
}

export function buildPairMatching(
  options: PairMatchingOptions
): Exercise {
  const { mode, hideRomanization = false, pool, language } = options;
  
  const pairs = shuffle(pool).slice(0, 4);
  
  return {
    id: `pm-${mode}-${Date.now()}-${Math.random()}`,
    type: 'pair-matching',
    question: getTranslation('exercise.match_pairs', language),
    answer: '',
    options: pairs as any,
    pairs: pairs as any,
    hideHints: true,
    pairMatchMode: mode,
    forceHideRomanization: hideRomanization
  };
}
