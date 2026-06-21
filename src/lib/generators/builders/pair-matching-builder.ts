import { Exercise, Word, Phrase } from "@/types";
import { shuffle } from '../utils';

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
    question: (language === 'en' ? 'Match the pairs' : language === 'fr' ? 'Reliez les paires correspondantes' : 'Match the pairs'),
    answer: '',
    options: pairs as any,
    pairs: pairs as any,
    hideHints: true,
    pairMatchMode: mode,
    forceHideRomanization: hideRomanization
  };
}
