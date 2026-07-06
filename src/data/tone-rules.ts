import { ToneRule, ToneClass, ToneResult } from "@/types/alphabet";

export const TONE_RULES: ToneRule[] = [
  // --- MID CLASS CONSONANTS ---
  { consonantClass: 'mid', mark: '่', result: 'low' },
  { consonantClass: 'mid', mark: '้', result: 'falling' },
  { consonantClass: 'mid', mark: '๊', result: 'high' },
  { consonantClass: 'mid', mark: '๋', result: 'rising' },
  
  // --- HIGH CLASS CONSONANTS ---
  { consonantClass: 'high', mark: '่', result: 'low' },
  { consonantClass: 'high', mark: '้', result: 'falling' },
  
  // --- LOW CLASS CONSONANTS ---
  { consonantClass: 'low', mark: '่', result: 'falling' },
  { consonantClass: 'low', mark: '้', result: 'high' },
];

/**
 * Returns the resulting tone based on the consonant class and tone mark.
 */
export const getToneResult = (cClass: ToneClass, mark: string): ToneResult | null => {
  const rule = TONE_RULES.find(r => r.consonantClass === cClass && r.mark === mark);
  return rule ? rule.result : null;
};
